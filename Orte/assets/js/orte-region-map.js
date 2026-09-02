(function () {
  "use strict";

  const page = document.querySelector("[data-orte-static-template]");
  const table = page?.querySelector("[data-orte-region-table]");
  if (!page || !table) return;

  let activeMapId = "";
  let activeFrame = null;

  window.addEventListener("message", handleMapMessage);
  document.addEventListener("aleria:orte:data-ready", (event) => {
    configureRegionMap(event.detail?.data || window.ORT_DATA);
  });

  if (window.ORT_DATA) {
    configureRegionMap(window.ORT_DATA);
  }

  function configureRegionMap(data) {
    const config = data?.regionMap;
    if (!config?.mapId || !config?.embedHref) return;

    activeMapId = String(config.mapId);
    renderFrame(config, data.name);
    renderPoiRows(Array.isArray(config.pois) ? config.pois : []);
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
      onLoad: requestPois,
    });
    activeFrame = embed?.frame || null;
  }

  function requestPois() {
    activeFrame?.contentWindow?.postMessage(
      { type: "aleria:map-pois-request", mapId: activeMapId },
      window.location.origin === "null" ? "*" : window.location.origin
    );
  }

  function handleMapMessage(event) {
    if (event.origin !== window.location.origin) return;
    if (!activeFrame || event.source !== activeFrame.contentWindow) return;

    const payload = event.data;
    if (payload?.type !== "aleria:map-pois" || payload.mapId !== activeMapId) return;
    renderPoiRows(Array.isArray(payload.pois) ? payload.pois : []);
  }

  function renderPoiRows(pois) {
    const body = table.tBodies[0];
    if (!body) return;

    while (body.rows.length > 2) {
      body.deleteRow(2);
    }

    pois.forEach((poi) => body.append(createPoiRow(poi)));
  }

  function createPoiRow(poi) {
    const row = document.createElement("tr");
    row.className = "orte-region-poi";

    row.append(
      createIconCell(poi),
      createPoiCell(poi.name, "Name", poi.href),
      createPoiCell(poi.region || poi.affiliation, "Zugehörigkeit"),
      createPoiCell(poi.type, "Typ"),
      createPoiCell(poi.danger, "Gefahrenstufe"),
      createPoiCell(poi.distance, "Entfernung"),
      createPoiCell(poi.description, "Kurzbeschreibung", "", 2)
    );
    return row;
  }

  function createIconCell(poi) {
    const cell = document.createElement("td");
    cell.className = "orte-region-poi__icon";
    cell.dataset.label = "Symbol";
    if (!poi.icon) return cell;

    const image = document.createElement("img");
    image.src = String(poi.icon);
    image.alt = "";
    image.loading = "lazy";
    cell.append(image);
    return cell;
  }

  function createPoiCell(value, label, href = "", colSpan = 1) {
    const cell = document.createElement("td");
    cell.dataset.label = label;
    cell.colSpan = colSpan;
    const text = String(value || "");

    if (!href) {
      cell.textContent = text;
      return cell;
    }

    const link = document.createElement("a");
    link.href = String(href);
    link.textContent = text;
    cell.append(link);
    return cell;
  }
})();
