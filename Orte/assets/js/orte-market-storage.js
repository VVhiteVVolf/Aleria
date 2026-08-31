(function () {
  const config = window.AleriaOrteScenes || {};
  const entry = window.ORTE_CONFIG?.registryEntry || {};
  const pageId = config.ortId || window.ORTE_CONFIG?.docId || 'zunfts-vorlage';
  const loaderUrl = document.querySelector('script[src*="orte-loader.js"]')?.src || document.baseURI;
  window.OrteMarketFirebase = window.AleriaInlineGitHubStore.create({
    scope: 'orte', pageId: `${pageId}-market`, legacyPageId: pageId, contentPath: entry.marketData || '', draftNamespace: 'orte-market',
    resetPayload: { schemaVersion: 1, savedAtClient: 0, modules: [] },
    legacyFirebase: { collection: config.inlineFirebase?.marketCollection || 'orte_market_modules', config: config.inlineFirebase?.config },
    resolvePath: path => new URL(`../../${path}`, loaderUrl).toString(),
  });
  window.dispatchEvent(new Event('orte-market-firebase-ready'));
})();
