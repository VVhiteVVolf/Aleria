import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CITY_NAME_PROPOSALS, HOUSE_NAME_PROPOSALS } from '../name-proposals.mjs';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const normalize = (text) => String(text).normalize('NFC').toLocaleLowerCase('de-DE')
  .replace(/^(haus|clan|familie|sippe|geschlecht|dynastie)\s+/u, '').trim();
const proposals = [...CITY_NAME_PROPOSALS, ...HOUSE_NAME_PROPOSALS];
const seen = new Set();
for (const item of proposals) {
  if (seen.has(item.id)) throw new Error(`Doppelte ID: ${item.id}`);
  seen.add(item.id);
  if (item.status !== 'proposal') throw new Error('Falscher Vorschlagsstatus');
  if (/[ıİğĞşŞçÇ\p{Script=Cyrillic}]/u.test(item.name)) throw new Error(`Unzulässige Schreibform: ${item.name}`);
}
if (CITY_NAME_PROPOSALS.length !== 40 || HOUSE_NAME_PROPOSALS.length !== 100) {
  throw new Error(`Falsche Anzahl: ${CITY_NAME_PROPOSALS.length}/${HOUSE_NAME_PROPOSALS.length}`);
}

const sourceValues = new Map();
function addValue(value, kind, file) {
  if (typeof value !== 'string') return;
  const key = normalize(value);
  const entries = sourceValues.get(key) || [];
  entries.push({ kind, file });
  sourceValues.set(key, entries);
}
const registryPath = 'Stammbäume/assets/data/published-families/registry.json';
const registry = JSON.parse(fs.readFileSync(path.join(projectRoot, registryPath), 'utf8'));
for (const family of registry.families) {
  addValue(family.title, 'published-families', registryPath);
  for (const place of family.folderPath || []) addValue(place, 'registered-place', registryPath);
  for (const field of ['seat', 'barony', 'county', 'kingdom']) {
    addValue(family.houseProfile?.[field], 'registered-place', registryPath);
  }
  for (const seat of family.houseProfile?.secondarySeats || []) {
    addValue(typeof seat === 'string' ? seat : seat.name, 'registered-place', registryPath);
  }
}

function listSourceFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (entry.isDirectory()) {
      return entry.name === 'gwynthor-fleischsammler' ? [] : listSourceFiles(path.join(directory, entry.name));
    }
    return [path.join(directory, entry.name)];
  });
}
const houseFiles = listSourceFiles(path.join(projectRoot, 'Stammbäume/assets/js/data'))
  .filter((file) => file.endsWith('.js'));
const placeFiles = listSourceFiles(path.join(projectRoot, 'Karten'))
  .filter((file) => /(?:places\.(?:mjs|source\.json)|territories\.import\.json|karten\.registry\.js)$/u.test(file.replaceAll('\\', '/')));
const quotedName = /(?:\b(?:name|title|label|displayName|seat|barony|county|kingdom)\s*:\s*|["'](?:name|title|label|displayName|seat|barony|county|kingdom)["']\s*:\s*)(["'])([^\r\n]*?)\1/gu;
for (const [kind, files] of [['house-source', houseFiles], ['place-source', placeFiles]]) {
  for (const file of files) {
    const text = fs.readFileSync(file, 'utf8');
    for (const match of text.matchAll(quotedName)) {
      addValue(match[2], kind, path.relative(projectRoot, file).replaceAll('\\', '/'));
    }
  }
}

const collisions = [];
for (const item of proposals) {
  const matches = sourceValues.get(normalize(item.name));
  if (!matches?.length) continue;
  collisions.push({
    name: item.name,
    kind: item.id.startsWith('city-') ? 'city' : 'house',
    providedByUser: item.group.startsWith('Deine Vorlagen'),
    sourceKinds: [...new Set(matches.map((match) => match.kind))],
    matchedSourceCount: new Set(matches.map((match) => match.file)).size,
  });
}
const report = {
  checkedAt: '2026-11-03',
  cityProposalCount: CITY_NAME_PROPOSALS.length,
  houseProposalCount: HOUSE_NAME_PROPOSALS.length,
  providedHouseProposalCount: HOUSE_NAME_PROPOSALS.filter((item) => item.group.startsWith('Deine Vorlagen')).length,
  normalization: 'NFC, deutschsprachige Kleinschreibung, Haus-/Clan-/Familienpräfix entfernt; exakte vollständige Namen',
  scope: {
    publishedRegistry: registryPath,
    publishedFamilyCount: registry.families.length,
    houseSourceFiles: houseFiles.length,
    placeSourceFiles: placeFiles.length,
  },
  privacy: 'Explizit geheime Quellengruppe ausgeschlossen; Bericht enthält ausschließlich Namen aus den neuen Vorschlägen und keine fremden Personen- oder Geheimdaten.',
  collisions,
  canonicalRegistersUnchanged: true,
  workshopAssignments: 'Separate local house-data.mjs and territory-data.mjs proposals; no canonical assignment.',
};
fs.writeFileSync(new URL('./name-collision-report.json', import.meta.url), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));
