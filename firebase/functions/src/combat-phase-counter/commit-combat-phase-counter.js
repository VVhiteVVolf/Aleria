import { createHash } from 'node:crypto';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { COMBAT_PHASE_EVENT_KIND, DEFAULT_PHASE_SETTINGS } from '../generated/combat-phase-counter/combat-phase-model.js';
import { getActiveCombatEncounter } from '../generated/combat/combat-encounter-model.js';
import { nextMechanicalCommentOrderKey } from '../mechanics/mechanical-comment-order.js';
import { isTrustedSceneContributionComment, sortSceneHistory } from '../mechanics/trusted-scene-history.js';
import { persistCriticalHitPointUpdates } from '../mechanics/critical-comment-lifecycle.js';
import { validateCombatPhaseSettings } from './combat-phase-settings.js';
import { prepareCombatPhaseEffects } from './combat-phase-effects.js';
import { preparePhaseChallenges, scheduledPhaseElements, stagePhaseChallenges } from './combat-phase-challenges.js';
import { readCombatPhaseRoster } from './combat-phase-roster.js';

function fail(code, message) { throw new HttpsError(code, message); }

const hash = value => createHash('sha256').update(value).digest('hex');
const identifier = value => typeof value === 'string' && value.trim() && value.length <= 240 && !value.includes('/');

function readEditorState({ stored, participants, elements, sessionEnded }) {
  const lastArmedPhase = Math.max(1, ...elements.filter(element => element.state === 'armed').map(element => element.phase));
  return {
    revision: stored?.revision || 0, phase: stored?.phase || 0,
    stopped: stored?.stopped === true, sessionEnded,
    settings: stored?.settings || { ...DEFAULT_PHASE_SETTINGS, lastPhase: Math.max(lastArmedPhase, DEFAULT_PHASE_SETTINGS.lastPhase), steps: [] },
    participants: [...participants.values()].map(({ actorId, name }) => ({ actorId, name })),
    challenges: elements.map(({ id, state, phase, title, elementType }) => ({ id, state, phase, title, elementType }))
  };
}

export async function commitCombatPhaseCounterOperation(request, { database = getFirestore(), now = Date.now(), rollDie, selectIndex } = {}) {
  if (!request.auth) fail('unauthenticated', 'Zum Bearbeiten ist die bestehende Anmeldung erforderlich.');
  const { entryId, operation, expectedRevision, operationId, settings } = request.data || {};
  if (!identifier(entryId)) fail('invalid-argument', 'Die Szene muss angegeben sein.');
  if (!['read', 'configure', 'start', 'advance', 'stop'].includes(operation)) fail('invalid-argument', 'Unbekannter Zählervorgang.');
  if (operation !== 'read' && (!/^[a-zA-Z0-9-]{8,80}$/.test(operationId || '') || !Number.isSafeInteger(expectedRevision) || expectedRevision < 0)) {
    fail('invalid-argument', 'Eine Bearbeitungsversion und Vorgangskennung sind erforderlich.');
  }
  const key = hash(entryId);
  const ref = database.collection('combat_phase_counters').doc(key);
  const fingerprint = hash(JSON.stringify({ operation, expectedRevision, settings }));
  const draws = new Map();
  return database.runTransaction(async transaction => {
    const snapshot = await transaction.get(ref);
    const stored = snapshot.data() || null;
    if (operation !== 'read' && stored?.lastOperation?.id === operationId) {
      if (stored.lastOperation.fingerprint !== fingerprint) fail('already-exists', 'Der Vorgang wurde bereits mit anderen Daten gespeichert.');
      return stored.lastOperation.result;
    }

    const turn = await transaction.get(database.collection('comment_turns').doc(entryId));
    const sessionEnded = turn.data()?.current === 'ended';
    if (sessionEnded && operation !== 'read') fail('failed-precondition', 'Die Sitzung ist beendet.');
    const scene = await transaction.get(database.collection('comments').where('entryId', '==', entryId));
    const allHistory = sortSceneHistory(scene.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    const history = allHistory.filter(isTrustedSceneContributionComment);
    const encounter = getActiveCombatEncounter(history.filter(comment => comment.serverValidatedMechanics));
    const participants = await readCombatPhaseRoster(database, transaction, history, entryId, encounter, { names: operation === 'read' });
    const definitions = await transaction.get(database.collection('scene_elements').where('entryId', '==', entryId));
    const elements = scheduledPhaseElements(definitions);
    const editor = readEditorState({ stored, participants, elements, sessionEnded });
    if (operation === 'read') return editor;
    if (expectedRevision !== editor.revision) fail('aborted', 'Der Zähler wurde inzwischen geändert. Lade den aktuellen Stand.');
    if (editor.stopped || (operation === 'start' && editor.phase)) fail('failed-precondition', 'Dieser Zähler wurde bereits gestartet.');
    if ((operation === 'advance' || operation === 'stop') && !editor.phase) fail('failed-precondition', 'Starte den Zähler zuerst.');
    const saved = ['configure', 'start'].includes(operation) || (operation === 'advance' && settings)
      ? validateCombatPhaseSettings(settings, participants, editor.phase, elements, editor.settings) : editor.settings;
    if (operation === 'advance' && editor.phase >= saved.lastPhase) fail('failed-precondition', 'Die letzte Phase ist erreicht.');
    const phase = operation === 'start' ? saved.firstPhase : operation === 'advance' ? editor.phase + 1 : editor.phase;
    const revision = editor.revision + 1;
    const result = { phase, revision, id: '', revealed: [], profileUpdates: [] };
    const next = { entryId, phase, revision, settings: { ...saved, steps: saved.steps.filter(step => step.phase > phase) },
      stopped: operation === 'stop', lastOperation: { id: operationId, fingerprint, result } };
    if (!phase) {
      transaction.set(ref, next);
      return result;
    }

    const phaseRef = database.collection('comments').doc(`phase-${key}-${revision}-${hash(operationId).slice(0, 16)}`);
    const newPhase = operation === 'start' || operation === 'advance';
    const step = newPhase ? saved.steps.find(item => item.phase === phase) : null;
    const event = { counterId: key, operation, revision, phase, firstPhase: saved.firstPhase, lastPhase: saved.lastPhase, renewActions: saved.renewActions,
      phaseConditions: saved.phaseConditions, actorIds: [...participants.keys()], flavor: newPhase ? step?.flavor || '' : stored?.flavor || '' };
    const effects = await prepareCombatPhaseEffects({ database, transaction, history, phase: event, step, participants, encounter,
      commentId: phaseRef.id, draws, rollDie });
    const orderKey = nextMechanicalCommentOrderKey(allHistory, now, now);
    const document = {
      entryId, charName: 'Erzähler', narrator: true, commentKind: COMBAT_PHASE_EVENT_KIND, commentMode: 'combat-phase',
      text: `Phase ${phase} von ${saved.lastPhase}`, combatPhase: { ...event, conditionApplications: effects.applications,
        skippedConditions: effects.skipped, creatureResolutions: effects.creatureResolutions },
      ...(effects.criticalLifecycle.length ? { criticalLifecycle: effects.criticalLifecycle } : {}),
      serverValidatedMechanics: true, mechanicalAudit: true, createdBy: request.auth.uid,
      orderKey, createdAtClient: now, activityAtClient: now, activityAt: FieldValue.serverTimestamp(), ts: FieldValue.serverTimestamp(), schemaVersion: 3
    };
    const upcoming = await preparePhaseChallenges({ database, transaction, elements, event, encounter, participants: [...participants.values()],
      history: [...history, { ...document, id: phaseRef.id }], entryId, commentId: phaseRef.id, orderKey, now, draws, rollDie, selectIndex });
    if (Buffer.byteLength(JSON.stringify(document), 'utf8') > 700_000) fail('resource-exhausted', 'Zu viele Zustandseffekte für einen einzigen Phasenwechsel.');
    result.profileUpdates = persistCriticalHitPointUpdates(transaction, effects.updates, phaseRef.id, now);
    result.id = phaseRef.id;
    result.revealed = stagePhaseChallenges(database, transaction, upcoming, now);
    transaction.create(phaseRef, document);
    transaction.set(ref, { ...next, flavor: event.flavor });
    return result;
  });
}

export const commitCombatPhaseCounter = onCall({ region: 'europe-west1', maxInstances: 10, concurrency: 20,
  enforceAppCheck: false, timeoutSeconds: 30 }, request => commitCombatPhaseCounterOperation(request));
