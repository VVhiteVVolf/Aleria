export const HORSE_BREEDING_PAGE_ID = 'zuchtbuch';

export const HORSE_BREEDING_BREEDS = Object.freeze([
  { id: 'afol', rossmarktId: 'afol' },
  { id: 'aurelianer', rossmarktId: 'aurelianer' },
  { id: 'brycing', rossmarktId: 'brycing' },
  { id: 'ceffyl', rossmarktId: 'ceffyl' },
  { id: 'cheval', rossmarktId: 'cheval' },
  { id: 'crafan-pony', rossmarktId: 'crafan' },
  { id: 'cuanach', rossmarktId: 'cuanach' },
  { id: 'curragh', rossmarktId: 'curragh' },
  { id: 'cyning', rossmarktId: 'cyning' },
  { id: 'drake', rossmarktId: 'drake' },
  { id: 'equo', rossmarktId: 'equo' },
  { id: 'erlenglanz', rossmarktId: 'erlenglanz' },
  { id: 'goldmaehne', rossmarktId: 'goldmähne' },
  { id: 'herzogsschimmer', rossmarktId: 'herzogsschimmer' },
  { id: 'hest', rossmarktId: 'hest' },
  { id: 'hross', rossmarktId: 'hross' },
  { id: 'myrr-pony', rossmarktId: 'myrr' },
  { id: 'nebtu', rossmarktId: 'nebtu' },
  { id: 'rhyfel', rossmarktId: 'rhyfel' },
  { id: 'sale', rossmarktId: 'sale' },
  { id: 'sarkal', rossmarktId: 'sarkal' },
  { id: 'shahzad', rossmarktId: 'shahzad' },
  { id: 'skaer', rossmarktId: 'skaer' },
  { id: 'skelmir-pony', rossmarktId: 'skelmir' },
  { id: 'skuggr', rossmarktId: 'skuggr' },
  { id: 'tirashan', rossmarktId: 'tirashan' },
  { id: 'xanathos', rossmarktId: 'xanathos' }
]);

export const HORSE_BREEDING_LORE_CROSSINGS = Object.freeze([
  {
    mareId: 'cyning',
    sireId: 'drake',
    name: 'Brycing',
    source: 'Pferdedossier Brycing',
    note: 'Die gefestigte Hochzucht vereint die Kraft des Cyning mit der kampferprobten Eleganz des Drake.'
  },
  {
    mareId: 'curragh',
    sireId: 'hest',
    name: 'Tirashan',
    source: 'Pferdedossier Tirashan',
    note: 'Die gefestigte Linie verbindet die Waldgängigkeit des Curragh mit der Robustheit des Hest.'
  }
]);

export const HORSE_BREEDING_CROSS_ENRICHMENTS = Object.freeze({
  'ceffyl|hest': {
    establishedBreed: 'Rhyfel',
    note: 'Aus dieser Verbindung ging später die gefestigte Rhyfel-Linie hervor.'
  }
});
