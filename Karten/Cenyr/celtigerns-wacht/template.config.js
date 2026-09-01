window.KARTO_CONFIG = {
  mapId: "cenyr-celtigerns-wacht",
  title: "Celtigerns Wacht",
  documentTitle: "Celtigerns Wacht - Aleria",
  images: {
    normal: "Kartenbilder/CeltigernsWacht.png",
    regions: "Kartenbilder/CeltigernsWachtRegionen.png",
    pins: "Kartenbilder/CeltigernsWachtMarker.png",
  },
  defaultDominions: window.KartoDominionPresets?.forMap("cenyr-celtigerns-wacht") || [],
  storage: {
    dataPath: "Cenyr/celtigerns-wacht/data.json",
  },
};
