import { createHouseholdCompanion } from './household-companion-profiles.js';
import { TROETZLI_PEOPLE, TROETZLI_PORTRAIT } from '../../gwynthor-troetzli/troetzli-household.mjs';

const owner = TROETZLI_PEOPLE.cynddelw;
const description = 'Trötzli ist Cynddelw Llythfors hellbrauner, beigefarbener Rhyfel-Hengst. Erwachsen und kräftig, mit pelzigen Fesseln, vielen alten vollständig verheilten Narben und kurz gehaltenem, militärisch geflochtenem Langhaar. Er wirkt schreckhaft und abgekämpft und ist gegenwärtig nicht verlässlich reitbar. Warum er so reagiert und woher seine Verletzungen stammen, ist nicht bekannt.';
const base = createHouseholdCompanion({
  profile: 'horse', slug: 'troetzli', name: 'Trötzli', ownerSlug: 'cynddelw',
  ownerId: owner.worldPersonId, ownerName: owner.name,
  species: 'Rhyfel-Hengst', level: 3, scores: [16, 12, 14, 2, 12, 8],
  location: 'Gwynthor', house: 'Haus Llythfor', habitat: 'Gwynthor · Überführung zum Penrudd-Hof geplant',
  portrait: TROETZLI_PORTRAIT, description,
});

export const TROETZLI_CREATURE_SOURCE = {
  ...base,
  bestiaryReference: { id: 'tiere/pferde/rhyfel', name: 'Rhyfel', url: '/Bestiarium/tiere/pferde/rhyfel/index.html' },
  combatProfile: { ...base.combatProfile,
    // The generic horse's riding description would contradict this individual.
    abilities: [{ id: 'troetzli-schreckreaktion', name: 'Schreckhafte Abwehr', activationType: 'passive',
      active: true, combatUsable: false,
      description: 'Reagiert auf Überforderung rasch mit Flucht, Beißen oder Ausschlagen. Lässt sich derzeit nicht sicher reiten; ruhiger Umgang und ein gelungener Transport sind keine sofortige Heilung seiner Schwierigkeiten.' }],
  },
  biography: {
    ...base.biography, summary: description,
    appearance: 'Hellbraunes bis beigefarbenes Fell, kräftiger gesunder Rhyfel-Körper mit natürlichen weicheren Konturen. Dicht behaarte Fesseln. Kurze geschorene und geflochtene Mähne, kurz gehaltener militärisch geflochtener Schweif. Viele alte Biss-, Brand-, Stich-, Hieb- und Krallennarben, sämtlich vollständig verheilt; keine frischen Wunden.',
    personality: 'Schreckhaft, misstrauisch und schnell überfordert. Seine heftige Abwehr kann Menschen gefährden. Er ist weder ein böses Tier noch bereits ein verlässliches Reitpferd.',
    history: 'Cynddelw kaufte den Hengst einem Söldner für 500 Kupfer ab. Weil sein alter Hest nicht mehr lange für Reisen taugt, hielt er das kräftige erwachsene Pferd zunächst für eine günstige Anschaffung. Seine Tochter Eirlys nannte es Trötzli, weil es trotzig wirkte. Cynddelw kann die Verhaltensprobleme nicht guten Gewissens verschweigen und fand deshalb keinen Käufer. Beim letzten eigenen Führversuch verfehlte ihn ein Huf nur knapp am Kopf; die Stadtwache brauchte sechs Stunden, um den entlaufenen Hengst zurückzubringen. Tudur Penrudd weiß Bescheid und ist bereit, dem Pferd auf seinem Hof Platz und Ruhe zu geben. Der Transport steht noch aus. Weder Misshandlung durch den Verkäufer noch bestimmte Kriegserlebnisse sind gesichert.',
    bonds: `Besitzer: ${owner.name}. Benannt von dessen Tochter Eirlys. Geplante Unterbringung bei Tudur Penrudd; dadurch wechselt der Besitz nicht automatisch.`,
    facts: [{ label: 'Rasse', value: 'Rhyfel' }, { label: 'Geschlecht', value: 'Hengst' },
      { label: 'Alter', value: 'Erwachsen, in der Blüte seines Lebens; genaues Alter unbekannt' },
      { label: 'Besitzer', value: owner.name }, { label: 'Kaufpreis', value: '500 Kupfer' },
      { label: 'Reitbarkeit', value: 'Derzeit nicht verlässlich reitbar' }, { label: 'Ziel', value: 'Penrudd-Hof · Tudur ist unterrichtet' }],
    traits: [{ title: 'Alte Narben', detail: 'Sichtbare verheilte Verletzungen, keine frischen Wunden. Ihre genaue Geschichte ist unbekannt.' },
      { title: 'Schreckhafte Abwehr', detail: 'Braucht geduldigen, erfahrenen Umgang. Der Auftrag verlangt eine sichere Überführung, keine Zähmung auf Zeit.' }],
    connections: [{ type: 'connection', name: owner.name, image: owner.portrait, detail: 'Besitzer · Berichterstatter bei Celtigerns Echo' },
      { type: 'connection', name: 'Tudur Penrudd', detail: 'Schwiegervater des Besitzers; erwartet das Pferd auf dem Penrudd-Hof' }],
  },
};
