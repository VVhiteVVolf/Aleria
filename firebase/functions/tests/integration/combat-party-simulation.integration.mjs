import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import { writeFile } from 'node:fs/promises';
import { database } from './combat-test-context.mjs';
import { PARTY_SCENARIOS, simulateCombatParty } from './combat-party-simulation.mjs';

const reports = [];
after(async () => {
  if (process.env.COMBAT_PARTY_REPORT === '1') await writeFile(new URL('./combat-party-results.json', import.meta.url), JSON.stringify(reports, null, 2) + '\n');
  await database.terminate();
});

for (const scenario of PARTY_SCENARIOS) for (const seed of [13, 71, 2026]) {
  test(`${scenario.title} · Würfelfolge ${seed}`, async () => {
    const report = await simulateCombatParty(scenario, seed);
    reports.push(report);
    assert.ok(report.actions > 0);
    assert.ok(report.recordedActionCount > 0);
    console.log(`${scenario.id} / ${seed}: ${report.rounds} Runden, ${report.actions} Zielauswertungen, Sieger ${report.winner}.`);
  });
}
