// Firebase SDK ownership stays here; UI/store code only sees the repository API.
export function createItemRegisterFirebase({ db, collection, onSnapshot, httpsCallable, functions, requireUser }) {
  const commit = httpsCallable(functions, 'commitItemRegister', { timeout: 30000 });
  return Object.freeze({
    subscribe(kind, onNext, onError) {
      const path = { offers: 'item_register_offers', characters: 'characters', creatures: 'creatures' }[kind];
      if (!path) throw new Error('Unbekannte Registersammlung.');
      return onSnapshot(collection(db, path), { includeMetadataChanges: true }, snapshot => {
        onNext(snapshot.docs.map(entry => ({ ...entry.data(), id: entry.id })), { fromCache: snapshot.metadata.fromCache });
      }, onError);
    },
    async commit(input) {
      await requireUser();
      return (await commit(input)).data;
    }
  });
}
