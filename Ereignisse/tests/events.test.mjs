import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { EVENTS, EVENT_CHAPTERS } from '../modules/catalog/events-data.mjs';
import { parseEventYear, eventOccursInYear, selectEvents, calendarYearHref, calendarChronicleSelection, formatEventYears, eventHref } from '../modules/catalog/events-model.mjs';
import { renderEventCard, renderEventCatalog } from '../modules/catalog/events-render.mjs';
import { renderCalendarChronicle } from '../../AleriaAlmanach/modules/calendar/calendar-chronicle.mjs';
import { renderCalendarPreview } from '../../AleriaAlmanach/modules/calendar/calendar-preview.mjs';

test('Alle zehn benannten Ereignisse und sechs Kapitel; keine erfundene Reise oder Datierung', () => {
  assert.equal(EVENTS.length, 10);
  assert.equal(EVENT_CHAPTERS.length, 6);
  assert.equal(new Set(EVENTS.map(event => event.id)).size, 10);
  assert.equal(EVENTS.filter(event => event.chapter === 'reisen').length, 0);
  assert.deepEqual(EVENTS.filter(event => event.startYear === null).map(event => event.id), ['seeschlacht-rhonwens-traenen']);
  for (const event of EVENTS) {
    assert.ok(EVENT_CHAPTERS.some(chapter => chapter.id === event.chapter));
    if (event.startYear !== null) assert.ok(event.endYear >= event.startYear);
    assert.equal('start' in event, false);
  }
});

test('Jahresfilter berücksichtigt komplette Zeiträume einschließlich beider Grenzen', () => {
  const war = EVENTS[0];
  for (const year of [1627, 1635, 1647]) assert.ok(eventOccursInYear(war, year));
  for (const year of [1626, 1648, null, '', 'abc']) assert.equal(eventOccursInYear(war, year), false);
  assert.deepEqual(selectEvents({ year: 1720 }).map(event => event.id), ['krieg-um-estryll', 'invasion-von-vennyr', 'aufstieg-der-triarchie', 'ritter-der-tafelrunde']);
  assert.equal(selectEvents({ year: 1733 })[0].duration, 'Ein Tag');
  assert.deepEqual(selectEvents({ year: 1740 }).map(event => event.id), ['hochzeit-bei-gwynthor']);
});

test('Jahresparameter lassen keine Teilzahlen, Exponenten oder unmöglichen Jahre zu', () => {
  for (const value of ['', '0', '-1', '100001', '1717foo', '17.17', '1e3', 'Infinity', null, undefined]) assert.equal(parseEventYear(value), null);
  for (const value of ['1', '1717', '100000']) assert.equal(parseEventYear(value), Number(value));
});

test('Suche kombiniert Namen, Überlieferung und Umlautvarianten mit Kapitel und Jahr', () => {
  assert.equal(selectEvents({ query: 'praetendenten aldrimar' })[0].id, EVENTS[0].id);
  assert.equal(selectEvents({ query: 'BLUTFURST' })[0].id, 'schrecken-von-torrenheim');
  assert.equal(selectEvents({ query: 'Dunkelhain', chapter: 'kriege', year: 1720 }).length, 1);
  assert.equal(selectEvents({ query: 'Dunkelhain', chapter: 'abenteuer' }).length, 0);
});

test('Zeitfolge sortiert ohne Mutation; undatierte Einträge stehen immer am Ende', () => {
  const original = EVENTS.map(event => event.id);
  assert.equal(selectEvents({ order: 'oldest' })[0].startYear, 1627);
  assert.equal(selectEvents({ order: 'newest' })[0].startYear, 1740);
  const undatedCount = EVENTS.filter(event => event.startYear === null).length;
  for (const order of ['oldest', 'newest']) assert.ok(selectEvents({ order }).slice(-undatedCount).every(event => event.startYear === null));
  assert.deepEqual(EVENTS.map(event => event.id), original);
});

test('Kalenderverweise ändern das Ansichtsjahr, ohne Tag oder Weltzeit zu erfinden', () => {
  const today = { year: 1740, month: 3, day: 9 };
  const url = new URL(calendarYearHref(EVENTS[0]), 'https://example.test/Ereignisse/index.html');
  const selection = calendarChronicleSelection(url.searchParams, today);
  assert.equal(url.pathname, '/AleriaAlmanach/kalender.html');
  assert.deepEqual(selection, { selected: { year: 1627, month: 3, day: 9 }, navigated: true, focusId: EVENTS[0].id });
  assert.equal(today.year, 1740);
  assert.equal(calendarYearHref(EVENTS.find(event => event.startYear === null)), null);
  assert.equal(calendarChronicleSelection(new URLSearchParams('year=100001&chronicle=unbekannt'), today).navigated, false);
  assert.equal(calendarChronicleSelection(new URLSearchParams('chronicle=krieg-um-estryll'), today).selected.year, 1719);
  assert.match(eventHref(EVENTS[0].id, 1647), /\?year=1647#ereignis-krieg-der-praetendenten$/);
});

test('Kalenderchronik enthält Zeitkontext und Rückverweise, keine Tages-Terminaktionen', () => {
  const html = renderCalendarChronicle(1720, 'krieg-um-estryll');
  assert.match(html, /is-highlighted/);
  assert.match(html, /Ereignisse im Jahr 1720/);
  assert.match(html, /\?year=1720#ereignis-krieg-um-estryll/);
  assert.doesNotMatch(html, /data-calendar-open|data-calendar-edit|hochzeit-bei-gwynthor/);
  assert.match(renderCalendarChronicle(1740), /hochzeit-bei-gwynthor/);
  assert.match(renderCalendarChronicle(1741), /noch kein historisches Ereignis/);
});

test('Offene Einträge, Dossiers und Ausgabe-Escaping', () => {
  const undated = EVENTS.find(event => event.id === 'seeschlacht-rhonwens-traenen');
  assert.equal(formatEventYears(undated), 'Zeitpunkt offen');
  assert.doesNotMatch(renderEventCard(undated), /kalender.html\?/);
  assert.match(renderEventCard(EVENTS.find(event => event.id === 'hochzeit-bei-gwynthor')), /Hochzeiten\/Haus-Draig-und-Penderyn.html/);
  const linked = renderEventCard(EVENTS[0]);
  assert.match(linked, /class="event-title-link" href="https:\/\/www.animexx.de\/zirkel\/ichbinreiter\/tafel\/\?seite=2021"/);
  assert.match(linked, /class="event-icon-link"/);
  assert.match(linked, /Ereignisseite öffnen · Animexx/);
  assert.doesNotMatch(renderEventCard(EVENTS.find(event => event.id === 'hochzeit-bei-gwynthor')), /href="https:\/\/www.animexx.de/);
  const html = renderEventCard({ ...EVENTS[0], title: '<img src=x onerror=alert(1)>', summary: '<script>x</script>' });
  assert.doesNotMatch(html, /<img src=x|<script>/);
  assert.match(html, /&lt;script&gt;/);
  assert.match(renderEventCatalog([], { chapter: 'reisen' }), /benannter Eintrag liegt bisher nicht vor/);
});

test('Statische Übersicht enthält dieselben Ereignisse und ausschließlich vorhandene lokale Dossiers', async () => {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  assert.equal((html.match(/data-event-id=/g) || []).length, EVENTS.length);
  assert.ok(html.includes(renderEventCatalog()));
  assert.doesNotMatch(html, /\son(?:click|input|change)=/);
  for (const event of EVENTS.filter(entry => entry.articleHref)) await readFile(new URL(`../${event.articleHref}`, import.meta.url));
});

test('Gemeinsame Terminvorschau führt auch von der Ereignisübersicht zur richtigen Kalenderseite', async () => {
  const context = vm.createContext({ console });
  vm.runInContext(await readFile(new URL('../../AleriaAlmanach/modules/core/aleria-calendar.js', import.meta.url), 'utf8'), context);
  const calendar = context.AleriaCalendar;
  const event = { id: 'test & termin', title: 'Audienz', type: 'audience', start: { year: 1740, month: 3, day: 9 }, end: { year: 1740, month: 3, day: 9 } };
  assert.match(renderCalendarPreview(event, { calendar, link: true }), /href="\.\/kalender.html\?event=test%20%26%20termin/);
  assert.match(renderCalendarPreview(event, { calendar, link: true, calendarHref: '../AleriaAlmanach/kalender.html' }), /href="\.\.\/AleriaAlmanach\/kalender.html\?event=/);
  assert.match(renderCalendarPreview({ ...event, articleHref: './dossier.html' }, { calendar, articleBase: 'https://example.test/projekt/AleriaAlmanach/kalender.html' }), /href="https:\/\/example.test\/projekt\/AleriaAlmanach\/dossier.html"/);
});
