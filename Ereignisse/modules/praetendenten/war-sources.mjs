import imported from './praetendenten-sources.json' with {type:'json'};
import { applyWarSourceEdition } from './war-source-edition.mjs';

// Archive API remains unchanged; all public reading views use the agreed edition.
export const WAR_SOURCES=Object.freeze(imported.documents);
export const WAR_READING_SOURCES=applyWarSourceEdition(WAR_SOURCES);
const SOURCE_SECTION_LABELS=Object.freeze([
  /^(?:Belagerungssituation|Schlachtverlauf|Tatort|Der Verlauf der Schlacht)$/i,
  /^Die (?:Seeschlacht|Schlacht)\s*[-–]\s*Situation$/i,
  /^(?:Die Lage|Die Taktik|Strategie) der (?:Grünen|Roten|Blauen)$/i,
  /^Strategie von Ceitheach$/i,
  /^(?:Erstes|Zweites|Drittes|Viertes|Fünftes|Sechstes|Siebtes)\s+Jahr$/i
]);
export function duplicateWarSources(id){return WAR_SOURCES.filter(source=>source.duplicateOf===id);}

export function sourceHeadingLabel(text){
  return text.replace(/Übersi\s+cht/g,'Übersicht').replace(/V\s+orgeschichte/g,'Vorgeschichte');
}
export function warSource(id){
  const source=WAR_READING_SOURCES.find(entry=>entry.id===id);
  if(!source)throw new Error(`Unknown war source: ${id}`);
  return source;
}
export function originalWarSource(id){
  const source=WAR_SOURCES.find(entry=>entry.id===id);
  if(!source)throw new Error(`Unknown original war source: ${id}`);
  return source;
}

// Empty layout artefacts remain in the immutable import, but are not prose.
export function isSourcePlaceholder(text){
  return /^(?:[.\s…„“"\-]*|BILD|Zitat|[-–]\s*(?:Zitat|Unbekannt))$/i.test(text.trim());
}

export function readableSourceBlocks(source){
  return source.blocks.map((block,index)=>({...block,index})).filter(block=>{
    if(block.type==='table'){
      const text=block.rows.flat().map(cell=>cell.text).join(' ');
      return !/^Inhalt\s*:/i.test(text)&&!isSourcePlaceholder(text);
    }
    return block.text!==source.title&&!isSourcePlaceholder(block.text);
  });
}

export function sourceSection(source,id){
  const index=source.blocks.findIndex(block=>block.type==='heading'&&block.text===id);
  if(index<0)return [];
  const next=source.blocks.findIndex((block,i)=>i>index&&block.type==='heading');
  return source.blocks.slice(index+1,next<0?undefined:next).filter(block=>block.type==='paragraph'&&!isSourcePlaceholder(block.text));
}

// Old layout labels remain visible, but do not make an otherwise empty section prose.
export function hasSourceSectionProse(source,heading){
  return sourceSection(source,heading).some(block=>!SOURCE_SECTION_LABELS.some(pattern=>pattern.test(block.text.trim())));
}

export function sourceFact(source,label){
  for(const block of source.blocks){
    if(block.type!=='table')continue;
    const row=block.rows.find(row=>row[0]?.text===label);
    if(row)return row.slice(1).map(cell=>cell.text).filter(Boolean).join(' · ');
  }
  return '';
}
