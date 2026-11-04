// Bounded authoring import: canonical family graphs are read, never written.
import { readFile, writeFile, mkdir, copyFile, access } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { FAMILY_REGISTRY } from '../../Stammbäume/assets/js/data/families.registry.js';
import { createPreparedHouseContent } from '../../Familien Häuser und Clans/modules/house-content/prepared-house-content.mjs';
import { houseBiographyDefaultFingerprint } from '../../Stammbäume/assets/js/modules/house-biography/house-biography-fingerprint.js';

const root = new URL('../../', import.meta.url);
const feature = new URL('Familien Häuser und Clans/', root);
const readJson = async path => JSON.parse(await readFile(new URL(path, import.meta.url), 'utf8'));
const baseline = await readJson('baseline.json');
const review = await readJson('source-content.json');
if (review.status !== 'editorially-reviewed-ready') throw Error('Editorial review must be complete before authoring.');
const originals = await readJson('original-images.json');
const generated = await readJson('generated-images.json');
const summaries = await readJson('biography-summaries.json');
const sha = value => createHash('sha256').update(value).digest('hex');
const slug = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const safeName = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_|_$/g, '');
const named = person => person?.name && !/Unbekannt|\?\?\?|Platzhalter/i.test(person.name);
const living = person => person.status === 'alive' && !person.death;
const results = [];

// Validate all input assets and identities before writing any authoring module.
const inputs = await Promise.all(baseline.map(async previous => {
  const record = FAMILY_REGISTRY.find(row => row.id === previous.id);
  if (!record || JSON.stringify(record.family.document.houseProfile) !== JSON.stringify(previous.profile)) throw Error(`Profile drift: ${previous.id}`);
  const source = review.houses.find(row => row.id === previous.id);
  const original = originals.find(row => row.id === previous.id && row.primary);
  const art = original || generated.find(row => `haus-${row.slug}` === previous.id);
  if (!art?.assetPath) throw Error(`Missing illustration ${previous.id}`);
  await access(new URL(art.assetPath, root));
  const relativeDirectory = `Estryll/Aldrimar/Roriksheim/${record.folderPath.slice(2).map(safeName).join('/')}/${safeName(record.title)}`;
  const directory = new URL(`${relativeDirectory}/`, feature);
  try { await access(new URL('haus.content.mjs', directory)); throw Error(`Existing authoring source: ${previous.id}`); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
  return { previous, record, source, art, relativeDirectory, directory };
}));

for (const { previous, record, source, art, relativeDirectory, directory } of inputs) {
  const family = record.family;
  const profile = family.document.houseProfile;
  const image = `../${art.assetPath}`;
  const content = createPreparedHouseContent({ record, image, contentVersion: '20261103-roriksheim-v1',
    territory: { id: 'jarltum-roriksheim', name: 'Jarltum Roriksheim', href: '../Kontinente/Estryll/Königreich Aldrimar/Jarltum Roriksheim/Jarltum Roriksheim.html' } });
  content.countyLabel = 'Jarltum';
  if (content.type === 'Clan') content.sectionTitles = { knighthood: family.extensions.extinctCulture === 'Glaennath' ? '4. Kriegskunst' : '4. Huskarltum' };
  content.page = ['jarl', 'thane'].includes(profile.rankId) ? 'haus.html' : 'kleinehaeuser.html';
  content.prepared = !source;
  content.biographyIntroTitle = content.type === 'Clan' ? 'Über den Clan' : 'Über die Familie';
  content.biographyHistoryTitle = 'Geschichte';
  const originalVariants = originals.filter(row => row.id === previous.id);
  if (originalVariants.length > 1) content.warriorGallery = {
    title: 'Überlieferte Clandarstellungen',
    description: 'Die mitgelieferten Originaldarstellungen des Clans.',
    entries: originalVariants.map((row, index) => ({ name: `${record.title} · Darstellung ${index + 1}`, image: `../${row.assetPath}`, description: 'Unverändert übernommenes Original.' }))
  };
  content.hierarchy = content.hierarchy.map(row => ({ ...row, type: row.type === 'Grafschaft' ? 'Jarltum' : row.type }));
  content.sections.overview = content.sections.overview.replace('in der Grafschaft Roriksheim', 'im Jarltum Roriksheim');
  if (content.extinct) content.sections.overview = `${record.title} gehört zu den ausgestorbenen Clans Roriksheims. ${family.extensions.extinctCulture === 'Glaennath' ? 'Seine Überlieferung stammt aus der albischen Kultur der Glaennath.' : 'Seine Überlieferung gehört zur Kultur der Norrnaigh.'}`;
  if (source) {
    for (const [key, value] of Object.entries(source.reviewedSections)) if (value?.trim()) content.sections[key] = value;
    if (!source.reviewedSections.overview?.trim() && source.safeCanonicalSummary) content.sections.overview = source.safeCanonicalSummary.split(/(?<=[.!?])\s+/).filter(sentence => !/\b(?:Vorlage|Quelle|Register|Akte|Kapitel)\b/.test(sentence)).join(' ');
    content.trivia = source.reviewedTrivia || [];
  }
  if (content.extinct) {
    // The register's final folder is a culture category, not a physical seat.
    // Keep the canonical profile untouched and label only the page's presentation.
    content.profile.seat = profile.secondarySeats?.[0] || '';
    content.profile.origin = family.extensions.extinctCulture || '';
    content.profile.houseType = 'Ausgestorbener Clan';
    content.illustrationCategory = 'Historische Clandarstellung';
    content.images.sceneAlt = `Historische Clandarstellung · ${record.title}`;
    content.hierarchy = content.hierarchy.map(row => ({ ...row, type: /Ausgestorbene Clans/.test(row.name) ? 'Historischer Bestand' : /Norrnaigh \(Nordmänner\)|Glaennath \(Alben\)/.test(row.name) ? 'Kultur' : row.type }));
  }
  // Existing full prose is the authority for the non-supplied Eisenjungfer clan.
  if (previous.id === 'haus-eisenjungfer') {
    const bio = previous.biography;
    content.prepared = false;
    Object.assign(content.sections, {
      overview: bio.house.biographyText, history: bio.house.historyText,
      traditions: bio.house.trivia.join('\n\n'),
      knighthood: bio.house.abilities.map(row => `${row.title}: ${row.detail}`).join('\n\n'),
      holdings: 'Der Clan sitzt in Klangheim und verwaltet für Clan Skald die südliche Lehensstätte Forsthain.',
      conflictsAlliances: bio.house.connections.filter(row => row.name).map(row => `${row.name}: ${row.detail}`).join('\n\n')
    });
    content.trivia = [...bio.house.trivia];
    content.biographyManagedExternally = true;
  }
  if (previous.id === 'haus-wolfshorn') {
    content.prepared = false;
    content.sections.overview = family.document.description;
    content.sections.history = 'Als der Dunkelhain die Grenzlande bedrohte, zerstritt sich Hrolf Wolfshorn mit seinen Lehnsherren. Er zog mit Ylva, Asgeir und seinem Bruder Halvar nach Cenyr ins Exil. Aus diesem Zweig ging dort Haus Bleiddorn hervor. Der Clan Wolfshorn blieb in Hornhall bestehen; Hrolfs Bruder Bjoern übernahm die Wehrhalle.';
    content.sections.holdings = 'Hornhall ist die überlieferte Wehrhalle des Clans in Dämmergrund. Sie liegt im Dämmertal und dient der Grenzwacht.';
    content.sections.conflictsAlliances = 'Die Wolfshorn dienen Clan Vangandr. Der nach Cenyr ausgewanderte Zweig Haus Bleiddorn besitzt eine eigene Akte und bleibt von der Familie in Hornhall getrennt.';
    content.relatedRecords = [{ title: 'Haus Bleiddorn · Cenyr', text: 'Eigenständige Akte des ausgewanderten Familienzweigs.', link: '../Stammb%C3%A4ume/Stammbaum.html?family=haus-bleiddorn&mode=view', icon: '' }];
  }
  const ownPeople = family.persons.filter(person => person.houseId === family.lineage.houseId && named(person));
  const card = (person, role) => ({ id: person.id, familyId: previous.id, name: person.name, role, detail: person.title || '', image: person.portrait ? `../Stammbäume/${person.portrait}` : '', silhouette: person.sex === 'female' ? 'female' : 'male' });
  const headPeople = ownPeople.filter(person => person.lineageRole === 'head');
  const founder = ownPeople.find(person => /Gründer|Gründerin|Begründer|Begruender|Stammvater|Stammmutter/.test(person.title || ''));
  content.founder = founder ? card(founder, 'Begründung des Clans') : null;
  content.heads = headPeople.map(person => card(person, 'Überliefertes Oberhaupt'));
  content.heirs = ownPeople.filter(person => living(person) && /Erbe|Erbin|Erbfolge/.test(person.title || '')).map(person => card(person, 'Erbfolge'));
  const activeHeads = headPeople.filter(person => living(person) && !/vormals|ehemalig|Exil/i.test(person.title || ''));
  content.currentHead = content.extinct ? '' : activeHeads.length === 1 ? activeHeads[0].name : '';
  if (previous.id === 'haus-wolfshorn') content.currentHead = 'Bjoern Wolfshorn';
  content.firstHeir = content.heirs[0]?.name || '';
  if (source || !content.prepared) content.page = 'haus.html';
  content.sections.succession = content.extinct ? 'Der Clan ist ausgestorben.' : content.heirs.length ? `Die überlieferte Erbfolge nennt ${content.heirs.map(person => person.name).join(', ')}.` : 'Eine gesicherte Erbfolge ist bislang nicht näher überliefert.';
  content.sections.court = content.currentHead ? `${content.currentHead} führt ${record.title}.` : content.extinct ? 'Der Clan besitzt keine heutigen Amtsinhaber.' : 'Einzelne Amtsbesetzungen sind bislang nicht näher überliefert.';
  content.biographySummary = { overview: content.sections.overview, history: content.sections.history, character: content.sections.values, customs: content.sections.traditions, holdings: content.sections.holdings, culture: content.sections.cultureReligion, relations: content.sections.conflictsAlliances, influence: [], achievements: [], trivia: content.trivia };
  if (source) {
    if (!summaries[previous.id]) throw Error(`Missing short biography ${previous.id}`);
    content.biographySummary = { ...content.biographySummary, ...summaries[previous.id] };
  }
  content.biographyPreviousDefaultFingerprints = previous.biography ? [houseBiographyDefaultFingerprint(previous.biography)] : [];
  await mkdir(directory, { recursive: true });
  await writeFile(new URL('haus.content.mjs', directory), `// Redaktionelle Quelle; kanonische Akten besitzen Vorrang.\nexport const HOUSE_CONTENT = ${JSON.stringify(content, null, 2)};\n`);
  if (content.biographyManagedExternally) {
    const biography = structuredClone(previous.biography);
    Object.assign(biography, { image, imageSquare: false, imageTall: true });
    biography.house.documents = [...(biography.house.documents || []), { title: `${record.title} · Hausseite`, text: 'Die vollständige Clanseite mit bestehendem Stammbaum.', link: `../Familien%20H%C3%A4user%20und%20Clans/${content.page}?haus=${previous.id}`, icon: content.images.crest }];
    await writeFile(new URL('haus.biography.mjs', directory), `// Bestehende ausführliche Clanbio erhalten; Hausbild und Seitenverweis ergänzt.\nexport const HOUSE_BIOGRAPHY = ${JSON.stringify(biography, null, 2)};\n`);
  }
  if (source) await copyFile(new URL(source.source.archive, root), new URL('animexx-source-2026-11-03.html', directory));
  const bytes = await readFile(new URL(art.assetPath, root));
  const manifest = { id: previous.id, source: source?.source || null, authority: { familyId: previous.id, baselineSourceRevision: previous.sourceRevision, profile: previous.profile }, genealogy: { imported: false, familyId: previous.id, iframe: true }, militaryStatistics: { imported: false }, illustration: { ...art, sha256: sha(bytes) }, decisions: [...(source?.decisions || []), 'Aktuelle IDs, Ränge, Orte, Wappen und Strukturen bleiben erhalten.', 'Stammbäume und Militärstatistiken der Vorlage vollständig ignoriert.', 'Keine genealogischen Datensätze durch diesen Inhaltsabgleich verändert.'] };
  await writeFile(new URL('source-manifest.json', directory), JSON.stringify(manifest, null, 2) + '\n');
  results.push({ id: previous.id, relativeDirectory, image: art.assetPath, original: Boolean(source), extinct: content.extinct, prepared: content.prepared });
}
await writeFile(new URL('created-house-sources.json', import.meta.url), JSON.stringify(results, null, 2) + '\n');
console.log(`${results.length} Roriksheim-Quellen angelegt.`);
