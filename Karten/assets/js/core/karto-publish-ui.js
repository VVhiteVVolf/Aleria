// UI glue for the "🌐 Online speichern" modal (#publish-mo in karte.html).
// Talks only to window.KartoPublish (karto-storage.js) and
// window.KartoRuntime - no direct GitHub/network code lives here.
(function () {
  function openPublishModal() {
    const mo = document.getElementById('publish-mo');
    mo.classList.add('open');
    document.getElementById('publish-map-title').textContent = window.KartoRuntime?.state()?.regionTitle || '';
    document.getElementById('publish-result').style.display = 'none';
    document.getElementById('publish-confirm-btn').focus();
  }

  async function publishOnline() {
    const button = document.getElementById('publish-confirm-btn');
    const resultEl = document.getElementById('publish-result');
    button.disabled = true;
    button.textContent = 'Speichere …';
    resultEl.style.display = 'none';
    try {
      await window.KartoRuntime?.flushSave?.();
      const result = await window.KartoPublish.publish(window.KartoRuntime.state());
      resultEl.style.color = '#3a7a3a';
      resultEl.innerHTML = `✓ Online gespeichert (Revision ${result.revision}). <a href="${result.commitUrl}" target="_blank" rel="noopener">Commit ansehen</a>`;
      resultEl.style.display = 'block';
      window.KartoRuntime?.toast?.('✓ Karte online gespeichert');
    } catch (error) {
      resultEl.style.color = 'var(--red)';
      if (error.status === 409) {
        resultEl.textContent = '⚠ Eine neuere Fassung ist verfügbar. Schließe diesen Dialog und nutze „Aktuelle Karte laden“. Dein Entwurf wird dabei im Backup-Verlauf gesichert.';
      } else {
        resultEl.textContent = `✕ ${error.message}`;
      }
      resultEl.style.display = 'block';
    } finally {
      button.disabled = false;
      button.textContent = '🌐 Jetzt veröffentlichen';
    }
  }

  window.openPublishModal = openPublishModal;
  window.publishOnline = publishOnline;
})();
