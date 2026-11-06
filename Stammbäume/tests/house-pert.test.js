import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { HOUSE_PERT_FAMILY as family, PERT_EMBLEM } from '../assets/js/data/house-pert-family.js';
import { FAMILY_REGISTRY } from '../assets/js/data/families.registry.js';
import { assertValidFamily } from '../assets/js/domain/family-schema.js';
import { auditFamilyChartLayoutPolicy } from '../assets/js/adapters/family-chart-layout-policy.js';
import { toFamilyChartData } from '../assets/js/adapters/family-chart-adapter.js';
import { resolveRegisteredFamilyUpgrade } from '../assets/js/services/family-registry-upgrade.js';
import { validateWorkspaceForPublishing } from '../../firebase/functions/src/families/family-validation.js';
import { __testables as publisher } from '../../netlify/functions/family-publisher.mjs';

const archive = new URL('../assets/data/source-inventories/pert-20261106/', import.meta.url);
const original = JSON.parse(await readFile(new URL('pert-original.json', archive), 'utf8'));
const inventory = JSON.parse(await readFile(new URL('inventory.json', archive), 'utf8'));
const digest = bytes => createHash('sha256').update(bytes).digest('hex');

test('Pert preserves both original documents and every supplied portrait byte', async () => {
  assert.equal(inventory.files.length, 19);
  assert.equal(inventory.counts.portraits, 17);
  assert.equal(inventory.counts.uniquePortraitUrls, 16);
  for (const file of inventory.files) {
    const bytes = await readFile(new URL(file.path, archive));
    assert.equal(bytes.length, file.bytes);
    assert.equal(digest(bytes), file.sha256);
    if (file.activePath) assert.equal(digest(await readFile(new URL(`../${file.activePath}`, import.meta.url))), file.sha256);
  }
  assert.equal(digest(await readFile(new URL('pert-original.json', archive))), 'e8d201d8d7bbbb91d697ba47ddfef85c7babc7b42f5ed9612d2c121c833cba16');
  assert.equal(inventory.canonicalIdentityReview.beforeCreation, true);
  assert.deepEqual(inventory.canonicalIdentityReview.allRemoteBranches, ['master']);
  assert.equal(inventory.canonicalIdentityReview.branchPaginationComplete, true);
  assert.deepEqual(inventory.canonicalIdentityReview.registryMatches, []);
  assert.equal(inventory.canonicalIdentityReview.directMasterPaths404.length, 2);
});

test('the entire supplied Pert graph retains names, world IDs, dates, statuses and relationship types', () => {
  assert.deepEqual(assertValidFamily(family).diagnostics, []);
  assert.deepEqual(auditFamilyChartLayoutPolicy(family).issues, []);
  assert.equal(family.persons.length, 19); assert.equal(family.partnerships.length, 6);
  assert.equal(family.parentages.length, 12); assert.equal(family.timeJumps.length, 1);
  assert.equal(family.partnerships.filter(relation => relation.type === 'marriage').length, 5);
  assert.equal(family.partnerships.filter(relation => relation.type === 'affair').length, 1);
  for (const source of original.persons) {
    const current = family.persons.find(person => person.id === source.id);
    assert.ok(current);
    for (const field of ['id', 'worldPersonId', 'name', 'title', 'status', 'birth', 'death', 'houseId', 'familyRole', 'lineageRole', 'tags']) assert.deepEqual(current[field], source[field], `${source.id}/${field}`);
    if (source.id !== 'person-3a869794') assert.equal(current.sex, source.sex);
  }
  for (const source of original.partnerships) {
    const current = family.partnerships.find(relation => relation.id === source.id);
    const { extensions: ignoredCurrent, ...currentCore } = current;
    const { extensions: ignoredOriginal, ...sourceCore } = source;
    assert.deepEqual(currentCore, sourceCore);
    for (const [key, value] of Object.entries(source.extensions)) assert.deepEqual(current.extensions[key], value);
  }
  for (const key of ['parentages', 'timeJumps', 'lineage', 'view', 'presentation', 'cadetBranches']) assert.deepEqual(family[key], original[key], key);
});

test('the two distinct men sharing a portrait never merge and Roísin receives no invented father', async () => {
  const geraint = family.persons.find(person => person.id === 'person-4506547d');
  const donnchadh = family.persons.find(person => person.id === 'person-35fdbd7b');
  assert.notEqual(geraint.worldPersonId, donnchadh.worldPersonId);
  assert.notEqual(geraint.portrait, donnchadh.portrait);
  assert.equal(digest(await readFile(new URL(`../${geraint.portrait}`, import.meta.url))), digest(await readFile(new URL(`../${donnchadh.portrait}`, import.meta.url))));
  const roisin = family.parentages.find(relation => relation.childId === 'person-618119d8');
  assert.deepEqual(roisin.parentIds, ['person-4ee10c57']);
  assert.equal(roisin.partnershipId, ''); assert.equal(roisin.legitimacy, 'legitimized');
  assert.deepEqual(family.partnerships.find(relation => relation.type === 'affair').participantIds, ['person-4ee10c57', 'person-35fdbd7b']);
  assert.equal(family.parentages.filter(relation => relation.type === 'adoptive' || relation.type === 'foster').length, 0);
});

test('Rhiain uses the explicit female text evidence, Canna stays unknown and the genealogical name stays Goronvy', () => {
  const rhiain = family.persons.find(person => person.name === 'Rhiain');
  assert.equal(original.persons.find(person => person.id === rhiain.id).sex, 'unknown');
  assert.equal(rhiain.sex, 'female');
  assert.match(rhiain.notes, /ihrer Großmutter Gwerfyl/);
  assert.equal(family.persons.find(person => person.name === 'Canna').sex, 'unknown');
  const goronvy = family.persons.find(person => person.id === 'person-1f86b441');
  assert.equal(goronvy.name, 'Goronvy');
  assert.deepEqual(goronvy.extensions.sourceNameVariants, ['Goronwy']);
  assert.equal(family.persons.filter(person => person.name === 'Goronwy').length, 0);
});

test('all actual chart persons are reachable after one serial source gap and all biological dates remain plausible', () => {
  const chart = toFamilyChartData(family);
  assert.deepEqual(chart.diagnostics.filter(diagnostic => diagnostic.severity !== 'info'), []);
  assert.deepEqual(chart.diagnostics.filter(diagnostic => diagnostic.code === 'LAYOUT_GENDER_FALLBACK').map(diagnostic => diagnostic.details.personId), ['person-cf926021']);
  assert.equal(new Set(chart.data.map(node => node.id)).size, chart.data.length);
  const nodes = new Map(chart.data.map(node => [node.id, node]));
  const seen = new Set();
  function visit(id) { if (seen.has(id)) return; seen.add(id); const node = nodes.get(id); for (const child of [...(node?.rels.children || []), ...(node?.rels.spouses || [])]) visit(child); }
  visit(family.view.focusPersonId);
  for (const person of family.persons) assert.ok(seen.has(person.id), person.id);
  assert.equal(family.timeJumps[0].parentPartnershipId, family.lineage.founderPartnershipId);
  assert.deepEqual(family.timeJumps[0].childIds, ['person-cde44b00', 'person-02756f76']);
  for (const relation of family.parentages.filter(relation => relation.type === 'biological')) {
    const child = family.persons.find(person => person.id === relation.childId);
    for (const id of relation.parentIds) {
      const parent = family.persons.find(person => person.id === id);
      assert.ok(Number(child.birth) - Number(parent.birth) >= 18, `${parent.name}/${child.name}`);
      if (parent.death) assert.ok(Number(child.birth) <= Number(parent.death), `${parent.name}/${child.name}`);
    }
  }
});

test('one Pert entry uses its actual Gwynthor placement, Maesglas second seat and transparent crest', () => {
  const records = FAMILY_REGISTRY.filter(record => record.id === 'pert' || record.id === 'haus-pert');
  assert.equal(records.length, 1); assert.equal(records[0].id, 'pert');
  assert.equal(records[0].type, 'commoner');
  assert.deepEqual(records[0].folderPath, ['Cenyr', 'Celtigerns Wacht', 'Llamreis Ankunft', 'Gwynthor']);
  assert.equal(records[0].houseProfile.liegeHouseId, 'house-draig');
  assert.deepEqual(records[0].houseProfile.secondarySeats, ['Hof Maesglas']);
  assert.equal(family.document.emblem, PERT_EMBLEM); assert.equal(family.houses[0].emblem, PERT_EMBLEM);
  assert.match(PERT_EMBLEM, /pert-emblem\.png$/);
  const worldIds = new Set(family.persons.map(person => person.worldPersonId));
  for (const record of FAMILY_REGISTRY.filter(record => record.id !== 'pert')) for (const person of record.family.persons) assert.ok(!worldIds.has(person.worldPersonId));
});

test('the supplied saved export receives local media and proven Rhiain evidence while personal edits survive', () => {
  const local = structuredClone(original);
  local.document.motto = 'Eigene Randnotiz';
  local.persons.find(person => person.id === 'person-4506547d').notes = 'Eigene Nachforschung';
  local.persons.find(person => person.id === 'person-35fdbd7b').portrait = 'assets/images/custom-donnchadh.png';
  local.view.focusPersonId = 'person-4506547d';
  const upgraded = resolveRegisteredFamilyUpgrade(FAMILY_REGISTRY.find(record => record.id === 'pert').family, local);
  assert.equal(upgraded.document.emblem, PERT_EMBLEM); assert.equal(upgraded.houses[0].emblem, PERT_EMBLEM);
  assert.equal(upgraded.document.motto, local.document.motto);
  assert.equal(upgraded.document.houseProfile.seat, 'Gwynthor');
  assert.equal(upgraded.persons.find(person => person.id === 'person-3a869794').sex, 'female');
  assert.equal(upgraded.persons.find(person => person.id === 'person-35fdbd7b').portrait, 'assets/images/custom-donnchadh.png');
  assert.equal(upgraded.persons.find(person => person.id === 'person-4506547d').notes, 'Eigene Nachforschung');
  assert.equal(upgraded.view.focusPersonId, local.view.focusPersonId);
  assert.deepEqual(upgraded.parentages, original.parentages);
  assert.deepEqual(resolveRegisteredFamilyUpgrade(family, upgraded), upgraded);
});

test('the actual Firebase and GitHub publisher validators accept the complete Pert source without writes', () => {
  const { persons, houses, partnerships, parentages, cadetBranches, timeJumps, ...root } = family;
  assert.equal(validateWorkspaceForPublishing({ root: { ...root, familyId: 'pert' }, collections: { persons, houses, partnerships, parentages, cadetBranches, timeJumps } }).valid, true);
  const parsed = publisher.parseRecords(JSON.stringify({ records: [{ family, expectedRevision: 0 }], skipDeploy: true }));
  assert.equal(parsed.length, 1); assert.equal(parsed[0].family.document.id, 'pert');
  assert.equal(inventory.publication.moduleCreated, false);
  assert.equal(inventory.counterpartConflicts[0].recordId, 'character--jTzoT0bqb2lfmslJ05FJ');
});

test('the local versioned Pert snapshot includes the final source graph and shared house biography exactly once', async () => {
  const published = new URL('../assets/data/published-families/', import.meta.url);
  const snapshot = JSON.parse(await readFile(new URL('pert.json', published), 'utf8'));
  const registry = JSON.parse(await readFile(new URL('registry.json', published), 'utf8'));
  const registered = FAMILY_REGISTRY.find(record => record.id === 'pert').family;
  assert.equal(snapshot.familyId, 'pert'); assert.equal(snapshot.revision, 1);
  assert.deepEqual(snapshot.family.persons.map(person => [person.id, person.worldPersonId, person.sex, person.birth, person.death]), registered.persons.map(person => [person.id, person.worldPersonId, person.sex, person.birth, person.death]));
  assert.deepEqual(snapshot.family.parentages, original.parentages);
  assert.deepEqual(snapshot.family.extensions.houseBiographyModule, registered.extensions.houseBiographyModule);
  assert.ok(snapshot.family.extensions.houseBiographyModule);
  assert.equal(snapshot.family.document.emblem, PERT_EMBLEM);
  assert.equal(registry.families.filter(record => record.id === 'pert').length, 1);
  assert.equal(registry.families.filter(record => record.id === 'haus-pert').length, 0);
});
