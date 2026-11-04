// Only acknowledged server snapshots are authoritative module-store sources.
export function assertServerModuleStoreSnapshot(snapshot) {
  if (!snapshot?.metadata?.fromCache && !snapshot?.metadata?.hasPendingWrites) return snapshot;
  const error = new Error('Der Online-Modulstand ist noch nicht vom Server bestätigt.');
  error.code = 'module-store-awaiting-server';
  throw error;
}

export function subscribeServerModuleStore({ onSnapshot, reference, decode, onNext, onError }) {
  let active = true;
  let sequence = 0;
  const unsubscribe = onSnapshot(reference, { includeMetadataChanges: true }, snapshot => {
    const current = ++sequence;
    if (snapshot.metadata?.fromCache || snapshot.metadata?.hasPendingWrites) return;
    Promise.resolve().then(() => decode(snapshot)).then(payload => {
      if (active && current === sequence) onNext(payload);
    }).catch(error => {
      if (active && current === sequence && error?.code !== 'module-store-awaiting-server') onError?.(error);
    });
  }, error => { if (active) onError?.(error); });
  return () => {
    active = false;
    sequence += 1;
    unsubscribe();
  };
}
