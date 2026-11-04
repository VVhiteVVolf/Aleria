import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
import { FAMILY_REGISTRY } from '../../../Stammbäume/assets/js/data/families.registry.js';
import { HOUSE_BIOGRAPHY_DEFAULTS } from '../../../Stammbäume/assets/js/data/house-biographies.registry.js';
import { resolveCanonicalFamilyId } from '../../../Stammbäume/assets/js/modules/family-registry/family-id-aliases.js';
import { mergePublishedRegistryRecords } from '../../../Stammbäume/assets/js/modules/family-registry/published-registry-merge.js';
import { reconcileFamilyWithProjectOrigin } from '../../../Stammbäume/assets/js/modules/family-sync/project-origin-reconciliation.js';
import { houseBiographyDefaultFingerprint } from '../../../Stammbäume/assets/js/modules/house-biography/house-biography-fingerprint.js';
import { shouldPublish } from '../../../netlify/build/site-publish.mjs';
import { getCenyrPlacement, normalizePublicAllowlist, summarizeCenyrCoverage, hasCenyrCoverageGaps } from './cenyr-house-coverage-model.mjs';

const root = new URL('../../../', import.meta.url);
const feature = new URL('Familien Häuser und Clans/', root), genealogy = new URL('Stammbäume/', root);
const readJson = url => JSON.parse(fs.readFileSync(url, 'utf8'));
const key = value => String(value || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const nameKey = value => key(value).replace(/^(?:haus|house|clan|sept)-/, '');
const sha256 = value => createHash('sha256').update(value).digest('hex');

// Protected identities are used only as an in-memory exclusion boundary. They
// are never copied into the public allowlist, diagnostics, fixtures or reports.
const deniedIds = new Set();
const deniedNames = new Set();
const privateIndex = process.env.USERPROFILE ? path.join(process.env.USERPROFILE, '.codex/private/aleria/index.json') : null;
if (privateIndex && fs.existsSync(privateIndex)) {
  for (const entry of readJson(privateIndex).entries || []) {
    if (!entry.privateOnly && !['private', 'hidden'].includes(entry.visibility)) continue;
    for (const id of [entry.id, ...(entry.aliases || [])]) deniedIds.add(resolveCanonicalFamilyId(id));
  }
}
const hidden = record => deniedIds.has(resolveCanonicalFamilyId(record.id || record.familyId))
  || deniedNames.has(nameKey(record.title || record.name))
  || record.hidden === true || ['hidden', 'private'].includes(record.visibility)
  || record.family?.document?.hidden === true || record.family?.document?.privateOnly === true
  || ['private', 'hidden'].includes(record.family?.extensions?.visibility);
const project = FAMILY_REGISTRY.filter(record => !hidden(record));
const published = readJson(new URL('assets/data/published-families/registry.json', genealogy)).families.filter(record => !hidden(record));
const merged = mergePublishedRegistryRecords(project, published).filter(record => !hidden(record));
const projectById = new Map(project.map(record => [resolveCanonicalFamilyId(record.id), record]));
const publicById = new Map(merged.map(record => [resolveCanonicalFamilyId(record.id), record]));
const registryContext = { window: {} };
vm.runInNewContext(fs.readFileSync(new URL('haeuser.registry.js', feature), 'utf8'), registryContext);
const pageRegistry = registryContext.window.HaeuserRegistry;
const pagesByCanonicalId = new Map(pageRegistry.all().map(record => [resolveCanonicalFamilyId(record.id), record]));
const catalog = readJson(new URL('Gallerien/krieger/data/catalog.json', root));
const galleryById = new Map();
for (const image of catalog.illustrations) for (const id of image.houseIds || []) {
  const canonical = resolveCanonicalFamilyId(id);
  if (deniedIds.has(canonical)) continue;
  if (!galleryById.has(canonical)) galleryById.set(canonical, []);
  galleryById.get(canonical).push(image);
}
const relative = url => path.relative(fileURLToPath(root), fileURLToPath(url)).replace(/\\/g, '/');
const resolveImage = (src, base) => {
  if (!src || typeof src !== 'string' || /^data:|^file:/i.test(src)) return null;
  if (/fleischsammler|\/private\//i.test(src)) return null;
  if (/^https?:/i.test(src)) return { source: src, remote: true, exists: null };
  const url = new URL(src.startsWith('/') ? `.${src}` : src, src.startsWith('/') ? root : base);
  const local = relative(url);
  if (local.startsWith('../') || path.isAbsolute(local)) return null;
  return { source: src, path: local, exists: fs.existsSync(url), publishable: shouldPublish(local) };
};
const validBiography = bio => Boolean(bio && typeof bio === 'object' && Object.keys(bio).length);
const hasMilitaryNumber = text => /\b\d[\d.]*\s+(?:Mann\b|Krieger|Waffenknechte|Kriegsschiffe|Soldaten|Ritter\b)/i.test(text || '');
const scope = merged.filter(record => getCenyrPlacement(record));
export function loadPublicCenyrCoverageInputs() {
  return {
    project, merged, projectById, publicById, scope,
    isProtectedId: id => deniedIds.has(resolveCanonicalFamilyId(id)),
    isProtectedName: value => deniedNames.has(nameKey(value)),
    isHiddenRecord: hidden,
  };
}

function indexExistingHouseAuthoring(allowedIds) {
  const index = new Map();
  const visit = directory => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      if (/^(?:assets|node_modules|sources|archives|rejected|private|hidden)$/i.test(entry.name)
        || /fleischsammler/i.test(entry.name)) continue;
      const url = new URL(`${entry.name}${entry.isDirectory() ? '/' : ''}`, directory);
      if (entry.isDirectory()) { visit(url); continue; }
      if (entry.name !== 'haus.content.mjs') continue;
      const source = fs.readFileSync(url, 'utf8');
      const declaration = source.indexOf('export const HOUSE_CONTENT');
      if (declaration < 0) continue;
      const match = source.slice(declaration).match(/["']?id["']?\s*:\s*["']([^"']+)["']/);
      const id = match && resolveCanonicalFamilyId(match[1]);
      if (!id || !allowedIds.has(id)) continue;
      if (!index.has(id)) index.set(id, []);
      index.get(id).push(url);
    }
  };
  visit(feature);
  return index;
}

function inspectHouseLinks(id, page, pageData, biography) {
  const frameSrc = pageData?.familyTreeEmbed?.src;
  let iframeCanonical = false;
  if (typeof frameSrc === 'string') {
    const frame = new URL(frameSrc, feature);
    iframeCanonical = frame.protocol === 'file:' && frame.pathname === new URL('Stammbaum.html', genealogy).pathname
      && resolveCanonicalFamilyId(frame.searchParams.get('family')) === id && frame.searchParams.get('mode') === 'view';
  }
  const biographyBackLinkSupported = Boolean(biography?.house && (biography.housePage || Array.isArray(biography.house.documents)));
  const expectedPage = page && new URL(page.page || 'haus.html', feature);
  const biographyBackLinkCanonical = Boolean(expectedPage && (biography?.house?.documents || []).some(document => {
    if (typeof document.link !== 'string') return false;
    const link = new URL(document.link, genealogy);
    return link.protocol === 'file:' && link.pathname === expectedPage.pathname
      && resolveCanonicalFamilyId(link.searchParams.get('haus')) === id;
  }));
  return { iframeSupported: Boolean(pageData), iframeCanonical, biographyBackLinkSupported, biographyBackLinkCanonical };
}

async function inspectFamilyCoverage(mergedRecord, authoringIndex) {

  const id = resolveCanonicalFamilyId(mergedRecord.id);
  const registered = projectById.get(id), canonical = registered || mergedRecord;
  const placement = getCenyrPlacement(canonical) || getCenyrPlacement(mergedRecord);
  const page = pageRegistry.byId(id) || pagesByCanonicalId.get(id);
  const dataUrl = page?.data ? new URL(page.data, feature) : null;
  const dataExists = Boolean(dataUrl && fs.existsSync(dataUrl));
  const activeContentUrl = dataUrl ? new URL('haus.content.mjs', dataUrl) : null;
  const authoringUrls = authoringIndex.get(id) || [];
  const contentUrl = activeContentUrl && fs.existsSync(activeContentUrl) ? activeContentUrl : authoringUrls[0];
  const hasContent = Boolean(contentUrl && fs.existsSync(contentUrl));
  let content = null, pageData = null, dataEvaluation = 'not-present';
  if (hasContent) content = (await import(contentUrl.href)).HOUSE_CONTENT;
  if (dataExists) {
    try {
      const context = { window: {} };
      vm.runInNewContext(fs.readFileSync(dataUrl, 'utf8'), context, { timeout: 1000 });
      pageData = context.window.HAEUSER_DATA;
      dataEvaluation = pageData ? 'parsed' : 'no-page-data';
    } catch { dataEvaluation = 'requires-shared-data-runtime'; }
  }
  const publishedId = mergedRecord.publishedFamilyId || published.find(record => resolveCanonicalFamilyId(record.id || record.familyId) === id)?.familyId;
  const snapshotUrl = publishedId ? new URL(`assets/data/published-families/${encodeURIComponent(publishedId)}.json`, genealogy) : null;
  const snapshot = snapshotUrl && fs.existsSync(snapshotUrl) ? readJson(snapshotUrl) : null;
  const seedBio = registered?.family?.extensions?.houseBiographyModule;
  let effectiveFamily = registered?.family || snapshot?.family;
  if (snapshot?.family) effectiveFamily = reconcileFamilyWithProjectOrigin({ family: snapshot.family, projectOriginFamily: registered?.family }).family;
  const effectiveBio = effectiveFamily?.extensions?.houseBiographyModule;
  const crest = resolveImage(canonical.family?.document?.emblem || mergedRecord.emblem, genealogy);
  const candidates = [];
  const addImage = (src, base, role, details = {}) => {
    const resolved = resolveImage(src, base);
    if (!resolved) return;
    const sameCrest = resolved.path && resolved.path === crest?.path || resolved.remote && resolved.source === crest?.source;
    if (sameCrest || /placeholder|silhouette|standardsil|AntikeIcon|no-image/i.test(src)) return;
    candidates.push({ ...resolved, role, ...details });
  };
  if (content?.images?.scene) addImage(content.images.scene, feature, 'authored-main-scene');
  for (const [imageKey, image] of Object.entries(pageData?.images || {})) {
    if (/hauptbild|house-illustration|haus-krieger|hausdarstellung|main-scene/i.test(imageKey)) addImage(image.src, feature, 'page-main-scene');
  }
  for (const image of galleryById.get(id) || []) addImage(image.image, root, 'registered-house-gallery', { sha256: image.sha256, category: image.category });
  if (effectiveBio?.image) addImage(effectiveBio.image, genealogy, 'house-biography-image');
  const boundPageScene = candidates.find(candidate => candidate.role === 'page-main-scene' && candidate.exists === true && candidate.publishable);
  const uniqueCandidates = [...new Map(candidates.map(candidate => [candidate.path || candidate.source, candidate])).values()];
  const localArt = uniqueCandidates.filter(candidate => candidate.exists === true);
  const remoteArt = uniqueCandidates.filter(candidate => candidate.remote);
  const sourceRevision = registered?.family?.extensions?.sourceRevision || 0;
  const profile = placement.houseProfile || canonical.houseProfile;
  const description = canonical.family?.document?.description || '';
  const existingBiography = {
    present: validBiography(effectiveBio), seedPresent: validBiography(seedBio),
    managed: Boolean(HOUSE_BIOGRAPHY_DEFAULTS[id] && effectiveBio
      && houseBiographyDefaultFingerprint(effectiveBio) === houseBiographyDefaultFingerprint(HOUSE_BIOGRAPHY_DEFAULTS[id].biography)),
    registeredDefaultPresent: Boolean(HOUSE_BIOGRAPHY_DEFAULTS[id]),
    image: typeof effectiveBio?.image === 'string' && !effectiveBio.image.startsWith('data:') ? effectiveBio.image : '',
    publishedSnapshotPresent: Boolean(snapshot), publishedOwnState: snapshot?.family?.extensions && Object.hasOwn(snapshot.family.extensions, 'houseBiographyModule')
      ? snapshot.family.extensions.houseBiographyModule === null ? 'explicit-null' : 'present' : 'absent',
    source: snapshot ? 'published-snapshot-reconciled-with-current-project' : 'current-project-registry',
  };
  const existingPage = {
    present: Boolean(page?.status === 'active' && dataExists && pageData
      && resolveCanonicalFamilyId(pageData.meta?.id) === id && fs.existsSync(new URL(page.page || 'haus.html', feature))),
    canonicalDataId: resolveCanonicalFamilyId(pageData?.meta?.id),
    registryId: page?.id || '', path: page ? `Familien Häuser und Clans/${page.page || 'haus.html'}?haus=${encodeURIComponent(page.id)}` : '',
    dataPath: dataExists ? relative(dataUrl) : '', contentPath: hasContent ? relative(contentUrl) : '', prepared: Boolean(content?.prepared), dataEvaluation,
  };
  return {
    stableId: id, canonicalRecordId: registered?.id || id, title: canonical.title,
    county: profile.county || placement.folderPath[1] || '', folderPath: placement.folderPath,
    primaryFolderPath: canonical.folderPath, primaryHouseProfile: canonical.houseProfile,
    houseProfile: profile, placementRole: placement.role || 'additional', listing: canonical.listing || 'listed',
    emblem: canonical.family?.document?.emblem || mergedRecord.emblem || '', motto: canonical.family?.document?.motto || '',
    description: hasMilitaryNumber(description) ? '' : description,
    ...(hasMilitaryNumber(description) ? { descriptionExcluded: 'contains-military-statistics' } : {}),
    sourceRevision, existingPage, existingBiography,
    existingAuthoring: { present: Boolean(content), contentPath: hasContent ? relative(contentUrl) : '', paths: authoringUrls.map(relative), active: Boolean(activeContentUrl && hasContent && activeContentUrl.pathname === contentUrl.pathname) },
    links: inspectHouseLinks(id, page, pageData, effectiveBio),
    boundPageScenePath: boundPageScene?.path || '', availableOriginalArt: Boolean(localArt.length || remoteArt.length),
    actualOriginalScenePaths: localArt.map(candidate => candidate.path), artCandidates: uniqueCandidates,
    provenance: { projectRegistry: Boolean(registered), publishedRegistry: Boolean(publishedId), snapshotPath: snapshot ? relative(snapshotUrl) : '',
      canonicalLocationSource: placement.role === 'primary' ? 'current-project-primary-placement' : 'explicit-current-additional-residence-placement' },
    missing: { page: !existingPage.present, bio: !existingBiography.present, art: !boundPageScene, localArt: !boundPageScene },
  };
}

export async function auditCenyrHouseCoverage({ allowlistIds } = {}) {
  const ids = normalizePublicAllowlist(allowlistIds), allowed = new Set(ids);
  const scopedIds = new Set(scope.map(record => resolveCanonicalFamilyId(record.id)));
  if (ids.some(id => deniedIds.has(id) || !scopedIds.has(id))) {
    throw new Error('Die Allowlist enthält nicht freigegebene oder nicht hierarchisch eingeordnete Familien-IDs.');
  }
  const selected = scope.filter(record => allowed.has(resolveCanonicalFamilyId(record.id)));
  const authoringIndex = indexExistingHouseAuthoring(allowed);
  const records = await Promise.all(selected.map(record => inspectFamilyCoverage(record, authoringIndex)));
  records.sort((first, second) => first.title.localeCompare(second.title, 'de'));
  const summary = summarizeCenyrCoverage(records, scopedIds.size - selected.length);
  return {
    ok: !hasCenyrCoverageGaps(summary),
    scope: 'Explicitly allowlisted public Cenyr family residences; no private identities or person graphs in this report.',
    summary, records,
  };
}
