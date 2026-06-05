function collectModulePageSharedFields(card, targetType = 'standard') {
  const imageStyle = getFormValue(card, '.me-page-image-style') || 'default';
  const pageCastInput = card.querySelector('.me-page-session-cast');
  const pageCast = parseModuleCastIds(getFormValue(card, '.me-page-session-cast'));
  const pageCastDetails = collectModuleCastDetailsFromField(pageCastInput?.closest('.me-cast-field'), pageCast);
  const shared = {
    pageTitle: getTrimmedFormValue(card, '.me-page-title-input'),
    image: getTrimmedFormValue(card, '.me-page-image-input')
  };

  if (imageStyle === 'square') shared.imageSquare = true;
  if (imageStyle === 'landscape') shared.imageLandscape = true;
  if (imageStyle === 'semi') shared.imageSemiLandscape = true;
  if (imageStyle === 'tall') shared.imageTall = true;
  if (card.querySelector('.me-page-image-width-enabled')?.checked) {
    shared.imageWidth = normalizeModulePageImageWidth(getFormValue(card, '.me-page-image-width'), getModulePageImageWidthMax(targetType));
  }
  const defaultImageFit = getDefaultModulePageImageFitForType(targetType);
  const defaultImagePosition = getDefaultModulePageImagePositionForType(targetType);
  const imageFit = normalizeModulePageImageFit(getFormValue(card, '.me-page-image-fit'), defaultImageFit);
  const imagePosition = normalizeModulePageImagePosition(getFormValue(card, '.me-page-image-position'), defaultImagePosition);
  if (imageFit !== defaultImageFit) shared.imageFit = imageFit;
  if (imagePosition !== defaultImagePosition) shared.imagePosition = imagePosition;
  if (pageCast.length) shared.sessionCast = pageCast;
  if (pageCastDetails.length) shared.sessionCastDetails = pageCastDetails;
  if (card.querySelector('.me-page-comments-enabled')?.checked) shared.enableComments = true;

  return shared;
}

function updateModulePageType(selectEl) {
  const card = selectEl.closest('.module-page-card');
  if (!card) return;
  const cards = getModulePageCards();
  const index = cards.indexOf(card);
  const nextIndex = index >= 0 ? index : Number(card.dataset.pageIndex || 0);
  const type = selectEl.value || 'standard';
  const shared = collectModulePageSharedFields(card, type);
  const templatePage = createInlinePageByType(type, nextIndex);
  const nextPage = sanitizeModulePage({ ...templatePage, ...shared }, shared.pageTitle || templatePage.pageTitle || '') || templatePage;

  card.insertAdjacentHTML('afterend', buildModulePageEditorMarkup(nextPage, nextIndex));
  const nextCard = card.nextElementSibling;
  card.remove();

  hydrateModuleRichEditors(nextCard || document.getElementById('me-pages'));
  refreshAllModuleCastPickers();
  renumberModulePageCards();
  bindModuleEditorDnD();
  setModuleEditorPreviewPage(nextIndex);
  updateModuleEditorDirtyState();
}

function renumberModulePageCards() {
  const cards = Array.from(document.querySelectorAll('#me-pages .module-page-card'));
  clampModuleEditorPreviewIndex(cards.length);
  cards.forEach((card, index) => {
    card.dataset.pageIndex = String(index);
    const title = card.querySelector('.module-page-title');
    const pageTitle = card.querySelector('.me-page-title-input')?.value.trim() || '';
    if (title) title.textContent = pageTitle ? `Seite ${index + 1} - ${pageTitle}` : `Seite ${index + 1}`;
    card.classList.toggle('active', index === _moduleEditorPreviewPageIndex);
  });
}
