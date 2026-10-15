const bindings = new WeakMap();
const sequences = new WeakMap();

/** A delegated tooltip owner per root and data attribute, including dynamic content. */
export function bindDelegatedTooltips(root, { attribute, className, idPrefix, clickSelector } = {}) {
  if (!root || !attribute) return;
  const owners = bindings.get(root) || new Map();
  if (owners.has(attribute)) return owners.get(attribute);
  const document = root.ownerDocument || root, abort = new AbortController();
  const selector = `[${attribute}]`;
  let source = null, anchor = null, popup = null, previousDescription = '';
  const hide = () => {
    if (anchor) {
      if (previousDescription) anchor.setAttribute('aria-describedby', previousDescription);
      else anchor.removeAttribute('aria-describedby');
    }
    popup?.remove(); popup = null; source = null; anchor = null;
  };
  const show = (nextSource, nextAnchor = nextSource) => {
    const text = nextSource?.getAttribute(attribute);
    if (!text || nextSource.closest('[hidden]') || !nextSource.isConnected) return;
    if (anchor === nextAnchor && source === nextSource) return;
    owners.forEach(owner => owner.hide()); source = nextSource; anchor = nextAnchor;
    popup = document.createElement('div'); popup.className = className;
    const serial = (sequences.get(document) || 0) + 1;
    sequences.set(document, serial);
    popup.id = `${idPrefix}-${serial}`; popup.setAttribute('role', 'tooltip'); popup.textContent = text;
    previousDescription = anchor.getAttribute('aria-describedby') || '';
    anchor.setAttribute('aria-describedby', [previousDescription, popup.id].filter(Boolean).join(' '));
    (anchor.closest('dialog[open]') || document.body).append(popup);
    const bounds = source.getBoundingClientRect(), size = popup.getBoundingClientRect();
    const width = document.documentElement.clientWidth;
    popup.style.left = `${Math.max(8, Math.min(width - size.width - 8, bounds.left + (bounds.width - size.width) / 2))}px`;
    const top = bounds.top >= size.height + 16 ? bounds.top - size.height - 8 : bounds.bottom + 8;
    popup.style.top = `${Math.max(8, Math.min(document.defaultView.innerHeight - size.height - 8, top))}px`;
  };
  const listen = (event, handler, options = {}) => root.addEventListener(event, handler, { ...options, signal: abort.signal });
  listen('pointerover', event => show(event.target.closest?.(selector)));
  listen('pointerout', event => { if (source && !source.contains(event.relatedTarget)) hide(); });
  listen('focusin', event => show(event.target.closest?.(selector) || event.target.querySelector?.(selector), event.target));
  listen('focusout', hide);
  listen('keydown', event => { if (event.key === 'Escape' && popup) { event.preventDefault(); event.stopPropagation(); hide(); } }, { capture: true });
  listen('click', event => {
    const target = event.target.closest?.(clickSelector || selector);
    if (target) show(target);
    else hide();
  });
  listen('scroll', hide, { capture: true, passive: true });
  document.defaultView?.addEventListener('resize', hide, { signal: abort.signal });
  const dispose = () => { hide(); abort.abort(); owners.delete(attribute); if (!owners.size) bindings.delete(root); };
  const owner = Object.freeze({ hide, dispose });
  owners.set(attribute, owner); bindings.set(root, owners);
  return owner;
}
