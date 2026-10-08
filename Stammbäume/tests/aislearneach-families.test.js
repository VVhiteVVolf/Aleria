import { fingerprintBeforeMathgham } from './mathgham-invariants.js';
import { ALBEN_SOURCE_PORTRAITS, ALBEN_SOURCE_PORTRAIT_FAMILIES } from '../assets/js/data/alben-source-portraits.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { FAMILY_REGISTRY, getRegisteredFamily } from '../assets/js/data/families.registry.js';
import { AISLEARNEACH_SOURCE_FAMILIES as families } from '../assets/js/data/aislearneach-source-families.js';
import { AISLEARNEACH_SOURCE_CATALOG as catalog } from '../assets/js/data/aislearneach-source-catalog.js';
import { AISLEARNEACH_SOURCE_COUNTER_PATCHES as patches } from '../assets/js/data/aislearneach-source-counter-patches.js';
import { withAislearneachSourceCounterUpgrade } from '../assets/js/data/aislearneach-source-counter-upgrade.js';
import { normalizeFamily, assertValidFamily } from '../assets/js/domain/family-schema.js';
import { resolveRegisteredFamilyUpgrade } from '../assets/js/services/family-registry-upgrade.js';
import { toFamilyChartData } from '../assets/js/adapters/family-chart-adapter.js';
import { auditFamilyChartLayoutPolicy } from '../assets/js/adapters/family-chart-layout-policy.js';
import { validateWorkspaceForPublishing } from '../../firebase/functions/src/families/family-validation.js';

const read = path => JSON.parse(fs.readFileSync(new URL('../' + path, import.meta.url), 'utf8'));
const audit = read('assets/data/source-inventories/aislearneach-families-audit-2026-10-08.json');
const inventory = read(catalog.inventory);
const counts = { morna:81, ceallaigh:73, fintain:72, durthacht:90, coronach:37, morgacht:32, rioga:51, fiantorc:47, treada:39, muileach:50, 'ui-faill-duibhne':42, feannag:43, uilebheist:34, cnogan:35, techtmar:9, fiachiontach:49, tartarfhuil:46, gaisgh:38, luchdon:40 };
const id = ref => audit.sourceToPerson[ref];
const family = slug => getRegisteredFamily((slug === 'techtmar' ? 'sept-' : 'haus-') + slug).family;
const person = ref => family(ref.split(':')[0]).persons.find(p => p.id === id(ref));
const parentage = ref => family(ref.split(':')[0]).parentages.find(p => p.childId === id(ref));

test('908 source cards form nineteen complete, connected families and 752 identities', () => {
  assert.equal(audit.sourceCards.length, 908);
  assert.equal(Object.keys(audit.sourceToPerson).length, 908);
  assert.equal(Object.keys(catalog.persons).length, 752);
  for (const [slug, count] of Object.entries(counts)) {
    const f = normalizeFamily(family(slug));
    assertValidFamily(f);
    assert.equal(f.persons.length, count, slug);
    assert.equal(new Set(f.persons.map(p => p.worldPersonId)).size, count, slug);
    assert.deepEqual(auditFamilyChartLayoutPolicy(f).issues, [], slug);
    assert.deepEqual(toFamilyChartData(f).diagnostics.filter(d => d.severity !== 'info'), [], slug);
    const connected = new Set([...f.partnerships.flatMap(p => p.participantIds), ...f.parentages.flatMap(p => [p.childId, ...p.parentIds])]);
    for (const p of f.persons) assert.ok(connected.has(p.id), p.id);
    for (const card of audit.sourceCards.filter(c => c.slug === slug)) assert.ok(f.persons.some(p => p.id === id(card.ref)), card.ref);
    const { persons, houses, partnerships, parentages, cadetBranches, timeJumps, ...root } = f;
    assert.equal(validateWorkspaceForPublishing({ root:{...root, familyId:f.document.id}, collections:{persons,houses,partnerships,parentages,cadetBranches,timeJumps} }).valid, true, slug);
  }
});

test('confirmed dates and reviewed counterpart aliases retain stable world identities', () => {
  assert.equal(person('cnogan:145:0').birth, '1718');
  assert.equal(person('cnogan:145:1').birth, '1725');
  assert.equal(person('ceallaigh:140:1').death, '1739');
  assert.equal(id('ceallaigh:140:1'), id('luchdon:120:0'));
  assert.equal(id('morna:181:1'), 'cailte-1694-ronain');
  assert.equal(person('morna:181:1').status, 'alive');
  assert.equal(id('fiachiontach:145:1'), 'ultan-tir-fiachiontach');
  assert.equal(person('fiachiontach:145:1').houseId, 'house-fiachiontach');
  assert.equal(id('fiachiontach:149:2'), 'caolan-1727-fiachiontach');
  assert.equal(person('fiachiontach:149:2').birth, '1728');
  assert.equal(id('morgacht:118:2'), id('fiachiontach:125:1'));
  assert.equal(person('gaisgh:123:2').name, 'Vairbh Goidin');
  assert.equal(person('ui-faill-duibhne:115:0').birth, '1582');
  assert.notEqual(id('durthacht:91:0'), id('durthacht:101:0'));
});

test('caption corrections attach children to the graph-supported parents', () => {
  for (const [child, a, b] of [
    ['muileach:135:3','muileach:125:3','muileach:130:3'],
    ['ui-faill-duibhne:140:0','ui-faill-duibhne:130:0','ui-faill-duibhne:135:0'],
    ['ui-faill-duibhne:140:2','ui-faill-duibhne:130:2','ui-faill-duibhne:135:2'],
    ['ui-faill-duibhne:159:2','ui-faill-duibhne:150:2','ui-faill-duibhne:155:2'],
    ['fiachiontach:145:0','fiachiontach:135:0','fiachiontach:140:0'],
    ['tartarfhuil:142:0','tartarfhuil:128:0','tartarfhuil:137:0']
  ]) assert.deepEqual(new Set(parentage(child).parentIds), new Set([id(a),id(b)]), child);
});

test('cadet origins and serial gaps remain explicit without invented intermediate parents', () => {
  for (const [a,b] of [['coronach:83:0','morna:110:2'],['muileach:83:0','morna:98:0'],['fiantorc:83:0','durthacht:108:1'],['treada:83:0','durthacht:120:1']]) assert.equal(id(a),id(b));
  assert.equal(family('morna').timeJumps.length, 3);
  assert.equal(family('durthacht').timeJumps.length, 3);
  assert.equal(family('morgacht').timeJumps.length, 0);
  assert.equal(family('techtmar').timeJumps.length, 0);
  assert.equal(family('durthacht').view.focusPersonId, id('durthacht:96:0'));
  for (const f of families) for (const gap of f.timeJumps) assert.ok(f.parentages.filter(p => p.extensions?.timeJumpId === gap.id).every(p => p.type === 'claimed'));
});

test('wards and forced relationships preserve distinct biological and foster roles', () => {
  for (const [slug,child,guardian] of [['morna','190:3','172:0'],['ceallaigh','186:2','168:0'],['ceallaigh','190:2','172:0'],['fintain','174:2','156:0'],['durthacht','216:3','190:0'],['rioga','149:4','135:2']]) {
    const link=family(slug).parentages.find(p=>p.childId===id(`${slug}:${child}`)&&p.type==='foster');
    assert.deepEqual(link.parentIds,[id(`${slug}:${guardian}`)]);
    assert.equal(link.partnershipId,'');
  }
  for (const ref of ['cnogan:145:2','feannag:148:4']) {
    const link=parentage(ref);
    assert.equal(link.legitimacy,'illegitimate');
    assert.equal(family(ref.split(':')[0]).partnerships.find(p=>p.id===link.partnershipId).type,'forced');
  }
  assert.equal(person('cnogan:145:2').id,'zennia-eamhra');
  assert.equal(person('feannag:148:4').id,'zibhhi-seaghdha');
  assert.equal(family('fiachiontach').cadetBranches.find(b=>b.parentPersonId===id('fiachiontach:149:2')).targetFamilyId,'haus-ailella');
  assert.equal(person('cnogan:125:0').sex,'female');
  assert.equal(person('cnogan:130:0').sex,'male');
});

test('shared people agree across all counterpart acts without duplicate world IDs', () => {
  const all=FAMILY_REGISTRY.flatMap(r=>r.family.persons);
  for (const f of families) for (const p of getRegisteredFamily(f.document.id).family.persons) for (const other of all.filter(o=>o.worldPersonId===p.worldPersonId)) {
    for (const field of ['worldPersonId','name','sex','birth','death','status','houseId','portrait','portraitPlaceholder']) assert.equal(other[field],p[field],`${p.id}/${field}`);
  }
});

test('population upgrades preserve local additions and counter patches preserve ancestry and titles', () => {
  for (const registered of families) {
    const stale=structuredClone(registered);
    for (const key of ['persons','partnerships','parentages','cadetBranches','timeJumps']) stale[key]=[];
    stale.extensions.sourceRevision=1;
    stale.extensions.blankFamily=true;
    stale.extensions.localNote='Eigene Recherche';
    stale.view.orientation='horizontal';
    stale.persons.push({id:'local-extra',worldPersonId:'person--local--extra',name:'Eigene Person',houseId:registered.lineage.houseId,notes:'Erhalten'});
    const updated=resolveRegisteredFamilyUpgrade(registered,stale);
    assertValidFamily(updated);
    assert.equal(updated.persons.length,registered.persons.length+1);
    assert.equal(updated.extensions.localNote,'Eigene Recherche');
    assert.equal(updated.view.orientation,'horizontal');
    assert.deepEqual(resolveRegisteredFamilyUpgrade(registered,updated),updated);
  }
  for (const [fid,patch] of Object.entries(patches)) {
    const registered=getRegisteredFamily(fid).family, stale=structuredClone(registered);
    stale.extensions.sourceRevision=patch.revision-1;
    delete stale.extensions.aislearneachSourceCounterInventory;
    stale.view.orientation='horizontal';
    for (const p of stale.persons) p.title='Eigener Titel';
    for (const [key,entities] of Object.entries(patch.collections)) for (const [pid,fields] of Object.entries(entities)) {
      const entity=stale[key].find(p=>p.id===pid);
      for (const field of Object.keys(fields)) entity[field]=field==='status'?'unknown':field==='type'?'marriage':'';
    }
    const previous=normalizeFamily(stale), updated=resolveRegisteredFamilyUpgrade(registered,stale);
    assertValidFamily(updated);
    assert.deepEqual(updated.parentages,previous.parentages,fid);
    assert.equal(updated.view.orientation,'horizontal');
    assert.ok(updated.persons.every(p=>p.title==='Eigener Titel'));
    for (const [key,entities] of Object.entries(patch.collections)) for (const [pid,fields] of Object.entries(entities)) for (const [field,value] of Object.entries(fields)) assert.deepEqual(updated[key].find(p=>p.id===pid)[field],value,`${fid}/${pid}/${field}`);
    assert.deepEqual(resolveRegisteredFamilyUpgrade(registered,updated),updated);
    assert.equal(withAislearneachSourceCounterUpgrade(registered),registered);
  }
});

test('all 431 untouched acts retain their complete pre-import fingerprints', () => {
  const faelaornBaseline = read('scripts/faelaorn-source-import/baseline-fingerprints.json');
  const faelaornPatches = read('assets/data/source-inventories/faelaorn-families-audit-2026-10-08.json').counterpartPatches;
  const portraitBaseline = read('scripts/alben-portrait-reconciliation/baseline-fingerprints.json');
  const fingerprints=read('scripts/aislearneach-source-import/baseline-fingerprints.json');
  const changed=new Set([...Object.keys(patches),...families.map(f=>f.document.id)]);
  let count=0;
  for (const r of FAMILY_REGISTRY.filter(r=>Object.hasOwn(fingerprints,r.id) && !changed.has(r.id))) {
    assert.equal((ALBEN_SOURCE_PORTRAIT_FAMILIES[r.id] ? portraitBaseline[r.id] : faelaornPatches[r.id] ? faelaornBaseline[r.id] : fingerprintBeforeMathgham(r.family)),fingerprints[r.id],r.id);
    count++;
  }
  assert.equal(count,431);
});

test('nineteen bios, eighteen warriors and all supplied images have verified provenance', () => {
  assert.equal(inventory.sources.length,19);
  assert.equal(audit.referenceAssets.length,37);
  assert.equal(audit.portraitAssets.length,407);
  assert.equal(Object.keys(audit.reusedPortraits).length,111);
  for (const asset of [...inventory.sources,...audit.referenceAssets,...audit.portraitAssets]) assert.equal(createHash('sha256').update(fs.readFileSync(new URL('../'+asset.path,import.meta.url))).digest('hex'),asset.sha256,asset.path);
  for (const path of Object.values(catalog.portraits)) assert.ok(fs.existsSync(new URL('../'+path,import.meta.url)),path);
  for (const f of families) {
    assert.ok(f.extensions.houseBiographyModule.description.length>150);
    if (f.document.id!=='sept-techtmar') assert.equal(f.extensions.houseBiographyModule.image,f.extensions.warriorReference);
    for (const p of f.persons) if (p.portraitPlaceholder==='child') assert.equal(p.portrait, ALBEN_SOURCE_PORTRAITS[p.id] || '', p.id);
  }
  assert.equal(family('techtmar').extensions.warriorReference,'');
  assert.equal(family('techtmar').lineage.crestFrame,'iron');
});
