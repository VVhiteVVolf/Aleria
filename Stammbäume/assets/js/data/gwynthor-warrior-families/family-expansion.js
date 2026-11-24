import { createFamilyPerson, createMarriage, createMarriedAwayBranch, createParentages } from '../family-record-builders.js';
import { sourceManagedFields } from '../source-family-field-upgrade.js';
import { BRANDYDDYN_SONS } from './brandyddyn.js';

export const WARRIOR_FAMILY_REVISION = 4;
const AUTHORED_ON = '2026-11-24';
const MARRIAGE_ID = 'marriage-pellinard-brandyddyn-ysabel-bronnor';
const childId = 'eurgain-brandyddyn';
const branchId = (key, slug) => `${key.toLowerCase()}-${slug}`;
const newSource = 'Nutzerauftrag vom 24. November 2026. Neu entworfene Namen, Linien und Jahreszahlen bilden die redaktionelle Familienquelle.';

function changeSourceFields(entity, fields) {
  const previousValues = Object.fromEntries(Object.keys(fields).map(field => [field, [entity[field]]]));
  return {
    ...entity, ...fields,
    extensions: sourceManagedFields({
      ...entity.extensions,
      registryManagedFieldPreviousValues: { ...entity.extensions.registryManagedFieldPreviousValues, ...previousValues }
    }, Object.keys(fields), WARRIOR_FAMILY_REVISION)
  };
}

function changeSourceExtensions(entity, fields, removals = []) {
  const controlled = [...Object.keys(fields), ...removals];
  const extensions = {
    ...entity.extensions, ...fields,
    registryManagedExtensionFields: [...new Set([...(entity.extensions.registryManagedExtensionFields || []), ...controlled])],
    registryManagedExtensionFieldRevisions: {
      ...entity.extensions.registryManagedExtensionFieldRevisions,
      ...Object.fromEntries(controlled.map(field => [field, WARRIOR_FAMILY_REVISION]))
    }
  };
  removals.forEach(field => delete extensions[field]);
  return { ...entity, extensions };
}

function createMember(slug, surname, member) {
  const id = branchId(member.name, slug);
  const appearance = slug === 'brandyddyn'
    ? { eyeColor: 'grün', hairColor: member.hairColor || 'braun', clothing: member.clothing || 'Zivilkleidung' }
    : undefined;
  return createFamilyPerson({
    id, name: `${member.name} ${surname}`, houseId: `house-${slug}`, sex: member.sex,
    birth: String(member.birth), death: member.death ? String(member.death) : '',
    lineageRole: member.lineageRole, title: member.title, notes: member.notes,
    portrait: member.portrait ? `assets/images/portraits/haus-${slug}/${id}-v${Number(member.portrait)}.png` : '',
    extensions: { authoredSource: 'gwynthor-warrior-families-20261124', ...(appearance ? { appearance } : {}) }
  });
}

// Store the same world-person and parentage IDs in both house views.
export function extendBrandyddynHousehold(base, { incomingYsabel = false } = {}) {
  const sons = BRANDYDDYN_SONS.map(member => createMember('brandyddyn', 'Brândyddyn', member));
  const originalParentage = base.parentages.find(link => link.childId === childId);
  const persons = base.persons.map(person => {
    if (person.id === childId) {
      const revised = changeSourceFields(person, {
        birth: '1715',
        notes: 'Ältestes Kind von Pellinard Brândyddyn und Ysabel Bronnor. Ihre jüngeren Brüder sind Aelwryd und Gwrgant.'
      });
      return changeSourceExtensions(revised, { sourceNote: 'Alter von 25 Jahren gemäß Nutzerauftrag vom 24. November 2026.' }, ['ageEstimate']);
    }
    if (person.id === 'pellinard-brandyddyn') {
      return changeSourceFields(person, incomingYsabel
        ? { title: 'Erbe', lineageRole: 'mainline' }
        : { title: 'Erbe des Hauses Brândyddyn' });
    }
    if (person.id === 'ysabel-bronnor' && incomingYsabel) return changeSourceFields(person, { familyRole: 'married' });
    return person;
  });
  const partnerships = base.partnerships.map(pair => pair.id !== MARRIAGE_ID ? pair : changeSourceExtensions(pair, {
    chartAlignParentPairOverChildPersonId: '',
    chartAutomaticSingleChildAlignment: false,
    chartAlignChildGroupBelowParentPair: true
  }));
  return {
    ...base,
    persons: [...persons, ...sons],
    partnerships,
    parentages: [...base.parentages, ...createParentages(sons.map(son => son.id), originalParentage.parentIds, MARRIAGE_ID, {
      legitimacy: originalParentage.legitimacy,
      notes: 'Sohn von Pellinard Brândyddyn und Ysabel Bronnor.'
    })],
    extensions: { ...base.extensions, sourceRevision: WARRIOR_FAMILY_REVISION, authoredOn: AUTHORED_ON,
      sourceNote: `${newSource} Die bestehende Ehe und Elternschaft aus der Nutzerbiografie vom 21. November 2026 wurden um die zwei jüngeren Söhne ergänzt.` }
  };
}

function makeHousehold(slug, entry, parent, children, continuing) {
  const partner = createFamilyPerson({
    id: `partner-${parent.id}`, worldPersonId: `person--haus-${slug}--partner-${parent.id}`,
    name: entry.marriedAway ? 'Unbekannter Partner' : 'Unbekannte Partnerin',
    sex: entry.marriedAway ? 'male' : 'female',
    houseId: '', familyRole: 'married', extensions: { portraitIntentionallyAbsent: true }
  });
  const marriage = createMarriage(`marriage-${parent.id}`, parent.id, partner.id, {
    start: entry.start ? String(entry.start) : '',
    end: parent.death, status: parent.death ? 'ended' : 'active',
    extensions: {
      minimumAgeAtMarriage: 25,
      ...(children.length === 1 ? { chartAlignParentPairOverChildPersonId: children[0] } : {}),
      ...(children.length > 1 && children.every(id => !continuing.has(id))
        ? { chartAlignChildGroupBelowParentPair: true } : {})
    }
  });
  const parentages = createParentages(children, marriage.participantIds, marriage.id);
  const branch = entry.marriedAway ? createMarriedAwayBranch({
    id: `wegverheiratet-${parent.id}`, name: 'Unbekanntes Haus', subtitle: 'Wegverheiratet',
    parentPartnershipId: marriage.id, targetFamilyId: 'haus-unbekannt', crestFrame: 'iron',
    extensions: { chartAlignBelowPartnership: true }
  }) : null;
  return { partner, marriage, parentages, branch };
}

export function expandWarriorFamily(base, { slug, name }, line) {
  const outgoing = new Set(line.households.filter(entry => entry.marriedAway).map(entry => branchId(entry.parent, slug)));
  const knownById = new Map(Object.entries(line.known || {}).map(([key, fields]) => [branchId(key, slug), fields]));
  const persons = [...base.persons, ...line.members.map(member => createMember(slug, name, member))].map(person => {
    const fields = knownById.get(person.id);
    const status = outgoing.has(person.id) ? [...new Set([...person.tags, 'Wegverheiratet'])] : null;
    return fields || status ? changeSourceFields(person, { ...fields, ...(status ? { tags: status } : {}) }) : person;
  });
  const people = new Map(persons.map(person => [person.id, person]));
  const findPerson = key => {
    const id = branchId(key, slug);
    if (!people.has(id)) throw new Error(`${slug}: fehlende Stammbaumperson ${id}`);
    return people.get(id);
  };
  const ancestor = findPerson(line.ancestor);
  const continuing = new Set([
    ...base.partnerships.flatMap(pair => pair.participantIds),
    ...line.households.map(entry => findPerson(entry.parent).id)
  ]);
  const households = line.households.map(entry => makeHousehold(slug, entry, findPerson(entry.parent),
    (entry.children || []).map(key => findPerson(key).id), continuing));
  const timeJump = changeSourceFields(base.timeJumps[0], {
    childIds: [ancestor.id], toYear: ancestor.birth,
    label: `Nicht einzeln überlieferte Generationen bis ${ancestor.name.split(' ')[0]}`
  });
  return Object.freeze({
    ...base,
    document: { ...base.document, description: `Haus ${name} ist eine Kriegerfamilie aus Gwynthor-Stadt. ${line.summary}` },
    persons: [...persons, ...households.map(row => row.partner)],
    partnerships: [...base.partnerships, ...households.map(row => row.marriage)],
    parentages: [...base.parentages, ...households.flatMap(row => row.parentages)],
    cadetBranches: [...base.cadetBranches, ...households.flatMap(row => row.branch ? [row.branch] : [])],
    timeJumps: [timeJump],
    view: { ...base.view, focusPersonId: ancestor.id },
    extensions: {
      ...base.extensions,
      sourceRevision: WARRIOR_FAMILY_REVISION, authoredOn: AUTHORED_ON,
      registryManagedViewFields: ['focusPersonId'],
      registryManagedViewFieldRevisions: { focusPersonId: WARRIOR_FAMILY_REVISION },
      registryManagedExtensionFields: ['chartAlignLineageOriginOverPersonId', 'authoredOn', 'sourceNote'],
      registryManagedExtensionFieldRevisions: {
        chartAlignLineageOriginOverPersonId: WARRIOR_FAMILY_REVISION, authoredOn: WARRIOR_FAMILY_REVISION, sourceNote: WARRIOR_FAMILY_REVISION
      },
      chartAlignLineageOriginOverPersonId: ancestor.id,
      sourceNote: `${newSource} Vor dem ersten namentlich überlieferten Ahnen bleiben Gründerpaar und Generationenlücke offen. Besitz, Lehen und Gewerbe sind offen.`
    }
  });
}
