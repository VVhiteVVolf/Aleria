import { createHouseholdCompanion } from './household-companion-profiles.js';

export const GAIS_OWNER_ID = 'person--haus-wyrm--gais-wyrm';
const source = createHouseholdCompanion({
  slug: 'rabenstolz', name: 'Saithor', ownerSlug: 'gais', ownerName: 'Sir Gais Wyrm', ownerId: GAIS_OWNER_ID,
  profile: 'horse', species: 'Edelsale-Hengst', level: 3, scores: [16, 14, 14, 2, 12, 10],
  portrait: '/AleriaAlmanach/assets/companions/gais/rabenstolz.png', house: 'Haus Wyrm',
  habitat: 'Celtigerns Wacht · Stallungen von Haus Wyrm',
  description: 'Sir Gais Wyrms schwarzer Edelsale-Hengst aus Ceffyl und Sale: elegant, ausdauernd und zuverlässig, mit langer schwarzer Mähne und dichtem Fesselbehang. Ein stolzer Reitgefährte mit überraschender Vorliebe für sorgfältig gefaltete Taschentücher.'
});

export const GAIS_COMPANION = Object.freeze({ ...source, biography: { ...source.biography,
  appearance: 'Schwarzer Hengst mit edel gewölbtem Hals, feinem Ceffyl-Haupt und kräftigem nordischem Körper. Lange schwarze Mähne, voller Schweif und ausgeprägter schwarzer Behang an allen vier Fesseln. Schwarzes Lederzeug, zurückhaltende Messingbeschläge und eine schwarz-goldene Satteldecke.',
  personality: 'Wach, stolz und im Umgang mit seinem vertrauten Reiter zuverlässig. Gais schätzt seine ruhige Ausdauer; Saithor schätzt offenbar Gais’ Taschentücher.',
  history: 'Saithor stammt aus der Edelsale-Zucht, die Sale und Ceffyl verbindet. An Sir Gais Wyrms Seite trägt er das Schwarz und Gold des Hauses Wyrm durch Celtigerns Wacht.',
  habits: 'Lässt sich geduldig pflegen und mustert lose Stoffzipfel mit verdächtigem Interesse.',
  facts: [...source.biography.facts, { label: 'Geschlecht', value: 'Hengst' }, { label: 'Zucht', value: 'Edelsale · Ceffyl × Sale' }, { label: 'Besitzer', value: 'Sir Gais Wyrm' }],
  connections: [{ type: 'connection', name: 'Gais Wyrm', detail: 'Besitzer und vertrauter Reiter' }]
} });
