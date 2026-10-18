// One shared display baseline for published maps, older drafts and new maps.
(function (root) {
  const version = 1;
  const defaults = Object.freeze({ dotSize: 80, lblSize: 50, displaySettingsVersion: version });
  function resolve(state = {}) {
    // Migrate the previous map-specific sizes once. Later slider choices survive.
    if (state.displaySettingsVersion !== version) return { ...defaults };
    const size = (value, fallback, min, max) => Number.isFinite(value) && value >= min && value <= max ? value : fallback;
    return {
      dotSize: size(state.dotSize, defaults.dotSize, 8, 240),
      lblSize: size(state.lblSize, defaults.lblSize, 9, 160),
      displaySettingsVersion: version,
    };
  }
  root.KartoDisplaySettings = Object.freeze({ defaults, resolve });
})(typeof window !== 'undefined' ? window : globalThis);
