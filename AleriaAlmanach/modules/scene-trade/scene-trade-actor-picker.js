import { escape as html, safeImage } from '../item-register/item-register-markup.js';
import { normalizeSceneTradeSearch } from './scene-trade-catalog.js';

export function renderSceneTradeActorAvatar(account) {
  const source = safeImage(account?.record?.portrait || account?.record?.image || account?.record?.symbol || '');
  return source ? `<img class="scene-trade-actor-avatar" src="${html(source)}" alt="" loading="lazy" decoding="async">`
    : `<span class="scene-trade-actor-avatar is-placeholder" aria-hidden="true">${html((account?.name || '?').slice(0, 1))}</span>`;
}
function selectedAccount(accounts, value, actor) {
  return accounts.find(account => actor ? account.kind === 'character' && account.id === value : account.key === value);
}
export function renderSceneTradeActorPicker({ accounts = [], selectedKey = '', label, field, lineId = '', debit = false, actor = false, disabled = false }) {
  const selected = selectedAccount(accounts, selectedKey, actor);
  return `<div class="scene-trade-actor-picker"><span class="scene-trade-actor-label">${html(label)}</span>
    <details data-trade-actor-picker data-picker-field="${html(field)}" data-picker-line="${html(lineId)}" data-picker-value="${html(selectedKey)}" data-picker-debit="${debit}" data-picker-actor="${actor}"${disabled ? ' data-picker-disabled="true"' : ''}>
      <summary class="scene-trade-actor-trigger" aria-label="${html(label)}: ${html(selected?.name || 'Figur wählen')}"${disabled ? ' aria-disabled="true" tabindex="-1"' : ''}>${renderSceneTradeActorAvatar(selected)}<span class="scene-trade-actor-name">${html(selected?.name || 'Figur wählen …')}</span><span aria-hidden="true">⌄</span></summary>
      <div class="scene-trade-actor-menu"><input class="scene-trade-actor-search" data-trade-picker-search type="search" placeholder="Name suchen …" aria-label="${html(label)} suchen" autocomplete="off"${disabled ? ' disabled' : ''}><div data-trade-actor-options role="listbox" aria-label="${html(label)}"></div></div>
    </details></div>`;
}

/** One delegated listener set; closed pickers contain no list of archive records. */
export function mountSceneTradeActorPickers(root, { getAccounts, canEdit, onSelect }) {
  const lifetime = new AbortController();
  const findPicker = target => target?.closest?.('[data-trade-actor-picker]');
  function renderOptions(picker, more = false) {
    const query = normalizeSceneTradeSearch(picker.querySelector('[data-trade-picker-search]').value);
    const records = getAccounts().filter(account => (!picker.dataset.pickerDebit || picker.dataset.pickerDebit !== 'true' || account.canDebit)
      && (picker.dataset.pickerActor !== 'true' || account.kind === 'character' && account.canDebit)
      && normalizeSceneTradeSearch(`${account.name} ${account.record.title || ''}`).includes(query));
    const limit = more ? Number(picker.dataset.pickerLimit || 12) + 12 : 12;
    picker.dataset.pickerLimit = String(limit);
    picker.querySelector('[data-trade-actor-options]').innerHTML = records.slice(0, limit).map(account => {
      const value = picker.dataset.pickerActor === 'true' ? account.id : account.key;
      return `<button type="button" class="scene-trade-actor-option" data-trade-picker-value="${html(value)}" role="option" aria-selected="${value === picker.dataset.pickerValue}"${account.definitionsReady === false ? ' disabled' : ''}>${renderSceneTradeActorAvatar(account)}<span class="scene-trade-actor-name">${html(account.name)}${account.definitionsReady === false ? '<small>Inventar wird vorbereitet …</small>' : account.kind === 'group' ? '<small>Gruppenkasse</small>' : ''}</span></button>`;
    }).join('') || '<p class="scene-trade-actor-hint">Keine passende Person. Unter „Personen“ kannst du die Auswahl ergänzen.</p>';
    if (records.length > limit) picker.querySelector('[data-trade-actor-options]').insertAdjacentHTML('beforeend', '<button type="button" class="scene-trade-actor-add" data-trade-picker-more>Weitere Personen zeigen</button>');
  }
  root.addEventListener('toggle', event => {
    const picker = event.target;
    if (!picker.matches?.('[data-trade-actor-picker]') || !picker.open) return;
    if (!canEdit() || picker.dataset.pickerDisabled) { picker.open = false; return; }
    for (const other of root.querySelectorAll('[data-trade-actor-picker][open]')) if (other !== picker) other.open = false;
    renderOptions(picker); picker.querySelector('[data-trade-picker-search]').focus({ preventScroll: true });
  }, { capture: true, signal: lifetime.signal });
  root.addEventListener('input', event => {
    if (event.target.matches?.('[data-trade-picker-search]') && canEdit()) renderOptions(findPicker(event.target));
  }, { signal: lifetime.signal });
  root.addEventListener('click', event => {
    const button = event.target.closest?.('[data-trade-picker-value], [data-trade-picker-more]');
    const picker = findPicker(button);
    if (!button || !picker || !canEdit()) return;
    event.preventDefault();
    if (button.hasAttribute('data-trade-picker-more')) return renderOptions(picker, true);
    onSelect({ field: picker.dataset.pickerField, lineId: picker.dataset.pickerLine, value: button.dataset.tradePickerValue });
  }, { signal: lifetime.signal });
  root.addEventListener('keydown', event => {
    const picker = findPicker(event.target); if (!picker?.open) return;
    const buttons = [...picker.querySelectorAll('[data-trade-picker-value]:not(:disabled)')], index = buttons.indexOf(event.target);
    if ((['ArrowDown', 'ArrowUp'].includes(event.key) || index >= 0 && ['Home', 'End'].includes(event.key)) && buttons.length) {
      event.preventDefault();
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1
        : event.key === 'ArrowDown' ? (index + 1) % buttons.length : (index - 1 + buttons.length) % buttons.length;
      buttons[next].focus({ preventScroll: true });
    }
  }, { signal: lifetime.signal });
  root.addEventListener('error', event => {
    if (!event.target.matches?.('img.scene-trade-actor-avatar')) return;
    const fallback = document.createElement('span'); fallback.className = 'scene-trade-actor-avatar is-placeholder'; fallback.setAttribute('aria-hidden', 'true');
    fallback.textContent = event.target.parentElement.querySelector('.scene-trade-actor-name')?.textContent?.trim().slice(0, 1) || '?';
    event.target.replaceWith(fallback);
  }, { capture: true, signal: lifetime.signal });
  return {
    close() { const picker = root.querySelector('[data-trade-actor-picker][open]'); if (!picker) return false; picker.open = false; picker.querySelector('summary').focus(); return true; },
    destroy: () => lifetime.abort()
  };
}
