import { SCENE_ITEM_KINDS, SCENE_ITEM_AXES, sceneItemDraftFromTemplate, buildSceneItemDefinition } from './scene-item-definition.js';
import { REGISTER_CATEGORIES } from '../item-register/item-register-model.js';
const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const categories = Object.fromEntries(REGISTER_CATEGORIES.map(category => [category.id, category.label]));
const bindings = new WeakMap();
export function sceneTemplates() {
  const snapshot = globalThis.AleriaItemRegister?.store.snapshot() || {};
  return [...(snapshot.standards || []), ...(snapshot.offers || []).filter(item => item.moduleId || item.id?.startsWith('offer:'))]
    .filter(item => !['pferde', 'vieh'].includes(item.category));
}
function templateOptions(selected) {
  const groups = new Map();
  for (const item of sceneTemplates()) {
    const key = `${categories[item.category] || 'Weitere Gegenstände'} · ${item.section === 'standard' ? 'Grundsortiment' : item.listName || 'Angebote'}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(item);
  }
  return '<option value="">Neuer eigener Gegenstand</option>' + [...groups].sort(([a], [b]) => a.localeCompare(b, 'de')).map(([name, items]) =>
    `<optgroup label="${escape(name)}">${items.sort((a,b) => a.title.localeCompare(b.title, 'de')).map(item => `<option value="${escape(item.id)}" ${selected === item.id ? 'selected' : ''}>${escape(item.title)}</option>`).join('')}</optgroup>`).join('');
}
export function refreshSceneItemTemplates() {
  for (const select of document.querySelectorAll('[data-scene-editor] [data-scene-field="template"]')) {
    const selected = select.value;
    const options = templateOptions(selected);
    if (select.innerHTML !== options) select.innerHTML = options;
  }
}
export function renderSceneItemComposer(segment) {
  segment.sceneItemDraft ||= sceneItemDraftFromTemplate();
  segment.sceneItemOperationId ||= crypto.randomUUID();
  const draft = segment.sceneItemDraft;
  const input = (key, label, type = 'text', extra = '') => `<label>${label}<input data-scene-field="${key}" type="${type}" value="${escape(draft[key])}" ${extra}></label>`;
  return `<section class="scene-item-editor" data-scene-editor="${escape(segment.id)}">
    <header><h3>Gegenstand Einfügen</h3><p>Registervorlage wählen oder einen eigenen Fund gestalten. Nach dem Eintragen ist er über „Interagieren“ aufnehmbar.</p></header>
    <label>Vorlage aus dem Handelsregister<select data-scene-field="template">${templateOptions(draft.template)}</select></label>
    <div class="scene-item-fields">${input('name', 'Name', 'text', 'maxlength="160" required')}
      <label>Itemkarten-Template<select data-scene-field="category">${Object.entries(SCENE_ITEM_KINDS).map(([key, label]) => `<option value="${key}" ${draft.category === key ? 'selected' : ''}>${label}</option>`).join('')}</select></label>
      ${input('image', 'Bildlink', 'url', 'placeholder="https://…" maxlength="2000"')}${input('type', 'Unterart · z. B. Ritterschwert')}
    </div>
    <label>Immersive Kurzbeschreibung<textarea data-scene-field="description" rows="3" maxlength="1800" required>${escape(draft.description)}</textarea></label>
    <label>Text in der Szene<textarea data-scene-field="sceneText" rows="2" maxlength="1800" placeholder="Zwischen den Wurzeln liegt … (optional)">${escape(draft.sceneText)}</textarea></label>
    <details open><summary>Handelspreis & Eigenschaften</summary><div class="scene-item-fields">${input('priceMin', 'Handelspreis ab · Kupfertaler', 'number', 'min="0" step="0.01"')}${input('priceMax', 'Handelspreis bis · Kupfertaler', 'number', 'min="0" step="0.01"')}${input('weight', 'Gewicht')}${input('valuationNote', 'Preisgrundlage')}</div>
      <div class="scene-item-axes">${SCENE_ITEM_AXES.map((label, index) => `<label>${label}<input type="number" min="0" max="10" data-scene-axis="${index}" value="${Number(draft.attributes?.[index]?.value) || 0}"></label>`).join('')}</div></details>
    ${draft.category === 'weapon' ? `<div class="scene-item-fields">${input('damageFormula', 'Schaden · z. B. 1W8')}${input('damageType', 'Schadensart')}${input('attackBonus', 'Trefferbonus', 'number', 'min="-10" max="10"')}${input('damageBonus', 'Schadensbonus', 'number', 'min="-20" max="20"')}</div>` : ''}
    ${draft.category === 'armor' ? `<div class="scene-item-fields">${input('baseArmorClass', 'Rüstungsklasse', 'number', 'min="0" max="30"')}${input('armorClassBonus', 'Rüstungsbonus', 'number', 'min="-10" max="10"')}</div>` : ''}
    ${['weapon', 'armor'].includes(draft.category) ? input('properties', 'Handhabung & Eigenschaften') : ''}
    <label>Infotabelle & beschriebene Wirkungen<textarea data-scene-field="info" rows="3" maxlength="4000" placeholder="Qualität: Sorgfältig geschmiedet&#10;Wirkung: …">${escape(draft.info)}</textarea></label>
    <p class="scene-item-help">Pro Zeile „Bezeichnung: Inhalt“. Freitextwirkungen beschreibt die Spielleitung; Würfelwerte oben und hinterlegte Vorlageneffekte greifen automatisch.</p>
    <button type="button" data-scene-item-action="preview">Itemkarte ansehen ↗</button><p data-scene-error role="status"></p>
  </section>`;
}
export function mountSceneItemComposer(root, { segments, onChange, onRender }) {
  bindings.set(root, { segments, onChange, onRender });
  if (root.dataset.sceneItemsBound) return;
  root.dataset.sceneItemsBound = 'true';
  root.addEventListener('input', event => {
    const editor = event.target.closest('[data-scene-editor]');
    if (!editor) return;
    const binding = bindings.get(root), segment = binding.segments.find(row => row.id === editor.dataset.sceneEditor);
    if (!segment) return;
    const field = event.target.dataset.sceneField;
    if (field === 'template') {
      segment.sceneItemDraft = sceneItemDraftFromTemplate(sceneTemplates().find(item => item.id === event.target.value));
      binding.onRender();
    } else if (field) {
      segment.sceneItemDraft[field] = event.target.value;
      if (field === 'category') binding.onRender();
    } else if (event.target.dataset.sceneAxis != null) {
      const index = Number(event.target.dataset.sceneAxis);
      segment.sceneItemDraft.attributes[index] = { label: SCENE_ITEM_AXES[index], value: Number(event.target.value) };
    }
    segment.text = segment.sceneItemDraft.sceneText || segment.sceneItemDraft.description || segment.sceneItemDraft.name;
    binding.onChange();
  });
}
export function previewSceneItem(draft) {
  return buildSceneItemDefinition(draft, sceneTemplates().find(item => item.id === draft.template));
}
export function serializeSceneItemSegment(segment) {
  return { kind: 'sceneitem', commentKind: 'sceneitem', clientSegmentId: segment.id, narrator: true, charName: 'Erzähler', characterId: '',
    text: segment.sceneItemDraft?.sceneText || segment.sceneItemDraft?.description || segment.sceneItemDraft?.name || 'Gegenstand Einfügen',
    durationSeconds: segment.durationSeconds, sceneItemDraft: structuredClone(segment.sceneItemDraft || {}), sceneItemOperationId: segment.sceneItemOperationId };
}
export function getSceneItemDraftForEditor(editor) {
  const root = editor.closest('#cf-segment-list');
  return bindings.get(root)?.segments.find(segment => segment.id === editor.dataset.sceneEditor)?.sceneItemDraft;
}
