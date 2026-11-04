// User correction 2026-11-03: mainland only; the southern island is archived in sources/island-exclusion-2026-11-03.json.
export const MAP_VARIANTS = Object.freeze([
  {
    "id": "normal",
    "number": 1,
    "short": "Normal",
    "file": "Kaiserreich (Tirnara Normal).png",
    "map": "assets/maps/leukonia-normal.webp",
    "imageSize": [
      4096,
      2349
    ],
    "bakedNames": true
  },
  {
    "id": "regions",
    "number": 2,
    "short": "Archonate",
    "file": "Kaiserreich (Tirnara Portion).png",
    "map": "assets/maps/leukonia-regions.webp",
    "imageSize": [
      4096,
      2349
    ],
    "bakedNames": true
  }
].map((entry) => Object.freeze(entry)));

export const ARCHONATES = Object.freeze([
  {
    "id": "archonat-nord",
    "name": "Nördliches Archonat",
    "nameStatus": "geographic-working-label",
    "description": "Blau-violettes nördliches Festlandsgebiet, Bergsaum und ausgedehnte Wälder.",
    "colour": "#788bdb",
    "houseId": "house-lex",
    "assignmentStatus": "editable-proposal",
    "capitalId": null,
    "seatProposalId": "alvanista",
    "cityIds": [
      "alvanista",
      "ort-01",
      "ort-02",
      "ort-04",
      "ort-05",
      "ort-06"
    ],
    "bannerId": "banner-lex"
  },
  {
    "id": "archonat-west",
    "name": "Westliches Archonat",
    "nameStatus": "geographic-working-label",
    "description": "Grünes westliches Festlandsgebiet mit Küste, Seen und Flussarmen.",
    "colour": "#4cda6f",
    "houseId": "house-tremelia",
    "assignmentStatus": "editable-proposal",
    "capitalId": null,
    "seatProposalId": "aspio",
    "cityIds": [
      "aspio",
      "ort-07",
      "allantaic",
      "ort-14",
      "ort-15"
    ],
    "bannerId": "banner-tremelia"
  },
  {
    "id": "archonat-nordost",
    "name": "Nordostarchonat",
    "nameStatus": "geographic-working-label",
    "description": "Mintgrünes nordöstliches Festlandsgebiet; Zaphias bleibt darin als eigene kaiserliche Stadtdomäne.",
    "colour": "#6cddbe",
    "houseId": "house-pelagia",
    "assignmentStatus": "editable-proposal",
    "capitalId": null,
    "seatProposalId": "ort-03",
    "cityIds": [
      "ort-03",
      "ort-08",
      "ort-09",
      "ort-10",
      "zaphias"
    ],
    "bannerId": "banner-pelagia"
  },
  {
    "id": "archonat-suedwest",
    "name": "Südwestliches Archonat",
    "nameStatus": "geographic-working-label",
    "description": "Gelbes südwestliches Festlandsgebiet mit offenen Talräumen und Gebirgszügen.",
    "colour": "#e8da43",
    "houseId": "house-orania",
    "assignmentStatus": "editable-proposal",
    "capitalId": null,
    "seatProposalId": "ort-18",
    "cityIds": [
      "ort-11",
      "ort-13",
      "ort-16",
      "ort-18",
      "ort-21"
    ],
    "bannerId": "banner-orania"
  },
  {
    "id": "archonat-suedost",
    "name": "Südostarchonat",
    "nameStatus": "geographic-working-label",
    "description": "Orangefarbenes südöstliches Festlandsgebiet mit langer Küste, Seen und Bergzügen.",
    "colour": "#df8d78",
    "houseId": "house-apinia",
    "assignmentStatus": "editable-proposal",
    "capitalId": null,
    "seatProposalId": "ort-20",
    "cityIds": [
      "ort-12",
      "ort-17",
      "ort-19",
      "ort-20",
      "ort-22"
    ],
    "bannerId": "banner-apinia"
  }
].map((entry) => Object.freeze(entry)));

// Four source names remain; the other 22 mainland names are workshop proposals from 2026-11-03.
export const SETTLEMENTS = Object.freeze([
  {
    "id": "alvanista",
    "name": "Alvanista",
    "archonateId": "archonat-nord",
    "point": [
      26.8982,
      3.7995
    ],
    "pin": [
      32.5,
      10
    ],
    "label": [
      26.8982,
      5.7995
    ],
    "overlayLabel": false,
    "description": "Blau-violettes nördliches Festlandsgebiet, Bergsaum und ausgedehnte Wälder.",
    "kind": "square",
    "sourceMarkerShape": "square",
    "sourcePixelCentre": [
      2203.5,
      178.5
    ],
    "nameStatus": "source",
    "sourceKey": "alvanista"
  },
  {
    "id": "ort-01",
    "name": "Vespranum",
    "archonateId": "archonat-nord",
    "point": [
      41.1072,
      8.1418
    ],
    "pin": [
      41.1072,
      8.1418
    ],
    "label": [
      41.1072,
      10.1418
    ],
    "overlayLabel": true,
    "description": "Blau-violettes nördliches Festlandsgebiet, Bergsaum und ausgedehnte Wälder.",
    "kind": "circle",
    "sourceMarkerShape": "circle",
    "sourcePixelCentre": [
      3367.5,
      382.5
    ],
    "nameStatus": "proposal",
    "sourceKey": "n02"
  },
  {
    "id": "ort-02",
    "name": "Castelvara",
    "archonateId": "archonat-nord",
    "point": [
      17.6453,
      9.206
    ],
    "pin": [
      17.6453,
      9.206
    ],
    "label": [
      17.6453,
      11.206
    ],
    "overlayLabel": true,
    "description": "Blau-violettes nördliches Festlandsgebiet, Bergsaum und ausgedehnte Wälder.",
    "kind": "circle",
    "sourceMarkerShape": "circle",
    "sourcePixelCentre": [
      1445.5,
      432.5
    ],
    "nameStatus": "proposal",
    "sourceKey": "n01"
  },
  {
    "id": "ort-03",
    "name": "Aurelissa",
    "archonateId": "archonat-nordost",
    "point": [
      55.1453,
      9.7808
    ],
    "pin": [
      55.1453,
      9.7808
    ],
    "label": [
      55.1453,
      11.7808
    ],
    "overlayLabel": true,
    "description": "Mintgrünes nordöstliches Festlandsgebiet; Zaphias bleibt darin als eigene kaiserliche Stadtdomäne.",
    "kind": "circle",
    "sourceMarkerShape": "circle",
    "sourcePixelCentre": [
      4517.5,
      459.5
    ],
    "nameStatus": "proposal",
    "sourceKey": "ne01"
  },
  {
    "id": "ort-04",
    "name": "Velostria",
    "archonateId": "archonat-nord",
    "point": [
      48.3459,
      11.9093
    ],
    "pin": [
      48.3459,
      11.9093
    ],
    "label": [
      48.3459,
      13.9093
    ],
    "overlayLabel": true,
    "description": "Blau-violettes nördliches Festlandsgebiet, Bergsaum und ausgedehnte Wälder.",
    "kind": "circle",
    "sourceMarkerShape": "circle",
    "sourcePixelCentre": [
      3960.5,
      559.5
    ],
    "nameStatus": "proposal",
    "sourceKey": "n03"
  },
  {
    "id": "ort-05",
    "name": "Lacervia",
    "archonateId": "archonat-nord",
    "point": [
      31.2317,
      17.5287
    ],
    "pin": [
      31.2317,
      17.5287
    ],
    "label": [
      31.2317,
      19.5287
    ],
    "overlayLabel": true,
    "description": "Blau-violettes nördliches Festlandsgebiet, Bergsaum und ausgedehnte Wälder.",
    "kind": "circle",
    "sourceMarkerShape": "circle",
    "sourcePixelCentre": [
      2558.5,
      823.5
    ],
    "nameStatus": "proposal",
    "sourceKey": "n04"
  },
  {
    "id": "aspio",
    "name": "Aspio",
    "archonateId": "archonat-west",
    "point": [
      8.6975,
      18.4653
    ],
    "pin": [
      8.6975,
      18.4653
    ],
    "label": [
      8.6975,
      20.4653
    ],
    "overlayLabel": false,
    "description": "Grünes westliches Festlandsgebiet mit Küste, Seen und Flussarmen.",
    "kind": "square",
    "sourceMarkerShape": "square",
    "sourcePixelCentre": [
      712.5,
      867.5
    ],
    "nameStatus": "source",
    "sourceKey": "aspio"
  },
  {
    "id": "ort-06",
    "name": "Sarnetum",
    "archonateId": "archonat-nord",
    "point": [
      37.8113,
      25.2767
    ],
    "pin": [
      37.8113,
      25.2767
    ],
    "label": [
      37.8113,
      27.2767
    ],
    "overlayLabel": true,
    "description": "Blau-violettes nördliches Festlandsgebiet, Bergsaum und ausgedehnte Wälder.",
    "kind": "circle",
    "sourceMarkerShape": "circle",
    "sourcePixelCentre": [
      3097.5,
      1187.5
    ],
    "nameStatus": "proposal",
    "sourceKey": "n05"
  },
  {
    "id": "ort-07",
    "name": "Lorentum",
    "archonateId": "archonat-west",
    "point": [
      19.9158,
      25.596
    ],
    "pin": [
      19.9158,
      25.596
    ],
    "label": [
      19.9158,
      27.596
    ],
    "overlayLabel": true,
    "description": "Grünes westliches Festlandsgebiet mit Küste, Seen und Flussarmen.",
    "kind": "circle",
    "sourceMarkerShape": "circle",
    "sourcePixelCentre": [
      1631.5,
      1202.5
    ],
    "nameStatus": "proposal",
    "sourceKey": "w01"
  },
  {
    "id": "ort-08",
    "name": "Porto Nerante",
    "archonateId": "archonat-nordost",
    "point": [
      54.6204,
      27.8097
    ],
    "pin": [
      54.6204,
      27.8097
    ],
    "label": [
      54.6204,
      29.8097
    ],
    "overlayLabel": true,
    "description": "Mintgrünes nordöstliches Festlandsgebiet; Zaphias bleibt darin als eigene kaiserliche Stadtdomäne.",
    "kind": "circle",
    "sourceMarkerShape": "circle",
    "sourcePixelCentre": [
      4474.5,
      1306.5
    ],
    "nameStatus": "proposal",
    "sourceKey": "ne04"
  },
  {
    "id": "ort-09",
    "name": "Valestrum",
    "archonateId": "archonat-nordost",
    "point": [
      26.4587,
      28.2567
    ],
    "pin": [
      26.4587,
      28.2567
    ],
    "label": [
      26.4587,
      30.2567
    ],
    "overlayLabel": true,
    "description": "Mintgrünes nordöstliches Festlandsgebiet; Zaphias bleibt darin als eigene kaiserliche Stadtdomäne.",
    "kind": "circle",
    "sourceMarkerShape": "circle",
    "sourcePixelCentre": [
      2167.5,
      1327.5
    ],
    "nameStatus": "proposal",
    "sourceKey": "ne02"
  },
  {
    "id": "ort-10",
    "name": "Riventia",
    "archonateId": "archonat-nordost",
    "point": [
      43.5364,
      30.0447
    ],
    "pin": [
      43.5364,
      30.0447
    ],
    "label": [
      43.5364,
      32.0447
    ],
    "overlayLabel": true,
    "description": "Mintgrünes nordöstliches Festlandsgebiet; Zaphias bleibt darin als eigene kaiserliche Stadtdomäne.",
    "kind": "circle",
    "sourceMarkerShape": "circle",
    "sourcePixelCentre": [
      3566.5,
      1411.5
    ],
    "nameStatus": "proposal",
    "sourceKey": "ne03"
  },
  {
    "id": "ort-11",
    "name": "Velcaris",
    "archonateId": "archonat-suedwest",
    "point": [
      25.6653,
      40.8791
    ],
    "pin": [
      25.6653,
      40.8791
    ],
    "label": [
      25.6653,
      42.8791
    ],
    "overlayLabel": true,
    "description": "Gelbes südwestliches Festlandsgebiet mit offenen Talräumen und Gebirgszügen.",
    "kind": "circle",
    "sourceMarkerShape": "circle",
    "sourcePixelCentre": [
      2102.5,
      1920.5
    ],
    "nameStatus": "proposal",
    "sourceKey": "sw01"
  },
  {
    "id": "zaphias",
    "name": "Zaphias",
    "archonateId": "archonat-nordost",
    "point": [
      56.2073,
      42.1562
    ],
    "pin": [
      56.2073,
      42.1562
    ],
    "label": [
      56.2073,
      44.1562
    ],
    "overlayLabel": false,
    "description": "Mintgrünes nordöstliches Festlandsgebiet; Zaphias bleibt darin als eigene kaiserliche Stadtdomäne.",
    "kind": "square",
    "sourceMarkerShape": "square",
    "sourcePixelCentre": [
      4604.5,
      1980.5
    ],
    "nameStatus": "source",
    "sourceKey": "zaphias",
    "imperialDomain": true,
    "kindLabel": "Kaiserliche Domäne",
    "houseId": "house-mede"
  },
  {
    "id": "ort-12",
    "name": "Caeloria",
    "archonateId": "archonat-suedost",
    "point": [
      63.4827,
      42.9012
    ],
    "pin": [
      63.4827,
      42.9012
    ],
    "label": [
      63.4827,
      44.9012
    ],
    "overlayLabel": true,
    "description": "Orangefarbenes südöstliches Festlandsgebiet mit langer Küste, Seen und Bergzügen.",
    "kind": "circle",
    "sourceMarkerShape": "circle",
    "sourcePixelCentre": [
      5200.5,
      2015.5
    ],
    "nameStatus": "proposal",
    "sourceKey": "se01"
  },
  {
    "id": "allantaic",
    "name": "Allantaic",
    "archonateId": "archonat-west",
    "point": [
      6.3293,
      43.2418
    ],
    "pin": [
      6.3293,
      43.2418
    ],
    "label": [
      6.3293,
      45.2418
    ],
    "overlayLabel": false,
    "description": "Grünes westliches Festlandsgebiet mit Küste, Seen und Flussarmen.",
    "kind": "circle",
    "sourceMarkerShape": "circle",
    "sourcePixelCentre": [
      518.5,
      2031.5
    ],
    "nameStatus": "source",
    "sourceKey": "allantaic"
  },
  {
    "id": "ort-13",
    "name": "Clusentia",
    "archonateId": "archonat-suedwest",
    "point": [
      43.4387,
      45.2639
    ],
    "pin": [
      43.4387,
      45.2639
    ],
    "label": [
      43.4387,
      47.2639
    ],
    "overlayLabel": true,
    "description": "Gelbes südwestliches Festlandsgebiet mit offenen Talräumen und Gebirgszügen.",
    "kind": "circle",
    "sourceMarkerShape": "circle",
    "sourcePixelCentre": [
      3558.5,
      2126.5
    ],
    "nameStatus": "proposal",
    "sourceKey": "sw02"
  },
  {
    "id": "ort-14",
    "name": "Castrena",
    "archonateId": "archonat-west",
    "point": [
      18.4998,
      48.1162
    ],
    "pin": [
      18.4998,
      48.1162
    ],
    "label": [
      18.4998,
      50.1162
    ],
    "overlayLabel": true,
    "description": "Grünes westliches Festlandsgebiet mit Küste, Seen und Flussarmen.",
    "kind": "circle",
    "sourceMarkerShape": "circle",
    "sourcePixelCentre": [
      1515.5,
      2260.5
    ],
    "nameStatus": "proposal",
    "sourceKey": "w02"
  },
  {
    "id": "ort-15",
    "name": "Porto Lascio",
    "archonateId": "archonat-west",
    "point": [
      5.1819,
      54.6722
    ],
    "pin": [
      5.1819,
      54.6722
    ],
    "label": [
      12,
      56.6722
    ],
    "overlayLabel": true,
    "description": "Grünes westliches Festlandsgebiet mit Küste, Seen und Flussarmen.",
    "kind": "circle",
    "sourceMarkerShape": "circle",
    "sourcePixelCentre": [
      424.5,
      2568.5
    ],
    "nameStatus": "proposal",
    "sourceKey": "w03"
  },
  {
    "id": "ort-16",
    "name": "Savinara",
    "archonateId": "archonat-suedwest",
    "point": [
      33.6487,
      56.9711
    ],
    "pin": [
      33.6487,
      56.9711
    ],
    "label": [
      33.6487,
      58.9711
    ],
    "overlayLabel": true,
    "description": "Gelbes südwestliches Festlandsgebiet mit offenen Talräumen und Gebirgszügen.",
    "kind": "circle",
    "sourceMarkerShape": "circle",
    "sourcePixelCentre": [
      2756.5,
      2676.5
    ],
    "nameStatus": "proposal",
    "sourceKey": "sw03"
  },
  {
    "id": "ort-17",
    "name": "Lacastella",
    "archonateId": "archonat-suedost",
    "point": [
      49.6887,
      66.5496
    ],
    "pin": [
      49.6887,
      66.5496
    ],
    "label": [
      49.6887,
      68.5496
    ],
    "overlayLabel": true,
    "description": "Orangefarbenes südöstliches Festlandsgebiet mit langer Küste, Seen und Bergzügen.",
    "kind": "circle",
    "sourceMarkerShape": "circle",
    "sourcePixelCentre": [
      4070.5,
      3126.5
    ],
    "nameStatus": "proposal",
    "sourceKey": "se02"
  },
  {
    "id": "ort-18",
    "name": "Bellavento",
    "archonateId": "archonat-suedwest",
    "point": [
      17.8162,
      67.5287
    ],
    "pin": [
      17.8162,
      67.5287
    ],
    "label": [
      17.8162,
      69.5287
    ],
    "overlayLabel": true,
    "description": "Gelbes südwestliches Festlandsgebiet mit offenen Talräumen und Gebirgszügen.",
    "kind": "square",
    "sourceMarkerShape": "square",
    "sourcePixelCentre": [
      1459.5,
      3172.5
    ],
    "nameStatus": "proposal",
    "sourceKey": "sw-square"
  },
  {
    "id": "ort-19",
    "name": "Tervanto",
    "archonateId": "archonat-suedost",
    "point": [
      66.51,
      68.8272
    ],
    "pin": [
      66.51,
      68.8272
    ],
    "label": [
      66.51,
      70.8272
    ],
    "overlayLabel": true,
    "description": "Orangefarbenes südöstliches Festlandsgebiet mit langer Küste, Seen und Bergzügen.",
    "kind": "circle",
    "sourceMarkerShape": "circle",
    "sourcePixelCentre": [
      5448.5,
      3233.5
    ],
    "nameStatus": "proposal",
    "sourceKey": "se03"
  },
  {
    "id": "ort-20",
    "name": "Arventium",
    "archonateId": "archonat-suedost",
    "point": [
      36.3953,
      70.1469
    ],
    "pin": [
      36.3953,
      70.1469
    ],
    "label": [
      36.3953,
      72.1469
    ],
    "overlayLabel": true,
    "description": "Orangefarbenes südöstliches Festlandsgebiet mit langer Küste, Seen und Bergzügen.",
    "kind": "square",
    "sourceMarkerShape": "square",
    "sourcePixelCentre": [
      2981.5,
      3295.5
    ],
    "nameStatus": "proposal",
    "sourceKey": "se-square"
  },
  {
    "id": "ort-21",
    "name": "Porto Salvo",
    "archonateId": "archonat-suedwest",
    "point": [
      31.2561,
      75.3406
    ],
    "pin": [
      31.2561,
      75.3406
    ],
    "label": [
      31.2561,
      77.3406
    ],
    "overlayLabel": true,
    "description": "Gelbes südwestliches Festlandsgebiet mit offenen Talräumen und Gebirgszügen.",
    "kind": "circle",
    "sourceMarkerShape": "circle",
    "sourcePixelCentre": [
      2560.5,
      3539.5
    ],
    "nameStatus": "proposal",
    "sourceKey": "sw04"
  },
  {
    "id": "ort-22",
    "name": "Porto Vessaro",
    "archonateId": "archonat-suedost",
    "point": [
      55.7922,
      79.7467
    ],
    "pin": [
      55.7922,
      79.7467
    ],
    "label": [
      55.7922,
      81.7467
    ],
    "overlayLabel": true,
    "description": "Orangefarbenes südöstliches Festlandsgebiet mit langer Küste, Seen und Bergzügen.",
    "kind": "circle",
    "sourceMarkerShape": "circle",
    "sourcePixelCentre": [
      4570.5,
      3746.5
    ],
    "nameStatus": "proposal",
    "sourceKey": "se04"
  }
].map((entry) => Object.freeze(entry)));

export const SOURCE_HOUSE_SEATS = Object.freeze([
  {
    "houseId": "house-lex",
    "settlementId": "alvanista",
    "archonateId": "archonat-nord",
    "status": "editable-proposal"
  },
  {
    "houseId": "house-tremelia",
    "settlementId": "aspio",
    "archonateId": "archonat-west",
    "status": "editable-proposal"
  },
  {
    "houseId": "house-pelagia",
    "settlementId": "ort-03",
    "archonateId": "archonat-nordost",
    "status": "editable-proposal"
  },
  {
    "houseId": "house-orania",
    "settlementId": "ort-18",
    "archonateId": "archonat-suedwest",
    "status": "editable-proposal"
  },
  {
    "houseId": "house-apinia",
    "settlementId": "ort-20",
    "archonateId": "archonat-suedost",
    "status": "editable-proposal"
  },
  {
    "houseId": "house-mede",
    "settlementId": "zaphias",
    "archonateId": "archonat-nordost",
    "status": "user-confirmed-imperial-domain"
  }
].map((entry) => Object.freeze(entry)));
