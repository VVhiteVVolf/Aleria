window.TAFEL_CONFIG = {
  boardId: "cenyr-celtigerns-wacht-gwendolyns-ufer-morddyn",
  title: "Anzeigetafel — Morddyn",
  documentTitle: "Anzeigetafel Morddyn - Aleria",
  images: {
    board: "Bilder/MorddynTafel.png",
  },
  storage: {
    dataPath: "Cenyr/celtigerns-wacht/baronie-gwendolyns-ufer/morddyn/data.json",
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
