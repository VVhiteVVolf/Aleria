import { HOUSE_MAERLLYS_FAMILY } from '../../../Stammbäume/assets/js/data/house-maerllys-family.js';
import { HOUSE_GWERNANT_FAMILY } from '../../../Stammbäume/assets/js/data/house-gwernant-family.js';

const rhys = HOUSE_MAERLLYS_FAMILY.persons.find(person => person.id === 'rhys-maerllys');
if (!rhys) throw new Error('Die bestehende Weltperson Rhys Maerllys fehlt.');

// Employment belongs to the shop; genealogical identity stays with the family.
export const ELEGANZ_SALES_STAFF = Object.freeze([
  Object.freeze({
    personId: rhys.id,
    worldPersonId: rhys.worldPersonId,
    familyId: HOUSE_MAERLLYS_FAMILY.document.id,
    name: rhys.name,
    age: 1740 - Number(rhys.birth),
    slotId: 'eleganz-post-verkauf-alltag',
    nodeId: 'eleganz-person-rhys-maerllys',
    role: 'Verkauf · Alltag & gute Tuche',
    portrait: './assets/goettliche-eleganz/portraits/rhys-maerllys.png',
    bio: 'Rhys Maerllys berät zu den Alltagsgarnituren und guten Tuchen. Er erklärt die Pflege, prüft vorrätige Größen und stimmt Wünsche nach einer Anprobe mit Maelwen ab.'
  }),
  ...[
    ['catrin-gwernant', 'verkauf-mass', 'Verkauf · Maßaufträge', 'Catrin Gwernant nimmt erste Wünsche zu Maßaufträgen auf, begleitet die Anprobe und hält Änderungen für die Werkstatt fest. Termine und besondere Anliegen stimmt sie mit Maelwen Coeddu ab.'],
    ['efa-gwernant', 'hausmagd', 'Hausmagd · Verkaufsraum & Wäsche', 'Efa Gwernant pflegt Verkaufsraum, Vorhänge und Probiertücher. Sie richtet die Anprobeecke zwischen den Terminen her und stimmt die anfallende Wäschepflege mit Maelwen Coeddu ab. Catrin ist ihre ältere Schwester.']
  ].map(([id, slot, role, bio]) => {
    const person = HOUSE_GWERNANT_FAMILY.persons.find(member => member.id === id);
    if (!person) throw new Error(`Die bestätigte Gwernant-Weltperson ${id} fehlt.`);
    return Object.freeze({ personId: person.id, worldPersonId: person.worldPersonId,
      familyId: HOUSE_GWERNANT_FAMILY.document.id, name: person.name,
      age: 1740 - Number(person.birth), slotId: `eleganz-post-${slot}`, nodeId: `eleganz-person-${id}`,
      role, portrait: `../Stammbäume/${person.portrait}`, bio });
  })
]);

/** Fill only approved sales positions without modifying the supplied trees. */
export function addEleganzSalesStaff(trees) {
  let assigned = 0;
  const result = trees.map(tree => tree.id !== 'verkauf' ? tree : {
    ...tree,
    levels: tree.levels.map(level => ({
      ...level,
      nodes: level.nodes.map(node => {
        const person = ELEGANZ_SALES_STAFF.find(staff => staff.slotId === node.id);
        if (!person) return node;
        assigned += 1;
        return {
          id: person.nodeId,
          title: person.name,
          subtitle: `${person.role} · ${person.age} Jahre`,
          portrait: person.portrait,
          text: `<p>${person.bio}</p>`
        };
      })
    }))
  });
  if (assigned !== ELEGANZ_SALES_STAFF.length) throw new Error('Bestätigte Eleganz-Verkaufsposten fehlen oder sind mehrfach vorhanden.');
  return result;
}
