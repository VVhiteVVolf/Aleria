import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {getBrevanorClassDefinitions} from '../../AleriaAlmanach/modules/classes/brevanor/brevanor-class-registry.js';
const definitions=getBrevanorClassDefinitions();
const chapters=[['einfuehrung','Einführung'],['geschichte','Geschichte'],['faehigkeiten','Fähigkeiten'],['staerken-schwaechen','Stärken & Schwächen'],['kampfkunst','Kampfstil & Kampfkunst'],['ausstattung','Ausstattung'],['kultureller-status','Kultureller Status'],['unterarten','Unterarten'],['trivia','Verschiedenes'],['historische-figuren','Historische Figuren']];
for(const d of definitions){
 const dir=`Klassenordner/Brevanor/${d.classId}`;await mkdir(dir,{recursive:true});
 const document={schemaVersion:1,id:d.classId,cultureId:'brevanor',contentStatus:'not-authored',name:d.name,title:`Der ${d.name}`,subtitle:d.role,aliases:[],theme:'sea',icon:`../../assets/images/brevanor/icons/${d.classId}.webp`,illustration:'',facts:[],sections:chapters.map(([id,title])=>({id,title,status:'pending',html:''})),source:{kind:'author-instruction',date:'2026-10-30',note:'Namen und Rollen vom Nutzer festgelegt; einzelne Klassen vorerst unausgefüllt.'}};
 const previous=JSON.parse(await readFile(`${dir}/klasse.json`,'utf8'));
 if(previous.contentStatus!=='not-authored'||previous.id!==d.classId)throw Error('Nur eigenen frischen Entwurf neu schreiben');
 await writeFile(`${dir}/klasse.json`,JSON.stringify(document,null,2)+'\n');
}
const path='Klassenordner/Klassenseite.html';let html=await readFile(path,'utf8');
if(html.includes('id="brevanor"'))throw Error('Brevanor-Abschnitt existiert bereits');
const cards=definitions.map(d=>`        <a class="class-card${d.militia?' rarity-common':''}" href="Brevanor/${d.classId}/index.html" id="klasse-brevanor-${d.classId}" data-class-id="${d.classId}" data-entry-id="brevanor-${d.classId}"${d.militia?' data-militia="true"':''} data-tooltip="${d.role}" data-name="${d.name.toLowerCase()} brevanor" data-wappen="assets/images/brevanor/realm/brevanor.webp"><img src="assets/images/brevanor/icons/${d.classId}.webp" alt="" width="1024" height="1536" loading="lazy"><span class="class-name">${d.name}</span><span class="class-flavor">${d.role}</span></a>`).join('\n');
const section=`    <!-- BREVANOR -->\n    <section class="land-section section-brevanor" id="brevanor" data-class-group>\n      <div class="land-header header-brevanor"><img class="land-banner" src="assets/images/brevanor/realm/brevanor.webp" alt="Brevanor" loading="lazy"><div class="land-info"><h2>Brevanor</h2></div></div>\n      <div class="class-grid">\n${cards}\n      </div>\n    </section>\n`;
const closing=/(\r?\n {6}<\/div>\r?\n {6}<aside class="planned-groups")/;
if(!closing.test(html))throw Error('Registerabschluss fehlt');
html=html.replace(closing,'\n'+section+'$1');await writeFile(path,html);
console.log('8 leere Klassenquellen und Registerkarten erstellt.');
