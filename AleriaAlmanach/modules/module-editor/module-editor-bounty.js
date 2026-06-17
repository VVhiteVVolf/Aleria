const BOUNTY_EDITOR_LISTS = {
  charges: {
    label: 'Tatvorwuerfe',
    titleField: 'chargesTitle',
    addLabel: 'Tatvorwurf',
    wrapClass: 'module-bounty-charges',
    rowClass: 'module-bounty-charge-row',
    prefix: 'me-bounty-charge',
    fallback: { icon: '', title: 'Neuer Tatvorwurf', text: '' },
    fields: [
      ['icon', 'Icon-URL', 'url'],
      ['title', 'Tatvorwurf', 'text'],
      ['text', 'Zusatztext', 'textarea']
    ]
  },
  descriptionRows: {
    label: 'Personenbeschreibung',
    titleField: 'descriptionTitle',
    addLabel: 'Merkmal',
    wrapClass: 'module-bounty-description-rows',
    rowClass: 'module-bounty-description-row',
    prefix: 'me-bounty-description',
    fallback: { label: 'Merkmal', value: 'Wert' },
    fields: [
      ['label', 'Label', 'text'],
      ['value', 'Wert', 'text']
    ]
  },
  companions: {
    label: 'Bekannte Begleiter',
    titleField: 'companionsTitle',
    addLabel: 'Begleiter',
    wrapClass: 'module-bounty-companions',
    rowClass: 'module-bounty-image-row',
    prefix: 'me-bounty-companion',
    fallback: { image: '', imageScale: 100, imageX: 50, imageY: 50, title: 'Neuer Begleiter', subtitle: 'Rolle', text: '' },
    imageFields: true,
    fields: [
      ['image', 'Bild-URL', 'url'],
      ['title', 'Name', 'text'],
      ['subtitle', 'Rolle / Titel', 'text'],
      ['text', 'Notiz', 'textarea']
    ]
  },
  sightings: {
    label: 'Letzte Sichtungen',
    titleField: 'sightingsTitle',
    addLabel: 'Sichtung',
    wrapClass: 'module-bounty-sightings',
    rowClass: 'module-bounty-sighting-row',
    prefix: 'me-bounty-sighting',
    fallback: { place: 'Ort', date: 'Datum', observer: 'Beobachter' },
    fields: [
      ['place', 'Ort', 'text'],
      ['date', 'Datum', 'text'],
      ['observer', 'Beobachter', 'text']
    ]
  },
  allies: {
    label: 'Verbuendete',
    titleField: 'alliesTitle',
    addLabel: 'Verbindung',
    wrapClass: 'module-bounty-allies',
    rowClass: 'module-bounty-image-row',
    prefix: 'me-bounty-ally',
    fallback: { image: '', imageScale: 100, imageX: 50, imageY: 50, title: 'Verbindung', subtitle: '', text: '' },
    imageFields: true,
    fields: [
      ['image', 'Bild-URL', 'url'],
      ['title', 'Titel', 'text'],
      ['subtitle', 'Unterzeile', 'text'],
      ['text', 'Text', 'textarea']
    ]
  },
  enemies: {
    label: 'Feinde',
    titleField: 'enemiesTitle',
    addLabel: 'Feind',
    wrapClass: 'module-bounty-enemies',
    rowClass: 'module-bounty-image-row',
    prefix: 'me-bounty-enemy',
    fallback: { image: '', imageScale: 100, imageX: 50, imageY: 50, title: 'Feind', subtitle: '', text: '' },
    imageFields: true,
    fields: [
      ['image', 'Bild-URL', 'url'],
      ['title', 'Titel', 'text'],
      ['subtitle', 'Unterzeile', 'text'],
      ['text', 'Text', 'textarea']
    ]
  },
  supporters: {
    label: 'Moegliche Unterstuetzer',
    titleField: 'supportersTitle',
    addLabel: 'Unterstuetzer',
    wrapClass: 'module-bounty-supporters',
    rowClass: 'module-bounty-image-row',
    prefix: 'me-bounty-supporter',
    fallback: { image: '', imageScale: 100, imageX: 50, imageY: 50, title: 'Unterstuetzer', subtitle: '', text: '' },
    imageFields: true,
    fields: [
      ['image', 'Bild-URL', 'url'],
      ['title', 'Titel', 'text'],
      ['subtitle', 'Unterzeile', 'text'],
      ['text', 'Text', 'textarea']
    ]
  },
  dangerProfiles: {
    label: 'Gefaehrlichkeitsprofil',
    titleField: 'dangerTitle',
    addLabel: 'Profilwert',
    wrapClass: 'module-bounty-danger-profiles',
    rowClass: 'module-bounty-danger-row',
    prefix: 'me-bounty-danger',
    fallback: { icon: '', label: 'Profilwert', value: 3 },
    fields: [
      ['icon', 'Icon-URL', 'url'],
      ['label', 'Name', 'text'],
      ['value', 'Wert 0-5', 'number']
    ]
  }
};

function getBountyEditorListConfig(listName) {
  return BOUNTY_EDITOR_LISTS[listName] || BOUNTY_EDITOR_LISTS.charges;
}

function buildBountyImageTransformControls(item, prefix) {
  return `
    <div class="module-editor-field">
      <label>Bildgroesse <span>${escapeHtml(item.imageScale || 100)}%</span></label>
      <input class="module-size-range ${prefix}-imageScale" type="range" min="50" max="220" step="1" value="${escapeHtml(item.imageScale || 100)}" data-module-editor-action="update-range-percent-label">
    </div>
    <div class="module-editor-field">
      <label>Bild X <span>${escapeHtml(item.imageX || 50)}%</span></label>
      <input class="module-size-range ${prefix}-imageX" type="range" min="0" max="100" step="1" value="${escapeHtml(item.imageX || 50)}" data-module-editor-action="update-range-percent-label">
    </div>
    <div class="module-editor-field">
      <label>Bild Y <span>${escapeHtml(item.imageY || 50)}%</span></label>
      <input class="module-size-range ${prefix}-imageY" type="range" min="0" max="100" step="1" value="${escapeHtml(item.imageY || 50)}" data-module-editor-action="update-range-percent-label">
    </div>`;
}

function buildBountyEditorRows(items = [], listName = 'charges') {
  const config = getBountyEditorListConfig(listName);
  const rows = Array.isArray(items) && items.length ? items : [config.fallback];
  return rows.map(item => `
    <div class="bounty-edit-row ${config.rowClass}">
      ${config.fields.map(([field, placeholder, type]) => {
        const value = escapeHtml(item?.[field] || '');
        const className = `${config.prefix}-${field}`;
        if (type === 'textarea') {
          return `<textarea class="inline-edit-textarea ${className}" placeholder="${escapeHtml(placeholder)}">${value}</textarea>`;
        }
        const extra = type === 'number' ? ' min="0" max="5" step="1"' : '';
        return `<input class="inline-edit-input ${className}" type="${type}"${extra} value="${value}" placeholder="${escapeHtml(placeholder)}">`;
      }).join('')}
      ${config.imageFields ? buildBountyImageTransformControls(item, config.prefix) : ''}
      <button class="module-editor-mini-btn module-editor-danger" type="button" data-module-editor-action="remove-bounty-row">Loeschen</button>
    </div>`).join('');
}

function collectBountyEditorRows(card, listName) {
  const config = getBountyEditorListConfig(listName);
  return Array.from(card.querySelectorAll(`.${config.rowClass}`)).map(row => {
    const item = {};
    config.fields.forEach(([field]) => {
      item[field] = getTrimmedFormValue(row, `.${config.prefix}-${field}`);
    });
    if (config.imageFields) {
      item.imageScale = Number(getFormValue(row, `.${config.prefix}-imageScale`)) || 100;
      item.imageX = Number(getFormValue(row, `.${config.prefix}-imageX`)) || 50;
      item.imageY = Number(getFormValue(row, `.${config.prefix}-imageY`)) || 50;
    }
    return item;
  }).filter(item => Object.entries(item).some(([key, value]) =>
    !['imageScale', 'imageX', 'imageY'].includes(key) && String(value || '').trim()
  ));
}

function addModuleBountyRow(button, listName) {
  const pageCard = button.closest('.module-page-card');
  const config = getBountyEditorListConfig(listName);
  const wrap = pageCard?.querySelector(`.${config.wrapClass}`);
  if (!wrap) return;
  wrap.querySelector('.inline-placeholder-note')?.remove();
  wrap.insertAdjacentHTML('beforeend', buildBountyEditorRows([], listName));
  hydrateModuleRichEditors(wrap.lastElementChild || wrap);
  syncModuleJsonPreview();
}

function removeModuleBountyRow(button) {
  const row = button.closest('.bounty-edit-row');
  const wrap = row?.parentElement;
  if (!row || !wrap) return;
  row.remove();
  if (!wrap.querySelector('.bounty-edit-row')) {
    wrap.innerHTML = '<div class="inline-placeholder-note">Noch keine Eintraege vorhanden.</div>';
  }
  syncModuleJsonPreview();
}

function buildBountyEditorListBlock(data, listName) {
  const config = getBountyEditorListConfig(listName);
  return `
    <div class="module-editor-field wide">
      <div class="module-editor-inline" style="justify-content:space-between;">
        <label>${escapeHtml(config.label)}</label>
        <button class="module-editor-mini-btn" type="button" data-module-editor-action="add-bounty-row" data-bounty-list="${escapeHtml(listName)}">+ ${escapeHtml(config.addLabel)}</button>
      </div>
      <input type="text" class="me-bounty-${escapeHtml(config.titleField)}" value="${escapeHtml(data[config.titleField] || '')}">
      <div class="bounty-edit-list ${config.wrapClass}">
        ${buildBountyEditorRows(data[listName], listName)}
      </div>
    </div>`;
}

function buildBountyScaleField(label, className, value, min = 50, max = 220) {
  return `
    <div class="module-editor-field">
      <label>${escapeHtml(label)} <span>${escapeHtml(value)}%</span></label>
      <input class="module-size-range ${className}" type="range" min="${escapeHtml(min)}" max="${escapeHtml(max)}" step="1" value="${escapeHtml(value)}" data-module-editor-action="update-range-percent-label">
    </div>`;
}

function buildBountyFileModuleEditorFields(page) {
  const data = sanitizeBountyFileData(page?.bountyFile || {});
  return `
      <div class="module-page-type-block${inferModulePageType(page) === 'bounty-file' ? ' visible' : ''}" data-page-type="bounty-file">
        <div class="module-editor-grid">
          <div class="module-editor-field wide">
            <label>Beschreibung</label>
            ${buildTextFormatToolbar()}
            <textarea class="me-bounty-description">${escapeHtml(page?.description || '')}</textarea>
          </div>
          <div class="module-editor-field">
            <label>Aktenueberschrift</label>
            <input type="text" class="me-bounty-archive-title" value="${escapeHtml(data.archiveTitle)}">
          </div>
          <div class="module-editor-field">
            <label>Unterzeile</label>
            <input type="text" class="me-bounty-archive-subtitle" value="${escapeHtml(data.archiveSubtitle)}">
          </div>
          <div class="module-editor-field">
            <label>Regionales Banner</label>
            <input type="url" class="me-bounty-regional-banner" value="${escapeHtml(data.regionalBanner)}" placeholder="https://i.imgur.com/...">
          </div>
          ${buildBountyScaleField('Banner-Groesse', 'me-bounty-regional-banner-scale', data.regionalBannerScale)}
          ${buildBountyScaleField('Banner X', 'me-bounty-regional-banner-x', data.regionalBannerX, 0, 100)}
          ${buildBountyScaleField('Banner Y', 'me-bounty-regional-banner-y', data.regionalBannerY, 0, 100)}
          <div class="module-editor-field">
            <label>Hintergrundbild</label>
            <input type="url" class="me-bounty-background-image" value="${escapeHtml(data.backgroundImage)}" placeholder="https://i.imgur.com/...">
          </div>
          <div class="module-editor-field">
            <label>Portraitbild</label>
            <input type="url" class="me-bounty-portrait-image" value="${escapeHtml(data.portraitImage)}" placeholder="https://i.imgur.com/...">
          </div>
          ${buildBountyScaleField('Portrait-Groesse', 'me-bounty-portrait-scale', data.portraitScale)}
          ${buildBountyScaleField('Portrait X', 'me-bounty-portrait-x', data.portraitX, 0, 100)}
          ${buildBountyScaleField('Portrait Y', 'me-bounty-portrait-y', data.portraitY, 0, 100)}
          <div class="module-editor-field">
            <label>Wachssiegel</label>
            <input type="url" class="me-bounty-seal-image" value="${escapeHtml(data.sealImage)}" placeholder="https://i.imgur.com/...">
          </div>
          ${buildBountyScaleField('Siegel-Groesse', 'me-bounty-seal-scale', data.sealScale, 50, 180)}
          ${buildBountyScaleField('Siegel X', 'me-bounty-seal-x', data.sealX, 0, 100)}
          ${buildBountyScaleField('Siegel Y', 'me-bounty-seal-y', data.sealY, 0, 100)}
          <div class="module-editor-field">
            <label>Muenzen-Icon</label>
            <input type="url" class="me-bounty-coin-image" value="${escapeHtml(data.coinImage)}" placeholder="https://i.imgur.com/...">
          </div>
          ${buildBountyScaleField('Muenzen-Groesse', 'me-bounty-coin-scale', data.coinScale, 50, 180)}
          ${buildBountyScaleField('Muenze X', 'me-bounty-coin-x', data.coinX, 0, 100)}
          ${buildBountyScaleField('Muenze Y', 'me-bounty-coin-y', data.coinY, 0, 100)}
          <div class="module-editor-field">
            <label>Name-Label</label>
            <input type="text" class="me-bounty-name-label" value="${escapeHtml(data.nameLabel)}">
          </div>
          <div class="module-editor-field">
            <label>Name</label>
            <input type="text" class="me-bounty-target-name" value="${escapeHtml(data.targetName)}">
          </div>
          <div class="module-editor-field">
            <label>Alias-Label</label>
            <input type="text" class="me-bounty-aliases-label" value="${escapeHtml(data.aliasesLabel)}">
          </div>
          <div class="module-editor-field wide">
            <label>Aliasnamen</label>
            <input type="text" class="me-bounty-aliases" value="${escapeHtml(data.aliases)}">
          </div>
          <div class="module-editor-field">
            <label>Status-Label</label>
            <input type="text" class="me-bounty-status-label" value="${escapeHtml(data.statusLabel)}">
          </div>
          <div class="module-editor-field">
            <label>Status</label>
            <input type="text" class="me-bounty-status" value="${escapeHtml(data.status)}">
          </div>
          <div class="module-editor-field">
            <label>Statusnotiz</label>
            <input type="text" class="me-bounty-status-note" value="${escapeHtml(data.statusNote)}">
          </div>
          <div class="module-editor-field">
            <label>Gefahrenstufe <span>${escapeHtml(data.threatLevel)}</span></label>
            <input class="module-size-range me-bounty-threat-level" type="range" min="1" max="5" step="1" value="${escapeHtml(data.threatLevel)}" data-module-editor-action="update-range-percent-label">
          </div>
          <div class="module-editor-field">
            <label>Gefahrentext</label>
            <input type="text" class="me-bounty-threat-text" value="${escapeHtml(data.threatText)}">
          </div>
          <div class="module-editor-field">
            <label>Kopfgeld-Label</label>
            <input type="text" class="me-bounty-bounty-label" value="${escapeHtml(data.bountyLabel)}">
          </div>
          <div class="module-editor-field">
            <label>Kopfgeld</label>
            <input type="text" class="me-bounty-amount" value="${escapeHtml(data.bountyAmount)}">
          </div>
          <div class="module-editor-field">
            <label>Waehrung</label>
            <input type="text" class="me-bounty-currency" value="${escapeHtml(data.bountyCurrency)}">
          </div>
          <div class="module-editor-field wide">
            <label>Uebergabehinweis</label>
            ${buildTextFormatToolbar()}
            <textarea class="me-bounty-handover-note small">${escapeHtml(data.handoverNote)}</textarea>
          </div>
          ${buildBountyEditorListBlock(data, 'charges')}
          ${buildBountyEditorListBlock(data, 'descriptionRows')}
          <div class="module-editor-field wide">
            <label>Beschreibung - Zusatztext</label>
            ${buildTextFormatToolbar()}
            <textarea class="me-bounty-description-note small">${escapeHtml(data.descriptionNote)}</textarea>
          </div>
          <div class="module-editor-field">
            <label>Beschreibung - Icon</label>
            <input type="url" class="me-bounty-description-icon" value="${escapeHtml(data.descriptionIcon)}" placeholder="https://i.imgur.com/...">
          </div>
          ${buildBountyEditorListBlock(data, 'companions')}
          ${buildBountyEditorListBlock(data, 'sightings')}
          <div class="module-editor-field">
            <label>Verbindungen-Ueberschrift</label>
            <input type="text" class="me-bounty-connections-title" value="${escapeHtml(data.connectionsTitle)}">
          </div>
          <div class="module-editor-field">
            <label>Fraktion-Titel</label>
            <input type="text" class="me-bounty-faction-title" value="${escapeHtml(data.factionTitle)}">
          </div>
          <div class="module-editor-field">
            <label>Fraktionsbanner</label>
            <input type="url" class="me-bounty-faction-banner" value="${escapeHtml(data.factionBanner)}" placeholder="https://i.imgur.com/...">
          </div>
          ${buildBountyScaleField('Fraktionsbanner-Groesse', 'me-bounty-faction-banner-scale', data.factionBannerScale)}
          ${buildBountyScaleField('Fraktionsbanner X', 'me-bounty-faction-banner-x', data.factionBannerX, 0, 100)}
          ${buildBountyScaleField('Fraktionsbanner Y', 'me-bounty-faction-banner-y', data.factionBannerY, 0, 100)}
          <div class="module-editor-field">
            <label>Fraktion / Bande</label>
            <input type="text" class="me-bounty-faction-name" value="${escapeHtml(data.factionName)}">
          </div>
          <div class="module-editor-field wide">
            <label>Fraktionstext</label>
            <textarea class="me-bounty-faction-text small">${escapeHtml(data.factionText)}</textarea>
          </div>
          ${buildBountyEditorListBlock(data, 'allies')}
          ${buildBountyEditorListBlock(data, 'enemies')}
          ${buildBountyEditorListBlock(data, 'supporters')}
          ${buildBountyEditorListBlock(data, 'dangerProfiles')}
          <div class="module-editor-field wide">
            <label>Footer</label>
            <input type="text" class="me-bounty-footer" value="${escapeHtml(data.footer)}">
          </div>
        </div>
      </div>`;
}

function collectBountyFileModuleEditorPage(card, page) {
  const block = card.querySelector('[data-page-type="bounty-file"]') || card;
  page.bountyFilePage = true;
  page.description = getTrimmedFormValue(card, '.me-bounty-description');
  page.bountyFile = sanitizeBountyFileData({
    archiveTitle: getTrimmedFormValue(card, '.me-bounty-archive-title'),
    archiveSubtitle: getTrimmedFormValue(card, '.me-bounty-archive-subtitle'),
    regionalBanner: getTrimmedFormValue(card, '.me-bounty-regional-banner'),
    regionalBannerScale: getFormValue(card, '.me-bounty-regional-banner-scale'),
    regionalBannerX: getFormValue(card, '.me-bounty-regional-banner-x'),
    regionalBannerY: getFormValue(card, '.me-bounty-regional-banner-y'),
    backgroundImage: getTrimmedFormValue(card, '.me-bounty-background-image'),
    portraitImage: getTrimmedFormValue(card, '.me-bounty-portrait-image'),
    portraitScale: getFormValue(card, '.me-bounty-portrait-scale'),
    portraitX: getFormValue(card, '.me-bounty-portrait-x'),
    portraitY: getFormValue(card, '.me-bounty-portrait-y'),
    sealImage: getTrimmedFormValue(card, '.me-bounty-seal-image'),
    sealScale: getFormValue(card, '.me-bounty-seal-scale'),
    sealX: getFormValue(card, '.me-bounty-seal-x'),
    sealY: getFormValue(card, '.me-bounty-seal-y'),
    coinImage: getTrimmedFormValue(card, '.me-bounty-coin-image'),
    coinScale: getFormValue(card, '.me-bounty-coin-scale'),
    coinX: getFormValue(card, '.me-bounty-coin-x'),
    coinY: getFormValue(card, '.me-bounty-coin-y'),
    nameLabel: getTrimmedFormValue(card, '.me-bounty-name-label'),
    targetName: getTrimmedFormValue(card, '.me-bounty-target-name'),
    aliasesLabel: getTrimmedFormValue(card, '.me-bounty-aliases-label'),
    aliases: getTrimmedFormValue(card, '.me-bounty-aliases'),
    statusLabel: getTrimmedFormValue(card, '.me-bounty-status-label'),
    status: getTrimmedFormValue(card, '.me-bounty-status'),
    statusNote: getTrimmedFormValue(card, '.me-bounty-status-note'),
    threatLevel: getFormValue(card, '.me-bounty-threat-level'),
    threatText: getTrimmedFormValue(card, '.me-bounty-threat-text'),
    bountyLabel: getTrimmedFormValue(card, '.me-bounty-bounty-label'),
    bountyAmount: getTrimmedFormValue(card, '.me-bounty-amount'),
    bountyCurrency: getTrimmedFormValue(card, '.me-bounty-currency'),
    handoverNote: getTrimmedFormValue(card, '.me-bounty-handover-note'),
    chargesTitle: getTrimmedFormValue(card, '.me-bounty-chargesTitle'),
    charges: collectBountyEditorRows(block, 'charges'),
    descriptionTitle: getTrimmedFormValue(card, '.me-bounty-descriptionTitle'),
    descriptionRows: collectBountyEditorRows(block, 'descriptionRows'),
    descriptionNote: getTrimmedFormValue(card, '.me-bounty-description-note'),
    descriptionIcon: getTrimmedFormValue(card, '.me-bounty-description-icon'),
    companionsTitle: getTrimmedFormValue(card, '.me-bounty-companionsTitle'),
    companions: collectBountyEditorRows(block, 'companions'),
    sightingsTitle: getTrimmedFormValue(card, '.me-bounty-sightingsTitle'),
    sightings: collectBountyEditorRows(block, 'sightings'),
    connectionsTitle: getTrimmedFormValue(card, '.me-bounty-connections-title'),
    factionTitle: getTrimmedFormValue(card, '.me-bounty-faction-title'),
    factionBanner: getTrimmedFormValue(card, '.me-bounty-faction-banner'),
    factionBannerScale: getFormValue(card, '.me-bounty-faction-banner-scale'),
    factionBannerX: getFormValue(card, '.me-bounty-faction-banner-x'),
    factionBannerY: getFormValue(card, '.me-bounty-faction-banner-y'),
    factionName: getTrimmedFormValue(card, '.me-bounty-faction-name'),
    factionText: getTrimmedFormValue(card, '.me-bounty-faction-text'),
    alliesTitle: getTrimmedFormValue(card, '.me-bounty-alliesTitle'),
    allies: collectBountyEditorRows(block, 'allies'),
    enemiesTitle: getTrimmedFormValue(card, '.me-bounty-enemiesTitle'),
    enemies: collectBountyEditorRows(block, 'enemies'),
    supportersTitle: getTrimmedFormValue(card, '.me-bounty-supportersTitle'),
    supporters: collectBountyEditorRows(block, 'supporters'),
    dangerTitle: getTrimmedFormValue(card, '.me-bounty-dangerTitle'),
    dangerProfiles: collectBountyEditorRows(block, 'dangerProfiles'),
    footer: getTrimmedFormValue(card, '.me-bounty-footer')
  });
  return page;
}
