// One-time preparation of reviewed missing public house sources. Existing
// authoring modules and canonical family graphs are never overwritten.
import { readFile, writeFile, mkdir, access } from 'node:fs/promises';
import { FAMILY_REGISTRY } from '../../Stammbäume/assets/js/data/families.registry.js';
import { createPreparedHouseContent } from '../../Familien Häuser und Clans/modules/house-content/prepared-house-content.mjs';
import { readPreparedHouseFacts, describePreparedHouse } from '../../Familien Häuser und Clans/modules/house-content/prepared-house-facts.mjs';
import { houseBiographyDefaultFingerprint } from '../../Stammbäume/assets/js/modules/house-biography/house-biography-fingerprint.js';

const root = new URL('../../', import.meta.url), featurePrefix = 'Familien Häuser und Clans/';
const audit = JSON.parse(await readFile(new URL('coverage-audit/familien.json', import.meta.url), 'utf8'));
const plans = JSON.parse(await readFile(new URL('production-plan.json', import.meta.url), 'utf8')).filter(row => row.action === 'create-prepared-authoring');
const additions = JSON.parse(await readFile(new URL('additional-ten-production-plan.json', import.meta.url), 'utf8'));
const allowed = new Set([...audit.map(row => row.stableId), ...additions.map(row => row.id)]);
const selected = [...plans, ...additions];
const named = person => person?.name && !/[?…]|Unbekannt/i.test(person.name);
const sourceText = content => `// Redaktionelle Quelle: belegte öffentliche Hausdaten.\n// Entscheidungen und Herkunft: source-manifest.json.\nexport const HOUSE_CONTENT = ${JSON.stringify(content, null, 2)};\n`;
const newDefaultLink = content => `../Familien%20H%C3%A4user%20und%20Clans/${content.page}?haus=${encodeURIComponent(content.id)}`;
const countyFile = { 'Celtigerns Wacht': 'Celtigerns Wacht', 'Weidebucht': 'Weidebucht', 'Tal der Milane': 'Tal der Milane', 'Sonnenküste': 'Sonnenküste', 'Klaueninsel': 'Klaueninsel', 'Vortigerns Ruh': 'Vortigerns Ruh' };
const branchFounder = { 'haus-morforwyn-linie-elimue': 'elimue-morforwyn', 'haus-morforwyn-linie-marmue': 'marmue-morforwyn' };

const prepared = selected.map(plan => {
  if (!allowed.has(plan.id)) throw Error(`Unreviewed family ${plan.id}`);
  const record = FAMILY_REGISTRY.find(row => row.id === plan.id);
  if (!record) throw Error(`Missing registered family ${plan.id}`);
  const family = record.family, row = audit.find(row => row.stableId === plan.id);
  const county = plan.county || plan.profile.county, territoryName = countyFile[county];
  if (!territoryName) throw Error(`Unreviewed territory ${plan.id}/${county}`);
  const territory = { id: `grafschaft-${county.toLowerCase().replace(/ä/g, 'ae').replace(/ü/g, 'ue').replace(/[^a-z0-9]+/g, '-')}`, name: territoryName, href: `../Kontinente/Estryll/Königreich Cenyr/Grafschaft ${territoryName}/Grafschaft ${territoryName}.html` };
  const primary = plan.id === 'sept-cneacail';
  const factRecord = { id: plan.id, title: family.document.title, profile: primary ? family.document.houseProfile : row?.houseProfile || family.document.houseProfile,
    folderPath: row?.folderPath || plan.folderPath || record.folderPath, emblem: family.document.emblem,
    description: family.document.description, motto: family.document.motto, sourceRevision: family.extensions.sourceRevision || 0 };
  const existingBiography = row?.existingBiography.present ? family.extensions.houseBiographyModule : null;
  const imagePath = `${plan.folder}/assets/hausdarstellung-2026-11-03.png`;
  const content = createPreparedHouseContent({ record: factRecord, territory, image: imagePath.slice(featurePrefix.length), contentVersion: '20261103-cenyr-completeness-v1', biographyManagedExternally: Boolean(existingBiography) });
  const facts = readPreparedHouseFacts(factRecord);
  if (facts.description.length > 100) {
    content.prepared = false;
    content.sections.overview = describePreparedHouse(facts);
    content.sections.history = facts.description;
    content.biographySummary.overview = content.sections.overview;
    content.biographySummary.history = facts.description;
  }
  const member = (person, role) => ({ id: person.id, familyId: plan.id, name: person.name, role, detail: person.title || '', image: person.portrait ? `../Stammbäume/${person.portrait}` : '', silhouette: person.sex === 'female' ? 'female' : 'male' });
  const branch = plan.id === 'haus-morforwyn-linie-elimue' ? 'Elimue' : plan.id === 'haus-morforwyn-linie-marmue' ? 'Marmue' : '';
  const headPersons = family.persons.filter(person => named(person) && person.lineageRole === 'head' && (!branch || person.id === branchFounder[plan.id] || person.title?.includes(`${branch}-Linie`)));
  const currentHeads = headPersons.filter(person => !person.death);
  const current = currentHeads.find(person => /Oberhaupt|führt/.test(person.title || '')) || (currentHeads.length === 1 ? currentHeads[0] : null);
  content.heads = headPersons.map(person => member(person, person.death ? 'Historischer Angehöriger' : 'Familie und Hausführung'));
  content.currentHead = current?.name || '';
  if (current) content.sections.court = `${current.name} ${current.title ? `· ${current.title}` : 'führt das Haus'}.`;
  if (branchFounder[plan.id]) {
    const person = family.persons.find(person => person.id === branchFounder[plan.id]);
    if (!named(person) || !/Begründerin/.test(person.title || '')) throw Error(`Unverified branch founder ${plan.id}`);
    content.founder = member(person, 'Begründerin'); content.founderTitle = 'Begründerin';
    content.figures = [{ ...content.founder, description: person.title }];
    content.sections.historicalFigures = `${person.name} begründete die ${branch}-Linie.`;
  }
  if (plan.id === 'haus-cochdon') {
    content.sections.knighthood = 'Seefahrt, Seehandel und die Betreuung der Schiffe bestimmen die überlieferte Lebensgrundlage der Familie.';
    content.sections.holdings = 'Zwei reparaturbedürftige Schiffe bildeten die ursprüngliche Grundlage. Lleucu führte den Betrieb nach dem Verlust der Brüder weiter; der spätere Streit um das Erbe gehört zur Familiengeschichte.';
    content.biographySummary.holdings = content.sections.holdings;
  }
  if (plan.id === 'haus-llythfor') {
    // The lineage focus is a reporter, not a documented head of these households.
    content.currentHead = '';
    content.headsTitle = 'Bekannte Angehörige';
    content.heads = content.heads.map(person => ({ ...person, role: 'Berichterstatter' }));
    content.sections.court = 'Die Angehörigen leben in mehreren Haushalten. Ein gemeinsames Familienoberhaupt ist nicht überliefert.';
    content.sections.history = 'Die Llythfor sind eine bescheidene Gwynthorer Familie. Schuhflicken, Wasch- und Näharbeiten sowie Cynddelws Berichte bei Celtigerns Echo tragen die Haushalte. Gwyddno und Gwenddydd, ihre Kinder und die jüngere Generation verbinden diese unterschiedlichen Aufgaben.';
    content.sections.knighthood = 'Schuhflicken, Nähen, Wascharbeit und das Berichten für Celtigerns Echo gehören zu den belegten Tätigkeiten der Angehörigen.';
    content.sections.holdings = 'Eine kleine Schuhflickerwerkstatt und die Arbeit der einzelnen Haushalte bilden die Lebensgrundlage.';
    content.biographySummary.history = content.sections.history; content.biographySummary.holdings = content.sections.holdings;
  }
  if (primary) {
    content.county = family.document.houseProfile.county; content.countyLabel = 'Herkunftsgebiet';
    content.sections.overview = 'Sept Cneacail stammt aus Bun na h-Aibhne in Tir na Dorcha. Nach der Plünderung der Heimat fanden überlebende Angehörige in Gwynthor im Exil eine neue Bleibe. Brauerei, Brennerei und später das Führen von Tavernen gehören zur überlieferten Lebensgrundlage.';
    content.sections.history = family.document.description;
    content.sections.knighthood = 'Die Sept bewahrt ihre Herkunft aus einer Brauer- und Brennerfamilie. Im Gwynthorer Exil führen Alasdair den Letzten Heller und Finlay die Klingende Krone.';
    content.sections.holdings = 'Der frühere Stammsitz liegt in Bun na h-Aibhne. Heute leben Angehörige in Gwynthor; die dortigen Tavernen bilden unterschiedliche Haushalte und wirtschaftliche Wege.';
    content.sections.conflictsAlliances = 'Die alte Bindung führte zu den Mallacht Seaghda. Im Exil zerstritten sich Alasdair und Finlay; Finlay ist mit der Klingenden Münze verbunden.';
    Object.assign(content.biographySummary, { overview: content.sections.overview, history: content.sections.history, holdings: content.sections.holdings, relations: content.sections.conflictsAlliances });
    content.images.banner = '../Stammbäume/assets/images/regions/celtigerns-wacht.png';
  }
  let preservedBiography = null;
  if (existingBiography) {
    preservedBiography = structuredClone(existingBiography);
    preservedBiography.house = { ...preservedBiography.house, documents: [...(preservedBiography.house?.documents || [])] };
    preservedBiography.image = `../${imagePath}`;
    preservedBiography.house.documents.unshift({ icon: `../Stammbäume/${factRecord.emblem}`, title: `${content.name} · Hausseite`, text: 'Hausgeschichte, Angehörige und Stammsitz.', link: newDefaultLink(content) });
    content.biographySourceRevision = (family.extensions.sourceRevision || 0) + 1;
    content.biographyPreviousDefaultFingerprints = [houseBiographyDefaultFingerprint(existingBiography)];
    content.sections.overview = existingBiography.house?.biographyText || existingBiography.description || content.sections.overview;
    content.sections.history = existingBiography.house?.historyText || content.sections.history;
    content.biographySummary.overview = content.sections.overview; content.biographySummary.history = content.sections.history;
  }
  return { plan, content, preservedBiography, familyRevision: family.extensions.sourceRevision || 0 };
});

// Preflight the complete cohort; never replace an existing author's module.
for (const item of prepared) {
  const target = new URL(item.plan.contentPath, root);
  try { await access(target); throw Error(`Existing authoring source ${item.plan.contentPath}`); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
  const territory = new URL(item.content.territoryHref.replace(/^\.\.\//, ''), root);
  await access(territory);
}
for (const { plan, content, preservedBiography, familyRevision } of prepared) {
  const dir = new URL(plan.folder + '/', root); await mkdir(new URL('assets/', dir), { recursive: true });
  await writeFile(new URL('haus.content.mjs', dir), sourceText(content), { flag: 'wx' });
  if (preservedBiography) await writeFile(new URL('haus.biography.mjs', dir), `// Existing public biography retained in full; only image and page link supplemented.\nexport const HOUSE_BIOGRAPHY = ${JSON.stringify(preservedBiography, null, 2)};\n`, { flag: 'wx' });
  const manifest = { source: { kind: 'reviewed-public-family-registry', familyId: plan.id, sourceRevision: familyRevision }, genealogy: { imported: false, familyId: plan.id, existingGraphUnchanged: true, ignoredSourceSections: ['Hierarchie', 'Hierachie', 'Familie', 'Stammbaum', 'Hof'] }, preparation: { inventedPeople: false, inventedRelationships: false, inventedProfession: false, militaryStatisticsImported: false }, images: [{ role: 'Repräsentative Hausfigur', localPath: 'assets/hausdarstellung-2026-11-03.png', status: 'awaiting-reviewed-asset-binding' }], decisions: ['Nur belegte öffentliche Registerfakten und bestehende Angehörige verwendet. Keine alten Genealogien, Amtsfolgen oder Militärstatistiken importiert.', 'Bestehende Hausquellen bleiben erhalten; dieses neue Modul füllt eine geprüfte aktive Seitenlücke.', ...(preservedBiography ? ['Vorhandene öffentliche Hausbiografie vollständig erhalten. Nur repräsentative Abbildung und Hausseiten-Rücklink ergänzt; alter Defaultfingerprint schützt eigene Texte und bewusste Löschungen.'] : []), ...(plan.id === 'sept-cneacail' ? ['Primäres Profil und Herkunftsgebiet bleiben unverändert. Die heutige Gwynthorer Exilplatzierung wird als eigener belegter Kontext gezeigt; keine neue Familienakte oder neue Genealogie aus der Auswanderung erzeugt.'] : [])] };
  await writeFile(new URL('source-manifest.json', dir), JSON.stringify(manifest, null, 2) + '\n', { flag: 'wx' });
}
await writeFile(new URL('created-house-sources.json', import.meta.url), JSON.stringify(prepared.map(item => ({ id: item.content.id, contentPath: item.plan.contentPath, folder: item.plan.folder, image: item.content.images.scene, preservedExistingBiography: Boolean(item.preservedBiography) })), null, 2) + '\n', { flag: 'wx' });
console.log(`${prepared.length} reviewed public authoring modules created; all prior authoring preserved.`);
