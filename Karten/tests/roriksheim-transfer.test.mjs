import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import vm from 'node:vm';
import { buildTransferReview, projectSourcePosition } from '../modules/territory-transfer/transfer-model.mjs';
import { applyTransferDecisions } from '../modules/territory-transfer/transfer-decisions.mjs';
import { HOUSE_WOLFSHORN_FAMILY } from '../../Stammbäume/assets/js/data/house-wolfshorn-family.js';
import { HOUSE_BLEIDDORN_FAMILY } from '../../Stammbäume/assets/js/data/house-bleiddorn-family.js';
import { resolveRegisteredFamilyUpgrade } from '../../Stammbäume/assets/js/services/family-registry-upgrade.js';

const folder=new URL('../Aldrimar/roriksheim/',import.meta.url);
const read=name=>JSON.parse(fs.readFileSync(new URL(name,folder),'utf8'));
const source=read('source-markers.json');
const targets=read('new-pins.source.json');
// Generated category/template references are resolved by the build against the shared catalogs.
const generated=read('transfer.generated.json');
for(const pin of targets.pins){const resolved=generated.pins.find(p=>p.id===pin.id);if(resolved){pin.category=resolved.category;pin.templateId=resolved.templateId;}}
const territories=read('territories.source.json');
const decisions=read('transfer-decisions.source.json');
const review=buildTransferReview(source,targets,territories,decisions);

test('all 187 marker IDs, descriptions and exact source coordinates survive normalization',()=>{
  const original=read('sources/worldanvil-markers.json');
  assert.equal(source.markers.length,187);
  assert.equal(new Set(source.markers.map(s=>s.id)).size,187);
  assert.equal(source.markers.filter(s=>s.descriptionBBCode).length,163);
  for(const marker of source.markers){
    const raw=original.markers.find(s=>s.id===marker.id);
    assert.ok(raw,marker.id);assert.equal(raw.descriptionBBCode,marker.descriptionBBCode);
    assert.deepEqual(raw.coordinates,marker.coordinates);
    if(marker.coordinates){
      assert.equal(marker.coordinates.x,Number(marker.fields.find(f=>f.id==='mapbundle_marker_geoX').value));
      assert.equal(marker.coordinates.y,Number(marker.fields.find(f=>f.id==='mapbundle_marker_geoY').value));
    }
    assert.match(marker.url,new RegExp('/marker/'+marker.id+'/edit$'));
    assert.ok(marker.name);assert.ok(marker.fields.every(f=>!/_token|csrf|password/i.test(f.name)));
  }
  assert.deepEqual(Object.fromEntries(['place','area','tribe','event','annotation','context'].map(kind=>[kind,source.markers.filter(s=>s.kind===kind).length])),{place:158,area:14,tribe:9,event:3,annotation:2,context:1});
});

test('the taller target canvas uses new image coordinates and never old normalized percentages',()=>{
  assert.deepEqual(source.imageSize,[4096,2656]);assert.deepEqual(targets.imageSize,[4096,2734]);
  const marker=source.markers.find(s=>s.name==='Rorikshall');
  assert.deepEqual(projectSourcePosition(marker,targets.imageSize),{x:2961,y:763});
  assert.notEqual(763/2734,1-marker.coordinates.y/2656);
  for(const pin of targets.pins){
    assert.ok(pin.position.x>=0&&pin.position.x<=4096&&pin.position.y>=0&&pin.position.y<=2734,pin.id);
    assert.equal(pin.position.origin,'top-left');
  }
});

test('all three confirmed Schwarzdorn exclaves preserve their geographic host regions',()=>{
  const exclaves=targets.pins.filter(p=>p.exclave);
  assert.equal(exclaves.length,3);
  assert.deepEqual(exclaves.map(p=>p.geographicZoneId).sort(),['klangheim','schwerthohn','winterfaenge']);
  assert.ok(exclaves.every(p=>p.territoryId==='schwarzdorn'));
  const newBrewery=exclaves.find(p=>p.geographicZoneId==='klangheim');
  const dornquell=review.pins.find(p=>p.id===newBrewery.id);
  assert.equal(dornquell.sourceId,'');
  assert.equal(dornquell.proposedName,'Dornquell');
  assert.equal(dornquell.decision.id,'roriksheim-dornquell');
  assert.ok(!source.markers.some(s=>s.name.toLocaleLowerCase('de')===dornquell.proposedName.toLocaleLowerCase('de')));
  for(const pin of review.pins.filter(p=>p.exclave&&p.sourceId)){
    assert.match(pin.proposedName,/Maltvik|Schwarzhof/);
  }
});

test('candidate search remains reversible, unique and separate from confirmed import data',()=>{
  const before=JSON.stringify({source,targets,territories,decisions});
  const result=buildTransferReview(source,targets,territories,decisions);
  assert.equal(JSON.stringify({source,targets,territories,decisions}),before);
  assert.equal(result.pins.length,168);
  const assigned=result.pins.map(p=>p.sourceId).filter(Boolean);
  assert.equal(assigned.length,new Set(assigned).size);
  assert.equal(result.pins.filter(p=>p.confirmed).length,14);
  assert.ok(result.pins.filter(p=>!p.userPlacement&&!p.decision).every(p=>p.confirmed===false));
  for(const wreck of result.sources.filter(s=>s.oldIconHint==='schiffswrack.png')){
    assert.ok(wreck.proposal);
    const pin=result.pins.find(p=>p.sourceId===wreck.id);
    assert.equal(pin.status,'placed');assert.equal(pin.icon,'/Karten/assets/icons/welt/schiffswrackpin.png');
    assert.ok(pin.position.x>=1100&&pin.position.x<=1400&&pin.position.y>=100&&pin.position.y<=450);
  }
  for(const marker of result.sources.filter(s=>s.kind!=='place'))assert.equal(marker.proposal,null);
  assert.deepEqual(read('transfer.generated.json'),result);
});

test('all supplied HTML and only the three new map images remain verifiable',()=>{
  const sha=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
  const originals=read('sources/attachments.json');assert.equal(originals.length,12);
  for(const entry of originals)assert.equal(sha(fs.readFileSync(new URL('sources/'+entry.file,folder))),entry.sha256);
  const images=read('images.source.json');assert.deepEqual(images.map(i=>i.id).sort(),['normal','pins','regions']);
  for(const image of images){assert.deepEqual(image.sourceSize,[4096,2734]);assert.equal(sha(fs.readFileSync(new URL(image.file,folder))),image.sha256);}
  assert.equal(read('data.json').state.pins.length,168);
});

test('new symbols use existing categories and matching table templates',()=>{
  const context={};
  for(const file of ['category-catalog.js','pin-template-catalog.js','pin-table-presets.js']){
    vm.runInNewContext(fs.readFileSync(new URL('../assets/js/pins/'+file,import.meta.url),'utf8'),context);
  }
  const iconTypes=read('icon-types.source.json');
  for(const pin of generated.pins){
    const category=context.KartoCategoryCatalog.definition({label:pin.decision?.category||iconTypes[pin.icon.split('/').at(-1)]});
    assert.ok(category,pin.icon);
    assert.equal(pin.category,category.label);
    assert.equal(pin.templateId,context.KartoPinTablePresets.forCategory(category).templateId);
    assert.ok(fs.existsSync(new URL('../../'+pin.icon,import.meta.url)),pin.icon);
  }
  for(const territory of territories.territories)for(const asset of [territory.crest,territory.banner].filter(Boolean)){
    assert.ok(fs.existsSync(new URL('../../'+asset,import.meta.url)),asset);
  }
});

test('removed taverns, Hornling tribes and battles cannot match any new position',()=>{
  const removed=review.sources.filter(s=>s.status==='excluded');
  assert.equal(removed.length,12);
  assert.equal(removed.filter(s=>s.kind==='place').length,5);
  assert.equal(removed.filter(s=>s.kind==='tribe').length,4);
  assert.equal(removed.filter(s=>s.kind==='event').length,3);
  assert.ok(removed.every(s=>!s.proposal&&s.candidates.length===0));
  assert.ok(review.pins.every(p=>!removed.some(s=>s.id===p.sourceId)));
  assert.ok(!review.pins.some(p=>p.id==='new-pin-059b'||p.category==='Taverne'));
  const hall=review.pins.find(p=>p.proposedName==='Halle der Skalden');
  assert.ok(hall);assert.equal(hall.category,'Besondere Orte');
  assert.equal(review.counts.oldPlacesWithoutTarget,0);
});

test('embedded regions and Gleannmor never become point markers or fabricated routes',()=>{
  const embedded=review.sources.filter(s=>s.status==='embedded');
  assert.equal(embedded.length,14);assert.ok(embedded.every(s=>s.kind==='area'&&!s.proposal));
  assert.ok(embedded.some(s=>s.name==='Angrenzendes Gebiet'));
  const road=review.sources.find(s=>s.name==='Gleannmor');
  assert.equal(road.kind,'context'); // the original captured kind is retained
  assert.equal(road.status,'route');assert.equal(road.proposal,null);
  assert.equal(road.candidates.length,0);
  assert.equal(review.counts.contextEntries,8);
});

test('Hornhall reuses a position, keeps Horunn and follows Bjoerns succession after Hrolfs exile',()=>{
  const hornhall=review.pins.find(p=>p.proposedName==='Hornhall');
  assert.equal(hornhall.id,'new-pin-137');assert.equal(hornhall.sourceId,'');
  assert.equal(hornhall.territoryId,'daemmergrund');
  assert.equal(hornhall.decision.affiliation.house,'Clan Wolfshorn');
  assert.equal(hornhall.decision.affiliation.liege,'Clan Vangandr');
  assert.equal(hornhall.category,'Burg');
  assert.equal(hornhall.icon,'/Karten/assets/icons/welt/gro-e-burg.png');
  assert.equal(targets.pins.find(p=>p.id===hornhall.id).icon,'/Karten/assets/icons/welt/zerst-rte-siedlung.png');
  const lord=HOUSE_WOLFSHORN_FAMILY.persons.find(p=>p.id===hornhall.decision.affiliation.lordId);
  assert.equal(lord.name,hornhall.decision.affiliation.lord);
  assert.match(lord.title,/Hornhall/);
  assert.ok(!HOUSE_BLEIDDORN_FAMILY.persons.some(p=>p.id===lord.id));
  for(const id of ['hrolf-wolfshorn','ylva-wolfshorn','asgeir-wolfshorn','halvar-wolfshorn']){
    const sourcePerson=HOUSE_WOLFSHORN_FAMILY.persons.find(p=>p.id===id);
    const emigrant=HOUSE_BLEIDDORN_FAMILY.persons.find(p=>p.id===id);
    assert.equal(emigrant.worldPersonId,sourcePerson.worldPersonId);
    assert.match(sourcePerson.notes,/Exil/);
  }
  assert.ok(review.pins.some(p=>p.proposedName==='Burg Horunn'));
  const hjamstad=review.sources.find(s=>s.name==='Hjamstad');
  assert.equal(hjamstad.proposal.targetId,'new-pin-123');
  for(const field of ['crest','liegeCrest'])assert.ok(fs.existsSync(new URL('../../'+hornhall.decision.affiliation[field],import.meta.url)));
  for(const placement of decisions.placements.filter(p=>p.sourceId)){
    assert.equal(review.sources.find(s=>s.id===placement.sourceId).proposal.targetId,placement.targetId);
  }
});

test('invalid decisions fail before they can silently replace a source or target',()=>{
  const assignment=decisions.placements.find(p=>p.sourceId);
  assert.throws(()=>applyTransferDecisions(source,targets,{placements:[assignment,{...assignment,targetId:'new-pin-128'}]}),/doppelte Ortsquelle/);
  assert.throws(()=>applyTransferDecisions(source,targets,{placements:[assignment,assignment]}),/doppelt belegtes Ziel/);
  assert.throws(()=>applyTransferDecisions(source,targets,{sourceRules:[{disposition:'excluded',sourceIds:['missing']}]}),/Quellenentscheidung/);
});

test('the succession correction upgrades saved family notes once while retaining identities and later edits',()=>{
  for(const current of [HOUSE_WOLFSHORN_FAMILY,HOUSE_BLEIDDORN_FAMILY]){
    const stale=structuredClone(current);
    stale.extensions.sourceRevision=current.extensions.sourceRevision-1;
    stale.document.description='Veraltete Darstellung';
    const hrolf=stale.persons.find(p=>p.id==='hrolf-wolfshorn');
    hrolf.notes='Veraltete Darstellung';hrolf.tags=['Eigene Ergänzung'];
    const bjoern=stale.persons.find(p=>p.id==='bjorn-wolfshorn');
    if(bjoern){bjoern.title='Huskarl';bjoern.notes='Veraltete Darstellung';}
    const upgraded=resolveRegisteredFamilyUpgrade(current,stale);
    assert.match(upgraded.persons.find(p=>p.id===hrolf.id).notes,/Exil/);
    assert.deepEqual(upgraded.persons.map(p=>p.worldPersonId),stale.persons.map(p=>p.worldPersonId));
    assert.deepEqual(upgraded.persons.find(p=>p.id===hrolf.id).tags,['Eigene Ergänzung']);
    if(bjoern){
      assert.match(upgraded.persons.find(p=>p.id===bjoern.id).title,/Hornhall/);
      assert.match(upgraded.document.description,/Bjoern/);
    }
    upgraded.persons.find(p=>p.id===hrolf.id).notes='Spätere eigene Ergänzung';
    const future=structuredClone(current);future.extensions.sourceRevision+=1;
    const later=resolveRegisteredFamilyUpgrade(future,upgraded);
    assert.equal(later.persons.find(p=>p.id===hrolf.id).notes,'Spätere eigene Ergänzung');
  }
});
