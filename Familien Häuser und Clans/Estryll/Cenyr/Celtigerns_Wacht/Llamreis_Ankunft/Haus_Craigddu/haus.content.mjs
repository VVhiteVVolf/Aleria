// Redaktionelle Quelle für Hausseite und kurze Stammbaum-Bio.
// Familien- und Hausangaben nach Benutzervorgaben vom 27./28.09.2026.
const OVERVIEW = 'Haus Craigddu ist ein kriegerisches Bürgerhaus aus Gwynthor, das Haus Draig seit Generationen dient. Aus einer Baumeisterfamilie gingen zunehmend Wachen, Waffenknechte und vereinzelt auch Ritter hervor. Das Bauwesen blieb dennoch Teil des Familienlebens: Mehrere Angehörige arbeiten weiterhin in Gwynthors örtlicher Baumeistergilde.';
const HISTORY = 'Die Craigddu stammen aus dem Bauhandwerk. Über Generationen gewann der Waffendienst für Haus Draig innerhalb der Familie an Bedeutung, bis das Haus ebenso mit seinen Kriegern wie mit seinen Baumeistern verbunden wurde. Namen und Lebensdaten des ursprünglichen Gründerpaares sind unbekannt. Nach der Überlieferungslücke setzt der Stammbaum bei den Brüdern Brenwyn, Iestyn und Cyran ein. Iestyn und Mared sind die Eltern von Hywel und Catrin. Hywel dient als Waffenknecht; Catrins Ehe mit Llywelyn Coeddu verbindet die Craigddu mit dem Haus der Gwynthorer Waffenschmiede.';
const CHARACTER = 'Der Dienst für Haus Draig und die Arbeit im Bauwesen bestehen in dieser Familie nebeneinander fort. Brenwyn Craigddu und sein Sohn Rhydric sind in der örtlichen Baumeistergilde tätig; Cyran sowie die jüngeren Angehörigen Hywel, Maelor und Thalwyn vertreten die kriegerische Seite des Hauses. Einzelne Ritter stammen aus der Familie, doch die Craigddu bleiben ein Bürgerhaus.';
export const HOUSE_CONTENT = {
  "id": "craigddu",
  "name": "Haus Craigddu",
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
  "biographySourceRevision": 3,
  "biographyPreviousDefaultFingerprints": ["2205:74add61f:9445a595", "2219:4f81d6c8:9e4d9aa6"],
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
      "name": "Haus Craigddu",
      "slug": "craigddu"
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
    "origin": "Gwynthor · Baumeisterfamilie",
    "cadetBranches": "",
    "allies": "",
    "enemies": ""
  },
  "sections": {
    "overview": OVERVIEW,
    "history": HISTORY,
    "traditions": "Die Verbindung zur örtlichen Baumeistergilde besteht trotz des wachsenden Gewichts des Waffendienstes fort. In den verschiedenen Familienzweigen werden sowohl Baumeister als auch Wachen und Waffenknechte ausgebildet.",
    "knighthood": "Seit Generationen dienen Angehörige der Craigddu Haus Draig als Wachen und Waffenknechte. Einige haben den Ritterschlag erhalten. Diese persönlichen Ritterwürden ändern den bürgerlichen Rang des Hauses nicht.",
    "succession": "Folgt …",
    "holdings": "Der familiäre Mittelpunkt liegt in Gwynthor. Die Craigddu sind weiterhin im Bauwesen tätig; mehrere Mitglieder gehören der lokalen Baumeistergilde an, darunter Brenwyn und sein Sohn Rhydric.",
    "cultureReligion": "Folgt …",
    "conflictsAlliances": "Der generationslange Dienst bindet das Haus an die Draig. Über Catrins Ehe mit Llywelyn Coeddu besteht außerdem eine enge Familienverbindung zu den Coeddu. Hywel Craigddu und Llywelyn sind beste Freunde.",
    "values": CHARACTER,
    "court": "Folgt …",
    "familyTree": "Ein unbekanntes Gründerpaar steht vor Hauswappen und Zeitsprung. Die jüngere Familie beginnt mit Iestyn, Hywels Vater, und dessen Brüdern Brenwyn und Cyran. Brenwyns Söhne Rhydric und Maelor sowie Cyrans Sohn Thalwyn sind Hywels Vettern und haben eigene Kinder. Hywels Familie mit Eleri und ihren sieben Töchtern sowie Catrins Ehe mit Llywelyn Coeddu sind ebenfalls verzeichnet.",
    "historicalFigures": "Brenwyn und Rhydric Craigddu führen die Baumeistertradition in Gwynthors Gilde fort. Hywel Craigddu dient als Waffenknecht im Umfeld von Haus Draig."
  },
  "images": {
    "crest": "../Stammbäume/assets/images/houses/Llamreis Ankunft/Bürgerliche/Gwynthor/Craigddu.png",
    "scene": "Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Haus_Craigddu/assets/craigddu-krieger.png",
    "sceneAlt": "Krieger des Hauses Craigddu mit Speer und blauem Waffenrock mit Burgwappen",
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
      "id": "person-28b0e0a3",
      "name": "Hywel Craigddu",
      "image": "../Stammbäume/assets/images/portraits/haus-craigddu/hywel-craigddu.png",
      "role": "Waffenknecht in Gwynthor",
      "description": "Catrins älterer Bruder und Llywelyns bester Freund.",
      "familyId": "craigddu"
    }
  ],
  "trivia": [
    "Die Craigddu waren ursprünglich eine Baumeisterfamilie und sind noch heute in Gwynthors Baumeistergilde vertreten.",
    "Das Wappen zeigt eine Burg auf dunklem Gebirge in Schieferblau, Kohlegrau und Elfenbein."
  ],
  "currentHead": "",
  "firstHeir": "",
  "headsNote": "Überlieferte Oberhäupter. Zeitangaben werden nur übernommen, soweit sie belegt sind."
};
