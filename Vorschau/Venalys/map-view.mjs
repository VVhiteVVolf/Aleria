import { escapeHtml as e } from '../shared/country-workbench/render.mjs';
import { targetName } from './assignment-view.mjs';

export function createVenalysMap({ root, targets, districts, houses, geometry, getDraft, onTarget }) {
  const mappedTargets = targets.filter(target => Array.isArray(target.point));
  const dialog = root.querySelector('#map-dialog');
  const surfaces = [...root.querySelectorAll('[data-role="map-surface"]')];
  const districtIds = new Set(districts.map(d => d.id));
  let mode = 'districts', showNames = true, showCrests = true, zoom = 1, activeTarget = null, trigger;
  const width = geometry.width, height = geometry.height;

  function surfaceMarkup(draft, { fullsize = false } = {}) {
    const polygons = districts.filter(d => d.polygon?.length).map(d => `<polygon points="${d.polygon.map(p => p.join(',')).join(' ')}" class="district-shape${activeTarget === d.id ? ' is-active' : ''}" data-action="focus-target" data-target="${e(d.id)}" data-drop-seat="${e(d.id)}" tabindex="0" role="button" aria-label="${e(targetName(d, draft))} auswählen"><title>${e(targetName(d, draft))}</title></polygon>`).join('');
    const labels = mappedTargets.map(t => `<button class="venalys-map-label${districtIds.has(t.id) ? ' district-label' : ''}${activeTarget === t.id ? ' is-active' : ''}" data-action="focus-target" data-target="${e(t.id)}" style="left:${t.point[0]}%;top:${t.point[1]}%">${e(targetName(t, draft))}</button>`).join('');
    const crests = mappedTargets.filter(t => draft.assignments[t.id]?.length).map(t => `<div class="crest-group venalys-crest-group" style="left:${t.point[0]}%;top:${t.point[1]}%">${draft.assignments[t.id].map(id => {
      const house = houses.find(h => h.id === id);
      return `<button class="clan-pin" data-clan="${e(id)}" data-action="show-house" data-house="${e(id)}" aria-label="Haus ${e(house.name)} · ${e(targetName(t, draft))}"><img src="${e(house.crest)}" width="40" height="40" alt="Wappen ${e(house.name)}"></button>`;
    }).join('')}</div>`).join('');
    return `<img src="assets/${mode === 'districts' ? 'map-districts' : 'map'}${fullsize ? '-full' : ''}.webp" width="${width}" height="${height}" alt="Venalys · ${mode === 'districts' ? 'gelieferte Bezirkskarte' : 'gelieferte Karte ohne Bezirksfarben'}"><svg class="district-outlines" viewBox="0 0 100 100" preserveAspectRatio="none">${polygons}</svg><div class="venalys-labels" ${showNames ? '' : 'hidden'}>${labels}</div><div class="crest-layer" ${showCrests ? '' : 'hidden'}>${crests}</div>`;
  }

  function sizeDialog() {
    const available = Math.min(window.innerWidth * .92, (window.innerHeight * .92 - 120) * width / height);
    dialog.querySelector('[data-role="map-surface"]').style.width = Math.max(240, available * zoom) + 'px';
    dialog.querySelector('[data-role="zoom-label"]').textContent = zoom === 1 ? 'Ganze Karte' : `${Math.round(zoom * 100)} %`;
  }

  function render() {
    const draft = getDraft();
    for (const surface of surfaces) surface.innerHTML = surfaceMarkup(draft, { fullsize: Boolean(surface.closest('dialog')) });
    root.querySelector('[data-role="map-caption"]').textContent = `${districts.length} Stadtbezirke · ${mappedTargets.length - districts.length} Außenorte · Ein Haus kann an mehreren Stellen stehen.`;
    sizeDialog();
  }

  function chooseTarget(event) {
    const target = event.target.closest('[data-action="focus-target"]');
    if (!target) return;
    if (event.type === 'keydown' && !['Enter', ' '].includes(event.key)) return;
    if (event.type === 'keydown') event.preventDefault();
    activeTarget = target.dataset.target;
    const surface = event.currentTarget;
    onTarget(activeTarget);
    const replacement = [...surface.querySelectorAll('[data-action="focus-target"]')].find(el => el.dataset.target === activeTarget);
    replacement?.focus?.({ preventScroll: true });
  }
  for (const surface of surfaces) {
    surface.addEventListener('click', chooseTarget);
    surface.addEventListener('keydown', chooseTarget);
  }
  dialog.addEventListener('close', () => trigger?.isConnected && trigger.focus({ preventScroll: true }));
  window.addEventListener('resize', sizeDialog);
  return {
    render,
    locate(id) { activeTarget = id; },
    open() { trigger = document.activeElement; zoom = 1; dialog.showModal(); sizeDialog(); },
    close: () => dialog.close(),
    zoomBy(value) { zoom = Math.max(1, Math.min(5, zoom + value)); sizeDialog(); },
    fit() { zoom = 1; sizeDialog(); },
    toggleNames(button) { showNames = !showNames; button.setAttribute('aria-pressed', String(showNames)); render(); },
    toggleCrests(button) { showCrests = !showCrests; button.setAttribute('aria-pressed', String(showCrests)); render(); },
    toggleMode(button) { mode = mode === 'districts' ? 'normal' : 'districts'; button.setAttribute('aria-pressed', String(mode === 'districts')); button.textContent = mode === 'districts' ? 'Bezirksfarben an' : 'Bezirksfarben aus'; render(); },
  };
}
