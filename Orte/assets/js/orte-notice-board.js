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
    if (!config?.mapId || !config?.embedHref) return;
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
})();
