import { html, button } from './group-landing-markup.js';
import { resolveGroupRoster } from './group-landing-roster.js';
import { groupCharacters } from './group-landing-data.js';

const mounts = new WeakMap();

function groups() {
  return (globalThis.getAllSections?.() || []).filter(section => section.tab === 'Gruppen').flatMap(section => section.entries || [])
    .filter(entry => entry.pages?.some(page => page.landing?.group));
}

export function mountGroupSceneControls(context) {
  const { root, entry, page, pageIndex, preview } = context;
  unmountGroupSceneControls(context);
  if (preview || !page.sessionPage) return;
  // Reuse the existing status button and its out-of-flow popup. No additional
  // column, header row or toolbar width is added to the scene layout.
  const container = root.querySelector('.session-status-panel');
  const toggle = root.querySelector('.session-status-toggle');
  if (!container || !toggle) return;
  const previousTitle = toggle.title, previousLabel = toggle.getAttribute('aria-label');
  toggle.title = 'Szene & Gruppe'; toggle.setAttribute('aria-label', 'Szene und Gruppensitzung anzeigen');
  const threadId = `${entry.id}::session:${page.commentThreadKey || String(pageIndex)}`;
  const panel = document.createElement('div'); panel.className = 'group-session-links';
  const abort = new AbortController();
  function render() {
    const available = groups();
    if (!available.length) { panel.hidden = true; return; }
    panel.hidden = false;
    const linked = available.filter(group => group.pages.some(page => page.landing?.group?.threadId === threadId));
    const editable = globalThis.canEditModuleContent?.() === true;
    const participants = linked.map(entry => {
      const state = entry.pages.find(page => page.landing?.group).landing.group;
      return resolveGroupRoster(entry, state, groupCharacters()).filter(member => member.assignment === 'active').map(member => member.name);
    }).flat();
    panel.innerHTML = `<div><span class="group-eyebrow">Aktive Gruppensitzung</span>${linked.length ? linked.map(group => button('open-group', `${html(group.title)} ↗`, `data-entry-id="${html(group.id)}"`)).join('') : '<span class="group-muted">Noch keine Gruppe zugeordnet</span>'}</div>
      ${editable ? `<label><span>Aktive Sitzung für</span><select data-session-group-id><option value="">Gruppe wählen …</option>${available.map(group => `<option value="${html(group.id)}">${html(group.title)}</option>`).join('')}</select></label>${button('assign-session', 'Als aktiv markieren')}` : ''}<small role="status"></small>`;
    if (linked.length) {
      const roster = document.createElement('p'); roster.className = 'group-session-roster';
      roster.textContent = `Aktuell dabei: ${[...new Set(participants)].join(', ') || 'Noch niemand ausgewählt'}`;
      panel.append(roster);
    }
  }
  panel.addEventListener('click', event => {
    const trigger = event.target.closest?.('[data-group-action]');
    if (!trigger) return;
    // The clicked control may be replaced while saving. Keep the existing
    // status popup's outside-click handler from treating it as an outside click.
    event.stopPropagation();
    if (trigger.dataset.groupAction === 'open-group') {
      const group = groups().find(group => group.id === trigger.dataset.entryId);
      if (group) globalThis.openModal?.(group, { pageIndex: group.pages.findIndex(page => page.landing?.group) });
    } else if (trigger.dataset.groupAction === 'assign-session') {
      const id = panel.querySelector('[data-session-group-id]')?.value;
      if (!id) return;
      try { globalThis.setGroupActiveSession(id, threadId); render(); panel.querySelector('[role="status"]').textContent = 'Aktive Sitzung gespeichert.'; }
      catch (error) { panel.querySelector('[role="status"]').textContent = error.message; }
    }
  });
  globalThis.addEventListener('almanach:modules-changed', render, { signal: abort.signal });
  globalThis.addEventListener('aleria:auth-state-changed', render, { signal: abort.signal });
  globalThis.addEventListener('aleria:module-editor-access-changed', render, { signal: abort.signal });
  container.append(panel); render();
  mounts.set(root, () => { abort.abort(); panel.remove(); toggle.title = previousTitle; toggle.setAttribute('aria-label', previousLabel); });
}

export function unmountGroupSceneControls({ root }) { mounts.get(root)?.(); mounts.delete(root); }
