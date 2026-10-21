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

  const SETTLEMENT_MAPS = Object.freeze([
    {
      slug: "lynthor",
      title: "Lynthor",
      mapPrefix: "cenyr-celtigerns-wacht-llamrais-ankunft-lynthor",
      folder: "Cenyr/celtigerns-wacht/llamrais-ankunft/lynthor-bannkreis",
      cityImage: "LynthorStadt.webp",
      regionNormal: "LynthorBannkreisNormal.webp",
      regionPins: "LynthorBannkreisMarker.webp",
    },
    {
      slug: "twr-rhewgorn",
      title: "Tŵr Rhewgorn",
      mapPrefix: "cenyr-celtigerns-wacht-llamrais-ankunft-twr-rhewgorn",
      folder: "Cenyr/celtigerns-wacht/llamrais-ankunft/twr-rhewgorn-bannkreis",
      cityImage: "TwrRhewgornStadt.webp",
      regionNormal: "TwrRhewgornBannkreisNormal.webp",
      regionPins: "TwrRhewgornBannkreisMarker.webp",
    },
    {
      slug: "craithglyn",
      title: "Craithglyn",
      mapPrefix: "cenyr-celtigerns-wacht-llamrais-ankunft-wyrm-craithglyn",
      folder: "Cenyr/celtigerns-wacht/llamrais-ankunft/herrschaft-der-wyrm/craithglyn-bannkreis",
      lordship: { slug: "herrschaft-der-wyrm", title: "Herrschaft der Wyrm" },
      rulingHouse: "Haus Wyrm",
      regionNormal: "CraithglynBannkreisNormal.webp",
      regionPins: "CraithglynBannkreisMarker.webp",
    },
    {
      slug: "mwyncreig",
      title: "Mwyncreig",
      mapPrefix: "cenyr-celtigerns-wacht-llamrais-ankunft-wyrm-mwyncreig",
      folder: "Cenyr/celtigerns-wacht/llamrais-ankunft/herrschaft-der-wyrm/mwyncreig-bannkreis",
      lordship: { slug: "herrschaft-der-wyrm", title: "Herrschaft der Wyrm" },
      rulingHouse: "Haus Wyrm",
      cityImage: "MwyncreigStadt.webp",
      regionNormal: "MwyncreigBannkreisNormal.webp",
      regionPins: "MwyncreigBannkreisMarker.webp",
    },
    {
      slug: "llysfaen",
      title: "Llysfaen",
      mapPrefix: "cenyr-celtigerns-wacht-llamrais-ankunft-wyrm-llysfaen",
      folder: "Cenyr/celtigerns-wacht/llamrais-ankunft/herrschaft-der-wyrm/llysfaen-bannkreis",
      lordship: { slug: "herrschaft-der-wyrm", title: "Herrschaft der Wyrm" },
      rulingHouse: "Haus Wyrm",
      cityImage: "LlysfaenStadt.webp",
      cityPins: "LlysfaenStadtMarker.webp",
      regionNormal: "LlysfaenBannkreisNormal.webp",
      regionPins: "LlysfaenBannkreisMarker.webp",
      cityLegacyLink: "Cenyr/celtigerns-wacht/llamrais-ankunft/herrschaft-der-wyrm/llysfaen-bannkreis/llysfaen/Llysfaens-Stadtkarte.html",
    },
    {
      slug: "bronhir",
      title: "Bronhir",
      mapPrefix: "cenyr-celtigerns-wacht-llamrais-ankunft-wyrm-bronhir",
      folder: "Cenyr/celtigerns-wacht/llamrais-ankunft/herrschaft-der-wyrm/bronhir-bannkreis",
      lordship: { slug: "herrschaft-der-wyrm", title: "Herrschaft der Wyrm" },
      rulingHouse: "Haus Wyrm",
      cityImage: "BronhirStadt.webp",
      regionNormal: "BronhirBannkreisNormal.webp",
      regionPins: "BronhirBannkreisMarker.webp",
    },
    {
      slug: "abergwint",
      title: "Abergwint",
      mapPrefix: "cenyr-celtigerns-wacht-gwendolyns-ufer-abergwint",
      folder: "Cenyr/celtigerns-wacht/gwendolyns-ufer/abergwint-bannkreis",
      baseHierarchy: [
        { level: "kingdom", slug: "cenyr", title: "Cenyr" },
        { level: "county", slug: "celtigerns-wacht", title: "Celtigerns Wacht" },
        { level: "barony", slug: "gwendolyns-ufer", title: "Gwendolyns Ufer" },
      ],
      rulingHouse: "Haus Gwyvern",
      cityImage: "AbergwintStadt.webp",
      regionNormal: "AbergwintBannkreisNormal.webp",
      regionRegions: "AbergwintBannkreisZonen.webp",
      regionPins: "AbergwintBannkreisMarker.webp",
    },
    {
      slug: "castellbryn",
      title: "Castellbryn",
      mapPrefix: "cenyr-celtigerns-wacht-rhonwens-traenen-castellbryn",
      folder: "Cenyr/celtigerns-wacht/rhonwens-traenen/castellbryn-bannkreis",
      baseHierarchy: [
        { level: "kingdom", slug: "cenyr", title: "Cenyr" },
        { level: "county", slug: "celtigerns-wacht", title: "Celtigerns Wacht" },
        { level: "lordship", slug: "rhonwens-traenen", title: "Rhonwens Tränen" },
      ],
      rulingHouse: "Haus Arwydd",
      regionNormal: "CastellbrynBannkreisNormal.webp",
      regionRegions: "CastellbrynBannkreisZonen.webp",
      regionPins: "CastellbrynBannkreisMarker.webp",
      regionLayerName: "Zonen",
    },
    {
      slug: "rhosmere",
      title: "Rhosmere",
      mapPrefix: "cenyr-celtigerns-wacht-arthus-streben-rhosmere",
      folder: "Cenyr/celtigerns-wacht/arthus-streben/rhosmere-bannkreis",
      baseHierarchy: [
        { level: "kingdom", slug: "cenyr", title: "Cenyr" },
        { level: "county", slug: "celtigerns-wacht", title: "Celtigerns Wacht" },
        { level: "barony", slug: "arthus-streben", title: "Arthus Streben" },
      ],
      rulingHouse: "Haus Gwefrydd",
      regionNormal: "RhosmereBannkreisNormal.webp",
      regionRegions: "RhosmereBannkreisZonen.webp",
      regionPins: "RhosmereBannkreisMarker.webp",
      regionLayerName: "Zonen",
    },
  ]);

  function createSettlementMaps(place) {
    const baseHierarchy = place.baseHierarchy || [
      { level: "kingdom", slug: "cenyr", title: "Cenyr" },
      { level: "county", slug: "celtigerns-wacht", title: "Celtigerns Wacht" },
      { level: "barony", slug: "llamrais-ankunft", title: "Llamreis Ankunft" },
      ...(place.lordship ? [{ level: "lordship", ...place.lordship }] : []),
    ];
    const regionHierarchy = [
      ...baseHierarchy,
      { level: "region", slug: `${place.slug}-bannkreis`, title: `${place.title} – Bannkreis` },
    ];
    const cityFolder = `${place.folder}/${place.slug}`;
    const cityId = `${place.mapPrefix}-stadtkarte`;
    const regionId = `${place.mapPrefix}-bannkreis`;

    const maps = [];

    if (place.cityImage) {
      maps.push({
        id: cityId,
        title: `${place.title} – Stadtkarte`,
        status: MAP_STATUS.ACTIVE,
        type: MAP_TYPES.LOCAL,
        hierarchy: [
          ...regionHierarchy,
          { level: "settlement", slug: place.slug, title: place.title },
        ],
        folder: cityFolder,
        images: {
          normal: `${cityFolder}/Kartenbilder/${place.cityImage}`,
          ...(place.cityPins ? { pins: `${cityFolder}/Kartenbilder/${place.cityPins}` } : {}),
        },
        layerNames: {
          normal: "Stadtkarte",
          regions: "Regionen",
          pins: "Markierungen",
        },
        dataPath: `${cityFolder}/data.json`,
        link: `karte.html?map=${cityId}`,
        ...(place.rulingHouse ? { rulingHouse: place.rulingHouse } : {}),
        ...(place.cityLegacyLink ? { legacyLink: place.cityLegacyLink } : {}),
      });
    }

    if (place.regionNormal) {
      maps.push({
        id: regionId,
        title: `${place.title} – Bannkreis`,
        status: MAP_STATUS.ACTIVE,
        type: MAP_TYPES.REGION,
        hierarchy: regionHierarchy,
        folder: place.folder,
        images: {
          normal: `${place.folder}/Kartenbilder/${place.regionNormal}`,
          ...(place.regionRegions ? { regions: `${place.folder}/Kartenbilder/${place.regionRegions}` } : {}),
          ...(place.regionPins ? { pins: `${place.folder}/Kartenbilder/${place.regionPins}` } : {}),
        },
        layerNames: {
          normal: "Normal",
          regions: place.regionLayerName || "Regionen",
          pins: "Markierungen",
        },
        dataPath: `${place.folder}/data.json`,
        link: `karte.html?map=${regionId}`,
        ...(place.rulingHouse ? { rulingHouse: place.rulingHouse } : {}),
      });
    }

    return maps;
  }

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
      status: MAP_STATUS.ACTIVE,
      type: MAP_TYPES.COUNTY,
      hierarchy: [
        { level: "kingdom", slug: "cenyr", title: "Cenyr" },
        { level: "county", slug: "vortigerns-ruh", title: "Vortigerns Ruh" },
      ],
      folder: "Cenyr/vortigerns-ruh",
      config: "Cenyr/vortigerns-ruh/template.config.js",
      images: {
        normal: "Cenyr/vortigerns-ruh/Kartenbilder/normal.webp",
        regions: "Cenyr/vortigerns-ruh/Kartenbilder/regions.webp",
        pins: "Cenyr/vortigerns-ruh/Kartenbilder/pins.webp",
      },
      link: "karte.html?map=cenyr-vortigerns-ruh",
      dataPath: "Cenyr/vortigerns-ruh/data.json",
      rulingHouse: "Koenigliche Grafschaft des Hauses Pendrag",
      notes: "Drei Kartenebenen und 47 aus den gelieferten Koordinaten übernommene Ortsmarker.",
    },
    {
      id: "cenyr-tal-der-milane",
      title: "Tal der Milane",
      status: MAP_STATUS.ACTIVE,
      type: MAP_TYPES.COUNTY,
      hierarchy: [
        { level: "kingdom", slug: "cenyr", title: "Cenyr" },
        { level: "county", slug: "tal-der-milane", title: "Tal der Milane" },
      ],
      folder: "Cenyr/tal-der-milane",
      config: "Cenyr/tal-der-milane/template.config.js",
      images: {
        normal: "Cenyr/tal-der-milane/Kartenbilder/normal.webp",
        regions: "Cenyr/tal-der-milane/Kartenbilder/regions.webp",
        pins: "",
      },
      link: "karte.html?map=cenyr-tal-der-milane",
      dataPath: "Cenyr/tal-der-milane/data.json",
      rulingHouse: "Haus Aderyn",
      notes: "83 über Chrome erfasste Marker mit 78 vorhandenen Texten und dauerhaften Quell-IDs. Aktuelle Aleria-Symbole; alte Markierungskarte als zusätzliche Referenzebene.",
    },
    {
      id: "cenyr-sonnenkueste",
      title: "Sonnenküste",
      status: MAP_STATUS.ACTIVE,
      type: MAP_TYPES.COUNTY,
      hierarchy: [
        { level: "kingdom", slug: "cenyr", title: "Cenyr" },
        { level: "county", slug: "sonnenkueste", title: "Sonnenküste" },
      ],
      folder: "Cenyr/sonnenkueste",
      config: "Cenyr/sonnenkueste/template.config.js",
      images: {
        normal: "Cenyr/sonnenkueste/Kartenbilder/normal.webp",
        regions: "Cenyr/sonnenkueste/Kartenbilder/regions.webp",
        pins: "Cenyr/sonnenkueste/Kartenbilder/pins.webp",
      },
      link: "karte.html?map=cenyr-sonnenkueste",
      dataPath: "Cenyr/sonnenkueste/data.json",
      rulingHouse: "Haus Illewod",
      notes: "Drei Kartenebenen, 68 Ortsmarker und 56 übernommene Ortsbeschreibungen.",
    },
    {
      id: "cenyr-graue-weite",
      title: "Graue Weite",
      status: MAP_STATUS.ACTIVE,
      type: MAP_TYPES.COUNTY,
      hierarchy: [
        { level: "kingdom", slug: "cenyr", title: "Cenyr" },
        { level: "county", slug: "graue-weite", title: "Graue Weite" },
      ],
      folder: "Cenyr/graue-weite",
      config: "Cenyr/graue-weite/template.config.js",
      images: {
        normal: "Cenyr/graue-weite/Kartenbilder/normal.webp",
        regions: "Cenyr/graue-weite/Kartenbilder/regions.webp",
        pins: "",
      },
      link: "karte.html?map=cenyr-graue-weite",
      dataPath: "Cenyr/graue-weite/data.json",
      rulingHouse: "Haus Pysgod",
      notes: "102 über Chrome erfasste Marker mit vollständigen Texten und dauerhaften Quell-IDs. Aktuelle Aleria-Symbole; alte Markierungskarte als zusätzliche Referenzebene.",
    },
    {
      id: "cenyr-weidebucht",
      title: "Weidebucht",
      status: MAP_STATUS.ACTIVE,
      type: MAP_TYPES.COUNTY,
      hierarchy: [
        { level: "kingdom", slug: "cenyr", title: "Cenyr" },
        { level: "county", slug: "weidebucht", title: "Weidebucht" },
      ],
      folder: "Cenyr/weidebucht",
      config: "Cenyr/weidebucht/template.config.js",
      images: {
        normal: "Cenyr/weidebucht/Kartenbilder/normal.webp",
        regions: "Cenyr/weidebucht/Kartenbilder/regions.webp",
        pins: "Cenyr/weidebucht/Kartenbilder/pins.webp",
      },
      link: "karte.html?map=cenyr-weidebucht",
      dataPath: "Cenyr/weidebucht/data.json",
      rulingHouse: "Haus Wylan",
      notes: "Drei Kartenebenen, 81 Ortsmarker und 76 übernommene Ortsbeschreibungen; Erims Hof mit gemeinsamer Verwaltung.",
    },
    {
      id: "cenyr-aehrental",
      title: "Ährental",
      status: MAP_STATUS.ACTIVE,
      type: MAP_TYPES.COUNTY,
      hierarchy: [
        { level: "kingdom", slug: "cenyr", title: "Cenyr" },
        { level: "county", slug: "aehrental", title: "Ährental" },
      ],
      folder: "Cenyr/aehrental",
      config: "Cenyr/aehrental/template.config.js",
      images: {
        normal: "Cenyr/aehrental/Kartenbilder/normal.webp",
        regions: "Cenyr/aehrental/Kartenbilder/regions.webp",
        pins: "Cenyr/aehrental/Kartenbilder/pins.webp",
      },
      link: "karte.html?map=cenyr-aehrental",
      dataPath: "Cenyr/aehrental/data.json",
      rulingHouse: "Haus Grawn",
      notes: "Drei Kartenebenen, 61 Ortsmarker und 60 Ortsbeschreibungen; Teyrngarch-Exklaven bestätigt.",
    },
    {
      id: "cenyr-silberinsel",
      title: "Silberinsel",
      status: MAP_STATUS.ACTIVE,
      type: MAP_TYPES.COUNTY,
      hierarchy: [
        { level: "kingdom", slug: "cenyr", title: "Cenyr" },
        { level: "county", slug: "silberinsel", title: "Silberinsel" },
      ],
      folder: "Cenyr/silberinsel",
      config: "Cenyr/silberinsel/template.config.js",
      images: {
        normal: "Cenyr/silberinsel/Kartenbilder/normal.webp",
        regions: "Cenyr/silberinsel/Kartenbilder/regions.webp",
        pins: "Cenyr/silberinsel/Kartenbilder/pins.webp",
      },
      link: "karte.html?map=cenyr-silberinsel",
      dataPath: "Cenyr/silberinsel/data.json",
      rulingHouse: "Haus Neidr",
      notes: "Drei Kartenebenen, 32 Ortsmarker und 29 übernommene Ortsbeschreibungen; vier weitere Höhlen ohne überlieferte Position im Ortsregister.",
    },
    {
      id: "cenyr-klaueninseln",
      title: "Klaueninseln",
      status: MAP_STATUS.ACTIVE,
      type: MAP_TYPES.COUNTY,
      hierarchy: [
        { level: "kingdom", slug: "cenyr", title: "Cenyr" },
        { level: "county", slug: "klaueninseln", title: "Klaueninseln" },
      ],
      folder: "Cenyr/klaueninseln",
      config: "Cenyr/klaueninseln/template.config.js",
      images: {
        normal: "Cenyr/klaueninseln/Kartenbilder/normal.webp",
        regions: "Cenyr/klaueninseln/Kartenbilder/regions.webp",
        pins: "Cenyr/klaueninseln/Kartenbilder/pins.webp",
      },
      link: "karte.html?map=cenyr-klaueninseln",
      dataPath: "Cenyr/klaueninseln/data.json",
      rulingHouse: "Haus Arth",
      notes: "Drei lokal gelieferte Kartenebenen und 46 über Chrome erfasste Marker mit vollständigen Texten und dauerhaften World-Anvil-Quell-IDs.",
    },
    {
      id: "aldrimar-roriksheim",
      title: "Jarltum Roriksheim",
      status: MAP_STATUS.ACTIVE,
      type: MAP_TYPES.COUNTY,
      hierarchy: [
        { level: "kingdom", slug: "aldrimar", title: "Aldrimar" },
        { level: "county", slug: "roriksheim", title: "Roriksheim" },
      ],
      folder: "Aldrimar/roriksheim",
      config: "Aldrimar/roriksheim/template.config.js",
      images: {
        normal: "Aldrimar/roriksheim/Kartenbilder/normal.webp",
        regions: "Aldrimar/roriksheim/Kartenbilder/regions.webp",
        pins: "",
      },
      link: "karte.html?map=aldrimar-roriksheim",
      dataPath: "Aldrimar/roriksheim/data.json",
      rulingHouse: "Clan Varulv",
      notes: "168 Marker auf den drei neuen Kartenbildern; World-Anvil-Quellkennungen, überarbeitete Ortszuordnungen und Schwarzdorn-Exklaven erhalten.",
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
        normal: "Cenyr/celtigerns-wacht/llamrais-ankunft/gwynthor-bannkreis/Kartenbilder/GwynthorBannkreis.jpg",
        regions: "Cenyr/celtigerns-wacht/llamrais-ankunft/gwynthor-bannkreis/Kartenbilder/GwynthorBannkreisZonen.webp",
        pins: "Cenyr/celtigerns-wacht/llamrais-ankunft/gwynthor-bannkreis/Kartenbilder/GwynthorBannkreisMarker.webp",
      },
      dataPath: "Cenyr/celtigerns-wacht/llamrais-ankunft/gwynthor-bannkreis/data.json",
      link: "karte.html?map=cenyr-celtigerns-wacht-llamrais-ankunft-gwynthor-bannkreis",
      rulingHouse: "Haus Draig",
    },
    ...SETTLEMENT_MAPS.flatMap(createSettlementMaps),
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
