import catalog from './house-directories.generated.json' with { type: 'json' };

// No global state or network writes. The owning loader publishes this projection.
export function projectHouseDirectories(data, id, kind) {
  if (!data) return data;
  const groups = catalog[kind]?.[id];
  if (!groups) return data;
  return kind === 'places' ? { ...data, houses: groups }
    : { ...data, view: { ...data.view, familySections: groups } };
}
