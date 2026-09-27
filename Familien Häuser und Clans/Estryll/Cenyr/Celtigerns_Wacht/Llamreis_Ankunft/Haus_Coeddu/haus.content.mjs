// Redaktionelle Quelle für Hausseite und kurze Stammbaum-Bio.
// Familien- und Hausangaben nach Benutzervorgaben vom 27./28.09.2026.
const OVERVIEW = 'Haus Coeddu ist ein kriegerisches Bürgerhaus aus Gwynthor, das Haus Draig seit Generationen dient. Die Familie stellt Wachen und Waffenknechte; einzelne Angehörige haben auch den Ritterschlag erhalten. Neben dem Waffendienst unterhalten die Coeddu eine beliebte Waffenschmiede in Gwynthor. Ihr Name steht in der Stadt damit sowohl für die Männer und Frauen im Dienst der Draig als auch für das Waffenhandwerk.';
const HISTORY = 'Die Namen des ursprünglichen Gründerpaares und die frühen Generationen sind nicht überliefert. Der Dienst für Haus Draig gehört seit Generationen zur Geschichte der Familie. Mit Brenric wird die jüngere Linie greifbar: Er kämpfte im Großen Krieg unter Sir Maredudd und trat wegen wiederkehrender Gelenkbeschwerden, besonders am Fuß, in den Ruhestand. Sein Sohn Llywelyn dient als Waffenknecht. Durch dessen Ehe mit Catrin Craigddu sind die Coeddu mit einer weiteren kriegerischen Bürgerfamilie Gwynthors verbunden.';
const CHARACTER = 'Waffendienst und Waffenschmiede prägen das Haus gleichermaßen. Die beliebte Schmiede verankert die Coeddu im städtischen Handwerk, während ihre Wachen, Waffenknechte und gelegentlichen Ritter für Haus Draig einstehen. Das Haus bleibt bürgerlich; der Ritterschlag einzelner Angehöriger macht nicht die ganze Familie zu einem Adelshaus.';
export const HOUSE_CONTENT = {
  "id": "haus-coeddu",
  "name": "Haus Coeddu",
  "type": "Bürgerliches Haus",
  "page": "kleinehaeuser.html",
  "county": "Celtigerns Wacht",
  "liege": "Haus Draig",
  "territoryId": "celtigerns-wacht",
  "territoryName": "Celtigerns Wacht",
  "territoryHref": "../Kontinente/Estryll/Königreich Cenyr/Grafschaft Celtigerns Wacht/Grafschaft Celtigerns Wacht.html",
  "parentHouseId": "",
  "extinct": false,
  "showMotto": false,
  "prepared": true,
  "registerPage": true,
  "biographySourceRevision": 2,
  "biographyPreviousDefaultFingerprints": ["2223:5a8fd8ce:2d6090ec"],
  "biographyIntroTitle": "Über das Haus",
  "biographyHistoryTitle": "Geschichte",
  "biographySummary": {
    "overview": OVERVIEW,
    "history": HISTORY,
    "character": CHARACTER
  },
  "placeholders": {
    "male": "../Stammbäume/assets/images/placeholders/male.png",
    "female": "../Stammbäume/assets/images/placeholders/female.png"
  },
  "allies": [
    {
      "name": "Haus Draig",
      "detail": "Lehnsherr",
      "image": "../Stammbäume/assets/images/houses/Llamreis Ankunft/haus-draig.png",
      "imageFormat": "square"
    }
  ],
  "hierarchy": [
    {
      "type": "Sammlung",
      "name": "Familien Häuser und Clans",
      "slug": "familien-hauser-und-clans"
    },
    {
      "type": "Kontinent",
      "name": "Estryll",
      "slug": "estryll"
    },
    {
      "type": "Königreich",
      "name": "Cenyr",
      "slug": "cenyr"
    },
    {
      "type": "Grafschaft",
      "name": "Celtigerns Wacht",
      "slug": "celtigerns-wacht"
    },
    {
      "type": "Region",
      "name": "Llamreis Ankunft",
      "slug": "llamreis-ankunft"
    },
    {
      "type": "Sitz",
      "name": "Gwynthor",
      "slug": "gwynthor"
    },
    {
      "type": "Haus",
      "name": "Haus Coeddu",
      "slug": "haus-coeddu"
    }
  ],
  "profile": {
    "highestTitle": "Bürgerlich",
    "rank": "Bürgerlich",
    "houseType": "Bürgerliches Haus",
    "motto": "",
    "quoteAuthor": "",
    "seat": "Gwynthor",
    "affiliation": "Haus Draig",
    "liege": "Haus Draig",
    "patron": "",
    "knightingPatron": "",
    "troopStrength": "",
    "tiarna": "",
    "kerns": "",
    "fleet": "",
    "founding": "",
    "milestoneOne": "",
    "milestoneTwo": "",
    "people": "",
    "wealth": "",
    "religion": "",
    "patronDeities": "",
    "origin": "Gwynthor · Waffendienst und Waffenschmiede",
    "cadetBranches": "",
    "allies": "",
    "enemies": ""
  },
  "sections": {
    "overview": OVERVIEW,
    "history": HISTORY,
    "traditions": "Seit Generationen gehören der Dienst für Haus Draig und das Waffenhandwerk zum Familienleben. Die Waffenschmiede in Gwynthor wird innerhalb des Hauses weitergeführt.",
    "knighthood": "Die Coeddu stellen vor allem Wachen und Waffenknechte für Haus Draig. Einzelne Angehörige steigen zu Rittern auf. Der Ritterstand ist eine persönliche Stellung innerhalb einer weiterhin bürgerlichen Familie.",
    "succession": "Folgt …",
    "holdings": "Die Familie besitzt eine Waffenschmiede in Gwynthor, die in der Stadt sehr beliebt ist. Die Werkstatt bildet neben dem Waffendienst einen festen wirtschaftlichen Mittelpunkt des Hauses.",
    "cultureReligion": "Folgt …",
    "conflictsAlliances": "Haus Draig ist seit Generationen der Lehnsherr und Dienstherr der Coeddu. Llywelyns Ehe mit Catrin Craigddu verbindet beide Bürgerhäuser auch verwandtschaftlich. Catrins Bruder Hywel ist Llywelyns bester Freund.",
    "values": CHARACTER,
    "court": "Folgt …",
    "familyTree": "Auf das unbekannte Gründerpaar folgen das Hauswappen und ein Zeitsprung zu Brenric und Gweneth. Die jüngere Familie umfasst ihre vier Kinder Rhydian, Llywelyn, Maelwen und Thalor sowie Llywelyns Frau Catrin und den gemeinsamen Sohn Ellian.",
    "historicalFigures": "Brenric Coeddu diente im Großen Krieg unter Sir Maredudd. Sein Sohn Llywelyn steht heute als Waffenknecht im Dienst von Haus Draig."
  },
  "images": {
    "crest": "../Stammbäume/assets/images/houses/Llamreis Ankunft/Bürgerliche/Gwynthor/Coeddu.png",
    "scene": "Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Haus_Coeddu/assets/coeddu-krieger.png",
    "sceneAlt": "Krieger des Hauses Coeddu mit Speer und rot-elfenbeinfarbenem Waffenrock",
    "banner": "Estryll/Cenyr/Celtigerns_Wacht/Haus_Draig/assets/gwynthor.png"
  },
  "cadets": [],
  "founder": null,
  "heads": [],
  "heirs": [],
  "offices": [],
  "figuresTitle": "Persönlichkeiten des Hauses",
  "figures": [
    {
      "id": "llywelyn-coeddu",
      "name": "Llywelyn Coeddu",
      "image": "../Stammbäume/assets/images/portraits/haus-coeddu/llywelyn-coeddu.png",
      "role": "Waffenknecht in Gwynthor",
      "description": "Pflichtbewusst und gemütlich; Catrins Ehemann, Ellians Vater und Hywels bester Freund.",
      "familyId": "haus-coeddu"
    }
  ],
  "trivia": [
    "Die Waffenschmiede der Coeddu ist in Gwynthor sehr beliebt.",
    "Das Wappen zeigt eine gepanzerte Hand mit Speer und Zinnen in Rostrot, Knochenweiß und Kohlegrau."
  ],
  "currentHead": "",
  "firstHeir": "",
  "headsNote": "Überlieferte Oberhäupter. Zeitangaben werden nur übernommen, soweit sie belegt sind."
};
