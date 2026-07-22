import { STATUS_LABELS, getFamilyRole } from '../config/family-colors.js';
import { getPersonLineageRole } from '../config/person-lineage.js';
import { resolvePortraitSource } from '../config/portrait-placeholders.js';
import { formatAge, formatLifeLine } from '../domain/person-presentation.js';
import { escapeHtml } from './dom.js';

function renderPortrait(person) {
  const source = resolvePortraitSource(person);
  const placeholderClass = person.portrait ? '' : ' inspector-portrait--placeholder';
  return `<img class="inspector-portrait${placeholderClass}" src="${escapeHtml(source)}" alt="${person.portrait ? `Portrait von ${escapeHtml(person.name)}` : `Silhouette für ${escapeHtml(person.name)}`}">`;
}

function renderGroup(group) {
  if (!group.people.length) return '';
  return `
    <section class="inspector-section">
      <h3>${escapeHtml(group.label)}</h3>
      <ul class="relationship-list">
        ${group.people.map(person => `
          <li>
            <button class="relationship-person-button" type="button" data-action="select-person" data-person-id="${escapeHtml(person.id)}">
              <strong>${escapeHtml(person.name)}</strong>
              <span>${escapeHtml(person.title || 'Akte öffnen')} →</span>
            </button>
          </li>
        `).join('')}
      </ul>
    </section>
  `;
}

function renderCadetBranches(branches) {
  if (!branches.length) return '';
  return `
    <section class="inspector-section">
      <h3>Verknüpfte Häuser dieses Paares</h3>
      <ul class="relationship-list">
        ${branches.map(branch => `
          <li class="cadet-branch-row">
            <span><strong>${escapeHtml(branch.name)}</strong><small>${branch.linkType === 'married-away' ? 'Wegverheiratete Linie' : branch.founded ? `Kadettenhaus · gegründet ${escapeHtml(branch.founded)}` : 'Kadettenhaus'}</small></span>
            <button class="icon-button" type="button" data-action="delete-cadet" data-branch-id="${escapeHtml(branch.id)}" aria-label="${escapeHtml(branch.name)} entfernen">×</button>
          </li>
        `).join('')}
      </ul>
    </section>
  `;
}

function renderTimeJumps(timeJumps) {
  if (!timeJumps.length) return '';
  return `
    <section class="inspector-section">
      <h3>Zeitsprünge ab dieser Person</h3>
      <ul class="relationship-list">
        ${timeJumps.map(timeJump => `
          <li class="time-jump-row">
            <span>
              <strong>${escapeHtml(timeJump.label)}</strong>
              <small>${timeJump.years ? `${timeJump.years} Jahre · ` : ''}${timeJump.childIds.length} direkt zugeordnete Personen</small>
            </span>
            <span class="time-jump-row__actions">
              <button class="button button--quiet button--small" type="button" data-action="open-time-jump-actions" data-time-jump-id="${escapeHtml(timeJump.id)}">Zeitsprung öffnen</button>
            </span>
          </li>
        `).join('')}
      </ul>
    </section>
  `;
}

export function renderPersonInspector(container, graph, personId) {
  const person = graph.getPerson(personId);
  if (!person) {
    container.innerHTML = `
      <div class="inspector-empty">
        <div class="inspector-empty-mark" aria-hidden="true">✦</div>
        <h2>Keine Person ausgewählt</h2>
        <p>Wähle eine Karte im Stammbaum oder lege eine neue Person an.</p>
      </div>
    `;
    return;
  }

  const role = getFamilyRole(person.familyRole);
  const lineageRole = getPersonLineageRole(person.lineageRole);
  const house = graph.getHouse(person.houseId);
  const parents = graph.getParents(person.id);
  const children = graph.getChildren(person.id);
  const descendants = graph.getDescendants(person.id);
  const groups = graph.getRelationshipGroups(person.id);
  const partnershipIds = new Set(graph.getPartnerships(person.id).map(partnership => partnership.id));
  const cadetBranches = graph.family.cadetBranches.filter(branch => partnershipIds.has(branch.parentPartnershipId));
  const timeJumps = graph.family.timeJumps.filter(timeJump => (
    partnershipIds.has(timeJump.parentPartnershipId) || timeJump.parentPersonId === person.id
  ));

  container.innerHTML = `
    <article class="inspector-person ${role.cssClass}">
      <header class="inspector-hero">
        ${renderPortrait(person)}
        <div>
          <p class="eyebrow">Personenakte</p>
          <h2>${escapeHtml(person.name)}</h2>
          <p class="inspector-title">${escapeHtml(person.title || house?.name || 'Ohne Titel')}</p>
          <p class="inspector-life">${escapeHtml(formatLifeLine(person))}</p>
          <span class="inspector-role"><span class="person-role-mark" aria-hidden="true"></span>${escapeHtml(role.label)}</span>
        </div>
      </header>

      <section class="inspector-section">
        <h3>Einordnung</h3>
        <dl class="inspector-facts">
          <div><dt>Haus</dt><dd>${escapeHtml(house?.name || 'Nicht zugeordnet')}</dd></div>
          <div><dt>Status</dt><dd>${escapeHtml(STATUS_LABELS[person.status] || person.status)}</dd></div>
          <div><dt>Hauslinie</dt><dd>${escapeHtml(lineageRole.label)}</dd></div>
          <div><dt>Alter zur Gegenwart</dt><dd>${escapeHtml(formatAge(person))}</dd></div>
          <div><dt>Eltern</dt><dd>${parents.length}</dd></div>
          <div><dt>Nachkommen</dt><dd>${descendants.length}</dd></div>
        </dl>
        ${person.notes ? `<p>${escapeHtml(person.notes)}</p>` : ''}
      </section>

      ${groups.map(renderGroup).join('')}
      ${renderCadetBranches(cadetBranches)}
      ${renderTimeJumps(timeJumps)}

      <footer class="inspector-actions">
        <button class="button inspector-primary-action" type="button" data-action="open-relation-actions">⚭ Beziehung modifizieren</button>
        <button class="button button--quiet" type="button" data-action="open-person-edit">Person bearbeiten</button>
        <button class="button button--quiet" type="button" data-action="open-person-biography">Biographie bearbeiten</button>
        <button class="button button--quiet" type="button" data-action="open-almanach-characters">Almanach-Person zuordnen</button>
        <button class="button button--quiet" type="button" data-action="focus-person">Im Baum zentrieren</button>
        <button class="button button--danger" type="button" data-action="delete-person">Person löschen</button>
      </footer>
    </article>
  `;
}
