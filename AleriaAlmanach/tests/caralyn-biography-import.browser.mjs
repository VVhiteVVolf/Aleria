import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { openVenueBrowserPreview } from './support/venue-browser-preview.mjs';
const snapshot = JSON.parse(await readFile(new URL('../../CharakterDatenbank/generated/characters.snapshot.json', import.meta.url), 'utf8'));
const character = snapshot.characters.find(character => character.id === 'Eka4z7TWpzEgx8KjhIzy');
const preview = await openVenueBrowserPreview('caralyn-biography-20261102'), { page } = preview;
try {
  await page.setViewportSize({ width: 1440, height: 1000 });
  const biography = await page.evaluate(character => AleriaBiographyCatalog.resolve(character.biography, { characterId: character.id }), character);
  await preview.openPage({ id: 'caralyn-biography-import-preview', title: character.name, multipage: true, pages: [{ biographyPage: true, ...biography }] }, 0);
  await preview.decodeImages('#modal-overlay img[src*="Traits"]');
  assert.equal(await page.locator('#modal-overlay img[src*="Traits"]').count(), 10);
  await preview.capture('caralyn-biography-desktop');
  await page.setViewportSize({ width: 390, height: 844 }); await preview.capture('caralyn-biography-phone');
  await page.evaluate(() => { closeModal(); AleriaCreatures.open('companion-caralyn-eure-hufigkeit'); });
  await preview.decodeImages('.creature-dossier figure img');
  assert.match(await page.locator('.creature-dossier').innerText(), /Eure Hufigkeit/);
  await preview.capture('eure-hufigkeit-phone');
  assert.deepEqual(preview.errors, []);
  await writeFile(resolve(preview.output, 'report.json'), JSON.stringify({ passed: true, iconsDecoded: 10, linkedHorseOpened: true, goldfishCreated: false, externalWritesBlocked: true }, null, 2) + '\n');
  console.log(JSON.stringify({ passed: true, output: preview.output }));
} catch (error) { await preview.capture('failure'); throw error; } finally { await preview.close(); }
