const bindings = new WeakMap();

/** One delegated, scoped tooltip owner; dynamically rendered cards need no listeners. */
export function bindCombatTooltips(root) {
  if (!root || bindings.has(root)) return bindings.get(root);
  const document = root.ownerDocument || root;
  const abort = new AbortController();
  let active = null, popup = null, previousDescription = '', serial = 0;
  const hide = () => {
    if (active) {
      if (previousDescription) active.setAttribute('aria-describedby', previousDescription);
      else active.removeAttribute('aria-describedby');
    }
    popup?.remove(); popup = null; active = null;
  };
  const show = (source, anchor = source) => {
    if (!source?.dataset.combatTooltip || source.closest('[hidden]')) return;
    if (active === anchor) return;
    hide(); active = anchor;
    popup = document.createElement('div');
    popup.className = 'combat-tooltip'; popup.id = `combat-tooltip-${++serial}`;
    popup.setAttribute('role', 'tooltip'); popup.textContent = source.dataset.combatTooltip;
    previousDescription = anchor.getAttribute('aria-describedby') || '';
    anchor.setAttribute('aria-describedby', [previousDescription, popup.id].filter(Boolean).join(' '));
    (anchor.closest('dialog[open]') || document.body).append(popup);
    const bounds = anchor.getBoundingClientRect(), size = popup.getBoundingClientRect();
    const width = document.documentElement.clientWidth;
    popup.style.left = `${Math.max(8, Math.min(width - size.width - 8, bounds.left + (bounds.width - size.width) / 2))}px`;
    const top = bounds.top >= size.height + 16 ? bounds.top - size.height - 8 : bounds.bottom + 8;
    popup.style.top = `${Math.max(8, Math.min(document.defaultView.innerHeight - size.height - 8, top))}px`;
  };
  const listen = (event, handler, options = {}) => root.addEventListener(event, handler, { ...options, signal: abort.signal });
  listen('pointerover', event => show(event.target.closest?.('[data-combat-tooltip]')));
  listen('pointerout', event => { if (active && !active.contains(event.relatedTarget)) hide(); });
  listen('focusin', event => {
    const source = event.target.closest?.('[data-combat-tooltip]') || event.target.querySelector?.('[data-combat-tooltip]');
    show(source, event.target);
  });
  listen('focusout', hide);
  listen('keydown', event => { if (event.key === 'Escape' && popup) { event.preventDefault(); event.stopPropagation(); hide(); } }, { capture: true });
  listen('click', event => {
    const target = event.target.closest?.('[data-combat-tooltip][tabindex]');
    if (target) show(target);
    else hide();
  });
  listen('scroll', hide, { capture: true, passive: true });
  const dispose = () => { hide(); abort.abort(); bindings.delete(root); };
  bindings.set(root, dispose);
  return dispose;
}
