import { createHouseholdCompanion } from './household-companion-profiles.js?v=20261012-ship-cats-v1';
import { TREVOR_CHARACTER_ID } from './idwal-ship-cats.js?v=20261012-ship-cats-v1';

export const HUW_CHARACTER_ID = 'person--haus-gwyvern--huw-gwyvern';
export const TEGWEN_CHARACTER_ID = 'person--haus-gwyvern--tegwen-gwyvern';
const ART = '/AleriaAlmanach/assets/companions/haus-gwyvern';

const horses = [
  {
    slug: 'struppi', name: 'Struppi', ownerSlug: 'trevor', ownerId: TREVOR_CHARACTER_ID,
    ownerName: 'Trevor Gwyvern', sex: 'Hengst', level: 3,
    appearance: 'Kupferbrauner Fuchs mit langer, wilder Flachsmähne und hellem Schweif. Breite weiße Blesse, helle Fesselabzeichen und frech gebleckte Zähne; kräftiger Rhyfel-Körperbau.',
    personality: 'Frech, aufbrausend und selbstbewusst. Struppi testet Grenzen, scharrt ungeduldig und zeigt deutlich, wenn ihm etwas nicht passt. Unter vertrauter Führung bleibt er ein ausdauerndes, belastbares Reitpferd.',
    description: 'Struppi ist Sir Trevor Gwyverns Rhyfel-Hengst: ein kupferbrauner Fuchs mit heller, zerzauster Mähne, breiter Blesse und frechem, aggressivem Auftreten.'
  },
  {
    slug: 'dyreth', name: 'Dyreth', ownerSlug: 'huw', ownerId: HUW_CHARACTER_ID,
    ownerName: 'Huw Gwyvern', sex: 'Hengst', level: 3,
    appearance: 'Dunkler Eisenschimmel mit kräftiger Äpfelung, schwarzer unterer Beinpartie, langer dunkler Mähne und hellem Stirnfleck. Breite Brust, kräftiger Hals und angriffslustig gebleckte Zähne.',
    personality: 'Reizbar, territorial und unerschrocken. Dyreth beobachtet Fremde misstrauisch und weicht einer Herausforderung ungern aus. Mit ruhiger, klarer Führung zeigt er die Robustheit und Ausdauer seiner Rasse.',
    description: 'Dyreth ist Huw Gwyverns Rhyfel-Hengst: ein dunkler, kräftiger Eisenschimmel mit langer schwarzer Mähne, hellem Stirnfleck und aggressivem Temperament.'
  },
  {
    slug: 'uffyrae', name: 'Uffyrae', ownerSlug: 'tegwen', ownerId: TEGWEN_CHARACTER_ID,
    ownerName: 'Tegwen Gwyvern', sex: 'Stute', level: 2,
    appearance: 'Heller Apfelschimmel mit langer silberweißer Mähne und hellem Schweif. Dunkles Maul, dunkle Hufe und sanfter, aufmerksamer Blick; tragfähiger Rücken und kräftige Beine.',
    personality: 'Freundlich, ruhig und aufmerksam. Uffyrae wartet geduldig, sucht vertraute Nähe und reagiert auf behutsame Führung. Ihre Gelassenheit und Trittsicherheit passen zum zuverlässigen Rhyfel.',
    description: 'Uffyrae ist Tegwen Gwyverns Rhyfel-Stute: ein freundlicher, ruhiger heller Apfelschimmel mit silberweißer Mähne und sanftem Blick.'
  }
];

export const GWYVERN_RHYFEL_COMPANIONS = horses.map(spec => {
  const creature = createHouseholdCompanion({ ...spec, profile: 'horse', species: `Rhyfel-${spec.sex}`,
    portrait: `${ART}/${spec.slug}.png`, location: 'Celtigerns Wacht',
    habitat: 'Gwendolyns Ufer, Celtigerns Wacht', house: '' });
  creature.biography = {
    ...creature.biography, appearance: spec.appearance, personality: spec.personality,
    bonds: `Reittier von ${spec.ownerName}.`,
    history: spec.description,
    facts: [{ label: 'Rasse', value: 'Rhyfel' }, { label: 'Geschlecht', value: spec.sex },
      { label: 'Rolle', value: 'Reittier' }, { label: 'Besitzer', value: spec.ownerName }],
    traits: [{ title: 'Robust & ausdauernd', detail: 'Kräftiges, tragfähiges Rhyfel-Reitpferd für Reise, Arbeit und berittenen Dienst.' }],
    connections: [{ type: 'connection', name: spec.ownerName, detail: 'Besitzer und vertraute Bezugsperson' }]
  };
  return creature;
});
