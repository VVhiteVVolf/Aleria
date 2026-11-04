/** Measured source geometry with proposal names and editable starting seats. */
export const MAP_VARIANTS = Object.freeze([
  {
    "id": "normal",
    "number": 1,
    "file": "Solestia (Normal).png",
    "short": "Landschaft",
    "map": "assets/maps/solestia-normal.webp",
    "imageSize": [
      3604,
      4096
    ],
    "bakedNames": false
  },
  {
    "id": "regions",
    "number": 2,
    "file": "Solestia Regionen.png",
    "short": "Baronien",
    "map": "assets/maps/solestia-regions.webp",
    "imageSize": [
      3604,
      4096
    ],
    "bakedNames": false
  }
].map(entry => Object.freeze(entry)));

export const REGIONS = Object.freeze([
  {
    "id": "ducal-domain",
    "name": "Herzogliche Domäne",
    "kindLabel": "Herzogliche Domäne",
    "ducalDomain": true,
    "colour": "#9fa83b",
    "capitalId": "ort-01",
    "cityIds": [
      "ort-01"
    ],
    "description": "Die herzogliche Hauptstadt liegt im Norden unterhalb des Bergkamms, am oberen Lauf des nach Süden fließenden Flusses.",
    "houseId": "house-ducal"
  },
  {
    "id": "baronie-01",
    "name": "Baronie Ardovela",
    "kindLabel": "Baronie",
    "ducalDomain": false,
    "colour": "#71844b",
    "capitalId": "ort-02",
    "cityIds": [
      "ort-02"
    ],
    "description": "Die nordöstliche Küstenbaronie grenzt an die herzogliche Domäne und bewaldete Höhenzüge.",
    "houseId": "pool-01"
  },
  {
    "id": "baronie-02",
    "name": "Baronie Orvessa",
    "kindLabel": "Baronie",
    "ducalDomain": false,
    "colour": "#71844b",
    "capitalId": "ort-03",
    "cityIds": [
      "ort-03"
    ],
    "description": "Die nördliche Binnenbaronie liegt an einer Flussbiegung zwischen der Domäne und den östlichen Küstenlanden.",
    "houseId": "pool-02"
  },
  {
    "id": "baronie-03",
    "name": "Baronie Pedralba",
    "kindLabel": "Baronie",
    "ducalDomain": false,
    "colour": "#71844b",
    "capitalId": "ort-04",
    "cityIds": [
      "ort-04"
    ],
    "description": "Die westliche Baronie reicht bis an die schützenden Gebirgszüge und eine schmale Flussmündung.",
    "houseId": "pool-03"
  },
  {
    "id": "baronie-04",
    "name": "Baronie Belnara",
    "kindLabel": "Baronie",
    "ducalDomain": false,
    "colour": "#71844b",
    "capitalId": "ort-05",
    "cityIds": [
      "ort-05"
    ],
    "description": "Die zentrale Baronie liegt zwischen zwei Buchten, Wäldern und niedrigen Höhenzügen.",
    "houseId": "pool-04"
  },
  {
    "id": "baronie-05",
    "name": "Baronie Neravona",
    "kindLabel": "Baronie",
    "ducalDomain": false,
    "colour": "#71844b",
    "capitalId": "ort-06",
    "cityIds": [
      "ort-06"
    ],
    "description": "Die östliche Küstenbaronie umfasst die breite Landzunge zwischen zwei Mündungsarmen.",
    "houseId": "pool-05"
  },
  {
    "id": "baronie-06",
    "name": "Baronie Vilarro",
    "kindLabel": "Baronie",
    "ducalDomain": false,
    "colour": "#71844b",
    "capitalId": "ort-07",
    "cityIds": [
      "ort-07"
    ],
    "description": "Die südliche Mittelbaronie liegt auf einer von Wasserläufen umgebenen Landzunge mit bewaldeten Höhen.",
    "houseId": "pool-06"
  },
  {
    "id": "baronie-07",
    "name": "Baronie Ordelva",
    "kindLabel": "Baronie",
    "ducalDomain": false,
    "colour": "#71844b",
    "capitalId": "ort-08",
    "cityIds": [
      "ort-08"
    ],
    "description": "Die südwestliche Binnenbaronie grenzt an die westlichen Berge und den südlichen Wasserlauf.",
    "houseId": "pool-07"
  },
  {
    "id": "baronie-08",
    "name": "Baronie Lusendra",
    "kindLabel": "Baronie",
    "ducalDomain": false,
    "colour": "#71844b",
    "capitalId": "ort-09",
    "cityIds": [
      "ort-09"
    ],
    "description": "Die südöstliche Inselbaronie liegt jenseits der schmalen Meeresarme und ist überwiegend bewaldet.",
    "houseId": "pool-08"
  },
  {
    "id": "baronie-09",
    "name": "Baronie Estenara",
    "kindLabel": "Baronie",
    "ducalDomain": false,
    "colour": "#71844b",
    "capitalId": "ort-10",
    "cityIds": [
      "ort-10"
    ],
    "description": "Die südwestliche Küstenbaronie umfasst einen langen bewaldeten Landstreifen zwischen Gebirge und Mündungsarmen.",
    "houseId": "pool-09"
  }
].map(entry => Object.freeze(entry)));

export const BARONIES = Object.freeze(REGIONS.filter(region => !region.ducalDomain));
export const DUCAL_DOMAIN = REGIONS.find(region => region.ducalDomain);

export const SETTLEMENTS = Object.freeze([
  {
    "id": "ort-01",
    "name": "Valdoria",
    "nameStatus": "proposal",
    "regionId": "ducal-domain",
    "point": [
      37.6006,
      13.6929
    ],
    "pin": [
      37.6006,
      8.6929
    ],
    "label": [
      37.6006,
      16.0929
    ],
    "overlayLabel": true,
    "sourcePixelCentre": [
      1355.5,
      561
    ],
    "sourceMarkerShape": "diamond",
    "kind": "diamond",
    "kindLabel": "Hauptstadt · Herzogliche Domäne",
    "ducalDomain": true,
    "description": "Die herzogliche Hauptstadt liegt im Norden unterhalb des Bergkamms, am oberen Lauf des nach Süden fließenden Flusses."
  },
  {
    "id": "ort-02",
    "name": "Ardovela",
    "nameStatus": "proposal",
    "regionId": "baronie-01",
    "point": [
      67.9334,
      25.5065
    ],
    "pin": [
      67.9334,
      21.8065
    ],
    "label": [
      67.9334,
      27.9065
    ],
    "overlayLabel": true,
    "sourcePixelCentre": [
      2449,
      1045
    ],
    "sourceMarkerShape": "square",
    "kind": "square",
    "kindLabel": "Stadt einer Baronie",
    "ducalDomain": false,
    "description": "Die nordöstliche Küstenbaronie grenzt an die herzogliche Domäne und bewaldete Höhenzüge."
  },
  {
    "id": "ort-03",
    "name": "Orvessa",
    "nameStatus": "proposal",
    "regionId": "baronie-02",
    "point": [
      51.595,
      30.4613
    ],
    "pin": [
      51.595,
      26.7613
    ],
    "label": [
      51.595,
      32.8613
    ],
    "overlayLabel": true,
    "sourcePixelCentre": [
      1860,
      1248
    ],
    "sourceMarkerShape": "square",
    "kind": "square",
    "kindLabel": "Stadt einer Baronie",
    "ducalDomain": false,
    "description": "Die nördliche Binnenbaronie liegt an einer Flussbiegung zwischen der Domäne und den östlichen Küstenlanden."
  },
  {
    "id": "ort-04",
    "name": "Pedralba",
    "nameStatus": "proposal",
    "regionId": "baronie-03",
    "point": [
      8.6685,
      34.9768
    ],
    "pin": [
      8.6685,
      31.2768
    ],
    "label": [
      8.6685,
      37.3768
    ],
    "overlayLabel": true,
    "sourcePixelCentre": [
      312.5,
      1433
    ],
    "sourceMarkerShape": "square",
    "kind": "square",
    "kindLabel": "Stadt einer Baronie",
    "ducalDomain": false,
    "description": "Die westliche Baronie reicht bis an die schützenden Gebirgszüge und eine schmale Flussmündung."
  },
  {
    "id": "ort-05",
    "name": "Belnara",
    "nameStatus": "proposal",
    "regionId": "baronie-04",
    "point": [
      40.2774,
      39.3215
    ],
    "pin": [
      40.2774,
      35.6215
    ],
    "label": [
      40.2774,
      41.7215
    ],
    "overlayLabel": true,
    "sourcePixelCentre": [
      1452,
      1611
    ],
    "sourceMarkerShape": "square",
    "kind": "square",
    "kindLabel": "Stadt einer Baronie",
    "ducalDomain": false,
    "description": "Die zentrale Baronie liegt zwischen zwei Buchten, Wäldern und niedrigen Höhenzügen."
  },
  {
    "id": "ort-06",
    "name": "Neravona",
    "nameStatus": "proposal",
    "regionId": "baronie-05",
    "point": [
      82.7462,
      44.3007
    ],
    "pin": [
      82.7462,
      40.6007
    ],
    "label": [
      82.7462,
      46.7007
    ],
    "overlayLabel": true,
    "sourcePixelCentre": [
      2983,
      1815
    ],
    "sourceMarkerShape": "square",
    "kind": "square",
    "kindLabel": "Stadt einer Baronie",
    "ducalDomain": false,
    "description": "Die östliche Küstenbaronie umfasst die breite Landzunge zwischen zwei Mündungsarmen."
  },
  {
    "id": "ort-07",
    "name": "Vilarro",
    "nameStatus": "proposal",
    "regionId": "baronie-06",
    "point": [
      54.5631,
      54.723
    ],
    "pin": [
      54.5631,
      51.023
    ],
    "label": [
      54.5631,
      57.123
    ],
    "overlayLabel": true,
    "sourcePixelCentre": [
      1967,
      2242
    ],
    "sourceMarkerShape": "square",
    "kind": "square",
    "kindLabel": "Stadt einer Baronie",
    "ducalDomain": false,
    "description": "Die südliche Mittelbaronie liegt auf einer von Wasserläufen umgebenen Landzunge mit bewaldeten Höhen."
  },
  {
    "id": "ort-08",
    "name": "Ordelva",
    "nameStatus": "proposal",
    "regionId": "baronie-07",
    "point": [
      23.4951,
      58.6039
    ],
    "pin": [
      23.4951,
      54.9039
    ],
    "label": [
      23.4951,
      61.0039
    ],
    "overlayLabel": true,
    "sourcePixelCentre": [
      847,
      2401
    ],
    "sourceMarkerShape": "square",
    "kind": "square",
    "kindLabel": "Stadt einer Baronie",
    "ducalDomain": false,
    "description": "Die südwestliche Binnenbaronie grenzt an die westlichen Berge und den südlichen Wasserlauf."
  },
  {
    "id": "ort-09",
    "name": "Lusendra",
    "nameStatus": "proposal",
    "regionId": "baronie-08",
    "point": [
      65.9639,
      71.1008
    ],
    "pin": [
      65.9639,
      67.4008
    ],
    "label": [
      65.9639,
      73.5008
    ],
    "overlayLabel": true,
    "sourcePixelCentre": [
      2378,
      2913
    ],
    "sourceMarkerShape": "square",
    "kind": "square",
    "kindLabel": "Stadt einer Baronie",
    "ducalDomain": false,
    "description": "Die südöstliche Inselbaronie liegt jenseits der schmalen Meeresarme und ist überwiegend bewaldet."
  },
  {
    "id": "ort-10",
    "name": "Estenara",
    "nameStatus": "proposal",
    "regionId": "baronie-09",
    "point": [
      33.0513,
      75.9702
    ],
    "pin": [
      33.0513,
      72.2702
    ],
    "label": [
      33.0513,
      78.3702
    ],
    "overlayLabel": true,
    "sourcePixelCentre": [
      1191.5,
      3112.5
    ],
    "sourceMarkerShape": "square",
    "kind": "square",
    "kindLabel": "Stadt einer Baronie",
    "ducalDomain": false,
    "description": "Die südwestliche Küstenbaronie umfasst einen langen bewaldeten Landstreifen zwischen Gebirge und Mündungsarmen."
  }
].map(entry => Object.freeze(entry)));

export const SOURCE_HOUSE_SEATS = Object.freeze([
  {
    "houseId": "house-ducal",
    "settlementId": "ort-01",
    "regionId": "ducal-domain"
  },
  {
    "houseId": "pool-01",
    "settlementId": "ort-02",
    "regionId": "baronie-01"
  },
  {
    "houseId": "pool-02",
    "settlementId": "ort-03",
    "regionId": "baronie-02"
  },
  {
    "houseId": "pool-03",
    "settlementId": "ort-04",
    "regionId": "baronie-03"
  },
  {
    "houseId": "pool-04",
    "settlementId": "ort-05",
    "regionId": "baronie-04"
  },
  {
    "houseId": "pool-05",
    "settlementId": "ort-06",
    "regionId": "baronie-05"
  },
  {
    "houseId": "pool-06",
    "settlementId": "ort-07",
    "regionId": "baronie-06"
  },
  {
    "houseId": "pool-07",
    "settlementId": "ort-08",
    "regionId": "baronie-07"
  },
  {
    "houseId": "pool-08",
    "settlementId": "ort-09",
    "regionId": "baronie-08"
  },
  {
    "houseId": "pool-09",
    "settlementId": "ort-10",
    "regionId": "baronie-09"
  },
  {
    "houseId": "pool-10",
    "settlementId": "ort-01",
    "regionId": "ducal-domain"
  },
  {
    "houseId": "pool-11",
    "settlementId": "ort-01",
    "regionId": "ducal-domain"
  }
].map(entry => Object.freeze(entry)));
