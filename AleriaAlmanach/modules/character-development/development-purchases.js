import { getCenyrClassDefinitions } from '../classes/cenyr/cenyr-class-registry.js';
import { getCenyrClassProgression } from '../classes/cenyr/cenyr-class-progression.js';
import { getAldrimarClassDefinitions } from '../classes/aldrimar/aldrimar-class-registry.js';
import { getAldrimarClassProgression } from '../classes/aldrimar/aldrimar-class-progression.js';
import { getVennyrClassDefinitions } from '../classes/vennyr/vennyr-class-registry.js';
import { getVennyrClassProgression } from '../classes/vennyr/vennyr-class-progression.js';
import { DEVELOPMENT_TRAITS } from './development-traits.js';
import { normalizeDevelopment, getDevelopmentBalance } from './development-state.js';
import { reviewDevelopmentTraitBalance } from './development-balance-review.js';
import { getCharacterClassIds } from './character-training-state.js';
import { getDevelopmentTraitId, getDevelopmentTechniqueId } from './development-entry-reference.js';
import { getRetiredDevelopmentTrait, getOwnedRetiredDevelopmentTraits } from './development-retired-traits.js';

let catalog;
export function getDevelopmentAttackCatalog() {
  if (!catalog) {
    const sources = [[getCenyrClassDefinitions, getCenyrClassProgression], [getAldrimarClassDefinitions, getAldrimarClassProgression], [getVennyrClassDefinitions, getVennyrClassProgression]];
    catalog = sources.flatMap(([definitions, progression]) => definitions().flatMap(definition => {
      const plan = progression(definition.id, 20);
      return [...new Map((plan?.styles || []).flatMap(style => style.forms.filter(f => !f.blocked&&!['unavailable','eligibility-pending'].includes(f.accessStatus))
        // `live` describes an automatic grant, not whether a confirmed authored
        // technique can be bought. Purchase mode deliberately grants nothing.
        .flatMap(form => form.techniques.filter(technique=>technique.status==='confirmed').map(technique => ({ id: `${definition.id}::${technique.id}`,
          classId: definition.classId, curriculumId: definition.id, className: definition.name, templateId: definition.templateId,
          culture: definition.culture || definition.cultureId, formName: form.shortName || form.name,
          minimumLevel: Math.max(form.minimumLevel || 1, technique.minimumLevel || 1), technique
        })))).map(entry => [entry.id, entry])).values()];
    }));
  }
  return catalog;
}
export function isOwnDevelopmentClass(profile, entry) {
  const selected=getCharacterClassIds(profile);
  if(!selected.length)selected.push(String(profile.identity?.archetype||'').toLowerCase());
  return selected.some(id=>[entry.templateId,entry.classId,entry.curriculumId].includes(id));
}
export function getDevelopmentAttackCost(profile, entry, settings = profile.progression?.development) {
  const state = normalizeDevelopment(settings);
  if(state.purchases.some(p=>p.techniqueId===entry.technique.id))return 0;
  const base = state.ownClassCost + Math.floor((entry.minimumLevel - 1) / 4) * state.levelSurcharge;
  return base * (isOwnDevelopmentClass(profile, entry) ? 1 : state.foreignMultiplier);
}
export function getDevelopmentSummary(profile) {
  const balance = getDevelopmentBalance(profile);
  const retired=getOwnedRetiredDevelopmentTraits(profile).filter(trait=>trait.active!==false);
  const traits=(profile.quirks||[]).filter(q=>q.active!==false).map(q=>DEVELOPMENT_TRAITS.find(t=>t.id===getDevelopmentTraitId(q))).filter(Boolean).concat(retired);
  const review=reviewDevelopmentTraitBalance(profile,traits);
  if (retired.length) review.warnings.push('Gespeicherter Altbestand bleibt mit seiner persönlichen Wirkung und bisherigen Kosten erhalten. Er wird nicht mehr neu angeboten und kann unter Altbestand deaktiviert werden.');
  return { ...balance, ...review, remaining: balance.remaining - review.traitCost };
}
export function applyDevelopmentChoices(profile, plan) {
  const next = structuredClone(profile), errors = [], changes = [];
  const development = normalizeDevelopment({ ...next.progression?.development, ...plan.development });
  next.progression.development = development;
  const known = new Set(next.techniques.map(getDevelopmentTechniqueId));
  const level = next.progression.level + next.progression.specialLevels;
  const catalog = new Map(getDevelopmentAttackCatalog().map(e => [e.id, e]));
  for (const id of [...new Set(plan.purchaseIds || [])]) {
    const entry = catalog.get(id);
    if (!entry) { errors.push(`Unbekannter oder noch nicht freigegebener Kauf: ${id}`); continue; }
    if (known.has(entry.technique.id)) continue;
    if (entry.minimumLevel > level) { errors.push(`${entry.technique.name} ist ab Stufe ${entry.minimumLevel} verfügbar.`); continue; }
    if (next.techniques.length >= 256) { errors.push('Das Arsenal enthält bereits die maximal speicherbaren 256 Techniken.'); continue; }
    const cost = getDevelopmentAttackCost(next, entry, development);
    const paid=development.purchases.some(p=>p.techniqueId===entry.technique.id);
    if(!paid&&development.purchases.length>=256){errors.push('Die Ausbildungsbilanz enthält bereits 256 Kaufbelege. Es wurde kein unbelegter Kauf hinzugefügt.');continue;}
    next.techniques.push({ ...structuredClone(entry.technique), active: true, live: true, status: 'confirmed' });
    if(!paid)development.purchases.push({ techniqueId: entry.technique.id, classId: entry.classId, cost, level });
    known.add(entry.technique.id);
    changes.push({ key: `purchase-${entry.technique.id}`, label: `Attackenkauf · ${entry.className}`, before: '—', after: `${entry.technique.name} (${cost} Punkte)` });
  }
  const selected = new Set(plan.traitIds || []);
  const managed = new Set(DEVELOPMENT_TRAITS.map(t => t.id));
  const ownedRetired = new Set(getOwnedRetiredDevelopmentTraits(profile).map(trait=>trait.id));
  for(const id of selected)if(!managed.has(id)&&!ownedRetired.has(id))errors.push(`Unbekannter Trait: ${id}`);
  const priorIds = new Set(next.quirks.map(q => getDevelopmentTraitId(q)||q.id));
  const signatures=new Set();
  next.quirks = next.quirks.filter(q => {
    const reference=getDevelopmentTraitId(q);
    if (ownedRetired.has(reference) && getRetiredDevelopmentTrait(q)) {
      const active = selected.has(reference);
      if ((q.active !== false) !== active) {
        changes.push({ key: reference, label: active ? 'Altbestand aktiviert' : 'Altbestand deaktiviert', before: q.name, after: active ? 'Aktiv' : 'Inaktiv' });
        q.active = active;
      }
      return true;
    }
    if(!managed.has(reference))return true;
    if(!selected.has(reference))return false;
    const signature=JSON.stringify([reference,q.name,q.description,q.mechanics,q.triggerRules]);
    if(signatures.has(signature)){changes.push({key:`duplicate-${q.id}`,label:'Doppeltes Katalogmerkmal zusammengeführt',before:q.name,after:'Eine Fassung'});return false;}
    signatures.add(signature);return true;
  });
  for (const trait of DEVELOPMENT_TRAITS.filter(t => selected.has(t.id))) {
    const existing = next.quirks.find(q => getDevelopmentTraitId(q) === trait.id);
    if (existing) {
      existing.active = true;
      if(existing.id!==trait.id)existing.developmentTraitId=trait.id;
      if(trait.id==='development-trait-arkaner-fokus'&&existing.mechanics?.attack===-1&&existing.mechanics?.spellAttack===1&&!existing.mechanics.attackScope)existing.mechanics.attackScope='weapon';
      continue;
    }
    if(next.quirks.length>=120){errors.push('Der Bogen enthält bereits 120 Merkmale. Weitere ausgewählte Traits wurden nicht still abgeschnitten.');continue;}
    next.quirks.push(structuredClone(trait));
    changes.push({ key: trait.id, label: 'Trait', before: '—', after: trait.name });
  }
  for (const id of priorIds) if (managed.has(id) && !selected.has(id)) changes.push({ key: id, label: 'Trait entfernt', before: DEVELOPMENT_TRAITS.find(t => t.id === id).name, after: '—' });
  return { profile: next, errors, changes, balance: getDevelopmentSummary(next) };
}
