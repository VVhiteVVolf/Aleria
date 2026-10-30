import {readFile,writeFile} from 'node:fs/promises';
const target=new URL('../../Vorschau/Brevanor/territory-data.mjs',import.meta.url);
const points={brellan:[76.73,6.71],tervenne:[17.42,10.47],marneval:[37.93,10.5],vaudrec:[91.64,30.26],dervel:[38.83,31.49],hervant:[66.06,34.73],orbec:[3.68,42.58],mirel:[48.55,43.21],arselle:[83.69,45.68],torvay:[33.75,51.17],caerennes:[51.77,56],roscan:[16.84,58.94],virec:[81.36,61.15],garnac:[32.53,69.54],rovanne:[85.88,77.89],sorven:[45.31,79.9],tregard:[17.06,90.84]};
let source=await readFile(target,'utf8');
const entries=[];
for(const [id,point] of Object.entries(points)){
 const dy=id==='caerennes'?4.35:['tervenne','vaudrec','tregard'].includes(id)?3.25:2.65;
 const label=[Math.max(6.2,point[0]),Number((point[1]+dy).toFixed(2))];
 const pattern=new RegExp(`(\\{id:'${id}',county:'[^']+',)point:\\[[^\\]]+\\],label:\\[[^\\]]+\\]`,'g');
 if([...source.matchAll(pattern)].length!==1)throw new Error('Ambiguous place '+id);
 source=source.replace(pattern,`$1point:${JSON.stringify(point)},label:${JSON.stringify(label)}`);
 entries.push({id,point,label});
}
await writeFile(target,source);
await writeFile(new URL('map-anchor-update.json',import.meta.url),JSON.stringify({imageSize:[6144,5429],method:'White marker centres measured from corrected original; labels checked against the source lettering.',entries},null,2)+'\n');
console.log(JSON.stringify({updated:entries.length,imageSize:[6144,5429]}));
