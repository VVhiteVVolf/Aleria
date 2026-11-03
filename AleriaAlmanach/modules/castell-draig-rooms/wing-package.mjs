import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { DRAIG_WING_ART } from './wing-art.mjs';
import { WING_SOURCE_DIRECTORY, RESIDENTIAL_NODE_ID } from './wing-households.mjs';
import { planDraigWingExpansion } from './wing-layout.mjs';
import { loadDraigWingReview } from './wing-source.mjs';

const root = new URL('../../../', import.meta.url);
export const wingSource = new URL(WING_SOURCE_DIRECTORY, root);
export async function loadWingArtwork() {
  return Promise.all(DRAIG_WING_ART.map(async art => {
    const [bytes, original] = await Promise.all([readFile(new URL(art.destination, root)), readFile(new URL(art.original, root))]);
    if (!bytes.equals(original) || bytes.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a') throw Error(`Ungeprüftes PNG: ${art.id}`);
    const width = bytes.readUInt32BE(16), height = bytes.readUInt32BE(20);
    if (width * 3 !== height * 2) throw Error(`Falsches Bildformat: ${art.id}`);
    const sha256 = createHash('sha256').update(bytes).digest('hex');
    const assetId = `wohnfluegel-v1-${art.id}-${sha256.slice(0, 16)}`;
    return { ...art, bytes, width, height, sha256, assetId,
      url: `https://firebasestorage.googleapis.com/v0/b/aleriaprojekt.firebasestorage.app/o/${encodeURIComponent(`family-assets/haus-draig/${assetId}/original.png`)}?alt=media` };
  }));
}

export async function prepareWingPackage(entry, manifest, artwork, { local = false } = {}) {
  const review = await loadDraigWingReview();
  const images = Object.fromEntries(artwork.map(art => [art.id, local ? `./${art.destination.slice('AleriaAlmanach/'.length)}` : art.url]));
  const plan = planDraigWingExpansion({ entry, manifest, review, artwork: images });
  if (local) {
    const oldImages = new Map([
      [entry.pages.find(page => page.commentThreadKey === '0').image, './public/assets/castell-draig/2026-10-15/wohntrakte-korridor.png'],
      [entry.pages.find(page => page.commentThreadKey === 'p-mqe9bm3q-furze').image, './public/assets/castell-draig/2026-10-15/wohntrakte-grafengemaecher.png'],
      ...entry.pages.filter(page => page.commentThreadKey.startsWith('wohntrakte-')).map(page => {
        const id = page.commentThreadKey.slice('wohntrakte-'.length);
        return [page.image, `./public/assets/castell-draig/2026-11-01/rooms-v2/${id}-gemach-v${id === 'anaraut' ? 3 : 2}.png`];
      })
    ]);
    for (const module of plan.entries) {
      module.image = oldImages.get(module.image) || module.image;
      for (const page of module.pages) page.image = oldImages.get(page.image) || page.image;
    }
  }
  const nodes = plan.manifest.moduleSectionNodes.filter(node => node.id === RESIDENTIAL_NODE_ID || node.id.startsWith(`${RESIDENTIAL_NODE_ID}/`));
  const ancestors = [];
  let current = plan.manifest.moduleSectionNodes.find(node => node.id === RESIDENTIAL_NODE_ID);
  while (current?.parentId) {
    current = plan.manifest.moduleSectionNodes.find(node => node.id === current.parentId);
    if (!current) throw Error('Lücke im Kategorienpfad.');
    ancestors.unshift(current);
  }
  const payload = { version: plan.manifest.version, customSections: plan.sections.map(section => ({ ...section,
    entries: section.entryIds.map(id => plan.entries.find(entry => entry.id === id)) })),
    moduleSectionNodes: [...ancestors, ...nodes],
    moduleNodeAssignments: Object.fromEntries(plan.entries.map(entry => [entry.id, plan.manifest.moduleNodeAssignments[entry.id]])) };
  return { plan, payload };
}

export async function saveWingPackages(entry, manifest, artwork) {
  const { plan, payload } = await prepareWingPackage(entry, manifest, artwork);
  const local = await prepareWingPackage(entry, manifest, artwork, { local: true });
  for (const [file, data] of [
    ['module-import.json', local.payload], ['module-publication.json', payload], ['family-review.json', plan.review],
    ['image-results.json', { tool: 'built-in image_gen', images: artwork.map(({ bytes, prompt, ...art }) => ({ ...art, size: bytes.length })) }]
  ]) await writeFile(new URL(file, wingSource), JSON.stringify(data, null, 2) + '\n');
  return { plan, payload };
}
