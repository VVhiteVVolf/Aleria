// Current personal service that the house's liege field cannot express.
export const PERSONAL_SERVICE = {
  gafyr: [
    ['haus-chamois', 'dyror-chamois', 'Dyror', 'Waffenknecht der Gafyr'],
  ],
  wyrm: [
    ['glynmor', 'person-2a5e7890', 'Emlyn Glynmor', 'Vogt des Hauses Wyrm'],
    ['glynmor', 'person-64064dfd', 'Eleri Glynmor', 'Küchenmeisterin des Hauses Wyrm'],
    ['glynmor', 'person-d665a54d', 'Meera Glynmor', 'Zofe von Rianna Wyrm'],
  ],
  saethwyr: [
    ['haus-saethwyr', 'melyn-arth', 'Melyn Saethwyr', 'Kommandantin der Saethwyr-Truppen'],
  ],
};

// The Marchwern house page gives the whole household's current service explicitly.
export const SERVICE_HOUSES = { 'haus-marchwern': 'wyrm' };

// Existing civilian households with no recorded allegiance in the local sources.
export const FREE_HOUSES = new Set([
  'perllan', 'haus-caeffyn', 'haus-ruddgraen', 'haus-cochdon', 'haus-llythfor', 'haus-valerus',
]);

// Documented departures and personal obligations that supersede family affiliation.
export const OTHER_SERVICE = new Set([
  'house-aelmor/eirlys-aelmor', 'house-aelmor/anwen-aelmor',
  'house-argall/gwenella-spouse-rhydric-argall', 'house-argall/rhydric-argall', 'house-argall/perwyn-argall',
  'house-perllan/person-b57f28f9', 'house-perllan/person-02e7bc53',
  'house-cochdon/lleucu-swyll', 'house-caeffyn/kyria-aurdden', 'house-llythfor/esyllt-penrudd',
]);

export const STAFF = {
  saethwyr: [
    ['militaer', 'wachkommandant', 'haus-saethwyr', 'melyn-arth', 'Melyn Saethwyr'],
  ],
  gafyr: [
    ['militaer', 'wacht-bronfelen', 'haus-gostyn', 'derfel-gostyn', 'Derfel Gostyn'],
    ['hof-hausmacht', 'waffenknecht', 'haus-chamois', 'dyror-chamois', 'Dyror'],
    ['unterhaltung', 'hofbarde', 'haus-chamois', 'lleirys-chamois', 'Lleirys Chamois'],
  ],
  wyrm: [
    ['militaer', 'wacht-brynmawr', 'haus-wyrm', 'sion-wyrm', 'Sion Wyrm'],
    ['militaer', 'wacht-craithglyn', 'haus-loer', 'dwynarth-loer', 'Dwynarth Loer'],
    ['militaer', 'wacht-llysfaen', 'haus-rhyddid', 'gwydion-rhyddid', 'Gwydion Rhyddid'],
    ['hof', 'vogt', 'glynmor', 'person-2a5e7890', 'Emlyn Glynmor'],
    ['hof', 'kueche', 'glynmor', 'person-64064dfd', 'Eleri Glynmor'],
    ['hof', 'zofe', 'glynmor', 'person-d665a54d', 'Meera Glynmor'],
  ],
};

export const TERRITORIAL_NAME_NOTES = {
  'saethwyr/Glastraeth': 'Die Herrschaftsseite führt Gwenhwyfar, die Hauschronik nennt Morgaine Chwedonol als gegenwärtige Lehenswartin.',
};

export const COURT_NAME_NOTES = {
  'saethwyr/Kommandant der Garde': 'Die Hofliste nennt Melyn Saethwyr mit offener Identitätszuordnung. Ihre Personenakte belegt den Truppenbefehl unter dem Marschall.',
};

// The public town records identify these additional local officeholders.
export const SETTLEMENT_APPOINTMENT_SOURCES = {
  wyrm: [
    { placeId: 'bronhir', name: 'Trachmyr Trevandir', area: 'ortsrat-bronhir', slot: 'buergermeister', role: /^Bürgermeister/u },
    { placeId: 'craithglyn', name: 'Rhun Tynged', area: 'finanzen', slot: 'rentmeister-craithglyn',
      role: /^Steuermeister/u, title: 'Steuermeister von Craithglyn' },
  ],
};
