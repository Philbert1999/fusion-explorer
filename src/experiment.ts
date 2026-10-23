export const SHOT_PERIOD = 24;
export const experimentGeometry = {R:3, a:.8, kappa:1.4};
const smooth = (x:number) => {const y=Math.max(0,Math.min(1,x));return y*y*(3-2*y);};
export function shotFrame(time:number, peaking=1.5) {
  if(!Number.isFinite(time)||time<0||!Number.isFinite(peaking)||peaking<=0) throw new Error('Invalid shot');
  const t=time%SHOT_PERIOD;
  const envelope=smooth((t-2)/4)*(1-smooth((t-18)/4));
  const density=.9*envelope*(1+.04*Math.sin(2*Math.PI*1.2*t));
  const temperature=(.5+3.5*smooth((t-6)/3))*envelope;
  const heating=2*smooth((t-6)/2)*(1-smooth((t-18)/2));
  const phase=t<2?0:t<6?1:t<9?2:t<18?3:t<22?4:5;
  const {R,a,kappa}=experimentGeometry;
  const volume=2*Math.PI**2*R*a*a*kappa;
  // Equal electron/ion temperatures, n~(1-rho²)^p and T~(1-rho²), with zero edge values.
  const energy=.0480653*volume*density*temperature/(peaking+2);
  return {t,shot:Math.floor(time/SHOT_PERIOD)+1,phase,envelope,density,temperature,heating,current:.8*envelope,energy};
}
export function densityAt(x:number,z:number,amplitude:number,peaking:number) {
  const rho2=x*x+z*z;
  return rho2>=1?0:amplitude*(1-rho2)**peaking;
}
export function chordIntegral(impact:number, amplitude:number, peaking:number, width=0) {
  if(![impact,amplitude,peaking,width].every(Number.isFinite)||amplitude<0||peaking<=0||width<0) throw new Error('Invalid diagnostic');
  const weights=width===0?[1]:[1,4,6,4,1];
  let sum=0,weight=0;
  weights.forEach((w,k)=>{
    const x=impact+(weights.length===1?0:(k-2)*width/experimentGeometry.a/2);
    let integral=0;
    for(let i=0;i<96;i++) integral+=densityAt(x,-1+(i+.5)*2/96,amplitude,peaking)*2/96*experimentGeometry.a*experimentGeometry.kappa;
    sum+=w*integral;weight+=w;
  });
  return sum/weight;
}
export function noisySignal(value:number,index:number,noise:number) {
  if(!Number.isFinite(noise)||noise<0||noise>1) throw new Error('Invalid noise');
  const seed=Math.sin((index+1)*127.1)*43758.5453;
  return value*(1+noise*(2*(seed-Math.floor(seed))-1));
}
export function diagnosticSamples(duration:number,interval:number,impact:number,peaking:number,width:number,noise:number) {
  if(!Number.isFinite(duration)||duration<=0||duration>120||!Number.isFinite(interval)||interval<.1) throw new Error('Invalid sampling');
  return Array.from({length:Math.floor(duration/interval)+1},(_,i)=>{
    const time=i*interval;
    const ideal=chordIntegral(impact,shotFrame(time,peaking).density,peaking,width);
    return {time,ideal,measured:noisySignal(ideal,i,noise)};
  });
}
export const diagnosticChords=Array.from({length:7},(_,i)=>-.85+i*1.7/6);
export function fitDensity(chords:number[],signals:number[],width:number) {
  if(chords.length<3||chords.length!==signals.length||!signals.every(Number.isFinite)) return null;
  let best={amplitude:0,peaking:.5,error:Infinity};
  for(let i=0;i<=70;i++) {
    const peaking=.5+i*.05;
    const basis=chords.map(x=>chordIntegral(x,1,peaking,width));
    const norm=basis.reduce((s,v)=>s+v*v,0);
    const amplitude=Math.max(0,basis.reduce((s,v,k)=>s+v*signals[k],0)/norm);
    const error=basis.reduce((s,v,k)=>s+(v*amplitude-signals[k])**2,0);
    if(error<best.error) best={amplitude,peaking,error};
  }
  return best;
}