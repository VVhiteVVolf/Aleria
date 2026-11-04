/** Hydrate only selectable inventories; identity/revision changes require fresh readiness. */
export function createSceneTradeAccountReadiness(ensureVersions, onChange = () => {}) {
  const records = new Map();
  const ready = account => !ensureVersions || records.get(account.key)?.record === account.record && records.get(account.key)?.status === 'ready';
  return {
    ready,
    decorate: accounts => accounts.map(account => ({ ...account, definitionsReady: ready(account) })),
    assert(accounts) {
      if (accounts.some(account => !ready(account))) throw Error('Das gewählte Inventar wird noch vorbereitet. Warte kurz oder lade die Bestände erneut.');
    },
    async ensure(accounts) {
      if (!ensureVersions) return;
      const missing = accounts.filter(account => {
        const current = records.get(account.key);
        return !current || current.record !== account.record || current.status === 'error';
      });
      if (missing.length) {
        const batch = missing.map(account => ({ key: account.key, record: account.record, status: 'pending' }));
        const pending = Promise.resolve().then(() => ensureVersions(batch.map(entry => entry.record))).then(() => {
          for (const entry of batch) if (records.get(entry.key) === entry) entry.status = 'ready';
          onChange();
        }, error => {
          for (const entry of batch) if (records.get(entry.key) === entry) entry.status = 'error';
          onChange(); throw error;
        });
        for (const entry of batch) { entry.pending = pending; records.set(entry.key, entry); }
      }
      await Promise.all([...new Set(accounts.map(account => records.get(account.key)?.pending).filter(Boolean))]);
    }
  };
}
