import type {Geometry} from './model';
export type Vec3=[number,number,number];
export type HeatingMethod='ohmic'|'nbi'|'ec'|'ic';
export function heatingState(time:number,power:number,method:HeatingMethod,direction:number) {
  if(![time,power,direction].every(Number.isFinite)||time<0||power<0||Math.abs(direction)>1)throw new Error('Invalid heating controls');
  const absorbed=power*(method==='nbi'?.75:method==='ohmic'?1:.85);
  const stored=absorbed*2.5*(-Math.expm1(-time/2.5));
  return {absorbed,stored,loss:stored/2.5,current:method==='ic'?0:method==='ohmic'?absorbed*.16:direction*absorbed*.12};
}
export function profileQ(rho:number,edgeQ:number,peaking:number) {
  if(![rho,edgeQ,peaking].every(Number.isFinite)||rho<0||rho>1||edgeQ<=0||peaking<0)throw new Error('Invalid profile');
  return rho<1e-5?edgeQ/(peaking+1):edgeQ*rho*rho/(-Math.expm1((peaking+1)*Math.log1p(-rho*rho)));
}
export function rationalRadius(q:number,edgeQ:number,peaking:number) {
  if(q<profileQ(0,edgeQ,peaking)||q>edgeQ)return null;
  let lo=0,hi=1;
  for(let i=0;i<45;i++){const mid=(lo+hi)/2;if(profileQ(mid,edgeQ,peaking)<q)lo=mid;else hi=mid;}
  return (lo+hi)/2;
}
export function equilibriumGeometry(kappa:number,delta:number):Geometry{return {R0:3,a:.8,rho:1,kappa,delta};}
export const separatrixFlux=1/6;
export function divertorFlux(x:number,z:number){return x*x/2+z*z/2+z*z*z/3;}
function upperRoot(level:number){let lo=0,hi=2;for(let i=0;i<45;i++){const z=(lo+hi)/2;if(divertorFlux(0,z)<level)lo=z;else hi=z;}return (lo+hi)/2;}
export function fluxContour(level:number):[number,number][] {
  if(!(level>0&&level<=separatrixFlux))throw new Error('Closed contour must be inside separatrix');
  let lo=-1,hi=0;
  for(let i=0;i<45;i++){const z=(lo+hi)/2;if(divertorFlux(0,z)>level)lo=z;else hi=z;}
  const bottom=(lo+hi)/2,top=upperRoot(level);
  const side=Array.from({length:101},(_,i):[number,number]=>{const z=bottom+(top-bottom)*(1-Math.cos(i/100*Math.PI))/2;return [Math.sqrt(Math.max(0,2*level-z*z-2*z*z*z/3)),z];});
  return [...side,...side.slice(0,-1).reverse().map(([x,z]):[number,number]=>[-x,z]),side[0]];
}
export function divertorPoint(x:number,z:number,phi:number):Vec3 {
  const R=3+.8*Math.sqrt(3)*x;return [R*Math.cos(phi),R*Math.sin(phi),.95*z];
}
export function openLeg(level:number,sign:1|-1):Vec3[] {
  if(!(level>separatrixFlux&&level<.3))throw new Error('Open line must be outside separatrix');
  let x=Math.sqrt(2*level),z=0,phi=.4;
  const data:Vec3[]=[divertorPoint(x,z,phi)],dt=.012*sign;
  const rhs=(a:number,b:number)=>[b+b*b,-a];
  for(let i=0;i<16000&&z>-1.65;i++){
    const a=rhs(x,z),b=rhs(x+a[0]*dt/2,z+a[1]*dt/2),c=rhs(x+b[0]*dt/2,z+b[1]*dt/2),d=rhs(x+c[0]*dt,z+c[1]*dt);
    const nx=x+dt/6*(a[0]+2*b[0]+2*c[0]+d[0]),nz=z+dt/6*(a[1]+2*b[1]+2*c[1]+d[1]);
    const fraction=nz< -1.65?(-1.65-z)/(nz-z):1;
    x+=(nx-x)*fraction;z+=(nz-z)*fraction;phi+=Math.abs(dt)*2.6*fraction;
    data.push(divertorPoint(x,z,phi));
  }
  if(z> -1.649)throw new Error('Open field line did not reach target');
  return data;
}
export function exhaustPower(power:number,radiated:number,expansion:number){
  if(![power,radiated,expansion].every(Number.isFinite)||power<0||radiated<0||radiated>1||expansion<=0)throw new Error('Invalid exhaust controls');
  const target=power*(1-radiated),area=2*Math.PI*6*.05*expansion;
  return {target,radiated:power*radiated,area,heatFlux:target/area};
}