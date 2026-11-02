import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { FAMILY_REGISTRY } from '../../Stammbäume/assets/js/data/families.registry.js';
import { createFamilyCandidates } from '../modules/character-genealogy/genealogy-mapping.js';
import { buildCharacterDatabase } from '../../CharakterDatenbank/lib/character-database-model.mjs';
import { mergeCharacterRecordProjections } from '../../CharakterDatenbank/lib/character-record-projections.mjs';
import { mergeCharacterExportAssignments } from '../../CharakterDatenbank/lib/character-export-assignments.mjs';
import { mergeCharacterImageLibrary } from '../modules/characters/character-import-policy.js';
import { AUTHORED_ITEMS } from '../modules/item-definitions/authored-item-catalog.js';
import { GWYNTHOR_SEVEN, GWYNTHOR_SEVEN_FEATURE } from '../modules/gwynthor-seven/roster.mjs';
import { buildGwynthorCharacter } from '../modules/gwynthor-seven/character-content.mjs';
import { hasKnightStartingPossessionsProjection } from '../modules/gwynthor-seven/starting-possessions-database.mjs';
import { createGwynthorBiographyCompanions } from '../modules/gwynthor-seven/biography-companions.mjs';
import { GWYNTHOR_BIOGRAPHY_CONTENT } from '../modules/gwynthor-seven/biography-content.mjs';
import { buildBiographyExportPayload } from '../../js/biography/biography-transfer.mjs';

const root=new URL('../../',import.meta.url);
const read=async path=>JSON.parse(await readFile(new URL(path,root),'utf8'));
const [registry,snapshot,report,online,avatars]=await Promise.all([
 read('CharakterDatenbank/registry.json'),read('CharakterDatenbank/generated/characters.snapshot.json'),read('CharakterDatenbank/generated/sync-report.json'),
 read('diagnostics/gwynthor-seven-20261102/online-before.json'),read('diagnostics/gwynthor-seven-20261102/avatar-export-receipt.json')]);
const now=online.capturedAt;
const exports=[];
for(const spec of GWYNTHOR_SEVEN) {
 const family=FAMILY_REGISTRY.find(r=>r.id===spec.familyId);
 const person=family.family.persons.find(p=>p.id===spec.personId);
 const matches=online.characters.filter(c=>{
  const identity=c.identity?.worldPersonId||c.genealogy?.worldPersonId;
  return c.id===spec.existingId||identity===person.worldPersonId||(!identity&&(c.name===person.name||c.name===`${person.name} ${spec.houseFolder}`));
 });
 if(matches.length>1)throw Error(`Mehrdeutige Online-Figur: ${person.name}`);
 const existing=matches[0] || snapshot.characters.find(c=>c.id===(spec.existingId||person.worldPersonId)&&c.localRecord?.authoredFeature!==GWYNTHOR_SEVEN_FEATURE);
 const contentPath=`Familien Häuser und Clans/Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Haus_${spec.houseFolder}/haus.content.mjs`;
 const {HOUSE_CONTENT:content}=await import(new URL(contentPath,root));
 let character=buildGwynthorCharacter({spec,family,content,existing,items:AUTHORED_ITEMS,now});
 const personAvatars=avatars.filter(a=>a.person===character.name);
 if(personAvatars.length) {
  if(personAvatars.length!==27)throw Error(`Unvollständige Avatarsets: ${character.name}`);
  const setNames=['Alltag und Gespräch','Gefühle und Begegnungen','Eigenwillige Gesten'];
  const sets=[1,2,3].map(set=>({id:`gwynthor-20261102-set-${set}`,name:`Set ${set} · ${setNames[set-1]}`,portrait:character.portrait,
   emotes:personAvatars.filter(a=>a.set===set).map(a=>({name:`${setNames[set-1]} ${a.panel}`,img:`/AleriaAlmanach/assets/gwynthor-seven/avatars/${a.slug}/${a.file}`}))}));
  character=mergeCharacterImageLibrary(existing||{}, {...character,imageSets:sets,activeImageSetId:sets[0].id});
 }
 const sourcePath=`Charakter Archiv Exporte/Gwynthor Sieben/${spec.personId}.json`;
 exports.push({type:'aleria-character',version:1,exportedAt:now,mergeStrategy:'replace-exported-fields',assignedTab:'Gwynthor',sourcePath,character});
}
const charTabs=mergeCharacterExportAssignments(snapshot.charTabs,exports);
const candidates=GWYNTHOR_SEVEN.flatMap(spec=>createFamilyCandidates(FAMILY_REGISTRY.find(r=>r.id===spec.familyId)));
const records=exports.flatMap(e=>buildCharacterDatabase({characters:[e.character],charTabs,exportedAt:now},candidates,{sourcePath:e.sourcePath}).records);
for(const item of records) {
 const previous=registry.records.find(r=>r.firestoreDocumentId===item.snapshotCharacter.id);
 if(previous){const old=await read(`CharakterDatenbank/${previous.path}`);item.record.local={...old.local,authoredFeature:GWYNTHOR_SEVEN_FEATURE};item.path=previous.path;}
 else item.record.local.authoredFeature=GWYNTHOR_SEVEN_FEATURE;
 item.snapshotCharacter.localRecord.authoredFeature=GWYNTHOR_SEVEN_FEATURE;
}
const result=mergeCharacterRecordProjections({registry,snapshot,report},records,exports,charTabs);
const companions=exports.flatMap(entry=>createGwynthorBiographyCompanions(entry.character,now));
const publicBiographies=await read('js/biography/sources/public-biographies.json');
const training=await read('js/biography/sources/knight-training.json');
for (const entry of exports.filter(entry=>companions.some(creature=>creature.itemOrigin.ownerCharacterId===entry.character.id))) {
 const row=publicBiographies.entries.find(row=>row.worldPersonIds.includes(entry.character.id));
 if(!row)throw Error(`Öffentliche Biografie-Zuordnung fehlt: ${entry.character.name}`);
 const fingerprint=globalThis.AleriaBiographyCards.narrativeFingerprint;
 row.replacedFingerprints=[...new Set([...row.replacedFingerprints,fingerprint(row.biography),fingerprint(entry.character.biography)])];
 row.biography=entry.character.biography;
 row.source='AleriaAlmanach/modules/gwynthor-seven/biography-content.mjs · Autorenfestlegung vom 2. November 2026';
 training.entries[entry.character.id]=entry.character.biography.biography.knightMentors.map(({name,role,detail})=>({name,role,detail}));
}
const hasPublishedInventory=hasKnightStartingPossessionsProjection(registry,snapshot);
const outputs=[...exports.map(e=>[e.sourcePath,e]),...(!hasPublishedInventory?records.map(r=>[`CharakterDatenbank/${r.path}`,r.record]):[]),
 ...companions.map(creature=>[`Charakter Archiv Exporte/Gwynthor Sieben/${creature.id}.json`,{type:'aleria-creature',version:1,creature}]),
 ...exports.filter(entry=>GWYNTHOR_BIOGRAPHY_CONTENT[entry.character.id.split('--').at(-1)]).map(entry=>[
  `Charakter Archiv Exporte/Gwynthor Sieben/${entry.character.id.split('--').at(-1)}-biografie.json`,
  {...buildBiographyExportPayload({biographyModule:entry.character.biography,personId:entry.character.id,personName:entry.character.name,
   baseUrl:'https://dieweltvonaleria.netlify.app/AleriaAlmanach/'}),exportedAt:now}]),
 ...Object.entries(GWYNTHOR_BIOGRAPHY_CONTENT).map(([id,content])=>[
  `Charakter Archiv Exporte/Gwynthor Sieben/${id}-biografie.txt`,
  [content.title,'Biografie',...content.introduction,content.historyTitle,...content.history,
   ...content.sections.flatMap(section=>[section.title,...section.paragraphs])].join('\n\n')+'\n']),
 ['js/biography/sources/public-biographies.json',publicBiographies],['js/biography/sources/knight-training.json',training],
 ...(!hasPublishedInventory?[['CharakterDatenbank/registry.json',result.registry],['CharakterDatenbank/generated/characters.snapshot.json',result.snapshot],['CharakterDatenbank/generated/sync-report.json',result.report]]:[]),
 ['AleriaAlmanach/modules/gwynthor-seven/source/character-plan.json',{feature:GWYNTHOR_SEVEN_FEATURE,characters:exports.map(e=>e.character),creatures:companions}]];
for(const [path,data]of outputs){const text=typeof data==='string'?data:JSON.stringify(data,null,2)+'\n',url=new URL(path,root);
 if(process.argv.includes('--check')){if(await readFile(url,'utf8')!==text)throw Error(`Veralteter Figurenstand: ${path}`);}
 else {await mkdir(new URL('.',url),{recursive:true});await writeFile(url,text);}}
console.log(JSON.stringify({characters:exports.map(e=>({id:e.character.id,name:e.character.name,level:e.character.combatProfile.progression.level,inventory:e.character.inventory.items.length,techniques:e.character.combatProfile.techniques.length})),databaseProjectionOwner:hasPublishedInventory?'confirmed-starting-possessions-import':'seven-person-seed',unrelatedPreserved:snapshot.characters.filter(c=>!exports.some(e=>e.character.id===c.id)).length}));
