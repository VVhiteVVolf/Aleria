import { readFile } from 'node:fs/promises';

const WORKER_SOURCE_PATTERN = /const ml = "([A-Za-z0-9+/=]+)"/;
const BOUNDARY_FUNCTION_PATTERN = /let me=\[\];const be=\(_,t\)=>\{.*?\},Oe=\(\)=>\{/s;
const START_POSITION_PATTERN = /fe=\(\)=>\{.*?\},Il=_=>\{/s;
const DIE_START_PATTERN = /,Q=Ol\(Ot\[U\]\.convexHull,\{mass:v,scaling:Ot\[U\]\.scaling,pos:p\.startPosition\}\)/;
const THROW_FUNCTION_PATTERN = /\},ge=_=>\{.*?\},Be=_=>\{/s;

function replaceExactlyOnce(source, pattern, replacement, label) {
  const matches = source.match(new RegExp(pattern.source, pattern.flags.includes('g') ? pattern.flags : `${pattern.flags}g`)) || [];
  if (matches.length !== 1) throw new Error(`Dice-Box-Patch erwartet genau eine ${label}-Fundstelle, gefunden: ${matches.length}.`);
  return source.replace(pattern, replacement);
}

export function patchDiceBoxPhysicsSource(source) {
  const workerMatch = String(source).match(WORKER_SOURCE_PATTERN);
  if (!workerMatch) throw new Error('Der eingebettete Dice-Box-Physikworker wurde nicht gefunden.');

  let workerSource = Buffer.from(workerMatch[1], 'base64').toString('utf8');
  workerSource = replaceExactlyOnce(
    workerSource,
    BOUNDARY_FUNCTION_PATTERN,
    `let me=[];const ALERIA_ELLIPSE_BOUNDARY="v1",be=(_,t)=>{
const f=[],g=(shape,pos,angle=0)=>{const quat=[0,Math.sin(-angle/2),0,Math.cos(angle/2)],body=Ol(shape,{mass:0,pos,quat});Z.addRigidBody(body);f.push(body);return body};
g(new d.btBoxShape(P(_*yt,1,_)),[0,-.5,0]);
g(new d.btBoxShape(P(_*yt,1,_)),[0,t-.5,0]);
const segments=Math.max(12,Math.min(48,Math.round(Number(p.boundarySegments)||28))),rx=_*yt/2*(Number(p.boundaryInsetX)||.78),rz=_/2*(Number(p.boundaryInsetY)||.8),thickness=Math.max(.35,Number(p.boundaryThickness)||.65);
for(let index=0;index<segments;index+=1){const a=index/segments*Math.PI*2,b=(index+1)/segments*Math.PI*2,x1=Math.cos(a)*rx,z1=Math.sin(a)*rz,x2=Math.cos(b)*rx,z2=Math.sin(b)*rz,dx=x2-x1,dz=z2-z1,length=Math.hypot(dx,dz),angle=Math.atan2(dz,dx);g(new d.btBoxShape(P(length/2+thickness*.6,t,thickness)),[(x1+x2)/2,0,(z1+z2)/2],angle)}
me.length&&Oe(),me=[...f]},Oe=()=>{`,
    'Begrenzungsfunktion'
  );
  workerSource = replaceExactlyOnce(
    workerSource,
    START_POSITION_PATTERN,
    `fe=()=>{const angle=Math.random()*Math.PI*2,rx=p.size*yt/2*(Number(p.boundaryInsetX)||.78),rz=p.size/2*(Number(p.boundaryInsetY)||.8),radius=dt(.72,.84,Math.random()),heightJitter=Math.max(0,Math.min(.4,Number(p.launchHeightJitter)||.2));p.startPosition=[Math.cos(angle)*rx*radius,p.startingHeight*dt(1-heightJitter,1+heightJitter,Math.random()),Math.sin(angle)*rz*radius],p.launchAngle=angle},Il=_=>{`,
    'Startpunktfunktion'
  );
  workerSource = replaceExactlyOnce(
    workerSource,
    DIE_START_PATTERN,
    `,Q=(fe(),Ol(Ot[U].convexHull,{mass:v,scaling:Ot[U].scaling,pos:p.startPosition}))`,
    'individuelle Würfelstartposition'
  );
  workerSource = replaceExactlyOnce(
    workerSource,
    THROW_FUNCTION_PATTERN,
    `},ge=_=>{
const ALERIA_DICE_DYNAMICS="v1",x=p.startPosition[0],z=p.startPosition[2],centerAngle=Math.atan2(-z,-x),spread=Math.max(.08,Math.min(1.1,Number(p.launchAngleJitter)||.45)),angle=centerAngle+dt(-spread,spread,Math.random()),speed=p.throwForce*dt(.86,1.22,Math.random()),vertical=-dt(.35,1.65,Math.random());
_.setLinearVelocity(P(Math.cos(angle)*speed,vertical,Math.sin(angle)*speed));
const tumble=Math.max(.25,Math.min(1.8,Number(p.tumbleForce)||1)),spin=p.spinForce*40*tumble;
_.setAngularVelocity(P(dt(-spin,spin,Math.random()),dt(-spin,spin,Math.random()),dt(-spin,spin,Math.random())));
const impulse=p.spinForce*dt(.45,1.1,Math.random()),offset=Math.abs(p.scale-1)+p.scale*p.scale*(_.mass/p.mass)*.62;
_.applyImpulse(P(Math.cos(angle)*impulse,dt(-impulse*.5,impulse*.5,Math.random()),Math.sin(angle)*impulse),P(dt(-offset,offset,Math.random()),dt(-offset,offset,Math.random()),dt(-offset,offset,Math.random())))},Be=_=>{`,
    'Wurfimpulsfunktion'
  );

  const encodedWorker = Buffer.from(workerSource, 'utf8').toString('base64');
  return String(source).replace(workerMatch[1], encodedWorker);
}

export function createDiceBoxPhysicsPlugin() {
  return {
    name: 'aleria-dice-box-physics',
    setup(build) {
      build.onLoad({ filter: /[\\/]@3d-dice[\\/]dice-box[\\/]dist[\\/]dice-box\.es\.js$/ }, async args => ({
        contents: patchDiceBoxPhysicsSource(await readFile(args.path, 'utf8')),
        loader: 'js'
      }));
    }
  };
}
