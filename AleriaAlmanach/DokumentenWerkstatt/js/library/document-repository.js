const DATABASE = 'aleria-document-workshop';
const STORE = 'documents';

export async function openDocumentRepository() {
  const db = await new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE, { keyPath: 'id' });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error('Die Dokumentensammlung konnte nicht geöffnet werden. JSON-Export bleibt verfügbar.'));
  });
  const transaction = (mode, operation) => new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    let result;
    operation(tx.objectStore(STORE), value => { result = value; });
    tx.oncomplete = () => resolve(result);
    tx.onabort = tx.onerror = () => reject(new Error('Die Sammlung konnte nicht gespeichert werden. Bitte freien Browserspeicher prüfen und JSON sichern.'));
  });
  return {
    all: () => transaction('readonly', (store, done) => { store.getAll().onsuccess = event => done(event.target.result); }),
    put: record => transaction('readwrite', store => store.put(record)),
    remove: id => transaction('readwrite', store => store.delete(id)),
    acknowledge: (submitted, saved) => transaction('readwrite', store => {
      for (const result of saved) {
        store.get(result.id).onsuccess = event => {
          const current = event.target.result;
          if (!current) return;
          const snapshot = submitted.find(entry => entry.id === result.id);
          const unchanged = JSON.stringify(current.document) === JSON.stringify(snapshot?.document);
          store.put({ ...current, revision: result.revision, queued: !unchanged && current.queued,
            document: unchanged ? result.document : current.document, updatedAt: result.updatedAt });
        };
      }
    })
  };
}
