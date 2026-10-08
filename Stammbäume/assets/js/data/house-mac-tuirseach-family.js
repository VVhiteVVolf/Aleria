import { withBlaithneachSourceCounterUpgrade } from './blaithneach-source-counter-upgrade.js';
import { createCeitheachSourceFamily } from './ceitheach-source-family-builder.js';
import { CEITHEACH_ADDITIONAL_SOURCE_CATALOG } from './ceitheach-additional-source-catalog.js';

// Elternpaare und Kinder nach beschrifteter Tabelle und Stammbaumgrafik.
const SOURCE = Object.freeze({
  "personIds": [
    "ionnrachtaigh-founder-tuirseach",
    "eubhach-unknown-mac-tuirseach-founder",
    "neachdainn-tuirseach",
    "liosaas-1584-tuirseach",
    "onora-1586-eldath",
    "orthanach-1580-cleirigh",
    "tormodach-1602-tuirseach",
    "duibhseach-tuirseach",
    "iomhar-1604-tuirseach",
    "doireann-ardmhair",
    "nairn-feannag",
    "peighann-1607-eamhra",
    "ionnrachtaigh-1628-tuirseach",
    "dearbhla-1634-tuirseach",
    "oirigh-1632-tuirseach",
    "goll-tuirseach",
    "feamainn-holloran",
    "peadarog-rochraide",
    "manus-1627-seaghdha",
    "grainne-tordarroch",
    "neachdainn-1648-tuirseach",
    "earca-tuirseach",
    "bridan-tuirseach",
    "aodhluan-tuirseach",
    "brideag-leite",
    "reamonn-1651-mochoe",
    "fergusach-1650-bhaird",
    "rogaire-muileach",
    "tormodach-tuirseach",
    "liosaas-1675-tuirseach",
    "oirigh-1677-tuirseach",
    "lorcanas-tuirseach",
    "eubhach-tuirseach",
    "raonaid-1672-rochraide",
    "onuist-ceinselaig",
    "tormodog-1675-holloran",
    "yachara-craobhan",
    "hascan-cleirigh",
    "iomhar-1692-tuirseach",
    "eireann-tuirseach",
    "ionnrachtaigh-1692-tuirseach",
    "dearbhla-1701-tuirseach",
    "joaigh-eamhra",
    "zachrach-1696-seaghdha",
    "latiaran-1699-ceinselaig",
    "samthann-magach",
    "keallach-1697-eldath",
    "jowan-tuirseach",
    "eoin-tuirseach"
  ],
  "partnershipIds": [
    "marriage-eubhach-unknown-mac-tuirseach-founder--ionnrachtaigh-founder-tuirseach",
    "marriage-neachdainn-tuirseach--onora-1586-eldath",
    "marriage-liosaas-1584-tuirseach--orthanach-1580-cleirigh",
    "marriage-doireann-ardmhair--tormodach-1602-tuirseach",
    "marriage-duibhseach-tuirseach--nairn-feannag",
    "marriage-iomhar-1604-tuirseach--peighann-1607-eamhra",
    "marriage-feamainn-holloran--ionnrachtaigh-1628-tuirseach",
    "marriage-dearbhla-1634-tuirseach--peadarog-rochraide",
    "marriage-manus-1627-seaghdha--oirigh-1632-tuirseach",
    "marriage-goll-tuirseach--grainne-tordarroch",
    "marriage-brideag-leite--neachdainn-1648-tuirseach",
    "marriage-earca-tuirseach--reamonn-1651-mochoe",
    "marriage-bridan-tuirseach--fergusach-1650-bhaird",
    "marriage-aodhluan-tuirseach--rogaire-muileach",
    "marriage-raonaid-1672-rochraide--tormodach-tuirseach",
    "marriage-liosaas-1675-tuirseach--onuist-ceinselaig",
    "marriage-oirigh-1677-tuirseach--tormodog-1675-holloran",
    "marriage-lorcanas-tuirseach--yachara-craobhan",
    "marriage-eubhach-tuirseach--hascan-cleirigh",
    "marriage-iomhar-1692-tuirseach--joaigh-eamhra",
    "marriage-eireann-tuirseach--zachrach-1696-seaghdha",
    "marriage-ionnrachtaigh-1692-tuirseach--latiaran-1699-ceinselaig",
    "forced-ionnrachtaigh-1692-tuirseach--samthann-magach",
    "engagement-dearbhla-1701-tuirseach--keallach-1697-eldath"
  ],
  "descendants": [
    {
      "partnershipId": "marriage-eubhach-unknown-mac-tuirseach-founder--ionnrachtaigh-founder-tuirseach",
      "childIds": [
        "neachdainn-tuirseach",
        "liosaas-1584-tuirseach"
      ],
      "timeJumpId": "gap-mac-tuirseach-founder"
    },
    {
      "partnershipId": "marriage-neachdainn-tuirseach--onora-1586-eldath",
      "childIds": [
        "tormodach-1602-tuirseach",
        "duibhseach-tuirseach",
        "iomhar-1604-tuirseach"
      ]
    },
    {
      "partnershipId": "marriage-doireann-ardmhair--tormodach-1602-tuirseach",
      "childIds": [
        "ionnrachtaigh-1628-tuirseach",
        "dearbhla-1634-tuirseach",
        "oirigh-1632-tuirseach"
      ]
    },
    {
      "partnershipId": "marriage-iomhar-1604-tuirseach--peighann-1607-eamhra",
      "childIds": [
        "goll-tuirseach"
      ]
    },
    {
      "partnershipId": "marriage-feamainn-holloran--ionnrachtaigh-1628-tuirseach",
      "childIds": [
        "neachdainn-1648-tuirseach",
        "earca-tuirseach",
        "bridan-tuirseach"
      ]
    },
    {
      "partnershipId": "marriage-goll-tuirseach--grainne-tordarroch",
      "childIds": [
        "aodhluan-tuirseach"
      ]
    },
    {
      "partnershipId": "marriage-brideag-leite--neachdainn-1648-tuirseach",
      "childIds": [
        "tormodach-tuirseach",
        "liosaas-1675-tuirseach",
        "oirigh-1677-tuirseach"
      ]
    },
    {
      "partnershipId": "marriage-aodhluan-tuirseach--rogaire-muileach",
      "childIds": [
        "lorcanas-tuirseach",
        "eubhach-tuirseach"
      ]
    },
    {
      "partnershipId": "marriage-raonaid-1672-rochraide--tormodach-tuirseach",
      "childIds": [
        "iomhar-1692-tuirseach",
        "eireann-tuirseach"
      ]
    },
    {
      "partnershipId": "marriage-lorcanas-tuirseach--yachara-craobhan",
      "childIds": [
        "ionnrachtaigh-1692-tuirseach",
        "dearbhla-1701-tuirseach"
      ]
    },
    {
      "partnershipId": "marriage-iomhar-1692-tuirseach--joaigh-eamhra",
      "childIds": [
        "jowan-tuirseach"
      ]
    },
    {
      "partnershipId": "marriage-ionnrachtaigh-1692-tuirseach--latiaran-1699-ceinselaig",
      "childIds": [
        "eoin-tuirseach"
      ]
    }
  ],
  "away": [
    {
      "partnershipId": "marriage-liosaas-1584-tuirseach--orthanach-1580-cleirigh",
      "targetFamilyId": "haus-cleirigh",
      "houseId": "house-cleirigh"
    },
    {
      "partnershipId": "marriage-duibhseach-tuirseach--nairn-feannag",
      "targetFamilyId": "haus-feannag",
      "houseId": "house-feannag"
    },
    {
      "partnershipId": "marriage-dearbhla-1634-tuirseach--peadarog-rochraide",
      "targetFamilyId": "haus-ui-rochraide",
      "houseId": "house-rochraide"
    },
    {
      "partnershipId": "marriage-manus-1627-seaghdha--oirigh-1632-tuirseach",
      "targetFamilyId": "haus-seaghda",
      "houseId": "house-seaghda"
    },
    {
      "partnershipId": "marriage-earca-tuirseach--reamonn-1651-mochoe",
      "targetFamilyId": "haus-an-morchoe",
      "houseId": "house-an-morchoe"
    },
    {
      "partnershipId": "marriage-bridan-tuirseach--fergusach-1650-bhaird",
      "targetFamilyId": "haus-an-bhaird",
      "houseId": "house-an-bhaird"
    },
    {
      "partnershipId": "marriage-liosaas-1675-tuirseach--onuist-ceinselaig",
      "targetFamilyId": "haus-ua-nic-ceinselaig",
      "houseId": "house-ua-nic-ceinselaig"
    },
    {
      "partnershipId": "marriage-oirigh-1677-tuirseach--tormodog-1675-holloran",
      "targetFamilyId": "haus-nic-holloran",
      "houseId": "house-nic-holloran"
    },
    {
      "partnershipId": "marriage-eubhach-tuirseach--hascan-cleirigh",
      "targetFamilyId": "haus-cleirigh",
      "houseId": "house-cleirigh"
    },
    {
      "partnershipId": "marriage-eireann-tuirseach--zachrach-1696-seaghdha",
      "targetFamilyId": "haus-seaghda",
      "houseId": "house-seaghda"
    },
    {
      "partnershipId": "forced-ionnrachtaigh-1692-tuirseach--samthann-magach",
      "targetFamilyId": "haus-magach",
      "houseId": "house-magach"
    },
    {
      "partnershipId": "engagement-dearbhla-1701-tuirseach--keallach-1697-eldath",
      "targetFamilyId": "haus-eldath",
      "houseId": "house-eldath"
    }
  ],
  "cadets": [],
  "wards": [],
  "historicalWards": [],
  "heads": [
    "ionnrachtaigh-founder-tuirseach",
    "neachdainn-tuirseach",
    "tormodach-1602-tuirseach",
    "ionnrachtaigh-1628-tuirseach",
    "neachdainn-1648-tuirseach",
    "tormodach-tuirseach"
  ],
  "titles": {
    "ionnrachtaigh-founder-tuirseach": "Legendärer Gründer des Clans",
    "neachdainn-tuirseach": "Mor Tiarna bis 1642",
    "tormodach-1602-tuirseach": "Mor Tiarna 1642–1674",
    "ionnrachtaigh-1628-tuirseach": "Mor Tiarna 1674–1703",
    "neachdainn-1648-tuirseach": "Mor Tiarna 1703–1717",
    "tormodach-tuirseach": "Mor Tiarna 1717–1720"
  },
  "personRoles": {
    "samthann-magach": "forced"
  },
  "sourceNote": "Ein serieller Quellenzeitsprung. Ionnracht­aighs Ehe mit Latiaran und erzwungene Verbindung mit Samthann sind getrennt; Eóin ist das belegte Kind der Ehe. Dearbhla und Keallach sind verlobt."
});

export const HOUSE_MAC_TUIRSEACH_FAMILY = withBlaithneachSourceCounterUpgrade(createCeitheachSourceFamily('mac-tuirseach', SOURCE, CEITHEACH_ADDITIONAL_SOURCE_CATALOG));
