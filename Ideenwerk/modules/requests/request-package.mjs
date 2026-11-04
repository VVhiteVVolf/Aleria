import {parseModule} from '../workspace/schema.mjs';
import {REQUEST_TYPES,REQUEST_PRIORITIES as priorities,buildRequestSummary,isRequestModule} from './request-model.mjs';

export const REQUEST_PACKAGE_FORMAT='ideenwerk-requests';
export const MAX_REQUEST_PACKAGE_BYTES=25*1024*1024;
const safeId=value=>typeof value==='string'&&/^[A-Za-z0-9-]{1,100}$/.test(value);
const labels={module:'Modulwunsch',avatar:'Avatarwunsch'};
const bytes=value=>new TextEncoder().encode(value).length;
const markdown=value=>String(value).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/([\\`*_{}\[\]()#!|])/g,'\\$1');

function imageFile(value,blockId) {
  const match=/^data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/]+={0,2})$/.exec(value);
  if(!match||match[2].length%4!==0)throw new Error('Ein Referenzbild ist ungültig. Bitte das Bild erneut auswählen.');
  const content=match[2];
  let decoded;
  try{decoded=atob(content);}catch{throw new Error('Ein Referenzbild enthält keine lesbaren Bilddaten.');}
  // Image imports are already decoded by the browser. Import files receive the
  // same minimal signature check so arbitrary embedded files cannot be shared.
  const signature=match[1]==='png'?decoded.startsWith('\x89PNG\r\n\x1a\n')
    :match[1]==='jpeg'?decoded.charCodeAt(0)===255&&decoded.charCodeAt(1)===216&&decoded.charCodeAt(2)===255
      :decoded.startsWith('RIFF')&&decoded.slice(8,12)==='WEBP';
  if(!signature)throw new Error('Ein Referenzbild passt nicht zum angegebenen Bildformat. Bitte erneut auswählen.');
  return {path:`bilder/${blockId}.${match[1]==='jpeg'?'jpg':match[1]}`,encoding:'base64',content,byteLength:decoded.length};
}

function normalizeRequest(source) {
  if(!isRequestModule(source))throw new Error('Es können nur Modul- und Avatarwünsche übergeben werden.');
  const module=parseModule(source);
  if(!safeId(module.id)||module.pages.some(page=>!safeId(page.id)||page.blocks.some(block=>!safeId(block.id))))throw new Error('Eine Wunschkennung ist für die Übergabe ungeeignet.');
  const meta=module.requestMeta;
  const summary=buildRequestSummary(module);
  if(!meta||meta.kind!==REQUEST_TYPES[module.type].kind||!meta.recipient.trim())throw new Error('Die Angaben zum Wunsch sind ungültig. Bitte den Wunsch erneut öffnen.');
  if(summary.problems.length)throw new Error(`„${module.title}“: ${summary.problems.join(' ')}`);
  return {module,kind:meta.kind,recipient:meta.recipient,priority:meta.priority,stage:meta.stage};
}

export function buildRequestPackage({workspaceId,requests}) {
  if(!safeId(workspaceId))throw new Error('Die Projektkennung ist für die Übergabe ungeeignet.');
  if(!Array.isArray(requests)||!requests.length||requests.length>100)throw new Error('Wähle zwischen einem und 100 Wünschen für die Übergabe.');
  if(bytes(JSON.stringify(requests))>MAX_REQUEST_PACKAGE_BYTES)throw new Error('Die ausgewählten Wünsche sind größer als 25 MB. Bitte weniger Wünsche oder kleinere Bilder übergeben.');
  const seen=new Set(),files=[],summaries=[],snapshots=[];
  const prefix=`wuensche/${workspaceId}`;
  for(const source of requests) {
    const {module,kind,recipient,priority,stage}=normalizeRequest(source);
    if(seen.has(module.id))throw new Error('Ein Wunsch wurde mehrfach ausgewählt.');
    seen.add(module.id);
    const requestPrefix=`${prefix}/${module.id}`;
    const images=[];
    const pages=module.pages.map(page=>({id:page.id,title:page.title,blocks:page.blocks.map(block=>{
      if(block.kind!=='image'||!block.value)return {...block};
      const image=imageFile(block.value,`${page.id}-${block.id}`);
      images.push(image);
      return {...block,value:image.path};
    })}));
    const document={format:'ideenwerk-request',version:1,workspaceId,id:module.id,kind,title:module.title,subtitle:module.subtitle,recipient,priority,stage,tags:module.tags,pages};
    const sections=[`# ${labels[kind]}: ${markdown(module.title)}`,'',`**Für:** ${markdown(recipient)}  `,`**Priorität:** ${priorities[priority]}  `,`**Stand bei Übergabe:** ${stage==='ready'?'Bereit zur Umsetzung':'Entwurf'}  `,`**Kennung:** \`${module.id}\``];
    if(module.subtitle)sections.push('',markdown(module.subtitle));
    for(const page of pages){
      sections.push('',`## ${markdown(page.title)}`);
      for(const block of page.blocks){
        if(!block.value)continue;
        sections.push('',`### ${markdown(block.label)}`,'');
        sections.push(block.kind==='image'?`![${markdown(block.label)}](${block.value})`
          :block.kind==='bullets'?block.value.split('\n').filter(line=>line.trim()).map(line=>`- ${markdown(line)}`).join('\n'):markdown(block.value));
      }
    }
    sections.push('','---','','Die Beschreibung und Referenzbilder stammen aus Patricks Ideenwerk. Bearbeitungsnotizen können als eigene Datei `bearbeitung.md` in diesem Ordner ergänzt werden.');
    files.push({path:`${requestPrefix}/README.md`,encoding:'utf-8',content:sections.join('\n')+'\n'},
      {path:`${requestPrefix}/wunsch.json`,encoding:'utf-8',content:JSON.stringify(document,null,2)+'\n'},
      ...images.map(image=>({...image,path:`${requestPrefix}/${image.path}`})));
    summaries.push({id:module.id,title:module.title,kind,kindLabel:labels[kind],referenceImageCount:images.length});
    // Keep only the normalized request fields used to rebuild this exact package
    // before writing. Local submission receipts and unrelated data never travel.
    snapshots.push({...module,requestMeta:{kind,recipient,priority,stage}});
  }
  const overview=['# Wünsche aus Patricks Ideenwerk','','## Zuletzt übergebene Auswahl','',...summaries.map(request=>`- [${markdown(request.title)}](./${request.id}/README.md) · ${request.kindLabel} · ${request.referenceImageCount} Referenzbild${request.referenceImageCount===1?'':'er'}`),'','Jeder Wunsch liegt in einem eigenen Ordner mit Beschreibung, strukturierten Angaben und Bilddateien. Frühere Wünsche und separate Bearbeitungsnotizen bleiben erhalten.','','## In VS Code lesen','','Das Repository klonen und den Branch `ideenwerk-wuensche` auswählen. Danach neue Stände mit „Pull“ holen. Eine `README.md` über „Vorschau öffnen“ ansehen; die Referenzbilder liegen im Unterordner `bilder`.','','Aufgaben und Bilder werden von hier aus bewusst in Aleria umgesetzt. Eine Übergabe verändert keine bestehenden Aleria-Inhalte.'];
  files.push({path:`${prefix}/README.md`,encoding:'utf-8',content:overview.join('\n')+'\n'});
  if(new Set(files.map(file=>file.path)).size!==files.length)throw new Error('Zwei Referenzbilder besitzen dieselbe Dateikennung. Bitte eines der Bilder in einem neuen Bildblock erneut einfügen.');
  const byteLength=files.reduce((sum,file)=>sum+(file.byteLength??bytes(file.content)),0);
  if(byteLength>MAX_REQUEST_PACKAGE_BYTES)throw new Error('Die ausgewählten Wünsche sind größer als 25 MB. Bitte weniger Wünsche oder kleinere Bilder übergeben.');
  return {format:REQUEST_PACKAGE_FORMAT,version:1,workspaceId,sourceRequests:snapshots,files,requests:summaries,byteLength,overviewPath:`${prefix}/README.md`};
}
