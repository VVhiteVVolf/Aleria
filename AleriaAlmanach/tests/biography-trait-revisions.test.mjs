import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { DEVELOPMENT_TRAITS } from '../modules/character-development/development-traits.js';
import { PREVIOUS_DEVELOPMENT_TRAITS } from '../modules/character-development/development-trait-revision-source.js';
import { DEVELOPMENT_TRAIT_BIOGRAPHY_REVISIONS, reviseDevelopmentTraitBiographyCards, reviseDevelopmentTraitBiography } from '../modules/character-development/development-trait-biography-revisions.js';
import '../modules/biography/biography-card-rendering.js';
import '../../js/biography/public-biographies.generated.js';

const oldCuriosity = PREVIOUS_DEVELOPMENT_TRAITS.find(trait => trait.id === 'development-trait-neugier-vor-vorsicht');
const curiosity = DEVELOPMENT_TRAITS.find(trait => trait.id === oldCuriosity.id);
const oldCard = () => ({ title: oldCuriosity.name, detail: oldCuriosity.description, icon: oldCuriosity.icon });
const catalog = globalThis.AleriaBiographyCatalog;

test('exact old trait biography cards receive the current description through a pure revision', () => {
  const cards = [oldCard()], before = structuredClone(cards);
  const revised = reviseDevelopmentTraitBiographyCards(cards);
  assert.equal(revised[0].detail, curiosity.description);
  assert.match(revised[0].detail, /\+1 auf Nachforschungen, −1 auf GES-Rettungswürfe/);
  assert.equal(revised[0].title, cards[0].title);
  assert.equal(revised[0].icon, cards[0].icon);
  assert.deepEqual(cards, before);
  assert.equal(reviseDevelopmentTraitBiographyCards(revised), revised);
  for (const previous of DEVELOPMENT_TRAIT_BIOGRAPHY_REVISIONS) {
    const revised = reviseDevelopmentTraitBiographyCards([{ title: previous.title, detail: previous.detail, icon: previous.icon }]);
    assert.equal(revised[0].detail, previous.revisedDetail, previous.title);
  }
});

test('personal prose, card descriptions, titles and icons remain unchanged', () => {
  const cards = [
    { ...oldCard(), detail: `${oldCuriosity.description} Eigene persönliche Einschränkung.` },
    { ...oldCard(), icon: '/persoenliches-bild.png' },
    { ...oldCard(), title: 'Meine Neugier' },
    { title: 'Neugierig', detail: 'Gawain stellt lieber eine Frage zu viel.', icon: oldCuriosity.icon }
  ];
  const biography = { abilities: cards, biographyText: '<p>Unveränderte persönliche Geschichte.</p>', historyText: 'Neugier +3 ist hier ein Originalzitat.' };
  assert.equal(reviseDevelopmentTraitBiography(biography), biography);
  const stored = { biography };
  const resolved = catalog.resolve(stored, { characterId: 'unbekannte-persoenliche-figur' });
  assert.equal(resolved, stored);
  assert.deepEqual(resolved.biography.abilities, cards);
});

test('Gawain public defaults display the current curiosity rule while the authored source stays original', async () => {
  const { entries } = JSON.parse(await readFile(new URL('../../js/biography/sources/public-biographies.json', import.meta.url), 'utf8'));
  const row = entries.find(entry => entry.key === 'person--haus-draig--gawain-draig');
  assert.deepEqual(row.biography.biography.abilities.find(card => card.title === oldCuriosity.name), oldCard());
  const resolved = catalog.resolve(null, { worldPersonId: row.worldPersonIds[0] });
  assert.equal(resolved.biography.abilities.find(card => card.title === curiosity.name).detail, curiosity.description);
});

test('canonical stored Gawain cards resolve to current rules without rewriting database sources', async () => {
  const record = JSON.parse(await readFile(new URL('../../CharakterDatenbank/records/familien/haus-draig/gawain-draig--q1QtSIug74FzzwUAqWrs/character.json', import.meta.url), 'utf8'));
  const stored = record.character.biography, before = structuredClone(stored);
  assert.deepEqual(stored.biography.abilities.find(card => card.title === oldCuriosity.name), oldCard());
  const resolved = catalog.resolve(stored, { characterId: record.character.id });
  assert.equal(resolved.biography.abilities.find(card => card.title === curiosity.name).detail, curiosity.description);
  assert.deepEqual(stored, before);
});

test('module biography cards use the same exact revision even without an editorial person mapping', () => {
  const page = { pageTitle: 'Eigene Bio', description: 'Persönliche Prosa.', biography: { abilities: [oldCard()], historyText: 'Eigene Geschichte' } };
  const before = structuredClone(page);
  const resolved = catalog.resolveModule(page, 'unbekanntes-modul');
  assert.equal(resolved.biography.abilities[0].detail, curiosity.description);
  assert.equal(resolved.biography.historyText, page.biography.historyText);
  assert.equal(resolved.description, page.description);
  assert.deepEqual(page, before);
});
