import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { openVenueBrowserPreview } from './support/venue-browser-preview.mjs';
const { characters } = JSON.parse(await readFile(new URL('../modules/gwynthor-seven/source/character-plan.json', import.meta.url), 'utf8'));
const preview = await openVenueBrowserPreview('health-substances-20261102');
const { page } = preview;
try {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.evaluate(character => { openCharProfile(null); switchCharTab('combat'); AleriaCharacterCombatProfile.init(character); }, characters.find(character => character.name === 'Rianna Wyrm'));
  await page.locator('[data-combat-action="open-level-up"]').click();
  const filters = { affliction: 30, fever: 10, addiction: 9, tolerance: 3 };
  for (const [group, count] of Object.entries(filters)) {
    await page.locator('[data-level-up-path="traitGroup"]').selectOption(group);
    assert.equal(await page.locator('[data-development-trait]').count(), count);
    await preview.decodeImages('.development-trait img');
    await page.locator('.development-trait').first().scrollIntoViewIfNeeded();
    await preview.capture(`${group}-desktop`);
  }
  await page.locator('[data-level-up-path="traitGroup"]').selectOption('fever');
  await page.locator('[data-development-trait="development-trait-arkanes-fieber-human-1"]').check();
  await page.locator('[data-development-trait="development-trait-arkanes-fieber-human-2"]').check();
  assert.equal(await page.locator('[data-development-trait="development-trait-arkanes-fieber-human-1"]').isChecked(), false);
  await page.locator('[data-level-up-path="traitGroup"]').selectOption('affliction');
  await page.locator('[data-development-trait="development-trait-taub"]').check();
  await page.locator('[data-level-up-path="traitGroup"]').selectOption('addiction');
  await page.locator('[data-development-trait="development-trait-abhaengigkeit-kriss-1"]').check();
  await page.locator('[data-development-trait="development-trait-abhaengigkeit-kriss-3"]').check();
  assert.equal(await page.locator('[data-development-trait="development-trait-abhaengigkeit-kriss-1"]').isChecked(), false);
  await page.locator('[data-level-up-path="traitGroup"]').selectOption('tolerance');
  await page.locator('[data-development-trait="development-trait-substanztoleranz-kriss"]').check();
  await page.locator('[data-level-up-path="traitGroup"]').selectOption('selected');
  assert.equal(await page.locator('[data-development-trait]').count(), 4);
  await page.setViewportSize({ width: 390, height: 844 });
  const bounds = await page.locator('.cp-level-up-dialog').evaluate(element => ({ width: element.clientWidth, scrollWidth: element.scrollWidth }));
  assert.ok(bounds.scrollWidth <= bounds.width + 2);
  await preview.decodeImages('.development-trait img'); await preview.capture('selected-phone');
  await page.locator('[data-combat-action="apply-level-up"]').click();
  const stored = await page.evaluate(() => AleriaCharacterCombatProfile.collect());
  assert.equal(stored.quirks.filter(trait => /Arkanes Fieber|Kriss-süchtig|Taub|Substanztoleranz/.test(trait.name)).length, 4);
  const runtime = await page.evaluate(async () => {
    const { createSubstanceIntoxication, advanceSubstanceConditions } = await import('/AleriaAlmanach/modules/character-health/substance-state.js');
    const { renderCombatCondition } = await import('/AleriaAlmanach/modules/combat-status/combat-status-view.js');
    const drunk = createSubstanceIntoxication('alcohol', { actorId: 'preview', sceneId: 'preview', seconds: 100 });
    const kriss = createSubstanceIntoxication('kriss', { actorId: 'preview', sceneId: 'preview', seconds: 100 });
    const flux = createSubstanceIntoxication('smaragdflux', { actorId: 'preview', sceneId: 'preview', seconds: 100 });
    const dust = createSubstanceIntoxication('blutstaub', { actorId: 'preview', sceneId: 'preview', seconds: 100 });
    const hung = advanceSubstanceConditions([drunk], drunk.durationModel.expiresAtSeconds, 'preview')[0];
    const host = document.createElement('section'); host.id = 'health-runtime-check';
    host.style.cssText = 'position:fixed;inset:8px;z-index:99999;overflow:auto;background:#171c19;color:#e8d9b8;padding:16px';
    host.innerHTML = '<h2>Rausch und Nachwirkungen</h2><ul class="comment-combat-conditions">' + [drunk, kriss, flux, dust, hung].map(condition => renderCombatCondition(condition, { temporary: true })).join('') + '</ul>';
    document.body.append(host);
    return [drunk, kriss, flux, dust, hung].map(condition => condition.name);
  });
  await preview.decodeImages('#health-runtime-check img'); await preview.capture('runtime-phone');
  assert.deepEqual(runtime, ['Betrunken', 'Kriss-Rausch', 'Smaragdflux-Rausch', 'Blutstaub-Rausch', 'Verkatert (Alkohol)']);
  const stateIcons = await page.locator('#health-runtime-check img').evaluateAll(images => images.map(image => new URL(image.src).pathname));
  assert.equal(new Set(stateIcons).size, 5);
  assert.ok(stateIcons.every(path => path.startsWith('/AleriaAlmanach/assets/development-traits/web/zustand-')));
  await page.evaluate(async () => {
    document.querySelector('#health-runtime-check').remove();
    const { openCombatStatusDialog } = await import('/AleriaAlmanach/modules/combat-status/combat-status-controller.js');
    const original = globalThis.AleriaCombat;
    try {
      globalThis.AleriaCombat = { getProfile: () => ({ name: 'Prüffigur', persistence: { kind: 'character' } }) };
      openCombatStatusDialog({ threadId: 'preview', characterId: 'preview' });
    } finally { globalThis.AleriaCombat = original; }
  });
  const status = page.locator('.combat-status-dialog');
  for (const preset of ['drunk', 'kriss-intoxication', 'smaragdflux-intoxication', 'blutstaub-intoxication', 'hangover']) {
    await status.locator('[name="presetId"]').selectOption(preset);
    assert.equal(await status.locator('[name="durationKind"]').inputValue(), 'scene-time');
    assert.equal(await status.locator('[name="durationKind"]').isDisabled(), true);
    assert.equal(await status.locator('[name="modifier-skill"]').isDisabled(), true);
    assert.equal(await status.locator('[name="name"]').isDisabled(), true);
    assert.equal(await status.locator('[name="durationAmount"]').isEnabled(), true);
    assert.match(await status.locator('[data-status-preview]').textContent(), /Szenenminuten verbleibend/);
    await preview.decodeImages('.combat-status-dialog img');
  }
  await status.locator('[name="presetId"]').selectOption('drunk');
  await status.locator('[name="durationAmount"]').fill('90');
  await status.locator('[name="durationAmount"]').dispatchEvent('change');
  assert.match(await status.locator('[data-status-preview]').textContent(), /90 Szenenminuten/);
  await preview.capture('manual-status-phone');
  await status.locator('[name="presetId"]').selectOption('');
  assert.equal(await status.locator('[name="durationKind"]').isEnabled(), true);
  assert.equal(await status.locator('[name="modifier-skill"]').isEnabled(), true);
  await status.locator('[data-status-close]').first().click();
  assert.deepEqual(preview.errors, []);
  await writeFile(resolve(preview.output, 'report.json'), JSON.stringify({ passed: true, filters, selectedTraits: 4, mutuallyExclusiveStages: true, allIconsDecoded: true, originalStateIcons: stateIcons, fixedPresetEditor: true, bounds, runtime, externalWritesBlocked: true, errors: preview.errors }, null, 2) + '\n');
  console.log(JSON.stringify({ passed: true, output: preview.output }));
} finally { await preview.close(); }
