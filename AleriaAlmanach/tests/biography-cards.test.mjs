import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { normalizeCreatureBiography } from '../modules/creatures/creature-biography-model.js';
import { updateCreatureBiographyCards } from '../modules/creatures/creature-biography-card-editor.js';
import { createCreatureDraft, createCreatureDuplicate, makeCreatureExportPayload, normalizeCreatureImportPayload } from '../modules/creatures/creature-model.js';

test('structured biography cards survive export and duplication alongside legacy narrative', () => {
  const creature = createCreatureDraft({ name: 'Torwächter', biography: {
    schemaVersion: 1, revision: 71, personality: 'Gebunden an seinen Eid.', bonds: 'Das alte Tor.',
    quote: 'Ich wache.', quoteBy: 'Inschrift',
    traitsTitle: 'Wesenszüge', traits: [{ icon: './IconOrdner/wache.png', title: 'Wachsam', detail: 'Ruht niemals.' }],
    connectionsTitle: 'Anker', connections: [
      { type: 'heading', title: 'Vergangenheit', detail: 'Vor dem Erwachen' },
      { name: 'Erschaffer', image: './portraits/mage.png', imageFormat: 'square', detail: 'Ein alter Magier.' },
      { name: 'Tor', icon: '✦', detail: 'Sein gebundener Ort.' }
    ]
  } });
  const [restored] = normalizeCreatureImportPayload(makeCreatureExportPayload(creature));
  assert.equal(restored.biography.schemaVersion, 2);
  assert.equal(restored.biography.revision, 71);
  assert.deepEqual(restored.biography, creature.biography);
  assert.deepEqual(createCreatureDuplicate(creature).biography, creature.biography);
  assert.deepEqual(restored.combatProfile, creature.combatProfile);
  assert.deepEqual(restored.loot, creature.loot);
  assert.deepEqual(normalizeCreatureBiography({ traits: [], connections: [] }).traits, []);
  assert.deepEqual(normalizeCreatureBiography({ schemaVersion: 1, personality: 'Alt' }).connections, []);
});

test('card ordering and removal respect their own collection and its boundaries', () => {
  const biography = normalizeCreatureBiography({ traits: [{ title: 'A' }, { title: 'B' }], connections: [{ name: 'Ort' }] });
  const trigger = (action, collection = 'traits', index = 0, direction = -1) => ({
    dataset: { creatureBiographyAction: action, direction },
    closest: () => ({ dataset: { creatureBiographyRow: collection, index } })
  });
  assert.equal(updateCreatureBiographyCards(biography, trigger('move-card')), false);
  assert.equal(updateCreatureBiographyCards(biography, trigger('move-card', 'traits', 0, 1)), true);
  assert.deepEqual(biography.traits.map(row => row.title), ['B', 'A']);
  updateCreatureBiographyCards(biography, trigger('remove-card', 'traits', 1));
  assert.deepEqual(biography.traits.map(row => row.title), ['B']);
  assert.equal(biography.connections[0].name, 'Ort');
  assert.equal(updateCreatureBiographyCards(biography, trigger('remove-card', '__proto__')), false);
  assert.equal(updateCreatureBiographyCards(biography, trigger('remove-card', 'traits', -1)), false);
});

test('character and creature cards share safe image, symbol and connection rendering', async () => {
  const context = vm.createContext({ URL, window: { location: { href: 'https://aleria.example/' } }, document: { addEventListener() {} } });
  for (const path of ['core/content-safety.js', 'biography/biography-card-rendering.js', 'rendering/module-renderer.js']) {
    vm.runInContext(await readFile(new URL(`../modules/${path}`, import.meta.url), 'utf8'), context);
  }
  const cards = context.AleriaBiographyCards;
  const presentation = { escape: context.escapeHtml, imageSource: context.sanitizeImageSrc };
  const trait = { icon: './icons/eye.png', title: 'Wachsam <script>', detail: 'Sieht & hört.' };
  const html = cards.renderTrait(trait, presentation);
  assert.ok(html.includes('<img src="./icons/eye.png"'));
  assert.ok(html.includes('Wachsam &lt;script&gt;'));
  assert.ok(html.includes('Sieht &amp; hört.'));
  assert.equal(context.buildBiographyTraitList([trait]), `<div class="biography-ability-list">${html}</div>`);
  const connection = { name: 'Idwal', image: 'https://example.org/idwal.png?a=1&b=2', imageFormat: 'square', detail: 'Begleiter' };
  assert.equal(context.buildBiographyConnectionItem(connection), cards.renderConnection(connection, presentation));
  assert.ok(cards.renderConnection(connection, presentation).includes('idwal.png?a=1&amp;b=2'));
  assert.ok(cards.renderConnection({ name: 'Tor', icon: '✦' }, presentation).includes('>✦</div>'));
  assert.ok(cards.renderConnection({ name: '<', image: 'javascript:alert(1)' }, presentation).includes('&lt;</div>'));
  assert.ok(!cards.renderConnection({ name: 'Tor', image: 'javascript:alert(1)' }, presentation).includes('<img'));
  assert.ok(cards.renderConnection({ type: 'heading', title: 'Rudel', detail: 'Vertraute' }, presentation).includes('biography-connection-heading'));
  assert.equal(context.renderBiographyAbilityIcon('🐾'), '🐾');
});
