import { DRACHENTANZ_FORM_IDS as F } from '../drachentanz-ids.js?v=20260908-cenyr-paths-v1';
import { createDrachentanzTechnique, secondarySave, temporaryCondition } from './drachentanz-technique-factory.js?v=20260908-cenyr-paths-v1';

const CLASS_WEAPONS = Object.freeze({
  teulu: ['sword'],
  cantref: ['spear', 'lance', 'trident'],
  uchelwyr: ['sword', 'lance'],
  arthwyr: ['axe', 'battleaxe', 'club', 'mace']
});

function shield(spec) {
  return createDrachentanzTechnique({
    formId: F.bruellender,
    slotBands: ['expert'],
    tier: 'Schildtechnik des Brüllenden Drachen',
    allowedClassIds: Object.keys(CLASS_WEAPONS),
    classWeaponProfiles: CLASS_WEAPONS,
    weaponTypes: ['sword', 'spear', 'axe', 'mace'],
    weaponRuleSetId: 'cantref-polearm',
    uchelwyrCompatible: true,
    requiresShield: true,
    maximumTargets: 1,
    requirements: 'Eine passende einhändige Waffe und ein gleichzeitig geführter Schild.',
    tags: ['Schild', 'Brüllender Drache'],
    ...spec
  });
}

export const BRUELLENDER_SHIELD_TECHNIQUES = Object.freeze([
  shield({ slug: 'bruellender-schildrachenmaul', name: 'Schildrachenmaul', minimumLevel: 9, costs: ['action', 'special-action'],
    description: 'Schild und Waffe schließen sich wie Ober- und Unterkiefer um die gegnerische Deckung.',
    effect: 'Verursacht Technikschaden; ein misslungener Stärkerettungswurf gibt dem Ziel −1 Angriff bis zum Ende seines nächsten Beitrags.',
    secondarySave: secondarySave('bruellender-schildrachenmaul', 'Eingeklemmte Deckung', 'Schild und Waffe haben die gegnerische Führung kurz eingeklemmt.', { attack: -1 }) }),
  shield({ slug: 'bruellender-schuppenramme', name: 'Schuppenramme', minimumLevel: 14, costs: ['action', 'reaction', 'special-action'],
    description: 'Der Ritter fängt den Angriff auf dem Schild und treibt dessen ganze Wucht in den Gegenschlag.',
    effect: 'Verursacht Technikschaden und gewährt bis zum nächsten eigenen Beitrag +2 Rüstungsklasse.',
    effects: [temporaryCondition('bruellender-schuppenramme', 'Schuppenramme', 'Der Schild bleibt nach dem Gegenschlag fest vor dem Körper.', { armorClass: 2 }, { target: 'self', on: 'always' })] }),
  shield({ slug: 'bruellender-donnerwall', name: 'Donnerwall des Brülldrachen', minimumLevel: 19, costs: ['action', 'reaction', 'special-action', 'aura-focus'],
    description: 'Ein Aurastoß fährt durch Schild und Waffe, sobald der Gegner gegen die geschlossene Wehr prallt.',
    effect: 'Verursacht Technikschaden, erhält +2 Angriff und gewährt bis zum nächsten eigenen Beitrag +3 Rüstungsklasse.', attackBonus: 2,
    effects: [temporaryCondition('bruellender-donnerwall', 'Donnerwall', 'Aura und Schild bilden eine dröhnende, geschlossene Wehr.', { armorClass: 3 }, { target: 'self', on: 'always' })] })
]);
