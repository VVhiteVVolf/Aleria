import { HALENRHYD_PEOPLE, MAELRIG_CAEFFYN } from '../../../Stammbäume/assets/js/data/gwynthor-horse-studs/stud-roster.mjs';
import { AURDDEN_FAMILY_PEOPLE } from '../../../Stammbäume/assets/js/data/aurdden-people.js';
const project = p => ({ ...p, age: Number(p.death || 1740) - Number(p.birth), portrait: p.portrait ? `../Stammbäume/${p.portrait}` : '' });
export const STUD_PEOPLE = Object.freeze([...HALENRHYD_PEOPLE, MAELRIG_CAEFFYN, AURDDEN_FAMILY_PEOPLE.find(p => p.id === 'kyria-aurdden')].map(project));
export function studPerson(id) { const person = STUD_PEOPLE.find(p => p.id === id); if (!person) throw Error(`Unbekannte Gestütsfigur: ${id}`); return person; }
