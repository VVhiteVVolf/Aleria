const BIOGRAPHY_SCHEMA = 'aleria.biography-module';

function text(value, maximum = 12000) {
  return typeof value === 'string' ? value.trim().slice(0, maximum) : '';
}

function integer(value, fallback, minimum, maximum) {
  const parsed = Number(value);
  return Number.isFinite(parsed)
    ? Math.max(minimum, Math.min(maximum, Math.round(parsed)))
    : fallback;
}

function image(value) {
  const source = text(value, 4000);
  if (!source) return '';
  if (/^(?:assets\/images\/|\.{0,2}\/)/.test(source)) return source;
  try {
    const url = new URL(source);
    return url.protocol === 'https:' ? url.href : '';
  } catch {
    return '';
  }
}

function link(value) {
  const source = text(value, 4000);
  if (!source || /^(?:javascript|data|vbscript):/i.test(source)) return '';
  if (/^(?:\.{0,2}\/|\/)(?!\/)/.test(source)) return source;
  try {
    const url = new URL(source);
    return url.protocol === 'https:' ? url.href : '';
  } catch {
    return '';
  }
}

function list(value, maximum = 64) {
  return Array.isArray(value)
    ? value.map(item => text(item, 4000)).filter(Boolean).slice(0, maximum)
    : [];
}

function biographyData(value = {}) {
  const abilities = Array.isArray(value.abilities) ? value.abilities : [];
  const sections = Array.isArray(value.extraSections) ? value.extraSections : [];
  const connections = Array.isArray(value.connections) ? value.connections : [];
  const documents = Array.isArray(value.documents) ? value.documents : [];
  return {
    portraitStages: Array.from(
      { length: 4 },
      (_, index) => image(Array.isArray(value.portraitStages) ? value.portraitStages[index] : '')
    ),
    sideWidth: integer(value.sideWidth, 100, 35, 100),
    connectionPortraitHeight: integer(value.connectionPortraitHeight, 68, 44, 140),
    connectionTextOffset: integer(value.connectionTextOffset, 0, 0, 80),
    biographyTitle: text(value.biographyTitle, 200) || 'Biografie',
    biographyText: text(value.biographyText),
    abilitiesTitle: text(value.abilitiesTitle, 200) || 'Persönlichkeit',
    abilities: abilities.map(item => ({
      title: text(item?.title, 300),
      detail: text(item?.detail, 1200),
      icon: image(item?.icon) || text(item?.icon, 32)
    })).filter(item => item.title || item.detail || item.icon).slice(0, 48),
    extraSections: sections.map(item => ({
      position: item?.position === 'afterWorks' ? 'afterWorks' : 'afterIntro',
      mode: item?.mode === 'list' ? 'list' : 'text',
      title: text(item?.title, 300),
      text: text(item?.text)
    })).filter(item => item.title || item.text).slice(0, 16),
    historyTitle: text(value.historyTitle, 200) || 'Hintergrund',
    historyText: text(value.historyText),
    worksTitle: text(value.worksTitle, 200) || 'Bekannte Werke',
    works: list(value.works),
    triviaTitle: text(value.triviaTitle, 200) || 'Trivia',
    trivia: list(value.trivia),
    quotesTitle: text(value.quotesTitle, 200) || 'Zitate',
    quotes: list(value.quotes),
    connectionsTitle: text(value.connectionsTitle, 200) || 'Verbindungen',
    connections: connections.map(item => item?.type === 'heading'
      ? {
          type: 'heading',
          title: text(item.title, 300),
          detail: text(item.detail, 1200)
        }
      : {
          type: 'connection',
          name: text(item?.name, 300),
          detail: text(item?.detail, 1200),
          image: image(item?.image),
          imageFormat: ['portrait', 'landscape', 'square'].includes(item?.imageFormat) ? item.imageFormat : 'portrait'
        }).filter(item => item.type === 'heading'
          ? item.title || item.detail
          : item.name || item.detail || item.image).slice(0, 64),
    documentsTitle: text(value.documentsTitle, 200) || 'Eigentum & Besitz',
    documents: documents.map(item => ({
      icon: image(item?.icon) || text(item?.icon, 32),
      title: text(item?.title, 300),
      text: text(item?.text, 2000),
      link: link(item?.link)
    })).filter(item => item.icon || item.title || item.text || item.link).slice(0, 48),
    footer: text(value.footer, 500)
  };
}

export function createPublicPersonExtensions(extensions = {}) {
  const source = extensions?.biographyModule;
  if (!source || typeof source !== 'object') return {};
  const stats = Array.isArray(source.stats) ? source.stats : [];
  return {
    biographyModule: {
      schema: BIOGRAPHY_SCHEMA,
      schemaVersion: 1,
      // Firestore lehnt Arrays ab, die direkt weitere Arrays enthalten - deshalb {label, value}-
      // Objekte statt [label, wert]-Paare. person-biography-model.js#normalizeStats() liest beim
      // Rendern beide Formen ein.
      stats: stats.map(item => (
        Array.isArray(item)
          ? { label: text(item[0], 200), value: text(item[1], 1000) }
          : { label: text(item?.label, 200), value: text(item?.value, 1000) }
      )).filter(({ label, value }) => label || value).slice(0, 48),
      quote: text(source.quote, 6000),
      quoteBy: text(source.quoteBy, 300),
      biography: biographyData(source.biography)
    }
  };
}
