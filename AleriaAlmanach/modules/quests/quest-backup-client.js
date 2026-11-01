// Also used by the Almanach's complete backup without loading the quest UI.
export function createQuestBackupClient({ functions, httpsCallable, requireUser }) {
  const call = httpsCallable(functions, 'questBackup', { timeout: 60000 });
  return Object.freeze({
    async exportBackup() {
      await requireUser(); const collections = {};
      for (const collection of (await call({ action: 'collections' })).data.collections) {
        const records = []; let cursor = null;
        do { const page = (await call({ action: 'export', collection, cursor })).data; records.push(...page.records); cursor = page.cursor; } while (cursor);
        collections[collection] = records;
      }
      return { schemaVersion: 1, collections };
    },
    async restoreBackup(payload) {
      await requireUser();
      for (const collection of (await call({ action: 'collections' })).data.collections) {
        const rows = payload.collections?.[collection] || [];
        for (let index = 0; index < rows.length; index += 100) await call({ action: 'restore', collection, records: rows.slice(index, index + 100) });
      }
    }
  });
}
