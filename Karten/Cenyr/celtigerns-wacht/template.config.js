window.KARTO_CONFIG = {
  mapId: "cenyr-celtigerns-wacht",
  title: "Celtigerns Wacht",
  documentTitle: "Celtigerns Wacht - Aleria",
  images: {
    normal: "Kartenbilder/CeltigernsWacht.png",
    regions: "Kartenbilder/CeltigernsWachtRegionen.png",
    pins: "Kartenbilder/CeltigernsWachtMarker.png",
  },
  firebase: {
    collection: "karten",
    docId: "cenyr-celtigerns-wacht",
    legacyImport: {
      collection: "karto-v4",
      docId: "state",
      migrateIfEmpty: true,
    },
  },
};
