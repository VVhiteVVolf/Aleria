import { normalizeLayout, normalizePoster, groupForPoster, indexPosterGroups, pinPosition, moveLayer, unlinkDeletedNotice } from './board-composition-model.mjs?v=20261029-performance-v1';
import { createPosterElement, positionElement } from './board-composition-view.mjs?v=20261029-performance-v1';
import { createPosterWizard } from './board-composition-creator.mjs?v=20261029-performance-v1';
import { createPosterInspector } from './board-composition-inspector.mjs?v=20261029-performance-v1';
import { compositionConfig } from './board-composition-config.mjs?v=20261029-performance-v1';
import { prepareBoardState } from './board-composition-migration.mjs?v=20261029-performance-v1';
import { loadBoardCompositionSources } from './board-composition-sources.mjs?v=20261031-current-catalog';

export async function initializeBoardComposition() {
  const config = compositionConfig(window.TAFEL_CONFIG);
  if (!config.enabled) return;
  const rt = () => window.TafelRuntime;
  const state = () => window.TafelState.get();
  const stacks = () => window.TafelNoticeStacks;
  let assets, preset;
  try {
    ({ assets, preset } = await loadBoardCompositionSources(config));
  } catch (error) {
    console.warn('[board-composition]', error);
    window.setTimeout(() => rt()?.toast('Die neue Plakattafel konnte nicht geladen werden. Die bisherige Tafel bleibt verfügbar.'), 0);
    return;
  }
  const assetMap = new Map(assets.map(asset => [asset.id, asset]));
  const assetIds = new Set(assetMap.keys());
  const editing = () => Boolean(layout() && rt()?.canEditZettel());
  const layout = () => state().boardLayout;
  const initialLayout = normalizeLayout(preset.layout, assets);
  const allGroups = () => stacks().groups(state().zettel, { includeSecret: true });
  let selectedId = null;
  let drag = null;
  let dragFrame = null;
  let pending = null;
  let ghost = null;
  let inspector = null;
  let wizard = null;
  const selected = () => layout()?.posters.find(poster => poster.id === selectedId);
  const group = (poster, includeSecret = editing()) => groupForPoster(poster, state().zettel, stacks(), includeSecret);
  const elementFor = posterId => document.querySelector(`[data-poster-id="${CSS.escape(posterId)}"]`);

  function prepareState(incoming) {
    return prepareBoardState(incoming, { assets, preset, stacks: stacks() });
  }

  function background() {
    if (!layout()) return '';
    const custom = state().boardImages?.board;
    return layout().useBoardImageOverride && custom ? custom : config.background;
  }

  function render(root) {
    // Show authored paper while a slow legacy read is pending. This read-only
    // preview never enters the persisted state.
    const visibleLayout = layout() || initialLayout;
    const board = window.TafelBoard.imageSize();
    const index = indexPosterGroups(state().zettel, stacks());
    const isEditing = editing();
    for (const poster of [...visibleLayout.posters].sort((a, b) => a.layer - b.layer)) {
      const asset = assetMap.get(poster.assetId);
      if (!asset) continue;
      const visibleGroup = (isEditing ? index.allById : index.visibleById).get(poster.noticeId);
      // Do not reveal even the existence of a secret-only publication.
      if (!isEditing && poster.noticeId && index.allById.has(poster.noticeId) && !visibleGroup) continue;
      root.append(createPosterElement(poster, asset, board, {
        esc: rt().esc, selected: isEditing && poster.id === selectedId, editing: isEditing, group: visibleGroup,
      }));
    }
  }

  function coveredNoticeIds() {
    const index = indexPosterGroups(state().zettel, stacks());
    return new Set((layout()?.posters || []).flatMap(poster => index.allById.get(poster.noticeId)?.notices.map(notice => notice.id) || []));
  }

  function movePin(point, posterId) {
    const poster = selected();
    if (!poster || poster.id !== posterId || !editing()) return;
    poster.pin.x = point.x; poster.pin.y = point.y;
    const pin = elementFor(poster.id)?.querySelector('.board-poster-pin');
    if (pin) { pin.style.left = `${point.x * 100}%`; pin.style.top = `${point.y * 100}%`; }
    syncPosition(poster);
    window.TafelState.save();
  }

  function syncPosition(poster) {
    const linked = group(poster, true);
    if (!linked) return;
    const point = pinPosition(poster, assetMap.get(poster.assetId), window.TafelBoard.imageSize());
    stacks().position(state().zettel, linked.notices[0].id, point.x, point.y);
  }

  function changed({ refreshInspector = false } = {}) {
    const poster = selected();
    if (poster) syncPosition(poster);
    rt().renderZettel();
    window.TafelState.save();
    if (refreshInspector) inspector.render();
  }

  function select(posterId) {
    selectedId = editing() ? posterId : null;
    document.querySelectorAll('.board-poster.is-selected').forEach(element => element.classList.remove('is-selected'));
    if (selectedId) elementFor(selectedId)?.classList.add('is-selected');
    inspector.render();
  }

  function assignContent(poster, noticeId) {
    const linked = stacks().members(state().zettel, noticeId, { includeSecret: true });
    for (const other of layout().posters) {
      if (other !== poster && linked.some(notice => notice.id === other.noticeId)) delete other.noticeId;
    }
    if (noticeId) poster.noticeId = noticeId;
    else delete poster.noticeId;
  }

  function change(field, value) {
    const poster = selected();
    if (!poster || !editing()) return;
    const next = structuredClone(poster);
    if (['x', 'y', 'width'].includes(field)) next[field] = value / 100;
    if (field === 'rotation') next.rotation = value;
    if (field === 'assetId' && assetIds.has(value)) next.assetId = value;
    if (field === 'nail') next.pin.assetId = value;
    if (field === 'pinX') next.pin.x = value / 100;
    if (field === 'pinY') next.pin.y = value / 100;
    if (field === 'pinSize') next.pin.size = value / 100;
    if (field === 'pinRotation') next.pin.rotation = value;
    if (field === 'enabled') next.pin.enabled = value;
    if (field === 'noticeId') assignContent(next, value);
    Object.assign(poster, normalizePoster(next, assetIds));
    if (!next.noticeId) delete poster.noticeId;
    changed();
  }

  function addContent() {
    const poster = selected();
    if (!poster) return;
    // The existing template picker and editor own notice creation.
    window.TafelEditor.openTypePicker(pinPosition(poster, assetMap.get(poster.assetId), window.TafelBoard.imageSize()), notice => {
      if (!layout()?.posters.includes(poster)) return;
      assignContent(poster, notice.id);
      poster.pin.enabled = true;
      changed({ refreshInspector: true });
    });
  }

  function action(name) {
    const poster = selected();
    if (!editing() || !poster) return;
    if (name === 'close') { select(null); return; }
    if (name === 'edit-content') { const linked = group(poster, true); if (linked) window.openZettelSidebar(linked.notices[0].id); return; }
    if (name === 'new-content') { addContent(); return; }
    if (['lower', 'raise', 'front', 'back'].includes(name)) moveLayer(layout(), poster.id, ['raise', 'front'].includes(name) ? 1 : -1, ['front', 'back'].includes(name));
    if (name === 'duplicate') {
      const copy = structuredClone(poster);
      copy.id = `poster-${rt().uid()}`;
      delete copy.noticeId;
      copy.pin.enabled = false;
      copy.x = Math.min(.98, copy.x + .025); copy.y = Math.min(.98, copy.y + .025);
      copy.layer = Math.max(...layout().posters.map(item => item.layer), 0) + 1;
      layout().posters.push(copy);
      selectedId = copy.id;
    }
    if (name === 'delete') {
      if (!confirm('Dieses Plakat entfernen? Verknüpfte Inhalte und Kommentare bleiben erhalten.')) return;
      layout().posters = layout().posters.filter(item => item !== poster);
      selectedId = null;
    }
    changed({ refreshInspector: true });
  }

  function place(result) {
    pending = result;
    const asset = assetMap.get(result.poster.assetId);
    window.TafelEditor.setHint('Plakat auf der Tafel platzieren · Esc bricht ab');
    window.TafelBoard.startPlacement(position => {
      const current = pending;
      pending = null;
      if (!current || !editing()) return;
      const poster = normalizePoster({ ...current.poster, id: `poster-${rt().uid()}`, ...position,
        layer: Math.max(0, ...layout().posters.map(item => item.layer)) + 1 }, assetIds);
      if (current.content === 'new') {
        const notice = window.TafelZettelConfig.createDraft(current.template, position, rt().uid);
        if (current.title.trim()) notice.title = current.title.trim();
        state().zettel.push(notice);
        assignContent(poster, notice.id);
      } else if (current.content === 'existing') assignContent(poster, current.existingId);
      else poster.pin.enabled = false;
      layout().posters.push(poster);
      selectedId = poster.id;
      changed({ refreshInspector: true });
      if (current.content === 'new') window.openZettelSidebar(poster.noticeId);
    }, {
      allowOnNotices: true,
      onMove(position) {
        if (!ghost) {
          ghost = createPosterElement({ ...result.poster, id: 'placement-preview', ...position, layer: 10000 }, asset, window.TafelBoard.imageSize(), { esc: rt().esc, editing: false });
          ghost.classList.add('is-placement-preview');
          document.getElementById('zettel-layer').append(ghost);
        }
        positionElement(ghost, { ...result.poster, ...position, layer: 10000 }, asset, window.TafelBoard.imageSize());
      },
      onCancel() { ghost?.remove(); ghost = null; window.TafelEditor.setHint(''); },
    });
  }

  function bind() {
    inspector = createPosterInspector({ esc: rt().esc, assets, getSelected: selected, getAsset: id => assetMap.get(id), groups: allGroups, change, movePin, action });
    wizard = createPosterWizard({ assets, esc: rt().esc, place, groups: allGroups, isEditing: editing });
    const viewport = window.TafelBoard.viewport();
    viewport.addEventListener('pointerdown', event => {
      const element = event.target.closest('.board-poster:not(.is-placement-preview)');
      if (!element || !editing() || event.button !== 0 || window.TafelBoard.isPlacing()) return;
      event.preventDefault();
      const poster = layout().posters.find(item => item.id === element.dataset.posterId);
      select(poster.id);
      const point = window.TafelBoard.pointFromClient(event.clientX, event.clientY);
      drag = { poster, element, pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, point, x: poster.x, y: poster.y, moved: false };
      viewport.setPointerCapture(event.pointerId);
    });
    viewport.addEventListener('pointermove', event => {
      if (!drag || event.pointerId !== drag.pointerId) return;
      if (!drag.moved && Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) < 5) return;
      drag.moved = true;
      drag.client = { x: event.clientX, y: event.clientY };
      if (dragFrame === null) dragFrame = requestAnimationFrame(paintDrag);
    });
    function paintDrag() {
      dragFrame = null;
      if (!drag?.client) return;
      const point = window.TafelBoard.pointFromClient(drag.client.x, drag.client.y);
      const size = window.TafelBoard.imageSize();
      drag.poster.x = Math.max(0, Math.min(1, drag.x + (point.x - drag.point.x) / size.w));
      drag.poster.y = Math.max(0, Math.min(1, drag.y + (point.y - drag.point.y) / size.h));
      positionElement(drag.element, drag.poster, assetMap.get(drag.poster.assetId), size);
    }
    function endDrag(event) {
      if (!drag || event.pointerId !== drag.pointerId) return;
      if (dragFrame !== null) { cancelAnimationFrame(dragFrame); dragFrame = null; }
      if (event.type === 'pointerup' && drag.moved) {
        drag.client = { x: event.clientX, y: event.clientY };
        paintDrag();
      }
      const current = drag; drag = null;
      if (event.type !== 'pointerup') { current.poster.x = current.x; current.poster.y = current.y; }
      if (current.moved && event.type === 'pointerup') changed({ refreshInspector: true });
      else if (current.moved) { rt().renderZettel(); inspector.render(); }
      if (viewport.hasPointerCapture(event.pointerId)) viewport.releasePointerCapture(event.pointerId);
    }
    for (const name of ['pointerup', 'pointercancel', 'lostpointercapture']) viewport.addEventListener(name, endDrag);
    viewport.addEventListener('click', event => {
      const pin = event.target.closest('[data-role="poster-pin"]');
      if (!pin || editing() || window.TafelBoard.isPlacing()) return;
      const poster = layout()?.posters.find(item => item.id === pin.closest('[data-poster-id]')?.dataset.posterId);
      const linked = poster && group(poster);
      if (linked && poster.pin.enabled) {
        window.TafelZettelBoard.hideTooltip();
        window.openZettelScroll(linked.notices[0].id);
      }
    });
    viewport.addEventListener('pointerover', event => {
      const pin = event.target.closest('[data-role="poster-pin"]');
      if (!pin || pin.contains(event.relatedTarget) || editing()) return;
      const poster = layout()?.posters.find(item => item.id === pin.closest('[data-poster-id]')?.dataset.posterId);
      const linked = poster && group(poster);
      if (linked && poster.pin.enabled) window.TafelZettelBoard.showTooltip(linked.notices[0], event.clientX, event.clientY, linked.notices);
    });
    viewport.addEventListener('pointerout', event => { if (event.target.closest('[data-role="poster-pin"]')) window.TafelZettelBoard.hideTooltip(); });
    viewport.addEventListener('keydown', event => {
      const element = event.target.closest('[data-poster-id]');
      if (!element || !editing()) return;
      const poster = layout().posters.find(item => item.id === element.dataset.posterId);
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); select(poster.id); }
      const delta = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[event.key];
      if (delta) {
        event.preventDefault(); selectedId = poster.id;
        poster.x = Math.max(0, Math.min(1, poster.x + delta[0] * (event.shiftKey ? .01 : .001)));
        poster.y = Math.max(0, Math.min(1, poster.y + delta[1] * (event.shiftKey ? .01 : .001)));
        changed({ refreshInspector: true }); elementFor(poster.id)?.focus();
      }
    });
    window.addEventListener('aleria:tafel:edit-mode', () => { if (!editing()) { select(null); wizard.close(); } });
    window.addEventListener('aleria:tafel:state-applied', () => { selectedId = null; inspector.close(); });
  }

  window.TafelBoardComposition = Object.freeze({
    prepareState, background, render, coveredNoticeIds,
    isEnabled: () => true,
    startAdd: () => layout() ? wizard.open() : rt().toast('Der vorhandene Tafelstand wird noch geladen.'), bind,
    cancelPlacement: () => { pending = null; wizard?.close(); },
    focusPoint(id) {
      const poster = layout()?.posters.find(item => group(item)?.notices.some(notice => notice.id === id));
      return poster ? { id, ...pinPosition(poster, assetMap.get(poster.assetId), window.TafelBoard.imageSize()) } : null;
    },
    onNoticeDeleted(id) { unlinkDeletedNotice(layout(), state().zettel, stacks(), id); },
  });
}
