import { html, groupPortrait } from './group-landing-markup.js';
import { moneyState, moneyTotal } from '../item-register/item-register-money.js';
import { ALERIA_CURRENCY_DISPLAY } from '../currency/currency-art.js';
import { materializeInventoryItem } from '../item-definitions/item-definition-resolver.js';
import { inventoryCardModel } from '../character-inventory/character-inventory-card-model.js';
import { resolveEquipmentImage } from '../character-equipment/equipment-artwork.js';

function accountItemProjection(item) {
  const resolved = materializeInventoryItem(item);
  return { ...resolved, image: resolveEquipmentImage(resolved) };
}

export function groupAccountCurrencies() {
  return ALERIA_CURRENCY_DISPLAY;
}
export function groupAccountCurrencyArt(currency) {
  return currency.icon ? `<img src="${html(currency.icon)}" alt="" loading="lazy">`
    : `<span class="group-account-coin-text" aria-hidden="true">${html(currency.short)}</span>`;
}
export function renderGroupAccountMoney(inventory = {}) {
  const money = moneyState(moneyTotal(inventory.moneyState || inventory.money || {}));
  return `<div class="group-account-coins" aria-label="Gemeinsamer Geldbeutel">${groupAccountCurrencies().map(currency=>`<span>${groupAccountCurrencyArt(currency)}<strong>${html(money[currency.id] || 0)}</strong><small>${html(currency.label)}</small></span>`).join('')}</div>`;
}
export function groupAccountItemCard(item) {
  const resolved = accountItemProjection(item);
  if (typeof globalThis.buildInventoryCardContent === 'function') return globalThis.buildInventoryCardContent(resolved,{status:'Im gemeinsamen Vorrat'});
  const model = inventoryCardModel(resolved);
  return `<article class="group-account-card"><small>${html(model.label)}</small>${groupPortrait(resolved.image,resolved.name,'group-account-card-art')}<h3>${html(resolved.name)}</h3><p>${html(model.description)}</p><dl>${model.rows.map(row=>`<div><dt>${html(row.label)}</dt><dd>${html(row.value)}</dd></div>`).join('')}</dl>${model.actions.map(action=>`<p><strong>${html(action.name)}</strong> ${html(action.description)}</p>`).join('')}${model.effects.map(effect=>`<p><strong>${html(effect.label)}</strong> ${html(effect.value)}</p>`).join('')}</article>`;
}
export function renderGroupAccount(account, { preview = false, access, status = '', error = false, limit = 12, pending = false } = {}) {
  const inventory = account?.inventory || {items:[]}, items = inventory.items || [];
  const editorial = ['admin','moderator','editor'].includes(access?.role), withdraw = editorial || account?.managerUids?.includes(access?.uid);
  return `<header class="group-account-head"><div><span class="group-account-eyebrow">Was Euch gemeinsam gehört</span><h4>Reisekasse & Vorrat</h4></div>${!preview && access?.uid ? `<div class="group-account-actions"><button type="button" data-group-account-action="deposit">Etwas beisteuern</button>${withdraw ? '<button type="button" data-group-account-action="withdraw">Geld übergeben</button>' : ''}${editorial ? '<button type="button" data-group-account-action="grant">Vorrat ergänzen</button>' : ''}</div>` : ''}</header>
    ${renderGroupAccountMoney(inventory)}
    <div class="group-account-items">${items.slice(0,limit).map(item=>{const resolved=accountItemProjection(item),card=inventoryCardModel(resolved);return `<article><button type="button" class="group-account-item" data-group-account-action="card" data-group-account-item="${html(item.id)}">${groupPortrait(resolved.image,resolved.name,'group-account-item-art')}<span><strong>${html(resolved.name)}</strong><small>${html(card.label)} · ${html(resolved.quantity ?? 1)} im Vorrat</small></span><span aria-hidden="true">↗</span></button>${!preview && withdraw ? `<button type="button" class="group-account-give" data-group-account-action="give-item" data-group-account-item="${html(item.id)}">Weitergeben</button>` : ''}</article>`;}).join('') || '<p class="group-account-empty">Noch liegt nichts im gemeinsamen Vorrat. Was Ihr erhaltet oder beisteuert, wird hier verwahrt.</p>'}</div>
    ${items.length>limit ? `<button type="button" data-group-account-action="more">Weitere Gegenstände · ${items.length-limit}</button>` : ''}
    <p class="group-account-status${error ? ' is-error' : ''}" role="status">${html(preview ? 'Vorschau · Die gemeinsame Kasse öffnet sich mit der Gruppe.' : status)}</p>
    ${pending ? '<button type="button" data-group-account-action="retry">Offene Übergabe erneut prüfen</button>' : ''}
    ${(account?.receipts || []).some(row=>row.runId) ? `<details class="group-account-receipts"><summary>Erinnerungen an erhaltene Belohnungen</summary><ul>${account.receipts.filter(row=>row.runId).slice(-20).reverse().map(row=>`<li><a href="./quests.html?run=${encodeURIComponent(row.runId)}" target="_blank" rel="noopener">${html(row.title || 'Ein vollbrachtes Abenteuer')} ↗</a></li>`).join('')}</ul></details>` : ''}`;
}
