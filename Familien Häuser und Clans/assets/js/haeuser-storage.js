(function () {
  const entry = window.HAEUSER_CONFIG?.registryEntry || {};
  const pageId = window.AleriaOrteScenes?.ortId || window.HAEUSER_CONFIG?.docId || 'haeuser-vorlage';
  const loaderUrl = document.querySelector('script[src*="haeuser-loader.js"]')?.src || document.baseURI;
  window.OrteInlineFirebase = window.AleriaInlineGitHubStore.create({
    scope: 'haeuser', pageId, contentPath: entry.contentData || '', contentExportPath: entry.contentExport || '',
    legacyFirebase: window.AleriaOrteScenes?.inlineFirebase || null, draftNamespace: 'haeuser',
    resolvePath: path => new URL(`../../${path}`, loaderUrl).toString(),
  });
  window.dispatchEvent(new Event('orte-inline-firebase-ready'));
})();
