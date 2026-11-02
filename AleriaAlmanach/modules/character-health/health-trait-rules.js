export function healthMagicSaveRules(id, bonus) {
  return ['pre-roll', 'pre-secondary-save'].map(phase => ({ id: `${id}-${phase}`, name: 'Arkane Vernarbung',
    phase, condition: 'always', recipient: 'target', sourceRelation: 'self', activation: 'passive', frequency: 'always',
    actionKinds: ['spell', 'song', 'prayer'], saveAttributes: ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'],
    effects: { savingThrowModifier: bonus } }));
}
