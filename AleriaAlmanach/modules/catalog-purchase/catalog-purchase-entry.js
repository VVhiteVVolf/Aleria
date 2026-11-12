import { catalogPurchaseSourceFromElement } from './catalog-purchase-source.js';
// Register pages activate this feature lazily; startup and scene drafts stay independent.
export function installCatalogPurchases(root = document, { loadController = async () => {
  const { createCatalogPurchaseController } = await import('./catalog-purchase-controller.js');
  return createCatalogPurchaseController({ document: root.ownerDocument || root });
} } = {}) {
  const lifetime = new AbortController();
  let loading = null, controller = null, destroyed = false;
  const pendingRoots = new WeakSet();
  const ensure = () => loading ||= Promise.resolve().then(loadController).then(value => {
    if (destroyed) { value.destroy(); return null; }
    return controller = value;
  }).catch(error => { loading = null; throw error; });
  function decorate(scope) {
    const pages = [...(scope.matches?.('[data-catalog-purchase-module]') ? [scope] : []), ...(scope.querySelectorAll?.('[data-catalog-purchase-module]') || [])];
    for (const page of pages) {
      if (pendingRoots.has(page)) continue;
      pendingRoots.add(page);
      void ensure().then(value => value?.decorate(page)).catch(() => pendingRoots.delete(page));
    }
  }
  root.addEventListener('click', async event => {
    const trigger = event.target?.closest?.('[data-action="catalog-purchase"]');
    if (!trigger || trigger.disabled || !root.contains(trigger)) return;
    const scope = trigger.closest('[data-catalog-purchase-module]');
    if (!scope) return;
    event.preventDefault(); event.stopPropagation();
    const row = trigger.closest('[data-catalog-source-kind]');
    const sourceRef = catalogPurchaseSourceFromElement(trigger);
    if (!sourceRef) return;
    const options = { moduleId: scope.dataset.catalogPurchaseModule, pageIndex: sourceRef.pageIndex, sourceRef, trigger };
    const original = trigger.textContent;
    trigger.disabled = true;
    try { await (await ensure())?.open(options); }
    catch {
      trigger.textContent = 'Erneut öffnen';
      trigger.title = 'Der Schnellkauf konnte nicht geladen werden. Bitte erneut versuchen.';
    } finally {
      if (trigger.isConnected && !row?.classList.contains('catalog-purchase-sold') && trigger.textContent !== 'Nicht verfügbar') {
        trigger.disabled = false;
        if (trigger.textContent === original) trigger.textContent = 'Kaufen';
      }
    }
  }, { capture: true, signal: lifetime.signal });
  // Catalog roots are inserted by the existing classic module renderers.
  // Watching insertion does not load figures or inventories on the homepage.
  const observer = new MutationObserver(records => {
    for (const record of records) for (const node of record.addedNodes) if (node.nodeType === 1) decorate(node);
  });
  observer.observe(root, { childList: true, subtree: true });
  decorate(root);
  return { destroy() { destroyed = true; lifetime.abort(); observer.disconnect(); controller?.destroy(); } };
}

if (typeof document !== 'undefined') installCatalogPurchases();
