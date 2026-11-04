// Pure scoped-build helpers. Unselected registry records are retained from the
// generated snapshot, never refreshed from unrelated authoring in progress.
export function parseHouseScope(args) {
  if (args.some(arg => arg !== '--check' && arg !== '--houses' && !arg.startsWith('--houses='))) throw new Error('Unbekanntes Argument; nur --check und --houses=haus-id,haus-id sind erlaubt.');
  const flags = args.filter(arg => arg === '--houses' || arg.startsWith('--houses='));
  if (!flags.length) return null;
  if (flags.length !== 1 || flags[0] === '--houses') throw new Error('Genau --houses=haus-id,haus-id verwenden.');
  const ids = flags[0].slice('--houses='.length).split(',').map(id => id.trim());
  if (ids.some(id => !/^[a-z0-9][a-z0-9-]*$/.test(id))) throw new Error('Die Hausauswahl enthält eine leere oder ungültige ID.');
  if (new Set(ids).size !== ids.length) throw new Error('Die Hausauswahl enthält doppelte IDs.');
  return ids;
}

export function selectHouseSources(sources, houseIds) {
  if (!houseIds) return sources;
  const selected = new Set(houseIds);
  for (const id of selected) {
    const matches = sources.filter(source => source.content.id === id);
    if (matches.length !== 1) throw new Error(`Die Hausauswahl ${id} benötigt genau eine redaktionelle Quelle (${matches.length} gefunden).`);
  }
  return sources.filter(source => selected.has(source.content.id));
}

function orderedIds(ids, sourceOrder) {
  const positions = new Map(sourceOrder.map((id, index) => [id, index]));
  return [...ids].sort((a, b) => (positions.get(a) ?? Infinity) - (positions.get(b) ?? Infinity));
}

function takeBefore(pending, nextId, sourceOrder) {
  const position = new Map(sourceOrder.map((id, index) => [id, index]));
  const limit = position.get(nextId) ?? Infinity;
  const ids = orderedIds(pending.keys(), sourceOrder).filter(id => (position.get(id) ?? Infinity) < limit);
  return ids.map(id => { const record = pending.get(id); pending.delete(id); return record; });
}

export function mergeScopedRecords(previous, selected, houseIds, sourceOrder) {
  const scope = new Set(houseIds);
  if (selected.some(record => !scope.has(record.id))) throw new Error('Ausgabe außerhalb der Hausauswahl.');
  if (new Set(previous.map(record => record.id)).size !== previous.length) throw new Error('Doppelte bestehende Registryeinträge; begrenzter Build verweigert.');
  if (new Set(selected.map(record => record.id)).size !== selected.length) throw new Error('Doppelte ausgewählte Hausausgaben.');
  const pending = new Map(selected.map(record => [record.id, record]));
  const result = previous.flatMap(record => {
    if (!scope.has(record.id)) return [record];
    const replacement = pending.get(record.id);
    pending.delete(record.id);
    return replacement ? [replacement] : [];
  });
  const output = result.flatMap(record => [...takeBefore(pending, record.id, sourceOrder), record]);
  return [...output, ...orderedIds(pending.keys(), sourceOrder).map(id => pending.get(id))];
}

export function readPageRegistry(source) {
  const matches = [...source.matchAll(/    \/\/ BEGIN GENERATED HOUSE PAGES\n([\s\S]*?)    \/\/ END GENERATED HOUSE PAGES/g)];
  if (matches.length !== 1) throw new Error('Registry-Ausgabebereich fehlt oder ist mehrdeutig.');
  const match = matches[0];
  return match[1].split('\n').filter(line => line.trim() && !line.trim().startsWith('//')).map(line => {
    try { return JSON.parse(line.trim().replace(/,$/, '')); }
    catch { throw new Error('Nicht unterstützte Hausseiten-Registry; begrenzter Build verweigert.'); }
  });
}

export function mergePageRegistry(source, selected, houseIds, sourceOrder = selected.map(row => row.id)) {
  const normalized = source.replaceAll('\r\n', '\n');
  const previous = readPageRegistry(normalized);
  mergeScopedRecords(previous, selected, houseIds, sourceOrder);
  const scope = new Set(houseIds), pending = new Map(selected.map(row => [row.id, row]));
  const previousIds = new Set(previous.map(row => row.id));
  const added = new Map(selected.filter(row => !previousIds.has(row.id)).map(row => [row.id, row]));
  const match = source.match(/(    \/\/ BEGIN GENERATED HOUSE PAGES\r?\n)([\s\S]*?)(    \/\/ END GENERATED HOUSE PAGES)/);
  const addedLineEnding = match[1].endsWith('\r\n') ? '\r\n' : '\n';
  const body = match[2].split(/(?<=\n)/).flatMap(line => {
    if (!line.trim() || line.trim().startsWith('//')) return [line];
    const record = JSON.parse(line.trim().replace(/,$/, ''));
    const inserts = takeBefore(added, record.id, sourceOrder).map(row => {
      pending.delete(row.id); return `    ${JSON.stringify(row)},${addedLineEnding}`;
    });
    if (!scope.has(record.id)) return [...inserts, line];
    const replacement = pending.get(record.id); pending.delete(record.id);
    const ending = line.endsWith('\r\n') ? '\r\n' : line.endsWith('\n') ? '\n' : '';
    return replacement ? [...inserts, `    ${JSON.stringify(replacement)},${ending}`] : inserts;
  });
  for (const record of pending.values()) body.push(`    ${JSON.stringify(record)},${addedLineEnding}`);
  return source.replace(match[0], `${match[1]}${body.join('')}${match[3]}`);
}

export function mergeRankRegistry(source, selectedRanks, houseIds, sourceOrder, header) {
  const normalized = source.replaceAll('\r\n', '\n');
  const matches = [...normalized.matchAll(/export const HOUSE_RANKS = Object\.freeze\(\{([\s\S]*?)\}\);/g)];
  if (matches.length !== 1) throw new Error('Rangregister nicht erkannt oder mehrdeutig.');
  const match = matches[0];
  const pattern = /^\s*"([a-z0-9-]+)":\s*("(?:\\.|[^"\\])*")\s*,?\s*$/;
  const lines = match[1].split('\n'), previous = [];
  for (const line of lines) {
    if (!line.trim() || line.trim().startsWith('//')) continue;
    const entry = line.match(pattern);
    if (!entry) throw new Error('Rangzeile nicht erkannt; begrenzter Build verweigert.');
    previous.push({ id: entry[1], value: JSON.parse(entry[2]) });
  }
  const selected = Object.entries(selectedRanks).map(([id, value]) => ({ id, value }));
  mergeScopedRecords(previous, selected, houseIds, sourceOrder);
  const scope = new Set(houseIds), pending = new Map(selected.map(row => [row.id, row.value]));
  const previousIds = new Set(previous.map(row => row.id));
  const added = new Map(selected.filter(row => !previousIds.has(row.id)).map(row => [row.id, row]));
  const merged = lines.flatMap(line => {
    const entry = line.match(pattern);
    if (!entry) return [line];
    const inserts = takeBefore(added, entry[1], sourceOrder).map(row => {
      pending.delete(row.id); return `  ${JSON.stringify(row.id)}: ${JSON.stringify(row.value)}`;
    });
    if (!scope.has(entry[1])) return [...inserts, line];
    const id = entry[1];
    if (!pending.has(id)) return inserts;
    const next = `  ${JSON.stringify(id)}: ${JSON.stringify(pending.get(id))}`;
    pending.delete(id); return [...inserts, next];
  });
  while (merged.at(-1) === '') merged.pop();
  for (const [id, value] of pending) merged.push(`  ${JSON.stringify(id)}: ${JSON.stringify(value)}`);
  const properties = merged.map((line, index) => pattern.test(line) ? index : -1).filter(index => index >= 0);
  properties.forEach((index, position) => { merged[index] = merged[index].replace(/,?\s*$/, position === properties.length - 1 ? '' : ','); });
  const result = normalized.replace(match[0], `export const HOUSE_RANKS = Object.freeze({${merged.join('\n')}\n});`);
  return source.includes('\r\n') ? result.replaceAll('\n', '\r\n') : result;
}

export function mergeBiographyRegistry(source, selectedImports, selectedEntries, houseIds, sourceOrder, header) {
  const lines = source.replaceAll('\r\n', '\n').split('\n');
  const imports = new Map();
  for (const line of lines.filter(line => line.startsWith('import '))) {
    const match = line.match(/^import \{ HOUSE_BIOGRAPHY as ([a-z0-9_]+) \} from /);
    if (!match) throw new Error('Biografieimport nicht erkannt; begrenzter Build verweigert.');
    if (imports.has(match[1])) throw new Error('Doppelter Biografieimport; begrenzter Build verweigert.');
    imports.set(match[1], line);
  }
  const start = lines.indexOf('export const HOUSE_BIOGRAPHY_DEFAULTS = Object.freeze({');
  const end = lines.indexOf('});', start + 1);
  if (start < 0 || end < 0) throw new Error('Biografieregister unvollständig.');
  const previous = lines.slice(start + 1, end).filter(line => line.trim() && !line.trim().startsWith('//')).map(line => {
    const match = line.match(/^  "([a-z0-9-]+)": Object\.freeze\(\{ sourceRevision: \d+, biography: ([a-z0-9_]+), /);
    if (!match || !imports.has(match[2])) throw new Error('Biografieeintrag nicht erkannt; begrenzter Build verweigert.');
    return { id: match[1], alias: match[2], entry: line, import: imports.get(match[2]) };
  });
  if (source.split('export const HOUSE_BIOGRAPHY_DEFAULTS = Object.freeze({').length !== 2) throw new Error('Biografieregister nicht erkannt oder mehrdeutig.');
  const selected = selectedEntries.map((entry, index) => {
    const match = entry.match(/^  "([a-z0-9-]+)": /);
    if (!match || !selectedImports[index]) throw new Error('Unvollständige ausgewählte Biografie.');
    const alias = selectedImports[index].match(/^import \{ HOUSE_BIOGRAPHY as ([a-z0-9_]+) \} from /)?.[1];
    if (!alias) throw new Error('Ausgewählter Biografieimport nicht erkannt.');
    return { id: match[1], alias, entry, import: selectedImports[index] };
  });
  mergeScopedRecords(previous, selected, houseIds, sourceOrder);
  const scope = new Set(houseIds), oldAliases = new Map(previous.filter(row => scope.has(row.id)).map(row => [row.alias, row.id]));
  const pendingImports = new Map(selected.map(row => [row.id, row.import]));
  const pendingEntries = new Map(selected.map(row => [row.id, row.entry]));
  const previousIds = new Set(previous.map(row => row.id));
  const addedImports = new Map(selected.filter(row => !previousIds.has(row.id)).map(row => [row.id, row]));
  const addedEntries = new Map(addedImports);
  const idByAlias = new Map(previous.map(row => [row.alias, row.id]));
  const output = [];
  let inEntries = false, closedEntries = false;
  const lastImportIndex = lines.reduce((last, line, index) => line.startsWith('import ') ? index : last, -1);
  for (const [index, line] of lines.entries()) {
    if (lastImportIndex >= 0 && index === lastImportIndex + 1) {
      output.push(...pendingImports.values()); pendingImports.clear();
    }
    const alias = line.match(/^import \{ HOUSE_BIOGRAPHY as ([a-z0-9_]+) \} from /)?.[1];
    if (alias) {
      const inserts = takeBefore(addedImports, idByAlias.get(alias), sourceOrder);
      for (const row of inserts) { output.push(row.import); pendingImports.delete(row.id); }
    }
    if (alias && oldAliases.has(alias)) {
      const id = oldAliases.get(alias);
      if (pendingImports.has(id)) output.push(pendingImports.get(id));
      pendingImports.delete(id); continue;
    }
    if (line === 'export const HOUSE_BIOGRAPHY_DEFAULTS = Object.freeze({') {
      output.push(...pendingImports.values()); pendingImports.clear();
      output.push(line); inEntries = true; continue;
    }
    if (inEntries && line === '});') {
      output.push(...pendingEntries.values()); pendingEntries.clear();
      output.push(line); inEntries = false; closedEntries = true; continue;
    }
    const id = inEntries ? line.match(/^  "([a-z0-9-]+)": /)?.[1] : '';
    if (id) {
      const inserts = takeBefore(addedEntries, id, sourceOrder);
      for (const row of inserts) { output.push(row.entry); pendingEntries.delete(row.id); }
    }
    if (id && scope.has(id)) {
      if (pendingEntries.has(id)) output.push(pendingEntries.get(id));
      pendingEntries.delete(id); continue;
    }
    output.push(line);
  }
  if (!closedEntries || pendingEntries.size || pendingImports.size) throw new Error('Biografieregister unvollständig; begrenzter Build verweigert.');
  const result = output.join('\n');
  return source.includes('\r\n') ? result.replaceAll('\n', '\r\n') : result;
}
