import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { HOUSE_MELOG_FAMILY as family, MELOG_EMBLEM } from '../assets/js/data/house-melog-family.js';
import { FAMILY_REGISTRY } from '../assets/js/data/families.registry.js';
import { assertValidFamily } from '../assets/js/domain/family-schema.js';
import { toFamilyChartData } from '../assets/js/adapters/family-chart-adapter.js';
import { auditFamilyChartLayoutPolicy } from '../assets/js/adapters/family-chart-layout-policy.js';
import { resolveRegisteredFamilyUpgrade } from '../assets/js/services/family-registry-upgrade.js';
import { validateWorkspaceForPublishing } from '../../firebase/functions/src/families/family-validation.js';

const archive = new URL('../assets/data/source-inventories/melog-20261105/', import.meta.url);
const original = JSON.parse(await readFile(new URL('melog-original.json', archive), 'utf8'));
const inventory = JSON.parse(await readFile(new URL('inventory.json', archive), 'utf8'));
const amendment = JSON.parse(await readFile(new URL('source-amendment.json', archive), 'utf8'));
const hash = bytes => createHash('sha256').update(bytes).digest('hex');

test('all supplied Melog documents and 16 portrait originals remain byte-identical', async () => {
  assert.equal(inventory.files.length, 18);
  for (const file of inventory.files) {
    const bytes = await readFile(new URL(file.path, archive));
    assert.equal(bytes.length, file.bytes, file.path);
    assert.equal(hash(bytes), file.sha256, file.path);
    if (file.activePath) assert.equal(hash(await readFile(new URL(`../${file.activePath}`, import.meta.url))), file.sha256);
  }
  assert.equal(hash(await readFile(new URL('melog-original.json', archive))), '0c84307823c97a14fabe10b30d60258077d9558533df0779a9e79496f49d816d');
  assert.equal(hash(await readFile(new URL('melog-original.html', archive))), '85e3faf1a8a23dad33432829c0e6ade3e01798baca81ffa6c685af97ac475775');
});

test('all 18 supplied identities and relationships continue without the unpublished sketch identities', () => {
  assert.deepEqual(assertValidFamily(family).diagnostics, []);
  const { persons, houses, partnerships, parentages, cadetBranches, timeJumps, ...root } = family;
  assert.equal(validateWorkspaceForPublishing({ root: { ...root, familyId: family.document.id }, collections: { persons, houses, partnerships, parentages, cadetBranches, timeJumps } }).valid, true);
  assert.deepEqual(auditFamilyChartLayoutPolicy(family).issues, []);
  assert.equal(family.document.id, original.document.id);
  assert.equal(family.persons.length, 18); assert.equal(family.partnerships.length, 6);
  assert.equal(family.parentages.length, 11); assert.equal(family.timeJumps.length, 1);
  assert.equal(family.extensions.blankFamily, false);
  for (const source of original.persons) {
    const current = family.persons.find(person => person.id === source.id);
    assert.ok(current);
    for (const field of ['id', 'worldPersonId', 'name', 'title', 'sex', 'status', 'death', 'houseId', 'familyRole', 'lineageRole', 'tags', 'portraitPlaceholder']) assert.deepEqual(current[field], source[field], `${source.id}/${field}`);
    const correction = amendment.personAmendments.find(correction => correction.personId === source.id);
    assert.equal(current.birth, correction?.birthAfter || source.birth);
  }
  for (const source of original.partnerships) {
    const current = family.partnerships.find(partnership => partnership.id === source.id);
    const { extensions: currentExtensions, ...currentCore } = current;
    const { extensions: sourceExtensions, ...sourceCore } = source;
    assert.deepEqual(currentCore, sourceCore);
    for (const [key, value] of Object.entries(sourceExtensions)) assert.deepEqual(currentExtensions[key], value);
  }
  for (const key of ['parentages', 'cadetBranches', 'timeJumps', 'lineage', 'presentation', 'view']) assert.deepEqual(family[key], original[key]);
  assert.equal(family.persons.filter(person => person.portrait).length, 16);
  assert.equal(family.persons.filter(person => /melog-meister-(1690|heute)/.test(person.id)).length, 0);
});

test('the actual chart keeps all source people reachable through founder, crest and serial gap', () => {
  const chart = toFamilyChartData(family);
  assert.deepEqual(chart.diagnostics, []);
  assert.equal(new Set(chart.data.map(node => node.id)).size, chart.data.length);
  const nodes = new Map(chart.data.map(node => [node.id, node]));
  const seen = new Set();
  function visit(id) {
    if (seen.has(id)) return;
    seen.add(id);
    const node = nodes.get(id);
    for (const next of [...(node?.rels.spouses || []), ...(node?.rels.children || [])]) visit(next);
  }
  visit(family.view.focusPersonId);
  for (const person of family.persons) assert.ok(seen.has(person.id), person.id);
  assert.equal(family.timeJumps[0].parentPartnershipId, family.lineage.founderPartnershipId);
  assert.deepEqual(family.timeJumps[0].childIds, ['person-29ef1c22']);
});

test('one commoner Melog family is registered at Gwynthor with the transparent emblem and supplied house ID', () => {
  const entries = FAMILY_REGISTRY.filter(record => /melog/i.test(record.id));
  assert.equal(entries.length, 1); assert.equal(entries[0].id, 'melog'); assert.equal(entries[0].type, 'commoner');
  assert.deepEqual(entries[0].folderPath, ['Cenyr', 'Celtigerns Wacht', 'Llamreis Ankunft', 'Gwynthor']);
  assert.equal(entries[0].houseProfile.liegeHouseName, 'Haus Draig');
  assert.equal(family.houses[0].id, 'house-melog');
  assert.equal(family.document.emblem, MELOG_EMBLEM); assert.equal(family.houses[0].emblem, MELOG_EMBLEM);
  assert.match(MELOG_EMBLEM, /melog-emblem\.png$/);
  assert.equal(family.document.motto, ''); assert.equal(family.extensions.generatorProfile.foundingYear, '');
  assert.equal(family.extensions.sourceRevision, 2);
  assert.deepEqual(inventory.canonicalIdentityReview.remoteMatches, []);
  assert.equal(inventory.houses[0].familyId, family.document.id);
});

test('the authorized four-year amendment resolves parent ages and child depictions without modifying originals', () => {
  assert.equal(amendment.userDecision, 'korrigiere das logisch');
  assert.equal(amendment.personAmendments.length, 4);
  assert.equal(inventory.contradictions.length, 0); assert.equal(inventory.originalSourceConflicts.length, 2);
  const byName = name => family.persons.find(person => person.name === name);
  for (const [name, year] of [['Afanen', '1697'], ['Llywarch', '1696'], ['Lleufer', '1716'], ['Cerys', '1731'], ['Iddon', '1732']]) assert.equal(byName(name).birth, year);
  assert.match(byName('Cerys').notes, /als Kind/);
  for (const relation of family.parentages.filter(relation => relation.type === 'biological')) {
    const child = family.persons.find(person => person.id === relation.childId);
    for (const id of relation.parentIds) {
      const parent = family.persons.find(person => person.id === id);
      assert.ok(Number(child.birth) - Number(parent.birth) >= 18, `${parent.name}/${child.name}`);
    }
  }
  for (const correction of amendment.personAmendments) {
    assert.equal(original.persons.find(person => person.id === correction.personId).birth, correction.birthBefore);
    assert.equal(family.persons.find(person => person.id === correction.personId).extensions.sourceAmendment.birthBefore, correction.birthBefore);
  }
});

test('the supplied world identities stay separate from namesakes and Draig/Gwyvern remain existing business contacts', () => {
  const ids = new Set(family.persons.map(person => person.worldPersonId));
  for (const record of FAMILY_REGISTRY.filter(record => record.id !== 'melog')) for (const person of record.family.persons) assert.ok(!ids.has(person.worldPersonId), `${record.id}/${person.id}`);
  for (const id of ['haus-draig', 'haus-gwyvern']) {
    const counterpart = FAMILY_REGISTRY.find(record => record.id === id).family;
    assert.ok(counterpart.partnerships.some(partnership => partnership.participantIds.includes('meurig-draig') && partnership.participantIds.includes('heledd-gwyvern')));
  }
  assert.ok(!family.persons.some(person => /meurig|heledd/.test(person.id)));
});

test('the supplied saved export upgrades only source dates, media and geography while retaining local research and later edits', () => {
  const registered = FAMILY_REGISTRY.find(record => record.id === 'melog').family;
  const local = structuredClone(original);
  local.document.motto = 'Persönliche Randnotiz';
  local.persons.find(person => person.id === 'person-9ffeda8d').notes = 'Eigene Nachforschung';
  local.persons.find(person => person.id === 'person-a5530d07').portrait = 'assets/images/custom-anest.png';
  local.persons.find(person => person.id === 'person-0c68dade').extensions.personalNote = 'Erhalten';
  local.view.focusPersonId = 'person-a5530d07';
  const upgraded = resolveRegisteredFamilyUpgrade(registered, local);
  assert.equal(upgraded.document.motto, local.document.motto);
  assert.equal(upgraded.document.emblem, MELOG_EMBLEM);
  assert.equal(upgraded.houses[0].emblem, MELOG_EMBLEM);
  assert.equal(upgraded.document.houseProfile.seat, 'Gwynthor');
  assert.deepEqual(upgraded.extensions.registry.folderPath, ['Cenyr', 'Celtigerns Wacht', 'Llamreis Ankunft', 'Gwynthor']);
  assert.equal(upgraded.view.focusPersonId, local.view.focusPersonId);
  assert.equal(upgraded.persons.find(person => person.id === 'person-a5530d07').portrait, 'assets/images/custom-anest.png');
  assert.equal(upgraded.persons.find(person => person.id === 'person-9ffeda8d').notes, 'Eigene Nachforschung');
  assert.equal(upgraded.persons.find(person => person.id === 'person-0c68dade').extensions.personalNote, 'Erhalten');
  for (const correction of amendment.personAmendments) assert.equal(upgraded.persons.find(person => person.id === correction.personId).birth, correction.birthAfter);
  for (const key of ['partnerships', 'parentages']) {
    for (const relation of local[key]) {
      const current = upgraded[key].find(current => current.id === relation.id);
      for (const field of key === 'partnerships' ? ['participantIds', 'type', 'status'] : ['childId', 'parentIds', 'type', 'legitimacy']) assert.deepEqual(current[field], relation[field]);
    }
  }
  upgraded.persons.find(person => person.id === 'person-9ffeda8d').birth = '1698';
  const repeated = resolveRegisteredFamilyUpgrade(registered, upgraded);
  assert.equal(repeated.persons.find(person => person.id === 'person-9ffeda8d').birth, '1698');
  assert.deepEqual(assertValidFamily(upgraded).diagnostics, []);
});

test('the prepared local family snapshot contains the final graph, amendment, transparent crest and shared house biography', async () => {
  const published = new URL('../assets/data/published-families/', import.meta.url);
  const snapshot = JSON.parse(await readFile(new URL('melog.json', published), 'utf8'));
  const registry = JSON.parse(await readFile(new URL('registry.json', published), 'utf8'));
  const current = FAMILY_REGISTRY.find(record => record.id === 'melog').family;
  assert.equal(snapshot.familyId, 'melog');
  assert.equal(snapshot.revision, 1);
  assert.equal(snapshot.family.extensions.sourceRevision, 2);
  assert.equal(snapshot.family.document.emblem, MELOG_EMBLEM);
  assert.equal(snapshot.family.houses[0].emblem, MELOG_EMBLEM);
  assert.deepEqual(snapshot.family.persons.map(person => [person.id, person.worldPersonId, person.birth]), current.persons.map(person => [person.id, person.worldPersonId, person.birth]));
  assert.deepEqual(snapshot.family.extensions.houseBiographyModule, current.extensions.houseBiographyModule);
  assert.ok(snapshot.family.extensions.houseBiographyModule);
  assert.equal(registry.families.filter(record => record.id === 'melog').length, 1);
  assert.equal(registry.families.find(record => record.id === 'melog').personCount, 18);
  assert.equal(registry.families.filter(record => record.id === 'haus-melog').length, 0);
});
