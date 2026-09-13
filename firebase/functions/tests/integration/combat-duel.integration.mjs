import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { after, test } from 'node:test';
import { actorRecords, database, ids, resetScene, startFight, commitAction, history, record, encounter, active, threadId, undo } from './combat-test-context.mjs';
import { createDuelProfiles, simulateDuel, DUEL_VARIANTS } from '../../../../AleriaAlmanach/tools/duel-rehearsal/duel-simulation.mjs';

const profiles = createDuelProfiles(actorRecords);
const samples = JSON.parse(await readFile(new URL('../../../../AleriaAlmanach/docs/combat/duel-checkup-2026-09-13/selected-traces.json', import.meta.url), 'utf8'));
const verified = [];
after(async () => {
  if (process.env.DUEL_SERVER_REPORT === '1') await writeFile(new URL('../../../../AleriaAlmanach/docs/combat/duel-checkup-2026-09-13/server-verification.json', import.meta.url), JSON.stringify(verified, null, 2) + '\n');
  await database.terminate();
});

for (const sample of samples) test(`Vollständiges Serverduell ${sample.variant} / ${sample.seed}`, async () => {
  await resetScene();
  await startFight();
  let lastId = '';
  const report = await simulateDuel({ profiles, variant: DUEL_VARIANTS.find(variant => variant.id === sample.variant), seed: sample.seed,
    entryId: threadId, initialComments: await history(), onComment: async payload => {
      const committed = await commitAction(payload);
      lastId = committed.id;
      for (const [index, actual] of committed.mechanics.commentSegments.entries()) {
        const expected = payload.metadata.commentSegments[index].combatResolution;
        const result = actual.combatResolution;
        assert.equal(result.serverValidated, true);
        assert.equal(result.damage?.total, expected.damage?.total, 'Vorschau und Server: Schaden');
        assert.equal(result.targetSnapshot.hitPointsAfter, expected.targetSnapshot.hitPointsAfter, 'Vorschau und Server: TP');
        assert.deepEqual(result.actorResourceSnapshot.after.map(resource => [resource.id, resource.current]),
          expected.actorResourceSnapshot.after.map(resource => [resource.id, resource.current]), 'Vorschau und Server: Ressourcen');
      }
    } });
  assert.equal(report.winner, sample.winner);
  assert.deepEqual(report.hitPoints, sample.hitPoints);
  for (const [index, id] of ids.entries()) assert.equal((await record(id)).combatProfile.hitPoints.current, report.hitPoints[index]);
  const current = await active();
  const ended = await encounter({ encounterId: current.encounterId, operation: 'end', outcome: 'victory',
    winningPartyId: report.winner === 'Gildas' ? 'gafyr' : 'draig', awardExperience: false, endReason: 'incapacitation' });
  assert.equal(await active(), null);
  await undo(ended.id);
  assert.ok(await active());
  await undo(lastId);
  assert.ok((await record(ids[report.winner === 'Gildas' ? 1 : 0])).combatProfile.hitPoints.current > 0);
  verified.push({ variant: sample.variant, seed: sample.seed, winner: report.winner, rounds: report.rounds, actions: report.actions,
    previewServerParity: true, storedHitPoints: true, encounterEnd: true, undo: true });
});
