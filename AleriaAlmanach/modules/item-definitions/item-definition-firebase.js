import { itemDefinitionKey } from './item-definition-model.js';

export function createItemDefinitionsFirebase({ db, collection, doc, getDoc, getDocs, onSnapshot, functions, httpsCallable, requireUser }) {
  const commitDefinition = httpsCallable(functions, 'commitItemDefinition', { timeout: 30000 });
  const trade = httpsCallable(functions, 'commitItemTrade', { timeout: 30000 });
  const award = httpsCallable(functions, 'commitItemAward', { timeout: 30000 });
  const migrate = httpsCallable(functions, 'commitItemMigration', { timeout: 30000 });
  const backup = httpsCallable(functions, 'itemBackup', { timeout: 60000 });
  return Object.freeze({
    subscribe(onNext, onError) {
      return onSnapshot(collection(db, 'item_definitions'), { includeMetadataChanges: true }, snapshot =>
        onNext(snapshot.docs.map(entry => entry.data()), { fromCache: snapshot.metadata.fromCache }), onError);
    },
    async loadVersions(references) {
      const snapshots = await Promise.all(references.map(ref => getDoc(doc(db, 'item_definition_versions', itemDefinitionKey(ref)))));
      return snapshots.filter(snapshot => snapshot.exists()).map(snapshot => snapshot.data());
    },
    async commit(input) { await requireUser(); return (await commitDefinition(input)).data; },
    async trade(input) { await requireUser(); return (await trade(input)).data; },
    async award(input) { await requireUser(); return (await award(input)).data; },
    async migrate(input) { await requireUser(); return (await migrate(input)).data; },
    async exportBackup() {
      await requireUser();
      const result = { schemaVersion: 1, collections: {} };
      const names = (await backup({ action: 'collections' })).data.collections;
      for (const collection of names) {
        const records = []; let cursor = null;
        do { const page = (await backup({ action: 'export', collection, cursor })).data; records.push(...page.records); cursor = page.cursor; } while (cursor);
        result.collections[collection] = records;
      }
      return result;
    },
    async restoreBackup(payload) {
      await requireUser();
      const names = (await backup({ action: 'collections' })).data.collections;
      for (const collection of names) {
        const records = payload.collections?.[collection] || [];
        for (let index = 0; index < records.length; index += 100) await backup({ action: 'restore', collection, records: records.slice(index, index + 100) });
      }
    },
    async access() { const user = await requireUser(); const token = await user.getIdTokenResult(); return { uid: user.uid, role: token.claims.aleriaRole || 'player' }; },
    async characters() { return (await getDocs(collection(db, 'characters'))).docs.map(entry => ({ ...entry.data(), id: entry.id })); },
    async record(kind, id) { if (!['characters', 'creatures'].includes(kind)) throw Error('Unbekannte Inventarquelle.'); const snapshot = await getDoc(doc(db, kind, id)); return snapshot.exists() ? { ...snapshot.data(), id: snapshot.id } : null; }
  });
}
