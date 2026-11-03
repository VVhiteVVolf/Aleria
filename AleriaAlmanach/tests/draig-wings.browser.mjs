import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { openVenueBrowserPreview } from './support/venue-browser-preview.mjs';
import { RESIDENTIAL_NODE_ID } from '../modules/castell-draig-rooms/wing-households.mjs';
import { DRAIG_WING_ART } from '../modules/castell-draig-rooms/wing-art.mjs';

const payload = JSON.parse(await readFile(new URL('../assets/castell-draig/wohnfluegel-2026-11-02/module-import.json', import.meta.url), 'utf8'));
const preview = await openVenueBrowserPreview('draig-wohnfluegel');
const { page } = preview;
try {
  const setup = await page.evaluate(({ payload, rootId }) => {
    applyModuleStorePayload(payload);
    const entries = getValidSections().flatMap(section => section.entries).filter(entry => payload.customSections.some(section => section.entries.some(row => row.id === entry.id)));
    const ids = new Set(entries.map(entry => entry.id));
    return { entries, wings: getModuleSectionNodeChildren(rootId).map(node => node.title),
      sceneThreads: getSceneTransitionEndpoints().filter(endpoint => ids.has(endpoint.entryId)).map(endpoint => endpoint.threadId),
      overviewBlocks: getPages(entries.find(entry => entry.id === 'castell-draig-wohntrakte'))[0].sceneBlocks };
  }, { payload, rootId: RESIDENTIAL_NODE_ID });
  assert.equal(setup.entries.length, 36);
  assert.equal(setup.wings.length, 6);
  assert.equal(setup.overviewBlocks.length, 6);
  assert.equal(setup.sceneThreads.length, 35);
  assert.equal(new Set(setup.sceneThreads).size, 35);
  assert(setup.sceneThreads.includes('modul-1781470059057::session:wohntrakte-gawain'));
  const checks = [];
  for (const [layout, viewport] of [['desktop', { width: 1460, height: 1000 }], ['phone', { width: 390, height: 844 }]]) {
    await page.setViewportSize(viewport);
    for (const entry of setup.entries) {
      await preview.openPage(entry, 0);
      await preview.decodeImages('#modal-overlay img[src*="castell-draig/"]');
      const scene = entry.pages[0].sessionPage;
      if (scene) {
        assert.equal(await page.locator('#modal-overlay .session-stage-title').textContent(), entry.pages[0].pageTitle);
        assert.equal(await page.locator('#modal-overlay [data-action="open-comment-form"]').count(), 1);
        assert.equal(await page.evaluate(() => getCurrentCommentThreadId()), `${entry.id}::session:${entry.pages[0].commentThreadKey}`);
        const toggle = page.locator('#modal-overlay .session-intro-toggle');
        await toggle.focus(); await page.keyboard.press('Enter');
        assert.equal(await page.locator('#modal-overlay .session-stage-copy').isVisible(), false);
        await page.keyboard.press('Enter');
        assert(await page.locator('#modal-overlay .session-stage-copy').isVisible());
      }
      const bounds = await page.locator('#modal-overlay .modal-card').evaluate(el => ({ width: el.clientWidth, scrollWidth: el.scrollWidth }));
      assert(bounds.scrollWidth <= bounds.width + 2, `${layout}: ${entry.id}`);
      checks.push({ layout, entry: entry.id, scene: Boolean(scene), ...bounds });
      if (['castell-draig-wohntrakte', 'castell-draig-familienstube', 'castell-draig-gemach-trahern', 'castell-draig-gemach-galahad-gwendolyn'].includes(entry.id)) await preview.capture(`${layout}-${entry.id}`);
    }
  }
  const gallery = await page.context().newPage();
  await gallery.setViewportSize({ width: 1200, height: 1800 });
  for (const [index, artworks] of [DRAIG_WING_ART.slice(0, 13), DRAIG_WING_ART.slice(13)].entries()) {
    await gallery.setContent(`<html lang="de"><style>body{margin:16px;background:#eee;font:16px sans-serif}main{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}figure{margin:0}img{width:100%;display:block}figcaption{padding:5px;background:white}</style><main>${artworks.map(art => `<figure><img src="${preview.origin}/${art.destination}"><figcaption>${art.id}</figcaption></figure>`).join('')}</main></html>`);
    await gallery.locator('img').evaluateAll(images => Promise.all(images.map(image => image.decode())));
    await gallery.screenshot({ path: resolve(preview.output, `art-contact-${index + 1}.png`), fullPage: true });
  }
  await gallery.close();
  assert.deepEqual(preview.errors, []);
  const report = { passed: true, modules: 36, wings: setup.wings, independentScenes: 35, views: checks.length,
    desktopAndPhone: true, keyboardVerified: true, allLocalImagesLoaded: true, externalWritesBlocked: true,
    errors: preview.errors, checks, output: preview.output };
  await writeFile(resolve(preview.output, 'report.json'), JSON.stringify(report, null, 2) + '\n');
  await writeFile(new URL('../assets/castell-draig/wohnfluegel-2026-11-02/browser-verification.json', import.meta.url), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({ passed: true, modules: 36, wings: 6, scenes: 35, views: checks.length, output: preview.output }));
} finally { await preview.close(); }
