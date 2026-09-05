import assert from 'node:assert/strict';
import test from 'node:test';
import { getActionPaymentCosts } from '../modules/combat/combat-action-economy.js';
import { applyCombatResourceCosts } from '../modules/combat/combat-state-model.js';
import { buildPaymentResourceCards, renderPaymentPanel } from '../modules/combat/ui/combat-payment-ui.js';

function resource(id, name, current = 3, category = 'action') {
  return { id, name, current, maximum: 3, category };
}

function paymentView(actor, { mode = 'standard', confirmed = false, modes = ['standard'], actorReady = true, magic = false } = {}) {
  const paymentOptions = modes.map(paymentMode => {
    const costs = getActionPaymentCosts(actor.selectedAction, paymentMode, actor);
    return { mode: paymentMode, costs, payment: applyCombatResourceCosts(actor.resources, costs) };
  });
  const cards = buildPaymentResourceCards({ actor, paymentOptions, paymentMode: mode, paymentConfirmed: confirmed, segmentKind: magic ? 'spell' : 'combataction' });
  return {
    cards,
    html: renderPaymentPanel({ actor, cards, paymentOptions, paymentMode: mode, paymentConfirmed: confirmed, actorReady, magic })
  };
}

function costChips(html) {
  return [...html.matchAll(/class="combat-payment-cost" data-resource-id="([^"]+)"[\s\S]*?<span><b>(\d+)<\/b>/g)]
    .map(([, id, amount]) => [id, Number(amount)]);
}

test('der kompakte Kostenblock reserviert ein vollständiges Paket und bietet eine ausdrückliche Aufhebung', () => {
  const actor = {
    resources: [resource('action', 'Aktion'), resource('special-action', 'Besondere Aktion')],
    selectedAction: { costs: [{ resourceId: 'action', amount: 1 }, { resourceId: 'special-action', amount: 1 }] }
  };
  const unreserved = paymentView(actor).html;
  assert.deepEqual(costChips(unreserved), [['action', 1], ['special-action', 1]]);
  assert.match(unreserved, /data-role="payment-toggle" data-combat-controller-action="confirm-payment">Kosten reservieren/);
  const reserved = paymentView(actor, { confirmed: true }).html;
  assert.match(reserved, /data-role="payment-toggle" data-combat-controller-action="release-payment">Reservierung aufheben/);
  assert.match(reserved, /data-resource-id="special-action" data-state="reserved"/);
  assert.match(reserved, /1 reserviert · 2 danach verfügbar/);
  assert.match(reserved, /combat-payment-resource-count"><b>2<\/b><small>\/3<\/small>/);
});

test('Aura zeigt und reserviert weiterhin begrenzte Techniknutzungen aus ihrem vollständigen Paket', () => {
  const actor = {
    resources: [resource('action', 'Aktion'), resource('aura-focus', 'Aura-Fokuspunkt'), resource('dragon-use', 'Drachenruf', 2, 'technique-use')],
    selectedAction: { costs: [{ resourceId: 'action', amount: 1 }, { resourceId: 'dragon-use', name: 'Drachenruf', amount: 1 }] }
  };
  const { cards, html } = paymentView(actor, { modes: ['standard', 'aura'], mode: 'aura', confirmed: true });
  assert.deepEqual(costChips(html), [['aura-focus', 1], ['dragon-use', 1]]);
  assert.equal(cards.find(card => card.resource.id === 'dragon-use').confirmed, true);
  assert.equal(cards.find(card => card.resource.id === 'action').confirmed, false);
  assert.match(html, /data-payment-mode="aura" aria-pressed="true"/);
  assert.match(html, /data-combat-controller-action="choose-payment" data-payment-mode="standard"/);
});

test('Manaersatz behält gemeinsame Aktionskosten und aktualisiert deren Reservierungsanzeige', () => {
  const actor = {
    resources: [resource('action', 'Aktion'), resource('mana-focus', 'Mana', 0, 'magic'), resource('celestial-points', 'Celestiale Punkte', 3, 'celestial')],
    magic: { bypassResourceId: 'celestial-points' },
    selectedAction: { costs: [{ resourceId: 'action', amount: 1 }, { resourceId: 'mana-focus', amount: 2 }] }
  };
  const { cards, html } = paymentView(actor, { modes: ['standard', 'mana-substitute'], mode: 'mana-substitute', confirmed: true, magic: true });
  assert.deepEqual(costChips(html), [['action', 1], ['celestial-points', 2]]);
  assert.equal(cards.find(card => card.resource.id === 'action').confirmed, true);
  assert.match(html, /data-payment-mode="standard" aria-pressed="false" disabled/);
  assert.match(html, /data-payment-mode="mana-substitute" aria-pressed="true"/);
  assert.match(html, /data-combat-controller-action="release-payment">Reservierung aufheben/);
});

test('fehlende Ressourcen und unvollständige Profile sperren Vormerkungen, aber niemals deren Aufhebung', () => {
  const actor = { resources: [resource('action', 'Aktion', 0)], selectedAction: { activationType: 'action' } };
  const insufficient = paymentView(actor).html;
  assert.match(insufficient, /data-combat-controller-action="confirm-payment" disabled/);
  assert.match(insufficient, /role="status">Nicht genug Aktion/);
  actor.resources[0].current = 1;
  assert.match(paymentView(actor, { actorReady: false }).html, /data-combat-controller-action="confirm-payment" disabled/);
  assert.match(paymentView(actor, { actorReady: false, confirmed: true }).html, /data-combat-controller-action="release-payment">/);
});

test('kostenlose Handlungen bleiben vormerkbar und Cheatmodus benötigt keine Reservierung', () => {
  const actor = { resources: [], selectedAction: { activationType: 'passive' } };
  const free = paymentView(actor).html;
  assert.deepEqual(costChips(free), []);
  assert.match(free, /data-combat-controller-action="confirm-payment">Handlung vormerken/);
  assert.match(paymentView(actor, { confirmed: true }).html, /data-combat-controller-action="release-payment">Vormerkung aufheben/);
  const cheat = paymentView({ ...actor, cheats: { enabled: true } }).html;
  assert.match(cheat, /Alle Kosten aufgehoben/);
  assert.doesNotMatch(cheat, /data-combat-controller-action/);
});

test('die Ressourcenübersicht bewahrt vollständige Namen, maskiert Fremdtext und zeigt keine bloßen Zaubergradfreigaben als Kosten', () => {
  const actor = {
    resources: [resource('mana-focus', 'Mana <Fokus>', 3, 'magic'), resource('slot-1', 'Zauberplatz I', 1, 'magic')],
    magic: { slotResourceIds: ['slot-1'] },
    selectedAction: { costs: [{ resourceId: 'mana-focus', amount: 2 }] }
  };
  const { html } = paymentView(actor, { magic: true });
  assert.match(html, /Mana &lt;Fokus&gt;/);
  assert.match(html, /Aura-Fokuspunkt/);
  assert.match(html, /Besondere Aktion/);
  assert.doesNotMatch(html, /data-resource-id="slot-1"/);
  assert.deepEqual(costChips(html), [['mana-focus', 2]]);
});
