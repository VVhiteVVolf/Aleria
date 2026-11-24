import { classifyLocalAuthority } from '../../../shared/cenyr-administration/local-authority.mjs';
import { geographicKey } from '../../../shared/world-directory/geographic-key.mjs';

export const territoryDomains = territory => {
  const geography = territory.content?.view?.geography;
  return geography?.domains || (geography?.domain ? [geography.domain] : []);
};

export const countyDemesne = county => territoryDomains(county)
  .filter(domain => domain.territoryId === county.id || /^Gräfische Baronie\b/u.test(domain.title));

export function territorialPlaces(domains) {
  const places = new Map();
  for (const domain of domains) {
    for (const { name, type } of domain.sections.flatMap(section => section.places)) {
      const label = type.split(' · ', 1)[0];
      if (classifyLocalAuthority(label) === 'open' && label !== 'Hafen') continue;
      places.set(geographicKey(name), { name, type: label });
    }
  }
  return [...places.values()];
}

export const isPort = place => /^Hafen(?:siedlung)?$/u.test(place.type);
