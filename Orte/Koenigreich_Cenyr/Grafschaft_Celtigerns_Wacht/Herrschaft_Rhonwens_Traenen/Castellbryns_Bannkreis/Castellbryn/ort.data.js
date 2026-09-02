(function () {
  "use strict";

  const createPlaceData = window.ALERIA_CELTIGERNS_PLACES?.createPlaceData;
  if (typeof createPlaceData !== "function") return;

  const regionMapId = "cenyr-celtigerns-wacht-rhonwens-traenen-castellbryn-bannkreis";
  const regionMapHref = mapHref(regionMapId);
  const mapAssetRoot = "/Karten/Cenyr/celtigerns-wacht/rhonwens-traenen/castellbryn-bannkreis/Kartenbilder";
  const placeAssetRoot = "/Orte/Koenigreich_Cenyr/Grafschaft_Celtigerns_Wacht/Herrschaft_Rhonwens_Traenen/Castellbryns_Bannkreis/Castellbryn/assets";
  const newspaperHref = "/Zeitungen/zeitung.html?zeitung=schwarzbote-castellbryn";
  const houseRoot = "/Stammbäume/assets/images/houses/Rhonwens Tränen";
  const supporter = "/Stammbäume/assets/images/sigilsupporter/Schildkröte.png";

  const house = (familyId, name, rank, seat, liege, emblem) => Object.freeze({
    familyId,
    name: `Haus ${name}`,
    rank,
    seat,
    liege: liege === "..." ? "..." : `Haus ${liege}`,
    emblem: encodeURI(`${houseRoot}/${emblem}`)
  });

  const base = createPlaceData("castellbryn", {
    meta: {
      title: "Castellbryn - Aleria"
    },
    parentage: {
      lordship: "Rhonwens Tränen",
      region: "Castellbryn – Bannkreis"
    },
    features: {
      districts: true,
      noticeBoard: false,
      personalitiesCollapsed: true
    },
    presentation: {
      map: regionMapHref,
      images: {
        "supporter-left-png": {
          src: supporter,
          alt: "Schildkröte als Wappenstützer von Castellbryn",
          fit: "contain"
        },
        "supporter-right-png": {
          src: supporter,
          alt: "Schildkröte als Wappenstützer von Castellbryn",
          fit: "contain"
        },
        "bild-einer-stadtwache-png": {
          src: `${placeAssetRoot}/castellbryn-stadtwache.png`,
          alt: "Stadtwache von Castellbryn",
          fit: "contain"
        },
        "karten-bild-png": {
          src: `${mapAssetRoot}/CastellbrynBannkreisNormal.webp`,
          alt: "Castellbryn und sein Bannkreis",
          href: regionMapHref,
          fit: "contain"
        },
        "stadtsektionen-png": {
          src: `${mapAssetRoot}/CastellbrynBannkreisZonen.webp`,
          alt: "Zonen von Castellbryn und seinem Bannkreis",
          href: regionMapHref,
          fit: "contain"
        },
        "zeitung-png": {
          src: "/Zeitungen/data/schwarzbote-castellbryn/assets/schwarzbote-castellbryn.png",
          alt: "Der Schwarzbote – Ausgabe Castellbryn",
          href: newspaperHref,
          fit: "contain"
        }
      }
    }
  });

  window.ORT_DATA = Object.freeze({
    ...base,
    structure: Object.freeze({
      land: "Cenyr",
      provinz: "Celtigerns Wacht",
      region: "Castellbryn – Bannkreis",
      name: "Castellbryn",
      "vorherrschender adel": "Haus Arwydd",
      region2: "Großstadt",
      gewerbe: "Fischerei, Schiffbau und Seehandel",
      herrschaft: "Rhonwens Tränen",
      lehnsherr: "Haus Arwydd",
      ressourcen: "Fisch, Salzfisch, Tauwerk und Schiffsbedarf"
    }),
    houses: Object.freeze([
      Object.freeze({
        title: "Adelshaus",
        items: Object.freeze([
          house("haus-arwydd", "Arwydd", "Adelshaus", "Castellbryn", "Draig", "haus-arwydd.png")
        ])
      }),
      Object.freeze({
        title: "Ritterhäuser",
        items: Object.freeze([
          house("haus-gwared", "Gwared", "Ritterhaus", "Castellbryn", "Arwydd", "Ritterliche/Gwared.png"),
          house("haus-rhenna", "Rhenna", "Ritterhaus", "Rhonwens Tränen", "Arwydd", "Ritterliche/Rhenna.png"),
          house("haus-madryn", "Madryn", "Ritterhaus", "Rhonwens Tränen", "Arwydd", "Ritterliche/Madryn.png"),
          house("haus-talinvyr", "Talinvyr", "Ritterhaus", "Rhonwens Tränen", "Arwydd", "Ritterliche/Talinvyr.png"),
          house("haus-merek", "Merek", "Ritterhaus", "Rhonwens Tränen", "Arwydd", "Ritterliche/Merek.png")
        ])
      }),
      Object.freeze({
        title: "Ausgestorbene Häuser",
        items: Object.freeze([
          house("haus-illysywen", "Illysywen", "Ausgestorbenes Haus", "Castellbryn", "...", "haus-illysywen.png"),
          house("haus-skellor", "Skellor", "Ausgestorbenes Haus", "Rhonwens Tränen", "...", "Ausgestorben/Skellor.png"),
          house("haus-morveth", "Morveth", "Ausgestorbenes Haus", "Rhonwens Tränen", "...", "Ausgestorben/Morveth.png")
        ])
      })
    ]),
    merchants: Object.freeze([]),
    regionMap: Object.freeze({
      mapId: regionMapId,
      title: "Castellbryn – Bannkreis",
      embedHref: regionMapHref,
      fullHref: regionMapHref,
      pois: Object.freeze([])
    })
  });

  function mapHref(mapId) {
    return `/Karten/karte.html?map=${encodeURIComponent(mapId)}`;
  }
})();
