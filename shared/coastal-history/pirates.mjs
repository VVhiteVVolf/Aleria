import { coastalSource } from './coastal-sources.mjs';
import { coastalArt as art } from './art.mjs';

const original = (source, index) => `Archiv/Quellen/kuestenchroniken-2026-10-24/assets/source-${String(source).padStart(2, '0')}-${String(index).padStart(2, '0')}.png`;
const great = (id, name, source, summary) => ({ id, name, sourceId: `coastal-${source}`, tier: 'great', parentId: null, summary, image: original(source, 1), symbol: `Fraktionen/assets/emblems/dunkle-gilden/${id}.webp`, imageNote: 'Vorläufige Kriegerdarstellung aus der überlieferten Vorlage; keine benannte historische Person.' });
const crew = (id, name, parentId, source, imageIndex, rank = 'Bande') => ({ id, name, parentId, tier: 'crew', rank, sourceId: `coastal-${source}`, symbol: original(source, imageIndex), image: parentId === 'schwarzblut-marodeure' ? art(id) : original(source, 1), imageNote: parentId === 'schwarzblut-marodeure' ? 'Symbolisches Szenenbild; dargestellte Seeleute sind unbenannt.' : 'Vorläufige Darstellung der übergeordneten Großpiraten; kein belegtes Einzelporträt dieser Bande.', summary: `${name} sind in der Gliederung der ${parentId === 'klauen-des-leviathan' ? 'Klauen des Leviathan' : parentId === 'sirenenzahn' ? 'Sirenenzahn' : 'Schwarzblut Marodeure'} als ${rank} aufgeführt. Ein eigenständiger ausgearbeiteter Bericht liegt noch nicht vor.` });

export const PIRATES = Object.freeze([
  great('blutsegel-marodeure', 'Blutsegel Marodeure', 17, 'Eine der vier Großpiraten-Gruppierungen. Ihre eigene Geschichte, Führung und untergeordneten Banden sind in der beigefügten Vorlage noch nicht ausgearbeitet.'),
  great('klauen-des-leviathan', 'Klauen des Leviathan', 16, 'Eine der vier Großpiraten-Gruppierungen. Die überlieferte Gliederung nennt fünf angeschlossene Banden; die übrigen Profilabschnitte bleiben vorerst offen.'),
  great('schwarzblut-marodeure', 'Schwarzblut Marodeure', 14, 'Ein loses Kollektiv eigenständiger Piratenbanden ohne gemeinsame zentrale Führung. Neun benannte Banden sind in der Gliederung belegt.'),
  great('sirenenzahn', 'Sirenenzahn', 18, 'Eine der vier Großpiraten-Gruppierungen. Drei angeschlossene Banden sind benannt; Führung, Geschichte und Stützpunkte sind noch nicht ausgearbeitet.'),
  ...[
    ['graubart-piraten', 'Graubart Piraten'], ['truebwasser-hehler', 'Trübwasser Hehler'],
    ['sturmbucht-schurken', 'Sturmbucht Schurken'], ['doppelkoeder-piraten', 'Doppelköder Piraten'], ['hoellenpforte', 'Höllenpforte']
  ].map(([id, name], index) => crew(id, name, 'klauen-des-leviathan', 16, 4 + index, index < 4 ? 'große Bande innerhalb der Klauen' : 'kleinere Bande')),
  ...[
    ['schwarzbucht-marodeure', 'Schwarzbucht Marodeure'], ['blutegel-piraten', 'Blutegel Piraten'], ['meeres-fledderer', 'Meeres Fledderer'],
    ['silberne-hand', 'Silberne Hand'], ['koeder-piraten', 'Köder Piraten'], ['weisspranken-gesindel', 'Weißpranken Gesindel'],
    ['flutbeisser', 'Flutbeißer'], ['nebelschnitter', 'Nebelschnitter'], ['zungenfresser', 'Zungenfresser']
  ].map(([id, name], index) => crew(id, name, 'schwarzblut-marodeure', 14, 4 + index, index < 3 ? 'große Einzelbande' : 'kleinere Bande')),
  ...[['wilde-korsaren', 'Wilde Korsaren'], ['flinke-hetzer', 'Flinke Hetzer'], ['sirenenschaender', 'Sirenenschänder']]
    .map(([id, name], index) => crew(id, name, 'sirenenzahn', 18, 4 + index, 'große Bande innerhalb der Sirenenzahn'))
].map(entry => {
  const detail = {
    'schwarzbucht-marodeure': { sourceId: 'coastal-10', leader: 'Skorviðr', ships: 6, crew: [300, 340], area: 'Cenyrs Westküste · Rhonwens Tränen · albische Südküsten', summary: 'Eine der größten Einzelbanden des Schwarzblut-Kollektivs. Unter Skorviðr beteiligt sie sich mit sechs Schiffen am Raubzug durch Leitheach 1733.' },
    'nebelschnitter': { sourceId: 'coastal-11', leader: 'Halrjarn', ships: 3, crew: [150, 200], area: 'Ostküste Aldrimars · Krähenmoor · Kronental', summary: 'Aus dem aldrimarischen Bürgerkrieg hervorgegangene Piratenkultur, die über Generationen weiterbesteht. Bekannt für nächtliche Überfälle und Täuschung; 1733 unter Halrjarn.' },
    'flutbeisser': { sourceId: 'coastal-12', leader: 'Tharn', ships: 2, crew: [80, 100], area: 'Albische Südküsten · Handelswege zwischen Estryll und Lothir', summary: 'Eine albische Piratenbande mit ceithischen Deserteuren, die sich als Händler und Fischer tarnt. 1733 segeln zwei ihrer Schiffe unter Tharn nach Leitheach.' },
    'zungenfresser': { sourceId: 'coastal-13', leader: 'Vargund Tungungrifr', ships: 4, crew: [180, 240], area: 'Albische Südküsten · Ostküste Aldrimars', alias: 'Tungungrífr', summary: 'Ein abgeschlossener raubender Clan aus Yrmandrall. Die als Tungungrífr bekannten Zungenfresser beteiligen sich 1733 unter Vargund mit vier Schiffen am Raubzug.' }
  }[entry.id];
  return Object.freeze({ ...entry, ...detail, moduleId: `piraterie-${entry.id}`, moduleHref: `AleriaAlmanach/AleriaAlmanach.html?entry=piraterie-${entry.id}`, profileHref: `Piraterie/banden/${entry.id}.html`, factionHref: `Fraktionen/Piraten/${entry.id}.html` });
}));
export const GREAT_PIRATES = Object.freeze(PIRATES.filter(entry => entry.tier === 'great'));
export const LEITHEACH_PIRATES = Object.freeze(['schwarzbucht-marodeure', 'nebelschnitter', 'flutbeisser', 'zungenfresser'].map(pirateById));
export function pirateById(id) {
  const entry = PIRATES.find(item => item.id === id);
  if (!entry) throw new Error(`Unbekannte Piratenbande: ${id}`);
  return entry;
}
export function pirateChildren(id) { return PIRATES.filter(entry => entry.parentId === id); }
export function pirateSource(entry) { return coastalSource(entry.sourceId); }
