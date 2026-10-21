import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { openVenueBrowserPreview } from './support/venue-browser-preview.mjs';
import { buildGwynthorHomes, HOMES_SECTION } from '../modules/gwynthor-heime/homes-module.mjs';
import { GWYNTHOR_HOUSEHOLDS as homes } from '../modules/gwynthor-heime/households.mjs';
const entries = buildGwynthorHomes(), preview = await openVenueBrowserPreview('gwynthor-heime');
const { page } = preview, checks = [];
try {
  const placement = await page.evaluate(ids => getValidSections().flatMap(s => s.entries.filter(e => ids.includes(e.id)).map(e => ({ id: e.id, path: s.path }))), entries.map(e => e.id));
  assert.equal(placement.length, 3);
  for (const p of placement) assert.deepEqual(p.path, HOMES_SECTION.path);
  for (const [layout, viewport] of [['desktop', { width: 1440, height: 1000 }], ['mobile', { width: 390, height: 844 }]]) {
    await page.setViewportSize(viewport);
    for (const [i, entry] of entries.entries()) for (const [index, model] of entry.pages.entries()) {
      await preview.openPage(entry, index);
      await preview.decodeImages('#modal-overlay img[src*="gwynthor-heime"]');
      if (model.biographyPage) {
        assert.equal(await page.locator('#modal-overlay .biography-main .biography-ability').count(), 5);
        await preview.decodeImages('#modal-overlay .biography-ability-icon img, #modal-overlay .biography-connection img');
        const portrait = await page.locator('#modal-overlay img.biography-portrait').evaluate(image => ({ ratio: image.naturalWidth / image.naturalHeight, fit: getComputedStyle(image).objectFit }));
        assert.ok(Math.abs(portrait.ratio - 2 / 3) < .02);
        assert.equal(portrait.fit, 'contain');
        assert.equal(await page.getByRole('heading', { name: 'Lebensunterhalt & Wirtschaftlichkeit', exact: true }).count(), 1);
      }
      if (model.familyTreePage) {
        const frame = page.frameLocator('.family-tree-embed-frame');
        await frame.locator('.aleria-person-card').first().waitFor({ timeout: 30000 });
        await frame.locator('img.aleria-person-card__portrait').evaluateAll(images => Promise.all(images.map(image => image.decode())));
        const embedded = page.frames().find(frame => frame.url().includes(`family=${model.familyTree.familyId}&`));
        await embedded.waitForFunction(() => {
          const host = document.querySelector('#family-chart');
          if (!host || [...host.querySelectorAll('*')].some(node => node.__transition)) return false;
          const bounds = host.getBoundingClientRect();
          return [...host.querySelectorAll('.aleria-person-card')].every(card => {
            const r = card.getBoundingClientRect();
            return r.top >= bounds.top - 2 && r.bottom <= bounds.bottom + 2 && r.left >= bounds.left - 2 && r.right <= bounds.right + 2;
          });
        }).catch(async error => {
          console.error(JSON.stringify(await frame.locator('#family-chart').evaluate(host => ({ home: document.title, box: host.getBoundingClientRect().toJSON(),
            transitions: [...host.querySelectorAll('*')].filter(node => node.__transition).length,
            cards: [...host.querySelectorAll('.aleria-person-card')].map(card => card.getBoundingClientRect().toJSON()) }))));
          throw error;
        });
        assert.equal(await frame.locator('.aleria-person-card').count(), homes[i].people.length);
        for (const p of homes[i].people) assert.ok(await frame.locator('.aleria-person-card').filter({ hasText: p.name }).count());
        assert.ok(!(await frame.locator('img.aleria-person-card__portrait').evaluateAll(imgs => imgs.filter(i => i.complete && !i.naturalWidth).map(i => i.src))).length);
      }
      if (model.sessionPage) {
        const thread = await page.evaluate(() => getCurrentCommentThreadId());
        await page.locator('#modal-overlay .session-intro-toggle').click();
        assert.ok(!await page.locator('#modal-overlay .session-stage-copy').isVisible());
        assert.equal(await page.evaluate(() => getCurrentCommentThreadId()), thread);
      }
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 2));
      await preview.capture(`${layout}-${homes[i].slug}-seite-${index + 1}`);
      checks.push({ layout, home: homes[i].slug, page: index + 1 });
    }
  }
  assert.deepEqual(preview.errors, []);
  await writeFile(resolve(preview.output, 'report.json'), JSON.stringify({ passed: true, checks, placement, externalWrites: false, deployed: false }, null, 2));
  console.log(JSON.stringify({ passed: true, checks: checks.length, output: preview.output }));
} finally { await preview.close(); }
