import {readFile,writeFile,mkdir,copyFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {iconDirections} from '../Brevanor/icon-art-direction.mjs';
const root=new URL('../../',import.meta.url),art=new URL('../assets/images/brevanor/',import.meta.url);
const local=p=>fileURLToPath(new URL(p,root)).replaceAll('\\','/');
const preset=JSON.parse(await readFile(new URL('AleriaAlmanach/docs/art/image-style-presets.json',root),'utf8')).presets['fantasy-class-icon'];
const source='C:/Users/fhg_r/Downloads/Länder/Brevanor/Brevanor.png';
await mkdir(new URL('realm/',art),{recursive:true});
const original=new URL('realm/brevanor-original.png',art);
try{await readFile(original);}catch{await copyFile(source,original);}
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const bytes=await readFile(source);
if(sha(bytes)!==sha(await readFile(original)))throw Error('Brevanor-Original stimmt nicht überein');
const jobs=iconDirections.map(d=>{
 const style=local('AleriaAlmanach/docs/art/class-icon-style/'+(d.id==='cabrant'?'morgorn-bragan':'morgorn-varor')+'.png');
 const companion=d.id==='breval'?local('AleriaAlmanach/docs/art/class-icon-style/morgorn-kuralan.png'):local('Klassenordner/assets/images/brevanor/icons/generated/breval-comic.png');
 return {id:d.id,destination:'Klassenordner/assets/images/brevanor/icons/generated/'+d.id+'-comic.png',production:'Klassenordner/assets/images/brevanor/icons/production/'+d.id+'.png',preview:'Klassenordner/assets/images/brevanor/icons/'+d.id+'.webp',references:[style,companion,fileURLToPath(original)],prompt:'ONE Brevanor class icon: '+d.id+'. Reference1 is the existing Morgorn flat comic style; Reference2 gives the same flat drawing style, never equipment for another class. Reference3 is national identity only. '+preset.prompt+'\nSUBJECT: '+d.design+'\nPalette TURQUOISE, SILVER-GRAY and BLACK, plus natural wood/leather/skin/horse only where needed. French knightly elite of the twelfth century with Breton fantasy and British elements, translated into FLAT 2D comic shapes. Two flat colour values per material, heavy dark contours, printed storybook feeling. NO plastic 3D toy, glossy shading, gradients, highlights or realistic modelling. CLASS ICON STYLE ONLY, entirely separate from normal painted house warriors. Exact 1024x1536 portrait, complete silhouette, all weapon tips and feet/hooves visible with 7% transparent margin. TRUE transparent PNG and gaps, no paper, floor, backdrop, shadow, haze, text or frame.'};
});
await writeFile(new URL('../Brevanor/icon-prompts.json',import.meta.url),JSON.stringify({tool:'built-in image_gen',date:'2026-10-30',stylePreset:'fantasy-class-icon',alphaCleanupAuthorized:true,alphaApproval:'Fortgeltende Nutzerfreigabe: Ja, Alpha bereinigen.',realmSource:{file:source,archive:'Klassenordner/assets/images/brevanor/realm/brevanor-original.png',sha256:sha(bytes)},jobs},null,2)+'\n');
console.log(JSON.stringify({icons:jobs.length,stylePreset:'fantasy-class-icon'}));
