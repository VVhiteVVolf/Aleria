import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { projectGawainDuncanSources } from '../scripts/build-gawain-duncan-content.mjs';
import { GAWAIN_ID } from '../modules/gawain-duncan/gawain-public-biography.mjs';
import { reviewedCharacterTraitAssignment } from '../modules/character-trait-review/reviewed-character-traits.js';
import { PREVIOUS_DEVELOPMENT_TRAITS } from '../modules/character-development/development-trait-revision-source.js';

const source = JSON.parse(await readFile(new URL('../modules/gawain-duncan/source/gawain-duncan-online-2026-11-01.json', import.meta.url), 'utf8'));
const moduleBody = data => data.entry.pages.find(page => page.commentThreadKey === '1' && page.biographyPage).biography;
const exportBody = data => data.character.biography.biography;
const previousCards = reviewedCharacterTraitAssignment(GAWAIN_ID).traits.map(id => {
  const trait = PREVIOUS_DEVELOPMENT_TRAITS.find(row => row.id === `development-trait-${id}`);
  return { title: trait.name, detail: trait.description, icon: trait.icon };
});
const project = (module, exported) => projectGawainDuncanSources(source, module, exported).map(([, data]) => data);

test('public source generation is pure and replaces the obsolete six-card projection', () => {
  const sourceBefore = structuredClone(source), [module, exported] = project();
  const oldModule = structuredClone(module);
  moduleBody(oldModule).abilitiesTitle = 'Legacy heading';
  moduleBody(oldModule).abilities = Array.from({ length: 6 }, (_, index) => ({ title: `Legacy ${index}`, detail: 'Old source' }));
  const oldBefore = structuredClone(oldModule);
  assert.deepEqual(project(oldModule, exported), [module, exported]);
  assert.equal(moduleBody(module).abilities.length, 2);
  assert.deepEqual(source, sourceBefore);
  assert.deepEqual(oldModule, oldBefore);
});

test('complete approved current, historical and mixed cards survive generation and replay', () => {
  const [canonicalModule, canonicalExport] = project();
  const currentCards = exportBody(canonicalExport).abilities;
  assert.notDeepEqual(currentCards, previousCards, 'Exercise a real catalog revision');
  for (const mask of [0, 1, 2, 3]) {
    const cards = currentCards.map((card, index) => structuredClone(mask & (1 << index) ? card : previousCards[index]));
    const module = structuredClone(canonicalModule), exported = structuredClone(canonicalExport);
    moduleBody(module).abilities = structuredClone(cards);
    exportBody(exported).abilities = structuredClone(cards);
    const before = structuredClone([module, exported]);
    const result = project(module, exported);
    assert.deepEqual(moduleBody(result[0]).abilities, cards);
    assert.deepEqual(exportBody(result[1]).abilities, cards);
    assert.deepEqual(project(...result), result, 'The same artifacts are idempotent');
    assert.deepEqual([module, exported], before);
  }
});

test('unapproved card fields and another identity cannot become preserved generated sources', () => {
  const canonical = project();
  for (const mutate of [
    cards => { cards[0].title += ' Unapproved'; },
    cards => { cards[0].detail += ' Unapproved'; },
    cards => { cards[0].icon = 'unapproved.png'; },
    cards => { cards[0].cost = 0; },
    cards => { cards[0].mechanics = { skillModifiers: { sword: 1 } }; },
    cards => { cards.reverse(); },
    cards => { cards.pop(); },
  ]) {
    const [module, exported] = structuredClone(canonical);
    moduleBody(module).abilities = structuredClone(previousCards);
    exportBody(exported).abilities = structuredClone(previousCards);
    mutate(moduleBody(module).abilities);
    mutate(exportBody(exported).abilities);
    assert.deepEqual(project(module, exported), canonical);
  }
  const [module, exported] = structuredClone(canonical);
  module.entry.id = 'another-module';
  exported.character.id = 'another-person';
  moduleBody(module).abilities = structuredClone(previousCards);
  exportBody(exported).abilities = structuredClone(previousCards);
  assert.deepEqual(project(module, exported), canonical);
});

test('card preservation never imports previous prose or live gameplay fields', () => {
  const canonical = project(), [module, exported] = structuredClone(canonical);
  exported.character.bio = 'Unapproved replacement';
  exported.character.inventory = { items: [{ id: 'unapproved-import' }] };
  exported.character.combatProfile = { hitPoints: { current: 1 } };
  module.entry.unapproved = true;
  const before = structuredClone([module, exported]);
  assert.deepEqual(project(module, exported), canonical);
  assert.deepEqual([module, exported], before);
});
