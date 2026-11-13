import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { openVenueBrowserPreview } from './support/venue-browser-preview.mjs';
const preview = await openVenueBrowserPreview('horse-stud-places'), output = path.resolve(`diagnostics/horse-studs-20261113/places-${Date.now()}`), shots = [];
await fs.mkdir(output, { recursive: true });
const capture = async (page, name) => { const file = path.join(output, `${name}.png`); await page.screenshot({ path: file }); shots.push(file); };
try {
  for (const [layout, size] of [['desktop', { width: 1440, height: 1000 }], ['mobile', { width: 390, height: 844 }]]) {
    for (const id of process.argv.includes('--map-only') ? [] : ['haus-halenrhyd', 'haus-caeffyn', 'haus-aurdden']) {
      const page = await preview.page.context().newPage(); await page.setViewportSize(size);
      await page.goto(`${preview.origin}/Familien%20H%C3%A4user%20und%20Clans/kleinehaeuser.html?haus=${id}`);
      await page.waitForFunction(id => window.HAEUSER_DATA?.meta?.id === id && document.querySelector('[data-court-group="offices"] img'), id);
      const broken = await page.locator('img[src*="gwynthor-horse-studs"], [data-court-group="offices"] img').evaluateAll(async images => {
        await Promise.all(images.map(i => { i.loading = 'eager'; return i.decode().catch(() => {}); })); return images.filter(i => !i.naturalWidth).map(i => i.src);
      }); assert.deepEqual(broken, []);
      await capture(page, `${layout}-${id}-haus`);
      const offices = page.locator('[data-court-group="offices"]'); await offices.scrollIntoViewIfNeeded();
      if (id === 'haus-aurdden') { assert.match(await offices.textContent(), /Korrespondenz/); assert(await offices.locator('img[src*="placeholders"]').count()); }
      else assert.match(await offices.textContent(), id === 'haus-caeffyn' ? /Kyria/ : /Eirfena/);
      await capture(page, `${layout}-${id}-mitverantwortung`);
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 2)); await page.close();
    }
    const page = await preview.page.context().newPage(); await page.setViewportSize(size);
    await page.goto(`${preview.origin}/Karten/karte.html?map=cenyr-celtigerns-wacht-llamrais-ankunft-gwynthor-bannkreis`);
    await page.waitForFunction(() => window.KartoPublish?.isReady());
    for (const [id, title] of [['gwynthor-marking-063', 'Halenrhyd-Landgestüt'], ['gwynthor-marking-066', 'Halenrhyd-Futterhof']]) {
      await page.locator('#search-inp').fill(title);
      await page.locator(`.sr-item[data-pin-id="${id}"]`).click();
      await page.locator('#scroll-mo.open').waitFor(); assert.equal(await page.locator('#pin-detail-title').textContent(), title);
      assert.match(await page.locator('#scroll-mo').textContent(), /Halenrhyd/);
      assert(await page.locator('#scroll-mo a[href*="entry=zum-silberhalm-halenrhyd"]').count());
      await page.locator('#scroll-mo img').evaluateAll(async images => { await Promise.all(images.map(i => { i.loading = 'eager'; return i.decode().catch(() => {}); })); });
      await capture(page, `${layout}-${id}-karte`); await page.evaluate(() => closeScroll());
    }
    await page.close();
  }
  await fs.writeFile(path.join(output, 'report.json'), JSON.stringify({ passed: true, shots, productionWrites: false, source: 'current local application; fresh browser context; external writes blocked by venue preview' }, null, 2));
  console.log(JSON.stringify({ passed: true, output, screenshots: shots.length }));
} catch (error) { await fs.writeFile(path.join(output, 'failure.json'), JSON.stringify({ error: error.stack, shots }, null, 2)); throw error; }
finally { await preview.close(); }
