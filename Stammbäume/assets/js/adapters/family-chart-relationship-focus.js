function personId(card) {
  return card?.__data__?.data?.id || '';
}

export function createFamilyChartRelationshipFocus({ container, onReferenceActivate }) {
  let selection = { ids: [], partnershipId: '' };

  function refresh() {
    const { ids: activeIds, partnershipId } = selection;
    const routes = [...container.querySelectorAll('[data-related-card-ids]')];
    const relatedIds = new Set(activeIds);
    const activeRoutes = new Set(routes.filter(route => {
      if (!activeIds.length) return false;
      if (partnershipId && route.dataset.partnershipId) return route.dataset.partnershipId === partnershipId;
      const ids = (route.dataset.relatedCardIds || '').split(',');
      return activeIds.every(id => ids.includes(id));
    }));
    activeRoutes.forEach(route => (route.dataset.relatedCardIds || '').split(',').forEach(id => relatedIds.add(id)));
    container.classList.toggle('has-relationship-focus', activeIds.length > 0);
    routes.forEach(route => {
      route.classList.toggle('is-relationship-focused', activeRoutes.has(route));
      // Native paths carry a library-owned inline opacity. Set its final
      // reading state here too, otherwise CSS cannot dim those paths.
      route.style.opacity = activeIds.length && !activeRoutes.has(route) ? '0.13' : '';
    });
    container.querySelectorAll('.card_cont').forEach(card => {
      card.classList.toggle('is-relationship-focused', relatedIds.has(personId(card)));
      card.classList.toggle('is-relationship-origin', activeIds.includes(personId(card)));
    });
    // Crossing ornaments belong to their source route, rather than the person
    // under the crossing. They must dim with that route too.
    const activeRouteIds = new Set([...activeRoutes].map(route => route.dataset.routeId));
    container.querySelectorAll('.aleria-line-crossing-overlay').forEach(overlay => {
      const focused = activeRouteIds.has(overlay.dataset.crossingSourceRouteId);
      overlay.classList.toggle('is-relationship-focused', focused);
      overlay.style.opacity = activeIds.length && !focused ? '0.13' : '';
    });
  }

  function selectionForTarget(target) {
    const reference = target?.closest?.('.aleria-connection-reference, .aleria-partnership-node');
    if (reference && container.contains(reference)) return {
      ids: (reference.dataset.relatedCardIds || '').split(',').filter(Boolean),
      partnershipId: reference.dataset.partnershipId || ''
    };
    const card = target?.closest?.('.card_cont');
    return { ids: card && container.contains(card) ? [personId(card)].filter(Boolean) : [], partnershipId: '' };
  }

  function selectTarget(target) {
    const next = selectionForTarget(target);
    if (next.partnershipId === selection.partnershipId && next.ids.join(',') === selection.ids.join(',')) return;
    selection = next;
    refresh();
  }

  const enter = event => selectTarget(event.target);
  const leave = event => selectTarget(event.relatedTarget);

  function referenceEvent(event) {
    const trigger = event.target?.closest?.('[data-action="open-relationship-reference"]');
    if (!trigger || !container.contains(trigger)) return;
    event.stopPropagation();
    if (event.type === 'click') onReferenceActivate?.({ personId: trigger.dataset.personId, partnershipId: trigger.dataset.partnershipId || '', event });
  }

  function keydown(event) {
    const card = event.target?.closest?.('.aleria-person-card');
    if (!card || event.target !== card || !['Enter', ' '].includes(event.key)) return;
    event.preventDefault();
    card.click();
  }

  const listeners = [['pointerover', enter], ['pointerout', leave], ['focusin', enter], ['focusout', leave], ['keydown', keydown], ['click', referenceEvent], ['pointerdown', referenceEvent]];
  listeners.forEach(([event, listener]) => container.addEventListener(event, listener));
  return Object.freeze({
    refresh,
    destroy() {
      listeners.forEach(([event, listener]) => container.removeEventListener(event, listener));
      selection = { ids: [], partnershipId: '' };
      refresh();
    }
  });
}
