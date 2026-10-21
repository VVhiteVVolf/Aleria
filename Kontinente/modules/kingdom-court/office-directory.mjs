import { escapeHtml, paragraphs } from './page-template.mjs';

export function officeCard(office) {
  return `<article class="court-office" id="${office.id}" data-court-office>
    ${office.category ? `<p class="court-label">${escapeHtml(office.category)}</p>` : ''}
    <h3><a href="#${office.id}">${escapeHtml(office.title)}</a></h3>
    ${paragraphs(office.description)}${office.note ? `<p class="court-source-note">${escapeHtml(office.note)}</p>` : ''}
  </article>`;
}

export function officeGroup(group) {
  return `<section class="court-section" id="${group.id}" data-court-group>
    <header class="court-section-heading"><span class="court-section-number" aria-hidden="true">${group.number}</span><h2>${escapeHtml(group.title)}</h2></header>
    <div class="court-section-intro">${paragraphs(group.introduction)}</div>
    <div class="court-office-grid">${group.offices.map(officeCard).join('\n')}</div>
  </section>`;
}

export function officeSearch(count, placeholder) {
  return `<div class="court-search" data-court-search hidden>
    <label for="aemter-suche">Im Ämterverzeichnis suchen</label>
    <div class="court-search-field"><input type="search" id="aemter-suche" placeholder="${escapeHtml(placeholder)}" aria-controls="aemter-verzeichnis" autocomplete="off"><button type="button" data-action="clear-search" hidden>Zurücksetzen</button></div>
    <p role="status" aria-live="polite" aria-atomic="true" data-role="search-status">${count} Ämter, Titel und Stände</p>
  </div>`;
}
