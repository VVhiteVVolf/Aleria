import { createMarriage, createParentages } from './family-record-builders.js';
import { kanneFamilyPerson } from './krumme-kanne-family-people.js';

// Mair and Caradog retain their existing person and world identities. Gareth's
// ended relationship and Caradog's original biological parentage stay intact.
export function withKrummeKanneTonnarthLink(family) {
  const next = structuredClone(family);
  const image = id => `../AleriaAlmanach/assets/krumme-kanne/portraits/${id}.png`;
  const mair = next.persons.find(p => p.id === 'mair-affair-tonnarth');
  const caradog = next.persons.find(p => p.id === 'caradog-bastard-tonnarth');
  if (!mair || !caradog) throw new Error('Mair und Caradog fehlen in der Tonnarth-Familie.');
  const former = next.partnerships.find(p => p.id === 'affair-gareth-mair-tonnarth');
  former.extensions.crossFamilyRelationship = { linkId: former.id, counterpartFamilyId: 'haus-dubhdarach' };
  for (const [p, title, notes, portrait] of [
    [mair, 'Rechnungsführerin der Krummen Kanne · Ehefrau Aedan Dubhdarachs', 'Mutter Caradog Tonnarths aus der beendeten Verbindung mit Gareth. Seit 1724 mit Aedan Dubhdarach aus Leitheach verheiratet; gemeinsame Kinder Neifion und Eirlys.', image('mair')],
    [caradog, 'Meier der Krummen Kanne', 'Sohn Gareth Tonnarths und Mairs, geboren 1718. Aedan Dubhdarachs Stiefsohn; älterer Halbbruder von Neifion und Eirlys. Organisiert Lieferhof, Transporte und Reparaturen der Kanne.', image('caradog')]
  ]) {
    Object.assign(p, { title, notes, portrait });
    p.extensions.registryManagedFields = [...new Set([...(p.extensions.registryManagedFields || []), 'title', 'notes', 'portrait'])];
  }
  const spouse = 'aedan-dubhdarach-kanne';
  const marriage = 'marriage-aedan-mair-kanne';
  const additions = ['aedan', 'neifion', 'eirlys'].map(key => kanneFamilyPerson(key, { familyRole: 'married' }));
  for (const p of additions) if (!next.persons.some(existing => existing.id === p.id)) next.persons.push(p);
  if (!next.houses.some(h => h.id === 'house-dubhdarach')) next.houses.push({ id: 'house-dubhdarach', name: 'Haus Dubhdarach', status: 'active', emblem: 'assets/images/houses/Llamreis Ankunft/Bürgerliche/Gwynthor/Dubhdarach.png' });
  if (!next.partnerships.some(p => p.id === marriage)) next.partnerships.push(createMarriage(marriage, spouse, mair.id, { start: '1724', notes: 'Gemeinsamer Haushalt in der Krummen Kanne, Gwynthor.', extensions: { crossFamilyRelationship: { linkId: marriage, counterpartFamilyId: 'haus-dubhdarach' } } }));
  for (const p of createParentages(additions.slice(1).map(p => p.id), [spouse, mair.id], marriage)) if (!next.parentages.some(existing => existing.id === p.id)) next.parentages.push(p);
  next.extensions.sourceRevision = Math.max(2, Number(next.extensions.sourceRevision) || 0);
  return Object.freeze(next);
}
