// Read-only public-house asset audit. Diagnostic output stays in this directory.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = new URL('../../../', import.meta.url);
const feature = new URL('Familien Häuser und Clans/', root);
const trees = new URL('Stammbäume/', root);
const coverage = new URL('../coverage-audit/', import.meta.url);
const readJson = url => JSON.parse(fs.readFileSync(url, 'utf8'));
const publicIds = new Set(readJson(new URL('public-family-ids.json', coverage)));
const metadata = readJson(new URL('public-family-metadata.json', coverage)).filter(row => publicIds.has(row.id));
const { FAMILY_REGISTRY } = await import(new URL('Stammbäume/assets/js/data/families.registry.js', root));
const families = new Map(FAMILY_REGISTRY.filter(row => publicIds.has(row.id)).map(row => [row.id, row.family]));
const catalog = readJson(new URL('Gallerien/krieger/data/catalog.json', root));
const illustrations = new Map(catalog.illustrations.map(row => [row.id, row]));
const registryContext = { window: {} };
vm.runInNewContext(fs.readFileSync(new URL('haeuser.registry.js', feature), 'utf8'), registryContext);
const registry = registryContext.window.HaeuserRegistry;
const planUrl = new URL('../production-plan.json', import.meta.url);
const productionPlan = fs.existsSync(planUrl) ? new Map(readJson(planUrl).filter(row => publicIds.has(row.id)).map(row => [row.id, row])) : new Map();
const sha256 = input => createHash('sha256').update(input).digest('hex');
const cache = new Map();
const privateAsset = src => /fleischsammler|(?:^|\/)\.codex\/private\//i.test(src.replaceAll('\\', '/'));
const wrongRole = src => /(?:^|\/)(?:portraits?|placeholders?|emblems?|wappen|crests?)(?:\/|[_.-])/i.test(src);
const crestHashes = new Set(metadata.map(row => {
  if (!row.emblem || privateAsset(row.emblem)) return null;
  const url = new URL(row.emblem, trees);
  return fs.existsSync(url) ? sha256(fs.readFileSync(url)) : null;
}).filter(Boolean));
function asset(src, base, role) {
  if (typeof src !== 'string' || !src.trim() || privateAsset(src)) return null;
  if (/^(?:https?:|data:)/i.test(src)) return { src, role, external: true, exists: null, excludedRole: wrongRole(src) };
  let url;
  try { url = new URL(src.replaceAll('\\', '/').replace(/^\/(?!\/)/, ''), src.startsWith('/') ? root : base); } catch { return null; }
  url.search = ''; url.hash = '';
  const file = fileURLToPath(url), relative = path.relative(fileURLToPath(root), file).replaceAll('\\', '/');
  if (relative.startsWith('../') || privateAsset(relative)) return null;
  let data = cache.get(file);
  if (!data) {
    const exists = fs.existsSync(file) && fs.statSync(file).isFile();
    data = { path: relative, exists, ...(exists ? { bytes: fs.statSync(file).size, sha256: sha256(fs.readFileSync(file)) } : {}) };
    cache.set(file, data);
  }
  return { ...data, role, excludedRole: wrongRole(relative) || crestHashes.has(data.sha256) };
}
const usable = row => row && row.exists === true && !row.excludedRole;
const rows = [];
for (const meta of metadata) {
  const family = families.get(meta.id);
  const registered = registry.byId(meta.id);
  const planned = productionPlan.get(meta.id);
  const assets = [];
  let content, contentPath, dataPath;
  if (registered?.data) {
    const dataUrl = new URL(registered.data, feature); dataUrl.search = '';
    dataPath = path.relative(fileURLToPath(root), fileURLToPath(dataUrl)).replaceAll('\\', '/');
    const contentUrl = new URL('haus.content.mjs', dataUrl);
    if (fs.existsSync(contentUrl)) {
      content = (await import(contentUrl)).HOUSE_CONTENT;
      if (content?.id !== meta.id) content = null;
      else contentPath = path.relative(fileURLToPath(root), fileURLToPath(contentUrl)).replaceAll('\\', '/');
    }
    if (content) {
      assets.push(asset(content.images?.scene, feature, 'authored-scene'));
      for (const entry of content.warriorGallery?.entries || []) assets.push(asset(entry.image || entry.src || entry.imageSrc, feature, 'authored-gallery'));
    } else if (fs.existsSync(dataUrl)) {
      try {
        const context = { window: {} };
        vm.runInNewContext(fs.readFileSync(dataUrl, 'utf8'), context);
        const page = context.window.HAEUSER_DATA;
        if (page?.id === meta.id) assets.push(asset(page.images?.scene?.src || page.images?.scene, feature, 'legacy-page-scene'));
      } catch { /* A legacy script requiring the app remains a manual follow-up. */ }
    }
  }
  if (!content && planned?.contentPath) {
    const url = new URL(planned.contentPath, root);
    if (fs.existsSync(url)) {
      const candidate = (await import(url)).HOUSE_CONTENT;
      if (candidate?.id === meta.id || candidate?.id === planned.existingAuthoringId) {
        content = candidate;
        contentPath = planned.contentPath;
        assets.push(asset(content.images?.scene, feature, 'authored-scene'));
        for (const entry of content.warriorGallery?.entries || []) assets.push(asset(entry.image || entry.src || entry.imageSrc, feature, 'authored-gallery'));
      }
    }
  }
  const biography = family?.extensions?.houseBiographyModule;
  assets.push(asset(biography?.image, trees, 'biography-main'));
  const galleryHouse = catalog.houses.find(row => row.id === meta.id);
  const assigned = new Set([...(galleryHouse?.illustrationIds || []), ...catalog.illustrations.filter(row => row.houseIds?.includes(meta.id)).map(row => row.id)]);
  for (const id of assigned) {
    const illustration = illustrations.get(id);
    if (illustration) {
      const row = asset(illustration.image, root, 'catalog-house-assignment');
      if (row) assets.push({ ...row, illustrationId: id, category: illustration.category });
    }
  }
  const actual = assets.filter(Boolean);
  const candidates = actual.filter(usable);
  const scene = actual.find(row => ['authored-scene', 'legacy-page-scene'].includes(row.role));
  const selected = candidates.find(row => ['authored-scene', 'legacy-page-scene'].includes(row.role)) || candidates.find(row => row.role === 'biography-main') || candidates[0];
  const deduped = [...new Map(actual.map(row => [`${row.role}|${row.path || row.src}`, row])).values()];
  rows.push({ id: meta.id, name: meta.title, location: meta.folderPath, rankId: meta.houseProfile?.rankId,
    crest: asset(meta.emblem, trees, 'canonical-crest'),
    registeredPage: Boolean(registered), hasBiography: Boolean(biography), ...(dataPath ? { dataPath } : {}), ...(contentPath ? { contentPath } : {}),
    artStatus: selected ? (usable(scene) && registered ? 'active-figure' : 'existing-figure-needs-link') : (actual.some(row => row.external) ? 'external-figure-needs-inspection' : 'no-figure-found-yet'),
    ...(selected ? { selectedExistingFigure: selected.path, selectedSha256: selected.sha256 } : {}), assets: deduped });
}
fs.writeFileSync(new URL('inventory-current.json', import.meta.url), `${JSON.stringify(rows, null, 2)}\n`);
const counts = Object.fromEntries([...new Set(rows.map(row => row.artStatus))].map(status => [status, rows.filter(row => row.artStatus === status).length]));
console.log(JSON.stringify({ publicFamilies: rows.length, counts, needsSourceSearch: rows.filter(row => row.artStatus === 'no-figure-found-yet').map(row => ({ id: row.id, name: row.name, location: row.location })), needsLink: rows.filter(row => row.artStatus === 'existing-figure-needs-link').map(row => ({ id: row.id, image: row.selectedExistingFigure })) }));
