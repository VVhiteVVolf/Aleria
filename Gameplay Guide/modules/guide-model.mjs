import assert from 'node:assert/strict';
import { resolveCombatProfile } from '../../AleriaAlmanach/modules/combat/combat-profile-resolver.js';
import { withEquippedCombatWeapon } from '../../AleriaAlmanach/modules/combat/combat-equipment-state.js';
import { getCombatMounts } from '../../AleriaAlmanach/modules/combat/combat-support-equipment.js';
import { getBuiltinCreatureTemplates } from '../../AleriaAlmanach/modules/creatures/creature-catalog.js';
import { FAMILY_REGISTRY } from '../../Stammbäume/assets/js/data/families.registry.js';
import { findGuideRegistration } from './guide-registry.mjs';
import { resolveGuideTaxonomy } from './guide-taxonomy.mjs';
import { buildGuideArsenal } from './guide-arsenal-model.mjs';
import { entryIcon, publicAsset } from './guide-assets.mjs';
import { COST_LABELS } from './guide-format.mjs';

export const diceText = text => String(text || '').replace(/(\d)d(\d)/g, '$1W$2');

export function buildGuideModel(guide, character) {
  assert.equal(character.id, guide.id);
  const registration = findGuideRegistration(character);
  assert.ok(registration, `Guide fehlt im Register: ${character.id}`);
  const taxonomy = resolveGuideTaxonomy(registration, character, FAMILY_REGISTRY);
  const arsenal = buildGuideArsenal(guide, character);
  for (const [name] of guide.techniques) assert.ok(arsenal.entries.some(entry => entry.name === name), `Taktische Einordnung ohne Arsenaleintrag: ${name}`);
  const mount = getCombatMounts(character)[0];
  const loadouts = guide.weaponIds.flatMap(weaponId => [false, ...(mount ? [true] : [])].map(mounted => {
    const equipped = withEquippedCombatWeapon(character, weaponId, '', { shieldId: '', mountId: mounted ? mount.id : '' });
    return { character: equipped, weaponId, mounted, profile: resolveCombatProfile(equipped, { includeAiSnapshot: false }) };
  }));
  const base = loadouts.find(l => l.weaponId === guide.weaponId && !l.mounted);
  const pool = arsenal.entries.filter(entry => ['technique','ability'].includes(entry.kind)).flatMap(entry => entry.variants
    .filter(variant => guide.weaponIds.includes(variant.weaponId) && variant.grip === 'one-handed')
    .map(variant => ({ ...variant, id: entry.id, name: entry.name, icon: entry.icon })));
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
        .map(a => { const source = p.techniques.find(t => t.id === a.sourceId) || p.abilities.find(t => t.id === a.sourceId) || a;
          return { name: a.name, icon: entryIcon(a.kind, source), costs: a.costs, description: source.description || '' }; }) };
  });
  return { ...guide, name: registration.displayName || guide.name, taxonomy, arsenal,
    level: base.profile.effectiveLevel, hp: base.profile.maximumHitPoints, defense: base.profile.totalDefense,
    attack: base.profile.attackModifier, resources: base.profile.resources.filter(r => Object.hasOwn(COST_LABELS, r.id)),
    recovery: `1W${base.profile.hitPoints.hitDie} + ${Math.ceil(base.profile.maximumHitPoints / 10)}`,
    combos, companions,
    weapons: loadouts.filter(l => !l.mounted).map(l => ({ name: l.profile.weapon.name,
      image: publicAsset(l.profile.weapon.image), attack: l.profile.attackModifier,
      formula: diceText(l.profile.weapon.damageFormula) + (l.profile.damageModifier >= 0 ? '+' : '') + l.profile.damageModifier })),
    characterHref: character.profileLink || '/AleriaAlmanach/AleriaAlmanach.html'
  };
}
