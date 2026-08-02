import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const contextBuilderSource = readFileSync(
  new URL('../modules/aleria-gpt/aleria-gpt-context-builder.js', import.meta.url),
  'utf8'
);

function loadContextBuilder() {
  const context = vm.createContext({ window: {}, document: undefined });
  vm.runInContext(`${contextBuilderSource}\nwindow.__collectFacts = value => { const facts = []; collectAleriaGptStructuredFacts(value, facts, 'charakter'); return facts; };`, context);
  return context.window;
}

test('AleriaGPT verliert die verbindlichen Werte 0 und false nicht beim Indexieren', () => {
  const window = loadContextBuilder();
  assert.equal(window.AleriaGptContext.toPlainText(0), '0');
  assert.equal(window.AleriaGptContext.toPlainText(false), 'false');
  const facts = window.__collectFacts({
    combatProfile: {
      resources: [{ name: 'Mana', current: 0 }],
      conditions: [{ name: 'Geblendet', active: false }]
    }
  });
  assert.ok(facts.some(fact => /current: 0$/.test(fact)));
  assert.ok(facts.some(fact => /active: false$/.test(fact)));
});

test('AleriaGPT behandelt den erzählerischen Charakterhintergrund nicht als Bildfeld', () => {
  const window = loadContextBuilder();
  const facts = window.__collectFacts({
    combatProfile: { identity: { background: 'Ehemalige Tempelwache' } }
  });
  assert.ok(facts.some(fact => /background: Ehemalige Tempelwache$/.test(fact)));
});
