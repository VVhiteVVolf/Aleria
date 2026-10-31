import { PROJECT_FONTS } from '../../../../AleriaAlmanach/DokumentenWerkstatt/js/fonts/font-catalog.js';

export const NOTICE_HANDWRITING = Object.freeze([
  ['patrickhand', 'Klare Handschrift', 'Patrick Hand'],
  ['kalam', 'Ruhige Alltagshand', 'Kalam'],
  ['caveat', 'Flüchtige Notiz', 'Caveat'],
  ['dancingscript', 'Elegante Schreibschrift', 'Dancing Script'],
  ['labelleaurore', 'Unregelmäßige Feder', 'La Belle Aurore'],
  ['bethellen', 'Krakelige Handschrift', 'Beth Ellen'],
  ['schoolbell', 'Unbeholfene Druckschrift', 'Schoolbell'],
  ['monsieurladoulaise', 'Wilde Schnörkel · schwer lesbar', 'Monsieur La Doulaise'],
].map(([id, label, family]) => Object.freeze({ id, label, family,
  url: new URL(`../../../../Fonts/Handwriting/${id}/regular.ttf`, import.meta.url).href })));

const workshopFamilies = { arcane: 'Aleria Arcana', rheunwaith: 'Rheunwaith', karnrith: 'Karnrith Hochschnitt',
  infernal: 'Nharazim', kanaanith: 'Kanaanith Monumental', argenti: 'Lingua Argenti Monumental', stoicheia: 'Stoicheia Polis', faehrtenlaut: 'Faehrtenlaut' };
const extraSources = {
  laerelis: '../../../../AleriaAlmanach/modules/language/laerelis/assets/LaerelisLichtfluss-Regular.woff',
  runic: '../../../../Fonts/Noto-Historic-Scripts/NotoSansRunic-Regular.ttf',
  ogham: '../../../../Fonts/Noto-Historic-Scripts/NotoSansOgham-Regular.ttf',
  hieroglyphs: '../../../../Fonts/Noto-Historic-Scripts/NotoSansEgyptianHieroglyphs-Regular.ttf',
};
const dependencies = {
  rheunwaith: ['../../../../Fonts/Rheunwaith-Font-1.000/rheunwaith.js?v=2-gezeiten'],
  karnrith: ['../../../../Fonts/Karnrith-Font-2.000/karnrith.js?v=3'],
  laerelis: ['../../../../AleriaAlmanach/modules/language/laerelis/laerelis-data.js?v=20260919-laerelis-v1',
    '../../../../AleriaAlmanach/modules/language/laerelis/laerelis-script.js?v=20260919-laerelis-v1'],
};

export function noticeLanguageFonts(entries = {}) {
  return Object.entries(entries).map(([id, script]) => ({ id, label: script.label, family: script.cssFamily,
    direction: script.direction || 'ltr',
    url: PROJECT_FONTS.find(font => font.family === workshopFamilies[id])?.url || (extraSources[id] ? new URL(extraSources[id], import.meta.url).href : ''),
    dependencies: (dependencies[id] || []).map(path => new URL(path, import.meta.url).href),
  })).filter(font => font.url);
}

export function normalizeNoticeTypography(value, languages = []) {
  const source = value && typeof value === 'object' ? value : {};
  const fonts = new Set(['template', ...NOTICE_HANDWRITING.map(font => font.id)]);
  return {
    font: fonts.has(source.font) ? source.font : 'template',
    heading: source.heading === 'inherit' || fonts.has(source.heading) ? source.heading : 'inherit',
    script: languages.some(language => language.id === source.script) ? source.script : 'common',
  };
}
