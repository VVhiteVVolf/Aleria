(function () {
  "use strict";

  const connections = new WeakMap();

  function render(options = {}) {
    const container = options.container;
    const config = options.config;
    if (!container || !config?.mapId || !config?.embedHref) return null;

    destroy(container);
    const controller = new AbortController();
    connections.set(container, controller);

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
    const targetOrigin = new URL(config.embedHref, window.location.href).origin;
    const post = (type, extra = {}) => frame.contentWindow?.postMessage(
      { type, mapId: String(config.mapId), ...extra }, targetOrigin === "null" ? "*" : targetOrigin
    );
    const search = window.AleriaPlacePoiSearch?.create({
      ...options.search,
      onSelect: poi => {
        post("aleria:map-poi-open", { id: String(poi.id) });
        frame.scrollIntoView({ block: "center", behavior: "smooth" });
      },
    });
    search?.setItems(config.pois);
    frame.addEventListener("load", () => {
      post("aleria:map-pois-request");
      options.onLoad?.();
    }, { signal: controller.signal });
    window.addEventListener("message", event => {
      if (event.origin !== targetOrigin || event.source !== frame.contentWindow) return;
      if (event.data?.type !== "aleria:map-pois" || event.data.mapId !== String(config.mapId)) return;
      search?.setItems(event.data.pois);
    }, { signal: controller.signal });
    frame.src = String(config.embedHref);

    const actions = document.createElement("div");
    actions.className = `orte-map-actions orte-${variant}-map-actions`;
    const link = document.createElement("a");
    link.href = String(config.fullHref || config.embedHref);
    link.textContent = String(options.linkText || `${title} vollständig öffnen`);
    actions.append(link);

    shell.append(frame, actions);
    if (search) shell.append(search.element);
    container.replaceChildren(shell);
    return { frame, link, shell };
  }

  function destroy(container) {
    connections.get(container)?.abort();
    connections.delete(container);
  }

  function normalizeVariant(value) {
    const variant = String(value || "generic").toLowerCase().replace(/[^a-z0-9-]/g, "");
    return variant || "generic";
  }

  window.AleriaPlaceMapEmbed = Object.freeze({ render, destroy });
})();
