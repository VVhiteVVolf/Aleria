import { createGrantedItem } from '../item-register/item-register-model.js';
import { moneyTotal, moneyState, formatMoney, toMinor } from '../item-register/item-register-money.js';
import { assertItemQuantity } from '../item-definitions/item-definition-model.js';

const RELEASE = '20261102';
const safeId = value => typeof value === 'string' && /^[\w:.-]{1,130}$/.test(value);

export function getStartingPossessionsSourceKey(characterId) {
  if (!safeId(characterId)) throw Error('Der Startbesitz benötigt eine eindeutige Charakter-ID.');
  return `editorial:knight-start-possessions:${RELEASE}:${characterId}`;
}

function resolveTemplates(specification, templates) {
  if (!specification || !safeId(specification.key) || typeof specification.rationale !== 'string' || !specification.rationale.trim()) {
    throw Error('Eine begründete persönliche Startbesitzliste wird benötigt.');
  }
  if (!Array.isArray(specification.items) || specification.items.length < 2 || specification.items.length > 3) {
    throw Error('Die Startbesitzliste muss zwei bis drei Kleinigkeiten enthalten.');
  }
  if (!Array.isArray(templates)) throw TypeError('Die aktuellen Itemvorlagen müssen als Array übergeben werden.');
  const index = new Map();
  for (const template of templates) {
    if (!template?.id || index.has(template.id)) throw Error(`Fehlende oder doppelte Itemvorlage: ${template?.id || ''}`);
    index.set(template.id, template);
  }
  const requested = new Set();
  return specification.items.map(item => {
    if (!item || typeof item.templateId !== 'string' || requested.has(item.templateId)) throw Error('Eine Startbesitzvorlage fehlt oder ist doppelt angegeben.');
    requested.add(item.templateId);
    const template = index.get(item.templateId);
    if (!template) throw Error(`Startbesitzvorlage nicht gefunden: ${item.templateId}`);
    const ordinaryArcaneComponent = template.category === 'arkanes' && /unverzaubert/i.test(template.title || '')
      && template.mechanicsStatus === 'narrative' && !template.useDefinition?.effects?.length;
    if (template.combatDefinition || ['waffen', 'ruestungen', 'pferde', 'vieh'].includes(template.category)
      || template.category === 'arkanes' && !ordinaryArcaneComponent) {
      throw Error(`Startbesitz darf keine Kampfausrüstung, Magie oder Gefährten vergeben: ${item.templateId}`);
    }
    return { template, quantity: assertItemQuantity(template, item.quantity) };
  });
}

/** Pure one-time grant plan; the caller must atomically write its external claim. */
export function planKnightStartingPossessions({ character, specification, templates, claim = null, now } = {}) {
  if (!character || typeof character.name !== 'string' || !character.name.trim()) throw Error('Ein benannter Empfänger wird benötigt.');
  const sourceKey = getStartingPossessionsSourceKey(character.id);
  if (claim !== null) {
    if (typeof claim !== 'object' || claim.sourceKey !== sourceKey || claim.result?.recordId !== character.id) {
      throw Error('Der vorhandene Startbesitzbeleg gehört zu einer anderen Quelle oder Figur.');
    }
    return { character: structuredClone(character), changed: false, addedItemIds: [], grant: null };
  }
  if (typeof now !== 'string' || !Number.isFinite(Date.parse(now))) throw Error('Ein gültiger Vergabezeitpunkt wird benötigt.');
  const slots = resolveTemplates(specification, templates);
  if (typeof specification.moneyCopper !== 'number' || !Number.isFinite(specification.moneyCopper)) throw Error('Das Startgeld muss in Kupfertalern angegeben werden.');
  const grantedMinor = toMinor(specification.moneyCopper);
  if (Math.abs(specification.moneyCopper - grantedMinor / 100) > Number.EPSILON * Math.max(1, specification.moneyCopper)) {
    throw Error('Das Startgeld muss auf ganze Eisenpfennige genau angegeben werden.');
  }
  const inventory = character.inventory || {};
  if (inventory.items != null && !Array.isArray(inventory.items)) throw Error('Die Inventarliste ist ungültig.');
  const revision = inventory.revision ?? 0;
  if (!Number.isSafeInteger(revision) || revision < 0 || !Number.isSafeInteger(revision + 1)) throw Error('Die Inventarrevision ist ungültig.');
  const items = inventory.items || [];
  const addedItemIds = slots.map((_, index) => `${character.id}-start-possessions-${RELEASE}-${index + 1}`);
  if (items.some(item => addedItemIds.includes(item.id) || addedItemIds.includes(item.instanceId))) {
    throw Error('Eine deterministische Startbesitz-ID ist bereits belegt; ohne Vergabebeleg wird nichts ergänzt.');
  }
  const totalMinor = toMinor(moneyTotal(inventory.moneyState ?? inventory.money ?? {})) + grantedMinor;
  if (!Number.isSafeInteger(totalMinor)) throw Error('Der gemeinsame Geldbetrag überschreitet die sichere Berechnungsgrenze.');
  const grantedItems = slots.map(({ template, quantity }, index) => createGrantedItem(structuredClone(template), {
    id: addedItemIds[index], characterId: character.id, characterName: character.name, quantity, now
  }));
  const nextCharacter = structuredClone(character);
  nextCharacter.inventory = { ...structuredClone(inventory), items: [...structuredClone(items), ...grantedItems], revision: revision + 1 };
  if (grantedMinor) {
    nextCharacter.inventory.moneyState = moneyState(totalMinor / 100);
    nextCharacter.inventory.money = formatMoney(nextCharacter.inventory.moneyState);
  }
  const rewards = slots.map(({ template, quantity }) => ({ kind: 'item', itemId: template.id, quantity,
    ...(template.definitionRef ? { definitionRef: structuredClone(template.definitionRef) } : {}) }));
  if (grantedMinor) rewards.unshift({ kind: 'money', currency: 'copper', amount: grantedMinor / 100 });
  const grant = {
    sourceKey, operationId: `knight-start-possessions:${RELEASE}:${character.id}`,
    title: `Persönlicher Startbesitz · ${character.name}`, specificationKey: specification.key,
    rationale: specification.rationale, at: now, rewards,
    result: { recordId: character.id, copper: grantedMinor / 100,
      items: grantedItems.map(item => ({ id: item.id, name: item.name, quantity: item.quantity,
        ...(item.definitionRef ? { definitionRef: structuredClone(item.definitionRef) } : {}) })) }
  };
  return { character: nextCharacter, changed: true, addedItemIds, grant };
}
