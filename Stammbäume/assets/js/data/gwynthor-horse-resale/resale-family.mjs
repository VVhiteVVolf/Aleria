import { createFamilyPerson, createMarriage, createParentages } from '../family-record-builders.js';
import { createHouseProfileFromFolderPath } from '../../domain/house-profile.js';
export const RESALE_FAMILY_ID = 'haus-ruddgraen';
export const RESALE_EMBLEM = '../AleriaAlmanach/assets/gwynthor-horse-resale/wappen/ruddgraen-wappen-v1.png';
const person = (id, name, sex, birth, title, notes) => Object.freeze({ id, name, sex, birth: String(birth), status: 'alive', death: '',
  familyId: RESALE_FAMILY_ID, houseId: 'house-ruddgraen', worldPersonId: `person--${RESALE_FAMILY_ID}--${id}`,
  portrait: `../AleriaAlmanach/assets/gwynthor-horse-resale/portraits/${id}-v1.png`, title, notes });
export const RESALE_PEOPLE = Object.freeze([
  person('brannoc-ruddgraen', 'Brannoc Ruddgraen', 'male', 1683, 'Inhaber · Pferdeankauf',
    '57 Jahre. Mürrischer älterer Pferdehändler mit breiter Halbglatze und grau gewordenen rötlichen Haaren an den Seiten. Führt das kleine Gestüt Zum Schiefen Nagel. Kauft kräftige Gebrauchsmischlinge von Bauern, Söldnern und Reisenden an und verkauft sie nach Beobachtung weiter. Seine knappen Antworten und sein Brummen machen Verhandlungen selten gemütlich. Bekannte Eigenheiten und ungeklärte Abstammung müssen trotzdem im Kaufzettel stehen. Eigene Pferdezucht betreibt er nicht.'),
  person('edryssa-ruddgraen', 'Edryssa Ruddgraen', 'female', 1694, 'Kasse · Hofhaushalt',
    '46 Jahre. Brannocs Frau und Mutter der vier Kinder. Rothaarig, blauäugig und häufig schon über die nächste unnötige Ausgabe verärgert. Nörgelt über verschütteten Hafer, offene Tore und Brannocs vermeintliche Schnäppchen. Führt Kasse und Vorräte, erinnert an Zahlungsfristen und lässt sich bei den Futterrechnungen nichts vormachen. Ihr scharfer Ton gehört zum Alltag des eng zusammenarbeitenden Haushalts.'),
  person('telynna-ruddgraen', 'Telynna Ruddgraen', 'female', 1717, 'Ankaufsprüfung · Pferdebeurteilung',
    '23 Jahre. Älteste Tochter Brannocs und Edryssas. Attraktive erwachsene Cenyri mit kupferrotem Zopf und blauen Augen. Prüft bei Ankäufen Gang, Hufe, Gewöhnung und erkennbare Beschwerden. Bleibt bei Vaters Gerede über ein angeblich todsicheres Geschäft beharrlich und sachlich. Sie beobachtet ein Pferd lieber einen weiteren Tag, als aus einer Vermutung eine Zusicherung zu machen.'),
  person('rhonessa-ruddgraen', 'Rhonessa Ruddgraen', 'female', 1719, 'Verkauf · Kaufzettel',
    '21 Jahre. Zweite Tochter, attraktive erwachsene Cenyri mit rötlich braunem Haar, Sommersprossen und blauen Augen. Verhandelt lebhafter als ihr Vater und führt die einzelnen Kauf- und Verkaufszettel. Kann charmant feilschen, hält aber Altersschätzungen und unsichere Herkunft ausdrücklich auseinander. Im kleinen Familienbetrieb ist sie häufig die erste Ansprechpartnerin für Kunden.'),
  person('elvynna-ruddgraen', 'Elvynna Ruddgraen', 'female', 1721, 'Pferdevorstellung · Gewöhnung',
    '19 Jahre. Jüngste Tochter, attraktive erwachsene Cenyri mit leuchtend rotem Haar und blauen Augen. Lebhaft und schlagfertig; führt die Tiere im Ankaufshof vor und arbeitet mit ihnen an ruhigem Führen und Anhalten. Sie verspricht weder Turnierkunst noch Kriegstauglichkeit und kennt die kleinen Angewohnheiten der zum Verkauf stehenden Gebrauchspferde.'),
  person('bedryn-ruddgraen', 'Bedryn Ruddgraen', 'male', 1723, 'Stallhilfe in Ausbildung',
    '17 Jahre. Einziger Sohn und jüngstes der vier Geschwister. Schlaksiger rothaariger Jugendlicher mit blauen Augen. Hilft beim Ausmisten, Wassertragen, Einstreuen und geordneten Ablegen der Futterrationen. Lernt das sichere Führen unter Aufsicht seiner Eltern und Schwestern. Keine eigenständige Verantwortung für Ankaufszusagen oder schwierige Pferde.')
]);
const marriage = createMarriage('marriage-brannoc-edryssa-ruddgraen', RESALE_PEOPLE[0].id, RESALE_PEOPLE[1].id, { status: 'active',
  extensions: { chartAlignChildGroupBelowParentPair: true } });
export const HOUSE_RUDDGRAEN_FAMILY = Object.freeze({ schema: 'aleria.family-tree', schemaVersion: 1,
  document: { id: RESALE_FAMILY_ID, title: 'Familie Ruddgraen', motto: '', emblem: RESALE_EMBLEM,
    description: 'Der sechsköpfige Gwynthorer Haushalt hinter dem kleinen Pferdehandel Zum Schiefen Nagel. Keine eigene Zucht und keine Sattlerei.',
    houseProfile: createHouseProfileFromFolderPath(['Cenyr', 'Celtigerns Wacht', 'Llamreis Ankunft', 'Gwynthor'], { rankId: 'commoner' }) },
  houses: [{ id: 'house-ruddgraen', name: 'Familie Ruddgraen', emblem: RESALE_EMBLEM, status: 'active', motto: '' }],
  persons: RESALE_PEOPLE.map(p => createFamilyPerson({ ...p, lineageRole: p.id === RESALE_PEOPLE[0].id ? 'head' : 'branch',
    familyRole: p.id === RESALE_PEOPLE[1].id ? 'married' : 'core', extensions: { authoredSource: 'gwynthor-horse-resale-20261113' } })),
  partnerships: [marriage], parentages: createParentages(RESALE_PEOPLE.slice(2).map(p => p.id), marriage.participantIds, marriage.id), cadetBranches: [], timeJumps: [],
  lineage: { founderPersonIds: marriage.participantIds, founderPartnershipId: marriage.id, crestSubtitle: 'Gwynthor · Zum Schiefen Nagel', showHouseCrest: true },
  view: { focusPersonId: RESALE_PEOPLE[0].id, ancestorDepth: 2, descendantDepth: 2, limitGenerations: false },
  extensions: { sourceRevision: 1, chartLayoutPolicy: 'strict-v1', sourceNote: 'Nutzerauftrag vom 13.11.2026: billiger reiner Pferdeweiterverkauf, Eltern und vier Kinder. Ältere Verwandte und weitere Besitzverhältnisse sind nicht festgelegt.' }
});
