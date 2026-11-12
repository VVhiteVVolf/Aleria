import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { readWorldDirectorySources } from '../source-reader.mjs';
import { familyAtPlace, familyAtScope, territoryFamilyScope } from '../house-placement.mjs';
import { projectHouseDirectories } from '../house-projection.mjs';
import { getRegisteredFamily } from '../../../Stammbäume/assets/js/data/families.registry.js';
const root = new URL('../../../', import.meta.url);
const { families, territories, places, houses } = await readWorldDirectorySources();
const listed = groups => groups.flatMap(group => group.items || group.cards || []).map(card => card.familyId || card.id).filter(Boolean);

test('every independently placed visible family is present exactly once in every registered settlement', () => {
  assert.ok(places.length >= 200);
  for (const place of places) {
    if (place.status === 'template' || /einrichtung|standort/i.test(place.hierarchy?.at(-1)?.type || '')) continue;
    const projected = projectHouseDirectories(place.content, place.id, 'places');
    const ids = listed(projected?.houses || []);
    assert.equal(ids.length, new Set(ids).size, `${place.id}: no duplicate family IDs`);
    for (const family of families.filter(f => familyAtPlace(f, place))) assert.equal(ids.filter(id => id === family.id).length, 1, `${place.id}/${family.id}`);
    if (place.content) assert.equal(projected.sections, place.content.sections, `${place.id}: narrative source untouched`);
  }
});
test('all territory projections preserve their article, council and map ownership', () => {
  assert.ok(territories.length >= 575);
  for (const territory of territories) {
    const old = territory.content, next = projectHouseDirectories(old, territory.id, 'territories');
    if (!old?.view) continue;
    const ids = listed(next.view.familySections || []);
    assert.equal(ids.length, new Set(ids).size, `${territory.id}: unique families`);
    for (const family of families.filter(f => familyAtScope(f, territoryFamilyScope(territory)))) {
      assert.ok(ids.includes(family.id), `${territory.id}/${family.id}: every local house`);
    }
    for (const field of ['article','councilGroups','vassalGroups','geography','administration']) assert.equal(next.view[field], old.view[field], `${territory.id}/${field}`);
  }
});

test('all projected local crests and direct house destinations exist', () => {
  const problems = [];
  const seen = new Set();
  for (const [pages, kind] of [[places,'places'], [territories,'territories']]) for (const page of pages) {
    const projected = projectHouseDirectories(page.content, page.id, kind);
    for (const group of projected?.houses || projected?.view?.familySections || []) for (const card of group.items || group.cards || []) {
      for (const value of [card.emblem || card.imageSrc, card.href]) {
        if (!value || /^(?:https?:)?\/\//.test(value) || !value.startsWith('/') || seen.has(value)) continue;
        seen.add(value);
        const url = new URL('.' + value, root); url.search = ''; url.hash = '';
        if (!fs.existsSync(url)) problems.push({ page: page.id, value });
      }
    }
  }
  assert.deepEqual(problems, []);
});

test('direct house and family links identify real records instead of merely existing HTML templates', () => {
  const context = { window: {} };
  vm.runInNewContext(fs.readFileSync(new URL('Familien Häuser und Clans/haeuser.registry.js',root),'utf8'),context);
  const problems = [], seen = new Set();
  for (const [pages,kind] of [[places,'places'],[territories,'territories']]) for (const page of pages) {
    const data = projectHouseDirectories(page.content,page.id,kind);
    for (const group of data?.houses || data?.view?.familySections || []) for (const card of group.items || group.cards || []) {
      if (!card.href || seen.has(card.href)) continue;
      seen.add(card.href);
      const url = new URL(card.href,'https://aleria.local/');
      if (url.hostname !== 'aleria.local') continue;
      const houseId = url.searchParams.get('haus'), familyId = url.searchParams.get('family');
      if (houseId && !context.window.HaeuserRegistry.byId(houseId)) problems.push({page:page.id,houseId});
      if (familyId && !getRegisteredFamily(familyId)) problems.push({page:page.id,familyId});
    }
  }
  assert.deepEqual(problems,[]);
});
test('registered house data files exist, load independently, and identify their requested house', () => {
  assert.ok(houses.length >= 600);
  const problems = [];
  for (const house of houses) {
    if (!house.data) continue;
    const url = new URL(house.data, new URL('Familien Häuser und Clans/', root));
    url.search = '';
    if (!fs.existsSync(url)) { problems.push(`${house.id}: missing data`); continue; }
    const context = { window: {} };
    try {
      vm.runInNewContext(fs.readFileSync(url, 'utf8'), context);
      const id = context.window.HAEUSER_DATA?.meta?.id;
      if (!id) problems.push(`${house.id}: missing house identity`);
      else if (![house.id, house.docId, ...(house.aliases || [])].includes(id)) problems.push(`${house.id}: data identifies ${id}`);
    } catch (error) { problems.push(`${house.id}: ${error.message}`); }
  }
  assert.deepEqual(problems, []);
});
