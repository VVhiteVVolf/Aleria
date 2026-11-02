import { renderDevelopmentOverview, handleDevelopmentAction } from '../character-development/development-overview.js';
import { updateDevelopmentPlan } from '../character-development/development-plan-input.js';
import { renderCreationSkillsStep, renderCreationClassStep, renderCreationClassOptions, getCreationProficiencyLabel } from '../character-development/creation-training-ui.js';
import { updateCreationTrainingChoice, acceptCreationSkillSuggestions, acceptCreationClassSuggestions, getSelectedCreationClasses, createCreationTrainingChoices } from '../character-development/creation-training-model.js';
import { renderCreationDevelopmentStep, renderCreationResourcesStep, renderCreationDevelopmentReview,
  refreshCreationDevelopment } from '../character-development/creation-development-ui.js';
import {
  CHARACTER_CREATION_METHODS,
  CHARACTER_CREATION_STEPS,
  POINT_BUY_COSTS,
  applyCharacterCreationDraft,
  createCharacterCreationDraft,
  getCreationBaseAttributes,
  getCreationFinalAttributes,
  getCreationFoundationOptions,
  previewCharacterCreationDraft,
  getPointBuyRemaining,
  rollAttributeSet,
  setCreationAttributeMethod
} from '../combat/character-creation-model.js?v=20260928-equipment-art-v4';
import {
  CHARACTER_ANCESTRY_TEMPLATES,
  CHARACTER_BACKGROUND_TEMPLATES,
  getCharacterCreationTemplate
} from '../combat/character-creation-templates.js?v=20260909-dragon-parent-v2';
import { COMBAT_ATTRIBUTE_DEFINITIONS } from '../combat/combat-profile-model.js?v=20260928-equipment-art-v4';

let activeSetup = null;

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  })[character]);
}

function selected(value, expected) {
  return String(value || '') === String(expected || '') ? ' selected' : '';
}

function templateOptions(templates, value, placeholder) {
  return `<option value="">${escapeHtml(placeholder)}</option>${templates.map(template => (
    `<option value="${escapeHtml(template.id)}"${selected(value, template.id)}>${escapeHtml(template.label)}</option>`
  )).join('')}`;
}

function attributeBonusText(template) {
  const labels = new Map(COMBAT_ATTRIBUTE_DEFINITIONS.map(attribute => [attribute.key, attribute.label]));
  const bonuses = Object.entries(template?.attributeBonuses || {});
  return bonuses.length
    ? bonuses.map(([key, bonus]) => `${labels.get(key) || key} +${bonus}`).join(' · ')
    : 'Keine festen Attributsboni';
}

function templatePreview(title, template, emptyText) {
  if (!template) return `<article class="cp-setup-template-preview is-empty"><span>${escapeHtml(title)}</span><p>${escapeHtml(emptyText)}</p></article>`;
  const skills = template.skillProficiencies || [];
  const proficiencies = template.proficiencies || {};
  return `<article class="cp-setup-template-preview">
    <span>${escapeHtml(title)}</span>
    <h4>${escapeHtml(template.label)}${template.subtitle ? ` · ${escapeHtml(template.subtitle)}` : ''}</h4>
    <p>${escapeHtml(template.description)}</p>
    ${template.attributeBonuses ? `<strong>${escapeHtml(attributeBonusText(template))}</strong>` : ''}
    ${skills.length ? `<small>Fertigkeitsvorschläge: ${escapeHtml(skills.join(', '))}</small>` : ''}
    ${proficiencies.armor?.length ? `<small>Rüstungsausbildung: ${escapeHtml(proficiencies.armor.map(id=>getCreationProficiencyLabel('armor',id)).join(', '))}</small>` : ''}
    ${proficiencies.weapons?.length ? `<small>Waffenausbildung: ${escapeHtml(proficiencies.weapons.map(id=>getCreationProficiencyLabel('weapons',id)).join(', '))}</small>` : ''}
  </article>`;
}

function renderTemplateStep(draft) {
  const ancestry = getCharacterCreationTemplate('ancestry', draft.selections.ancestryId);
  const background = getCharacterCreationTemplate('background', draft.selections.backgroundId);
  const classTemplate = getCharacterCreationTemplate('class', draft.selections.classId);
  return `<section class="cp-setup-step">
    <header><span>Schritt 1</span><h3>Volk, Hintergrund und Klasse</h3><p>Vorlagen liefern Ausgangswerte. Alles bleibt anschließend im Charakterbogen frei bearbeitbar.</p></header>
    <div class="cp-setup-template-selectors">
      <label><span>Volk / Herkunft</span><select data-creation-field="ancestryId">${templateOptions(CHARACTER_ANCESTRY_TEMPLATES, draft.selections.ancestryId, 'Volk auswählen …')}</select></label>
      <label><span>Hintergrund</span><select data-creation-field="backgroundId">${templateOptions(CHARACTER_BACKGROUND_TEMPLATES, draft.selections.backgroundId, 'Hintergrund auswählen …')}</select></label>
      <label><span>Klasse / Archetyp</span><select data-creation-field="classId">${renderCreationClassOptions(draft.selections.classId,draft)}</select></label>
      ${getCreationFoundationOptions(draft).length ? `<label><span>Grundausbildung des Derwyn</span><select data-creation-field="foundationFormId"><option value="">Grundausbildung wählen …</option>${getCreationFoundationOptions(draft).map(option => `<option value="${escapeHtml(option.formId)}"${selected(draft.foundationFormId, option.formId)}>${escapeHtml(option.name)}</option>`).join('')}</select></label>` : ''}
    </div>
    <div class="cp-setup-template-grid">
      ${templatePreview('Volk', ancestry, 'Noch kein Volk gewählt.')}
      ${templatePreview('Hintergrund', background, 'Noch kein Hintergrund gewählt.')}
      ${templatePreview('Klasse', classTemplate, 'Noch keine Klasse gewählt.')}
    </div>
  </section>`;
}

function renderAttributeScore(attribute, base, final, bonus, controls) {
  return `<article class="cp-setup-attribute">
    <span>${escapeHtml(attribute.label)}</span>
    ${controls}
    <div><small>Basis</small><strong>${base}</strong><i>${bonus ? `+${bonus}` : '+0'}</i><b>${final}</b><small>Endwert</small></div>
  </article>`;
}

function standardAttributeControls(attribute, draft) {
  const value = draft.baseAttributes[attribute.key];
  return `<select data-creation-standard="${attribute.key}" aria-label="${escapeHtml(attribute.label)} zuweisen">${[15, 14, 13, 12, 10, 8].map(score => (
    `<option value="${score}"${selected(value, score)}>${score}</option>`
  )).join('')}</select>`;
}

function pointBuyControls(attribute, draft) {
  const value = Number(draft.baseAttributes[attribute.key]) || 8;
  return `<div class="cp-setup-stepper">
    <button type="button" data-creation-action="point-buy" data-attribute="${attribute.key}" data-delta="-1"${value <= 8 ? ' disabled' : ''}>−</button>
    <strong>${value}</strong>
    <button type="button" data-creation-action="point-buy" data-attribute="${attribute.key}" data-delta="1"${value >= 15 ? ' disabled' : ''}>+</button>
  </div><small>Kosten ${POINT_BUY_COSTS[value] ?? '—'}</small>`;
}

function rolledAttributeControls(attribute, draft) {
  const assigned = draft.rolledAssignments[attribute.key];
  return `<select data-creation-roll-assignment="${attribute.key}" aria-label="Wurfergebnis für ${escapeHtml(attribute.label)}">${draft.rolledPools.map((pool, index) => (
    `<option value="${pool.id}"${selected(assigned, pool.id)}>Wurf ${index + 1}: ${pool.total}</option>`
  )).join('')}</select>`;
}

function freeAttributeControls(attribute, draft) {
  return `<input type="number" min="1" max="40" data-creation-free="${attribute.key}" value="${Number(draft.baseAttributes[attribute.key]) || 10}" aria-label="${escapeHtml(attribute.label)} frei festlegen">`;
}

function renderAttributeStep(draft) {
  const base = getCreationBaseAttributes(draft);
  const final = getCreationFinalAttributes(draft);
  const ancestry = getCharacterCreationTemplate('ancestry', draft.selections.ancestryId);
  const bonuses = ancestry?.attributeBonuses || {};
  const pointRemaining = getPointBuyRemaining(base);
  return `<section class="cp-setup-step">
    <header><span>Schritt 2</span><h3>Attribute verteilen</h3><p>Die gewählte Methode bestimmt die Basiswerte. Volksboni werden erst danach addiert.</p></header>
    <div class="cp-setup-methods">${CHARACTER_CREATION_METHODS.map(method => `<button type="button" data-creation-action="method" data-method="${method.id}" class="${draft.attributeMethod === method.id ? 'is-active' : ''}"><strong>${escapeHtml(method.label)}</strong><small>${escapeHtml(method.description)}</small></button>`).join('')}</div>
    ${draft.attributeMethod === 'point-buy' ? `<div class="cp-setup-budget ${pointRemaining < 0 ? 'is-invalid' : ''}"><span>Verbleibende Punkte</span><strong>${pointRemaining} / 27</strong><small>Werte 14 und 15 kosten zusätzliche Punkte.</small></div>` : ''}
    ${draft.attributeMethod === 'rolled' ? `<div class="cp-setup-rolls"><button type="button" data-creation-action="roll-attributes">⚄ Neu 4W6 würfeln</button>${draft.rolledPools.map((pool, index) => `<span><b>${pool.total}</b><small>Wurf ${index + 1}: ${pool.dice.map((die, dieIndex) => dieIndex === pool.droppedIndex ? `<s>${die}</s>` : die).join(' + ')}</small></span>`).join('')}</div>` : ''}
    <div class="cp-setup-attribute-grid">${COMBAT_ATTRIBUTE_DEFINITIONS.map(attribute => {
      const controls = draft.attributeMethod === 'point-buy'
        ? pointBuyControls(attribute, draft)
        : (draft.attributeMethod === 'rolled'
            ? rolledAttributeControls(attribute, draft)
            : (draft.attributeMethod === 'free' ? freeAttributeControls(attribute, draft) : standardAttributeControls(attribute, draft)));
      return renderAttributeScore(attribute, base[attribute.key], final[attribute.key], Number(bonuses[attribute.key]) || 0, controls);
    }).join('')}</div>
    <p class="cp-setup-rule-note">Endwerte: Basisverteilung ${ancestry ? `+ Volksboni von ${escapeHtml(ancestry.label)}` : '· kein Volk gewählt'}.</p>
  </section>`;
}

function renderReviewStep(draft, preview) {
  const skipped = new Set(draft.skippedSteps || []);
  const ancestry = getCharacterCreationTemplate('ancestry', draft.selections.ancestryId);
  const background = getCharacterCreationTemplate('background', draft.selections.backgroundId);
  const classTemplate = getCharacterCreationTemplate('class', draft.selections.classId);
  const final = getCreationFinalAttributes(draft);
  const errors = preview.errors;
  return `<section class="cp-setup-step cp-setup-review">
    <header><span>Schritt 7</span><h3>Deinen Bogen prüfen</h3><p>Erst „In den Entwurf übernehmen“ verändert den geöffneten Charakterbogen. Dauerhaft gespeichert wird weiterhin mit „Figur speichern“.</p></header>
    ${errors.length ? `<div class="cp-setup-errors">${errors.map(error => `<p>${escapeHtml(error)}</p>`).join('')}</div>` : ''}
    <div class="cp-setup-review-grid">
      <article><span>Ausgang</span><strong>${escapeHtml(ancestry?.label || '—')} · ${escapeHtml(background?.label || '—')} · ${escapeHtml(getSelectedCreationClasses(draft).map(c=>c.label).join(' / ') || '—')}</strong><small>${skipped.has('templates') ? 'Herkunft wird nicht angewandt.' : 'Herkunft und gewählte Ausbildungen werden verknüpft.'}</small></article>
      <article><span>Attribute</span><strong>${COMBAT_ATTRIBUTE_DEFINITIONS.map(attribute => `${attribute.shortLabel} ${final[attribute.key]}`).join(' · ')}</strong><small>${skipped.has('attributes') ? 'Vorhandene Werte bleiben bestehen.' : CHARACTER_CREATION_METHODS.find(method => method.id === draft.attributeMethod)?.label}</small></article>
      <article><span>Fertigkeiten</span><strong>${Object.values(draft.skillChoices).filter(value=>value!=='none').length} manuell gewählte Fertigkeiten</strong><small>${skipped.has('skills') ? 'Vorhandene Ausbildung bleibt bestehen.' : 'Nur deine Auswahl wird angewandt.'}</small></article>
      <article><span>Kampf & Ressourcen</span><strong>${escapeHtml(getSelectedCreationClasses(draft).map(c=>c.label).join(' / ')||'Freie Ausbildung')} · Gesamtstufe ${preview.after.level}</strong><small>Die Ausrüstung bleibt individuell. ${draft.resetLevelOne && !skipped.has('resources') ? 'Frische Grundlage mit gewähltem Aufstieg.' : 'Vorhandene Grundressourcen mit gewählten Anpassungen.'}</small></article>
    </div>
    ${renderCreationDevelopmentReview(preview)}
  </section>`;
}

function renderStepBody(setup, preview) {
  const step = CHARACTER_CREATION_STEPS[setup.draft.stepIndex];
  if (step.id === 'templates') return renderTemplateStep(setup.draft);
  if (step.id === 'attributes') return renderAttributeStep(setup.draft);
  if (step.id === 'skills') return renderCreationSkillsStep(setup.draft, setup.profile, preview);
  if (step.id === 'equipment') return renderCreationClassStep(setup.draft);
  if (step.id === 'development') return renderCreationDevelopmentStep(preview);
  if (step.id === 'resources') return renderCreationResourcesStep(setup.draft, preview);
  return renderReviewStep(setup.draft, preview);
}

function renderSetup({preservePosition=false}={}) {
  if (!activeSetup?.root||activeSetup.rendering) return;
  const setup=activeSetup;
  const previousScroll=preservePosition?activeSetup.root.querySelector('.cp-setup-body')?.scrollTop||0:0;
  const previousDetails=preservePosition?new Map([...activeSetup.root.querySelectorAll('details')].map(details=>[details.querySelector('summary')?.textContent,details.open])):new Map();
  const focused=preservePosition&&activeSetup.root.contains(document.activeElement)?document.activeElement:null;
  const focusSelector=focused?[...focused.attributes].filter(attribute=>attribute.name.startsWith('data-creation-')||attribute.name.startsWith('data-level-up-')).map(attribute=>`[${attribute.name}="${CSS.escape(attribute.value)}"]`).join(''):'';
  const { draft } = activeSetup;
  const isFirst = draft.stepIndex === 0;
  const isLast = draft.stepIndex === CHARACTER_CREATION_STEPS.length - 1;
  const preview = previewCharacterCreationDraft(activeSetup.profile, draft);
  setup.rendering=true;
  try {
  activeSetup.root.innerHTML = `<section class="cp-setup-dialog development-window" role="dialog" aria-modal="true" aria-labelledby="cp-setup-title">
    <header class="cp-setup-head"><div><span>Die Chronik deines Weges · Starthilfe</span><h2 id="cp-setup-title">${escapeHtml(draft.characterName || 'Neue Figur')} · Aufbau &amp; Ausbildung</h2></div><button type="button" data-creation-action="close" aria-label="Starthilfe schließen">×</button></header>
    ${renderDevelopmentOverview(preview)}
    <nav class="cp-setup-progress" aria-label="Fortschritt">${CHARACTER_CREATION_STEPS.map((entry, index) => `<button type="button" data-creation-action="go-step" data-step="${index}" class="${index === draft.stepIndex ? 'is-active' : ''} ${(draft.skippedSteps || []).includes(entry.id) ? 'is-skipped' : ''}"><b>${index + 1}</b><span>${escapeHtml(entry.label)}</span></button>`).join('')}</nav>
    <div class="cp-setup-body">${renderStepBody(activeSetup, preview)}<div class="cp-setup-errors" data-creation-development-role="errors" role="status">${preview.errors.map(error => `<p>${escapeHtml(error)}</p>`).join('')}</div></div>
    <footer class="cp-setup-footer">
      <button type="button" data-creation-action="previous"${isFirst ? ' disabled' : ''}>← Zurück</button>
      <span>${activeSetup.notice ? escapeHtml(activeSetup.notice) : `Schritt ${draft.stepIndex + 1} von ${CHARACTER_CREATION_STEPS.length}`}</span>
      <div>
        ${!isLast ? `<button type="button" data-creation-action="skip">Diesen Schritt überspringen</button><button type="button" data-creation-action="next">Weiter →</button>` : `<button type="button" data-creation-action="apply" class="is-primary"${preview.ready ? '' : ' disabled'}>In den Entwurf übernehmen</button>`}
      </div>
    </footer>
  </section>`;
  activeSetup.root.querySelector('.cp-setup-body').scrollTop=previousScroll;
  for(const details of activeSetup.root.querySelectorAll('details'))if(previousDetails.has(details.querySelector('summary')?.textContent))details.open=previousDetails.get(details.querySelector('summary').textContent);
  if(focusSelector)activeSetup.root.querySelector(focusSelector)?.focus({preventScroll:true});
  } finally {setup.rendering=false;}
}

function changeUniqueStandard(attributeKey, value) {
  const scores = activeSetup.draft.baseAttributes;
  const previous = Number(scores[attributeKey]);
  const wanted = Number(value);
  const otherKey = Object.keys(scores).find(key => key !== attributeKey && Number(scores[key]) === wanted);
  scores[attributeKey] = wanted;
  if (otherKey) scores[otherKey] = previous;
}

function changeUniqueRoll(attributeKey, poolId) {
  const assignments = activeSetup.draft.rolledAssignments;
  const previous = assignments[attributeKey];
  const otherKey = Object.keys(assignments).find(key => key !== attributeKey && assignments[key] === poolId);
  assignments[attributeKey] = poolId;
  if (otherKey) assignments[otherKey] = previous;
}

function markCurrentStepIncluded() {
  const stepId = CHARACTER_CREATION_STEPS[activeSetup.draft.stepIndex].id;
  activeSetup.draft.skippedSteps = activeSetup.draft.skippedSteps.filter(id => id !== stepId);
}

function handleChange(event) {
  if (!activeSetup || activeSetup.rendering || !activeSetup.root.contains(event.target)) return;
  const target = event.target;
  if (updateDevelopmentPlan(activeSetup.draft.developmentPlan, target)) {
    const stepId = CHARACTER_CREATION_STEPS[activeSetup.draft.stepIndex].id;
    if (stepId !== 'review') markCurrentStepIncluded();
    const preview = previewCharacterCreationDraft(activeSetup.profile, activeSetup.draft);
    activeSetup.draft.developmentPlan = preview.plan;
    refreshCreationDevelopment(activeSetup.root, preview, target);
    return;
  }
  const field = target.dataset.creationField;
  if(updateCreationTrainingChoice(activeSetup.draft,target)){
    markCurrentStepIncluded();
  } else if (field && ['ancestryId', 'backgroundId', 'classId'].includes(field)) {
    const prior=activeSetup.draft.selections[field];
    const promotesAdditional=field==='classId'&&activeSetup.draft.additionalClassIds.includes(target.value);
    activeSetup.draft.selections[field] = target.value;
    if(field==='classId'){
      activeSetup.draft.additionalClassIds=activeSetup.draft.additionalClassIds.filter(id=>id!==target.value);
      if(promotesAdditional&&prior&&prior!=='custom')activeSetup.draft.additionalClassIds.push(prior);
      if(target.value==='custom')activeSetup.draft.includeCustomClass=true;
    }
    markCurrentStepIncluded();
  } else if (field === 'foundationFormId') {
    activeSetup.draft.foundationFormId = target.value;
    markCurrentStepIncluded();
  } else if (field === 'resetLevelOne' || field === 'includeCustomClass') {
    activeSetup.draft[field] = target.checked;
    markCurrentStepIncluded();
  } else if (target.dataset.creationStandard) {
    changeUniqueStandard(target.dataset.creationStandard, target.value);
    markCurrentStepIncluded();
  } else if (target.dataset.creationRollAssignment) {
    changeUniqueRoll(target.dataset.creationRollAssignment, target.value);
    markCurrentStepIncluded();
  } else if (target.dataset.creationFree) {
    const key = target.dataset.creationFree;
    activeSetup.draft.baseAttributes[key] = Math.max(1, Math.min(40, Number(target.value) || 1));
    activeSetup.draft.freeAttributes[key] = activeSetup.draft.baseAttributes[key];
    markCurrentStepIncluded();
  } else return;
  activeSetup.notice = '';
  renderSetup({preservePosition:true});
}

function closeSetup() {
  if (!activeSetup) return;
  const { root } = activeSetup;
  root.removeEventListener('click', handleClick);
  root.removeEventListener('change', handleChange);
  root.removeEventListener('input', handleDevelopmentInput);
  document.removeEventListener('keydown', handleEscape);
  root.remove();
  activeSetup = null;
}

function handleEscape(event) {
  if (event.key === 'Escape') closeSetup();
}

function handleDevelopmentInput(event) {
  const target = event.target;
  if(activeSetup&&!activeSetup.rendering&&(target.dataset.creationCustom||target.dataset.creationTrainingList)){
    updateCreationTrainingChoice(activeSetup.draft,target);
    refreshCreationDevelopment(activeSetup.root,previewCharacterCreationDraft(activeSetup.profile,activeSetup.draft),target);
    return;
  }
  if (target.matches('[data-level-up-path], [data-level-up-attribute], [data-level-up-resource]') && target.tagName !== 'SELECT') handleChange(event);
}

function handlePointBuy(button) {
  const key = button.dataset.attribute;
  const delta = Number(button.dataset.delta) || 0;
  const scores = activeSetup.draft.baseAttributes;
  const next = Math.max(8, Math.min(15, (Number(scores[key]) || 8) + delta));
  const candidate = { ...scores, [key]: next };
  if (getPointBuyRemaining(candidate) < 0) {
    activeSetup.notice = 'Für diese Steigerung reichen die 27 Punkte nicht aus.';
    return;
  }
  scores[key] = next;
  activeSetup.notice = '';
  markCurrentStepIncluded();
}

function handleClick(event) {
  const developmentButton = event.target.closest('[data-development-action]');
  if (developmentButton && activeSetup?.root.contains(developmentButton)) {
    if (handleDevelopmentAction(activeSetup.draft.developmentPlan, activeSetup.profile, developmentButton.dataset.developmentAction)) renderSetup();
    return;
  }
  const button = event.target.closest('[data-creation-action]');
  if (!button || !activeSetup?.root.contains(button)) return;
  const action = button.dataset.creationAction;
  if (action === 'close') return closeSetup();
  if (action === 'go-step') activeSetup.draft.stepIndex = Math.max(0, Math.min(CHARACTER_CREATION_STEPS.length - 1, Number(button.dataset.step) || 0));
  if (action === 'previous') activeSetup.draft.stepIndex = Math.max(0, activeSetup.draft.stepIndex - 1);
  if (action === 'next') {
    markCurrentStepIncluded();
    activeSetup.draft.stepIndex = Math.min(CHARACTER_CREATION_STEPS.length - 1, activeSetup.draft.stepIndex + 1);
  }
  if (action === 'skip') {
    const stepId = CHARACTER_CREATION_STEPS[activeSetup.draft.stepIndex].id;
    if (!activeSetup.draft.skippedSteps.includes(stepId)) activeSetup.draft.skippedSteps.push(stepId);
    activeSetup.draft.stepIndex = Math.min(CHARACTER_CREATION_STEPS.length - 1, activeSetup.draft.stepIndex + 1);
  }
  if (action === 'method') {
    activeSetup.draft = setCreationAttributeMethod(activeSetup.draft, button.dataset.method);
    markCurrentStepIncluded();
  }
  if (action === 'point-buy') handlePointBuy(button);
  if(action==='suggest-skills') {acceptCreationSkillSuggestions(activeSetup.draft);markCurrentStepIncluded();}
  if(action==='clear-skills') {activeSetup.draft.skillChoices=Object.fromEntries(Object.keys(activeSetup.draft.skillChoices).map(key=>[key,'none']));markCurrentStepIncluded();}
  if(action==='restore-skills') {activeSetup.draft.skillChoices=createCreationTrainingChoices(activeSetup.profile).skillChoices;markCurrentStepIncluded();}
  if(action==='suggest-training') {acceptCreationClassSuggestions(activeSetup.draft);markCurrentStepIncluded();}
  if (action === 'roll-attributes') {
    activeSetup.draft.rolledPools = rollAttributeSet();
    activeSetup.draft.rolledAssignments = Object.fromEntries(COMBAT_ATTRIBUTE_DEFINITIONS.map((attribute, index) => [attribute.key, activeSetup.draft.rolledPools[index].id]));
    markCurrentStepIncluded();
  }
  if (action === 'apply') {
    const result = applyCharacterCreationDraft(activeSetup.profile, activeSetup.draft);
    if (!result.ok) {
      activeSetup.notice = result.errors.join(' ');
      return renderSetup();
    }
    const onApply = activeSetup.onApply;
    closeSetup();
    onApply?.(result.profile);
    return;
  }
  renderSetup({preservePosition:['point-buy','suggest-skills','clear-skills','restore-skills','suggest-training'].includes(action)});
}

export function openCharacterCombatSetup({ character = {}, profile = {}, onApply } = {}) {
  closeSetup();
  const root = document.createElement('div');
  root.className = 'cp-setup-backdrop';
  root.dataset.characterCreationRoot = 'true';
  document.body.append(root);
  activeSetup = {
    root,
    profile,
    draft: createCharacterCreationDraft(profile, { characterName: character.name }),
    onApply,
    notice: ''
  };
  root.addEventListener('click', handleClick);
  root.addEventListener('change', handleChange);
  root.addEventListener('input', handleDevelopmentInput);
  document.addEventListener('keydown', handleEscape);
  renderSetup();
  root.querySelector('[data-creation-action="close"]')?.focus();
}
