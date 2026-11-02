import { SUBSTANCE_PROFILES } from './substance-profiles.js';
export const HEALTH_STATUS_PRESETS = Object.freeze([
  ...Object.entries(SUBSTANCE_PROFILES).map(([substanceKind, profile]) => ({ id: substanceKind === 'alcohol' ? 'drunk' : `${substanceKind}-intoxication`,
    name: profile.stateName, kind: 'condition', icon: profile.icon, description: profile.description,
    mechanics: profile.mechanics, substanceKind, sceneMinutes: profile.baseMinutes })),
  { id: 'hangover', name: 'Verkatert', kind: 'debuff', icon: '/AleriaAlmanach/assets/development-traits/web/zustand-verkatert.webp',
    description: '−1 auf Fertigkeiten und Initiative. Klingt nach 1–3 Szenenstunden ab; kein Ersatz für den passenden Rausch bei Abhängigkeit.',
    mechanics: { skill: -1, initiative: -1 }, sceneMinutes: 60 }
]);
