// Existing CK artwork, shared by council and household offices.
export const OFFICE_DUTY_ICONS = Object.freeze({
  records: 'Trait_administrator.png', coordination: 'Trait_organizer.png',
  supplies: 'Trait_logistician.png', command: 'Trait_education_martial_4.png',
  arms: 'Trait_blademaster.png', scouting: 'Trait_hunter.png',
  learning: 'Trait_scholar.png', faith: 'Trait_theologian.png',
  care: 'Trait_physician.png', secrecy: 'Trait_schemer.png',
  inquiry: 'Trait_inspector.png', diplomacy: 'Trait_education_diplomacy_4.png',
  money: 'Trait_education_stewardship_4.png', proclamation: 'Trait_poet.png',
  hospitality: 'Trait_reveler.png', works: 'Trait_architect.png',
  garden: 'Trait_gardener.png', judgment: 'Trait_shrewd.png',
});

export function dutyIcon(key) {
  const filename = OFFICE_DUTY_ICONS[key];
  if (!filename) throw new Error(`Unknown office duty icon: ${key}`);
  return `/IconOrdner/Cktraits/${filename}`;
}

export function brief(practice, ...tasks) {
  return { practice, duties: tasks.map(([icon, text]) => ({ icon, text })) };
}
