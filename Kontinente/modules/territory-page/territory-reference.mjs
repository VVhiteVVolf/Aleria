// Stable registry identities own destinations; names, banners and array positions do not.
export function territoryHref(id, registry = []) {
  const entry = registry.find(entry => entry.id === id && entry.page);
  return entry ? `/Kontinente/${entry.page}` : '';
}
