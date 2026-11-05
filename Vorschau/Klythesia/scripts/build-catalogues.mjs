/** Project reviewed source reports into the country page, without inventing entities. */
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {HOUSES} from '../house-data.mjs';
const root = new URL('../',import.meta.url);
const workspace=new URL('../../../',import.meta.url);
const read = async name => JSON.parse(await readFile(new URL(name,root),'utf8'));
const [religion,cross,map,imports,inventory,amendment] = await Promise.all([
  read('sources/religion-evidence.json'),read('sources/cross-source-evidence.json'),
  read('sources/map-evidence.json'),read('source-import.json'),read('assets.source.json'),
  read('sources/lore-amendment-20261104.json')
]);
const amendedFact=fact=>({...fact,...(amendment.factOverrides[fact.id]??{})});
const amendedIssues=issues=>issues.filter(issue=>!amendment.resolvedIssueIds.includes(issue.id))
  .map(issue=>({...issue,...(amendment.issueOverrides[issue.id]??{})}));
religion.facts=religion.facts.map(amendedFact);
religion.conflicts=amendedIssues(religion.conflicts);
religion.counts={...religion.counts,openItems:religion.conflicts.length};
religion.ranks=religion.ranks.map(rank=>rank.id==='hohe-matriarchin'?{...rank,
  text:'Die oberste Matriarchin der Anássai-Herrscherfamilie ist Kyreons Gemahlin und Hohepriesterin. Sie führt die weibliche Tempelhierarchie und verbindet Landesführung und religiöse Praxis im Dienst des Gottkönigs.',
  source:{path:'Vorschau/Klythesia/sources/lore-amendment-20261104.json',section:'Herrscherfamilie und Hohepriesterin'}}:rank);
religion.additionalRoles=religion.additionalRoles.map(role=>({...role,
  text:'Oberhaupt eines Frauenclans. Die oberste Matriarchin der Herrscherfamilie ist Kyreons Gemahlin und Hohepriesterin; städtische Polemístriai und kleinere Hiéreiai bilden die weiteren adligen Clangruppen.',
  source:{path:'Vorschau/Klythesia/sources/lore-amendment-20261104.json',section:'Weltliche Clanordnung'}}));
cross.facts=cross.facts.map(fact=>fact.id==='shared-language'?{...fact,
  text:'Stoicheia ist weiterhin die gemeinsame Sprache und Schrift Phalantias und Klythesias. Ihre Sprecher gehen auf die Aechanath zurück. Nach Zarakhuls aufgezwungener dunkler Sprache zerstreute Orin die Zungen der Unterjochten; deshalb ist die heutige Sprache kein ungebrochener albischer oder nordischer Dialekt. Die gemeinsame Sprache überdauerte Kyreons Befreiung der westlichen Städte.',
  source:{path:'AleriaAlmanach/modules/language/TIRNARA_LANGUAGE_HISTORY.md',section:'Stoicheia und Orins Zungenverwirrung'},
  limits:'Die Überlieferung der gesprochenen Sprache ist von der weitergegebenen Schriftlinie zu unterscheiden.'}:fact);
cross.openQuestions=amendedIssues(cross.openQuestions);
cross.sources.push({path:'AleriaAlmanach/modules/language/TIRNARA_LANGUAGE_HISTORY.md',note:'Neu abgeglichene Sprachgeschichte nach der Nutzerfestlegung.'});
religion.sources.push({path:'Vorschau/Klythesia/sources/lore-amendment-20261104.json',note:'Aktuelle Nutzerfestlegung; frühere Rechercheberichte bleiben als historischer Stand erhalten.'});
for(const source of [...religion.sources,...cross.sources]){
  const bytes=await readFile(new URL(source.path,workspace));
  source.sha256=createHash('sha256').update(bytes).digest('hex');
}
const writeModule = (name,entries) => writeFile(new URL(name,root),
  '// Generated from reviewed local source inventories; run scripts/build-catalogues.mjs.\n'+
  entries.map(([key,value])=>'export const '+key+' = '+JSON.stringify(value,null,2)+';').join('\n')+'\n');
const select = (data,keys) => Object.fromEntries(keys.map(key=>[key,data[key]??[]]));
const arts = imports.files.filter(item=>item.kind!=='map').map(item=>{
  const evidence=map.suppliedEmblems.find(entry=>entry.file===item.source);
  const original=inventory.find(entry=>entry.sourceFile===item.source);
  if(!evidence||!original)throw new Error('Missing reviewed evidence for '+item.source);
  const house=HOUSES.find(house=>house.sourceFile===item.source);
  return {id:item.id,kind:house?'house':item.kind,name:house?.name??item.name,sourceFile:item.source,
    image:item.previews[0].file,fullsize:item.archive,dimensions:original.dimensions,
    observation:evidence.observation,assignment:house?`Clanvorschlag ${house.name}; Ausgangssitz ${house.sourceSeat}.`:evidence.assignment,
    ...(house?{houseId:house.id}:{})};
});
const variant={number:1,short:'Gelieferte Klythesia-Karte',file:'Klythesia.png',
  map:imports.files.find(item=>item.kind==='map').previews[0].file,
  original:imports.files.find(item=>item.kind==='map').archive,
  imageSize:map.source.imageSize,bakedNames:true,clans:[],
  settlements:map.settlements.map(place=>({...place,capitalStatus:place.id==='kallisteia'?'Hauptstadt im Landesentwurf.':undefined,
    point:place.pixelCentre.map((value,index)=>100*value/map.source.imageSize[index]),overlayLabel:false}))};
await Promise.all([
  writeModule('art-data.mjs',[['ARTWORKS',arts]]),
  writeModule('map-data.mjs',[['MAP',variant],['MAP_OBSERVATIONS',map.observations],['MAP_QUESTIONS',amendedIssues(map.openQuestions)]]),
  writeModule('evidence-data.mjs',[
    ['RELIGION',select(religion,['categories','perspectives','sources','counts','facts','deities','ranks','additionalRoles','conflicts'])],
    ['CROSS_SOURCES',select(cross,['sources','facts','conflicts','openQuestions','sourceNotes'])]
  ])
]);
console.log(JSON.stringify({artworks:arts.length,mapPlaces:variant.settlements.length,
  facts:religion.facts.length+cross.facts.length,deities:religion.deities.length,religiousRanks:religion.ranks.length}));
