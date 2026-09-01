(function () {
  "use strict";

  const countyHref = encodeURI("/Kontinente/Estryll/Königreich Cenyr/Grafschaft Celtigerns Wacht/Grafschaft Celtigerns Wacht.html");
  const mapId = "cenyr-celtigerns-wacht-llamrais-ankunft-gwynthor-bannkreis";
  const mapHref = `/Karten/karte.html?map=${encodeURIComponent(mapId)}`;
  const mapAssetRoot = "/Karten/Cenyr/celtigerns-wacht/llamrais-ankunft/gwynthor-bannkreis/Kartenbilder";
  const houseRoot = "/Stammbäume/assets/images/houses/Llamreis Ankunft";
  const commonerRoot = `${houseRoot}/Bürgerliche/Gwynthor`;

  const house = (familyId, name, rank, seat, liege, emblem) => Object.freeze({
    familyId,
    name,
    rank,
    seat,
    liege,
    emblem: encodeURI(emblem)
  });

  const nobleHouse = (id, name, rank, seat, liege) => house(
    `haus-${id}`,
    `Haus ${name}`,
    rank,
    seat,
    liege,
    `${houseRoot}/haus-${id}.png`
  );

  const commonerHouse = (id, name) => house(
    `haus-${id}`,
    `Haus ${name}`,
    "Bürgerliches Haus",
    "Gwynthor",
    "Haus Draig",
    id === "gwyllach" ? `${houseRoot}/haus-gwyllach.png` : `${commonerRoot}/${name}.png`
  );

  window.ORT_DATA = Object.freeze({
    meta: Object.freeze({
      id: "gwynthor",
      title: "Gwynthor - Aleria",
      type: "Großstadt",
      status: "Draft",
      template: "grossstadt"
    }),

    name: "Gwynthor",
    canonicalPath: "Königreich Cenyr > Grafschaft Celtigerns Wacht > Baronie Llamreis Ankunft > Gwynthors Bannkreis > Gwynthor",

    hierarchy: Object.freeze([
      Object.freeze({ type: "Königreich", name: "Cenyr", slug: "cenyr" }),
      Object.freeze({ type: "Grafschaft", name: "Celtigerns Wacht", slug: "celtigerns-wacht" }),
      Object.freeze({ type: "Baronie", name: "Llamreis Ankunft", slug: "llamreis-ankunft" }),
      Object.freeze({ type: "Bannkreis", name: "Gwynthors Bannkreis", slug: "gwynthors-bannkreis" }),
      Object.freeze({ type: "Großstadt", name: "Gwynthor", slug: "gwynthor" })
    ]),

    parentage: Object.freeze({
      kingdom: "Cenyr",
      county: "Celtigerns Wacht",
      barony: "Llamreis Ankunft",
      domain: "Celtigerns Wacht",
      region: "Gwynthors Bannkreis",
      settlement: "Gwynthor",
      liege: "Haus Draig"
    }),

    navigation: Object.freeze({
      parentHref: countyHref,
      parentLabel: "Celtigerns Wacht"
    }),

    structure: Object.freeze({
      land: "Cenyr",
      provinz: "Celtigerns Wacht",
      region: "Gwynthors Bannkreis",
      name: "Gwynthor",
      "vorherrschender adel": "Haus Draig",
      region2: "Großstadt",
      herrschaft: "Celtigerns Wacht",
      lehnsherr: "Haus Draig"
    }),

    presentation: Object.freeze({
      motto: "…",
      heraldry: encodeURI("/Stammbäume/assets/images/regions/gwynthor.png"),
      banner: encodeURI("/Stammbäume/assets/images/regions/celtigerns-wacht.png"),
      map: mapHref,
      images: Object.freeze({
        "icon-png": encodeURI("/Stammbäume/assets/images/regions/gwynthor.png"),
        "supporter-left-png": Object.freeze({
          src: encodeURI("/Stammbäume/assets/images/sigilsupporter/WappensupporterCeltigernswacht.png"),
          alt: "Wappenhalter von Gwynthor",
          fit: "contain"
        }),
        "supporter-right-png": Object.freeze({
          src: encodeURI("/Stammbäume/assets/images/sigilsupporter/WappensupporterCeltigernswacht.png"),
          alt: "Wappenhalter von Gwynthor",
          fit: "contain"
        }),
        "wappen-banner-png": encodeURI("/Stammbäume/assets/images/regions/celtigerns-wacht.png"),
        "karten-bild-png": Object.freeze({
          src: `${mapAssetRoot}/GwynthorBannkreis.png?v=20260901b`,
          alt: "Karte von Gwynthor und seinem Bannkreis",
          href: mapHref,
          fit: "contain"
        }),
        "stadtsektionen-png": Object.freeze({
          src: `${mapAssetRoot}/GwynthorBannkreisZonen.png?v=20260901b`,
          alt: "Bezirke von Gwynthor",
          href: mapHref,
          fit: "contain"
        }),
        "bild-einer-stadtwache-png": Object.freeze({
          src: "/Orte/Koenigreich_Cenyr/Grafschaft_Celtigerns_Wacht/Baronie_Llamreis_Ankunft/Gwynthors_Bannkreis/Gwynthor/assets/gwynthor-stadtwache.png?v=20260901a",
          alt: "Stadtwache von Gwynthor",
          fit: "contain"
        }),
        "zeitung-png": Object.freeze({
          src: "/Zeitungen/data/schwarzbote-gwynthor/assets/schwarzbote-gwynthor.png?v=20260901a",
          alt: "Der Schwarzbote – Ausgabe Gwynthor",
          href: "/Zeitungen/zeitung.html?zeitung=schwarzbote-gwynthor",
          fit: "contain"
        })
      })
    }),

    features: Object.freeze({
      noticeBoard: false,
      districts: true
    }),

    regionMap: Object.freeze({
      mapId,
      title: "Gwynthor – Bannkreis",
      embedHref: mapHref,
      fullHref: mapHref,
      pois: Object.freeze([])
    }),

    houses: Object.freeze([
      Object.freeze({
        title: "Grafenhaus",
        items: Object.freeze([
          nobleHouse("draig", "Draig", "Grafenhaus", "Gwynthor", "…")
        ])
      }),
      Object.freeze({
        title: "Ritterfürstenhäuser",
        items: Object.freeze([
          nobleHouse("gafyr", "Gafyr", "Ritterfürstenhaus", "Gwynthor", "Haus Draig"),
          nobleHouse("wyrm", "Wyrm", "Ritterfürstenhaus", "Gwynthor", "Haus Draig"),
          nobleHouse("saethwyr", "Saethwyr", "Ritterfürstenhaus", "Gwynthor", "Haus Draig")
        ])
      }),
      Object.freeze({
        title: "Ritterhäuser",
        items: Object.freeze([
          nobleHouse("tlawd", "Tlawd", "Ritterhaus", "Gwynthor", "Haus Gafyr"),
          nobleHouse("rhyddid", "Rhyddid", "Ritterhaus", "Gwynthor, Mwyncraig", "Haus Wyrm"),
          nobleHouse("gelyn", "Gelyn", "Ritterhaus", "Gwynthor, Gwynthstorm", "Haus Draig"),
          nobleHouse("cludwyr", "Cludwyr", "Ritterhaus", "Gwynthor, Bronhir", "Haus Wyrm"),
          nobleHouse("chwedlonol", "Chwedlonol", "Ritterhaus", "Gwynthor, Glastraeth", "Haus Saethwyr"),
          nobleHouse("balchder", "Balchder", "Ritterhaus", "Gwynthor", "Haus Draig"),
          nobleHouse("eneiniog", "Eneiniog", "Ritterhaus", "Gwynthor", "Haus Saethwyr"),
          nobleHouse("gostyn", "Gostyn", "Ritterhaus", "Gwynthor, Bronfelen", "Haus Gafyr"),
          nobleHouse("awenydd", "Awenydd", "Ritterhaus", "Gwynthor", "Haus Draig"),
          nobleHouse("awenor", "Awenor", "Ritterhaus", "Gwynthor", "Haus Draig"),
          nobleHouse("loer", "Loer", "Ritterhaus", "Gwynthor, Craithglyn", "Haus Wyrm"),
          nobleHouse("bleiddorn", "Bleiddorn", "Ritterhaus", "Gwynthor", "Haus Draig"),
          nobleHouse("dubhan-gwynthor", "Dubhan-Gwynthor", "Ritterhaus", "Gwynthor", "Haus Draig")
        ])
      }),
      Object.freeze({
        title: "Bürgerliche Häuser",
        items: Object.freeze([
          commonerHouse("gwyllach", "Gwyllach"),
          commonerHouse("draenmelyn", "Draenmelyn"),
          commonerHouse("pendrwn", "Pendrwn"),
          commonerHouse("swyll", "Swyll"),
          commonerHouse("aelmor", "Aelmor"),
          commonerHouse("maerllys", "Maerllys"),
          commonerHouse("braglas", "Braglas"),
          commonerHouse("tonnarth", "Tonnarth"),
          commonerHouse("ysgrif", "Ysgrif")
        ])
      })
    ]),

    merchants: Object.freeze([]),
    sections: Object.freeze({})
  });
})();
