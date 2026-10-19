import { moneyState } from '../item-register/item-register-money.js';
export const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
export const numberText = (value, digits = 1) => new Intl.NumberFormat('de-DE', { maximumFractionDigits: digits }).format(value);
export const money = minor => `${new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(minor / 100)} KT`;
export function denominations(minor) {
  const m = moneyState(Math.abs(minor) / 100);
  return `${minor < 0 ? '−' : ''}${m.gold} Gold · ${m.silver} Silber · ${m.copper} Kupfer · ${m.pfennig} Pfennig`;
}
export const signedClass = value => value < 0 ? 'economy-negative' : 'economy-positive';
export const input = (name, label, value, { min = 0, max = 1e8, step = 0.01, suffix = '' } = {}) =>
  `<label class="economy-field"><span>${escape(label)}</span><span class="economy-input"><input type="number" data-economy-field="${escape(name)}" value="${value}" min="${min}" max="${max}" step="${step}" required>${suffix ? `<span>${escape(suffix)}</span>` : ''}</span></label>`;
export const table = (headers, rows, label) => `<div class="economy-table-scroll" tabindex="0" aria-label="${escape(label)}"><table><thead><tr>${headers.map(h => `<th scope="col">${escape(h)}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table></div>`;
export const info = text => `<p class="economy-note">${escape(text)}</p>`;
