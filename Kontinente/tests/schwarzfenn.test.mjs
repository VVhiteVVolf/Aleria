import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import vm from 'node:vm';
import { createTerritory } from '../modules/schwarzfenn/territory-page.mjs';
import { describePlace, territoriesById } from '../../Karten/Aldrimar/schwarzfenn/places.mjs';
import { createReviewedPins } from '../../Karten/modules/territory-places/reviewed-pin-import.mjs';
import { importReviewedTerritory } from '../../Karten/tools/reviewed-territory-import.mjs';

const root=new URL('../../',import.meta.url),folder='Karten/Aldrimar/schwarzfenn/';
const read=name=>fs.readFileSync(new URL(name,root),'utf8'),json=name=>JSON.parse(read(name));
const source=json(folder+'markers.source.json'),snapshot=json(folder+'data.json'),pins=snapshot.state.pins;
const captured=json(folder+'sources/worldanvil-capture.json'),decisions=json(folder+'import-decisions.source.json');
const articles=json('Kontinente/modules/schwarzfenn/pages.source.json').pages;
const ui={window:{}};vm.runInNewContext(read('Kontinente/assets/js/herrschaft-data.js'),ui);vm.runInNewContext(read('Kontinente/kontinente.registry.js'),ui);
const pages=articles.map(p=>createTerritory(p.id,ui.window.ALERIA_HERRSCHAFT_DATA));
const page=id=>pages.find(p=>p.meta.id===id),pin=name=>pins.find(p=>p.title===name);
const places=id=>page(id).view.geography.domains.flatMap(d=>d.sections.flatMap(s=>s.places));
const fields=p=>Object.fromEntries(p.table.map(r=>[r.k,r.v]));

test('all 121 browser sources reconcile to 103 source IDs and 18 documented omissions',()=>{
 assert.equal(captured.markers.length,121);assert.equal(captured.markerList.length,121);
 const imported=pins.filter(p=>p.sourceRef.provider==='worldanvil');assert.equal(imported.length,103);
 const sourceIds=new Set();
 for(const p of imported){
  const old=captured.markers.find(m=>m.url.endsWith('/'+p.sourceRef.markerId+'/edit'));assert.ok(old);
  assert.deepEqual(p.sourceRef.coordinates,{x:Number(old.values.geoX),y:Number(old.values.geoY),origin:'bottom-left',unit:'pixel'});
  assert.equal(p.id,'schwarzfenn-'+p.sourceRef.markerId);sourceIds.add(p.sourceRef.markerId);
 }
 assert.equal(decisions.omittedMarkers.length,18);
 for(const m of decisions.omittedMarkers){assert.ok(!sourceIds.has(m.markerId));sourceIds.add(m.markerId);}
 assert.equal(sourceIds.size,121);
 assert.ok(captured.markers.every(m=>typeof m.description==='string'&&'targetArticle' in m.values));
});

test('all 115 positions use the actual image size and safe reusable categories',()=>{
 assert.deepEqual(source.imageSize,[3826,4097]);assert.equal(pins.length,115);
 assert.equal(new Set(pins.map(p=>p.id)).size,115);assert.equal(new Set(pins.map(p=>p.sourceRef.targetPosition.mapPositionId)).size,115);
 assert.deepEqual([snapshot.state.dotSize,snapshot.state.lblSize],[80,50]);
 const context=vm.createContext({});
 for(const file of ['category-catalog.js','pin-template-catalog.js','pin-table-presets.js'])vm.runInContext(read('Karten/assets/js/pins/'+file),context);
 assert.deepEqual(pins,structuredClone(createReviewedPins(source,{catalog:context.KartoCategoryCatalog,presets:context.KartoPinTablePresets,describePlace,region:'Schwarzfenn'})));
 for(const p of pins){
  assert.equal(p.x,p.sourceRef.targetPosition.x/3826);assert.ok(Math.abs(p.y-p.sourceRef.targetPosition.y/4097)<1e-14);
  assert.ok(context.KartoPinTemplateCatalog.get(p.templateId));
  for(const asset of [p.pinMarker,p.crest,p.banner])assert.ok(fs.existsSync(new URL('.'+asset,root)),asset);
 }
 assert.equal(fields(pin('Hallsvalr')).Typ,'Grabstätte');assert.match(pin('Hallsvalr').pinMarker,/nordische-ruine/);
 assert.notEqual(pin('Hallsvalr').sourceRef.targetPosition.mapPositionId,pin('Draugrstad').sourceRef.targetPosition.mapPositionId);
});

test('every map place appears with the same text in its responsible page',()=>{
 const all=new Map(pages.flatMap(p=>places(p.meta.id)).map(p=>[p.id,p]));assert.equal(all.size,115);
 for(const p of pins){assert.equal(all.get(p.id).description,p.text);assert.ok(all.get(p.id).href.endsWith('&pin='+p.id));}
 assert.equal(places('jarltum-schwarzfenn').length,107);
 assert.equal(new Set(places('jarltum-schwarzfenn').map(p=>p.id)).size,107);
 assert.ok(places('hesirentum-wolfsfenn').some(p=>p.id===pin('Landgut der Ragnulf').id));
 assert.equal(places('banditengebiet-silberzaehne').length,8);
 assert.ok(!places('jarltum-schwarzfenn').some(p=>p.id===pin('Hallsvalr').id));
});

test('primary clan domains remain expanded with local subordinate navigation',()=>{
 const rootPage=page('jarltum-schwarzfenn');assert.equal(rootPage.view.geography.domains.length,10);
 assert.equal(territoriesById.get('herrschaft-graumahnen').parentId,'hesirentum-wolfsfenn');
 assert.equal(territoriesById.get('herrschaft-schmetterschilde').parentId,'hesirentum-wolfsfenn');
 assert.deepEqual(page('hesirentum-wolfsfenn').view.geography.links.map(l=>l.id),['herrschaft-graumahnen','herrschaft-schmetterschilde']);
 for(const name of ['Erzgrund','Dunkelkluft'])assert.equal(pin(name).dominionId,'hesirentum-wolfsfenn');
 assert.equal(pin('Eidralborg').dominionId,'thanentum-lichtfenn');assert.equal(pin('Seidhborg').dominionId,'thanentum-gramfenn');assert.equal(pin('Düsterbruch').dominionId,'thanentum-todesfenn');
});

test('leases, guilds and orders keep their own heraldry rather than the host clan',()=>{
 for(const name of ['Goldquell','Gildstatt']){const p=pin(name);assert.equal(p.house,'Clan Goldglanz');assert.equal(p.dominionId,'exklaven-goldglanz-schwarzfenn');assert.match(fields(p).Lehensherr,/Blutstahl.*Silberblut/);assert.ok(places('thanentum-lichtfenn').some(row=>row.id===p.id));}
 assert.equal(pin('Rovensfeld').house,'Rhosmeres Rösser');assert.match(pin('Rovensfeld').crest,/rhosmeres-roesser/);
 for(const name of ['Hargbolg - Balthors Söhne','Hvarborg - Balthors Söhne','Dravnborg - Balthors Söhne']){assert.equal(pin(name).house,'Balthors Söhne');assert.match(pin(name).crest,/die-schar-balthors-sohne/);}
 assert.equal(pin('Blutbund - Turm').house,'Blutbund');assert.equal(pin('Thyrnberg').house,'Skalden Akademie');
});

test('current ruins and settlements retain their history without contradictory active claims',()=>{
 for(const name of ['Järnvatt','Hrafnvik','Bjornstedt','Malmberg']){assert.equal(fields(pin(name)).Typ,'Siedlungsruine');assert.match(pin(name).text,/ruine/i);assert.equal(pin(name).house,'Haus Eisbrand');}
 assert.match(pin('Djúpholmr').text,/Malmberg liegt inzwischen als Ruine/);assert.match(pin('Stenholt').text,/Malmberg liegt inzwischen als Ruine/);
 assert.equal(fields(pin('Grimfjell')).Typ,'Turmruine');assert.match(pin('Grimfjell').text,/einst.*Grenzburg/);
 assert.equal(fields(pin('Halmarstatt')).Typ,'Bauernsiedlung');assert.doesNotMatch(pin('Halmarstatt').text,/pulsierende Handelszentrum/);
 assert.equal(fields(pin('Myrrborg')).Typ,'Burgsiedlung');assert.match(pin('Myrrborg').text,/Goldenen Kompanie/);assert.match(pin('Myrrborg').text,/wieder eine bewohnte Burgsiedlung/);
 const bandit=page('banditengebiet-silberzaehne');assert.match(bandit.view.familySections[0].cards[0].rank,/Nicht anerkannt/);assert.equal(bandit.view.councilGroups.length,0);
});

test('new descriptions and the single missing old text stay explicit',()=>{
 const authored=pins.filter(p=>p.sourceRef.provider==='aleria');assert.equal(authored.length,12);assert.ok(authored.every(p=>p.text&&!p.sourceRef.markerId));
 assert.equal(new Set(pins.map(p=>p.title.toLocaleLowerCase('de'))).size,115);
 const missing=pins.filter(p=>!p.text);assert.deepEqual(missing.map(p=>p.title),['Der Trauerschlund']);assert.match(fields(missing[0]).Quellenlage,/leer/);
 assert.ok(pins.every(p=>!p.text.includes('[url:')));
});

test('archived source articles, maps, local portraits and page registry remain complete',()=>{
 const hash=data=>crypto.createHash('sha256').update(data).digest('hex');
 const attachments=json(folder+'sources/attachments.json');assert.equal(attachments.length,7);
 for(const a of attachments)assert.equal(hash(fs.readFileSync(new URL(folder+'sources/'+a.file,root))),a.sha256);
 const images=json(folder+'images.source.json').images;assert.equal(images.length,3);
 for(const image of images){assert.deepEqual([image.width,image.height],[3826,4097]);assert.equal(hash(fs.readFileSync(new URL(folder+image.file,root))),image.sha256);}
 const entries=ui.window.KONTINENTE_REGISTRY.filter(e=>e.page.includes('Jarltum Schwarzfenn/'));assert.equal(entries.length,9);
 for(const entry of entries){const html=read('Kontinente/'+entry.page);assert.match(html,/data-herrschaft-shell/);assert.doesNotMatch(html,/on(?:click|input|change)=/i);}
 for(const p of pages)for(const g of p.view.councilGroups)for(const m of g.members)if(m.imageSrc)assert.ok(fs.existsSync(new URL('.'+m.imageSrc,root)),m.imageSrc);
 assert.match(read('Kontinente/Estryll/Königreich Aldrimar/Königreich von Aldrimar.html'),/Jarltum Schwarzfenn\/Jarltum Schwarzfenn.html/);
});

test('a repeated import can verify but cannot replace an already edited map',()=>{
 const options={folder:new URL('../../'+folder,import.meta.url),region:'Schwarzfenn',countyId:'jarltum-schwarzfenn',describePlace,territoriesById};
 const before=read(folder+'data.json');assert.doesNotThrow(()=>importReviewedTerritory(options));
 assert.throws(()=>importReviewedTerritory({...options,write:true}),/bereits bearbeitet/);assert.equal(read(folder+'data.json'),before);
});
