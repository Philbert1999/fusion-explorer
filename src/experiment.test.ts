import {expect,it} from 'vitest';
import {shotFrame,densityAt,chordIntegral,diagnosticSamples,diagnosticChords,fitDensity} from './experiment';
it('links startup, heating, flat top and shutdown to a repeatable shot',()=>{
  expect(shotFrame(0).density).toBe(0);expect(shotFrame(4).phase).toBe(1);
  expect(shotFrame(7).phase).toBe(2);expect(shotFrame(12).phase).toBe(3);
  expect(shotFrame(20).phase).toBe(4);expect(shotFrame(23).density).toBe(0);
  expect(shotFrame(36).shot).toBe(2);expect(shotFrame(36).current).toBe(shotFrame(12).current);
  expect(shotFrame(12).energy).toBeGreaterThan(0);
});
it('integrates a known parabolic density and symmetric chords in physical length',()=>{
  expect(chordIntegral(0,1,1)).toBeCloseTo(4*.8*1.4/3,3);
  expect(chordIntegral(.4,2,1.5)).toBeCloseTo(chordIntegral(-.4,2,1.5),10);
  expect(chordIntegral(1.2,1,1)).toBe(0);expect(densityAt(0,0,2,1)).toBe(2);
  expect(chordIntegral(0,1,2,.3)).toBeLessThan(chordIntegral(0,1,2));
});
it('extends actual sampling time, preserves old samples and zero noise',()=>{
  const a=diagnosticSamples(12,.5,.2,1.5,.1,0),b=diagnosticSamples(36,.5,.2,1.5,.1,0);
  expect(b.slice(0,a.length)).toEqual(a);expect(b.at(-1)?.time).toBe(36);
  expect(a.every(v=>v.measured===v.ideal)).toBe(true);
  expect(()=>diagnosticSamples(20,0,0,1,0,0)).toThrow();
});
it('recovers amplitude and shape from multiple synthetic chords, refuses one chord',()=>{
  const signals=diagnosticChords.map(x=>chordIntegral(x,.8,2.25,.15));
  const fit=fitDensity(diagnosticChords,signals,.15)!;
  expect(fit.amplitude).toBeCloseTo(.8,8);expect(fit.peaking).toBeCloseTo(2.25,8);
  expect(fitDensity([0],[1],0)).toBeNull();
});