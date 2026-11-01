import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { chromium } from '../../Stammbäume/node_modules/playwright-core/index.mjs';
import { startChartQualityServer } from '../../Stammbäume/tools/chart-quality-server.mjs';
import { FORMLING_NOTICE_ID } from '../../Anzeigetafeln/tools/notices/lleuwens-anhoerung.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
const server = await startChartQualityServer(root);
const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
const context = await browser.newContext({ viewport: { width: 1500, height: 1100 }, reducedMotion: 'reduce' });
await context.route('**/*', async route => {
  const request = route.request(), url = new URL(request.url());
  if (url.origin === server.origin && request.method() === 'GET') return route.continue();
  return route.abort();
});
const page = await context.newPage();
const errors = [], report = { notices: [], hierarchies: [], errors, writesAllowed: false };
page.on('pageerror', error => errors.push(error.message));
const shot = name => page.screenshot({ path: fileURLToPath(new URL(`${name}.png`, import.meta.url)), animations: 'disabled' });
const decoded = async locator => {
  const broken = await locator.locator('img').evaluateAll(async images => {
    await Promise.all(images.map(image => { image.loading = 'eager'; return image.decode().catch(() => {}); }));
    return images.filter(image => !image.naturalWidth).map(image => image.src);
  });
  assert.deepEqual(broken, []);
};
try {
  await page.goto(`${server.origin}/Anzeigetafeln/tafel.html?tafel=cenyr-celtigerns-wacht-llamrais-ankunft-gwynthor-anzeigetafel`);
  const marker = page.locator('.board-poster[data-poster-id="gwynthor-poster-kirche"] [data-role="poster-pin"]');
  await marker.waitFor();
  assert.equal(await marker.count(), 1);
  await decoded(page.locator('.board-poster'));
  report.placement = await page.locator('.board-poster').evaluateAll(papers => {
    const church = papers.find(p => p.dataset.posterId === 'gwynthor-poster-kirche');
    const a = church.getBoundingClientRect();
    return { width: a.width, overlaps: papers.filter(p => p !== church).filter(p => {
      const b = p.getBoundingClientRect();
      return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
    }).map(p => p.dataset.posterId) };
  });
  assert.deepEqual(report.placement.overlaps, []);
  await shot('kirchenplakat-tafel');
  await marker.click();
  await page.mouse.move(3, 3);
  assert.equal(await page.locator('#notice-stack-nav option').count(), 3);
  const ids = await page.locator('#notice-stack-nav option').evaluateAll(options => options.map(option => option.value));
  for (const [layout, viewport] of [['desktop', { width: 1500, height: 1100 }], ['mobile', { width: 430, height: 900 }]]) {
    await page.setViewportSize(viewport);
    for (const [index, id] of ids.entries()) {
      await page.locator('#notice-stack-nav select').selectOption(id);
      const reader = page.locator('#scroll-content');
      await decoded(reader);
      assert.equal(await reader.locator('.medieval-notice--quest, .quest-footer').count(), 0);
      assert.match(await reader.innerText(), /Euddogwy/);
      const size = await reader.evaluate(element => ({ width: element.clientWidth, scrollWidth: element.scrollWidth }));
      assert.ok(size.scrollWidth <= size.width + 1, `${layout}: reader overflow`);
      await shot(`${layout}-blatt-${index + 1}`);
      report.notices.push({ layout, id, ...size, brokenImages: [] });
    }
  }
  await page.setViewportSize({ width: 1500, height: 1100 });
  await page.goto(`${server.origin}/AleriaAlmanach/AleriaAlmanach.html`);
  await page.waitForFunction(() => typeof openModal === 'function');
  await page.waitForFunction(() => ['ready', 'slow'].includes(document.querySelector('[data-loading-screen]')?.dataset.state));
  const enter = page.locator('[data-loading-action="enter"]');
  await (await enter.isEnabled() ? enter : page.locator('[data-loading-action="continue"]')).click();
  await page.waitForFunction(() => !document.documentElement.hasAttribute('data-almanach-loading'));
  for (const [id, index, branch, names, label] of [
    ['gwynthor-kathedrale-der-neun', 2, 2, ["Euddogwy O'Cenyr"], 'kathedrale-adjutant'],
    ['gwynthorer-theater', 3, 1, ['Lleuwen', 'Orvar Schattentänzer'], 'theater-nebenrollen'],
  ]) {
    await page.evaluate(({ id, index }) => {
      closeModal();
      const entry = getValidSections().flatMap(section => section.entries).find(entry => entry.id === id);
      if (!entry) throw Error('Module missing: ' + id);
      openModal(entry, { pageIndex: index });
    }, { id, index });
    await page.locator('#modal-overlay [data-hierarchy-tree-tab]').nth(branch).click();
    const panel = page.locator('#modal-overlay [data-hierarchy-tree-panel].active');
    await decoded(panel);
    for (const name of names) assert.ok((await panel.innerText()).includes(name), name);
    await shot(label);
    report.hierarchies.push({ id, names, brokenImages: [] });
  }
  await page.goto(`${server.origin}/Kontinente/Estryll/Königreich Cenyr/Grafschaft Celtigerns Wacht/Grafschaft Celtigerns Wacht.html`);
  await page.locator('.administration-grid, .herrschaft-administration-grid').locator('[data-administration-key="klerus"]').click();
  const dialog = page.locator('.administration-dialog[open]');
  await dialog.getByText("Euddogwy O'Cenyr", { exact: true }).waitFor();
  await decoded(dialog);
  await shot('verwaltung-klerus');
  assert.deepEqual(errors, []);
  await writeFile(new URL('browser-review.json', import.meta.url), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({ sheetsReviewed: report.notices.length, modulesReviewed: 2, administration: true, errors }));
} catch (error) {
  await shot('browser-failure');
  const state = await page.evaluate(() => ({ url: location.href,
    body: document.body.innerText.slice(0, 7000),
    notices: window.TafelState?.get()?.zettel?.map(n => ({ id: n.id, group: n.noticeGroupId })),
    board: window.TafelState?.get()?.boardLayout,
    markers: [...document.querySelectorAll('[data-notice-id]')].map(n => ({ tag: n.tagName, className: n.className, id: n.dataset.noticeId })),
  }));
  await writeFile(new URL('browser-failure.json', import.meta.url), JSON.stringify({ error: String(error), errors, state }, null, 2));
  throw error;
} finally {
  await browser.close();
  await server.close();
}
