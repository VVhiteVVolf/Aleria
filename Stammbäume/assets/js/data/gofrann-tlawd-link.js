import { gofrannFamilyPerson, gofrannFamilyMarriage } from './gofrann-family-records.js';
import { GOFRANN_MARRIAGES, GOFRANN_EMBLEM } from '../../../../AleriaAlmanach/modules/gofrann-schmiede/gofrann-people.mjs';
import { withMarriedAwayContinuation } from './married-away-continuation.js';

export function withGofrannTlawdLink(source) {
  const family = structuredClone(source);
  for (const key of ['einion','ulaena']) {
    const person = gofrannFamilyPerson(key, { familyRole: 'married' });
    const existing = family.persons.find(p => p.id === person.id);
    if (!existing || existing.worldPersonId !== person.worldPersonId) throw new Error(`Bestehende Tlawd-Identität fehlt: ${key}`);
    Object.assign(existing, person);
  }
  family.houses.push({ id: 'house-gofrann', name: 'Haus Gofrann', emblem: GOFRANN_EMBLEM, status: 'active' });
  for (const id of ['marriage-renfri-einion','marriage-lludd-ulaena']) {
    const existing = family.partnerships.find(p => p.id === id);
    const updated = gofrannFamilyMarriage(GOFRANN_MARRIAGES.find(m => m.id === id), 'haus-gofrann');
    if (!existing || existing.participantIds.some(pid => !updated.participantIds.includes(pid))) throw new Error(`Bestehende Ehe verändert: ${id}`);
    Object.assign(existing, updated);
  }
  const renfri = family.persons.find(p => p.id === 'renfri-tlawd');
  const role = gofrannFamilyPerson('renfri');
  Object.assign(renfri, { title: role.title, notes: role.notes,
    extensions: { ...renfri.extensions, registryManagedFields: ['title','notes'] } });
  family.extensions = { ...family.extensions, sourceRevision: 2,
    sourceNote: `${family.extensions.sourceNote} Einions und Ulaenas Herkunftsfamilie ist Gofrann. Renfris Nachkommen werden dort fortgeführt; Ulaenas Kinder Owain und Leisa bleiben bei Tlawd.` };
  return withMarriedAwayContinuation(family, { id: 'married-away-renfri-gofrann', name: 'Haus Gofrann',
    parentPartnershipId: 'marriage-renfri-einion', childIds: [], houseId: 'house-gofrann',
    targetFamilyId: 'haus-gofrann', emblem: GOFRANN_EMBLEM, crestFrame: 'iron',
    notes: 'Renfri heiratete Einion Gofrann. Cynlas und Eluned sowie die weitere Familienlinie stehen ausschließlich bei Gofrann.' });
}
