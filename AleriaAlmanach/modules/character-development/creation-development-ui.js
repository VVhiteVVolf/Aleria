import { COMBAT_ATTRIBUTE_DEFINITIONS } from '../combat/combat-profile-model.js';
import { renderLevelUpActionPools } from '../combat/ui/combat-action-progression-ui.js';
import { renderDevelopmentShop, refreshDevelopmentShop } from './development-ui.js';
import { renderDevelopmentOverview, renderDevelopmentSelections } from './development-overview.js';
import { getCombatResourceIconPresentation } from '../combat/combat-resource-icons.js';

const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
const selected = (a,b) => a === b ? ' selected' : '';
const recommendation = preview => `Empfehlung für den Aufstieg: ${preview.attributePointAllowance} Attributspunkte · ${preview.allocatedAttributePoints} verteilt. Die Verteilung bleibt frei.`;

export function renderCreationDevelopmentStep(preview) {
  const { plan } = preview;
  return `<section class="cp-setup-step"><header><span>Schritt 5 · Dein Weg</span><h3>Stufen, Attacken &amp; Traits</h3><p>Stufe 1 als Grundlage oder mehrere Stufen auf einmal. Jede Attacke bestimmst du selbst; Klassen verteilen keine Ausrüstung.</p></header>
    <div class="cp-level-up-fields">
      <label><span>Ziel-Gesamtstufe</span><input type="number" min="${preview.before.level}" max="30" data-level-up-path="targetLevel" value="${plan.targetLevel}"></label>
      <label><span>TP beim Aufstieg</span><select data-level-up-path="hitPointMode"><option value="recommended"${selected(plan.hitPointMode,'recommended')}>Empfohlene Ableitung</option><option value="manual"${selected(plan.hitPointMode,'manual')}>Manueller Zuwachs</option><option value="unchanged"${selected(plan.hitPointMode,'unchanged')}>Maximum beibehalten</option></select></label>
      <label><span>Manueller Zuwachs + KON je Stufe</span><input type="number" min="0" max="9999" data-level-up-path="manualHitPointGain" value="${plan.manualHitPointGain}"></label>
      <label><span>Erfahrung nach Aufbau</span><input type="number" min="0" data-level-up-path="experience" value="${plan.experience}"></label>
      <label><span>Nächste Stufe bei Erfahrung</span><input type="number" min="1" data-level-up-path="nextLevelExperience" value="${plan.nextLevelExperience??''}" placeholder="Frei festlegen"></label>
      <label class="cp-level-up-check"><input type="checkbox" data-level-up-path="restoreGainedHitPoints"${plan.restoreGainedHitPoints?' checked':''}> Aktuelle TP um den tatsächlichen Maximalzuwachs erhöhen</label>
    </div>
    <p data-development-role="attributes">${recommendation(preview)}</p>
    <div class="cp-level-up-attributes">${COMBAT_ATTRIBUTE_DEFINITIONS.map(attribute => `<label><span>${escape(attribute.label)} zusätzlich +</span><input type="number" min="0" max="10" data-level-up-attribute="${attribute.key}" value="${plan.attributeIncreases[attribute.key]}"></label>`).join('')}</div>
    ${renderDevelopmentShop(preview.baseProfile,preview)}
  </section>`;
}

function resourceResults(preview) {
  const recovery={manual:'Manuell',none:'Keine automatische Erholung',day:'Am nächsten Aleria-Tag',scene:'Je Szene',comment:'Je Beitrag','short-rest':'Kurze Rast','long-rest':'Lange Rast',combat:'Je Kampf'};
  return `<div class="cp-setup-resource-grid">${preview.profile.resources.map(resource => {const icon=getCombatResourceIconPresentation(resource);return `<article>${icon.source?`<img class="creation-resource-icon" src="${escape(icon.source)}" alt="" width="36" height="36" loading="lazy">`:''}<div><strong>${escape(resource.name)}</strong><b>${resource.current} / ${resource.maximum}</b><small>${escape(recovery[resource.recovery]||'Manuell')}</small></div></article>`;}).join('')}</div>`;
}

export function renderCreationResourcesStep(draft, preview) {
  return `<section class="cp-setup-step"><header><span>Schritt 6 · Vorräte</span><h3>Startwerte und freie Anpassungen</h3><p>Klassen- und Stufenregeln berechnen die Grundlage. Zusätzliche Vorräte kannst du getrennt anpassen.</p></header>
    <label class="cp-setup-check"><input type="checkbox" data-creation-field="resetLevelOne"${draft.resetLevelOne ? ' checked' : ''}> Mit einer frischen Stufe-1-Grundlage beginnen und danach die gewählte Zielstufe aufbauen.</label>
    ${renderLevelUpActionPools(preview)}
    <div data-creation-development-role="resources">${resourceResults(preview)}</div>
    <details><summary>Vorräte individuell anpassen</summary><div class="cp-level-up-resources">${preview.baseProfile.resources.filter(resource => !['action','bonus-action','reaction','special-action','aura-focus'].includes(resource.id)).map(resource => `<div><strong>${escape(resource.name)}</strong><label>Aktuell +<input type="number" min="-9999" max="9999" data-level-up-resource="${escape(resource.id)}" data-level-up-resource-property="current" value="${preview.plan.resourceIncreases[resource.id]?.current ?? 0}"></label><label>Maximum +<input type="number" min="-9999" max="9999" data-level-up-resource="${escape(resource.id)}" data-level-up-resource-property="maximum" value="${preview.plan.resourceIncreases[resource.id]?.maximum ?? 0}"></label></div>`).join('')}</div></details>
  </section>`;
}

export function renderCreationDevelopmentReview(preview) {
  return `<div class="development-review"><h4>Gewählte Entwicklung · Gesamtstufe ${preview.after.level}</h4><p>${preview.profile.techniques.length} Attacken im Arsenal · keine automatischen Startattacken oder Ausrüstungspakete.</p>${renderDevelopmentSelections(preview.plan)}</div>`;
}

export function refreshCreationDevelopment(root, preview, target) {
  const overview = root.querySelector('[data-development-role="overview"]');
  if (overview) overview.outerHTML = renderDevelopmentOverview(preview);
  refreshDevelopmentShop(root, preview.baseProfile, preview, target);
  const attributes = root.querySelector('[data-development-role="attributes"]');
  if (attributes) attributes.textContent = recommendation(preview);
  const resources = root.querySelector('[data-creation-development-role="resources"]');
  if (resources) resources.innerHTML = resourceResults(preview);
  const pools = root.querySelector('[data-level-up-role="action-pools"]');
  if (pools) pools.outerHTML = renderLevelUpActionPools(preview);
  const errors = root.querySelector('[data-creation-development-role="errors"]');
  if (errors) errors.innerHTML = preview.errors.map(error => `<p>${escape(error)}</p>`).join('');
  const apply = root.querySelector('[data-creation-action="apply"]');
  if (apply) apply.disabled = !preview.ready;
}
