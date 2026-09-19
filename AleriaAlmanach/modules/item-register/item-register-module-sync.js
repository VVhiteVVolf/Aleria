// The module store owns persistence and visibility. The register listens only
// for its changes and projects the effective entries (built-ins + custom pages).
export function watchModuleCatalog(store, { events = globalThis.window, read = () => globalThis.itemDbGetModuleEntries?.() || [] } = {}) {
  const refresh = () => store.setModules(read());
  events.addEventListener('almanach:modules-changed', refresh);
  refresh();
  return () => events.removeEventListener('almanach:modules-changed', refresh);
}
