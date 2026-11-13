import { STANDARD_ITEMS } from '../item-register/item-register-standard.js';
import { calculateFoal } from '../../../Bestiarium/modules/horse-breeding/horse-breeding-model.mjs';
import rhyfel from '../../../Bestiarium/tiere/pferde/rhyfel/profil.json' with { type: 'json' };
import ceffyl from '../../../Bestiarium/tiere/pferde/ceffyl/profil.json' with { type: 'json' };
import hest from '../../../Bestiarium/tiere/pferde/hest/profil.json' with { type: 'json' };
import tirashan from '../../../Bestiarium/tiere/pferde/tirashan/profil.json' with { type: 'json' };
export const STUD_BREEDS = Object.freeze([rhyfel, ceffyl, hest, tirashan].map(profile => {
  const standard = STANDARD_ITEMS.find(x => x.id === `standard:rossmarkt:pferde-${profile.id}`);
  if (!standard) throw Error(`Rossmarkt-Rasse fehlt: ${profile.id}`);
  return { ...profile, standard, stats: profile.performance.values, priceRange: standard.priceRange,
    ageRange: profile.market.age.match(/\d+/g).map(Number) };
}));
export const studBreed = id => { const breed = STUD_BREEDS.find(b => b.id === id); if (!breed) throw Error(`Unbekannte Gestütsrasse: ${id}`); return breed; };
const interpolate = (range, fraction) => Math.round((range.minCopper + (range.maxCopper - range.minCopper) * fraction) / 10) * 10;
export function breedSalePrice(breedId, premium) { return interpolate(studBreed(breedId).priceRange, premium ? .85 : .45); }
export function exemplarPrice(horse) {
  const premium = horse.venue === 'rhosmere';
  if (horse.parents) {
    const foal = calculateFoal(studBreed(horse.parents[0]), studBreed(horse.parents[1]), { random: () => premium ? .7 : .5 });
    return { amount: interpolate(foal.priceRange, premium ? .85 : .55), source: `Nachzuchtrechner · ${horse.parents.join(' × ')}`, range: foal.priceRange };
  }
  if (horse.breed) return { amount: breedSalePrice(horse.breed, premium), source: `Handelsregister · ${horse.breed}`, range: studBreed(horse.breed).priceRange };
  // Undocumented mixed horses remain cheaper than the documented stock.
  const hestPrice = studBreed('hest').priceRange.minCopper;
  return { amount: Math.round(hestPrice * horse.priceFactor / 10) * 10, source: 'Handelsregister · Hest-Untergrenze, angepasst an Alter, Ausbildung und unbekannte Abstammung', range: null };
}
