window.GRUPPEN_DATA = {
  meta: {
    id: "kleingruppen-vorlage",
    title: "Kleingruppen-Vorlage - Aleria",
    type: "Kleine Gruppierung",
    status: "Template",
    editorVersion: 1,
    template: "kleingruppe",
    storage: {
      document: "kleingruppen-vorlage",
      firebaseCollections: {
        groups: "organisationen_und_gruppen",
        inlineContent: "organisationen_und_gruppen_inline_content",
        scenes: "organisationen_und_gruppen_scenes",
      },
      imageStorage: {
        currentMode: "inline-url-or-base64",
        plannedProvider: "firebase-storage",
        plannedRoot: "gruppen/kleingruppen-vorlage/images",
        plannedFirestoreMode: "reference",
      },
      tableStorage: {
        currentMode: "html",
        plannedStructuredMode: "optional",
      },
      localStoragePrefixes: [
        "aleria:gruppen:inline-content:v2:kleingruppen-vorlage",
        "aleria:gruppen:inline-reset:kleingruppen-vorlage",
        "aleria:gruppen:inline-status-position:kleingruppen-vorlage",
        "aleria:gruppen:scene-index:kleingruppen-vorlage",
        "aleria:gruppen:scene-index-meta:kleingruppen-vorlage",
        "aleria:gruppen:session-module:kleingruppen-vorlage:",
        "aleria:gruppen:session-module-meta:kleingruppen-vorlage:",
        "aleria:gruppen:comments:gruppen:kleingruppen-vorlage:",
      ],
    },
  },

  name: "Kleingruppen-Vorlage",
  canonicalPath: "Organisationen und Gruppen > Kleine Gruppierungen / Trupps / Zellen > Kleingruppen-Vorlage",

  hierarchy: [
    { type: "Sammlung", name: "Organisationen und Gruppen", slug: "organisationen-und-gruppen" },
    { type: "Kategorie", name: "Kleine Gruppierungen / Trupps / Zellen", slug: "kleine-gruppierungen-trupps-zellen" },
    { type: "Gruppe", name: "Kleingruppen-Vorlage", slug: "kleingruppen-vorlage" },
  ],

  classification: {
    category: "Kleine Gruppierung",
    groupType: "Trupp, Zelle, Banner, Zirkel, Einsatzgruppe oder Untereinheit",
    scale: "klein bis mittel",
    parentGroupId: null,
    rootGroupId: "kleingruppen-vorlage",
  },

  profile: {
    motto: "Optionaler Leitspruch",
    quoteAuthor: "Anführer / Chronist / Überlieferung",
    groupType: "Trupp / Zelle / Banner / Zirkel / Einsatzgruppe",
    locations: "Hauptquartier, Treffpunkt oder Einsatzgebiet",
    leader: "Anführer oder Sprecher",
    symbol: "Wappen, Zeichen, Farbe oder Erkennungsmerkmal",
    patronDeities: "Patrongottheiten, Ideale oder Schutzmächte",
    affiliation: "Übergeordnete Organisation, Haus, Reich oder Fraktion",
    memberStrength: "Mitgliederstärke oder genaue Anzahl",
    reputation: "Ruf, Legenden, bekannte Vorurteile",
    classes: "typische Professionen, Rollen oder Fähigkeiten",
    founding: "Gründungsjahr oder Entstehungszeitraum",
    duty: "Dienst, Auftrag oder Funktion",
    area: "Zuständigkeitsbereich oder Einsatzfeld",
    allies: "Verbündete, Förderer oder Schutzpatrone",
    enemies: "Feinde, Rivalen oder geächtete Gruppen",
    goal: "Kurzfristiges und langfristiges Ziel",
  },

  sections: {
    overview: "Kurzüberblick: Wofür steht diese kleine Gruppierung, wodurch fällt sie auf und warum ist sie relevant?",
    background: "Hintergrund, Entstehung, Gründungspersonen, Wendepunkte und interne Spannungen.",
    duties: "Aufgabenbereich, Einsatzprofil, Pflichten, Rechte und typische Aufträge.",
    locations: "Standorte, Treffpunkte, Einsatzgebiete, Rückzugsorte und lokale Einflussräume.",
    members: "Mitglieder, Hierarchie, Aufgabenverteilung und interne Dynamik.",
    influence: "Reichweite, Kontakte, Schutzverhältnisse, Abhängigkeiten und begrenzte Machtmittel.",
    politics: "Beziehungen, politische Rolle, Bündnisse, Rivalitäten, Konflikte und Verpflichtungen.",
    leadership: "Anführer, Stellvertreter, Leutnants, Rollen und administrative Ämter.",
  },

  trivia: [
    "...",
    "...",
    "...",
  ],
};
