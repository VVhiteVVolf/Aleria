// Shared, dependency-free skill identities for sheets, traits and scene checks.
export const SKILL_DEFINITIONS = Object.freeze([
  { id: 'persuasion', label: 'Überzeugen', aliases: ['überzeugen', 'ueberzeugen', 'überreden', 'ueberreden'], attributeKey: 'charisma' },
  { id: 'intimidation', label: 'Einschüchtern', aliases: ['einschüchtern', 'einschuechtern'], attributeKey: 'charisma' },
  { id: 'deception', label: 'Täuschen', aliases: ['täuschen', 'taeuschen'], attributeKey: 'charisma' },
  { id: 'performance', label: 'Auftreten', aliases: ['auftreten', 'schauspiel'], attributeKey: 'charisma' },
  { id: 'perception', label: 'Wahrnehmung', aliases: ['wahrnehmung'], attributeKey: 'wisdom' },
  { id: 'insight', label: 'Motiv erkennen', aliases: ['motiv erkennen', 'motiverkennen'], attributeKey: 'wisdom' },
  { id: 'animal-handling', label: 'Mit Tieren umgehen', aliases: ['mit tieren umgehen', 'tierkunde'], attributeKey: 'wisdom' },
  { id: 'medicine', label: 'Heilkunde', aliases: ['heilkunde'], attributeKey: 'wisdom' },
  { id: 'investigation', label: 'Nachforschungen', aliases: ['nachforschungen', 'nachforschen'], attributeKey: 'intelligence' },
  { id: 'religion', label: 'Religion', aliases: ['religion', 'glaubenskunde'], attributeKey: 'intelligence' },
  { id: 'arcane-kunde', label: 'Arkane Kunde', aliases: ['arkane kunde', 'arkanekunde'], attributeKey: 'intelligence' },
  { id: 'history', label: 'Geschichte', aliases: ['geschichte'], attributeKey: 'intelligence' },
  { id: 'nature', label: 'Naturkunde', aliases: ['naturkunde'], attributeKey: 'intelligence' },
  { id: 'survival', label: 'Überleben', aliases: ['überleben', 'ueberleben', 'überlebenskunst', 'ueberlebenskunst'], attributeKey: 'wisdom' },
  { id: 'sleight-of-hand', label: 'Fingerfertigkeit', aliases: ['fingerfertigkeit'], attributeKey: 'dexterity' },
  { id: 'acrobatics', label: 'Akrobatik', aliases: ['akrobatik'], attributeKey: 'dexterity' },
  { id: 'stealth', label: 'Heimlichkeit', aliases: ['heimlichkeit', 'schleichen'], attributeKey: 'dexterity' },
  { id: 'athletics', label: 'Athletik', aliases: ['athletik'], attributeKey: 'strength' },
  { id: 'seduction', label: 'Flirten', aliases: ['flirten', 'verführen', 'verfuehren'], attributeKey: 'charisma' },
  { id: 'body-control', label: 'Körperbeherrschung', aliases: ['körperbeherrschung', 'koerperbeherrschung'], attributeKey: 'constitution' }
]);

const normalize = value => String(value || '').trim().toLocaleLowerCase('de')
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ß/g,'ss').replace(/\s+/g,' ');
const identities = new Map(SKILL_DEFINITIONS.flatMap(definition =>
  [definition.id, definition.label, ...definition.aliases].map(name => [normalize(name),definition.id])));

export function getSkillIdentity(name) { return identities.get(normalize(name)) || normalize(name); }

