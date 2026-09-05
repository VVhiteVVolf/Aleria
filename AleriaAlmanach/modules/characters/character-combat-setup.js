import { getCombatStyleTechniquesForGrants } from '../combat-styles/combat-style-registry.js?v=20260905-damage-balance-v1';
import {
  CHARACTER_CREATION_METHODS,
  CHARACTER_CREATION_STEPS,
  POINT_BUY_COSTS,
  applyCharacterCreationDraft,
  createCharacterCreationDraft,
  getCreationBaseAttributes,
  getCreationFinalAttributes,
  getPointBuyRemaining,
  getTemplateGrantedSkills,
  rollAttributeSet,
  setCreationAttributeMethod,
  validateCharacterCreationDraft
} from '../combat/character-creation-model.js?v=20260905-party-combat-v1';
import {
  CHARACTER_ANCESTRY_TEMPLATES,
  CHARACTER_BACKGROUND_TEMPLATES,
  getCharacterCreationTemplate,
  getGroupedCharacterClassTemplates
} from '../combat/character-creation-templates.js?v=20260905-cenyr-character-training-v1';
import { COMBAT_ATTRIBUTE_DEFINITIONS } from '../combat/combat-profile-model.js?v=20260905-party-combat-v1';

let activeSetup = null;

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  })[character]);
}

function selected(value, expected) {
  return String(value || '') === String(expected || '') ? ' selected' : '';
}

function checked(value) {
  return value ? ' checked' : '';
}

function templateOptions(templates, value, placeholder) {
  return `<option value="">${escapeHtml(placeholder)}</option>${templates.map(template => (
    `<option value="${escapeHtml(template.id)}"${selected(value, template.id)}>${escapeHtml(template.label)}</option>`
  )).join('')}`;
}

function classTemplateOptions(value) {
  return `<option value="">Klasse auswählen …</option>${[...getGroupedCharacterClassTemplates()].map(([group, templates]) => (
    `<optgroup label="${escapeHtml(group)}">${templates.map(template => (
      `<option value="${escapeHtml(template.id)}"${selected(value, template.id)}>${escapeHtml(template.label)} · ${escapeHtml(template.subtitle)}</option>`
    )).join('')}</optgroup>`
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
    ${skills.length ? `<small>Geübt: ${escapeHtml(skills.join(', '))}</small>` : ''}
    ${proficiencies.armor?.length ? `<small>Rüstung: ${escapeHtml(proficiencies.armor.join(', '))}</small>` : ''}
    ${proficiencies.weapons?.length ? `<small>Waffen: ${escapeHtml(proficiencies.weapons.join(', '))}</small>` : ''}
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
      <label><span>Klasse / Archetyp</span><select data-creation-field="classId">${classTemplateOptions(draft.selections.classId)}</select></label>
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

function renderSkillsStep(draft, profile) {
  const granted = new Set(getTemplateGrantedSkills(draft).map(name => name.toLocaleLowerCase('de')));
  return `<section class="cp-setup-step">
    <header><span>Schritt 3</span><h3>Fertigkeiten vorbereiten</h3><p>Geübte Fertigkeiten erhalten auf Stufe 1 den Kompetenzbonus +2. Die Attributsbindung bleibt strukturiert erhalten.</p></header>
    <div class="cp-setup-skill-grid">${profile.skills.map(skill => {
      const trained = granted.has(String(skill.name || '').toLocaleLowerCase('de'))
        || (skill.name === 'Überreden' && granted.has('überzeugen'));
      const attribute = COMBAT_ATTRIBUTE_DEFINITIONS.find(item => item.key === skill.attributeKey);
      return `<article class="${trained ? 'is-trained' : ''}"><span>${trained ? '◆' : '◇'}</span><div><strong>${escapeHtml(skill.name)}</strong><small>${escapeHtml(attribute?.label || skill.attributeKey)}</small></div><b>${trained ? 'Geübt' : 'Ungeübt'}</b></article>`;
    }).join('')}</div>
    <p class="cp-setup-rule-note">Vorlagen gewähren: ${escapeHtml(getTemplateGrantedSkills(draft).join(', ') || 'keine festen Fertigkeiten')}.</p>
  </section>`;
}

function renderEquipmentStep(draft) {
  const classTemplate = getCharacterCreationTemplate('class', draft.selections.classId);
  if (!classTemplate) return `<section class="cp-setup-step"><header><span>Schritt 4</span><h3>Kampfausbildung</h3></header><div class="cp-setup-empty">Wähle im ersten Schritt eine Klasse oder überspringe diesen Abschnitt.</div></section>`;
  const startingTechniques = getCombatStyleTechniquesForGrants(classTemplate.combatStyleGrants, 1);
  return `<section class="cp-setup-step">
    <header><span>Schritt 4</span><h3>${escapeHtml(classTemplate.label)} · Kampfausbildung</h3><p>${escapeHtml(classTemplate.description)}</p></header>
    <div class="cp-setup-package-grid">
      <article><span>Trefferwürfel</span><strong>${classTemplate.hitDie ? `W${classTemplate.hitDie}` : 'Noch offen'}</strong><small>${classTemplate.hitDie ? 'Bestimmt die Trefferpunkte auf Stufe 1.' : 'Der vorhandene Bogenwert bleibt bestehen.'}</small></article>
      <article><span>Rettungswürfe</span><strong>${escapeHtml((classTemplate.savingThrowProficiencies || []).map(key => COMBAT_ATTRIBUTE_DEFINITIONS.find(attribute => attribute.key === key)?.label || key).join(', ') || (classTemplate.rulesStatus === 'partial' ? 'Noch offen' : 'Keine'))}</strong></article>
      <article><span>Rüstungen</span><strong>${escapeHtml((classTemplate.proficiencies?.armor || []).join(', ') || (classTemplate.rulesStatus === 'partial' ? 'Noch offen' : 'Keine'))}</strong></article>
      <article><span>Waffenausbildung</span><strong>${escapeHtml((classTemplate.proficiencies?.weapons || []).join(', ') || (classTemplate.rulesStatus === 'partial' ? 'Noch offen' : 'Keine'))}</strong></article>
    </div>
    <div class="cp-setup-loadout">
      <h4>Startausrüstung</h4>
      ${(classTemplate.weapons || []).map(item => `<span>⚔ <strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(item.damageFormula.toUpperCase().replace(/D/g, 'W'))} ${escapeHtml(item.damageType)}</small></span>`).join('')}
      ${(classTemplate.armorItems || []).map(item => `<span>⬟ <strong>${escapeHtml(item.name)}</strong><small>Grund-RK ${item.baseArmorClass}</small></span>`).join('')}
      ${classTemplate.magic?.enabled ? `<span>✦ <strong>Magiebegabt</strong><small>${escapeHtml(classTemplate.magic.notes)}</small></span>` : ''}
    </div>
    ${startingTechniques.length ? `<div class="cp-setup-loadout"><h4>Ausbildung · Stufe 1</h4>${startingTechniques.map(technique => `<span>✦ <strong>${escapeHtml(technique.name)}</strong><small>${escapeHtml(technique.trainingForm)} · ${escapeHtml(technique.requirements)}</small></span>`).join('')}</div>` : ''}
    <label class="cp-setup-check"><input type="checkbox" data-creation-field="replaceStartingEquipment"${checked(draft.replaceStartingEquipment)}> Frühere Vorlagen-Ausrüstung ersetzen; selbst angelegte Gegenstände bleiben erhalten.</label>
  </section>`;
}

function resourceCard(icon, name, current, maximum, rule) {
  return `<article><span>${icon}</span><div><strong>${escapeHtml(name)}</strong><b>${current} / ${maximum}</b><small>${escapeHtml(rule)}</small></div></article>`;
}

function renderResourcesStep(draft) {
  return `<section class="cp-setup-step">
    <header><span>Schritt 5</span><h3>Verbindliche Stufe-1-Grundlage</h3><p>Diese Werte sind die gemeinsame Ausgangslage für Charakterbogen, Szene, Kampfregeln und AleriaGPT.</p></header>
    <div class="cp-setup-resource-grid">
      ${resourceCard('●', 'Aktion', 1, 1, 'Neu bei jedem Gesamtkommentar')}
      ${resourceCard('▲', 'Bonusaktion', 1, 1, 'Neu bei jedem Gesamtkommentar')}
      ${resourceCard('◆', 'Reaktion', 1, 1, 'Neu bei jedem Gesamtkommentar')}
      ${resourceCard('★', 'Besondere Aktion', 2, 2, 'Erst am nächsten Aleria-Tag')}
      ${resourceCard('◎', 'Aura-Fokuspunkt', 0, 0, 'Tagesgebundener Universalpunkt')}
      ${resourceCard('✦', 'Mana', 0, 0, 'Erst am nächsten Aleria-Tag')}
      ${resourceCard('◈', 'Fokus', 0, 0, 'Erst am nächsten Aleria-Tag')}
      ${resourceCard('☀', 'Celestiale Punkte', 0, 0, 'Erst am nächsten Aleria-Tag')}
      ${resourceCard('♨', 'Infernale Punkte', 0, 0, 'Erst am nächsten Aleria-Tag')}
      ${resourceCard('⚔', 'Paktpunkte', 0, 0, 'Erst am nächsten Aleria-Tag')}
      ${resourceCard('✧', 'Inspiration', 0, 1, 'Wird gezielt vergeben')}
    </div>
    <div class="cp-setup-slots"><span>Zaubertricks <b>∞</b></span>${Array.from({ length: 10 }, (_entry, index) => `<span>Grad ${index + 1} <b>0 / 0</b></span>`).join('')}</div>
    <label class="cp-setup-check"><input type="checkbox" data-creation-field="resetLevelOne"${checked(draft.resetLevelOne)}> Figur auf Stufe 1, 0 EP und die gezeigten Grundressourcen setzen.</label>
  </section>`;
}

function renderReviewStep(draft) {
  const skipped = new Set(draft.skippedSteps || []);
  const ancestry = getCharacterCreationTemplate('ancestry', draft.selections.ancestryId);
  const background = getCharacterCreationTemplate('background', draft.selections.backgroundId);
  const classTemplate = getCharacterCreationTemplate('class', draft.selections.classId);
  const final = getCreationFinalAttributes(draft);
  const errors = validateCharacterCreationDraft(draft);
  return `<section class="cp-setup-step cp-setup-review">
    <header><span>Schritt 6</span><h3>Stufe-1-Bogen prüfen</h3><p>Erst „In den Entwurf übernehmen“ verändert den geöffneten Charakterbogen. Dauerhaft gespeichert wird weiterhin mit „Figur speichern“.</p></header>
    ${errors.length ? `<div class="cp-setup-errors">${errors.map(error => `<p>${escapeHtml(error)}</p>`).join('')}</div>` : ''}
    <div class="cp-setup-review-grid">
      <article><span>Ausgang</span><strong>${escapeHtml(ancestry?.label || '—')} · ${escapeHtml(background?.label || '—')} · ${escapeHtml(classTemplate?.label || '—')}</strong><small>${skipped.has('templates') ? 'Dieser Schritt wird nicht angewandt.' : 'Vorlagen werden verknüpft.'}</small></article>
      <article><span>Attribute</span><strong>${COMBAT_ATTRIBUTE_DEFINITIONS.map(attribute => `${attribute.shortLabel} ${final[attribute.key]}`).join(' · ')}</strong><small>${skipped.has('attributes') ? 'Vorhandene Werte bleiben bestehen.' : CHARACTER_CREATION_METHODS.find(method => method.id === draft.attributeMethod)?.label}</small></article>
      <article><span>Fertigkeiten</span><strong>${escapeHtml(getTemplateGrantedSkills(draft).join(', ') || 'Keine Vorlagenfertigkeiten')}</strong><small>${skipped.has('skills') ? 'Vorhandene Ausbildung bleibt bestehen.' : 'Wird als geübt markiert.'}</small></article>
      <article><span>Kampf & Ressourcen</span><strong>${escapeHtml(classTemplate?.subtitle || 'Keine Klasse')} · ${draft.resetLevelOne ? 'Stufe 1' : 'Stufe bleibt bestehen'}</strong><small>${skipped.has('equipment') ? 'Keine Klassen-Ausrüstung.' : 'Startpaket wird ergänzt.'} ${skipped.has('resources') ? 'Ressourcen bleiben bestehen.' : 'Grundressourcen werden gesetzt.'}</small></article>
    </div>
  </section>`;
}

function renderStepBody(setup) {
  const step = CHARACTER_CREATION_STEPS[setup.draft.stepIndex];
  if (step.id === 'templates') return renderTemplateStep(setup.draft);
  if (step.id === 'attributes') return renderAttributeStep(setup.draft);
  if (step.id === 'skills') return renderSkillsStep(setup.draft, setup.profile);
  if (step.id === 'equipment') return renderEquipmentStep(setup.draft);
  if (step.id === 'resources') return renderResourcesStep(setup.draft);
  return renderReviewStep(setup.draft);
}

function renderSetup() {
  if (!activeSetup?.root) return;
  const { draft } = activeSetup;
  const step = CHARACTER_CREATION_STEPS[draft.stepIndex];
  const isFirst = draft.stepIndex === 0;
  const isLast = draft.stepIndex === CHARACTER_CREATION_STEPS.length - 1;
  activeSetup.root.innerHTML = `<section class="cp-setup-dialog" role="dialog" aria-modal="true" aria-labelledby="cp-setup-title">
    <header class="cp-setup-head"><div><span>Geführte Charaktererschaffung</span><h2 id="cp-setup-title">${escapeHtml(draft.characterName || 'Neue Figur')} · Starthilfe</h2></div><button type="button" data-creation-action="close" aria-label="Starthilfe schließen">×</button></header>
    <nav class="cp-setup-progress" aria-label="Fortschritt">${CHARACTER_CREATION_STEPS.map((entry, index) => `<button type="button" data-creation-action="go-step" data-step="${index}" class="${index === draft.stepIndex ? 'is-active' : ''} ${(draft.skippedSteps || []).includes(entry.id) ? 'is-skipped' : ''}"><b>${index + 1}</b><span>${escapeHtml(entry.label)}</span></button>`).join('')}</nav>
    <div class="cp-setup-body">${renderStepBody(activeSetup)}</div>
    <footer class="cp-setup-footer">
      <button type="button" data-creation-action="previous"${isFirst ? ' disabled' : ''}>← Zurück</button>
      <span>${activeSetup.notice ? escapeHtml(activeSetup.notice) : `Schritt ${draft.stepIndex + 1} von ${CHARACTER_CREATION_STEPS.length}`}</span>
      <div>
        ${!isLast ? `<button type="button" data-creation-action="skip">Diesen Schritt überspringen</button><button type="button" data-creation-action="next">Weiter →</button>` : `<button type="button" data-creation-action="apply" class="is-primary"${validateCharacterCreationDraft(draft).length ? ' disabled' : ''}>In den Entwurf übernehmen</button>`}
      </div>
    </footer>
  </section>`;
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
  if (!activeSetup || !activeSetup.root.contains(event.target)) return;
  const target = event.target;
  const field = target.dataset.creationField;
  if (field && ['ancestryId', 'backgroundId', 'classId'].includes(field)) {
    activeSetup.draft.selections[field] = target.value;
    markCurrentStepIncluded();
  } else if (field === 'replaceStartingEquipment' || field === 'resetLevelOne') {
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
  renderSetup();
}

function closeSetup() {
  if (!activeSetup) return;
  const { root } = activeSetup;
  root.removeEventListener('click', handleClick);
  root.removeEventListener('change', handleChange);
  document.removeEventListener('keydown', handleEscape);
  root.remove();
  activeSetup = null;
}

function handleEscape(event) {
  if (event.key === 'Escape') closeSetup();
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
  renderSetup();
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
  document.addEventListener('keydown', handleEscape);
  renderSetup();
  root.querySelector('[data-creation-action="close"]')?.focus();
}
