import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import { FAMILY_REGISTRY } from '../../Stammbäume/assets/js/data/families.registry.js';

const file = 'AleriaAlmanach/assets/ship-crews/rhydians-schiffsmannschaft/crew-candidates-2026-10-05.json';
const data = JSON.parse(fs.readFileSync(file, 'utf8'));
assert.equal(data.revision, 2, 'Nur den bestehenden Kandidatenentwurf Revision 2 übernehmen.');
const nameContext = vm.createContext({});
vm.runInContext(fs.readFileSync('AleriaAlmanach/modules/name-list/name-list-data.js', 'utf8'), nameContext);
const maleNames = new Set(vm.runInContext('createRheunwaithNameListData().groups[0].names', nameContext));

const replacements = { Neddwyn: 'Bevan', Maelban: 'Penry', Ellor: 'Parry' };
data.familyReassignments = data.candidates.filter(candidate => replacements[candidate.givenName]).map(candidate => ({
  givenName: candidate.givenName,
  previousSurname: candidate.surname,
  surname: replacements[candidate.givenName],
  reason: 'Ein Mann pro Familie innerhalb der zusätzlichen Mannschaftskandidaten.'
}));
for (const candidate of data.candidates) {
  if (!replacements[candidate.givenName]) continue;
  candidate.surname = replacements[candidate.givenName];
  candidate.houseId = `haus-${candidate.surname.toLowerCase()}`;
  candidate.displayName = `${candidate.givenName} ${candidate.surname}`;
}
const additions = [
  { givenName: 'Gwaedric', surname: 'Gwernhelyd', age: 25, role: 'Kalfaterer', idea: 'Kennt Holz, Fugen und Pech; arbeitet bei Lecks eng mit Halvar zusammen.' },
  { givenName: 'Cyror', surname: 'Cledrann', age: 23, role: 'Reepschläger / Seiler', idea: 'Fertigt und repariert Tauwerk; unterstützt Thalan bei der Takelage.' },
  { givenName: 'Pereth', surname: 'Halenwych', age: 19, role: 'Vorratsgehilfe', idea: 'Prüft Pökelfässer und Wasservorräte; unterstützt Ellor und Torsten.' }
].map(candidate => ({
  ...candidate,
  houseId: `haus-${candidate.surname.toLowerCase()}`,
  sex: 'male', originCountry: 'Cenyr', originPlace: 'Talgarth',
  displayName: `${candidate.givenName} ${candidate.surname}`, newFamily: true
}));
data.candidates.push(...additions);
data.revision = 3;
data.composition.Cenyr = 13;
data.selectionRules = {
  maleOnly: true, maxCandidatesPerFamily: 1,
  foreigners: { Aldrimar: 4, Vennyr: 2 },
  scope: 'Zusätzliche Kandidaten; bestehende acht benannte Mannschaftsmitglieder bleiben erhalten.'
};
data.note = '19 männliche Kandidaten: 13 aus Talgarth, vier aus Aldrimar und zwei aus Vennyr. Innerhalb dieser Kandidatenliste jede Familie höchstens einmal. Die früher doppelten Mathgraig-, Morgwynt- und Morglan-Plätze werden bei unverändertem Vornamen, Alter und Rolle Bevan, Penry und Parry zugeordnet. Drei zusätzliche Kandidaten kommen aus den neu beauftragten Talgarther Bürgerfamilien Gwernhelyd, Cledrann und Halenwych. Alle Personen und Abstammungen bleiben Entwürfe; keine ungeprüften Genealogiekanten angelegt. Bestehende acht benannte Mannschaftsmitglieder bleiben unverändert. Persönliche nordische Beinamen sind keine Clannamen; vennyrianische Patronyme sind Namensvorschläge. Dyger ist die vorhandene Schreibweise des gewünschten Musikerhauses. Keine Personenbilder vor Freigabe.';

assert.equal(data.candidates.length, 19);
assert.ok(data.candidates.every(candidate => candidate.sex === 'male'));
for (const [country, count] of [['Cenyr', 13], ['Aldrimar', 4], ['Vennyr', 2]]) {
  assert.equal(data.candidates.filter(candidate => candidate.originCountry === country).length, count);
}
const familyIds = data.candidates.map(candidate => candidate.houseId).filter(Boolean);
assert.equal(new Set(familyIds).size, familyIds.length);
assert.equal(new Set(data.candidates.map(candidate => candidate.displayName)).size, 19);
assert.equal(data.candidates.filter(candidate => candidate.age > 30).length, 3);
assert.equal(data.candidates.filter(candidate => candidate.age > 50).length, 1);
assert.ok(data.candidates.every(candidate => candidate.age > 30 || (candidate.age >= 17 && candidate.age <= 27)));
for (const candidate of data.candidates) {
  if (candidate.originCountry !== 'Aldrimar') assert.ok(maleNames.has(candidate.givenName), candidate.givenName);
  if (!candidate.houseId) continue;
  const family = FAMILY_REGISTRY.find(record => record.id === candidate.houseId);
  assert.ok(family, candidate.houseId);
  assert.equal(family.houseProfile.seat, 'Talgarth');
}
fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
console.log(JSON.stringify({ people: 19, composition: data.composition, reassigned: data.familyReassignments, additions: additions.map(candidate => candidate.displayName) }));
