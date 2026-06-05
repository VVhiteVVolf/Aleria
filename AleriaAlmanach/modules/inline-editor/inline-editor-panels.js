// Reusable inline editor panel builders.
// Type-specific editors compose these panels without owning their state.

function getInlinePageDefaultImageFit(page) {
  return page?.artifactPage ? 'contain' : 'cover';
}

function getInlinePageImageWidthMax(page) {
  return page?.castePage ? 160 : 70;
}

function getInlinePageDefaultImagePosition(page) {
  return (page?.artifactPage || page?.recipePage || !page?.questFilePage && !page?.castePage && !page?.courtPage && !page?.biographyPage)
    ? 'center'
    : 'top';
}

function getInlinePageImageFit(page) {
  const fit = String(page?.imageFit || '').trim();
  return ['cover', 'contain'].includes(fit) ? fit : getInlinePageDefaultImageFit(page);
}

function getInlinePageImagePosition(page) {
  const position = String(page?.imagePosition || '').trim();
  return ['top', 'center', 'bottom', 'left', 'right'].includes(position) ? position : getInlinePageDefaultImagePosition(page);
}

function buildInlineImageFitOptions(page) {
  const value = getInlinePageImageFit(page);
  return `
          <option value="cover"${value === 'cover' ? ' selected' : ''}>Füllen / croppen</option>
          <option value="contain"${value === 'contain' ? ' selected' : ''}>Ganzes Bild</option>`;
}

function buildInlineImagePositionOptions(page) {
  const value = getInlinePageImagePosition(page);
  return `
          <option value="top"${value === 'top' ? ' selected' : ''}>Oben</option>
          <option value="center"${value === 'center' ? ' selected' : ''}>Mitte</option>
          <option value="bottom"${value === 'bottom' ? ' selected' : ''}>Unten</option>
          <option value="left"${value === 'left' ? ' selected' : ''}>Links</option>
          <option value="right"${value === 'right' ? ' selected' : ''}>Rechts</option>`;
}

function buildInlineImageFormatControls(page) {
  return `
      <div class="inline-edit-minirow">
        <select class="inline-edit-select" data-inline-action="sync-page-field" data-page-field="imageFit">
          ${buildInlineImageFitOptions(page)}
        </select>
        <select class="inline-edit-select" data-inline-action="sync-page-field" data-page-field="imagePosition">
          ${buildInlineImagePositionOptions(page)}
        </select>
      </div>
      <div class="inline-edit-minirow">
        <span class="inline-edit-label">Breite <span id="inline-image-width-value">${Number(page?.imageWidth || 38)}%</span></span>
      </div>
      <input class="inline-image-range" type="range" min="20" max="${escapeHtml(getInlinePageImageWidthMax(page))}" step="1" data-inline-action="sync-page-field" data-page-field="imageWidth" value="${Number(page?.imageWidth || 38)}">`;
}

function buildInlineImagePanel(page) {
  if (page?.bestiaryPage) {
    return `
    <div class="inline-image-panel">
      <div class="inline-edit-kicker">Kreaturbild</div>
      <input class="inline-edit-input" type="url" data-inline-action="sync-page-field" data-page-field="image" value="${escapeHtml(page.image || '')}" placeholder="Transparentes PNG oder Bild-URL">
      <div class="inline-placeholder-note">Dieses Bild sitzt frei auf dem Bestiarium-Blatt. Größe und Position steuerst du im Bestiarium-Abschnitt.</div>
    </div>`;
  }
  if (page?.questFilePage) {
    return `
    <div class="inline-image-panel">
      <div class="inline-edit-kicker">Questbild links oben</div>
      <input class="inline-edit-input" type="url" data-inline-action="sync-page-field" data-page-field="image" value="${escapeHtml(page.image || '')}" placeholder="Imgur-Link oder Bild-URL">
      ${buildInlineImageFormatControls(page)}
      <div class="inline-placeholder-note">Dieses Bild sitzt oben links in der Akte. Weitere Bilder steuerst du im Questakten-Abschnitt.</div>
    </div>`;
  }
  return `
    <div class="inline-image-panel">
      <div class="inline-edit-kicker">Bild</div>
      <input class="inline-edit-input" type="url" data-inline-action="sync-page-field" data-page-field="image" value="${escapeHtml(page.image || '')}" placeholder="Imgur-Link oder Bild-URL">
      <div class="inline-edit-minirow">
        <select class="inline-edit-select" data-inline-action="sync-page-field" data-page-field="imageStyle">
          <option value="default"${getPageImageStyle(page) === 'default' ? ' selected' : ''}>Standard</option>
          <option value="square"${getPageImageStyle(page) === 'square' ? ' selected' : ''}>Quadratisch</option>
          <option value="landscape"${getPageImageStyle(page) === 'landscape' ? ' selected' : ''}>Breit</option>
          <option value="semi"${getPageImageStyle(page) === 'semi' ? ' selected' : ''}>Halb-Breit</option>
          <option value="tall"${getPageImageStyle(page) === 'tall' ? ' selected' : ''}>Hochformat</option>
        </select>
        <select class="inline-edit-select" data-inline-action="sync-page-field" data-page-field="imageFit">
          ${buildInlineImageFitOptions(page)}
        </select>
      </div>
      <div class="inline-edit-minirow">
        <select class="inline-edit-select" data-inline-action="sync-page-field" data-page-field="imagePosition">
          ${buildInlineImagePositionOptions(page)}
        </select>
        <span class="inline-edit-label">Breite <span id="inline-image-width-value">${Number(page.imageWidth || 38)}%</span></span>
      </div>
      <input class="inline-image-range" type="range" min="20" max="${escapeHtml(getInlinePageImageWidthMax(page))}" step="1" data-inline-action="sync-page-field" data-page-field="imageWidth" value="${Number(page.imageWidth || 38)}">
      <div class="inline-placeholder-note">Leeres Feld = Bildplatzhalter. Stil, Füllung, Ausschnitt und Breite steuern die linke Spalte direkt.</div>
    </div>`;
}

function buildInlineStatsEditor(page) {
  const rows = Array.isArray(page.stats) ? page.stats : [];
  return `
    <div class="inline-edit-section">
      <div class="inline-edit-head">
        <div class="inline-edit-kicker">Infotabelle</div>
        <button class="module-editor-mini-btn" type="button" data-inline-action="add-stat-row">+ Zeile</button>
      </div>
      <div class="inline-stat-editor">
        ${rows.length ? rows.map(([label, value], index) => `
          <div class="inline-stat-row">
            <input class="inline-edit-input" type="text" data-inline-action="update-stat-field" data-stat-index="${index}" data-stat-field="label" value="${escapeHtml(label || '')}" placeholder="Label">
            <input class="inline-edit-input" type="text" data-inline-action="update-stat-field" data-stat-index="${index}" data-stat-field="value" value="${escapeHtml(value || '')}" placeholder="Wert">
            <button class="module-editor-mini-btn module-editor-danger" type="button" data-inline-action="remove-stat-row" data-stat-index="${index}">Löschen</button>
          </div>`).join('') : `<div class="inline-placeholder-note">Noch keine Info-Tabelle vorhanden. Füge oben eine Zeile hinzu.</div>`}
      </div>
    </div>`;
}

function buildInlineCommentEditor(page) {
  const blocks = Array.isArray(page.commentSequence) ? page.commentSequence : [];
  return `
    <div class="inline-edit-section">
      <div class="inline-edit-head">
        <div class="inline-edit-kicker">Kommentarsektor</div>
        <div class="inline-edit-minirow">
          <button class="module-editor-mini-btn" type="button" data-inline-action="add-comment-block" data-comment-kind="narrator">+ Erzähler</button>
          <button class="module-editor-mini-btn" type="button" data-inline-action="add-comment-block" data-comment-kind="character">+ Kommentar</button>
        </div>
      </div>
      <label class="module-editor-check"><input type="checkbox" data-inline-action="sync-page-field" data-page-field="commentDivider"${page.commentDivider ? ' checked' : ''}> [_] Trenner zwischen Beschreibung/Info und Kommentarsektor</label>
      <div class="inline-comment-editor">
        ${blocks.length ? blocks.map((block, index) => `
          <div class="inline-comment-card">
            <div class="inline-edit-minirow">
              <label class="module-editor-check"><input type="checkbox" data-inline-action="update-comment-field" data-comment-index="${index}" data-comment-field="narrator"${block.narrator ? ' checked' : ''}> Erzählerblock</label>
              <button class="module-editor-mini-btn module-editor-danger" type="button" data-inline-action="remove-comment-block" data-comment-index="${index}">Löschen</button>
            </div>
            ${block.narrator ? '' : `
              <div class="inline-edit-grid">
                <div class="inline-edit-field">
                  <span class="inline-edit-label">Seite</span>
                  <select class="inline-edit-select" data-inline-action="update-comment-field" data-comment-index="${index}" data-comment-field="side">
                    <option value="left"${(block.side || 'left') === 'left' ? ' selected' : ''}>Links</option>
                    <option value="right"${block.side === 'right' ? ' selected' : ''}>Rechts</option>
                  </select>
                </div>
                <div class="inline-edit-field">
                  <span class="inline-edit-label">Name</span>
                  <input class="inline-edit-input" type="text" data-inline-action="update-comment-field" data-comment-index="${index}" data-comment-field="name" value="${escapeHtml(block.name || '')}">
                </div>
                <div class="inline-edit-field">
                  <span class="inline-edit-label">Titel</span>
                  <input class="inline-edit-input" type="text" data-inline-action="update-comment-field" data-comment-index="${index}" data-comment-field="title" value="${escapeHtml(block.title || '')}">
                </div>
                <div class="inline-edit-field">
                  <span class="inline-edit-label">Avatar-URL</span>
                  <input class="inline-edit-input" type="url" data-inline-action="update-comment-field" data-comment-index="${index}" data-comment-field="portrait" value="${escapeHtml(block.portrait || '')}" placeholder="Imgur-Link">
                </div>
              </div>`}
            ${buildTextFormatToolbar()}
            <textarea class="inline-edit-textarea" data-inline-action="update-comment-field" data-comment-index="${index}" data-comment-field="text" placeholder="${block.narrator ? 'Erzählertext' : 'Kommentartext'}">${escapeHtml(block.text || '')}</textarea>
          </div>`).join('') : `<div class="inline-placeholder-note">Noch kein statischer Kommentarsektor vorhanden. Lege oben einen Erzähler- oder Kommentarblock an.</div>`}
      </div>
    </div>`;
}

function buildInlineSceneEditor(page) {
  const blocks = Array.isArray(page.sceneBlocks) ? page.sceneBlocks : [];
  return `
    <div class="inline-edit-section">
      <div class="inline-edit-head">
        <div class="inline-edit-kicker">Szenenblöcke</div>
        <div class="inline-edit-minirow">
          <button class="module-editor-mini-btn" type="button" data-inline-action="add-scene-block" data-scene-kind="intro">+ Intro</button>
          <button class="module-editor-mini-btn" type="button" data-inline-action="add-scene-block" data-scene-kind="speech">+ Rede</button>
          <button class="module-editor-mini-btn" type="button" data-inline-action="add-scene-block" data-scene-kind="thought">+ Gedanke</button>
          <button class="module-editor-mini-btn" type="button" data-inline-action="add-scene-block" data-scene-kind="action">+ Handlung</button>
          <button class="module-editor-mini-btn" type="button" data-inline-action="add-scene-block" data-scene-kind="divider">+ Trenner</button>
        </div>
      </div>
      <div class="module-scene-speaker-tools inline-scene-speaker-tools">
        <div class="inline-edit-field">
          <span class="inline-edit-label">Sprecher ersetzen</span>
          <select class="inline-edit-select" data-inline-role="scene-replace-source">
            ${buildSceneSpeakerOptions(blocks)}
          </select>
        </div>
        <div class="inline-edit-field">
          <span class="inline-edit-label">Neue Figur</span>
          <select class="inline-edit-select" data-inline-role="scene-replace-target">
            ${buildModuleCharacterOptions('', 'Neue Figur wählen')}
          </select>
        </div>
        <button class="module-editor-mini-btn" type="button" data-inline-action="replace-scene-speaker">Ersetzen</button>
      </div>
      <div class="inline-scene-editor">
        ${blocks.map((block, index) => `
          <div class="inline-scene-card">
            <div class="inline-edit-minirow">
              <select class="inline-edit-select" data-inline-action="update-scene-field" data-scene-index="${index}" data-scene-field="type">
                <option value="intro"${block.type === 'intro' ? ' selected' : ''}>Intro</option>
                <option value="speech"${block.type === 'speech' ? ' selected' : ''}>Rede</option>
                <option value="thought"${block.type === 'thought' ? ' selected' : ''}>Gedanke</option>
                <option value="action"${block.type === 'action' ? ' selected' : ''}>Handlung</option>
                <option value="divider"${block.type === 'divider' ? ' selected' : ''}>Trenner</option>
              </select>
              <button class="module-editor-mini-btn module-editor-danger" type="button" data-inline-action="remove-scene-block" data-scene-index="${index}">Löschen</button>
            </div>
            ${isCharacterSceneBlockType(block.type) ? `
              <div class="inline-edit-grid">
                <div class="inline-edit-field">
                  <span class="inline-edit-label">Seite</span>
                  <select class="inline-edit-select" data-inline-action="update-scene-field" data-scene-index="${index}" data-scene-field="side">
                    <option value="left"${(block.side || 'left') === 'left' ? ' selected' : ''}>Links</option>
                    <option value="right"${block.side === 'right' ? ' selected' : ''}>Rechts</option>
                  </select>
                </div>
                <div class="inline-edit-field">
                  <span class="inline-edit-label">Name</span>
                  <input class="inline-edit-input" type="text" data-inline-action="update-scene-field" data-scene-index="${index}" data-scene-field="name" value="${escapeHtml(block.name || '')}">
                </div>
                <div class="inline-edit-field wide">
                  <span class="inline-edit-label">Avatar-URL</span>
                  <input class="inline-edit-input" type="url" data-inline-action="update-scene-field" data-scene-index="${index}" data-scene-field="avatar" value="${escapeHtml(block.avatar || '')}" placeholder="Imgur-Link">
                </div>
              </div>` : ''}
            ${block.type === 'divider' ? '' : `${buildTextFormatToolbar()}<textarea class="inline-edit-textarea" data-inline-action="update-scene-field" data-scene-index="${index}" data-scene-field="text">${escapeHtml(block.text || '')}</textarea>`}
          </div>`).join('')}
      </div>
    </div>`;
}

function buildInlineTemplatePicker(currentType = 'story') {
  return `
    <div class="inline-edit-field wide">
      <span class="inline-edit-label">Vorlage</span>
      <select class="inline-edit-select" data-inline-action="apply-template">
        ${buildModuleTemplateOptions(currentType)}
      </select>
    </div>`;
}
