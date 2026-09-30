import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import { readFile, writeFile } from 'node:fs/promises';
import { createCombatParty } from './combat-party-context.mjs';
import { database, undo, encounter, active } from './combat-test-context.mjs';
import { JUNGDRACHE_SHARED_TECHNIQUES as techniques } from '../../../../AleriaAlmanach/modules/combat-styles/drachentanz/techniques/jungdrache-shared-techniques.js';
import { receipts } from '../../../../AleriaAlmanach/tests/fixtures/jungdrache-fixtures.mjs';
import { resolveCombatProfile } from '../../../../AleriaAlmanach/modules/combat/combat-profile-resolver.js';
import { renderCombatEvaluation } from '../../../../AleriaAlmanach/modules/combat/ui/combat-ui.js';

const records = JSON.parse(await readFile(new URL('../../../../CharakterDatenbank/generated/characters.snapshot.json', import.meta.url), 'utf8')).characters;
const definitions = [['asgeir','Asgeir Wolfshorn','Wolfshorn'], ['gawain','Gawain Draig','Cenyri'], ['gildas','Gildas Gafyr','Cenyri']].map(([key,name,team]) => {
  const actor = structuredClone(records.find(c => c.name === name));
  actor.combatProfile.hitPoints.current = resolveCombatProfile(actor).maximumHitPoints;
  actor.combatProfile.resources.forEach(r => { r.current = r.maximum; });
  return { key, actor, team };
});
const report = { environment: 'demo-aleria-combat-checkup, localhost:8180', productionWrites: false, techniques: [], duel: [] };
after(async () => {
  if (process.env.JUNGDRACHE_REPORT) await writeFile(new URL('./jungdrache-duel-results.json', import.meta.url), JSON.stringify(report,null,2)+'\n');
  await database.terminate();
});
const resultOf = committed => committed.mechanics.commentSegments.at(-1).combatResolution;
const actionId = name => `technique:${techniques.find(t => t.name === name).id}`;
async function act(party, actor, target, action = '', rolls = [19], save = 1) {
  const prepared = await party.prepare({ actor, targets: [target], actionId: action, dice: receipts(rolls, save) });
  const committed = await party.commit(prepared);
  const result = resultOf(committed);
  if (prepared.segment.combatResolution.actorHitPointSnapshot) assert.deepEqual(result.actorHitPointSnapshot, prepared.segment.combatResolution.actorHitPointSnapshot);
  return { committed, result };
}

for (const t of techniques) test(`Persisted Jungdrache technique: ${t.name}`, async () => {
  const party = await createCombatParty(definitions);
  const before = await party.snapshot();
  const self = t.noPrimaryDamage || t.target === 'Selbst';
  const { committed, result } = await act(party, 'gildas', self ? 'gildas' : 'asgeir', `technique:${t.id}`);
  assert.equal(result.profileActionId, `technique:${t.id}`);
  if (t.effects?.some(e => e.condition?.counterAttack)) {
    const attack = await act(party, 'asgeir', 'gildas', '', [2,19]);
    assert.equal(attack.result.counterAttacks.length, 1);
    assert.match(renderCombatEvaluation({ combatResolution: attack.result }), /Konter mit Vorteil/);
    const state = (await party.snapshot()).profiles.get('asgeir');
    if (t.name === 'Entwaffnende Klaue') assert.equal(state.weaponUnavailable, true);
    if (t.name === 'Erstickte Antwort') assert.equal(state.resources.find(r => r.id === 'reaction').current, 0);
    if (t.name === 'Fallende Schwinge') assert.equal(state.resources.find(r => r.id === 'bonus-action').current, 0);
    if (t.name === 'Brechender Widerhall') assert.equal(state.resources.find(r => r.id === 'action').current, 0);
    await undo(attack.committed.id);
    const restored = await party.assertConsistent();
    assert.ok(restored.profiles.get('gildas').temporaryConditions.some(c => c.counterAttack));
  }
  await undo(committed.id);
  const restored = await party.assertConsistent();
  for (const key of ['asgeir','gawain','gildas']) assert.equal(restored.profiles.get(key).currentHitPoints, before.profiles.get(key).currentHitPoints);
  report.techniques.push({ name: t.name, stored: true, replay: true, undo: true });
});

test('Complete isolated duel: Asgeir against Gawain and Gildas', async () => {
  const party = await createCombatParty(definitions, 'Jungdrache: Asgeir gegen Gawain und Gildas');
  await act(party, 'gawain', 'gawain', actionId('Lauernde Klaue'));
  await act(party, 'gildas', 'gildas', actionId('Verwurzelte Schuppe'));
  const counter = await act(party, 'asgeir', 'gawain', '', [2,19]);
  report.duel.push({ actor: 'Asgeir', target: 'Gawain', counterDamage: counter.result.counterAttacks[0].resolution.damage.total });
  let finished = false;
  for (let round = 1; round <= 20 && !finished; round++) {
    for (const [actor, target] of [['asgeir', round % 2 ? 'gildas' : 'gawain'], ['gawain','asgeir'], ['gildas','asgeir']]) {
      const profiles = (await party.snapshot()).profiles;
      if (profiles.get('asgeir').currentHitPoints <= 0 || ['gawain','gildas'].every(k => profiles.get(k).currentHitPoints <= 0)) { finished = true; break; }
      if (profiles.get(actor).currentHitPoints <= 0 || profiles.get(target).currentHitPoints <= 0) continue;
      const { result } = await act(party, actor, target);
      report.duel.push({ round, actor, target, damage: result.damage?.total || 0, hitPointsAfter: result.targetSnapshot.hitPointsAfter });
    }
  }
  assert.ok(finished, 'The duel reaches incapacitation');
  const fight = await active();
  const winner = (await party.snapshot()).profiles.get('asgeir').currentHitPoints > 0 ? 'Wolfshorn' : 'Cenyri';
  await encounter({ encounterId: fight.encounterId, operation: 'end', outcome: 'victory', winningPartyId: winner, awardExperience: false, endReason: 'incapacitation' });
  await party.assertConsistent();
  assert.equal(await active(), null);
  report.winner = winner;
});
