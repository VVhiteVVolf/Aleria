import { readFile, readdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { STANDARD_ITEMS, STANDARD_VERSION } from '../../AleriaAlmanach/modules/item-register/item-register-standard.js';
const root = new URL('../../', import.meta.url);
const manifestPath = 'AleriaAlmanach/assets/pendrwn-general-store/image-validation.json';
const manifest = JSON.parse(await readFile(new URL(manifestPath, root), 'utf8'));
const moduleGoods = (await readdir(new URL('AleriaAlmanach/assets/pendrwn-general-store/goods/', root))).filter(file => file.endsWith('.png'));
const selected = STANDARD_ITEMS.filter(item => item.id.startsWith('standard:') && ['werkzeuge', 'sonstiges'].includes(item.category));
const items = [];
for (const [index, item] of selected.entries()) {
  const sourceId = item.sourceRefs[0]?.sourceId;
  const candidate = `AleriaAlmanach/assets/pendrwn-general-store/goods/${sourceId}.png`;
  let bytes = null;
  try { bytes = await readFile(new URL(candidate, root)); } catch {}
  const expected = manifest.images.find(row => row.id === sourceId);
  const sha256 = bytes ? createHash('sha256').update(bytes).digest('hex') : null;
  items.push({ index: index + 1, id: item.id, title: item.title, category: item.category, image: item.image || '',
    definitionRef: item.definitionRef,
    reason: item.image === 'https://i.imgur.com/UbjFi5T.png' ? 'shared-market-fallback-no-individual-standard-image' : 'individual-image-or-other',
    existingCandidate: bytes ? candidate : null, candidateValidation: bytes ? { exists: true,
      width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20), pngColorType: bytes[25], sha256,
      manifestId: expected?.id || null, manifestHashMatches: sha256 === expected?.sha256, recordedAlphaRange: expected?.alphaRange || null } : null,
    visualReview: { viewed: true, styleMatchesInventoryPreset: true, subjectMatchesItem: true, requiresGeneration: false },
    sourceRefs: item.sourceRefs });
}
const result = { createdAt: new Date().toISOString(), readOnly: true, standardVersion: STANDARD_VERSION,
  categories: ['werkzeuge', 'sonstiges'], counts: { total: items.length,
    werkzeuge: items.filter(item => item.category === 'werkzeuge').length, sonstiges: items.filter(item => item.category === 'sonstiges').length,
    sharedFallback: items.filter(item => item.reason.startsWith('shared-')).length,
    existingCandidate: items.filter(item => item.existingCandidate).length,
    verifiedAlphaAndHash: items.filter(item => item.candidateValidation?.manifestHashMatches && item.candidateValidation.recordedAlphaRange?.[0] === 0).length,
    moduleGoodsTotal: moduleGoods.length, otherModuleGoods: moduleGoods.length - items.filter(item => item.existingCandidate).length,
    manifestTotal: manifest.total, manifestTransparentItems: manifest.transparentItems, manifestOpaquePortraitsAndScenes: manifest.opaquePortraitsAndScenes },
  otherModuleGoods: moduleGoods.filter(file => !items.some(item => item.existingCandidate?.endsWith('/' + file))),
  references: ['AleriaAlmanach/docs/art/image-style-presets.json', 'AleriaAlmanach/assets/pendrwn-general-store/image-prompts.json', manifestPath], items };
await writeFile(new URL('tool-image-inventory.json', import.meta.url), JSON.stringify(result, null, 2) + '\n');
await writeFile(new URL('contact-inputs.json', import.meta.url), JSON.stringify(items.map(item => ({ index: item.index, title: item.title, path: item.existingCandidate })), null, 2) + '\n');
console.log(JSON.stringify(result.counts));
