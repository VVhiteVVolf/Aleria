import { NOTICE_SEALS, defaultSealFor, normalizeSealPreset, selectSealPreset } from './notice-seals-model.mjs';

function selection(notice) {
  const seal = defaultSealFor(notice);
  return seal ? {
    kind: 'icon', name: `Wachssiegel · ${seal.name}`, src: seal.src,
    fit: 'contain', position: 'center', presetId: seal.id,
  } : null;
}

function editor(notice) {
  const esc = window.TafelRuntime.esc;
  const custom = Boolean(window.TafelNoticeMediaModel.imageUrl(notice.siegel));
  const selected = custom ? 'custom' : normalizeSealPreset(notice.sealPreset);
  const options = [{ id: 'auto', name: 'Automatisch nach Anlass' }, ...NOTICE_SEALS, { id: 'none', name: 'Ohne Siegel' }];
  return `<div class="notice-seal-settings"><label>Standardsiegel
    <select class="e-sel" data-input-action="notice-seal-preset" data-notice-id="${esc(notice.id)}">
      ${custom ? '<option value="custom" selected disabled>Eigenes Siegel</option>' : ''}
      ${options.map(option => `<option value="${option.id}"${option.id === selected ? ' selected' : ''}>${esc(option.name)}</option>`).join('')}
    </select></label><small>Gildensiegel für die passende Schreib- oder Ausstellerstelle. Ein eigenes Siegel lässt sich über „Bild wählen“ einsetzen.</small></div>`;
}

function setPreset(id, value) {
  const runtime = window.TafelRuntime;
  if (!runtime.canEditZettel()) return;
  const notice = runtime.state().zettel.find(entry => entry.id === id);
  if (!selectSealPreset(notice, value)) return;
  window.TafelZettelEditor.render(notice);
  runtime.renderZettel();
  runtime.renderEditorPreview();
  window.TafelState.save();
}

export function initializeNoticeSeals() {
  window.TafelNoticeSeals = Object.freeze({ selection, editor, setPreset });
}
