import assert from 'node:assert/strict';
import { readFile, writeFile, copyFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { openVenueBrowserPreview } from './support/venue-browser-preview.mjs';

const { characters } = JSON.parse(await readFile(new URL('../modules/gwynthor-seven/source/character-plan.json', import.meta.url), 'utf8'));
const selected = characters.filter(character => ['Rianna Wyrm', 'Lefraye Gafyr'].includes(character.name));
const preview = await openVenueBrowserPreview('rianna-lefraye-biographies-20261102');
const { page } = preview;
const report = { characters: [], externalWritesBlocked: true };
try {
  for (const character of selected) {
    await page.setViewportSize({ width: 1680, height: 1050 });
    await preview.openPage({ id: 'review-' + character.id, multipage: true, title: character.name, image: character.portrait,
      pages: [{ biographyPage: true, ...character.biography }] }, 0);
    await preview.decodeImages('#modal-overlay .biography-page img');
    assert.equal(await page.locator('#modal-overlay [data-portrait-tab]').count(), 3);
    assert.equal(await page.locator('#modal-overlay .biography-mentor').count(), character.name === 'Rianna Wyrm' ? 3 : 1);
    for (const index of [1, 2]) {
      await page.locator(`#modal-overlay [data-portrait-tab="${index}"]`).click();
      const portrait = page.locator(`#modal-overlay [data-portrait-pane="${index}"]`);
      assert(await portrait.isVisible());
      assert.equal(await portrait.evaluate(image => getComputedStyle(image).objectFit), 'contain');
      assert(await page.locator(`#modal-overlay [data-portrait-caption="${index}"]`).isVisible());
      await preview.capture(`${character.id.split('--').at(-1)}-portrait-${index}`);
    }
    await page.setViewportSize({ width: 390, height: 844 });
    const widths = await page.locator('#modal-overlay .biography-page').evaluate(element => ({ width: element.clientWidth, scroll: element.scrollWidth }));
    assert(widths.scroll <= widths.width + 2, JSON.stringify(widths));
    await preview.capture(`${character.id.split('--').at(-1)}-phone`);
    report.characters.push({ name: character.name, portraits: 3, allImagesDecoded: true, fullImageContain: true, mobileWidths: widths });
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(preview.origin + '/Bestiarium/tiere/flugwesen/mwyalchen-drossel/index.html');
  await preview.decodeImages('.field-profile img');
  assert.equal(await page.locator('h1').textContent(), 'Mwyalchen-Drossel');
  assert.equal(await page.locator('#weiterlesen a').count(), 2);
  await preview.capture('mwyalchen-drossel');
  report.birdProfile = { rendered: true, imagesDecoded: true, familyLinks: 2 };
  assert.deepEqual(preview.errors, []);
  report.passed = true;
  report.screenshots = preview.output;
  await writeFile(resolve(preview.output, 'report.json'), JSON.stringify(report, null, 2) + '\n');
  await copyFile(resolve(preview.output, 'report.json'), new URL('../../diagnostics/rianna-lefraye-biographies-20261102/browser-review.json', import.meta.url));
  console.log(JSON.stringify(report));
} catch (error) {
  await preview.capture('failure');
  console.error(JSON.stringify({ output: preview.output, error: error.message, pageErrors: preview.errors }));
  throw error;
} finally { await preview.close(); }
