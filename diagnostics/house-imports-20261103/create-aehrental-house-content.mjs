// One-time authoring import. Current registry metadata owns structure; supplied
// HTML is archived byte-for-byte and never parsed into the family graph.
import { readFile, writeFile, mkdir, copyFile, access } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { FAMILY_REGISTRY } from '../../Stammbäume/assets/js/data/families.registry.js';

const root = new URL('../../', import.meta.url);
const feature = new URL('Familien Häuser und Clans/', root);
const intake = JSON.parse(await readFile(new URL('editorial-narrative-intake.json', import.meta.url), 'utf8'));
const prose = JSON.parse(await readFile(new URL('editorial-house-texts.json', import.meta.url), 'utf8'));
const originals = JSON.parse(await readFile(new URL('first-six-visual-reference/manifest.json', import.meta.url), 'utf8'));
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const slugify = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// Product prose contains lore, while import decisions stay in source manifests.
Object.assign(prose.grawn, {
  history: prose.grawn.history.replace('Tristam Grawn ist als Begründer in der bestehenden Familienakte verzeichnet.', 'Tristam Grawn begründete das Haus.'),
  conflictsAlliances: 'Das Grafenhaus ist der Bezugspunkt der ihm verbundenen Ährental-Häuser. Beziehungen werden durch Dienst, Verwaltung, Diplomatie und persönliche Verbindungen gepflegt.'
});
Object.assign(prose.marchog, {
  history: prose.marchog.history.replace('Der Name des heutigen Gründers und Oberhaupts folgt der bestehenden Familienakte: Bréannain Marchog.', 'Bréannain Marchog ist der Gründer und das heutige Oberhaupt des Hauses.'),
  knighthood: 'Die Marchog mussten ihre ritterliche Ausbildung nach dem Aufstieg des Hauses neu aufbauen. Ihre Angehörigen suchen nach Anerkennung unter den älteren Rittergeschlechtern und müssen den eigenen Ruf erst festigen. Fischer und Bauern bilden den sozialen Hintergrund des Gefolges.',
  holdings: 'Der Stammsitz ist Glyndraith. Fischfang und die Arbeit auf dem Wasser bilden den überlieferten wirtschaftlichen Schwerpunkt.',
  conflictsAlliances: 'Die Marchog stehen unter dem Grafenhaus Grawn. Ihre Verbundenheit mit dem Ährental und der Austausch mit anderen Häusern prägen die weitere Entwicklung der Familie.'
});
Object.assign(prose.morcanhuc, {
  history: prose.morcanhuc.history.replace('Arthos Morcanhuc ist in der bestehenden Familienakte als Gründer und Oberhaupt des Ritterfürstenhauses verzeichnet.', 'Arthos Morcanhuc begründete das Ritterfürstenhaus und ist dessen heutiges Oberhaupt.'),
  knighthood: 'Die eigene Teulu-Ausbildung knüpft an die Diensttradition des Hauses an. Schwertkunst und der sichere Umgang mit Schild und Waffe prägen das kriegerische Bild der Familie.',
  holdings: 'Der Stammsitz der Morcanhuc liegt in Glyndraith. Weinbau und die Bewirtschaftung von Höfen und Feldern bilden den wirtschaftlichen Kern.',
  conflictsAlliances: 'Die Lehensbindung führt unmittelbar zu Haus Grawn. Die Morcanhuc betrachten das Grafenhaus als Gönner und maßgeblichen Bezugspunkt.'
});
Object.assign(prose.baedd, {
  history: prose.baedd.history.replace('Sie belegen keine gegenwärtige Reiterei und keinen tatsächlich vorhandenen Kriegskeilerbestand.', 'Ob hinter diesen Geschichten mehr als ein besonders beliebtes Hausmärchen steckt, ist umstritten.'),
  knighthood: 'Die Baedd werden als robuste, bodenständige Kämpfer beschrieben. Ihre Ausrüstung greift die Keilerheraldik auf. Das Motiv des kräftigen Tiers prägt den Ruf des Hauses.',
  conflictsAlliances: 'Die Baedd stehen unter dem Grafenhaus Grawn und sind durch ihre ländliche Wirtschaft mit dem Ährental verbunden.'
});
for (const key of Object.keys(prose.ciarog)) prose.ciarog[key] = prose.ciarog[key].replaceAll('Ciarog', 'Ciaróg');
Object.assign(prose.ciarog, {
  history: 'Die Ciaróg zählen sich zu den alten Familien des Landes. Ihre Überlieferung bewahrt die Erinnerung an Crannath-Ursprünge und beschreibt zugleich die schrittweise Einbindung in die cenyrische Gesellschaft.\n\nVon Caer Diwedd aus unterhält das Ritterfürstenhaus Verbindungen zu albischen Clans. Der Austausch mit ihnen gehört zur Hauskultur.',
  knighthood: 'Die Ausbildung betont Vielseitigkeit und nennt Helwyr, Cantref und albische Wege wie den Serf. Auch Seekampf gehört zum beschriebenen Umfeld.',
  conflictsAlliances: 'Verbindungen zu südlichen albischen Clans werden ebenso gepflegt wie Beziehungen zu cenyrischen Häusern. Die Lehensbindung führt zu Haus Grawn.'
});
Object.assign(prose.sgwarnog, {
  history: prose.sgwarnog.history.replace(' Der Name des damaligen Grafen und ein genaues Gründungsdatum werden hier nicht ergänzt.', ''),
  knighthood: 'Das Haus ist vor allem für Verwaltung bekannt, gehört aber zur cenyrischen Rittergesellschaft. Seine Ritter tragen sorgfältig gearbeitete, repräsentative Ausrüstung in Silber, mattem Gold und Grün. Die Kunst der Feder und die Fürsorge für das Land stehen neben der ritterlichen Ausbildung.',
  holdings: 'Aldwynd ist der Stammsitz in der Baronie Flusstal. Ackerbau, die Pflege der Böden und die langfristige Bewirtschaftung ländlicher Besitzungen prägen die Lebensgrundlage.',
  cultureReligion: 'Fleiß und ehrliche Arbeit werden in der Hauskultur mit dem Knecht verbunden; der Hüter erinnert an die Vergänglichkeit von Leben und Wohlstand.',
  conflictsAlliances: 'Die Gründungserzählung erinnert an frühere Spannungen mit Gwarchod und Chiffyddlon. Spätere Beziehungen werden als von Diplomatie und Heiratsverbindungen geprägt beschrieben.'
});
Object.assign(prose.chiffyddlon, {
  overview: "Haus Chiffyddlon O'Glyndraith war ein Ritterfürstenhaus des Ährentals unter Haus Grawn. Seine Dynastie ist erloschen.",
  history: 'Iorwerth Chiffyddlon begründete das Haus. Mit dem Tod des letzten Ritterfürsten Gwilym beim Angriff der Nordmänner auf Glyndraith erlosch die Dynastie.',
  knighthood: 'Die Chiffyddlon gehörten zur cenyrischen Rittergesellschaft. Ihr Hauszeichen ist die Schnecke. Die Hausdarstellung verbindet Dunkelblau und Creme mit einem Plattenharnisch und dem Langschwert.',
  values: 'Besondere Hausbräuche und Wertvorstellungen sind bislang nicht näher überliefert.'
});
Object.assign(prose.gwarchod, {
  overview: "Haus Gwarchod O'Glyndraith war ein Ritterfürstenhaus des Ährentals unter Haus Grawn. Seine Dynastie ist erloschen.",
  history: 'Ector begründete das Haus Gwarchod. Gwernwy war sein letzter Ritterfürst; Delwyn ist als letzter Erbe überliefert.\n\nWaleran Gwarchod überlebte den Krieg in nordmännischer Gefangenschaft. Zehn Jahre nach dem Ende des Hauses kehrte er zurück und schloss sich dem Blutbund an. Später starb er während eines Auftrags; sein genaues Todesjahr ist unbekannt.',
  knighthood: 'Die Gwarchod gehörten zur cenyrischen Rittergesellschaft. Ihr Waschbärwappen begleitet die Hausdarstellung mit blauer Brigantine, Kettenrüstung und Partisane.',
  values: 'Besondere Hausbräuche und Wertvorstellungen sind bislang nicht näher überliefert.'
});
prose.gwythiad = {
  overview: 'Haus Gwythiad ist ein Ritterhaus von Glyndraith in Tristams Ebene im Ährental. Es steht unter Haus Grawn.',
  history: 'Eine nähere Hauschronik ist bisher nicht überliefert.',
  knighthood: 'Die Gwythiad gehören zum cenyrischen Ritterstand. Eine besondere Ausbildungstradition ist bislang nicht näher beschrieben.',
  holdings: 'Der Stammsitz liegt in Glyndraith.',
  conflictsAlliances: 'Das Haus steht in der Lehensbindung zu Haus Grawn.'
};
prose.aroglyn = {
  overview: 'Haus Aroglyn ist ein bürgerliches Haus von Glyndraith in Tristams Ebene im Ährental. Es ist dem Umfeld des Hauses Grawn zugeordnet.',
  history: 'Eine nähere Familienchronik ist bisher nicht überliefert.',
  knighthood: 'Die Aroglyn gehören zum bürgerlichen Hausstand. Ein bestimmter erblicher Beruf oder eine eigene ritterliche Ausbildung ist nicht überliefert.',
  holdings: 'Der Familiensitz liegt in Glyndraith.',
  conflictsAlliances: 'Die Aroglyn sind dem Haus Grawn zugeordnet.'
};
for (const [slug, name, seat] of [['cruithenaech', 'Cruithenaech', 'Dun Clachrath'], ['warthog', 'Warthog', 'Ri Torraird']]) prose[slug] = {
  overview: `Clan ${name} gehört zu den antiken Crannath-Clans des Ährentals. Sein überlieferter Sitz ist ${seat}. Ein genauer Clanrang ist nicht überliefert.`,
  history: 'Die Überlieferung führt in die Zeit der Crannath-Alben vor der Ankunft der Avallornier. Eine eigene ausführliche Clanchronik liegt bislang nicht vor.',
  knighthood: 'Vor der Einführung des cenyrischen Rittertums prägten die Tiarna die Kriegerkultur der Crannath-Alben. Persönliches Können und ehrenvolle Zweikämpfe hatten in dieser Überlieferung besonderes Gewicht. Leder und Pelz sowie Waffen aus Bronze oder Kupfer gehörten zur beschriebenen Ausrüstung.\n\nDie Überfälle der Norrnaigh und die Ankunft der Avallornier veränderten die Kriegsführung. Neue Waffen, Rüstungen und Formen der Ausbildung gingen mit der Verbreitung des Rittertums einher.',
  holdings: `${seat} ist als Sitz des Clans überliefert. Weitere Besitzungen sind bislang nicht näher beschrieben.`
};

const definitions = [
  ['grawn', 'Tristams_Ebene/Haus_Grawn', "Haus Grawn O'Glyndraith"],
  ['marchog', 'Tristams_Ebene/Haus_Marchog'], ['morcanhuc', 'Tristams_Ebene/Haus_Morcanhuc'],
  ['baedd', 'Eberkamm/Haus_Baedd'], ['ciarog', 'Graue_Bucht/Haus_Ciarog'], ['sgwarnog', 'Flusstal/Haus_Sgwarnog'],
  ['gwythiad', 'Tristams_Ebene/Haus_Gwythiad'], ['aroglyn', 'Tristams_Ebene/Haus_Aroglyn'],
  ['chiffyddlon', 'Ausgestorben/Haus_Chiffyddlon'], ['gwarchod', 'Ausgestorben/Haus_Gwarchod'],
  ['cruithenaech', 'Antike_Crannath_Clans/Clan_Cruithenaech'], ['warthog', 'Antike_Crannath_Clans/Clan_Warthog']
];
const rankText = { county: ['Graf', 'Grafenhaus', 'Grafschaft'], barony: ['Baron', 'Baronenhaus', 'Baronie'], 'knight-prince': ['Ritterfürst', 'Ritterfürstenhaus', 'Ritterfürstentum'], knight: ['Ritterherr', 'Ritterhaus', 'Ritterhaus'], commoner: ['Bürger', 'Bürgerliches Haus', 'Bürgerliches Haus'], unknown: ['Nicht überliefert', 'Clan', 'Clan'] };
const territoryPages = {
  marchog: ['herrschaft-marchog', 'Herrschaft der Marchog', 'Herrschaft der Marchog/Herrschaft der Marchog.html'],
  morcanhuc: ['herrschaft-morcanhuc', 'Herrschaft der Morcanhuc', 'Herrschaft der Morcanhuc/Herrschaft der Morcanhuc.html'],
  baedd: ['eberkamm', 'Eberkamm', 'Baronie Eberkamm/Baronie Eberkamm.html'],
  ciarog: ['graue-bucht', 'Graue Bucht', 'Herrschaft Graue Bucht/Herrschaft Graue Bucht.html'],
  sgwarnog: ['flusstal', 'Flusstal', 'Baronie Flusstal/Baronie Flusstal.html']
};
const defaultTerritory = ['aehrental', 'Ährental', 'Grafschaft Ährental.html'];
const unknown = { traditions: 'Besondere Hausbräuche sind bisher nicht näher überliefert.', cultureReligion: 'Eine eigene religiöse Überlieferung ist bisher nicht näher beschrieben.', values: 'Besondere Wertvorstellungen und eine verbindliche Hausdevise sind bislang nicht näher überliefert.', conflictsAlliances: 'Weitere Bündnisse und Fehden sind bislang nicht näher beschrieben.', holdings: 'Weitere Besitzungen und Einnahmequellen sind bislang nicht näher überliefert.' };
const sourceDecisions = [
  'Aktuelle Familienregistrierung, Hausprofile und tatsächliche Sitze haben Vorrang vor sämtlichen alten HTML-Tabellen.',
  'Die Quellabschnitte Hierarchie und Stammbaum werden vollständig ignoriert. Keine Person, Verwandtschaft, Lebenszahl oder Hauslinie wird daraus importiert.',
  'Alle alten Infotabellen, Hof- und Erbfolgetabellen bleiben ungerendert. Hofkarten verweisen ausschließlich auf bereits vorhandene Personen und ihre aktuellen registrierten Titel.',
  'Sämtliche Militärstatistiken, Truppenmengen, Flottenmengen und militärischen Größenvergleiche werden verworfen; militärische Profilfelder bleiben leer und verborgen.',
  'Beschreibender Text wird nur qualitativ und widerspruchsfrei übernommen. Quellenlücken und Platzhalter erzeugen keine neuen Fakten.',
  'Wappen und Regionalbanner verwenden die aktuellen lokalen Registerbilder. Abweichende alte Orts-, Amts- oder Herrschaftsangaben begründen keine Änderungen am Register.'
];

for (const [slug, folder, overrideName] of definitions) {
  const id = `haus-${slug}`, record = FAMILY_REGISTRY.find(row => row.id === id);
  if (!record) throw new Error(`Missing current family: ${id}`);
  const family = record.family, document = family.document, canonical = document.houseProfile;
  const [rank, type, scale] = rankText[canonical.rankId];
  const prepared = ['gwythiad', 'aroglyn', 'cruithenaech', 'warthog'].includes(slug);
  const extinct = ['chiffyddlon', 'gwarchod'].includes(slug);
  const name = overrideName || document.title;
  const relativeFolder = `Estryll/Cenyr/Aehrental/${folder}`;
  const directory = new URL(`${relativeFolder}/`, feature);
  const target = new URL('haus.content.mjs', directory);
  try { await access(target); throw new Error(`Refusing to overwrite existing authoring file ${fileURLToPath(target)}`); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
  await mkdir(new URL('assets/', directory), { recursive: true });
  const source = intake.find(row => row.slug === slug);
  const sourceBytes = await readFile(source.sourcePath);
  await writeFile(new URL('animexx-source-2026-11-03.html', directory), sourceBytes);
  const [territoryId, territoryName, territoryPart] = territoryPages[slug] || defaultTerritory;
  const territoryHref = `../Kontinente/Estryll/Königreich Cenyr/Grafschaft Ährental/${territoryPart}`;
  const sections = { ...unknown, ...prose[slug] };
  const portraitEntry = (person, role) => ({ id: person.id, familyId: id, name: person.name, role, detail: person.title || '', image: person.portrait ? `../Stammbäume/${person.portrait}` : '', silhouette: person.sex === 'female' ? 'female' : 'male' });
  // Prepared anonymous figures are not converted into named court cards.
  const heads = prepared ? [] : family.persons.filter(person => person.lineageRole === 'head').map(person => portraitEntry(person, extinct ? 'Historisches Oberhaupt' : 'Oberhaupt'));
  const heirs = prepared ? [] : family.persons.filter(person => /Erbe des Hauses/.test(person.title || '')).map(person => portraitEntry(person, extinct ? 'Historische Erbfolge' : 'Erbfolge'));
  const offices = prepared ? [] : family.persons.filter(person => /Schatzmeister|Kommandant|Hofdame|Hofkaplan/.test(person.title || '')).map(person => portraitEntry(person, person.title));
  const founder = prepared ? null : family.persons.find(person => /\b(?:Begründer|Gründer)\b/.test(person.title || ''));
  const currentHead = heads.at(-1)?.name || '';
  const hierarchy = [
    { type: 'Sammlung', name: 'Familien Häuser und Clans', slug: 'familien-hauser-und-clans' },
    { type: 'Kontinent', name: 'Estryll', slug: 'estryll' },
    ...[canonical.kingdom, canonical.county, canonical.barony, canonical.seat].map((value, index) => ({ type: ['Königreich', 'Grafschaft', 'Region', 'Sitz'][index], name: value, slug: slugify(value || '') })).filter(entry => entry.name),
    { type: type === 'Clan' ? 'Clan' : 'Haus', name, slug: id }
  ];
  sections.succession = extinct ? 'Die Dynastie ist erloschen.' : heirs.length ? `Die bekannte Erbfolge nennt ${heirs.map(entry => entry.name).join(', ')}.` : 'Eine namentliche Erbfolge ist bislang nicht überliefert.';
  sections.court = heads.length ? `${extinct ? 'Die Geschichte des Hauses bewahrt die Namen seiner Oberhäupter.' : `${currentHead} führt das Haus.`} Die verlinkten Personen sind im Stammbaum zu finden.` : 'Namentliche Oberhäupter und Hofämter sind bislang nicht näher überliefert.';
  sections.familyTree = 'Der Stammbaum zeigt die Angehörigen und Verbindungen des Hauses.';
  sections.historicalFigures = founder ? `Die Gründungsgeschichte erinnert an ${founder.name}.` : 'Historische Persönlichkeiten sind bislang nicht näher ausgearbeitet.';
  const supplied = originals.find(row => row.slug === slug && row.section === 4);
  const secondOriginal = ['gwythiad', 'cruithenaech', 'warthog'].includes(slug) ? new URL(`assets-second/${slug}-source-illustration.png`, import.meta.url) : null;
  const originalPath = supplied?.path || secondOriginal;
  const mainAsset = slug === 'sgwarnog' ? 'feudalritter-2026-11-03.png' : originalPath ? 'hausdarstellung-original.png' : 'hausdarstellung-2026-11-03.png';
  const scene = `${relativeFolder}/assets/${mainAsset}`;
  const imageManifest = [];
  if (originalPath) {
    const bytes = await readFile(originalPath);
    await copyFile(originalPath, new URL('assets/hausdarstellung-original.png', directory));
    imageManifest.push({ role: slug === 'sgwarnog' ? 'Fußknecht' : 'Hausdarstellung', ...(supplied?.url ? { url: supplied.url } : {}), localPath: 'assets/hausdarstellung-original.png', status: 'downloaded-and-visually-reviewed', sha256: sha256(bytes), note: 'Vorhandene passende Darstellung unverändert übernommen.' });
  }
  if (['aroglyn', 'chiffyddlon', 'gwarchod', 'sgwarnog'].includes(slug)) imageManifest.push({ role: slug === 'sgwarnog' ? 'Feudalritter' : type === 'Bürgerliches Haus' ? 'Bürgerliche Hausdarstellung' : 'Ritterliche Hausdarstellung', localPath: `assets/${mainAsset}`, status: 'generated-asset-pending-parent-review', note: 'Ergänzende Darstellung; keine neue benannte Person oder genealogische Aussage.' });
  const content = {
    id, name, type, page: prepared ? 'kleinehaeuser.html' : 'haus.html', county: canonical.county,
    liege: canonical.liegeHouseName || (slug === 'grawn' ? 'Krone Cenyrs' : ''),
    territoryId, territoryName, territoryHref, parentHouseId: canonical.liegeHouseId || '', extinct,
    showMotto: Boolean(document.motto), registerPage: true, prepared, contentVersion: '20261103-aehrental-v1',
    biographySourceRevision: (family.extensions.sourceRevision || 0) + 1, biographyPreviousDefaultFingerprints: [],
    biographyIntroTitle: 'Über das Haus', biographyHistoryTitle: 'Geschichte',
    placeholders: { male: '../Stammbäume/assets/images/placeholders/male.png', female: '../Stammbäume/assets/images/placeholders/female.png' },
    allies: [], hierarchy,
    profile: { highestTitle: rank, rank, houseType: scale, motto: document.motto || '', quoteAuthor: '', seat: canonical.seat || '', affiliation: `${canonical.kingdom} · ${canonical.county}`, liege: canonical.liegeHouseName || (slug === 'grawn' ? 'Krone Cenyrs' : ''), troopStrength: '', tiarna: '', kerns: '', fleet: '', founding: '', milestoneOne: '', milestoneTwo: '', patron: '', knightingPatron: '', people: '', wealth: '', religion: '', patronDeities: '', origin: '', cadetBranches: '', allies: '', enemies: '' },
    omitMilitaryProfile: true, sections,
    images: { crest: `../Stammbäume/${document.emblem}`, scene, sceneAlt: `${type === 'Bürgerliches Haus' ? 'Bürgerliche Hausdarstellung' : slug === 'sgwarnog' ? 'Feudalritter' : 'Hausdarstellung'} · ${name}`, banner: `../Stammbäume/${canonical.regionEmblems.barony || canonical.regionEmblems.county}` },
    illustrationCategory: type === 'Bürgerliches Haus' ? 'Bürgerliche Hausdarstellung' : 'Hausdarstellung',
    ...(slug === 'sgwarnog' ? { warriorGallery: { title: 'Ritter und Gefolge der Sgwarnog', introduction: 'Repräsentative Ritterrüstung und schlichtere Ausrüstung des Fußgefolges zeigen unterschiedliche Rollen im Haus.', entries: [ { name: 'Feudalritter', description: 'Repräsentativer Ritter in Silber, mattem Gold und Grün.', image: scene }, { name: 'Fußknecht', description: 'Schlichtere Ausrüstung des Hausgefolges.', image: `${relativeFolder}/assets/hausdarstellung-original.png` } ] } } : {}),
    cadets: [], founder: founder ? portraitEntry(founder, 'Gründer') : null, heads, headsNote: 'Die Oberhäupter und ihre Titel sind im verlinkten Stammbaum verzeichnet.', heirs, offices,
    figuresTitle: 'Historische Persönlichkeiten', figures: founder ? [{ ...portraitEntry(founder, 'Gründer'), description: sections.historicalFigures }] : [], trivia: [], currentHead, firstHeir: heirs[0]?.name || '',
    biographySummary: { overview: sections.overview, history: sections.history, character: sections.values, customs: sections.traditions, holdings: sections.holdings, culture: sections.cultureReligion, relations: sections.conflictsAlliances, influence: [], achievements: [], trivia: [] }
  };
  await writeFile(target, `// Redaktionelle Quelle für Hausseite und Hausbiografie.\n// Quellenentscheidungen: source-manifest.json. Aktuelle Akte und Hausprofile bleiben maßgeblich.\nexport const HOUSE_CONTENT = ${JSON.stringify(content, null, 2)};\n`, 'utf8');
  const manifest = { source: { attachmentId: source.attachment, file: 'animexx-source-2026-11-03.html', sha256: sha256(sourceBytes) }, genealogy: { imported: false, ignoredSourceSections: ['Hierarchie', 'Stammbaum'], familyId: id, existingGraphUnchanged: true }, authority: { familyId: id, profileSource: 'Stammbäume/assets/js/data/aehrental-house-profiles.js', baselineSourceRevision: family.extensions.sourceRevision || 0, currentSeat: canonical.seat || '', currentRankId: canonical.rankId }, images: imageManifest, decisions: [...sourceDecisions, ...(prepared ? ['Die dünne Vorlage bleibt eine vorbereitete Seite; anonyme bestehende Figuren werden nicht als benannte Hausmitglieder ausgearbeitet.'] : []), ...(['cruithenaech', 'warthog'].includes(slug) ? ['Historischer Clanstatus und unbekannter Rang bleiben erhalten. Ein erloschener Status wird nicht aus den pauschalen alten Tabellen angenommen.'] : []), ...(extinct ? ['Das O’Glyndraith im überlieferten Namen erzeugt keinen heutigen Stammsitz. Der aktuelle Sitz bleibt leer.'] : []), ...(slug === 'morcanhuc' ? ['Eine versehentlich mit Marchog beschriftete Besitzpassage wurde nicht übernommen.'] : []), ...(slug === 'sgwarnog' ? ['Die widersprüchliche alte Infotabelle ersetzt nicht die beschreibenden Bezüge zu Knecht und Hüter. Original-Fußknecht und ergänzter Feudalritter bleiben getrennt sichtbar.'] : []), ...(slug === 'ciarog' ? ['Die aktuelle Schreibweise Ciaróg und der Ritterfürstenrang haben Vorrang; die Vorlage begründet keine Kern-Ausbildung.'] : [])] };
  await writeFile(new URL('source-manifest.json', directory), JSON.stringify(manifest, null, 2) + '\n', 'utf8');
  console.log(`${id}: ${relativeFolder}/haus.content.mjs`);
}
