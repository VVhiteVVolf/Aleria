import { cloneRegion, validateRegion } from './region-model.mjs';
import { createRegionSession } from './region-session.mjs';
import { createRegionLayer } from './region-layer.mjs?v=20261024c';
import { createRegionPanel } from './region-panel.mjs';
import { bindRegionInteraction } from './region-interaction.mjs';

export function mountRegionEditor(runtime, root = document) {
  const map = root.getElementById('map-wrap');
  const stage = root.getElementById('map-stage');
  if (!map || !stage) return;
  const layer = createRegionLayer(stage, runtime);
  const panel = createRegionPanel(map, runtime.esc);
  const button = document.createElement('button');
  button.type = 'button'; button.className = 'tbtn'; button.textContent = 'Gebiete';
  button.dataset.action = 'open-region-manager';
  button.setAttribute('aria-expanded', 'false');
  root.getElementById('layer-btns').after(button);
  let session = null;
  let open = false;
  let lastFocus = null;
  const regions = () => Array.isArray(runtime.state().regions) ? runtime.state().regions : [];
  const maps = () => window.KartoMapRegistry?.all().filter(map => map.status === 'active') || [];
  function syncVisibility() {
    const visible = root.getElementById('lb-regions')?.classList.contains('on');
    layer.show(Boolean(visible || session), session ? 1 : Number(root.getElementById('lr')?.style.opacity || 1));
  }
  function redraw() {
    layer.render(regions(), session); syncVisibility(); panel.update(session);
    map.classList.toggle('region-drawing-active', Boolean(session));
  }
  function renderPanel() {
    panel.element.hidden = !open;
    button.setAttribute('aria-expanded', String(open));
    if (open) panel.render({ regions: regions(), session, editMode: runtime.isEditMode(), dominions: runtime.dominions(), maps: maps(), parentMapId: window.KARTO_SELECTED_MAP?.parentMapId });
    redraw();
  }
  function requireEditor() {
    if (!runtime.isEditMode()) throw new Error('Bitte zuerst Bearbeiten aktivieren.');
    if (runtime.isAddingPin() || window.KartoPinEditor?.isOpen() || runtime.travelMode() !== 'pan' || window.KartoStampOverwrite?.isStamping()) {
      throw new Error('Bitte die andere Kartenbearbeitung zuerst beenden.');
    }
  }
  function discard(ask = false) {
    if (ask && session?.dirty() && !confirm('Nicht übernommene Regionsänderungen verwerfen?')) return false;
    session = null; renderPanel(); return true;
  }
  function commit(next, label) {
    const before = cloneRegion(regions());
    runtime.pushUndo(label, () => { runtime.state().regions = before; });
    runtime.state().regions = next;
    session = null; runtime.save(); runtime.flushSave(); renderPanel();
  }
  function save() {
    session.finish();
    const draft = cloneRegion(session.draft());
    draft.name = draft.name.trim();
    validateRegion(draft, regions());
    const next = regions().filter(region => region.id !== draft.id);
    const index = regions().findIndex(region => region.id === draft.id);
    next.splice(index < 0 ? next.length : index, 0, draft);
    commit(next, 'Region: ' + draft.name);
    runtime.toast('Region im lokalen Kartenentwurf übernommen');
  }
  function remove() {
    const draft = session.draft();
    const next = regions().filter(region => region.id !== draft.id).map(region => region.parentId === draft.id ? { ...region, parentId: draft.parentId || '' } : region);
    commit(next, 'Region entfernt: ' + draft.name);
  }
  function select(id) {
    const region = regions().find(region => region.id === id);
    if (!region) return;
    if (!runtime.isEditMode()) {
      runtime.toast(region.name + (region.note ? ': ' + region.note : ''));
      return;
    }
    requireEditor();
    session = createRegionSession(region); renderPanel();
  }
  function start(kind) {
    requireEditor();
    if (!runtime.mapImageSize().width) throw new Error('Bitte warten, bis das Kartenbild geladen ist.');
    session = createRegionSession({ id: runtime.uid(), name: '', kind, paths: [[]], color: '#a74732', opacity: .25, parentId: '', dominionId: '', targetMapId: '', showLabel: true }, { isNew: true });
    window.activateLayer('regions'); renderPanel();
    panel.element.querySelector('[name="name"]').focus();
  }
  const actions = {
    close() { if (discard(true)) { open = false; renderPanel(); lastFocus?.focus(); } },
    select: target => select(target.dataset.regionId),
    'new-area': () => start('area'),
    'new-boundary': () => start('boundary'),
    finish: () => session.finish(),
    undo: () => session.undo(),
    insert: () => session.startInsertion(),
    remove: () => session.remove(),
    redraw: () => session.redraw(),
    part: () => session.addPart(),
    save, discard: () => discard(false), delete: remove,
  };
  button.addEventListener('click', () => {
    if (open) { actions.close(); return; }
    lastFocus = root.activeElement; open = true; window.activateLayer('regions'); renderPanel();
  });
  panel.element.addEventListener('click', event => {
    const target = event.target.closest('[data-region-action]');
    if (!target || !panel.element.contains(target)) return;
    try { actions[target.dataset.regionAction]?.(target); panel.error(''); redraw(); }
    catch (error) { panel.error(error.message); }
  });
  panel.element.addEventListener('submit', event => event.preventDefault());
  panel.element.addEventListener('input', event => {
    if (!session || !event.target.closest('[data-region-form]')) return;
    const input = event.target;
    const value = input.type === 'checkbox' ? input.checked : input.name === 'opacity' ? Number(input.value) / 100 : input.value;
    session.patch({ [input.name]: value }); redraw();
  });
  bindRegionInteraction({ map, panel: panel.element, runtime, session: () => session, changed: redraw, discard, report: message => panel.error(message) });
  window.addEventListener('aleria:karto:state-changed', event => {
    if (event.detail.reason === 'loaded-state') session = null;
    if (!session) renderPanel();
    else redraw();
  });
  window.addEventListener('aleria:karto:map-render', redraw);
  window.addEventListener('aleria:karto:view-changed', () => layer.rescale());
  window.addEventListener('aleria:karto:layers-changed', syncVisibility);
  window.addEventListener('aleria:karto:edit-mode-changed', renderPanel);
  window.addEventListener('aleria:karto:before-editor-transition', event => {
    if (session) event.preventDefault();
  });
  window.addEventListener('beforeunload', event => {
    if (session?.dirty()) { event.preventDefault(); event.returnValue = ''; }
  });
  redraw();
}

if (typeof document !== 'undefined' && window.KartoRuntime) mountRegionEditor(window.KartoRuntime);
