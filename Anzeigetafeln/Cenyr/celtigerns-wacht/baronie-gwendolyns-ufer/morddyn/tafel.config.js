window.TAFEL_CONFIG = {
  boardId: "cenyr-celtigerns-wacht-gwendolyns-ufer-morddyn",
  title: "📋 Anzeigetafel — Morddyn",
  documentTitle: "Anzeigetafel Morddyn - Aleria",
  images: {
    board: "Bilder/MorddynTafel.png",
    marker: "Bilder/MorddynTafelMarker.png",
  },
  firebase: {
    collection: "anzeigetafeln",
    docId: "cenyr-celtigerns-wacht-gwendolyns-ufer-morddyn",
    legacyImport: {
      collection: "tafel-v1",
      docId: "state",
      migrateIfEmpty: true,
    },
  },
};
