// Supplied Perllan export, reviewed 2026-11-04. Source identities, dates,
// relationships and presentation are retained; only registry placement and
// active media paths are adapted. See the retained source inventory.
import { createHouseProfileFromFolderPath } from '../domain/house-profile.js';
import { CELTIGERNS_WACHT_REGION_EMBLEMS } from './celtigerns-wacht-house-profiles.js';
import { PERLLAN_PERSON_BIOGRAPHIES } from './perllan-person-biographies.generated.js';

export const PERLLAN_EMBLEM = "assets/images/houses/Llamreis Ankunft/Bürgerliche/Gwynthor/Perllan/perllan-emblem.png";
export const PERLLAN_HOUSE_PROFILE = Object.freeze(createHouseProfileFromFolderPath(
  ['Cenyr', 'Celtigerns Wacht', 'Llamreis Ankunft', 'Gwynthor'],
  { rankId: 'commoner', regionEmblems: {
    seat: CELTIGERNS_WACHT_REGION_EMBLEMS.seats.Gwynthor,
    barony: CELTIGERNS_WACHT_REGION_EMBLEMS.baronies['Llamreis Ankunft'],
    county: CELTIGERNS_WACHT_REGION_EMBLEMS.county,
    kingdom: CELTIGERNS_WACHT_REGION_EMBLEMS.kingdom
  } }
));

const SOURCE_FAMILY = {
  "schema": "aleria.family-tree",
  "schemaVersion": 1,
  "document": {
    "id": "perllan",
    "title": "Familie Perllan",
    "motto": "",
    "description": "",
    "emblem": "assets/images/houses/Llamreis Ankunft/Bürgerliche/Gwynthor/Perllan/perllan-emblem.png",
    "houseProfile": PERLLAN_HOUSE_PROFILE
  },
  "persons": [
    {
      "id": "perllan-gruender",
      "worldPersonId": "person--perllan--perllan-gruender",
      "name": "Unbekannter Gründer",
      "title": "Gründer des Hauses",
      "sex": "male",
      "status": "alive",
      "birth": "",
      "death": "",
      "portrait": "",
      "portraitPlaceholder": "auto",
      "houseId": "house-perllan",
      "familyRole": "core",
      "lineageRole": "branch",
      "tags": [
        "Gründerfamilie"
      ],
      "notes": "",
      "extensions": {}
    },
    {
      "id": "perllan-gruenderin",
      "worldPersonId": "person--perllan--perllan-gruenderin",
      "name": "Unbekannte Gründerin",
      "title": "Gründerin des Hauses",
      "sex": "female",
      "status": "alive",
      "birth": "",
      "death": "",
      "portrait": "",
      "portraitPlaceholder": "auto",
      "houseId": "house-perllan",
      "familyRole": "married",
      "lineageRole": "branch",
      "tags": [
        "Gründerfamilie"
      ],
      "notes": "",
      "extensions": {}
    },
    {
      "id": "person-adca1980",
      "worldPersonId": "person--perllan--person-adca1980",
      "name": "Ywen",
      "title": "",
      "sex": "male",
      "status": "alive",
      "birth": "1648",
      "death": "",
      "portrait": "assets/images/houses/Llamreis Ankunft/Bürgerliche/Gwynthor/Perllan/person-person-adca1980.jpg",
      "portraitPlaceholder": "auto",
      "houseId": "house-perllan",
      "familyRole": "core",
      "lineageRole": "head",
      "tags": [],
      "notes": "",
      "extensions": {}
    },
    {
      "id": "person-0866e981",
      "worldPersonId": "person--perllan--person-0866e981",
      "name": "???",
      "title": "",
      "sex": "female",
      "status": "dead",
      "birth": "1650",
      "death": "1727",
      "portrait": "",
      "portraitPlaceholder": "auto",
      "houseId": "",
      "familyRole": "married",
      "lineageRole": "branch",
      "tags": [],
      "notes": "",
      "extensions": {}
    },
    {
      "id": "person-ffc03267",
      "worldPersonId": "person--perllan--person-ffc03267",
      "name": "Collen",
      "title": "",
      "sex": "male",
      "status": "alive",
      "birth": "1668",
      "death": "",
      "portrait": "assets/images/houses/Llamreis Ankunft/Bürgerliche/Gwynthor/Perllan/person-person-ffc03267.jpg",
      "portraitPlaceholder": "auto",
      "houseId": "house-perllan",
      "familyRole": "core",
      "lineageRole": "mainline",
      "tags": [],
      "notes": "",
      "extensions": {}
    },
    {
      "id": "person-813d2bd0",
      "worldPersonId": "person--perllan--person-813d2bd0",
      "name": "Onnen",
      "title": "",
      "sex": "male",
      "status": "dead",
      "birth": "1671",
      "death": "????",
      "portrait": "assets/images/houses/Llamreis Ankunft/Bürgerliche/Gwynthor/Perllan/person-person-813d2bd0.jpg",
      "portraitPlaceholder": "auto",
      "houseId": "house-perllan",
      "familyRole": "core",
      "lineageRole": "mainline",
      "tags": [],
      "notes": "",
      "extensions": {}
    },
    {
      "id": "person-ea0ed9b5",
      "worldPersonId": "person--perllan--person-ea0ed9b5",
      "name": "Derw",
      "title": "",
      "sex": "male",
      "status": "alive",
      "birth": "1675",
      "death": "",
      "portrait": "assets/images/houses/Llamreis Ankunft/Bürgerliche/Gwynthor/Perllan/person-person-ea0ed9b5.jpg",
      "portraitPlaceholder": "auto",
      "houseId": "house-perllan",
      "familyRole": "core",
      "lineageRole": "mainline",
      "tags": [],
      "notes": "",
      "extensions": {}
    },
    {
      "id": "person-0525b525",
      "worldPersonId": "person--perllan--person-0525b525",
      "name": "Helyg",
      "title": "",
      "sex": "male",
      "status": "alive",
      "birth": "1679",
      "death": "",
      "portrait": "assets/images/houses/Llamreis Ankunft/Bürgerliche/Gwynthor/Perllan/person-person-0525b525.jpg",
      "portraitPlaceholder": "auto",
      "houseId": "house-perllan",
      "familyRole": "core",
      "lineageRole": "mainline",
      "tags": [],
      "notes": "",
      "extensions": {}
    },
    {
      "id": "person-4707e80f",
      "worldPersonId": "person--perllan--person-4707e80f",
      "name": "??",
      "title": "",
      "sex": "female",
      "status": "alive",
      "birth": "1672",
      "death": "",
      "portrait": "",
      "portraitPlaceholder": "auto",
      "houseId": "",
      "familyRole": "married",
      "lineageRole": "branch",
      "tags": [],
      "notes": "",
      "extensions": {}
    },
    {
      "id": "person-5bfd79f1",
      "worldPersonId": "person--perllan--person-5bfd79f1",
      "name": "??",
      "title": "",
      "sex": "female",
      "status": "alive",
      "birth": "1674",
      "death": "",
      "portrait": "",
      "portraitPlaceholder": "auto",
      "houseId": "",
      "familyRole": "married",
      "lineageRole": "branch",
      "tags": [],
      "notes": "",
      "extensions": {}
    },
    {
      "id": "person-10fc5dfb",
      "worldPersonId": "person--perllan--person-10fc5dfb",
      "name": "??",
      "title": "",
      "sex": "female",
      "status": "alive",
      "birth": "1679",
      "death": "",
      "portrait": "",
      "portraitPlaceholder": "auto",
      "houseId": "",
      "familyRole": "married",
      "lineageRole": "branch",
      "tags": [],
      "notes": "",
      "extensions": {}
    },
    {
      "id": "person-21ccdb87",
      "worldPersonId": "person--perllan--person-21ccdb87",
      "name": "??",
      "title": "",
      "sex": "female",
      "status": "alive",
      "birth": "1685",
      "death": "",
      "portrait": "",
      "portraitPlaceholder": "auto",
      "houseId": "",
      "familyRole": "married",
      "lineageRole": "branch",
      "tags": [],
      "notes": "",
      "extensions": {}
    },
    {
      "id": "person-ee9e3a1c",
      "worldPersonId": "person--perllan--person-ee9e3a1c",
      "name": "?? aus Aldrimar",
      "title": "",
      "sex": "female",
      "status": "alive",
      "birth": "1684",
      "death": "",
      "portrait": "",
      "portraitPlaceholder": "auto",
      "houseId": "",
      "familyRole": "affair",
      "lineageRole": "branch",
      "tags": [],
      "notes": "",
      "extensions": {}
    },
    {
      "id": "person-a61dcc92",
      "worldPersonId": "person--perllan--person-a61dcc92",
      "name": "Aeron",
      "title": "",
      "sex": "male",
      "status": "alive",
      "birth": "1694",
      "death": "",
      "portrait": "assets/images/houses/Llamreis Ankunft/Bürgerliche/Gwynthor/Perllan/person-person-a61dcc92.jpg",
      "portraitPlaceholder": "auto",
      "houseId": "house-perllan",
      "familyRole": "core",
      "lineageRole": "mainline",
      "tags": [],
      "notes": "",
      "extensions": {}
    },
    {
      "id": "person-2a0fa1e3",
      "worldPersonId": "person--perllan--person-2a0fa1e3",
      "name": "Derwyn",
      "title": "",
      "sex": "male",
      "status": "alive",
      "birth": "1698",
      "death": "",
      "portrait": "assets/images/houses/Llamreis Ankunft/Bürgerliche/Gwynthor/Perllan/person-person-2a0fa1e3.jpg",
      "portraitPlaceholder": "auto",
      "houseId": "house-perllan",
      "familyRole": "core",
      "lineageRole": "mainline",
      "tags": [],
      "notes": "",
      "extensions": {}
    },
    {
      "id": "person-4701179c",
      "worldPersonId": "person--perllan--person-4701179c",
      "name": "Briallen",
      "title": "",
      "sex": "female",
      "status": "alive",
      "birth": "1700",
      "death": "",
      "portrait": "assets/images/houses/Llamreis Ankunft/Bürgerliche/Gwynthor/Perllan/person-person-4701179c.jpg",
      "portraitPlaceholder": "auto",
      "houseId": "house-perllan",
      "familyRole": "core",
      "lineageRole": "mainline",
      "tags": [],
      "notes": "",
      "extensions": {}
    },
    {
      "id": "person-19abcc6c",
      "worldPersonId": "person--perllan--person-19abcc6c",
      "name": "Bedw",
      "title": "",
      "sex": "male",
      "status": "alive",
      "birth": "1696",
      "death": "",
      "portrait": "assets/images/houses/Llamreis Ankunft/Bürgerliche/Gwynthor/Perllan/person-person-19abcc6c.jpg",
      "portraitPlaceholder": "auto",
      "houseId": "house-perllan",
      "familyRole": "core",
      "lineageRole": "branch",
      "tags": [],
      "notes": "",
      "extensions": {}
    },
    {
      "id": "person-287fc4b9",
      "worldPersonId": "person--perllan--person-287fc4b9",
      "name": "Celyn",
      "title": "",
      "sex": "female",
      "status": "alive",
      "birth": "1700",
      "death": "",
      "portrait": "assets/images/houses/Llamreis Ankunft/Bürgerliche/Gwynthor/Perllan/person-person-287fc4b9.jpg",
      "portraitPlaceholder": "auto",
      "houseId": "house-perllan",
      "familyRole": "core",
      "lineageRole": "branch",
      "tags": [],
      "notes": "",
      "extensions": {}
    },
    {
      "id": "person-c8b2b4fe",
      "worldPersonId": "person--perllan--person-c8b2b4fe",
      "name": "Bedwen",
      "title": "",
      "sex": "female",
      "status": "alive",
      "birth": "1701",
      "death": "",
      "portrait": "assets/images/houses/Llamreis Ankunft/Bürgerliche/Gwynthor/Perllan/person-person-c8b2b4fe.jpg",
      "portraitPlaceholder": "auto",
      "houseId": "house-perllan",
      "familyRole": "core",
      "lineageRole": "branch",
      "tags": [],
      "notes": "",
      "extensions": {}
    },
    {
      "id": "person-dd1b372f",
      "worldPersonId": "person--perllan--person-dd1b372f",
      "name": "Eirlys",
      "title": "",
      "sex": "female",
      "status": "alive",
      "birth": "1704",
      "death": "",
      "portrait": "assets/images/houses/Llamreis Ankunft/Bürgerliche/Gwynthor/Perllan/person-person-dd1b372f.jpg",
      "portraitPlaceholder": "auto",
      "houseId": "house-perllan",
      "familyRole": "core",
      "lineageRole": "branch",
      "tags": [],
      "notes": "",
      "extensions": {}
    },
    {
      "id": "person-801c8462",
      "worldPersonId": "person--perllan--person-801c8462",
      "name": "Ysgaw",
      "title": "",
      "sex": "male",
      "status": "alive",
      "birth": "1702",
      "death": "",
      "portrait": "assets/images/houses/Llamreis Ankunft/Bürgerliche/Gwynthor/Perllan/person-person-801c8462.jpg",
      "portraitPlaceholder": "auto",
      "houseId": "house-perllan",
      "familyRole": "bastard",
      "lineageRole": "branch",
      "tags": [],
      "notes": "",
      "extensions": {}
    },
    {
      "id": "person-6b4c948f",
      "worldPersonId": "person--perllan--person-6b4c948f",
      "name": "Draen",
      "title": "",
      "sex": "male",
      "status": "alive",
      "birth": "1704",
      "death": "",
      "portrait": "assets/images/houses/Llamreis Ankunft/Bürgerliche/Gwynthor/Perllan/person-person-6b4c948f.png",
      "portraitPlaceholder": "auto",
      "houseId": "house-perllan",
      "familyRole": "core",
      "lineageRole": "branch",
      "tags": [],
      "notes": "",
      "extensions": {}
    },
    {
      "id": "person-5b891c03",
      "worldPersonId": "person--perllan--person-5b891c03",
      "name": "Blodwen",
      "title": "",
      "sex": "female",
      "status": "alive",
      "birth": "1709",
      "death": "",
      "portrait": "assets/images/houses/Llamreis Ankunft/Bürgerliche/Gwynthor/Perllan/person-person-5b891c03.jpg",
      "portraitPlaceholder": "auto",
      "houseId": "house-perllan",
      "familyRole": "core",
      "lineageRole": "branch",
      "tags": [],
      "notes": "",
      "extensions": {}
    },
    {
      "id": "person-d8a0ec35",
      "worldPersonId": "person--perllan--person-d8a0ec35",
      "name": "??",
      "title": "",
      "sex": "female",
      "status": "alive",
      "birth": "1698",
      "death": "",
      "portrait": "",
      "portraitPlaceholder": "auto",
      "houseId": "",
      "familyRole": "married",
      "lineageRole": "branch",
      "tags": [],
      "notes": "",
      "extensions": {}
    },
    {
      "id": "person-29996da3",
      "worldPersonId": "person--perllan--person-29996da3",
      "name": "??",
      "title": "",
      "sex": "female",
      "status": "alive",
      "birth": "1701",
      "death": "",
      "portrait": "",
      "portraitPlaceholder": "auto",
      "houseId": "",
      "familyRole": "married",
      "lineageRole": "branch",
      "tags": [],
      "notes": "",
      "extensions": {}
    },
    {
      "id": "person-1a7e3edc",
      "worldPersonId": "person--perllan--person-1a7e3edc",
      "name": "??",
      "title": "",
      "sex": "male",
      "status": "alive",
      "birth": "",
      "death": "",
      "portrait": "",
      "portraitPlaceholder": "auto",
      "houseId": "",
      "familyRole": "married",
      "lineageRole": "branch",
      "tags": [],
      "notes": "",
      "extensions": {}
    },
    {
      "id": "person-a1e94399",
      "worldPersonId": "person--perllan--person-a1e94399",
      "name": "??",
      "title": "",
      "sex": "female",
      "status": "alive",
      "birth": "1698",
      "death": "",
      "portrait": "",
      "portraitPlaceholder": "auto",
      "houseId": "",
      "familyRole": "married",
      "lineageRole": "branch",
      "tags": [],
      "notes": "",
      "extensions": {}
    },
    {
      "id": "person-02a890dc",
      "worldPersonId": "person--perllan--person-02a890dc",
      "name": "??",
      "title": "",
      "sex": "male",
      "status": "alive",
      "birth": "",
      "death": "",
      "portrait": "",
      "portraitPlaceholder": "auto",
      "houseId": "",
      "familyRole": "married",
      "lineageRole": "branch",
      "tags": [],
      "notes": "",
      "extensions": {}
    },
    {
      "id": "person-0b08019f",
      "worldPersonId": "person--perllan--person-0b08019f",
      "name": "??",
      "title": "",
      "sex": "male",
      "status": "alive",
      "birth": "",
      "death": "",
      "portrait": "",
      "portraitPlaceholder": "auto",
      "houseId": "",
      "familyRole": "married",
      "lineageRole": "branch",
      "tags": [],
      "notes": "",
      "extensions": {}
    },
    {
      "id": "person-671f1df5",
      "worldPersonId": "person--perllan--person-671f1df5",
      "name": "??",
      "title": "",
      "sex": "male",
      "status": "alive",
      "birth": "",
      "death": "",
      "portrait": "",
      "portraitPlaceholder": "auto",
      "houseId": "",
      "familyRole": "married",
      "lineageRole": "branch",
      "tags": [],
      "notes": "",
      "extensions": {}
    },
    {
      "id": "person-1afbd3a9",
      "worldPersonId": "person--perllan--person-1afbd3a9",
      "name": "??",
      "title": "",
      "sex": "female",
      "status": "alive",
      "birth": "1708",
      "death": "",
      "portrait": "",
      "portraitPlaceholder": "auto",
      "houseId": "",
      "familyRole": "married",
      "lineageRole": "branch",
      "tags": [],
      "notes": "",
      "extensions": {}
    },
    {
      "id": "person-ce3e0813",
      "worldPersonId": "person--perllan--person-ce3e0813",
      "name": "??",
      "title": "",
      "sex": "female",
      "status": "alive",
      "birth": "1708",
      "death": "",
      "portrait": "",
      "portraitPlaceholder": "auto",
      "houseId": "",
      "familyRole": "married",
      "lineageRole": "branch",
      "tags": [],
      "notes": "",
      "extensions": {}
    },
    {
      "id": "person-e802f95d",
      "worldPersonId": "person--perllan--person-e802f95d",
      "name": "Gwern",
      "title": "",
      "sex": "female",
      "status": "alive",
      "birth": "1717",
      "death": "",
      "portrait": "assets/images/houses/Llamreis Ankunft/Bürgerliche/Gwynthor/Perllan/person-person-e802f95d.jpg",
      "portraitPlaceholder": "auto",
      "houseId": "house-perllan",
      "familyRole": "core",
      "lineageRole": "mainline",
      "tags": [],
      "notes": "",
      "extensions": {}
    },
    {
      "id": "person-7e672734",
      "worldPersonId": "person--perllan--person-7e672734",
      "name": "Mesen",
      "title": "",
      "sex": "male",
      "status": "alive",
      "birth": "1721",
      "death": "",
      "portrait": "assets/images/houses/Llamreis Ankunft/Bürgerliche/Gwynthor/Perllan/person-person-7e672734.jpg",
      "portraitPlaceholder": "auto",
      "houseId": "house-perllan",
      "familyRole": "core",
      "lineageRole": "mainline",
      "tags": [],
      "notes": "",
      "extensions": {}
    },
    {
      "id": "person-ec01a3c1",
      "worldPersonId": "person--perllan--person-ec01a3c1",
      "name": "Hedra",
      "title": "",
      "sex": "female",
      "status": "alive",
      "birth": "1726",
      "death": "",
      "portrait": "assets/images/houses/Llamreis Ankunft/Bürgerliche/Gwynthor/Perllan/person-person-ec01a3c1.jpg",
      "portraitPlaceholder": "auto",
      "houseId": "house-perllan",
      "familyRole": "core",
      "lineageRole": "mainline",
      "tags": [],
      "notes": "",
      "extensions": {}
    },
    {
      "id": "person-5b293f1b",
      "worldPersonId": "person--perllan--person-5b293f1b",
      "name": "Afallen",
      "title": "",
      "sex": "male",
      "status": "alive",
      "birth": "1732",
      "death": "",
      "portrait": "assets/images/houses/Llamreis Ankunft/Bürgerliche/Gwynthor/Perllan/person-person-5b293f1b.jpg",
      "portraitPlaceholder": "auto",
      "houseId": "house-perllan",
      "familyRole": "core",
      "lineageRole": "mainline",
      "tags": [],
      "notes": "",
      "extensions": {}
    },
    {
      "id": "person-a0e1ea6a",
      "worldPersonId": "person--perllan--person-a0e1ea6a",
      "name": "Rhosyn",
      "title": "",
      "sex": "female",
      "status": "alive",
      "birth": "1723",
      "death": "",
      "portrait": "assets/images/houses/Llamreis Ankunft/Bürgerliche/Gwynthor/Perllan/person-person-a0e1ea6a.jpg",
      "portraitPlaceholder": "auto",
      "houseId": "house-perllan",
      "familyRole": "core",
      "lineageRole": "branch",
      "tags": [],
      "notes": "",
      "extensions": {}
    },
    {
      "id": "person-1b72c8d5",
      "worldPersonId": "person--perllan--person-1b72c8d5",
      "name": "Celynnen",
      "title": "",
      "sex": "female",
      "status": "alive",
      "birth": "1728",
      "death": "",
      "portrait": "assets/images/houses/Llamreis Ankunft/Bürgerliche/Gwynthor/Perllan/person-person-1b72c8d5.jpg",
      "portraitPlaceholder": "auto",
      "houseId": "house-perllan",
      "familyRole": "core",
      "lineageRole": "branch",
      "tags": [],
      "notes": "",
      "extensions": {}
    },
    {
      "id": "person-44498061",
      "worldPersonId": "person--perllan--person-44498061",
      "name": "Draenen",
      "title": "",
      "sex": "female",
      "status": "alive",
      "birth": "1719",
      "death": "",
      "portrait": "assets/images/houses/Llamreis Ankunft/Bürgerliche/Gwynthor/Perllan/person-person-44498061.jpg",
      "portraitPlaceholder": "auto",
      "houseId": "house-perllan",
      "familyRole": "core",
      "lineageRole": "branch",
      "tags": [],
      "notes": "",
      "extensions": {}
    },
    {
      "id": "person-b57f28f9",
      "worldPersonId": "person--perllan--person-b57f28f9",
      "name": "Helygen",
      "title": "Knappe",
      "sex": "male",
      "status": "alive",
      "birth": "1724",
      "death": "",
      "portrait": "assets/images/houses/Llamreis Ankunft/Bürgerliche/Gwynthor/Perllan/person-person-b57f28f9.jpg",
      "portraitPlaceholder": "auto",
      "houseId": "house-perllan",
      "familyRole": "core",
      "lineageRole": "branch",
      "tags": [],
      "notes": "",
      "extensions": {}
    },
    {
      "id": "person-458a8c43",
      "worldPersonId": "person--perllan--person-458a8c43",
      "name": "Ffawydd",
      "title": "",
      "sex": "female",
      "status": "alive",
      "birth": "1730",
      "death": "",
      "portrait": "assets/images/houses/Llamreis Ankunft/Bürgerliche/Gwynthor/Perllan/person-person-458a8c43.jpg",
      "portraitPlaceholder": "auto",
      "houseId": "",
      "familyRole": "core",
      "lineageRole": "branch",
      "tags": [],
      "notes": "",
      "extensions": {}
    },
    {
      "id": "person-b758cea4",
      "worldPersonId": "person--perllan--person-b758cea4",
      "name": "Onn",
      "title": "",
      "sex": "female",
      "status": "alive",
      "birth": "1727",
      "death": "",
      "portrait": "assets/images/houses/Llamreis Ankunft/Bürgerliche/Gwynthor/Perllan/person-person-b758cea4.jpg",
      "portraitPlaceholder": "auto",
      "houseId": "house-perllan",
      "familyRole": "core",
      "lineageRole": "branch",
      "tags": [],
      "notes": "",
      "extensions": {}
    },
    {
      "id": "person-f3cccc1a",
      "worldPersonId": "person--perllan--person-f3cccc1a",
      "name": "Lili",
      "title": "",
      "sex": "female",
      "status": "alive",
      "birth": "1731",
      "death": "",
      "portrait": "assets/images/houses/Llamreis Ankunft/Bürgerliche/Gwynthor/Perllan/person-person-f3cccc1a.jpg",
      "portraitPlaceholder": "auto",
      "houseId": "",
      "familyRole": "core",
      "lineageRole": "branch",
      "tags": [],
      "notes": "",
      "extensions": {}
    },
    {
      "id": "person-02e7bc53",
      "worldPersonId": "person--perllan--person-02e7bc53",
      "name": "Brwyn",
      "title": "Page",
      "sex": "female",
      "status": "alive",
      "birth": "1729",
      "death": "",
      "portrait": "assets/images/houses/Llamreis Ankunft/Bürgerliche/Gwynthor/Perllan/person-person-02e7bc53.jpg",
      "portraitPlaceholder": "auto",
      "houseId": "house-perllan",
      "familyRole": "core",
      "lineageRole": "branch",
      "tags": [],
      "notes": "",
      "extensions": {}
    }
  ],
  "partnerships": [
    {
      "id": "marriage-perllan-founders",
      "participantIds": [
        "perllan-gruender",
        "perllan-gruenderin"
      ],
      "type": "marriage",
      "status": "active",
      "start": "",
      "end": "",
      "certainty": "confirmed",
      "visibility": "public",
      "notes": "Gründerehe des Hauses.",
      "extensions": {}
    },
    {
      "id": "partnership-83c8f084",
      "participantIds": [
        "person-adca1980",
        "person-0866e981"
      ],
      "type": "marriage",
      "status": "active",
      "start": "",
      "end": "",
      "certainty": "confirmed",
      "visibility": "public",
      "notes": "",
      "extensions": {}
    },
    {
      "id": "partnership-c37c1b44",
      "participantIds": [
        "person-ffc03267",
        "person-4707e80f"
      ],
      "type": "marriage",
      "status": "active",
      "start": "",
      "end": "",
      "certainty": "confirmed",
      "visibility": "public",
      "notes": "",
      "extensions": {}
    },
    {
      "id": "partnership-f928cb1c",
      "participantIds": [
        "person-813d2bd0",
        "person-5bfd79f1"
      ],
      "type": "marriage",
      "status": "active",
      "start": "",
      "end": "",
      "certainty": "confirmed",
      "visibility": "public",
      "notes": "",
      "extensions": {}
    },
    {
      "id": "partnership-ff94c7a8",
      "participantIds": [
        "person-ea0ed9b5",
        "person-10fc5dfb"
      ],
      "type": "marriage",
      "status": "active",
      "start": "",
      "end": "",
      "certainty": "confirmed",
      "visibility": "public",
      "notes": "",
      "extensions": {}
    },
    {
      "id": "partnership-07a96bb2",
      "participantIds": [
        "person-0525b525",
        "person-21ccdb87"
      ],
      "type": "marriage",
      "status": "active",
      "start": "",
      "end": "",
      "certainty": "confirmed",
      "visibility": "public",
      "notes": "",
      "extensions": {}
    },
    {
      "id": "partnership-3354660a",
      "participantIds": [
        "person-0525b525",
        "person-ee9e3a1c"
      ],
      "type": "affair",
      "status": "secret",
      "start": "",
      "end": "",
      "certainty": "confirmed",
      "visibility": "public",
      "notes": "",
      "extensions": {
        "chartAlignParentPairOverChildPersonId": "person-801c8462",
        "chartAutomaticSingleChildAlignment": true
      }
    },
    {
      "id": "partnership-3eaf3980",
      "participantIds": [
        "person-a61dcc92",
        "person-d8a0ec35"
      ],
      "type": "marriage",
      "status": "active",
      "start": "",
      "end": "",
      "certainty": "confirmed",
      "visibility": "public",
      "notes": "",
      "extensions": {}
    },
    {
      "id": "partnership-22eeec7f",
      "participantIds": [
        "person-2a0fa1e3",
        "person-29996da3"
      ],
      "type": "marriage",
      "status": "active",
      "start": "",
      "end": "",
      "certainty": "confirmed",
      "visibility": "public",
      "notes": "",
      "extensions": {}
    },
    {
      "id": "partnership-416b09c0",
      "participantIds": [
        "person-4701179c",
        "person-1a7e3edc"
      ],
      "type": "marriage",
      "status": "active",
      "start": "",
      "end": "",
      "certainty": "confirmed",
      "visibility": "public",
      "notes": "",
      "extensions": {}
    },
    {
      "id": "partnership-3f915ab3",
      "participantIds": [
        "person-19abcc6c",
        "person-a1e94399"
      ],
      "type": "marriage",
      "status": "active",
      "start": "",
      "end": "",
      "certainty": "confirmed",
      "visibility": "public",
      "notes": "",
      "extensions": {}
    },
    {
      "id": "partnership-7b781d2b",
      "participantIds": [
        "person-287fc4b9",
        "person-02a890dc"
      ],
      "type": "marriage",
      "status": "active",
      "start": "",
      "end": "",
      "certainty": "confirmed",
      "visibility": "public",
      "notes": "",
      "extensions": {}
    },
    {
      "id": "partnership-9c313812",
      "participantIds": [
        "person-c8b2b4fe",
        "person-0b08019f"
      ],
      "type": "marriage",
      "status": "active",
      "start": "",
      "end": "",
      "certainty": "confirmed",
      "visibility": "public",
      "notes": "",
      "extensions": {}
    },
    {
      "id": "partnership-1d668d32",
      "participantIds": [
        "person-dd1b372f",
        "person-671f1df5"
      ],
      "type": "marriage",
      "status": "active",
      "start": "",
      "end": "",
      "certainty": "confirmed",
      "visibility": "public",
      "notes": "",
      "extensions": {}
    },
    {
      "id": "partnership-ecf526eb",
      "participantIds": [
        "person-801c8462",
        "person-1afbd3a9"
      ],
      "type": "marriage",
      "status": "active",
      "start": "",
      "end": "",
      "certainty": "confirmed",
      "visibility": "public",
      "notes": "",
      "extensions": {}
    },
    {
      "id": "partnership-1f74916b",
      "participantIds": [
        "person-6b4c948f",
        "person-ce3e0813"
      ],
      "type": "marriage",
      "status": "active",
      "start": "",
      "end": "",
      "certainty": "confirmed",
      "visibility": "public",
      "notes": "",
      "extensions": {
        "chartAlignParentPairOverChildPersonId": "person-02e7bc53",
        "chartAutomaticSingleChildAlignment": true
      }
    }
  ],
  "parentages": [
    {
      "id": "parentage-93c1bebe",
      "childId": "person-adca1980",
      "parentIds": [
        "perllan-gruender",
        "perllan-gruenderin"
      ],
      "partnershipId": "marriage-perllan-founders",
      "type": "claimed",
      "legitimacy": "unknown",
      "certainty": "probable",
      "visibility": "public",
      "notes": "Nach einem Zeitsprung wieder belegte Linie.",
      "extensions": {
        "timeJumpId": "time-jump-9f91c659",
        "timeJumpCreated": true
      }
    },
    {
      "id": "parentage-d97b17d2",
      "childId": "person-ffc03267",
      "parentIds": [
        "person-adca1980",
        "person-0866e981"
      ],
      "partnershipId": "partnership-83c8f084",
      "type": "biological",
      "legitimacy": "legitimate",
      "certainty": "confirmed",
      "visibility": "public",
      "notes": "",
      "extensions": {}
    },
    {
      "id": "parentage-ab6be121",
      "childId": "person-813d2bd0",
      "parentIds": [
        "person-adca1980",
        "person-0866e981"
      ],
      "partnershipId": "partnership-83c8f084",
      "type": "biological",
      "legitimacy": "legitimate",
      "certainty": "confirmed",
      "visibility": "public",
      "notes": "",
      "extensions": {}
    },
    {
      "id": "parentage-4a2e7489",
      "childId": "person-ea0ed9b5",
      "parentIds": [
        "person-adca1980",
        "person-0866e981"
      ],
      "partnershipId": "partnership-83c8f084",
      "type": "biological",
      "legitimacy": "legitimate",
      "certainty": "confirmed",
      "visibility": "public",
      "notes": "",
      "extensions": {}
    },
    {
      "id": "parentage-6639d2d1",
      "childId": "person-0525b525",
      "parentIds": [
        "person-adca1980",
        "person-0866e981"
      ],
      "partnershipId": "partnership-83c8f084",
      "type": "biological",
      "legitimacy": "legitimate",
      "certainty": "confirmed",
      "visibility": "public",
      "notes": "",
      "extensions": {}
    },
    {
      "id": "parentage-2b95bb76",
      "childId": "person-a61dcc92",
      "parentIds": [
        "person-ffc03267",
        "person-4707e80f"
      ],
      "partnershipId": "partnership-c37c1b44",
      "type": "biological",
      "legitimacy": "legitimate",
      "certainty": "confirmed",
      "visibility": "public",
      "notes": "",
      "extensions": {}
    },
    {
      "id": "parentage-aa6ef3bc",
      "childId": "person-2a0fa1e3",
      "parentIds": [
        "person-ffc03267",
        "person-4707e80f"
      ],
      "partnershipId": "partnership-c37c1b44",
      "type": "biological",
      "legitimacy": "legitimate",
      "certainty": "confirmed",
      "visibility": "public",
      "notes": "",
      "extensions": {}
    },
    {
      "id": "parentage-bcf42f29",
      "childId": "person-4701179c",
      "parentIds": [
        "person-ffc03267",
        "person-4707e80f"
      ],
      "partnershipId": "partnership-c37c1b44",
      "type": "biological",
      "legitimacy": "legitimate",
      "certainty": "confirmed",
      "visibility": "public",
      "notes": "",
      "extensions": {}
    },
    {
      "id": "parentage-05b093e7",
      "childId": "person-19abcc6c",
      "parentIds": [
        "person-813d2bd0",
        "person-5bfd79f1"
      ],
      "partnershipId": "partnership-f928cb1c",
      "type": "biological",
      "legitimacy": "legitimate",
      "certainty": "confirmed",
      "visibility": "public",
      "notes": "",
      "extensions": {}
    },
    {
      "id": "parentage-2f2e3ee1",
      "childId": "person-287fc4b9",
      "parentIds": [
        "person-813d2bd0",
        "person-5bfd79f1"
      ],
      "partnershipId": "partnership-f928cb1c",
      "type": "biological",
      "legitimacy": "legitimate",
      "certainty": "confirmed",
      "visibility": "public",
      "notes": "",
      "extensions": {}
    },
    {
      "id": "parentage-406da7e6",
      "childId": "person-c8b2b4fe",
      "parentIds": [
        "person-ea0ed9b5",
        "person-10fc5dfb"
      ],
      "partnershipId": "partnership-ff94c7a8",
      "type": "biological",
      "legitimacy": "legitimate",
      "certainty": "confirmed",
      "visibility": "public",
      "notes": "",
      "extensions": {}
    },
    {
      "id": "parentage-1aa18ce7",
      "childId": "person-dd1b372f",
      "parentIds": [
        "person-ea0ed9b5",
        "person-10fc5dfb"
      ],
      "partnershipId": "partnership-ff94c7a8",
      "type": "biological",
      "legitimacy": "legitimate",
      "certainty": "confirmed",
      "visibility": "public",
      "notes": "",
      "extensions": {}
    },
    {
      "id": "parentage-1728ae57",
      "childId": "person-801c8462",
      "parentIds": [
        "person-ee9e3a1c",
        "person-0525b525"
      ],
      "partnershipId": "partnership-3354660a",
      "type": "biological",
      "legitimacy": "legitimized",
      "certainty": "confirmed",
      "visibility": "public",
      "notes": "",
      "extensions": {}
    },
    {
      "id": "parentage-bdb24713",
      "childId": "person-6b4c948f",
      "parentIds": [
        "person-21ccdb87",
        "person-0525b525"
      ],
      "partnershipId": "partnership-07a96bb2",
      "type": "biological",
      "legitimacy": "legitimate",
      "certainty": "confirmed",
      "visibility": "public",
      "notes": "",
      "extensions": {}
    },
    {
      "id": "parentage-d74d006e",
      "childId": "person-5b891c03",
      "parentIds": [
        "person-21ccdb87",
        "person-0525b525"
      ],
      "partnershipId": "partnership-07a96bb2",
      "type": "biological",
      "legitimacy": "legitimate",
      "certainty": "confirmed",
      "visibility": "public",
      "notes": "",
      "extensions": {}
    },
    {
      "id": "parentage-a3b59e8d",
      "childId": "person-e802f95d",
      "parentIds": [
        "person-a61dcc92",
        "person-d8a0ec35"
      ],
      "partnershipId": "partnership-3eaf3980",
      "type": "biological",
      "legitimacy": "legitimate",
      "certainty": "confirmed",
      "visibility": "public",
      "notes": "",
      "extensions": {}
    },
    {
      "id": "parentage-92d69b58",
      "childId": "person-7e672734",
      "parentIds": [
        "person-a61dcc92",
        "person-d8a0ec35"
      ],
      "partnershipId": "partnership-3eaf3980",
      "type": "biological",
      "legitimacy": "legitimate",
      "certainty": "confirmed",
      "visibility": "public",
      "notes": "",
      "extensions": {}
    },
    {
      "id": "parentage-c6db6766",
      "childId": "person-ec01a3c1",
      "parentIds": [
        "person-a61dcc92",
        "person-d8a0ec35"
      ],
      "partnershipId": "partnership-3eaf3980",
      "type": "biological",
      "legitimacy": "legitimate",
      "certainty": "confirmed",
      "visibility": "public",
      "notes": "",
      "extensions": {}
    },
    {
      "id": "parentage-ff431f10",
      "childId": "person-5b293f1b",
      "parentIds": [
        "person-a61dcc92",
        "person-d8a0ec35"
      ],
      "partnershipId": "partnership-3eaf3980",
      "type": "biological",
      "legitimacy": "legitimate",
      "certainty": "confirmed",
      "visibility": "public",
      "notes": "",
      "extensions": {}
    },
    {
      "id": "parentage-9f920ab4",
      "childId": "person-a0e1ea6a",
      "parentIds": [
        "person-2a0fa1e3",
        "person-29996da3"
      ],
      "partnershipId": "partnership-22eeec7f",
      "type": "biological",
      "legitimacy": "legitimate",
      "certainty": "confirmed",
      "visibility": "public",
      "notes": "",
      "extensions": {}
    },
    {
      "id": "parentage-82c4f747",
      "childId": "person-1b72c8d5",
      "parentIds": [
        "person-2a0fa1e3",
        "person-29996da3"
      ],
      "partnershipId": "partnership-22eeec7f",
      "type": "biological",
      "legitimacy": "legitimate",
      "certainty": "confirmed",
      "visibility": "public",
      "notes": "",
      "extensions": {}
    },
    {
      "id": "parentage-ec5a8a3d",
      "childId": "person-44498061",
      "parentIds": [
        "person-19abcc6c",
        "person-a1e94399"
      ],
      "partnershipId": "partnership-3f915ab3",
      "type": "biological",
      "legitimacy": "legitimate",
      "certainty": "confirmed",
      "visibility": "public",
      "notes": "",
      "extensions": {}
    },
    {
      "id": "parentage-28437753",
      "childId": "person-b57f28f9",
      "parentIds": [
        "person-19abcc6c",
        "person-a1e94399"
      ],
      "partnershipId": "partnership-3f915ab3",
      "type": "biological",
      "legitimacy": "legitimate",
      "certainty": "confirmed",
      "visibility": "public",
      "notes": "",
      "extensions": {}
    },
    {
      "id": "parentage-98b4b0b7",
      "childId": "person-458a8c43",
      "parentIds": [
        "person-19abcc6c",
        "person-a1e94399"
      ],
      "partnershipId": "partnership-3f915ab3",
      "type": "biological",
      "legitimacy": "legitimate",
      "certainty": "confirmed",
      "visibility": "public",
      "notes": "",
      "extensions": {}
    },
    {
      "id": "parentage-9169b95e",
      "childId": "person-b758cea4",
      "parentIds": [
        "person-801c8462",
        "person-1afbd3a9"
      ],
      "partnershipId": "partnership-ecf526eb",
      "type": "biological",
      "legitimacy": "legitimate",
      "certainty": "confirmed",
      "visibility": "public",
      "notes": "",
      "extensions": {}
    },
    {
      "id": "parentage-568cbfec",
      "childId": "person-f3cccc1a",
      "parentIds": [
        "person-801c8462",
        "person-1afbd3a9"
      ],
      "partnershipId": "partnership-ecf526eb",
      "type": "biological",
      "legitimacy": "legitimate",
      "certainty": "confirmed",
      "visibility": "public",
      "notes": "",
      "extensions": {}
    },
    {
      "id": "parentage-c060fcee",
      "childId": "person-02e7bc53",
      "parentIds": [
        "person-6b4c948f",
        "person-ce3e0813"
      ],
      "partnershipId": "partnership-1f74916b",
      "type": "biological",
      "legitimacy": "legitimate",
      "certainty": "confirmed",
      "visibility": "public",
      "notes": "",
      "extensions": {}
    }
  ],
  "houses": [
    {
      "id": "house-perllan",
      "name": "Perllan",
      "motto": "",
      "emblem": "assets/images/houses/Llamreis Ankunft/Bürgerliche/Gwynthor/Perllan/perllan-emblem.png",
      "status": "active"
    }
  ],
  "cadetBranches": [],
  "timeJumps": [
    {
      "id": "time-jump-9f91c659",
      "parentPartnershipId": "marriage-perllan-founders",
      "sharedParentPartnershipIds": [],
      "parentPersonId": "",
      "childIds": [
        "person-adca1980"
      ],
      "years": 0,
      "fromYear": "",
      "toYear": "????",
      "label": "",
      "notes": "",
      "extensions": {}
    }
  ],
  "lineage": {
    "founderPartnershipId": "marriage-perllan-founders",
    "houseId": "house-perllan",
    "crestSubtitle": "",
    "crestEmblemScale": 0.86,
    "crestFrame": "gold",
    "crestFrameScale": 1,
    "timeGap": {
      "enabled": false,
      "years": 0,
      "fromYear": "",
      "toYear": "",
      "label": ""
    },
    "originHouse": {
      "enabled": false,
      "id": "lineage-origin-house",
      "houseId": "",
      "name": "Ursprungshaus",
      "subtitle": "",
      "emblem": "",
      "emblemScale": 0.86,
      "crestFrame": "gold",
      "frameScale": 1,
      "childIds": [],
      "targetFamilyId": "",
      "notes": "",
      "timeGap": {
        "enabled": false,
        "years": 0,
        "fromYear": "",
        "toYear": "",
        "label": ""
      }
    }
  },
  "presentation": {
    "relationshipColors": {
      "marriage": "#326c4a",
      "engagement": "#b88b37",
      "union": "#8e2724",
      "affair": "#704485",
      "concubinage": "#704485",
      "political": "#9d7d48",
      "forced": "#c7a974",
      "biological": "#8e2724",
      "adoptive": "#2f75a8",
      "foster": "#2f75a8",
      "step": "#7eb4d7",
      "magical": "#704485",
      "claimed": "#62615e"
    }
  },
  "view": {
    "focusPersonId": "perllan-gruender",
    "orientation": "vertical",
    "ancestorDepth": 8,
    "descendantDepth": 8,
    "limitGenerations": false,
    "showSiblings": true
  },
  "extensions": {
    "registry": {
      "folderPath": [
        "Cenyr",
        "Celtigerns Wacht",
        "Llamreis Ankunft",
        "Gwynthor"
      ],
      "unclassified": false
    },
    "generatorProfile": {
      "origin": "Gwynthor",
      "culture": "Cenyri",
      "religion": "Alerische Kirche",
      "governance": "Keine",
      "foundingYear": "ca. 1240",
      "founderHouseName": "",
      "houseColors": "Waldgrün",
      "specialTraits": ""
    },
    "sourceRevision": 1,
    "sourceDocumentId": "perllan",
    "sourceInventory": "assets/data/source-inventories/perllan-20261104/inventory.json"
  }
};

// The browser consumes a static biography map produced by the bounded character
// import. It has no dependency on the Almanach or its runtime character state.
export const HOUSE_PERLLAN_FAMILY = Object.freeze({
  ...SOURCE_FAMILY,
  persons: SOURCE_FAMILY.persons.map(person => PERLLAN_PERSON_BIOGRAPHIES[person.id]
    ? { ...person, extensions: { ...person.extensions, biographyModule: PERLLAN_PERSON_BIOGRAPHIES[person.id] } }
    : person)
});
