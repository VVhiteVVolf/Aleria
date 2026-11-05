import { renderSceneTradeActorPicker, mountSceneTradeActorPickers } from '../scene-trade/scene-trade-actor-picker.js';
import { resolveSceneTradeParticipants, sceneTradeCommentParticipants } from '../scene-trade/scene-trade-participants.js';
import { normalizeSceneTradeSearch } from '../scene-trade/scene-trade-catalog.js';

const mounted = new WeakMap();

export function sceneInventoryPeople({ characters = [], entry = null, comments = [] } = {}) {
  const usable = characters.filter(record => record?.id && record.name && !record.archived);
  const participants = resolveSceneTradeParticipants({ characters: usable, entries: entry ? [entry] : [],
    references: sceneTradeCommentParticipants(comments) });
  const accounts = usable.map(record => ({ key: record.id, id: record.id, kind: 'character', name: record.name,
    record, canDebit: true, inScene: participants.ids.has(record.id) }));
  accounts.sort((first, second) => Number(second.inScene) - Number(first.inScene)
    || normalizeSceneTradeSearch(first.name).localeCompare(normalizeSceneTradeSearch(second.name), 'de'));
  return { accounts, sceneIds: participants.ids };
}

export function refreshSceneInventoryPeople(overlay) {
  const state = mounted.get(overlay);
  if (!state) return;
  for (const field of ['giver', 'receiver']) {
    const input = overlay.querySelector(`#scene-transfer-${field}`), slot = overlay.querySelector(`[data-scene-inventory-picker="${field}"]`);
    if (!input || !slot) continue;
    const value = input.value, label = field === 'giver' ? 'Geber' : 'Empfänger';
    const locked = overlay.dataset.sceneInventoryLocked === 'true';
    const signature = `${value}:${locked}`;
    if (slot.dataset.selection !== signature) {
      slot.innerHTML = renderSceneTradeActorPicker({ accounts: state.accounts, selectedKey: value, label, field, disabled: locked });
      slot.dataset.selection = signature;
    }
  }
  for (const button of overlay.querySelectorAll('[data-scene-inventory-scope]')) {
    const scope = button.dataset.sceneInventoryScope;
    button.setAttribute('aria-pressed', String(state.scope === scope));
    button.disabled = overlay.dataset.sceneInventoryLocked === 'true' || scope === 'scene' && !state.sceneIds.size;
    const count = button.querySelector('[data-scene-scope-count]');
    if (count) count.textContent = String(scope === 'scene' ? state.sceneIds.size : state.accounts.length);
  }
}

export function mountSceneInventoryPeople(overlay, options = {}) {
  disposeSceneInventoryPeople(overlay);
  const people = sceneInventoryPeople(options);
  const state = { ...people, scope: people.sceneIds.size ? 'scene' : 'all', lifetime: new AbortController() };
  mounted.set(overlay, state);
  const giver = overlay.querySelector('#scene-transfer-giver'), receiver = overlay.querySelector('#scene-transfer-receiver');
  giver.value = state.accounts[0]?.id || '';
  receiver.value = state.accounts.find(account => account.id !== giver.value)?.id || giver.value;
  refreshSceneInventoryPeople(overlay);
  const canEdit = () => overlay.classList.contains('active') && overlay.dataset.sceneInventoryLocked !== 'true';
  state.pickers = mountSceneTradeActorPickers(overlay, {
    getAccounts: () => state.scope === 'scene' ? state.accounts.filter(account => account.inScene) : state.accounts,
    canEdit,
    onSelect({ field, value }) {
      if (!['giver', 'receiver'].includes(field) || !state.accounts.some(account => account.id === value)) return;
      for (const picker of overlay.querySelectorAll('[data-trade-actor-picker][open]')) picker.open = false;
      const input = overlay.querySelector(`#scene-transfer-${field}`);
      input.value = value;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });
  overlay.addEventListener('click', event => {
    const button = event.target.closest?.('[data-scene-inventory-scope]');
    if (!button || !overlay.contains(button) || !canEdit()) return;
    const scope = button.dataset.sceneInventoryScope;
    if (!['scene', 'all'].includes(scope)) return;
    event.preventDefault(); state.scope = scope;
    for (const picker of overlay.querySelectorAll('[data-trade-actor-picker][open]')) picker.open = false;
    refreshSceneInventoryPeople(overlay);
  }, { signal: state.lifetime.signal });
  overlay.addEventListener('keydown', event => {
    if (event.key === 'Escape' && state.pickers.close()) { event.preventDefault(); event.stopPropagation(); }
  }, { signal: state.lifetime.signal });
}

export function disposeSceneInventoryPeople(overlay) {
  const state = mounted.get(overlay);
  state?.lifetime.abort(); state?.pickers?.destroy(); mounted.delete(overlay);
}
