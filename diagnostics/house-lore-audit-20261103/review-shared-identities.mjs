// Verify that conflicting counterpart records also share a public partner.
// Different people with matching names/automatic IDs are kept unresolved.
import { readFile, writeFile } from 'node:fs/promises';
import { FAMILY_REGISTRY } from '../../Stammbäume/assets/js/data/families.registry.js';
const base = new URL('./', import.meta.url);
const repository = new URL('../../', import.meta.url);
const scan = JSON.parse(await readFile(new URL('chronology-candidates.json', base), 'utf8'));
const byId = new Map(FAMILY_REGISTRY.map(record => [record.id, record]));
const forbidden = new Set(['restricted', 'private', 'hidden', 'secret']);
const publicConnection = edge => !forbidden.has(edge.visibility) && !forbidden.has(edge.extensions?.visibility)
  && !edge.hidden && !edge.private && !edge.extensions?.hidden && !edge.extensions?.private;
const evidence = [];
for (const candidate of scan.identityCandidates) {
  const entries = [];
  const publicPartnerSets = [];
  for (const entry of candidate.entries) {
    const family = byId.get(entry.familyId).family;
    const people = new Map(family.persons.map(person => [person.id, person]));
    const partners = family.partnerships.filter(edge => publicConnection(edge)
      && edge.participantIds.includes(entry.personId))
      .flatMap(edge => edge.participantIds.filter(id => id !== entry.personId))
      .map(id => people.get(id)).filter(Boolean).map(person => ({ id: person.id, name: person.name,
        worldPersonId: person.worldPersonId }));
    publicPartnerSets.push(new Set(partners.map(person => person.worldPersonId || person.id)));
    const path = `Stammbäume/assets/js/data/house-${entry.familyId.replace(/^haus-/, '')}-family.js`;
    let source = null;
    try {
      const lines = (await readFile(new URL(path, repository), 'utf8')).split(/\r?\n/);
      const index = lines.findIndex(line => line.includes(`'${entry.personId}'`)
        && /\b(person|member|spouse|awayWoman|awayMan|createFamilyPerson)\(/.test(line));
      source = index < 0 ? { path, line: null } : { path, line: index + 1, declaration: lines[index].trim() };
    } catch { source = { path, line: null, unresolvedSourcePath: true }; }
    entries.push({ ...entry, publicPartners: partners, source });
  }
  const commonPartners = [...publicPartnerSets[0]].filter(id => publicPartnerSets.every(set => set.has(id)));
  const confirmed = commonPartners.length > 0;
  evidence.push({ worldPersonId: candidate.worldPersonId,
    status: confirmed ? 'confirmed-current-counterpart-conflict' : 'identity-unresolved-do-not-merge',
    confidence: confirmed ? 'high' : 'unresolved',
    fields: candidate.fields, commonPublicPartnerIdentities: commonPartners, entries,
    alreadyExplicitlyDocumentedSourceDisagreement: candidate.worldPersonId === 'person--haus-wylan--rhun-wylan',
    recommendation: confirmed
      ? 'Die beiden aktuellen Aussagen müssen abgestimmt werden. Aus diesem Audit allein keine Daten verändern; Hauptakte und überlieferte Einzelbelege prüfen.'
      : 'Keine Gleichsetzung oder automatische Verschmelzung. Gleicher Name und gemeinsame technische ID sind ohne passende Familienbeziehungen kein Identitätsbeweis.' });
}
const report = { schema: 'aleria.public-house-identity-review', reviewedAt: new Date().toISOString(),
  readOnly: true, publicRelationshipsOnly: true, candidateCount: evidence.length,
  confirmedCount: evidence.filter(row => row.status === 'confirmed-current-counterpart-conflict').length,
  unresolvedCount: evidence.filter(row => row.status !== 'confirmed-current-counterpart-conflict').length, findings: evidence };
await writeFile(new URL('shared-identity-review.json', base), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ candidateCount: report.candidateCount, confirmedCount: report.confirmedCount,
  unresolved: evidence.filter(row => row.status !== 'confirmed-current-counterpart-conflict').map(row => row.worldPersonId),
  unresolvedSourcePaths: evidence.flatMap(row => row.entries).filter(entry => !entry.source.line).map(entry => [entry.familyId, entry.personId]) }, null, 2));
