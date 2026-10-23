import SceneLabel from "./SceneLabel";
import {frameElapsed} from "./playback";
import {useEffect, useMemo, useState} from 'react';
import {Canvas, useThree} from '@react-three/fiber';
import { Line, OrbitControls} from '@react-three/drei';
import {Vector3} from 'three';
import PlaybackDuration from './PlaybackDuration';
import {electricResponse, ringPoint, ringTangent, type Vec3} from './electric';
const colors = {E:'#ffbb8e', J:'#78e2cc', electron:'#c3a1ff', B:'#80baff'};
function Arrow({p, d, color, length=.55}: {p:Vec3; d:Vec3; color:string; length?:number}) {
  return <arrowHelper args={[new Vector3(...d).normalize(),new Vector3(...p),length,color,.18,.09]} />;
}
function Ring({radius, z, color, direction}: {radius:number; z:number; color:string; direction:number}) {
  const points=useMemo(()=>Array.from({length:161},(_,i)=>ringPoint(i/160*Math.PI*2,radius,z)),[radius,z]);
  return <><Line points={points} color={color} lineWidth={1.5} transparent opacity={.8}/>{direction!==0 && Array.from({length:8},(_,i)=><Arrow key={i} p={ringPoint(i*Math.PI/4,radius,z)} d={ringTangent(i*Math.PI/4,direction)} color={color}/>)}</>;
}
function Camera({top}: {top:boolean}) {
  const {camera}=useThree();
  useEffect(()=>{camera.up.set(0,0,1); camera.position.set(...(top?[0,-.01,12]:[8,-10,8]) as Vec3);camera.lookAt(0,0,0);camera.updateProjectionMatrix();},[camera,top]);
  return null;
}
function ElectricScene({radial, rate, er, b, seconds, layers}: {radial:boolean;rate:number;er:number;b:number;seconds:number;layers:boolean[]}) {
  const field=electricResponse(rate,3,er,b), sign=Math.sign(field.toroidalE);
  const winding=useMemo(()=>Array.from({length:501},(_,i):Vec3=>{const a=i/500*Math.PI*24;return [.7*Math.cos(a),.7*Math.sin(a),-1.5+i/500*3];}),[]);
  return <>
    <ambientLight intensity={1.6}/><directionalLight position={[3,-4,8]} intensity={3}/><directionalLight position={[-5,4,2]} color="#b2c2ff" intensity={2}/>
    {layers[0] && <mesh><torusGeometry args={[3,.53,32,128]}/><meshStandardMaterial color="#8fa5cd" metalness={.48} roughness={.28} transparent opacity={.27} depthWrite={false}/></mesh>}
    {!radial && layers[4] && <><Line points={winding} color="#e0c5b3" lineWidth={5}/>{[0,2,4].map(i=><Arrow key={i} p={[.7*Math.cos(i),.7*Math.sin(i),-1.5+(Math.PI*8+i)/(24*Math.PI)*3]} d={[-Math.sin(i),Math.cos(i),.06]} color="#e0c5b3" length={.4}/>)}<SceneLabel position={[0,0,1.9]} center className="confinement-label">中央螺线管 · 磁通正在{rate>0?'增大':rate<0?'减小':'保持不变'}</SceneLabel><Arrow p={[0,0,-1]} d={[0,0,1]} color={colors.B} length={2}/><SceneLabel position={[0,0,-1.9]} center className="confinement-label">线圈电流绕柱 → 轴向磁通 +Z</SceneLabel></>}
    {layers[3] && <Ring radius={2.7} z={.12} color={colors.B} direction={Math.sign(b)}/>}
    {layers[1] && (!radial?<Ring radius={3.32} z={.12} color={colors.E} direction={sign}/>:Array.from({length:8},(_,i)=>{const a=i*Math.PI/4;return er!==0?<Arrow key={i} p={ringPoint(a,3,0)} d={[Math.cos(a)*Math.sign(er),Math.sin(a)*Math.sign(er),0]} color={colors.E} length={.7}/>:null;}))}
    {!radial && layers[2] && <Ring radius={3} z={.22} color={colors.J} direction={sign}/>}
    {!radial && layers[5] && Array.from({length:12},(_,i)=>{
      const a=i*Math.PI/6 + seconds*field.electronDirection*Math.abs(field.loopVoltage)/8;
      return <mesh key={i} position={ringPoint(a,3,.27)}><sphereGeometry args={[.065,12,12]}/><meshBasicMaterial color={colors.electron}/></mesh>;
    })}
    {radial && layers[5] && [-.09,.09].map((offset,k)=>{
      const z= Math.sign(field.driftZ)*seconds*Math.abs(field.driftZ)/1800;
      return <group key={k}><mesh position={[3+offset,0,z]}><sphereGeometry args={[.08,16,16]}/><meshBasicMaterial color={k?colors.electron:colors.J}/></mesh>{field.driftZ!==0 && <Arrow p={[3+offset,0,z]} d={[0,0,Math.sign(field.driftZ)]} color={k?colors.electron:colors.J}/>}</group>;
    })}
    <Arrow p={[-4,-2,-1]} d={[0,0,1]} color="#d4dfef" length={1}/><SceneLabel position={[-4,-2,.2]} center className="confinement-label">+Z 向上</SceneLabel>
    <OrbitControls makeDefault minDistance={6} maxDistance={60}/>
  </>;
}
export default function ElectricLesson() {
  const [radial,setRadial]=useState(false),[rate,setRate]=useState(-6),[er,setEr]=useState(800),[b,setB]=useState(2);
  const [seconds,setSeconds]=useState(0),[duration,setDuration]=useState(12),[playing,setPlaying]=useState(true),[reset,setReset]=useState(0),[top,setTop]=useState(false);
  const [layers,setLayers]=useState([true,true,true,false,true,true]);
  useEffect(()=>{if(!playing)return;let frame=0,last=performance.now();const tick=(now:number)=>{const dt=frameElapsed(now,last);last=now;setSeconds(t=>Math.min(duration,t+dt));frame=requestAnimationFrame(tick);};frame=requestAnimationFrame(tick);return()=>cancelAnimationFrame(frame);},[playing,duration]);
  useEffect(()=>{if(seconds>=duration)setPlaying(false);},[seconds,duration]);
  const f=electricResponse(rate,3,er,b), direction=f.toroidalE>0?'从上方看逆时针':f.toroidalE<0?'从上方看顺时针':'没有感应电场';
  const restart=()=>{setSeconds(0);setPlaying(true);};
  return <>
    <div className="lab-heading"><div><p className="eyebrow">进阶探索 01 · FIELDS & CURRENT</p><h1>电场指哪儿，电流就往哪儿流吗？</h1><p>电场是推动电荷的场；电流是电荷的净流动。先把电场、电流、电子和磁场分开看。</p></div></div>
    <div className="confinement-layout electric-layout">
      <section className="lab-card confinement-visual">
        <div className="confinement-drive"><button className={!radial?'active':''} onClick={()=>{setRadial(false);restart();}}>① 环向电场 · 驱动电流</button><button className={radial?'active':''} onClick={()=>{setRadial(true);restart();}}>② 径向电场 · 共同漂移</button></div>
        <div className="confinement-toolbar"><button onClick={()=>{setTop(!top);setReset(n=>n+1);}}>{top?'立体视角':'俯视看顺逆时针'}</button><button onClick={()=>{setTop(false);setReset(n=>n+1);}}>复位视角</button><span>拖动旋转 · 滚轮缩放</span></div>
        <div className="confinement-canvas electric-canvas" role="img" aria-label="电场、电流与电子方向三维演示">
          <Canvas key={reset} camera={{position:[8,-10,8],fov:42}} dpr={[1,1.5]}><color attach="background" args={['#080f1c']}/><Camera top={top}/><ElectricScene {...{radial,rate,er,b,seconds,layers}}/></Canvas>
        </div>
        <div className="confinement-legend"><span style={{color:colors.E}}>→ 电场 E</span><span style={{color:colors.J}}>→ 传统电流 J / 正离子</span><span style={{color:colors.electron}}>● 电子平均运动</span><span style={{color:colors.B}}>→ 磁场 B</span></div>
        <p className="electric-caption">{radial?'径向 E + 环向 B → 竖直 E×B 漂移；两种电荷同向。':'箭头沿环向闭合，电子亮点反向移动。为方便辨认，E、J、B 的示意线略微错开。'}</p>
        <div className="confinement-playback"><button onClick={()=>{if(seconds>=duration)setSeconds(0);setPlaying(!playing);}}>{playing?'暂停':'播放'}</button><button onClick={restart}>重播</button><input aria-label="电场电流播放进度" type="range" min={0} max={duration} step={.05} value={seconds} onChange={e=>{setSeconds(+e.target.value);setPlaying(false);}}/><span>{seconds.toFixed(1)} / {duration} s</span></div>
        <PlaybackDuration context="电场电流" unit="演示秒" seconds={duration} min={6} max={60} step={1} onChange={v=>{setDuration(v);setSeconds(t=>Math.min(t,v));}}/>
        <p className="confinement-time-note">演示秒用于放慢观察，不是电子真实飞行时间。延长时长会增加运动时间；共同漂移的粒子离开管道后，继续沿箭头方向运动；可缩小视角观察更远的位置。</p>
      </section>
      <aside className="confinement-questions">
        <section className="lab-card"><h2>亲手改变方向</h2>
          {!radial?<label className="electric-control">中央磁通变化率 dΦ/dt：{rate} Wb/s<input aria-label="磁通变化率" type="range" min={-8} max={8} step={.5} value={rate} onChange={e=>{setRate(+e.target.value);restart();}}/><button onClick={()=>{setRate(-rate);restart();}}>反转磁通变化</button><p>负值：沿 +Z 的磁通减小；正值：增大。变化率为零时，没有这部分感应电场。</p></label>:<label className="electric-control">径向电场 Eᵣ：{er} V/m<input aria-label="径向电场" type="range" min={-1200} max={1200} step={100} value={er} onChange={e=>{setEr(+e.target.value);restart();}}/><p>正值向外，负值向内。</p></label>}
          <button onClick={()=>{setB(-b);restart();}}>反转环向磁场 B（当前 {b>0?'+φ':'−φ'}）</button>
          <div className="electric-layers">{['透明环面','电场 E','传统电流 J','环向磁场 B','中央螺线管','电子 / 离子亮点'].map((name,i)=><label key={name}><input type="checkbox" checked={layers[i]} disabled={radial&&(i===2||i===4)} onChange={()=>setLayers(v=>v.map((x,j)=>i===j?!x:x))}/>{name}</label>)}</div>
        </section>
        <section className="lab-card"><h2>{radial?'为什么一起漂移，却不等于电流？':'电流不是一群正粒子在跑'}</h2><p>{radial?'离子带正电、电子带负电。它们以相同速度一起移动时，两份电流互相抵消；等离子体可以整体流动，却没有这份共同运动造成的净电流。':'传统电流按正电荷流动的方向定义。电子带负电，所以电子平均向右，电子贡献的电流就向左。亮点只表示平均定向运动，真实电子还在快速热运动和回旋。'}</p><div className="formula">{radial?'v_E = E × B / B²':'J = enᵢvᵢ − enₑvₑ'}</div></section>
      </aside>
    </div>
    <div className="electric-explain">
      <section className="lab-card"><p className="eyebrow">01 · 电场从哪里来</p><h2>{radial?'电荷重新分布，也会建立电场':'不用给甜甜圈接两根电线'}</h2><p>{radial?'等离子体内的电荷分布与压强、流动等因素共同决定径向电场。这里直接指定 Eᵣ，单独观察它在环向磁场中的作用。':'中央螺线管是变压器的初级，闭合等离子体环像一匝次级。中央磁通改变，就在周围感应出绕圈的电场；电场推动电荷，不需要电线从中央线圈接进燃料。恒定磁通不会持续产生这部分电场。'}</p><div className="formula">{radial?'正 Eᵣ：向外 ｜ 正 Bφ：沿 +φ':'V_loop = ∮ E·dl = −dΦ/dt'}</div></section>
      <section className="lab-card"><p className="eyebrow">02 · 现在看到什么</p><h2>{radial?`共同漂移：${f.driftZ>0?'向上':f.driftZ<0?'向下':'停止'}`:direction}</h2><p>{radial?`本例 v_E,Z = ${f.driftZ.toFixed(0)} m/s。反转电场或磁场中的任意一个，漂移就反向；同时反转二者，漂移方向不变。`:`环电压 ${f.loopVoltage.toFixed(1)} V；R = 3 m 处 Eφ = ${f.toroidalE.toFixed(3)} V/m。采用固定 σ∥ = 10⁶ S/m 展示欧姆响应，Jφ ≈ ${(f.ohmicJ/1e6).toFixed(3)} MA/m²。电子平均运动与此反向。`}</p><p>{radial?'径向电场不是径向电流的同义词；这里展示准中性等离子体的共同 E×B 漂移。':'这里比较各方向的欧姆响应，不模拟反向瞬间的电流衰减；真实总电流还包含非感应驱动和自举电流。'}</p></section>
      <section className="lab-card"><p className="eyebrow">03 · 和磁场连起来看</p><h2>线圈电流、等离子体电流，各有回路</h2><p>外部线圈的电流沿金属导体和电源回路流动；燃料中的电流在等离子体内绕环闭合。环向场线圈主要产生环向 B；等离子体的环向电流产生极向 B。电场、电流和磁场不是同一个方向箭头。</p><p>欧姆响应里，反转环向 B 不会自动反转环向 E 或 J；而 E×B 漂移会随 B 反转。试试上方按钮。</p></section>
    </div>
    <p className="lab-note">坐标约定：从 +Z 俯视，+φ 为逆时针。环向场为主的教学模型中，以 Eφ 近似平行电场；颜色只区分物理量，不代表温度。</p>
    <p><a href="https://www.iter.org/fusion-glossary" target="_blank" rel="noreferrer">ITER · Central solenoid 与变压器原理 ↗</a>　<a href="https://farside.ph.utexas.edu/teaching/plasma/Plasma/node53.html" target="_blank" rel="noreferrer">UT Austin · 电流、电子与离子速度 ↗</a></p>
  </>;
}