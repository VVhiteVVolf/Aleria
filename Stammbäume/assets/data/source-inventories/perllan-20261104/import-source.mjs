import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// Bounded, repeatable import of the supplied Perllan export. Existing differing
// source files and active images are never silently replaced.
const archive = fileURLToPath(new URL('.', import.meta.url));
const treeRoot = fileURLToPath(new URL('../../../../', import.meta.url));
const source = process.argv[2] ? resolve(process.argv[2]) : archive;
const imageRoot = 'assets/images/houses/Llamreis Ankunft/Bürgerliche/Gwynthor/Perllan';
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');

async function retainBytes(path, bytes) {
  let existing;
  try { existing = await readFile(path); } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  if (existing) {
    if (!existing.equals(bytes)) throw new Error(`Existing file differs: ${path}`);
    return;
  }
  await mkdir(resolve(path, '..'), { recursive: true });
  await writeFile(path, bytes, { flag: 'wx' });
}

const manifest = JSON.parse(await readFile(resolve(source, 'manifest.json'), 'utf8'));
const original = JSON.parse(await readFile(resolve(source, 'family.json'), 'utf8'));
if (original.document?.id !== 'perllan' || original.persons.length !== 44) {
  throw new Error('The supplied Perllan source does not match the reviewed export.');
}
const files = ['family.json', 'manifest.json', 'Perllan.html', ...manifest.images.map(item => item.zipPath)];
const retainedFiles = [];
for (const relative of files) {
  if (relative.includes('..') || relative.startsWith('/') || relative.includes('\\')) {
    throw new Error(`Unsafe source path: ${relative}`);
  }
  const bytes = await readFile(resolve(source, relative));
  await retainBytes(resolve(archive, relative), bytes);
  const activePath = relative.startsWith('images/') ? `${imageRoot}/${relative.slice(7)}` : '';
  if (activePath) await retainBytes(resolve(treeRoot, activePath), bytes);
  retainedFiles.push({ path: relative, bytes: bytes.length, sha256: sha256(bytes), ...(activePath ? { activePath } : {}) });
}

const family = structuredClone(original);
family.document.id = 'perllan';
family.document.title = 'Familie Perllan';
family.document.houseProfile = '__PERLLAN_HOUSE_PROFILE__';
family.extensions.registry = { folderPath: ['Cenyr', 'Celtigerns Wacht', 'Llamreis Ankunft', 'Gwynthor'], unclassified: false };
family.extensions.sourceRevision = 1;
family.extensions.sourceDocumentId = original.document.id;
family.extensions.sourceInventory = 'assets/data/source-inventories/perllan-20261104/inventory.json';
for (const item of manifest.images) {
  const local = `${imageRoot}/${item.zipPath.slice(7)}`;
  if (item.kind === 'document.emblem') family.document.emblem = local;
  if (item.kind === 'house.emblem') family.houses.find(house => house.id === item.ownerId).emblem = local;
  if (item.kind === 'person.portrait') family.persons.find(person => person.id === item.ownerId).portrait = local;
}
// User-requested background extraction is an active derivative. The retained
// source files and the original 29 active copies above stay byte-identical.
family.document.emblem = `${imageRoot}/perllan-emblem.png`;
family.houses.find(house => house.id === 'house-perllan').emblem = family.document.emblem;
const module = `// Supplied Perllan export, reviewed 2026-11-04. Source identities, dates,
// relationships and presentation are retained; only registry placement and
// active media paths are adapted. See the retained source inventory.
import { createHouseProfileFromFolderPath } from '../domain/house-profile.js';
import { CELTIGERNS_WACHT_REGION_EMBLEMS } from './celtigerns-wacht-house-profiles.js';
import { PERLLAN_PERSON_BIOGRAPHIES } from './perllan-person-biographies.generated.js';

export const PERLLAN_EMBLEM = ${JSON.stringify(family.document.emblem)};
export const PERLLAN_HOUSE_PROFILE = Object.freeze(createHouseProfileFromFolderPath(
  ['Cenyr', 'Celtigerns Wacht', 'Llamreis Ankunft', 'Gwynthor'],
  { rankId: 'commoner', regionEmblems: {
    seat: CELTIGERNS_WACHT_REGION_EMBLEMS.seats.Gwynthor,
    barony: CELTIGERNS_WACHT_REGION_EMBLEMS.baronies['Llamreis Ankunft'],
    county: CELTIGERNS_WACHT_REGION_EMBLEMS.county,
    kingdom: CELTIGERNS_WACHT_REGION_EMBLEMS.kingdom
  } }
));

const SOURCE_FAMILY = ${JSON.stringify(family, null, 2).replace('"__PERLLAN_HOUSE_PROFILE__"', 'PERLLAN_HOUSE_PROFILE')};

// The browser consumes a static biography map produced by the bounded character
// import. It has no dependency on the Almanach or its runtime character state.
export const HOUSE_PERLLAN_FAMILY = Object.freeze({
  ...SOURCE_FAMILY,
  persons: SOURCE_FAMILY.persons.map(person => PERLLAN_PERSON_BIOGRAPHIES[person.id]
    ? { ...person, extensions: { ...person.extensions, biographyModule: PERLLAN_PERSON_BIOGRAPHIES[person.id] } }
    : person)
});
`;
await retainBytes(resolve(treeRoot, 'assets/js/data/house-perllan-family.js'), Buffer.from(module));
const inventory = {
  schema: 'aleria.family-source-inventory', schemaVersion: 1, reviewed: '2026-11-04',
  familyId: 'perllan', sourceDocumentId: 'perllan',
  sourceName: 'Nutzerdownload Perllan', sourceHtmlEmpty: true,
  counts: { persons: original.persons.length, namedPersons: 27, unnamedPartners: 15, founderPlaceholders: 2, partnerships: original.partnerships.length, parentages: original.parentages.length, portraits: 27 },
  adaptations: ['Bestehende kanonische Dokument-ID perllan erhalten; Registertitel Familie Perllan.', 'Herkunft Gwynthor im bestehenden geographischen Bürgerregister; kein erfundener Hof oder Lehnsherr.', 'Originalbilder bytegleich unter lokalen aktiven URLs.', 'Alle Personen-IDs und worldPersonIds, Datumswerte, Lebensstatus, Verbindungen und Präsentationsdaten unverändert.'],
  canonicalIdentityReview: { reviewed: '2026-11-04', remoteCommit: 'ec32389e89f88bd9b754da93862d933344b03066', familyId: 'perllan', supersededUnpublishedDraftId: 'haus-perllan', decision: 'Der Nutzer hat dieselben 44 Quellpersonen vor diesem Release über den Web-Publisher als perllan veröffentlicht. Diese vorhandene Identität wird fortgeführt; keine zweite Familienakte und kein Alias.' },
  reviewNotes: ['Die leere HTML-Datei enthält keine Hausbio.', 'Gwern und Draenen teilen dasselbe Porträt; ihre Identitäten bleiben getrennt.', 'Ysgaws Legitimierung sowie Helygs als geheim markierte, öffentlich sichtbare Affäre bleiben wie geliefert.', 'Unbekannte Gründer sind Platzhalter; der vorhandene Zeitsprung und ihr gelieferter Lebensstatus bleiben erhalten.'],
  counterpartReview: { method: 'Kanonische Registerpersonen nach worldPersonId, Originalporträt und Vorname mit Geburtsjahr abgeglichen.', matches: [{ sourcePersonId: 'person-a0e1ea6a', otherFamilyId: 'haus-awenydd', otherPersonId: 'rhosyn-awenydd', decision: 'Getrennte Namensgleiche: Rhosyn 1723 hat in Perllan Derwyn als Vater; Rhosyn Awenydd 1723 hat Gwern als Vater und ein anderes Porträt.' }] },
  picturedAnimals: [
    { ownerPersonId: 'person-b758cea4', portrait: 'images/person-person-b758cea4.jpg', animals: ['Eichhörnchen', 'Rotkehlchen'], evidence: 'Bildbeleg; Namen und Spielwerte nicht überliefert.' },
    { ownerPersonId: 'person-f3cccc1a', portrait: 'images/person-person-f3cccc1a.jpg', animals: ['Kaninchen', 'Blaumeise'], evidence: 'Bildbeleg; Namen und Spielwerte nicht überliefert.' }
  ],
  files: retainedFiles
};
await retainBytes(resolve(archive, 'inventory.json'), Buffer.from(`${JSON.stringify(inventory, null, 2)}\n`));
console.log(JSON.stringify({ familyId: family.document.id, files: retainedFiles.length, ...inventory.counts }));
