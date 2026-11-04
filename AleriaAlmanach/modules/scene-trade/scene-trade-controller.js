import { createSceneTradeService } from './scene-trade-service.js';
import { renderSceneTradeDialog } from './scene-trade-view.js';
import { createSceneTradeState, initializeSceneTradeDefaults, sceneTradeAccounts, addSceneTradeBuy,
  addSceneTradeSell, updateSceneTradeLine, buildSceneTradeCheckout, refreshSceneTradeLines } from './scene-trade-state.js';
import { createSceneTradeSubmission } from './scene-trade-submission.js';

// One personal, browser-local draft belongs to one exact scene thread. A closed
// window retains an unresolved request so reopening never creates a second sale.
const sessions = new Map();
let overlay = null, active = null, returnFocus = null;
function makeSession(threadId) {
  const service = createSceneTradeService();
  return { state: createSceneTradeState(threadId), service, submission: createSceneTradeSubmission(input => service.checkout(input), undefined, { requirePersistence: true }),
    data: { characters: [], groups: [], offers: [], providers: [], access: {} }, loading: false, loaded: false,
    sold: [], soldNextCursor: null, soldLoading: false, soldToken: 0, availabilityToken: 0, options: {} };
}
function ensureOverlay() {
  if (overlay) return;
  overlay = document.createElement('section'); overlay.id = 'scene-trade-overlay'; overlay.className = 'scene-trade-overlay';
  overlay.setAttribute('role', 'dialog'); overlay.setAttribute('aria-modal', 'true'); overlay.setAttribute('aria-hidden', 'true');
  overlay.setAttribute('aria-labelledby', 'scene-trade-title'); overlay.tabIndex = -1;
  document.body.appendChild(overlay);
  overlay.addEventListener('click', click);
  overlay.addEventListener('change', change);
  overlay.addEventListener('input', event => {
    if (event.target.dataset.tradeField !== 'search' || !editable()) return;
    active.state.search = event.target.value; active.state.limit = 24; render();
  });
  overlay.addEventListener('toggle', event => {
    if (event.target.dataset.tradeDetail && event.target.open && active) active.state.openLine = event.target.dataset.tradeDetail;
  }, true);
  overlay.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    event.preventDefault(); event.stopPropagation(); close();
  });
}
function editable() { return active && !active.loading && !active.submission.pending() && !active.submission.running(); }
function render(session = active) {
  if (!session || session !== active || !overlay) return;
  const focused = overlay.contains(document.activeElement) ? document.activeElement : null;
  const focus = focused?.dataset.tradeField ? `[data-trade-field="${focused.dataset.tradeField}"]`
    : focused?.dataset.lineField ? `[data-line-id="${CSS.escape(focused.dataset.lineId)}"][data-line-field="${focused.dataset.lineField}"]` : '';
  const selection = focused && ['text', 'search'].includes(focused.type) ? [focused.selectionStart, focused.selectionEnd] : null;
  const scroll = overlay.querySelector('.scene-trade-fields')?.scrollTop || 0;
  overlay.innerHTML = renderSceneTradeDialog({ ...session, busy: session.submission.running(), pending: !!session.submission.pending(), pendingRequest: session.submission.pending() });
  const content = overlay.querySelector('.scene-trade-fields'); if (content) content.scrollTop = scroll;
  if (focus) { const next = overlay.querySelector(focus); next?.focus({ preventScroll: true }); if (next && selection) next.setSelectionRange(...selection); }
}
function status(session, message, error = false) { session.state.status = message; session.state.error = error; render(session); }
async function load(session) {
  if (session.loading || session.submission.pending()) return;
  session.loading = true; status(session, '');
  try {
    session.data = await session.service.load(); session.loaded = true;
    let browserStorage;
    try { browserStorage = globalThis.sessionStorage; } catch { /* The submission reports a clear storage error. */ }
    session.submission.bindPersistence({ storage: browserStorage, uid: session.data.access.uid, threadId: session.state.threadId });
    if (session.submission.pending()) {
      session.state.status = 'Ein Handelsauftrag ist noch offen. Bitte unverändert erneut prüfen.';
      return;
    }
    initializeSceneTradeDefaults(session.state, session.data, session.options.actorCharacterId);
    if (!session.state.lines.length && session.state.merchantId && !session.data.providers.some(provider => provider.id === session.state.merchantId)) session.state.merchantId = '';
    if (session.state.merchantId) await loadAvailability(session);
    refreshSceneTradeLines(session.state, session.data);
    if (session.state.mode === 'sold' && session.state.merchantId) void loadSold(session);
  } catch (error) { session.state.status = error.message || 'Der Handel konnte nicht geöffnet werden.'; session.state.error = true; }
  finally { session.loading = false; render(session); }
}
async function loadAvailability(session) {
  const token = ++session.availabilityToken, merchantId = session.state.merchantId;
  if (!merchantId) return;
  session.data.offers = session.data.offers.map(product => product.listId === merchantId
    ? { ...product, available: false, availabilityStatus: 'checking' } : product);
  render(session);
  try {
    const products = await session.service.availability(merchantId);
    if (token !== session.availabilityToken || merchantId !== session.state.merchantId) return;
    const byId = new Map(products.map(product => [product.productId, product]));
    session.data.offers = session.data.offers.map(product => {
      if (product.listId !== merchantId) return product;
      const availability = byId.get(product.id);
      return { ...product, available: availability?.available === true,
        availabilityStatus: availability?.status || 'unavailable', ...(availability?.unique ? { definitionKind: 'unique' } : {}) };
    });
  } catch (error) {
    if (token === session.availabilityToken) {
      session.data.offers = session.data.offers.map(product => product.listId === merchantId ? { ...product, available: false, availabilityStatus: 'unknown' } : product);
      status(session, error.message || 'Die Warenverfügbarkeit konnte nicht geprüft werden. Bitte die Bestände neu laden.', true);
    }
  } finally { if (token === session.availabilityToken) render(session); }
}
async function loadSold(session, more = false) {
  const token = ++session.soldToken, merchantId = session.state.merchantId;
  if (!merchantId || more && !session.soldNextCursor) return;
  session.soldLoading = true; render(session);
  try {
    const response = await session.service.sold(merchantId, more ? session.soldNextCursor : null);
    if (token === session.soldToken) {
      session.sold = more ? [...new Map([...session.sold, ...response.items].map(item => [item.id, item])).values()] : response.items;
      session.soldNextCursor = response.nextCursor || null;
    }
  }
  catch (error) { if (token === session.soldToken) status(session, error.message || 'Die Verkauftablage konnte nicht geladen werden.', true); }
  finally { if (token === session.soldToken) { session.soldLoading = false; render(session); } }
}
function close() {
  if (!overlay) return;
  globalThis.deactivateDialog?.(overlay.id);
  overlay.classList.remove('active'); overlay.setAttribute('aria-hidden', 'true');
  active = null;
  if (returnFocus?.isConnected) returnFocus.focus({ preventScroll: true });
}
async function checkout(session, retry = false) {
  if (session.submission.running()) return;
  try {
    const promise = retry ? session.submission.retry() : session.submission.submit(buildSceneTradeCheckout(session.state, session.data));
    status(session, 'Der Handel wird bestätigt …');
    const result = await promise;
    session.state.lines = []; session.state.stage = 'edit'; session.state.openLine = ''; session.loaded = false;
    if (active === session) close();
    // Refresh failures cannot turn an already committed checkout into a retry.
    try { await session.options.onCommitted?.({ result, threadId: session.state.threadId }); }
    catch (failure) { console.warn('Handel gespeichert; Szenenansicht konnte nicht aktualisiert werden.', failure); }
  } catch (error) {
    const pending = session.submission.pending();
    const specificError = ['scene-trade/identity-changed', 'scene-trade/persistence-unavailable'].includes(error.code);
    status(session, pending && !specificError ? 'Die Antwort auf den Handel fehlt noch. Bitte den offenen Auftrag unverändert erneut prüfen.' : error.message || 'Der Handel konnte nicht abgeschlossen werden.', true);
    if (!pending && /aborted$/.test(error.code || '')) status(session, `${error.message} Lade die Bestände neu und prüfe die Bestellung.`, true);
  } finally { render(session); }
}
async function click(event) {
  const trigger = event.target.closest?.('[data-trade-action]');
  if (!trigger || !active || !overlay.contains(trigger) || trigger.disabled) return;
  event.preventDefault(); const session = active, { state, data } = session, action = trigger.dataset.tradeAction;
  if (action === 'close') return close();
  if (action === 'retry') return checkout(session, true);
  if (!editable()) return;
  try {
    state.status = ''; state.error = false;
    if (action === 'refresh') return load(session);
    if (action === 'mode') { state.mode = trigger.dataset.mode; state.search = ''; state.limit = 24; if (state.mode === 'sold') void loadSold(session); }
    if (action === 'mobile') state.mobile = trigger.dataset.view;
    if (action === 'more') state.limit += 24;
    if (action === 'more-sold') { if (!session.soldLoading) void loadSold(session, true); }
    if (action === 'clear') { state.lines = []; state.stage = 'edit'; }
    if (action === 'remove') state.lines = state.lines.filter(line => line.id !== trigger.dataset.lineId);
    if (action === 'confirm-price') { const line = state.lines.find(line => line.id === trigger.dataset.lineId); if (line) line.priceNeedsReview = false; }
    if (action === 'self-pay') {
      const recipient = sceneTradeAccounts(data).find(account => account.key === state.recipientKey);
      if (!recipient?.canDebit) throw Error('Für diesen Empfänger besitzt du keine Zahlberechtigung.');
      state.payerKey = recipient.key;
    }
    if (action === 'add-buy') {
      const product = data.offers.find(product => product.id === trigger.dataset.productId);
      if (!product) throw Error('Die Ware ist nicht mehr verfügbar.');
      addSceneTradeBuy(state, product); state.openLine = state.lines.at(-1)?.id || '';
    }
    if (action === 'add-sell') {
      const account = sceneTradeAccounts(data).find(account => account.key === state.sellerKey);
      const item = account?.record.inventory?.items?.find(item => item.id === trigger.dataset.itemId);
      if (!item) throw Error('Dieser Gegenstand ist nicht mehr im Inventar.');
      addSceneTradeSell(state, item, account, data.offers); state.openLine = state.lines.at(-1)?.id || '';
    }
    if (action === 'review') { buildSceneTradeCheckout(state, data); state.stage = 'review'; }
    if (action === 'back') state.stage = 'edit';
    if (action === 'checkout') return checkout(session);
    render(session);
  } catch (error) { status(session, error.message || 'Bitte die Eingabe prüfen.', true); }
}
function change(event) {
  if (!editable()) return;
  const target = event.target, { state, data } = active, accounts = sceneTradeAccounts(data);
  try {
    state.status = ''; state.error = false;
    if (target.dataset.lineField) {
      const line = state.lines.find(line => line.id === target.dataset.lineId);
      if (line) { state.openLine = line.id; updateSceneTradeLine(line, target.dataset.lineField, target.value, accounts); }
    }
    const field = target.dataset.tradeField;
    if (field === 'merchantId') {
      if (state.lines.length) throw Error('Leere zuerst die Bestellung, um den Händler zu wechseln.');
      if (target.value && !data.providers.some(provider => provider.id === target.value)) throw Error('Dieser Händler ist nicht verfügbar.');
      state.merchantId = target.value; active.sold = []; active.soldNextCursor = null; active.soldToken++; active.availabilityToken++; state.search = ''; state.limit = 24;
      void loadAvailability(active);
      if (state.mode === 'sold') void loadSold(active);
    }
    if (['payerKey', 'sellerKey', 'recipientKey'].includes(field)) {
      if (!accounts.some(account => account.key === target.value && (field === 'recipientKey' || account.canDebit))) throw Error('Diese Zuordnung ist nicht berechtigt.');
      state[field] = target.value;
    }
    if (field === 'actorCharacterId') {
      if (!accounts.some(account => account.kind === 'character' && account.id === target.value && account.canDebit)) throw Error('Bitte eine berechtigte bestellende Figur wählen.');
      state.actorCharacterId = target.value;
      initializeSceneTradeDefaults(state, data, target.value);
    }
    render();
  } catch (error) { status(active, error.message || 'Bitte die Eingabe prüfen.', true); }
}
export function openSceneTradeDialog(options = {}) {
  const threadId = String(options.threadId || '').trim();
  if (!threadId) throw Error('Für den Handel fehlt die aktive Szene.');
  ensureOverlay(); returnFocus = document.activeElement;
  const session = sessions.get(threadId) || makeSession(threadId); sessions.set(threadId, session);
  session.options = options; active = session;
  overlay.classList.add('active'); overlay.setAttribute('aria-hidden', 'false'); render(session);
  globalThis.activateDialog?.(overlay.id, { initialFocus: '[data-trade-field="merchantId"]' });
  if (!session.submission.pending()) void load(session);
  else status(session, 'Ein Handelsauftrag ist noch offen. Bitte unverändert erneut prüfen.');
  return { close };
}
