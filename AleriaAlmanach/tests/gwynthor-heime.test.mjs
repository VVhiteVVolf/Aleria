import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import vm from 'node:vm';
import { GWYNTHOR_HOUSEHOLDS as homes } from '../modules/gwynthor-heime/households.mjs';
import { buildGwynthorHomes, HOMES_SECTION } from '../modules/gwynthor-heime/homes-module.mjs';
import { withHouseholdWorkplaceLinks } from '../modules/gwynthor-heime/household-workplaces.mjs';
import { GWYNTHOR_SMALL_HOUSEHOLD_FAMILIES as families } from '../../Stammbäume/assets/js/data/gwynthor-small-households.js';
import { FAMILY_REGISTRY } from '../../Stammbäume/assets/js/data/families.registry.js';
import { assertValidFamily } from '../../Stammbäume/assets/js/domain/family-schema.js';
import { auditFamilyChartLayoutPolicy } from '../../Stammbäume/assets/js/adapters/family-chart-layout-policy.js';
import { resolveCreatureBestiaryReference } from '../modules/creatures/creature-bestiary-reference.js';
import { KANNE_PEOPLE } from '../modules/krumme-kanne/krumme-kanne-roster.mjs';
import { planKanneCharacters } from '../modules/krumme-kanne/krumme-kanne-characters.mjs';
import { evaluateVenueScope } from '../modules/economy-calculator/economy-venue-scope.mjs';
import { configureFamilyEmbedView } from '../../Stammbäume/assets/js/modules/family-embed/family-embed-view.js';

test('compact genealogy presentation is explicitly limited to embedded read mode', () => {
  const attrs = new Map(), documentRef = { documentElement: { toggleAttribute: (name, enabled) => attrs.set(name, enabled) } };
  for (const [search, expected] of [['?mode=view&embed=1', true], ['?mode=view', false], ['?mode=edit&embed=1', false], ['?mode=view&embed=0', false]]) {
    assert.equal(configureFamilyEmbedView({ documentRef, locationRef: { search } }), expected);
    assert.equal(attrs.get('data-family-embed'), expected);
  }
});

test('small private households keep their exact family circles and valid chart anchors', () => {
  assert.deepEqual(families.map(f => f.persons.length), [4, 3, 2]);
  assert.deepEqual(homes.map(h => h.people.filter(p => p.age < 18).map(p => p.age)), [[9, 7], [11], []]);
  assert.deepEqual(homes[2].people.map(p => p.age), [31, 21]);
  for (const family of families) {
    assert.deepEqual(assertValidFamily(family).diagnostics, []);
    assert.deepEqual(auditFamilyChartLayoutPolicy(family).issues, []);
    assert.equal(family.timeJumps.length, 0);
    assert.equal(family.partnerships.length, 1);
    assert.equal(FAMILY_REGISTRY.filter(r => r.id === family.document.id).length, 1);
  }
});

test('saved family snapshots retain the current layout anchors and original person identities', async () => {
  for (const family of families) {
    const envelope = JSON.parse(await readFile(new URL(`../../Stammbäume/assets/data/published-families/${family.document.id}.json`, import.meta.url), 'utf8'));
    assert.equal(envelope.family.extensions.sourceRevision, family.extensions.sourceRevision);
    assert.deepEqual(auditFamilyChartLayoutPolicy(envelope.family).issues, []);
    assert.deepEqual(envelope.family.persons.map(p => p.worldPersonId), family.persons.map(p => p.worldPersonId));
  }
});

test('homes are normal city modules with real iframe families and no commercial pages', async () => {
  const entries = buildGwynthorHomes();
  const context = vm.createContext({ SECTIONS: [{ tab: HOMES_SECTION.tab, path: HOMES_SECTION.path, entries: [entries[0]] }], structuredClone });
  const source = await readFile(new URL('../modules/gwynthor-heime/homes-data.js', import.meta.url), 'utf8');
  vm.runInContext(source, context); vm.runInContext(source, context);
  assert.equal(context.SECTIONS.length, 1);
  assert.equal(context.SECTIONS[0].entries.length, 3);
  for (const [index, entry] of entries.entries()) {
    assert.equal(entry.appendCommentsPage, false);
    assert.ok(!evaluateVenueScope(entry, HOMES_SECTION).eligible);
    assert.equal(entry.pages.filter(p => p.familyTreePage).length, 1);
    assert.equal(entry.pages[1].biographyPage, true);
    assert.equal(entry.pages[2].familyTree.familyId, families[index].document.id);
    assert.match(entry.pages[2].familyTree.source, /Stammbaum\.html\?family=haus-[a-z]+&mode=view$/);
    assert.equal(entry.pages.filter(p => p.sessionPage).length, 1);
    assert.ok(!entry.pages.some(p => p.tradeCatalogPage || p.guildServicesPage || p.economyCalculationPage));
  }
});

test('family biographies precede the tree, use five actual CK traits and retain existing scene keys', async () => {
  for (const [index, entry] of buildGwynthorHomes().entries()) {
    const home = homes[index], page = entry.pages[1], bio = page.biography;
    assert.equal(bio.abilities.length, 5);
    assert.equal(new Set(bio.abilities.map(a => a.icon)).size, 5);
    assert.match(page.image, new RegExp(`/${home.slug}/familienbild\\.png$`));
    assert.equal(page.imageFit, 'contain');
    assert.ok(bio.historyText.length && bio.biographyText.length && bio.connections.length);
    assert.ok(bio.extraSections.some(s => s.title === 'Lebensunterhalt & Wirtschaftlichkeit' && s.text.length));
    assert.deepEqual(entry.pages.filter(p => !p.biographyPage).map(p => p.commentThreadKey), [
      `${home.slug}-heim`, `${home.slug}-familie`, ...(home.pet ? [`${home.slug}-hund`] : []), `${home.slug}-wohnstube`
    ]);
    for (const trait of bio.abilities) {
      assert.match(trait.icon, /IconOrdner\/(Big Traits|Cktraits)\/Trait_.*\.png$/);
      await access(new URL(`../../${trait.icon.slice(3)}`, import.meta.url));
    }
  }
});

test('Llinos keeps her existing identity, portrait and job across the household and Kanne', () => {
  const llinos = families[2].persons.find(p => p.id === 'llinos');
  const worker = KANNE_PEOPLE.find(p => p.id === 'llinos');
  assert.equal(llinos.worldPersonId, 'person--krumme-kanne--llinos');
  assert.equal(worker.worldPersonId, llinos.worldPersonId);
  assert.equal(worker.name, llinos.name);
  assert.match(worker.portrait, /krumme-kanne\/portraits\/llinos\.png$/);
  assert.match(worker.role, /Hausmagd/);
  assert.match(worker.family, /Gwydan/);
  assert.equal(FAMILY_REGISTRY.flatMap(r => r.family.persons).filter(p => p.worldPersonId === llinos.worldPersonId).length, 1);
  const plan = planKanneCharacters([], {});
  assert.ok(JSON.stringify(plan).includes('Llinos Celynfor'));
});

test('workplace projection is idempotent and preserves module threads, clocks and custom workers', async () => {
  const original = JSON.parse(await readFile(new URL('../modules/krumme-kanne/source/module-before-services.json', import.meta.url), 'utf8')).entry;
  const untouched = structuredClone(original), projected = withHouseholdWorkplaceLinks(original);
  const nodes = projected.pages.flatMap(p => p.hierarchy?.trees?.flatMap(t => t.levels.flatMap(l => l.nodes)) || []);
  assert.equal(nodes.filter(n => n.title === 'Llinos Celynfor').length, 1);
  assert.deepEqual(projected.pages.map(p => [p.commentThreadKey, p.sessionDateAleria]), original.pages.map(p => [p.commentThreadKey, p.sessionDateAleria]));
  assert.deepEqual(original, untouched);
  assert.strictEqual(withHouseholdWorkplaceLinks(projected), projected);
  const custom = structuredClone(original);
  const node = custom.pages.flatMap(p => p.hierarchy?.trees?.flatMap(t => t.levels.flatMap(l => l.nodes)) || []).find(n => n.title === 'Llinos');
  node.title = 'Eigene Bearbeitung';
  assert.strictEqual(withHouseholdWorkplaceLinks(custom), custom);
  const context = vm.createContext({ structuredClone });
  vm.runInContext(await readFile(new URL('../modules/gwynthor-heime/household-workplaces.js', import.meta.url), 'utf8'), context);
  assert.equal(JSON.stringify(context.migrateHouseholdWorkplaceEntry(original)), JSON.stringify(projected));
});

test('all portraits and rooms are local; the dog links to an existing individual breed', async () => {
  const images = new Set(homes.flatMap(h => [...h.people.map(p => p.portrait), `./assets/gwynthor-heime/${h.slug}/wappen.png`,
    `./assets/gwynthor-heime/${h.slug}/aussenansicht.png`, `./assets/gwynthor-heime/${h.slug}/wohnstube.png`, `./assets/gwynthor-heime/${h.slug}/familienbild.png`, ...(h.pet ? [`./assets/gwynthor-heime/${h.slug}/spant.png`] : [])]));
  await Promise.all([...images].map(image => access(new URL(`../${image.slice(2)}`, import.meta.url))));
  const dog = homes[2].pet, profile = resolveCreatureBestiaryReference({ species: dog.species });
  assert.ok(profile);
  assert.match(dog.bestiary, /hunde\/brag\/index.html$/);
  await access(new URL(`../../${dog.bestiary.slice(3)}`, import.meta.url));
});
