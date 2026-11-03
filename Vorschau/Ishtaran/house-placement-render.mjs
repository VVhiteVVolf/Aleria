import { escapeHtml as e } from '../shared/country-workbench/render.mjs';

export const rankLabel = house => house.rank;
export const cityTierLabel = city => city.destroyed ? 'Zerstörter Ort' : ({ capital: 'Hauptstadt · Sultan', pascha: 'Große Stadt · Pascha', tarkan: 'Kleine Stadt · Tarkan' })[city.tier];

export function renderHouseCard(house, selected) {
  return `<article class="house-card${selected === house.id ? ' is-selected' : ''}" data-drag-house="${e(house.id)}"><button class="house-choice" data-action="choose-house" data-house="${e(house.id)}" aria-pressed="${selected === house.id}"><img src="assets/${e(house.crest)}" width="80" height="80" alt="Wappen Haus ${e(house.name)}" loading="lazy"><span><strong>Haus ${e(house.name)}</strong><small>${e(house.rank)} · Zuordnungsentwurf</small>${house.displacementNote ? `<small>${e(house.displacementNote)}</small>` : ''}</span></button><button class="details-link" data-action="show-house" data-house="${e(house.id)}">Haus, Wappen & Krieger öffnen ↗</button></article>`;
}

export function createSeatRenderer({ houses, settlements }) {
  return (placements, selected) => settlements.map(city => {
    const occupants = houses.filter(house => placements[house.id] === city.id);
    const rules = city.destroyed ? 'Zerstörter Ort · keine Hauszuordnung möglich.' : city.tier === 'capital' ? 'Sultan und Tarkan-Häuser; im Ausgangsvorschlag drei zusätzliche Tarkan-Häuser. Keine feste Obergrenze.'
      : city.tier === 'pascha' ? 'Ein Pascha-Haus und bis zu zwei Tarkan-Häuser.' : 'Ein Tarkan-Haus.';
    return `<article class="seat-card${city.destroyed ? ' is-destroyed' : ''}" id="seat-${e(city.id)}" data-seat="${e(city.id)}" data-drop-seat="${e(city.id)}"><header><div><p class="eyebrow">${e(cityTierLabel(city))}</p><h3>${e(city.name)}</h3><p class="seat-county">${e(city.region || '')}</p></div><span class="seat-occupancy">${city.destroyed ? 'Zerstört' : occupants.length + (city.capacity === null ? ' Häuser' : ` / ${city.capacity}`)}</span></header><p class="geography">${e(city.description || '')}</p><p class="seat-rules">${e(rules)}</p><div class="house-grid">${occupants.map(house => renderHouseCard(house, selected)).join('') || `<p class="empty-seat">${city.destroyed ? 'Kutlug wurde nach Belduran evakuiert.' : 'Noch kein Haus zugeordnet.'}</p>`}</div><button class="seat-target" data-action="place-at-seat" data-drop-seat="${e(city.id)}" ${selected && !city.destroyed ? '' : 'disabled'}>${city.destroyed ? 'Zerstörter Ort · nicht belegbar' : 'Gewähltes Haus hier platzieren'}</button></article>`;
  }).join('');
}

export function renderPlacementTools() {
  return `<section class="section placement-draft-tools"><h2>Deine Sitzverteilung mitnehmen.</h2><p>Hauszuordnungen bleiben lokal in diesem Browser. Die Ausgangsverteilung ist ein bearbeitbarer Vorschlag; die Merkliste besitzt eine eigene Speicherung.</p><p data-role="placement-recovery" role="status" hidden></p><p><a data-role="placement-recovery-download" download="ishtaran-gesicherter-entwurf.json" hidden>Gesicherten vorherigen Entwurf herunterladen ↗</a></p><div class="action-row"><button data-action="undo" disabled>Letzte Sitzänderung zurück</button><button data-action="export">Sitzentwurf herunterladen</button><button data-action="import">Sitzentwurf laden</button><button data-action="reset">Ausgangsverteilung</button></div><input type="file" accept="application/json,.json" data-role="import-file" hidden></section>`;
}
