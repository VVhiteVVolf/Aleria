window.KONTINENTE_DATA = {
  meta: {
    id: "kontinente-startseite",
    title: "Kontinente - Aleria",
    type: "Uebersicht",
    status: "Entwurf",
    editorVersion: 1,
    template: "kontinente-startseite",
    storage: {
      document: "kontinente-startseite",
      firebaseCollections: {
        inlineContent: "kontinente_inline_content",
        scenes: "kontinente_scenes",
      },
      localStoragePrefixes: [
        "aleria:kontinente:inline-content:v2:kontinente-startseite",
        "aleria:kontinente:inline-reset:kontinente-startseite",
        "aleria:kontinente:inline-status-position:kontinente-startseite",
        "aleria:kontinente:scene-index:kontinente-startseite",
        "aleria:kontinente:scene-index-meta:kontinente-startseite",
        "aleria:kontinente:session-module:kontinente-startseite:",
        "aleria:kontinente:session-module-meta:kontinente-startseite:",
        "aleria:kontinente:comments:kontinente:kontinente-startseite:",
      ],
      imageStorage: {
        currentMode: "inline-url-or-base64",
        plannedProvider: "firebase-storage",
        plannedRoot: "kontinente/kontinente-startseite/images",
        plannedFirestoreMode: "reference",
      },
      tableStorage: {
        currentMode: "html",
        plannedStructuredMode: "optional",
      },
    },
  },
  name: "Kontinente",
  canonicalPath: "Kontinente",
  hierarchy: [
    { type: "Sammlung", name: "Kontinente", slug: "kontinente" },
    { type: "Uebersicht", name: "Kontinente", slug: "kontinente" },
  ],
};

window.ORT_DATA = window.KONTINENTE_DATA;
