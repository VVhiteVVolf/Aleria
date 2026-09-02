const SCENE_TIME_EVENT_KIND = 'scene-time-event';
const SCENE_TIME_DEFAULT_SEGMENT_SECONDS = 5;
const SCENE_TIME_SEGMENT_BREAK_PRESETS = new Set(['next-day', 'time-skip']);

const SCENE_TIME_EVENT_PRESETS = [
  {
    key: 'morning',
    label: 'Morgen',
    title: 'Der Morgen bricht an',
    timeLabel: 'Morgen',
    iconMark: 'M',
    iconUrl: 'https://i.imgur.com/djPd9UD.png',
    theme: 'day'
  },
  {
    key: 'noon',
    label: 'Mittag',
    title: 'Die Sonne steht hoch',
    timeLabel: 'Mittag',
    iconMark: 'S',
    iconUrl: 'https://i.imgur.com/m9ayflu.png',
    theme: 'day'
  },
  {
    key: 'evening',
    label: 'Abend',
    title: 'Der Abend senkt sich',
    timeLabel: 'Abend',
    iconMark: 'A',
    iconUrl: 'https://i.imgur.com/2ldWsPp.png',
    theme: 'dusk'
  },
  {
    key: 'night',
    label: 'Nacht',
    title: 'Die Nacht legt sich ueber die Szene',
    timeLabel: 'Nacht',
    iconMark: 'N',
    iconUrl: 'https://i.imgur.com/VzP9VAA.png',
    theme: 'night'
  },
  {
    key: 'next-day',
    label: 'Naechster Tag',
    title: 'Ein neuer Tag bricht an',
    timeLabel: 'Tagwechsel',
    iconMark: '+',
    iconUrl: 'https://i.imgur.com/EHo0HKi.png',
    theme: 'next-day'
  },
  {
    key: 'time-skip',
    label: 'Zeitsprung',
    title: 'Zeit vergeht',
    timeLabel: 'Zeitsprung',
    iconMark: '>>',
    iconUrl: 'https://i.imgur.com/r1dNxHU.png',
    theme: 'skip'
  },
  {
    key: 'short-rest',
    label: 'Kurze Rast',
    title: 'Eine kurze Rast',
    timeLabel: 'Eine Stunde später',
    iconMark: 'R',
    iconUrl: '../IconOrdner/Buttom Icons/Rasten.png',
    theme: 'rest-short',
    hiddenInTimeDialog: true
  },
  {
    key: 'long-rest',
    label: 'Lange Rast',
    title: 'Eine lange Rast',
    timeLabel: 'Acht Stunden später',
    iconMark: 'R',
    iconUrl: '../IconOrdner/Buttom Icons/Rasten.png',
    theme: 'rest-long',
    hiddenInTimeDialog: true
  }
];

function getSceneTimeEventPresets() {
  return SCENE_TIME_EVENT_PRESETS.map(preset => ({ ...preset }));
}

function getSceneTimeEventPreset(key) {
  return SCENE_TIME_EVENT_PRESETS.find(preset => preset.key === key) || SCENE_TIME_EVENT_PRESETS[0];
}

function isSceneTimeSegmentBreakPreset(presetKey) {
  return SCENE_TIME_SEGMENT_BREAK_PRESETS.has(String(presetKey || '').trim());
}

function formatSceneTimeRomanNumeral(value) {
  let number = Math.max(1, Math.min(3999, Math.floor(Number(value) || 1)));
  const numerals = [
    [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
    [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'],
    [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']
  ];
  let result = '';
  numerals.forEach(([amount, label]) => {
    while (number >= amount) {
      result += label;
      number -= amount;
    }
  });
  return result || 'I';
}

// Ermittelt das Aleria-Kalenderdatum eines Szenentages ueber das Aleria-Startdatum
// der Sitzung (page.sessionDateAleria) + Segment-Index (1 = Starttag, 2 = Starttag+1, ...).
// Ist kein Startdatum fuer diese Szene hinterlegt, gibt es kein Datum zurueck.
function getSceneTimeSegmentAleriaDate(segmentIndex = 1) {
  const thread = typeof getCurrentCommentThread === 'function' ? getCurrentCommentThread() : null;
  const resolved = globalThis.AleriaSceneDateDefaults?.resolve?.(thread);
  const startDate = resolved || (thread?.page ? sanitizeAleriaDate(thread.page.sessionDateAleria) : null);
  if (!startDate || !hasAleriaDate(startDate)) return null;
  const index = Math.max(1, Math.floor(Number(segmentIndex) || 1));
  return index > 1 ? addAleriaDays(startDate, index - 1) : startDate;
}

// Voreingestellte Tagesbeschriftung: bevorzugt den echten Aleria-Wochentagsnamen
// (Lyristag, Ordanstag, ...) des jeweiligen Szenentages; nur wenn der Szene kein
// Aleria-Startdatum hinterlegt ist, faellt es auf die roemische Zaehlung zurueck.
function getSceneTimeDefaultSegmentLabel(segmentIndex = 1) {
  const date = getSceneTimeSegmentAleriaDate(segmentIndex);
  const weekday = date ? getAleriaWeekdayName(date.day) : '';
  return weekday || `Tag ${formatSceneTimeRomanNumeral(segmentIndex)}`;
}

function getSceneTimeEventSegmentLabel(eventInput = {}, segmentIndex = 1) {
  const event = normalizeSceneTimeEvent(eventInput);
  return normalizeSceneTimeText(
    event.segmentLabel || event.dayLabel,
    getSceneTimeDefaultSegmentLabel(segmentIndex)
  );
}

function normalizeSceneTimeText(value, fallback = '') {
  const text = String(value || '').trim();
  return text || fallback;
}

function normalizeSceneTimeIconUrl(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  if (typeof sanitizeImageSrc === 'function') return sanitizeImageSrc(raw) ? raw : '';
  return /^https?:\/\//i.test(raw) ? raw : '';
}

function normalizeSceneTimeEvent(input = {}) {
  const preset = getSceneTimeEventPreset(input.presetKey || input.preset || '');
  const describedAnchorSeconds = normalizeSceneTimeAnchorSeconds(
    null,
    [input.timeLabel, input.body, input.text, input.title].filter(Boolean).join(' ')
  );
  const storedAnchorSeconds = normalizeSceneTimeAnchorSeconds(input.anchorSeconds, input.anchorTime);
  const segmentBreak = input.segmentBreak != null
    ? !!input.segmentBreak
    : isSceneTimeSegmentBreakPreset(preset.key);
  return {
    kind: SCENE_TIME_EVENT_KIND,
    presetKey: preset.key,
    theme: input.theme || preset.theme,
    title: normalizeSceneTimeText(input.title, preset.title),
    dayLabel: normalizeSceneTimeText(input.dayLabel, ''),
    segmentBreak,
    segmentLabel: normalizeSceneTimeText(input.segmentLabel, input.dayLabel || ''),
    timeLabel: normalizeSceneTimeText(input.timeLabel, preset.timeLabel),
    anchorDay: Math.max(1, Math.floor(Number(input.anchorDay) || 1)),
    anchorSeconds: Number.isFinite(describedAnchorSeconds) ? describedAnchorSeconds : storedAnchorSeconds,
    body: normalizeSceneTimeText(input.body || input.text, ''),
    iconMark: normalizeSceneTimeText(input.iconMark, preset.iconMark),
    iconUrl: normalizeSceneTimeIconUrl(input.iconUrl || preset.iconUrl),
    schemaVersion: 3
  };
}

function normalizeSceneTimeAnchorSeconds(value, fallback = '') {
  const numeric = value !== null && value !== undefined && value !== '' ? Number(value) : NaN;
  if (Number.isFinite(numeric)) return Math.max(0, Math.min(86399, Math.floor(numeric)));
  const match = String(fallback || '').match(/(?:^|\s)([01]?\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?/);
  if (!match) return null;
  return (Number(match[1]) * 3600) + (Number(match[2]) * 60) + Number(match[3] || 0);
}

function normalizeSceneTimeDurationSeconds(value) {
  const seconds = Number(value);
  return Number.isFinite(seconds) ? Math.max(0, Math.min(86400, Math.round(seconds))) : SCENE_TIME_DEFAULT_SEGMENT_SECONDS;
}

function getSceneTimeSegmentDuration(segment = {}) {
  return normalizeSceneTimeDurationSeconds(segment.durationSeconds);
}

function getSceneTimeCommentDuration(comment = {}) {
  if (isSceneTimeEventComment(comment)) return 0;
  const segments = Array.isArray(comment.commentSegments)
    ? comment.commentSegments.filter(segment => String(segment?.text || '').trim())
    : [];
  if (segments.length) return segments.reduce((sum, segment) => sum + getSceneTimeSegmentDuration(segment), 0);
  const mode = String(comment.commentMode || (comment.narrator ? 'narrator' : 'character'));
  if (!['character', 'charakter', 'manual', 'narrator'].includes(mode)) return 0;
  return String(comment.text || '').trim() ? SCENE_TIME_DEFAULT_SEGMENT_SECONDS : 0;
}

function getSceneDayFromSeconds(totalSeconds) {
  if (!Number.isFinite(totalSeconds)) return 1;
  return Math.floor(totalSeconds / 86400) + 1;
}

function formatSceneClock(totalSeconds, includeDay = true) {
  if (!Number.isFinite(totalSeconds)) return 'Zeit nicht gesetzt';
  const day = getSceneDayFromSeconds(totalSeconds);
  const seconds = ((Math.floor(totalSeconds) % 86400) + 86400) % 86400;
  const hh = String(Math.floor(seconds / 3600)).padStart(2, '0');
  const mm = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');
  return `${includeDay ? `Tag ${day} · ` : ''}${hh}:${mm}:${ss}`;
}

function buildSceneTimeline(comments = []) {
  let cursor = null;
  let aleriaDayIndex = 1;
  return (typeof sortCommentsByTimeline === 'function' ? sortCommentsByTimeline(comments) : comments).map(comment => {
    if (isSceneTimeEventComment(comment)) {
      const event = normalizeSceneTimeEvent(comment.sceneTimeEvent || comment);
      const previousClockDay = Number.isFinite(cursor) ? getSceneDayFromSeconds(cursor) : null;
      if (Number.isFinite(event.anchorSeconds)) cursor = ((event.anchorDay - 1) * 86400) + event.anchorSeconds;
      const currentClockDay = Number.isFinite(cursor) ? getSceneDayFromSeconds(cursor) : previousClockDay;

      // Die numerische Szenenuhr darf vor- oder zurueckgesetzt werden, ohne dadurch
      // stillschweigend das Welt-Datum zu veraendern. Nur ein ausdruecklicher
      // Tages-/Segmentwechsel schreibt einen neuen Aleria-Kalendertag fest.
      if (isSceneTimeSegmentBreakEvent(event) && Number.isFinite(currentClockDay)) {
        const elapsedClockDays = previousClockDay == null
          ? Math.max(0, currentClockDay - 1)
          : Math.max(1, currentClockDay - previousClockDay);
        aleriaDayIndex += elapsedClockDays;
      }
      return {
        comment,
        startSeconds: cursor,
        endSeconds: cursor,
        durationSeconds: 0,
        anchor: true,
        aleriaDayIndex,
        aleriaEndDayIndex: aleriaDayIndex
      };
    }
    const durationSeconds = getSceneTimeCommentDuration(comment);
    const startSeconds = cursor;
    const startClockDay = Number.isFinite(startSeconds) ? getSceneDayFromSeconds(startSeconds) : null;
    const entryAleriaDayIndex = aleriaDayIndex;
    if (Number.isFinite(cursor)) {
      cursor += durationSeconds;
      const endClockDay = getSceneDayFromSeconds(cursor);
      if (Number.isFinite(startClockDay) && endClockDay > startClockDay) {
        aleriaDayIndex += endClockDay - startClockDay;
      }
    }
    return {
      comment,
      startSeconds,
      endSeconds: cursor,
      durationSeconds,
      anchor: false,
      aleriaDayIndex: entryAleriaDayIndex,
      aleriaEndDayIndex: aleriaDayIndex
    };
  });
}

// Liefert den Aleria-Kalendertag am Ende der vorhandenen Zeitlinie. Ein optionaler
// spaeterer Uhrentag wird nur um die tatsaechlich noch vergehenden Tage addiert.
// So verwenden Anzeige, Rast und Tagesressourcen dieselbe Tagesdefinition.
function getSceneAleriaDayIndex(comments = [], targetClockDay = null) {
  const timeline = buildSceneTimeline(comments);
  const lastTimedEntry = [...timeline].reverse().find(entry => Number.isFinite(entry?.endSeconds));
  if (!lastTimedEntry) return 1;
  const currentAleriaDay = Math.max(1, Math.floor(Number(lastTimedEntry.aleriaEndDayIndex) || 1));
  const requestedClockDay = Math.floor(Number(targetClockDay));
  if (!Number.isFinite(requestedClockDay)) return currentAleriaDay;
  const currentClockDay = getSceneDayFromSeconds(lastTimedEntry.endSeconds);
  return currentAleriaDay + Math.max(0, requestedClockDay - currentClockDay);
}

// Liest den Zeitcursor direkt NACH einem bestehenden Beitrag - damit ein
// rueckwirkend eingefuegter Tag-Marker (scene-time-events.js) die bisherige
// Zeitrechnung nicht verschiebt, sondern genau dort weitermacht, wo sie war.
function getSceneTimelineCursorAfterComment(comments, commentId) {
  const sorted = typeof sortCommentsByTimeline === 'function' ? sortCommentsByTimeline(comments) : comments;
  const index = sorted.findIndex(comment => String(comment?.id || '') === String(commentId));
  if (index < 0) return 0;
  const timeline = buildSceneTimeline(sorted.slice(0, index + 1));
  const lastEntry = timeline[timeline.length - 1];
  return Number.isFinite(lastEntry?.endSeconds) ? lastEntry.endSeconds : 0;
}

function isSceneTimeSegmentBreakEvent(input = {}) {
  const event = normalizeSceneTimeEvent(input?.sceneTimeEvent || input || {});
  return !!event.segmentBreak || isSceneTimeSegmentBreakPreset(event.presetKey);
}

function isSceneTimeEventComment(comment) {
  return !!(
    comment?.sceneTimeEvent ||
    comment?.commentKind === SCENE_TIME_EVENT_KIND ||
    comment?.commentMode === 'scene-time'
  );
}
