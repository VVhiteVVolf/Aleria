// Presentation only: skill names and aliases resolve independently of saved row IDs.
const definitions = [
  ['athletics', 'Athletik'],
  ['acrobatics', 'Akrobatik'],
  ['sleight-of-hand', 'Fingerfertigkeit'],
  ['stealth', 'Heimlichkeit'],
  ['arcane-kunde', 'Arkane Kunde', 'Arkanekunde'],
  ['history', 'Geschichte'],
  ['investigation', 'Nachforschungen', 'Nachforschen'],
  ['nature', 'Naturkunde'],
  ['religion', 'Religion', 'Glaubenskunde'],
  ['medicine', 'Heilkunde'],
  ['animal-handling', 'Mit Tieren umgehen', 'Tierkunde'],
  ['insight', 'Motiv erkennen', 'Motiverkennen'],
  ['survival', 'Überleben', 'Ueberleben'],
  ['perception', 'Wahrnehmung'],
  ['performance', 'Auftreten', 'Schauspiel'],
  ['intimidation', 'Einschüchtern', 'Einschuechtern'],
  ['deception', 'Täuschen', 'Taeuschen'],
  ['persuasion', 'Überreden', 'Überzeugen', 'Ueberreden', 'Ueberzeugen'],
  ['seduction', 'Flirten', 'Verführen', 'Verfuehren'],
  ['body-control', 'Körperbeherrschung', 'Koerperbeherrschung']
];
const normalize = value => String(value || '').normalize('NFKC').trim().toLocaleLowerCase('de').replace(/\s+/g, ' ');
const presentation = (id, name) => Object.freeze({ id, name, src: new URL(`../../public/assets/skill-icons/${id}-v1.webp`, import.meta.url).href });

export const SKILL_ICON_DEFINITIONS = Object.freeze(definitions.map(([id, name]) => presentation(id, name)));
const byName = new Map(definitions.flatMap(([id, name, ...aliases], index) => [id, name, ...aliases].map(alias => [normalize(alias), SKILL_ICON_DEFINITIONS[index]])));
const fallback = presentation('custom-skill', 'Eigene Fertigkeit');

export function getSkillIconPresentation(skill = '') {
  return byName.get(normalize(typeof skill === 'string' ? skill : skill?.name)) || fallback;
}
