import { readFile, writeFile } from 'node:fs/promises';
import { resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
const directory = new URL('./', import.meta.url);
const repository = fileURLToPath(new URL('../../', import.meta.url));
const json = async name => JSON.parse(await readFile(new URL(name, directory), 'utf8'));
const [scope, scan, identity, leitheach, cenyr, aldrimar, parentCounterparts] = await Promise.all([
  'public-scope.json', 'chronology-candidates.json', 'shared-identity-review.json',
  'leitheach-findings.json', 'cenyr-findings.json', 'aldrimar-findings.json',
  'parent-counterpart-candidates.json'
].map(json));

const confirmed = [
  ...leitheach.findings.filter(finding => finding.classification === 'accept').map(finding => ({ realm: 'Leitheach', ...finding })),
  ...cenyr.findings.filter(finding => finding.classification.startsWith('confirmed-')).map(finding => ({ realm: 'Cenyr', ...finding })),
  ...aldrimar.acceptedNarrativeFindings.map(finding => ({ realm: 'Aldrimar', category: 'active-place-text-conflict', ...finding })),
  ...aldrimar.acceptedChronologyFindings.map(finding => ({ realm: 'Aldrimar', category: 'public-chronology-conflict', ...finding }))
];
const questions = [
  ...leitheach.findings.filter(finding => finding.classification === 'uncertain').map(finding => ({ realm: 'Leitheach', ...finding })),
  ...cenyr.findings.filter(finding => !finding.classification.startsWith('confirmed-')).map(finding => ({ realm: 'Cenyr', ...finding })),
  ...aldrimar.reviewQuestions.map(finding => ({ realm: 'Aldrimar', ...finding }))
];
const counterpartConflicts = identity.findings.filter(finding => finding.status === 'confirmed-current-counterpart-conflict');
const unresolvedIdentities = identity.findings.filter(finding => finding.status !== 'confirmed-current-counterpart-conflict');
const report = {
  schema: 'aleria.public-house-lore-audit', schemaVersion: 1, reviewedAt: new Date().toISOString(),
  status: 'complete-read-only-review', currentWorldYear: 1740, productFilesChanged: false,
  scope: { publicFamilies: scope.records.length, Cenyr: 283, Aldrimar: 112, Leitheach: 29,
    CenyrIncludesCurrentExilePlacement: 'Sept Cneacail', activeHouseSourcesCompared: 416,
    familyPersonEntriesScreened: scan.count.persons,
    publicParentagesScreened: scan.count.publicParentages,
    publicPartnershipsScreened: scan.count.publicPartnerships,
    coverageGaps: cenyr.coverage.scopeIdsWithoutHouseRegistryEntry,
    coverageNote: 'Systematischer Struktur- und Chronologieabgleich mit gezielter narrativer Verifikation. Keine Behauptung einer lückenlosen manuellen Satzprüfung sämtlicher überlieferten Texte.' },
  interpretation: [
    'Ein bestätigter Konflikt bedeutet: Zwei aktuelle Aussagen sind miteinander unvereinbar. Welche Angabe zu korrigieren ist, folgt daraus nicht automatisch.',
    'Ausgestorbene Hausverwaltung bedeutet nicht automatisch, dass alle Nachkommen verstorben sind.',
    'Historische Veränderungen, dokumentierte Generationenlücken und echte Namensgleichheiten werden nicht als Widerspruch gezählt.',
    'Aktive Ratsverknüpfungen auf als verstorben geführte Personen belegen eine Anzeige- oder Identitätsinkonsistenz. Ohne Todesdatum ist damit nicht bewiesen, dass die tatsächlich gemeinten Ratsmitglieder verstorben sind.',
    'Die Ceardaíocht-Kinderdatierung und Rhun Wylans Todesjahr waren bereits ausdrücklich als ungelöste Quellenabweichungen dokumentiert.'
  ],
  exclusions: ['Private Dossiers und geheime Inhalte', 'Restricted/private/hidden Beziehungen und ausschließlich darin geführte Personen',
    'Gelieferte alte Stammbaumabschnitte', 'Militärstatistiken', 'Archivbehauptungen ohne aktuelle Gegenstelle'],
  summary: { confirmedRegionalConflictGroups: confirmed.length, confirmedCounterpartPersonConflicts: counterpartConflicts.length,
    counterpartAliveDeadConflicts: counterpartConflicts.filter(finding => finding.fields.status).length,
    counterpartBirthOrDeathConflicts: counterpartConflicts.filter(finding => finding.fields.birth || finding.fields.death).length,
    counterpartSexConflicts: counterpartConflicts.filter(finding => finding.fields.sex).length,
    uncertainRegionalQuestions: questions.length, unresolvedIdentityMatches: unresolvedIdentities.length,
    rawChronologyCandidates: scan.localCandidates.length, IllewodGenerationGapFalsePositives: 12,
    additionalConflictingNamedParentPairs: parentCounterparts.candidates.length },
  confirmedRegionalFindings: confirmed, confirmedCounterpartConflicts: counterpartConflicts,
  uncertainRegionalQuestions: questions, unresolvedIdentityMatches: unresolvedIdentities,
  technicalCause: { path: 'Stammbäume/assets/js/data/family-record-builders.js', line: 33,
    fact: 'Ohne ausdrücklich gesetzten Status wird ein nichtleeres Todesfeld als dead und ein leeres Todesfeld bei vorhandenem Geburtswert als alive ausgewertet. Auch ???? ist ein nichtleerer Wert.',
    inference: 'Ein Teil der Gegenaktenkonflikte kann durch unterschiedlich ausgefüllte, unsichere Todesfelder entstanden sein. Das entscheidet keinen Einzelfall und rechtfertigt keine pauschale Statusmigration.' },
  rejectedAndNonContradictions: { leitheach: leitheach.rejectedCandidates, cenyr: cenyr.excludedCandidates,
    aldrimarNameCollisions: aldrimar.discardedNameCollisions, aldrimarOther: aldrimar.furtherNonContradictions,
    elfTerminology: 'Keine Elfenbehauptung in den aktiven Hausquellen der drei Länder gefunden; der einzige elf-Treffer ist das Zahlwort in elf Jahre.' },
  evidenceReports: ['leitheach-findings.json', 'cenyr-findings.json', 'aldrimar-findings.json',
    'shared-identity-review.json', 'chronology-candidates.json', 'parent-counterpart-candidates.json', 'public-scope.json'],
  priorities: [
    'Biologische Zeitabläufe und aktuelle Herrschafts-/Amtseinträge zuerst inhaltlich klären.',
    'Hornhalls Ortsbeschreibung sowie die fälschlichen Kategorien-Sitze von Blutklinge und Windhüter an die belegten Territorialdaten angleichen.',
    'Gegenakten zu eindeutig identischen Personen synchronisieren, dabei belegte Lebensdaten erhalten und unklare Todesfelder nicht pauschal umdeuten.',
    'Ungewöhnliche Elternalter, zweifelhafte Personenverknüpfungen und Namensgleichheiten vor jeder Änderung anhand ihrer Einzelquellen klären.'
  ]
};

const cache = new Map();
const errors = [];
let evidenceCount = 0;
async function verifyEvidence(value) {
  if (!value || typeof value !== 'object') return;
  if (typeof value.path === 'string' && Number.isInteger(value.line)) {
    const absolute = resolve(repository, value.path);
    if (relative(repository, absolute).startsWith('..')) throw new Error('Evidence outside repository');
    try {
      if (!cache.has(absolute)) cache.set(absolute, (await readFile(absolute, 'utf8')).split(/\r?\n/));
      const lines = cache.get(absolute);
      if (value.line < 1 || value.line > lines.length) errors.push({ path: value.path, line: value.line, issue: 'line-out-of-bounds' });
      else { value.actualSourceLine = lines[value.line - 1].trim(); evidenceCount++; }
    } catch (error) { errors.push({ path: value.path, line: value.line, issue: String(error) }); }
  }
  for (const [key, entry] of Object.entries(value)) if (key !== 'actualSourceLine') await verifyEvidence(entry);
}
await verifyEvidence(report);
report.evidenceValidation = { status: errors.length ? 'failed' : 'pass', evidenceCount, sourceFiles: cache.size,
  notes: 'Alle zitierten Pfade und Zeilennummern überprüft. actualSourceLine enthält jeweils die echte aktuelle Quellzeile; ältere quote-Felder können verkürzte Inhaltswiedergaben sein.', errors };
if (errors.length) throw new Error(JSON.stringify(errors));
await writeFile(new URL('audit-report.json', directory), JSON.stringify(report, null, 2) + '\n', 'utf8');
console.log(JSON.stringify({status:report.status,scope:report.scope.publicFamilies,summary:report.summary,
  evidenceValidation:report.evidenceValidation}, null, 2));
