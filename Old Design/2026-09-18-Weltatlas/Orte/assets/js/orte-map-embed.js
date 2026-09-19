(function () {
  "use strict";

  function render(options = {}) {
    const container = options.container;
    const config = options.config;
    if (!container || !config?.mapId || !config?.embedHref) return null;

    const variant = normalizeVariant(options.variant);
    const title = String(config.title || options.defaultTitle || "Karte");
    const shell = document.createElement("div");
    shell.className = `orte-map-embed orte-${variant}-map-embed`;

    const frame = document.createElement("iframe");
    frame.className = `orte-map-iframe orte-${variant}-map-iframe`;
    frame.title = `${options.frameTitlePrefix || "Karte"} ${title}`.trim();
    frame.loading = "lazy";
    frame.referrerPolicy = "same-origin";
    frame.allowFullscreen = true;
    frame.dataset.mapId = String(config.mapId);
    if (typeof options.onLoad === "function") {
      frame.addEventListener("load", options.onLoad);
    }
    frame.src = String(config.embedHref);

    const actions = document.createElement("div");
    actions.className = `orte-map-actions orte-${variant}-map-actions`;
    const link = document.createElement("a");
    link.href = String(config.fullHref || config.embedHref);
    link.textContent = String(options.linkText || `${title} vollständig öffnen`);
    actions.append(link);

    shell.append(frame, actions);
    container.replaceChildren(shell);
    return { frame, link, shell };
  }

  function normalizeVariant(value) {
    const variant = String(value || "generic").toLowerCase().replace(/[^a-z0-9-]/g, "");
    return variant || "generic";
  }

  window.AleriaPlaceMapEmbed = Object.freeze({ render });
})();
