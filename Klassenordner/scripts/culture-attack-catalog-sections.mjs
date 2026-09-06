import { resolveTechniqueDamageFormula } from '../../AleriaAlmanach/modules/combat/combat-technique-damage.js';

const cell = value => String(value ?? '').replaceAll('|', '\\|').replaceAll('\n', ' ');
const damage = (attack, level) => attack.effects.some(effect => effect.type === 'damage')
  ? resolveTechniqueDamageFormula(attack, { damageFormula: '1d10' }, { progression: { level } }).replaceAll('d', 'W') : 'Kein Schaden';

export function renderCultureAttackCatalogSections(plans) {
  const lines = [];
  for (const plan of plans) {
    lines.push('', `## ${plan.name}`, '', plan.weaponTraining.note, '', '### Klassenmerkmale', '');
    for (const feature of [...plan.classFeatures].sort((a, b) => a.minimumLevel - b.minimumLevel)) lines.push(`- **Stufe ${feature.minimumLevel} · ${feature.name}:** ${feature.description}`);
    for (const style of plan.styles) for (const form of style.forms) {
      lines.push('', `### ${form.name} · ${form.minimumLevel}–${form.maximumTrainingLevel}`, '', form.description, '');
      for (const feature of form.features || []) lines.push(`- **Stufe ${feature.minimumLevel} · ${feature.name}:** ${feature.description}`);
      lines.push('', '| Stufe | Attacke | Waffe | Kosten | 1W10-Waffe bei Freigabe | 1W10-Waffe auf Stufe 20 | Wirkung / Voraussetzung |', '| ---: | --- | --- | --- | --- | --- | --- |');
      for (const attack of form.techniques) lines.push(`| ${attack.minimumLevel} | ${attack.name} | ${cell(attack.weaponLabel)} | ${attack.costs.map(cost => `${cost.amount} ${cost.name}`).join(' + ')} | ${damage(attack, attack.minimumLevel)} | ${damage(attack, 20)} | ${cell(`${attack.effect} ${attack.requirements}`)} |`);
    }
  }
  return lines;
}
