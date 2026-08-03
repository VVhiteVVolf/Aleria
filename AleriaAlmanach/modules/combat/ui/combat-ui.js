import { getCombatResourceIconPresentation } from '../combat-resource-icons.js?v=20260803-composer-design-v1';
import { COMBAT_ACTION_RESOURCE_DEFINITIONS } from '../combat-action-economy.js?v=20260803-economy-audit-v1';
import {
  getSpellLevelLabel,
  getSpellSlotLevel,
  isSpellSlotResource as isConfiguredSpellSlotResource
} from '../combat-spell-slots.js?v=20260803-economy-audit-v1';

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const ACTION_RESOURCE_IDS = Object.freeze(['action', 'bonus-action', 'reaction', 'special-action', 'aura-focus']);
const MAGIC_RESOURCE_PATTERN = /mana|fokus|zauber.?platz|spell.?slot|magie/i;
const MAGIC_SEGMENT_KINDS = new Set(['spell', 'prayer', 'song']);

function isMagicSegmentKind(value = '') {
  return MAGIC_SEGMENT_KINDS.has(String(value || ''));
}

function isSpellSlotResource(resource = {}, actor = {}) {
  const configuredSlotIds = Array.isArray(actor.magic?.slotResourceIds)
    ? actor.magic.slotResourceIds.map(String)
    : [];
  return isConfiguredSpellSlotResource(resource, configuredSlotIds);
}

function isManaResource(resource = {}) {
  const resourceText = `${resource.id || ''} ${resource.name || ''}`.toLocaleLowerCase('de');
  if (String(resource.id || '') === 'aura-focus') return false;
  return String(resource.id || '') === 'mana-focus'
    || /mana/.test(resourceText)
    || (/fokus/.test(resourceText) && resource.category === 'magic');
}

function aggregateCosts(costs = []) {
  const result = new Map();
  (Array.isArray(costs) ? costs : []).forEach(cost => {
    const resourceId = String(cost?.resourceId || '');
    if (!resourceId) return;
    const previous = result.get(resourceId) || { ...cost, amount: 0 };
    previous.amount += Math.max(0, Number(cost.amount) || 0);
    result.set(resourceId, previous);
  });
  return result;
}

function buildPaymentResourceCards({ actor = {}, paymentOptions = [], paymentMode = 'standard', paymentConfirmed = false, segmentKind = 'combataction' } = {}) {
  const resources = Array.isArray(actor.resources) ? actor.resources : [];
  const resourcesById = new Map(resources.map(resource => [String(resource?.id || ''), { ...resource, configured: true }]));
  COMBAT_ACTION_RESOURCE_DEFINITIONS.forEach(definition => {
    if (!resourcesById.has(definition.id)) resourcesById.set(definition.id, {
      ...definition,
      current: 0,
      maximum: 0,
      configured: false
    });
  });
  const options = new Map((Array.isArray(paymentOptions) ? paymentOptions : []).map(option => [option.mode, {
    ...option,
    costsByResource: aggregateCosts(option.costs)
  }]));
  const visibleIds = [...COMBAT_ACTION_RESOURCE_DEFINITIONS.map(resource => resource.id)];
  options.forEach(option => option.costsByResource.forEach((_cost, resourceId) => visibleIds.push(resourceId)));

  const magic = isMagicSegmentKind(segmentKind);
  if (magic) {
    resources.filter(resource => ['magic', 'aura', 'celestial', 'infernal'].includes(resource?.category)
      || MAGIC_RESOURCE_PATTERN.test(`${resource?.id || ''} ${resource?.name || ''}`))
      .forEach(resource => visibleIds.push(String(resource.id || '')));
    const configuredSlotIds = Array.isArray(actor.magic?.slotResourceIds) ? actor.magic.slotResourceIds.map(String) : [];
    configuredSlotIds.forEach(resourceId => visibleIds.push(resourceId));
    const hasSpellSlot = resources.some(resource => configuredSlotIds.includes(String(resource?.id || ''))
      || /zauber.?platz|spell.?slot/i.test(`${resource?.id || ''} ${resource?.name || ''}`));
    if (!hasSpellSlot) {
      resourcesById.set('__missing-spell-slot__', {
        id: '__missing-spell-slot__', name: 'Zauberplatz', current: 0, maximum: 0,
        category: 'magic', configured: false
      });
      visibleIds.push('__missing-spell-slot__');
    }
  }

  return [...new Set(visibleIds)].map(resourceId => {
    const standardOption = options.get('standard');
    const auraOption = options.get('aura');
    const standardCost = standardOption?.costsByResource.get(resourceId) || null;
    const auraCost = auraOption?.costsByResource.get(resourceId) || null;
    const mode = standardCost ? 'standard' : (auraCost ? 'aura' : '');
    const option = mode ? options.get(mode) : null;
    const resource = resourcesById.get(resourceId) || {
      id: resourceId,
      name: standardCost?.name || auraCost?.name || 'Ressource',
      current: 0,
      maximum: 0,
      configured: false
    };
    const cost = standardCost || auraCost;
    const sufficient = option?.payment?.sufficient !== false;
    return {
      resource,
      mode,
      cost: Number(cost?.amount) || 0,
      required: !!cost,
      sufficient,
      selected: mode === paymentMode,
      confirmed: !!cost && mode === paymentMode && paymentConfirmed,
      missingName: option?.payment?.missing?.name || '',
      actionable: !!cost && sufficient && !actor.cheats?.enabled
    };
  });
}

function classifyPaymentResourceCards(cards = [], actor = {}, magic = false) {
  const groups = {
    actions: [],
    mana: [],
    spellSlots: [],
    otherResources: []
  };
  (Array.isArray(cards) ? cards : []).forEach(card => {
    const resourceId = String(card?.resource?.id || '');
    if (ACTION_RESOURCE_IDS.includes(resourceId)) groups.actions.push(card);
    else if (magic && isSpellSlotResource(card.resource, actor)) groups.spellSlots.push(card);
    else if (magic && isManaResource(card.resource)) groups.mana.push(card);
    else groups.otherResources.push(card);
  });
  groups.spellSlots.sort((first, second) => (getSpellSlotLevel(first.resource) ?? 999) - (getSpellSlotLevel(second.resource) ?? 999));
  return groups;
}

function renderResourcePips(current, maximum) {
  if (maximum <= 0) return '';
  if (maximum > 12) return `<span class="combat-resource-card-pips combat-resource-card-pips--count">${escapeHtml(current)} von ${escapeHtml(maximum)} verfügbar</span>`;
  return `<span class="combat-resource-card-pips" aria-label="${escapeHtml(current)} von ${escapeHtml(maximum)} verfügbar">${Array.from({ length: maximum }, (_entry, index) => (
    `<i class="${index < current ? 'filled' : ''}" aria-hidden="true"></i>`
  )).join('')}</span>`;
}

function renderPaymentResourceCard(card = {}, { variant = 'standard' } = {}) {
  const { resource = {} } = card;
  const icon = getCombatResourceIconPresentation(resource);
  const current = Math.max(0, Number(resource.current) || 0);
  const maximum = Math.max(0, Number(resource.maximum) || 0);
  const unavailable = resource.configured === false || maximum <= 0;
  const classes = [
    'combat-resource-card',
    card.required ? 'required' : 'unused',
    card.selected ? 'selected' : '',
    card.confirmed ? 'confirmed' : '',
    !card.sufficient && card.required ? 'insufficient' : '',
    unavailable ? 'unavailable' : '',
    `combat-resource-card--${variant}`
  ].filter(Boolean).join(' ');
  const stateText = card.confirmed
    ? `Reserviert · ${current} → ${Math.max(0, current - card.cost)}`
    : (card.required
      ? (card.sufficient ? `Kosten −${card.cost} · anklicken` : `Nicht genug ${card.missingName || resource.name || 'Ressourcen'}`)
      : (unavailable ? 'Im Kampfbogen nicht verfügbar' : 'Für diese Aktion nicht benötigt'));
  const buttonAttributes = card.actionable
    ? ` data-combat-controller-action="choose-payment" data-payment-mode="${escapeHtml(card.mode)}" aria-pressed="${card.confirmed}"`
    : ' disabled aria-disabled="true"';
  const pips = ['slot', 'pool'].includes(variant) ? renderResourcePips(current, maximum) : '';
  const displayName = variant === 'slot' && getSpellSlotLevel(resource)
    ? getSpellLevelLabel(getSpellSlotLevel(resource))
    : (resource.name || 'Ressource');
  return `<button type="button" class="${classes}" data-resource-id="${escapeHtml(resource.id)}"${buttonAttributes} title="${escapeHtml(stateText)}">
    <span class="combat-resource-card-icon" aria-hidden="true"><b>${escapeHtml(icon.fallback)}</b>${icon.source ? `<img src="${escapeHtml(icon.source)}" alt="">` : ''}</span>
    <span class="combat-resource-card-name">${escapeHtml(displayName)}</span>
    <span class="combat-resource-card-value"><b>${escapeHtml(current)}</b><small>/ ${escapeHtml(maximum)}</small></span>
    ${pips}
    <span class="combat-resource-card-state">${escapeHtml(stateText)}</span>
  </button>`;
}

function renderResourceGroup({ title, kicker = '', cards = [], variant = 'standard', className = '' } = {}) {
  if (!cards.length) return '';
  return `<section class="combat-resource-group ${className}">
    <div class="combat-resource-group-heading"><span>${escapeHtml(title)}</span>${kicker ? `<small>${escapeHtml(kicker)}</small>` : ''}</div>
    <div class="combat-resource-grid">${cards.map(card => renderPaymentResourceCard(card, { variant })).join('')}</div>
  </section>`;
}

function renderCostSummary(cards = [], cheatEnabled = false) {
  const selectedCosts = cards.filter(card => card.required && card.selected);
  const content = cheatEnabled
    ? '<p>Alle Kosten aufgehoben</p>'
    : (selectedCosts.length
      ? selectedCosts.map(card => {
        const icon = getCombatResourceIconPresentation(card.resource);
        return `<div class="combat-cost-summary-item">
          <span aria-hidden="true"><b>${escapeHtml(icon.fallback)}</b>${icon.source ? `<img src="${escapeHtml(icon.source)}" alt="">` : ''}</span>
          <strong>${escapeHtml(card.resource.name || 'Ressource')}</strong><em>−${escapeHtml(card.cost)}</em>
        </div>`;
      }).join('')
      : '<p>Keine Kosten für diese Handlung</p>');
  return `<aside class="combat-cost-summary">
    <div class="combat-resource-group-heading"><span>Gewählte Kosten</span></div>
    ${content}
  </aside>`;
}

function signedNumber(value) {
  const number = Number(value) || 0;
  return number >= 0 ? `+${number}` : String(number);
}

function getMagicDisplayStats(actor = {}) {
  const resolutionMode = String(actor.actionResolutionMode || 'spell-attack');
  const spellLevel = Number(actor.selectedAction?.spellLevel);
  const cantrip = actor.selectedAction?.isCantrip === true || spellLevel === 0;
  return {
    saveDc: Number(actor.actionSpellSaveDc ?? actor.spellSaveDc) || 0,
    spellAttack: Number(actor.spellAttackModifier ?? actor.attackModifier) || 0,
    resolutionLabel: resolutionMode === 'saving-throw'
      ? 'Rettungswurf gegen Zauber-SG'
      : (resolutionMode === 'automatic' ? 'Automatische Wirkung' : 'Zauber-Trefferwurf'),
    spellLevelLabel: Number.isFinite(spellLevel) ? getSpellLevelLabel(spellLevel) : '',
    cantrip
  };
}

function getCombatDisplayStats(actor = {}) {
  const formula = String(actor.weapon?.damageFormula || '').toUpperCase().replace(/D/g, 'W');
  const damageModifier = Number(actor.damageModifier) || 0;
  return {
    attack: signedNumber(actor.attackModifier),
    damage: `${formula || '—'}${damageModifier ? ` ${signedNumber(damageModifier)}` : ''}`,
    activation: activationLabel(actor.selectedAction?.activationType)
  };
}

function optionLabel(profile = {}) {
  const defense = profile.totalDefense != null && Number.isFinite(Number(profile.totalDefense)) ? `VTD ${profile.totalDefense}` : 'Verteidigung fehlt';
  const hitPoints = profile.currentHitPoints != null && profile.maximumHitPoints != null
    ? ` · ${profile.currentHitPoints}/${profile.maximumHitPoints} TP`
    : '';
  return `${profile.name} · ${defense}${hitPoints}`;
}

function activationLabel(value = '') {
  return ({
    action: 'Aktion',
    'bonus-action': 'Bonusaktion',
    reaction: 'Reaktion',
    'special-action': 'Besondere Aktion',
    passive: 'Passiv'
  })[String(value || '')] || 'Aktion';
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

function renderMetricCard({ icon, label, value, note = '', tone = '' } = {}) {
  return `<article class="combat-composer-metric${tone ? ` combat-composer-metric--${escapeHtml(tone)}` : ''}">
    <span class="combat-composer-metric-icon" aria-hidden="true">${escapeHtml(icon)}</span>
    <span>${escapeHtml(label)}</span>
    <strong>${escapeHtml(value)}</strong>
    ${note ? `<small>${escapeHtml(note)}</small>` : ''}
  </article>`;
}

function renderCombatValueStrip(actor = {}) {
  const stats = getCombatDisplayStats(actor);
  return `<section class="combat-composer-values combat-composer-values--martial" aria-label="Kampfwerte">
    <div class="combat-resource-group-heading"><span>Kampfwerte</span><small>aus dem aktiven Profil</small></div>
    <div class="combat-composer-metrics">
      ${renderMetricCard({ icon: '⚔', label: 'Treffermodifikator', value: stats.attack, tone: 'attack' })}
      ${renderMetricCard({ icon: '✦', label: 'Schaden', value: stats.damage, note: actor.weapon?.damageType || '', tone: 'damage' })}
      ${renderMetricCard({ icon: '⌛', label: 'Aktionsart', value: stats.activation, tone: 'action' })}
    </div>
  </section>`;
}

function renderMagicValueStrip(actor = {}) {
  const stats = getMagicDisplayStats(actor);
  return `<section class="combat-composer-values combat-composer-values--magic" aria-label="Zauberwerte">
    <div class="combat-resource-group-heading"><span>Zauberwerte</span><small>aus Attribut, Kompetenz und Profilregeln</small></div>
    <div class="combat-composer-metrics">
      ${renderMetricCard({ icon: '✷', label: 'Zauber-SG', value: stats.saveDc, note: 'Schwierigkeit für Rettungswürfe', tone: 'save' })}
      ${renderMetricCard({ icon: '✧', label: 'Zauber-Treffer', value: signedNumber(stats.spellAttack), note: 'Modifikator des Zauberangriffs', tone: 'spell-attack' })}
      ${renderMetricCard({ icon: '◈', label: 'Auflösung', value: stats.resolutionLabel, note: stats.cantrip ? 'Zaubertrick · kein Mana oder Zauberplatz' : stats.spellLevelLabel, tone: 'resolution' })}
    </div>
  </section>`;
}

function renderPaymentPanel({ actor = {}, cards = [], groups = {}, magic = false, paymentState = 'ready', paymentStatus = '' } = {}) {
  const actionGroup = renderResourceGroup({
    title: 'Aktionsökonomie',
    kicker: 'Aura-Fokus ersetzt das gesamte reguläre Kostenpaket',
    cards: groups.actions,
    variant: 'action',
    className: 'combat-resource-group--actions'
  });
  const additionalGroups = magic
    ? `<div class="combat-magic-resource-row">
        ${renderResourceGroup({ title: 'Mana & Fokus', kicker: 'magische Energie', cards: groups.mana, variant: 'pool', className: 'combat-resource-group--mana' })}
        ${renderResourceGroup({ title: 'Weitere magische Reserven', kicker: 'celestial · infernal', cards: groups.otherResources, variant: 'pool', className: 'combat-resource-group--arcane' })}
      </div>
      ${renderResourceGroup({ title: 'Zauberplätze I–X', kicker: 'Zaubertricks verbrauchen keinen Platz', cards: groups.spellSlots, variant: 'slot', className: 'combat-resource-group--slots' })}`
    : renderResourceGroup({
      title: 'Weitere Kampfressourcen',
      kicker: 'nur falls die gewählte Handlung sie nutzt',
      cards: groups.otherResources,
      variant: 'pool',
      className: 'combat-resource-group--martial-extra'
    });
  return `<div class="combat-payment combat-payment--${magic ? 'magic' : 'martial'}" data-state="${escapeHtml(paymentState)}">
    <div class="combat-payment-head">
      <span>${magic ? 'Zauberkosten & Ressourcen' : 'Aktionsökonomie & Kosten'}</span>
      <strong>${escapeHtml(paymentStatus)}</strong>
    </div>
    <div class="combat-payment-layout">
      <div class="combat-payment-main">${actionGroup}${additionalGroups}</div>
      ${renderCostSummary(cards, actor.cheats?.enabled === true)}
    </div>
    <p>${actor.cheats?.enabled
      ? 'Alle Kosten entfallen; die Werte bleiben zur Übersicht sichtbar.'
      : 'Die gewählte Handlung bestimmt das vollständige Kostenpaket. Ein Klick auf eine markierte Ressource reserviert immer das ganze Paket; die Regeln selbst bleiben unverändert.'}</p>
  </div>`;
}

export function mountCombatComposer({ card, segment, actor, targets = [], ruleOptions = [], actorReady = false, actorProblem = '', payment = null, paymentOptions = [], paymentConfirmed = false, auraPaymentAvailable = false } = {}) {
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
  const magic = isMagicSegmentKind(segmentKind);
  composer.classList.add(magic ? 'combat-composer--magic' : 'combat-composer--martial');
  composer.dataset.combatKind = magic ? 'magic' : 'martial';
  const paymentMode = actor.cheats?.enabled ? 'cheat' : (['aura', 'cheat'].includes(segment?.combatPaymentMode) ? segment.combatPaymentMode : 'standard');
  const rollMode = ['advantage', 'disadvantage'].includes(segment?.combatRollMode) ? segment.combatRollMode : 'normal';
  const targetOptions = targets.map(target => {
    const ready = target.totalDefense != null && Number.isFinite(Number(target.totalDefense));
    return `<option value="${escapeHtml(target.characterId)}"${target.characterId === selectedTargetId ? ' selected' : ''}${ready ? '' : ' disabled'}>${escapeHtml(optionLabel(target))}</option>`;
  }).join('');
  const actionOptions = (actor.actions || []).map(action => (
    `<option value="${escapeHtml(action.id)}"${action.id === selectedActionId ? ' selected' : ''}${action.compatible === false ? ' disabled' : ''}>${escapeHtml(activationLabel(action.activationType))} · ${escapeHtml(action.kindLabel)} · ${escapeHtml(action.name)}${action.spellLevelLabel ? ` · ${escapeHtml(action.spellLevelLabel)}` : ''} · ${escapeHtml(action.formula.toUpperCase().replace(/D/g, 'W'))}${action.compatible === false ? ' · nicht mit aktiver Waffe möglich' : ''}</option>`
  )).join('');
  const paymentState = actor.cheats?.enabled ? 'cheat' : (paymentConfirmed && payment?.sufficient ? 'confirmed' : (payment?.sufficient ? 'ready' : 'missing'));
  const composerLabel = segmentKind === 'spell' ? 'Zauberhandlung' : (segmentKind === 'prayer' ? 'Gebetshandlung' : (segmentKind === 'song' ? 'Gesangshandlung' : 'Kampfhandlung'));
  const actionFieldLabel = segmentKind === 'spell' ? 'Aktiver Zauber' : (segmentKind === 'prayer' ? 'Aktives Gebet' : (segmentKind === 'song' ? 'Aktiver Gesang' : 'Aktiver Angriff'));
  const composerIcon = magic ? 'magic-action.png' : 'combat-action.png';
  const resourceCards = buildPaymentResourceCards({ actor, paymentOptions, paymentMode, paymentConfirmed, segmentKind });
  const resourceGroups = classifyPaymentResourceCards(resourceCards, actor, magic);
  const paymentStatus = actor.cheats?.enabled
    ? 'Spielleiter-Cheat · keine Kosten'
    : (paymentConfirmed ? 'Kosten reserviert' : (payment?.sufficient ? 'Markierte Ressource anklicken' : `Nicht genug ${payment?.missing?.name || 'Ressourcen'}`));
  const paymentPanel = renderPaymentPanel({
    actor,
    cards: resourceCards,
    groups: resourceGroups,
    magic,
    paymentState,
    paymentStatus
  });

  composer.innerHTML = `
    <div class="combat-composer-title">
      <div class="combat-composer-heading"><span aria-hidden="true"><img src="./public/assets/combat-profile-icons/${composerIcon}" alt=""></span><b>${composerLabel}</b></div>
      <strong>Ressource anklicken · würfelt beim Eintragen</strong>
    </div>
    <div class="combat-composer-fields combat-composer-fields--${magic ? 'magic' : 'martial'}">
      <label>${actionFieldLabel}
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
    ${magic ? renderMagicValueStrip(actor) : renderCombatValueStrip(actor)}
    ${paymentPanel}
    ${ruleOptions.length ? `<div class="combat-rule-selection">
      <div class="combat-payment-head"><span>Reaktionen & Eingriffe</span><strong>optional \u00b7 servergepr\u00fcft</strong></div>
      <p>Aktiviere nur Regeln, deren Besitzer du steuern darfst. Die Entfernung wird gegen den Regelradius gepr\u00fcft.</p>
      <div class="combat-rule-options">${ruleOptions.map(renderRuleOption).join('')}</div>
    </div>` : ''}
    <div class="combat-composer-equipment" data-state="${actorReady ? 'ready' : 'missing'}">
      <span>Profilquelle</span><strong>${escapeHtml(actor.name)}</strong>
      ${actorReady ? '' : `<small>${escapeHtml(actorProblem || actor.selectedAction?.disabledReason || 'Ergänze auf dem Charakter- oder Kreaturenbogen einen passenden Angriff mit Schadenswurf.')}</small>`}
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
  const ruleLedger = (Array.isArray(resolution.ruleApplications) ? resolution.ruleApplications : []).map(rule => (
    `<span class="combat-rule-ledger"><b>${escapeHtml(rule.sourceActorName || 'Regelquelle')} \u00b7 ${escapeHtml(rule.ruleName)}</b><small>${escapeHtml(summarizeRuleEffects(rule.effects))}</small></span>`
  )).join('');
  const ruleResourceChanges = (Array.isArray(resolution.ruleResourceSnapshots) ? resolution.ruleResourceSnapshots : [])
    .flatMap(snapshot => (snapshot.changes || []).map(change => (
      `<span>${escapeHtml(snapshot.sourceActorName || 'Reaktion')} \u00b7 ${escapeHtml(change.name || 'Ressource')}: <b>${escapeHtml(change.before)}</b> &rarr; <b>${escapeHtml(change.after)}</b></span>`
    ))).join('');
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
        ${ruleResourceChanges}
        ${ruleLedger}
      </div>
      <div class="combat-evaluation-source" data-source="${narrationSource.key}" title="${escapeHtml(narrationSource.title)}">${escapeHtml(narrationSource.label)}</div>
    </aside>`;
}

export const combatUiInternals = Object.freeze({
  optionLabel,
  getEvaluationLabel,
  getEvaluationFallback,
  getNarrationSourceMeta,
  activationLabel,
  aggregateCosts,
  buildPaymentResourceCards,
  classifyPaymentResourceCards,
  getCombatDisplayStats,
  getMagicDisplayStats,
  isMagicSegmentKind,
  isSpellSlotResource
});
