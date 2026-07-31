// Scene dice dialog. Physical execution and persistence live in the ES-module service.
let _sceneDicePendingRoll = null;
let _sceneDiceLastNotation = '1d20';
let _sceneDiceSelectedSides = 20;
let _sceneDiceMode = 'normal';

function getSceneDiceService() {
  if (!window.AleriaSceneDice) throw new Error('Das Würfelsystem wird noch geladen. Bitte versuche es gleich erneut.');
  return window.AleriaSceneDice;
}

function buildSceneDiceControl(threadId = '') {
  return `
    <button class="scene-dice-toggle" type="button" data-scene-dice-action="open" data-comment-thread-id="${escapeHtml(threadId)}" aria-label="3D-Würfel öffnen" title="Würfel">
      <img src="${escapeHtml(getSceneDiceIcon(20))}" alt="" decoding="async">
    </button>`;
}

function buildSceneDiceTypeButtons() {
  return [4, 6, 8, 10, 12, 20, 100].map(sides => `
    <button class="scene-dice-type${sides === 20 ? ' selected' : ''}" type="button" data-scene-dice-action="choose-die" data-die-sides="${sides}" aria-label="W${sides} würfeln" aria-pressed="${sides === 20}">
      <img src="${escapeHtml(getSceneDiceIcon(sides))}" alt="" loading="lazy" decoding="async">
      <span>W${sides}</span>
    </button>`).join('');
}

function ensureSceneDiceDialog() {
  let overlay = document.getElementById('scene-dice-overlay');
  if (overlay) return overlay;
  overlay = document.createElement('div');
  overlay.id = 'scene-dice-overlay';
  overlay.className = 'scene-dice-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-hidden', 'true');
  overlay.setAttribute('aria-labelledby', 'scene-dice-title');
  overlay.setAttribute('tabindex', '-1');
  overlay.innerHTML = `
    <div class="scene-dice-card">
      <header class="scene-dice-head">
        <div><span>Schicksalswurf</span><h2 id="scene-dice-title">Würfel der Szene</h2></div>
        <button type="button" data-scene-dice-action="close" aria-label="Würfelfenster schließen">×</button>
      </header>
      <div class="scene-dice-body">
        <main class="scene-dice-workspace">
          <section class="scene-dice-stage-panel" aria-label="3D-Würfelanimation">
            <div id="scene-dice-stage" class="scene-dice-stage"></div>
            <div class="scene-dice-stage-status" data-scene-dice-stage-status data-state="idle">Bereit für deinen Wurf.</div>
            <div class="scene-dice-engine-note" data-scene-dice-engine-note hidden></div>
          </section>
          <section class="scene-dice-result" data-scene-dice-result data-state="idle" aria-live="polite">
            <div class="scene-dice-result-idle">Die Würfel warten auf deine Hand.</div>
          </section>
        </main>
        <aside class="scene-dice-controls" aria-label="Würfelsteuerung">
          <section class="scene-dice-panel">
            <div class="scene-dice-section-head"><span>Schnellwahl</span><small>Tippen würfelt sofort</small></div>
            <div class="scene-dice-types">${buildSceneDiceTypeButtons()}</div>
            <div class="scene-dice-number-row">
              <label><span>Anzahl</span><input id="scene-dice-count" type="number" min="1" max="50" value="1" inputmode="numeric"></label>
              <label><span>Modifikator</span><input id="scene-dice-modifier" type="number" min="-9999" max="9999" value="0" inputmode="numeric"></label>
            </div>
            <div class="scene-dice-mode-group" role="group" aria-label="W20-Modus">
              <button type="button" data-scene-dice-action="set-mode" data-dice-mode="normal" aria-pressed="true">Normal</button>
              <button type="button" data-scene-dice-action="set-mode" data-dice-mode="advantage" aria-pressed="false">Vorteil</button>
              <button type="button" data-scene-dice-action="set-mode" data-dice-mode="disadvantage" aria-pressed="false">Nachteil</button>
            </div>
          </section>
          <section class="scene-dice-panel">
            <label class="scene-dice-formula-label" for="scene-dice-formula"><span>Würfelnotation</span></label>
            <div class="scene-dice-formula-input">
              <input id="scene-dice-formula" type="text" value="1d20" maxlength="100" placeholder="z. B. 2d20kh1+5" spellcheck="false" autocomplete="off" aria-describedby="scene-dice-help">
              <button class="primary" type="button" data-scene-dice-action="roll" aria-label="Würfelformel ausführen">Würfeln</button>
            </div>
            <p class="scene-dice-help" id="scene-dice-help">Unterstützt u. a. 4d6dl1, 2d12r1, 6d6! und mehrere Würfelgruppen.</p>
            <div class="scene-dice-secondary-actions">
              <button type="button" data-scene-dice-action="repeat" aria-label="Letzten Wurf wiederholen">Erneut</button>
              <button type="button" data-scene-dice-action="clear" aria-label="Würfel und Ergebnis leeren">Leeren</button>
            </div>
          </section>
          <details class="scene-dice-panel scene-dice-context-panel">
            <summary>Szeneneintrag</summary>
            <div class="scene-dice-context">
              <label><span>Wer würfelt?</span><input id="scene-dice-roller" type="text" maxlength="80" placeholder="Figur oder Erzähler"></label>
              <label><span>Anlass</span><input id="scene-dice-purpose" type="text" maxlength="140" placeholder="z. B. Wahrnehmung"></label>
              <label><span>Wurfart</span><select id="scene-dice-roll-type"><option value="general">Allgemein</option><option value="attack">Angriff</option><option value="death-save">Todesrettungswurf</option></select></label>
            </div>
          </details>
          <details class="scene-dice-panel scene-dice-settings-panel">
            <summary>Einstellungen</summary>
            <label class="scene-dice-check"><input id="scene-dice-animation-enabled" type="checkbox" checked><span>3D-Animation verwenden</span></label>
            <label class="scene-dice-check"><input id="scene-dice-sound-enabled" type="checkbox"><span>Ergebniston abspielen</span></label>
          </details>
        </aside>
        <aside class="scene-dice-history" aria-labelledby="scene-dice-history-title">
          <div class="scene-dice-history-head"><h3 id="scene-dice-history-title">Verlauf</h3><button type="button" data-scene-dice-action="clear-history">Alle löschen</button></div>
          <div class="scene-dice-history-list" data-scene-dice-history-list></div>
        </aside>
      </div>
      <footer class="scene-dice-foot">
        <div class="scene-dice-status" data-scene-dice-status role="status" aria-live="assertive"></div>
        <button class="primary" type="button" data-scene-dice-action="commit" disabled>In Szene eintragen</button>
      </footer>
    </div>`;
  document.body.appendChild(overlay);
  return overlay;
}

function setSceneDiceStatus(message = '', type = 'info') {
  const target = document.querySelector('[data-scene-dice-status]');
  if (!target) return;
  target.dataset.status = type;
  target.textContent = String(message || '');
}

function setSceneDiceStageStatus(message = '', state = 'idle') {
  const target = document.querySelector('[data-scene-dice-stage-status]');
  if (!target) return;
  target.dataset.state = state;
  target.textContent = String(message || '');
}

function setSceneDiceEngineNote(message = '') {
  const target = document.querySelector('[data-scene-dice-engine-note]');
  if (!target) return;
  target.hidden = !message;
  target.textContent = String(message || '');
}

function setSceneDiceBusy(busy) {
  document.querySelectorAll('[data-scene-dice-action="roll"], [data-scene-dice-action="choose-die"], [data-scene-dice-action="repeat"], [data-scene-dice-action="clear"]')
    .forEach(button => { button.disabled = !!busy; });
  const overlay = document.getElementById('scene-dice-overlay');
  if (overlay) overlay.setAttribute('aria-busy', String(!!busy));
}

function getSceneDiceModeLabel(mode) {
  return mode === 'advantage' ? 'Vorteil' : mode === 'disadvantage' ? 'Nachteil' : 'Normal';
}

function renderSceneDiceRollDetails(roll) {
  return (roll.terms || []).map(term => {
    if (term.kind === 'modifier') return `<span class="scene-dice-modifier">${term.value >= 0 ? '+' : ''}${escapeHtml(term.value)}</span>`;
    const rolls = (term.rolls || []).map(item => `<span class="${item.kept ? 'kept' : 'discarded'}" title="${item.kept ? 'Behalten' : escapeHtml(item.reason || 'Verworfen')}">${escapeHtml(item.value)}</span>`).join('');
    return `<span class="scene-dice-term"><img src="${escapeHtml(getSceneDiceIcon(term.sides))}" alt="W${escapeHtml(term.sides)}"><span>${term.sign < 0 ? '−' : ''}${escapeHtml(term.count)}W${escapeHtml(term.sides)}</span><span class="scene-dice-values">${rolls}</span></span>`;
  }).join('');
}

function renderSceneDicePendingRoll(roll) {
  const target = document.querySelector('[data-scene-dice-result]');
  if (!target) return;
  target.dataset.state = roll.critical || 'ready';
  const kept = (roll.keptDice || []).join(', ') || '—';
  const dropped = (roll.droppedDice || []).join(', ');
  target.innerHTML = `
    <div class="scene-dice-result-summary">
      <div class="scene-dice-result-kicker">${escapeHtml(getSceneDiceModeLabel(roll.mode))} · ${escapeHtml(roll.formula)}</div>
      <div class="scene-dice-total">${escapeHtml(roll.total)}</div>
      ${roll.special ? `<div class="scene-dice-critical">${escapeHtml(roll.special)}</div>` : ''}
    </div>
    <div class="scene-dice-result-data">
      <span><small>Behalten</small><strong>${escapeHtml(kept)}</strong></span>
      ${dropped ? `<span><small>Verworfen</small><strong>${escapeHtml(dropped)}</strong></span>` : ''}
      <span><small>Modifikator</small><strong>${roll.modifier >= 0 ? '+' : ''}${escapeHtml(roll.modifier)}</strong></span>
    </div>
    <div class="scene-dice-breakdown">${renderSceneDiceRollDetails(roll)}</div>`;
  setSceneDiceEngineNote(roll.animationWarning || '');
}

function renderSceneDiceHistory() {
  const target = document.querySelector('[data-scene-dice-history-list]');
  if (!target) return;
  let entries = [];
  try { entries = getSceneDiceService().getHistory(); } catch { /* module still loading */ }
  if (!entries.length) {
    target.innerHTML = '<p class="scene-dice-history-empty">Noch keine Würfe gespeichert.</p>';
    return;
  }
  target.innerHTML = entries.map(entry => {
    const time = new Date(entry.timestamp).toLocaleString('de-DE', { dateStyle: 'short', timeStyle: 'short' });
    return `<article class="scene-dice-history-entry" data-history-id="${escapeHtml(entry.id)}">
      <button class="scene-dice-history-reroll" type="button" data-scene-dice-action="reroll-history" data-history-id="${escapeHtml(entry.id)}" data-notation="${escapeHtml(entry.notation)}" aria-label="${escapeHtml(entry.notation)} erneut würfeln">
        <span><strong>${escapeHtml(entry.notation)}</strong><small>${escapeHtml(time)}</small></span><b>${escapeHtml(entry.total)}</b>
      </button>
      <button class="scene-dice-history-delete" type="button" data-scene-dice-action="delete-history" data-history-id="${escapeHtml(entry.id)}" aria-label="Wurf aus Verlauf löschen">×</button>
    </article>`;
  }).join('');
}

function updateSceneDiceModeButtons() {
  document.querySelectorAll('[data-scene-dice-action="set-mode"]').forEach(button => {
    const active = button.dataset.diceMode === _sceneDiceMode;
    button.classList.toggle('selected', active);
    button.setAttribute('aria-pressed', String(active));
  });
}

function updateSceneDiceTypeButtons() {
  document.querySelectorAll('[data-scene-dice-action="choose-die"]').forEach(button => {
    const active = Number(button.dataset.dieSides) === _sceneDiceSelectedSides;
    button.classList.toggle('selected', active);
    button.setAttribute('aria-pressed', String(active));
  });
}

function buildSceneDiceFormulaFromControls() {
  const count = Math.max(1, Math.min(50, Number(document.getElementById('scene-dice-count')?.value) || 1));
  const modifier = Math.max(-9999, Math.min(9999, Number(document.getElementById('scene-dice-modifier')?.value) || 0));
  let formula = `${count}d${_sceneDiceSelectedSides}`;
  if (_sceneDiceMode === 'advantage') formula = '2d20kh1';
  if (_sceneDiceMode === 'disadvantage') formula = '2d20kl1';
  if (modifier) formula += modifier > 0 ? `+${modifier}` : String(modifier);
  const input = document.getElementById('scene-dice-formula');
  if (input) input.value = formula;
  return formula;
}

function syncSceneDiceSettings() {
  try {
    const settings = getSceneDiceService().getSettings();
    const animation = document.getElementById('scene-dice-animation-enabled');
    const sound = document.getElementById('scene-dice-sound-enabled');
    if (animation) animation.checked = settings.animationEnabled;
    if (sound) sound.checked = settings.soundEnabled;
  } catch { /* module still loading */ }
}

function resetSceneDiceDialog() {
  _sceneDicePendingRoll = null;
  let history = [];
  try { history = getSceneDiceService().getHistory(); } catch { /* module still loading */ }
  _sceneDiceLastNotation = history[0]?.notation || _sceneDiceLastNotation || '1d20';
  const formula = document.getElementById('scene-dice-formula');
  const roller = document.getElementById('scene-dice-roller');
  const purpose = document.getElementById('scene-dice-purpose');
  if (formula) formula.value = _sceneDiceLastNotation;
  if (roller) roller.value = localStorage.getItem('aleria-scene-dice-roller-v1') || '';
  if (purpose) purpose.value = '';
  const result = document.querySelector('[data-scene-dice-result]');
  if (result) {
    result.dataset.state = 'idle';
    result.innerHTML = '<div class="scene-dice-result-idle">Die Würfel warten auf deine Hand.</div>';
  }
  const commit = document.querySelector('[data-scene-dice-action="commit"]');
  if (commit) commit.disabled = true;
  setSceneDiceStatus('');
  setSceneDiceEngineNote('');
  setSceneDiceStageStatus('3D-Würfel werden vorbereitet …', 'loading');
  syncSceneDiceSettings();
  renderSceneDiceHistory();
  updateSceneDiceModeButtons();
  updateSceneDiceTypeButtons();
}
