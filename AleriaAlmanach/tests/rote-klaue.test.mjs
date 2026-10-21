import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import vm from 'node:vm';
import { buildRoteKlaue, KLAUE_SECTION } from '../modules/rote-klaue/klaue-module.mjs';
import { KLAUE_FAMILY, KLAUE_LIVING, KLAUE_STAFF, KLAUE_DOGS } from '../modules/rote-klaue/klaue-people.mjs';
import { POST_SECTION } from '../modules/klingende-muenze-gwynthor/post-section.mjs';
import { OPERATING_MEMBERS, operatingMemberNodes } from '../modules/klingende-muenze-gwynthor/post-members.mjs';
import { HOUSE_VALERUS_FAMILY as family } from '../../Stammbäume/assets/js/data/house-valerus-family.js';
import { assertValidFamily } from '../../Stammbäume/assets/js/domain/family-schema.js';
import { auditFamilyChartLayoutPolicy } from '../../Stammbäume/assets/js/adapters/family-chart-layout-policy.js';
import { evaluateVenueScope } from '../modules/economy-calculator/economy-venue-scope.mjs';
import { planKlaueCharacters } from '../modules/rote-klaue/klaue-characters.mjs';
const entry = buildRoteKlaue();
const root = new URL('../../', import.meta.url);
test('one pawnshop registers in the existing guild category and preserves other entries', async () => {
  assert.equal(KLAUE_SECTION, POST_SECTION);
  const other = { id: 'existing-guild-shop', pages: [{ commentThreadKey: 'preserved' }] };
  const context = vm.createContext({ SECTIONS: [{ ...POST_SECTION, entries: [other] }] });
  const script = await readFile(new URL('../modules/rote-klaue/klaue-data.js', import.meta.url), 'utf8');
  vm.runInContext(script, context); vm.runInContext(script, context);
  assert.equal(context.SECTIONS.length, 1);
  assert.equal(context.SECTIONS[0].entries.length, 2);
  assert.equal(context.SECTIONS[0].entries[0], other);
  assert.equal(entry.pages.length, 9);
  assert.equal(entry.pages.filter(p => p.sessionPage).length, 3);
  assert.equal(entry.appendCommentsPage, false);
  assert.equal(new Set(entry.pages.map(p => p.commentThreadKey)).size, 9);
});
test('co-owners have distinct guild identities without creating two business placements', () => {
  const records = OPERATING_MEMBERS.filter(member => member.entryId === entry.id);
  assert.equal(records.length, 1);
  assert.deepEqual(records[0].owners.map(p => p.key), ['lucan', 'camilla']);
  for (const mode of ['trade', 'bank']) {
    const owners = operatingMemberNodes('test', mode).filter(n => n.memberEntryId === entry.id);
    assert.equal(owners.length, 2);
    assert.deepEqual(owners.map(p => p.worldPersonId), records[0].owners.map(p => p.worldPersonId));
  }
});
test('family is serial, twins are siblings, and only Lucan has a spouse', () => {
  assert.deepEqual(assertValidFamily(family).diagnostics, []);
  assert.deepEqual(auditFamilyChartLayoutPolicy(family).issues, []);
  assert.equal(family.persons.length, 7);
  assert.equal(family.timeJumps.length, 1);
  assert.deepEqual(family.timeJumps[0].childIds, ['klaue-decian']);
  assert.equal(family.persons.filter(p => p.birth === '1707').length, 2);
  assert.ok(!family.partnerships.some(p => p.participantIds.includes('klaue-camilla')));
  const married = family.partnerships.find(p => p.participantIds.includes('klaue-lucan'));
  assert.deepEqual(married.participantIds, ['klaue-lucan', 'klaue-aerwen']);
  assert.ok(KLAUE_FAMILY.filter(p => p.death).every(p => !p.portrait));
  assert.match(entry.pages[2].familyTree.source, /family=haus-valerus/);
});
test('staff contains three distinct legionaries and two explicitly vacant runners', async () => {
  const trees = entry.pages.find(p => p.hierarchyPage).hierarchy.trees;
  assert.deepEqual(trees.map(t => t.label), ['Führung', 'Verwaltung & Logistik', 'Sicherheit', 'Sonstiges']);
  assert.deepEqual(trees.map(t => t.levels[0].nodes.length), [3, 2, 3, 5]);
  assert.equal(KLAUE_LIVING.length, 9);
  assert.equal(new Set(KLAUE_LIVING.map(p => p.worldPersonId)).size, 9);
  assert.deepEqual(KLAUE_STAFF.filter(p => /Legionär/.test(p.role)).map(p => p.culture), ['Aldrimar', 'Aldrimar', 'Cenyr']);
  for (const dog of KLAUE_DOGS) {
    assert.equal(dog.species, 'Clachair');
    await access(new URL(dog.bestiaryReference.url.slice(1), root));
  }
});
test('publication plans preserve existing online identity, portrait and live resources', () => {
  const first = planKlaueCharacters();
  assert.equal(first.entries.length, 9);
  assert.equal(new Set(first.entries.map(e => e.id)).size, 9);
  const prior = { ...first.entries[0].data, id: 'existing-online-lucan', portrait: 'custom.png', hitPoints: { current: 4, maximum: 19 }, inventory: { items: [{ id: 'existing-owned-item' }] } };
  const before = structuredClone(prior);
  const next = planKlaueCharacters([prior], first.config);
  const lucan = next.entries.find(e => e.key === 'lucan');
  assert.equal(lucan.id, prior.id);
  assert.equal(lucan.create, false);
  assert.ok(!lucan.patch || Object.keys(lucan.patch).every(key => ['genealogy', 'updatedAt'].includes(key)));
  assert.deepEqual(prior, before);
});
test('goods are genuinely empty and credit capital is not fed into retail turnover', () => {
  const catalog = entry.pages.find(p => p.tradeCatalogPage).tradeCatalog;
  assert.deepEqual(catalog.items, []);
  assert.equal(catalog.categories.length, 3);
  assert.ok(!JSON.stringify(catalog.items).includes('Rüstung'));
  assert.equal(evaluateVenueScope(entry, KLAUE_SECTION).eligible, false);
  const services = entry.pages.find(p => p.guildServicesPage).guildServices;
  assert.equal(services.services.length, 5);
  assert.ok(services.services.every(s => s.icon.endsWith('.png') && s.terms));
  assert.match(services.conditions, /36 Tage/);
  assert.match(services.conditions, /Verzug allein/);
});
test('local assets retain their generated sources and authorized alpha changes only', async () => {
  const directory = new URL('../assets/rote-klaue/', import.meta.url);
  const manifest = JSON.parse(await readFile(new URL('generation.json', directory), 'utf8'));
  assert.equal(manifest.assets.length, 23);
  assert.equal(new Set(manifest.assets.map(a => a.file)).size, 23);
  for (const asset of manifest.assets) {
    const bytes = await readFile(new URL(asset.file, directory));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), asset.sha256);
    if (!asset.postprocess) assert.equal(asset.sha256, asset.sourceSha256);
    if (asset.file.startsWith('portraits/') || asset.file.startsWith('scenes/') || asset.file.startsWith('pets/')) {
      assert.equal(bytes.readUInt32BE(16) * 3, bytes.readUInt32BE(20) * 2);
    }
    if (asset.postprocess) assert.equal(asset.postprocess.rgbUnchanged, true);
  }
  for (const p of KLAUE_LIVING) await access(new URL(p.portrait, new URL('../', import.meta.url)));
});
