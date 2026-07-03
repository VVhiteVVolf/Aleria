(() => {
  "use strict";

  const GROUP_STATUS = Object.freeze({
    TEMPLATE: "template",
    DRAFT: "draft",
    ACTIVE: "active",
    ARCHIVED: "archived",
  });

  const GROUP_TYPES = Object.freeze({
    ORGANIZATION: "organization",
    GUILD: "guild",
    ORDER: "order",
    CULT: "cult",
    BANNER: "banner",
    TROOP: "troop",
    CELL: "cell",
  });

  const GROUPS = [
    {
      id: "gruppen-vorlage",
      slug: "gruppen-vorlage",
      aliases: [
        "organisationen-und-gruppen-vorlage",
        "gilden-orden-organisationen-kulte-vorlage",
      ],
      name: "Gruppen-Vorlage",
      status: GROUP_STATUS.TEMPLATE,
      type: GROUP_TYPES.ORGANIZATION,
      data: "data/gruppen-vorlage.data.js",
      inlineCollection: "organisationen_und_gruppen_inline_content",
      sceneCollection: "organisationen_und_gruppen_scenes",
      hierarchy: [
        { type: "Sammlung", name: "Organisationen und Gruppen", slug: "organisationen-und-gruppen" },
        { type: "Vorlage", name: "Gilden / Orden / Organisationen / Kulte", slug: "gruppen-vorlage" },
      ],
      tags: ["gruppen", "organisationen", "gilden", "orden", "kulte", "vorlage"],
    },
    {
      id: "kleingruppen-vorlage",
      slug: "kleingruppen-vorlage",
      aliases: [
        "untergruppen-vorlage",
        "kleine-gruppe-vorlage",
        "trupp-zelle-banner-vorlage",
      ],
      name: "Kleingruppen-Vorlage",
      status: GROUP_STATUS.TEMPLATE,
      type: GROUP_TYPES.TROOP,
      page: "kleingruppe.html",
      data: "data/kleingruppen-vorlage.data.js",
      inlineCollection: "organisationen_und_gruppen_inline_content",
      sceneCollection: "organisationen_und_gruppen_scenes",
      hierarchy: [
        { type: "Sammlung", name: "Organisationen und Gruppen", slug: "organisationen-und-gruppen" },
        { type: "Vorlage", name: "Kleine Gruppierungen / Trupps / Zellen", slug: "kleingruppen-vorlage" },
      ],
      tags: ["gruppen", "untergruppen", "trupps", "zellen", "banner", "vorlage"],
    },
  ].map(Object.freeze);

  function all() {
    return GROUPS;
  }

  function byId(id) {
    const normalizedId = normalizeId(id);
    return GROUPS.find((group) => {
      const aliases = [group.id, group.slug, ...(group.aliases || [])].map(normalizeId);
      return aliases.includes(normalizedId);
    }) || null;
  }

  function byStatus(status) {
    return GROUPS.filter((group) => group.status === status);
  }

  function linkFor(id) {
    const group = byId(id);
    return group ? `${group.page || "gruppe.html"}?gruppe=${encodeURIComponent(group.id)}` : `gruppe.html?gruppe=${encodeURIComponent(id)}`;
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

  window.GRUPPEN_REGISTRY = Object.freeze(GROUPS);
  window.GruppenRegistry = Object.freeze({
    statuses: GROUP_STATUS,
    types: GROUP_TYPES,
    all,
    byId,
    byStatus,
    linkFor,
  });
})();
