import { createCatalogLoader } from './household-catalog.mjs';
import { householdGroups } from './household-model.mjs';
import { createHouseholdLayer } from './household-layer.mjs';
import { mountHouseholdField } from './household-editor.mjs';
import { attachHouseholdRegions } from './household-regions.mjs';

const preferenceKey = 'aleria.karto.household-crests';

export function mountHouseholdOverlay(runtime, root = document) {
  const map = root.getElementById('map-wrap');
  const controls = root.getElementById('layer-btns');
  if (!map || !controls) return;
  const selectedMap = window.KARTO_SELECTED_MAP || { id: window.KARTO_CONFIG?.mapId, hierarchy: [] };
  const loadCatalog = createCatalogLoader();
  const layer = createHouseholdLayer(map, runtime);
  const toggle = document.createElement('button');
  toggle.type = 'button'; toggle.className = 'tbtn household-toggle'; toggle.textContent = 'Wappen';
  toggle.id = 'toggle-household-crests'; toggle.setAttribute('aria-pressed', 'false');
  toggle.title = 'Familienwappen an ihren zugeordneten Orten ein-/ausblenden';
  controls.after(toggle);
  let enabled = false, index, frame, loading = false;
  try { enabled = localStorage.getItem(preferenceKey) === 'on'; } catch { /* private browsing */ }
  function redraw() {
    const visible = enabled && !runtime.isEditMode();
    toggle.setAttribute('aria-pressed', String(enabled)); toggle.classList.toggle('on', enabled);
    layer.show(visible && Boolean(index));
    if (!visible || !index) return;
    const groups = householdGroups(runtime.state().pins || [], selectedMap, index, { filter: runtime.activeFilter(), dominions: runtime.dominions() });
    layer.render(attachHouseholdRegions(groups, selectedMap, index, runtime.dominions()));
    toggle.title = groups.length ? `Familienwappen an ${groups.length} Orten ausblenden` : 'Für diese Ansicht sind noch keine festen Familiensitze zugeordnet';
  }
  async function ensureCatalog() {
    if (index || loading) return;
    loading = true; toggle.setAttribute('aria-busy', 'true');
    try {
      index = await loadCatalog(); redraw();
      if (enabled && runtime.state().pins?.length && !householdGroups(runtime.state().pins, selectedMap, index, { dominions: runtime.dominions() }).length) runtime.toast('Für diese Karte sind noch keine festen Familiensitze zugeordnet.');
    } catch (error) { enabled = false; redraw(); runtime.toast(error.message); }
    finally { loading = false; toggle.removeAttribute('aria-busy'); }
  }
  toggle.addEventListener('click', () => {
    enabled = !enabled;
    try { localStorage.setItem(preferenceKey, enabled ? 'on' : 'off'); } catch { /* session-only fallback */ }
    redraw(); if (enabled) ensureCatalog();
  });
  const refresh = () => { if (frame) return; frame = requestAnimationFrame(() => { frame = null; redraw(); }); };
  for (const name of ['state-changed', 'map-render', 'pins-rendered', 'edit-mode-changed']) window.addEventListener('aleria:karto:' + name, refresh);
  window.addEventListener('aleria:karto:view-changed', refresh);
  window.addEventListener('resize', refresh);
  const categories = root.getElementById('cat-bar-wrap');
  if (categories) new ResizeObserver(refresh).observe(categories);
  root.addEventListener('aleria:karto:pin-residents-editor', event => mountHouseholdField(event.detail, { loadCatalog, map: selectedMap, dominions: runtime.dominions() }));
  redraw(); if (enabled) ensureCatalog();
}

if (typeof document !== 'undefined' && window.KartoRuntime) mountHouseholdOverlay(window.KartoRuntime);
