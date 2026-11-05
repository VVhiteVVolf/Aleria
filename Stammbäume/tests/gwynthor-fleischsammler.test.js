import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { normalizeHouseBiographyModule } from '../assets/js/modules/house-biography/house-biography-model.js';
import { FAMILY_REGISTRY } from '../assets/js/data/families.registry.js';
import { assertValidFamily } from '../assets/js/domain/family-schema.js';
import { auditFamilyChartLayoutPolicy } from '../assets/js/adapters/family-chart-layout-policy.js';
import { GWYNTHOR_FLEISCHSAMMLER_FAMILIES as families } from '../assets/js/data/gwynthor-fleischsammler/family-records.js';
import { FLEISCHSAMMLER_LOCALITIES as places, FLEISCHSAMMLER_FAMILIES_INDEX as index } from '../assets/js/data/gwynthor-fleischsammler/localities.mjs';

const family = id => families.find(f => f.document.id === `haus-${id}`);
const person = (slug, id) => family(slug).persons.find(p => p.id === id);

test('eight rural families have valid contemporary household graphs and one Gwynthor placement', () => {
  assert.equal(families.length, 8);
  for (const f of families) {
    assert.deepEqual(assertValidFamily(f).diagnostics, []);
    assert.deepEqual(auditFamilyChartLayoutPolicy(f).issues, []);
    assert.equal(FAMILY_REGISTRY.filter(r => r.id === f.document.id).length, 1);
    const entry = FAMILY_REGISTRY.find(r => r.id === f.document.id);
    assert.deepEqual(entry.folderPath, ['Cenyr', 'Celtigerns Wacht', 'Llamreis Ankunft', 'Gwynthor']);
    assert.equal(entry.type, 'commoner');
    assert.equal(f.lineage.crestFrame, 'iron');
    assert.equal(f.timeJumps.length, 0);
    assert.ok(f.persons.every(p => p.name !== '???'));
    assert.equal(f.extensions.courtDecisionPending, undefined);
    assert.equal(f.extensions.houseBiographyModule.schema, 'aleria.house-module');
    const biography = normalizeHouseBiographyModule(f.extensions.houseBiographyModule);
    assert.ok(biography.image.endsWith(`haus-${f.document.id.slice(5)}.png`));
    assert.ok(biography.house.documents.every(document => document.icon));
  }
});

test('selected round crests retain generator originals and the verified opaque production files', () => {
  const root = new URL('../../', import.meta.url);
  const audit = JSON.parse(readFileSync(new URL('diagnostics/fleischsammler-quest-20261102/wappen-verification.json', root), 'utf8'));
  const hash = file => createHash('sha256').update(readFileSync(new URL(file, root))).digest('hex');
  assert.equal(audit.length, 8);
  for (const row of audit) {
    assert.equal(hash(row.source), row.sourceSha256);
    assert.equal(hash(row.target), row.sha256);
    assert.deepEqual(row.alphaValues, [0, 255]);
    assert.equal(row.rgbUnchanged, true);
    assert.equal(row.size[0], row.size[1]);
    const coverage = row.circle.radius * 2 / row.size[0];
    assert.ok(coverage >= .85 && coverage <= .90);
  }
});

test('neutral source cards identify seven real places and eight resident families without revealing losses', () => {
  assert.equal(places.length, 7);
  assert.equal(index.length, 8);
  assert.equal(new Set(index.map(f => f.surname)).size, 8);
  const visibleText = [...places, ...index].map(entry => `${entry.placeName} ${entry.description}`).join('\n');
  assert.doesNotMatch(visibleText, /Opfer|ermord|Fleischsammler|Trauer|Toten|vermisst|Leich|Erdrossel|Ritual/iu);
  const brewery = places.find(p => p.id === 'brauerhof-bragwen-eiddfer');
  assert.deepEqual(brewery.familyIds, ['haus-bragwen', 'haus-eiddfer']);
  for (const entry of index) {
    assert.equal(family(entry.slug).document.houseProfile.seat, entry.placeName);
    assert.ok(places.some(p => p.pinId === entry.pinId && p.familyIds.includes(entry.familyId)));
  }
});

test('the three local victims remain distinct female people of the requested ages', () => {
  const victims = families.flatMap(f => f.persons.filter(p => p.status === 'dead'));
  assert.deepEqual(victims.map(p => p.id).sort(), ['catrin-bragwen', 'gwenith-spouse-brynial', 'lleian-dolweth']);
  assert.ok(victims.every(p => p.sex === 'female' && p.death === '1740'));
  assert.equal(1740 - Number(person('dolweth', 'lleian-dolweth').birth), 18);
  assert.equal(1740 - Number(person('brynial', 'gwenith-spouse-brynial').birth), 32);
  assert.equal(1740 - Number(person('bragwen', 'catrin-bragwen').birth), 20);
  assert.match(person('dolweth', 'lleian-dolweth').notes, /vor wenigen Tagen/);
  assert.match(person('bragwen', 'catrin-bragwen').notes, /nicht nach Hause/);
});

test('the brewery marriage shares identities while descendants continue in one family only', () => {
  for (const id of ['iestyn-bragwen', 'rhiain-eiddfer']) {
    assert.equal(person('bragwen', id).worldPersonId, person('eiddfer', id).worldPersonId);
  }
  const bragwen = family('bragwen'), eiddfer = family('eiddfer');
  assert.deepEqual(bragwen.partnerships.find(p => p.id === 'marriage-iestyn-bragwen-rhiain-eiddfer'),
    eiddfer.partnerships.find(p => p.id === 'marriage-iestyn-bragwen-rhiain-eiddfer'));
  assert.ok(bragwen.parentages.some(p => p.childId === 'nerys-bragwen'));
  assert.ok(!eiddfer.persons.some(p => p.id === 'nerys-bragwen'));
  assert.equal(eiddfer.cadetBranches[0].targetFamilyId, 'haus-bragwen');
});

test('Wyrm service stays separate from the actual Marchwern residence', () => {
  const marchwern = family('marchwern');
  assert.equal(marchwern.document.houseProfile.seat, 'Marchwern-Gestüt');
  assert.deepEqual(marchwern.document.houseProfile.folderPath, ['Cenyr', 'Celtigerns Wacht', 'Llamreis Ankunft', 'Gwynthor']);
  assert.match(marchwern.extensions.houseBiographyModule.house.biographyText, /Hauses Wyrm/);
  assert.match(marchwern.extensions.houseBiographyModule.house.biographyText, /Ceffyl/);
  assert.match(marchwern.extensions.houseBiographyModule.house.biographyText, /Rhyfel/);
});
