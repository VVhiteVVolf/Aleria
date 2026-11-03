import { REALM_CONTEXT } from './realm-context.mjs';
import { CITY_NAME_PROPOSALS, HOUSE_NAME_PROPOSALS } from './name-proposals.mjs';
import { EMBLEMS } from './heraldry-data.mjs';
import { WARRIOR_STATUS_NOTE } from './warrior-data.mjs';
import { CLASS_OVERVIEW_WARRIORS } from './class-overview-data.mjs';
import { EMBLEM_WARRIORS } from './emblem-warrior-data.mjs';
import { HOUSES } from './house-data.mjs';
import { SETTLEMENTS } from './territory-data.mjs';
import { renderIshtaranPage, renderShortlistSummary } from './proposal-render.mjs';
import { createProposalDraft } from './proposal-draft.mjs';
import { createArtDialogs } from './art-dialogs.mjs';
import { mountHousePlacement } from './house-placement.mjs?v=20261103-placement-2';

const root = document.querySelector('[data-ishtaran-workbench]');
const catalogs = { cityNames: CITY_NAME_PROPOSALS, houseNames: HOUSE_NAME_PROPOSALS, emblems: EMBLEMS };
const draft = createProposalDraft(catalogs);
const storageKey = 'aleria:proposal:ishtaran:shortlist:v1';
root.innerHTML = renderIshtaranPage({ context: REALM_CONTEXT, ...catalogs, houses: HOUSES, warriors: CLASS_OVERVIEW_WARRIORS, emblemWarriors: EMBLEM_WARRIORS, warriorStatusNote: WARRIOR_STATUS_NOTE });
const shortlistRoot = root.querySelector('#entwurf');
const notes = shortlistRoot.querySelector('[data-role="draft-notes"]');
let noticeTimer, notesTimer;
let placements;
const dialogs = createArtDialogs({ dialog: root.querySelector('[data-role="art-dialog"]'), emblems: EMBLEMS, warriors: CLASS_OVERVIEW_WARRIORS, emblemWarriors: EMBLEM_WARRIORS,
  houses: HOUSES, settlements: SETTLEMENTS, getPlacements: () => placements.current(), onChoose: id => placements.choose(id) });
placements = mountHousePlacement({ root, onHouse: id => dialogs.show('emblem', id), notice });

function notice(message) {
  const box = root.querySelector('[data-role="status"]');
  box.textContent = message; box.hidden = false;
  clearTimeout(noticeTimer); noticeTimer = setTimeout(() => { box.hidden = true; }, 6500);
}
function save() {
  try { localStorage.setItem(storageKey, draft.serialize()); }
  catch { shortlistRoot.querySelector('[data-role="storage-note"]').textContent = 'Die Browser-Speicherung ist nicht verfügbar. Bitte die Merkliste herunterladen.'; }
}
function renderDraft({ updateNotes = true } = {}) {
  const current = draft.current();
  root.querySelectorAll('[data-action="toggle-shortlist"][aria-pressed]').forEach(button => {
    const selected = current.favorites[button.dataset.shortlistKind].includes(button.dataset.proposalId);
    button.setAttribute('aria-pressed', String(selected));
    button.textContent = selected ? 'Vorgemerkt ✓' : 'Vormerken';
  });
  shortlistRoot.querySelector('[data-role="shortlist-summary"]').innerHTML = renderShortlistSummary(current, catalogs);
  shortlistRoot.querySelector('[data-action="undo"]').disabled = !draft.canUndo();
  if (updateNotes) notes.value = current.notes;
}
function commitNotes() {
  clearTimeout(notesTimer);
  if (draft.setNotes(notes.value)) { save(); renderDraft({ updateNotes: false }); }
}
function download() {
  const url = URL.createObjectURL(new Blob([draft.serialize()], { type: 'application/json' }));
  const link = document.createElement('a'); link.href = url; link.download = 'ishtaran-merkliste.json'; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

try {
  const saved = localStorage.getItem(storageKey);
  if (saved) draft.restore(JSON.parse(saved), { recordHistory: false });
} catch { notice('Die gespeicherte Merkliste konnte nicht geladen werden. Die Vorschläge stehen unverändert bereit.'); }
renderDraft();

root.addEventListener('click', event => {
  const button = event.target.closest('button[data-action]');
  if (!button) return;
  if (button.closest('[data-role="placement-root"]')) return;
  const action = button.dataset.action;
  if (action === 'show-art') { dialogs.show(button.dataset.artKind, button.dataset.artId); return; }
  if (button.closest('[data-role="art-dialog"]')) return;
  if (action === 'print') { window.print(); return; }
  commitNotes();
  switch (action) {
    case 'toggle-shortlist': {
      const summaryButton = !button.hasAttribute('aria-pressed');
      const summary = shortlistRoot.querySelector('[data-role="shortlist-summary"]');
      draft.toggle(button.dataset.shortlistKind, button.dataset.proposalId); save(); renderDraft();
      if (summaryButton) { summary.tabIndex = -1; summary.focus({ preventScroll: true }); }
      break;
    }
    case 'undo': if (draft.undo()) { save(); renderDraft(); notice('Letzte Änderung zurückgenommen.'); } break;
    case 'reset': if (draft.reset()) { save(); renderDraft(); notice('Die Merkliste ist geleert. Die Vorschläge bleiben erhalten.'); } break;
    case 'export': download(); break;
    case 'import': shortlistRoot.querySelector('[data-role="import-file"]').click(); break;
  }
});
notes.addEventListener('input', () => { clearTimeout(notesTimer); notesTimer = setTimeout(commitNotes, 700); });
notes.addEventListener('change', commitNotes);
window.addEventListener('pagehide', commitNotes);
shortlistRoot.querySelector('[data-role="import-file"]').addEventListener('change', async event => {
  const file = event.target.files?.[0]; if (!file) return;
  try {
    if (file.size > 100000) throw Error('Die Merkliste darf höchstens 100 KB groß sein.');
    draft.restore(JSON.parse(await file.text())); save(); renderDraft(); notice('Die Merkliste wurde geladen.');
  } catch (error) { notice(error.message || 'Die Datei konnte nicht geladen werden.'); }
  finally { event.target.value = ''; }
});
