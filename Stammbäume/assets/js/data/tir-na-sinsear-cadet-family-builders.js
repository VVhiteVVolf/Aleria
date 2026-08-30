import {
  createFamilyPerson,
  createMarriedAwayBranch
} from './family-record-builders.js';

export const TIR_NA_SINSEAR_SOURCE_MANAGED_PERSON_FIELDS = Object.freeze([
  'worldPersonId',
  'name',
  'title',
  'sex',
  'status',
  'birth',
  'death',
  'portrait',
  'portraitPlaceholder',
  'houseId',
  'familyRole',
  'lineageRole',
  'tags',
  'notes'
]);

export function createTirNaSinsearCadetRecordFactory({
  houseId,
  portraits = {},
  headTitles = {}
}) {
  function person(id, name, sex, birth = '????', death = '', options = {}) {
    const personHouseId = options.houseId === undefined ? houseId : options.houseId;
    return createFamilyPerson({
      id,
      worldPersonId: options.worldPersonId || '',
      name,
      sex,
      birth,
      death,
      status: options.status || '',
      houseId: personHouseId,
      portrait: portraits[id] || '',
      portraitPlaceholder: 'auto',
      familyRole: options.familyRole || (personHouseId === houseId ? 'core' : 'married'),
      lineageRole: options.lineageRole || (headTitles[id] ? 'head' : 'branch'),
      title: options.title || headTitles[id] || '',
      tags: options.tags || [],
      notes: options.notes || '',
      extensions: {
        ...(options.extensions || {}),
        registryManagedFields: TIR_NA_SINSEAR_SOURCE_MANAGED_PERSON_FIELDS
      }
    });
  }

  function spouse(id, name, sex, birth = '????', death = '', personHouseId = '', options = {}) {
    return person(id, name, sex, birth, death, {
      ...options,
      houseId: personHouseId,
      familyRole: options.familyRole || 'married',
      lineageRole: 'branch'
    });
  }

  function awayWoman(id, name, birth, death, target, options = {}) {
    return person(id, name, 'female', birth, death, {
      ...options,
      title: options.title || `Wegverheiratet an ${target.name}`,
      tags: [...new Set([...(options.tags || []), 'Wegverheiratet'])]
    });
  }

  return Object.freeze({ person, spouse, awayWoman });
}

export function createTirNaSinsearHouse(id, name, emblem = '') {
  return {
    id,
    name,
    motto: '',
    emblem,
    status: 'active',
    extensions: { registryManagedFields: ['name', 'emblem', 'status'] }
  };
}

export function createTirNaSinsearMarriedAwayBranch(id, partnershipId, target) {
  return createMarriedAwayBranch({
    id,
    name: target.name,
    parentPartnershipId: partnershipId,
    houseId: target.houseId,
    targetFamilyId: target.targetFamilyId,
    emblem: target.emblem || '',
    subtitle: `Wegverheiratet an ${target.name}`,
    extensions: {
      chartAlignBelowPartnership: true,
      registryManagedFields: [
        'name', 'parentPartnershipId', 'houseId', 'targetFamilyId', 'emblem', 'subtitle'
      ],
      registryManagedExtensionFields: ['chartAlignBelowPartnership']
    }
  });
}

export function createTirNaSinsearTimeJump({
  id,
  parentPartnershipId,
  childIds,
  fromYear = '',
  toYear = '',
  label = 'Nicht einzeln überlieferte Generationen'
}) {
  return {
    id,
    parentPartnershipId,
    parentPersonId: '',
    childIds: [...childIds],
    label,
    fromYear,
    toYear,
    estimatedYears: Number(fromYear) && Number(toYear)
      ? Math.max(0, Number(toYear) - Number(fromYear))
      : 0,
    certainty: 'probable',
    notes: 'Die Punktreihe der bereitgestellten Hierarchie markiert nicht einzeln überlieferte Generationen.',
    extensions: {}
  };
}
