import { EVENT_CHAPTERS, EVENTS } from './events-data.mjs';
import { escapeEventText as e, formatEventYears, calendarYearHref, eventDossier } from './events-model.mjs';

const staticIconHref = icon => `./assets/icons/${icon}.png`;

export function renderEventCard(event, { iconHref = staticIconHref } = {}) {
  const chapter = EVENT_CHAPTERS.find(item => item.id === event.chapter);
  const firstStop = event.summary.indexOf('. ');
  const lead = firstStop < 0 ? event.summary : event.summary.slice(0, firstStop + 1);
  const rest = firstStop < 0 ? '' : event.summary.slice(firstStop + 2);
  const calendarLink = calendarYearHref(event);
  const dossier = eventDossier(event);
  const icon = `<img class="event-icon" src="${e(iconHref(event.icon))}" alt="" width="100" height="100" loading="lazy" decoding="async">`;
  return `<article class="event-card" id="ereignis-${e(event.id)}" data-event-id="${e(event.id)}" data-event-chapter="${e(event.chapter)}" tabindex="-1">
    <div class="event-date">${dossier ? `<a class="event-icon-link" href="${e(dossier.href)}" aria-label="${e(event.title)} – ${e(dossier.label)}">${icon}</a>` : icon}<div class="event-dateline"><strong>${e(formatEventYears(event))}</strong><small>${e(event.duration || (event.startYear === null ? 'Noch nicht datiert' : 'Dauer offen'))}</small></div></div>
    <div class="event-copy"><p class="events-eyebrow">${e(chapter.title)} <span aria-hidden="true">/</span> ${e(event.type)}</p><h3>${dossier ? `<a class="event-title-link" href="${e(dossier.href)}">${e(event.title)}</a>` : e(event.title)}</h3>
      ${event.note ? `<p class="event-note">${e(event.note)}</p>` : ''}
      ${lead ? `<p class="event-lead">${e(lead)}</p>` : '<p class="event-unwritten">Die ausführliche Überlieferung ist noch nicht niedergeschrieben.</p>'}
      ${rest ? `<details class="event-story"><summary>Überlieferung weiterlesen</summary><p>${e(rest)}</p></details>` : ''}
      <footer class="event-actions">${dossier ? `<a class="event-dossier-link" href="${e(dossier.href)}">${e(dossier.label)} ↗</a>` : '<span class="event-dossier-note">Ereignisseite folgt</span>'}
      ${calendarLink ? `<a href="${e(calendarLink)}">${event.startYear === event.endYear ? 'Jahr' : 'Beginn'} im Kalender ↗</a>${event.endYear !== event.startYear ? `<a href="${e(calendarYearHref(event, event.endYear))}">Ende im Kalender ↗</a>` : ''}` : '<span>Kalenderverweis folgt mit der Datierung.</span>'}</footer>
    </div>
  </article>`;
}

export function renderEventCatalog(events = EVENTS, { order = 'chapters', chapter = 'all', query = '', year = null, iconHref = staticIconHref } = {}) {
  if (!events.length && chapter !== 'reisen') return '<div class="events-empty"><span aria-hidden="true">⌕</span><h3>Keine Spur unter diesem Namen.</h3><p>Versucht einen anderen Begriff oder öffnet wieder die gesamte Chronik.</p><button class="events-button" type="button" data-action="reset-events">Alle Ereignisse anzeigen</button></div>';
  if (order !== 'chapters') return `<div class="events-timeline">${events.map(event => renderEventCard(event, { iconHref })).join('') || renderTravelPlaceholder(iconHref)}</div>`;
  return EVENT_CHAPTERS.filter(item => chapter === 'all' || chapter === item.id).map(item => {
    const entries = events.filter(event => event.chapter === item.id);
    if (!entries.length && !(item.id === 'reisen' && (!query && year === null || chapter === 'reisen'))) return '';
    return `<section class="events-chapter" id="kapitel-${item.id}" aria-labelledby="chapter-${item.id}"><header class="events-chapter-heading"><span aria-hidden="true">${item.numeral}</span><div><p class="events-eyebrow">${e(item.subtitle)}</p><h2 id="chapter-${item.id}">${e(item.title)}</h2><p>${e(item.description)}</p></div><small>${String(entries.length).padStart(2, '0')}</small></header>${entries.map(event => renderEventCard(event, { iconHref })).join('') || renderTravelPlaceholder(iconHref)}</section>`;
  }).join('');
}

function renderTravelPlaceholder(iconHref) {
  const chapter = EVENT_CHAPTERS.find(item => item.id === 'reisen');
  return `<div class="events-unwritten"><img class="event-icon" src="${e(iconHref(chapter.icon))}" alt="" width="100" height="100" loading="lazy" decoding="async"><div><h3>Der nächste Weg ist noch offen.</h3><p>Für Reisen ist ein Kapitel reserviert. Ein benannter Eintrag liegt bisher nicht vor.</p></div></div>`;
}

export function renderChapterRegister() {
  return EVENT_CHAPTERS.map(chapter => `<a href="#kapitel-${chapter.id}" data-action="select-chapter" data-chapter="${chapter.id}"><span>${chapter.numeral}</span><strong>${e(chapter.title)}</strong><small>${EVENTS.filter(event => event.chapter === chapter.id).length || '—'}</small></a>`).join('');
}
