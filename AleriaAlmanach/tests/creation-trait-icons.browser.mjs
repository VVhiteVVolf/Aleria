import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { basename, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { openVenueBrowserPreview } from './support/venue-browser-preview.mjs';
import { sanitizeCharacterCombatProfile } from '../modules/combat/combat-profile-model.js';
import { FAMILY_TRAIT_DEFINITIONS } from '../modules/character-development/development-family-traits.js';
import { GENERAL_TRAIT_DEFINITIONS } from '../modules/character-development/development-general-traits.js';
import { ORDINARY_BACKGROUND_TEMPLATES } from '../modules/character-development/creation-background-templates.js';

const root = fileURLToPath(new URL('../../', import.meta.url));
const fixture = { id: 'local-own-creation-icons', name: 'Lokale Iconprüfung', combatProfile: sanitizeCharacterCombatProfile({
  attributes: [{ key: 'strength', score: 10 }, { key: 'dexterity', score: 12 }],
  progression: { level: 1, development: { mode: 'purchase' } },
  hitPoints: { current: 7, vitality: { version: 1, overrideAnchor: null } },
  resources: [{ id: 'personal-resource', name: 'Persönlicher Vorrat', current: 1, maximum: 3 }],
  quirks: [{ id: 'personal-trait', name: 'Eigene Erinnerung', active: true }]
}) };
const preview = await openVenueBrowserPreview('creation-icons-20261106');
const output = resolve(root, 'diagnostics/creation-icons-20261106', basename(preview.output));
await mkdir(output, { recursive: true });
const { page } = preview;
const screenshots = [], views = [], blockedRequests = [], consoleErrors = [], failedLocalImages = [];
const iconPath = id => `/AleriaAlmanach/assets/development-traits/web/${id}.webp`;
const input = id => page.locator(`[data-development-trait="development-trait-${id}"]`);
const collect = () => page.evaluate(() => AleriaCharacterCombatProfile.collect());
async function initialize(character = fixture) {
  await page.evaluate(character => {
    closeCharProfile({ skipUnsavedCheck: true }); openCharProfile(null); switchCharTab('combat');
    AleriaCharacterCombatProfile.init(character);
  }, character);
  return collect();
}
async function capture(name) {
  await page.screenshot({ path: resolve(output, `${name}.png`) });
  screenshots.push(`${name}.png`);
}
async function bounds(selector) {
  const value = await page.locator(selector).evaluate(element => ({ width: element.clientWidth, scrollWidth: element.scrollWidth }));
  assert.ok(value.scrollWidth <= value.width + 2, selector);
  return value;
}
async function openLevel() {
  await page.locator('[data-combat-action="open-level-up"]').click();
  await page.locator('[data-level-up-path="targetLevel"]').fill('1');
  // Commit the edited numeric field before a checkbox can trigger its blur rerender.
  await page.locator('[data-level-up-path="targetLevel"]').press('Tab');
}
async function checkTraitIcons(group, definitions) {
  await page.locator('[data-level-up-path="traitSearch"]').fill('');
  await page.locator('[data-level-up-path="traitGroup"]').selectOption(group);
  assert.equal(await page.locator('[data-development-trait]').count(), definitions.length);
  await preview.decodeImages('.development-trait img');
  const actual = await page.locator('.development-trait').evaluateAll(cards => cards.map(card => ({
    id: card.querySelector('input').dataset.developmentTrait,
    path: new URL(card.querySelector('img').src).pathname,
    width: card.querySelector('img').naturalWidth, height: card.querySelector('img').naturalHeight
  })));
  const expected = definitions.map(([id]) => ({ id: `development-trait-${id}`, path: iconPath(id), width: 192, height: 192 }));
  assert.deepEqual(actual, expected);
  assert.equal(new Set(actual.map(entry => entry.path)).size, definitions.length);
  return actual;
}
async function checkBackgroundPreview(background) {
  const card = page.locator('.cp-setup-template-grid > .cp-setup-template-preview').nth(1);
  assert.equal(await card.locator('h4').innerText(), background.label);
  const image = card.locator('img');
  assert.equal(await image.count(), 1);
  const result = await image.evaluate(async element => {
    element.loading = 'eager'; await element.decode();
    const rect = element.getBoundingClientRect();
    return { path: new URL(element.src).pathname, naturalWidth: element.naturalWidth, naturalHeight: element.naturalHeight,
      width: rect.width, height: rect.height };
  });
  assert.equal(result.path, iconPath(`background-${background.id}`));
  assert.equal(result.path, background.icon);
  assert.equal(result.naturalWidth, 192); assert.equal(result.naturalHeight, 192);
  assert.equal(result.width, 40); assert.equal(result.height, 40);
  return { id: background.id, ...result };
}
function assertPersonalState(actual, expected) {
  for (const key of ['attributes', 'resources', 'weapons', 'armorItems', 'techniques', 'skills', 'proficiencies']) assert.deepEqual(actual[key], expected[key], key);
  assert.equal(actual.hitPoints.current, expected.hitPoints.current);
}

try {
  await page.context().route('**/*', async route => {
    const request = route.request(), url = new URL(request.url());
    if (url.origin === preview.origin && request.method() === 'GET') return route.continue();
    blockedRequests.push({ method: request.method(), origin: url.origin });
    return route.abort();
  });
  page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  page.on('response', response => {
    const url = new URL(response.url());
    if (url.origin === preview.origin && url.pathname.includes('/assets/development-traits/') && response.status() >= 400)
      failedLocalImages.push({ path: url.pathname, status: response.status() });
  });
  await page.waitForFunction(() => typeof openCharProfile === 'function' && !!window.AleriaCharacterCombatProfile);
  for (const [layout, viewport] of [['desktop', { width: 1440, height: 1000 }], ['phone', { width: 390, height: 844 }]]) {
    await page.setViewportSize(viewport);
    const before = await initialize();
    await openLevel();
    const family = await checkTraitIcons('family', FAMILY_TRAIT_DEFINITIONS);
    await page.locator('.development-trait').first().scrollIntoViewIfNeeded();
    await capture(`family-icons-${layout}`);
    await input('nuadat-riesenblut-1').check(); await input('nuadat-riesenblut-6').check();
    assert.equal(await input('nuadat-riesenblut-1').isChecked(), false);
    await input('arth-blut-6').check();
    await page.locator('[data-level-up-path="traitSearch"]').fill('Stufe VI');
    assert.equal(await page.locator('[data-development-trait]').count(), 2);
    await page.locator('.development-trait').first().scrollIntoViewIfNeeded();
    await capture(`family-rank-six-icons-${layout}`);
    const general = await checkTraitIcons('general', GENERAL_TRAIT_DEFINITIONS);
    await page.locator('.development-trait').first().scrollIntoViewIfNeeded();
    await capture(`general-icons-${layout}`);
    await page.locator('[data-level-up-path="traitSearch"]').fill('Ruhiger Atem');
    assert.equal(await page.locator('[data-development-trait]').count(), 1);
    await input('ruhiger-atem').check();
    await page.locator('.development-trait').first().scrollIntoViewIfNeeded();
    await capture(`general-search-icon-${layout}`);
    const levelBounds = await bounds('.cp-level-up-dialog');
    await page.locator('[data-combat-action="apply-level-up"]').click();
    const after = await collect(); assertPersonalState(after, before);
    const selectedIds = ['nuadat-riesenblut-6', 'arth-blut-6', 'ruhiger-atem'];
    for (const id of selectedIds) assert.equal(after.quirks.find(entry => entry.id === `development-trait-${id}`).icon, iconPath(id));
    const reloaded = await initialize({ ...fixture, combatProfile: after });
    assertPersonalState(reloaded, before);
    await openLevel();
    await page.locator('[data-level-up-path="traitGroup"]').selectOption('selected');
    await preview.decodeImages('.development-trait img');
    for (const id of selectedIds) {
      assert.equal(await input(id).isChecked(), true);
      const image = input(id).locator('..').locator('img').first();
      assert.equal(new URL(await image.getAttribute('src'), preview.origin).pathname, iconPath(id));
    }
    await page.locator('.development-trait').first().scrollIntoViewIfNeeded();
    await capture(`reopened-selected-icons-${layout}`);
    await page.locator('[data-combat-action="close-level-up"]').first().click();

    await page.locator('[data-combat-action="open-character-setup"]').click();
    const backgroundIcons = [];
    for (const background of ORDINARY_BACKGROUND_TEMPLATES) {
      await page.locator('[data-creation-field="backgroundId"]').selectOption(background.id);
      backgroundIcons.push(await checkBackgroundPreview(background));
      if (['buerger', 'jaeger', 'staatsmann', 'diplomat'].includes(background.id)) {
        await page.locator('.cp-setup-template-grid > .cp-setup-template-preview').nth(1).scrollIntoViewIfNeeded();
        await capture(`background-${background.id}-icon-${layout}`);
      }
    }
    assert.equal(new Set(backgroundIcons.map(entry => entry.path)).size, 24);
    const setupBounds = await bounds('.cp-setup-dialog');
    await page.locator('[data-creation-action="go-step"][data-step="6"]').click();
    assert.equal(await page.locator('[data-creation-action="apply"]').isEnabled(), true);
    await page.locator('[data-creation-action="apply"]').click();
    const backgroundApplied = await collect();
    assert.equal(backgroundApplied.templateSelections.backgroundId, 'diplomat');
    assertPersonalState(backgroundApplied, before);
    await page.locator('[data-combat-action="open-character-setup"]').click();
    assert.equal(await page.locator('[data-creation-field="backgroundId"]').inputValue(), 'diplomat');
    const reopenedBackground = await checkBackgroundPreview(ORDINARY_BACKGROUND_TEMPLATES.find(entry => entry.id === 'diplomat'));
    await page.locator('[data-creation-action="close"]').click();
    views.push({ layout, viewport, family, general, backgroundIcons, reopenedBackground, levelBounds, setupBounds,
      independentRankIcons: true, localProfileRoundtrip: true, currentHitPointsPreserved: true, externalWritesBlocked: true });
  }
  assert.deepEqual(preview.errors, []); assert.deepEqual(failedLocalImages, []);
  const unexpectedConsoleErrors = consoleErrors.filter(message => !/Failed to load resource: net::ERR_FAILED|Firebase|firestore|WebChannel|ERR_BLOCKED_BY_CLIENT/i.test(message));
  assert.deepEqual(unexpectedConsoleErrors, []);
  const sourcePaths = [
    'AleriaAlmanach/modules/character-development/development-family-traits.js',
    'AleriaAlmanach/modules/character-development/development-general-traits.js',
    'AleriaAlmanach/modules/character-development/development-traits.js',
    'AleriaAlmanach/modules/character-development/development-ui.js',
    'AleriaAlmanach/modules/character-development/creation-background-templates.js',
    'AleriaAlmanach/modules/characters/character-combat-setup.js',
    'AleriaAlmanach/styles/character-development.css'
  ];
  const sources = Object.fromEntries(await Promise.all(sourcePaths.map(async path => [path, createHash('sha256').update(await readFile(resolve(root, path))).digest('hex')])));
  await writeFile(resolve(output, 'report.json'), JSON.stringify({ passed: true, fixture: fixture.id,
    views, screenshots, sources, blockedRequests, consoleErrors, failedLocalImages, pageErrors: preview.errors,
    visualInspection: 'Pending separate opening and examination by Root.' }, null, 2) + '\n');
  console.log(JSON.stringify({ passed: true, output, screenshots: screenshots.length, imageTargetsPerLayout: 66 }));
} catch (error) {
  await capture('failure');
  await writeFile(resolve(output, 'failure.json'), JSON.stringify({ error: error.message, stack: error.stack,
    screenshots, consoleErrors, pageErrors: preview.errors, failedLocalImages }, null, 2) + '\n');
  throw error;
} finally { await preview.close(); }
