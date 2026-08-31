window.ORTE_REGISTRY = [
  {
    id: "grossstadt-vorlage",
    slug: "grossstadt-vorlage",
    name: "Großstadt-Vorlage",
    status: "template",
    type: "grossstadt",
    data: "data/grossstadt-vorlage.data.js",
    contentData: "published/grossstadt-vorlage/data.json",
    sceneData: "published/grossstadt-vorlage/scenes/data.json",
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
    id: "zunfts-vorlage",
    slug: "zunfts-vorlage",
    aliases: [
      "zunft-vorlage",
      "gewerbe-vorlage",
      "standort-vorlage"
    ],
    name: "Zunfts-Vorlage",
    status: "template",
    type: "zunft",
    data: "data/zunfts-vorlage.data.js",
    contentData: "published/zunfts-vorlage/data.json",
    sceneData: "published/zunfts-vorlage/scenes/data.json",
    marketData: "published/zunfts-vorlage/market/data.json",
    sceneCollection: "orte_scenes",
    inlineCollection: "orte_inline_content",
    hierarchy: [
      { type: "Königreich", name: "Cenyr", slug: "cenyr" },
      { type: "Grafschaft", name: "Grafschaft", slug: "grafschaft" },
      { type: "Baronie", name: "Baronie", slug: "baronie" },
      { type: "Ritterliche Herrschaft", name: "Herrschaft", slug: "herrschaft" },
      { type: "Siedlung", name: "Siedlung", slug: "siedlung" },
      { type: "Einrichtung", name: "Zunft / Gewerbe / Standort", slug: "zunft-gewerbe-standort" }
    ],
    tags: ["orte", "zunft", "gewerbe", "gilde", "geschaeft", "poi", "vorlage"]
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
    contentData: "published/lysfaen/data.json",
    sceneData: "published/lysfaen/scenes/data.json",
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
  },
  {
    id: "lysfaen-zunft-pferdezucht-jernigan",
    slug: "pferdezucht-jernigan",
    aliases: [
      "lysfaen-pferdezucht-jernigan",
      "pferdezucht-jernigan"
    ],
    name: "Pferdezucht Jernigan",
    status: "draft",
    type: "zunft",
    subtype: "pferdezucht",
    data: "Koenigreich_Cenyr/Grafschaft_Celtigerns_Wacht/Baronie_Llamreis_Ankunft/Herrschaft_Haus_Wyrm/Lysfaens_Bannkreis/Lysfaen/Standorte/Pferdezucht_Jernigan/ort.data.js",
    contentData: "published/lysfaen-zunft-pferdezucht-jernigan/data.json",
    sceneData: "published/lysfaen-zunft-pferdezucht-jernigan/scenes/data.json",
    marketData: "published/lysfaen-zunft-pferdezucht-jernigan/market/data.json",
    sceneCollection: "orte_scenes",
    inlineCollection: "orte_inline_content",
    hierarchy: [
      { type: "Königreich", name: "Cenyr", slug: "cenyr" },
      { type: "Grafschaft", name: "Celtigerns Wacht", slug: "celtigerns-wacht" },
      { type: "Baronie", name: "Llamreis Ankunft", slug: "llamreis-ankunft" },
      { type: "Herrschaft", name: "Haus Wyrm", slug: "haus-wyrm" },
      { type: "Bannkreis", name: "Lysfaens Bannkreis", slug: "lysfaens-bannkreis" },
      { type: "Siedlung", name: "Lysfaen", slug: "lysfaen" },
      { type: "Einrichtung", name: "Pferdezucht Jernigan", slug: "pferdezucht-jernigan" }
    ],
    tags: ["orte", "lysfaen", "standort", "gewerbe", "pferdezucht", "zunft-template"]
  },
  {
    id: "lysfaen-zunft-hof-blevins",
    slug: "hof-blevins",
    aliases: [
      "lysfaen-hof-blevins",
      "hof-blevins"
    ],
    name: "Hof Blevins",
    status: "draft",
    type: "zunft",
    subtype: "hof",
    data: "Koenigreich_Cenyr/Grafschaft_Celtigerns_Wacht/Baronie_Llamreis_Ankunft/Herrschaft_Haus_Wyrm/Lysfaens_Bannkreis/Lysfaen/Standorte/Hof_Blevins/ort.data.js",
    contentData: "published/lysfaen-zunft-hof-blevins/data.json",
    sceneData: "published/lysfaen-zunft-hof-blevins/scenes/data.json",
    marketData: "published/lysfaen-zunft-hof-blevins/market/data.json",
    sceneCollection: "orte_scenes",
    inlineCollection: "orte_inline_content",
    hierarchy: [
      { type: "Königreich", name: "Cenyr", slug: "cenyr" },
      { type: "Grafschaft", name: "Celtigerns Wacht", slug: "celtigerns-wacht" },
      { type: "Baronie", name: "Llamreis Ankunft", slug: "llamreis-ankunft" },
      { type: "Herrschaft", name: "Haus Wyrm", slug: "haus-wyrm" },
      { type: "Bannkreis", name: "Lysfaens Bannkreis", slug: "lysfaens-bannkreis" },
      { type: "Siedlung", name: "Lysfaen", slug: "lysfaen" },
      { type: "Einrichtung", name: "Hof Blevins", slug: "hof-blevins" }
    ],
    tags: ["orte", "lysfaen", "standort", "hof", "gewerbe", "zunft-template"]
  },
  {
    id: "lysfaen-zunft-hof-glyn",
    slug: "hof-glyn",
    aliases: [
      "lysfaen-hof-glyn",
      "hof-glyn"
    ],
    name: "Hof Glyn",
    status: "draft",
    type: "zunft",
    subtype: "hof",
    data: "Koenigreich_Cenyr/Grafschaft_Celtigerns_Wacht/Baronie_Llamreis_Ankunft/Herrschaft_Haus_Wyrm/Lysfaens_Bannkreis/Lysfaen/Standorte/Hof_Glyn/ort.data.js",
    contentData: "published/lysfaen-zunft-hof-glyn/data.json",
    sceneData: "published/lysfaen-zunft-hof-glyn/scenes/data.json",
    marketData: "published/lysfaen-zunft-hof-glyn/market/data.json",
    sceneCollection: "orte_scenes",
    inlineCollection: "orte_inline_content",
    hierarchy: [
      { type: "Königreich", name: "Cenyr", slug: "cenyr" },
      { type: "Grafschaft", name: "Celtigerns Wacht", slug: "celtigerns-wacht" },
      { type: "Baronie", name: "Llamreis Ankunft", slug: "llamreis-ankunft" },
      { type: "Herrschaft", name: "Haus Wyrm", slug: "haus-wyrm" },
      { type: "Bannkreis", name: "Lysfaens Bannkreis", slug: "lysfaens-bannkreis" },
      { type: "Siedlung", name: "Lysfaen", slug: "lysfaen" },
      { type: "Einrichtung", name: "Hof Glyn", slug: "hof-glyn" }
    ],
    tags: ["orte", "lysfaen", "standort", "hof", "gewerbe", "zunft-template"]
  },
  {
    id: "lysfaen-zunft-hof-talfryn",
    slug: "hof-talfryn",
    aliases: [
      "lysfaen-hof-talfryn",
      "hof-talfryn"
    ],
    name: "Hof Talfryn",
    status: "draft",
    type: "zunft",
    subtype: "hof",
    data: "Koenigreich_Cenyr/Grafschaft_Celtigerns_Wacht/Baronie_Llamreis_Ankunft/Herrschaft_Haus_Wyrm/Lysfaens_Bannkreis/Lysfaen/Standorte/Hof_Talfryn/ort.data.js",
    contentData: "published/lysfaen-zunft-hof-talfryn/data.json",
    sceneData: "published/lysfaen-zunft-hof-talfryn/scenes/data.json",
    marketData: "published/lysfaen-zunft-hof-talfryn/market/data.json",
    sceneCollection: "orte_scenes",
    inlineCollection: "orte_inline_content",
    hierarchy: [
      { type: "Königreich", name: "Cenyr", slug: "cenyr" },
      { type: "Grafschaft", name: "Celtigerns Wacht", slug: "celtigerns-wacht" },
      { type: "Baronie", name: "Llamreis Ankunft", slug: "llamreis-ankunft" },
      { type: "Herrschaft", name: "Haus Wyrm", slug: "haus-wyrm" },
      { type: "Bannkreis", name: "Lysfaens Bannkreis", slug: "lysfaens-bannkreis" },
      { type: "Siedlung", name: "Lysfaen", slug: "lysfaen" },
      { type: "Einrichtung", name: "Hof Talfryn", slug: "hof-talfryn" }
    ],
    tags: ["orte", "lysfaen", "standort", "hof", "gewerbe", "zunft-template"]
  },
  {
    id: "lysfaen-zunft-hof-crewe",
    slug: "hof-crewe",
    aliases: [
      "lysfaen-hof-crewe",
      "hof-crewe"
    ],
    name: "Hof Crewe",
    status: "draft",
    type: "zunft",
    subtype: "hof",
    data: "Koenigreich_Cenyr/Grafschaft_Celtigerns_Wacht/Baronie_Llamreis_Ankunft/Herrschaft_Haus_Wyrm/Lysfaens_Bannkreis/Lysfaen/Standorte/Hof_Crewe/ort.data.js",
    contentData: "published/lysfaen-zunft-hof-crewe/data.json",
    sceneData: "published/lysfaen-zunft-hof-crewe/scenes/data.json",
    marketData: "published/lysfaen-zunft-hof-crewe/market/data.json",
    sceneCollection: "orte_scenes",
    inlineCollection: "orte_inline_content",
    hierarchy: [
      { type: "Königreich", name: "Cenyr", slug: "cenyr" },
      { type: "Grafschaft", name: "Celtigerns Wacht", slug: "celtigerns-wacht" },
      { type: "Baronie", name: "Llamreis Ankunft", slug: "llamreis-ankunft" },
      { type: "Herrschaft", name: "Haus Wyrm", slug: "haus-wyrm" },
      { type: "Bannkreis", name: "Lysfaens Bannkreis", slug: "lysfaens-bannkreis" },
      { type: "Siedlung", name: "Lysfaen", slug: "lysfaen" },
      { type: "Einrichtung", name: "Hof Crewe", slug: "hof-crewe" }
    ],
    tags: ["orte", "lysfaen", "standort", "hof", "gewerbe", "zunft-template"]
  },
  {
    id: "lysfaen-zunft-taverne-zur-weissen-drachin",
    slug: "taverne-zur-weissen-drachin",
    aliases: [
      "lysfaen-taverne-zur-weissen-drachin",
      "zur-weissen-drachin"
    ],
    name: "Taverne - \"Zur Weißen Drachin\"",
    status: "draft",
    type: "zunft",
    subtype: "taverne",
    data: "Koenigreich_Cenyr/Grafschaft_Celtigerns_Wacht/Baronie_Llamreis_Ankunft/Herrschaft_Haus_Wyrm/Lysfaens_Bannkreis/Lysfaen/Standorte/Taverne_Zur_Weissen_Drachin/ort.data.js",
    contentData: "published/lysfaen-zunft-taverne-zur-weissen-drachin/data.json",
    sceneData: "published/lysfaen-zunft-taverne-zur-weissen-drachin/scenes/data.json",
    marketData: "published/lysfaen-zunft-taverne-zur-weissen-drachin/market/data.json",
    sceneCollection: "orte_scenes",
    inlineCollection: "orte_inline_content",
    hierarchy: [
      { type: "Königreich", name: "Cenyr", slug: "cenyr" },
      { type: "Grafschaft", name: "Celtigerns Wacht", slug: "celtigerns-wacht" },
      { type: "Baronie", name: "Llamreis Ankunft", slug: "llamreis-ankunft" },
      { type: "Herrschaft", name: "Haus Wyrm", slug: "haus-wyrm" },
      { type: "Bannkreis", name: "Lysfaens Bannkreis", slug: "lysfaens-bannkreis" },
      { type: "Siedlung", name: "Lysfaen", slug: "lysfaen" },
      { type: "Einrichtung", name: "Taverne - \"Zur Weißen Drachin\"", slug: "taverne-zur-weissen-drachin" }
    ],
    tags: ["orte", "lysfaen", "standort", "taverne", "gewerbe", "zunft-template"]
  }
];
