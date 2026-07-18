import { serializeFamily } from './family-transfer.js';

const CONTENT_TYPE_EXTENSIONS = Object.freeze({
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/webp': '.webp',
  'image/svg+xml': '.svg',
  'image/gif': '.gif'
});

export function extensionForContentType(contentType, fallbackSource = '') {
  const mapped = CONTENT_TYPE_EXTENSIONS[String(contentType || '').toLocaleLowerCase('de').split(';')[0].trim()];
  if (mapped) return mapped;
  const match = /\.([a-z0-9]{2,5})(?:\?.*)?$/i.exec(String(fallbackSource || ''));
  return match ? `.${match[1].toLocaleLowerCase('de')}` : '.png';
}

// Sammelt alle sechs bild-tragenden Stellen im Schema. Jeder Eintrag trägt einen
// strukturierten "kind" (statt eines geparsten Pfadstrings), damit sich Export und
// Import ohne fragile String-Zerlegung wieder zuordnen lassen (siehe
// family-bundle-import.js#rewriteFamilyImageRefs).
export function collectFamilyImageRefs(family) {
  const refs = [];
  const push = (kind, ownerId, source) => {
    const value = String(source || '').trim();
    if (value) refs.push({ kind, ownerId: String(ownerId || ''), source: value });
  };

  push('document.emblem', family.document.id, family.document.emblem);
  const regionEmblems = family.document.houseProfile?.regionEmblems || {};
  push('houseProfile.regionEmblems.seat', family.document.id, regionEmblems.seat);
  push('houseProfile.regionEmblems.barony', family.document.id, regionEmblems.barony);
  push('houseProfile.regionEmblems.county', family.document.id, regionEmblems.county);
  push('houseProfile.regionEmblems.kingdom', family.document.id, regionEmblems.kingdom);
  family.persons.forEach(person => push('person.portrait', person.id, person.portrait));
  family.houses.forEach(house => push('house.emblem', house.id, house.emblem));
  family.cadetBranches.forEach(branch => push('cadetBranch.emblem', branch.id, branch.emblem));
  if (family.lineage.originHouse?.enabled) {
    push('lineage.originHouse.emblem', family.lineage.originHouse.id, family.lineage.originHouse.emblem);
  }
  return refs;
}

const ZIP_NAME_PREFIXES = Object.freeze({
  'document.emblem': 'document-emblem',
  'houseProfile.regionEmblems.seat': 'region-seat',
  'houseProfile.regionEmblems.barony': 'region-barony',
  'houseProfile.regionEmblems.county': 'region-county',
  'houseProfile.regionEmblems.kingdom': 'region-kingdom',
  'person.portrait': 'person',
  'house.emblem': 'house',
  'cadetBranch.emblem': 'cadet',
  'lineage.originHouse.emblem': 'origin-house-emblem'
});

const OWNED_KINDS = new Set(['person.portrait', 'house.emblem', 'cadetBranch.emblem']);

export function zipFilenameFor(ref, extension) {
  const prefix = ZIP_NAME_PREFIXES[ref.kind] || 'image';
  const suffix = OWNED_KINDS.has(ref.kind) && ref.ownerId ? `-${ref.ownerId}` : '';
  return `images/${prefix}${suffix}${extension}`;
}

// Lädt jedes referenzierte Bild einzeln herunter und packt es in die Zip. Ein
// einzelnes fehlschlagendes Bild (z. B. wegen Firebase-Storage-CORS) darf den
// gesamten Export nicht abbrechen — der Fehler landet stattdessen im Manifest,
// und der Aufrufer entscheidet, wie er das dem Nutzer meldet.
export async function buildFamilyBundleZip(family, { runtime = globalThis, fetchImpl, JSZipCtor } = {}) {
  const fetcher = fetchImpl || runtime.fetch?.bind(runtime);
  const ZipConstructor = JSZipCtor || runtime.JSZip;
  if (typeof ZipConstructor !== 'function') throw new Error('JSZip ist nicht verfügbar.');
  if (typeof fetcher !== 'function') throw new Error('Kein fetch verfügbar, um Bilder zu laden.');

  const zip = new ZipConstructor();
  const refs = collectFamilyImageRefs(family);
  const manifestImages = [];

  for (const ref of refs) {
    try {
      const response = await fetcher(ref.source);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const blob = await response.blob();
      const contentType = response.headers?.get?.('content-type') || blob.type || '';
      const extension = extensionForContentType(contentType, ref.source);
      const zipPath = zipFilenameFor(ref, extension);
      zip.file(zipPath, blob);
      manifestImages.push({ kind: ref.kind, ownerId: ref.ownerId, source: ref.source, zipPath, contentType });
    } catch (error) {
      manifestImages.push({
        kind: ref.kind,
        ownerId: ref.ownerId,
        source: ref.source,
        zipPath: '',
        contentType: '',
        error: error.message || 'Unbekannter Fehler beim Laden des Bildes.'
      });
    }
  }

  zip.file('family.json', serializeFamily(family));
  zip.file('manifest.json', JSON.stringify({ images: manifestImages }, null, 2));

  const blob = await zip.generateAsync({ type: 'blob' });
  const failedCount = manifestImages.filter(entry => entry.error).length;
  return { blob, failedCount, imageCount: refs.length };
}

function safeFileNameFor(family) {
  return family.document.title.toLocaleLowerCase('de')
    .replace(/[^a-z0-9äöüß]+/gi, '-')
    .replace(/^-|-$/g, '') || 'stammbaum';
}

export async function downloadFamilyBundle(family, { documentRef = globalThis.document, runtime = globalThis } = {}) {
  const { blob, failedCount, imageCount } = await buildFamilyBundleZip(family, { runtime });
  const url = URL.createObjectURL(blob);
  const anchor = documentRef.createElement('a');
  anchor.href = url;
  anchor.download = `${safeFileNameFor(family)}.zip`;
  anchor.click();
  URL.revokeObjectURL(url);
  return { failedCount, imageCount };
}
