import { openItemBuilder } from '../item-builder/item-builder-controller.js';
import { itemDefinitionStore } from '../item-definitions/item-definition-store.js';
import { connectItemDefinitionClient } from '../item-definitions/item-definition-client.js';
import { resolveCombatProfile } from '../combat/combat-profile-resolver.js';
const pending = new Map();
export function renderCreatureInventory(creature) {
  const profile = resolveCombatProfile(creature);
  const hitpoints = `${profile.currentHitPoints}/${profile.maximumHitPoints} LP${profile.temporaryHitPoints ? ` +${profile.temporaryHitPoints} temporär` : ''}`;
  const content = typeof globalThis.buildCharacterInventoryPage === 'function' && typeof globalThis.sanitizeCharacterInventoryData === 'function'
    ? globalThis.buildCharacterInventoryPage({ characterInventoryPage: true, characterInventoryReadOnly: true, hideNav: true,
      characterInventory: globalThis.sanitizeCharacterInventoryData({ ...creature.inventory, characterId: creature.id, name: creature.name, portrait: creature.portrait || '', role: creature.type || '', level: String(creature.level || 1),
        hitpoints, carryValue: creature.inventory?.carryValue || 'Noch festlegen', showInfoTable: creature.inventory?.showInfoTable === true,
        ...(creature.inventory?.infoRows ? { infoRows: creature.inventory.infoRows.map(row => /^(?:TP|LP|Lebenspunkte|Trefferpunkte)(?:\s*\/\s*Zustand)?$/i.test(row.label || '') ? { ...row, value: hitpoints } : row) } : {}) }) }, {}, 0, 1)
    : '<p>Die gemeinsame Inventaransicht wird im Almanach geladen.</p>';
  return `<section class="creature-sheet-section"><p>Besitz und mögliche Beute sind getrennte Bestände. Spielleitung und Redaktion können hier definierte Gegenstände zuteilen.</p><button type="button" data-creature-action="grant-inventory-item">Gegenstand über Item-Builder zuteilen</button>${content}</section>`;
}
export async function grantCreatureInventoryItem(creature) {
  if (!creature.id || creature._builtin !== false) throw Error('Bitte die Kreatur zuerst online speichern.');
  if (!pending.has(creature.id)) {
    const template = await openItemBuilder({ key: `creature-grant:${creature.id}` });
    if (!template) return null;
    pending.set(creature.id, { action: 'grant', operationId: crypto.randomUUID(), recordKind: 'creature', recordId: creature.id,
      expectedRevision: creature.inventory?.revision || 0, definitionRef: template.definitionRef, quantity: 1 });
  }
  await connectItemDefinitionClient(); await itemDefinitionStore.save(pending.get(creature.id));
  const result = await itemDefinitionStore.record('creatures', creature.id);
  pending.delete(creature.id); return result;
}
