(function () {
  "use strict";

  const catalog = window.ALERIA_CELTIGERNS_PLACES;
  const placeId = window.ORTE_CONFIG?.registryEntry?.id || "";
  const placeData = catalog?.createPlaceData(placeId);

  if (!placeData) {
    throw new Error(`Keine Ortsvorlage für "${placeId}" gefunden.`);
  }

  window.ORT_DATA = placeData;
})();
