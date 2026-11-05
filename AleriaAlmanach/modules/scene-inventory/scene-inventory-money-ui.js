import { SCENE_MONEY_UNITS, sceneMoneyMinor, sceneMoneyAmountMinor, sceneMoneyBreakdown, previewSceneMoneyTransfer } from './scene-inventory-money.js';
import { escape as html } from '../item-register/item-register-markup.js';

const mounted = new WeakMap();
const number = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 5 });

export function formatSceneInventoryMoney(minor) {
  const wallet = sceneMoneyBreakdown(minor);
  return SCENE_MONEY_UNITS.filter(unit => wallet[unit.id]).map(unit => `${number.format(wallet[unit.id])} ${unit.label}`).join(' · ') || '0 Eisenpfennig';
}

function moneyPreviewState(giver, receiver, input) {
  if (!giver) return { valid: false, markup: '<p class="scene-money-empty">Wähle eine Figur und einen Betrag.</p>' };
  let before;
  try {
    before = sceneMoneyMinor(giver.inventory?.moneyState || giver.inventory?.money || {});
    const preview = previewSceneMoneyTransfer(giver, receiver, input);
    const equivalents = SCENE_MONEY_UNITS.map(unit => `<div><dt>${html(unit.label)}</dt><dd>${number.format(preview.amountMinor / unit.minorValue)}</dd></div>`).join('');
    return { valid: true, markup: `<div class="scene-money-balance"><span>Verfügbar bei ${html(giver.name || 'der Figur')}</span><strong>${html(formatSceneInventoryMoney(preview.giverBeforeMinor))}</strong></div>
      <dl class="scene-money-equivalents" aria-label="Gegenwert des Betrags">${equivalents}</dl>
      <div class="scene-money-calculation" aria-label="Verbleibender Geldbestand"><span>${html(formatSceneInventoryMoney(preview.giverBeforeMinor))}</span><b aria-hidden="true">−</b><span>${html(formatSceneInventoryMoney(preview.amountMinor))}</span><b aria-hidden="true">=</b><strong>${html(formatSceneInventoryMoney(preview.giverAfterMinor))}</strong></div>
      <p class="scene-money-change">Münzen werden automatisch gewechselt. Übrig: <strong>${html(formatSceneInventoryMoney(preview.giverAfterMinor))}</strong></p>
      ${preview.targetKind === 'character' ? `<p class="scene-money-recipient">${html(receiver?.name || 'Empfänger')}: ${html(formatSceneInventoryMoney(preview.receiverBeforeMinor))} → <strong>${html(formatSceneInventoryMoney(preview.receiverAfterMinor))}</strong></p>` : '<p class="scene-money-recipient">Ausgeben · Bank: Der Betrag wird aus dem Inventar ausgebucht.</p>'}` };
  } catch (error) {
    return { valid: false, markup: `${before == null ? '' : `<div class="scene-money-balance"><span>Verfügbar bei ${html(giver.name || 'der Figur')}</span><strong>${html(formatSceneInventoryMoney(before))}</strong></div>`}<p class="scene-money-preview-error" role="status">${html(error.message || 'Bitte den Betrag prüfen.')}</p>` };
  }
}

export function renderSceneInventoryMoneyPreview(giver, receiver, input) {
  return moneyPreviewState(giver, receiver, input).markup;
}

export function refreshSceneInventoryMoneyPreview(overlay, { giver, receiver } = {}) {
  const target = overlay.querySelector('[data-scene-money-preview]');
  if (!target || overlay.querySelector('#scene-transfer-kind')?.value !== 'money') return;
  const input = { currency: overlay.querySelector('#scene-transfer-currency')?.value || 'copper',
    quantity: overlay.querySelector('#scene-transfer-money-amount')?.value,
    targetKind: overlay.querySelector('#scene-transfer-money-mode')?.value || 'character' };
  for (const button of overlay.querySelectorAll('[data-scene-money-target]')) button.setAttribute('aria-pressed', String(button.dataset.sceneMoneyTarget === input.targetKind));
  const pending = overlay.dataset.sceneMoneyPending === 'true', submitting = overlay.dataset.sceneMoneySubmitting === 'true';
  const preview = pending
    ? { valid: true, markup: `<p class="scene-money-pending" role="status">Offene Buchung über <strong>${html(formatSceneInventoryMoney(sceneMoneyAmountMinor(input)))}</strong>. ${submitting ? 'Wird unverändert gespeichert …' : 'Unverändert erneut prüfen.'}</p>` }
    : moneyPreviewState(giver, input.targetKind === 'sink' ? null : receiver, input);
  if (target.innerHTML !== preview.markup) target.innerHTML = preview.markup;
  const submit = overlay.querySelector('[data-scene-inventory-action="submit"]');
  if (pending || submitting) {
    if (submit) { submit.disabled = submitting; submit.textContent = submitting ? 'Wird gespeichert …' : 'Offene Buchung prüfen'; }
  } else if (submit) submit.disabled = overlay.dataset.sceneInventoryLocked === 'true' || !preview.valid;
}

export function mountSceneInventoryMoneyControls(overlay) {
  disposeSceneInventoryMoneyControls(overlay);
  const lifetime = new AbortController(); mounted.set(overlay, lifetime);
  overlay.addEventListener('click', event => {
    const button = event.target.closest?.('[data-scene-money-amount], [data-scene-money-target]');
    if (!button || !overlay.contains(button) || overlay.dataset.sceneInventoryLocked === 'true') return;
    event.preventDefault();
    if (button.dataset.sceneMoneyTarget) {
      const input = overlay.querySelector('#scene-transfer-money-mode');
      input.value = button.dataset.sceneMoneyTarget;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    } else {
      const input = overlay.querySelector('#scene-transfer-money-amount');
      input.value = button.dataset.sceneMoneyAmount;
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }, { signal: lifetime.signal });
}

export function disposeSceneInventoryMoneyControls(overlay) {
  mounted.get(overlay)?.abort(); mounted.delete(overlay);
}
