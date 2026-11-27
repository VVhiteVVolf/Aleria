import { prepareOfficePlan } from './office-plan-assembly.mjs';
import { officeIcon } from './office-icons.mjs';
import { geographicKey } from '../world-directory/geographic-key.mjs';
import { rankOf } from './scopes.mjs';

const group = (id, title, icon, posts, description = '') => ({ id, title, icon, posts, description });

const troopGroups = ['hausaufgebot', 'hausaufgebot-offiziere', 'hausaufgebot-mannschaft'];
const houseCaptain = {
  kind: 'other', title: 'Hauptmann der Hausmacht', templateId: 'r-hauptmann-hausmacht',
  description: 'Führt eine Abteilung des Adelshauses mit seinen Leutnanten und Unteroffizieren.',
};
const formerArmoryAssistant = { title: 'Waffenknecht der Rüstkammer', kind: 'service', templateId: 'r-gehilfe' };
const formerAssistantIds = ['gehilfe', 'gehilfe-2', 'gehilfe-3', 'gehilfe-4'];
const formerArmoryPosts = {
  ...Object.fromEntries(formerAssistantIds.map(id => [id, formerArmoryAssistant])),
  sonderdienst: { title: 'Schleifer', kind: 'special', templateId: 'r-sonderdienst' },
};
const formerLadyPages = Object.fromEntries(formerAssistantIds.map(id => [id, null]));

function militaryGroups(guard) {
  const [captains, officers, troops] = troopGroups;
  return [
    group('hausmacht-adjutantur', 'Adjutantur der Hausmacht', 'records', [
      { id: 'adjutant', title: 'Adjutant des Kommandanten der Hausmacht', icon: 'records',
        description: 'Bereitet Befehle, Meldungen und Dienstübergaben für den Kommandanten vor.',
        reportsTo: 'dem Kommandanten der Hausmacht' },
    ]),
    group('leibgarde', 'Leibgarde', 'watch', [
      { ...guard, key: 'hof/garde', title: 'Hauptmann der Leibgarde', icon: 'command',
        reportsTo: 'dem Kommandanten der Hausmacht',
        description: 'Führt die ausgewählte Leibgarde zum persönlichen Schutz der Mitglieder des Adelshauses.' },
      ['leutnant', 'Leutnant der Leibgarde', 'Vertritt den Hauptmann und ordnet den täglichen Gardedienst.', 'command', 'other', { prince: 1, barony: 2, county: 2 }],
      ['garderitter', 'Ritter der Leibgarde', 'Versieht den ritterlichen Schutz- und Geleitdienst der Leibgarde.', 'arms', 'other', { prince: 4, barony: 5, county: 5 }],
      ['gardist', 'Gardist', 'Übernimmt den zugewiesenen persönlichen Wach- und Begleitdienst.', 'watch', 'service', { prince: 6, barony: 9, county: 10 }],
      ['gardeknecht', 'Waffenknecht der Leibgarde', 'Unterstützt die Leibgarde bei ihrem täglichen Dienst und hält das Gerät bereit.', 'arms', 'service', 4],
      ['garde-rekrut', 'Rekrut der Leibgarde', 'Wird für den Wach- und Begleitdienst der Leibgarde ausgebildet.', 'learning', 'service', { prince: 2, barony: 3, county: 5 }],
      ['garde-knappe', 'Knappe der Leibgarde', 'Lernt im Dienst eines Garderitters.', 'learning', 'service', { prince: 2, barony: 3, county: 5 }],
      ['garde-page', 'Page der Leibgarde', 'Hilft im Haushalt eines Garderitters und lernt seinen Dienst kennen.', 'learning', 'service', { prince: 2, barony: 3, county: 5 }],
    ], 'Die Leibgarde ist der ausgewählte persönliche Schutz der Hausmitglieder. Ihr Hauptmann untersteht dem Kommandanten der Hausmacht.'),
    group(captains, 'Hausmacht – Waffenknechte & Ritter', 'arms', [
      ['hauptmann-hausmacht', houseCaptain.title, houseCaptain.description, 'command', houseCaptain.kind, { prince: 2, barony: 2, county: 4 }],
    ], 'Die Hauptleute führen Abteilungen des Adelshauses. Für eine Abteilung lässt sich bei Bedarf ein Standort angeben.'),
    group(officers, 'Leutnante, Bannerführer und Unteroffiziere der Hausmacht', 'command', [
      ['leutnant-hausmacht', 'Leutnant der Hausmacht', 'Vertritt seinen Hauptmann und führt die zugewiesene Abteilung.', 'command', 'other', 3],
      ['bannerfuehrer-hausmacht', 'Bannerführer der Hausmacht', 'Führt das Banner einer Einheit und hält ihre Mannschaft zusammen.', 'command', 'other', 4],
      ['unteroffizier-hausmacht', 'Unteroffizier der Hausmacht', 'Leitet die ihm unterstellten Dienstgruppen.', 'watch', 'service', 4],
    ], 'Diese Dienstgrade stehen unter den Hauptleuten und führen die zugeteilten Einheiten.'),
    group(troops, 'Hausritter, Waffenknechte und Knappen', 'arms', [
      ['hausritter', 'Hausritter', 'Dient im weiteren ritterlichen Aufgebot des Hauses.', 'arms', 'other', 8],
      ['waffenknecht', 'Waffenknecht der Hausmacht', 'Versieht allgemeinen Wach-, Geleit- und Ausrüstungsdienst im Aufgebot.', 'watch', 'service', 12],
      ['knappe', 'Knappe der Hausmacht', 'Begleitet einen Hausritter in Ausbildung und täglichem Dienst.', 'learning', 'service', 4],
      ['bannertraeger', 'Bannerträger der Hausmacht', 'Führt das Zeichen des zugeteilten Fähnleins.', 'command', 'special', 2],
    ], 'Hausritter, Waffenknechte, Knappen und Bannerträger gehören dem Adelshaus und dienen in seinen Abteilungen.'),
  ];
}

function houseMusterSites(places) {
  return places.map(({ name }) => ({
    key: `hof-hausmacht/hauptmann-${geographicKey(name)}`, name, type: 'station', placements: troopGroups,
  }));
}

function formerHouseCaptains(sites) {
  return Object.fromEntries(sites.map(site => [site.key.split('/')[1], { ...houseCaptain, site: site.key }]));
}

const major = {
  vogt: [
    group('vogtskanzlei', 'Vogtskanzlei', 'records', [
      ['untervogt', 'Untervogt', 'Vertritt den Vogt in den ihm übertragenen Geschäften.', 'coordination'],
      ['registermeister', 'Registermeister der Vogtei', 'Führt das Verzeichnis der Güter, Rechte und Aufträge.', 'records'],
      ['vogtschreiber', 'Vogtschreiber', 'Hält Eingaben, Bescheide und Fristen fest.', 'records', 'service', 2],
      ['vogtsbote', 'Vogtsbote', 'Überbringt Aufträge und Antworten der Vogtei.', 'courier', 'service', 2],
    ]),
    group('hofgueter', 'Hofgüter und Liegenschaften', 'works', [
      ['hofmeier', 'Hofmeier', 'Koordiniert die laufende Wirtschaftsführung der Hofgüter.', 'coordination'],
      ['gutsverwalter', 'Gutsverwalter', 'Führt die ihm zugeteilten Güter und berichtet an die Vogtei.', 'works', 'other', 3],
      ['pachtmeister', 'Pachtmeister', 'Führt Pachtverträge, Fristen und Übergaben nach.', 'money', 'other', 2],
      ['flurwart', 'Flurwart', 'Hält den Zustand der Fluren und Wege fest.', 'garden', 'service', 2],
      ['gutspruefer', 'Gutsprüfer', 'Prüft beauftragte Bestände und Übergaben.', 'inquiry', 'special', 1],
    ]),
  ],
  schatzmeister: [
    group('schatzkammer', 'Schatzkammer und Hauskasse', 'money', [
      ['kassenmeister', 'Kassenmeister', 'Führt die Hauskasse unter dem Schatzmeister.', 'money'],
      ['schluesselwart', 'Schlüsselwart der Schatzkammer', 'Verwahrt Schlüssel und protokolliert Zugänge.', 'records'],
      ['schatzschreiber', 'Schatzschreiber', 'Erfasst Werte, Einnahmen, Ausgaben und Rücklagen.', 'records', 'service', 2],
      ['kassengehilfe', 'Kassengehilfe', 'Bereitet Wechselgeld und Zahlungsbelege vor.', 'money', 'service', 2],
      ['hauszahlmeister', 'Hauszahlmeister', 'Zahlt bewilligte Löhne und quittiert Ausgaben.', 'money', 'other', 2],
    ]),
    group('rechnung', 'Rechnungsprüfung und Verwahrung', 'inquiry', [
      ['rechnungspruefer', 'Rechnungsprüfer des Hauses', 'Gleicht Bücher, Empfangsbelege und Istbestand ab.', 'inquiry', 'other', 2],
      ['schaetzer', 'Schätzer der Schatzkammer', 'Schätzt die Werte anvertrauter Güter.', 'money', 'special', 2],
      ['schatzbote', 'Schatzbote', 'Übermittelt bestätigte Belege und Zahlungsanweisungen.', 'courier', 'service', 2],
    ]),
  ],
  hofmeister: [
    group('hoflehre', 'Lehre und Mentorat am Hof', 'learning', [
      ['hoflehrer', 'Hoflehrer', 'Unterrichtet Hofsitte, Umgangsformen und höfische Pflichten.', 'learning', 'other', 2],
      ['mentor', 'Mentor am Hof', 'Begleitet einzelne junge Hofangehörige bei ihrer Ausbildung und gibt ihnen Rückmeldung.', 'coordination', 'other', 2],
      ['lehrgehilfe', 'Lehrgehilfe', 'Bereitet Unterrichtsmaterial und Übungen vor.', 'records', 'service', 2],
      ['lehrpage', 'Page in höfischer Ausbildung', 'Lernt Hofsitte und erprobt sie unter Anleitung in alltäglichen Aufgaben.', 'learning', 'service', 3],
    ]),
  ],
  waffen: [
    group('waffenlehre', 'Waffenlehre des Hauses', 'learning', [
      ['stellvertretung', 'Stellvertreter und Nachfolger', 'Vertritt den Waffenmeister im Unterricht und bereitet sich unter seiner Anleitung auf die Nachfolge vor.', 'coordination'],
      ['lehrmeister', 'Lehrmeister', 'Unterrichtet die jungen Angehörigen des Hauses und begleitet ihre Ausbildung unter dem Waffenmeister.', 'learning', 'other', { prince: 4, barony: 4, county: 4 }],
    ]),
    group('ruestkammer', 'Rüstkammer', 'arms', [
      { id: 'fachdienst', title: 'Rüst- und Waffenwart', icon: 'arms', removable: true,
        description: 'Verwahrt Waffen und Rüstzeug, stellt die Ausrüstung für den Unterricht bereit und meldet Reparaturbedarf.' },
    ]),
  ],
  handwerk: [
    group('schmiede', 'Schmiede des Hauses', 'works', [
      { id: 'schmiedemeister', title: 'Schmiedemeister', icon: 'works', reportsTo: 'dem Handwerksmeister',
        description: 'Leitet die Schmiede im Auftrag des Handwerksmeisters, verteilt die Arbeit und begleitet die Ausbildung in der Werkstatt.' },
      ['schmiedegeselle', 'Schmiedegeselle', 'Fertigt und repariert Metallarbeiten für den Hof und leitet Lehrlinge bei zugeteilten Arbeiten an.', 'works', 'service', { prince: 4, barony: 4, county: 4 }],
      ['schmiedelehrling', 'Schmiedelehrling', 'Lernt das Schmiedehandwerk und arbeitet unter Aufsicht in der Werkstatt mit.', 'learning', 'service', { prince: 2, barony: 2, county: 2 }],
    ]),
  ],
  kaplan: [
    group('kaplanei', 'Kaplanei des Hofes', 'faith', [
      ['stellvertretung', 'Stellvertretung', 'Vertritt den Hofkaplan in den übertragenen Kapellendiensten und teilt die Bediensteten ein.', 'coordination'],
      { id: 'fachdienst', title: 'Schreiber des Hofkaplans', icon: 'records', removable: true,
        description: 'Führt das Kapellenbuch, den Schriftverkehr und die Verzeichnisse der Stiftungen.' },
    ]),
    group('kaplan-heilkunde', 'Heilkundlicher Dienst', 'care', [
      ['heiler', 'Heiler', 'Betreut Kranke und Verletzte des Hofes und stimmt die Versorgung mit dem Hofkaplan ab.', 'care', 'other', { prince: 1, barony: 2, county: 4 }],
    ]),
    group('kapellendienst', 'Seelsorge und Kapellendienst', 'faith', [
      ['seelsorger', 'Seelsorger', 'Begleitet Angehörige und Bedienstete des Hofes in geistlichen und persönlichen Anliegen.', 'faith'],
      ['gehilfe', 'Akolyth', 'Assistiert beim Gottesdienst und lernt die Aufgaben des Kapellendiensts.', 'learning', 'service', { prince: 2, barony: 3, county: 4 }],
      ['sonderdienst', 'Sakristan', 'Verwahrt liturgisches Gerät, Gewänder und Bücher und bereitet die Kapelle vor.', 'faith', 'special'],
      ['kapellendiener', 'Kapellendiener', 'Hält Kapelle und Nebenräume bereit und hilft bei den praktischen Vorbereitungen.', 'hospitality', 'service'],
    ]),
  ],
};

function householdGroups(household, house) {
  const [maid, valet] = ['zofe', 'kammerdiener'].map(id => household.find(slot => slot.id === id));
  const additionalMaids = house.id === 'gafyr' ? 7 : 3;
  return [
    group('hausdienst', 'Haushalt und Dienerschaft', 'hospitality', [
      ['hausdiener', 'Hausdiener', 'Übernimmt die vom Vogt zugeteilten Dienste in den Räumen und am Hof.', 'hospitality', 'service', 4],
      ['dienstmaedchen', 'Dienstmädchen', 'Versieht die vom Vogt zugeteilten praktischen Hausdienste.', 'hospitality', 'service', 4],
      ['hausknecht', 'Hausknecht', 'Übernimmt Besorgungen, Transporte und praktische Arbeiten nach Einteilung des Vogtes.', 'supplies', 'service', 4],
    ]),
    group('zofen', 'Zofen', 'hospitality', [
      { ...maid, key: 'hof/zofe', kind: 'service', templateId: maid.title === 'Zofe' ? 'r-zofenstelle' : 'r-zofe-rianna', templateTitle: maid.title },
      ['zofenstelle', 'Zofe', 'Übernimmt persönliche Dienste für die anvertraute Hofangehörige.', 'hospitality', 'service', additionalMaids],
    ]),
    group('kammerdiener', 'Kammerdiener', 'hospitality', [
      { ...valet, key: 'hof/kammerdiener', kind: 'service', templateId: 'r-kammerstelle' },
      ['kammerstelle', 'Kammerdiener', 'Betreut Kleidung, persönliche Räume und Reisevorbereitungen.', 'hospitality', 'service', 3],
    ]),
  ];
}

const subordinate = {
  archiv: ['records', 'Urkundenschreiber', 'Registraturgehilfe', 'Siegelprüfer'],
  kerker: ['watch', 'Kerkeraufseher', 'Schlüsselgehilfe', 'Versorgungsdiener'],
  zeremonien: ['hospitality', 'Zeremonienschreiber', 'Empfangsgehilfe', 'Protokollkundiger'],
  mundschenk: ['hospitality', 'Schenkgehilfe', 'Kellerdiener', 'Kellerwart'],
  kueche: ['supplies', 'Koch', 'Küchengehilfe', 'Vorratswart'],
  brot: ['supplies', 'Hofbäcker', 'Backgehilfe', 'Mehlwart'],
  narr: ['music', 'Spielleute', 'Requisitengehilfe', 'Schauspieler'],
  hofdame: ['hospitality', 'Gesellschafter', null, 'Begleiter bei Empfängen'],
  stall: ['horse', 'Stallknecht', 'Pferdepfleger', 'Hufschmied'],
  jagd: ['scouting', 'Jagdgehilfe', 'Treiber', 'Fährtenleser'],
  hafen: ['sailing', 'Hafenaufseher', 'Kaidiener', 'Lotse'],
  handwerk: ['works', 'Hofhandwerker', 'Handwerksgehilfe', 'Materialwart'],
  garten: ['garden', 'Gärtner', 'Gartengehilfe', 'Gewächshauswart'],
  falkner: ['scouting', 'Falknergehilfe', 'Vogelpfleger', 'Fütterungswart'],
  zwinger: ['scouting', 'Hundeführer', 'Zwingergehilfe', 'Futterwart'],
  hofmagier: ['arcane', 'Arkaner Gehilfe', 'Schreiber des Hofmagiers', 'Gutachter für magische Fragen'],
  kartograf: ['records', 'Kartenzeichner', 'Gehilfe der Vermessung', 'Kartenprüfer'],
};

function minorGroup(office) {
  const [icon, first, second, third] = subordinate[office.type] || ['coordination', 'Schreibgehilfe', 'Dienstgehilfe', 'Sonderdienst'];
  return group('hofdienst', 'Untergeordnete Hofdienste', icon, [
    ['stellvertretung', 'Stellvertretung', `Vertritt das Amt „${office.title}“ bei übertragenen Aufgaben.`, icon],
    ['fachdienst', first, `Übernimmt die fachlichen Dienste im Aufgabenbereich „${office.title}“.`, icon, 'other', 1],
    ...(second ? [['gehilfe', second, 'Unterstützt den laufenden Dienst und meldet seinen Bedarf an die Leitung.', icon, 'service', 2]] : []),
    ['sonderdienst', third, 'Übernimmt besondere Aufträge im Rahmen des Hofamts.', icon, 'special', 1],
    ...(office.id === 'hofdame' ? [['weitere-hofdame', 'Weitere Hofdame', 'Begleitet die Herrin und ihre Töchter bei höfischen Pflichten.', 'hospitality', 'other', 2]] : []),
  ]);
}

function expandGroup(source, house) {
  const slots = source.posts.flatMap(post => {
    if (!Array.isArray(post)) return [post];
    const [id, title, description, icon, kind, count = 1] = post;
    const rank = house.rank || (house.county ? 'county' : 'prince');
    const copies = typeof count === 'number'
      ? (count === 1 ? count : Math.ceil(count * rankOf(house).courtSize))
      : count[rank] ?? (rank === 'royal' ? count.county : 0);
    return Array.from({ length: copies }, (_, index) => ({
      id: index ? `${id}-${index + 1}` : id, title, description, icon,
      ...(kind ? { kind, templateId: `r-${id}` } : {}),
    }));
  });
  const { id, title, icon, description } = source;
  const reportsTo = { leibgarde: 'dem Hauptmann der Leibgarde', hausaufgebot: 'dem Kommandanten der Hausmacht', schmiede: 'dem Schmiedemeister',
    'hausaufgebot-offiziere': 'dem zuständigen Hauptmann der Hausmacht', 'hausaufgebot-mannschaft': 'dem zuständigen Hauptmann der Hausmacht',
    waffenlehre: 'dem Waffenmeister', ruestkammer: 'dem Waffenmeister', kaplanei: 'dem Hofkaplan',
    'kaplan-heilkunde': 'dem Hofkaplan', kapellendienst: 'dem Hofkaplan' }[id];
  if (reportsTo) for (const slot of slots) slot.reportsTo ||= reportsTo;
  return { id, title, icon, description, slots, repeatableHere: true };
}

export function buildCourtDepartments(house, court, courtDefinition, appointments) {
  return Object.fromEntries(court.slots.map(office => {
    const id = `hof-${office.id}`;
    let groups = major[office.type];
    const isHouseCommand = office.id === 'hausmacht';
    const isWeaponMaster = office.type === 'waffen';
    const isLadyInWaiting = office.type === 'hofdame';
    const sites = isHouseCommand ? houseMusterSites(house.places) : [];
    if (isHouseCommand) groups = militaryGroups(courtDefinition.guard);
    if (office.id === 'vogt') groups = [...groups, ...householdGroups(courtDefinition.household, house)];
    if (office.type === 'handwerk') groups = [...groups, minorGroup(office)];
    groups ||= [minorGroup(office)];
    office.department = id;
    const plan = prepareOfficePlan(house, id, {
      head: office, sections: groups.map(source => expandGroup(source, house)),
      sites,
      retired: isHouseCommand ? { hauptmann: houseCaptain, ...formerHouseCaptains(sites) }
        : isWeaponMaster ? formerArmoryPosts : isLadyInWaiting ? formerLadyPages : {},
      suggestions: isWeaponMaster ? [] : [
        ['service', 'Dienstgehilfe', 'Unterstützt die ihm zugeteilten Aufgaben des Hofamts.'],
        ['special', 'Sonderdienst', 'Übernimmt einen einzelnen besonderen Auftrag des Hofamts.'],
        ['other', 'Hofdienst', 'Versieht laufende Aufgaben im Bereich dieses Hofamts.'],
      ],
    }, appointments);
    const allied = office.id === 'hofmeister' ? ['waffen', 'stall', 'kaplan', 'hofdame']
      : office.id === 'kueche' ? ['brot'] : [];
    const connections = court.slots.filter(slot => allied.includes(slot.id)).map(slot => ({
      key: slot.key, department: `hof-${slot.id}`, title: slot.title,
    }));
    return [id, { ...plan, connections, department: { id, name: office.title, imageSrc: office.image || officeIcon('court') } }];
  }));
}
