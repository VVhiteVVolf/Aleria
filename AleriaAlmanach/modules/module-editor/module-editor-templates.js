function inferModulePageType(page) {
  return getModuleTemplateForPage(page)?.pageType || 'standard';
}

function getPageImageStyle(page) {
  if (page?.imageSquare) return 'square';
  if (page?.imageLandscape) return 'landscape';
  if (page?.imageSemiLandscape) return 'semi';
  if (page?.imageTall) return 'tall';
  return 'default';
}

function createDefaultModulePage(index = 0) {
  const roman = ['I.', 'II.', 'III.', 'IV.', 'V.', 'VI.', 'VII.', 'VIII.', 'IX.', 'X.'];
  return {
    pageTitle: `${roman[index] || `Seite ${index + 1}`} — Neue Seite`,
    image: '',
    imageWidth: 38,
    description: 'Hier steht ein Beispieltext für die neue Seite. Ersetze ihn direkt im Modul mit deiner eigenen Beschreibung.',
    stats: [['Beispiel', 'Hier kann eine Info-Tabelle stehen']],
    commentDivider: true,
    commentSequence: [
      { narrator: true, text: 'Ein kurzer Erzählertext kann hier den Ton der Seite setzen.' },
      {
        narrator: false,
        side: 'left',
        name: ANNA.name,
        title: ANNA.title,
        portrait: getPrimaryAvatar(ANNA, 'freundlich') || '',
        text: 'Hier steht ein Beispielkommentar. Du kannst ihn direkt bearbeiten, ersetzen oder löschen.'
      }
    ],
  };
}

function getRomanPageLabel(index = 0) {
  const roman = ['I.', 'II.', 'III.', 'IV.', 'V.', 'VI.', 'VII.', 'VIII.', 'IX.', 'X.'];
  return roman[index] || `Seite ${index + 1}`;
}

function createDefaultProfileCard(index = 0) {
  return {
    img: '',
    name: index === 0 ? 'Name des Charakters' : `Charakter ${index + 1}`,
    role: 'Rolle / Titel',
    banner: 'Charakterprofil',
    stamp: '',
    note: 'Kurzer Text, Zitat oder Einschätzung.',
    fields: [
      ['Status', 'Noch festlegen'],
      ['Aufenthalt', 'Noch festlegen'],
      ['Bekannt', 'Noch festlegen']
    ]
  };
}

function createDefaultWantedCard(index = 0) {
  return {
    img: '',
    name: index === 0 ? 'Name des Gesuchten' : `Gesuchter ${index + 1}`,
    role: 'Rolle',
    status: 'Gesucht',
    kopfgeld: 'Noch festlegen',
    letzter: 'Unbekannt',
    bekannt: 'Noch festlegen',
    egon: '',
    link: ''
  };
}

function createDefaultProfilePage(index = 0) {
  return {
    pageTitle: `${getRomanPageLabel(index)} — Charakterprofile`,
    image: '',
    profilePage: true,
    profileBackground: '',
    profileTitle: '✦ — Charakterprofile — ✦',
    profiles: [
      createDefaultProfileCard(0),
      createDefaultProfileCard(1),
      createDefaultProfileCard(2)
    ]
  };
}

function createDefaultWantedPage(index = 0) {
  return {
    pageTitle: `${getRomanPageLabel(index)} — Kopfgeldtafel`,
    image: '',
    wantedPage: true,
    wantedBackground: '',
    wanted: [
      createDefaultWantedCard(0),
      createDefaultWantedCard(1),
      createDefaultWantedCard(2)
    ],
    description: '',
    stats: []
  };
}

function createDefaultArtifactPage(index = 0) {
  return {
    pageTitle: `${getRomanPageLabel(index)} — Artefaktakte`,
    image: '',
    imageWidth: 38,
    artifactPage: true,
    description: 'Beschreibe Erscheinung, Material, Herkunft und erste Beobachtungen dieses Artefakts.',
    stats: [
      ['Art', 'Magisches Artefakt'],
      ['Status', 'Unter Beobachtung'],
      ['Gefahrenstufe', 'Noch festlegen']
    ],
    quote: 'Manche Dinge wollen nicht gefunden werden.',
    quoteBy: '— Archivnotiz',
    artifact: {
      archiveLabel: 'Artefaktakte',
      classification: 'Unklassifiziert',
      origin: 'Herkunft unbekannt',
      condition: 'Stabil, aber ungetestet',
      keeper: 'Archiv / Verwahrung noch festlegen',
      discovery: 'Fundort und Umstände der Entdeckung eintragen.',
      propertiesTitle: 'Eigenschaften',
      properties: [
        'Reagiert auf Berührung oder Nähe.',
        'Zeigt Spuren alter Verzauberung.'
      ],
      risksTitle: 'Risiken & Nebenwirkungen',
      risks: [
        'Nicht ohne Schutzmaßnahmen aktivieren.',
        'Wirkung auf Träger oder Umgebung unbekannt.'
      ],
      historyTitle: 'Geschichte',
      historyText: 'Was ist über frühere Besitzer, Einsätze oder Legenden bekannt?',
      footer: 'Almanach-Archiv · Artefaktprüfung'
    }
  };
}

function createDefaultRecipePage(index = 0) {
  return {
    pageTitle: `${getRomanPageLabel(index)} — Rezeptur & Ritual`,
    image: '',
    imageWidth: 34,
    recipePage: true,
    description: 'Dokumentiere Zweck, Hintergrund und Besonderheiten dieser Rezeptur oder dieses Rituals.',
    stats: [
      ['Schwierigkeit', 'Mittel'],
      ['Dauer', '45 Min.'],
      ['Ergebnis', '1 Anwendung']
    ],
    quote: 'Ein sauberer Ablauf ist oft mächtiger als rohe Kraft.',
    quoteBy: '— Meisterliche Randnotiz',
    recipe: {
      archiveLabel: 'Alchemie · Ritualkunde · Rezept Nr. 1',
      documentKind: 'Rezeptur',
      category: 'Alchemie',
      difficulty: 'Mittel',
      duration: '45 Min.',
      result: '1 Fläschchen',
      effect: 'Stellt Kraft wieder her, reinigt Blut oder stabilisiert ein Ritualfeld.',
      ingredientsTitle: 'Zutaten',
      ingredients: [
        { icon: '', title: 'Blutmoos', amount: '2 Handvoll' },
        { icon: '', title: 'Silberdorn', amount: '1 Handvoll' },
        { icon: '', title: 'Quellwasser', amount: '500 ml' }
      ],
      equipmentTitle: 'Benötigte Ausrüstung',
      equipment: [
        { icon: '', title: 'Mörser & Stößel' },
        { icon: '', title: 'Kupferkessel' },
        { icon: '', title: 'Glasfläschchen' }
      ],
      stepsTitle: 'Zubereitung / Ablauf',
      steps: [
        { icon: '', title: 'Kräuter zerkleinern', text: 'Zerreibe die Zutaten im Mörser, bis eine feine, feuchte Masse entsteht.', duration: '5 Min.', note: '' },
        { icon: '', title: 'Wasser erhitzen', text: 'Erhitze Quellwasser langsam, bis es leicht simmert.', duration: '10 Min.', note: 'Nicht überhitzen.' },
        { icon: '', title: 'Essenz binden', text: 'Gib die Masse hinzu und rühre dreimal im Uhrzeigersinn.', duration: '15 Min.', note: 'Leicht rühren.' }
      ],
      warningsTitle: 'Hinweise & Warnungen',
      warnings: [
        { icon: '', title: 'Nicht überhitzen', text: 'Die Wirkung kann sonst kippen oder sich abschwächen.' }
      ],
      propertiesTitle: 'Eigenschaften',
      properties: [
        { icon: '', title: 'Heilung', value: '++' },
        { icon: '', title: 'Stabilisierung', value: '+' }
      ],
      variantsTitle: 'Varianten',
      variants: [
        { icon: '', title: 'Standardrezept', description: 'Ausgewogene Wirkung ohne Nebenwirkungen.', additions: '-', effect: 'Stabile, vorhersehbare Wirkung.' }
      ],
      masterNoteTitle: 'Notizen des Meisters',
      masterNote: 'Besonders wirksam, wenn die Zutaten frisch verarbeitet werden.',
      footer: 'Almanach-Archiv · Rezepturen & Rituale'
    }
  };
}

function createDefaultTournamentData(size = 16) {
  const bracketSize = normalizeTournamentSize(size);
  return sanitizeTournamentData({
    bracketSize,
    host: 'Haus Draig',
    organizer: 'Ser Albrecht von Caer Draig',
    location: 'Caer Draig',
    date: 'Noch festlegen',
    rules: 'Vollkontakt - keine Gnade',
    participantSummary: `${bracketSize} Ritter und Kämpfer`,
    heraldName: 'Kommentar des Herolds',
    heraldText: 'Was für ein Turnier! Setze hier die Einschätzung des Herolds ein.',
    highlights: [
      'Sensationeller Sieg eines Außenseiters.',
      'Ein langer Zweikampf entscheidet die Runde.',
      'Das Publikum reagiert auf eine unerwartete Wendung.'
    ],
    prizes: [
      'Sieger: Gold, Ehrenmantel oder Waffe',
      'Zweiter Platz: Silber und Anerkennung',
      'Teilnehmer: Erinnerungssiegel des Turniers'
    ],
    candidates: [
      { name: 'Favorit des Turniers', detail: 'Quote oder Einschätzung', image: '', marker: '↑' },
      { name: 'Gefährlicher Herausforderer', detail: 'Quote oder Einschätzung', image: '', marker: '↓' }
    ],
    injuries: [
      { name: 'Name', detail: 'Ausgeschieden / Verletzung', image: '', marker: '!' }
    ],
    participants: Array.from({ length: bracketSize }, (_, index) => ({
      name: `Teilnehmer ${index + 1}`,
      title: 'Ritter / Kämpfer',
      house: 'Haus / Herkunft',
      avatar: '',
      crest: '',
      marks: ''
    }))
  });
}

function createDefaultTournamentPage(index = 0, size = 16) {
  return {
    pageTitle: `${getRomanPageLabel(index)} — Turnierbaum`,
    image: '',
    tournamentPage: true,
    tournament: createDefaultTournamentData(size)
  };
}

function createDefaultTournamentLeaguePage(index = 0) {
  return {
    pageTitle: `${getRomanPageLabel(index)} — Turnierregister`,
    image: '',
    tournamentLeaguePage: true,
    description: 'Offizielles Register der Rangliste, Begegnungen und Geruechte des Turniers.',
    tournamentLeague: {
      archiveLabel: 'Grosses Turnierregister des Hauses Draig',
      season: 'Saison des Gruenen Drachen',
      cycle: 'Jahreslauf 1189',
      round: 'Runde 7 von 17',
      nextDate: 'Naechster Spieltag: 12. Mai 1189',
      rulesLabel: 'Turnierregeln',
      tableTitle: 'Rangliste der Ritter',
      tableHeaders: {
        rank: 'Rang',
        crest: 'Wappen',
        knight: 'Ritter',
        house: 'Haus',
        wins: 'Siege',
        hits: 'Treffer',
        honor: 'Ehrpunkte',
        glory: 'Ruhm',
        status: 'Status'
      },
      matchupTitle: 'Naechste Begegnungen - Runde 7',
      matchupVersusLabel: 'VS.',
      registeredNote: 'Es sind 34 Ritter im Turnier registriert.',
      featuredTitle: 'Ritter der Woche',
      featuredName: 'Sir Garric Draig',
      featuredPortrait: '',
      featuredCrest: '',
      featuredComment: 'Drei ueberzeugende Siege in Folge brachten Sir Garric an die Spitze der Rangliste.',
      combatTypesTitle: 'Kampfarten',
      combatTypes: [
        { title: 'Lanzenstechen', text: 'Einzelduell zu Pferd', icon: '', meta: 'Lanze' },
        { title: 'Schwertduell', text: 'Kampf im abgesteckten Ring', icon: '', meta: 'Schwert' },
        { title: 'Bogenschiessen', text: 'Trefferwertung auf Distanz', icon: '', meta: 'Bogen' }
      ],
      rumorsTitle: 'Geruechte aus dem Lager',
      rumors: [
        { title: 'Haus Vael', text: 'Ein Richter soll heimlich bestochen worden sein.', icon: '', meta: '' }
      ],
      injuriesTitle: 'Verletzte & Abwesende',
      injuries: [
        { title: 'Sir Cedric de Morte', text: 'Gebrochene Rippe. Voraussichtlich zwei Runden ausgesetzt.', icon: '', meta: '8' }
      ],
      topHitsTitle: 'Beste Treffer',
      topHits: [
        { title: 'Sir Garric Draig', text: '23 Treffer', icon: '', meta: '1.' },
        { title: 'Sir Owain Gwynn', text: '21 Treffer', icon: '', meta: '2.' },
        { title: 'Sir Aeddan Morryn', text: '19 Treffer', icon: '', meta: '3.' }
      ],
      weatherTitle: 'Wetter in Wellenruh',
      weatherText: 'Leichter Regen. Boden weich und rutschig, Pferde ermueden schneller.',
      locationTitle: 'Turnierplatz',
      locationImage: '',
      chronicleTitle: 'Chronik des Turniers',
      chronicle: [
        { title: 'Runde 6 abgeschlossen', text: 'Sir Garric Draig erringt seinen dritten Sieg in Folge.', icon: '', meta: '8. Mai 1189' },
        { title: 'Schwerer Sturz', text: 'Sir Cedric de Morte stuerzt nach einem Treffer.', icon: '', meta: '8. Mai 1189' },
        { title: 'Protest eingereicht', text: 'Haus Vael legt Einspruch gegen die Wertung ein.', icon: '', meta: '7. Mai 1189' }
      ],
      standings: [
        { rank: '1', crest: '', knight: 'Sir Garric Draig', house: 'Haus Draig', wins: '5', hits: '23', honor: '28', glory: '152', status: 'Aktiv' },
        { rank: '2', crest: '', knight: 'Sir Aeddan Morryn', house: 'Haus Morryn', wins: '5', hits: '19', honor: '26', glory: '138', status: 'Aktiv' },
        { rank: '3', crest: '', knight: 'Sir Owain Gwynn', house: 'Haus Gwynn', wins: '4', hits: '21', honor: '23', glory: '133', status: 'Aktiv' },
        { rank: '4', crest: '', knight: 'Sir Halwen Fernock', house: 'Haus Fernock', wins: '4', hits: '18', honor: '22', glory: '121', status: 'Aktiv' },
        { rank: '5', crest: '', knight: 'Sir Cedric de Morte', house: 'Haus de Morte', wins: '3', hits: '12', honor: '15', glory: '85', status: 'Verletzt' }
      ],
      matchups: [
        { label: 'Erste Begegnung', time: '10:00', type: 'Lanzenstechen', leftName: 'Sir Lucian Vael', leftHouse: 'Haus Vael', leftPortrait: '', leftCrest: '', rightName: 'Sir Brann Kell', rightHouse: 'Haus Kell', rightPortrait: '', rightCrest: '' },
        { label: 'Zweite Begegnung', time: '12:30', type: 'Reitermelee', leftName: 'Sir Roderick Lyndal', leftHouse: 'Haus Lyndal', leftPortrait: '', leftCrest: '', rightName: 'Sir Halwen Fernock', rightHouse: 'Haus Fernock', rightPortrait: '', rightCrest: '' },
        { label: 'Dritte Begegnung', time: '15:00', type: 'Schwertduell', leftName: 'Sir Aeddan Morryn', leftHouse: 'Haus Morryn', leftPortrait: '', leftCrest: '', rightName: 'Sir Owain Gwynn', rightHouse: 'Haus Gwynn', rightPortrait: '', rightCrest: '' }
      ],
      footer: 'Almanach-Archiv · Turnierregister'
    }
  };
}

function createDefaultCastePage(index = 0) {
  return {
    pageTitle: `${getRomanPageLabel(index)} - Kaste / Klasse`,
    image: '',
    imageWidth: 34,
    castePage: true,
    description: 'Beschreibe Ursprung, Aufgabe, Selbstverstaendnis und gesellschaftliche Wirkung dieser Kaste oder Klasse.',
    caste: {
      archiveLabel: 'Kasten & Klassen',
      documentCode: 'Dokument Nr. KK-000',
      categoryLabel: 'Kaste / Klasse',
      headerSymbol: '',
      sealImage: '',
      bannerImage: '',
      backgroundImage: '',
      introTitle: 'Ueber diese Kaste',
      introText: 'Fasse in wenigen Saetzen zusammen, warum diese Gruppe existiert, wem sie dient und wodurch sie sich von anderen Staenden unterscheidet.',
      infoTitle: 'Allgemeine Informationen',
      infoRows: [
        { icon: '', label: 'Typ', value: 'Kulturelle Kaste' },
        { icon: '', label: 'Hauptsitz', value: 'Noch festlegen' },
        { icon: '', label: 'Einflussgebiet', value: 'Noch festlegen' },
        { icon: '', label: 'Anerkennung', value: 'Noch festlegen' },
        { icon: '', label: 'Mitglieder', value: 'Noch festlegen' },
        { icon: '', label: 'Ausrichtung', value: 'Neutral' }
      ],
      symbolsTitle: 'Symbolik',
      symbols: [
        { image: '', title: 'Das Zeichen', subtitle: 'Wappen / Symbol', detail: 'Bedeutung des wichtigsten Zeichens.' },
        { image: '', title: 'Die Farbe', subtitle: 'Tracht / Banner', detail: 'Welche Farben oder Materialien die Kaste repraesentieren.' },
        { image: '', title: 'Das Werkzeug', subtitle: 'Amtssymbol', detail: 'Objekt, Reliquie oder Insignie der Zugehoerigkeit.' }
      ],
      rolesTitle: 'Aufgaben & Rollen',
      roles: [
        { icon: '', title: 'Wahrung', text: 'Welche Pflicht oder welches Wissen diese Kaste bewahrt.' },
        { icon: '', title: 'Dienst', text: 'Wem die Kaste dient und in welcher Form.' },
        { icon: '', title: 'Lehre', text: 'Wie Mitglieder ausgebildet oder weitergegebenes Wissen gepflegt wird.' },
        { icon: '', title: 'Beratung', text: 'Welche Instanzen oder Personen auf diese Kaste hoeren.' }
      ],
      skillsTitle: 'Faehigkeiten & Kenntnisse',
      skills: [
        { icon: '', title: 'Fachwissen', text: 'Spezialisierte Kenntnis oder Disziplin.' },
        { icon: '', title: 'Ritual / Technik', text: 'Besondere Praxis, Kampfweise oder Handwerk.' },
        { icon: '', title: 'Einfluss', text: 'Soziale, religioese oder politische Wirkung.' }
      ],
      privilegesTitle: 'Privilegien',
      privileges: [
        { text: 'Zugang zu bestimmten Orten, Archiven oder Ressourcen.' },
        { text: 'Anerkennung durch Adel, Kirche, Orden oder Stadt.' },
        { text: 'Recht zum Tragen bestimmter Zeichen oder Insignien.' }
      ],
      restrictionsTitle: 'Einschraenkungen',
      restrictions: [
        { text: 'Eid, Geluebde oder Dienstpflicht.' },
        { text: 'Verbot bestimmter Handlungen, Magien oder Kontakte.' },
        { text: 'Aufnahmepruefung, Herkunftspflicht oder soziale Grenze.' }
      ],
      organizationTitle: 'Angehoerige & Organisation',
      organizationRows: [
        { label: 'Mitglieder', value: 'Noch festlegen' },
        { label: 'Raenge', value: 'Novize - Adept - Meister' },
        { label: 'Fuehrung', value: 'Noch festlegen' },
        { label: 'Niederlassungen', value: 'Noch festlegen' }
      ],
      representativesTitle: 'Bekannte Vertreter',
      representatives: [
        { portrait: '', crest: '', name: 'Name des Vertreters', title: 'Rang / Rolle', text: 'Kurze Einordnung dieser Person innerhalb der Kaste.' }
      ],
      relatedTitle: 'Verbundene Eintraege',
      relatedEntries: [
        { icon: '', label: 'Ort oder Institution', target: '' },
        { icon: '', label: 'Zugehoeriger Orden', target: '' },
        { icon: '', label: 'Wichtige Person', target: '' }
      ],
      quote: 'Ein Leitsatz dieser Kaste.',
      quoteBy: 'Ueberlieferung / Quelle',
      footer: 'Almanach-Archiv - Kasten & Klassen'
    }
  };
}

function createDefaultCourtPage(index = 0) {
  return {
    pageTitle: `${getRomanPageLabel(index)} - Gerichtsakte`,
    image: '',
    imageWidth: 36,
    courtPage: true,
    description: 'Diese Akte bereitet ein Verfahren vor. Sie sammelt Vorwurf, Beteiligte, Beweise, Zeugenaussagen und offene Fragen, ohne ein Urteil vorwegzunehmen.',
    court: sanitizeCourtData({
      archiveLabel: 'Gerichtsakte',
      caseNumber: 'OG-0000',
      courtName: 'Offenes Gericht',
      courtPlace: 'Noch festlegen',
      status: 'in Vorbereitung',
      statusTone: '',
      headerIcon: '',
      sealImage: '',
      bannerImage: '',
      backgroundImage: '',
      overviewTitle: 'Falluebersicht',
      overviewRows: [
        { icon: '', label: 'Tatbestand', value: 'Vorwurf oder Gegenstand des Verfahrens neutral beschreiben.', target: '' },
        { icon: '', label: 'Angeklagte', value: 'Noch festlegen', target: '' },
        { icon: '', label: 'Anklaeger', value: 'Noch festlegen', target: '' },
        { icon: '', label: 'Gericht', value: 'Offenes Gericht', target: '' },
        { icon: '', label: 'Verhandlungsort', value: 'Noch festlegen', target: '' },
        { icon: '', label: 'Zeitraum', value: 'Noch festlegen', target: '' }
      ],
      summaryTitle: 'Zusammenfassung des Falls',
      summaryText: 'Fasse zusammen, welche Vorwuerfe erhoben werden, welche Ereignisse zur Akte fuehrten und welche Punkte noch vorbereitet werden muessen. Keine Schuld feststellen, keine Bewertung vorwegnehmen.',
      chargesTitle: 'Anklagepunkte',
      charges: [
        { number: '1', title: 'Erster Anklagepunkt', text: 'Behaupteten Tatbestand neutral beschreiben.', target: '' },
        { number: '2', title: 'Zweiter Anklagepunkt', text: 'Weitere Behauptung oder Nebenaspekt eintragen.', target: '' }
      ],
      datesTitle: 'Wichtige Daten',
      dates: [
        { icon: '', label: 'Erste Meldung', value: 'Noch festlegen', note: 'Wann wurde der Fall bekannt?', target: '' },
        { icon: '', label: 'Sicherstellung', value: 'Noch festlegen', note: 'Wann wurden Beweise oder Dokumente aufgenommen?', target: '' },
        { icon: '', label: 'Ladung', value: 'Noch festlegen', note: 'Termin oder Frist fuer Beteiligte.', target: '' }
      ],
      partiesTitle: 'Beteiligte',
      parties: [
        { role: 'Anklaeger', name: 'Name des Anklaegers', title: 'Rolle / Amt', text: 'Vertretung der Anklage neutral einordnen.', portrait: '', crest: '', target: '' },
        { role: 'Angeklagte', name: 'Name der angeklagten Person', title: 'Rang / Herkunft', text: 'Status im Verfahren neutral beschreiben.', portrait: '', crest: '', target: '' },
        { role: 'Gericht', name: 'Name des Gerichts', title: 'Zustaendige Instanz', text: 'Zustaendigkeit oder Zusammensetzung eintragen.', portrait: '', crest: '', target: '' }
      ],
      evidenceTitle: 'Beweisstuecke',
      evidence: [
        { icon: '', title: 'Beweisstueck A', text: 'Beschreibung des Dokuments, Objekts oder Fundes.', date: 'Noch festlegen', location: 'Fundort offen', custodian: 'Verwahrung offen', status: 'protokolliert', target: '' },
        { icon: '', title: 'Beweisstueck B', text: 'Weiteres Beweisstueck ohne Bewertung beschreiben.', date: 'Noch festlegen', location: 'Fundort offen', custodian: 'Verwahrung offen', status: 'nachzureichen', target: '' }
      ],
      witnessesTitle: 'Zeugen',
      witnesses: [
        { portrait: '', name: 'Name des Zeugen', role: 'Zeuge / Sachverstaendiger', statement: 'Kurzfassung der Aussage oder des erwarteten Beitrags.', status: 'ausstehend', protection: '', target: '' },
        { portrait: '', name: 'Weitere Person', role: 'Zeuge', statement: 'Was diese Person beobachtet oder ausgesagt haben soll.', status: 'protokolliert', protection: '', target: '' }
      ],
      chronologyTitle: 'Chronologie',
      chronology: [
        { date: 'Noch festlegen', title: 'Vorfall gemeldet', text: 'Erste bekannte Meldung oder Ausloeser der Akte.', target: '' },
        { date: 'Noch festlegen', title: 'Beweise aufgenommen', text: 'Sicherstellung, Sichtung oder Uebergabe dokumentieren.', target: '' }
      ],
      openQuestionsTitle: 'Offene Fragen',
      openQuestions: [
        { icon: '', text: 'Welche Aussage muss noch protokolliert werden?', status: 'offen', target: '' },
        { icon: '', text: 'Welche Beweisstuecke muessen noch zugeordnet werden?', status: 'offen', target: '' }
      ],
      relatedTitle: 'Verknuepfte Eintraege',
      relatedEntries: [
        { icon: '', label: 'Personenprofil', detail: 'Angeklagte, Zeugen oder Ermittler', target: '' },
        { icon: '', label: 'Ort', detail: 'Tatort, Gerichtsort oder Fundort', target: '' },
        { icon: '', label: 'Dokument', detail: 'Brief, Protokoll oder Siegel', target: '' }
      ],
      noteTitle: 'Aktennotiz',
      noteText: 'Interne Notiz zur Vorbereitung. Auch hier neutral bleiben und keine Schuld feststellen.',
      footer: 'Almanach-Archiv - Gerichtsakten'
    })
  };
}

function createDefaultBountyFilePage(index = 0) {
  return {
    pageTitle: `${getRomanPageLabel(index)} - Kopfgeldakte`,
    image: '',
    bountyFilePage: true,
    description: 'Offizielle Fahndungsakte mit Tatvorwuerfen, Sichtungen, Verbindungen und Gefaehrlichkeitsprofil.',
    bountyFile: sanitizeBountyFileData({
      archiveTitle: 'Kopfgeld / Fahndungsakte',
      archiveSubtitle: 'Herausgegeben im Namen des Koenigreichs Cenyr',
      targetName: 'Darian Voss',
      aliases: 'Der Schattenfuchs - Voss der Graue - Nordwind',
      status: 'Gesucht',
      statusNote: 'Tot oder lebendig',
      threatLevel: 4,
      threatText: 'Aeusserst gefaehrlich',
      bountyAmount: '5.000',
      bountyCurrency: 'Goldtaler',
      handoverNote: 'Bei Festnahme dem naechstgelegenen Richter oder einem Vertreter der Krone uebergeben. Eigenmaechtiges Handeln auf eigene Gefahr.',
      charges: [
        { icon: '', title: 'Hochverrat gegen die Krone', text: '' },
        { icon: '', title: 'Raub & Ueberfall', text: '' },
        { icon: '', title: 'Mord & Totschlag', text: '' },
        { icon: '', title: 'Anstiftung zum Aufruhr', text: '' },
        { icon: '', title: 'Schmuggel von Schwarzmagie', text: '' }
      ],
      descriptionRows: [
        { label: 'Alter', value: '38-42 Jahre' },
        { label: 'Groesse', value: 'ca. 1,86 Schritt' },
        { label: 'Statur', value: 'Schlank, muskuloes' },
        { label: 'Haarfarbe', value: 'Dunkelbraun' },
        { label: 'Augenfarbe', value: 'Graugruen' }
      ],
      descriptionNote: 'Narbe ueber linker Augenbraue, Brandzeichen in Form eines Fuchses am rechten Schulterblatt.',
      companions: [
        { title: 'Marevan', subtitle: 'Ehem. Soeldner', text: 'Schwertkaempfer' },
        { title: 'Lissa Maev', subtitle: 'Kundschafterin', text: 'Bogenschuetzin' },
        { title: 'Torval', subtitle: 'Krieger', text: 'Helle Narbe am Kinn' }
      ],
      sightings: [
        { place: 'Nordwacht-Festung', date: '3. Rondra 1247', observer: 'Wache H. Perdan' },
        { place: 'Waldpass von Grelthor', date: '22. Praios 1247', observer: 'Haendler Jorim' },
        { place: 'Hafenstadt Valmora', date: '18. Praios 1247', observer: 'Matrose R. Felan' },
        { place: 'Ruinen von Drakemoor', date: '2. Ingerimm 1247', observer: 'Magerin E. Valmor' }
      ],
      factionName: 'Schattenbund',
      factionText: 'Anfuehrer der Schattenfuechse.',
      allies: [
        { title: 'Verbindungen zu Schmugglern', text: 'Valmora und Nordwacht.' }
      ],
      enemies: [
        { title: 'Ritterorden der Krone', text: 'Haendlergilde Valdorias, Magierzirkel von Cenyr.' }
      ],
      supporters: [
        { title: 'Sympathisanten', text: 'Nutzen Korruption und Bestechung in den Grenzprovinzen.' }
      ],
      dangerProfiles: [
        { icon: '', label: 'Kampfkraft', value: 5 },
        { icon: '', label: 'Einfluss', value: 4 },
        { icon: '', label: 'Magie', value: 2 },
        { icon: '', label: 'Fluchtgefahr', value: 5 },
        { icon: '', label: 'Brutalitaet', value: 5 }
      ],
      footer: 'Almanach-Archiv - Fahndungsakten'
    })
  };
}

function createDefaultBestiaryPage(index = 0) {
  return {
    pageTitle: `${getRomanPageLabel(index)} — Bestiarium`,
    image: '',
    bestiaryPage: true,
    description: 'Beschreibe Herkunft, Verhalten, Gefahrenlage und die wichtigsten Beobachtungen dieser Kreatur.',
    stats: [
      ['Heimat', 'Wälder, Gebirge, abgelegene Dörfer'],
      ['Aktivität', 'Nacht - besonders bei Vollmond'],
      ['Größe', 'ca. 2,40 - 3,10 Schritt'],
      ['Gefährlichkeit', 'Hoch'],
      ['Wiss. Status', 'Nicht klassifiziert']
    ],
    quote: 'Es ist nicht die Bestie, die wir fürchten sollten, sondern der Mensch, der sie hervorbringt.',
    quoteBy: '— Magister Olian',
    bestiary: {
      volume: 'BESTIARIUM · BAND II',
      chapter: 'Kreaturen & Gefahren',
      classification: 'Klasse: Gestaltwandler (Monstrum)',
      latinName: 'Lycanthropus ferox',
      backgroundImage: '',
      imageScale: 108,
      imageX: 50,
      imageY: 52,
      sideNote: 'Die Verwandlung beginnt meist in den Gliedmaßen, begleitet von starkem Schmerz.',
      authorNoteTitle: 'Anmerkungen des Verfassers',
      authorNote: 'Exemplarische Studie eines Werwolfs, gezeichnet nach der Untersuchung eines Kadavers.',
      anatomyTitle: 'Anatomie (bestialische Gestalt)',
      anatomy: [
        { number: '1', title: 'Nackenmuskulatur', detail: 'Überproportionale Stärke; trägt den Kopf unter Belastung.' },
        { number: '2', title: 'Schulterkamm', detail: 'Verstärkte Knochenplatten schützen vor Hieben.' },
        { number: '3', title: 'Kiefer & Gebiss', detail: 'Reißzähne bis zu sieben Finger lang.' },
        { number: '4', title: 'Brustkorb', detail: 'Erweitert sich stark und erhöht die Sauerstoffaufnahme.' }
      ],
      annotations: [
        { number: '1', x: 52, y: 18, text: 'Nacken und Schädelansatz' },
        { number: '2', x: 42, y: 30, text: 'Schulterkamm' },
        { number: '3', x: 76, y: 28, text: 'Kiefer und Gebiss' },
        { number: '4', x: 68, y: 46, text: 'Brustkorb' }
      ],
      weaknessesTitle: 'Beobachtete Schwächen',
      weaknesses: [
        'Silberwaffen verursachen tiefe Wunden.',
        'Eisenketten können Bewegungen einschränken.',
        'Feuer wirkt abstoßend.'
      ],
      quoteTitle: 'Zitat aus „Über die Verfluchten“',
      quotePortrait: '',
      footer: 'Akademie Cenyr · Abteilung für Naturkunde & Monstrologie'
    }
  };
}

function createDefaultQuestFilePage(index = 0) {
  return {
    pageTitle: `${getRomanPageLabel(index)} — Questakte`,
    image: '',
    imageWidth: 100,
    questFilePage: true,
    stats: [
      ['Status', 'Offen'],
      ['Region', 'Noch festlegen'],
      ['Dringlichkeit', 'Hoch'],
      ['Auftraggeber', 'Noch festlegen']
    ],
    questFile: {
      archiveLabel: 'Aufträge · Hauptquesten',
      confidentiality: 'Vertraulich. Nur für fähige und diskrete Ohren.',
      bannerImage: '',
      crestImage: '',
      clientName: 'Auftraggeber',
      clientTitle: 'Titel / Zugehörigkeit',
      clientPortrait: '',
      clientPortraitFormat: 'portrait',
      clientPortraitFit: 'cover',
      clientPortraitPosition: 'top',
      clientPortraitSize: 72,
      clientNote: 'Persönliche Bitte, Warnung oder Schreiben des Auftraggebers.',
      sectionOneTitle: 'Auftragsbeschreibung',
      sectionOneText: 'Beschreibe, was geschehen ist, warum die Quest begonnen hat und was auf dem Spiel steht.',
      sectionTwoTitle: 'Hintergrund',
      sectionTwoText: 'Welche Vorgeschichte, Fraktionen, Orte oder Geheimnisse sind relevant?',
      sectionThreeTitle: 'Ziele',
      sectionThreeItems: [
        { title: 'Untersucht den ersten Hinweis.', detail: 'Kurzer Zusatz, wo oder bei wem begonnen werden kann.' },
        { title: 'Folgt der Spur.', detail: 'Nächster Schritt der Quest.' },
        { title: 'Trefft eine Entscheidung.', detail: 'Mögliche Konsequenzen oder Wahl.' }
      ],
      extraSections: [],
      contactsTitle: 'Zugehörige Charaktere',
      contacts: [
        { image: '', imageFormat: 'portrait', imageFit: 'cover', imagePosition: 'top', imageSize: 56, name: 'Kontaktperson', title: 'Rolle / Bezug zur Quest' }
      ],
      triviaTitle: 'Orte von Interesse',
      trivia: [
        { title: 'Ort', detail: 'Kurze Einordnung' }
      ],
      rewardsTitle: 'Belohnung',
      rewards: [
        { image: '', imageFormat: 'square', imageFit: 'contain', imagePosition: 'center', imageSize: 48, title: 'Gold', detail: 'Betrag oder Wert' },
        { image: '', imageFormat: 'square', imageFit: 'contain', imagePosition: 'center', imageSize: 48, title: 'Ansehen', detail: 'Fraktion oder Ort' }
      ],
      noteTitle: 'Notizen des Auftraggebers',
      note: 'Abschließende Notiz, Warnung oder persönlicher Zusatz.',
      sketchImage: '',
      footer: ''
    }
  };
}

function createDefaultSceneSessionPage(index = 0) {
  return {
    pageTitle: `${getRomanPageLabel(index)} — Interaktive Szene`,
    image: '',
    imageWidth: 36,
    sessionPage: true,
    sessionIntro: 'Einleitung der Szene. Beschreibe Ort, Anlass und Stimmung. Der eigentliche Szenenverlauf entsteht später über Kommentare.',
    sessionHint: 'Führe diese Szene als Kommentar fort.',
    sessionEmptyTitle: 'Die Szene ist offen',
    sessionEmptyText: 'Hier kann die Szene im fertigen Modus beginnen.'
  };
}

function createDefaultHierarchyPage(index = 0) {
  return {
    pageTitle: `${getRomanPageLabel(index)} — Hierarchie`,
    image: '',
    hierarchyPage: true,
    hierarchy: {
      layoutMode: 'vertical',
      treeDisplayMode: 'tabs',
      cardFontScale: 92,
      portraitScale: 100,
      chartScale: 100,
      eyebrow: 'Hierarchie',
      subtitle: 'Organisationsstruktur der Gilde',
      centerLabel: 'Gilde der Wahrheitswaage',
      emblem: '',
      sideImage: '',
      organizationTitle: 'Gilde der Wahrheitswaage',
      motto: 'Wissen. Gerechtigkeit. Balance.',
      description: 'Die Gilde der Wahrheitswaage widmet sich der Aufzeichnung, Pruefung und Bewahrung von Gesetzen. Ihre Mitglieder sorgen fuer Recht und Ordnung und vertreten die Interessen der Gilde vor Krone und Gericht.',
      detailsTitle: 'Details',
      details: [
        { icon: '*', label: 'Gegruendet', value: 'Rondra 873' },
        { icon: '*', label: 'Hauptsitz', value: 'Valdoria' },
        { icon: '*', label: 'Zweck', value: 'Rechtspflege, Gesetzeskunde, Beratung der Krone' },
        { icon: '*', label: 'Mitglieder', value: '132 aktive Mitglieder' }
      ],
      quoteLabel: 'Wahrspruch',
      quote: 'Gerechtigkeit ist nicht das, was geschrieben steht, sondern das, was Bestand hat.',
      chartTitle: 'Aufbau & Raenge',
      chartIntro: 'Die Gilde ist in verschiedene Raenge und Aemter unterteilt. Jeder Rang traegt spezifische Verantwortung innerhalb der Hierarchie.',
      levels: [
        {
          label: '',
          nodes: [
            { portrait: '', title: 'Gildenmeister', subtitle: '', text: 'Oberhaupt der Gilde. Trifft finale Entscheidungen und vertritt die Gilde vor der Krone.' }
          ]
        },
        {
          label: '',
          nodes: [
            { portrait: '', title: 'Hoher Richter', subtitle: '', text: 'Leitet die Gerichtstaetigkeit der Gilde und spricht Urteile in wichtigen Faellen.' },
            { portrait: '', title: 'Siegelmeister', subtitle: '', text: 'Verantwortlich fuer die Beglaubigung von Dokumenten und das Gildensiegel.' },
            { portrait: '', title: 'Kanzler', subtitle: '', text: 'Verwaltet die Finanzen, Vertraege und diplomatischen Beziehungen der Gilde.' }
          ]
        },
        {
          label: '',
          nodes: [
            { portrait: '', title: 'Gerichtsschreiber', subtitle: '', text: 'Protokolliert Verhandlungen und fuehrt die Akten der Gerichtsprozesse.' },
            { portrait: '', title: 'Rechtspfleger', subtitle: '', text: 'Beraet Buerger in Rechtsfragen und unterstuetzt Anwaelte.' },
            { portrait: '', title: 'Urkundenwart', subtitle: '', text: 'Bewahrt wichtige Urkunden und Archive der Gilde sicher auf.' },
            { portrait: '', title: 'Bote der Gilde', subtitle: '', text: 'Ueberbringt Schreiben, Ladungen und offizielle Mitteilungen.' }
          ]
        },
        {
          label: '',
          nodes: [
            { portrait: '', title: 'Gesellen', subtitle: '', text: 'Fortgeschrittene Mitglieder, die feste Aufgaben uebernehmen und juengere Kraefte anleiten.' },
            { portrait: '', title: 'Lehrlinge', subtitle: '', text: 'Anwaerter der Gilde. Sie lernen Recht, Rhetorik, Aktenfuehrung und Grundsaetze des Dienstes.' }
          ]
        },
        {
          label: 'Unterdienste',
          nodes: [
            { portrait: '', title: 'Archivhelfer', subtitle: '', text: 'Ordnen Akten, bereiten Register vor und schuetzen die Bestandslisten der Gilde.' },
            { portrait: '', title: 'Schreiberlehrlinge', subtitle: '', text: 'Ueben Protokolle, Abschriften und das korrekte Formulieren offizieller Eingaben.' },
            { portrait: '', title: 'Botenlehrlinge', subtitle: '', text: 'Begleiten Boten der Gilde und lernen Routen, Siegelprotokolle und sichere Uebergaben.' }
          ]
        }
      ],
      footerNote: 'Raenge und Zustaendigkeiten koennen je nach Gildensatzung und Gildenordnung variieren.',
      backLabel: 'Zurueck zur Uebersicht',
      printLabel: 'Akte drucken'
    }
  };
}

function createDefaultFamilyPage(index = 0) {
  const { hierarchy: baseHierarchy, hierarchyPage: _baseHierarchyPage, ...base } = createDefaultHierarchyPage(index);
  const family = sanitizeFamilyData({
    ...baseHierarchy,
    eyebrow: 'Familie',
    subtitle: 'Stammbaum und Familienbindungen',
    centerLabel: 'Haus Pendragon',
    organizationTitle: 'Haus Pendragon',
    motto: 'Blut verpflichtet. Namen bleiben.',
    description: 'Diese Familienakte zeigt direkte Blutlinien, angeheiratete Personen, Affaeren, Bastarde, M\u00fcndel und erzwungene Bindungen. Parallele Verbindungslinien koennen Ehepartner, Geschwister, Vettern oder Sonderverhaeltnisse markieren.',
    detailsTitle: 'Familienakte',
    details: [
      { icon: '*', label: 'Haus', value: 'Haus Pendragon' },
      { icon: '*', label: 'Stammsitz', value: 'Noch festlegen' },
      { icon: '*', label: 'Hauptlinie', value: 'Direkte Blutlinie' },
      { icon: '*', label: 'Nebenlinien', value: 'Angeheiratete, Bastarde, M\u00fcndel' }
    ],
    quoteLabel: 'Hauswort',
    quote: 'Blut schafft Bande, doch Namen schaffen Pflicht.',
    chartTitle: 'Stammbaum & Beziehungen',
    chartIntro: 'Lege Generationen als Ebenen an. Personen auf derselben Ebene koennen parallel stehen; Verbindungslinien verbinden beliebige Karten ueber ihre Karten-ID.',
    treeDisplayMode: 'parallel',
    trees: [
      {
        label: 'Hauptlinie',
        levels: [
          {
            label: 'Grosselterngeneration',
            nodes: [
              { id: 'grossvater', familyType: 'direct', portrait: '', title: 'Grossvater des Hauses', subtitle: 'Direkte Linie', text: 'Ursprung der dargestellten Hauptlinie.' },
              { id: 'grossonkel', familyType: 'direct', portrait: '', title: 'Grossonkel', subtitle: 'Bruder des Grossvaters', text: 'Geschwister des Grossvaters, eigene Seitenlinie moeglich.' }
            ]
          },
          {
            label: 'Elterngeneration',
            nodes: [
              { id: 'vater', familyType: 'direct', portrait: '', title: 'Vater des Hauses', subtitle: 'Direkte Linie', parentIds: ['grossvater'], text: 'Oberhaupt oder Ursprung der dargestellten Linie.' },
              { id: 'mutter', familyType: 'married', portrait: '', title: 'Mutter des Hauses', subtitle: 'Angeheiratet', text: 'Ehepartnerin oder eingeheiratete Verbindung.' },
              { id: 'affaire', familyType: 'affair', portrait: '', title: 'Verborgene Affaire', subtitle: 'Affaire', text: 'Nicht offizielle Verbindung mit Einfluss auf die Linie.' }
            ]
          },
          {
            label: 'Kinder',
            nodes: [
              { id: 'erbe', familyType: 'direct', portrait: '', title: 'Rechtmaessiger Erbe', subtitle: 'Direktes Familienmitglied', parentIds: ['vater', 'mutter'], text: 'Traegt Namen, Anspruch und Hauptlinie weiter.' },
              { id: 'schwester', familyType: 'direct', portrait: '', title: 'Schwester des Erben', subtitle: 'Direktes Familienmitglied', parentIds: ['vater', 'mutter'], text: 'Geschwisterliche Parallelposition innerhalb der Generation.' },
              { id: 'bastard', familyType: 'bastard', portrait: '', title: 'Anerkannter Bastard', subtitle: 'Bastard', parentIds: ['vater', 'affaire'], text: 'Kind ausserhalb der offiziellen Ehe.' }
            ]
          },
          {
            label: 'Hausbindung',
            nodes: [
              { id: 'ehepartner', familyType: 'married', portrait: '', title: 'Ehepartner des Erben', subtitle: 'Angeheiratet', text: 'Politische oder private Eheverbindung.' },
              { id: 'muendel', familyType: 'ward', portrait: '', title: 'M\u00fcndel des Hauses', subtitle: 'M\u00fcndel', text: 'Unter Schutz oder Vormundschaft des Hauses.' },
              { id: 'schwager', familyType: 'married', portrait: '', title: 'Schwager des Erben', subtitle: 'Bruder der Ehefrau', text: 'Bruder des angeheirateten Ehepartners - Verschwaegerung, keine Blutsverwandtschaft.' },
              { id: 'erzwungen', familyType: 'forced', portrait: '', title: 'Erzwungene Bindung', subtitle: 'Erzwungen', text: 'Bindung durch Zwang, Vertrag oder Geiselstellung.' }
            ]
          }
        ],
        connections: [
          { from: 'grossvater', to: 'grossonkel', relationType: 'sibling', label: 'Geschwister' },
          { from: 'vater', to: 'mutter', relationType: 'spouse', label: 'Ehe' },
          { from: 'vater', to: 'affaire', relationType: 'affair', label: 'Affaire' },
          { from: 'erbe', to: 'schwester', relationType: 'sibling', label: 'Geschwister' },
          { from: 'erbe', to: 'ehepartner', relationType: 'spouse', label: 'Ehe' },
          { from: 'ehepartner', to: 'schwager', relationType: 'sibling', label: 'Geschwister' },
          { from: 'erbe', to: 'schwager', relationType: 'in-law', label: 'Schwager' },
          { from: 'bastard', to: 'muendel', relationType: 'cousin', label: 'Nebenlinie' }
        ]
      },
      {
        label: 'Nebenlinie',
        levels: [
          {
            label: 'Vetternlinie',
            nodes: [
              { id: 'vetter', familyType: 'direct', portrait: '', title: 'Vetter des Hauses', subtitle: 'Direktes Familienmitglied', text: 'Parallel gefuehrte Seitenlinie mit eigenem Anspruch.' },
              { id: 'angeheiratet-nebenlinie', familyType: 'married', portrait: '', title: 'Angeheiratete Nebenlinie', subtitle: 'Angeheiratet', text: 'Verbindet die Seitenlinie mit einem anderen Haus.' }
            ]
          },
          {
            label: 'Schutzverhaeltnis',
            nodes: [
              { id: 'muendel-nebenlinie', familyType: 'ward', portrait: '', title: 'M\u00fcndel der Nebenlinie', subtitle: 'M\u00fcndel', text: 'Steht unter Vormundschaft dieser Linie.' }
            ]
          }
        ],
        connections: [
          { from: 'vetter', to: 'angeheiratet-nebenlinie', relationType: 'spouse', label: 'Ehe' },
          { from: 'vetter', to: 'muendel-nebenlinie', relationType: 'ward', label: 'Schutz' }
        ]
      }
    ],
    footerNote: 'Familientypen faerben nur die Karten. Die eigentliche Beziehung wird ueber Beschreibung und Verbindungslinien gepflegt.'
  });

  return {
    ...base,
    pageTitle: `${getRomanPageLabel(index)} - Familie`,
    familyPage: true,
    family
  };
}

function createDefaultGoodsTablePage(index = 0) {
  return {
    pageTitle: `${getRomanPageLabel(index)} - Warenverzeichnis`,
    image: '',
    imageWidth: 38,
    goodsTablePage: true,
    goodsTable: sanitizeGoodsTableData({
      title: 'Warenverzeichnis',
      subtitle: 'Waren, Dienste & Angebote',
      location: 'Ort / Viertel / Markt',
      headerIcon: '',
      coinIcon: '',
      tableTitle: 'Alle Waren',
      categories: [
        { id: 'speisen', label: 'Speisen' },
        { id: 'getraenke', label: 'Getraenke' },
        { id: 'sonstiges', label: 'Sonstiges' }
      ],
      goods: [
        { image: '', name: 'Bauernbrot', kind: 'Speise', category: 'speisen', description: 'Rustikales Brot, saettigend und schlicht.', price: '2', availability: 'unbegrenzt' },
        { image: '', name: 'Kraeutertee', kind: 'Getraenk', category: 'getraenke', description: 'Warmer Aufguss aus lokalen Kraeutern.', price: '2', availability: '12' },
        { image: '', name: 'Reiseset', kind: 'Sonstiges', category: 'sonstiges', description: 'Einfaches Set fuer den Alltag unterwegs.', price: '8', availability: '5' }
      ],
      sideTitle: 'Ueber diesen Ort',
      sideImage: '',
      sideName: 'Name des Ladens oder Ortes',
      sideText: 'Beschreibe Betreiber, Angebot, Ruf und Atmosphaere dieses Ortes.',
      infoRows: [
        { icon: '*', label: 'Betreiber', value: 'Noch festlegen' },
        { icon: '*', label: 'Standort', value: 'Noch festlegen' },
        { icon: '*', label: 'Ruf', value: 'Noch festlegen' }
      ],
      offerTitle: 'Angebote',
      offerMeta: 'Aktuell',
      offers: [
        { image: '', name: 'Tagesware', price: '3' }
      ],
      noteTitle: 'Hinweis',
      noteText: 'Verfuegbarkeit, Preise und Besonderheiten koennen sich im Spielverlauf aendern.',
      footer: 'Almanach-Archiv - Warenregister'
    }),
    stats: [],
    commentDivider: false,
    commentSequence: []
  };
}

function createDefaultTradeCatalogPage(index = 0) {
  return {
    pageTitle: `${getRomanPageLabel(index)} - Handelsgut & Tiere`,
    image: '',
    imageWidth: 38,
    tradeCatalogPage: true,
    tradeCatalog: sanitizeTradeCatalogData({
      title: 'Handelsgut & Tiere',
      subtitle: 'Auswahl besonderer Tiere und Waren',
      headerIcon: '',
      noteIcon: '*',
      noteTitle: 'Alle Preise in Kupferstuecken (KS)',
      noteText: 'Preise koennen je nach Herkunft, Jahreszeit und Verfuegbarkeit variieren.',
      categories: [
        { id: 'tiere', label: 'Tiere' },
        { id: 'fahrzeuge', label: 'Fahrzeuge' },
        { id: 'ausruestung', label: 'Ausruestung' },
        { id: 'spezialwaren', label: 'Spezialwaren' }
      ],
      items: [
        {
          category: 'tiere',
          image: '',
          imageFormat: 'landscape',
          imageFit: 'cover',
          imagePosition: 'center',
          imageHeight: 240,
          badge: 'Empfohlen',
          title: 'Thordis',
          subtitle: 'Kriegspferd / Streittross',
          tags: ['Stark', 'Ausdauernd', 'Kampferprobt'],
          description: 'Thordis ist ein kraeftiger Streittross aus noerdlichen Zuchtlinien. Dieses Pferd ist fuer Ausdauer, Mut und Zuverlaessigkeit bekannt und bleibt auch in lauten Gefechten ruhig.',
          features: [
            { icon: '*', text: 'Erhoehte Tragkraft' },
            { icon: '*', text: 'Resistenz gegen Einschuechterung' },
            { icon: '*', text: 'Geeignet fuer schwere Ruestung' }
          ],
          origin: 'Nordpferde aus den Zuchtguten noerdlicher Marken.',
          usageTags: ['Kavallerie', 'Kampf'],
          priceFill: 35,
          priceMin: '800',
          priceMax: '2.000',
          currencyCode: 'KS',
          currencyLabel: 'Kupferstueck',
          currencyIcon: '*',
          conditions: 'Nur an vertrauenswuerdige Kundschaft.'
        },
        {
          category: 'tiere',
          image: '',
          imageFormat: 'landscape',
          imageFit: 'cover',
          imagePosition: 'center',
          imageHeight: 240,
          title: 'Skoll',
          subtitle: 'Grosser Kriegshund',
          tags: ['Wachsam', 'Furchterregend', 'Treu'],
          description: 'Ein aussergewoehnlicher Wach- und Kampfgefaehrte. Skoll braucht einen erfahrenen Halter mit ruhiger Hand und Wissen im Umgang mit grossen Tieren.',
          features: [
            { icon: '*', text: 'Hervorragender Geruchssinn' },
            { icon: '*', text: 'Einschuechternde Praesenz' },
            { icon: '*', text: 'Kaempft bis zum Tod fuer seinen Rudelfuehrer' }
          ],
          origin: 'Noerdliche Waelder.',
          usageTags: ['Wachdienst', 'Jagd', 'Kampf'],
          priceFill: 58,
          priceMin: '1.500',
          priceMax: '5.000',
          currencyCode: 'KS',
          currencyLabel: 'Kupferstueck',
          currencyIcon: '*',
          conditions: 'Nur fuer erfahrene Hundefuehrer. Haltungsbedingungen sind verbindlich einzuhalten.'
        },
        {
          category: 'fahrzeuge',
          image: '',
          imageFormat: 'landscape',
          imageFit: 'cover',
          imagePosition: 'center',
          imageHeight: 240,
          title: 'Reisewagen "Valmora"',
          subtitle: 'Grosser Planen- und Wohnwagen',
          tags: ['Robust', 'Vielseitig', 'Langstrecke'],
          description: 'Dieser geraeumige Reise- und Handelswagen bietet Platz fuer Waren, Ausruestung und bis zu vier Personen. Die stabile Konstruktion ist fuer lange Reisen geeignet.',
          features: [
            { icon: '*', text: 'Platz fuer Waren und Reisende' },
            { icon: '*', text: 'Wetterfestes Dach und abschliessbare Truhe' },
            { icon: '*', text: 'Geeignet fuer Zugtiere' }
          ],
          origin: 'Werkstaetten grosser Handelsstaedte.',
          usageTags: ['Transport', 'Reisen', 'Handel'],
          priceFill: 78,
          priceMin: '2.000',
          priceMax: '8.000',
          currencyCode: 'KS',
          currencyLabel: 'Kupferstueck',
          currencyIcon: '*',
          conditions: 'Anzahlung empfohlen. Lieferzeit und Sonderanfertigungen nach Absprache.'
        }
      ],
      footerCards: [],
      advisorTitle: '',
      advisorText: '',
      advisorImage: ''
    }),
    stats: [],
    commentDivider: false,
    commentSequence: []
  };
}

function createDefaultMapTemplatePage(index = 0) {
  return {
    pageTitle: `${getRomanPageLabel(index)} - KartenTemplate`,
    image: '',
    imageWidth: 100,
    mapTemplatePage: true,
    mapTemplate: sanitizeMapTemplateData({
      tabs: [
        {
          label: 'Karte I',
          image: '',
          imageLink: '',
          imageFormat: 'free',
          imageFit: 'contain',
          imagePosition: 'center',
          imageScale: 100
        },
        {
          label: 'Karte II',
          image: '',
          imageLink: '',
          imageFormat: 'free',
          imageFit: 'contain',
          imagePosition: 'center',
          imageScale: 100
        },
        {
          label: 'Karte III',
          image: '',
          imageLink: '',
          imageFormat: 'free',
          imageFit: 'contain',
          imagePosition: 'center',
          imageScale: 100
        }
      ],
      sections: [
        { title: 'Ort', text: 'Kurze Einordnung der Karte.' },
        { title: 'Markierungen', text: 'Wichtige Punkte, Ebenen oder Legende.' },
        { title: 'Verlinkung', text: 'Hinweis, wohin ein Klick auf die Karte fuehrt.' }
      ]
    }),
    stats: [],
    commentDivider: false,
    commentSequence: []
  };
}

const MODULE_TEMPLATE_REGISTRY = {
  story: {
    id: 'story',
    pageType: 'standard',
    label: 'Standard / Story',
    pageLabel: 'Standard / Story',
    defaultTitle: 'Neues Story-Modul',
    defaultSubtitle: 'Erzählerischer Almanach-Eintrag',
    entryType: 'Story',
    createPages: () => createStoryTemplatePages(),
    createPage: index => createDefaultModulePage(index)
  },
  profiles: {
    id: 'profiles',
    pageType: 'profiles',
    pageAliases: ['profile'],
    pageFlag: 'profilePage',
    label: 'Charakterprofil - Template',
    pageLabel: 'Charakterprofil - Template',
    defaultTitle: 'Neues Charakterprofil',
    defaultSubtitle: 'Charakterprofil, Rollen und Aktennotizen',
    entryType: 'Charakterprofil',
    createPages: () => createProfileTemplatePages(),
    createPage: index => createDefaultProfilePage(index),
    buildEditorFields: page => buildProfilesModuleEditorFields(page),
    collectEditorPage: (card, page) => collectProfilesModuleEditorPage(card, page),
    renderPage: (page, entry, pageIndex, total) => buildProfilesPage(page, entry, pageIndex, total),
    renderInlinePage: (page, entry, pageIndex, total) => buildInlineComplexTemplatePage(page, entry, pageIndex, total, 'profiles')
  },
  wanted: {
    id: 'wanted',
    pageType: 'wanted',
    pageFlag: 'wantedPage',
    label: 'Kopfgeld - Template',
    pageLabel: 'Kopfgeld - Template',
    defaultTitle: 'Neue Kopfgeldtafel',
    defaultSubtitle: 'Kopfgeldtafel, Status und Fahndungsnotizen',
    entryType: 'Kopfgeld',
    createPages: () => createWantedTemplatePages(),
    createPage: index => createDefaultWantedPage(index),
    buildEditorFields: page => buildWantedModuleEditorFields(page),
    collectEditorPage: (card, page) => collectWantedModuleEditorPage(card, page),
    renderPage: (page, entry, pageIndex, total) => buildWantedPage(page, entry, pageIndex, total),
    renderInlinePage: (page, entry, pageIndex, total) => buildInlineComplexTemplatePage(page, entry, pageIndex, total, 'wanted')
  },
  'character-inventory': {
    id: 'character-inventory',
    pageType: 'character-inventory',
    pageFlag: 'characterInventoryPage',
    label: 'Charakter-Inventar - Template',
    pageLabel: 'Charakter-Inventar',
    defaultTitle: 'Neues Charakter-Inventar',
    defaultSubtitle: 'Ausrustung, Gegenstaende und Gefaehrten',
    entryType: 'Charakter-Inventar',
    typeMatchers: ['charakter-inventar', 'inventar', 'ausruestung', 'gefaehrten'],
    createPages: () => [createDefaultCharacterInventoryPage(0)],
    createPage: index => createDefaultCharacterInventoryPage(index),
    buildEditorFields: page => buildCharacterInventoryModuleEditorFields(page),
    collectEditorPage: (card, page) => collectCharacterInventoryModuleEditorPage(card, page),
    renderPage: (page, entry, pageIndex, total) => buildCharacterInventoryPage(page, entry, pageIndex, total),
    renderInlinePage: (page, entry, pageIndex, total) => buildInlineComplexTemplatePage(page, entry, pageIndex, total, 'character-inventory')
  },
  'guest-register': {
    id: 'guest-register',
    pageType: 'guest-register',
    pageFlag: 'guestRegisterPage',
    label: 'Gästeverzeichnis - Template',
    pageLabel: 'Gästeverzeichnis',
    defaultTitle: 'Neues Gästeverzeichnis',
    defaultSubtitle: 'Gäste, Zimmer und Aufenthalte',
    entryType: 'Gästeverzeichnis',
    typeMatchers: ['gaesteverzeichnis', 'gaeste', 'gaesteakte', 'gasthaus', 'taverne', 'burggaeste', 'unterkunft'],
    createPages: () => [createDefaultGuestRegisterPage(0)],
    createPage: index => createDefaultGuestRegisterPage(index),
    buildEditorFields: page => buildGuestRegisterModuleEditorFields(page),
    collectEditorPage: (card, page) => collectGuestRegisterModuleEditorPage(card, page),
    renderPage: (page, entry, pageIndex, total) => buildGuestRegisterPage(page, entry, pageIndex, total),
    renderInlinePage: (page, entry, pageIndex, total) => buildInlineComplexTemplatePage(page, entry, pageIndex, total, 'guest-register')
  },
  'bounty-file': {
    id: 'bounty-file',
    pageType: 'bounty-file',
    pageFlag: 'bountyFilePage',
    label: 'Kopfgeldakte - Template',
    pageLabel: 'Kopfgeldakte - Template',
    defaultTitle: 'Neue Kopfgeldakte',
    defaultSubtitle: 'Fahndungsakte, Tatvorwuerfe und Verbindungen',
    entryType: 'Kopfgeldakte',
    typeMatchers: ['kopfgeldakte', 'fahndungsakte', 'fahndung'],
    createPages: () => [createDefaultBountyFilePage(0)],
    createPage: index => createDefaultBountyFilePage(index),
    buildEditorFields: page => buildBountyFileModuleEditorFields(page),
    collectEditorPage: (card, page) => collectBountyFileModuleEditorPage(card, page),
    renderPage: (page, entry, pageIndex, total) => buildBountyFilePage(page, entry, pageIndex, total),
    renderInlinePage: (page, entry, pageIndex, total) => buildInlineComplexTemplatePage(page, entry, pageIndex, total, 'bounty-file')
  },
  goods: {
    id: 'goods',
    pageType: 'goods',
    pageFlag: 'goodsTablePage',
    label: 'Warenverzeichnis - Template',
    pageLabel: 'Warenverzeichnis - Template',
    defaultTitle: 'Neues Warenverzeichnis',
    defaultSubtitle: 'Waren, Dienste und Preise',
    entryType: 'Warenverzeichnis',
    typeMatchers: ['waren', 'warenverzeichnis', 'shop', 'laden', 'taverne', 'schmiede', 'markt'],
    createPages: () => [createDefaultGoodsTablePage(0)],
    createPage: index => createDefaultGoodsTablePage(index),
    buildEditorFields: page => buildGoodsModuleEditorFields(page),
    collectEditorPage: (card, page) => collectGoodsModuleEditorPage(card, page),
    renderPage: (page, entry, pageIndex, total) => buildGoodsTablePage(page, entry, pageIndex, total),
    renderInlinePage: (page, entry, pageIndex, total) => buildInlineComplexTemplatePage(page, entry, pageIndex, total, 'goods')
  },
  'trade-catalog': {
    id: 'trade-catalog',
    pageType: 'trade-catalog',
    pageFlag: 'tradeCatalogPage',
    label: 'Handelsgut & Tiere - Template',
    pageLabel: 'Handelsgut & Tiere - Template',
    defaultTitle: 'Neues Handelsgut-Register',
    defaultSubtitle: 'Tiere, Gueter und Sonderwaren',
    entryType: 'Handelsgut',
    typeMatchers: ['handelsgut', 'tiere', 'tierhandel', 'gueter', 'gueterverzeichnis', 'waren-alternativ'],
    createPages: () => [createDefaultTradeCatalogPage(0)],
    createPage: index => createDefaultTradeCatalogPage(index),
    buildEditorFields: page => buildTradeCatalogModuleEditorFields(page),
    collectEditorPage: (card, page) => collectTradeCatalogModuleEditorPage(card, page),
    renderPage: (page, entry, pageIndex, total) => buildTradeCatalogPage(page, entry, pageIndex, total),
    renderInlinePage: (page, entry, pageIndex, total) => buildInlineComplexTemplatePage(page, entry, pageIndex, total, 'trade-catalog')
  },
  'map-template': {
    id: 'map-template',
    pageType: 'map-template',
    pageFlag: 'mapTemplatePage',
    label: 'KartenTemplate',
    pageLabel: 'KartenTemplate',
    defaultTitle: 'Neues KartenTemplate',
    defaultSubtitle: 'Karten, Orte und verlinkte Uebersichten',
    entryType: 'KartenTemplate',
    typeMatchers: ['kartentemplate', 'karte', 'karten', 'stadtkarte', 'ortskarte', 'poi'],
    createPages: () => [createDefaultMapTemplatePage(0)],
    createPage: index => createDefaultMapTemplatePage(index),
    buildEditorFields: page => buildMapTemplateModuleEditorFields(page),
    collectEditorPage: (card, page) => collectMapTemplateModuleEditorPage(card, page),
    renderPage: (page, entry, pageIndex, total) => buildMapTemplatePage(page, entry, pageIndex, total),
    renderInlinePage: (page, entry, pageIndex, total) => buildInlineComplexTemplatePage(page, entry, pageIndex, total, 'map-template')
  },
  landing: {
    id: 'landing',
    pageType: 'landing',
    pageFlag: 'landingPage',
    label: 'Landing Page - Template',
    pageLabel: 'Landing Page - Template',
    defaultTitle: 'Neue Landing Page',
    defaultSubtitle: 'Gruppe, Quests, Notizen und Kartenuebersicht',
    entryType: 'Landing Page',
    typeMatchers: ['landing', 'dashboard', 'gruppenuebersicht', 'abenteureruebersicht'],
    createPages: () => [createDefaultLandingPage(0)],
    createPage: index => createDefaultLandingPage(index),
    buildEditorFields: page => buildLandingModuleEditorFields(page),
    collectEditorPage: (card, page) => collectLandingModuleEditorPage(card, page),
    renderPage: (page, entry, pageIndex, total) => buildLandingPage(page, entry, pageIndex, total),
    renderInlinePage: (page, entry, pageIndex, total) => buildInlineComplexTemplatePage(page, entry, pageIndex, total, 'landing')
  },
  artifact: {
    id: 'artifact',
    pageType: 'artifact',
    pageFlag: 'artifactPage',
    label: 'Artefaktakte - Template',
    pageLabel: 'Artefaktakte - Template',
    defaultTitle: 'Neue Artefaktakte',
    defaultSubtitle: 'Fund, Wirkung und Risiken eines besonderen Objekts',
    entryType: 'Artefakt',
    typeMatchers: ['artefakt', 'artifact'],
    createPages: () => [createDefaultArtifactPage(0)],
    createPage: index => createDefaultArtifactPage(index),
    buildEditorFields: page => buildArtifactModuleEditorFields(page),
    collectEditorPage: (card, page) => collectArtifactModuleEditorPage(card, page),
    renderPage: (page, entry, pageIndex, total) => buildArtifactPage(page, entry, pageIndex, total),
    renderInlinePage: (page, entry, pageIndex, total) => buildInlineComplexTemplatePage(page, entry, pageIndex, total, 'artifact')
  },
  recipe: {
    id: 'recipe',
    pageType: 'recipe',
    pageFlag: 'recipePage',
    label: 'Rezeptur & Ritual - Template',
    pageLabel: 'Rezeptur & Ritual - Template',
    defaultTitle: 'Neue Rezeptur',
    defaultSubtitle: 'Zutaten, Ausrüstung und Ablauf eines Vorgangs',
    entryType: 'Rezeptur / Ritual',
    typeMatchers: ['rezept', 'rezeptur', 'ritual'],
    createPages: () => [createDefaultRecipePage(0)],
    createPage: index => createDefaultRecipePage(index),
    buildEditorFields: page => buildRecipeModuleEditorFields(page),
    collectEditorPage: (card, page) => collectRecipeModuleEditorPage(card, page),
    renderPage: (page, entry, pageIndex, total) => buildRecipePage(page, entry, pageIndex, total),
    renderInlinePage: (page, entry, pageIndex, total) => buildInlineComplexTemplatePage(page, entry, pageIndex, total, 'recipe')
  },
  scene: {
    id: 'scene',
    pageType: 'scene',
    label: 'Abgeschlossenes Gespräch - Template',
    pageLabel: 'Abgeschlossenes Gespräch - Template',
    defaultTitle: 'Neues abgeschlossenes Gespräch',
    defaultSubtitle: 'Abgeschlossenes Gespräch als Almanach-Eintrag',
    entryType: 'Abgeschlossenes Gespräch',
    createPages: () => createSceneTemplatePages(),
    createPage: index => {
      const page = deepClone(createSceneTemplatePages()[0] || {});
      page.pageTitle = `${getRomanPageLabel(index)} — Gespräch`;
      return page;
    },
    matchesPage: page => Array.isArray(page?.sceneBlocks) && page.sceneBlocks.length,
    buildEditorFields: page => buildSceneModuleEditorFields(page),
    collectEditorPage: (card, page) => collectSceneModuleEditorPage(card, page),
    renderPage: (page, entry, pageIndex, total) => buildSceneBlocksPage(page, entry, pageIndex, total),
    renderInlinePage: (page, entry, pageIndex, total) => buildInlineComplexTemplatePage(page, entry, pageIndex, total, 'scene')
  },
  session: {
    id: 'session',
    pageType: 'session',
    pageFlag: 'sessionPage',
    label: 'Interaktive Szene - Template',
    pageLabel: 'Interaktive Szene - Template',
    defaultTitle: 'Neue interaktive Szene',
    defaultSubtitle: 'Interaktive Szene mit Kommentarfortsetzung',
    entryType: 'Interaktive Szene',
    createPages: () => [createDefaultSceneSessionPage(0)],
    createPage: index => createDefaultSceneSessionPage(index),
    buildEditorFields: page => buildSessionModuleEditorFields(page),
    collectEditorPage: (card, page) => collectSessionModuleEditorPage(card, page),
    renderPage: (page, entry, pageIndex, total) => buildSessionPage(page, entry, pageIndex, total),
    renderInlinePage: (page, entry, pageIndex, total) => buildInlineSessionTemplatePage(page, entry, pageIndex, total)
  },
  hierarchy: {
    id: 'hierarchy',
    pageType: 'hierarchy',
    pageFlag: 'hierarchyPage',
    label: 'Hierarchie - Template',
    pageLabel: 'Hierarchie - Template',
    defaultTitle: 'Neue Hierarchie',
    defaultSubtitle: 'Organisationsstruktur und Raenge',
    entryType: 'Hierarchie',
    typeMatchers: ['hierarchie', 'organigramm', 'organisation', 'rangstruktur'],
    createPages: () => [createDefaultHierarchyPage(0)],
    createPage: index => createDefaultHierarchyPage(index),
    buildEditorFields: page => buildHierarchyModuleEditorFields(page),
    collectEditorPage: (card, page) => collectHierarchyModuleEditorPage(card, page),
    renderPage: (page, entry, pageIndex, total) => buildHierarchyPage(page, entry, pageIndex, total),
    renderInlinePage: (page, entry, pageIndex, total) => buildInlineComplexTemplatePage(page, entry, pageIndex, total, 'hierarchy')
  },
  family: {
    id: 'family',
    pageType: 'family',
    pageFlag: 'familyPage',
    label: 'Familie - Template',
    pageLabel: 'Familie - Template',
    defaultTitle: 'Neue Familie',
    defaultSubtitle: 'Stammbaum, Blutlinien und Familienbindungen',
    entryType: 'Familie',
    typeMatchers: ['familie', 'stammbaum', 'familienbaum', 'blutlinie', 'hauslinie'],
    createPages: () => [createDefaultFamilyPage(0)],
    createPage: index => createDefaultFamilyPage(index),
    buildEditorFields: page => buildFamilyModuleEditorFields(page),
    collectEditorPage: (card, page) => collectFamilyModuleEditorPage(card, page),
    renderPage: (page, entry, pageIndex, total) => buildFamilyPage(page, entry, pageIndex, total),
    renderInlinePage: (page, entry, pageIndex, total) => buildInlineComplexTemplatePage(page, entry, pageIndex, total, 'family')
  },
  'object-profile': {
    id: 'object-profile',
    pageType: 'biography',
    pageAliases: ['object-profile'],
    pageFlag: 'biographyPage',
    label: 'Biographie-Template',
    pageLabel: 'Biographie-Template',
    defaultTitle: 'Neue Biographie',
    defaultSubtitle: 'Biographischer Almanach-Eintrag',
    entryType: 'Biographie',
    typeMatchers: ['biographie', 'biografie', 'objektprofil'],
    createPages: () => createObjectProfileTemplatePages(),
    createPage: index => {
      const page = deepClone(createObjectProfileTemplatePages()[0] || createDefaultModulePage(index));
      page.pageTitle = `${getRomanPageLabel(index)} — Biographie`;
      return page;
    },
    buildEditorFields: page => buildBiographyModuleEditorFields(page),
    collectEditorPage: (card, page) => collectBiographyModuleEditorPage(card, page),
    renderPage: (page, entry, pageIndex, total) => buildBiographyPage(page, entry, pageIndex, total),
    renderInlinePage: (page, entry, pageIndex, total) => buildInlineComplexTemplatePage(page, entry, pageIndex, total, 'biography')
  },
  bestiary: {
    id: 'bestiary',
    pageType: 'bestiary',
    pageFlag: 'bestiaryPage',
    label: 'Bestiarium - Template',
    pageLabel: 'Bestiarium - Template',
    defaultTitle: 'Neuer Bestiarium-Eintrag',
    defaultSubtitle: 'Monstrologischer Bestiarium-Eintrag',
    entryType: 'Bestiarium',
    typeMatchers: ['bestiarium', 'bestiary'],
    createPages: () => [createDefaultBestiaryPage(0)],
    createPage: index => {
      const page = createDefaultBestiaryPage(index);
      page.pageTitle = `${getRomanPageLabel(index)} — Bestiarium`;
      return page;
    },
    buildEditorFields: page => buildBestiaryModuleEditorFields(page),
    collectEditorPage: (card, page) => collectBestiaryModuleEditorPage(card, page),
    renderPage: (page, entry, pageIndex, total) => buildBestiaryPage(page, entry, pageIndex, total),
    renderInlinePage: (page, entry, pageIndex, total) => buildInlineComplexTemplatePage(page, entry, pageIndex, total, 'bestiary')
  },
  'quest-file': {
    id: 'quest-file',
    pageType: 'quest-file',
    pageFlag: 'questFilePage',
    label: 'Questakte - Template',
    pageLabel: 'Questakte - Template',
    defaultTitle: 'Neue Questakte',
    defaultSubtitle: 'Auftrag, Hinweise und Status',
    entryType: 'Questakte',
    typeMatchers: ['questakte'],
    createPages: () => createQuestFileTemplatePages(),
    createPage: index => createDefaultQuestFilePage(index),
    buildEditorFields: page => buildQuestFileModuleEditorFields(page),
    collectEditorPage: (card, page) => collectQuestFileModuleEditorPage(card, page),
    renderPage: (page, entry, pageIndex, total) => buildQuestFilePage(page, entry, pageIndex, total),
    renderInlinePage: (page, entry, pageIndex, total) => buildInlineComplexTemplatePage(page, entry, pageIndex, total, 'quest-file')
  },
  tournament: {
    id: 'tournament',
    pageType: 'tournament',
    pageFlag: 'tournamentPage',
    label: 'Turnier - Template',
    pageLabel: 'Turnier - Template',
    defaultTitle: 'Neues Turnier',
    defaultSubtitle: 'Turnierbaum, Favoriten und Preise',
    entryType: 'Turnier',
    typeMatchers: ['turnier'],
    createPages: () => [createDefaultTournamentPage(0, 16)],
    createPage: index => createDefaultTournamentPage(index, 16),
    buildEditorFields: page => buildTournamentModuleEditorFields(page),
    collectEditorPage: (card, page) => collectTournamentModuleEditorPage(card, page),
    renderPage: (page, entry, pageIndex, total) => buildTournamentPage(page, entry, pageIndex, total),
    renderInlinePage: (page, entry, pageIndex, total) => buildInlineComplexTemplatePage(page, entry, pageIndex, total, 'tournament')
  },
  'tournament-league': {
    id: 'tournament-league',
    pageType: 'tournament-league',
    pageFlag: 'tournamentLeaguePage',
    label: 'Turnierregister / Liga - Template',
    pageLabel: 'Turnierregister / Liga - Template',
    defaultTitle: 'Neues Turnierregister',
    defaultSubtitle: 'Ligatabelle, Begegnungen und Lagergeruechte',
    entryType: 'Turnierregister',
    typeMatchers: ['turnierregister', 'liga', 'ligatabelle'],
    createPages: () => [createDefaultTournamentLeaguePage(0)],
    createPage: index => createDefaultTournamentLeaguePage(index),
    buildEditorFields: page => buildTournamentLeagueModuleEditorFields(page),
    collectEditorPage: (card, page) => collectTournamentLeagueModuleEditorPage(card, page),
    renderPage: (page, entry, pageIndex, total) => buildTournamentLeaguePage(page, entry, pageIndex, total),
    renderInlinePage: (page, entry, pageIndex, total) => buildInlineComplexTemplatePage(page, entry, pageIndex, total, 'tournament-league')
  },
  caste: {
    id: 'caste',
    pageType: 'caste',
    pageFlag: 'castePage',
    label: 'Kaste / Klasse - Template',
    pageLabel: 'Kaste / Klasse - Template',
    defaultTitle: 'Neue Kaste',
    defaultSubtitle: 'Orden, Stand, Kaste oder institutionelle Gruppe',
    entryType: 'Kaste / Klasse',
    typeMatchers: ['kaste', 'klasse', 'orden', 'stand', 'ritterorden', 'tempeltyp'],
    createPages: () => [createDefaultCastePage(0)],
    createPage: index => createDefaultCastePage(index),
    buildEditorFields: page => buildCasteModuleEditorFields(page),
    collectEditorPage: (card, page) => collectCasteModuleEditorPage(card, page),
    renderPage: (page, entry, pageIndex, total) => buildCastePage(page, entry, pageIndex, total),
    renderInlinePage: (page, entry, pageIndex, total) => buildInlineComplexTemplatePage(page, entry, pageIndex, total, 'caste')
  },
  court: {
    id: 'court',
    pageType: 'court',
    pageFlag: 'courtPage',
    label: 'Gerichtsakte - Template',
    pageLabel: 'Gerichtsakte - Template',
    defaultTitle: 'Neue Gerichtsakte',
    defaultSubtitle: 'Vorbereitung des Verfahrens',
    entryType: 'Gerichtsakte',
    typeMatchers: ['gerichtsakte', 'gericht', 'anklage', 'prozess', 'ermittlungsakte'],
    createPages: () => [createDefaultCourtPage(0)],
    createPage: index => createDefaultCourtPage(index),
    buildEditorFields: page => buildCourtModuleEditorFields(page),
    collectEditorPage: (card, page) => collectCourtModuleEditorPage(card, page),
    renderPage: (page, entry, pageIndex, total) => buildCourtPage(page, entry, pageIndex, total),
    renderInlinePage: (page, entry, pageIndex, total) => buildInlineComplexTemplatePage(page, entry, pageIndex, total, 'court')
  },
  houses: {
    id: 'houses',
    pageType: 'house',
    pageFlag: 'housePage',
    label: 'Häuser-Template',
    pageLabel: 'Häuser-Template',
    defaultTitle: 'Neues Haus',
    defaultSubtitle: 'Adelshaus, Dynastie oder Familiensitz',
    entryType: 'Haus',
    typeMatchers: ['adelshaus', 'herrscherhaus', 'hausakte', 'dynastie'],
    createPages: () => createHouseTemplatePages(),
    createPage: index => createDefaultHousePage(index),
    buildEditorFields: page => buildHouseModuleEditorFields(page),
    collectEditorPage: (card, page) => collectHouseModuleEditorPage(card, page),
    renderPage: (page, entry, pageIndex, total) => buildHousePage(page, entry, pageIndex, total),
    renderInlinePage: (page, entry, pageIndex, total) => buildInlineComplexTemplatePage(page, entry, pageIndex, total, 'house')
  }
};

const MODULE_TEMPLATE_OPTIONS = Object.values(MODULE_TEMPLATE_REGISTRY)
  .map(({ id, label }) => ({ id, label }));

function getModuleTemplateDefinition(templateId = 'story') {
  return MODULE_TEMPLATE_REGISTRY[templateId] || MODULE_TEMPLATE_REGISTRY.story;
}

function getModuleTemplateForPageType(pageType = 'standard') {
  const type = String(pageType || 'standard').trim();
  return Object.values(MODULE_TEMPLATE_REGISTRY).find(template =>
    template.pageType === type || (template.pageAliases || []).includes(type)
  ) || MODULE_TEMPLATE_REGISTRY.story;
}

function getModuleTemplateForPage(page) {
  if (!page || typeof page !== 'object') return MODULE_TEMPLATE_REGISTRY.story;
  return Object.values(MODULE_TEMPLATE_REGISTRY).find(template => {
    if (template.pageFlag && page[template.pageFlag]) return true;
    return typeof template.matchesPage === 'function' && template.matchesPage(page);
  }) || MODULE_TEMPLATE_REGISTRY.story;
}

function buildModulePageTypeOptions(selected = 'standard') {
  const hasSelected = !!String(selected || '').trim();
  const current = hasSelected ? getModuleTemplateForPageType(selected).pageType : '';
  return Object.values(MODULE_TEMPLATE_REGISTRY)
    .map(template => `<option value="${template.pageType}"${hasSelected && template.pageType === current ? ' selected' : ''}>${escapeHtml(template.pageLabel || template.label)}</option>`)
    .join('');
}

function getModuleTemplateLabel(templateId) {
  return getModuleTemplateDefinition(templateId).label;
}

function buildModuleTemplateOptions(selected = 'story') {
  const current = getModuleTemplateDefinition(selected).id;
  return MODULE_TEMPLATE_OPTIONS
    .map(option => `<option value="${option.id}"${option.id === current ? ' selected' : ''}>${escapeHtml(option.label)}</option>`)
    .join('');
}

function inferModuleTemplateType(entry) {
  const pages = Array.isArray(entry?.pages) ? entry.pages : [];
  const type = String(entry?.type || '').toLowerCase();
  // Pick the longest matching marker across all templates, not just the first template whose
  // list contains any match — otherwise a generic marker (e.g. "turnier") that happens to be a
  // substring of a more specific one (e.g. "turnierregister") wins purely by registry order.
  let bestTemplate = null;
  let bestMarkerLength = -1;
  Object.values(MODULE_TEMPLATE_REGISTRY).forEach(template => {
    (template.typeMatchers || []).forEach(marker => {
      if (marker.length > bestMarkerLength && type.includes(marker)) {
        bestMarkerLength = marker.length;
        bestTemplate = template;
      }
    });
  });
  if (bestTemplate) return bestTemplate.id;
  const byPage = pages.map(page => getModuleTemplateForPage(page)).find(template => template.id !== 'story');
  if (byPage) return byPage.id;
  return 'story';
}

function createStoryTemplatePages() {
  return [
    {
      pageTitle: 'I. — Ursprung',
      image: '',
      imageWidth: 38,
      description: 'Erzählerischer Einstieg: Was ist geschehen, wer ist betroffen, und warum bleibt dieser Eintrag im Almanach erhalten?',
      stats: [
        ['Art', 'Chronik / Erzählung'],
        ['Ton', 'beschreibend']
      ],
      commentDivider: true,
      commentSequence: [
        { narrator: true, text: 'Ein kurzer Kommentar kann die Stimmung bündeln, ohne die Erzählung zu überladen.' }
      ],
      quote: '',
      quoteBy: ''
    },
    {
      pageTitle: 'II. — Verlauf',
      image: '',
      imageWidth: 38,
      description: 'Hauptteil der Geschichte. Hier ist Platz für Ursachen, Wendepunkte, Folgen und jene Details, die das Modul lebendig machen.',
      stats: [
        ['Schwerpunkt', 'Handlung / Hintergrund'],
        ['Kommentaranteil', 'gering']
      ],
      commentDivider: true,
      commentSequence: [],
      quote: '',
      quoteBy: ''
    }
  ];
}

function createSceneTemplatePages() {
  return [
    {
      pageTitle: 'I. — Gespräch',
      image: '',
      imageWidth: 42,
      description: 'Kurzer Rahmen des abgeschlossenen Gesprächs: Ort, Anlass, anwesende Figuren und unmittelbare Spannung.',
      stats: [
        ['Ort', 'Noch festlegen'],
        ['Beteiligte', 'Noch festlegen']
      ],
      sceneBlocks: [
        { type: 'intro', text: 'Die Szene öffnet mit einer knappen Beschreibung von Ort, Licht, Geräuschen und Stimmung.' },
        { type: 'speech', side: 'left', name: 'Figur A', avatar: '', text: 'Erste Aussage oder Frage.' },
        { type: 'speech', side: 'right', name: 'Figur B', avatar: '', text: 'Antwort, Einwand oder Gegenposition.' },
        { type: 'thought', side: 'left', name: 'Figur A', avatar: '', text: 'Ein unausgesprochener Gedanke oder innerer Zweifel.' },
        { type: 'action', text: 'Eine beobachtbare Handlung, Reaktion oder Unterbrechung.' },
        { type: 'divider' },
        { type: 'intro', text: 'Zweiter Szenenabschnitt, wenn sich Ton oder Fokus verändern.' }
      ]
    }
  ];
}

function createObjectProfileTemplatePages() {
  return [
    {
      pageTitle: 'I. — Biographie',
      image: '',
      imageWidth: 30,
      imageSquare: true,
      biographyPage: true,
      description: 'Beschreibe Herkunft, Ausbildung, Wendepunkte und die Rolle der Person in der Welt.',
      stats: [
        ['Vollständiger Name', 'Noch festlegen'],
        ['Titel', 'Noch festlegen'],
        ['Haus', 'Noch festlegen'],
        ['Geburt', 'Noch festlegen'],
        ['Alter', 'Noch festlegen'],
        ['Spezialisierung', 'Noch festlegen'],
        ['Rang', 'Noch festlegen'],
        ['Status', 'Aktiv']
      ],
      biography: {
        sideWidth: 100,
        connectionPortraitHeight: 68,
        connectionTextOffset: 0,
        biographyTitle: 'Biografie',
        biographyText: 'Beschreibe Herkunft, Ausbildung, Wendepunkte und die Rolle der Person in der Welt.',
        abilitiesTitle: 'Fähigkeiten & Spezialgebiete',
        abilities: [
          { icon: '✦', title: 'Spezialgebiet', detail: 'Kurze Beschreibung der besonderen Fähigkeit.' },
          { icon: '✦', title: 'Einfluss', detail: 'Wo die Person sichtbar wirkt oder gefürchtet ist.' }
        ],
        extraSections: [],
        historyTitle: 'Geschichte & Wirkung',
        historyText: 'Was hat diese Person geprägt, verändert oder ausgelöst? Welche Spuren bleiben?',
        worksTitle: 'Bekannte Werke',
        works: ['Erstes bekanntes Werk oder Ereignis', 'Zweites bekanntes Werk oder Ereignis'],
        triviaTitle: 'Trivia',
        trivia: ['Ein prägnantes Detail.', 'Ein Gerücht oder beobachtetes Merkmal.'],
        quotesTitle: 'Zitate',
        quotes: ['„Ein markantes Zitat der Person.“'],
        connectionsTitle: 'Verbindungen',
        connections: [
          { type: 'heading', title: 'Personen', detail: '' },
          { type: 'connection', name: 'Verbündete Person', detail: 'Rolle oder Beziehung', image: '', imageFormat: 'portrait' }
        ],
        documentsTitle: 'Dokumente & Aufzeichnungen',
        documents: ['Archivnotiz oder Dokument'],
        footer: 'Disziplin ist unser Schild. Wissen ist unsere Waffe.'
      },
      commentSequence: [],
      quote: '„Ein Leitsatz oder persönliches Zitat.“',
      quoteBy: '— Name'
    }
  ];
}

function createQuestFileTemplatePages() {
  return [createDefaultQuestFilePage(0)];
}

// Häuser-Template — built on the biography template's mechanics (portrait/stats/quote shell,
// icon+text point list, extra sections, connections, documents) but re-labelled for a noble
// house, dynasty or family seat instead of a single person.
function createDefaultHousePage(index = 0) {
  return {
    pageTitle: `${getRomanPageLabel(index)} — Haus`,
    image: '',
    imageWidth: 30,
    imageSquare: true,
    housePage: true,
    description: 'Beschreibe Ursprung, Werte und die gesellschaftliche Stellung dieses Hauses.',
    stats: [
      ['Vollständiger Name', 'Haus Noch festlegen'],
      ['Sitz', 'Noch festlegen'],
      ['Gegründet', 'Noch festlegen'],
      ['Oberhaupt', 'Noch festlegen'],
      ['Rang', 'Noch festlegen'],
      ['Status', 'Aktiv']
    ],
    house: {
      crestImage: '',
      sideWidth: 100,
      connectionPortraitHeight: 68,
      connectionTextOffset: 0,
      biographyTitle: 'Über dieses Haus',
      biographyText: 'Beschreibe Ursprung, Werte und die gesellschaftliche Stellung dieses Hauses.',
      abilitiesTitle: 'Einflussbereiche & Zuständigkeiten',
      abilities: [
        { icon: '../IconOrdner/Organisationsicons/Militär.png', title: 'Militär', detail: 'Streitmacht, Wehrpflicht oder Rittergefolge des Hauses.' },
        { icon: '../IconOrdner/Organisationsicons/Diplomatie.png', title: 'Diplomatie', detail: 'Bündnisse, Handelsabkommen und Beziehungen zu anderen Häusern.' },
        { icon: '../IconOrdner/Organisationsicons/Magie.png', title: 'Magie', detail: 'Arkane Tradition, Hofmagier oder magisches Erbe des Hauses.' }
      ],
      extraSections: [],
      historyTitle: 'Geschichte des Hauses',
      historyText: 'Was hat dieses Haus geprägt, welche Wendepunkte gab es, welche Spuren bleiben?',
      worksTitle: 'Bekannte Taten & Ereignisse',
      works: ['Erstes bekanntes Ereignis in der Geschichte des Hauses.', 'Zweites bedeutendes Ereignis.'],
      triviaTitle: 'Besonderheiten',
      trivia: ['Ein prägnantes Detail über das Haus.', 'Ein Gerücht oder eine Eigenheit.'],
      quotesTitle: 'Hausworte & Zitate',
      quotes: ['„Ein Leitsatz oder Hauswort.“'],
      connectionsTitle: 'Verbündete, Rivalen & Vasallen',
      connections: [
        { type: 'heading', title: 'Verbündete Häuser', detail: '' },
        { type: 'connection', name: 'Verbündetes Haus', detail: 'Art des Bündnisses', image: '', imageFormat: 'square' },
        { type: 'heading', title: 'Rivalen', detail: '' },
        { type: 'connection', name: 'Rivalisierendes Haus', detail: 'Grund der Rivalität', image: '', imageFormat: 'square' }
      ],
      documentsTitle: 'Dokumente & Urkunden',
      documents: ['Gründungsurkunde oder Wappenbrief'],
      footer: 'Blut, Ehre und das Wort des Hauses.'
    },
    commentSequence: [],
    quote: '„Ein Leitsatz oder Hauswort dieses Hauses.“',
    quoteBy: '— Hauschronik'
  };
}

function createHouseTemplatePages() {
  return [createDefaultHousePage(0)];
}

function createProfileTemplatePages() {
  return [
    {
      ...createDefaultModulePage(0),
      pageTitle: 'I. - Einordnung',
      description: 'Lose Einordnung des Charakters: Herkunft, Rolle in der Gruppe, aktuelle Lage und offene Fragen.',
      stats: [
        ['Rolle', 'Noch festlegen'],
        ['Aufenthalt', 'Noch festlegen'],
        ['Status', 'Aktiv']
      ],
      commentSequence: []
    },
    createDefaultProfilePage(1),
    createDefaultCharacterInventoryPage(2)
  ];
}

function createWantedTemplatePages() {
  return [createDefaultWantedPage(0)];
}

function createModuleTemplateDraft(templateId = 'story', preferred = getPreferredEditorSection(), existing = {}) {
  const template = getModuleTemplateDefinition(templateId);
  const genericTitles = new Set([
    'Neues Modul',
    'Neues Story-Modul',
    'Neue Szene',
    'Neues Profilmodul',
    'Neues Charakter-Inventar',
    'Neue Steckbrieftafel',
    'Neue Kopfgeldtafel',
    'Neue Kopfgeldakte',
    'Neues Objektprofil',
    'Neue Biographie',
    'Neues KartenTemplate',
    'Neues Bestiarium',
    'Neue Questakte',
    'Neue interaktive Szene',
    'Neues Turnier',
    'Neues Turnierregister',
    'Neue Familie',
    'Neue Kaste',
    'Neue Kaste / Klasse',
    'Neue Gerichtsakte',
    'Neues Haus'
  ]);
  const baseTitle = existing.title && !genericTitles.has(existing.title)
    ? existing.title
    : template.defaultTitle;
  const pages = typeof template.createPages === 'function'
    ? template.createPages()
    : createStoryTemplatePages();

  return sanitizeModuleEntry({
    id: existing.id || `modul-${Date.now()}`,
    title: baseTitle,
    multipage: true,
    subtitle: existing.subtitle || template.defaultSubtitle,
    type: template.entryType,
    category: existing.category || preferred.key || 'Neuer Bereich',
    moduleWidth: existing.moduleWidth || MODULE_SIZE_DEFAULT,
    moduleHeight: existing.moduleHeight || MODULE_SIZE_DEFAULT,
    image: existing.image || '',
    stamp: existing.stamp || 'BEREICH · ORT · WELT',
    icon: existing.icon || '',
    symbol: existing.symbol || '',
    locked: !!existing.locked,
    appendCommentsPage: existing.appendCommentsPage !== false,
    enablePageComments: !!existing.enablePageComments,
    sessionCast: getModuleCastIdsFromSource(existing),
    sessionCastDetails: getModuleCastDetailsFromSource(existing),
    pages
  });
}
