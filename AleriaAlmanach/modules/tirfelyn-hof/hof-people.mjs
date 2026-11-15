import { HOF_STAFF } from '../../../shared/tirfelyn-hof/hof-residents.mjs';

export function hofStaffGroups() {
  return [
    ['wald', 'Holz und Wald', ['hallvard', 'rannveig', 'torleif'], ''],
    ['muehle', 'Die Müllerfamilie', ['meirig', 'gwenneth', 'iorfin', 'eifor'], ''],
    ['feldhelfer', 'Felder und Gemüse', ['nefydd', 'rhufon'], 'feld'],
    ['viehhelfer', 'Vieh, Stall und Hufschmiede', ['maldwyn', 'cynfarch'], 'vieh'],
    ['haushilfe', 'Haus, Vorräte und Wege', ['eiluned'], 'haushalt']
  ].map(([id, label, keys, targetTreeId]) => ({ id: `hof-${id}`, label, targetTreeId,
    people: keys.map(key => HOF_STAFF.find(person => person.key === key)) }));
}
