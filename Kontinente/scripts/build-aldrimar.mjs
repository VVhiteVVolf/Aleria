import { readFile, writeFile, mkdir } from 'node:fs/promises';
import vm from 'node:vm';
import { renderKingdomPage } from '../modules/aldrimar/kingdom-template.mjs';
import { renderOfficesPage } from '../modules/aldrimar/offices-template.mjs';
import { renderSuccessionPage } from '../modules/aldrimar/succession-template.mjs';
import { renderBiography } from '../modules/aldrimar/biography-template.mjs';
import { succession } from '../modules/aldrimar/succession-data.mjs';
import { kingdom } from '../modules/aldrimar/kingdom-data.mjs';

const context={window:{}};
vm.runInNewContext(await readFile(new URL('../modules/administration/administration-content.js',import.meta.url),'utf8'),context);
const pages=[['Königreich von Aldrimar.html',renderKingdomPage(context.window.ALERIA_ADMINISTRATION_CONTENT.areas)],['aemter.html',renderOfficesPage()],['kronfolge.html',renderSuccessionPage()],...succession.monarchs.map(m=>[m.page,renderBiography(m,succession.monarchs)])];
const check=process.argv.includes('--check');
const cardsFile=new URL('../modules/aldrimar/kingdom.cards.generated.json',import.meta.url);
const cards=JSON.stringify({councilGroups:kingdom.councilGroups,clans:kingdom.clans},null,2)+'\n';
if(check){if(await readFile(cardsFile,'utf8')!==cards)throw new Error('Aldrimars Rats- und Clankarten sind veraltet.');}
else await writeFile(cardsFile,cards,'utf8');
for(const [name,html] of pages){
  const file=new URL('../Estryll/Königreich Aldrimar/'+name,import.meta.url);
  if(check){if(await readFile(file,'utf8')!==html)throw new Error(name+' ist veraltet. build-aldrimar.mjs ausführen.');}
  else {await mkdir(new URL('./',file),{recursive:true});await writeFile(file,html,'utf8');}
}
console.log(`Aldrimar: ${pages.length} Seiten ${check?'geprüft':'erzeugt'}.`);
