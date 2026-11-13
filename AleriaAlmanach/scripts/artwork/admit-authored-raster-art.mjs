import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';

/** Admit immutable imagegen receipts into one explicitly scoped collection. */
export async function admitAuthoredRasterArt({ root, docsPath, assetsPath, write }) {
  root = path.resolve(root);
  const docs = path.resolve(root, docsPath), assets = path.resolve(root, assetsPath);
  if (![docs, assets].every(p => p.startsWith(root + path.sep))) throw Error('Collection outside project.');
  const sources = (await fs.readdir(docs)).filter(name => /^generation-receipts.*\.json$/.test(name)).sort();
  const records = new Map();
  for (const source of sources) for (const item of JSON.parse(await fs.readFile(path.join(docs, source), 'utf8')).images) {
    if (item.source) records.set(`${item.key}:${item.version}`, item);
  }
  const images = [];
  for (const item of records.values()) {
    const original = path.resolve(root, item.original), active = path.resolve(root, item.active);
    if (!original.startsWith(docs + path.sep) || !active.startsWith(assets + path.sep)) throw Error('Image outside selected collection.');
    const bytes = await fs.readFile(write ? item.source : original), sha256 = createHash('sha256').update(bytes).digest('hex');
    if (bytes.toString('hex', 0, 8) !== '89504e470d0a1a0a') throw Error(`Not PNG: ${item.key}`);
    for (const target of [original, active]) {
      const previous = await fs.readFile(target).catch(e => { if (e.code !== 'ENOENT') throw e; return null; });
      if (previous && !previous.equals(bytes)) throw Error(`Existing image differs: ${target}`);
      if (!previous) { if (!write) throw Error(`Missing image: ${target}`); await fs.mkdir(path.dirname(target), { recursive: true }); await fs.writeFile(target, bytes, { flag: 'wx' }); }
    }
    images.push({ key: item.key, version: item.version, path: item.active, original: item.original, sha256, width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) });
  }
  const active = images.filter(image => !images.some(other => other.key === image.key && other.version > image.version));
  const manifest = JSON.stringify({ schemaVersion: 1, images, active: active.map(i => ({ key: i.key, path: i.path })) }, null, 2) + '\n';
  const target = path.join(assets, 'manifest.json');
  if (write) await fs.writeFile(target, manifest); else if (await fs.readFile(target, 'utf8') !== manifest) throw Error('Stale art manifest.');
  return { versions: images.length, active: active.length, byteVerified: true, write };
}
