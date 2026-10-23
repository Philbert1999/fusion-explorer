import SceneLabel from "./SceneLabel";
import {frameElapsed} from "./playback";
import {useEffect,useMemo,useState} from 'react';
import {Canvas,useThree} from '@react-three/fiber';
import {Line,OrbitControls} from '@react-three/drei';
import {Vector3} from 'three';
import Torus from './Torus';
import PlaybackDuration from './PlaybackDuration';
import {point,TAU} from './model';
import {surfaceGeometry} from './surface';
import {heatingState,profileQ,rationalRadius,equilibriumGeometry,fluxContour,divertorPoint,separatrixFlux,openLeg,exhaustPower,type HeatingMethod,type Vec3} from './advancedPhysics';
export type PhysicsKind='heating'|'equilibrium'|'exhaust';
const color={plasma:'#bca6ef',energy:'#f6b687',field:'#77d9db',pressure:'#f19bac',current:'#95dab6'};
const titles={heating:'加热与电流驱动：能量怎样送进燃料？',equilibrium:'磁平衡与剖面：外形相同，里面也一样吗？',exhaust:'刮削层与偏滤器：跑出来的热量去哪儿？'};
const methods:Record<HeatingMethod,string>={ohmic:'欧姆加热',nbi:'中性束 NBI',ec:'电子回旋 EC',ic:'离子回旋 IC'};
const explanations:Record<HeatingMethod,string>={
  ohmic:'环向电场推动电荷形成电流，等离子体的电阻让电能转为热能。温度升高后电阻变小，欧姆加热的能力会受限。',
  nbi:'先把原子加速，再变成中性原子射进磁笼；中性粒子不会先被磁场弯走。进入等离子体并电离后，快离子被磁场偏转，再通过碰撞把能量传给电子和离子。定向注入还可以驱动电流。',
  ec:'把微波送到电子能有效吸收的共振区域，能量先进入电子。合适的波传播方向能优先推动一部分电子，形成电子回旋电流驱动；对称加热并不自动产生净电流。',
  ic:'射频波把能量耦合到离子的运动，再经碰撞和其他过程重新分配给等离子体。这里展示加热通道，不把所有射频加热都画成电流驱动。',
};
function Dot({p,c,r=.07}:{p:Vec3;c:string;r?:number}){return <mesh position={p}><sphereGeometry args={[r,12,12]}/><meshBasicMaterial color={c}/></mesh>;}
function Arrow({p,d,c,length=.5}:{p:Vec3;d:Vec3;c:string;length?:number}){return <arrowHelper args={[new Vector3(...d).normalize(),new Vector3(...p),length,c,.16,.08]}/>;}
function Camera(){const {camera}=useThree();useEffect(()=>{camera.up.set(0,0,1);camera.lookAt(0,0,-.1);},[camera]);return null;}
function Circle({radius=3,z=0,c=color.field}:{radius?:number;z?:number;c?:string}){const pts=useMemo(()=>Array.from({length:161},(_,i):Vec3=>[radius*Math.cos(i/160*TAU),radius*Math.sin(i/160*TAU),z]),[radius,z]);return <Line points={pts} color={c} lineWidth={1.5}/>;}
const basic=equilibriumGeometry(1.4,.15);
function HeatingScene({method,time,power,drive,deposit}:{method:HeatingMethod;time:number;power:number;drive:number;deposit:number}){
  const h=heatingState(time,power,method,drive),r=3+.8*deposit;
  const paths=useMemo(()=>Array.from({length:241},(_,i)=>point({...basic,rho:Math.max(.2,deposit)},i/240*TAU*3,i/240*TAU*1.5)),[deposit]);
  return <>
    <Torus g={basic} color={color.plasma} opacity={.22}/><Torus g={{...basic,rho:.65}} color="#d8b3e1" opacity={.08+Math.min(.3,h.stored/30)}/>
    {method==='ohmic'?<><Circle c={color.energy}/>{Array.from({length:8},(_,i)=>{const a=i*TAU/8;return <Arrow key={i} p={[3*Math.cos(a),3*Math.sin(a),.18]} d={[-Math.sin(a),Math.cos(a),0]} c={color.energy}/>;})}<SceneLabel center position={[0,0,1.6]} className="confinement-label">环向 E → 欧姆电流 → 热</SceneLabel></>:
    method==='nbi'?<>{(drive===0?[1,-1]:[drive]).map(sign=><group key={sign}>
      <Line points={[[r,-4*sign,0],[r,0,0]]} color="#f0d8bd" lineWidth={3}/>
      {power>0&&Array.from({length:6},(_,i)=>{const f=(time*.35+i/6)%1;return <Dot key={i} p={[r,-4*sign*(1-f),0]} c="#f0d8bd" r={.055}/>;})}
      <SceneLabel center position={[r,-3.7*sign,.4]} className="confinement-label">直行的中性原子</SceneLabel>
      <Line points={paths} color={color.current} lineWidth={1.2} transparent opacity={.65}/>
      {power>0&&Array.from({length:5},(_,i)=>{const a=sign*(time*.7+i*TAU/5);return <Dot key={i} p={point({...basic,rho:Math.max(.2,deposit)},a,a/2)} c={color.current}/>;})}
    </group>)}<Dot p={[r,0,0]} c={color.energy} r={.15}/><SceneLabel center position={[r,0,.65]} className="confinement-label">电离后偏转 · 碰撞传能</SceneLabel></>:
    <><Line points={Array.from({length:121},(_,i):Vec3=>{const f=i/120;return [6-(6-r)*f,(power>0?.12:0)*Math.sin(f*35-time*8),.1];})} color={method==='ec'?'#f6b687':'#80baff'} lineWidth={3}/>
      <mesh position={[6,0,0]}><boxGeometry args={[.3,.6,.6]}/><meshStandardMaterial color="#bac8d8" metalness={.7} roughness={.3}/></mesh>
      <SceneLabel center position={[5.4,0,.75]} className="confinement-label">{method==='ec'?'微波 → 电子':'射频 → 离子'}</SceneLabel>
      {power>0&&Array.from({length:5},(_,i)=>{const a=time*(method==='ec'?7:3)+i*TAU/5,gyro=method==='ec'?.13:.24;return <Dot key={i} p={[r+gyro*Math.cos(a),0,gyro*Math.sin(a)]} c={method==='ec'?'#c5a4ef':color.current}/>;})}
      <SceneLabel center position={[r,0,.8]} className="confinement-label">局部共振吸收 · 回旋半径已放大</SceneLabel></>}
    {power>0&&[0,1,2].map(i=><mesh key={i} position={[r,0,0]} scale={.15+((time*.4+i/3)%1)*.65}><sphereGeometry args={[1,20,12]}/><meshBasicMaterial color={color.energy} transparent opacity={.14*(1-(time*.4+i/3)%1)} wireframe/></mesh>)}
    {Math.abs(h.current)>1e-5&&<>{[0,1,2,3].map(i=>{const a=i*TAU/4;return <Arrow key={i} p={[2.95*Math.cos(a),2.95*Math.sin(a),.35]} d={[-Math.sin(a)*Math.sign(h.current),Math.cos(a)*Math.sign(h.current),0]} c={color.current}/>;})}<SceneLabel center position={[-3,0,.9]} className="confinement-label">绿色箭头：净电流方向</SceneLabel></>}
  </>;
}
function EquilibriumScene({time,kappa,delta,rho,peak,edgeQ,pressure}:{time:number;kappa:number;delta:number;rho:number;peak:number;edgeQ:number;pressure:number}){
  const g=useMemo(()=>equilibriumGeometry(kappa,delta),[kappa,delta]);
  const q=profileQ(rho,edgeQ,peak);
  const line=useMemo(()=>Array.from({length:1201},(_,i)=>point({...g,rho},i/1200*TAU*6,i/1200*TAU*6/q)),[g,rho,q]);
  const poloidal=useMemo(()=>Array.from({length:161},(_,i)=>point({...g,rho},0,i/160*TAU)),[g,rho]);
  return <>
    {[1,.68,.36].map((r,i)=><Torus key={r} g={{...g,rho:r}} color={i===0?'#a3b1ce':color.plasma} opacity={i===0?.12:.17}/>)}
    <Torus g={{...g,rho}} color={color.field} opacity={.08}/><Line points={line} color={color.field} lineWidth={1.8}/><Line points={poloidal} color={color.energy} lineWidth={3}/>
    <Dot p={point({...g,rho},time*.75,time*.75/q)} c="#f0ebdc" r={.085}/>
    {[1.5,2,3].map((value,i)=>{const r=rationalRadius(value,edgeQ,peak);return r===null||r<.02?null:<Line key={value} points={Array.from({length:161},(_,j)=>point({...g,rho:r},.05,j/160*TAU))} color={['#f4a6b3','#edcc9e','#96afd9'][i]} lineWidth={1.8}/>;})}
    {[-1.6,1.6].map(z=><mesh key={z} position={[0,0,z]}><torusGeometry args={[3.6,.06,12,100]}/><meshStandardMaterial color="#c2cbd8" metalness={.7} roughness={.25}/></mesh>)}
    {[0,1,2,3].map(i=>{const a=i*TAU/4,p=point({...g,rho:.9},a,0),d:Vec3=[Math.cos(a),Math.sin(a),0],len=.25+pressure*.06;return <group key={i}><Arrow p={p} d={d} c={color.pressure} length={len}/><Arrow p={[p[0]+d[0]*len,p[1]+d[1]*len,p[2]+.13]} d={[-d[0],-d[1],0]} c={color.field} length={len}/></group>;})}
    <SceneLabel center position={[3.8,0,1.8]} className="confinement-label">选中截面</SceneLabel>
    <SceneLabel center position={[0,0,2]} className="confinement-label">压力向外 ↔ 磁力向内</SceneLabel>
  </>;
}
function FluxShell({level,c,opacity}:{level:number;c:string;opacity:number}){
  const geo=useMemo(()=>{const contour=fluxContour(level);return surfaceGeometry(basic,(phi,theta)=>{const index=theta/TAU*(contour.length-1),a=Math.floor(index),b=Math.min(a+1,contour.length-1),f=index-a;return divertorPoint(contour[a][0]*(1-f)+contour[b][0]*f,contour[a][1]*(1-f)+contour[b][1]*f,.3+phi*.82);});},[level]);
  useEffect(()=>()=>geo.dispose(),[geo]);
  return <mesh geometry={geo}><meshPhysicalMaterial color={c} transparent opacity={opacity} depthWrite={false} side={2} metalness={.25} roughness={.32}/></mesh>;
}

function DivertorHardware({radius,z,inner,footprint,power}:{radius:number;z:number;inner:boolean;footprint:number;power:number}) {
  const count=40,tilt=inner?-.42:.42;
  return <group>{Array.from({length:count},(_,i)=>{const phi=i/count*TAU,arc=radius*TAU/count;return <group key={i} position={[radius*Math.cos(phi),radius*Math.sin(phi),z]} rotation={[0,0,phi]}>
    <mesh position={[0,0,-.36]}><boxGeometry args={[.86,arc*.97,.3]}/><meshStandardMaterial color="#536d88" metalness={.55} roughness={.35}/></mesh>
    <group position={[0,0,-.12*Math.cos(tilt)]} rotation={[0,tilt,0]}>
      <mesh><boxGeometry args={[.62,arc*.91,.24]}/><meshStandardMaterial color="#c6d1dc" metalness={.55} roughness={.3}/></mesh>
      {power>0&&<mesh position={[0,0,.127]}><boxGeometry args={[footprint,arc*.86,.012]}/><meshStandardMaterial color="#f4a66a" emissive="#e97537" emissiveIntensity={.65} roughness={.5}/></mesh>}
    </group>
  </group>;})}</group>;
}

function ExhaustScene({time,offset,radiated,expansion,power}:{time:number;offset:number;radiated:number;expansion:number;power:number}){
  const level=separatrixFlux+offset;
  const legs=useMemo(()=>[openLeg(level,1),openLeg(level,-1)],[level]);
  const sep=useMemo(()=>fluxContour(separatrixFlux).map(([x,z])=>divertorPoint(x,z,.3)),[]);
  return <>
    <FluxShell level={.07} c={color.plasma} opacity={.3}/><FluxShell level={.13} c={color.plasma} opacity={.15}/><FluxShell level={separatrixFlux} c={color.field} opacity={.12}/>
    <Line points={sep} color={color.field} lineWidth={2.5}/><Dot p={divertorPoint(0,-1,.3)} c="#eef7f5" r={.075}/>
    <SceneLabel center position={divertorPoint(.25,-.45,.3)} className="confinement-label">① X 点</SceneLabel>
    {legs.map((path,k)=>{const end=path.at(-1)!,R=Math.hypot(end[0],end[1]),w=.05*expansion;return <group key={k}>
      <Line points={path} color={color.energy} lineWidth={2}/>
      {power>0&&Array.from({length:6},(_,i)=>{const fraction=(time*.14+i/6)%1;return <Dot key={i} p={path[Math.floor(fraction*(path.length-1))]} c={radiated>.6?'#e1a9a2':color.energy} r={.045+power*.003}/>;})}
      <DivertorHardware radius={R} z={end[2]} inner={k===1} footprint={w} power={power}/>
      <mesh position={end}><sphereGeometry args={[.07+.05*(1-radiated),20,14]}/><meshBasicMaterial color={color.energy}/></mesh>
      <SceneLabel center position={[end[0],end[1],end[2]-(k===0?.5:1.05)]} className="confinement-label">{k===0?'② 外靶板':'③ 内靶板'}</SceneLabel>
    </group>;})}
    <SceneLabel center position={[0,0,.75]} className="confinement-label">青色：分界磁面</SceneLabel>
    {radiated>0&&legs.map((path,k)=>[.3,.6].map((fraction,i)=><mesh key={`${k}-${i}`} position={path[Math.floor(fraction*(path.length-1))]} scale={.15+((time*.5+i/2)%1)*radiated*.6}><sphereGeometry args={[1,16,12]}/><meshBasicMaterial color="#e6a6c3" wireframe transparent opacity={radiated*.22}/></mesh>))}
  </>;
}
function Control({label,value,min,max,step,onChange}:{label:string;value:number;min:number;max:number;step:number;onChange:(n:number)=>void}){return <label className="advanced-slider"><span>{label}</span><input type="range" aria-label={label} {...{value,min,max,step}} onChange={e=>onChange(+e.target.value)}/></label>;}
function Curve({label,unit,data,c=color.field}:{label:string;unit:string;data:number[];c?:string}){const max=Math.max(.001,...data);return <div className="physics-curve"><strong>{label}</strong><svg viewBox="0 0 300 135" role="img" aria-label={label}><line x1="30" x2="280" y1="105" y2="105" stroke="#536b82"/><polyline points={data.map((y,i)=>`${30+i/(data.length-1)*250},${105-y/max*80}`).join(' ')} fill="none" stroke={c} strokeWidth="2"/><text x="30" y="15" fill="#bdcfdf">{max.toFixed(2)} {unit}</text><text x="30" y="128" fill="#bdcfdf">中心 ρ=0</text><text x="205" y="128" fill="#bdcfdf">边缘 ρ=1</text></svg></div>;}
export default function PhysicsLab({kind}:{kind:PhysicsKind}){
  const [time,setTime]=useState(0),[duration,setDuration]=useState(24),[playing,setPlaying]=useState(true),[reset,setReset]=useState(0);
  const [method,setMethod]=useState<HeatingMethod>('nbi'),[power,setPower]=useState(4),[drive,setDrive]=useState(1),[deposit,setDeposit]=useState(.35);
  const [kappa,setKappa]=useState(1.5),[delta,setDelta]=useState(.28),[rho,setRho]=useState(.65),[peak,setPeak]=useState(2),[edgeQ,setEdgeQ]=useState(3),[pressure,setPressure]=useState(3);
  const [offset,setOffset]=useState(.012),[radiated,setRadiated]=useState(.2),[expansion,setExpansion]=useState(2);
  const [focusDivertor,setFocusDivertor]=useState(false);
  useEffect(()=>{if(!playing)return;let frame=0,last=performance.now();const tick=(now:number)=>{const dt=frameElapsed(now,last);last=now;setTime(t=>Math.min(duration,t+dt));frame=requestAnimationFrame(tick);};frame=requestAnimationFrame(tick);return()=>cancelAnimationFrame(frame);},[playing,duration]);
  useEffect(()=>{if(time>=duration)setPlaying(false);},[time,duration]);
  const h=heatingState(time,power,method,drive),ex=exhaustPower(power,radiated,expansion),q=profileQ(rho,edgeQ,peak);
  const source=kind==='heating'?'https://www.iter.org/machine/supporting-systems/external-heating-systems':kind==='equilibrium'?'https://www.ipp.mpg.de/4119345/mhd':'https://www.iter.org/fusion-glossary';
  return <>
    <div className="physics-heading"><h2>{titles[kind]}</h2><p>{kind==='heating'?'看清中性束、微波和射频的传能路径，再区分“把燃料加热”与“让电荷定向流动”。':kind==='equilibrium'?'旋转磁面，看压力、电流剖面和磁力线缠绕如何联系。': '从闭合磁面走到开放磁力线，沿着发亮的热流标记找到内外靶板。'}</p></div>
    <div className="confinement-layout physics-layout">
      <section className="lab-card confinement-visual">
        <div className="confinement-toolbar"><button onClick={()=>{setFocusDivertor(false);setReset(n=>n+1);}}>复位视角</button>{kind==='exhaust'&&<button className={focusDivertor?'active':''} onClick={()=>{setFocusDivertor(!focusDivertor);setReset(n=>n+1);}}>{focusDivertor?'返回装置整体':'放大看偏滤器实体'}</button>}<span>拖动旋转 · 滚轮缩放 · 右键平移</span></div>
        <div className="confinement-canvas physics-canvas" role="img" aria-label={titles[kind]}><Canvas key={reset} camera={{position:kind==='exhaust'?(focusDivertor?[6.2,-7.8,1]:[7,-9,3.9]):[6.6,-8.25,5.775],fov:42}} dpr={[1,1.5]}><Camera/><color attach="background" args={['#080f1c']}/><ambientLight intensity={1.8}/><directionalLight position={[3,-4,8]} intensity={3}/><directionalLight position={[-4,3,1]} color="#b9b6ef" intensity={2}/>
          {kind==='heating'?<HeatingScene {...{method,time,power,drive,deposit}}/>:kind==='equilibrium'?<EquilibriumScene {...{time,kappa,delta,rho,peak,edgeQ,pressure}}/>:<ExhaustScene {...{time,offset,radiated,expansion,power}}/>}<OrbitControls makeDefault target={kind==='exhaust'?(focusDivertor?[1.8,-1.8,-1.65]:[0,0,-.8]):[0,0,-.5]} minDistance={6} maxDistance={24}/></Canvas></div>
        <div className="confinement-legend">{kind==='exhaust'&&<><span style={{color:'#d0dbe5'}}>■ 银灰色实体：偏滤器靶板</span><span style={{color:'#89a9cd'}}>■ 深蓝底座：承载结构</span></>}<span style={{color:color.plasma}}>● 闭合等离子体 / 磁面</span><span style={{color:color.energy}}>● 能量通道 / 选中截面</span><span style={{color:color.field}}>● 磁力线 / 分界面</span></div>
        <div className="confinement-playback"><button onClick={()=>{if(time>=duration)setTime(0);setPlaying(!playing);}}>{playing?'暂停':'播放'}</button><button onClick={()=>{setTime(0);setPlaying(true);}}>重播</button><input aria-label={`${titles[kind]}播放进度`} type="range" min={0} max={duration} step={.05} value={time} onChange={e=>{setTime(+e.target.value);setPlaying(false);}}/><span>{time.toFixed(1)} / {duration} s</span></div>
        <PlaybackDuration context={titles[kind]} seconds={duration} min={6} max={96} step={6} unit="示意秒" onChange={v=>{setDuration(v);setTime(t=>Math.min(t,v));}}/>
        <p className="confinement-time-note">延长时长会展示更久的运动和累积能量，播放速度不变；运动已放慢为示意时间。</p>
      </section>
      <aside className="confinement-questions">
        <section className="lab-card"><h2>亲手改变条件</h2>
          {kind==='heating'?<><div className="physics-options">{(Object.keys(methods) as HeatingMethod[]).map(id=><button key={id} className={method===id?'active':''} aria-pressed={method===id} onClick={()=>{setMethod(id);setTime(0);}}>{methods[id]}</button>)}</div><Control label={`输入功率：${power} MW`} value={power} min={0} max={8} step={.5} onChange={v=>{setPower(v);setTime(0);}}/>{method!=='ohmic'&&<Control label={`吸收位置：ρ ≈ ${deposit.toFixed(2)}`} value={deposit} min={.1} max={.85} step={.05} onChange={setDeposit}/>}{(method==='nbi'||method==='ec')&&<><p>定向驱动（按净电流方向命名）</p><div className="physics-options">{[[-1,'反向'],[0,'对称加热'],[1,'正向']].map(([value,label])=><button key={value} className={drive===value?'active':''} onClick={()=>setDrive(Number(value))}>{label}</button>)}</div></>}</>:
          kind==='equilibrium'?<><Control label={`拉长比 κ：${kappa.toFixed(2)}`} value={kappa} min={1} max={2.2} step={.05} onChange={setKappa}/><Control label={`三角形变 δ：${delta.toFixed(2)}`} value={delta} min={0} max={.55} step={.05} onChange={setDelta}/><Control label={`当前磁面 ρ：${rho.toFixed(2)}`} value={rho} min={.15} max={1} step={.025} onChange={setRho}/><Control label={`电流集中程度：${peak.toFixed(1)}`} value={peak} min={0} max={4} step={.1} onChange={setPeak}/><Control label={`边缘安全因子 qₐ：${edgeQ.toFixed(1)}`} value={edgeQ} min={2} max={5} step={.1} onChange={setEdgeQ}/><Control label={`中心压强：${pressure.toFixed(1)}（归一化）`} value={pressure} min={.5} max={5} step={.25} onChange={setPressure}/></>:
          <><Control label={`越过分界面的程度 Δψ：${offset.toFixed(3)}`} value={offset} min={.004} max={.04} step={.002} onChange={setOffset}/><Control label={`进入刮削层的功率：${power} MW`} value={power} min={0} max={8} step={.5} onChange={setPower}/><Control label={`到靶板前辐射掉：${(radiated*100).toFixed(0)}%`} value={radiated} min={0} max={.8} step={.05} onChange={setRadiated}/><Control label={`靶板热流足迹展宽：×${expansion.toFixed(1)}`} value={expansion} min={1} max={5} step={.25} onChange={setExpansion}/></>}
        </section>
        <section className="lab-card"><h2>{kind==='heating'?methods[method]:kind==='equilibrium'?'不是磁场把每个粒子钉在原地':'先找底部两排实体靶板'}</h2><p>{kind==='heating'?explanations[method]:kind==='equilibrium'?'等离子体压强想把燃料向外推，磁场与电流共同提供磁力。平衡时两边相抵，但粒子仍在热运动和回旋。调节电流剖面会改变内部磁场和q，即使外轮廓看起来一样。':'银灰色的两排倾斜瓦块是内外靶板，下面深蓝色是承载结构；橙色亮带标出热流落点。这些底部材料组件组成了这里展示的偏滤器。分界面以内的磁力线留在闭合磁面上；外侧的开放场线最终碰到材料表面。跨过分界面进入刮削层的热量，会很快沿磁场流向偏滤器靶板。X点是极向磁场为零的位置，环向磁场仍然存在。'}</p><div className="formula">{kind==='heating'?'dW/dt = P_abs − W/τ':kind==='equilibrium'?'J × B = ∇p':'P入 = P辐射 + P靶板'}</div></section>
      </aside>
    </div>
    {kind==='heating'?<div className="physics-summary"><section className="lab-card"><h2>输入不等于全部吸收</h2><strong>{h.absorbed.toFixed(2)} MW <small>吸收功率</small></strong><p>热储能 {h.stored.toFixed(2)} MJ；当前损失功率 {h.loss.toFixed(2)} MW。采用固定吸收比例与 τ=2.5 的简化能量平衡；改变功率会从零开始新一轮。</p></section><section className="lab-card"><h2>加热 ≠ 一定产生净电流</h2><strong>{h.current>0?'正向电流':h.current<0?'反向电流':'无净定向驱动'}</strong><p>对称地增加粒子能量，可以加热而不增加净定向电流。EC驱动中电子平均运动与传统电流相反；IC在本例只展示加热。方向和效率为教学设定。</p></section><section className="lab-card"><h2>为什么要组合使用？</h2><p>欧姆加热适合建立电流；辅助加热继续提高能量；局部电流驱动还能调整电流剖面。束流和波的沉积位置，会影响接下来看到的温度与电流分布。</p></section></div>:
    kind==='equilibrium'?<><div className="physics-summary"><section className="lab-card"><h2>当前磁面的缠绕</h2><strong>q ≈ {q.toFixed(2)}</strong><p>三维亮点沿选定磁力线移动。电流越向中心集中，中心 q 越低；彩色截面标出 q=1.5、2、3 在本剖面内存在的位置。</p></section><section className="lab-card"><h2>压力力与磁力</h2><p>粉色箭头表示压力向外推，青色箭头表示平衡磁力向内。这里展示局部方向关系，不是把每处磁力都等同于简单的径向拉力。</p></section><section className="lab-card"><h2>如何连接真实模拟？</h2><p>下面用圆柱近似把 j 与 q 联系起来；形状参数用于展示。真实磁平衡需要联立求解压强、电流和磁通，如 Grad–Shafranov 方程。</p></section></div><div className="physics-profile-grid"><Curve label="压强 p(ρ)" unit="归一化" data={Array.from({length:81},(_,i)=>pressure*(1-(i/80)**2)**2)} c={color.pressure}/><Curve label="电流密度 j(ρ)（总电流固定）" unit="归一化" data={Array.from({length:81},(_,i)=>(peak+1)*(1-(i/80)**2)**peak)} c={color.current}/><Curve label="安全因子 q(ρ)" unit="" data={Array.from({length:81},(_,i)=>profileQ(i/80,edgeQ,peak))}/></div></>:
    <div className="physics-summary"><section className="lab-card"><h2>热流集中在很窄的地方</h2><strong>{ex.heatFlux.toFixed(2)} MW/m²</strong><p>两块环形靶板上的示意平均热流密度；展宽足迹能把同样的功率摊在更大面积上。亮点标出场线落点。</p></section><section className="lab-card"><h2>先在边缘分散热量</h2><strong>{ex.target.toFixed(2)} MW <small>到达靶板</small></strong><p>另有 {ex.radiated.toFixed(2)} MW 在途中以辐射分流；累计到靶板的能量 { (ex.target*time).toFixed(1)} MJ。辐射不会让能量消失，而是改变它沉积在哪里。</p></section><section className="lab-card"><h2>为什么不是整个壁面一起烤？</h2><p>沿磁场的输运通常远快于跨磁场输运，所以从狭窄刮削层流出的能量会集中到场线连接的靶板。实际偏滤器还涉及中性气体、碰撞、杂质与脱靶过程。</p></section></div>}
    <p className="lab-note">{kind==='exhaust'?'三维场线由带X点的解析磁通构造，并积分到内外靶板；能量标记沿线运动，辐射分流和热流足迹为可调教学模型。':kind==='equilibrium'?'嵌套磁面与剖面是教学参数化，未联立求解真实磁平衡。形状不会自动预测稳定阈值。':'束流、波和回旋运动为放慢的传能示意，不计算波色散、共振吸收或快离子碰撞动力学。'} <a href={source} target="_blank" rel="noreferrer">原理与进一步阅读 ↗</a></p>
  </>;
}