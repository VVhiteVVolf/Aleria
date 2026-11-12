import assert from 'node:assert/strict';
import test from 'node:test';
import { access, readFile } from 'node:fs/promises';
import { BRONA_CHARACTER_ID, BRONA_PERSONALITY_ICONS, decorateBronaBiography } from '../modules/brona-biography/brona-biography-icons.mjs';
import { parseBiographyImportPayload } from '../../js/biography/biography-transfer.mjs';
import { sanitizeCharacterBiographyForFirestore } from '../modules/characters/character-save-guard.js';

const source = JSON.parse(await readFile(new URL('../modules/brona-biography/source/brona-eisenherz-biographie-20261108.json', import.meta.url), 'utf8'));

function onlineCharacter() {
  const biography = sanitizeCharacterBiographyForFirestore({ biography: parseBiographyImportPayload(source) }).biography;
  biography.biography.portrait = '';
  return { id: BRONA_CHARACTER_ID, name: 'Brona Eisenherz', portrait: 'https://example.org/current-brona.png',
    biography, inventory: { revision: 19, money: { gold: 3 }, items: [] }, combatProfile: { revision: 23 } };
}

test('Brona receives twelve existing image icons while retaining all live biography content and unrelated character fields', async () => {
  const current = onlineCharacter();
  current.biography.editorMetadata = { retained: true };
  const original = structuredClone(current), originalSource = structuredClone(source);
  const biography = decorateBronaBiography(current, source);
  const expected = structuredClone(current.biography);
  expected.biography.abilities = expected.biography.abilities.map(ability => ({ ...ability, icon: BRONA_PERSONALITY_ICONS[ability.title] }));
  expected.biography.portrait = current.portrait;
  assert.deepEqual(biography, expected);
  assert.equal(biography.biography.abilities.length, 12);
  assert.equal(new Set(biography.biography.abilities.map(ability => ability.icon)).size, 12);
  for (const ability of biography.biography.abilities) {
    assert(!['*', '✦', ''].includes(ability.icon));
    await access(new URL('../../' + decodeURI(ability.icon).slice(1), import.meta.url));
  }
  assert.deepEqual(current, original);
  assert.deepEqual(source, originalSource);
  assert(!Object.hasOwn(biography, 'inventory'));
  assert(!Object.hasOwn(biography, 'combatProfile'));
  assert.deepEqual(decorateBronaBiography({ ...current, biography }, source), biography);
});

test('Brona retains an existing live layout portrait and never restores the exported portrait over it', () => {
  const current = onlineCharacter();
  current.biography.biography.portrait = 'https://example.org/edited-layout-portrait.png';
  const result = decorateBronaBiography(current, source);
  assert.equal(result.biography.portrait, current.biography.biography.portrait);
  current.biography.biography.portrait = '';
  current.portrait = '';
  assert.equal(decorateBronaBiography(current, source).biography.portrait, '');
});

test('Brona identity checks reject a different source, a same-name different character, and a missing live biography', () => {
  assert.throws(() => decorateBronaBiography({ ...onlineCharacter(), id: 'other-brona' }, source), /Onlineakte gehört nicht/);
  assert.throws(() => decorateBronaBiography(onlineCharacter(), { ...source, personId: 'other-brona' }), /Biografiequelle gehört nicht/);
  assert.throws(() => decorateBronaBiography(onlineCharacter(), { ...source, personId: undefined, characterId: BRONA_CHARACTER_ID }), /Biografiequelle gehört nicht/);
  assert.throws(() => decorateBronaBiography({ id: BRONA_CHARACTER_ID }, source), /gültige Biographie/);
});

test('Brona rejects missing, duplicate, reordered or unfamiliar personality entries instead of assigning an undefined icon', () => {
  for (const mutate of [
    abilities => abilities.pop(),
    abilities => { abilities[1].title = abilities[0].title; },
    abilities => abilities.reverse(),
    abilities => { abilities[0].title = 'Ungeprüft'; }
  ]) {
    const changedSource = structuredClone(source);
    mutate(changedSource.biographyModule.biography.abilities);
    assert.throws(() => decorateBronaBiography(onlineCharacter(), changedSource), /zwölf geprüften Persönlichkeitseinträge/);
    const current = onlineCharacter();
    mutate(current.biography.biography.abilities);
    assert.throws(() => decorateBronaBiography(current, source), /zwölf geprüften Persönlichkeitseinträge/);
  }
});

test('Brona refuses stale narrative, detail, date, layout and icon changes without mutating the live state', () => {
  for (const mutate of [
    current => { current.biography.biography.biographyText += '<p>Neu online.</p>'; },
    current => { current.biography.biography.abilities[0].detail += ' Neu online.'; },
    current => { current.biography.stats.find(row => row.label === 'Geboren').value = '1701'; },
    current => { current.biography.biography.sideWidth = 85; },
    current => { current.biography.biography.abilities[0].icon = '/custom-live-icon.png'; }
  ]) {
    const current = onlineCharacter();
    mutate(current);
    const before = structuredClone(current);
    assert.throws(() => decorateBronaBiography(current, source), /weicht von der geprüften Quelle ab|zwischenzeitlich geändert/);
    assert.deepEqual(current, before);
  }
});
