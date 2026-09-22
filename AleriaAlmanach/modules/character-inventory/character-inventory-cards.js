// Cards and the right-hand preview share the same presentation and rule rows.
function buildInventoryCardFacts(rows) {
  return `<dl class="ci-card-facts">${rows.map(row => `<div><dt>${escapeHtml(row.label)}</dt><dd>${characterInventoryText(String(row.value ?? ''))}</dd></div>`).join('')}</dl>`;
}

function buildInventoryCardContent(item, { compact = false, status = '' } = {}) {
  const model = window.AleriaCharacterInventory.card(item);
  if (status) model.status = status;
  const image = buildCharacterInventoryImage(item.image, item.name, 'ci-card-art', model.symbol, { format: 'square', fit: 'contain' });
  return `<div class="ci-item-card ci-card-${model.kind}${compact ? ' ci-card-compact' : ''}">
    <header class="ci-card-heading"><span class="ci-card-kicker">${model.symbol} ${escapeHtml(model.label)}</span><span class="ci-card-status">${escapeHtml(model.status)}</span></header>
    <div class="ci-card-image">${image}</div>
    <div class="ci-card-title"><h3>${escapeHtml(item.name)}</h3><p>${escapeHtml(item.type || model.label)}</p></div>
    <div class="ci-card-diagram">${buildCharacterInventoryRadar(item.attributes, 'ci-card-radar')}<small>Eigenschaften · Skala 0–10</small></div>
    <div class="ci-card-description">${buildInventoryCardFacts(compact ? model.rows.filter(row => !['Preisgrundlage', 'Gezahlter Kaufpreis'].includes(row.label)) : model.rows)}<div class="ci-card-lore"><span class="ci-card-kicker">Beschreibung</span><p>${characterInventoryText(model.description)}</p></div></div>
    ${compact ? '' : `<section class="ci-card-rules"><h4>Aktionen & Wirkung</h4>${model.actions.map(action => `<div><strong>${escapeHtml(action.name)}</strong><p>${characterInventoryText(action.description)}</p></div>`).join('')}${model.effects.map(effect => `<div><strong>${escapeHtml(effect.label)}</strong><p>${characterInventoryText(effect.value)}</p></div>`).join('')}</section>`}
  </div>`;
}

function buildCharacterInventoryLivePreview(item) {
  return `<div class="ci-live-head"><span>Gegenstand im Fokus</span><span aria-hidden="true">◈</span></div>${item
    ? `${buildInventoryCardContent(item, { compact: true })}<button class="ci-card-open" type="button" data-ci-action="show-item" data-ci-item-id="${escapeHtml(item.id)}">Itemkarte öffnen <span aria-hidden="true">↗</span></button>`
    : '<div class="ci-live-empty"><span aria-hidden="true">◈</span><h3>Deine Ausrüstung</h3><p>Wähle einen Gegenstand aus dem Verzeichnis.</p></div>'}`;
}

function buildCharacterInventoryItemModal(item, options = {}) {
  return `<article class="ci-profile-modal ci-card-modal" data-ci-item-id="${escapeHtml(item.id)}">
    <button class="ci-modal-close" type="button" data-ci-action="close-profile" aria-label="Itemkarte schließen">×</button>
    ${buildInventoryCardContent(item)}
    <footer class="ci-card-footer">
      ${item.ownerCharacterId ? `<button type="button" data-ci-action="open-item-sheet" data-ci-item-id="${escapeHtml(item.id)}">${item.combatDefinition ? 'Im Kampfbogen öffnen' : 'Im Charakterbogen öffnen'}</button>` : ''}
      <button type="button" data-ci-action="open-item-register" data-ci-item-id="${escapeHtml(item.id)}">Im Handelsregister</button>
      ${options.readOnly ? '' : '<button type="button" data-ci-action="edit-item">Bearbeiten</button>'}
    </footer>
  </article>`;
}

function buildCharacterInventoryCompanionModal(companion, options = {}) {
  return `<article class="ci-profile-modal ci-card-modal ci-companion-modal" data-ci-companion-id="${escapeHtml(companion.id)}">
    <button class="ci-modal-close" type="button" data-ci-action="close-profile" aria-label="Gefährtenkarte schließen">×</button>
    <div class="ci-item-card ci-card-companion">
      <header class="ci-card-heading"><span class="ci-card-kicker">♞ Gefährte</span><span>${escapeHtml(companion.status || companion.role || 'Begleiter')}</span></header>
      <div class="ci-companion-layout">
        <div class="ci-companion-portrait-column">
          <div class="ci-card-image">${buildCharacterInventoryImage(companion.image, companion.name, 'ci-card-art', '♞', { format: 'landscape', fit: 'contain' })}</div>
          ${companion.attributes?.length ? `<div class="ci-card-diagram">${buildCharacterInventoryRadar(companion.attributes, 'ci-card-radar')}</div>` : ''}
        </div>
        <div class="ci-companion-details">
          <div class="ci-card-title"><h3>${escapeHtml(companion.name)}</h3><p>${escapeHtml(companion.species || '')}</p></div>
          ${buildInventoryCardFacts(companion.infoRows || [])}
          <div class="ci-card-lore"><span class="ci-card-kicker">Wesen & Bindung</span><p>${characterInventoryText(companion.personality || companion.summary || companion.description || 'Dieser Gefährte wartet auf seine Geschichte.')}</p></div>
          ${companion.abilities?.length ? `<section class="ci-card-rules"><h4>Fähigkeiten</h4>${companion.abilities.map(ability => `<div><strong>${escapeHtml(ability.name)}</strong><p>${characterInventoryText(ability.description)}</p></div>`).join('')}</section>` : ''}
        </div>
      </div>
    </div>
    <footer class="ci-card-footer">${companion.creatureId
      ? `<button type="button" data-ci-action="open-creature" data-ci-creature-id="${escapeHtml(companion.creatureId)}">Kreaturbogen öffnen ↗</button>`
      : companion.inventoryItemId ? `<button type="button" data-ci-action="open-item-register" data-ci-item-id="${escapeHtml(companion.inventoryItemId)}">Kreaturbogen im Register verknüpfen ↗</button>`
      : '<span>Ein Kreaturbogen kann im Inventareditor verknüpft werden.</span>'}
      ${options.readOnly || companion.inventoryItemId ? '' : '<button type="button" data-ci-action="edit-companion">Bearbeiten</button>'}
    </footer>
  </article>`;
}
