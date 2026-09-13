import { EVENTS } from '../../../Ereignisse/modules/catalog/events-data.mjs';
import { eventOccursInYear, eventHref, formatEventYears, escapeEventText as e } from '../../../Ereignisse/modules/catalog/events-model.mjs';

// Historische Jahresangaben sind keine Tages-Termine und werden nicht im Store gespeichert.
export function renderCalendarChronicle(year, focusId = null) {
  const events = EVENTS.filter(event => eventOccursInYear(event, year));
  return `<header><div><p class="calendar-eyebrow">Aus der Ereignischronik</p><h2>Ereignisse im Jahr ${e(year)}</h2></div><a href="../Ereignisse/index.html?year=${e(year)}#verzeichnis">Jahr in der Chronik öffnen ↗</a></header>
    <p class="calendar-chronicle-note">Das Ereignisarchiv ordnet die Einträge nach Jahren. Bekannte Tagesdaten und aktuelle Planungen stehen auf den jeweiligen Ereignisseiten.</p>
    <div class="calendar-chronicle-list">${events.map(event => `<article class="calendar-chronicle-entry${event.id === focusId ? ' is-highlighted' : ''}"><small>${e(formatEventYears(event))} · ${e(event.type)}</small><h3><a href="${e(eventHref(event.id, year))}">${e(event.title)}</a></h3>${event.note ? `<p>${e(event.note)}</p>` : ''}</article>`).join('') || '<p class="calendar-help">Für dieses Jahr ist noch kein historisches Ereignis verzeichnet. <a href="../Ereignisse/index.html">Die gesamte Chronik aufschlagen →</a></p>'}</div>`;
}
