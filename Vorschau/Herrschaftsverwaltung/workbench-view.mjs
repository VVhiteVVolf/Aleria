import { escapeHtml as e } from '../shared/country-workbench/render.mjs';
import { AFFILIATIONS, RELATIONSHIPS, SEXES, MIN_ADULT_AGE } from './candidate-filters.mjs';
import { COURT_AREA, officeIcon } from '../../shared/cenyr-administration/office-icons.mjs';
import { rankOf } from '../../shared/cenyr-administration/scopes.mjs';
import { CENYR_FORCES } from '../../shared/cenyr-administration/military-organization.mjs';
import { councilNotes, councilSpecialNotes, officeBadges } from './cenyr-office-notes.mjs';

const placeholders = '/Stammbäume/assets/images/placeholders/';

export function postTitle(slot, person) {
  if (!slot.titleVariants || slot.holder === slot.occupant || !person || !['male', 'female'].includes(person.sex)) return slot.title;
  return slot.titleVariants[person.sex === 'female' ? 1 : 0];
}

export function portrait(person, size = 42) {
  const fallback = `${placeholders}${person?.sex === 'female' || person?.sex === 'male' ? person.sex : 'unknown'}.png`;
  return `<img class="person-portrait" src="${e(person?.portrait || fallback)}" data-fallback="${e(fallback)}"
    width="${size}" height="${size}" alt="" loading="lazy" draggable="false">`;
}

export function officeArtwork(src, size) {
  return `<img class="office-art" src="${e(src)}" width="${size}" height="${size}" alt="" loading="lazy" draggable="false" data-office-art>`;
}

export function renderHouses(houses, people) {
  return houses.map(house => `<button type="button" class="house-choice" data-action="choose-house" data-house="${e(house.id)}" aria-pressed="false">
    <img src="${e(house.crest)}" width="56" height="56" alt="">
    <span><strong>${e(house.name)}</strong><small>${house.preparation ? e(house.title) : `${house.county ? 'Grafschaft · ' : ''}${e(people.get(house.ruler)?.name)}`}</small></span>
  </button>`).join('');
}

function renderCouncillor(area, house, positions, people) {
  const plan = house.plans[area.id];
  const head = positions.get(plan.head.key);
  const person = people.get(head.occupant);
  const vacant = plan.slots.filter(slot => positions.has(slot.key) && !positions.get(slot.key).occupant).length
    + [...positions.values()].filter(slot => slot.custom && slot.area === area.id && !slot.occupant).length;
  const changed = head.occupant !== head.holder;
  return `<button type="button" class="council-card" data-action="open-office" data-area="${e(area.id)}" aria-haspopup="dialog">
    <span class="council-category"><img src="${e(area.imageSrc)}" alt="" width="27" height="27"><span>${e(area.name)}</span></span>
    <strong class="council-title">${e(postTitle(head, person))}</strong>
    <span class="council-holder">${portrait(person, 38)}<span>${e(person?.name || 'Unbesetzt')}</span></span>
    <span class="council-meta"><span class="muted">${changed ? '<span class="draft-badge">Entwurf</span> ' : ''}
      ${vacant} ${vacant === 1 ? 'freier Posten' : 'freie Posten'}</span><span aria-hidden="true">↗</span></span>
  </button>`;
}

export function renderContacts(contacts, people, heading = 'Ortsämter und Lehensstellen', state) {
  return `<details class="reference-panel">
    <summary>${e(heading)}</summary>
    <ul class="contact-list">${contacts.map(contact => {
      const appointment = contact.scope && state ? state.positions(contact.scope).get('klerus/leitung') : null;
      const person = people.get(appointment ? appointment.occupant : contact.id);
      const draft = appointment && appointment.holder !== appointment.occupant;
      const name = e(person?.name || (draft ? 'Unbesetzt' : 'Nicht benannt'));
      const href = contact.scope ? `?haus=${contact.scope}&amt=klerus` : contact.href;
      return `<li>${portrait(person, 35)}<div><span>${e(contact.title)} · ${e(contact.seat)}</span>
        <strong>${person?.href ? `<a href="${e(person.href)}">${name}</a>` : name}</strong>
        ${draft ? '<small>Besetzung im Entwurf</small>' : ''}
        ${href ? `<a class="contact-link" href="${e(href)}">${contact.scope ? 'Vikariat bearbeiten' : 'Herrschaft öffnen'} ↗</a>` : ''}
        ${contact.note ? `<small>${draft ? 'Quellenstand · ' : ''}${e(contact.note)}</small>` : ''}</div></li>`;
    }).join('')}</ul>
  </details>`;
}

function renderCenyrNotes() {
  return `<details class="reference-panel cenyr-office-notes">
    <summary>Amtszeichen und Ämterordnung von Cenyr</summary>
    <div class="office-notes-content">
      <ul class="office-badges">${officeBadges.map(([id, material, rank]) =>
        `<li><span class="office-badge is-${id}" aria-hidden="true"></span><strong>${material}</strong> · ${rank}</li>`).join('')}</ul>
      ${councilNotes.map(note => `<p>${e(note)}</p>`).join('')}
      <h3>Sonderämter</h3>
      ${councilSpecialNotes.map(note => `<p>${e(note)}</p>`).join('')}
      <button type="button" data-action="open-office" data-area="regentschaft" aria-haspopup="dialog">Regentschaft vorbereiten ↗</button>
    </div>
  </details>`;
}

export function renderCouncil(house, areas, positions, people, state) {
  const knights = house.enrolled.filter(family => family.kind === 'knight');
  const civilians = house.enrolled.filter(family => family.kind === 'service');
  const links = entries => entries.map(family => `<a href="${e(family.href)}">${e(family.name)}</a>`).join('');
  const court = [...positions.values()].filter(slot => /^hof(?:\/|-)/u.test(slot.key));
  const courtFree = court.filter(slot => !slot.occupant).length;
  return `<div class="council-heading">
    <div><h2 id="council-title">Ratsämter · ${e(house.name)}</h2>
      <p class="muted">${house.preparation ? `${e(rankOf(house).label)} · ` : ''}${house.candidates.length} Kandidaten aus Haus, Ritterhäusern und direktem Dienst</p></div>
    <a class="text-link" href="${e(house.href)}">Herrschaftsakte ↗</a>
  </div>
  <button class="court-entry" type="button" data-action="open-office" data-area="hof" aria-haspopup="dialog">
    ${officeArtwork(COURT_AREA.imageSrc, 32)}
    <span><strong>Hofämter</strong><small>Hausverwaltung und Hofdienste</small></span>
    <span class="court-count">${courtFree} frei · ${court.length} Posten <span aria-hidden="true">↗</span></span>
  </button>
  <div class="council-grid">${areas.filter(area => Object.hasOwn(house.offices, area.id)).map(area => renderCouncillor(area, house, positions, people)).join('')}</div>
  <div class="references">
    <details class="reference-panel">
      <summary>Direkt zugeordnete Häuser</summary>
      <dl class="affiliation-list"><div><dt>Ritterhäuser</dt><dd>${links(knights) || 'Keine belegt'}</dd></div>
      <div><dt>Bürgerliche Familien</dt><dd>${links(civilians) || 'Keine Hausbindung belegt'}</dd></div></dl>
    </details>
    ${renderContacts(house.contacts, people, house.county ? 'Vikariate der Lehnsherrschaften' : undefined, state)}
  </div>
  ${renderCenyrNotes()}
  <div class="revision-tools">
    <button type="button" data-action="undo" ${state.canUndo() ? '' : 'disabled'}>Letzte Änderung rückgängig</button>
    <button type="button" data-action="reset" ${state.hasDraft(house.id) ? '' : 'disabled'}>Hausentwurf zurücksetzen</button>
  </div>`;
}

export function renderFilterFields() {
  const select = (name, label, choices) => `<label>${label}<select name="${name}"><option value="">Alle</option>${
    Object.entries(choices).map(([value, text]) => `<option value="${value}">${e(text)}</option>`).join('')
  }</select></label>`;
  return `${select('sex', 'Geschlecht', SEXES)}${select('relationship', 'Familienstand', RELATIONSHIPS)}
    ${select('kind', 'Zugehörigkeit', AFFILIATIONS)}${select('availability', 'Besetzung', { unassigned: 'Ohne Posten', assigned: 'Bereits besetzt' })}
    <label>Alter ab <input type="number" name="minAge" min="0" inputmode="numeric"></label>
    <label>Alter bis <input type="number" name="maxAge" min="0" inputmode="numeric"></label>
    <label class="checkbox-label filter-wide"><input name="hideMinors" type="checkbox"> Unter ${MIN_ADULT_AGE} Jahren ausblenden</label>
    <button type="button" class="filter-wide" data-action="reset-filters">Filter zurücksetzen</button>`;
}

export function renderCandidate(person, selected) {
  const facts = [person.family || AFFILIATIONS[person.kind],
    person.age === null ? 'Alter offen' : `${person.approximate ? 'ca. ' : ''}${person.age} J.`,
    RELATIONSHIPS[person.relationship]];
  const detail = person.position ? `${person.position.holder === person.id ? 'Belegt' : 'Eingeplant'} · ${postTitle(person.position, person)}`
    : person.detail || (person.kind === 'free' ? 'Keine Dienstbindung belegt' : '');
  return `<li>
    <button type="button" class="candidate" data-action="select-person" data-drag-person="${e(person.id)}" aria-pressed="${selected}">
      ${portrait(person)}
      <span class="candidate-text"><strong>${e(person.name)}</strong><small>${e(facts.join(' · '))}</small>
      ${detail ? `<small class="candidate-detail">${e(detail)}</small>` : ''}</span>
      <span class="drag-grip" data-drag-handle aria-hidden="true">⠿</span>
    </button>
    ${person.kind === 'tree' ? `<button type="button" class="remove-applicant" data-action="remove-applicant" data-person="${e(person.id)}"
      aria-label="${e(`${person.name} aus der Bewerberliste entfernen`)}">Aus Liste entfernen</button>` : ''}
  </li>`;
}

export function renderPost(slot, person, { headLabel = '', image = slot.image, collapseDescription = false, ordinal = 0, showDepartment = true } = {}) {
  const status = slot.occupant === slot.holder ? (person ? 'Belegte Besetzung' : 'Offen') : (person ? 'Entwurf' : 'Im Entwurf frei');
  const title = postTitle(slot, person);
  const name = ordinal ? `${title} · Posten ${ordinal}` : title;
  const heading = headLabel ? 'h4' : 'h5';
  const art = image || officeIcon(slot.kind === 'special' ? 'court' : 'coordination');
  const duty = slot.description ? `<p class="post-duty">${e(slot.description)}</p>` : '';
  return `<article class="office-post${headLabel ? ' is-head' : ''}" data-drop-post="${e(slot.key)}">
    <div class="post-copy">
      ${officeArtwork(art, headLabel ? 34 : 28)}
      <div>
        ${headLabel ? `<p class="territory-label">${e(headLabel)}</p>` : ''}
        <${heading}>${e(name)}</${heading}>
        ${duty && collapseDescription ? `<details class="post-duties"><summary>Aufgaben</summary>${duty}</details>` : duty}
        ${slot.reportsTo ? `<p class="post-reports">Untersteht ${e(slot.reportsTo)}</p>` : ''}
        ${slot.locality?.type === 'station' ? `<p class="post-reports">Stationiert in ${e(slot.locality.name)}</p>` : ''}
        ${slot.note ? `<p class="source-note">${e(slot.note)}</p>` : ''}
      </div>
    </div>
    <div class="post-assignment">
      <button type="button" class="post-target" data-action="choose-post" data-post="${e(slot.key)}"
        aria-label="${e(`${name} · ${person?.name || 'Unbesetzt'}`)}" ${person ? `data-drag-person="${e(person.id)}"` : ''}>
        ${person ? portrait(person, 35) : '<span class="open-post-symbol" aria-hidden="true">+</span>'}
        <span><strong>${e(person?.name || 'Unbesetzt')}</strong><small>${e(status)}</small></span>
      </button>
      ${person || slot.removable || (showDepartment && slot.department) ? `<div class="post-actions">
        ${showDepartment && slot.department ? `<button type="button" data-action="open-department" data-department="${e(slot.department)}"
          data-post="${e(slot.key)}" aria-label="${e(`Hierarchie öffnen: ${name}`)}">Hierarchie öffnen</button>` : ''}
        ${person ? `<button type="button" data-action="clear-post" data-post="${e(slot.key)}" aria-label="${e(`Posten freigeben: ${title}`)}">Freigeben</button>` : ''}
        ${slot.removable ? `<button type="button" data-action="remove-post" data-post="${e(slot.key)}" aria-label="${e(`Posten entfernen: ${name}`)}">Entfernen</button>` : ''}
      </div>` : ''}
    </div>
  </article>`;
}

export function renderMilitaryForces(house) {
  const href = area => '?' + new URLSearchParams({ haus: house.id, amt: area,
    ...(area === 'hof' ? { abteilung: 'hof-hausmacht' } : {}) });
  return `<details class="reference-panel" data-role="military-forces">
    <summary>Die fünf Arten von Streitkräften</summary>
    <dl class="affiliation-list">${CENYR_FORCES.map(force => {
      const target = force.id === 'hausmacht' ? 'hof' : force.id === 'kirche' ? 'klerus' : '';
      return `<div><dt>${e(force.title)}</dt><dd>${e(force.text)}
        ${target ? `<a href="${e(href(target))}">${target === 'hof' ? 'Hausmacht öffnen' : 'Kirchliche Ämter öffnen'} ↗</a>` : ''}</dd></div>`;
    }).join('')}</dl>
  </details>`;
}

export function renderPostSection(group, slots, people, repeated = '') {
  return `<section class="post-group${group.core ? ' is-core' : ''}${group.leadership ? ' is-leadership' : ''}"><header>
    ${officeArtwork(group.icon, 32)}
    <div><h4>${e(group.title)}</h4>
    ${group.description ? `<p>${e(group.description)}</p>` : ''}</div>
  </header>${slots.length ? `<div class="post-grid">${slots.map(slot => renderPost(slot, people.get(slot.occupant), {
    collapseDescription: group.leadership,
  })).join('')}</div>` : ''}${repeated}</section>`;
}
