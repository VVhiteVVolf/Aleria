export function summarizeRuleEffects(effects = {}) {
  const labels = [
    ['attackModifier', 'Angriff'], ['defenseModifier', 'Verteidigung'],
    ['savingThrowModifier', 'Rettung'], ['spellSaveDcModifier', 'Zauber-SG'],
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
