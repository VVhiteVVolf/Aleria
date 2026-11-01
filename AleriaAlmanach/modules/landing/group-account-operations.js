import { canManageCharacter } from '../item-register/item-register-model.js';

export const groupAccountMemberId = row => row?.kind === 'creature' ? row.creatureId : row?.characterId;
export const groupAccountMemberKey = row => `${row?.kind === 'creature' ? 'creature' : 'character'}:${groupAccountMemberId(row)}`;
export const canContributeGroupInventory = (record, access = {}) => canManageCharacter(record, {
  authenticated: !!access.uid, uid: access.uid, canModerate: ['admin', 'moderator'].includes(access.role)
});

export function buildGroupAccountRequest({ groupId, action, groupRevision, member, record, access, template, fields, sceneThread }) {
  const input = { groupId, action, expectedGroupRevision: groupRevision };
  if (action === 'grant') {
    if (!template) throw Error('Wählt zuerst einen Gegenstand aus dem Register.');
    input.product = { template: template.id,
      ...(template.definitionRef ? { definitionRef: template.definitionRef } : {}),
      ...(template.moduleId ? { moduleId: template.moduleId } : {}),
      ...(template.sourceRevision != null ? { sourceRevision: template.sourceRevision } : {}) };
    input.quantity = Number(fields.get('quantity'));
    if (!Number.isSafeInteger(input.quantity) || input.quantity < 1) throw Error('Bitte eine ganze positive Menge wählen.');
  } else {
    if (!groupAccountMemberId(member) || !record) throw Error('Der persönliche Vorrat ist noch nicht bereit.');
    if (action === 'deposit' && !canContributeGroupInventory(record, access)) throw Error('Aus diesem persönlichen Vorrat können seine Besitzerin, sein Besitzer oder die Spielleitung beisteuern.');
    input.member = { kind: member.kind === 'creature' ? 'creature' : 'character', recordId: groupAccountMemberId(member) };
    input.expectedMemberRevision = Number(record.inventory?.revision || 0);
    input.object = fields.get('kind') === 'money'
      ? { kind: 'money', currency: fields.get('currency'), quantity: Number(fields.get('moneyQuantity')) }
      : { kind: 'item', itemId: fields.get('itemId'), quantity: Number(fields.get('quantity')) };
    const object = input.object;
    if (!Number.isSafeInteger(object.quantity) || object.quantity <= 0
      || object.kind === 'item' && !object.itemId
      || object.kind === 'money' && !['gold', 'silver', 'copper', 'pfennig'].includes(object.currency)) {
      throw Error('Bitte Gegenstand und eine passende positive Menge wählen.');
    }
  }
  if (fields.has('scene') && sceneThread) input.entryId = sceneThread;
  return input;
}

const knownFailure = error => /(?:invalid-argument|permission-denied|unauthenticated|not-found|aborted|failed-precondition|already-exists)$/.test(error?.code || '');
// Response loss keeps the same immutable request, including its revision guards.
export function createGroupAccountOperations(commit, makeId = () => crypto.randomUUID()) {
  let pending = null, running = false;
  async function run() {
    if (running) throw Error('Die Übergabe wird gerade bestätigt.');
    if (!pending) throw Error('Es ist keine Übergabe offen.');
    running = true;
    try { const result = await commit(structuredClone(pending.input)); pending = null; return result; }
    catch (error) { if (knownFailure(error)) pending = null; throw error; }
    finally { running = false; }
  }
  return { pending: () => pending ? structuredClone(pending.input) : null, retry: run, async submit(input) {
    const fingerprint = JSON.stringify(input);
    if (pending && pending.fingerprint !== fingerprint) throw Error('Bitte zuerst die noch offene Übergabe erneut prüfen.');
    pending ||= { fingerprint, input: { ...structuredClone(input), operationId: makeId() } };
    return run();
  } };
}
