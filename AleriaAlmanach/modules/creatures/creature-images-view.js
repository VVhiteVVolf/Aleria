import { CREATURE_IMAGE_LIBRARY, MAX_CREATURE_AVATARS, getCreatureImageSet } from './creature-images-model.js?v=20260919-creature-pages-v1';

export function renderCreatureImages(creature, escape, { importText = '', status = '', error = false } = {}) {
  const set = getCreatureImageSet(creature);
  const image = value => CREATURE_IMAGE_LIBRARY.normalizeImageUrl(value, { allowData: true });
  const action = (name, label, extra = '') => `<button type="button" data-creature-media-action="${name}" ${extra}>${label}</button>`;
  return `<section class="creature-sheet-section creature-images-library">
    <div class="creature-section-head"><div><h3 class="creature-section-title">Bilder &amp; Emotes</h3>
      <p class="creature-page-intro">Ein Portrait und bis zu ${MAX_CREATURE_AVATARS} Ausdrücke je Set. Wähle beim Schreiben im Kommentarbereich das passende Bilderset.</p></div>
      <strong class="creature-avatar-count">${creature.imageSets.length} / ${CREATURE_IMAGE_LIBRARY.limit} Sets</strong></div>
    <div class="creature-image-set-tabs" aria-label="Bilderset wählen">${creature.imageSets.map(item => action('select-set', `${escape(item.name)} <small>${item.emotes.length}</small>`, `data-set-id="${escape(item.id)}" aria-pressed="${item.id === set.id}"`)).join('')}</div>
    <div class="creature-image-set-tools">
      <label class="creature-field"><span>Name des Sets</span><input data-creature-media-field="set-name" value="${escape(set.name)}" maxlength="60"${set.id === 'standard' ? ' disabled' : ''}></label>
      ${action('rename-set', 'Umbenennen', set.id === 'standard' ? 'disabled' : '')}
      ${action('delete-set', 'Set entfernen', set.id === 'standard' ? 'disabled' : '')}
      <label class="creature-field"><span>Neues Set</span><input data-creature-media-field="new-set-name" maxlength="60" placeholder="z. B. Verwundet, Winterfell …"></label>
      ${action('add-set', '+ Bilderset', creature.imageSets.length >= CREATURE_IMAGE_LIBRARY.limit ? 'disabled' : '')}
    </div>
    <div class="creature-images-workbench">
      <div class="creature-image-portrait" data-creature-media-drop="portrait">
        <div class="creature-portrait-frame">${image(set.portrait) ? `<img src="${escape(set.portrait)}" alt="${escape(creature.name)} – ${escape(set.name)}" referrerpolicy="no-referrer">` : '<div class="creature-portrait-placeholder">♜<small>Portrait hierher ziehen</small></div>'}</div>
        <label class="creature-field"><span>Portrait-URL</span><input type="url" data-creature-media-field="portrait" value="${escape(set.portrait || '')}" placeholder="https://i.imgur.com/…"></label>
        ${action('paste-portrait', 'Portrait-Link einfügen')}
        <label class="creature-field"><span>Bildunterschrift</span><input data-creature-field="portraitCaption" value="${escape(creature.portraitCaption)}" maxlength="500"></label>
      </div>
      <div class="creature-image-import" data-creature-media-drop="avatars">
        <h4>Ausdrücke sammeln</h4>
        <p>Bildlinks oder einen Imgur-Album-Link einfügen. Du kannst Bilder und Links auch hierher ziehen. Bereits vorhandene Links werden übersprungen.</p>
        <label class="creature-field"><span>Bildlinks / Imgur-Album</span><textarea data-creature-media-field="import" rows="5" placeholder="https://i.imgur.com/…&#10;https://imgur.com/a/…">${escape(importText)}</textarea></label>
        <div class="creature-image-import-actions">${action('import-links', 'Links übernehmen')}${action('paste-links', 'Aus Zwischenablage')}${action('import-album', 'Imgur-Album übernehmen')}</div>
        <p class="creature-media-status" role="status"${error ? ' data-tone="error"' : ''}>${escape(status)}</p>
        <p class="creature-image-save-hint">Bei gespeicherten Kreaturen werden Bilder und Sets automatisch gespeichert. Neue Kreaturen zuerst mit „Online speichern“ anlegen.</p>
      </div>
    </div>
    <div class="creature-section-head"><h4>Avatare · ${escape(set.name)}</h4><strong class="creature-avatar-count">${set.emotes.length} / ${MAX_CREATURE_AVATARS}</strong></div>
    <div class="creature-avatar-grid">${set.emotes.map((avatar, index) => `<article class="creature-avatar-card" data-creature-avatar-index="${index}">
      <div class="creature-avatar-preview">${image(avatar.img) ? `<img src="${escape(avatar.img)}" alt="${escape(avatar.label)}" loading="lazy" decoding="async" referrerpolicy="no-referrer">` : '<span>♜</span>'}</div>
      <label><span>Bezeichnung</span><input data-creature-avatar-field="label" value="${escape(avatar.label)}" maxlength="80" aria-label="Bezeichnung von Avatar ${index + 1}"></label>
      <label><span>Bild-URL</span><input type="url" data-creature-avatar-field="img" value="${escape(avatar.img)}" aria-label="Bild-URL von Avatar ${index + 1}"></label>
      ${action('remove-avatar', '×', `class="creature-row-remove" data-index="${index}" aria-label="Avatar ${index + 1} entfernen"`)}
    </article>`).join('') || '<p class="creature-table-empty">Dieses Set hat noch keine zusätzlichen Avatare.</p>'}</div>
  </section>`;
}
