// Redaktionelle Hausquelle; Original und Quellenentscheidungen liegen im selben Ordner.
import { HOUSE_MORTHWYLL_PORTRAITS } from '../../../../../../Stammbäume/assets/js/data/house-morthwyll-portraits.js';
const card = ([id, name, role, detail = '', silhouette = 'male']) => ({ id, familyId: 'haus-morthwyll', name, role, detail, silhouette, image: HOUSE_MORTHWYLL_PORTRAITS[id] ? `../Stammbäume/${HOUSE_MORTHWYLL_PORTRAITS[id]}` : '' });

export const HOUSE_CONTENT = {
  "id": "haus-morthwyll",
  "name": "Haus Morthwyl O'Caer Morben",
  "type": "Ritterfürstenhaus",
  "page": "haus.html",
  "county": "Klaueninsel",
  "liege": "Haus Arth O'Talgarth",
  "territoryId": "herrschaft-wellenklaue",
  "territoryName": "Wellenklaue",
  "territoryHref": "../Kontinente/Estryll/Königreich Cenyr/Grafschaft Klaueninsel/Herrschaft Wellenklaue/Herrschaft Wellenklaue.html",
  "parentHouseId": "haus-arth",
  "extinct": false,
  "showMotto": true,
  "registerPage": true,
  "prepared": false,
  "contentVersion": "20261103-klaueninsel-v1",
  "biographySourceRevision": 5,
  "biographyPreviousDefaultFingerprints": [],
  "biographyIntroTitle": "Über das Haus",
  "biographyHistoryTitle": "Geschichte des Hauses",
  "biographySummary": {
    "overview": "Haus Morthwyl O’Caer Morben ist ein eigenständiges Ritterfürsten- und Vasallenhaus der Arth in der Wellenklaue. Schiffbau, Seefahrt und Entdeckungsfahrten bilden den Kern seines Ansehens. Der Stammsitz liegt auf einer kleinen Insel; die Qualle im Wappen verweist auf Offenheit und die Fähigkeit, sich wechselnden Strömungen anzupassen.",
    "history": "Die Überlieferung führt den Aufstieg auf Schiffbauer zurück, die im Dienst der Arth gute Schiffe fertigten und maritime Anlagen betreuten. Ihre Leistungen wurden mit Caer Morben und der Verantwortung für das umliegende Gebiet belohnt. Collen und Tymora bilden die Gründerfamilie der bestehenden Akte. Trotz späterer Ehen mit Arth ist Morthwyl kein Kadettenzweig dieses Hauses. Ein genaues Gründungsjahr ist nicht gesichert.",
    "character": "Anpassungsfähigkeit, Pragmatismus und Loyalität bestimmen das Selbstbild. Das Haus legt Wert auf Freiheit und Bescheidenheit und lässt eher die Qualität seiner Arbeit als großen Prunk für sich sprechen. Der Leitspruch lautet „Vom Meer geformt, von den Wellen geführt“.",
    "customs": "Schiffbau wird als über Generationen weitergegebenes Handwerk und als Kunst verstanden. Fahrten in unbekannte Gewässer gelten als Möglichkeit, neues Wissen für die Heimat zu gewinnen. Auch der Beitritt zu den Möwensängern gehört zu den beschriebenen Traditionen. Die Qualle steht für aufrichtige Absichten und Beweglichkeit gegenüber Veränderungen.",
    "holdings": "Caer Morben, einige Fischerdörfer und die Inselwirtschaft tragen das Haus. Fischfang versorgt zunächst die Bevölkerung; Holz wird vor allem für Schiffe verwendet. Überschüsse und gebaute Schiffe werden verkauft. Trotz wertvoller maritimer Kenntnisse bleiben die Mittel begrenzt. Verbindungen nach Aldrimar bringen zusätzliche Güter ins Haus.",
    "culture": "Die Morthwyl sind Cenyri und Inselcenyri mit engen kulturellen Verbindungen nach Aldrimar. Ihre häufig blonde Erscheinung wird in der Hausüberlieferung mit diesen Ehen verbunden. Sie verehren die Seemaid und Nimue, die Dame der See, in einer eher praktischen als besonders inbrünstigen Form.",
    "relations": "Glendower führt das Haus seit 1725. Grugyn, Arawn und Collen sind als Erben verzeichnet. Lowris Verlobung mit einem namentlich unbekannten Angehörigen des Clans Grendel wurde durch den Überfall auf Hjerim überschattet. Die Überlieferung beschreibt die Unterstützung für Überlebende und die Verbindung zu Wargh; ein erfolgreicher Abschluss der angekündigten Rückgewinnung ist nicht festgelegt."
  },
  "placeholders": {
    "male": "../Stammbäume/assets/images/placeholders/male.png",
    "female": "../Stammbäume/assets/images/placeholders/female.png"
  },
  "allies": [],
  "hierarchy": [
    {
      "type": "Sammlung",
      "name": "Familien Häuser und Clans",
      "slug": "familien-hauser-und-clans"
    },
    {
      "type": "Königreich",
      "name": "Cenyr",
      "slug": "cenyr"
    },
    {
      "type": "Grafschaft",
      "name": "Klaueninsel",
      "slug": "klaueninsel"
    },
    {
      "type": "Herrschaft",
      "name": "Wellenklaue",
      "slug": "wellenklaue"
    },
    {
      "type": "Sitz",
      "name": "Caer Morben",
      "slug": "caer-morben"
    },
    {
      "type": "Haus",
      "name": "Haus Morthwyl O'Caer Morben",
      "slug": "haus-morthwyll"
    }
  ],
  "profile": {
    "highestTitle": "Ritterfürst",
    "rank": "Ritterfürst",
    "houseType": "Ritterfürstenhaus",
    "motto": "Vom Meer geformt, von den Wellen geführt.",
    "quoteAuthor": "",
    "seat": "Caer Morben",
    "affiliation": "Wellenklaue · Klaueninsel",
    "liege": "Haus Arth O'Talgarth",
    "troopStrength": "",
    "tiarna": "",
    "kerns": "",
    "fleet": "",
    "founding": "",
    "milestoneOne": "",
    "milestoneTwo": "",
    "patron": "",
    "knightingPatron": "",
    "people": "Cenyri, Inselcenyri",
    "wealth": "Niedrig",
    "religion": "Alerische Kirche",
    "patronDeities": "Tethyra, die Seemaid; Nimue, die Dame der See",
    "origin": "Eigenständiges Schiffbauer- und Vasallenhaus der Arth",
    "cadetBranches": "",
    "allies": "",
    "enemies": ""
  },
  "omitMilitaryProfile": true,
  "sections": {
    "overview": [
      "Die Morthwyl von Caer Morben sind ein Ritterfürstenhaus der Wellenklaue und unmittelbare Vasallen der Arth. Ihre Bedeutung beruht auf Schiffbau, Seefahrt und der Kenntnis der Inselgewässer.",
      "Die häufig blonde Erscheinung des Hauses wird in der Überlieferung auf Verbindungen nach Aldrimar zurückgeführt. Sie bleibt eine Beschreibung des Hausbildes und ersetzt nicht die individuellen Merkmale einzelner Angehöriger."
    ],
    "history": [
      "Die Vorfahren der Morthwyl standen als Schiffbauer im Dienst der Arth. Sie bauten gute Schiffe und übernahmen Verantwortung für Werften und maritime Anlagen der Grafschaft. Ein späterer Graf belohnte diese Dienste mit Caer Morben und dem Auftrag, Burg und Umland zu schützen und das maritime Handwerk fortzuführen.",
      "Die vorhandene Familienakte nennt Collen und Tymora als Gründerfamilie. Ihre Nachkommen sind ein eigenständiges Vasallenhaus. Die spätere Ehe einer Arth mit Sayres Morthwyll begründet keinen früheren Kadettenursprung.",
      "Der kleine Inselstandort förderte die Ausrichtung auf Schiffe und Seefahrt. Ein genaues Gründungsjahr ist nicht überliefert; die gesicherte jüngere Oberhauptfolge führt über Merlion, Sayres und Cadwallen zu Glendower."
    ],
    "traditions": [
      "Schiffbau wird als Handwerk und Kunst von Generation zu Generation weitergegeben. Die Familienüberlieferung verbindet Erfahrung mit Offenheit für Verbesserungen. Entdeckungsfahrten sollen nicht nur persönlichen Ruhm, sondern nutzbare Kenntnisse für die Heimat bringen.",
      "Die Qualle gilt dem Haus als Zeichen aufrichtiger Absichten und der Fähigkeit, sich wechselnden Bedingungen anzupassen. Als besondere Tradition wird der Beitritt zu den Möwensängern genannt; eine individuelle Mitgliedschaft wird daraus nicht für jeden Angehörigen abgeleitet."
    ],
    "knighthood": [
      "Die Ritter des Hauses stehen in der cenyrischen Tradition avallornischer Herkunft. Die Hausquelle beschreibt häufig leichtere Ausrüstung aus Leder, Pelz und Fell sowie Seekämpfer, die sich auf schwankenden Schiffsdecks zurechtfinden. Geschmückte Helme mit Federn oder Hörnern gehören zu ihrem überlieferten Erscheinungsbild.",
      "Die Knechte unterstützen den Ritterdienst; örtliche Wachen erfüllen andere Aufgaben und werden als schlichter ausgerüstet beschrieben. Die gelieferte Darstellung mit Quallenmotiv und meergrünen Stoffen bleibt als eigenständige Hausabbildung erhalten."
    ],
    "holdings": [
      "Caer Morben und einige Fischerdörfer bilden die Besitzgrundlage. Fischfang dient zunächst der Ernährung, Holz vor allem dem Schiffbau. Überschüssige Erzeugnisse werden verkauft.",
      "Der Bau und Export von Schiffen besitzt besondere Bedeutung. Trotz dieses Könnens bleibt das Haus vergleichsweise wenig wohlhabend. Verbindungen nach Aldrimar bringen ergänzende Güter, verändern aber nicht seine hauptsächliche Ausrichtung auf die Inselwirtschaft."
    ],
    "cultureReligion": [
      "Die Morthwyl gehören zur Alerischen Kirche und verehren Tethyra, die Seemaid, sowie Nimue, die Dame der See. Der Glaube ist eng mit dem Alltag auf dem Meer verbunden, wird jedoch nicht als besonders inbrünstig beschrieben.",
      "Ehen und kulturelle Nähe verbinden das Cenyri-Haus mit Aldrimar. Die Überlieferung hebt seine Offenheit gegenüber dortigen Bräuchen hervor. Daraus wird keine automatische andere Volkszugehörigkeit jedes Familienmitglieds abgeleitet."
    ],
    "conflictsAlliances": [
      "Die Hausgeschichte nennt gute Verbindungen nach Aldrimar sowie zu Wargh, Unigol, Sélwyn, Kampfgeborene und Skogg. Die bestehenden Einzelverbindungen bleiben in den Familienakten geführt.",
      "Lowri ist mit einem namentlich nicht bekannten Angehörigen des Clans Grendel verlobt. Der Überfall auf Hjerim, bei dem viele Angehörige versklavt oder getötet wurden, verschob die geplante Hochzeit. Die Morthwyl unterstützten die Überlebenden und verbanden sich mit Wargh für die angekündigte Rückgewinnung. Ein späterer Ausgang dieses Vorhabens ist hier nicht überliefert."
    ],
    "values": "Pragmatismus, Freiheit und Verlässlichkeit stehen nebeneinander. Das Haus will sich wechselnden Bedingungen anpassen, seine Verbündeten nicht im Stich lassen und mit begrenzten Mitteln bestehen. Bescheidenheit und die Qualität des Handwerks gehören zu seinem Selbstverständnis.",
    "succession": "Die Erbfolge nennt Grugyn, Arawn und Collen. Glendower steht seit 1725 an der Spitze des Hauses.",
    "court": "Die Oberhauptfolge führt von Collen über Merlion, Sayres und Cadwallen zu Glendower. Die zwanzig bezeichneten Hofämter sind nicht namentlich besetzt überliefert.",
    "historicalFigures": "Collen ist als Stammvater und erster Ritterfürst überliefert. Eine zusätzliche ausgearbeitete historische Figurengalerie ist nicht vorhanden.",
    "familyTree": "Der bereits ausgearbeitete Stammbaum von Haus Morthwyl O'Caer Morben ist eingebettet. Das Hauswappen im Stammbaum öffnet die Hausbiografie."
  },
  "images": {
    "crest": "../Stammbäume/assets/images/houses/Klaueninsel/haus-morthwyll.png",
    "scene": "Estryll/Cenyr/Klaueninsel/Wellenklaue/Haus_Morthwyl/assets/hausdarstellung-original.png",
    "sceneAlt": "Originale Morthwyl-Hausdarstellung mit Quallenmotiv, meergrünem Stoff, Pelzbesatz und Dreizack",
    "banner": "Estryll/Cenyr/Klaueninsel/Wellenklaue/Haus_Morthwyl/assets/herrschaftsbanner-original.png"
  },
  "illustrationCategory": "Hausdarstellung",
  "cadets": [],
  "figuresTitle": "Historische Persönlichkeiten des Hauses",
  "figures": [],
  "trivia": [
    "Die Qualle steht in der Hausüberlieferung für Aufrichtigkeit und Anpassungsfähigkeit.",
    "Der Beitritt zu den Möwensängern gehört zu den beschriebenen Haustraditionen."
  ],
  "currentHead": "Glendower Morthwyll",
  "firstHeir": "Grugyn Morthwyll",
  founder: card(["collen-founder-morthwyll","Collen Morthwyll","Stammvater und erster Ritterfürst","Amtszeit nicht datiert"]),
  heads: [["collen-founder-morthwyll","Collen Morthwyll","Ritterfürst","Amtszeit nicht datiert"],["merlion-morthwyll","Merlion Morthwyll","Ritterfürst","1644–1688"],["sayres-morthwyll","Sayres Morthwyll","Ritterfürst","1688–1706"],["cadwallen-morthwyll","Cadwallen Morthwyll","Ritterfürst","1706–1725"],["glendower-morthwyll","Glendower Morthwyll","Ritterfürst","Seit 1725"]].map(card),
  heirs: [["grugyn-morthwyll","Grugyn Morthwyll","Erster Erbe",""],["arawn-morthwyll","Arawn Morthwyll","Zweiter Erbe",""],["collen-1724-morthwyll","Collen Morthwyll","Dritter Erbe",""]].map(card),
  offices: [["Vogt","male"],["Schatzmeister","female"],["Kommandant der Garde","male"],["Zeremonienmeister","female"],["Mundschenk","male"],["Waffenmeister","male"],["Stallmeister","female"],["Kerkermeister","male"],["Jagdmeister","female"],["Hafenmeister","male"],["Küchenmeister","male"],["Brotmeister","female"],["Handwerksmeister","male"],["Gartenmeister","female"],["Hofkaplan","male"],["Hofmeister","male"],["Hofdame","female"],["Archivar","male"],["Hoffalkner","female"],["Zwingermeister","male"]].map(([role, silhouette]) => ({ name: '', role, silhouette }))
};
