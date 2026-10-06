import { REGIONAL_EQUIPMENT_SECTION, REGIONAL_EQUIPMENT_LABEL, regionalTerritory, regionalChildren, regionalHouses, regionalHouse, regionalAncestors } from './regional-equipment-model.js?v=20261006-regional-equipment-v2';
import { escape, results } from '../item-register/item-register-view.js?v=20261006-regional-equipment-v2';
const choose = (action, id, content, className = '') => `<button type="button" class="${className}" data-ir-action="${action}" data-id="${escape(id)}">${content}</button>`;
const emblem = (entry, type) => entry.image ? `<img class="re-emblem re-emblem-${type}" src="${escape(entry.image)}" alt="${escape(entry.name)} – Wappen" loading="lazy" decoding="async">` : '<span class="re-no-emblem" aria-hidden="true">◇</span>';
const countFor = (items, houseIds) => new Set(items.filter(item => houseIds.includes(item.houseArmor?.houseId)).map(item => item.houseArmor.houseId)).size;
export function regionalEquipmentView(snapshot, state, items) {
  if (state.section !== REGIONAL_EQUIPMENT_SECTION) return '';
  const node = regionalTerritory(state.territoryId), house = regionalHouse(state.houseId);
  const templates = snapshot.standards.filter(item => item.section === REGIONAL_EQUIPMENT_SECTION);
  const breadcrumbs = `<nav class="re-breadcrumb" aria-label="Länder und Hausausrüstung">${choose('equipment-territory', '', 'Alle Länder')}${regionalAncestors(node.id).map(parent => `<span aria-hidden="true">›</span>${choose('equipment-territory', parent.id, escape(parent.name))}`).join('')}${house ? `<span aria-hidden="true">›</span><span>${escape(house.name)}</span>` : ''}</nav>`;
  if (house) return breadcrumbs + `<header class="re-house-heading">${emblem(house, 'house')}<div><p>${escape(house.path.join(' › '))}</p><h2>${escape(house.name)}</h2></div></header>` + (items.length ? results(snapshot, state, items) : `<div class="re-empty"><p>Für dieses Haus sind noch keine Rüstungs- oder Waffenitems angelegt.</p><a href="../Gallerien/krieger/index.html">Vorlagen in der Kriegergalerie ansehen</a></div>`);
  if (state.search.trim()) return breadcrumbs + results(snapshot, state, items);
  const children = regionalChildren(node.id), listed = node.path.length >= 2 || !children.length ? regionalHouses(node.id) : [];
  const regionTitle = !node.id ? REGIONAL_EQUIPMENT_LABEL : node.name;
  const subtitle = !node.id ? 'Land über sein Wappen auswählen.' : node.path.length === 1 && node.countryId === 'cenyr' ? 'Grafschaft über ihr Banner auswählen.' : 'Gebiete und Häuser aus den Stammbäumen';
  return breadcrumbs + `<section class="re-browser"><header class="re-heading">${node.id ? emblem(node, node.path.length === 1 ? 'country' : 'banner') : ''}<div><h2>${escape(regionTitle)}</h2><p>${subtitle}</p></div></header>
    ${children.length ? `<div class="re-territory-grid">${children.map(child => choose('equipment-territory', child.id, `${emblem(child, node.id ? 'banner' : 'country')}<strong>${escape(child.name)}</strong><span>${child.houseIds.length} Häuser · ${countFor(templates, child.houseIds)} mit Items</span>`, 're-territory-card')).join('')}</div>` : ''}
    ${listed.length ? `<h3 class="re-houses-title">Häuser${children.length ? ' in diesem Gebiet' : ''} <span>${listed.length}</span></h3><div class="re-house-grid">${listed.map(entry => {
      const available = templates.filter(item => item.houseArmor?.houseId === entry.id);
      return choose('equipment-house', entry.id, `${emblem(entry, 'house')}<strong>${escape(entry.name)}</strong><span>${available.length ? `${available.length} Rangvarianten` : 'Items fehlen noch'}</span>`, 're-house-card');
    }).join('')}</div>` : ''}</section>`;
}
