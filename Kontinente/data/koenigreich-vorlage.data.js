window.KONTINENTE_DATA = {
  meta: {
    id: "koenigreich-vorlage",
    title: "Königreich-Vorlage - Aleria",
    type: "Königreich",
    status: "Template",
    editorVersion: 1,
    template: "koenigreich",
    storage: {
      document: "koenigreich-vorlage",
      firebaseCollections: {
        inlineContent: "kontinente_inline_content",
        scenes: "kontinente_scenes",
      },
      localStoragePrefixes: [
        "aleria:kontinente:inline-content:v2:koenigreich-vorlage",
        "aleria:kontinente:inline-reset:koenigreich-vorlage",
        "aleria:kontinente:inline-status-position:koenigreich-vorlage",
        "aleria:kontinente:scene-index:koenigreich-vorlage",
        "aleria:kontinente:scene-index-meta:koenigreich-vorlage",
        "aleria:kontinente:session-module:koenigreich-vorlage:",
        "aleria:kontinente:session-module-meta:koenigreich-vorlage:",
        "aleria:kontinente:comments:kontinente:koenigreich-vorlage:",
      ],
      imageStorage: {
        currentMode: "inline-url-or-base64",
        plannedProvider: "firebase-storage",
        plannedRoot: "kontinente/koenigreich-vorlage/images",
        plannedFirestoreMode: "reference",
      },
      tableStorage: {
        currentMode: "html",
        plannedStructuredMode: "optional",
      },
    },
  },
  name: "Königreich-Vorlage",
  canonicalPath: "Kontinente > Königreiche > Königreich-Vorlage",
  hierarchy: [
    { type: "Sammlung", name: "Kontinente", slug: "kontinente" },
    { type: "Vorlage", name: "Königreich-Vorlage", slug: "koenigreich-vorlage" },
  ],
};

window.ORT_DATA = window.KONTINENTE_DATA;
