function getAleriaGptPanelRoot() {
  return document.getElementById('aleria-gpt-shell');
}

function getAleriaGptCurrentModuleScopeOption() {
  const entry = typeof getRenderableEntry === 'function' && currentEntry
    ? getRenderableEntry(currentEntry)
    : currentEntry;
  return entry?.id
    ? `<option value="current-module">Aktuelles Modul</option>`
    : '';
}

function renderAleriaGptPanelShell() {
  if (getAleriaGptPanelRoot()) return;

  const shell = document.createElement('aside');
  shell.id = 'aleria-gpt-shell';
  shell.className = 'aleria-gpt-shell';
  shell.innerHTML = `
    <button class="aleria-gpt-rail" type="button" data-aleria-gpt-action="toggle-panel" aria-expanded="false" aria-controls="aleria-gpt-panel">
      <span>AleriaGPT</span>
    </button>
    <section class="aleria-gpt-panel" id="aleria-gpt-panel" aria-label="AleriaGPT">
      <header class="aleria-gpt-head">
        <div>
          <div class="aleria-gpt-kicker">Gespraech & Analyse</div>
          <h2>AleriaGPT</h2>
        </div>
        <button class="aleria-gpt-icon-btn" type="button" data-aleria-gpt-action="close-panel" aria-label="AleriaGPT schliessen">x</button>
      </header>
      <div class="aleria-gpt-toolbar">
        <select class="aleria-gpt-scope" data-aleria-gpt-action="set-scope" aria-label="Kontextbereich">
          <option value="all">Gesamter Almanach</option>
          ${getAleriaGptCurrentModuleScopeOption()}
        </select>
        <button class="aleria-gpt-tool-btn" type="button" data-aleria-gpt-action="clear-chat">Leeren</button>
      </div>
      <div class="aleria-gpt-messages" id="aleria-gpt-messages" aria-live="polite"></div>
      <form class="aleria-gpt-form" data-aleria-gpt-action="submit-form">
        <textarea class="aleria-gpt-input" rows="3" placeholder="Schreib mit AleriaGPT..." aria-label="Frage an AleriaGPT"></textarea>
        <button class="aleria-gpt-send" type="submit">Senden</button>
      </form>
    </section>`;
  document.body.appendChild(shell);
  renderAleriaGptPanel();
}

function getAleriaGptSourceLabel(source) {
  const parts = [];
  if (source.moduleTitle) parts.push(source.moduleTitle);
  if (source.pageTitle) parts.push(source.pageTitle);
  if (source.speakerName) parts.push(source.speakerName);
  return parts.join(' | ') || source.sourceRef || source.sourceType || 'Quelle';
}

function renderAleriaGptSources(sources = []) {
  if (!sources.length) return '';
  const visibleSources = sources.slice(0, 6);
  return `
    <details class="aleria-gpt-sources">
      <summary>Quellen anzeigen (${visibleSources.length})</summary>
      <div class="aleria-gpt-source-list">
        ${visibleSources.map(source => `
          <article class="aleria-gpt-source">
            <div class="aleria-gpt-source-top">
              <span>${escapeHtml(source.sourceType || 'Quelle')}</span>
              <strong>${Number(source.score || 0).toFixed(0)}</strong>
            </div>
            <div class="aleria-gpt-source-title">${escapeHtml(getAleriaGptSourceLabel(source))}</div>
            <p>${escapeHtml(source.text || '')}</p>
            <code>${escapeHtml(source.sourceRef || '')}</code>
          </article>
        `).join('')}
      </div>
    </details>`;
}

function renderAleriaGptMessages(messages) {
  const box = document.getElementById('aleria-gpt-messages');
  if (!box) return;
  const content = messages.length
    ? messages.map(message => `
        <article class="aleria-gpt-message ${message.role === 'user' ? 'user' : 'assistant'}">
          <div class="aleria-gpt-message-role">${message.role === 'user' ? 'Du' : 'AleriaGPT'}</div>
          <div class="aleria-gpt-message-text">${escapeHtml(message.text || '')}</div>
          ${message.role === 'assistant' ? renderAleriaGptSources(message.sources || []) : ''}
        </article>
      `).join('')
    : `<article class="aleria-gpt-message assistant">
        <div class="aleria-gpt-message-role">AleriaGPT</div>
        <div class="aleria-gpt-message-text">Bereit. Du kannst normal schreiben oder gezielt nach Figuren, Modulen und Kommentaren fragen.</div>
      </article>`;
  box.innerHTML = content;
  box.scrollTop = box.scrollHeight;
}

function renderAleriaGptPanel() {
  const shell = getAleriaGptPanelRoot();
  if (!shell) return;
  const state = getAleriaGptPanelState();
  shell.classList.toggle('open', state.open);
  shell.classList.toggle('busy', state.busy);
  shell.querySelector('.aleria-gpt-rail')?.setAttribute('aria-expanded', state.open ? 'true' : 'false');
  const scope = shell.querySelector('.aleria-gpt-scope');
  if (scope && scope.value !== state.scope) scope.value = state.scope;
  const send = shell.querySelector('.aleria-gpt-send');
  if (send) {
    send.disabled = state.busy;
    send.textContent = state.busy ? 'Denkt...' : 'Senden';
  }
  renderAleriaGptMessages(state.messages);
}

function refreshAleriaGptPanelScopeOptions() {
  const shell = getAleriaGptPanelRoot();
  const select = shell?.querySelector?.('.aleria-gpt-scope');
  if (!select) return;
  const state = getAleriaGptPanelState();
  const current = select.value || state.scope;
  const hasCurrentModule = !!getAleriaGptCurrentModuleScopeOption();
  select.innerHTML = `
    <option value="all">Gesamter Almanach</option>
    ${getAleriaGptCurrentModuleScopeOption()}`;
  const preferred = hasCurrentModule && current === 'all' && !state.messages.length ? 'current-module' : current;
  select.value = Array.from(select.options).some(option => option.value === preferred)
    ? preferred
    : (hasCurrentModule ? 'current-module' : 'all');
  setAleriaGptPanelScope(select.value);
}

document.addEventListener('DOMContentLoaded', renderAleriaGptPanelShell);
