import { renderCombatArsenalSummary } from './combat-profile-actions-view.js';

export const renderPersonalTechniquesSummary = profile => renderCombatArsenalSummary(profile, { personalOnly: true });
