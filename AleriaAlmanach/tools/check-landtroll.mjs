import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { runTrollSeries, createTrollCombatants } from '../tests/support/troll-simulation.mjs';
import { renderCreatureDossier } from '../modules/creatures/creature-dossier.js';
import { resolveCombatProfile } from '../modules/combat/combat-profile-resolver.js';

const count = Number(process.argv.find(argument => argument.startsWith('--runs='))?.split('=')[1] || 100);
if (!Number.isInteger(count) || count < 1 || count > 10000) throw Error('--runs must be an integer from 1 to 10000');
const fromResults = process.argv.find(argument => argument.startsWith('--from-results='))?.slice('--from-results='.length);
const series = fromResults ? JSON.parse(await readFile(fromResults, 'utf8')) : [];
if (!fromResults) {
  for (const options of [{}, { fire: true }, { partySize: 2 }, { partySize: 1 }, { trainedKnights: true }, { limitedFire: true }]) {
    const result = await runTrollSeries(options, count);
    series.push(result);
    console.log(JSON.stringify({ ...result, results: undefined }));
  }
}
const output = new URL('../docs/combat/landtroll/', import.meta.url);
await mkdir(output, { recursive: true });
const combatants = createTrollCombatants();
const creature = combatants.at(-1);
const profiles = combatants.map(record => {
  const profile = resolveCombatProfile(record);
  return { id: record.id, name: record.name, level: profile.progression.level,
    archetype: profile.identity.archetype, hitPoints: profile.maximumHitPoints, current: profile.currentHitPoints,
    defense: profile.totalDefense, hitDie: profile.hitPoints.hitDie, activeWeapon: profile.weapon.name,
    attack: profile.attackModifier, damage: profile.damageModifier,
    actions: profile.actions.map(action => ({ id: action.id, name: action.name, formula: action.formula, compatible: action.compatible })) };
});
await writeFile(new URL('simulation-results.json', output), JSON.stringify({ seedStart: 81000, seedStride: 7919, profiles, series }, null, 2) + '\n');
await writeFile(new URL('landtroll.creature.json', output), JSON.stringify({ type: 'aleria-creature', version: 3, creature }, null, 2) + '\n');
const css = await readFile(new URL('../styles/creature-dossier.css', import.meta.url), 'utf8');
const markup = renderCreatureDossier(creature)
  .replaceAll('./public/assets/', '../../../public/assets/')
  .replace(/[\t ]+$/gm, '');
await writeFile(new URL('landtroll.html', output), `<!doctype html><html lang="de"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Landtroll · Aleria Bestiarium</title><style>body{margin:0;padding:clamp(8px,2vw,24px);background:#ddc89d}main{max-width:1300px;margin:auto}${css}</style><main>${markup}</main></html>\n`);
console.log(`Landtroll-Karte, Importdatei und ${series.reduce((sum, row) => sum + row.count, 0)} Kampfläufe: ${fileURLToPath(output)}`);
