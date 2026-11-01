import { localizedNumber, parsePrice } from '../../../../AleriaAlmanach/modules/item-register/item-register-money.js';
import { ALERIA_CURRENCY_DISPLAY } from '../../../../AleriaAlmanach/modules/currency/currency-art.js';

export const NOTICE_COINS = Object.freeze(ALERIA_CURRENCY_DISPLAY.map(currency=>Object.freeze({
  id:currency.id,label:currency.label,code:currency.short,icon:currency.icon
})));

export function legacyNoticeRewards(text) {
  const match = String(text || '').trim().match(/^(\d[\d.,]*)\s*(Goldtaler|Silbertaler|Kupfertaler|Eisenpfennig|Pfennig|GT|ST|KT|Pf)\.?$/i);
  if (!match) return [];
  try { if (!parsePrice(`${match[1]} ${match[2]}`)) return []; }
  catch { return []; }
  const currency = NOTICE_COINS.find(coin => [coin.label, coin.code, coin.id === 'pfennig' ? 'Pfennig' : ''].some(value => value.toLowerCase() === match[2].toLowerCase()));
  return currency ? [{ kind: 'money', currency: currency.id, amount: localizedNumber(match[1]) }] : [];
}

export function rewardsOf(notice, fallback = '') {
  if (!Array.isArray(notice.rewards)) return legacyNoticeRewards(fallback);
  return notice.rewards.filter(reward => reward?.kind === 'money'
    ? NOTICE_COINS.some(coin => coin.id === reward.currency) && Number.isFinite(Number(reward.amount)) && Number(reward.amount) > 0
    : reward?.kind === 'honor' ? typeof reward.id === 'string' && !!reward.id && typeof reward.title === 'string' && !!reward.title.trim()
    : reward?.kind === 'item' && typeof reward.itemId === 'string' && reward.itemId && Number.isInteger(Number(reward.quantity)) && Number(reward.quantity) > 0);
}

export function rewardText(reward) {
  if (reward.kind === 'money') return `${Number(reward.amount).toLocaleString('de-DE', { maximumFractionDigits: 2 })} ${NOTICE_COINS.find(coin => coin.id === reward.currency)?.label || ''}`;
  if (reward.kind === 'honor') return reward.title;
  return `${reward.quantity}× ${reward.title || 'Gegenstand'}`;
}

export function rewardFromItem(item, quantity = 1) {
  return { kind: 'item', itemId: item.id, quantity, title: item.title, image: item.image || '',
    ...(item.definitionRef ? { definitionRef: { ...item.definitionRef } } : {}),
    ...(item.moduleId ? { moduleId: item.moduleId, sourceRevision: item.sourceRevision || '' } : {}),
    description: item.description || '', details: item.details || '', type: item.type || '', category: item.category || '' };
}
