import { readFile } from 'node:fs/promises';

const WORKER_SOURCE_PATTERN = /const ml = "([A-Za-z0-9+/=]+)"/;
const BOUNDARY_FUNCTION_PATTERN = /let me=\[\];const be=\(_,t\)=>\{.*?\},Oe=\(\)=>\{/s;
const START_POSITION_PATTERN = /fe=\(\)=>\{.*?\},Il=_=>\{/s;

function replaceExactlyOnce(source, pattern, replacement, label) {
  const matches = source.match(new RegExp(pattern.source, pattern.flags.includes('g') ? pattern.flags : `${pattern.flags}g`)) || [];
  if (matches.length !== 1) throw new Error(`Dice-Box-Patch erwartet genau eine ${label}-Fundstelle, gefunden: ${matches.length}.`);
  return source.replace(pattern, replacement);
}

export function patchDiceBoxBoundarySource(source) {
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
    `fe=()=>{const angle=Math.random()*Math.PI*2,rx=p.size*yt/2*(Number(p.boundaryInsetX)||.78)*.82,rz=p.size/2*(Number(p.boundaryInsetY)||.8)*.82;p.startPosition=[Math.cos(angle)*rx,p.startingHeight,Math.sin(angle)*rz]},Il=_=>{`,
    'Startpunktfunktion'
  );

  const encodedWorker = Buffer.from(workerSource, 'utf8').toString('base64');
  return String(source).replace(workerMatch[1], encodedWorker);
}

export function createDiceBoxBoundaryPlugin() {
  return {
    name: 'aleria-dice-box-ellipse-boundary',
    setup(build) {
      build.onLoad({ filter: /[\\/]@3d-dice[\\/]dice-box[\\/]dist[\\/]dice-box\.es\.js$/ }, async args => ({
        contents: patchDiceBoxBoundarySource(await readFile(args.path, 'utf8')),
        loader: 'js'
      }));
    }
  };
}
