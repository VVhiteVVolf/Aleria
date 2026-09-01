// UI glue for the "🌐 Online speichern" modal (#publish-mo in karte.html).
// Talks only to window.KartoPublish (karto-storage.js) and
// window.KartoRuntime - no direct GitHub/network code lives here.
(function () {
  function openPublishModal() {
    const mo = document.getElementById('publish-mo');
    mo.classList.add('open');
    document.getElementById('publish-map-title').textContent = window.KartoRuntime?.state()?.regionTitle || '';
    document.getElementById('publish-result').style.display = 'none';
    setView(window.KartoPublish?.hasSession() ? 'ready' : 'need-key');
    if (!window.KartoPublish?.hasSession()) {
      setTimeout(() => document.getElementById('publish-key-inp')?.focus(), 60);
    }
  }

  function setView(mode) {
    document.getElementById('publish-key-row').style.display = mode === 'need-key' ? 'block' : 'none';
    document.getElementById('publish-key-submit-btn').style.display = mode === 'need-key' ? 'inline-block' : 'none';
    document.getElementById('publish-confirm-row').style.display = mode === 'ready' ? 'block' : 'none';
    document.getElementById('publish-confirm-btn').style.display = mode === 'ready' ? 'inline-block' : 'none';
  }

  async function submitPublishKey() {
    const input = document.getElementById('publish-key-inp');
    const errorEl = document.getElementById('publish-key-err');
    errorEl.style.display = 'none';
    try {
      const info = await window.KartoPublish.authenticate(input.value);
      input.value = '';
      document.getElementById('publish-repo-info').textContent = `${info.repository} @ ${info.branch}`;
      setView('ready');
    } catch (error) {
      errorEl.textContent = error.message;
      errorEl.style.display = 'block';
    }
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
        resultEl.textContent = '⚠ Konflikt: Auf GitHub liegt bereits eine neuere Fassung. Seite neu laden und Änderungen erneut anwenden.';
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
  window.submitPublishKey = submitPublishKey;
  window.publishOnline = publishOnline;
})();
