import { CONCEPT_TYPES, conceptTitle, STAGES } from './concept-schema.mjs';
import { createConcept, deleteConcept, mergeConcepts } from './concept-drafts.mjs';
import { CONCEPT_STORAGE_KEY, createConceptStore } from './concept-store.mjs';
import { createConceptCatalogs, draftReferences } from './concept-catalogs.mjs';
import { createConceptPicker } from './concept-picker.mjs';
import { renderConceptEditor, renderDrafts, renderTypeOptions } from './concept-editor.mjs';
import { renderExampleChoices } from './concept-example-view.mjs';
import { referencedName } from './concept-reference-view.mjs';
import { renderMedia, safeConceptUrl } from './concept-media.mjs';
import { bindConceptEvents } from './concept-events.mjs';
import { downloadConcepts, downloadDecisionSheet, readConceptFile } from './concept-transfer.mjs';
import { addTopicDecision, selectMainImage, setDecisionStatus, topicDecisionId } from './concept-decisions.mjs';

export function mountConceptWorkshop(root) {
  const role = name => root.querySelector(`[data-role="${name}"]`);
  const editor = role('editor');
  const fileInput = role('import-file');
  const choiceDialog = role('choice-dialog');
  const deleteDialog = role('delete-dialog');
  const imageDialog = role('image-dialog');
  const store = createConceptStore();
  const listOrder = (a, b) => b.updatedAt - a.updatedAt;
  let drafts = store.refresh();
  const requestedId = new URLSearchParams(location.hash.slice(1)).get('entwurf');
  let activeId = drafts.find(draft => draft.id === requestedId)?.id ?? [...drafts].sort(listOrder)[0]?.id;
  let sectionId = 'profile';
  let relationship = '';
  let reading = false;
  let toDelete;
  let pendingSave = Promise.resolve();

  const activeDraft = () => drafts.find(draft => draft.id === activeId);
  const picker = createConceptPicker(role('picker'), {
    load: createConceptCatalogs(), getDrafts: () => draftReferences(drafts, activeId)
  });

  function announce(message) {
    const notice = role('notice');
    notice.textContent = message;
    notice.hidden = !message;
  }

  function renderSaveStatus() {
    const save = role('save');
    const message = store.error || (drafts.length ? 'In diesem Browser gespeichert.' : 'Entwürfe werden in diesem Browser gespeichert.');
    if (save.textContent !== message) save.textContent = message;
    save.dataset.status = store.error ? 'error' : 'saved';
  }

  function renderSidebar() {
    role('drafts').innerHTML = renderDrafts([...drafts].sort(listOrder), activeId);
    root.querySelector('[data-action="export-all"]').disabled = !drafts.length;
  }

  function render() {
    const draft = activeDraft();
    const type = CONCEPT_TYPES[draft?.kind];
    const section = type?.tabs.find(tab => tab.id === sectionId) || type?.tabs[0];
    if (type && !Object.hasOwn(type.relationGroups, relationship)) relationship = Object.keys(type.relationGroups)[0];
    editor.innerHTML = renderConceptEditor(draft, { drafts, section, relationship, reading });
    renderSidebar();
    renderSaveStatus();
  }

  function activate(id) {
    activeId = id;
    sectionId = 'profile';
    relationship = '';
    reading = false;
    const url = new URL(location.href);
    url.hash = id ? `entwurf=${encodeURIComponent(id)}` : '';
    history.replaceState(history.state, '', url);
    render();
  }

  function commit(update) {
    const next = store.transact(update).then(result => {
      drafts = result;
      renderSaveStatus();
    });
    pendingSave = next.catch(() => announce('Die Änderung konnte nicht gespeichert werden.'));
    return pendingSave;
  }

  function editDraft(id, update) {
    return commit(current => {
      const draft = current.find(entry => entry.id === id);
      if (!draft) return current;
      const changed = update(draft);
      return changed === draft ? current : current.map(entry => (
        entry.id === id ? { ...changed, updatedAt: Date.now() } : entry
      ));
    });
  }

  function rowAddress(element) {
    const row = element.closest('[data-row]');
    return row ? { draftId: activeId, listId: row.dataset.collection, rowId: row.dataset.row } : null;
  }

  function editRow({ draftId, listId, rowId }, update) {
    return editDraft(draftId, draft => {
      const rows = draft.rows[listId];
      const previous = rows?.find(row => row.id === rowId);
      if (!previous) return draft;
      const next = update(previous);
      if (next === previous) return draft;
      return { ...draft, rows: { ...draft.rows, [listId]: rows.map(row => row.id === rowId ? next : row) } };
    });
  }

  function focusRow(address, selector) {
    if (address.draftId !== activeId) return;
    editor.querySelector(`[data-collection="${CSS.escape(address.listId)}"][data-row="${CSS.escape(address.rowId)}"] ${selector}`)?.focus();
  }

  function refreshTitle() {
    const draft = activeDraft();
    const heading = role('active-title');
    if (heading && draft) heading.textContent = conceptTitle(draft);
    const stage = role('active-stage');
    if (stage && draft) stage.textContent = STAGES[draft.fields.stage] || STAGES.idea;
    renderSidebar();
  }

  async function updateField(element) {
    const id = activeId;
    const field = element.dataset.field;
    const value = element.maxLength > 0 ? element.value.slice(0, element.maxLength) : element.value;
    const row = rowAddress(element);
    if (row) {
      await editRow(row, previous => {
        if (previous[field] === value || (row.listId === 'decisions' && previous.status === 'confirmed')) return previous;
        return { ...previous, [field]: value };
      });
      if (id !== activeId) return;
      if (field === 'category') {
        relationship = value;
        render();
        focusRow(row, '[data-field="category"]');
      }
      return;
    }
    await editDraft(id, draft => draft.fields[field] === value ? draft : { ...draft, fields: { ...draft.fields, [field]: value } });
    if (id === activeId && ['name', 'stage'].includes(field)) refreshTitle();
  }

  async function chooseFavorite(id) {
    const draftId = activeId;
    await editDraft(draftId, draft => ({ ...draft, favorite: id }));
    if (activeId !== draftId) return;
    const clear = editor.querySelector('[data-action="clear-favorite"]');
    if (clear) clear.hidden = !id;
    for (const card of editor.querySelectorAll('.variant-card')) {
      const chosen = card.dataset.row === id;
      card.dataset.favorite = String(chosen);
      card.querySelector('[data-role="favorite"]').checked = chosen;
    }
    if (!id) editor.querySelector('[data-role="favorite"]')?.focus();
  }

  async function addRow(listId) {
    const draftId = activeId;
    const rowId = crypto.randomUUID();
    const row = listId === 'relations' ? { id: rowId, category: relationship } : { id: rowId };
    await editDraft(draftId, draft => ({ ...draft, rows: { ...draft.rows, [listId]: [...draft.rows[listId], row] } }));
    if (draftId !== activeId) return;
    render();
    focusRow({ draftId, listId, rowId }, '[data-field]');
  }

  async function chooseMainImage(button) {
    const address = rowAddress(button);
    let result;
    await editDraft(address.draftId, draft => {
      const next = selectMainImage(draft, address.rowId);
      if (next !== draft) result = next.mainImage;
      return next;
    });
    if (address.draftId !== activeId) return;
    render();
    announce(result ? `„${result.title}“ ist als Hauptbild festgelegt.` : 'Für diese Bildvariante wird ein gültiger Bildlink benötigt.');
    focusRow(address, 'h4');
  }

  async function clearMainImage() {
    const id = activeId;
    await editDraft(id, draft => draft.mainImage ? { ...draft, mainImage: null } : draft);
    if (id !== activeId) return;
    render();
    announce('Die Bildfestlegung wurde gelöst.');
    role('main-image-title')?.focus();
  }

  async function changeDecision(button, status) {
    const address = rowAddress(button);
    await editRow(address, row => setDecisionStatus(row, status));
    if (activeId !== address.draftId) return;
    render();
    focusDecision(address);
  }

  function focusDecision(address) {
    const row = activeDraft()?.rows.decisions.find(entry => entry.id === address.rowId);
    focusRow(address, row?.status === 'confirmed' ? '[data-role="decision-heading"]' : '[data-field="result"]');
  }

  async function prepareDecision(topicId) {
    const draftId = activeId;
    await editDraft(draftId, draft => addTopicDecision(draft, topicId));
    if (activeId !== draftId) return;
    render();
    focusDecision({ draftId, listId: 'decisions', rowId: topicDecisionId(topicId) });
  }

  async function removeRow(button) {
    const { draftId, listId, rowId } = rowAddress(button);
    await editDraft(draftId, draft => {
      const rows = draft.rows[listId];
      const remaining = rows.filter(row => row.id !== rowId || (listId === 'decisions' && row.status === 'confirmed'));
      return remaining.length === rows.length ? draft : { ...draft, rows: { ...draft.rows, [listId]: remaining } };
    });
    if (draftId !== activeId) return;
    render();
    editor.querySelector(`[data-action="add-row"][data-collection="${CSS.escape(listId)}"]`)?.focus();
  }

  async function setPickedValue(address, field, entry) {
    await editRow(address, row => field === 'icon'
      ? { ...row, name: row.name?.trim() ? row.name : entry.name, icon: { name: entry.name, src: entry.src } }
      : { ...row, target: { id: entry.id, type: entry.type, name: entry.name, ...(entry.page ? { page: entry.page } : {}) } });
    if (address.draftId !== activeId) return;
    render();
    focusRow(address, `[data-action="choose-${field}"]`);
  }

  function openPicker(button, field) {
    const address = rowAddress(button);
    const row = activeDraft()?.rows[address.listId].find(entry => entry.id === address.rowId);
    picker.open({ kind: field, linkedType: row?.target?.type, onChoose: entry => setPickedValue(address, field, entry) });
  }

  async function clearPickedValue(button, field) {
    const address = rowAddress(button);
    await editRow(address, row => field === 'target'
      ? { ...row, name: referencedName(row, drafts), target: null }
      : { ...row, icon: null });
    if (address.draftId !== activeId) return;
    render();
    focusRow(address, field === 'target' ? '[data-field="name"]' : '[data-action="choose-icon"]');
  }

  async function changeTab(id, kind) {
    await pendingSave;
    if (kind === 'section') {
      sectionId = id;
      announce('');
    } else relationship = id;
    render();
    editor.querySelector(`#${CSS.escape(`${kind}-${id}`)}`)?.focus();
  }

  async function importFile(file) {
    try {
      const incoming = await readConceptFile(file);
      let added;
      await commit(current => {
        const result = mergeConcepts(current, incoming);
        added = result.added;
        return result.drafts;
      });
      if (!added) return;
      activate(added[0].id);
      announce(`${added.length === 1 ? '1 Entwurf' : `${added.length} Entwürfe`} importiert.`);
    } catch (error) { announce(error.message); }
  }

  async function exportFile(id = '') {
    await pendingSave;
    downloadConcepts(store.refresh(), id);
  }

  async function exportDecisions() {
    const id = activeId;
    await pendingSave;
    const draft = store.refresh().find(entry => entry.id === id);
    if (draft) downloadDecisionSheet(draft);
  }

  function showImage(button) {
    const { image, title } = button.dataset;
    if (!safeConceptUrl(image)) return;
    role('image-title').textContent = title || 'Bildreferenz';
    role('image-full').innerHTML = renderMedia(image, title, { preview: false });
    imageDialog.showModal();
  }

  async function openDraft(id) {
    await pendingSave;
    drafts = store.refresh();
    if (!drafts.some(draft => draft.id === id)) {
      announce('Dieser Entwurf ist nicht mehr in der Mappe.');
      renderSidebar();
      return;
    }
    announce('');
    activate(id);
    role('active-title')?.focus();
  }

  function showChoices(title, options) {
    role('choice-title').textContent = title;
    role('choice-options').innerHTML = options;
    choiceDialog.showModal();
  }

  function closeChoices(button) {
    if (choiceDialog.open && choiceDialog.contains(button)) choiceDialog.close();
  }

  async function openExamples(button) {
    const selectedId = button.dataset.id;
    button.disabled = true;
    try {
      const { addConceptExamples } = await import('./concept-examples.mjs');
      let count = 0;
      await commit(current => {
        const result = addConceptExamples(current, selectedId);
        count = result.addedCount;
        return result.drafts;
      });
      closeChoices(button);
      if (!drafts.some(draft => draft.id === selectedId)) return;
      activate(selectedId);
      const message = count === 1 ? 'Ein Entwurf wurde ergänzt.' : `${count} Musterentwürfe wurden ergänzt.`;
      announce(count ? message : '');
      role('active-title')?.focus();
    } catch {
      closeChoices(button);
      announce('Die Musterentwürfe konnten nicht geladen werden.');
    } finally {
      button.disabled = false;
    }
  }

  const actions = {
    'choose-type': () => showChoices('Neuer Entwurf', renderTypeOptions()),
    'choose-examples': () => showChoices('Muster öffnen', renderExampleChoices()),
    async new(button) {
      const draft = createConcept(button.dataset.kind);
      button.disabled = true;
      await commit(current => [...current, draft]);
      button.disabled = false;
      closeChoices(button);
      if (!drafts.some(entry => entry.id === draft.id)) return;
      announce('');
      activate(draft.id);
      editor.querySelector('[data-field="name"]')?.focus();
    },
    examples: openExamples,
    'select-draft': button => openDraft(button.dataset.id),
    section: button => changeTab(button.dataset.id, 'section'),
    relationship: button => changeTab(button.dataset.id, 'relationship'),
    'add-row': button => addRow(button.dataset.collection),
    'remove-row': removeRow,
    'choose-target': button => openPicker(button, 'target'),
    'choose-icon': button => openPicker(button, 'icon'),
    'clear-target': button => clearPickedValue(button, 'target'),
    'clear-icon': button => clearPickedValue(button, 'icon'),
    'clear-favorite': () => chooseFavorite(''),
    'choose-main-image': chooseMainImage,
    'clear-main-image': clearMainImage,
    'add-decision-topic': button => prepareDecision(button.dataset.topic),
    'confirm-decision': button => changeDecision(button, 'confirmed'),
    'reopen-decision': button => changeDecision(button, 'open'),
    'show-image': showImage,
    async 'toggle-reading'() {
      await pendingSave;
      reading = !reading;
      render();
      editor.querySelector('[data-action="toggle-reading"]')?.focus();
    },
    import: () => fileInput.click(),
    'export-all': () => exportFile(),
    'export-one': () => exportFile(activeId),
    'export-decisions': exportDecisions,
    'delete-draft'() {
      toDelete = activeId;
      role('delete-copy').textContent = `„${conceptTitle(activeDraft())}“ wird aus der Entwurfsmappe entfernt.`;
      deleteDialog.returnValue = 'cancel';
      deleteDialog.showModal();
    }
  };

  bindConceptEvents(root, { actions, updateField, chooseFavorite, changeTab, importFile });
  imageDialog.addEventListener('close', () => { role('image-full').replaceChildren(); });
  deleteDialog.addEventListener('close', async () => {
    if (deleteDialog.returnValue !== 'delete') return;
    const id = toDelete;
    await commit(current => deleteConcept(current, id));
    activate([...drafts].sort(listOrder)[0]?.id);
    announce('Entwurf gelöscht.');
    (role('active-title') || editor.querySelector('button'))?.focus();
  });
  window.addEventListener('storage', async event => {
    if (event.key !== CONCEPT_STORAGE_KEY) return;
    await pendingSave;
    drafts = store.refresh();
    if (activeId && !activeDraft()) {
      activate([...drafts].sort(listOrder)[0]?.id);
      announce('Der Entwurf wurde in einem anderen Tab aus der Mappe entfernt.');
    } else if (editor.contains(document.activeElement) || root.querySelector('dialog[open]')) {
      refreshTitle();
      renderSaveStatus();
    } else render();
  });

  render();
  if (requestedId && activeId !== requestedId) announce('Dieser Entwurf ist hier nicht gespeichert. Du kannst ihn als JSON importieren.');
}

const workshop = document.querySelector('[data-concept-workshop]');
if (workshop) mountConceptWorkshop(workshop);
