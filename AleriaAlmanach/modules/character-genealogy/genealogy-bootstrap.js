import { normalizeCharacterGenealogy, normalizeCharacterIdentity, findBestCharacterMatch } from './person-identity.js?v=20260903-genealogy-import-hangfix-v1';

// Identity normalization is needed by ordinary character readers. The complete
// family registry and import dialog belong to explicit genealogy requests.
export function createGenealogyBootstrap({ host = globalThis, events = host.document,
  loadMemberships = () => import('./family-membership-index.js?v=20261104-startup-v1'),
  loadImporter = () => import('./genealogy-import-controller.js?v=20261104-startup-v1') } = {}) {
  let active = true, memberships = null, membershipRequest = null, importer = null, importerRequest = null, opening = null, launchIsCurrent = () => true;
  const report = error => { if (active) host.showAppStatus?.(error?.message || 'Die Stammbaum-Funktion konnte nicht geladen werden. Bitte erneut versuchen.', 'error'); };
  function publish() {
    if (!active) return;
    host.AleriaCharacterGenealogy = Object.freeze({ normalizeCharacterGenealogy, normalizeCharacterIdentity, findBestCharacterMatch,
      ensureFamilyMemberships, ...(memberships ? { getFamilyMemberships: memberships } : {}) });
    events?.dispatchEvent?.(new (host.CustomEvent || CustomEvent)('aleria:character-genealogy-ready'));
  }
  function ensureFamilyMemberships() {
    if (!active) return Promise.reject(new Error('Die Stammbaum-Ansicht ist nicht mehr aktiv.'));
    if (memberships) return Promise.resolve(memberships);
    if (!membershipRequest) membershipRequest = Promise.resolve().then(loadMemberships).then(module => {
      const resolver = module.getDefaultCharacterFamilyMemberships;
      if (typeof resolver !== 'function') throw new Error('Die Stammbaum-Zuordnung konnte nicht vorbereitet werden. Bitte erneut versuchen.');
      memberships = resolver;
      publish();
      return resolver;
    }).catch(error => { report(error); throw error; }).finally(() => { membershipRequest = null; });
    return membershipRequest;
  }
  function ensureImporter() {
    if (importer) return Promise.resolve(importer);
    if (!importerRequest) {
      host.showAppStatus?.('Stammbaum-Import wird vorbereitet. Die Familien werden geladen …', 'info');
      importerRequest = Promise.resolve().then(loadImporter).then(module => {
        if (typeof module.openImportDialog !== 'function') throw new Error('Der Stammbaum-Import konnte nicht vorbereitet werden. Bitte erneut versuchen.');
        importer = module;
        return module;
      }).finally(() => { importerRequest = null; });
    }
    return importerRequest;
  }
  function openImportDialog(isCurrent = () => true) {
    if (!active) return Promise.resolve();
    // A later click can come from a newly rendered register while this one
    // shared module request is pending. Only the latest source may open it.
    launchIsCurrent = isCurrent;
    if (!opening) opening = ensureImporter().then(module => { if (active && launchIsCurrent()) return module.openImportDialog(); })
      .catch(error => { if (launchIsCurrent()) report(error); throw error; })
      .finally(() => { opening = null; launchIsCurrent = () => true; });
    return opening;
  }
  function handleClick(event) {
    const trigger = event.target?.closest?.('[data-character-genealogy-action="open-import"]');
    if (!trigger || trigger.disabled) return;
    event.preventDefault();
    const source = trigger.closest?.('#char-grid');
    void openImportDialog(() => !source || source.isConnected).catch(() => {}); // The shared launch reports once.
  }
  events?.addEventListener?.('click', handleClick);
  publish();
  return Object.freeze({ ensureFamilyMemberships, openImportDialog, destroy() { active = false; events?.removeEventListener?.('click', handleClick); } });
}

if (typeof document !== 'undefined') createGenealogyBootstrap();
