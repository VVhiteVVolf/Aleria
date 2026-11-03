import test from 'node:test';
import assert from 'node:assert/strict';
import { getCombatStyle } from '../modules/combat-styles/combat-style-registry.js';
import { getCombatTechniqueIconSource } from '../modules/combat-styles/combat-technique-icons.js';
import { getCombatEntryIconPresentation } from '../modules/combat/combat-entry-icons.js';
import { getCharacterSheetEntryIconPresentation } from '../modules/character-archive/character-archive-icons.js';
import { getCenyrClassProgression } from '../modules/classes/cenyr/cenyr-class-progression.js';
import { getDevelopmentAttackCatalog } from '../modules/character-development/development-purchases.js';
import { renderDevelopmentAttacks } from '../modules/character-development/development-ui.js';
import { renderArsenalCard, renderArsenalDetail } from '../modules/combat/ui/combat-arsenal-view.js';
import { renderCultureClassTraining } from '../../Klassenordner/modules/culture/culture-class-training-template.js';
import { sanitizeCharacterCombatProfile } from '../modules/combat/combat-profile-model.js';
import { previewCharacterLevelUp } from '../modules/combat/combat-level-up-model.js';
import { resolveCombatProfile } from '../modules/combat/combat-profile-resolver.js';
import { CombatResolutionService } from '../modules/combat/combat-resolution-service.js';

const technique = getCombatStyle('drachentanz').forms.flatMap(form => form.techniques)
  .find(entry => entry.minimumLevel === 1 && entry.weaponTypes.includes('sword'));

test('canonical martial icons survive sheet and archive projections while explicit artwork wins', () => {
  const source = getCombatTechniqueIconSource(technique);
  assert.match(source, /\/assets\/combat-technique-icons\/[^/]+\.png$/);
  assert.equal(getCombatEntryIconPresentation('technique', technique).source, source);
  assert.equal(getCombatEntryIconPresentation('technique', { ...technique, icon: '/personal.png' }).source, '/personal.png');
  assert.equal(getCharacterSheetEntryIconPresentation('technique', { ...technique, catalogOrigin: { id: 'legacy-origin' } }, []).source, source);
  const archive = [{ kind: 'technique', name: technique.name, data: { description: 'Aus dem Archiv' } }];
  const linked = getCharacterSheetEntryIconPresentation('technique', technique, archive);
  assert.equal(linked.linked, true);
  assert.equal(linked.source, source);
  assert.equal(getCharacterSheetEntryIconPresentation('technique', technique, [{ ...archive[0], iconOverride: '/archive.png' }]).source, '/archive.png');
});

test('class pages show martial icons and explain individual purchases with the current damage progression', () => {
  const html = renderCultureClassTraining(getCenyrClassProgression('teulu', 20));
  assert.match(html, /class="cenyr-attack-icon"[^>]+combat-technique-icons\//);
  assert.match(html, /Einzeln im Stufenassistenten kaufen/);
  assert.match(html, /Ältere Bögen ohne Kaufmodus/);
  assert.match(html, /Reine Bonusangriffe und Flächenattacken erhalten keinen Ausbildungswürfel/);
  assert.doesNotMatch(html, /Angriffe aus Stufe 7–8 erhalten ab 9 \+1W4/);
});

test('purchase choices and arsenal cards render the technique artwork without changing choice identities', () => {
  const entry = getDevelopmentAttackCatalog().find(entry => entry.technique.id === technique.id);
  assert.ok(entry);
  const profile = { techniques: [], templateSelections: { classId: 'teulu' } };
  const purchaseHtml = renderDevelopmentAttacks(profile, { plan: { targetLevel: 1, purchaseIds: [entry.id], purchaseClass: 'selected', development: {} } });
  assert.match(purchaseHtml, /class="development-attack-icon"[^>]+combat-technique-icons\//);
  assert.ok(purchaseHtml.includes(`data-development-purchase="${entry.id}"`));
  const choice = { action: { id: `technique:${technique.id}`, kind: 'technique', costs: [] }, entry: technique,
    label: technique.name, group: 'Jungdrache', groupKey: 'drachentanz', minimumLevel: 1,
    weaponCategory: { id: 'one-handed', label: 'Schwert', icon: 'one-handed' } };
  const card = renderArsenalCard({ resources: [] }, choice, choice.action.id);
  assert.match(card, /class="combat-arsenal-technique-icon"[^>]+combat-technique-icons\//);
  assert.match(card, /aria-pressed="true"/);
  assert.match(renderArsenalDetail({ resources: [] }, choice), /combat-arsenal-technique-icon-detail/);
  assert.doesNotMatch(renderArsenalCard({ resources: [] }, { ...choice, action: { ...choice.action, kind: 'weapon' } }, ''), /combat-arsenal-technique-icon/);
});

test('a confirmed Morwyr purchase displays its new icon and executes its paid axe attack', async () => {
  const entry = getDevelopmentAttackCatalog().find(entry => entry.curriculumId === 'vennyr-morwyr'
    && entry.technique.id.endsWith('-plankenspalter'));
  assert.ok(entry, 'The confirmed Vennyr technique is a real purchase option');
  assert.equal(entry.technique.status, 'confirmed');
  const before = sanitizeCharacterCombatProfile({
    templateSelections: { classId: 'morwyr' }, identity: { archetype: 'Morwyr', ancestry: 'Vennyr' },
    progression: { level: 1 }, hitPoints: { current: 30, maximumOverride: 30 },
    combat: { mainHandWeaponId: 'test-boarding-axe' },
    weapons: [{ id: 'test-boarding-axe', name: 'Enteraxt', weaponType: 'axe', weaponProfileId: 'boarding-axe',
      damageFormula: '1d6', damageType: 'Hieb', equipped: true }]
  });
  const snapshot = structuredClone(before);
  const preview = previewCharacterLevelUp(before, { targetLevel: 2, purchaseIds: [entry.id] });
  assert.equal(preview.ready, true, preview.errors.join(' '));
  const purchased = preview.profile.techniques.find(technique => technique.id === entry.technique.id);
  assert.ok(purchased);
  assert.equal(preview.profile.progression.development.purchases.filter(purchase => purchase.techniqueId === purchased.id).length, 1);
  assert.deepEqual(before, snapshot, 'The purchase preview leaves the original character untouched');
  const html = renderDevelopmentAttacks(before, { ...preview, plan: { ...preview.plan, purchaseClass: 'selected' } });
  assert.ok(html.includes(`src="${getCombatTechniqueIconSource(purchased)}"`));
  assert.ok(html.includes(`data-development-purchase="${entry.id}" checked`));
  const actor = resolveCombatProfile({ id: 'icon-ui-morwyr', name: 'Morwyr', combatProfile: preview.profile },
    { actionId: `technique:${purchased.id}` });
  assert.equal(actor.selectedAction.kind, 'technique');
  assert.notEqual(actor.selectedAction.compatible, false);
  const target = resolveCombatProfile({ id: 'icon-ui-target', name: 'Ziel', combatProfile: {
    hitPoints: { current: 30, maximumOverride: 30 }, armorClass: { override: 8 }
  } });
  const dice = {
    async rollAttack({ modifier = 0 }) { return { natural: 15, dice: [15], keptDice: [15], total: 15 + modifier }; },
    async rollDamage({ damageFormula, bonus = 0 }) { return { notation: damageFormula, keptDice: [4], total: 4 + bonus, modifier: bonus }; }
  };
  const result = await new CombatResolutionService(dice).resolveAttack({ actor, target });
  assert.equal(result.attack.hit, true);
  assert.ok(result.damage.total > 0);
  assert.ok(result.actorResourceSnapshot.changes.length > 0, 'The actual attack consumes its action cost');
});
