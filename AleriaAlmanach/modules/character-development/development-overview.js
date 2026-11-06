import { DEVELOPMENT_TRAITS } from './development-traits.js';
import { getDevelopmentAttackCatalog } from './development-purchases.js';
import { normalizeDevelopment } from './development-state.js';
import { getDevelopmentTraitId } from './development-entry-reference.js';
import { getRetiredDevelopmentTrait, getOwnedRetiredDevelopmentTraits } from './development-retired-traits.js';

const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));

export function renderDevelopmentOverview(preview) {
  const stats = [
    ['Gesamtstufe', preview.after.level],
    ['Max. TP', preview.after.maximumHitPoints],
    ['Kompetenz', `+${preview.after.proficiencyBonus}`],
    ['Neue Attacken', preview.changes.filter(change=>change.key.startsWith('purchase-')).length],
    ['Aktive Merkmale', preview.profile.quirks.filter(trait => trait.active !== false).length],
    ['Balance', `${preview.balance.remaining} P`]
  ];
  return `<div class="development-overview" data-development-role="overview" aria-label="Vorschau der Entwicklung">${stats.map(([name,value]) => `<div><small>${name}</small><strong>${escape(value)}</strong></div>`).join('')}</div>`;
}

export function renderDevelopmentSelections(plan, profile = {}) {
  const attacks = new Map(getDevelopmentAttackCatalog().map(entry => [entry.id, entry]));
  const traits = new Map(DEVELOPMENT_TRAITS.map(trait => [trait.id, trait]));
  getOwnedRetiredDevelopmentTraits(profile).forEach(trait => traits.set(trait.id, { ...trait, name: `${trait.name} (Altbestand)` }));
  const selectedAttacks=[...new Map(plan.purchaseIds.map(id=>attacks.get(id)).filter(Boolean).map(entry=>[entry.technique.id,entry.technique.name])).values()];
  const names = [...selectedAttacks, ...plan.traitIds.map(id => traits.get(id)?.name)].filter(Boolean);
  return `<details class="development-selections" open data-development-role="selections"><summary>Deine Auswahl · ${names.length}</summary>${names.length ? `<ul>${names.map(name => `<li>${escape(name)}</li>`).join('')}</ul>` : '<p>Noch keine neuen Attacken oder Traits ausgewählt.</p>'}<div class="development-toolbar"><button type="button" data-development-action="reset-choices">Neue Auswahl verwerfen</button><button type="button" data-development-action="reset-prices">Standardpreise einsetzen</button></div><small>Zurücksetzen erhält bereits gelernte Attacken und zuvor aktive Traits.</small></details>`;
}

export function handleDevelopmentAction(plan, profile, action) {
  if (action === 'reset-choices') {
    plan.purchaseIds = [];
    plan.traitIds = profile.quirks.filter(q => q.active !== false && (DEVELOPMENT_TRAITS.some(t => t.id === getDevelopmentTraitId(q)) || getRetiredDevelopmentTrait(q))).map(getDevelopmentTraitId);
  } else if (action === 'reset-prices') {
    plan.development = normalizeDevelopment({ purchases: plan.development.purchases });
  } else return false;
  return true;
}
