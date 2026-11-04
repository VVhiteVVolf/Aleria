// Einmalige Erstübernahme. Spätere Redaktion erfolgt je Haus in haus.content.mjs.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import path from 'node:path';

const records = JSON.parse(readFileSync(new URL('before.json', import.meta.url), 'utf8'));
const motifs = {
  bronnor: 'ein roter Adler mit ausgebreiteten Schwingen über einem roten Fels auf dunklem Grund',
  caerfran: 'ein schwarzer Rabe mit einem Zweig über dunklen Bergen auf Violett',
  coedrudd: 'ein Specht an einem Baumstamm auf Rot',
  barcud: 'ein rotbrauner Greifvogel vor gekreuztem Hammer und Spitzhacke auf dunklem Blau',
  durdynn: 'ein goldener Greifvogel über einem Amboss auf dunklem Grund',
  gwylen: 'ein goldener Adlerkopf zwischen Zweigen auf Grün',
  faelwyn: 'eine silberne Eule mit geöffneten Schwingen über einem Berg auf Blau',
  gwyntell: 'eine weiße Taube mit geöffneten Schwingen auf Blau',
  gwyliadwr: 'ein grauer Greifvogel vor zwei gekreuzten Speeren auf Grün',
  helyg: 'ein goldener Vogel über einem Weidenzweig auf Blau',
  ffwnarch: 'ein goldener Vogel neben Feder und Beutel auf dunklem Blau'
};
const root = 'Familien Häuser und Clans';
const version = '20261103-tal-der-milane-v1';
const slug = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
const outputs = [];
for (const record of records.filter(record => Object.hasOwn(motifs, record.id.slice(5)))) {
  const id = record.id.slice(5);
  const commoner = record.profile.rankId === 'commoner';
  const type = commoner ? 'Bürgerliches Haus' : 'Ritterhaus';
  const folder = `Estryll/Cenyr/Tal_der_Milane/Yvains_Klamm/Haus_${id[0].toUpperCase()}${id.slice(1)}`;
  const directory = path.join(root, folder);
  const target = path.join(directory, 'haus.content.mjs');
  if (existsSync(target)) throw new Error(`Bereits vorhanden: ${target}`);
  mkdirSync(path.join(directory, 'assets'), { recursive: true });
  // Die jüngere ausdrücklich benannte Lehenszuordnung der Herrschaftsquelle gilt
  // für die Hausseite; die bestehende genealogische Platzierung bleibt erhalten.
  const liege = id === 'faelwyn' ? "Haus Tylluan O'Penbryn" : record.profile.liegeHouseName;
  const overview = `${record.title} ist als ${commoner ? 'bürgerliche Familie' : 'niederes Ritterhaus'} in Penbryn verzeichnet. Der Registerort liegt in Yvains Klamm, einer Baronie im Tal der Milane innerhalb des Königreichs Cenyr. ${commoner ? 'Die örtliche Zuordnung' : 'Die Lehenszuordnung'} nennt ${liege}.`;
  const history = 'Eine ausgearbeitete Hauschronik, ein Gründungsjahr und eine namentlich belegte Gründerfolge liegen bislang nicht vor.';
  const character = `Auf dem vorhandenen Hauszeichen ist ${motifs[id]} dargestellt. Darüber hinaus sind besondere Hausbräuche, Werte und ein verbindlicher Leitspruch noch nicht ausgearbeitet.`;
  const relations = id === 'durdynn'
    ? 'Caryl Durdynn ist mit Cónán Sliabh verlobt. Die bestehende Familienakte hält diese Verbindung fest; Cónán gehört zum Haus Sliabh. Caryl ist die bislang einzige namentlich belegte Angehörige dieses Durdynn-Zweigs. Ihre genaue Abstammung und ihr Geburtsjahr sind nicht überliefert.'
    : 'Weitere familiäre Verbindungen, Bündnisse und Fehden sind bisher nicht ausgearbeitet.';
  const summary = { overview, history, character, relations };
  if (commoner) summary.holdings = 'Ein bestimmter Familienberuf, ein eigener Betrieb und konkrete Besitzungen sind noch nicht belegt.';
  const content = {
    id: record.id, name: record.title, type, page: 'kleinehaeuser.html',
    county: 'Tal der Milane', liege,
    territoryId: id === 'faelwyn' ? 'herrschaft-tylluan' : 'tal-der-milane',
    territoryName: id === 'faelwyn' ? 'Herrschaft der Tylluan' : 'Tal der Milane',
    territoryHref: id === 'faelwyn'
      ? '../Kontinente/Estryll/Königreich Cenyr/Grafschaft Tal der Milane/Herrschaft der Tylluan/Herrschaft der Tylluan.html'
      : '../Kontinente/Estryll/Königreich Cenyr/Grafschaft Tal der Milane/Grafschaft Tal der Milane.html',
    parentHouseId: '', extinct: false, showMotto: false, registerPage: true, prepared: true,
    contentVersion: version, biographySourceRevision: record.sourceRevision + 1,
    biographyPreviousDefaultFingerprints: [], biographyIntroTitle: 'Über das Haus',
    biographyHistoryTitle: 'Bisherige Überlieferung', biographySummary: summary,
    placeholders: { male: '../Stammbäume/assets/images/placeholders/male.png', female: '../Stammbäume/assets/images/placeholders/female.png' },
    allies: [], hierarchy: [{ type: 'Sammlung', name: root, slug: 'familien-hauser-und-clans' },
      ...record.folderPath.map((name, index) => ({ type: ['Königreich', 'Grafschaft', 'Region', 'Sitz'][index], name, slug: slug(name) })),
      { type: 'Haus', name: record.title, slug: record.id }],
    profile: { highestTitle: commoner ? 'Bürgerlich' : 'Ritterherr', rank: commoner ? 'Bürgerlich' : 'Ritterherr', houseType: type,
      motto: '', quoteAuthor: '', seat: record.profile.seat, affiliation: 'Tal der Milane', liege,
      troopStrength: '', tiarna: '', kerns: '', fleet: '', founding: '', milestoneOne: '', milestoneTwo: '',
      patron: '', knightingPatron: '', people: '', wealth: '', religion: '', patronDeities: '', origin: '', cadetBranches: '', allies: '', enemies: '' },
    omitMilitaryProfile: true,
    sections: { overview, history, traditions: 'Besondere Hausbräuche sind bisher nicht überliefert.',
      knighthood: commoner ? 'Die Familie gehört zum bürgerlichen Stand. Ein bestimmter Familienberuf ist noch nicht belegt.' : 'Der Ritterstand des Hauses ist im Register festgehalten. Eine eigene Rüstungstradition oder besondere Ausbildung ist bisher nicht beschrieben.',
      holdings: commoner ? summary.holdings : 'Eigene Ländereien, Burgen und Einnahmequellen sind bislang nicht näher beschrieben.',
      cultureReligion: 'Eine besondere religiöse Überlieferung des Hauses ist bisher nicht ausgearbeitet.',
      conflictsAlliances: relations, values: character,
      succession: 'Eine namentlich gesicherte Erbfolge ist noch nicht überliefert.',
      court: 'Namentliche Oberhäupter und eigene Amtsbesetzungen sind bisher nicht belegt.',
      familyTree: 'Hier ist die bereits vorhandene Familienakte eingebettet. Das Hauswappen im Stammbaum öffnet die Hausbiografie.',
      historicalFigures: 'Historische Persönlichkeiten sind bisher nicht namentlich ausgearbeitet.' },
    images: { crest: `../Stammbäume/${record.emblem}`, scene: `${folder}/assets/hausdarstellung-2026-11-03.png`,
      sceneAlt: `${commoner ? 'Bürgerliche' : 'Ritterliche'} Hausdarstellung · ${record.title}`,
      banner: '../Stammbäume/assets/images/regions/tal-der-milane.png' },
    illustrationCategory: commoner ? 'Bürgerliche Hausdarstellung' : 'Hausdarstellung',
    cadets: [], founder: null, heads: [], heirs: [], offices: [], figuresTitle: 'Historische Persönlichkeiten', figures: [], trivia: [], currentHead: '', firstHeir: ''
  };
  if (commoner) Object.assign(content, { headsTitle: 'Familie und Haushalt', officesTitle: 'Angehörige und Aufgaben' });
  writeFileSync(target, `// Redaktionelle Quelle: vorhandenes Register; weitere Hausgeschichte bleibt offen.\nexport const HOUSE_CONTENT = ${JSON.stringify(content, null, 2)};\n`);
  outputs.push({ id: record.id, content: target.replaceAll('\\', '/'), image: `${root}/${content.images.scene}`, emblem: `Stammbäume/${record.emblem}`, motif: motifs[id], rank: record.profile.rankId });
}
writeFileSync(new URL('prepared-houses.json', import.meta.url), JSON.stringify(outputs, null, 2) + '\n');
console.log(`${outputs.length} vorbereitete Hausseitenquellen erstellt.`);
