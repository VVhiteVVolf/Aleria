import { smooth } from './battle-simulation.mjs';

export const BATTLE_BEATS = Object.freeze([
  { at:0, text:'Die Flotten gehen aufeinander zu.', place:'Vor Wellenruh' },
  { at:.72, text:'Pfeile über der ersten Linie.', place:'Zwischen den Flotten' },
  { at:1.08, text:'Die Flaggschiffe gehen in den Nahkampf.', place:'Im Zentrum' },
  { at:1.52, text:'Ragnar Silberblut fällt früh im Gefecht.', place:'Roter Flankenverband' },
  { at:1.92, text:'Hallvards Langschiffe brechen in Keilformation hervor.', place:'Die Umfassung beginnt' },
  { at:2.18, text:'Rote Schiffe schwenken den angreifenden Flanken entgegen.', place:'Rekonstruierte Gegenmanöver' },
  { at:2.5, text:'Fenrir und Detlaff kämpfen um die Gegenflanke.', place:'An der Flanke' },
  { at:2.93, text:'Hrolfr entert Ravelds Flaggschiff.', place:'Der entscheidende Enterkampf' },
  { at:3.18, text:'Raveld fällt. Sein Flaggschiff sinkt.', place:'Das Zentrum bricht' },
  { at:3.42, text:'Fenrir bezwingt Detlaff Schwarzblut.', place:'Die rote Flanke weicht' },
  { at:3.94, text:'Hallvard treibt seinen Keil in den Kern der Roten.', place:'Der letzte Stoß' },
  { at:4.48, text:'Rückzug nach Silberquell und Nebelwacht.', place:'Die Entscheidung' },
  { at:5, text:'Sieg der Grünen. Die Ostsee liegt in ihrer Hand.', place:'Nach der Schlacht' }
].map(Object.freeze));
export const beatAt = progress => BATTLE_BEATS.findLast(beat=>beat.at<=progress) || BATTLE_BEATS[0];

export function arrowAt(index, progress) {
  const active=progress>.62 && progress<2.74;
  const t=((progress*6.5+index*.069)%1+1)%1;
  const row=index%6, from={x:652+(index%3)*18,y:270+row*25}, to={x:480+(index%4)*16,y:270+row*26};
  const dx=to.x-from.x, dy=to.y-from.y;
  return {x:from.x+dx*t,y:from.y+dy*t-Math.sin(Math.PI*t)*62,
    angle:Math.atan2(dy-Math.cos(Math.PI*t)*Math.PI*62,dx)*180/Math.PI,
    opacity:active ? Math.sin(Math.PI*t)*.92 : 0};
}
export function renderBattleEffects() {
  return `<g data-battle-effects aria-hidden="true">
    ${Array.from({length:24},(_,i)=>`<g data-battle-arrow="${i}" opacity="0"><path d="M-7 0H7M3-3L7 0L3 3M-7-2L-4 0L-7 2" fill="none" stroke="#e9d2a0" stroke-width="1.5"/></g>`).join('')}
    ${Array.from({length:14},(_,i)=>`<g data-battle-impact="${i}" opacity="0"><path d="M-9 0H9M0-9V9M-5-5L5 5M-5 5L5-5" fill="none" stroke="#f7df9c" stroke-width="2"/><circle r="13" fill="none" stroke="#f3d592" stroke-width="1.4"/></g>`).join('')}
    <g data-battle-boarding opacity="0"><path d="M562 323L610 335M562 338L610 346" stroke="#d3b476" stroke-width="3" stroke-dasharray="4 3"/><text x="586" y="297" text-anchor="middle">ENTERKAMPF</text></g>
  </g>`;
}
export function createBattleEffects(root) {
  const arrows=[...root.querySelectorAll('[data-battle-arrow]')];
  const impacts=[...root.querySelectorAll('[data-battle-impact]')];
  const boarding=root.querySelector('[data-battle-boarding]');
  return Object.freeze({ update(progress, enabled=true) {
    root.querySelector('[data-battle-effects]').setAttribute('visibility',enabled?'visible':'hidden');
    if (!enabled) return;
    arrows.forEach((node,index)=>{
      const point=arrowAt(index,progress);
      node.setAttribute('transform',`translate(${point.x.toFixed(2)} ${point.y.toFixed(2)}) rotate(${point.angle.toFixed(1)})`);
      node.setAttribute('opacity',point.opacity.toFixed(3));
    });
    impacts.forEach((node,index)=>{
      const active=progress>.95 && progress<4.36;
      const cycle=(progress*7+index*.191)%1, intensity=Math.max(0,1-cycle*3.8);
      const x=index<8?537+index%3*30:699+(index%3)*17;
      const y=index<8?282+Math.floor(index/3)*35:index%2?235:447;
      node.setAttribute('transform',`translate(${x} ${y}) rotate(${index*27}) scale(${(.4+cycle*.9).toFixed(2)})`);
      node.setAttribute('opacity',active?intensity.toFixed(3):'0');
    });
    boarding.setAttribute('opacity',(smooth((progress-2.7)/.2)*(1-smooth((progress-3.3)/.3))).toFixed(3));
  } });
}
