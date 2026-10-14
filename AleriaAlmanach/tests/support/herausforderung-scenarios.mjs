import { readFile } from 'node:fs/promises';

const root = new URL('../../../', import.meta.url);
const registry = JSON.parse(await readFile(new URL('CharakterDatenbank/registry.json', root), 'utf8'));
export const actors = await Promise.all(['Gawain Draig', 'Guinevere Neidr'].map(async name => {
  const entry = registry.records.find(record => record.name === name);
  if (!entry) throw Error(`${name}: Charakterbogen fehlt.`);
  return JSON.parse(await readFile(new URL(`CharakterDatenbank/${entry.path}`, root), 'utf8')).character;
}));

export const scenarios = [
  { id: 'gate', title: 'Die verschlossene Torwache', description: 'Die Wache lässt niemanden ohne glaubhaften Grund passieren.', label: 'Mit der Wache verhandeln', skillId: 'persuasion', kind: 'speech', difficulty: 15, natural: [12, 12], tier: 'erfolg', insight: 'Die Wache erwartet das Losungswort Silbermorgen.', partialHint: 'Die Wache erwähnt den Morgen.', failureConsequence: 'Die Wache wird misstrauisch.' },
  { id: 'tracks', title: 'Spuren im Regen', description: 'Zwei Fährten verschwinden zwischen den nassen Bäumen.', label: 'Die Fährte lesen', skillId: 'survival', kind: 'interact', difficulty: 15, natural: [12, 10], tier: 'knapp', insight: 'Die gesuchte Fährte führt zur alten Mühle.', partialHint: 'Eine Spur scheint nach Osten zu führen; der Regen verwischt ihre Herkunft.', failureConsequence: 'Die Suche kostet Zeit.' },
  { id: 'bridge', title: 'Die brüchige Zugbrücke', description: 'Ein Mechanismus hält die beschädigte Brücke fest.', label: 'Den Mechanismus lösen', skillId: 'investigation', preferredSkills: ['athletics'], kind: 'thought', difficulty: 15, natural: [5, 5], tier: 'deutlich', insight: 'Ein Hebel hinter dem rechten Träger löst die Sperre.', partialHint: 'Der rechte Träger scheint wichtig.', failureConsequence: 'Der Mechanismus verkantet hörbar; die Sperre bleibt bestehen.' },
  { id: 'runes', title: 'Das versiegelte Runentor', description: 'Verblasste Zeichen umranden ein steinernes Tor.', label: 'Die verborgene Zeichenfolge entschlüsseln', skillId: 'investigation', kind: 'thought', difficulty: 40, natural: [20, 20], tier: 'kritischer-erfolg', insight: 'Drei Mondsymbole öffnen den Durchgang zur verborgenen Kammer.', partialHint: 'Ein Mondsymbol reagiert auf Berührung.', failureConsequence: 'Das Tor bleibt stumm.' }
];
