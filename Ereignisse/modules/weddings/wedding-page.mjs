import { validateWeddingId, validateWeddingEnvelope, validateWedding } from './wedding-schema.mjs';
import { createWeddingStore } from './wedding-store.mjs';
import { createWeddingRepository } from './wedding-repository.mjs';
import { renderWedding, renderWeddingGuests, renderWeddingRegistry } from './wedding-render.mjs';
import { weddingText as e, updateWeddingEntry, removeWeddingEntry } from './wedding-model.mjs';
import { createWeddingEditor } from './wedding-editor.mjs';

async function initializeWeddingPage(root) {
  const eventsBase = new URL(root.dataset.eventsBase, location.href), calendar = globalThis.AleriaCalendar;
  const repository = createWeddingRepository({ eventsBase }), content = root.querySelector('[data-wedding-content]');
  const editor = createWeddingEditor(root.querySelector('[data-wedding-dialog]'), { calendar });
  let store, editing = false, unsubscribe;
  const filters = { query: '', group: 'all', attendance: 'all' };
  function notify(message, error = false) {
    const node = root.querySelector('[data-wedding-notification]');
    node.textContent = message; node.hidden = !message; node.dataset.error = String(error);
  }
  function filterGuests() {
    const wedding = store.getState().envelope.wedding;
    content.querySelector('[data-wedding-guests]').innerHTML = renderWeddingGuests(wedding,filters,editing,eventsBase);
  }
  function render(state) {
    document.title = state.envelope.wedding.title;
    content.innerHTML = renderWedding(state.envelope.wedding, { eventsBase, calendar, editing, dirty: state.dirty, revision: state.envelope.revision, conflict: state.conflict });
    for (const [selector, field] of [['search','query'],['group','group'],['attendance','attendance']]) content.querySelector(`[data-wedding-${selector}]`).value = filters[field];
    filterGuests();
    if (state.error) notify(state.error,true);
  }
  function attach(envelope) {
    unsubscribe?.();
    store = createWeddingStore(envelope);
    unsubscribe = store.subscribe(render);
  }
  function saved(wedding) { store.edit(wedding); notify('Entwurf auf diesem Gerät gespeichert. Mit „Veröffentlichen“ wird er für alle übernommen.'); }
  function editEntry(list, id) {
    const wedding = store.getState().envelope.wedding, item = wedding[list]?.find(entry => entry.id === id);
    editor.entry(list,item,wedding, entry => saved(updateWeddingEntry(store.getState().envelope.wedding,list,entry)), () => saved(removeWeddingEntry(store.getState().envelope.wedding,list,id)));
  }
  function exportDraft() {
    const envelope = store.getState().envelope;
    const url = URL.createObjectURL(new Blob([JSON.stringify(envelope,null,2) + '\n'],{type:'application/json'}));
    const link = document.createElement('a'); link.href = url; link.download = `${envelope.id}.json`; link.click();
    setTimeout(() => URL.revokeObjectURL(url),1000);
  }
  async function startTemplate() {
    const template = await repository.template();
    content.innerHTML = '<div class="wedding-loading"><p class="wedding-eyebrow">Das nächste Hochzeitsfest</p><h1>Ein neues Festbuch</h1><p>Beginnt mit dem Brautpaar. Gäste, Gaben und den Ablauf könnt ihr anschließend ergänzen.</p><button type="button" class="wedding-button wedding-primary" data-wedding-action="new-wedding">Brautpaar eintragen</button></div>';
    editor.details(template.wedding, async (wedding, inputId) => {
      const id = validateWeddingId(inputId);
      if (id === 'neue-hochzeit') throw new Error('Bitte einen eigenen Kurznamen vergeben.');
      const entries = await repository.registry();
      if (entries.some(entry => entry.id === id) || localStorage.getItem(`aleria.weddings.v1.${id}`)) throw new Error('Diese Seitenadresse ist bereits vergeben. Bitte eine andere wählen.');
      const envelope = validateWeddingEnvelope({ ...template,id,wedding:validateWedding(wedding) });
      editing = true; attach(envelope); saved(wedding);
      history.replaceState(null,'',new URL(`hochzeit.html?id=${encodeURIComponent(id)}`,eventsBase));
    }, {creating:true});
  }
  content.addEventListener('submit', event => event.preventDefault());
  content.addEventListener('error', event => {
    if (event.target.matches?.('[data-wedding-portrait]')) { event.target.hidden = true; event.target.parentElement.classList.add('is-missing'); }
  },true);
  content.addEventListener('input', event => {
    if (event.target.matches('[data-wedding-search]')) { filters.query = event.target.value; filterGuests(); }
  });
  content.addEventListener('change', event => {
    const target = event.target;
    if (target.matches('[data-wedding-group]')) { filters.group = target.value; filterGuests(); }
    if (target.matches('[data-wedding-attendance]')) { filters.attendance = target.value; filterGuests(); }
    if (target.matches('[data-wedding-task]') && editing) {
      const wedding = store.getState().envelope.wedding, task = wedding.tasks.find(item => item.id === target.dataset.weddingTask);
      try { saved(updateWeddingEntry(wedding,'tasks',{ ...task, done:target.checked })); }
      catch (error) { target.checked = task.done; notify(error.message,true); }
    }
  });
  content.addEventListener('click', async event => {
    const button = event.target.closest('[data-wedding-action]');
    if (!button) return;
    const action = button.dataset.weddingAction;
    try {
      if (action === 'new-wedding') { await startTemplate(); return; }
      const state = store.getState(), wedding = state.envelope.wedding;
      if (action === 'toggle-edit') { editing = !editing; render(state); }
      if (action === 'export') exportDraft();
      if (action === 'edit-details') editor.details(wedding,saved);
      if (action === 'add-entry' || action === 'edit-entry') editEntry(button.dataset.list,button.dataset.id);
      if (action === 'move-schedule') {
        const index = wedding.schedule.findIndex(item => item.id === button.dataset.id), next = index + Number(button.dataset.step);
        if (index >= 0 && next >= 0 && next < wedding.schedule.length) { [wedding.schedule[index],wedding.schedule[next]] = [wedding.schedule[next],wedding.schedule[index]]; saved(wedding); }
      }
      if (action === 'discard') editor.confirm('Entwurf verwerfen', 'Die lokalen Änderungen dieser Hochzeit werden verworfen. Die zuletzt geladene veröffentlichte Fassung bleibt erhalten.', () => { store.discard(); notify('Lokaler Entwurf verworfen.'); }, 'Entwurf verwerfen');
      if (action === 'load-latest') editor.confirm('Online-Fassung laden', 'Die aktuelle GitHub-Fassung ersetzt den lokalen Stand dieser Hochzeit. Exportiert euren Entwurf vorher, wenn ihr eigene Änderungen behalten möchtet.', async () => { store.acceptPublished(await repository.latest(state.envelope.id)); notify('Aktuelle GitHub-Fassung geladen.'); }, 'Online-Fassung übernehmen');
      if (action === 'publish') editor.publish(state, async key => {
        const result = await repository.publish(state.envelope,key);
        store.acceptPublished(result.envelope);
        notify(store.getState().error || `Fassung ${result.envelope.revision} auf GitHub veröffentlicht. Die Website übernimmt sie mit der nächsten Bereitstellung.`,!!store.getState().error);
      });
    } catch (error) { notify(error.message,true); }
  });
  try {
    if (root.hasAttribute('data-wedding-template')) { await startTemplate(); return; }
    const id = root.dataset.weddingId || new URL(location.href).searchParams.get('id');
    if (!id) { content.innerHTML = renderWeddingRegistry(await repository.registry(),eventsBase); return; }
    validateWeddingId(id);
    let envelope;
    try { envelope = await repository.load(id); }
    catch (error) {
      const local = JSON.parse(localStorage.getItem(`aleria.weddings.v1.${id}`) || 'null');
      if (!local?.published || local.published.id !== id) throw error;
      envelope = validateWeddingEnvelope(local.published);
      notify('Gespeicherten Stand auf diesem Gerät geladen.');
    }
    attach(envelope);
  } catch (error) {
    content.innerHTML = `<div class="wedding-loading"><p class="wedding-eyebrow">Das Hochzeitsregister</p><h1>Das Festbuch konnte nicht geöffnet werden.</h1><p>${e(error.message)}</p><a href="${e(new URL('hochzeit.html',eventsBase))}">Zum Hochzeitsregister</a></div>`;
  }
}
const root = document.querySelector('[data-wedding-page]');
if (root) initializeWeddingPage(root);
