import { planItemMigration } from './item-migration-model.js';
import { itemDefinitionStore } from './item-definition-store.js';
import { connectItemDefinitionClient } from './item-definition-client.js';
import { ensureItemBuilderStyles } from '../item-builder/item-builder-styles.js';
import { itemMigrationMarkup } from './item-migration-view.js';

function reviewSource(record, review) {
  if (review.itemId) return record.inventory.items.find(item => item.id === review.itemId);
  const entry = record.combatProfile[review.collection].find(entry => entry.id === review.equipmentId);
  const kind = review.collection === 'weapons' ? 'weapon' : 'armor';
  return { ...entry, category: kind, combatDefinition: { ...entry, kind, ...(kind === 'armor' ? { armorKind: entry.kind } : {}) } };
}
export function openItemMigrationDialog(records) {
  ensureItemBuilderStyles();
  const dialog = document.createElement('dialog'); dialog.id = `item-migration-${crypto.randomUUID()}`; dialog.className = 'item-builder'; dialog.setAttribute('aria-label', 'Itembestand prüfen');
  const plans = records.map(record => ({ record, plan: planItemMigration(record) })), pending = new Map();
  dialog.innerHTML = itemMigrationMarkup(plans);
  document.body.appendChild(dialog); let busy = false;
  dialog.querySelector('[data-migration-close]').addEventListener('click', () => { if (!busy) dialog.close(); });
  dialog.addEventListener('cancel', event => { if (busy) event.preventDefault(); });
  dialog.addEventListener('close', () => { globalThis.deactivateDialog?.(dialog.id); dialog.remove(); });
  dialog.addEventListener('click', async event => {
    const button = event.target.closest('[data-migration-record], [data-migration-review]'); if (!button || busy) return;
    busy = true; button.disabled = true;
    try {
      const selection = button.dataset.migrationReview ? JSON.parse(button.dataset.migrationReview) : { recordId: button.dataset.migrationRecord };
      const entry = plans.find(entry => entry.record.id === selection.recordId), { record, plan } = entry;
      const key = `${record.id}:${selection.review?.itemId || selection.review?.equipmentId || 'safe'}`;
      if (!pending.has(key)) {
        let template = null;
        if (selection.review) {
          const { openItemBuilder } = await import('../item-builder/item-builder-controller.js');
          template = await openItemBuilder({ source: reviewSource(record, selection.review), intent: 'variant', key: `migration:${key}` });
          if (!template) return;
        }
        const review = selection.review;
        pending.set(key, { operationId: crypto.randomUUID(), recordId: record.id, recordKind: record.entityType === 'creature' ? 'creatures' : 'characters', expectedRevision: record.inventory?.revision || 0, expectedCombatRevision: record.combatProfile?.revision || 0,
          ...(review ? { definitionRef: template.definitionRef, ...(review.itemId ? { itemId: review.itemId } : { equipmentId: review.equipmentId, collection: review.collection }) } : { itemIds: plan.safe.map(item => item.itemId) }) });
      }
      await connectItemDefinitionClient();
      const result = await itemDefinitionStore.migrate(pending.get(key));
      if (result.record) entry.record = { ...record, ...result.record };
      dialog.querySelector('[role="status"]').textContent = result.message; button.remove();
    } catch (failure) { dialog.querySelector('[role="status"]').textContent = failure.message; }
    finally { busy = false; button.disabled = false; }
  });
  dialog.showModal(); globalThis.activateDialog?.(dialog.id, { initialFocus: '[data-migration-close]' });
}
