import { escape as html, safeImage } from '../item-register/item-register-markup.js';
import { moneyState } from '../item-register/item-register-money.js';
import { renderSceneTradeActorPicker } from '../scene-trade/scene-trade-actor-picker.js';

function money(minor) {
  const wallet = moneyState(minor / 100);
  const units = [['gold', 'Gold'], ['silver', 'Silber'], ['copper', 'Kupfer'], ['pfennig', 'Eisenpfennig']];
  return units.filter(([key]) => wallet[key] > 0).map(([key, label]) => `${wallet[key].toLocaleString('de-DE')} ${label}`).join(', ') || '0 Kupfer';
}
export function renderCatalogPurchaseSummary(preview, { busy = false, pending = false, ready = false, completed = null } = {}) {
  const errors = preview?.errors || [];
  const total = completed?.totalMinor ?? preview?.totalMinor;
  const balance = preview?.payer?.minor;
  const valid = !pending && Number.isSafeInteger(total) && Number.isSafeInteger(balance);
  const nextPurchase = !completed && preview?.product?.available !== false;
  return `<div class="catalog-purchase-totals">
    <div><span>${completed ? 'Abgebucht' : 'Kaufpreis'}</span><strong>${Number.isSafeInteger(total) ? html(money(total)) : 'Preis nicht verfügbar'}</strong></div>
    ${valid ? `<div><span>Geldbeutel jetzt</span><strong>${html(money(balance))}</strong></div>` : ''}
    ${valid && nextPurchase ? `<div><span>Geldbeutel nach dem Kauf</span><strong>${balance >= total ? html(money(balance - total)) : 'Nicht genug Geld'}</strong></div>` : ''}
    <p>Münzen werden automatisch gewechselt; der Restbetrag bleibt im Geldbeutel.</p>
    ${errors.length && ready && !pending && !completed ? `<p class="catalog-purchase-hint">${html(errors[0])}</p>` : ''}
  </div>
  <button type="button" class="catalog-purchase-confirm" data-action="confirm-catalog-purchase"${busy || pending || !ready || errors.length ? ' disabled' : ''}>${busy ? 'Kauf wird geprüft …' : completed ? 'Noch einmal kaufen' : 'Jetzt kaufen'}</button>`;
}

export function renderCatalogPurchaseDialog({ data, selection, products = [], accounts = [], preview, busy, pending, ready, status = '', error = false, completed = null }) {
  const product = products.find(item => item.id === selection.productId);
  const image = safeImage(product?.image);
  const group = selection.payerKey?.startsWith('group:');
  const picker = (label, field, selectedKey, actor = false) => renderSceneTradeActorPicker({ accounts, label, field,
    selectedKey, actor, debit: !actor, disabled: busy || !!pending });
  return `<header class="catalog-purchase-header"><div><p>Schnellkauf</p><h2 id="catalog-purchase-title">${html(product?.title || 'Ware kaufen')}</h2></div>
    <button type="button" data-action="close-catalog-purchase" aria-label="Schnellkauf schließen">×</button></header>
    <div class="catalog-purchase-content">
      <div class="catalog-purchase-product">${image ? `<img src="${html(image)}" alt="" decoding="async">` : ''}<div><strong>${html(product?.title || '')}</strong><span>${html(data?.moduleTitle || 'Güterregister')}</span></div></div>
      ${products.length > 1 ? `<label class="catalog-purchase-field">Ausführung / Verkaufsgröße<select data-catalog-field="productId"${busy || pending ? ' disabled' : ''}>${products.map(item => `<option value="${html(item.id)}"${item.id === selection.productId ? ' selected' : ''}>${html(item.hiddenMeta?.unit || item.title)}</option>`).join('')}</select></label>` : ''}
      <div class="catalog-purchase-people">
        ${picker('Wer kauft? · Figur oder Gruppenkasse', 'payerKey', selection.payerKey)}
      </div>
      ${group ? `<div class="catalog-purchase-operator">${picker('Für die Gruppe bestellt', 'actorCharacterId', selection.actorCharacterId, true)}</div>` : ''}
      <div class="catalog-purchase-destination">
        <label class="catalog-purchase-gift"><input type="checkbox" data-catalog-field="buyForOther"${selection.buyForOther ? ' checked' : ''}${busy || pending ? ' disabled' : ''}>Für eine andere Figur kaufen</label>
        ${selection.buyForOther ? picker('Diese Figur erhält die Ware', 'recipientId', selection.recipientKey?.replace(/^character:/, '') || '', true) : ''}
        <p data-role="catalog-purchase-destination">${preview?.recipient ? `Die Ware erhält <strong>${html(preview.recipient.name)}</strong>.` : selection.buyForOther ? 'Wähle die Figur, für die du einkaufst.' : 'Die kaufende Figur erhält die Ware automatisch.'}</p>
      </div>
      <label class="catalog-purchase-field catalog-purchase-quantity">Menge<input data-catalog-field="quantity" type="number" inputmode="numeric" min="1" max="${product?.definitionKind === 'unique' ? 1 : 9999}" step="1" value="${html(selection.quantity)}"${busy || pending || product?.definitionKind === 'unique' ? ' disabled' : ''}></label>
      <div data-catalog-purchase-summary>${renderCatalogPurchaseSummary(preview, { busy, pending: !!pending, ready, completed })}</div>
      ${pending ? '<div class="catalog-purchase-pending"><p>Das Ergebnis dieses Kaufs ist noch offen. Erneutes Prüfen verwendet denselben Auftrag und bucht keinen zweiten Kauf.</p><button type="button" data-action="retry-catalog-purchase"'+(busy ? ' disabled' : '')+'>Ergebnis erneut prüfen</button></div>' : ''}
      <p class="catalog-purchase-status${error ? ' is-error' : ''}" role="status" aria-live="polite">${html(status)}</p>
      ${error && !pending ? '<button type="button" data-action="refresh-catalog-purchase">Daten neu laden</button>' : ''}
    </div>`;
}

export function renderCatalogPurchaseLoading(message = 'Sortiment und Figuren werden geladen …') {
  return `<header class="catalog-purchase-header"><h2 id="catalog-purchase-title">Schnellkauf</h2><button type="button" data-action="close-catalog-purchase" aria-label="Schnellkauf schließen">×</button></header><p class="catalog-purchase-loading" role="status">${html(message)}</p>`;
}
