// Owns the explicit switch from a browser draft to the deployed map.
// Storage and backup access stay behind their existing feature interfaces.
(function () {
  const button = document.querySelector('[data-action="load-published-map"]');
  const storage = window.KartoPublish;
  const runtime = window.KartoRuntime;
  if (!button || !storage || !runtime) return;

  const statusLabel = document.querySelector('[data-role="map-storage-status"]');
  let loading = false;

  function render() {
    button.hidden = !storage.isConfigured();
    button.disabled = loading || !storage.isReady();
    button.textContent = loading ? 'Lade aktuelle Karte …' : '↻ Aktuelle Karte laden';
    if (statusLabel) {
      statusLabel.textContent = storage.hasLocalDraft() ? 'ENTWURF'
        : storage.hasPublishedState() ? 'VERÖFFENTLICHT' : 'LOKAL';
    }
  }

  function requireClosedEditor() {
    if (window.KartoPinEditor?.isOpen() || document.querySelector('.mo.open')) {
      throw new Error('Bitte die offene Bearbeitung zuerst übernehmen oder schließen.');
    }
  }

  function secureCurrentState() {
    requireClosedEditor();
    if (!storage.hasLocalDraft() && !runtime.hasPendingSave()) return;
    if (!window.backupSave?.('Vor Laden der aktuellen Karte')) {
      throw new Error('Dein Entwurf konnte nicht gesichert werden. Die Karte bleibt unverändert.');
    }
  }

  button.addEventListener('click', async () => {
    if (loading || !storage.isReady()) return;
    try {
      requireClosedEditor();
      loading = true;
      render();
      await storage.preparePublishedReload(secureCurrentState);
      runtime.cancelPendingSave();
      window.location.reload();
    } catch (error) {
      runtime.toast(error.message || 'Die aktuelle Karte konnte nicht geladen werden.');
    } finally {
      loading = false;
      render();
    }
  });

  window.addEventListener('aleria:karto:draft-status', render);
  render();
})();
