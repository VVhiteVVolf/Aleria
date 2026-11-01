import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { withGroupAdventureContent, GROUP_ADVENTURE_MODULES } from '../modules/group-adventures/group-adventure-content.mjs';
import { ARIAN_HIERARCHY_KEY } from '../modules/group-adventures/anaraut-content.mjs';
import { collectGroupRoster, resolveGroupRoster } from '../modules/landing/group-landing-roster.js';
import { IDWAL_SHIP_CATS } from '../modules/creatures/catalog/idwal-ship-cats.js';
const source = async id => JSON.parse(await readFile(new URL(`../modules/group-adventures/source/${id}-2026-11-01.json`, import.meta.url), 'utf8')).entry;

test('seven known groups receive an idempotent folio without changing existing stories, hierarchy assignments or scene threads', async () => {
  for (const id of Object.keys(GROUP_ADVENTURE_MODULES)) {
    const original = await source(id), before = structuredClone(original);
    const next = withGroupAdventureContent(original);
    assert.deepEqual(original, before);
    assert.equal(next.id, original.id);
    const overview = next.pages.find(page => page.landingPage && page.landing?.group);
    assert.equal(overview.landing.presentation, 'folio');
    assert.equal(overview.landing.questJournal.enabled, true);
    for (const [index, page] of original.pages.entries()) {
      const key = page.commentThreadKey || String(index);
      const preserved = next.pages.find(candidate => candidate.commentThreadKey === key);
      assert.ok(preserved, `${id}: existing page ${key} lost`);
      if (page.sessionPage) assert.deepEqual(preserved, { ...page, commentThreadKey: key });
      if (page.hierarchyPage && id !== 'modul-1782120382311') assert.deepEqual(preserved, { ...page, commentThreadKey: key });
    }
    assert.strictEqual(withGroupAdventureContent(next), next);
    overview.landing.presentation = 'classic';
    overview.landing.group.location = 'Nutzerbestimmter Ort';
    assert.equal(withGroupAdventureContent(next).pages.find(page => page.landingPage).landing.presentation, 'classic');
    assert.equal(withGroupAdventureContent(next).pages.find(page => page.landingPage).landing.group.location, 'Nutzerbestimmter Ort');
  }
  const unrelated = { id: 'other', pages: [] };
  assert.strictEqual(withGroupAdventureContent(unrelated), unrelated);
});

test('Anarauts original retinue keeps every rank, portrait and name while empty role descriptions become meaningful', async () => {
  const original = await source('modul-1782120382311');
  const next = withGroupAdventureContent(original);
  const before = original.pages.find(page => page.hierarchyPage);
  const after = next.pages.find(page => page.commentThreadKey === before.commentThreadKey);
  const withoutDescriptions = page => (page.hierarchy.trees || []).map(tree => ({ ...tree, levels: tree.levels.map(level => ({ ...level,
    nodes: level.nodes.map(({ text, ...node }) => node) })) }));
  assert.deepEqual(withoutDescriptions(after), withoutDescriptions(before));
  const nodes = after.hierarchy.trees.flatMap(tree => tree.levels.flatMap(level => level.nodes));
  assert.ok(nodes.every(node => node.text.trim().length > 30));
  assert.deepEqual(collectGroupRoster({ pages: [after] }).map(person => person.name), ['Anaraut Draig', 'Alwyn Gafyr', 'Gwenna Crafanc', 'Enan Wyrm', 'Peryr Gwefrydd', 'Oth Dyngwn']);
  assert.match(next.pages[0].description, /Erbe von Celtigerns Wacht/);
  assert.match(next.pages[0].description, /Adjutant des Marschalls/);
  assert.doesNotMatch(next.pages[0].description, /Erzählerischer Einstieg/);
});

test('Arians second ship hierarchy assigns only the requested captain and preserves vacant silhouette slots', async () => {
  const next = withGroupAdventureContent(await source('modul-1782120382311'));
  assert.equal(next.pages.filter(page => page.hierarchyPage).length, 2);
  const ship = next.pages.find(page => page.commentThreadKey === ARIAN_HIERARCHY_KEY);
  assert.ok(ship);
  assert.deepEqual(collectGroupRoster({ pages: [ship] }).map(person => person.name), ['Arian Saethwyr']);
  const nodes = ship.hierarchy.trees.flatMap(tree => tree.levels.flatMap(level => level.nodes));
  const vacant = nodes.filter(node => node.subtitle === 'VAKANT');
  assert.ok(vacant.length > 0);
  assert.ok(vacant.every(node => node.portrait === '' && node.text.length > 25));
  assert.equal(nodes.filter(node => node.subtitle === 'Arian Saethwyr').length, 1);
  assert.equal(ship.hierarchy.trees.length, 3);
  assert.equal(next.pages.filter(page => page.landingPage).length, 1);
});

test('Idwals completed pages and crew cats remain exactly as authored outside the landing page', async () => {
  const original = await source('idwals-schiffsmannschaft');
  const next = withGroupAdventureContent(original);
  assert.deepEqual(next.pages.filter(page => !page.landingPage), original.pages.filter(page => !page.landingPage));
  const cats = next.pages.find(page => page.hierarchyPage).hierarchy.trees.find(tree => tree.id === 'schiffskatzen');
  assert.deepEqual(cats.levels[0].nodes.map(node => node.title), ['Bwmbo', 'Uffel']);
  const guests = next.pages.find(page => page.landingPage).landing.group.guests;
  assert.deepEqual(guests.filter(guest => guest.kind === 'creature').map(guest => guest.creatureId), IDWAL_SHIP_CATS.map(cat => cat.id));
  assert.match(guests.find(guest => guest.name === 'Bwmbo').note, /Trevor/);
  assert.match(guests.find(guest => guest.name === 'Uffel').note, /Kein persönlicher Besitzer/);
  const customized = structuredClone(original);
  customized.pages.find(page => page.landingPage).landing.group.guests.push({ id: 'my-cat', kind: 'creature', creatureId: IDWAL_SHIP_CATS[0].id, name: 'Bwmbo', note: 'Eigene Gruppennotiz', assignment: 'active' });
  const selected = withGroupAdventureContent(customized).pages.find(page => page.landingPage).landing.group.guests;
  assert.equal(selected.filter(guest => guest.creatureId === IDWAL_SHIP_CATS[0].id).length, 1);
  assert.equal(selected.find(guest => guest.id === 'my-cat').note, 'Eigene Gruppennotiz');
});

test('first folio migration selects the real roster only when the previous overview had no selection', async () => {
  for (const id of ['draig-leibgarde', 'idwals-schiffsmannschaft', 'lynnes-schiffsmannschaft', 'parzifals-schiffsmannschaft', 'rhydians-schiffsmannschaft']) {
    const original = await source(id), before = structuredClone(original), expectedPeople = collectGroupRoster(original).map(row => row.name).sort();
    const next = withGroupAdventureContent(original), group = next.pages.find(page => page.landingPage).landing.group;
    const roster = resolveGroupRoster(next, group);
    assert.ok(roster.length > 0, id);
    assert.ok(roster.every(row => row.assignment === 'active'), id);
    assert.deepEqual(roster.filter(row => row.kind === 'character').map(row => row.name).sort(), expectedPeople, 'Only the actual named hierarchy is selected.');
    if (id === 'idwals-schiffsmannschaft') {
      assert.deepEqual(roster.filter(row => row.kind === 'creature').map(row => row.creatureId).sort(), IDWAL_SHIP_CATS.map(cat => cat.id).sort());
    }
    assert.deepEqual(original, before);
  }
});

test('a saved member choice, guest choice or preset prevents whole-roster activation and preserves authored values', async () => {
  for (const selection of ['members', 'guests', 'presets']) {
    const original = await source('idwals-schiffsmannschaft'), group = original.pages.find(page => page.landingPage).landing.group;
    const memberId = collectGroupRoster(original)[0].id;
    if (selection === 'members') group.members.push({ id: memberId, assignment: 'away', note: 'Eigene Abwesenheit', linkMode: 'none' });
    if (selection === 'guests') group.guests.push({ id: 'authored-guest', name: 'Eigener Gast', characterId: 'saved-guest', assignment: 'reserve', note: 'Eigene Auswahl' });
    if (selection === 'presets') group.presets.push({ id: 'authored-preset', name: 'Eigene Zusammenstellung', memberIds: [memberId] });
    const before = structuredClone(original), next = withGroupAdventureContent(original), after = next.pages.find(page => page.landingPage).landing.group;
    const roster = resolveGroupRoster(next, after);
    assert.ok(roster.every(row => row.assignment !== 'active'), selection);
    if (selection === 'members') {
      const selected = roster.find(row => row.id === memberId);
      assert.equal(selected.assignment, 'away'); assert.equal(selected.note, 'Eigene Abwesenheit'); assert.equal(selected.linkMode, 'none');
    }
    if (selection === 'guests') {
      const guest = roster.find(row => row.id === 'authored-guest');
      assert.equal(guest.assignment, 'reserve'); assert.equal(guest.note, 'Eigene Auswahl'); assert.equal(guest.characterId, 'saved-guest');
    }
    if (selection === 'presets') assert.deepEqual(after.presets, before.pages.find(page => page.landingPage).landing.group.presets);
    assert.deepEqual(original, before);
  }
  for (const id of ['skallis-gefolge', 'modul-1782120382311']) {
    const original = await source(id), next = withGroupAdventureContent(original);
    const old = original.pages.find(page => page.landingPage).landing.group, after = next.pages.find(page => page.landingPage).landing.group;
    assert.deepEqual(after.members.map(row => [row.id, row.assignment]), old.members.map(row => [row.id, row.assignment]));
  }
});

test('clearing a migrated selection is a later user choice and the version marker prevents reactivation', async () => {
  const migrated = withGroupAdventureContent(await source('idwals-schiffsmannschaft'));
  const group = migrated.pages.find(page => page.landingPage).landing.group;
  group.members = []; group.guests = []; group.presets = [];
  const before = structuredClone(migrated), next = withGroupAdventureContent(migrated);
  assert.strictEqual(next, migrated);
  assert.deepEqual(next, before);
  const roster = resolveGroupRoster(next, group);
  assert.ok(roster.length > 0);
  assert.ok(roster.every(row => row.assignment === 'reserve'));
});
