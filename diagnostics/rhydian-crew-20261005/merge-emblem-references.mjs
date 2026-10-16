import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';

// Die parallele Entwurfsfassung bewahren; nur Wappenpfade und Bildbeschreibungen
// mit den tatsächlich erzeugten und lokal geprüften Assets abgleichen.
const file = 'Stammbäume/assets/js/data/rhydian-crew-house-families.js';
const before = readFileSync(file, 'utf8');
const snapshot = 'diagnostics/rhydian-crew-20261005/parallel-family-source-before-emblem-merge.js.txt';
if (!existsSync(snapshot)) writeFileSync(snapshot, before);
const heraldry = [
  ['Auf tiefem Petrol ein silbernes Steuerruder durch zwei silberne Wellenbänder, darüber ein goldener Leitstern; runder dunkler Rand mit goldenem Flechtknotenband.', 'Auf Dunkelgrün eine silberne Weide über einem goldenen offenen Boot und drei silbernen Wellenbändern; schlichter antikgoldener Rundrand mit schwarzer Kontur.'],
  ['Auf Weinrot ein goldener Stockanker vor zwei gekreuzten silbernen Schwertern, darunter ein silbernes Wellenband; runder silberner Rand mit goldenem Flechtknotenband.', 'Auf Weinrot eine goldene dreilappige Seilschlinge mit zwei silbernen Sternen; schlichter antikgoldener Rundrand mit schwarzer Kontur.'],
  ['Auf Marineblau ein goldenes Fass mit zwei dunklen Reifen, darüber drei silberne Salzkristalle und darunter zwei silberne Wellenbänder; runder dunkler Rand mit goldenem Flechtknotenband.', 'Auf Nachtblau ein silberner Salzberg in einem goldenen offenen Bottich mit zwei dunklen Reifen, darunter drei goldene Wellenbänder; schlichter antikgoldener Rundrand mit schwarzer Kontur.']
];
let after = before.replace('assets/images/houses/Klaueninsel/rhydian-crew/haus-${definition.slug}.png', 'assets/images/houses/Klaueninsel/rhydian-new-families-2026-10-05/haus-${definition.slug}.png');
for (const [original, replacement] of heraldry) {
  assert.ok(after.includes(original), 'Entwurf wurde erneut verändert; nicht überschreiben.');
  after = after.replace(original, replacement);
}
const hash = content => createHash('sha256').update(content).digest('hex');
assert.equal(hash(readFileSync(file, 'utf8')), hash(before), 'Gleichzeitige Bearbeitung erkannt; nicht überschreiben.');
writeFileSync(file, after);
console.log('Aktuelle Hausränge und Familientraditionen erhalten; Wappenpfade und Beschreibungen abgeglichen. Vorige Fassung separat gesichert.');
