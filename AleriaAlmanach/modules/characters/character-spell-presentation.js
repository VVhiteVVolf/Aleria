import { getCombatDamagePreview } from '../combat/combat-action-estimates.js';
import { getUniversalDamageBonus } from '../combat/combat-profile-model.js';
import { getDefaultActivationCosts, normalizeCombatResourceCosts } from '../combat/combat-action-economy.js';
import { createCatalogSpell, getSpellCatalogEntry, getSpellCatalogPageHref } from '../spell-catalog/spell-catalog.js';

const dice = value => String(value || '').toUpperCase().replaceAll('D', 'W');

function actionLabel(spell, manaResourceId) {
  return normalizeCombatResourceCosts(spell.costs?.length ? spell.costs : getDefaultActivationCosts(spell.activationType))
    .filter(cost => !['mana-focus', 'pact-points', manaResourceId].includes(cost.resourceId))
    .map(cost => `${cost.amount > 1 ? `${cost.amount}× ` : ''}${cost.name}`).join(' + ');
}

function damagePresentation(spell, profile, entry) {
  const preview = getCombatDamagePreview({ ...profile,
    selectedAction: { kind: 'spell', effects: spell.effects || [] },
    damageModifier: getUniversalDamageBonus(profile),
    weapon: { damageFormula: spell.rollFormula, damageType: spell.damageType }
  });
  if (preview) return { label: `${dice(preview.notation)} · ${preview.damageType}`, formula: spell.rollFormula, damageType: spell.damageType };
  const procedure = entry && spell.effects?.find(effect => effect.type === 'narrative' && effect.formula);
  if (procedure) return { label: `${dice(procedure.formula)} · ${entry.sourceId === 'Z05' ? 'Strukturschaden' : 'Schutzwurf'} · mit Spielleitung`, formula: procedure.formula, damageType: 'physisch' };
  return { label: 'Kein direkter Schaden', formula: '', damageType: '' };
}

export function getCharacterSpellPresentation(spell, profile = {}, manaName = 'Mana') {
  const reference = spell.catalogReference;
  const entry = reference ? getSpellCatalogEntry(reference.id, reference.revision) : null;
  const manaResourceId = profile.magic?.manaResourceId || 'mana-focus';
  return {
    costs: `${actionLabel(spell, manaResourceId)} · ${spell.manaCost} ${manaName}`,
    damage: damagePresentation(spell, profile, entry),
    catalogHref: getSpellCatalogPageHref(reference),
    higherForms: entry ? entry.forms.map(form => {
      const higher = createCatalogSpell(entry.id, { revision: entry.revision, level: form.level, manaResourceId });
      return `Grad ${form.level}: ${actionLabel(higher, manaResourceId)} · ${higher.manaCost} ${manaName} · ${damagePresentation(higher, profile, entry).label}${form.changes ? ` · ${form.changes}` : ''}`;
    }) : []
  };
}
