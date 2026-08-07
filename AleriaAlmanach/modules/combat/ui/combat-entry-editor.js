import { COMBAT_ATTRIBUTE_DEFINITIONS, COMBAT_WEAPON_TYPE_OPTIONS } from '../combat-profile-model.js?v=20260807-freya-v1';
import { COMBAT_ACTIVATION_TYPES } from '../combat-action-economy.js?v=20260807-magic-system-v1';
import {
  findSpellSlotResourceId,
  getOrderedSpellSlotResources,
  getSpellLevelLabel,
  isSpellSlotResource
} from '../combat-spell-slots.js?v=20260803-character-creation-v1';

const state = { kind: '', item: null, resources: [], weapons: [], inventoryItems: [], onSave: null };
const COMMENT_ACTION_RESOURCE_IDS = new Set(['action', 'bonus-action', 'reaction', 'special-action']);

function clone(value) {
  return JSON.parse(JSON.stringify(value ?? null));
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function checked(value) {
  return value ? ' checked' : '';
}

function selected(value, expected) {
  return String(value ?? '') === String(expected) ? ' selected' : '';
}

function getAtPath(target, path) {
  return String(path || '').split('.').filter(Boolean).reduce((value, key) => value?.[key], target);
}

function setAtPath(target, path, value) {
  const parts = String(path || '').split('.').filter(Boolean);
  const last = parts.pop();
  if (!last) return;
  const parent = parts.reduce((value, key) => {
    if (!value[key] || typeof value[key] !== 'object') value[key] = {};
    return value[key];
  }, target);
  parent[last] = value;
}

function fieldValue(field) {
  if (field.type === 'checkbox') return field.checked;
  if (field.type === 'number') return field.value === '' ? null : Number(field.value);
  return field.value;
}

function kindTitle() {
  if (state.kind === 'quirk') return 'Marotte & Eigenschaft bearbeiten';
  if (state.kind === 'ability') return 'Besondere Fähigkeit bearbeiten';
  if (state.kind === 'weapon') return 'Waffenangriff & Kosten bearbeiten';
  if (state.kind === 'spell') return 'Zauberregeln & Kosten bearbeiten';
  return 'Technik & Form bearbeiten';
}

function renderActivationOptions(value) {
  return COMBAT_ACTIVATION_TYPES.map(option => `<option value="${option.id}"${selected(value, option.id)}>${option.label}</option>`).join('');
}

function renderAttributeOptions(value) {
  return COMBAT_ATTRIBUTE_DEFINITIONS.map(option => `<option value="${option.key}"${selected(value, option.key)}>${option.label}</option>`).join('');
}

function renderSpellLevelOptions(value = 0) {
  return Array.from({ length: 11 }, (_entry, level) => `<option value="${level}"${selected(value, level)}>${escapeHtml(getSpellLevelLabel(level))}</option>`).join('');
}

function renderMechanicsFields(item) {
  const mechanics = item.mechanics || {};
  const fields = [
    ['attack', 'Angriff'], ['damage', 'Schaden'], ['armorClass', 'Rüstungsklasse'],
    ['skill', 'Fertigkeiten'], ['savingThrow', 'Rettungswürfe'], ['spellAttack', 'Zauberangriff'],
    ['spellSaveDc', 'Zauber-SG'], ['movement', 'Bewegung'], ['maximumHitPoints', 'Maximale TP'],
    ['passivePerception', 'Passive Wahrnehmung']
  ];
  return `<fieldset class="combat-entry-editor-mechanics"><legend>Strukturierte Wirkung</legend>
    <p>Diese Werte werden vom Kampfsystem berechnet und von AleriaGPT verbindlich gelesen.</p>
    <div class="combat-entry-editor-number-grid">${fields.map(([key, label]) => `<label><span>${label}</span><input type="number" min="-9999" max="9999" data-entry-field="mechanics.${key}" value="${escapeHtml(mechanics[key] ?? 0)}"></label>`).join('')}</div>
    <label><span>Angriffswurf</span><select data-entry-field="mechanics.attackRollMode"><option value="normal"${selected(mechanics.attackRollMode, 'normal')}>Normal</option><option value="advantage"${selected(mechanics.attackRollMode, 'advantage')}>Vorteil</option><option value="disadvantage"${selected(mechanics.attackRollMode, 'disadvantage')}>Nachteil</option></select></label>
  </fieldset>`;
}

const EFFECT_TYPE_OPTIONS = Object.freeze([
  ['damage', 'Schaden'], ['healing', 'Heilung'], ['temporary-hit-points', 'Temporäre TP'],
  ['apply-condition', 'Zustand geben'], ['remove-condition', 'Zustand entfernen'],
  ['restore-resource', 'Ressource auffüllen'], ['spend-resource', 'Ressource abziehen'],
  ['buff', 'Stärkung'], ['debuff', 'Schwächung'], ['move', 'Bewegen / Stoßen / Ziehen'],
  ['summon', 'Beschwören'], ['interrupt', 'Unterbrechen']
]);

function createDefaultEffect() {
  return {
    id: `effect-${Date.now().toString(36)}`,
    type: 'damage', target: 'target', on: 'hit', formula: '', amount: 0,
    damageType: 'physisch', magical: false, resourceId: '', notes: '',
    condition: { name: '', durationModel: { kind: 'actor-comments', remainingActorComments: 1 } }
  };
}

function renderEffects(item, {
  path = 'effects',
  legend = 'Auswertbare Effekte',
  description = 'Mehrere Effekte werden der Reihe nach und serverseitig verbindlich angewandt. Ohne Eintrag bleibt bei Waffen und Techniken der normale Schaden aktiv.',
  emptyText = 'Keine zusätzlichen strukturierten Effekte.'
} = {}) {
  const effectsAtPath = getAtPath(item, path);
  const effects = Array.isArray(effectsAtPath) ? effectsAtPath : [];
  const markup = `<fieldset class="combat-entry-editor-mechanics"><legend>${escapeHtml(legend)}</legend>
    <p>${escapeHtml(description)}</p>
    <div class="combat-entry-editor-rule-list">${effects.map((effect, index) => `<section class="combat-entry-editor-rule">
      <header><strong>${escapeHtml(EFFECT_TYPE_OPTIONS.find(option => option[0] === effect.type)?.[1] || `Effekt ${index + 1}`)}</strong><button type="button" data-entry-action="remove-effect" data-entry-effect-path="${escapeHtml(path)}" data-entry-index="${index}" aria-label="Effekt entfernen">&times;</button></header>
      <div class="combat-entry-editor-grid">
        <label><span>Wirkung</span><select data-entry-field="effects.${index}.type">${EFFECT_TYPE_OPTIONS.map(([id, label]) => `<option value="${id}"${selected(effect.type, id)}>${label}</option>`).join('')}</select></label>
        <label><span>Ziel</span><select data-entry-field="effects.${index}.target"><option value="target"${selected(effect.target, 'target')}>Gewähltes Ziel</option><option value="self"${selected(effect.target, 'self')}>Selbst</option><option value="selected"${selected(effect.target, 'selected')}>Ausgewählte Ziele</option><option value="allies"${selected(effect.target, 'allies')}>Verbündete</option><option value="enemies"${selected(effect.target, 'enemies')}>Gegner</option><option value="all"${selected(effect.target, 'all')}>Alle</option></select></label>
        <label><span>Gilt bei</span><select data-entry-field="effects.${index}.on"><option value="hit"${selected(effect.on, 'hit')}>Treffer / misslungene Rettung</option><option value="always"${selected(effect.on, 'always')}>Immer</option><option value="miss"${selected(effect.on, 'miss')}>Fehlschlag</option><option value="save-success"${selected(effect.on, 'save-success')}>Gelungene Rettung</option><option value="save-failure"${selected(effect.on, 'save-failure')}>Misslungene Rettung</option></select></label>
        <label><span>Würfelformel</span><input data-entry-field="effects.${index}.formula" value="${escapeHtml(String(effect.formula || '').toUpperCase().replace(/D/g, 'W'))}" placeholder="z. B. 1W8"></label>
        <label><span>Fester Wert</span><input type="number" min="0" data-entry-field="effects.${index}.amount" value="${escapeHtml(effect.amount ?? 0)}"></label>
        <label><span>Schadensart</span><input data-entry-field="effects.${index}.damageType" value="${escapeHtml(effect.damageType)}"></label>
        <label class="check"><input type="checkbox" data-entry-field="effects.${index}.magical"${checked(effect.magical)}> Magisch</label>
        <label><span>Ressource</span><select data-entry-field="effects.${index}.resourceId"><option value="">Keine</option>${state.resources.map(resource => `<option value="${escapeHtml(resource.id)}"${selected(effect.resourceId, resource.id)}>${escapeHtml(resource.name)}</option>`).join('')}</select></label>
        <label><span>Zustandsname</span><input data-entry-field="effects.${index}.condition.name" value="${escapeHtml(effect.condition?.name)}"></label>
        <label><span>Zustands-ID / zu entfernen</span><input data-entry-field="effects.${index}.conditionId" value="${escapeHtml(effect.conditionId)}"></label>
        <label><span>Zustands-Tags</span><input data-entry-field="effects.${index}.conditionTags" value="${escapeHtml(effect.conditionTags)}" placeholder="Gift, Furcht, Fluch …"></label>
        <label><span>Zustandsdauer</span><select data-entry-field="effects.${index}.condition.durationModel.kind"><option value="permanent"${selected(effect.condition?.durationModel?.kind, 'permanent')}>Bis entfernt</option><option value="actor-comments"${selected(effect.condition?.durationModel?.kind, 'actor-comments')}>Eigene Beiträge</option><option value="scene-comments"${selected(effect.condition?.durationModel?.kind, 'scene-comments')}>Szenenbeiträge</option><option value="combat"${selected(effect.condition?.durationModel?.kind, 'combat')}>Bis Kampfende</option><option value="short-rest"${selected(effect.condition?.durationModel?.kind, 'short-rest')}>Bis kurze Rast</option><option value="long-rest"${selected(effect.condition?.durationModel?.kind, 'long-rest')}>Bis lange Rast</option><option value="day"${selected(effect.condition?.durationModel?.kind, 'day')}>Bis Tageswechsel</option><option value="concentration"${selected(effect.condition?.durationModel?.kind, 'concentration')}>Konzentration</option></select></label>
        <label><span>Eigene Beiträge</span><input type="number" min="0" max="999" data-entry-field="effects.${index}.condition.durationModel.remainingActorComments" value="${escapeHtml(effect.condition?.durationModel?.remainingActorComments ?? 0)}"></label>
        <label><span>Szenenbeiträge</span><input type="number" min="0" max="999" data-entry-field="effects.${index}.condition.durationModel.remainingSceneComments" value="${escapeHtml(effect.condition?.durationModel?.remainingSceneComments ?? 0)}"></label>
        <label><span>Zustand: Angriff</span><input type="number" min="-99" max="99" data-entry-field="effects.${index}.condition.mechanics.attack" value="${escapeHtml(effect.condition?.mechanics?.attack ?? 0)}"></label>
        <label><span>Zustand: Schaden</span><input type="number" min="-99" max="99" data-entry-field="effects.${index}.condition.mechanics.damage" value="${escapeHtml(effect.condition?.mechanics?.damage ?? 0)}"></label>
        <label><span>Zustand: Rüstung</span><input type="number" min="-99" max="99" data-entry-field="effects.${index}.condition.mechanics.armorClass" value="${escapeHtml(effect.condition?.mechanics?.armorClass ?? 0)}"></label>
        <label><span>Zustand: Rettung</span><input type="number" min="-99" max="99" data-entry-field="effects.${index}.condition.mechanics.savingThrow" value="${escapeHtml(effect.condition?.mechanics?.savingThrow ?? 0)}"></label>
        <label><span>Bewegungsart</span><select data-entry-field="effects.${index}.movementKind"><option value="move"${selected(effect.movementKind, 'move')}>Bewegen</option><option value="push"${selected(effect.movementKind, 'push')}>Zurückstoßen</option><option value="pull"${selected(effect.movementKind, 'pull')}>Heranziehen</option></select></label>
        <label><span>Bewegung in Metern</span><input type="number" min="-9999" max="9999" data-entry-field="effects.${index}.movementMeters" value="${escapeHtml(effect.movementMeters ?? 0)}"></label>
        <label><span>Beschwörungs-Kreatur-ID</span><input data-entry-field="effects.${index}.summon.creatureId" value="${escapeHtml(effect.summon?.creatureId)}"></label>
        <label><span>Beschwörungsname</span><input data-entry-field="effects.${index}.summon.name" value="${escapeHtml(effect.summon?.name)}"></label>
        <label><span>Anzahl</span><input type="number" min="1" max="50" data-entry-field="effects.${index}.summon.count" value="${escapeHtml(effect.summon?.count ?? 1)}"></label>
        <label><span>Kampfpartei</span><input data-entry-field="effects.${index}.summon.partyId" value="${escapeHtml(effect.summon?.partyId)}"></label>
        <label><span>Beschwörungsdauer</span><select data-entry-field="effects.${index}.summon.duration.kind"><option value="combat"${selected(effect.summon?.duration?.kind, 'combat')}>Bis Kampfende</option><option value="concentration"${selected(effect.summon?.duration?.kind, 'concentration')}>Konzentration</option><option value="actor-comments"${selected(effect.summon?.duration?.kind, 'actor-comments')}>Eigene Beiträge</option><option value="permanent"${selected(effect.summon?.duration?.kind, 'permanent')}>Bis entfernt</option></select></label>
        <label class="check"><input type="checkbox" data-entry-field="effects.${index}.nonlethal"${checked(effect.nonlethal)}> Schaden ist nichttödlich</label>
        <label class="wide"><span>Hinweis</span><textarea rows="2" data-entry-field="effects.${index}.notes">${escapeHtml(effect.notes)}</textarea></label>
      </div>
    </section>`).join('') || '<p class="combat-entry-editor-empty">Keine zusätzlichen strukturierten Effekte.</p>'}</div>
    <button type="button" data-entry-action="add-effect" data-entry-effect-path="${escapeHtml(path)}">+ Effekt</button>
  </fieldset>`;
  return markup
    .replaceAll('data-entry-field="effects.', `data-entry-field="${escapeHtml(path)}.`)
    .replace('Keine zusätzlichen strukturierten Effekte.', escapeHtml(emptyText));
}

const RULE_ACTION_KINDS = Object.freeze([
  ['weapon', 'Waffe'], ['technique', 'Technik'], ['ability', 'F\u00e4higkeit'],
  ['spell', 'Zauber'], ['prayer', 'Gebet'], ['song', 'Gesang'], ['skill', 'Fertigkeit']
]);

function renderTriggerRules(item) {
  const rules = Array.isArray(item.triggerRules) ? item.triggerRules : [];
  return `<fieldset class="combat-entry-editor-rules"><legend>Ausl\u00f6ser & Reaktionen</legend>
    <p>Diese Regeln werden deterministisch vor oder nach dem Wurf gepr\u00fcft. Freitext allein ver\u00e4ndert kein Ergebnis.</p>
    <div class="combat-entry-editor-rule-list">${rules.map((rule, index) => {
      const effects = rule.effects || {};
      const kinds = Array.isArray(rule.actionKinds) ? rule.actionKinds : [];
      return `<section class="combat-entry-editor-rule" data-entry-rule-index="${index}">
        <header><strong>${escapeHtml(rule.name || `Regel ${index + 1}`)}</strong><button type="button" data-entry-action="remove-rule" data-entry-index="${index}" aria-label="Regel entfernen">&times;</button></header>
        <div class="combat-entry-editor-grid">
          <label><span>Regelname</span><input data-entry-field="triggerRules.${index}.name" value="${escapeHtml(rule.name)}"></label>
          <label class="check"><input type="checkbox" data-entry-field="triggerRules.${index}.enabled"${checked(rule.enabled !== false)}> Aktiv</label>
          <label><span>Zeitpunkt</span><select data-entry-field="triggerRules.${index}.phase"><option value="pre-roll"${selected(rule.phase, 'pre-roll')}>Vor dem Wurf</option><option value="post-roll"${selected(rule.phase, 'post-roll')}>Nach dem Wurf</option><option value="post-hit"${selected(rule.phase, 'post-hit')}>Nach Trefferpr\u00fcfung</option><option value="pre-damage"${selected(rule.phase, 'pre-damage')}>Vor Schaden</option><option value="on-damaged"${selected(rule.phase, 'on-damaged')}>Beim Erleiden von Schaden</option><option value="post-damage"${selected(rule.phase, 'post-damage')}>Nach Schaden</option><option value="on-heal"${selected(rule.phase, 'on-heal')}>Bei Heilung</option><option value="on-condition-applied"${selected(rule.phase, 'on-condition-applied')}>Bei neuem Zustand</option><option value="on-condition-removed"${selected(rule.phase, 'on-condition-removed')}>Bei entferntem Zustand</option><option value="on-resource-spent"${selected(rule.phase, 'on-resource-spent')}>Bei Ressourcenverbrauch</option><option value="on-defeat"${selected(rule.phase, 'on-defeat')}>Bei Niederlage</option><option value="on-concentration-check"${selected(rule.phase, 'on-concentration-check')}>Konzentrationspr\u00fcfung</option><option value="on-channel-progress"${selected(rule.phase, 'on-channel-progress')}>Kanalisierungsfortschritt</option><option value="on-combat-start"${selected(rule.phase, 'on-combat-start')}>Kampfbeginn</option><option value="on-combat-end"${selected(rule.phase, 'on-combat-end')}>Kampfende</option></select></label>
          <label><span>Aktivierung</span><select data-entry-field="triggerRules.${index}.activation"><option value="passive"${selected(rule.activation, 'passive')}>Passiv / automatisch</option><option value="reaction"${selected(rule.activation, 'reaction')}>Reaktion / ausw\u00e4hlbar</option></select></label>
          <label><span>Aktionsbindung</span><select data-entry-field="triggerRules.${index}.actionScope"><option value=""${selected(rule.actionScope, '')}>Automatisch</option><option value="entry"${selected(rule.actionScope, 'entry')}>Nur bei Nutzung dieses Eintrags</option><option value="global"${selected(rule.actionScope, 'global')}>Global / bei anderen Aktionen</option></select></label>
          <label class="check"><input type="checkbox" data-entry-field="triggerRules.${index}.consumeReaction"${checked(rule.consumeReaction !== false)}> Reaktionsressource verbrauchen</label>
          <label><span>Wirkt auf</span><select data-entry-field="triggerRules.${index}.recipient"><option value="actor"${selected(rule.recipient, 'actor')}>Handelnde Figur</option><option value="target"${selected(rule.recipient, 'target')}>Ziel</option></select></label>
          <label><span>Beziehung zur Quelle</span><select data-entry-field="triggerRules.${index}.sourceRelation"><option value="self"${selected(rule.sourceRelation, 'self')}>Quelle selbst</option><option value="ally"${selected(rule.sourceRelation, 'ally')}>Verb\u00fcndeter der Quelle</option><option value="enemy"${selected(rule.sourceRelation, 'enemy')}>Feind der Quelle</option><option value="any"${selected(rule.sourceRelation, 'any')}>Beliebige Beziehung</option></select></label>
          <label><span>Bedingung</span><select data-entry-field="triggerRules.${index}.condition"><option value="always"${selected(rule.condition, 'always')}>Immer</option><option value="would-hit"${selected(rule.condition, 'would-hit')}>Wurf w\u00fcrde treffen</option><option value="would-miss"${selected(rule.condition, 'would-miss')}>Wurf w\u00fcrde verfehlen</option><option value="critical-hit"${selected(rule.condition, 'critical-hit')}>Kritischer Treffer</option><option value="critical-failure"${selected(rule.condition, 'critical-failure')}>Kritischer Fehlschlag</option></select></label>
          <label><span>H\u00e4ufigkeit</span><select data-entry-field="triggerRules.${index}.frequency"><option value="always"${selected(rule.frequency, 'always')}>Jedes Mal</option><option value="comment"${selected(rule.frequency, 'comment')}>Einmal je Kommentar</option><option value="scene"${selected(rule.frequency, 'scene')}>Einmal je Szene</option><option value="day"${selected(rule.frequency, 'day')}>Einmal je Tag</option></select></label>
          <label><span>Radius in Metern</span><input type="number" min="0" max="9999" step="0.5" data-entry-field="triggerRules.${index}.radiusMeters" value="${escapeHtml(rule.radiusMeters ?? '')}" placeholder="Leer = unbegrenzt"></label>
          <label><span>Priorit\u00e4t</span><input type="number" min="-99" max="99" data-entry-field="triggerRules.${index}.priority" value="${escapeHtml(rule.priority ?? 0)}"></label>
          <label><span>Regelrang</span><select data-entry-field="triggerRules.${index}.authority"><option value="normal"${selected(rule.authority, 'normal')}>Normaler Modifikator</option><option value="passive"${selected(rule.authority, 'passive')}>Passive Eigenschaft / Aura</option><option value="timed"${selected(rule.authority, 'timed')}>Zeitlicher Effekt / F\u00e4higkeit</option><option value="reaction"${selected(rule.authority, 'reaction')}>Aktive Reaktion / Gegenzauber</option><option value="absolute"${selected(rule.authority, 'absolute')}>Immunit\u00e4t / absolute Regel</option></select></label>
          <label class="wide"><span>Ben\u00f6tigte Ziel-Tags</span><input data-entry-field="triggerRules.${index}.requiredTargetTags" value="${escapeHtml((rule.requiredTargetTags || []).join(', '))}" placeholder="z. B. stinkend, untot"></label>
          <label class="wide"><span>Nur diese Fertigkeiten</span><input data-entry-field="triggerRules.${index}.skillIds" value="${escapeHtml((rule.skillIds || []).join(', '))}" placeholder="z. B. persuasion, survival"></label>
          <fieldset class="wide combat-entry-editor-weapons"><legend>G\u00fcltige Handlungen</legend>${RULE_ACTION_KINDS.map(([kind, label]) => `<label><input type="checkbox" data-entry-rule-kind="${kind}" data-entry-rule-index="${index}"${checked(kinds.includes(kind))}> ${label}</label>`).join('')}<small>Ohne Auswahl gilt die Regel f\u00fcr alle Handlungsarten.</small></fieldset>
          <label class="wide"><span>Regelbeschreibung</span><textarea rows="2" data-entry-field="triggerRules.${index}.description">${escapeHtml(rule.description)}</textarea></label>
        </div>
        <div class="combat-entry-editor-number-grid">
          <label><span>Angriff</span><input type="number" data-entry-field="triggerRules.${index}.effects.attackModifier" value="${escapeHtml(effects.attackModifier ?? 0)}"></label>
          <label><span>Verteidigung</span><input type="number" data-entry-field="triggerRules.${index}.effects.defenseModifier" value="${escapeHtml(effects.defenseModifier ?? 0)}"></label>
          <label><span>Rettungswurf</span><input type="number" data-entry-field="triggerRules.${index}.effects.savingThrowModifier" value="${escapeHtml(effects.savingThrowModifier ?? 0)}"></label>
          <label><span>Zauber-SG</span><input type="number" data-entry-field="triggerRules.${index}.effects.spellSaveDcModifier" value="${escapeHtml(effects.spellSaveDcModifier ?? 0)}"></label>
          <label><span>Fertigkeit</span><input type="number" data-entry-field="triggerRules.${index}.effects.skillModifier" value="${escapeHtml(effects.skillModifier ?? 0)}"></label>
          <label><span>Schaden</span><input type="number" data-entry-field="triggerRules.${index}.effects.damageModifier" value="${escapeHtml(effects.damageModifier ?? 0)}"></label>
          <label><span>Schadensreduktion</span><input type="number" min="0" data-entry-field="triggerRules.${index}.effects.damageReduction" value="${escapeHtml(effects.damageReduction ?? 0)}"></label>
          <label><span>Wurfmodus</span><select data-entry-field="triggerRules.${index}.effects.rollMode"><option value="normal"${selected(effects.rollMode, 'normal')}>Normal</option><option value="advantage"${selected(effects.rollMode, 'advantage')}>Vorteil</option><option value="disadvantage"${selected(effects.rollMode, 'disadvantage')}>Nachteil</option></select></label>
          <label><span>Ergebnis</span><select data-entry-field="triggerRules.${index}.effects.outcome"><option value="none"${selected(effects.outcome, 'none')}>Nicht erzwingen</option><option value="force-hit"${selected(effects.outcome, 'force-hit')}>Treffer erzwingen</option><option value="force-miss"${selected(effects.outcome, 'force-miss')}>Fehlschlag erzwingen</option><option value="force-critical-hit"${selected(effects.outcome, 'force-critical-hit')}>Kritischen Treffer erzwingen</option><option value="force-save-success"${selected(effects.outcome, 'force-save-success')}>Rettung gelingt</option><option value="force-save-failure"${selected(effects.outcome, 'force-save-failure')}>Rettung misslingt</option><option value="force-skill-success"${selected(effects.outcome, 'force-skill-success')}>Fertigkeit gelingt</option><option value="force-skill-failure"${selected(effects.outcome, 'force-skill-failure')}>Fertigkeit scheitert</option></select></label>
        </div>
        ${renderEffects(item, {
          path: `triggerRules.${index}.resultEffects`,
          legend: 'Folgewirkungen dieser Regel',
          description: 'Diese Effekte werden nach dem Auslöser einmalig angewandt. Sie lösen im selben Vorgang keine erneute Regelkette aus.',
          emptyText: 'Diese Regel besitzt noch keine strukturierte Folgewirkung.'
        })}
      </section>`;
    }).join('') || '<p class="combat-entry-editor-empty">Noch keine auswertbare Ausl\u00f6serregel.</p>'}</div>
    <button type="button" data-entry-action="add-rule">+ Ausl\u00f6serregel</button>
  </fieldset>`;
}

function renderCosts(item) {
  const costs = Array.isArray(item.costs) ? item.costs : [];
  const selectableResources = state.kind === 'spell'
    ? state.resources.filter(resource => resource.id !== 'aura-focus'
      && !/mana/i.test(`${resource.id || ''} ${resource.name || ''}`)
      && !isSpellSlotResource(resource))
    : state.resources;
  return `<fieldset class="combat-entry-editor-costs"><legend>Kosten & Aktionsökonomie</legend>
    <div class="combat-entry-editor-cost-list">${costs.map((cost, index) => `<div class="combat-entry-editor-cost-row">
      <select data-entry-cost-index="${index}" data-entry-cost-field="resourceId"><option value="">Ressource wählen</option>${selectableResources.map(resource => `<option value="${escapeHtml(resource.id)}"${selected(cost.resourceId, resource.id)}>${escapeHtml(resource.name)}</option>`).join('')}</select>
      <input type="number" min="0" max="9999" data-entry-cost-index="${index}" data-entry-cost-field="amount" value="${escapeHtml(cost.amount ?? 1)}" aria-label="Kosten">
      <button type="button" data-entry-action="remove-cost" data-entry-index="${index}" aria-label="Kosten entfernen">×</button>
    </div>`).join('') || '<p class="combat-entry-editor-empty">Keine Kosten hinterlegt.</p>'}</div>
    <button type="button" data-entry-action="add-cost">+ Ressourcenkosten</button>
    <div class="combat-entry-editor-aura-row">
      <label class="check"><input type="checkbox" data-entry-field="auraBypass.allowed"${checked(item.auraBypass?.allowed !== false)}> Durch Aura-Fokus ersetzbar</label>
      <label><span>Aura-Kosten</span><input type="number" min="1" max="999" data-entry-field="auraBypass.cost" value="${escapeHtml(item.auraBypass?.cost ?? 1)}"></label>
    </div>
    ${state.kind === 'spell' ? '<p>Mana und Zauberplätze werden ausschließlich über die getrennten Zauberfelder berechnet. Aura-Fokus ersetzt bei Auswahl das gesamte reguläre Paket.</p>' : ''}
  </fieldset>`;
}

function renderQuirk(item) {
  return `<div class="combat-entry-editor-grid">
    <label><span>Art</span><select data-entry-field="type"><option value="quirk"${selected(item.type, 'quirk')}>Marotte</option><option value="trait"${selected(item.type, 'trait')}>Eigenschaft</option><option value="ideal"${selected(item.type, 'ideal')}>Ideal</option><option value="bond"${selected(item.type, 'bond')}>Bindung</option><option value="flaw"${selected(item.type, 'flaw')}>Fehler</option><option value="rule"${selected(item.type, 'rule')}>Sonderregel</option></select></label>
    <label><span>Ziel / Betroffene</span><input data-entry-field="target" value="${escapeHtml(item.target)}" placeholder="Selbst, Gegner, Verbündete …"></label>
    <label><span>Priorität</span><input type="number" min="-99" max="99" data-entry-field="priority" value="${escapeHtml(item.priority ?? 0)}"></label>
    <label><span>Stapelung</span><input data-entry-field="stacking" value="${escapeHtml(item.stacking)}" placeholder="Einmalig, kumulativ …"></label>
    <label class="wide"><span>Wann gilt sie?</span><input data-entry-field="appliesWhen" value="${escapeHtml(item.appliesWhen)}" placeholder="Bedingung oder Situation"></label>
    <label class="wide"><span>Auslöser</span><input data-entry-field="trigger" value="${escapeHtml(item.trigger)}" placeholder="Wodurch wird sie ausgelöst?"></label>
    <label><span>Dauer</span><input data-entry-field="duration" value="${escapeHtml(item.duration)}"></label>
    <label><span>Schlagworte</span><input data-entry-field="tags" value="${escapeHtml(item.tags)}"></label>
    <label class="wide"><span>Beschreibung</span><textarea data-entry-field="description" rows="5">${escapeHtml(item.description)}</textarea></label>
    <label class="wide"><span>Grenzen & Konflikte</span><textarea data-entry-field="limitations" rows="3">${escapeHtml(item.limitations)}</textarea></label>
    <label class="wide"><span>Verbindliche Hinweise an AleriaGPT</span><textarea data-entry-field="aiInstructions" rows="4" placeholder="Wie soll die KI diese Marotte interpretieren und erzählen?">${escapeHtml(item.aiInstructions)}</textarea></label>
  </div>${renderMechanicsFields(item)}${renderTriggerRules(item)}`;
}

function renderAbility(item) {
  const inventoryTrigger = item.inventoryUseTrigger || {};
  const restoredResource = inventoryTrigger.restoreResources?.[0] || {};
  return `<div class="combat-entry-editor-grid">
    <label><span>Aktivierung</span><select data-entry-field="activationType">${renderActivationOptions(item.activationType)}</select></label>
    <label><span>Darstellung</span><select data-entry-field="delivery"><option value="ability"${selected(item.delivery, 'ability')}>Fähigkeit</option><option value="weapon"${selected(item.delivery, 'weapon')}>Waffentechnik</option><option value="spell"${selected(item.delivery, 'spell')}>Zauberformel</option><option value="prayer"${selected(item.delivery, 'prayer')}>Gebet / heiliger Schwur</option><option value="song"${selected(item.delivery, 'song')}>Gesang</option></select></label>
    <label class="check"><input type="checkbox" data-entry-field="combatUsable"${checked(item.combatUsable)}> In der interaktiven Szene auswählbar</label>
    <label><span>Würfelformel</span><input data-entry-field="rollFormula" value="${escapeHtml(String(item.rollFormula || '').toUpperCase().replace(/D/g, 'W'))}" placeholder="1W8"></label>
    <label><span>Schadensart</span><input data-entry-field="damageType" value="${escapeHtml(item.damageType)}"></label>
    <label><span>Reichweite</span><input data-entry-field="range" value="${escapeHtml(item.range)}"></label>
    <label><span>Ziel</span><input data-entry-field="target" value="${escapeHtml(item.target)}"></label>
    <label><span>Dauer</span><input data-entry-field="duration" value="${escapeHtml(item.duration)}"></label>
    <label class="check"><input type="checkbox" data-entry-field="concentration"${checked(item.concentration)}> Benötigt Konzentration</label>
    <label><span>Kanalisierung</span><input type="number" min="0" max="99" data-entry-field="channelComments" value="${escapeHtml(item.channelComments ?? 0)}"><small>0 = sofort, sonst Anzahl eigener Abschnitte bis zur Wirkung</small></label>
    <label><span>Nutzungen</span><div class="combat-entry-editor-pair"><input type="number" min="0" max="999" data-entry-field="usesCurrent" value="${escapeHtml(item.usesCurrent ?? 0)}"><i>/</i><input type="number" min="0" max="999" data-entry-field="usesMaximum" value="${escapeHtml(item.usesMaximum ?? 0)}"></div></label>
    <label><span>Erholung</span><select data-entry-field="recovery"><option value="none"${selected(item.recovery, 'none')}>Keine</option><option value="short-rest"${selected(item.recovery, 'short-rest')}>Kurze Rast</option><option value="long-rest"${selected(item.recovery, 'long-rest')}>Lange Rast</option><option value="scene"${selected(item.recovery, 'scene')}>Szene</option><option value="day"${selected(item.recovery, 'day')}>Tag</option><option value="manual"${selected(item.recovery, 'manual')}>Manuell</option></select></label>
    <label class="wide"><span>Beschreibung & Wirkung</span><textarea data-entry-field="description" rows="5">${escapeHtml(item.description)}</textarea></label>
    <label class="wide"><span>Voraussetzungen & Grenzen</span><textarea data-entry-field="requirements" rows="3">${escapeHtml(item.requirements)}</textarea></label>
    <label><span>Schlagworte</span><input data-entry-field="tags" value="${escapeHtml(item.tags)}"></label>
    <label class="wide"><span>Verbindliche Hinweise an AleriaGPT</span><textarea data-entry-field="aiInstructions" rows="4">${escapeHtml(item.aiInstructions)}</textarea></label>
  </div>
  <fieldset class="combat-entry-editor-mechanics"><legend>Ausl\u00f6ser durch Inventarnutzung</legend>
    <p>Kann beim Benutzen eines passenden Gegenstands eine Ressource regenerieren. Nutzung und Tagesgrenze werden serverseitig gepr\u00fcft.</p>
    <div class="combat-entry-editor-grid">
      <label class="check"><input type="checkbox" data-entry-field="inventoryUseTrigger.enabled"${checked(inventoryTrigger.enabled)}> Aktiv</label>
      <label class="wide"><span>Passende Gegenstands-Tags</span><input data-entry-field="inventoryUseTrigger.itemTags" value="${escapeHtml((inventoryTrigger.itemTags || []).join(', '))}" placeholder="z. B. Duft, Parf\u00fcm"></label>
      <label><span>Ressource</span><select data-entry-field="inventoryUseTrigger.restoreResources.0.resourceId"><option value="">Ressource w\u00e4hlen</option>${state.resources.map(resource => `<option value="${escapeHtml(resource.id)}"${selected(restoredResource.resourceId, resource.id)}>${escapeHtml(resource.name)}</option>`).join('')}</select></label>
      <label><span>Punkte regenerieren</span><input type="number" min="1" max="999" data-entry-field="inventoryUseTrigger.restoreResources.0.amount" value="${escapeHtml(restoredResource.amount ?? 1)}"></label>
      <label class="check"><input type="checkbox" data-entry-field="inventoryUseTrigger.requireActualRecovery"${checked(inventoryTrigger.requireActualRecovery !== false)}> Nutzung nur bei tats\u00e4chlicher Regeneration verbrauchen</label>
    </div>
  </fieldset>${renderCosts(item)}${renderEffects(item)}${renderMechanicsFields(item)}${renderTriggerRules(item)}`;
}

function renderTechnique(item) {
  const weaponTypes = Array.isArray(item.weaponTypes) ? item.weaponTypes : [];
  const compatibleWeaponIds = Array.isArray(item.compatibleWeaponIds) ? item.compatibleWeaponIds : [];
  const secondarySave = item.secondarySave || {};
  const failureCondition = secondarySave.failureCondition || {};
  const followUp = item.followUpAttack || {};
  return `<div class="combat-entry-editor-grid">
    <label><span>Kategorie</span><select data-entry-field="category"><option value="technique"${selected(item.category, 'technique')}>Technik</option><option value="form"${selected(item.category, 'form')}>Form / Haltung</option><option value="reaction"${selected(item.category, 'reaction')}>Reaktion</option><option value="bonus"${selected(item.category, 'bonus')}>Bonusaktion</option><option value="special"${selected(item.category, 'special')}>Besondere Aktion</option></select></label>
    <label><span>Aktivierung</span><select data-entry-field="activationType">${renderActivationOptions(item.activationType)}</select></label>
    <label><span>Ausbildungsform</span><input data-entry-field="trainingForm" value="${escapeHtml(item.trainingForm)}" placeholder="z. B. Drachentanz"></label>
    <label><span>Freigabe ab Stufe</span><input type="number" min="1" max="30" data-entry-field="minimumLevel" value="${escapeHtml(item.minimumLevel ?? 1)}"></label>
    <label><span>Schadenswurf</span><input data-entry-field="damageFormula" value="${escapeHtml(String(item.damageFormula || '').toUpperCase().replace(/D/g, 'W'))}" placeholder="Leer = aktive Waffe"></label>
    <label><span>Schadensart</span><input data-entry-field="damageType" value="${escapeHtml(item.damageType)}" placeholder="Leer = aktive Waffe"></label>
    <label><span>Angriffsbonus</span><input type="number" min="-99" max="99" data-entry-field="attackBonus" value="${escapeHtml(item.attackBonus ?? 0)}"></label>
    <label><span>Schadensbonus</span><input type="number" min="-99" max="99" data-entry-field="damageBonus" value="${escapeHtml(item.damageBonus ?? 0)}"></label>
    <label><span>Wurfmodus</span><select data-entry-field="rollMode"><option value="normal"${selected(item.rollMode, 'normal')}>Normal</option><option value="advantage"${selected(item.rollMode, 'advantage')}>Vorteil</option><option value="disadvantage"${selected(item.rollMode, 'disadvantage')}>Nachteil</option></select></label>
    <label><span>Reichweite</span><input data-entry-field="range" value="${escapeHtml(item.range)}"></label>
    <label><span>Ziel</span><input data-entry-field="target" value="${escapeHtml(item.target)}"></label>
    <label><span>Dauer</span><input data-entry-field="duration" value="${escapeHtml(item.duration)}"></label>
    <fieldset class="wide combat-entry-editor-weapons"><legend>Erlaubte Waffenarten</legend>${COMBAT_WEAPON_TYPE_OPTIONS.map(option => `<label><input type="checkbox" data-entry-weapon-type="${option.id}"${checked(weaponTypes.includes(option.id))}> ${option.label}</label>`).join('')}<small>Ohne Auswahl gilt die Technik für jede Waffenart.</small></fieldset>
    ${state.weapons.length ? `<fieldset class="wide combat-entry-editor-weapons"><legend>Konkrete Waffenbindung</legend>${state.weapons.map(weapon => `<label><input type="checkbox" data-entry-weapon-id="${escapeHtml(weapon.id)}"${checked(compatibleWeaponIds.includes(weapon.id))}> ${escapeHtml(weapon.name)}</label>`).join('')}<small>Eine Auswahl beschränkt die Technik zusätzlich auf genau diese Gegenstände.</small></fieldset>` : ''}
    <label class="wide"><span>Beschreibung</span><textarea data-entry-field="description" rows="4">${escapeHtml(item.description)}</textarea></label>
    <label class="wide"><span>Mechanischer / erzählerischer Effekt</span><textarea data-entry-field="effect" rows="4">${escapeHtml(item.effect)}</textarea></label>
    <label class="wide"><span>Voraussetzungen & Grenzen</span><textarea data-entry-field="requirements" rows="3">${escapeHtml(item.requirements)}</textarea></label>
    <label><span>Schlagworte</span><input data-entry-field="tags" value="${escapeHtml(item.tags)}"></label>
    <label class="wide"><span>Verbindliche Hinweise an AleriaGPT</span><textarea data-entry-field="aiInstructions" rows="4">${escapeHtml(item.aiInstructions)}</textarea></label>
  </div>
  <fieldset class="combat-entry-editor-mechanics"><legend>Rettungswurf nach einem Treffer</legend><div class="combat-entry-editor-grid">
    <label class="check"><input type="checkbox" data-entry-field="secondarySave.enabled"${checked(secondarySave.enabled)}> Aktiv</label>
    <label><span>Rettungsattribut</span><select data-entry-field="secondarySave.attributeKey">${renderAttributeOptions(secondarySave.attributeKey || 'constitution')}</select></label>
    <label><span>Grund-SG</span><input type="number" min="0" max="99" data-entry-field="secondarySave.dcBase" value="${escapeHtml(secondarySave.dcBase ?? 8)}"></label>
    <label><span>SG-Attribut</span><select data-entry-field="secondarySave.dcAttributeKey">${renderAttributeOptions(secondarySave.dcAttributeKey || 'strength')}</select></label>
    <label class="check"><input type="checkbox" data-entry-field="secondarySave.addProficiency"${checked(secondarySave.addProficiency !== false)}> Kompetenzbonus zum SG</label>
    <label><span>Zustandsname bei Fehlschlag</span><input data-entry-field="secondarySave.failureCondition.name" value="${escapeHtml(failureCondition.name)}"></label>
    <label><span>Dauer</span><input data-entry-field="secondarySave.failureCondition.duration" value="${escapeHtml(failureCondition.duration)}"></label>
    <label><span>Angriffsmodifikator</span><input type="number" min="-99" max="99" data-entry-field="secondarySave.failureCondition.mechanics.attack" value="${escapeHtml(failureCondition.mechanics?.attack ?? 0)}"></label>
    <label class="wide"><span>Zustandsbeschreibung</span><textarea data-entry-field="secondarySave.failureCondition.description" rows="3">${escapeHtml(failureCondition.description)}</textarea></label>
  </div></fieldset>
  <fieldset class="combat-entry-editor-mechanics"><legend>Unmittelbarer Folgeangriff</legend><div class="combat-entry-editor-grid">
    <label class="check"><input type="checkbox" data-entry-field="followUpAttack.enabled"${checked(followUp.enabled)}> Nach Haupttreffer würfeln</label>
    <label><span>Schadenswurf</span><input data-entry-field="followUpAttack.damageFormula" value="${escapeHtml(String(followUp.damageFormula || '').toUpperCase().replace(/D/g, 'W'))}" placeholder="1W4"></label>
    <label><span>Schadensart</span><input data-entry-field="followUpAttack.damageType" value="${escapeHtml(followUp.damageType)}"></label>
    <label><span>Angriffsbonus</span><input type="number" min="-99" max="99" data-entry-field="followUpAttack.attackBonus" value="${escapeHtml(followUp.attackBonus ?? 0)}"></label>
    <label><span>Schadensbonus</span><input type="number" min="-99" max="99" data-entry-field="followUpAttack.damageBonus" value="${escapeHtml(followUp.damageBonus ?? 0)}"></label>
    <label class="check"><input type="checkbox" data-entry-field="followUpAttack.sameTarget"${checked(followUp.sameTarget !== false)}> Gleiches Ziel</label>
    <label class="check"><input type="checkbox" data-entry-field="followUpAttack.triggerReactions"${checked(followUp.triggerReactions !== false)}> Darf Reaktionen auslösen</label>
    <label class="check"><input type="checkbox" data-entry-field="followUpAttack.repeatPerAttackRules"${checked(followUp.repeatPerAttackRules !== false)}> „Pro Angriff“-Regeln erneut prüfen</label>
    <label class="check"><input type="checkbox" data-entry-field="followUpAttack.triggerFurtherEffects"${checked(followUp.triggerFurtherEffects)}> Darf weitere Fähigkeiten auslösen</label>
  </div></fieldset>${renderCosts(item)}${renderEffects(item)}${renderMechanicsFields(item)}${renderTriggerRules(item)}`;
}

function renderWeapon(item) {
  const ammunition = item.ammunition || {};
  return `<div class="combat-entry-editor-grid">
    <label><span>Aktivierung</span><select data-entry-field="activationType">${renderActivationOptions(item.activationType)}</select></label>
    <label><span>Waffenart</span><select data-entry-field="weaponType">${COMBAT_WEAPON_TYPE_OPTIONS.map(option => `<option value="${option.id}"${selected(item.weaponType, option.id)}>${option.label}</option>`).join('')}</select></label>
    <label><span>Angriffsattribut</span><select data-entry-field="attackAttribute">${renderAttributeOptions(item.attackAttribute)}</select></label>
    <label><span>Schadenswurf</span><input data-entry-field="damageFormula" value="${escapeHtml(String(item.damageFormula || '').toUpperCase().replace(/D/g, 'W'))}" placeholder="1W8"></label>
    <label><span>Schadensart</span><input data-entry-field="damageType" value="${escapeHtml(item.damageType)}"></label>
    <label><span>Reichweite</span><input data-entry-field="range" value="${escapeHtml(item.range)}"></label>
    <label class="check"><input type="checkbox" data-entry-field="ammunition.required"${checked(ammunition.required)}> Verbraucht Munition aus dem Inventar</label>
    <label><span>Munition</span><select data-entry-field="ammunition.inventoryItemId"><option value="">Inventargegenstand wählen</option>${state.inventoryItems.map(inventoryItem => `<option value="${escapeHtml(inventoryItem.id)}"${selected(ammunition.inventoryItemId, inventoryItem.id)}>${escapeHtml(inventoryItem.name || 'Gegenstand')} · ${escapeHtml(inventoryItem.quantity ?? 1)}×</option>`).join('')}</select></label>
    <label><span>Verbrauch je Angriff</span><input type="number" min="1" max="99" data-entry-field="ammunition.amountPerUse" value="${escapeHtml(ammunition.amountPerUse ?? 1)}"></label>
    <label><span>Nachladen nach</span><input type="number" min="0" max="999" data-entry-field="ammunition.reloadAfter" value="${escapeHtml(ammunition.reloadAfter ?? 0)}"><small>0 = keine separate Nachladeregel</small></label>
    <label class="wide"><span>Voraussetzungen & Grenzen</span><textarea data-entry-field="requirements" rows="3">${escapeHtml(item.requirements)}</textarea></label>
    <label class="wide"><span>Verbindliche Hinweise an AleriaGPT</span><textarea data-entry-field="aiInstructions" rows="4">${escapeHtml(item.aiInstructions)}</textarea></label>
  </div>${renderCosts(item)}${renderEffects(item)}`;
}

function renderSpell(item) {
  const cantrip = Number(item.level) === 0;
  const spellSlots = getOrderedSpellSlotResources(state.resources);
  const upcast = item.upcast || {};
  return `<div class="combat-entry-editor-grid">
    <label><span>Aktivierung</span><select data-entry-field="activationType">${renderActivationOptions(item.activationType)}</select></label>
    <label><span>Darstellung</span><select data-entry-field="presentationKind"><option value="spell"${selected(item.presentationKind, 'spell')}>Zauberformel</option><option value="prayer"${selected(item.presentationKind, 'prayer')}>Gebet / heiliger Schwur</option><option value="song"${selected(item.presentationKind, 'song')}>Gesang</option></select></label>
    <label><span>Auflösung</span><select data-entry-field="resolutionType"><option value="spell-attack"${selected(item.resolutionType, 'spell-attack')}>Zauberangriff</option><option value="saving-throw"${selected(item.resolutionType, 'saving-throw')}>Rettungswurf gegen Zauber-SG</option><option value="automatic"${selected(item.resolutionType, 'automatic')}>Automatische Wirkung</option></select></label>
    <label><span>Rettungsattribut</span><select data-entry-field="saveAttribute">${renderAttributeOptions(item.saveAttribute)}</select></label>
    <label><span>Zaubergrad</span><select data-entry-field="level">${renderSpellLevelOptions(item.level)}</select></label>
    <label><span>Würfelformel</span><input data-entry-field="rollFormula" value="${escapeHtml(String(item.rollFormula || '').toUpperCase().replace(/D/g, 'W'))}" placeholder="2W6"></label>
    <label><span>Schadensart</span><input data-entry-field="damageType" value="${escapeHtml(item.damageType)}"></label>
    <label><span>Mana</span><input type="number" min="0" max="999" data-entry-field="manaCost" value="${escapeHtml(item.manaCost ?? 0)}"${cantrip ? ' disabled title="Zaubertricks verbrauchen kein Mana"' : ''}></label>
    <label><span>Zauberplatz</span><select data-entry-field="slotResourceId"${cantrip ? ' disabled' : ''}><option value="">${cantrip ? 'Zaubertrick · kein Platz' : 'Zauberplatz wählen'}</option>${spellSlots.map(resource => `<option value="${escapeHtml(resource.id)}"${selected(item.slotResourceId, resource.id)}>${escapeHtml(resource.name)}</option>`).join('')}</select></label>
    <label><span>Platzkosten</span><input type="number" min="0" max="99" data-entry-field="slotCost" value="${escapeHtml(item.slotCost ?? 0)}"${cantrip ? ' disabled title="Zaubertricks verbrauchen keinen Zauberplatz"' : ''}></label>
    <label><span>Reichweite</span><input data-entry-field="range" value="${escapeHtml(item.range)}"></label>
    <label><span>Dauer</span><input data-entry-field="duration" value="${escapeHtml(item.duration)}"></label>
    <label class="check"><input type="checkbox" data-entry-field="concentration"${checked(item.concentration)}> Benötigt Konzentration</label>
    <label><span>Kanalisierung</span><input type="number" min="0" max="99" data-entry-field="channelComments" value="${escapeHtml(item.channelComments ?? 0)}"><small>0 = sofort, sonst Anzahl eigener Abschnitte bis zur Wirkung</small></label>
    <label class="check"><input type="checkbox" data-entry-field="halfDamageOnSave"${checked(item.halfDamageOnSave)}> Halber Schaden bei gelungener Rettung</label>
    <label class="wide"><span>Beschreibung & Wirkung</span><textarea data-entry-field="description" rows="5">${escapeHtml(item.description)}</textarea></label>
    <label class="wide"><span>Voraussetzungen & Grenzen</span><textarea data-entry-field="requirements" rows="3">${escapeHtml(item.requirements)}</textarea></label>
    <label><span>Schlagworte</span><input data-entry-field="tags" value="${escapeHtml(item.tags)}"></label>
    <label class="wide"><span>Verbindliche Hinweise an AleriaGPT</span><textarea data-entry-field="aiInstructions" rows="4">${escapeHtml(item.aiInstructions)}</textarea></label>
  </div><p class="combat-entry-editor-spell-rule">${cantrip ? 'Zaubertrick: verbraucht weiterhin seine Aktionsart, aber weder Mana noch einen Zauberplatz.' : `${escapeHtml(getSpellLevelLabel(item.level))}: verbraucht die hinterlegte Aktionsart sowie Mana- und Zauberplatzkosten.`}</p>
  ${cantrip ? '' : `<fieldset class="combat-entry-editor-mechanics"><legend>Höherstufig wirken</legend><div class="combat-entry-editor-grid">
    <label class="check"><input type="checkbox" data-entry-field="upcast.enabled"${checked(upcast.enabled)}> Höhere Zauberplätze erlauben</label>
    <label><span>Zusatzwurf je Grad</span><input data-entry-field="upcast.formulaPerLevel" value="${escapeHtml(String(upcast.formulaPerLevel || '').toUpperCase().replace(/D/g, 'W'))}" placeholder="1W6"></label>
    <label><span>Fester Zusatz je Grad</span><input type="number" min="0" max="999" data-entry-field="upcast.amountPerLevel" value="${escapeHtml(upcast.amountPerLevel ?? 0)}"></label>
    <label><span>Höchster Grad</span><input type="number" min="${escapeHtml(item.level || 1)}" max="10" data-entry-field="upcast.maximumLevel" value="${escapeHtml(upcast.maximumLevel ?? 10)}"></label>
  </div></fieldset>`}${renderCosts(item)}${renderEffects(item)}`;
}

function ensureOverlay() {
  let overlay = document.getElementById('combat-entry-editor-overlay');
  if (overlay) return overlay;
  overlay = document.createElement('div');
  overlay.id = 'combat-entry-editor-overlay';
  overlay.className = 'combat-entry-editor-overlay';
  overlay.setAttribute('aria-hidden', 'true');
  document.body.appendChild(overlay);
  return overlay;
}

function render() {
  const overlay = ensureOverlay();
  const item = state.item || {};
  const content = state.kind === 'quirk'
    ? renderQuirk(item)
    : (state.kind === 'ability'
      ? renderAbility(item)
      : (state.kind === 'weapon' ? renderWeapon(item) : (state.kind === 'spell' ? renderSpell(item) : renderTechnique(item))));
  overlay.innerHTML = `<section class="combat-entry-editor-dialog" role="dialog" aria-modal="true" aria-labelledby="combat-entry-editor-title">
    <header><div><span>Kampfprofil · Detailwerkstatt</span><h2 id="combat-entry-editor-title">${kindTitle()}</h2></div><button type="button" data-entry-action="close" aria-label="Schließen">×</button></header>
    <div class="combat-entry-editor-body">
      <div class="combat-entry-editor-name-row"><label><span>Name</span><input data-entry-field="name" value="${escapeHtml(item.name)}" maxlength="140" autofocus></label><label class="check"><input type="checkbox" data-entry-field="active"${checked(item.active !== false)}> Aktiv</label></div>
      ${content}
      <p class="combat-entry-editor-error" data-entry-role="error" hidden></p>
    </div>
    <footer><button type="button" data-entry-action="close">Abbrechen</button><button type="button" class="primary" data-entry-action="save">Übernehmen</button></footer>
  </section>`;
  overlay.classList.add('active');
  overlay.setAttribute('aria-hidden', 'false');
  requestAnimationFrame(() => overlay.querySelector('[autofocus]')?.focus());
}

function close() {
  const overlay = ensureOverlay();
  overlay.classList.remove('active');
  overlay.setAttribute('aria-hidden', 'true');
  state.kind = '';
  state.item = null;
  state.onSave = null;
}

function updateCost(field) {
  const index = Number(field.dataset.entryCostIndex);
  const cost = state.item?.costs?.[index];
  if (!cost) return;
  cost[field.dataset.entryCostField] = fieldValue(field);
  if (field.dataset.entryCostField === 'resourceId') {
    const resource = state.resources.find(item => item.id === field.value);
    cost.name = resource?.name || 'Ressource';
    cost.scope = resource?.scope || 'persistent';
  }
}

function syncSingleActivationCost(field) {
  if (field.dataset.entryField !== 'activationType' || !Array.isArray(state.item?.costs)) return;
  const actionCosts = state.item.costs.filter(cost => COMMENT_ACTION_RESOURCE_IDS.has(String(cost.resourceId || '')));
  if (actionCosts.length !== 1) return;
  const cost = actionCosts[0];
  if (field.value === 'passive') {
    state.item.costs.splice(state.item.costs.indexOf(cost), 1);
    return;
  }
  const resource = state.resources.find(item => item.id === field.value);
  cost.resourceId = field.value;
  cost.name = resource?.name || COMBAT_ACTIVATION_TYPES.find(item => item.id === field.value)?.label || field.value;
  cost.scope = resource?.scope === 'comment' ? 'comment' : 'persistent';
}

function syncSpellLevel(field) {
  if (state.kind !== 'spell' || field.dataset.entryField !== 'level') return false;
  const level = Math.max(0, Math.min(10, Number(field.value) || 0));
  state.item.level = level;
  state.item.manaCost = level === 0 ? 0 : Math.max(0, Number(state.item.manaCost) || 0);
  state.item.slotCost = level === 0 ? 0 : Math.max(1, Number(state.item.slotCost) || 1);
  state.item.slotResourceId = level === 0 ? '' : findSpellSlotResourceId(state.resources, level);
  render();
  return true;
}

document.addEventListener('input', event => {
  const field = event.target?.closest?.('#combat-entry-editor-overlay [data-entry-field], #combat-entry-editor-overlay [data-entry-cost-field]');
  if (!field || !state.item) return;
  if (syncSpellLevel(field)) return;
  if (field.dataset.entryCostField) updateCost(field);
  else {
    setAtPath(state.item, field.dataset.entryField, fieldValue(field));
    syncSingleActivationCost(field);
  }
});

document.addEventListener('change', event => {
  const ruleKind = event.target?.closest?.('#combat-entry-editor-overlay [data-entry-rule-kind]');
  if (ruleKind && state.item) {
    const rule = state.item.triggerRules?.[Number(ruleKind.dataset.entryRuleIndex)];
    if (!rule) return;
    const values = new Set(Array.isArray(rule.actionKinds) ? rule.actionKinds : []);
    if (ruleKind.checked) values.add(ruleKind.dataset.entryRuleKind);
    else values.delete(ruleKind.dataset.entryRuleKind);
    rule.actionKinds = [...values];
    return;
  }
  const weaponType = event.target?.closest?.('#combat-entry-editor-overlay [data-entry-weapon-type]');
  if (weaponType && state.item) {
    const values = new Set(Array.isArray(state.item.weaponTypes) ? state.item.weaponTypes : []);
    if (weaponType.checked) values.add(weaponType.dataset.entryWeaponType);
    else values.delete(weaponType.dataset.entryWeaponType);
    state.item.weaponTypes = [...values];
    return;
  }
  const weaponId = event.target?.closest?.('#combat-entry-editor-overlay [data-entry-weapon-id]');
  if (weaponId && state.item) {
    const values = new Set(Array.isArray(state.item.compatibleWeaponIds) ? state.item.compatibleWeaponIds : []);
    if (weaponId.checked) values.add(weaponId.dataset.entryWeaponId);
    else values.delete(weaponId.dataset.entryWeaponId);
    state.item.compatibleWeaponIds = [...values];
    return;
  }
  const field = event.target?.closest?.('#combat-entry-editor-overlay [data-entry-field], #combat-entry-editor-overlay [data-entry-cost-field]');
  if (!field || !state.item) return;
  if (syncSpellLevel(field)) return;
  if (field.dataset.entryCostField) updateCost(field);
  else {
    setAtPath(state.item, field.dataset.entryField, fieldValue(field));
    syncSingleActivationCost(field);
  }
});

document.addEventListener('click', event => {
  const trigger = event.target?.closest?.('#combat-entry-editor-overlay [data-entry-action]');
  if (!trigger) return;
  const action = trigger.dataset.entryAction;
  if (action === 'close') close();
  if (action === 'add-cost') {
    if (!Array.isArray(state.item.costs)) state.item.costs = [];
    state.item.costs.push({ id: `cost-${Date.now().toString(36)}`, resourceId: '', name: 'Ressource', amount: 1, scope: 'persistent' });
    render();
  }
  if (action === 'add-rule') {
    if (!Array.isArray(state.item.triggerRules)) state.item.triggerRules = [];
    state.item.triggerRules.push({
      id: `combat-rule-${Date.now().toString(36)}`,
      name: 'Neue Regel', enabled: true, phase: 'post-roll', recipient: 'actor', sourceRelation: 'self', authority: 'passive',
      activation: 'passive', frequency: 'always', condition: 'always', actionKinds: [],
      skillIds: [], requiredTargetTags: [],
      actionScope: '', consumeReaction: true, costs: [],
      radiusMeters: null, priority: 0, description: '',
      resultEffects: [],
      effects: { attackModifier: 0, defenseModifier: 0, savingThrowModifier: 0, spellSaveDcModifier: 0, skillModifier: 0, damageModifier: 0, damageReduction: 0, rollMode: 'normal', outcome: 'none' }
    });
    render();
  }
  if (action === 'add-effect') {
    const path = trigger.dataset.entryEffectPath || 'effects';
    let effects = getAtPath(state.item, path);
    if (!Array.isArray(effects)) {
      effects = [];
      setAtPath(state.item, path, effects);
    }
    effects.push(createDefaultEffect());
    render();
  }
  if (action === 'remove-effect') {
    const path = trigger.dataset.entryEffectPath || 'effects';
    getAtPath(state.item, path)?.splice(Number(trigger.dataset.entryIndex), 1);
    render();
  }
  if (action === 'remove-rule') {
    state.item.triggerRules?.splice(Number(trigger.dataset.entryIndex), 1);
    render();
  }
  if (action === 'remove-cost') {
    state.item.costs.splice(Number(trigger.dataset.entryIndex), 1);
    render();
  }
  if (action === 'save') {
    if (!String(state.item?.name || '').trim()) {
      const error = document.querySelector('[data-entry-role="error"]');
      if (error) { error.hidden = false; error.textContent = 'Bitte gib einen Namen an.'; }
      return;
    }
    const callback = state.onSave;
    const value = clone(state.item);
    close();
    callback?.(value);
  }
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && document.getElementById('combat-entry-editor-overlay')?.classList.contains('active')) close();
});

export function openCombatEntryEditor({ kind, item, resources = [], weapons = [], inventoryItems = [], onSave } = {}) {
  if (!['quirk', 'ability', 'technique', 'weapon', 'spell'].includes(kind)) throw new Error('Unbekannter Kampfprofil-Editor.');
  state.kind = kind;
  state.item = clone(item || {});
  state.resources = clone(resources || []);
  state.weapons = clone(weapons || []);
  state.inventoryItems = clone(inventoryItems || []);
  state.onSave = typeof onSave === 'function' ? onSave : null;
  render();
}

export const combatEntryEditorInternals = Object.freeze({ getAtPath, setAtPath, fieldValue });
