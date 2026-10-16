import { createFounderTimeJumpPlaceholderHouseFamily } from './blank-house-family-factory.js';
import { createFamilyPerson, createMarriage, createParentages } from './family-record-builders.js';
import { GWYNTHOR_COMMONER_HOUSE_PROFILES } from './celtigerns-wacht-house-profiles.js?v=20261016-eleganz-v1';
import { kanneFamilyPerson, KANNE_MARRIAGES, KANNE_FAMILY_DEFINITIONS } from './krumme-kanne-family-people.js';
import { withMarriedAwayContinuation } from './married-away-continuation.js';

const emblem = name => `assets/images/houses/Llamreis Ankunft/Bürgerliche/Gwynthor/${name}.png`;
const pid = key => kanneFamilyPerson(key).id;
const unknown = (id, name, sex, houseId, notes) => createFamilyPerson({ id, name, sex, houseId, status: 'dead', death: '????', notes });
const histories = {
  trevoryn: 'Einheimisches Bürgerhaus aus Gwynthor. Merrik, seine Schwester Eirian und sein Bruder Elidyr sind Kinder Nestwens. Merrik gründete 1722 mit seinen Feldkameraden die Krumme Kanne im östlichen Hafenviertel. Die frühere Hausgeschichte ist nicht einzeln überliefert.',
  svathamar: 'Bürgerliche Familie aus Rorikshall in Aldrimar, heute in Gwynthor ansässig. Hrolf blieb nach dem Großen Krieg bei seinen Kameraden; Ketil und Runa folgten ihm. Hrolf heiratete Eirian Trevoryn. Die unbekannte ältere Abstammung wird durch einen Zeitsprung von der belegten Familie getrennt.',
  dubhdarach: 'Albische Bürgerfamilie aus Leitheach, seit der Gründung der Krummen Kanne in Gwynthor ansässig. Aedan heiratete 1724 die einheimische Cenyri Mair. Ihre gemeinsamen Kinder heißen Neifion und Eirlys; Caradog Tonnarth ist Mairs älterer Sohn und Aedans Stiefsohn.'
};

function buildFamily(definition) {
  const { slug, title } = definition;
  const houseId = `house-${slug}`;
  const base = createFounderTimeJumpPlaceholderHouseFamily({ id: `haus-${slug}`, title: `Haus ${title}`, emblem: emblem(title), houseProfile: GWYNTHOR_COMMONER_HOUSE_PROFILES[slug], description: histories[slug], toYear: slug === 'trevoryn' ? '1672' : '1694', timeJumpLabel: 'Nicht einzeln überlieferte Generationen', pendingDescendantReview: false });
  const persons = base.persons.map((p, i) => ({ ...p, name: i ? 'Unbekannte Gründerin' : 'Unbekannter Gründer', birth: '', death: '????', notes: 'Historischer Ursprung des Hauses. Namen, Lebensdaten und die Generationen bis zum belegten Familienzweig sind unbekannt.' }));
  const partnerships = base.partnerships.map(p => ({ ...p, status: 'ended', certainty: 'unknown' }));
  const parentages = [];
  const add = (...keys) => keys.forEach(key => persons.push(kanneFamilyPerson(key)));
  const marriage = (key, counterpartFamilyId = '') => {
    const m = KANNE_MARRIAGES[key];
    partnerships.push(createMarriage(m.id, ...m.people.map(pid), { start: m.start, notes: 'Gemeinsamer Haushalt in der Krummen Kanne, Gwynthor.', extensions: counterpartFamilyId ? { crossFamilyRelationship: { linkId: m.id, counterpartFamilyId } } : {} }));
    parentages.push(...createParentages(m.children.map(pid), m.people.map(pid), m.id));
  };
  let roots;
  if (slug === 'trevoryn') {
    const father = 'vater-trevoryn-kanne';
    persons.push(unknown(father, 'Unbekannter Vater', 'male', houseId, 'Verstorbener Ehemann Nestwens und Vater Merriks, Eirians und Elidyrs. Name und Lebensdaten nicht überliefert; nicht mit dem historischen Gründer identisch.'));
    add('nestwen', 'merrik', 'eirian', 'elidyr', 'celyn', 'cadri', 'enlli', 'hrolf', 'styr', 'heledd');
    partnerships.push(createMarriage('marriage-eltern-trevoryn-kanne', father, pid('nestwen'), { status: 'ended', notes: 'Durch den Tod des Vaters beendet.' }));
    parentages.push(...createParentages(['merrik', 'eirian', 'elidyr'].map(pid), [father, pid('nestwen')], 'marriage-eltern-trevoryn-kanne'));
    marriage('merrik'); marriage('hrolf', 'haus-svathamar'); roots = [father];
  } else if (slug === 'svathamar') {
    const father = 'vater-svathamar-kanne', mother = 'mutter-svathamar-kanne';
    persons.push(unknown(father, 'Unbekannter Vater', 'male', houseId, 'Vater Hrolfs, Ketils und Runas aus Rorikshall. Name und Lebensdaten unbekannt.'), unknown(mother, 'Unbekannte Mutter', 'female', houseId, 'Mutter der drei Svathamar-Geschwister. Name und Lebensdaten unbekannt.'));
    add('hrolf', 'ketil', 'runa', 'eirian', 'styr', 'heledd');
    partnerships.push(createMarriage('marriage-eltern-svathamar-kanne', father, mother, { status: 'ended', notes: 'Nicht mehr lebende Elterngeneration; genaue Lebensdaten unbekannt.' }));
    parentages.push(...createParentages(['hrolf', 'ketil', 'runa'].map(pid), [father, mother], 'marriage-eltern-svathamar-kanne'));
    marriage('hrolf', 'haus-trevoryn'); roots = [father];
  } else {
    add('aedan', 'mair', 'neifion', 'eirlys', 'caradog');
    persons.push(createFamilyPerson({ id: 'gareth-tonnarth', worldPersonId: 'person--haus-tonnarth--gareth-tonnarth', name: 'Gareth Tonnarth', sex: 'male', birth: '1695', houseId: 'house-tonnarth', familyRole: 'affair', title: 'Caradogs leiblicher Vater', notes: 'Beendete Verbindung mit Mair; kein Ehemann Mairs und kein Angehöriger der Dubhdarach-Linie.' }));
    partnerships.push(createMarriage('affair-gareth-mair-tonnarth', 'gareth-tonnarth', pid('mair'), { type: 'affair', status: 'ended', notes: 'Gareths beendete Affäre mit Mair; aus ihr ging Caradog hervor.', extensions: { crossFamilyRelationship: { linkId: 'affair-gareth-mair-tonnarth', counterpartFamilyId: 'haus-tonnarth' } } }));
    parentages.push(...createParentages([pid('caradog')], ['gareth-tonnarth', pid('mair')], 'affair-gareth-mair-tonnarth', { legitimacy: 'legitimized', notes: 'Caradog wurde als Kind im Haus Tonnarth anerkannt.', extensions: { registryManagedFields: ['legitimacy', 'notes'] } }));
    marriage('aedan', 'haus-tonnarth'); roots = [pid('aedan')];
  }
  parentages.unshift(...createParentages(roots, base.partnerships[0].participantIds, base.lineage.founderPartnershipId, { type: 'claimed', certainty: 'unknown', notes: 'Abstammung über unbekannte Generationen, keine unmittelbare Elternschaft des historischen Gründerpaares.', extensions: { timeJumpId: base.timeJumps[0].id } }));
  const related = [...new Set(persons.map(p => p.houseId).filter(id => id && id !== houseId))].map(id => { const name = id.replace('house-', ''); return { id, name: `Haus ${name[0].toUpperCase()}${name.slice(1)}`, status: 'active', emblem: emblem(name[0].toUpperCase() + name.slice(1)) }; });
  const family = { ...base, houses: [...base.houses, ...related], persons, partnerships, parentages,
    timeJumps: [{ ...base.timeJumps[0], childIds: roots, fromYear: '', toYear: slug === 'svathamar' ? '' : base.timeJumps[0].toYear, extensions: { preparedPlaceholder: false } }],
    view: { ...base.view, limitGenerations: false },
    extensions: { blankFamily: false, sourceRevision: slug === 'trevoryn' ? 3 : 2, registryManagedDocumentFields: ['description'], sourceNote: 'Nutzervorgaben zur Krummen Kanne vom 14.10.2026. Caradog bleibt Schreiber und Adjutant der Tiefenwyrm; sein Porträt und seine Anerkennung im Haus Tonnarth folgen seinem bestehenden Almanach-Profil. Personenidentitäten und Abstammung bleiben erhalten.' }
  };
  return Object.freeze(slug === 'trevoryn' ? withMarriedAwayContinuation(family, {
    id: 'married-away-eirian-svathamar', name: 'Haus Svathamar',
    parentPartnershipId: KANNE_MARRIAGES.hrolf.id, childIds: KANNE_MARRIAGES.hrolf.children.map(pid),
    houseId: 'house-svathamar', targetFamilyId: 'haus-svathamar', emblem: emblem('Svathamar'), crestFrame: 'iron',
    notes: 'Eirian heiratete Hrolf Svathamar. Ihre Kinder führen die Svathamar-Linie fort.'
  }) : family);
}

export const KANNE_HOUSE_FAMILIES = Object.freeze(KANNE_FAMILY_DEFINITIONS.map(buildFamily));
