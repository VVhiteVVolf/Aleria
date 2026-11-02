import { readFile } from 'node:fs/promises';
import { openVenueBrowserPreview } from '../../AleriaAlmanach/tests/support/venue-browser-preview.mjs';
const { characters } = JSON.parse(await readFile(new URL('characters-prepared.json', import.meta.url), 'utf8'));
const preview = await openVenueBrowserPreview('knight-equipment-link-debug');
const { page } = preview;
try {
 await page.evaluate(characters => { _characters = structuredClone(characters); openCharProfile(characters[0].id); switchCharTab('inventory'); }, characters);
 const inspect = () => page.evaluate(() => ({ editing: _editingChar, name: document.getElementById('cp-name').value,
  inventoryCharacterId: getCharacterInventoryPageData(document.querySelector('.character-inventory-page')).characterId,
  inventoryDraftId: collectCharacterInventoryProfileData().characterId,
  active: document.querySelector('.char-tab-panel.active')?.id,
  profileItems: Array.from(document.querySelectorAll('#cp-combat-sheet-root [data-combat-property="name"]')).map(i => [i.dataset.combatCollection, i.dataset.combatItemId, i.value]) }));
 console.log('BEFORE', JSON.stringify(await inspect()));
 await page.locator('[data-ci-action="show-item"][data-ci-item-id="caralyn-chwedlonol-chwedonol-dreizack-2"]').first().click();
 await page.locator('dialog[open] [data-ci-action="open-item-sheet"]').click();
 console.log('AFTER', JSON.stringify(await inspect()));
} finally { await preview.close(); }
