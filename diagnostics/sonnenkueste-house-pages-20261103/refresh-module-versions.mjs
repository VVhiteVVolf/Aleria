// Version the dependency paths needed for the two new canonical family IDs.
import {readdirSync,readFileSync,writeFileSync} from 'node:fs';
import path from 'node:path';
const version='20261103-sonnenkueste-v1';
const walk=directory=>readdirSync(directory,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?walk(path.join(directory,entry.name)):[path.join(directory,entry.name)]);
const modules=['families.registry','family-library','app-controller','family-origin-resolver','sonnenkueste-house-families','sonnenkueste-house-profiles','jungferntal-knight-houses'];
const pattern=new RegExp(`(${modules.map(name=>name.replaceAll('.','\\.')).join('|')})\\.js(?:\\?v=[^'"\\s]+)?`,'g');
const changed=[];
for(const file of walk('Stammbäume/assets/js').filter(file=>file.endsWith('.js'))){
 const source=readFileSync(file,'utf8'),next=source.replace(pattern,`$1.js?v=${version}`);
 if(next!==source){writeFileSync(file,next);changed.push(file);}
}
for(const file of ['Stammbäume/Stammbaum.html']){
 const source=readFileSync(file,'utf8'),next=source.replace(/(assets\/js\/app\.js)\?v=[^"']+/g,`$1?v=${version}`).replace(/(Familien Häuser und Clans\/haeuser\.registry\.js)\?v=[^"']+/g,`$1?v=${version}`);
 if(next!==source){writeFileSync(file,next);changed.push(file);}
}
writeFileSync(new URL('cache-version-files.json',import.meta.url),JSON.stringify(changed,null,2)+'\n');
console.log(`${changed.length} Import-/Einstiegspfade versioniert; keine Laufzeitlogik geändert.`);
