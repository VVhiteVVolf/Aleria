// Owns the browser's module cache. The synchronous snapshot serves existing
// editors; write promises resolve only after the database transaction commits.
function createModuleStoreLocalPersistence({ indexedDB, storage, keys, databaseName = 'aleria-module-store' }) {
  const values = new Map();
  const persisted = new Map();
  let database;
  let initialization;
  let initialized = false;
  let pending = Promise.resolve();
  let pendingWrites = 0;
  const dirtyKeys = new Set();

  function transact(mode, operation) {
    return new Promise((resolve, reject) => {
      const transaction = database.transaction('records', mode);
      let result;
      let failure;
      transaction.oncomplete = () => resolve(result);
      transaction.onabort = () => reject(failure || transaction.error || new Error('Lokale Speicherung wurde abgebrochen.'));
      transaction.onerror = () => {}; // The abort event reports the final failure.
      operation(transaction.objectStore('records'), value => { result = value; }, error => {
        failure = error;
        transaction.abort();
      });
    });
  }

  function openDatabase() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(databaseName, 1);
      let blocked = false;
      request.onupgradeneeded = () => request.result.createObjectStore('records');
      request.onerror = () => reject(request.error);
      request.onblocked = () => {
        blocked = true;
        reject(new Error('Bitte andere Almanach-Tabs schließen und erneut laden.'));
      };
      request.onsuccess = () => {
        const connection = request.result;
        if (blocked) { connection.close(); return; }
        connection.onversionchange = () => connection.close();
        resolve(connection);
      };
    });
  }

  async function initialize() {
    // Read legacy records without deleting anything. Migration removes them
    // only after all records are committed, and only if no old tab changed them.
    const legacy = new Map(keys.map(key => [key, storage.getItem(key)]));
    if (!indexedDB) {
      legacy.forEach((value, key) => values.set(key, value));
      initialized = true;
      return;
    }
    database = await openDatabase();
    await transact('readwrite', store => {
      keys.forEach(key => {
        const request = store.get(key);
        request.onsuccess = () => {
          const value = request.result ?? legacy.get(key);
          values.set(key, value ?? null);
          persisted.set(key, value ?? null);
          if (request.result === undefined && value != null) store.put(value, key);
          // Preserve an old tab's divergent cache for a full backup rather
          // than silently discarding it when a database already exists.
          if (request.result !== undefined && legacy.get(key) != null && request.result !== legacy.get(key)) {
            store.put(legacy.get(key), `legacy-recovery:${key}`);
          }
        };
      });
    });
    legacy.forEach((value, key) => {
      if (value != null && storage.getItem(key) === value) storage.removeItem(key);
    });
    initialized = true;
  }

  function ready() {
    if (!initialization) initialization = initialize();
    return initialization;
  }

  function read(key) {
    if (!initialized) throw new Error('Lokaler Modulspeicher ist noch nicht geladen.');
    return database ? values.get(key) ?? null : storage.getItem(key);
  }

  function write(key, value) {
    if (!initialized) throw new Error('Lokaler Modulspeicher ist noch nicht geladen.');
    if (!database) {
      if (value == null) storage.removeItem(key);
      else storage.setItem(key, value);
      values.set(key, value);
      return Promise.resolve();
    }
    values.set(key, value);
    dirtyKeys.add(key);
    pendingWrites += 1;
    const commit = pending.catch(() => {}).then(() => transact('readwrite', (store, _setResult, fail) => {
      const request = store.get(key);
      request.onsuccess = () => {
        const current = request.result ?? null;
        if (current !== persisted.get(key) && current !== value) {
          const error = new Error('Der Modulstand wurde in einem anderen Tab geändert. Bitte deine Änderungen als JSON exportieren und dann erneut laden.');
          error.code = 'module-store-concurrent-write';
          fail(error);
          return;
        }
        if (value == null) store.delete(key);
        else store.put(value, key);
      };
    }));
    pending = commit.then(() => {
      persisted.set(key, value);
      if (values.get(key) === value) dirtyKeys.delete(key);
    }).finally(() => { pendingWrites -= 1; });
    // Callers still receive the rejected promise; this handler prevents an
    // unhandled rejection in synchronous editor actions.
    pending.catch(() => {});
    return pending;
  }

  async function readLegacyRecovery() {
    await ready();
    if (!database) return {};
    return transact('readonly', (store, setResult) => {
      const records = {};
      setResult(records);
      keys.forEach(key => {
        const request = store.get(`legacy-recovery:${key}`);
        request.onsuccess = () => { if (request.result != null) records[key] = request.result; };
      });
    });
  }

  return Object.freeze({ ready, read, write, readLegacyRecovery,
    flush: async () => {
      await pending;
      if (dirtyKeys.size) throw new Error('Eine lokale Moduländerung konnte noch nicht gesichert werden.');
    },
    hasPendingWrites: () => pendingWrites > 0 || dirtyKeys.size > 0 });
}

const moduleStoreLocalPersistence = createModuleStoreLocalPersistence({
  indexedDB: globalThis.indexedDB,
  storage: localStorage,
  keys: [MODULE_STORE_KEY, MODULE_STORE_SYNC_META_KEY]
});

window.addEventListener('beforeunload', event => {
  if (!moduleStoreLocalPersistence.hasPendingWrites()) return;
  event.preventDefault();
  event.returnValue = '';
});
