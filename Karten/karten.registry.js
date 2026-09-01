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
      dataPath: "Cenyr/celtigerns-wacht/data.json",
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
      dataPath: "Cenyr/vortigerns-ruh/data.json",
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
      dataPath: "Cenyr/tal-der-milane/data.json",
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
      dataPath: "Cenyr/sonnenkueste/data.json",
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
      dataPath: "Cenyr/graue-weite/data.json",
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
      dataPath: "Cenyr/weidebucht/data.json",
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
      dataPath: "Cenyr/aehrental/data.json",
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
      dataPath: "Cenyr/silberinsel/data.json",
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
      dataPath: "Cenyr/klaueninseln/data.json",
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
    {
      id: "cenyr-celtigerns-wacht-llamrais-ankunft-gwynthor-bannkreis",
      title: "Gwynthor – Bannkreis",
      status: MAP_STATUS.ACTIVE,
      type: MAP_TYPES.REGION,
      hierarchy: [
        { level: "kingdom", slug: "cenyr", title: "Cenyr" },
        { level: "county", slug: "celtigerns-wacht", title: "Celtigerns Wacht" },
        { level: "barony", slug: "llamrais-ankunft", title: "Llamreis Ankunft" },
        { level: "region", slug: "gwynthor-bannkreis", title: "Gwynthors Bannkreis" },
      ],
      folder: "Cenyr/celtigerns-wacht/llamrais-ankunft/gwynthor-bannkreis",
      config: "Cenyr/celtigerns-wacht/llamrais-ankunft/gwynthor-bannkreis/template.config.js",
      images: {
        normal: "Cenyr/celtigerns-wacht/llamrais-ankunft/gwynthor-bannkreis/Kartenbilder/GwynthorBannkreis.png",
        regions: "Cenyr/celtigerns-wacht/llamrais-ankunft/gwynthor-bannkreis/Kartenbilder/GwynthorBannkreisZonen.png",
        pins: "Cenyr/celtigerns-wacht/llamrais-ankunft/gwynthor-bannkreis/Kartenbilder/GwynthorBannkreisMarker.png",
      },
      dataPath: "Cenyr/celtigerns-wacht/llamrais-ankunft/gwynthor-bannkreis/data.json",
      link: "karte.html?map=cenyr-celtigerns-wacht-llamrais-ankunft-gwynthor-bannkreis",
      rulingHouse: "Haus Draig",
    },
    {
      id: "cenyr-celtigerns-wacht-llamrais-ankunft-wyrm-llysfaen-stadtkarte",
      title: "Llysfaens Stadtkarte",
      status: MAP_STATUS.ACTIVE,
      type: MAP_TYPES.LOCAL,
      hierarchy: [
        { level: "kingdom", slug: "cenyr", title: "Cenyr" },
        { level: "county", slug: "celtigerns-wacht", title: "Celtigerns Wacht" },
        { level: "barony", slug: "llamrais-ankunft", title: "Llamrais Ankunft" },
        { level: "lordship", slug: "herrschaft-der-wyrm", title: "Herrschaft der Wyrm" },
        { level: "region", slug: "llysfaen-bannkreis", title: "Llysfaen Bannkreis" },
        { level: "settlement", slug: "llysfaen", title: "Llysfaen" },
      ],
      folder: "Cenyr/celtigerns-wacht/llamrais-ankunft/herrschaft-der-wyrm/llysfaen-bannkreis/llysfaen",
      config: "Cenyr/celtigerns-wacht/llamrais-ankunft/herrschaft-der-wyrm/llysfaen-bannkreis/llysfaen/template.config.js",
      images: {},
      dataPath: "Cenyr/celtigerns-wacht/llamrais-ankunft/herrschaft-der-wyrm/llysfaen-bannkreis/llysfaen/data.json",
      link: "karte.html?map=cenyr-celtigerns-wacht-llamrais-ankunft-wyrm-llysfaen-stadtkarte",
      legacyLink: "Cenyr/celtigerns-wacht/llamrais-ankunft/herrschaft-der-wyrm/llysfaen-bannkreis/llysfaen/Llysfaens-Stadtkarte.html",
      editableDraft: true,
      notes: "Konkrete Stadtkarte fuer Llysfaen. Kartenbilder koennen im Editor als Bildlinks hinterlegt werden.",
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
