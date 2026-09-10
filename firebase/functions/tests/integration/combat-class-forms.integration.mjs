import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import { writeFile } from 'node:fs/promises';
import { CLASS_FORM_CASES, COMPLETE_FIGHT_CASES, createClassFormActor, createFormOpponent } from './combat-class-form-fixtures.mjs';
import { createCombatParty } from './combat-party-context.mjs';
import { simulateCombatParty } from './combat-party-simulation.mjs';
import { database, undo, active, encounter, history } from './combat-test-context.mjs';

const report = { environment: { project: 'demo-aleria-combat-checkup', host: '127.0.0.1:8180', productionWrites: false },
  matrix: [], fights: [], guards: [] };
after(async () => {
  if (process.env.CLASS_FORM_REPORT === '1') await writeFile(new URL('./combat-class-form-results.json', import.meta.url), JSON.stringify(report, null, 2) + '\n');
  await database.terminate();
});

function partyDefinitions(fixture) {
  return [{ key: 'fighter', actor: fixture.actor, team: 'Klasse' },
    { key: 'opponent', actor: createFormOpponent(), team: 'Gegner' }];
}
const resultOf = committed => committed.mechanics.commentSegments.at(-1).combatResolution;

for (const entry of CLASS_FORM_CASES) test(`Formprüfung mit Speicherung und Rücknahme: ${entry.title}`, async () => {
  const fixture = createClassFormActor(entry);
  const party = await createCombatParty(partyDefinitions(fixture), entry.title);
  const before = await party.snapshot();
  const prepared = await party.prepare({ actor: 'fighter', targets: ['opponent'], actionId: fixture.actionId,
    distanceMeters: fixture.distanceMeters, weaponGrip: fixture.weaponGrip });
  const committed = await party.commit(prepared);
  const result = resultOf(committed);
  assert.equal(result.profileActionId, fixture.actionId);
  assert.equal(result.attack.hit, true, 'Kontrollierter erfolgreicher Angriff');
  assert(result.damage.total > 0, 'Tatsächlich angewendeter Schaden');
  assert(result.resourceCosts.length > 0, 'Tatsächlich bezahlte Kosten');
  assert.equal(result.targetSnapshot.hitPointsBefore - result.targetSnapshot.hitPointsAfter, result.damage.total);
  const after = await party.assertConsistent();
  const stored = await party.record('fighter');
  assert(stored.combatProfile.techniques.some(technique => technique.id === fixture.technique.id && technique.combatStyleFormId === entry.formId));
  if (entry.foundation) assert.equal(stored.combatProfile.classTraining.selections.find(choice => choice.kind === 'foundation').selectionId, entry.foundation);
  await undo(committed.id);
  const restored = await party.assertConsistent();
  for (const key of ['fighter', 'opponent']) {
    assert.equal(restored.profiles.get(key).currentHitPoints, before.profiles.get(key).currentHitPoints, `${key}: TP nach Rücknahme`);
    assert.deepEqual(restored.profiles.get(key).resources, before.profiles.get(key).resources, `${key}: Ressourcen nach Rücknahme`);
    assert.deepEqual(restored.profiles.get(key).temporaryConditions, before.profiles.get(key).temporaryConditions, `${key}: Zustände nach Rücknahme`);
  }
  report.matrix.push({ classId: entry.classId, formId: entry.formId, foundation: entry.foundation || '', title: entry.title,
    technique: fixture.technique.name, weapon: fixture.weapon.name, damage: result.damage.total, costs: result.resourceCosts,
    remainingHitPoints: after.profiles.get('opponent').currentHitPoints, previewServerReplayEqual: true, undoRestored: true });
});

for (const [index, entry] of COMPLETE_FIGHT_CASES.entries()) test(`Vollständiger Testkampf: ${entry.title}`, async () => {
  const fixture = createClassFormActor(entry);
  const scenario = { id: entry.id, title: entry.title, actors: partyDefinitions(fixture), openingActionIds: { fighter: fixture.actionId } };
  const fight = await simulateCombatParty(scenario, 2026 + index * 71);
  assert(fight.trace.some(turn => turn.actor === fixture.actor.name && turn.action === fixture.technique.name), 'Geprüfte Form wird im vollständigen Kampf tatsächlich eingesetzt');
  assert(fight.participants.some(actor => actor.hitPoints === 0), 'Kampf reicht bis zur Kampfunfähigkeit');
  assert(fight.actions > 1 && fight.recordedActionCount > 1);
  assert.equal(await active(), null, 'Kampf ordnungsgemäß beendet');
  report.fights.push(fight);
  console.log(`${entry.title}: ${fight.rounds} Runden, ${fight.actions} Auswertungen, Sieger ${fight.winner}.`);
});

for (const [classId, formId, techniqueId] of [
  ['cantref', 'drachentanz-pfad-huetender-drache', 'combat-style-drachentanz-huetender-ruhige-schwelle'],
  ['derwyn', 'wyrmtanz-fliessender-wyrm', 'combat-style-sirenentanz-derwyn-wartende-klinge']
]) test(`Schutz ohne versteckten Angriff und mit echtem Ablauf: ${classId}`, async () => {
  const entry = CLASS_FORM_CASES.find(entry => entry.classId === classId && entry.formId === formId);
  const fixture = createClassFormActor(entry, { techniqueId });
  const party = await createCombatParty(partyDefinitions(fixture), `Schutzprüfung ${classId}`);
  const before = await party.snapshot();
  const guarded = resultOf(await party.commit(await party.prepare({ actor: 'fighter', targets: ['fighter'], actionId: fixture.actionId })));
  assert.equal(guarded.damage, null);
  assert(guarded.resourceCosts.length > 0);
  const protectedSnapshot = await party.snapshot();
  assert(protectedSnapshot.profiles.get('fighter').totalDefense > before.profiles.get('fighter').totalDefense);
  assert.equal(protectedSnapshot.profiles.get('fighter').currentHitPoints, before.profiles.get('fighter').currentHitPoints);
  await party.commit(await party.prepare({ actor: 'opponent', targets: ['fighter'] }));
  assert((await party.snapshot()).profiles.get('fighter').totalDefense > before.profiles.get('fighter').totalDefense, 'Fremder Beitrag entfernt den Schutz nicht');
  await party.commit(await party.prepare({ actor: 'fighter', targets: ['opponent'], actionId: `weapon:${fixture.weapon.id}` }));
  assert.equal((await party.snapshot()).profiles.get('fighter').totalDefense, before.profiles.get('fighter').totalDefense, 'Nächster eigener Beitrag beendet den Schutz');
  report.guards.push({ classId, technique: fixture.technique.name, paid: true, noDamage: true, persisted: true, expired: true });
});

test('abgelöste Formattacken sind im gespeicherten Charakter und im Szenenentwurf nicht nutzbar', async () => {
  const fixture = createClassFormActor(CLASS_FORM_CASES.find(entry => entry.classId === 'cantref'));
  const party = await createCombatParty(partyDefinitions(fixture));
  const before = await history();
  await assert.rejects(() => party.prepare({ actor: 'fighter', targets: ['opponent'], actionId: 'technique:combat-style-drachentanz-retired-test' }), /nicht im Bogen/);
  assert.equal((await history()).length, before.length);
  await party.assertConsistent();
  const fight = await active();
  await encounter({ encounterId: fight.encounterId, operation: 'end', outcome: 'draw', awardExperience: false, endReason: 'agreement' });
});
