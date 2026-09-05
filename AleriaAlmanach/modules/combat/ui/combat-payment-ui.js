import { getCombatResourceIconPresentation } from '../combat-resource-icons.js?v=20260803-composer-design-v1';
import { COMBAT_ACTION_RESOURCE_DEFINITIONS } from '../combat-action-economy.js?v=20260905-resource-balance-v2';
import { getSpellSlotLevel, isSpellSlotResource as isConfiguredSpellSlotResource } from '../combat-spell-slots.js?v=20260803-character-creation-v1';

const ACTION_RESOURCE_IDS = new Set(COMBAT_ACTION_RESOURCE_DEFINITIONS.map(resource => resource.id));
const MAGIC_SEGMENT_KINDS = new Set(['spell', 'prayer', 'song']);
const MAGIC_RESOURCE_PATTERN = /mana|fokus|zauber.?platz|spell.?slot|magie/i;
const PAYMENT_MODE_LABELS = Object.freeze({ standard: 'Regulär', aura: 'Aura-Fokus', 'mana-substitute': 'Mana ersetzen' });

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
}

export function isMagicSegmentKind(value = '') {
  return MAGIC_SEGMENT_KINDS.has(String(value || ''));
}

export function isSpellSlotResource(resource = {}, actor = {}) {
  const slotIds = Array.isArray(actor.magic?.slotResourceIds) ? actor.magic.slotResourceIds.map(String) : [];
  return isConfiguredSpellSlotResource(resource, slotIds);
}

function isManaResource(resource = {}) {
  const resourceText = `${resource.id || ''} ${resource.name || ''}`.toLocaleLowerCase('de');
  return String(resource.id || '') !== 'aura-focus' && (String(resource.id || '') === 'mana-focus'
    || /mana/.test(resourceText) || (/fokus/.test(resourceText) && resource.category === 'magic'));
}

export function aggregateCosts(costs = []) {
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

export function buildPaymentResourceCards({ actor = {}, paymentOptions = [], paymentMode = 'standard', paymentConfirmed = false, segmentKind = 'combataction' } = {}) {
  const resources = Array.isArray(actor.resources) ? actor.resources : [];
  const resourcesById = new Map(resources.map(resource => [String(resource?.id || ''), { ...resource, configured: true }]));
  COMBAT_ACTION_RESOURCE_DEFINITIONS.forEach(definition => {
    if (!resourcesById.has(definition.id)) resourcesById.set(definition.id, { ...definition, current: 0, maximum: 0, configured: false });
  });
  const options = new Map((Array.isArray(paymentOptions) ? paymentOptions : []).map(option => [option.mode, {
    ...option, costsByResource: aggregateCosts(option.costs)
  }]));
  const visibleIds = [...ACTION_RESOURCE_IDS];
  options.forEach(option => option.costsByResource.forEach((_cost, id) => visibleIds.push(id)));
  if (isMagicSegmentKind(segmentKind)) {
    resources.filter(resource => ['magic', 'aura', 'celestial', 'infernal', 'focus', 'pact'].includes(resource?.category)
      || MAGIC_RESOURCE_PATTERN.test(`${resource?.id || ''} ${resource?.name || ''}`))
      .filter(resource => !isSpellSlotResource(resource, actor))
      .forEach(resource => visibleIds.push(String(resource.id || '')));
  }
  return [...new Set(visibleIds)].map(resourceId => {
    // A shared resource can occur in several complete payment bundles. Prefer the
    // selected bundle so its amount and reserved state remain accurate.
    const option = [options.get(paymentMode), ...options.values()]
      .find(candidate => candidate?.costsByResource.has(resourceId));
    const cost = option?.costsByResource.get(resourceId);
    const resource = resourcesById.get(resourceId) || { id: resourceId, name: cost?.name || 'Ressource', current: 0, maximum: 0, configured: false };
    const mode = option?.mode || '';
    const sufficient = option?.payment?.sufficient !== false;
    return {
      resource, mode, cost: Number(cost?.amount) || 0, required: !!cost, sufficient,
      selected: mode === paymentMode,
      confirmed: !!cost && mode === paymentMode && paymentConfirmed,
      missingName: option?.payment?.missing?.name || '',
      actionable: !!cost && sufficient && !actor.cheats?.enabled
    };
  });
}

export function classifyPaymentResourceCards(cards = [], actor = {}, magic = false) {
  const groups = { actions: [], mana: [], spellSlots: [], otherResources: [] };
  (Array.isArray(cards) ? cards : []).forEach(card => {
    if (ACTION_RESOURCE_IDS.has(String(card?.resource?.id || ''))) groups.actions.push(card);
    else if (magic && isSpellSlotResource(card.resource, actor)) groups.spellSlots.push(card);
    else if (magic && isManaResource(card.resource)) groups.mana.push(card);
    else groups.otherResources.push(card);
  });
  groups.spellSlots.sort((first, second) => (getSpellSlotLevel(first.resource) ?? 999) - (getSpellSlotLevel(second.resource) ?? 999));
  return groups;
}

function renderResourceIcon(resource = {}) {
  const icon = getCombatResourceIconPresentation(resource);
  return `<span class="combat-payment-icon" aria-hidden="true"><b>${escapeHtml(icon.fallback)}</b>${icon.source ? `<img src="${escapeHtml(icon.source)}" alt="" loading="lazy" decoding="async">` : ''}</span>`;
}

export function renderPaymentResourceCard(card = {}) {
  const { resource = {} } = card;
  const current = Math.max(0, Number(resource.current) || 0);
  const maximum = Math.max(0, Number(resource.maximum) || 0);
  const reserved = card.confirmed && card.selected;
  const remaining = Math.max(0, current - (reserved ? card.cost : 0));
  const unavailable = resource.configured === false || maximum <= 0;
  const state = unavailable ? 'unavailable' : (reserved ? 'reserved' : (card.selected && card.required ? 'required' : 'available'));
  const description = unavailable ? 'Im Kampfbogen nicht verfügbar'
    : (reserved ? `${card.cost} reserviert · ${remaining} danach verfügbar` : `${current} von ${maximum} verfügbar`);
  return `<span class="combat-payment-resource" data-resource-id="${escapeHtml(resource.id)}" data-state="${state}" title="${escapeHtml(description)}">
    ${renderResourceIcon(resource)}
    <span class="combat-payment-resource-name">${escapeHtml(resource.name || 'Ressource')}</span>
    <span class="combat-payment-resource-count"><b>${remaining}</b><small>/${maximum}</small>${reserved ? `<span class="combat-payment-resource-reserved">${card.cost} reserviert</span>` : ''}</span>
  </span>`;
}

export function renderResourceGroup({ title, cards = [], className = '' } = {}) {
  if (!cards.length) return '';
  return `<div class="combat-payment-reserve-group ${escapeHtml(className)}" aria-label="${escapeHtml(title)}">${cards.map(renderPaymentResourceCard).join('')}</div>`;
}

export function renderCostSummary(cards = [], cheatEnabled = false) {
  const costs = cards.filter(card => card.required && card.selected && card.cost > 0);
  if (cheatEnabled) return '<span class="combat-payment-free">Alle Kosten aufgehoben</span>';
  if (!costs.length) return '<span class="combat-payment-free">Keine Ressourcenkosten</span>';
  return costs.map(card => `<span class="combat-payment-cost" data-resource-id="${escapeHtml(card.resource.id)}">
    ${renderResourceIcon(card.resource)}<span><b>${escapeHtml(card.cost)}</b> ${escapeHtml(card.resource.name || 'Ressource')}</span>
  </span>`).join('');
}

function renderPaymentModes({ paymentOptions, paymentMode, paymentConfirmed, actorReady }) {
  if (paymentOptions.length < 2) return '';
  return `<div class="combat-payment-modes" role="group" aria-label="Bezahlart">
    <span class="combat-payment-mode-label">Bezahlen mit</span>
    ${paymentOptions.map(option => {
      const selected = option.mode === paymentMode;
      const reserved = selected && paymentConfirmed;
      const sufficient = option.payment?.sufficient !== false;
      const disabled = !reserved && (!actorReady || !sufficient);
      const costs = [...aggregateCosts(option.costs).values()].filter(cost => cost.amount > 0)
        .map(cost => `${cost.amount} ${cost.name || cost.resourceId}`).join(' + ');
      const description = reserved ? 'Reservierung aufheben'
        : (sufficient ? `Kostenpaket reservieren: ${costs || 'keine Kosten'}` : `Nicht genug ${option.payment?.missing?.name || 'Ressourcen'}`);
      return `<button type="button" class="combat-payment-mode" data-combat-controller-action="choose-payment" data-payment-mode="${escapeHtml(option.mode)}" aria-pressed="${selected}"${disabled ? ' disabled' : ''} title="${escapeHtml(description)}">
        ${escapeHtml(PAYMENT_MODE_LABELS[option.mode] || option.mode)}${reserved ? '<small>reserviert</small>' : ''}
      </button>`;
    }).join('')}
  </div>`;
}

export function renderPaymentPanel({ actor = {}, cards = [], groups, magic = false, paymentOptions = [], paymentMode = 'standard', paymentConfirmed = false, actorReady = true, payment = null } = {}) {
  const cheatEnabled = actor.cheats?.enabled === true;
  const selectedOption = paymentOptions.find(option => option.mode === paymentMode);
  const selectedPayment = payment || selectedOption?.payment;
  const sufficient = selectedPayment?.sufficient !== false;
  const paymentState = cheatEnabled ? 'cheat' : (paymentConfirmed ? 'confirmed' : (sufficient ? 'ready' : 'missing'));
  const resourceGroups = groups || classifyPaymentResourceCards(cards, actor, magic);
  // Derive the summary from the authoritative selected bundle, including shared
  // costs such as action + substitute mana or limited technique uses + aura.
  const costCards = selectedOption ? [...aggregateCosts(selectedOption.costs).values()].map(cost => ({
    resource: cards.find(card => card.resource.id === cost.resourceId)?.resource || { id: cost.resourceId, name: cost.name },
    cost: cost.amount, selected: true, required: true
  })) : cards;
  const hasCosts = costCards.some(card => card.selected && card.required && card.cost > 0);
  const status = cheatEnabled ? 'Spielleiter-Cheat · keine Kosten' : (!sufficient ? `Nicht genug ${selectedPayment?.missing?.name || 'Ressourcen'}`
    : (paymentConfirmed ? (hasCosts ? 'Kosten reserviert' : 'Handlung vorgemerkt') : ''));
  const buttonLabel = paymentConfirmed ? (hasCosts ? 'Reservierung aufheben' : 'Vormerkung aufheben') : (hasCosts ? 'Kosten reservieren' : 'Handlung vormerken');
  const buttonDisabled = !paymentConfirmed && (!actorReady || !sufficient);
  const otherCards = [...(resourceGroups.mana || []), ...(resourceGroups.otherResources || [])];
  return `<section class="combat-payment-card" data-state="${paymentState}" aria-label="${magic ? 'Zauberkosten und Ressourcen' : 'Kosten und Ressourcen'}">
    <div class="combat-payment-selection">
      <div class="combat-payment-costs"><span class="combat-payment-heading">Kosten dieser Handlung</span><div class="combat-payment-cost-list">${renderCostSummary(costCards, cheatEnabled)}</div></div>
      <div class="combat-payment-confirmation">
        ${cheatEnabled ? '' : `<button type="button" class="combat-payment-confirm" data-role="payment-toggle" data-combat-controller-action="${paymentConfirmed ? 'release-payment' : 'confirm-payment'}"${buttonDisabled ? ' disabled' : ''}>${buttonLabel}</button>`}
        ${status ? `<span class="combat-payment-status" role="status">${escapeHtml(status)}</span>` : ''}
      </div>
    </div>
    ${cheatEnabled ? '' : renderPaymentModes({ paymentOptions, paymentMode, paymentConfirmed, actorReady })}
    <div class="combat-payment-reserves"><span class="combat-payment-heading">Verfügbare Ressourcen</span>
      ${renderResourceGroup({ title: 'Aktion, Bonusaktion, Reaktion, besondere Aktion und Aura', cards: resourceGroups.actions || [] })}
      ${renderResourceGroup({ title: magic ? 'Magische Ressourcen' : 'Weitere Kampfressourcen', cards: otherCards })}
    </div>
  </section>`;
}
