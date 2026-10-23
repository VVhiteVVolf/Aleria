import { BATTLE_SHIPS, BATTLE_GROUPS, SHIP_MODELS } from './battle-fleets.mjs';
import { shipAt, battleCamera, smooth } from './battle-simulation.mjs';
import { renderBattleEffects, createBattleEffects } from './battle-effects.mjs';

const art='../assets/battles/wellenruh/v2/';
const transform=point=>`translate(${point.x.toFixed(2)} ${(point.y+point.bob).toFixed(2)}) rotate(${point.angle.toFixed(2)})`;
export function renderBattleMap() {
  return `<svg class="battle-map" viewBox="0 0 1100 670" role="img" aria-labelledby="battle-map-title battle-map-description">
  <title id="battle-map-title">Die Flotten vor Wellenruh</title><desc id="battle-map-description">Eine eigens illustrierte Seekarte und 57 individuelle Schiffe. Grüne und rote Flaggschiffe, Enterschiffe, leichte Langschiffe und Bogenschiffe. Die Animation zeigt Anfahrt, Pfeilsalven, Umfassung, Enterkampf, Verluste und Rückzug.</desc>
  <defs><radialGradient id="battle-vignette"><stop offset=".45" stop-color="#071c24" stop-opacity="0"/><stop offset="1" stop-color="#071c24" stop-opacity=".35"/></radialGradient><marker id="battle-route-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M1 1L9 5L1 9" fill="none" stroke="#f0d9a1" stroke-width="1.5"/></marker></defs>
  <g data-battle-camera><image data-battle-art class="battle-chart-image" href="${art}seekarte-v2.webp" x="0" y="-9" width="1100" height="688" preserveAspectRatio="xMidYMid slice"/>
    <g class="battle-sea-glints" data-battle-sea aria-hidden="true"><path d="M260 275q30-12 65 0m450-160q30-12 65 0M180 560q30-12 65 0m575-70q30-12 65 0"/><path d="M350 70q20-8 42 0m-20 520q20-8 42 0m550-360q20-8 42 0"/></g>
    <g class="battle-chart-writing"><text x="80" y="290" transform="rotate(-10 80 290)">Wellenruh</text><text class="battle-sea-name" x="580" y="58" text-anchor="middle">Ostsee von Aldrimar</text></g>
    <g data-battle-routes class="battle-routes" fill="none" stroke="#f0d9a1" stroke-opacity=".65" stroke-width="2" stroke-dasharray="5 8" marker-end="url(#battle-route-arrow)"><path d="M380 340H512"/><path d="M780 340H642"/><g data-battle-flanks opacity="0"><path d="M400 132Q611 39 742 240"/><path d="M390 538Q590 632 747 432"/></g><g data-battle-retreat opacity="0"><path d="M824 324Q926 275 1037 263"/><path d="M825 405Q924 476 1038 503"/></g></g>
    <g class="battle-ships">${BATTLE_SHIPS.map(ship=>{
      const model=SHIP_MODELS[ship.model], size=model.size;
      return `<g data-ship="${ship.id}" data-side="${ship.side}" data-model="${ship.model}" data-group="${ship.group}" transform="${transform(shipAt(ship,0))}"><title>${ship.commander || model.label} · ${ship.side==='green'?'Die Grünen':'Die Roten'}</title><g data-wake class="battle-wake"><path d="M-7 21Q-15 35-18 59M7 21Q15 35 18 59M-4 29V65M4 29V59"/><path d="M-8-23Q0-32 8-23"/></g><ellipse class="battle-ship-halo" rx="25" ry="39"/><g data-vessel><image data-battle-art href="${art}${model.file}" x="${-size/2}" y="${-size/2}" width="${size}" height="${size}"/>${ship.flagship?'<circle class="battle-admiral-star" cy="-40" r="3"/>':''}</g><g data-captured opacity="0"><path d="M0-28V-47L18-41L0-35" fill="#9cc477" stroke="#253d2c" stroke-width="1.5"/></g><g data-wreck opacity="0"><path d="M-10-3L-3-11L4 0L11 7M-8 9L7-8M-3 12L4 17" fill="none" stroke="#b49564" stroke-width="4"/><ellipse data-ripple rx="24" ry="11" fill="none" stroke="#c6e3d7" stroke-width="1.2"/></g></g>`;
    }).join('')}</g>
    <g class="battle-group-labels">${BATTLE_GROUPS.map(group=>`<g data-map-group-label="${group.id}"><text text-anchor="middle">${group.name.split(' ')[0]}</text></g>`).join('')}</g>
    ${renderBattleEffects()}
  </g><rect width="1100" height="670" fill="url(#battle-vignette)" pointer-events="none"/>
  <g class="battle-compass" transform="translate(1024 72)"><circle r="28"/><path d="M0-24L5 0L0 24L-5 0ZM-24 0L0-5L24 0L0 5Z"/><text y="-36" text-anchor="middle">N</text></g>
  <text class="battle-chart-footnote" x="1090" y="654" text-anchor="end">Schematische Rekonstruktion · keine maßstäbliche Seekarte</text></svg>`;
}

export function createBattleMap(root) {
  const vessels=BATTLE_SHIPS.map(ship=>{const node=root.querySelector(`[data-ship="${ship.id}"]`);return {ship,node,vessel:node.querySelector('[data-vessel]'),wake:node.querySelector('[data-wake]'),wreck:node.querySelector('[data-wreck]'),captured:node.querySelector('[data-captured]'),ripple:node.querySelector('[data-ripple]')};});
  const labels=BATTLE_GROUPS.map(group=>({group,node:root.querySelector(`[data-map-group-label="${group.id}"]`),ship:BATTLE_SHIPS.find(ship=>ship.side===group.side&&ship.index===group.leader)}));
  const camera=root.querySelector('[data-battle-camera]'), effects=createBattleEffects(root);
  const flanks=root.querySelector('[data-battle-flanks]'), retreat=root.querySelector('[data-battle-retreat]'), sea=root.querySelector('[data-battle-sea]');
  return Object.freeze({
    update(progress,{cinematic=true,detail=true}={}) {
      const lens=battleCamera(progress,cinematic);
      camera.setAttribute('transform',`translate(550 335) scale(${lens.zoom.toFixed(4)}) translate(${-lens.x} ${-lens.y})`);
      sea.setAttribute('transform',`translate(${Math.sin(progress*3)*7} ${progress*1.4})`);
      sea.setAttribute('opacity',(.35+Math.sin(progress*6)*.12).toFixed(3));
      for (const {ship,node,vessel,wake,wreck,captured,ripple} of vessels) {
        const point=shipAt(ship,progress), isCaptured=ship.lossMode==='captured';
        node.setAttribute('transform',transform(point));
        vessel.setAttribute('opacity',(isCaptured?1-point.loss*.45:1-point.loss).toFixed(3));
        vessel.setAttribute('transform',`scale(${point.scale.toFixed(3)})`);
        wake.setAttribute('opacity',((1-point.loss)*(.3+Math.sin(progress*19+ship.index)*.1)).toFixed(3));
        captured.setAttribute('opacity',isCaptured?point.loss.toFixed(3):'0');
        wreck.setAttribute('opacity',isCaptured?'0':(point.loss*.8).toFixed(3));
        ripple.setAttribute('rx',(20+point.loss*20).toFixed(2));
        ripple.setAttribute('ry',(8+point.loss*9).toFixed(2));
      }
      for (const {node,ship} of labels) {
        const point=shipAt(ship,progress);
        node.setAttribute('transform',`translate(${point.x.toFixed(2)} ${(point.y-49).toFixed(2)})`);
        node.setAttribute('opacity',(1-point.loss).toFixed(3));
      }
      flanks.setAttribute('opacity',smooth(progress-1).toFixed(3));
      retreat.setAttribute('opacity',smooth(progress-4).toFixed(3));
      effects.update(progress,detail);
    },
    highlight(group) {for(const vessel of vessels)vessel.node.classList.toggle('is-focused',vessel.ship.group===group);},
    showRoutes(show) {root.querySelector('[data-battle-routes]').setAttribute('visibility',show?'visible':'hidden');}
  });
}
