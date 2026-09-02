(function () {
  'use strict';

  const editor = () => window.TafelEditor;
  const actions = {
    'edit-region-icon': () => editor().openIcon(),
    'edit-title': () => editor().editTitle(),
    'toggle-edit': () => editor().toggleEdit(),
    'fit-board': () => window.TafelBoard.fit(),
    'start-add-zettel': () => editor().startAddZettel(),
    'open-board-images': () => editor().openBoardImages(),
    'save-board-images': () => editor().saveBoardImages(),
    'clear-board-images': () => editor().clearBoardImages(),
    'open-data-manager': () => window.TafelDataManager.open(),
    'export-board-data': () => window.TafelDataManager.exportData(),
    'open-tafel-publish': () => window.TafelPublishUi.open(),
    'tafel-publish-login': () => window.TafelPublishUi.login(),
    'tafel-publish-online': () => window.TafelPublishUi.publish(),
    'open-backup-history': () => editor().openBackups(),
    'save-backup-now': () => editor().saveBackupNow(),
    'restore-backup': element => editor().restoreBackup(element.dataset.backupId),
    'close-modal': element => window.TafelRuntime.closeModal(element.dataset.modalId),
    'close-password': () => editor().closePassword(),
    'check-password': () => editor().checkPassword(),
    'clear-region-icon': () => editor().clearIcon(),
    'save-region-icon': () => editor().saveIcon(),
    'select-zettel-type': element => editor().selectType(element.dataset.zettelType),
    'apply-zettel-template': () => editor().applyTemplate(),
    'cancel-zettel-placement': () => editor().cancelPlacement(),
    'clear-search': () => editor().clearSearch(),
    'jump-to-notice': element => editor().jumpToNotice(element.dataset.noticeId),
    'close-sidebar': () => editor().closeSidebar(),
    'close-scroll': () => editor().closeScroll(),
    'zettel-open-edit': element => {
      editor().closeScroll();
      window.openZettelSidebar(element.dataset.zettelId, 'edit');
    },
    'zettel-table-delete': element => window.zettelTableDel(Number(element.dataset.rowIndex)),
    'zettel-table-add': () => window.zettelTableAdd(),
    'zettel-star-add': () => window.zettelStarAdd(),
    'zettel-star-set': element => window.zettelStarSet(Number(element.dataset.rowIndex), Number(element.dataset.value)),
    'zettel-rich-format': element => window.zettelRichFormat(element.dataset.richTarget, element.dataset.richFormat, element.dataset.richValue || ''),
    'zettel-article-add': () => window.zettelArtikelAdd(),
    'zettel-article-remove': element => window.zettelArtikelRemove(Number(element.dataset.articleIndex)),
    'zettel-save-close': () => window.zettelSaveAndClose(),
    'zettel-delete': element => window.zettelDelete(element.dataset.zettelId),
    'zettel-set-page': element => window.TafelZettelViews.setSteckbriefPage(element.dataset.zettelId, Number(element.dataset.page)),
    'zettel-comment-add': element => window.TafelZettelComments.add(element.dataset.zettelId),
    'zettel-comment-delete': element => window.TafelZettelComments.remove(element.dataset.zettelId, element.dataset.commentId),
    'person-add': () => window.sbPersonAdd(),
    'person-remove': element => window.sbPersonRemove(Number(element.dataset.personIndex)),
    'person-table-add': element => window.sbPersonTableAdd(Number(element.dataset.personIndex)),
    'person-table-template': element => window.sbPersonTableTemplate(Number(element.dataset.personIndex)),
    'person-table-delete': element => window.sbPersonTableDel(Number(element.dataset.personIndex), Number(element.dataset.rowIndex)),
    'person-star-set': element => window.sbStarSet(Number(element.dataset.personIndex), Number(element.dataset.rowIndex), Number(element.dataset.value)),
  };

  const inputActions = {
    'search-notices': element => editor().search(element.value),
    'preview-region-icon': () => editor().previewIcon(),
    'preview-board-image': () => editor().previewBoardImage(),
    'zettel-field': element => window.zettelField(element.dataset.field, element.type === 'checkbox' ? element.checked : element.value),
    'zettel-rich-field': element => window.zettelRichField(element.dataset.field, element.innerHTML),
    'zettel-table-key': element => window.zettelTableK(Number(element.dataset.rowIndex), element.value),
    'zettel-table-value': element => window.zettelTableV(Number(element.dataset.rowIndex), element.value),
    'zettel-article-field': element => window.zettelArtikel(Number(element.dataset.articleIndex), element.dataset.field, element.value),
    'zettel-article-rich-field': element => window.zettelArtikelRich(Number(element.dataset.articleIndex), element.dataset.field, element.innerHTML),
    'zettel-card-width': element => editor().setZettelCardWidth(element.dataset.zettelId, element.value),
    'person-field': element => window.sbPersonField(Number(element.dataset.personIndex), element.dataset.field, element.value),
    'person-rich-field': element => window.sbPersonRichField(Number(element.dataset.personIndex), element.dataset.field, element.innerHTML),
    'person-table-key': element => window.sbPersonTableK(Number(element.dataset.personIndex), Number(element.dataset.rowIndex), element.value),
    'person-table-value': element => window.sbPersonTableV(Number(element.dataset.personIndex), Number(element.dataset.rowIndex), element.value),
  };

  const keydownActions = {
    'title-edit': (element, event) => {
      if (event.key === 'Enter') element.blur();
      if (event.key === 'Escape') editor().cancelTitle();
    },
    'check-password': (element, event) => {
      if (event.key === 'Enter') editor().checkPassword();
    },
    'tafel-publish-login': (element, event) => {
      if (event.key === 'Enter') window.TafelPublishUi.login();
    },
  };

  const blurActions = {
    'save-title-edit': () => editor().saveTitle(),
  };

  const fileActions = {
    'import-board-data': element => window.TafelDataManager.importData(element.files?.[0]),
  };

  const mouseActions = {
    'zettel-star-hover': element => window.zettelStarHover(Number(element.dataset.rowIndex), Number(element.dataset.value)),
    'zettel-star-out': element => window.zettelStarOut(Number(element.dataset.rowIndex)),
    'person-star-hover': element => window.sbStarHover(Number(element.dataset.personIndex), Number(element.dataset.rowIndex), Number(element.dataset.value)),
    'person-star-out': element => window.sbStarOut(Number(element.dataset.personIndex), Number(element.dataset.rowIndex)),
  };

  function dispatch(selector, handlers, event) {
    const element = event.target.closest(selector);
    if (!element) return;
    const key = selector.includes('mousedown') ? element.dataset.mousedownAction : element.dataset.action;
    const handler = handlers[key];
    if (!handler) return;
    event.preventDefault();
    handler(element, event);
  }

  document.addEventListener('click', event => dispatch('[data-action]', actions, event));
  document.addEventListener('mousedown', event => dispatch('[data-mousedown-action]', actions, event));
  document.addEventListener('input', event => {
    const element = event.target.closest('[data-input-action]');
    inputActions[element?.dataset.inputAction]?.(element, event);
  });
  document.addEventListener('change', event => {
    const inputElement = event.target.closest('[data-input-action]');
    inputActions[inputElement?.dataset.inputAction]?.(inputElement, event);
    const fileElement = event.target.closest('[data-file-action]');
    fileActions[fileElement?.dataset.fileAction]?.(fileElement, event);
  });
  document.addEventListener('blur', event => {
    const element = event.target.closest('[data-blur-action]');
    blurActions[element?.dataset.blurAction]?.(element, event);
  }, true);
  document.addEventListener('keydown', event => {
    const element = event.target.closest('[data-keydown-action]');
    keydownActions[element?.dataset.keydownAction]?.(element, event);
  });
  document.addEventListener('mouseover', event => {
    const element = event.target.closest('[data-mouseover-action]');
    mouseActions[element?.dataset.mouseoverAction]?.(element, event);
  });
  document.addEventListener('mouseout', event => {
    const element = event.target.closest('[data-mouseout-action]');
    mouseActions[element?.dataset.mouseoutAction]?.(element, event);
  });
  document.addEventListener('error', event => {
    const image = event.target.closest?.('[data-image-fallback]');
    if (image) window.TafelZettelViews.handleImageError(image);
  }, true);
})();
