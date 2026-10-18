import { renderFamilySection } from '../../../Kontinente/modules/territory-directory/house-directory.mjs?v=register-20261018a';
import { mountDirectoryBrowser, directoryState } from '../../../Kontinente/modules/territory-directory/directory-browser.mjs?v=register-20261018a';

const page = document.querySelector('[data-orte-static-template]');
const root = page?.querySelector('[data-orte-houses]');
if (root) {
  document.addEventListener('aleria:orte:data-ready', event => renderHouseGroups(event.detail?.data || window.ORT_DATA));
  if (window.ORT_DATA) renderHouseGroups(window.ORT_DATA);
}

// The place module adapts its own data; rendering and filtering have one owner.
function renderHouseGroups(data) {
  if (!Array.isArray(data?.houses)) return;
  const state = directoryState(root);
  const groups = data.houses.filter(group => Array.isArray(group?.items) && group.items.some(Boolean));
  root.replaceChildren(...groups.map(group => renderFamilySection({
    title: String(group.title || 'Häuser'),
    cards: group.items.filter(Boolean).map(house => ({
      ...house,
      id: house.familyId,
      href: houseHref(house),
      image: houseImage(house),
    })),
  })));
  root.className = 'kingdom-family-card-view territory-directory';
  root.closest('tr').hidden = groups.length === 0;
  mountDirectoryBrowser(root, { state });
}

function houseHref(house) {
  if (house.href) return String(house.href);
  if (!house.familyId) return '';
  return `/Stammbäume/Stammbaum.html?family=${encodeURIComponent(house.familyId)}&mode=view`;
}

function houseImage(house) {
  const rank = String(house.rank || '');
  const isCommoner = /^bürgerlich(?:es Haus)?$/i.test(rank);
  const image = document.createElement('img');
  image.src = house.emblem || (isCommoner || !rank
    ? '/IconOrdner/Neutrale Wappen/Neutrales Bürgerwappen.png'
    : '/IconOrdner/Neutrale Wappen/Neutrales Adelswappen.png');
  image.alt = house.emblem ? `Wappen ${house.name || 'des Hauses'}`
    : `${isCommoner ? 'Bürgerwappen' : 'Schild'} als Platzhalter für ${house.name || 'die Familie'}`;
  image.loading = 'lazy';
  image.decoding = 'async';
  return image;
}
