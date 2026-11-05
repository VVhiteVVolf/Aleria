import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(new URL('../../AleriaAlmanach/package.json', import.meta.url));
const { parseFragment } = require('parse5');
const fragment = fs.readFileSync(new URL('./handel-entwurf.html', import.meta.url), 'utf8');
const source = fragment.match(/<script>([\s\S]*?)<\/script>/)[1];
assert.ok(!fragment.includes('\\"'), 'literal markup');
assert.ok(!/\b(?:fetch|XMLHttpRequest|WebSocket)\s*\(/.test(source), 'no network');
const listeners = {};
let snapshot;
const root = { innerHTML: '', contains: () => true, addEventListener: (type, callback) => { listeners[type] = callback; } };
const context = { document: { getElementById: id => id === 'aleria-trade-design' ? root : null },
  window: { openai: { setWidgetState: value => { snapshot = structuredClone(value); return Promise.resolve(); } }, addEventListener() {} }, Intl };
vm.runInNewContext(source, context, { filename: 'handel-entwurf.html' });
const nodes = () => {
  const found = [];
  const visit = node => { if (node.tagName) found.push(node); (node.childNodes || []).forEach(visit); };
  visit(parseFragment(root.innerHTML));
  return found;
};
const attrs = node => Object.fromEntries(node.attrs.map(attr => [attr.name, attr.value]));
function click(action, match = {}) {
  const node = nodes().find(node => node.tagName === 'button' && attrs(node)['data-action'] === action
    && Object.entries(match).every(([key, value]) => attrs(node)[`data-${key}`] === value));
  assert.ok(node, `button ${action} ${JSON.stringify(match)} exists`);
  const properties = attrs(node);
  const dataset = Object.fromEntries(Object.entries(properties).filter(([key]) => key.startsWith('data-')).map(([key, value]) => [key.slice(5), value]));
  const target = { dataset, disabled: Object.hasOwn(properties, 'disabled') };
  listeners.click({ target: { closest: () => target } });
}
function change(id, field, value) {
  const node = nodes().find(node => ['input', 'select'].includes(node.tagName) && attrs(node)['data-id'] === id && attrs(node)['data-field'] === field);
  assert.ok(node, `input ${id} ${field} exists`);
  listeners.change({ target: { dataset: { id, field }, value } });
}
assert.match(root.innerHTML, /48 KT/);
assert.match(root.innerHTML, /Zahlt Gawain · Erhält Ylva · Geschenk/);
assert.ok(nodes().some(node => attrs(node).class?.includes('trade-main')), 'primary action is styled');
change('line-kristall', 'lineMinor', '30');
assert.match(root.innerHTML, /38 KT/);
assert.equal(snapshot.privateContent.lines[1].negotiated, true);
change('line-kristall', 'payer', 'ylva');
assert.match(root.innerHTML, /Ylva<\/span><span>zahlt 30 KT/);
change('line-kristall', 'quantity', '2');
assert.equal(snapshot.privateContent.lines[1].lineMinor, 3000, 'quantity changes preserve the negotiated total');
assert.match(root.innerHTML, /Menge geändert – vereinbarten Positionspreis prüfen/);
change('line-kristall', 'lineMinor', '30');
click('mode', { mode: 'sell' });
click('add', { product: 'pferd' });
let horseLine = snapshot.privateContent.lines.find(line => line.productId === 'pferd');
change(horseLine.id, 'lineMinor', '750');
assert.equal(snapshot.privateContent.lines.find(line => line.productId === 'pferd').lineMinor, 75000);
assert.match(root.innerHTML, /1\.742 KT/);
const beforeInvalid = snapshot.privateContent.lines.find(line => line.productId === 'pferd').lineMinor;
change(horseLine.id, 'lineMinor', '-1');
assert.equal(snapshot.privateContent.lines.find(line => line.productId === 'pferd').lineMinor, beforeInvalid);
click('review');
assert.match(root.innerHTML, /Bestellung prüfen/);
click('checkout');
assert.match(root.innerHTML, /Szenenbeleg · Beispiel/);
assert.equal(snapshot.privateContent.wallets.gawain, 174200, 'wallet commits on checkout');
assert.equal(snapshot.privateContent.sold[0].instanceId, 'demo-horse-instance', 'ownership commits on checkout');
const restoredRoot = { ...root, innerHTML: '', addEventListener() {} };
vm.runInNewContext(source, { ...context, document: { getElementById: () => restoredRoot }, window: {
  openai: { widgetState: { privateContent: structuredClone(snapshot.privateContent) } }, addEventListener() {}
} });
assert.match(restoredRoot.innerHTML, /Szenenbeleg · Beispiel/, 'completed receipt survives restoration');
assert.ok(!restoredRoot.innerHTML.includes('data-action="checkout"'), 'restored receipt cannot submit twice');
click('finish');
assert.equal(snapshot.privateContent.wallets.gawain, 174200);
assert.equal(snapshot.privateContent.wallets.ylva, 57000);
assert.equal(snapshot.privateContent.sold[0].instanceId, 'demo-horse-instance');
assert.match(root.innerHTML, /Beim Händler verwahrt/);
click('mode', { mode: 'buy' });
assert.ok(!Object.hasOwn(attrs(nodes().find(node => attrs(node)['data-product'] === 'kreide')), 'disabled'), 'repeatable goods remain available');
click('add', { product: 'fokus' });
assert.ok(Object.hasOwn(attrs(nodes().find(node => attrs(node)['data-product'] === 'fokus')), 'disabled'), 'unique cannot be added twice');
console.log(JSON.stringify({ passed: true, checks: ['render', 'negotiated price', 'separate payer', 'gift', 'quantity change preserves agreement', 'horse sale', 'negative price rejection', 'checkout preview', 'sold identity', 'completed state restoration', 'repeatable goods', 'unique availability'], browserVisualCheck: 'limited: CUA timeoutMs connection error', fragmentBytes: Buffer.byteLength(fragment) }));
