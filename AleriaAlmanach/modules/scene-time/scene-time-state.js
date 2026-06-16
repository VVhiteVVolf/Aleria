const SCENE_TIME_EVENT_KIND = 'scene-time-event';

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
  return {
    kind: SCENE_TIME_EVENT_KIND,
    presetKey: preset.key,
    theme: input.theme || preset.theme,
    title: normalizeSceneTimeText(input.title, preset.title),
    dayLabel: normalizeSceneTimeText(input.dayLabel, ''),
    timeLabel: normalizeSceneTimeText(input.timeLabel, preset.timeLabel),
    body: normalizeSceneTimeText(input.body || input.text, ''),
    iconMark: normalizeSceneTimeText(input.iconMark, preset.iconMark),
    iconUrl: normalizeSceneTimeIconUrl(preset.iconUrl),
    schemaVersion: 1
  };
}

function isSceneTimeEventComment(comment) {
  return !!(
    comment?.sceneTimeEvent ||
    comment?.commentKind === SCENE_TIME_EVENT_KIND ||
    comment?.commentMode === 'scene-time'
  );
}
