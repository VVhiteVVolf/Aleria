// Refresh the dependency chain for the new regional biography defaults.
import {readdirSync,readFileSync,writeFileSync} from 'node:fs';
import path from 'node:path';
const version='20261103-klaueninsel-v2';
const walk=directory=>readdirSync(directory,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?walk(path.join(directory,entry.name)):[path.join(directory,entry.name)]);
const modules=['families.registry','family-library','app-controller','family-origin-resolver','family-registry-upgrade','house-biography-default-upgrade','house-biography-registry-default','house-biographies.registry','house-cwingod-family','klaueninseln-house-families'];
const pattern=new RegExp(`(${modules.map(name=>name.replaceAll('.','\\.')).join('|')})\\.js(?:\\?v=[^'"\\s]+)?`,'g');
const changed=[];
for(const file of walk('Stammbäume/assets/js').filter(file=>file.endsWith('.js'))){
 const source=readFileSync(file,'utf8'),next=source.replace(pattern,`$1.js?v=${version}`);
 if(next!==source){writeFileSync(file,next);changed.push(file);}
}
const file='Stammbäume/Stammbaum.html',source=readFileSync(file,'utf8');
const next=source.replace(/(assets\/js\/app\.js)\?v=[^"']+/g,`$1?v=${version}`).replace(/(Familien Häuser und Clans\/haeuser\.registry\.js)\?v=[^"']+/g,`$1?v=${version}`);
if(next!==source){writeFileSync(file,next);changed.push(file);}
writeFileSync(new URL('cache-version-files.json',import.meta.url),JSON.stringify(changed,null,2)+'\n');
console.log(`${changed.length} Import-/Einstiegspfade aktualisiert; Laufzeitlogik unverändert.`);
