// Einmalige Erstübernahme. Spätere Redaktion bleibt in den einzelnen Hausquellen.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { createPreparedHouseContent } from '../../Familien Häuser und Clans/modules/house-content/prepared-house-content.mjs';

const records = JSON.parse(readFileSync(new URL('before.json', import.meta.url), 'utf8'));
const descriptions = {
  ferlan: 'Das Hauszeichen verbindet Hammer und Amboss mit Funken auf Rot.',
  argyllan: 'Das Hauszeichen zeigt einen Berg über gekreuzten Werkzeugen und Münzen auf dunklem Blau.',
  delvor: 'Auf dem Hauszeichen hängt eine goldene Laterne über einem dunklen Gebirgstal.',
  corant: 'Das Hauszeichen zeigt einen Leuchtturm über Wellen mit zwei goldenen Lichtbahnen.',
  faelcaran: 'Auf dem Hauszeichen steht ein dunkler Vogel über weißen Bergspitzen und einer hellen Flamme.',
  llyncar: 'Das Hauszeichen verbindet einen hellen Fisch, eine Hängelampe und Wellen auf Blaugrün.',
  maredwyn: 'Das Hauszeichen zeigt eine helle Spiralmuschel mit einer Perle über blauen Wellen.',
  morfynn: 'Kerze, Räuchergefäß und Münzen bilden das goldene Motiv des hellen Hauszeichens.',
  selaeth: 'Das Hauszeichen zeigt eine goldene Robbe auf einem Felsen über dem Meer.',
  arven: 'Das Hauszeichen verbindet einen goldenen Anker mit einer Waage und einer Kerze auf Rot.',
  brithfaen: 'Das Familienzeichen zeigt einen Stein mit gekreuzten Werkzeugen und Münzen auf dunklem Blau.'
};
const territory = { id: 'grafschaft-silberinsel', name: 'Silberinsel',
  href: '../Kontinente/Estryll/Königreich Cenyr/Grafschaft Silberinsel/Grafschaft Silberinsel.html' };
const outputs = [];
for (const record of records.filter(record => Object.hasOwn(descriptions, record.id.slice(5)))) {
  const id = record.id.slice(5);
  const folder = `Estryll/Cenyr/Silberinsel/Silberbucht/Haus_${id[0].toUpperCase()}${id.slice(1)}`;
  const directory = `Familien Häuser und Clans/${folder}`;
  const file = `${directory}/haus.content.mjs`;
  if (existsSync(file)) throw new Error(`Bereits vorhanden: ${file}`);
  mkdirSync(`${directory}/assets`, { recursive: true });
  const content = createPreparedHouseContent({ record, territory, image: `${folder}/assets/hausdarstellung-2026-11-03.png`,
    emblemDescription: descriptions[id], contentVersion: '20261103-silberinsel-v1' });
  writeFileSync(file, `// Redaktionelle Quelle: vorhandenes Register; weitere Hausgeschichte bleibt offen.\nexport const HOUSE_CONTENT = ${JSON.stringify(content, null, 2)};\n`);
  outputs.push({ id: record.id, content: file, image: `${directory}/assets/hausdarstellung-2026-11-03.png`, emblem: `Stammbäume/${record.emblem}` });
}
writeFileSync(new URL('prepared-houses.json', import.meta.url), JSON.stringify(outputs, null, 2) + '\n');
console.log(`${outputs.length} vorbereitete Hausquellen erstellt.`);
