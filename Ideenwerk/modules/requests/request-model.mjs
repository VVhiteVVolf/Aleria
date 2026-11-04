import {imageSource} from '../ui/html.mjs';

export const REQUEST_TYPES = Object.freeze({
  'module-request': {kind:'module', label:'Modulwunsch'},
  'avatar-request': {kind:'avatar', label:'Avatarwunsch'}
});
export const REQUEST_STAGES = Object.freeze({draft:'Noch in Arbeit',ready:'Bereit zur Übergabe'});
export const REQUEST_PRIORITIES = Object.freeze({normal:'Normal',low:'Hat Zeit',high:'Wichtig'});
export const isRequestModule = module => Object.hasOwn(REQUEST_TYPES,module?.type || '');

export function createRequestMetadata(type) {
  return {kind:REQUEST_TYPES[type].kind,recipient:'Projektleitung',priority:'normal',stage:'draft'};
}

export function parseRequestMetadata(raw,type) {
  const defaults=createRequestMetadata(type);
  if(raw == null)return defaults;
  if(typeof raw!=='object'||Array.isArray(raw)||raw.kind!==defaults.kind
    ||!Object.hasOwn(REQUEST_STAGES,raw.stage)||!Object.hasOwn(REQUEST_PRIORITIES,raw.priority)
    ||typeof raw.recipient!=='string'||raw.recipient.length>120)throw Error('Ungültige Wunschangaben.');
  const next={kind:raw.kind,recipient:raw.recipient,priority:raw.priority,stage:raw.stage};
  if(raw.submission!=null){
    const proof=raw.submission;
    if(typeof proof!=='object'||Array.isArray(proof)
      ||!/^\w[\w-]*\/[\w.-]+$/.test(proof.repository||'')
      ||proof.branch!=='ideenwerk-wuensche'||!/^[a-f0-9]{40,64}$/.test(proof.sha||'')
      ||!/^[a-f0-9]{64}$/.test(proof.fingerprint||'')
      ||typeof proof.sentAt!=='string'||proof.sentAt.length>40||!Number.isFinite(Date.parse(proof.sentAt)))throw Error('Ungültiger GitHub-Speicherbeleg.');
    const url=`https://github.com/${proof.repository}/tree/${proof.branch}`;
    next.submission={repository:proof.repository,branch:proof.branch,sha:proof.sha,fingerprint:proof.fingerprint,sentAt:proof.sentAt,url};
  }
  return next;
}

// Positions, display preferences, draft status and previous send receipts are
// local concerns. Only content changes require another GitHub handover.
export function requestContent(module) {
  const meta=module.requestMeta||createRequestMetadata(module.type);
  return {id:module.id,type:module.type,title:module.title,subtitle:module.subtitle,tags:module.tags,
    recipient:meta.recipient,priority:meta.priority,
    pages:module.pages.map(page=>({id:page.id,title:page.title,blocks:page.blocks.map(block=>({id:block.id,kind:block.kind,label:block.label,value:block.value}))}))};
}

export async function fingerprintRequest(module) {
  const bytes=new TextEncoder().encode(JSON.stringify(requestContent(module)));
  const digest=await globalThis.crypto.subtle.digest('SHA-256',bytes);
  return Array.from(new Uint8Array(digest),byte=>byte.toString(16).padStart(2,'0')).join('');
}

export function buildRequestSummary(module) {
  if(!isRequestModule(module))throw Error('Diese Karte ist kein Modul- oder Avatarwunsch.');
  const meta=module.requestMeta||createRequestMetadata(module.type),definition=REQUEST_TYPES[module.type];
  const blocks=module.pages.flatMap(page=>page.blocks);
  const referenceImageCount=blocks.filter(block=>block.kind==='image'&&imageSource(block.value)).length;
  const text=blocks.filter(block=>block.kind!=='image'&&block.value.trim()).map(block=>`${block.label}\n${block.value}`).join('\n\n');
  const problems=[];
  if(!module.title.trim()||['Neuer Modulwunsch','Neuer Avatarwunsch'].includes(module.title.trim()))problems.push('Gib dem Wunsch einen aussagekräftigen Titel.');
  if(!text)problems.push('Beschreibe, was umgesetzt werden soll.');
  if(definition.kind==='avatar'&&!referenceImageCount)problems.push('Füge ein Referenzbild der Figur hinzu.');
  return {id:module.id,title:module.title,kind:definition.kind,kindLabel:definition.label,stage:meta.stage,
    priority:meta.priority,recipient:meta.recipient,referenceImageCount,text,problems,
    ready:meta.stage==='ready'&&!problems.length};
}

export function collectWorkspaceRequests(workspace) {
  return workspace.boards.flatMap(board=>board.modules.filter(isRequestModule).map(module=>({boardId:board.id,boardName:board.name,module})));
}
