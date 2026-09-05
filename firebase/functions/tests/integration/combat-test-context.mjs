import { readFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { commitCombatEncounter } from '../../src/mechanics/commit-combat-encounter.js';
import { commitCombatComment, combatCommentInternals } from '../../src/mechanics/commit-combat-comment.js';
import { commitUndoMechanicalComment } from '../../src/mechanics/commit-undo-mechanical-comment.js';
import { resolveCombatProfile } from '../../../../AleriaAlmanach/modules/combat/combat-profile-resolver.js';
import { CombatResolutionService } from '../../../../AleriaAlmanach/modules/combat/combat-resolution-service.js';
import { deriveCombatStateFromComments, overlayCombatHitPointState } from '../../../../AleriaAlmanach/modules/combat/combat-state-model.js';
import { parseDamageFormula } from '../../../../AleriaAlmanach/modules/combat/rules/combat-mvp-rules.js';
import { getActiveCombatEncounter } from '../../../../AleriaAlmanach/modules/combat/combat-encounter-model.js';
import { sortSceneHistory } from '../../src/mechanics/trusted-scene-history.js';

const projectId = 'demo-aleria-combat-checkup';
if (process.env.FIRESTORE_EMULATOR_HOST !== '127.0.0.1:8180') throw Error('This integration fixture requires the dedicated local emulator at 127.0.0.1:8180.');
initializeApp({ projectId });
export const database = getFirestore();
export const actorRecords = await Promise.all(['gildas-gafyr', 'gawain-draig'].map(async name =>
  JSON.parse(await readFile(new URL(`../../../../Charakter%20Archiv%20Exporte/${name}.json`, import.meta.url), 'utf8')).character));
export const ids = actorRecords.map(actor => String(actor.id));
export const threadId = 'temporary-gildas-gawain-checkup';
export const request = (data, uid = 'local-combat-tester') => ({ auth: { uid, token: { aleriaRole: 'player' } }, data });
export const encounter = event => commitCombatEncounter.run(request({ entryId: threadId, text: 'Lokaler Kampftest', metadata: { combatEncounter: event } }));
export const undo = commentId => commitUndoMechanicalComment.run(request({ entryId: threadId, commentId }));
export const record = async actorId => (await database.collection('characters').doc(actorId).get()).data();
export const history = async () => sortSceneHistory((await database.collection('comments').where('entryId', '==', threadId).get()).docs.map(doc => ({ id: doc.id, ...doc.data() })));
export const active = async () => getActiveCombatEncounter(await history());

export async function resetScene() {
  // This endpoint deletes only the disposable, fixed demo project above.
  const result = await fetch(`http://127.0.0.1:8180/emulator/v1/projects/${projectId}/databases/(default)/documents`, { method: 'DELETE' });
  if (!result.ok) throw Error(`Emulator reset failed: ${result.status}`);
  for (const actor of actorRecords) await database.collection('characters').doc(actor.id).set({
    id: actor.id, name: actor.name, title: actor.title || '', portrait: actor.portrait || '',
    combatProfile: actor.combatProfile, inventory: actor.inventory || {}
  });
}

export async function startFight(extra = {}) {
  return encounter({ encounterId: randomUUID(), operation: 'start', title: 'Gildas gegen Gawain', participants: actorRecords.map((actor, index) => ({
    actorId: actor.id, name: actor.name, partyId: index ? 'draig' : 'gafyr', partyName: index ? 'Draig' : 'Gafyr',
    persistence: { kind: 'character', recordId: actor.id }
  })), ...extra });
}

export class CheckupDice {
  constructor(natural = 15) { this.natural = natural; }
  async rollAttack({ modifier = 0, rollMode = 'normal' }) {
    const dice = rollMode === 'normal' ? [this.natural] : [this.natural, this.natural];
    return { id: randomUUID(), natural: this.natural, dice, keptDice: [this.natural], total: this.natural + modifier };
  }
  async rollDamage({ damageFormula, bonus = 0, critical = false }) {
    const parsed = parseDamageFormula(damageFormula);
    const dice = (parsed.terms || [parsed]).flatMap(term => Array.from({ length: term.diceCount * (critical ? 2 : 1) }, () => Math.ceil(term.sides / 2)));
    const modifier = parsed.fixedModifier + Number(bonus);
    return { id: randomUUID(), notation: damageFormula, dice, keptDice: dice, modifier, total: dice.reduce((a, b) => a + b, 0) + modifier };
  }
  async rollSavingThrow({ modifier = 0 }) { return { id: randomUUID(), natural: 12, dice: [12], keptDice: [12], total: 12 + modifier }; }
}

export async function prepareAction({ actorIndex = 0, actionId = '', kind = 'speech', natural = 15, priorSegments = [], orderKey } = {}) {
  const actorRecord = await record(ids[actorIndex]), targetRecord = await record(ids[1 - actorIndex]);
  const comments = await history();
  const draft = { id: 'pending', commentSegments: priorSegments };
  const states = deriveCombatStateFromComments([...comments, draft], { commentId: 'pending', segmentIndex: priorSegments.length });
  const actorBase = resolveCombatProfile(actorRecord, { actionId, segmentKind: 'combataction' });
  const actor = overlayCombatHitPointState(actorBase, states.get(actorRecord.id));
  actor.resources = combatCommentInternals.getEffectiveCommentResources(actorBase.resources, states.get(actorRecord.id)?.resources, `scene:${threadId}:day-1`);
  const target = overlayCombatHitPointState(resolveCombatProfile(targetRecord), states.get(targetRecord.id));
  const resolution = await new CombatResolutionService(new CheckupDice(natural)).resolveAttack({ actor, target, description: 'Prüfangriff' }, { relationship: 'enemy', distanceMeters: 1 });
  const segment = { kind, commentKind: kind, mechanicMode: 'combat', actorId: actorRecord.id, characterId: actorRecord.id,
    charName: actorRecord.name, text: 'Prüfangriff', combatDistanceMeters: 1,
    combatAction: { encounterId: getActiveCombatEncounter(comments)?.encounterId || '', profileActionId: actor.profileActionId, rollMode: 'normal', paymentMode: 'standard' }, combatResolution: resolution };
  return { segment, payload: { entryId: threadId, charName: actorRecord.name, text: 'Prüfangriff', metadata: {
    characterId: actorRecord.id, commentSegments: [...priorSegments, segment], ...(orderKey == null ? {} : { orderKey })
  } } };
}

export const commitAction = (payload, uid) => commitCombatComment.run(request(payload, uid));
