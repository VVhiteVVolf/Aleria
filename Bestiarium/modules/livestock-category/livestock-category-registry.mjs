export const LIVESTOCK_CATEGORIES = Object.freeze([
  { id: 'rinder', title: 'Rinder' },
  { id: 'schafe-und-ziegen', title: 'Schafe & Ziegen' },
  { id: 'schweine-und-wildschweine', title: 'Schweine & Wildschweine' },
  { id: 'huehner-und-gefluegel', title: 'Hühner & Geflügel' },
  { id: 'haustiere', title: 'Haustiere' },
  { id: 'lasttiere', title: 'Last- & Nutztiere' }
]);

export const LIVESTOCK_CATEGORY_IDS = Object.freeze(LIVESTOCK_CATEGORIES.map(category => category.id));
