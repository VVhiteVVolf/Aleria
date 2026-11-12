// Comfort settings contain identities only, never balances or inventories.
const account = value => typeof value === 'string' && /^(?:character|group):[\w:.-]{1,220}$/.test(value);
const person = value => typeof value === 'string' && /^[\w:.-]{1,220}$/.test(value);
export function createCatalogPurchasePreferences(storage, uid, moduleId) {
  const key = `aleria:catalog-purchase:people:v1:${encodeURIComponent(uid)}:${encodeURIComponent(moduleId)}`;
  return {
    read() {
      try {
        const value = JSON.parse(storage?.getItem(key) || 'null');
        return value?.schemaVersion === 1 ? {
          payerKey: account(value.payerKey) ? value.payerKey : '',
          recipientKey: account(value.recipientKey) && value.recipientKey.startsWith('character:') ? value.recipientKey : '',
          actorCharacterId: person(value.actorCharacterId) ? value.actorCharacterId : ''
        } : {};
      } catch { return {}; }
    },
    save(selection) {
      try {
        storage?.setItem(key, JSON.stringify({ schemaVersion: 1, payerKey: selection.payerKey,
          recipientKey: selection.recipientKey, actorCharacterId: selection.actorCharacterId }));
      } catch { /* A disabled preference store never changes the purchase itself. */ }
    }
  };
}
