import { createFamilyPerson } from './family-record-builders.js';
import { createHouseProfileFromFolderPath } from '../domain/house-profile.js';
import { muschiPerson } from '../../../../AleriaAlmanach/modules/gestiefelte-muschi/muschi-people.mjs';
const emblem = house => `assets/images/houses/Brevanor/${house}.png`;
function heraldryRecord(id, title, description, rankId, persons = []) {
  return { schema: 'aleria.family-tree', schemaVersion: 1,
    document: { id: `haus-${id}`, title: `Haus ${title}`, emblem: emblem(title), motto: '', description,
      houseProfile: createHouseProfileFromFolderPath(['Brevanor'], { rankId }) },
    houses: [{ id: `house-${id}`, name: `Haus ${title}`, status: 'active', emblem: emblem(title) }],
    persons, partnerships: [], parentages: [], cadetBranches: [], timeJumps: [],
    lineage: { founderPartnershipId: '', houseId: `house-${id}`, crestSubtitle: 'Brevanor', crestEmblemScale: 0.87, crestFrame: 'iron', crestFrameScale: 1, timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' } },
    view: { focusPersonId: persons[0]?.id || '', orientation: 'vertical', ancestorDepth: 4, descendantDepth: 4, limitGenerations: false, showSiblings: true },
    extensions: { blankFamily: persons.length === 0, heraldryOnly: true, sourceRevision: 1,
      sourceNote: 'Autorenauftrag vom 18.10.2026: Wappen und Herkunft in Brevanor vermerken. Keine zusätzlichen Angehörigen, Ehen oder ausgearbeitete Familienlinien erfinden.' } };
}
const helviane = muschiPerson('helviane');
const bielle = heraldryRecord('bielle', 'Bielle',
  'Brevanorisches Brenor- und Winzerhaus (Baronenrang). Helviane Desele wurde als Bielle geboren. Das Wappen zeigt einen Turm mit einer Weinrebe und weißen sowie violetten Trauben; es erinnert an die Rittertradition und die Weingüter der Familie.', 'brenor');
bielle.extensions.sourceRevision = 2;
bielle.extensions.rankSource = 'Nutzerkorrektur vom 30.10.2026 gemäß aktueller Ausarbeitung des Königreichs Brevanor: Brenor (Baron), ersetzt die frühere Einordnung als einfache Ritterfamilie.';
export const HOUSE_BIELLE_FAMILY = Object.freeze(bielle);
const desele = heraldryRecord('desele', 'Desele',
  'Brevanorisches Herstellerhaus für Champagnia und namhafte Parfüme. Helviane, geborene Bielle und angeheiratete Desele, betreibt heute die Gestiefelte Muschi in Gwynthor. Gerettetes Vermögen, Duftrezepte und wenige alte Flaschen gelangten mit ihr über Lothir bis nach Estryll.', 'commoner',
  [createFamilyPerson({ id: helviane.id, worldPersonId: helviane.worldPersonId, name: helviane.name, sex: helviane.sex, birth: helviane.birth,
    houseId: 'house-bielle', familyRole: 'married', title: helviane.role, notes: 'Geborene Bielle. ' + helviane.bio,
    portrait: `../AleriaAlmanach/${helviane.portrait.slice(2)}`, extensions: { registryManagedFields: ['title', 'notes', 'portrait'] } })]);
desele.houses.push({ id: 'house-bielle', name: 'Haus Bielle', status: 'active', emblem: emblem('Bielle') });
export const HOUSE_DESELE_FAMILY = Object.freeze(desele);
