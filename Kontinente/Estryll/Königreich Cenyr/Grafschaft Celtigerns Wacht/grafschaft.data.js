window.KONTINENTE_DATA = {
  meta: {
    id: "grafschaft-celtigerns-wacht",
    title: "Grafschaft Celtigerns Wacht - Gwyl Celtigern - Aleria",
    type: "Grafschaft",
    status: "Entwurf",
    editorVersion: 1,
    template: "grafschaft",
    storage: {
      document: "grafschaft-celtigerns-wacht",
      firebaseCollections: {
        inlineContent: "kontinente_inline_content",
        scenes: "kontinente_scenes",
      },
      localStoragePrefixes: [
        "aleria:kontinente:inline-content:v2:grafschaft-celtigerns-wacht",
        "aleria:kontinente:inline-reset:grafschaft-celtigerns-wacht",
        "aleria:kontinente:inline-status-position:grafschaft-celtigerns-wacht",
        "aleria:kontinente:scene-index:grafschaft-celtigerns-wacht",
        "aleria:kontinente:scene-index-meta:grafschaft-celtigerns-wacht",
        "aleria:kontinente:session-module:grafschaft-celtigerns-wacht:",
        "aleria:kontinente:session-module-meta:grafschaft-celtigerns-wacht:",
        "aleria:kontinente:comments:kontinente:grafschaft-celtigerns-wacht:",
      ],
      imageStorage: {
        currentMode: "inline-url-or-base64",
        plannedProvider: "firebase-storage",
        plannedRoot: "kontinente/grafschaft-celtigerns-wacht/images",
        plannedFirestoreMode: "reference",
      },
      tableStorage: {
        currentMode: "html",
        plannedStructuredMode: "optional",
      },
    },
  },
  name: "Grafschaft Celtigerns Wacht",
  canonicalPath: "Kontinente > Estryll > Königreich Cenyr > Grafschaft Celtigerns Wacht",
  hierarchy: [
    { type: "Sammlung", name: "Kontinente", slug: "kontinente" },
    { type: "Kontinent", name: "Estryll", slug: "estryll" },
    { type: "Königreich", name: "Cenyr", slug: "cenyr" },
    { type: "Grafschaft", name: "Celtigerns Wacht", slug: "celtigerns-wacht" },
  ],
};

window.ORT_DATA = window.KONTINENTE_DATA;
