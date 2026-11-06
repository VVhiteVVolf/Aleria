import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {ARTWORKS} from '../art-data.mjs';
import {MAP,MAP_OBSERVATIONS,MAP_QUESTIONS} from '../map-data.mjs';
import {RELIGION,CROSS_SOURCES} from '../evidence-data.mjs';
import {REALM_CONTEXT} from '../realm-context.mjs';
import {ESTATES,ESTATE_CONTEXT} from '../estate-data.mjs';
import {CLASS_PROTOTYPES,HOUSE_WARRIORS} from '../warrior-data.mjs';
import {HOUSES} from '../house-data.mjs';
import {REALM_WARRIOR} from '../realm-warrior-data.mjs';
import {SETTLEMENTS,REGIONS,createMapProposal} from '../territory-data.mjs';
import {createHousePlacementState} from '../placement-state.mjs';
import {renderKlythesiaPage} from '../proposal-render.mjs';
import {renderFact,sourceLink} from '../evidence-view.mjs';
import {isAuthoringArchive} from '../../../netlify/build/publication-policy.mjs';
import {readReligionCatalog} from '../../../Religionen/modules/content/content-repository.mjs';
import {renderReligionEntry} from '../../../Religionen/modules/content/page-template.mjs';

const root=new URL('../',import.meta.url),workspace=new URL('../../../',import.meta.url);
const readJson=async path=>JSON.parse(await readFile(new URL(path,root),'utf8'));
const hash=buffer=>createHash('sha256').update(buffer).digest('hex');
const html=renderKlythesiaPage({religion:RELIGION,cross:CROSS_SOURCES,map:MAP,
  observations:MAP_OBSERVATIONS,mapQuestions:MAP_QUESTIONS,artworks:ARTWORKS,
  context:REALM_CONTEXT,estates:ESTATES,estateContext:ESTATE_CONTEXT,prototypes:CLASS_PROTOTYPES,houses:HOUSES,realmWarrior:REALM_WARRIOR});

test('Current user amendments supersede old claims without mutating historic evidence',async()=>{
  const [baseline,amendment]=await Promise.all([readJson('sources/religion-evidence.json'),readJson('sources/lore-amendment-20261104.json')]);
  assert.equal(RELIGION.facts.length,baseline.facts.length);
  for(const prior of baseline.facts){
    const current=RELIGION.facts.find(fact=>fact.id===prior.id);
    assert(current);
    assert.equal(current.text,amendment.factOverrides[prior.id]?.text??prior.text);
  }
  assert(baseline.facts.find(fact=>fact.id==='religious-origin').text.includes('Zeit der Hohen Drei'));
  assert(RELIGION.facts.find(fact=>fact.id==='religious-origin').text.includes('Zerfall des Alerischen Kaiserreiches'));
});

test('All 51 evidence facts render exactly once with provenance',()=>{
  const facts=[...RELIGION.facts,...CROSS_SOURCES.facts];
  assert.equal(facts.length,51);assert.equal(new Set(facts.map(fact=>fact.id)).size,51);
  for(const fact of facts){
    assert.equal(html.split(`data-fact-id="${fact.id}"`).length-1,1,fact.id);
    assert(fact.source.path&&renderFact(fact).includes('Fundstelle'),fact.id);
  }
});

test('Shared history follows the authorized order and introduces no exact years',()=>{
  assert.deepEqual(REALM_CONTEXT.history.map(item=>item.id),['aechanath','zarakhul','orin','fragmentation','phalantia','empire','rebellion','present']);
  const history=REALM_CONTEXT.history.map(item=>item.text).join(' ');
  for(const term of ['Aechanath','Aechneach','Zarakhul','Orin','Leukonia','Wüste','Alerische','Kyreon'])assert(history.includes(term),term);
  assert(!/\b\d{3,4}\b/.test(history));
  assert(history.includes('westlichen Städte'));
  assert(!history.includes('Ordan verwirrte'));
});

test('The unique Theios and seven singular estates distinguish freedom, sex and temple office',()=>{
  assert.deepEqual(ESTATES.map(estate=>estate.name),['Theíos','Anássa','Polemístria','Hiéreia','Ergatíde','Synoikos','Doulos','Doule']);
  assert.equal(ESTATES.filter(estate=>estate.unique).length,1);
  assert.equal(ESTATES.find(estate=>estate.unique).person,'Kyreon');
  assert(ESTATES.find(estate=>estate.id==='anassa').description.includes('Gemahlin'));
  assert(ESTATES.find(estate=>estate.id==='doulos').description.includes('keine automatische Freilassung'));
  assert(ESTATES.find(estate=>estate.id==='synoikos').description.includes('freie Männer'));
  assert.equal(ESTATES.filter(estate=>estate.id==='antrophe').length,0);
  assert(ESTATE_CONTEXT.addresses.some(item=>item.text.includes('eigene religiöse Hierarchie')));
});

test('Seven prototypes preserve the assigned sex, weapons and helmet families',()=>{
  assert.deepEqual(CLASS_PROTOTYPES.map(item=>item.id),['helot','antrophe','thorax','toxare','myrmex','xiphone','thyrsia']);
  assert.equal(CLASS_PROTOTYPES.filter(item=>item.gender==='male').length,1);
  assert(CLASS_PROTOTYPES.find(item=>item.id==='antrophe').elite);
  assert(CLASS_PROTOTYPES.find(item=>item.id==='toxare').mounted);
  for(const [id,term]of [['thorax','Hoplon'],['toxare','Kurzbogen'],['myrmex','Wurfnetz'],['xiphone','Rhomphaia'],['thyrsia','Kopis']])assert(CLASS_PROTOTYPES.find(item=>item.id===id).equipment.includes(term));
});

test('Each mapped place has one initial clan and the capital has the ruler family',()=>{
  assert.equal(SETTLEMENTS.length,7);assert.equal(HOUSES.length,7);
  assert.equal(new Set(HOUSES.map(house=>house.id)).size,7);
  assert.equal(new Set(HOUSES.map(house=>house.sourceSeat)).size,7);
  assert(HOUSES.every(house=>SETTLEMENTS.some(city=>city.id===house.sourceSeat)));
  assert.equal(HOUSES.filter(house=>house.royal).length,1);
  assert.equal(HOUSES.find(house=>house.royal).sourceSeat,'kallisteia');
  assert.equal(SETTLEMENTS.find(city=>city.capital).id,'kallisteia');
  assert(REGIONS.every(region=>!region.polygon));
});

test('Names change presentation while all five supplied motif bytes and provenance survive',()=>{
  const supplied=HOUSES.filter(house=>house.sourceFile);
  assert.equal(supplied.length,5);
  assert(supplied.every(house=>!['Hydra','Mantikor','Phönix','Satyr','Sphinx'].includes(house.name)));
  for(const house of supplied){
    const art=ARTWORKS.find(art=>art.sourceFile===house.sourceFile);
    assert.equal(art.name,house.name);assert.equal(art.houseId,house.id);
    assert.equal(art.fullsize,house.fullsize);
  }
});

test('The seven supplied PNG originals remain byte-identical to the download',async()=>{
  const config=await readJson('source-import.json'),inventory=await readJson('assets.source.json');
  assert.equal(config.files.length,7);assert.equal(inventory.length,7);
  for(const file of config.files){
    const [source,archived]=await Promise.all([readFile(config.sourceDirectory+'/'+file.source),readFile(new URL(file.archive,root))]);
    const item=inventory.find(item=>item.sourceFile===file.source);
    assert(source.equals(archived),file.source);assert.equal(hash(archived),item.sha256,file.source);
    assert.deepEqual([archived.readUInt32BE(16),archived.readUInt32BE(20)],item.dimensions,file.source);
  }
});

test('Every requested comic, prototype and clan emblem has both active image paths',async()=>{
  for(const art of [...ESTATES,...CLASS_PROTOTYPES,...HOUSES,...HOUSE_WARRIORS,REALM_WARRIOR]){
    for(const path of [art.image,art.fullsize])assert((await stat(new URL(path,root))).size>0,path);
  }
});

test('Each clan has its own Thorax figure without changing the seven class prototypes',()=>{
  assert.equal(HOUSE_WARRIORS.length,7);
  assert.equal(new Set(HOUSE_WARRIORS.map(warrior=>warrior.image)).size,7);
  for(const house of HOUSES){
    const warrior=HOUSE_WARRIORS.find(warrior=>warrior.houseId===house.id);
    assert.equal(warrior.prototypeId,'thorax');assert.equal(house.prototypeId,'thorax');
    assert(warrior.geography&&warrior.image.includes(`house-${house.id}`));
  }
  assert.equal(CLASS_PROTOTYPES.length,7);
});

test('The seven named map anchors and supplied map dimensions are retained',()=>{
  assert.deepEqual(MAP.imageSize,[1226,1017]);
  assert.deepEqual(MAP.settlements.map(place=>place.name),['Draxilion','Kallisteia','Aenoria','Therascia','Lykara','Gorgothis','Xalmira']);
  for(const city of SETTLEMENTS)assert.deepEqual(city.point,MAP.settlements.find(place=>place.id===city.id).point);
  const proposal=createMapProposal({houses:HOUSES,placements:Object.fromEntries(HOUSES.map(house=>[house.id,house.sourceSeat]))});
  assert.equal(proposal.clans.length,7);
  assert(proposal.clans.every(clan=>!clan.crest.startsWith('assets/')));
  assert.equal(MAP_OBSERVATIONS.length,5);
});

test('Draft movement, serialization, restore and undo preserve ranks and atomically reject foreign drafts',()=>{
  const state=createHousePlacementState({houses:HOUSES,settlements:SETTLEMENTS});
  assert.equal(state.current().klyrath,'kallisteia');
  state.move('klyrath','xalmira');assert.equal(state.current().klyrath,'xalmira');
  const saved=JSON.parse(state.serialize());
  const restored=createHousePlacementState({houses:HOUSES,settlements:SETTLEMENTS});restored.restore(saved);
  assert.equal(restored.current().klyrath,'xalmira');
  state.undo();assert.equal(state.current().klyrath,'kallisteia');
  const before=restored.current();assert.throws(()=>restored.restore({...saved,realm:'phalantia'}));
  assert.deepEqual(restored.current(),before);
  assert(HOUSES.find(house=>house.id==='klyrath').royal);
});

test('Seven/nine remains open while the established kingship and class questions are resolved',()=>{
  assert.equal(RELIGION.deities.length,14);assert.equal(RELIGION.ranks.length,12);
  assert.equal(RELIGION.deities.filter(deity=>deity.group==='goettin').length,7);
  assert(RELIGION.conflicts.find(issue=>issue.id==='goddess-count').type==='source-contradiction');
  const open=[...RELIGION.conflicts,...CROSS_SOURCES.openQuestions,...MAP_QUESTIONS];
  for(const id of ['divine-kingship-and-matriarchy','country-order','warrior-design','capital','emblem-assignments'])assert(!open.some(issue=>issue.id===id));
  assert(RELIGION.conflicts.find(issue=>issue.id==='founder-current-status').text.includes('gegenwärtige Herrschaft ist festgelegt'));
});

test('Active source hashes and source JSON pointers match current files',async()=>{
  const documents=new Map();
  for(const source of [...RELIGION.sources,...CROSS_SOURCES.sources]){
    const bytes=await readFile(new URL(source.path,workspace));
    if(source.sha256)assert.equal(hash(bytes),source.sha256,source.path);
  }
  async function visit(value){
    if(!value||typeof value!=='object')return;
    if(value.path&&value.pointer){
      if(!documents.has(value.path))documents.set(value.path,JSON.parse(await readFile(new URL(value.path,workspace),'utf8')));
      let data=documents.get(value.path);
      for(const part of value.pointer.split('/').slice(1)){data=data[part.replace(/~1/g,'/').replace(/~0/g,'~')];assert.notEqual(data,undefined,value.path+value.pointer);}
    }
    for(const item of Object.values(value))await visit(item);
  }
  await visit(RELIGION);
});

test('Historical religion snapshots match the original source hashes',async()=>{
  const baseline=await readJson('sources/religion-evidence.json');
  for(const source of baseline.sources.filter(item=>item.path.startsWith('Religionen/religionen/zirkel-des-ewigen-waldes/'))){
    const name=source.path.split('/').at(-1);
    assert.equal(hash(await readFile(new URL('sources/religion-before-20261104/'+name,root))),source.sha256,name);
  }
});

test('The active religion renderer contains current foundations and preserves all deity IDs',async()=>{
  const catalog=readReligionCatalog(),entry=catalog.entries.find(item=>item.id==='zirkel-des-ewigen-waldes');
  const actual=await readFile(new URL('Religionen/religionen/zirkel-des-ewigen-waldes/index.html',workspace),'utf8');
  assert.equal(actual.replace(/\r\n/g,'\n'),renderReligionEntry(catalog,entry));
  assert(actual.includes('Aechanath')&&actual.includes('Aechneach')&&actual.includes('Orin'));
  assert(actual.includes('Kyreons Gemahlin und Hohepriesterin'));
  assert(!actual.includes('Pantheon, das zur Zeit der Hohen Drei'));
});

test('Religion amendments preserve deity groups, doctrines and unrelated temple ranks',async()=>{
  const originalEntry=await readJson('sources/religion-before-20261104/eintrag.json');
  const originalTradition=await readJson('sources/religion-before-20261104/glaube.json');
  const currentEntry=JSON.parse(await readFile(new URL('Religionen/religionen/zirkel-des-ewigen-waldes/eintrag.json',workspace),'utf8'));
  const currentTradition=JSON.parse(await readFile(new URL('Religionen/religionen/zirkel-des-ewigen-waldes/glaube.json',workspace),'utf8'));
  assert.deepEqual(currentTradition.groups,originalTradition.groups);
  assert.deepEqual(currentTradition.hierarchy.entries.slice(1),originalTradition.hierarchy.entries.slice(1));
  for(const id of ['doktrine','nebengoetter','feindbilder'])assert.deepEqual(currentEntry.sections.find(section=>section.id===id),originalEntry.sections.find(section=>section.id===id));
  for(const key of ['id','title','summary','symbol','relations'])assert.deepEqual(currentEntry[key],originalEntry[key]);
  assert.equal(currentEntry.amendments.filter(amendment=>amendment.id==='klythesia-founding-20261104').length,1);
});

test('Evidence is escaped, original source links resolve, and the country remains a local noindex draft',async()=>{
  const malicious=renderFact({id:'safe',title:'<img onerror="x">',text:'<script>x</script>',source:{path:'unknown'}});
  assert(!malicious.includes('<script>')&&!malicious.includes('<img'));
  assert(!/\son(?:click|input|change|load|error)\s*=/i.test(html));
  assert(!html.includes('firebase'));
  for(const source of [...RELIGION.sources,...CROSS_SOURCES.sources]){
    const href=sourceLink(source);if(!href||href.startsWith('#'))continue;
    const target=new URL(href,root);if(target.pathname.endsWith('/'))target.pathname+='index.html';
    assert((await stat(target)).isFile(),source.path);
  }
  assert((await readFile(new URL('index.html',root),'utf8')).includes('noindex,nofollow'));
});

test('Shared controllers own state, drag and image dialogs; raw authoring data stay excluded',async()=>{
  const app=await readFile(new URL('house-placement.mjs',root),'utf8');
  assert(app.includes("from '../shared/country-placement.mjs'"));
  const art=await readFile(new URL('art-dialogs.mjs',root),'utf8');
  assert(art.includes("from '../shared/country-workbench/art-dialog-session.mjs'"));
  for(const file of ['sources/religion-evidence.json','sources/lore-amendment-20261104.json','sources/religion-before-20261104/eintrag.json','scripts/build-catalogues.mjs','assets.source.json'])assert(isAuthoringArchive('Vorschau/Klythesia/'+file),file);
  for(const file of ['index.html','proposal-app.mjs','realm-context.mjs','assets/estates/previews/anassa.webp'])assert(!isAuthoringArchive('Vorschau/Klythesia/'+file),file);
});
