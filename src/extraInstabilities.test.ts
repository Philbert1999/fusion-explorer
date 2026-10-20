import {it,expect} from 'vitest';
import {relaxation} from './extraInstabilities';
import {localPoint} from './instability';
it('repeats prescribed relaxation cycles and confines ELM bursts to the edge phase',()=>{
 expect(relaxation(.8)).toBeCloseTo(1);expect(relaxation(1)).toBe(0);
 expect(relaxation(2.4)).toBeCloseTo(relaxation(.4));
 const radius=(t:number)=>{const p=localPoint('elm',0,0,t);return Math.hypot(p[0],p[1])-3;};
 expect(radius(.2)).toBeCloseTo(.92);
 expect(radius(.825)).toBeGreaterThan(1.2);
 expect(radius(1.2)).toBeCloseTo(radius(.2));
});
it('keeps the RWM illustrative displacement bounded and increasing',()=>{
 const displacement=(t:number)=>localPoint('rwm',0,0,t)[0]-3.72;
 expect(displacement(0)).toBeCloseTo(0);
 expect(displacement(4)).toBeGreaterThan(displacement(1));
 expect(displacement(4)).toBeLessThan(.32);
});
