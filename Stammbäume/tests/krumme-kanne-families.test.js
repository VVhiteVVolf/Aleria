import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import vm from 'node:vm';
import { FAMILY_REGISTRY } from '../assets/js/data/families.registry.js';
import { assertValidFamily } from '../assets/js/domain/family-schema.js';
import { assertMirroredCrossFamilyBatch } from '../assets/js/modules/family-sync/cross-family-sync-invariant.js';
import { auditFamilyChartLayoutPolicy } from '../assets/js/adapters/family-chart-layout-policy.js';
import { kanneFamilyPerson } from '../assets/js/data/krumme-kanne-family-people.js';
const slugs = ['trevoryn', 'svathamar', 'dubhdarach'];
const records = slugs.map(slug => FAMILY_REGISTRY.find(r => r.id === `haus-${slug}`));
const tonnarth = FAMILY_REGISTRY.find(r => r.id === 'haus-tonnarth');

test('three commoner families begin with unknown founders and a single serial time jump', async () => {
  for (const record of records) {
    const f = assertValidFamily(record.family).family;
    assert.equal(record.type, 'commoner');
    assert.ok(record.folderPath.includes('Gwynthor'));
    assert.equal(f.lineage.crestFrame, 'iron');
    const founders = f.partnerships.find(p => p.id === f.lineage.founderPartnershipId);
    assert.deepEqual(founders.participantIds.map(id => f.persons.find(p => p.id === id).name), ['Unbekannter Gründer', 'Unbekannte Gründerin']);
    assert.equal(f.timeJumps.length, 1);
    assert.equal(f.timeJumps[0].parentPartnershipId, founders.id);
    const rootLinks = f.parentages.filter(p => p.partnershipId === founders.id);
    assert.deepEqual(rootLinks.map(p => p.childId), f.timeJumps[0].childIds);
    assert.ok(rootLinks.every(p => p.type === 'claimed' && p.extensions.timeJumpId === f.timeJumps[0].id));
    assert.deepEqual(auditFamilyChartLayoutPolicy(f).issues, []);
    await access(new URL(`../${f.document.emblem}`, import.meta.url));
    assert.ok(f.extensions.houseBiographyModule, 'registry supplies a house biography');
  }
});

test('shared spouses, children and the Tonnarth connection retain one world identity', () => {
  assertMirroredCrossFamilyBatch([...records, tonnarth]);
  for (const key of ['hrolf', 'eirian', 'styr', 'heledd', 'aedan', 'mair', 'neifion', 'eirlys', 'caradog']) {
    const person = kanneFamilyPerson(key);
    const appearances = [...records, tonnarth].flatMap(r => r.family.persons.filter(p => p.id === person.id));
    assert.ok(appearances.length >= 2, key);
    assert.equal(new Set(appearances.map(p => p.worldPersonId)).size, 1, key);
    assert.equal(new Set(appearances.map(p => p.birth)).size, 1, key);
  }
  const dubh = records[2].family;
  const caradog = dubh.parentages.find(p => p.childId === kanneFamilyPerson('caradog').id);
  assert.deepEqual(caradog.parentIds, ['gareth-tonnarth', 'mair-affair-tonnarth']);
  assert.equal(dubh.parentages.filter(p => p.parentIds.includes(kanneFamilyPerson('aedan').id)).length, 2);
});

test('public snapshots mirror all four families and preserve the former Tonnarth identities', async () => {
  const envelopes = await Promise.all([...records, tonnarth].map(r => readFile(new URL(`../assets/data/published-families/${r.id}.json`, import.meta.url), 'utf8').then(JSON.parse)));
  assertMirroredCrossFamilyBatch(envelopes.map(e => ({ family: e.family })));
  const publicTonnarth = envelopes.at(-1);
  assert.ok(publicTonnarth.revision >= 6);
  const previous = JSON.parse(await readFile(new URL('../assets/data/published-families/backups/haus-tonnarth/r00000005-20260809T050955365Z.json', import.meta.url), 'utf8'));
  for (const old of previous.family.persons) {
    const p = publicTonnarth.family.persons.find(p => p.id === old.id);
    for (const field of ['id', 'worldPersonId', 'birth', 'death', 'houseId']) assert.equal(p[field], old[field], `${old.id}.${field}`);
  }
});

test('Gwynthor and the county list each house once, with the correct local crests and commoner rank', async () => {
  for (const [file, variable, groups] of [
    ['Orte/Koenigreich_Cenyr/Grafschaft_Celtigerns_Wacht/Baronie_Llamreis_Ankunft/Gwynthors_Bannkreis/Gwynthor/ort.data.js', 'ORT_DATA', 'houses'],
    ['Kontinente/Estryll/Königreich Cenyr/Grafschaft Celtigerns Wacht/grafschaft.data.js', 'KONTINENTE_DATA', 'familySections']
  ]) {
    const context = vm.createContext({ window: {}, encodeURI, encodeURIComponent });
    vm.runInContext(await readFile(new URL(`../../${file}`, import.meta.url), 'utf8'), context);
    const data = context.window[variable];
    const entries = (data[groups] || data.view?.[groups]).flatMap(g => g.items || g.cards);
    for (const slug of slugs) {
      const found = entries.filter(e => (e.id || e.familyId) === `haus-${slug}`);
      assert.equal(found.length, 1, `${file}/${slug}`);
      assert.equal(found[0].rank, 'Bürgerliches Haus');
    }
  }
});
