// One-time authoring import. Existing source modules are never overwritten.
// Canonical family documents own identities, geography, ranks and court roles.
import { readFile, writeFile, mkdir, copyFile, access } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { FAMILY_REGISTRY } from '../../Stammbäume/assets/js/data/families.registry.js';

const root = new URL('../../', import.meta.url), feature = new URL('Familien Häuser und Clans/', root);
const first = JSON.parse(await readFile(new URL('first-seven/editorial-house-texts.json', import.meta.url), 'utf8'));
const last = JSON.parse(await readFile(new URL('last-eight/editorial-house-texts.json', import.meta.url), 'utf8'));
const firstImages = JSON.parse(await readFile(new URL('first-seven/image-manifest.json', import.meta.url), 'utf8'));
const lastImages = JSON.parse(await readFile(new URL('last-eight/downloads.json', import.meta.url), 'utf8'));
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const named = person => person?.name && !/[?…]/.test(person.name) && !/^Unbekannt/i.test(person.name);
const slugify = text => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const definitions = [
  ['pysgod', 'haus-pysgod', 'Schimmerkueste/Haus_Pysgod', 'c369a4e3-4d12-4024-b4c1-00c452e0ce41'],
  ['blaidd', 'haus-blaidd-tredegar', 'Schimmerkueste/Haus_Blaidd', '8022dfb2-2fa4-414e-962f-9750cf0327d7'],
  ['brithyll', 'haus-brithyll', 'Schimmerkueste/Haus_Brithyll', 'b0a5725d-8ba8-4bc4-8246-c2148cb4dbaf'],
  ['gwialen', 'haus-gwialen', 'Schimmerkueste/Haus_Gwialen', '30c27015-c2ea-4c0e-b358-53a66318c43f'],
  ['illygoden', 'haus-illygoden-tredegar', 'Schimmerkueste/Haus_Illygoden', '1bfe2d27-d6fb-424f-8db1-4d60499d8862'],
  ['gwaedlyd', 'haus-gwaedlyd-tredegar', 'Schimmerkueste/Haus_Gwaedlyd', 'fce23593-f26f-401a-ac39-8962e1184cfb'],
  ['coedwig', 'haus-coedwig', 'Achatsee/Haus_Coedwig', '55934959-b162-4711-bf3d-e4e0a2727bee'],
  ['draenog', 'haus-draenog', 'Silberwald/Haus_Draenog', '1ebdb645-0558-445f-865d-944dea0cb1ed'],
  ['wivern', 'haus-wivern', 'Eichenlicht/Haus_Wivern', '8ef348fa-4421-4767-a3af-a9f8544d4709'],
  ['morfil', 'haus-morfil', 'Graukueste/Haus_Morfil', 'e86e84fb-0958-46f9-a6df-5b342b339dbb'],
  ['lyfant', 'haus-lyfant-caer-asgwrn', 'Silberwald/Skelettkueste/Haus_Lyfant', '24c87950-07a1-4010-98a5-0feb6a8b2a34'],
  ['dornach', 'haus-dornach', 'Antike_Crannath_Clans/Clan_Dornach', 'e7f78465-691f-4435-8644-7a531a306294'],
  ['brathaireann', 'haus-brathaireann', 'Antike_Crannath_Clans/Clan_Brathaireann', '2f505f20-720a-4bef-ae42-718f5f3c37ac'],
  ['tonnmharra', 'haus-tonnmharra', 'Antike_Crannath_Clans/Clan_Tonnmharra', 'cc9bb5b5-4be9-4d3a-8b30-e61d68a8e5f5'],
  ['tanwyn', 'haus-tanwyn', 'Ausgestorbene_Haeuser/Haus_Tanwyn', '8474a101-9863-4ff4-afdc-cc70f8e0e9b6']
];
const founders = { pysgod: 'gingalain-pysgod', blaidd: 'pelleas-blaidd', brithyll: 'categirn-pysgod', gwialen: 'hascan-gwialen', coedwig: 'hoyer-founder-coedwig', draenog: 'mathonwy-founder-draenog', wivern: 'ulysses-founder-wivern', morfil: 'trayvion-pysgod', lyfant: 'cledwyn-lyfant' };
const heads = { pysgod: 'griflet-1672-pysgod', blaidd: 'pelleas-blaidd', brithyll: 'cador-brithyll', gwialen: 'gereint-gwialen', illygoden: 'bleddyn-illygoden', gwaedlyd: 'gronw-gwaedlyd', coedwig: 'trahaern-coedwig', draenog: 'deiniol-draenog', wivern: 'islwyn-wivern', morfil: 'aneurin-morfil', lyfant: 'cledwyn-lyfant' };
const ranks = { county: ['Graf', 'Grafenhaus', 'Grafschaft'], barony: ['Baron', 'Baronenhaus', 'Baronie'], 'knight-prince': ['Ritterfürst', 'Ritterfürstenhaus', 'Ritterfürstentum'], 'dun-tiarna': ['Dún Tiarna', 'Clan', 'Dún Tiarnatum'], 'mor-tiarna': ['Mor Tiarna', 'Clan', 'Mor Tiarnatum'], unknown: ['Nicht vermerkt', 'Haus', 'Magiergeschlecht'] };
const territories = { blaidd: 'Herrschaft der Blaidd', brithyll: 'Herrschaft der Brithyll', gwialen: 'Herrschaft der Gwialen', illygoden: 'Herrschaft der Illygoden', gwaedlyd: 'Herrschaft der Gwaedlyd', coedwig: 'Baronie Achatsee', draenog: 'Baronie Silberwald', wivern: 'Baronie Eichenlicht', morfil: 'Baronie Grauküste', lyfant: 'Herrschaft Skelettküste' };
const decisions = [
  'Aktuelle Hausprofile, bestehende Familien-IDs, tatsächliche Orte und Ränge bestimmen die Seite. Die hochgeladene HTML-Datei ergänzt nur widerspruchsfreie beschreibende Hausüberlieferung.',
  'Alle genealogischen Abschnitte einschließlich Familie, Hierarchie, Hierachie, Stammbaum sowie alte Hof-, Erb- und Kadettentabellen werden vollständig ignoriert. Keine Personen, Beziehungen, Lebenszahlen oder Amtsfolgen daraus importiert.',
  'Alle Militärstatistiken, Truppen- und Flottenmengen sowie militärischen Größenvergleiche werden verworfen. Die Militärprofilfelder sind leer und die Gruppe verborgen.',
  'Benannte Gründer-, Oberhaupt- und Erbkarten verwenden ausschließlich bestehende Personen mit belegten passenden Rollen. Unbekannte Personen werden nicht ausformuliert.',
  'Die passende Originalfigur bleibt bytegenau erhalten. Aktuelle Registerwappen werden nicht durch ältere Motivvarianten ersetzt. Es werden keine neuen Bilder erzeugt.'
];

for (const [slug, id, folder, attachmentId] of definitions) {
  const record = FAMILY_REGISTRY.find(row => row.id === id);
  if (!record) throw Error(`Missing canonical target ${id}`);
  const family = record.family, doc = family.document, profile = doc.houseProfile;
  const [rank, rankType, scale] = ranks[profile.rankId];
  const clan = ['dornach', 'brathaireann', 'tonnmharra'].includes(slug), extinct = slug === 'tanwyn';
  const type = clan ? 'Clan' : rankType, relativeFolder = `Estryll/Cenyr/Graue_Weite/${folder}`;
  const dir = new URL(`${relativeFolder}/`, feature), contentUrl = new URL('haus.content.mjs', dir);
  try { await access(contentUrl); throw Error(`Existing authoring module ${contentUrl}`); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
  await mkdir(new URL('assets/', dir), { recursive: true });
  const sourceBytes = await readFile(`C:/Users/fhg_r/.codex/attachments/${attachmentId}/Eingefügter Text.txt`);
  await writeFile(new URL('animexx-source-2026-11-03.html', dir), sourceBytes);
  const firstImage = firstImages.find(image => image.slug === slug && image.role === 'warrior');
  const otherImage = lastImages.find(image => image.slug === slug && ['figure', 'source-figure', 'warrior', 'source-warrior'].includes(image.role));
  const originalPath = firstImage ? new URL(firstImage.file, new URL('first-seven/', import.meta.url)) : new URL(`last-eight/${slug}-figure.png`, import.meta.url);
  const imageBytes = await readFile(originalPath), sourceImage = firstImage || otherImage;
  await copyFile(originalPath, new URL('assets/hausdarstellung-original.png', dir));
  const sections = { ...(first[slug] || last[slug]?.sections) };
  if (!sections.overview || !sections.history) throw Error(`Missing reviewed prose ${id}`);
  for (const key of Object.keys(sections)) sections[key] = sections[key].replaceAll('Dame der See', 'Dame des Sees');
  if (slug === 'dornach') sections.overview = 'Clan Dornach gehört zu den antiken Crannath-Geschlechtern der Grauen Weite. Sein überlieferter Sitz ist Ard Ghallon, sein Rang Dún Tiarna.';
  if (slug === 'brathaireann') sections.overview = 'Clan Brathaireann gehört zu den antiken Crannath-Geschlechtern der Grauen Weite. Sein überlieferter Sitz ist Mor Mhachair, sein Rang Mor Tiarna.';
  if (slug === 'tonnmharra') sections.overview = 'Clan Tonnmharra gehört zu den antiken Crannath-Geschlechtern der Grauen Weite. Sein überlieferter Sitz ist Dun Liath; das Geschlecht besitzt Ritterfürstenrang.';
  const card = (person, role) => ({ id: person.id, familyId: id, name: person.name, role, detail: person.title || '', image: person.portrait ? `../Stammbäume/${person.portrait}` : '', silhouette: person.sex === 'female' ? 'female' : 'male' });
  const founder = founders[slug] ? family.persons.find(person => person.id === founders[slug]) : null;
  if (founder && (!named(founder) || !/\b(?:Gründer|Begründer)\b/.test(founder.title || ''))) throw Error(`Invalid founder ${id}`);
  const currentHead = heads[slug] ? family.persons.find(person => person.id === heads[slug]) : null;
  if (heads[slug] && !named(currentHead)) throw Error(`Invalid current head ${id}`);
  const headCards = family.persons.filter(person => named(person) && person.lineageRole === 'head').map(person => card(person, 'Oberhaupt'));
  const heirs = family.persons.filter(person => named(person) && person.houseId === family.lineage.houseId && /Erbe des Hauses|in der Erbfolge/.test(person.title || '')).map(person => card(person, 'Erbfolge'));
  const offices = family.persons.filter(person => named(person) && !person.death && person.houseId === family.lineage.houseId && /Hofkaplan|Hofmagier|Hofdame|Schatzmeister|Kommandant/.test(person.title || '')).map(person => card(person, person.title));
  sections.succession = heirs.length ? `Die überlieferte Erbfolge nennt ${heirs.map(person => person.name).join(', ')}.` : extinct ? 'Das Haus ist erloschen.' : 'Eine namentlich festgelegte Erbfolge ist bislang nicht überliefert.';
  sections.court = currentHead ? `${currentHead.name} führt das Haus.` : 'Namentliche Oberhäupter und Hofämter sind bislang nicht näher überliefert.';
  sections.familyTree = 'Der Stammbaum zeigt die bereits überlieferten Angehörigen und Verbindungen.';
  sections.historicalFigures = founder ? `Die Gründungsgeschichte erinnert an ${founder.name}.` : 'Weitere historische Persönlichkeiten sind bislang nicht näher überliefert.';
  const place = territories[slug], territoryPath = place ? `${place}/${place}.html` : 'Grafschaft Graue Weite.html';
  const hierarchy = [{ type: 'Sammlung', name: 'Familien Häuser und Clans', slug: 'familien-hauser-und-clans' }, { type: 'Kontinent', name: 'Estryll', slug: 'estryll' }, ...record.folderPath.map((name, index, path) => ({ type: index === 0 ? 'Königreich' : index === 1 ? 'Grafschaft' : index === path.length - 1 && profile.seat ? 'Sitz' : 'Region', name, slug: slugify(name) })), { type: clan ? 'Clan' : 'Haus', name: doc.title, slug: id }];
  const content = {
    id, name: doc.title, type, page: clan ? 'kleinehaeuser.html' : 'haus.html', county: profile.county,
    liege: profile.liegeHouseName || (slug === 'pysgod' ? 'Krone Cenyrs' : ''),
    territoryId: place ? slugify(place) : 'graue-weite', territoryName: place || 'Graue Weite', territoryHref: `../Kontinente/Estryll/Königreich Cenyr/Grafschaft Graue Weite/${territoryPath}`,
    parentHouseId: profile.liegeHouseId || '', extinct, ...(extinct ? { extinctionText: 'In den Magierkriegen erloschen' } : {}), showMotto: Boolean(doc.motto), registerPage: true, prepared: clan,
    contentVersion: '20261103-graue-weite-v1', biographySourceRevision: (family.extensions.sourceRevision || 0) + 1, biographyPreviousDefaultFingerprints: [], biographyIntroTitle: clan ? 'Über den Clan' : 'Über das Haus', biographyHistoryTitle: 'Geschichte',
    placeholders: { male: '../Stammbäume/assets/images/placeholders/male.png', female: '../Stammbäume/assets/images/placeholders/female.png' }, allies: [], hierarchy,
    profile: { highestTitle: rank, rank, houseType: clan && profile.rankId === 'knight-prince' ? 'Ritterfürstenrang' : scale, motto: doc.motto || '', quoteAuthor: '', seat: profile.seat || '', affiliation: `${profile.kingdom} · ${profile.county}`, liege: profile.liegeHouseName || (slug === 'pysgod' ? 'Krone Cenyrs' : ''), troopStrength: '', tiarna: '', kerns: '', fleet: '', founding: '', milestoneOne: '', milestoneTwo: '', patron: '', knightingPatron: '', people: '', wealth: '', religion: '', patronDeities: '', origin: '', cadetBranches: '', allies: '', enemies: '' },
    omitMilitaryProfile: true, sections,
    images: { crest: `../Stammbäume/${doc.emblem}`, scene: `${relativeFolder}/assets/hausdarstellung-original.png`, sceneAlt: `Überlieferte Hausdarstellung · ${doc.title}`, banner: `../Stammbäume/${profile.regionEmblems.seat || profile.regionEmblems.barony || profile.regionEmblems.county}` }, illustrationCategory: 'Hausdarstellung',
    cadets: [], founder: founder ? card(founder, 'Gründer') : null, heads: headCards, headsNote: 'Die überlieferten Angehörigen bewahren die Geschichte der Hausführung.', heirs, offices,
    figuresTitle: 'Historische Persönlichkeiten', figures: founder ? [{ ...card(founder, 'Gründer'), description: sections.historicalFigures }] : [], trivia: [], currentHead: currentHead?.name || '', firstHeir: heirs[0]?.name || '',
    biographySummary: { overview: sections.overview, history: sections.history, character: sections.values, customs: sections.traditions, holdings: sections.holdings, culture: sections.cultureReligion, relations: sections.conflictsAlliances, influence: [], achievements: [], trivia: [] }
  };
  await writeFile(contentUrl, `// Redaktionelle Quelle für Hausseite und Hausbiografie.\n// Quellenentscheidungen: source-manifest.json. Aktuelle Akte und Hausprofile bleiben maßgeblich.\nexport const HOUSE_CONTENT = ${JSON.stringify(content, null, 2)};\n`, 'utf8');
  const notes = {
    pysgod: ['Menevia/O’Menevia und die alte Baroniezuordnung werden durch die aktuellen Angaben Tredegar/Grafschaft Graue Weite ersetzt.'],
    blaidd: ['Nur die südliche Akte haus-blaidd-tredegar wird ergänzt. Pelleas ist deren belegter Gründer, nicht ein historischer Gründer der getrennten Branon-Akte.'],
    brithyll: ['Die kopierte Rittereinleitung mit Cumbra, Umbrien und Brechinaucc bleibt ausgeschlossen.'],
    illygoden: ['Nur haus-illygoden-tredegar ergänzen. Kein explizit belegter Südgründer wird erfunden. Die falsche Gleichsetzung Teulu=Reiter wird nicht übernommen.'],
    gwaedlyd: ['Nur haus-gwaedlyd-tredegar ergänzen. Cadwgawn ist Vater der Tredegar-Gründer und kein Südgründer; founder bleibt ohne ungesicherte Zuweisung leer.'],
    coedwig: ['Llan-Ildut-Altzuordnungen begründen keine Sitzänderung. Maßgeblich sind Llanfyn/Achatsee.'],
    draenog: ['Der historische Gründer Mathonwy und der heutige gleichnamige Erbe bleiben getrennt. Keine unsichere Erzpatriarch-Identität ergänzt.', 'Die drei als gear bezeichneten Zusatzbilder sind alte Wappenvarianten und bleiben Diagnoseoriginale; keine aktiven Itembilder oder Wappenersetzungen. Der als Werte fehlbeschriftete Hofblock wird ignoriert.'],
    lyfant: ['Nur haus-lyfant-caer-asgwrn ergänzen. Cledwyn führt die südliche Linie, Cadwgan ist Seitenzweig. Die Derwyddion-/Meredyddlinie bleibt im Norden.', 'Die vollständige örtliche Hierarchie Silberwald/Skelettküste/Caer Asgwrn bleibt erhalten. Lehnsherr ist Pysgod, nicht Draenog oder ein Herr aus Llanforwyn.'],
    wivern: ['Das sitzende Original am Baum wird unverändert übernommen.'],
    dornach: ['Die dünne Clanvorlage bleibt ohne erfundene Gründer oder eigene Chronik; aktueller Dún-Tiarna-Rang bleibt erhalten.'],
    brathaireann: ['Die dünne Clanvorlage bleibt ohne erfundene Gründer oder eigene Chronik; aktueller Mor-Tiarna-Rang bleibt erhalten.'],
    tonnmharra: ['Die dünne Clanvorlage bleibt ohne erfundene Gründer oder eigene Chronik; der aktuelle knight-prince/Ritterfürstenrang wird nicht selbständig in einen anderen Clanrang geändert.'],
    tanwyn: ['Magiergeschichte und historische Burg bei Llanfyn bleiben Fließtext. Der aktuelle Sitz ist leer, der Rang unbekannt und das Haus erloschen. Historischer Dienst erzeugt keinen neuen heutigen Lehnsherrn. Keine Überlebenden erfunden.']
  };
  const manifest = { source: { attachmentId, file: 'animexx-source-2026-11-03.html', sha256: sha256(sourceBytes) }, genealogy: { imported: false, ignoredSourceSections: ['Hierarchie', 'Hierachie', 'Familie', 'Stammbaum', 'Hof'], familyId: id, existingGraphUnchanged: true }, authority: { familyId: id, profileSource: 'Stammbäume/assets/js/data/graue-weite-house-profiles.js', baselineSourceRevision: family.extensions.sourceRevision || 0, currentSeat: profile.seat || '', currentRankId: profile.rankId }, images: [{ role: 'Hausdarstellung', ...(sourceImage?.url ? { url: sourceImage.url } : {}), localPath: 'assets/hausdarstellung-original.png', status: 'downloaded-and-visually-reviewed', sha256: sha256(imageBytes), note: 'Passendes vorhandenes Original vom Hauptagenten tatsächlich angesehen und unverändert übernommen.' }], decisions: [...decisions, ...(notes[slug] || []), 'Gottheitsvarianten folgen den aktuellen Religionen-Dateien; Sylvanaeth/Orinor/Tharnor/Aelrith sind belegte avallornische Namen. Nimués aktuelles Epithet lautet Dame des Sees.'] };
  await writeFile(new URL('source-manifest.json', dir), JSON.stringify(manifest, null, 2) + '\n', 'utf8');
  console.log(`${id}: ${relativeFolder}`);
}
