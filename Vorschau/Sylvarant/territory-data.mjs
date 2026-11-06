/** Measured source markers; working numbers are not new geographical names. */
export const MAP_VARIANTS = Object.freeze([
  {
    "id": "regions",
    "number": 1,
    "short": "Gelieferte Karte",
    "file": "Vardentia · Gebietskarte",
    "map": "assets/maps/sylvarant.webp",
    "imageSize": [
      4063,
      4096
    ],
    "bakedNames": true
  }
].map(entry => Object.freeze(entry)));

export const REGIONS = Object.freeze([
  {
    "id": "archonat-01",
    "name": "Archonat 01",
    "colour": "#d67c8a",
    "description": "Nördliches Archonat mit langem Gebirgszug und einem nach Süden führenden Fluss.",
    "nameStatus": "working-number",
    "kindLabel": "Archonat",
    "imperialDomain": false,
    "houseId": null,
    "capitalId": null,
    "cityIds": [
      "ort-01",
      "ort-02",
      "ort-03"
    ]
  },
  {
    "id": "archonat-02",
    "name": "Archonat 02",
    "colour": "#6dbfce",
    "description": "Nordwestliche Küstenregion mit Waldflächen und offenen Ebenen.",
    "nameStatus": "working-number",
    "kindLabel": "Archonat",
    "imperialDomain": false,
    "houseId": null,
    "capitalId": null,
    "cityIds": [
      "ort-04",
      "ort-07",
      "ort-12",
      "ort-13"
    ]
  },
  {
    "id": "archonat-03",
    "name": "Archonat 03",
    "colour": "#a768bb",
    "description": "Zentrales Archonat mit einem Bergmassiv und bewaldeten Ebenen.",
    "nameStatus": "working-number",
    "kindLabel": "Archonat",
    "imperialDomain": false,
    "houseId": null,
    "capitalId": null,
    "cityIds": [
      "ort-05",
      "ort-10",
      "ort-11"
    ]
  },
  {
    "id": "archonat-04",
    "name": "Archonat 04",
    "colour": "#d6d8ab",
    "description": "Östliche Küstenregion mit offenen Ebenen und einem nördlichen Gebirgssaum.",
    "nameStatus": "working-number",
    "kindLabel": "Archonat",
    "imperialDomain": false,
    "houseId": null,
    "capitalId": null,
    "cityIds": [
      "ort-06",
      "ort-08",
      "ort-14"
    ]
  },
  {
    "id": "archonat-05",
    "name": "Archonat 05",
    "colour": "#9acc5a",
    "description": "Südwestliche Landzunge mit Wäldern und einem Gebirge im Norden.",
    "nameStatus": "working-number",
    "kindLabel": "Archonat",
    "imperialDomain": false,
    "houseId": null,
    "capitalId": null,
    "cityIds": [
      "ort-17",
      "ort-21",
      "ort-23"
    ]
  },
  {
    "id": "archonat-06",
    "name": "Archonat 06",
    "colour": "#dfbf65",
    "description": "Südliche Landzunge mit Waldflächen und offenem Hügelland.",
    "nameStatus": "working-number",
    "kindLabel": "Archonat",
    "imperialDomain": false,
    "houseId": null,
    "capitalId": null,
    "cityIds": [
      "ort-18",
      "ort-19",
      "ort-24"
    ]
  },
  {
    "id": "archonat-07",
    "name": "Archonat 07",
    "colour": "#8298c7",
    "description": "Zusammenhängendes blaues Südostgebiet mit langem Flusslauf. Zwei Archonat-Beschriftungen liegen innerhalb derselben ungeteilten Fläche.",
    "nameStatus": "working-number",
    "kindLabel": "Archonat",
    "imperialDomain": false,
    "houseId": null,
    "capitalId": null,
    "cityIds": [
      "ort-16",
      "ort-20",
      "ort-22",
      "ort-25",
      "ort-26"
    ]
  },
  {
    "id": "imperial-domain",
    "name": "Kaiserliche Domäne",
    "colour": "#65cbac",
    "description": "Die auf der Karte ausdrücklich bezeichnete zentrale Domäne am verzweigten Fluss.",
    "nameStatus": "source",
    "kindLabel": "Kaiserliche Domäne",
    "imperialDomain": true,
    "houseId": "house-mede",
    "capitalId": "ort-15",
    "cityIds": [
      "ort-09",
      "ort-15"
    ]
  }
].map(entry => Object.freeze(entry)));

export const ARCHONATES = Object.freeze(REGIONS.filter(region => !region.imperialDomain));
export const IMPERIAL_DOMAIN = REGIONS.find(region => region.imperialDomain);

export const SETTLEMENTS = Object.freeze([
  {
    "id": "ort-01",
    "name": "Ort 01",
    "nameStatus": "open",
    "regionId": "archonat-01",
    "archonateId": "archonat-01",
    "point": [
      70.4406,
      3.5889
    ],
    "pin": [
      70.4406,
      4
    ],
    "label": [
      70.4406,
      6.3889
    ],
    "overlayLabel": true,
    "description": "Nördliches Archonat mit langem Gebirgszug und einem nach Süden führenden Fluss.",
    "kind": "circle",
    "sourceMarkerShape": "circle",
    "sourcePixelCentre": [
      5724,
      294
    ],
    "imperialDomain": false,
    "kindLabel": "Ort"
  },
  {
    "id": "ort-02",
    "name": "Ort 02",
    "nameStatus": "open",
    "regionId": "archonat-01",
    "archonateId": "archonat-01",
    "point": [
      59.2789,
      15.2771
    ],
    "pin": [
      59.2789,
      11.4771
    ],
    "label": [
      59.2789,
      18.0771
    ],
    "overlayLabel": true,
    "description": "Nördliches Archonat mit langem Gebirgszug und einem nach Süden führenden Fluss.",
    "kind": "square",
    "sourceMarkerShape": "square",
    "sourcePixelCentre": [
      4817,
      1251.5
    ],
    "imperialDomain": false,
    "kindLabel": "Ort"
  },
  {
    "id": "ort-03",
    "name": "Ort 03",
    "nameStatus": "open",
    "regionId": "archonat-01",
    "archonateId": "archonat-01",
    "point": [
      68.0839,
      18.6646
    ],
    "pin": [
      68.0839,
      14.8646
    ],
    "label": [
      68.0839,
      21.4646
    ],
    "overlayLabel": true,
    "description": "Nördliches Archonat mit langem Gebirgszug und einem nach Süden führenden Fluss.",
    "kind": "circle",
    "sourceMarkerShape": "circle",
    "sourcePixelCentre": [
      5532.5,
      1529
    ],
    "imperialDomain": false,
    "kindLabel": "Ort"
  },
  {
    "id": "ort-04",
    "name": "Ort 04",
    "nameStatus": "open",
    "regionId": "archonat-02",
    "archonateId": "archonat-02",
    "point": [
      26.5198,
      22.1802
    ],
    "pin": [
      26.5198,
      18.3802
    ],
    "label": [
      26.5198,
      24.9802
    ],
    "overlayLabel": true,
    "description": "Nordwestliche Küstenregion mit Waldflächen und offenen Ebenen.",
    "kind": "square",
    "sourceMarkerShape": "square",
    "sourcePixelCentre": [
      2155,
      1817
    ],
    "imperialDomain": false,
    "kindLabel": "Ort"
  },
  {
    "id": "ort-05",
    "name": "Ort 05",
    "nameStatus": "open",
    "regionId": "archonat-03",
    "archonateId": "archonat-03",
    "point": [
      41.7056,
      24.7437
    ],
    "pin": [
      41.7056,
      20.9437
    ],
    "label": [
      41.7056,
      27.5437
    ],
    "overlayLabel": true,
    "description": "Zentrales Archonat mit einem Bergmassiv und bewaldeten Ebenen.",
    "kind": "square",
    "sourceMarkerShape": "square",
    "sourcePixelCentre": [
      3389,
      2027
    ],
    "imperialDomain": false,
    "kindLabel": "Ort"
  },
  {
    "id": "ort-06",
    "name": "Ort 06",
    "nameStatus": "open",
    "regionId": "archonat-04",
    "archonateId": "archonat-04",
    "point": [
      86.1679,
      29.1504
    ],
    "pin": [
      86.1679,
      25.3504
    ],
    "label": [
      86.1679,
      31.9504
    ],
    "overlayLabel": true,
    "description": "Östliche Küstenregion mit offenen Ebenen und einem nördlichen Gebirgssaum.",
    "kind": "square",
    "sourceMarkerShape": "square",
    "sourcePixelCentre": [
      7002,
      2388
    ],
    "imperialDomain": false,
    "kindLabel": "Ort"
  },
  {
    "id": "ort-07",
    "name": "Ort 07",
    "nameStatus": "open",
    "regionId": "archonat-02",
    "archonateId": "archonat-02",
    "point": [
      34.7773,
      33.2031
    ],
    "pin": [
      34.7773,
      29.4031
    ],
    "label": [
      34.7773,
      36.0031
    ],
    "overlayLabel": true,
    "description": "Nordwestliche Küstenregion mit Waldflächen und offenen Ebenen.",
    "kind": "circle",
    "sourceMarkerShape": "circle",
    "sourcePixelCentre": [
      2826,
      2720
    ],
    "imperialDomain": false,
    "kindLabel": "Ort"
  },
  {
    "id": "ort-08",
    "name": "Ort 08",
    "nameStatus": "open",
    "regionId": "archonat-04",
    "archonateId": "archonat-04",
    "point": [
      70.4836,
      33.9844
    ],
    "pin": [
      70.4836,
      30.1844
    ],
    "label": [
      70.4836,
      36.7844
    ],
    "overlayLabel": true,
    "description": "Östliche Küstenregion mit offenen Ebenen und einem nördlichen Gebirgssaum.",
    "kind": "circle",
    "sourceMarkerShape": "circle",
    "sourcePixelCentre": [
      5727.5,
      2784
    ],
    "imperialDomain": false,
    "kindLabel": "Ort"
  },
  {
    "id": "ort-09",
    "name": "Ort 09",
    "nameStatus": "open",
    "regionId": "imperial-domain",
    "archonateId": null,
    "point": [
      65.1674,
      34.3506
    ],
    "pin": [
      65.1674,
      30.5506
    ],
    "label": [
      65.1674,
      37.1506
    ],
    "overlayLabel": true,
    "description": "Die auf der Karte ausdrücklich bezeichnete zentrale Domäne am verzweigten Fluss.",
    "kind": "circle",
    "sourceMarkerShape": "circle",
    "sourcePixelCentre": [
      5295.5,
      2814
    ],
    "imperialDomain": true,
    "kindLabel": "Ort der kaiserlichen Domäne"
  },
  {
    "id": "ort-10",
    "name": "Ort 10",
    "nameStatus": "open",
    "regionId": "archonat-03",
    "archonateId": "archonat-03",
    "point": [
      56.8361,
      37.1582
    ],
    "pin": [
      56.8361,
      33.3582
    ],
    "label": [
      56.8361,
      39.9582
    ],
    "overlayLabel": true,
    "description": "Zentrales Archonat mit einem Bergmassiv und bewaldeten Ebenen.",
    "kind": "circle",
    "sourceMarkerShape": "circle",
    "sourcePixelCentre": [
      4618.5,
      3044
    ],
    "imperialDomain": false,
    "kindLabel": "Ort"
  },
  {
    "id": "ort-11",
    "name": "Ort 11",
    "nameStatus": "open",
    "regionId": "archonat-03",
    "archonateId": "archonat-03",
    "point": [
      37.5646,
      38.7573
    ],
    "pin": [
      37.5646,
      34.9573
    ],
    "label": [
      37.5646,
      41.5573
    ],
    "overlayLabel": true,
    "description": "Zentrales Archonat mit einem Bergmassiv und bewaldeten Ebenen.",
    "kind": "circle",
    "sourceMarkerShape": "circle",
    "sourcePixelCentre": [
      3052.5,
      3175
    ],
    "imperialDomain": false,
    "kindLabel": "Ort"
  },
  {
    "id": "ort-12",
    "name": "Ort 12",
    "nameStatus": "open",
    "regionId": "archonat-02",
    "archonateId": "archonat-02",
    "point": [
      17.9363,
      42.9077
    ],
    "pin": [
      17.9363,
      39.1077
    ],
    "label": [
      17.9363,
      45.7077
    ],
    "overlayLabel": true,
    "description": "Nordwestliche Küstenregion mit Waldflächen und offenen Ebenen.",
    "kind": "circle",
    "sourceMarkerShape": "circle",
    "sourcePixelCentre": [
      1457.5,
      3515
    ],
    "imperialDomain": false,
    "kindLabel": "Ort"
  },
  {
    "id": "ort-13",
    "name": "Ort 13",
    "nameStatus": "open",
    "regionId": "archonat-02",
    "archonateId": "archonat-02",
    "point": [
      34.3712,
      50.2075
    ],
    "pin": [
      34.3712,
      46.4075
    ],
    "label": [
      34.3712,
      53.0075
    ],
    "overlayLabel": true,
    "description": "Nordwestliche Küstenregion mit Waldflächen und offenen Ebenen.",
    "kind": "circle",
    "sourceMarkerShape": "circle",
    "sourcePixelCentre": [
      2793,
      4113
    ],
    "imperialDomain": false,
    "kindLabel": "Ort"
  },
  {
    "id": "ort-14",
    "name": "Ort 14",
    "nameStatus": "open",
    "regionId": "archonat-04",
    "archonateId": "archonat-04",
    "point": [
      92.8009,
      52.0386
    ],
    "pin": [
      92.8009,
      48.2386
    ],
    "label": [
      92.8009,
      54.8386
    ],
    "overlayLabel": true,
    "description": "Östliche Küstenregion mit offenen Ebenen und einem nördlichen Gebirgssaum.",
    "kind": "circle",
    "sourceMarkerShape": "circle",
    "sourcePixelCentre": [
      7541,
      4263
    ],
    "imperialDomain": false,
    "kindLabel": "Ort"
  },
  {
    "id": "ort-15",
    "name": "Hauptstadt (Name offen)",
    "nameStatus": "open",
    "regionId": "imperial-domain",
    "archonateId": null,
    "point": [
      59.1312,
      53.5889
    ],
    "pin": [
      59.1312,
      48.7889
    ],
    "label": [
      59.1312,
      56.7889
    ],
    "overlayLabel": false,
    "description": "Die auf der Karte ausdrücklich bezeichnete zentrale Domäne am verzweigten Fluss.",
    "kind": "diamond",
    "sourceMarkerShape": "diamond",
    "sourcePixelCentre": [
      4805,
      4390
    ],
    "imperialDomain": true,
    "kindLabel": "Hauptstadt · Kaiserliche Domäne",
    "houseId": "house-mede"
  },
  {
    "id": "ort-16",
    "name": "Ort 16",
    "nameStatus": "open",
    "regionId": "archonat-07",
    "archonateId": "archonat-07",
    "point": [
      66.8779,
      62.0361
    ],
    "pin": [
      66.8779,
      58.2361
    ],
    "label": [
      66.8779,
      64.8361
    ],
    "overlayLabel": true,
    "description": "Zusammenhängendes blaues Südostgebiet mit langem Flusslauf. Zwei Archonat-Beschriftungen liegen innerhalb derselben ungeteilten Fläche.",
    "kind": "circle",
    "sourceMarkerShape": "circle",
    "sourcePixelCentre": [
      5434.5,
      5082
    ],
    "imperialDomain": false,
    "kindLabel": "Ort"
  },
  {
    "id": "ort-17",
    "name": "Ort 17",
    "nameStatus": "open",
    "regionId": "archonat-05",
    "archonateId": "archonat-05",
    "point": [
      9.5681,
      64.1235
    ],
    "pin": [
      9.5681,
      60.3235
    ],
    "label": [
      9.5681,
      66.9235
    ],
    "overlayLabel": true,
    "description": "Südwestliche Landzunge mit Wäldern und einem Gebirge im Norden.",
    "kind": "circle",
    "sourceMarkerShape": "circle",
    "sourcePixelCentre": [
      777.5,
      5253
    ],
    "imperialDomain": false,
    "kindLabel": "Ort"
  },
  {
    "id": "ort-18",
    "name": "Ort 18",
    "nameStatus": "open",
    "regionId": "archonat-06",
    "archonateId": "archonat-06",
    "point": [
      50.7199,
      65.5518
    ],
    "pin": [
      50.7199,
      61.7518
    ],
    "label": [
      50.7199,
      68.3518
    ],
    "overlayLabel": true,
    "description": "Südliche Landzunge mit Waldflächen und offenem Hügelland.",
    "kind": "circle",
    "sourceMarkerShape": "circle",
    "sourcePixelCentre": [
      4121.5,
      5370
    ],
    "imperialDomain": false,
    "kindLabel": "Ort"
  },
  {
    "id": "ort-19",
    "name": "Ort 19",
    "nameStatus": "open",
    "regionId": "archonat-06",
    "archonateId": "archonat-06",
    "point": [
      36.3648,
      66.7664
    ],
    "pin": [
      36.3648,
      62.9664
    ],
    "label": [
      36.3648,
      69.5664
    ],
    "overlayLabel": true,
    "description": "Südliche Landzunge mit Waldflächen und offenem Hügelland.",
    "kind": "circle",
    "sourceMarkerShape": "circle",
    "sourcePixelCentre": [
      2955,
      5469.5
    ],
    "imperialDomain": false,
    "kindLabel": "Ort"
  },
  {
    "id": "ort-20",
    "name": "Ort 20",
    "nameStatus": "open",
    "regionId": "archonat-07",
    "archonateId": "archonat-07",
    "point": [
      84.2419,
      67.5537
    ],
    "pin": [
      84.2419,
      63.7537
    ],
    "label": [
      84.2419,
      70.3537
    ],
    "overlayLabel": true,
    "description": "Zusammenhängendes blaues Südostgebiet mit langem Flusslauf. Zwei Archonat-Beschriftungen liegen innerhalb derselben ungeteilten Fläche.",
    "kind": "circle",
    "sourceMarkerShape": "circle",
    "sourcePixelCentre": [
      6845.5,
      5534
    ],
    "imperialDomain": false,
    "kindLabel": "Ort"
  },
  {
    "id": "ort-21",
    "name": "Ort 21",
    "nameStatus": "open",
    "regionId": "archonat-05",
    "archonateId": "archonat-05",
    "point": [
      26.9444,
      70.813
    ],
    "pin": [
      26.9444,
      67.013
    ],
    "label": [
      26.9444,
      73.613
    ],
    "overlayLabel": true,
    "description": "Südwestliche Landzunge mit Wäldern und einem Gebirge im Norden.",
    "kind": "circle",
    "sourceMarkerShape": "circle",
    "sourcePixelCentre": [
      2189.5,
      5801
    ],
    "imperialDomain": false,
    "kindLabel": "Ort"
  },
  {
    "id": "ort-22",
    "name": "Ort 22",
    "nameStatus": "open",
    "regionId": "archonat-07",
    "archonateId": "archonat-07",
    "point": [
      74.717,
      77.6489
    ],
    "pin": [
      74.717,
      73.8489
    ],
    "label": [
      74.717,
      80.4489
    ],
    "overlayLabel": true,
    "description": "Zusammenhängendes blaues Südostgebiet mit langem Flusslauf. Zwei Archonat-Beschriftungen liegen innerhalb derselben ungeteilten Fläche.",
    "kind": "circle",
    "sourceMarkerShape": "circle",
    "sourcePixelCentre": [
      6071.5,
      6361
    ],
    "imperialDomain": false,
    "kindLabel": "Ort"
  },
  {
    "id": "ort-23",
    "name": "Ort 23",
    "nameStatus": "open",
    "regionId": "archonat-05",
    "archonateId": "archonat-05",
    "point": [
      9.4573,
      81.311
    ],
    "pin": [
      9.4573,
      77.511
    ],
    "label": [
      9.4573,
      84.111
    ],
    "overlayLabel": true,
    "description": "Südwestliche Landzunge mit Wäldern und einem Gebirge im Norden.",
    "kind": "square",
    "sourceMarkerShape": "square",
    "sourcePixelCentre": [
      768.5,
      6661
    ],
    "imperialDomain": false,
    "kindLabel": "Ort"
  },
  {
    "id": "ort-24",
    "name": "Ort 24",
    "nameStatus": "open",
    "regionId": "archonat-06",
    "archonateId": "archonat-06",
    "point": [
      39.712,
      82.4341
    ],
    "pin": [
      39.712,
      78.6341
    ],
    "label": [
      39.712,
      85.2341
    ],
    "overlayLabel": true,
    "description": "Südliche Landzunge mit Waldflächen und offenem Hügelland.",
    "kind": "square",
    "sourceMarkerShape": "square",
    "sourcePixelCentre": [
      3227,
      6753
    ],
    "imperialDomain": false,
    "kindLabel": "Ort"
  },
  {
    "id": "ort-25",
    "name": "Ort 25",
    "nameStatus": "open",
    "regionId": "archonat-07",
    "archonateId": "archonat-07",
    "point": [
      89.3675,
      90.1855
    ],
    "pin": [
      89.3675,
      86.3855
    ],
    "label": [
      89.3675,
      92.9855
    ],
    "overlayLabel": true,
    "description": "Zusammenhängendes blaues Südostgebiet mit langem Flusslauf. Zwei Archonat-Beschriftungen liegen innerhalb derselben ungeteilten Fläche.",
    "kind": "circle",
    "sourceMarkerShape": "circle",
    "sourcePixelCentre": [
      7262,
      7388
    ],
    "imperialDomain": false,
    "kindLabel": "Ort"
  },
  {
    "id": "ort-26",
    "name": "Ort 26",
    "nameStatus": "open",
    "regionId": "archonat-07",
    "archonateId": "archonat-07",
    "point": [
      69.7514,
      92.9443
    ],
    "pin": [
      69.7514,
      89.1443
    ],
    "label": [
      69.7514,
      95.7443
    ],
    "overlayLabel": true,
    "description": "Zusammenhängendes blaues Südostgebiet mit langem Flusslauf. Zwei Archonat-Beschriftungen liegen innerhalb derselben ungeteilten Fläche.",
    "kind": "square",
    "sourceMarkerShape": "square",
    "sourcePixelCentre": [
      5668,
      7614
    ],
    "imperialDomain": false,
    "kindLabel": "Ort"
  }
].map(entry => Object.freeze(entry)));

export const SOURCE_HOUSE_SEATS = Object.freeze([
  {
    "houseId": "house-mede",
    "settlementId": "ort-15",
    "regionId": "imperial-domain",
    "status": "user-confirmed-imperial-domain"
  }
].map(entry => Object.freeze(entry)));
