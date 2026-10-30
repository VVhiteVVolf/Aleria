import test from 'node:test';
import assert from 'node:assert/strict';
import { access } from 'node:fs/promises';
import { FAMILY_REGISTRY } from '../assets/js/data/families.registry.js';
import { assertValidFamily } from '../assets/js/domain/family-schema.js';
import { auditFamilyChartLayoutPolicy } from '../assets/js/adapters/family-chart-layout-policy.js';
import { toFamilyChartData } from '../assets/js/adapters/family-chart-adapter.js';
import { resolveRegisteredFamilyUpgrade } from '../assets/js/services/family-registry-upgrade.js';
import { TWYLLOD_CHILDREN, TWYLLOD_CHILD_PARENTAGES } from '../assets/js/data/gwynthor-erbstreit/case-people.js';
import { GWYNTHOR_ERBSTREIT_FAMILIES } from '../assets/js/data/gwynthor-erbstreit/family-records.js';
import { buildFortunaMarketHierarchy } from '../../AleriaAlmanach/modules/markt-der-fortuna-gwynthor/fortuna-market-hierarchy.mjs';
import { FORTUNA_COUNCIL } from '../../AleriaAlmanach/modules/markt-der-fortuna-gwynthor/fortuna-factions.mjs';

const record = id => FAMILY_REGISTRY.find(r => r.id === id);
const person = (family, id) => family.persons.find(p => p.id === id);
const ids = ['haus-cochdon', 'haus-twyllod', 'haus-llafnfor', 'haus-falto', 'haus-swyll', 'haus-falchdyn'];

test('new court families retain the serial founder, crest and time-jump structure', () => {
  for (const family of GWYNTHOR_ERBSTREIT_FAMILIES) {
    assert.equal(FAMILY_REGISTRY.filter(r => r.id === family.document.id).length, 1);
    assert.deepEqual(assertValidFamily(family).diagnostics, []);
    assert.deepEqual(auditFamilyChartLayoutPolicy(family).issues, []);
    assert.equal(family.timeJumps.length, 1);
    const gap = family.timeJumps[0];
    assert.equal(gap.parentPartnershipId, family.lineage.founderPartnershipId);
    for (const childId of gap.childIds) {
      const link = family.parentages.find(p => p.childId === childId);
      assert.equal(link.type, 'claimed');
      assert.equal(link.extensions.timeJumpId, gap.id);
    }
  }
});

test('Lleucu is Emyr and Tegwen’s tenth child, with one shared identity across both marriages', () => {
  const swyll = record('haus-swyll').family;
  assert.equal(swyll.parentages.filter(p => p.partnershipId === 'marriage-emyr-tegwen-swyll').length, 10);
  assert.deepEqual(swyll.parentages.find(p => p.childId === 'lleucu-swyll').parentIds, ['emyr-swyll', 'tegwen-spouse-swyll']);
  assert.equal(person(swyll, 'lleucu-swyll').birth, person(swyll, 'rhodri-swyll').birth);
  const lleucuId = person(swyll, 'lleucu-swyll').worldPersonId;
  for (const id of ['haus-cochdon', 'haus-twyllod']) assert.equal(person(record(id).family, 'lleucu-swyll').worldPersonId, lleucuId);
  for (const id of ['haus-cochdon', 'haus-swyll']) {
    const f = record(id).family;
    assert.equal(person(f, 'gwrgan-cochdon').status, 'alive');
    assert.ok(!f.parentages.some(p => p.parentIds.includes('gwrgan-cochdon')));
    const first = f.partnerships.find(p => p.id === 'marriage-gwrgan-cochdon-lleucu-swyll');
    assert.equal(first.extensions.endedByPresumedDeath, true);
    assert.equal(first.extensions.returneeLegalStatus, 'pending');
  }
  assert.ok(!swyll.persons.some(p => TWYLLOD_CHILDREN.some(child => child.id === p.id)));
  assert.equal(swyll.cadetBranches.filter(b => ['haus-cochdon', 'haus-twyllod'].includes(b.targetFamilyId)).length, 2);
  for (const id of ['haus-twyllod']) {
    const children = record(id).family.parentages.filter(p => p.partnershipId === 'marriage-eifion-twyllod-lleucu-swyll');
    assert.equal(children.length, 3);
    for (const child of children) {
      assert.deepEqual(child.parentIds, ['eifion-twyllod', 'lleucu-swyll']);
      assert.equal(child.legitimacy, 'legitimate');
    }
  }
});

test('the original four brothers and their parents have consistent wartime and inheritance dates', () => {
  const f = record('haus-cochdon').family;
  const sons = f.parentages.filter(p => p.partnershipId === 'marriage-gorwystl-gwenfrewi-cochdon');
  assert.equal(sons.length, 4);
  assert.equal(sons.filter(p => person(f, p.childId).status === 'alive').length, 1);
  for (const p of sons.filter(p => p.childId !== 'gwrgan-cochdon')) assert.equal(person(f, p.childId).death, '1720');
  assert.equal(person(f, 'gorwystl-cochdon').death, '1728');
  assert.match(person(f, 'gorwystl-cochdon').notes, /Vermachte Lleucu/);
});

test('Twyllod preserves Glendower’s biological parentage without rewriting the source character', () => {
  const f = record('haus-twyllod').family;
  const link = f.parentages.find(p => p.childId === 'glendower-o-cenyr');
  assert.deepEqual(link.parentIds, ['eithne-glendower-mother', 'unknown-biological-father-glendower']);
  assert.ok(!link.parentIds.includes('arian-twyllod'));
  const origin = f.partnerships.find(p => p.id === link.partnershipId);
  assert.equal(origin.type, 'forced');
  assert.equal(origin.status, 'ended');
  assert.equal(person(f, 'glendower-o-cenyr').extensions.existingCharacterId, 'glendower-o-cenyr');
  const converted = toFamilyChartData(f), chart = converted.data;
  assert.deepEqual(chart.find(p => p.id === 'glendower-o-cenyr').rels.parents, ['arian-twyllod', 'eithne-glendower-mother']);
  assert.equal(f.parentages.find(p => p.extensions.socialFatherOnly).type, 'step');
  for (const id of ['arian-twyllod', 'eifion-twyllod']) {
    assert.deepEqual(f.parentages.find(p => p.childId === id).parentIds, ['cynwrig-twyllod', 'morfudd-spouse-twyllod']);
  }
});

test('the Swyll upgrade removes only the forwarded children and keeps both marriages compact', () => {
  const current = record('haus-swyll').family;
  const old = structuredClone(current);
  old.extensions.sourceRevision = 12;
  old.extensions.registryManagedEntitySourceRevision = 12;
  old.extensions.registryTombstones.persons = old.extensions.registryTombstones.persons.filter(id => !TWYLLOD_CHILDREN.some(p => p.id === id));
  old.extensions.registryTombstones.parentages = old.extensions.registryTombstones.parentages.filter(id => !TWYLLOD_CHILD_PARENTAGES.some(p => p.id === id));
  old.persons.push(...TWYLLOD_CHILDREN);
  old.parentages.push(...TWYLLOD_CHILD_PARENTAGES);
  delete person(old, 'lleucu-swyll').extensions.chartCenterBetweenSpousePersonIds;
  const upgraded = resolveRegisteredFamilyUpgrade(current, old);
  assert.ok(!upgraded.persons.some(p => TWYLLOD_CHILDREN.some(child => child.id === p.id)));
  assert.deepEqual(person(upgraded, 'lleucu-swyll').extensions.chartCenterBetweenSpousePersonIds, ['gwrgan-cochdon', 'eifion-twyllod']);
  assert.equal(upgraded.partnerships.filter(p => p.participantIds.includes('lleucu-swyll')).length, 2);
});

test('the live fishery has a continuing branch and its own family biography', () => {
  const f = record('haus-twyllod').family;
  assert.equal(f.document.houseProfile.seat, 'Twyllod-Hof');
  assert.ok(person(f, 'meirion-twyllod'));
  assert.ok(person(f, 'bledri-twyllod'));
  assert.deepEqual(f.parentages.find(p => p.childId === 'meirion-twyllod').parentIds, ['cynwrig-twyllod', 'morfudd-spouse-twyllod']);
  const bio = f.extensions.houseBiographyModule;
  assert.match(bio.house.historyText, /soziale Vaterstellung/);
  assert.match(bio.house.historyText, /versti/);
  assert.match(bio.description, /Fischkogge/);
});

test('the Dyfrgi retainer has no invented estate and the Falto lawyer receives no council seat', () => {
  const profile = record('haus-llafnfor').houseProfile;
  assert.equal(profile.rankId, 'knight');
  assert.equal(profile.liegeHouseId, 'haus-dyfrgi-caer-cryftlawd');
  assert.equal(profile.seat, '');
  assert.deepEqual(record('haus-llafnfor').folderPath, ['Cenyr', 'Klaueninsel', 'Talklaue', 'Caer Cryftlawd']);
  assert.equal(record('haus-llafnfor').family.persons.length, 3);
  assert.deepEqual(record('haus-falto').folderPath, ['Venalys']);
  assert.deepEqual(record('haus-falto').additionalPlacements[0].folderPath, ['Cenyr', 'Celtigerns Wacht', 'Llamreis Ankunft', 'Gwynthor']);
  assert.equal(FORTUNA_COUNCIL.length, 9);
  assert.ok(!FORTUNA_COUNCIL.some(n => n.title.includes('Valeriano')));
  const posts = buildFortunaMarketHierarchy().trees.flatMap(t => t.levels.flatMap(l => l.nodes));
  assert.equal(posts.filter(n => n.id === 'fortuna-gildenfuersprecher').length, 1);
  assert.match(posts.find(n => n.id === 'fortuna-gildenfuersprecher').title, /Valeriano Falto/);
  const gethin = person(record('haus-falchdyn').family, 'gethin-falchdyn');
  assert.equal(gethin.birth, '1714');
  assert.match(gethin.title, /Fürsprecher/);
  assert.deepEqual(record('haus-falchdyn').family.parentages.find(p => p.childId === gethin.id).parentIds, ['emrys-falchdyn', 'lowri-spouse-falchdyn']);
});

test('all six affected family records and their active images resolve locally', async () => {
  for (const id of ids) {
    const f = record(id).family;
    assert.deepEqual(assertValidFamily(f).diagnostics, []);
    assert.deepEqual(auditFamilyChartLayoutPolicy(f).issues, []);
    for (const path of [f.document.emblem, ...f.persons.map(p => p.portrait)].filter(Boolean)) {
      if (/^https?:/.test(path)) continue; // Preserve existing external Swyll originals.
      await access(new URL(path, new URL('../', import.meta.url)));
    }
  }
});
