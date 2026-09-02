(function () {
  "use strict";

  const createPlaceData = window.ALERIA_CELTIGERNS_PLACES?.createPlaceData;
  if (typeof createPlaceData !== "function") return;

  const regionMapId = "cenyr-celtigerns-wacht-arthus-streben-rhosmere-bannkreis";
  const regionMapHref = mapHref(regionMapId);
  const mapAssetRoot = "/Karten/Cenyr/celtigerns-wacht/arthus-streben/rhosmere-bannkreis/Kartenbilder";
  const placeAssetRoot = "/Orte/Koenigreich_Cenyr/Grafschaft_Celtigerns_Wacht/Baronie_Arthus_Streben/Rhosmeres_Bannkreis/Rhosmere/assets";
  const newspaperHref = "/Zeitungen/zeitung.html?zeitung=schwarzbote-rhosmere";
  const houseRoot = "/Stammbäume/assets/images/houses/Artus Streben";
  const supporter = "/Stammbäume/assets/images/sigilsupporter/ArtusStrebenHengst.png";

  const house = (familyId, name, rank, seat, liege, emblem) => Object.freeze({
    familyId,
    name: `Haus ${name}`,
    rank,
    seat,
    liege: `Haus ${liege}`,
    emblem: encodeURI(`${houseRoot}/${emblem}`)
  });

  const base = createPlaceData("rhosmere", {
    meta: {
      title: "Rhosmere - Aleria"
    },
    parentage: {
      barony: "Arthus Streben",
      region: "Rhosmere – Bannkreis"
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
          alt: "Hengst als Wappenstützer von Rhosmere",
          fit: "contain"
        },
        "supporter-right-png": {
          src: supporter,
          alt: "Hengst als Wappenstützer von Rhosmere",
          fit: "contain"
        },
        "karten-bild-png": {
          src: `${mapAssetRoot}/RhosmereBannkreisNormal.webp`,
          alt: "Rhosmere und sein Bannkreis",
          href: regionMapHref,
          fit: "contain"
        },
        "stadtsektionen-png": {
          src: `${mapAssetRoot}/RhosmereBannkreisZonen.webp`,
          alt: "Bezirke von Rhosmere",
          href: regionMapHref,
          fit: "contain"
        },
        "bild-einer-stadtwache-png": {
          src: `${placeAssetRoot}/rhosmere-stadtwache.png`,
          alt: "Stadtwache von Rhosmere",
          fit: "contain"
        },
        "zeitung-png": {
          src: "/Zeitungen/data/schwarzbote-rhosmere/assets/schwarzbote-rhosmere.png",
          alt: "Der Schwarzbote – Ausgabe Rhosmere",
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
      region: "Rhosmere – Bannkreis",
      name: "Rhosmere",
      "vorherrschender adel": "Haus Gwefrydd",
      region2: "Großstadt",
      gewerbe: "Pferdezucht, Landwirtschaft und Reiterhandwerk",
      regierungstyp: "Baroniale Stadtverwaltung",
      herrschaft: "Arthus Streben",
      lehnsherr: "Haus Gwefrydd",
      "bekannte familien": "Haus Gwefrydd sowie die ansässigen Ritter- und Bürgerhäuser",
      ressourcen: "Rösser, Hafer, Heu, Gerste und Vieh"
    }),
    houses: Object.freeze([
      Object.freeze({
        title: "Adelshaus",
        items: Object.freeze([
          house("haus-gwefrydd", "Gwefrydd", "Adelshaus", "Rhosmere", "Draig", "haus-gwefrydd.png")
        ])
      }),
      Object.freeze({
        title: "Ritterhäuser",
        items: Object.freeze([
          house("haus-almarch", "Almarch", "Ritterhaus", "Rhosmere", "Gwefrydd", "Niedere Ritterliche/Almarch.png"),
          house("haus-brinmarch", "Brinmarch", "Ritterhaus", "Rhosmere", "Gwefrydd", "Niedere Ritterliche/Brinmarch.png"),
          house("haus-gwardin", "Gwardin", "Ritterhaus", "Rhosmere", "Gwefrydd", "Niedere Ritterliche/Gwardin.png"),
          house("haus-tirwyn", "Tirwyn", "Ritterhaus", "Rhosmere", "Gwefrydd", "Niedere Ritterliche/Tirwyn.png"),
          house("haus-eirfael", "Eirfael", "Ritterhaus", "Rhosmere", "Gwefrydd", "Niedere Ritterliche/Eirfael.png"),
          house("haus-ghorswyn", "Ghorswyn", "Ritterhaus", "Rhosmere", "Gwefrydd", "Niedere Ritterliche/Ghorswyn.png"),
          house("haus-coedvarn", "Coedvarn", "Ritterhaus", "Rhosmere", "Gwefrydd", "Niedere Ritterliche/Coedvarn.png"),
          house("haus-althin", "Althin", "Ritterhaus", "Rhosmere", "Gwefrydd", "Niedere Ritterliche/Althin.png"),
          house("haus-talmeirch", "Talmeirch", "Ritterhaus", "Rhosmere", "Gwefrydd", "Niedere Ritterliche/Talmeirch.png"),
          house("haus-gwynrhos", "Gwynrhos", "Ritterhaus", "Rhosmere", "Gwefrydd", "Niedere Ritterliche/Gwynrhos.png")
        ])
      }),
      Object.freeze({
        title: "Bürgerliche Häuser",
        items: Object.freeze([
          house("haus-iorwen", "Iorwen", "Bürgerliches Haus", "Rhosmere", "Gwefrydd", "Bürgerliche/Iorwen.png"),
          house("haus-bekab", "Bekab", "Bürgerliches Haus", "Rhosmere", "Gwefrydd", "Bürgerliche/Bekab.png"),
          house("haus-rhen", "Rhen", "Bürgerliches Haus", "Rhosmere", "Gwefrydd", "Bürgerliche/Rhen.png"),
          house("haus-maethan", "Maethan", "Bürgerliches Haus", "Rhosmere", "Gwefrydd", "Bürgerliche/Maethan.png")
        ])
      })
    ]),
    merchants: Object.freeze([]),
    regionMap: Object.freeze({
      mapId: regionMapId,
      title: "Rhosmere – Bannkreis",
      embedHref: regionMapHref,
      fullHref: regionMapHref,
      pois: Object.freeze([])
    })
  });

  function mapHref(mapId) {
    return `/Karten/karte.html?map=${encodeURIComponent(mapId)}`;
  }
})();
