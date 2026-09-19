import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import { renderCalendarMonth } from '../modules/calendar/calendar-date-picker.mjs';
import { getSceneRecoveryDayKey } from '../modules/scene-time/scene-recovery-day.js';
import { recoverDailyCombatResources } from '../modules/combat/combat-action-economy.js';

const date = day => ({ year: 1740, month: 3, day });
function load(additions = {}) {
  const context = vm.createContext({
    console, escapeHtml: String, sortCommentsByTimeline: comments => comments, ...additions
  });
  for (const name of ['core/aleria-calendar.js', 'scene-time/scene-time-state.js', 'scene-time/scene-time-ui.js']) {
    vm.runInContext(readFileSync(new URL(`../modules/${name}`, import.meta.url), 'utf8'), context);
  }
  return context;
}
function marker(anchorDay = 1, anchorSeconds = 32400) {
  return {
    id: 'morning', serverCommitted: true, mechanicalAudit: true,
    commentMode: 'scene-time', sceneTimeEvent: { presetKey: 'morning', anchorDay, anchorSeconds, segmentBreak: false }
  };
}
function clockElements() {
  const nodes = { '[data-scene-clock-value]': { textContent: '' }, '[data-scene-clock-date]': { textContent: '' } };
  return { nodes, root: { querySelector: selector => nodes[selector] } };
}

test('Playtage beginnen fest am 9. Lichtkehr und laufen über Monats- und Jahresgrenzen weiter', () => {
  const { AleriaCalendar: calendar } = load();
  assert.deepEqual([9, 10, 11].map(day => calendar.playDay(date(day))), [1, 2, 3]);
  assert.equal(calendar.playDay({ year: 1740, month: 4, day: 1 }), 29);
  const yearEnd = { year: 1740, month: 13, day: 36 };
  assert.equal(calendar.playDay(calendar.shift(yearEnd, 1)), calendar.playDay(yearEnd) + 1);
  assert.ok(Object.isFrozen(calendar.playStartDate));
  assert.equal(calendar.playDay({}), null);
  assert.equal(calendar.playDayLabel({}), '');
});

test('Vergangenheit liegt stets vor dem Playbeginn, auch wenn das aktuelle Weltdatum zurückgestellt wird', () => {
  let today = date(20);
  const context = load({ AleriaWorldDateStore: { getState: () => ({ date: today }) } });
  assert.equal(context.AleriaCalendar.playDayLabel(date(9)), 'Tag 1');
  today = date(1);
  assert.equal(context.AleriaCalendar.playDayLabel(date(10)), 'Tag 2');
  assert.equal(context.getAleriaDateEra(date(8)), 'past');
  for (const value of [date(8), { year: 1739, month: 13, day: 36 }]) {
    assert.match(context.AleriaCalendar.format(value, { withPlayDay: true }), /^Vergangenheit · /);
    assert.doesNotMatch(context.buildAleriaDateBadge(value), /Tag 0|Tag -/);
  }
});

test('Lehrsaal, Brunnenplatz und Trainingsplatz zeigen dasselbe Datum als Tag 2 trotz unterschiedlicher Szenenuhren', () => {
  const context = load();
  for (const clockDay of [1, 2]) {
    const comments = [marker(clockDay)];
    const before = JSON.stringify(comments);
    const timeline = context.buildSceneTimeline(comments);
    const { nodes, root } = clockElements();
    context.updateSceneClockTimeline(root, date(10), timeline.at(-1));
    assert.equal(nodes['[data-scene-clock-value]'].textContent, 'Tag 2 · 09:00:00');
    assert.match(nodes['[data-scene-clock-date]'].textContent, /10\. Lichtkehr 1740/);
    assert.equal(JSON.stringify(comments), before);

    // Display-only numbering must not become a different recovery period.
    const key = getSceneRecoveryDayKey('duel', comments);
    assert.equal(key, `scene:duel:day-${clockDay}`);
    const spent = [{ id: 'special-action', current: 0, maximum: 2, recovery: 'day', recoveryDayKey: key }];
    assert.equal(recoverDailyCombatResources(spent, key)[0].current, 0);
  }
});

test('Mitternacht erhöht Datum und Playtag; historische Szenen werden als Vergangenheit angezeigt', () => {
  const context = load();
  const { nodes, root } = clockElements();
  const timeline = context.buildSceneTimeline([marker(1, 86398), { commentMode: 'character', text: 'Fünf Sekunden.' }]);
  context.updateSceneClockTimeline(root, date(10), timeline.at(-1));
  assert.equal(nodes['[data-scene-clock-value]'].textContent, 'Tag 3 · 00:00:03');
  assert.match(nodes['[data-scene-clock-date]'].textContent, /11\. Lichtkehr 1740/);
  context.updateSceneClockTimeline(root, date(8), context.buildSceneTimeline([marker()]).at(-1));
  assert.equal(nodes['[data-scene-clock-value]'].textContent, 'Vergangenheit · 09:00:00');
  context.updateSceneClockTimeline(root, date(10), null);
  assert.equal(nodes['[data-scene-clock-value]'].textContent, 'Tag 2 · Zeit nicht gesetzt');
  context.updateSceneClockTimeline(root, null, context.buildSceneTimeline([marker()]).at(-1));
  assert.equal(nodes['[data-scene-clock-value]'].textContent, 'Szenentag 1 · 09:00:00');
});

test('Beitragszeiten, Datumsmarkierungen und Kalender zeigen die gemeinsame Playzählung', () => {
  const context = load();
  const entry = { startSeconds: 32400, endSeconds: 32405, durationSeconds: 5, aleriaDate: date(10), aleriaPageInDay: 1 };
  assert.match(context.renderSceneCommentTime(entry), /Tag 2 · .*10\. Lichtkehr 1740 · Seite 1/);
  assert.match(context.buildAleriaDateBadge(date(11)), /Tag 3 · .*11\. Lichtkehr/);
  const calendar = renderCalendarMonth(date(10), { calendar: context.AleriaCalendar });
  assert.match(calendar, /data-calendar-day="8" title="Vergangenheit · /);
  assert.match(calendar, /data-calendar-day="9" title="Tag 1 · /);
  assert.match(calendar, /data-calendar-day="10" title="Tag 2 · /);
});

test('die Weltanzeige folgt dem gewählten Datum, ohne den Playbeginn zu verschieben', () => {
  const label = { textContent: '' };
  let today = date(10);
  const context = load({
    document: { querySelector: selector => selector === '[data-world-date-label]' ? label : null },
    AleriaWorldDateStore: { getState: () => ({ date: today }) }
  });
  for (const name of ['world-date-model.js', 'world-date-ui.js']) {
    vm.runInContext(readFileSync(new URL(`../modules/world-date/${name}`, import.meta.url), 'utf8'), context);
  }
  for (const [day, expected] of [[10, 'Tag 2'], [11, 'Tag 3'], [8, 'Vergangenheit'], [9, 'Tag 1']]) {
    today = date(day);
    context.AleriaWorldDateUI.renderSidebar();
    assert.ok(label.textContent.startsWith(`${expected} · `));
  }
});

test('gespeicherte Datumsmarker behalten ihr Datum und ergänzen den passenden Playtag', () => {
  const context = load({ sanitizeImageSrc: String, parseCommentMarkup: String });
  const event = { ...marker().sceneTimeEvent, calendarDate: date(10), calendarDay: 1, dayLabel: '10. Lichtkehr 1740' };
  assert.match(context.renderSceneTimeEventBlock(event), /Tag 2 · 10\. Lichtkehr 1740/);
  assert.match(context.getSceneTimeEventSegmentLabel({ ...event, dayLabel: '' }), /^Tag 2 · /);
  assert.equal(event.calendarDay, 1);
  assert.equal(event.anchorDay, 1);
});
