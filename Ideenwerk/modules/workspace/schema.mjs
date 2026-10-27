import {COLORS, TEMPLATES} from '../templates/catalog.mjs';
import {imageSource} from '../ui/html.mjs';
export const FORMAT = 'ideenwerk-project';
export const VERSION = 1;
export const MAX_FILE_BYTES = 32 * 1024 * 1024;
const fail = message => { throw new Error(`Ungültige Projektdatei: ${message}`); };
const object = value => value && typeof value === 'object' && !Array.isArray(value);
function string(value, name, max = 100000) {
  if (typeof value !== 'string' || value.length > max) fail(`${name} fehlt oder ist zu lang.`);
  return value;
}
function array(value, name, max) {
  if (!Array.isArray(value) || value.length > max) fail(`${name} ist keine zulässige Liste (maximal ${max}).`);
  return value;
}
function id(value) { return string(value,'Kennung',100); }
function unique(items) {
  const ids = items.map(item=>item.id);
  if (ids.some(value=>!value) || new Set(ids).size !== ids.length) fail('Doppelte oder leere Kennungen.');
  return items;
}
function position(value, max) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > max) fail('Position außerhalb der Arbeitsfläche.');
  return value;
}
function color(value) { if (!COLORS.includes(value)) fail('Unbekannte Farbe.'); return value; }
function parsePage(raw) {
  if (!object(raw)) fail('Ungültige Seite.');
  return {id:id(raw.id),title:string(raw.title,'Seitentitel',200),blocks:unique(array(raw.blocks,'Inhalte',100).map(block=>{
    if (!object(block) || !['text','bullets','image'].includes(block.kind)) fail('Unbekannter Inhaltsblock.');
    const value=string(block.value,'Inhalt',block.kind === 'image' ? 6000000 : 100000);
    if (block.kind === 'image' && value && !imageSource(value)) fail('Nur eingebettete PNG-, JPEG- oder WebP-Bilder sind erlaubt.');
    return {id:id(block.id),kind:block.kind,label:string(block.label,'Beschriftung',200),value};
  }))};
}
export function parseModule(raw) {
  if (!object(raw) || !TEMPLATES.some(template=>template.id===raw.type)) fail('Unbekannte Modulvorlage.');
  if (!['sketch','developing','ready'].includes(raw.status)) fail('Unbekannter Ideenstatus.');
  const pages=unique(array(raw.pages,'Seiten',50).map(parsePage));
  if (!pages.length) fail('Ein Modul benötigt mindestens eine Seite.');
  const nodes=unique(array(raw.mindmap?.nodes,'Mindmap-Knoten',200).map(node=>({id:id(node.id),text:string(node.text,'Knotentext',200),x:position(node.x,1300),y:position(node.y,850),color:color(node.color)})));
  const nodeIds=new Set(nodes.map(node=>node.id));
  const edgePairs=new Set();
  const edges=unique(array(raw.mindmap?.edges,'Verbindungen',500).map(edge=>{
    if (!nodeIds.has(edge.from) || !nodeIds.has(edge.to) || edge.from===edge.to) fail('Verbindung ohne gültige Endpunkte.');
    const pair=[edge.from,edge.to].sort().join('|');
    if (edgePairs.has(pair)) fail('Doppelte Mindmap-Verbindung.');
    edgePairs.add(pair);
    return {id:id(edge.id),from:id(edge.from),to:id(edge.to),label:string(edge.label,'Verbindungstext',120)};
  }));
  return {id:id(raw.id),type:raw.type,title:string(raw.title,'Modultitel',200),subtitle:string(raw.subtitle,'Untertitel',500),color:color(raw.color),status:raw.status,tags:string(raw.tags,'Schlagworte',500),collapsed:raw.collapsed === true,x:position(raw.x,3500),y:position(raw.y,2500),pages,mindmap:{nodes,edges}};
}
export function parseWorkspace(raw) {
  if (!object(raw) || raw.format !== FORMAT || raw.version !== VERSION) fail('Diese Datei gehört nicht zur unterstützten Ideenwerk-Version 1.');
  const boards=unique(array(raw.boards,'Pinnwände',30).map(board=>({id:id(board.id),name:string(board.name,'Pinnwandname',120),example:board.example===true,modules:unique(array(board.modules,'Module',500).map(parseModule))})));
  if (!boards.length) fail('Mindestens eine Pinnwand wird benötigt.');
  return {format:FORMAT,version:VERSION,id:id(raw.id),name:string(raw.name,'Projektname',120),boards,updatedAt:typeof raw.updatedAt==='string'?raw.updatedAt:''};
}
export function parseProjectText(text) {
  if (new TextEncoder().encode(text).length > MAX_FILE_BYTES) throw new Error('Die Projektdatei ist größer als 32 MB. Bitte kleinere Bilddateien verwenden.');
  let raw;
  try { raw=JSON.parse(text); } catch { throw new Error('Diese Datei enthält kein lesbares JSON-Projekt.'); }
  return parseWorkspace(raw);
}
