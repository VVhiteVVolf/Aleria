import { getDevelopmentTraitId } from './development-entry-reference.js';

export const ANIMAL_SPEECH_TRAIT_ID = 'development-trait-kann-mit-tieren-sprechen';
export const ANIMAL_SPEECH_TRAIT_DEFINITIONS = Object.freeze([
  ['kann-mit-tieren-sprechen', 'Kann mit Tieren sprechen',
    'Du kannst dich mit Tieren in Tiersprache verständigen. Die Tiersprache-Blase gibt dir Vorteil auf Mit Tieren umgehen. Bei Rede, Flüstern und Rufen bleibt die Probe regulär. Ob ein Tier sich beruhigen oder überzeugen lässt, entscheidet weiterhin die Probe.',
    {}, 3, { tags: 'Begabung · Sprache · Tierverbundenheit' }]
]);

export function canSpeakWithAnimals(actor = {}) {
  const profile = actor?.profile || actor?.combatProfile || actor;
  return Array.isArray(profile?.quirks) && profile.quirks.some(trait => trait && trait.active !== false && getDevelopmentTraitId(trait) === ANIMAL_SPEECH_TRAIT_ID);
}

export function isAnimalSpeechSegment(segment = {}) {
  return ['animal', 'tiersprache', 'tier'].includes(String(segment.commentKind || segment.kind || '').toLocaleLowerCase('de'));
}

export function getAnimalSpeechError(actor) {
  return canSpeakWithAnimals(actor) ? '' : 'Tiersprache benötigt das aktive Merkmal „Kann mit Tieren sprechen“. Für normalen Tierumgang nutze Rede, Flüstern oder Rufen.';
}
