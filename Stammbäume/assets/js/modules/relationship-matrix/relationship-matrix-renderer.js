import { resolvePortraitSource } from '../../config/portrait-placeholders.js';
import { formatLifeLine } from '../../domain/person-presentation.js';
import { escapeHtml } from '../../ui/dom.js';
import { LEGITIMACY_LABELS, PARENTAGE_LABELS } from '../../config/family-colors.js';

function portrait(person, className) {
  return `<img class="${className}" src="${escapeHtml(resolvePortraitSource(person))}" alt="Portrait von ${escapeHtml(person.name)}" loading="lazy" decoding="async">`;
}

function relationshipCard(entry, houseById) {
  const house = houseById.get(entry.person.houseId);
  return `
    <button class="relationship-matrix-card" type="button" data-matrix-person-id="${escapeHtml(entry.person.id)}" title="${escapeHtml(entry.person.name)} ins Zentrum setzen">
      ${portrait(entry.person, 'relationship-matrix-card__portrait')}
      <span class="relationship-matrix-card__copy">
        <span class="relationship-matrix-card__relations">${entry.labels.map(escapeHtml).join(' · ')}</span>
        <strong>${escapeHtml(entry.person.name)}</strong>
        <small>${escapeHtml(house?.name || entry.person.title || formatLifeLine(entry.person))}</small>
        <small>${escapeHtml(formatLifeLine(entry.person))}</small>
      </span>
    </button>`;
}

function partnershipGroups(matrix, houseById) {
  const { groups, unassignedChildren } = matrix.partnerships;
  return `<section class="relationship-matrix-unions" aria-label="Partnerschaften und gemeinsame Kinder">
    <header><h3>Partnerschaften & gemeinsame Kinder</h3><p>Jede Verbindung führt ihre eigene Familie. Personen wählen, um ihre Beziehungen zu erkunden.</p></header>
    <div class="relationship-matrix-unions__list">${groups.map(group => `
      <article class="relationship-matrix-union" data-matrix-partnership-id="${escapeHtml(group.partnership.id)}">
        <header><strong>${escapeHtml(group.presentation.label)}</strong><span>${escapeHtml([group.presentation.period, group.presentation.status].filter(Boolean).join(' · '))}</span></header>
        ${group.partners.map(person => relationshipCard({ person, labels: ['Partner dieser Verbindung'] }, houseById)).join('')}
        <div class="relationship-matrix-union__children"><h4>Gemeinsame Kinder · ${group.children.length}</h4>
          ${group.children.length ? group.children.map(child => relationshipCard({ person: child.person, labels: [child.type !== 'biological' ? PARENTAGE_LABELS[child.type] : '', child.legitimacy !== 'unknown' ? LEGITIMACY_LABELS[child.legitimacy] : ''].filter(Boolean) }, houseById)).join('') : '<p class="relationship-matrix-empty">Keine gemeinsamen Kinder verzeichnet</p>'}
        </div>
      </article>`).join('') || '<p class="relationship-matrix-empty">Keine Partnerschaft verzeichnet</p>'}</div>
    ${unassignedChildren.length ? `<div class="relationship-matrix-unassigned"><h4>Kinder ohne eindeutige Zuordnung zu einer Partnerschaft</h4>${unassignedChildren.map(person => relationshipCard({ person, labels: ['Kind'] }, houseById)).join('')}</div>` : ''}
  </section>`;
}

function relationshipSector(section, houseById) {
  return `
    <section class="relationship-matrix-sector relationship-matrix-sector--${escapeHtml(section.id)}" aria-labelledby="matrix-${escapeHtml(section.id)}-title">
      <header>
        <span>${escapeHtml(section.eyebrow)}</span>
        <h3 id="matrix-${escapeHtml(section.id)}-title">${escapeHtml(section.title)}</h3>
      </header>
      <div class="relationship-matrix-sector__list">
        ${section.entries.length
    ? section.entries.map(entry => relationshipCard(entry, houseById)).join('')
    : '<p class="relationship-matrix-empty">Keine Verbindung verzeichnet</p>'}
      </div>
    </section>`;
}

export function renderRelationshipMatrix(matrix) {
  const houseById = new Map(matrix.family.houses.map(house => [house.id, house]));
  const house = houseById.get(matrix.focusPerson.houseId);
  const sections = new Map(matrix.sections.map(section => [section.id, section]));
  return `
    <div class="relationship-matrix-shell">
      <div class="relationship-matrix-grid" aria-label="Beziehungsgeflecht von ${escapeHtml(matrix.focusPerson.name)}">
        ${relationshipSector(sections.get('ancestors'), houseById)}
        ${relationshipSector(sections.get('collateral'), houseById)}
        <section class="relationship-matrix-focus" aria-label="Ausgewählte Person">
          <span class="relationship-matrix-focus__orbit" aria-hidden="true"></span>
          <div class="relationship-matrix-focus__portrait">${portrait(matrix.focusPerson, '')}</div>
          <span class="relationship-matrix-focus__eyebrow">Im Zentrum</span>
          <h3 tabindex="-1">${escapeHtml(matrix.focusPerson.name)}</h3>
          <p>${escapeHtml(matrix.focusPerson.title || house?.name || 'Familienakte')}</p>
          <small>${escapeHtml(formatLifeLine(matrix.focusPerson))}</small>
          <span class="relationship-matrix-focus__count">${matrix.relationshipCount} Personen im Beziehungsnetz</span>
        </section>
        ${partnershipGroups(matrix, houseById)}
        ${relationshipSector(sections.get('bonds'), houseById)}
        ${relationshipSector(sections.get('descendants'), houseById)}
      </div>
    </div>`;
}
