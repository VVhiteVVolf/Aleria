window.ORT_DATA = {
  meta: {
    id: "grossstadt-vorlage",
    title: "Großstadt-Vorlage - Aleria",
    type: "Großstadt",
    status: "Vorlage",
    editorVersion: 1
  },

  name: "Name der Großstadt",

  quote: {
    text: "....",
    source: "Unbekannte Stimme"
  },

  images: {
    main: {
      src: "https://66.media.tumblr.com/c11fe8f7aab917bc90215beef3e83c10/tumblr_otwjgn7mfU1wwqdobo1_1280.png",
      alt: "Stadtpanorama Platzhalter"
    },
    crest: {
      src: "https://66.media.tumblr.com/c11fe8f7aab917bc90215beef3e83c10/tumblr_otwjgn7mfU1wwqdobo1_1280.png",
      alt: "Wappen oder Banner Platzhalter"
    },
    map: {
      src: "https://66.media.tumblr.com/c11fe8f7aab917bc90215beef3e83c10/tumblr_otwjgn7mfU1wwqdobo1_1280.png",
      alt: "Karte Platzhalter"
    }
  },

  hierarchy: [
    { type: "Königreich", name: "Cenyr", slug: "cenyr" },
    { type: "Grafschaft", name: "Grafschaft", slug: "grafschaft" },
    { type: "Baronie", name: "Baronie", slug: "baronie" },
    { type: "Ritterliche Herrschaft", name: "Herrschaft", slug: "herrschaft" },
    { type: "Siedlung", name: "Name der Großstadt", slug: "name-der-grossstadt" }
  ],

  infobox: [
    {
      title: "Struktur",
      rows: [
        ["Land", "Cenyr"],
        ["Grafschaft", "..."],
        ["Baronie", "..."],
        ["Herrschaft", "..."],
        ["Name", "Name der Großstadt"],
        ["Vorherrschender Adel", "..."],
        ["Region", "..."],
        ["Regierungstyp", "..."],
        ["Gewerbe", "..."],
        ["Herrschaft", "..."],
        ["Lehnsherr", "..."]
      ]
    },
    {
      title: "Bevölkerung",
      rows: [
        ["Bekannte Familien", "..."],
        ["Stände", "..."],
        ["Einwohnerzahl", "..."]
      ]
    },
    {
      title: "Militär",
      rows: [
        ["Ritter", "..."],
        ["Waffenknechte", "..."],
        ["Ortswache", "..."],
        ["Flotte", "..."],
        ["Sonstiges Aufgebot", "..."]
      ]
    },
    {
      title: "Sonstiges",
      rows: [
        ["Bedrohungen", "..."],
        ["Ressourcen", "..."]
      ]
    }
  ],

  noticeBoard: {
    title: "Anzeigetafeln",
    label: "Zur Stadttafel",
    href: "",
    image: {
      src: "https://66.media.tumblr.com/c11fe8f7aab917bc90215beef3e83c10/tumblr_otwjgn7mfU1wwqdobo1_1280.png",
      alt: "Anzeigetafel Platzhalter"
    }
  },

  sections: [
    {
      id: "einleitung",
      title: "Einleitung",
      shortTitle: "Einleitung",
      text: [
        "Kurze Einführung in Lage, Wirkung, Ruf und erzählerische Rolle der Stadt.",
        "Hier soll später stehen, warum diese Stadt wichtig ist und welchen ersten Eindruck Reisende, Händler, Pilger oder Soldaten gewinnen."
      ],
      details: [
        {
          title: "Gesprächsvorlage",
          text: [
            "[Szene oder Stimmung einleiten]",
            "[Name 1]: Dialog von Figur 1.",
            "[Name 2]: Antwort oder Handlung von Figur 2."
          ]
        }
      ]
    },
    {
      id: "hintergrund",
      title: "Hintergrund",
      shortTitle: "Hintergrund",
      text: "Grundlegender Überblick über Ursprung, Zweck und Stellung der Stadt.",
      subsections: [
        {
          title: "Lage",
          text: "Beschreibung von Küste, Fluss, Handelsweg, Grenzlage, Nachbarsiedlungen und strategischer Bedeutung."
        },
        {
          title: "Verwaltung",
          text: "Beschreibung der Stadtverwaltung, Ämter, Räte, Abgaben und praktischen Machtverteilung.",
          details: [
            {
              title: "Verwaltungsprinzip großer Baronie- und Grafenstädte in Cenyr",
              text: [
                "Große cenyrische Städte werden meist von höherem Adel geführt: Grafen, Baronen oder Ritterfürsten. Auch in einer Grafenstadt kann ein Ritterfürst als Stadthalter eingesetzt werden, häufig als Erbe oder vertrauter Verwalter.",
                "Neben Hofleuten und Beamten besteht oft ein Stadtrat aus Gildenmeistern, Zunftführern, Rittern und angesehenen Bürgern. Dieser vertritt praktische Stadtbelange, während die endgültige Entscheidungsgewalt beim Stadthalter bleibt.",
                "Große Städte werden in Verwaltungsbezirke und Funktionsknotenpunkte aufgeteilt. Hafen, Markt, Torzoll, Handwerksviertel und Wachbezirke können fähigen Häusern oder Ministerialen übertragen werden.",
                "Die Abgaben fließen über Bezirksverwalter zum Stadthalter und von dort je nach Lehensordnung weiter an Baron, Graf und Königshaus. Die genauen Pflichten sind individuell ausgehandelt."
              ]
            }
          ]
        }
      ]
    },
    {
      id: "konflikte",
      title: "Konflikte",
      shortTitle: "Konflikte",
      text: "Innere und äußere Spannungen: Adel gegen Bürgerschaft, Gildenrivalitäten, Grenzbedrohungen, religiöse Streitpunkte oder wirtschaftliche Abhängigkeiten.",
      details: [
        {
          title: "Konfliktszene",
          text: [
            "[Szene oder Stimmung einleiten]",
            "[Name 1]: Forderung, Drohung oder Vorwurf.",
            "[Name 2]: Antwort, Ausweichmanöver oder Eskalation."
          ]
        }
      ]
    },
    {
      id: "geschichte",
      title: "Geschichte",
      shortTitle: "Geschichte",
      text: "Gründung, Wachstum, Krisen, Herrschaftswechsel, Katastrophen, Kriege und prägende Wendepunkte."
    },
    {
      id: "aristokratie",
      title: "Aristokratie / Häuser",
      shortTitle: "Häuser",
      text: "Adelige Häuser, Ministeriale, bürgerliche Machtblöcke und ihre Stellung innerhalb der Stadt.",
      linkGroups: [
        {
          title: "Grafenhaus",
          items: [
            { name: "Haus ...", type: "Grafenhaus", note: "führendes Haus" }
          ]
        },
        {
          title: "Ritterfürsten",
          items: [
            { name: "Haus ...", type: "Ritterfürst", note: "Stadthalter oder Bezirksmacht" },
            { name: "Haus ...", type: "Ritterfürst", note: "..." }
          ]
        },
        {
          title: "Ritterhäuser",
          items: [
            { name: "Haus ...", type: "Ritterhaus", note: "..." },
            { name: "Haus ...", type: "Ritterhaus", note: "..." },
            { name: "Haus ...", type: "Ritterhaus", note: "..." }
          ]
        },
        {
          title: "Landbesitzer / Ministeriale",
          items: [
            { name: "Familie ...", type: "Ministeriale", note: "..." },
            { name: "Familie ...", type: "Landbesitz", note: "..." }
          ]
        },
        {
          title: "Bürgerliche Häuser",
          items: [
            { name: "Haus ...", type: "Bürgerhaus", note: "..." },
            { name: "Haus ...", type: "Bürgerhaus", note: "..." }
          ]
        }
      ]
    },
    {
      id: "bevoelkerung",
      title: "Bevölkerung",
      shortTitle: "Bevölkerung",
      text: "Stände, Viertel, Herkunftsgruppen, Minderheiten, soziale Spannungen und Alltagsleben der Bewohner."
    },
    {
      id: "zeitungsblatt",
      title: "Zeitungsblatt",
      shortTitle: "Zeitung",
      text: "Aushänge, Gerüchte, öffentliche Bekanntmachungen, Marktpreise, Steckbriefe, Warnungen und lokale Nachrichten."
    },
    {
      id: "kultur",
      title: "Kultur",
      shortTitle: "Kultur",
      text: "Feste, Kleidung, Speisen, Sprache, religiöse Gewohnheiten, lokale Redewendungen, Kunst und städtische Eigenheiten."
    },
    {
      id: "bezirke",
      title: "Bezirke",
      shortTitle: "Bezirke",
      text: "Stadtviertel, Tore, Märkte, Häfen, Oberstadt, Unterstadt und wichtige Funktionsräume.",
      cards: [
        {
          title: "Oberstadt",
          text: "Adel, Verwaltung, Tempel oder repräsentative Gebäude."
        },
        {
          title: "Marktviertel",
          text: "Handel, Zünfte, Gasthäuser und Warenströme."
        },
        {
          title: "Hafen / Torbezirk",
          text: "Zoll, Lager, Wachposten, Reisende und Fremde."
        }
      ]
    },
    {
      id: "militaer",
      title: "Militär",
      shortTitle: "Militär",
      text: "Ritter, Waffenknechte, Stadtwache, Milizen, Flotte, Mauern, Tore und Verteidigungsdoktrin.",
      cards: [
        {
          title: "Stadtwache",
          text: "Aufgaben, Uniform, Zuständigkeiten und typische Präsenz im Stadtbild."
        },
        {
          title: "Aufgebot",
          text: "Ritter, Knappen, Waffenknechte, Söldner oder lokale Milizen."
        }
      ]
    },
    {
      id: "wirtschaft",
      title: "Wirtschaft",
      shortTitle: "Wirtschaft",
      text: "Ressourcen, Märkte, Werkstätten, Zölle, Handelsrouten, Schulden, Abhängigkeiten und Exportgüter."
    },
    {
      id: "haendler",
      title: "Händler & Etablissements",
      shortTitle: "Händler",
      text: "Gasthäuser, Händler, Institutionen, Zünfte, Handwerk, Wirtschaftsknoten und besondere Orte.",
      linkGroups: [
        {
          title: "Gastwirtschaft & Unterhaltung",
          items: [
            { name: "Gasthaus ...", type: "Gasthaus", note: "..." },
            { name: "Taverne ...", type: "Taverne", note: "..." }
          ]
        },
        {
          title: "Gilden, Orden & Institutionen",
          items: [
            { name: "Gilde ...", type: "Gilde", note: "..." },
            { name: "Orden ...", type: "Orden", note: "..." }
          ]
        },
        {
          title: "Zünfte, Handwerk & Wirtschaft",
          items: [
            { name: "Zunft ...", type: "Zunft", note: "..." },
            { name: "Werkstatt ...", type: "Handwerk", note: "..." }
          ]
        },
        {
          title: "Sonstiges",
          items: [
            { name: "Ort ...", type: "POI", note: "..." }
          ]
        }
      ]
    },
    {
      id: "personen",
      title: "Persönlichkeiten von Relevanz",
      shortTitle: "Personen",
      text: "Wichtige Personen der Stadt, getrennt nach Rolle und Machtbereich.",
      peopleGroups: [
        {
          title: "Adel und Verwaltung",
          items: [
            { role: "Rolle", name: "Name", text: "......" },
            { role: "Rolle", name: "Name", text: "......" }
          ]
        },
        {
          title: "Stadtwache",
          items: [
            { role: "Rolle", name: "Name", text: "......" },
            { role: "Rolle", name: "Name", text: "......" }
          ]
        },
        {
          title: "Sonstige",
          items: [
            { role: "Rolle", name: "Name", text: "......" }
          ]
        }
      ]
    },
    {
      id: "trivia",
      title: "Trivia",
      shortTitle: "Trivia",
      list: [
        "...",
        "...",
        "...",
        "..."
      ]
    }
  ]
};
