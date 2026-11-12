import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { openVenueBrowserPreview } from './support/venue-browser-preview.mjs';
import { getDraigGardeEntry } from '../modules/draig-leibgarde/draig-leibgarde-entry.mjs';
import { collectGroupRoster } from '../modules/landing/group-landing-roster.js';

const entry = getDraigGardeEntry();
const roster = collectGroupRoster(entry);
assert.equal(roster.length, 12);
const preview = await openVenueBrowserPreview('draig-garde-20261112-module', { entryId: entry.id });
const { page } = preview;
const checks = [], captures = [];
const dismissedStatusToasts = [];
const dismissFixtureStatus = async () => {
  const toast = page.locator('#app-status-toast');
  if (await toast.isVisible()) {
    dismissedStatusToasts.push(await toast.innerText());
    await toast.locator('[data-action="dismiss-app-status"]').click();
    await toast.waitFor({ state: 'hidden' });
  }
};
const capture = async (name, locator) => {
  const filename = `${name}.png`;
  await dismissFixtureStatus();
  await locator.screenshot({ path: path.resolve(preview.output, filename) });
  captures.push(filename);
};
try {
  for (const [layout, viewport] of [['desktop', { width: 1460, height: 1000 }], ['mobile', { width: 390, height: 844 }]]) {
    await page.setViewportSize(viewport);
    for (let index = 0; index < 3; index += 1) {
      await preview.openPage(entry, index);
      await preview.decodeImages('#modal-overlay img');
      const card = page.locator('#modal-overlay .modal-card');
      const dimensions = await card.evaluate(card => ({ clientWidth: card.clientWidth, scrollWidth: card.scrollWidth }));
      assert(dimensions.scrollWidth <= dimensions.clientWidth + 2);
      await dismissFixtureStatus();
      await preview.capture(`${layout}-story-${index + 1}`);
      captures.push(`${layout}-story-${index + 1}.png`);
      checks.push({ layout, case: `story-${index + 1}`, ...dimensions });
    }
    await preview.openPage(entry, 3);
    const active = page.locator('#modal-overlay [data-hierarchy-tree-panel="0"]');
    await preview.decodeImages('#modal-overlay img');
    assert.equal(await active.locator('.hierarchy-chart-level').count(), 9);
    const titles = await active.locator('.hierarchy-node-card h4').allTextContents();
    assert.deepEqual(titles, entry.pages[3].hierarchy.trees[0].levels.flatMap(level => level.nodes.map(node => node.title)));
    const nodes = active.locator('.hierarchy-node-card');
    for (const [index, member] of roster.entries()) {
      const card = nodes.filter({ has: page.locator('h4', { hasText: member.name }) }).first();
      await card.scrollIntoViewIfNeeded();
      assert.equal(await card.locator('img').getAttribute('src'), member.portrait);
      const metrics = await card.evaluate(card => {
        const image = card.querySelector('img');
        const rect = card.getBoundingClientRect();
        return { width: rect.width, height: rect.height, imageWidth: image.naturalWidth, imageHeight: image.naturalHeight,
          text: card.querySelector('h4').textContent };
      });
      assert(metrics.imageWidth > 0 && metrics.imageHeight > 0);
      assert(metrics.width > 60 && metrics.height > 40);
      await capture(`${layout}-named-${String(index + 1).padStart(2, '0')}`, card);
      checks.push({ layout, case: 'named-person', name: member.name, ...metrics });
    }
    for (const [title, level] of [['Garde Ritter', 3], ['Gardist', 5]]) {
      const card = active.locator(`[data-hierarchy-level="${level}"] .hierarchy-node-card`).filter({ has: page.locator('h4', { hasText: new RegExp(`^${title}$`) }) }).first();
      await card.scrollIntoViewIfNeeded();
      assert((await card.locator('img').evaluate(image => image.naturalWidth)) > 0);
      await capture(`${layout}-${level === 3 ? 'anonymous-knight' : 'anonymous-guard'}`, card);
      checks.push({ layout, case: 'anonymous-placeholder', title });
    }
    await page.locator('#modal-overlay [data-hierarchy-tree-tab="1"]').click();
    const former = page.locator('#modal-overlay [data-hierarchy-tree-panel="1"]');
    assert(await former.isVisible());
    assert.match(await former.innerText(), /Brenric Coeddu.*Idwalladr Arwydd/is);
    await capture(`${layout}-former`, former.locator('.hierarchy-chart-level').first());
    await page.locator('#modal-overlay [data-hierarchy-tree-tab="0"]').click();
    assert(await active.isVisible());
    assert.equal(await active.locator('.hierarchy-node-card').count(), 34);
    checks.push({ layout, case: 'historical-tab-roundtrip', activeCards: 34, formerNamesPreserved: true });
    const dimensions = await page.locator('#modal-overlay .modal-card').evaluate(card => ({ clientWidth: card.clientWidth, scrollWidth: card.scrollWidth }));
    assert(dimensions.scrollWidth <= dimensions.clientWidth + 2, 'Hierarchy scroll must stay inside its own viewport');
  }
  assert.deepEqual(preview.errors, []);
  const report = { passed: true, entryId: entry.id, namedActivePeople: roster.length, genericKnightSlots: 2,
    genericGuardSlots: 5, originalLowerRankSlots: 15, viewports: [1460, 390], source: 'Current local pure module source and real Almanach controllers',
    productionWritesBlocked: true, noUserBrowserContext: true, screenshots: captures, checks, errors: preview.errors,
    dismissedStatusToasts, statusToastHandling: 'Offline fixture status messages dismissed with the existing UI close button before screenshots',
    visualReview: { status: 'pending', note: 'The generated images must be actually opened separately before claiming visual review.' } };
  await writeFile(path.resolve(preview.output, 'report.json'), `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify({ passed: true, output: preview.output, screenshots: captures.length, checks: checks.length }));
} finally { await preview.close(); }
