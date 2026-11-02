import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { relative } from 'node:path';
const root=fileURLToPath(new URL('../../',import.meta.url));
const sources=JSON.parse(readFileSync(new URL('baseline-sources.json',import.meta.url),'utf8'));
const baseline=new Set([
 'Stammbäume/assets/js/modules/person-biography/person-biography-model.js',
 'Stammbäume/assets/js/modules/person-biography/person-biography-renderer.js',
 'Stammbäume/assets/js/modules/person-biography/person-biography-content.js',
 'Stammbäume/assets/js/modules/person-biography/person-biography-dialog.js',
 'Stammbäume/assets/js/modules/biography-page/biography-page-renderer.js',
 'Stammbäume/assets/js/ui/app-controller.js',
 'AleriaAlmanach/modules/biography/biography-card-rendering.js'
]);
export async function load(url,context,nextLoad){
 if(url.startsWith('file:')){
  const path=relative(root,fileURLToPath(new URL(url))).replaceAll('\\','/');
  if(baseline.has(path))return{format:'module',source:sources[path],shortCircuit:true};
 }
 return nextLoad(url,context);
}
