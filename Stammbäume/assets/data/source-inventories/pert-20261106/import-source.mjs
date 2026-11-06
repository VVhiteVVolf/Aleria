// Bounded source admission for Pert. HTTP and image signatures belong to the
// existing family-source-import/download.py; this file never writes other families.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const archive = fileURLToPath(new URL('.', import.meta.url));
const tree = fileURLToPath(new URL('../../../../', import.meta.url));
const scripts = resolve(tree, 'scripts/pert-source-import');
const mode = process.argv[2];
assert.ok(['--prepare', '--emit', '--check'].includes(mode), 'Choose --prepare, --emit or read-only --check.');
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
async function retain(target, bytes) {
  const existing = await readFile(target).catch(error => { if (error.code !== 'ENOENT') throw error; });
  if (existing) return assert.ok(existing.equals(bytes), `Retained original differs: ${target}`);
  assert.notEqual(mode, '--check', `Missing retained source: ${target}`);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, bytes, { flag: 'wx' });
}
const sourcePaths = {
  'pert-original.json': 'C:/Users/fhg_r/Downloads/pert.json',
  'pert-original.html': 'C:/Users/fhg_r/.codex/attachments/93a03542-fc28-4451-8193-35799435a5ff/Eingefügter Text.txt'
};
if (mode === '--prepare') for (const [name, path] of Object.entries(sourcePaths)) await retain(resolve(archive, name), await readFile(path));
const original = JSON.parse(await readFile(resolve(archive, 'pert-original.json'), 'utf8'));
assert.equal(original.document.id, 'pert'); assert.equal(original.persons.length, 19);
assert.equal(original.partnerships.length, 6); assert.equal(original.parentages.length, 12); assert.equal(original.timeJumps.length, 1);
assert.equal(original.houses[0].id, 'house-pert');
const pictured = original.persons.filter(person => person.portrait);
assert.equal(pictured.length, 17);
if (mode === '--prepare') {
  await mkdir(scripts, { recursive: true });
  const assets = pictured.map(person => ({ personId: person.id, familyId: 'pert', url: person.portrait,
    path: `assets/images/portraits/pert/${person.id}${/\.jpe?g$/i.test(person.portrait) ? '.jpg' : '.png'}`,
    referenceOnly: false, sourceRefs: ['pert-original.json'] }));
  await writeFile(resolve(scripts, 'portrait-assets.json'), JSON.stringify(assets, null, 2) + '\n');
  console.log(JSON.stringify({ prepared: true, familyId: 'pert', portraits: pictured.length, jsonSha256: hash(await readFile(resolve(archive, 'pert-original.json'))) }));
  process.exit(0);
}
const receipts = JSON.parse(await readFile(resolve(scripts, 'portrait-assets-receipt.json'), 'utf8'));
assert.equal(receipts.length, 17);
const retainedFiles = [];
for (const [name, source] of Object.entries(sourcePaths)) {
  const bytes = await readFile(resolve(archive, name));
  retainedFiles.push({ path: name, source, bytes: bytes.length, sha256: hash(bytes) });
}
for (const receipt of receipts) {
  assert.equal(receipt.error, undefined, receipt.personId);
  const bytes = await readFile(resolve(tree, receipt.path));
  assert.equal(hash(bytes), receipt.sha256);
  const path = `portraits/${receipt.path.split('/').at(-1)}`;
  await retain(resolve(archive, path), bytes);
  retainedFiles.push({ path, source: receipt.url, activePath: receipt.path, bytes: bytes.length,
    sha256: receipt.sha256, width: receipt.width, height: receipt.height, format: receipt.format });
}
const emblem = 'assets/images/houses/Llamreis Ankunft/Bürgerliche/Gwynthor/Pert/pert-emblem.png';
const family = structuredClone(original);
family.document.title = 'Familie Pert';
family.document.description = 'Bürgerliche Cenyri-Familie aus Gwynthor: Dienst auf Castell Draig und Landwirtschaft auf Hof Maesglas. Die gelieferte Genealogie enthält 19 Personen, einen seriellen Überlieferungssprung und zwei fortgeführte Familienzweige.';
family.document.emblem = emblem;
family.document.houseProfile = '__PERT_HOUSE_PROFILE__';
family.houses[0].emblem = emblem;
family.houses[0].extensions = { registryManagedFields: ['emblem'], registryManagedFieldRevisions: { emblem: 1 }, registryManagedFieldPreviousValues: { emblem: [original.houses[0].emblem] } };
for (const person of family.persons) {
  const receipt = receipts.find(receipt => receipt.personId === person.id);
  if (receipt) {
    person.portrait = receipt.path;
    person.extensions.registryManagedFields = ['portrait'];
    person.extensions.registryManagedFieldRevisions = { portrait: 1 };
    person.extensions.registryManagedFieldPreviousValues = { portrait: [receipt.url] };
  }
}
for (const id of ['partnership-09698f2f', 'partnership-92b8bf6b']) {
  family.partnerships.find(partnership => partnership.id === id).extensions.chartAlignChildGroupBelowParentPair = true;
}
const decisionNotes = {
  'person-1f86b441': 'Die Hausprosa schreibt Goronwy; die genealogische JSON nennt dieselbe Person Goronvy. Die genealogische Schreibweise bleibt maßgeblich, Goronwy ist als Quellvariante dokumentiert. Goronvy und Lowri fielen nach der Hausgeschichte 1720 im Krieg gegen Ceitheach.',
  'person-3a869794': 'Die genealogische JSON setzt sex auf unknown. Die Hausgeschichte verwendet ausdrücklich „Rhiain bei ihrer Großmutter Gwerfyl“; diese weibliche Textreferenz ist als gesonderte Quellenentscheidung dokumentiert. Rhiain wuchs nach dem Tod der Eltern bei Gwerfyl auf Castell Draig auf.',
  'person-cf926021': 'Geschlecht in der genealogischen JSON unknown und im gelieferten Fließtext nicht eindeutig benannt; keine Festlegung aus Name oder Portrait.',
  'person-618119d8': 'Die gelieferte biologische Elternschaft nennt ausschließlich Sioned und bleibt legitimized. Donnchadhs Beziehung zu Sioned belegt keine Vaterschaft; es wird kein zweiter Elternteil ergänzt.',
  'person-4506547d': 'Geraint und Bethan bewirtschaften Hof Maesglas und nahmen Kevan nach dem Tod seiner Eltern bei sich auf. Diese Betreuung verändert seine belegte biologische Abstammung nicht. Geraint und Donnchadh teilen dasselbe gelieferte Portrait, bleiben aber verschiedene Personen.',
  'person-35fdbd7b': 'Donnchadh ist nach der Hausgeschichte ceitheachischer Herkunft und betreut Pferde und Stallungen auf Hof Maesglas. Er ist Sioneds Lebensgefährte; die JSON führt die Verbindung als affair. Die biologische Vaterschaft von Roísin ist nicht belegt. Dasselbe gelieferte Portrait wie Geraint begründet keine Identitätsgleichheit.',
  'person-52becf61': 'Kevan ist in der gelieferten JSON Sohn von Goronvy und Lowri, Enkel von Iorwerth und Gwerfyl. Nach dem Tod der Eltern 1720 wuchs er nach der Hausgeschichte bei Geraint und Bethan auf Hof Maesglas auf. Eine ältere gleichnamige Draig-Gardistenakte mit demselben Portrait nennt andere Großeltern; diese nicht genealogisch verknüpfte Laufzeitakte bleibt unverändert und ist im Quelleninventar als Gegenquellenkonflikt festgehalten.'
};
for (const [id, note] of Object.entries(decisionNotes)) {
  const person = family.persons.find(person => person.id === id);
  person.notes = [person.notes, note].filter(Boolean).join('\n\n');
}
family.persons.find(person => person.id === 'person-1f86b441').extensions.sourceNameVariants = ['Goronwy'];
// Rhiain's final sex decision is deliberately configured in the retained review.
const decisions = JSON.parse(await readFile(resolve(archive, 'source-decisions.json'), 'utf8'));
if (decisions.rhiainSex === 'female') {
  const person = family.persons.find(person => person.id === 'person-3a869794');
  person.sex = 'female';
  person.extensions.registryManagedFields.push('sex');
  person.extensions.registryManagedFieldRevisions.sex = 1;
  person.extensions.registryManagedFieldPreviousValues.sex = ['unknown'];
}
family.extensions = { ...family.extensions, blankFamily: false, sourceRevision: 1, chartLayoutPolicy: 'strict-v1',
  registry: { folderPath: ['Cenyr', 'Celtigerns Wacht', 'Llamreis Ankunft', 'Gwynthor'], unclassified: false },
  generatorProfile: { ...family.extensions.generatorProfile, origin: 'Gwynthor', religion: 'Alerische Kirche' },
  sourceDocumentId: 'pert', sourceInventory: 'assets/data/source-inventories/pert-20261106/inventory.json',
  sourceDecisions: 'assets/data/source-inventories/pert-20261106/source-decisions.json',
  sourceNote: 'Genealogie aus der vollständig erhaltenen Nutzer-JSON; Hausgeschichte aus separat erhaltener HTML. Alle IDs, Beziehungen, Lebensdaten, Legitimierungen und der Quellenzeitsprung bleiben erhalten. Quellenvarianten, unbestimmte Felder, das geteilte Portrait und die widersprechende ältere Kevan-Laufzeitprosa sind im Inventar dokumentiert.',
  registryManagedDocumentFields: ['emblem'], registryManagedDocumentFieldRevisions: { emblem: 1 },
  registryManagedHouseProfileFields: ['rankId', 'seat', 'barony', 'county', 'kingdom', 'secondarySeats', 'liegeHouseId', 'liegeHouseName', 'regionEmblems'],
  registryManagedExtensionFields: ['registry', 'sourceDocumentId', 'sourceInventory', 'sourceDecisions', 'blankFamily']
};
const module = `// Generated only by assets/data/source-inventories/pert-20261106/import-source.mjs.\nimport { createHouseProfileFromFolderPath } from '../domain/house-profile.js';\nimport { CELTIGERNS_WACHT_REGION_EMBLEMS } from './celtigerns-wacht-house-profiles.js';\n\nexport const PERT_EMBLEM = ${JSON.stringify(emblem)};\nexport const PERT_HOUSE_PROFILE = Object.freeze(createHouseProfileFromFolderPath(\n  ['Cenyr', 'Celtigerns Wacht', 'Llamreis Ankunft', 'Gwynthor'],\n  { rankId: 'commoner', secondarySeats: ['Hof Maesglas'], liegeHouseId: 'house-draig', liegeHouseName: 'Haus Draig', regionEmblems: {\n    seat: CELTIGERNS_WACHT_REGION_EMBLEMS.seats.Gwynthor, barony: CELTIGERNS_WACHT_REGION_EMBLEMS.baronies['Llamreis Ankunft'],\n    county: CELTIGERNS_WACHT_REGION_EMBLEMS.county, kingdom: CELTIGERNS_WACHT_REGION_EMBLEMS.kingdom\n  } }\n));\n\nexport const HOUSE_PERT_FAMILY = Object.freeze(${JSON.stringify(family, null, 2).replace('"__PERT_HOUSE_PROFILE__"', 'PERT_HOUSE_PROFILE')});\n`;
const inventory = { schema: 'aleria.family-source-inventory', schemaVersion: 1, reviewed: '2026-11-06', familyId: 'pert', houseId: 'house-pert',
  counts: { persons: 19, namedPersons: 17, founderPlaceholders: 2, portraits: 17, uniquePortraitUrls: new Set(pictured.map(person => person.portrait)).size,
    partnerships: 6, marriages: 5, affairs: 1, parentages: 12, timeJumps: 1, cadetBranches: 0 },
  files: retainedFiles, persons: original.persons.map(person => ({ ...person, activePortrait: family.persons.find(current => current.id === person.id).portrait, activeSex: family.persons.find(current => current.id === person.id).sex })),
  partnerships: original.partnerships, parentages: original.parentages, timeJumps: original.timeJumps,
  canonicalIdentityReview: { beforeCreation: true, registryCount: 80, registryGitBlobSha: '14351610e763ee8ebed1879ebbd044fce9e1c23c',
    registryMatches: [], directMasterPaths404: ['Stammbäume/assets/data/published-families/pert.json', 'Stammbäume/assets/data/published-families/haus-pert.json'],
    codeSearchMatches: { Pert: [], Maesglas: [] }, allRemoteBranches: ['master'], branchPaginationComplete: true,
    decision: 'Keine vorhandene GitHub-Familienakte oder weiterer Branchentwurf gefunden; gelieferte Familien-ID pert und alle Weltpersonen fortgeführt.' },
  decisions,
  displayAdaptations: ['Zwei rein optische chartAlignChildGroupBelowParentPair-Erweiterungen für die vorhandenen Blattkindergruppen; keine fachlichen Beziehungstypen oder Eltern geändert.'],
  counterpartConflicts: [{ name: 'Kevan Pert', recordId: 'character--jTzoT0bqb2lfmslJ05FJ',
    runtimeId: 'jTzoT0bqb2lfmslJ05FJ', worldPersonId: '', portrait: 'https://i.imgur.com/Sl4ntci.png',
    oldGrandparents: ['Seren Pert', 'Emry Pert'], suppliedGrandparents: ['Iorwerth', 'Gwerfyl'],
    action: 'Keine automatische Figuren-Neuanlage oder Verschmelzung. Die bestehende Laufzeit-/Inventarakte bleibt unverändert; neue Genealogie bleibt quellengetreu.' }],
  chronologyAudit: { worldYear: 1740, dateChanges: 0, implausibleBiologicalParentAges: [],
    war1720: { deceased: ['person-1f86b441', 'person-ab6f684c'], childrenBorn: ['1716', '1719'], consistent: true } },
  provenance: { html: 'Nutzerquelle Haus Pert', json: 'Nutzerexport pert.json', imagePrompts: 'Gelieferte Portraits: unbekannt; keine Motive neu erfunden.' },
  publication: { state: 'local', remoteWrites: 0, productionWrites: 0, moduleCreated: false } };
for (const [target, text] of [
  [resolve(tree, 'assets/js/data/house-pert-family.js'), module],
  [resolve(archive, 'inventory.json'), JSON.stringify(inventory, null, 2) + '\n'],
  [resolve(archive, 'portrait-sources.json'), JSON.stringify(receipts, null, 2) + '\n']
]) {
  if (mode === '--check') assert.equal(await readFile(target, 'utf8'), text, target);
  else await writeFile(target, text);
}
console.log(JSON.stringify({ check: mode === '--check', familyId: 'pert', persons: 19, portraits: 17, preservedDates: true }));
