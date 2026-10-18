import { createTerritory } from '../../../../modules/vortigerns-ruh/territory-page.mjs';

export default createTerritory({
  "id": "herrschaft-cath",
  "title": "Herrschaft der Cath",
  "shortTitle": "Cath",
  "type": "Herrschaft",
  "crestSrc": "/Stammbäume/assets/images/houses/Vortigerns Ruh/Tanwens Flamme/haus-cath.png",
  "crestAlt": "Wappen Cath",
  "kicker": "Herrschaft in Vortigerns Ruh",
  "parentHref": "../Grafschaft Vortigerns Ruh.html",
  "parentLabel": "Vortigerns Ruh",
  "hierarchy": [
    {
      "type": "Sammlung",
      "name": "Kontinente",
      "slug": "kontinente"
    },
    {
      "type": "Kontinent",
      "name": "Estryll",
      "slug": "estryll"
    },
    {
      "type": "Königreich",
      "name": "Cenyr",
      "slug": "cenyr"
    },
    {
      "type": "Grafschaft",
      "name": "Vortigerns Ruh",
      "slug": "vortigerns-ruh"
    },
    {
      "type": "Herrschaft",
      "name": "Cath",
      "slug": "cath"
    }
  ],
  "infobox": [
    {
      "title": "Allgemein",
      "rows": [
        {
          "label": "Name",
          "value": "Herrschaft der Cath"
        },
        {
          "label": "Typ",
          "value": "Herrschaft"
        },
        {
          "label": "Oberhaupt",
          "value": "Blegwyrd Cath"
        },
        {
          "label": "Verwaltungssitz",
          "value": "Mathragon"
        },
        {
          "label": "Ort",
          "value": "Königliche Grafschaft Vortigerns Ruh"
        }
      ]
    },
    {
      "title": "Geographie",
      "rows": [
        {
          "label": "Region",
          "value": "Königreich Cenyr"
        }
      ]
    },
    {
      "title": "Kultur",
      "rows": [
        {
          "label": "Volksgruppen",
          "value": "Cenyri"
        },
        {
          "label": "Religion",
          "value": "Alerische Kirche"
        }
      ]
    }
  ],
  "copy": {
    "overview": [],
    "history": [],
    "culture": [
      "..."
    ],
    "economy": [
      "Die Cath besitzen insgeheim einige Tavernen, verstreut über Cenyr."
    ],
    "defense": [
      "...."
    ],
    "geography": [
      "..."
    ],
    "flora": [
      "..."
    ],
    "trivia": []
  },
  "floraSections": [],
  "families": [
    {
      "title": "Herrschendes Haus",
      "houses": [
        {
          "name": "Cath",
          "familyId": "haus-cath",
          "imageSrc": "/Stammbäume/assets/images/houses/Vortigerns Ruh/Tanwens Flamme/haus-cath.png",
          "seat": "Mathragon",
          "liege": "Haus Pendrag",
          "rank": "Ritterfürstenhaus",
          "featured": true,
          "featuredLabel": "Ritterfürstenhaus"
        }
      ]
    }
  ],
  "councilGroups": [
    {
      "title": "Ritterfürst",
      "members": [
        {
          "office": "Ritterfürst",
          "name": "Blegwyrd Cath",
          "seat": "",
          "imageSrc": "/Stammbäume/assets/images/portraits/haus-cath/blegwyrd-cath.png",
          "familyId": "haus-cath",
          "featured": true
        }
      ]
    },
    {
      "title": "Ratsämter",
      "members": [
        {
          "office": "Marschall des Ritterfürst",
          "name": "",
          "seat": "",
          "imageSrc": "",
          "familyId": "",
          "featured": false
        },
        {
          "office": "Kämmerer des Ritterfürst",
          "name": "",
          "seat": "",
          "imageSrc": "",
          "familyId": "",
          "featured": false
        },
        {
          "office": "Justiziar des Ritterfürst",
          "name": "",
          "seat": "",
          "imageSrc": "",
          "familyId": "",
          "featured": false
        },
        {
          "office": "Schatten des Ritterfürst",
          "name": "",
          "seat": "",
          "imageSrc": "",
          "familyId": "",
          "featured": false
        },
        {
          "office": "Herold des Ritterfürst",
          "name": "",
          "seat": "",
          "imageSrc": "",
          "familyId": "",
          "featured": false
        },
        {
          "office": "Ratsmagier des Ritterfürst",
          "name": "",
          "seat": "",
          "imageSrc": "",
          "familyId": "",
          "featured": false
        },
        {
          "office": "Vikar des Ritterfürst",
          "name": "",
          "seat": "",
          "imageSrc": "",
          "familyId": "",
          "featured": false
        },
        {
          "office": "Barde des Ritterfürst",
          "name": "",
          "seat": "",
          "imageSrc": "",
          "familyId": "",
          "featured": false
        }
      ]
    }
  ],
  "vassalGroups": [
    {
      "title": "Vasallen",
      "members": [
        {
          "office": "",
          "name": "",
          "seat": "Castell Cath",
          "imageSrc": "",
          "familyId": "",
          "featured": false
        },
        {
          "office": "",
          "name": "",
          "seat": "Zum Königsweg",
          "imageSrc": "",
          "familyId": "",
          "featured": false
        },
        {
          "office": "",
          "name": "",
          "seat": "Zum Grauen Pfad",
          "imageSrc": "",
          "familyId": "",
          "featured": false
        }
      ]
    }
  ],
  "domains": [
    {
      "title": "Herrschaft der Cath",
      "page": "Herrschaft der Cath/Herrschaft der Cath.html",
      "crestSrc": "/Stammbäume/assets/images/houses/Vortigerns Ruh/Tanwens Flamme/haus-cath.png",
      "crestAlt": "Wappen Haus Cath",
      "center": "Mathragon",
      "sections": [
        {
          "title": "Siedlungen und Orte",
          "placeIds": [
            "vortigern-castell-cath",
            "vortigern-zum-konigsweg",
            "vortigern-zum-grunen-pfad"
          ]
        }
      ]
    }
  ]
});
