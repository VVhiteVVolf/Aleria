import {
  DEFAULT_CHILDBEARING_AGE,
  DEFAULT_LIFESPAN_YEARS
} from '../../config/chronology.js';
import {
  AGING_KINDS,
  suggestBirthYear,
  suggestDeathYear,
  suggestName
} from '../../domain/tree-generator-suggestions.js';

export const GENERATION_PARAMETER_DEFINITIONS = Object.freeze([
  { id: 'minChildren', group: 'Nachkommen', label: 'Gewünschte Mindestzahl je Linie', kind: 'number', defaultValue: 1, min: 0, max: 20 },
  { id: 'maxChildren', group: 'Nachkommen', label: 'Höchstzahl je Linie', kind: 'number', defaultValue: 4, min: 1, max: 30 },
  { id: 'allowTwins', group: 'Nachkommen', label: 'Zwillinge anbieten', kind: 'checkbox', defaultValue: true },
  { id: 'allowAdoption', group: 'Nachkommen', label: 'Adoption anbieten', kind: 'checkbox', defaultValue: true },
  { id: 'allowBastards', group: 'Nachkommen', label: 'Uneheliche Kinder anbieten', kind: 'checkbox', defaultValue: true },
  { id: 'usePlaceholders', group: 'Nachkommen', label: 'Unbenannte Personen als ??? zulassen', kind: 'checkbox', defaultValue: true },
  { id: 'childbearingAge', group: 'Datumswerte', label: 'Richtwert: Alter bei Geburt', kind: 'number', defaultValue: DEFAULT_CHILDBEARING_AGE, min: 12, max: 120 },
  { id: 'lifespan', group: 'Datumswerte', label: 'Richtwert: Lebensdauer', kind: 'number', defaultValue: DEFAULT_LIFESPAN_YEARS, min: 1, max: 10000 },
  { id: 'autoGenerateNames', group: 'Automatische Vorschläge', label: 'Leere Namen automatisch vorschlagen', kind: 'checkbox', defaultValue: false },
  { id: 'autoCalculateBirth', group: 'Automatische Vorschläge', label: 'Leere Geburtsjahre aus dem Elternjahr ableiten', kind: 'checkbox', defaultValue: false },
  { id: 'autoCalculateDeath', group: 'Automatische Vorschläge', label: 'Leere Sterbejahre aus der Lebensdauer ableiten', kind: 'checkbox', defaultValue: false },
  { id: 'allowSpecialAging', group: 'Sonderalterung', label: 'Priester-, Magier- und Druidenalterung anbieten', kind: 'checkbox', defaultValue: true },
  { id: 'considerMageFertility', group: 'Sonderalterung', label: 'Hinweis zur geringen Magier-Fruchtbarkeit zeigen', kind: 'checkbox', defaultValue: true }
]);

export function defaultGenerationParams() {
  return Object.fromEntries(GENERATION_PARAMETER_DEFINITIONS.map(definition => [definition.id, definition.defaultValue]));
}

export function normalizeGenerationParams(values = {}) {
  const defaults = defaultGenerationParams();
  const normalized = {};
  GENERATION_PARAMETER_DEFINITIONS.forEach(definition => {
    if (definition.kind === 'checkbox') {
      normalized[definition.id] = values[definition.id] === undefined
        ? defaults[definition.id]
        : values[definition.id] === true;
      return;
    }
    const number = Number(values[definition.id]);
    const fallback = Number(defaults[definition.id]);
    normalized[definition.id] = Number.isFinite(number)
      ? Math.max(definition.min ?? 0, Math.min(definition.max ?? Number.MAX_SAFE_INTEGER, Math.round(number)))
      : fallback;
  });
  normalized.maxChildren = Math.max(normalized.minChildren, normalized.maxChildren);
  return Object.freeze(normalized);
}

export function childCountForPerson(family, personId) {
  return new Set(family.parentages
    .filter(parentage => parentage.parentIds.includes(personId))
    .map(parentage => parentage.childId)).size;
}

export function childCountForLine(family, line = {}) {
  if (line.partnershipId) {
    return new Set(family.parentages
      .filter(parentage => parentage.partnershipId === line.partnershipId)
      .map(parentage => parentage.childId)).size;
  }
  return childCountForPerson(family, line.personId || '');
}

export function assertLineChildCapacity(family, line, params) {
  const normalized = normalizeGenerationParams(params);
  const count = childCountForLine(family, line);
  if (count >= normalized.maxChildren) {
    throw new Error(`Für diese Linie ist die eingestellte Höchstzahl von ${normalized.maxChildren} Nachkommen erreicht.`);
  }
  return count;
}

export function prepareGeneratedChild({ family, referencePerson, input, params, previousChild = null }) {
  const policy = normalizeGenerationParams(params);
  const agingKind = policy.allowSpecialAging ? (input.agingKind || 'normal') : 'normal';
  let name = String(input.name || '').trim();
  if (!name && policy.autoGenerateNames) name = suggestName(input.sex, family.persons.map(person => person.name));
  let birth = String(input.birth || '').trim();
  const sameContinuationLine = input.lineId
    ? previousChild?.lineId === input.lineId
    : previousChild?.referencePersonId === referencePerson.id;
  if (input.twin && sameContinuationLine) birth = previousChild.birth || birth;
  if (!birth && policy.autoCalculateBirth && !input.suppressParentBasedBirth) {
    birth = suggestBirthYear({ anchorYear: referencePerson.birth || '', role: 'child', params: policy });
    if (birth === '???') birth = '';
  }
  if (!name && !policy.usePlaceholders) {
    throw new Error('Bitte einen Namen eintragen oder automatische Namen beziehungsweise Platzhalter aktivieren.');
  }
  let death = String(input.death || '').trim();
  if (!death && policy.autoCalculateDeath && birth) {
    death = suggestDeathYear({ birthYear: birth, params: policy, agingKind });
    if (death === '???') death = '';
  }
  const agingTags = agingKind !== 'normal'
    ? [AGING_KINDS[agingKind]?.label.split(' (')[0] || agingKind]
    : [];
  const twinTags = input.twin && previousChild && sameContinuationLine
    ? [`Zwilling von ${previousChild.name}`]
    : [];
  return Object.freeze({
    name: name || '???',
    title: '',
    sex: input.sex || 'unknown',
    status: death ? 'dead' : 'alive',
    birth,
    death,
    portrait: '',
    portraitPlaceholder: 'auto',
    houseId: referencePerson.houseId || '',
    familyRole: 'core',
    lineageRole: 'branch',
    tags: Object.freeze([...agingTags, ...twinTags]),
    notes: ''
  });
}
