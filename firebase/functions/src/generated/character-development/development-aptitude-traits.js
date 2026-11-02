// Aptitudes use existing checks, not invented automatic crafting or knowledge.
const skill = (name, bonus) => ({ name, bonus });
export const APTITUDE_TRAIT_DEFINITIONS = [
  ['zahlenintuition', 'Zahlenintuition', 'Du erkennst Mengenverhältnisse und Zahlenmuster schnell: +2 auf Nachforschungen und +1 auf Geschichte.', { skillModifiers: [skill('Nachforschungen', 2), skill('Geschichte', 1)] }, 2],
  ['sprachgefuehl', 'Sprachgefühl', 'Du findest leicht den passenden Ausdruck: +2 auf Überzeugen und +1 auf Täuschen.', { skillModifiers: [skill('Überzeugen', 2), skill('Täuschen', 1)] }, 2],
  ['mechanisches-verstaendnis', 'Mechanisches Verständnis', 'Du begreifst das Zusammenspiel kleiner Bauteile: +2 auf Fingerfertigkeit und +1 auf Nachforschungen.', { skillModifiers: [skill('Fingerfertigkeit', 2), skill('Nachforschungen', 1)] }, 2],
  ['feines-musikgehoer', 'Feines Musikgehör', 'Du nimmst Rhythmus und emotionale Zwischentöne sicher auf: +2 auf Auftreten und +1 auf Motiv erkennen.', { skillModifiers: [skill('Auftreten', 2), skill('Motiv erkennen', 1)] }, 2],
  ['raumgefuehl', 'Raumgefühl', 'Du schätzt Abstände und räumliche Zusammenhänge gut ein: +2 auf Akrobatik und +1 auf Nachforschungen.', { skillModifiers: [skill('Akrobatik', 2), skill('Nachforschungen', 1)] }, 2],
  ['taktisches-gespuer', 'Taktisches Gespür', 'Du erkennst rasch, wann eine Lage kippt: +1 Initiative und +1 auf WEI-Rettungswürfe.', { initiative: 1, saveAttributeModifiers: [{ attributeKey: 'wisdom', bonus: 1 }] }, 2],
  ['alchemistisches-gespuer', 'Alchemistisches Gespür', 'Stoffe und ihre magischen Eigenheiten erschließen sich dir leicht: +2 auf Naturkunde und +1 auf Arkane Kunde.', { skillModifiers: [skill('Naturkunde', 2), skill('Arkane Kunde', 1)] }, 2],
  ['symboldenker', 'Symboldenker', 'Du erkennst Beziehungen zwischen Zeichen, Riten und Runen: +2 auf Religion und +1 auf Arkane Kunde.', { skillModifiers: [skill('Religion', 2), skill('Arkane Kunde', 1)] }, 2],
  ['stimmkuenstler', 'Stimmkünstler', 'Du variierst Stimme und Ausdruck mühelos: +2 auf Täuschen und +1 auf Auftreten.', { skillModifiers: [skill('Täuschen', 2), skill('Auftreten', 1)] }, 2],
  ['tierisches-taktgefuehl', 'Tierisches Taktgefühl', 'Du passt deine Bewegungen und Ruhe gut an Tiere an: +2 auf Mit Tieren umgehen und +1 auf Körperbeherrschung.', { skillModifiers: [skill('Mit Tieren umgehen', 2), skill('Körperbeherrschung', 1)] }, 2]
];
