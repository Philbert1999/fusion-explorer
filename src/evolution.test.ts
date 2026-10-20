import {it,expect} from 'vitest';
import {driftTrack,orbit} from './particles';
import {diffusionSigma} from './instability';
import {advanceProgress} from './playback';
it('extending drift horizon doubles actual time and displacement, rather than slowing the same trace',()=>{
 const short=driftTrack(10,45,2000,1,8).at(-1)!;
 const long=driftTrack(10,45,2000,1,16).at(-1)!;
 expect(long.t).toBeCloseTo(2*short.t,12);
 expect(long.xyz[2]).toBeCloseTo(2*short.xyz[2]);
 expect(()=>driftTrack(10,45,2000,1,0)).toThrow();
 // Same playback interval advances the same physical time at a fixed rate.
 expect(advanceProgress(0,1,8/(8/6))*8).toBeCloseTo(advanceProgress(0,1,16/(8/6))*16);
});
it('longer integration and normalized evolution produce later states',()=>{
 expect(orbit(100,75,200).points.at(-1)!.t).toBeCloseTo(200e-6,10);
 expect(diffusionSigma(4)).toBeGreaterThan(diffusionSigma(1));
});
