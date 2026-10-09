import { escapeHtml as esc } from '../../ui/dom.js';

function renderClanEmblem(house, className) {
  return house.emblem
    ? `<img class="${className}" src="${esc(house.emblem)}" alt="Wappen des Clans ${esc(house.name)}" loading="lazy">`
    : '';
}

export function renderPlannedHousePreviews(houses) {
  const previewLimit = 3;
  const previews = houses.slice(0, previewLimit).map(house => `<span class="registry-planned-house-preview">
    ${renderClanEmblem(house, 'registry-planning-preview-emblem')}
    <small>Vorgesehen: Clan ${esc(house.name)}</small>
  </span>`).join('');
  const remaining = houses.length - previewLimit;
  return previews + (remaining > 0 ? `<small>+ ${remaining} weitere ${remaining === 1 ? 'Clan' : 'Clans'}</small>` : '');
}

export function renderRegistryPlanning(node) {
  const description = node.description
    ? `<p class="registry-planning-note">${esc(node.description)}</p>` : '';
  if (!node.plannedHouses.length) return description;
  return `${description}<section class="registry-section registry-planning" aria-label="Clanplanung">
    <h3>Vorgesehene Clans</h3>
    <p>Gebietszuordnung vorbereitet · Stammbäume noch nicht angelegt.</p>
    <ul class="registry-planning-list">${node.plannedHouses.map(house => `<li>
      <div class="registry-planning-clan-heading">
        ${renderClanEmblem(house, 'registry-planning-clan-emblem')}
        <div><strong>Clan ${esc(house.name)}</strong><span>${esc(house.rankLabel)}</span></div>
      </div>
      ${house.sourceNote ? `<p>${esc(house.sourceNote)}</p>` : ''}
    </li>`).join('')}</ul>
  </section>`;
}
