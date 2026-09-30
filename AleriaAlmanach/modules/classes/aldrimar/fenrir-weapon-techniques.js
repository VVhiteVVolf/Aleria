import { createWeaponTechniqueDamageProfile } from '../../combat-styles/weapon-technique-budget.js';

export const FENRIR_WEAPON_TECHNIQUE_IDS = new Set([
  'fenrir-crushing-blow', 'fenrir-shield-bash', 'fenrir-twin-axe-flurry', 'fenrir-spinning-throw'
]);

export function reconcileFenrirWeaponTechnique(entry) {
  if (!FENRIR_WEAPON_TECHNIQUE_IDS.has(entry?.id)) return entry;
  const twin = entry.id === 'fenrir-twin-axe-flurry';
  const throwing = entry.id === 'fenrir-spinning-throw';
  const costs = throwing ? [
    { resourceId: 'reaction', name: 'Reaktion', amount: 1, scope: 'comment' },
    { resourceId: 'special-action', name: 'Besondere Aktion', amount: 1, scope: 'persistent' }
  ] : entry.costs?.length ? entry.costs : [{ resourceId: entry.id === 'fenrir-shield-bash' ? 'bonus-action' : 'action', amount: 1 }];
  const descriptions = {
    'fenrir-crushing-blow': 'Ein schwerer Axthieb. Schaden der geführten Axt plus erreichter Ausbildungswürfel; ein Trefferwurf.',
    'fenrir-shield-bash': 'Ein kurzer Schildstoß: höchstens W4 und halbe positive feste Schadensboni; kein Ausbildungswürfel.',
    'fenrir-twin-axe-flurry': 'Ein gemeinsamer Angriff mit beiden Einhandäxten: beide Waffenwürfel (gewöhnlich 2W6) plus erreichter Ausbildungswürfel. Ein Trefferwurf, feste Boni einmal.',
    'fenrir-spinning-throw': 'Ein verstärkter Wurf mit der geführten Wurfaxt: Waffenbasis plus ein Waffenwürfel für die Besondere Aktion und erreichter Ausbildungswürfel.'
  };
  return { ...entry, costs, ...(throwing ? { activationType: 'reaction' } : {}),
    ...createWeaponTechniqueDamageProfile({ minimumLevel: entry.minimumLevel, allowedClassIds: ['skjaldr'] }, costs),
    ...(twin ? { requiresDualWield: true, followUpAttack: { enabled: false } } : {}),
    description: descriptions[entry.id], effect: descriptions[entry.id], aiInstructions: descriptions[entry.id] };
}
