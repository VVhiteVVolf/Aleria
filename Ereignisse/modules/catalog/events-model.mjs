import { EVENTS, EVENT_CHAPTERS } from './events-data.mjs';

export const escapeEventText = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));

export function parseEventYear(value) {
  if (!/^\d{1,6}$/.test(String(value ?? ''))) return null;
  const year = Number(value);
  return year >= 1 && year <= 100000 ? year : null;
}

export function eventOccursInYear(event, year) {
  const selected = parseEventYear(year), start = parseEventYear(event.startYear), end = parseEventYear(event.endYear) ?? start;
  return selected !== null && start !== null && start <= selected && selected <= end;
}

export function formatEventYears(event) {
  if (event.startYear === null) return 'Zeitpunkt offen';
  return event.endYear && event.endYear !== event.startYear ? `${event.startYear}–${event.endYear}` : `Jahr ${event.startYear}`;
}

const searchText = value => String(value).toLocaleLowerCase('de').normalize('NFD').replace(/\p{M}/gu, '').replace(/ß/g, 'ss').replace(/ae/g, 'a').replace(/oe/g, 'o').replace(/ue/g, 'u');

export function selectEvents({ query = '', chapter = 'all', year = null, order = 'chapters' } = {}, events = EVENTS) {
  const terms = searchText(query).trim().split(/\s+/).filter(Boolean);
  const selected = events.filter(event => {
    if (chapter !== 'all' && event.chapter !== chapter) return false;
    if (year !== null && !eventOccursInYear(event, year)) return false;
    const haystack = searchText([event.title, event.summary, event.type, event.note, event.startYear, event.endYear, EVENT_CHAPTERS.find(item => item.id === event.chapter)?.title].join(' '));
    return terms.every(term => haystack.includes(term));
  });
  if (order === 'oldest' || order === 'newest') selected.sort((a, b) => {
    if (a.startYear === null) return b.startYear === null ? 0 : 1;
    if (b.startYear === null) return -1;
    return (a.startYear - b.startYear) * (order === 'newest' ? -1 : 1);
  });
  return selected;
}

export function calendarYearHref(event, year = event.startYear) {
  const validYear = parseEventYear(year);
  return validYear === null ? null : `../AleriaAlmanach/kalender.html?year=${validYear}&chronicle=${encodeURIComponent(event.id)}#chronik`;
}

export function eventHref(id, year = null) {
  const selected = parseEventYear(year);
  return `../Ereignisse/index.html${selected === null ? '' : `?year=${selected}`}#ereignis-${encodeURIComponent(id)}`;
}

export function eventDossier(event) {
  if (event.articleHref) return { href: event.articleHref, label: 'Ereignisseite öffnen' };
  if (event.sourceHref) return { href: event.sourceHref, label: 'Ereignisseite öffnen · Animexx' };
  return null;
}

// Ein Jahresverweis wechselt nur das betrachtete Jahr, niemals das Welt-/Tagesdatum.
export function calendarChronicleSelection(params, current) {
  const entry = EVENTS.find(event => event.id === params.get('chronicle'));
  const year = parseEventYear(params.get('year')) ?? parseEventYear(entry?.startYear);
  const selected = year === null ? { ...current } : { ...current, year };
  const month = Number(params.get('month')), day = Number(params.get('date'));
  if (year !== null && Number.isInteger(month) && month >= 1 && month <= 13) {
    selected.month = month;
    if (Number.isInteger(day) && day >= 1 && day <= 36) selected.day = day;
  }
  return { selected, navigated: year !== null,
    focusId: entry && eventOccursInYear(entry, year) ? entry.id : null };
}
