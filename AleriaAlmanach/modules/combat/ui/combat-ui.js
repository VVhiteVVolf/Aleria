import { getSpellLevelLabel, getSpellSlotLevel } from '../combat-spell-slots.js?v=20260803-character-creation-v1';
import {
  aggregateCosts, buildPaymentResourceCards, classifyPaymentResourceCards,
  isMagicSegmentKind, isSpellSlotResource, renderPaymentPanel
} from './combat-payment-ui.js?v=20260905-resource-balance-v2';
import {
  activationLabel, getCombatDisplayStats, getMagicDisplayStats, renderWeaponLoadout, bindWeaponImageFallback,
  renderActionOptions, renderActionMetadata, renderActionDetails, renderCombatValueStrip, renderMagicValueStrip
} from './combat-action-card.js?v=20260905-party-combat-v1';
import { captureComposerViewState, restoreComposerViewState } from './combat-composer-view-state.js?v=20260905-resource-balance-v2';
import { getActiveRollModes } from '../combat-profile-model.js?v=20260906-effect-rolls-v1';
import { renderAutomaticRollMode } from './combat-roll-mode-view.js?v=20260906-effect-rolls-v1';
import { bindActionPicker, renderActionPicker } from './combat-action-picker.js?v=20260905-party-combat-v1';
import { bindTargetPortraitFallback, optionLabel, renderSelectedTargetPortraits, renderTargetOptions } from './combat-target-picker.js?v=20260905-resource-balance-v2';
function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderRuleOption(option = {}) {
  const selected = option.selected === true;
  const costs = (Array.isArray(option.costs) ? option.costs : [])
    .map(cost => `${escapeHtml(cost.name || cost.resourceId)} −${escapeHtml(cost.amount || 0)}`)
    .join(' \u00b7 ');
  return `<label class="combat-rule-option${selected ? ' selected' : ''}">
    <input type="checkbox" data-combat-rule-toggle data-source-actor-id="${escapeHtml(option.sourceActorId)}" data-rule-id="${escapeHtml(option.ruleId)}" data-persistence-kind="${escapeHtml(option.persistence?.kind)}" data-record-id="${escapeHtml(option.persistence?.recordId)}" data-source-creature-id="${escapeHtml(option.persistence?.sourceCreatureId)}"${selected ? ' checked' : ''}>
    <span><strong>${escapeHtml(option.sourceActorName)}</strong><b>${escapeHtml(option.ruleName)}</b><small>${escapeHtml(option.phaseLabel)}${costs ? ` \u00b7 ${costs}` : ''}</small></span>
    <input type="number" min="0" max="9999" step="0.5" value="${escapeHtml(option.distanceMeters ?? 0)}" data-combat-rule-distance data-source-actor-id="${escapeHtml(option.sourceActorId)}" data-rule-id="${escapeHtml(option.ruleId)}" aria-label="Entfernung zur betroffenen Figur in Metern"${selected ? '' : ' disabled'}>
    <i>m</i>
  </label>`;
}

export function mountCombatComposer({ card, segment, actor, rollModes = null, targets = [], ruleOptions = [], actorReady = false, actorProblem = '', payment = null, paymentOptions = [], paymentConfirmed = false, auraPaymentAvailable = false } = {}) {
  if (!card) return;
  const previousComposer = card.querySelector('[data-combat-composer]');
  const viewState = captureComposerViewState(previousComposer);
  previousComposer?.remove();
  const composer = document.createElement('section');
  bindWeaponImageFallback(composer);
  bindTargetPortraitFallback(composer);
  composer.className = 'combat-composer';
  composer.dataset.combatComposer = '';
  composer.dataset.combatSegmentId = String(segment?.id || '');

  if (!actor) {
    composer.innerHTML = '<p class="combat-composer-warning">Wähle zuerst die Figur, welche diese Kampfbeschreibung schreibt.</p>';
    card.appendChild(composer);
    return;
  }

  const selectedTargetId = String(segment?.combatTargetId || '');
  const selectedTargetIds = new Set((segment?.combatTargetIds || [selectedTargetId]).map(String).filter(Boolean));
  const selectedActionId = String(segment?.combatActionId || actor.profileActionId || '');
  const segmentKind = String(segment?.kind || 'combataction');
  const magic = isMagicSegmentKind(segmentKind);
  composer.classList.add(magic ? 'combat-composer--magic' : 'combat-composer--martial');
  composer.dataset.combatKind = magic ? 'magic' : 'martial';
  const paymentMode = actor.cheats?.enabled ? 'cheat' : (['aura', 'mana-substitute', 'cheat'].includes(segment?.combatPaymentMode) ? segment.combatPaymentMode : 'standard');
  const weaponGrip = actor.supportsVersatileGrip && String(segment?.combatWeaponGrip || actor.weaponGrip) === 'two-handed'
    ? 'two-handed'
    : 'one-handed';
  const maximumTargets = Math.max(1, Number(actor.selectedAction?.maximumTargets) || 1);
  const supportsMultipleTargets = maximumTargets > 1
    || (actor.selectedAction?.effects || []).some(effect => ['selected', 'allies', 'enemies', 'all'].includes(String(effect?.target || '')));
  const targetOptions = renderTargetOptions(targets, selectedTargetIds);
  const actionOptions = renderActionOptions(actor, selectedActionId);
  const equipmentSwitch = actor.selectedAction?.kind === 'equipment-switch';
  const composerHint = equipmentSwitch
    ? 'Wechsel beim Eintragen'
    : 'Auswertung beim Eintragen';
  const spellAction = actor.selectedAction?.spellLevel != null ? actor.selectedAction : null;
  const selectedCastLevel = spellAction?.isCantrip ? 0 : Math.max(Number(spellAction?.spellLevel) || 1, Number(segment?.combatCastLevel) || Number(spellAction?.castLevel) || 1);
  const maximumCastLevel = spellAction ? Math.max(Number(spellAction.spellLevel) || 0, Math.min(10, Number(spellAction.upcast?.maximumLevel) || 10)) : 0;
  const castLevelOptions = spellAction ? Array.from({ length: maximumCastLevel - Number(spellAction.spellLevel) + 1 }, (_entry, index) => {
    const level = Number(spellAction.spellLevel) + index;
    const slot = actor.resources?.find(resource => getSpellSlotLevel(resource) === level);
    const disabled = level > 0 && (!slot || Number(slot.maximum) < 1);
    return `<option value="${level}"${level === selectedCastLevel ? ' selected' : ''}${disabled ? ' disabled' : ''}>${escapeHtml(getSpellLevelLabel(level))}${level > Number(spellAction.spellLevel) ? ' · höherstufig' : ''}${disabled ? ' · nicht freigeschaltet' : ''}</option>`;
  }).join('') : '';
  const composerLabel = segmentKind === 'spell' ? 'Zauberhandlung' : (segmentKind === 'prayer' ? 'Gebetshandlung' : (segmentKind === 'song' ? 'Gesangshandlung' : 'Kampfhandlung'));
  const actionFieldLabel = equipmentSwitch ? 'Waffenwechsel' : (segmentKind === 'spell' ? 'Zauber' : (segmentKind === 'prayer' ? 'Gebet' : (segmentKind === 'song' ? 'Gesang' : 'Angriff')));
  const composerIcon = magic ? 'magic-action.png' : 'combat-action.png';
  const resourceCards = buildPaymentResourceCards({ actor, paymentOptions, paymentMode, paymentConfirmed, segmentKind });
  const resourceGroups = classifyPaymentResourceCards(resourceCards, actor, magic);
  const paymentPanel = renderPaymentPanel({
    actor,
    cards: resourceCards,
    groups: resourceGroups,
    magic,
    paymentOptions,
    paymentMode,
    paymentConfirmed,
    actorReady,
    payment
  });
  const targetField = equipmentSwitch
    ? `<div class="combat-composer-field-static"><span>Wirkung</span><strong>Eigene Ausrüstung</strong><small>Der Wechsel gilt für alle folgenden Kampfhandlungen.</small></div>`
    : `<label class="combat-target-field">${supportsMultipleTargets ? 'Ziele' : 'Ziel'}
        <input type="search" data-combat-target-search placeholder="Ziel suchen …" autocomplete="off" aria-label="Ziele durchsuchen">
        <select data-combat-input="${supportsMultipleTargets ? 'targetIds' : 'targetId'}" aria-label="${supportsMultipleTargets ? 'Ziele wählen' : 'Ziel wählen'}"${supportsMultipleTargets ? ' multiple size="4"' : ''}>
          <option value="">Ziel wählen</option>
          ${targetOptions}
        </select>
        ${renderSelectedTargetPortraits(targets, selectedTargetIds)}
        ${supportsMultipleTargets ? `<small>Bis zu ${escapeHtml(maximumTargets > 1 ? maximumTargets : 20)} Ziele; jeder Angriff wird einzeln ausgewertet, Kosten und Munition fallen einmal an.</small>` : ''}
      </label>`;

  composer.innerHTML = `
    <div class="combat-composer-title">
      <div class="combat-composer-heading"><span aria-hidden="true"><img src="./public/assets/combat-profile-icons/${composerIcon}" alt=""></span><b>${composerLabel}</b></div>
      <div class="combat-composer-profile"><strong>${escapeHtml(actor.name)}</strong><small>${composerHint}</small></div>
    </div>
    ${magic ? '' : renderWeaponLoadout(actor)}
    <div class="combat-composer-fields combat-composer-fields--${magic ? 'magic' : 'martial'}">
      <div class="combat-action-field"><span class="combat-field-caption">${actionFieldLabel}</span>
        <select data-combat-input="actionId" aria-label="${actionFieldLabel}">
          ${actionOptions || '<option value="">Waffe, Zauber oder Angriff fehlt</option>'}
        </select>
        ${renderActionPicker(actor, selectedActionId)}
        ${renderActionMetadata(actor)}
      </div>
      ${targetField}
    </div>
    <div class="combat-action-resolution">
      ${magic ? renderMagicValueStrip(actor) : renderCombatValueStrip(actor)}
      <div class="combat-action-controls">
      ${magic && spellAction ? `<label>Wirkungsgrad<select data-combat-input="castLevel">${castLevelOptions}</select></label>` : ''}
      ${equipmentSwitch ? '' : renderAutomaticRollMode(rollModes || [...getActiveRollModes(actor), actor.forcedRollMode], { resolutionMode: actor.actionResolutionMode })}
      ${!magic && !equipmentSwitch && actor.supportsVersatileGrip ? `<label>Führung
        <select data-combat-input="weaponGrip">
          <option value="one-handed"${weaponGrip === 'one-handed' ? ' selected' : ''}>Einhändig · ${escapeHtml(actor.selectedAction?.baseDamageFormula || actor.weapon?.damageFormula || '')}</option>
          <option value="two-handed"${weaponGrip === 'two-handed' ? ' selected' : ''}>Zweihändig · ${escapeHtml(actor.selectedAction?.weapon?.versatileDamageFormula || '')}</option>
        </select>
      </label>` : ''}
      </div>
    </div>
    ${actorReady ? '' : `<p class="combat-composer-warning" role="status">${escapeHtml(actorProblem || actor.selectedAction?.disabledReason || 'Ergänze auf dem Charakter- oder Kreaturenbogen einen passenden Angriff mit Schadenswurf.')}</p>`}
    ${paymentPanel}
    ${renderActionDetails(actor)}
    ${ruleOptions.length ? `<div class="combat-rule-selection">
      <div class="combat-rule-heading"><span>Reaktionen & Eingriffe</span><small>Optional</small></div>
      <p>Aktiviere nur Regeln, deren Besitzer du steuern darfst. Die Entfernung wird gegen den Regelradius gepr\u00fcft.</p>
      <div class="combat-rule-options">${ruleOptions.map(renderRuleOption).join('')}</div>
    </div>` : ''}`;
  card.appendChild(composer);
  bindActionPicker(composer);
  restoreComposerViewState(composer, viewState);
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
          <div class="scene-dice-stage" id="combat-dice-stage"></div>
          <div class="scene-dice-board-shade" aria-hidden="true"></div>
        </section>
      </div>
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
  const effectTypes = new Set((Array.isArray(resolution.effectResults) ? resolution.effectResults : [])
    .filter(result => result?.applied !== false)
    .map(result => String(result?.effect?.type || '')));
  const hasDamage = effectTypes.has('damage');
  if (!hasDamage && effectTypes.has('healing')) return 'Heilung wirkt';
  if (!hasDamage && effectTypes.has('temporary-hit-points')) return 'Schutz gewährt';
  if (!hasDamage && effectTypes.has('remove-condition')) return 'Zustand gelöst';
  if (!hasDamage && (effectTypes.has('apply-condition') || effectTypes.has('buff') || effectTypes.has('debuff'))) return 'Wirkung angewandt';
  if (!hasDamage && effectTypes.has('summon')) return 'Beschwörung gelingt';
  if (!hasDamage && effectTypes.has('interrupt')) return 'Unterbrochen';
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
  const effectTypes = new Set((Array.isArray(resolution.effectResults) ? resolution.effectResults : [])
    .filter(result => result?.applied !== false)
    .map(result => String(result?.effect?.type || '')));
  const hasDamage = effectTypes.has('damage');
  if (!hasDamage && effectTypes.has('healing')) return 'Die heilende Wirkung wird verbindlich angewandt.';
  if (!hasDamage && effectTypes.has('temporary-hit-points')) return 'Die schützende Wirkung wird verbindlich angewandt.';
  if (!hasDamage && effectTypes.has('remove-condition')) return 'Die belastende Wirkung wird entfernt.';
  if (!hasDamage && (effectTypes.has('apply-condition') || effectTypes.has('buff') || effectTypes.has('debuff'))) return 'Die vorbereitete Wirkung greift.';
  if (!hasDamage && effectTypes.has('summon')) return 'Die Beschwörung tritt in Kraft.';
  if (!hasDamage && effectTypes.has('interrupt')) return 'Die laufende Handlung wird unterbrochen.';
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

function summarizeRuleEffects(effects = {}) {
  const labels = [
    ['attackModifier', 'Angriff'], ['defenseModifier', 'Verteidigung'],
    ['savingThrowModifier', 'Rettung'], ['spellSaveDcModifier', 'Zauber-SG'],
    ['damageModifier', 'Schaden'], ['damageReduction', 'Schadensreduktion']
  ];
  const parts = labels
    .filter(([key]) => Number(effects[key] || 0) !== 0)
    .map(([key, label]) => `${label} ${Number(effects[key]) > 0 ? '+' : ''}${Number(effects[key])}`);
  if (effects.rollMode && effects.rollMode !== 'normal') parts.push(effects.rollMode === 'advantage' ? 'Vorteil' : 'Nachteil');
  if (effects.outcome && effects.outcome !== 'none') parts.push({
    'force-hit': 'Treffer erzwungen', 'force-miss': 'Fehlschlag erzwungen',
    'force-critical-hit': 'Kritischer Treffer erzwungen',
    'force-save-success': 'Rettung erzwungen', 'force-save-failure': 'Rettungsfehlschlag erzwungen'
  }[effects.outcome] || effects.outcome);
  return parts.join(' \u00b7 ') || 'Ausl\u00f6ser angewandt';
}

function renderEffectResult(result = {}) {
  const effect = result.effect || {};
  const recipient = result.recipient === 'actor' ? 'Selbst · ' : '';
  if (effect.type === 'damage' && result.applied) {
    const response = result.applied.damageResponse?.response;
    const responseLabel = { resistant: 'Resistenz', vulnerable: 'Verwundbarkeit', immune: 'Immunität' }[response] || '';
    return `<span>${recipient}<b>${escapeHtml(result.applied.incoming ?? result.amount ?? 0)} ${escapeHtml(effect.damageType || 'Schaden')}</b>${responseLabel ? ` · ${responseLabel} (roh ${escapeHtml(result.applied.rawIncoming ?? result.amount ?? 0)})` : ''}</span>`;
  }
  if (effect.type === 'healing' && result.applied) return `<span>${recipient}Heilung: <b>+${escapeHtml(result.applied.restored ?? 0)} TP</b> · ${escapeHtml(result.applied.before?.current ?? 0)} → ${escapeHtml(result.applied.after?.current ?? 0)}</span>`;
  if (effect.type === 'temporary-hit-points' && result.applied) return `<span>${recipient}Temporäre TP: <b>+${escapeHtml(result.applied.granted ?? 0)}</b> · ${escapeHtml(result.applied.before?.temporary ?? 0)} → ${escapeHtml(result.applied.after?.temporary ?? 0)}</span>`;
  if (['apply-condition', 'buff', 'debuff'].includes(effect.type) && result.condition) return `<span>Zustand erhalten: <b>${escapeHtml(result.condition.name)}</b></span>`;
  if (effect.type === 'remove-condition') return `<span>Zustände entfernt: <b>${escapeHtml((result.removed || []).map(condition => condition.name).join(', ') || 'keiner')}</b></span>`;
  if (['restore-resource', 'spend-resource'].includes(effect.type) && result.applied?.change) return `<span>${escapeHtml(result.applied.change.name || 'Ressource')}: <b>${escapeHtml(result.applied.change.before)} → ${escapeHtml(result.applied.change.after)}</b></span>`;
  if (effect.type === 'move') return `<span>Bewegungshinweis: <b>${escapeHtml(effect.movementKind || 'move')} ${escapeHtml(effect.movementMeters || 0)} m</b> · erzählerisch absprechen</span>`;
  if (effect.type === 'summon') return `<span>Beschwörung: <b>${escapeHtml(effect.summon?.count || 1)}× ${escapeHtml(effect.summon?.name || 'Kreatur')}</b></span>`;
  if (effect.type === 'interrupt') return '<span><b>Unterbrechung ausgelöst</b></span>';
  return '';
}

function getEvaluationPortrait(id) {
  const character = globalThis.getAvailableCommentCharacterById?.(String(id || ''));
  return character?.portrait ? String(character.portrait) : '';
}

function renderEvaluationActors(actorId, actorName, targetId, targetName) {
  const actorPortrait = getEvaluationPortrait(actorId);
  const targetPortrait = getEvaluationPortrait(targetId);
  if (!actorPortrait && !targetPortrait) return '';
  const avatar = (portrait, name) => `<span class="combat-evaluation-avatar">${portrait ? `<img src="${escapeHtml(portrait)}" alt="">` : escapeHtml((name || '?').slice(0, 1))}</span>`;
  return `<div class="combat-evaluation-actors">
    ${avatar(actorPortrait, actorName)}
    <span class="combat-evaluation-arrow">→</span>
    ${avatar(targetPortrait, targetName)}
  </div>`;
}

export function renderCombatEvaluation(source = {}) {
  const resolution = source.combatResolution || source.resolution;
  if (!resolution?.attack) return '';
  if (resolution.actionType === 'channeling') {
    const progress = resolution.actorChannelingSnapshot?.after || {};
    const narrationMeta = resolution.narration || {};
    const narrationSource = getNarrationSourceMeta(narrationMeta);
    const narration = String(narrationMeta.text || '').trim()
      || `${resolution.actorName} bereitet ${progress.actionName || 'die Wirkung'} weiter vor.`;
    return `<details class="combat-evaluation" data-state="channeling" data-narration-source="${narrationSource.key}" aria-label="Kanalisierung">
      <summary class="combat-evaluation-summary">
        ${renderEvaluationActors(resolution.actorId, resolution.actorName, resolution.targetId, resolution.targetName)}
        <strong class="combat-evaluation-summary-label">Kanalisierung ${escapeHtml(progress.progress || 0)}/${escapeHtml(progress.requiredComments || 0)}</strong>
        <span class="combat-evaluation-toggle-icon" aria-hidden="true"></span>
      </summary>
      <div class="combat-evaluation-body">
        <div class="combat-evaluation-heading"><span>Kanalisierung</span><strong>${escapeHtml(progress.progress || 0)} / ${escapeHtml(progress.requiredComments || 0)}</strong></div>
        <p>${escapeHtml(narration)}</p>
        <div class="combat-evaluation-mechanics"><span><b>Noch keine Kosten und kein Wirkungswurf.</b></span><span>Die Wirkung wird erst beim vollständigen Abschluss ausgelöst.</span></div>
        <div class="combat-evaluation-source" data-source="${narrationSource.key}" title="${escapeHtml(narrationSource.title)}">${escapeHtml(narrationSource.label)}</div>
      </div>
    </details>`;
  }
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
  const ammunitionUse = resolution.actorInventorySnapshot?.ammunitionUse
    ? `<span>Munition: <b>${escapeHtml(resolution.actorInventorySnapshot.ammunitionUse.name)}</b> ${escapeHtml(resolution.actorInventorySnapshot.ammunitionUse.before)} &rarr; ${escapeHtml(resolution.actorInventorySnapshot.ammunitionUse.after)}</span>`
    : '';
  const ruleLedger = (Array.isArray(resolution.ruleApplications) ? resolution.ruleApplications : []).map(rule => (
    `<span class="combat-rule-ledger"><b>${escapeHtml(rule.sourceActorName || 'Regelquelle')} \u00b7 ${escapeHtml(rule.ruleName)}</b><small>${escapeHtml(summarizeRuleEffects(rule.effects))}</small></span>`
  )).join('');
  const ruleResourceChanges = (Array.isArray(resolution.ruleResourceSnapshots) ? resolution.ruleResourceSnapshots : [])
    .flatMap(snapshot => (snapshot.changes || []).map(change => (
      `<span>${escapeHtml(snapshot.sourceActorName || 'Reaktion')} \u00b7 ${escapeHtml(change.name || 'Ressource')}: <b>${escapeHtml(change.before)}</b> &rarr; <b>${escapeHtml(change.after)}</b></span>`
    ))).join('');
  const secondarySaves = (Array.isArray(resolution.secondarySaves) ? resolution.secondarySaves : []).map(save => (
    `<span><b>${escapeHtml(String(save.attributeKey || 'Rettung').toUpperCase())}-Rettung ${escapeHtml(save.total)}</b> gegen SG ${escapeHtml(save.dc)} · ${save.succeeded ? 'gelungen' : 'misslungen'}</span>`
  )).join('');
  const followUpAttacks = (Array.isArray(resolution.followUpAttacks) ? resolution.followUpAttacks : []).map(followUp => (
    `<span><b>Folgeangriff ${escapeHtml(followUp.attack?.total ?? '—')}</b> gegen ${escapeHtml(followUp.attack?.targetDefense ?? '—')} · ${followUp.attack?.hit ? `Treffer${followUp.damage ? `, ${escapeHtml(followUp.damage.total)} Schaden` : ''}` : 'verfehlt'}</span>`
  )).join('');
  const appliedCondition = resolution.targetConditionSnapshot?.applied?.name
    ? `<span>Zustand: <b>${escapeHtml(resolution.targetConditionSnapshot.applied.name)}</b></span>`
    : '';
  const mechanicNotes = (Array.isArray(resolution.mechanicNotes) ? resolution.mechanicNotes : [])
    .map(note => `<span><b>Waffenregel:</b> ${escapeHtml(note)}</span>`).join('');
  const effectResults = (Array.isArray(resolution.effectResults) ? resolution.effectResults : []).map(renderEffectResult).filter(Boolean).join('');
  const ruleConflicts = (Array.isArray(resolution.ruleConflicts) ? resolution.ruleConflicts : []).map(conflict => `<span class="combat-rule-conflict"><b>Regelkonflikt:</b> ${escapeHtml((conflict.applications || []).map(item => item.ruleName).join(' ↔ ') || conflict.message || 'gleichrangige Regeln')} · Entscheidung durch Beteiligte oder Erzähler</span>`).join('');
  const defeatNotice = resolution.defeat?.occurred
    ? `<span><b>Kampfunfähig${resolution.defeat.nonlethal ? ' · nichttödlich' : ''}</b> · kein automatischer Tod; die weitere Darstellung entscheiden die Beteiligten.</span>`
    : '';
  const savingThrowMode = attack.resolutionMode === 'saving-throw';
  const rollLabel = savingThrowMode ? 'Rettungswurf' : (attack.resolutionMode === 'spell-attack' ? 'Zauberangriff' : 'Angriff');
  const defenseLabel = savingThrowMode ? 'Zauber-SG' : 'Verteidigung';
  return `
    <details class="combat-evaluation" data-state="${state}" data-narration-source="${narrationSource.key}" aria-label="Kampfauswertung">
      <summary class="combat-evaluation-summary">
        ${renderEvaluationActors(resolution.actorId, resolution.actorName, resolution.targetId, resolution.targetName)}
        <strong class="combat-evaluation-summary-label">${escapeHtml(getEvaluationLabel(resolution))}</strong>
        <span class="combat-evaluation-toggle-icon" aria-hidden="true"></span>
      </summary>
      <div class="combat-evaluation-body">
        <div class="combat-evaluation-heading">
          <span>Kampfauswertung${Number(resolution.multiTargetCount) > 1 ? ` · Ziel ${Number(resolution.multiTargetIndex) + 1}/${Number(resolution.multiTargetCount)}` : ''}</span>
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
          ${ammunitionUse}
          ${ruleResourceChanges}
          ${secondarySaves}
          ${followUpAttacks}
          ${appliedCondition}
          ${mechanicNotes}
          ${effectResults}
          ${ruleConflicts}
          ${defeatNotice}
          ${ruleLedger}
        </div>
        <div class="combat-evaluation-source" data-source="${narrationSource.key}" title="${escapeHtml(narrationSource.title)}">${escapeHtml(narrationSource.label)}</div>
      </div>
    </details>`;
}

export const combatUiInternals = Object.freeze({
  optionLabel,
  getEvaluationLabel,
  getEvaluationFallback,
  getNarrationSourceMeta,
  getEvaluationPortrait,
  renderEvaluationActors,
  activationLabel,
  aggregateCosts,
  buildPaymentResourceCards,
  classifyPaymentResourceCards,
  getCombatDisplayStats,
  getMagicDisplayStats,
  renderWeaponLoadout,
  isMagicSegmentKind,
  isSpellSlotResource
});
