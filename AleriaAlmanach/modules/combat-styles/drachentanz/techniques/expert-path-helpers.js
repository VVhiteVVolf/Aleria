import { createDrachentanzTechnique } from './drachentanz-technique-factory.js?v=20260909-dragon-parent-v2';

export const KNIGHT_PATH_CLASS_IDS = Object.freeze(['teulu', 'helwyr', 'arthwyr']);

const BASE_CLASS_WEAPONS = Object.freeze({
  teulu: ['sword'],
  helwyr: ['sword'],
  arthwyr: ['greatsword', 'axe', 'battleaxe', 'club', 'mace']
});

export function pathClassWeapons(uchelwyrLance = false) {
  return { ...BASE_CLASS_WEAPONS };
}

export function createExpertPathTechnique(formId, pathSlug, spec) {
  return createDrachentanzTechnique({
    formId,
    slug: `${pathSlug}-${spec.slug}`,
    slotBands: ['expert'],
    tier: spec.minimumLevel >= 17 ? 'Meisterattacke' : (spec.minimumLevel >= 13 ? 'Expertenattacke' : 'Pfadattacke'),
    weaponRuleSetId: '',
    uchelwyrCompatible: false,
    allowedClassIds: KNIGHT_PATH_CLASS_IDS,
    classWeaponProfiles: pathClassWeapons(spec.uchelwyrLance === true),
    weaponTypes: ['sword', 'axe', 'mace'],
    ...spec
  });
}
