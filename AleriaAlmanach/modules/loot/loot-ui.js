// Mini-Lootbox-Dialog: Items einer besiegten Kreatur wählen und einer Figur zuweisen.
function escapeMarkup(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function ensureLootDialog() {
  let overlay = document.getElementById('loot-overlay');
  if (overlay) return overlay;
  overlay = document.createElement('div');
  overlay.id = 'loot-overlay';
  overlay.className = 'scene-time-event-overlay loot-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-hidden', 'true');
  overlay.setAttribute('aria-labelledby', 'loot-dialog-title');
  overlay.innerHTML = `
    <div class="scene-time-event-card loot-card">
      <header class="loot-head">
        <span class="loot-head-portrait" data-loot-portrait></span>
        <div><small>Beute</small><h2 id="loot-dialog-title" data-loot-title>Beute durchsuchen</h2></div>
        <button type="button" data-loot-action="close" aria-label="Schließen">×</button>
      </header>
      <div class="loot-body">
        <div class="loot-items" data-loot-items></div>
        <label class="loot-receiver"><span>Wer nimmt sich die Beute?</span><select data-loot-receiver></select></label>
        <p class="loot-status" data-loot-status></p>
      </div>
      <footer><button type="button" data-loot-action="close">Abbrechen</button><button type="button" class="primary" data-loot-action="submit">Looten</button></footer>
    </div>`;
  document.body.appendChild(overlay);
  return overlay;
}

export function renderLootHead(actorName = '', actorPortrait = '') {
  const title = document.querySelector('[data-loot-title]');
  if (title) title.textContent = `Beute von ${actorName || 'einer besiegten Kreatur'}`;
  const portrait = document.querySelector('[data-loot-portrait]');
  if (portrait) portrait.innerHTML = actorPortrait ? `<img src="${escapeMarkup(actorPortrait)}" alt="">` : escapeMarkup((actorName || '?').slice(0, 1));
}

export function renderLootItems(items = []) {
  const host = document.querySelector('[data-loot-items]');
  if (!host) return;
  if (!items.length) {
    host.innerHTML = '<p class="loot-empty">Diese Kreatur hat keine hinterlegte Beute.</p>';
    return;
  }
  host.innerHTML = items.map(item => `<label class="loot-item">
    <input type="checkbox" data-loot-field="item" value="${escapeMarkup(item.id)}">
    <span class="loot-item-icon" aria-hidden="true">◆</span>
    <span class="loot-item-copy"><strong>${escapeMarkup(item.name)}</strong>${item.quantity > 1 ? `<small>${escapeMarkup(item.quantity)}×</small>` : ''}${item.notes ? `<small>${escapeMarkup(item.notes)}</small>` : ''}</span>
  </label>`).join('');
}

export function renderLootReceiverOptions(characters = []) {
  const select = document.querySelector('[data-loot-receiver]');
  if (!select) return;
  select.innerHTML = characters.length
    ? characters.map(character => `<option value="${escapeMarkup(character.id)}">${escapeMarkup(character.name)}</option>`).join('')
    : '<option value="">Keine gespeicherten Figuren verfügbar</option>';
}

export function getSelectedLootItemIds() {
  return [...document.querySelectorAll('[data-loot-field="item"]:checked')].map(input => input.value);
}

export function getSelectedLootReceiverId() {
  return document.querySelector('[data-loot-receiver]')?.value || '';
}

export function setLootStatus(message = '', type = 'info') {
  const target = document.querySelector('[data-loot-status]');
  if (!target) return;
  target.dataset.status = type;
  target.textContent = String(message || '');
}

export function setLootSubmitting(submitting) {
  const button = document.querySelector('[data-loot-action="submit"]');
  if (!button) return;
  button.disabled = !!submitting;
  button.textContent = submitting ? 'Wird gespeichert …' : 'Looten';
}

export const lootUiInternals = Object.freeze({ escapeMarkup });
