import { EVENTS } from '../../../Ereignisse/modules/catalog/events-data.mjs';

// Fest datierte Quellenereignisse sind echte einmalige Kalendereinträge.
// Sie werden aus der Chronik gelesen, nie als Entwurf oder Firebase-Mutation erzeugt.
export function createCalendarArchiveEvents(events = EVENTS) {
  return Object.freeze(events.filter(event => event.startDate).map(event => Object.freeze({
    id: event.id, schemaVersion: 1, title: event.title, type: event.calendarType || 'other',
    start: Object.freeze({ ...event.startDate }), end: Object.freeze({ ...(event.endDate || event.startDate) }),
    startTime: '', endTime: '', recurrence: 'none', location: event.location || '', summary: event.summary,
    icon: `../Ereignisse/assets/icons/${event.icon}.png`, articleHref: event.articleHref ? `../Ereignisse/${event.articleHref}` : '',
    participants: Object.freeze([]), revision: 1, deleted: false, archived: true, experimental: event.experimental === true
  })));
}

export const CALENDAR_ARCHIVE_EVENTS = createCalendarArchiveEvents();
