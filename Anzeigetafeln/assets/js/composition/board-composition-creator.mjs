import { NAILS } from './board-composition-model.mjs?v=20261027-all-boards-v3';
import { previewMarkup, paperMarkup } from './board-composition-view.mjs?v=20261027-all-boards-v3';

// Temporary wizard state never enters the board until placement is confirmed.
export function createPosterWizard({ assets, esc, place, groups, isEditing }) {
  const dialog = document.createElement('dialog');
  dialog.className = 'board-art-dialog';
  dialog.setAttribute('aria-label', 'Plakat auf der Tafel anbringen');
  document.body.append(dialog);
  let draft = null;
  let step = 1;
  let query = '';
  let category = '';
  let content = 'new';
  let template = 'quest';
  let existingId = '';
  let title = '';
  let nailDrag = null;
  const option = (value, name, selected) => `<option value="${esc(value)}"${selected === value ? ' selected' : ''}>${esc(name)}</option>`;

  function grid() {
    const needle = query.toLocaleLowerCase('de');
    const filtered = assets.filter(asset => (!category || asset.category === category)
      && `${asset.name} ${asset.category}`.toLocaleLowerCase('de').includes(needle));
    dialog.querySelector('[data-role="poster-catalog"]').innerHTML = filtered.length ? filtered.map(asset => `
      <button type="button" class="board-art-choice${draft.assetId === asset.id ? ' is-chosen' : ''}" data-create-action="asset" data-asset-id="${esc(asset.id)}" aria-pressed="${draft.assetId === asset.id}">
        <span class="board-art-thumbnail"><span style="--asset-aspect:${asset.aspect};aspect-ratio:${asset.aspect}">${paperMarkup(asset, esc)}</span></span><strong>${esc(asset.name)}</strong><small>${esc(asset.category)}</small>
      </button>`).join('') : '<p>Kein passendes Plakat gefunden.</p>';
  }

  function render() {
    const asset = assets.find(item => item.id === draft.assetId);
    dialog.innerHTML = `<header class="board-art-heading"><div><small>Alerias Schreibstube</small><h2>Ein Plakat anbringen</h2></div><button type="button" data-create-action="cancel" aria-label="Abbrechen">×</button></header>
      <ol class="board-art-steps">${['Plakat', 'Befestigung', 'Inhalt'].map((name, index) => `<li${step === index + 1 ? ' aria-current="step"' : ''}>${index + 1}. ${name}</li>`).join('')}</ol>
      <div class="board-art-body">${step === 1 ? `
        <p>Wähle das sichtbare Plakat. Die Textvorlage legst du anschließend fest.</p>
        <div class="board-art-filters"><input type="search" data-create-field="query" value="${esc(query)}" placeholder="Plakate durchsuchen …" aria-label="Plakate durchsuchen"><select data-create-field="category" aria-label="Plakatkategorie">${option('', 'Alle Kategorien', category)}${[...new Set(assets.map(item => item.category))].map(name => option(name, name, category)).join('')}</select></div>
        <div class="board-art-catalog" data-role="poster-catalog"></div>` : step === 2 ? `
        <p>Ziehe den Nagel direkt auf die gewünschte Stelle des Plakats. Der Nagel bleibt auch ohne verknüpften Inhalt sichtbar.</p>
        <div class="board-art-fastener"><div class="board-art-preview-wrap">${previewMarkup(draft, asset, esc, true)}</div><div class="board-art-fields">
          <label>Befestigung<select data-create-field="nail">${NAILS.map(nail => option(nail.id, nail.name, draft.pin.assetId)).join('')}</select></label>
          <label>Nagelgröße (%)<input type="range" min="4" max="65" value="${draft.pin.size * 100}" data-create-field="size"></label>
          <label>Nagel drehen (°)<input type="range" min="-180" max="180" value="${draft.pin.rotation}" data-create-field="rotation"></label>
          <label class="board-art-checkbox"><input type="checkbox" data-create-field="enabled"${draft.pin.enabled ? ' checked' : ''}> Klickfunktion aktivieren</label>
          <p class="board-art-help">Die Position bezieht sich auf dieses Plakat. Später bewegen sich beide zusammen.</p>
        </div></div>` : `
        <p>Ein Plakat kann einen neuen Aushang, vorhandene Blätter oder nur Dekoration tragen.</p>
        <label class="board-art-label">Inhalt<select data-create-field="content">${option('none', 'Nur Dekoration · kein Aushang', content)}${option('new', 'Neuen Aushang verfassen', content)}${option('existing', 'Vorhandenen Aushang verknüpfen', content)}</select></label>
        ${content === 'new' ? `<label class="board-art-label">Vorlage<select data-create-field="template">${window.ZETTEL_TYPES.map(type => option(type.id, `${type.icon} ${type.label}`, template)).join('')}</select></label><label class="board-art-label">Titel<input data-create-field="title" value="${esc(title)}" placeholder="Titel des Aushangs …"></label>` : content === 'existing' ? `<label class="board-art-label">Aushang<select data-create-field="existing">${option('', 'Bitte wählen …', existingId)}${groups().map(group => option(group.notices[0].id, group.notices[0].title || 'Ohne Titel', existingId)).join('')}</select></label>` : '<div class="board-art-decoration">Das Plakat erscheint mit sichtbarem Nagel auf dem Brett. Es erhält keinen Eintrag im Aushangverzeichnis.</div>'}
        <p class="board-art-help">Danach klickst du auf die gewünschte Stelle der Tafel. Größe, Drehung und Ebene kannst du dort weiter anpassen.</p>`}</div>
      <footer class="board-art-footer"><button type="button" data-create-action="${step === 1 ? 'cancel' : 'back'}">${step === 1 ? 'Abbrechen' : 'Zurück'}</button><button type="button" class="board-art-primary" data-create-action="next"${step === 3 && content === 'existing' && !existingId ? ' disabled' : ''}>${step < 3 ? 'Weiter' : 'Auf Tafel platzieren'}</button></footer>`;
    if (step === 1) grid();
  }

  function updatePreview() {
    const preview = dialog.querySelector('[data-role="pin-preview"]');
    if (!preview) return;
    const pin = preview.querySelector('.board-poster-pin');
    const nail = NAILS.find(item => item.id === draft.pin.assetId);
    Object.assign(pin.style, { left: `${draft.pin.x * 100}%`, top: `${draft.pin.y * 100}%`, width: `${draft.pin.size * 100}%`, transform: `translate(-50%,-50%) rotate(${draft.pin.rotation}deg)` });
    pin.querySelector('img').src = nail.src;
  }

  dialog.addEventListener('click', event => {
    const target = event.target.closest('[data-create-action]');
    if (!target) return;
    const action = target.dataset.createAction;
    if (action === 'cancel') dialog.close();
    if (action === 'back') { step -= 1; render(); }
    if (action === 'asset') { draft.assetId = target.dataset.assetId; grid(); }
    if (action === 'next') {
      if (step < 3) { step += 1; render(); return; }
      if (content === 'existing' && !existingId) return;
      const result = { poster: structuredClone(draft), content, template, existingId, title };
      dialog.close();
      if (isEditing()) place(result);
    }
  });
  dialog.addEventListener('input', event => {
    const field = event.target.dataset.createField;
    const value = event.target.value;
    if (field === 'query') { query = value; grid(); }
    if (field === 'title') title = value;
    if (field === 'size') draft.pin.size = Number(value) / 100;
    if (field === 'rotation') draft.pin.rotation = Number(value);
    if (field === 'enabled') draft.pin.enabled = event.target.checked;
    updatePreview();
  });
  dialog.addEventListener('change', event => {
    const field = event.target.dataset.createField;
    const value = event.target.value;
    if (field === 'category') { category = value; grid(); }
    if (field === 'nail') { draft.pin.assetId = value; updatePreview(); }
    if (field === 'content') { content = value; render(); }
    if (field === 'template') template = value;
    if (field === 'existing') { existingId = value; render(); }
  });
  dialog.addEventListener('pointerdown', event => {
    const preview = event.target.closest('[data-role="pin-preview"]');
    if (!preview || event.button !== 0) return;
    event.preventDefault();
    nailDrag = preview;
    preview.setPointerCapture(event.pointerId);
    movePin(event);
  });
  function movePin(event) {
    if (!nailDrag) return;
    const rect = nailDrag.getBoundingClientRect();
    draft.pin.x = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
    draft.pin.y = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
    updatePreview();
  }
  dialog.addEventListener('pointermove', movePin);
  for (const name of ['pointerup', 'pointercancel', 'lostpointercapture']) dialog.addEventListener(name, () => { nailDrag = null; });

  return {
    open() {
      if (!isEditing()) return;
      draft = { assetId: assets[0].id, pin: { assetId: 'straight', x: .5, y: .08, size: .16, rotation: 0, enabled: true }, width: .09, rotation: 0 };
      step = 1; query = ''; category = ''; content = 'new'; title = ''; existingId = '';
      render(); dialog.showModal();
    },
    close: () => dialog.close(),
  };
}
