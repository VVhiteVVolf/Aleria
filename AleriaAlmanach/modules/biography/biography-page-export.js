// Reader adapter: isolate only the selected biography, using the shared file contract.
async function exportCurrentModuleBiography() {
  if (!currentEntry || isInlineEditingEntry(currentEntry)) return;
  try {
    const entry = getRenderableEntry(currentEntry);
    const pageIndex = currentPage;
    const page = getPages(entry)[pageIndex];
    const { buildBiographyPageExportPayload } = await import('../../../js/biography/biography-transfer.mjs');
    const payload = buildBiographyPageExportPayload(page, entry, {
      baseUrl: document.baseURI,
      pageIndex
    });
    payload.biographyModule.biography = sanitizeBiographyData(payload.biographyModule.biography);
    downloadJsonFile(payload, `${slugify(payload.personName)}-biographie.json`);
    showAppStatus('Biographie exportiert. In der Stammbaum-Biografie oder im Charakterprofil unter „Biographie importieren“ laden.', 'success');
  } catch (error) {
    showAppStatus(error.message || 'Biographie konnte nicht exportiert werden.', 'error');
  }
}
