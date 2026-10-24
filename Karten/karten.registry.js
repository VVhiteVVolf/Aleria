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
    // BEGIN UATHNEACH_GENERATED
    {
      "id": "uathneach",
      "title": "Fürstentum Uathneach",
      "status": "active",
      "type": "region",
      "hierarchy": [
        {
          "level": "kingdom",
          "slug": "uathneach",
          "title": "Uathneach"
        }
      ],
      "folder": "Uathneach",
      "images": {
        "normal": "Uathneach/Kartenbilder/regionen.webp"
      },
      "dataPath": "Uathneach/data.json",
      "territoryHref": "/Kontinente/Estryll/Fürstentum Uathneach/Fürstentum Uathneach.html",
      "link": "karte.html?map=uathneach"
    },
    // END UATHNEACH_GENERATED
    // BEGIN FAELAORN_SKJAERHEIM_GENERATED
    {
      "id": "faelaorn-tir-na-rann",
      "title": "Tir na Rann · Land der Verse",
      "status": "active",
      "type": "region",
      "hierarchy": [
        {
          "level": "kingdom",
          "slug": "faelaorn",
          "title": "Faelaorn"
        },
        {
          "level": "region",
          "slug": "faelaorn-tir-na-rann",
          "title": "Tir na Rann · Land der Verse"
        }
      ],
      "folder": "Faelaorn/tir-na-rann",
      "images": {
        "normal": "Faelaorn/tir-na-rann/Kartenbilder/normal.webp",
        "regions": "Faelaorn/tir-na-rann/Kartenbilder/regions.webp"
      },
      "dataPath": "Faelaorn/tir-na-rann/data.json",
      "link": "karte.html?map=faelaorn-tir-na-rann"
    },
    {
      "id": "faelaorn-tir-na-mathgham",
      "title": "Tir na Mathgham · Land der Bären",
      "status": "active",
      "type": "region",
      "hierarchy": [
        {
          "level": "kingdom",
          "slug": "faelaorn",
          "title": "Faelaorn"
        },
        {
          "level": "region",
          "slug": "faelaorn-tir-na-mathgham",
          "title": "Tir na Mathgham · Land der Bären"
        }
      ],
      "folder": "Faelaorn/tir-na-mathgham",
      "images": {
        "normal": "Faelaorn/tir-na-mathgham/Kartenbilder/normal.webp",
        "regions": "Faelaorn/tir-na-mathgham/Kartenbilder/regions.webp"
      },
      "dataPath": "Faelaorn/tir-na-mathgham/data.json",
      "link": "karte.html?map=faelaorn-tir-na-mathgham"
    },
    {
      "id": "faelaorn-tir-na-braigh",
      "title": "Tir na Braigh · Land der Brandung",
      "status": "active",
      "type": "region",
      "hierarchy": [
        {
          "level": "kingdom",
          "slug": "faelaorn",
          "title": "Faelaorn"
        },
        {
          "level": "region",
          "slug": "faelaorn-tir-na-braigh",
          "title": "Tir na Braigh · Land der Brandung"
        }
      ],
      "folder": "Faelaorn/tir-na-braigh",
      "images": {
        "normal": "Faelaorn/tir-na-braigh/Kartenbilder/normal.webp",
        "regions": "Faelaorn/tir-na-braigh/Kartenbilder/regions.webp"
      },
      "dataPath": "Faelaorn/tir-na-braigh/data.json",
      "link": "karte.html?map=faelaorn-tir-na-braigh"
    },
    {
      "id": "faelaorn-tir-na-faerna",
      "title": "Tir na Faerna · Land der Herden",
      "status": "active",
      "type": "region",
      "hierarchy": [
        {
          "level": "kingdom",
          "slug": "faelaorn",
          "title": "Faelaorn"
        },
        {
          "level": "region",
          "slug": "faelaorn-tir-na-faerna",
          "title": "Tir na Faerna · Land der Herden"
        }
      ],
      "folder": "Faelaorn/tir-na-faerna",
      "images": {
        "normal": "Faelaorn/tir-na-faerna/Kartenbilder/normal.webp",
        "regions": "Faelaorn/tir-na-faerna/Kartenbilder/regions.webp"
      },
      "dataPath": "Faelaorn/tir-na-faerna/data.json",
      "link": "karte.html?map=faelaorn-tir-na-faerna"
    },
    {
      "id": "faelaorn-tir-na-damh",
      "title": "Tir na Damh · Land der Haine",
      "status": "active",
      "type": "region",
      "hierarchy": [
        {
          "level": "kingdom",
          "slug": "faelaorn",
          "title": "Faelaorn"
        },
        {
          "level": "region",
          "slug": "faelaorn-tir-na-damh",
          "title": "Tir na Damh · Land der Haine"
        }
      ],
      "folder": "Faelaorn/tir-na-damh",
      "images": {
        "normal": "Faelaorn/tir-na-damh/Kartenbilder/normal.webp",
        "regions": "Faelaorn/tir-na-damh/Kartenbilder/regions.webp"
      },
      "dataPath": "Faelaorn/tir-na-damh/data.json",
      "link": "karte.html?map=faelaorn-tir-na-damh"
    },
    {
      "id": "faelaorn-tir-na-brann",
      "title": "Tir na Brann · Land der Wälle",
      "status": "active",
      "type": "region",
      "hierarchy": [
        {
          "level": "kingdom",
          "slug": "faelaorn",
          "title": "Faelaorn"
        },
        {
          "level": "region",
          "slug": "faelaorn-tir-na-brann",
          "title": "Tir na Brann · Land der Wälle"
        }
      ],
      "folder": "Faelaorn/tir-na-brann",
      "images": {
        "normal": "Faelaorn/tir-na-brann/Kartenbilder/normal.webp",
        "regions": "Faelaorn/tir-na-brann/Kartenbilder/regions.webp"
      },
      "dataPath": "Faelaorn/tir-na-brann/data.json",
      "link": "karte.html?map=faelaorn-tir-na-brann"
    },
    {
      "id": "skjaerheim-hrothgar",
      "title": "Fürstliches Jarltum der Hrothgar",
      "status": "active",
      "type": "region",
      "hierarchy": [
        {
          "level": "kingdom",
          "slug": "skjaerheim",
          "title": "Skjaerheim"
        },
        {
          "level": "region",
          "slug": "skjaerheim-hrothgar",
          "title": "Fürstliches Jarltum der Hrothgar"
        }
      ],
      "folder": "Skjaerheim/hrothgar",
      "images": {
        "normal": "Faelaorn/tir-na-brann/Kartenbilder/normal.webp",
        "regions": "Skjaerheim/hrothgar/Kartenbilder/regions.webp"
      },
      "dataPath": "Skjaerheim/hrothgar/data.json",
      "link": "karte.html?map=skjaerheim-hrothgar"
    },
    {
      "id": "skjaerheim-bjerk",
      "title": "Jarltum der Bjerk",
      "status": "active",
      "type": "region",
      "hierarchy": [
        {
          "level": "kingdom",
          "slug": "skjaerheim",
          "title": "Skjaerheim"
        },
        {
          "level": "region",
          "slug": "skjaerheim-bjerk",
          "title": "Jarltum der Bjerk"
        }
      ],
      "folder": "Skjaerheim/bjerk",
      "images": {
        "normal": "Faelaorn/tir-na-faerna/Kartenbilder/normal.webp",
        "regions": "Skjaerheim/bjerk/Kartenbilder/regions.webp"
      },
      "dataPath": "Skjaerheim/bjerk/data.json",
      "link": "karte.html?map=skjaerheim-bjerk"
    },
    {
      "id": "skjaerheim-knything-stanleagh",
      "title": "Jarltümer der Knything und Stanleagh",
      "status": "active",
      "type": "region",
      "hierarchy": [
        {
          "level": "kingdom",
          "slug": "skjaerheim",
          "title": "Skjaerheim"
        },
        {
          "level": "region",
          "slug": "skjaerheim-knything-stanleagh",
          "title": "Jarltümer der Knything und Stanleagh"
        }
      ],
      "folder": "Skjaerheim/knything-stanleagh",
      "images": {
        "normal": "Faelaorn/tir-na-damh/Kartenbilder/normal.webp",
        "regions": "Skjaerheim/knything-stanleagh/Kartenbilder/regions.webp"
      },
      "dataPath": "Skjaerheim/knything-stanleagh/data.json",
      "link": "karte.html?map=skjaerheim-knything-stanleagh"
    },
    // END FAELAORN_SKJAERHEIM_GENERATED
    // BEGIN FJORDHEIM_GENERATED
    {
      "id": "fjordheim",
      "title": "Reiktum Fjordheim",
      "status": "active",
      "type": "kingdom",
      "hierarchy": [
        {
          "level": "kingdom",
          "slug": "fjordheim",
          "title": "Reiktum Fjordheim"
        }
      ],
      "folder": "Fjordheim",
      "images": {
        "normal": "Fjordheim/Kartenbilder/normal.webp"
      },
      "dataPath": "Fjordheim/data.json",
      "link": "karte.html?map=fjordheim"
    },
    // END FJORDHEIM_GENERATED
    // BEGIN VENNYR_GENERATED
    {
      "id": "vennyr",
      "title": "Königreich Vennyr",
      "status": "active",
      "type": "kingdom",
      "hierarchy": [
        {
          "level": "kingdom",
          "slug": "vennyr",
          "title": "Königreich Vennyr"
        }
      ],
      "folder": "Vennyr",
      "images": {
        "normal": "Vennyr/Kartenbilder/normal.webp"
      },
      "dataPath": "Vennyr/data.json",
      "link": "karte.html?map=vennyr"
    },
    // END VENNYR_GENERATED
    // BEGIN ALBISCHE_LANDE_GENERATED
    {
      "id": "aislearneach",
      "title": "Fürstentum Aislearneach",
      "status": "active",
      "type": "region",
      "markerPresentation": "symbols",
      "hierarchy": [
        {
          "level": "region",
          "slug": "aislearneach",
          "title": "Fürstentum Aislearneach"
        }
      ],
      "folder": "Aislearneach",
      "images": {
        "normal": "Aislearneach/Kartenbilder/normal.webp"
      },
      "dataPath": "Aislearneach/data.json",
      "link": "karte.html?map=aislearneach"
    },
    {
      "id": "aislearneach-tir-na-geach",
      "title": "Tir na Geach",
      "status": "active",
      "type": "region",
      "markerPresentation": "symbols",
      "hierarchy": [
        {
          "level": "region",
          "slug": "aislearneach",
          "title": "Fürstentum Aislearneach"
        },
        {
          "level": "region",
          "slug": "aislearneach-tir-na-geach",
          "title": "Tir na Geach"
        }
      ],
      "folder": "Aislearneach/tir-na-geach",
      "images": {
        "normal": "Aislearneach/tir-na-geach/Kartenbilder/normal.webp"
      },
      "dataPath": "Aislearneach/tir-na-geach/data.json",
      "link": "karte.html?map=aislearneach-tir-na-geach",
      "parentMapId": "aislearneach"
    },
    {
      "id": "aislearneach-tir-na-tirth",
      "title": "Tir na Tirth",
      "status": "active",
      "type": "region",
      "markerPresentation": "symbols",
      "hierarchy": [
        {
          "level": "region",
          "slug": "aislearneach",
          "title": "Fürstentum Aislearneach"
        },
        {
          "level": "region",
          "slug": "aislearneach-tir-na-tirth",
          "title": "Tir na Tirth"
        }
      ],
      "folder": "Aislearneach/tir-na-tirth",
      "images": {
        "normal": "Aislearneach/tir-na-tirth/Kartenbilder/normal.webp"
      },
      "dataPath": "Aislearneach/tir-na-tirth/data.json",
      "link": "karte.html?map=aislearneach-tir-na-tirth",
      "parentMapId": "aislearneach"
    },
    {
      "id": "aislearneach-tir-na-faela",
      "title": "Tir na Faela",
      "status": "active",
      "type": "region",
      "markerPresentation": "symbols",
      "hierarchy": [
        {
          "level": "region",
          "slug": "aislearneach",
          "title": "Fürstentum Aislearneach"
        },
        {
          "level": "region",
          "slug": "aislearneach-tir-na-faela",
          "title": "Tir na Faela"
        }
      ],
      "folder": "Aislearneach/tir-na-faela",
      "images": {
        "normal": "Aislearneach/tir-na-faela/Kartenbilder/normal.webp"
      },
      "dataPath": "Aislearneach/tir-na-faela/data.json",
      "link": "karte.html?map=aislearneach-tir-na-faela",
      "parentMapId": "aislearneach"
    },
    {
      "id": "aislearneach-tir-na-adharcach",
      "title": "Tir na Adharcach",
      "status": "active",
      "type": "region",
      "markerPresentation": "symbols",
      "hierarchy": [
        {
          "level": "region",
          "slug": "aislearneach",
          "title": "Fürstentum Aislearneach"
        },
        {
          "level": "region",
          "slug": "aislearneach-tir-na-adharcach",
          "title": "Tir na Adharcach"
        }
      ],
      "folder": "Aislearneach/tir-na-adharcach",
      "images": {
        "normal": "Aislearneach/tir-na-adharcach/Kartenbilder/normal.webp"
      },
      "dataPath": "Aislearneach/tir-na-adharcach/data.json",
      "link": "karte.html?map=aislearneach-tir-na-adharcach",
      "parentMapId": "aislearneach"
    },
    {
      "id": "aislearneach-tir-na-iomaire",
      "title": "Tir na Iomaire",
      "status": "active",
      "type": "region",
      "markerPresentation": "symbols",
      "hierarchy": [
        {
          "level": "region",
          "slug": "aislearneach",
          "title": "Fürstentum Aislearneach"
        },
        {
          "level": "region",
          "slug": "aislearneach-tir-na-iomaire",
          "title": "Tir na Iomaire"
        }
      ],
      "folder": "Aislearneach/tir-na-iomaire",
      "images": {
        "normal": "Aislearneach/tir-na-iomaire/Kartenbilder/normal.webp"
      },
      "dataPath": "Aislearneach/tir-na-iomaire/data.json",
      "link": "karte.html?map=aislearneach-tir-na-iomaire",
      "parentMapId": "aislearneach"
    },
    {
      "id": "blaithneach",
      "title": "Fürstentum Blaithneach",
      "status": "active",
      "type": "region",
      "markerPresentation": "symbols",
      "hierarchy": [
        {
          "level": "region",
          "slug": "blaithneach",
          "title": "Fürstentum Blaithneach"
        }
      ],
      "folder": "Blaithneach",
      "images": {
        "normal": "Blaithneach/Kartenbilder/normal.webp"
      },
      "dataPath": "Blaithneach/data.json",
      "link": "karte.html?map=blaithneach"
    },
    {
      "id": "ceitheach",
      "title": "Fürstentum Ceitheach",
      "status": "active",
      "type": "region",
      "markerPresentation": "symbols",
      "hierarchy": [
        {
          "level": "region",
          "slug": "ceitheach",
          "title": "Fürstentum Ceitheach"
        }
      ],
      "folder": "Ceitheach",
      "images": {
        "normal": "Ceitheach/Kartenbilder/normal.webp"
      },
      "dataPath": "Ceitheach/data.json",
      "link": "karte.html?map=ceitheach"
    },
    {
      "id": "dunkelhain",
      "title": "Der Dunkelhain",
      "status": "active",
      "type": "region",
      "markerPresentation": "symbols",
      "hierarchy": [
        {
          "level": "region",
          "slug": "dunkelhain",
          "title": "Der Dunkelhain"
        }
      ],
      "folder": "Dunkelhain",
      "images": {
        "normal": "Dunkelhain/Kartenbilder/normal.webp"
      },
      "dataPath": "Dunkelhain/data.json",
      "link": "karte.html?map=dunkelhain"
    },
    // END ALBISCHE_LANDE_GENERATED
    // BEGIN DUNFAL_GENERATED
    {
      "id": "dunfal",
      "title": "Fürstentum Dunfal",
      "status": "active",
      "type": "region",
      "markerPresentation": "symbols",
      "hierarchy": [
        {
          "level": "region",
          "slug": "dunfal",
          "title": "Fürstentum Dunfal"
        }
      ],
      "folder": "Dunfal",
      "images": {
        "normal": "Dunfal/Kartenbilder/normal.webp"
      },
      "dataPath": "Dunfal/data.json",
      "link": "karte.html?map=dunfal"
    },
    // END DUNFAL_GENERATED
    // BEGIN LEITHEACH_GENERATED
    {
      "id": "leitheach",
      "title": "Fürstentum Leitheach",
      "status": "active",
      "type": "region",
      "markerPresentation": "symbols",
      "hierarchy": [
        {
          "level": "region",
          "slug": "leitheach",
          "title": "Fürstentum Leitheach"
        }
      ],
      "folder": "Leitheach",
      "images": {
        "normal": "Leitheach/Kartenbilder/normal.webp"
      },
      "dataPath": "Leitheach/data.json",
      "link": "karte.html?map=leitheach",
      "territoryHref": "/Kontinente/Estryll/Fürstentum Leitheach/Fürstentum Leitheach.html"
    },
    {
      "id": "leitheach-tir-na-sleagh",
      "title": "Tir na Sleagh",
      "status": "active",
      "type": "region",
      "markerPresentation": "symbols",
      "hierarchy": [
        {
          "level": "region",
          "slug": "leitheach",
          "title": "Fürstentum Leitheach"
        },
        {
          "level": "region",
          "slug": "tir-na-sleagh",
          "title": "Tir na Sleagh"
        }
      ],
      "folder": "Leitheach/tir-na-sleagh",
      "images": {
        "normal": "Leitheach/tir-na-sleagh/Kartenbilder/normal.webp"
      },
      "dataPath": "Leitheach/tir-na-sleagh/data.json",
      "link": "karte.html?map=leitheach-tir-na-sleagh",
      "territoryHref": "/Kontinente/Estryll/Fürstentum Leitheach/Tir na Sleagh/Tir na Sleagh.html",
      "parentMapId": "leitheach"
    },
    {
      "id": "leitheach-tir-na-sinsear",
      "title": "Tir na Sinsear",
      "status": "active",
      "type": "region",
      "markerPresentation": "symbols",
      "hierarchy": [
        {
          "level": "region",
          "slug": "leitheach",
          "title": "Fürstentum Leitheach"
        },
        {
          "level": "region",
          "slug": "tir-na-sinsear",
          "title": "Tir na Sinsear"
        }
      ],
      "folder": "Leitheach/tir-na-sinsear",
      "images": {
        "normal": "Leitheach/tir-na-sinsear/Kartenbilder/normal.webp"
      },
      "dataPath": "Leitheach/tir-na-sinsear/data.json",
      "link": "karte.html?map=leitheach-tir-na-sinsear",
      "territoryHref": "/Kontinente/Estryll/Fürstentum Leitheach/Tir na Sinsear/Tir na Sinsear.html",
      "parentMapId": "leitheach"
    },
    {
      "id": "leitheach-tir-na-gortanna",
      "title": "Tir na Gortanna",
      "status": "active",
      "type": "region",
      "markerPresentation": "symbols",
      "hierarchy": [
        {
          "level": "region",
          "slug": "leitheach",
          "title": "Fürstentum Leitheach"
        },
        {
          "level": "region",
          "slug": "tir-na-gortanna",
          "title": "Tir na Gortanna"
        }
      ],
      "folder": "Leitheach/tir-na-gortanna",
      "images": {
        "normal": "Leitheach/tir-na-gortanna/Kartenbilder/normal.webp"
      },
      "dataPath": "Leitheach/tir-na-gortanna/data.json",
      "link": "karte.html?map=leitheach-tir-na-gortanna",
      "territoryHref": "/Kontinente/Estryll/Fürstentum Leitheach/Tir na Gortanna/Tir na Gortanna.html",
      "parentMapId": "leitheach"
    },
    {
      "id": "leitheach-tir-na-tonn",
      "title": "Tir na Tonn",
      "status": "active",
      "type": "region",
      "markerPresentation": "symbols",
      "hierarchy": [
        {
          "level": "region",
          "slug": "leitheach",
          "title": "Fürstentum Leitheach"
        },
        {
          "level": "region",
          "slug": "tir-na-tonn",
          "title": "Tir na Tonn"
        }
      ],
      "folder": "Leitheach/tir-na-tonn",
      "images": {
        "normal": "Leitheach/tir-na-tonn/Kartenbilder/normal.webp"
      },
      "dataPath": "Leitheach/tir-na-tonn/data.json",
      "link": "karte.html?map=leitheach-tir-na-tonn",
      "territoryHref": "/Kontinente/Estryll/Fürstentum Leitheach/Tir na Tonn/Tir na Tonn.html",
      "parentMapId": "leitheach"
    },
    {
      "id": "leitheach-tir-na-comhchuibhis",
      "title": "Tir an Comhchuibhis",
      "status": "active",
      "type": "region",
      "markerPresentation": "symbols",
      "hierarchy": [
        {
          "level": "region",
          "slug": "leitheach",
          "title": "Fürstentum Leitheach"
        },
        {
          "level": "region",
          "slug": "tir-na-comhchuibhis",
          "title": "Tir an Comhchuibhis"
        }
      ],
      "folder": "Leitheach/tir-na-comhchuibhis",
      "images": {
        "normal": "Leitheach/tir-na-comhchuibhis/Kartenbilder/normal.webp"
      },
      "dataPath": "Leitheach/tir-na-comhchuibhis/data.json",
      "link": "karte.html?map=leitheach-tir-na-comhchuibhis",
      "territoryHref": "/Kontinente/Estryll/Fürstentum Leitheach/Tir an Comhchuibhis/Tir an Comhchuibhis.html",
      "parentMapId": "leitheach"
    },
    {
      "id": "leitheach-tir-na-sruth",
      "title": "Tir na Sruth",
      "status": "active",
      "type": "region",
      "markerPresentation": "symbols",
      "hierarchy": [
        {
          "level": "region",
          "slug": "leitheach",
          "title": "Fürstentum Leitheach"
        },
        {
          "level": "region",
          "slug": "tir-na-sruth",
          "title": "Tir na Sruth"
        }
      ],
      "folder": "Leitheach/tir-na-sruth",
      "images": {
        "normal": "Leitheach/tir-na-sruth/Kartenbilder/normal.webp"
      },
      "dataPath": "Leitheach/tir-na-sruth/data.json",
      "link": "karte.html?map=leitheach-tir-na-sruth",
      "territoryHref": "/Kontinente/Estryll/Fürstentum Leitheach/Tir na Sruth/Tir na Sruth.html",
      "parentMapId": "leitheach"
    },
    // END LEITHEACH_GENERATED
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
        id: "aldrimar-heldenwacht",
        title: "Jarltum Heldenwacht",
        status: MAP_STATUS.ACTIVE,
        type: MAP_TYPES.COUNTY,
        hierarchy: [
          { level: "kingdom", slug: "aldrimar", title: "Aldrimar" },
          { level: "county", slug: "heldenwacht", title: "Heldenwacht" },
        ],
        folder: "Aldrimar/heldenwacht",
        config: "Aldrimar/heldenwacht/template.config.js",
        images: {
          normal: "Aldrimar/heldenwacht/Kartenbilder/normal.webp",
          regions: "Aldrimar/heldenwacht/Kartenbilder/regions.webp",
          pins: "",
        },
        link: "karte.html?map=aldrimar-heldenwacht",
        dataPath: "Aldrimar/heldenwacht/data.json",
        rulingHouse: "Clan Vaeren",
        notes: "147 Ortsmarker, drei neue Karten und 16 verschachtelte Gebietsseiten; 147 World-Anvil-Quellen vollständig archiviert.",
      },
      {
        id: "aldrimar-kraehenmoor",
        title: "Jarltum Krähenmoor",
        status: MAP_STATUS.ACTIVE,
        type: MAP_TYPES.COUNTY,
        hierarchy: [
          { level: "kingdom", slug: "aldrimar", title: "Aldrimar" },
          { level: "county", slug: "kraehenmoor", title: "Krähenmoor" },
        ],
        folder: "Aldrimar/kraehenmoor",
        config: "Aldrimar/kraehenmoor/template.config.js",
        images: {
          normal: "Aldrimar/kraehenmoor/Kartenbilder/normal.webp",
          regions: "Aldrimar/kraehenmoor/Kartenbilder/regions.webp",
          pins: "",
        },
        link: "karte.html?map=aldrimar-kraehenmoor",
        dataPath: "Aldrimar/kraehenmoor/data.json",
        rulingHouse: "Clan Varangr",
        notes: "113 Ortsmarker aus 126 erfassten World-Anvil-Einträgen; drei neue Karten, verschachtelte Herrschaften und getrennte Verwaltungsbereiche der Schimmerküste.",
      },
      {
        id: "aldrimar-schwarzfenn",
        title: "Jarltum Schwarzfenn",
        status: MAP_STATUS.ACTIVE,
        type: MAP_TYPES.COUNTY,
        hierarchy: [
          { level: "kingdom", slug: "aldrimar", title: "Aldrimar" },
          { level: "county", slug: "schwarzfenn", title: "Schwarzfenn" },
        ],
        folder: "Aldrimar/schwarzfenn",
        config: "Aldrimar/schwarzfenn/template.config.js",
        images: {
          normal: "Aldrimar/schwarzfenn/Kartenbilder/normal.webp",
          regions: "Aldrimar/schwarzfenn/Kartenbilder/regions.webp",
          pins: "",
        },
        link: "karte.html?map=aldrimar-schwarzfenn",
        dataPath: "Aldrimar/schwarzfenn/data.json",
        rulingHouse: "Clan Ragnulf",
        notes: "Drei neue Karten; 121 direkt erfasste World-Anvil-Quellen, geprüfte Ortsverschiebungen und gesonderte Pacht- und Banditengebiete.",
      },
      {
        id: "aldrimar-ivarsheim",
      title: "Jarltum Ivarsheim",
      status: MAP_STATUS.ACTIVE,
      type: MAP_TYPES.COUNTY,
      hierarchy: [
        { level: "kingdom", slug: "aldrimar", title: "Aldrimar" },
        { level: "county", slug: "ivarsheim", title: "Ivarsheim" },
      ],
      folder: "Aldrimar/ivarsheim",
      config: "Aldrimar/ivarsheim/template.config.js",
      images: {
        normal: "Aldrimar/ivarsheim/Kartenbilder/normal.webp",
        regions: "Aldrimar/ivarsheim/Kartenbilder/regions.webp",
        pins: "",
      },
      link: "karte.html?map=aldrimar-ivarsheim",
      dataPath: "Aldrimar/ivarsheim/data.json",
      rulingHouse: "Clan Wargh",
      notes: "Drei neue Karten; World-Anvil-Quellen, Thanentum Klippenschlag und unter Saatgrund verschachteltes Winterwacht.",
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
