// Einmalige Archivierung der ausdrücklich zu übernehmenden Nutzerquellen.
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';

const work = 'diagnostics/vortigerns-house-refresh-2026-10-24';
const sources = JSON.parse(readFileSync(`${work}/legacy-sections.json`, 'utf8'));
const inventory = JSON.parse(readFileSync(`${work}/inventory.json`, 'utf8'));
const regionDirectory = { 'Tanwens Flamme': 'Tanwens_Flamme', 'Uthers Aufstieg': 'Uthers_Aufstieg', 'Antike Häuser': 'Antike_Haeuser' };
const targetDirectory = record => `Familien Häuser und Clans/Estryll/Cenyr/Vortigerns_Ruh/${regionDirectory[record.folder[2]]}/Haus_${record.id.slice(5).replace(/^./, letter => letter.toUpperCase())}`;
const audit = [];
for (const source of sources) {
  const record = inventory.find(record => record.id === source.id);
  const directory = targetDirectory(record);
  mkdirSync(`${directory}/assets`, { recursive: true });
  const archive = `${directory}/animexx-original.html`;
  const bytes = readFileSync(source.path);
  copyFileSync(source.path, archive);
  const image = `${directory}/assets/hausdarstellung-original.png`;
  if (!existsSync(image)) {
    const response = await fetch(source.mainImage, { signal: AbortSignal.timeout(30000) });
    if (!response.ok || !response.headers.get('content-type')?.startsWith('image/')) throw Error(`${source.id}: Originalbild nicht verfügbar (${response.status}).`);
    const imageBytes = Buffer.from(await response.arrayBuffer());
    if (imageBytes.length < 1000) throw Error(`${source.id}: verdächtig kleines Originalbild.`);
    writeFileSync(image, imageBytes);
  }
  audit.push({ id: source.id, attachment: source.attachment, archive,
    sha256: createHash('sha256').update(bytes).digest('hex'), originalIllustrationUrl: source.mainImage,
    image, imageSha256: createHash('sha256').update(readFileSync(image)).digest('hex'),
    scope: 'Hauskapitel und Hof; alte Genealogie und Truppenangaben werden nicht übernommen.',
    imageDecision: 'Nutzeranweisung: vorhandene Darstellung direkt verwenden, keinen Ersatz generieren.' });
  console.log(`${source.id}: Originalquelle und Darstellung gesichert.`);
}
writeFileSync(`${work}/source-audit.json`, JSON.stringify(audit, null, 2) + '\n');
writeFileSync(`${work}/house-paths.json`, JSON.stringify(Object.fromEntries(inventory.map(record => [record.id, targetDirectory(record)])), null, 2) + '\n');
