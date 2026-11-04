import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

function statusContext() {
  const listeners = new Map();
  const attributes = new Map();
  let toggle, details;
  const status = {
    dataset: {},
    setAttribute: (key, value) => attributes.set(key, value),
    removeAttribute: key => attributes.delete(key),
    querySelector: selector => selector === '.firebase-sync-toggle' ? toggle : details,
    get innerHTML() { return this.html; },
    set innerHTML(value) {
      this.html = value;
      toggle = { attributes: new Map(), setAttribute(key, text) { this.attributes.set(key, text); } };
      details = { hidden: true };
    }
  };
  const context = vm.createContext({
    document: { getElementById: () => status, addEventListener: (name, listener) => listeners.set(name, listener) },
    window: { addEventListener() {} }
  });
  vm.runInContext(readFileSync(new URL('../modules/sync/firebase-sync-status.js', import.meta.url), 'utf8'), context);
  return { context, status, listeners, toggle: () => toggle, details: () => details };
}

test('online status starts compact and never expands because a sync result arrived', () => {
  const { context, status, toggle, details } = statusContext();
  context.updateFirebaseSyncStatus('synced', 'Online geladen');
  assert.equal(status.dataset.minimized, 'true');
  assert.equal(details().hidden, true);
  assert.equal(toggle().attributes.get('aria-expanded'), 'false');
  assert.match(status.innerHTML, /<button[^>]+class="firebase-sync-toggle"[^>]+type="button"/);
  assert.doesNotMatch(status.innerHTML, /Lokal behalten|Konflikt lösen/);
  context.updateFirebaseSyncStatus('error', 'Verbindung prüfen');
  assert.equal(details().hidden, true);
});

test('only the native status button opens details and the backup action leaves them open', () => {
  const { context, status, listeners, details } = statusContext();
  context.updateFirebaseSyncStatus('synced', 'Bestätigt');
  let prevented = false;
  listeners.get('click')({ target: { closest: () => ({}) }, preventDefault() { prevented = true; } });
  assert.equal(prevented, true);
  assert.equal(details().hidden, false);
  context.updateFirebaseSyncStatus('syncing', 'Neue Bestätigung');
  assert.equal(status.dataset.minimized, 'false');
  assert.equal(details().hidden, false);
  listeners.get('click')({ target: { closest: () => null }, preventDefault() { throw Error('Not the status toggle'); } });
  assert.equal(details().hidden, false);
});

test('status details escape stored text and green motion honors reduced-motion preferences', () => {
  const { context, status } = statusContext();
  context.updateFirebaseSyncStatus('synced', '<img src=x onerror=alert(1)>');
  assert.match(status.innerHTML, /&lt;img src=x onerror=alert\(1\)&gt;/);
  const css = readFileSync(new URL('../modules/sync/firebase-sync-status.css', import.meta.url), 'utf8');
  assert.match(css, /\[data-state="synced"\][\s\S]*animation: onlineStatusPulse/);
  assert.match(css, /prefers-reduced-motion: reduce/);
  assert.match(css, /width: 2\.5rem/);
});
