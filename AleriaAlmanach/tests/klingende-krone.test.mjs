import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import vm from 'node:vm';
import { buildKlingendeKrone } from '../modules/klingende-krone/krone-module.mjs';
import { KRONE_STAFF, KRONE_DOG } from '../modules/klingende-krone/krone-people.mjs';
import { CNEACAIL_ADDITIONS } from '../modules/cneacail-family/cneacail-people.mjs';
import { KRONE_DRINKS, KRONE_SNACKS } from '../modules/klingende-krone/krone-goods.mjs';
import { SEPT_CNEACAIL_FAMILY as family } from '../../Stammbäume/assets/js/data/sept-cneacail-family.js';
import { assertValidFamily, normalizeFamily } from '../../Stammbäume/assets/js/domain/family-schema.js';
import { STANDARD_ITEMS } from '../modules/item-register/item-register-standard.js';
import { buildModuleOffers } from '../modules/item-register/item-register-module-catalog.js';
import { resolveCreatureBestiaryReference } from '../modules/creatures/creature-bestiary-reference.js';
import { planKroneCharacters } from '../modules/klingende-krone/krone-characters.mjs';
const entry = buildKlingendeKrone(), catalog = entry.pages[5].tradeCatalog;
test('guild tavern has five working scenes and only its named adult staff in the cast', () => {
  assert.equal(entry.pages.length, 12); assert.equal(entry.pages.filter(p => p.sessionPage).length, 5);
  assert.equal(new Set(entry.pages.map(p => p.commentThreadKey)).size, 12);
  assert.equal(entry.sessionCast.length, 7);
  assert.ok(CNEACAIL_ADDITIONS.every(p => !entry.sessionCast.includes(p.worldPersonId)));
  assert.ok(KRONE_STAFF.every(p => p.age >= 24 && !p.name.includes(' ')));
  assert.deepEqual(entry.pages[4].hierarchy.trees.map(t => t.label), ['Führung', 'Ausschank & Bedienung', 'Brauerei & Destillerie', 'Sicherheit', 'Logistik', 'Tiere']);
  const watch = entry.pages[4].hierarchy.trees.find(t => t.id === 'sicherheit');
  assert.deepEqual(watch.levels.map(l => l.nodes.length), [1, 4, 4, 4, 4]);
  assert.ok(watch.levels[0].nodes.every(n => n.portrait.endsWith('/leutnant.png')));
  assert.ok(watch.levels.slice(1).flatMap(l => l.nodes).every(n => n.portrait.endsWith('/soldat.png')));
  assert.deepEqual(resolveCreatureBestiaryReference(KRONE_DOG), KRONE_DOG.bestiaryReference);
});
test('standard drinks, three house drinks and exactly three cold snacks retain real prices', () => {
  const expected = STANDARD_ITEMS.filter(i => i.id.startsWith('standard:taverne:') && i.category === 'getraenke');
  assert.equal(catalog.items.length, expected.length + 6);
  assert.equal(catalog.items.filter(i => i.category === 'standard').length, expected.length);
  assert.equal(catalog.items.filter(i => i.category === 'snacks').length, 3);
  assert.equal(catalog.items.some(i => i.category === 'speisen'), false);
  for (const source of expected) assert.equal(catalog.items.find(i => i.canonicalKey === source.canonicalKey).image, source.image);
  for (const drink of KRONE_DRINKS) {
    const item = catalog.items.find(i => i.id === drink.id);
    assert.equal(item.priceOptions.length, 3);
    const offers = buildModuleOffers([entry]).filter(o => o.title === item.title);
    assert.equal(offers.length, 3); assert.equal(offers[0].priceRange.minCopper, drink.price);
  }
  assert.equal(KRONE_SNACKS.length, 3);
  assert.ok(!catalog.items.some(i => i.title === 'Bun na h-Aibhne'));
});
test('Comann source supports Cenyr and five complete oak years, without invented seal approval', async () => {
  const source = await readFile(new URL('../modules/comann-braich-alba/comann-braich-alba-data.js', import.meta.url), 'utf8');
  assert.match(source, /Eine cenyrische oder aldrimarische Brennerei kann daher bis heute vollkommen rechtmäßig/);
  assert.match(source, /mindestens fünf vollständige Jahre/);
  const whisky = KRONE_DRINKS.find(d => d.kind === 'whisky');
  assert.match(whisky.name, /5 Jahre/); assert.match(whisky.description, /Gwynthor/); assert.match(whisky.description, /Eichenfass/);
  assert.equal(catalog.items.some(i => i.sealImage), false);
});
test('fifteen-person Sept preserves existing IDs and ends every other pre-war branch in 1720', () => {
  assertValidFamily(family);
  const normalized = normalizeFamily(family);
  assert.equal(normalized.persons.length, 15); assert.equal(family.timeJumps.length, 1);
  assert.equal(family.timeJumps[0].parentPartnershipId, family.lineage.founderPartnershipId);
  assert.deepEqual(family.timeJumps[0].childIds, ['donnchadh-cneacail', 'arran-cneacail', 'beathag-cneacail']);
  const oldSurvivors = new Set(['arran-cneacail', 'alasdair-cneacail', 'finlay-cneacail']);
  for (const person of family.persons.filter(p => p.birth && Number(p.birth) < 1720 && !oldSurvivors.has(p.id) && !['lysiane-cneacail', 'nessa-cneacail'].includes(p.id))) assert.equal(person.death, '1720');
  for (const id of oldSurvivors) assert.equal(family.persons.find(p => p.id === id).worldPersonId, `person--sept-cneacail--${id}`);
  assert.equal(family.persons.find(p => p.id === 'aodhan-cneacail').birth, '1734');
  assert.equal(family.persons.find(p => p.id === 'eithne-cneacail').birth, '1721');
  assert.equal(family.persons.find(p => p.id === 'catriona-cneacail').birth, '1722');
  const separated = normalized.partnerships.find(p => p.id === 'marriage-alasdair-nessa');
  assert.equal(separated.status, 'ended'); assert.equal(separated.end, '1735');
});
test('registration is idempotent and all final art paths resolve', async () => {
  const code = await readFile(new URL('../modules/klingende-krone/krone-data.js', import.meta.url), 'utf8');
  const context = vm.createContext({ SECTIONS: [] }); vm.runInContext(code, context); vm.runInContext(code, context);
  assert.equal(context.SECTIONS.flatMap(s => s.entries).filter(e => e.id === entry.id).length, 1);
  const manifest = JSON.parse(await readFile(new URL('../assets/klingende-krone/image-prompts.json', import.meta.url), 'utf8'));
  assert.equal(manifest.entries.length, 26);
  for (const job of manifest.entries) await access(new URL(job.destination, new URL('../../', import.meta.url)));
});
test('offline import keeps family members separate and preserves existing live identities', () => {
  const initial = planKroneCharacters(); assert.equal(initial.entries.length, 14);
  const old = initial.entries.find(e => e.key === 'finlay');
  const existing = { ...old.data, id: 'stable-finlay-online-id', bio: 'Eigener Text', portrait: 'custom.png', resources: { hp: 7 } }, before = structuredClone(existing);
  const next = planKroneCharacters([existing]).entries.find(e => e.key === 'finlay');
  assert.equal(next.id, existing.id); assert.equal(next.create, false); assert.deepEqual(existing, before);
  assert.ok(!next.patch || Object.keys(next.patch).every(k => ['genealogy', 'updatedAt'].includes(k)));
  assert.equal(initial.entries.find(e => e.key === 'aodhan').data.fraktion, 'Sept Cneacail');
});
