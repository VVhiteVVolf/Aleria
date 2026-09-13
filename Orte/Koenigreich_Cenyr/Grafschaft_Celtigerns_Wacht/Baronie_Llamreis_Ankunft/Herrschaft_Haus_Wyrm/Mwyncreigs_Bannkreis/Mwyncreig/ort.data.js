(function () {
  "use strict";

  const createPlaceData = window.ALERIA_CELTIGERNS_PLACES?.createPlaceData;
  if (typeof createPlaceData !== "function") return;

  const base = createPlaceData("mwyncreig", {
    "parentage": {
      "barony": "Llamreis Ankunft",
      "liege": "Haus Wyrm"
    },
    "features": {
      "districts": false,
      "noticeBoard": true
    },
    "presentation": {
      "map": "/Karten/karte.html?map=cenyr-celtigerns-wacht-llamrais-ankunft-wyrm-mwyncreig-stadtkarte",
      "images": {
        "bild-einer-stadtwache-png": {
          "src": "/Orte/Koenigreich_Cenyr/Grafschaft_Celtigerns_Wacht/Baronie_Llamreis_Ankunft/Herrschaft_Haus_Wyrm/Mwyncreigs_Bannkreis/Mwyncreig/assets/wache.png",
          "alt": "Wache von Mwyncreig",
          "fit": "contain"
        },
        "karten-bild-png": {
          "src": "/Karten/Cenyr/celtigerns-wacht/llamrais-ankunft/herrschaft-der-wyrm/mwyncreig-bannkreis/mwyncreig/Kartenbilder/MwyncreigStadt.webp",
          "alt": "Ortskarte von Mwyncreig",
          "href": "/Karten/karte.html?map=cenyr-celtigerns-wacht-llamrais-ankunft-wyrm-mwyncreig-stadtkarte",
          "fit": "contain"
        },
        "icon-png": {
          "src": "/Orte/Koenigreich_Cenyr/Grafschaft_Celtigerns_Wacht/Baronie_Llamreis_Ankunft/Herrschaft_Haus_Wyrm/Mwyncreigs_Bannkreis/Mwyncreig/assets/wappen.png",
          "alt": "Wappen von Mwyncreig",
          "fit": "contain"
        }
      }
    },
    "sections": {
      "newspaper": [
        {
          "type": "subheading",
          "text": "Celtigerns Echo"
        },
        "Die Redaktion für Mwyncreig ist vorbereitet. Besetzung und Beiträge folgen.",
        {
          "type": "subheading",
          "text": "Der Schwarzbote"
        },
        "Die Redaktion für Mwyncreig ist vorbereitet. Besetzung und Beiträge folgen."
      ]
    }
  });

  window.ORT_DATA = Object.freeze({
    ...base,
    "structure": {
      "land": "Königreich Cenyr",
      "provinz": "Celtigerns Wacht",
      "region": "Baronie Llamreis Ankunft",
      "name": "Mwyncreig",
      "herrschaft": "Bürgermeister Pendaran Maelorin",
      "lehnsherr": "Haus Wyrm",
      "vorherrschender adel": "Haus Wyrm",
      "gewerbe": "Bergbau"
    },
    "houses": [
      {
        "title": "Ritterfürsten",
        "items": [
          {
            "name": "Haus Wyrm",
            "rank": "Ritterfürstlich",
            "seat": "Gwynthor",
            "liege": "Haus Draig",
            "familyId": "haus-wyrm",
            "emblem": "/Orte/modules/houses/assets/wyrm-legacy.png"
          }
        ]
      }
    ],
    "merchants": [],
    "personalities": [
      {
        "id": "administration",
        "title": "Administration & Verwaltung",
        "items": [
          {
            "name": "Pendaran Maelorin",
            "role": "Bürgermeister",
            "description": [],
            "portrait": ""
          }
        ]
      },
      {
        "id": "levy",
        "title": "Aufgebot",
        "items": []
      },
      {
        "id": "other",
        "title": "Sonstige",
        "items": []
      }
    ],
    "regionMap": {
      "mapId": "cenyr-celtigerns-wacht-llamrais-ankunft-wyrm-mwyncreig-bannkreis",
      "title": "Mwyncreig – Bannkreis",
      "embedHref": "/Karten/karte.html?map=cenyr-celtigerns-wacht-llamrais-ankunft-wyrm-mwyncreig-bannkreis",
      "fullHref": "/Karten/karte.html?map=cenyr-celtigerns-wacht-llamrais-ankunft-wyrm-mwyncreig-bannkreis",
      "pois": []
    }
  });
})();
