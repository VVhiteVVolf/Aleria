import {buildEleganzClothingPrompt} from '../modules/goettliche-eleganz/eleganz-clothing-art.mjs';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {ELEGANZ_COLLECTION} from '../modules/goettliche-eleganz/eleganz-collection.mjs';
const preset=JSON.parse(await readFile(new URL('../docs/art/image-style-presets.json',import.meta.url),'utf8')).presets['fantasy-inventory-item'];
const entries=Object.entries(ELEGANZ_COLLECTION).flatMap(([category,items])=>items.map(item=>buildEleganzClothingPrompt(item,category,preset)));
const target=new URL('../assets/goettliche-eleganz/kleidung/image-prompts.json',import.meta.url);
await mkdir(new URL('./',target),{recursive:true});
await writeFile(target,JSON.stringify({schemaVersion:1,module:'Göttliche Eleganz',preset:'fantasy-inventory-item',userInstruction:'Weiße Puppe; Oberteil und Hosenansatz, keine Beine, Füße oder Schuhe',entries},null,2)+'\n');
console.log(`Kleidungs-Bildaufträge: ${entries.length}`);
