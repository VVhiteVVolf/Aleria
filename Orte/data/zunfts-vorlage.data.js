window.ORT_DATA = {
  meta: {
    id: "zunfts-vorlage",
    title: "Zunfts-Vorlage - Aleria",
    type: "Zunft / Gewerbe / Standort",
    status: "Vorlage",
    editorVersion: 1,
    template: "zunft",
    storage: {
      inlineContentDocument: "zunfts-vorlage",
      sceneIndexDocument: "zunfts-vorlage__scene-index",
      sceneDocumentPrefix: "zunfts-vorlage__",
      firebaseCollections: {
        inlineContent: "orte_inline_content",
        scenes: "orte_scenes"
      }
    }
  },

  name: "Name der Einrichtung",
  subtype: "zunft",
  canonicalPath: "Vorlagen > Orte > Zunft / Gewerbe / Standort",

  intendedUse: [
    "Geschaefte",
    "Werkstaetten",
    "Kontore",
    "Gilden",
    "Zuenfte",
    "Orden",
    "Tavernen",
    "Institutionen",
    "Gewerbe",
    "kleine POI mit Personal und Betrieb"
  ],

  storageGuideline: {
    cityOwnedExample: "Orte/.../Lysfaen/Zuenfte/<zunft-slug>/ort.data.js",
    bannkreisOwnedExample: "Orte/.../Lysfaens_Bannkreis/<standort-slug>/ort.data.js",
    firebaseDocIdPattern: "<ort-id>__zunft__<zunft-slug>",
    note: "Konkrete Zunfts- und Gewerbeseiten muessen eigene Registry-Eintraege und eigene Firebase-Dokument-IDs erhalten."
  },

  marketModules: [],

  hierarchy: [
    { type: "Koenigreich", name: "Cenyr", slug: "cenyr" },
    { type: "Grafschaft", name: "Grafschaft", slug: "grafschaft" },
    { type: "Baronie", name: "Baronie", slug: "baronie" },
    { type: "Herrschaft", name: "Herrschaft", slug: "herrschaft" },
    { type: "Siedlung", name: "Siedlung", slug: "siedlung" },
    { type: "Einrichtung", name: "Name der Einrichtung", slug: "name-der-einrichtung" }
  ]
};
