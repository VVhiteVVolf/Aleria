import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync, copyFileSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
import { FAMILY_REGISTRY } from '../../Stammbäume/assets/js/data/families.registry.js';
import { houseBiographyDefaultFingerprint } from '../../Stammbäume/assets/js/modules/house-biography/house-biography-fingerprint.js';
import { EDITORIAL_ADDITIONS } from './editorial-additions.mjs';

const feature = 'Familien Häuser und Clans';
const work = 'diagnostics/celtigerns-house-refresh-2026-10-24';
const version = '20261024-housebio-v1';
const filesIn = dir => readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? filesIn(path.join(dir, e.name)) : [path.join(dir, e.name)]);
const records = FAMILY_REGISTRY.filter(r => r.folderPath.includes('Celtigerns Wacht'));
const sources = new Map();
for (const file of filesIn(`${feature}/Estryll`).filter(p => p.endsWith('/haus.content.mjs') || p.endsWith('\\haus.content.mjs'))) {
  const { HOUSE_CONTENT } = await import(pathToFileURL(path.resolve(file)));
  sources.set(HOUSE_CONTENT.id, { file, content: structuredClone(HOUSE_CONTENT) });
}
const baselineFile = `${work}/previous-defaults.json`;
if (!existsSync(baselineFile)) writeFileSync(baselineFile, JSON.stringify(Object.fromEntries(records.map(r => [r.id, {
  sourceRevision: r.family.extensions.sourceRevision || 0,
  biography: r.family.extensions.houseBiographyModule || null,
  fingerprint: r.family.extensions.houseBiographyModule ? houseBiographyDefaultFingerprint(r.family.extensions.houseBiographyModule) : '',
  graphFingerprint: createHash('sha256').update(JSON.stringify(Object.fromEntries(['persons','partnerships','parentages','houses','timeJumps','cadetBranches'].map(k => [k, r.family[k]])))).digest('hex'),
} ])), null, 2) + '\n');
const previous = JSON.parse(readFileSync(baselineFile, 'utf8'));
const asText = value => Array.isArray(value) ? value.join('\n\n') : String(value || '');
const known = value => value && !/^(Folgt|Weitere Inhalte|Vorbereitete Familienakte)/.test(value);
const paragraphs = (value, count = 1) => asText(value).split('\n\n').filter(Boolean).slice(0, count).join('\n\n');
const sentences = (value, count) => paragraphs(value).split(/(?<=[.!?])\s+(?=[A-ZÄÖÜ„])/).slice(0, count).join(' ');
const treeImage = src => src ? `../Stammbäume/${src}` : '';
const slug = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
const realPerson = p => !/^(\?+|Unbekannt)/.test(p.name);
const personCard = (p, r) => ({ id: p.id, familyId: r.id, name: p.name, role: p.title || 'Familienmitglied', image: treeImage(p.portrait), detail: p.title || '' });

function createSource(r) {
  const p = r.houseProfile;
  const file = `${feature}/Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Haus_${r.id.slice(5).replace(/^./, s => s.toUpperCase())}/haus.content.mjs`;
  return { file, content: {
    id: r.id, name: r.title, type: 'Bürgerliches Haus', page: 'kleinehaeuser.html', county: 'Celtigerns Wacht',
    liege: p.liegeHouseName || '', territoryId: 'celtigerns-wacht', territoryName: 'Celtigerns Wacht',
    territoryHref: '../Kontinente/Estryll/Königreich Cenyr/Grafschaft Celtigerns Wacht/Grafschaft Celtigerns Wacht.html',
    parentHouseId: '', extinct: false, showMotto: !!r.family.document.motto, registerPage: true,
    biographyIntroTitle: 'Über das Haus', biographyHistoryTitle: 'Geschichte des Hauses', biographySummary: {},
    placeholders: { male: '../Stammbäume/assets/images/placeholders/male.png', female: '../Stammbäume/assets/images/placeholders/female.png' },
    allies: [], hierarchy: [{ type: 'Sammlung', name: feature, slug: 'familien-hauser-und-clans' },
      ...r.folderPath.map((name,i) => ({ type: ['Königreich','Grafschaft','Region','Sitz'][i] || 'Ort', name, slug: slug(name) })),
      { type: 'Haus', name: r.title, slug: r.id }],
    profile: { highestTitle: 'Bürgerlich', rank: 'Bürgerlich', houseType: 'Bürgerfamilie', motto: r.family.document.motto || '', quoteAuthor: '', seat: p.seat, affiliation: 'Celtigerns Wacht', liege: p.liegeHouseName || '',
      troopStrength: '', tiarna: '', kerns: '', fleet: '', founding: '', people: '', wealth: '', religion: '', patronDeities: '', origin: '', cadetBranches: '', allies: '', enemies: '' },
    sections: {}, images: { crest: treeImage(r.family.document.emblem), scene: '', banner: '../Stammbäume/assets/images/regions/celtigerns-wacht.png' },
    cadets: [], founder: null, heads: [], heirs: [], offices: [], figuresTitle: 'Historische Figuren der Familie', figures: [], trivia: [], currentHead: '', firstHeir: ''
  } };
}

const audit = [];
for (const r of records) {
  const source = sources.get(r.id) || createSource(r);
  const { content: c, file } = source;
  const additions = EDITORIAL_ADDITIONS[r.id];
  c.contentVersion = version;
  if (r.family.document.motto) {
    c.profile.motto = r.family.document.motto;
    c.showMotto = true;
  }
  c.omitMilitaryProfile = true;
  // Independently maintained, developed pages are no longer preparations.
  if (c.biographyManagedExternally && asText(c.sections.history) !== 'Folgt …') c.prepared = false;
  for (const field of ['troopStrength','tiarna','kerns','fleet']) c.profile[field] = '';
  // These two sentences came only from the explicitly rejected strength tables.
  const omitStrength = value => asText(value)
    .replace('Das starke Aufgebot umfasst zahlreiche Kavalleristen; eine Flotte besitzt das Haus nicht.', '')
    .replace('Das Aufgebot umfasst vor allem Uchelwyr und Teulu; die Stärke der Infanterie ist mittelmäßig, die Flotte gering.', '')
    .trim();
  for (const key of Object.keys(c.sections)) {
    c.sections[key] = Array.isArray(c.sections[key]) ? c.sections[key].map(omitStrength) : omitStrength(c.sections[key]);
  }
  if (additions) {
    c.prepared = false;
    c.biographyManagedExternally = false;
    c.sections.overview = additions.overview;
    c.sections.history = additions.history;
    c.sections.values = additions.character;
    c.sections.holdings = additions.holdings || 'Eigene Besitzungen und Betriebe sind bisher nicht gesondert belegt.';
    c.sections.traditions = additions.customs || 'Besondere Hausbräuche sind bislang nicht überliefert.';
    c.sections.cultureReligion = additions.culture || 'Eine besondere religiöse Überlieferung des Hauses ist bislang nicht beschrieben.';
    c.sections.conflictsAlliances = additions.relations || 'Weitere Hausallianzen und Fehden sind bisher nicht belegt.';
    c.sections.knighthood = r.houseProfile.rankId === 'commoner'
      ? 'Die Familie gehört dem bürgerlichen Stand an. Persönliche Dienststellungen einzelner Angehöriger sind in der Familienakte verzeichnet.'
      : additions.customs || c.sections.knighthood;
    c.sections.succession = 'Der aktuelle Familienkreis und die belegten Verbindungen stehen in der bestehenden Stammbaumakte. Eine nicht überlieferte Erb- oder Amtsfolge wird nicht ergänzt.';
    c.sections.court = r.houseProfile.rankId === 'commoner'
      ? 'Der Familienhaushalt und seine belegten Aufgaben sind unten aufgeführt. Ein adliger Hofstaat gehört nicht zur Überlieferung.'
      : 'Gründer und bekannte Angehörige sind unten mit der bestehenden Familienakte verknüpft.';
    c.sections.familyTree = 'Die bestehende Familienakte ist hier eingebettet. Personen, Beziehungen und Quellenlücken bleiben dort erhalten; das Hauswappen öffnet die Hausbiografie.';
    c.biographySummary = { overview: additions.overview, history: additions.history, character: additions.character,
      ...(additions.holdings ? { holdings: additions.holdings } : {}), ...(additions.customs ? { customs: additions.customs } : {}),
      ...(additions.culture ? { culture: additions.culture } : {}), ...(additions.relations ? { relations: additions.relations } : {}) };
    c.profile.houseType = additions.role;
    c.currentHead = additions.currentHead ?? c.currentHead ?? '';
    const people = r.family.persons.filter(realPerson);
    const requested = additions.headIds || [];
    for (const id of requested) if (!people.some(p => p.id === id)) throw new Error(`${r.id}: Person fehlt: ${id}`);
    const heads = requested.length ? people.filter(p => requested.includes(p.id)) : people.filter(p => p.lineageRole === 'head' && p.status !== 'dead');
    c.heads = heads.map(p => personCard(p, r));
    const founder = people.find(p => /Gründer|Begründer|Mitbegründer/.test(p.title));
    if (founder) c.founder = personCard(founder, r);
    if (additions.heirIds) c.heirs = people.filter(p => additions.heirIds.includes(p.id)).map(p => personCard(p, r));
    c.currentHead ||= heads.map(p => p.name).join(' und ');
    c.offices = people.filter(p => p.title && !p.death && !heads.includes(p) && !/^(Angehörig|Jüng|Ält|Schwester|Bruder|Vetter|Cousine|Sohn|Tochter|Ehefrau|Ehemann|Gemahlin|Gründer)/.test(p.title)).slice(0, 8).map(p => personCard(p, r));
    c.figures = people.filter(p => p.death && (p.notes || p.title) && !/Erscheinung:/.test(p.notes)).filter(p => /Gründer|Oberhaupt|Veteran|Haus|Krieg|Wirt|Schwarzgurt/.test(`${p.title} ${p.notes}`)).slice(0, 4).map(p => ({ ...personCard(p, r), description: p.notes || p.title }));
    c.figuresTitle = 'Prägende historische Persönlichkeiten';
    c.sections.historicalFigures = c.figures.length ? 'Die folgenden Persönlichkeiten gehören zur belegten Geschichte der Familie.' : 'Weitere historische Persönlichkeiten sind bisher nicht namentlich ausgearbeitet.';
    c.trivia = [additions.role];
  } else if (!c.biographyManagedExternally) {
    if (!c.prepared) {
      const old = previous[r.id].biography;
      const history = asText(c.sections.history);
      const overview = asText(c.sections.overview);
      c.biographySummary = {
        overview: overview.split(/\s+/).length <= 150 ? overview : old.house.biographyText,
        history: history.split(/\s+/).length <= 200 ? history : old.house.historyText,
        character: old.house.extraSections.find(section => section.title === 'Werte und Stellung')?.text || sentences(c.sections.values, 3),
        ...(known(asText(c.sections.traditions)) ? { customs: sentences(c.sections.traditions, 3) } : {}),
        ...(known(asText(c.sections.holdings)) ? { holdings: sentences(c.sections.holdings, 3) } : {}),
        ...(known(asText(c.sections.cultureReligion)) ? { culture: sentences(c.sections.cultureReligion, 2) } : {}),
      };
    } else {
      const p = r.houseProfile;
      const rank = p.rankId === 'commoner' ? 'Bürgerfamilie' : 'Ritterhaus';
      c.biographySummary = {
        overview: `${c.name} ist als ${rank} in ${p.barony || r.folderPath[2]} in Celtigerns Wacht verzeichnet.${p.seat ? ` Als Sitz ist ${p.seat} belegt.` : ''}${p.liegeHouseName ? ` Die bestehende Zuordnung nennt ${p.liegeHouseName} als Lehnsherrn.` : ''}`,
        history: c.extinct ? 'Das Haus ist als erloschen verzeichnet. Ein genaues Endjahr und eine ausgearbeitete Chronik sind bisher nicht überliefert.' : 'Gründung, namentliche frühe Oberhäupter und eine ausführliche Chronik sind bisher nicht überliefert.',
        character: p.rankId === 'commoner' ? 'Beruf, eigener Betrieb, Hausbräuche und ein verbindlicher Leitspruch sind noch nicht festgelegt. Die vorbereitete Hausdarstellung greift ausschließlich das vorhandene Familienzeichen auf.' : 'Die Hausdarstellung und das vorhandene Wappen sind zugeordnet. Besondere Hausbräuche, Taten und persönliche Überlieferungen werden ergänzt, sobald dazu Quellen vorliegen.',
      };
      c.sections.overview = c.biographySummary.overview;
    }
  }
  if (r.id === 'haus-cymrath-o-traethlan') {
    c.images.scene = path.relative(feature, path.join(path.dirname(file), 'assets/hausritter-venalys-2026-10-24.png')).replaceAll('\\','/');
    c.images.sceneAlt = 'Venalysisch geprägter Ritter des Hauses Cymrath mit Lamellenrüstung und geschlossenem Legionärshelm';
  } else if (!c.images.scene) {
    c.images.scene = path.relative(feature, path.join(path.dirname(file), 'assets/hausfigur-2026-10-24.png')).replaceAll('\\','/');
    c.images.sceneAlt = r.houseProfile.rankId === 'commoner' ? `Bürgerliche Hausdarstellung · ${c.name}` : `Kriegerdarstellung · ${c.name}`;
  }
  c.illustrationCategory = r.houseProfile.rankId === 'commoner' ? 'Bürgerliche Hausdarstellung' : 'Hausdarstellung';
  if (r.houseProfile.rankId === 'commoner' && additions) {
    c.headsTitle = 'Familienführung und Haushalt';
    c.headsNote = 'Belegte Aufgaben im heutigen Familienkreis; keine erfundene historische Amtsfolge.';
    c.officesTitle = 'Angehörige und Aufgaben';
  }
  if (r.id === 'haus-draig') {
    const stennis = FAMILY_REGISTRY.find(f => f.id === 'haus-gwefrydd').family.persons.find(p => p.id === 'stennis-gwefrydd');
    const office = c.offices.find(p => p.role === 'Jagdmeister');
    Object.assign(office, personCard(stennis, { id: 'haus-gwefrydd' }), { name: 'Stennis Gwefrydd', role: 'Jagdmeister' });
  }
  if (r.id === 'haus-saethwyr') {
    const office = c.offices.find(p => p.role === 'Kommandant der Garde');
    Object.assign(office, { name: 'Melyn Saethwyr', detail: 'In der Hofliste benannt; keine sichere Zuordnung zu einer vorhandenen Person.', silhouette: 'male' });
  }
  if (!c.biographyManagedExternally) {
    c.biographySourceRevision = Math.max(c.biographySourceRevision || 0, previous[r.id].sourceRevision + 1);
    c.biographyPreviousDefaultFingerprints = [...new Set([...(c.biographyPreviousDefaultFingerprints || []), previous[r.id].fingerprint].filter(Boolean))];
    if (['haus-annwyl', 'haus-gwared'].includes(r.id)) {
      const retired = JSON.parse(readFileSync(`${feature}/tests/fixtures/${r.id}-prepared-biography.json`, 'utf8'));
      c.biographyPreviousDefaultFingerprints = [...new Set([...c.biographyPreviousDefaultFingerprints, houseBiographyDefaultFingerprint(retired.biography)])];
    }
  }
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, '// Redaktionelle Quelle für Hausseite und Stammbaum-Bio.\n// Quellenabgleich: diagnostics/celtigerns-house-refresh-2026-10-24/README.md.\nexport const HOUSE_CONTENT = ' + JSON.stringify(c, null, 2) + ';\n');
  audit.push({ id: r.id, file: file.replaceAll('\\','/'), prepared: !!c.prepared, image: c.images.scene, previousRevision: previous[r.id].sourceRevision, biographySourceRevision: c.biographySourceRevision || null });
}
writeFileSync(`${work}/refresh-audit.json`, JSON.stringify(audit, null, 2) + '\n');
console.log(`${audit.length} Hausquellen aktualisiert; ${records.filter(r => !sources.has(r.id)).length} neue Seiten.`);

// Preserve the submitted source, but never read its genealogy or troop table into live data.
const attachments = {
  'haus-draig': 'cd42f2dc-39c7-417f-87ec-86589c465ce7', 'haus-gafyr': 'c74e3b77-1f9f-4ec9-ac3f-94e7a98babd4',
  'haus-wyrm': 'fd843aa7-1756-45bf-b240-9aaabafc10c8', 'haus-saethwyr': '40de3cb3-299a-4e3f-b197-86498834d6df',
  'haus-gwefrydd': '3ca604dd-4d7e-4f5e-a283-b95a93a7c28c', 'haus-gwyvern': '9f0fdcc2-6ad5-43fc-8654-3314ac9811a7',
  'haus-arwydd': '0e6b05b7-1a72-4669-9fdd-76f8a70d6206', 'haus-tlawd': 'c7364fbe-9c1f-429b-93df-bf58954f8d09'
};
const sourceAudit = [];
for (const [id, attachment] of Object.entries(attachments)) {
  const dir = path.dirname(sources.get(id).file);
  const attachmentDir = path.join('C:/Users/fhg_r/.codex/attachments', attachment);
  const input = path.join(attachmentDir, readdirSync(attachmentDir).find(name => name.endsWith('.txt')));
  const bytes = readFileSync(input);
  const original = path.join(dir, 'animexx-original.html');
  const same = existsSync(original) && readFileSync(original).equals(bytes);
  const saved = same ? original : path.join(dir, 'animexx-source-2026-10-24.html');
  if (!same) copyFileSync(input, saved);
  sourceAudit.push({ id, attachment, sha256: createHash('sha256').update(bytes).digest('hex'), archive: saved.replaceAll('\\','/'), identicalToPreviousArchive: same,
    scope: 'Hauskapitel bis Hof und historische Figuren; alte Genealogie und Truppenangaben nicht übernommen.' });
}
writeFileSync(`${work}/source-audit.json`, JSON.stringify(sourceAudit, null, 2) + '\n');
