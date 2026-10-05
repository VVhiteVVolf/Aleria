import { withCeitheachSourceCounterUpgrade } from './ceitheach-source-counter-upgrade.js';
import { createCeitheachSourceFamily } from './ceitheach-source-family-builder.js';

// Paar- und Kindergruppen nach der beschrifteten Nutzerquelle, keine Ableitung aus Spaltennähe.
const SOURCE = Object.freeze({
  "personIds": [
    "koarnach-founder-eamhra",
    "peighann-unknown-eamhra",
    "iainag-eamhra",
    "vallaigh-1584-eamhra",
    "searbhi-unknown-eamhra",
    "niallach-seaghdha",
    "dairein-1602-eamhra",
    "peighann-1607-eamhra",
    "hoibrean-1610-eamhra",
    "tuarenn-unknown-eamhra",
    "iomhar-1604-tuirseach",
    "porlach-unknown-eamhra",
    "koarnach-1628-eamhra",
    "liadan-eamhra",
    "conall-1632-eamhra",
    "teasag-eamhra",
    "etain-seaghdha",
    "bearnard-holloran",
    "maire-1637-feannag",
    "jowan-bhaird",
    "raghnar-eamhra",
    "eireann-eamhra",
    "bruide-eamhra",
    "manas-1653-eamhra",
    "morrioghan-1653-rochraide",
    "eoghair-1651-eldath",
    "graine-eldath",
    "dairein-1669-eamhra",
    "vallaigh-1672-eamhra",
    "hoibrean-eamhra",
    "donncadh-eamhra",
    "peighann-eamhra",
    "beathag-tordarroch",
    "uilleam-cleirigh",
    "leifdis-feuerherz",
    "yairbh-1676-seaghdha",
    "meallan-iomrach",
    "ollamh-unknown-eamhra",
    "koarnach-1690-eamhra",
    "joaigh-eamhra",
    "eoghanas-eamhra",
    "conall-1698-eamhra",
    "oonaas-eamhra",
    "breasal-eamhra",
    "earcas-eamhra",
    "uthbhla-unknown-eamhra",
    "oighreag-cnogan",
    "aingeal-nessa",
    "iomhar-1692-tuirseach",
    "lorcan-rochraide",
    "manas-1716-eamhra",
    "zennia-eamhra",
    "aandra-eamhra",
    "fergus-eamhra"
  ],
  "partnershipIds": [
    "marriage-koarnach-founder-eamhra--peighann-unknown-eamhra",
    "marriage-iainag-eamhra--searbhi-unknown-eamhra",
    "marriage-niallach-seaghdha--vallaigh-1584-eamhra",
    "marriage-dairein-1602-eamhra--tuarenn-unknown-eamhra",
    "marriage-iomhar-1604-tuirseach--peighann-1607-eamhra",
    "marriage-hoibrean-1610-eamhra--porlach-unknown-eamhra",
    "marriage-etain-seaghdha--koarnach-1628-eamhra",
    "marriage-bearnard-holloran--liadan-eamhra",
    "marriage-conall-1632-eamhra--maire-1637-feannag",
    "marriage-jowan-bhaird--teasag-eamhra",
    "marriage-morrioghan-1653-rochraide--raghnar-eamhra",
    "marriage-eireann-eamhra--eoghair-1651-eldath",
    "marriage-graine-eldath--manas-1653-eamhra",
    "marriage-beathag-tordarroch--dairein-1669-eamhra",
    "marriage-uilleam-cleirigh--vallaigh-1672-eamhra",
    "marriage-leifdis-hoibrean-eamhra",
    "marriage-donncadh-eamhra--yairbh-1676-seaghdha",
    "engagement-meallan-peighann",
    "affair-ollamh-unknown-eamhra--peighann-eamhra",
    "marriage-koarnach-1690-eamhra--uthbhla-unknown-eamhra",
    "forced-koarnach-1690-eamhra--oighreag-cnogan",
    "forced-aingeal-nessa--koarnach-1690-eamhra",
    "marriage-iomhar-1692-tuirseach--joaigh-eamhra",
    "engagement-lorcan-rochraide--oonaas-eamhra"
  ],
  "descendants": [
    {
      "partnershipId": "marriage-koarnach-founder-eamhra--peighann-unknown-eamhra",
      "childIds": [
        "iainag-eamhra",
        "vallaigh-1584-eamhra"
      ],
      "timeJumpId": "gap-eamhra-founder"
    },
    {
      "partnershipId": "marriage-iainag-eamhra--searbhi-unknown-eamhra",
      "childIds": [
        "dairein-1602-eamhra",
        "peighann-1607-eamhra",
        "hoibrean-1610-eamhra"
      ]
    },
    {
      "partnershipId": "marriage-dairein-1602-eamhra--tuarenn-unknown-eamhra",
      "childIds": [
        "koarnach-1628-eamhra",
        "liadan-eamhra"
      ]
    },
    {
      "partnershipId": "marriage-hoibrean-1610-eamhra--porlach-unknown-eamhra",
      "childIds": [
        "conall-1632-eamhra",
        "teasag-eamhra"
      ]
    },
    {
      "partnershipId": "marriage-etain-seaghdha--koarnach-1628-eamhra",
      "childIds": [
        "raghnar-eamhra",
        "eireann-eamhra"
      ]
    },
    {
      "partnershipId": "marriage-conall-1632-eamhra--maire-1637-feannag",
      "childIds": [
        "bruide-eamhra",
        "manas-1653-eamhra"
      ]
    },
    {
      "partnershipId": "marriage-morrioghan-1653-rochraide--raghnar-eamhra",
      "childIds": [
        "dairein-1669-eamhra",
        "vallaigh-1672-eamhra",
        "hoibrean-eamhra"
      ]
    },
    {
      "partnershipId": "marriage-graine-eldath--manas-1653-eamhra",
      "childIds": [
        "donncadh-eamhra",
        "peighann-eamhra"
      ]
    },
    {
      "partnershipId": "marriage-beathag-tordarroch--dairein-1669-eamhra",
      "childIds": [
        "koarnach-1690-eamhra",
        "joaigh-eamhra"
      ]
    },
    {
      "partnershipId": "marriage-leifdis-hoibrean-eamhra",
      "childIds": [
        "eoghanas-eamhra"
      ]
    },
    {
      "partnershipId": "marriage-donncadh-eamhra--yairbh-1676-seaghdha",
      "childIds": [
        "conall-1698-eamhra",
        "oonaas-eamhra"
      ]
    },
    {
      "partnershipId": "affair-ollamh-unknown-eamhra--peighann-eamhra",
      "childIds": [
        "breasal-eamhra",
        "earcas-eamhra"
      ],
      "legitimacy": "bastard"
    },
    {
      "partnershipId": "marriage-koarnach-1690-eamhra--uthbhla-unknown-eamhra",
      "childIds": [
        "manas-1716-eamhra"
      ]
    },
    {
      "partnershipId": "forced-koarnach-1690-eamhra--oighreag-cnogan",
      "childIds": [
        "zennia-eamhra"
      ],
      "legitimacy": "bastard"
    },
    {
      "partnershipId": "forced-aingeal-nessa--koarnach-1690-eamhra",
      "childIds": [
        "aandra-eamhra",
        "fergus-eamhra"
      ],
      "legitimacy": "bastard"
    }
  ],
  "away": [
    {
      "partnershipId": "marriage-niallach-seaghdha--vallaigh-1584-eamhra",
      "targetFamilyId": "haus-seaghda",
      "houseId": "house-seaghda"
    },
    {
      "partnershipId": "marriage-iomhar-1604-tuirseach--peighann-1607-eamhra",
      "targetFamilyId": "haus-mac-tuirseach",
      "houseId": "house-mac-tuirseach"
    },
    {
      "partnershipId": "marriage-bearnard-holloran--liadan-eamhra",
      "targetFamilyId": "haus-nic-holloran",
      "houseId": "house-nic-holloran"
    },
    {
      "partnershipId": "marriage-jowan-bhaird--teasag-eamhra",
      "targetFamilyId": "haus-an-bhaird",
      "houseId": "house-an-bhaird"
    },
    {
      "partnershipId": "marriage-eireann-eamhra--eoghair-1651-eldath",
      "targetFamilyId": "haus-eldath",
      "houseId": "house-eldath"
    },
    {
      "partnershipId": "marriage-uilleam-cleirigh--vallaigh-1672-eamhra",
      "targetFamilyId": "haus-cleirigh",
      "houseId": "house-cleirigh"
    },
    {
      "partnershipId": "marriage-iomhar-1692-tuirseach--joaigh-eamhra",
      "targetFamilyId": "haus-mac-tuirseach",
      "houseId": "house-mac-tuirseach"
    },
    {
      "partnershipId": "engagement-lorcan-rochraide--oonaas-eamhra",
      "targetFamilyId": "haus-ui-rochraide",
      "houseId": "house-rochraide"
    }
  ],
  "cadets": [],
  "wards": [],
  "historicalWards": [],
  "heads": [
    "koarnach-founder-eamhra",
    "iainag-eamhra",
    "dairein-1602-eamhra"
  ],
  "titles": {
    "koarnach-founder-eamhra": "Gründer des Clans",
    "iainag-eamhra": "Oberhaupt · bis 1642",
    "dairein-1602-eamhra": "Oberhaupt · 1642–1661"
  },
  "personRoles": {
    "ollamh-unknown-eamhra": "affair",
    "oighreag-cnogan": "forced",
    "aingeal-nessa": "forced"
  },
  "sourceNote": "Die unbekannten Oberhäupter und Erben der Vorlage bleiben unbesetzt. Mehrere Partnerschaften sind entsprechend der Quelle getrennt: Peighanns Verlobung mit Meallán und Affäre mit Ollamh; Koarnachs Ehe mit Uthbhla und erzwungene Verbindungen mit Oighreag/Aingeal. Die daraus stammenden Kinder sind als Bastarde belegt. Geburten 1721 nach Koarnachs Tod 1720 werden als mögliche posthume Geburten beibehalten; Jahresangaben allein widerlegen sie nicht. Máire Feannag (1637) ist eine andere Person als die bereits geführte Máire (1700). Anonyme Verlobungsvorlagen werden nicht als Personen übernommen."
});

export const HOUSE_EAMHRA_FAMILY = withCeitheachSourceCounterUpgrade(createCeitheachSourceFamily('eamhra', SOURCE));
