import { COMBAT_ATTRIBUTE_DEFINITIONS } from '../combat-profile-model.js';
import { getCombatDamageTypeLabel } from './combat-mechanics-presentation.js';

export function describeCombatTriggerRule(rule = {}) {
  const actions = { weapon: 'Waffenangriff', technique: 'Waffentechnik', ability: 'Fähigkeit', spell: 'Zauber', prayer: 'Gebet', song: 'Magisches Lied', skill: 'Probe' };
  const phases = { 'pre-roll': 'Vor dem Wurf', 'post-roll': 'Nach dem Wurf', 'pre-secondary-save': 'Vor der Zusatzrettung', 'pre-damage': 'Vor Schaden', 'on-damaged': 'Bei erlittenem Schaden', 'post-damage': 'Nach Schaden', 'post-hit': 'Nach Trefferprüfung', 'on-concentration-check': 'Bei Konzentrationsrettung', 'on-combat-start': 'Bei Kampfbeginn', 'on-combat-end': 'Bei Kampfende' };
  const conditions = { 'would-hit': 'nur bei drohendem Treffer', 'would-miss': 'nur bei drohendem Fehlschlag', 'critical-hit': 'nur bei Krittreffer', 'critical-failure': 'nur bei kritischem Fehlschlag' };
  const parts = [phases[rule.phase], rule.recipient === 'target' ? 'Eingehend' : rule.recipient === 'actor' ? 'Eigene Handlung' : '',
    (rule.actionKinds || []).map(kind => actions[kind]).filter(Boolean).join('/'),
    { melee: 'Nahkampf', ranged: 'Fernkampf' }[rule.attackRange],
    rule.saveAttributes?.length ? (rule.saveAttributes.length === 6 ? 'Attributsrettung' : rule.saveAttributes.map(key => COMBAT_ATTRIBUTE_DEFINITIONS.find(attribute => attribute.key === key)?.shortLabel || key).join('/') + '-Rettung') : '',
    [...new Set((rule.damageTypes || []).map(getCombatDamageTypeLabel))].join('/'), conditions[rule.condition],
    rule.frequency && rule.frequency !== 'always' ? { comment: 'einmal je Beitrag', scene: 'einmal je Szene', day: 'einmal je Tag' }[rule.frequency] : ''
  ].filter(Boolean);
  return `${parts.length ? `${parts.join(' · ')}: ` : ''}${summarizeRuleEffects(rule.effects)}`;
}

export function summarizeRuleEffects(effects = {}) {
  const labels = [
    ['attackModifier', 'Angriff'], ['defenseModifier', 'Verteidigung'],
    ['savingThrowModifier', 'Rettung'], ['spellSaveDcModifier', 'Zauber-SG'], ['skillModifier', 'Probe'],
    ['damageModifier', 'Schaden'], ['damageReduction', 'Schadensreduktion'], ['damageReductionBypass', 'Schutz umgehen']
  ];
  const parts = labels.filter(([key]) => Number(effects[key] || 0) !== 0)
    .map(([key, label]) => `${label} ${Number(effects[key]) > 0 ? '+' : ''}${Number(effects[key])}`);
  if (effects.rollMode && effects.rollMode !== 'normal') parts.push(effects.rollMode === 'advantage' ? 'Vorteil' : 'Nachteil');
  if (effects.preventAdvantage) parts.push('Kein Vorteil');
  if (effects.outcome && effects.outcome !== 'none') parts.push({
    'force-hit': 'Treffer erzwungen', 'force-miss': 'Fehlschlag erzwungen',
    'force-critical-hit': 'Kritischer Treffer erzwungen',
    'force-save-success': 'Rettung erzwungen', 'force-save-failure': 'Rettungsfehlschlag erzwungen'
  }[effects.outcome] || effects.outcome);
  return parts.join(' · ') || 'Auslöser angewandt';
}
