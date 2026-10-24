import { escapeEventText as e } from '../catalog/events-model.mjs';
import { isSourcePlaceholder,readableSourceBlocks,duplicateWarSources,sourceHeadingLabel,hasSourceSectionProse } from './war-sources.mjs';

const gcd=(a,b)=>b?gcd(b,a%b):a;
function renderSourceTable(block){
  const divisor=block.rows.flat().reduce((value,cell)=>gcd(value,cell.colspan),0)||1;
  return `<div class="war-table-scroll" tabindex="0" role="region" aria-label="Tabelle der abgeglichenen Fassung"><table class="war-source-table"><tbody>${block.rows.map(row=>`<tr>${row.map(cell=>`<td${cell.colspan>divisor?` colspan="${cell.colspan/divisor}"`:''}${cell.rowspan>1?` rowspan="${cell.rowspan}"`:''}>${isSourcePlaceholder(cell.text)?'<span class="war-muted">Nicht ausgefüllt</span>':e(cell.text)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}

export function renderSourceBlocks(source,{markEmptySections=false,blocks:selection='all'}={}){
  if(!['all','text','tables'].includes(selection))throw new Error(`Unknown source block selection: ${selection}`);
  const blocks=readableSourceBlocks(source);
  return blocks.map((block,index)=>{
    if(selection==='text'&&block.type==='table'||selection==='tables'&&block.type!=='table')return '';
    const attributes=`id="${source.id}-block-${block.index}" data-war-source="${source.id}" data-source-block="${block.index}"`;
    if(block.type==='table')return `<div ${attributes}>${renderSourceTable(block)}</div>`;
    if(block.type==='heading'){
      const empty=markEmptySections?!hasSourceSectionProse(source,block.text):!blocks[index+1]||blocks[index+1].type==='heading';
      const gapText=markEmptySections?'Zu diesem Abschnitt ist kein ausgearbeiteter Text überliefert.':'Dieser Abschnitt ist in der Vorlage noch nicht ausgefüllt.';
      return `<h2 ${attributes}>${e(sourceHeadingLabel(block.text))}</h2>${empty?`<p class="war-source-gap">${gapText}</p>`:''}`;
    }
    return `<p ${attributes} data-war-source-paragraph>${e(block.text)}</p>`;
  }).join('\n');
}

export function renderSourceReference(source,sourcePrefix){
  const duplicates=duplicateWarSources(source.id);
  return `<p class="war-source-reference">Redaktionell abgeglichene Fassung · 24.10.2026 · <a href="${sourcePrefix.replace(/sources$/,'redaktion/abgleich-2026-10-24.md')}">Änderungen nachvollziehen</a><br>Archivquelle ${source.id.slice(-2)} · <a href="${sourcePrefix}/${source.file.replace('.html','.txt')}">Original als Text</a> · <a href="${sourcePrefix}/${source.file}" download>Unverändertes Original herunterladen</a>${duplicates.map(duplicate=>` · <a href="${sourcePrefix}/${duplicate.file.replace('.html','.txt')}">Identische Archivquelle ${duplicate.id.slice(-2)}</a>`).join('')}</p>`;
}

export function renderReadingBook(source,sourcePrefix){
  return `<details class="war-reading-book" id="lesebuch"><summary><span>Die vollständige Chronik</span><small>Abgeglichene Texte, Tabellen und Anmerkungen aufschlagen</small></summary><div class="war-source-prose">${renderSourceReference(source,sourcePrefix)}${renderSourceBlocks(source)}</div></details>`;
}
