import { getCombatResourceIconPresentation } from '../combat-resource-icons.js?v=20260803-composer-design-v1';
import { COMBAT_ACTION_RESOURCE_DEFINITIONS } from '../combat-action-economy.js?v=20260807-magic-system-v1';
import {
  getSpellLevelLabel,
  getSpellSlotLevel,
  isSpellSlotResource as isConfiguredSpellSlotResource
} from '../combat-spell-slots.js?v=20260803-character-creation-v1';

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
    // Zauberplätze werden hier bewusst nicht mehr als eigene Kostenkarten angezeigt - sie
    // zeigen nur noch (über den Grad-Auswahl-Dropdown der Handlung) welcher Zaubergrad
    // freigeschaltet ist, verbrauchen aber selbst nichts mehr. Nur echte Ressourcenpools
    // (Mana, Fokus, Celestiale/Infernale/Paktpunkte) tauchen hier auf.
    resources.filter(resource => ['magic', 'aura', 'celestial', 'infernal', 'focus', 'pact'].includes(resource?.category)
      || MAGIC_RESOURCE_PATTERN.test(`${resource?.id || ''} ${resource?.name || ''}`))
      .filter(resource => !isSpellSlotResource(resource, actor))
      .forEach(resource => visibleIds.push(String(resource.id || '')));
  }

  return [...new Set(visibleIds)].map(resourceId => {
    const standardOption = options.get('standard');
    const auraOption = options.get('aura');
    const substituteOption = options.get('mana-substitute');
    const standardCost = standardOption?.costsByResource.get(resourceId) || null;
    const auraCost = auraOption?.costsByResource.get(resourceId) || null;
    const substituteCost = substituteOption?.costsByResource.get(resourceId) || null;
    const mode = standardCost ? 'standard' : (auraCost ? 'aura' : (substituteCost ? 'mana-substitute' : ''));
    const option = mode ? options.get(mode) : null;
    const resource = resourcesById.get(resourceId) || {
      id: resourceId,
      name: standardCost?.name || auraCost?.name || substituteCost?.name || 'Ressource',
      current: 0,
      maximum: 0,
      configured: false
    };
    const cost = standardCost || auraCost || substituteCost;
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
        ${renderResourceGroup({ title: 'Mana', kicker: 'magische Energie', cards: groups.mana, variant: 'pool', className: 'combat-resource-group--mana' })}
        ${renderResourceGroup({ title: 'Weitere magische Reserven', kicker: 'fokus · celestial · infernal · pakt', cards: groups.otherResources, variant: 'pool', className: 'combat-resource-group--arcane' })}
      </div>`
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
  const selectedTargetIds = new Set((segment?.combatTargetIds || [selectedTargetId]).map(String).filter(Boolean));
  const selectedActionId = String(segment?.combatActionId || actor.profileActionId || '');
  const segmentKind = String(segment?.kind || 'combataction');
  const magic = isMagicSegmentKind(segmentKind);
  composer.classList.add(magic ? 'combat-composer--magic' : 'combat-composer--martial');
  composer.dataset.combatKind = magic ? 'magic' : 'martial';
  const paymentMode = actor.cheats?.enabled ? 'cheat' : (['aura', 'mana-substitute', 'cheat'].includes(segment?.combatPaymentMode) ? segment.combatPaymentMode : 'standard');
  const rollMode = ['advantage', 'disadvantage'].includes(segment?.combatRollMode) ? segment.combatRollMode : 'normal';
  const weaponGrip = actor.supportsVersatileGrip && String(segment?.combatWeaponGrip || actor.weaponGrip) === 'two-handed'
    ? 'two-handed'
    : 'one-handed';
  const supportsMultipleTargets = (actor.selectedAction?.effects || []).some(effect => ['selected', 'allies', 'enemies', 'all'].includes(String(effect?.target || '')));
  const targetOptions = targets.map(target => {
    const ready = target.totalDefense != null && Number.isFinite(Number(target.totalDefense));
    return `<option value="${escapeHtml(target.characterId)}"${selectedTargetIds.has(String(target.characterId)) ? ' selected' : ''}${ready ? '' : ' disabled'}>${escapeHtml(optionLabel(target))}</option>`;
  }).join('');
  const actionOptions = (actor.actions || []).map(action => (
    `<option value="${escapeHtml(action.id)}"${action.id === selectedActionId ? ' selected' : ''}${action.compatible === false ? ' disabled' : ''}>${escapeHtml(activationLabel(action.activationType))} · ${escapeHtml(action.kindLabel)} · ${escapeHtml(action.name)}${action.spellLevelLabel ? ` · ${escapeHtml(action.spellLevelLabel)}` : ''}${action.formula ? ` · ${escapeHtml(action.formula.toUpperCase().replace(/D/g, 'W'))}` : ''}${action.compatible === false ? ` · ${action.kind === 'equipment-switch' ? 'bereits aktiv' : 'nicht mit aktiver Waffe möglich'}` : ''}</option>`
  )).join('');
  const spellAction = actor.selectedAction?.spellLevel != null ? actor.selectedAction : null;
  const selectedCastLevel = spellAction?.isCantrip ? 0 : Math.max(Number(spellAction?.spellLevel) || 1, Number(segment?.combatCastLevel) || Number(spellAction?.castLevel) || 1);
  const maximumCastLevel = spellAction ? Math.max(Number(spellAction.spellLevel) || 0, Math.min(10, Number(spellAction.upcast?.maximumLevel) || 10)) : 0;
  const castLevelOptions = spellAction ? Array.from({ length: maximumCastLevel - Number(spellAction.spellLevel) + 1 }, (_entry, index) => {
    const level = Number(spellAction.spellLevel) + index;
    const slot = actor.resources?.find(resource => getSpellSlotLevel(resource) === level);
    const disabled = level > 0 && (!slot || Number(slot.current) < 1);
    return `<option value="${level}"${level === selectedCastLevel ? ' selected' : ''}${disabled ? ' disabled' : ''}>${escapeHtml(getSpellLevelLabel(level))}${level > Number(spellAction.spellLevel) ? ' · höherstufig' : ''}${slot ? ` · ${escapeHtml(slot.current)}/${escapeHtml(slot.maximum)}` : ''}</option>`;
  }).join('') : '';
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
      <label class="combat-target-field">${supportsMultipleTargets ? 'Ziele' : 'Ziel'}
        <input type="search" data-combat-target-search placeholder="Ziel suchen …" autocomplete="off">
        <select data-combat-input="${supportsMultipleTargets ? 'targetIds' : 'targetId'}"${supportsMultipleTargets ? ' multiple size="4"' : ''}>
          <option value="">Ziel wählen</option>
          ${targetOptions}
        </select>
        ${supportsMultipleTargets ? '<small>Mehrere Ziele dürfen gemeinsam gewählt werden; Kosten und Munition fallen nur einmal an.</small>' : ''}
      </label>
      ${magic && spellAction ? `<label>Wirkungsgrad<select data-combat-input="castLevel">${castLevelOptions}</select></label>` : ''}
      <label>Wurf
        <select data-combat-input="rollMode">
          <option value="normal"${rollMode === 'normal' ? ' selected' : ''}>Normal</option>
          <option value="advantage"${rollMode === 'advantage' ? ' selected' : ''}>Vorteil</option>
          <option value="disadvantage"${rollMode === 'disadvantage' ? ' selected' : ''}>Nachteil</option>
        </select>
      </label>
      ${!magic && actor.supportsVersatileGrip ? `<label>Führung
        <select data-combat-input="weaponGrip">
          <option value="one-handed"${weaponGrip === 'one-handed' ? ' selected' : ''}>Einhändig · ${escapeHtml(actor.selectedAction?.baseDamageFormula || actor.weapon?.damageFormula || '')}</option>
          <option value="two-handed"${weaponGrip === 'two-handed' ? ' selected' : ''}>Zweihändig · ${escapeHtml(actor.selectedAction?.weapon?.versatileDamageFormula || '')}</option>
        </select>
      </label>` : ''}
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
  isMagicSegmentKind,
  isSpellSlotResource
});
