function formatJsonTextarea(value) {
  return JSON.stringify(value || [], null, 2);
}

function parseJsonTextarea(text, fallbackValue, label) {
  const raw = String(text || '').trim();
  if (!raw) return deepClone(fallbackValue);
  try {
    return JSON.parse(raw);
  } catch (error) {
    throw new Error(`${label} enthält kein gültiges JSON.`);
  }
}

function normalizeTournamentSize(value) {
  const size = Number(value) || 16;
  if (size >= 32) return 32;
  if (size >= 16) return 16;
  if (size >= 8) return 8;
  return 4;
}

function getTournamentRoundLabels(size = 16) {
  const labelsBySize = {
    32: ['Sechzehntelfinale', 'Achtelfinale', 'Viertelfinale', 'Halbfinale', 'Finale'],
    16: ['Achtelfinale', 'Viertelfinale', 'Halbfinale', 'Finale'],
    8: ['Viertelfinale', 'Halbfinale', 'Finale'],
    4: ['Halbfinale', 'Finale']
  };
  return labelsBySize[normalizeTournamentSize(size)] || labelsBySize[16];
}

function sanitizeTournamentParticipant(item = {}, index = 0) {
  return {
    name: String(item?.name || `Teilnehmer ${index + 1}`).trim(),
    title: String(item?.title || '').trim(),
    house: String(item?.house || '').trim(),
    avatar: String(item?.avatar || '').trim(),
    crest: String(item?.crest || '').trim(),
    marks: String(item?.marks || '').trim(),
  };
}

function sanitizeTournamentData(data = {}) {
  const bracketSize = normalizeTournamentSize(data.bracketSize);
  const participantSource = Array.isArray(data.participants) ? data.participants : [];
  const participants = Array.from({ length: bracketSize }, (_, index) =>
    sanitizeTournamentParticipant(participantSource[index], index)
  );
  const roundCount = getTournamentRoundLabels(bracketSize).length;
  const scores = Array.from({ length: roundCount }, (_, roundIndex) => {
    const matchCount = bracketSize / Math.pow(2, roundIndex + 1);
    const source = Array.isArray(data.scores?.[roundIndex]) ? data.scores[roundIndex] : [];
    return Array.from({ length: matchCount }, (_, matchIndex) => {
      const pair = Array.isArray(source[matchIndex]) ? source[matchIndex] : [];
      return [
        Number.isFinite(Number(pair[0])) ? Number(pair[0]) : null,
        Number.isFinite(Number(pair[1])) ? Number(pair[1]) : null
      ];
    });
  });

  const lineArray = value => Array.isArray(value)
    ? value.map(item => String(item || '').trim()).filter(Boolean)
    : [];
  const cardArray = value => Array.isArray(value)
    ? value.map(item => ({
        name: String(item?.name || '').trim(),
        detail: String(item?.detail || '').trim(),
        image: String(item?.image || '').trim(),
        marker: String(item?.marker || '').trim()
      })).filter(item => item.name || item.detail || item.image)
    : [];

  return {
    bracketSize,
    host: String(data.host || '').trim(),
    organizer: String(data.organizer || '').trim(),
    location: String(data.location || '').trim(),
    date: String(data.date || '').trim(),
    rules: String(data.rules || '').trim(),
    participantSummary: String(data.participantSummary || `${bracketSize} Teilnehmer`).trim(),
    heraldName: String(data.heraldName || 'Kommentar des Herolds').trim(),
    heraldAvatar: String(data.heraldAvatar || '').trim(),
    heraldText: String(data.heraldText || '').trim(),
    bottomImage: String(data.bottomImage || '').trim(),
    highlights: lineArray(data.highlights),
    prizes: lineArray(data.prizes),
    candidates: cardArray(data.candidates),
    injuries: cardArray(data.injuries),
    participants,
    scores
  };
}

function sanitizeTournamentLeagueRows(items = []) {
  return (Array.isArray(items) ? items : [])
    .map((item, index) => ({
      rank: String(item?.rank || index + 1).trim(),
      crest: String(item?.crest || item?.icon || item?.image || '').trim(),
      knight: String(item?.knight || item?.name || '').trim(),
      house: String(item?.house || '').trim(),
      wins: String(item?.wins || '').trim(),
      hits: String(item?.hits || '').trim(),
      honor: String(item?.honor || item?.points || '').trim(),
      glory: String(item?.glory || '').trim(),
      status: String(item?.status || 'Aktiv').trim()
    }))
    .filter(item => item.knight || item.house || item.crest)
    .slice(0, 40);
}

function sanitizeTournamentLeagueMatchups(items = []) {
  return (Array.isArray(items) ? items : [])
    .map((item, index) => ({
      label: String(item?.label || `${index + 1}. Begegnung`).trim(),
      time: String(item?.time || '').trim(),
      type: String(item?.type || '').trim(),
      leftName: String(item?.leftName || '').trim(),
      leftHouse: String(item?.leftHouse || '').trim(),
      leftPortrait: String(item?.leftPortrait || '').trim(),
      leftCrest: String(item?.leftCrest || '').trim(),
      rightName: String(item?.rightName || '').trim(),
      rightHouse: String(item?.rightHouse || '').trim(),
      rightPortrait: String(item?.rightPortrait || '').trim(),
      rightCrest: String(item?.rightCrest || '').trim()
    }))
    .filter(item => item.leftName || item.rightName || item.type || item.leftPortrait || item.rightPortrait)
    .slice(0, 8);
}

function sanitizeTournamentLeagueNotes(items = []) {
  return (Array.isArray(items) ? items : [])
    .map(item => ({
      title: String(item?.title || item?.name || '').trim(),
      text: String(item?.text || item?.detail || '').trim(),
      icon: String(item?.icon || item?.image || '').trim(),
      meta: String(item?.meta || item?.marker || '').trim()
    }))
    .filter(item => item.title || item.text || item.icon)
    .slice(0, 16);
}

function sanitizeTournamentLeagueData(data = {}) {
  const headers = data.tableHeaders && typeof data.tableHeaders === 'object' ? data.tableHeaders : {};
  return {
    archiveLabel: String(data.archiveLabel || 'Turnierregister').trim(),
    season: String(data.season || '').trim(),
    cycle: String(data.cycle || '').trim(),
    round: String(data.round || '').trim(),
    nextDate: String(data.nextDate || '').trim(),
    rulesLabel: String(data.rulesLabel || 'Turnierregeln').trim(),
    tableTitle: String(data.tableTitle || 'Rangliste der Ritter').trim(),
    tableHeaders: {
      rank: String(headers.rank || 'Rang').trim(),
      crest: String(headers.crest || 'Wappen').trim(),
      knight: String(headers.knight || 'Ritter').trim(),
      house: String(headers.house || 'Haus').trim(),
      wins: String(headers.wins || 'Siege').trim(),
      hits: String(headers.hits || 'Treffer').trim(),
      honor: String(headers.honor || 'Ehrpunkte').trim(),
      glory: String(headers.glory || 'Ruhm').trim(),
      status: String(headers.status || 'Status').trim()
    },
    matchupTitle: String(data.matchupTitle || 'Naechste Begegnungen').trim(),
    matchupVersusLabel: String(data.matchupVersusLabel || 'VS.').trim(),
    registeredNote: String(data.registeredNote || '').trim(),
    featuredTitle: String(data.featuredTitle || 'Ritter der Woche').trim(),
    featuredName: String(data.featuredName || '').trim(),
    featuredPortrait: String(data.featuredPortrait || '').trim(),
    featuredCrest: String(data.featuredCrest || '').trim(),
    featuredComment: String(data.featuredComment || '').trim(),
    combatTypesTitle: String(data.combatTypesTitle || 'Kampfarten').trim(),
    combatTypes: sanitizeTournamentLeagueNotes(data.combatTypes),
    rumorsTitle: String(data.rumorsTitle || 'Geruechte aus dem Lager').trim(),
    rumors: sanitizeTournamentLeagueNotes(data.rumors),
    injuriesTitle: String(data.injuriesTitle || 'Verletzte & Abwesende').trim(),
    injuries: sanitizeTournamentLeagueNotes(data.injuries),
    topHitsTitle: String(data.topHitsTitle || 'Beste Treffer').trim(),
    topHits: sanitizeTournamentLeagueNotes(data.topHits),
    weatherTitle: String(data.weatherTitle || 'Wetter').trim(),
    weatherText: String(data.weatherText || '').trim(),
    locationTitle: String(data.locationTitle || 'Turnierplatz').trim(),
    locationImage: String(data.locationImage || '').trim(),
    chronicleTitle: String(data.chronicleTitle || 'Chronik des Turniers').trim(),
    chronicle: sanitizeTournamentLeagueNotes(data.chronicle),
    standings: sanitizeTournamentLeagueRows(data.standings),
    matchups: sanitizeTournamentLeagueMatchups(data.matchups),
    footer: String(data.footer || '').trim()
  };
}

function sanitizeCasteInfoRows(items = []) {
  return (Array.isArray(items) ? items : [])
    .map(item => ({
      icon: String(item?.icon || item?.image || '').trim(),
      label: String(item?.label || item?.title || '').trim(),
      value: String(item?.value || item?.text || '').trim()
    }))
    .filter(item => item.icon || item.label || item.value)
    .slice(0, 12);
}

function sanitizeCasteSymbols(items = []) {
  return (Array.isArray(items) ? items : [])
    .map(item => ({
      icon: String(item?.icon || item?.image || '').trim(),
      name: String(item?.name || item?.title || item?.label || '').trim(),
      meaning: String(item?.meaning || item?.detail || item?.subtitle || item?.text || '').trim(),
      target: String(item?.target || item?.link || item?.url || '').trim()
    }))
    .filter(item => item.icon || item.name || item.meaning || item.target)
    .slice(0, 8);
}

function sanitizeCasteCards(items = [], limit = 12) {
  return (Array.isArray(items) ? items : [])
    .map(item => ({
      icon: String(item?.icon || item?.image || '').trim(),
      title: String(item?.title || item?.name || '').trim(),
      text: String(item?.text || item?.detail || '').trim()
    }))
    .filter(item => item.icon || item.title || item.text)
    .slice(0, limit);
}

function sanitizeCasteTextRows(items = [], limit = 12) {
  return (Array.isArray(items) ? items : [])
    .map(item => {
      if (typeof item === 'string') return { text: item.trim() };
      return {
        icon: String(item?.icon || item?.image || '').trim(),
        text: String(item?.text || item?.title || item?.value || '').trim()
      };
    })
    .filter(item => item.icon || item.text)
    .slice(0, limit);
}

function sanitizeCasteOrganizationRows(items = []) {
  return (Array.isArray(items) ? items : [])
    .map(item => ({
      label: String(item?.label || item?.title || '').trim(),
      value: String(item?.value || item?.text || '').trim()
    }))
    .filter(item => item.label || item.value)
    .slice(0, 12);
}

function sanitizeCasteRepresentatives(items = []) {
  return (Array.isArray(items) ? items : [])
    .map(item => ({
      portrait: String(item?.portrait || item?.image || item?.img || '').trim(),
      crest: String(item?.crest || item?.symbol || '').trim(),
      name: String(item?.name || '').trim(),
      role: String(item?.role || item?.title || '').trim(),
      note: String(item?.note || item?.text || item?.detail || '').trim()
    }))
    .filter(item => item.portrait || item.crest || item.name || item.role || item.note)
    .slice(0, 10);
}

function sanitizeCasteRelatedEntries(items = []) {
  return (Array.isArray(items) ? items : [])
    .map(item => ({
      icon: String(item?.icon || item?.image || '').trim(),
      label: String(item?.label || item?.title || item?.name || '').trim(),
      target: String(item?.target || item?.link || item?.url || '').trim()
    }))
    .filter(item => item.icon || item.label || item.target)
    .slice(0, 12);
}

function clampCasteImageScale(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 100;
  return Math.max(60, Math.min(220, Math.round(number)));
}

function sanitizeCasteData(data = {}) {
  return {
    archiveLabel: String(data.archiveLabel || 'Kasten & Klassen').trim(),
    documentCode: String(data.documentCode || '').trim(),
    categoryLabel: String(data.categoryLabel || 'Kaste / Klasse').trim(),
    headerSymbol: String(data.headerSymbol || '').trim(),
    sealImage: String(data.sealImage || '').trim(),
    bannerImage: String(data.bannerImage || '').trim(),
    backgroundImage: String(data.backgroundImage || '').trim(),
    imageScale: clampCasteImageScale(data.imageScale),
    introTitle: String(data.introTitle || '').trim(),
    introText: String(data.introText || '').trim(),
    infoTitle: String(data.infoTitle || 'Allgemeine Informationen').trim(),
    infoRows: sanitizeCasteInfoRows(data.infoRows),
    symbolsTitle: String(data.symbolsTitle || 'Symbolik').trim(),
    symbols: sanitizeCasteSymbols(data.symbols),
    rolesTitle: String(data.rolesTitle || 'Aufgaben & Rollen').trim(),
    roles: sanitizeCasteCards(data.roles, 8),
    skillsTitle: String(data.skillsTitle || 'Faehigkeiten & Kenntnisse').trim(),
    skills: sanitizeCasteCards(data.skills, 12),
    privilegesTitle: String(data.privilegesTitle || 'Privilegien').trim(),
    privileges: sanitizeCasteTextRows(data.privileges, 12),
    restrictionsTitle: String(data.restrictionsTitle || 'Einschraenkungen').trim(),
    restrictions: sanitizeCasteTextRows(data.restrictions, 12),
    organizationTitle: String(data.organizationTitle || 'Angehoerige & Organisation').trim(),
    organizationRows: sanitizeCasteOrganizationRows(data.organizationRows),
    representativesTitle: String(data.representativesTitle || 'Bekannte Vertreter').trim(),
    representatives: sanitizeCasteRepresentatives(data.representatives),
    relatedTitle: String(data.relatedTitle || 'Verbundene Eintraege').trim(),
    relatedEntries: sanitizeCasteRelatedEntries(data.relatedEntries),
    quote: String(data.quote || '').trim(),
    quoteBy: String(data.quoteBy || '').trim(),
    footer: String(data.footer || '').trim()
  };
}

function sanitizeCourtOverviewRows(items = []) {
  return (Array.isArray(items) ? items : [])
    .map(item => ({
      icon: String(item?.icon || item?.image || '').trim(),
      label: String(item?.label || item?.title || '').trim(),
      value: String(item?.value || item?.text || '').trim(),
      target: String(item?.target || item?.link || item?.url || '').trim()
    }))
    .filter(item => item.icon || item.label || item.value || item.target)
    .slice(0, 12);
}

function sanitizeCourtCharges(items = []) {
  return (Array.isArray(items) ? items : [])
    .map((item, index) => ({
      number: String(item?.number || item?.index || index + 1).trim(),
      title: String(item?.title || item?.label || '').trim(),
      text: String(item?.text || item?.description || item?.detail || '').trim(),
      target: String(item?.target || item?.link || item?.url || '').trim()
    }))
    .filter(item => item.number || item.title || item.text || item.target)
    .slice(0, 12);
}

function sanitizeCourtDates(items = []) {
  return (Array.isArray(items) ? items : [])
    .map(item => ({
      icon: String(item?.icon || item?.image || '').trim(),
      label: String(item?.label || item?.title || '').trim(),
      value: String(item?.value || item?.date || '').trim(),
      note: String(item?.note || item?.text || item?.detail || '').trim(),
      target: String(item?.target || item?.link || item?.url || '').trim()
    }))
    .filter(item => item.icon || item.label || item.value || item.note || item.target)
    .slice(0, 12);
}

function sanitizeCourtParties(items = []) {
  return (Array.isArray(items) ? items : [])
    .map(item => ({
      role: String(item?.role || item?.kind || '').trim(),
      name: String(item?.name || item?.label || '').trim(),
      title: String(item?.title || item?.subtitle || '').trim(),
      text: String(item?.text || item?.description || item?.detail || '').trim(),
      portrait: String(item?.portrait || item?.image || item?.img || '').trim(),
      crest: String(item?.crest || item?.symbol || '').trim(),
      target: String(item?.target || item?.link || item?.url || '').trim()
    }))
    .filter(item => item.role || item.name || item.title || item.text || item.portrait || item.crest || item.target)
    .slice(0, 12);
}

function sanitizeCourtEvidence(items = []) {
  return (Array.isArray(items) ? items : [])
    .map(item => ({
      icon: String(item?.icon || item?.image || item?.img || '').trim(),
      title: String(item?.title || item?.name || '').trim(),
      text: String(item?.text || item?.description || item?.detail || '').trim(),
      date: String(item?.date || '').trim(),
      location: String(item?.location || item?.place || '').trim(),
      custodian: String(item?.custodian || item?.keeper || '').trim(),
      status: String(item?.status || '').trim(),
      target: String(item?.target || item?.link || item?.url || '').trim()
    }))
    .filter(item => item.icon || item.title || item.text || item.date || item.location || item.custodian || item.status || item.target)
    .slice(0, 20);
}

function sanitizeCourtWitnesses(items = []) {
  return (Array.isArray(items) ? items : [])
    .map(item => ({
      portrait: String(item?.portrait || item?.image || item?.img || '').trim(),
      name: String(item?.name || item?.label || '').trim(),
      role: String(item?.role || item?.title || '').trim(),
      statement: String(item?.statement || item?.text || item?.description || '').trim(),
      status: String(item?.status || '').trim(),
      protection: String(item?.protection || item?.note || '').trim(),
      target: String(item?.target || item?.link || item?.url || '').trim()
    }))
    .filter(item => item.portrait || item.name || item.role || item.statement || item.status || item.protection || item.target)
    .slice(0, 20);
}

function sanitizeCourtChronology(items = []) {
  return (Array.isArray(items) ? items : [])
    .map(item => ({
      date: String(item?.date || item?.time || '').trim(),
      title: String(item?.title || item?.label || '').trim(),
      text: String(item?.text || item?.description || item?.detail || '').trim(),
      target: String(item?.target || item?.link || item?.url || '').trim()
    }))
    .filter(item => item.date || item.title || item.text || item.target)
    .slice(0, 24);
}

function sanitizeCourtOpenQuestions(items = []) {
  return (Array.isArray(items) ? items : [])
    .map(item => {
      if (typeof item === 'string') {
        return { icon: '', text: item.trim(), status: '', target: '' };
      }
      return {
        icon: String(item?.icon || item?.image || '').trim(),
        text: String(item?.text || item?.question || item?.title || '').trim(),
        status: String(item?.status || '').trim(),
        target: String(item?.target || item?.link || item?.url || '').trim()
      };
    })
    .filter(item => item.icon || item.text || item.status || item.target)
    .slice(0, 16);
}

function sanitizeCourtRelatedEntries(items = []) {
  return (Array.isArray(items) ? items : [])
    .map(item => ({
      icon: String(item?.icon || item?.image || '').trim(),
      label: String(item?.label || item?.title || item?.name || '').trim(),
      detail: String(item?.detail || item?.text || '').trim(),
      target: String(item?.target || item?.link || item?.url || '').trim()
    }))
    .filter(item => item.icon || item.label || item.detail || item.target)
    .slice(0, 16);
}

function sanitizeCourtData(data = {}) {
  return {
    archiveLabel: String(data.archiveLabel || 'Gerichtsakte').trim(),
    caseNumber: String(data.caseNumber || '').trim(),
    courtName: String(data.courtName || 'Offenes Gericht').trim(),
    courtPlace: String(data.courtPlace || '').trim(),
    status: String(data.status || 'in Vorbereitung').trim(),
    statusTone: String(data.statusTone || '').trim(),
    headerIcon: String(data.headerIcon || '').trim(),
    sealImage: String(data.sealImage || '').trim(),
    bannerImage: String(data.bannerImage || '').trim(),
    backgroundImage: String(data.backgroundImage || '').trim(),
    overviewTitle: String(data.overviewTitle || 'Falluebersicht').trim(),
    overviewRows: sanitizeCourtOverviewRows(data.overviewRows),
    summaryTitle: String(data.summaryTitle || 'Zusammenfassung des Falls').trim(),
    summaryText: String(data.summaryText || '').trim(),
    chargesTitle: String(data.chargesTitle || 'Anklagepunkte').trim(),
    charges: sanitizeCourtCharges(data.charges),
    datesTitle: String(data.datesTitle || 'Wichtige Daten').trim(),
    dates: sanitizeCourtDates(data.dates),
    partiesTitle: String(data.partiesTitle || 'Beteiligte').trim(),
    parties: sanitizeCourtParties(data.parties),
    evidenceTitle: String(data.evidenceTitle || 'Beweisstuecke').trim(),
    evidence: sanitizeCourtEvidence(data.evidence),
    witnessesTitle: String(data.witnessesTitle || 'Zeugen').trim(),
    witnesses: sanitizeCourtWitnesses(data.witnesses),
    chronologyTitle: String(data.chronologyTitle || 'Chronologie').trim(),
    chronology: sanitizeCourtChronology(data.chronology),
    openQuestionsTitle: String(data.openQuestionsTitle || 'Offene Fragen').trim(),
    openQuestions: sanitizeCourtOpenQuestions(data.openQuestions),
    relatedTitle: String(data.relatedTitle || 'Verknuepfte Eintraege').trim(),
    relatedEntries: sanitizeCourtRelatedEntries(data.relatedEntries),
    noteTitle: String(data.noteTitle || 'Aktennotiz').trim(),
    noteText: String(data.noteText || '').trim(),
    footer: String(data.footer || '').trim()
  };
}

function sanitizeBiographyData(data = {}) {
  const lineArray = value => Array.isArray(value)
    ? value.map(item => String(item || '').trim()).filter(Boolean)
    : [];
  const pairArray = value => Array.isArray(value)
    ? value.map(item => ({
        title: String(item?.title || '').trim(),
        detail: String(item?.detail || '').trim(),
        icon: String(item?.icon || '').trim()
      })).filter(item => item.title || item.detail || item.icon)
    : [];
  const connectionArray = value => Array.isArray(value)
    ? value.map(item => ({
        name: String(item?.name || '').trim(),
        detail: String(item?.detail || '').trim(),
        image: String(item?.image || '').trim()
      })).filter(item => item.name || item.detail || item.image)
    : [];
  const documentArray = value => Array.isArray(value)
    ? value.map(item => {
        if (typeof item === 'string') return { text: item.trim(), link: '' };
        return {
          text: String(item?.text || item?.title || item?.name || '').trim(),
          link: String(item?.link || item?.url || item?.href || '').trim()
        };
      }).filter(item => item.text || item.link)
    : [];

  return {
    biographyTitle: String(data.biographyTitle || 'Biografie').trim(),
    biographyText: String(data.biographyText || '').trim(),
    abilitiesTitle: String(data.abilitiesTitle || 'Fähigkeiten & Spezialgebiete').trim(),
    abilities: pairArray(data.abilities),
    historyTitle: String(data.historyTitle || 'Geschichte & Wirkung').trim(),
    historyText: String(data.historyText || '').trim(),
    worksTitle: String(data.worksTitle || 'Bekannte Werke').trim(),
    works: lineArray(data.works),
    triviaTitle: String(data.triviaTitle || 'Trivia').trim(),
    trivia: lineArray(data.trivia),
    quotesTitle: String(data.quotesTitle || 'Zitate').trim(),
    quotes: lineArray(data.quotes),
    connectionsTitle: String(data.connectionsTitle || 'Verbindungen').trim(),
    connections: connectionArray(data.connections),
    documentsTitle: String(data.documentsTitle || 'Dokumente & Aufzeichnungen').trim(),
    documents: documentArray(data.documents),
    footer: String(data.footer || '').trim()
  };
}

function clampBestiaryNumber(value, fallback, min, max) {
  const number = Number(value);
  const safe = Number.isFinite(number) ? number : fallback;
  return Math.max(min, Math.min(max, Math.round(safe)));
}

function sanitizeBestiaryAnatomy(items = []) {
  return (Array.isArray(items) ? items : [])
    .map((item, index) => ({
      number: String(item?.number || index + 1).trim(),
      title: String(item?.title || '').trim(),
      detail: String(item?.detail || '').trim()
    }))
    .filter(item => item.number || item.title || item.detail)
    .slice(0, 16);
}

function sanitizeBestiaryAnnotations(items = []) {
  return (Array.isArray(items) ? items : [])
    .map((item, index) => ({
      number: String(item?.number || index + 1).trim(),
      x: clampBestiaryNumber(item?.x, 50, 4, 96),
      y: clampBestiaryNumber(item?.y, 50, 4, 96),
      text: String(item?.text || '').trim()
    }))
    .filter(item => item.number || item.text)
    .slice(0, 20);
}

function sanitizeBestiaryWeaknesses(items = []) {
  return (Array.isArray(items) ? items : [])
    .map(item => String(typeof item === 'object' ? item?.text : item || '').trim())
    .filter(Boolean)
    .slice(0, 16);
}

function sanitizeBestiaryData(data = {}) {
  return {
    volume: String(data.volume || 'BESTIARIUM · BAND II').trim(),
    chapter: String(data.chapter || 'Kreaturen & Gefahren').trim(),
    classification: String(data.classification || 'Klasse: Unklassifiziert').trim(),
    latinName: String(data.latinName || '').trim(),
    backgroundImage: String(data.backgroundImage || '').trim(),
    imageScale: clampBestiaryNumber(data.imageScale, 100, 45, 180),
    imageX: clampBestiaryNumber(data.imageX, 50, 0, 100),
    imageY: clampBestiaryNumber(data.imageY, 50, 0, 100),
    sideNote: String(data.sideNote || '').trim(),
    authorNoteTitle: String(data.authorNoteTitle || 'Anmerkungen des Verfassers').trim(),
    authorNote: String(data.authorNote || '').trim(),
    anatomyTitle: String(data.anatomyTitle || 'Anatomie').trim(),
    anatomy: sanitizeBestiaryAnatomy(data.anatomy),
    annotations: sanitizeBestiaryAnnotations(data.annotations),
    weaknessesTitle: String(data.weaknessesTitle || 'Beobachtete Schwächen').trim(),
    weaknesses: sanitizeBestiaryWeaknesses(data.weaknesses),
    quoteTitle: String(data.quoteTitle || 'Zitat aus dem Archiv').trim(),
    quotePortrait: String(data.quotePortrait || '').trim(),
    footer: String(data.footer || 'Akademie Cenyr · Abteilung für Naturkunde & Monstrologie').trim()
  };
}

function sanitizeQuestFileRows(items = []) {
  return (Array.isArray(items) ? items : [])
    .map(item => {
      if (typeof item === 'string') return { title: item.trim(), detail: '' };
      return {
        title: String(item?.title || item?.name || item?.text || '').trim(),
        detail: String(item?.detail || item?.subtitle || '').trim()
      };
    })
    .filter(item => item.title || item.detail)
    .slice(0, 18);
}

function sanitizeQuestContacts(items = []) {
  return (Array.isArray(items) ? items : [])
    .map(item => ({
      image: String(item?.image || item?.img || '').trim(),
      name: String(item?.name || '').trim(),
      title: String(item?.title || item?.role || '').trim()
    }))
    .filter(item => item.image || item.name || item.title)
    .slice(0, 12);
}

function sanitizeQuestRewards(items = []) {
  return (Array.isArray(items) ? items : [])
    .map(item => ({
      image: String(item?.image || item?.img || '').trim(),
      title: String(item?.title || item?.name || '').trim(),
      detail: String(item?.detail || item?.text || '').trim()
    }))
    .filter(item => item.image || item.title || item.detail)
    .slice(0, 12);
}

function sanitizeQuestFileData(data = {}) {
  return {
    archiveLabel: String(data.archiveLabel || 'Aufträge · Hauptquesten').trim(),
    confidentiality: String(data.confidentiality || 'Vertraulich. Nur für fähige und diskrete Ohren.').trim(),
    bannerImage: String(data.bannerImage || '').trim(),
    crestImage: String(data.crestImage || '').trim(),
    clientName: String(data.clientName || '').trim(),
    clientTitle: String(data.clientTitle || '').trim(),
    clientPortrait: String(data.clientPortrait || '').trim(),
    clientNote: String(data.clientNote || '').trim(),
    sectionOneTitle: String(data.sectionOneTitle || 'Auftragsbeschreibung').trim(),
    sectionOneText: String(data.sectionOneText || '').trim(),
    sectionTwoTitle: String(data.sectionTwoTitle || 'Hintergrund').trim(),
    sectionTwoText: String(data.sectionTwoText || '').trim(),
    sectionThreeTitle: String(data.sectionThreeTitle || 'Ziele').trim(),
    sectionThreeItems: sanitizeQuestFileRows(data.sectionThreeItems),
    contactsTitle: String(data.contactsTitle || 'Zugehörige Charaktere').trim(),
    contacts: sanitizeQuestContacts(data.contacts),
    triviaTitle: String(data.triviaTitle || 'Orte von Interesse').trim(),
    trivia: sanitizeQuestFileRows(data.trivia),
    rewardsTitle: String(data.rewardsTitle || 'Belohnung').trim(),
    rewards: sanitizeQuestRewards(data.rewards),
    noteTitle: String(data.noteTitle || 'Notizen des Auftraggebers').trim(),
    note: String(data.note || '').trim(),
    sketchImage: String(data.sketchImage || '').trim(),
    footer: String(data.footer || '').trim()
  };
}

function sanitizeArtifactData(data = {}) {
  const lineArray = value => Array.isArray(value)
    ? value.map(item => String(item || '').trim()).filter(Boolean)
    : [];
  return {
    archiveLabel: String(data.archiveLabel || 'Artefaktakte').trim(),
    classification: String(data.classification || 'Unklassifiziert').trim(),
    origin: String(data.origin || 'Herkunft unbekannt').trim(),
    condition: String(data.condition || 'Zustand ungeprüft').trim(),
    keeper: String(data.keeper || '').trim(),
    discovery: String(data.discovery || '').trim(),
    propertiesTitle: String(data.propertiesTitle || 'Eigenschaften').trim(),
    properties: lineArray(data.properties),
    risksTitle: String(data.risksTitle || 'Risiken & Nebenwirkungen').trim(),
    risks: lineArray(data.risks),
    historyTitle: String(data.historyTitle || 'Geschichte').trim(),
    historyText: String(data.historyText || '').trim(),
    footer: String(data.footer || '').trim()
  };
}

function sanitizeRecipeIconRows(items = [], fields = ['title']) {
  return (Array.isArray(items) ? items : [])
    .map(item => {
      const next = {
        icon: String(item?.icon || item?.img || item?.image || '').trim()
      };
      fields.forEach(field => {
        next[field] = String(item?.[field] || '').trim();
      });
      return next;
    })
    .filter(item => item.icon || fields.some(field => item[field]))
    .slice(0, 18);
}

function sanitizeRecipeData(data = {}) {
  return {
    archiveLabel: String(data.archiveLabel || 'Rezeptur · Ritual').trim(),
    documentKind: String(data.documentKind || 'Rezeptur').trim(),
    category: String(data.category || 'Alchemie').trim(),
    difficulty: String(data.difficulty || 'Mittel').trim(),
    duration: String(data.duration || '45 Min.').trim(),
    result: String(data.result || '1 Anwendung').trim(),
    effect: String(data.effect || '').trim(),
    ingredientsTitle: String(data.ingredientsTitle || 'Zutaten').trim(),
    ingredients: sanitizeRecipeIconRows(data.ingredients, ['title', 'amount']),
    equipmentTitle: String(data.equipmentTitle || 'Benötigte Ausrüstung').trim(),
    equipment: sanitizeRecipeIconRows(data.equipment, ['title']),
    stepsTitle: String(data.stepsTitle || 'Zubereitung').trim(),
    steps: sanitizeRecipeIconRows(data.steps, ['title', 'text', 'duration', 'note']),
    warningsTitle: String(data.warningsTitle || 'Hinweise & Warnungen').trim(),
    warnings: sanitizeRecipeIconRows(data.warnings, ['title', 'text']),
    propertiesTitle: String(data.propertiesTitle || 'Eigenschaften').trim(),
    properties: sanitizeRecipeIconRows(data.properties, ['title', 'value']),
    variantsTitle: String(data.variantsTitle || 'Varianten').trim(),
    variants: sanitizeRecipeIconRows(data.variants, ['title', 'description', 'additions', 'effect']),
    masterNoteTitle: String(data.masterNoteTitle || 'Notizen des Meisters').trim(),
    masterNote: String(data.masterNote || '').trim(),
    footer: String(data.footer || '').trim()
  };
}

function formatTournamentParticipantsTextarea(tournament) {
  return sanitizeTournamentData(tournament).participants
    .map(item => [item.name, item.title, item.house, item.avatar, item.crest, item.marks].join(' | '))
    .join('\n');
}

function parseTournamentParticipantsTextarea(text, bracketSize) {
  const lines = String(text || '').split(/\r?\n/);
  return Array.from({ length: normalizeTournamentSize(bracketSize) }, (_, index) => {
    const parts = String(lines[index] || '').split('|').map(part => part.trim());
    return sanitizeTournamentParticipant({
      name: parts[0] || `Teilnehmer ${index + 1}`,
      title: parts[1] || '',
      house: parts[2] || '',
      avatar: parts[3] || '',
      crest: parts[4] || '',
      marks: parts[5] || ''
    }, index);
  });
}

function formatTournamentScoresTextarea(tournament) {
  const data = sanitizeTournamentData(tournament);
  return data.scores
    .map((round, index) => `${getTournamentRoundLabels(data.bracketSize)[index]}: ${round.map(pair => pair.map(value => value == null ? '' : value).join('-')).join(', ')}`)
    .join('\n');
}

function parseTournamentScoresTextarea(text, bracketSize) {
  const labels = getTournamentRoundLabels(bracketSize);
  const lines = String(text || '').split(/\r?\n/);
  return labels.map((label, roundIndex) => {
    const matchCount = bracketSize / Math.pow(2, roundIndex + 1);
    const raw = String(lines[roundIndex] || '').replace(/^[^:]+:/, '');
    const chunks = raw.split(',').map(part => part.trim()).filter(Boolean);
    return Array.from({ length: matchCount }, (_, matchIndex) => {
      const nums = String(chunks[matchIndex] || '').split('-').map(part => part.trim());
      return [
        Number.isFinite(Number(nums[0])) && nums[0] !== '' ? Number(nums[0]) : null,
        Number.isFinite(Number(nums[1])) && nums[1] !== '' ? Number(nums[1]) : null
      ];
    });
  });
}

function formatTournamentCardsTextarea(items = []) {
  return (Array.isArray(items) ? items : [])
    .map(item => [item.name || '', item.detail || '', item.image || '', item.marker || ''].join(' | '))
    .join('\n');
}

function parseTournamentCardsTextarea(text) {
  return String(text || '').split(/\r?\n/)
    .map(line => line.split('|').map(part => part.trim()))
    .filter(parts => parts.some(Boolean))
    .map(parts => ({ name: parts[0] || '', detail: parts[1] || '', image: parts[2] || '', marker: parts[3] || '' }));
}

function formatTournamentLeagueStandingsTextarea(items = []) {
  return sanitizeTournamentLeagueRows(items)
    .map(item => [item.rank, item.crest, item.knight, item.house, item.wins, item.hits, item.honor, item.glory, item.status].join(' | '))
    .join('\n');
}

function parseTournamentLeagueStandingsTextarea(text) {
  return sanitizeTournamentLeagueRows(String(text || '').split(/\r?\n/)
    .map(line => line.split('|').map(part => part.trim()))
    .filter(parts => parts.some(Boolean))
    .map((parts, index) => ({
      rank: parts[0] || String(index + 1),
      crest: parts[1] || '',
      knight: parts[2] || '',
      house: parts[3] || '',
      wins: parts[4] || '',
      hits: parts[5] || '',
      honor: parts[6] || '',
      glory: parts[7] || '',
      status: parts[8] || ''
    })));
}

function formatTournamentLeagueMatchupsTextarea(items = []) {
  return sanitizeTournamentLeagueMatchups(items)
    .map(item => [item.label, item.time, item.type, item.leftName, item.leftHouse, item.leftPortrait, item.leftCrest, item.rightName, item.rightHouse, item.rightPortrait, item.rightCrest].join(' | '))
    .join('\n');
}

function parseTournamentLeagueMatchupsTextarea(text) {
  return sanitizeTournamentLeagueMatchups(String(text || '').split(/\r?\n/)
    .map(line => line.split('|').map(part => part.trim()))
    .filter(parts => parts.some(Boolean))
    .map(parts => ({
      label: parts[0] || '',
      time: parts[1] || '',
      type: parts[2] || '',
      leftName: parts[3] || '',
      leftHouse: parts[4] || '',
      leftPortrait: parts[5] || '',
      leftCrest: parts[6] || '',
      rightName: parts[7] || '',
      rightHouse: parts[8] || '',
      rightPortrait: parts[9] || '',
      rightCrest: parts[10] || ''
    })));
}

function formatTournamentLeagueNotesTextarea(items = []) {
  return sanitizeTournamentLeagueNotes(items)
    .map(item => [item.title, item.text, item.icon, item.meta].join(' | '))
    .join('\n');
}

function parseTournamentLeagueNotesTextarea(text) {
  return sanitizeTournamentLeagueNotes(String(text || '').split(/\r?\n/)
    .map(line => line.split('|').map(part => part.trim()))
    .filter(parts => parts.some(Boolean))
    .map(parts => ({
      title: parts[0] || '',
      text: parts[1] || '',
      icon: parts[2] || '',
      meta: parts[3] || ''
    })));
}

function formatSimpleLines(value = []) {
  return (Array.isArray(value) ? value : []).join('\n');
}

function parseSimpleLines(text) {
  return String(text || '').split(/\r?\n/).map(line => line.trim()).filter(Boolean);
}

function getTournamentScoreValue(value) {
  if (value === '' || value == null) return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}
