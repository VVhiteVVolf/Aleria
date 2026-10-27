import {escapeHtml as h,imageSource} from '../ui/html.mjs';
import {icon} from '../ui/icons.mjs';
import {templateFor} from '../templates/catalog.mjs';
import {renderMapSvg} from '../mindmap/mindmap-view.mjs';

export const STATUS_LABELS={sketch:'Erste Skizze',developing:'In Entwicklung',ready:'Ausgearbeitet'};
function textBlocks(module) {return module.pages.flatMap(page=>page.blocks).filter(block=>block.kind!=='image'&&block.value);}
export function moduleMatches(module,query,type) {
  if(type!=='all'&&module.type!==type)return false;
  const content=[module.title,module.subtitle,module.tags,...module.pages.flatMap(page=>[page.title,...page.blocks.filter(block=>block.kind!=='image').map(block=>block.value)]),...module.mindmap.nodes.map(node=>node.text)].join(' ').toLocaleLowerCase('de');
  return content.includes(query.toLocaleLowerCase('de').trim());
}
function preview(module) {
  const blocks=textBlocks(module);
  const image=module.pages.flatMap(page=>page.blocks).find(block=>block.kind==='image'&&imageSource(block.value));
  if(module.type==='mindmap')return `<span class="map-preview">${renderMapSvg(module.mindmap,{mini:true})}</span>`;
  if(module.type==='character')return `<span class="character-preview"><span class="portrait-preview">${image?`<img src="${imageSource(image.value)}" alt="Portrait">`:`${icon('character')}<small>DEIN PORTRAIT</small>`}</span><span class="trait-preview">${(blocks.find(block=>block.kind==='bullets')?.value||'Ein Wunsch\nEin Widerspruch\nEine Geschichte').split('\n').filter(Boolean).slice(0,3).map(text=>`<span>${h(text)}</span>`).join('')}</span></span>`;
  if(module.type==='moodboard')return `<span class="mood-preview">${image?`<img src="${imageSource(image.value)}" alt="Moodboard">`:'<span></span><span></span><span></span><span></span>'}</span>`;
  if(module.type==='place'&&image)return `<span class="place-preview"><img src="${imageSource(image.value)}" alt="Ortsansicht"></span>`;
  return `<span class="text-preview ${module.type==='note'?'quote-preview':''}">${module.type==='story'?'<small>DIE IDEE IN EINEM SATZ</small>':''}${h(blocks[0]?.value||'Eine neue Idee wartet darauf, entdeckt zu werden.').slice(0,400)}</span>`;
}
export function renderCard(module,view) {
  const template=templateFor(module.type);
  const collapsed=module.collapsed&&view==='board';
  return `<article class="idea-card tone-${module.color} ${collapsed?'is-collapsed':''}" data-module="${h(module.id)}" style="--x:${module.x}px;--y:${module.y}px">
    <div class="card-top"><span class="card-type">${icon(template.icon)}<span>${h(template.short)}</span></span><div class="card-tools"><button class="icon-button card-drag" data-action="drag" title="Verschieben; mit den Pfeiltasten in der Pinnwand bewegen" aria-label="${h(module.title)} verschieben">${icon('grip')}</button><button class="icon-button" data-action="collapse" title="${collapsed?'Vorschau ausklappen':'Zur Miniatur einklappen'}" aria-label="${collapsed?'Vorschau ausklappen':'Zur Miniatur einklappen'}">${icon(collapsed?'expand':'fold')}</button></div></div>
    <button class="card-open" data-action="open-module" aria-label="${h(module.title)} öffnen"><span class="card-preview">${preview(module)}</span><span class="card-title">${h(module.title||'Unbenannte Idee')}</span>${module.subtitle&&!collapsed?`<span class="card-subtitle">${h(module.subtitle)}</span>`:''}</button>
    <div class="card-bottom"><span class="status-label"><i class="status-${module.status}"></i>${STATUS_LABELS[module.status]}</span><span>${module.pages.length} Seiten <span class="card-arrow">↗</span></span></div>
  </article>`;
}
export function renderBoard(root,board,{view,query,type,zoom}) {
  const modules=board.modules.filter(module=>moduleMatches(module,query,type));
  root.className=`board-surface view-${view}`;
  root.style.zoom='';
  root.style.width=view==='board'?`${Math.max(1080,...modules.map(module=>module.x+340))}px`:'';
  root.style.height=view==='board'?`${Math.max(650,...modules.map(module=>module.y+(module.collapsed?180:390)))}px`:'';
  root.style.transform=view==='board'?`scale(${zoom})`:'';
  root.innerHTML=modules.length?modules.map(module=>renderCard(module,view)).join(''):`<div class="board-empty">${icon(query||type!=='all'?'search':'plus')}<h2>${query||type!=='all'?'Noch kein Treffer.':'Hier beginnt etwas Neues.'}</h2><p>${query||type!=='all'?'Versuche einen anderen Suchbegriff oder eine andere Vorlage.':'Wähle eine Vorlage und gib deiner ersten Idee einen Platz.'}</p><button class="button primary" data-action="${query||type!=='all'?'clear-filter':'templates'}">${query||type!=='all'?'Filter zurücksetzen':'Erstes Modul erstellen'}</button></div>`;
  return modules.length;
}
