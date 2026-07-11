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

function getSceneTimeDefaultSegmentLabel(segmentIndex = 1) {
  return `Tag ${formatSceneTimeRomanNumeral(segmentIndex)}`;
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
    iconUrl: normalizeSceneTimeIconUrl(preset.iconUrl),
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

function formatSceneClock(totalSeconds, includeDay = true) {
  if (!Number.isFinite(totalSeconds)) return 'Zeit nicht gesetzt';
  const day = Math.floor(totalSeconds / 86400) + 1;
  const seconds = ((Math.floor(totalSeconds) % 86400) + 86400) % 86400;
  const hh = String(Math.floor(seconds / 3600)).padStart(2, '0');
  const mm = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');
  return `${includeDay ? `Tag ${day} · ` : ''}${hh}:${mm}:${ss}`;
}

function buildSceneTimeline(comments = []) {
  let cursor = null;
  return (typeof sortCommentsByTimeline === 'function' ? sortCommentsByTimeline(comments) : comments).map(comment => {
    if (isSceneTimeEventComment(comment)) {
      const event = normalizeSceneTimeEvent(comment.sceneTimeEvent || comment);
      if (Number.isFinite(event.anchorSeconds)) cursor = ((event.anchorDay - 1) * 86400) + event.anchorSeconds;
      return { comment, startSeconds: cursor, endSeconds: cursor, durationSeconds: 0, anchor: true };
    }
    const durationSeconds = getSceneTimeCommentDuration(comment);
    const startSeconds = cursor;
    if (Number.isFinite(cursor)) cursor += durationSeconds;
    return { comment, startSeconds, endSeconds: cursor, durationSeconds, anchor: false };
  });
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
