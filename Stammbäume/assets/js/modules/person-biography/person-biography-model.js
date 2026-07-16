import { formatAge } from '../../domain/person-presentation.js';

export const PERSON_BIOGRAPHY_EXTENSION_ID = 'biographyModule';
export const PERSON_BIOGRAPHY_SCHEMA = 'aleria.biography-module';
export const PERSON_BIOGRAPHY_SCHEMA_VERSION = 1;

function clampNumber(value, fallback, minimum, maximum) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(minimum, Math.min(maximum, Math.round(parsed)));
}

function normalizeLineArray(value) {
  return Array.isArray(value)
    ? value.map(item => String(item || '').trim()).filter(Boolean)
    : [];
}

function normalizePortraitStages(value) {
  const stages = Array.isArray(value) ? value : [];
  return Array.from({ length: 4 }, (_, index) => String(stages[index] || '').trim());
}

function normalizePairArray(value) {
  return Array.isArray(value)
    ? value.map(item => ({
        title: String(item?.title || '').trim(),
        detail: String(item?.detail || '').trim(),
        icon: String(item?.icon || '').trim()
      })).filter(item => item.title || item.detail || item.icon)
    : [];
}

function normalizeSections(value) {
  return Array.isArray(value)
    ? value.map(item => ({
        position: item?.position === 'afterWorks' ? 'afterWorks' : 'afterIntro',
        mode: item?.mode === 'list' ? 'list' : 'text',
        title: String(item?.title || '').trim(),
        text: String(item?.text || item?.body || '').trim()
      })).filter(item => item.title || item.text).slice(0, 16)
    : [];
}

function normalizeConnectionFormat(value) {
  return ['portrait', 'landscape', 'square'].includes(value) ? value : 'portrait';
}

function normalizeConnections(value) {
  return Array.isArray(value)
    ? value.map(item => {
        if (item?.type === 'heading') {
          return {
            type: 'heading',
            title: String(item.title || item.name || '').trim(),
            detail: String(item.detail || item.text || '').trim()
          };
        }
        return {
          type: 'connection',
          name: String(item?.name || '').trim(),
          detail: String(item?.detail || '').trim(),
          image: String(item?.image || '').trim(),
          imageFormat: normalizeConnectionFormat(item?.imageFormat)
        };
      }).filter(item => item.type === 'heading'
        ? item.title || item.detail
        : item.name || item.detail || item.image)
    : [];
}

function normalizeDocuments(value) {
  return Array.isArray(value)
    ? value.map(item => {
        if (typeof item === 'string') return { icon: '', title: '', text: item.trim(), link: '' };
        return {
          icon: String(item?.icon || item?.image || '').trim(),
          title: String(item?.title || item?.name || '').trim(),
          text: String(item?.text || '').trim(),
          link: String(item?.link || item?.url || item?.href || '').trim()
        };
      }).filter(item => item.icon || item.title || item.text || item.link)
    : [];
}

export function normalizeBiographyData(data = {}) {
  return {
    portraitStages: normalizePortraitStages(data.portraitStages),
    sideWidth: clampNumber(data.sideWidth, 100, 35, 100),
    connectionPortraitHeight: clampNumber(data.connectionPortraitHeight, 68, 44, 140),
    connectionTextOffset: clampNumber(data.connectionTextOffset, 0, 0, 80),
    biographyTitle: String(data.biographyTitle || 'Biografie').trim(),
    biographyText: String(data.biographyText || '').trim(),
    abilitiesTitle: String(data.abilitiesTitle || 'Persönlichkeit').trim(),
    abilities: normalizePairArray(data.abilities),
    extraSections: normalizeSections(data.extraSections),
    historyTitle: String(data.historyTitle || 'Hintergrund').trim(),
    historyText: String(data.historyText || '').trim(),
    worksTitle: String(data.worksTitle || 'Bekannte Werke').trim(),
    works: normalizeLineArray(data.works),
    triviaTitle: String(data.triviaTitle || 'Trivia').trim(),
    trivia: normalizeLineArray(data.trivia),
    quotesTitle: String(data.quotesTitle || 'Zitate').trim(),
    quotes: normalizeLineArray(data.quotes),
    connectionsTitle: String(data.connectionsTitle || 'Verbindungen').trim(),
    connections: normalizeConnections(data.connections),
    documentsTitle: String(data.documentsTitle || 'Eigentum & Besitz').trim(),
    documents: normalizeDocuments(data.documents),
    footer: String(data.footer || '').trim()
  };
}

function normalizeStats(value) {
  return Array.isArray(value)
    ? value.map(item => (
        Array.isArray(item)
          ? [String(item[0] || '').trim(), String(item[1] || '').trim()]
          : [String(item?.label || '').trim(), String(item?.value || '').trim()]
      )).filter(([label, entry]) => label || entry)
    : [];
}

export function normalizePersonBiographyModule(value = {}) {
  return {
    schema: PERSON_BIOGRAPHY_SCHEMA,
    schemaVersion: PERSON_BIOGRAPHY_SCHEMA_VERSION,
    stats: normalizeStats(value.stats),
    quote: String(value.quote || '').trim(),
    quoteBy: String(value.quoteBy || '').trim(),
    biography: normalizeBiographyData(value.biography || value)
  };
}

export function getPersonBiographyModule(person) {
  const stored = person?.extensions?.[PERSON_BIOGRAPHY_EXTENSION_ID];
  return stored && typeof stored === 'object'
    ? normalizePersonBiographyModule(stored)
    : null;
}

export function createPersonBiographyStats(person = {}, house = null) {
  const sex = person.sex === 'female' ? 'Weiblich' : person.sex === 'male' ? 'Männlich' : 'Unbekannt';
  const death = person.death
    || (person.status === 'alive' ? 'Lebend' : person.status === 'missing' ? 'Verschollen' : 'Unbekannt');
  return [
    ['Vollständiger Name', person.name || ''],
    ['Haus', house?.name || ''],
    ['Titel / Anrede', person.title || ''],
    ['Geboren', person.birth || ''],
    ['Geburtsort', ''],
    ['Gestorben', death],
    ['Alter im Jahr 1740', formatAge(person)],
    ['Geschlecht', sex],
    ['Familienstand', ''],
    ['Rang / Stand', ''],
    ['Tätigkeit', ''],
    ['Wohnsitz', '']
  ];
}

export function createPersonBiographyModule(person, house = null) {
  return normalizePersonBiographyModule({
    stats: createPersonBiographyStats(person, house),
    biography: {
      footer: person?.name ? `Personenakte · ${person.name}` : 'Personenakte'
    }
  });
}
