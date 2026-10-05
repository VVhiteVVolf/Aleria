import { createCeitheachSourceFamily } from './ceitheach-source-family-builder.js';
import { CEITHEACH_ADDITIONAL_SOURCE_CATALOG } from './ceitheach-additional-source-catalog.js';

// Elternpaare und Kinder nach beschrifteter Tabelle und Stammbaumgrafik.
const SOURCE = Object.freeze({
  "personIds": [
    "tomaltach-founder-leite",
    "caireann-unknown-dal-leite-founder",
    "oran-leite",
    "saraas-leite",
    "kavan-leite",
    "alfrun-feuerherz",
    "colmach-1582-rochraide",
    "hjordis-kaltherz",
    "oirbhealach-1605-leite",
    "faolan-leite",
    "donndubhan-founder-leite",
    "iseabail-1605-leite",
    "dornaidh-ceinselaig",
    "giorsail-1605-holloran",
    "grainne-arbhair",
    "gearoidas-eala",
    "tomaltach-leite",
    "caireann-1626-leite",
    "eanraig-1630-leite",
    "deoiridh-1631-leite",
    "peadarog-leite",
    "oighreag-somhairle",
    "deaglan-haeghra",
    "muireann-1633-mochoe",
    "amhlaoibh-nessa",
    "nansaidh-craobhan",
    "ruairne-1647-leite",
    "iseabail-1653-leite",
    "donndubhan-1651-leite",
    "brideag-leite",
    "oirbhealach-1649-leite",
    "eimhear-casur",
    "goraidhas-1650-tordarroch",
    "finolain-duibhne",
    "neachdainn-1648-tuirseach",
    "treasa-durthacht",
    "tormod-leite",
    "cathalach-leite",
    "niallag-leite",
    "odhranag-leite",
    "ailisag-leite",
    "gilleasbuig-leite",
    "caireann-leite",
    "tomaltach-1676-leite",
    "tearlaidh-tairise",
    "gobaith-fioghrrha",
    "fergusach-grodach",
    "damhnait-1672-blar",
    "klaihn-somhairle",
    "beileag-fiantorc",
    "peadar-leite",
    "ualanag-leite",
    "sarraas-leite",
    "donndubhan-1698-leite",
    "deoiridh-1705-leite",
    "tomaltach-1700-leite",
    "goirsail-leite",
    "aisling-caddach",
    "agneta-goldschwur",
    "keallach-1697-eldath",
    "eilidhan-nessa",
    "oiric-suiste",
    "lusna-gairner",
    "barabal-eala",
    "marsail-leite",
    "nuala-leite",
    "cairisti-leite",
    "oran-1728-leite",
    "kavan-1734-leite",
    "ruairne-1722-leite",
    "urchaid-leite",
    "eanraig-1727-leite",
    "treasa-leite"
  ],
  "partnershipIds": [
    "marriage-caireann-unknown-dal-leite-founder--tomaltach-founder-leite",
    "marriage-oran-alfrun-leite",
    "marriage-colmach-1582-rochraide--saraas-leite",
    "marriage-kavan-hjordis-leite",
    "marriage-dornaidh-ceinselaig--oirbhealach-1605-leite",
    "marriage-faolan-leite--giorsail-1605-holloran",
    "marriage-donndubhan-founder-leite--grainne-arbhair",
    "marriage-gearoidas-eala--iseabail-1605-leite",
    "marriage-oighreag-tomaltach",
    "marriage-caireann-1626-leite--deaglan-haeghra",
    "marriage-eanraig-1630-leite--muireann-1633-mochoe",
    "marriage-amhlaoibh-nessa--deoiridh-1631-leite",
    "marriage-nansaidh-craobhan--peadarog-leite",
    "marriage-eimhear-casur--ruairne-1647-leite",
    "marriage-goraidhas-1650-tordarroch--iseabail-1653-leite",
    "marriage-donndubhan-1651-leite--finolain-duibhne",
    "marriage-brideag-leite--neachdainn-1648-tuirseach",
    "marriage-oirbhealach-1649-leite--treasa-durthacht",
    "marriage-cathalach-leite--tearlaidh-tairise",
    "marriage-gobaith-fioghrrha--odhranag-leite",
    "marriage-ailisag-leite--fergusach-grodach",
    "marriage-damhnait-gilleasbuig-blar",
    "marriage-klaihn-caireann",
    "marriage-beileag-fiantorc--tomaltach-1676-leite",
    "engagement-aisling-caddach--peadar-leite",
    "engagement-agneta-goldschwur--ualanag-leite",
    "forced-keallach-1697-eldath--sarraas-leite",
    "marriage-donndubhan-1698-leite--eilidhan-nessa",
    "marriage-deoiridh-1705-leite--oiric-suiste",
    "marriage-lusna-gairner--tomaltach-1700-leite",
    "marriage-barabal-eala--goirsail-leite"
  ],
  "descendants": [
    {
      "partnershipId": "marriage-caireann-unknown-dal-leite-founder--tomaltach-founder-leite",
      "childIds": [
        "oran-leite",
        "saraas-leite",
        "kavan-leite"
      ],
      "timeJumpId": "gap-dal-leite-founder"
    },
    {
      "partnershipId": "marriage-oran-alfrun-leite",
      "childIds": [
        "oirbhealach-1605-leite",
        "faolan-leite"
      ]
    },
    {
      "partnershipId": "marriage-kavan-hjordis-leite",
      "childIds": [
        "donndubhan-founder-leite",
        "iseabail-1605-leite"
      ]
    },
    {
      "partnershipId": "marriage-dornaidh-ceinselaig--oirbhealach-1605-leite",
      "childIds": [
        "tomaltach-leite",
        "caireann-1626-leite",
        "eanraig-1630-leite"
      ]
    },
    {
      "partnershipId": "marriage-donndubhan-founder-leite--grainne-arbhair",
      "childIds": [
        "deoiridh-1631-leite",
        "peadarog-leite"
      ]
    },
    {
      "partnershipId": "marriage-oighreag-tomaltach",
      "childIds": [
        "ruairne-1647-leite",
        "iseabail-1653-leite"
      ]
    },
    {
      "partnershipId": "marriage-eanraig-1630-leite--muireann-1633-mochoe",
      "childIds": [
        "donndubhan-1651-leite",
        "brideag-leite"
      ]
    },
    {
      "partnershipId": "marriage-nansaidh-craobhan--peadarog-leite",
      "childIds": [
        "oirbhealach-1649-leite"
      ]
    },
    {
      "partnershipId": "marriage-eimhear-casur--ruairne-1647-leite",
      "childIds": [
        "tormod-leite",
        "cathalach-leite",
        "niallag-leite"
      ]
    },
    {
      "partnershipId": "marriage-donndubhan-1651-leite--finolain-duibhne",
      "childIds": [
        "odhranag-leite",
        "ailisag-leite"
      ]
    },
    {
      "partnershipId": "marriage-oirbhealach-1649-leite--treasa-durthacht",
      "childIds": [
        "gilleasbuig-leite",
        "caireann-leite",
        "tomaltach-1676-leite"
      ]
    },
    {
      "partnershipId": "marriage-cathalach-leite--tearlaidh-tairise",
      "childIds": [
        "peadar-leite",
        "ualanag-leite"
      ]
    },
    {
      "partnershipId": "marriage-gobaith-fioghrrha--odhranag-leite",
      "childIds": [
        "sarraas-leite"
      ]
    },
    {
      "partnershipId": "marriage-damhnait-gilleasbuig-blar",
      "childIds": [
        "donndubhan-1698-leite",
        "deoiridh-1705-leite"
      ]
    },
    {
      "partnershipId": "marriage-beileag-fiantorc--tomaltach-1676-leite",
      "childIds": [
        "tomaltach-1700-leite",
        "goirsail-leite"
      ]
    },
    {
      "partnershipId": "forced-keallach-1697-eldath--sarraas-leite",
      "childIds": [
        "marsail-leite"
      ],
      "legitimacy": "bastard"
    },
    {
      "partnershipId": "marriage-donndubhan-1698-leite--eilidhan-nessa",
      "childIds": [
        "nuala-leite",
        "cairisti-leite",
        "oran-1728-leite",
        "kavan-1734-leite"
      ]
    },
    {
      "partnershipId": "marriage-lusna-gairner--tomaltach-1700-leite",
      "childIds": [
        "ruairne-1722-leite",
        "urchaid-leite",
        "eanraig-1727-leite",
        "treasa-leite"
      ]
    }
  ],
  "away": [
    {
      "partnershipId": "marriage-colmach-1582-rochraide--saraas-leite",
      "targetFamilyId": "haus-ui-rochraide",
      "houseId": "house-rochraide"
    },
    {
      "partnershipId": "marriage-faolan-leite--giorsail-1605-holloran",
      "targetFamilyId": "haus-nic-holloran",
      "houseId": "house-nic-holloran"
    },
    {
      "partnershipId": "marriage-gearoidas-eala--iseabail-1605-leite",
      "targetFamilyId": "haus-eala",
      "houseId": "house-eala"
    },
    {
      "partnershipId": "marriage-caireann-1626-leite--deaglan-haeghra",
      "targetFamilyId": "haus-haeghra",
      "houseId": "house-haeghra"
    },
    {
      "partnershipId": "marriage-amhlaoibh-nessa--deoiridh-1631-leite",
      "targetFamilyId": "haus-nessa",
      "houseId": "house-nessa"
    },
    {
      "partnershipId": "marriage-goraidhas-1650-tordarroch--iseabail-1653-leite",
      "targetFamilyId": "haus-tir-an-tordarroch",
      "houseId": "house-tir-an-tordarroch"
    },
    {
      "partnershipId": "marriage-brideag-leite--neachdainn-1648-tuirseach",
      "targetFamilyId": "haus-mac-tuirseach",
      "houseId": "house-mac-tuirseach"
    },
    {
      "partnershipId": "marriage-ailisag-leite--fergusach-grodach",
      "targetFamilyId": "haus-grodach",
      "houseId": "house-grodach"
    },
    {
      "partnershipId": "marriage-klaihn-caireann",
      "targetFamilyId": "haus-somhairle",
      "houseId": "house-somhairle"
    },
    {
      "partnershipId": "engagement-aisling-caddach--peadar-leite",
      "targetFamilyId": "haus-caddach",
      "houseId": "house-caddach"
    },
    {
      "partnershipId": "engagement-agneta-goldschwur--ualanag-leite",
      "targetFamilyId": "haus-goldschwur",
      "houseId": "house-goldschwur"
    },
    {
      "partnershipId": "marriage-deoiridh-1705-leite--oiric-suiste",
      "targetFamilyId": "haus-suiste",
      "houseId": "house-suiste"
    },
    {
      "partnershipId": "marriage-barabal-eala--goirsail-leite",
      "targetFamilyId": "haus-eala",
      "houseId": "house-eala"
    }
  ],
  "cadets": [],
  "wards": [],
  "historicalWards": [],
  "heads": [
    "tomaltach-founder-leite",
    "oran-leite",
    "oirbhealach-1605-leite",
    "tomaltach-leite",
    "ruairne-1647-leite",
    "cathalach-leite",
    "gilleasbuig-leite"
  ],
  "titles": {
    "tomaltach-founder-leite": "Legendärer Gründer · Fürstlicher Baumeister",
    "oran-leite": "Mor Tiarna bis 1639",
    "oirbhealach-1605-leite": "Mor Tiarna 1639–1674",
    "tomaltach-leite": "Mor Tiarna 1674–1684",
    "ruairne-1647-leite": "Mor Tiarna 1684–1711",
    "cathalach-leite": "Mor Tiarna 1711–1720",
    "gilleasbuig-leite": "Oberhaupt seit 1720",
    "donndubhan-1698-leite": "Erbe des Hauses",
    "oran-1728-leite": "Erbe des Hauses",
    "kavan-1734-leite": "Erbe des Hauses"
  },
  "personRoles": {
    "keallach-1697-eldath": "forced"
  },
  "sourceNote": "Ein in der Grafik belegter serieller Quellenzeitsprung. Fehlende Lebensdaten begründen keine weiteren Überlieferungslücken. Agnetas unsicheres Geburtsjahr 1704? bleibt als unsicherer Quellenwert erhalten. Sàrraas und Keallach bilden eine erzwungene Verbindung; Marsail ist ihr uneheliches Kind. Individuelle Bilder unter 16 werden nur als Referenz archiviert."
});

export const HOUSE_DAL_LEITE_FAMILY = createCeitheachSourceFamily('dal-leite', SOURCE, CEITHEACH_ADDITIONAL_SOURCE_CATALOG);
