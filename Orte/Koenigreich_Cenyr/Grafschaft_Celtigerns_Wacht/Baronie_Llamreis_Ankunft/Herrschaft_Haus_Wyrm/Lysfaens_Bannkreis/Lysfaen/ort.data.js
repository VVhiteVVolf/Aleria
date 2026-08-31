window.ORT_DATA = {
  meta: {
    id: "lysfaen",
    title: "Lysfaen - Aleria",
    type: "Kleinstadt",
    status: "Draft",
    template: "grossstadt",
  },

  name: "Lysfaen",
  canonicalPath: "Königreich Cenyr > Grafschaft von Celtigerns Wacht > Baronie von Llamreis Ankunft > Herrschaft des Hauses Wyrm > Lysfaens Bannkreis > Lysfaen",

  hierarchy: [
    { type: "Königreich", name: "Cenyr", slug: "cenyr" },
    { type: "Grafschaft", name: "Celtigerns Wacht", slug: "celtigerns-wacht" },
    { type: "Baronie", name: "Llamreis Ankunft", slug: "llamreis-ankunft" },
    { type: "Herrschaft", name: "Haus Wyrm", slug: "haus-wyrm" },
    { type: "Bannkreis", name: "Lysfaens Bannkreis", slug: "lysfaens-bannkreis" },
    { type: "Siedlung", name: "Lysfaen", slug: "lysfaen" }
  ],

  parentage: {
    kingdom: "Cenyr",
    county: "Celtigerns Wacht",
    barony: "Llamreis Ankunft",
    lordship: "Haus Wyrm",
    region: "Lysfaens Bannkreis",
    settlement: "Lysfaen"
  },

  futureStructure: {
    settlementPoisPath: "POI/",
    intendedPoiTypes: [
      "Taverne",
      "Shop",
      "Hof",
      "Handwerksbetrieb",
      "öffentlicher Ort",
      "Bannkreis-Ort"
    ],
    note: "POI innerhalb Lysfaens oder im Bannkreis bekommen später eigene Unterordner und eigene ort.data.js-Dateien."
  },

  initialNotes: [
    "Dies ist der erste konkrete Ort auf Basis der Orte-Vorlage.",
    "Alle Direktbearbeitungsdaten und Ortsszenen müssen unter der stabilen Orts-ID lysfaen gespeichert werden.",
    "Diese Datei dokumentiert die fachliche Einordnung; die eigentlichen editierbaren Inhalte entstehen über die Seite und Firebase/LocalStorage."
  ]
};
