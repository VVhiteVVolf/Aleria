const SCENE_TIME_EVENT_KIND = 'scene-time-event';
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
    body: normalizeSceneTimeText(input.body || input.text, ''),
    iconMark: normalizeSceneTimeText(input.iconMark, preset.iconMark),
    iconUrl: normalizeSceneTimeIconUrl(preset.iconUrl),
    schemaVersion: 2
  };
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
