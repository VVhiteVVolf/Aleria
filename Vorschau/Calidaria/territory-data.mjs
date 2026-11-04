/** Measured source markers; neutral working labels. No names or house seats are invented. */
export const MAP_VARIANTS = Object.freeze([
  {
    "id": "normal",
    "number": 1,
    "short": "Normal",
    "file": "Kaiserreich (Calidaria) (Normal).png",
    "map": "assets/maps/calidaria-normal.webp",
    "imageSize": [
      4096,
      2349
    ],
    "bakedNames": false,
    "regionLabelsBaked": true
  },
  {
    "id": "regions",
    "number": 2,
    "short": "Archonate",
    "file": "Kaiserreich (Calidaria).png",
    "map": "assets/maps/calidaria-regions.webp",
    "imageSize": [
      4096,
      2349
    ],
    "bakedNames": false,
    "regionLabelsBaked": true
  }
].map(entry => Object.freeze(entry)));

export const REGIONS = Object.freeze([
  {
    "id": "archonat-01",
    "name": "Archonat 01",
    "colour": "#df927c",
    "description": "Westliche Insel mit dichtem Wald, einem langen Gebirgszug und Flussarmen.",
    "nameStatus": "working-number",
    "kindLabel": "Archonat",
    "imperialDomain": false,
    "houseId": null,
    "capitalId": null,
    "cityIds": [
      "ort-08",
      "ort-09",
      "ort-14"
    ]
  },
  {
    "id": "archonat-02",
    "name": "Archonat 02",
    "colour": "#e3cd52",
    "description": "Nördliche Insel mit westlichem Gebirge, dichter Vegetation und einer schmalen südlichen Landzunge.",
    "nameStatus": "working-number",
    "kindLabel": "Archonat",
    "imperialDomain": false,
    "houseId": null,
    "capitalId": null,
    "cityIds": [
      "ort-01",
      "ort-05"
    ]
  },
  {
    "id": "archonat-03",
    "name": "Archonat 03",
    "colour": "#63d5c7",
    "description": "Nordöstliche Insel mit Wäldern, Flusslauf und einem Gebirgszug im Norden.",
    "nameStatus": "working-number",
    "kindLabel": "Archonat",
    "imperialDomain": false,
    "houseId": null,
    "capitalId": null,
    "cityIds": [
      "ort-02",
      "ort-03"
    ]
  },
  {
    "id": "archonat-04",
    "name": "Archonat 04",
    "colour": "#cf83d4",
    "description": "Westlicher Teil der großen mittleren Insel mit Flussarmen, dichtem Wald und östlichem Gebirgssaum.",
    "nameStatus": "working-number",
    "kindLabel": "Archonat",
    "imperialDomain": false,
    "houseId": null,
    "capitalId": null,
    "cityIds": [
      "ort-07",
      "ort-12",
      "ort-15"
    ]
  },
  {
    "id": "archonat-05",
    "name": "Archonat 05",
    "colour": "#97d65a",
    "description": "Östliche Inselgruppe mit bewaldeten Küsten und mehreren getrennten Landteilen.",
    "nameStatus": "working-number",
    "kindLabel": "Archonat",
    "imperialDomain": false,
    "houseId": null,
    "capitalId": null,
    "cityIds": [
      "ort-11",
      "ort-13",
      "ort-16"
    ]
  },
  {
    "id": "archonat-06",
    "name": "Archonat 06",
    "colour": "#6ebcdb",
    "description": "Südwestliche Insel mit Gebirgen im Norden, einem verzweigten Fluss und dichter Vegetation.",
    "nameStatus": "working-number",
    "kindLabel": "Archonat",
    "imperialDomain": false,
    "houseId": null,
    "capitalId": null,
    "cityIds": [
      "ort-18",
      "ort-19",
      "ort-21"
    ]
  },
  {
    "id": "archonat-07",
    "name": "Archonat 07",
    "colour": "#b37ed3",
    "description": "Südöstliche Inselgruppe mit bewaldeten Inseln und einem Gebirge auf der nördlichen Hauptinsel.",
    "nameStatus": "working-number",
    "kindLabel": "Archonat",
    "imperialDomain": false,
    "houseId": null,
    "capitalId": null,
    "cityIds": [
      "ort-17",
      "ort-20",
      "ort-22"
    ]
  },
  {
    "id": "imperial-domain",
    "name": "Kaiserliche Domäne",
    "colour": "#6178d3",
    "description": "Blau markierter östlicher Teil der großen mittleren Insel; die Karte weist ihn ausdrücklich als kaiserliche Domäne aus.",
    "nameStatus": "source",
    "kindLabel": "Kaiserliche Domäne",
    "imperialDomain": true,
    "houseId": "house-mede",
    "capitalId": "ort-06",
    "cityIds": [
      "ort-04",
      "ort-06",
      "ort-10"
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
    "regionId": "archonat-02",
    "archonateId": "archonat-02",
    "point": [
      51.0559,
      9.3125
    ],
    "pin": [
      51.0559,
      5.5125
    ],
    "label": [
      51.0559,
      12.1125
    ],
    "overlayLabel": true,
    "description": "Nördliche Insel mit westlichem Gebirge, dichter Vegetation und einer schmalen südlichen Landzunge.",
    "kind": "circle",
    "sourceMarkerShape": "circle",
    "sourcePixelCentre": [
      4182.5,
      437.5
    ],
    "imperialDomain": false,
    "kindLabel": "Ort"
  },
  {
    "id": "ort-02",
    "name": "Ort 02",
    "nameStatus": "open",
    "regionId": "archonat-03",
    "archonateId": "archonat-03",
    "point": [
      62.8967,
      15.5705
    ],
    "pin": [
      62.8967,
      11.7705
    ],
    "label": [
      62.8967,
      18.3705
    ],
    "overlayLabel": true,
    "description": "Nordöstliche Insel mit Wäldern, Flusslauf und einem Gebirgszug im Norden.",
    "kind": "square",
    "sourceMarkerShape": "square",
    "sourcePixelCentre": [
      5152.5,
      731.5
    ],
    "imperialDomain": false,
    "kindLabel": "Ort"
  },
  {
    "id": "ort-03",
    "name": "Ort 03",
    "nameStatus": "open",
    "regionId": "archonat-03",
    "archonateId": "archonat-03",
    "point": [
      74.8718,
      23.7016
    ],
    "pin": [
      74.8718,
      19.9016
    ],
    "label": [
      74.8718,
      26.5016
    ],
    "overlayLabel": true,
    "description": "Nordöstliche Insel mit Wäldern, Flusslauf und einem Gebirgszug im Norden.",
    "kind": "circle",
    "sourceMarkerShape": "circle",
    "sourcePixelCentre": [
      6133.5,
      1113.5
    ],
    "imperialDomain": false,
    "kindLabel": "Ort"
  },
  {
    "id": "ort-04",
    "name": "Ort 04",
    "nameStatus": "open",
    "regionId": "imperial-domain",
    "archonateId": null,
    "point": [
      54.0833,
      24.3827
    ],
    "pin": [
      54.0833,
      20.5827
    ],
    "label": [
      54.0833,
      27.1827
    ],
    "overlayLabel": true,
    "description": "Blau markierter östlicher Teil der großen mittleren Insel; die Karte weist ihn ausdrücklich als kaiserliche Domäne aus.",
    "kind": "circle",
    "sourceMarkerShape": "circle",
    "sourcePixelCentre": [
      4430.5,
      1145.5
    ],
    "imperialDomain": true,
    "kindLabel": "Ort der kaiserlichen Domäne"
  },
  {
    "id": "ort-05",
    "name": "Ort 05",
    "nameStatus": "open",
    "regionId": "archonat-02",
    "archonateId": "archonat-02",
    "point": [
      37.3962,
      26.341
    ],
    "pin": [
      37.3962,
      22.541
    ],
    "label": [
      37.3962,
      29.141
    ],
    "overlayLabel": true,
    "description": "Nördliche Insel mit westlichem Gebirge, dichter Vegetation und einer schmalen südlichen Landzunge.",
    "kind": "square",
    "sourceMarkerShape": "square",
    "sourcePixelCentre": [
      3063.5,
      1237.5
    ],
    "imperialDomain": false,
    "kindLabel": "Ort"
  },
  {
    "id": "ort-06",
    "name": "Hauptstadt (Name offen)",
    "nameStatus": "open",
    "regionId": "imperial-domain",
    "archonateId": null,
    "point": [
      66.1194,
      32.0668
    ],
    "pin": [
      66.1194,
      26.0668
    ],
    "label": [
      66.1194,
      37.6668
    ],
    "overlayLabel": true,
    "description": "Blau markierter östlicher Teil der großen mittleren Insel; die Karte weist ihn ausdrücklich als kaiserliche Domäne aus.",
    "kind": "diamond",
    "sourceMarkerShape": "diamond",
    "sourcePixelCentre": [
      5416.5,
      1506.5
    ],
    "imperialDomain": true,
    "kindLabel": "Hauptstadt · Kaiserliche Domäne",
    "houseId": "house-mede"
  },
  {
    "id": "ort-07",
    "name": "Ort 07",
    "nameStatus": "open",
    "regionId": "archonat-04",
    "archonateId": "archonat-04",
    "point": [
      44.5862,
      30.1511
    ],
    "pin": [
      44.5862,
      26.3511
    ],
    "label": [
      44.5862,
      32.9511
    ],
    "overlayLabel": true,
    "description": "Westlicher Teil der großen mittleren Insel mit Flussarmen, dichtem Wald und östlichem Gebirgssaum.",
    "kind": "circle",
    "sourceMarkerShape": "circle",
    "sourcePixelCentre": [
      3652.5,
      1416.5
    ],
    "imperialDomain": false,
    "kindLabel": "Ort"
  },
  {
    "id": "ort-08",
    "name": "Ort 08",
    "nameStatus": "open",
    "regionId": "archonat-01",
    "archonateId": "archonat-01",
    "point": [
      19.1223,
      33.94
    ],
    "pin": [
      19.1223,
      30.14
    ],
    "label": [
      19.1223,
      36.74
    ],
    "overlayLabel": true,
    "description": "Westliche Insel mit dichtem Wald, einem langen Gebirgszug und Flussarmen.",
    "kind": "circle",
    "sourceMarkerShape": "circle",
    "sourcePixelCentre": [
      1566.5,
      1594.5
    ],
    "imperialDomain": false,
    "kindLabel": "Ort"
  },
  {
    "id": "ort-09",
    "name": "Ort 09",
    "nameStatus": "open",
    "regionId": "archonat-01",
    "archonateId": "archonat-01",
    "point": [
      35.0037,
      45.7109
    ],
    "pin": [
      35.0037,
      41.9109
    ],
    "label": [
      35.0037,
      48.5109
    ],
    "overlayLabel": true,
    "description": "Westliche Insel mit dichtem Wald, einem langen Gebirgszug und Flussarmen.",
    "kind": "circle",
    "sourceMarkerShape": "circle",
    "sourcePixelCentre": [
      2867.5,
      2147.5
    ],
    "imperialDomain": false,
    "kindLabel": "Ort"
  },
  {
    "id": "ort-10",
    "name": "Ort 10",
    "nameStatus": "open",
    "regionId": "imperial-domain",
    "archonateId": null,
    "point": [
      58.9661,
      49.7339
    ],
    "pin": [
      58.9661,
      45.9339
    ],
    "label": [
      58.9661,
      52.5339
    ],
    "overlayLabel": true,
    "description": "Blau markierter östlicher Teil der großen mittleren Insel; die Karte weist ihn ausdrücklich als kaiserliche Domäne aus.",
    "kind": "circle",
    "sourceMarkerShape": "circle",
    "sourcePixelCentre": [
      4830.5,
      2336.5
    ],
    "imperialDomain": true,
    "kindLabel": "Ort der kaiserlichen Domäne"
  },
  {
    "id": "ort-11",
    "name": "Ort 11",
    "nameStatus": "open",
    "regionId": "archonat-05",
    "archonateId": "archonat-05",
    "point": [
      73.9563,
      50.6279
    ],
    "pin": [
      73.9563,
      46.8279
    ],
    "label": [
      73.9563,
      53.4279
    ],
    "overlayLabel": true,
    "description": "Östliche Inselgruppe mit bewaldeten Küsten und mehreren getrennten Landteilen.",
    "kind": "circle",
    "sourceMarkerShape": "circle",
    "sourcePixelCentre": [
      6058.5,
      2378.5
    ],
    "imperialDomain": false,
    "kindLabel": "Ort"
  },
  {
    "id": "ort-12",
    "name": "Ort 12",
    "nameStatus": "open",
    "regionId": "archonat-04",
    "archonateId": "archonat-04",
    "point": [
      41.3879,
      55.7152
    ],
    "pin": [
      41.3879,
      51.9152
    ],
    "label": [
      41.3879,
      58.5152
    ],
    "overlayLabel": true,
    "description": "Westlicher Teil der großen mittleren Insel mit Flussarmen, dichtem Wald und östlichem Gebirgssaum.",
    "kind": "square",
    "sourceMarkerShape": "square",
    "sourcePixelCentre": [
      3390.5,
      2617.5
    ],
    "imperialDomain": false,
    "kindLabel": "Ort"
  },
  {
    "id": "ort-13",
    "name": "Ort 13",
    "nameStatus": "open",
    "regionId": "archonat-05",
    "archonateId": "archonat-05",
    "point": [
      64.5813,
      57.865
    ],
    "pin": [
      64.5813,
      54.065
    ],
    "label": [
      64.5813,
      60.665
    ],
    "overlayLabel": true,
    "description": "Östliche Inselgruppe mit bewaldeten Küsten und mehreren getrennten Landteilen.",
    "kind": "square",
    "sourceMarkerShape": "square",
    "sourcePixelCentre": [
      5290.5,
      2718.5
    ],
    "imperialDomain": false,
    "kindLabel": "Ort"
  },
  {
    "id": "ort-14",
    "name": "Ort 14",
    "nameStatus": "open",
    "regionId": "archonat-01",
    "archonateId": "archonat-01",
    "point": [
      32.3425,
      58.4398
    ],
    "pin": [
      32.3425,
      54.6398
    ],
    "label": [
      32.3425,
      61.2398
    ],
    "overlayLabel": true,
    "description": "Westliche Insel mit dichtem Wald, einem langen Gebirgszug und Flussarmen.",
    "kind": "square",
    "sourceMarkerShape": "square",
    "sourcePixelCentre": [
      2649.5,
      2745.5
    ],
    "imperialDomain": false,
    "kindLabel": "Ort"
  },
  {
    "id": "ort-15",
    "name": "Ort 15",
    "nameStatus": "open",
    "regionId": "archonat-04",
    "archonateId": "archonat-04",
    "point": [
      54.2542,
      70.1894
    ],
    "pin": [
      54.2542,
      66.3894
    ],
    "label": [
      54.2542,
      72.9894
    ],
    "overlayLabel": true,
    "description": "Westlicher Teil der großen mittleren Insel mit Flussarmen, dichtem Wald und östlichem Gebirgssaum.",
    "kind": "circle",
    "sourceMarkerShape": "circle",
    "sourcePixelCentre": [
      4444.5,
      3297.5
    ],
    "imperialDomain": false,
    "kindLabel": "Ort"
  },
  {
    "id": "ort-16",
    "name": "Ort 16",
    "nameStatus": "open",
    "regionId": "archonat-05",
    "archonateId": "archonat-05",
    "point": [
      73.2727,
      70.8706
    ],
    "pin": [
      73.2727,
      67.0706
    ],
    "label": [
      73.2727,
      73.6706
    ],
    "overlayLabel": true,
    "description": "Östliche Inselgruppe mit bewaldeten Küsten und mehreren getrennten Landteilen.",
    "kind": "circle",
    "sourceMarkerShape": "circle",
    "sourcePixelCentre": [
      6002.5,
      3329.5
    ],
    "imperialDomain": false,
    "kindLabel": "Ort"
  },
  {
    "id": "ort-17",
    "name": "Ort 17",
    "nameStatus": "open",
    "regionId": "archonat-07",
    "archonateId": "archonat-07",
    "point": [
      63.1409,
      79.2571
    ],
    "pin": [
      63.1409,
      75.4571
    ],
    "label": [
      63.1409,
      82.0571
    ],
    "overlayLabel": true,
    "description": "Südöstliche Inselgruppe mit bewaldeten Inseln und einem Gebirge auf der nördlichen Hauptinsel.",
    "kind": "square",
    "sourceMarkerShape": "square",
    "sourcePixelCentre": [
      5172.5,
      3723.5
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
      33.2581,
      81.7688
    ],
    "pin": [
      33.2581,
      77.9688
    ],
    "label": [
      33.2581,
      84.5688
    ],
    "overlayLabel": true,
    "description": "Südwestliche Insel mit Gebirgen im Norden, einem verzweigten Fluss und dichter Vegetation.",
    "kind": "square",
    "sourceMarkerShape": "square",
    "sourcePixelCentre": [
      2724.5,
      3841.5
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
      45.6238,
      85.9621
    ],
    "pin": [
      45.6238,
      82.1621
    ],
    "label": [
      45.6238,
      88.7621
    ],
    "overlayLabel": true,
    "description": "Südwestliche Insel mit Gebirgen im Norden, einem verzweigten Fluss und dichter Vegetation.",
    "kind": "circle",
    "sourceMarkerShape": "circle",
    "sourcePixelCentre": [
      3737.5,
      4038.5
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
      66.3391,
      89.155
    ],
    "pin": [
      66.3391,
      85.355
    ],
    "label": [
      66.3391,
      91.955
    ],
    "overlayLabel": true,
    "description": "Südöstliche Inselgruppe mit bewaldeten Inseln und einem Gebirge auf der nördlichen Hauptinsel.",
    "kind": "circle",
    "sourceMarkerShape": "circle",
    "sourcePixelCentre": [
      5434.5,
      4188.5
    ],
    "imperialDomain": false,
    "kindLabel": "Ort"
  },
  {
    "id": "ort-21",
    "name": "Ort 21",
    "nameStatus": "open",
    "regionId": "archonat-06",
    "archonateId": "archonat-06",
    "point": [
      39.1174,
      90.9004
    ],
    "pin": [
      39.1174,
      87.1004
    ],
    "label": [
      39.1174,
      93.7004
    ],
    "overlayLabel": true,
    "description": "Südwestliche Insel mit Gebirgen im Norden, einem verzweigten Fluss und dichter Vegetation.",
    "kind": "circle",
    "sourceMarkerShape": "circle",
    "sourcePixelCentre": [
      3204.5,
      4270.5
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
      55.7556,
      92.2201
    ],
    "pin": [
      55.7556,
      88.4201
    ],
    "label": [
      55.7556,
      95.0201
    ],
    "overlayLabel": true,
    "description": "Südöstliche Inselgruppe mit bewaldeten Inseln und einem Gebirge auf der nördlichen Hauptinsel.",
    "kind": "circle",
    "sourceMarkerShape": "circle",
    "sourcePixelCentre": [
      4567.5,
      4332.5
    ],
    "imperialDomain": false,
    "kindLabel": "Ort"
  }
].map(entry => Object.freeze(entry)));

export const SOURCE_HOUSE_SEATS = Object.freeze([
  {
    "houseId": "house-mede",
    "settlementId": "ort-06",
    "regionId": "imperial-domain",
    "status": "user-confirmed-imperial-domain"
  }
].map(entry => Object.freeze(entry)));
