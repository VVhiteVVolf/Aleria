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
