function personId(card) {
  return card?.__data__?.data?.id || '';
}

export function createFamilyChartRelationshipFocus({ container, onReferenceActivate }) {
  let activeIds = [];

  function refresh() {
    const routes = [...container.querySelectorAll('[data-related-card-ids]')];
    const relatedIds = new Set(activeIds);
    const activeRoutes = new Set(routes.filter(route => (route.dataset.relatedCardIds || '').split(',').some(id => activeIds.includes(id))));
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

  function idsForTarget(target) {
    const reference = target?.closest?.('.aleria-connection-reference, .aleria-partnership-node');
    if (reference && container.contains(reference)) return (reference.dataset.relatedCardIds || '').split(',');
    const card = target?.closest?.('.card_cont');
    return card && container.contains(card) ? [personId(card)].filter(Boolean) : [];
  }

  function enter(event) {
    const ids = idsForTarget(event.target);
    if (ids.join(',') === activeIds.join(',')) return;
    activeIds = ids;
    refresh();
  }

  function leave(event) {
    const ids = idsForTarget(event.relatedTarget);
    if (ids.join(',') === activeIds.join(',')) return;
    activeIds = ids;
    refresh();
  }

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
      activeIds = [];
      refresh();
    }
  });
}
