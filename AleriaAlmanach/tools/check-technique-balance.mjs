import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { getBalanceCatalog } from '../tests/support/technique-balance-catalog.mjs';
import { resolveTechniqueDamageFormula } from '../modules/combat/combat-technique-damage.js';
import { averageDamageFormula } from '../modules/combat/combat-action-estimates.js';

const output = new URL('../docs/combat/technique-balance/', import.meta.url);
const before = new Map(JSON.parse(await readFile(new URL('before.json', output), 'utf8')).map(row => [row.id, row]));
const average = formula => formula ? averageDamageFormula(formula) : 0;
const rows = getBalanceCatalog().map(technique => {
  const previous = before.get(technique.id);
  const damage = resolveTechniqueDamageFormula(technique, { damageFormula: '1d10' }, { progression: { level: technique.minimumLevel } });
  return { id: technique.id, name: technique.name, style: technique.combatStyleId, level: technique.minimumLevel,
    costs: technique.costs.map(cost => `${cost.amount} ${cost.name}`).join(' + '),
    oldCosts: previous?.costs || '', oldDamage: previous?.damage ?? null,
    damage, average: average(damage), averageChange: previous ? average(damage) - average(previous.damage) : null,
    levelTwenty: resolveTechniqueDamageFormula(technique, { damageFormula: '1d10' }, { progression: { level: 20 } }) };
});
const summaries = [...new Set(rows.map(row => row.style))].map(style => {
  const entries = rows.filter(row => row.style === style);
  const changed = entries.filter(row => row.oldDamage && row.damage);
  return { style, count: entries.length, raised: changed.filter(row => row.averageChange > 0).length,
    unchanged: changed.filter(row => row.averageChange === 0).length, lowered: changed.filter(row => row.averageChange < 0).length,
    meanIncrease: Number((changed.reduce((sum, row) => sum + row.averageChange, 0) / changed.length).toFixed(2)) };
});
await mkdir(output, { recursive: true });
await writeFile(new URL('catalog.json', output), JSON.stringify({ referenceWeapon: '1d10', summaries, rows }, null, 2) + '\n');
const w = value => String(value || '—').replaceAll('d', 'W');
const table = rows.map(row => `| ${row.name} | ${row.level} | ${row.costs} | ${w(row.oldDamage)} | ${w(row.damage)} | ${row.averageChange ?? 'neu'} | ${w(row.levelTwenty)} |`).join('\n');
await writeFile(new URL('CATALOG.md', output), `# Vergleich aller Kampftechniken\n\nReferenzwaffe 1W10, ohne Attribut-, Klassen- oder Buffboni. Δ ist der durchschnittliche Schaden pro Treffer. Reine Hilfstechniken verursachen keinen Schaden. Aura-Ersatz ist hier noch nicht eingerechnet.\n\n| Technik | Stufe | Kosten | Bisher | Neu | Δ Ø | Auf Stufe 20 |\n| --- | ---: | --- | --- | --- | ---: | --- |\n${table}\n`);
console.log(JSON.stringify(summaries, null, 2));
