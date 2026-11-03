// Redaktionelle Hausquelle; Original und Quellenentscheidungen liegen im selben Ordner.
import { HOUSE_EIRTH_PORTRAITS } from '../../../../../../Stammbäume/assets/js/data/house-eirth-portraits.js';
const card = ([id, name, role, detail = '', silhouette = 'male']) => ({ id, familyId: 'haus-eirth', name, role, detail, silhouette, image: HOUSE_EIRTH_PORTRAITS[id] ? `../Stammbäume/${HOUSE_EIRTH_PORTRAITS[id]}` : '' });

export const HOUSE_CONTENT = {
  "id": "haus-eirth",
  "name": "Haus Eirth O'Caer Glaslyn",
  "type": "Ritterfürstenhaus",
  "page": "haus.html",
  "county": "Klaueninsel",
  "liege": "Haus Arth O'Talgarth",
  "territoryId": "herrschaft-nebelklaue",
  "territoryName": "Nebelklaue",
  "territoryHref": "../Kontinente/Estryll/Königreich Cenyr/Grafschaft Klaueninsel/Herrschaft Nebelklaue/Herrschaft Nebelklaue.html",
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
    "overview": "Haus Eirth O’Caer Glaslyn ist ein junges Ritterfürstenhaus der Nebelklaue und ein Kadettenzweig der Arth. Sein Eisbärenwappen verweist auf Seefahrt, nördliche Gewässer und die Härte seines überlieferten Lebensraums. Der Stammsitz ist Caer Glaslyn; der unmittelbare Lehnsherr bleibt Haus Arth O’Talgarth.",
    "history": "Rhynnon Arth und Kyndra Crafanc begründeten das Haus. Die Überlieferung verbindet seinen Aufstieg 1680 mit dem Sieg über einen nordmännischen Machthaber in der Seeschlacht von Pegynol. Rhynnon festigte den neuen Sitz und die Inselherrschaft; nach seinem Tod 1720 übernahm Prysor. Die vorhandene Familienakte führt diese Gründerfamilie bereits zusammenhängend, ohne einen vorgelagerten Überlieferungssprung.",
    "character": "Loyalität, Entschlossenheit und der Schutz der eigenen Gemeinschaft stehen im Mittelpunkt. Außenstehenden erscheinen die Eirth oft kühl und unnahbar; innerhalb ihrer Gemeinschaft gilt ihre Bindung als stark. Der Leitspruch „Stark wie der Eisbär, treu wie der Frost“ fasst diesen Anspruch zusammen.",
    "customs": "Seefahrt, Navigation und Entdeckungsfahrten werden früh erlernt. Wal- und Seeungeheuerjagden dienen als Beweis von Mut und Geschick. Besondere Bedeutung besitzt die Fahrt in ferne nördliche Gewässer, um ein Eisbärenjunges aufzuziehen. Da Eisbären in der eigenen Heimat nicht vorkommen, verlangt dieser junge Hausbrauch eine Reise über die heimischen Inseln hinaus.",
    "holdings": "Burg und Siedlung von Caer Glaslyn bilden das Zentrum einer kargen Inselherrschaft. Fischfang trägt die Versorgung; Vieh und Wurzelgemüse ergänzen sie. Walöl, Fett, Pelze und Fisch werden ausgeführt, um andere notwendige Güter zu erwerben. Die Familie bleibt trotz ihrer strategischen Lage wenig wohlhabend.",
    "culture": "Die Eirth gehören zu den Cenyri und Inselcenyri und werden auch „Bärenmänner“ genannt. Sie verehren Tethyra, Nimue und Baldran mit ausgeprägter Frömmigkeit. Hellbläuliche Harnische und dicke Pelzmäntel kennzeichnen ihre überlieferte ritterliche Selbstdarstellung.",
    "relations": "Prysor führt das Haus seit 1720; Urien ist erster, Rhun zweiter Erbe. Die Familie bleibt den Arth verbunden und pflegt Beziehungen zu anderen örtlichen Häusern, insbesondere solchen mit ähnlichen religiösen Vorstellungen. Die Hausquelle nennt keine offene Fehde. Nordmännische Überfälle, Marodeure und Piraten erscheinen vor allem als äußere Bedrohungen."
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
      "name": "Nebelklaue",
      "slug": "nebelklaue"
    },
    {
      "type": "Sitz",
      "name": "Caer Glaslyn",
      "slug": "caer-glaslyn"
    },
    {
      "type": "Haus",
      "name": "Haus Eirth O'Caer Glaslyn",
      "slug": "haus-eirth"
    }
  ],
  "profile": {
    "highestTitle": "Ritterfürst",
    "rank": "Ritterfürst",
    "houseType": "Ritterfürstenhaus",
    "motto": "Stark wie der Eisbär, treu wie der Frost",
    "quoteAuthor": "",
    "seat": "Caer Glaslyn",
    "affiliation": "Nebelklaue · Klaueninsel",
    "liege": "Haus Arth O'Talgarth",
    "troopStrength": "",
    "tiarna": "",
    "kerns": "",
    "fleet": "",
    "founding": "1680",
    "milestoneOne": "",
    "milestoneTwo": "",
    "patron": "",
    "knightingPatron": "",
    "people": "Cenyri, Inselcenyri",
    "wealth": "Niedrig",
    "religion": "Alerische Kirche",
    "patronDeities": "Tethyra, die Seemaid; Nimue, die Dame der See; Baldran, der Streiter",
    "origin": "Kadettenhaus der Arth; Rhynnon Arth und Kyndra Crafanc",
    "cadetBranches": "",
    "allies": "",
    "enemies": ""
  },
  "omitMilitaryProfile": true,
  "sections": {
    "overview": "Die Eirth sind ein Ritterfürsten- und Kadettenhaus der Arth in der Nebelklaue. Sie sitzen in Caer Glaslyn und führen den Eisbären im Wappen. Die Familie verbindet ihren Ruf mit nördlicher Seefahrt, Entschlossenheit und einer starken Bindung an die eigene Gemeinschaft.",
    "history": [
      "Rhynnon Arth begründete mit Kyndra Crafanc das Haus Eirth. Der Hausüberlieferung zufolge gewann er 1680 die Seeschlacht von Pegynol gegen einen nordmännischen Machthaber. Dieser Erfolg führte zum ersten befestigten Sitz und zum Aufstieg des jungen Hauses.",
      "Rhynnon sicherte seine Inselherrschaft und verband das Haus durch seine Ehe mit Crafanc. Nach seinem Tod 1720 folgte Prysor. Die Familie ist als Arth-Kadettenzweig zugleich politisch deren Vasallenhaus."
    ],
    "traditions": [
      "Seefahrt und Navigation nehmen früh einen festen Platz in der Erziehung ein. Kapitänsdienst und Fahrten in unbekannte nördliche Gewässer gelten als Prüfungen des eigenen Könnens. Der Fang von Walen und die Jagd auf Seeungeheuer werden als herausragende Leistungen gefeiert.",
      "Die Eisbärenhaltung hat besonderen Rang im Hausbrauch. Ein künftiger Ritterfürst soll weit nach Norden reisen, ein Jungtier finden und es selbst aufziehen. Die Eisbären stammen nicht aus den heimischen Inseln. Die Überlieferung beschreibt diesen Brauch als jung und noch in Entwicklung."
    ],
    "knighthood": [
      "Die Eirth folgen dem cenyrischen Rittertum avallornischer Herkunft mit Salbung an einem Gewässer, Eiden auf die Neun Göttlichen und dem zusätzlichen Eid auf die Dame der See. Hellbläuliche Plattenharnische und dicke Pelzmäntel gehören zu ihrem beschriebenen Erscheinungsbild.",
      "Schwert- und Lanzendienst sind in der Hausüberlieferung besonders hervorgehoben. Die leichteren Hauskrieger verwenden Wappenröcke, Kettenzeug, Lederbrigantinen und Pelz. Die Originalabbildung mit Eisbär bleibt eine Hausdarstellung und weist keinem namentlich benannten Angehörigen ein neues Tier zu."
    ],
    "holdings": [
      "Caer Glaslyn mit Burg und Siedlung bildet den Stammsitz. Die Hausquelle beschreibt eine karge Inselherrschaft mit einem Fischerdorf und begrenzten Möglichkeiten zu Viehhaltung und Gemüseanbau.",
      "Fischfang ist die wichtigste Lebensgrundlage. Der Ausfuhr von Walöl, Fett, Pelzen und Fisch steht der notwendige Erwerb anderer Güter gegenüber. Die Lage ist für die Sicherung der Gewässer wichtig, begründet aber keinen großen Reichtum."
    ],
    "cultureReligion": [
      "Die Eirth zählen zu den Cenyri und Inselcenyri und tragen den Beinamen „Bärenmänner“. Ihre raue Umgebung und die Überlieferung äußerer Gefahren erklären den Ruf einer kühlen, widerstandsfähigen Gemeinschaft. Untereinander werden Loyalität und Zusammenhalt betont.",
      "Tethyra, die Seemaid, Nimue, die Dame der See, und Baldran, der Streiter, nehmen einen festen Platz im religiösen Leben ein. Das Haus wird ausdrücklich als fromm beschrieben; die Gottheiten verbinden für seine Angehörigen Meer, Schutz und Kampfesmut."
    ],
    "conflictsAlliances": "Die Eirth bleiben den Arth als Herkunfts- und Lehnshaus verbunden. Die Quelle nennt gute Beziehungen zu Crafanc, Cwingod, Unigol und Pawen, beschreibt aber noch keine umfassend gefestigte Bündnisordnung. Frömmigkeit und geteilte Werte spielen bei Ehen und Verbindungen eine Rolle. Eine offene Hausfehde wird nicht genannt.",
    "values": "Entschlossenheit, Frömmigkeit und Loyalität zur eigenen Gemeinschaft sind die hervorgehobenen Werte. Die Eirth wollen ihre Heimat schützen und auch unter schwierigen Bedingungen Bestand haben. Das Eisbärenmotiv verbindet Stärke und Standhaftigkeit mit dem Anspruch des künftigen Hausoberhaupts.",
    "succession": "Urien ist der erste Erbe Prysors, Rhun der zweite. Prysor steht seit 1720 an der Spitze.",
    "court": "Rhynnon und Prysor bilden die überlieferte Oberhauptfolge. Die zwanzig bezeichneten Hofämter sind ohne namentlich ausgearbeitete Inhaber erhalten.",
    "historicalFigures": "Rhynnon Arth ist als Gründer und erster Ritterfürst überliefert. Seine Ehe mit Kyndra Crafanc und die bestehende Familie bleiben im eingebetteten Stammbaum geführt.",
    "familyTree": "Der bereits ausgearbeitete Stammbaum von Haus Eirth O'Caer Glaslyn ist eingebettet. Das Hauswappen im Stammbaum öffnet die Hausbiografie."
  },
  "images": {
    "crest": "../Stammbäume/assets/images/houses/Klaueninsel/haus-eirth.png",
    "scene": "Estryll/Cenyr/Klaueninsel/Nebelklaue/Haus_Eirth/assets/hausdarstellung-original.png",
    "sceneAlt": "Originale Eirth-Hausdarstellung mit hellblauem Harnisch, weißem Pelz und Eisbär",
    "banner": "Estryll/Cenyr/Klaueninsel/Nebelklaue/Haus_Eirth/assets/herrschaftsbanner-original.png"
  },
  "illustrationCategory": "Hausdarstellung",
  "cadets": [],
  "figuresTitle": "Historische Persönlichkeiten des Hauses",
  "figures": [],
  "trivia": [
    "Die Eisbären des Hausbrauchs müssen aus weiter nördlich gelegenen Gebieten stammen.",
    "Der Eisbär ist Wappentier und Sinnbild des Hauses."
  ],
  "currentHead": "Prysor Eirth",
  "firstHeir": "Urien Eirth",
  founder: card(["rhynnon-arth","Rhynnon Arth","Gründer und erster Ritterfürst","1680–1720"]),
  heads: [["rhynnon-arth","Rhynnon Arth","Ritterfürst","1680–1720"],["prysor-eirth","Prysor Eirth","Ritterfürst","Seit 1720"]].map(card),
  heirs: [["urien-eirth","Urien Eirth","Erster Erbe",""],["rhun-eirth","Rhun Eirth","Zweiter Erbe",""]].map(card),
  offices: [["Vogt","male"],["Schatzmeister","female"],["Kommandant der Garde","male"],["Zeremonienmeister","female"],["Mundschenk","male"],["Waffenmeister","male"],["Stallmeister","female"],["Kerkermeister","male"],["Jagdmeister","female"],["Hafenmeister","male"],["Küchenmeister","male"],["Brotmeister","female"],["Handwerksmeister","male"],["Gartenmeister","female"],["Hofkaplan","male"],["Hofmeister","male"],["Hofdame","female"],["Archivar","male"],["Hoffalkner","female"],["Zwingermeister","male"]].map(([role, silhouette]) => ({ name: '', role, silhouette }))
};
