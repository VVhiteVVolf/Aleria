import { createGrantedItem } from '../item-register/item-register-model.js';
import { formatMoney, moneyState, moneyTotal, toMinor } from '../item-register/item-register-money.js';
import { assertItemQuantity, normalizeItemDefinitionRef } from '../item-definitions/item-definition-model.js';
import { DRAIG_STARTING_POSSESSIONS } from './starting-possessions.mjs';

const RELEASE = '20261105';
const REFRI_RING = 'personal-signet:refri-thornwick';
const clone = value => structuredClone(value);

export function getDraigStartingSourceKey(characterId) {
  if (typeof characterId !== 'string' || !/^[\w:.-]{1,130}$/.test(characterId)) {
    throw Error('Der Startbesitz benötigt eine eindeutige Charakter-ID.');
  }
  return `editorial:draig-start-possessions:${RELEASE}:${characterId}`;
}

function assertIdentity(character) {
  const target = DRAIG_STARTING_POSSESSIONS.find(entry => entry.id === character?.id);
  if (!target || character.name !== target.name) throw Error('Der Empfänger gehört nicht zu den vier freigegebenen Figuren.');
  const worldIds = [character.identity?.worldPersonId, character.genealogy?.worldPersonId].filter(Boolean);
  // Old online records can omit genealogy. Their fixed runtime ID and exact
  // name are bound to the reviewed local registry; conflicting IDs still stop.
  if (worldIds.some(id => id !== target.worldPersonId)) throw Error('Die Weltidentität des Empfängers stimmt nicht überein.');
  if (character.genealogy?.houseId && character.genealogy.houseId !== target.houseId) throw Error('Die Hauszuordnung des Empfängers stimmt nicht überein.');
  return target;
}

function assertSpecification(specification, target) {
  if (!specification || specification.id !== target.id || specification.key !== target.key
    || specification.name !== target.name || specification.worldPersonId !== target.worldPersonId
    || specification.houseId !== target.houseId || specification.moneyCopper !== target.moneyCopper
    || specification.ringTemplateId !== target.ringTemplateId
    || !Array.isArray(specification.items) || specification.items.length !== target.items.length
    || specification.items.some((item, index) => item?.templateId !== target.items[index].templateId || item.quantity !== 1)
    || typeof specification.rationale !== 'string' || !specification.rationale.trim()) {
    throw Error('Die Startbesitzliste entspricht nicht dem begrenzten freigegebenen Auftrag.');
  }
}

function exactMinor(amount) {
  if (typeof amount !== 'number' || !Number.isFinite(amount)) throw Error('Der Geldbetrag ist ungültig.');
  const minor = toMinor(amount);
  if (Math.abs(amount - minor / 100) > Number.EPSILON * Math.max(1, amount)) {
    throw Error('Geldbeträge müssen auf ganze Eisenpfennig genau sein.');
  }
  return minor;
}

function walletMinor(inventory) {
  const wallet = inventory.moneyState ?? inventory.money ?? {};
  if (wallet && typeof wallet === 'object') {
    if (wallet.totalCopper != null) return exactMinor(wallet.totalCopper);
    for (const field of ['gold', 'silver', 'copper', 'pfennig']) {
      if (wallet[field] != null && (typeof wallet[field] !== 'number' || !Number.isSafeInteger(wallet[field]) || wallet[field] < 0)) {
        throw Error('Die vorhandene Geldbörse enthält ungültige Münzwerte.');
      }
    }
  } else if (typeof wallet !== 'string') throw Error('Die vorhandene Geldbörse ist ungültig.');
  return exactMinor(moneyTotal(wallet));
}

function resolveSlots(specification, templates, items) {
  if (!Array.isArray(templates)) throw Error('Die aktuellen Itemvorlagen müssen als Array vorliegen.');
  const index = new Map();
  for (const template of templates) {
    if (!template?.id || index.has(template.id)) throw Error('Eine Itemvorlage fehlt oder ist doppelt vorhanden.');
    index.set(template.id, template);
  }
  const slots = specification.items.map(slot => ({ ...slot, ring: false }));
  if (specification.ringTemplateId === REFRI_RING) {
    const ringIds = new Set([REFRI_RING, 'house-signet:haus-thornwick']);
    if (items.some(item => ringIds.has(item.templateId) || ringIds.has(item.definitionRef?.id)
      || /thornwick/i.test(item.name || '') && /siegelring|ritterring/i.test(item.name || ''))) {
      throw Error('Refri besitzt bereits einen Thornwick-Ring; ohne Beleg wird kein zweiter vergeben.');
    }
    slots.push({ templateId: REFRI_RING, quantity: 1, ring: true });
  } else if (specification.ringTemplateId) {
    const rings = items.filter(item => item.templateId === specification.ringTemplateId || item.definitionRef?.id === specification.ringTemplateId);
    if (rings.length !== 1 || !normalizeItemDefinitionRef(rings[0].definitionRef)) {
      throw Error('Der vorhandene Draig-Siegelring muss genau einmal kanonisch belegt sein.');
    }
  }
  return slots.map(slot => {
    const template = index.get(slot.templateId);
    if (!template) throw Error(`Startbesitzvorlage nicht gefunden: ${slot.templateId}`);
    const reference = normalizeItemDefinitionRef(template.definitionRef);
    if (!reference || reference.id !== template.id) throw Error(`Die kanonische Itemdefinition fehlt: ${slot.templateId}`);
    if (template.combatDefinition || template.mechanicsStatus !== 'narrative' || template.useDefinition?.effects?.length
      || !['werkzeuge', 'sonstiges'].includes(template.category)) throw Error('Startbesitz darf keine Kampfausrüstung oder Magie vergeben.');
    if (slot.ring && (template.definitionKind !== 'unique' || template.category !== 'sonstiges' || template.stackable !== false)) {
      throw Error('Refris persönlicher Ring muss ein nicht stapelbares Unikat sein.');
    }
    return { ...slot, template, quantity: assertItemQuantity({ ...template, kind: template.definitionKind }, slot.quantity) };
  });
}

/** Pure bounded amendment. Persist its claim, unique holder and character atomically. */
export function planDraigStartingPossessions({ character, specification, templates, claim = null, now } = {}) {
  const target = assertIdentity(character);
  const sourceKey = getDraigStartingSourceKey(character.id);
  if (claim !== null) {
    if (typeof claim !== 'object' || claim.sourceKey !== sourceKey || claim.result?.recordId !== character.id) {
      throw Error('Der vorhandene Startbesitzbeleg gehört zu einer anderen Quelle oder Figur.');
    }
    return { character: clone(character), changed: false, fieldPaths: [], added: [], addedItemIds: [], grant: null };
  }
  assertSpecification(specification, target);
  if (typeof now !== 'string' || !Number.isFinite(Date.parse(now))) throw Error('Ein gültiger Vergabezeitpunkt wird benötigt.');
  const inventory = character.inventory || {};
  if (inventory.items != null && !Array.isArray(inventory.items)) throw Error('Die Inventarliste ist ungültig.');
  const items = inventory.items || [];
  const revision = inventory.revision ?? 0;
  if (!Number.isSafeInteger(revision) || revision < 0 || !Number.isSafeInteger(revision + 1)) throw Error('Die Inventarrevision ist ungültig.');
  const slots = resolveSlots(specification, templates, items);
  if (items.length + slots.length > 80) throw Error('Das Empfängerinventar überschreitet die 80 Inventareinträge.');
  const addedItemIds = slots.map((slot, index) => `${character.id}-draig-start-possessions-${RELEASE}-${slot.ring ? 'signet' : index + 1}`);
  if (items.some(item => addedItemIds.includes(item.id) || addedItemIds.includes(item.instanceId))) {
    throw Error('Eine deterministische Startbesitz-ID ist bereits belegt; ohne Beleg wird nichts ergänzt.');
  }
  const grantedMinor = exactMinor(specification.moneyCopper), totalMinor = walletMinor(inventory) + grantedMinor;
  if (!Number.isSafeInteger(totalMinor)) throw Error('Der gemeinsame Geldbetrag überschreitet die sichere Berechnungsgrenze.');
  const grantedItems = slots.map((slot, index) => ({ ...createGrantedItem(clone(slot.template), {
    id: addedItemIds[index], characterId: character.id, characterName: character.name, quantity: slot.quantity, now
  }), category: 'other', ...(slot.ring ? { name: 'Refris alter Thornwick-Siegelring', equipped: true } : {}) }));
  const next = clone(character);
  next.inventory = { ...clone(inventory), items: [...clone(items), ...grantedItems], revision: revision + 1,
    moneyState: moneyState(totalMinor / 100), money: formatMoney(moneyState(totalMinor / 100)) };
  const added = grantedItems.map(item => ({ id: item.id, name: item.name, quantity: item.quantity, definitionRef: clone(item.definitionRef) }));
  const grant = { sourceKey, operationId: sourceKey, title: `Persönlicher Startbesitz · ${character.name}`,
    specificationKey: specification.key, rationale: specification.rationale, at: now,
    rewards: [{ kind: 'money', currency: 'copper', amount: grantedMinor / 100 },
      ...slots.map(slot => ({ kind: 'item', itemId: slot.template.id, quantity: slot.quantity, definitionRef: clone(slot.template.definitionRef) }))],
    result: { recordId: character.id, copper: grantedMinor / 100, addedItemIds: [...addedItemIds], items: clone(added) } };
  return { character: next, changed: true, fieldPaths: ['inventory'], added, addedItemIds, grant };
}
