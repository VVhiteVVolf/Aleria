import { escape as html, safeImage } from '../item-register/item-register-markup.js';
import { formatCopper } from '../item-register/item-register-money.js';
import { sceneTradeAccounts, lineTotalMinor, sceneTradeSummary, isUniqueTradeItem, availableTradeProduct, sceneTradeGroupAvailability } from './scene-trade-state.js';
import { materializeInventoryItem } from '../item-definitions/item-definition-resolver.js';
import { isInventoryPlaceholder } from '../character-inventory/inventory-placeholders.js';
import { querySceneTradeCatalog, findSceneTradeProduct } from './scene-trade-catalog.js';
import { renderSceneTradeActorPicker } from './scene-trade-actor-picker.js';

const money = minor => formatCopper((minor || 0) / 100);
const button = (action, label, attrs = '') => `<button type="button" data-trade-action="${action}" ${attrs}>${label}</button>`;
function image(source, title) {
  const path = safeImage(source);
  return `<span class="scene-trade-art" aria-hidden="true">${path ? `<img src="${html(path)}" alt="" loading="lazy">` : html(String(title || '◇').slice(0, 1))}</span>`;
}
function accountLabel(accounts, key) { return accounts.find(account => account.key === key)?.name || 'Nicht verfügbar'; }
function actorPicker(accounts, selectedKey, label, field, options = {}) {
  return renderSceneTradeActorPicker({ accounts, selectedKey, label, field, ...options });
}
function productRow(product, state) {
  const unique = isUniqueTradeItem(product);
  const inCart = unique && state.lines.some(line => line.direction === 'buy' && line.productId === product.id);
  const unavailable = !availableTradeProduct(product);
  const status = { checking: 'Verfügbarkeit wird geprüft …', unknown: 'Verfügbarkeit unbestätigt', owned: 'Bereits vergeben', sold: 'Beim Händler verwahrt' }[product.availabilityStatus]
    || (unavailable ? 'Derzeit nicht verfügbar' : inCart ? 'In der Bestellung' : unique ? 'Einzelstück' : '');
  return `<article class="scene-trade-product${unavailable ? ' is-unavailable' : ''}">
    ${image(product.image, product.title)}<div class="scene-trade-product-copy"><strong>${html(product.title)}</strong>
    <span class="scene-trade-product-meta"><span class="scene-trade-product-price">${product.priceRange ? `Ab ${money(Math.round(product.priceRange.minCopper * 100))}` : 'Preis nach Vereinbarung'}</span>${status ? `<small class="scene-trade-badge">${html(status)}</small>` : ''}</span>
    ${product.hiddenMeta?.unit ? `<small class="scene-trade-product-unit">${html(product.hiddenMeta.unit)}</small>` : ''}</div>
    ${button('add-buy', '+', `class="scene-trade-add" data-product-id="${html(product.id)}" aria-label="${html(product.title)} zur Bestellung hinzufügen" ${inCart || unavailable ? 'disabled' : ''}`)}</article>`;
}
function sellRow(item, account, state) {
  const resolved = materializeInventoryItem(item);
  const included = state.lines.some(line => line.direction === 'sell' && line.sellerKey === account.key && line.itemId === item.id);
  const equipped = item.equipped || ['weapons', 'armorItems'].some(key => account.record.combatProfile?.[key]?.some(row => row.inventoryItemId === item.id && row.equipped));
  const name = resolved.name || resolved.title || 'Gegenstand';
  return `<article class="scene-trade-product">${image(resolved.image, name)}<div class="scene-trade-product-copy"><strong>${html(name)}</strong>
    <small>${html(item.quantity ?? 1)} im Besitz${isUniqueTradeItem(resolved) ? ' · Einzelstück' : ''}</small>
    <small>${equipped ? 'Zum Verkaufen zuerst ablegen' : included ? 'In deiner Bestellung' : 'Preis in der Bestellung festlegen'}</small></div>
    ${button('add-sell', '+', `class="scene-trade-add" data-item-id="${html(item.id)}" aria-label="${html(name)} verkaufen" ${included || equipped ? 'disabled' : ''}`)}</article>`;
}
function soldRow(record) {
  const item = materializeInventoryItem(record.itemSnapshot || record.item || record);
  const total = record.totalMinor ?? (record.totalCopper == null ? null : Math.round(record.totalCopper * 100));
  return `<article class="scene-trade-product is-readonly">${image(item.image, item.name || item.title)}<div class="scene-trade-product-copy">
    <strong>${html(item.name || item.title || 'Gegenstand')}</strong><small>${html(record.quantity ?? item.quantity ?? 1)} ×${record.sellerName || record.seller?.name ? ` · von ${html(record.sellerName || record.seller.name)}` : ''}</small>
    <small>${total == null ? 'Beim Händler verwahrt' : `Verkauft für ${money(total)}`}</small></div></article>`;
}

/** Only this region changes while typing. Pickers, cart and focus stay mounted. */
export function renderSceneTradeCatalogResults({ state, data, accounts, sold = [], soldLoading = false, soldNextCursor = null }) {
  if (state.mode === 'sold') return `${soldLoading && !sold.length ? '<p class="scene-trade-empty" role="status">Verkäufe werden geladen …</p>'
    : sold.length ? `<div class="scene-trade-product-list">${sold.map(soldRow).join('')}</div>` : '<p class="scene-trade-empty">Bei diesem Händler liegt noch kein Verkauf vor.</p>'}
    ${soldNextCursor ? button('more-sold', soldLoading ? 'Verkäufe werden geladen …' : 'Weitere Verkäufe laden', `class="scene-trade-more" ${soldLoading ? 'disabled' : ''}`) : ''}`;
  if (state.mode === 'sell') {
    const account = (accounts || sceneTradeAccounts(data)).find(account => account.key === state.sellerKey), query = state.search.trim().toLocaleLowerCase('de');
    if (account?.definitionsReady === false) return '<p class="scene-trade-empty" role="status">Das gewählte Inventar wird vorbereitet …</p>';
    const items = (account?.record.inventory?.items || []).filter(item => !isInventoryPlaceholder(item) && Number(item.quantity ?? 1) > 0 && String(item.name || '').toLocaleLowerCase('de').includes(query));
    const offset = state.offset || 0, page = items.slice(offset, offset + state.limit);
    return `<p class="scene-trade-result-count">${resultRange(offset, page.length, items.length)} Gegenstände</p><div class="scene-trade-product-list">${page.map(item => sellRow(item, account, state)).join('')
      || '<p class="scene-trade-empty">Keine passenden Gegenstände im gewählten Inventar.</p>'}</div>${pagination(offset, page.length, items.length, 'Weitere Gegenstände')}`;
  }
  const result = querySceneTradeCatalog(data, { merchantId: state.merchantId, search: state.search, limit: state.limit, offset: state.offset || 0 });
  return `<p class="scene-trade-result-count">${resultRange(result.offset, result.items.length, result.total)} ${result.total === 1 ? 'Ware' : 'Waren'}</p><div class="scene-trade-product-list">${result.items.map(product => productRow(product, state)).join('')
    || '<p class="scene-trade-empty">Keine passenden Waren in diesem Sortiment.</p>'}</div>${pagination(result.offset, result.items.length, result.total, 'Weitere Waren')}`;
}
function resultRange(offset, count, total) { return count ? `${offset + 1}–${offset + count} von ${total}` : `0 von ${total}`; }
function pagination(offset, count, total, label) {
  return offset || offset + count < total ? `<nav class="scene-trade-pagination" aria-label="Warenseiten">${offset ? button('catalog-back', 'Zurück', 'class="scene-trade-more"') : ''}${offset + count < total ? button('more', label, 'class="scene-trade-more"') : ''}</nav>` : '';
}
function search(state) {
  return `<label class="scene-trade-search"><span class="scene-trade-sr-only">Waren suchen</span><input type="search" data-trade-field="search" placeholder="${state.mode === 'sell' ? 'Im Inventar suchen …' : 'Waren suchen …'}" value="${html(state.search)}"></label>`;
}
function catalog(state, data, accounts, selectableAccounts, sold, soldLoading, soldNextCursor) {
  let controls = '';
  if (state.mode === 'buy') controls = `<div class="scene-trade-defaults">
    ${actorPicker(selectableAccounts, state.payerKey, 'Bezahlt neue Waren', 'payerKey', { debit: true })}
    ${actorPicker(selectableAccounts, state.recipientKey, 'Erhält neue Waren', 'recipientKey')}</div>
    <div class="scene-trade-default-actions">${button('self-pay', 'Empfänger zahlt selbst', 'class="scene-trade-text-button"')}</div>${search(state)}`;
  if (state.mode === 'sell') controls = `${actorPicker(selectableAccounts, state.sellerKey, 'Aus welchem Inventar?', 'sellerKey', { debit: true })}${search(state)}
    <p class="scene-trade-hint">Der Erlös geht an den bisherigen Besitzer.</p>`;
  return `<div class="scene-trade-panel-heading"><h3>${state.mode === 'sold' ? 'Verkauftablage' : state.mode === 'sell' ? 'Dein Inventar' : 'Sortiment'}</h3></div>
    ${state.mode === 'sold' ? '<p class="scene-trade-hint">Verkaufte Gegenstände bleiben beim Händler verwahrt.</p>' : controls}
    <div class="scene-trade-catalog-results" data-trade-catalog-results>${renderSceneTradeCatalogResults({ state, data, accounts, sold, soldLoading, soldNextCursor })}</div>`;
}
function lineAssignment(line, accounts) {
  return line.direction === 'buy'
    ? `<span><span class="scene-trade-assignment-label">Zahlt</span> ${html(accountLabel(accounts, line.payerKey))}</span><span><span class="scene-trade-assignment-label">Erhält</span> ${html(accountLabel(accounts, line.recipientKey))}${line.payerKey !== line.recipientKey ? ' · Geschenk' : ''}</span>`
    : `<span><span class="scene-trade-assignment-label">Verkauft</span> ${html(accountLabel(accounts, line.sellerKey))}</span><span>Erlös an denselben Besitzer</span>`;
}
function lineEditor(line, state, selectableAccounts) {
  return `<details class="scene-trade-line-details" data-trade-detail="${html(line.id)}" ${state.openLine === line.id ? 'open' : ''}><summary>Preis & Zuordnung ändern</summary><div class="scene-trade-edit">
    <label class="scene-trade-full">Preisart<select data-line-id="${html(line.id)}" data-line-field="priceMode"><option value="standard" ${line.priceMode === 'standard' ? 'selected' : ''} ${line.referenceUnitMinor == null ? 'disabled' : ''}>Normalpreis</option><option value="agreed" ${line.priceMode === 'agreed' ? 'selected' : ''}>Im Rollenspiel vereinbart</option></select></label>
    ${line.priceMode === 'agreed' ? `<label class="scene-trade-full">Vereinbarter Positionspreis (KT)<input type="number" min="0" step="0.01" value="${line.agreedTotalMinor == null ? '' : line.agreedTotalMinor / 100}" data-line-id="${html(line.id)}" data-line-field="agreedTotalMinor"></label>` : ''}
    <p class="scene-trade-hint scene-trade-full">${line.referenceUnitMinor == null ? 'Kein Normalpreis vorhanden. Bitte den vereinbarten Positionspreis eintragen.' : `Normal: ${line.quantity} × ${money(line.referenceUnitMinor)} = ${money(line.quantity * line.referenceUnitMinor)}`}</p>
    ${line.direction === 'buy' ? `${actorPicker(selectableAccounts, line.payerKey, 'Zahler', 'payerKey', { lineId: line.id, debit: true })}${actorPicker(selectableAccounts, line.recipientKey, 'Empfänger', 'recipientKey', { lineId: line.id })}` : ''}
    ${line.priceNeedsReview ? button('confirm-price', 'Preis für diese Menge bestätigen', `data-line-id="${html(line.id)}" class="scene-trade-full"`) : ''}</div></details>`;
}
function lineRow(line, state, accounts, selectableAccounts, readonly) {
  const amount = lineTotalMinor(line);
  return `<article class="scene-trade-line"><div class="scene-trade-line-main">${image(line.image, line.title)}
    <div class="scene-trade-line-title"><strong>${html(line.title)}</strong><small>${line.direction === 'buy' ? 'Kauf' : 'Verkauf'}${line.unique ? ' · Einzelstück' : ''}</small></div>
    <label class="scene-trade-quantity"><span>Menge</span><input type="number" aria-label="Menge für ${html(line.title)}" min="1" max="${line.maxQuantity}" step="1" value="${line.quantity}" data-line-id="${html(line.id)}" data-line-field="quantity" ${readonly || line.unique ? 'disabled' : ''}></label>
    <div class="scene-trade-line-price"><strong>${amount == null ? 'Preis offen' : money(amount)}</strong><small>${line.priceMode === 'agreed' ? 'Vereinbart' : 'Normalpreis'}</small></div>
    ${readonly ? '' : button('remove', '×', `class="scene-trade-remove" data-line-id="${html(line.id)}" aria-label="${html(line.title)} aus Bestellung entfernen"`)}</div>
    <div class="scene-trade-assignment">${lineAssignment(line, accounts)}</div>
    ${line.priceNeedsReview ? '<p class="scene-trade-error">Menge geändert. Bitte den vereinbarten Preis erneut bestätigen.</p>' : ''}
    ${readonly ? '' : lineEditor(line, state, selectableAccounts)}</article>`;
}
function totals(summary) {
  return `<div class="scene-trade-totals"><div class="scene-trade-money-row"><span>Einkauf</span><strong>${money(summary.buys)}</strong></div>
    ${summary.sells ? `<div class="scene-trade-money-row"><span>Verkaufserlös</span><strong>${money(summary.sells)}</strong></div>` : ''}
    ${summary.rows.map(account => `<div class="scene-trade-balance"><div class="scene-trade-money-row"><strong>${html(account.name)}</strong><span>${account.pays ? `zahlt ${money(account.pays)}` : ''}${account.pays && account.receives ? ' · ' : ''}${account.receives ? `erhält ${money(account.receives)}` : ''}${!account.pays && !account.receives ? 'erhält Waren' : ''}</span></div><small>Geld: ${money(account.minor)} → ${money(account.minor - account.pays + account.receives)}</small></div>`).join('')}</div>`;
}
function pendingContent(state, data, accounts, request, header, busy) {
  const merchant = data.providers.find(provider => provider.id === request.merchantId)?.title || 'dem gewählten Händler';
  const rows = request.lines.map(line => {
    const product = findSceneTradeProduct(data, line.productId, request.merchantId);
    const item = accounts.find(account => account.key === line.sellerKey)?.record.inventory?.items?.find(item => item.id === line.itemId);
    return `<li>${html(line.direction === 'sell' ? 'Verkauf' : 'Kauf')} · ${html(line.quantity)} × ${html(product?.title || item?.name || 'Gegenstand')}${line.priceMode === 'agreed' ? ` · vereinbart ${money(line.agreedTotalMinor)}` : ' · zum ursprünglichen Normalpreis'}</li>`;
  }).join('');
  return `<div class="scene-trade-card">${header}<section class="scene-trade-loading"><h3>Offener Handel</h3><p>Der Auftrag bei ${html(merchant)} wird unverändert erneut geprüft. Dabei wird derselbe Handel bestätigt.</p><ul>${rows}</ul></section>
    <p class="scene-trade-status is-error" role="status">${html(state.status)}</p><footer class="scene-trade-footer">${button('retry', busy ? 'Wird bestätigt …' : 'Offenen Handel erneut prüfen', `class="scene-trade-primary" ${busy ? 'disabled' : ''}`)}</footer></div>`;
}
export function renderSceneTradeDialog({ state, data, accounts: givenAccounts, selectableAccounts: givenSelectableAccounts, summary: givenSummary,
  loading = false, busy = false, pending = false, pendingRequest = null, sold = [], soldLoading = false, soldNextCursor = null }) {
  const accounts = givenAccounts || (loading ? [] : sceneTradeAccounts(data)), selectableAccounts = givenSelectableAccounts || accounts;
  const summary = givenSummary || (loading ? { rows: [], buys: 0, sells: 0, errors: [] } : sceneTradeSummary(state, data, accounts)), review = state.stage === 'review', disabled = busy || pending;
  const providerOptions = data.providers.map(provider => `<option value="${html(provider.id)}" ${provider.id === state.merchantId ? 'selected' : ''}>${html(provider.title)}</option>`).join('');
  const unavailableGroups = sceneTradeGroupAvailability(data).filter(group => !group.eligible);
  const groupHint = unavailableGroups.length ? `<details class="scene-trade-group-hint"><summary>Nicht verfügbare Gruppenkassen (${unavailableGroups.length})</summary>${unavailableGroups.map(group => `<p class="scene-trade-hint">${html(group.record.name || group.record.id)}: ${html(group.reason)}</p>`).join('')}</details>` : '';
  const header = `<header class="scene-trade-header"><div><span class="scene-trade-kicker">Inventar · Handel</span><h2 id="scene-trade-title">${review ? 'Bestellung prüfen' : 'Einkaufen & verkaufen'}</h2></div><div class="scene-trade-header-actions">${button('refresh', '↻', `aria-label="Bestände neu laden" ${loading || disabled ? 'disabled' : ''}`)}${button('close', '×', 'aria-label="Handelsfenster schließen"')}</div></header>`;
  if (pendingRequest) return pendingContent(state, data, accounts, pendingRequest, header, busy);
  const context = `<div class="scene-trade-context"><label class="scene-trade-merchant">Händler<select data-trade-field="merchantId" ${state.lines.length || review ? 'disabled' : ''}><option value="">Händler wählen …</option>${providerOptions}</select></label>
    ${actorPicker(selectableAccounts, state.actorCharacterId, 'Bestellt durch', 'actorCharacterId', { actor: true, debit: true, disabled: review })}
    <div class="scene-trade-participants" data-trade-participant-manager></div>${groupHint}</div>`;
  const tabs = review ? '' : `<nav class="scene-trade-tabs" aria-label="Handelsbereich">${[['buy', 'Kaufen'], ['sell', 'Verkaufen'], ['sold', 'Verkauftablage']].map(([mode, label]) => button('mode', label, `data-mode="${mode}" aria-pressed="${state.mode === mode}"`)).join('')}</nav>
    <div class="scene-trade-mobile-nav">${button('mobile', 'Waren', `data-view="catalog" aria-pressed="${state.mobile === 'catalog'}"`)}${button('mobile', `Bestellung (${state.lines.length})`, `data-view="cart" aria-pressed="${state.mobile === 'cart'}"`)}</div>`;
  const cart = `<section class="scene-trade-cart" aria-label="Bestellung"><div class="scene-trade-cart-heading"><h3>Bestellung</h3><span>${state.lines.length} ${state.lines.length === 1 ? 'Position' : 'Positionen'}</span></div>
    <div class="scene-trade-cart-scroll" data-trade-cart-scroll>${state.lines.map(line => lineRow(line, state, accounts, selectableAccounts, review)).join('') || '<p class="scene-trade-empty">Wähle Waren oder Gegenstände aus. Hier behältst du Menge, Preis und Empfänger im Blick.</p>'}
    ${!review && state.lines.length ? button('clear', 'Bestellung leeren', 'class="scene-trade-text-button"') : ''}${state.lines.length ? totals(summary) : ''}
    ${state.lines.length ? summary.errors.map(message => `<p class="scene-trade-error">${html(message)}</p>`).join('') : ''}</div></section>`;
  const content = state.merchantId ? `${tabs}<div class="scene-trade-layout${review ? ' is-review' : ''}" data-mobile-view="${state.mobile}">
    ${review ? '' : `<section class="scene-trade-catalog" aria-label="Händler und Waren">${catalog(state, data, accounts, selectableAccounts, sold, soldLoading, soldNextCursor)}</section>`}${cart}</div>`
    : '<p class="scene-trade-empty">Wähle einen Händler aus, um sein Sortiment zu sehen.</p>';
  const action = pending ? button('retry', busy ? 'Wird bestätigt …' : 'Offenen Handel erneut prüfen', `class="scene-trade-primary" ${busy ? 'disabled' : ''}`)
    : review ? `${button('back', 'Zurück')}${button('checkout', busy ? 'Wird bestätigt …' : 'Handel abschließen', `class="scene-trade-primary" ${busy || summary.errors.length ? 'disabled' : ''}`)}`
    : button('review', 'Bestellung prüfen', `class="scene-trade-primary" ${loading || !state.merchantId || summary.errors.length ? 'disabled' : ''}`);
  return `<div class="scene-trade-card" lang="de">${header}${loading ? '<div class="scene-trade-loading" role="status">Das Handelsregister wird aufgeschlagen …</div>'
    : `<fieldset class="scene-trade-fields" ${disabled ? 'disabled' : ''}><legend class="scene-trade-sr-only">Handelsauftrag</legend>${context}${content}</fieldset>`}
    <p class="scene-trade-status${state.error ? ' is-error' : ''}" role="status">${html(state.status)}</p><footer class="scene-trade-footer"><span>${state.lines.length} ${state.lines.length === 1 ? 'Position' : 'Positionen'} · Einkauf ${money(summary.buys)}${summary.sells ? ` · Erlös ${money(summary.sells)}` : ''}</span>${action}</footer></div>`;
}
