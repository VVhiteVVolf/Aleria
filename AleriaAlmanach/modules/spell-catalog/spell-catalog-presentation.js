import { averageDamageFormula } from '../combat/combat-action-estimates.js';

const dice = value => String(value || '').toUpperCase().replaceAll('D', 'W');
const kindLabels = { healing: 'Heilung', 'temporary-hit-points': 'Temporäre TP', protection: 'Schutz' };

export function getCatalogOutcomePresentation(entry, form = entry) {
  const outcome = form?.outcome;
  if (!outcome) return null;
  const formula = outcome.formula || '';
  const average = formula ? averageDamageFormula(formula) : outcome.amount;
  return { label: outcome.label, formula, average,
    kind: outcome.kind, damageType: outcome.kind === 'healing' ? 'Heilung' : '',
    averageLabel: average == null ? '' : `Ø ${Number(average).toLocaleString('de-DE')} ${outcome.kind === 'healing' ? 'TP' : kindLabels[outcome.kind] || 'Wirkung'} je Ziel${formula ? ' / Wurf' : ''}` };
}

export function getHealingSpellPresentation(spell, entry) {
  const form = entry && (Number(spell.level) === entry.level ? entry : entry.forms.find(form => form.level === Number(spell.level)));
  const catalog = getCatalogOutcomePresentation(entry, form);
  if (catalog) return catalog;
  const effects = (spell.effects || []).filter(effect => ['healing', 'temporary-hit-points'].includes(effect.type));
  if (!effects.length) return null;
  return { label: effects.map(effect => `${effect.formula ? dice(effect.formula) : effect.amount || 0} · ${kindLabels[effect.type]}`).join(' + '),
    formula: effects[0].formula || '', damageType: effects[0].type === 'healing' ? 'Heilung' : '', kind: effects[0].type };
}
