import { createFamilyPerson, createMarriage, createMarriedAwayBranch, createParentages } from '../../data/family-record-builders.js';
import { createWorldPersonId } from '../../domain/family-schema.js';
import { LAGA_KNOWN_LINKS, LAGA_KNOWN_WARDS } from './laga-known-links.js';
import {
  LAGA_SKELETON_BASE_REVISION, LAGA_SKELETON_REVISION, LAGA_CURRENT_HEAD, LAGA_SKELETON_NOTE,
  LAGA_PLACEHOLDERS, LAGA_PLACEHOLDER_PARTNERS, LAGA_HEAD_NUMBERS, LAGA_AWAY_NUMBERS,
  LAGA_CORE_CHILDREN, LAGA_WARD_GUARDIANS, LAGA_DIRECT_GENERATIONS, LAGA_GAPS
} from './laga-skeleton-source.js';

const placeholderId = number => `laga${String(number).padStart(4, '0')}`;
const partnerId = number => `a${placeholderId(number)}`;
const marriageId = number => `marriage-laga-${String(number).padStart(4, '0')}`;
const childId = value => typeof value === 'number' ? placeholderId(value) : value;

function managed(entity) {
  const fields = Object.keys(entity).filter(key => !['id', 'extensions'].includes(key));
  const revised = entity.id === 'lagaid-1689-laga' ? ['sex', 'title']
    : entity.id === 'laga-skeleton-parentage-lagaid-1689-laga' ? ['parentIds', 'partnershipId']
      : entity.id.startsWith('laga-fosterage-') ? ['parentIds', 'certainty', 'notes']
        : Object.hasOwn(LAGA_WARD_GUARDIANS, entity.id) ? ['title'] : [];
  const pairLayout = Array.isArray(entity.participantIds);
  return { ...entity, extensions: {
    ...entity.extensions, registryManagedFields: fields,
    registryManagedSourceRevision: revised.length || pairLayout ? LAGA_SKELETON_REVISION : LAGA_SKELETON_BASE_REVISION,
    registryManagedFieldRevisions: Object.fromEntries(fields.map(key => [key,
      revised.includes(key) ? LAGA_SKELETON_REVISION : LAGA_SKELETON_BASE_REVISION])),
    ...(pairLayout ? { registryManagedExtensionFields: [...new Set([
      ...(entity.extensions?.registryManagedExtensionFields || []), 'chartAlignChildGroupBelowParentPair'
    ])] } : {})
  } };
}

function createPlaceholders() {
  const persons = LAGA_PLACEHOLDERS.map(([number, sex, birth, death]) => createFamilyPerson({
    id: placeholderId(number), name: `Laga${String(number).padStart(4, '0')}`,
    sex, birth, death, houseId: 'house-laga',
    title: number === 1 ? 'Gründervater des Clans' : LAGA_HEAD_NUMBERS.includes(number)
      ? 'Früherer Ard Tiarna von Uathneach' : LAGA_AWAY_NUMBERS.includes(number)
        ? 'Wegverheiratet · Zielhaus offen' : '',
    lineageRole: LAGA_HEAD_NUMBERS.includes(number) ? 'head' : 'branch',
    tags: ['Gerüstfigur', ...(LAGA_AWAY_NUMBERS.includes(number) ? ['Wegverheiratet'] : [])],
    notes: LAGA_SKELETON_NOTE, extensions: { lagaSkeletonPlaceholder: true, placeholderNumber: number }
  }));
  const partnerships = LAGA_PLACEHOLDER_PARTNERS.map(([number, birth, death]) => {
    const member = persons.find(person => person.id === placeholderId(number));
    const id = partnerId(number);
    persons.push(createFamilyPerson({
      id, name: `ALaga${String(number).padStart(4, '0')}`,
      sex: member.sex === 'male' ? 'female' : 'male', birth, death,
      houseId: '', worldPersonId: createWorldPersonId('haus-laga', id), familyRole: 'married',
      title: number === 1 ? 'Partnerin des Gründers · Herkunft offen' : 'Ehepartner · Herkunft offen',
      tags: ['Gerüstfigur'], notes: LAGA_SKELETON_NOTE,
      extensions: { lagaSkeletonPlaceholder: true, placeholderNumber: number }
    }));
    return createMarriage(marriageId(number), member.id, id, {
      status: member.status === 'dead' || death ? 'ended' : 'active',
      notes: LAGA_SKELETON_NOTE
    });
  });
  return { persons, partnerships };
}

function createKnownGraph() {
  const persons = [], partnerships = [], houses = [], cadetBranches = [];
  for (const link of LAGA_KNOWN_LINKS) {
    const provenance = { familyId: link.sourceFamilyId, personId: link.sourcePersonId };
    persons.push({ ...link.person, familyRole: 'core',
      title: link.person.id === LAGA_CURRENT_HEAD ? 'Ard Tiarna von Uathneach'
        : link.person.id === 'lagaid-1689-laga' ? 'Bruder des Ard Tiarna' : link.person.title,
      lineageRole: link.person.id === LAGA_CURRENT_HEAD ? 'head' : 'branch',
      tags: [...link.person.tags, ...(!link.stays ? ['Wegverheiratet'] : [])],
      extensions: { ...link.person.extensions, lagaKnownSource: provenance }
    }, { ...link.partner, familyRole: 'married', lineageRole: 'branch' });
    partnerships.push(structuredClone(link.pair));
    houses.push(structuredClone(link.partnerHouse));
    if (!link.stays) cadetBranches.push(createMarriedAwayBranch({
      id: `laga-away-${link.person.id}`, name: link.partnerHouse.name,
      parentPartnershipId: link.pair.id, houseId: link.partner.houseId,
      targetFamilyId: link.targetFamilyId, emblem: link.partnerHouse.emblem,
      notes: `Belegte Ehe aus ${link.sourceFamilyId}; die dort vorhandenen Nachkommen bleiben in ihrer Familienakte.`,
      extensions: { chartAlignBelowPartnership: true }
    }));
  }
  for (const ward of LAGA_KNOWN_WARDS) {
    persons.push({ ...ward.person, familyRole: 'ward',
      title: `Mündel von ${LAGA_WARD_GUARDIANS[ward.person.id].replace(/^laga/, 'Laga')}`,
      extensions: { ...ward.person.extensions, lagaKnownSource: { familyId: ward.sourceFamilyId, personId: ward.person.id } }
    });
    houses.push(structuredClone(ward.house));
  }
  return { persons, partnerships, houses, cadetBranches };
}

function createAncestry(partnerships) {
  const parentages = [], timeJumps = [];
  for (const generation of LAGA_DIRECT_GENERATIONS) {
    const pair = partnerships.find(entry => entry.id === marriageId(generation.parent));
    parentages.push(...createParentages(generation.children.map(childId), pair.participantIds, pair.id, {
      idPrefix: 'laga-skeleton-parentage', certainty: 'probable', notes: LAGA_SKELETON_NOTE
    }));
  }
  for (const gap of LAGA_GAPS) {
    const pair = partnerships.find(entry => entry.id === marriageId(gap.parent));
    const id = `gap-laga-${String(gap.parent).padStart(4, '0')}`;
    const childIds = gap.children.map(childId);
    timeJumps.push({ id, parentPartnershipId: pair.id, parentPersonId: '', childIds,
      years: 0, fromYear: '????', toYear: gap.toYear,
      label: 'Nicht einzeln überlieferte Generationen', notes: LAGA_SKELETON_NOTE, extensions: {}
    });
    parentages.push(...createParentages(childIds, pair.participantIds, pair.id, {
      idPrefix: 'laga-skeleton-parentage', type: 'claimed', certainty: 'probable',
      notes: 'Vorläufige Anbindung über unbekannte Zwischengenerationen; keine direkte Elternschaft.',
      extensions: { timeJumpId: id }
    }));
  }
  const corePair = partnerships.find(pair => pair.participantIds.includes(LAGA_CURRENT_HEAD));
  parentages.push(...createParentages(LAGA_CORE_CHILDREN.map(child => child.id), corePair.participantIds, corePair.id, {
    idPrefix: 'laga-core-parentage', notes: 'Kinder Lugaids nach Nutzervorgabe; Blathnath ist seine bereits belegte Ehefrau. Die Lebensdaten sind vorläufig angesetzt.'
  }));
  for (const ward of LAGA_KNOWN_WARDS) {
    const guardianId = LAGA_WARD_GUARDIANS[ward.person.id];
    if (!guardianId) throw new Error(`Fehlender Lága-Vormund: ${ward.person.id}.`);
    parentages.push(...createParentages([ward.person.id], [guardianId], '', {
      idPrefix: 'laga-fosterage', type: 'foster', legitimacy: 'unknown',
      notes: 'Pflegschaft bei den Lága ist belegt. Verteilung auf verschiedene männliche Vormünder ab 40 Jahren nach Nutzervorgabe; keine leibliche Abstammung.'
    }));
  }
  return { parentages, timeJumps };
}

function configurePartnershipLayout(partnerships, parentages) {
  return partnerships.map(pair => {
    const direct = parentages.filter(link => link.partnershipId === pair.id && !link.extensions?.timeJumpId);
    const allChildrenAreLeaves = direct.every(link => !parentages.some(other => other.parentIds.includes(link.childId)));
    return { ...pair, extensions: { ...pair.extensions,
      ...(direct.length === 1 ? { chartAlignParentPairOverChildPersonId: direct[0].childId } : {}),
      chartAlignChildGroupBelowParentPair: direct.length > 1 && allChildrenAreLeaves
    } };
  });
}

function distinctHouses(houses) {
  return [...new Map(houses.map(house => [house.id, house])).values()];
}

export function withLagaFamilySkeleton(base) {
  if (base.document.id !== 'haus-laga') return base;
  const placeholders = createPlaceholders(), known = createKnownGraph();
  const persons = [...placeholders.persons, ...known.persons, ...LAGA_CORE_CHILDREN.map(child => createFamilyPerson({
    ...child, houseId: 'house-laga', lineageRole: 'mainline', tags: ['Fürstenfamilie'],
    title: 'Kind des gegenwärtigen Ard Tiarna',
    notes: 'Name und Elternhaus nach Nutzervorgabe. Vorläufiges Geburtsjahr für ein Alter zwischen 27 und 18 im Weltjahr 1740.',
    extensions: { lagaProvisionalBirth: true }
  }))];
  const partnerships = [...placeholders.partnerships, ...known.partnerships];
  const ancestry = createAncestry(partnerships);
  return { ...base,
    document: { ...base.document, description: 'Vorläufiges Familiengerüst der Mac Ard’Lága, Fürsten von Uathneach mit Sitz in Dunnean. Bekannte Angehörige und Ehen sind aus den verknüpften Stammbäumen übernommen; zusätzliche Personen tragen ausschließlich nummerierte Platzhalternamen.' },
    persons: persons.map(managed),
    houses: distinctHouses([...base.houses, ...known.houses]).map(managed),
    partnerships: configurePartnershipLayout(partnerships, ancestry.parentages).map(managed),
    parentages: ancestry.parentages.map(managed), timeJumps: ancestry.timeJumps.map(managed),
    // Noch unbekannte Zielhäuser bleiben als Titel/Tag am verheirateten Paar.
    // Keine anklickbaren Hausknoten auf erfundene oder leere Familien-IDs anlegen.
    cadetBranches: known.cadetBranches.map(managed),
    lineage: { ...base.lineage, founderPartnershipId: marriageId(1),
      crestSubtitle: 'Ard Tiarnatum Uathneach · Dunnean · Tir na Dála', crestFrame: 'gold'
    },
    view: { ...base.view, focusPersonId: LAGA_CURRENT_HEAD, ancestorDepth: 30, descendantDepth: 20,
      limitGenerations: false, showSiblings: true },
    extensions: { ...base.extensions, blankFamily: false, sourceRevision: LAGA_SKELETON_REVISION,
      chartLayoutPolicy: 'strict-v1', lagaSkeleton: true, currentHeadPersonId: LAGA_CURRENT_HEAD,
      sourceNote: LAGA_SKELETON_NOTE,
      registryManagedDocumentFields: ['description'],
      registryManagedLineageFields: ['founderPartnershipId', 'crestSubtitle'],
      registryManagedViewFields: ['focusPersonId', 'limitGenerations'],
      registryManagedExtensionFields: ['blankFamily', 'sourceNote', 'lagaSkeleton', 'currentHeadPersonId', 'chartLayoutPolicy']
    }
  };
}
