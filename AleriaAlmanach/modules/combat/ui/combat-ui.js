function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function optionLabel(profile = {}) {
  const defense = profile.totalDefense != null && Number.isFinite(Number(profile.totalDefense)) ? `VTD ${profile.totalDefense}` : 'Verteidigung fehlt';
  const hitPoints = profile.currentHitPoints != null && profile.maximumHitPoints != null
    ? ` · ${profile.currentHitPoints}/${profile.maximumHitPoints} TP`
    : '';
  return `${profile.name} · ${defense}${hitPoints}`;
}

export function mountCombatComposer({ card, segment, actor, targets = [], actorReady = false } = {}) {
  card?.querySelector('[data-combat-composer]')?.remove();
  if (!card) return;
  const composer = document.createElement('section');
  composer.className = 'combat-composer';
  composer.dataset.combatComposer = '';
  composer.dataset.combatSegmentId = String(segment?.id || '');

  if (!actor) {
    composer.innerHTML = '<p class="combat-composer-warning">Wähle zuerst die Figur, welche diese Kampfbeschreibung schreibt.</p>';
    card.appendChild(composer);
    return;
  }

  const selectedTargetId = String(segment?.combatTargetId || '');
  const selectedActionId = String(segment?.combatActionId || actor.profileActionId || '');
  const rollMode = ['advantage', 'disadvantage'].includes(segment?.combatRollMode) ? segment.combatRollMode : 'normal';
  const targetOptions = targets.map(target => {
    const ready = target.totalDefense != null && Number.isFinite(Number(target.totalDefense));
    return `<option value="${escapeHtml(target.characterId)}"${target.characterId === selectedTargetId ? ' selected' : ''}${ready ? '' : ' disabled'}>${escapeHtml(optionLabel(target))}</option>`;
  }).join('');
  const actionOptions = (actor.actions || []).map(action => (
    `<option value="${escapeHtml(action.id)}"${action.id === selectedActionId ? ' selected' : ''}>${escapeHtml(action.kindLabel)} · ${escapeHtml(action.name)} · ${escapeHtml(action.formula.toUpperCase().replace(/D/g, 'W'))}</option>`
  )).join('');

  composer.innerHTML = `
    <div class="combat-composer-title">
      <span>Kampfauswertung</span>
      <strong>Würfelt automatisch beim Eintragen</strong>
    </div>
    <div class="combat-composer-fields">
      <label>Aktiver Angriff
        <select data-combat-input="actionId">
          ${actionOptions || '<option value="">Waffe, Zauber oder Angriff fehlt</option>'}
        </select>
      </label>
      <label>Ziel
        <select data-combat-input="targetId">
          <option value="">Ziel wählen</option>
          ${targetOptions}
        </select>
      </label>
      <label>Wurf
        <select data-combat-input="rollMode">
          <option value="normal"${rollMode === 'normal' ? ' selected' : ''}>Normal</option>
          <option value="advantage"${rollMode === 'advantage' ? ' selected' : ''}>Vorteil</option>
          <option value="disadvantage"${rollMode === 'disadvantage' ? ' selected' : ''}>Nachteil</option>
        </select>
      </label>
    </div>
    <div class="combat-composer-equipment" data-state="${actorReady ? 'ready' : 'missing'}">
      <span>Profilquelle</span><strong>${escapeHtml(actor.name)}</strong>
      ${actorReady ? '' : '<small>Ergänze auf dem Charakter- oder Kreaturenbogen einen Angriff mit Schadenswurf.</small>'}
    </div>`;
  card.appendChild(composer);
}

export function ensureCombatResolutionDialog() {
  let overlay = document.getElementById('combat-resolution-overlay');
  if (overlay) return overlay;
  overlay = document.createElement('div');
  overlay.id = 'combat-resolution-overlay';
  overlay.className = 'combat-resolution-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-hidden', 'true');
  overlay.tabIndex = -1;
  overlay.innerHTML = `
    <div class="combat-resolution-dialog">
      <span class="combat-resolution-kicker">Kampfauswertung</span>
      <h2>Die Würfel entscheiden</h2>
      <div class="combat-dice-stage" id="combat-dice-stage"></div>
      <div class="combat-resolution-status" data-combat-resolution-status role="status">Bereit …</div>
      <div class="combat-resolution-detail" data-combat-resolution-detail></div>
    </div>`;
  document.body.appendChild(overlay);
  return overlay;
}

export function setCombatResolutionStatus(message, detail = '') {
  const status = document.querySelector('[data-combat-resolution-status]');
  const detailNode = document.querySelector('[data-combat-resolution-detail]');
  if (status) status.textContent = String(message || '');
  if (detailNode) detailNode.textContent = String(detail || '');
}

function getEvaluationLabel(resolution) {
  if (resolution.attack?.criticalFailure) return 'Kritischer Fehlschlag';
  if (resolution.attack?.criticalSuccess) return 'Kritischer Treffer';
  return resolution.attack?.hit ? 'Treffer' : 'Verfehlt';
}

function getEvaluationFallback(resolution) {
  if (resolution.attack?.criticalFailure) return 'Der Angriff scheitert auf dramatische Weise.';
  if (resolution.attack?.criticalSuccess) return 'Der Angriff trifft mit voller Wucht.';
  return resolution.attack?.hit
    ? 'Der Angriff findet sein Ziel.'
    : 'Der Angriff verfehlt sein Ziel.';
}

function getNarrationSourceMeta(narration = {}) {
  const source = String(narration?.source || '').trim();
  if (source === 'aleria-gpt') {
    return { key: 'aleria-gpt', label: 'AleriaGPT-Erz\u00e4hlung', title: 'Diese Beschreibung wurde von AleriaGPT formuliert.' };
  }
  if (source.startsWith('deterministic')) {
    return { key: 'system', label: 'Systemtext \u00b7 ohne KI', title: 'AleriaGPT war f\u00fcr diese Auswertung nicht verf\u00fcgbar oder wurde nicht aufgerufen.' };
  }
  return { key: 'stored', label: 'Gespeicherte Auswertung', title: 'Bei dieser \u00e4lteren Auswertung wurde die Textquelle noch nicht gespeichert.' };
}

export function renderCombatEvaluation(source = {}) {
  const resolution = source.combatResolution || source.resolution;
  if (!resolution?.attack) return '';
  const attack = resolution.attack;
  const state = attack.criticalFailure
    ? 'failure'
    : (attack.criticalSuccess ? 'critical' : (attack.hit ? 'hit' : 'miss'));
  const narrationMeta = resolution.narration || {};
  const narrationSource = getNarrationSourceMeta(narrationMeta);
  const narration = String(narrationMeta.text || '').trim() || getEvaluationFallback(resolution);
  const damage = resolution.damage
    ? `<span><b>${escapeHtml(resolution.damage.total)}</b> Schaden · ${escapeHtml(resolution.damage.notation || '')}</span>`
    : '';
  const remainingHitPoints = resolution.targetSnapshot?.hitPointsAfter != null
    ? `<span>Ziel: <b>${escapeHtml(resolution.targetSnapshot.hitPointsAfter)}</b> TP${resolution.targetSnapshot.defeated ? ' · ausgeschaltet' : ''}</span>`
    : '';
  return `
    <aside class="combat-evaluation" data-state="${state}" data-narration-source="${narrationSource.key}" aria-label="Kampfauswertung">
      <div class="combat-evaluation-heading">
        <span>Kampfauswertung</span>
        <strong>${escapeHtml(getEvaluationLabel(resolution))}</strong>
      </div>
      ${narration ? `<p>${escapeHtml(narration)}</p>` : ''}
      <div class="combat-evaluation-mechanics">
        <span><b>${escapeHtml(attack.total)}</b> Angriff · ${escapeHtml(attack.notation || '')}</span>
        <span>gegen <b>${escapeHtml(attack.targetDefense)}</b> Verteidigung</span>
        ${damage}
        ${remainingHitPoints}
      </div>
      <div class="combat-evaluation-source" data-source="${narrationSource.key}" title="${escapeHtml(narrationSource.title)}">${escapeHtml(narrationSource.label)}</div>
    </aside>`;
}

export const combatUiInternals = Object.freeze({ optionLabel, getEvaluationLabel, getEvaluationFallback, getNarrationSourceMeta });
