import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { createDuelProfiles, simulateDuel, DUEL_VARIANTS } from './duel-simulation.mjs';

const count = Number(process.env.DUEL_COUNT || 100);
if (!Number.isInteger(count) || count < 1 || count > 10000) throw Error('DUEL_COUNT muss 1–10000 sein.');
const output = new URL('../../docs/combat/duel-checkup-2026-09-13/', import.meta.url);
await mkdir(output, { recursive: true });
const sources = await Promise.all(['gildas-gafyr', 'gawain-draig'].map(async slug => {
  const text = await readFile(new URL(`../../../Charakter%20Archiv%20Exporte/${slug}.json`, import.meta.url), 'utf8');
  return { slug, hash: createHash('sha256').update(text).digest('hex'), character: JSON.parse(text).character };
}));
const profiles = createDuelProfiles(sources.map(source => source.character));
const reports = [];
for (const variant of DUEL_VARIANTS) {
  for (let index = 0; index < count; index++) {
    const seed = (0x9e3779b9 * (index + 1)) >>> 0;
    reports.push(await simulateDuel({ profiles, variant, seed }));
    if ((index + 1) % 10 === 0) console.log(`${variant.id}: ${index + 1}/${count}`);
  }
}
const summary = DUEL_VARIANTS.map(variant => {
  const duels = reports.filter(report => report.variant === variant.id);
  return { ...variant, count: duels.length, Gildas: duels.filter(report => report.winner === 'Gildas').length,
    Gawain: duels.filter(report => report.winner === 'Gawain').length, draws: 0,
    meanRounds: duels.reduce((sum, duel) => sum + duel.rounds, 0) / duels.length,
    firstGildas: duels.filter(report => report.first === 'Gildas').length,
    firstGawain: duels.filter(report => report.first === 'Gawain').length };
});
await writeFile(new URL('results.json', output), JSON.stringify({
  sources: sources.map((source, index) => ({ slug: source.slug, sha256: source.hash,
    level: profiles[index].base.progression.level, hitPoints: profiles[index].base.maximumHitPoints,
    defense: profiles[index].base.totalDefense, attack: profiles[index].base.attackModifier,
    damageModifier: profiles[index].base.damageModifier, initiative: profiles[index].base.initiative })),
  policy: 'Ganze Kostenpakete: größtmögliche erwartete Schadenssumme aus bekannten Waffen/Techniken, pro Technik höchstens einmal je Gesamtbeitrag. Keine optionalen Reaktionen, keine Aura (beide haben 0), keine erfundenen Boni. Automatische Regeln und Zustände bleiben aktiv.',
  summary, totalDuels: reports.length, totalActions: reports.reduce((sum, report) => sum + report.actions, 0)
}, null, 2) + '\n');
await writeFile(new URL('duels.csv', output), 'variant,seed,winner,rounds,first,actions,gildasHP,gawainHP\n'
  + reports.map(report => [report.variant, report.seed, report.winner, report.rounds, report.first, report.actions, ...report.hitPoints].join(',')).join('\n') + '\n');
const selected = DUEL_VARIANTS.flatMap(variant => {
  const duels = reports.filter(report => report.variant === variant.id);
  return [...new Map([duels[0], duels.find(report => report.winner === 'Gawain'), duels.find(report => report.winner === 'Gildas'),
    duels.reduce((longest, report) => longest.rounds > report.rounds ? longest : report)].filter(Boolean).map(report => [report.seed, report])).values()];
});
await writeFile(new URL('selected-traces.json', output), JSON.stringify(selected, null, 2) + '\n');
console.log(JSON.stringify(summary, null, 2));
