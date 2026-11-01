// Shared read contract for the split Firebase module store.
export function readFirebaseModuleEntry(data) {
  if (typeof data?.entryJson === 'string' && data.entryJson) {
    const parsed = JSON.parse(data.entryJson);
    return parsed && typeof parsed === 'object' ? parsed : null;
  }
  return data?.entry && typeof data.entry === 'object' ? data.entry : null;
}
