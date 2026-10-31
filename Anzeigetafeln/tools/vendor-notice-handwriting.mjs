import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const root = new URL('../../Fonts/Handwriting/', import.meta.url);
const manifestPath = new URL('manifest.json', root);
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const fontSpecs = [
  ['patrickhand', 'Patrick Hand', 'PatrickHand-Regular.ttf'],
  ['kalam', 'Kalam', 'Kalam-Regular.ttf'],
  ['caveat', 'Caveat', 'Caveat[wght].ttf'],
  ['dancingscript', 'Dancing Script', 'DancingScript[wght].ttf'],
  ['labelleaurore', 'La Belle Aurore', 'LaBelleAurore-Regular.ttf'],
  ['bethellen', 'Beth Ellen', 'BethEllen-Regular.ttf'],
  ['monsieurladoulaise', 'Monsieur La Doulaise', 'MonsieurLaDoulaise-Regular.ttf'],
  ['schoolbell', 'Schoolbell', 'Schoolbell-Regular.ttf', { directory: 'apache', license: 'Apache License 2.0', licenseFile: 'LICENSE.txt' }],
];
if (process.argv.includes('--check')) {
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  for (const font of manifest.fonts) for (const file of font.files) {
    if (hash(await readFile(new URL(file.path, root))) !== file.sha256) throw Error(`Schriftdatei verändert: ${file.path}`);
  }
  console.log(`${manifest.fonts.length} lokale Handschriften samt Lizenzen geprüft.`);
} else {
  const addedId = process.argv.find(arg => arg.startsWith('--add='))?.slice(6);
  if (addedId && !fontSpecs.some(([id]) => id === addedId)) throw Error(`Unbekannte Handschrift: ${addedId}`);
  const previous = addedId ? JSON.parse(await readFile(manifestPath, 'utf8')) : null;
  const headers = { 'User-Agent': 'Aleria-font-vendor', Accept: 'application/vnd.github+json' };
  let commit = previous?.commit;
  if (!commit) {
    const head = await fetch('https://api.github.com/repos/google/fonts/commits/main', { headers });
    if (!head.ok) throw Error(`Google-Fonts-Revision: HTTP ${head.status}`);
    commit = (await head.json()).sha;
  }
  const fonts = addedId ? fontSpecs.filter(([id]) => id === addedId) : fontSpecs;
  const entries = await Promise.all(fonts.map(async ([id, family, preferredFilename, options = {}]) => {
    const sourceRoot = `https://raw.githubusercontent.com/google/fonts/${commit}/${options.directory || 'ofl'}/${id}`;
    const licenseFile = options.licenseFile || 'OFL.txt';
    const metadataResponse = await fetch(`${sourceRoot}/METADATA.pb`);
    if (!metadataResponse.ok) throw Error(`${id}/METADATA.pb: HTTP ${metadataResponse.status}`);
    const filenames = [...(await metadataResponse.text()).matchAll(/filename:\s*"([^"]+)"/g)].map(match => match[1]);
    const filename = filenames.includes(preferredFilename) ? preferredFilename : filenames.length === 1 ? filenames[0] : '';
    if (!filename) throw Error(`Keine eindeutige reguläre Schriftdatei für ${id}.`);
    const files = await Promise.all([filename, licenseFile].map(async name => {
      const url = `${sourceRoot}/${encodeURIComponent(name)}`;
      const response = await fetch(url);
      if (!response.ok) throw Error(`${id}/${name}: HTTP ${response.status}`);
      const bytes = Buffer.from(await response.arrayBuffer());
      if (name === licenseFile && !(options.license ? /Apache License[\s\S]*Version 2\.0/.test(bytes.toString()) : bytes.toString().includes('SIL OPEN FONT LICENSE'))) throw Error(`Lizenz prüfen: ${id}`);
      const path = `${id}/${name === licenseFile ? name : 'regular.ttf'}`;
      await mkdir(new URL(`${id}/`, root), { recursive: true });
      await writeFile(new URL(path, root), bytes);
      return { path, source: url, sha256: hash(bytes), bytes: bytes.length };
    }));
    return { id, family, license: options.license || 'SIL Open Font License 1.1', files };
  }));
  const merged = previous ? [...previous.fonts.filter(font => font.id !== addedId), ...entries] : entries;
  await writeFile(manifestPath, JSON.stringify({ source: 'https://github.com/google/fonts', commit, fonts: merged }, null, 2) + '\n');
  console.log(`${merged.length} Originalschriften samt Lizenzen unter Fonts/Handwriting gespeichert.`);
}
