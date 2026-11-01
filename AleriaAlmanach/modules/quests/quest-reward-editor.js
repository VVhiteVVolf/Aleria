import { e } from './quest-view.js';
import { normalizeQuestRewards } from './quest-model.js';
import { splitQuestMoney } from './quest-reward-allocation.js';

export function mountQuestRewardEditor(root, { templates, initial = [], party = [], allocations = false, groupModuleId = '', groupName = '' }) {
  let rows = initial.map(row => ({ ...row }));
  const itemKey = item => `${item.definitionRef?.id || item.itemId || item.id}@${item.definitionRef?.revision || ''}`;
  for (const row of initial.filter(row => row.kind === 'item')) if (!templates.some(item => itemKey(item) === itemKey(row))) templates = [...templates, { ...row, id: row.itemId || row.definitionRef?.id, title: row.title || row.itemId || row.definitionRef?.id }];
  const selected = (a, b) => a === b ? ' selected' : '';
  const recipients = [...party.filter(member => member.kind === 'character').map(member => ({ key: `character|${member.recordId}`, name: member.name })), ...(groupModuleId ? [{ key: `group|${groupModuleId}`, name: `Gruppenkonto · ${groupName || groupModuleId}` }] : [])];
  function render() {
    root.innerHTML = `${allocations ? `<div class="quest-allocation-tools"><select data-reward-recipient aria-label="Alle Belohnungen zuweisen an">${recipients.map(row => `<option value="${e(row.key)}">${e(row.name)}</option>`).join('')}</select><button type="button" data-reward-assign>Alles zuweisen</button><button type="button" data-reward-split>Geld auf alle aufteilen</button></div>` : ''}<div class="quest-reward-tools"><button type="button" data-reward-add="money">＋ Geld</button><button type="button" data-reward-add="item">＋ Item</button><button type="button" data-reward-add="honor">＋ Ehrung</button><button type="button" data-reward-builder>Item-Builder öffnen</button></div><div>${rows.map((row, index) => `<div class="quest-reward-row" data-reward-row="${index}">${row.kind === 'money' ? `<select aria-label="Währung" data-field="currency">${[['gold','Goldtaler'],['silver','Silbertaler'],['copper','Kupferstücke'],['pfennig','Pfennig']].map(([id, title]) => `<option value="${id}"${selected(id, row.currency)}>${title}</option>`).join('')}</select><input aria-label="Betrag" data-field="amount" type="number" min="0.01" step="0.01" value="${e(row.amount)}">` : row.kind === 'item' ? `<select aria-label="Itemdefinition" data-field="itemKey"><option value="">Item wählen …</option>${templates.map(item => `<option value="${e(itemKey(item))}"${selected(itemKey(item), itemKey(row))}>${e(item.title)}${item.definitionKind === 'unique' ? ' · Unikat' : ''}</option>`).join('')}</select><input aria-label="Menge" data-field="quantity" type="number" min="1" max="9999" value="${e(row.quantity)}">` : `<input aria-label="Ehrung" data-field="title" placeholder="Titel / Ehrung" value="${e(row.title)}"><input aria-label="Bedingung" data-field="condition" placeholder="Bedingung" value="${e(row.condition)}">`}${allocations ? `<select aria-label="Empfänger" data-field="recipient">${recipients.map(member => `<option value="${e(member.key)}"${selected(member.key, `${row.recipientKind || 'character'}|${row.recordId}`)}>${e(member.name)}</option>`).join('')}</select>` : '<span></span>'}<button type="button" data-reward-remove="${index}" aria-label="Belohnung entfernen">×</button></div>`).join('')}</div>`;
  }
  const capture = event => {
    const field = event.target.dataset.field, index = Number(event.target.closest('[data-reward-row]')?.dataset.rewardRow);
    if (!field || !rows[index]) return;
    if (field === 'recipient') { [rows[index].recipientKind, rows[index].recordId] = event.target.value.split('|'); } else if (field === 'itemKey') {
      const item = templates.find(item => itemKey(item) === event.target.value);
      if (item) rows[index] = { ...rows[index], itemId: item.id, title: item.title, definitionRef: item.definitionRef, ...(item.moduleId ? { moduleId: item.moduleId, sourceRevision: item.sourceRevision } : {}) };
    } else rows[index][field] = ['quantity', 'amount'].includes(field) ? Number(event.target.value) : event.target.value;
  };
  let destroyed = false;
  function updateTemplates(items) {
    if (destroyed) return;
    const next = [...new Map([...templates, ...items.filter(item => !['pferde','vieh'].includes(item.category))].map(item => [itemKey(item), item])).values()];
    if (next.length === templates.length) return;
    const focused = root.contains(document.activeElement) ? { index: document.activeElement.closest('[data-reward-row]')?.dataset.rewardRow, field: document.activeElement.dataset.field } : null;
    templates = next; render();
    if (focused?.field) root.querySelector(`[data-reward-row="${focused.index}"] [data-field="${focused.field}"]`)?.focus({ preventScroll: true });
  }
  const refreshDefinitions = async () => {
    const { itemDefinitionStore } = await import('../item-definitions/item-definition-store.js');
    updateTemplates(itemDefinitionStore.snapshot().templates);
  };
  const click = async event => {
    if (event.target.closest('[data-reward-assign]')) { const [kind,id] = root.querySelector('[data-reward-recipient]').value.split('|'); rows = rows.map(row => ({ ...row, recipientKind: kind, recordId: id })); render(); }
    if (event.target.closest('[data-reward-split]')) { try { rows = splitQuestMoney(rows, party); render(); } catch (error) { root.dispatchEvent(new CustomEvent('quest-form-error', { bubbles: true, detail: error })); } }
    const add = event.target.closest('[data-reward-add]');
    if (add) { rows.push({ ...(add.dataset.rewardAdd === 'money' ? { kind: 'money', amount: 10, currency: 'copper' } : add.dataset.rewardAdd === 'item' ? { kind: 'item', quantity: 1 } : { kind: 'honor', title: '', condition: '' }), recordId: party.find(member => member.kind === 'character')?.recordId || '' }); render(); }
    const remove = event.target.closest('[data-reward-remove]');
    if (remove) { rows.splice(Number(remove.dataset.rewardRemove), 1); render(); }
    if (event.target.closest('[data-reward-builder]')) {
      try {
        const { openItemBuilder } = await import('../item-builder/item-builder-controller.js');
        await openItemBuilder({ source: { kind: 'quest', title: 'Questbelohnung' }, templates, intent: 'variant' });
        await refreshDefinitions();
      } catch (error) { root.dispatchEvent(new CustomEvent('quest-form-error', { bubbles: true, detail: error })); }
    }
  };
  root.addEventListener('input', capture); root.addEventListener('change', capture); root.addEventListener('click', click); render();
  document.addEventListener('aleria:item-definitions-changed', refreshDefinitions);
  return { value() {
    if (!allocations) return normalizeQuestRewards(rows);
    return [...new Set(rows.map(row => `${row.recipientKind || 'character'}|${row.recordId}`))].map(key => { const [kind, recordId] = key.split('|'); if (!recordId) throw Error('Bitte einen Empfänger wählen.'); return { ...(kind === 'group' ? { kind } : {}), recordId, rewards: normalizeQuestRewards(rows.filter(row => `${row.recipientKind || 'character'}|${row.recordId}` === key)) }; });
  }, destroy() { destroyed = true; root.removeEventListener('input', capture); root.removeEventListener('change', capture); root.removeEventListener('click', click); document.removeEventListener('aleria:item-definitions-changed', refreshDefinitions); } };
}
