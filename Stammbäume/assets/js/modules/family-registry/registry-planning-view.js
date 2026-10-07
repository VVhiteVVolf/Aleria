import { escapeHtml as esc } from '../../ui/dom.js';

export function renderRegistryPlanning(node) {
  const description = node.description
    ? `<p class="registry-planning-note">${esc(node.description)}</p>` : '';
  if (!node.plannedHouses.length) return description;
  return `${description}<section class="registry-section registry-planning" aria-label="Clanplanung">
    <h3>Vorgesehene Clans</h3>
    <p>Gebietszuordnung vorbereitet · Stammbäume noch nicht angelegt.</p>
    <ul class="registry-planning-list">${node.plannedHouses.map(house => `<li>
      <strong>Clan ${esc(house.name)}</strong><span>${esc(house.rankLabel)}</span>
      ${house.sourceNote ? `<p>${esc(house.sourceNote)}</p>` : ''}
    </li>`).join('')}</ul>
  </section>`;
}
