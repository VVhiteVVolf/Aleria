import { withCeitheachSourceCounterUpgrade } from './ceitheach-source-counter-upgrade.js';
import { createCeitheachSourceFamily } from './ceitheach-source-family-builder.js';

// Paar- und Kindergruppen nach der beschrifteten Nutzerquelle, keine Ableitung aus Spaltennähe.
const SOURCE = Object.freeze({
  "personIds": [
    "colmach-founder-rochraide",
    "siabhan-tuathanach",
    "dallan-founder-rochraide",
    "sorcha-founder-rochraide",
    "aibhreann-abhrach",
    "kelch-unknown-ui-rochraide",
    "lughaid-founder-rochraide",
    "raonaid-founder-rochraide",
    "wuirseach-founder-rochraide",
    "fiannait-urquhart",
    "caiden-ronain",
    "sceolaigh-unknown-ui-rochraide",
    "conand-1561-rochraide",
    "sioran-rochraide",
    "nasuada-1566-rochraide",
    "jowan-rochraide",
    "qubhna-cethrenn",
    "diarlaith-cethachthach",
    "caithair-roth",
    "glaisne-rowak",
    "diarmait-rochraide",
    "dervla-rochraide",
    "wuirseach-1588-rochraide",
    "keara-rochraide",
    "colmach-1582-rochraide",
    "aisling-ceinselaig",
    "raghallach-eoghainn",
    "orlaith-1588-craobhan",
    "hectan-buadhtreun",
    "saraas-leite",
    "muiredach-rochraide",
    "sorcha-rochraide",
    "grian-1610-rochraide",
    "lughaid-1610-rochraide",
    "dallan-rochraide",
    "morrioghan-1618-rochraide",
    "fearghal-rochraide",
    "eibhlin-rochraide",
    "prudentia-avenicci",
    "sinding-vaeren",
    "eachan-bhaird",
    "sceolaigh-eldath",
    "peatharlach-blar",
    "kelch-morna",
    "peigi-seaghdha",
    "ruadhan-cumhail",
    "connla-rochraide",
    "donnacha-rochraide",
    "peadarog-rochraide",
    "raonaid-1632-rochraide",
    "donndubhan-rochraide",
    "moira-rochraide",
    "uaithe-roth",
    "fionnghuala-holloran",
    "dearbhla-1634-tuirseach",
    "peathgho-tordarroch",
    "saoirseas-mochoe",
    "ulrik-varangr",
    "colmach-1648-rochraide",
    "morrioghan-1653-rochraide",
    "kavan-rochraide",
    "eibhlin-1655-rochraide",
    "baoigheall-rochraide",
    "donnchadh-rochraide",
    "wrantha-cethrenn",
    "raghnar-eamhra",
    "neidin-unknown-ui-rochraide",
    "gluineach-duilb",
    "fionnchu-laga",
    "banbhin-unknown-ui-rochraide",
    "jathgal-rochraide",
    "raonaid-1672-rochraide",
    "sorcha-1674-rochraide",
    "conand-1670-rochraide",
    "padraig-rochraide",
    "turlough-rochraide",
    "wuirseach-1678-rochraide",
    "moira-1678-rochraide",
    "aoifean-bhaird",
    "tormodach-tuirseach",
    "jodhran-1669-eldath",
    "maolmhuire-duibhne",
    "tearlag-ceinselaig",
    "hearnait-unknown-ui-rochraide",
    "ideog-unknown-ui-rochraide",
    "zeargan-seaghdha",
    "roarke-rochraide",
    "siabhan-rochraide",
    "nogh-rochraide",
    "dallan-1695-rochraide",
    "grian-1700-rochraide",
    "lorcan-rochraide",
    "doileag-rochraide",
    "kelch-rochraide",
    "ailpein-rochraide",
    "nasuada-rochraide",
    "banbhin-mochoe",
    "cei-pendrag",
    "meabhin-holloran",
    "nora-tordarroch",
    "gaothaire-cleirigh",
    "oonaas-eamhra",
    "fothad-duibhne",
    "keebh-craobhan",
    "hugwan-illysywen"
  ],
  "partnershipIds": [
    "marriage-colmach-founder-rochraide--siabhan-tuathanach",
    "marriage-aibhreann-abhrach--dallan-founder-rochraide",
    "marriage-kelch-unknown-ui-rochraide--sorcha-founder-rochraide",
    "marriage-fiannait-urquhart--lughaid-founder-rochraide",
    "marriage-caiden-ronain--raonaid-founder-rochraide",
    "marriage-sceolaigh-unknown-ui-rochraide--wuirseach-founder-rochraide",
    "marriage-conand-1561-rochraide--qubhna-cethrenn",
    "marriage-diarlaith-cethachthach--sioran-rochraide",
    "marriage-caithair-roth--nasuada-1566-rochraide",
    "marriage-glaisne-rowak--jowan-rochraide",
    "marriage-aisling-ceinselaig--diarmait-rochraide",
    "marriage-dervla-rochraide--raghallach-eoghainn",
    "marriage-orlaith-1588-craobhan--wuirseach-1588-rochraide",
    "marriage-hectan-buadhtreun--keara-rochraide",
    "marriage-colmach-1582-rochraide--saraas-leite",
    "marriage-muiredach-rochraide--prudentia-avenicci",
    "marriage-sinding-sorcha-vaeren",
    "marriage-eachan-bhaird--grian-1610-rochraide",
    "marriage-lughaid-1610-rochraide--sceolaigh-eldath",
    "marriage-peatharlach-dallan-blar",
    "marriage-kelch-morna--morrioghan-1618-rochraide",
    "marriage-fearghal-rochraide--peigi-seaghdha",
    "marriage-ruadhan-eibhlin",
    "marriage-connla-rochraide--uaithe-roth",
    "marriage-donnacha-rochraide--fionnghuala-holloran",
    "marriage-dearbhla-1634-tuirseach--peadarog-rochraide",
    "marriage-peathgho-tordarroch--raonaid-1632-rochraide",
    "marriage-donndubhan-rochraide--saoirseas-mochoe",
    "marriage-ulrik-moira-varangr",
    "marriage-colmach-1648-rochraide--wrantha-cethrenn",
    "marriage-morrioghan-1653-rochraide--raghnar-eamhra",
    "marriage-kavan-rochraide--neidin-unknown-ui-rochraide",
    "marriage-eibhlin-1655-rochraide--gluineach-duilb",
    "marriage-baoigheall-rochraide--fionnchu-laga",
    "marriage-banbhin-unknown-ui-rochraide--donnchadh-rochraide",
    "marriage-aoifean-bhaird--jathgal-rochraide",
    "marriage-raonaid-1672-rochraide--tormodach-tuirseach",
    "marriage-jodhran-1669-eldath--sorcha-1674-rochraide",
    "marriage-conand-1670-rochraide--maolmhuire-duibhne",
    "marriage-padraig-rochraide--tearlag-ceinselaig",
    "marriage-hearnait-unknown-ui-rochraide--turlough-rochraide",
    "marriage-ideog-unknown-ui-rochraide--wuirseach-1678-rochraide",
    "marriage-moira-1678-rochraide--zeargan-seaghdha",
    "engagement-banbhin-mochoe--roarke-rochraide",
    "marriage-cei-siabhan",
    "engagement-meabhin-holloran--nogh-rochraide",
    "marriage-dallan-1695-rochraide--nora-tordarroch",
    "marriage-gaothaire-cleirigh--grian-1700-rochraide",
    "engagement-lorcan-rochraide--oonaas-eamhra",
    "marriage-doileag-rochraide--fothad-duibhne",
    "engagement-keebh-craobhan--kelch-rochraide",
    "engagement-hugwan-nasuada"
  ],
  "descendants": [
    {
      "partnershipId": "marriage-colmach-founder-rochraide--siabhan-tuathanach",
      "childIds": [
        "dallan-founder-rochraide",
        "sorcha-founder-rochraide"
      ],
      "timeJumpId": "gap-ui-rochraide-founder"
    },
    {
      "partnershipId": "marriage-aibhreann-abhrach--dallan-founder-rochraide",
      "childIds": [
        "lughaid-founder-rochraide",
        "raonaid-founder-rochraide",
        "wuirseach-founder-rochraide"
      ],
      "timeJumpId": "gap-ui-rochraide-dallan"
    },
    {
      "partnershipId": "marriage-fiannait-urquhart--lughaid-founder-rochraide",
      "childIds": [
        "conand-1561-rochraide",
        "sioran-rochraide",
        "nasuada-1566-rochraide",
        "jowan-rochraide"
      ],
      "timeJumpId": "gap-ui-rochraide-lughaid"
    },
    {
      "partnershipId": "marriage-conand-1561-rochraide--qubhna-cethrenn",
      "childIds": [
        "diarmait-rochraide",
        "dervla-rochraide",
        "wuirseach-1588-rochraide"
      ]
    },
    {
      "partnershipId": "marriage-glaisne-rowak--jowan-rochraide",
      "childIds": [
        "keara-rochraide",
        "colmach-1582-rochraide"
      ]
    },
    {
      "partnershipId": "marriage-aisling-ceinselaig--diarmait-rochraide",
      "childIds": [
        "muiredach-rochraide",
        "sorcha-rochraide"
      ]
    },
    {
      "partnershipId": "marriage-orlaith-1588-craobhan--wuirseach-1588-rochraide",
      "childIds": [
        "grian-1610-rochraide",
        "lughaid-1610-rochraide"
      ]
    },
    {
      "partnershipId": "marriage-colmach-1582-rochraide--saraas-leite",
      "childIds": [
        "dallan-rochraide",
        "morrioghan-1618-rochraide",
        "fearghal-rochraide",
        "eibhlin-rochraide"
      ]
    },
    {
      "partnershipId": "marriage-muiredach-rochraide--prudentia-avenicci",
      "childIds": [
        "connla-rochraide",
        "donnacha-rochraide"
      ]
    },
    {
      "partnershipId": "marriage-lughaid-1610-rochraide--sceolaigh-eldath",
      "childIds": [
        "peadarog-rochraide"
      ]
    },
    {
      "partnershipId": "marriage-peatharlach-dallan-blar",
      "childIds": [
        "raonaid-1632-rochraide"
      ]
    },
    {
      "partnershipId": "marriage-fearghal-rochraide--peigi-seaghdha",
      "childIds": [
        "donndubhan-rochraide",
        "moira-rochraide"
      ]
    },
    {
      "partnershipId": "marriage-connla-rochraide--uaithe-roth",
      "childIds": [
        "colmach-1648-rochraide",
        "morrioghan-1653-rochraide"
      ]
    },
    {
      "partnershipId": "marriage-dearbhla-1634-tuirseach--peadarog-rochraide",
      "childIds": [
        "kavan-rochraide",
        "eibhlin-1655-rochraide"
      ]
    },
    {
      "partnershipId": "marriage-donndubhan-rochraide--saoirseas-mochoe",
      "childIds": [
        "baoigheall-rochraide",
        "donnchadh-rochraide"
      ]
    },
    {
      "partnershipId": "marriage-colmach-1648-rochraide--wrantha-cethrenn",
      "childIds": [
        "jathgal-rochraide",
        "raonaid-1672-rochraide",
        "sorcha-1674-rochraide",
        "conand-1670-rochraide"
      ]
    },
    {
      "partnershipId": "marriage-kavan-rochraide--neidin-unknown-ui-rochraide",
      "childIds": [
        "padraig-rochraide",
        "turlough-rochraide"
      ]
    },
    {
      "partnershipId": "marriage-banbhin-unknown-ui-rochraide--donnchadh-rochraide",
      "childIds": [
        "wuirseach-1678-rochraide",
        "moira-1678-rochraide"
      ]
    },
    {
      "partnershipId": "marriage-aoifean-bhaird--jathgal-rochraide",
      "childIds": [
        "roarke-rochraide",
        "siabhan-rochraide",
        "nogh-rochraide"
      ]
    },
    {
      "partnershipId": "marriage-conand-1670-rochraide--maolmhuire-duibhne",
      "childIds": [
        "dallan-1695-rochraide",
        "grian-1700-rochraide"
      ]
    },
    {
      "partnershipId": "marriage-hearnait-unknown-ui-rochraide--turlough-rochraide",
      "childIds": [
        "lorcan-rochraide",
        "doileag-rochraide",
        "kelch-rochraide"
      ]
    },
    {
      "partnershipId": "marriage-ideog-unknown-ui-rochraide--wuirseach-1678-rochraide",
      "childIds": [
        "ailpein-rochraide",
        "nasuada-rochraide"
      ]
    }
  ],
  "away": [
    {
      "partnershipId": "marriage-caiden-ronain--raonaid-founder-rochraide",
      "targetFamilyId": "haus-ronain",
      "houseId": "house-ronain"
    },
    {
      "partnershipId": "marriage-diarlaith-cethachthach--sioran-rochraide",
      "targetFamilyId": "haus-cethachthach",
      "houseId": "house-cethachthach"
    },
    {
      "partnershipId": "marriage-caithair-roth--nasuada-1566-rochraide",
      "targetFamilyId": "haus-roth",
      "houseId": "house-roth"
    },
    {
      "partnershipId": "marriage-dervla-rochraide--raghallach-eoghainn",
      "targetFamilyId": "haus-eoghainn",
      "houseId": "house-eoghainn"
    },
    {
      "partnershipId": "marriage-hectan-buadhtreun--keara-rochraide",
      "targetFamilyId": "haus-buadhtreun",
      "houseId": "house-buadhtreun"
    },
    {
      "partnershipId": "marriage-sinding-sorcha-vaeren",
      "targetFamilyId": "haus-vaeren",
      "houseId": "house-vaeren"
    },
    {
      "partnershipId": "marriage-eachan-bhaird--grian-1610-rochraide",
      "targetFamilyId": "haus-an-bhaird",
      "houseId": "house-an-bhaird"
    },
    {
      "partnershipId": "marriage-kelch-morna--morrioghan-1618-rochraide",
      "targetFamilyId": "haus-morna",
      "houseId": "house-morna"
    },
    {
      "partnershipId": "marriage-ruadhan-eibhlin",
      "targetFamilyId": "haus-mac-ard-cumhaill",
      "houseId": "house-cumhail"
    },
    {
      "partnershipId": "marriage-donnacha-rochraide--fionnghuala-holloran",
      "targetFamilyId": "haus-nic-holloran",
      "houseId": "house-nic-holloran"
    },
    {
      "partnershipId": "marriage-peathgho-tordarroch--raonaid-1632-rochraide",
      "targetFamilyId": "haus-tir-an-tordarroch",
      "houseId": "house-tir-an-tordarroch"
    },
    {
      "partnershipId": "marriage-ulrik-moira-varangr",
      "targetFamilyId": "haus-varangr",
      "houseId": "house-varangr"
    },
    {
      "partnershipId": "marriage-morrioghan-1653-rochraide--raghnar-eamhra",
      "targetFamilyId": "haus-eamhra",
      "houseId": "house-eamhra"
    },
    {
      "partnershipId": "marriage-eibhlin-1655-rochraide--gluineach-duilb",
      "targetFamilyId": "haus-duilb",
      "houseId": "house-duilb"
    },
    {
      "partnershipId": "marriage-baoigheall-rochraide--fionnchu-laga",
      "targetFamilyId": "haus-laga",
      "houseId": "house-laga"
    },
    {
      "partnershipId": "marriage-raonaid-1672-rochraide--tormodach-tuirseach",
      "targetFamilyId": "haus-mac-tuirseach",
      "houseId": "house-mac-tuirseach"
    },
    {
      "partnershipId": "marriage-jodhran-1669-eldath--sorcha-1674-rochraide",
      "targetFamilyId": "haus-eldath",
      "houseId": "house-eldath"
    },
    {
      "partnershipId": "marriage-padraig-rochraide--tearlag-ceinselaig",
      "targetFamilyId": "haus-ua-nic-ceinselaig",
      "houseId": "house-ua-nic-ceinselaig"
    },
    {
      "partnershipId": "marriage-moira-1678-rochraide--zeargan-seaghdha",
      "targetFamilyId": "haus-seaghda",
      "houseId": "house-seaghda"
    },
    {
      "partnershipId": "engagement-banbhin-mochoe--roarke-rochraide",
      "targetFamilyId": "haus-an-morchoe",
      "houseId": "house-an-morchoe"
    },
    {
      "partnershipId": "marriage-cei-siabhan",
      "targetFamilyId": "haus-pendrag",
      "houseId": "house-pendrag"
    },
    {
      "partnershipId": "engagement-meabhin-holloran--nogh-rochraide",
      "targetFamilyId": "haus-nic-holloran",
      "houseId": "house-nic-holloran"
    },
    {
      "partnershipId": "marriage-dallan-1695-rochraide--nora-tordarroch",
      "targetFamilyId": "haus-tir-an-tordarroch",
      "houseId": "house-tir-an-tordarroch"
    },
    {
      "partnershipId": "marriage-gaothaire-cleirigh--grian-1700-rochraide",
      "targetFamilyId": "haus-cleirigh",
      "houseId": "house-cleirigh"
    },
    {
      "partnershipId": "engagement-lorcan-rochraide--oonaas-eamhra",
      "targetFamilyId": "haus-eamhra",
      "houseId": "house-eamhra"
    },
    {
      "partnershipId": "marriage-doileag-rochraide--fothad-duibhne",
      "targetFamilyId": "haus-duibhne",
      "houseId": "house-duibhne"
    },
    {
      "partnershipId": "engagement-keebh-craobhan--kelch-rochraide",
      "targetFamilyId": "haus-craobhan",
      "houseId": "house-craobhan"
    },
    {
      "partnershipId": "engagement-hugwan-nasuada",
      "targetFamilyId": "haus-illysywen",
      "houseId": "house-illysywen"
    }
  ],
  "cadets": [
    {
      "partnershipId": "marriage-kelch-unknown-ui-rochraide--sorcha-founder-rochraide",
      "targetFamilyId": "haus-ua-nic-ceinselaig",
      "houseId": "house-ua-nic-ceinselaig"
    },
    {
      "partnershipId": "marriage-sceolaigh-unknown-ui-rochraide--wuirseach-founder-rochraide",
      "targetFamilyId": "haus-eldath",
      "houseId": "house-eldath"
    }
  ],
  "wards": [],
  "historicalWards": [
    {
      "personId": "donnacha-rochraide",
      "targetFamilyId": "haus-nic-holloran",
      "notes": "Historische Vormundschaft nach dem Biografietext; keine gegenwärtige Mündelrolle."
    },
    {
      "personId": "siabhan-rochraide",
      "targetFamilyId": "haus-pendrag",
      "notes": "Historische Vormundschaft nach dem Biografietext; keine gegenwärtige Mündelrolle."
    }
  ],
  "heads": [
    "colmach-founder-rochraide",
    "dallan-founder-rochraide",
    "lughaid-founder-rochraide",
    "conand-1561-rochraide",
    "diarmait-rochraide",
    "muiredach-rochraide",
    "connla-rochraide",
    "colmach-1648-rochraide",
    "jathgal-rochraide"
  ],
  "titles": {
    "colmach-founder-rochraide": "Gründer und erster Fürst von Ceitheach",
    "dallan-founder-rochraide": "Fürst von Ceitheach",
    "lughaid-founder-rochraide": "Fürst von Ceitheach",
    "conand-1561-rochraide": "Fürst von Ceitheach · bis 1625",
    "diarmait-rochraide": "Fürst von Ceitheach · 1625–1651",
    "muiredach-rochraide": "Fürst von Ceitheach · 1651–1674",
    "connla-rochraide": "Fürst von Ceitheach · 1674–1701",
    "colmach-1648-rochraide": "Fürst von Ceitheach · 1701–1720; selbsternannter König der Alben 1720",
    "jathgal-rochraide": "Fürst von Ceitheach und selbsternannter König der Alben · 1720"
  },
  "personRoles": {},
  "sourceNote": "Drei in der Grafik markierte Überlieferungslücken bleiben getrennt. Sorcha gründet Ceinselaig, Wuirseach Eldath. Kopierte Partnerüberschriften Colmach/Moira wurden zu Jowan/Sorcha berichtigt. Graobhan und Eldrath in neuen Karten bezeichnen Craobhan und Eldath. Jathgal/Jathghal werden als dieselbe Person geführt. Fünf offenkundige Jahrhundertfehler wurden auf Nutzerwunsch berichtigt. Siabhans Todesjahr bleibt auf Nutzerwunsch unbekannt; 1720 ist nur eine unsichere Tabellenangabe."
});

export const HOUSE_UI_ROCHRAIDE_FAMILY = withCeitheachSourceCounterUpgrade(createCeitheachSourceFamily('ui-rochraide', SOURCE));
