import { createPlaceRosterLayer } from '../place-roster/place-roster-layer.mjs';
import { createRosterPortrait, createRosterList } from '../place-roster/place-roster-members.mjs';
import { peopleGroups } from './people-model.mjs';

export function mountPeopleOverlay(runtime, config, root = document) {
  const households = config?.peopleLayer?.groups, map = root.getElementById('map-wrap'), controls = root.getElementById('layer-btns');
  if (!households?.length || !map || !controls || root.getElementById('lb-people')) return;
  const layer = createPlaceRosterLayer(map, runtime, {
    namespace: 'people', popupLabel: 'Bewohner', maxPortraits: 3, previewOnHover: false,
    countLabel: count => `${count} Bewohner an diesem Wohnort`,
    groupLabel: group => `${group.pin.title}: ${group.members.map(person => person.name).join(', ')}`,
    renderPortrait: createRosterPortrait, renderList: createRosterList
  });
  const toggle = root.createElement('button');
  toggle.type = 'button'; toggle.id = 'lb-people'; toggle.className = 'tbtn people-toggle place-roster-toggle';
  toggle.textContent = config.peopleLayer.label || 'Personen'; toggle.setAttribute('aria-pressed', 'false');
  toggle.title = 'Bewohner an ihren Wohnhäusern ein- oder ausblenden'; controls.append(toggle);
  const preferenceKey = `aleria.karto.people.${config.mapId}`;
  let enabled = false, frame;
  try { enabled = localStorage.getItem(preferenceKey) === 'on'; } catch { /* session preference */ }
  function redraw() {
    toggle.classList.toggle('on', enabled); toggle.setAttribute('aria-pressed', String(enabled));
    layer.show(enabled && !runtime.isEditMode());
    if (enabled && !runtime.isEditMode()) layer.render(peopleGroups(runtime.state().pins || [], households, { filter: runtime.activeFilter() }));
  }
  const refresh = () => { if (!frame) frame = requestAnimationFrame(() => { frame = null; redraw(); }); };
  toggle.addEventListener('click', () => {
    enabled = !enabled;
    try { localStorage.setItem(preferenceKey, enabled ? 'on' : 'off'); } catch { /* session preference */ }
    redraw();
  });
  for (const name of ['state-changed', 'map-render', 'pins-rendered', 'edit-mode-changed', 'view-changed']) window.addEventListener(`aleria:karto:${name}`, refresh);
  window.addEventListener('resize', refresh);
  const categories = root.getElementById('cat-bar-wrap');
  if (categories) new ResizeObserver(refresh).observe(categories);
  redraw();
  return { redraw, layer };
}

if (typeof document !== 'undefined' && window.KartoRuntime) mountPeopleOverlay(window.KartoRuntime, window.KARTO_CONFIG);
