// Local image inventory only. No network, Firebase or publication.
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const art = new URL('../assets/gwynthor-erbstreit/', import.meta.url);
const readJson = async file => JSON.parse(await readFile(new URL(file, art), 'utf8'));
const portraits = (await readJson('portrait-specs-approved.json')).entries;
const crests = (await readJson('heraldry-specs-approved.json')).entries;
const alpha = await readJson('emblem-alpha-correction.json');
const images = [];
for (const [kind, specs] of [['portrait', portraits], ['crest', crests]]) {
  for (const spec of specs) {
    const bytes = await readFile(new URL(spec.file, art));
    if (bytes.toString('hex', 0, 8) !== '89504e470d0a1a0a') throw new Error(`Not a PNG: ${spec.file}`);
    const width = bytes.readUInt32BE(16), height = bytes.readUInt32BE(20);
    if (kind === 'portrait' ? width * 3 !== height * 2 : width !== height) throw new Error(`Unexpected aspect ratio: ${spec.file}`);
    const sha256 = createHash('sha256').update(bytes).digest('hex');
    const processing = kind === 'crest' ? alpha.images.find(item => item.file.replaceAll('\\', '/').endsWith(spec.file)) : null;
    if (kind === 'crest' && processing?.sha256 !== sha256) throw new Error(`Alpha report out of date: ${spec.file}`);
    images.push({ id: spec.id, kind, file: spec.file, preset: spec.preset, width, height, sha256,
      promptFile: kind === 'portrait' ? 'portrait-specs-approved.json' : 'heraldry-specs-approved.json',
      ...(processing ? { alphaValues: processing.alphaValues, rgbUnchanged: processing.rgbUnchanged,
        generatorOriginal: processing.source, registryCopy: processing.registryCopy,
        corrections: 'heraldry-edits.json' } : {}) });
  }
}
const content = JSON.stringify({ date: '2026-10-30', tool: 'built-in image_gen', images }, null, 2) + '\n';
const target = new URL('image-results.json', art);
if (process.argv.includes('--check')) {
  if ((await readFile(target, 'utf8')).replaceAll('\r\n', '\n') !== content) throw new Error('Image inventory out of date.');
} else await writeFile(target, content);
console.log(JSON.stringify({ portraits: portraits.length, crests: crests.length, images: images.length }));
