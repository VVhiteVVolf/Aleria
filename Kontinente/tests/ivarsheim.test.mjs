import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import vm from 'node:vm';
import { createTerritory } from '../modules/ivarsheim/territory-page.mjs';
import { describePlace, territoriesById } from '../../Karten/Aldrimar/ivarsheim/places.mjs';
import { createReviewedPins } from '../../Karten/modules/territory-places/reviewed-pin-import.mjs';
import { HOUSE_GRENDEL_FAMILY } from '../../Stammbäume/assets/js/data/house-grendel-family.js';
import { resolveRegisteredFamilyUpgrade } from '../../Stammbäume/assets/js/services/family-registry-upgrade.js';

const root=new URL('../../',import.meta.url),folder='Karten/Aldrimar/ivarsheim/';
const read=name=>fs.readFileSync(new URL(name,root),'utf8'),json=name=>JSON.parse(read(name));
const source=json(folder+'markers.source.json'),snapshot=json(folder+'data.json'),pins=snapshot.state.pins;
const originals=json(folder+'sources/worldanvil-markers.json'),list=json(folder+'sources/worldanvil-marker-list.json');
const articles=json('Kontinente/modules/ivarsheim/pages.source.json').pages;
const ui={window:{}};vm.runInNewContext(read('Kontinente/assets/js/herrschaft-data.js'),ui);vm.runInNewContext(read('Kontinente/kontinente.registry.js'),ui);
const pages=articles.map(p=>createTerritory(p.id,ui.window.ALERIA_HERRSCHAFT_DATA));
const page=id=>pages.find(p=>p.meta.id===id),pin=name=>pins.find(p=>p.title===name);
const places=id=>page(id).view.geography.domains.flatMap(d=>d.sections.flatMap(s=>s.places));
const fields=p=>Object.fromEntries(p.table.map(r=>[r.k,r.v]));

test('all seven legacy articles and only the three supplied images are archived with checksums',()=>{
 const hash=data=>crypto.createHash('sha256').update(data).digest('hex');
 const articles=json(folder+'sources/attachments.json');assert.equal(articles.length,7);
 for(const a of articles)assert.equal(hash(fs.readFileSync(new URL(folder+'sources/'+a.file,root))),a.sha256);
 const images=json(folder+'images.source.json').images;assert.equal(images.length,3);
 for(const image of images){assert.deepEqual([image.width,image.height],[4096,2682]);assert.equal(hash(fs.readFileSync(new URL(folder+image.file,root))),image.sha256);}
});

test('136 browser-captured entries reconcile to 118 stable places and 18 documented overlays',()=>{
 assert.equal(originals.length,136);assert.equal(list.length,136);
 assert.equal(new Set(originals.map(m=>m.href)).size,136);
 const decisions=json(folder+'import-decisions.source.json');assert.equal(decisions.overlayMarkers.length,18);
 const imported=pins.filter(p=>p.sourceRef.provider==='worldanvil');assert.equal(imported.length,118);
 for(const p of imported){
  const old=originals.find(m=>m.href.endsWith('/'+p.sourceRef.markerId+'/edit'));assert.ok(old);
  const f=Object.fromEntries(old.fields.map(f=>[f.id.replace('mapbundle_marker_',''),f.value]));
  assert.deepEqual(p.sourceRef.coordinates,{x:Number(f.geoX),y:Number(f.geoY),origin:'bottom-left',unit:'pixel'});
  assert.equal(p.id,'ivarsheim-'+p.sourceRef.markerId);
 }
 const covered=new Set([...imported.map(p=>p.sourceRef.markerId),...decisions.overlayMarkers.map(p=>p.markerId)]);
 assert.equal(covered.size,136);
});

test('126 unique target positions use the actual canvas, current templates and local heraldry',()=>{
 assert.equal(pins.length,126);assert.equal(new Set(pins.map(p=>p.id)).size,126);
 assert.equal(new Set(pins.map(p=>p.sourceRef.targetPosition.mapPositionId)).size,126);
 assert.deepEqual([snapshot.state.dotSize,snapshot.state.lblSize],[80,50]);
 const context=vm.createContext({});
 for(const file of ['category-catalog.js','pin-template-catalog.js','pin-table-presets.js'])vm.runInContext(read('Karten/assets/js/pins/'+file),context);
 const expected=structuredClone(createReviewedPins(source,{catalog:context.KartoCategoryCatalog,presets:context.KartoPinTablePresets,describePlace,region:'Ivarsheim'}));
 assert.deepEqual(pins,expected);
 for(const p of pins){
  assert.equal(p.x,p.sourceRef.targetPosition.x/4096);assert.ok(Math.abs(p.y-p.sourceRef.targetPosition.y/2682)<1e-14);
  for(const asset of [p.pinMarker,p.crest,p.banner])assert.ok(fs.existsSync(new URL('.'+asset,root)),asset);
  assert.ok(context.KartoPinTemplateCatalog.get(p.templateId));
 }
});

test('Winterwacht is nested under Saatgrund while six primary domains remain expanded',()=>{
 const rootPage=page('jarltum-ivarsheim');assert.equal(rootPage.view.geography.domains.length,6);
 assert.equal(places('jarltum-ivarsheim').length,108);
 assert.equal(territoriesById.get('hesirentum-winterwacht').parentId,'thanentum-saatgrund');
 assert.deepEqual(page('thanentum-saatgrund').view.geography.links.map(l=>l.id),['hesirentum-winterwacht']);
 const winter=places('hesirentum-winterwacht');assert.equal(winter.length,15);
 for(const p of winter)assert.ok(!places('jarltum-ivarsheim').some(root=>root.id===p.id));
 assert.ok(!rootPage.view.familySections.flatMap(s=>s.cards).some(c=>c.id==='haus-hyrmgardr'));
 assert.ok(page('thanentum-saatgrund').view.familySections.flatMap(s=>s.cards).some(c=>c.id==='haus-hyrmgardr'));
});

test('Klippenschlag and the Grendel upgrade preserve historical ancestors and stable people',()=>{
 assert.equal(territoriesById.get('thanentum-klippenschlag').type,'Thanentum');
 assert.equal(HOUSE_GRENDEL_FAMILY.document.houseProfile.rankId,'thane');
 assert.match(HOUSE_GRENDEL_FAMILY.persons.find(p=>p.id==='thorvald-grendel').title,/Thane/);
 assert.match(HOUSE_GRENDEL_FAMILY.persons.find(p=>p.id==='leif-grendel').title,/erster Hesir/);
 for(const g of page('thanentum-klippenschlag').view.councilGroups)for(const m of g.members)assert.doesNotMatch(m.office,/Hesir/);
 const saved=structuredClone(HOUSE_GRENDEL_FAMILY);saved.extensions.sourceRevision=3;saved.document.houseProfile.rankId='hesire';saved.lineage.crestSubtitle='Alter Hesirenclan';saved.persons.find(p=>p.id==='thorvald-grendel').title='Hesir des Clans Grendel seit 1725';
 saved.document.houseProfile.seat='Lokal bearbeiteter Sitz';saved.document.motto='Eigener Wahlspruch';
 saved.persons.find(p=>p.id==='erik-grendel').notes='Eigene Notiz';saved.persons.find(p=>p.id==='erik-grendel').portrait='custom-portrait.png';
 const upgraded=resolveRegisteredFamilyUpgrade(HOUSE_GRENDEL_FAMILY,saved);
 assert.ok(upgraded);const family=upgraded.family||upgraded;
 assert.equal(family.document.houseProfile.rankId,'thane');
 assert.equal(family.document.houseProfile.seat,'Lokal bearbeiteter Sitz');assert.equal(family.document.motto,'Eigener Wahlspruch');
 assert.equal(family.persons.find(p=>p.id==='erik-grendel').notes,'Eigene Notiz');assert.equal(family.persons.find(p=>p.id==='erik-grendel').portrait,'custom-portrait.png');
 assert.match(family.persons.find(p=>p.id==='thorvald-grendel').title,/Thane/);assert.match(family.lineage.crestSubtitle,/Thanenclan/);
 assert.deepEqual(family.persons.map(p=>p.id),HOUSE_GRENDEL_FAMILY.persons.map(p=>p.id));
});

test('confirmed relocations and new settlement states agree across the map and the registers',()=>{
 const h=pin('Hårfjel - Hügelgrab');assert.equal(h.dominionId,'thanentum-ivarsklamm');assert.equal(h.sourceRef.targetPosition.mapPositionId,'ivarsheim-position-026');
 assert.match(h.text,/Grendel/);assert.ok(!places('thanentum-klippenschlag').some(p=>p.id===h.id));
 for(const [name,type] of [['Fridtun','Hafensiedlung'],['Torsvik','Flusssiedlung'],['Ravnholt','Handelssiedlung'],['Alsvik','Burg']]){
  assert.equal(fields(pin(name)).Typ,type);assert.doesNotMatch(pin(name).text,/bleiben bis heute als Ruinen|bis dahin bleibt die Ruine/);
 }
 assert.notEqual(pin('Caer Dathruinn').sourceRef.targetPosition.mapPositionId,pin('Kaldhaug - Hügelgrab').sourceRef.targetPosition.mapPositionId);
 for(const name of ['Binn','Beal'])assert.match(fields(pin(name)).Lagehinweis,/Südlicher/);
});

test('three Schwarzdorn exclaves keep their external owner and orders keep their affiliations',()=>{
 for(const [name,host] of [['Gerstenberg','thanentum-ivarsklamm'],['Hjorthorn','thanentum-rothain'],['Tirann','thanentum-saatgrund']]){
  const p=pin(name);assert.equal(p.house,'Clan Schwarzdorn');assert.equal(p.dominionId,'exklaven-schwarzdorn-ivarsheim');
  assert.match(fields(p).Besitzform,/Exklave/);assert.equal(fields(p)['Lehnsherr des Clans'],'Clan Varulv');
  assert.ok(places(host).some(item=>item.id===p.id));
 }
 assert.equal(pin('Baltborg - Ordensburg Balthors Söhne').faction,'Balthors Söhne');
 assert.equal(pin('Jötunborg - Titanenbrecher').faction,'Titanenbrecher · Haus Riesentot');
});

test('eight sourced new names and five genuinely missing descriptions stay distinguishable',()=>{
 const authored=pins.filter(p=>p.sourceRef.provider==='aleria');assert.equal(authored.length,8);
 assert.equal(new Set(authored.map(p=>p.title.toLocaleLowerCase('de'))).size,8);assert.ok(authored.every(p=>p.text));
 const missing=pins.filter(p=>!p.text);assert.deepEqual(missing.map(p=>p.title).sort(),['Winterfeste','Ivarsfels','Hjerimsheim','Jägersruh','Kornweiler'].sort());
 for(const p of missing)assert.match(fields(p).Beschreibungsstand,/keinen Beschreibungstext/);
 const allPlaces=new Map(pages.flatMap(p=>p.view.geography.domains.flatMap(d=>d.sections.flatMap(s=>s.places))).map(p=>[p.id,p]));
 assert.equal(allPlaces.size,126);
 for(const p of pins){assert.equal(allPlaces.get(p.id).description,p.text);assert.ok(allPlaces.get(p.id).href.endsWith('&pin='+p.id));}
});

test('all eight generated pages, councils and links use local shared assets',()=>{
 const entries=ui.window.KONTINENTE_REGISTRY.filter(e=>e.page.includes('Jarltum Ivarsheim/'));assert.equal(entries.length,8);
 for(const entry of entries){const html=read('Kontinente/'+entry.page);assert.match(html,/data-herrschaft-shell/);assert.doesNotMatch(html,/on(?:click|input|change)=/i);}
 for(const p of pages)for(const g of p.view.councilGroups)for(const m of g.members)if(m.imageSrc)assert.ok(fs.existsSync(new URL('.'+m.imageSrc,root)),m.imageSrc);
 assert.match(read('Kontinente/Estryll/Königreich Aldrimar/Königreich von Aldrimar.html'),/Jarltum Ivarsheim\/Jarltum Ivarsheim.html/);
});
