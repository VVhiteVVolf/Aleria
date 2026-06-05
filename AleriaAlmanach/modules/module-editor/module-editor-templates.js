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
      contactsTitle: 'Zugehörige Charaktere',
      contacts: [
        { image: '', name: 'Kontaktperson', title: 'Rolle / Bezug zur Quest' }
      ],
      triviaTitle: 'Orte von Interesse',
      trivia: [
        { title: 'Ort', detail: 'Kurze Einordnung' }
      ],
      rewardsTitle: 'Belohnung',
      rewards: [
        { image: '', title: 'Gold', detail: 'Betrag oder Wert' },
        { image: '', title: 'Ansehen', detail: 'Fraktion oder Ort' }
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
  const byType = Object.values(MODULE_TEMPLATE_REGISTRY).find(template =>
    (template.typeMatchers || []).some(marker => type.includes(marker))
  );
  if (byType) return byType.id;
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
      description: 'Biographischer Einstieg: Herkunft, Prägung, Rang und die Frage, warum diese Person im Almanach geführt wird.',
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
        biographyTitle: 'Biografie',
        biographyText: 'Beschreibe Herkunft, Ausbildung, Wendepunkte und die Rolle der Person in der Welt.',
        abilitiesTitle: 'Fähigkeiten & Spezialgebiete',
        abilities: [
          { icon: '✦', title: 'Spezialgebiet', detail: 'Kurze Beschreibung der besonderen Fähigkeit.' },
          { icon: '✦', title: 'Einfluss', detail: 'Wo die Person sichtbar wirkt oder gefürchtet ist.' }
        ],
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
          { name: 'Verbündete Person', detail: 'Rolle oder Beziehung', image: '' }
        ],
        documentsTitle: 'Dokumente & Aufzeichnungen',
        documents: ['Archivnotiz oder Dokument'],
        footer: 'Disziplin ist unser Schild. Wissen ist unsere Waffe.'
      },
      commentDivider: true,
      commentSequence: [],
      quote: '„Ein Leitsatz oder persönliches Zitat.“',
      quoteBy: '— Name'
    }
  ];
}

function createQuestFileTemplatePages() {
  return [createDefaultQuestFilePage(0)];
}

function createProfileTemplatePages() {
  return [createDefaultProfilePage(0)];
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
    'Neue Steckbrieftafel',
    'Neue Kopfgeldtafel',
    'Neues Objektprofil',
    'Neue Biographie',
    'Neues Bestiarium',
    'Neue Questakte',
    'Neue interaktive Szene',
    'Neues Turnier',
    'Neues Turnierregister',
    'Neue Kaste',
    'Neue Kaste / Klasse',
    'Neue Gerichtsakte'
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
