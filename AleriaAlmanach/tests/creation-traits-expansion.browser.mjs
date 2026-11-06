import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { basename, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { openVenueBrowserPreview } from './support/venue-browser-preview.mjs';
import { sanitizeCharacterCombatProfile, getEffectiveCombatAttribute, getMaximumHitPoints, getWeaponDamageModifier } from '../modules/combat/combat-profile-model.js';
import { ORDINARY_BACKGROUND_TEMPLATES } from '../modules/character-development/creation-background-templates.js';
import { getSkillIdentity } from '../modules/skill-checks/skill-definitions.js';

const root = fileURLToPath(new URL('../../', import.meta.url));
const preview = await openVenueBrowserPreview('creation-traits-20261106');
const output = resolve(root, 'diagnostics/creation-traits-20261106', basename(preview.output));
await mkdir(output, { recursive: true });
const { page } = preview;
const screenshots = [];
const views = [];
const blockedRequests = [];
const fixture = {
  id: 'local-creation-traits-fixture', name: 'Lokale Prüffigur',
  combatProfile: sanitizeCharacterCombatProfile({
    attributes: [{ key: 'strength', score: 10 }, { key: 'dexterity', score: 12 }],
    progression: { level: 1, development: { mode: 'purchase' } },
    hitPoints: { current: 7, vitality: { version: 1, overrideAnchor: null } },
    resources: [{ id: 'personal-resource', name: 'Persönlicher Vorrat', current: 1, maximum: 3 }],
    weapons: [{ id: 'personal-sword', name: 'Prüfschwert', weaponType: 'sword', damageFormula: '1d8', attackAttribute: 'strength', equipped: true }],
    quirks: [{ id: 'personal-trait', name: 'Eigene Erinnerung', active: true }]
  })
};
const trait = id => page.locator(`[data-development-trait="development-trait-${id}"]`);
const collect = () => page.evaluate(() => AleriaCharacterCombatProfile.collect());
async function capture(name) {
  await page.screenshot({ path: resolve(output, `${name}.png`) });
  screenshots.push(`${name}.png`);
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
async function assertBounds(selector, layout) {
  const bounds = await page.locator(selector).evaluate(element => ({ width: element.clientWidth, scrollWidth: element.scrollWidth }));
  assert.ok(bounds.scrollWidth <= bounds.width + 2, `${layout}: ${selector}`);
  return bounds;
}
function assertPreserved(actual, expected, context) {
  for (const key of ['attributes', 'weapons', 'armorItems', 'resources', 'skills', 'techniques', 'proficiencies']) {
    assert.deepEqual(actual[key], expected[key], `${context}: ${key}`);
  }
  assert.equal(actual.hitPoints.current, expected.hitPoints.current, `${context}: aktuelle TP`);
}

try {
  // The shared harness admits startup SDK/media GETs only. Once the application
  // is ready, this run permits local GETs and blocks all remaining requests.
  await page.context().route('**/*', async route => {
    const request = route.request();
    if (new URL(request.url()).origin === preview.origin && request.method() === 'GET') return route.continue();
    blockedRequests.push({ method: request.method(), origin: new URL(request.url()).origin });
    return route.abort();
  });
  await page.waitForFunction(() => typeof openCharProfile === 'function' && !!window.AleriaCharacterCombatProfile);
  for (const [layout, size] of [['desktop', { width: 1440, height: 1000 }], ['phone', { width: 390, height: 844 }]]) {
    await page.setViewportSize(size);
    const before = await initialize();
    await openLevel();
    await page.locator('[data-level-up-path="traitGroup"]').selectOption('family');
    assert.equal(await page.locator('[data-development-trait]').count(), 12);
    await preview.decodeImages('.development-trait img');
    await page.locator('.development-trait').first().scrollIntoViewIfNeeded();
    const familyCard = await page.locator('.development-trait').first().evaluate(card => {
      const bounds = card.getBoundingClientRect();
      return { height: bounds.height, checkboxTop: card.querySelector('input').getBoundingClientRect().top - bounds.top };
    });
    assert.ok(familyCard.height <= (layout === 'desktop' ? 500 : 700), `${layout}: family card height`);
    assert.ok(familyCard.checkboxTop <= 40, `${layout}: checkbox aligned near card top`);
    await capture(`family-${layout}`);
    await trait('nuadat-riesenblut-1').check();
    await trait('nuadat-riesenblut-6').check();
    assert.equal(await trait('nuadat-riesenblut-1').isChecked(), false);
    assert.equal(await trait('nuadat-riesenblut-6').isChecked(), true);
    await trait('arth-blut-1').check();
    await trait('arth-blut-6').check();
    assert.equal(await trait('arth-blut-1').isChecked(), false);
    assert.equal(await trait('arth-blut-6').isChecked(), true);
    assert.equal(await trait('nuadat-riesenblut-6').isChecked(), true);
    await page.locator('[data-level-up-path="traitSearch"]').fill('Stufe VI');
    assert.equal(await page.locator('[data-development-trait]').count(), 2);
    await page.locator('.development-trait').first().scrollIntoViewIfNeeded();
    await capture(`selected-rank-six-${layout}`);
    await page.locator('[data-level-up-path="traitSearch"]').fill('');
    await page.locator('[data-level-up-path="traitGroup"]').selectOption('general');
    assert.equal(await page.locator('[data-development-trait]').count(), 30);
    await preview.decodeImages('.development-trait img');
    await page.locator('[data-level-up-path="traitSearch"]').fill('Ruhiger Atem');
    assert.equal(await page.locator('[data-development-trait]').count(), 1);
    await trait('ruhiger-atem').check();
    await page.locator('.development-trait').first().scrollIntoViewIfNeeded();
    await capture(`general-search-${layout}`);
    await page.locator('[data-level-up-path="traitSearch"]').fill('');
    await page.locator('[data-level-up-path="traitGroup"]').selectOption('selected');
    assert.equal(await page.locator('[data-development-trait]').count(), 3);
    await page.locator('.development-effective-attributes summary').click();
    const effective = page.locator('[data-development-role="effective-attributes"]');
    assert.match(await effective.innerText(), /28 \(\+9\)/);
    assert.match(await effective.innerText(), /8 \(−1\)/);
    await effective.scrollIntoViewIfNeeded();
    await capture(`effective-preview-${layout}`);
    const levelBounds = await assertBounds('.cp-level-up-dialog', layout);
    await page.locator('[data-combat-action="apply-level-up"]').click();
    const after = await collect();
    assertPreserved(after, before, `Auswahl ${layout}`);
    assert.equal(getEffectiveCombatAttribute(after, 'strength').score, 28);
    assert.equal(getEffectiveCombatAttribute(after, 'dexterity').score, 8);
    assert.equal(getMaximumHitPoints(after), getMaximumHitPoints(before) + 24);
    assert.equal(getWeaponDamageModifier(after, after.weapons[0]), getWeaponDamageModifier(before, before.weapons[0]) + 13);
    assert.match(await page.locator('[data-combat-attribute-effective="strength"]').innerText(), /Wirksam 28/);
    await page.locator('[data-combat-attribute-effective="strength"]').scrollIntoViewIfNeeded();
    await capture(`applied-attributes-${layout}`);
    const linked = await page.evaluate(() => AleriaCharacterCombatProfile.collectLinked());
    const reloaded = await initialize({ ...fixture, inventory: linked.inventory, combatProfile: after });
    assertPreserved(reloaded, before, `Wiederöffnung ${layout}`);
    assert.equal(getEffectiveCombatAttribute(reloaded, 'strength').score, 28);
    await openLevel();
    await page.locator('[data-level-up-path="traitGroup"]').selectOption('selected');
    assert.equal(await page.locator('[data-development-trait]').count(), 3);
    for (const id of ['nuadat-riesenblut-6', 'arth-blut-6', 'ruhiger-atem']) {
      // The selected-only list removes its row immediately after the click.
      await trait(id).click();
      assert.equal(await trait(id).count(), 0);
    }
    await page.locator('[data-combat-action="apply-level-up"]').click();
    const removed = await collect();
    assertPreserved(removed, before, `Entfernung ${layout}`);
    assert.equal(getEffectiveCombatAttribute(removed, 'strength').score, 10);
    assert.equal(getEffectiveCombatAttribute(removed, 'dexterity').score, 12);
    assert.equal(getMaximumHitPoints(removed), getMaximumHitPoints(before));
    assert.equal(getWeaponDamageModifier(removed, removed.weapons[0]), getWeaponDamageModifier(before, before.weapons[0]));

    const backgroundCases = [];
    for (const id of ['buerger', 'jaeger', 'staatsmann']) {
      const baseline = await initialize();
      const background = ORDINARY_BACKGROUND_TEMPLATES.find(entry => entry.id === id);
      await page.locator('[data-combat-action="open-character-setup"]').click();
      const dialog = page.locator('[data-character-creation-root]');
      const selector = dialog.locator('[data-creation-field="backgroundId"]');
      assert.equal(await selector.locator('option').count(), 35);
      await selector.selectOption(id);
      await dialog.locator('[data-creation-action="go-step"][data-step="2"]').click();
      assert.equal(await dialog.locator('[data-creation-skill-check]:checked').count(), 0);
      for (const name of background.skillProficiencies) {
        const key = getSkillIdentity(name);
        assert.equal(await dialog.locator(`[data-creation-skill="${key}"]`).inputValue(), 'none');
      }
      await dialog.locator('[data-creation-action="suggest-skills"]').click();
      assert.equal(await dialog.locator('[data-creation-skill-check]:checked').count(), 2);
      for (const name of background.skillProficiencies) {
        assert.equal(await dialog.locator(`[data-creation-skill="${getSkillIdentity(name)}"]`).inputValue(), 'trained');
      }
      await dialog.locator('[data-creation-action="go-step"][data-step="4"]').click();
      await dialog.locator('[data-level-up-path="traitGroup"]').selectOption('family');
      assert.equal(await dialog.locator('[data-development-trait]').count(), 12);
      await trait('nuadat-riesenblut-1').check();
      await trait('nuadat-riesenblut-6').check();
      assert.equal(await trait('nuadat-riesenblut-1').isChecked(), false);
      await dialog.locator('[data-level-up-path="traitGroup"]').selectOption('general');
      assert.equal(await dialog.locator('[data-development-trait]').count(), 30);
      await dialog.locator('[data-level-up-path="traitSearch"]').fill('Pflichtbewusst');
      assert.equal(await dialog.locator('[data-development-trait]').count(), 1);
      await trait('pflichtbewusst').check();
      const setupBounds = await assertBounds('.cp-setup-dialog', layout);
      await dialog.locator('[data-creation-action="go-step"][data-step="6"]').click();
      assert.equal(await dialog.locator('[data-creation-action="apply"]').isEnabled(), true);
      await capture(`background-${id}-review-${layout}`);
      await dialog.locator('[data-creation-action="apply"]').click();
      const result = await collect();
      assert.equal(result.identity.background, background.label);
      assert.equal(result.templateSelections.backgroundId, id);
      for (const name of background.skillProficiencies) assert.equal(result.skills.find(skill => getSkillIdentity(skill.name) === getSkillIdentity(name)).proficiency, 'trained');
      for (const key of ['attributes', 'weapons', 'armorItems', 'resources', 'techniques', 'proficiencies']) assert.deepEqual(result[key], baseline[key], `${id}: ${key}`);
      assert.equal(result.hitPoints.current, baseline.hitPoints.current);
      assert.ok(result.quirks.some(entry => entry.id === 'development-trait-nuadat-riesenblut-6'));
      assert.ok(result.quirks.some(entry => entry.id === 'development-trait-pflichtbewusst'));
      await page.locator('[data-combat-action="open-character-setup"]').click();
      assert.equal(await page.locator('[data-creation-field="backgroundId"]').inputValue(), id);
      await page.locator('[data-creation-action="close"]').click();
      backgroundCases.push({ id, label: background.label, optionalSkills: background.skillProficiencies, ...setupBounds });
    }
    views.push({ layout, viewport: size, levelBounds, familyCard, familyCount: 12, generalCount: 30, backgroundCases,
      independentRankReplacement: true, baseScoresPreserved: true, currentHitPointsPreserved: true, equipmentPreserved: true, removalReversible: true });
  }
  assert.deepEqual(preview.errors, []);
  const sourcePaths = [
    'AleriaAlmanach/modules/character-development/development-family-traits.js',
    'AleriaAlmanach/modules/character-development/development-family-policy.js',
    'AleriaAlmanach/modules/character-development/development-general-traits.js',
    'AleriaAlmanach/modules/character-development/development-traits.js',
    'AleriaAlmanach/modules/character-development/development-ui.js',
    'AleriaAlmanach/modules/character-development/creation-background-templates.js',
    'AleriaAlmanach/styles/character-development.css'
  ];
  const sources = Object.fromEntries(await Promise.all(sourcePaths.map(async path => [path, createHash('sha256').update(await readFile(resolve(root, path))).digest('hex')])));
  const report = { passed: true, fixture: fixture.id, localOnly: true, externalWritesBlocked: true, views,
    screenshots, sources, blockedRequests, errors: preview.errors,
    visualInspection: 'Pending separate inspection of the saved PNGs; DOM assertions alone do not establish visual approval.' };
  await writeFile(resolve(output, 'report.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({ passed: true, output, screenshots, views: views.map(({ layout, backgroundCases }) => ({ layout, backgrounds: backgroundCases.map(entry => entry.id) })) }));
} catch (error) {
  await capture('failure');
  await writeFile(resolve(output, 'failure.json'), JSON.stringify({ error: error.message, stack: error.stack, screenshots, errors: preview.errors }, null, 2) + '\n');
  throw error;
} finally {
  await preview.close();
}
