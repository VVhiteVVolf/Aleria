import { PARTNERSHIP_LABELS } from '../../config/family-colors.js';
import { createFamilyGraph } from '../../domain/family-graph.js';

const SECTION_DEFINITIONS = Object.freeze([
  Object.freeze({ id: 'ancestors', title: 'Vorfahren', eyebrow: 'Woher die Linie stammt' }),
  Object.freeze({ id: 'collateral', title: 'Seitenlinien', eyebrow: 'Geschwister, Tanten, Onkel und Vettern' }),
  Object.freeze({ id: 'bonds', title: 'Verbindungen', eyebrow: 'Partner, Schwieger- und Stieffamilie' }),
  Object.freeze({ id: 'descendants', title: 'Nachkommen', eyebrow: 'Kinder und weitere direkte Linie' })
]);

const KINSHIP_PARENTAGE_TYPES = Object.freeze(['biological', 'adoptive', 'magical', 'claimed']);
const KINSHIP_OPTIONS = Object.freeze({ types: KINSHIP_PARENTAGE_TYPES });
const GUARDIANSHIP_OPTIONS = Object.freeze({ types: Object.freeze(['foster']) });
const STEP_OPTIONS = Object.freeze({ types: Object.freeze(['step']) });

function gendered(person, male, female, unknown) {
  if (person?.sex === 'male') return male;
  if (person?.sex === 'female') return female;
  return unknown;
}

function parentLabel(person) {
  return gendered(person, 'Vater', 'Mutter', 'Elternteil');
}

function grandparentLabel(person) {
  return gendered(person, 'Großvater', 'Großmutter', 'Großelternteil');
}

function guardianLabel(person) {
  return gendered(person, 'Vormund', 'Vormundin', 'Vormund');
}

function siblingLabel(person, kind = 'full') {
  if (kind === 'half') return gendered(person, 'Halbbruder', 'Halbschwester', 'Halbgeschwister');
  return gendered(person, 'Bruder', 'Schwester', 'Geschwister');
}

function partnerLabel(person, type) {
  if (type === 'marriage') return gendered(person, 'Ehemann', 'Ehefrau', 'Ehepartner');
  if (type === 'engagement') return gendered(person, 'Verlobter', 'Verlobte', 'Verlobung');
  if (type === 'concubinage') return gendered(person, 'Konkubine', 'Konkubine', 'Konkubinatspartner');
  if (type === 'union') return gendered(person, 'Partner', 'Partnerin', 'Verbindung');
  return PARTNERSHIP_LABELS[type] || 'Verbindung';
}

function relationEntry(person, label, kind, priority) {
  return { person, labels: new Set([label]), kinds: new Set([kind]), priority };
}

function finalizeEntry(entry) {
  return Object.freeze({
    person: entry.person,
    labels: Object.freeze([...entry.labels]),
    kinds: Object.freeze([...entry.kinds]),
    priority: entry.priority
  });
}

function partnershipBetween(graph, firstId, secondId) {
  return graph.getPartnerships(firstId).find(partnership => partnership.participantIds.includes(secondId)) || null;
}

export function buildRelationshipMatrix(input, focusPersonId) {
  const graph = createFamilyGraph(input);
  const focusPerson = graph.getPerson(focusPersonId);
  if (!focusPerson) throw new Error('Die gewählte Person wurde im Stammbaum nicht gefunden.');

  const sections = new Map(SECTION_DEFINITIONS.map(section => [section.id, new Map()]));
  const entriesByPerson = new Map();

  function add(sectionId, person, label, kind, priority) {
    if (!person || person.id === focusPersonId) return;
    const existing = entriesByPerson.get(person.id);
    if (existing) {
      existing.entry.labels.add(label);
      existing.entry.kinds.add(kind);
      existing.entry.priority = Math.min(existing.entry.priority, priority);
      return;
    }
    const entry = relationEntry(person, label, kind, priority);
    sections.get(sectionId).set(person.id, entry);
    entriesByPerson.set(person.id, { sectionId, entry });
  }

  const parents = graph.getParents(focusPersonId, KINSHIP_OPTIONS);
  const siblings = graph.getSiblings(focusPersonId, KINSHIP_OPTIONS);
  const partners = graph.getPartners(focusPersonId);
  const children = graph.getChildren(focusPersonId, KINSHIP_OPTIONS);
  const guardians = graph.getParents(focusPersonId, GUARDIANSHIP_OPTIONS);
  const wards = graph.getChildren(focusPersonId, GUARDIANSHIP_OPTIONS);
  const explicitStepParents = graph.getParents(focusPersonId, STEP_OPTIONS);
  const explicitStepChildren = graph.getChildren(focusPersonId, STEP_OPTIONS);

  guardians.forEach(guardian => {
    add('bonds', guardian, guardianLabel(guardian), 'guardian', 15);
  });
  wards.forEach(ward => {
    add('bonds', ward, 'Mündel', 'ward', 16);
  });
  explicitStepParents.forEach(stepParent => {
    add('bonds', stepParent, gendered(stepParent, 'Stiefvater', 'Stiefmutter', 'Stiefelternteil'), 'step-parent', 45);
  });
  explicitStepChildren.forEach(stepChild => {
    add('bonds', stepChild, gendered(stepChild, 'Stiefsohn', 'Stieftochter', 'Stiefkind'), 'step-child', 50);
  });

  parents.forEach(parent => {
    add('ancestors', parent, parentLabel(parent), 'parent', 10);
    graph.getParents(parent.id, KINSHIP_OPTIONS).forEach(grandparent => {
      add('ancestors', grandparent, grandparentLabel(grandparent), 'grandparent', 20);
    });

    graph.getSiblings(parent.id, KINSHIP_OPTIONS).forEach(({ person: relative }) => {
      add('collateral', relative, gendered(relative, 'Onkel', 'Tante', 'Elterngeschwister'), 'aunt-uncle', 40);
      graph.getChildren(relative.id, KINSHIP_OPTIONS).forEach(cousin => {
        add('collateral', cousin, gendered(cousin, 'Cousin', 'Cousine', 'Cousin/Cousine'), 'cousin', 50);
      });
    });

    graph.getPartners(parent.id)
      .filter(partner => !parents.some(item => item.id === partner.id))
      .forEach(stepParent => {
        add('bonds', stepParent, gendered(stepParent, 'Stiefvater', 'Stiefmutter', 'Stiefelternteil'), 'step-parent', 45);
      });
  });

  siblings.forEach(({ person: sibling, kind }) => {
    add('collateral', sibling, siblingLabel(sibling, kind), 'sibling', 10);
    graph.getPartners(sibling.id).forEach(inLaw => {
      add('bonds', inLaw, gendered(inLaw, 'Schwager', 'Schwägerin', 'Angeheiratete Geschwisterperson'), 'sibling-in-law', 40);
    });
    graph.getChildren(sibling.id, KINSHIP_OPTIONS).forEach(relative => {
      add('collateral', relative, gendered(relative, 'Neffe', 'Nichte', 'Geschwisterkind'), 'niece-nephew', 30);
    });
  });

  partners.forEach(partner => {
    const partnership = partnershipBetween(graph, focusPersonId, partner.id);
    add('bonds', partner, partnerLabel(partner, partnership?.type), 'partner', 10);
    graph.getParents(partner.id, KINSHIP_OPTIONS).forEach(inLaw => {
      add('bonds', inLaw, gendered(inLaw, 'Schwiegervater', 'Schwiegermutter', 'Schwiegerelternteil'), 'parent-in-law', 20);
    });
    graph.getSiblings(partner.id, KINSHIP_OPTIONS).forEach(({ person: inLaw }) => {
      add('bonds', inLaw, gendered(inLaw, 'Schwager', 'Schwägerin', 'Schwiegergeschwister'), 'sibling-in-law', 30);
    });
    graph.getChildren(partner.id, KINSHIP_OPTIONS)
      .filter(stepChild => !children.some(item => item.id === stepChild.id))
      .forEach(stepChild => {
        add('bonds', stepChild, gendered(stepChild, 'Stiefsohn', 'Stieftochter', 'Stiefkind'), 'step-child', 50);
      });
  });

  children.forEach(child => {
    add('descendants', child, gendered(child, 'Sohn', 'Tochter', 'Kind'), 'child', 10);
    graph.getPartners(child.id).forEach(inLaw => {
      add('descendants', inLaw, gendered(inLaw, 'Schwiegersohn', 'Schwiegertochter', 'Schwiegerkind'), 'child-in-law', 20);
    });
    graph.getChildren(child.id, KINSHIP_OPTIONS).forEach(grandchild => {
      add('descendants', grandchild, gendered(grandchild, 'Enkel', 'Enkelin', 'Enkelkind'), 'grandchild', 30);
    });
  });

  const finalizedSections = SECTION_DEFINITIONS.map(definition => {
    const entries = [...sections.get(definition.id).values()]
      .sort((first, second) => first.priority - second.priority
        || first.person.name.localeCompare(second.person.name, 'de'))
      .map(finalizeEntry);
    return Object.freeze({ ...definition, entries: Object.freeze(entries) });
  });

  return Object.freeze({
    family: graph.family,
    focusPerson,
    sections: Object.freeze(finalizedSections),
    relationshipCount: entriesByPerson.size
  });
}
