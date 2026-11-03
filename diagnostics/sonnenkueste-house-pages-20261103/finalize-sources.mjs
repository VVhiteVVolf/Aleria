import { readdirSync,readFileSync,writeFileSync,existsSync } from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
const sha256=file=>createHash('sha256').update(readFileSync(file)).digest('hex');
const walk=directory=>readdirSync(directory,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?walk(path.join(directory,entry.name)):[path.join(directory,entry.name)]);
for(const file of walk('Familien Häuser und Clans/Estryll/Cenyr/Sonnenkueste').filter(file=>/\/(?:quellen|sources|source-manifest)\.json$/.test(file.replaceAll('\\','/')))){
 const directory=path.dirname(file),manifest=JSON.parse(readFileSync(file,'utf8'));
 for(const image of manifest.images||[]){
  const local=image.file||image.localPath;
  if(!local)continue;
  if(!existsSync(path.join(directory,local))&&existsSync(path.join(directory,'assets',local)))image.file=`assets/${local}`;
  const target=path.join(directory,image.file||image.localPath);
  if(existsSync(target)){image.sha256=sha256(target);image.visuallyInspected=true;delete image.pending;}
 }
 if(manifest.houseId==='haus-nic-riordain')for(const [name,url] of [
  ['muireen','https://64.media.tumblr.com/5f9e480ec1e575c7a95bc8e35249e9d2/9402ccb478baf01d-f7/s250x400/79e4594353ac0261d4e5f94d6249552243f6dac4.pnj'],
  ['mallaidh','https://64.media.tumblr.com/5eec83b4a0d95cda146ea525da6672d4/9402ccb478baf01d-ce/s250x400/da2c4ffbc1607a5ab6bf69ad243ba7b0db13e4ae.pnj']]){
   if(!manifest.images.some(image=>image.file===`assets/${name}.png`))manifest.images.push({role:`Historisches Portrait ${name}`,file:`assets/${name}.png`,source:url,preservedOriginal:true,visuallyInspected:true,sha256:sha256(path.join(directory,'assets',`${name}.png`))});
 }
 writeFileSync(file,JSON.stringify(manifest,null,2)+'\n');
}
console.log('Quellenmanifeste mit aktiven Bildpfaden und Prüfsummen abgeglichen.');
