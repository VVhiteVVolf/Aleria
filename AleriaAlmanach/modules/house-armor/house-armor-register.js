import { HOUSE_ARMOR_HOUSES } from './house-armor-catalog.js?v=20261006-house-armor-v1';
import { HOUSE_ARMOR_CATEGORY } from './house-armor-model.js?v=20261006-house-armor-v1';

const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const choose = (action, label, id = '') => `<button type="button" data-ir-action="${action}" data-id="${escape(id)}">${label}</button>`;
export function isHouseArmorBrowsing(state) {
  return state.section === 'standard' && state.category === HOUSE_ARMOR_CATEGORY;
}
export function houseArmorNavigation(state) {
  if (!isHouseArmorBrowsing(state)) return '';
  const house = HOUSE_ARMOR_HOUSES.find(entry => entry.id === state.houseId);
  return `<nav class="ha-breadcrumb" aria-label="Rüstungskategorien">${choose('category', 'Cenyr – Rüstungen', HOUSE_ARMOR_CATEGORY)}<span>› Region</span>${state.regionId ? choose('armor-region', 'Celtigerns Wacht', state.regionId) : ''}${house ? `<span>› ${escape(house.name)}</span>` : ''}</nav>`;
}
export function houseArmorBrowse(state) {
  if (!isHouseArmorBrowsing(state) || state.search.trim() || state.houseId) return '';
  if (!state.regionId) return `<section class="ha-browser"><h2>Cenyr – Rüstungen</h2><p>Region auswählen</p><div class="ha-house-grid">${choose('armor-region', `<strong>Celtigerns Wacht</strong><span>${HOUSE_ARMOR_HOUSES.length} Häuser · Harnische nach Hauszugehörigkeit</span>`, 'celtigerns-wacht')}</div></section>`;
  const houses = HOUSE_ARMOR_HOUSES.filter(house => house.regionId === state.regionId)
    .sort((a, b) => Number(!!b.image) - Number(!!a.image) || a.name.localeCompare(b.name, 'de'));
  return `<section class="ha-browser"><h2>Celtigerns Wacht</h2><p>${houses.length} Häuser · ${houses.filter(house => house.image).length} Harnischbilder. Jungritter ab Stufe 4, Ritter ab 7, Seniorritter ab 10.</p><div class="ha-house-grid">${houses.map(house => {
    const status = house.image ? '3 Rangvarianten' : house.status === 'missing-reference' ? 'Kriegerdarstellung fehlt' : 'Harnischbild in Vorbereitung';
    return choose('armor-house', `${house.image ? `<img src="${escape(house.image)}" alt="Harnisch ${escape(house.name)}" loading="lazy">` : '<span class="ha-empty-image" aria-hidden="true">◇</span>'}<strong>${escape(house.name)}</strong><span>${status}</span>`, house.id);
  }).join('')}</div></section>`;
}
export function houseArmorMissing(state) {
  const house = HOUSE_ARMOR_HOUSES.find(entry => entry.id === state.houseId);
  if (!isHouseArmorBrowsing(state) || !house || house.image) return '';
  return `<section class="ha-browser"><h2>${escape(house.name)}</h2><p>${house.sourceImage ? 'Die Kriegerdarstellung ist vorhanden. Der einzelne Harnisch wird noch ergänzt.' : 'Für dieses Haus fehlt noch eine zugeordnete Kriegerdarstellung als Rüstungsvorlage.'}</p><a href="../Gallerien/krieger/index.html">Kriegergalerie öffnen</a></section>`;
}
