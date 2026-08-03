// Versionierte Ausgangspakete für den Stufe-1-Assistenten.
// Die Vorlagen enthalten nur strukturierte Startdaten; individuelle Regeln bleiben im Charakterbogen editierbar.

export const CHARACTER_CREATION_TEMPLATE_SCHEMA_VERSION = 1;

const weapon = (id, name, weaponType, damageFormula, damageType, attackAttribute = 'strength', extras = {}) => ({
  id: `starter-${id}`,
  name,
  weaponType,
  training: 'martial',
  damageFormula,
  damageType,
  attackAttribute,
  proficient: true,
  attackBonus: 0,
  damageBonus: 0,
  range: extras.range || 'Nahkampf',
  properties: extras.properties || 'Startausrüstung der gewählten Klasse',
  notes: extras.notes || '',
  activationType: 'action',
  costs: [{ id: `starter-${id}-action`, resourceId: 'action', name: 'Aktion', amount: 1, scope: 'comment' }],
  auraBypass: { allowed: true, resourceId: 'aura-focus', cost: 1 },
  equipped: false
});

const armor = (id, name, training, baseArmorClass, dexterityMode, dexterityCap = 2) => ({
  id: `starter-${id}`,
  name,
  kind: 'armor',
  training,
  baseArmorClass,
  armorClassBonus: 0,
  dexterityMode,
  dexterityCap,
  properties: 'Startausrüstung der gewählten Klasse',
  notes: '',
  equipped: true
});

export const CHARACTER_ANCESTRY_TEMPLATES = Object.freeze([
  {
    id: 'cenyr',
    label: 'Cenyr',
    aliases: ['Cenyri'],
    description: 'Cenyri verbinden körperliche Stärke mit höfischer Präsenz und religiös geprägter Bildung.',
    attributeBonuses: { strength: 2, charisma: 1 },
    skillProficiencies: ['Überzeugen', 'Auftreten', 'Religion'],
    culturalTraits: ['Cenyri Kultur', 'Höfische und religiöse Prägung']
  },
  {
    id: 'alben',
    label: 'Alben',
    aliases: [],
    description: 'Alben sind beweglich, naturverbunden und für ein Leben zwischen Wildnis und Tierwelt geschult.',
    attributeBonuses: { dexterity: 2, wisdom: 1 },
    skillProficiencies: ['Mit Tieren umgehen', 'Naturkunde', 'Überleben'],
    culturalTraits: ['Albische Naturverbundenheit']
  },
  {
    id: 'aldrimarer',
    label: 'Aldrimarer',
    aliases: [],
    description: 'Aldrimarer zeichnen sich durch Kraft, Zähigkeit und praktische Erfahrung in Tierhaltung und Wildnis aus.',
    attributeBonuses: { strength: 2, constitution: 1 },
    skillProficiencies: ['Athletik', 'Mit Tieren umgehen', 'Überleben'],
    culturalTraits: ['Aldrimarische Widerstandskraft']
  },
  {
    id: 'nordmann',
    label: 'Nordmann',
    aliases: ['Nordmänner'],
    description: 'Nordmänner sind widerstandsfähig, kraftvoll und an entbehrungsreiche Lebensräume gewöhnt.',
    attributeBonuses: { constitution: 2, strength: 1 },
    skillProficiencies: ['Überleben', 'Einschüchtern', 'Körperbeherrschung'],
    culturalTraits: ['Nordische Zähigkeit']
  }
]);

export const CHARACTER_BACKGROUND_TEMPLATES = Object.freeze([
  {
    id: 'ritter',
    label: 'Ritter',
    description: 'Ritterliche Erziehung, Standespflicht, Etikette, Heraldik und Verantwortung gegenüber Gefolge und Lehnsherrn.',
    skillProficiencies: ['Geschichte', 'Motiv erkennen'],
    proficiencies: {
      tools: ['Heraldik und höfische Etikette']
    },
    traits: ['Ritterliche Herkunft und Standespflicht']
  }
]);

export const CHARACTER_CLASS_TEMPLATES = Object.freeze([
  {
    id: 'teulu', group: 'Ritterkasten', label: 'Teulu', subtitle: 'Schwertkämpfer',
    description: 'Schwertkämpfer in mittlerer und schwerer Rüstung.',
    hitDie: 10,
    savingThrowProficiencies: ['strength', 'constitution'],
    proficiencies: { armor: ['medium', 'heavy'], weapons: ['simple', 'martial', 'sword'] },
    weapons: [weapon('teulu-longsword', 'Langschwert', 'sword', '1d8', 'Hieb')],
    armorItems: [armor('teulu-chainmail', 'Kettenhemd', 'heavy', 16, 'none')]
  },
  {
    id: 'cantref', group: 'Ritterkasten', label: 'Cantref', subtitle: 'Speerkämpfer',
    description: 'Speerkämpfer in mittlerer und schwerer Rüstung.',
    hitDie: 10,
    savingThrowProficiencies: ['strength', 'constitution'],
    proficiencies: { armor: ['medium', 'heavy'], weapons: ['simple', 'martial', 'spear', 'polearm'] },
    weapons: [weapon('cantref-spear', 'Speer', 'spear', '1d6', 'Stich', 'strength', { properties: 'Vielseitig · Startausrüstung der gewählten Klasse' })],
    armorItems: [armor('cantref-chainmail', 'Kettenhemd', 'heavy', 16, 'none')]
  },
  {
    id: 'helwyr', group: 'Ritterkasten', label: 'Helwyr', subtitle: 'Waldläufer und Bogenschütze',
    description: 'Waldläufer mit Bogen und Kurzschwert in leichter Rüstung.',
    hitDie: 10,
    savingThrowProficiencies: ['dexterity', 'wisdom'],
    proficiencies: { armor: ['light'], weapons: ['simple', 'martial', 'bow', 'sword'] },
    weapons: [
      weapon('helwyr-longbow', 'Langbogen', 'bow', '1d8', 'Stich', 'dexterity', { range: 'Fernkampf', properties: 'Zweihändig · Munition · Startausrüstung der gewählten Klasse' }),
      weapon('helwyr-shortsword', 'Kurzschwert', 'sword', '1d6', 'Hieb', 'dexterity', { properties: 'Finesse · Startausrüstung der gewählten Klasse' })
    ],
    armorItems: [armor('helwyr-leather', 'Lederrüstung', 'light', 11, 'full')]
  },
  {
    id: 'uchelwyr', group: 'Ritterkasten', label: 'Uchelwyr', subtitle: 'Berittener Ritter',
    description: 'Berittener Ritter mit Lanze und Schwert in mittlerer oder schwerer Rüstung.',
    hitDie: 10,
    savingThrowProficiencies: ['strength', 'constitution'],
    proficiencies: { armor: ['medium', 'heavy'], weapons: ['simple', 'martial', 'spear', 'sword'], tools: ['Reittiere'] },
    weapons: [
      weapon('uchelwyr-lance', 'Lanze', 'spear', '1d12', 'Stich', 'strength', { properties: 'Beritten · Reichweite · Startausrüstung der gewählten Klasse' }),
      weapon('uchelwyr-longsword', 'Langschwert', 'sword', '1d8', 'Hieb')
    ],
    armorItems: [armor('uchelwyr-chainmail', 'Kettenhemd', 'heavy', 16, 'none')]
  },
  {
    id: 'arthwyr', group: 'Ritterkasten', label: 'Arthwyr', subtitle: 'Brachialer Kämpfer',
    description: 'Brachialer Kämpfer mit breiter Waffenausbildung und mittlerer Rüstung.',
    hitDie: 12,
    savingThrowProficiencies: ['strength', 'constitution'],
    proficiencies: { armor: ['light', 'medium'], weapons: ['simple', 'martial', 'all'] },
    weapons: [weapon('arthwyr-greataxe', 'Großaxt', 'axe', '1d12', 'Hieb', 'strength', { properties: 'Schwer · Zweihändig · Startausrüstung der gewählten Klasse' })],
    armorItems: [armor('arthwyr-scale', 'Schuppenpanzer', 'medium', 14, 'capped', 2)]
  },
  {
    id: 'barddwyr', group: 'Ritterkasten', label: 'Barddwyr', subtitle: 'Kampfbarde',
    description: 'Kampfbarde mit Rapier, leichter Rüstung, Instrument und Zauberei.',
    hitDie: 8,
    savingThrowProficiencies: ['dexterity', 'charisma'],
    proficiencies: { armor: ['light'], weapons: ['simple', 'rapier', 'sword'], tools: ['Musikinstrument'] },
    weapons: [weapon('barddwyr-rapier', 'Rapier', 'sword', '1d8', 'Stich', 'dexterity', { properties: 'Finesse · Startausrüstung der gewählten Klasse' })],
    armorItems: [armor('barddwyr-padded', 'Wattierter Waffenrock', 'light', 11, 'full')],
    magic: { enabled: true, castingAttribute: 'charisma', notes: 'Barddwyr wirken ihre Magie durch Stimme, Vortrag und Instrument.' }
  },
  {
    id: 'morwyr', group: 'Vennyr-Klassen', label: 'Morwyr', subtitle: 'Seekrieger',
    description: 'Seekrieger mit Harpunenspeer, Partisane und Enteraxt in leichter Rüstung.',
    hitDie: 10,
    savingThrowProficiencies: ['strength', 'constitution'],
    proficiencies: { armor: ['light'], weapons: ['simple', 'martial', 'spear', 'polearm', 'axe'] },
    weapons: [
      weapon('morwyr-harpoon', 'Harpunenspeer', 'spear', '1d6', 'Stich', 'strength', { properties: 'Wurfwaffe · Startausrüstung der gewählten Klasse' }),
      weapon('morwyr-partisan', 'Partisane', 'polearm', '1d10', 'Hieb'),
      weapon('morwyr-boarding-axe', 'Enteraxt', 'axe', '1d6', 'Hieb')
    ],
    armorItems: [armor('morwyr-leather', 'Lederrüstung', 'light', 11, 'full')]
  },
  {
    id: 'rhyfelwyr', group: 'Vennyr-Klassen', label: 'Rhyfelwyr', subtitle: 'Ritterberserker',
    description: 'Ritterberserker mit Äxten, Keulen, Streitkolben und Schwertern in variabler Rüstung.',
    hitDie: 12,
    savingThrowProficiencies: ['strength', 'constitution'],
    proficiencies: { armor: ['light', 'medium', 'heavy'], weapons: ['simple', 'martial', 'axe', 'mace', 'sword'] },
    weapons: [
      weapon('rhyfelwyr-battleaxe', 'Streitaxt', 'axe', '1d8', 'Hieb'),
      weapon('rhyfelwyr-mace', 'Streitkolben', 'mace', '1d6', 'Wucht'),
      weapon('rhyfelwyr-longsword', 'Langschwert', 'sword', '1d8', 'Hieb')
    ],
    armorItems: [armor('rhyfelwyr-scale', 'Schuppenpanzer', 'medium', 14, 'capped', 2)]
  },
  {
    id: 'ceidwynr', group: 'Vennyr-Klassen', label: 'Ceidwynr', subtitle: 'See- und Fernkämpfer',
    description: 'Fernkämpfer mit Armbrust, Kurzbogen und vielseitigen Seewaffen sowie Vogelbegleiter.',
    hitDie: 10,
    savingThrowProficiencies: ['dexterity', 'wisdom'],
    proficiencies: { armor: ['light'], weapons: ['simple', 'martial', 'crossbow', 'bow', 'sword', 'spear', 'axe'], tools: ['Vogelabrichtung'] },
    weapons: [
      weapon('ceidwynr-crossbow', 'Armbrust', 'crossbow', '1d8', 'Stich', 'dexterity', { range: 'Fernkampf', properties: 'Laden · Munition · Startausrüstung der gewählten Klasse' }),
      weapon('ceidwynr-shortbow', 'Kurzbogen', 'bow', '1d6', 'Stich', 'dexterity', { range: 'Fernkampf', properties: 'Munition · Startausrüstung der gewählten Klasse' }),
      weapon('ceidwynr-sabre', 'Säbel', 'sword', '1d6', 'Hieb', 'dexterity', { properties: 'Finesse · Startausrüstung der gewählten Klasse' }),
      weapon('ceidwynr-trident', 'Dreizack', 'spear', '1d6', 'Stich'),
      weapon('ceidwynr-axe', 'Seeaxt', 'axe', '1d6', 'Hieb')
    ],
    armorItems: [armor('ceidwynr-leather', 'Lederrüstung', 'light', 11, 'full')],
    abilities: [{
      id: 'starter-ceidwynr-bird-companion', name: 'Vogelbegleiter', description: 'Ein abgerichteter Vogel unterstützt Aufklärung und Jagd.',
      activationType: 'passive', delivery: 'ability', combatUsable: false, usesCurrent: 0, usesMaximum: 0,
      recovery: 'none', active: true, tags: 'Begleiter · Aufklärung', aiInstructions: 'Berücksichtige den Vogel nur, wenn er in der Szene anwesend ist.'
    }]
  },
  {
    id: 'rhiddwyrr', group: 'Vennyr-Klassen', label: 'Rhiddwyrr', subtitle: 'Leichter Schockreiter',
    description: 'Leichter Schockreiter mit Reiterspieß, Kettenmorgenstern und Armbrust; bardisch geprägt, aber ohne Zauberei.',
    hitDie: 10,
    savingThrowProficiencies: ['dexterity', 'charisma'],
    proficiencies: { armor: ['light', 'medium'], weapons: ['simple', 'martial', 'spear', 'mace', 'crossbow'], tools: ['Reittiere', 'Musikinstrument'] },
    weapons: [
      weapon('rhiddwyrr-riding-spear', 'Reiterspieß', 'spear', '1d8', 'Stich', 'strength', { properties: 'Beritten · Startausrüstung der gewählten Klasse' }),
      weapon('rhiddwyrr-flail', 'Kettenmorgenstern', 'mace', '1d8', 'Wucht'),
      weapon('rhiddwyrr-crossbow', 'Armbrust', 'crossbow', '1d8', 'Stich', 'dexterity', { range: 'Fernkampf', properties: 'Laden · Munition · Startausrüstung der gewählten Klasse' })
    ],
    armorItems: [armor('rhiddwyrr-light-scale', 'Leichter Schuppenpanzer', 'medium', 13, 'capped', 3)]
  },
  {
    id: 'derwyn', group: 'Vennyr-Klassen', label: 'Derwyn', subtitle: 'Kleriker oder Paladin',
    description: 'Geweihter Kämpfer Nimues mit göttlicher Wasser- und Heilungsmagie.',
    hitDie: 10,
    savingThrowProficiencies: ['wisdom', 'charisma'],
    proficiencies: { armor: ['medium', 'heavy'], weapons: ['simple', 'martial', 'mace', 'staff', 'spear'], tools: ['Religiöse Liturgie Nimues'] },
    weapons: [
      weapon('derwyn-morningstar', 'Morgenstern', 'mace', '1d8', 'Stich'),
      weapon('derwyn-staff', 'Stab', 'staff', '1d6', 'Wucht'),
      weapon('derwyn-trident', 'Dreizack', 'spear', '1d6', 'Stich')
    ],
    armorItems: [armor('derwyn-chainmail', 'Kettenhemd', 'heavy', 16, 'none')],
    magic: {
      enabled: true,
      castingAttribute: 'wisdom',
      notes: 'Göttliche Magie Nimues, Göttin des Meeres und der Reinheit. Schwerpunkt: Wasser, Reinigung und Heilung.'
    }
  }
]);

export const CHARACTER_CREATION_TEMPLATES = Object.freeze({
  ancestry: CHARACTER_ANCESTRY_TEMPLATES,
  background: CHARACTER_BACKGROUND_TEMPLATES,
  class: CHARACTER_CLASS_TEMPLATES
});

export function getCharacterCreationTemplate(kind, id) {
  return (CHARACTER_CREATION_TEMPLATES[kind] || []).find(template => template.id === String(id || '')) || null;
}

export function getGroupedCharacterClassTemplates() {
  return CHARACTER_CLASS_TEMPLATES.reduce((groups, template) => {
    if (!groups.has(template.group)) groups.set(template.group, []);
    groups.get(template.group).push(template);
    return groups;
  }, new Map());
}
