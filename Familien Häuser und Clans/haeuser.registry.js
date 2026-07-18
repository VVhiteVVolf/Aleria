(() => {
  "use strict";

  const HOUSE_STATUS = Object.freeze({
    TEMPLATE: "template",
    DRAFT: "draft",
    ACTIVE: "active",
    ARCHIVED: "archived",
  });

  const HOUSE_TYPES = Object.freeze({
    HOUSE: "house",
    FAMILY: "family",
    CLAN: "clan",
    DYNASTY: "dynasty",
    CADET_BRANCH: "cadet-branch",
  });

  const HOUSES = [
    {
      id: "haeuser-vorlage",
      slug: "haeuser-vorlage",
      aliases: [
        "familien-haeuser-clans-vorlage",
        "haeuser-clans-vorlage",
        "haus-vorlage",
        "familien-vorlage",
      ],
      name: "Häuser-Vorlage",
      status: HOUSE_STATUS.TEMPLATE,
      type: HOUSE_TYPES.HOUSE,
      data: "data/haeuser-vorlage.data.js",
      inlineCollection: "familien_haeuser_und_clans_inline_content",
      sceneCollection: "familien_haeuser_und_clans_scenes",
      hierarchy: [
        { type: "Sammlung", name: "Familien Häuser und Clans", slug: "familien-haeuser-und-clans" },
        { type: "Vorlage", name: "Häuser / Familien / Clans", slug: "haeuser-vorlage" },
      ],
      tags: ["haeuser", "familien", "clans", "adel", "vorlage"],
    },
    {
      id: "kleinehaeuser-vorlage",
      slug: "kleinehaeuser-vorlage",
      aliases: [
        "kleinehauser-vorlage",
        "kleine-haeuser-vorlage",
        "kleine-hauser-vorlage",
        "kleinehaeuser",
        "kleinehauser",
        "kleine-haeuser",
        "kleine-hauser",
        "kleine-clans-vorlage",
        "kleine-haeuser-clans-vorlage",
      ],
      name: "Kleineh\u00e4user-Vorlage",
      status: HOUSE_STATUS.TEMPLATE,
      type: HOUSE_TYPES.HOUSE,
      page: "kleinehaeuser.html",
      data: "data/kleinehaeuser-vorlage.data.js",
      inlineCollection: "familien_haeuser_und_clans_inline_content",
      sceneCollection: "familien_haeuser_und_clans_scenes",
      hierarchy: [
        { type: "Sammlung", name: "Familien H\u00e4user und Clans", slug: "familien-haeuser-und-clans" },
        { type: "Vorlage", name: "Kleine H\u00e4user / kleinere Clans", slug: "kleinehaeuser-vorlage" },
      ],
      tags: ["kleine-haeuser", "kleine-clans", "familien", "nebenlinien", "vorlage"],
    },
    {
      id: "haus-arwydd",
      slug: "haus-arwydd",
      aliases: [
        "arwydd",
        "haus-arwydd-o-castellbryn",
        "arwydd-o-castellbryn",
      ],
      name: "Haus Arwydd O'Castellbryn",
      status: HOUSE_STATUS.ACTIVE,
      type: HOUSE_TYPES.HOUSE,
      data: "data/haus-arwydd.data.js",
      inlineCollection: "familien_haeuser_und_clans_inline_content",
      sceneCollection: "familien_haeuser_und_clans_scenes",
      hierarchy: [
        { type: "Sammlung", name: "Familien Häuser und Clans", slug: "familien-haeuser-und-clans" },
        { type: "Königreich", name: "Cenyr", slug: "cenyr" },
        { type: "Grafschaft", name: "Celtigerns Wacht", slug: "celtigerns-wacht" },
        { type: "Baronie", name: "Rhonwens Tränen", slug: "rhonwens-traenen" },
        { type: "Sitz", name: "Castellbryn", slug: "castellbryn" },
      ],
      tags: ["arwydd", "castellbryn", "cenyr", "ritterfuerst", "haus"],
    },
    {
      id: "haus-chwedonl",
      slug: "haus-chwedonl",
      aliases: [
        "chwedonl",
        "haus_chwedonl",
        "haus-chwedonl",
      ],
      name: "Haus Chwedonl",
      status: HOUSE_STATUS.ACTIVE,
      type: HOUSE_TYPES.HOUSE,
      data: "data/haus-chwedonl.data.js",
      inlineCollection: "familien_haeuser_und_clans_inline_content",
      sceneCollection: "familien_haeuser_und_clans_scenes",
      hierarchy: [
        { type: "Sammlung", name: "Familien Häuser und Clans", slug: "familien-haeuser-und-clans" },
      ],
      tags: ["chwedonl", "haus"],
    },
  ].map(Object.freeze);

  function all() {
    return HOUSES;
  }

  function byId(id) {
    const normalizedId = normalizeId(id);
    return HOUSES.find((house) => {
      const aliases = [house.id, house.slug, ...(house.aliases || [])].map(normalizeId);
      return aliases.includes(normalizedId);
    }) || null;
  }

  function byStatus(status) {
    return HOUSES.filter((house) => house.status === status);
  }

  function linkFor(id) {
    const house = byId(id);
    return house ? `${house.page || "haus.html"}?haus=${encodeURIComponent(house.id)}` : `haus.html?haus=${encodeURIComponent(id)}`;
  }

  function normalizeId(value) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  window.HAEUSER_REGISTRY = Object.freeze(HOUSES);
  window.HaeuserRegistry = Object.freeze({
    statuses: HOUSE_STATUS,
    types: HOUSE_TYPES,
    all,
    byId,
    byStatus,
    linkFor,
  });
})();
