import { registerStore } from './item-register-store.js';
import { queryRegister, normalizeOffer, toLegacyItem } from './item-register-model.js';
import { shell, navigation, overview, results, detail, escape, safeImage } from './item-register-view.js';
import { createForm, collectOperation, quote } from './item-register-forms.js';
import { moneyState, moneyTotal, parsePrice, formatPrice } from './item-register-money.js';
import { adaptItemImage } from './item-register-images.js';
import { watchStandardReleases } from './item-register-updates.js';

const state = { open: false, section: 'standard', category: '', listId: '', search: '', sort: 'name', selectedId: '', limit: 48, equippedOnly: false, ownedExpanded: false };
let panel, editor, form = null, busy = false, pendingOperation = null;
const access = () => globalThis._fbAuth?.getAccess?.() || {};
const snapshot = () => registerStore.snapshot();
const selected = () => snapshot().items.find(item => item.id === state.selectedId);
const roles = role => panel.querySelector(`[data-ir-role="${role}"]`);

function notice(message = '', error = false) {
  if (!panel) return;
  const node = roles('notice');
  node.hidden = !message;
  node.classList.toggle('is-error', error);
  node.textContent = message;
}
function render() {
  if (!state.open || !panel) return;
  const data = snapshot();
  roles('navigation').innerHTML = navigation(data, state);
  const browsing = state.category || state.listId || state.search.trim();
  roles('results').innerHTML = browsing ? results(data, state, queryRegister(data.items, state)) : overview(data, state, access());
  const item = selected();
  roles('detail').hidden = !item;
  roles('detail').innerHTML = detail(item, data, access());
  panel.querySelector('.ir-layout').classList.toggle('has-detail', !!item);
  const sync = roles('sync');
  sync.className = `ir-sync ir-sync-${data.status}`;
  sync.textContent = ({ live: 'Live verbunden', loading: 'Wird abgeglichen …', offline: 'Offline · letzter Stand', error: 'Abgleich unterbrochen' })[data.status];
  sync.title = data.error || (data.syncedAt ? `Letzter Abgleich: ${new Date(data.syncedAt).toLocaleTimeString('de-DE')}` : '');
  for (const action of ['new-offer', 'import']) panel.querySelector(`[data-ir-action="${action}"]`).hidden = !access().canEditSharedContent;
}
function ensurePanel() {
  if (panel) return;
  panel = document.createElement('section');
  panel.id = 'item-register-overlay'; panel.className = 'ir-overlay'; panel.hidden = true;
  panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-modal', 'true'); panel.setAttribute('aria-labelledby', 'ir-title'); panel.tabIndex = -1;
  panel.innerHTML = shell(); document.body.appendChild(panel);
  panel.addEventListener('click', handleClick);
  panel.addEventListener('input', handleInput);
  panel.addEventListener('change', handleChange);
  panel.addEventListener('error', event => { if (event.target instanceof HTMLImageElement) event.target.hidden = true; }, true);
  panel.addEventListener('load', event => { if (event.target instanceof HTMLImageElement) adaptItemImage(event.target); }, true);
}
export function openItemRegister(itemId = '') {
  ensurePanel(); state.open = true; panel.hidden = false; render();
  const target = typeof itemId === 'string' && snapshot().items.find(item => item.id === itemId);
  if (target) { reset(target.section); state.category = target.category; state.listId = target.listId || ''; selectItem(target.id); }
  globalThis.activateDialog?.(panel.id, { initialFocus: '[data-ir-field="search"]' });
  connect();
}
export function closeItemRegister() {
  if (form) closeForm();
  state.open = false;
  if (panel) { globalThis.deactivateDialog?.(panel.id); panel.hidden = true; }
}
function reset(section = state.section) {
  Object.assign(state, { section, category: '', listId: '', search: '', selectedId: '', limit: 48, equippedOnly: false });
  panel.querySelector('[data-ir-field="search"]').value = '';
}
function selectItem(id) {
  const item = snapshot().items.find(entry => entry.id === id);
  if (!item) throw new Error('Dieser Eintrag ist nicht mehr verfügbar.');
  if (item.section !== state.section) { reset(item.section); state.category = item.category; state.listId = item.listId || ''; }
  state.selectedId = id; render();
  if (window.innerWidth < 1100) roles('detail').scrollIntoView({ block: 'start', behavior: 'smooth' });
}
function ensureEditor() {
  if (editor) return;
  editor = document.createElement('section'); editor.id = 'item-register-editor'; editor.className = 'ir-form-overlay'; editor.hidden = true;
  editor.setAttribute('role', 'dialog'); editor.setAttribute('aria-modal', 'true'); editor.setAttribute('aria-labelledby', 'ir-form-title'); editor.tabIndex = -1;
  document.body.appendChild(editor);
  editor.addEventListener('click', event => { if (event.target.closest('[data-ir-action="close-form"]')) closeForm(); });
  editor.addEventListener('submit', submitForm);
  editor.addEventListener('input', updateQuote);
  editor.addEventListener('change', updateQuote);
}
function openForm(kind, item = selected()) {
  if (busy) throw new Error('Ein Vorgang wird gerade gespeichert.');
  ensureEditor();
  form = createForm(kind, item || {}, snapshot(), access()); pendingOperation = null;
  editor.innerHTML = `<form class="ir-form"><header><div><p class="ir-kicker">Items und Güter</p><h2 id="ir-form-title">${escape(form.title)}</h2></div><button type="button" data-ir-action="close-form" aria-label="Dialog schließen">×</button></header><div class="ir-form-content">${form.content}<p class="ir-form-error" data-ir-role="form-error" role="alert" hidden></p></div><footer><button type="button" data-ir-action="close-form">Abbrechen</button><button type="submit" class="ir-primary">${escape(form.submitLabel)}</button></footer></form>`;
  editor.hidden = false; updateQuote();
  globalThis.activateDialog?.(editor.id, { initialFocus: 'input, select, button[type="submit"]' });
}
function closeForm() {
  if (busy) return;
  form = null; pendingOperation = null;
  if (editor) { globalThis.deactivateDialog?.(editor.id); editor.hidden = true; editor.innerHTML = ''; }
}
function values() { return Object.fromEntries(new FormData(editor.querySelector('form'))); }
function updateQuote() {
  const target = editor?.querySelector('[data-ir-role="quote"]');
  if (target && form) target.innerHTML = quote(form, values());
}
async function submitForm(event) {
  event.preventDefault(); if (busy || !form) return;
  const activeForm = form;
  const errorNode = editor.querySelector('[data-ir-role="form-error"]'); errorNode.hidden = true;
  try {
    const input = collectOperation(activeForm, values());
    if (input.offer) normalizeOffer(input.offer, snapshot().standards);
    if (input.image && !safeImage(input.image) || input.offer?.image && !safeImage(input.offer.image)) throw new Error('Bitte einen gültigen Bildpfad oder eine HTTPS-Bildadresse verwenden.');
    // Retry an ambiguous network response with the same ID and exact request.
    // Edited forms get a new request ID, never a second execution of an old one.
    if (pendingOperation && JSON.stringify({ ...pendingOperation, operationId: '' }) !== JSON.stringify({ ...input, operationId: '' })) input.operationId = crypto.randomUUID();
    else if (pendingOperation) input.operationId = pendingOperation.operationId;
    pendingOperation = input;
    busy = true;
    editor.querySelectorAll('button').forEach(button => button.disabled = true);
    const result = await registerStore.commit(input);
    busy = false;
    if (form === activeForm) closeForm();
    notice(result.message);
    if (input.action === 'sell') state.selectedId = '';
    if (result.offer) { reset('offer'); state.listId = result.offer.listId; state.selectedId = result.offer.id; }
    render();
  } catch (error) {
    busy = false;
    errorNode.hidden = false; errorNode.textContent = error.message || 'Speichern fehlgeschlagen.';
    editor.querySelectorAll('button').forEach(button => button.disabled = false);
  }
}
function exportRegister() {
  const data = snapshot();
  const payload = { schema: 'aleria-item-register-v2', standardVersion: data.version, exportedAt: new Date().toISOString(), offers: data.offers.filter(offer => !offer.legacy) };
  const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
  const link = document.createElement('a'); link.href = url; link.download = 'aleria-gueter-sortimente.json'; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
async function importOffers(file) {
  if (!file || busy) return;
  if (file.size > 4 * 1024 * 1024) throw new Error('Die Importdatei darf höchstens 4 MB groß sein.');
  const payload = JSON.parse(await file.text());
  if (payload.schema !== 'aleria-item-register-v2' || !Array.isArray(payload.offers)) throw new Error('Bitte einen Export der Sortimente im neuen Registerformat auswählen.');
  if (payload.offers.length > 500) throw new Error('Bitte höchstens 500 Angebote gleichzeitig importieren.');
  const offers = payload.offers.map(offer => normalizeOffer(offer, snapshot().standards));
  if (new Set(offers.map(offer => offer.id)).size !== offers.length) throw new Error('Die Datei enthält doppelte Angebots-IDs.');
  const current = new Map(snapshot().offers.filter(offer => !offer.legacy).map(offer => [offer.id, offer]));
  busy = true; let saved = 0;
  try {
    for (const offer of offers) {
      await registerStore.commit({ action: 'save-offer', offer, expectedRevision: current.get(offer.id)?.revision || 0, operationId: crypto.randomUUID() });
      saved++;
    }
    notice(`${saved} Angebote importiert.`);
  } catch (error) { throw new Error(`${saved} von ${offers.length} Angeboten gespeichert. ${error.message}`); }
  finally { busy = false; }
}
async function handleClick(event) {
  const trigger = event.target.closest('[data-ir-action]'); if (!trigger) return;
  const action = trigger.dataset.irAction;
  try {
    if (action === 'close') return closeItemRegister();
    if (action === 'toggle-owned') { state.ownedExpanded = !state.ownedExpanded; return; }
    if (action === 'section') reset(trigger.dataset.id);
    else if (action === 'category') { reset('standard'); state.category = trigger.dataset.id; }
    else if (action === 'list') { reset(trigger.dataset.section); state.listId = trigger.dataset.id; }
    else if (action === 'reset') reset();
    else if (action === 'select' || action === 'reference') return selectItem(trigger.dataset.id);
    else if (action === 'clear-selection') state.selectedId = '';
    else if (action === 'more') state.limit += 48;
    else if (action === 'export') return exportRegister();
    else if (action === 'import') return roles('import').click();
    else if (action === 'open-creature') { await globalThis.AleriaCreatures?.reload?.(); return globalThis.AleriaCreatures?.open?.(selected()?.creatureId); }
    else if (action === 'open-character') return globalThis.openCharProfile?.(selected()?.ownerCharacterId);
    else if (['new-offer', 'variant', 'edit-offer', 'buy', 'sell', 'customize', 'link-creature'].includes(action)) return openForm(action, action === 'new-offer' ? {} : selected());
    render();
  } catch (error) { notice(error.message, true); }
}
function handleInput(event) {
  const field = event.target.dataset.irField;
  if (field !== 'search') return;
  state.search = event.target.value; state.limit = 48; state.selectedId = ''; render();
}
function handleChange(event) {
  const field = event.target.dataset.irField;
  if (field === 'sort') { state.sort = event.target.value; render(); }
  if (field === 'equippedOnly') { state.equippedOnly = event.target.checked; render(); }
  if (event.target === roles('import')) { importOffers(event.target.files[0]).catch(error => notice(error.message, true)); event.target.value = ''; }
}
function connect() { registerStore.connect(globalThis._fb?.itemRegister, globalThis._fb); }

if (typeof globalThis.itemDbExportDatabasePayload === 'function') registerStore.setLocalLegacy(globalThis.itemDbExportDatabasePayload());
registerStore.subscribe(render);
window.addEventListener('fb-ready', connect);
window.addEventListener('fb-load-error', connect);
window.addEventListener('online', () => { registerStore.stop(); connect(); });
window.addEventListener('aleria:auth-state-changed', render);
document.addEventListener('keydown', event => {
  if (event.key !== 'Escape' || !state.open || busy) return;
  const top = globalThis.getTopActiveDialog?.();
  if (form && (!top || top.id === editor.id)) { event.preventDefault(); event.stopImmediatePropagation(); closeForm(); }
  else if (!form && (!top || top.id === panel.id)) { event.preventDefault(); event.stopImmediatePropagation(); closeItemRegister(); }
}, true);

globalThis.AleriaItemRegister = Object.freeze({ open: openItemRegister, close: closeItemRegister,
  ensure: connect, store: registerStore, moneyState, moneyTotal,
  getItems: () => registerStore.legacyIndex(), getByKey: key => { const item = registerStore.getByKey(key); return item ? toLegacyItem(item) : null; },
  formatPrice: item => formatPrice(item.priceRange || parsePrice(item.price, item.currency)) });
if (globalThis._fb?.itemRegister) connect();
watchStandardReleases(registerStore);
window.dispatchEvent(new CustomEvent('item-db-store-updated', { detail: { reason: 'register-ready' } }));
