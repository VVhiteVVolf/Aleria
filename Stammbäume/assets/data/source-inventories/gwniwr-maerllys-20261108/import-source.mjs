import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { createCadetHouseBranch, createMarriedAwayBranch } from '../../../js/data/family-record-builders.js';
import { createHouseProfileFromFolderPath } from '../../../js/domain/house-profile.js';
import { CELTIGERNS_WACHT_REGION_EMBLEMS } from '../../../js/data/celtigerns-wacht-house-profiles.js';
import { GWNIWR_EMBLEM, MAERLLYS_EMBLEM, GWNIWR_ELERI_WORLD_ID, CRAIGDDU_HYWEL_WORLD_ID } from '../../../js/data/gwniwr-maerllys-links.js';
const archive=new URL('.',import.meta.url);
export async function buildGwniwrSource(){
 const original=JSON.parse(await fs.readFile(new URL('gwniwr-original.json',archive),'utf8'));
 const family=structuredClone(original),revision=2;
 family.document.title='Familie Gwniwr';
 family.document.description='Alteingesessene Gwynthorer Schneiderfamilie hinter Nadel & Faden: langlebige schlichte bis gute Kleidung zu den niedrigsten Preisen der drei verwandten Schneidereien. Der ältere Maerllys-Zweig spaltete sich vor der Überlieferungslücke ab.';
 family.document.emblem=GWNIWR_EMBLEM;
 family.document.houseProfile=createHouseProfileFromFolderPath(['Cenyr','Celtigerns Wacht','Llamreis Ankunft','Gwynthor'],{rankId:'commoner',liegeHouseId:'house-draig',liegeHouseName:'Haus Draig',regionEmblems:{seat:CELTIGERNS_WACHT_REGION_EMBLEMS.seats.Gwynthor,barony:CELTIGERNS_WACHT_REGION_EMBLEMS.baronies['Llamreis Ankunft'],county:CELTIGERNS_WACHT_REGION_EMBLEMS.county,kingdom:CELTIGERNS_WACHT_REGION_EMBLEMS.kingdom}});
 const titles={'person-7b6c292b':'Gemeinsame Leitung von Nadel & Faden · Tuch und Werkstatt','person-f926e0da':'Gemeinsame Leitung von Nadel & Faden · Beratung und Aufträge','person-ece54bdb':'Schneidermeister · Nadel & Faden','person-cf831497':'Mithilfe im Familienladen · Ehefrau Hywel Craigddu’s'};
 for(const p of family.persons){
  const oldPortrait=p.portrait;
  if(oldPortrait)p.portrait=`assets/images/portraits/gwniwr/${p.id}${/\.png$/i.test(oldPortrait)?'.png':'.jpg'}`;
  if(titles[p.id])p.title=titles[p.id];
  if(p.id==='person-e847aa96'){p.extensions.legacyWorldPersonIds=[p.worldPersonId];p.name='Hywel Craigddu';p.worldPersonId=CRAIGDDU_HYWEL_WORLD_ID;p.houseId='house-craigddu';p.title='Waffenknecht in Gwynthor';p.portrait='assets/images/portraits/haus-craigddu/hywel-craigddu.png';p.notes='Die genealogische Schreibweise Hwyel ist eine Übertragung von Hywel Craigddu (1708), bereits als Eleris Ehemann in der Craigddu-Akte belegt. Seine frühere Gwniwr-Kartenkennung bleibt erhalten; die Weltidentität ist mit Craigddu identisch.';}
  if(p.id==='person-cf831497'){p.worldPersonId=GWNIWR_ELERI_WORLD_ID;p.notes='Tochter Emyr Gwniwrs und Gwenllians, Schwester Tudurs. Eleri heiratete Hywel Craigddu und hilft mit ihren Kindern in Nadel & Faden. Die sieben Töchter stehen ausschließlich in der Craigddu-Akte.';}
  if(p.portrait)p.extensions={...p.extensions,registryManagedFields:['portrait','title','name','worldPersonId','houseId','notes'],registryManagedFieldRevisions:Object.fromEntries(['portrait','title','name','worldPersonId','houseId','notes'].map(k=>[k,revision])),registryManagedFieldPreviousValues:{portrait:[oldPortrait].filter(Boolean)}};
 }
 family.houses[0]={...family.houses[0],name:'Gwniwr',emblem:GWNIWR_EMBLEM,extensions:{registryManagedFields:['name','emblem'],registryManagedFieldRevisions:{name:revision,emblem:revision}}};
 family.houses.push({id:'house-maerllys',name:'Haus Maerllys',motto:'',emblem:MAERLLYS_EMBLEM,status:'active'},{id:'house-craigddu',name:'Haus Craigddu',motto:'',emblem:'assets/images/houses/Llamreis Ankunft/Bürgerliche/Gwynthor/Craigddu.png',status:'active'});
 family.partnerships.find(m=>m.id==='partnership-ce644db9').extensions.crossFamilyRelationship={linkId:'marriage-hywel-craigddu-eleri-gwniwr',counterpartFamilyId:'craigddu'};
 family.partnerships.find(m=>m.id==='partnership-4503ed32').extensions.chartAlignChildGroupBelowParentPair=true;
 family.cadetBranches.push(createCadetHouseBranch({id:'maerllys-branch-gwniwr',name:'Haus Maerllys',parentPartnershipId:family.lineage.founderPartnershipId,houseId:'house-maerllys',targetFamilyId:'haus-maerllys',emblem:MAERLLYS_EMBLEM,crestFrame:'iron',notes:'Historische Abspaltung vor dem Zeitsprung; Zeitpunkt und einzelne Ahnen sind nicht überliefert.'}),createMarriedAwayBranch({id:'married-away-eleri-craigddu-gwniwr',name:'Haus Craigddu',parentPartnershipId:'partnership-ce644db9',houseId:'house-craigddu',targetFamilyId:'craigddu',emblem:'assets/images/houses/Llamreis Ankunft/Bürgerliche/Gwynthor/Craigddu.png',crestFrame:'iron',notes:'Eleris und Hywels sieben Töchter stehen ausschließlich in der fortführenden Craigddu-Akte.'}));
 family.timeJumps[0]={...family.timeJumps[0],toYear:'1680',label:'Nicht einzeln überlieferte Generationen bis Emyr Gwniwr',notes:'Der ältere Maerllys-Zweig spaltete sich bereits vor dieser Lücke ab. Keine unmittelbare Elternschaft zum unbekannten Gründerpaar.'};
 for(const branch of family.cadetBranches)branch.extensions.chartAlignBelowPartnership=true;
 family.lineage.crestFrame='iron';
 family.extensions={...family.extensions,sourceRevision:revision,chartLayoutPolicy:'strict-v1',blankFamily:false,pendingDescendantReview:false,
  registry:{...family.extensions.registry,folderPath:['Cenyr','Celtigerns Wacht','Llamreis Ankunft','Gwynthor'],unclassified:false},
  registryManagedDocumentFields:['title','description','emblem'],registryManagedHouseProfileFields:['rankId','seat','barony','county','kingdom','liegeHouseId','liegeHouseName','regionEmblems'],
  registryManagedRecordFields:['folderPath'],registryManagedLineageFields:['crestFrame'],
  sourceNote:'Gelieferte JSON und Hausprosa vom 8. November 2026; vorhandene öffentliche Gwniwr-Akte Revision1 und alle Karten-/Beziehungskennungen erhalten. Hwyel anhand der bestehenden Craigddu-Akte zu Hywel korrigiert. Eleris Gwniwr-Herkunft beidseitig verbunden. Gwniwr-Gründer bleiben unbekannte Quellenplatzhalter ohne Almanachakten. Maerllys-Abspaltung ist ausdrückliche Nutzerfestlegung; fehlende Generationen bleiben offen.'};
 return family;
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
 const family=await buildGwniwrSource();
 const content=`// Generated from the retained, reviewed Gwniwr source.\nexport const HOUSE_GWNIWR_FAMILY = Object.freeze(${JSON.stringify(family,null,2)});\n`;
 const target=new URL('../../../js/data/house-gwniwr-family.js',archive);
 if(process.argv.includes('--check')){if(await fs.readFile(target,'utf8')!==content)throw Error('Gwniwr source output outdated');}
 else if(process.argv.includes('--emit'))await fs.writeFile(target,content);
 else throw Error('Choose --emit or --check');
 console.log(JSON.stringify({family:'gwniwr',persons:family.persons.length,revision:family.extensions.sourceRevision}));
}
