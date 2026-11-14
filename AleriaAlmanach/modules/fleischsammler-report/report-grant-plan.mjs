import { createGrantedItem } from '../item-register/item-register-model.js';
import { normalizeItemDocumentRef } from '../item-definitions/item-definition-model.js';
import { REPORT_DOCUMENT_ID, REPORT_ITEM_ID } from './case-records.mjs';

export const REPORT_RECIPIENT = Object.freeze({ id: 'person--haus-gafyr--lefraye-gafyr', name: 'Lefraye Gafyr' });
export const REPORT_GRANT_SOURCE = `editorial:fleischsammler-report:20261114:${REPORT_RECIPIENT.id}`;
export const REPORT_INSTANCE_ID = 'lefraye-fleischsammler-ermittlungsbuch-20261114';

// Bounded editorial grant, using the existing possession constructor and award
// ledger. The caller commits inventory and claim atomically with CAS.
export function planReportGrant({ character, template, claim = null, now }) {
  if (character?.id !== REPORT_RECIPIENT.id || character.name !== REPORT_RECIPIENT.name) throw Error('Empfängeridentität stimmt nicht mit Lefraye Gafyr überein.');
  const identities = [character.identity?.worldPersonId, character.genealogy?.worldPersonId, character.worldPersonId].filter(Boolean);
  if (identities.some(id => id !== REPORT_RECIPIENT.id)) throw Error('Widersprüchliche Weltidentität.');
  if (template?.id !== REPORT_ITEM_ID || normalizeItemDocumentRef(template.documentRef)?.id !== REPORT_DOCUMENT_ID || !template.definitionRef) throw Error('Die Ermittlungsbuch-Definition fehlt.');
  if (claim) {
    if (claim.sourceKey !== REPORT_GRANT_SOURCE || claim.result?.recordId !== character.id) throw Error('Fremder Vergabebeleg.');
    return { changed: false, character: structuredClone(character), claim: null };
  }
  if (!now || !Number.isFinite(Date.parse(now))) throw Error('Vergabezeitpunkt fehlt.');
  const inventory = character.inventory || {}, items = inventory.items ?? [], revision = inventory.revision ?? 0;
  if (!Array.isArray(items) || items.length >= 80 || !Number.isSafeInteger(revision) || revision < 0 || !Number.isSafeInteger(revision + 1)) throw Error('Inventar ist voll oder ungültig.');
  if (items.some(item => item.id === REPORT_INSTANCE_ID || item.instanceId === REPORT_INSTANCE_ID || item.templateId === REPORT_ITEM_ID || item.documentRef?.id === REPORT_DOCUMENT_ID)) throw Error('Ein Ermittlungsbuch ist bereits vorhanden; ohne Beleg wird keine zweite Kopie vergeben.');
  const item = createGrantedItem(template, { id: REPORT_INSTANCE_ID, characterId: character.id, characterName: character.name, quantity: 1, now });
  item.category = 'documents';
  item.acquisition = { kind: 'editorial-document', sourceKey: REPORT_GRANT_SOURCE, at: now };
  const after = structuredClone(character);
  after.inventory = { ...structuredClone(inventory), items: [...structuredClone(items), item], revision: revision + 1 };
  return { changed: true, character: after, claim: { sourceKey: REPORT_GRANT_SOURCE, operationId: 'fleischsammler-report-20261114',
    title: template.title, at: now, rewards: [{ kind: 'item', itemId: REPORT_ITEM_ID, definitionRef: structuredClone(template.definitionRef), quantity: 1 }],
    result: { recordId: character.id, copper: 0, items: [{ id: item.id, name: item.name, quantity: item.quantity, definitionRef: structuredClone(item.definitionRef) }] } } };
}
