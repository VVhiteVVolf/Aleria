import { escapeHtml as e } from '../shared/country-workbench/render.mjs';
import { MAP_VARIANTS } from './map-data.mjs';
import { renderPlacementTools } from './house-placement-render.mjs';

const variantButtons = () => MAP_VARIANTS.map((variant, index) => `<button data-map-action="choose-variant" data-map-variant="${e(variant.id)}" aria-pressed="${index === 0}">${e(variant.short)}</button>`).join('');

export function renderMapSection() {
  return `<section class="section ishtaran-map" id="karte" data-role="map-section"><div class="section-heading"><div><p class="eyebrow">Häuser und Sitze · lokaler Entwurf</p><h2>Die Häuser auf Ishtarans Karte.</h2></div><button data-action="open-map">Karte vergrößern ↗</button></div><p class="section-intro">Hauswappen auswählen und einen Ortsanker anklicken, über die Auswahlfelder versetzen oder mit Maus beziehungsweise Stift ziehen. Auf dem Handy bleibt die Karte verschiebbar; die Auswahlfelder und Zielknöpfe bieten dieselbe Zuordnung.</p><div class="placement-toolbar" role="group" aria-label="Haus einem Ort zuordnen"><label>Haus wählen<select data-role="house-select"></select></label><label>Neuer Sitz<select data-role="seat-select"></select></label><button class="primary" data-action="move-selected" disabled>Haus versetzen</button><button data-action="cancel-selection" disabled>Auswahl lösen</button></div><p class="placement-instruction" data-role="selection-hint"></p><div class="map-variant-row" role="group" aria-label="Kartenansicht wählen">${variantButtons()}<a data-role="map-download" href="${e(MAP_VARIANTS[0].map)}" target="_blank" rel="noopener">Kartenbild öffnen ↗</a></div><div class="map-tools"><button data-action="toggle-crests" aria-pressed="true">Hauswappen</button><button data-action="toggle-names" aria-pressed="true">Ortsnamen</button></div><div class="map-shell"><div class="map-viewport" tabindex="0" aria-label="Ishtaran-Karte; auf schmalen Bildschirmen seitlich verschiebbar"><div class="map-canvas" data-role="map-surface"></div></div></div><p class="map-caption" id="map-caption"></p><div class="unassigned" data-drop-seat="unassigned"><div class="section-heading"><h3>Häuser ohne Sitz</h3><span data-role="unassigned-count"></span></div><p>Ein Haus kann hierher zurückgelegt werden. Sein Rang, Wappen und seine Dienstbindung bleiben erhalten.</p><div class="house-grid" data-role="unassigned-houses"></div></div></section>`;
}

export function renderMapDialog() {
  return `<dialog id="map-dialog" class="proposal-dialog map-dialog ishtaran-map-dialog" data-role="map-dialog" aria-labelledby="large-map-title"><div class="dialog-top"><span id="large-map-title" data-role="map-title">Ishtaran · Landeskarte</span><button data-action="close-map" aria-label="Große Karte schließen">✕</button></div><div class="map-variant-row" role="group" aria-label="Kartenansicht in Großansicht wählen">${variantButtons()}</div><div class="map-zoom" role="group" aria-label="Kartenvergrößerung"><button data-action="zoom-out" aria-label="Karte verkleinern">−</button><button data-action="fit-map" data-role="zoom-label">Ganze Karte</button><button data-action="zoom-in" aria-label="Karte vergrößern">+</button></div><div class="map-viewport" tabindex="0" aria-label="Große Ishtaran-Karte, horizontal und vertikal verschiebbar"><div class="map-canvas" data-role="map-surface"></div></div></dialog><div id="clan-tooltip" class="clan-tooltip" role="tooltip" hidden></div>`;
}

export function renderPlacementArea() {
  return `<div class="ishtaran-placement" data-role="placement-root">${renderMapSection()}<section class="section" id="sitze"><p class="eyebrow">21 Orte · Bearbeitbare Hauszuordnung</p><h2>Städte und ihre Häuser.</h2><p class="section-intro">Die Hauptstadt nimmt den Sultan und weitere Tarkan-Häuser auf. Paschastädte bieten einem Pascha und bis zu zwei Tarkan-Häusern Platz; intakte kleine Orte einem Tarkan. Sitze dürfen vorübergehend leer bleiben. Das zerstörte Kutlakar ist als Sitz ausgeschlossen.</p><div class="seat-grid" data-role="settlements"></div></section>${renderPlacementTools()}${renderMapDialog()}</div>`;
}

/** Variant choice owns no placements and refreshes the shared controller. */
export function createMapVariantControls(root, onChange) {
  let active = MAP_VARIANTS[0];
  function render() {
    root.querySelectorAll('[data-map-action="choose-variant"]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.mapVariant === active.id)));
    root.querySelector('[data-role="map-download"]').href = active.map;
  }
  root.addEventListener('click', event => {
    const button = event.target.closest('button[data-map-action="choose-variant"]');
    if (!button) return;
    const variant = MAP_VARIANTS.find(item => item.id === button.dataset.mapVariant);
    if (variant && variant !== active) { active = variant; render(); onChange(); }
  });
  render();
  return { current: () => active };
}
