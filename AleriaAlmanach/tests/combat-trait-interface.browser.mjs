import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { openVenueBrowserPreview } from './support/venue-browser-preview.mjs';
import { sanitizeCharacterCombatProfile } from '../modules/combat/combat-profile-model.js';

const profile = sanitizeCharacterCombatProfile({ attributes: [{ key: 'intelligence', score: 14 }, { key: 'wisdom', score: 14 }],
  quirks: [{ id: 'interface-trait', name: 'Prüfmerkmal', active: true, description: 'Begrenzte Testprägung.', mechanics: {
    attributeModifiers: [{ attributeKey: 'intelligence', bonus: 2 }], attributeCaps: [{ attributeKey: 'wisdom', maximum: 3 }],
    skillModifiers: [{ name: 'Nachforschungen', bonus: 1 }], skillProficiencies: [{ name: 'Naturkunde', proficiency: 'expertise' }],
    naturalOneReroll: true, savingThrow: 1
  } }], progression: { level: 1 }, hitPoints: { current: 8 } });
const character = { id: 'local-interface-test', name: 'Lokale Prüffigur', combatProfile: profile };
const preview = await openVenueBrowserPreview('combat-trait-interface-20261103');
const { page } = preview;
try {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.evaluate(character => { openCharProfile(null); switchCharTab('combat'); AleriaCharacterCombatProfile.init(character); }, character);
  const baseline = await page.evaluate(() => AleriaCharacterCombatProfile.collect());
  await page.locator('[data-sheet-page="traits"]').click();
  const trait = page.locator('[data-sheet-entry="quirks:interface-trait"]');
  await trait.locator('summary').click();
  assert.match(await trait.innerText(), /INT-Wert \+2/);
  assert.match(await trait.innerText(), /WEI-Wert höchstens 3/);
  assert.match(await trait.innerText(), /Naturkunde: Expertise/);
  assert.match(await trait.innerText(), /Natürliche 1: einmal/);
  await trait.locator('[data-combat-action="edit-detail-item"]').click();
  const editor = page.locator('#combat-entry-editor-overlay');
  assert.match(await editor.locator('[data-entry-role="mechanics-summary"]').innerText(), /Naturkunde: Expertise/);
  await editor.locator('[data-entry-field="mechanics.naturalOneReroll"]').uncheck();
  assert.doesNotMatch(await editor.locator('[data-entry-role="mechanics-summary"]').innerText(), /Natürliche 1:/);
  await editor.locator('[data-entry-action="close"]').first().click();
  assert.deepEqual(await page.evaluate(() => AleriaCharacterCombatProfile.collect()), baseline);
  await page.locator('[data-combat-action="open-level-up"]').click();
  await page.locator('.development-effective-attributes > summary').click();
  assert.match(await page.locator('[data-development-role="effective-attributes"]').innerText(), /Intelligenz\s+16 \(\+3\)/);
  assert.match(await page.locator('[data-development-role="effective-attributes"]').innerText(), /Weisheit\s+3 \(−4\)/);
  await preview.capture('level-up-effective-desktop');
  await page.locator('[data-combat-action="close-level-up"]').first().click();
  await page.locator('[data-combat-action="open-character-setup"]').click();
  await page.locator('[data-creation-action="go-step"][data-step="4"]').click();
  await page.locator('[data-level-up-path="targetLevel"]').fill('4');
  await page.locator('[data-level-up-attribute="intelligence"]').fill('2');
  await page.locator('[data-creation-action="go-step"][data-step="6"]').click();
  assert.match(await page.locator('.cp-setup-review-grid').innerText(), /Wirksame Attribute\s+KRF 10 · GES 10 · KON 10 · INT 18 · WEI 3 · CHA 10/i);
  await preview.capture('creation-effective-review-desktop');
  await page.locator('[data-creation-action="close"]').click();
  await page.evaluate(character => {
    closeCharProfile();
    const creature = { ...character, entityType: 'creature', id: 'local-creature-interface-test', name: 'Lokales Prüftier', level: 1,
      combatProfile: { ...character.combatProfile, magic: { enabled: true, spells: [{ id: 'local-cantrip', name: 'Prüftrick', level: 0, rollFormula: '1d4', prepared: true }] } } };
    document.dispatchEvent(new CustomEvent('aleria:item-register-records', { detail: { creaturesReady: true, creatures: [creature] } }));
    AleriaCreatures.open(creature.id);
  }, character);
  assert.match(await page.locator('[data-creature-effective-attribute="intelligence"]').innerText(), /INT 16 \(\+3\)/);
  await page.locator('[data-creature-page="combat"]').click();
  assert.match(await page.locator('[data-attribute-key="intelligence"]').locator('..').innerText(), /Wirksam 16/);
  await preview.capture('creature-effective-attributes-desktop');
  await page.locator('[data-creature-page="abilities"]').click();
  assert.match(await page.locator('#creature-sheet-root').innerText(), /Naturkunde: Expertise/);
  await page.locator('[data-creature-page="magic"]').click();
  assert.equal(await page.locator('[data-spell-field="manaCost"]').inputValue(), '2');
  assert.equal(await page.locator('[data-spell-field="manaCost"]').getAttribute('readonly'), '');
  await page.locator('[data-creature-action="close"]').first().click();
  await page.evaluate(async character => {
    closeCharProfile();
    const { resolveCombatProfile } = await import('/AleriaAlmanach/modules/combat/combat-profile-resolver.js');
    const { renderMiniCombatProfile } = await import('/AleriaAlmanach/modules/combat-status/combat-profile-summary-view.js');
    const host = document.createElement('div'); host.id = 'local-trait-interface';
    host.style.cssText = 'position:fixed;inset:0;z-index:999999;background:#f3e7cc;overflow:auto;padding:16px;color:#30271f';
    host.innerHTML = `<section style="max-width:460px">${renderMiniCombatProfile(resolveCombatProfile(character), character.name)}</section><div id="local-save-segments"><div data-segment-id="local-save"><div data-segment-mechanics-host></div></div></div>`;
    document.body.append(host);
    globalThis.getAvailableCommentCharacters = () => [character];
    globalThis.getAvailableCommentCharacterById = id => id === character.id ? character : null;
    globalThis.getCachedCommentsForThread = () => [];
    globalThis.localTraitSaveSegment = { id: 'local-save', kind: 'interact', mechanicMode: 'skill', skillId: 'save:dexterity', characterId: character.id, text: 'Lokale Probe', skillDifficulty: 12 };
    AleriaSkillChecks.mountComposer(document.getElementById('local-save-segments'), { segments: [localTraitSaveSegment], selectedCharacterId: character.id, threadId: 'local-trait-interface' });
  }, character);
  const host = page.locator('#local-trait-interface');
  await host.locator('[data-profile-details-key="attributes"] > summary').click();
  await host.locator('[data-profile-details-key="traits"] > summary').click();
  assert.match(await host.innerText(), /Intelligenz 16 \(\+3\)/);
  assert.match(await host.innerText(), /Prüfmerkmal · aktiv/);
  await host.evaluate(element => element.scrollTop = 0);
  await preview.capture('scene-traits-desktop');
  await host.locator('[data-skill-input="saveActionKind"]').selectOption('spell');
  await host.locator('[data-skill-input="saveDamageType"]').selectOption('gift');
  assert.equal(await host.locator('[data-skill-save-tag="poison"]').isChecked(), true);
  await host.locator('[data-skill-save-tag="fear"]').check();
  const context = await page.evaluate(() => localTraitSaveSegment.skillSaveContext);
  assert.deepEqual(context, { actionKind: 'spell', damageType: 'gift', saveTags: ['poison', 'fear'] });
  await host.locator('[data-skill-input="saveActionKind"]').scrollIntoViewIfNeeded();
  await preview.capture('scene-save-context-desktop');
  await page.setViewportSize({ width: 390, height: 844 });
  assert.ok(await host.evaluate(element => element.scrollWidth <= element.clientWidth + 2));
  await host.evaluate(element => element.scrollTop = 0);
  await preview.capture('scene-traits-phone');
  await host.locator('[data-skill-input="saveActionKind"]').scrollIntoViewIfNeeded();
  await preview.capture('scene-save-context-phone');
  assert.deepEqual(preview.errors, []);
  await writeFile(resolve(preview.output, 'report.json'), JSON.stringify({ passed: true, baseProfilePreserved: true, structuredTraits: true,
    effectiveAttributes: true, creationAfterIncreases: true, sceneTraits: true, explicitSaveContext: context, mobileOverflow: false,
    externalWritesBlocked: true, errors: preview.errors }, null, 2) + '\n');
  console.log(JSON.stringify({ passed: true, output: preview.output }));
} catch (error) {
  await preview.capture('failure'); throw error;
} finally { await preview.close(); }
