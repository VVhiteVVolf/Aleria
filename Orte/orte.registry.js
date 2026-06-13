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
  }
];
