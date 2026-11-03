// Pure, allowlisted updates for an existing gallery release. No registry imports or writes.
const unique = values => [...new Set(values)];
const quote = value => `"${String(value || '').replaceAll('"', '""')}"`;

function houseCsvFields(house) {
  return [house.name, house.kind === 'registered' ? 'Eigenes Register' : 'Im Stammbaum erwähnt', house.region, house.location,
    house.illustrationIds.length, house.illustrationIds.length ? 'Vorhanden' : 'Illustration fehlt', house.tree, house.missingNote];
}
const houseCsvRow = house => houseCsvFields(house).map(quote).join(';');

export function createGalleryCsv(houses) {
  const header = ['Haus', 'Registerstatus', 'Region', 'Zugehörigkeit', 'Illustrationen', 'Status', 'Stammbaum', 'Hinweis'].map(quote).join(';');
  return '\ufeff' + [header, ...houses.map(houseCsvRow)].join('\r\n') + '\r\n';
}

export function parseHouseScope(args) {
  const matches = args.filter(arg => arg === '--houses' || arg.startsWith('--houses='));
  if (!matches.length) return null;
  if (matches.length !== 1 || !matches[0].startsWith('--houses=')) throw new Error('--houses genau einmal als --houses=haus-id,... angeben.');
  const ids = matches[0].slice('--houses='.length).split(',').map(id => id.trim());
  if (ids.some(id => !id)) throw new Error('--houses benötigt eine nicht leere Liste von Haus-IDs.');
  return unique(ids);
}

export function validateHouseScope(catalog, houseIds, { registeredHouses = [] } = {}) {
  if (!houseIds?.length) throw new Error('Eine begrenzte Aktualisierung benötigt Haus-IDs.');
  const byId = new Map(catalog.houses.map(house => [house.id, house]));
  // New IDs require an explicit canonical collector result. Without that optional
  // evidence the validation contract remains strict against the existing release.
  const registeredById = new Map(registeredHouses.filter(house => house.kind === 'registered').map(house => [house.id, house]));
  for (const id of houseIds) {
    const house = byId.get(id) || registeredById.get(id);
    if (!house) throw new Error(`Unbekanntes Haus im vorhandenen Katalog: ${id}`);
    if (house.kind !== 'registered') throw new Error(`Keine eigenständige Registerquelle für ${id}; begrenzte Aktualisierungen benötigen registrierte Häuser.`);
  }
}

function appendDistinct(previous = [], current = []) {
  const seen = new Set(previous.map(value => JSON.stringify(value)));
  return [...previous, ...current.filter(value => {
    const key = JSON.stringify(value);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  })];
}

/** Replace only chosen house memberships; preserve foreign metadata and stable image IDs. */
export function mergeScopedCatalog(previous, rebuilt, houseIds) {
  validateHouseScope(previous, houseIds, { registeredHouses: rebuilt.houses });
  const scope = new Set(houseIds);
  const updates = new Map(rebuilt.houses.map(house => [house.id, house]));
  if (updates.size !== rebuilt.houses.length || updates.size !== scope.size || [...updates.keys()].some(id => !scope.has(id))) {
    throw new Error('Die neu gesammelten Häuser stimmen nicht mit --houses überein.');
  }
  const previousHashes = new Map();
  const previousIds = new Map();
  for (const image of previous.illustrations) {
    if (!image.sha256 || previousHashes.has(image.sha256) || previousIds.has(image.id)) throw new Error('Der vorhandene Katalog enthält mehrdeutige Bild-IDs oder Dateihashes.');
    previousHashes.set(image.sha256, image);
    previousIds.set(image.id, image);
  }
  const imageUpdates = new Map();
  const updateIds = new Set();
  for (const image of rebuilt.illustrations) {
    if (!image.houseIds.length || image.houseIds.some(id => !scope.has(id))) throw new Error(`Bild außerhalb des gewählten Hausumfangs: ${image.id}`);
    if (!image.sha256 || imageUpdates.has(image.sha256) || updateIds.has(image.id)) throw new Error('Die begrenzte Sammlung enthält doppelte Bild-IDs oder Dateihashes.');
    const conflicting = previousIds.get(image.id);
    if (conflicting && conflicting.sha256 !== image.sha256) throw new Error(`Bild-ID mit abweichendem Dateihash: ${image.id}`);
    imageUpdates.set(image.sha256, image);
    updateIds.add(image.id);
  }
  const illustrations = [];
  for (const original of previous.illustrations) {
    const update = imageUpdates.get(original.sha256);
    const foreignIds = original.houseIds.filter(id => !scope.has(id));
    const touchesScope = foreignIds.length !== original.houseIds.length;
    if (!update) {
      if (!touchesScope) illustrations.push(original);
      else if (foreignIds.length) illustrations.push({ ...original, houseIds: foreignIds });
      continue;
    }
    const houseIds = unique([...original.houseIds.filter(id => !scope.has(id) || update.houseIds.includes(id)), ...update.houseIds]);
    if (foreignIds.length || !original.houseIds.length) {
      // A selected house may reuse an existing shared/unassigned motif. Its existing
      // display, variants and foreign assignments remain the canonical gallery record.
      illustrations.push({ ...original, houseIds,
        copies: unique([...(original.copies || []), ...(update.copies || [])]),
        sources: appendDistinct(original.sources, update.sources) });
    } else {
      illustrations.push({ ...original, ...update, id: original.id, houseIds,
        copies: unique([...(original.copies || []), ...(update.copies || [])]),
        sources: appendDistinct(original.sources, update.sources) });
    }
    imageUpdates.delete(original.sha256);
  }
  illustrations.push(...imageUpdates.values());
  const houses = previous.houses.map(original => {
    if (!scope.has(original.id)) return original;
    const update = updates.get(original.id);
    return { ...original, ...update, sources: unique([...(original.sources || []), ...(update.sources || [])]),
      illustrationIds: illustrations.filter(image => image.houseIds.includes(original.id)).map(image => image.id) };
  });
  const existingHouseIds = new Set(previous.houses.map(house => house.id));
  for (const update of rebuilt.houses) {
    if (existingHouseIds.has(update.id)) continue;
    houses.push({ ...update, illustrationIds: illustrations.filter(image => image.houseIds.includes(update.id)).map(image => image.id) });
  }
  // Global review metadata and every unrelated entry retain their previous values.
  return { ...previous, houses, illustrations };
}

function csvRecords(text) {
  const records = [];
  let quoted = false;
  let start = 0;
  for (let i = 0; i < text.length; i++) {
    if (text[i] === '"') {
      if (quoted && text[i + 1] === '"') i++;
      else quoted = !quoted;
    } else if (!quoted && (text[i] === '\r' || text[i] === '\n')) {
      if (text[i] === '\r' && text[i + 1] === '\n') i++;
      records.push(text.slice(start, i + 1));
      start = i + 1;
    }
  }
  if (quoted) throw new Error('Die vorhandene CSV enthält ein ungeschlossenes Textfeld.');
  if (start < text.length) records.push(text.slice(start));
  return records;
}

function csvFields(record) {
  const fields = [];
  let value = '';
  let quoted = false;
  for (let i = 0; i < record.length; i++) {
    const character = record[i];
    if (character === '"') {
      if (quoted && record[i + 1] === '"') { value += '"'; i++; }
      else quoted = !quoted;
    } else if (character === ';' && !quoted) { fields.push(value); value = ''; }
    else value += character;
  }
  fields.push(value.replace(/[\r\n]+$/, ''));
  return fields;
}

/** Keep every unselected CSV record byte-for-byte, including BOM and line endings. */
export function updateScopedGalleryCsv(previousCsv, previousHouses, nextHouses, houseIds) {
  const records = csvRecords(previousCsv);
  if (records.length !== previousHouses.length + 1) throw new Error('Die vorhandene CSV passt nicht zum vorhandenen Katalog.');
  validateHouseScope({ houses: previousHouses }, houseIds, { registeredHouses: nextHouses });
  const scope = new Set(houseIds);
  const nextById = new Map(nextHouses.map(house => [house.id, house]));
  const previousIds = new Set(previousHouses.map(house => house.id));
  if (nextById.size !== nextHouses.length) throw new Error('Doppelte Haus-ID in der begrenzten CSV-Aktualisierung.');
  const additions = nextHouses.filter(house => !previousIds.has(house.id));
  if (additions.some(house => !scope.has(house.id) || house.kind !== 'registered')) throw new Error('Neues CSV-Haus außerhalb des gewählten Registerumfangs.');
  for (let i = 0; i < previousHouses.length; i++) {
    const house = previousHouses[i];
    if (csvFields(records[i + 1])[6] !== house.tree) throw new Error(`CSV-Reihenfolge stimmt nicht mit dem vorhandenen Katalog überein: ${house.id}`);
    if (!nextById.has(house.id)) throw new Error(`Bisheriges Haus fehlt in der CSV-Aktualisierung: ${house.id}`);
    if (!scope.has(house.id)) continue;
    const update = nextById.get(house.id);
    if (!update) throw new Error(`Haus fehlt in der begrenzten CSV-Aktualisierung: ${house.id}`);
    const ending = records[i + 1].match(/(?:\r\n|\n|\r)$/)?.[0] || '';
    records[i + 1] = houseCsvRow(update) + ending;
  }
  const preserved = records.join('');
  if (!additions.length) return preserved;
  const ending = records[0].match(/(?:\r\n|\n|\r)$/)?.[0] || '\r\n';
  // An absent final newline is supplied only in the appended suffix, so even the
  // original final record remains an unchanged byte prefix of the resulting file.
  return preserved + (/[\r\n]$/.test(preserved) ? '' : ending) + additions.map(houseCsvRow).join(ending) + ending;
}
