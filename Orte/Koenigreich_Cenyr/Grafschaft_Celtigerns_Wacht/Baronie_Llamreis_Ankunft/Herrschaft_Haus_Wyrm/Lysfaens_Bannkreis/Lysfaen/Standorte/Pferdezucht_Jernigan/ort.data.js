window.ORT_DATA = {
  meta: {
    id: "lysfaen-zunft-pferdezucht-jernigan",
    title: "Pferdezucht Jernigan - Aleria",
    type: "Standort / Gewerbe",
    subtype: "Pferdezucht",
    status: "Draft",
    editorVersion: 1,
    template: "zunft",
    storage: {
      inlineContentDocument: "lysfaen-zunft-pferdezucht-jernigan",
      sceneIndexDocument: "lysfaen-zunft-pferdezucht-jernigan__scene-index",
      sceneDocumentPrefix: "lysfaen-zunft-pferdezucht-jernigan__",
      firebaseCollections: {
        inlineContent: "orte_inline_content",
        scenes: "orte_scenes"
      },
      localStoragePrefixes: [
        "aleria:orte:inline-content:v2:lysfaen-zunft-pferdezucht-jernigan",
        "aleria:orte:scene-index:lysfaen-zunft-pferdezucht-jernigan",
        "aleria:orte:session-module:lysfaen-zunft-pferdezucht-jernigan:"
      ]
    }
  },

  name: "Pferdezucht Jernigan",
  canonicalPath: "Koenigreich Cenyr > Grafschaft von Celtigerns Wacht > Baronie von Llamreis Ankunft > Herrschaft des Hauses Wyrm > Lysfaens Bannkreis > Lysfaen > Pferdezucht Jernigan",
  hierarchy: [
    { type: "Koenigreich", name: "Cenyr", slug: "cenyr" },
    { type: "Grafschaft", name: "Celtigerns Wacht", slug: "celtigerns-wacht" },
    { type: "Baronie", name: "Llamreis Ankunft", slug: "llamreis-ankunft" },
    { type: "Herrschaft", name: "Haus Wyrm", slug: "haus-wyrm" },
    { type: "Bannkreis", name: "Lysfaens Bannkreis", slug: "lysfaens-bannkreis" },
    { type: "Siedlung", name: "Lysfaen", slug: "lysfaen" },
    { type: "Einrichtung", name: "Pferdezucht Jernigan", slug: "pferdezucht-jernigan" }
  ],
  parentSettlementId: "lysfaen",
  parentSettlementName: "Lysfaen",
  note: "Konkreter bearbeitbarer Standort innerhalb Lysfaens. Inhalte werden ueber die Zunfts-/Standortvorlage und Firebase separat gespeichert."
};
