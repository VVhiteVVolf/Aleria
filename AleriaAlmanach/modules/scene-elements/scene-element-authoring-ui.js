import { SCENE_ELEMENT_TYPES, getSceneElementType, normalizeSceneElementActivation } from './scene-element-model.js';
import { SKILL_DEFINITIONS, normalizeSkillCheckSettings } from '../skill-checks/skill-check-model.js';
import { renderSkillSaveContext } from '../skill-checks/skill-save-context-view.js';
import { sceneElementEscape } from './scene-element-markup.js';
import { renderSceneElementIcon } from './scene-element-icon-view.js';

const escape = sceneElementEscape;
const option = (id, label, current) => `<option value="${escape(id)}"${id === current ? ' selected' : ''}>${escape(label)}</option>`;
const skills = current => SKILL_DEFINITIONS.map(skill => option(skill.id, skill.label, current)).join('');
const senses = current => Object.entries({ '': 'Passender Sinn / gemischt', vision: 'Sehen erforderlich', hearing: 'Hören erforderlich', smell: 'Riechen erforderlich', touch: 'Tasten erforderlich', taste: 'Schmecken erforderlich' }).map(([id, label]) => option(id, label, current)).join('');

export function renderSceneElementTypeEditor() {
  return `<section class="scene-element-types" aria-label="Elementart"><div class="scene-element-type-heading"><span>Was geschieht in der Szene?</span><button type="button" data-scene-element-action="manage">Vorbereitungen verwalten</button></div>
    <div class="scene-element-type-grid">${SCENE_ELEMENT_TYPES.map(type => `<label><input type="radio" name="scene-element-type" value="${type.id}" aria-label="${type.label}" data-se-field="elementType"${type.id === 'challenge' ? ' checked' : ''}><span>${renderSceneElementIcon(type.id, { className: 'scene-element-type-icon' })}<strong><span class="scene-element-type-full">${type.label}</span><span class="scene-element-type-short">${type.shortLabel || type.label}</span></strong><small>${type.description}</small></span></label>`).join('')}</div>
    <p class="scene-element-type-help" data-se-type-help></p></section>`;
}

export function createSceneElementAuthoringEditor(root, { getActors = () => [], getSources = () => [], onChange = () => {} } = {}) {
  let elementType = 'challenge', completionMode = 'all', activation = normalizeSceneElementActivation(), sceneElementId = '';
  let prepared = false, revealed = false;
  const host = root.querySelector('[data-scene-element-activation]');

  function conditionRow(condition, index) {
    const field = name => `data-se-condition="${index}" data-se-field="${name}"`;
    const sourceOptions = [option('', 'Dieses Element', condition.sourceId), ...getSources().map(source => option(source.id, source.title, condition.sourceId))].join('');
    return `<div class="scene-element-condition"><span class="scene-element-condition-number">${index + 1}</span><label><span>Bedingung</span><select ${field('type')}>${option('comments', 'Neue Figurenbeiträge', condition.type)}${option('passive', 'Passive Fertigkeit', condition.type)}${option('interaction', 'Bewusste Interaktion', condition.type)}</select></label>
      ${condition.type === 'comments' ? `<label><span>Mindestens</span><input type="number" min="1" max="999" step="1" ${field('minimum')} value="${condition.minimum}"><small>Beiträge ab Scharfschalten</small></label>`
        : condition.type === 'passive' ? `<label><span>Fertigkeit</span><select ${field('skillId')}>${skills(condition.skillId)}</select></label><label><span>Passiver Wert mindestens</span><input type="number" min="-99" max="99" step="1" ${field('minimum')} value="${condition.minimum}"></label><label><span>Voraussetzung</span><select ${field('requiredSense')}>${senses(condition.requiredSense)}</select></label>`
          : `<label><span>Interaktion mit</span><select ${field('sourceId')}>${sourceOptions}</select><small>Der Knopf „Jetzt interagieren“ am Gegenstand oder Symbol löst diese Bedingung aus.</small></label>`}
      <button type="button" class="scene-element-remove" data-se-remove-condition="${index}" aria-label="Bedingung ${index + 1} entfernen"${activation.conditions.length <= 1 ? ' disabled' : ''}>×</button></div>`;
  }

  function renderActivation() {
    const enabled = activation.enabled;
    const hazardous = elementType === 'danger' || elementType === 'item';
    const actors = getActors();
    host.hidden = elementType === 'narration';
    host.innerHTML = `<div class="scene-element-trigger-heading"><h3>03 <span>Auslösung & Entdeckung</span></h3><span class="scene-element-private-badge">Vorbereitung</span></div>
      ${revealed ? '<p class="herausforderung-note">Bereits ausgelöst. Die Entdeckungsprüfung und ihre Zielfigur bleiben erhalten.</p>' : `<label class="scene-element-toggle"><input type="checkbox" data-se-field="enabled"${enabled ? ' checked' : ''}${elementType === 'danger' || prepared ? ' disabled' : ''}><span>${elementType === 'danger' ? 'Bis zur Auslösung verborgen halten' : 'Erst nach festgelegten Bedingungen freigeben'}</span></label>`}
      ${enabled && !revealed ? `<div class="scene-element-trigger-settings"><p class="herausforderung-note">Die Vorbereitung wird einmalig freigegeben. Vorhandene Beiträge zählen nicht mit; erneutes Laden und Bearbeiten erzeugen keinen weiteren Beitrag.</p>
        <label><span>Bedingungen verknüpfen</span><select data-se-field="mode">${option('any', 'ODER · eine Bedingung genügt', activation.mode)}${option('all', 'UND · alle Bedingungen erforderlich', activation.mode)}</select></label>
        <div class="scene-element-conditions">${activation.conditions.map(conditionRow).join('')}</div>
        <button type="button" class="herausforderung-button" data-se-add-condition${activation.conditions.length >= 6 ? ' disabled' : ''}>＋ Bedingung hinzufügen</button>
        <label class="scene-element-toggle"><input type="checkbox" data-se-field="showSignal"${activation.showSignal ? ' checked' : ''}><span>Vorher ein neutrales Interaktionssymbol zeigen</span></label>
        ${hazardous ? `<div class="scene-element-target"><label><span>Wer muss reagieren?</span><select data-se-field="targetMode">${option('random', 'Zufällige beteiligte Figur / interagierende Figur', activation.target.mode)}${option('fixed', 'Festgelegte beteiligte Figur', activation.target.mode)}</select></label>
          ${activation.target.mode === 'fixed' ? `<label><span>Zielfigur</span><select data-se-field="targetActorId"><option value="">Figur wählen …</option>${actors.map(actor => option(actor.id, actor.name || actor.id, activation.target.actorId)).join('')}</select><small>Die Figur muss bereits in dieser Szene kommentiert haben.</small></label>` : ''}</div>
          <label class="scene-element-toggle"><input type="checkbox" data-se-field="detectionEnabled"${activation.detection.enabled ? ' checked' : ''}><span>Bei Auslösung verdeckt auf Entdeckung würfeln</span></label>
          <p class="herausforderung-note">Ein erfüllter passiver Auslöser entdeckt die Gefahr bereits. Sonst entscheidet die Entdeckungsprobe. Erkannt: Vorteil auf die Reaktion. Unbemerkt: Nachteil. Geltende Vor-/Nachteile werden miteinander verrechnet.</p>
          ${activation.detection.enabled ? `<div class="scene-element-detection-fields"><label><span>Entdeckungsprobe</span><select data-se-field="detectionSkill">${skills(activation.detection.skillId)}</select></label><label><span>Entdeckungs-SG</span><input type="number" min="1" max="40" data-se-field="detectionDifficulty" value="${activation.detection.difficulty}"></label><label><span>Benötigter Sinn</span><select data-se-field="detectionSense">${senses(activation.detection.requiredSense)}</select></label></div>` : ''}
          <label><span>Erkannt · Beschreibung bei Auslösung</span><textarea maxlength="2000" rows="2" data-se-field="detectedText" placeholder="Ein feines Klicken verrät die Falle …">${escape(activation.detection.detectedText)}</textarea></label>
          <label><span>Unbemerkt · Beschreibung bei Auslösung</span><textarea maxlength="2000" rows="2" data-se-field="missedText" placeholder="Ohne Vorwarnung schnellt die Falle hervor …">${escape(activation.detection.missedText)}</textarea></label>
          <details class="scene-element-save-rules" data-se-save-context><summary>Ursache und Gefahr für bedingte Rettungswurfregeln</summary><div>${renderSkillSaveContext({ saveContext: activation.saveContext })}</div></details>
          <p class="herausforderung-note">Die Reaktion und ihre Wirkungen legst du unter „Wege zur Erkenntnis“ fest, zum Beispiel Geschick-Rettung mit Schaden bei Fehlschlag. Die Entdeckungsprobe verursacht selbst keinen Schaden.</p>` : ''}
      </div>` : ''}`;
  }

  function refreshType() {
    root.dataset.elementType = elementType;
    root.querySelectorAll('[data-se-field="elementType"]').forEach(input => { input.checked = input.value === elementType; });
    root.querySelector('[data-se-type-help]').textContent = getSceneElementType(elementType).description;
    root.querySelectorAll('[data-se-reactions]').forEach(node => { node.hidden = elementType === 'narration'; });
    root.querySelector('[data-herausforderung-audience]').hidden = elementType === 'narration';
    root.querySelector('[data-herausforderung-target]').hidden = elementType === 'narration';
    root.querySelector('[data-se-completion]').hidden = !['puzzle', 'challenge', 'item'].includes(elementType);
    root.querySelector('[data-se-field="completionMode"]').value = completionMode;
    renderActivation();
  }

  function changed(event) {
    if (event.target.closest?.('[data-se-save-context]')) {
      if (event.type !== 'change') return;
      const input = event.target, context = structuredClone(activation.saveContext);
      if (input.dataset.skillInput === 'saveActionKind') context.actionKind = input.value;
      else if (input.dataset.skillInput === 'saveDamageType') context.damageType = input.value;
      else if (input.dataset.skillSaveTag) {
        const tags = new Set(context.saveTags);
        if (input.checked) tags.add(input.dataset.skillSaveTag); else tags.delete(input.dataset.skillSaveTag);
        context.saveTags = [...tags];
      } else return;
      activation.saveContext = normalizeSkillCheckSettings({ saveContext: context }).saveContext;
      host.querySelectorAll('[data-skill-save-tag]').forEach(input => { input.checked = activation.saveContext.saveTags.includes(input.dataset.skillSaveTag); });
      onChange({ typeChanged: false, elementType });
      return;
    }
    const input = event.target.closest?.('[data-se-field]');
    if (!input || !root.contains(input) || input.disabled) return;
    if (event.type === 'input' && (input.matches('select, [type="checkbox"], [type="radio"]'))) return;
    if (event.type === 'change' && input.matches('textarea, input[type="number"]')) return;
    const field = input.dataset.seField;
    const value = input.type === 'checkbox' ? input.checked : input.value;
    const index = input.dataset.seCondition;
    let rerender = false, typeChanged = false;
    if (index !== undefined) {
      const condition = activation.conditions[Number(index)];
      if (!condition) return;
      if (field === 'type') {
        activation.conditions[Number(index)] = value === 'passive' ? { type: value, skillId: 'perception', minimum: 21, requiredSense: '' }
          : value === 'interaction' ? { type: value, sourceId: '' } : { type: 'comments', minimum: 6 };
        rerender = true;
      } else condition[field] = field === 'minimum' ? Number(value) : value;
    } else if (field === 'elementType') {
      if (revealed && value === 'danger') return;
      elementType = value; typeChanged = true;
      completionMode = value === 'puzzle' ? 'any' : 'all';
      activation.enabled = value === 'danger' || prepared;
      if (value === 'narration') activation.enabled = false;
      if (activation.enabled && !activation.conditions.length) activation.conditions.push({ type: 'comments', minimum: 6 });
    } else if (field === 'completionMode') completionMode = value;
    else if (field === 'enabled' || field === 'showSignal' || field === 'mode') {
      activation[field] = value; rerender = field === 'enabled';
      if (field === 'enabled' && value && !activation.conditions.length) activation.conditions.push({ type: 'comments', minimum: 6 });
    }
    else if (field === 'targetMode') { activation.target.mode = value; rerender = true; }
    else if (field === 'targetActorId') activation.target.actorId = value;
    else if (field === 'detectionEnabled') { activation.detection.enabled = value; rerender = true; }
    else if (field === 'detectionSkill') activation.detection.skillId = value;
    else if (field === 'detectionDifficulty') activation.detection.difficulty = Number(value);
    else if (field === 'detectionSense') activation.detection.requiredSense = value;
    else if (field === 'detectedText' || field === 'missedText') activation.detection[field] = value;
    if (typeChanged) refreshType();
    else if (rerender) renderActivation();
    onChange({ typeChanged, elementType });
  }
  root.addEventListener('input', changed);
  root.addEventListener('change', changed);
  root.addEventListener('click', event => {
    const add = event.target.closest?.('[data-se-add-condition]'), remove = event.target.closest?.('[data-se-remove-condition]');
    if (add && activation.conditions.length < 6) activation.conditions.push({ type: 'comments', minimum: 6 });
    else if (remove && activation.conditions.length > 1) activation.conditions.splice(Number(remove.dataset.seRemoveCondition), 1);
    else return;
    renderActivation(); onChange({ typeChanged: false, elementType });
  });
  return {
    set(event = {}, options = {}) {
      elementType = getSceneElementType(event.elementType).id;
      completionMode = event.completionMode || (elementType === 'puzzle' ? 'any' : 'all');
      activation = normalizeSceneElementActivation(event.activation, elementType);
      sceneElementId = event.sceneElementId || '';
      prepared = options.prepared === true; revealed = !!event.sceneElementId;
      root.querySelectorAll('[data-se-field="elementType"]').forEach(input => { input.disabled = prepared || revealed; });
      refreshType();
    },
    read() { return { elementType, completionMode, activation: structuredClone(activation), ...(sceneElementId ? { sceneElementId } : {}) }; }
  };
}
