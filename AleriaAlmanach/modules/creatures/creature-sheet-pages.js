export const CREATURE_SHEET_PAGES = Object.freeze([
  { id: 'overview', label: 'Übersicht', subtitle: 'Das Wesen auf einen Blick' },
  { id: 'profile', label: 'Profil', subtitle: 'Identität, Lebensraum & Spielleitungsnotizen' },
  { id: 'biography', label: 'Biographie', subtitle: 'Steckbrief, Wesen, Herkunft & Bindungen' },
  { id: 'combat', label: 'Kampfwerte', subtitle: 'Attribute, Ressourcen & Zustände' },
  { id: 'abilities', label: 'Angriffe & Kräfte', subtitle: 'Waffen, Techniken & besondere Eigenschaften' },
  { id: 'magic', label: 'Magie & Aura', subtitle: 'Zauber, Zauberplätze & magischer Schutz' },
  { id: 'loot', label: 'Beute', subtitle: 'Lootbox · Münzen, Fundstücke & mögliche Drops' },
  { id: 'images', label: 'Bilder & Emotes', subtitle: 'Portraits, Bildersets & Ausdrucksgalerie' }
]);

export function renderCreaturePageTabs(active) {
  return CREATURE_SHEET_PAGES.map((page, index) => `<button type="button" role="tab" id="creature-tab-${page.id}" aria-controls="creature-page-${page.id}" aria-selected="${page.id === active}" tabindex="${page.id === active ? 0 : -1}" data-creature-page="${page.id}"><small>${String(index + 1).padStart(2, '0')}</small>${page.label}</button>`).join('');
}

export function renderCreaturePages(contents, active) {
  // Keep every form mounted: changing a page must never discard unsaved fields
  // or make the collector mistake a hidden collection for an empty collection.
  return CREATURE_SHEET_PAGES.map(page => `<section class="creature-sheet-page" id="creature-page-${page.id}" role="tabpanel" aria-labelledby="creature-tab-${page.id}" tabindex="0"${page.id === active ? '' : ' hidden'}>
    <div class="creature-page-heading"><h3>${page.label}</h3><p>${page.subtitle}</p></div>
    ${contents[page.id] || ''}
  </section>`).join('');
}

export function creaturePageFromKey(event) {
  const tab = event.target.closest('[data-creature-page]');
  if (!tab) return '';
  const index = CREATURE_SHEET_PAGES.findIndex(page => page.id === tab.dataset.creaturePage);
  const keys = { ArrowRight: (index + 1) % CREATURE_SHEET_PAGES.length, ArrowLeft: (index + CREATURE_SHEET_PAGES.length - 1) % CREATURE_SHEET_PAGES.length, Home: 0, End: CREATURE_SHEET_PAGES.length - 1 };
  if (!(event.key in keys)) return '';
  event.preventDefault();
  return CREATURE_SHEET_PAGES[keys[event.key]].id;
}
