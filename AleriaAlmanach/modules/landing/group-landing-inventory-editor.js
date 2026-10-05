import { REGISTER_CATEGORIES } from '../item-register/item-register-model.js?v=20260928-equipment-art-v4';
import { addGroupInventoryItem, updateGroupInventoryItem } from './group-landing-inventory.js';
import { groupRegisterSnapshot, groupCatalogItems, groupItemPrice, categoryLabel } from './group-landing-register.js';
import { html, groupPortrait, empty } from './group-landing-markup.js';
import { field, select, iconField } from './group-landing-fields.js';

const holderOptions = members => [['', 'Gemeinsamer Vorrat'], ...members.map(member => [member.id, member.name])];

export function inventoryEditorBody(kind, { data, members, itemId }) {
  const item = data.group.inventory.find(item => item.id === itemId);
  if (kind === 'inventory-item' && !item) throw new Error('Dieser Bestandseintrag ist nicht mehr vorhanden.');
  return `${kind === 'inventory' ? `<p class="group-dialog-help">Wähle eine Vorlage aus dem Handelsregister und erfasse den gemeinsamen Bestand.</p><div class="group-catalog-filters">${field('Güter suchen', 'itemSearch')}${select('Kategorie', 'itemCategory', [['', 'Alle Kategorien'], ...REGISTER_CATEGORIES.map(item => [item.id, item.label])])}${select('Quelle', 'itemSection', [['', 'Standard & Sortimente'], ['standard', 'Standardgüter'], ['offer', 'Anbieter & Sortimente']])}</div><div class="group-catalog-results" data-group-item-results></div><button type="button" data-group-catalog-more hidden>Weitere Güter anzeigen</button>` : `<h4>${html(item.name)}</h4>`}
    <div class="group-form-grid">${field('Menge', 'quantity', item?.quantity ?? 1, 'number')}${select('Verantwortliches Mitglied', 'holderMemberId', holderOptions(members), item?.holderMemberId)}${field('Lagerort', 'location', item?.location)}${field('Notiz', 'note', item?.note)}${kind === 'inventory-item' ? iconField('Bild / Icon', 'image', item.image) : ''}</div>
    ${kind === 'inventory-item' ? '<label class="group-checkbox"><input type="checkbox" name="removeItem"> Eintrag aus dem Gruppenbestand entfernen</label>' : ''}`;
}

export function collectInventoryEdit(kind, form, context) {
  const fields = new FormData(form);
  const quantity = Number(fields.get('quantity'));
  const patch = { quantity, holderMemberId: String(fields.get('holderMemberId') || ''), location: String(fields.get('location') || '').trim(), note: String(fields.get('note') || '').trim() };
  if (patch.holderMemberId && !context.members.some(member => member.id === patch.holderMemberId)) throw new Error('Das verantwortliche Mitglied ist nicht mehr verfügbar.');
  if (kind === 'inventory-item') {
    if (fields.has('removeItem')) return context.data.group.inventory.filter(item => item.id !== context.itemId);
    return updateGroupInventoryItem(context.data.group.inventory, context.itemId, { ...patch, image: String(fields.get('image') || '').trim() });
  }
  const item = groupRegisterSnapshot().items.find(item => item.id === fields.get('itemKey'));
  return addGroupInventoryItem(context.data.group.inventory, item, { ...patch, id: context.makeId('stock') });
}

export function mountInventoryChooser(overlay) {
  const results = overlay.querySelector('[data-group-item-results]');
  if (!results) return () => {};
  const abort = new AbortController();
  let limit = 30, selectedKey = '';
  const input = name => overlay.querySelector(`[name="${name}"]`)?.value || '';
  function render() {
    selectedKey = overlay.querySelector('[name="itemKey"]:checked')?.value || selectedKey;
    const snapshot = groupRegisterSnapshot();
    const items = groupCatalogItems(snapshot, { search: input('itemSearch'), category: input('itemCategory'), section: input('itemSection') });
    const visible = items.slice(0, limit);
    // Filtering does not discard the explicitly chosen reference.
    const selected = snapshot.items.find(item => item.id === selectedKey);
    if (selected && !visible.some(item => item.id === selectedKey)) visible.unshift(selected);
    results.innerHTML = `<p class="group-catalog-count">${items.length} Güter${snapshot.status === 'loading' ? ' · Register wird geladen' : ''}</p>${visible.map(item => `<label class="group-catalog-row"><input type="radio" name="itemKey" value="${html(item.id)}"${item.id === selectedKey ? ' checked' : ''}>${groupPortrait(item.image, item.title, 'group-stock-image')}<span><strong>${html(item.title)}</strong><small>${html(categoryLabel(item.category))} · ${html(item.listName || 'Standardgüter')}</small></span><small>${html(groupItemPrice(item))}</small></label>`).join('') || empty('Keine passenden Güter. Suche oder Kategorie ändern.')}`;
    overlay.querySelector('[data-group-catalog-more]').hidden = items.length <= limit;
  }
  overlay.addEventListener('input', event => { if (event.target.name === 'itemSearch') { limit = 30; render(); } }, { signal: abort.signal });
  overlay.addEventListener('change', event => { if (['itemCategory', 'itemSection'].includes(event.target.name)) { limit = 30; render(); } }, { signal: abort.signal });
  overlay.addEventListener('click', event => { if (event.target.closest('[data-group-catalog-more]')) { limit += 30; render(); } }, { signal: abort.signal });
  globalThis.addEventListener('item-db-store-updated', render, { signal: abort.signal });
  globalThis.AleriaItemRegister?.ensure?.(); render();
  return () => abort.abort();
}
