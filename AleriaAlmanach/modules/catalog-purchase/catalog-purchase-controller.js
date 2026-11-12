import { createCatalogPurchaseService } from './catalog-purchase-service.js';
import { catalogPurchasePayerOptions, catalogPurchaseGroupMembers, resolveCatalogPurchaseSelection,
  matchCatalogPurchaseOffers, catalogPurchasePreview, buildCatalogPurchaseCheckout } from './catalog-purchase-model.js';
import { createCatalogPurchasePreferences } from './catalog-purchase-preferences.js';
import { createCatalogPurchaseSubmission } from './catalog-purchase-submission.js';
import { renderCatalogPurchaseDialog, renderCatalogPurchaseLoading, renderCatalogPurchaseSummary } from './catalog-purchase-view.js';
import { mountSceneTradeActorPickers } from '../scene-trade/scene-trade-actor-picker.js';
import { reconcileSceneTradeAvailability } from '../scene-trade/scene-trade-availability.js';
import { catalogPurchaseSourceFromElement } from './catalog-purchase-source.js';
export { catalogPurchaseSourceFromElement } from './catalog-purchase-source.js';

function browserStorage(name) { try { return globalThis[name]; } catch { return null; } }

/** One small native dialog; purchases remain exclusively in the shared server transaction. */
export function createCatalogPurchaseController({ document: doc = globalThis.document, createService = createCatalogPurchaseService,
  pendingStorage = browserStorage('sessionStorage'), preferencesStorage = browserStorage('localStorage'), makeId } = {}) {
  const sessions = new Map(), availability = new Map();
  const roots = new Set();
  let current = null, sequence = 0;
  const sessionFor = moduleId => {
    if (!sessions.has(moduleId)) {
      const service = createService();
      sessions.set(moduleId, { service, submission: createCatalogPurchaseSubmission(input => service.checkout(input), makeId) });
    }
    return sessions.get(moduleId);
  };
  const alive = view => current === view && view.dialog.isConnected;
  function close() {
    const view = current;
    if (!view) return;
    current = null; sequence++;
    view.pickers?.destroy(); view.lifetime.abort();
    view.dialog.close(); view.dialog.remove();
    if (view.options.trigger?.isConnected) view.options.trigger.focus({ preventScroll: true });
  }
  function preview(view) {
    const result = catalogPurchasePreview(view.selection, view.data);
    const pending = view.session.submission.pending();
    return pending ? { ...result, totalMinor: pending.lines[0].expectedTotalMinor } : result;
  }
  function render(view, focusField = '') {
    if (!alive(view)) return;
    const accounts = catalogPurchasePayerOptions(view.data);
    view.dialog.innerHTML = renderCatalogPurchaseDialog({ ...view, accounts, products: view.products,
      preview: preview(view), pending: view.session.submission.pending() });
    if (focusField) view.dialog.querySelector(`[data-picker-field="${focusField}"] summary`)?.focus({ preventScroll: true });
  }
  function summary(view) {
    if (!alive(view)) return;
    const target = view.dialog.querySelector('[data-catalog-purchase-summary]');
    if (target) target.innerHTML = renderCatalogPurchaseSummary(preview(view), {
      busy: view.busy, pending: !!view.session.submission.pending(), ready: view.ready });
  }
  async function prepareAccounts(view) {
    const token = ++view.accountsToken;
    view.ready = false;
    summary(view);
    try {
      const options = catalogPurchasePayerOptions(view.data);
      const records = options.filter(account => [view.selection.payerKey, view.selection.recipientKey].includes(account.key)).map(account => account.record);
      await view.session.service.ensureAccountsVersions(records);
      if (!alive(view) || token !== view.accountsToken) return;
      view.ready = true; summary(view);
    } catch (error) {
      if (!alive(view) || token !== view.accountsToken) return;
      view.status = error.message; view.error = true; render(view);
    }
  }
  function select(view, { field, value }) {
    if (!alive(view) || view.busy || view.session.submission.pending()) return;
    const options = catalogPurchasePayerOptions(view.data), oldPayer = view.selection.payerKey;
    if (field === 'payerKey') {
      const payer = options.find(option => option.key === value && option.canDebit);
      if (!payer) return;
      view.selection.payerKey = value;
      if (payer.kind === 'character') {
        if (!view.selection.recipientKey || view.selection.recipientKey === oldPayer) view.selection.recipientKey = payer.key;
        view.selection.actorCharacterId = payer.id;
      } else {
        const actor = payer.members.find(member => `character:${member.id}` === view.selection.recipientKey) || payer.members[0];
        view.selection.actorCharacterId = actor.id;
        view.selection.recipientKey ||= `character:${actor.id}`;
      }
    } else if (field === 'recipientId') {
      if (!options.some(option => option.kind === 'character' && option.id === value)) return;
      view.selection.recipientKey = `character:${value}`;
    } else if (field === 'actorCharacterId') {
      const group = view.data.groups.find(record => `group:${record.id}` === view.selection.payerKey);
      if (!catalogPurchaseGroupMembers(view.data, group).some(member => member.id === value)) return;
      view.selection.actorCharacterId = value;
    } else return;
    view.preferences.save(view.selection);
    view.status = ''; view.error = false;
    render(view, field); void prepareAccounts(view);
  }
  async function confirm(view, retry = false) {
    if (!alive(view) || view.busy || (!retry && !view.ready)) return;
    view.busy = true; view.error = false; view.status = 'Kauf wird bestätigt …'; render(view);
    try {
      const result = retry ? await view.session.submission.retry()
        : await view.session.submission.submit(buildCatalogPurchaseCheckout(view.selection, view.data));
      // A reply can arrive after this dialog was closed. Its operation and the
      // public availability still need reconciliation without reopening it.
      const line = result.receipt?.lines?.[0];
      const bought = view.data.offers.find(item => item.id === line?.productId);
      if (bought?.definitionKind === 'unique') {
        view.data.offers = view.data.offers.map(item => item.definitionRef?.id === bought.definitionRef?.id
          ? { ...item, available: false, availabilityStatus: 'owned' } : item);
      }
      availability.delete(view.options.moduleId);
      const visibleRoots = [...roots].filter(root => root.isConnected && root.dataset.catalogPurchaseModule === view.options.moduleId);
      const localAvailability = view.data.offers.map(product => ({ productId: product.id, sourceRefs: product.sourceRefs,
        available: product.available !== false, unique: product.definitionKind === 'unique', status: product.availabilityStatus || 'available' }));
      for (const root of visibleRoots) applyAvailability(root, localAvailability);
      void Promise.all(visibleRoots.map(root => decorate(root, true)));
      if (!alive(view)) return;
      view.products = view.products.map(product => view.data.offers.find(item => item.id === product.id) || product);
      view.status = `${line?.quantity || view.selection.quantity} × ${line?.name || bought?.title || 'Ware'} gekauft und ins Inventar übertragen.`;
      view.ready = true;
    } catch (error) {
      if (!alive(view)) return;
      view.status = error.message || 'Der Kauf konnte noch nicht bestätigt werden.'; view.error = true;
      // A definitive failure releases the draft. An uncertain response keeps
      // exactly the same stored request for the explicit retry button.
      if (!view.session.submission.pending()) {
        try { await refreshAvailability(view, true); } catch { /* Original failure remains visible. */ }
      }
    } finally {
      if (alive(view)) { view.busy = false; render(view); }
    }
  }
  async function confirmedAvailability(moduleId, service, force = false) {
    const cached = availability.get(moduleId);
    if (cached && (cached.pending || !force && Date.now() - cached.at < 15000)) return cached.promise;
    const promise = service.availability({ moduleId });
    const entry = { at: Date.now(), promise, pending: true };
    availability.set(moduleId, entry);
    try { return await promise; }
    catch (error) { if (availability.get(moduleId) === entry) availability.delete(moduleId); throw error; }
    finally { entry.pending = false; }
  }
  async function refreshAvailability(view, force = false) {
    const products = await confirmedAvailability(view.options.moduleId, view.session.service, force);
    const result = reconcileSceneTradeAvailability(view.data.offers, view.data.merchantId, products);
    view.data.offers = result.offers;
    view.products = view.products.map(product => view.data.offers.find(item => item.id === product.id) || product);
    for (const root of roots) if (root.isConnected && root.dataset.catalogPurchaseModule === view.options.moduleId) applyAvailability(root, products);
    return result;
  }
  function applyAvailability(root, products) {
    for (const button of root.querySelectorAll('[data-action="catalog-purchase"]')) {
      const row = button.closest('[data-catalog-source-kind]');
      const matches = matchCatalogPurchaseOffers(products, catalogPurchaseSourceFromElement(button));
      const sold = matches.length > 0 && matches.every(product => product.unique && !product.available && ['owned', 'sold'].includes(product.status));
      const blocked = matches.length > 0 && matches.every(product => !product.available);
      row?.classList.toggle('catalog-purchase-sold', sold);
      button.disabled = sold || blocked;
      button.textContent = sold ? 'Gekauft · nicht verfügbar' : blocked ? 'Nicht verfügbar' : 'Kaufen';
    }
  }
  async function decorate(root, force = false) {
    if (!root?.isConnected || !root.dataset.catalogPurchaseModule) return;
    for (const previous of roots) if (!previous.isConnected) roots.delete(previous);
    roots.add(root);
    try {
      const moduleId = root.dataset.catalogPurchaseModule;
      const products = await confirmedAvailability(moduleId, sessionFor(moduleId).service, force);
      if (!root.isConnected) return;
      applyAvailability(root, products);
    } catch { /* Browsing remains usable when anonymous or temporarily offline. */ }
  }
  async function open(options) {
    close();
    const token = ++sequence, session = sessionFor(options.moduleId);
    const dialog = doc.createElement('dialog'); dialog.className = 'catalog-purchase-dialog scene-trade-card';
    dialog.setAttribute('aria-labelledby', 'catalog-purchase-title'); dialog.innerHTML = renderCatalogPurchaseLoading();
    doc.body.append(dialog);
    const view = { options, dialog, session, lifetime: new AbortController(), accountsToken: 0, data: {}, selection: {}, products: [],
      ready: false, busy: true, status: '', error: false };
    current = view;
    dialog.addEventListener('cancel', event => { event.preventDefault(); if (!view.pickers?.close()) close(); }, { signal: view.lifetime.signal });
    dialog.addEventListener('keydown', event => event.stopPropagation(), { signal: view.lifetime.signal });
    dialog.addEventListener('click', event => {
      const action = event.target.closest?.('[data-action]')?.dataset.action;
      if (action === 'close-catalog-purchase') close();
      else if (action === 'confirm-catalog-purchase') void confirm(view);
      else if (action === 'retry-catalog-purchase') void confirm(view, true);
      else if (action === 'refresh-catalog-purchase') void open(options);
    }, { signal: view.lifetime.signal });
    dialog.addEventListener('input', event => {
      if (event.target.dataset.catalogField !== 'quantity' || view.busy || session.submission.pending()) return;
      view.selection.quantity = event.target.value; summary(view);
    }, { signal: view.lifetime.signal });
    dialog.addEventListener('change', event => {
      if (event.target.dataset.catalogField !== 'productId' || view.busy || session.submission.pending()) return;
      view.selection.productId = event.target.value; view.selection.quantity = 1; render(view);
    }, { signal: view.lifetime.signal });
    dialog.showModal();
    try {
      view.data = await session.service.load(options);
      if (!alive(view) || token !== sequence) return;
      view.preferences = createCatalogPurchasePreferences(preferencesStorage, view.data.access.uid, options.moduleId);
      session.submission.bindPersistence({ storage: pendingStorage, uid: view.data.access.uid, threadId: options.moduleId });
      const pending = session.submission.pending();
      if (pending && Number.isSafeInteger(pending.catalogPageIndex) && pending.catalogPageIndex !== options.pageIndex) {
        const uid = view.data.access.uid;
        const original = await session.service.load({ ...options, pageIndex: pending.catalogPageIndex });
        if (!alive(view) || token !== sequence) return;
        if (original.access.uid !== uid) throw Error('Die Anmeldung hat gewechselt. Bitte zur Anmeldung des offenen Kaufs zurückkehren.');
        view.data = original;
      }
      view.selection = { ...resolveCatalogPurchaseSelection(view.data, view.preferences.read()), quantity: 1 };
      view.products = matchCatalogPurchaseOffers(view.data.offers, { ...options.sourceRef, moduleId: options.moduleId, pageIndex: options.pageIndex });
      if (pending) {
        const line = pending.lines[0];
        view.selection = { actorCharacterId: pending.actorCharacterId, payerKey: line.payerKey, recipientKey: line.recipientKey,
          productId: line.productId, quantity: line.quantity };
        view.products = view.data.offers.filter(product => product.id === line.productId);
      } else view.selection.productId = view.products[0]?.id || '';
      if (!view.products.length && !pending) throw Error('Diese Ware wurde im aktuellen Register nicht eindeutig gefunden. Bitte das Modul neu laden.');
      await refreshAvailability(view);
      if (!alive(view) || token !== sequence) return;
      view.pickers = mountSceneTradeActorPickers(dialog, { canEdit: () => alive(view) && !view.busy && !session.submission.pending(),
        emptyMessage: 'Keine passende Figur oder Gruppenkasse gefunden.',
        getAccounts: ({ field } = {}) => {
          const accounts = catalogPurchasePayerOptions(view.data);
          if (field !== 'actorCharacterId') return accounts;
          const group = accounts.find(account => account.key === view.selection.payerKey && account.kind === 'group');
          return accounts.filter(account => account.kind === 'character' && group?.members.some(member => member.id === account.id));
        }, onSelect: selection => select(view, selection) });
      view.busy = false; render(view); void prepareAccounts(view);
    } catch (error) {
      if (!alive(view) || token !== sequence) return;
      view.busy = false; view.dialog.innerHTML = renderCatalogPurchaseLoading(error.message || 'Der Schnellkauf konnte nicht geladen werden.');
    }
  }
  return { open, decorate, destroy() { close(); sessions.clear(); availability.clear(); roots.clear(); } };
}
