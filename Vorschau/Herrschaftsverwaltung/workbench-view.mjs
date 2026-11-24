import { escapeHtml as e } from '../shared/country-workbench/render.mjs';
import { AFFILIATIONS, RELATIONSHIPS, SEXES, MIN_ADULT_AGE } from './candidate-filters.mjs';
import { CAMRUISGE_AREAS, COURT_AREA, LEHENSWARTE_AREA, officeIcon } from '../../shared/cenyr-administration/office-icons.mjs';
import { rankOf } from '../../shared/cenyr-administration/scopes.mjs';
import { lehenswartKey, LEHENSWARTE_ID } from '../../shared/cenyr-administration/lehenswarte-plan.mjs';
import { GUILD_LEASE } from '../../shared/cenyr-administration/local-authority.mjs';
import { CENYR_FORCES } from '../../shared/cenyr-administration/military-organization.mjs';
import { otherAppointmentLinks, preparationHref } from '../../shared/cenyr-administration/office-appointments.mjs';
import { councilNotes, councilSpecialNotes, officeBadges } from './cenyr-office-notes.mjs';
import { officeTitleKey, postTitleKey } from './draft-office-titles.mjs';
import { renameButton } from './office-title-editor.mjs';
import { needsFilling, postOccupant } from './draft-assignment-references.mjs';
import { ABERLLAN_PREVIEW } from './territorial-navigation.mjs';

const placeholders = '/Stammbäume/assets/images/placeholders/';

export function postTitle(slot, person) {
  const retainTitle = slot.holder === slot.occupant && !slot.authorityChoice;
  if (!slot.titleVariants || retainTitle || !person || !['male', 'female'].includes(person.sex)) return slot.title;
  return slot.titleVariants[person.sex === 'female' ? 1 : 0];
}

export function appointmentLinksFor(scopeId, state) {
  return (slot, person) => {
    if (!person || slot.needsReplacement) return '';
    const links = otherAppointmentLinks(state.appointments(person.id), scopeId, slot.key, post => postTitle(post, person));
    return links.length ? `<ul class="office-appointments" aria-label="${e(`Weitere Ämter von ${person.name}`)}">${links.map(({ label, href }) =>
      `<li><a href="${e(href)}" data-action="open-appointment">${e(label)}&nbsp;<span aria-hidden="true">↗</span></a></li>`).join('')}</ul>` : '';
  };
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
    <span><strong>${e(house.regional ? house.title : house.name)}</strong><small>${house.regional ? e(house.name)
      : house.preparation ? e(house.title) : `${house.county ? 'Grafschaft · ' : ''}${e(people.get(house.ruler)?.name)}`}</small></span>
  </button>`).join('');
}

function renderCouncillor(area, house, positions, people, appointmentLinks) {
  const plan = house.plans[area.id];
  const head = positions.get(plan.head.key);
  const person = postOccupant(head, people);
  const vacant = plan.slots.filter(slot => positions.has(slot.key) && needsFilling(positions.get(slot.key))).length
    + [...positions.values()].filter(slot => slot.custom && slot.area === area.id && needsFilling(slot)).length;
  const changed = head.occupant !== head.holder;
  return `<article class="council-card-shell"><button type="button" class="council-card" data-action="open-office" data-area="${e(area.id)}" aria-haspopup="dialog">
    <span class="council-category"><img src="${e(area.imageSrc)}" alt="" width="27" height="27"><span>${e(area.name)}</span></span>
    <strong class="council-title">${e(postTitle(head, person))}</strong>
    <span class="council-holder">${portrait(person, 38)}<span>${e(person?.name || 'Unbesetzt')}
      ${head.needsReplacement ? '<small class="replacement-status">Nachbesetzung nötig</small>' : ''}</span></span>
    <span class="council-meta"><span class="muted">${changed ? '<span class="draft-badge">Entwurf</span> ' : ''}
      ${vacant} ${vacant === 1 ? 'freier Posten' : 'freie Posten'}</span><span aria-hidden="true">↗</span></span>
  </button>${appointmentLinks(head, person)}</article>`;
}

export function renderContacts(contacts, people, heading = 'Ortsämter und Lehensstellen', { state, positions } = {}) {
  return `<details class="reference-panel">
    <summary>${e(heading)}</summary>
    <ul class="contact-list">${contacts.map(contact => {
      const fief = !contact.scope && positions?.get(lehenswartKey(contact.seat));
      const appointment = contact.scope && state ? state.positions(contact.scope).get('klerus/leitung') : fief;
      const person = appointment ? postOccupant(appointment, people) : people.get(contact.id);
      const changedOccupant = appointment && appointment.holder !== appointment.occupant;
      const drafted = changedOccupant || fief?.authorityChoice;
      const name = e(person?.name || (changedOccupant ? 'Unbesetzt' : 'Nicht benannt'));
      const href = contact.scope ? `?haus=${contact.scope}&amt=klerus` : contact.href;
      const title = fief ? postTitle(fief, person) : contact.title;
      const location = fief && title.includes(fief.authority.seat) ? '' : ` · ${contact.seat}`;
      return `<li>${portrait(person, 35)}<div><span>${e(title + location)}</span>
        <strong>${person?.href ? `<a href="${e(person.href)}">${name}</a>` : name}</strong>
        ${appointment?.needsReplacement ? '<small class="replacement-status">Nachbesetzung nötig</small>' : ''}
        ${drafted ? `<small>${fief ? 'Ortsamt' : 'Besetzung'} im Entwurf</small>` : ''}
        ${href ? `<a class="contact-link" href="${e(href)}">${contact.scope ? 'Vikariat bearbeiten' : 'Herrschaft öffnen'} ↗</a>` : ''}
        ${contact.note ? `<small>${drafted ? 'Quellenstand · ' : ''}${e(contact.note)}</small>` : ''}</div></li>`;
    }).join('')}</ul>
  </details>`;
}

export function renderDelegatedOffices(entries) {
  return entries?.length ? `<div class="delegated-offices"><h4>Eigenständige Verwaltungen</h4>
    ${entries.map(({ title, href }) => `<a href="${e(href)}" data-action="open-appointment">${e(title)} ↗</a>`).join('')}</div>` : '';
}

function renderCenyrNotes(regent, showRegent) {
  return `<details class="reference-panel cenyr-office-notes">
    <summary>Amtszeichen und Ämterordnung von Cenyr</summary>
    <div class="office-notes-content">
      <ul class="office-badges">${officeBadges.map(([id, material, rank]) =>
        `<li><span class="office-badge is-${id}" aria-hidden="true"></span><strong>${material}</strong> · ${rank}</li>`).join('')}</ul>
      ${councilNotes.map(note => `<p>${e(note)}</p>`).join('')}
      <h3>Sonderämter</h3>
      ${councilSpecialNotes.map(note => `<p>${e(note)}</p>`).join('')}
      ${showRegent ? `<button type="button" data-action="open-office" data-area="regentschaft" aria-haspopup="dialog">${e(regent)} vorbereiten ↗</button>` : ''}
    </div>
  </details>`;
}

function renderOfficeEntry(area, title, subtitle, slots) {
  const free = slots.filter(needsFilling).length;
  return `<button class="court-entry" type="button" data-action="open-office" data-area="${e(area.id)}" aria-haspopup="dialog">
    ${officeArtwork(area.imageSrc, 32)}
    <span><strong>${e(title)}</strong><small>${e(subtitle)}</small></span>
    <span class="court-count">${free} frei · ${slots.length} Posten <span aria-hidden="true">↗</span></span>
  </button>`;
}

function renderRevisionTools(house, state) {
  return `<div class="revision-tools">
    <button type="button" data-action="undo" ${state.canUndo() ? '' : 'disabled'}>Letzte Änderung rückgängig</button>
    <button type="button" data-action="reset" ${state.hasDraft(house.id) ? '' : 'disabled'}>Herrschaftsentwurf zurücksetzen</button>
  </div>`;
}

function renderCamruisge(house, positions, people, state) {
  const appointmentLinks = appointmentLinksFor(house.id, state);
  return `<div class="council-heading">
    <div><h2 id="council-title">${e(house.title)}</h2><p class="muted">Zwei örtliche Verwaltungen auf einer Insel</p></div>
    <a class="text-link" href="${e(house.href)}">Inselakte ↗</a>
  </div>
  <div class="dyarchy-branches">${house.branches.map(branch => {
    const area = CAMRUISGE_AREAS.find(item => item.id === branch.id);
    const head = positions.get(house.plans[branch.id].head.key);
    return `<section class="dyarchy-branch">
      <h3>${e(branch.name)}</h3>
      <p>${e(branch.authority)} · ${branch.familyHref ? `<a href="${e(branch.familyHref)}">${e(branch.familyName)}</a>` : e(branch.familyName)}</p>
      ${renderCouncillor(area, house, positions, people, appointmentLinks)}
      ${head.place === 'Aberllan' ? `<a class="text-link" href="${ABERLLAN_PREVIEW}">Ortsvorbereitung Aberllan ↗</a>` : ''}
    </section>`;
  }).join('')}</div>
  <div class="council-entries dyarchy-cooperation">
    ${renderOfficeEntry(CAMRUISGE_AREAS[2], state.title(house.id, officeTitleKey('inselabstimmung'), CAMRUISGE_AREAS[2].name),
      'Abstimmung zwischen Aberllan und Oilean', house.plans.inselabstimmung.slots.map(slot => positions.get(slot.key)))}
  </div>${renderRevisionTools(house, state)}`;
}

export function renderCouncil(house, areas, positions, people, state) {
  if (house.branches) return renderCamruisge(house, positions, people, state);
  const knights = house.enrolled.filter(family => family.kind === 'knight');
  const civilians = house.enrolled.filter(family => family.kind === 'service');
  const links = entries => entries.map(family => `<a href="${e(family.href)}">${e(family.name)}</a>`).join('');
  const slots = [...positions.values()];
  const court = slots.filter(slot => /^hof(?:\/|-)/u.test(slot.key));
  const fiefs = slots.filter(slot => slot.key.startsWith(`${LEHENSWARTE_ID}/`));
  const title = area => state.title(house.id, officeTitleKey(area.id), area.name);
  const appointmentLinks = appointmentLinksFor(house.id, state);
  const sourcedRegent = Object.hasOwn(house.offices, 'regentschaft');
  return `<div class="council-heading">
    <div><h2 id="council-title">Ratsämter · ${e(house.name)}</h2>
      <p class="muted">${house.preparation ? `${e(rankOf(house).label)} · ` : ''}${house.candidates.length} Kandidaten aus Haus, Ritterhäusern und direktem Dienst</p></div>
    <a class="text-link" href="${e(house.href)}">Herrschaftsakte ↗</a>
  </div>
  <div class="council-entries">
    ${house.courtScope ? `<a class="court-entry court-entry-link" href="${e(preparationHref(house.courtScope, 'hof'))}" data-action="open-appointment">
      ${officeArtwork(COURT_AREA.imageSrc, 32)}<span><strong>Hofämter von Haus Pendrag</strong><small>Gemeinsamer Haushalt am Königshof</small></span><span aria-hidden="true">↗</span>
    </a>` : renderOfficeEntry(COURT_AREA, title(COURT_AREA), 'Hausverwaltung und Hofdienste', court)}
    ${house.plans[LEHENSWARTE_ID] ? renderOfficeEntry(LEHENSWARTE_AREA, title(LEHENSWARTE_AREA), 'Ortsleitungen und Gildenpacht', fiefs) : ''}
  </div>
  <div class="council-grid">${areas.filter(area => Object.hasOwn(house.offices, area.id)).map(area => renderCouncillor(area, house, positions, people, appointmentLinks)).join('')}</div>
  <div class="references">
    <details class="reference-panel">
      <summary>Direkt zugeordnete Häuser</summary>
      <dl class="affiliation-list"><div><dt>Ritterhäuser</dt><dd>${links(knights) || 'Keine belegt'}</dd></div>
      <div><dt>Bürgerliche Familien</dt><dd>${links(civilians) || 'Keine Hausbindung belegt'}</dd></div></dl>
    </details>
    ${house.contacts.length ? renderContacts(house.contacts, people, house.county ? 'Vikariate der Lehnsherrschaften' : undefined, { state, positions }) : ''}
  </div>
  ${renderCenyrNotes(state.title(house.id, postTitleKey('regentschaft/leitung'), 'Regentschaft'), !sourcedRegent)}
  ${renderRevisionTools(house, state)}`;
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
  const [appointment] = person.appointments;
  const detail = person.appointments.length > 1 ? `${person.appointments.length} Ämter`
    : appointment ? `${appointment.post.holder === person.id && !appointment.post.authorityChoice ? 'Belegt' : 'Eingeplant'} · ${appointment.title}`
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

export function renderPost(slot, person, { headLabel = '', image = slot.image, collapseDescription = false, ordinal = 0, showDepartment = true, appointmentLinks } = {}) {
  const source = slot.occupant === slot.holder && !slot.authorityChoice;
  const status = slot.needsReplacement ? 'Nachbesetzung nötig'
    : source ? (person ? 'Belegte Besetzung' : 'Offen') : (person ? 'Entwurf' : 'Im Entwurf frei');
  const title = postTitle(slot, person);
  const name = ordinal ? `${title} · Posten ${ordinal}` : title;
  const heading = headLabel ? 'h4' : 'h5';
  const art = image || officeIcon(slot.kind === 'special' ? 'court' : 'coordination');
  const duty = slot.description ? `<p class="post-duty">${e(slot.description)}</p>` : '';
  const lease = (slot.authorityChoice?.role || slot.authority?.role) === GUILD_LEASE;
  const context = slot.authority ? [
    ...(!title.includes(slot.authority.seat) ? [slot.authority.seat] : []),
    slot.authority.type || 'Ortstyp offen', ...(lease ? ['Gildenpacht', slot.authorityChoice?.guild] : []),
  ].filter(Boolean).join(' · ') : '';
  return `<article class="office-post${headLabel ? ' is-head' : ''}" data-drop-post="${e(slot.key)}">
    <div class="post-copy">
      ${officeArtwork(art, headLabel ? 34 : 28)}
      <div>
        ${headLabel ? `<p class="territory-label">${e(headLabel)}</p>` : ''}
        <div class="title-with-rename"><${heading}>${e(name)}</${heading}>
          ${headLabel ? '' : renameButton(postTitleKey(slot.key), title, slot.department ? 'Amt' : 'Posten')}</div>
        ${context ? `<p class="post-place-type">${e(context)}</p>` : ''}
        ${duty && collapseDescription ? `<details class="post-duties"><summary>Aufgaben</summary>${duty}</details>` : duty}
        ${slot.reportsTo ? `<p class="post-reports">Untersteht ${e(slot.reportsTo)}</p>` : ''}
        ${slot.place && !slot.authority && slot.title !== slot.originalTitle ? `<p class="post-reports">Ort ${e(slot.place)}</p>` : ''}
        ${slot.locality?.type === 'station' ? `<p class="post-reports">Stationiert in ${e(slot.locality.name)}</p>` : ''}
        ${slot.note ? `<p class="source-note">${e(slot.note)}</p>` : ''}
        ${slot.href ? `<a class="contact-link" href="${e(slot.href)}">Lehen ansehen ↗</a>` : ''}
      </div>
    </div>
    <div class="post-assignment">
      <button type="button" class="post-target" data-action="choose-post" data-post="${e(slot.key)}"
        aria-label="${e(`${name} · ${person?.name || 'Unbesetzt'}${slot.needsReplacement ? ' · Nachbesetzung nötig' : ''}`)}"
        ${person && !slot.needsReplacement ? `data-drag-person="${e(person.id)}"` : ''}>
        ${person ? portrait(person, 35) : '<span class="open-post-symbol" aria-hidden="true">+</span>'}
        <span><strong>${e(person?.name || 'Unbesetzt')}</strong><small${slot.needsReplacement ? ' class="replacement-status"' : ''}>${e(status)}</small></span>
      </button>
      ${slot.previousOccupantName ? `<p class="former-assignment">Andere Besetzung im früheren Entwurf · ${e(slot.previousOccupantName)}</p>` : ''}
      ${appointmentLinks?.(slot, person) || ''}
      ${person || slot.needsReplacement || slot.authority || slot.removable || (showDepartment && slot.department) ? `<div class="post-actions">
        ${slot.authority ? `<button type="button" data-action="configure-authority" data-post="${e(slot.key)}" aria-haspopup="dialog"
          aria-label="${e(`Amtsform für ${slot.authority.seat} wählen`)}">Amtsform wählen</button>` : ''}
        ${showDepartment && slot.department ? `<button type="button" data-action="open-department" data-department="${e(slot.department)}"
          data-post="${e(slot.key)}" aria-label="${e(`Hierarchie öffnen: ${name}`)}">Hierarchie öffnen</button>` : ''}
        ${person || slot.needsReplacement ? `<button type="button" data-action="clear-post" data-post="${e(slot.key)}" aria-label="${e(`Posten freigeben: ${title}`)}">Freigeben</button>` : ''}
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
      ${target === 'hof' && house.courtScope ? `<a href="${preparationHref(house.courtScope, 'hof', 'hof-hausmacht')}">Hausmacht öffnen ↗</a>`
        : target ? `<a href="${e(href(target))}">${target === 'hof' ? 'Hausmacht öffnen' : 'Kirchliche Ämter öffnen'} ↗</a>` : ''}</dd></div>`;
    }).join('')}</dl>
  </details>`;
}

export function renderPostSection(group, slots, { people, appointmentLinks }, repeated = '') {
  return `<section class="post-group${group.core ? ' is-core' : ''}${group.leadership ? ' is-leadership' : ''}"><header>
    ${officeArtwork(group.icon, 32)}
    <div><h4>${e(group.title)}</h4>
    ${group.description ? `<p>${e(group.description)}</p>` : ''}</div>
  </header>${slots.length ? `<div class="post-grid">${slots.map(slot => renderPost(slot, postOccupant(slot, people), {
    collapseDescription: group.leadership, appointmentLinks,
  })).join('')}</div>` : ''}${repeated}</section>`;
}
