import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const directory=new URL('./',import.meta.url),root=new URL('../../',directory);
const read=name=>JSON.parse(readFileSync(new URL(name,directory),'utf8'));
const previous=read('sources.json'),additional=read('additional-sources.json');
const byId=new Map(previous.map(entry=>[entry.attachmentId,entry]));
for(const entry of additional)byId.set(entry.attachmentId,{slug:entry.id.slice(5),attachmentId:entry.attachmentId,file:`diagnostics/vennyr-warrior-import-20261103/${entry.file}`,sha256:entry.sha256,byteIdenticalToAttachment:true,warriorSRC:entry.warriorSource,warriorContext:'4.) Rittertum',localPath:entry.localWarrior,canonicalFamilyId:entry.id,providedGenealogyIgnored:true,providedDataNotImported:true});
for(const entry of byId.values()){
 const bytes=readFileSync(new URL(entry.file,root));
 if(createHash('sha256').update(bytes).digest('hex')!==entry.sha256)throw new Error(`Quellenhash:${entry.slug}`);
}
if(byId.size!==11)throw new Error('Elf Quellen erwartet');
writeFileSync(new URL('sources.json',directory),JSON.stringify([...byId.values()],null,2)+'\n');
console.log('Elf Originalquellen bytegleich gesichert.');
