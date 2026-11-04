import {escapeHtml as h,imageSource} from '../ui/html.mjs';
import {icon} from '../ui/icons.mjs';
import {templateFor} from '../templates/catalog.mjs';
import {renderMapSvg} from '../mindmap/mindmap-view.mjs';
import {isRequestModule,REQUEST_STAGES} from '../requests/request-model.mjs';

export const STATUS_LABELS={sketch:'Entwurf',developing:'In Arbeit',ready:'Ausgearbeitet'};
function textBlocks(module) {return module.pages.flatMap(page=>page.blocks).filter(block=>block.kind!=='image'&&block.value);}
export function moduleMatches(module,query,type) {
  if(type!=='all'&&module.type!==type)return false;
  const content=[module.title,module.subtitle,module.tags,...module.pages.flatMap(page=>[page.title,...page.blocks.filter(block=>block.kind!=='image').map(block=>block.value)]),...module.mindmap.nodes.map(node=>node.text)].join(' ').toLocaleLowerCase('de');
  return content.includes(query.toLocaleLowerCase('de').trim());
}
function preview(module) {
  const blocks=textBlocks(module);
  const image=module.pages.flatMap(page=>page.blocks).find(block=>block.kind==='image'&&imageSource(block.value));
  if(isRequestModule(module))return `<span class="request-card-preview">${image?`<img src="${imageSource(image.value)}" alt="${h(image.label||'Referenzbild zum Wunsch')}">`:''}<span>${h((blocks[0]?.value||'Beschreibe deinen Wunsch und füge passende Referenzbilder hinzu.').slice(0,220))}</span></span>`;
  if(module.type==='mindmap')return `<span class="map-preview">${renderMapSvg(module.mindmap,{mini:true})}</span>`;
  if(module.type==='character')return `<span class="character-preview"><span class="portrait-preview">${image?`<img src="${imageSource(image.value)}" alt="Portrait">`:`${icon('character')}<small>PORTRAIT EINFÜGEN</small>`}</span><span class="trait-preview">${(blocks.find(block=>block.kind==='bullets')?.value||'Eigenschaften ergänzen').split('\n').filter(Boolean).slice(0,3).map(text=>`<span>${h(text)}</span>`).join('')}</span></span>`;
  if(module.type==='moodboard')return `<span class="mood-preview">${image?`<img src="${imageSource(image.value)}" alt="Moodboard">`:'<span></span><span></span><span></span><span></span>'}</span>`;
  if(module.type==='place'&&image)return `<span class="place-preview"><img src="${imageSource(image.value)}" alt="Ortsansicht"></span>`;
  return `<span class="text-preview ${module.type==='note'?'quote-preview':''}">${module.type==='story'?'<small>DIE IDEE IN EINEM SATZ</small>':''}${h((blocks[0]?.value||'Hier erscheint deine Beschreibung. Karte anklicken und loslegen.').slice(0,400))}</span>`;
}
export function renderCard(module,view) {
  const template=templateFor(module.type);
  const collapsed=module.collapsed&&view==='board';
  const request=isRequestModule(module),stage=module.requestMeta?.stage||'draft';
  const statusLabel=request?REQUEST_STAGES[stage]:STATUS_LABELS[module.status];
  const statusClass=request?(stage==='ready'?'ready':'sketch'):module.status;
  return `<article class="idea-card tone-${module.color} ${collapsed?'is-collapsed':''}" data-module="${h(module.id)}" style="--x:${module.x}px;--y:${module.y}px">
    <div class="card-top"><span class="card-type">${icon(template.icon)}<span>${h(template.short)}</span></span><div class="card-tools"><button class="icon-button card-drag" data-action="drag" title="Verschieben; mit den Pfeiltasten in der Pinnwand bewegen" aria-label="${h(module.title)} verschieben">${icon('grip')}</button><button class="icon-button" data-action="collapse" title="${collapsed?'Vorschau ausklappen':'Zur Miniatur einklappen'}" aria-label="${collapsed?'Vorschau ausklappen':'Zur Miniatur einklappen'}">${icon(collapsed?'expand':'fold')}</button></div></div>
    <button class="card-open" data-action="open-module" aria-label="${h(module.title)} öffnen"><span class="card-preview">${preview(module)}</span><span class="card-title">${h(module.title||'Unbenannte Idee')}</span>${module.subtitle&&!collapsed?`<span class="card-subtitle">${h(module.subtitle)}</span>`:''}</button>
    <div class="card-bottom"><span class="status-label"><i class="status-${statusClass}"></i>${h(statusLabel)}</span><span>${module.pages.length} ${module.pages.length===1?'Seite':'Seiten'} <span class="card-arrow">↗</span></span></div>
  </article>`;
}
export function renderBoard(root,board,{view,query,type,zoom}) {
  const modules=board.modules.filter(module=>moduleMatches(module,query,type));
  root.className=`board-surface view-${view}`;
  root.style.zoom='';
  root.style.width=view==='board'&&modules.length?`${Math.max(1080,...modules.map(module=>module.x+340))}px`:'';
  root.style.height=view==='board'&&modules.length?`${Math.max(650,...modules.map(module=>module.y+(module.collapsed?180:390)))}px`:'';
  root.style.transform=view==='board'&&modules.length?`scale(${zoom})`:'';
  const filtered=query||type!=='all';
  root.innerHTML=modules.length?modules.map(module=>renderCard(module,view)).join(''):`<div class="board-empty">${icon(filtered?'search':'plus')}<h2>${filtered?'Keine passende Karte gefunden.':'Deine Pinnwand ist noch leer.'}</h2><p>${filtered?'Versuche einen anderen Suchbegriff oder zeige wieder alle Vorlagen an.':'Füge eine Idee hinzu oder erstelle einen Wunsch für ein Modul oder einen Charakter-Avatar. Jede Karte lässt sich anschließend öffnen, mit Text und Bildern füllen und verschieben.'}</p><div class="board-empty-actions"><button type="button" class="button primary" data-action="${filtered?'clear-filter':'templates'}">${filtered?'Alle Karten anzeigen':'Erste Idee hinzufügen'}</button>${filtered?'':'<button type="button" class="button secondary" data-action="new-request">Wunsch erstellen</button>'}</div>${filtered?'':'<small>Du kannst jederzeit weiterarbeiten: Änderungen werden automatisch in diesem Browser gespeichert.</small>'}</div>`;
  return modules.length;
}
