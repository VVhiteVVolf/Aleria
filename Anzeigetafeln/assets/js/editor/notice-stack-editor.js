(function () {
  'use strict';
  const rt = () => window.TafelRuntime;
  const notes = () => rt().state().zettel;
  const members = id => window.TafelNoticeStacks.members(notes(), id, { includeSecret: true });

  function render(notice) {
    const esc = rt().esc;
    const group = members(notice.id);
    const publications = window.TafelNoticeStacks.publications(group, { includeSecret: true });
    const current = publications.find(entry => entry.notices.includes(notice));
    const otherPublications = publications.filter(entry => entry !== current);
    const targets = window.TafelNoticeStacks.groups(notes(), { includeSecret: true }).filter(item => !item.notices.includes(notice));
    return `<details class="notice-stack-editor" open><summary>Aushänge & Beiblätter an diesem Nagel</summary>
      <p>Zusammengehörige Blätter gelten als ein Aushang. Unabhängige Gesuche können denselben Nagel teilen und bleiben in Register und Vorschau getrennt.</p>
      ${publications.map(entry => `<section class="notice-stack-publication"><strong>${esc(entry.primary.title || 'Ohne Titel')}</strong><ul>${entry.notices.map(item => {
        const index = group.indexOf(item);
        return `<li class="${item.id === notice.id ? 'is-current' : ''}"><button type="button" class="s-btn s-cancel" data-action="notice-stack-edit" data-notice-id="${esc(item.id)}">${esc(item.title || 'Ohne Titel')}</button>${item.id === notice.id ? `<button type="button" class="s-btn s-cancel" data-action="notice-stack-move" data-notice-id="${esc(item.id)}" data-direction="-1" aria-label="Blatt nach vorne" ${index === 0 ? 'disabled' : ''}>↑</button><button type="button" class="s-btn s-cancel" data-action="notice-stack-move" data-notice-id="${esc(item.id)}" data-direction="1" aria-label="Blatt nach hinten" ${index === group.length - 1 ? 'disabled' : ''}>↓</button>` : ''}</li>`;
      }).join('')}</ul></section>`).join('')}
      <div class="notice-stack-controls"><select class="e-sel" data-role="notice-stack-new-type" aria-label="Vorlage für weiteres Blatt">${window.ZETTEL_TYPES.map(type => `<option value="${esc(type.id)}">${esc(type.label)}</option>`).join('')}</select><select class="e-sel" data-role="notice-stack-new-group" aria-label="Zuordnung des neuen Blatts"><option value="same">Beiblatt dieses Aushangs</option><option value="independent">Eigenständiger Aushang am selben Nagel</option></select><button type="button" class="s-btn" data-action="notice-stack-new" data-notice-id="${esc(notice.id)}">＋ Neues Blatt</button></div>
      ${otherPublications.length ? `<div class="notice-stack-controls"><select class="e-sel" data-role="notice-group-target" aria-label="Zugehörigen Aushang wählen">${otherPublications.map(entry => `<option value="${esc(entry.id)}">${esc(entry.primary.title || 'Ohne Titel')}</option>`).join('')}</select><button type="button" class="s-btn s-cancel" data-action="notice-group-combine" data-notice-id="${esc(notice.id)}">Als einen Aushang zusammenfassen</button></div>` : ''}
      ${current.notices.length > 1 ? `<div class="notice-stack-controls"><button type="button" class="s-btn s-cancel" data-action="notice-group-separate" data-notice-id="${esc(notice.id)}">Dieses Blatt als eigenen Aushang erklären</button></div>` : ''}
      ${targets.length ? `<div class="notice-stack-controls"><select class="e-sel" data-role="notice-stack-target" aria-label="Anderen Aushang wählen">${targets.map(target => `<option value="${esc(target.notices[0].id)}">${esc(target.notices[0].title || 'Ohne Titel')}${target.notices.length > 1 ? ` (${target.notices.length} Blätter)` : ''}</option>`).join('')}</select><button type="button" class="s-btn s-cancel" data-action="notice-stack-attach" data-notice-id="${esc(notice.id)}">Dort anheften</button></div>` : ''}
      ${group.length > 1 ? `<div class="notice-stack-controls"><button type="button" class="s-btn s-cancel" data-action="notice-stack-detach" data-notice-id="${esc(notice.id)}">Dieses Blatt einzeln anheften</button></div>` : ''}
      ${otherPublications.length ? `<div class="notice-stack-controls"><button type="button" class="s-btn s-cancel" data-action="notice-publication-detach" data-notice-id="${esc(notice.id)}">Diesen Aushang mit allen Beiblättern an eigenen Nagel heften</button></div>` : ''}
    </details>`;
  }

  function changed(id) {
    rt().renderZettel();
    window.TafelState.save();
    window.TafelZettelEditor.open(id);
  }

  function add(id) {
    if (!rt().canEditZettel()) return;
    const target = notes().find(item => item.id === id);
    const type = document.querySelector('#sidebar [data-role="notice-stack-new-type"]')?.value;
    if (!target || !window.TafelZettelConfig.typeById(type)) return;
    const notice = window.TafelZettelConfig.createDraft(type, target, rt().uid);
    const same = document.querySelector('#sidebar [data-role="notice-stack-new-group"]')?.value !== 'independent';
    notes().push(notice);
    window.TafelNoticeStacks.attach(notes(), notice.id, id);
    if (same) window.TafelNoticeStacks.combine(notes(), notice.id, id);
    changed(notice.id);
  }

  function attach(id) {
    if (!rt().canEditZettel()) return;
    const target = document.querySelector('#sidebar [data-role="notice-stack-target"]')?.value;
    if (window.TafelNoticeStacks.attachPublication(notes(), id, target)) changed(id);
  }

  function detach(id) {
    if (!rt().canEditZettel() || members(id).length < 2) return;
    window.TafelNoticeStacks.separate(notes(), id);
    if (window.TafelNoticeStacks.detach(notes(), id)) changed(id);
  }

  function combine(id) {
    const target = document.querySelector('#sidebar [data-role="notice-group-target"]')?.value;
    if (rt().canEditZettel() && window.TafelNoticeStacks.combine(notes(), id, target)) changed(id);
  }

  function separate(id) {
    if (rt().canEditZettel() && window.TafelNoticeStacks.separate(notes(), id)) changed(id);
  }

  function detachPublication(id) {
    if (rt().canEditZettel() && window.TafelNoticeStacks.detachPublication(notes(), id)) changed(id);
  }

  function move(id, direction) {
    if (rt().canEditZettel() && window.TafelNoticeStacks.move(notes(), id, direction)) changed(id);
  }

  window.TafelNoticeStackEditor = Object.freeze({ render, add, attach, detach, move, combine, separate, detachPublication });
})();
