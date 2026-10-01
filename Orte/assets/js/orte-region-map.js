(function () {
  "use strict";

  const page = document.querySelector("[data-orte-static-template]");
  const table = page?.querySelector("[data-orte-region-table]");
  if (!page || !table) return;

  document.addEventListener("aleria:orte:data-ready", (event) => {
    configureRegionMap(event.detail?.data || window.ORT_DATA);
  });

  if (window.ORT_DATA) {
    configureRegionMap(window.ORT_DATA);
  }

  function configureRegionMap(data) {
    const config = data?.regionMap;
    if (!config?.mapId || !config?.embedHref) return;

    renderFrame(config, data.name);
  }

  function renderFrame(config, placeName) {
    const mapCell = table.rows[0]?.cells[0];
    if (!mapCell) return;

    const embed = window.AleriaPlaceMapEmbed?.render({
      container: mapCell,
      config,
      defaultTitle: placeName || "Regionskarte",
      frameTitlePrefix: "Regionskarte",
      variant: "region",
    });
    // Legacy templates may still contain the former header and placeholder rows.
    if (embed) {
      while (table.rows.length > 1) table.deleteRow(1);
    }
  }
})();
