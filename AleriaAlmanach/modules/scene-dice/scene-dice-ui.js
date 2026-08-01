// Scene dice dialog. Physical execution and persistence live in the ES-module service.
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

function getSceneDiceTypes() {
  try { return getSceneDiceService().getDiceTypes(); } catch {
    return Array.from(SCENE_DICE_ALLOWED_SIDES).map(sides => ({ sides, color: '#8b6914', label: `W${sides}` }));
  }
}

function getSceneDicePoolCounts() {
  try { return new Map(getSceneDiceService().getPool().map(entry => [entry.sides, entry.count])); } catch { return new Map([[20, 1]]); }
}

function buildSceneDiceTypeButtons() {
  const counts = getSceneDicePoolCounts();
  return getSceneDiceTypes().map(type => {
    const count = counts.get(type.sides) || 0;
    return `
      <button class="scene-dice-type${count ? ' selected' : ''}" style="--dice-color:${escapeHtml(type.color)}" type="button" data-scene-dice-action="add-die" data-die-sides="${type.sides}" aria-label="W${type.sides} zum Würfelpool hinzufügen">
        <span class="scene-dice-type-icon"><img src="${escapeHtml(getSceneDiceIcon(type.sides))}" alt="" loading="lazy" decoding="async"></span>
        <span>W${type.sides}</span>
        <b data-dice-count="${type.sides}"${count ? '' : ' hidden'}>${count}</b>
      </button>`;
  }).join('');
}

function getSceneDiceNarrationModes() {
  return window.AleriaSceneDiceNarration?.getModes?.() || [
    { id: 'immersive', label: 'Immersiv', description: 'AleriaGPT erzählt die unmittelbare Folge als Teil der Szene.', usesAi: true },
    { id: 'character', label: 'Charakterfokus', description: 'Die bekannte Persönlichkeit erhält mehr Gewicht.', usesAi: true },
    { id: 'dramatic', label: 'Dramatisch', description: 'Atmosphäre und sichtbare Konsequenzen werden verdichtet.', usesAi: true },
    { id: 'simple', label: 'Einfach würfeln', description: 'Keine KI und kein Erzähltext: Es wird ausschließlich das Würfelergebnis angezeigt.', usesAi: false },
    { id: 'standard', label: 'Standard', description: 'Nur Name und gewürfelter Wert, ohne KI-Deutung.', usesAi: false }
  ];
}

function buildSceneDiceNarrationModeOptions() {
  return getSceneDiceNarrationModes()
    .map(mode => `<option value="${escapeHtml(mode.id)}">${escapeHtml(mode.label)}</option>`)
    .join('');
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
        <div class="scene-dice-title-block"><span>Schicksalswerkstatt</span><h2 id="scene-dice-title">Würfel der Szene</h2><small>Pool bauen, werfen und als Szenenereignis festhalten</small></div>
        <div class="scene-dice-head-state"><i aria-hidden="true"></i><span data-scene-dice-head-state>Bereit</span></div>
        <button class="scene-dice-close" type="button" data-scene-dice-action="close" aria-label="Würfelfenster schließen">×</button>
      </header>
      <div class="scene-dice-body">
        <main class="scene-dice-workspace">
          <div class="scene-dice-board-shell">
            <span class="scene-dice-frame-rail is-top" aria-hidden="true"></span>
            <span class="scene-dice-frame-rail is-right" aria-hidden="true"></span>
            <span class="scene-dice-frame-rail is-bottom" aria-hidden="true"></span>
            <span class="scene-dice-frame-rail is-left" aria-hidden="true"></span>
            <span class="scene-dice-frame-corner is-top-left" aria-hidden="true"><i></i></span>
            <span class="scene-dice-frame-corner is-top-right" aria-hidden="true"><i></i></span>
            <span class="scene-dice-frame-corner is-bottom-right" aria-hidden="true"><i></i></span>
            <span class="scene-dice-frame-corner is-bottom-left" aria-hidden="true"><i></i></span>
            <section class="scene-dice-board" aria-label="3D-Würfelbrett">
              <div id="scene-dice-stage" class="scene-dice-stage"></div>
              <div class="scene-dice-board-shade" aria-hidden="true"></div>
              <div class="scene-dice-stage-status" data-scene-dice-stage-status data-state="idle">Bereit für deinen Wurf.</div>
              <div class="scene-dice-engine-note" data-scene-dice-engine-note hidden></div>
            </section>
          </div>
        </main>
        <aside class="scene-dice-controls" aria-label="Würfelsteuerung">
          <section class="scene-dice-panel scene-dice-context-panel">
            <div class="scene-dice-section-head"><div><span>1 · Szenenangaben</span><small>Figur, Probe und erzählerischer Kontext</small></div></div>
            <div class="scene-dice-context">
              <div class="scene-dice-roller-field">
                <span>Wer handelt?</span>
                <input id="scene-dice-roller" type="hidden" value="">
                <button class="scene-dice-roller-trigger" type="button" data-scene-dice-action="toggle-roller" data-scene-dice-roller-trigger aria-expanded="false">
                  <span class="scene-dice-roller-avatar placeholder" aria-hidden="true">?</span><span><strong>Figur wird geladen …</strong><small>Aktive Szene wird ausgewertet</small></span><i aria-hidden="true">⌄</i>
                </button>
                <div class="scene-dice-participant-picker" data-scene-dice-participant-picker hidden>
                  <label class="scene-dice-participant-search"><span>Figur suchen</span><input type="search" data-scene-dice-participant-search placeholder="Name oder Alias" autocomplete="off"></label>
                  <div class="scene-dice-participant-list" data-scene-dice-participant-list><p class="scene-dice-participant-empty">Aktive Szene wird gelesen …</p></div>
                </div>
              </div>
              <label><span>Probe</span><input id="scene-dice-purpose" type="text" maxlength="140" placeholder="z. B. Wahrnehmung"></label>
              <label><span>Regelart</span><select id="scene-dice-roll-type"><option value="general">Allgemein</option><option value="attack">Angriff</option><option value="death-save">Todesrettungswurf</option></select></label>
              <div class="scene-dice-narration-config">
                <label><span>Wurfart</span><select id="scene-dice-narration-mode">${buildSceneDiceNarrationModeOptions()}</select><small data-scene-dice-narration-mode-description></small></label>
                <label class="scene-dice-check scene-dice-humor-check"><input id="scene-dice-humor-enabled" type="checkbox" checked><span>Lockeren Humor bei Patzern erlauben</span></label>
              </div>
              <label class="scene-dice-situation-field"><span>Situationskontext für AleriaGPT</span><textarea id="scene-dice-situation" rows="2" maxlength="900" placeholder="z. B. Anaraut begutachtet die gefundene Tatwaffe und sucht nach ungewöhnlichen Spuren."></textarea><small>Weshalb wird gewürfelt und worauf soll das Ergebnis angewendet werden?</small></label>
              <label class="scene-dice-manual-narration-field"><span>Eigene Beschreibung (optional)</span><textarea id="scene-dice-manual-narration" rows="2" maxlength="700" placeholder="Überschreibt die automatische Auswertung für diesen Wurf."></textarea><small>Wenn dieses Feld Text enthält, wird er unverändert als Erzählerbeschreibung verwendet.</small></label>
            </div>
          </section>

          <section class="scene-dice-panel scene-dice-pool-panel">
            <div class="scene-dice-section-head"><div><span>2 · Würfelpool</span><small>Antippen fügt einen Würfel hinzu</small></div><button type="button" data-scene-dice-action="reset-pool">Zurücksetzen</button></div>
            <div class="scene-dice-types">${buildSceneDiceTypeButtons()}</div>
            <div class="scene-dice-pool" data-scene-dice-pool></div>
            <div class="scene-dice-mode-row">
              <span>W20-Modus</span>
              <div class="scene-dice-mode-group" role="group" aria-label="W20-Modus">
                <button type="button" data-scene-dice-action="set-mode" data-dice-mode="normal" aria-pressed="true">Normal</button>
                <button type="button" data-scene-dice-action="set-mode" data-dice-mode="advantage" aria-pressed="false">Vorteil</button>
                <button type="button" data-scene-dice-action="set-mode" data-dice-mode="disadvantage" aria-pressed="false">Nachteil</button>
              </div>
            </div>
            <label class="scene-dice-modifier-field" for="scene-dice-modifier"><span>Gesamtmodifikator</span><input id="scene-dice-modifier" type="number" min="-9999" max="9999" value="0" inputmode="numeric"></label>
            <label class="scene-dice-formula-label" for="scene-dice-formula"><span>Würfelformel</span><small>Direkt editierbar</small></label>
            <div class="scene-dice-formula-input">
              <input id="scene-dice-formula" type="text" value="1d20" maxlength="100" placeholder="z. B. 1d20+2d6+4" spellcheck="false" autocomplete="off" aria-describedby="scene-dice-help">
              <button class="primary" type="button" data-scene-dice-action="roll" aria-label="Würfelformel ausführen"><span aria-hidden="true">◆</span> Würfeln</button>
            </div>
            <p class="scene-dice-help" id="scene-dice-help">Mehrere Würfelarten werden gemeinsam geworfen. Erweitert: 4d6dl1, 2d12r1 oder 6d6!.</p>
            <div class="scene-dice-secondary-actions">
              <button type="button" data-scene-dice-action="repeat">Letzten wiederholen</button>
              <button type="button" data-scene-dice-action="clear">Brett leeren</button>
            </div>
          </section>

          <section class="scene-dice-panel scene-dice-result-panel">
            <div class="scene-dice-section-head"><div><span>3 · Auswertung</span><small>Ergebnis und erzählerische Folge</small></div></div>
            <div class="scene-dice-result" data-scene-dice-result data-state="idle" aria-live="polite">
              <div class="scene-dice-result-idle"><strong>Noch kein Schicksal geworfen</strong><span>Lege Szenenangaben und Würfelpool fest.</span></div>
            </div>
          </section>

          <details class="scene-dice-panel scene-dice-settings-panel">
            <summary><span>Einstellungen</span><small>Darstellung und Wurfgefühl</small></summary>
            <div class="scene-dice-settings-grid">
              <label><span>Wurfstärke</span><select id="scene-dice-throw-style"><option value="gentle">Ruhig</option><option value="balanced">Ausgewogen</option><option value="dramatic">Dramatisch</option></select></label>
              <label class="scene-dice-check"><input id="scene-dice-animation-enabled" type="checkbox" checked><span>3D-Animation verwenden</span></label>
              <label class="scene-dice-check"><input id="scene-dice-sound-enabled" type="checkbox"><span>Ergebniston abspielen</span></label>
              <label class="scene-dice-check"><input id="scene-dice-reduced-motion" type="checkbox"><span>Bewegung reduzieren</span></label>
              <label class="scene-dice-check"><input id="scene-dice-keep-pool" type="checkbox" checked><span>Pool nach dem Wurf behalten</span></label>
            </div>
          </details>

          <details class="scene-dice-panel scene-dice-history" open>
            <summary><span>Verlauf</span><button type="button" data-scene-dice-action="clear-history">Alle löschen</button></summary>
            <div class="scene-dice-history-list" data-scene-dice-history-list></div>
          </details>
        </aside>
      </div>
      <footer class="scene-dice-foot">
        <div class="scene-dice-status" data-scene-dice-status role="status" aria-live="assertive"></div>
        <button class="primary" type="button" data-scene-dice-action="commit" disabled>Wurf in Szene eintragen</button>
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
  if (target) {
    target.dataset.state = state;
    target.textContent = String(message || '');
  }
  const headState = document.querySelector('[data-scene-dice-head-state]');
  if (headState) {
    const headStateContainer = headState.closest('.scene-dice-head-state');
    if (headStateContainer) headStateContainer.dataset.state = state;
    headState.textContent = state === 'rolling' ? 'Würfelt' : state === 'fallback' ? 'Textmodus' : state === 'error' ? 'Fehler' : 'Bereit';
  }
}

function setSceneDiceEngineNote(message = '') {
  const target = document.querySelector('[data-scene-dice-engine-note]');
  if (!target) return;
  target.hidden = !message;
  target.textContent = String(message || '');
}

function setSceneDiceBusy(busy) {
  document.querySelectorAll('[data-scene-dice-action="roll"], [data-scene-dice-action="add-die"], [data-scene-dice-action="remove-die"], [data-scene-dice-action="repeat"], [data-scene-dice-action="clear"]')
    .forEach(button => { button.disabled = !!busy; });
  const overlay = document.getElementById('scene-dice-overlay');
  if (overlay) overlay.setAttribute('aria-busy', String(!!busy));
}

function getSceneDiceModeLabel(mode) {
  return mode === 'advantage' ? 'Vorteil' : mode === 'disadvantage' ? 'Nachteil' : 'Normal';
}

function getSceneDiceNarrationModeLabel(mode) {
  return getSceneDiceNarrationModes().find(entry => entry.id === mode)?.label || 'Immersiv';
}

function syncSceneDiceNarrationModeUi() {
  const select = document.getElementById('scene-dice-narration-mode');
  const selected = getSceneDiceNarrationModes().find(mode => mode.id === select?.value) || getSceneDiceNarrationModes()[0];
  const description = document.querySelector('[data-scene-dice-narration-mode-description]');
  if (description) description.textContent = selected?.description || '';
  const humor = document.getElementById('scene-dice-humor-enabled');
  if (humor) humor.disabled = selected?.usesAi === false;
}

function renderSceneDiceRollDetails(roll) {
  return (roll.terms || []).map(term => {
    if (term.kind === 'modifier') return `<span class="scene-dice-modifier">${term.value >= 0 ? '+' : ''}${escapeHtml(term.value)}</span>`;
    const rolls = (term.rolls || []).map(item => `<span class="${item.kept ? 'kept' : 'discarded'}" title="${item.kept ? 'Behalten' : escapeHtml(item.reason || 'Verworfen')}">${escapeHtml(item.value)}</span>`).join('');
    const appearance = getSceneDiceTypes().find(type => type.sides === term.sides);
    return `<span class="scene-dice-term" style="--dice-color:${escapeHtml(appearance?.color || '#8b6914')}"><img src="${escapeHtml(getSceneDiceIcon(term.sides))}" alt="W${escapeHtml(term.sides)}"><span>${term.sign < 0 ? '−' : ''}${escapeHtml(term.count)}W${escapeHtml(term.sides)}</span><span class="scene-dice-values">${rolls}</span></span>`;
  }).join('');
}

function renderSceneDiceNarrationPreview(roll) {
  const modeLabel = getSceneDiceNarrationModeLabel(roll.narrationMode);
  if (roll.narrationState === 'loading') {
    return `<div class="scene-dice-narration" data-state="loading"><span>AleriaGPT · ${escapeHtml(modeLabel)}</span><p>Szene, bisheriger Verlauf und Figurenkontext werden gelesen …</p></div>`;
  }
  if (roll.narrationState === 'error') {
    return `<div class="scene-dice-narration" data-state="error"><span>Erzähltext nicht verfügbar</span><p>${escapeHtml(roll.narrationError || 'AleriaGPT konnte den Wurf gerade nicht auswerten.')}</p><button type="button" data-scene-dice-action="retry-narration">Erneut versuchen</button></div>`;
  }
  if (roll.narrationSource === 'simple' && roll.narrationState === 'ready') {
    return '';
  }
  if (roll.narration) {
    const label = roll.narrationSource === 'manual'
      ? 'Eigene Beschreibung'
      : roll.narrationSource === 'standard'
        ? 'Standardausgabe'
        : `AleriaGPT · ${modeLabel}`;
    return `<div class="scene-dice-narration" data-state="ready"><span>${escapeHtml(label)}</span><p>${escapeHtml(roll.narration)}</p></div>`;
  }
  return '<div class="scene-dice-narration" data-state="idle"><span>Erzählerische Auswertung</span><p>Wird nach dem Wurf entsprechend der gewählten Wurfart erstellt.</p></div>';
}

function revealSceneDiceResult() {
  requestAnimationFrame(() => {
    document.querySelector('.scene-dice-result-panel')?.scrollIntoView({ block: 'start', inline: 'nearest' });
  });
}

function renderSceneDicePendingRoll(roll) {
  const target = document.querySelector('[data-scene-dice-result]');
  if (!target) return;
  target.dataset.state = roll.critical || 'ready';
  const kept = (roll.keptDice || []).join(', ') || '—';
  const dropped = (roll.droppedDice || []).join(', ');
  const primarySides = Number(roll.terms?.find(term => term.kind === 'dice')?.sides) || 20;
  const natural = Number(roll.natural);
  const rolledValue = Number.isFinite(natural) && natural > 0 ? natural : Number(roll.total) || 0;
  const resultBadge = Number.isFinite(natural) && natural > 0 ? `W${primarySides} · ${rolledValue}` : `Gesamt · ${rolledValue}`;
  target.innerHTML = `
    <div class="scene-dice-result-summary">
      <div class="scene-dice-result-kicker"><span><img src="${escapeHtml(getSceneDiceIcon(primarySides))}" alt="">Erzähler</span><strong>${escapeHtml(resultBadge)}</strong></div>
      <div class="scene-dice-total">${escapeHtml(roll.total)}</div>
      <div class="scene-dice-result-actor">${escapeHtml(roll.roller || 'Unbekannte Hand')} · ${escapeHtml(getSceneDiceNarrationModeLabel(roll.narrationMode))} · ${escapeHtml(getSceneDiceModeLabel(roll.mode))}</div>
      <div class="scene-dice-result-formula">${escapeHtml(roll.formula)}</div>
      ${roll.special ? `<div class="scene-dice-critical">${escapeHtml(roll.special)}</div>` : ''}
    </div>
    <div class="scene-dice-result-data">
      <span><small>Behalten</small><strong>${escapeHtml(kept)}</strong></span>
      ${dropped ? `<span><small>Verworfen</small><strong>${escapeHtml(dropped)}</strong></span>` : ''}
      <span><small>Modifikator</small><strong>${roll.modifier >= 0 ? '+' : ''}${escapeHtml(roll.modifier)}</strong></span>
      ${roll.purpose ? `<span><small>Anlass</small><strong>${escapeHtml(roll.purpose)}</strong></span>` : ''}
    </div>
    <div class="scene-dice-result-detail">
      <div class="scene-dice-breakdown">${renderSceneDiceRollDetails(roll)}</div>
      ${renderSceneDiceNarrationPreview(roll)}
    </div>`;
  setSceneDiceEngineNote(roll.animationWarning || '');
  revealSceneDiceResult();
}

function renderSceneDicePool() {
  const target = document.querySelector('[data-scene-dice-pool]');
  if (!target) return;
  const entries = getSceneDiceService().getPool();
  const types = getSceneDiceTypes();
  target.innerHTML = entries.length ? entries.map(entry => {
    const type = types.find(item => item.sides === entry.sides) || { color: '#8b6914', label: `W${entry.sides}` };
    return `<article class="scene-dice-pool-chip" style="--dice-color:${escapeHtml(type.color)}">
      <img src="${escapeHtml(getSceneDiceIcon(entry.sides))}" alt="" loading="lazy" decoding="async">
      <span><strong>${entry.count}W${entry.sides}</strong><small>${escapeHtml(type.label)}</small></span>
      <div><button type="button" data-scene-dice-action="remove-die" data-die-sides="${entry.sides}" aria-label="Einen W${entry.sides} entfernen">−</button><button type="button" data-scene-dice-action="add-die" data-die-sides="${entry.sides}" aria-label="Einen W${entry.sides} hinzufügen">+</button></div>
    </article>`;
  }).join('') : '<p class="scene-dice-pool-empty">Der Pool ist leer. Wähle oben mindestens einen Würfel.</p>';

  const counts = new Map(entries.map(entry => [entry.sides, entry.count]));
  document.querySelectorAll('.scene-dice-type').forEach(button => {
    const count = counts.get(Number(button.dataset.dieSides)) || 0;
    button.classList.toggle('selected', count > 0);
    const badge = button.querySelector('[data-dice-count]');
    if (badge) {
      badge.hidden = !count;
      badge.textContent = count;
    }
  });
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
        <span><strong>${escapeHtml(entry.roller || 'Unbekannte Hand')}</strong><small>${escapeHtml(entry.notation)}${entry.purpose ? ` · ${escapeHtml(entry.purpose)}` : ''}<br>${escapeHtml(time)}</small></span><b>${escapeHtml(entry.total)}</b>
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

function buildSceneDiceFormulaFromControls() {
  const modifier = Number(document.getElementById('scene-dice-modifier')?.value) || 0;
  const input = document.getElementById('scene-dice-formula');
  const rollButton = document.querySelector('[data-scene-dice-action="roll"]');
  try {
    const formula = getSceneDiceService().buildPoolNotation({ mode: _sceneDiceMode, modifier });
    if (input) input.value = formula;
    if (rollButton) rollButton.disabled = false;
    return formula;
  } catch {
    if (input) input.value = '';
    if (rollButton) rollButton.disabled = true;
    return '';
  }
}

function syncSceneDiceSettings() {
  try {
    const settings = getSceneDiceService().getSettings();
    const fields = {
      'scene-dice-animation-enabled': settings.animationEnabled,
      'scene-dice-sound-enabled': settings.soundEnabled,
      'scene-dice-reduced-motion': settings.reducedMotion,
      'scene-dice-keep-pool': settings.keepPool
    };
    Object.entries(fields).forEach(([id, value]) => {
      const input = document.getElementById(id);
      if (input) input.checked = !!value;
    });
    const throwStyle = document.getElementById('scene-dice-throw-style');
    if (throwStyle) throwStyle.value = settings.throwStyle || 'balanced';
  } catch { /* module still loading */ }
}

function resetSceneDiceDialog() {
  _sceneDicePendingRoll = null;
  let history = [];
  try { history = getSceneDiceService().getHistory(); } catch { /* module still loading */ }
  _sceneDiceLastNotation = history[0]?.notation || _sceneDiceLastNotation || '1d20';
  const roller = document.getElementById('scene-dice-roller');
  const purpose = document.getElementById('scene-dice-purpose');
  const situation = document.getElementById('scene-dice-situation');
  const rollType = document.getElementById('scene-dice-roll-type');
  const narrationMode = document.getElementById('scene-dice-narration-mode');
  const humorEnabled = document.getElementById('scene-dice-humor-enabled');
  const manualNarration = document.getElementById('scene-dice-manual-narration');
  if (roller) roller.value = '';
  if (purpose) purpose.value = '';
  if (situation) situation.value = '';
  if (rollType) rollType.value = 'general';
  if (narrationMode) narrationMode.value = 'immersive';
  if (humorEnabled) humorEnabled.checked = true;
  if (manualNarration) manualNarration.value = '';
  window.AleriaSceneDiceParticipants?.reset?.().catch(error => {
    console.warn('scene dice participant refresh failed:', error);
    setSceneDiceStatus('Die aktive Szenenbesetzung konnte nicht geladen werden.', 'error');
  });
  const result = document.querySelector('[data-scene-dice-result]');
  if (result) {
    result.dataset.state = 'idle';
    result.innerHTML = '<div class="scene-dice-result-idle"><strong>Noch kein Schicksal geworfen</strong><span>Lege Szenenangaben und Würfelpool fest.</span></div>';
  }
  const controls = document.querySelector('.scene-dice-controls');
  if (controls) controls.scrollTop = 0;
  const commit = document.querySelector('[data-scene-dice-action="commit"]');
  if (commit) commit.disabled = true;
  setSceneDiceStatus('');
  setSceneDiceEngineNote('');
  setSceneDiceStageStatus('3D-Würfel werden vorbereitet …', 'loading');
  syncSceneDiceSettings();
  syncSceneDiceNarrationModeUi();
  renderSceneDicePool();
  buildSceneDiceFormulaFromControls();
  renderSceneDiceHistory();
  updateSceneDiceModeButtons();
}
