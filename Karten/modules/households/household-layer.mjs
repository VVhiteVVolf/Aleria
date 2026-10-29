import { layoutHouseholds } from './household-layout.mjs';
import { familyCrest, createFamilyList, createRegionDirectory } from './household-family-list.mjs';

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

export function createHouseholdLayer(map, runtime) {
  const layer = element('div', 'household-layer');
  layer.hidden = true;
  const lines = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  lines.setAttribute('aria-hidden', 'true'); lines.classList.add('household-lines');
  const groups = element('div', 'household-groups');
  const popup = element('section', 'household-popup');
  popup.id = 'household-popup'; popup.hidden = true;
  popup.setAttribute('role', 'dialog'); popup.setAttribute('aria-label', 'Familien am Ort');
  layer.append(lines, groups, popup); map.append(layer);
  let content = [], placed = [], activeId = null, pinned = false, timer, lastTrigger, restoringFocus = false, activeFingerprint;
  const rendered = new Map();
  const fingerprint = group => JSON.stringify([group.pin.title, group.families.map(family => [family.id, family.name, family.role, family.crest, family.href]), group.region]);

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
    clearTimeout(timer); popup.hidden = true; activeId = null; pinned = false;
    groups.querySelectorAll('[aria-expanded="true"]').forEach(node => node.setAttribute('aria-expanded', 'false'));
  }
  function positionPopup(group) {
    const viewport = usableViewport();
    const width = Math.min(360, viewport.width - 16);
    popup.style.width = width + 'px';
    popup.style.maxHeight = Math.max(100, Math.min(480, viewport.height - 24)) + 'px';
    const x = Math.max(8, Math.min(group.x, viewport.width - width - 8));
    const below = group.y + group.height + 8;
    const y = below + popup.offsetHeight <= viewport.height - 8 ? below : Math.max(8, group.y - popup.offsetHeight - 8);
    popup.style.left = x + 'px'; popup.style.top = y + 'px';
  }
  function open(id, sticky = false, trigger) {
    const group = placed.find(group => group.pin.id === id);
    if (!group) return;
    clearTimeout(timer);
    pinned = sticky || (activeId === id && pinned); activeId = id; lastTrigger = trigger || lastTrigger;
    activeFingerprint = fingerprint(group);
    popup.replaceChildren(); popup.setAttribute('aria-label', 'Familien in ' + group.pin.title);
    const header = element('div', 'household-popup-header');
    const title = element('h3', '', group.pin.title);
    const dismiss = element('button', 'household-close', '×');
    dismiss.type = 'button'; dismiss.dataset.householdAction = 'close'; dismiss.setAttribute('aria-label', 'Familienliste schließen');
    header.append(title, dismiss);
    const count = element('p', 'household-count', group.families.length + (group.families.length === 1 ? ' Familie am Ort' : ' Familien am Ort'));
    const list = createFamilyList(group.families);
    const place = element('button', 'household-open-place', 'Ort ansehen');
    place.type = 'button'; place.dataset.householdAction = 'place';
    popup.append(header, count, list, place); popup.hidden = false;
    if (group.region) popup.append(createRegionDirectory(group.region));
    groups.querySelectorAll('[data-household-pin]').forEach(node => node.setAttribute('aria-expanded', String(node.dataset.householdPin === id)));
    positionPopup(group);
  }
  function button(group, className) {
    const node = element('button', className);
    node.type = 'button'; node.dataset.householdPin = group.pin.id;
    node.setAttribute('aria-label', `${group.pin.title}: ${group.families.map(family => family.name).join(', ')}${group.region ? `; ${group.region.count} weitere Häuser in ${group.region.name}` : ''}`);
    node.setAttribute('aria-controls', popup.id); node.setAttribute('aria-haspopup', 'dialog'); node.setAttribute('aria-expanded', String(activeId === group.pin.id));
    return node;
  }
  function render(next) {
    content = next;
    placed = layoutHouseholds(content, { image: runtime.mapImageSize(), transform: runtime.mapTransform(), viewport: usableViewport() });
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
        const anchor = button(group, 'household-anchor'), pill = button(group, 'household-pill');
        for (const family of group.families.slice(0, 5)) pill.append(familyCrest(family));
        if (group.families.length > 5) pill.append(element('span', 'household-more', '+' + (group.families.length - 5)));
        if (group.region) pill.append(element('span', 'household-region-count', 'Region +' + group.region.count));
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
  function delayedClose() { if (!pinned) timer = setTimeout(close, 180); }
  groups.addEventListener('pointerover', event => {
    const target = event.target.closest('[data-household-pin]');
    if (target && (!pinned || activeId === target.dataset.householdPin)) open(target.dataset.householdPin, false, target);
  });
  groups.addEventListener('pointerout', delayedClose);
  groups.addEventListener('focusin', event => {
    if (restoringFocus) return;
    const target = event.target.closest('[data-household-pin]');
    if (target) open(target.dataset.householdPin, false, target);
  });
  groups.addEventListener('click', event => {
    const target = event.target.closest('[data-household-pin]');
    if (target) { open(target.dataset.householdPin, true, target); popup.querySelector('button').focus(); }
  });
  popup.addEventListener('pointerenter', () => clearTimeout(timer));
  popup.addEventListener('pointerleave', delayedClose);
  layer.addEventListener('focusout', event => { if (!layer.contains(event.relatedTarget)) delayedClose(); });
  // Prevent map dragging on controls; empty overlay space remains transparent to input.
  for (const type of ['mousedown', 'touchstart', 'dblclick', 'wheel']) layer.addEventListener(type, event => event.stopPropagation());
  popup.addEventListener('click', event => {
    const action = event.target.closest('[data-household-action]')?.dataset.householdAction;
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
