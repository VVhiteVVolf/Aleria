// Local artwork and explicit Aleria effects; an icon never imports BG3 rules.
const iconRoot = '../IconOrdner/Zauber Icons/Baldurs Gate/Condition Icons/';
export const COMBAT_STATUS_PRESETS = Object.freeze([
  { id: 'blessed', name: 'Gesegnet', kind: 'buff', icon: 'Bless_Condition_Icon.webp', description: 'Ein Segen begleitet die Figur. Trage die vereinbarten Boni unten ein.' },
  { id: 'protected', name: 'Geschützt', kind: 'buff', icon: 'Shielded_Condition_Icon.webp', description: 'Vorübergehender Schutz. Rüstungsbonus nach Quelle eintragen.' },
  { id: 'bane', name: 'Verflucht', kind: 'debuff', icon: 'Bane_Condition_Icon.webp', description: 'Ein Fluch beeinträchtigt die Figur. Mali nach Quelle eintragen.' },
  { id: 'poisoned', name: 'Vergiftet', kind: 'debuff', icon: 'Poisoned_Condition_Icon.webp', description: 'Giftwirkung und gegebenenfalls Folgeschaden nach Quelle berücksichtigen.' },
  { id: 'burning', name: 'Brennend', kind: 'debuff', icon: 'Burning_Condition_Icon.webp', description: 'Die Figur brennt. Folgeschaden und Löschbedingungen nach Quelle berücksichtigen.' },
  { id: 'bleeding', name: 'Blutend', kind: 'debuff', icon: 'Bleeding_Condition_Icon.webp', description: 'Eine blutende Wunde. Folgeschaden und Versorgung nach Quelle berücksichtigen.' },
  { id: 'blinded', name: 'Geblendet', kind: 'condition', icon: 'Blinded_Condition_Icon.webp', description: 'Die Sicht ist beeinträchtigt. Einschränkungen nach Quelle berücksichtigen.' },
  { id: 'prone', name: 'Liegend', kind: 'condition', icon: 'Prone_Condition_Icon.webp', description: 'Die Figur liegt am Boden. Aufstehen und Reichweiten berücksichtigen.' },
  { id: 'restrained', name: 'Festgesetzt', kind: 'condition', icon: 'Restrained_Condition_Icon.webp', description: 'Die Figur ist festgesetzt. Befreiungsbedingungen nach Quelle berücksichtigen.' },
  { id: 'stunned', name: 'Betäubt', kind: 'condition', icon: 'Stunned_Condition_Icon.webp', description: 'Die Figur ist betäubt. Handlungseinschränkungen nach Quelle berücksichtigen.' },
  { id: 'sleeping', name: 'Schlafend', kind: 'condition', icon: 'Sleeping_Condition_Icon.webp', description: 'Die Figur schläft. Aufweckbedingungen nach Quelle berücksichtigen.' },
  { id: 'wet', name: 'Nass', kind: 'condition', icon: 'Wet_Condition_Icon.webp', description: 'Die Figur ist durchnässt. Wechselwirkungen nach Quelle berücksichtigen.' }
]);

export const STATUS_MODIFIERS = Object.freeze([
  ['attack', 'Angriff'], ['damage', 'Schaden'], ['armorClass', 'Rüstungsklasse'],
  ['savingThrow', 'Rettungswürfe'], ['skill', 'Fertigkeiten'], ['spellAttack', 'Zauberangriff'], ['spellSaveDc', 'Zauber-SG']
]);

export function getStatusIcon(condition = {}) {
  const preset = COMBAT_STATUS_PRESETS.find(item => item.id === condition.presetId
    || item.name.toLocaleLowerCase('de') === String(condition.name || '').toLocaleLowerCase('de'));
  return preset ? `${iconRoot}${preset.icon}` : '';
}
