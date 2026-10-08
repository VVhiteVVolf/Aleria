import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { FAMILY_REGISTRY, getRegisteredFamily } from '../assets/js/data/families.registry.js';
import { assertValidFamily, normalizeFamily } from '../assets/js/domain/family-schema.js';
import { resolveRegisteredFamilyUpgrade } from '../assets/js/services/family-registry-upgrade.js';
import { toFamilyChartData } from '../assets/js/adapters/family-chart-adapter.js';
import { auditFamilyChartLayoutPolicy } from '../assets/js/adapters/family-chart-layout-policy.js';
import { PORTRAIT_PLACEHOLDERS, resolvePortraitSource } from '../assets/js/config/portrait-placeholders.js';
import { HOUSE_BLODEUWEDD_PORTRAITS } from '../assets/js/data/house-blodeuwedd-portraits.js';
import { HOUSE_MORGANT_PORTRAITS } from '../assets/js/data/house-morgant-portraits.js';
import { HOUSE_SERENOC_PORTRAITS } from '../assets/js/data/house-serenoc-portraits.js';
import { HOUSE_MORLAIS_PORTRAITS } from '../assets/js/data/house-morlais-portraits.js';

const expected = { blodeuwedd: [32,14,17,6,1], morgant: [34,15,18,7,1], serenoc: [34,16,17,8,1], morlais: [42,19,22,9,2] };
const records = Object.keys(expected).map(slug => getRegisteredFamily(`haus-${slug}`));
const portraitMaps = { blodeuwedd: HOUSE_BLODEUWEDD_PORTRAITS, morgant: HOUSE_MORGANT_PORTRAITS, serenoc: HOUSE_SERENOC_PORTRAITS, morlais: HOUSE_MORLAIS_PORTRAITS };

test('vier vollständige Quellenakten erhalten territoriale Identitäten und alle belegten Personen und Kanten', () => {
  for (const record of records) {
    const family = record.family;
    const slug = record.id.slice(5);
    assertValidFamily(family);
    assert.deepEqual(['persons','partnerships','parentages','cadetBranches','timeJumps'].map(key=>family[key].length), expected[slug]);
    assert.deepEqual(record.folderPath, ['Vennyr','Blütenland','Baronie Hoyers Krone','Lyndor']);
    assert.equal(family.document.houseProfile.rankId, 'unknown');
    assert.equal(family.extensions.blankFamily, false);
    assert.ok(family.extensions.sourceRevision >= 2);
    assert.equal(family.extensions.chartLayoutPolicy, 'strict-v1');
    assert.equal(new Set(family.persons.map(p=>p.worldPersonId)).size, family.persons.length);
    const connected = new Set([...family.partnerships.flatMap(p=>p.participantIds), ...family.parentages.flatMap(p=>[p.childId,...p.parentIds])]);
    assert.ok(family.persons.every(p=>connected.has(p.id) && !/^\?+$/.test(p.name)));
    assert.ok(toFamilyChartData(family).diagnostics.every(d=>d.severity !== 'error'));
    assert.deepEqual(auditFamilyChartLayoutPolicy(family).issues, []);
  }
});

test('gemeinsame Personen und Ehen sind in neuen und bestehenden Gegenakten identisch', () => {
  const facts = ['id','name','worldPersonId','sex','birth','death','status','portrait','portraitPlaceholder','houseId'];
  for (const record of records) {
    for (const person of record.family.persons) {
      for (const otherRecord of FAMILY_REGISTRY.filter(r=>r.id!==record.id)) {
        const other = otherRecord.family.persons.find(p=>p.worldPersonId===person.worldPersonId);
        if (!other) continue;
        for (const field of facts) {
          // Cadwgans eigenes Kadettenhaus besitzt eine eigene Haus-ID; die Weltperson bleibt dieselbe.
          if (person.id === 'cadwgan-lyfant' && field === 'houseId') {
            assert.ok(['house-lyfant','house-lyfant-caer-asgwrn'].includes(other.houseId));
            continue;
          }
          assert.equal(other[field], person[field], `${person.id}: ${field} / ${otherRecord.id}`);
        }
      }
    }
    for (const pair of record.family.partnerships) {
      for (const otherRecord of FAMILY_REGISTRY.filter(r=>r.id!==record.id)) {
        const other = otherRecord.family.partnerships.find(p=>p.id===pair.id);
        if (other) assert.deepEqual(other.participantIds,pair.participantIds, `${pair.id} / ${otherRecord.id}`);
      }
    }
  }
});

test('Wegheiraten enden am direkten Zielhaus; die beiden Morlais-Lücken bleiben seriell', () => {
  for (const record of records) {
    for (const branch of record.family.cadetBranches.filter(b=>b.linkType==='married-away')) {
      assert.ok(record.family.partnerships.some(p=>p.id===branch.parentPartnershipId));
      assert.ok(!record.family.parentages.some(p=>p.partnershipId===branch.parentPartnershipId), branch.id);
    }
    for (const gap of record.family.timeJumps) {
      const edges = record.family.parentages.filter(p=>p.extensions.timeJumpId===gap.id);
      assert.deepEqual(new Set(edges.map(p=>p.childId)),new Set(gap.childIds));
      assert.ok(edges.every(p=>p.type==='claimed' && p.certainty==='probable'));
    }
  }
  const morlais=getRegisteredFamily('haus-morlais').family;
  assert.deepEqual(morlais.timeJumps.map(g=>g.childIds), [['maygan-morlais','kibddar-founder-morlais'], ['gallgoid-morlais','ffion-morlais']]);
  const second=morlais.timeJumps[1];
  assert.ok(morlais.partnerships.find(p=>p.id===second.parentPartnershipId).participantIds.includes('kibddar-founder-morlais'));
});

test('neun unter 16 verstorbene Kinder erhalten tatsächlich die Kindersilhouette', () => {
  const children=records.flatMap(r=>r.family.persons.filter(p=>p.portraitPlaceholder==='child'));
  assert.equal(children.length,9);
  for(const child of children){
    assert.equal(child.portrait,'');
    assert.ok(Number(child.death)-Number(child.birth)<16);
    assert.equal(resolvePortraitSource(child),PORTRAIT_PLACEHOLDERS.child);
  }
  assert.equal(getRegisteredFamily('haus-morgant').family.persons.find(p=>p.id==='tegin-morgant').birth,'1718');
  assert.equal(getRegisteredFamily('haus-blodeuwedd').family.persons.find(p=>p.id==='rhydian-blodeuwedd').birth,'1650');
});

test('Hedds biologische Eltern und Cwingod-Pflegeeltern bleiben getrennt; March verweist auf die Stwatchn-Akte', () => {
  const morlais=getRegisteredFamily('haus-morlais').family;
  const cwingod=getRegisteredFamily('haus-cwningod').family;
  assert.deepEqual(new Set(morlais.parentages.find(p=>p.childId==='hedd-morlais').parentIds),new Set(['kibddar-1692-morlais','lunet-serenoc']));
  const foster=cwingod.parentages.find(p=>p.childId==='hedd-morlais');
  assert.equal(foster.type,'foster');
  assert.deepEqual(new Set(foster.parentIds),new Set(['tiwlip-arth','galeshin-cwningod']));
  assert.equal(morlais.persons.find(p=>p.id==='hedd-morlais').familyRole,'ward-away');
  assert.equal(cwingod.persons.find(p=>p.id==='hedd-morlais').familyRole,'ward');
  const morgant=getRegisteredFamily('haus-morgant').family;
  const march=morgant.persons.find(p=>p.id==='march-morgant');
  assert.match(march.notes,/Stwatchn aus Faelaorn/);
  const stwatchn = getRegisteredFamily('haus-stwatchn');
  assert.deepEqual(stwatchn.folderPath, ['Faelaorn', 'Tir na Rann', 'Invercalda']);
  assert.equal(stwatchn.family.extensions.blankFamily, false);
  assert.ok(stwatchn.family.persons.length > 0);
  const branch=morgant.cadetBranches.find(b=>b.parentPersonId===march.id);
  assert.equal(branch.name,'Haus Stwatchn');
  assert.equal(branch.targetFamilyId,'haus-stwatchn');
  assert.ok(!morgant.parentages.some(p=>p.childId===march.id && p.type==='foster'));
});

test('lokale Leerakten werden vollständig und wiederholungsfest ergänzt, Gegenkorrekturen erhalten Nachbardaten', () => {
  for(const record of records){
    const stale=structuredClone(record.family);
    for(const collection of ['persons','partnerships','parentages','cadetBranches','timeJumps'])stale[collection]=[];
    stale.lineage.founderPartnershipId='';stale.view.focusPersonId='';
    stale.extensions.sourceRevision=1;stale.extensions.blankFamily=true;stale.extensions.localNote='Bleibt erhalten';
    const upgraded=resolveRegisteredFamilyUpgrade(record.family,stale);
    assert.equal(upgraded.persons.length,record.family.persons.length);
    assert.equal(upgraded.lineage.founderPartnershipId,record.family.lineage.founderPartnershipId);
    assert.equal(upgraded.extensions.localNote,'Bleibt erhalten');
    assert.deepEqual(resolveRegisteredFamilyUpgrade(record.family,upgraded),upgraded);
  }
  for(const id of ['haus-cwningod','haus-arfordir','haus-blodyn']){
    const registered=getRegisteredFamily(id).family;
    const stale=structuredClone(registered);
    stale.extensions.sourceRevision = { 'haus-cwningod':2, 'haus-arfordir':2, 'haus-blodyn':4 }[id];
    stale.persons[0].notes='Lokale Nachbarnotiz';
    if(id==='haus-cwningod'){
      stale.persons.find(p=>p.id==='mervyn-serenoc').name='Mervyn Serenoc';
      stale.persons.find(p=>p.id==='hedd-morlais').notes='Biologische Eltern unbekannt';
      stale.persons.find(p=>p.id==='clinoch-cwingod').notes='Lokale Seefahrtsnotiz';
      stale.persons.find(p=>p.id==='clinoch-cwingod').name='Clinoch Cwningod';
    }else if(id==='haus-arfordir')stale.persons.find(p=>p.id==='jenita-blodeuwedd').portrait='';
    else {
      stale.persons.find(p=>p.id==='hetwn-morgant').sex='female';
      stale.persons.find(p=>p.id==='telyn-blodyn').sex='male';
    }
    const upgraded=resolveRegisteredFamilyUpgrade(registered,stale);
    assert.equal(upgraded.persons[0].notes,'Lokale Nachbarnotiz',id);
    if(id==='haus-cwningod'){
      assert.equal(upgraded.persons.find(p=>p.id==='clinoch-cwingod').notes,'Lokale Seefahrtsnotiz');
      assert.equal(upgraded.persons.find(p=>p.id==='clinoch-cwingod').name,'Clinoch Cwingod');
    }
    for(const targetId of id==='haus-cwningod'?['mervyn-serenoc','hedd-morlais']:id==='haus-arfordir'?['jenita-blodeuwedd']:['hetwn-morgant','telyn-blodyn']){
      const target=upgraded.persons.find(p=>p.id===targetId);
      const source=registered.persons.find(p=>p.id===targetId);
      for(const field of source.extensions.registryManagedFields)assert.deepEqual(target[field],source[field],targetId+' '+field);
    }
    assert.deepEqual(resolveRegisteredFamilyUpgrade(registered,upgraded),upgraded);
  }
});

test('Individualporträts und vier separat gesicherte Kriegerbilder besitzen vollständige Quellenbelege', () => {
  for(const [slug,map] of Object.entries(portraitMaps)){
    const manifest=JSON.parse(fs.readFileSync(new URL(`../assets/images/portraits/haus-${slug}/portrait-sources.json`,import.meta.url),'utf8'));
    assert.deepEqual(new Set(Object.keys(manifest)),new Set(Object.keys(map)));
    for(const path of Object.values(map)){
      const bytes=fs.readFileSync(new URL('../'+path,import.meta.url));
      assert.ok(bytes.length>2000,path);
      assert.ok(bytes[0]===137&&bytes[1]===80 || bytes[0]===255&&bytes[1]===216,path);
    }
    const record=getRegisteredFamily(`haus-${slug}`);
    assert.ok(fs.statSync(new URL('../'+record.family.extensions.warriorReference,import.meta.url)).size>2000);
    assert.ok(!record.family.persons.some(p=>p.portrait===record.family.extensions.warriorReference));
  }
});
