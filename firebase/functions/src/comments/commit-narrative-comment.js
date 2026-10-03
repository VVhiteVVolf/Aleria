import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { deriveCombatStateFromComments } from '../generated/combat/combat-state-model.js';
import { isTrustedSceneContributionComment, sortSceneHistory } from '../mechanics/trusted-scene-history.js';
import { nextMechanicalCommentOrderKey } from '../mechanics/mechanical-comment-order.js';
import { prepareCriticalCommentLifecycle, persistCriticalHitPointUpdates } from '../mechanics/critical-comment-lifecycle.js';

const MAX_COMMENT_BYTES = 700_000;

function fail(code, message) {
  throw new HttpsError(code, message);
}

function clean(value, maximum = 250000) {
  return String(value || '').trim().slice(0, maximum);
}

function clonePayload(value) {
  try {
    const serialized = JSON.stringify(value || {});
    if (Buffer.byteLength(serialized, 'utf8') > MAX_COMMENT_BYTES) fail('invalid-argument', 'Der Beitrag ist zu groÃŸ.');
    return JSON.parse(serialized);
  } catch (error) {
    if (error instanceof HttpsError) throw error;
    fail('invalid-argument', 'Der Beitrag enthÃ¤lt ungÃ¼ltige Daten.');
  }
}

function containsPersistentMechanics(metadata = {}) {
  const segments = Array.isArray(metadata.commentSegments) ? metadata.commentSegments : [];
  return !!(
    metadata.combatResolution
    || metadata.combatTransaction
    || metadata.inventoryTransaction
    || metadata.restTransaction
    || metadata.sceneRest
    || metadata.combatEncounter
    || metadata.combatStatus
    || metadata.encounterTransaction
    || metadata.sceneInventoryTransfer
    || metadata.serverValidatedMechanics
    || segments.some(segment => segment?.combatResolution || segment?.combatResolutions || segment?.inventoryUse || segment?.skillResolution)
  );
}

function containsImmutableAuditMechanics(metadata = {}) {
  const segments = Array.isArray(metadata.commentSegments) ? metadata.commentSegments : [];
  return !!(
    metadata.sceneDiceRoll
    || metadata.sceneTimeEvent
    || segments.some(segment => segment?.skillResolution || segment?.skillChallenge)
  );
}

function hasValidSceneDay(metadata = {}) {
  if (!metadata.sceneTimeEvent) return true;
  const anchorDay = Number(metadata.sceneTimeEvent.anchorDay);
  return Number.isInteger(anchorDay) && anchorDay >= 1 && anchorDay <= 1_000_000;
}

export function buildNarrativeCommentDocument(payload, entryId, request, now) {
  const metadata = payload.metadata || {};
  return {
    entryId,
    charName: clean(payload.charName, 160),
    charTitle: clean(payload.charTitle, 160),
    portrait: clean(payload.portrait, 2000) || null,
    text: clean(payload.text),
    deleteCodeHash: clean(payload.deleteCodeHash, 128),
    deleteCodeVersion: 1,
    narrator: payload.narrator === true,
    characterId: clean(metadata.characterId, 160),
    actorType: clean(metadata.actorType, 40),
    creatureId: clean(metadata.creatureId, 160),
    emoteIndex: Number.isInteger(metadata.emoteIndex) ? metadata.emoteIndex : null,
    imageSetId: clean(metadata.imageSetId, 48),
    avatarKind: clean(metadata.avatarKind, 40),
    commentMode: clean(metadata.commentMode, 80) || (payload.narrator ? 'narrator' : 'character'),
    commentKind: clean(metadata.commentKind, 80) || (payload.narrator ? 'narrator' : 'speech'),
    commentSegments: Array.isArray(metadata.commentSegments) ? metadata.commentSegments : null,
    itemShowcase: metadata.itemShowcase && typeof metadata.itemShowcase === 'object' ? metadata.itemShowcase : null,
    fazit: metadata.fazit && typeof metadata.fazit === 'object' ? metadata.fazit : null,
    moduleInsert: null,
    moduleInsertJson: clean(metadata.moduleInsertJson, 500000),
    documentAttachment: metadata.documentAttachment && typeof metadata.documentAttachment === 'object' ? metadata.documentAttachment : null,
    sceneTimeEvent: metadata.sceneTimeEvent && typeof metadata.sceneTimeEvent === 'object' ? metadata.sceneTimeEvent : null,
    sceneTransition: metadata.sceneTransition && typeof metadata.sceneTransition === 'object' ? metadata.sceneTransition : null,
    scenePoll: metadata.scenePoll && typeof metadata.scenePoll === 'object' ? metadata.scenePoll : null,
    sceneDiceRoll: metadata.sceneDiceRoll && typeof metadata.sceneDiceRoll === 'object' ? metadata.sceneDiceRoll : null,
    mechanicalAudit: containsImmutableAuditMechanics(metadata),
    serverCommitted: true,
    orderKey: Number.isFinite(Number(metadata.orderKey)) ? Number(metadata.orderKey) : now,
    createdAtClient: now,
    activityAtClient: now,
    activityAt: FieldValue.serverTimestamp(),
    createdBy: request.auth.uid,
    createdByRole: String(request.auth.token?.aleriaRole || 'player'),
    schemaVersion: 3,
    ts: FieldValue.serverTimestamp()
  };
}

export async function commitNarrativeCommentOperation(request, { database = getFirestore(), now = Date.now() } = {}) {
  if (!request.auth) fail('unauthenticated', 'Eine Firebase-Anmeldung ist erforderlich.');
  const payload = clonePayload(request.data);
  const entryIds = (Array.isArray(payload.entryIds) ? payload.entryIds : [payload.entryId])
    .map(value => clean(value, 240))
    .filter(Boolean);
  const uniqueEntryIds = [...new Set(entryIds)].slice(0, 2);
  if (!uniqueEntryIds.length || !clean(payload.text)) fail('invalid-argument', 'Kommentarbereich und Text sind erforderlich.');
  if (containsPersistentMechanics(payload.metadata)) {
    fail('failed-precondition', 'ZustandsÃ¤ndernde Mechanik braucht ihre eigene serverseitige Transaktion.');
  }

  if (!hasValidSceneDay(payload.metadata)) fail('invalid-argument', 'Der Aleria-Szenentag ist ungÃ¼ltig.');

  const refs = uniqueEntryIds.map(() => database.collection('comments').doc());
  const committed = await database.runTransaction(async transaction => {
    const pending = [];
    // Read all scene copies before writing; retain the previous all-or-nothing save.
    for (const [index, entryId] of uniqueEntryIds.entries()) {
      const ref = refs[index];
      const snapshot = await transaction.get(database.collection('comments').where('entryId', '==', entryId));
      const history = sortSceneHistory(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))).filter(isTrustedSceneContributionComment);
      const states = deriveCombatStateFromComments(history), updates = new Map();
      const lifecycle = await prepareCriticalCommentLifecycle({ database, transaction, states, metadata: payload.metadata || {}, updates });
      const events = lifecycle.finish(payload.metadata || {});
      const document = buildNarrativeCommentDocument(payload, entryId, request, now);
      if (events.length) document.orderKey = nextMechanicalCommentOrderKey(history, payload.metadata?.orderKey, now);
      pending.push({ ref, updates, events, document });
    }
    const profileUpdates = [], criticalLifecycle = [];
    for (const { ref, updates, events, document } of pending) {
      const undo = {};
      const changed = persistCriticalHitPointUpdates(transaction, updates, ref.id, now, undo);
      if (events.length) Object.assign(document, { criticalLifecycle: events, serverValidatedMechanics: true,
        mechanicalAudit: true, mechanicalUndo: undo });
      transaction.create(ref, document);
      profileUpdates.push(...changed); criticalLifecycle.push(...events);
    }
    return { profileUpdates, criticalLifecycle };
  });
  const ids = refs.map(ref => ref.id);
  return { id: ids[0], ids, profileUpdates: committed.profileUpdates, mechanics: { criticalLifecycle: committed.criticalLifecycle } };
}

export const commitNarrativeComment = onCall({ region: 'europe-west1', maxInstances: 20,
  concurrency: 40, enforceAppCheck: false, timeoutSeconds: 20 }, request => commitNarrativeCommentOperation(request));

export const narrativeCommentInternals = Object.freeze({
  containsImmutableAuditMechanics,
  containsPersistentMechanics,
  hasValidSceneDay
});
