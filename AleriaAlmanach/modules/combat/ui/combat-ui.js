import { getCombatResourceIconPresentation } from '../combat-resource-icons.js?v=20260803-resource-icons-v1';

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderPaymentResource(cost = {}, resources = []) {
  const resource = resources.find(item => String(item?.id || '') === String(cost.resourceId || '')) || {
    id: cost.resourceId,
    name: cost.name,
    current: 0,
    maximum: 0
  };
  const icon = getCombatResourceIconPresentation(resource);
  return `<span class="combat-payment-resource" title="${escapeHtml(resource.name || cost.name)} · Kosten ${escapeHtml(cost.amount || 0)}">
    <span class="combat-payment-resource-icon" aria-hidden="true"><b>${escapeHtml(icon.fallback)}</b>${icon.source ? `<img src="${escapeHtml(icon.source)}" alt="">` : ''}</span>
    <strong>${escapeHtml(resource.current ?? 0)}</strong><small>−${escapeHtml(cost.amount || 0)}</small>
  </span>`;
}

function renderPaymentOption(option = {}, actor = {}, active = false, confirmed = false) {
  const costs = Array.isArray(option.costs) ? option.costs : [];
  const sufficient = option.payment?.sufficient !== false;
  const label = option.mode === 'aura' ? 'Aura-Fokus' : 'Regulär';
  return `<button type="button" class="combat-payment-option${active ? ' active' : ''}${confirmed ? ' confirmed' : ''}" data-combat-controller-action="choose-payment" data-payment-mode="${escapeHtml(option.mode)}"${sufficient ? '' : ' disabled'} aria-pressed="${active && confirmed}">
    <span class="combat-payment-option-label">${escapeHtml(label)}</span>
    <span class="combat-payment-option-resources">${costs.length ? costs.map(cost => renderPaymentResource(cost, actor.resources || [])).join('') : '<span class="combat-payment-free">Kostenlos</span>'}</span>
    <small>${confirmed ? 'reserviert · erneut klicken zum Lösen' : (sufficient ? 'anklicken zum Bezahlen' : `nicht genug ${escapeHtml(option.payment?.missing?.name || 'Ressourcen')}`)}</small>
  </button>`;
}

function optionLabel(profile = {}) {
  const defense = profile.totalDefense != null && Number.isFinite(Number(profile.totalDefense)) ? `VTD ${profile.totalDefense}` : 'Verteidigung fehlt';
  const hitPoints = profile.currentHitPoints != null && profile.maximumHitPoints != null
    ? ` · ${profile.currentHitPoints}/${profile.maximumHitPoints} TP`
    : '';
  return `${profile.name} · ${defense}${hitPoints}`;
}

export function mountCombatComposer({ card, segment, actor, targets = [], actorReady = false, payment = null, paymentOptions = [], paymentConfirmed = false, auraPaymentAvailable = false } = {}) {
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
  const segmentKind = String(segment?.kind || 'combataction');
  const paymentMode = actor.cheats?.enabled ? 'cheat' : (['aura', 'cheat'].includes(segment?.combatPaymentMode) ? segment.combatPaymentMode : 'standard');
  const rollMode = ['advantage', 'disadvantage'].includes(segment?.combatRollMode) ? segment.combatRollMode : 'normal';
  const targetOptions = targets.map(target => {
    const ready = target.totalDefense != null && Number.isFinite(Number(target.totalDefense));
    return `<option value="${escapeHtml(target.characterId)}"${target.characterId === selectedTargetId ? ' selected' : ''}${ready ? '' : ' disabled'}>${escapeHtml(optionLabel(target))}</option>`;
  }).join('');
  const actionOptions = (actor.actions || []).map(action => (
    `<option value="${escapeHtml(action.id)}"${action.id === selectedActionId ? ' selected' : ''}${action.compatible === false ? ' disabled' : ''}>${escapeHtml(action.kindLabel)} · ${escapeHtml(action.name)} · ${escapeHtml(action.formula.toUpperCase().replace(/D/g, 'W'))}${action.compatible === false ? ' · nicht mit aktiver Waffe möglich' : ''}</option>`
  )).join('');
  const paymentState = actor.cheats?.enabled ? 'cheat' : (paymentConfirmed && payment?.sufficient ? 'confirmed' : (payment?.sufficient ? 'ready' : 'missing'));
  const composerLabel = segmentKind === 'spell' ? 'Zauberauswertung' : (segmentKind === 'prayer' ? 'Gebetsauswertung' : (segmentKind === 'song' ? 'Gesangsauswertung' : 'Kampfauswertung'));

  composer.innerHTML = `
    <div class="combat-composer-title">
      <span>${composerLabel}</span>
      <strong>Ressource anklicken · würfelt beim Eintragen</strong>
    </div>
    <div class="combat-composer-fields">
      <label>Aktiver Angriff
        <select data-combat-input="actionId">
          ${actionOptions || '<option value="">Waffe, Zauber oder Angriff fehlt</option>'}
        </select>
      </label>
      <label class="combat-target-field">Ziel
        <input type="search" data-combat-target-search placeholder="Ziel suchen …" autocomplete="off">
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
    <div class="combat-payment" data-state="${paymentState}">
      <div class="combat-payment-head"><span>Bezahlung für diesen Abschnitt</span><strong>${actor.cheats?.enabled ? 'Cheat · kostenlos' : (paymentConfirmed ? 'Reserviert' : 'Icon anklicken')}</strong></div>
      ${actor.cheats?.enabled ? '<p>Alle Aktions-, Mana-, Slot- und Fokuskosten entfallen; der Angriff gelingt automatisch.</p>' : `
        <div class="combat-payment-options">${paymentOptions.map(option => renderPaymentOption(option, actor, option.mode === paymentMode, paymentConfirmed && option.mode === paymentMode)).join('')}</div>
      `}
    </div>
    <div class="combat-composer-equipment" data-state="${actorReady ? 'ready' : 'missing'}">
      <span>Profilquelle</span><strong>${escapeHtml(actor.name)}</strong>
      ${actorReady ? '' : `<small>${escapeHtml(actor.selectedAction?.disabledReason || 'Ergänze auf dem Charakter- oder Kreaturenbogen einen passenden Angriff mit Schadenswurf.')}</small>`}
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
  if (resolution.attack?.forcedSuccess) return resolution.attack?.criticalSuccess ? 'Cheat · Kritischer Treffer' : 'Cheat · Erfolg';
  if (resolution.attack?.criticalFailure) return 'Kritischer Fehlschlag';
  if (resolution.attack?.criticalSuccess) return 'Kritischer Treffer';
  if (resolution.attack?.resolutionMode === 'saving-throw') {
    return resolution.attack.saveSucceeded ? 'Rettung gelungen' : 'Rettung misslungen';
  }
  if (resolution.profileActionKind === 'spell') return resolution.attack?.hit ? 'Zauber trifft' : 'Zauber verfehlt';
  if (resolution.profileActionKind === 'prayer') return resolution.attack?.hit ? 'Gebet wirkt' : 'Gebet widerstanden';
  if (resolution.profileActionKind === 'song') return resolution.attack?.hit ? 'Gesang wirkt' : 'Gesang widerstanden';
  return resolution.attack?.hit ? 'Treffer' : 'Verfehlt';
}

function getEvaluationFallback(resolution) {
  if (resolution.attack?.criticalFailure) return 'Der Angriff scheitert auf dramatische Weise.';
  if (resolution.attack?.criticalSuccess) return 'Der Angriff trifft mit voller Wucht.';
  if (resolution.attack?.resolutionMode === 'saving-throw') {
    return resolution.attack.saveSucceeded
      ? 'Das Ziel widersteht der Wirkung.'
      : 'Das Ziel kann der Wirkung nicht widerstehen.';
  }
  if (resolution.profileActionKind === 'spell') return resolution.attack?.hit ? 'Der Zauber findet sein Ziel.' : 'Der Zauber verfehlt sein Ziel.';
  if (resolution.profileActionKind === 'prayer') return resolution.attack?.hit ? 'Das Gebet entfaltet seine Wirkung.' : 'Der heiligen Wirkung wird widerstanden.';
  if (resolution.profileActionKind === 'song') return resolution.attack?.hit ? 'Der Gesang entfaltet seine Wirkung.' : 'Der Wirkung des Gesangs wird widerstanden.';
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
  const hitPointTransition = resolution.targetSnapshot?.hitPointsAfter != null
    ? `<span>Ziel-TP: <b>${escapeHtml(resolution.targetSnapshot.hitPointsBefore)}</b> &rarr; <b>${escapeHtml(resolution.targetSnapshot.hitPointsAfter)}</b>${resolution.targetSnapshot.defeated ? ' &middot; ausgeschaltet' : ''}</span>`
    : remainingHitPoints;
  const temporaryHitPoints = Number(resolution.targetSnapshot?.temporaryHitPointsBefore || 0) > 0
    ? `<span>Temp. TP: <b>${escapeHtml(resolution.targetSnapshot.temporaryHitPointsBefore)}</b> &rarr; <b>${escapeHtml(resolution.targetSnapshot.temporaryHitPointsAfter || 0)}</b></span>`
    : '';
  const resourceChanges = (Array.isArray(resolution.actorResourceSnapshot?.changes)
    ? resolution.actorResourceSnapshot.changes
    : []).map(change => (
      `<span>${escapeHtml(change.name || 'Ressource')}: <b>${escapeHtml(change.before)}</b> &rarr; <b>${escapeHtml(change.after)}</b></span>`
    )).join('');
  const savingThrowMode = attack.resolutionMode === 'saving-throw';
  const rollLabel = savingThrowMode ? 'Rettungswurf' : (attack.resolutionMode === 'spell-attack' ? 'Zauberangriff' : 'Angriff');
  const defenseLabel = savingThrowMode ? 'Zauber-SG' : 'Verteidigung';
  return `
    <aside class="combat-evaluation" data-state="${state}" data-narration-source="${narrationSource.key}" aria-label="Kampfauswertung">
      <div class="combat-evaluation-heading">
        <span>Kampfauswertung</span>
        <strong>${escapeHtml(getEvaluationLabel(resolution))}</strong>
      </div>
      ${narration ? `<p>${escapeHtml(narration)}</p>` : ''}
      <div class="combat-evaluation-mechanics">
        <span><b>${escapeHtml(attack.total)}</b> ${rollLabel} · ${escapeHtml(attack.notation || '')}</span>
        <span>gegen <b>${escapeHtml(attack.targetDefense)}</b> ${defenseLabel}</span>
        ${savingThrowMode ? `<span>Rettung ${attack.saveSucceeded ? 'gelungen' : 'misslungen'}${resolution.damage?.halvedBySave ? ' · halber Schaden' : ''}</span>` : ''}
        ${damage}
        ${hitPointTransition}
        ${temporaryHitPoints}
        ${resourceChanges}
      </div>
      <div class="combat-evaluation-source" data-source="${narrationSource.key}" title="${escapeHtml(narrationSource.title)}">${escapeHtml(narrationSource.label)}</div>
    </aside>`;
}

export const combatUiInternals = Object.freeze({ optionLabel, getEvaluationLabel, getEvaluationFallback, getNarrationSourceMeta });
