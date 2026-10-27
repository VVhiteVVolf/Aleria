import {readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const bundle=await readFile(resolve(root,'.build/app.js'),'utf8');
let html=await readFile(resolve(root,'index.html'),'utf8');
const svg=await readFile(resolve(root,'assets/mark.svg'),'utf8');
html=html.replaceAll('./assets/mark.svg',`data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`);
for(const match of [...html.matchAll(/<link rel="stylesheet" href="(.+?)">/g)]){
  const css=await readFile(resolve(root,match[1]),'utf8');
  html=html.replace(match[0],`<style>\n${css}\n</style>`);
}
html=html.replace('<script type="module" src="./app.mjs"></script>',`<script type="module">\n${bundle.replace(/<\/script/gi,'<\\/script')}\n</script>`);
html=html.replace('<!doctype html>','<!doctype html>\n<!-- Generated from modular source. Rebuild with npm run build. -->');
const output=resolve(root,'Ideenwerk.html');
await writeFile(output,html,'utf8');
console.log(`Eigenständige HTML-Datei erstellt: ${output} (${Math.round(Buffer.byteLength(html)/1024)} KB)`);
