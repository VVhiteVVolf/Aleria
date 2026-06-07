(function(){
  const actions = {
    'edit-region-icon': () => window.onIconClick(),
    'edit-title': () => window.onTitleClick(),
    'set-layer': el => window.setLayer(el.dataset.layer || 'normal'),
    'clear-search': () => window.clearSearch(),
    'toggle-edit': () => window.toggleEdit(),
    'start-add-zettel': () => window.startAddZettel(),
    'start-add-ort': () => window.startAddOrt(),
    'open-stamp-picker': () => window.openStampPicker(),
    'open-overwrite-picker': () => window.openOverwritePicker(),
    'open-board-images': () => window.openBoardImagesModal(),
    'save-board-images': () => window.saveBoardImages(),
    'clear-board-images': () => window.clearBoardImages(),
    'open-data-manager': () => window.openDataMgr(),
    'open-category-manager': () => window.openCatMgr(),
    'open-marker-catalog': () => window.openMarkerCatalog(),
    'open-backup-history': () => window.openBackupMo(),
    'toggle-tools-sidebar': () => window.toggleLsb(),
    'start-calibration': () => window.lsbStartCal(),
    'reset-calibration': () => window.lsbResetCal(),
    'start-measure': () => window.lsbStartMeasure(),
    'clear-measure': () => window.lsbClearMeasure(),
    'open-travel-group-modal': () => window.openLGrpModal(),
    'close-modal': el => window.TafelRuntime.closeModal(el.dataset.modalId),
    'delete-dm-session': () => window.dmDelSession(),
    'save-dm-session': () => window.dmSaveSession(),
    'save-dm-status': () => window.dmSaveStatus(),
    'export-dm-diary': () => window.dmExportDiary(),
    'switch-overwrite-tab': el => window.owSwitchTab(el.dataset.tab),
    'travel-icon-tab': el => window.lsbIconTab(el.dataset.tab),
    'add-travel-custom-icon': () => window.lsbAddCustomSlot(),
    'save-travel-group': () => window.saveLGrp(),
    'delete-travel-waypoint-event': () => window.deleteLWpEvt(),
    'save-travel-waypoint-event': () => window.saveLWpEvt(),
    'toggle-category-bar': () => window.toggleCatBar(),
    'cancel-pin-template': () => {
      window.TafelRuntime.closeModal('pin-tpl-mo');
      window.cancelAdd();
    },
    'apply-pin-template': () => window.tplApply(),
    'apply-zettel-template': () => window.zettelTplApply(),
    'close-sidebar': () => window.closeSidebar(),
    'export-data-manager': () => window.dmgrExport(),
    'select-data-manager-section': el => window.dmgrSelectAll(el.dataset.selectionPrefix, el.dataset.selectionValue === 'true'),
    'open-data-manager-file': () => document.getElementById('dmgr-file')?.click(),
    'apply-data-manager-import': () => window.dmgrImportApply(),
    'open-legacy-import-file': () => document.getElementById('import-file')?.click(),
    'apply-legacy-import': () => window.importApply(),
    'save-backup-now': () => window.backupSaveNow(),
    'add-marker-catalog-item': () => window.mcatAdd(),
    'open-marker-catalog-bulk': () => window.mcatBulkOpen(),
    'apply-marker-catalog-bulk': () => window.mcatBulkApply(),
    'close-scroll': () => window.closeScroll(),
    'close-category-manager': () => window.closeCatMgr(),
    'save-categories': () => window.saveCats(),
    'clear-category-marker': () => window.catClearMarker(),
    'close-region-icon-modal': () => window.closeIconModal(),
    'preview-region-icon-url': () => window.previewIconUrl(),
    'clear-region-icon': () => window.clearIcon(),
    'save-region-icon': () => window.saveIcon(),
    'close-password-modal': () => window.closePw(),
    'check-password': () => window.checkPw(),
    'delete-marker-catalog-item': (el, event) => {
      event.stopPropagation();
      window.mcatDelete(el.dataset.markerId);
    },
    'backup-download': el => window.backupDownload(Number(el.dataset.backupIndex)),
    'backup-restore': el => window.backupRestore(Number(el.dataset.backupIndex)),
    'set-category-filter': el => window.setFilter(el.dataset.categoryId),
    'pick-temp-category-marker': el => window.catPickMarker(Number(el.dataset.catIndex)),
    'remove-temp-category': el => window.removeTempCat(Number(el.dataset.catIndex)),
    'add-temp-category': () => window.addTempCat(),
    'pick-category-marker': el => window.catSetMarker(el.dataset.markerUrl),
    'start-stamp': el => window.startStamp(el.dataset.pinId),
    'start-overwrite-template': el => window.startOverwriteFromTemplate(el.dataset.templateId),
    'start-overwrite-pin': el => window.startOverwriteFromPin(el.dataset.pinId),
    'select-pin-template': el => window.selectTpl(el.dataset.templateId),
    'select-zettel-type': el => window.selectZettelType(el.dataset.zettelType),
    'jump-to-result': el => window.jumpTo(el.dataset.entryId),
    'zettel-table-delete': el => window.zettelTableDel(Number(el.dataset.rowIndex)),
    'zettel-table-add': () => window.zettelTableAdd(),
    'zettel-star-add': () => window.zettelStarAdd(),
    'zettel-star-set': el => window.zettelStarSet(Number(el.dataset.rowIndex), Number(el.dataset.value)),
    'zettel-article-add': () => window.zettelArtikelAdd(),
    'zettel-article-remove': el => window.zettelArtikelRemove(Number(el.dataset.articleIndex)),
    'zettel-save-close': () => window.zettelSaveAndClose(),
    'zettel-delete': el => window.zettelDelete(el.dataset.zettelId),
    'zettel-open-edit': el => {
      window.closeScroll();
      window.openZettelSidebar(el.dataset.zettelId, 'edit');
    },
    'zettel-set-page': el => window.TafelZettelViews.setSteckbriefPage(el.dataset.zettelId, Number(el.dataset.page)),
    'person-add': () => window.sbPersonAdd(),
    'person-remove': el => window.sbPersonRemove(Number(el.dataset.personIndex)),
    'person-table-add': el => window.sbPersonTableAdd(Number(el.dataset.personIndex)),
    'person-table-template': el => window.sbPersonTableTemplate(Number(el.dataset.personIndex)),
    'person-table-delete': el => window.sbPersonTableDel(Number(el.dataset.personIndex), Number(el.dataset.rowIndex)),
    'person-star-set': el => window.sbStarSet(Number(el.dataset.personIndex), Number(el.dataset.rowIndex), Number(el.dataset.value)),
    'pin-delete': el => window.askDel(el.dataset.pinId),
    'pin-start-stamp': el => {
      window.closeScroll();
      window.startStamp(el.dataset.pinId);
    },
    'pin-open-edit': el => {
      window.closeScroll();
      window.openSidebar(el.dataset.pinId, 'edit');
    },
    'pin-table-delete': el => window.sbDelRow(Number(el.dataset.rowIndex)),
    'open-pin-marker-picker': el => window.sbOpenPinMarkerPicker(el.dataset.pinId),
    'clear-pin-marker': el => window.sbClearPinMarker(el.dataset.pinId),
    'preview-pin-image': () => window.sbPrevImg(),
    'preview-pin-crest': () => window.sbPrevCrest(),
    'preview-pin-banner': () => window.sbPrevBanner(),
    'clear-pin-table': () => window.sbClearTable(),
    'add-pin-table-row': () => window.sbAddRow(),
    'format-pin-text': el => window.fmt(el.dataset.before || '', el.dataset.after || ''),
    'save-pin': el => window.sbSave(el.dataset.pinId),
    'set-pin-marker': el => window.sbSetPinMarker(el.dataset.markerUrl),
    'delete-travel-custom-slot': (el, event) => {
      event.stopPropagation();
      window.lsbDelCustomSlot(Number(el.dataset.slotIndex));
    },
    'pick-travel-emoji': el => window.lsbPickEmoji(el.dataset.icon, el),
    'pick-travel-color': el => window.lsbPickColor(el.dataset.color, el),
    'pick-travel-waypoint-event': el => window.lsbPickEvt(el, el.dataset.eventType),
    'edit-travel-group': (el, event) => {
      event.stopPropagation();
      window.openLGrpModal(el.dataset.groupId);
    },
    'delete-travel-group': (el, event) => {
      event.stopPropagation();
      window.lsbDelGrp(el.dataset.groupId);
    },
    'place-travel-group': el => window.lsbDoPlace(el.dataset.groupId),
    'start-travel-route': el => window.lsbStartRoute(el.dataset.groupId),
    'continue-travel-route': el => window.lsbContRoute(el.dataset.groupId),
    'clear-travel-route': el => window.lsbClrRoute(el.dataset.groupId),
    'delete-travel-waypoint': (el, event) => {
      event.stopPropagation();
      window.lsbDelWp(el.dataset.groupId, Number(el.dataset.pointIndex));
    },
  };

  const inputActions = {
    'search-pins': el => window.onSearch(el.value),
    'set-dot-size': el => window.onDotSl(el.value),
    'set-label-size': el => window.onLblSl(el.value),
    'set-travel-icon-size': el => window.lsbSetIconSize(el.value),
    'render-stamp-list': el => window.renderStampList(el.value),
    'render-overwrite-pin-list': el => window.renderOverwritePinList(el.value),
    'preview-travel-icon-url': () => window.lsbPreviewIconUrl(),
    'preview-travel-opacity': () => window.lsbPreviewOpacity(),
    'render-pin-marker-grid': () => window.renderPinMarkerGrid(document.getElementById('pinmkr-search')?.value || ''),
    'render-marker-catalog': () => window.mcatRender(),
    'render-category-marker-grid': () => window.renderCatMarkerGrid(document.getElementById('catmkr-search')?.value || ''),
    'update-temp-category-color': el => window.updateTempCatColor(Number(el.dataset.catIndex), el.value, el.closest('.cat-color-pick')),
    'update-temp-category-label': el => window.updateTempCatLabel(Number(el.dataset.catIndex), el.value),
    'zettel-field': el => window.zettelField(el.dataset.field, el.type === 'checkbox' ? el.checked : el.value),
    'zettel-table-key': el => window.zettelTableK(Number(el.dataset.rowIndex), el.value),
    'zettel-table-value': el => window.zettelTableV(Number(el.dataset.rowIndex), el.value),
    'zettel-article-field': el => window.zettelArtikel(Number(el.dataset.articleIndex), el.dataset.field, el.value),
    'zettel-card-width': el => window.setZettelCardWidth(el.dataset.zettelId, el.value),
    'person-field': el => window.sbPersonField(Number(el.dataset.personIndex), el.dataset.field, el.value),
    'person-table-key': el => window.sbPersonTableK(Number(el.dataset.personIndex), Number(el.dataset.rowIndex), el.value),
    'person-table-value': el => window.sbPersonTableV(Number(el.dataset.personIndex), Number(el.dataset.rowIndex), el.value),
    'pin-card-width': el => window.setPinCardWidth(el.dataset.pinId, el.value),
    'apply-pin-preset': el => {
      window.sbApplyPreset(el.value);
      el.value = '';
    },
    'set-travel-mode': el => window.lsbSetTM(el.dataset.groupId, el.value),
  };

  const keydownActions = {
    'title-edit': (el, event) => {
      if(event.key === 'Enter') el.blur();
      if(event.key === 'Escape') window.cancelTitleEdit();
    },
    'save-travel-group-name': (el, event) => {
      if(event.key === 'Enter') window.saveLGrp();
    },
    'check-password': (el, event) => {
      if(event.key === 'Enter') window.checkPw();
    },
    'blur-on-enter': (el, event) => {
      if(event.key === 'Enter') el.blur();
    },
  };

  const blurActions = {
    'save-title-edit': () => window.saveTitleEdit(),
    'hide-search-results': () => setTimeout(window.hideSearch, 180),
    'rename-travel-group': el => window.lsbRenGrp(el.dataset.groupId, el.value),
  };

  const fileActions = {
    'data-manager-import': el => window.dmgrHandleFile(el.files?.[0]),
    'legacy-import': el => window.importHandleFile(el.files?.[0]),
    'load-travel-icon-file': el => window.lsbLoadIconFile(el),
  };

  const dropActions = {
    'data-manager-import': (el, event) => window.dmgrHandleDrop(event),
    'legacy-import': (el, event) => window.importHandleDrop(event),
  };

  const mouseActions = {
    'zettel-star-hover': el => window.zettelStarHover(Number(el.dataset.rowIndex), Number(el.dataset.value)),
    'zettel-star-out': el => window.zettelStarOut(Number(el.dataset.rowIndex)),
    'person-star-hover': el => window.sbStarHover(Number(el.dataset.personIndex), Number(el.dataset.rowIndex), Number(el.dataset.value)),
    'person-star-out': el => window.sbStarOut(Number(el.dataset.personIndex), Number(el.dataset.rowIndex)),
  };

  document.addEventListener('click', event => {
    const el = event.target.closest('[data-action]');
    if(!el) return;
    const action = actions[el.dataset.action];
    if(!action) return;
    event.preventDefault();
    action(el, event);
  });

  document.addEventListener('mousedown', event => {
    const el = event.target.closest('[data-mousedown-action]');
    if(!el) return;
    const action = actions[el.dataset.mousedownAction];
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
    const inputEl = event.target.closest('[data-input-action]');
    if(inputEl) {
      const inputAction = inputActions[inputEl.dataset.inputAction];
      if(inputAction) inputAction(inputEl, event);
    }

    const fileEl = event.target.closest('[data-file-action]');
    if(!fileEl) return;
    const fileAction = fileActions[fileEl.dataset.fileAction];
    if(fileAction) fileAction(fileEl, event);
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

  document.addEventListener('mouseover', event => {
    const el = event.target.closest('[data-mouseover-action]');
    if(!el) return;
    const action = mouseActions[el.dataset.mouseoverAction];
    if(action) action(el, event);
  });

  document.addEventListener('mouseout', event => {
    const el = event.target.closest('[data-mouseout-action]');
    if(!el) return;
    const action = mouseActions[el.dataset.mouseoutAction];
    if(action) action(el, event);
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
    const action = dropActions[el.dataset.dropAction];
    if(!action) return;
    event.preventDefault();
    el.style.background = '';
    action(el, event);
  });
})();
