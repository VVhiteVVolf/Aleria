import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { createDuelFighter, simulateOptimizedDuel } from './duel-runtime.mjs';
import { chooseHeuristicDuelPlan, chooseSampledDuelPlan } from './duel-policy.mjs';
import { planNuddDuelRelease } from '../../../firebase/functions/scripts/nudd-duel-release-model.mjs';
import { applyCharacterFieldPatch } from '../../../firebase/functions/scripts/wolfshorn-recovery-release-model.mjs';

const [input, output, countArgument = '32'] = process.argv.slice(2);
const count = Number(countArgument);
if (!input || !output || !Number.isInteger(count) || count < 1 || count > 1024) throw new Error('Usage: node run-nudd-asgeir-duel.mjs input.json output-directory [1-1024 duels]');
const source = JSON.parse(await readFile(input,'utf8'));
const records = (Array.isArray(source) ? source : source.characters).map(value => value.character || value);
const nuddSource = records.find(record => record.name === 'Nudd Saethwyr');
const asgeirSource = records.find(record => record.name === 'Asgeir Wolfshorn');
if (!nuddSource?.combatProfile || !asgeirSource?.combatProfile) throw new Error('Both current character profiles are required');
const nudd = createDuelFighter(applyCharacterFieldPatch(nuddSource, planNuddDuelRelease(nuddSource)));
function asgeirLoadout(kind) {
  const record = structuredClone(asgeirSource), profile = record.combatProfile;
  const main = kind === 'long-axe' ? 'asgeir-grossaxt' : 'asgeir-axt-rechts';
  profile.weapons.forEach(weapon => { weapon.equipped = weapon.id === main; });
  profile.combat = { ...profile.combat, offHandWeaponId: kind === 'dual-axes' ? 'asgeir-axt-links' : '' };
  profile.armorItems.filter(armor => armor.kind === 'shield').forEach(armor => { armor.equipped = kind === 'axe-shield'; });
  return createDuelFighter(record);
}
const variants = ['dual-axes', 'long-axe', 'axe-shield'].map(id => ({ id, fighter: asgeirLoadout(id) }));
const calibration = [];
for (const variant of variants) {
  const duels = [];
  for (let index = 0; index < 4; index++) duels.push(await simulateOptimizedDuel({ fighters:[nudd,variant.fighter],
    seed: (Math.imul(index + 1,2654435761) + 20261012) >>> 0, choosePlan:chooseHeuristicDuelPlan }));
  calibration.push({ loadout:variant.id, wins:duels.filter(duel=>duel.winner === asgeirSource.name).length,
    meanRemainingHp:duels.reduce((sum,duel)=>sum+duel.hp[1],0)/duels.length,duels });
  console.log(`Loadout ${variant.id}: ${calibration.at(-1).wins}/4 Asgeir wins`);
}
calibration.sort((a,b)=>b.wins-a.wins || b.meanRemainingHp-a.meanRemainingHp);
const selected = variants.find(variant=>variant.id === calibration[0].loadout);
const fighters = [nudd,selected.fighter], reports = [];
for (let index = 0; index < count; index++) {
  const seed = index === 0 ? 44714 : (Math.imul(index + 1001,2654435761) + 20261012) >>> 0;
  reports.push(await simulateOptimizedDuel({ fighters,seed,trace:index === 0,
    choosePlan:context=>chooseSampledDuelPlan(context,{shortlist:6,samples:4}) }));
  console.log(`Optimized duel ${index+1}/${count}: ${reports.at(-1).winner}, ${reports.at(-1).rounds} rounds`);
}
const summary = { schema:'aleria.offline-duel-audit',date:'2026-10-12',
  sourceHashes:records.map(record=>({id:record.id,name:record.name,combatSha256:createHash('sha256').update(JSON.stringify(record.combatProfile)).digest('hex')})),
  participants:fighters.map(fighter=>({id:fighter.character.id,name:fighter.character.name,level:fighter.profile().progression.level,
    maximumHitPoints:fighter.profile().maximumHitPoints,defense:fighter.profile().totalDefense})),
  assumptions:{rested:true,distanceMeters:1.5,terrain:'Neutraler Nahkampf ohne Gelände- oder Überraschungsvorteile',
    criticalConsequences:'Aktuelle W20-Folgen, Beitragslimits, Nachschaden und Aufheben über gemeinsame Mechanik',
    liveWrites:false,initialLoadout:selected.id,loadoutChangesDuringDuel:false},
  policy:'Alle bezahlbaren Kombinationen bekannter Techniken und Fähigkeiten. Erwartungswert-Rangfolge; sechs verschiedene Pakete mit jeweils vier unabhängigen Stichproben einschließlich gegnerischer Antwort. Durchschnaufen wird als begrenzte Reserve bewertet. Beide Seiten kennen nur den aktuellen Stand. Keine Einsicht in zukünftige Duellwürfe. Begrenzte taktische Suche, kein mathematischer Nachweis einer global optimalen Strategie.',
  calibration, count:reports.length,
  wins:Object.fromEntries([...fighters.map(f=>f.character.name),'Unentschieden'].map(name=>[name,reports.filter(r=>r.winner === name).length])),
  meanRounds:reports.reduce((sum,report)=>sum+report.rounds,0)/reports.length,
  firstExample:reports[0],duels:reports.map(({turns,...report})=>report) };
await mkdir(output,{recursive:true});
await writeFile(`${output}/results.json`,JSON.stringify(summary,null,2)+'\n');
console.log(JSON.stringify({selectedLoadout:selected.id,count:summary.count,wins:summary.wins,meanRounds:summary.meanRounds}));
