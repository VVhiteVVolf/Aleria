import { houses } from './house-data.mjs';
const names = { condottieri: 'Condottieri', gondoleri: 'Gondoleri', lancieri: 'Lancieri', stralieri: 'Stralieri' };
export const warriors = Object.freeze(houses.filter(h => h.warrior).map(h => Object.freeze({
  id: h.id, name: h.name, classId: h.warrior.classId, className: names[h.warrior.classId],
  classHref: `../../Klassenordner/Venalys/${h.warrior.classId}/index.html`,
  palette: h.palette, equipment: h.warrior.equipment, reason: h.warrior.reason,
  withHorse: false, horseName: null, bestiaryHref: null,
  image: `assets/warriors/previews/${h.id}.webp`, fullsize: `assets/warriors/production/${h.id}.png`,
})));
