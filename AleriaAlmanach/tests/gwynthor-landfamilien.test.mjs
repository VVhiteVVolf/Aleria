import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { LAND_FAMILIEN_ROSTER } from '../../Stammbäume/assets/js/data/gwynthor-fleischsammler/landfamilien-roster.mjs';
import { buildLandfamilienEntries, buildLandfamilienRegistrations } from '../modules/gwynthor-landfamilien/landfamilien-module.mjs';
import { LANDFAMILIEN_PLACES, landfamilienSection } from '../modules/gwynthor-landfamilien/landfamilien-places.mjs';
import { GWYNTHOR_BANNKREIS_PATH } from '../modules/gwynthor-geography/gwynthor-section-layout.mjs';

test('three separate rural categories retain six native pages and two isolated scene threads', () => {
  const entries = buildLandfamilienEntries();
  assert.deepEqual(entries.map(entry => entry.id), ['tirfelyn-hof', 'jagdhaus-helfaen', 'marchwern-gestuet']);
  for (const [index, entry] of entries.entries()) {
    const place = LANDFAMILIEN_PLACES[index], section = landfamilienSection(place);
    assert.deepEqual(section.path, [...GWYNTHOR_BANNKREIS_PATH, place.title]);
    assert.equal(section.tab, 'Völker & Kulturen');
    assert.equal(entry.pages.length, 6);
    assert.equal(new Set(entry.pages.map(page => page.commentThreadKey)).size, 6);
    assert.equal(entry.pages[1].hierarchyPage, true);
    assert.equal(entry.pages[2].biographyPage, true);
    assert.equal(entry.pages[3].familyTreePage, true);
    assert.deepEqual(entry.pages.filter(page => page.sessionPage).map(page => page.commentThreadKey),
      [`${place.slug}-szene-aussen`, `${place.slug}-szene-wohnstube`]);
    assert.equal(entry.appendCommentsPage, false);
    assert.ok(!entry.pages.some(page => page.tradeCatalogPage || page.guildServicesPage || page.economyCalculationPage));
  }
});

test('the hierarchy lists each living person once, preserves three biography portraits and excludes the dead from play', () => {
  const entries = buildLandfamilienEntries();
  assert.deepEqual(LAND_FAMILIEN_ROSTER.families.map(family => family.persons.filter(person => person.status === 'alive').length), [16, 5, 14]);
  for (const [index, entry] of entries.entries()) {
    const household = LAND_FAMILIEN_ROSTER.families[index], living = household.persons.filter(person => person.status === 'alive');
    const nodes = entry.pages[1].hierarchy.trees.flatMap(tree => tree.levels.flatMap(level => level.nodes));
    assert.deepEqual(nodes.map(node => node.title).sort(), living.map(person => person.name).sort());
    assert.equal(new Set(nodes.map(node => node.portrait)).size, living.length);
    assert.equal(entry.pages[2].biography.connections.length, 3);
    for (const person of household.persons) {
      assert.ok(entry.pages[2].biography.extraSections[0].text.includes(person.name));
      if (person.status === 'dead') assert.ok(!nodes.some(node => node.title === person.name));
    }
    assert.equal(entry.sessionCast.length, living.filter(person => person.resident).length);
  }
});

test('iframe source and case context remain tied to the existing family identities', () => {
  for (const [index, entry] of buildLandfamilienEntries().entries()) {
    const household = LAND_FAMILIEN_ROSTER.families[index], tree = entry.pages[3].familyTree;
    assert.equal(tree.familyId, household.familyId);
    assert.equal(tree.source, `../Stammb%C3%A4ume/Stammbaum.html?family=${household.familyId}&mode=view`);
    assert.match(tree.intro, /unbekannten Gründern.*Familienwappen.*Zeitsprung/);
  }
  const source = JSON.stringify(buildLandfamilienEntries().slice(0, 2));
  assert.match(source, /Ceridwen/);
  assert.match(source, /Verlobt|verlobt/);
  assert.match(source, /1740/);
  assert.match(source, /Morgen/);
  assert.match(source, /genauer Tatort.*nicht festgelegt/);
});

test('the real hierarchy sanitizer retains every group and every portrait across JSON round trips', async () => {
  const context = vm.createContext({ document: { addEventListener() {} } });
  vm.runInContext(await readFile(new URL('../modules/module-editor/module-editor-data.js', import.meta.url), 'utf8'), context);
  for (const entry of buildLandfamilienEntries()) {
    const original = entry.pages[1].hierarchy;
    const first = JSON.parse(JSON.stringify(context.sanitizeHierarchyData(original)));
    const second = JSON.parse(JSON.stringify(context.sanitizeHierarchyData(JSON.parse(JSON.stringify(first)))));
    assert.deepEqual(second, first);
    assert.deepEqual(first.trees.map(tree => tree.levels.flatMap(level => level.nodes.map(node => node.portrait))),
      original.trees.map(tree => tree.levels.flatMap(level => level.nodes.map(node => node.portrait))));
    assert.ok(first.trees.every(tree => tree.levels.every(level => level.nodes.length <= 12)));
  }
});

test('generated archive registration is idempotent and preserves an existing local entry object', async () => {
  const registrations = buildLandfamilienRegistrations(), saved = { ...registrations[0].entry, title: 'Eigener Hoftitel' };
  const section = { tab: 'Völker & Kulturen', path: ['Eigene Ablage'], entries: [saved] };
  const context = vm.createContext({ SECTIONS: [section] });
  const source = await readFile(new URL('../modules/gwynthor-landfamilien/landfamilien-data.js', import.meta.url), 'utf8');
  vm.runInContext(source, context); vm.runInContext(source, context);
  const found = context.SECTIONS.flatMap(section => section.entries);
  assert.equal(found.length, 3);
  assert.strictEqual(found.find(entry => entry.id === saved.id), saved);
  assert.equal(saved.title, 'Eigener Hoftitel');
});
