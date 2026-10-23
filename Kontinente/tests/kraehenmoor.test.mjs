import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import vm from 'node:vm';
import { createTerritory } from '../modules/kraehenmoor/territory-page.mjs';
import { describePlace, territoriesById } from '../../Karten/Aldrimar/kraehenmoor/places.mjs';
import { createReviewedPins } from '../../Karten/modules/territory-places/reviewed-pin-import.mjs';
import { importReviewedTerritory } from '../../Karten/tools/reviewed-territory-import.mjs';

const root=new URL('../../',import.meta.url),folder='Karten/Aldrimar/kraehenmoor/';
const read=name=>fs.readFileSync(new URL(name,root),'utf8'),json=name=>JSON.parse(read(name));
const source=json(folder+'markers.source.json'),snapshot=json(folder+'data.json'),pins=snapshot.state.pins;
const captured=json(folder+'sources/worldanvil-capture.json'),decisions=json(folder+'import-decisions.source.json');
const articles=json('Kontinente/modules/kraehenmoor/pages.source.json').pages;
const ui={window:{}};vm.runInNewContext(read('Kontinente/assets/js/herrschaft-data.js'),ui);vm.runInNewContext(read('Kontinente/kontinente.registry.js'),ui);
const pages=articles.map(p=>createTerritory(p.id,ui.window.ALERIA_HERRSCHAFT_DATA));
const page=id=>pages.find(p=>p.meta.id===id),pin=name=>pins.find(p=>p.title===name);
const places=id=>page(id).view.geography.domains.flatMap(d=>d.sections.flatMap(s=>s.places));
const fields=p=>Object.fromEntries(p.table.map(r=>[r.k,r.v]));

test('all 126 captured sources reconcile to 113 stable place IDs and 13 areas',()=>{
 assert.equal(captured.markerList.length,126);assert.equal(captured.markers.length,126);assert.equal(pins.length,113);
 const reconciled=new Set();
 for(const p of pins){
  const ref=p.sourceRef,old=captured.markers.find(m=>m.url===ref.url);assert.ok(old);
  assert.equal(p.id,'kraehenmoor-'+ref.markerId);assert.equal(ref.provider,'worldanvil');
  assert.deepEqual(ref.coordinates,{x:Number(old.values.geoX),y:Number(old.values.geoY),origin:'bottom-left',unit:'pixel'});
  assert.ok(!reconciled.has(ref.markerId));reconciled.add(ref.markerId);
 }
 assert.equal(decisions.omittedMarkers.length,13);
 for(const m of decisions.omittedMarkers){assert.ok(!reconciled.has(m.markerId));assert.notEqual(m.group,'Landmarkierungen');reconciled.add(m.markerId);}
 assert.equal(reconciled.size,126);assert.ok(captured.markers.every(m=>typeof m.description==='string'&&'targetArticle' in m.values));
});

test('reviewed pin coordinates, categories and images match the actual 4096 by 2418 canvas',()=>{
 assert.deepEqual(source.imageSize,[4096,2418]);assert.deepEqual([snapshot.state.dotSize,snapshot.state.lblSize],[80,50]);
 const context=vm.createContext({});
 for(const file of ['category-catalog.js','pin-template-catalog.js','pin-table-presets.js'])vm.runInContext(read('Karten/assets/js/pins/'+file),context);
 assert.deepEqual(pins,structuredClone(createReviewedPins(source,{catalog:context.KartoCategoryCatalog,presets:context.KartoPinTablePresets,describePlace,region:'Krähenmoor'})));
 for(const p of pins){
  assert.equal(p.x,p.sourceRef.targetPosition.x/4096);assert.ok(Math.abs(p.y-p.sourceRef.targetPosition.y/2418)<1e-14);
  assert.ok(context.KartoPinTemplateCatalog.get(p.templateId));
  for(const asset of [p.pinMarker,p.crest,p.banner,...(p.coRulers||[]).flatMap(r=>[r.crest,r.banner])])assert.ok(fs.existsSync(new URL('.'+asset,root)),asset);
 }
 assert.equal(new Set(pins.map(p=>p.sourceRef.targetPosition.mapPositionId)).size,113);
});

test('the jarl page expands primary clans while Rabenforst and Goldglanz remain nested',()=>{
 const primary=page('jarltum-kraehenmoor').view.geography.domains.map(d=>d.territoryId);
 for(const id of ['herrschaft-kaltherz','herrschaft-feuerherz','thanentum-rabenweide','thanentum-schimmerkueste','verwaltung-silberblut','verwaltung-blutstahl','hesirentum-schwarzfjord'])assert.ok(primary.includes(id));
 assert.equal(places('jarltum-kraehenmoor').length,96);assert.equal(new Set(places('jarltum-kraehenmoor').map(p=>p.id)).size,96);
 assert.ok(!primary.includes('hesirentum-rabenforst'));assert.ok(!primary.includes('hesirentum-goldglanz'));
 for(const name of ['Rabenhain','Goldenglanz','Edelstatt','Honigberg'])assert.ok(!places('jarltum-kraehenmoor').some(p=>p.id===pin(name).id));
 assert.equal(territoriesById.get('hesirentum-rabenforst').parentId,'thanentum-rabenweide');
 assert.deepEqual(page('thanentum-rabenweide').view.geography.links.map(l=>l.id),['hesirentum-rabenforst']);
 assert.equal(territoriesById.get('hesirentum-goldglanz').parentId,'thanentum-schimmerkueste');
 assert.deepEqual(page('thanentum-schimmerkueste').view.geography.links.map(l=>l.id),['hesirentum-goldglanz']);
 const schwarzstolz=articles.find(p=>p.id==='hesirentum-schwarzfjord').families.find(g=>g.title==='Huskarlclans').houses.find(h=>h.familyId==='haus-schwarzstolz');
 assert.equal(schwarzstolz.rank,'Huskarlclan');assert.equal(schwarzstolz.seat,'Eldvik');
});

test('Schimmerküste separates administration and retains a single shared council and joint capital',()=>{
 const joint=page('thanentum-schimmerkueste');
 assert.deepEqual(joint.view.geography.domains.map(d=>d.territoryId),['thanentum-schimmerkueste','verwaltung-silberblut','verwaltung-blutstahl']);
 assert.equal(places('verwaltung-silberblut').length,8);assert.equal(places('verwaltung-blutstahl').length,10);
 const silverIds=new Set(places('verwaltung-silberblut').map(p=>p.id));assert.ok(places('verwaltung-blutstahl').every(p=>!silverIds.has(p.id)));
 for(const id of ['verwaltung-silberblut','verwaltung-blutstahl'])assert.deepEqual(structuredClone(page(id).view.councilGroups),structuredClone(joint.view.councilGroups));
 assert.equal(joint.view.councilGroups[0].members[0].name,'Thongvar Silberblut');
 assert.deepEqual(pin('Silberquell').coRulers.map(r=>r.familyId),['haus-silberblut','haus-blutstahl']);
 assert.equal(pin('Myrkheim').house,'Clan Silberblut');assert.equal(pin('Eyrstatt').house,'Clan Blutstahl');
 assert.equal(pin('Ehrenberg').house,'Clan Varangr');assert.doesNotMatch(pin('Ehrenberg').text,/Clans Silberblut/);
});

test('every place and complete current description is reachable through its owning page',()=>{
 const all=new Map(pages.flatMap(p=>places(p.meta.id)).map(p=>[p.id,p]));assert.equal(all.size,113);
 for(const p of pins){assert.equal(all.get(p.id).description,p.text);assert.ok(all.get(p.id).href.endsWith('&pin='+p.id));}
 const parsed=new Map(json(folder+'sources/worldanvil-markers.parsed.json').map(m=>[m.id,m]));
 for(const p of pins){
  const old=parsed.get(p.sourceRef.markerId),change=decisions.decisions.find(d=>d.markerId===old.id);
  if(change){assert.equal(change.originalText,old.text);assert.equal(change.currentText,p.text);}else assert.equal(p.text,old.text);
 }
});

test('exclaves, independent organisations and the neighbouring grave signs retain their identities',()=>{
 for(const name of ['Edelstatt','Honigberg']){assert.equal(pin(name).dominionId,'hesirentum-goldglanz');assert.equal(fields(pin(name)).Lage,'Thanentum Rabenweide');assert.equal(fields(pin(name)).Lehensherr,'Clan Blutstahl · Clan Silberblut');}
 assert.equal(pin('Zum Glänzenden Kelch').house,'Clan Goldglanz');assert.equal(pin('Zum Glänzenden Kelch').dominionId,'hesirentum-rabenforst');
 assert.equal(pin('Burg Klingenhort - Windreiter').house,'Windreiter');assert.match(pin('Burg Klingenhort - Windreiter').crest,/windreiter/);
 for(const name of ['Ísbjarnbolg','Glýmborg - Balthors Söhne']){assert.equal(pin(name).house,'Balthors Söhne');assert.match(pin(name).crest,/die-schar-balthors-sohne/);}
 assert.equal(pin('Nebelfanglager - Jagdklingen').house,'Jagdklingen');
 assert.notEqual(pin('Helgrind').sourceRef.targetPosition.mapPositionId,pin('Burg Klingenhort - Windreiter').sourceRef.targetPosition.mapPositionId);
 assert.notEqual(pin('Helgrind').sourceRef.targetPosition.mapPositionId,pin('Hrafngardr').sourceRef.targetPosition.mapPositionId);
 assert.notEqual(pin('Tempel des stillen Hügels').sourceRef.targetPosition.mapPositionId,pin('Zum Glänzenden Kelch').sourceRef.targetPosition.mapPositionId);
});

test('moved settlements agree with current clan descriptions and original empty texts stay empty',()=>{
 for(const name of ['Tyrsokov','Stjarvund']){assert.equal(pin(name).house,'Clan Feuerherz');assert.doesNotMatch(pin(name).text,/liegen tief im Herrschaftsgebiet der Kaltherzen/);}
 assert.equal(pin('Krokskov').house,'Clan Schattenherz');assert.equal(pin('Trollmoor').house,'Clan Feuerherz');
 const missing=pins.filter(p=>!p.text);assert.equal(missing.length,11);assert.equal(decisions.missingDescriptions.length,11);
 assert.ok(missing.every(p=>fields(p).Quellenlage.includes('keinen Beschreibungstext')));
 assert.equal(new Set(pins.map(p=>p.title.toLocaleLowerCase('de'))).size,113);
});

test('nine source articles, three maps, eleven registered pages and local canonical portraits remain intact',()=>{
 const hash=data=>crypto.createHash('sha256').update(data).digest('hex');
 const attachments=json(folder+'sources/attachments.json');assert.equal(attachments.length,9);
 for(const a of attachments)assert.equal(hash(fs.readFileSync(new URL(folder+'sources/'+a.file,root))),a.sha256);
 const images=json(folder+'images.source.json').images;assert.equal(images.length,3);
 for(const im of images){assert.deepEqual([im.width,im.height],[4096,2418]);assert.equal(hash(fs.readFileSync(new URL(folder+im.file,root))),im.sha256);}
 const entries=ui.window.KONTINENTE_REGISTRY.filter(e=>e.page.includes('Jarltum Krähenmoor/'));assert.equal(entries.length,11);
 for(const e of entries){const html=read('Kontinente/'+e.page);assert.match(html,/data-herrschaft-shell/);assert.doesNotMatch(html,/on(?:click|input|change)=/i);}
 for(const p of pages)for(const g of p.view.councilGroups)for(const m of g.members)if(m.imageSrc)assert.ok(fs.existsSync(new URL('.'+m.imageSrc,root)),m.imageSrc);
 assert.match(read('Kontinente/Estryll/Königreich Aldrimar/Königreich von Aldrimar.html'),/Jarltum Krähenmoor\/Jarltum Krähenmoor.html/);
});

test('a verification import cannot overwrite existing edited map data',()=>{
 const options={folder:new URL('../../'+folder,import.meta.url),region:'Krähenmoor',countyId:'jarltum-kraehenmoor',describePlace,territoriesById};
 const before=read(folder+'data.json');assert.doesNotThrow(()=>importReviewedTerritory(options));
 assert.throws(()=>importReviewedTerritory({...options,write:true}),/bereits bearbeitet/);assert.equal(read(folder+'data.json'),before);
});
