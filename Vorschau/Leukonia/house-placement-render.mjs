import { escapeHtml as e } from '../shared/country-workbench/render.mjs';

export const rankLabel = house => house.rank || house.role || 'Rang noch offen';

export function renderHouseCard(house, selected) {
  const image = house.ready === false ? null : house.crest;
  return `<article class="house-card${selected === house.id ? ' is-selected' : ''}" data-drag-house="${e(house.id)}"><button class="house-choice" data-action="choose-house" data-house="${e(house.id)}" aria-pressed="${selected === house.id}">${image ? `<img src="${e(image)}" width="72" height="72" alt="Wappen ${e(house.name)}" loading="lazy">` : ''}<span><strong>${e(house.name)}</strong><small>${e(rankLabel(house))}</small></span></button><button class="details-link" data-action="show-house" data-house="${e(house.id)}">Wappen und Figur ansehen ↗</button></article>`;
}

export function createSeatRenderer({ houses, settlements, archonates }) {
  return (placements, selected) => settlements.map(city => {
    const archonate = archonates.find(item => item.id === city.archonateId || item.cityIds?.includes(city.id));
    const occupants = houses.filter(house => placements[house.id] === city.id);
    return `<article class="seat-card" id="seat-${e(city.id)}" data-seat="${e(city.id)}" data-drop-seat="${e(city.id)}"><header><div><p class="eyebrow">${e(city.kindLabel || (city.imperialDomain ? 'Kaiserliche Domäne' : 'Stadt'))}</p><h3>${e(city.name)}</h3>${archonate ? `<p class="seat-county">${e(archonate.name)}</p>` : ''}</div></header>${city.description || city.geography ? `<p class="geography">${e(city.description || city.geography)}</p>` : ''}<div class="house-grid">${occupants.map(house => renderHouseCard(house, selected)).join('') || '<p class="empty-seat">Noch kein Haus zugeordnet.</p>'}</div><button class="seat-target" data-action="place-at-seat" data-drop-seat="${e(city.id)}" ${selected ? '' : 'disabled'}>Gewähltes Wappen hier platzieren</button></article>`;
  }).join('');
}

export function renderPlacementTools() {
  return `<section class="section draft-tools"><h2>Den Sitzentwurf mitnehmen.</h2><p>Die Zuordnungen bleiben in diesem Browser. Der Ausgangsstand stellt den vorgegebenen Sitzvorschlag wieder her.</p><div class="action-row"><button data-action="undo" disabled>Letzte Änderung zurück</button><button data-action="export">Entwurf herunterladen</button><button data-action="import">Entwurf laden</button><button data-action="reset">Ausgangsstand</button></div><input type="file" accept="application/json,.json" data-role="import-file" hidden></section>`;
}
