// Shared file contract for module pages, character profiles and family biographies.
export const BIOGRAPHY_SCHEMA = 'aleria.biography-module';
export const BIOGRAPHY_SCHEMA_VERSION = 1;

function isRecord(value) {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

export function parseBiographyImportPayload(payload) {
  if (!isRecord(payload) || payload.schema !== BIOGRAPHY_SCHEMA) {
    throw new Error('Keine gültige Biographie-Datei (falsches Schema).');
  }
  const module = payload.biographyModule ?? payload;
  for (const value of [payload, module]) {
    if (!isRecord(value) || (value.schema && value.schema !== BIOGRAPHY_SCHEMA)
      || (value.schemaVersion !== undefined && value.schemaVersion !== BIOGRAPHY_SCHEMA_VERSION)) {
      throw new Error('Diese Version der Biographie-Datei wird nicht unterstützt.');
    }
  }
  if (!isRecord(module.biography) || (module.stats !== undefined && !Array.isArray(module.stats))) {
    throw new Error('Die Datei enthält keine gültige Biographie.');
  }
  return JSON.parse(JSON.stringify(module));
}

function resolveAsset(source, baseUrl, icon = false) {
  const value = String(source || '').trim();
  if (!value || !baseUrl) return value;
  // Symbols in ability/document icon fields are text, not relative filenames.
  if (icon && !/^(?:https?:|data:|\/|\.\.?\/)/i.test(value)
    && !/\.(?:png|jpe?g|gif|webp|avif|svg)(?:[?#]|$)/i.test(value)) return value;
  try { return new URL(value, baseUrl).href; } catch { return value; }
}

export function buildBiographyExportPayload({ biographyModule, personId = '', personName = '', baseUrl = '', source } = {}) {
  const module = parseBiographyImportPayload({ schema: BIOGRAPHY_SCHEMA, biographyModule });
  const bio = module.biography;
  bio.portrait = resolveAsset(bio.portrait, baseUrl);
  bio.portraitStages = (bio.portraitStages || []).map(value => resolveAsset(value, baseUrl));
  for (const item of bio.connections || []) item.image = resolveAsset(item.image, baseUrl);
  for (const item of [...(bio.abilities || []), ...(bio.documents || [])]) {
    if (isRecord(item)) item.icon = resolveAsset(item.icon, baseUrl, true);
  }
  for (const item of bio.documents || []) {
    if (isRecord(item) && item.link) item.link = resolveAsset(item.link, baseUrl);
  }
  return {
    schema: BIOGRAPHY_SCHEMA,
    schemaVersion: BIOGRAPHY_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    personId: String(personId),
    personName: String(personName),
    biographyModule: { ...module, schema: BIOGRAPHY_SCHEMA, schemaVersion: BIOGRAPHY_SCHEMA_VERSION },
    ...(source ? { source: JSON.parse(JSON.stringify(source)) } : {})
  };
}

export function buildBiographyPageExportPayload(page, entry = {}, { baseUrl = '', pageIndex = 0 } = {}) {
  if (!page?.biographyPage || page._commentsPage) {
    throw new Error('Bitte zuerst eine Biografie-Seite öffnen.');
  }
  const biography = { ...page.biography };
  biography.portrait = page.image || biography.portrait || entry.image || entry.portrait || '';
  biography.biographyText = biography.biographyText || page.description || '';
  if (!biography.portraitStages?.some(value => String(value || '').trim())) {
    biography.portraitStages = (page.imageTabs || []).map(item => item.image || '').slice(0, 4);
  }
  return buildBiographyExportPayload({
    personName: page.pageTitle || entry.title || 'Biographie',
    biographyModule: {
      stats: page.stats || [],
      quote: page.quote || '',
      quoteBy: page.quoteBy || '',
      biography
    },
    baseUrl,
    source: { moduleId: entry.id || '', moduleTitle: entry.title || '', pageIndex, pageTitle: page.pageTitle || '' }
  });
}
