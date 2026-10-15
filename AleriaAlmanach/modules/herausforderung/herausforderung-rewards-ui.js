import { renderChallengeCombatEffects, renderChallengeRecipientOptions, renderChallengeCombatChoiceOptions, updateChallengeCombatInput } from './herausforderung-combat-effects-ui.js';
import { renderChallengeEffectUsage, renderChallengeUsageActorOptions, updateChallengeEffectUsage } from './herausforderung-effect-usage-ui.js?v=20261015-check-options-v1';
import { CHALLENGE_COMBAT_EFFECT_TYPES, MAX_CHALLENGE_COMBAT_EFFECTS } from './herausforderung-combat-effects.js?v=20261015-graded-challenges-v1';
import { collectRegisterTemplates } from '../item-register/item-register-templates.js';
import { mountRegisterTemplatePicker, refreshRegisterTemplatePicker, createRegisterTemplatePickerState } from '../item-register/item-register-template-picker.js';
import { formatCopper } from '../item-register/item-register-money.js';
import { STANDARD_ITEMS } from '../item-register/item-register-standard.js';
import { COMBAT_STATUS_PRESETS, STATUS_MODIFIERS, STATUS_ROLL_MODES } from '../combat-status/combat-status-catalog.js';
import { STATUS_DURATIONS, formatStatusDuration } from '../combat-status/combat-status-model.js?v=20261015-graded-challenges-v1';
import { normalizeHerausforderungBenefits, hasHerausforderungBenefits, MAX_REWARD_ITEMS, MAX_REWARD_EFFECTS, formatHerausforderungRewardReceipt } from './herausforderung-rewards.js?v=20261015-graded-challenges-v1';

const bindings = new WeakMap();
const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const icon = name => `<img class="herausforderung-icon" src="./public/assets/herausforderung/${name}-v1.png" alt="" decoding="async">`;
const BUNDLES = { rewards: ['Belohnung bei Erfolg', 'buff'], partialEffects: ['Folgen bei knappem Scheitern', 'debuff'], failureEffects: ['Folgen bei deutlichem Scheitern', 'debuff'] };
function templates() { return collectRegisterTemplates(globalThis.AleriaItemRegister?.store.snapshot() || { standards: STANDARD_ITEMS }); }

function effectMarkup(effect, index, defaultKind) {
  const kind = effect.kind || defaultKind;
  const modifierInputs = STATUS_MODIFIERS.map(([key, label]) => `<label>${label}<input type="number" min="-30" max="30" step="1" data-hr-field="modifier" data-modifier="${key}" value="${escape(effect.mechanics?.[key] || 0)}"></label>`).join('');
  return `<div class="herausforderung-effect" data-hr-effect-index="${index}">
    <div class="herausforderung-effect-head"><strong>${icon(kind === 'buff' ? 'buff' : 'debuff')}${kind === 'buff' ? 'Buff' : 'Debuff / Zustand'} ${index + 1}</strong><button type="button" data-hr-action="remove-effect" aria-label="Effekt entfernen">Entfernen ×</button></div>
    <div class="herausforderung-reward-grid"><label>Art<select data-hr-field="kind">${[["buff", "Buff"], ["debuff", "Debuff"], ["condition", "Zustand"]].map(([value, label]) => `<option value="${value}"${kind === value ? " selected" : ""}>${label}</option>`).join("")}</select></label><label>Empfänger<select data-hr-field="targetActorId" data-hr-recipient="${escape(effect.targetActorId || '')}"></select></label><label>Vorlage<select data-hr-field="presetId"><option value="">Eigener Effekt</option>${COMBAT_STATUS_PRESETS.map(preset => `<option value="${preset.id}"${effect.presetId === preset.id ? ' selected' : ''}>${escape(preset.name)}</option>`).join('')}</select></label><label>Name<input maxlength="160" data-hr-field="name" value="${escape(effect.name)}"></label><label>Dauer<select data-hr-field="durationKind">${STATUS_DURATIONS.map(([id, label]) => `<option value="${id}"${effect.durationKind === id ? ' selected' : ''}>${label}</option>`).join('')}</select></label><label>Beitragsanzahl<input type="number" min="1" max="999" data-hr-field="durationAmount" value="${escape(effect.durationAmount)}"${['actor-comments', 'scene-comments'].includes(effect.durationKind) ? '' : ' disabled'}></label></div>
    ${renderChallengeEffectUsage(effect)}
    <label>Beschreibung<textarea maxlength="1600" rows="2" data-hr-field="description">${escape(effect.description)}</textarea></label>
    <details class="herausforderung-effect-values"><summary>Boni, Mali & Wurfarten</summary><div class="herausforderung-reward-modifiers">${modifierInputs}${STATUS_ROLL_MODES.map(([key, label]) => `<label>${label}<select data-hr-field="rollMode" data-modifier="${key}">${[['normal', 'Normal'], ['advantage', 'Vorteil'], ['disadvantage', 'Nachteil']].map(([value, text]) => `<option value="${value}"${effect.mechanics?.[key] === value ? ' selected' : ''}>${text}</option>`).join('')}</select></label>`).join('')}</div></details>
  </div>`;
}

export function renderHerausforderungRewardEditor(approach, index, { outcomeIndex = null } = {}) {
  const outcome = outcomeIndex == null ? null : approach.outcomeTable?.[outcomeIndex];
  const bundles = outcome ? [[outcome.success ? 'rewards' : 'failureEffects', ['Wirkung dieser Ergebnisstufe', outcome.success ? 'buff' : 'debuff']]] : Object.entries(BUNDLES);
  return `<details class="herausforderung-benefits" data-hr-editor data-hr-approach-index="${index}"${outcome ? ` data-hr-outcome-index="${outcomeIndex}"` : ''}${!outcome && hasHerausforderungBenefits(approach) ? ' open' : ''}><summary>${icon('items')} Belohnungen & mechanische Folgen <small>Inventar · Kupfertaler · Buffs · Debuffs</small></summary><div class="herausforderung-benefits-body"><p class="herausforderung-note">${outcome ? 'Nur die erreichte Ergebnisstufe wird angewendet. Bereits ausgewertete Versuche behalten ihre ursprünglichen Folgen.' : 'Erfolg belohnt die erfolgreiche Figur einmalig. Fehlschlagsfolgen gelten je Figur und Ergebnisstufe einmal; der Ansatz bleibt offen.'}</p>${bundles.map(([field, [label, kind]]) => {
    const bundle = (outcome ? outcome.benefits : approach[field]) || normalizeHerausforderungBenefits();
    return `<details class="herausforderung-benefit-bundle" data-hr-bundle="${field}" data-hr-section="${field}"${field === 'rewards' || bundle.effects.length || bundle.combatEffects?.length ? ' open' : ''}><summary>${icon(kind === 'buff' ? 'items' : 'debuff')}${label}</summary><div>
      ${field === 'rewards' ? `<label><span>${icon('copper')}Kupfertaler (KT)</span><input type="number" min="0" max="1000000000" step="0.01" data-hr-field="copper" value="${escape(bundle.copper || '')}" placeholder="0"></label><p class="herausforderung-note">Gegenstände und Kupfertaler werden direkt ins Inventar übernommen. Belohnungen sind in der öffentlichen Vorschau sichtbar.</p><div class="herausforderung-reward-picker"><section data-hr-template-picker aria-label="Belohnung aus dem Handelsregister auswählen"></section><div class="herausforderung-reward-add"><label>Menge<input type="number" min="1" max="9999" data-hr-field="item-quantity" value="1"></label><button type="button" class="herausforderung-button" data-hr-action="add-item"${bundle.items.length >= MAX_REWARD_ITEMS ? ' disabled' : ''}>${icon('items')}Gegenstand hinzufügen</button></div></div><ul class="herausforderung-reward-items">${bundle.items.map((item, itemIndex) => `<li data-hr-item-index="${itemIndex}"><span>${escape(item.title || item.product?.title || item.template)}</span><label>Menge<input type="number" min="1" max="9999" data-hr-field="quantity" value="${escape(item.quantity)}"></label><button type="button" data-hr-action="remove-item" aria-label="${escape(item.title || 'Gegenstand')} entfernen">×</button></li>`).join('')}</ul>` : ''}
      ${bundle.effects.map((effect, effectIndex) => effectMarkup(effect, effectIndex, kind)).join('')}
      <button type="button" class="herausforderung-button" data-hr-action="add-effect"${bundle.effects.length >= MAX_REWARD_EFFECTS ? ' disabled' : ''}>${icon(kind)}＋ ${kind === 'buff' ? 'Buff' : 'Debuff / Zustand'} hinzufügen</button>${renderChallengeCombatEffects(bundle, field)}<p class="herausforderung-reward-error" data-hr-error role="status"></p>
    </div></details>`;
  }).join('')}</div></details>`;
}

function rerender(editor, binding) {
  const index = Number(editor.dataset.hrApproachIndex);
  const open = editor.open;
  const bundles = [...editor.querySelectorAll('[data-hr-bundle][open]')].map(element => element.dataset.hrBundle);
  const outcomeIndex = editor.dataset.hrOutcomeIndex == null ? null : Number(editor.dataset.hrOutcomeIndex);
  editor.outerHTML = renderHerausforderungRewardEditor(binding.approaches[index], index, { outcomeIndex });
  const next = binding.root.querySelector(`[data-hr-approach-index="${index}"]${outcomeIndex == null ? ':not([data-hr-outcome-index])' : `[data-hr-outcome-index="${outcomeIndex}"]`}`);
  next.open = open;
  next.querySelectorAll('[data-hr-bundle]').forEach(element => element.open = bundles.includes(element.dataset.hrBundle));
  mountPickers(binding);
}

function context(root, target) {
  const editor = target.closest('[data-hr-editor]');
  const binding = bindings.get(root);
  const approach = binding?.approaches[Number(editor?.dataset.hrApproachIndex)];
  const field = target.closest('[data-hr-bundle]')?.dataset.hrBundle;
  const outcome = editor?.dataset.hrOutcomeIndex == null ? null : approach?.outcomeTable?.[Number(editor.dataset.hrOutcomeIndex)];
  return approach && field ? { editor, binding, approach, owner: outcome || approach, field, bundle: outcome ? outcome.benefits : approach[field], kind: BUNDLES[field][1] } : null;
}

function mountPickers(binding) {
  for (const select of binding.root.querySelectorAll('[data-hr-usage-actor]')) {
    const ctx = context(binding.root, select);
    const effect = ctx.bundle.effects[Number(select.closest('[data-hr-effect-index]').dataset.hrEffectIndex)];
    select.innerHTML = renderChallengeUsageActorOptions(binding.getCombatContext(), effect.usage?.actorId || '');
  }
  for (const select of binding.root.querySelectorAll('[data-hr-combat-choice]')) {
    const ctx = context(binding.root, select);
    const effect = ctx.bundle.combatEffects[Number(select.closest('[data-hr-combat-index]').dataset.hrCombatIndex)];
    select.innerHTML = renderChallengeCombatChoiceOptions(binding.getCombatContext(), effect, select.dataset.hrCombatChoice);
  }
  for (const select of binding.root.querySelectorAll('[data-hr-recipient]')) {
    const ctx = context(binding.root, select);
    const effectIndex = select.closest('[data-hr-effect-index]')?.dataset.hrEffectIndex;
    const combatIndex = select.closest('[data-hr-combat-index]')?.dataset.hrCombatIndex;
    const selected = combatIndex !== undefined ? ctx.bundle.combatEffects[combatIndex].targetActorId : ctx.bundle.effects[effectIndex].targetActorId;
    select.innerHTML = renderChallengeRecipientOptions(binding.getCombatContext(), selected || '');
  }
  for (const picker of binding.root.querySelectorAll('[data-hr-template-picker]')) {
    const editor = picker.closest('[data-hr-editor]');
    const ctx = context(binding.root, picker);
    let state = binding.pickerStates.get(ctx.owner);
    if (!state) { state = createRegisterTemplatePickerState(); binding.pickerStates.set(ctx.owner, state); }
    mountRegisterTemplatePicker(picker, { items: templates(), state, onSelect: product => {
      const quantity = editor.querySelector('[data-hr-field="item-quantity"]');
      const single = ['waffen', 'ruestungen'].includes(product?.category);
      const busy = binding.root.getAttribute('aria-busy') === 'true';
      quantity.disabled = single || busy;
      if (single) quantity.value = '1';
      editor.querySelector('[data-hr-action="add-item"]').disabled = busy || !product || ctx.bundle.items.length >= MAX_REWARD_ITEMS;
    } });
  }
}

function refreshRegisterTemplates(root) {
  for (const picker of root.querySelectorAll('[data-hr-template-picker]')) refreshRegisterTemplatePicker(picker, templates());
}

export function mountHerausforderungRewardEditor(root, { approaches, onChange, getCombatContext = () => ({ participants: [] }) }) {
  const previous = bindings.get(root);
  const binding = { root, approaches, onChange, getCombatContext, pickerStates: previous?.pickerStates || new WeakMap() };
  bindings.set(root, binding);
  mountPickers(binding);
  if (previous) return;
  document.addEventListener('aleria:item-register-records', () => refreshRegisterTemplates(root));
  root.addEventListener('click', event => {
    const trigger = event.target.closest('[data-hr-action]');
    if (!trigger || root.getAttribute('aria-busy') === 'true') return;
    const ctx = context(root, trigger);
    if (!ctx) return;
    const { bundle, editor, binding, kind } = ctx;
    const action = trigger.dataset.hrAction;
    if (action === 'add-item') {
      const selected = binding.pickerStates.get(ctx.owner)?.selectedId;
      const product = templates().find(item => item.id === selected);
      const quantity = Number(editor.querySelector('[data-hr-field="item-quantity"]').value);
      if (!product || !Number.isSafeInteger(quantity) || quantity < 1 || quantity > 9999) { editor.querySelector('[data-hr-error]').textContent = 'Registervorlage und gültige Menge wählen.'; return; }
      if (['waffen', 'ruestungen'].includes(product.category) && quantity !== 1) { editor.querySelector('[data-hr-error]').textContent = 'Waffen und Rüstungen werden einzeln vergeben.'; return; }
      if (bundle.items.length >= MAX_REWARD_ITEMS) return;
      bundle.items.push({ template: product.id, moduleId: product.moduleId || '', sourceRevision: product.sourceRevision || '', title: product.title, quantity });
    }
    if (action === 'remove-item') bundle.items.splice(Number(trigger.closest('[data-hr-item-index]').dataset.hrItemIndex), 1);
    if (action === 'add-effect') {
      if (bundle.effects.length >= MAX_REWARD_EFFECTS) return;
      const preset = COMBAT_STATUS_PRESETS.find(item => item.id === (kind === 'buff' ? 'blessed' : 'bane'));
      bundle.effects.push({ effectId: crypto.randomUUID().slice(0, 12), presetId: preset.id, name: preset.name, description: preset.description,
        kind, durationKind: 'actor-comments', durationAmount: 2, mechanics: { ...(preset.mechanics || {}) } });
    }
    if (action === 'add-combat-effect') {
      bundle.combatEffects ||= [];
      if (bundle.combatEffects.length >= MAX_CHALLENGE_COMBAT_EFFECTS) return;
      bundle.combatEffects.push({ effectId: crypto.randomUUID().slice(0, 12), type: ctx.field === 'rewards' ? 'healing' : 'damage', amount: 5, formula: '', damageType: 'physisch', magical: false, targetActorId: '', resourceId: '', conditionId: '' });
    }
    if (action === 'remove-combat-effect') bundle.combatEffects.splice(Number(trigger.closest('[data-hr-combat-index]').dataset.hrCombatIndex), 1);
    if (action === 'remove-effect') bundle.effects.splice(Number(trigger.closest('[data-hr-effect-index]').dataset.hrEffectIndex), 1);
    rerender(editor, binding);
    binding.onChange();
  });
  const update = event => {
    const target = event.target;
    const field = target.dataset.hrField;
    const ctx = field ? context(root, target) : null;
    if (!ctx || root.getAttribute('aria-busy') === 'true') return;
    const { bundle, editor, binding } = ctx;
    const combatUpdate = updateChallengeCombatInput(target, bundle);
    if (combatUpdate) {
      if (combatUpdate.rerender) rerender(editor, binding);
      else if (field === 'combat-formula' && target.value) target.closest('[data-hr-combat-index]').querySelector('[data-hr-field="combat-amount"]').value = '0';
      else if (field === 'combat-amount' && Number(target.value) > 0) { const formula = target.closest('[data-hr-combat-index]').querySelector('[data-hr-field="combat-formula"]'); if (formula) formula.value = ''; }
      binding.onChange(); return;
    }
    const itemIndex = target.closest('[data-hr-item-index]')?.dataset.hrItemIndex;
    const effectIndex = target.closest('[data-hr-effect-index]')?.dataset.hrEffectIndex;
    if (field === 'copper') bundle.copper = target.value === '' ? '' : target.valueAsNumber;
    else if (field === 'quantity' && itemIndex !== undefined) bundle.items[Number(itemIndex)].quantity = target.value;
    else if (effectIndex !== undefined) {
      const effect = bundle.effects[Number(effectIndex)];
      if (updateChallengeEffectUsage(effect, field, target.value)) rerender(editor, binding);
      else if (field === 'modifier' || field === 'rollMode') effect.mechanics[target.dataset.modifier] = target.value;
      else if (field === 'presetId') {
        const preset = COMBAT_STATUS_PRESETS.find(item => item.id === target.value);
        Object.assign(effect, { presetId: target.value, kind: preset?.kind || effect.kind, name: preset?.name || effect.name, description: preset?.description || effect.description, mechanics: { ...(preset?.mechanics || {}) } });
        rerender(editor, binding);
      } else { effect[field] = target.value; if (['durationKind', 'kind', 'targetActorId'].includes(field)) rerender(editor, binding); }
    } else return;
    binding.onChange();
  };
  root.addEventListener('input', update);
  root.addEventListener('change', event => { if (event.target.tagName === 'SELECT' || event.target.type === 'checkbox') update(event); });
}

export function rewardSummary(benefits = {}) {
  const parts = [];
  if (Number(benefits.copper) > 0) parts.push(formatCopper(benefits.copper));
  for (const item of benefits.items || []) parts.push(`${item.quantity}× ${item.product?.title || item.title || 'Gegenstand'}`);
  for (const effect of benefits.effects || []) parts.push(`${effect.name || 'Effekt'} (${formatStatusDuration({ usage: effect.usage, durationModel: { kind: effect.durationKind, amount: effect.durationAmount } })})`);
  for (const effect of benefits.combatEffects || []) parts.push(`${CHALLENGE_COMBAT_EFFECT_TYPES.find(([type]) => type === effect.type)?.[1] || effect.type}: ${effect.formula || effect.amount || effect.conditionId}`);
  return parts.join(' · ');
}

export const rewardReceiptSummary = formatHerausforderungRewardReceipt;
