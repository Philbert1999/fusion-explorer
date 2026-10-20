import {it,expect} from 'vitest';
import {isMicro,microSignal,microLessons} from './microinstability';
it('keeps scalar waves field elongated, initially zero and bounded by the envelope',()=>{
 for(const kind of Object.keys(microLessons) as (keyof typeof microLessons)[]) {
  expect(isMicro(kind)).toBe(true);
  expect(microSignal(kind,.1,.4,0)).toBeCloseTo(0);
  for(let t=0;t<=1;t+=.1){
   expect(Math.abs(microSignal(kind,.1,.4,t))).toBeLessThanOrEqual(t);
   expect(microSignal(kind,.1,.4,t)).toBeCloseTo(microSignal(kind,.7,.7,t));
  }
 }
 expect(isMicro('tearing')).toBe(false);
});

