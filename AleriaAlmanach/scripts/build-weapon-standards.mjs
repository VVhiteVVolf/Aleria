import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { getWeaponStandardMarketItems } from '../modules/weapon-standards/weapon-standard-catalog.js';
import { withRegisterGameplayDefaults } from '../modules/item-register/item-register-gameplay-defaults.js';

const target = new URL('../../Markt/WaffenRüstungen/data/shop-data.js', import.meta.url);
const begin = '// BEGIN GENERATED WEAPON STANDARDS';
const end = '// END GENERATED WEAPON STANDARDS';
const original = await readFile(target, 'utf8');
if (original.includes(begin) && !original.includes(end)) throw Error('Unvollständiger Waffenstandard-Block.');
const base = original.split(begin)[0].trimEnd() + '\n';
const context = { window: {} };
vm.runInNewContext(base, context, { filename: fileURLToPath(target) });
const existing = context.window.ARMORY_DATA.items;
const additions = getWeaponStandardMarketItems();
const ids = [...existing, ...additions].map(item => item.id);
if (new Set(ids).size !== ids.length) throw Error('Eine neue Waffenstandard-ID kollidiert mit dem Zeughausbestand.');
const completions = existing.filter(item => item.category === 'Waffen' && !item.combatDefinition).map(item => ({
  id: item.id,
  combatDefinition: withRegisterGameplayDefaults({ category: 'waffen',
    sourceRefs: [{ market: 'Waffen & Rüstungen', sourceId: item.id }] }).combatDefinition
})).filter(item => item.combatDefinition);
const output = `${base}\n${begin}\n// Source: AleriaAlmanach/modules/weapon-standards/weapon-standard-catalog.js\n// Regenerate with node AleriaAlmanach/scripts/build-weapon-standards.mjs.\n(function () {\n  const completions = ${JSON.stringify(completions, null, 2)};\n  for (const completion of completions) {\n    const item = window.ARMORY_DATA.items.find(entry => entry.id === completion.id);\n    if (item && !item.combatDefinition) item.combatDefinition = completion.combatDefinition;\n  }\n  window.ARMORY_DATA.items.push(...${JSON.stringify(additions, null, 2)});\n})();\n${end}\n`;
if (process.argv.includes('--check')) {
  if (output !== original) throw Error('Die Waffenstandards im Zeughaus sind veraltet.');
} else await writeFile(target, output, 'utf8');
console.log(`${additions.length} neue Waffenstandards; ${completions.length} bestehende Waffen mit sichtbaren Regelwerten.`);
