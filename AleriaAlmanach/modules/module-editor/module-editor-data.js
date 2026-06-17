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

function clampBountyNumber(value, fallback, min, max) {
  const number = Number(value);
  const safe = Number.isFinite(number) ? number : fallback;
  return Math.max(min, Math.min(max, Math.round(safe)));
}

function sanitizeBountyImageItem(item = {}, index = 0, fallbackTitle = 'Eintrag') {
  return {
    image: String(item?.image || item?.img || item?.portrait || '').trim(),
    imageScale: clampBountyNumber(item?.imageScale, 100, 50, 220),
    imageX: clampBountyNumber(item?.imageX, 50, 0, 100),
    imageY: clampBountyNumber(item?.imageY, 50, 0, 100),
    title: String(item?.title || item?.name || `${fallbackTitle} ${index + 1}`).trim(),
    subtitle: String(item?.subtitle || item?.role || '').trim(),
    text: String(item?.text || item?.detail || item?.note || '').trim()
  };
}

function sanitizeBountyCharges(items = []) {
  return (Array.isArray(items) ? items : [])
    .map((item, index) => ({
      icon: String(item?.icon || '').trim(),
      title: String(item?.title || item?.label || `Tatvorwurf ${index + 1}`).trim(),
      text: String(item?.text || item?.detail || '').trim()
    }))
    .filter(item => item.icon || item.title || item.text)
    .slice(0, 12);
}

function sanitizeBountyDescriptionRows(items = []) {
  return (Array.isArray(items) ? items : [])
    .map(item => ({
      label: String(item?.label || item?.title || '').trim(),
      value: String(item?.value || item?.text || '').trim()
    }))
    .filter(item => item.label || item.value)
    .slice(0, 16);
}

function sanitizeBountySightings(items = []) {
  return (Array.isArray(items) ? items : [])
    .map(item => ({
      place: String(item?.place || item?.ort || item?.location || '').trim(),
      date: String(item?.date || item?.datum || '').trim(),
      observer: String(item?.observer || item?.beobachter || '').trim()
    }))
    .filter(item => item.place || item.date || item.observer)
    .slice(0, 20);
}

function sanitizeBountyProfileRows(items = []) {
  return (Array.isArray(items) ? items : [])
    .map((item, index) => ({
      icon: String(item?.icon || '').trim(),
      label: String(item?.label || item?.title || `Profilwert ${index + 1}`).trim(),
      value: clampBountyNumber(item?.value, 3, 0, 5)
    }))
    .filter(item => item.icon || item.label || item.value)
    .slice(0, 10);
}

function sanitizeBountyFileData(data = {}) {
  const imageList = (items, fallbackTitle) => (Array.isArray(items) ? items : [])
    .map((item, index) => sanitizeBountyImageItem(item, index, fallbackTitle))
    .filter(item => item.image || item.title || item.subtitle || item.text)
    .slice(0, 24);

  return {
    archiveTitle: String(data.archiveTitle || 'Kopfgeld / Fahndungsakte').trim(),
    archiveSubtitle: String(data.archiveSubtitle || 'Herausgegeben im Namen des Koenigreichs Cenyr').trim(),
    regionalBanner: String(data.regionalBanner || '').trim(),
    regionalBannerScale: clampBountyNumber(data.regionalBannerScale, 100, 50, 220),
    regionalBannerX: clampBountyNumber(data.regionalBannerX, 50, 0, 100),
    regionalBannerY: clampBountyNumber(data.regionalBannerY, 50, 0, 100),
    backgroundImage: String(data.backgroundImage || '').trim(),
    portraitImage: String(data.portraitImage || '').trim(),
    portraitScale: clampBountyNumber(data.portraitScale, 100, 50, 220),
    portraitX: clampBountyNumber(data.portraitX, 50, 0, 100),
    portraitY: clampBountyNumber(data.portraitY, 38, 0, 100),
    sealImage: String(data.sealImage || '').trim(),
    sealScale: clampBountyNumber(data.sealScale, 100, 50, 180),
    sealX: clampBountyNumber(data.sealX, 50, 0, 100),
    sealY: clampBountyNumber(data.sealY, 50, 0, 100),
    coinImage: String(data.coinImage || '').trim(),
    coinScale: clampBountyNumber(data.coinScale, 100, 50, 180),
    coinX: clampBountyNumber(data.coinX, 50, 0, 100),
    coinY: clampBountyNumber(data.coinY, 50, 0, 100),
    nameLabel: String(data.nameLabel || 'Name').trim(),
    targetName: String(data.targetName || '').trim(),
    aliasesLabel: String(data.aliasesLabel || 'Aliasnamen').trim(),
    aliases: String(data.aliases || '').trim(),
    statusLabel: String(data.statusLabel || 'Status').trim(),
    status: String(data.status || 'Gesucht').trim(),
    statusNote: String(data.statusNote || 'Tot oder lebendig').trim(),
    threatLabel: String(data.threatLabel || 'Gefaehrlichkeitsstufe').trim(),
    threatLevel: clampBountyNumber(data.threatLevel, 4, 1, 5),
    threatText: String(data.threatText || 'Aeusserst gefaehrlich').trim(),
    bountyLabel: String(data.bountyLabel || 'Kopfgeld').trim(),
    bountyAmount: String(data.bountyAmount || '').trim(),
    bountyCurrency: String(data.bountyCurrency || 'Goldtaler').trim(),
    handoverNote: String(data.handoverNote || '').trim(),
    chargesTitle: String(data.chargesTitle || 'Tatvorwuerfe').trim(),
    charges: sanitizeBountyCharges(data.charges),
    descriptionTitle: String(data.descriptionTitle || 'Personenbeschreibung').trim(),
    descriptionRows: sanitizeBountyDescriptionRows(data.descriptionRows),
    descriptionNote: String(data.descriptionNote || '').trim(),
    descriptionIcon: String(data.descriptionIcon || '').trim(),
    companionsTitle: String(data.companionsTitle || 'Bekannte Begleiter').trim(),
    companions: imageList(data.companions, 'Begleiter'),
    sightingsTitle: String(data.sightingsTitle || 'Letzte Sichtungen').trim(),
    sightings: sanitizeBountySightings(data.sightings),
    connectionsTitle: String(data.connectionsTitle || 'Verbindungen & Zugehoerigkeiten').trim(),
    factionTitle: String(data.factionTitle || 'Fraktion / Bande').trim(),
    factionBanner: String(data.factionBanner || '').trim(),
    factionBannerScale: clampBountyNumber(data.factionBannerScale, 100, 50, 220),
    factionBannerX: clampBountyNumber(data.factionBannerX, 50, 0, 100),
    factionBannerY: clampBountyNumber(data.factionBannerY, 50, 0, 100),
    factionName: String(data.factionName || '').trim(),
    factionText: String(data.factionText || '').trim(),
    alliesTitle: String(data.alliesTitle || 'Verbuendete').trim(),
    allies: imageList(data.allies, 'Verbuendeter'),
    enemiesTitle: String(data.enemiesTitle || 'Feinde').trim(),
    enemies: imageList(data.enemies, 'Feind'),
    supportersTitle: String(data.supportersTitle || 'Moegliche Unterstuetzer').trim(),
    supporters: imageList(data.supporters, 'Unterstuetzer'),
    dangerTitle: String(data.dangerTitle || 'Gefaehrlichkeitsprofil').trim(),
    dangerProfiles: sanitizeBountyProfileRows(data.dangerProfiles),
    footer: String(data.footer || '').trim()
  };
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

function sanitizeHierarchyDetailRows(items = []) {
  return (Array.isArray(items) ? items : [])
    .map(item => ({
      icon: String(item?.icon || '').trim(),
      label: String(item?.label || item?.title || '').trim(),
      value: String(item?.value || item?.text || '').trim()
    }))
    .filter(item => item.icon || item.label || item.value)
    .slice(0, 12);
}

function sanitizeHierarchyNode(item = {}, index = 0) {
  return {
    portrait: String(item?.portrait || item?.image || item?.img || '').trim(),
    title: String(item?.title || item?.name || `Rang ${index + 1}`).trim(),
    subtitle: String(item?.subtitle || item?.role || '').trim(),
    text: String(item?.text || item?.description || item?.detail || '').trim()
  };
}

function sanitizeHierarchyLevel(level = {}, index = 0) {
  const nodes = (Array.isArray(level?.nodes) ? level.nodes : [])
    .map((node, nodeIndex) => sanitizeHierarchyNode(node, nodeIndex))
    .filter(node => node.portrait || node.title || node.subtitle || node.text)
    .slice(0, 4);
  return {
    label: String(level?.label || '').trim(),
    nodes
  };
}

function clampHierarchyScale(value, fallback = 100, min = 65, max = 140) {
  const number = Number(value);
  const safe = Number.isFinite(number) ? number : fallback;
  return Math.max(min, Math.min(max, Math.round(safe)));
}

function sanitizeHierarchyData(data = {}) {
  const layoutMode = String(data.layoutMode || '').trim();
  return {
    layoutMode: layoutMode === 'depth' ? 'depth' : 'vertical',
    cardFontScale: clampHierarchyScale(data.cardFontScale, 92, 65, 125),
    portraitScale: clampHierarchyScale(data.portraitScale, 100, 50, 160),
    eyebrow: String(data.eyebrow || 'Hierarchie').trim(),
    subtitle: String(data.subtitle || 'Organisationsstruktur').trim(),
    centerLabel: String(data.centerLabel || 'Gilde der Wahrheitswaage').trim(),
    emblem: String(data.emblem || '').trim(),
    sideImage: String(data.sideImage || '').trim(),
    organizationTitle: String(data.organizationTitle || 'Gilde der Wahrheitswaage').trim(),
    motto: String(data.motto || 'Wissen. Gerechtigkeit. Balance.').trim(),
    description: String(data.description || '').trim(),
    detailsTitle: String(data.detailsTitle || 'Details').trim(),
    details: sanitizeHierarchyDetailRows(data.details),
    quoteLabel: String(data.quoteLabel || 'Wahrspruch').trim(),
    quote: String(data.quote || '').trim(),
    chartTitle: String(data.chartTitle || 'Aufbau & Raenge').trim(),
    chartIntro: String(data.chartIntro || '').trim(),
    levels: (Array.isArray(data.levels) ? data.levels : [])
      .map((level, index) => sanitizeHierarchyLevel(level, index))
      .filter(level => level.label || level.nodes.length)
      .slice(0, 12),
    footerNote: String(data.footerNote || '').trim(),
    backLabel: String(data.backLabel || 'Zurueck zur Uebersicht').trim(),
    printLabel: String(data.printLabel || 'Akte drucken').trim()
  };
}

function clampBiographyNumber(value, fallback, min, max) {
  const number = Number(value);
  const safe = Number.isFinite(number) ? number : fallback;
  return Math.max(min, Math.min(max, Math.round(safe)));
}

function sanitizeBiographySections(items = []) {
  return (Array.isArray(items) ? items : [])
    .map(item => {
      const position = String(item?.position || '').trim() === 'afterWorks' ? 'afterWorks' : 'afterIntro';
      const mode = String(item?.mode || '').trim() === 'list' ? 'list' : 'text';
      return {
        position,
        mode,
        title: String(item?.title || '').trim(),
        text: String(item?.text || item?.body || '').trim()
      };
    })
    .filter(item => item.title || item.text)
    .slice(0, 16);
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
    sideWidth: clampBiographyNumber(data.sideWidth, 100, 35, 100),
    connectionPortraitHeight: clampBiographyNumber(data.connectionPortraitHeight, 68, 44, 140),
    biographyTitle: String(data.biographyTitle || 'Biografie').trim(),
    biographyText: String(data.biographyText || '').trim(),
    abilitiesTitle: String(data.abilitiesTitle || 'Fähigkeiten & Spezialgebiete').trim(),
    abilities: pairArray(data.abilities),
    extraSections: sanitizeBiographySections(data.extraSections),
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

function sanitizeGoodsCategories(items = []) {
  const used = new Set();
  return (Array.isArray(items) ? items : [])
    .map((item, index) => {
      const rawId = String(item?.id || '').trim();
      const label = String(item?.label || item?.title || item?.name || rawId || '').trim();
      const id = slugify(rawId || label || `kategorie-${index + 1}`, `kategorie-${index + 1}`);
      return { id, label };
    })
    .filter(item => item.id && item.label)
    .filter(item => {
      if (used.has(item.id)) return false;
      used.add(item.id);
      return true;
    })
    .slice(0, 12);
}

function getDefaultGoodsColumns() {
  return [
    { id: 'name', label: 'Name' },
    { id: 'kind', label: 'Art' },
    { id: 'description', label: 'Beschreibung' },
    { id: 'price', label: 'Preis' },
    { id: 'availability', label: 'Verfuegbar' }
  ];
}

function sanitizeGoodsColumns(items = []) {
  const source = Array.isArray(items) && items.length ? items : getDefaultGoodsColumns();
  const used = new Set();
  return source
    .map((item, index) => {
      const rawId = String(item?.id || '').trim();
      const label = String(item?.label || item?.title || rawId || `Spalte ${index + 1}`).trim();
      const id = slugify(rawId || label || `spalte-${index + 1}`, `spalte-${index + 1}`);
      return { id, label };
    })
    .filter(item => item.id && item.label)
    .filter(item => {
      if (used.has(item.id)) return false;
      used.add(item.id);
      return true;
    })
    .slice(0, 10);
}

function getGoodsRowValue(item, columnId) {
  if (item?.values && Object.prototype.hasOwnProperty.call(item.values, columnId)) {
    return item.values[columnId];
  }
  if (Object.prototype.hasOwnProperty.call(item || {}, columnId)) return item[columnId];
  if (columnId === 'name') return item?.name || item?.title || '';
  if (columnId === 'kind') return item?.kind || item?.type || '';
  if (columnId === 'description') return item?.description || item?.text || '';
  if (columnId === 'availability') return item?.availability || item?.stock || '';
  return '';
}

function sanitizeGoodsRows(items = [], columns = getDefaultGoodsColumns()) {
  const safeColumns = sanitizeGoodsColumns(columns);
  return (Array.isArray(items) ? items : [])
    .map(item => {
      const values = {};
      safeColumns.forEach(column => {
        values[column.id] = String(getGoodsRowValue(item, column.id) || '').trim();
      });
      return {
        image: String(item?.image || item?.icon || '').trim(),
        category: slugify(item?.category || item?.categoryId || getGoodsRowValue(item, 'kind') || 'sonstiges', 'sonstiges'),
        values
      };
    })
    .filter(item => item.image || Object.values(item.values).some(Boolean))
    .slice(0, 120);
}

function sanitizeGoodsItems(items = []) {
  return (Array.isArray(items) ? items : [])
    .map(item => ({
      image: String(item?.image || item?.icon || '').trim(),
      name: String(item?.name || item?.title || '').trim(),
      kind: String(item?.kind || item?.type || '').trim(),
      category: slugify(item?.category || item?.categoryId || item?.kind || 'sonstiges', 'sonstiges'),
      description: String(item?.description || item?.text || '').trim(),
      price: String(item?.price || '').trim(),
      availability: String(item?.availability || item?.stock || '').trim()
    }))
    .filter(item => item.image || item.name || item.kind || item.description || item.price || item.availability)
    .slice(0, 80);
}

function sanitizeGoodsTableBlock(table = {}, fallbackIndex = 0) {
  const columns = sanitizeGoodsColumns(table.columns);
  const rawRows = table.rows || table.goods || table.items || [];
  const rows = sanitizeGoodsRows(rawRows, columns);
  const categories = sanitizeGoodsCategories(table.categories);
  const knownCategories = new Set(categories.map(item => item.id));
  const derivedCategories = [];
  rows.forEach(row => {
    if (!row.category || knownCategories.has(row.category)) return;
    knownCategories.add(row.category);
    const kindColumn = columns.find(column => column.id === 'kind');
    derivedCategories.push({
      id: row.category,
      label: kindColumn ? row.values[kindColumn.id] || row.category.replace(/-/g, ' ') : row.category.replace(/-/g, ' ')
    });
  });

  return {
    id: slugify(table.id || table.title || `tabelle-${fallbackIndex + 1}`, `tabelle-${fallbackIndex + 1}`),
    title: String(table.title || `Tabelle ${fallbackIndex + 1}`).trim(),
    tableTitle: String(table.tableTitle || 'Alle Waren').trim(),
    categories: [...categories, ...derivedCategories].slice(0, 12),
    columns,
    rows
  };
}

function sanitizeGoodsTables(data = {}) {
  if (Array.isArray(data.tables) && data.tables.length) {
    return data.tables
      .map((table, index) => sanitizeGoodsTableBlock(table, index))
      .filter(table => table.title || table.rows.length || table.columns.length)
      .slice(0, 8);
  }

  const legacyColumns = sanitizeGoodsColumns([
    { id: 'name', label: data.nameLabel || 'Name' },
    { id: 'kind', label: data.kindLabel || 'Art' },
    { id: 'description', label: data.descriptionLabel || 'Beschreibung' },
    { id: 'price', label: data.priceLabel || 'Preis' },
    { id: 'availability', label: data.availabilityLabel || 'Verfuegbar' }
  ]);

  return [sanitizeGoodsTableBlock({
    id: 'waren',
    title: data.tableHeading || data.tableName || 'Waren',
    tableTitle: data.tableTitle || 'Alle Waren',
    categories: data.categories,
    columns: legacyColumns,
    rows: data.goods || data.items || []
  }, 0)];
}

function sanitizeGoodsInfoRows(items = []) {
  return (Array.isArray(items) ? items : [])
    .map(item => ({
      icon: String(item?.icon || item?.image || '').trim(),
      label: String(item?.label || item?.title || '').trim(),
      value: String(item?.value || item?.text || '').trim()
    }))
    .filter(item => item.icon || item.label || item.value)
    .slice(0, 12);
}

function sanitizeGoodsOffers(items = []) {
  return (Array.isArray(items) ? items : [])
    .map(item => ({
      image: String(item?.image || item?.icon || '').trim(),
      name: String(item?.name || item?.title || '').trim(),
      price: String(item?.price || '').trim()
    }))
    .filter(item => item.image || item.name || item.price)
    .slice(0, 16);
}

function sanitizeGoodsTableData(data = {}) {
  const tables = sanitizeGoodsTables(data);

  return {
    headerIcon: String(data.headerIcon || '').trim(),
    title: String(data.title || 'Warenverzeichnis').trim(),
    subtitle: String(data.subtitle || 'Waren, Dienste & Angebote').trim(),
    location: String(data.location || '').trim(),
    tables,
    coinIcon: String(data.coinIcon || '').trim(),
    sideTitle: String(data.sideTitle || 'Ueber diesen Ort').trim(),
    sideImage: String(data.sideImage || '').trim(),
    sideName: String(data.sideName || '').trim(),
    sideText: String(data.sideText || '').trim(),
    infoRows: sanitizeGoodsInfoRows(data.infoRows),
    offerTitle: String(data.offerTitle || 'Angebote').trim(),
    offerMeta: String(data.offerMeta || '').trim(),
    offers: sanitizeGoodsOffers(data.offers),
    noteTitle: String(data.noteTitle || 'Hinweis').trim(),
    noteText: String(data.noteText || '').trim(),
    footer: String(data.footer || 'Almanach-Archiv - Warenregister').trim()
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
