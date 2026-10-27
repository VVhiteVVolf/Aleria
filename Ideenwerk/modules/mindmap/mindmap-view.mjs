import {escapeHtml as h} from '../ui/html.mjs';
import {icon} from '../ui/icons.mjs';
import {edgeGeometry} from './mindmap-geometry.mjs';
const fill={peach:'#f6dfd1',sage:'#dfe9d7',lavender:'#e5e0f1',sand:'#eee3ce',rose:'#eedbe0',butter:'#f5edc6'};
export function renderMapSvg(map,{mini=false,selected=null,connecting=null}={}) {
  const nodes=new Map(map.nodes.map(node=>[node.id,node]));
  const left=Math.min(0,...map.nodes.map(node=>node.x-50)),top=Math.min(0,...map.nodes.map(node=>node.y-50));
  const box=mini?`${left} ${top} ${Math.max(500,...map.nodes.map(node=>node.x+220))-left} ${Math.max(320,...map.nodes.map(node=>node.y+130))-top}`:'0 0 1450 950';
  return `<svg viewBox="${box}" ${mini?'aria-hidden="true"':'role="group" aria-label="Mindmap: Knoten auswählen oder verschieben"'} class="mindmap-svg">${map.edges.map(edge=>{
    const from=nodes.get(edge.from),to=nodes.get(edge.to);if(!from||!to)return '';
    const geometry=edgeGeometry(from,to);
    return `<g class="map-edge" ${mini?'':`data-edge="${h(edge.id)}" tabindex="0" role="button" aria-label="Verbindung ${h(edge.label||'ohne Beschriftung')} bearbeiten"`}>${mini?'':`<path class="edge-hit" d="${geometry.path}" fill="none" stroke="transparent" stroke-width="24"/>`}<path class="edge-line" d="${geometry.path}" fill="none" stroke="#b9afcc" stroke-width="${mini?5:3}"/><text x="${geometry.labelX}" y="${geometry.labelY}" text-anchor="middle" fill="#9686ab" font-size="15">${h(edge.label)}</text></g>`;
  }).join('')}${map.nodes.map(node=>`<g class="map-node ${selected===node.id?'selected':''} ${connecting===node.id?'connecting':''}" transform="translate(${node.x},${node.y})" ${mini?'':`data-node="${h(node.id)}" tabindex="0" role="button" aria-label="${h(node.text)}: auswählen; mit Pfeiltasten verschieben"`}><rect width="150" height="56" rx="12" fill="${fill[node.color]}" stroke="${selected===node.id?'#315e4b':'#ffffff'}" stroke-width="${selected===node.id?3:2}"/><text x="75" y="33" text-anchor="middle" fill="#665e70" font-family="Segoe UI, sans-serif" font-size="${mini?20:16}">${h(node.text.length>19?`${node.text.slice(0,18)}…`:node.text)}</text></g>`).join('')}</svg>`;
}
export function renderMindmap(map,state) {
  const selected=map.nodes.find(node=>node.id===state.selected);
  const edge=map.edges.find(item=>item.id===state.edge);
  return `<div class="mindmap-editor"><div class="mindmap-toolbar"><button class="button secondary" data-action="add-node">${icon('plus')} Neuer Gedanke</button><button class="button secondary" data-action="connect-nodes" ${selected?'':'disabled'} aria-pressed="${Boolean(state.connecting)}">${icon('link')} ${state.connecting?'Verbindung abbrechen':'Verbinden'}</button><span>${state.connecting?'Jetzt einen zweiten Gedanken anklicken.':'Knoten ziehen · Auswählen zum Bearbeiten'}</span></div><div class="mindmap-scroll"><div class="mindmap-canvas">${renderMapSvg(map,state)}</div></div><div class="mindmap-inspector">${selected?`<label class="node-label"><span class="field-label">GEDANKE</span><input class="field-input" data-map-field="text" maxlength="200" value="${h(selected.text)}"></label><button class="button danger" data-action="delete-node">${icon('trash')} Knoten entfernen</button>`:edge?`<label class="node-label"><span class="field-label">VERBINDUNG BESCHRIFTEN</span><input class="field-input" data-map-field="label" maxlength="120" value="${h(edge.label)}"></label><button class="button danger" data-action="delete-edge">${icon('trash')} Linie entfernen</button>`:'<p>Jeder Gedanke kann ein Anfang sein. Wähle einen Knoten oder eine Linie aus.</p>'}</div></div>`;
}
