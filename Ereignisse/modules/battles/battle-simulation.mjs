import { BATTLE_PHASES } from './wellenruh-data.mjs';
export { BATTLE_SHIPS } from './battle-fleets.mjs';
export const BATTLE_DURATION = 72;
export const LAST_PHASE = BATTLE_PHASES.length - 1;
export const clampProgress = value => Math.max(0, Math.min(LAST_PHASE, Number(value) || 0));
export const phaseAt = progress => Math.min(LAST_PHASE, Math.floor(clampProgress(progress) + .00001));
export const smooth = value => { const t = Math.max(0, Math.min(1, value)); return t*t*(3-2*t); };
// Freie Kurven statt gemeinsam verschobener starrer Rechtecke. Keine maßstäbliche Seekarte.
const tracks = {
  'green-center': [[350,340],[488,338],[515,336],[555,334],[649,332],[711,329]],
  'green-north': [[349,156],[414,124],[596,126],[699,224],[772,270],[825,207]],
  'green-south': [[315,523],[407,548],[579,531],[690,438],[760,417],[822,487]],
  'red-center': [[824,340],[635,338],[635,336],[642,340],[795,342],[975,340]],
  'red-north': [[833,180],[681,206],[669,242],[726,248],[846,198],[995,147]],
  'red-south': [[833,502],[679,477],[674,445],[718,438],[847,492],[995,552]]
};
function spline(group, value) {
  const points = tracks[group], phase = phaseAt(value), t = clampProgress(value)-phase;
  const a=points[Math.max(0,phase-1)], b=points[phase], c=points[Math.min(5,phase+1)], d=points[Math.min(5,phase+2)];
  return [0,1].map(axis => .5*((2*b[axis])+(-a[axis]+c[axis])*t+(2*a[axis]-5*b[axis]+4*c[axis]-d[axis])*t*t+(-a[axis]+3*b[axis]-3*c[axis]+d[axis])*t*t*t));
}
function rawPosition(ship, progress) {
  const envelope=Math.sin(Math.PI*progress/LAST_PHASE);
  const delayed = clampProgress(progress - (.025+ship.seed*.21)*envelope);
  const point = spline(ship.group, delayed);
  const before=spline(ship.group, Math.max(0,delayed-.004)), after=spline(ship.group,Math.min(5,delayed+.004));
  let angle = Math.atan2(after[1]-before[1],after[0]-before[0])*180/Math.PI+90;
  const reaction=Math.sin(Math.PI*smooth((progress-1.3)/2.15));
  const wing=ship.group==='red-north'?-1:ship.group==='red-south'?1:Math.sign(ship.offsetY);
  const retreat=smooth((progress-(3.05+ship.seed*.65))/.9);
  // Einzelne rote Schiffe wenden sich den grünen Flanken zu; ihre Rückzüge beginnen versetzt.
  if(ship.side==='red') angle=270+retreat*180-wing*reaction*(31+ship.seed*32)*(1-retreat);
  let x=ship.offsetX, y=ship.offsetY;
  if (ship.group === 'green-north') {
    const wedge = [[48,0],[8,-30],[8,0],[8,30],[-32,-60],[-32,-30],[-32,0],[-32,30],[-32,60]][ship.slot];
    const blend=smooth((progress-(.85+ship.seed*.25))/.9)*.82, turn=(angle-90)*Math.PI/180;
    x += ((wedge[0]+Math.sin(ship.seed*20)*8)*Math.cos(turn)-(wedge[1]+Math.cos(ship.seed*17)*7)*Math.sin(turn)-x)*blend;
    y += ((wedge[0]+Math.sin(ship.seed*20)*8)*Math.sin(turn)+(wedge[1]+Math.cos(ship.seed*17)*7)*Math.cos(turn)-y)*blend;
  }
  const scatter=ship.side==='red' ? smooth(progress-3.7) : 0;
  const curl=Math.sin(progress*(2.8+ship.seed)+ship.seed*13)*envelope;
  const recoil=Math.sin(progress*(7+ship.seed*3)+ship.index)*smooth(progress-.8)*(1-smooth(progress-3.7));
  const reacting=ship.side==='red'?reaction:0;
  return {x:point[0]+x+scatter*Math.sin(ship.index*2)*19+curl*(5+ship.seed*9)+recoil*4-reacting*(8+ship.seed*15),
    y:point[1]+y+scatter*Math.cos(ship.index*3)*18+curl*(5+ship.seed*8)+reacting*wing*(16+ship.seed*27),
    angle:angle+curl*(4+ship.seed*7)};
}
export function shipAt(ship, progress) {
  const value=clampProgress(progress), loss=ship.lost ? smooth((value-ship.lossStart)/.6) : 0;
  const position=rawPosition(ship, ship.lost ? Math.min(value,ship.lossStart+.17) : value);
  return {...position,loss,angle:position.angle+(ship.lossMode==='sunk' ? loss*37 : 0),
    bob:Math.sin(value*23+ship.index)*1.1*(1-loss),scale:ship.lossMode==='sunk' ? 1-loss*.72 : 1};
}
export function advanceBattle(progress, elapsedSeconds, speed=1) {
  return clampProgress(clampProgress(progress)+Math.max(0,elapsedSeconds)*speed*LAST_PHASE/BATTLE_DURATION);
}
export function battleCamera(progress, enabled=true) {
  if (!enabled) return {x:550,y:335,zoom:1};
  const focus=smooth((progress-1.3)/1.2)*(1-smooth((progress-4.15)/.85));
  return {x:550+focus*75,y:335,zoom:1+focus*.24};
}
