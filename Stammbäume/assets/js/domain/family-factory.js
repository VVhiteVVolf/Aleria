import { normalizeFamily } from './family-schema.js';
import { PORTRAIT_PLACEHOLDERS } from '../config/portrait-placeholders.js';
import { DEFAULT_CREST_FRAME } from '../config/chart-frames.js';

function familySlug(value) {
  return String(value || '')
    .trim()
    .toLocaleLowerCase('de')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'neue-familie';
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
      emblem: ''
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

export function createFoundingFamily(values = {}) {
  const documentTitle = String(values.documentTitle || 'Neue Familie').trim();
  const familyId = familySlug(values.documentId || documentTitle);
  const houseId = `house-${familyId}`;
  const founderManId = `${familyId}-gruender`;
  const founderWomanId = `${familyId}-gruenderin`;
  const partnershipId = `marriage-${familyId}-founders`;
  const emblem = String(values.emblem || '').trim() || PORTRAIT_PLACEHOLDERS.crest;
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
      emblem
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
      crestFrame: String(values.crestFrame || DEFAULT_CREST_FRAME),
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
    }
  });
}
