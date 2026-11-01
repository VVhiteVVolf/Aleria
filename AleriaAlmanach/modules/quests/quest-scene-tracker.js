import { getQuestClient, getQuestCatalog } from './quest-client.js';
import { e } from './quest-view.js';
import { mountQuestForm } from './quest-forms.js';
const mounts = new WeakMap();
export function unmountQuestSceneTrackers(scope) {
  for (const root of scope?.querySelectorAll?.('[data-quest-scene-tracker]') || []) { mounts.get(root)?.(); mounts.delete(root); }
}
if (globalThis.customElements && !customElements.get('aleria-quest-scene-tracker')) {
  customElements.define('aleria-quest-scene-tracker', class extends HTMLElement {
    #observer;
    connectedCallback() {
      const overlay = this.closest('#modal-overlay');
      const update = () => {
        if (!overlay || overlay.classList.contains('active') && overlay.getAttribute('aria-hidden') !== 'true') mountQuestSceneTrackers({ querySelectorAll: () => [this] });
        else { mounts.get(this)?.(); mounts.delete(this); this.replaceChildren(); }
      };
      if (overlay) { this.#observer = new MutationObserver(update); this.#observer.observe(overlay, { attributes: true, attributeFilter: ['class', 'aria-hidden'] }); }
      update();
    }
    disconnectedCallback() { this.#observer?.disconnect(); mounts.get(this)?.(); mounts.delete(this); }
  });
}
export function mountQuestSceneTrackers(scope, { client = getQuestClient, readCatalog = getQuestCatalog } = {}) {
  for (const root of scope?.querySelectorAll?.('[data-quest-scene-tracker]') || []) {
    if (mounts.has(root)) continue;
    const abort = new AbortController(); let stopped = false, stop, runs = [], repository, catalog, dialog, connectionError = '';
    const content = document.createElement('div'); root.append(content);
    const destroy = () => { stopped = true; stop?.(); abort.abort(); dialog?.close(); dialog?.remove(); };
    mounts.set(root, destroy);
    function render() {
      if (stopped) return;
      const expanded = content.querySelector('details')?.open;
      content.innerHTML = (connectionError ? `<small role="status">${e(connectionError)}</small>` : '')
        + (runs.length ? `<details${expanded ? ' open' : ''}><summary>Questfortschritt in dieser Szene · ${runs.length}</summary>${runs.map(run => `<article><a href="./quests.html?run=${encodeURIComponent(run.id)}" target="_blank" rel="noopener"><strong>${e(run.title)} ↗</strong></a><p>${run.party.map(member => `${e(member.name)}: ${e(run.locations?.[`${member.kind}:${member.recordId}`]?.name || 'Ort noch offen')}`).join('<br>')}</p>${run.status === 'active' ? `<button type="button" data-quest-scene-log="${e(run.id)}">Standort / Fortschritt setzen</button>` : '<small>Archiviert</small>'}</article>`).join('')}</details>` : '');
    }
    root.addEventListener('click', async event => {
      const trigger = event.target.closest('[data-quest-scene-log]');
      if (!trigger) return;
      try {
        await repository.access();
        if (stopped || !root.isConnected) return;
        const run = runs.find(run => run.id === trigger.dataset.questSceneLog);
        if (!run || run.status !== 'active') return;
        dialog?.close(); dialog?.remove(); dialog = document.createElement('dialog'); dialog.className = 'quest-dialog quest-form-dialog'; root.append(dialog);
        let pending;
        mountQuestForm(dialog, { mode: 'log', quest: run, party: run.party, catalog, calendar: globalThis.AleriaCalendar, date: globalThis.AleriaCalendar.current(),
          async onSubmit(value) {
            const base = { action: 'log', id: run.id, expectedRevision: run.revision, ...value }, fingerprint = JSON.stringify(base);
            if (pending?.fingerprint !== fingerprint) pending = { fingerprint, input: { ...base, operationId: crypto.randomUUID() } };
            await repository.commit(pending.input);
          } });
      } catch (error) { if (!stopped) { const message = document.createElement('p'); message.setAttribute('role','alert'); message.textContent = error.message; root.append(message); } }
    }, { signal: abort.signal });
    Promise.all([client(), readCatalog()]).then(([adapter, data]) => {
      if (stopped || !root.isConnected) return;
      repository = adapter; catalog = data;
      stop = adapter.context({ moduleId: root.dataset.moduleId, threadIds: [root.dataset.threadId] }, next => { if (stopped) return; runs = next.runs.filter(run => run.links.scenes.includes(root.dataset.threadId)); render(); }, () => { connectionError = 'Questjournal derzeit nicht verbunden.'; render(); });
    }).catch(() => { connectionError = 'Questjournal derzeit nicht verbunden.'; render(); });
  }
}
