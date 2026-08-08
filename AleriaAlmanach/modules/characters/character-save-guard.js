import { mergeCharacterImageLibrary } from './character-import-policy.js?v=20260808-character-storage-audit-v1';

// Reine Entscheidungslogik hinter dem Zurücküberschreiben-Schutz aus firebase.js#saveCharacter.
// Getrennt in ein eigenes, Firebase-freies Modul, damit die eigentliche Vergleichslogik echt
// getestet werden kann (firebase.js selbst lässt sich ohne Firestore-Verbindung nicht laden).

function fieldRevision(record, field) {
  const value = record?.[field]?.revision;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

// Vergleicht das serverseitig gespeicherte Dokument mit den Daten, die ein Client jetzt
// speichern will, und liefert die Namen der Felder zurück, bei denen der Client eine ältere
// Revision mitbringt als der Server bereits hat (z. B. weil zwischenzeitlich ein Import
// stattfand, den dieser Tab noch nicht kennt). Nur Felder, die im ausgehenden Datensatz
// tatsächlich enthalten sind, werden geprüft - ein Speichervorgang, der z. B. nur den Namen
// ändert, wird von einer veralteten Kampfprofil-Kopie nicht betroffen.
export function detectStaleCharacterFields(currentDocData, outgoingData, fieldLabels = { combatProfile: 'Kampfprofil', inventory: 'Inventar' }) {
  if (!currentDocData || !outgoingData) return [];
  return Object.keys(fieldLabels).filter(field => {
    if (!Object.prototype.hasOwnProperty.call(outgoingData, field)) return false;
    return fieldRevision(currentDocData, field) > fieldRevision(outgoingData, field);
  }).map(field => fieldLabels[field]);
}

// Stempelt eine frische, monoton wachsende Revision auf jedes vorhandene geschützte Feld,
// nachdem detectStaleCharacterFields() grünes Licht gegeben hat (oder ein Import ohnehin
// erzwungen wird). Mutiert nicht das Original, liefert eine flache Kopie zurück.
export function stampFreshRevisions(outgoingData, fields = ['combatProfile', 'inventory'], now = Date.now()) {
  const stamped = { ...outgoingData };
  fields.forEach(field => {
    if (stamped[field]) stamped[field] = { ...stamped[field], revision: now };
  });
  return stamped;
}

function getNextCharacterRevision(currentDocData, fields, requestedRevision = Date.now()) {
  const requested = Math.max(1, Math.trunc(Number(requestedRevision) || Date.now()));
  if (!currentDocData || typeof currentDocData !== 'object') return requested;
  const highestCurrent = fields.reduce((highest, field) => Math.max(highest, fieldRevision(currentDocData, field)), 0);
  return Math.max(requested, highestCurrent + 1);
}

const CHARACTER_IMAGE_LIBRARY_FIELDS = Object.freeze([
  'imageSetSchemaVersion',
  'imageSets',
  'activeImageSetId',
  'portrait',
  'emotes',
  'emotesOverride',
  'imageSetsOverride'
]);

// Liefert exakt den Firestore-Patch der Avatarsektion. Andere Aufrufer (Kommentar-Picker,
// Autosave) können dadurch keine Profil-, Inventar- oder Kampffelder aus einem alten lokalen
// Charakterdatensatz versehentlich mitschreiben.
export function selectCharacterImageLibraryWrite(source = {}, options = {}) {
  const write = {};
  CHARACTER_IMAGE_LIBRARY_FIELDS.forEach(field => {
    if (Object.prototype.hasOwnProperty.call(source, field)) write[field] = source[field];
  });
  if (options.includeUpdatedAt !== false && Object.prototype.hasOwnProperty.call(source, 'updatedAt')) {
    write.updatedAt = source.updatedAt;
  }
  return write;
}

export function selectCharacterArchiveStatusWrite(source = {}) {
  return {
    archived: !!source.archived,
    ...(Object.prototype.hasOwnProperty.call(source, 'updatedAt') ? { updatedAt: source.updatedAt } : {})
  };
}

export function selectCharacterGenealogyWrite(source = {}) {
  return {
    ...(Object.prototype.hasOwnProperty.call(source, 'identity') ? { identity: source.identity } : {}),
    ...(Object.prototype.hasOwnProperty.call(source, 'genealogy') ? { genealogy: source.genealogy } : {}),
    ...(Object.prototype.hasOwnProperty.call(source, 'updatedAt') ? { updatedAt: source.updatedAt } : {})
  };
}

// Eine Kampfsperre schützt nur die kampfrelevanten Bereiche. Reine Profil- oder
// Bildbibliothek-Schreibvorgänge dürfen unabhängig davon als gezielte Merges weiterlaufen.
export function shouldBlockCharacterWriteDuringEncounter(outgoingData, activeEncounterKeys) {
  if (!Array.isArray(activeEncounterKeys) || activeEncounterKeys.length === 0) return false;
  return !!outgoingData && (
    Object.prototype.hasOwnProperty.call(outgoingData, 'combatProfile')
    || Object.prototype.hasOwnProperty.call(outgoingData, 'inventory')
  );
}

// Bereitet den eigentlichen Firestore-Schreibvorgang vor. Normale Formularspeicherungen bleiben
// absichtlich Merge-Schreibvorgaenge, damit ein spezialisierter Teil-Editor keine fremden Bereiche
// loescht. Ein ausdruecklicher Vollimport ersetzt dagegen das Dokument vollstaendig. Nur die
// serverseitige Besitz-/Erstellerkennung wird aus dem bestehenden Dokument bewahrt, weil diese
// Verwaltungsdaten nicht aus einer exportierten Charakterdatei uebernommen werden duerfen.
export function prepareCharacterDocumentWrite(currentDocData, outgoingData, options = {}) {
  const current = currentDocData && typeof currentDocData === 'object' ? currentDocData : null;
  const userId = String(options.userId || '').trim();
  const fields = Array.isArray(options.revisionFields) ? options.revisionFields : ['combatProfile', 'inventory'];
  const replaceExisting = !!current && options.replaceExisting === true;
  const protectedOutgoing = replaceExisting
    ? mergeCharacterImageLibrary(current, outgoingData || {}, {
        replaceImageLibrary: options.replaceImageLibrary === true
      })
    : (outgoingData || {});
  const nextRevision = getNextCharacterRevision(current, fields, options.now);
  const stamped = stampFreshRevisions(protectedOutgoing, fields, nextRevision);

  if (!current) {
    return {
      data: {
        ...stamped,
        ownerUid: userId,
        createdBy: userId
      },
      merge: false
    };
  }

  if (!replaceExisting) return { data: stamped, merge: true };

  const ownerUid = String(current.ownerUid || userId).trim();
  const createdBy = String(current.createdBy || current.ownerUid || userId).trim();
  return {
    data: {
      ...stamped,
      ownerUid,
      createdBy
    },
    merge: false
  };
}

// Vergleicht mehrere benannte Abschnitte (z. B. Kampfprofil, Inventar, Bilder & Emotes) zwischen
// dem gerade aus dem Formular eingesammelten Stand und dem Stand, der beim Öffnen des Bogens
// geladen wurde. Liefert nur die Namen der Abschnitte zurück, die sich WIRKLICH unterscheiden -
// die Grundlage dafür, dass z. B. ein reiner Avatar-Upload das Kampfprofil/Inventar gar nicht erst
// in den Schreibvorgang mitnimmt (siehe character-profile.js#saveCharacter). Ohne Baseline (z. B.
// eine neu angelegte Figur) gilt automatisch alles als "geändert", da es dort nichts zu schützen
// gibt und der erste Schreibvorgang vollständig sein muss.
export function selectChangedSections(current, baseline, sectionNames) {
  if (!baseline) return [...sectionNames];
  return sectionNames.filter(name => JSON.stringify(current?.[name]) !== JSON.stringify(baseline?.[name]));
}

// Klassische (nicht-modulare) Skripte wie character-profile.js können kein `import` verwenden -
// dieselbe, hier getestete Logik wird deshalb zusätzlich global bereitgestellt. firebase.js lädt
// als type="module" vor allen defer-Skripten, das Fenster-Objekt steht rechtzeitig bereit.
globalThis.AleriaCharacterSaveGuard = Object.freeze({
  detectStaleCharacterFields,
  mergeCharacterImageLibrary,
  stampFreshRevisions,
  shouldBlockCharacterWriteDuringEncounter,
  prepareCharacterDocumentWrite,
  selectCharacterArchiveStatusWrite,
  selectCharacterGenealogyWrite,
  selectCharacterImageLibraryWrite,
  selectChangedSections
});
