import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { ALDRIMAR_CLASS_IDS, getAldrimarClassDefinition } from '../../AleriaAlmanach/modules/classes/aldrimar/aldrimar-class-registry.js';
import { getAldrimarClassProgression } from '../../AleriaAlmanach/modules/classes/aldrimar/aldrimar-class-progression.js';
import { getSkjaldrBerserkProgression, getSkjaldrBerserkTiers } from '../../AleriaAlmanach/modules/classes/aldrimar/skjaldr-berserk-progression.js';
import { getCultureClassPageHref } from '../modules/culture/culture-class-registry.js';
import { getCultureClassProgression } from '../modules/culture/culture-class-progression.js';
import { getCultureClassDefinitions } from '../../AleriaAlmanach/modules/classes/culture-class-definitions.js';
import { ARCHIVE_PAGE_CLASSES } from '../../AleriaAlmanach/modules/character-archive/character-archive-page-data.js';
import { resolveTechniqueDamageFormula } from '../../AleriaAlmanach/modules/combat/combat-technique-damage.js';
import { parseDamageFormula } from '../../AleriaAlmanach/modules/combat/rules/combat-mvp-rules.js';
import { resolveCultureClassDocument } from '../modules/culture/culture-class-content.js';

const plans = ALDRIMAR_CLASS_IDS.map(id => getAldrimarClassProgression(id, 20));
const root = new URL('../../', import.meta.url);
function maximum(attack, level) {
  const parsed = parseDamageFormula(resolveTechniqueDamageFormula(attack, { damageFormula: '1d10' }, { progression: { level } }));
  return (parsed.terms || [parsed]).reduce((sum, term) => sum + term.diceCount * term.sides, parsed.fixedModifier);
}

test('Aldrimar separates Skjoldr and Skjaldr and connects all seven pages to archive and navigation', async () => {
  const culture = JSON.parse(await readFile(new URL('Klassenordner/Aldrimar/kultur.json', root), 'utf8'));
  const catalog = await readFile(new URL('Klassenordner/Klassenseite.html', root), 'utf8');
  for (const plan of plans) {
    const href = getCultureClassPageHref('aldrimar', plan.classId);
    assert.equal(href, `Aldrimar/${plan.classId}/index.html`);
    assert(catalog.includes(`href="${href}" id="klasse-aldrimar-${plan.classId}"`));
    const document = JSON.parse(await readFile(new URL(`Klassenordner/Aldrimar/${plan.classId}/klasse.json`, root), 'utf8'));
    resolveCultureClassDocument(document, culture);
    assert.match(document.source.sha256, /^[a-f0-9]{64}$/);
    const page = await readFile(new URL(`Klassenordner/${href}`, root), 'utf8');
    assert(page.includes(`data-culture-class="aldrimar-${plan.classId}"`));
    assert(!/animexx|Titel hier|Dialog von Figur|onclick=/i.test(page));
    assert(ARCHIVE_PAGE_CLASSES.find(entry => entry.id === plan.classId).pageLinks.some(link => link.path.endsWith(href)));
    assert.equal(getCultureClassDefinitions(plan.classId, ['Aldrimar'])[0].classId, plan.classId);
  }
  assert.equal(getAldrimarClassDefinition('Schildbeißer').classId, 'skjaldr');
  assert.equal(getAldrimarClassDefinition('skjoldr').classId, 'skjoldr');
});

test('class training stays read-only with coherent budgets, paths and level boundaries', () => {
  const attacks = plans.flatMap(plan => plan.attackCatalog);
  assert.equal(new Set(attacks.map(attack => attack.id)).size, attacks.length);
  assert.equal(attacks.length, 111);
  for (const plan of plans) {
    assert.equal(plan.levels.length, 20);
    assert.deepEqual(plan.combatStyleGrants, []);
    assert.deepEqual(plan.availableAttacks, []);
    assert.equal(plan.techniqueBudget.total, plan.techniqueBudget.slots.length);
    assert(plan.attackCatalog.every(attack => attack.status === 'draft' && !attack.live && !attack.active));
    for (const slot of plan.techniqueBudget.slots) assert(plan.attackCatalog.some(attack => attack.minimumLevel <= slot.level && attack.cultureTraining.slotBands.includes(slot.band)));
    for (const form of plan.styles.flatMap(style => style.forms)) {
      assert(form.techniques.every(attack => attack.minimumLevel >= form.minimumLevel && attack.minimumLevel <= form.maximumTrainingLevel));
      if (form.isChoice) assert(form.techniques.length >= plan.techniqueBudget.bands.expert.count);
    }
  }
  for (const id of ['skjoldr', 'thegnar', 'skeidr', 'skjaldr', 'skytte']) assert.equal(getAldrimarClassProgression(id).pathOptions.length, 2);
  const copy = getAldrimarClassProgression('skjoldr', 6);
  copy.attackCatalog[0].name = 'changed';
  assert.notEqual(getAldrimarClassProgression('skjoldr', 6).attackCatalog[0].name, 'changed');
  assert.equal(getCultureClassProgression('aldrimar-skjaldr', 10).berserker.minimumLevel, 10);
  for (const [input, expected] of [[0, 1], [30, 20], [NaN, 1], [Infinity, 1], ['8', 8]]) assert.equal(getAldrimarClassProgression('skjoldr', input).selectedLevel, expected);
  assert.equal(getAldrimarClassProgression('missing'), null);
});

test('berserk is absent below six and replaces its tier only at 6/8/10/15/20', () => {
  assert.deepEqual(getSkjaldrBerserkTiers().map(tier => tier.minimumLevel), [6, 8, 10, 15, 20]);
  for (const level of [0, 1, 5, 5.9, NaN, Infinity]) assert.equal(getSkjaldrBerserkProgression(level), null);
  for (const [level, tier] of [[6, 6], [7, 6], [8, 8], [9, 8], [10, 10], [14, 10], [15, 15], [19, 15], [20, 20], [30, 20]]) {
    const mode = getSkjaldrBerserkProgression(level);
    assert.equal(mode.minimumLevel, tier);
    assert.equal(mode.armorClass, -1);
    assert.equal(mode.active, false);
    assert(mode.damage <= 3 && mode.attack <= 2);
    assert.equal(mode.durationModel.remainingActorComments, mode.comments);
  }
  assert.equal(getAldrimarClassProgression('skjoldr', 20).berserker, undefined);
});

test('berserk has bounded action costs, scoped bonuses, nonstacking HP and recovery conditions', () => {
  const mode = getSkjaldrBerserkProgression(20);
  assert.deepEqual(mode.activationCosts.map(cost => cost.resourceId), ['bonus-action', 'reaction']);
  assert.deepEqual(mode.affectedAttacks, { range: 'melee', attribute: 'strength', includeFollowUp: false });
  assert.equal(mode.auraBypass.cost, 1);
  assert.equal(mode.refreshWhileActive, false);
  assert.equal(mode.temporaryHitPoints, 8);
  assert.equal(mode.temporaryHitPointRules.stacking, 'highest');
  assert.equal(mode.temporaryHitPointRules.repeatPerPost, false);
  assert.equal(mode.aftereffect.blocksReactivation, true);
  assert.equal(mode.aftereffect.durationModel.remainingActorComments, 1);
  assert(mode.endOn.includes('unconscious') && mode.endOn.includes('encounter-ended'));
  mode.aftereffect.mechanics.attack = -20;
  assert.equal(getSkjaldrBerserkProgression(20).aftereffect.mechanics.attack, -1);
});

test('Skytte retains damaging bow, spear and sidearm options across foundation and expert paths', () => {
  const plan = getAldrimarClassProgression('skytte', 20);
  for (const form of plan.styles[0].forms) {
    const attacks = form.techniques.filter(attack => attack.effects.some(effect => effect.type === 'damage'));
    assert(attacks.some(attack => attack.weaponTypes.includes('bow')), form.name);
    assert(attacks.some(attack => !attack.weaponTypes.includes('bow')), form.name);
  }
  assert(plan.attackCatalog.some(attack => attack.minimumLevel < 6 && attack.weaponTypes.includes('spear')));
  assert(plan.attackCatalog.some(attack => attack.minimumLevel < 6 && attack.weaponTypes.includes('dagger')));
});

test('mounted, shield, paired and two-handed options keep distinct requirements', () => {
  const rider = getAldrimarClassProgression('thegnar', 20);
  for (const form of rider.styles[0].forms) {
    assert(form.techniques.some(attack => attack.cultureTraining.requiresMounted));
    assert(form.techniques.some(attack => !attack.cultureTraining.requiresMounted && attack.effects.some(effect => effect.type === 'damage')));
  }
  const berserker = getAldrimarClassProgression('skjaldr', 20);
  assert(berserker.attackCatalog.some(attack => attack.cultureTraining.requiresDualWield));
  assert(berserker.attackCatalog.some(attack => attack.cultureTraining.requiresTwoHands));
  assert(berserker.attackCatalog.some(attack => attack.cultureTraining.requiresShield));
  assert(berserker.attackCatalog.every(attack => !attack.followUpAttack.enabled));
});

test('foundation damage is bounded, older attacks grow and guards never gain damage', () => {
  for (const plan of plans.filter(plan => !['hird-maid', 'skalde'].includes(plan.classId))) {
    for (const attack of plan.attackCatalog) {
      if (!attack.effects.some(effect => effect.type === 'damage')) {
        assert.equal(attack.damageFormula, '');
        assert.equal(attack.damageModel.mode, 'fixed');
        continue;
      }
      if (attack.minimumLevel <= 6) {
        assert(maximum(attack, 6) <= 20, attack.name);
        assert(maximum(attack, 7) > maximum(attack, 6), attack.name);
        assert(maximum(attack, 20) > maximum(attack, 7), attack.name);
      }
      assert(attack.maximumTargets === 1 && !attack.followUpAttack.enabled);
    }
  }
  const militia = getAldrimarClassProgression('hird-maid', 20);
  assert(militia.attackCatalog.every(attack => attack.minimumLevel <= 15));
  assert.equal(militia.pathOptions.length, 0);
  const hit = militia.attackCatalog.find(attack => attack.effects.some(effect => effect.type === 'damage'));
  assert.equal(maximum(hit, 15), maximum(hit, 20));
});

test('Skalde mirrors Freyas repertoire without personal traits or invented progression after five', async () => {
  const plan = getAldrimarClassProgression('skalde', 20);
  const snapshot = JSON.parse(await readFile(new URL('Klassenordner/Aldrimar/skalde/referenz-freya.json', root), 'utf8'));
  assert.equal(plan.skaldReference.sourceProfileHash, snapshot.sourceProfileHash);
  assert.match(snapshot.sourceProfileHash, /^[a-f0-9]{64}$/);
  assert.deepEqual(plan.skaldReference.repertoire, snapshot.repertoire);
  assert.equal(plan.skaldReference.repertoire.length, 9);
  assert.deepEqual(plan.skaldReference.repertoire.map(entry => entry.sourceId), ['freya-spottvers', 'freya-magische-hand', 'freya-kleine-illusion', 'freya-licht', 'freya-charm-person', 'freya-calm-person', 'freya-enrage-person', 'freya-silence', 'freya-arkaner-schrei']);
  assert.equal(plan.authoredThroughLevel, 5);
  assert.equal(plan.attackCatalog.length, 0);
  assert.equal(plan.styles.length, 0);
  assert.equal(plan.multiclass.sharedActionPools, true);
  assert.equal(plan.multiclass.additionalManaPool, false);
  assert(plan.levels.slice(5).every(row => row.status === 'pending' && row.resources === null && row.features.length === 0 && row.attacks.length === 0 && row.techniqueSlots.length === 0));
  assert(!JSON.stringify(plan.classFeatures).match(/Busenwunder|Frohnatur|Gutmensch|Künstlerische Ausbildung/));
  const spell = plan.skaldReference.repertoire.find(entry => entry.sourceId === 'freya-charm-person');
  assert(spell.costs.some(cost => cost.resourceId === 'spell-slot-1' && cost.amount === 1));
  assert.equal(spell.automation, 'narrative');
  const shout = plan.skaldReference.repertoire.at(-1);
  assert.deepEqual(shout.damage.map(effect => effect.formula), ['3d6', '1d6']);
});
