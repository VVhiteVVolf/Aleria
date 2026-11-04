import { createSceneTradeService } from './scene-trade-service.js';
import { renderSceneTradeDialog, renderSceneTradeCatalogResults } from './scene-trade-view.js';
import { createSceneTradeState, initializeSceneTradeDefaults, sceneTradeAccounts, addSceneTradeBuy,
  addSceneTradeSell, updateSceneTradeLine, buildSceneTradeCheckout, refreshSceneTradeLines, sceneTradeSummary } from './scene-trade-state.js';
import { createSceneTradeSubmission } from './scene-trade-submission.js';
import { mountSceneTradeActorPickers } from './scene-trade-actor-picker.js';
import { mountSceneTradePeopleManager, renderSceneTradePeopleManager } from './scene-trade-people-manager.js';
import { resolveSceneTradeParticipants, sceneTradeSelectableAccounts } from './scene-trade-participants.js';
import { createSceneTradeParticipantPreferences, createSceneTradeParticipantSource } from './scene-trade-participant-state.js';
import { findSceneTradeProduct } from './scene-trade-catalog.js';
import { createSceneTradeAccountReadiness } from './scene-trade-account-readiness.js';

// One personal, browser-local draft belongs to one exact scene thread. A closed
// window retains an unresolved request so reopening never creates a second sale.
const sessions = new Map();
let overlay = null, active = null, returnFocus = null, actorPickers = null, rendering = false;
const frame = callback => (globalThis.requestAnimationFrame || (fn => setTimeout(fn, 0)))(callback);
const cancelFrame = handle => (globalThis.cancelAnimationFrame || clearTimeout)(handle);
function makeSession(threadId) {
  const service = createSceneTradeService();
  return { state: createSceneTradeState(threadId), service, submission: createSceneTradeSubmission(input => service.checkout(input), undefined, { requirePersistence: true }),
    data: { characters: [], groups: [], offers: [], providers: [], access: {} }, loading: false, loaded: false,
    sold: [], soldNextCursor: null, soldLoading: false, soldToken: 0, availabilityToken: 0, options: {},
    participants: null, participantUid: '', participantToken: 0, participantLoading: false, participantError: '', catalogFrame: null };
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
    active.state.search = event.target.value; active.state.limit = 24; active.state.offset = 0;
    const session = active;
    if (session.catalogFrame == null) session.catalogFrame = frame(() => { session.catalogFrame = null; renderCatalog(session); });
  });
  overlay.addEventListener('toggle', event => {
    if (event.target.dataset.tradeDetail && event.target.open && active) active.state.openLine = event.target.dataset.tradeDetail;
  }, true);
  overlay.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    event.preventDefault(); event.stopPropagation(); if (!actorPickers?.close()) close();
  });
  actorPickers = mountSceneTradeActorPickers(overlay, { canEdit: editable,
    getAccounts: () => active?.selectableAccounts || [], onSelect: selectAccount });
  mountSceneTradePeopleManager(overlay, { canEdit: editable,
    getContext: () => ({ accounts: active?.renderAccounts || [], selected: active?.selectableAccounts || [], state: active.state }),
    onChange: changeParticipants });
  document.addEventListener('aleria:comments-updated', event => {
    const session = active;
    if (!session?.participantSource || !session.options.participantThreadIds?.includes(event.detail?.threadId)) return;
    session.participantSource.update(event.detail.threadId, event.detail.comments || []);
    updateParticipants(session, true);
  });
}
function editable() { return active && !active.loading && !active.submission.pending() && !active.submission.running(); }
function renderCatalog(session = active) {
  if (session !== active || !overlay || session.state.stage === 'review') return;
  const target = overlay.querySelector('[data-trade-catalog-results]');
  if (target) target.innerHTML = renderSceneTradeCatalogResults({ ...session, accounts: session.renderAccounts });
}
function render(session = active) {
  if (!session || session !== active || !overlay || rendering) return;
  rendering = true;
  try {
  if (session.catalogFrame != null) { cancelFrame(session.catalogFrame); session.catalogFrame = null; }
  const focused = overlay.contains(document.activeElement) ? document.activeElement : null;
  const picker = focused?.closest?.('[data-trade-actor-picker]');
  const pickerFocus = focused?.matches?.('[data-trade-picker-search]') && picker
    ? `[data-trade-actor-picker][data-picker-field="${CSS.escape(picker.dataset.pickerField)}"][data-picker-line="${CSS.escape(picker.dataset.pickerLine)}"]` : '';
  const peopleQuery = focused?.matches?.('[data-trade-people-search]') ? focused.value : null;
  const pickerQuery = pickerFocus ? focused.value : null;
  const focus = peopleQuery != null ? '[data-trade-people-search]' : pickerFocus ? `${pickerFocus} [data-trade-picker-search]` : focused?.dataset.tradeField ? `[data-trade-field="${focused.dataset.tradeField}"]`
    : focused?.dataset.lineField ? `[data-line-id="${CSS.escape(focused.dataset.lineId)}"][data-line-field="${focused.dataset.lineField}"]` : '';
  const selection = focused && ['text', 'search'].includes(focused.type) ? [focused.selectionStart, focused.selectionEnd] : null;
  const editingValue = focused?.dataset.lineField && focused.tagName === 'INPUT' ? focused.value : null;
  const scrolls = ['.scene-trade-fields', '.scene-trade-catalog', '.scene-trade-cart'].map(selector => [selector, overlay.querySelector(selector)?.scrollTop || 0]);
  const peopleOpen = !!overlay.querySelector('[data-trade-people]')?.open;
  session.renderAccounts = session.accountReadiness?.decorate(sceneTradeAccounts(session.data)) || sceneTradeAccounts(session.data);
  session.selectableAccounts = sceneTradeSelectableAccounts(session.renderAccounts, session.participants);
  overlay.innerHTML = renderSceneTradeDialog({ ...session, accounts: session.renderAccounts, selectableAccounts: session.selectableAccounts,
    summary: tradeSummary(session), busy: session.submission.running(), pending: !!session.submission.pending(), pendingRequest: session.submission.pending() });
  const people = overlay.querySelector('[data-trade-participant-manager]');
  if (people) {
    people.innerHTML = renderSceneTradePeopleManager({ accounts: session.renderAccounts, selected: session.selectableAccounts,
      state: session.state, loading: session.participantLoading, error: session.participantError,
      persistent: session.participantPreferences?.snapshot().persistent !== false });
    people.querySelector('details').open = peopleOpen;
  }
  for (const [selector, scroll] of scrolls) { const element = overlay.querySelector(selector); if (element) element.scrollTop = scroll; }
  if (pickerFocus) {
    const restored = overlay.querySelector(pickerFocus);
    if (restored) { restored.open = true; restored.querySelector('[data-trade-picker-search]').value = pickerQuery; }
  }
  if (peopleQuery != null) {
    const input = overlay.querySelector('[data-trade-people-search]');
    if (input) { input.value = peopleQuery; input.dispatchEvent(new Event('input', { bubbles: true })); }
  }
  if (focus) {
    const next = overlay.querySelector(focus);
    if (next && editingValue != null) next.value = editingValue;
    next?.focus({ preventScroll: true }); if (next && selection) next.setSelectionRange(...selection);
  }
  } finally { rendering = false; }
}
function updateParticipants(session, notify = false) {
  if (!session.participantPreferences) return;
  const ids = session.options.participantThreadIds || [session.state.threadId];
  const previous = [...(session.participants?.ids || [])].sort().join('\0');
  const preferences = session.participantPreferences.snapshot();
  const pinned = session.state.lines.flatMap(line => [line.payerKey, line.recipientKey, line.sellerKey])
    .filter(key => key?.startsWith('character:')).map(key => key.slice('character:'.length));
  if (session.state.lines.length) pinned.push(session.state.actorCharacterId);
  session.participants = resolveSceneTradeParticipants({ characters: session.data.characters,
    entries: session.data.context?.ancestry || [session.options.entry].filter(Boolean),
    references: session.participantSource?.references(ids) || [], ...preferences,
    includeIds: [...preferences.includeIds, ...pinned], excludeIds: preferences.excludeIds.filter(id => !pinned.includes(id)),
    preferredActorId: session.options.actorCharacterId });
  session.data.tradeThreadId = session.state.threadId;
  session.data.tradeActorCharacterId = session.state.actorCharacterId || session.options.actorCharacterId;
  const all = sceneTradeAccounts(session.data), selected = sceneTradeSelectableAccounts(all, session.participants);
  initializeSceneTradeDefaults(session.state, session.data, session.options.actorCharacterId, selected);
  // A removed ordering actor may change group eligibility. Reconcile defaults
  // against that resolved actor; existing cart assignments remain untouched.
  initializeSceneTradeDefaults(session.state, session.data, session.state.actorCharacterId,
    sceneTradeSelectableAccounts(sceneTradeAccounts(session.data), session.participants));
  if (notify && [...session.participants.ids].sort().join('\0') !== previous) {
    void hydrateParticipants(session).catch(error => status(session, error.message, true));
    if (session === active) render(session);
  }
}
function hydrateParticipants(session) {
  return session.accountReadiness?.ensure(sceneTradeSelectableAccounts(sceneTradeAccounts(session.data), session.participants)) || Promise.resolve();
}
function tradeSummary(session) {
  const summary = sceneTradeSummary(session.state, session.data, session.renderAccounts);
  if (summary.rows.some(account => account.definitionsReady === false)) summary.errors.push('Ein gewähltes Inventar wird noch vorbereitet.');
  return summary;
}
function assertAccountReadiness(session, keys) {
  const accounts = sceneTradeAccounts(session.data);
  session.accountReadiness?.assert(accounts.filter(account => keys.includes(account.key)));
}
function prepareParticipants(session) {
  if (session.participantUid !== session.data.access.uid) {
    session.participantUid = session.data.access.uid;
    let storage; try { storage = globalThis.localStorage; } catch { /* Browser may forbid preferences. */ }
    session.participantPreferences = createSceneTradeParticipantPreferences({ uid: session.participantUid, threadId: session.state.threadId, storage });
    session.accountReadiness = createSceneTradeAccountReadiness(session.service.ensureAccountsVersions
      ? records => session.service.ensureAccountsVersions(records) : null, () => render(session));
    session.participantSource = createSceneTradeParticipantSource({
      cachedComments: id => session.options.getCachedComments?.(id) ?? null,
      isCachedCurrent: id => id === session.state.threadId && globalThis.getCurrentCommentThreadId?.() === id,
      loadComments: async id => {
        const backend = await globalThis.getCommentBackend?.({ timeoutMs: 1500 });
        if (!backend?.loadComments) throw Error('Bisherige Beiträge sind gerade nicht erreichbar.');
        return backend.loadComments(id);
      }
    });
  }
  updateParticipants(session);
}
async function loadParticipants(session) {
  const token = ++session.participantToken;
  session.participantLoading = true; session.participantError = '';
  try {
    await session.participantSource.load(session.options.participantThreadIds || [session.state.threadId], () => {
      if (token === session.participantToken) updateParticipants(session, true);
    }, { isCurrent: () => session === active && token === session.participantToken });
  } catch (error) { if (token === session.participantToken) session.participantError = error.message; }
  finally { if (token === session.participantToken) { session.participantLoading = false; render(session); } }
}
function selectAccount({ field, lineId, value }) {
  if (!editable()) return;
  change({ target: { value, dataset: lineId ? { lineId, lineField: field } : { tradeField: field } } });
  overlay.querySelector(`[data-trade-actor-picker][data-picker-field="${CSS.escape(field)}"][data-picker-line="${CSS.escape(lineId || '')}"] summary`)?.focus({ preventScroll: true });
}
async function changeParticipants(action, id) {
  if (!editable()) return;
  const session = active;
  if (action === 'add' && !session.data.characters.some(character => character.id === id && !character.archived)) return;
  if (action === 'reset') session.participantPreferences.reset();
  else if (action === 'add') session.participantPreferences.add(id);
  else if (action === 'remove') session.participantPreferences.remove(id);
  else return;
  updateParticipants(session);
  render(session);
  try { await hydrateParticipants(session); }
  catch (error) { if (active === session) status(session, error.message, true); }
}
function status(session, message, error = false) { session.state.status = message; session.state.error = error; render(session); }
async function load(session) {
  if (session.loading || session.submission.pending()) return;
  session.loading = true; status(session, '');
  try {
    session.data = await session.service.load({ ...session.options, threadId: session.state.threadId }); session.loaded = true;
    let browserStorage;
    try { browserStorage = globalThis.sessionStorage; } catch { /* The submission reports a clear storage error. */ }
    session.submission.bindPersistence({ storage: browserStorage, uid: session.data.access.uid, threadId: session.state.threadId });
    if (session.submission.pending()) {
      session.state.status = 'Ein Handelsauftrag ist noch offen. Bitte unverändert erneut prüfen.';
      return;
    }
    prepareParticipants(session);
    if (!session.state.merchantId && !session.state.lines.length) session.state.merchantId = session.data.proposedMerchantId || '';
    await hydrateParticipants(session);
    if (!session.state.lines.length && session.state.merchantId && !session.data.providers.some(provider => provider.id === session.state.merchantId)) session.state.merchantId = '';
    if (session.state.merchantId) await loadAvailability(session);
    refreshSceneTradeLines(session.state, session.data);
    if (session.state.mode === 'sold' && session.state.merchantId) void loadSold(session);
  } catch (error) { session.state.status = error.message || 'Der Handel konnte nicht geöffnet werden.'; session.state.error = true; }
  finally { session.loading = false; render(session); }
  if (session === active && session.loaded && !session.submission.pending() && session.participantSource) void loadParticipants(session);
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
  if (active?.catalogFrame != null) { cancelFrame(active.catalogFrame); active.catalogFrame = null; }
  if (active) active.participantToken++;
  active = null;
  if (returnFocus?.isConnected) returnFocus.focus({ preventScroll: true });
}
async function checkout(session, retry = false) {
  if (session.submission.running()) return;
  try {
    if (!retry) assertAccountReadiness(session, sceneTradeSummary(session.state, session.data).rows.map(account => account.key));
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
    if (action === 'mode') { state.mode = trigger.dataset.mode; state.search = ''; state.limit = 24; state.offset = 0; if (state.mode === 'sold') void loadSold(session); }
    if (action === 'mobile') state.mobile = trigger.dataset.view;
    if (action === 'more' || action === 'catalog-back') {
      state.offset = Math.max(0, (state.offset || 0) + (action === 'more' ? 24 : -24));
      renderCatalog(session); overlay.querySelector('[data-trade-catalog-results]')?.scrollIntoView({ block: 'nearest' }); return;
    }
    if (action === 'more-sold') { if (!session.soldLoading) void loadSold(session, true); }
    if (action === 'clear') { state.lines = []; state.stage = 'edit'; updateParticipants(session); }
    if (action === 'remove') { state.lines = state.lines.filter(line => line.id !== trigger.dataset.lineId); updateParticipants(session); }
    if (action === 'confirm-price') { const line = state.lines.find(line => line.id === trigger.dataset.lineId); if (line) line.priceNeedsReview = false; }
    if (action === 'self-pay') {
      const recipient = sceneTradeAccounts(data).find(account => account.key === state.recipientKey);
      if (!recipient?.canDebit) throw Error('Für diesen Empfänger besitzt du keine Zahlberechtigung.');
      state.payerKey = recipient.key;
    }
    if (action === 'add-buy') {
      assertAccountReadiness(session, [state.payerKey, state.recipientKey]);
      const product = findSceneTradeProduct(data, trigger.dataset.productId, state.merchantId);
      if (!product) throw Error('Die Ware ist nicht mehr verfügbar.');
      addSceneTradeBuy(state, product); state.openLine = state.lines.at(-1)?.id || '';
    }
    if (action === 'add-sell') {
      assertAccountReadiness(session, [state.sellerKey]);
      const account = sceneTradeAccounts(data).find(account => account.key === state.sellerKey);
      const item = account?.record.inventory?.items?.find(item => item.id === trigger.dataset.itemId);
      if (!item) throw Error('Dieser Gegenstand ist nicht mehr im Inventar.');
      addSceneTradeSell(state, item, account, data.offers); state.openLine = state.lines.at(-1)?.id || '';
    }
    if (action === 'review') { assertAccountReadiness(session, sceneTradeSummary(state, data).rows.map(account => account.key)); buildSceneTradeCheckout(state, data); state.stage = 'review'; }
    if (action === 'back') state.stage = 'edit';
    if (action === 'checkout') return checkout(session);
    render(session);
  } catch (error) { status(session, error.message || 'Bitte die Eingabe prüfen.', true); }
}
function change(event) {
  if (!editable() || rendering || event.target?.isConnected === false) return;
  const session = active, target = event.target, { state, data } = session, accounts = sceneTradeAccounts(data);
  const selected = sceneTradeSelectableAccounts(accounts, session.participants);
  try {
    state.status = ''; state.error = false;
    if (target.dataset.lineField) {
      const line = state.lines.find(line => line.id === target.dataset.lineId);
      if (line) { state.openLine = line.id; updateSceneTradeLine(line, target.dataset.lineField, target.value, selected); }
    }
    const field = target.dataset.tradeField;
    if (field === 'merchantId') {
      if (state.lines.length) throw Error('Leere zuerst die Bestellung, um den Händler zu wechseln.');
      if (target.value && !data.providers.some(provider => provider.id === target.value)) throw Error('Dieser Händler ist nicht verfügbar.');
      state.merchantId = target.value; active.sold = []; active.soldNextCursor = null; active.soldToken++; active.availabilityToken++; state.search = ''; state.limit = 24; state.offset = 0;
      void loadAvailability(active);
      if (state.mode === 'sold') void loadSold(active);
    }
    if (['payerKey', 'sellerKey', 'recipientKey'].includes(field)) {
      if (!selected.some(account => account.key === target.value && (field === 'recipientKey' || account.canDebit))) throw Error('Diese Zuordnung ist nicht berechtigt.');
      state[field] = target.value; if (field === 'sellerKey') state.offset = 0;
    }
    if (field === 'actorCharacterId') {
      if (!selected.some(account => account.kind === 'character' && account.id === target.value && account.canDebit)) throw Error('Bitte eine berechtigte bestellende Figur wählen.');
      state.actorCharacterId = target.value;
      data.tradeThreadId = state.threadId; data.tradeActorCharacterId = target.value;
      initializeSceneTradeDefaults(state, data, target.value, sceneTradeSelectableAccounts(sceneTradeAccounts(data), session.participants));
      void hydrateParticipants(session).catch(error => status(session, error.message, true));
    }
    render();
  } catch (error) { status(session, error.message || 'Bitte die Eingabe prüfen.', true); }
}
export function openSceneTradeDialog(options = {}) {
  const threadId = String(options.threadId || '').trim();
  if (!threadId) throw Error('Für den Handel fehlt die aktive Szene.');
  ensureOverlay(); returnFocus = document.activeElement;
  const session = sessions.get(threadId) || makeSession(threadId); sessions.set(threadId, session);
  session.options = options; active = session;
  overlay.classList.add('active'); overlay.setAttribute('aria-hidden', 'false'); render(session);
  globalThis.activateDialog?.(overlay.id, { initialFocus: '[data-trade-field="search"]' });
  if (!session.submission.pending()) void load(session);
  else status(session, 'Ein Handelsauftrag ist noch offen. Bitte unverändert erneut prüfen.');
  return { close };
}
