import { createDrachentanzTechnique } from './drachentanz-technique-factory.js?v=20260905-damage-balance-v1';

export const KNIGHT_PATH_CLASS_IDS = Object.freeze(['teulu', 'cantref', 'uchelwyr', 'arthwyr']);

const BASE_CLASS_WEAPONS = Object.freeze({
  teulu: ['sword'],
  cantref: ['spear', 'lance', 'partisan', 'trident', 'halberd'],
  uchelwyr: ['sword'],
  arthwyr: ['greatsword', 'axe', 'battleaxe', 'club', 'mace']
});

export function pathClassWeapons(uchelwyrLance = false) {
  return {
    ...BASE_CLASS_WEAPONS,
    uchelwyr: uchelwyrLance ? ['sword', 'lance'] : ['sword']
  };
}

export function createExpertPathTechnique(formId, pathSlug, spec) {
  return createDrachentanzTechnique({
    formId,
    slug: `${pathSlug}-${spec.slug}`,
    slotBands: ['expert'],
    tier: spec.minimumLevel >= 17 ? 'Meisterattacke' : (spec.minimumLevel >= 13 ? 'Expertenattacke' : 'Pfadattacke'),
    weaponRuleSetId: 'cantref-polearm',
    uchelwyrCompatible: spec.uchelwyrLance === true,
    allowedClassIds: KNIGHT_PATH_CLASS_IDS,
    classWeaponProfiles: pathClassWeapons(spec.uchelwyrLance === true),
    weaponTypes: ['sword', 'spear', 'polearm', 'axe', 'mace'],
    ...spec
  });
}
