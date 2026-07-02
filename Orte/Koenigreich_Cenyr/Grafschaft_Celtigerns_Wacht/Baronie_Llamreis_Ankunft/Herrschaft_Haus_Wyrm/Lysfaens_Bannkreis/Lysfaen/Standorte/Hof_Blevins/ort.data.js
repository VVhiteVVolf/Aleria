window.ORT_DATA = {
  meta: {
    id: "lysfaen-zunft-hof-blevins",
    title: "Hof Blevins - Aleria",
    type: "Standort / Hof",
    subtype: "Hof",
    status: "Draft",
    editorVersion: 1,
    template: "zunft",
    storage: {
      inlineContentDocument: "lysfaen-zunft-hof-blevins",
      sceneIndexDocument: "lysfaen-zunft-hof-blevins__scene-index",
      sceneDocumentPrefix: "lysfaen-zunft-hof-blevins__",
      firebaseCollections: {
        inlineContent: "orte_inline_content",
        scenes: "orte_scenes"
      },
      localStoragePrefixes: [
        "aleria:orte:inline-content:v2:lysfaen-zunft-hof-blevins",
        "aleria:orte:scene-index:lysfaen-zunft-hof-blevins",
        "aleria:orte:session-module:lysfaen-zunft-hof-blevins:"
      ]
    }
  },

  name: "Hof Blevins",
  canonicalPath: "Koenigreich Cenyr > Grafschaft von Celtigerns Wacht > Baronie von Llamreis Ankunft > Herrschaft des Hauses Wyrm > Lysfaens Bannkreis > Lysfaen > Hof Blevins",
  hierarchy: [
    { type: "Koenigreich", name: "Cenyr", slug: "cenyr" },
    { type: "Grafschaft", name: "Celtigerns Wacht", slug: "celtigerns-wacht" },
    { type: "Baronie", name: "Llamreis Ankunft", slug: "llamreis-ankunft" },
    { type: "Herrschaft", name: "Haus Wyrm", slug: "haus-wyrm" },
    { type: "Bannkreis", name: "Lysfaens Bannkreis", slug: "lysfaens-bannkreis" },
    { type: "Siedlung", name: "Lysfaen", slug: "lysfaen" },
    { type: "Einrichtung", name: "Hof Blevins", slug: "hof-blevins" }
  ],
  parentSettlementId: "lysfaen",
  parentSettlementName: "Lysfaen",
  note: "Konkreter bearbeitbarer Standort innerhalb Lysfaens. Inhalte werden ueber die Zunfts-/Standortvorlage und Firebase separat gespeichert."
};
