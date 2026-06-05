(function(){
  const actions = {
    'edit-region-icon': () => window.onIconClick(),
    'edit-title': () => window.onTitleClick(),
    'set-layer': el => window.setLayer(el.dataset.layer || 'normal'),
    'clear-search': () => window.clearSearch(),
    'close-modal': el => window.KartoRuntime.closeModal(el.dataset.modalId),
    'close-region-icon-modal': () => window.closeIconModal(),
    'preview-region-icon-url': () => window.previewIconUrl(),
    'clear-region-icon': () => window.clearIcon(),
    'save-region-icon': () => window.saveIcon(),
    'close-password-modal': () => window.closePw(),
    'check-password': () => window.checkPw(),
    'jump-to-search-result': el => window.jumpTo(el.dataset.pinId),
    'toggle-edit': () => window.toggleEdit(),
    'start-add-pin': () => window.startAdd(),
    'select-pin-template': el => window.selectTpl(el.dataset.templateId),
    'apply-pin-template': () => window.tplApply(),
    'cancel-pin-template': () => {
      window.KartoRuntime.closeModal('pin-tpl-mo');
      window.cancelAdd();
    },
    'open-stamp-picker': () => window.openStampPicker(),
    'start-stamp': el => window.startStamp(el.dataset.pinId),
    'close-scroll-and-start-stamp': el => {
      window.closeScroll();
      window.startStamp(el.dataset.pinId);
    },
    'close-scroll': () => window.closeScroll(),
    'edit-pin-from-scroll': el => {
      window.closeScroll();
      window.KartoRuntime.openPinEditor(el.dataset.pinId);
    },
    'delete-pin': el => window.askDel(el.dataset.pinId),
    'delete-pin-from-editor': el => window.askDel(el.dataset.pinId),
    'close-sidebar': () => window.closeSidebar(),
    'save-pin-editor': el => window.sbSave(el.dataset.pinId),
    'open-pin-marker-picker': el => window.sbOpenPinMarkerPicker(el.dataset.pinId),
    'clear-pin-marker': () => window.sbClearPinMarker(),
    'set-pin-marker': el => window.sbSetPinMarker(el.dataset.markerUrl),
    'preview-pin-editor-image': el => window.KartoPinEditor.preview(el.dataset.previewTarget),
    'add-pin-table-row': () => window.sbAddRow(),
    'delete-pin-table-row': el => window.sbDelRow(Number(el.dataset.rowIndex)),
    'clear-pin-table': () => window.sbClearTable(),
    'format-pin-text': el => window.fmt(el.dataset.before || '', el.dataset.after || ''),
    'open-external-url': el => {
      const url = el.dataset.url;
      if(url) window.open(url, '_blank');
    },
    'open-overwrite-picker': () => window.openOverwritePicker(),
    'switch-overwrite-tab': el => window.owSwitchTab(el.dataset.tab),
    'start-overwrite-template': el => window.startOverwriteFromTemplate(el.dataset.templateId),
    'start-overwrite-pin': el => window.startOverwriteFromPin(el.dataset.pinId),
    'open-data-manager': el => {
      window.openDataMgr();
      if(el.closest('#dm-menu')) window.toggleDmMenu();
    },
    'toggle-dm-menu': () => window.toggleDmMenu(),
    'toggle-dm-panel': () => {
      window.toggleDmPanel();
      window.toggleDmMenu();
    },
    'add-dm-session': () => window.dmAddSession(),
    'open-dm-session': el => window.dmOpenSession(el.dataset.sessionId),
    'toggle-dm-session-group': el => window.KartoDmTools.toggleSessionGroup(el),
    'save-dm-session': () => window.dmSaveSession(),
    'delete-dm-session': () => window.dmDelSession(),
    'open-group-status': () => {
      window.openGroupStatus();
      window.toggleDmMenu();
    },
    'save-dm-status': () => window.dmSaveStatus(),
    'open-diary': () => {
      window.openDiary();
      window.toggleDmMenu();
    },
    'export-dm-diary': () => window.dmExportDiary(),
    'open-category-manager': () => {
      window.openCatMgr();
      window.toggleDmMenu();
    },
    'set-category-filter': el => window.setFilter(el.dataset.categoryId),
    'toggle-category-bar': () => window.toggleCatBar(),
    'close-category-manager': () => window.closeCatMgr(),
    'save-categories': () => window.saveCats(),
    'pick-category-marker': el => window.catPickMarker(Number(el.dataset.categoryIndex)),
    'remove-temp-category': el => window.removeTempCat(Number(el.dataset.categoryIndex)),
    'add-temp-category': () => window.addTempCat(),
    'set-category-marker': el => window.catSetMarker(el.dataset.markerUrl),
    'clear-category-marker': () => window.catClearMarker(),
    'open-marker-catalog': () => {
      window.openMarkerCatalog();
      window.toggleDmMenu();
    },
    'add-marker-catalog-item': () => window.mcatAdd(),
    'open-marker-catalog-bulk': () => window.mcatBulkOpen(),
    'apply-marker-catalog-bulk': () => window.mcatBulkApply(),
    'delete-marker-catalog-item': (el, event) => {
      event.stopPropagation();
      window.mcatDelete(el.dataset.markerId);
    },
    'export-data-manager': () => window.dmgrExport(),
    'select-data-manager-section': el => window.dmgrSelectAll(el.dataset.selectionPrefix, el.dataset.selectionValue === 'true'),
    'apply-data-manager-import': () => window.dmgrImportApply(),
    'open-data-manager-file': () => document.getElementById('dmgr-file').click(),
    'open-legacy-import-file': () => document.getElementById('import-file').click(),
    'apply-legacy-import': () => window.importApply(),
    'save-backup-now': () => window.backupSaveNow(),
    'download-backup': el => window.backupDownload(Number(el.dataset.backupIndex)),
    'restore-backup': el => window.backupRestore(Number(el.dataset.backupIndex)),
    'open-backup-history': () => {
      window.openBackupMo();
      window.toggleDmMenu();
    },
    'toggle-tools-sidebar': () => window.toggleLsb(),
    'start-calibration': () => window.KartoLsbTools.startCalibration(),
    'reset-calibration': () => window.KartoLsbTools.resetCalibration(),
    'start-measure': () => window.KartoLsbTools.startMeasure(),
    'clear-measure': () => window.KartoLsbTools.clearMeasure(),
    'open-travel-group-modal': () => window.KartoLsbModals.openGroupModal(),
    'travel-icon-tab': el => window.KartoLsbModals.iconTab(el.dataset.tab),
    'pick-travel-emoji': el => window.KartoLsbModals.pickEmoji(el.dataset.icon, el),
    'pick-travel-group-color': el => window.KartoLsbModals.pickColor(el.dataset.color, el),
    'pick-travel-custom-icon': el => window.KartoLsbModals.pickCustomSlot(el.dataset.iconSrc, el),
    'delete-travel-custom-icon': (el, event) => {
      event.stopPropagation();
      window.KartoLsbModals.deleteCustomSlot(Number(el.dataset.slotIndex));
    },
    'add-travel-custom-icon': () => window.KartoLsbModals.addCustomSlot(),
    'save-travel-group': () => window.KartoLsbModals.saveGroup(),
    'delete-travel-waypoint-event': () => window.KartoLsbModals.deleteWaypointEvent(),
    'save-travel-waypoint-event': () => window.KartoLsbModals.saveWaypointEvent(),
    'pick-travel-waypoint-event': el => window.KartoLsbModals.pickEvent(el, el.dataset.eventType),
    'select-travel-group': (el, event) => {
      if(['BUTTON','SELECT','INPUT'].includes(event.target.tagName)) return;
      window.KartoLsbGroups.selectGroup(el.dataset.groupId);
    },
    'edit-travel-group': (el, event) => {
      event.stopPropagation();
      window.KartoRuntime.openTravelGroupModal(el.dataset.groupId);
    },
    'delete-travel-group': (el, event) => {
      event.stopPropagation();
      window.lsbDelGrp(el.dataset.groupId);
    },
    'place-travel-group': el => window.lsbDoPlace(el.dataset.groupId),
    'start-travel-route': el => window.lsbStartRoute(el.dataset.groupId),
    'continue-travel-route': el => window.lsbContRoute(el.dataset.groupId),
    'clear-travel-route': el => window.lsbClrRoute(el.dataset.groupId),
    'open-travel-waypoint': el => window.KartoRuntime.openWaypointModal(el.dataset.groupId, Number(el.dataset.waypointIndex)),
    'delete-travel-waypoint': (el, event) => {
      event.stopPropagation();
      window.lsbDelWp(el.dataset.groupId, Number(el.dataset.waypointIndex));
    },
  };

  const inputActions = {
    'search-pins': el => window.onSearch(el.value),
    'render-stamp-list': el => window.renderStampList(el.value),
    'render-overwrite-pin-list': el => window.renderOverwritePinList(el.value),
    'set-dot-size': el => window.onDotSl(el.value),
    'set-label-size': el => window.onLblSl(el.value),
    'set-travel-icon-size': el => window.lsbSetIconSize(el.value),
    'preview-travel-icon-url': () => window.KartoLsbModals.previewIconUrl(),
    'preview-travel-opacity': () => window.KartoLsbModals.previewGroupOpacity(),
    'set-travel-group-mode': el => window.lsbSetTM(el.dataset.groupId, el.value),
    'save-dm-notes': () => window.dmSaveNotes(),
    'render-marker-catalog': () => window.mcatRender(),
    'render-category-marker-grid': () => window.renderCatMarkerGrid(document.getElementById('catmkr-search')?.value || ''),
    'render-pin-marker-grid': () => window.renderPinMarkerGrid(document.getElementById('pinmkr-search')?.value || ''),
    'apply-pin-template-preset': el => {
      window.sbApplyPreset(el.value);
      el.value = '';
    },
    'set-temp-category-color': el => window.setTempCategoryColor(Number(el.dataset.categoryIndex), el.value, el),
    'set-temp-category-label': el => window.setTempCategoryLabel(Number(el.dataset.categoryIndex), el.value),
  };

  const blurActions = {
    'save-title-edit': () => window.saveTitleEdit(),
    'hide-search-results': () => setTimeout(window.hideSearch, 180),
    'rename-travel-group': el => window.lsbRenGrp(el.dataset.groupId, el.value),
  };

  const keydownActions = {
    'title-edit': (el, event) => {
      if(event.key === 'Enter') el.blur();
      if(event.key === 'Escape') window.cancelTitleEdit();
    },
    'travel-group-name': (el, event) => {
      if(event.key === 'Enter') el.blur();
    },
    'save-travel-group-name': (el, event) => {
      if(event.key === 'Enter') window.KartoLsbModals.saveGroup();
    },
    'check-password': (el, event) => {
      if(event.key === 'Enter') window.checkPw();
    },
  };

  document.addEventListener('click', event => {
    const el = event.target.closest('[data-action]');
    if(!el) return;
    const action = actions[el.dataset.action];
    if(!action) return;
    event.preventDefault();
    action(el, event);
  });

  document.addEventListener('input', event => {
    const el = event.target.closest('[data-input-action]');
    if(!el) return;
    const action = inputActions[el.dataset.inputAction];
    if(action) action(el, event);
  });

  document.addEventListener('change', event => {
    const el = event.target.closest('[data-input-action]');
    if(el){
      const action = inputActions[el.dataset.inputAction];
      if(action) action(el, event);
    }
    const fileEl = event.target.closest('[data-file-action]');
    if(!fileEl) return;
    const file = fileEl.files?.[0];
    if(!file) return;
    switch(fileEl.dataset.fileAction){
      case 'data-manager-import': window.dmgrHandleFile(file); break;
      case 'legacy-import': window.importHandleFile(file); break;
      case 'load-travel-icon-file': window.KartoLsbModals.loadIconFile(fileEl); break;
    }
  });

  document.addEventListener('dragover', event => {
    const el = event.target.closest('[data-drop-action]');
    if(!el) return;
    event.preventDefault();
    el.style.background = 'rgba(180,140,50,.1)';
  });

  document.addEventListener('dragleave', event => {
    const el = event.target.closest('[data-drop-action]');
    if(!el) return;
    el.style.background = '';
  });

  document.addEventListener('drop', event => {
    const el = event.target.closest('[data-drop-action]');
    if(!el) return;
    event.preventDefault();
    switch(el.dataset.dropAction){
      case 'data-manager-import': window.dmgrHandleDrop(event); break;
      case 'legacy-import': window.importHandleDrop(event); break;
    }
  });

  document.addEventListener('blur', event => {
    const el = event.target.closest('[data-blur-action]');
    if(!el) return;
    const action = blurActions[el.dataset.blurAction];
    if(action) action(el, event);
  }, true);

  document.addEventListener('keydown', event => {
    const el = event.target.closest('[data-keydown-action]');
    if(!el) return;
    const action = keydownActions[el.dataset.keydownAction];
    if(action) action(el, event);
  });
})();
