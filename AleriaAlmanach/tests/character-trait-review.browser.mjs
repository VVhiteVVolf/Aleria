import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { openVenueBrowserPreview } from './support/venue-browser-preview.mjs';
import { REVIEWED_CHARACTER_TRAITS } from '../modules/character-trait-review/reviewed-character-traits.js';
const { characters } = JSON.parse(await readFile(new URL('../../CharakterDatenbank/generated/characters.snapshot.json', import.meta.url), 'utf8'));
const { profiles: baseline } = JSON.parse(await readFile(new URL('../../diagnostics/character-trait-review-20261102/local-before.json', import.meta.url), 'utf8'));
const checkout = process.argv.find(arg => arg.startsWith('--checkout='))?.slice(11);
const preview = await openVenueBrowserPreview('character-trait-review-20261102', { root: checkout });
const { page } = preview;
const rows = [];
try {
  await page.setViewportSize({ width: 1440, height: 1000 });
  for (const selection of REVIEWED_CHARACTER_TRAITS) {
    const character = characters.find(row => row.id === selection.id);
    await page.evaluate(character => { closeCharProfile(); openCharProfile(null); switchCharTab('combat'); AleriaCharacterCombatProfile.init(character); }, baseline.find(row => row.id === selection.id).character);
    const original = await page.evaluate(() => AleriaCharacterCombatProfile.collect());
    await page.evaluate(character => { closeCharProfile(); openCharProfile(null); switchCharTab('combat'); AleriaCharacterCombatProfile.init(character); }, character);
    await page.locator('[data-sheet-page="traits"]').click();
    const stored = await page.evaluate(() => AleriaCharacterCombatProfile.collect());
    assert.deepEqual(stored.quirks.map(row => row.id), selection.traits.map(id => `development-trait-${id}`), selection.name);
    assert.equal(stored.progression.level, character.combatProfile.progression.level);
    assert.equal(stored.hitPoints.current, character.combatProfile.hitPoints.current);
    assert.deepEqual(stored.resources, original.resources);
    const section = page.locator('.cp-sheet-presentation-cards').filter({ has: page.locator('[data-combat-action="add-detail-item"][data-combat-collection="quirks"]') });
    assert.equal(await section.locator('.cp-entry-card').count(), selection.traits.length, selection.name);
    await preview.decodeImages('.cp-sheet-presentation-cards .cp-entry-card-icon img');
    if (selection.name === 'Freya Skald') {
      await section.scrollIntoViewIfNeeded(); await preview.capture('freya-traits-desktop');
      await page.setViewportSize({ width: 390, height: 844 });
      const bounds = await section.evaluate(el => ({ width: el.clientWidth, scroll: el.scrollWidth }));
      assert.ok(bounds.scroll <= bounds.width + 2);
      await section.scrollIntoViewIfNeeded(); await preview.capture('freya-traits-phone');
      await page.setViewportSize({ width: 1440, height: 1000 });
    }
    rows.push({ name: selection.name, traits: stored.quirks.map(row => row.name), level: stored.progression.level });
    console.log(JSON.stringify({ reviewed: selection.name, traits: selection.traits.length }));
  }
  for (const name of ['Freya Skald', 'Gawain Draig', 'Gildas Gafyr', 'Nudd Saethwyr', 'Gais Wyrm']) {
    const selection = REVIEWED_CHARACTER_TRAITS.find(row => row.name === name), character = characters.find(row => row.id === selection.id);
    const biography = await page.evaluate(character => AleriaBiographyCatalog.resolve(character.biography, { characterId: character.id, worldPersonId: character.identity?.worldPersonId }), character);
    assert.equal(biography.biography.abilities.length, selection.traits.length, name);
    await page.evaluate(() => closeCharProfile());
    await preview.openPage({ id: 'trait-bio-qa', title: name, multipage: true, pages: [{ biographyPage: true, ...biography }] }, 0);
    await preview.decodeImages('#modal-overlay img[src*="development-traits/"]');
    if (name === 'Freya Skald') await preview.capture('freya-biography-desktop');
    await page.evaluate(() => closeModal());
  }
  assert.deepEqual(preview.errors, []);
  await writeFile(resolve(preview.output, 'report.json'), JSON.stringify({ passed: true, reviewed: rows, matchingBiographies: 5, iconsDecoded: true, externalWritesBlocked: true, errors: preview.errors }, null, 2) + '\n');
  console.log(JSON.stringify({ passed: true, output: preview.output }));
} catch (error) { await preview.capture('failure'); throw error; }
finally { await preview.close(); }
