import { escapeHtml as e } from '../shared/country-workbench/render.mjs';
import { renderPlacementTools } from './house-placement-render.mjs?v=20261103-leukonia-4';

const variantButtons = variants => variants.map((variant, index) => `<button data-map-action="choose-variant" data-map-variant="${e(variant.id)}" aria-pressed="${index === 0}">${e(variant.short)}</button>`).join('');

export function renderPlacementArea({ variants, settlements }) {
  const first = variants[0];
  return `<div class="leukonia-placement" data-role="placement-root"><section class="section leukonia-map" id="karte" data-role="map-section"><div class="section-heading"><div><p class="eyebrow">Leukonia · Karte und freier Sitzentwurf</p><h2>Die Häuser auf der Karte.</h2></div><button data-action="open-map">Karte vergrößern ↗</button></div><p class="section-intro">Ein Haus auswählen und einem Ort zuordnen oder sein Wappen mit Maus beziehungsweise Stift ziehen. Auf dem Handy stehen dieselben Auswahlfelder und Ortsziele bereit.</p>
  <div class="placement-toolbar" role="group" aria-label="Haus einem Ort zuordnen"><label>Haus wählen<select data-role="house-select"></select></label><label>Neuer Sitz<select data-role="seat-select"></select></label><button class="primary" data-action="move-selected" disabled>Wappen versetzen</button><button data-action="cancel-selection" disabled>Auswahl lösen</button></div><p class="placement-instruction" data-role="selection-hint"></p>
  <div class="map-variant-row" role="group" aria-label="Kartenansicht wählen">${variantButtons(variants)}<a data-role="map-download" href="${e(first.map)}" target="_blank" rel="noopener">Kartenbild öffnen ↗</a></div><div class="map-tools"><button data-action="toggle-crests" aria-pressed="true">Hauswappen</button><button data-action="toggle-names" aria-pressed="true">Ortsnamen</button></div>
  <div class="map-shell"><div class="map-viewport" tabindex="0" aria-label="Leukonia-Karte, seitlich verschiebbar"><div class="map-canvas" data-role="map-surface"></div></div></div><p id="map-caption" class="map-caption"></p>
  <div class="unassigned" data-drop-seat="unassigned"><div class="section-heading"><h3>Häuser ohne Sitz</h3><span data-role="unassigned-count"></span></div><p>Hier stehen die noch unzugeordneten Häuser. Ein zugeordnetes Wappen kann hierher zurückgelegt werden.</p><div class="house-grid" data-role="unassigned-houses"></div></div></section>
  <section class="section" id="sitze"><p class="eyebrow">${settlements.length} Orte · bearbeitbare Zuordnung</p><h2>Städte und ihre Häuser.</h2><p class="section-intro">Die Zuordnung bestimmt einen Wohnsitz im Entwurf. Sie begründet weder Adelsrang noch Amtsinhaberschaft oder Lehnsherrschaft.</p><div class="seat-grid" data-role="settlements"></div></section>${renderPlacementTools()}${renderMapDialog(variants)}</div>`;
}

function renderMapDialog(variants) {
  return `<dialog id="map-dialog" class="proposal-dialog map-dialog leukonia-map-dialog" aria-labelledby="large-map-title"><div class="dialog-top"><span id="large-map-title" data-role="map-title">Leukonia</span><button data-action="close-map" aria-label="Große Karte schließen">✕</button></div><div class="map-zoom" role="group" aria-label="Kartenansicht und Vergrößerung">${variantButtons(variants)}<button data-action="zoom-out" aria-label="Karte verkleinern">−</button><button data-action="fit-map" data-role="zoom-label">Ganze Karte</button><button data-action="zoom-in" aria-label="Karte vergrößern">+</button></div><div class="map-viewport" tabindex="0" aria-label="Große Leukonia-Karte"><div class="map-canvas" data-role="map-surface"></div></div></dialog><div id="clan-tooltip" class="clan-tooltip" role="tooltip" hidden></div>`;
}

export function createMapVariantControls(root, variants, onChange) {
  let active = variants[0];
  const render = () => {
    root.querySelectorAll('[data-map-action="choose-variant"]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.mapVariant === active.id)));
    root.querySelector('[data-role="map-download"]').href = active.map;
  };
  root.addEventListener('click', event => {
    const button = event.target.closest('button[data-map-action="choose-variant"]');
    if (!button) return;
    const variant = variants.find(item => item.id === button.dataset.mapVariant);
    if (variant && variant !== active) { active = variant; render(); onChange(); }
  });
  render();
  return { current: () => active };
}
