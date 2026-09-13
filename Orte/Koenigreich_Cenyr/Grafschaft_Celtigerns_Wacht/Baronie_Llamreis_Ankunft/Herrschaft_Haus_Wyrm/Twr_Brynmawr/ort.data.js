(function () {
  "use strict";

  const createPlaceData = window.ALERIA_CELTIGERNS_PLACES?.createPlaceData;
  if (typeof createPlaceData !== "function") return;

  const base = createPlaceData("twr-brynmawr", {
    "parentage": {
      "barony": "Llamreis Ankunft",
      "liege": "Haus Wyrm"
    },
    "features": {
      "districts": false,
      "noticeBoard": true
    },
    "presentation": {
      "map": "/Orte/Koenigreich_Cenyr/Grafschaft_Celtigerns_Wacht/Baronie_Llamreis_Ankunft/Herrschaft_Haus_Wyrm/Twr_Brynmawr/assets/ortskarte.jpg",
      "images": {
        "bild-einer-stadtwache-png": {
          "src": "/Orte/Koenigreich_Cenyr/Grafschaft_Celtigerns_Wacht/Baronie_Llamreis_Ankunft/Herrschaft_Haus_Wyrm/Twr_Brynmawr/assets/wache.png",
          "alt": "Wache von Tŵr Brynmawr",
          "fit": "contain"
        },
        "karten-bild-png": {
          "src": "/Orte/Koenigreich_Cenyr/Grafschaft_Celtigerns_Wacht/Baronie_Llamreis_Ankunft/Herrschaft_Haus_Wyrm/Twr_Brynmawr/assets/ortskarte.jpg",
          "alt": "Ortskarte von Tŵr Brynmawr",
          "href": "/Orte/Koenigreich_Cenyr/Grafschaft_Celtigerns_Wacht/Baronie_Llamreis_Ankunft/Herrschaft_Haus_Wyrm/Twr_Brynmawr/assets/ortskarte.jpg",
          "fit": "contain"
        },
        "icon-png": {
          "src": "/Orte/Koenigreich_Cenyr/Grafschaft_Celtigerns_Wacht/Baronie_Llamreis_Ankunft/Herrschaft_Haus_Wyrm/Twr_Brynmawr/assets/wappen.png",
          "alt": "Wappen von Tŵr Brynmawr",
          "fit": "contain"
        }
      }
    },
    "sections": {
      "introduction": [
        "Tŵr Brynmawr war ein Wachposten des Hauses Wyrm, der eine strategisch wichtige Position einnahm. Vor der Seeschlacht um Rhonwens Tränen wurde der Turm jedoch zerstört. Das Haus Wyrm ist derweil noch mit seinem Aufbau beschäftigt, weshalb hier heute nur eine kleine Garnison und einige Bürger bzw. Arbeiter leben."
      ],
      "background": [
        "Einst war Tŵr Brynmawr kaum mehr als ein einfacher Wachposten – ein steinerner Zahn an der Küste, der über die Fischer der Insel wachte und den schmalen Handelspfad zwischen Ceitheach und Cenyr sicherte. In jenen Tagen schützte er weniger mit Stahl als durch seine bloße Präsenz.",
        "Doch der Krieg kam auch hierher, mit Rauch und Eisen. Scharmützler brandschatzten den Ort, der Turm stürzte ein, und die Insel wurde still. Lange blieb sie sich selbst überlassen – ein Ort des Flüsterns und der Geister.",
        "Erst vor wenigen Jahren entsandte das Haus Wyrm einen seiner eigenen: Sir Sian Wyrm ein pflichtbewusster Sprössling, nun Kommandant und Statthalter dieser kargen Küste. Unter seiner Führung beginnt der Wiederaufbau – zäh, mühselig und von Rückschlägen gezeichnet.",
        "Heute steht hier nicht viel: Eine einfache Garnison, die in Zelten und neuem Stein zugleich ruht, ein wiedererrichteter Turm, mehr Mahnmal als Bollwerk, eine schlichte Taverne für Soldaten, Arbeiter und Seeleute, sowie eine wachsende Anlegestelle, an der Händler ebenso wie Versorgungsboote Halt machen. Baumeister vermessen das Land, Holz wird herangeschleppt, Pläne werden gezeichnet – mit jedem Tag wird das Flüstern leiser und der Klang von Hämmern lauter.",
        "Tŵr Brynmawr lebt wieder – noch klein, noch verletzlich, doch entschlossen."
      ],
      "location": [
        "Die Insel liegt nur wenige Seemeilen vor der Küste von Gwynthor, der stolzen Hauptstadt der Grafschaft Celtigerns Wacht, und dennoch wirkt sie wie vergessen vom Rest der Welt. Ihre Erscheinung ist schlicht, beinahe unscheinbar – ein Stück Fels und Sand, umspült von grauem Wasser und heimgesucht vom Wind.",
        "Im Nordosten krallt sich Tŵr Brynmawr an die Klippen einer kleinen, sichelförmigen Bucht. Hier liegen die Ruinen des alten Wachpostens und die kümmerlichen Anfänge des Wiederaufbaus: Holzgerüste, halb errichtete Mauern und das leise Echo des Hammers.",
        "Abseits davon ist die Insel karg. Überreste einiger Fischerhäuser, vom Krieg verbrannt und von der Zeit zernagt, ducken sich am Rand der Strände. Ihre Bewohner sind fort – oder vergessen.",
        "Und doch birgt die Insel noch Geheimnisse: Mehrere Schiffswracks, teils sichtbar, teils verschlungen vom Meer, liegen an der Küste – Zeugen vergangener Schlachten oder Stürme. In den südlichen Ausläufern finden sich Höhlen, bisher unerforscht, von Salz, Dunkelheit und vielleicht mehr erfüllt.",
        "Ein letzter, eigentümlicher Anblick thront im Herzen der Insel: der Eremitenbaum – ein uralter, knorriger Baumries, längst verdorrt, tot und starr, doch noch immer majestätisch. Die Einheimischen meiden ihn. Ob aus Aberglaube oder Respekt – das fragt niemand laut."
      ],
      "administration": [
        "Von einer echten Verwaltung im klassischen Sinne kann in Tŵr Brynmawr noch keine Rede sein. Der Ort ist derzeit nicht mehr als ein militärischer Außenposten des Hauses Wyrm, provisorisch wiederbelebt und unter dem strengen Blick von Sir Sian Wyrm. Zwar existieren erste Ansätze von Ordnung – eine Musterrolle, einfache Versorgungslinien, ein Baubuch – doch all dies wird direkt von der Garnison geführt und dient militärischen Zwecken, nicht dem bürgerlichen Wohl.",
        "Derzeit leben weniger als fünfzig Siedler auf der Insel – zumeist einfache Arbeiter, Zimmerleute, Hauer und einige Feldhüter, die mit dem Versprechen hierher gelockt wurden, später Land oder Bleibe zu vergünstigten Bedingungen zu erhalten. Es ist ein Pakt mit ungewissem Ausgang – doch in der Asche liegt auch Hoffnung.",
        "Noch bleibt abzuwarten, was aus diesem Unterfangen wird. Das Haus Wyrm selbst spricht von acht Jahren oder mehr, ehe der Ort sein einstiges Dasein übertrifft – und womöglich erstmals Gewinn abwirft. Bis dahin bleibt Tŵr Brynmawr das, was es im Kern ist: ein Vorposten, eine Baustelle, und ein Wagnis, das Stein für Stein zur Wahrheit werden muss."
      ],
      "population": [
        "Die Bevölkerung von Tŵr Brynmawr ist klein, rau und vom Wiederaufbau geprägt. Weniger als fünfzig Seelen leben derzeit auf der Insel – eine Mischung aus Handwerkern, Helfern, vereinzelten Fischerfamilien und Versorgungskräften, die das Wagnis eingegangen sind, hier neu zu beginnen.",
        "Viele von ihnen sind nicht freiwillig gekommen, sondern durch das Versprechen von Vergünstigungen, Landrechten oder Zukunftsperspektiven angelockt worden. Manche hoffen auf einen Neuanfang, andere entfliehen ihrer Vergangenheit – doch alle teilen das gleiche tägliche Ringen mit Schlamm, Wind und dem harten Wort der Aufseher.",
        "Es gibt keine festgefügte soziale Ordnung. Jeder arbeitet, wo er gebraucht wird. Zimmerleute helfen beim Mauerbau, Bäcker verteilen Ziegel, und selbst alte Veteranen finden sich beim Unkrautjäten. Wer aufmuckt, wird ermahnt – oder hinausgeschickt. Der Blick der Wyrm duldet wenig Widerspruch.",
        "Trotz allem regt sich in den Nächten am Feuer, in der Taverne oder zwischen den Baustellen eine Art von Gemeinschaft. Fremde werden skeptisch beäugt, doch wer bleibt, der zählt bald dazu – sofern er sich nützlich macht.",
        "Tŵr Brynmawr ist kein Ort für Träumer. Doch wer Härte kennt, kann hier Wurzeln schlagen.",
        "Die Einwohner sind Cenyri.",
        {
          "type": "list",
          "items": [
            "Familie Caerfon - Handwerker",
            "Familie Rhuddlan - Handwerker",
            "Familie Prennydd - Taverne"
          ]
        }
      ],
      "military": [
        "Die Garnison von Tŵr Brynmawr steht unter dem direkten Befehl von Sir Sian Wyrm, einem Sprössling des ehrwürdigen Hauses Wyrm. Als Kommandant, Statthalter und oberste Hand in allen Belangen wacht er gleichermaßen über den Wiederaufbau, die militärische Ordnung wie auch über die spärliche Zivilbevölkerung.",
        "An seiner Seite stehen – je nach Jahreszeit und Dringlichkeit – seine Kinder, Abgesandte des Hauses, deren Gegenwart ebenso Symbol wie Verpflichtung ist. Weitaus verlässlicher sind jedoch seine ritterlichen Gefährten: zwei bis vier auserlesene Ritter, die ihm in Treue und Schwertkunst zur Seite stehen. Sie gelten als unbestechlich, streng – und sind vor allem bei den Arbeitern gefürchtet für ihre direkte Art der Durchsetzung.",
        "Die Garnison selbst ist noch im Aufbau. Ein Teil lebt in Zelten, ein anderer in provisorischen Holzunterkünften. Lediglich der Turm, teils neu errichtet, teils aus alten Mauern zusammengesetzt, bietet Schutz bei Sturm oder Angriff. Trainiert wird auf einer offenen Schluchtwiese, Speerwurf neben Mörtelkarren – der Alltag ist geprägt vom ständigen Spagat zwischen Militär und Baustelle.",
        "Doch der Wille der Wyrm ist ungebrochen – und wo ihre Banner wehen, wächst bald auch Stein."
      ],
      "newspaper": [
        {
          "type": "subheading",
          "text": "Celtigerns Echo"
        },
        "Die Redaktion für Tŵr Brynmawr ist vorbereitet. Besetzung und Beiträge folgen.",
        {
          "type": "subheading",
          "text": "Der Schwarzbote"
        },
        "Die Redaktion für Tŵr Brynmawr ist vorbereitet. Besetzung und Beiträge folgen."
      ],
      "region": [
        "…"
      ]
    }
  });

  window.ORT_DATA = Object.freeze({
    ...base,
    "structure": {
      "vorherrschender adel": "Haus Wyrm",
      "regierungstyp": "Militärische Basis",
      "gewerbe": "Überwachung, Militärische Basis",
      "lehnsherr": "Haus Wyrm",
      "stände": "Unterschicht, Krieger",
      "einwohnerzahl": "40 - 45 Bürger (Ohne das Aufgebot)",
      "ritter": "2 bis 4 Ritter",
      "waffenknechte": "20 bis 30 Waffenknechte des Hauses Wyrm",
      "ortswache": "4 bis 6 Küstenwachen",
      "flotte": "Zwei leichte Kriegsschiffe",
      "bedrohungen": "Piraten, Sirenen, Versunkene",
      "ressourcen": "Keine",
      "land": "Königreich Cenyr",
      "provinz": "Celtigerns Wacht",
      "region": "Baronie Llamreis Ankunft",
      "name": "Tŵr Brynmawr",
      "herrschaft": "Kommandant Sion Wyrm",
      "bekannte familien": "Wyrm, Caerfon, Rhuddlan, Prennydd"
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
        "title": "Bürgerliche Familien",
        "items": [
          {
            "name": "Haus Caerfon",
            "rank": "Bürgerlich",
            "seat": "Tŵr Brynmawr",
            "liege": "Haus Wyrm",
            "familyId": "",
            "emblem": ""
          },
          {
            "name": "Haus Rhuddlan",
            "rank": "Bürgerlich",
            "seat": "Tŵr Brynmawr",
            "liege": "Haus Wyrm",
            "familyId": "",
            "emblem": ""
          },
          {
            "name": "Haus Prennydd",
            "rank": "Bürgerlich",
            "seat": "Tŵr Brynmawr",
            "liege": "Haus Wyrm",
            "familyId": "",
            "emblem": ""
          }
        ]
      }
    ],
    "merchants": [],
    "personalities": [
      {
        "id": "administration",
        "title": "Administration & Verwaltung",
        "items": [
          {
            "name": "Sion Wyrm",
            "role": "Kommandant/ Lehenswart",
            "description": [
              "Sion Wyrm ist der Kommandant und irgendwann der Lehenswart der Insel rundum Twr Brynmawr und für die Sicherheit als auch den Aufbau dieses Wachpostens der Wyrm verantwortlich."
            ],
            "portrait": "/Orte/Koenigreich_Cenyr/Grafschaft_Celtigerns_Wacht/Baronie_Llamreis_Ankunft/Herrschaft_Haus_Wyrm/Twr_Brynmawr/assets/sion-wyrm.png"
          }
        ]
      },
      {
        "id": "levy",
        "title": "Aufgebot",
        "items": []
      },
      {
        "id": "other",
        "title": "Sonstige",
        "items": []
      }
    ]
  });
})();
