import { createHouseholdCompanion } from './household-companion-profiles.js?v=20261012-ship-cats-v1';

export const DUNCAN_CHARACTER_ID = 'tmfBA2zPTc88EMMGkyyA';
const description = 'Carreg ist das Ritterschimmer-Reitpferd von Sir Duncan Gafyr. Die benannte Zucht vereint Herzogsschimmer und Ceffyl. Sein schieferdunkles Fell, die lange silberweiße Mähne und der helle Schweif stehen im Kontrast zur schwarz-goldenen Gafyr-Schabracke mit Widderwappen.';
const source = createHouseholdCompanion({
  slug: 'carreg', name: 'Carreg', ownerSlug: 'duncan', ownerId: DUNCAN_CHARACTER_ID,
  ownerName: 'Duncan Gafyr', profile: 'horse', species: 'Ritterschimmer', level: 3,
  scores: [18, 14, 14, 2, 12, 12],
  location: 'Celtigerns Wacht', habitat: 'Celtigerns Wacht · bei Sir Duncan Gafyr',
  portrait: '/AleriaAlmanach/assets/companions/haus-gafyr/carreg.png', description
});

export const CARREG_CREATURE_SOURCE = {
  ...source,
  portraitCaption: 'Carreg · Ritterschimmer · Reitpferd von Sir Duncan Gafyr',
  biography: {
    ...source.biography,
    appearance: 'Schieferdunkles Fell, lange silberweiße Mähne und silberweißer Schweif. Kräftiger, tragfähiger Körper mit aufrechter Haltung und aufmerksamem Blick. Braunes Lederzeug und schwarz-goldene Reitdecken mit den Widderwappen des Hauses Gafyr.',
    personality: 'Stolz, aufmerksam und beherrscht. Verbindet die repräsentative Haltung des Herzogsschimmers mit der engen Reiterbindung des Ceffyl. Ein kräftiges Ritterpferd, das auf ruhige und erfahrene Führung anspricht.',
    history: 'Carreg gehört Sir Duncan Gafyr. Seine Zucht aus Herzogsschimmer und Ceffyl trägt den festgelegten Namen Ritterschimmer und ist im Bestiarium-Zuchtbuch eingetragen.',
    bonds: 'Besitzer und Reiter: Sir Duncan Gafyr.',
    facts: [
      { label: 'Rasse / Zucht', value: 'Ritterschimmer' },
      { label: 'Abstammung', value: 'Herzogsschimmer × Ceffyl' },
      { label: 'Rolle', value: 'Reittier' },
      { label: 'Besitzer', value: 'Sir Duncan Gafyr' }
    ],
    traits: [{ title: 'Ritterpferd', detail: 'Kräftiger, tragfähiger Körperbau; stolze Haltung und enge Bindung an einen vertrauten Reiter.' }],
    connections: [{ type: 'connection', name: 'Sir Duncan Gafyr', detail: 'Besitzer und Reiter' }]
  }
};
