import { createHash } from 'node:crypto';
import { getFirestore } from 'firebase-admin/firestore';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { normalizeQuest, normalizeQuestLinks, normalizeQuestParty, questStamp, questStampKey, questId, QUEST_EVENT_TYPES } from '../generated/quests/quest-model.js';
import { normalizeQuestAllocations, prepareQuestPayout } from './quest-rewards.js';
import { readQuestEvidence } from './quest-evidence.js';
import { readQuestSceneWindows } from './quest-scene-windows.js';
const hash = value => createHash('sha256').update(value).digest('hex');
const gm = auth => ['admin', 'moderator'].includes(auth.token?.aleriaRole);
const editor = auth => gm(auth) || auth.token?.aleriaRole === 'editor';
const fail = (code, message) => { throw new HttpsError(code, message); };
const clean = (value, limit = 240) => String(value || '').trim().slice(0, limit);
const memberKey = member => `${member.kind}:${member.recordId}`;
async function readParty(database, transaction, input) {
  const party = normalizeQuestParty(input), records = [];
  for (const member of party) {
    const snapshot = await transaction.get(database.doc(`${member.kind === 'creature' ? 'creatures' : 'characters'}/${member.recordId}`));
    if (!snapshot.exists) fail('not-found', 'Ein Gruppenmitglied wurde nicht gefunden.');
    records.push({ ...snapshot.data(), ...member, name: snapshot.data().name || member.name });
  }
  return records;
}
function owned(auth, members) {
  return gm(auth) || members.every(member => member.ownerUid === auth.uid);
}
export async function commitQuestOperation(database, auth, input = {}) {
  if (!auth) fail('unauthenticated', 'Bitte zuerst im Almanach anmelden.');
  if (JSON.stringify(input).length > 100000) fail('invalid-argument', 'Die Queständerung ist zu umfangreich.');
  const operationId = questId(input.operationId), id = questId(input.id), action = input.action;
  const fingerprint = hash(JSON.stringify(input)), now = new Date().toISOString();
  const receipt = database.doc(`quest_transactions/${hash(`${auth.uid}:${operationId}`)}`);
  return database.runTransaction(async transaction => {
    const previous = await transaction.get(receipt);
    if (previous.exists) {
      if (previous.data().fingerprint !== fingerprint) fail('already-exists', 'Diese Vorgangskennung wurde bereits anders verwendet.');
      return previous.data().result;
    }
    let result;
    if (action === 'save') {
      if (!editor(auth)) fail('permission-denied', 'Questakten werden von Redaktion oder Spielleitung bearbeitet.');
      const reference = database.doc(`quests/${id}`), snapshot = await transaction.get(reference);
      if (Number(snapshot.data()?.revision || 0) !== Number(input.expectedRevision || 0)) fail('aborted', 'Die Questakte wurde inzwischen geändert.');
      const quest = { ...normalizeQuest({ ...input.quest, id }), revision: Number(input.expectedRevision || 0) + 1, updatedAt: now, updatedBy: auth.uid };
      transaction.set(reference, quest); result = { quest };
    } else if (action === 'start') {
      const reference = database.doc(`quest_runs/${id}`), snapshot = await transaction.get(reference);
      if (snapshot.exists) fail('already-exists', 'Dieser Gruppendurchlauf existiert bereits.');
      const questRef = database.doc(`quests/${questId(input.questId || input.quest?.id)}`), questSnapshot = await transaction.get(questRef);
      const quest = questSnapshot.exists ? normalizeQuest(questSnapshot.data()) : normalizeQuest(input.quest);
      const records = await readParty(database, transaction, input.party);
      if (!owned(auth, records)) fail('permission-denied', 'Du kannst deine eigenen Figuren anmelden; die Spielleitung kann Gruppen zusammenstellen.');
      const party = records.map(({ kind, recordId, name }) => ({ kind, recordId, name })), stamp = questStamp(input.stamp);
      const links = normalizeQuestLinks({ ...quest.links, modules: [...quest.links.modules, ...(input.groupModuleId ? [questId(input.groupModuleId)] : [])], scenes: [...quest.links.scenes, ...(input.scenes || [])] });
      const sceneWindows = await readQuestSceneWindows(database, transaction, links.scenes);
      const run = { schemaVersion: 1, id, questId: quest.id, questRevision: quest.revision, title: quest.title, summary: quest.summary, patron: quest.patron,
        links, sceneWindows, ...(quest.dossier ? { dossier: quest.dossier } : {}), objectives: quest.objectives, rewards: quest.rewards, party, partyKeys: party.map(memberKey), groupName: clean(input.groupName, 180) || 'Abenteuergruppe',
        memberUids: [...new Set(records.map(row => row.ownerUid).filter(Boolean))], groupModuleId: input.groupModuleId ? questId(input.groupModuleId) : '', createdBy: auth.uid, started: stamp, ended: null, status: 'active',
        partyClocks: Object.fromEntries(party.map(member => [memberKey(member), stamp])), locations: {}, visited: [], rewardPlan: [], rewardStatus: 'pending', completedObjectives: [],
        eventCount: 0, revision: 1, updatedAt: now, createdAt: now };
      transaction.create(reference, run); result = { run };
    } else {
      const reference = database.doc(`quest_runs/${id}`), snapshot = await transaction.get(reference);
      if (!snapshot.exists) fail('not-found', 'Dieser Questdurchlauf fehlt.');
      const run = { ...snapshot.data(), id };
      if (Number(input.expectedRevision) !== run.revision) fail('aborted', 'Der Questverlauf wurde inzwischen geändert. Bitte neu laden.');
      if (!['log', 'finish', 'claim', 'rewards'].includes(action)) fail('invalid-argument', 'Unbekannte Questaktion.');
      if (action === 'rewards') {
        if (!gm(auth)) fail('permission-denied', 'Die Spielleitung korrigiert die Belohnungszuteilung.');
        if (run.status !== 'completed' || run.rewardStatus === 'claimed') fail('failed-precondition', 'Nur ausstehende Belohnungen abgeschlossener Quests lassen sich korrigieren.');
        const rewardPlan = normalizeQuestAllocations(input.rewardPlan || [], run.party, run.groupModuleId);
        const event = { id: hash(operationId), runId: id, sequence: run.eventCount + 1, kind: 'reward-plan', stamp: run.ended, actors: [],
          text: clean(input.text, 6000) || 'Die Spielleitung hat die ausstehende Belohnungszuteilung korrigiert.', recordedAt: now, createdBy: auth.uid };
        transaction.update(reference, { rewardPlan, rewardStatus: 'ready', revision: run.revision + 1, eventCount: event.sequence, updatedAt: now });
        transaction.create(database.doc(`quest_events/${hash(`${id}:${operationId}`)}`), event);
        result = { event, revision: run.revision + 1 };
      } else if (action === 'claim') {
        if (!gm(auth)) fail('permission-denied', 'Die Spielleitung vergibt die bestätigten Belohnungen.');
        if (run.status !== 'completed' || run.rewardStatus === 'claimed') fail('failed-precondition', 'Der Auftrag ist noch nicht abgeschlossen oder wurde bereits ausgezahlt.');
        // Preserve the board's existing once-per-publication reward contract.
        // A second UI must not create a second payment for the same notice.
        const noticeSource = run.questId.startsWith('notice:') && run.rewardPlan.some(row => row.rewards.length) ? run.questId : '';
        const noticeClaim = noticeSource ? database.doc(`item_award_claims/${hash(noticeSource)}`) : null;
        if (noticeClaim && (await transaction.get(noticeClaim)).exists) fail('already-exists', 'Die Belohnung dieses Aushangs wurde bereits über die Tafel oder einen Questdurchlauf vergeben.');
        const payout = await prepareQuestPayout(database, transaction, run, auth.uid, now);
        const award = { runId: id, actorUid: auth.uid, at: now, allocations: payout.result };
        const claim = database.doc(`quest_reward_claims/${id}`), priorClaim = await transaction.get(claim);
        if (priorClaim.exists) fail('already-exists', 'Die Questbelohnung wurde bereits vergeben.');
        payout.write(); transaction.create(claim, award);
        if (noticeClaim) transaction.create(noticeClaim, { sourceKey: noticeSource, title: run.title, actorUid: auth.uid, operationId,
          fingerprint, at: now, result: { runId: id, allocations: payout.result } });
        transaction.update(reference, { rewardStatus: 'claimed', rewardReceipt: award, revision: run.revision + 1, updatedAt: now });
        result = { ...award, revision: run.revision + 1 };
      } else {
        if (run.status !== 'active') fail('failed-precondition', 'Abgeschlossene Questverläufe bleiben erhalten.');
        const stamp = questStamp(input.stamp), actors = Array.isArray(input.actors) ? input.actors.map(questId) : run.party.map(memberKey);
        if (!actors.length) fail('invalid-argument', 'Bitte mindestens ein beteiligtes Gruppenmitglied wählen.');
        if (new Set(actors).size !== actors.length || actors.some(key => !run.party.some(member => memberKey(member) === key))) fail('invalid-argument', 'Ungültige Teilnehmerauswahl.');
        const members = await readParty(database, transaction, run.party.filter(member => actors.includes(memberKey(member))));
        if (!owned(auth, members)) fail('permission-denied', 'Du kannst den Verlauf deiner eigenen Figuren ergänzen.');
        // Split parties may act at different times. Only the selected members advance.
        if (actors.some(key => questStampKey(stamp) < questStampKey(run.partyClocks[key]))) fail('failed-precondition', 'Die Zeit eines gewählten Gruppenmitglieds darf nicht zurücklaufen.');
        const event = { id: hash(operationId), sequence: run.eventCount + 1, kind: action === 'finish' ? 'completion' : input.kind,
          text: clean(input.text, 6000), actors, stamp, recordedAt: now, createdBy: auth.uid };
        const updates = { revision: run.revision + 1, eventCount: event.sequence, updatedAt: now,
          partyClocks: { ...run.partyClocks, ...Object.fromEntries(actors.map(key => [key, stamp])) } };
        if (action === 'finish') {
          if (!gm(auth)) fail('permission-denied', 'Die Spielleitung bestätigt den Abschluss.');
          if (Object.values(run.partyClocks).some(clock => questStampKey(stamp) < questStampKey(clock))) fail('failed-precondition', 'Der Abschluss liegt vor dem letzten Gruppenereignis.');
          const status = input.status === 'abandoned' ? 'abandoned' : 'completed';
          updates.sceneWindows = await readQuestSceneWindows(database, transaction, run.links.scenes, run.sceneWindows, { finish: true });
          Object.assign(updates, { status, ended: stamp, endedKey: questStampKey(stamp), rewardPlan: status === 'completed' ? normalizeQuestAllocations(input.rewardPlan || [], run.party, run.groupModuleId) : [], rewardStatus: status === 'completed' ? 'ready' : 'none' });
        } else {
          if (!QUEST_EVENT_TYPES.includes(input.kind) || !event.text) fail('invalid-argument', 'Bitte Ereignisart und Beschreibung angeben.');
          if (input.kind === 'objective') {
            const objectiveId = questId(input.objectiveId);
            if (!run.objectives.some(row => row.id === objectiveId)) fail('invalid-argument', 'Dieses Ziel gehört nicht zur Quest.');
            event.objectiveId = objectiveId; updates.completedObjectives = [...new Set([...run.completedObjectives, objectiveId])];
          }
          if (input.kind === 'evidence') event.evidence = await readQuestEvidence(database, transaction, run, questId(input.commentId));
          if (input.place) {
            const place = { name: clean(input.place.name, 180), mapId: input.place.mapId ? questId(input.place.mapId) : '', pinId: input.place.pinId ? questId(input.place.pinId) : '' };
            if (!place.name || (place.mapId && !run.links.maps.includes(place.mapId))) fail('invalid-argument', 'Der Ort braucht einen Namen und eine verknüpfte Karte.');
            event.place = place; updates.visited = [...run.visited.filter(row => JSON.stringify(row) !== JSON.stringify(place)), place].slice(-100);
            updates.locations = { ...run.locations, ...Object.fromEntries(actors.map(key => [key, place])) };
          }
          if (input.links) {
            updates.links = normalizeQuestLinks(input.links);
            updates.sceneWindows = await readQuestSceneWindows(database, transaction, updates.links.scenes, run.sceneWindows);
          }
        }
        event.runId = id;
        transaction.create(database.doc(`quest_events/${hash(`${id}:${operationId}`)}`), event);
        transaction.update(reference, updates); result = { event, revision: updates.revision };
      }
    }
    transaction.create(receipt, { actorUid: auth.uid, action, fingerprint, result, at: now });
    return result;
  });
}
export const commitQuest = onCall({ region: 'europe-west1', timeoutSeconds: 60, maxInstances: 10 }, async request => {
  try { return await commitQuestOperation(getFirestore(), request.auth, request.data); }
  catch (error) { if (error instanceof HttpsError) throw error; throw new HttpsError('failed-precondition', error.message); }
});
