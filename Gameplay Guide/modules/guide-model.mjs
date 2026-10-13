import assert from 'node:assert/strict';
import { resolveCombatProfile } from '../../AleriaAlmanach/modules/combat/combat-profile-resolver.js';
import { withEquippedCombatWeapon } from '../../AleriaAlmanach/modules/combat/combat-equipment-state.js';
import { getCombatMounts } from '../../AleriaAlmanach/modules/combat/combat-support-equipment.js';
import { getCombatDamagePreview } from '../../AleriaAlmanach/modules/combat/combat-action-estimates.js';
import { getBuiltinCreatureTemplates } from '../../AleriaAlmanach/modules/creatures/creature-catalog.js';

export const COST_LABELS = { action: 'Aktion', 'bonus-action': 'Bonusaktion', reaction: 'Reaktion', 'special-action': 'Besondere Aktion' };
export const diceText = text => String(text || '').replace(/(\d)d(\d)/g, '$1W$2');

function actionSummary(profile, action, weapon, mounted) {
  const selected = resolveCombatProfile(profile.character, { actionId: action.id, includeAiSnapshot: false });
  const technique = selected.techniques?.find(t => t.id === action.sourceId);
  const ability = selected.abilities?.find(a => a.id === action.sourceId);
  return { id: action.id, name: action.name, costs: action.costs || [], compatible: action.compatible !== false,
    mounted, weapon, damage: diceText(getCombatDamagePreview(selected)?.notation || 'Kein direkter Schaden'),
    attack: selected.actionResolutionMode === 'automatic' ? 'Automatisch' : `${selected.attackModifier >= 0 ? '+' : ''}${selected.attackModifier}`,
    description: technique?.description || ability?.description || '', effect: technique?.effect || '',
    personal: /^Persönliche Techniken/.test(technique?.trainingForm || ''),
    groups: (action.effects || []).map(e => e.condition?.stanceGroup).filter(Boolean) };
}

export function buildGuideModel(guide, character) {
  assert.equal(character.id, guide.id);
  const mount = getCombatMounts(character)[0];
  const loadouts = guide.weaponIds.flatMap(weaponId => [false, ...(mount ? [true] : [])].map(mounted => {
    const equipped = withEquippedCombatWeapon(character, weaponId, '', { shieldId: '', mountId: mounted ? mount.id : '' });
    return { character: equipped, weaponId, mounted, profile: resolveCombatProfile(equipped, { includeAiSnapshot: false }) };
  }));
  const base = loadouts.find(l => l.weaponId === guide.weaponId && !l.mounted);
  const pool = loadouts.flatMap(loadout => loadout.profile.actions.filter(a => ['technique', 'ability'].includes(a.kind) && a.compatible !== false)
    .map(action => actionSummary(loadout, action, loadout.profile.weapon.name, loadout.mounted)));
  const byName = (name, mounted = false) => {
    const found = pool.find(a => a.name === name && a.mounted === mounted);
    assert.ok(found, `${guide.slug}: verfügbare Technik fehlt: ${name} (${mounted ? 'beritten' : 'zu Fuß'})`); return found;
  };
  const combos = guide.combos.map(combo => {
    const actions = combo.actions.map(name => byName(name, !!combo.mounted));
    assert.equal(new Set(actions.map(a => a.weapon)).size, 1, `${combo.title}: Waffenwechsel fehlt`);
    const costs = {};
    for (const action of actions) for (const cost of action.costs) costs[cost.resourceId] = (costs[cost.resourceId] || 0) + cost.amount;
    for (const [id, amount] of Object.entries(costs)) assert.ok(amount <= Number(base.profile.resources.find(r => r.id === id)?.maximum), `${combo.title}: ${id} überzogen`);
    const groups = actions.flatMap(a => a.groups);
    assert.equal(new Set(groups).size, groups.length, `${combo.title}: Haltungen überschreiben einander`);
    return { ...combo, actions, costs };
  });
  const catalog = getBuiltinCreatureTemplates();
  const companions = guide.companions.map(copy => {
    const creature = catalog.find(c => c.id === copy.id); assert.ok(creature, copy.id);
    assert.ok(character.inventory?.companions?.some(c => c.creatureId === copy.id), 'Begleiter fehlt im Besitzerinventar: ' + copy.id);
    const p = resolveCombatProfile(creature, { includeAiSnapshot: false });
    return { ...copy, name: creature.name, image: copy.image || creature.portrait, species: creature.species, reference: creature.bestiaryReference,
      hp: p.maximumHitPoints, level: p.effectiveLevel, defense: p.totalDefense,
      actions: p.actions.filter(a => a.compatible !== false && ['technique', 'ability'].includes(a.kind))
        .map(a => ({ name: a.name, costs: a.costs, description: p.techniques.find(t => t.id === a.sourceId)?.description || p.abilities.find(t => t.id === a.sourceId)?.description || '' })) };
  });
  return { ...guide, level: base.profile.effectiveLevel, hp: base.profile.maximumHitPoints, defense: base.profile.totalDefense,
    attack: base.profile.attackModifier, resources: base.profile.resources.filter(r => Object.hasOwn(COST_LABELS, r.id)),
    recovery: `1W${base.profile.hitPoints.hitDie} + ${Math.ceil(base.profile.maximumHitPoints / 10)}`,
    combos, companions, techniques: guide.techniques.map(([name, role, advice]) => ({ ...byName(name, role === 'Beritten'), role, advice })),
    weapons: loadouts.filter(l => !l.mounted).map(l => ({ name: l.profile.weapon.name,
      image: l.profile.weapon.image, attack: l.profile.attackModifier,
      formula: diceText(l.profile.weapon.damageFormula) + (l.profile.damageModifier >= 0 ? '+' : '') + l.profile.damageModifier })),
    learnedCount: base.profile.techniques.length,
    availableCount: base.profile.actions.filter(a => a.kind === 'technique' && a.compatible !== false).length,
    allTechniques: pool.filter((a, i) => a.id.startsWith('technique:') && pool.findIndex(b => b.id === a.id) === i),
    characterHref: character.profileLink || '/AleriaAlmanach/index.html'
  };
}
