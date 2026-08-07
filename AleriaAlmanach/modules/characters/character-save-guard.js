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
    if (!(field in outgoingData) || !outgoingData[field]) return false;
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
  stampFreshRevisions,
  selectChangedSections
});
