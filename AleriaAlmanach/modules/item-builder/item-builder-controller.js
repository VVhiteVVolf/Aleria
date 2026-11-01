import { itemBuilderDraft, definitionFromBuilderDraft } from './item-builder-model.js';
import { itemBuilderMarkup } from './item-builder-view.js';
import { normalizeItemCombatDefinition, definitionTemplate } from '../item-definitions/item-definition-model.js';
import { itemDefinitionRegistry } from '../item-definitions/item-definition-registry.js';
import { itemDefinitionStore } from '../item-definitions/item-definition-store.js';
import { connectItemDefinitionClient } from '../item-definitions/item-definition-client.js';
import { STANDARD_ITEMS } from '../item-register/item-register-standard.js';
import { ensureItemBuilderStyles } from './item-builder-styles.js';

let dialog = null, active = null;
const drafts = new Map();
function finish(template = null) {
  if (!active || active.busy) return;
  if (!template) { try { collect(); } catch {} }
  const current = active;
  if (template) drafts.delete(current.key);
  else drafts.set(current.key, structuredClone(current.draft));
  active = null;
  dialog.close(); globalThis.deactivateDialog?.(dialog.id);
  current.resolve(template);
}
function collect() {
  const draft = active.draft;
  if (draft.intent === 'existing') return;
  const values = Object.fromEntries(new FormData(dialog.querySelector('form')));
  for (const key of ['title', 'type', 'image', 'description', 'mechanicsStatus']) draft[key] = values[key] ?? draft[key];
  draft.weight = values.weight === '' ? null : Number(values.weight);
  if (draft.combatDefinition) {
    for (const key of ['damageFormula', 'versatileDamageFormula', 'damageType', 'weaponType', 'weaponProfileId', 'training', 'attackAttribute', 'range', 'requirements', 'properties', 'notes', 'aiInstructions', 'armorKind', 'armorCategory', 'dexterityMode']) {
      if (values[key] !== undefined) draft.combatDefinition[key] = values[key];
    }
    for (const key of ['attackBonus', 'damageBonus', 'baseArmorClass', 'armorClassBonus', 'dexterityCap']) if (values[key] !== undefined) draft.combatDefinition[key] = Number(values[key]);
    if (values.triggerRules !== undefined) draft.combatDefinition.triggerRules = JSON.parse(values.triggerRules || '[]');
    if (values.armorMechanics !== undefined) draft.combatDefinition.mechanics = JSON.parse(values.armorMechanics || '{}');
    if (values.equipCosts !== undefined) draft.combatDefinition.equipCosts = JSON.parse(values.equipCosts || '[]');
    if (values.weaponMechanics !== undefined) {
      const rules = JSON.parse(values.weaponMechanics || '{}');
      for (const key of ['effects', 'activationType', 'costs', 'auraBypass', 'ammunition', 'spendAllRegularActions']) if (Object.hasOwn(rules, key)) draft.combatDefinition[key] = rules[key];
    }
    if (values.protectionAmount !== undefined) {
      const split = value => String(value || '').split(',').map(part => part.trim()).filter(Boolean);
      draft.combatDefinition.damageProtection = Number(values.protectionAmount) ? { name: draft.combatDefinition.damageProtection?.name || 'Ausrüstungsschutz',
        amount: Number(values.protectionAmount), damageTypes: split(values.protectionTypes), excludedDamageTypes: split(values.protectionExcluded) } : null;
    }
  }
  draft.useDefinition = { ...draft.useDefinition, mode: values.useMode, quantity: Number(values.useQuantity),
    chargesMaximum: Number(values.chargesMaximum), chargesPerUse: Number(values.chargesPerUse), recovery: values.recovery, narrative: values.useNarrative,
    costs: [...dialog.querySelectorAll('[data-ib-cost]')].map(row => ({ resourceId: row.querySelector('[name="costResource"]').value, amount: Number(row.querySelector('[name="costAmount"]').value) })),
    effects: [...dialog.querySelectorAll('[data-ib-effect]')].map(row => ({ type: row.querySelector('[name="effectType"]').value,
      amount: Number(row.querySelector('[name="effectAmount"]').value), resourceId: row.querySelector('[name="effectResource"]').value })) };
  draft.inventoryUseMode = draft.useDefinition.mode;
}
function error(failure) { dialog.querySelector('[data-ib-error]').textContent = failure?.message || String(failure || ''); }
function render() {
  const expanded = new Set([...dialog.querySelectorAll('[data-ib-disclosure][open]')].map(node => node.dataset.ibDisclosure));
  const scrollTop = dialog.querySelector('.ib-content')?.scrollTop || 0;
  dialog.innerHTML = itemBuilderMarkup(active.draft, active.templates);
  for (const node of dialog.querySelectorAll('[data-ib-disclosure]')) node.open = expanded.has(node.dataset.ibDisclosure);
  dialog.querySelector('.ib-content').scrollTop = scrollTop;
}
function ensureDialog() {
  if (dialog) return;
  ensureItemBuilderStyles();
  dialog = document.createElement('dialog'); dialog.id = 'item-builder-dialog'; dialog.className = 'item-builder'; dialog.setAttribute('aria-labelledby', 'item-builder-title');
  document.body.appendChild(dialog);
  dialog.addEventListener('cancel', event => { event.preventDefault(); finish(); });
  dialog.addEventListener('click', event => {
    const target = event.target.closest('[data-ib-action]');
    if (!target || !active || active.busy) return;
    if (target.dataset.ibAction === 'cancel') return finish();
    try {
      collect();
      if (target.dataset.ibAction === 'add-effect') active.draft.useDefinition.effects.push({ type: 'healing', amount: 0 });
      if (target.dataset.ibAction === 'remove-effect') active.draft.useDefinition.effects.splice(Number(target.dataset.ibIndex), 1);
      if (target.dataset.ibAction === 'add-cost') active.draft.useDefinition.costs.push({ resourceId: 'bonus-action', amount: 1 });
      if (target.dataset.ibAction === 'remove-cost') active.draft.useDefinition.costs.splice(Number(target.dataset.ibIndex), 1);
      render();
      if (target.dataset.ibAction === 'add-effect') [...dialog.querySelectorAll('[data-ib-effect]')].at(-1)?.querySelector('select')?.focus();
      if (target.dataset.ibAction === 'add-cost') [...dialog.querySelectorAll('[data-ib-cost]')].at(-1)?.querySelector('select')?.focus();
    } catch (failure) { error(failure); }
  });
  dialog.addEventListener('input', event => {
    if (event.target.name !== 'sourceSearch') return;
    const terms = event.target.value.toLocaleLowerCase('de').split(/\s+/).filter(Boolean);
    for (const option of dialog.querySelector('[name="sourceId"]').options) option.hidden = !!option.value && !terms.every(term => option.text.toLocaleLowerCase('de').includes(term));
  });
  dialog.addEventListener('change', event => {
    if (!active || active.busy) return;
    const name = event.target.name, value = event.target.value;
    if (!['intent', 'sourceId', 'category'].includes(name)) return;
    try {
      collect();
      if (name === 'sourceId') {
        const source = active.templates.find(item => item.id === value);
        active.draft = itemBuilderDraft(source, { intent: active.draft.intent === 'edit' ? 'variant' : source ? active.draft.intent : 'variant' });
      } else if (name === 'intent') {
        const source = active.templates.find(item => item.id === active.draft.sourceId);
        active.draft.intent = value;
        active.draft.id = value === 'edit' ? source?.definitionRef?.id || '' : '';
        active.draft.revision = value === 'edit' ? source?.definitionRef?.revision || '' : '';
      } else {
        active.draft.category = value;
        active.draft.combatDefinition = normalizeItemCombatDefinition(null, value);
      }
      active.pending = null; render();
    } catch (failure) { error(failure); }
  });
  dialog.addEventListener('submit', async event => {
    event.preventDefault();
    if (!active || active.busy) return;
    try {
      if (active.draft.intent === 'existing') {
        const source = active.templates.find(item => item.id === active.draft.sourceId);
        if (!source?.definitionRef) throw Error('Bitte eine vorhandene Definition auswählen.');
        return finish(source);
      }
      collect();
      const definition = definitionFromBuilderDraft(active.draft);
      const content = JSON.stringify(definition);
      if (active.pending?.content !== content) active.pending = { content, request: { action: 'save', operationId: crypto.randomUUID(),
        expectedRevision: active.draft.intent === 'edit' ? active.draft.revision : '',
        definition: { ...definition, id: active.draft.id || `${definition.kind === 'unique' ? 'unique' : 'item'}:${crypto.randomUUID()}` } } };
      active.busy = true;
      dialog.querySelector('[type="submit"]').disabled = true;
      await connectItemDefinitionClient();
      const result = await itemDefinitionStore.save(active.pending.request);
      active.busy = false;
      drafts.delete(active.key);
      finish(result.template);
    } catch (failure) { if (active) { active.busy = false; dialog.querySelector('[type="submit"]').disabled = false; error(failure); } }
  });
}
export async function openItemBuilder({ source = null, templates = null, key = source?.id || 'new-item', intent } = {}) {
  if (active) throw Error('Bitte den geöffneten Item-Builder zuerst abschließen.');
  if (source?.definitionRef) {
    if (!itemDefinitionRegistry.get(source.definitionRef)) { await connectItemDefinitionClient(); await itemDefinitionStore.ensureVersions([{ items: [source] }]); }
    const definition = itemDefinitionRegistry.get(source.definitionRef);
    if (definition) source = { ...definitionTemplate(definition), id: `${definition.id}@${definition.revision}` };
  }
  ensureDialog();
  const register = globalThis.AleriaItemRegister?.store.snapshot();
  const available = templates || [...(register?.standards || STANDARD_ITEMS), ...(register?.offers || []), ...itemDefinitionStore.snapshot().templates];
  const byId = new Map(available.filter(item => item.section !== 'owned').map(item => [item.id, item]));
  if (source?.id && source.definitionRef && source.section !== 'owned') byId.set(source.id, source);
  return new Promise(resolve => {
    active = { resolve, key, templates: [...byId.values()], draft: drafts.get(key) || itemBuilderDraft(source, { intent }), busy: false, pending: null };
    render(); dialog.querySelector('.ib-content').scrollTop = 0; dialog.showModal(); globalThis.activateDialog?.(dialog.id, { initialFocus: '[name="intent"]' });
  });
}
