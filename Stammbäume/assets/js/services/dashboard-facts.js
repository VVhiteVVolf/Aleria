// "Wusstest du schon?"-Fundus für die Landingpage. Es werden ausschließlich Fakten
// verwendet, die bereits irgendwo im Familiendokument stehen (Notizfelder, Kadetten-
// zweige, Legitimität, Vormundschaften, Rangprofil …) — es wird nichts erfunden.
// Zwei "Geschmacksrichtungen":
//  - 'question' : ein von uns formulierter Ja/Nein-Fakt ("Wusstest du, dass …?")
//  - 'archive'  : ein bereits im Datensatz vorhandener Notiztext, wörtlich zitiert
//                 (grammatisch passt hier kein "dass"-Satz, daher eigene Aufmachung)
const ARCHIVE_TEXT_MIN_LENGTH = 15;
const ARCHIVE_TEXT_MAX_LENGTH = 220;
// Manche Notizfelder dokumentieren die Entstehung des Datensatzes selbst (Bezug auf
// die Ausgangsvorlage/den User) statt In-Welt-Wissen — solche Notizen dürfen niemals
// als Trivia auf der Landingpage auftauchen, da sie die Erzählebene durchbrechen.
// Wortgrenzen per Lookaround statt \b, da \b Umlaute als Nicht-Wortzeichen behandelt
// und sonst z. B. "User" fälschlich innerhalb von "Häuser"/"Häusern" treffen würde.
const WORD_CHAR = '(?:[\\p{L}\\p{N}_])';
const META_NOTE_PATTERN = new RegExp(`(?<!${WORD_CHAR})(?:Vorlage|Users?)(?!${WORD_CHAR})`, 'iu');

function factId(...parts) {
  return parts.filter(Boolean).join('::');
}

function truncate(text, maxLength) {
  const trimmed = String(text || '').trim();
  if (trimmed.length <= maxLength) return trimmed;
  return `${trimmed.slice(0, maxLength - 1).trimEnd()}…`;
}

export function collectHouseFacts(record) {
  const family = record?.family;
  if (!family) return [];
  const houseId = record.id;
  const houseTitle = record.title || family.document.title;
  const facts = [];

  const archiveNote = (id, text, source = '') => {
    const trimmed = String(text || '').trim();
    if (trimmed.length < ARCHIVE_TEXT_MIN_LENGTH) return;
    if (META_NOTE_PATTERN.test(trimmed)) return;
    facts.push({
      id,
      flavor: 'archive',
      text: truncate(trimmed, ARCHIVE_TEXT_MAX_LENGTH),
      source,
      houseId,
      houseTitle
    });
  };
  const questionFact = (id, text) => {
    facts.push({ id, flavor: 'question', text, houseId, houseTitle });
  };

  archiveNote(factId('description', houseId), family.document.description, houseTitle);
  family.persons.forEach(person => archiveNote(factId('person-note', person.id), person.notes, person.name));
  family.partnerships.forEach(partnership => archiveNote(factId('partnership-note', partnership.id), partnership.notes, houseTitle));
  family.parentages.forEach(parentage => archiveNote(factId('parentage-note', parentage.id), parentage.notes, houseTitle));
  family.cadetBranches.forEach(branch => archiveNote(factId('branch-note', branch.id), branch.notes, branch.name || houseTitle));
  family.timeJumps.forEach(timeJump => archiveNote(factId('timejump-note', timeJump.id), timeJump.notes, houseTitle));
  if (family.lineage.originHouse?.enabled) {
    archiveNote(factId('origin-note', family.lineage.originHouse.id), family.lineage.originHouse.notes, houseTitle);
  }

  const extinctBranches = family.cadetBranches.filter(branch => branch.linkType === 'line-extinct');
  if (extinctBranches.length === 1) {
    questionFact(factId('extinct-count', houseId), `Wusstest du, dass bei ${houseTitle} eine Linie für immer erloschen ist?`);
  } else if (extinctBranches.length > 1) {
    questionFact(factId('extinct-count', houseId), `Wusstest du, dass bei ${houseTitle} bereits ${extinctBranches.length} Linien erloschen sind?`);
  }

  const marriedAway = family.cadetBranches.filter(branch => branch.linkType === 'married-away');
  if (marriedAway.length >= 3) {
    questionFact(factId('married-away-count', houseId), `Wusstest du, dass ${houseTitle} bereits ${marriedAway.length} Kinder in andere Häuser verheiratet hat?`);
  }

  family.parentages.filter(parentage => parentage.type === 'foster').forEach(parentage => {
    const ward = family.persons.find(person => person.id === parentage.childId);
    const guardian = family.persons.find(person => person.id === parentage.parentIds[0]);
    if (ward && guardian) {
      questionFact(factId('ward', parentage.id), `Wusstest du, dass ${ward.name} aus ${houseTitle} als Mündel bei ${guardian.name} aufwuchs?`);
    }
  });

  family.parentages.filter(parentage => parentage.legitimacy === 'illegitimate').forEach(parentage => {
    const child = family.persons.find(person => person.id === parentage.childId);
    if (child) questionFact(factId('illegitimate', parentage.id), `Wusstest du, dass ${child.name} aus ${houseTitle} als unehelich geboren gilt?`);
  });

  family.parentages.filter(parentage => parentage.legitimacy === 'legitimized').forEach(parentage => {
    const child = family.persons.find(person => person.id === parentage.childId);
    if (child) questionFact(factId('legitimized', parentage.id), `Wusstest du, dass ${child.name} aus ${houseTitle} nachträglich legitimiert wurde?`);
  });

  const heads = family.persons.filter(person => person.lineageRole === 'head');
  if (heads.length >= 2 && heads.every(head => head.sex === 'female')) {
    questionFact(factId('matriarchal', houseId), `Wusstest du, dass ${houseTitle} über mehrere Generationen ausschließlich von Frauen geführt wurde?`);
  }

  if (family.lineage.originHouse?.enabled && family.lineage.originHouse.name) {
    questionFact(factId('origin-house', houseId), `Wusstest du, dass ${houseTitle} seinen Ursprung auf ${family.lineage.originHouse.name} zurückführt?`);
  }

  if (family.document.houseProfile?.rankId === 'commoner') {
    questionFact(factId('meritocratic', houseId), `Wusstest du, dass in bürgerlichen Häusern wie ${houseTitle} nicht zwingend der Erstgeborene erbt, sondern wer sich als am fähigsten erweist?`);
  }

  return facts;
}

// Fakten, die über einzelne Häuser hinausgehen (Gesamtstatistik der Sammlung).
export function collectGlobalFacts(records) {
  const populated = (Array.isArray(records) ? records : [])
    .filter(record => Number(record.personCount ?? record.family?.persons.length ?? 0) > 0);
  if (!populated.length) return [];

  const totalPersons = populated.reduce((sum, record) => sum + Number(record.personCount ?? record.family?.persons.length ?? 0), 0);
  const facts = [{
    id: 'global-total-persons',
    flavor: 'question',
    text: `Wusstest du, dass die Archive bereits ${totalPersons} Personen über ${populated.length} Häuser verzeichnen?`,
    houseId: '',
    houseTitle: ''
  }];

  const largest = populated.reduce((current, record) => {
    const count = Number(record.personCount ?? record.family?.persons.length ?? 0);
    const currentCount = Number(current.personCount ?? current.family?.persons.length ?? 0);
    return count > currentCount ? record : current;
  }, populated[0]);
  const largestCount = Number(largest.personCount ?? largest.family?.persons.length ?? 0);
  if (largestCount > 0) {
    facts.push({
      id: 'global-largest-house',
      flavor: 'question',
      text: `Wusstest du, dass ${largest.title} mit ${largestCount} verzeichneten Personen das umfangreichste Archiv der Sammlung ist?`,
      houseId: largest.id,
      houseTitle: largest.title
    });
  }
  return facts;
}

export function pickFactSample(records, { count = 3, randomFn = Math.random } = {}) {
  const list = Array.isArray(records) ? records : [];
  const pool = list.flatMap(record => collectHouseFacts(record)).concat(collectGlobalFacts(list));
  const working = [...pool];
  const sample = [];
  while (working.length && sample.length < count) {
    const index = Math.floor(randomFn() * working.length);
    sample.push(working.splice(Math.max(0, Math.min(index, working.length - 1)), 1)[0]);
  }
  return sample;
}
