const RICH_TEXT_TAGS = new Set(['p', 'strong', 'em', 'ul', 'ol', 'li', 'blockquote', 'br', 'h3', 'h4']);
const THEMES = new Set(['steel', 'ember', 'arcane', 'sand', 'wild', 'shadow', 'wine', 'sacred', 'sea']);

export function escapeClassHtml(value = '') {
  return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}

export function validateClassRichText(markup) {
  if (typeof markup !== 'string') throw new Error('Klasseninhalt muss HTML-Text sein.');
  if (/[<>]/.test(markup.replace(/<[^>]+>/g, ''))) throw new Error('Unvollständiges Klassen-Markup.');
  for (const tag of markup.matchAll(/<([^>]+)>/g)) {
    const match = tag[1].match(/^\/?([a-z0-9]+)\s*\/?$/i);
    if (!match || !RICH_TEXT_TAGS.has(match[1].toLowerCase())) {
      throw new Error(`Nicht unterstütztes Klassen-Markup: ${tag[0]}`);
    }
  }
  return markup;
}

export function validateClassDocument(document, expectedId) {
  if (document.schemaVersion !== 1 || document.id !== expectedId) throw new Error(`Ungültige Klassendatei: ${expectedId}`);
  for (const key of ['name', 'title', 'subtitle']) {
    if (typeof document[key] !== 'string' || !document[key].trim()) throw new Error(`${expectedId}: ${key} fehlt`);
  }
  if (!THEMES.has(document.theme)) throw new Error(`${expectedId}: unbekanntes Farbschema`);
  for (const source of [document.icon, document.illustration].filter(Boolean)) {
    if (!/^https:\/\/i\.imgur\.com\/[a-zA-Z0-9]+\.(png|jpg|jpeg|webp)$/i.test(source)) {
      throw new Error(`${expectedId}: Bildquelle muss aus der bekannten Bildbibliothek stammen`);
    }
  }
  if (!Array.isArray(document.aliases) || !document.aliases.every(alias => typeof alias === 'string')) throw new Error(`${expectedId}: ungültige Aliasliste`);
  if (!Array.isArray(document.sections) || !document.sections.length) throw new Error(`${expectedId}: Kapitel fehlen`);
  const ids = new Set();
  for (const section of document.sections) {
    if (!/^[a-z][a-z-]+$/.test(section.id) || ids.has(section.id)) throw new Error(`${expectedId}: doppelte oder ungültige Kapitel-ID`);
    ids.add(section.id);
    if (!section.title?.trim() || !['written', 'pending'].includes(section.status)) throw new Error(`${expectedId}: unvollständiges Kapitel`);
    validateClassRichText(section.html);
    if ((section.status === 'written') !== Boolean(section.html.trim())) throw new Error(`${expectedId}: Kapitelstatus und Inhalt widersprechen sich`);
  }
  if (!document.sections.some(section => section.id === 'einfuehrung' && section.status === 'written')) throw new Error(`${expectedId}: Einführung fehlt`);
  if (!Array.isArray(document.facts)) throw new Error(`${expectedId}: Steckbrief fehlt`);
  document.facts.forEach(fact => {
    if (!fact.label?.trim()) throw new Error(`${expectedId}: Steckbriefzeile ohne Bezeichnung`);
    validateClassRichText(fact.html);
  });
  return document;
}
