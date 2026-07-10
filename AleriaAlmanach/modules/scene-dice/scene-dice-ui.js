// Scene dice button, dialog and local roll preview.
let _sceneDicePendingRoll = null;

function buildSceneDiceControl(threadId = '') {
  return `
    <button class="scene-dice-toggle" type="button" data-scene-dice-action="open" data-comment-thread-id="${escapeHtml(threadId)}" aria-label="Würfel öffnen" title="Würfel">
      <img src="${escapeHtml(getSceneDiceIcon(20))}" alt="" decoding="async">
    </button>`;
}

function buildSceneDiceTypeButtons() {
  return [3, 4, 6, 8, 10, 12, 20, 100].map(sides => `
    <button class="scene-dice-type" type="button" data-scene-dice-action="choose-die" data-die-sides="${sides}" title="W${sides}">
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
      <div class="scene-dice-head">
        <div><span>Schicksalswurf</span><h2 id="scene-dice-title">Würfel der Szene</h2></div>
        <button type="button" data-scene-dice-action="close" aria-label="Würfel schließen">×</button>
      </div>
      <div class="scene-dice-body">
        <section class="scene-dice-panel">
          <label>Würfel wählen</label>
          <div class="scene-dice-types">${buildSceneDiceTypeButtons()}</div>
          <div class="scene-dice-formula-row">
            <label><span>Formel</span><input id="scene-dice-formula" type="text" value="1d20" placeholder="z. B. 2d6 + 1d8 + 5" spellcheck="false"></label>
            <label><span>W20-Modus</span><select id="scene-dice-mode"><option value="normal">Normal</option><option value="advantage">Vorteil</option><option value="disadvantage">Nachteil</option></select></label>
            <label><span>Wurfart</span><select id="scene-dice-roll-type"><option value="general">Allgemein</option><option value="attack">Angriff</option><option value="death-save">Todesrettungswurf</option></select></label>
          </div>
          <p class="scene-dice-help">Erlaubt: W3, W4, W6, W8, W10, W12, W20, W100, beliebige Kombinationen und Modifikatoren. Vorteil/Nachteil gilt nur für einen W20-Test.</p>
        </section>
        <section class="scene-dice-panel scene-dice-context">
          <label><span>Wer würfelt?</span><input id="scene-dice-roller" type="text" maxlength="80" placeholder="Figur oder Erzähler"></label>
          <label><span>Anlass</span><input id="scene-dice-purpose" type="text" maxlength="140" placeholder="z. B. Wahrnehmung, Angriff, Schaden"></label>
        </section>
        <section class="scene-dice-result" data-scene-dice-result data-state="idle">
          <div class="scene-dice-result-idle">Die Würfel warten auf deine Hand.</div>
        </section>
      </div>
      <div class="scene-dice-foot">
        <div class="scene-dice-status" data-scene-dice-status role="status"></div>
        <div><button type="button" data-scene-dice-action="roll">Würfeln</button><button class="primary" type="button" data-scene-dice-action="commit" disabled>In Szene eintragen</button></div>
      </div>
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

function getSceneDiceModeLabel(mode) {
  return mode === 'advantage' ? 'Vorteil' : mode === 'disadvantage' ? 'Nachteil' : 'Normal';
}

function renderSceneDiceRollDetails(roll) {
  return roll.terms.map(term => {
    if (term.kind === 'modifier') return `<span class="scene-dice-modifier">${term.value >= 0 ? '+' : ''}${term.value}</span>`;
    const rolls = term.rolls.map((item, index) => {
      const kept = term.keptIndexes.includes(index);
      const detail = item.simulatedBy ? ` title="W3 über W${item.simulatedBy}: ${item.physical}"` : (term.sides === 100 ? ` title="Zehner ${item.tens}, Einer ${item.ones}"` : '');
      return `<span class="${kept ? 'kept' : 'discarded'}"${detail}>${item.value}</span>`;
    }).join('');
    return `<span class="scene-dice-term"><img src="${escapeHtml(getSceneDiceIcon(term.sides))}" alt="W${term.sides}"><span>${term.sign < 0 ? '−' : ''}${term.count}W${term.sides}</span><span class="scene-dice-values">${rolls}</span></span>`;
  }).join('');
}

function renderSceneDicePendingRoll(roll) {
  const target = document.querySelector('[data-scene-dice-result]');
  if (!target) return;
  target.dataset.state = roll.critical || 'ready';
  target.innerHTML = `
    <div class="scene-dice-result-kicker">${escapeHtml(getSceneDiceModeLabel(roll.mode))} · ${escapeHtml(roll.formula)}</div>
    <div class="scene-dice-total">${roll.total}</div>
    ${roll.special ? `<div class="scene-dice-critical">${escapeHtml(roll.special)}</div>` : ''}
    <div class="scene-dice-breakdown">${renderSceneDiceRollDetails(roll)}</div>`;
}

function resetSceneDiceDialog() {
  _sceneDicePendingRoll = null;
  const formula = document.getElementById('scene-dice-formula');
  const mode = document.getElementById('scene-dice-mode');
  const rollType = document.getElementById('scene-dice-roll-type');
  const roller = document.getElementById('scene-dice-roller');
  const purpose = document.getElementById('scene-dice-purpose');
  if (formula) formula.value = '1d20';
  if (mode) mode.value = 'normal';
  if (rollType) rollType.value = 'general';
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
}
