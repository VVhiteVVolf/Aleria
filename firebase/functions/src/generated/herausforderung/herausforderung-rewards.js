import { createOwnedItem } from '../item-register/item-register-model.js';
import { moneyState, moneyTotal, toMinor, formatMoney, formatCopper, localizedNumber } from '../item-register/item-register-money.js';
import { synchronizeEquipmentFromInventory } from '../character-equipment/character-equipment-sync.js';
import { attachInventoryEquipment } from '../character-equipment/character-equipment-registration.js';
import { createManualCombatCondition, buildCombatStatusChange, formatStatusDuration } from '../combat-status/combat-status-model.js';
import { COMBAT_STATUS_PRESETS, STATUS_MODIFIERS, STATUS_ROLL_MODES } from '../combat-status/combat-status-catalog.js';
import { normalizeChallengeCombatEffects, validateChallengeCombatEffects, normalizeChallengeRecipient, formatChallengeCombatResult } from './herausforderung-combat-effects.js';

export const MAX_REWARD_ITEMS = 8;
export const MAX_REWARD_EFFECTS = 4;
const clean = (value, max = 180) => String(value || '').trim().slice(0, max);
const copy = value => JSON.parse(JSON.stringify(value));

export function normalizeHerausforderungBenefits(value = {}) {
  return {
    copper: value?.copper != null ? localizedNumber(value.copper) || 0 : (localizedNumber(value?.gold) || 0) * 1000,
    combatEffects: normalizeChallengeCombatEffects(value?.combatEffects),
    items: (Array.isArray(value?.items) ? value.items : []).slice(0, MAX_REWARD_ITEMS).map(item => ({
      template: clean(item?.template, 240), moduleId: clean(item?.moduleId, 240), sourceRevision: clean(item?.sourceRevision, 160),
      quantity: Number(item?.quantity ?? 1), title: clean(item?.title), ...(item?.product ? { product: copy(item.product) } : {})
    })),
    effects: (Array.isArray(value?.effects) ? value.effects : []).slice(0, MAX_REWARD_EFFECTS).map(effect => ({
      effectId: clean(effect?.effectId, 40), presetId: clean(effect?.presetId, 80), name: clean(effect?.name, 160),
      description: clean(effect?.description, 1600), kind: ['buff', 'debuff', 'condition'].includes(effect?.kind) ? effect.kind : 'buff',
      durationKind: clean(effect?.durationKind || 'actor-comments', 40), durationAmount: Number(effect?.durationAmount ?? 2),
      mechanics: { ...(effect?.mechanics || {}) }, ...(effect?.targetActorId ? normalizeChallengeRecipient(effect) : {})
    }))
  };
}

export function validateHerausforderungBenefits(value = {}, { effectsOnly = false } = {}) {
  if (value != null && (typeof value !== 'object' || Array.isArray(value))) return 'Belohnungen müssen als gültige Konfiguration vorliegen.';
  if (value?.items != null && !Array.isArray(value.items)) return 'Die Gegenstandsliste ist ungültig.';
  if (value?.effects != null && !Array.isArray(value.effects)) return 'Die Effektliste ist ungültig.';
  for (const effect of value?.effects || []) {
    if (!effect || typeof effect !== 'object' || Array.isArray(effect)) return 'Jeder Zustand muss als gültiges Objekt vorliegen.';
    if (effect.kind != null && !['buff', 'debuff', 'condition'].includes(effect.kind)) return 'Die Zustandsart ist ungültig.';
    if (effect.targetActorId != null && (typeof effect.targetActorId !== 'string' || effect.targetActorId.length > 240)) return 'Der Zustandsempfänger ist ungültig.';
  }
  const combatError = validateChallengeCombatEffects(value?.combatEffects ?? []);
  if (combatError) return combatError;
  const normalized = normalizeHerausforderungBenefits(value);
  const input = value?.copper ?? (value?.gold != null ? (localizedNumber(value.gold) ?? NaN) * 1000 : 0);
  const copper = input === '' ? 0 : localizedNumber(input);
  if (copper == null || copper < 0 || copper > 1000000000 || Math.abs(copper * 100 - Math.round(copper * 100)) > 0.00001) return 'Kupfertaler müssen zwischen 0 und 1.000.000.000 liegen, mit höchstens zwei Nachkommastellen.';
  if (value?.copper != null && value?.gold != null) return 'Geld nur als copper in Kupfertalern angeben.';
  if (effectsOnly && (copper || value?.items?.length)) return 'Fehlschlagsfolgen dürfen keine Gegenstände oder Geld vergeben.';
  if ((value?.items?.length || 0) > MAX_REWARD_ITEMS) return 'Höchstens acht Gegenstände pro Ansatz wählen.';
  for (const item of normalized.items) {
    if (!item.template || !Number.isSafeInteger(item.quantity) || item.quantity < 1 || item.quantity > 9999) return 'Für jeden Gegenstand eine Registervorlage und eine Menge von 1 bis 9.999 angeben.';
  }
  if ((value?.effects?.length || 0) > MAX_REWARD_EFFECTS) return 'Höchstens vier Effekte pro Ergebnis wählen.';
  const ids = new Set();
  for (const effect of normalized.effects) {
    if (!effect.effectId || ids.has(effect.effectId)) return 'Jeder Effekt benötigt eine eigene Kennung.';
    ids.add(effect.effectId);
    if (effect.presetId && !COMBAT_STATUS_PRESETS.some(preset => preset.id === effect.presetId)) return 'Die Effektvorlage ist unbekannt.';
    const allowed = new Set([...STATUS_MODIFIERS, ...STATUS_ROLL_MODES].map(([key]) => key));
    const preset = COMBAT_STATUS_PRESETS.find(preset => preset.id === effect.presetId);
    if (preset?.mechanics?.blocksActions) allowed.add('blocksActions');
    if (Object.keys(effect.mechanics).some(key => !allowed.has(key))) return 'Der Effekt enthält eine nicht unterstützte Mechanik.';
    try { createManualCombatCondition(effect, { id: effect.effectId }); }
    catch (error) { return error.message; }
  }
  return null;
}

export function hasHerausforderungBenefits(approach) {
  return [approach?.rewards, approach?.partialEffects, approach?.failureEffects].some(value =>
    normalizeHerausforderungBenefits(value).copper > 0 || value?.items?.length || value?.effects?.length || value?.combatEffects?.length);
}

export function benefitsForTier(approach, tier) {
  if (['erfolg', 'kritischer-erfolg'].includes(tier)) return approach.rewards;
  return tier === 'knapp' ? approach.partialEffects : approach.failureEffects;
}

export function formatHerausforderungRewardReceipt(receipt) {
  if (!receipt) return '';
  if (receipt.alreadyApplied) return 'Die Folgen dieser Ergebnisstufe wurden für diese Figur bereits angewendet.';
  const parts = [];
  const copper = receipt.copper ?? (receipt.gold || 0) * 1000;
  if (copper) parts.push(`${formatCopper(copper)} ins Inventar`);
  for (const item of receipt.items || []) parts.push(`${item.quantity}× ${item.name} ins Inventar`);
  for (const effect of receipt.effects || []) parts.push(`${effect.actorName ? effect.actorName + ': ' : ''}${effect.name} · ${formatStatusDuration(effect)}`);
  for (const effect of receipt.combatEffects || []) parts.push(formatChallengeCombatResult(effect));
  return parts.join(' · ');
}

// The inventory and condition systems remain the owners of money, equipment,
// effect validation and clocks. This module only assembles a challenge grant.
export function applyHerausforderungBenefits({ character, profile, state = {}, benefits, identity, challengeId, tier, encounterId = '', now }) {
  const normalized = normalizeHerausforderungBenefits(benefits);
  const error = validateHerausforderungBenefits(benefits);
  if (error) throw Error(error);
  let inventory = copy(character.inventory || {});
  inventory.items ||= [];
  let combatProfile = copy(character.combatProfile || {});
  const granted = [];
  for (const [index, reference] of normalized.items.entries()) {
    const product = reference.product;
    if (!product || product.id !== reference.template) throw Error('Die Belohnung besitzt keine geprüfte Registervorlage.');
    if (['waffen', 'ruestungen'].includes(product.category) && reference.quantity !== 1) throw Error('Waffen und Rüstungen werden einzeln vergeben.');
    if (inventory.items.length >= 80) throw Error('Das Inventar hat bereits 80 Einträge. Bitte zuerst Platz schaffen.');
    const id = `reward:${identity}:${index}`;
    if (inventory.items.some(item => item.id === id)) throw Error('Diese Belohnung ist bereits im Inventar.');
    const item = createOwnedItem(product, { id, characterId: character.id, characterName: character.name,
      quantity: reference.quantity, unitCopper: product.priceRange?.minCopper || 0, now });
    item.acquisition = { kind: 'challenge-reward', challengeId, at: now };
    item.purchase = { ...item.purchase, sourceKind: 'challenge-reward', paidCopper: 0 };
    inventory.items.push(item);
    attachInventoryEquipment(combatProfile, item);
    granted.push(item);
  }
  if (normalized.copper) {
    const wallet = toMinor(moneyTotal(inventory.moneyState || inventory.money || {}));
    const amount = toMinor(normalized.copper);
    if (!Number.isSafeInteger(wallet + amount)) throw Error('Der Geldbetrag ist zu groß.');
    inventory.moneyState = moneyState((wallet + amount) / 100);
    inventory.money = formatMoney(inventory.moneyState);
  }
  const inventoryChanged = !!(normalized.copper || granted.length);
  if (granted.length) ({ inventory, combatProfile } = synchronizeEquipmentFromInventory({ inventory, combatProfile }));
  const beforeConditions = state.temporaryConditions || profile.temporaryConditions || [];
  let afterConditions = beforeConditions;
  const effects = normalized.effects.map(effect => createManualCombatCondition({ ...effect, source: 'Herausforderung' }, { id: `reward:${identity}:${effect.effectId}`, encounterId }));
  for (const condition of effects) afterConditions = buildCombatStatusChange({ operation: 'add', profile,
    state: { temporaryConditions: afterConditions }, condition }).temporaryConditions;
  return { inventory, combatProfile, inventoryChanged,
    actorInventorySnapshot: inventoryChanged ? { before: copy(character.inventory || {}), after: inventory } : null,
    actorConditionSnapshot: effects.length ? { before: copy(beforeConditions), after: afterConditions } : null,
    receipt: { schemaVersion: 1, challengeId, tier, actorId: character.id, copper: normalized.copper,
      items: granted.map(item => ({ id: item.id, templateId: item.templateId, name: item.name, quantity: item.quantity, image: item.image })),
      effects: effects.map(effect => ({ id: effect.id, name: effect.name, statusKind: effect.statusKind, mechanics: effect.mechanics, durationModel: effect.durationModel })) }
  };
}
