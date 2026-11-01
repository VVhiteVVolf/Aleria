import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { groupAccountCurrencies, groupAccountItemCard, renderGroupAccount } from '../modules/landing/group-account-view.js';
import { buildGroupAccountRequest, canContributeGroupInventory, createGroupAccountOperations } from '../modules/landing/group-account-operations.js';
import { mountGroupAccount } from '../modules/landing/group-account-controller.js';
import { createGroupAccountDialog } from '../modules/landing/group-account-dialog.js';
import { itemDefinitionRegistry } from '../modules/item-definitions/item-definition-registry.js';
import { createQuestRepository } from '../modules/quests/quest-firebase.js';

const fields = object => new Map(Object.entries(object));
const member = { kind: 'character', characterId: 'mara', name: 'Mara' };
const record = { id: 'mara', ownerUid: 'owner', inventory: { revision: 7, items: [] } };
const request = { groupId: 'crew', action: 'withdraw', expectedGroupRevision: 4,
  member: { kind: 'character', recordId: 'mara' }, expectedMemberRevision: 7,
  object: { kind: 'money', currency: 'copper', quantity: 5 } };
const tick = () => new Promise(resolve => setImmediate(resolve));

test('answer loss retries the identical operation and revisions without exposing mutable pending state', async () => {
  const calls = []; let ids = 0;
  const operations = createGroupAccountOperations(async input => {
    calls.push(structuredClone(input));
    if (calls.length === 1) { input.object.quantity = 999; throw Object.assign(Error('Antwort verloren'), { code: 'functions/unavailable' }); }
    return { receiptId: 'same-receipt', groupRevision: 8 };
  }, () => `operation-${++ids}`);
  const input = structuredClone(request);
  await assert.rejects(operations.submit(input), /Antwort verloren/);
  input.object.quantity = 99;
  operations.pending().object.quantity = 123;
  await assert.rejects(operations.submit(input), /zuerst/);
  assert.equal(calls.length, 1);
  assert.deepEqual(await operations.retry(), { receiptId: 'same-receipt', groupRevision: 8 });
  assert.deepEqual(calls[0], calls[1]); assert.equal(calls[1].object.quantity, 5);
  assert.equal(ids, 1); assert.equal(operations.pending(), null);
});

test('concurrent submissions cannot allocate another operation; confirmed rejections release the form', async () => {
  let resolve, attempts = 0, ids = 0;
  const operations = createGroupAccountOperations(input => { attempts++; return new Promise(done => { resolve = done; }); }, () => `id-${++ids}`);
  const running = operations.submit(request);
  await assert.rejects(operations.submit(request), /gerade bestätigt/);
  assert.equal(attempts, 1); assert.equal(ids, 1); resolve({ receiptId: 'ok' }); await running;
  const rejected = createGroupAccountOperations(async () => { throw Object.assign(Error('Bitte neu öffnen'), { code: 'functions/aborted' }); }, () => 'reject');
  await assert.rejects(rejected.submit(request), /neu öffnen/);
  assert.equal(rejected.pending(), null);
});

test('transfer requests distinguish real creatures, carry both CAS guards and attach scenes only by choice', () => {
  const options = { groupId: 'crew', action: 'withdraw', groupRevision: 4, member, record,
    fields: fields({ kind: 'money', currency: 'copper', moneyQuantity: '5' }), sceneThread: 'inn::session:evening' };
  assert.deepEqual(buildGroupAccountRequest(options), request);
  const creature = buildGroupAccountRequest({ ...options, member: { kind: 'creature', creatureId: 'companion-freki' },
    record: { inventory: { revision: 9 } }, fields: fields({ kind: 'item', itemId: 'food', quantity: '2', scene: 'on' }) });
  assert.deepEqual(creature.member, { kind: 'creature', recordId: 'companion-freki' });
  assert.equal(creature.expectedMemberRevision, 9); assert.equal(creature.entryId, 'inn::session:evening');
  assert.deepEqual(creature.object, { kind: 'item', itemId: 'food', quantity: 2 });
  assert.throws(() => buildGroupAccountRequest({ ...options, fields: fields({ kind: 'money', currency: 'pfennig', moneyQuantity: '.5' }) }), /positive Menge/);
  for (const currency of ['gold','silver','copper','pfennig']) {
    assert.throws(() => buildGroupAccountRequest({ ...options, fields: fields({ kind:'money',currency,moneyQuantity:'1.5' }) }), /positive Menge/);
    assert.throws(() => buildGroupAccountRequest({ ...options, fields: fields({ kind:'money',currency,moneyQuantity:String(Number.MAX_SAFE_INTEGER+1) }) }), /positive Menge/);
    assert.equal(buildGroupAccountRequest({ ...options, fields:fields({kind:'money',currency,moneyQuantity:'1'}) }).object.quantity,1);
  }
  assert.throws(() => buildGroupAccountRequest({ ...options, fields: fields({ kind: 'item', itemId: 'food', quantity: '1.5' }) }), /positive Menge/);
});

test('contribution permission mirrors shared ownership and editorial grants send only authoritative references', () => {
  assert.equal(canContributeGroupInventory(record, { uid: 'owner', role: 'player' }), true);
  assert.equal(canContributeGroupInventory(record, { uid: 'gm', role: 'moderator' }), true);
  assert.equal(canContributeGroupInventory(record, { uid: 'stranger', role: 'editor' }), false);
  assert.equal(canContributeGroupInventory({ ownerUid: undefined }, {}), false);
  assert.throws(() => buildGroupAccountRequest({ groupId: 'crew', action: 'deposit', groupRevision: 1, member, record,
    access: { uid: 'stranger', role: 'editor' }, fields: fields({ kind: 'item', itemId: 'food', quantity: '1' }) }), /Besitzer/);
  const grant = buildGroupAccountRequest({ groupId: 'crew', action: 'grant', groupRevision: 4,
    template: { id: 'offer:rope', moduleId: 'market', sourceRevision: 8, definitionRef: { id: 'rope', revision: 'v1' }, combatDefinition: { invented: true } },
    fields: fields({ quantity: '2' }) });
  assert.deepEqual(grant, { groupId: 'crew', action: 'grant', expectedGroupRevision: 4,
    product: { template: 'offer:rope', moduleId: 'market', sourceRevision: 8, definitionRef: { id: 'rope', revision: 'v1' } }, quantity: 2 });
  const noRevision = buildGroupAccountRequest({ groupId: 'crew', action: 'grant', groupRevision: 0, template: { id: 'offer:rope', moduleId: 'market' }, fields: fields({ quantity: '1' }) });
  assert.equal(Object.hasOwn(noRevision.product, 'sourceRevision'), false);
});

test('account cards resolve pinned shared mechanics and reuse the existing inventory card renderer', () => {
  const definition = itemDefinitionRegistry.values().find(row => row.category === 'waffen');
  const item = { id: 'sword', name: '<Mara>', category: 'weapon', definitionRef: { id: definition.id, revision: definition.revision },
    quantity: 1, combatDefinition: { kind: 'weapon', damageFormula: '99d99' } };
  const oldRenderer = globalThis.buildInventoryCardContent;
  try {
    let supplied;
    globalThis.buildInventoryCardContent = (resolved, options) => { supplied = { resolved, options }; return 'central-card'; };
    assert.equal(groupAccountItemCard(item), 'central-card');
    assert.equal(supplied.resolved.combatDefinition.damageFormula, definition.combatDefinition.damageFormula);
    assert.equal(supplied.options.status, 'Im gemeinsamen Vorrat');
    delete globalThis.buildInventoryCardContent;
    const fallback = groupAccountItemCard(item);
    assert.match(fallback, /Angreifen/); assert.match(fallback, /&lt;Mara&gt;/); assert.doesNotMatch(fallback, /99W99/);
  } finally { if (oldRenderer) globalThis.buildInventoryCardContent = oldRenderer; else delete globalThis.buildInventoryCardContent; }
});

test('account view uses real four-currency assets, protected manager access and bounded inventories', async () => {
  for (const currency of groupAccountCurrencies().filter(row=>row.icon)) await access(new URL(`../../${currency.icon.replace(/^\//, '')}`, import.meta.url));
  const account = { managerUids: ['quartermaster'], inventory: { moneyState: { totalCopper: 1234.56 },
    items: Array.from({ length: 15 }, (_, index) => ({ id: `item-${index}`, name: `Item ${index}`, quantity: 1 })) } };
  const ordinary = renderGroupAccount(account, { access: { uid: 'player', role: 'player' } });
  assert.match(ordinary, /data-group-account-action="deposit"/); assert.doesNotMatch(ordinary, /data-group-account-action="withdraw"/);
  assert.equal((ordinary.match(/data-group-account-action="card"/g) || []).length, 12);
  assert.match(ordinary, /Weitere Gegenstände · 3/); assert.match(ordinary, /<strong>56<\/strong>/);
  const manager = renderGroupAccount(account, { access: { uid: 'quartermaster', role: 'player' } });
  assert.match(manager, /data-group-account-action="withdraw"/); assert.doesNotMatch(manager, /data-group-account-action="grant"/);
  assert.match(renderGroupAccount(account, { access: { uid: 'editor', role: 'editor' } }), /data-group-account-action="grant"/);
  assert.doesNotMatch(renderGroupAccount(account, { preview: true, access: { uid: 'gm', role: 'admin' } }), /data-group-account-action="(?:deposit|withdraw|give-item|grant)"/);
});

test('all four currency references preserve verified Aleria art beside an old DND global mapping', async () => {
  const expected = {
    gold:'/AleriaAlmanach/assets/currency/aleria-goldtaler-v1.webp',
    silver:'/AleriaAlmanach/assets/currency/aleria-silbertaler-v1.webp',
    copper:'/AleriaAlmanach/assets/gwynthor-troetzli/items/copper-coin-v1.png',
    pfennig:'/AleriaAlmanach/public/assets/inventory/coins/eisenpfennig.png'
  };
  const previous = globalThis.CharacterInventoryMoney;
  const legacy = { currencies:Object.keys(expected).map(id=>({id,icon:`/old-dnd/${id}.png`})) };
  globalThis.CharacterInventoryMoney = legacy;
  try {
    assert.deepEqual(Object.fromEntries(groupAccountCurrencies().map(row=>[row.id,row.icon])),expected);
    const rendered = renderGroupAccount({inventory:{moneyState:{totalCopper:1234.56},items:[]}});
    for(const path of Object.values(expected).filter(Boolean))assert.ok(rendered.includes(`src="${path}"`));
    assert.doesNotMatch(rendered,/old-dnd|IconOrdner\/(?:Gold|Silber)taler|src=""/);assert.equal(globalThis.CharacterInventoryMoney,legacy);
  } finally {if(previous)globalThis.CharacterInventoryMoney=previous;else delete globalThis.CharacterInventoryMoney;}
  const copper = JSON.parse(await readFile(new URL('../assets/gwynthor-troetzli/items/copper-coin-manifest.json',import.meta.url),'utf8'));
  assert.equal(copper.file,'copper-coin-v1.png');assert.match(copper.tool,/image_gen/);
});

class Element {
  constructor() { this.children = []; this.listeners = new Map(); this.innerHTML = ''; this.isConnected = true; }
  append(node) { this.children.push(node); }
  replaceChildren(...nodes) { this.children = nodes; }
  addEventListener(name, listener, options = {}) {
    this.listeners.set(name, listener);
    options.signal?.addEventListener('abort', () => this.listeners.delete(name), { once: true });
  }
  click(action, itemId) {
    const trigger = { dataset: { groupAccountAction: action, groupAccountItem: itemId }, isConnected: true };
    return this.listeners.get('click')?.({ target: { closest: () => trigger } });
  }
}
function fixture() {
  const previousDocument = globalThis.document;
  globalThis.document = { createElement: () => new Element() };
  let nextAccount, nextAccess, nextDefinitions, dialog, stops = 0, destroyed = 0;
  const opens = [], cards = [], hydrated = [], calls = [], host = new Element();
  const definitions = { ensureVersions: async records => { hydrated.push(records); }, subscribe(next) { nextDefinitions = next; return () => stops++; } };
  const repository = { groupAccount(id, next) { assert.equal(id, 'crew'); nextAccount = next; return () => stops++; },
    watchAccess(next) { nextAccess = next; next({ uid: 'gm', role: 'admin' }); return () => stops++; },
    access: async () => ({ uid: 'gm', role: 'admin' }), async inventory(input) { calls.push(input); return { receiptId: 'receipt', groupInventory: { items: [{ id: 'new', name: 'Seil' }], moneyState: { copper: 3 } }, groupRevision: 8 }; } };
  return { host, repository, definitions, hydrated, calls, opens, cards,
    client: async () => repository,
    dialogFactory(options) { dialog = options; return { open: input => opens.push(input), openCard: item => cards.push(item), destroy: () => destroyed++ }; },
    emitAccount: value => nextAccount(value), emitAccess: value => nextAccess(value), emitDefinitions: () => nextDefinitions(),
    submit: input => dialog.onSubmit(input), stopCount: () => stops, destroyed: () => destroyed,
    restore() { globalThis.document = previousDocument; } };
}

test('preview remains offline and unmount closes local dialogs without any inventory writes', () => {
  const f = fixture(); let clients = 0;
  try {
    const stop = mountGroupAccount(f.host, 'crew', { preview: true, client: () => { clients++; throw Error('No Firebase'); }, definitions: f.definitions, dialogFactory: f.dialogFactory });
    assert.match(f.host.children[0].innerHTML, /Vorschau/); assert.equal(clients, 0); assert.equal(f.hydrated.length, 0);
    stop(); assert.equal(f.destroyed(), 1); assert.equal(f.calls.length, 0);
  } finally { f.restore(); }
});

test('the owned native card dialog restores focus, removes listeners and isolates keyboard navigation', () => {
  const previousDocument = globalThis.document, root = new Element(); let focus = 0, closed = 0, prevented = 0, stopped = 0;
  const originalFocus = { isConnected: true, focus: () => focus++ };
  globalThis.document = { activeElement: originalFocus, createElement() {
    const node = new Element();
    Object.assign(node, { setAttribute() {}, querySelector: () => ({ focus() {} }), showModal() {}, close() { closed++; }, remove() { node.isConnected = false; } });
    return node;
  } };
  try {
    const dialog = createGroupAccountDialog({ root, definitions: {}, onSubmit() {} });
    dialog.openCard({ id: 'rope', name: 'Seil' });
    const node = root.children[0];
    node.listeners.get('keydown')({ key: 'ArrowRight', preventDefault: () => prevented++, stopPropagation: () => stopped++ });
    assert.equal(stopped, 1); assert.equal(prevented, 0, 'native input/navigation behavior stays intact');
    node.listeners.get('keydown')({ key: 'Escape', preventDefault: () => prevented++, stopPropagation: () => stopped++ });
    assert.equal(prevented, 1); assert.equal(closed, 1); assert.equal(node.isConnected, false); assert.equal(node.listeners.size, 0); assert.equal(focus, 1);
    dialog.openCard({ name: 'Brot' }); const second = root.children[1];
    second.listeners.get('close')();
    assert.equal(second.isConnected, false); assert.equal(second.listeners.size, 0);
    dialog.destroy();
  } finally { globalThis.document = previousDocument; }
});

test('account subscriptions keep dialogs intact, use current typed members and immediately show authoritative responses', async () => {
  const f = fixture(); let members = [member], thread = 'inn::session:one';
  try {
    const stop = mountGroupAccount(f.host, 'crew', { ...f, getMembers: () => members, getSceneThread: () => thread });
    await tick(); const content = f.host.children[0];
    f.emitAccount({ id: 'crew', revision: 4, inventory: { items: [{ id: 'old', name: 'Alter Vorrat' }] } }); await tick();
    assert.equal(f.hydrated[0][0].revision, 4);
    members = [{ kind: 'creature', creatureId: 'companion-freki', name: 'Freki' }]; thread = 'yard::session:two';
    await content.click('give-item', 'old');
    assert.equal(f.opens[0].members, members); assert.equal(f.opens[0].sceneThread, thread); assert.equal(f.opens[0].itemId, 'old');
    f.emitAccount({ revision: 5, inventory: { items: [{ id: 'old', name: 'Neuer Vorrat' }] } }); await tick();
    assert.equal(f.opens.length, 1, 'live updates leave the existing form owned by its dialog');
    assert.equal(f.destroyed(), 0);
    await f.submit(request);
    assert.match(content.innerHTML, /Seil/); assert.doesNotMatch(content.innerHTML, /Neuer Vorrat/); assert.equal(f.calls.length, 1);
    f.emitAccount({ revision: 7, inventory: { items: [{ id: 'older', name: 'Verspäteter Stand' }] } }); await tick();
    assert.doesNotMatch(content.innerHTML, /Verspäteter Stand/);
    await content.click('card', 'new'); assert.equal(f.cards[0].name, 'Seil');
    stop(); const html = content.innerHTML;
    f.emitAccount({ revision: 99, inventory: { items: [] } }); f.emitAccess(null); f.emitDefinitions(); await tick();
    assert.equal(content.innerHTML, html); assert.equal(content.listeners.size, 0); assert.equal(f.stopCount(), 3); assert.equal(f.destroyed(), 1);
  } finally { f.restore(); }
});

test('the visible retry recovers a lost response using the same server operation and freshest returned account', async () => {
  const f = fixture(); const inputs = [];
  f.repository.inventory = async input => { inputs.push(input); if (inputs.length === 1) throw Object.assign(Error('Offline'), { code: 'functions/unavailable' });
    return { receiptId: 'done', groupRevision: 20, groupInventory: { moneyState: { copper: 88 }, items: [] } }; };
  try {
    const stop = mountGroupAccount(f.host, 'crew', f); await tick();
    f.emitAccount({ revision: 4, inventory: { items: [] } });
    await assert.rejects(f.submit(request), /Offline/);
    const content = f.host.children[0]; assert.match(content.innerHTML, /Offene Übergabe erneut prüfen/);
    await content.click('retry'); assert.deepEqual(inputs[0], inputs[1]);
    assert.match(content.innerHTML, /<strong>88<\/strong>/); assert.doesNotMatch(content.innerHTML, /data-group-account-action="retry"/);
    stop();
  } finally { f.restore(); }
});

test('repository sends group inventory exclusively through its authenticated callable contract', async () => {
  const calls = []; let authenticated = 0;
  const repository = createQuestRepository({ db: {}, sdk: {}, functions: 'functions', auth: {}, authSdk: {},
    requireUser: async () => { authenticated++; }, httpsCallable: (functions, name, options) => async input => {
      calls.push({ functions, name, options, input }); return { data: { receiptId: 'ok' } };
    } });
  assert.deepEqual(await repository.inventory(request), { receiptId: 'ok' });
  assert.equal(authenticated, 1); assert.deepEqual(calls, [{ functions: 'functions', name: 'commitGroupInventory', options: { timeout: 60000 }, input: request }]);
});
