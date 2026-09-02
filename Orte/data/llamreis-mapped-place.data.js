(function () {
  "use strict";

  const places = Object.freeze({
    lynthor: mapConfig(
      "Lynthor",
      "cenyr-celtigerns-wacht-llamrais-ankunft-lynthor",
      "Cenyr/celtigerns-wacht/llamrais-ankunft/lynthor-bannkreis",
      "LynthorStadt.webp"
    ),
    "twr-rhewgorn": mapConfig(
      "Tŵr Rhewgorn",
      "cenyr-celtigerns-wacht-llamrais-ankunft-twr-rhewgorn",
      "Cenyr/celtigerns-wacht/llamrais-ankunft/twr-rhewgorn-bannkreis",
      "TwrRhewgornStadt.webp"
    ),
    mwyncreig: mapConfig(
      "Mwyncreig",
      "cenyr-celtigerns-wacht-llamrais-ankunft-wyrm-mwyncreig",
      "Cenyr/celtigerns-wacht/llamrais-ankunft/herrschaft-der-wyrm/mwyncreig-bannkreis",
      "MwyncreigStadt.webp"
    ),
    lysfaen: mapConfig(
      "Llysfaen",
      "cenyr-celtigerns-wacht-llamrais-ankunft-wyrm-llysfaen",
      "Cenyr/celtigerns-wacht/llamrais-ankunft/herrschaft-der-wyrm/llysfaen-bannkreis",
      "LlysfaenStadt.webp"
    ),
    bronhir: mapConfig(
      "Bronhir",
      "cenyr-celtigerns-wacht-llamrais-ankunft-wyrm-bronhir",
      "Cenyr/celtigerns-wacht/llamrais-ankunft/herrschaft-der-wyrm/bronhir-bannkreis",
      "BronhirStadt.webp"
    )
  });

  const placeId = String(window.ORTE_CONFIG?.registryEntry?.id || "");
  const config = places[placeId];
  const createPlaceData = window.ALERIA_CELTIGERNS_PLACES?.createPlaceData;
  if (!config || typeof createPlaceData !== "function") return;

  const base = createPlaceData(placeId, {
    features: {
      districts: false,
      noticeBoard: false
    },
    presentation: {
      map: config.cityHref,
      images: {
        "karten-bild-png": {
          src: config.cityImage,
          alt: `Stadtkarte von ${config.name}`,
          href: config.cityHref,
          fit: "contain"
        }
      }
    }
  });

  window.ORT_DATA = Object.freeze({
    ...base,
    regionMap: Object.freeze({
      mapId: config.regionMapId,
      title: `${config.name} – Bannkreis`,
      embedHref: config.regionHref,
      fullHref: config.regionHref,
      pois: Object.freeze([])
    })
  });

  function mapConfig(name, mapPrefix, folder, cityImage) {
    const cityMapId = `${mapPrefix}-stadtkarte`;
    const regionMapId = `${mapPrefix}-bannkreis`;
    const citySlug = folder.split("/").at(-1).replace(/-bannkreis$/, "");
    return Object.freeze({
      name,
      regionMapId,
      cityHref: mapHref(cityMapId),
      regionHref: mapHref(regionMapId),
      cityImage: `/Karten/${folder}/${citySlug}/Kartenbilder/${cityImage}`
    });
  }

  function mapHref(mapId) {
    return `/Karten/karte.html?map=${encodeURIComponent(mapId)}`;
  }

})();
