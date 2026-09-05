import test from 'node:test';
import assert from 'node:assert/strict';
import { GRAVITY, ORIGIN, BINS, BALL_RADIUS, launchVelocity, integrate, entersBin, rimCollision } from '../lib/physics.ts';
test('constant gravity matches the analytic trajectory at every preview interval',()=>{
  for(const power of [0,25,47,75,100]){const p={...ORIGIN},v=launchVelocity(.13,power),initial={...v};for(let i=1;i<=480;i++){integrate(p,v,1/240);if(i%12===0){const t=i/240;assert.ok(Math.abs(p.y-(ORIGIN.y+initial.y*t-.5*GRAVITY*t*t))<1e-10);assert.ok(Math.abs(p.z-(ORIGIN.z+initial.z*t))<1e-10);}}}
});
test('each room is winnable with the same physics and available controls',()=>{
  for(const bin of BINS){const dz=ORIGIN.z-bin.z,dx=bin.x-ORIGIN.x,aim=Math.atan2(dx,dz);let winners=0;for(let power=0;power<=100;power+=.5){const p={...ORIGIN},v=launchVelocity(aim,power);for(let i=0;i<1000&&p.y>0;i++){const prev={...p};integrate(p,v,1/240);rimCollision(p,v,bin);if(v.y<0&&entersBin(prev,p,bin)){winners++;break;}}}assert.ok(winners>=4,`Basket must permit forgiving power interval; got ${winners}`);}
});
test('basket counts only downward crossings within ball clearance',()=>{const b=BINS[0];assert.equal(entersBin({x:b.x,y:1.1,z:b.z},{x:b.x,y:.7,z:b.z},b),true);assert.equal(entersBin({x:b.x,y:.7,z:b.z},{x:b.x,y:1.1,z:b.z},b),false);assert.equal(entersBin({x:b.x+b.radius,y:1.1,z:b.z},{x:b.x+b.radius,y:.7,z:b.z},b),false);assert.equal(entersBin({x:b.x,y:.6,z:b.z},{x:b.x,y:.5,z:b.z},b),false);});
test('rim contact rebounds and a centered shot remains untouched',()=>{const b=BINS[0],p={x:b.x+b.radius,y:b.height+BALL_RADIUS-.005,z:b.z},v={x:0,y:-3,z:0};assert.equal(rimCollision(p,v,b),true);assert.ok(v.y>0);assert.equal(rimCollision({x:b.x,y:b.height,z:b.z},{x:0,y:-3,z:0},b),false);});
