window.KONTINENTE_DATA = {
  meta: {
    id: "grafschaft-vorlage",
    title: "Grafschaft-Vorlage - Aleria",
    type: "Grafschaft",
    status: "Template",
    editorVersion: 1,
    template: "grafschaft",
    storage: {
      document: "grafschaft-vorlage",
      firebaseCollections: {
        inlineContent: "kontinente_inline_content",
        scenes: "kontinente_scenes",
      },
      localStoragePrefixes: [
        "aleria:kontinente:inline-content:v2:grafschaft-vorlage",
        "aleria:kontinente:inline-reset:grafschaft-vorlage",
        "aleria:kontinente:inline-status-position:grafschaft-vorlage",
        "aleria:kontinente:scene-index:grafschaft-vorlage",
        "aleria:kontinente:scene-index-meta:grafschaft-vorlage",
        "aleria:kontinente:session-module:grafschaft-vorlage:",
        "aleria:kontinente:session-module-meta:grafschaft-vorlage:",
        "aleria:kontinente:comments:kontinente:grafschaft-vorlage:",
      ],
      imageStorage: {
        currentMode: "inline-url-or-base64",
        plannedProvider: "firebase-storage",
        plannedRoot: "kontinente/grafschaft-vorlage/images",
        plannedFirestoreMode: "reference",
      },
      tableStorage: {
        currentMode: "html",
        plannedStructuredMode: "optional",
      },
    },
  },
  name: "Grafschaft-Vorlage",
  canonicalPath: "Kontinente > Grafschaften > Grafschaft-Vorlage",
  hierarchy: [
    { type: "Sammlung", name: "Kontinente", slug: "kontinente" },
    { type: "Vorlage", name: "Grafschaft-Vorlage", slug: "grafschaft-vorlage" },
  ],
};

window.ORT_DATA = window.KONTINENTE_DATA;
