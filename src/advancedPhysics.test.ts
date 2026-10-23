import {expect,it} from 'vitest';
import {heatingState,profileQ,rationalRadius,fluxContour,divertorFlux,separatrixFlux,openLeg,exhaustPower} from './advancedPhysics';
it('separates deposited energy and directional current drive',()=>{
  expect(heatingState(0,4,'ec',1).stored).toBe(0);
  expect(heatingState(10,4,'ec',0).current).toBe(0);
  expect(heatingState(10,4,'ic',1).current).toBe(0);
  expect(heatingState(10,4,'ec',1).current).toBe(-heatingState(10,4,'ec',-1).current);
  expect(heatingState(20,4,'nbi',1).stored).toBeGreaterThan(heatingState(2,4,'nbi',1).stored);
  const a=heatingState(2,4,'ohmic',1),dt=.0001;
  expect((heatingState(2+dt,4,'ohmic',1).stored-a.stored)/dt).toBeCloseTo(a.absorbed-a.loss,3);
});
it('relates current peaking to central q and locates rational surfaces',()=>{
  expect(profileQ(0,3,2)).toBe(1);expect(profileQ(1,3,2)).toBe(3);
  const r=rationalRadius(1.5,3,2)!;expect(profileQ(r,3,2)).toBeCloseTo(1.5,8);
  expect(rationalRadius(.5,3,2)).toBeNull();
  expect(profileQ(.5,3,0)).toBeCloseTo(3,8);
});
it('uses closed flux contours inside a genuine X-point level set',()=>{
  expect(divertorFlux(0,-1)).toBeCloseTo(separatrixFlux,14);
  for(const psi of [.04,.1,separatrixFlux])for(const [x,z] of fluxContour(psi))expect(divertorFlux(x,z)).toBeCloseTo(psi,8);
});
it('open helical field lines preserve flux and terminate on both targets',()=>{
  for(const sign of [1,-1] as const){const path=openLeg(.18,sign),end=path.at(-1)!;
    expect(end[2]).toBeCloseTo(-1.65*.95,8);
    expect(Math.hypot(end[0],end[1])>3).toBe(sign===1);
    for(const p of path){const x=(Math.hypot(p[0],p[1])-3)/(.8*Math.sqrt(3));expect(divertorFlux(x,p[2]/.95)).toBeCloseTo(.18,5);}
  }
});
it('accounts for radiation and targets without creating power',()=>{
  const a=exhaustPower(8,.3,1),b=exhaustPower(8,.3,4);
  expect(a.target+a.radiated).toBe(8);expect(b.heatFlux).toBeCloseTo(a.heatFlux/4);
  expect(()=>exhaustPower(8,1.1,1)).toThrow();
});