import { BRANN_SOURCE_COUNTER_PATCHES } from '../assets/js/data/brann-source-counter-patches.js';
import { FAERNA_SOURCE_COUNTER_PATCHES } from '../assets/js/data/faerna-source-counter-patches.js';
import { DAMH_SOURCE_COUNTER_PATCHES } from '../assets/js/data/damh-source-counter-patches.js';
import { MATHGHAM_SOURCE_COUNTER_PATCHES } from '../assets/js/data/mathgham-source-counter-patches.js';
import { BRAIGH_SOURCE_COUNTER_PATCHES } from '../assets/js/data/braigh-source-counter-patches.js';
import { fingerprintBeforeMathgham } from './mathgham-invariants.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { FAMILY_REGISTRY, getRegisteredFamily } from '../assets/js/data/families.registry.js';
import { FAELAORN_SOURCE_FAMILIES } from '../assets/js/data/faelaorn-source-families.js';
import { FAELAORN_SOURCE_CATALOG as catalog } from '../assets/js/data/faelaorn-source-catalog.js';
import { FAELAORN_SOURCE_COUNTER_PATCHES as patches } from '../assets/js/data/faelaorn-source-counter-patches.js';
import { withFaelaornSourceCounterUpgrade } from '../assets/js/data/faelaorn-source-counter-upgrade.js';
import { normalizeFamily, assertValidFamily } from '../assets/js/domain/family-schema.js';
import { resolveRegisteredFamilyUpgrade } from '../assets/js/services/family-registry-upgrade.js';
import { toFamilyChartData } from '../assets/js/adapters/family-chart-adapter.js';
import { auditFamilyChartLayoutPolicy } from '../assets/js/adapters/family-chart-layout-policy.js';
import { validateWorkspaceForPublishing } from '../../firebase/functions/src/families/family-validation.js';

const read = path => JSON.parse(fs.readFileSync(new URL('../' + path, import.meta.url), 'utf8'));
const audit = read('assets/data/source-inventories/faelaorn-families-audit-2026-10-08.json');
const baseline = read('scripts/faelaorn-source-import/baseline.json');
const counts = {urquhart:135, bhaird:72, luthsach:52, lachlann:69, drummond:67, stwatchn:67, dundas:46};
const family = slug => getRegisteredFamily('haus-' + slug).family;
const id = ref => audit.sourceToPerson[ref];
const person = ref => family(ref.split(':')[0]).persons.find(p => p.id === id(ref));
const parentage = ref => family(ref.split(':')[0]).parentages.find(p => p.childId === id(ref));

test('508 supplied appearances resolve to seven connected trees and 444 stable identities', () => {
  assert.equal(audit.sourceCards.length, 508);
  assert.equal(Object.keys(catalog.persons).length, 444);
  for (const [slug, count] of Object.entries(counts)) {
    const f = normalizeFamily(family(slug));
    assertValidFamily(f);
    assert.equal(f.extensions.blankFamily, false);
    assert.equal(f.extensions.sourceRevision, BRANN_SOURCE_COUNTER_PATCHES[f.document.id]?.revision || DAMH_SOURCE_COUNTER_PATCHES[f.document.id]?.revision || FAERNA_SOURCE_COUNTER_PATCHES[f.document.id]?.revision || BRAIGH_SOURCE_COUNTER_PATCHES[f.document.id]?.revision || MATHGHAM_SOURCE_COUNTER_PATCHES[f.document.id]?.revision || 2);
    assert.equal(f.persons.length, count, slug);
    assert.equal(new Set(f.persons.map(p => p.worldPersonId)).size, count);
    assert.deepEqual(auditFamilyChartLayoutPolicy(f).issues, [], slug);
    assert.deepEqual(toFamilyChartData(f).diagnostics.filter(d => d.severity !== 'info'), [], slug);
    const connected = new Set([...f.partnerships.flatMap(p => p.participantIds), ...f.parentages.flatMap(p => [p.childId, ...p.parentIds])]);
    for (const p of f.persons) assert.ok(connected.has(p.id), p.id);
    for (const card of audit.sourceCards.filter(c => c.slug === slug)) assert.ok(f.persons.some(p => p.id === id(card.ref)), card.ref);
    const {persons, houses, partnerships, parentages, cadetBranches, timeJumps, ...root} = f;
    const result = validateWorkspaceForPublishing({root:{...root,familyId:f.document.id},collections:{persons,houses,partnerships,parentages,cadetBranches,timeJumps}});
    assert.equal(result.valid, true, JSON.stringify(result));
  }
});

test('user-corrected dates, explicit sibling groups and image counterparts remain canonical', () => {
  assert.equal(person('bhaird:189:0').birth, '1727');
  assert.equal(person('lachlann:91:0').death, '1611');
  assert.equal(id('lachlann:91:0'), id('drummond:91:0'));
  assert.equal(person('urquhart:193:2').death, '1689');
  assert.equal(id('urquhart:193:2'), id('luthsach:100:0'));
  assert.equal(id('stwatchn:10:1'), id('dundas:0:0'));
  assert.equal(id('stwatchn:70:0'), id('dundas:60:6'));
  assert.equal(id('stwatchn:70:7'), id('dundas:60:1'));
  assert.equal(id('stwatchn:40:1'), id('urquhart:226:0'));
  assert.equal(id('dundas:60:5'), id('bhaird:167:1'));
  for (const ref of ['urquhart:245:1','urquhart:245:2','urquhart:245:3']) {
    assert.deepEqual(new Set(parentage(ref).parentIds), new Set([id('urquhart:231:4'),id('urquhart:236:4')]));
  }
  assert.deepEqual(new Set(parentage('drummond:136:0').parentIds), new Set([id('drummond:126:0'),id('drummond:131:0')]));
  for (const f of FAELAORN_SOURCE_FAMILIES) for (const p of f.parentages.filter(p => p.type === 'biological')) {
    const child = f.persons.find(x => x.id === p.childId);
    for (const pid of p.parentIds) {
      const parent = f.persons.find(x => x.id === pid);
      if (/^\d+$/.test(child.birth) && /^\d+$/.test(parent.birth)) assert.ok(Number(child.birth) - Number(parent.birth) >= 14, child.id);
      if (/^\d+$/.test(child.birth) && /^\d+$/.test(parent.death)) assert.ok(Number(child.birth) <= Number(parent.death) + 1, child.id);
    }
  }
});

test('affair children, incoming wards and Nairns outgoing ward remain distinct', () => {
  for (const [child, parent] of [['stwatchn:80:6','stwatchn:70:2'],['urquhart:289:2','urquhart:259:2'],['lachlann:184:4','lachlann:166:2'],['drummond:184:4','drummond:166:0']]) {
    assert.equal(parentage(child).type, 'foster');
    assert.deepEqual(parentage(child).parentIds, [id(parent)]);
    assert.equal(person(child).familyRole, 'ward');
  }
  assert.equal(person('stwatchn:80:3').familyRole, 'ward-away');
  assert.ok(family('stwatchn').cadetBranches.some(b => b.parentPersonId === id('stwatchn:80:3') && b.targetFamilyId === 'haus-ceallaigh'));
  for (const child of ['stwatchn:80:11','stwatchn:80:12']) {
    assert.equal(parentage(child).legitimacy, 'illegitimate');
    assert.deepEqual(new Set(parentage(child).parentIds),new Set([id('stwatchn:70:5'),id('stwatchn:70:12')]));
  }
  for (const child of ['bhaird:189:2','bhaird:189:3']) {
    assert.equal(parentage(child).legitimacy, 'illegitimate');
    assert.deepEqual(new Set(parentage(child).parentIds),new Set([id('bhaird:171:2'),id('bhaird:180:1')]));
  }
});

test('war context and old seats survive; only supplied warrior illustrations are linked', () => {
  const expectedGaps = {urquhart:7,bhaird:2,luthsach:1,lachlann:0,drummond:0,stwatchn:2,dundas:1};
  for (const [slug, gaps] of Object.entries(expectedGaps)) {
    const f = family(slug);
    assert.equal(f.timeJumps.length, gaps);
    assert.equal(f.extensions.faelaornWarContext.administrativeBasis,'historical');
    assert.equal(f.document.houseProfile.kingdom,'Faelaorn');
    assert.ok(f.extensions.houseBiographyModule.description.length > 150);
    if (['stwatchn','dundas'].includes(slug)) {
      assert.equal(f.extensions.warriorReference,'');
      assert.equal(f.extensions.houseBiographyModule.image,f.document.emblem);
      assert.equal(f.extensions.houseBiographyModule.house.documents.length,0);
    } else assert.ok(fs.existsSync(new URL('../' + f.extensions.warriorReference,import.meta.url)));
  }
  assert.equal(family('stwatchn').document.houseProfile.seat,'Invercalda');
  assert.equal(family('dundas').document.houseProfile.seat,'Dun Foirgneamh');
});

test('all source bytes and portraits exist, including supplied children portraits', () => {
  const inventory=read(catalog.inventory);
  assert.equal(inventory.sources.length,5);
  assert.equal(audit.referenceAssets.length,5);
  assert.equal(audit.portraitAssets.length,131);
  assert.equal(Object.keys(audit.reusedPortraits).length,39);
  assert.equal(inventory.graphicSources.length,2);
  assert.equal(inventory.graphicSources.reduce((sum, source) => sum + source.cards, 0),113);
  for (const source of inventory.graphicSources) {
    const bytes=fs.readFileSync(new URL('../'+source.transcriptionPath,import.meta.url));
    assert.equal(createHash('sha256').update(bytes).digest('hex'),source.transcriptionSha256);
  }
  assert.ok(audit.portraitAssets.every(asset => !/7yB9PR6|51CghpL/.test(asset.url)));
  for (const asset of [...inventory.sources,...audit.referenceAssets,...audit.portraitAssets]) {
    const bytes=fs.readFileSync(new URL('../'+asset.path,import.meta.url));
    assert.equal(createHash('sha256').update(bytes).digest('hex'),asset.sha256,asset.path);
  }
  for (const p of Object.values(catalog.portraits)) assert.ok(fs.existsSync(new URL('../'+p,import.meta.url)),p);
  for (const f of FAELAORN_SOURCE_FAMILIES) for (const p of f.persons) {
    if (catalog.portraits[p.id]) assert.equal(p.portrait,catalog.portraits[p.id],p.id);
  }
});

test('upgrading prepared families is idempotent and preserves local notes and views', () => {
  for (const slug of Object.keys(counts)) {
    const registered=normalizeFamily(family(slug));
    const local=structuredClone(registered);
    local.extensions.sourceRevision=1;local.extensions.blankFamily=true;
    local.persons=[];local.partnerships=[];local.parentages=[];local.cadetBranches=[];local.timeJumps=[];
    local.view.orientation='horizontal';local.extensions.researchNote='Eigene Recherche';
    const upgraded=resolveRegisteredFamilyUpgrade(registered,local);
    assertValidFamily(upgraded);
    assert.equal(upgraded.persons.length,counts[slug]);
    assert.equal(upgraded.view.orientation,'horizontal');
    assert.equal(upgraded.extensions.researchNote,'Eigene Recherche');
    assert.deepEqual(resolveRegisteredFamilyUpgrade(registered,upgraded),upgraded);
  }
});

test('counterpart changes touch only reviewed fields and preserve existing identities and custom portraits', () => {
  for (const [familyId,patch] of Object.entries(patches)) {
    const registered=normalizeFamily(getRegisteredFamily(familyId).family);
    const old=normalizeFamily({...registered,...baseline.find(r=>r.id===familyId).family});
    for (const p of old.persons) {
      const current=registered.persons.find(x=>x.id===p.id);
      assert.equal(current.worldPersonId,p.worldPersonId,p.id);
      for (const key of Object.keys(p).filter(k=>k!=='extensions'&&!Object.hasOwn({...patch.collections.persons?.[p.id],...MATHGHAM_SOURCE_COUNTER_PATCHES[familyId]?.collections.persons?.[p.id]},k))) assert.deepEqual(current[key],p[key],`${familyId}/${p.id}/${key}`);
    }
    const local=structuredClone(registered);
    local.extensions.sourceRevision=patch.revision-1;
    local.view.orientation='horizontal';
    local.persons.forEach(p=>{p.notes='Eigene Recherche';p.title='Eigener Titel';});
    for (const [pid,fields] of Object.entries(patch.collections.persons||{})) {
      if (fields.portrait) local.persons.find(p=>p.id===pid).portrait='assets/images/own-research.png';
    }
    const upgraded=resolveRegisteredFamilyUpgrade(registered,local);
    assertValidFamily(upgraded);
    assert.deepEqual(upgraded.parentages,local.parentages);
    assert.equal(upgraded.view.orientation,'horizontal');
    assert.ok(upgraded.persons.every(p=>p.notes==='Eigene Recherche'&&p.title==='Eigener Titel'));
    for (const [pid,fields] of Object.entries(patch.collections.persons||{})) if (fields.portrait) assert.equal(upgraded.persons.find(p=>p.id===pid).portrait,'assets/images/own-research.png');
    assert.deepEqual(resolveRegisteredFamilyUpgrade(registered,upgraded),upgraded);
    assert.equal(withFaelaornSourceCounterUpgrade(getRegisteredFamily(familyId).family),getRegisteredFamily(familyId).family);
  }
});

test('all other registered family records retain exact pre-import fingerprints', () => {
  const fingerprints=read('scripts/faelaorn-source-import/baseline-fingerprints.json');
  const changed=new Set([...Object.keys(patches),...FAELAORN_SOURCE_FAMILIES.map(f=>f.document.id)]);
  assert.equal(FAMILY_REGISTRY.length,518);
  const unchanged=FAMILY_REGISTRY.filter(r=>!changed.has(r.id));
  assert.equal(unchanged.length,497);
  for (const r of unchanged) assert.equal(fingerprintBeforeMathgham(r.family),fingerprints[r.id],r.id);
});
