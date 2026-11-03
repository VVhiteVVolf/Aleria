// Align authoring metadata with the explicitly linked canonical territory page.
import {readdirSync,readFileSync,writeFileSync} from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
const walk=dir=>readdirSync(dir,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?walk(path.join(dir,entry.name)):[path.join(dir,entry.name)]);
const changes=[];
for(const file of walk('Familien Häuser und Clans/Estryll/Cenyr/Klaueninsel').filter(file=>path.basename(file)==='haus.content.mjs')){
 const {HOUSE_CONTENT:content}=await import(pathToFileURL(path.resolve(file)));
 const target=path.resolve('Familien Häuser und Clans',content.territoryHref);
 const dataFiles=readdirSync(path.dirname(target)).filter(name=>name.endsWith('.data.mjs'));
 if(dataFiles.length!==1)throw new Error(`Territorium nicht eindeutig:${target}`);
 const source=readFileSync(path.join(path.dirname(target),dataFiles[0]),'utf8'),marker='export default createTerritory(',start=source.indexOf(marker)+marker.length;
 const territory=JSON.parse(source.slice(start,source.lastIndexOf(');')));
 if(content.territoryId===territory.id)continue;
 const original=readFileSync(file,'utf8'),updated=original.replace(/(["']?territoryId["']?\s*:\s*)(["'])([^"']*)\2/,(_,prefix,quote)=>`${prefix}${quote}${territory.id}${quote}`);
 if(updated===original)throw new Error(`Territoriumskennung nicht gefunden:${file}`);
 writeFileSync(file,updated);changes.push({house:content.id,previous:content.territoryId,current:territory.id});
}
writeFileSync(new URL('territory-id-normalization.json',import.meta.url),JSON.stringify(changes,null,2)+'\n');
console.log(`${changes.length} Gebietskennungen an ihre expliziten Rücklinks angeglichen.`);
