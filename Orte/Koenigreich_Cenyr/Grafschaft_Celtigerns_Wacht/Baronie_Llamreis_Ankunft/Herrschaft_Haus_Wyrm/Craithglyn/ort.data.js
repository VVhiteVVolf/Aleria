(function () {
  "use strict";

  const createPlaceData = window.ALERIA_CELTIGERNS_PLACES?.createPlaceData;
  if (typeof createPlaceData !== "function") return;

  const base = createPlaceData("craithglyn", {
    "parentage": {
      "barony": "Llamreis Ankunft",
      "liege": "Haus Wyrm"
    },
    "features": {
      "districts": false,
      "noticeBoard": true
    },
    "presentation": {
      "map": "/Orte/Koenigreich_Cenyr/Grafschaft_Celtigerns_Wacht/Baronie_Llamreis_Ankunft/Herrschaft_Haus_Wyrm/Craithglyn/assets/ortskarte.jpg",
      "images": {
        "bild-einer-stadtwache-png": {
          "src": "/Orte/Koenigreich_Cenyr/Grafschaft_Celtigerns_Wacht/Baronie_Llamreis_Ankunft/Herrschaft_Haus_Wyrm/Craithglyn/assets/wache.png",
          "alt": "Wache von Craithglyn",
          "fit": "contain"
        },
        "karten-bild-png": {
          "src": "/Orte/Koenigreich_Cenyr/Grafschaft_Celtigerns_Wacht/Baronie_Llamreis_Ankunft/Herrschaft_Haus_Wyrm/Craithglyn/assets/ortskarte.jpg",
          "alt": "Ortskarte von Craithglyn",
          "href": "/Orte/Koenigreich_Cenyr/Grafschaft_Celtigerns_Wacht/Baronie_Llamreis_Ankunft/Herrschaft_Haus_Wyrm/Craithglyn/assets/ortskarte.jpg",
          "fit": "contain"
        },
        "icon-png": {
          "src": "/Orte/Koenigreich_Cenyr/Grafschaft_Celtigerns_Wacht/Baronie_Llamreis_Ankunft/Herrschaft_Haus_Wyrm/Craithglyn/assets/wappen.png",
          "alt": "Wappen von Craithglyn",
          "fit": "contain"
        }
      }
    },
    "sections": {
      "introduction": [
        "Craithglyn ist eine bedeutende Bergbausiedlung der Baronie von Llamreis Ankunft, die dem Einflussbereich der Ritterlichen Herrschaft des Hauses Wyrm aus Gwynthor untersteht."
      ],
      "background": [
        "Craithglyn ist von immenser Bedeutung für das Haus Wyrm, da es nicht nur hochwertiges Erz und exzellente Handwerkskunst liefert, sondern auch wertvolle Edelmetalle und bedeutende Bodenschätze wie Rubin, Silber und Gold. Diese Reichtümer machen den Ort zu einem unverzichtbaren Gut für die Herrscher von Gwynthor.",
        "Die Siedlung wird maßgeblich von drei mächtigen Bürgerfamilien geprägt, die abwechselnd den Bürgermeister stellen:",
        {
          "type": "list",
          "items": [
            "Die Tynged sind bekannt für ihre Expertise als Juweliere, Goldschmiede und geschickte Kaufleute.",
            "Die Lloed agieren primär als Ritter und Krieger des Ortes. Obwohl sie auch in den Minen arbeiten, sind sie die ärmste der drei Familien.",
            "Die Tarw dominieren das Handelsgeschäft, besitzen die meisten Höfe und sind ebenfalls stark in den Minen vertreten."
          ]
        },
        "Trotz des Einflusses dieser Familien liegt die ultimative Kontrolle und Oberherrschaft über Craithglyn beim Haus Wyrm. Die ständigen Rivalitäten und Zwistigkeiten zwischen den drei Familien sind für das Haus Wyrm ein Ärgernis. Aufgrund der strategischen Bedeutung der Siedlung ist der Schutz von Craithglyn von höchster Priorität für die Wyrm, weshalb sie eine Palisade um den Ort am Berg errichten ließen."
      ],
      "location": [
        "Craithglyn liegt an der Grenze der Baronie von Llamreis Ankunft, eingebettet in eine bergige Landschaft, die reich an Bodenschätzen ist. Die genaue geographische Position am Fuße oder Hang eines Berges wird durch die Existenz der Palisade, die den Ort schützt, unterstrichen."
      ],
      "administration": [
        "Obwohl Craithglyn von den drei Bürgerfamilien – den Tynged, Lloed und Tarw – durch einen abwechselnd gestellten Bürgermeister verwaltet wird, liegt die endgültige Autorität und Kontrolle beim Haus Wyrm. Die Wyrm greifen bei Bedarf in die lokalen Angelegenheiten ein, um ihre Interessen zu wahren und die reibungslose Förderung der wertvollen Ressourcen sicherzustellen. Die Palisade und die militärische Präsenz der Lloed, die auch dem Haus Wyrm dienen, unterstreichen die direkte Einflussnahme und den Schutz der Oberherren."
      ],
      "conflicts": [
        "Craithglyn sieht sich trotz seiner geschützten Lage und des Wohlstands mit mehreren wiederkehrenden Problemen konfrontiert. Zum einen stellen die umliegenden Berge eine ständige Bedrohung dar, da Trolle und Grimmlinge hin und wieder die Siedlung heimsuchen. Zwar können die lokalen Söldner und Ritter diese Gefahren meist erfolgreich abwehren, doch bleiben sie eine unberechenbare Variable.",
        "Ein weiteres Ärgernis ist die Klingende Münze, eine fremde Kaufmannsgesellschaft, die immer wieder versucht, sich auf Kosten der Einheimischen zu bereichern.",
        "Und schließlich gibt es den berüchtigten Raubritter, den Schwarzen Zitteraal. Angeblich hat er seine Fühler bis nach Craithglyn ausgestreckt und fordert gelegentlich Schutzgelder von den Bewohnern, was für Unmut und eine latente Unsicherheit sorgt."
      ],
      "houses": [
        {
          "type": "subheading",
          "text": "Familie Tynged"
        },
        "Die Familie Tynged ist das reiche und einflussreiche Rückgrat des Craithglyn-Handels. Sie sind die führenden Juweliere, Goldschmiede und feine Kaufleute, die die wertvollen Edelmetalle und Edelsteine der Minen verarbeiten und vertreiben. Ihr Reichtum und ihr Geschick im Handel verschaffen ihnen großen Einfluss, obwohl ihre subtilen Ambitionen und ihre gelegentliche Eigenständigkeit dem Haus Wyrm ein Dorn im Auge sind.",
        {
          "type": "subheading",
          "text": "Familie Lloed"
        },
        "Die Familie Lloed stellt die meisten Ritter und Krieger von Craithglyn und ist für den Schutz der Siedlung verantwortlich. Obwohl viele ihrer Mitglieder auch in den Minen arbeiten, sind sie die ärmste der drei Familien. Ihre Stärke liegt in ihrer unerschütterlichen Loyalität, ihrer Direktheit und ihrem Einsatz für die Sicherheit der Siedlung, was sie zu treuen Dienern des Hauses Wyrm macht.",
        {
          "type": "subheading",
          "text": "Familie Tarw"
        },
        "Die Familie Tarw bildet das breite Fundament der Craithglyn-Wirtschaft. Ihnen gehören die meisten Höfe und Handelsgeschäfte, und viele ihrer Mitglieder sind als erfahrene Arbeiter in den Minen tätig. Sie sind die Praktiker, die den täglichen Betrieb der Siedlung aufrechterhalten und die Grundversorgung sichern. Ihr Pragmatismus und ihr Fleiß machen sie unverzichtbar, doch ihre opportunistische Ader erfordert gelegentlich die Aufmerksamkeit des Hauses Wyrm."
      ],
      "population": [
        "Die Bevölkerung von Craithglyn setzt sich überwiegend aus jenen zusammen, deren Leben direkt oder indirekt mit den reichen Bodenschätzen der Region verknüpft ist. Die Siedlung ist ein Schmelztiegel von Bergleuten, die tief in den Stollen nach Erz und Edelsteinen graben, Schmieden und Handwerkern, die die gewonnenen Rohstoffe veredeln und weiterverarbeiten, sowie Landwirten und Viehhaltern, die für die nötige Versorgung und Selbstständigkeit des Ortes sorgen. Diese Zusammensetzung spiegelt die Kernfunktionen Craithglyns wider: ein Zentrum für Rohstoffgewinnung, Handwerk und die damit verbundene Grundversorgung."
      ],
      "culture": [
        "Die Kultur in Craithglyn ist tief im Bergbau, der Schmiedekunst und der Viehzucht verwurzelt. Das tägliche Leben ist von harter Arbeit geprägt, sei es in den dunklen Stollen der Minen oder auf den umliegenden Feldern. Doch trotz der körperlichen Anstrengung ist Craithglyn ein wohlhabender Ort, an dem es den meisten Bewohnern verhältnismäßig gut geht. Die Löhne sind fair, und wer nicht direkt in der Mine oder auf dem Feld schuften muss, genießt einen gewissen Komfort. Die Präsenz des Hauses Wyrm sorgt für eine spürbare Sicherheit und Ordnung, sodass die Bewohner nicht allzu viele Sorgen plagen – es sei denn, ein Troll wagt sich aus den Bergen herab. In solchen Fällen verlassen sich die Craithglyner auf ihre Ritter, die diese Bedrohungen meist schnell und effektiv abwenden. Diese Kombination aus harter Arbeit, Wohlstand und dem Schutz durch die Wyrm hat eine Gemeinschaft geformt, die trotz der Herausforderungen des Bergbaus ein stabiles und vergleichsweise sorgenfreies Leben führt."
      ],
      "military": [
        "Die Verteidigung von Craithglyn basiert auf einer kleinen, aber effektiven Streitmacht. Drei bis vier Ritter des Hauses Wyrm bilden die Elite. Sie werden von etwa 20 Waffenknechten unterstützt, die als schlagkräftige Einheit dienen. Zusätzlich sorgt eine 30-köpfige Stadtwache für Ordnung innerhalb der Palisaden. Diese Kombination gewährleistet den Schutz der Siedlung und ihrer wertvollen Ressourcen."
      ],
      "newspaper": [
        {
          "type": "subheading",
          "text": "Celtigerns Echo"
        },
        "Die Redaktion für Craithglyn ist vorbereitet. Besetzung und Beiträge folgen.",
        {
          "type": "subheading",
          "text": "Der Schwarzbote"
        },
        "Die Redaktion für Craithglyn ist vorbereitet. Besetzung und Beiträge folgen."
      ],
      "region": [
        "…"
      ]
    }
  });

  window.ORT_DATA = Object.freeze({
    ...base,
    "structure": {
      "vorherrschender adel": "Keiner",
      "regierungstyp": "Feudale Amtsverwaltung",
      "gewerbe": "Bergbau, Erzabbau & Schmiedekunst, Viehhaltung & Agrarkultur",
      "lehnsherr": "Haus Wyrm",
      "bekannte familien": "Tynged, Loer, Tarw",
      "stände": "Unterschicht, Mittelschicht",
      "einwohnerzahl": "etwa 750",
      "ritter": "Drei bis Vier Ritter der Wyrm",
      "waffenknechte": "20",
      "flotte": "Keine",
      "bedrohungen": "Trolle, Wölfe, Grimmlinge",
      "ressourcen": "Mineralien, Edelmetall, Erz, Vieh, Heu",
      "ortswache": "30",
      "land": "Königreich Cenyr",
      "provinz": "Celtigerns Wacht",
      "region": "Baronie Llamreis Ankunft",
      "name": "Craithglyn",
      "herrschaft": "Bürgermeister Hywel Tynged"
    },
    "houses": [
      {
        "title": "Ritterfürsten",
        "items": [
          {
            "name": "Haus Wyrm",
            "rank": "Ritterfürstlich",
            "seat": "Gwynthor",
            "liege": "Haus Draig",
            "familyId": "haus-wyrm",
            "emblem": "/Orte/modules/houses/assets/wyrm-legacy.png"
          }
        ]
      },
      {
        "title": "Ritterhäuser",
        "items": [
          {
            "name": "Haus Loer",
            "rank": "Ritterhaus",
            "seat": "Gwynthor und Craithglyn",
            "liege": "Haus Wyrm",
            "familyId": "haus-loer",
            "emblem": "/Stammbäume/assets/images/houses/Llamreis Ankunft/haus-loer.png"
          }
        ]
      },
      {
        "title": "Bürgerliche Häuser",
        "items": [
          {
            "name": "Haus Tynged",
            "rank": "Bürgerlich",
            "seat": "Craithglyn",
            "liege": "Haus Wyrm",
            "familyId": "",
            "emblem": ""
          },
          {
            "name": "Haus Tarw",
            "rank": "Bürgerlich",
            "seat": "Craithglyn",
            "liege": "Haus Wyrm",
            "familyId": "",
            "emblem": ""
          }
        ]
      }
    ],
    "merchants": [
      {
        "name": "Klingende Münze",
        "owner": "Corvus",
        "trade": "Kaufmannsgesellschaft",
        "wealth": "★★☆☆☆",
        "reputation": "✤✤✧✧✧",
        "influence": "★★☆☆☆",
        "description": ""
      }
    ],
    "personalities": [
      {
        "id": "administration",
        "title": "Administration & Verwaltung",
        "items": [
          {
            "name": "Hywel Tynged",
            "role": "Bürgermeister",
            "description": [
              "Hywel Tynged ist der amtierende Bürgermeister von Craithglyn und der wohlhabendste Bürger der Siedlung. Als ehemaliger Juwelier, der sein Handwerk an seinen Sohn abgetreten hat, verfügt er über weitreichende Verbindungen bis tief in die Bergwerke. Seine Hauptaufgabe ist die Leitung des Ortes und die gewissenhafte Abführung der Abgaben an das Haus Wyrm.",
              "Hywel ist bekannt dafür, dass er bei all seinen Geschäften auch seine eigenen Taschen zu füllen weiß. Er ist zwar ein gieriger Mann, aber keineswegs ein schlechter Mensch oder jemand, der seine Bürgermeisterwürde verletzen würde. Sein Charakter mag manchmal die Arbeitsmoral seiner Bürger beeinträchtigen, doch er ist niemals grausam. Letztendlich zeichnet er sich durch seine hohe Effizienz aus – eine Eigenschaft, die sowohl für das Haus Wyrm als auch für Craithglyn von großem Nutzen ist."
            ],
            "portrait": "/Orte/Koenigreich_Cenyr/Grafschaft_Celtigerns_Wacht/Baronie_Llamreis_Ankunft/Herrschaft_Haus_Wyrm/Craithglyn/assets/hywel-tynged.png"
          },
          {
            "name": "Melwedd Tynged",
            "role": "Frau des Bürgermeisters",
            "description": [
              "Melwedd Tynged ist die attraktive Ehefrau des Bürgermeisters Hywel Tynged. Sie stammt ursprünglich von der Sonnenküste, wo ihre Familie eine wohlhabende Bierbrauerei unter dem Namen \"Teyrngarch Brauerei\" führte. Melwedd genießt den Reichtum, den ihr Mann ihr bietet, in vollen Zügen und scheut sich nicht, dies den anderen Ehefrauen von Craithglyn spüren zu lassen. Solange es ihr gut geht und ihr Wohlstand gesichert ist, gilt sie als angenehme und umgängliche Person. Doch sollte sich dieser Umstand ändern und ihr Komfort bedroht sein, so heißt es, würde sich ihr Wesen schlagartig wandeln."
            ],
            "portrait": "/Orte/Koenigreich_Cenyr/Grafschaft_Celtigerns_Wacht/Baronie_Llamreis_Ankunft/Herrschaft_Haus_Wyrm/Craithglyn/assets/melwedd-tynged.png"
          },
          {
            "name": "Rhun Tynged",
            "role": "Steuermeister Sohn des Bürgermeisters",
            "description": [
              "Rhun Tynged ist der Sohn des Bürgermeisters und ein entscheidendes Bindeglied zwischen Craithglyn und dem Haus Wyrm. Er hat in Gwynthor studiert und dient dem Kämmerer der Wyrm als Steuermeister in Craithglyn. Seine Hauptaufgabe ist die akribische Kontrolle und Abwicklung aller Abgaben, die die Siedlung an das Herrscherhaus leisten muss. Rhun ist somit derjenige, der dafür sorgt, dass die \"Linsen gezählt\" werden und die finanziellen Interessen der Wyrm in Craithglyn gewissenhaft vertreten werden."
            ],
            "portrait": "/Orte/Koenigreich_Cenyr/Grafschaft_Celtigerns_Wacht/Baronie_Llamreis_Ankunft/Herrschaft_Haus_Wyrm/Craithglyn/assets/rhun-tynged.png"
          }
        ]
      },
      {
        "id": "levy",
        "title": "Aufgebot",
        "items": [
          {
            "name": "Sir Dwynarth Lloer",
            "role": "Hauptmann",
            "description": [
              "Sir Dwynarth Lloer ist ein erfahrener Kriegsveteran, dessen Vergangenheit ihn durch bedeutende Schlachten formte: Er kämpfte einst in den Höhen von Vennyr und später, vor zwanzig Jahren, in den Tiefen von Ceitheach. Heute dient er in seiner Heimat als Hauptmann der Wache in Craithglyn und steht treu im Dienste des Hauses Wyrm. Dwynarth ist bekannt als ein stoischer, wortkarger Mann, dessen Taten mehr sprechen als seine Worte."
            ],
            "portrait": "/Stammbäume/assets/images/portraits/haus-loer/dwynarth-loer.jpg"
          },
          {
            "name": "Sir Anwarth Tarw",
            "role": "Waffenmeister",
            "description": [
              "Sir Anwarth Tarw ist ein Ritter aus der Familie Tarw, eine ungewöhnliche Herkunft für einen Krieger dieses Standes. Er diente einst als Knappe unter Sir Dwynarth Lloer und wurde später persönlich von den Wyrm zum Ritter geschlagen. In Craithglyn bekleidet er die Position des Waffenmeisters, wo er die Waffenknechte und die Stadtwache ausbildet. Anwarth ist bekannt für seine Freundlichkeit und unerschütterliche Loyalität."
            ],
            "portrait": "/Orte/Koenigreich_Cenyr/Grafschaft_Celtigerns_Wacht/Baronie_Llamreis_Ankunft/Herrschaft_Haus_Wyrm/Craithglyn/assets/sir-anwarth-tarw.png"
          }
        ]
      },
      {
        "id": "other",
        "title": "Sonstige",
        "items": [
          {
            "name": "Vater Tynglath Tarw",
            "role": "Oberer/ Gemeindeführer",
            "description": [
              "Vater Tynglath Tarw ist der Gemeindeführer von Craithglyn und ein Priester des Knechts, des Gottes der Arbeit. Er führt seine Gemeinde mit strenger Hand und hat eine tiefe Abneigung gegen die Klingende Münze, die in der Siedlung Fuß gefasst hat. Seine unnachgiebige Haltung gegenüber dieser Kaufmannsgesellschaft zeigt seinen Wunsch, die Integrität und den Fleiß seiner Gemeinde zu schützen."
            ],
            "portrait": "/Orte/Koenigreich_Cenyr/Grafschaft_Celtigerns_Wacht/Baronie_Llamreis_Ankunft/Herrschaft_Haus_Wyrm/Craithglyn/assets/vater-tynglath-tarw.png"
          },
          {
            "name": "Merthroc",
            "role": "Vorarbeiter der Mine",
            "description": [
              "Merthroc ist ein angesehener Bürger Craithglyns und Vorarbeiter in den Minen. Er ist bekannt für seine harte Arbeit und seine wortkarge Art. Nach Feierabend ist er ein Dauergast in Llavorchs Taverne, bevor er seinen langen Heimweg zu seinem Haus unterhalb der Lavendelfelder und Mauern antritt. Merthroc gilt als unbestechlich und hat ein Auge auf Talarwen, die Tochter des Wirts, geworfen. Allerdings ist er Llavorch derzeit zu \"arm\" für eine passende Partie. Merthroc träumt davon, eines Tages seine eigene Schmiede zu eröffnen, wofür er jedoch noch Zeit und wohl auch Kapital benötigt."
            ],
            "portrait": "/Orte/Koenigreich_Cenyr/Grafschaft_Celtigerns_Wacht/Baronie_Llamreis_Ankunft/Herrschaft_Haus_Wyrm/Craithglyn/assets/merthroc.png"
          },
          {
            "name": "Sir Nedri Tlawd",
            "role": "Gast/ Reisender",
            "description": [
              "Sir Nedri (Haus Tlawd ) ist ein bekanntes Gesicht in der Region – mal in Garwfaen, mal in Morddyn, doch am häufigsten im Rostigen Haken anzutreffen, meist mit einem Krug in der Hand. Einst diente er den ehrwürdigen Grafen der Draig, kämpfte im Norden bei Vennyr und später im Süden gegen Ceitheach. Den Ritterschlag erhielt er von niemand Geringerem als Graf Rodri, „als dieser noch auf beiden Beinen stand“, wie Nedri selbst gern anmerkt.",
              "Heute ist er ein freigestellter Fahrender Ritter, ohne Herren, aber mit Ehre im Herzen. Er nimmt Aufträge vom Schwarzen Brett an – für Kupfer, Silber oder einfach ein warmes Essen – und hilft, wo Not herrscht. Ein wenig zynisch, manchmal betrunken, aber immer bereit, Schwert und Schild für die Schwachen zu heben."
            ],
            "portrait": "/Orte/Koenigreich_Cenyr/Grafschaft_Celtigerns_Wacht/Baronie_Llamreis_Ankunft/Herrschaft_Haus_Wyrm/Craithglyn/assets/sir-nedri-tlawd.png"
          }
        ]
      }
    ],
    "regionMap": {
      "mapId": "cenyr-celtigerns-wacht-llamrais-ankunft-wyrm-craithglyn-bannkreis",
      "title": "Craithglyn – Bannkreis",
      "embedHref": "/Karten/karte.html?map=cenyr-celtigerns-wacht-llamrais-ankunft-wyrm-craithglyn-bannkreis",
      "fullHref": "/Karten/karte.html?map=cenyr-celtigerns-wacht-llamrais-ankunft-wyrm-craithglyn-bannkreis",
      "pois": []
    }
  });
})();
