// Feature callers share the existing native register entry point. Importing
// this bridge never loads a catalogue or opens a Firebase subscription.
export async function requestItemRegister(host = globalThis) {
  if (typeof host.itemDbEnsureGlobalSync === 'function') await host.itemDbEnsureGlobalSync();
  else if (typeof host.AleriaItemRegister?.ensure === 'function') await host.AleriaItemRegister.ensure();
  else throw new Error('Das Handelsregister ist in dieser Ansicht nicht verfügbar.');
  if (!host.AleriaItemRegister) throw new Error('Das Handelsregister konnte nicht vorbereitet werden. Bitte erneut versuchen.');
  return host.AleriaItemRegister;
}
