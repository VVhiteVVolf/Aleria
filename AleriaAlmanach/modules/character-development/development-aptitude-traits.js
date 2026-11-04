// Aptitudes use existing checks, not invented automatic crafting or knowledge.
const skill = (name, bonus) => ({ name, bonus });
export const APTITUDE_TRAIT_DEFINITIONS = [
  ['zahlenintuition', 'Zahlenintuition', 'Du erkennst Mengenverhältnisse und Muster schnell: +1 auf Nachforschungen. Zahlengefühl vermittelt kein historisches Wissen.', { skillModifiers: [skill('Nachforschungen', 1)] }, 1],
  ['sprachgefuehl', 'Sprachgefühl', 'Du findest leicht den passenden Ausdruck: +1 auf Überzeugen und Täuschen.', { skillModifiers: [skill('Überzeugen', 1), skill('Täuschen', 1)] }, 1],
  ['mechanisches-verstaendnis', 'Mechanisches Verständnis', 'Du begreifst kleine Bauteile und gehst sicher damit um: +1 auf Fingerfertigkeit und Nachforschungen.', { skillModifiers: [skill('Fingerfertigkeit', 1), skill('Nachforschungen', 1)] }, 1],
  ['feines-musikgehoer', 'Feines Musikgehör', 'Du hörst Rhythmus und Tonhöhe sicher: +1 auf Auftreten. Musikalisches Gehör verrät keine fremden Absichten.', { skillModifiers: [skill('Auftreten', 1)] }, 1],
  ['raumgefuehl', 'Raumgefühl', 'Du schätzt Abstände und die eigene Lage im Raum gut ein: +1 auf Akrobatik und Körperbeherrschung.', { skillModifiers: [skill('Akrobatik', 1), skill('Körperbeherrschung', 1)] }, 1],
  ['taktisches-gespuer', 'Taktisches Gespür', 'Du erkennst rasch, wann eine Lage kippt: +1 Initiative und +1 auf WEI-Rettungswürfe.', { initiative: 1, saveAttributeModifiers: [{ attributeKey: 'wisdom', bonus: 1 }] }, 2],
  ['alchemistisches-gespuer', 'Alchemistisches Gespür', 'Du bemerkst Auffälligkeiten von Stoffen und Magie leichter: +1 auf Naturkunde und Arkane Kunde. Rezepte müssen weiterhin erlernt werden.', { skillModifiers: [skill('Naturkunde', 1), skill('Arkane Kunde', 1)] }, 1],
  ['symboldenker', 'Symboldenker', 'Du erkennst Beziehungen zwischen Zeichen, Riten und Runen: +1 auf Religion und Arkane Kunde.', { skillModifiers: [skill('Religion', 1), skill('Arkane Kunde', 1)] }, 1],
  ['stimmkuenstler', 'Stimmkünstler', 'Du variierst Stimme und Ausdruck mühelos: +1 auf Täuschen und Auftreten.', { skillModifiers: [skill('Täuschen', 1), skill('Auftreten', 1)] }, 1],
  ['tierisches-taktgefuehl', 'Tierisches Taktgefühl', 'Du passt deine Bewegungen und Ruhe gut an Tiere an: +1 auf Mit Tieren umgehen. Daraus folgt keine allgemeine Körperausbildung.', { skillModifiers: [skill('Mit Tieren umgehen', 1)] }, 1]
];
