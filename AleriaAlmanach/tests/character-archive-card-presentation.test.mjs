import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { CHARACTER_CULTURAL_ORIGINS } from '../modules/character-origins/cultural-origin-catalog.js';
import { COMBAT_ATTRIBUTE_DEFINITIONS } from '../modules/combat/combat-profile-model.js';
import { COMBAT_ACTIVATION_TYPES } from '../modules/combat/combat-action-economy.js';
import { getCharacterArchiveEntryMeta } from '../modules/character-archive/character-archive-entry-meta.js';
import { getCharacterArchiveOriginLinks } from '../modules/character-archive/character-archive-origin-presentation.js';
import { renderEntryMeta, renderEntryReferenceLinks } from '../modules/character-archive/character-archive-view.js';

const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const entry = origin => ({ kind: 'ancestry', name: origin.label, data: structuredClone(origin) });

test('every cultural archive card exposes its actual attribute bonuses and three explicit skill suggestions', () => {
  for (const origin of CHARACTER_CULTURAL_ORIGINS) {
    const value = entry(origin), before = structuredClone(value);
    const html = renderEntryMeta(getCharacterArchiveEntryMeta(value), escape);
    for (const [key, amount] of Object.entries(origin.attributeBonuses)) {
      const label = COMBAT_ATTRIBUTE_DEFINITIONS.find(attribute => attribute.key === key).label;
      assert.ok(html.includes(`${label} +${amount}`), origin.id);
    }
    assert.match(html, /Fertigkeitsvorschläge:/, origin.id);
    for (const skill of origin.skillProficiencies) assert.ok(html.includes(escape(skill)), `${origin.id}: ${skill}`);
    assert.deepEqual(value, before);
  }
});

test('origin links use only confirmed catalog destinations and ignore edited or malicious archive URLs', () => {
  for (const origin of CHARACTER_CULTURAL_ORIGINS) {
    const value = entry(origin);
    value.data.pagePath = 'javascript:alert(1)';
    value.data.sourcePaths = ['https://untrusted.example/'];
    const links = getCharacterArchiveOriginLinks(value);
    assert.deepEqual(links, [{ href: `..${origin.pagePath}`, label: 'Zur Herkunftsseite ↗' }]);
    const html = renderEntryReferenceLinks(links, escape);
    assert.ok(html.includes(`href="${escape(`..${origin.pagePath}`)}"`), origin.id);
    assert.match(html, /target="_blank" rel="noopener"/);
    assert.doesNotMatch(html, /javascript|untrusted/);
  }
  assert.deepEqual(getCharacterArchiveOriginLinks({ kind: 'ancestry', name: 'Unbekannte Herkunft', data: { pagePath: '/invented/' } }), []);
  assert.deepEqual(getCharacterArchiveOriginLinks({ kind: 'ability', name: 'Venalier', data: { id: 'venalys' } }), []);
  assert.equal(getCharacterArchiveOriginLinks({ kind: 'ancestry', name: 'Cenyri' })[0].href, `..${CHARACTER_CULTURAL_ORIGINS.find(origin => origin.id === 'cenyr').pagePath}`);
});

test('Freya ability cards show regular action names and omit none without changing costs or recovery data', async () => {
  const library = JSON.parse(await readFile(new URL('../data/spell-attack-library.json', import.meta.url), 'utf8'));
  const ability = library.allTechniques.find(value => value.id === 'freya-arkaner-schrei');
  assert.ok(ability);
  const before = structuredClone(ability);
  const meta = getCharacterArchiveEntryMeta({ kind: 'ability', data: ability });
  const html = renderEntryMeta(meta, escape);
  assert.match(html, /Besondere Aktion/);
  assert.doesNotMatch(html, /special-action|none/);
  assert.deepEqual(ability, before);
  for (const activation of COMBAT_ACTIVATION_TYPES) {
    assert.deepEqual(getCharacterArchiveEntryMeta({ kind: 'ability', data: { activationType: activation.id, recovery: 'none' } }), [activation.label]);
  }
  assert.deepEqual(getCharacterArchiveEntryMeta({ kind: 'ability', data: { activationType: 'reaction', recovery: 'long-rest' } }), ['Reaktion', 'Lange Rast']);
});

test('metadata rendering escapes edited text and preserves existing spell and weapon badges', () => {
  const value = { kind: 'ancestry', data: { skillProficiencies: ['<img src=x onerror=alert(1)>'] } };
  assert.doesNotMatch(renderEntryMeta(getCharacterArchiveEntryMeta(value), escape), /<img/);
  assert.deepEqual(getCharacterArchiveEntryMeta({ kind: 'spell', data: { level: 2, school: 'Feuer' } }), ['Grad 2', 'Feuer']);
  assert.deepEqual(getCharacterArchiveEntryMeta({ kind: 'attack', data: { weaponType: 'sword', damageFormula: '1d8', damageType: 'Hieb' } }), ['sword', '1D8', 'Hieb']);
  assert.equal(renderEntryMeta([], escape), '');
});
