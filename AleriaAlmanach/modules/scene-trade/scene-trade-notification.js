import { escape, safeImage } from '../item-register/item-register-markup.js';
import { formatCopper } from '../item-register/item-register-money.js';
import { describeSceneTrade, sceneTradeAccountName } from './scene-trade-summary.js';

export function isSceneTradeComment(comment = {}) {
  return !!(comment.sceneTrade && Array.isArray(comment.sceneTrade.lines))
    || (comment.inventoryTransaction?.trade === true && !!comment.sceneInventoryTransfer)
    || comment.sceneInventoryTransfer?.presentation === 'compact';
}

function miniAvatar(person = {}) {
  const image = safeImage(person.portrait || person.image || '');
  return `<span class="scene-trade-mini-avatar" aria-hidden="true">${image
    ? `<img src="${escape(image)}" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer">`
    : escape(String(person.name || '?').trim().slice(0, 1).toLocaleUpperCase('de'))}</span>`;
}

function receiptLines(receipt) {
  return (Array.isArray(receipt.lines) ? receipt.lines : []).map(line => {
    const reference = Number.isSafeInteger(line.baselineTotalMinor) ? formatCopper(line.baselineTotalMinor / 100) : 'Preis offen';
    const assignment = line.direction === 'sell'
      ? `Verkäufer: ${sceneTradeAccountName(receipt, line.sellerKey)} · Gutschrift: ${sceneTradeAccountName(receipt, line.recipientKey || line.sellerKey)}`
      : `Zahlt: ${sceneTradeAccountName(receipt, line.payerKey)} · Erhält: ${sceneTradeAccountName(receipt, line.recipientKey)}`;
    return `<li><span>${escape(line.quantity)} × ${escape(line.name || 'Gegenstand')}</span><strong>${escape(formatCopper(Number(line.totalMinor || 0) / 100))}</strong>
      <small>${escape(assignment)}</small><small>${line.priceMode === 'agreed' ? 'Vereinbart' : 'Normalpreis'} · Richtwert: ${escape(reference)}</small></li>`;
  }).join('');
}

export function renderSceneTradeNotification(comment = {}, { lockMarkup = '' } = {}) {
  const receipt = comment.sceneTrade;
  const legacy = comment.sceneInventoryTransfer || {};
  // Old sales stored the same giver/receiver shape as purchases. Their saved
  // narration remains the source of direction; never infer it from those roles.
  const historicalTrade = comment.inventoryTransaction?.trade === true;
  const actor = receipt?.actor || (historicalTrade ? legacy.receiver : legacy.giver) || {};
  const merchant = receipt?.merchant || (historicalTrade ? legacy.giver : legacy.receiver) || {};
  const text = receipt ? describeSceneTrade(receipt) : String(comment.text || 'Handel abgeschlossen.');
  const content = receipt ? `<ul class="scene-trade-proof-lines">${receiptLines(receipt)}</ul>`
    : `<p>${escape(legacy.object?.name || 'Gegenstand')}${legacy.object?.kind === 'money' ? '' : ` · ${escape(legacy.object?.quantity || 1)} Stück`}${legacy.object?.totalCopper != null ? ` · ${escape(formatCopper(legacy.object.totalCopper))}` : ''}</p>${legacy.flavour ? `<p>${escape(legacy.flavour)}</p>` : ''}`;
  return `<article class="scene-trade-notice" data-comment-id="${escape(comment.id || '')}"><details>
    <summary><span class="scene-trade-mini-avatars">${miniAvatar(actor)}${miniAvatar(merchant)}</span><span class="scene-trade-notice-text">${escape(text)}</span><span class="scene-trade-notice-chevron" aria-hidden="true">⌄</span></summary>
    <div class="scene-trade-proof">${content}${receipt?.note ? `<p>${escape(receipt.note)}</p>` : ''}${lockMarkup}</div>
  </details></article>`;
}
