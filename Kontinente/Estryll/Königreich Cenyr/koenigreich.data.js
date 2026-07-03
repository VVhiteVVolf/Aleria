window.KONTINENTE_DATA = {
  meta: {
    id: "koenigreich-cenyr",
    title: "Das Königreich von Cenyr - Aleria",
    type: "Königreich",
    status: "Entwurf",
    editorVersion: 1,
    template: "koenigreich",
    storage: {
      document: "koenigreich-cenyr",
      firebaseCollections: {
        inlineContent: "kontinente_inline_content",
        scenes: "kontinente_scenes",
      },
      localStoragePrefixes: [
        "aleria:kontinente:inline-content:v2:koenigreich-cenyr",
        "aleria:kontinente:inline-reset:koenigreich-cenyr",
        "aleria:kontinente:inline-status-position:koenigreich-cenyr",
        "aleria:kontinente:scene-index:koenigreich-cenyr",
        "aleria:kontinente:scene-index-meta:koenigreich-cenyr",
        "aleria:kontinente:session-module:koenigreich-cenyr:",
        "aleria:kontinente:session-module-meta:koenigreich-cenyr:",
        "aleria:kontinente:comments:kontinente:koenigreich-cenyr:",
      ],
      imageStorage: {
        currentMode: "inline-url-or-base64",
        plannedProvider: "firebase-storage",
        plannedRoot: "kontinente/koenigreich-cenyr/images",
        plannedFirestoreMode: "reference",
      },
      tableStorage: {
        currentMode: "html",
        plannedStructuredMode: "optional",
      },
    },
  },
  name: "Das Königreich von Cenyr",
  canonicalPath: "Kontinente > Estryll > Königreich Cenyr",
  hierarchy: [
    { type: "Sammlung", name: "Kontinente", slug: "kontinente" },
    { type: "Kontinent", name: "Estryll", slug: "estryll" },
    { type: "Königreich", name: "Cenyr", slug: "cenyr" },
  ],
};

window.ORT_DATA = window.KONTINENTE_DATA;
