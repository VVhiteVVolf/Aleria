window.ORTE_REGISTRY = [
  {
    id: "grossstadt-vorlage",
    slug: "grossstadt-vorlage",
    name: "Großstadt-Vorlage",
    status: "template",
    type: "grossstadt",
    data: "data/grossstadt-vorlage.data.js",
    hierarchy: [
      { type: "Königreich", name: "Cenyr", slug: "cenyr" },
      { type: "Grafschaft", name: "Grafschaft", slug: "grafschaft" },
      { type: "Baronie", name: "Baronie", slug: "baronie" },
      { type: "Ritterliche Herrschaft", name: "Herrschaft", slug: "herrschaft" },
      { type: "Siedlung", name: "Großstadt", slug: "grossstadt" }
    ],
    tags: ["orte", "grossstadt", "vorlage"]
  },
  {
    id: "lysfaen",
    slug: "lysfaen",
    aliases: [
      "lysfaens-bannkreis",
      "celtigerns-wacht-llamreis-ankunft-wyrm-lysfaen"
    ],
    name: "Lysfaen",
    status: "draft",
    type: "kleinstadt",
    data: "Koenigreich_Cenyr/Grafschaft_Celtigerns_Wacht/Baronie_Llamreis_Ankunft/Herrschaft_Haus_Wyrm/Lysfaens_Bannkreis/Lysfaen/ort.data.js",
    sceneCollection: "orte_scenes",
    inlineCollection: "orte_inline_content",
    hierarchy: [
      { type: "Königreich", name: "Cenyr", slug: "cenyr" },
      { type: "Grafschaft", name: "Celtigerns Wacht", slug: "celtigerns-wacht" },
      { type: "Baronie", name: "Llamreis Ankunft", slug: "llamreis-ankunft" },
      { type: "Herrschaft", name: "Haus Wyrm", slug: "haus-wyrm" },
      { type: "Bannkreis", name: "Lysfaens Bannkreis", slug: "lysfaens-bannkreis" },
      { type: "Siedlung", name: "Lysfaen", slug: "lysfaen" }
    ],
    tags: ["orte", "kleinstadt", "cenyr", "celtigerns-wacht", "llamreis-ankunft", "haus-wyrm", "lysfaen"]
  }
];
