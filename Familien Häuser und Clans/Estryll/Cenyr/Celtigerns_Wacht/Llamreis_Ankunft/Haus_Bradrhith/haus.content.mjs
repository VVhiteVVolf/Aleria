// Die bestehende Hausbio bleibt gemeinsame Quelle der Hausgeschichte.
import { BRADRHITH_HOUSE_IMAGE, BRADRHITH_HOUSE_TEXT } from '../../../../../../Stammbäume/assets/js/data/house-bradrhith-biography.js';
import { HOUSE_BRADRHITH_PORTRAITS } from '../../../../../../Stammbäume/assets/js/data/house-bradrhith-portraits.js';

export const HOUSE_CONTENT = {
  "id": "haus-bradrhith",
  "name": "Haus Bradrhith",
  "type": "Bürgerliches Haus",
  "page": "kleinehaeuser.html",
  "county": "Celtigerns Wacht",
  "liege": "Haus Awenydd",
  "territoryId": "celtigerns-wacht",
  "territoryName": "Celtigerns Wacht",
  "territoryHref": "../Kontinente/Estryll/Königreich Cenyr/Grafschaft Celtigerns Wacht/Grafschaft Celtigerns Wacht.html",
  "parentHouseId": "",
  "extinct": false,
  "showMotto": false,
  "prepared": true,
  "registerPage": true,
  "biographyIntroTitle": "Über das Haus",
  "biographyHistoryTitle": "Geschichte",
  "biographySummary": {
    "overview": BRADRHITH_HOUSE_TEXT.overview,
    "history": BRADRHITH_HOUSE_TEXT.origin,
    "character": BRADRHITH_HOUSE_TEXT.succession
  },
  "placeholders": {
    "male": "../Stammbäume/assets/images/placeholders/male.png",
    "female": "../Stammbäume/assets/images/placeholders/female.png"
  },
  "allies": [
    {
      "name": "Haus Awenydd",
      "detail": "Aufsicht über den Hof",
      "image": "../Stammbäume/assets/images/houses/Llamreis Ankunft/haus-awenydd.png",
      "imageFormat": "square"
    },
    {
      "name": "Haus Draig",
      "detail": "Ceredigs Dienstherr · Hof und Startkapital · Hilfe beim Wiederaufbau",
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
      "name": "Haus Bradrhith",
      "slug": "haus-bradrhith"
    }
  ],
  "profile": {
    "highestTitle": "Bürgerlich",
    "rank": "Bürgerlich",
    "houseType": "Bürgerliches Haus",
    "motto": "",
    "quoteAuthor": "",
    "seat": "Bradrhith Hof",
    "affiliation": "Haus Draig · Aufsicht durch Haus Awenydd",
    "liege": "Haus Awenydd",
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
    "origin": "Ceredigs Dienst als Stall- und Zuchtmeister der Draig",
    "cadetBranches": "",
    "allies": "Haus Draig, Haus Awenydd",
    "enemies": "Schwarze Zitteraale"
  },
  "sections": {
    "overview": BRADRHITH_HOUSE_TEXT.overview,
    "history": [BRADRHITH_HOUSE_TEXT.origin, BRADRHITH_HOUSE_TEXT.family, BRADRHITH_HOUSE_TEXT.attack],
    "traditions": "Pferdezucht und Pferdehandel prägten die Familie. Auf dem Hof wurden Tiere für die Feldarbeit, den Alltag und den Krieg aufgezogen; die Versorgung Gwynthors mit guten Rössern und Pferden war der Zweck von Ceredigs Zuchtbetrieb.",
    "knighthood": "Die Bradrhith sind eine Bürgerfamilie. Ceredigs Dienst für Haus Draig galt den Stallungen und der Pferdezucht; seine Erfahrung als Stall- und Zuchtmeister bildete die Grundlage des eigenen Gestüts.",
    "succession": BRADRHITH_HOUSE_TEXT.succession,
    "holdings": "Der Bradrhith Hof liegt im Norden des Gwynthorer Bannkreises, nahe der Grenze zu Mwyncreig. Ceredig erhielt den Hof samt Startkapital von Haus Draig und baute dort seine Rosszucht auf. Beim Überfall der Schwarzen Zitteraale wurde der Hof beinahe niedergebrannt. Die Draig haben Hilfe beim Wiederaufbau zugesagt; wer den Betrieb künftig führt, ist offen.",
    "cultureReligion": "Arianwen Bradrhith büßt nach der Anhörung im Orden der Geläuterten unter persönlicher Aufsicht des Patriarchen Gwalchgwyn Saethwyr.",
    "conflictsAlliances": "Haus Draig ermöglichte Ceredig den Aufbau der Rosszucht und sagte nach dem Überfall Hilfe beim Wiederaufbau zu. Haus Awenydd führt die Aufsicht über den Hof. Innerhalb der Familie entzündete sich der Erbstreit an Ceredigs Nachlass und dem nicht auffindbaren Testament. Gruffudd Gwregysdu veranlasste den Überfall der Schwarzen Zitteraale auf Mairwen, Llyr und deren Kinder. Die künftige Nachfolge bleibt ungeklärt.",
    "values": "Der Lebensunterhalt der Bradrhith beruhte auf der Aufzucht und dem Handel mit guten Pferden. Ceredigs Erfahrung aus dem Dienst bei den Draig und die Arbeit Mairwens und Llyrs trugen den Betrieb bis zu seiner Verwüstung.",
    "court": "Ceredig war bis zu seinem Tod 1739 Hofherr. Während seiner Krankheit führten Mairwen und Llyr den Betrieb maßgeblich mit. Mairwen starb beim Überfall; Llyr erholt sich zunächst als Gast der Draig. Eine neue Hofleitung steht noch nicht fest.",
    "familyTree": "Der Stammbaum führt vom unbekannten Gründerpaar der Familie über Hauswappen und Zeitsprung zu Ceredig. Verzeichnet sind seine drei verstorbenen Söhne und die Töchter Arianwen und Mairwen mit ihren Gemahlen und Kindern. Die historischen Familiengründer sind von Ceredigs späterem Aufbau der Rosszucht zu unterscheiden.",
    "historicalFigures": BRADRHITH_HOUSE_TEXT.youngest
  },
  "images": {
    "crest": "../Stammbäume/assets/images/houses/Llamreis Ankunft/Bürgerliche/Gwynthor/Bradrhith.png",
    "scene": BRADRHITH_HOUSE_IMAGE,
    "sceneAlt": "Angehöriger des Hauses Bradrhith in grünem Gewand mit Pferdewappen und Wanderstab",
    "banner": "Estryll/Cenyr/Celtigerns_Wacht/Haus_Draig/assets/gwynthor.png"
  },
  "cadets": [],
  "founder": null,
  "heads": [{
    "id": "ceredig-bradrhith",
    "name": "Ceredig Bradrhith †",
    "role": "Früherer Hofherr · Stall- und Zuchtmeister der Draig",
    "detail": "1672–1739 · Erhielt Hof und Startkapital für die Rosszucht.",
    "silhouette": "male",
    "familyId": "haus-bradrhith"
  }],
  "heirs": [],
  "offices": [],
  "figuresTitle": "Persönlichkeiten des Hauses",
  "figures": [
    {
      "id": "llyr-dewrdd", "name": "Llyr Dewrdd", "familyId": "haus-bradrhith",
      "image": `../Stammbäume/${HOUSE_BRADRHITH_PORTRAITS['llyr-dewrdd']}`,
      "role": "Pferdemeister · Mairwens Witwer",
      "description": "Führte den Hof mit Mairwen in Ceredigs letzten Jahren. Überlebte den Überfall; seine mögliche Nachfolge ist offen."
    },
    {
      "id": "arianwen-bradrhith", "name": "Arianwen Bradrhith", "familyId": "haus-bradrhith",
      "image": `../Stammbäume/${HOUSE_BRADRHITH_PORTRAITS['arianwen-bradrhith']}`,
      "role": "Ceredigs ältere Tochter",
      "description": "Überlebte mit ihrem Gemahl und ihren Kindern. Büßt im Orden der Geläuterten; ihre Kinder kommen für eine Weiterführung des Hofes infrage."
    },
    {
      "id": "mairwen-bradrhith", "name": "Mairwen Dewrdd, geb. Bradrhith †", "familyId": "haus-bradrhith",
      "image": "../Stammbäume/assets/images/placeholders/female.png",
      "role": "Ceredigs jüngere Tochter",
      "description": "Führte den Hof mit Llyr. Wurde beim Überfall zusammen mit ihren drei Kindern getötet."
    },
    {
      "id": "gruffudd-gwregysdu", "name": "Gruffudd Gwregysdu", "familyId": "haus-bradrhith",
      "image": `../Stammbäume/${HOUSE_BRADRHITH_PORTRAITS['gruffudd-gwregysdu']}`,
      "role": "Arianwens Gemahl · in Haft",
      "description": "Veranlasste das Komplott gegen Mairwen und Llyr. Sein Todesurteil ist für weitere Ermittlungen ausgesetzt."
    }
  ],
  "trivia": [
    "Ceredig erhielt von Haus Draig einen Hof und Startkapital als Dank für seine Dienste als Stall- und Zuchtmeister.",
    "Die Rosszucht sollte Gwynthor mit guten Rössern und Pferden versorgen.",
    "Die Entscheidung zwischen Llyr Dewrdd und einer Weiterführung durch Arianwens Kinder ist noch offen."
  ],
  "currentHead": "",
  "firstHeir": "",
  "headsNote": "Überlieferte Oberhäupter. Zeitangaben werden nur übernommen, soweit sie belegt sind.",
  "biographyManagedExternally": true
};
