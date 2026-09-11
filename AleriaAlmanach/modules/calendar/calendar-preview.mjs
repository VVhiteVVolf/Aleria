import { CALENDAR_TEMPLATES } from './calendar-events-model.mjs';
import { escapeCalendarText as e } from './calendar-date-picker.mjs';

export function safeCalendarUrl(value) {
  const raw = String(value || '').trim();
  if (!/^(https?:\/\/|\.{0,2}\/)/i.test(raw) || /^\/\/|\\/.test(raw)) return '';
  try { return ['http:', 'https:'].includes(new URL(raw, 'https://aleria.invalid/').protocol) ? e(raw) : ''; } catch { return ''; }
}

export function renderCalendarParticipants(people = []) {
  return people.map(person => `<span class="calendar-person"><img src="${safeCalendarUrl(person.portrait) || '../IconOrdner/Siluetten/Unbekannt.png'}" alt="" loading="lazy"><span>${e(person.name)}</span></span>`).join('');
}

export function renderCalendarPreview(event, { calendar = globalThis.AleriaCalendar, compact = false, link = false, collision = false } = {}) {
  const template = CALENDAR_TEMPLATES.find(item => item.id === event.type) || CALENDAR_TEMPLATES.at(-1);
  const delta = calendar.ordinal(event.start) - calendar.ordinal(calendar.current());
  const relative = delta === 0 ? 'Heute' : delta === 1 ? 'Morgen' : delta < 0 ? 'Läuft bereits' : `In ${delta} Tagen`;
  const range = calendar.ordinal(event.start) === calendar.ordinal(event.end)
    ? calendar.format(event.start, { withWeekday: false })
    : `${calendar.format(event.start, { withWeekday: false })} – ${calendar.format(event.end, { withWeekday: false })}`;
  const occurrenceDay = calendar.ordinal(event.start);
  const title = link ? `<a href="./kalender.html?event=${encodeURIComponent(event.id)}&amp;day=${occurrenceDay}">${e(event.title)}</a>`
    : `<button type="button" data-calendar-open="${e(event.id)}" data-calendar-occurrence="${occurrenceDay}">${e(event.title)}</button>`;
  return `<article class="calendar-preview" data-calendar-type="${e(template.id)}">
    <img class="calendar-preview-icon" src="${safeCalendarUrl(event.icon) || `../IconOrdner/${e(template.icon)}`}" alt="" loading="lazy">
    <div class="calendar-preview-copy"><div class="calendar-preview-kicker">${e(template.name)} · ${e(relative)}${event.localOnly || event.source?.localOnly ? ' · Lokal' : ''}</div>
    <h3>${title}</h3><p class="calendar-preview-meta">${e(range)}${event.startTime ? ` · ${e(event.startTime)}–${e(event.endTime)} Uhr` : ' · Ganztägig'}${event.location ? ` · ${e(event.location)}` : ''}</p>
    ${event.summary ? `<p>${e(compact && event.summary.length > 160 ? `${event.summary.slice(0, 157)}…` : event.summary)}</p>` : ''}
    ${event.participants?.length ? `<div class="calendar-participants">${renderCalendarParticipants(compact ? event.participants.slice(0, 4) : event.participants)}${compact && event.participants.length > 4 ? `<span>+${event.participants.length - 4}</span>` : ''}</div>` : ''}
    ${collision ? '<small class="calendar-conflict">Zeitgleich mit einem weiteren Termin</small>' : ''}
    ${safeCalendarUrl(event.articleHref) ? `<a href="${safeCalendarUrl(event.articleHref)}">Dossier öffnen →</a>` : ''}
    </div></article>`;
}

export function bindCalendarImageFallback(root) {
  const listener = event => {
    if (!(event.target instanceof HTMLImageElement) || event.target.dataset.calendarFallback) return;
    event.target.dataset.calendarFallback = 'true';
    event.target.src = '../IconOrdner/Siluetten/Unbekannt.png';
  };
  root.addEventListener('error', listener, true);
  return () => root.removeEventListener('error', listener, true);
}
