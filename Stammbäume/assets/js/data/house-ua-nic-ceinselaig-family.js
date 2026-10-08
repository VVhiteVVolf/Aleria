import { withBlaithneachSourceCounterUpgrade } from './blaithneach-source-counter-upgrade.js';
import { createCeitheachSourceFamily } from './ceitheach-source-family-builder.js';
import { CEITHEACH_ADDITIONAL_SOURCE_CATALOG } from './ceitheach-additional-source-catalog.js';

// Elternpaare und Kinder nach beschrifteter Tabelle und Stammbaumgrafik.
const SOURCE = Object.freeze({
  "personIds": [
    "sorcha-founder-rochraide",
    "kelch-unknown-ui-rochraide",
    "latiaran-1560-ceinselaig",
    "greagoir-ceinselaig",
    "eanbharr-deaghaide",
    "inchlaith-cetchathach",
    "aisling-ceinselaig",
    "saoirse-1582-ceinselaig",
    "deirdre-1585-ceinselaig",
    "diarmait-rochraide",
    "naoiseag-holloran",
    "tighearnach-nessa",
    "doileag-1603-ceinselaig",
    "dornaidh-ceinselaig",
    "naodhan-tairise",
    "oirbhealach-1605-leite",
    "latiaran-1629-ceinselaig",
    "gearoid-ceinselaig",
    "dechtire-1630-ceinselaig",
    "seonaid-1632-ceinselaig",
    "cearbhall-ailella",
    "sceolaigh-blar",
    "oisean-muileach",
    "gilleasbuig-cnogan",
    "saoirse-1652-ceinselaig",
    "noracha-ceinselaig",
    "iseabail-ceinselaig",
    "caireann-ceinselaig",
    "zephen-fintain",
    "cinead-tordarroch",
    "harailt-bhaird",
    "aonghus-eldath",
    "kelch-ceinselaig",
    "tearlag-ceinselaig",
    "deirdre-ceinselaig",
    "onuist-ceinselaig",
    "giorsail-1674-holloran",
    "padraig-rochraide",
    "fionn-craobhan",
    "liosaas-1675-tuirseach",
    "dechtire-1697-ceinselaig",
    "doileag-1699-ceinselaig",
    "gillebride-ceinselaig",
    "latiaran-1699-ceinselaig",
    "peadhra-ceinselaig",
    "diarmaid-1700-tordarroch",
    "pailtear-cleirigh",
    "banba-bhaird",
    "ionnrachtaigh-1692-tuirseach",
    "dealan-eldath",
    "seonaid-1718-ceinselaig"
  ],
  "partnershipIds": [
    "marriage-kelch-unknown-ui-rochraide--sorcha-founder-rochraide",
    "marriage-eanbharr-deaghaide--latiaran-1560-ceinselaig",
    "marriage-greagoir-ceinselaig--inchlaith-cetchathach",
    "marriage-aisling-ceinselaig--diarmait-rochraide",
    "marriage-naoiseag-holloran--saoirse-1582-ceinselaig",
    "marriage-deirdre-1585-ceinselaig--tighearnach-nessa",
    "marriage-doileag-1603-ceinselaig--naodhan-tairise",
    "marriage-dornaidh-ceinselaig--oirbhealach-1605-leite",
    "marriage-cearbhall-ailella--latiaran-1629-ceinselaig",
    "marriage-sceolaigh-gearoid-blar",
    "marriage-dechtire-1630-ceinselaig--oisean-muileach",
    "marriage-gilleasbuig-cnogan--seonaid-1632-ceinselaig",
    "marriage-saoirse-1652-ceinselaig--zephen-fintain",
    "marriage-cinead-tordarroch--noracha-ceinselaig",
    "marriage-harailt-bhaird--iseabail-ceinselaig",
    "marriage-aonghus-eldath--caireann-ceinselaig",
    "marriage-giorsail-1674-holloran--kelch-ceinselaig",
    "marriage-padraig-rochraide--tearlag-ceinselaig",
    "marriage-deirdre-ceinselaig--fionn-craobhan",
    "marriage-liosaas-1675-tuirseach--onuist-ceinselaig",
    "marriage-dechtire-1697-ceinselaig--diarmaid-1700-tordarroch",
    "marriage-doileag-1699-ceinselaig--pailtear-cleirigh",
    "engagement-banba-bhaird--gillebride-ceinselaig",
    "marriage-ionnrachtaigh-1692-tuirseach--latiaran-1699-ceinselaig",
    "marriage-dealan-eldath--peadhra-ceinselaig"
  ],
  "descendants": [
    {
      "partnershipId": "marriage-kelch-unknown-ui-rochraide--sorcha-founder-rochraide",
      "childIds": [
        "latiaran-1560-ceinselaig",
        "greagoir-ceinselaig"
      ],
      "timeJumpId": "gap-ua-nic-ceinselaig-founder"
    },
    {
      "partnershipId": "marriage-eanbharr-deaghaide--latiaran-1560-ceinselaig",
      "childIds": [
        "aisling-ceinselaig",
        "saoirse-1582-ceinselaig",
        "deirdre-1585-ceinselaig"
      ]
    },
    {
      "partnershipId": "marriage-naoiseag-holloran--saoirse-1582-ceinselaig",
      "childIds": [
        "doileag-1603-ceinselaig",
        "dornaidh-ceinselaig"
      ]
    },
    {
      "partnershipId": "marriage-doileag-1603-ceinselaig--naodhan-tairise",
      "childIds": [
        "latiaran-1629-ceinselaig",
        "gearoid-ceinselaig",
        "dechtire-1630-ceinselaig",
        "seonaid-1632-ceinselaig"
      ]
    },
    {
      "partnershipId": "marriage-cearbhall-ailella--latiaran-1629-ceinselaig",
      "childIds": [
        "saoirse-1652-ceinselaig",
        "noracha-ceinselaig"
      ]
    },
    {
      "partnershipId": "marriage-gilleasbuig-cnogan--seonaid-1632-ceinselaig",
      "childIds": [
        "iseabail-ceinselaig",
        "caireann-ceinselaig"
      ]
    },
    {
      "partnershipId": "marriage-saoirse-1652-ceinselaig--zephen-fintain",
      "childIds": [
        "kelch-ceinselaig",
        "tearlag-ceinselaig"
      ]
    },
    {
      "partnershipId": "marriage-harailt-bhaird--iseabail-ceinselaig",
      "childIds": [
        "deirdre-ceinselaig",
        "onuist-ceinselaig"
      ]
    },
    {
      "partnershipId": "marriage-padraig-rochraide--tearlag-ceinselaig",
      "childIds": [
        "dechtire-1697-ceinselaig",
        "doileag-1699-ceinselaig",
        "gillebride-ceinselaig"
      ]
    },
    {
      "partnershipId": "marriage-liosaas-1675-tuirseach--onuist-ceinselaig",
      "childIds": [
        "latiaran-1699-ceinselaig",
        "peadhra-ceinselaig"
      ]
    },
    {
      "partnershipId": "marriage-dechtire-1697-ceinselaig--diarmaid-1700-tordarroch",
      "childIds": [
        "seonaid-1718-ceinselaig"
      ]
    }
  ],
  "away": [
    {
      "partnershipId": "marriage-greagoir-ceinselaig--inchlaith-cetchathach",
      "targetFamilyId": "haus-cetchathach",
      "houseId": "house-cetchathach"
    },
    {
      "partnershipId": "marriage-aisling-ceinselaig--diarmait-rochraide",
      "targetFamilyId": "haus-ui-rochraide",
      "houseId": "house-rochraide"
    },
    {
      "partnershipId": "marriage-deirdre-1585-ceinselaig--tighearnach-nessa",
      "targetFamilyId": "haus-nessa",
      "houseId": "house-nessa"
    },
    {
      "partnershipId": "marriage-dornaidh-ceinselaig--oirbhealach-1605-leite",
      "targetFamilyId": "haus-dal-leite",
      "houseId": "house-dal-leite"
    },
    {
      "partnershipId": "marriage-sceolaigh-gearoid-blar",
      "targetFamilyId": "haus-nic-blar",
      "houseId": "house-nic-blar"
    },
    {
      "partnershipId": "marriage-dechtire-1630-ceinselaig--oisean-muileach",
      "targetFamilyId": "haus-muileach",
      "houseId": "house-muileach"
    },
    {
      "partnershipId": "marriage-cinead-tordarroch--noracha-ceinselaig",
      "targetFamilyId": "haus-tir-an-tordarroch",
      "houseId": "house-tir-an-tordarroch"
    },
    {
      "partnershipId": "marriage-aonghus-eldath--caireann-ceinselaig",
      "targetFamilyId": "haus-eldath",
      "houseId": "house-eldath"
    },
    {
      "partnershipId": "marriage-giorsail-1674-holloran--kelch-ceinselaig",
      "targetFamilyId": "haus-nic-holloran",
      "houseId": "house-nic-holloran"
    },
    {
      "partnershipId": "marriage-deirdre-ceinselaig--fionn-craobhan",
      "targetFamilyId": "haus-craobhan",
      "houseId": "house-craobhan"
    },
    {
      "partnershipId": "marriage-doileag-1699-ceinselaig--pailtear-cleirigh",
      "targetFamilyId": "haus-cleirigh",
      "houseId": "house-cleirigh"
    },
    {
      "partnershipId": "engagement-banba-bhaird--gillebride-ceinselaig",
      "targetFamilyId": "haus-an-bhaird",
      "houseId": "house-an-bhaird"
    },
    {
      "partnershipId": "marriage-ionnrachtaigh-1692-tuirseach--latiaran-1699-ceinselaig",
      "targetFamilyId": "haus-mac-tuirseach",
      "houseId": "house-mac-tuirseach"
    },
    {
      "partnershipId": "marriage-dealan-eldath--peadhra-ceinselaig",
      "targetFamilyId": "haus-eldath",
      "houseId": "house-eldath"
    }
  ],
  "cadets": [],
  "wards": [],
  "historicalWards": [],
  "heads": [
    "sorcha-founder-rochraide",
    "latiaran-1560-ceinselaig",
    "saoirse-1582-ceinselaig",
    "doileag-1603-ceinselaig",
    "latiaran-1629-ceinselaig",
    "saoirse-1652-ceinselaig"
  ],
  "titles": {
    "sorcha-founder-rochraide": "Gründerin des Kadettenhauses",
    "latiaran-1560-ceinselaig": "Mor Tiarna bis 1648",
    "saoirse-1582-ceinselaig": "Mor Tiarna 1648–1664",
    "doileag-1603-ceinselaig": "Mor Tiarna 1664–1681",
    "latiaran-1629-ceinselaig": "Mor Tiarna 1681–1700",
    "saoirse-1652-ceinselaig": "Mor Tiarna 1700–1720"
  },
  "personRoles": {},
  "sourceNote": "Sorcha Rochraide und Kelch sind dieselben Gründerpersonen wie im Rochraide-Kadettenknoten. Ein serieller Quellenzeitsprung. Deirdres Jahrhundertkorrektur 1775→1675 wurde bereits ausdrücklich bestätigt. Dòrnaidhs fehlende öffnende Jahresklammer ist ein Formatfehler."
});

export const HOUSE_UA_NIC_CEINSELAIG_FAMILY = withBlaithneachSourceCounterUpgrade(createCeitheachSourceFamily('ua-nic-ceinselaig', SOURCE, CEITHEACH_ADDITIONAL_SOURCE_CATALOG));
