import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { normalizeCombatEncounterEvent as normalize, deriveCombatEncounterState, buildEncounterExperienceAwards, applyCombatEncounterCommentToStateMap } from '../modules/combat/combat-encounter-model.js';
import { getEncounterValidationError, getEncounterActionValidationError, prepareEncounterParticipants } from '../modules/combat/combat-encounter-lifecycle.js';
import { suggestEncounterOutcome } from '../modules/combat/combat-encounter-outcome.js';
import { buildCombatEncounterSummary, captureEncounterSnapshot } from '../modules/combat/combat-encounter-summary.js';
import { renderEncounterSummary } from '../modules/combat-encounter/combat-encounter-summary-ui.js';
import { resolveCombatProfile } from '../modules/combat/combat-profile-resolver.js';
import { CombatResolutionService } from '../modules/combat/combat-resolution-service.js';
import { deriveCombatStateFromComments, overlayCombatHitPointState } from '../modules/combat/combat-state-model.js';

const member = (actorId, partyId, extra = {}) => ({ actorId, name: actorId, partyId, partyName: partyId, status: 'active',
  persistence: { kind: 'character', recordId: actorId }, experienceValue: 100, ...extra });
const roster = [member('Gildas', 'Gafyr'), member('Gawain', 'Draig')];
const start = (participants = roster) => ({ id: 'start', serverValidatedMechanics: true, combatEncounter: normalize({ encounterId: 'duel', operation: 'start', participants }) });
const current = history => deriveCombatEncounterState(history).get('duel');
const end = extra => normalize({ encounterId: 'duel', operation: 'end', outcome: 'victory', winningPartyId: 'Gafyr', ...extra });

test('ein vorbereiteter Angriff bleibt an seinen laufenden Kampf gebunden', () => {
  const action = { encounterId: 'duel', actorId: 'Gildas' };
  assert.equal(getEncounterActionValidationError(action, current([start()])), '');
  assert.match(getEncounterActionValidationError(action, null), /beendet/);
  assert.match(getEncounterActionValidationError({ ...action, encounterId: '' }, current([start()])), /verändert/);
  assert.equal(getEncounterActionValidationError({ encounterId: '', actorId: 'Gildas' }, null), '');
  const removed = current([start([ { ...roster[0], status: 'fled' }, roster[1]])]);
  assert.match(getEncounterActionValidationError(action, removed), /nicht aktiv/);
});

test('Abschlussformular kann fehlende oder manipulierte EP und Profilquellen nicht übernehmen', () => {
  const active = current([start()]);
  for (const experienceValue of [undefined, 0, 999999]) {
    const event = end({ participants: [{ actorId: 'Gawain', status: 'defeated', experienceValue,
      partyId: 'Gafyr', name: 'Fälschung', persistence: { kind: 'character', recordId: 'outsider' } }] });
    const merged = prepareEncounterParticipants(event, active);
    assert.deepEqual(merged.get('Gawain'), { ...active.participants.get('Gawain'), status: 'defeated' });
    assert.equal(buildEncounterExperienceAwards({ participants: merged }, 'Gafyr').awards[0].experience, 100);
  }
});

test('Beginn erfasst EP und TP aus dem aufgelösten Profil und Szenenstand', () => {
  const event = normalize({ encounterId: 'duel', operation: 'start', participants: roster });
  const profiles = new Map(roster.map(participant => [participant.actorId, { progression: { level: 2, experienceReward: 75 }, currentHitPoints: 30, maximumHitPoints: 30 }]));
  const prepared = prepareEncounterParticipants(event, null, profiles, new Map([['Gildas', { current: 19, maximum: 30 }]]));
  assert.equal(prepared.get('Gildas').entrySnapshot.current, 19);
  assert.equal(prepared.get('Gawain').experienceValue, 75);
});

test('Sieger werden nur aus eindeutigen Kampfständen vorgeschlagen', () => {
  assert.equal(suggestEncounterOutcome(roster), null);
  assert.equal(suggestEncounterOutcome(roster.map(participant => ({ ...participant, status: 'defeated' }))), null);
  assert.equal(suggestEncounterOutcome([roster[0], { ...roster[1], status: 'left' }]), null);
  assert.deepEqual(suggestEncounterOutcome([roster[0], { ...roster[1], status: 'surrendered' }]), {
    outcome: 'victory', winningPartyId: 'Gafyr', endReason: 'surrender'
  });
});

test('Unentschieden und Abbruch benötigen keine Siegerseite, Sieg schon', () => {
  const active = current([start()]);
  for (const outcome of ['draw', 'aborted']) assert.equal(getEncounterValidationError(end({ outcome, winningPartyId: '' }), active), '');
  assert.match(getEncounterValidationError(end({ winningPartyId: '' }), active), /Sieger/);
  assert.equal(buildEncounterExperienceAwards({ participants: roster }, '').totalExperience, 0);
});

test('neue Beiträge und doppelter Abschluss machen eine alte Vorschau ungültig', () => {
  const event = end({ expectedRevision: 'start' });
  const history = [start(), { id: 'speech', serverCommitted: true, commentSegments: [{ actorId: 'Gildas', kind: 'speech' }] }];
  assert.match(getEncounterValidationError(event, current(history)), /verändert/);
  history.push({ id: 'end', combatEncounter: end({ outcome: 'draw' }) });
  assert.match(getEncounterValidationError(event, current(history)), /nicht mehr aktiv/);
  assert.match(getEncounterValidationError(start().combatEncounter, current(history)), /bereits verwendet/);
});

test('Start verlangt zwei Seiten; Duell verlangt zwei Figuren', () => {
  assert.match(getEncounterValidationError(start([roster[0]]).combatEncounter), /zwei Kämpfer/);
  assert.match(getEncounterValidationError(start([roster[0], { ...roster[1], partyId: 'Gafyr' }]).combatEncounter), /Seiten/);
  assert.match(getEncounterValidationError({ ...start([...roster, member('Dritter', 'Dritte')]).combatEncounter, combatType: 'duel' }), /genau zwei/);
});

test('persistente Profile dürfen nicht unter mehreren Akteurkennungen EP erhalten', () => {
  const duplicate = { ...roster[0], actorId: 'alias' };
  assert.match(getEncounterValidationError(start([...roster, duplicate]).combatEncounter), /Dasselbe gespeicherte Profil/);
  const creature = id => member(id, 'Dritte', { persistence: { kind: 'scene-creature', sourceCreatureId: 'template' } });
  assert.equal(getEncounterValidationError(start([...roster, creature('c1'), creature('c2')]).combatEncounter), '');
});

test('Reaktionskosten zählen bei ihrer Quelle; fremde Handlungen vor dem Beitritt zählen nicht', () => {
  const later = member('Dritter', 'Gafyr');
  const attack = { actorId: 'Dritter', targetId: 'Außenstehend', damage: { total: 5 }, resourceCosts: [] };
  const history = [start(), { combatResolution: attack }, { combatEncounter: { encounterId: 'duel', operation: 'add', participants: [later] } },
    { combatResolution: { ...attack, ruleResourceSnapshots: [{ sourceActorId: 'Gildas',
      before: [{ id: 'mana', name: 'Mana', current: 5 }, { id: 'reaction', current: 1, scope: 'comment' }],
      after: [{ id: 'mana', current: 3 }, { id: 'reaction', current: 0, scope: 'comment' }] }] } } ];
  const summary = buildCombatEncounterSummary({ encounterId: 'duel', participants: [...roster, later], comments: history });
  assert.equal(summary.actionCount, 1);
  assert.equal(summary.participants[2].actions, 1);
  assert.deepEqual(summary.participants[0].costs, [{ id: 'mana', name: 'Mana', amount: 2 }]);
});

test('Abschluss erhält fremde Zustände und heilt Beteiligte nicht', () => {
  const outsider = { current: 7, concentration: { actionName: 'Wache' }, channeling: { actionName: 'Ritual' },
    temporaryConditions: [{ name: 'Fremde Aura', durationModel: { kind: 'combat', encounterId: 'other' } }],
    encounterAuraTemporaryHitPoints: { encounterId: 'other', amount: 5 } };
  const states = new Map([['Gildas', { current: 3, maximum: 30, resources: [{ id: 'mana', current: 1, maximum: 5 }],
    concentration: { actionName: 'Fokus' }, temporaryConditions: [{ name: 'Kampf', durationModel: { kind: 'combat' } }] }], ['observer', structuredClone(outsider)]]);
  applyCombatEncounterCommentToStateMap(states, start());
  applyCombatEncounterCommentToStateMap(states, { combatEncounter: end({ participants: roster }) });
  assert.deepEqual(states.get('observer'), outsider);
  assert.equal(states.get('Gildas').current, 3);
  assert.equal(states.get('Gildas').resources[0].current, 1);
  assert.equal(states.get('Gildas').concentration, null);
  assert.equal(states.get('Gildas').temporaryConditions.length, 0);
});

test('Fazit zählt Mehrzielhandlung und persistenten Verbrauch einmal und blendet Handlungsaktionen aus', () => {
  const first = { actorId: 'Gildas', actorName: 'Gildas', targetId: 'Gawain', targetName: 'Gawain', actionName: 'Stoß', damage: { total: 7 },
    resourceCosts: [{ resourceId: 'mana', name: 'Mana', amount: 2, scope: 'persistent' }, { resourceId: 'action', amount: 1, scope: 'comment' }] };
  const history = [ { combatResolution: first }, start(), { id: 'attack', combatResolution: first,
    commentSegments: [{ combatResolutions: [first, { ...first, damage: { total: 4 }, resourceCosts: [] }] }] },
    { combatEncounter: end() }, { combatResolution: first } ];
  const summary = buildCombatEncounterSummary({ encounterId: 'duel', participants: roster, comments: history });
  assert.equal(summary.actionCount, 1);
  assert.equal(summary.participants[0].damage, 11);
  assert.deepEqual(summary.participants[0].costs, [{ id: 'mana', name: 'Mana', amount: 2 }]);
  assert.equal(summary.participants[0].before, null);
});

test('Fazit stellt Namen sicher dar und unterscheidet fehlende Anfangswerte von null TP', () => {
  const summary = { actionCount: 0, participants: [{ name: '<script>bad</script>', before: null, after: { current: 0, maximum: 30 }, actions: 0, damage: 0, costs: [] }] };
  const markup = renderEncounterSummary(end({ summary }), { preview: true });
  assert.ok(markup.includes('&lt;script&gt;'));
  assert.ok(markup.includes('nicht erfasst → 0/30'));
  assert.ok(!markup.includes('<script>'));
});

test('Gildas gegen Gawain: reale Profile, Kampfhandlung, Fazit und einmalige EP-Vergabe', async () => {
  const records = await Promise.all(['gildas-gafyr', 'gawain-draig'].map(async name => JSON.parse(await readFile(new URL(`../../Charakter%20Archiv%20Exporte/${name}.json`, import.meta.url), 'utf8')).character));
  const profiles = new Map(records.map(record => [String(record.id), resolveCombatProfile(record)]));
  const members = records.map((record, index) => member(String(record.id), index ? 'Draig' : 'Gafyr', { name: record.name }));
  const event = normalize({ encounterId: 'duel', operation: 'start', combatType: 'training', awardExperience: false, participants: members });
  event.participants = [...prepareEncounterParticipants(event, null, profiles).values()];
  const history = [{ id: 'start', serverValidatedMechanics: true, combatEncounter: event }];
  const states = deriveCombatStateFromComments(history);
  const actor = overlayCombatHitPointState(profiles.get(members[0].actorId), states.get(members[0].actorId));
  const target = overlayCombatHitPointState(profiles.get(members[1].actorId), states.get(members[1].actorId));
  const dice = { async rollAttack({ modifier }) { return { natural: 15, total: 15 + modifier, dice: [15], keptDice: [15] }; },
    async rollDamage() { return { total: 5, dice: [5], keptDice: [5] }; },
    async rollSavingThrow({ modifier }) { return { natural: 12, total: 12 + modifier, dice: [12], keptDice: [12] }; } };
  const resolution = await new CombatResolutionService(dice).resolveAttack({ actor, target });
  history.push({ id: 'attack', serverValidatedMechanics: true, commentSegments: [{ actorId: actor.characterId, kind: 'action', combatResolution: resolution }] });
  const active = current(history);
  assert.equal(active.combatType, 'training');
  assert.equal(active.awardExperience, false);
  const closing = end({ expectedRevision: 'attack', awardExperience: false, endReason: 'surrender',
    participants: [{ actorId: members[1].actorId, status: 'surrendered' }] });
  assert.equal(getEncounterValidationError(closing, active), '');
  closing.participants = [...prepareEncounterParticipants(closing, active).values()];
  closing.summary = buildCombatEncounterSummary({ encounterId: 'duel', participants: closing.participants, comments: history,
    states: deriveCombatStateFromComments(history), profiles });
  assert.equal(closing.summary.actionCount, 1);
  assert.deepEqual(closing.summary.participants[0].before, captureEncounterSnapshot(profiles.get(members[0].actorId)));
  history.push({ id: 'end', combatEncounter: closing });
  assert.equal(current(history).active, false);
  assert.match(getEncounterValidationError(closing, current(history)), /nicht mehr aktiv/);
});
