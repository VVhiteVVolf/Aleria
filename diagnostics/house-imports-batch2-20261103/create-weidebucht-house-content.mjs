// One-time import; production content stays in separate editable house modules.
// This script never rewrites an existing authoring file or a family graph.
import { readFile, writeFile, mkdir, copyFile, access } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { FAMILY_REGISTRY } from '../../Stammbäume/assets/js/data/families.registry.js';

const root = new URL('../../', import.meta.url);
const feature = new URL('Familien Häuser und Clans/', root);
const prose = JSON.parse(await readFile(new URL('editorial-house-texts.json', import.meta.url), 'utf8'));
const firstImages = JSON.parse(await readFile(new URL('first-five/image-manifest.json', import.meta.url), 'utf8'));
const lastImages = JSON.parse(await readFile(new URL('last-five/downloads.json', import.meta.url), 'utf8'));
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const slugify = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const named = person => person && person.name && !person.name.includes('?') && !/^Unbekannt/i.test(person.name);
const definitions = [
  ['wylan', 'Melwas_Au/Haus_Wylan', 'da30d4ac-18ac-470e-855f-26816205a90c'],
  ['dinefwr', 'Melwas_Au/Haus_Dinefwr', '82031dc3-32a9-499b-9c57-5363a1477329'],
  ['mochdaer', 'Melwas_Au/Haus_Mochdaer', 'f8f14a3f-e95d-42f4-b979-1856437a626e'],
  ['tir-addawol', 'Hochweide/Haus_Tir_Addawol', '575ad120-8ac2-4d14-9912-bcbe5429716f'],
  ['hwyaden', 'Borkenstein/Haus_Hwyaden', 'ee69fea8-3387-4a24-979f-3de6db4905e6'],
  ['creyr', 'Dunstholm/Haus_Creyr', '4c0aba4a-b776-4438-8f45-c24768d95764'],
  ['tannau', 'Melwas_Au/Haus_Tannau', '6b7ea609-57fb-4ce3-9188-94c895ff4068'],
  ['asyn', 'Melwas_Au/Haus_Asyn', 'f4701342-6288-4b01-979f-ec7003b2bf60'],
  ['fhaire', 'Antike_Haeuser/Clan_Ua_Fhaire', '03dfb4cc-dc10-4d8c-ab2c-8ad9e882f3c6'],
  ['trisceil', 'Antike_Haeuser/Clan_Ui_Trisceil', '2468b897-ffdc-42d1-93e8-0eaf7788d50a']
];
// Explicit, already registered founders avoid mistaking another house's founder
// or a founder's relative for the founder of the page being authored.
const founderIds = { wylan: 'melwas-wylan', dinefwr: 'beynon-tarw-dinefwr', mochdaer: 'aethlem-mochdaer', 'tir-addawol': 'eynon-tarw-dinefwr', creyr: 'rhodhri-wylan', asyn: 'gamon-der-tor-asyn' };
const currentHeadIds = { wylan: 'bedivere-wylan', dinefwr: 'cardoc-dinefwr', mochdaer: 'aethlem-mochdaer', 'tir-addawol': 'gwynham-tir-addawol', hwyaden: 'catwg-hwyaden', creyr: 'goronwy-creyr' };
const ranks = { county: ['Graf', 'Grafenhaus', 'Grafschaft'], barony: ['Baron', 'Baronenhaus', 'Baronie'], 'knight-prince': ['Ritterfürst', 'Ritterfürstenhaus', 'Ritterfürstentum'], commoner: ['Bürger', 'Bürgerliches Haus', 'Bürgerliches Haus'], laird: ['Laird', 'Clan', 'Lairdtum'], 'mor-tiarna': ['Mor Tiarna', 'Clan', 'Mor Tiarnatum'] };
const territories = {
  dinefwr: ['herrschaft-dinefwr', 'Herrschaft der Dinefwr', 'Herrschaft der Dinefwr/Herrschaft der Dinefwr.html'],
  mochdaer: ['herrschaft-mochdaer', 'Herrschaft der Mochdaer', 'Herrschaft der Mochdaer/Herrschaft der Mochdaer.html'],
  'tir-addawol': ['hochweide', 'Hochweide', 'Baronie Hochweide/Baronie Hochweide.html'],
  hwyaden: ['borkenstein', 'Borkenstein', 'Baronie Borkenstein/Baronie Borkenstein.html'],
  creyr: ['dunstholm', 'Dunstholm', 'Baronie Dunstholm/Baronie Dunstholm.html']
};
const decisions = [
  'Aktuelle registrierte Hausprofile, Ränge, tatsächliche Sitze und Lehensbindungen haben Vorrang vor den alten HTML-Tabellen.',
  'Die Quellabschnitte Hierarchie und Stammbaum werden vollständig ignoriert. Keine Personen, Verwandtschaften, Hauslinien, Lebenszahlen oder Amtsfolgen werden daraus importiert.',
  'Alte Hof-, Erb- und Infotabellen werden nicht gerendert. Benannte Karten verweisen ausschließlich auf bestehende Personen mit bereits belegten Rollen.',
  'Alle militärischen Mengen, Größenvergleiche, Truppen- und Flottenstatistiken werden ausgelassen. Militärprofilfelder bleiben leer und die Profilgruppe ausgeblendet.',
  'Beschreibende Hausgeschichte, qualitative Ausbildung, Handwerk und Kultur werden nur ohne Widerspruch zum aktuellen Kontext übernommen. Platzhalter bleiben ohne neue Fakten.',
  'Vorhandene passende Figuren werden unverändert wiederverwendet. Aktuelle lokale Registerwappen und Regionalbanner bleiben maßgeblich.'
];

for (const [slug, folder, attachmentId] of definitions) {
  const id = `haus-${slug}`, record = FAMILY_REGISTRY.find(row => row.id === id);
  if (!record) throw new Error(`Missing current family ${id}`);
  const family = record.family, doc = family.document, canonical = doc.houseProfile;
  const [rank, type, scale] = ranks[canonical.rankId];
  if (!rank) throw new Error(`Unmapped canonical rank ${id}`);
  const prepared = slug === 'tannau';
  const historical = ['asyn', 'fhaire', 'trisceil'].includes(slug);
  const relativeFolder = `Estryll/Cenyr/Weidebucht/${folder}`;
  const directory = new URL(`${relativeFolder}/`, feature), contentUrl = new URL('haus.content.mjs', directory);
  try { await access(contentUrl); throw new Error(`Refusing to overwrite ${fileURLToPath(contentUrl)}`); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
  await mkdir(new URL('assets/', directory), { recursive: true });
  const attachmentPath = `C:/Users/fhg_r/.codex/attachments/${attachmentId}/Eingefügter Text.txt`;
  const sourceBytes = await readFile(attachmentPath);
  await writeFile(new URL('animexx-source-2026-11-03.html', directory), sourceBytes);
  const sourceImage = firstImages.find(image => image.slug === slug && image.role === 'warrior');
  const lastImage = lastImages.find(image => image.slug === slug && image.role === 'source-warrior');
  const originalPath = sourceImage ? new URL(sourceImage.file, new URL('first-five/', import.meta.url)) : lastImage?.path;
  const imageAsset = prepared ? 'hausdarstellung-2026-11-03.png' : 'hausdarstellung-original.png';
  if (!originalPath && !prepared) throw new Error(`Original illustration missing ${id}`);
  if (originalPath) await copyFile(originalPath, new URL(`assets/${imageAsset}`, directory));
  const imageBytes = await readFile(new URL(`assets/${imageAsset}`, directory));
  const scene = `${relativeFolder}/assets/${imageAsset}`;
  const sceneRole = slug === 'fhaire' ? 'Druide des Clans' : slug === 'hwyaden' ? 'Speerritter des Hauses' : prepared ? 'Bürgerliche Gerberdarstellung' : 'Hausdarstellung';
  const [territoryId, territoryName, territoryPath] = territories[slug] || ['weidebucht', 'Weidebucht', 'Grafschaft Weidebucht.html'];
  const hierarchy = [
    { type: 'Sammlung', name: 'Familien Häuser und Clans', slug: 'familien-hauser-und-clans' },
    { type: 'Kontinent', name: 'Estryll', slug: 'estryll' },
    ...[canonical.kingdom, canonical.county, canonical.barony, canonical.seat].map((value, index) => ({ type: ['Königreich', 'Grafschaft', 'Region', 'Sitz'][index], name: value, slug: slugify(value || '') })).filter(entry => entry.name),
    { type: type === 'Clan' ? 'Clan' : 'Haus', name: doc.title, slug: id }
  ];
  const card = (person, role) => ({ id: person.id, familyId: id, name: person.name, role, detail: person.title || '', image: person.portrait ? `../Stammbäume/${person.portrait}` : '', silhouette: person.sex === 'female' ? 'female' : 'male' });
  const founder = founderIds[slug] ? family.persons.find(person => person.id === founderIds[slug]) : null;
  if (founder && (!named(founder) || !/\b(?:Begründer|Gründer)\b/.test(founder.title || ''))) throw new Error(`Invalid founder ${id}`);
  const heads = family.persons.filter(person => named(person) && person.lineageRole === 'head' && !/Stammvater|Ahnherr/.test(person.title || '')).map(person => card(person, historical ? 'Historisches Oberhaupt' : 'Oberhaupt'));
  const heirs = family.persons.filter(person => named(person) && /Erbe des Hauses|in der Erbfolge von Cerrigarth/.test(person.title || '')).map(person => card(person, 'Erbfolge'));
  const offices = family.persons.filter(person => named(person) && !person.death && /Schatzmeister|Kommandant|Hofdame|Hofkaplan|Hofmagier/.test(person.title || '')).map(person => card(person, person.title));
  const currentHead = currentHeadIds[slug] ? family.persons.find(person => person.id === currentHeadIds[slug]) : null;
  if (currentHeadIds[slug] && !named(currentHead)) throw new Error(`Missing current head ${id}`);
  const sections = { ...prose[slug] };
  sections.succession = heirs.length ? `Die überlieferte Erbfolge nennt ${heirs.map(person => person.name).join(', ')}.` : slug === 'asyn' ? 'Réiltín, Arlais und Griff sind zurückgekehrt. Ihre Ansprüche auf das frühere Erbe sind bislang ungeklärt.' : historical ? 'Eine heutige Amts- oder Erbfolge ist nicht überliefert.' : 'Eine namentlich festgelegte Erbfolge ist bislang nicht näher beschrieben.';
  sections.court = currentHead ? `${currentHead.name} führt das Haus.` : historical ? 'Die überlieferten Oberhäupter gehören zur alten Haus- oder Clangeschichte.' : 'Namentliche Oberhäupter und eigene Hofämter sind bislang nicht näher überliefert.';
  sections.familyTree = 'Der Stammbaum zeigt die bereits überlieferten Angehörigen und Verbindungen.';
  sections.historicalFigures = founder ? `Die Gründungsgeschichte erinnert an ${founder.name}.` : slug === 'hwyaden' ? 'Gormán Hwyaden ist der erste namentlich überlieferte Ahnherr. Der Name des frühen Gründers bleibt unbekannt.' : 'Die überlieferten Angehörigen sind im Stammbaum zu finden.';
  const figureIds = [...(founder ? [founder.id] : []), ...(['dinefwr', 'tir-addawol'].includes(slug) ? ['erim-der-bulle-dinefwr'] : []), ...(slug === 'hwyaden' ? ['gorman-hwyaden'] : []), ...(slug === 'asyn' ? ['reiltin-asyn', 'arlais-asyn', 'griff-1732-asyn'] : [])];
  const figures = figureIds.map(personId => {
    const person = family.persons.find(person => person.id === personId);
    if (!named(person)) throw new Error(`Unbound historical figure ${id}/${personId}`);
    const role = personId === founder?.id ? 'Gründer' : /erim/.test(personId) ? 'Stammvater der Bruderhäuser' : personId === 'gorman-hwyaden' ? 'Überlieferter Ahnherr' : 'Zurückgekehrte Angehörige';
    return { ...card(person, role), description: person.title || sections.historicalFigures };
  });
  const motto = doc.motto || (prepared ? 'Tannau’n Clymu Popeth – Fasern binden alles.' : '');
  const content = {
    id, name: doc.title, type, page: prepared ? 'kleinehaeuser.html' : 'haus.html', county: canonical.county,
    liege: canonical.liegeHouseName || (slug === 'wylan' ? 'Krone Cenyrs' : ''), territoryId, territoryName,
    territoryHref: `../Kontinente/Estryll/Königreich Cenyr/Grafschaft Weidebucht/${territoryPath}`,
    parentHouseId: canonical.liegeHouseId || '', extinct: false, showMotto: Boolean(motto), registerPage: true, prepared,
    contentVersion: '20261103-weidebucht-v1', biographySourceRevision: (family.extensions.sourceRevision || 0) + 1, biographyPreviousDefaultFingerprints: [],
    biographyIntroTitle: type === 'Clan' ? 'Über den Clan' : 'Über das Haus', biographyHistoryTitle: 'Geschichte',
    placeholders: { male: '../Stammbäume/assets/images/placeholders/male.png', female: '../Stammbäume/assets/images/placeholders/female.png' },
    allies: [], hierarchy,
    profile: { highestTitle: rank, rank, houseType: scale, motto, quoteAuthor: '', seat: canonical.seat || '', affiliation: `${canonical.kingdom} · ${canonical.county}`, liege: canonical.liegeHouseName || (slug === 'wylan' ? 'Krone Cenyrs' : ''), troopStrength: '', tiarna: '', kerns: '', fleet: '', founding: '', milestoneOne: '', milestoneTwo: '', patron: '', knightingPatron: '', people: '', wealth: '', religion: '', patronDeities: '', origin: '', cadetBranches: '', allies: '', enemies: '' },
    omitMilitaryProfile: true, sections,
    images: { crest: `../Stammbäume/${doc.emblem}`, scene, sceneAlt: `${sceneRole} · ${doc.title}`, banner: `../Stammbäume/${canonical.regionEmblems.barony || canonical.regionEmblems.county}` },
    illustrationCategory: prepared ? 'Bürgerliche Hausdarstellung' : 'Hausdarstellung',
    cadets: [], founder: founder ? card(founder, 'Gründer') : null, heads,
    headsTitle: historical ? 'Historische Oberhäupter' : `Überlieferte Oberhäupter · ${doc.title}`,
    headsNote: historical ? 'Die Titel erinnern an frühere Träger der Herrschaft.' : 'Die überlieferten Angehörigen bewahren die Geschichte der Hausführung.',
    heirs, offices, figuresTitle: 'Historische Persönlichkeiten', figures, trivia: [], currentHead: currentHead?.name || '', firstHeir: heirs[0]?.name || '',
    biographySummary: { overview: sections.overview, history: sections.history, character: sections.values, customs: sections.traditions, holdings: sections.holdings, culture: sections.cultureReligion, relations: sections.conflictsAlliances, influence: [], achievements: [], trivia: [] }
  };
  await writeFile(contentUrl, `// Redaktionelle Quelle für Hausseite und Hausbiografie.\n// Quellenentscheidungen: source-manifest.json. Aktuelle Akte und Hausprofile bleiben maßgeblich.\nexport const HOUSE_CONTENT = ${JSON.stringify(content, null, 2)};\n`, 'utf8');
  const extraDecisions = {
    wylan: ['Die alten Bezeichnungen O’Dewet/O’Penrith und Baron werden nicht übernommen. Cerrigarth, Melwas Au und der Grafenrang folgen der aktuellen Akte. Die Intrigenerzählung nennt kein neu abgeleitetes Alter oder Amtsjahr.', 'Die pauschale Behauptung, die Grafschaft besitze keine Bodenschätze, widerspricht der aktuellen Mochdaer-/Mynfonn-Quelle und wird verworfen.'],
    dinefwr: ['Beynon ist der Gründer des Hauses Dinefwr; Eynon gründete das Bruderhaus Tir Addawol. Erim wird als Stammvater, nicht als neuer erster Ritterfürst geführt.'],
    'tir-addawol': ['Eynon ist der Gründer des Hauses Tir Addawol; Beynon gründete das Bruderhaus Dinefwr. Erim wird als Stammvater, nicht als neuer erster Baron geführt.'],
    mochdaer: ['Die Cerrigarth-Linie bleibt von der Gwyliau-Akte getrennt. Aethlem ist der vorhandene Gründer. Veraltete relative Zeitangaben werden nicht fortgeschrieben.'],
    hwyaden: ['Catwg folgt der aktuellen Person, nicht dem alten Hofkartennamen Cadwg. Der unbekannte Gründer bleibt ohne erfundene Namenskarte.', 'Das Original zeigt einen Speerritter; es wird erhalten und nicht irreführend als Helwyr-Bogenschütze bezeichnet. Der qualitative Helwyr-Schwerpunkt bleibt als Textüberlieferung erhalten.'],
    creyr: ['Der aktuelle Sitz Esgairmor gehört zur Baronie Dunstholm. Der weiße langhalsige Flügelvogel auf Rot im Original hat Vorrang vor dem falschen Kreuztext.'],
    tannau: ['Nur die ausdrücklich benannte Gerberei Die gebundene Schicht und die Hausdevise werden als schmaler Handwerkskern ergänzt. Die Vorlage enthält keine ausgearbeitete Familienchronik. Keine Person, Ämter oder Jahreszahlen ergänzt.', 'Neue Figur ausschließlich wegen fehlender Originaldarstellung; unbenannte Gerberdarstellung ohne neue Personenakte.'],
    asyn: ['Das Verschwinden der Hauptfamilie 1639 und die Rückkehr von Réiltín, Arlais und Griff 1740 folgen der aktuellen öffentlichen Akte. Asyn wird nicht pauschal als endgültig erloschen geführt.', 'Tudwal bleibt historischer letzter Ritterfürst vor dem Verschwinden; kein heutiges Oberhaupt oder neuer Erbe wird erfunden. Der Besitzstreit mit Mochdaer bleibt offen.', 'Unhaltbare relative Angaben wie vor wenigen Wochen oder seit zwei Jahrzehnten entfallen. Das Original zeigt offenen Helm, Speer und Rundschild; der abweichende alte Rüstungstext wird korrigiert.'],
    fhaire: ['Bhiorach bleibt unter Antike Häuser eingeordnet. Der überlieferte Lairdrang bleibt erhalten. Eine vermutete Kadettenherkunft von Ui Trisceil bleibt ausdrücklich unsicher und wird nicht in den Graph übertragen.', 'Die passende Originaldarstellung zeigt einen Druiden mit Stab und Flamme. Sie bleibt als Clanfigur erhalten.'],
    trisceil: ['Antikes Cerrigarth bleibt der aktuelle Registerort. Talamhard ist der historische Erzählname, kein neuer heutiger Sitz.', 'Melwas Wylan ist Gründer des Hauses Wylan und kein Gründer der Ui Trisceil. Unbekannte frühe Clanoberhäupter bleiben ohne erfundene Namenskarten.']
  };
  const manifest = {
    source: { attachmentId, file: 'animexx-source-2026-11-03.html', sha256: sha256(sourceBytes) },
    genealogy: { imported: false, ignoredSourceSections: ['Hierarchie', 'Stammbaum'], familyId: id, existingGraphUnchanged: true },
    authority: { familyId: id, profileSource: 'Stammbäume/assets/js/data/weidebucht-house-profiles.js', baselineSourceRevision: family.extensions.sourceRevision || 0, currentSeat: canonical.seat || '', currentRankId: canonical.rankId },
    images: [{ role: sceneRole, ...((sourceImage || lastImage)?.url ? { url: (sourceImage || lastImage).url } : {}), localPath: `assets/${imageAsset}`, status: prepared ? 'generated-and-visually-reviewed' : 'downloaded-and-visually-reviewed', sha256: sha256(imageBytes), ...(prepared ? { width: 1024, height: 1536, generationManifest: 'image-generation.json' } : {}), note: prepared ? 'Einzige fehlende Hauptdarstellung; vom Hauptagenten erzeugt und geprüft.' : 'Vorhandenes passendes Original unverändert übernommen und vom Hauptagenten visuell bestätigt.' }],
    decisions: [...decisions, ...(extraDecisions[slug] || [])]
  };
  await writeFile(new URL('source-manifest.json', directory), JSON.stringify(manifest, null, 2) + '\n', 'utf8');
  console.log(`${id}: ${relativeFolder}`);
}
