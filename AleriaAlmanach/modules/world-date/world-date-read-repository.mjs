export const WORLD_DATE_DOCUMENT = Object.freeze({ collection: 'almanach_settings', id: 'current-date' });

// Shared read contract. Calendar views have no initialization or save capability.
export function createWorldDateReadRepository({ db, sdk }) {
  const reference = sdk.doc(db, WORLD_DATE_DOCUMENT.collection, WORLD_DATE_DOCUMENT.id);
  return Object.freeze({
    async load() { const snapshot = await sdk.getDoc(reference); return snapshot.exists() ? snapshot.data() : null; },
    subscribe(onNext, onError) {
      return sdk.onSnapshot(reference, snapshot => onNext(snapshot.exists() ? snapshot.data() : null), onError);
    },
  });
}
