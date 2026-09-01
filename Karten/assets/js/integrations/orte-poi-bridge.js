(function () {
  "use strict";

  const MESSAGE_TYPE = "aleria:map-pois";
  const REQUEST_TYPE = "aleria:map-pois-request";
  const runtime = window.KartoRuntime;
  const mapId = String(window.KARTO_CONFIG?.mapId || "");

  if (!runtime || !mapId || window.parent === window) return;

  window.addEventListener("aleria:karto:state-changed", publishPois);
  window.addEventListener("message", handleRequest);
  window.addEventListener("load", publishPois, { once: true });

  function handleRequest(event) {
    if (event.source !== window.parent || !isSameOrigin(event.origin)) return;
    if (event.data?.type !== REQUEST_TYPE || event.data.mapId !== mapId) return;
    publishPois();
  }

  function publishPois() {
    const state = runtime.state();
    const categories = new Map((state.cats || []).map((category) => [category.id, category]));
    const dominions = new Map((state.dominions || []).map((dominion) => [dominion.id, dominion]));
    const pois = (state.pins || [])
      .filter((pin) => !pin.secret)
      .map((pin) => toPoi(pin, categories.get(pin.cat), dominions.get(pin.dominionId)));

    window.parent.postMessage({ type: MESSAGE_TYPE, mapId, pois }, targetOrigin());
  }

  function toPoi(pin, category, dominion) {
    return {
      id: String(pin.id || ""),
      icon: String(pin.pinMarker || category?.marker || pin.img || ""),
      name: String(pin.title || ""),
      affiliation: String(pin.region || pin.house || pin.faction || dominion?.name || ""),
      type: tableValue(pin, ["Typ", "Art"]) || String(category?.label || ""),
      danger: tableValue(pin, ["Gefahrenstufe", "Gefährlichkeit"]),
      distance: tableValue(pin, ["Entfernung"]),
      description: tableValue(pin, ["Kurzbeschreibung", "Beschreibung"]) || String(pin.text || ""),
    };
  }

  function tableValue(pin, labels) {
    const wanted = new Set(labels.map(normalizeLabel));
    const row = (pin.table || []).find((entry) => wanted.has(normalizeLabel(entry.k)));
    return String(row?.v || "");
  }

  function normalizeLabel(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()
      .toLowerCase();
  }

  function isSameOrigin(origin) {
    return origin === window.location.origin || (origin === "null" && window.location.origin === "null");
  }

  function targetOrigin() {
    return window.location.origin === "null" ? "*" : window.location.origin;
  }
})();
