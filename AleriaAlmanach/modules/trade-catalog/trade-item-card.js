const installedRoots = new WeakSet();

/** One delegated controller owns the transient card; item data stays in its template. */
export function installTradeItemCards(root = document) {
  if (installedRoots.has(root)) return;
  installedRoots.add(root);
  const doc = root.ownerDocument || root;
  let activeCard = null;

  root.addEventListener('click', event => {
    const trigger = event.target?.closest?.('[data-action="open-trade-item-card"]');
    if (!trigger || !root.contains(trigger)) return;
    const item = trigger.closest('.trade-catalog-item');
    const template = item?.querySelector('template[data-role="trade-item-card"]');
    if (!template) return;
    event.preventDefault();
    activeCard?.close();
    const card = doc.createElement('dialog');
    card.className = 'trade-item-card';
    card.setAttribute('aria-labelledby', 'trade-item-card-title');
    card.append(template.content.cloneNode(true));
    item.closest('.trade-catalog-page').append(card);
    activeCard = card;
    card.addEventListener('close', () => {
      card.remove();
      if (activeCard === card) activeCard = null;
      if (trigger.isConnected) trigger.focus({ preventScroll: true });
    }, { once: true });
    // Native Escape and focus trapping remain local to this dialog. The archive's
    // Escape/arrow shortcuts must not close or navigate the underlying module.
    card.addEventListener('keydown', event => event.stopPropagation());
    card.addEventListener('click', event => {
      if (event.target.closest('[data-action="close-trade-item-card"]')) {
        card.close();
        return;
      }
      if (event.target !== card) return;
      const box = card.getBoundingClientRect();
      if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) card.close();
    });
    card.showModal();
  });
}
