import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const root = new URL('../../Fonts/Handwriting/', import.meta.url);
const manifestPath = new URL('manifest.json', root);
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
if (process.argv.includes('--check')) {
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  for (const font of manifest.fonts) for (const file of font.files) {
    if (hash(await readFile(new URL(file.path, root))) !== file.sha256) throw Error(`Schriftdatei verändert: ${file.path}`);
  }
  console.log(`${manifest.fonts.length} lokale Handschriften samt Lizenzen geprüft.`);
} else {
  const headers = { 'User-Agent': 'Aleria-font-vendor', Accept: 'application/vnd.github+json' };
  const head = await fetch('https://api.github.com/repos/google/fonts/commits/main', { headers });
  if (!head.ok) throw Error(`Google-Fonts-Revision: HTTP ${head.status}`);
  const commit = (await head.json()).sha;
  const fonts = [
    ['patrickhand', 'Patrick Hand', 'PatrickHand-Regular.ttf'],
    ['kalam', 'Kalam', 'Kalam-Regular.ttf'],
    ['caveat', 'Caveat', 'Caveat[wght].ttf'],
    ['dancingscript', 'Dancing Script', 'DancingScript[wght].ttf'],
    ['labelleaurore', 'La Belle Aurore', 'LaBelleAurore-Regular.ttf'],
    ['bethellen', 'Beth Ellen', 'BethEllen-Regular.ttf'],
    ['monsieurladoulaise', 'Monsieur La Doulaise', 'MonsieurLaDoulaise-Regular.ttf'],
  ];
  const entries = await Promise.all(fonts.map(async ([id, family, preferredFilename]) => {
    const metadataResponse = await fetch(`https://raw.githubusercontent.com/google/fonts/${commit}/ofl/${id}/METADATA.pb`);
    if (!metadataResponse.ok) throw Error(`${id}/METADATA.pb: HTTP ${metadataResponse.status}`);
    const filenames = [...(await metadataResponse.text()).matchAll(/filename:\s*"([^"]+)"/g)].map(match => match[1]);
    const filename = filenames.includes(preferredFilename) ? preferredFilename : filenames.length === 1 ? filenames[0] : '';
    if (!filename) throw Error(`Keine eindeutige reguläre Schriftdatei für ${id}.`);
    const files = await Promise.all([filename, 'OFL.txt'].map(async name => {
      const url = `https://raw.githubusercontent.com/google/fonts/${commit}/ofl/${id}/${encodeURIComponent(name)}`;
      const response = await fetch(url);
      if (!response.ok) throw Error(`${id}/${name}: HTTP ${response.status}`);
      const bytes = Buffer.from(await response.arrayBuffer());
      if (name === 'OFL.txt' && !bytes.toString().includes('SIL OPEN FONT LICENSE')) throw Error(`Lizenz prüfen: ${id}`);
      const path = `${id}/${name === 'OFL.txt' ? name : 'regular.ttf'}`;
      await mkdir(new URL(`${id}/`, root), { recursive: true });
      await writeFile(new URL(path, root), bytes);
      return { path, source: url, sha256: hash(bytes), bytes: bytes.length };
    }));
    return { id, family, license: 'SIL Open Font License 1.1', files };
  }));
  await writeFile(manifestPath, JSON.stringify({ source: 'https://github.com/google/fonts', commit, fonts: entries }, null, 2) + '\n');
  console.log(`${entries.length} Originalschriften und OFL-Lizenzen unter Fonts/Handwriting gespeichert.`);
}
