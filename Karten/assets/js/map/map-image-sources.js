(function () {
  "use strict";

  const KARTEN_ROOT = "/Karten/";
  const WINDOWS_PATH = /^[a-z]:[\\/]/i;
  const PUBLIC_PROTOCOL = /^(?:data:|blob:|https?:|\/\/)/i;

  function clean(source) {
    return String(source || "").trim();
  }

  function toPublicUrl(source, baseUrl) {
    const value = clean(source);
    if (!value || WINDOWS_PATH.test(value) || /^file:/i.test(value)) return "";
    if (PUBLIC_PROTOCOL.test(value) || value.startsWith("/")) return value;

    const normalized = value.replace(/\\/g, "/");
    if (normalized.startsWith("Karten/")) return `/${normalized}`;
    if (normalized.startsWith("Cenyr/") || normalized.startsWith("assets/")) {
      return `${KARTEN_ROOT}${normalized}`;
    }

    try {
      return new URL(normalized, baseUrl || document.baseURI).href;
    } catch {
      return "";
    }
  }

  function select(savedSource, configuredSource, baseUrl) {
    return toPublicUrl(savedSource, baseUrl) || toPublicUrl(configuredSource, baseUrl);
  }

  function configured(layer, baseUrl) {
    return toPublicUrl(window.KARTO_CONFIG?.images?.[layer], baseUrl);
  }

  function equivalent(first, second, baseUrl) {
    const left = toPublicUrl(first, baseUrl);
    const right = toPublicUrl(second, baseUrl);
    if (!left || !right) return false;
    try {
      return new URL(left, baseUrl || document.baseURI).href === new URL(right, baseUrl || document.baseURI).href;
    } catch {
      return left === right;
    }
  }

  window.KartoMapImageSources = Object.freeze({
    toPublicUrl,
    select,
    configured,
    equivalent,
  });
})();
