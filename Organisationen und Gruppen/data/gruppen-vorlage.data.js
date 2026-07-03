window.GRUPPEN_DATA = {
  meta: {
    id: "gruppen-vorlage",
    title: "Gruppen-Vorlage - Aleria",
    type: "Organisation / Gruppe",
    status: "Template",
    editorVersion: 1,
    template: "gruppe",
    storage: {
      document: "gruppen-vorlage",
      firebaseCollections: {
        groups: "organisationen_und_gruppen",
        inlineContent: "organisationen_und_gruppen_inline_content",
        scenes: "organisationen_und_gruppen_scenes",
      },
      imageStorage: {
        currentMode: "inline-url-or-base64",
        plannedProvider: "firebase-storage",
        plannedRoot: "gruppen/gruppen-vorlage/images",
        plannedFirestoreMode: "reference",
      },
      tableStorage: {
        currentMode: "html",
        plannedStructuredMode: "optional",
      },
      localStoragePrefixes: [
        "aleria:gruppen:inline-content:v2:gruppen-vorlage",
        "aleria:gruppen:inline-reset:gruppen-vorlage",
        "aleria:gruppen:inline-status-position:gruppen-vorlage",
        "aleria:gruppen:scene-index:gruppen-vorlage",
        "aleria:gruppen:scene-index-meta:gruppen-vorlage",
        "aleria:gruppen:session-module:gruppen-vorlage:",
        "aleria:gruppen:session-module-meta:gruppen-vorlage:",
        "aleria:gruppen:comments:gruppen:gruppen-vorlage:",
      ],
    },
  },

  name: "Gruppen-Vorlage",
  canonicalPath: "Organisationen und Gruppen > Gilden / Orden / Organisationen / Kulte > Gruppen-Vorlage",

  hierarchy: [
    { type: "Sammlung", name: "Organisationen und Gruppen", slug: "organisationen-und-gruppen" },
    { type: "Kategorie", name: "Gilden / Orden / Organisationen / Kulte", slug: "gilden-orden-organisationen-kulte" },
    { type: "Gruppe", name: "Gruppen-Vorlage", slug: "gruppen-vorlage" },
  ],

  classification: {
    category: "Organisation / Gruppe",
    groupType: "Gilde, Orden, Organisation, Kult, Banner, Trupp oder Zelle",
    scale: "frei skalierbar",
    parentGroupId: null,
    rootGroupId: "gruppen-vorlage",
  },

  nesting: {
    supportsNestedGroups: true,
    note: "Jede Ebene kann eine eigene Gruppe mit eigener gruppen.data.js erhalten.",
    examplePath: [
      "Organisationen und Gruppen",
      "Gilden",
      "Windreiter",
      "Windreiter-Estryll",
      "Schwarzfische",
      "Schwarzfische I. Trupp",
    ],
    intendedChildTypes: [
      "Gilde",
      "Orden",
      "Organisation",
      "Kult",
      "Banner",
      "Kompanie",
      "Trupp",
      "Zelle",
      "Zehnerschaft",
    ],
  },

  profile: {
    motto: "Optionaler Leitspruch",
    quoteAuthor: "Führung / Chronist / Überlieferung",
    groupType: "Gilde / Orden / Organisation / Kult / Banner / Trupp",
    locations: "Hauptsitz, Einflussbereich oder mobile Operationsorte",
    leader: "Führung oder Rat",
    symbol: "Wappen, Zeichen, Farbe oder Banner",
    patronDeities: "Patrongottheiten, Ideale oder Schutzmächte",
    affiliation: "Übergeordnete Organisation, Haus, Reich oder Fraktion",
    memberStrength: "Mitgliederstärke oder grobe Größenordnung",
    reputation: "Ruf, Legenden, bekannte Vorurteile",
    classes: "typische Professionen, Rollen oder Fähigkeiten",
    founding: "Gruendungsjahr oder Entstehungszeitraum",
    duty: "Dienst, Auftrag oder gesellschaftliche Funktion",
    allies: "Verbündete, Förderer oder Schutzpatrone",
    enemies: "Feinde, Rivalen oder geächtete Gruppen",
    goal: "Kurzfristiges und langfristiges Ziel",
  },

  sections: {
    overview: "Kurzüberblick: Wofür steht diese Gruppe, warum kennt man sie und welche Stimmung soll sie am Spieltisch erzeugen?",
    history: "Entstehung, Gruender, Wendepunkte, Krisen, Spaltungen und wichtige Erfolge.",
    organization: "Innere Ordnung, Führungsmodell, Ränge, Befehlswege, Abstimmungen, Schwüre und Sanktionen.",
    membership: "Wer darf beitreten, wie wird rekrutiert, welche Prüfungen gibt es und was kostet die Zugehörigkeit?",
    duties: "Aufgabenbereich, Leistungen, Pflichten, Dienste, Rechte und typische Aufträge.",
    domains: "Domänen, Standorte, Einflusszonen, Niederlassungen, geheime Treffpunkte und Ressourcen.",
    locations: "Standorte, Hauptsitze, Aussenposten, mobile Lager, geheime Treffpunkte und Einflussorte.",
    politics: "Beziehungen, politische Rolle, Bündnisse, Rivalitäten, offene Konflikte und Abhängigkeiten.",
    leadership: "Führungspersonen, Stellvertreter, Ämter, Ratgeber und operative Befehlshaber.",
  },

  hierarchyTable: [
    { level: "Übergeordnete Einheit", name: "Name", role: "Gilde / Orden / Organisation", notes: "Optionaler Link oder Kontext" },
    { level: "Untergruppe", name: "Name", role: "Banner / Kompanie / Zirkel", notes: "Optionaler Link oder Kontext" },
    { level: "Trupp", name: "Name", role: "Zehnerschaft / Zelle / Einsatzgruppe", notes: "Optionaler Link oder Kontext" },
  ],

  leadership: [
    { office: "Führung", name: "Name", rank: "Titel", responsibility: "Gesamtleitung, politische Richtung, letzte Entscheidung" },
    { office: "Stellvertretung", name: "Name", rank: "Titel", responsibility: "Vertretung, Tagesgeschäft, Koordination" },
    { office: "Amt / Rolle", name: "Name", rank: "Titel", responsibility: "Verwaltung, Ausbildung, Versorgung oder Spionage" },
  ],

  members: [
    { name: "Name", role: "Rolle", rank: "Rang", status: "aktiv", note: "Kurzbeschreibung oder Link" },
    { name: "Name", role: "Rolle", rank: "Rang", status: "aktiv", note: "Kurzbeschreibung oder Link" },
    { name: "Name", role: "Rolle", rank: "Rang", status: "unbekannt", note: "Kurzbeschreibung oder Link" },
  ],

  trivia: [
    "...",
    "...",
    "...",
  ],
};
