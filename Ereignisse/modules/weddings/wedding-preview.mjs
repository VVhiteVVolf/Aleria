import { createWeddingRepository } from './wedding-repository.mjs';
import { weddingPageHref, WEDDING_STATUS } from './wedding-schema.mjs';
import { weddingText as e, weddingDate, weddingCalendarHref } from './wedding-model.mjs';

// Veröffentlichte Festbücher bleiben in ihrer Registry; der Kalender liest nur ihren Termin.
export function createWeddingPreview({ root, eventsBase, calendar }) {
  if (!root) return { render() {} };
  let entries = [], selectedYear = null;
  const icon = new URL('../../assets/icons/hochzeit.png',import.meta.url).href;
  function render(year = selectedYear) {
    selectedYear = year;
    const visible = entries.filter(entry => ['planning','scheduled'].includes(entry.status) && (!year || !entry.date.year || entry.date.year === year));
    root.innerHTML = `<header><div><p>Die nächsten gemeinsamen Anfänge</p><h2>Hochzeiten in Vorbereitung</h2></div><a href="${e(new URL('hochzeit.html',eventsBase))}">Alle Festbücher ↗</a></header><div class="wedding-preview-list">${visible.map(entry => `<article><a class="wedding-preview-icon" href="${e(new URL(weddingPageHref(entry.id),eventsBase))}" tabindex="-1" aria-hidden="true"><img src="${e(icon)}" alt="" width="62" height="62"></a><div><small>${e(WEDDING_STATUS[entry.status])}</small><h3><a href="${e(new URL(weddingPageHref(entry.id),eventsBase))}">${e(entry.title)}</a></h3><p>${e(weddingDate(entry,calendar))}</p><a class="wedding-preview-calendar" href="${e(weddingCalendarHref(entry,eventsBase))}">${entry.date.year ? 'Termin im Kalender' : 'Zum Kalender'} ↗</a></div></article>`).join('') || '<p>Für diese Auswahl ist noch kein bevorstehendes Hochzeitsfest verzeichnet.</p>'}</div>`;
  }
  root.innerHTML = '<p>Die Festbücher werden geladen …</p>';
  createWeddingRepository({eventsBase}).registry().then(result => { entries = result; render(); }).catch(() => {
    root.innerHTML = `<p>Das Hochzeitsregister konnte gerade nicht geladen werden. <a href="${e(new URL('hochzeit.html',eventsBase))}">Festbücher öffnen ↗</a></p>`;
  });
  return Object.freeze({ render });
}
