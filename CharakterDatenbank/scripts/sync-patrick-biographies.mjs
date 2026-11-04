import { readFile,writeFile,mkdir } from 'node:fs/promises';
import { resolve,relative,dirname,isAbsolute } from 'node:path';
import { fileURLToPath,pathToFileURL } from 'node:url';
import { FAMILY_REGISTRY } from '../../Stammbäume/assets/js/data/families.registry.js';
import { createFamilyCandidates } from '../../AleriaAlmanach/modules/character-genealogy/genealogy-mapping.js';
import { patrickBiographyCharacterIds } from '../../AleriaAlmanach/modules/patrick-biographies/biography-identities.mjs';
import { createPatrickBiographyExports,confirmationFromPatrickBiographyExports,projectPatrickBiographyDatabase,PATRICK_BIOGRAPHY_EXPORT_DIRECTORY } from '../../AleriaAlmanach/modules/patrick-biographies/biography-database-projection.mjs';

const workspace=fileURLToPath(new URL('../../',import.meta.url));
export async function syncPatrickBiographies({check=false,receiptPath}={}){
  const inputs=new Map();
  const read=async path=>{const file=resolve(workspace,path),text=await readFile(file,'utf8');inputs.set(file,text);return JSON.parse(text);};
  const [registry,snapshot,report]=await Promise.all(['registry.json','generated/characters.snapshot.json','generated/sync-report.json'].map(path=>read(`CharakterDatenbank/${path}`)));
  const ids=new Set(patrickBiographyCharacterIds());
  const existingRecords=await Promise.all(registry.records.filter(row=>ids.has(row.firestoreDocumentId)).map(row=>read(`CharakterDatenbank/${row.path}`)));
  let exports;
  if(receiptPath){
    const receiptFile=resolve(workspace,receiptPath),text=await readFile(receiptFile,'utf8');inputs.set(receiptFile,text);
    const confirmation=JSON.parse(text);exports=createPatrickBiographyExports(confirmation);
    for(const entry of exports){try{const previous=await read(entry.sourcePath);
      if(Date.parse(previous.exportedAt)>Date.parse(entry.exportedAt))throw Error('Eine neuere bestätigte öffentliche Quelle darf nicht durch einen älteren Beleg ersetzt werden.');
    }catch(error){if(error.code!=='ENOENT')throw error;}}
  }
  else if(check){const existing=await Promise.all([...ids].map(id=>read(`${PATRICK_BIOGRAPHY_EXPORT_DIRECTORY}/${id}.json`)));exports=createPatrickBiographyExports(confirmationFromPatrickBiographyExports(existing));}
  else throw Error('Lokaler Schreibabgleich benötigt ausdrücklich --receipt <verified Publikationsbestätigung>.');
  const publicFamilies=new Set(['haus-sgrechiwr','haus-draenmelyn','haus-swyll','haus-hamnett']);
  const familyCandidates=FAMILY_REGISTRY.filter(record=>publicFamilies.has(record.id)).flatMap(createFamilyCandidates);
  const result=projectPatrickBiographyDatabase({registry,snapshot,report,existingRecords,exports,familyCandidates});
  const outputs=[...result.records.map(item=>[`CharakterDatenbank/${item.path}`,item.record]),
    ['CharakterDatenbank/registry.json',result.registry],['CharakterDatenbank/generated/characters.snapshot.json',result.snapshot],['CharakterDatenbank/generated/sync-report.json',result.report],
    ...result.exports.map(entry=>[entry.sourcePath,entry])];
  const changes=[];
  for(const [path,value]of outputs){
    const file=resolve(workspace,path),fromRoot=relative(workspace,file);
    if(isAbsolute(fromRoot)||fromRoot.startsWith('..')||!['CharakterDatenbank','Charakter Archiv Exporte'].some(prefix=>fromRoot.startsWith(prefix)))throw Error('Ungültiger begrenzter Ausgabepfad.');
    const text=JSON.stringify(value,null,2)+'\n';let current=inputs.get(file);
    if(current===undefined){try{current=await readFile(file,'utf8');inputs.set(file,current);}catch(error){if(error.code!=='ENOENT')throw error;}}
    if(current!==text)changes.push([file,text]);
  }
  if(check&&changes.length)throw Error(`Der begrenzte Biografieabgleich hat ${changes.length} veraltete Ausgaben.`);
  if(!check){
    for(const [file,text]of inputs)if(await readFile(file,'utf8')!==text)throw Error('Lokale Ausgangsdaten wurden zwischenzeitlich geändert.');
    for(const [file,text]of changes){await mkdir(dirname(file),{recursive:true});await writeFile(file,text);}
  }
  return {checked:check,changedFiles:changes.length,...result.verification};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
  const index=process.argv.indexOf('--receipt');
  console.log(JSON.stringify(await syncPatrickBiographies({check:process.argv.includes('--check'),receiptPath:index>=0?process.argv[index+1]:undefined})));
}
