import { getDevelopmentTraitId } from './development-entry-reference.js';

export const ANIMAL_SPEECH_TRAIT_ID = 'development-trait-kann-mit-tieren-sprechen';
export const ANIMAL_SPEECH_TRAIT_DEFINITIONS = Object.freeze([
  ['kann-mit-tieren-sprechen', 'Kann mit Tieren sprechen',
    'Wenn du in Tiersprache mit einem Tier sprichst, erhältst du Vorteil auf Mit Tieren umgehen. Ob sich das Tier beruhigen oder überzeugen lässt, entscheidet die Probe.',
    {}, 3, { tags: 'Begabung · Sprache · Tierverbundenheit' }]
]);

export function hasAnimalSpeechTrait(actor = {}) {
  const profile = actor?.profile || actor?.combatProfile || actor;
  return Array.isArray(profile?.quirks) && profile.quirks.some(trait => trait && trait.active !== false && getDevelopmentTraitId(trait) === ANIMAL_SPEECH_TRAIT_ID);
}

export function isAnimalSpeechSegment(segment = {}) {
  return ['animal', 'tiersprache', 'tier'].includes(String(segment.commentKind || segment.kind || '').toLocaleLowerCase('de'));
}
