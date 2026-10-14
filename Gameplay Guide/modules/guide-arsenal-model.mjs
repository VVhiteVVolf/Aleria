import { resolveCombatProfile } from '../../AleriaAlmanach/modules/combat/combat-profile-resolver.js';
import assert from 'node:assert/strict';
import { withEquippedCombatWeapon } from '../../AleriaAlmanach/modules/combat/combat-equipment-state.js';
import { getCombatMounts } from '../../AleriaAlmanach/modules/combat/combat-support-equipment.js';
import { getCombatDamagePreview } from '../../AleriaAlmanach/modules/combat/combat-action-estimates.js';
import { getCombatFormPresentation } from '../../AleriaAlmanach/modules/combat-styles/combat-form-presentation.js';
import { getBonusDamageFormulas, getUniversalDamageBonus } from '../../AleriaAlmanach/modules/combat/combat-profile-model.js';
import { combineDamageFormulas, buildDamageNotation } from '../../AleriaAlmanach/modules/combat/rules/combat-mvp-rules.js';
import { entryIcon, dieIcon, passiveIcon } from './guide-assets.mjs';

const dice = text => String(text || '').replace(/(\d)d(\d)/gi, '$1W$2');
const signed = value => `${value >= 0 ? '+' : ''}${value}`;
const attributes = { strength: 'KRF', dexterity: 'GES', constitution: 'KON', intelligence: 'INT', wisdom: 'WEI', charisma: 'CHA' };
const kinds = { weapon: 'Waffenangriffe', technique: 'Kampftechniken', ability: 'Aktive Fähigkeiten', spell: 'Zauber', prayer: 'Gebete', song: 'Gesänge' };

function usageLimit(source) {
  const recovery = { 'long-rest': 'pro langer Rast', 'short-rest': 'pro kurzer Rast', day: 'pro Tag', scene: 'pro Szene' };
  return source.usesMaximum > 0 ? `${source.usesMaximum}× ${recovery[source.recovery] || source.recovery || ''}`.trim() : '';
}

function sourceFor(profile, action) {
  const list = action.kind === 'weapon' ? profile.weapons : action.kind === 'technique' ? profile.techniques
    : action.kind === 'ability' ? profile.abilities : profile.magic?.spells;
  return list?.find(e => e.id === action.sourceId) || action;
}

function saveLabel(save) {
  return save?.enabled ? `${attributes[save.attributeKey] || save.attributeKey} SG ${save.dc ?? save.fixedDc}` : '';
}

function followUpSummary(profile) {
  const follow = profile.selectedAction.followUpAttack;
  if (!follow?.enabled) return null;
  const formula = follow.inheritWeapon ? profile.weapon.damageFormula : follow.damageFormula;
  if (!formula || follow.alternateHands) return { note: 'Weitere Einzelangriffe gemäß Techniktext; Werte hängen von der jeweils geführten Hand ab.' };
  const bonus = (follow.inheritDamageModifier === false ? getUniversalDamageBonus(profile) : profile.damageModifier) + Number(follow.damageBonus || 0);
  const extras = follow.inheritBonusDamage !== false ? getBonusDamageFormulas(profile) : [];
  const notation = extra => dice(buildDamageNotation(combineDamageFormulas([formula, ...extras, ...extra]), bonus));
  const sides = formula.match(/\d+d(\d+)/i)?.[1];
  return { count: follow.repeatCount || 1, attack: `1W20 ${signed(profile.attackModifier + Number(follow.attackBonus || 0))}`,
    damage: notation([]), enhancedDamage: follow.saveFailureBonus && sides ? notation([`1d${sides}`]) : '',
    note: follow.afterMiss ? 'Folgeangriff auch nach verfehltem Auftakt.' : 'Folgeangriff nach einem Treffer.',
    save: saveLabel(profile.selectedAction.secondarySave) };
}

function describeVariant(character, loadout, action) {
  const profile = resolveCombatProfile(character, { actionId: action.id, weaponGrip: loadout.grip, includeAiSnapshot: false });
  const selected = profile.selectedAction;
  const source = sourceFor(profile, selected);
  const damage = selected.nonDamaging ? null : getCombatDamagePreview(profile);
  const healing = (selected.effects || []).find(e => e.type === 'healing');
  const healingFormula = healing?.scaling === 'hit-die-and-tenth-maximum'
    ? `1W${profile.hitPoints.hitDie} + ${Math.ceil(profile.maximumHitPoints / 10)}` : dice(healing?.formula || healing?.amount || '');
  const counter = (selected.effects || []).map(e => e.condition?.counterAttack).find(c => c?.enabled);
  const conditions = (selected.effects || []).filter(e => e.condition?.name).map(e => ({
    name: e.condition.name, description: e.condition.description || e.notes, duration: e.condition.duration,
    trigger: e.on === 'hit' ? 'Bei Treffer' : e.on === 'save-failure' ? 'Bei misslungener Rettung' : e.target === 'self' ? 'Auf die eigene Figur' : 'Gemäß Auslöser',
    icon: entryIcon('condition', e.condition)
  }));
  return { ...loadout, compatible: selected.compatible !== false, reason: selected.disabledReason || '',
    weapon: loadout.weapon, costs: selected.costs || [],
    attack: profile.actionResolutionMode === 'automatic' ? 'Automatisch'
      : profile.actionResolutionMode === 'saving-throw' ? `${attributes[profile.actionSaveAttribute] || ''} SG ${profile.actionSpellSaveDc}`
        : `1W20 ${signed(profile.attackModifier)}`,
    attackKind: profile.actionResolutionMode === 'saving-throw' ? 'save' : profile.actionResolutionMode === 'automatic' ? 'automatic' : 'attack',
    rollMode: ({ advantage: 'Vorteil', disadvantage: 'Nachteil' })[profile.forcedRollMode] || '',
    damage: damage ? dice(damage.notation) : 'Kein direkter Schaden', damageType: damage?.damageType || '',
    damageIcon: damage ? dieIcon(damage.notation, damage.damageType) : '',
    healing: healingFormula, healingIcon: healingFormula ? dieIcon(healingFormula, 'healing') : '',
    save: saveLabel(selected.secondarySave), saveEffect: selected.secondarySave?.failureCondition?.description || '',
    followUp: followUpSummary(profile), counter: counter ? { save: saveLabel(counter.secondarySave), note: 'Gegenangriff erst nach dem beschriebenen Auslöser; Werte der dann geführten Waffe.' } : null,
    conditions, groups: (selected.effects || []).map(e => e.condition?.stanceGroup).filter(Boolean),
    duration: source.duration || '', range: source.range || (profile.actionResolutionMode === 'automatic' ? '' : loadout.range),
    target: source.target || '', requirements: source.requirements || '',
    uses: usageLimit(source) };
}

export function buildGuideArsenal(guide, character) {
  const base = resolveCombatProfile(character, { includeAiSnapshot: false });
  const mount = getCombatMounts(character)[0];
  const weapons = [...base.weapons].sort((a,b) => Number(b.id === guide.weaponId) - Number(a.id === guide.weaponId));
  const actions = new Map();
  for (const weapon of weapons) for (const mounted of [false, ...(mount ? [true] : [])]) {
    const equipped = withEquippedCombatWeapon(character, weapon.id, '', { shieldId: '', mountId: mounted ? mount.id : '' });
    const profile = resolveCombatProfile(equipped, { includeAiSnapshot: false });
    for (const action of profile.actions.filter(a => Object.hasOwn(kinds, a.kind))) {
      // The resolver lists every owned weapon even while another one is equipped.
      // A weapon card must only offer loadouts for that actual weapon.
      if (action.kind === 'weapon' && action.sourceId !== weapon.id) continue;
      const source = sourceFor(profile, action);
      if (!actions.has(action.id)) {
        const form = getCombatFormPresentation(source);
        const personal = /^Persönliche/.test(source.trainingForm || '');
        actions.set(action.id, { id: action.id, name: action.name, kind: action.kind,
          category: personal ? 'Persönliche Techniken' : kinds[action.kind], form: personal ? '' : form?.label || '',
          icon: entryIcon(action.kind, source), description: source.description || source.notes || '', effect: source.effect || '',
          advice: guide.techniques.find(([name]) => name === action.name)?.[2] || '',
          narrative: guide.narratives?.[action.name] || '', minimumLevel: source.minimumLevel || 0, variants: [] });
      }
      // Incompatible variants are not assigned invented statistics. Keep the entry
      // visible even if no owned loadout can perform it.
      const entry = actions.get(action.id);
      if (action.compatible === false) { entry.unavailableReason ||= action.disabledReason; continue; }
      const grips = action.weapon?.versatileDamageFormula ? ['one-handed', 'two-handed'] : ['one-handed'];
      for (const grip of grips) {
        const loadout = { id: `${weapon.id}:${mounted ? 'mounted' : 'foot'}:${grip}`, weaponId: weapon.id, weapon: weapon.name,
          range: weapon.range, mounted, mount: mounted ? mount.name : '', grip, weaponType: weapon.weaponType,
          label: `${weapon.name} · ${mounted ? 'beritten' : 'zu Fuß'}${grips.length > 1 ? grip === 'two-handed' ? ' · zweihändig' : ' · einhändig' : ''}` };
        const variant = describeVariant(equipped, loadout, action);
        if (variant.compatible) entry.variants.push(variant);
      }
    }
  }
  // Only explicitly reviewed permanent entries belong in a static guide, never live combat effects.
  const permanentConditions = (guide.permanentConditionIds || []).map(id => {
    const condition = base.conditions.find(c => c.id === id);
    assert.ok(condition && condition.duration === 'Dauerhaft', `Dauerhafter Regeleintrag fehlt: ${id}`);
    return condition;
  });
  for (const [kind, entries] of [['ability', base.abilities], ['trait', base.quirks], ['condition', permanentConditions]]) for (const entry of entries) {
    if (actions.has(`${kind}:${entry.id}`)) continue;
    const passive = entry.activationType === 'passive' || ['trait', 'condition'].includes(kind);
    actions.set(`${kind}:${entry.id}`, { id: `${kind}:${entry.id}`, name: entry.name, kind,
      category: passive ? 'Passive Fähigkeiten & Herkunft' : 'Weitere Fähigkeiten',
      form: kind === 'condition' ? entry.source || 'Dauerhafter Regeleintrag' : '',
      icon: entryIcon(kind, entry), description: entry.description || '', effect: '', passive,
      advice: guide.techniques.find(([name]) => name === entry.name)?.[2] || '',
      requirements: entry.requirements || '', uses: usageLimit(entry),
      active: entry.active !== false, variants: [], unavailableReason: entry.combatUsable === false ? 'Keine aktive Kampfhandlung' : '' });
  }
  const preferred = [...actions.values()].find(entry => entry.name === guide.techniques[0]?.[0]);
  return { schemaVersion: 1, characterId: character.id, defaultActionId: preferred?.id || [...actions.keys()][0],
    diceIcon: dieIcon(), passiveIcon, entries: [...actions.values()] };
}
