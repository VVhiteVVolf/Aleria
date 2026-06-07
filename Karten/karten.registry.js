(() => {
  const MAP_STATUS = Object.freeze({
    ACTIVE: "active",
    PLANNED: "planned",
    ARCHIVED: "archived",
  });

  const MAP_TYPES = Object.freeze({
    KINGDOM: "kingdom",
    COUNTY: "county",
    BARONY: "barony",
    CITY: "city",
    REGION: "region",
    LOCAL: "local",
  });

  const MAPS = [
    {
      id: "cenyr",
      title: "Cenyr",
      status: MAP_STATUS.PLANNED,
      type: MAP_TYPES.KINGDOM,
      hierarchy: [
        { level: "kingdom", slug: "cenyr", title: "Cenyr" },
      ],
      link: "karte.html?map=cenyr",
      notes: "Geplanter Koenigreich-Link. Kartenordner und Bilder werden erst angelegt, wenn die Karte wirklich entsteht.",
    },
    {
      id: "cenyr-celtigerns-wacht",
      title: "Celtigerns Wacht",
      status: MAP_STATUS.ACTIVE,
      type: MAP_TYPES.COUNTY,
      hierarchy: [
        { level: "kingdom", slug: "cenyr", title: "Cenyr" },
        { level: "county", slug: "celtigerns-wacht", title: "Celtigerns Wacht" },
      ],
      folder: "Cenyr/celtigerns-wacht",
      config: "Cenyr/celtigerns-wacht/template.config.js",
      images: {
        normal: "Cenyr/celtigerns-wacht/Kartenbilder/CeltigernsWacht.png",
        regions: "Cenyr/celtigerns-wacht/Kartenbilder/CeltigernsWachtRegionen.png",
        pins: "Cenyr/celtigerns-wacht/Kartenbilder/CeltigernsWachtMarker.png",
      },
      firebase: {
        collection: "karten",
        docId: "cenyr-celtigerns-wacht",
      },
      link: "karte.html?map=cenyr-celtigerns-wacht",
      legacyLink: "Cenyr/celtigerns-wacht/CeltigernsWachtKarte.html",
      rulingHouse: "Haus Draig",
      reference: true,
    },
    {
      id: "cenyr-vortigerns-ruh",
      title: "Vortigerns Ruh",
      status: MAP_STATUS.PLANNED,
      type: MAP_TYPES.COUNTY,
      hierarchy: [
        { level: "kingdom", slug: "cenyr", title: "Cenyr" },
        { level: "county", slug: "vortigerns-ruh", title: "Vortigerns Ruh" },
      ],
      folder: "Cenyr/vortigerns-ruh",
      link: "karte.html?map=cenyr-vortigerns-ruh",
      firebase: {
        collection: "karten",
        docId: "cenyr-vortigerns-ruh",
      },
      rulingHouse: "Koenigliche Grafschaft des Hauses Pendrag",
      editableDraft: true,
      notes: "Geplante Grafschaftskarte. Bilder/Config werden spaeter ergaenzt.",
    },
    {
      id: "cenyr-tal-der-milane",
      title: "Tal der Milane",
      status: MAP_STATUS.PLANNED,
      type: MAP_TYPES.COUNTY,
      hierarchy: [
        { level: "kingdom", slug: "cenyr", title: "Cenyr" },
        { level: "county", slug: "tal-der-milane", title: "Tal der Milane" },
      ],
      folder: "Cenyr/tal-der-milane",
      link: "karte.html?map=cenyr-tal-der-milane",
      firebase: {
        collection: "karten",
        docId: "cenyr-tal-der-milane",
      },
      rulingHouse: "Haus Aderyn",
      editableDraft: true,
      notes: "Geplante Grafschaftskarte. Bilder/Config werden spaeter ergaenzt.",
    },
    {
      id: "cenyr-sonnenkueste",
      title: "Sonnenkueste",
      status: MAP_STATUS.PLANNED,
      type: MAP_TYPES.COUNTY,
      hierarchy: [
        { level: "kingdom", slug: "cenyr", title: "Cenyr" },
        { level: "county", slug: "sonnenkueste", title: "Sonnenkueste" },
      ],
      folder: "Cenyr/sonnenkueste",
      link: "karte.html?map=cenyr-sonnenkueste",
      firebase: {
        collection: "karten",
        docId: "cenyr-sonnenkueste",
      },
      rulingHouse: "Haus Illewod",
      editableDraft: true,
      notes: "Geplante Grafschaftskarte. Bilder/Config werden spaeter ergaenzt.",
    },
    {
      id: "cenyr-graue-weite",
      title: "Graue Weite",
      status: MAP_STATUS.PLANNED,
      type: MAP_TYPES.COUNTY,
      hierarchy: [
        { level: "kingdom", slug: "cenyr", title: "Cenyr" },
        { level: "county", slug: "graue-weite", title: "Graue Weite" },
      ],
      folder: "Cenyr/graue-weite",
      link: "karte.html?map=cenyr-graue-weite",
      firebase: {
        collection: "karten",
        docId: "cenyr-graue-weite",
      },
      rulingHouse: "Haus Pysgod",
      editableDraft: true,
      notes: "Geplante Grafschaftskarte. Bilder/Config werden spaeter ergaenzt.",
    },
    {
      id: "cenyr-weidebucht",
      title: "Weidebucht",
      status: MAP_STATUS.PLANNED,
      type: MAP_TYPES.COUNTY,
      hierarchy: [
        { level: "kingdom", slug: "cenyr", title: "Cenyr" },
        { level: "county", slug: "weidebucht", title: "Weidebucht" },
      ],
      folder: "Cenyr/weidebucht",
      link: "karte.html?map=cenyr-weidebucht",
      firebase: {
        collection: "karten",
        docId: "cenyr-weidebucht",
      },
      rulingHouse: "Haus Wylan",
      editableDraft: true,
      notes: "Geplante Grafschaftskarte. Bilder/Config werden spaeter ergaenzt.",
    },
    {
      id: "cenyr-aehrental",
      title: "Aehrental",
      status: MAP_STATUS.PLANNED,
      type: MAP_TYPES.COUNTY,
      hierarchy: [
        { level: "kingdom", slug: "cenyr", title: "Cenyr" },
        { level: "county", slug: "aehrental", title: "Aehrental" },
      ],
      folder: "Cenyr/aehrental",
      link: "karte.html?map=cenyr-aehrental",
      firebase: {
        collection: "karten",
        docId: "cenyr-aehrental",
      },
      rulingHouse: "Haus Grawn",
      editableDraft: true,
      notes: "Geplante Grafschaftskarte. Bilder/Config werden spaeter ergaenzt.",
    },
    {
      id: "cenyr-silberinsel",
      title: "Silberinsel",
      status: MAP_STATUS.PLANNED,
      type: MAP_TYPES.COUNTY,
      hierarchy: [
        { level: "kingdom", slug: "cenyr", title: "Cenyr" },
        { level: "county", slug: "silberinsel", title: "Silberinsel" },
      ],
      folder: "Cenyr/silberinsel",
      link: "karte.html?map=cenyr-silberinsel",
      firebase: {
        collection: "karten",
        docId: "cenyr-silberinsel",
      },
      rulingHouse: "Haus Neidr",
      editableDraft: true,
      notes: "Geplante Grafschaftskarte. Bilder/Config werden spaeter ergaenzt.",
    },
    {
      id: "cenyr-klaueninseln",
      title: "Klaueninseln",
      status: MAP_STATUS.PLANNED,
      type: MAP_TYPES.COUNTY,
      hierarchy: [
        { level: "kingdom", slug: "cenyr", title: "Cenyr" },
        { level: "county", slug: "klaueninseln", title: "Klaueninseln" },
      ],
      folder: "Cenyr/klaueninseln",
      link: "karte.html?map=cenyr-klaueninseln",
      firebase: {
        collection: "karten",
        docId: "cenyr-klaueninseln",
      },
      rulingHouse: "Haus Arth",
      editableDraft: true,
      notes: "Geplante Grafschaftskarte. Bilder/Config werden spaeter ergaenzt.",
    },
    {
      id: "cenyr-celtigerns-wacht-gwendolyns-ufer",
      title: "Gwendolyns Ufer",
      status: MAP_STATUS.PLANNED,
      type: MAP_TYPES.BARONY,
      hierarchy: [
        { level: "kingdom", slug: "cenyr", title: "Cenyr" },
        { level: "county", slug: "celtigerns-wacht", title: "Celtigerns Wacht" },
        { level: "barony", slug: "gwendolyns-ufer", title: "Gwendolyns Ufer" },
      ],
      link: "karte.html?map=cenyr-celtigerns-wacht-gwendolyns-ufer",
      notes: "Geplanter Baronien-Link. Noch keine Kartenbilder und keine eigene Config.",
    },
    {
      id: "cenyr-celtigerns-wacht-gwendolyns-ufer-morddyn",
      title: "Morddyn",
      status: MAP_STATUS.PLANNED,
      type: MAP_TYPES.CITY,
      hierarchy: [
        { level: "kingdom", slug: "cenyr", title: "Cenyr" },
        { level: "county", slug: "celtigerns-wacht", title: "Celtigerns Wacht" },
        { level: "barony", slug: "gwendolyns-ufer", title: "Gwendolyns Ufer" },
        { level: "city", slug: "morddyn", title: "Morddyn" },
      ],
      link: "karte.html?map=cenyr-celtigerns-wacht-gwendolyns-ufer-morddyn",
      notes: "Geplanter Stadt-Link fuer die spaetere Morddyn-Ortsseite.",
    },
  ].map(Object.freeze);

  function all() {
    return MAPS;
  }

  function byId(id) {
    return MAPS.find(map => map.id === id) || null;
  }

  function byStatus(status) {
    return MAPS.filter(map => map.status === status);
  }

  function linkFor(id) {
    const map = byId(id);
    return map ? map.link : `karte.html?map=${encodeURIComponent(id)}`;
  }

  window.KARTO_MAP_REGISTRY = Object.freeze(MAPS);
  window.KartoMapRegistry = Object.freeze({
    statuses: MAP_STATUS,
    types: MAP_TYPES,
    all,
    byId,
    byStatus,
    linkFor,
  });
})();
