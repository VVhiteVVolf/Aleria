import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import vm from 'node:vm';
import { createTerritory } from '../modules/heldenwacht/territory-page.mjs';
import { describePlace, territoriesById } from '../../Karten/Aldrimar/heldenwacht/places.mjs';
import { createReviewedPins } from '../../Karten/modules/territory-places/reviewed-pin-import.mjs';
import { importReviewedTerritory } from '../../Karten/tools/reviewed-territory-import.mjs';

const root=new URL('../../',import.meta.url),folder='Karten/Aldrimar/heldenwacht/';
const read=file=>fs.readFileSync(new URL(file,root),'utf8'),json=file=>JSON.parse(read(file));
const source=json(folder+'markers.source.json'),snapshot=json(folder+'data.json'),pins=snapshot.state.pins;
const captured=json(folder+'sources/worldanvil-capture.json'),decisions=json(folder+'import-decisions.source.json');
const articles=json('Kontinente/modules/heldenwacht/pages.source.json').pages,authority=json('Kontinente/modules/heldenwacht/authority.source.json');
const ui={window:{}};vm.runInNewContext(read('Kontinente/assets/js/herrschaft-data.js'),ui);vm.runInNewContext(read('Kontinente/kontinente.registry.js'),ui);
const pages=articles.map(p=>createTerritory(p.id,ui.window.ALERIA_HERRSCHAFT_DATA));
const page=id=>pages.find(p=>p.meta.id===id),pin=name=>pins.find(p=>p.title.replace(/\s+/g,' ')===name);
const places=id=>page(id).view.geography.domains.flatMap(d=>d.sections.flatMap(s=>s.places));
const fields=p=>Object.fromEntries(p.table.map(r=>[r.k,r.v]));
const normalize=s=>s.normalize('NFKD').toLocaleLowerCase('de').replace(/[^\p{L}\p{N}]/gu,'');

test('147 complete WA forms reconcile without loss or duplicate source IDs',()=>{
 assert.equal(captured.markers.length,147);assert.equal(captured.markerList.length,147);
 assert.equal(pins.length,147);assert.equal(pins.filter(p=>p.sourceRef.provider==='aleria').length,17);
 const seen=new Set();
 for(const p of [...pins.filter(p=>p.sourceRef.provider==='worldanvil'),...source.unpositionedPlaces]){
  const ref=p.sourceRef,old=captured.markers.find(m=>m.url===ref.url);assert.ok(old,ref.url);
  assert.equal(p.id,'heldenwacht-'+ref.markerId);assert.ok(!seen.has(ref.markerId));seen.add(ref.markerId);
  assert.equal(ref.coordinates.x,Number(old.values.geoX));assert.equal(ref.coordinates.y,Number(old.values.geoY));
 }
 assert.equal(source.unpositionedPlaces.length,1);assert.equal(source.unpositionedPlaces[0].name,'Heldenfeld - Turnierplatz');
 for(const old of decisions.omittedMarkers){assert.ok(!seen.has(old.markerId));seen.add(old.markerId);}
 assert.equal(decisions.omittedMarkers.length,16);assert.equal(seen.size,147);
 assert.ok(captured.markers.every(m=>typeof m.description==='string'&&'targetArticle' in m.values));
});

test('target positions use the real image size and preserve distinct overlapping signs',()=>{
 assert.deepEqual(source.imageSize,[4096,3446]);assert.deepEqual([snapshot.state.dotSize,snapshot.state.lblSize],[80,50]);
 const context=vm.createContext({});for(const file of ['category-catalog.js','pin-template-catalog.js','pin-table-presets.js'])vm.runInContext(read('Karten/assets/js/pins/'+file),context);
 assert.deepEqual(pins,structuredClone(createReviewedPins(source,{catalog:context.KartoCategoryCatalog,presets:context.KartoPinTablePresets,describePlace,region:'Heldenwacht'})));
 assert.equal(new Set(pins.map(p=>p.sourceRef.targetPosition.mapPositionId)).size,147);
 for(const p of pins){assert.ok(Math.abs(p.x-p.sourceRef.targetPosition.x/4096)<1e-14);assert.ok(Math.abs(p.y-p.sourceRef.targetPosition.y/3446)<1e-14);assert.ok(context.KartoPinTemplateCatalog.get(p.templateId));}
 for(const names of [['Mørknes','Klippenrest','Blódfjord'],['Guldsjö','Dødrift'],['Huldrehamn','Frostlicht'],['Vargmótvakt','Taverne am Königsweg','Siggstatt'],['Gravvakt','Galdrkirk']]){
  const group=names.map(pin);assert.ok(group.every(Boolean));assert.equal(new Set(group.map(p=>p.sourceRef.targetPosition.mapPositionId)).size,names.length);
 }
});

test('Vaeren delegation retains the king and three distinct offices with reversion',()=>{
 assert.deepEqual(authority.chain.map(x=>x.office),['König','Jarl','Thane','Hesir']);
 assert.equal(authority.reversion.automaticInheritance,false);assert.equal(authority.reversion.recipient,'König');
 const jarl=page('jarltum-heldenwacht').view.councilGroups.flatMap(g=>g.members);
 assert.equal(jarl[0].name,'Skjor Vaeren');assert.equal(jarl[0].office,'Jarl');assert.ok(jarl.some(m=>m.name==='Toran Albholz'));
 const kingdom=json('Kontinente/modules/aldrimar/kingdom.source.json').councilGroups;
 assert.notDeepEqual(jarl.map(m=>m.name),kingdom.flatMap(g=>g.members.map(m=>m.name)));
 for(const id of ['thanentum-tal-der-helden','hesirentum-heldenwacht']){
  const members=page(id).view.councilGroups.flatMap(g=>g.members);assert.equal(members.length,1);assert.equal(members[0].name,'');
  assert.match(articles.find(p=>p.id===id).copy.overview.join(' '),/Titel unmittelbar an den König zurück/);
 }
 assert.equal(territoriesById.get('hesirentum-heldenwacht').parentId,'thanentum-tal-der-helden');
 assert.equal(page('herrschaft-sturmgeborene').view.councilGroups[0].members[0].name,'Arnthor Sturmgeborener');
});

test('Torrenwacht stays vacant while royal forts and the Grimr chronology remain explicit',()=>{
 const t=territoriesById.get('hesirentum-torrenwacht');assert.equal(t.familyId,'');assert.match(t.house,/Vakant/);
 const history=articles.find(p=>p.id===t.id).copy.history.join(' ');
 assert.ok(history.indexOf('Holmr')<history.indexOf('Skaife')&&history.indexOf('Skaife')<history.indexOf('Grimr'));
 for(const term of ['Skymar','Myrhamn','Blutbund','Fjordheim','Vennyr'])assert.ok(history.includes(term));
 assert.match(pin('Torrenheim').text,/keine aktuelle Vergabe|nicht erfolgt/i);
 for(const name of ['Havfrbolg','Isvakt']){assert.equal(pin(name).house,'Clan Vaeren');assert.equal(pin(name).dominionId,t.id);}
 assert.equal(fields(pin('Isvakt')).Typ,'Siedlungsruine');assert.match(pin('Isvakt').text,/Flottenstützpunkt/);
 assert.ok(!articles.find(p=>p.id===t.id).families.some(g=>g.houses.some(h=>h.featured)));
});

test('Galmar decree permits exactly one separate brewery lease per guild',()=>{
 for(const [name,guild] of [['Hopfengut','Schwarzdorn Brauerei'],['Malzhain','Goldglanz Brauerei']]){
  const p=pin(name);assert.equal(p.house,guild);assert.equal(pins.filter(x=>x.house===guild).length,1);
  assert.match(p.text,/Galmar/);assert.doesNotMatch(p.text,/Sigurd/);assert.equal(fields(p).Besitzform,'Gildenpacht');
  assert.match(p.crest,name==='Hopfengut'?/schwarzdorn-brauerei/:/goldglanz-brauerei/);
 }
 assert.ok(pin('Malzhain').y<pin('Hopfengut').y);
});

test('direct small fiefs and the two new island clans remain nested and unassigned',()=>{
 const primary=places('jarltum-heldenwacht');assert.equal(primary.length,109);assert.equal(new Set(primary.map(p=>p.id)).size,109);
 for(const name of ['Spindelheim','Skymar','Myrhamn','Sundkrone','Lothirblick'])assert.ok(!primary.some(p=>p.id===pin(name).id));
 for(const p of pins.filter(p=>p.dominionId==='direktlehen-tal-der-helden')){assert.equal(p.house,'Örtliche Zuordnung offen');assert.equal(fields(p).Lehensherr,'Clan Vaeren');}
 assert.equal(pin('Spindelheim').house,'Clan Spindelschlag');assert.equal(fields(pin('Spindelheim')).Lehensherr,'Clan Vaeren');
 const h=articles.find(p=>p.id==='herrschaft-spindelheim').families[0].houses[0];assert.match(h.rank,/ohne Adelsbrief/);
 assert.ok(page('direktlehen-tal-der-helden').view.geography.links.some(l=>l.id==='herrschaft-spindelheim'));
 for(const name of ['Sundkrone','Lothirblick']){
  const p=pin(name);assert.equal(p.house,'Huskarlclan noch nicht benannt');assert.equal(fields(p).Lehensherr,'Clan Wellenschild');assert.equal(p.crest,'/Stammbäume/assets/images/placeholders/neutral-crest.png');assert.match(p.text,/unblutige|Blutige Auseinandersetzungen stehen dabei nicht/);assert.match(p.text,/Lothir/);
  assert.equal(territoriesById.get(p.dominionId).parentId,'hesirentum-klageschild-inseln');
 }
 assert.equal(pin('Vagaborg').house,'Clan Eibenschild');
});

test('every current description and pin is reachable through its owning register',()=>{
 const own=new Map(articles.flatMap(p=>p.domains.flatMap(d=>d.sections.flatMap(s=>s.placeIds.map(id=>[id,p.id])))));
 assert.equal(own.size,147);assert.equal(articles.flatMap(p=>p.domains.flatMap(d=>d.sections.flatMap(s=>s.placeIds))).length,147);
 const all=new Map(pages.flatMap(p=>places(p.meta.id)).map(p=>[p.id,p]));assert.equal(all.size,147);
 const parsed=new Map(json(folder+'sources/worldanvil-markers.parsed.json').map(m=>[m.id,m]));
 for(const p of pins){
  assert.equal(own.get(p.id),p.dominionId);assert.equal(all.get(p.id).description,p.text);assert.ok(all.get(p.id).href.endsWith('&pin='+p.id));assert.doesNotMatch(p.text,/\[\/?(?:ol|li|url|b|i)[:\]]/);
  if(p.sourceRef.provider==='worldanvil'){
   const old=parsed.get(p.sourceRef.markerId),change=decisions.decisions.find(d=>d.markerId===old.id);
   if(change){assert.equal(change.originalText,old.text);assert.equal(change.currentText,p.text);}else assert.equal(p.text,old.text);
  }
 }
 assert.match(articles.find(p=>p.id==='hesirentum-heldenwacht').copy.culture.join(' '),/Heldenfeld - Turnierplatz/);
 assert.equal(pins.filter(p=>!p.text).length,9);assert.equal(decisions.missingDescriptions.length,9);
 assert.ok(pins.filter(p=>!p.text).every(p=>fields(p).Quellenlage.includes('fehlt ein Beschreibungstext')));
});

test('changed settlement types and special organisation ownership match their present roles',()=>{
 for(const name of ['Skymar','Myrhamn'])assert.equal(fields(pin(name)).Typ,'Hafensiedlung');
 assert.equal(fields(pin('Nidhoggborg')).Typ,'Bauernsiedlung');assert.equal(fields(pin('Vigfinnstad')).Typ,'Bauernsiedlung');assert.equal(fields(pin('Kohlenrain')).Typ,'Waldsiedlung');
 assert.equal(pin('Vigfinnstad').dominionId,'direktlehen-tal-der-helden');assert.equal(pin('Kohlenrain').house,'Clan Eisenbieger');
 for(const name of ['Klarhafen','Tornvik','Sjønes','Vintrefjord','Huldrehamn'])assert.equal(fields(pin(name)).Typ,'Siedlungsruine');
 for(const [name,house] of [['Anwesen der Varangr','Clan Varangr'],['Grymschmiede - Erzbender','Erzbender'],['Riesenklamm','Titanenbrecher'],['Hjartvakt - Blutbund','Blutbund'],['Vidribolg - Balthors Söhne','Balthors Söhne']])assert.equal(pin(name).house,house);
 assert.equal(fields(pin('Abtrünnigenlager Wellenklang')).Typ,'Heerlager');
 assert.equal(pin('Riffhort').house,'Clan Frostzorn');assert.equal(fields(pin('Riffhort')).Typ,'Piratenversteck');
});

test('new names are unique throughout existing Aldrimar map catalogs',()=>{
 const others=fs.readdirSync(new URL('Karten/Aldrimar/',root),{withFileTypes:true}).filter(d=>d.isDirectory()&&d.name!=='heldenwacht').flatMap(d=>{
  const file=`Karten/Aldrimar/${d.name}/markers.source.json`;return fs.existsSync(new URL(file,root))?json(file).markers.map(m=>normalize(m.title)):[];
 });
 assert.equal(new Set(pins.map(p=>normalize(p.title))).size,147);
 for(const p of pins)assert.ok(!others.includes(normalize(p.title)),p.title);
});

test('source files, heraldry, canonical portraits and all sixteen registered pages remain local and intact',()=>{
 const hash=data=>crypto.createHash('sha256').update(data).digest('hex');
 const attachments=json(folder+'sources/attachments.json');assert.equal(attachments.length,9);
 for(const a of attachments)assert.equal(hash(fs.readFileSync(new URL(folder+'sources/'+a.file,root))),a.sha256);
 for(const im of json(folder+'images.source.json').images){assert.deepEqual([im.width,im.height],[4096,3446]);assert.equal(hash(fs.readFileSync(new URL(folder+im.file,root))),im.sha256);}
 for(const p of pins)for(const asset of [p.pinMarker,p.crest,p.banner])assert.ok(fs.existsSync(new URL('.'+asset,root)),asset);
 for(const p of pages)for(const g of p.view.councilGroups)for(const m of g.members)if(m.imageSrc)assert.ok(fs.existsSync(new URL('.'+m.imageSrc,root)),m.imageSrc);
 const entries=ui.window.KONTINENTE_REGISTRY.filter(e=>e.page.includes('Jarltum Heldenwacht/'));assert.equal(entries.length,16);
 for(const e of entries){assert.match(read('Kontinente/'+e.page),/data-herrschaft-shell/);assert.doesNotMatch(read('Kontinente/'+e.page),/on(?:click|input|change)=/i);}
 assert.match(read('Kontinente/Estryll/Königreich Aldrimar/Königreich von Aldrimar.html'),/Jarltum Heldenwacht\/Jarltum Heldenwacht.html/);
});

test('verification cannot reset an already populated map',()=>{
 const options={folder:new URL('../../'+folder,import.meta.url),region:'Heldenwacht',countyId:'jarltum-heldenwacht',describePlace,territoriesById};
 const before=read(folder+'data.json');assert.doesNotThrow(()=>importReviewedTerritory(options));assert.throws(()=>importReviewedTerritory({...options,write:true}),/bereits bearbeitet/);assert.equal(read(folder+'data.json'),before);
});
