document.addEventListener('error', event => {
  const image = event.target;
  if (!image?.matches?.('img[data-ci-image-fallback]')) return;
  const placeholder = document.createElement('div');
  placeholder.className = `${image.className} ci-placeholder`;
  placeholder.textContent = image.dataset.ciImageFallback;
  placeholder.setAttribute('role', 'img');
  placeholder.setAttribute('aria-label', image.alt);
  image.replaceWith(placeholder);
}, true);

function selectCharacterInventoryItem(page, itemId) {
  const data = mergeCharacterInventoryDataWithItemDb(getCharacterInventoryPageData(page));
  const item = data.items.find(entry => entry.id === itemId);
  page.dataset.ciSelectedId = item?.id || '';
  page.querySelectorAll('.ci-item-row').forEach(row => {
    const selected = row.dataset.ciItemId === item?.id;
    row.classList.toggle('is-selected', selected);
    row.querySelector('[data-ci-action="select-item"]')?.setAttribute('aria-pressed', String(selected));
  });
  const preview = page.querySelector('.ci-live-preview');
  if (preview) preview.innerHTML = buildCharacterInventoryLivePreview(item);
}

function filterCharacterInventoryItems(page) {
  const category = page.querySelector('[data-ci-action="filter-items"].active')?.dataset.ciCategory || '';
  const search = normalizeCharacterInventoryText(page.querySelector('[data-ci-search]')?.value);
  let firstVisible = '';
  page.querySelectorAll('.ci-item-row').forEach(row => {
    row.hidden = (!!category && row.dataset.ciCategory !== category)
      || (!!search && !normalizeCharacterInventoryText(row.textContent).includes(search));
    if (!row.hidden && !firstVisible) firstVisible = row.dataset.ciItemId;
  });
  const empty = page.querySelector('[data-ci-empty]');
  if (empty) empty.hidden = !!firstVisible;
  const selected = [...page.querySelectorAll('.ci-item-row')].find(row => row.dataset.ciItemId === page.dataset.ciSelectedId && !row.hidden);
  selectCharacterInventoryItem(page, selected?.dataset.ciItemId || firstVisible);
}

function refreshCharacterInventoryPresentation(page) {
  if (!window.AleriaCharacterInventory) return;
  const data = mergeCharacterInventoryDataWithItemDb(getCharacterInventoryPageData(page));
  const search = page.querySelector('[data-ci-search]')?.value || '';
  const category = page.querySelector('[data-ci-action="filter-items"].active')?.dataset.ciCategory || '';
  const focus = document.activeElement;
  // Do not replace a search field while the user is typing in it.
  if (!focus?.matches?.('[data-ci-search]') || !page.contains(focus)) {
    const center = page.querySelector('.ci-center');
    if (center) center.outerHTML = buildCharacterInventoryItems(data, category, { readOnly: page.dataset.ciReadonly === 'true' });
    const field = page.querySelector('[data-ci-search]');
    if (field) field.value = search;
  }
  const companions = page.querySelector('.ci-companions');
  if (companions) companions.outerHTML = buildCharacterInventoryCompanions(data);
  filterCharacterInventoryItems(page);
  const modal = page.querySelector('.ci-card-modal[data-ci-item-id]');
  const item = data.items.find(entry => entry.id === modal?.dataset.ciItemId);
  if (item) modal.outerHTML = buildCharacterInventoryItemModal(item, { readOnly: page.dataset.ciReadonly === 'true' });
}

document.addEventListener('click', async event => {
  const trigger = event.target?.closest?.('[data-ci-action]');
  if (!trigger) return;
  const page = trigger.closest('.character-inventory-page');
  if (!page) return;
  const action = trigger.dataset.ciAction;
  const pageReadOnly = page.dataset.ciReadonly === 'true';
  if (action === 'select-item') {
    event.preventDefault();
    selectCharacterInventoryItem(page, trigger.dataset.ciItemId);
    if (window.matchMedia('(max-width: 720px)').matches) page.querySelector('.ci-live-preview')?.scrollIntoView({ block: 'start', behavior: 'smooth' });
    return;
  }
  if (['open-item-register', 'open-creature', 'open-item-sheet'].includes(action)) {
    event.preventDefault();
    const data = getCharacterInventoryPageData(page);
    const item = data.items.find(entry => entry.id === trigger.dataset.ciItemId);
    const overlay = page.querySelector('.ci-profile-overlay');
    if (overlay?.open) overlay.close();
    if (action === 'open-item-register') {
      const ownedKey = item ? `owned:${data.characterId}:${item.id}` : '';
      const register = window.AleriaItemRegister;
      register?.open(register.getByKey(ownedKey)?.id || item?.templateId || item?.itemDbKey || '');
    } else if (action === 'open-creature') {
      try {
        const creatures = window.AleriaCreatures;
        const id = trigger.dataset.ciCreatureId;
        if (!creatures?.getById?.(id)) await creatures?.reload?.();
        if (!creatures?.getById?.(id)) throw new Error('Der verknüpfte Kreaturbogen ist derzeit nicht verfügbar.');
        creatures.open(id);
      } catch (error) { window.showAppStatus?.(error.message || 'Kreaturbogen konnte nicht geöffnet werden.', 'error'); }
    } else {
      if ((typeof _editingChar === 'undefined' || _editingChar !== data.characterId)
        && typeof openCharProfile === 'function') openCharProfile(data.characterId);
      if (typeof switchCharTab === 'function') switchCharTab(item?.combatDefinition ? 'combat' : 'inventory');
    }
    return;
  }
  if (pageReadOnly && [
    'apply-money-transaction',
    'equip-item-from-register',
    'toggle-equipment-quiz',
    'quiz-prev',
    'quiz-next',
    'quiz-save-answer',
    'quiz-run-ai'
  ].includes(action)) {
    event.preventDefault();
    return;
  }
  if (action === 'apply-money-transaction') {
    event.preventDefault();
    const data = getCharacterInventoryPageData(page);
    const currentTotal = getCharacterInventoryMoneyTotal(data.moneyState);
    const amount = getCharacterInventoryTransactionAmount(trigger.closest('.ci-money-panel'));
    const direction = trigger.dataset.ciTransactionDirection || 'add';
    if (!amount) {
      updateCharacterInventoryPageMoney(page, data.moneyState, 'Keine Transaktion eingetragen.');
      return;
    }
    if (direction === 'subtract' && Math.round(amount * 100) > Math.round(currentTotal * 100)) {
      updateCharacterInventoryPageMoney(page, data.moneyState, 'Nicht genug Münzen vorhanden. Der Geldbeutel bleibt unverändert.');
      return;
    }
    const nextTotal = direction === 'subtract' ? currentTotal - amount : currentTotal + amount;
    updateCharacterInventoryPageMoney(
      page,
      splitCharacterInventoryCopper(nextTotal),
      'Transaktion berechnet und gespeichert.'
    );
    return;
  }
  if (action === 'equip-item-from-register') {
    event.preventDefault();
    openCharacterInventoryItemRegisterPicker(page);
    return;
  }
  if (action === 'toggle-equipment-quiz') {
    event.preventDefault();
    updateCharacterInventoryQuiz(page, quiz => {
      quiz.open = !quiz.open;
    });
    return;
  }
  if (action === 'quiz-prev' || action === 'quiz-next' || action === 'quiz-save-answer') {
    event.preventDefault();
    saveCharacterInventoryQuizAnswer(page);
    updateCharacterInventoryQuiz(page, quiz => {
      if (action === 'quiz-prev') quiz.step = Math.max(0, quiz.step - 1);
      if (action === 'quiz-next') quiz.step = Math.min(CHARACTER_INVENTORY_EQUIPMENT_QUIZ_QUESTIONS.length - 1, quiz.step + 1);
      quiz.open = true;
      quiz.status = 'Antwort gespeichert.';
    });
    return;
  }
  if (action === 'quiz-run-ai') {
    event.preventDefault();
    await runCharacterInventoryEquipmentQuiz(page);
    return;
  }
  if (action === 'filter-items') {
    event.preventDefault();
    const category = trigger.dataset.ciCategory || '';
    page.querySelectorAll('[data-ci-action="filter-items"]').forEach(button => {
      const active = button === trigger;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
    filterCharacterInventoryItems(page);
    return;
  }
  if (action === 'show-item' || action === 'show-companion') {
    event.preventDefault();
    const data = mergeCharacterInventoryDataWithItemDb(getCharacterInventoryPageData(page));
    const overlay = page.querySelector('.ci-profile-overlay');
    if (!overlay) return;
    if (action === 'show-item') {
      const item = data.items.find(entry => entry.id === trigger.dataset.ciItemId);
      selectCharacterInventoryItem(page, item?.id);
      overlay.innerHTML = item ? buildCharacterInventoryItemModal(item, { readOnly: pageReadOnly }) : '';
    } else {
      const companion = (window.AleriaCharacterInventory?.companions(data) || data.companions).find(entry => entry.id === trigger.dataset.ciCompanionId);
      overlay.innerHTML = companion ? buildCharacterInventoryCompanionModal(companion, { readOnly: pageReadOnly }) : '';
    }
    overlay.classList.toggle('active', !!overlay.innerHTML);
    if (overlay.innerHTML && !overlay.open) overlay.showModal();
    return;
  }
  if (action === 'edit-item') {
    event.preventDefault();
    if (pageReadOnly) return;
    const modal = trigger.closest('.ci-profile-modal');
    const overlay = page.querySelector('.ci-profile-overlay');
    const data = mergeCharacterInventoryDataWithItemDb(getCharacterInventoryPageData(page));
    const item = data.items.find(entry => entry.id === modal?.dataset.ciItemId);
    if (overlay && item) overlay.innerHTML = buildCharacterInventoryItemEditModal(item);
    return;
  }
  if (action === 'edit-companion') {
    event.preventDefault();
    if (pageReadOnly) return;
    const modal = trigger.closest('.ci-profile-modal');
    const overlay = page.querySelector('.ci-profile-overlay');
    const data = mergeCharacterInventoryDataWithItemDb(getCharacterInventoryPageData(page));
    const companion = data.companions.find(entry => entry.id === modal?.dataset.ciCompanionId);
    if (overlay && companion) overlay.innerHTML = buildCharacterInventoryCompanionEditModal(companion);
    return;
  }
  if (action === 'cancel-item-edit') {
    event.preventDefault();
    const modal = trigger.closest('[data-ci-editing-item]');
    const data = mergeCharacterInventoryDataWithItemDb(getCharacterInventoryPageData(page));
    const item = data.items.find(entry => entry.id === modal?.dataset.ciEditingItem);
    const overlay = page.querySelector('.ci-profile-overlay');
    if (overlay && item) overlay.innerHTML = buildCharacterInventoryItemModal(item);
    return;
  }
  if (action === 'cancel-companion-edit') {
    event.preventDefault();
    const modal = trigger.closest('[data-ci-editing-companion]');
    const data = mergeCharacterInventoryDataWithItemDb(getCharacterInventoryPageData(page));
    const companion = data.companions.find(entry => entry.id === modal?.dataset.ciEditingCompanion);
    const overlay = page.querySelector('.ci-profile-overlay');
    if (overlay && companion) overlay.innerHTML = buildCharacterInventoryCompanionModal(companion);
    return;
  }
  if (action === 'add-item-info-row') {
    event.preventDefault();
    const list = trigger.closest('.ci-modal-edit-form')?.querySelector('[data-ci-modal-info-list]');
    list?.insertAdjacentHTML('beforeend', buildCharacterInventoryModalInfoRowsEditor([{ icon: '*', label: 'Neue Zeile', value: 'Wert' }]));
    updateCharacterInventoryModalPreview(trigger.closest('[data-ci-editing-item]'));
    return;
  }
  if (action === 'add-companion-info-row') {
    event.preventDefault();
    const list = trigger.closest('.ci-modal-edit-form')?.querySelector('[data-ci-modal-info-list]');
    list?.insertAdjacentHTML('beforeend', buildCharacterInventoryModalInfoRowsEditor([{ icon: '*', label: 'Neue Zeile', value: 'Wert' }], 'companion'));
    updateCharacterInventoryModalPreview(trigger.closest('[data-ci-editing-companion]'));
    return;
  }
  if (action === 'remove-item-info-row') {
    event.preventDefault();
    const modal = trigger.closest('[data-ci-editing-item]');
    trigger.closest('[data-ci-modal-info-row]')?.remove();
    updateCharacterInventoryModalPreview(modal);
    return;
  }
  if (action === 'remove-companion-info-row') {
    event.preventDefault();
    const modal = trigger.closest('[data-ci-editing-companion]');
    trigger.closest('[data-ci-modal-info-row]')?.remove();
    updateCharacterInventoryModalPreview(modal);
    return;
  }
  if (action === 'add-item-attribute-row') {
    event.preventDefault();
    const list = trigger.closest('.ci-modal-edit-form')?.querySelector('[data-ci-modal-attribute-list]');
    list?.insertAdjacentHTML('beforeend', buildCharacterInventoryModalAttributeEditor([{ label: 'Neuer Wert', value: 5 }]));
    updateCharacterInventoryModalPreview(trigger.closest('[data-ci-editing-item]'));
    return;
  }
  if (action === 'add-companion-attribute-row') {
    event.preventDefault();
    const list = trigger.closest('.ci-modal-edit-form')?.querySelector('[data-ci-modal-attribute-list]');
    list?.insertAdjacentHTML('beforeend', buildCharacterInventoryModalAttributeEditor([{ label: 'Neuer Wert', value: 5 }], 'companion'));
    updateCharacterInventoryModalPreview(trigger.closest('[data-ci-editing-companion]'));
    return;
  }
  if (action === 'remove-item-attribute-row') {
    event.preventDefault();
    const modal = trigger.closest('[data-ci-editing-item]');
    trigger.closest('[data-ci-modal-attribute-row]')?.remove();
    updateCharacterInventoryModalPreview(modal);
    return;
  }
  if (action === 'remove-companion-attribute-row') {
    event.preventDefault();
    const modal = trigger.closest('[data-ci-editing-companion]');
    trigger.closest('[data-ci-modal-attribute-row]')?.remove();
    updateCharacterInventoryModalPreview(modal);
    return;
  }
  if (action === 'save-item-local') {
    event.preventDefault();
    const modal = trigger.closest('[data-ci-editing-item]');
    const data = getCharacterInventoryPageData(page);
    const fallback = data.items.find(entry => entry.id === modal?.dataset.ciEditingItem);
    if (!modal || !fallback) return;
    const edited = collectCharacterInventoryModalItem(modal, fallback);
    const current = updateCharacterInventoryPageItem(page, edited);
    const overlay = page.querySelector('.ci-profile-overlay');
    if (overlay) overlay.innerHTML = buildCharacterInventoryItemModal(current);
    if (typeof showAppStatus === 'function') showAppStatus('Item nur fuer diesen Charakter gespeichert.', 'success');
    return;
  }
  if (action === 'save-item-global') {
    event.preventDefault();
    const modal = trigger.closest('[data-ci-editing-item]');
    const data = getCharacterInventoryPageData(page);
    const fallback = data.items.find(entry => entry.id === modal?.dataset.ciEditingItem);
    if (!modal || !fallback) return;
    const edited = collectCharacterInventoryModalItem(modal, fallback);
    const saved = saveCharacterInventoryItemToItemDb(edited);
    const current = updateCharacterInventoryPageItem(page, saved);
    const overlay = page.querySelector('.ci-profile-overlay');
    if (overlay) overlay.innerHTML = buildCharacterInventoryItemModal(current);
    if (typeof showAppStatus === 'function') showAppStatus('Item im Items- und Güterverzeichnis gespeichert.', 'success');
    return;
  }
  if (action === 'save-companion-profile') {
    event.preventDefault();
    const modal = trigger.closest('[data-ci-editing-companion]');
    const data = getCharacterInventoryPageData(page);
    const fallback = data.companions.find(entry => entry.id === modal?.dataset.ciEditingCompanion);
    if (!modal || !fallback) return;
    const edited = collectCharacterInventoryModalCompanion(modal, fallback);
    const current = updateCharacterInventoryPageCompanion(page, edited);
    const overlay = page.querySelector('.ci-profile-overlay');
    if (overlay) overlay.innerHTML = buildCharacterInventoryCompanionModal(current);
    if (typeof showAppStatus === 'function') showAppStatus('Gefährtenprofil im Charakter-Inventar aktualisiert.', 'success');
    return;
  }
  if (action === 'close-profile') {
    event.preventDefault();
    const overlay = page.querySelector('.ci-profile-overlay');
    if (overlay) {
      overlay.close();
      overlay.classList.remove('active');
      overlay.innerHTML = '';
    }
  }
});

// Keep keyboard navigation inside the native detail dialog. In particular,
// Escape must not also close the surrounding archive or comment editor.
document.addEventListener('keydown', event => {
  if (event.target?.closest?.('.ci-profile-overlay[open]')) event.stopPropagation();
}, true);

document.addEventListener('close', event => {
  if (!event.target?.matches?.('dialog.ci-profile-overlay')) return;
  event.target.classList.remove('active');
}, true);

document.addEventListener('input', event => {
  if (event.target?.matches?.('[data-ci-search]')) {
    filterCharacterInventoryItems(event.target.closest('.character-inventory-page'));
    return;
  }
  const moneyField = event.target?.closest?.('[data-ci-money-field]');
  if (moneyField) {
    const page = moneyField.closest('.character-inventory-page');
    const panel = moneyField.closest('.ci-money-panel');
    if (!page || !panel) return;
    if (page.dataset.ciReadonly === 'true') return;
    const data = getCharacterInventoryPageData(page);
    const money = sanitizeCharacterInventoryMoney(getCharacterInventoryMoneyInputs(panel));
    data.moneyState = money;
    data.money = formatCharacterInventoryMoney(money);
    data.moneyNotice = '';
    const merged = mergeCharacterInventoryDataWithItemDb(data);
    page.dataset.ciData = JSON.stringify(data);
    const total = panel.querySelector('.ci-money-head strong');
    if (total) total.textContent = `${money.totalCopper} Kupfer`;
    const infoRows = page.querySelector('.ci-character .ci-box');
    if (infoRows) infoRows.innerHTML = `<h3>Infotabelle</h3>${buildCharacterInventoryInfoRows(merged.infoRows)}`;
    if (typeof syncCharacterInventoryProfileDraftFromPage === 'function') syncCharacterInventoryProfileDraftFromPage(page);
    return;
  }
  const quizAnswer = event.target?.closest?.('[data-ci-quiz-answer]');
  if (quizAnswer) {
    const page = quizAnswer.closest('.character-inventory-page');
    if (!page) return;
    if (page.dataset.ciReadonly === 'true') return;
    saveCharacterInventoryQuizAnswer(page);
    return;
  }
  const modal = event.target?.closest?.('[data-ci-editing-item], [data-ci-editing-companion]');
  if (!modal) return;
  updateCharacterInventoryModalPreview(modal);
});

document.addEventListener('change', event => {
  const modal = event.target?.closest?.('[data-ci-editing-item], [data-ci-editing-companion]');
  if (!modal) return;
  updateCharacterInventoryModalPreview(modal);
});
