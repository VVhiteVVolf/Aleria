(function () {
  function setView(mode) {
    document.getElementById('tafel-publish-key-row').hidden = mode !== 'key';
    document.getElementById('tafel-publish-login').hidden = mode !== 'key';
    document.getElementById('tafel-publish-confirm-row').hidden = mode !== 'ready';
    document.getElementById('tafel-publish-confirm').hidden = mode !== 'ready';
  }
  function open() {
    document.getElementById('tafel-publish-title').textContent = window.TafelRuntime?.state()?.regionTitle || '';
    document.getElementById('tafel-publish-result').hidden = true;
    document.getElementById('tafel-publish-mo').classList.add('open');
    setView(window.TafelPublish?.hasSession() ? 'ready' : 'key');
  }
  async function login() {
    const input = document.getElementById('tafel-publish-key');
    const errorElement = document.getElementById('tafel-publish-key-error');
    errorElement.hidden = true;
    try {
      const info = await window.TafelPublish.authenticate(input.value);
      input.value = '';
      document.getElementById('tafel-publish-repository').textContent = `${info.repository} @ ${info.branch}`;
      setView('ready');
    } catch (error) {
      errorElement.textContent = error.message;
      errorElement.hidden = false;
    }
  }
  async function publish() {
    const button = document.getElementById('tafel-publish-confirm');
    const resultElement = document.getElementById('tafel-publish-result');
    button.disabled = true;
    resultElement.hidden = true;
    try {
      const result = await window.TafelPublish.publish(window.TafelRuntime.state());
      resultElement.style.color = '#3a7a3a';
      resultElement.innerHTML = `Online gespeichert (Revision ${result.revision}). <a href="${result.commitUrl}" target="_blank" rel="noopener">Commit ansehen</a>`;
      resultElement.hidden = false;
      window.TafelRuntime.toast('Tafel online gespeichert');
    } catch (error) {
      resultElement.style.color = 'var(--red)';
      resultElement.textContent = error.status === 409 ? 'Konflikt: Auf GitHub liegt eine neuere Fassung.' : error.message;
      resultElement.hidden = false;
    } finally {
      button.disabled = false;
    }
  }
  window.TafelPublishUi = Object.freeze({ open, login, publish });
})();
