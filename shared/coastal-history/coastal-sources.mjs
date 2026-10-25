import corpus from './sources.json' with { type: 'json' };
import edition from './edition.json' with { type: 'json' };
import { LEITHEACH_SOURCE_CHANGES } from './leitheach-source-edition.mjs';

export const COASTAL_ARCHIVE = corpus.archive;
export const COASTAL_ORIGINALS = Object.freeze(corpus.documents);
export const COASTAL_EDITION_CHANGES = [...edition.changes, ...LEITHEACH_SOURCE_CHANGES];
export function applyCoastalEdition(documents, changes = COASTAL_EDITION_CHANGES) {
  const result = structuredClone(documents);
  for (const change of changes) {
    const source = result.find(item => item.id === change.sourceId);
    const block = source?.blocks[change.block];
    if (change.beforeRows) {
      if (!block || JSON.stringify(block.rows) !== JSON.stringify(change.beforeRows)) throw new Error(`Quellenabgleich veraltet: ${change.sourceId}:${change.block}:rows`);
      block.rows = structuredClone(change.afterRows);
      continue;
    }
    const cell = change.cell && block?.rows?.[change.cell[0]]?.[change.cell[1]];
    const owner = cell || block;
    if (!owner || owner.text !== change.before) throw new Error(`Quellenabgleich veraltet: ${change.sourceId}:${change.block}:${change.cell || 'text'}`);
    owner.text = change.after;
  }
  return result;
}
export const COASTAL_SOURCES = Object.freeze(applyCoastalEdition(COASTAL_ORIGINALS));
export function coastalSource(id) {
  const source = COASTAL_SOURCES.find(item => item.id === id);
  if (!source) throw new Error(`Unbekannte Küstenquelle: ${id}`);
  return source;
}
export function emptySourceText(text) {
  return /^(?:[.\s…„“"?\-–]*|BILD|KARTE|\(Karte\)|Zitat|[-–]\s*(?:Zitat|Unbekannt)|Beschreibung\.\.\.)$/i.test(text.trim());
}
export function sourceParagraphs(id, indices) {
  const source = coastalSource(id);
  return source.blocks.filter((block, index) => block.type === 'paragraph' && index > 0 && (!indices || indices.includes(index)) && !emptySourceText(block.text));
}
export function sourceTimeline(id, index) {
  const rows = coastalSource(id).blocks[index].rows;
  let period = '';
  return rows.flatMap(row => {
    if (row.length === 1 && /^Jahr \d{4}$/.test(row[0].text)) { period = row[0].text.slice(5); return []; }
    if (row.length > 1 && /^(?:\?\?\.\?\?\.\d{4}|\d{2}:\d{2} Uhr|Mitternacht)$/.test(row[0].text)) {
      return emptySourceText(row[1].text) ? [] : [{ time: row[0].text.startsWith('?') ? period : row[0].text, text: row.slice(1).map(cell => cell.text).join(' ') }];
    }
    if (row.length === 1 && !emptySourceText(row[0].text) && !/^(?:Daten|Zuweisung)/.test(row[0].text)) return [{ time: '', text: row[0].text }];
    return [];
  });
}
