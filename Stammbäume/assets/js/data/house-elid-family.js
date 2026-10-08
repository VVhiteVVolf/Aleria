import { createDamhSourceFamily } from './damh-source-family-builder.js';

// Elternpaare, Generationen und Sonderrollen nach Tabelle, Grafik und dokumentierten Korrekturen.
const SOURCE = Object.freeze({
  "personIds": [
    "vardan-founder-eoghainn",
    "zaorbha-founder-elid",
    "zachrach-1590-elid",
    "neidhe-1598-elid",
    "peathgho-1592-eoghainn",
    "donal-1595-dobhar",
    "tadhghan-1610-elid",
    "zaorbha-1612-elid",
    "zennia-1612-avernax",
    "aodhluan-1610-dianaomh",
    "greagoir-1630-elid",
    "valaigh-1636-elid",
    "xubhnan-1639-elid",
    "muireann-1631-grodach",
    "aoghan-1634-eoghainn",
    "vevila-1642-nemetex",
    "quaira-unknown-elid-31-3",
    "warin-1651-elid",
    "vardan-1654-elid",
    "rianach-1660-elid",
    "wrayne-1666-elid",
    "ionnrachtaigh-1647-durachd",
    "quiseog-1655-duff",
    "peathgho-1662-keravel",
    "unbekannte-unknown-elid-41-3",
    "tadhghan-1674-elid",
    "hurracan-1678-elid",
    "peathra-1680-elid",
    "zachrach-1686-elid",
    "brigh-1676-oglivy",
    "caoilfhionn-1677-agnew",
    "jaimhin-1679-forsyth",
    "unbekannte-unknown-elid-51-3",
    "greagoir-1694-elid",
    "zaorbha-1697-elid",
    "trianach-1704-elid",
    "zeargan-1706-elid",
    "xibhne-1708-elid",
    "tuarenn-1698-eoghainn",
    "luibheas-1695-duff",
    "unbekannte-unknown-elid-61-2",
    "unbekannte-unknown-elid-61-3",
    "vardan-1716-elid",
    "uisigh-1717-avernax",
    "xubhnan-1726-elid",
    "xarthan-1730-elid",
    "zibhi-1733-elid"
  ],
  "partnershipIds": [
    "marriage-vardan-founder-eoghainn--zaorbha-founder-elid",
    "marriage-peathgho-1592-eoghainn--zachrach-1590-elid",
    "marriage-donal-1595-dobhar--neidhe-1598-elid",
    "marriage-tadhghan-1610-elid--zennia-1612-avernax",
    "marriage-aodhluan-1610-dianaomh--zaorbha-1612-elid",
    "marriage-greagoir-1630-elid--muireann-1631-grodach",
    "marriage-aoghan-1634-eoghainn--valaigh-1636-elid",
    "marriage-vevila-1642-nemetex--xubhnan-1639-elid",
    "affair-quaira-unknown-elid-31-3--xubhnan-1639-elid",
    "marriage-ionnrachtaigh-1647-durachd--warin-1651-elid",
    "marriage-quiseog-1655-duff--vardan-1654-elid",
    "marriage-peathgho-1662-keravel--rianach-1660-elid",
    "marriage-unbekannte-unknown-elid-41-3--wrayne-1666-elid",
    "marriage-brigh-1676-oglivy--tadhghan-1674-elid",
    "marriage-caoilfhionn-1677-agnew--hurracan-1678-elid",
    "marriage-jaimhin-1679-forsyth--peathra-1680-elid",
    "marriage-unbekannte-unknown-elid-51-3--zachrach-1686-elid",
    "marriage-greagoir-1694-elid--tuarenn-1698-eoghainn",
    "marriage-luibheas-1695-duff--zaorbha-1697-elid",
    "marriage-unbekannte-unknown-elid-61-2--zeargan-1706-elid",
    "marriage-unbekannte-unknown-elid-61-3--xibhne-1708-elid"
  ],
  "descendants": [
    {
      "partnershipId": "marriage-vardan-founder-eoghainn--zaorbha-founder-elid",
      "childIds": [
        "zachrach-1590-elid",
        "neidhe-1598-elid"
      ],
      "timeJumpId": "gap-damh-elid-founders"
    },
    {
      "partnershipId": "marriage-peathgho-1592-eoghainn--zachrach-1590-elid",
      "childIds": [
        "tadhghan-1610-elid",
        "zaorbha-1612-elid"
      ]
    },
    {
      "partnershipId": "marriage-tadhghan-1610-elid--zennia-1612-avernax",
      "childIds": [
        "greagoir-1630-elid",
        "valaigh-1636-elid",
        "xubhnan-1639-elid"
      ]
    },
    {
      "partnershipId": "marriage-greagoir-1630-elid--muireann-1631-grodach",
      "childIds": [
        "warin-1651-elid",
        "vardan-1654-elid"
      ]
    },
    {
      "partnershipId": "marriage-vevila-1642-nemetex--xubhnan-1639-elid",
      "childIds": [
        "rianach-1660-elid"
      ]
    },
    {
      "partnershipId": "affair-quaira-unknown-elid-31-3--xubhnan-1639-elid",
      "childIds": [
        "wrayne-1666-elid"
      ],
      "legitimacy": "illegitimate"
    },
    {
      "partnershipId": "marriage-quiseog-1655-duff--vardan-1654-elid",
      "childIds": [
        "tadhghan-1674-elid",
        "hurracan-1678-elid"
      ]
    },
    {
      "partnershipId": "marriage-peathgho-1662-keravel--rianach-1660-elid",
      "childIds": [
        "peathra-1680-elid"
      ]
    },
    {
      "partnershipId": "marriage-unbekannte-unknown-elid-41-3--wrayne-1666-elid",
      "childIds": [
        "zachrach-1686-elid"
      ]
    },
    {
      "partnershipId": "marriage-brigh-1676-oglivy--tadhghan-1674-elid",
      "childIds": [
        "greagoir-1694-elid",
        "zaorbha-1697-elid",
        "trianach-1704-elid"
      ]
    },
    {
      "partnershipId": "marriage-unbekannte-unknown-elid-51-3--zachrach-1686-elid",
      "childIds": [
        "zeargan-1706-elid",
        "xibhne-1708-elid"
      ]
    },
    {
      "partnershipId": "marriage-greagoir-1694-elid--tuarenn-1698-eoghainn",
      "childIds": [
        "vardan-1716-elid"
      ]
    },
    {
      "partnershipId": "marriage-unbekannte-unknown-elid-61-2--zeargan-1706-elid",
      "childIds": [
        "xubhnan-1726-elid",
        "xarthan-1730-elid",
        "zibhi-1733-elid"
      ]
    }
  ],
  "away": [
    {
      "partnershipId": "marriage-donal-1595-dobhar--neidhe-1598-elid",
      "targetFamilyId": "haus-dobhar",
      "houseId": "house-dobhar"
    },
    {
      "partnershipId": "marriage-aodhluan-1610-dianaomh--zaorbha-1612-elid",
      "targetFamilyId": "haus-dianaomh",
      "houseId": "house-dianaomh"
    },
    {
      "partnershipId": "marriage-aoghan-1634-eoghainn--valaigh-1636-elid",
      "targetFamilyId": "haus-eoghainn",
      "houseId": "house-eoghainn"
    },
    {
      "partnershipId": "marriage-ionnrachtaigh-1647-durachd--warin-1651-elid",
      "targetFamilyId": "haus-durachd",
      "houseId": "house-durachd"
    },
    {
      "partnershipId": "marriage-caoilfhionn-1677-agnew--hurracan-1678-elid",
      "targetFamilyId": "haus-agnew",
      "houseId": "house-agnew"
    },
    {
      "partnershipId": "marriage-jaimhin-1679-forsyth--peathra-1680-elid",
      "targetFamilyId": "haus-forsyth",
      "houseId": "house-forsyth"
    },
    {
      "partnershipId": "marriage-luibheas-1695-duff--zaorbha-1697-elid",
      "targetFamilyId": "haus-duff",
      "houseId": "house-duff"
    }
  ],
  "cadets": [],
  "wards": [],
  "foster": [
    {
      "childId": "uisigh-1717-avernax",
      "parentId": "greagoir-1694-elid"
    },
    {
      "childId": "uisigh-1717-avernax",
      "parentId": "tuarenn-1698-eoghainn"
    }
  ],
  "heads": [],
  "titles": {},
  "personRoles": {
    "zachrach-1686-elid": "bastard",
    "zeargan-1706-elid": "bastard",
    "xibhne-1708-elid": "bastard",
    "xubhnan-1726-elid": "bastard",
    "xarthan-1730-elid": "bastard",
    "zibhi-1733-elid": "bastard",
    "wrayne-1666-elid": "bastard",
    "quaira-unknown-elid-31-3": "affair",
    "uisigh-1717-avernax": "ward"
  },
  "personExtensions": {
    "xubhnan-1639-elid": {
      "chartCenterBetweenPartnerPersonIds": [
        "vevila-1642-nemetex",
        "quaira-unknown-elid-31-3"
      ],
      "chartPartnerGroupPersonOrder": [
        "vevila-1642-nemetex",
        "xubhnan-1639-elid",
        "quaira-unknown-elid-31-3"
      ],
      "chartKeepPartnerGroupTogether": true
    }
  },
  "sourceNote": "Eine Überlieferungslücke. Vardán (*1716) und Mündel Uisigh Avernax (*1717) sind laut Nutzer korrigiert. Uisighs Pflegebeziehung begründet keine biologische Elternschaft. Wrayne stammt aus Xubhnáns Affäre mit Quaira. Die graue Nebenlinie wird über die sichtbaren Elternpaare weitergeführt; ihre unbenannten Ehepersonen bleiben Platzhalter.",
  "currentHeadId": "",
  "heirIds": [],
  "description": "Ó Mall Elid ist ein historisches Laird-Haus von Càrn Bruach in Tir na Damh. Als Stammeltern erscheinen Vardán Eoghainn und Zaorbha. Die überlieferte Folge teilt sich später in mehrere Zweige; zu ihnen gehört die auf Wrayne zurückgehende uneheliche Nebenlinie. Ehen verbinden Elid besonders mit Eoghainn, Dobhar, Dianaomh, Agnew und Forsyth. Uisigh Avernax ist als Mündel Gréagóirs und Tuarenns erfasst. Unbenannte Ehepersonen bleiben in den Familienverbindungen sichtbar.",
  "warriorReference": "",
  "partnershipExtensions": {
    "marriage-vevila-1642-nemetex--xubhnan-1639-elid": {
      "chartAlignPartnerOverChildrenPersonId": "vevila-1642-nemetex"
    },
    "affair-quaira-unknown-elid-31-3--xubhnan-1639-elid": {
      "chartAlignPartnerOverChildrenPersonId": "quaira-unknown-elid-31-3"
    }
  }
});

export const HOUSE_ELID_FAMILY = createDamhSourceFamily("elid", SOURCE);
