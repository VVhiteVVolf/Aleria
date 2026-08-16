import { cloneValue } from '../domain/family-schema.js';
import { parseFamilyJson } from './family-transfer.js';

export function buildImageRefKey(kind, ownerId) {
  return `${kind}::${ownerId || ''}`;
}

// Schreibt Bildverweise anhand des im Manifest festgehaltenen strukturierten Keys
// (kind+ownerId) um. Felder ohne aufgelösten Ersatz bleiben UNVERÄNDERT — ein
// teilweise fehlgeschlagener Export/Import darf niemals gültige Daten leeren.
export function rewriteFamilyImageRefs(family, resolvedByKey) {
  const resolved = resolvedByKey instanceof Map ? resolvedByKey : new Map(Object.entries(resolvedByKey || {}));
  const next = cloneValue(family);
  const resolve = (kind, ownerId, current) => {
    const key = buildImageRefKey(kind, ownerId);
    return resolved.has(key) ? resolved.get(key) : current;
  };

  next.document.emblem = resolve('document.emblem', family.document.id, next.document.emblem);
  const regionEmblems = next.document.houseProfile.regionEmblems;
  regionEmblems.seat = resolve('houseProfile.regionEmblems.seat', family.document.id, regionEmblems.seat);
  regionEmblems.barony = resolve('houseProfile.regionEmblems.barony', family.document.id, regionEmblems.barony);
  regionEmblems.county = resolve('houseProfile.regionEmblems.county', family.document.id, regionEmblems.county);
  regionEmblems.kingdom = resolve('houseProfile.regionEmblems.kingdom', family.document.id, regionEmblems.kingdom);
  if (Array.isArray(next.document.houseProfile.folderIcons)) {
    next.document.houseProfile.folderIcons = next.document.houseProfile.folderIcons.map((current, index) => (
      resolve(`houseProfile.folderIcons.${index}`, family.document.id, current)
    ));
  }
  next.persons.forEach(person => {
    person.portrait = resolve('person.portrait', person.id, person.portrait);
  });
  next.houses.forEach(house => {
    house.emblem = resolve('house.emblem', house.id, house.emblem);
  });
  next.cadetBranches.forEach(branch => {
    branch.emblem = resolve('cadetBranch.emblem', branch.id, branch.emblem);
  });
  if (next.lineage.originHouse) {
    next.lineage.originHouse.emblem = resolve(
      'lineage.originHouse.emblem',
      family.lineage.originHouse.id,
      next.lineage.originHouse.emblem
    );
  }
  return next;
}

// Entpackt family.json + manifest.json + die referenzierten Bilder aus einer zuvor
// über family-bundle-export.js erzeugten Zip. Fehlt manifest.json (z. B. bei einer
// manuell gebastelten Zip), wird das nicht als Fehler behandelt — nur eben keine
// Bilder mitgeliefert.
export async function parseFamilyBundleZip(arrayBuffer, { JSZipCtor } = {}) {
  const ZipConstructor = JSZipCtor || globalThis.JSZip;
  if (typeof ZipConstructor !== 'function') throw new Error('JSZip ist nicht verfügbar.');
  const zip = await new ZipConstructor().loadAsync(arrayBuffer);

  const familyEntry = zip.file('family.json');
  if (!familyEntry) throw new Error('Die Zip-Datei enthält keine family.json.');
  const family = parseFamilyJson(await familyEntry.async('string'));

  let manifestImages = [];
  const manifestEntry = zip.file('manifest.json');
  if (manifestEntry) {
    try {
      const parsed = JSON.parse(await manifestEntry.async('string'));
      manifestImages = Array.isArray(parsed?.images) ? parsed.images : [];
    } catch (error) {
      manifestImages = [];
    }
  }

  const images = [];
  for (const entry of manifestImages) {
    if (!entry.zipPath || entry.error) continue;
    const imageEntry = zip.file(entry.zipPath);
    if (!imageEntry) continue;
    const blob = await imageEntry.async('blob');
    images.push({ ...entry, blob });
  }

  return { family, images };
}

function fileNameFromZipPath(zipPath) {
  return String(zipPath || 'image').split('/').pop();
}

// Importiert eine Bundle-Zip in den Store. Für jedes mitgelieferte Bild wird IMMER
// ein echter Firebase-Upload versucht, sofern ein assetRepository übergeben wurde —
// dessen eigene "nicht angemeldet"-Prüfung übernimmt die Auth-Kontrolle, statt sie
// hier zu duplizieren. Schlägt der Upload fehl (keine Anmeldung, Netzwerk, Kontingent),
// wird stattdessen eine Session-Blob-URL verwendet und der Nutzer per Toast gewarnt,
// dass diese Bilder einen Neuladen der Seite nicht überleben.
export async function importFamilyBundle({
  file,
  store,
  assetRepository = null,
  runtime = globalThis,
  notify = () => {}
}) {
  if (!file) return { uploadedCount: 0, sessionOnlyCount: 0 };
  const arrayBuffer = await file.arrayBuffer();
  const { family, images } = await parseFamilyBundleZip(arrayBuffer, { JSZipCtor: runtime.JSZip });

  const resolvedByKey = new Map();
  let uploadedCount = 0;
  let sessionOnlyCount = 0;

  for (const image of images) {
    const imageFile = new File([image.blob], fileNameFromZipPath(image.zipPath), {
      type: image.contentType || image.blob.type || 'image/png'
    });
    let resolvedUrl = '';
    if (assetRepository) {
      try {
        const result = await assetRepository.uploadImage({
          familyId: family.document.id,
          file: imageFile,
          kind: image.kind
        });
        resolvedUrl = result?.url || '';
        if (resolvedUrl) uploadedCount += 1;
      } catch (error) {
        // Kein Login/Netzwerk/Kontingent — fällt unten auf eine Session-Blob-URL zurück.
      }
    }
    if (!resolvedUrl) {
      resolvedUrl = URL.createObjectURL(image.blob);
      sessionOnlyCount += 1;
    }
    resolvedByKey.set(buildImageRefKey(image.kind, image.ownerId), resolvedUrl);
  }

  const rewritten = rewriteFamilyImageRefs(family, resolvedByKey);
  store.replaceFamily(rewritten, { source: 'bundle-import' });
  store.selectPerson(rewritten.view.focusPersonId || rewritten.persons[0]?.id || '');

  if (sessionOnlyCount > 0) {
    notify(
      `${rewritten.persons.length} Personen importiert · ${sessionOnlyCount} Bild(er) nur für diese Sitzung geladen (nicht dauerhaft gespeichert).`,
      { duration: 8000 }
    );
  } else {
    notify(`${rewritten.persons.length} Personen und ${uploadedCount} Bild(er) importiert.`);
  }
  return { uploadedCount, sessionOnlyCount };
}
