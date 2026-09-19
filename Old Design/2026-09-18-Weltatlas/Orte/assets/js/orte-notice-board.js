(function () {
  "use strict";

  const page = document.querySelector("[data-orte-static-template]");
  const container = page?.querySelector("[data-orte-notice-board-map]");
  if (!page || !container) return;

  document.addEventListener("aleria:orte:data-ready", (event) => {
    configureNoticeBoard(event.detail?.data || window.ORT_DATA);
  });

  if (window.ORT_DATA) {
    configureNoticeBoard(window.ORT_DATA);
  }

  function configureNoticeBoard(data) {
    const config = data?.noticeBoardMap;
    if (!config?.mapId || !config?.embedHref) {
      renderPlaceholder(data);
      return;
    }
    const embedUrl = new URL(config.embedHref, window.location.href);
    embedUrl.searchParams.set("ui", "single-board-20260902b");
    const versionedConfig = {
      ...config,
      embedHref: `${embedUrl.pathname}${embedUrl.search}${embedUrl.hash}`,
    };

    window.AleriaPlaceMapEmbed?.render({
      container,
      config: versionedConfig,
      defaultTitle: data.name ? `Anzeigetafel von ${data.name}` : "Anzeigetafel",
      frameTitlePrefix: "Anzeigetafel",
      variant: "notice-board",
    });
  }

  function renderPlaceholder(data) {
    const placeName = String(data?.name || "diesem Ort");
    const placeholder = document.createElement("div");
    placeholder.className = "orte-notice-board-placeholder";
    placeholder.setAttribute("role", "note");

    const icon = document.createElement("span");
    icon.className = "orte-notice-board-placeholder__icon";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = "📜";

    const title = document.createElement("strong");
    title.className = "orte-notice-board-placeholder__title";
    title.textContent = "Anzeigetafel in Vorbereitung";

    const description = document.createElement("span");
    description.className = "orte-notice-board-placeholder__description";
    description.textContent = `Für ${placeName} ist noch keine eigene Anzeigetafel eingerichtet.`;

    placeholder.append(icon, title, description);
    container.replaceChildren(placeholder);
  }
})();
