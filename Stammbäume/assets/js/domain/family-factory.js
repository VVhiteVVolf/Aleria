import { normalizeFamily } from './family-schema.js';
import { normalizeHouseProfile } from './house-profile.js';
import { PORTRAIT_PLACEHOLDERS } from '../config/portrait-placeholders.js';
import { DEFAULT_CREST_FRAME } from '../config/chart-frames.js';
import {
  applyHousePlacementToProfile,
  assertValidHousePlacement
} from '../modules/family-registry/house-placement-policy.js';

function familySlug(value) {
  return String(value || '')
    .trim()
    .toLocaleLowerCase('de')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'neue-familie';
}

function creationPlacement(values = {}) {
  const usesStructuredPlacement = values.unclassified !== undefined
    || values.folderPath !== undefined
    || values.folderIcons !== undefined;
  return usesStructuredPlacement
    ? assertValidHousePlacement(values)
    : null;
}

function creationHouseProfile(values = {}, placement = null) {
  const legacyProfile = normalizeHouseProfile({
    rankId: values.rankId,
    seat: String(values.seat || '').trim()
  });
  return placement ? applyHousePlacementToProfile(legacyProfile, placement) : legacyProfile;
}

function registryExtension(placement) {
  return placement
    ? {
        registry: {
          folderPath: [...placement.folderPath],
          unclassified: placement.unclassified
        }
      }
    : {};
}

function founderPerson({ id, name, title, sex, birth, death, houseId, familyRole }) {
  return {
    id,
    name,
    title,
    sex,
    status: death ? 'dead' : 'alive',
    birth,
    death,
    portrait: '',
    portraitPlaceholder: 'auto',
    houseId,
    familyRole,
    tags: ['Gründerfamilie'],
    notes: ''
  };
}

export function createEmptyFamily() {
  return normalizeFamily({
    document: {
      id: 'neue-familie',
      title: 'Neue Familie',
      motto: '',
      description: '',
      emblem: '',
      houseProfile: normalizeHouseProfile()
    },
    persons: [],
    partnerships: [],
    parentages: [],
    houses: [],
    cadetBranches: [],
    timeJumps: [],
    view: {
      focusPersonId: '',
      orientation: 'vertical',
      ancestorDepth: 8,
      descendantDepth: 8,
      showSiblings: true
    }
  });
}

// Phase 1 des Stammbaum-Generators: nur die Hausstammdaten, noch keine Personen.
// Weiche/erzählerische Felder ohne eigenes Schema-Feld (Kultur, Religion, Herrschaft,
// Gründungsjahr, Gründerhaus, Hausfarben, Besonderheiten) landen in
// extensions.generatorProfile statt neue Top-Level-Schema-Felder zu erfinden.
export function createFamilyProfileDraft(values = {}) {
  const documentTitle = String(values.documentTitle || 'Neue Familie').trim();
  const familyId = familySlug(values.documentId || documentTitle);
  const emblem = String(values.emblem || '').trim() || PORTRAIT_PLACEHOLDERS.crest;
  const placement = creationPlacement(values);
  return normalizeFamily({
    document: {
      id: familyId,
      title: documentTitle,
      motto: String(values.motto || '').trim(),
      description: String(values.description || '').trim(),
      emblem,
      houseProfile: creationHouseProfile(values, placement)
    },
    persons: [],
    partnerships: [],
    parentages: [],
    houses: [],
    cadetBranches: [],
    timeJumps: [],
    view: {
      focusPersonId: '',
      orientation: 'vertical',
      ancestorDepth: 8,
      descendantDepth: 8,
      showSiblings: true
    },
    extensions: {
      ...registryExtension(placement),
      generatorProfile: {
        origin: String(values.origin || '').trim(),
        culture: String(values.culture || '').trim(),
        religion: String(values.religion || '').trim(),
        governance: String(values.governance || '').trim(),
        foundingYear: String(values.foundingYear || '').trim(),
        founderHouseName: String(values.founderHouseName || '').trim(),
        houseColors: String(values.houseColors || '').trim(),
        specialTraits: String(values.specialTraits || '').trim()
      }
    }
  });
}

// Phase 2 des Stammbaum-Generators: Gründerpaar auf einer bestehenden Phase-1-Akte
// anlegen. Anders als createFoundingFamily wird die familyId NICHT neu aus values
// abgeleitet, sondern aus der bereits bestehenden family.document.id übernommen,
// damit Phase-1-Bearbeitungen (Titel/Motto/Wappen) erhalten bleiben.
export function commitFounderCouple(family, values = {}) {
  const familyId = family.document.id;
  const houseId = `house-${familyId}`;
  const founderManId = `${familyId}-gruender`;
  const founderWomanId = `${familyId}-gruenderin`;
  const partnershipId = `marriage-${familyId}-founders`;
  const documentTitle = family.document.title;
  const motto = family.document.motto;
  const emblem = family.document.emblem;
  const persons = [
    ...family.persons,
    founderPerson({
      id: founderManId,
      name: String(values.founderManName || 'Unbekannter Gründer').trim(),
      title: String(values.founderManTitle || 'Gründer des Hauses').trim(),
      sex: 'male',
      birth: String(values.founderManBirth || '').trim(),
      death: String(values.founderManDeath || '').trim(),
      houseId,
      familyRole: 'core'
    }),
    founderPerson({
      id: founderWomanId,
      name: String(values.founderWomanName || 'Unbekannte Gründerin').trim(),
      title: String(values.founderWomanTitle || 'Gründerin des Hauses').trim(),
      sex: 'female',
      birth: String(values.founderWomanBirth || '').trim(),
      death: String(values.founderWomanDeath || '').trim(),
      houseId,
      familyRole: 'married'
    })
  ];
  return normalizeFamily({
    ...family,
    houses: [
      ...family.houses,
      { id: houseId, name: documentTitle, motto, emblem, status: 'active' }
    ],
    persons,
    partnerships: [
      ...family.partnerships,
      {
        id: partnershipId,
        participantIds: [founderManId, founderWomanId],
        type: 'marriage',
        status: 'active',
        start: String(values.marriageYear || '').trim(),
        end: '',
        certainty: 'confirmed',
        visibility: 'public',
        notes: 'Gründerehe des Hauses.'
      }
    ],
    lineage: {
      ...family.lineage,
      founderPartnershipId: partnershipId,
      houseId
    },
    view: {
      ...family.view,
      focusPersonId: founderManId
    }
  });
}

export function createFoundingFamily(values = {}) {
  const documentTitle = String(values.documentTitle || 'Neue Familie').trim();
  const familyId = familySlug(values.documentId || documentTitle);
  const houseId = `house-${familyId}`;
  const founderManId = `${familyId}-gruender`;
  const founderWomanId = `${familyId}-gruenderin`;
  const partnershipId = `marriage-${familyId}-founders`;
  const emblem = String(values.emblem || '').trim() || PORTRAIT_PLACEHOLDERS.crest;
  const placement = creationPlacement(values);
  const persons = [
    founderPerson({
      id: founderManId,
      name: String(values.founderManName || 'Unbekannter Gründer').trim(),
      title: String(values.founderManTitle || 'Gründer des Hauses').trim(),
      sex: 'male',
      birth: String(values.founderManBirth || '').trim(),
      death: String(values.founderManDeath || '').trim(),
      houseId,
      familyRole: 'core'
    }),
    founderPerson({
      id: founderWomanId,
      name: String(values.founderWomanName || 'Unbekannte Gründerin').trim(),
      title: String(values.founderWomanTitle || 'Gründerin des Hauses').trim(),
      sex: 'female',
      birth: String(values.founderWomanBirth || '').trim(),
      death: String(values.founderWomanDeath || '').trim(),
      houseId,
      familyRole: 'married'
    })
  ];
  const parentages = [];
  const firstChildName = String(values.firstChildName || '').trim();
  if (firstChildName) {
    const firstChildId = `${familyId}-erstes-kind`;
    persons.push({
      id: firstChildId,
      name: firstChildName,
      title: String(values.firstChildTitle || '').trim(),
      sex: ['male', 'female'].includes(values.firstChildSex) ? values.firstChildSex : 'unknown',
      status: values.firstChildDeath ? 'dead' : 'alive',
      birth: String(values.firstChildBirth || '').trim(),
      death: String(values.firstChildDeath || '').trim(),
      portrait: '',
      portraitPlaceholder: 'auto',
      houseId,
      familyRole: 'core',
      tags: ['Erste Generation'],
      notes: ''
    });
    parentages.push({
      id: `parentage-${firstChildId}`,
      childId: firstChildId,
      parentIds: [founderManId, founderWomanId],
      partnershipId,
      type: 'biological',
      legitimacy: 'legitimate',
      certainty: 'confirmed',
      visibility: 'public',
      notes: ''
    });
  }

  return normalizeFamily({
    document: {
      id: familyId,
      title: documentTitle,
      motto: String(values.motto || '').trim(),
      description: 'In der Aleria-Stammbaum-Werkstatt angelegte Familienakte.',
      emblem,
      houseProfile: creationHouseProfile(values, placement)
    },
    houses: [{
      id: houseId,
      name: documentTitle,
      motto: String(values.motto || '').trim(),
      emblem,
      status: 'active'
    }],
    persons,
    partnerships: [{
      id: partnershipId,
      participantIds: [founderManId, founderWomanId],
      type: 'marriage',
      status: 'active',
      start: String(values.marriageYear || '').trim(),
      end: '',
      certainty: 'confirmed',
      visibility: 'public',
      notes: 'Gründerehe des Hauses.'
    }],
    parentages,
    lineage: {
      founderPartnershipId: partnershipId,
      houseId,
      crestSubtitle: String(values.crestSubtitle || '').trim(),
      crestEmblemScale: Number(values.crestEmblemScale || 0.86),
      crestFrame: String(values.crestFrame || DEFAULT_CREST_FRAME),
      crestFrameScale: Number(values.crestFrameScale || 1),
      timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' }
    },
    cadetBranches: [],
    timeJumps: [],
    view: {
      focusPersonId: founderManId,
      orientation: 'vertical',
      ancestorDepth: 8,
      descendantDepth: 8,
      showSiblings: true
    },
    extensions: registryExtension(placement)
  });
}
