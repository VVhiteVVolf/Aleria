window.STECKBRIEF_DATA = {
  meta: {
    id: "steckbrief-vorlage",
    titel: "Steckbrief-Vorlage - Aleria",
    kategorie: "Charaktervorlage",
    status: "Vorlage",
    editorVersion: 2
  },

  name: {
    vorname: "Name",
    nachname: "Nachname",
    vollstaendig: "Name Nachname",
    titel: "-",
    rufname: "-",
    alias: "-"
  },

  zitat: {
    text: "Motto / Zitat",
    urheber: "Urheber"
  },

  portrait: {
    src: "https://66.media.tumblr.com/c11fe8f7aab917bc90215beef3e83c10/tumblr_otwjgn7mfU1wwqdobo1_1280.png",
    alt: "Porträt Platzhalter",
    format: "portrait",
    fit: "cover",
    scale: 1
  },

  einfuehrung: "— Einführungsbeschreibung ...",

  wappen: {
    src: "https://66.media.tumblr.com/c11fe8f7aab917bc90215beef3e83c10/tumblr_otwjgn7mfU1wwqdobo1_1280.png",
    alt: "Wappen Platzhalter",
    scale: 1,
    format: "square",
    fit: "contain"
  },

  hierarchie: [
    { typ: "Land", name: "Land", slug: "land" },
    { typ: "Grafschaft", name: "Grafschaft", slug: "grafschaft" },
    { typ: "Baronie", name: "Baronie", slug: "baronie" },
    { typ: "Herrschaft", name: "Herrschaft", slug: "herrschaft" },
    { typ: "Stadt", name: "Stadt", slug: "stadt" },
    { typ: "Dorf", name: "Dorf", slug: "dorf" },
    { typ: "Familie", name: "Familie", slug: "familie" }
  ],

  fakten: [
    {
      titel: "Basis Informationen",
      eintraege: [
        ["Vorname", "Name"],
        ["Nachname", "Nachname"],
        ["Titel / Anrede", "-"],
        ["Rufname", "-"],
        ["Alias", "-"],
        ["Geschlecht", "-"],
        ["Alter", "-"],
        ["Geburtstag", "-"],
        ["Sternzeichen", "-"],
        ["Größe", "-"],
        ["Herkunft", "-"]
      ]
    },
    {
      titel: "Familien Daten",
      eintraege: [
        ["Familie", "-"],
        ["Vater", "-"],
        ["Mutter", "-"],
        ["Geschwister", "-"],
        ["Partner", "-"],
        ["Kinder", "-"]
      ]
    },
    {
      titel: "Stand Daten",
      eintraege: [
        ["Stand", "-"],
        ["Amt / Rolle", "-"],
        ["Aufgabe", "-"],
        ["Zugehörigkeit", "-"]
      ]
    },
    {
      titel: "Gilden Daten",
      eintraege: [
        ["Gilde", "-"],
        ["Gruppe", "-"],
        ["Gildenrang", "-"],
        ["Aufgabe", "-"]
      ]
    },
    {
      titel: "Kampf Daten",
      eintraege: [
        ["Klasse", "-"],
        ["Spezialisierung", "-"],
        ["Mentor", "-"],
        ["Stärken", "-"],
        ["Schwächen", "-"],
        ["Waffen", "-"]
      ]
    },
    {
      titel: "Magische Daten",
      eintraege: [
        ["Schulen", "-"],
        ["Pakte", "-"],
        ["Affinität", "-"],
        ["Anfälligkeit", "-"],
        ["Potenzial", "-"],
        ["Mana Kapazität", "-"]
      ]
    },
    {
      titel: "Glaubens Daten",
      eintraege: [
        ["Religion", "Alerische Kirche"],
        ["Schutzpatron", "-"]
      ]
    }
  ],

  sektionen: [
    {
      id: "erscheinung",
      titel: "Erscheinung",
      text: "Beschreibung der Erscheinung ... Körperbau, Haltung, Mimik, Kleidung, Schmuck, Narben, Geruch, Stimme, Gangart und erste Wirkung.",
      bild: {
        src: "https://66.media.tumblr.com/c11fe8f7aab917bc90215beef3e83c10/tumblr_otwjgn7mfU1wwqdobo1_1280.png",
        alt: "Abbildung",
        caption: "\"....\"",
        credit: "- ...."
      }
    },
    {
      id: "persoenlichkeit",
      titel: "Persönlichkeit",
      scrollHoehe: 1430,
      gruppen: [
        {
          titel: "Charakter",
          text: "..."
        },
        {
          titel: "Vorlieben & Abneigungen",
          text: "..."
        },
        {
          titel: "Stärken & Schwächen",
          text: "..."
        },
        {
          titel: "Lebenstraum",
          text: "..."
        },
        {
          titel: "Motto / Zitate",
          zitate: [
            { text: "...", urheber: "" }
          ]
        },
        {
          titel: "Charakterliche Ausrichtung",
          text: "..."
        }
      ]
    },
    {
      id: "faehigkeiten",
      titel: "Fähigkeiten",
      gruppen: [
        { titel: "Spezialisierung", text: ["..."] },
        { titel: "Stärken", text: ["..."] },
        { titel: "Schwächen", text: ["..."] },
        { titel: "Aspekte & Segen", text: ["..."] },
        { titel: "Aura & Präsenz", text: ["..."] }
      ]
    },
    {
      id: "hintergrund",
      titel: "Hintergrund",
      gruppen: [
        { titel: "Überblick", text: ["..."] },
        { titel: "Kindheit", text: ["..."] },
        { titel: "Jugend", text: ["..."] },
        { titel: "Werdegang", text: ["..."] }
      ]
    },
    {
      id: "inventar",
      titel: "Inventar",
      inventar: {
        aufklappbar: true,
        titel: "Inventar",
        kategorien: [
          {
            titel: "Waffen",
            eintraege: [
              {
                name: "Primäre Waffe",
                icon: "https://i.imgur.com/K2QYCxB.png",
                beschreibung: "Hier könnte eine neue Waffe eingetragen werden.",
                werte: { staerke: 0, geschick: 0, magie: 0 }
              },
              {
                name: "Sekundäre Waffe",
                icon: "https://i.imgur.com/K2QYCxB.png",
                beschreibung: "Hier könnte eine neue Waffe eingetragen werden.",
                werte: { staerke: 0, geschick: 0, magie: 0 }
              },
              {
                name: "Tertiäre Waffe",
                icon: "https://i.imgur.com/K2QYCxB.png",
                beschreibung: "Hier könnte eine neue Waffe eingetragen werden.",
                werte: { staerke: 0, geschick: 0, magie: 0 }
              }
            ]
          },
          {
            titel: "Gepäck",
            eintraege: [
              {
                name: "Reisegepäck",
                icon: "https://i.imgur.com/xA8Q3VD.png",
                beschreibung: "Hier kann Reisegepäck, Werkzeug, Proviant oder sonstiger Besitz stehen."
              }
            ]
          },
          {
            titel: "Rüstungen/Kleidungen",
            eintraege: [
              {
                name: "Rüstung",
                icon: "https://i.imgur.com/xA8Q3VD.png",
                beschreibung: "Beschreibung der Rüstung.",
                werte: { staerke: 0, geschick: 0, magie: 0 }
              },
              {
                name: "Kleidung",
                icon: "https://i.imgur.com/xA8Q3VD.png",
                beschreibung: "Beschreibung der Kleidung.",
                werte: { staerke: 0, geschick: 0, magie: 0 }
              },
              {
                name: "Schild",
                icon: "https://i.imgur.com/xA8Q3VD.png",
                beschreibung: "Beschreibung des Schilds.",
                werte: { staerke: 0, geschick: 0, magie: 0 }
              }
            ]
          },
          {
            titel: "Sonstiges",
            eintraege: [
              {
                name: "Gegenstand",
                icon: "https://i.imgur.com/f9Y09ky.png",
                beschreibung: "Beschreibung.",
                werte: { staerke: 0, geschick: 0, magie: 0 }
              },
              {
                name: "Gegenstand",
                icon: "https://i.imgur.com/f9Y09ky.png",
                beschreibung: "Beschreibung.",
                werte: { staerke: 0, geschick: 0, magie: 0 }
              },
              {
                name: "Gegenstand",
                icon: "https://i.imgur.com/f9Y09ky.png",
                beschreibung: "Beschreibung.",
                werte: { staerke: 0, geschick: 0, magie: 0 }
              }
            ]
          },
          {
            titel: "Reittier / Begleiter",
            eintraege: [
              {
                name: "Gefährte",
                icon: "https://i.imgur.com/BaOCwj0.png",
                beschreibung: "Hier könnte ein weiteres Reittier oder Begleiter eingetragen werden.",
                profil: {
                  name: "Gefährte",
                  art: "Tier / Begleiter",
                  bild: "https://i.imgur.com/BaOCwj0.png",
                  bildScale: 1,
                  bildFormat: "square",
                  bildFit: "contain",
                  kurztext: "Kurze Beschreibung des Gefährten.",
                  beschreibung: "Ausführliche Beschreibung, Wesen, Bindung zur Figur, Eigenheiten, Ausbildung und Geschichte.",
                  info: [
                    ["Name", "Gefährte"],
                    ["Art", "Pferd / Hund / Tier"],
                    ["Rasse", "-"],
                    ["Alter", "-"],
                    ["Geschlecht", "-"],
                    ["Herkunft", "-"],
                    ["Besitzer", "-"],
                    ["Rolle", "-"]
                  ],
                  attribute: [
                    ["Schnelligkeit", 5],
                    ["Ausdauer", 5],
                    ["Stärke", 5],
                    ["Agilität", 5],
                    ["Sozialverhalten", 5],
                    ["Robustheit", 5]
                  ]
                }
              }
            ]
          }
        ],
        geldboerse: {
          bild: "https://i.postimg.cc/J7D23vzz/image-removebg-preview-2.png",
          waehrungen: [
            { name: "Goldtaler", icon: "https://i.imgur.com/nypnWlN.png", anzahl: "??" },
            { name: "Silbertaler", icon: "https://i.imgur.com/hgYhPCT.png", anzahl: "??" },
            { name: "Kupfertaler", icon: "https://i.imgur.com/rp3IIJu.png", anzahl: "??" }
          ]
        }
      }
    },
    {
      id: "trivia",
      titel: "Trivia",
      liste: ["..."]
    },
    {
      id: "beziehungen",
      titel: "Beziehungen",
      beziehungsgruppen: [
        { titel: "Liebesbeziehungen", slots: 4 },
        { titel: "Freund", slots: 4 },
        { titel: "Familie", slots: 4 },
        { titel: "Orden/Gilde/Organisation", slots: 4 },
        { titel: "Bekanntschaften", slots: 4 },
        { titel: "Feinde und Rivalen", slots: 4 }
      ]
    }
  ],

  icons: {
    staerke: "https://i.imgur.com/rp3IIJu.png",
    geschick: "https://i.imgur.com/hgYhPCT.png",
    magie: "https://i.imgur.com/nypnWlN.png"
  }
};
