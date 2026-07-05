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
