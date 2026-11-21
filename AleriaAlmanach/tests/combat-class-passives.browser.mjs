import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { openVenueBrowserPreview } from './support/venue-browser-preview.mjs';

const { characters } = JSON.parse(await readFile(
  new URL('../../CharakterDatenbank/generated/characters.snapshot.json', import.meta.url), 'utf8'));
const preview = await openVenueBrowserPreview('class-passives-20261121', { localOnly: true });
const { page } = preview;

try {
  const gawain = characters.find(character => character.name === 'Gawain Draig');
  const nudd = characters.find(character => character.name === 'Nudd Saethwyr');
  assert.ok(gawain && nudd);
  const openSheet = async character => {
    await page.evaluate(record => {
      openCharProfile(null);
      switchCharTab('combat');
      AleriaCharacterCombatProfile.init(record);
    }, character);
    const drawer = page.locator('[data-sheet-disclosure="progression"]');
    if (!await drawer.evaluate(element => element.open)) await drawer.locator(':scope > summary').click();
    const panel = drawer.locator('[data-combat-class-passives]');
    if (!await panel.evaluate(element => element.open)) await panel.locator(':scope > summary').click();
    return panel;
  };
  for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }, { width: 320, height: 720 }]) {
    await page.setViewportSize(viewport);
    const panel = await openSheet(viewport.width === 1440 ? gawain : nudd);
    assert.equal(await panel.locator('li').count(), 1);
    assert.match(await panel.innerText(), viewport.width === 1440 ? /Schwertgriff/ : /Stand hinter der Spitze/);
    assert.ok(await panel.evaluate(element => element.scrollWidth <= element.clientWidth + 2));
    await panel.scrollIntoViewIfNeeded();
    await preview.capture(`kampfbogen-${viewport.width}`);
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  const candidate = structuredClone(gawain);
  Object.assign(candidate.combatProfile.progression, { level: 20, specialLevels: 10 });
  const veteran = await openSheet(candidate);
  assert.equal(await veteran.locator('li').count(), 8);
  assert.match(await veteran.innerText(), /Vollendete Schwertfolge/);
  const formulas = await page.evaluate(() => AleriaCharacterCombatProfile.collect().progression);
  assert.equal(formulas.specialLevels, 10);
  await page.locator('[data-sheet-page="arsenal"]').click();
  const technique = page.locator('#cs-page-arsenal').getByText('Sicherer Drachenhieb', { exact: true }).first();
  await technique.click();
  const damage = page.locator('[data-sheet-entry="techniques:combat-style-drachentanz-jungdrache-sicherer-drachenhieb"] .cp-entry-mechanics-note').first();
  assert.match(await damage.innerText(), /1W8\+1W10\+1W6/);
  await damage.scrollIntoViewIfNeeded();
  await preview.capture('jungdrache-gesamtstufe-30');

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${preview.origin}/Klassenordner/Vennyr/derwyn/index.html`);
  const levels = page.locator('details.cenyr-level-table');
  await levels.locator('summary').click();
  assert.match(await levels.locator('[data-training-row="20"]').innerText(), /Meisterschaft der erlernten Form/);
  await levels.locator('[data-training-row="20"] td').last().scrollIntoViewIfNeeded();
  await preview.capture('derwyn-stufenplan-390');
  assert.deepEqual(preview.errors.filter(error => /does not provide an export|ReferenceError|TypeError/.test(error)), []);
  console.log(`${preview.output}`);
} finally {
  await preview.close();
}
