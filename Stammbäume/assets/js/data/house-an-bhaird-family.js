import { createCeitheachSourceFamily } from './ceitheach-source-family-builder.js';
import { CEITHEACH_ADDITIONAL_SOURCE_CATALOG } from './ceitheach-additional-source-catalog.js';

// Elternpaare und Kinder nach beschrifteter Tabelle und Stammbaumgrafik.
const SOURCE = Object.freeze({
  "personIds": [
    "eachan-founder-bhaird",
    "aoifean-unknown-an-bhaird-founder",
    "fergusach-1582-bhaird",
    "ailis-1586-bhaird",
    "nora-1585-tordarroch",
    "reamonn-1581-mochoe",
    "eachan-bhaird",
    "aoifean-1612-bhaird",
    "grian-1610-rochraide",
    "carthann-ghaisgh",
    "eanraig-bhaird",
    "dervla-bhaird",
    "jowan-bhaird",
    "ziocha-1632-eldath",
    "garbhan-eldath",
    "teasag-eamhra",
    "fergusach-1650-bhaird",
    "harailt-bhaird",
    "eilidh-bhaird",
    "kester-bhaird",
    "bridan-tuirseach",
    "iseabail-ceinselaig",
    "ruaidhrigh-holloran",
    "doirind-seaghdha",
    "aonghus-bhaird",
    "aoifean-bhaird",
    "eachan-1670-bhaird",
    "ailis-1680-bhaird",
    "muireann-1676-mochoe",
    "jathghal-rochraide",
    "dalara-riangabra",
    "orthanach-1677-cleirigh",
    "jowan-1698-bhaird",
    "banba-bhaird",
    "eanraig-1699-bhaird",
    "dervla-1702-bhaird",
    "gillebride-ceinselaig",
    "calum-tordarroch"
  ],
  "partnershipIds": [
    "marriage-aoifean-unknown-an-bhaird-founder--eachan-founder-bhaird",
    "marriage-fergusach-1582-bhaird--nora-1585-tordarroch",
    "marriage-ailis-1586-bhaird--reamonn-1581-mochoe",
    "marriage-eachan-bhaird--grian-1610-rochraide",
    "marriage-aoifean-1612-bhaird--carthann-ghaisgh",
    "marriage-eanraig-bhaird--ziocha-1632-eldath",
    "marriage-dervla-bhaird--garbhan-eldath",
    "marriage-jowan-bhaird--teasag-eamhra",
    "marriage-bridan-tuirseach--fergusach-1650-bhaird",
    "marriage-harailt-bhaird--iseabail-ceinselaig",
    "marriage-eilidh-bhaird--ruaidhrigh-holloran",
    "marriage-doirind-seaghdha--kester-bhaird",
    "marriage-aonghus-bhaird--muireann-1676-mochoe",
    "marriage-aoifean-bhaird--jathghal-rochraide",
    "marriage-dalara-riangabra--eachan-1670-bhaird",
    "marriage-ailis-1680-bhaird--orthanach-1677-cleirigh",
    "engagement-banba-bhaird--gillebride-ceinselaig",
    "marriage-calum-tordarroch--dervla-1702-bhaird"
  ],
  "descendants": [
    {
      "partnershipId": "marriage-aoifean-unknown-an-bhaird-founder--eachan-founder-bhaird",
      "childIds": [
        "fergusach-1582-bhaird",
        "ailis-1586-bhaird"
      ],
      "timeJumpId": "gap-an-bhaird-founder"
    },
    {
      "partnershipId": "marriage-fergusach-1582-bhaird--nora-1585-tordarroch",
      "childIds": [
        "eachan-bhaird",
        "aoifean-1612-bhaird"
      ]
    },
    {
      "partnershipId": "marriage-eachan-bhaird--grian-1610-rochraide",
      "childIds": [
        "eanraig-bhaird",
        "dervla-bhaird",
        "jowan-bhaird"
      ]
    },
    {
      "partnershipId": "marriage-eanraig-bhaird--ziocha-1632-eldath",
      "childIds": [
        "fergusach-1650-bhaird",
        "harailt-bhaird"
      ]
    },
    {
      "partnershipId": "marriage-jowan-bhaird--teasag-eamhra",
      "childIds": [
        "eilidh-bhaird",
        "kester-bhaird"
      ]
    },
    {
      "partnershipId": "marriage-bridan-tuirseach--fergusach-1650-bhaird",
      "childIds": [
        "aonghus-bhaird",
        "aoifean-bhaird"
      ]
    },
    {
      "partnershipId": "marriage-doirind-seaghdha--kester-bhaird",
      "childIds": [
        "eachan-1670-bhaird",
        "ailis-1680-bhaird"
      ]
    },
    {
      "partnershipId": "marriage-aonghus-bhaird--muireann-1676-mochoe",
      "childIds": [
        "jowan-1698-bhaird",
        "banba-bhaird"
      ]
    },
    {
      "partnershipId": "marriage-dalara-riangabra--eachan-1670-bhaird",
      "childIds": [
        "eanraig-1699-bhaird",
        "dervla-1702-bhaird"
      ]
    }
  ],
  "away": [
    {
      "partnershipId": "marriage-ailis-1586-bhaird--reamonn-1581-mochoe",
      "targetFamilyId": "haus-an-morchoe",
      "houseId": "house-an-morchoe"
    },
    {
      "partnershipId": "marriage-aoifean-1612-bhaird--carthann-ghaisgh",
      "targetFamilyId": "haus-ghaisgh",
      "houseId": "house-ghaisgh"
    },
    {
      "partnershipId": "marriage-dervla-bhaird--garbhan-eldath",
      "targetFamilyId": "haus-eldath",
      "houseId": "house-eldath"
    },
    {
      "partnershipId": "marriage-harailt-bhaird--iseabail-ceinselaig",
      "targetFamilyId": "haus-ua-nic-ceinselaig",
      "houseId": "house-ua-nic-ceinselaig"
    },
    {
      "partnershipId": "marriage-eilidh-bhaird--ruaidhrigh-holloran",
      "targetFamilyId": "haus-nic-holloran",
      "houseId": "house-nic-holloran"
    },
    {
      "partnershipId": "marriage-aoifean-bhaird--jathghal-rochraide",
      "targetFamilyId": "haus-ui-rochraide",
      "houseId": "house-rochraide"
    },
    {
      "partnershipId": "marriage-ailis-1680-bhaird--orthanach-1677-cleirigh",
      "targetFamilyId": "haus-cleirigh",
      "houseId": "house-cleirigh"
    },
    {
      "partnershipId": "engagement-banba-bhaird--gillebride-ceinselaig",
      "targetFamilyId": "haus-ua-nic-ceinselaig",
      "houseId": "house-ua-nic-ceinselaig"
    },
    {
      "partnershipId": "marriage-calum-tordarroch--dervla-1702-bhaird",
      "targetFamilyId": "haus-tir-an-tordarroch",
      "houseId": "house-tir-an-tordarroch"
    }
  ],
  "cadets": [],
  "wards": [],
  "historicalWards": [],
  "heads": [
    "eachan-founder-bhaird",
    "fergusach-1582-bhaird",
    "eachan-bhaird",
    "eanraig-bhaird",
    "fergusach-1650-bhaird",
    "aonghus-bhaird"
  ],
  "titles": {
    "eachan-founder-bhaird": "Legendärer Gründer des Clans",
    "fergusach-1582-bhaird": "Oberhaupt bis 1649",
    "eachan-bhaird": "Oberhaupt 1649–1670",
    "eanraig-bhaird": "Oberhaupt 1670–1691",
    "fergusach-1650-bhaird": "Oberhaupt 1691–1714",
    "aonghus-bhaird": "Oberhaupt 1714–1720"
  },
  "personRoles": {},
  "sourceNote": "Ein serieller Quellenzeitsprung. Die wiederholten Vornamen Fergusach, Eachan, Aoifean, Jowan und Dervla bleiben nach Generation getrennt. Banbas Verbindung ist eine Verlobung; Dervla und Calum sind verheiratet."
});

export const HOUSE_AN_BHAIRD_FAMILY = createCeitheachSourceFamily('an-bhaird', SOURCE, CEITHEACH_ADDITIONAL_SOURCE_CATALOG);
