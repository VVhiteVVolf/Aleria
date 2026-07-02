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
      localStoragePrefixes: [
        "aleria:gruppen:inline-content:v1:gruppen-vorlage",
        "aleria:gruppen:comments:v1:gruppen-vorlage",
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
    groupType: "Gilde / Orden / Organisation / Kult / Banner / Trupp",
    locations: "Hauptsitz, Einflussbereich oder mobile Operationsorte",
    leader: "Fuehrung oder Rat",
    symbol: "Wappen, Zeichen, Farbe oder Banner",
    patronDeities: "Patrongottheiten, Ideale oder Schutzmaechte",
    affiliation: "Uebergeordnete Organisation, Haus, Reich oder Fraktion",
    memberStrength: "Mitgliederstaerke oder grobe Groessenordnung",
    reputation: "Ruf, Legenden, bekannte Vorurteile",
    classes: "typische Professionen, Rollen oder Faehigkeiten",
    founding: "Gruendungsjahr oder Entstehungszeitraum",
    duty: "Dienst, Auftrag oder gesellschaftliche Funktion",
    allies: "Verbuendete, Foerderer oder Schutzpatrone",
    enemies: "Feinde, Rivalen oder geaechtete Gruppen",
    goal: "Kurzfristiges und langfristiges Ziel",
  },

  sections: {
    overview: "Kurzueberblick: Wofuer steht diese Gruppe, warum kennt man sie und welche Stimmung soll sie am Spieltisch erzeugen?",
    history: "Entstehung, Gruender, Wendepunkte, Krisen, Spaltungen und wichtige Erfolge.",
    organization: "Innere Ordnung, Fuehrungsmodell, Raenge, Befehlswege, Abstimmungen, Schwuere und Sanktionen.",
    membership: "Wer darf beitreten, wie wird rekrutiert, welche Pruefungen gibt es und was kostet die Zugehoerigkeit?",
    duties: "Aufgabenbereich, Leistungen, Pflichten, Dienste, Rechte und typische Auftraege.",
    domains: "Domaenen, Standorte, Einflusszonen, Niederlassungen, geheime Treffpunkte und Ressourcen.",
    locations: "Standorte, Hauptsitze, Aussenposten, mobile Lager, geheime Treffpunkte und Einflussorte.",
    politics: "Beziehungen, politische Rolle, Buendnisse, Rivalitaeten, offene Konflikte und Abhaengigkeiten.",
    leadership: "Fuehrungspersonen, Stellvertreter, Aemter, Ratgeber und operative Befehlshaber.",
  },

  hierarchyTable: [
    { level: "Uebergeordnete Einheit", name: "Name", role: "Gilde / Orden / Organisation", notes: "Optionaler Link oder Kontext" },
    { level: "Untergruppe", name: "Name", role: "Banner / Kompanie / Zirkel", notes: "Optionaler Link oder Kontext" },
    { level: "Trupp", name: "Name", role: "Zehnerschaft / Zelle / Einsatzgruppe", notes: "Optionaler Link oder Kontext" },
  ],

  leadership: [
    { office: "Fuehrung", name: "Name", rank: "Titel", responsibility: "Gesamtleitung, politische Richtung, letzte Entscheidung" },
    { office: "Stellvertretung", name: "Name", rank: "Titel", responsibility: "Vertretung, Tagesgeschaeft, Koordination" },
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
