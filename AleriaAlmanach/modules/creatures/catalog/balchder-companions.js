import { createHouseholdCompanion } from './household-companion-profiles.js?v=20261013-wolfshorn-v1';

export const ARMEL_BALCHDER_ID = 'person--haus-balchder--armel-balchder';

const argent = createHouseholdCompanion({
  profile: 'horse', slug: 'argent', name: 'Argent', ownerSlug: 'armel',
  ownerId: ARMEL_BALCHDER_ID, ownerName: 'Armel Balchder',
  species: 'Herzogsschimmer', level: 3, scores: [16, 14, 14, 2, 12, 14],
  location: 'Celtigerns Wacht', house: 'Haus Balchder',
  habitat: 'Celtigerns Wacht, Gwynthor',
  portrait: 'https://firebasestorage.googleapis.com/v0/b/aleriaprojekt.firebasestorage.app/o/family-assets%2Fhaus-balchder%2F8f76bed3-1856-4677-a138-bdceb664b3c6%2Foriginal.png?alt=media',
  description: 'Argent ist Sir Armel Balchders Herzogsschimmer: ein zuverlässiges, edles Reitpferd mit matter schwarzer Fellfarbe, silbern auslaufenden Beinen und silbrig glänzenden Hufen. Die voluminöse silberne Mähne wird zu den Spitzen immer weißer. Argent strahlt Grazie aus, bleibt im vertrauten Umgang gelassen und ist nicht übermäßig verspielt.',
  abilities: [['Edle Gelassenheit', 'Reagiert auf geduldige, respektvolle Reiterhilfen. Die sensible Herzogsschimmer-Rasse benötigt sorgfältige Pflege; außergewöhnliche Gefahr verlangt weiterhin passende Proben.']]
});

export const ARGENT_CREATURE_SOURCE = {
  ...argent,
  portraitCaption: 'Argent · Herzogsschimmer · Sir Armel Balchder',
  biography: {
    ...argent.biography,
    appearance: 'Großes, athletisches Pferd mit eleganter Linie und matter schwarzer Fellfarbe. Die unteren Beine gehen in Silber über; die Hufe glänzen silbrig. Dichte, voluminöse silberne Mähne mit einem Verlauf zu weißen Spitzen und ein passender heller Schweif. Ein edler Sattel mit dem Balchder-Emblem ergänzt die gepflegte Erscheinung.',
    personality: 'Edel, zuverlässig und nicht übermäßig verspielt. Im vertrauten Umgang gelassen, zugleich mit dem Stolz und der Sensibilität eines Herzogsschimmers. Argent braucht respektvolle Führung und Aufmerksamkeit.',
    history: 'Sir Armel Balchders persönlicher Herzogsschimmer. Armel schätzt, dass er auf Argent zuverlässig ankommt und dabei ordentlich aussieht. Er zeigt die Qualität seines Pferdes mit erkennbarem Vergnügen; seine Wahl spiegelt Geschmack und praktische Ansprüche wider.',
    bonds: 'Besitzer und Reiter: Sir Armel Balchder, Haus Balchder, Celtigerns Wacht.',
    habits: 'Wird sorgfältig gepflegt. Insbesondere das voluminöse silberne Langhaar braucht regelmäßige Aufmerksamkeit und geduldigen Umgang.',
    facts: [...argent.biography.facts,
      { label: 'Rasse', value: 'Herzogsschimmer' },
      { label: 'Besitz', value: 'Sir Armel Balchder' },
      { label: 'Fellfarbe', value: 'Mattschwarz, zu den Füßen silbern' },
      { label: 'Langhaar', value: 'Voluminös und silbern, zu den Spitzen weiß' },
      { label: 'Ausstattung', value: 'Edelsattel mit Balchder-Emblem' }],
    traits: [{ title: 'Grazie', detail: 'Athletische, edle Erscheinung mit silbernem Langhaar.' },
      { title: 'Verlässlicher Begleiter', detail: 'Gelassen und zuverlässig unter vertrauter, respektvoller Führung.' }],
    connections: [{ type: 'connection', name: 'Armel Balchder',
      image: '/Stammbäume/assets/images/portraits/haus-balchder/armel-balchder.jpg',
      detail: 'Besitzer und Reiter; schätzt Argents Zuverlässigkeit ebenso wie seine edle Erscheinung.' }]
  }
};
