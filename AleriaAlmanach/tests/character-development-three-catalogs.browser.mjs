import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { basename, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { openVenueBrowserPreview } from './support/venue-browser-preview.mjs';
import { EXPANSION_TRAIT_GROUPS } from '../modules/character-development/development-expansion-categories.js';
import { sanitizeCharacterCombatProfile } from '../modules/combat/combat-profile-model.js';

const root = fileURLToPath(new URL('../../', import.meta.url));
const task = process.argv[2] || process.env.ALERIA_DEVELOPMENT_BROWSER_TASK || 'talents-quirks-abilities-20261106';
assert.match(task, /^[a-z0-9-]+$/);
const preview = await openVenueBrowserPreview(task);
const output = resolve(root, 'diagnostics', task, basename(preview.output));
await mkdir(output, { recursive: true });
const { page } = preview;
const screenshots = [], views = [], blockedRequests = [], missingImages = [];
const fixture = { id: 'local-three-catalogs', name: 'Lokale Ergänzungsprüfung', combatProfile: sanitizeCharacterCombatProfile({
  progression: { level: 1, development: { mode: 'purchase' } }, hitPoints: { current: 3 },
  resources: [{ id: 'personal-resource', name: 'Eigener Vorrat', current: 1, maximum: 4 }],
  quirks: [{ id: 'personal', name: 'Persönliche Erinnerung', active: true }]
}) };
const groups = Object.entries(EXPANSION_TRAIT_GROUPS);
const selectedIds = groups.map(([, group]) => `development-trait-${group.definitions[0][0]}`);
const input = id => page.locator(`[data-development-trait="${id}"]`);
const collect = () => page.evaluate(() => AleriaCharacterCombatProfile.collect());
const capture = async name => { await page.screenshot({ path: resolve(output, `${name}.png`) }); screenshots.push(`${name}.png`); };
function assertState(actual, original) {
  for (const key of ['attributes', 'skills', 'weapons', 'armorItems', 'techniques', 'abilities', 'resources', 'hitPoints']) assert.deepEqual(actual[key], original[key], key);
}
async function initialize(character = fixture) {
  await page.evaluate(character => {
    closeCharProfile({ skipUnsavedCheck: true }); openCharProfile(null); switchCharTab('combat');
    AleriaCharacterCombatProfile.init(character);
  }, character);
  return collect();
}
async function openLevel() {
  await page.locator('[data-combat-action="open-level-up"]').click();
  await page.locator('[data-level-up-path="targetLevel"]').fill('1');
  await page.locator('[data-level-up-path="targetLevel"]').press('Tab');
}
async function bounds(selector) {
  const value = await page.locator(selector).evaluate(element => ({ width: element.clientWidth, scrollWidth: element.scrollWidth }));
  assert.ok(value.scrollWidth <= value.width + 2, selector);
  return value;
}
async function chooseGroups(layout, assistant) {
  const examined = [];
  for (const [id, group] of groups) {
    await page.locator('[data-level-up-path="traitSearch"]').fill('');
    await page.locator('[data-level-up-path="traitGroup"]').selectOption(id);
    assert.equal(await page.locator('[data-development-trait]').count(), 15, id);
    await preview.decodeImages('.development-trait img');
    const actual = await page.locator('.development-trait').evaluateAll(cards => cards.map(card => ({
      id: card.querySelector('input').dataset.developmentTrait, src: new URL(card.querySelector('img').src).pathname,
      width: card.querySelector('img').naturalWidth, height: card.querySelector('img').naturalHeight
    })));
    assert.deepEqual(actual, group.definitions.map(([slug]) => ({ id: `development-trait-${slug}`,
      src: `/AleriaAlmanach/assets/development-traits/web/${slug}.webp`, width: 192, height: 192 })));
    await page.locator('.development-trait').first().scrollIntoViewIfNeeded();
    await capture(`${assistant}-${id}-${layout}`);
    const [slug, name] = group.definitions[0];
    await page.locator('[data-level-up-path="traitSearch"]').fill(name);
    assert.equal(await page.locator('[data-development-trait]').count(), 1);
    await input(`development-trait-${slug}`).check();
    examined.push({ group: id, entries: actual, selected: slug });
  }
  await page.locator('[data-level-up-path="traitSearch"]').fill('');
  await page.locator('[data-level-up-path="traitGroup"]').selectOption('selected');
  assert.equal(await page.locator('[data-development-trait]').count(), 3);
  return examined;
}
async function checkOwnedRetiredChoice(layout) {
  const retiredId = 'development-trait-talent-knotengefuehl';
  const owned = { id: 'local-old-copy', developmentTraitId: retiredId,
    name: 'Gespeicherte persönliche Begabung', description: 'Persönlich erhaltene frühere Fassung.',
    active: true, cost: 7, icon: '/AleriaAlmanach/assets/development-traits/web/talent-knotengefuehl.webp',
    mechanics: { skillModifiers: [{ name: 'Athletik', bonus: 1 }] } };
  const original = await initialize({ ...fixture, combatProfile: { ...fixture.combatProfile, quirks: [...fixture.combatProfile.quirks, owned] } });
  await openLevel();
  assert.equal(await input(retiredId).isChecked(), true);
  await page.locator('[data-development-role="retired-traits"]').scrollIntoViewIfNeeded();
  await capture(`retired-level-${layout}`);
  await input(retiredId).uncheck();
  assert.match(await page.locator('[data-development-role="retired-traits"]').innerText(), /Deaktiviert/);
  await page.locator('[data-combat-action="apply-level-up"]').click();
  const disabled = await collect();
  const oldCopy = original.quirks.find(entry => entry.id === owned.id);
  assert.deepEqual(disabled.quirks.find(entry => entry.id === owned.id), { ...oldCopy, active: false });
  assertState(disabled, original);
  await page.locator('[data-combat-action="open-character-setup"]').click();
  await page.locator('[data-creation-action="go-step"][data-step="4"]').click();
  assert.equal(await input(retiredId).isChecked(), false);
  await input(retiredId).check();
  await page.locator('[data-development-role="retired-traits"]').scrollIntoViewIfNeeded();
  await capture(`retired-creation-${layout}`);
  await page.locator('[data-creation-action="go-step"][data-step="6"]').click();
  await page.locator('[data-creation-action="apply"]').click();
  const restored = await collect();
  assert.deepEqual(restored.quirks, original.quirks);
  assertState(restored, original);
  return { existingCopyOnly: true, personalCostPreserved: 7, deactivationAndReactivationReversible: true };
}

try {
  await page.context().route('**/*', async route => {
    const request = route.request();
    if (new URL(request.url()).origin === preview.origin && request.method() === 'GET') return route.continue();
    blockedRequests.push({ method: request.method(), url: request.url() }); return route.abort();
  });
  page.on('response', response => {
    const url = new URL(response.url());
    if (url.origin === preview.origin && url.pathname.includes('/assets/development-traits/') && response.status() >= 400) missingImages.push(url.pathname);
  });
  await page.waitForFunction(() => typeof openCharProfile === 'function' && !!window.AleriaCharacterCombatProfile);
  for (const [layout, size] of [['desktop', { width: 1440, height: 1000 }], ['phone', { width: 390, height: 844 }]]) {
    await page.setViewportSize(size);
    const original = await initialize();
    await openLevel();
    const levelGroups = await chooseGroups(layout, 'level');
    const levelBounds = await bounds('.cp-level-up-dialog');
    await page.locator('[data-combat-action="apply-level-up"]').click();
    const chosen = await collect(); assertState(chosen, original);
    for (const id of selectedIds) assert.ok(chosen.quirks.some(entry => entry.id === id));
    await initialize({ ...fixture, combatProfile: chosen });
    await openLevel();
    await page.locator('[data-level-up-path="traitGroup"]').selectOption('selected');
    assert.equal(await page.locator('[data-development-trait]').count(), 3);
    for (const id of selectedIds) assert.equal(await input(id).isChecked(), true);
    await preview.decodeImages('.development-trait img');
    await page.locator('.development-trait').first().scrollIntoViewIfNeeded();
    await capture(`reopened-selection-${layout}`);
    for (const id of selectedIds) { await input(id).click(); assert.equal(await input(id).count(), 0); }
    await page.locator('[data-combat-action="apply-level-up"]').click();
    const removed = await collect(); assertState(removed, original); assert.deepEqual(removed.quirks, original.quirks);

    await page.locator('[data-combat-action="open-character-setup"]').click();
    await page.locator('[data-creation-action="go-step"][data-step="4"]').click();
    await page.locator('[data-level-up-path="targetLevel"]').fill('1');
    await page.locator('[data-level-up-path="targetLevel"]').press('Tab');
    const creationGroups = await chooseGroups(layout, 'creation');
    const creationBounds = await bounds('.cp-setup-dialog');
    await page.locator('[data-creation-action="go-step"][data-step="6"]').click();
    await capture(`creation-review-${layout}`);
    assert.equal(await page.locator('[data-creation-action="apply"]').isEnabled(), true);
    await page.locator('[data-creation-action="apply"]').click();
    const created = await collect(); assertState(created, original);
    for (const id of selectedIds) assert.ok(created.quirks.some(entry => entry.id === id));
    const retiredChoice = await checkOwnedRetiredChoice(layout);
    views.push({ layout, viewport: size, levelGroups, creationGroups, levelBounds, creationBounds, retiredChoice,
      roundtrip: true, removalReversible: true, personalStatePreserved: true });
  }
  assert.deepEqual(preview.errors, []); assert.deepEqual(missingImages, []);
  const sourcePaths = ['development-traits.js', 'development-ui.js', 'development-expansion-categories.js',
    'development-expansion-talents.js', 'development-expansion-quirks.js', 'development-expansion-abilities.js',
    'development-retired-traits.js', 'development-purchases.js', 'development-overview.js']
    .map(name => `AleriaAlmanach/modules/character-development/${name}`)
    .concat(['AleriaAlmanach/modules/combat/combat-trigger-rules.js', 'AleriaAlmanach/modules/combat/combat-level-up-model.js',
      'AleriaAlmanach/modules/combat/combat-profile-model.js', 'AleriaAlmanach/styles/character-development.css']);
  const sources = Object.fromEntries(await Promise.all(sourcePaths.map(async path => [path, createHash('sha256').update(await readFile(resolve(root, path))).digest('hex')])));
  await writeFile(resolve(output, 'report.json'), JSON.stringify({ passed: true, views, sources, screenshots,
    externalWritesBlocked: true, blockedRequests, missingImages, errors: preview.errors, visualInspection: 'Pending actual image inspection by Root.' }, null, 2) + '\n');
  console.log(JSON.stringify({ passed: true, output, screenshots: screenshots.length, imageChecks: 180 }));
} catch (error) {
  await capture('failure');
  await writeFile(resolve(output, 'failure.json'), JSON.stringify({ error: error.message, stack: error.stack, screenshots, errors: preview.errors }, null, 2) + '\n');
  throw error;
} finally { await preview.close(); }
