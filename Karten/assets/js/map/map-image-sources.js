(function () {
  "use strict";

  const KARTEN_ROOT = "/Karten/";
  const WINDOWS_PATH = /^[a-z]:[\\/]/i;
  const PUBLIC_PROTOCOL = /^(?:data:|https?:|\/\/)/i;
  const RECOVERY_TOKEN = "20260901b";

  function clean(source) {
    return String(source || "").trim();
  }

  function toPublicUrl(source, baseUrl) {
    const value = clean(source);
    if (!value || WINDOWS_PATH.test(value) || /^(?:file:|blob:)/i.test(value)) return "";
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

  function recoveryUrl(source, baseUrl) {
    const value = toPublicUrl(source, baseUrl);
    if (!value || /^(?:data:|blob:)/i.test(value)) return value;
    try {
      const url = new URL(value, baseUrl || document.baseURI);
      url.searchParams.set("aleria-map-recovery", RECOVERY_TOKEN);
      return url.href;
    } catch {
      return value;
    }
  }

  function availability(savedImages, configuredImages, baseUrl) {
    const saved = savedImages || {};
    const configuredImagesSafe = configuredImages || {};
    return Object.freeze({
      normal: Boolean(select(saved.normal, configuredImagesSafe.normal, baseUrl)),
      regions: Boolean(select(saved.regions, configuredImagesSafe.regions, baseUrl)),
      pins: Boolean(select(saved.pins, configuredImagesSafe.pins, baseUrl)),
    });
  }

  window.KartoMapImageSources = Object.freeze({
    toPublicUrl,
    select,
    configured,
    equivalent,
    recoveryUrl,
    availability,
  });
})();
