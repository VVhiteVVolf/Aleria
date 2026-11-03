// Einmalige Erstübernahme. Spätere Redaktion bleibt in den Hausquellen.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createPreparedHouseContent } from '../../Familien Häuser und Clans/modules/house-content/prepared-house-content.mjs';

const repository = fileURLToPath(new URL('../../', import.meta.url));
const records = JSON.parse(readFileSync(new URL('before.json', import.meta.url), 'utf8'));
const illustrations = JSON.parse(readFileSync(new URL('image-prompts.json', import.meta.url), 'utf8'));
const selected = new Set([
  'gwaedryn', 'rhavorn', 'pergarn', 'donwyr', 'uffyrn', 'pwllor',
  'llurien', 'neddair', 'cyrwain', 'donvael', 'rhenith', 'bellyn',
  'fenor', 'loryn', 'orlen', 'renvyn'
].map(slug => `haus-${slug}`));
const territory = {
  id: 'grafschaft-sonnenkueste',
  name: 'Grafschaft Sonnenküste',
  href: '../Kontinente/Estryll/Königreich Cenyr/Grafschaft Sonnenküste/Grafschaft Sonnenküste.html'
};
const prefix = 'Familien Häuser und Clans/';
const scope = `${prefix}Estryll/Cenyr/Sonnenkueste/Gerstekueste/`;
const plans = records.filter(record => selected.has(record.id)).map(record => {
  const illustration = illustrations.find(entry => entry.id === record.id);
  if (!illustration) throw new Error(`Bildplanung fehlt: ${record.id}`);
  if (!illustration.folder.startsWith(scope) || illustration.folder.includes('..')
    || illustration.image !== `${illustration.folder}/assets/hausdarstellung-2026-11-03.png`) {
    throw new Error(`Bildplanung außerhalb des Hausbereichs: ${record.id}`);
  }
  if (record.profile.county !== 'Sonnenküste' || record.profile.barony !== 'Gersteküste') {
    throw new Error(`Unerwartete Registerzuordnung: ${record.id}`);
  }
  const file = `${illustration.folder}/haus.content.mjs`;
  const content = createPreparedHouseContent({
    record, territory,
    image: illustration.image.slice(prefix.length),
    emblemDescription: illustration.emblemDescription,
    contentVersion: '20261103-sonnenkueste-v1'
  });
  return { record, illustration, file, content };
});
if (plans.length !== selected.size) throw new Error('Die 16 ausgewählten Registerakten sind nicht vollständig.');

// Validate the whole batch before writing any file. Existing editorial work wins.
const receipt = fileURLToPath(new URL('prepared-houses.json', import.meta.url));
for (const target of [...plans.map(plan => path.join(repository, plan.file)), receipt]) {
  if (existsSync(target)) throw new Error(`Bereits vorhanden; kein Überschreiben: ${target}`);
}
for (const plan of plans) {
  mkdirSync(path.join(repository, plan.illustration.folder, 'assets'), { recursive: true });
  writeFileSync(path.join(repository, plan.file),
    '// Redaktionelle Quelle: vorhandenes Register; weitere Hausgeschichte bleibt offen.\n'
      + `export const HOUSE_CONTENT = ${JSON.stringify(plan.content, null, 2)};\n`,
    { flag: 'wx' });
}
const outputs = plans.map(({ record, illustration, file }) => ({
  id: record.id,
  content: file,
  image: illustration.image,
  emblem: `Stammbäume/${record.emblem}`,
  sourceRevision: record.sourceRevision,
  biographySourceRevision: record.sourceRevision + 1
}));
writeFileSync(receipt, JSON.stringify(outputs, null, 2) + '\n', { flag: 'wx' });
console.log(`${outputs.length} vorbereitete Gersteküsten-Hausquellen erstellt.`);
