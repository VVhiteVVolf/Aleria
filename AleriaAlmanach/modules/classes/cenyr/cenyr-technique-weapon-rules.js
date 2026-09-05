import { getCenyrClassDefinitionForProfile } from './cenyr-class-registry.js?v=20260905-cenyr-character-training-v1';

const WEAPON_PROFILE_ALIASES = Object.freeze([
  ['halberd', /hellebarde/],
  ['partisan', /partisane/],
  ['trident', /dreizack/],
  ['lance', /lanze|reiterspie(?:ss|ß)/],
  ['rapier', /rapier|degen/],
  ['longbow', /langbogen/],
  ['shortbow', /kurzbogen/],
  ['dual-daggers', /dolch.*(?:paar|beidh)|(?:paar|beidh).*dolch/],
  ['dual-swords', /schwert.*(?:paar|beidh)|(?:paar|beidh).*schwert/],
  ['greatsword', /gro(?:ss|ß)schwert|zweih[aä]nder/],
  ['battleaxe', /streitaxt/],
  ['axe', /axt|beil/],
  ['club', /keule|streitkolben/]
]);

export function getCenyrWeaponProfileId(weapon = {}) {
  const explicit = String(weapon.weaponProfileId || '').trim().toLowerCase();
  if (explicit) return explicit;
  const description = `${weapon.name || ''} ${weapon.properties || ''}`.toLocaleLowerCase('de');
  return WEAPON_PROFILE_ALIASES.find(([, pattern]) => pattern.test(description))?.[0] || '';
}

function emptyRules(technique = {}) {
  return {
    attackBonus: 0,
    damageBonus: 0,
    targetDefenseModifier: Number(technique.targetDefenseModifier) || 0,
    criticalThreshold: Math.max(2, Math.min(20, Number(technique.criticalThreshold) || 20)),
    maximumTargets: Math.max(1, Math.min(20, Number(technique.maximumTargets) || 1)),
    mechanicNotes: Array.isArray(technique.mechanicNotes) ? technique.mechanicNotes.slice(0, 8) : [],
    compatible: true,
    disabledReason: ''
  };
}

function supportsCantrefPolearmRule(definition, technique, weaponProfileId = '') {
  if (technique.cenyrTraining?.weaponRuleSetId !== 'cantref-polearm') return false;
  if (definition.classId === 'cantref') return true;
  return definition.classId === 'uchelwyr'
    && technique.cenyrTraining?.uchelwyrCompatible === true
    && weaponProfileId === 'lance';
}

function validateClassAndWeapon(definition, technique, weaponProfileId, weapon = {}) {
  const training = technique.cenyrTraining || {};
  if (training.allowedClassIds?.length && !training.allowedClassIds.includes(definition.classId)) {
    return 'Diese Attacke gehört nicht zum Technikpool dieser Cenyr-Klasse.';
  }
  const allowedProfiles = training.classWeaponProfiles?.[definition.classId] || [];
  if (!allowedProfiles.length) return '';
  const actualProfile = weaponProfileId || String(weapon.weaponType || '');
  return allowedProfiles.includes(actualProfile)
    ? ''
    : `Benötigt eine für diese Klassenfolge zugelassene Waffe (${allowedProfiles.join(', ')}).`;
}

// These modifiers are attached to the resolved action. Canonical techniques and
// stored character attacks remain free of copied class/weapon bonuses.
export function resolveCenyrTechniqueWeaponRules(profile = {}, technique = {}, weapon = {}) {
  const rules = emptyRules(technique);
  const definition = getCenyrClassDefinitionForProfile(profile);
  if (!definition || technique.combatStyleId !== 'drachentanz') return rules;
  const weaponProfileId = getCenyrWeaponProfileId(weapon);

  const classWeaponError = validateClassAndWeapon(definition, technique, weaponProfileId, weapon);
  if (classWeaponError) {
    rules.compatible = false;
    rules.disabledReason = classWeaponError;
    return rules;
  }

  if (technique.cenyrTraining?.requiresMounted && profile.combat?.mounted !== true) {
    rules.compatible = false;
    rules.disabledReason = 'Diese Technik kann nur beritten eingesetzt werden.';
  }

  if (supportsCantrefPolearmRule(definition, technique, weaponProfileId)) {
    if (!['spear', 'polearm'].includes(String(weapon.weaponType || ''))) {
      rules.compatible = false;
      rules.disabledReason = 'Benötigt Lanze, Partisane, Dreizack, Hellebarde oder eine andere zugelassene Stangenwaffe.';
      return rules;
    }
    if (weaponProfileId === 'lance') {
      rules.targetDefenseModifier -= 1;
      rules.mechanicNotes.push('Lanze: Der Angriff behandelt die Verteidigung des Ziels als 1 Punkt niedriger.');
    }
    if (weaponProfileId === 'partisan') {
      rules.attackBonus = 1;
      rules.mechanicNotes.push('Partisane: +1 auf den Angriffswurf.');
    }
    if (weaponProfileId === 'trident') {
      rules.mechanicNotes.push('Dreizack: Bei einem Treffer darf der vorgesehene Entwaffnungsversuch ausgewertet werden.');
    }
    if (weaponProfileId === 'halberd') {
      rules.maximumTargets = 4;
      rules.mechanicNotes.push('Hellebarde: Bis zu vier Ziele; für jedes Ziel wird ein eigener Angriffswurf ausgeführt, die Kosten fallen einmal an.');
    }
  }

  if (definition.classId === 'barddwyr' && weaponProfileId === 'rapier') {
    rules.criticalThreshold = Math.min(rules.criticalThreshold, 19);
    rules.mechanicNotes.push('Rapiertechnik des Barddwyr: Ein natürlicher Wurf von 19 oder 20 ist kritisch.');
  }

  return rules;
}

export const cenyrTechniqueWeaponRuleInternals = Object.freeze({
  WEAPON_PROFILE_ALIASES, emptyRules, supportsCantrefPolearmRule, validateClassAndWeapon
});
