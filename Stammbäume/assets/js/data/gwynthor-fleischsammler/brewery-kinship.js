import { createFamilyPerson, createMarriage } from '../family-record-builders.js';

// One shared couple connects both records. Their descendants continue only in
// Bragwen; Eiddfer keeps the married-away link rather than duplicating children.
export const IESTYN_BRAGWEN = Object.freeze(createFamilyPerson({
  id: 'iestyn-bragwen', name: 'Iestyn Bragwen', sex: 'male', birth: '1714', houseId: 'house-bragwen',
  title: 'Brauer', notes: '26 Jahre. Sohn Owains und Eleris; mit Rhiain Eiddfer verheiratet. Arbeitet am gemeinsamen Brauerhof.'
}));
export const RHIAIN_EIDDFER = Object.freeze(createFamilyPerson({
  id: 'rhiain-eiddfer', name: 'Rhiain Eiddfer', sex: 'female', birth: '1717', houseId: 'house-eiddfer',
  title: 'Brauerin', notes: '23 Jahre. Tochter Cadells und Ffions; mit Iestyn Bragwen verheiratet. Ihre Ehe verbindet die beiden Betreiberfamilien.'
}));
export const BREWERY_MARRIAGE = Object.freeze(createMarriage('marriage-iestyn-bragwen-rhiain-eiddfer',
  IESTYN_BRAGWEN.id, RHIAIN_EIDDFER.id, { start: '1737', notes: 'Gemeinsame Ehe in beiden Familienakten; Kinder werden ausschließlich bei Bragwen fortgeführt.' }));
