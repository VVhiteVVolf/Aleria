import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { ylvaGuide } from '../modules/ylva-guide.mjs';
import { gaisGuide } from '../modules/gais-guide.mjs';
import { buildGuideModel } from '../modules/guide-model.mjs';
import { renderGuide } from '../modules/guide-template.mjs';
import { getCharacterGameplayGuide } from '../../AleriaAlmanach/modules/characters/gameplay-guide-link.js';
import { GAIS_COMPANION } from '../../AleriaAlmanach/modules/creatures/catalog/gais-companion.js';
import { sanitizeCreature } from '../../AleriaAlmanach/modules/creatures/creature-model.js';
import { planGameplayGuideRelease } from '../../firebase/functions/scripts/gameplay-guide-release-model.mjs';
import { loadHorseBreedingData } from '../../Bestiarium/modules/horse-breeding/horse-breeding-data.mjs';
const root = new URL('../../', import.meta.url);
const { characters } = JSON.parse(await readFile(new URL('CharakterDatenbank/generated/characters.snapshot.json', root), 'utf8'));

for (const g of [ylvaGuide, gaisGuide]) test(`${g.name}: legal action budgets, existing techniques, owned companions and working local links`, async () => {
  const character = characters.find(c => c.id === g.id);
  const model = buildGuideModel(g, character);
  assert.equal(model.combos.length, 6);
  assert.equal(getCharacterGameplayGuide(character), `/Gameplay%20Guide/${g.slug}.html`);
  const html = renderGuide(model);
  assert.ok(html.includes('data-action="filter-style"')); assert.ok(!html.includes('onclick='));
  for (const match of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
    if (/^(#|https?:)/.test(match[1])) continue;
    const path = decodeURIComponent(match[1].split('#')[0]);
    const base = path.startsWith('/') ? root : new URL('Gameplay%20Guide/', root);
    await access(new URL(path.replace(/^\//, ''), base));
  }
  assert.equal(planGameplayGuideRelease(character), null, 'Repeated preparation must be a no-op');
});

test('Edelsale is the existing matrix crossing, Saithor has a real anchored reference and owner', async () => {
  const data = await loadHorseBreedingData();
  const matches = data.crossings.filter(c => [c.mareId, c.sireId].sort().join('|') === 'ceffyl|sale');
  assert.equal(matches.length, 1); assert.equal(matches[0].name, 'Edelsale'); assert.equal(matches[0].bestiaryId, 'edelsale');
  const c = sanitizeCreature(GAIS_COMPANION);
  assert.equal(c.bestiaryReference.name, 'Edelsale'); assert.ok(c.bestiaryReference.url.includes('#'));
  assert.equal(c.level, 3); assert.equal(c.itemOrigin.ownerCharacterId, gaisGuide.id);
  assert.equal(getCharacterGameplayGuide({ id: 'another-character', name: 'Gais Wyrm' }), '');
});

test('grant only patches personal techniques, new companion and the horse biography; Gais combat remains intact', () => {
  const source = structuredClone(characters.find(c => c.id === gaisGuide.id));
  source.inventory.items = source.inventory.items.filter(i => i.creatureId !== GAIS_COMPANION.id);
  source.inventory.companions = source.inventory.companions.filter(i => i.creatureId !== GAIS_COMPANION.id);
  const before = structuredClone(source);
  const patch = planGameplayGuideRelease(source);
  assert.deepEqual(source, before); assert.ok(patch.inventory);
  assert.ok(Object.keys(patch).every(k => ['inventory','biography'].includes(k)));
  for (const item of before.inventory.items) assert.deepEqual(patch.inventory.items.find(i => i.id === item.id), item);
});
