window.ORT_DATA = {
  meta: {
    id: "lysfaen-zunft-hof-talfryn",
    title: "Hof Talfryn - Aleria",
    type: "Standort / Hof",
    subtype: "Hof",
    status: "Draft",
    editorVersion: 1,
    template: "zunft",
    storage: {
      inlineContentDocument: "lysfaen-zunft-hof-talfryn",
      sceneIndexDocument: "lysfaen-zunft-hof-talfryn__scene-index",
      sceneDocumentPrefix: "lysfaen-zunft-hof-talfryn__",
      firebaseCollections: {
        inlineContent: "orte_inline_content",
        scenes: "orte_scenes"
      },
      localStoragePrefixes: [
        "aleria:orte:inline-content:v2:lysfaen-zunft-hof-talfryn",
        "aleria:orte:scene-index:lysfaen-zunft-hof-talfryn",
        "aleria:orte:session-module:lysfaen-zunft-hof-talfryn:"
      ]
    }
  },

  name: "Hof Talfryn",
  canonicalPath: "Koenigreich Cenyr > Grafschaft von Celtigerns Wacht > Baronie von Llamreis Ankunft > Herrschaft des Hauses Wyrm > Lysfaens Bannkreis > Lysfaen > Hof Talfryn",
  hierarchy: [
    { type: "Koenigreich", name: "Cenyr", slug: "cenyr" },
    { type: "Grafschaft", name: "Celtigerns Wacht", slug: "celtigerns-wacht" },
    { type: "Baronie", name: "Llamreis Ankunft", slug: "llamreis-ankunft" },
    { type: "Herrschaft", name: "Haus Wyrm", slug: "haus-wyrm" },
    { type: "Bannkreis", name: "Lysfaens Bannkreis", slug: "lysfaens-bannkreis" },
    { type: "Siedlung", name: "Lysfaen", slug: "lysfaen" },
    { type: "Einrichtung", name: "Hof Talfryn", slug: "hof-talfryn" }
  ],
  parentSettlementId: "lysfaen",
  parentSettlementName: "Lysfaen",
  note: "Konkreter bearbeitbarer Standort innerhalb Lysfaens. Inhalte werden ueber die Zunfts-/Standortvorlage und Firebase separat gespeichert."
};
