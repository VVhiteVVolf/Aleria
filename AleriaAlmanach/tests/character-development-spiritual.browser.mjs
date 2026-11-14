import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { openVenueBrowserPreview } from './support/venue-browser-preview.mjs';
import { sanitizeCharacterCombatProfile } from '../modules/combat/combat-profile-model.js';

const root = fileURLToPath(new URL('../../', import.meta.url));
const task = 'trait-balance-spiritual-20261112';
const preview = await openVenueBrowserPreview(task);
const output = resolve(root, 'diagnostics', task, basename(preview.output));
await mkdir(output, { recursive: true });
const { page } = preview, screenshots = [], cases = [], missingImages = [], blockedRequests = [];
const spiritualIds = [...Array.from({ length: 6 }, (_, index) => `development-trait-spirituelle-dissonanz-${index + 1}`), 'development-trait-eidbruch'];
const fixture = { id: 'local-spiritual-review', name: 'Lokale Zustandsprüfung', combatProfile: sanitizeCharacterCombatProfile({
  progression: { level: 1, development: { mode: 'purchase' } }, hitPoints: { current: 3 }, magic: { enabled: true },
  resources: [{ id: 'personal', name: 'Eigener Vorrat', current: 1, maximum: 6 }],
  quirks: [{ id: 'personal-memory', name: 'Persönliche Erinnerung', description: 'Unveränderte eigene Vereinbarung.', active: true }]
}) };
const input = id => page.locator(`[data-development-trait="${id}"]`);
const collect = () => page.evaluate(() => AleriaCharacterCombatProfile.collect());
const capture = async name => { await page.screenshot({ path: resolve(output, `${name}.png`) }); screenshots.push(`${name}.png`); };
async function initialize(profile = fixture.combatProfile) {
  await page.evaluate(character => {
    closeCharProfile({ skipUnsavedCheck: true }); openCharProfile(null); switchCharTab('combat');
    AleriaCharacterCombatProfile.init(character);
  }, { ...fixture, combatProfile: profile });
  return collect();
}
async function openAssistant(assistant) {
  await page.locator(`[data-combat-action="${assistant === 'level' ? 'open-level-up' : 'open-character-setup'}"]`).click();
  if (assistant === 'creation') await page.locator('[data-creation-action="go-step"][data-step="4"]').click();
  await page.locator('[data-level-up-path="targetLevel"]').fill('1');
  await page.locator('[data-level-up-path="targetLevel"]').press('Tab');
}
async function apply(assistant) {
  if (assistant === 'level') await page.locator('[data-combat-action="apply-level-up"]').click();
  else {
    await page.locator('[data-creation-action="go-step"][data-step="6"]').click();
    await page.locator('[data-creation-action="apply"]').click();
  }
}
function assertUnchanged(actual, original) {
  for (const key of ['attributes', 'skills', 'weapons', 'armorItems', 'abilities', 'techniques', 'magic', 'resources', 'hitPoints']) {
    assert.deepEqual(actual[key], original[key], key);
  }
  // Creation records its normal appliedAt/free-method metadata on confirmation.
  for (const key of ['schemaVersion', 'ancestryId', 'backgroundId', 'classId']) assert.equal(actual.templateSelections[key], original.templateSelections[key]);
  assert.deepEqual(actual.quirks.find(entry => entry.id === 'personal-memory'), original.quirks.find(entry => entry.id === 'personal-memory'));
}
try {
  await page.context().route('**/*', async route => {
    const request = route.request();
    if (new URL(request.url()).origin === preview.origin && request.method() === 'GET') return route.continue();
    blockedRequests.push({ method: request.method(), url: request.url() }); return route.abort();
  });
  page.on('response', response => {
    if (response.url().includes('/assets/development-traits/') && response.status() >= 400) missingImages.push(response.url());
  });
  await page.waitForFunction(() => typeof openCharProfile === 'function' && !!window.AleriaCharacterCombatProfile);
  for (const [layout, size] of [['desktop', { width: 1440, height: 1000 }], ['phone', { width: 390, height: 844 }]]) {
    await page.setViewportSize(size);
    for (const assistant of ['level', 'creation']) {
      const original = await initialize();
      await openAssistant(assistant);
      const search = page.locator('[data-level-up-path="traitSearch"]');
      const filter = page.locator('[data-level-up-path="traitGroup"]');
      await filter.selectOption('spiritual');
      assert.equal(await input(spiritualIds[0]).count(), 1);
      assert.equal(await page.locator('[data-development-trait]').count(), 7);
      await preview.decodeImages('.development-trait img');
      const images = await page.locator('.development-trait img').evaluateAll(elements => elements.map(image => ({
        path: new URL(image.src).pathname, width: image.naturalWidth, height: image.naturalHeight
      })));
      assert.deepEqual(images.map(image => image.path), spiritualIds.map(id => `/AleriaAlmanach/assets/development-traits/web/${id.replace('development-trait-', '')}.webp`));
      assert.ok(images.every(image => image.width === 192 && image.height === 192));
      await page.locator('.development-trait').first().scrollIntoViewIfNeeded();
      await capture(`${assistant}-spiritual-list-${layout}`);
      await input(spiritualIds[0]).check();
      await input(spiritualIds[5]).check();
      assert.equal(await input(spiritualIds[0]).isChecked(), false);
      assert.equal(await input(spiritualIds[5]).isChecked(), true);
      await search.fill('Paladine');
      assert.equal(await page.locator('[data-development-trait]').count(), 1);
      await input(spiritualIds[6]).check();
      await search.fill('');
      await filter.selectOption('selected');
      assert.equal(await page.locator('[data-development-trait]').count(), 2);
      assert.match(await page.locator('[data-development-role="traits"]').innerText(), /derzeit bleiben sie vollständig nutzbar/);
      await page.locator('.development-trait').first().scrollIntoViewIfNeeded();
      await capture(`${assistant}-selected-six-and-oath-${layout}`);
      const bounds = await page.locator(assistant === 'level' ? '.cp-level-up-dialog' : '.cp-setup-dialog').evaluate(element => ({ width: element.clientWidth, scrollWidth: element.scrollWidth }));
      assert.ok(bounds.scrollWidth <= bounds.width + 2, `${assistant}/${layout}: no horizontal overflow`);
      await apply(assistant);
      const selected = await collect();
      assertUnchanged(selected, original);
      assert.deepEqual(selected.quirks.filter(entry => spiritualIds.includes(entry.id)).map(entry => entry.id), [spiritualIds[5], spiritualIds[6]]);
      await initialize(JSON.parse(JSON.stringify(selected)));
      await openAssistant(assistant);
      await page.locator('[data-level-up-path="traitGroup"]').selectOption('spiritual');
      assert.equal(await input(spiritualIds[5]).isChecked(), true);
      assert.equal(await input(spiritualIds[6]).isChecked(), true);
      await input(spiritualIds[1]).check();
      assert.equal(await input(spiritualIds[5]).isChecked(), false);
      assert.equal(await input(spiritualIds[1]).isChecked(), true);
      await apply(assistant);
      const downgraded = await collect();
      assertUnchanged(downgraded, original);
      assert.deepEqual(downgraded.quirks.filter(entry => spiritualIds.includes(entry.id)).map(entry => entry.id), [spiritualIds[6], spiritualIds[1]]);
      await openAssistant(assistant);
      await page.locator('[data-level-up-path="traitGroup"]').selectOption('selected');
      await input(spiritualIds[1]).click();
      assert.equal(await input(spiritualIds[1]).count(), 0);
      await input(spiritualIds[6]).click();
      assert.equal(await input(spiritualIds[6]).count(), 0);
      await apply(assistant);
      const removed = await collect();
      assertUnchanged(removed, original);
      assert.deepEqual(removed.quirks, original.quirks);
      cases.push({ assistant, layout, images, bounds, chosen: [6, 'eidbruch'], downgraded: 2, removed: true,
        unchangedMagicAndResources: true, reload: true });
    }
    await initialize();
    await openAssistant('level');
    await page.locator('[data-level-up-path="traitSearch"]').fill('Flinke Füße');
    assert.equal(await page.locator('[data-development-trait]').count(), 1);
    assert.match(await page.locator('.development-trait').innerText(), /\+1 RK und \+1 auf Akrobatik/);
    await page.locator('.development-trait').scrollIntoViewIfNeeded();
    await capture(`flinke-fuesse-${layout}`);
    await page.locator('[data-combat-action="close-level-up"]').first().click();
  }
  assert.deepEqual(missingImages, []);
  assert.deepEqual(preview.errors, []);
  await writeFile(resolve(output, 'report.json'), JSON.stringify({ cases, screenshots, missingImages,
    pageErrors: preview.errors, blockedRequests, productionWrites: false }, null, 2) + '\n');
  console.log(JSON.stringify({ output, cases: cases.length, imageChecks: cases.reduce((sum, item) => sum + item.images.length, 0), screenshots: screenshots.length }));
} catch (error) {
  await capture('failure');
  await writeFile(resolve(output, 'failure.json'), JSON.stringify({ message: error.message, stack: error.stack, screenshots, cases, missingImages, pageErrors: preview.errors }, null, 2));
  console.error(`Browser evidence: ${output}`);
  throw error;
} finally { await preview.close(); }
