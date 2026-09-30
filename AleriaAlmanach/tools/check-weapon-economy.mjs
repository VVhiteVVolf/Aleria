import { mkdir, writeFile } from 'node:fs/promises';
import { getBalanceCatalog } from '../tests/support/technique-balance-catalog.mjs';
import { resolveTechniqueDamageFormula } from '../modules/combat/combat-technique-damage.js';
import { averageDamageFormula } from '../modules/combat/combat-action-estimates.js';

const rows = getBalanceCatalog().map(technique => {
  const samples = ['1d4', '1d6', '1d8', '1d10', '1d12', '2d6'].map(damageFormula => {
    const at = level => resolveTechniqueDamageFormula(technique, { damageFormula }, { progression: { level } });
    const unlocked = at(technique.minimumLevel), trained = at(20);
    return { weapon: damageFormula, unlocked, average: unlocked ? averageDamageFormula(unlocked) : 0,
      levelTwenty: trained, averageTwenty: trained ? averageDamageFormula(trained) : 0 };
  });
  return { id: technique.id, name: technique.name, style: technique.combatStyleId, level: technique.minimumLevel,
    costs: technique.costs.map(({ resourceId, amount }) => ({ resourceId, amount })), samples };
});
const root = new URL('../docs/combat/weapon-economy-2026-09-30/', import.meta.url);
await mkdir(root, { recursive: true });
await writeFile(new URL('catalog.json', root), JSON.stringify({
  note: 'Single reference weapon, before flat modifiers, defenses and aura substitution. Joint attacks use both actual hands; personal attack sequences are separate.',
  count: rows.length, rows
}, null, 2) + '\n');
console.log(JSON.stringify({ techniques: rows.length, weaponSamples: rows.length * 6,
  styles: Object.fromEntries([...new Set(rows.map(row => row.style))].map(style => [style, rows.filter(row => row.style === style).length])) }));
