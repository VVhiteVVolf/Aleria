import { inferInventoryUseMode } from '../inventory-use/inventory-use-model.js';
import { inventoryValuation, formatInventoryPrice } from './character-inventory-valuation.js';
import { describeEquipmentDamageProtection } from '../character-equipment/equipment-damage-protection.js';

const signed = value => Number(value) ? `${Number(value) > 0 ? '+' : '−'}${Math.abs(Number(value))}` : '';
const dice = value => String(value || '').replace(/d/gi, 'W');

export function inventoryCardKind(item = {}) {
  if (item.creatureId || ['pferde', 'vieh'].includes(item.registerCategory)) return 'companion';
  if (item.combatDefinition?.kind === 'weapon' || item.category === 'weapon') return 'weapon';
  if (item.combatDefinition?.kind === 'armor' || item.category === 'armor') return 'armor';
  if (inferInventoryUseMode(item) === 'consume') return 'consumable';
  if (item.registerCategory === 'arkanes' || /artefakt|reliquie|arkan/i.test(`${item.type} ${item.category}`)) return 'artifact';
  if (item.category === 'documents') return 'document';
  return 'equipment';
}

export function inventoryCardModel(item = {}) {
  const kind = inventoryCardKind(item);
  const labels = { weapon: ['Waffe', '⚔'], armor: ['Rüstung', '◇'], consumable: ['Verbrauchsgut', '⚗'],
    artifact: ['Artefakt', '✧'], document: ['Dokument', '▤'], equipment: ['Ausrüstung', '⚒'], companion: ['Gefährte', '♞'] };
  const definition = item.combatDefinition || {};
  const rules = [];
  const actions = [];
  if (kind === 'weapon') {
    if (definition.damageFormula) rules.push({ label: 'Schaden', value: `${dice(definition.damageFormula)}${signed(definition.damageBonus)} ${definition.damageType || ''}`.trim() });
    if (definition.versatileDamageFormula) rules.push({ label: 'Zweihändig', value: `${dice(definition.versatileDamageFormula)}${signed(definition.damageBonus)}` });
    if (Number(definition.attackBonus)) rules.push({ label: 'Trefferbonus', value: signed(definition.attackBonus) });
    actions.push({ name: 'Angreifen', description: [definition.range || 'Nahkampf', definition.properties].filter(Boolean).join(' · ') });
  } else if (kind === 'armor') {
    if (definition.baseArmorClass != null) rules.push({ label: 'Rüstungsklasse', value: `${definition.baseArmorClass}${signed(definition.armorClassBonus)} RK` });
    else if (Number(definition.armorClassBonus)) rules.push({ label: 'Rüstungsbonus', value: `${signed(definition.armorClassBonus)} RK` });
    if (definition.dexterityUnlockLevel) rules.push({ label: 'Rüstungsroutine', value: `Geschicklichkeit ab Stufe ${definition.dexterityUnlockLevel}` });
    actions.push({ name: 'Anlegen', description: definition.properties || 'Schutz wirkt, solange die Rüstung getragen wird.' });
  } else {
    actions.push({ name: kind === 'consumable' ? 'Verbrauchen' : 'Benutzen', description: kind === 'consumable'
      ? 'Im Abschnitt „Konsumieren“ einsetzen. Der Bestand wird beim Eintragen abgezogen.'
      : 'Im Abschnitt „Interagieren“ benutzen. Der Gegenstand bleibt erhalten.' });
  }
  const ruleLabels = new Set(rules.map(row => row.label.toLocaleLowerCase('de')));
  const rows = [
    ...rules,
    { label: 'Handelspreis / Stück', value: formatInventoryPrice(inventoryValuation(item)) },
    ...(item.valuationNote ? [{ label: 'Preisgrundlage', value: item.valuationNote }] : []),
    ...(item.purchase?.unitCopper != null ? [{ label: 'Gezahlter Kaufpreis', value: formatInventoryPrice({minCopper:item.purchase.unitCopper,maxCopper:item.purchase.unitCopper}) }] : []),
    ...(item.infoRows || []).filter(row => !ruleLabels.has(String(row.label).toLocaleLowerCase('de')) && !/^(?:Status|Wert|Preis|Handelspreis|Handelswert)$/i.test(row.label)),
    ...(item.weight && item.weight !== 'Noch festlegen' ? [{ label: 'Gewicht', value: item.weight }] : []),
    { label: 'Bestand', value: `${item.quantity ?? 1} Stück` }
  ];
  const effects = (item.infoRows || []).filter(row => /effekt|wirkung|qualität|verbesserung/i.test(row.label));
  const protection = describeEquipmentDamageProtection(definition.damageProtection);
  if (protection) effects.push({ label: definition.damageProtection.name || 'Rüstungsschutz', value: protection });
  effects.push(...(definition.triggerRules || []).filter(rule => rule.enabled !== false && rule.description)
    .map(rule => ({ label: rule.name || 'Ausrüstungseffekt', value: rule.description })));
  return { kind, label: labels[kind][0], symbol: labels[kind][1], rows, actions, effects,
    price: formatInventoryPrice(inventoryValuation(item)),
    status: item.equipped ? (kind === 'armor' ? 'Angelegt' : 'Ausgerüstet') : 'Im Inventar',
    description: item.flavorText || item.description || 'Zu diesem Gegenstand ist noch keine Beschreibung hinterlegt.' };
}
