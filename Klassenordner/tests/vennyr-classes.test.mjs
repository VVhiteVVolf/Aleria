import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { VENNYR_CLASS_IDS, getVennyrClassDefinition } from '../../AleriaAlmanach/modules/classes/vennyr/vennyr-class-registry.js';
import { getVennyrClassProgression } from '../../AleriaAlmanach/modules/classes/vennyr/vennyr-class-progression.js';
import { getCenyrClassProgression } from '../../AleriaAlmanach/modules/classes/cenyr/cenyr-class-progression.js';
import { getCultureClassProgression } from '../modules/culture/culture-class-progression.js';
import { SIRENENTANZ_FORM_IDS as F } from '../../AleriaAlmanach/modules/combat-styles/sirenentanz/sirenentanz-forms.js';
import { resolveTechniqueDamageFormula, getTechniqueDamageScaling } from '../../AleriaAlmanach/modules/combat/combat-technique-damage.js';
import { parseDamageFormula } from '../../AleriaAlmanach/modules/combat/rules/combat-mvp-rules.js';
import { classifyCharacterArchiveEntries, getCharacterArchiveClassGroups } from '../../AleriaAlmanach/modules/character-archive/character-archive-classification.js';
import { getCharacterArchiveClassLinks } from '../../AleriaAlmanach/modules/character-archive/character-archive-class-links.js';
import { getClassPageIcon } from '../../AleriaAlmanach/modules/classes/class-icon-registry.js';
import { resolveCultureClassDocument } from '../modules/culture/culture-class-content.js';

const plans = VENNYR_CLASS_IDS.map(id => getVennyrClassProgression(id, 20));
const attacks = plans.flatMap(plan => plan.attackCatalog);
const root = new URL('../../', import.meta.url);
function damageBounds(attack, level, formula = '1d10') {
  const damage = resolveTechniqueDamageFormula(attack, { damageFormula: formula }, { progression: { level } });
  const parsed = parseDamageFormula(damage);
  const terms = parsed.terms || [{ diceCount: parsed.diceCount, sides: parsed.sides }];
  return { maximum: terms.reduce((total, term) => total + term.diceCount * term.sides, parsed.fixedModifier),
    mean: terms.reduce((total, term) => total + term.diceCount * (term.sides + 1) / 2, parsed.fixedModifier) };
}

test('Vennyr plans contain coherent 1–20 progression, budgets and three expert paths', () => {
  assert.equal(plans.length, 6);
  for (const plan of plans) {
    assert.equal(plan.levels.length, 20);
    assert.equal(plan.techniqueBudget.total, plan.techniqueBudget.slots.length);
    assert.equal(new Set(plan.techniqueBudget.slots.map(slot => slot.id)).size, plan.techniqueBudget.total);
    assert.equal(plan.pathOptions.length, plan.classId === 'milwr' ? 0 : 3);
    for (const slot of plan.techniqueBudget.slots) {
      assert(plan.attackCatalog.some(attack => attack.minimumLevel <= slot.level && attack.cultureTraining.slotBands.includes(slot.band)), `${plan.name} ${slot.id}`);
    }
    for (const form of plan.styles[0].forms) {
      assert(form.techniques.length > 0);
      assert(form.techniques.every(attack => attack.minimumLevel >= form.minimumLevel && attack.minimumLevel <= form.maximumTrainingLevel));
      if (form.isChoice) {
        assert.equal(form.minimumLevel, 9);
        assert.equal(form.maximumTrainingLevel, 20);
        assert(form.techniques.length >= plan.techniqueBudget.bands.expert.count, 'A single path can fill its expert budget');
        assert.deepEqual(form.features.map(feature => feature.minimumLevel), [9, 13, 17]);
      }
    }
  }
});

test('draft plans never grant or activate abilities and have stable unique IDs', () => {
  assert.equal(new Set(attacks.map(attack => attack.id)).size, attacks.length);
  for (const plan of plans) {
    assert.equal(plan.status, 'draft');
    assert.deepEqual(plan.combatStyleGrants, []);
    assert.deepEqual(plan.availableAttacks, []);
    assert(plan.attackCatalog.every(attack => attack.status === 'draft' && !attack.active && !attack.live));
  }
  const changed = getVennyrClassProgression('morwyr', 5);
  changed.attackCatalog[0].name = 'Changed';
  changed.classFeatures[0].description = 'Changed';
  assert.notEqual(getVennyrClassProgression('morwyr', 5).attackCatalog[0].name, 'Changed');
  assert.notEqual(getVennyrClassDefinition('morwyr').classFeatures[0].description, 'Changed');
  assert.equal(getVennyrClassProgression('missing'), null);
  assert.equal(getCultureClassProgression('cenyr-teulu', 5).id, 'cenyr-teulu');
  assert.equal(getCultureClassProgression('vennyr-ceidwyn', 5).id, 'vennyr-ceidwyn');
  for (const [input, expected] of [[0, 1], [31, 20], ['bad', 1], [Infinity, 1]]) assert.equal(getVennyrClassProgression('morwyr', input).selectedLevel, expected);
});

test('Ceidwyn and Rhiddwyr keep usable ranged and melee paths throughout training', () => {
  for (const id of ['ceidwyn', 'rhiddwyr']) {
    const plan = getVennyrClassProgression(id, 20);
    for (const form of plan.styles[0].forms) {
      const damaging = form.techniques.filter(attack => attack.effects.some(effect => effect.type === 'damage'));
      assert(damaging.some(attack => attack.weaponTypes.some(type => ['bow', 'crossbow'].includes(type))), `${id}: ${form.name} ranged`);
      assert(damaging.some(attack => !attack.weaponTypes.some(type => ['bow', 'crossbow'].includes(type))), `${id}: ${form.name} melee`);
    }
  }
  const ceidwyn = getVennyrClassProgression('ceidwyn', 6);
  assert(ceidwyn.attackCatalog.some(attack => attack.minimumLevel <= 6 && attack.weaponLabel === 'Säbel'));
  assert(ceidwyn.attackCatalog.some(attack => attack.minimumLevel <= 6 && attack.weaponLabel === 'Dreizack'));
});

test('Derwyn has all three physical weapon paths in every phase and no spells', () => {
  const plan = getVennyrClassProgression('derwyn', 20);
  assert.deepEqual(plan.cultures, ['Cenyr', 'Vennyr']);
  for (const form of plan.styles[0].forms) {
    for (const weapon of ['staff', 'trident', 'mace']) assert(form.techniques.some(attack => attack.cultureTraining.branchId === `derwyn-${weapon}`), `${form.name}: ${weapon}`);
  }
  assert(plan.attackCatalog.every(attack => attack.effects.every(effect => effect.type !== 'heal' && effect.magical !== true)));
  assert(plan.attackCatalog.every(attack => !attack.costs.some(cost => ['mana', 'celestial-points'].includes(cost.resourceId))));
  assert(plan.pendingFeatures.some(feature => /Wiederherstellung/.test(feature.name)));
});

test('Sirenentanz uses bounded weapon dice, one replacement scaling die and no automatic extra hits', () => {
  const damaging = attacks.filter(attack => attack.effects.some(effect => effect.type === 'damage'));
  for (const attack of damaging) {
    assert.equal(attack.damageModel.weaponDiceMultiplier, 1);
    assert.equal(attack.maximumTargets, 1);
    assert.equal(attack.followUpAttack.enabled, false);
    if (attack.minimumLevel <= 6) assert(damageBounds(attack, attack.minimumLevel).maximum <= 20, attack.name);
    if (attack.costs.length === 1 && attack.costs[0].resourceId === 'bonus-action') assert.equal(attack.damageFormula, '1d6');
    for (let level = attack.minimumLevel; level < 20; level++) assert(damageBounds(attack, level + 1).mean >= damageBounds(attack, level).mean, attack.name);
  }
  const first = getVennyrClassProgression('morwyr').attackCatalog.find(attack => attack.minimumLevel === 2);
  assert.equal(getTechniqueDamageScaling(first, { progression: { level: 7 } }).formula, '1d4');
  assert.equal(getTechniqueDamageScaling(first, { progression: { level: 17 } }).formula, '1d10');
  assert.equal(resolveTechniqueDamageFormula(first, { damageFormula: '1d10' }, { progression: { level: 17 } }), '2d10+1d6');
  for (const attack of attacks.filter(attack => !attack.effects.some(effect => effect.type === 'damage'))) {
    assert.equal(attack.damageFormula, '');
    assert.deepEqual(attack.damageModel.scalingSteps, []);
  }
});

test('resources and short-lived conditions match the existing combat contract', () => {
  const plan = getVennyrClassProgression('ceidwyn');
  assert.equal(plan.levels[6].resources['aura-focus'], 0);
  assert.equal(plan.levels[7].resources['aura-focus'], 1);
  assert.equal(plan.levels[19].resources['aura-focus'], 4);
  assert.deepEqual([1, 8, 10, 15, 20].map(level => plan.levels[level - 1].resources['special-action']), [2, 3, 4, 5, 6]);
  for (const id of ['action', 'bonus-action', 'reaction']) assert.equal(plan.levels[19].resources[id], 2);
  for (const attack of attacks) {
    assert(attack.costs.length > 0 && attack.costs.every(cost => cost.amount === 1));
    assert.equal(attack.auraBypass.cost, 1);
    assert.equal(attack.auraBypass.allowed, true);
    if (attack.minimumLevel < 8) assert(!attack.costs.some(cost => cost.resourceId === 'aura-focus'));
    if (attack.costs.some(cost => cost.resourceId === 'special-action')) assert(attack.costs.length >= 2);
    if (attack.costs.length === 1 && attack.costs[0].resourceId === 'reaction') assert(!attack.effects.some(effect => effect.type === 'damage'));
    for (const effect of attack.effects.filter(effect => effect.condition)) {
      assert.equal(effect.condition.durationModel.kind, 'actor-comments');
      assert.equal(effect.condition.durationModel.remainingActorComments, 1);
      assert.equal(effect.condition.tags, 'Sirenentanz');
    }
  }
});

test('Milwr keeps cultural alternatives and stops its weapon curriculum at 15', () => {
  const plan = getVennyrClassProgression('milwr', 20);
  assert.equal(plan.techniqueBudget.total, 9);
  assert(plan.attackCatalog.every(attack => attack.minimumLevel <= 15));
  assert.deepEqual(plan.formIds, [F.foundation, F.militia]);
  const first = plan.attackCatalog[0];
  assert.equal(resolveTechniqueDamageFormula(first, { damageFormula: '1d8' }, { progression: { level: 15 } }), resolveTechniqueDamageFormula(first, { damageFormula: '1d8' }, { progression: { level: 20 } }));
  assert.equal(getCenyrClassProgression('milwr', 20).styles[0].id, 'drachentanz');
});

test('archive resolves Vennyr pages and both shared culture memberships', async () => {
  for (const plan of plans) {
    const [entry] = classifyCharacterArchiveEntries([{ kind: 'class', name: plan.name, data: { id: plan.templateId } }]);
    const links = getCharacterArchiveClassLinks(entry);
    assert(links.some(link => link.href.endsWith(plan.pagePath)));
    assert(entry.data.cultureClassProfiles.some(profile => profile.id === plan.id));
    assert.equal(getClassPageIcon(plan.classId === 'milwr' ? 'vennyr-milwr' : plan.classId).pageName, plan.name);
    for (const link of links) await access(new URL(link.href.slice(3), root));
    if (['milwr', 'derwyn'].includes(plan.classId)) {
      const names = getCharacterArchiveClassGroups([entry]).map(group => group.name);
      assert(names.includes('Cenyr') && names.includes('Vennyr'));
    }
  }
});

test('all six documents preserve source art dimensions, clean lore and readable navigation', async () => {
  const culture = JSON.parse(await readFile(new URL('Klassenordner/Vennyr/kultur.json', root), 'utf8'));
  for (const id of VENNYR_CLASS_IDS) {
    const doc = resolveCultureClassDocument(JSON.parse(await readFile(new URL(`Klassenordner/Vennyr/${id}/klasse.json`, root), 'utf8')), culture);
    const page = await readFile(new URL(`Klassenordner/Vennyr/${id}/index.html`, root), 'utf8');
    assert.match(page, new RegExp(`<h1>Der ${doc.name}</h1>`));
    assert(page.includes('Sirenentanz') && page.includes('data-role="training-level"'));
    assert(page.includes('data-role="training-weapon"'));
    assert(!/animexx|Titel hier|〈Clanname〉|Beschreibung \.\.\./i.test(page));
    assert(!/\bon(?:click|change|input)\s*=/i.test(page));
    assert.equal((page.match(/data-training-row="/g) || []).length, 20);
    if (id === 'ceidwyn') assert(doc.artwork.width / doc.artwork.height > 2);
    if (id === 'rhiddwyr') assert.equal(doc.artwork.width / doc.artwork.height, 1.5);
  }
});
