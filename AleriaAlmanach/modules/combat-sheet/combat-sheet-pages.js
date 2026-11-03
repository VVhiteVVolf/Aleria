export const COMBAT_SHEET_PAGES = Object.freeze([
  { id: 'overview', label: 'Übersicht', symbol: '◈' },
  { id: 'arsenal', label: 'Waffen & Techniken', symbol: '⚔' },
  { id: 'traits', label: 'Eigenschaften', symbol: '✦' },
  { id: 'magic', label: 'Magie & Aura', symbol: '☾' },
  { id: 'resources', label: 'Vorräte & Fertigkeiten', symbol: '▤' },
  { id: 'rules', label: 'Regeln & Details', symbol: '⚙' }
]);
const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
export function renderCombatSheetHeader({ name, portrait, archetype, level }) {
  return `<header class="cs-heading"><div class="cs-owner">${portrait ? `<img src="${escape(portrait)}" alt="" decoding="async">` : '<span class="cs-owner-symbol" aria-hidden="true">◈</span>'}<div><span class="cs-kicker">Kampf &amp; Abenteuer · Stufe <b data-combat-derived="effective-level">${level}</b></span><h3>${escape(name || 'Charakterbogen')}</h3><p>${escape(archetype || 'Individuelle Ausbildung')}</p></div></div><div class="cs-heading-actions"><button type="button" data-combat-action="open-level-up">✦ Entwicklung</button><button type="button" data-combat-action="open-character-setup">Aufbau &amp; Ausbildung</button></div></header>`;
}
export function renderCombatSheetPages(contents) {
  return `<nav class="cs-tabs" role="tablist" aria-label="Bereiche des Kampfbogens">${COMBAT_SHEET_PAGES.map(page => `<button type="button" role="tab" id="cs-tab-${page.id}" aria-controls="cs-page-${page.id}" aria-selected="${page.id === 'overview'}" tabindex="${page.id === 'overview' ? 0 : -1}" data-sheet-page="${page.id}"><span aria-hidden="true">${page.symbol}</span>${page.label}</button>`).join('')}</nav>${COMBAT_SHEET_PAGES.map(page => `<section class="cs-page" id="cs-page-${page.id}" role="tabpanel" aria-labelledby="cs-tab-${page.id}"${page.id === 'overview' ? '' : ' hidden'}>${['arsenal', 'traits', 'magic'].includes(page.id) ? `<label class="cs-search"><span aria-hidden="true">⌕</span><input type="search" data-sheet-search="${page.id}" placeholder="${escape(page.label)} durchsuchen …" aria-label="${escape(page.label)} durchsuchen"><output data-sheet-results="${page.id}" aria-live="polite"></output></label>` : ''}${contents[page.id] || ''}<p class="cs-search-empty" data-sheet-empty="${page.id}" hidden>Keine passenden Einträge. Ändere den Suchbegriff.</p></section>`).join('')}`;
}
