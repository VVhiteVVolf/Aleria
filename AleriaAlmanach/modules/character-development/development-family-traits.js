// Authored inherited expressions. Ranks describe an existing person, not training.
const attribute = (attributeKey, bonus) => ({ attributeKey, bonus });
const skill = (name, bonus) => ({ name, bonus });
const roman = ['I', 'II', 'III', 'IV', 'V', 'VI'];
const nuadat = [
  // height in cm, STR score, maximum HP, STR save, DEX score, stealth, acrobatics, AC, cost
  [200, 2, 4, 0, 0, -1, 0, 0, 5],
  [240, 3, 7, 0, -1, -2, -1, 0, 7],
  [280, 4, 10, 1, -1, -2, -1, -1, 9],
  [320, 6, 14, 1, -2, -3, -2, -1, 12],
  [360, 8, 18, 2, -2, -3, -2, -1, 16],
  [400, 10, 24, 2, -2, -4, -3, -2, 20]
];
const arth = [
  // STR score, additional STR-based weapon damage, DEX score, stealth, cost
  [1, 1, 0, -1, 3], [2, 1, 0, -1, 5], [3, 2, -1, -1, 7],
  [4, 2, -1, -2, 9], [6, 3, -1, -2, 12], [8, 4, -2, -2, 15]
];
const signed = value => `${value < 0 ? '−' : '+'}${Math.abs(value)}`;
const heightLabel = cm => (cm / 100).toLocaleString('de-DE', { minimumFractionDigits: 1 });
const rankNote = 'Nur die höchste aktive Stufe dieser Linie wirkt.';
export const FAMILY_TRAIT_DEFINITIONS = Object.freeze([
  ...nuadat.map(([height, strength, hp, strengthSave, dexterity, stealth, acrobatics, armorClass, cost], index) => [
    `nuadat-riesenblut-${index + 1}`, `Riesenblut der Nuadat (Stufe ${roman[index]})`,
    `Angeborenes Riesenerbe: ${heightLabel(height)} Meter Körpergröße; +${strength} STÄ-Attributswert und +${hp} maximale TP (abgeleitet)${strengthSave ? `, +${strengthSave} STÄ-Rettung` : ''}; ${[
      ...(dexterity ? [`${signed(dexterity)} GES-Attributswert`] : []), `${signed(stealth)} Heimlichkeit`,
      ...(acrobatics ? [`${signed(acrobatics)} Akrobatik`] : []), ...(armorClass ? [`${signed(armorClass)} RK`] : [])
    ].join(', ')}. Attributsmodifikatoren wirken zusätzlich. ${rankNote} Ersetzt Groß, Hünenhaft und Riesenblut vollständig. Aktuelle TP bleiben erhalten. Größe bei Durchgängen und Ausrüstung beachten; Reichweite und Waffenwürfel bleiben unverändert.`,
    { attributeModifiers: [attribute('strength', strength), ...(dexterity ? [attribute('dexterity', dexterity)] : [])], maximumHitPoints: hp,
      ...(strengthSave ? { saveAttributeModifiers: [attribute('strength', strengthSave)] } : {}),
      skillModifiers: [skill('Heimlichkeit', stealth), ...(acrobatics ? [skill('Akrobatik', acrobatics)] : [])],
      ...(armorClass ? { armorClass } : {}) }, cost,
    { icon: `/AleriaAlmanach/assets/development-traits/web/nuadat-riesenblut-${index + 1}.webp`, family: 'nuadat', rank: index + 1, heightCm: height }
  ]),
  ...arth.map(([strength, damage, dexterity, stealth, cost], index) => [
    `arth-blut-${index + 1}`, `Das Blut der Arth (Stufe ${roman[index]})`,
    `Angeborene übermenschliche Kraft: +${strength} STÄ-Attributswert und zusätzlich +${damage} Schaden bei STÄ-Waffenangriffen; ${dexterity ? `${signed(dexterity)} GES-Attributswert und ` : ''}${signed(stealth)} Heimlichkeit. Attributsmodifikatoren wirken zusätzlich auf passende Angriffe, Schaden, Proben und Rettungen. Der Zusatzschaden gilt ausschließlich für das tatsächliche STÄ-Waffenattribut. ${rankNote}`,
    { attributeModifiers: [attribute('strength', strength), ...(dexterity ? [attribute('dexterity', dexterity)] : [])],
      weaponModifiers: [{ attackAttributes: ['strength'], damage }], skillModifiers: [skill('Heimlichkeit', stealth)] }, cost,
    { icon: `/AleriaAlmanach/assets/development-traits/web/arth-blut-${index + 1}.webp`, family: 'arth', rank: index + 1 }
  ])
]);

const origins = new Map(FAMILY_TRAIT_DEFINITIONS.map(([id, name, , , , policy]) => [`development-trait-${id}`, Object.freeze({
  id: `development-trait-${id}`, name, ...policy, exclusiveGroup: `family-blood-${policy.family}`
})]));
export function getFamilyTraitOrigin(entry) {
  return origins.get(typeof entry === 'string' ? entry : entry?.developmentTraitId || entry?.id) || null;
}
export const FAMILY_TRAIT_NOTE = 'Angeborene Familienmerkmale: Wähle die belegte Ausprägung. Jede Linie hat sechs alternative Stufen; nur die höchste aktive zählt mechanisch und für die Balance. STÄ und GES bezeichnen hier Attributswerte, keine direkten Modifikatoren. Ein ausdrücklich festgelegtes TP-Gesamtmaximum oder eine festgelegte Gesamt-RK hat wie bisher Vorrang vor abgeleiteten Werten. Beide Linien zusammen brauchen eine entsprechend belegte Abstammung.';
