import {readdirSync,readFileSync,writeFileSync} from 'node:fs';
import path from 'node:path';
const version='20261103-vennyr-warriors-v1';
const walk=directory=>readdirSync(directory,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?walk(path.join(directory,entry.name)):[path.join(directory,entry.name)]);
const modules=['families.registry','family-library','app-controller','family-origin-resolver','family-registry-upgrade','house-biography-default-upgrade','house-biography-registry-default','house-biography-default-catalog','vennyr-warrior-biography-defaults'];
const pattern=new RegExp(`(${modules.map(name=>name.replaceAll('.','\\.')).join('|')})\\.js(?:\\?v=[^'"\\s]+)?`,'g');
const changes=[];
for(const file of walk('Stammbäume/assets/js').filter(file=>file.endsWith('.js'))){
 const source=readFileSync(file,'utf8'),updated=source.replace(pattern,`$1.js?v=${version}`);
 if(updated!==source){writeFileSync(file,updated);changes.push(file);}
}
const entry='Stammbäume/Stammbaum.html',source=readFileSync(entry,'utf8');
const updated=source.replace(/(assets\/js\/app\.js)\?v=[^"']+/g,`$1?v=${version}`);
if(updated!==source){writeFileSync(entry,updated);changes.push(entry);}
const gallery='Gallerien/krieger/warrior-gallery.mjs';
writeFileSync(gallery,readFileSync(gallery,'utf8').replace(/(catalog\.json\?v=)[^'"\s]+/g,`$1${version}`));
writeFileSync(new URL('versioned-modules.json',import.meta.url),JSON.stringify(changes,null,2)+'\n');
console.log(`${changes.length} betroffene Modul- und Einstiegspfade aktualisiert.`);
