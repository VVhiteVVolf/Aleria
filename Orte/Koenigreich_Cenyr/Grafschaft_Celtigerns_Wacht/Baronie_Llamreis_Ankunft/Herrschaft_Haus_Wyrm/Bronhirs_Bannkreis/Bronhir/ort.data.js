(function () {
  "use strict";

  const createPlaceData = window.ALERIA_CELTIGERNS_PLACES?.createPlaceData;
  if (typeof createPlaceData !== "function") return;

  const base = createPlaceData("bronhir", {
    "parentage": {
      "barony": "Llamreis Ankunft",
      "liege": "Haus Wyrm"
    },
    "features": {
      "districts": false,
      "noticeBoard": true
    },
    "presentation": {
      "map": "/Karten/karte.html?map=cenyr-celtigerns-wacht-llamrais-ankunft-wyrm-bronhir-stadtkarte",
      "images": {
        "bild-einer-stadtwache-png": {
          "src": "/Orte/Koenigreich_Cenyr/Grafschaft_Celtigerns_Wacht/Baronie_Llamreis_Ankunft/Herrschaft_Haus_Wyrm/Bronhirs_Bannkreis/Bronhir/assets/wache.png",
          "alt": "Wache von Bronhir",
          "fit": "contain"
        },
        "karten-bild-png": {
          "src": "/Karten/Cenyr/celtigerns-wacht/llamrais-ankunft/herrschaft-der-wyrm/bronhir-bannkreis/bronhir/Kartenbilder/BronhirStadt.webp",
          "alt": "Ortskarte von Bronhir",
          "href": "/Karten/karte.html?map=cenyr-celtigerns-wacht-llamrais-ankunft-wyrm-bronhir-stadtkarte",
          "fit": "contain"
        },
        "icon-png": {
          "src": "/Orte/Koenigreich_Cenyr/Grafschaft_Celtigerns_Wacht/Baronie_Llamreis_Ankunft/Herrschaft_Haus_Wyrm/Bronhirs_Bannkreis/Bronhir/assets/wappen.png",
          "alt": "Wappen von Bronhir",
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
        "Die Redaktion für Bronhir ist vorbereitet. Besetzung und Beiträge folgen.",
        {
          "type": "subheading",
          "text": "Der Schwarzbote"
        },
        "Die Redaktion für Bronhir ist vorbereitet. Besetzung und Beiträge folgen."
      ]
    }
  });

  window.ORT_DATA = Object.freeze({
    ...base,
    "structure": {
      "land": "Königreich Cenyr",
      "provinz": "Celtigerns Wacht",
      "region": "Baronie Llamreis Ankunft",
      "name": "Bronhir",
      "herrschaft": "Lehenswart Rhain Cludwyr; Bürgermeister Trachmyr Trevandir",
      "lehnsherr": "Haus Wyrm",
      "vorherrschender adel": "Haus Wyrm",
      "bekannte familien": "Cludwyr"
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
      },
      {
        "title": "Ritterhäuser",
        "items": [
          {
            "name": "Haus Cludwyr",
            "rank": "Ritterhaus",
            "seat": "Gwynthor und Bronhir",
            "liege": "Haus Wyrm",
            "familyId": "haus-cludwyr",
            "emblem": "/Stammbäume/assets/images/houses/Llamreis Ankunft/haus-cludwyr.png"
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
            "name": "Rhain Cludwyr",
            "role": "Lehenswart",
            "description": [],
            "portrait": "/Stammbäume/assets/images/portraits/haus-cludwyr/rhain-cludwyr.jpg"
          },
          {
            "name": "Trachmyr Trevandir",
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
      "mapId": "cenyr-celtigerns-wacht-llamrais-ankunft-wyrm-bronhir-bannkreis",
      "title": "Bronhir – Bannkreis",
      "embedHref": "/Karten/karte.html?map=cenyr-celtigerns-wacht-llamrais-ankunft-wyrm-bronhir-bannkreis",
      "fullHref": "/Karten/karte.html?map=cenyr-celtigerns-wacht-llamrais-ankunft-wyrm-bronhir-bannkreis",
      "pois": []
    }
  });
})();
