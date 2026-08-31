(function () {
  const entry = window.KONTINENTE_CONFIG?.registryEntry || {};
  const pageId = window.AleriaOrteScenes?.ortId || window.KONTINENTE_CONFIG?.docId || 'kontinente-startseite';
  const loaderUrl = document.querySelector('script[src*="kontinente-loader.js"]')?.src || document.baseURI;
  window.OrteInlineFirebase = window.AleriaInlineGitHubStore.create({
    scope: 'kontinente', pageId, contentPath: entry.contentData || '', contentExportPath: entry.contentExport || '',
    legacyFirebase: window.AleriaOrteScenes?.inlineFirebase || null, draftNamespace: 'kontinente',
    resolvePath: path => new URL(`../../${path}`, loaderUrl).toString(),
  });
  window.dispatchEvent(new Event('orte-inline-firebase-ready'));
})();
