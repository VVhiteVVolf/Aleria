import { layoutPlaceRosters, layoutRosterPopup } from './place-roster-layout.mjs';

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

export function createPlaceRosterLayer(map, runtime, presentation) {
  const classes = suffix => `place-roster-${suffix} ${presentation.namespace}-${suffix}`;
  const layer = element('div', classes('layer'));
  layer.hidden = true;
  const lines = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  lines.setAttribute('aria-hidden', 'true'); lines.classList.add('place-roster-lines', `${presentation.namespace}-lines`);
  const groups = element('div', classes('groups'));
  const popup = element('section', classes('popup'));
  popup.id = `${presentation.namespace}-popup`; popup.hidden = true;
  popup.setAttribute('role', 'dialog'); popup.setAttribute('aria-label', presentation.popupLabel);
  layer.append(lines, groups, popup); map.append(layer);
  let content = [], placed = [], activeId = null, pinned = false, timer, lastTrigger, restoringFocus = false, activeFingerprint;
  const rendered = new Map();
  const fingerprint = group => JSON.stringify([group.pin.title, group.members.map(member => [member.id, member.name, member.role, member.crest || member.portrait, member.href]), group.region]);

  function usableViewport() {
    const viewport = runtime.mapViewportSize();
    const bounds = map.getBoundingClientRect();
    const categories = map.ownerDocument.getElementById('cat-bar-wrap')?.getBoundingClientRect();
    const bottom = categories?.height && categories.top > bounds.top && categories.top < bounds.bottom
      ? categories.top - bounds.top : viewport.height;
    return { width: viewport.width, height: Math.max(0, Math.min(viewport.height, bottom)) };
  }

  function restoreFocus() {
    restoringFocus = true; lastTrigger?.focus(); restoringFocus = false;
  }

  function close() {
    if (!popup.hidden) window.dispatchEvent(new CustomEvent('aleria:karto:popover-visibility', { detail: { id: popup.id, open: false } }));
    clearTimeout(timer); popup.hidden = true; activeId = null; pinned = false;
    groups.querySelectorAll('[aria-expanded="true"]').forEach(node => node.setAttribute('aria-expanded', 'false'));
  }
  function positionPopup(group) {
    const viewport = usableViewport();
    popup.style.width = Math.min(360, viewport.width - 16) + 'px';
    const layout = layoutRosterPopup(group, viewport, popup.scrollHeight);
    popup.style.width = layout.width + 'px'; popup.style.maxHeight = layout.maxHeight + 'px';
    popup.style.left = layout.x + 'px'; popup.style.top = layout.y + 'px';
  }
  function open(id, sticky = false, trigger) {
    const group = placed.find(group => group.pin.id === id);
    if (!group) return;
    clearTimeout(timer);
    pinned = sticky || (activeId === id && pinned); activeId = id; lastTrigger = trigger || lastTrigger;
    activeFingerprint = fingerprint(group);
    popup.replaceChildren(); popup.setAttribute('aria-label', `${presentation.popupLabel}: ${group.pin.title}`);
    const header = element('div', classes('popup-header'));
    const title = element('h3', '', group.pin.title);
    const dismiss = element('button', classes('close'), '×');
    dismiss.type = 'button'; dismiss.dataset.rosterAction = 'close'; dismiss.dataset[`${presentation.namespace}Action`] = 'close'; dismiss.setAttribute('aria-label', `${presentation.popupLabel} schließen`);
    header.append(title, dismiss);
    const count = element('p', classes('count'), presentation.countLabel(group.members.length));
    const list = presentation.renderList(group.members);
    const place = element('button', classes('open-place'), 'Ort ansehen');
    place.type = 'button'; place.dataset.rosterAction = 'place'; place.dataset[`${presentation.namespace}Action`] = 'place';
    popup.append(header, count, list, place); popup.hidden = false;
    window.dispatchEvent(new CustomEvent('aleria:karto:popover-visibility', { detail: { id: popup.id, open: true } }));
    const extra = presentation.renderExtra?.(group);
    if (extra) popup.append(extra);
    groups.querySelectorAll('[data-roster-pin]').forEach(node => node.setAttribute('aria-expanded', String(node.dataset.rosterPin === id)));
    positionPopup(group);
  }
  function button(group, className) {
    const node = element('button', className);
    node.type = 'button'; node.dataset.rosterPin = group.pin.id; node.dataset[`${presentation.namespace}Pin`] = group.pin.id;
    node.setAttribute('aria-label', presentation.groupLabel(group));
    node.setAttribute('aria-controls', popup.id); node.setAttribute('aria-haspopup', 'dialog'); node.setAttribute('aria-expanded', String(activeId === group.pin.id));
    return node;
  }
  function render(next) {
    content = next;
    placed = layoutPlaceRosters(content, { image: runtime.mapImageSize(), transform: runtime.mapTransform(), viewport: usableViewport(),
      memberCount: group => group.members.length, extraWidth: presentation.extraWidth, maxPortraits: presentation.maxPortraits });
    const visibleIds = new Set(placed.map(group => group.pin.id));
    for (const [id, nodes] of rendered) {
      if (visibleIds.has(id)) continue;
      nodes.line.remove(); nodes.anchor.remove(); nodes.pill.remove(); rendered.delete(id);
    }
    for (const [index, group] of placed.entries()) {
      let nodes = rendered.get(group.pin.id);
      const stamp = fingerprint(group);
      if (!nodes || nodes.stamp !== stamp) {
        if (nodes) { nodes.line.remove(); nodes.anchor.remove(); nodes.pill.remove(); }
        const line = document.createElementNS(lines.namespaceURI, 'line');
        const anchor = button(group, classes('anchor')), pill = button(group, classes('pill'));
        const count = presentation.maxPortraits || 5;
        for (const member of group.members.slice(0, count)) pill.append(presentation.renderPortrait(member));
        if (group.members.length > count) pill.append(element('span', classes('more'), '+' + (group.members.length - count)));
        const badge = presentation.badge?.(group);
        if (badge) pill.append(element('span', classes('region-count'), badge));
        nodes = { line, anchor, pill, stamp }; rendered.set(group.pin.id, nodes);
      }
      const { line, anchor, pill } = nodes;
      for (const [key, value] of Object.entries({ x1: group.anchor.x, y1: group.anchor.y, x2: group.x + group.width / 2, y2: group.y + group.height / 2 })) line.setAttribute(key, value);
      anchor.style.left = group.anchor.x + 'px'; anchor.style.top = group.anchor.y + 'px';
      pill.style.left = group.x + 'px'; pill.style.top = group.y + 'px'; pill.style.width = group.width + 'px';
      if (lines.children[index] !== line) lines.insertBefore(line, lines.children[index] || null);
      if (groups.children[index * 2] !== anchor) groups.insertBefore(anchor, groups.children[index * 2] || null);
      if (groups.children[index * 2 + 1] !== pill) groups.insertBefore(pill, groups.children[index * 2 + 1] || null);
    }
    if (activeId) {
      const active = placed.find(group => group.pin.id === activeId);
      if (!active) close();
      else if (activeFingerprint !== fingerprint(active)) open(activeId, pinned);
      else positionPopup(active);
    }
  }
  function delayedClose() {
    clearTimeout(timer);
    if (!pinned) timer = setTimeout(() => { if (!pinned) close(); }, 180);
  }
  groups.addEventListener('pointerover', event => {
    if (presentation.previewOnHover === false) return;
    const target = event.target.closest('[data-roster-pin]');
    if (target && (!pinned || activeId === target.dataset.rosterPin)) open(target.dataset.rosterPin, false, target);
  });
  groups.addEventListener('pointerout', delayedClose);
  groups.addEventListener('focusin', event => {
    if (restoringFocus || presentation.previewOnHover === false) return;
    const target = event.target.closest('[data-roster-pin]');
    if (target) open(target.dataset.rosterPin, false, target);
  });
  groups.addEventListener('click', event => {
    const target = event.target.closest('[data-roster-pin]');
    if (target) { open(target.dataset.rosterPin, true, target); popup.querySelector('button').focus(); }
  });
  popup.addEventListener('pointerenter', () => clearTimeout(timer));
  popup.addEventListener('pointerleave', delayedClose);
  layer.addEventListener('focusout', event => { if (!layer.contains(event.relatedTarget)) delayedClose(); });
  // Prevent map dragging on controls; empty overlay space remains transparent to input.
  for (const type of ['mousedown', 'touchstart', 'dblclick', 'wheel']) layer.addEventListener(type, event => event.stopPropagation());
  popup.addEventListener('click', event => {
    const action = event.target.closest('[data-roster-action]')?.dataset.rosterAction;
    if (action === 'close') { close(); restoreFocus(); }
    if (action === 'place' && activeId) { const id = activeId; close(); runtime.openPin(id); }
  });
  layer.addEventListener('keydown', event => {
    if (event.key === 'Escape') { event.stopPropagation(); close(); restoreFocus(); }
  });
  map.addEventListener('mousedown', event => { if (!layer.contains(event.target)) close(); });
  return { element: layer, render, close,
    rescale() { render(content); },
    show(visible) { layer.hidden = !visible; if (!visible) close(); },
  };
}
