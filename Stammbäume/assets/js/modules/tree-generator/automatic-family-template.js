import {
  ALERIA_CURRENT_YEAR,
  DEFAULT_CHILDBEARING_AGE,
  DEFAULT_LIFESPAN_YEARS,
  DEFAULT_MARRIAGE_AGE,
  PLAUSIBLE_PARENT_AGE_AT_BIRTH
} from '../../config/chronology.js';
import { assertValidFamily } from '../../domain/family-schema.js';
import { resolveFamilyGenerationDepths } from '../../domain/family-generation-depth.js';
import {
  AGING_KINDS,
  PLACEHOLDER_UNKNOWN,
  suggestDeathYear,
  suggestName
} from '../../domain/tree-generator-suggestions.js';
import { normalizeGenerationParams } from './generation-policy.js';
import { getFamilyTemplateDefinition } from './family-template-catalog.js';
import {
  createTemplateRandom,
  randomChance,
  randomInteger,
  randomItem,
  shuffled,
  templateSeedToken
} from './template-random.js';

export const AUTOMATIC_TEMPLATE_GENERATION_LIMITS = Object.freeze({
  minimumGenerations: 1,
  maximumGenerations: 10,
  maximumPersons: 240
});

const NORMAL_AGING_KINDS = Object.freeze(['priester', 'magier', 'druide']);

function text(value) {
  return String(value ?? '').trim();
}

function numericYear(value) {
  const normalized = text(value);
  return /^\d{1,4}$/.test(normalized) ? Number(normalized) : null;
}

function boundedInteger(value, fallback, minimum, maximum) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(minimum, Math.min(maximum, Math.round(parsed)));
}

export function normalizeAutomaticTemplateOptions(values = {}) {
  const limits = AUTOMATIC_TEMPLATE_GENERATION_LIMITS;
  const generationCount = boundedInteger(
    values.generationCount,
    4,
    limits.minimumGenerations,
    limits.maximumGenerations
  );
  const template = getFamilyTemplateDefinition(values.templateId);
  const timeJump = values.timeJump && typeof values.timeJump === 'object'
    ? values.timeJump
    : {};
  return Object.freeze({
    templateId: template.id,
    generationCount,
    seed: text(values.seed) || 'aleria-stammbaum-vorlage',
    params: normalizeGenerationParams({
      autoGenerateNames: true,
      autoCalculateBirth: true,
      autoCalculateDeath: true,
      ...(values.params || {})
    }),
    timeJump: Object.freeze({
      enabled: timeJump.enabled === true,
      fromYear: text(timeJump.fromYear),
      toYear: text(timeJump.toYear),
      years: boundedInteger(timeJump.years, 25, 0, 10000),
      label: text(timeJump.label) || 'Nicht einzeln überlieferte Generationen'
    })
  });
}

export function automaticTemplateOptionsSignature(values = {}) {
  return JSON.stringify(normalizeAutomaticTemplateOptions(values));
}

function assertFreshFounderFamily(family) {
  const founderPartnership = family.partnerships.find(item => item.id === family.lineage.founderPartnershipId);
  if (!founderPartnership || founderPartnership.participantIds.length < 2) {
    throw new Error('Die automatische Vorlage benötigt zuerst ein vollständiges Gründerpaar.');
  }
  const founderIds = new Set(founderPartnership.participantIds.slice(0, 2));
  const containsOnlyFounders = family.persons.length === founderIds.size
    && family.persons.every(person => founderIds.has(person.id));
  if (
    !containsOnlyFounders
    || family.partnerships.length !== 1
    || family.parentages.length
    || family.cadetBranches.length
    || family.timeJumps.length
    || family.lineage.timeGap.enabled
  ) {
    throw new Error('Automatische Vorlagen sind nur für eine neue, noch unverzweigte Gründerfamilie verfügbar.');
  }
  return founderPartnership;
}

function assertKnownYearsNotInFuture(family, currentYear) {
  const datedValues = [
    ...family.persons.flatMap(person => [person.birth, person.death]),
    ...family.partnerships.flatMap(partnership => [partnership.start, partnership.end])
  ];
  const futureYear = datedValues.map(numericYear).find(year => year !== null && year > currentYear);
  if (futureYear !== undefined) {
    throw new Error(`Das Jahr ${futureYear} liegt nach dem aktuellen Aleria-Jahr ${currentYear}.`);
  }
}

function deriveFounderYears(family, founderPartnership, options, currentYear, randomFn) {
  const founders = founderPartnership.participantIds.slice(0, 2)
    .map(personId => family.persons.find(person => person.id === personId));
  const knownBirths = founders.map(person => numericYear(person.birth)).filter(year => year !== null);
  const childbearingAge = Math.max(
    PLAUSIBLE_PARENT_AGE_AT_BIRTH.min,
    Math.min(PLAUSIBLE_PARENT_AGE_AT_BIRTH.max, Number(options.params.childbearingAge) || DEFAULT_CHILDBEARING_AGE)
  );
  const configuredFromYear = numericYear(options.timeJump.fromYear);
  const configuredToYear = numericYear(options.timeJump.toYear);
  let anchorYear = knownBirths.length ? Math.max(...knownBirths) : null;
  if (anchorYear === null) {
    if (options.timeJump.enabled && configuredFromYear !== null) {
      anchorYear = configuredFromYear - childbearingAge;
    } else if (options.timeJump.enabled && configuredToYear !== null) {
      anchorYear = configuredToYear - Math.max(1, options.timeJump.years) - childbearingAge;
    } else {
      anchorYear = currentYear
        - ((options.generationCount - 1) * childbearingAge)
        - Math.min(25, childbearingAge);
    }
  }
  anchorYear = Math.max(1, Math.min(currentYear, anchorYear));
  founders.forEach((person, index) => {
    if (numericYear(person.birth) === null) {
      const offset = index === 0 ? 0 : randomInteger(randomFn, -4, 0);
      person.birth = String(Math.max(1, anchorYear + offset));
    }
  });
  anchorYear = Math.max(...founders.map(person => numericYear(person.birth) || anchorYear));
  if (anchorYear > currentYear) {
    throw new Error(`Das Gründerpaar kann nicht nach dem aktuellen Aleria-Jahr ${currentYear} geboren sein.`);
  }
  if (!founderPartnership.start) {
    const marriageYear = anchorYear + DEFAULT_MARRIAGE_AGE;
    if (marriageYear > currentYear) {
      throw new Error('Das Gründerpaar ist für die gewählte Chronologie noch nicht im heiratsfähigen Alter.');
    }
    founderPartnership.start = String(marriageYear);
  }
  return { founders, anchorYear, childbearingAge };
}

function normalizeTimeJump(options, founderAnchorYear, childbearingAge, currentYear) {
  if (!options.timeJump.enabled) return null;
  let fromYear = numericYear(options.timeJump.fromYear);
  let toYear = numericYear(options.timeJump.toYear);
  let years = Math.max(1, Number(options.timeJump.years) || 25);
  if (fromYear !== null && toYear !== null) {
    if (toYear < fromYear) throw new Error('Beim Zeitsprung muss das Bis-Jahr nach dem Von-Jahr liegen.');
    years = toYear - fromYear;
  } else if (fromYear !== null) {
    toYear = fromYear + years;
  } else if (toYear !== null) {
    fromYear = toYear - years;
  } else {
    fromYear = founderAnchorYear + childbearingAge;
    toYear = fromYear + years;
  }
  if (fromYear < founderAnchorYear) {
    throw new Error('Der Zeitsprung darf nicht vor der Gründergeneration beginnen.');
  }
  if (toYear > currentYear) {
    throw new Error(`Der Zeitsprung endet nach dem aktuellen Aleria-Jahr ${currentYear}.`);
  }
  return Object.freeze({
    enabled: true,
    fromYear: String(fromYear),
    toYear: String(toYear),
    years,
    label: options.timeJump.label
  });
}

function planGenerationYears({
  founderAnchorYear,
  generationCount,
  childbearingAge,
  timeJump,
  currentYear,
  randomFn
}) {
  const years = [founderAnchorYear];
  if (timeJump) {
    const firstKnownYear = Number(timeJump.toYear);
    if (firstKnownYear < founderAnchorYear) {
      throw new Error('Die erste Generation nach dem Zeitsprung liegt vor dem Gründerpaar.');
    }
    years.push(firstKnownYear);
  }
  const preferredGap = Math.max(
    PLAUSIBLE_PARENT_AGE_AT_BIRTH.min,
    Math.min(PLAUSIBLE_PARENT_AGE_AT_BIRTH.max, childbearingAge)
  );
  while (years.length < generationCount) {
    const previousYear = years.at(-1);
    const generationsAfterNext = generationCount - years.length - 1;
    const latestAllowedNextYear = currentYear
      - (generationsAfterNext * PLAUSIBLE_PARENT_AGE_AT_BIRTH.min);
    const earliestNextYear = previousYear + PLAUSIBLE_PARENT_AGE_AT_BIRTH.min;
    if (earliestNextYear > latestAllowedNextYear) {
      throw new Error(`Die gewählten ${generationCount} Generationen passen mit plausiblen Altersabständen nicht bis ${currentYear}.`);
    }
    const jitteredPreferred = previousYear + preferredGap + randomInteger(randomFn, -2, 2);
    const nextYear = Math.max(
      earliestNextYear,
      Math.min(previousYear + PLAUSIBLE_PARENT_AGE_AT_BIRTH.max, latestAllowedNextYear, jitteredPreferred)
    );
    years.push(nextYear);
  }
  return Object.freeze(years);
}

function createIdFactory(family, seed) {
  const usedIds = new Set([
    ...family.persons.map(item => item.id),
    ...family.partnerships.map(item => item.id),
    ...family.parentages.map(item => item.id),
    ...family.timeJumps.map(item => item.id)
  ]);
  const counters = new Map();
  const token = templateSeedToken(seed);
  return function nextId(kind, generationIndex = 0) {
    const counterKey = `${kind}:${generationIndex}`;
    let counter = (counters.get(counterKey) || 0) + 1;
    let id = `template-${kind}-${token}-g${generationIndex}-${counter}`;
    while (usedIds.has(id)) {
      counter += 1;
      id = `template-${kind}-${token}-g${generationIndex}-${counter}`;
    }
    counters.set(counterKey, counter);
    usedIds.add(id);
    return id;
  };
}

function automaticName({ sex, generationIndex, usedNamesByGeneration, params, randomFn }) {
  if (!params.autoGenerateNames && params.usePlaceholders) return PLACEHOLDER_UNKNOWN;
  if (!usedNamesByGeneration.has(generationIndex)) usedNamesByGeneration.set(generationIndex, []);
  const usedNames = usedNamesByGeneration.get(generationIndex);
  let name = suggestName(sex, usedNames, randomFn);
  if (name === PLACEHOLDER_UNKNOWN && !params.usePlaceholders) {
    name = suggestName(sex, [], randomFn);
  }
  if (name !== PLACEHOLDER_UNKNOWN) usedNames.push(name);
  return name;
}

function lifeForBirth(birthYear, params, agingKind, currentYear, randomFn) {
  if (!params.autoCalculateDeath) return { death: '', status: 'alive' };
  const suggested = numericYear(suggestDeathYear({
    birthYear,
    params: { lifespan: Number(params.lifespan) || DEFAULT_LIFESPAN_YEARS },
    agingKind,
    randomFn
  }));
  if (suggested === null || suggested > currentYear) return { death: '', status: 'alive' };
  return { death: String(Math.max(Number(birthYear) + 1, suggested)), status: 'dead' };
}

function ensureAliveThrough(person, year, currentYear, randomFn, options = {}) {
  const deathYear = numericYear(person.death);
  if (deathYear === null || deathYear >= year) return;
  if (options.explicitDeathYears?.has(person.id)) {
    throw new Error(
      `Das eingetragene Sterbejahr ${deathYear} von „${person.name}“ liegt vor ${options.eventDescription || `dem erforderlichen Lebensereignis im Jahr ${year}`}.`
    );
  }
  const laterDeath = year + randomInteger(randomFn, 1, 24);
  if (laterDeath > currentYear) {
    person.death = '';
    person.status = 'alive';
  } else {
    person.death = String(laterDeath);
    person.status = 'dead';
  }
}

function generatedPerson({
  id,
  family,
  generationIndex,
  birthYear,
  sex,
  familyRole,
  lineageRole = 'branch',
  params,
  template,
  currentYear,
  randomFn,
  usedNamesByGeneration
}) {
  const agingKind = params.allowSpecialAging && randomChance(randomFn, template.specialAgingChance)
    ? randomItem(randomFn, NORMAL_AGING_KINDS)
    : 'normal';
  const life = lifeForBirth(birthYear, params, agingKind, currentYear, randomFn);
  return {
    id,
    name: automaticName({ sex, generationIndex, usedNamesByGeneration, params, randomFn }),
    title: '',
    sex,
    status: life.status,
    birth: String(birthYear),
    death: life.death,
    portrait: '',
    portraitPlaceholder: 'auto',
    houseId: family.lineage.houseId || '',
    familyRole,
    lineageRole,
    tags: agingKind === 'normal' ? [] : [AGING_KINDS[agingKind].label.split(' (')[0]],
    notes: '',
    extensions: {}
  };
}

function effectiveChildRange(template, params) {
  const configuredMinimum = Math.max(0, Number(params.minChildren) || 0);
  const configuredMaximum = Math.max(1, Number(params.maxChildren) || 1);
  const minimum = Math.min(
    configuredMaximum,
    Math.max(configuredMinimum, template.minimumChildren)
  );
  const maximum = Math.max(minimum, Math.min(configuredMaximum, template.maximumChildren));
  return Object.freeze({ minimum, maximum });
}

function assertPersonBudget(family) {
  if (family.persons.length > AUTOMATIC_TEMPLATE_GENERATION_LIMITS.maximumPersons) {
    throw new Error(`Die Vorlage würde mehr als ${AUTOMATIC_TEMPLATE_GENERATION_LIMITS.maximumPersons} Personen erzeugen. Bitte weniger Generationen oder eine kleinere Vorlage wählen.`);
  }
}

function assertGeneratedDates(family, currentYear) {
  const values = [
    ...family.persons.flatMap(person => [person.birth, person.death]),
    ...family.partnerships.flatMap(partnership => [partnership.start, partnership.end]),
    ...family.timeJumps.flatMap(timeJump => [timeJump.fromYear, timeJump.toYear])
  ];
  const futureYear = values.map(numericYear).find(year => year !== null && year > currentYear);
  if (futureYear !== undefined) {
    throw new Error(`Die automatische Vorlage hat fälschlich das zukünftige Jahr ${futureYear} erzeugt.`);
  }
}

export function generateAutomaticFamilyTemplate(baseFamily, rawOptions = {}, dependencies = {}) {
  const currentYear = boundedInteger(
    dependencies.currentYear,
    ALERIA_CURRENT_YEAR,
    1,
    ALERIA_CURRENT_YEAR
  );
  const options = normalizeAutomaticTemplateOptions(rawOptions);
  if (options.generationCount === 1 && options.timeJump.enabled) {
    throw new Error('Ein Zeitsprung benötigt mindestens eine sichtbare Generation nach dem Gründerpaar.');
  }
  const template = getFamilyTemplateDefinition(options.templateId);
  const randomFn = dependencies.randomFn || createTemplateRandom(options.seed);
  const family = assertValidFamily(baseFamily).family;
  const explicitDeathYears = new Map(family.persons
    .map(person => [person.id, numericYear(person.death)])
    .filter(([, deathYear]) => deathYear !== null));
  const founderPartnership = assertFreshFounderFamily(family);
  assertKnownYearsNotInFuture(family, currentYear);
  const { founders, anchorYear, childbearingAge } = deriveFounderYears(
    family,
    founderPartnership,
    options,
    currentYear,
    randomFn
  );
  const timeJump = normalizeTimeJump(options, anchorYear, childbearingAge, currentYear);
  const generationYears = planGenerationYears({
    founderAnchorYear: anchorYear,
    generationCount: options.generationCount,
    childbearingAge,
    timeJump,
    currentYear,
    randomFn
  });
  const nextId = createIdFactory(family, options.seed);
  const usedNamesByGeneration = new Map([[1, founders.map(person => person.name)]]);
  const childRange = effectiveChildRange(template, options.params);
  const timeJumpId = timeJump ? nextId('time-jump', 1) : '';
  const timeJumpChildIds = [];

  founders.forEach(person => {
    if (!person.death && options.params.autoCalculateDeath) {
      Object.assign(person, lifeForBirth(person.birth, options.params, 'normal', currentYear, randomFn));
    }
  });
  const founderPartnershipStart = numericYear(founderPartnership.start);
  if (founderPartnershipStart !== null) {
    founders.forEach(person => ensureAliveThrough(
      person,
      founderPartnershipStart,
      currentYear,
      randomFn,
      {
        explicitDeathYears,
        eventDescription: `der Gründerehe im Jahr ${founderPartnershipStart}`
      }
    ));
    founderPartnership.status = founders.some(person => person.status === 'dead') ? 'widowed' : 'active';
  }

  function createSpouse(corePerson, generationIndex, nextChildYear = null) {
    const coreBirth = numericYear(corePerson.birth) || generationYears[generationIndex - 1];
    const sex = corePerson.sex === 'male' ? 'female' : corePerson.sex === 'female' ? 'male' : randomItem(randomFn, ['female', 'male']);
    const spouse = generatedPerson({
      id: nextId('person', generationIndex),
      family,
      generationIndex,
      birthYear: Math.max(1, coreBirth - randomInteger(randomFn, 0, 4)),
      sex,
      familyRole: 'married',
      params: options.params,
      template,
      currentYear,
      randomFn,
      usedNamesByGeneration
    });
    family.persons.push(spouse);
    const latestBirth = Math.max(coreBirth, numericYear(spouse.birth) || coreBirth);
    const preferredMarriageYear = latestBirth + DEFAULT_MARRIAGE_AGE;
    const marriageYear = nextChildYear === null
      ? Math.min(currentYear, preferredMarriageYear)
      : Math.min(nextChildYear, preferredMarriageYear);
    [corePerson, spouse].forEach(person => ensureAliveThrough(
      person,
      marriageYear,
      currentYear,
      randomFn,
      {
        explicitDeathYears,
        eventDescription: `der Eheschließung im Jahr ${marriageYear}`
      }
    ));
    if (nextChildYear !== null) {
      [corePerson, spouse].forEach(person => ensureAliveThrough(
        person,
        nextChildYear,
        currentYear,
        randomFn,
        {
          explicitDeathYears,
          eventDescription: `der Geburt eines biologischen Kindes im Jahr ${nextChildYear}`
        }
      ));
    }
    const partnership = {
      id: nextId('partnership', generationIndex),
      participantIds: [corePerson.id, spouse.id],
      type: 'marriage',
      status: corePerson.status === 'dead' || spouse.status === 'dead' ? 'widowed' : 'active',
      start: String(marriageYear),
      end: '',
      certainty: 'confirmed',
      visibility: 'public',
      notes: '',
      extensions: {}
    };
    family.partnerships.push(partnership);
    assertPersonBudget(family);
    return partnership;
  }

  let activePartnerships = [founderPartnership];
  for (let generationIndex = 2; generationIndex <= options.generationCount; generationIndex += 1) {
    const generationYear = generationYears[generationIndex - 1];
    const isFirstAfterBarrier = Boolean(timeJump && generationIndex === 2);
    const generatedChildren = [];
    activePartnerships.forEach(partnership => {
      const childCount = randomInteger(randomFn, childRange.minimum, childRange.maximum);
      let previousChild = null;
      for (let childIndex = 0; childIndex < childCount; childIndex += 1) {
        const isTwin = Boolean(
          previousChild
          && options.params.allowTwins
          && randomChance(randomFn, template.twinChance)
        );
        const birthYear = isTwin
          ? Number(previousChild.birth)
          : Math.min(currentYear, generationYear + (childIndex === 0 ? 0 : randomInteger(randomFn, 0, template.siblingYearSpread)));
        const child = generatedPerson({
          id: nextId('person', generationIndex),
          family,
          generationIndex,
          birthYear,
          sex: randomItem(randomFn, ['female', 'male']),
          familyRole: 'core',
          params: options.params,
          template,
          currentYear,
          randomFn,
          usedNamesByGeneration
        });
        if (isTwin) child.tags.push(`Zwilling von ${previousChild.name}`);
        family.persons.push(child);
        generatedChildren.push(child);
        const participantIds = [...partnership.participantIds];
        let parentIds = participantIds;
        let partnershipId = partnership.id;
        let type = 'biological';
        let legitimacy = 'legitimate';
        let certainty = 'confirmed';
        let extensions = {};
        if (isFirstAfterBarrier) {
          type = 'claimed';
          legitimacy = 'unknown';
          certainty = 'probable';
          extensions = { timeJumpId };
          timeJumpChildIds.push(child.id);
        } else if (options.params.allowAdoption && randomChance(randomFn, template.adoptionChance)) {
          type = 'adoptive';
          legitimacy = 'unknown';
        } else if (options.params.allowBastards && randomChance(randomFn, template.bastardChance)) {
          parentIds = participantIds.slice(0, 1);
          partnershipId = '';
          legitimacy = 'illegitimate';
          certainty = 'probable';
        }
        if (type === 'biological') {
          parentIds.forEach(parentId => {
            const parent = family.persons.find(person => person.id === parentId);
            if (!parent) return;
            ensureAliveThrough(parent, birthYear, currentYear, randomFn, {
              explicitDeathYears,
              eventDescription: `der Geburt des biologischen Kindes „${child.name}“ im Jahr ${birthYear}`
            });
          });
        }
        family.parentages.push({
          id: nextId('parentage', generationIndex),
          childId: child.id,
          parentIds,
          partnershipId,
          type,
          legitimacy,
          certainty,
          visibility: 'public',
          notes: isFirstAfterBarrier ? 'Nach einem Zeitsprung wieder belegte Linie.' : '',
          extensions
        });
        previousChild = child;
        assertPersonBudget(family);
      }
    });

    if (generationIndex === options.generationCount) {
      generatedChildren.forEach(child => {
        const adultInPresent = (numericYear(child.birth) || currentYear) + 18 <= currentYear;
        if (adultInPresent && randomChance(randomFn, template.sideMarriageChance)) {
          createSpouse(child, generationIndex);
        }
      });
      activePartnerships = [];
      continue;
    }

    const nextGenerationYear = generationYears[generationIndex];
    const eligibleChildren = shuffled(randomFn, generatedChildren.filter(child => (
      (numericYear(child.birth) || nextGenerationYear) + PLAUSIBLE_PARENT_AGE_AT_BIRTH.min <= nextGenerationYear
    )));
    if (!eligibleChildren.length) {
      throw new Error(`Generation ${generationIndex} enthält keine Person, die die Linie plausibel fortsetzen kann.`);
    }
    const continuingChildren = [eligibleChildren[0]];
    for (const candidate of eligibleChildren.slice(1)) {
      if (continuingChildren.length >= template.maximumContinuingLines) break;
      if (randomChance(randomFn, template.additionalLineChance)) continuingChildren.push(candidate);
    }
    continuingChildren.forEach((child, index) => {
      child.lineageRole = index === 0 ? 'mainline' : 'branch';
    });
    const continuingIds = new Set(continuingChildren.map(child => child.id));
    activePartnerships = continuingChildren.map(child => createSpouse(child, generationIndex, nextGenerationYear));
    generatedChildren.forEach(child => {
      if (continuingIds.has(child.id)) return;
      const adultInPresent = (numericYear(child.birth) || currentYear) + 18 <= currentYear;
      if (adultInPresent && randomChance(randomFn, template.sideMarriageChance)) {
        createSpouse(child, generationIndex);
      }
    });
  }

  if (timeJump) {
    family.timeJumps.push({
      id: timeJumpId,
      parentPartnershipId: founderPartnership.id,
      parentPersonId: '',
      childIds: timeJumpChildIds,
      years: timeJump.years,
      fromYear: timeJump.fromYear,
      toYear: timeJump.toYear,
      label: timeJump.label,
      notes: '',
      extensions: {}
    });
  }
  family.extensions = {
    ...family.extensions,
    generatorTemplate: {
      version: 1,
      templateId: template.id,
      generationCount: options.generationCount,
      seed: options.seed,
      currentYear
    }
  };
  assertGeneratedDates(family, currentYear);
  const validatedFamily = assertValidFamily(family).family;
  const generationDepths = resolveFamilyGenerationDepths(validatedFamily);
  const actualGenerationCount = generationDepths.size
    ? Math.max(...generationDepths.values()) + 1
    : 0;
  if (actualGenerationCount !== options.generationCount) {
    throw new Error(`Die Vorlage sollte ${options.generationCount}, hat aber ${actualGenerationCount} sichtbare Generationen erzeugt.`);
  }
  return Object.freeze({
    family: validatedFamily,
    summary: Object.freeze({
      templateId: template.id,
      templateLabel: template.label,
      generationCount: actualGenerationCount,
      personCount: validatedFamily.persons.length,
      partnershipCount: validatedFamily.partnerships.length,
      fromYear: String(generationYears[0]),
      toYear: String(Math.max(...generationYears)),
      timeJumpEnabled: Boolean(timeJump),
      seed: options.seed
    })
  });
}
