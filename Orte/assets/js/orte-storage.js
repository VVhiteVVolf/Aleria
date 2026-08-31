(function () {
  const entry = window.ORTE_CONFIG?.registryEntry || {};
  const pageId = window.AleriaOrteScenes?.ortId || window.ORTE_CONFIG?.docId || 'grossstadt-vorlage';
  const loaderUrl = document.querySelector('script[src*="orte-loader.js"]')?.src || document.baseURI;
  window.OrteInlineFirebase = window.AleriaInlineGitHubStore.create({
    scope: 'orte', pageId, contentPath: entry.contentData || '', contentExportPath: entry.contentExport || '',
    legacyFirebase: window.AleriaOrteScenes?.inlineFirebase || null, draftNamespace: 'orte',
    resolvePath: path => new URL(`../../${path}`, loaderUrl).toString(),
  });
  window.dispatchEvent(new Event('orte-inline-firebase-ready'));
})();
