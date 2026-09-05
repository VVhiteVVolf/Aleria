import assert from 'node:assert/strict';
import test from 'node:test';
import { captureComposerViewState, restoreComposerViewState, filterCombatTargets } from '../modules/combat/ui/combat-composer-view-state.js';

function composerView({ paymentAction = 'confirm-payment', targets = [], multiple = false, searchValue = '' } = {}) {
  const ownerDocument = { activeElement: null };
  const controls = [];
  const details = [];
  function control(tagName, attributes = {}, properties = {}) {
    const element = {
      tagName, ownerDocument, disabled: false, ...properties,
      hasAttribute: name => Object.hasOwn(attributes, name),
      getAttribute: name => Object.hasOwn(attributes, name) ? attributes[name] : null,
      focus(options) { this.focusOptions = options; ownerDocument.activeElement = this; },
      setSelectionRange(start, end) { this.selectionStart = start; this.selectionEnd = end; }
    };
    controls.push(element);
    return element;
  }
  const search = control('INPUT', { 'data-combat-target-search': '' }, { type: 'search', value: searchValue, selectionStart: 0, selectionEnd: 0 });
  const target = control('SELECT', { 'data-combat-input': multiple ? 'targetIds' : 'targetId' }, {
    options: [{ value: '', textContent: 'Ziel wählen', hidden: false }, ...targets.map(name => ({ value: name, textContent: name, hidden: false }))]
  });
  const payment = control('BUTTON', { 'data-role': 'payment-toggle', 'data-combat-controller-action': paymentAction });
  const sword = control('BUTTON', { 'data-weapon-id': 'sword', 'data-combat-action-id': 'weapon:sword' });
  const dagger = control('BUTTON', { 'data-weapon-id': 'dagger', 'data-combat-action-id': 'equip:dagger' });
  function detail(key, open = false) {
    const entry = { dataset: { combatDetails: key }, open };
    const summary = control('SUMMARY');
    summary.closest = selector => selector === '[data-combat-details]' ? entry : null;
    entry.querySelector = selector => selector === 'summary' ? summary : null;
    details.push(entry);
    return entry;
  }
  const rules = detail('rules');
  const effects = detail('effects');
  const composer = {
    ownerDocument,
    contains: element => controls.includes(element),
    querySelector(selector) {
      if (selector === '[data-combat-target-search]') return search;
      if (selector === '[data-combat-input="targetId"], [data-combat-input="targetIds"]') return target;
      return null;
    },
    querySelectorAll(selector) {
      if (selector === '[data-combat-details]') return details;
      if (selector === 'input, select, button') return controls.filter(element => element.tagName !== 'SUMMARY');
      return [];
    }
  };
  return { composer, ownerDocument, search, target, payment, sword, dagger, rules, effects };
}

test('neu gerenderte Kampfhandlungen behalten offene und geschlossene Regeldetails sowie Summary-Fokus', () => {
  const previous = composerView();
  previous.rules.open = true;
  previous.rules.querySelector('summary').focus();
  const state = captureComposerViewState(previous.composer);
  const next = composerView();
  next.effects.open = true;
  restoreComposerViewState(next.composer, state);
  assert.equal(next.rules.open, true);
  assert.equal(next.effects.open, false);
  assert.equal(next.ownerDocument.activeElement, next.rules.querySelector('summary'));
  assert.deepEqual(next.ownerDocument.activeElement.focusOptions, { preventScroll: true });
});

test('Zielsuche, gefilterte Ziele, Cursor und Suchfokus bleiben bei der Neudarstellung erhalten', () => {
  const previous = composerView({ searchValue: ' GIL ', targets: ['Gawain Draig', 'Gildas Gafyr'], multiple: true });
  previous.search.setSelectionRange(1, 4);
  previous.search.focus();
  const state = captureComposerViewState(previous.composer);
  const next = composerView({ targets: ['Gawain Draig', 'Gildas Gafyr', 'Gilbert'], multiple: true });
  restoreComposerViewState(next.composer, state);
  assert.equal(next.search.value, ' GIL ');
  assert.deepEqual(next.target.options.map(option => option.hidden), [false, true, false, false]);
  assert.equal(next.ownerDocument.activeElement, next.search);
  assert.deepEqual([next.search.selectionStart, next.search.selectionEnd], [1, 4]);
});

test('Leeren der Zielsuche macht alle Einzelziele einschließlich Auswahlplatzhalter wieder sichtbar', () => {
  const view = composerView({ targets: ['Gawain Draig', 'Gildas Gafyr'] });
  filterCombatTargets(view.composer, 'gawain');
  assert.deepEqual(view.target.options.map(option => option.hidden), [false, false, true]);
  filterCombatTargets(view.composer, '   ');
  assert.deepEqual(view.target.options.map(option => option.hidden), [false, false, false]);
});

test('Fokus folgt dem Reservierungsbutton beim Wechsel von Bestätigen zu Aufheben', () => {
  const previous = composerView();
  previous.payment.focus();
  const state = captureComposerViewState(previous.composer);
  const next = composerView({ paymentAction: 'release-payment' });
  restoreComposerViewState(next.composer, state);
  assert.equal(next.ownerDocument.activeElement, next.payment);
  assert.equal(next.payment.getAttribute('data-combat-controller-action'), 'release-payment');
  assert.deepEqual(next.payment.focusOptions, { preventScroll: true });
});

test('Waffenfokus bleibt am gewählten Slot obwohl sich dessen Wechselhandlung ändert', () => {
  const previous = composerView();
  previous.dagger.focus();
  const state = captureComposerViewState(previous.composer);
  const next = composerView();
  const originalGetAttribute = next.dagger.getAttribute;
  next.dagger.getAttribute = name => name === 'data-combat-action-id' ? 'weapon:sword' : originalGetAttribute(name);
  restoreComposerViewState(next.composer, state);
  assert.equal(next.ownerDocument.activeElement, next.dagger);
  assert.equal(next.dagger.getAttribute('data-combat-action-id'), 'weapon:sword');
});

test('Neurendern stiehlt weder fremden Fokus noch setzt es Fokus auf einen deaktivierten Button', () => {
  const previous = composerView();
  const outside = { tagName: 'TEXTAREA' };
  previous.ownerDocument.activeElement = outside;
  const next = composerView();
  next.ownerDocument.activeElement = outside;
  restoreComposerViewState(next.composer, captureComposerViewState(previous.composer));
  assert.equal(next.ownerDocument.activeElement, outside);
  previous.payment.focus();
  next.payment.disabled = true;
  restoreComposerViewState(next.composer, captureComposerViewState(previous.composer));
  assert.equal(next.ownerDocument.activeElement, outside);
});

test('fehlende Composer oder Ziele sind bei Erstaufbau und Waffenwechsel zulässig', () => {
  assert.equal(captureComposerViewState(null), null);
  assert.doesNotThrow(() => restoreComposerViewState(null, null));
  assert.doesNotThrow(() => filterCombatTargets({ querySelector: () => null }, 'Gawain'));
});
