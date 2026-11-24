import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { openVenueBrowserPreview } from './support/venue-browser-preview.mjs';

const character = { id: 'local-condition-interface', name: 'Lokale Prüffigur', combatProfile: {
  hitPoints: { current: 12, maximumOverride: 20 },
  weapons: [{ id: 'blade', name: 'Prüfklinge', damageFormula: '1d6', equipped: true }],
  conditions: [{ id: 'stun', name: 'Betäubt', active: true, mechanics: { blocksActions: true } }]
} };
const preview = await openVenueBrowserPreview('combat-condition-rules-20261122', { localOnly: true });
const { page } = preview;
try {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.evaluate(async character => {
    const { resolveCombatProfile } = await import('/AleriaAlmanach/modules/combat/combat-profile-resolver.js');
    const { renderMiniCombatProfile } = await import('/AleriaAlmanach/modules/combat-status/combat-profile-summary-view.js');
    const host = document.createElement('div'); host.id = 'local-condition-interface';
    host.style.cssText = 'position:fixed;inset:0;z-index:999999;background:#f3e7cc;overflow:auto;padding:16px;color:#30271f';
    host.innerHTML = `<section style="max-width:460px">${renderMiniCombatProfile(resolveCombatProfile(character), character.name)}</section><div id="local-condition-segments"><div data-segment-id="local-combat"><div data-segment-mechanics-host></div></div><div data-segment-id="local-skill"><div data-segment-mechanics-host></div></div></div>`;
    document.body.append(host);
    globalThis.getAvailableCommentCharacters = () => [character];
    globalThis.getAvailableCommentCharacterById = id => id === character.id ? character : null;
    globalThis.getCachedCommentsForThread = () => [];
    globalThis.localConditionCharacter = character;
    globalThis.localConditionSegments = [
      { id: 'local-combat', kind: 'combataction', mechanicMode: 'combat', characterId: character.id, combatActionId: 'weapon:blade', text: 'Lokale Kampfhandlung' },
      { id: 'local-skill', kind: 'thought', mechanicMode: 'skill', skillId: 'investigation', characterId: character.id, text: 'Lokale Probe' }
    ];
    const list = document.getElementById('local-condition-segments');
    AleriaSkillChecks.mountComposer(list, { segments: localConditionSegments, selectedCharacterId: character.id, threadId: 'local-condition-interface' });
    AleriaCombat.mountComposer(list, { segments: localConditionSegments, selectedCharacterId: character.id, threadId: 'local-condition-interface' });
  }, character);
  const host = page.locator('#local-condition-interface');
  const combat = host.locator('[data-segment-id="local-combat"]');
  const skill = host.locator('[data-segment-id="local-skill"]');
  assert.match(await combat.locator('.combat-composer-warning').innerText(), /Betäubt/);
  assert.equal(await combat.locator('[data-combat-select-action="combat:wait"]').isEnabled(), true);
  assert.match(await skill.locator('[data-skill-action-block]').innerText(), /Betäubt/);
  await combat.locator('[data-combat-select-action="combat:wait"]').scrollIntoViewIfNeeded();
  assert.ok(await combat.locator('[data-combat-select-action="combat:wait"]').evaluate(element => element.getBoundingClientRect().height >= 40));
  await preview.capture('blocked-action-desktop');
  await page.setViewportSize({ width: 390, height: 844 });
  await combat.locator('[data-combat-select-action="combat:wait"]').scrollIntoViewIfNeeded();
  assert.ok(await host.evaluate(element => element.scrollWidth <= element.clientWidth + 2));
  await preview.capture('blocked-action-phone');
  await combat.locator('[data-combat-select-action="combat:wait"]').click();
  assert.equal(await page.evaluate(() => localConditionSegments[0].combatActionId), 'combat:wait');
  assert.equal(await combat.locator('.combat-composer-warning').count(), 0);
  assert.match(await combat.locator('[data-combat-wait-guidance]').innerText(), /keine bewusste Handlung erfinden/);
  assert.equal(await combat.locator('[data-role="payment-toggle"]').isEnabled(), true);
  await skill.locator('[data-skill-action-block] [data-value="normal"]').click();
  assert.equal(await page.evaluate(() => localConditionSegments[1].mechanicMode), 'normal');
  assert.equal(await skill.locator('[data-skill-action-block]').count(), 0);
  await page.evaluate(() => {
    Object.assign(localConditionSegments[1], { kind: 'interact', mechanicMode: 'skill', skillId: 'save:dexterity' });
    AleriaSkillChecks.mountComposer(document.getElementById('local-condition-segments'), { segments: localConditionSegments,
      selectedCharacterId: localConditionCharacter.id, threadId: 'local-condition-interface' });
  });
  assert.equal(await skill.locator('[data-skill-action-block]').count(), 0);
  await page.evaluate(async () => {
    const { openCombatStatusDialog } = await import('/AleriaAlmanach/modules/combat-status/combat-status-controller.js');
    openCombatStatusDialog({ characterId: localConditionCharacter.id, actorId: localConditionCharacter.id, threadId: 'local-condition-interface' });
  });
  const dialog = page.locator('.combat-status-dialog[open]');
  await dialog.locator('[name="presetId"]').selectOption('stunned');
  assert.match(await dialog.locator('[data-status-preview]').innerText(), /1 eigener Beitrag/);
  assert.doesNotMatch(await dialog.locator('[data-status-preview]').innerText(), /Aus dem Charakterbogen/);
  await dialog.locator('[name="durationKind"]').selectOption('scene-comments');
  await dialog.locator('[name="durationAmount"]').fill('3');
  await dialog.locator('.combat-status-modifiers > summary').click();
  await dialog.locator('[name="modifier-attack"]').fill('-2');
  assert.match(await dialog.locator('[data-status-preview]').innerText(), /3 Szenenbeiträge/);
  assert.match(await dialog.locator('[data-status-preview]').innerText(), /Angriff −2/);
  await preview.capture('temporary-condition-preview-phone');
  await page.setViewportSize({ width: 1440, height: 1000 });
  await preview.capture('temporary-condition-preview-desktop');
  const livePreview = dialog.locator('[data-status-preview]');
  await dialog.locator('[name="presetId"]').selectOption('frostburn');
  assert.match(await livePreview.innerText(), /Bewegung \(m\) −3/);
  assert.match(await livePreview.innerText(), /GES-Rettung −1/);
  await dialog.locator('[name="durationKind"]').selectOption('permanent');
  assert.match(await livePreview.innerText(), /Bis zum Entfernen/);
  await dialog.evaluate(element => { element.scrollTop = 0; });
  await preview.capture('frostbrand-desktop');
  await page.setViewportSize({ width: 390, height: 844 });
  await dialog.locator('[name="presetId"]').selectOption('burning');
  assert.match(await livePreview.innerText(), /2 Feuer-Schaden zu Beginn jedes eigenen Beitrags/);
  await dialog.locator('[name="presetId"]').scrollIntoViewIfNeeded();
  await preview.capture('brennend-mobil');
  await dialog.locator('[data-status-close]').first().click();
  await host.evaluate(element => { element.hidden = true; });
  for (const kind of ['ability', 'technique', 'spell']) {
    await page.evaluate(async kind => {
      const { openCombatEntryEditor } = await import('/AleriaAlmanach/modules/combat/ui/combat-entry-editor.js');
      openCombatEntryEditor({ kind, item: { id: 'voice-test', name: 'Stimmprüfung', requiresVoice: true, level: 0,
        activationType: 'action', rollFormula: '1d4', damageFormula: '1d4', effects: [] } });
    }, kind);
    const editor = page.locator('#combat-entry-editor-overlay');
    assert.equal(await editor.locator('[data-entry-field="requiresVoice"]').isChecked(), true);
    await editor.locator('[data-entry-field="requiresVoice"]').uncheck();
    await editor.locator('[data-entry-action="close"]').first().click();
  }
  for (const [kind, path] of [['weapon', 'effects.0'], ['quirk', 'triggerRules.0.resultEffects.0']]) {
    await page.evaluate(async kind => {
      const { openCombatEntryEditor } = await import('/AleriaAlmanach/modules/combat/ui/combat-entry-editor.js');
      const effect = { id: 'status-effect', type: 'apply-condition', target: 'target', on: 'hit' };
      const item = { id: 'status-source', name: kind === 'weapon' ? 'Prüfklinge' : 'Eisige Wut', damageFormula: '1d4',
        ...(kind === 'weapon' ? { effects: [effect] } : { triggerRules: [{ id: 'test-trigger', resultEffects: [effect] }] }) };
      openCombatEntryEditor({ kind, item, onSave: entry => { window.localConditionSource = entry; } });
    }, kind);
    const editor = page.locator('#combat-entry-editor-overlay');
    const preset = editor.locator(`[data-entry-condition-preset="${path}.condition"]`);
    await preset.selectOption('frostburn');
    assert.equal(await editor.locator(`[data-entry-field="${path}.condition.name"]`).inputValue(), 'Frostbrand');
    assert.equal(await editor.locator(`[data-entry-field="${path}.condition.durationModel.kind"]`).inputValue(), 'actor-comments');
    assert.equal(await editor.locator(`[data-entry-field="${path}.condition.durationModel.remainingActorComments"]`).inputValue(), '1');
    await preset.scrollIntoViewIfNeeded();
    await preview.capture(`zustandsquelle-${kind}`);
    await editor.locator('[data-entry-action="save"]').click();
    const stored = await page.evaluate(path => path.split('.').reduce((value, key) => value[key], window.localConditionSource), path);
    assert.equal(stored.condition.presetId, 'frostburn');
    assert.equal(stored.condition.mechanics.movement, -3);
    assert.equal(stored.condition.durationModel.remainingActorComments, 1);
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.evaluate(() => openCharProfile(''));
  await page.locator('[data-char-profile-tab="combat"]').click();
  await page.evaluate(() => {
    const draft = structuredClone(localConditionCharacter);
    draft.combatProfile.conditions = [{ id: 'lasting-probe', name: 'Alte Verletzung', active: true }];
    AleriaCharacterCombatProfile.init(draft);
  });
  await page.locator('#cp-tab-combat [data-sheet-page="traits"]').click();
  const ongoing = page.locator('[data-combat-condition-preset="lasting-probe"]');
  await ongoing.locator('xpath=ancestor::details[1]').locator('summary').first().click();
  await ongoing.selectOption('slowed');
  const permanent = await page.evaluate(() => AleriaCharacterCombatProfile.collect().conditions.find(entry => entry.id === 'lasting-probe'));
  assert.equal(permanent.presetId, 'slowed');
  assert.equal(permanent.mechanics.movement, -3);
  assert.equal(permanent.durationModel, undefined);
  const permanentIcon = page.locator('[data-combat-entry-kind="condition"][data-combat-entry-id="lasting-probe"]');
  assert.match(await permanentIcon.getAttribute('src'), /diamonds-v2\/slowed\.webp$/);
  await permanentIcon.evaluate(image => image.decode());
  await ongoing.scrollIntoViewIfNeeded();
  await preview.capture('dauerhafter-bogenzustand');
  await page.getByRole('button', { name: 'Charakterprofil schließen', exact: true }).click();
  assert.deepEqual(await page.evaluate(() => localConditionCharacter), character);
  assert.deepEqual(preview.errors, []);
  await writeFile(resolve(preview.output, 'report.json'), JSON.stringify({ passed: true, waitShortcut: true, voluntaryCheckReason: true,
    narrativeEscape: true, savingThrowsAllowed: true, manualPreviewMatchesDraft: true, mobileOverflow: false,
    typedConditionPreview: true, indefiniteSceneDuration: true, weaponAndQuirkAuthoring: true, permanentSheetCondition: true,
    sourceProfilePreserved: true, externalWritesBlocked: true, errors: preview.errors }, null, 2) + '\n');
  console.log(JSON.stringify({ passed: true, output: preview.output }));
} catch (error) { await preview.capture('failure'); throw error; }
finally { await preview.close(); }
