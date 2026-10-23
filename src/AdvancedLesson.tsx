import SceneLabel from "./SceneLabel";
import PhysicsLab, {type PhysicsKind} from "./PhysicsLab";
import {frameElapsed} from "./playback";
import {useEffect,useMemo,useState} from 'react';
import {Canvas,useThree} from '@react-three/fiber';
import {Line,OrbitControls} from '@react-three/drei';
import ElectricLesson from './ElectricLesson';
import PlaybackDuration from './PlaybackDuration';
import {shotFrame,SHOT_PERIOD,experimentGeometry as geometry,densityAt,chordIntegral,diagnosticSamples,diagnosticChords,fitDensity,noisySignal} from './experiment';
const phases=['充气与准备','击穿与电流爬升','辅助加热投入','平顶维持','降流与结束','放电间隔'];
const phaseTimes=[0,2,6,9,18,22];
const stories=[
  '先抽真空，再充入少量燃料气体；此时还没有一圈明亮的高温等离子体。',
  '感应电场让气体击穿、电离，等离子体电流开始爬升。线圈协同控制位置与形状。',
  '辅助加热开始投入，电子和离子的能量提高。加热功率、温度和储能并不是同一个量。',
  '电流进入平顶，维持燃料供给与加热，同时持续测量。平顶指电流基本稳定，并不意味着每个信号完全不变。',
  '主动减小加热和电流，让放电有序退出。本例是正常结束，不是破裂。',
  '本次放电结束，进入两次示意放电之间的间隔。延长时间轴可观察下一轮；实际装置间隔通常长得多。',
];
type Series={label:string;color:string;points:[number,number][]};
function Chart({series,duration,time,max,unit,dots=false}: {series:Series[];duration:number;time:number;max:number;unit:string;dots?:boolean}) {
  const yMax=Math.max(max,1e-6), x=(v:number)=>45+v/duration*490,y=(v:number)=>150-v/yMax*120;
  return <svg viewBox="0 0 560 190" className="advanced-chart" role="img" aria-label={`${series.map(v=>v.label).join('、')}，单位${unit}`}>
    {[0,.5,1].map(v=><g key={v}><line x1="45" x2="535" y1={y(v*yMax)} y2={y(v*yMax)} stroke="#293e50"/><text x="40" y={y(v*yMax)+4} textAnchor="end">{(v*yMax).toFixed(1)}</text></g>)}
    {series.map((s,i)=><g key={s.label}>{dots&&i===series.length-1?s.points.filter(p=>p[0]<=time).map((p,k)=><circle key={k} cx={x(p[0])} cy={y(p[1])} r="2.5" fill={s.color}/>):<polyline points={s.points.map(p=>`${x(p[0])},${y(p[1])}`).join(' ')} fill="none" stroke={s.color} strokeWidth="2"/>}</g>)}
    <line x1={x(time)} x2={x(time)} y1="20" y2="150" stroke="#f3d4a4" strokeDasharray="4 3"/>
    <text x="45" y="178">0</text><text x="280" y="178">示意时间 / s</text><text x="535" y="178" textAnchor="end">{duration}</text><text x="45" y="14">{unit}</text>
  </svg>;
}
function Camera(){const {camera}=useThree();useEffect(()=>{camera.up.set(0,0,1);camera.lookAt(0,0,0);},[camera]);return null;}
function ShotScene({time,diagnostic,impact,multi,width}: {time:number;diagnostic:boolean;impact:number;multi:boolean;width:number}) {
  const f=shotFrame(time);
  const coil=useMemo(()=>Array.from({length:361},(_,i):[number,number,number]=>{const a=i/360*Math.PI*20;return [.65*Math.cos(a),.65*Math.sin(a),-1.5+i/360*3];}),[]);
  const chordX=geometry.R+impact*geometry.a;
  return <>
    <Camera/><ambientLight intensity={1.7}/><directionalLight position={[3,-4,8]} intensity={3}/><directionalLight position={[-4,4,1]} color="#a4baff" intensity={2}/>
    <mesh scale={[1,1,1.4]}><torusGeometry args={[3,.86,24,100]}/><meshStandardMaterial color="#a6b6d4" transparent opacity={.12} wireframe depthWrite={false}/></mesh>
    {f.envelope>.001&&<mesh scale={[1,1,1.4]}><torusGeometry args={[3,.8,32,100]}/><meshStandardMaterial color="#bba5ef" emissive="#4b78bd" emissiveIntensity={.3+f.temperature*.4} transparent opacity={.12+f.envelope*.4} depthWrite={false} metalness={.3} roughness={.3}/></mesh>}
    <Line points={coil} color="#bfc1ce" lineWidth={4}/>
    {diagnostic?<>
      {multi&&diagnosticChords.map((x,i)=><Line key={i} points={[[3+x*.8,0,-1.65],[3+x*.8,0,1.65]]} color="#70d5ce" lineWidth={1} transparent opacity={.4}/>)}
      <Line points={[[chordX,0,-1.65],[chordX,0,1.65]]} color="#f4bb85" lineWidth={3}/>
      {width>0&&<mesh position={[chordX,0,0]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[Math.max(.02,width),Math.max(.02,width),3.2,20,1,true]}/><meshBasicMaterial color="#f4bb85" transparent opacity={.1} depthWrite={false}/></mesh>}
      {[-1.8,1.8].map(z=><mesh key={z} position={[chordX,0,z]}><boxGeometry args={[.22,.22,.22]}/><meshStandardMaterial color="#f4bb85"/></mesh>)}
      <SceneLabel center position={[chordX,0,2.05]} className="confinement-label">干涉仪视线 · 沿整条弦累积密度</SceneLabel>
    </>:<>
      <SceneLabel center position={[0,0,2]} className="confinement-label">中央螺线管</SceneLabel>
      {f.heating>.1&&<><Line points={[[5,-3,.3],[3,-.8,.3]]} color="#f4bb85" lineWidth={4}/><SceneLabel position={[5,-3,.6]} center className="confinement-label">辅助加热 →</SceneLabel></>}
    </>}
    <OrbitControls makeDefault minDistance={6} maxDistance={24}/>
  </>;
}
function Slider({label,value,min,max,step,onChange}: {label:string;value:number;min:number;max:number;step:number;onChange:(v:number)=>void}) {
  return <label className="advanced-slider"><span>{label}</span><input aria-label={label} type="range" {...{value,min,max,step}} onChange={e=>onChange(+e.target.value)}/></label>;
}
export default function AdvancedLesson(){
  const [tab,setTab]=useState('shot'),[time,setTime]=useState(0),[duration,setDuration]=useState(24),[playing,setPlaying]=useState(true),[reset,setReset]=useState(0);
  const [impact,setImpact]=useState(0),[width,setWidth]=useState(.05),[peaking,setPeaking]=useState(1.5),[noise,setNoise]=useState(.03),[interval,setInterval]=useState(.5),[multi,setMulti]=useState(true);
  useEffect(()=>{if(!playing||(tab!=='shot'&&tab!=='diagnostic'))return;let frame=0,previous=performance.now();const tick=(now:number)=>{const dt=frameElapsed(now,previous);previous=now;setTime(t=>Math.min(duration,t+dt));frame=requestAnimationFrame(tick);};frame=requestAnimationFrame(tick);return()=>cancelAnimationFrame(frame);},[playing,duration,tab]);
  useEffect(()=>{if(time>=duration)setPlaying(false);},[time,duration]);
  const f=shotFrame(time,peaking), diagnostic=tab==='diagnostic';
  const waveform=useMemo(()=>Array.from({length:361},(_,i)=>{const t=i/360*duration;return {time:t,...shotFrame(t,peaking)};}),[duration,peaking]);
  const samples=useMemo(()=>diagnosticSamples(duration,interval,impact,peaking,width,noise),[duration,interval,impact,peaking,width,noise]);
  const ideal=useMemo(()=>waveform.map(v=>[v.time,chordIntegral(impact,v.density,peaking,width)] as [number,number]),[waveform,impact,peaking,width]);
  const sampleTime=Math.floor(time/interval)*interval, sampleDensity=shotFrame(sampleTime,peaking).density;
  const chordSignals=useMemo(()=>diagnosticChords.map((x,i)=>noisySignal(chordIntegral(x,sampleDensity,peaking,width),Math.floor(sampleTime/interval)*7+i,noise)),[sampleDensity,peaking,width,sampleTime,interval,noise]);
  const fit=useMemo(()=>multi&&sampleDensity>1e-5?fitDensity(diagnosticChords,chordSignals,width):null,[multi,sampleDensity,chordSignals,width]);
  const maxSignal=Math.max(.1,...ideal.map(v=>v[1]))*1.15;
  const sampled=samples.filter(s=>s.time<=time).at(-1);
  const descriptors=[{key:'current' as const,label:'等离子体电流 Iₚ',unit:'MA',color:'#77ddca',max:1},{key:'density' as const,label:'中心电子密度 nₑ₀',unit:'10²⁰ m⁻³',color:'#80baff',max:1.1},{key:'temperature' as const,label:'中心电子温度 Tₑ₀',unit:'keV',color:'#f4bb85',max:5},{key:'heating' as const,label:'辅助加热功率 P_aux',unit:'MW',color:'#d3a0ef',max:2.5},{key:'energy' as const,label:'热储能 W',unit:'MJ',color:'#a7bfef',max:4}];
  const restart=()=>{setTime(0);setPlaying(true);};
  return <>
    <div className="lab-heading"><div><p className="eyebrow">ADVANCED EXPLORATION · 从模拟到实验</p><h1>进阶探索</h1><p>模拟里的量，实验中怎么测、怎么调、怎么比较？从一轮示意放电，走到仪器信号。</p></div></div>
    <nav className="advanced-tabs" aria-label="进阶探索内容">{[['shot','01 一次放电'],['diagnostic','02 诊断与合成诊断'],['electric','03 电场与电流'],['heating','04 加热与电流驱动'],['equilibrium','05 磁平衡与剖面'],['exhaust','06 刮削层与偏滤器']].map(([id,label])=><button key={id} className={tab===id?'active':''} aria-pressed={tab===id} onClick={()=>{setTab(id);if(id!=='shot'&&id!=='diagnostic')setPlaying(false);}}>{label}</button>)}</nav>
    {tab==='electric'?<ElectricLesson/>:tab==='heating'||tab==='equilibrium'||tab==='exhaust'?<PhysicsLab key={tab} kind={tab as PhysicsKind}/>:<>
      <div className="advanced-stage"><strong>示意放电 #{f.shot} · {phases[f.phase]}</strong><span>当前 {time.toFixed(1)} s · 本轮 {f.t.toFixed(1)} / {SHOT_PERIOD} 示意秒</span></div>
      <div className="confinement-layout advanced-layout">
        <section className="lab-card confinement-visual">
          <div className="confinement-toolbar"><h2>{diagnostic?'一束光，测到的是一整条路径':'一轮放电，从准备到退出'}</h2><button onClick={()=>setReset(n=>n+1)}>复位视角</button><span>拖动旋转 · 滚轮缩放</span></div>
          <div className="confinement-canvas" role="img" aria-label={diagnostic?'干涉仪视线穿过三维等离子体':'三维等离子体随放电阶段演化'}><Canvas key={reset} camera={{position:[8,-10,8],fov:42}} dpr={[1,1.5]}><color attach="background" args={['#080f1c']}/><ShotScene {...{time,diagnostic,impact,multi,width}}/></Canvas></div>
          <p>{stories[f.phase]}</p>
          <div className="confinement-playback"><button onClick={()=>{if(time>=duration)setTime(0);setPlaying(!playing);}}>{playing?'暂停':'播放'}</button><button onClick={restart}>重播</button><input aria-label="实验放电时间轴" type="range" min={0} max={duration} step={.05} value={time} onChange={e=>{setTime(+e.target.value);setPlaying(false);}}/><span>{time.toFixed(1)} / {duration} s</span></div>
          <PlaybackDuration context="实验放电" unit="示意秒" seconds={duration} min={24} max={96} step={24} onChange={v=>{setDuration(v);setTime(t=>Math.min(t,v));}}/>
          <p className="confinement-time-note">每24示意秒一轮，延长区间会增加放电轮数和采样数据；播放速度不变。阶段时长已压缩，轮间等待不代表实际装置。</p>
        </section>
        <aside className="confinement-questions">
          {diagnostic?<section className="lab-card"><h2>把模拟放进一台虚拟仪器</h2>
            <Slider label={`选中观测弦：偏移 ${impact.toFixed(2)} a`} value={impact} min={-.95} max={.95} step={.025} onChange={setImpact}/>
            <Slider label={`束宽尺度：${(width*100).toFixed(0)} cm`} value={width} min={0} max={.3} step={.01} onChange={setWidth}/>
            <Slider label={`密度剖面尖锐度 p：${peaking.toFixed(2)}`} value={peaking} min={.5} max={4} step={.05} onChange={setPeaking}/>
            <Slider label={`采样间隔：${interval.toFixed(1)} 示意秒`} value={interval} min={.1} max={2} step={.1} onChange={setInterval}/>
            <Slider label={`相对噪声幅度：±${(noise*100).toFixed(0)}%`} value={noise} min={0} max={.2} step={.01} onChange={setNoise}/>
            <label><input type="checkbox" checked={multi} onChange={e=>setMulti(e.target.checked)}/> 开启七弦，尝试恢复密度剖面</label>
          </section>:<section className="lab-card"><h2>点选一个阶段</h2><div className="advanced-phases">{phases.map((phase,i)=><button key={phase} className={f.phase===i?'active':''} onClick={()=>{setTime(Math.min(Math.floor(time/24),duration/24-1)*24+phaseTimes[i]+.3);setPlaying(false);}}><small>{String(i+1).padStart(2,'0')}</small>{phase}</button>)}</div></section>}
          <section className="lab-card"><h2>{diagnostic?'从场到信号，需要做什么？':'看曲线时先分清三个量'}</h2><p>{diagnostic?'干涉仪测量光的相位变化，再换算为视线积分密度。模拟的一个网格点值，不等于仪器沿整条视线累积得到的值。':'功率 P 是每秒输入多少能量；温度 T 描述粒子的能量尺度；储能 W 是整团燃料里的总热能。温度上升，并不要求电流也同步上升。'}</p><div className="formula">{diagnostic?'Nₗ = ∫ nₑ dl':'输入功率 − 损失功率 = dW/dt'}</div><p>{diagnostic?'顺序：模拟场 → 路径积分 → 有限束宽 → 离散采样 → 加噪声。下面把同一观测过程作用于模拟，再比较同单位的信号。':'本页波形按阶段规定，不求解功率平衡。W 由密度和温度剖面积分，不能把辅助加热功率直接当作储能。'}</p></section>
        </aside>
      </div>
      {diagnostic?<>
        <div className="advanced-diagnostic-grid">
          <section className="lab-card"><h2>模拟知道完整的二维密度</h2><p>R–Z 截面 · 亮色表示密度较高。点击截面移动橙色观测弦。</p>
            <svg viewBox="0 0 420 300" className="advanced-cross" role="img" aria-label="二维密度分布与可移动诊断弦" onPointerDown={e=>{const rect=e.currentTarget.getBoundingClientRect();setImpact(Math.max(-.95,Math.min(.95,((e.clientX-rect.left)/rect.width*420-210)/110)));}}>
              {Array.from({length:28},(_,i)=>Array.from({length:28},(_,j)=>{const x=-1+(i+.5)/14,z=-1+(j+.5)/14;const n=densityAt(x,z,f.density,peaking);return x*x+z*z<1?<rect key={`${i}-${j}`} x={210+x*110-4} y={145-z*110-4} width="8.1" height="8.1" fill={`rgb(${Math.round(30+n*150)},${Math.round(55+n*160)},${Math.round(85+n*170)})`}/>:null;}))}
              <ellipse cx="210" cy="145" rx="110" ry="110" fill="none" stroke="#839cbb"/>
              {multi&&diagnosticChords.map((x,i)=><line key={i} x1={210+x*110} x2={210+x*110} y1="15" y2="275" stroke="#77ddca" opacity=".4"/>)}
              <rect x={210+impact*110-width/.8*110} y="15" width={Math.max(1,width/.8*220)} height="260" fill="#f4bb85" opacity=".14"/>
              <line x1={210+impact*110} x2={210+impact*110} y1="15" y2="275" stroke="#f4bb85" strokeWidth="2"/><text x="210" y="295" textAnchor="middle" fill="#b9ccda">R →（中心 R₀ = 3 m）　Z ↑</text>
            </svg>
            <p>nₑ₀ = {f.density.toFixed(3)} ×10²⁰ m⁻³ · nₑ(ρ) = nₑ₀(1−ρ²)ᵖ。椭圆截面按归一化坐标显示。</p>
          </section>
          <section className="lab-card"><h2>仪器只给出离散的信号</h2><div className="advanced-legend"><span style={{color:'#77ddca'}}>— 同观测过程的合成信号</span><span style={{color:'#f4bb85'}}>● 带噪采样</span></div>
            <Chart series={[{label:'合成视线积分',color:'#77ddca',points:ideal},{label:'虚拟测量',color:'#f4bb85',points:samples.map(s=>[s.time,s.measured])}]} {...{duration,time}} max={maxSignal} unit="10²⁰ m⁻²" dots/>
            <p>已记录 {samples.filter(v=>v.time<=time).length} 点；最近采样 t = {sampled?.time.toFixed(1)??'—'} s，Nₗ = {sampled?.measured.toFixed(3)??'—'} ×10²⁰ m⁻²。</p><p>采样过慢会漏掉密度起伏。噪声为可重复的均匀扰动；比较的是视线积分，单位不是局部密度的 m⁻³。</p>
            <p className="advanced-takeaway">移动视线时，模拟中心密度不变，仪器信号却会改变。</p>
          </section>
        </div>
        <section className="lab-card advanced-reconstruction"><div><h2>从信号恢复剖面：需要多条弦和假设</h2><p>{!multi?'仅一条弦不能同时唯一确定中心密度和尖锐度。打开七弦，再试一次。':!fit?'当前没有足够的等离子体密度，等待击穿或把时间轴拖到平顶。':`最近采样 t=${sampleTime.toFixed(1)} s，七弦拟合：中心密度 ${fit.amplitude.toFixed(3)} ×10²⁰ m⁻³，尖锐度 p = ${fit.peaking.toFixed(2)}。模拟真值 p = ${peaking.toFixed(2)}。`}</p><p>这里假设轴对称、椭圆磁面，以及同一种剖面函数，并将束宽纳入拟合。真实诊断还要考虑标定、光路、时间响应和误差；单个好看的拟合不等于唯一真实剖面。</p><div className="advanced-legend"><span style={{color:'#80baff'}}>— 模拟真值</span><span style={{color:'#f4bb85'}}>— 七弦拟合</span></div></div>
          <svg viewBox="0 0 400 230" className="advanced-profile" role="img" aria-label="模拟真实剖面与多弦恢复剖面对比"><line x1="40" x2="370" y1="190" y2="190" stroke="#7f95aa"/>{[{color:'#80baff',a:sampleDensity,p:peaking},...(fit?[{color:'#f4bb85',a:fit.amplitude,p:fit.peaking}]:[])].map((v,k)=><polyline key={k} points={Array.from({length:81},(_,i)=>`${40+i/80*330},${190-densityAt(i/80,0,v.a,v.p)*150}`).join(' ')} fill="none" stroke={v.color} strokeWidth="2.5"/>)}<text x="40" y="20" fill="#b9ccda">nₑ / 10²⁰ m⁻³</text><text x="40" y="215" fill="#b9ccda">中心 ρ=0</text><text x="285" y="215" fill="#b9ccda">边缘 ρ=1</text></svg>
        </section>
      </>:<div className="advanced-waveforms">{descriptors.map(d=><section className="lab-card" key={d.key}><div className="advanced-metric"><h2>{d.label}</h2><strong style={{color:d.color}}>{f[d.key].toFixed(2)} <small>{d.unit}</small></strong></div><Chart series={[{label:d.label,color:d.color,points:waveform.map(v=>[v.time,v[d.key]])}]} {...{duration,time}} max={d.max} unit={d.unit}/></section>)}<section className="lab-card"><h2>接下来：仪器看到的是哪条曲线？</h2><p>电流可通过磁测量约束；密度可通过干涉仪或汤姆逊散射诊断；温度需要专门诊断。储能也往往依赖测量与分析组合得到。</p><button onClick={()=>setTab('diagnostic')}>把这次放电送入虚拟干涉仪 →</button></section></div>}
      <section className="lab-card advanced-reading"><h2>把教学示意和实验资料分开</h2><p>本页是一组共用的教学放电数据，不是 EAST、ITER 或其他装置的实测放电。参考几何 R₀=3 m、a=0.8 m、κ=1.4；储能按 Tᵢ=Tₑ、单电荷离子与规定剖面积分。更换真实数据时，保留“模拟场 → 观测过程 → 同单位信号”的比较方法。</p><a href="https://www.iter.org/machine/supporting-systems/diagnostics" target="_blank" rel="noreferrer">ITER · 实验诊断介绍 ↗</a>　<a href="https://www.ipp.mpg.de/2882460/anleitung.pdf" target="_blank" rel="noreferrer">IPP · 干涉仪原理与线积分密度 ↗</a></section>
    </>}
  </>;
}