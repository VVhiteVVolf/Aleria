// Maps whose visible locations are editor symbols migrate the old hidden
// default once. Later deliberate visibility choices survive subsequent loads.
(function (root) {
  const version = 1;
  function resolve(state = {}, config = {}) {
    const presentation = config.markerPresentation || state.markerPresentation || 'embedded';
    if (presentation !== 'symbols') return { showMarkers: state.showMarkers === true };
    return {
      markerPresentation: 'symbols', pinVisibilityVersion: version,
      showMarkers: state.pinVisibilityVersion === version ? state.showMarkers === true : true,
    };
  }
  root.KartoPinPresentation = Object.freeze({ resolve });
})(typeof window !== 'undefined' ? window : globalThis);
