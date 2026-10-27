window.TAFEL_CONFIG = {
  boardId: "cenyr-celtigerns-wacht-gwendolyns-ufer-morddyn",
  title: "Anzeigetafel — Morddyn",
  documentTitle: "Anzeigetafel Morddyn - Aleria",
  images: {
    board: "assets/images/boards/town-square-v1.png",
  },
  storage: {
    dataPath: "Cenyr/celtigerns-wacht/baronie-gwendolyns-ufer/morddyn/data.json",
  },
  boardComposition: {
    presetPath: "Cenyr/celtigerns-wacht/baronie-gwendolyns-ufer/morddyn/board-layout.json",
    background: "assets/images/boards/town-square-v1.png",
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
