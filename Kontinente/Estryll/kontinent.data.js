window.KONTINENTE_DATA = {
  meta: {
    id: "kontinent-estryll",
    title: "Kontinent Estryll - Aleria",
    type: "Kontinent",
    status: "Entwurf",
    editorVersion: 1,
    template: "kontinent",
    storage: {
      document: "kontinent-estryll",
      firebaseCollections: {
        inlineContent: "kontinente_inline_content",
        scenes: "kontinente_scenes",
      },
      localStoragePrefixes: [
        "aleria:kontinente:inline-content:v2:kontinent-estryll",
        "aleria:kontinente:inline-reset:kontinent-estryll",
        "aleria:kontinente:inline-status-position:kontinent-estryll",
        "aleria:kontinente:scene-index:kontinent-estryll",
        "aleria:kontinente:scene-index-meta:kontinent-estryll",
        "aleria:kontinente:session-module:kontinent-estryll:",
        "aleria:kontinente:session-module-meta:kontinent-estryll:",
        "aleria:kontinente:comments:kontinente:kontinent-estryll:",
      ],
      imageStorage: {
        currentMode: "inline-url-or-base64",
        plannedProvider: "firebase-storage",
        plannedRoot: "kontinente/kontinent-estryll/images",
        plannedFirestoreMode: "reference",
      },
      tableStorage: {
        currentMode: "html",
        plannedStructuredMode: "optional",
      },
    },
  },
  name: "Kontinent Estryll",
  canonicalPath: "Kontinente > Estryll",
  hierarchy: [
    { type: "Sammlung", name: "Kontinente", slug: "kontinente" },
    { type: "Kontinent", name: "Estryll", slug: "estryll" },
  ],
};

window.ORT_DATA = window.KONTINENTE_DATA;
