// Cultural starting packages, not biological species or automatic citizenship.
// One selected package uses the same +2/+1 budget and three skill suggestions.
// Regional options replace the general package; they never add another bonus.
const REGIONS = '/Stammbäume/assets/images/regions';
const ACCEPTED = '/Stammbäume/assets/images/houses/accepted-realms';
const CULTURE_ICONS = '/AleriaAlmanach/public/assets/character-origins';
const ALBEN_ICON = `${CULTURE_ICONS}/alben.png`;
const NORDMANN_ICON = `${CULTURE_ICONS}/nordmann.png`;

function origin(spec) {
  return Object.freeze({
    originKind: 'culture',
    group: 'Kulturelle Herkunft',
    aliases: [],
    rulesNote: 'Kulturelles Ausbildungspaket: genau eine Herkunft wählen. Attributsboni sind Ausgangswerte; Fertigkeiten werden nur als manuell übernehmbare Vorschläge angeboten.',
    culturalTraits: [`Kulturelle Prägung · ${spec.label}`],
    ...spec
  });
}

const established = [
  origin({ id: 'cenyr', label: 'Cenyr', aliases: ['Cenyri'], countryId: 'cenyr', continent: 'Estryll',
    icon: `${REGIONS}/koenigreich-cenyr.png`, pagePath: '/Kontinente/Estryll/Königreich Cenyr/Königreich von Cenyr.html',
    description: 'Cenyri verbinden körperliche Stärke mit höfischer Präsenz und religiös geprägter Bildung.',
    attributeBonuses: { strength: 2, charisma: 1 }, skillProficiencies: ['Überzeugen', 'Auftreten', 'Religion'],
    culturalTraits: ['Cenyri Kultur', 'Höfische und religiöse Prägung'],
    sourcePaths: ['Klassenordner/Cenyr/kultur.json'] }),
  origin({ id: 'alben', label: 'Alben', aliases: ['Albisch'], icon: ALBEN_ICON,
    pagePath: '/Kontinente/Alben/Der Schild von Ailith.html',
    description: 'Alben sind beweglich, naturverbunden und für ein Leben zwischen Wildnis und Tierwelt geschult.',
    attributeBonuses: { dexterity: 2, wisdom: 1 }, skillProficiencies: ['Mit Tieren umgehen', 'Naturkunde', 'Überleben'],
    culturalTraits: ['Albische Naturverbundenheit'],
    sourcePaths: ['Kontinente/modules/alben/culture.source.json', 'Klassenordner/Alben/kultur.json'] }),
  origin({ id: 'aldrimarer', label: 'Aldrimarer', aliases: ['Aldrimar', 'Aldrimari'], countryId: 'aldrimar', continent: 'Estryll',
    icon: `${REGIONS}/aldrimar.png`, pagePath: '/Kontinente/Estryll/Königreich Aldrimar/Königreich von Aldrimar.html',
    description: 'Aldrimarer zeichnen sich durch Kraft, Zähigkeit und praktische Erfahrung in Tierhaltung und Wildnis aus.',
    attributeBonuses: { strength: 2, constitution: 1 }, skillProficiencies: ['Athletik', 'Mit Tieren umgehen', 'Überleben'],
    culturalTraits: ['Aldrimarische Widerstandskraft'],
    sourcePaths: ['Kontinente/modules/aldrimar/kingdom.source.json', 'Klassenordner/Aldrimar/kultur.json'] }),
  origin({ id: 'nordmann', label: 'Nordmann', aliases: ['Nordmänner', 'Nordmaenner', 'Norrnaigh'], icon: NORDMANN_ICON,
    pagePath: '/Klassenordner/Klassenseite.html#nordmaenner',
    description: 'Nordmänner sind widerstandsfähig, kraftvoll und an entbehrungsreiche Lebensräume gewöhnt.',
    attributeBonuses: { constitution: 2, strength: 1 }, skillProficiencies: ['Überleben', 'Einschüchtern', 'Körperbeherrschung'],
    culturalTraits: ['Nordische Zähigkeit'], sourcePaths: ['Klassenordner/Nordmaenner/kultur.json'] })
];

const national = [
  origin({ id: 'vennyr', label: 'Vennyr', aliases: ['Vennyri', 'Vennyrer'], countryId: 'vennyr', continent: 'Estryll',
    icon: `${REGIONS}/vennyr.png`, pagePath: '/Kontinente/Estryll/Königreich Vennyr/Königreich Vennyr.html',
    description: 'Vennyri bewahren die Küsten- und Rittertradition ihres früheren Königreichs. Seefahrt, Wachsamkeit und der Umgang mit wechselndem Untergrund prägen dieses Ausbildungspaket; die heutige Herrschaft Fjordheims ändert die Herkunft nicht.',
    attributeBonuses: { dexterity: 2, constitution: 1 }, skillProficiencies: ['Athletik', 'Wahrnehmung', 'Überleben'],
    sourcePaths: ['Kontinente/modules/vennyr/pages.source.json', 'Klassenordner/Vennyr/kultur.json'] }),
  origin({ id: 'morgorn', label: 'Morgorn', aliases: ['Morgorner'], countryId: 'morgorn',
    icon: `${REGIONS}/morgorn.png`, pagePath: '/Klassenordner/Klassenseite.html#morgorn',
    description: 'Morgorns Hallen- und Kastenkultur betont verlässlichen Dienst, Handwerk und die Verantwortung für anvertrautes Gut. Das Paket verbindet Ausdauer mit sorgfältiger, sachkundiger Arbeit; eine Kaste oder ein Adelstitel wird dadurch nicht vergeben.',
    attributeBonuses: { constitution: 2, intelligence: 1 }, skillProficiencies: ['Athletik', 'Geschichte', 'Nachforschungen'],
    sourcePaths: ['Klassenordner/Morgorn/kultur.json'] }),
  origin({ id: 'alwener', label: 'Alwener', aliases: ['Goldmund', 'Goldmunder'], countryId: 'goldmund', continent: 'Lothir',
    icon: `${ACCEPTED}/goldmund/goldmund.webp`, pagePath: '/Kontinente/Lothir/Goldmund/herzogtum-goldmund/index.html',
    description: 'Die Alwener Goldmunds leben in einem goldreichen Gebirgsland mit ausgeprägtem Bankwesen und kaiserlicher Verwaltungstradition. Dieses Paket schult Berechnung, Verhandlung und das Lesen gesellschaftlicher Interessen; es gewährt weder Vermögen noch Stand.',
    attributeBonuses: { intelligence: 2, charisma: 1 }, skillProficiencies: ['Überzeugen', 'Motiv erkennen', 'Geschichte'],
    sourcePaths: ['Kontinente/modules/goldmund/goldmund-context.mjs', 'Kontinente/modules/goldmund/pages.source.json'] }),
  origin({ id: 'aldinger', label: 'Aldinger', aliases: ['Aldingen'], countryId: 'aldingen', continent: 'Lothir',
    icon: `${ACCEPTED}/aldingen/aldingen.webp`, pagePath: '/Kontinente/Lothir/Aldingen/grossherzogtum-aldingen/index.html',
    description: 'Aldingens kaiserliches Erbe verbindet militärischen Anspruch mit Häfen, Pferdezucht und geordneter Verwaltung. Körperliche Übung und planvolles Handeln bilden die Ausgangswerte; persönliche Ausrüstung oder Adel folgen daraus nicht.',
    attributeBonuses: { strength: 2, intelligence: 1 }, skillProficiencies: ['Athletik', 'Geschichte', 'Überzeugen'],
    sourcePaths: ['Kontinente/modules/aldingen/pages.source.json', 'Vorschau/Aldingen/realm-context.mjs'] }),
  origin({ id: 'blutstadt', label: 'Blutstädter', aliases: ['Blutstadt', 'Blutstaedter'], countryId: 'blutstadt', continent: 'Lothir',
    icon: '/Vorschau/Blutstadt/assets/crests/blutstadt.webp', pagePath: '/Vorschau/Blutstadt/',
    description: 'Die Blutstadt ist aus Gildenbund und Kaiserstadt hervorgegangen und bildet heute ein Zentrum von Kirche, Gilden, Orden und Zünften. Ihr kulturelles Paket fördert städtische Bildung, öffentliche Rede und Kenntnis der überlieferten Institutionen.',
    attributeBonuses: { intelligence: 2, charisma: 1 }, skillProficiencies: ['Religion', 'Geschichte', 'Überzeugen'],
    sourcePaths: ['Vorschau/Blutstadt/realm-context.mjs', 'Kontinente/modules/goldmund/goldmund-context.mjs'] }),
  origin({ id: 'weisenfluh', label: 'Weisenfluh', aliases: ['Weisenfluher'], countryId: 'weisenfluh', continent: 'Lothir',
    icon: `${ACCEPTED}/weisenfluh/weisenfluh.webp`, pagePath: '/Kontinente/Lothir/Weisenfluh/koenigreich-weisenfluh/index.html',
    description: 'Weisenfluh verbindet bewirtschaftetes Land, Flusswege und Handel mit der Ordnung des Erlenkönigtums. Ausdauer im Alltag und der verständige Umgang mit Nachbarn und Handelspartnern prägen dieses Paket.',
    attributeBonuses: { constitution: 2, charisma: 1 }, skillProficiencies: ['Athletik', 'Naturkunde', 'Überzeugen'],
    sourcePaths: ['Kontinente/modules/weisenfluh/pages.source.json', 'Kontinente/modules/goldmund/goldmund-context.mjs'] }),
  origin({ id: 'venalys', label: 'Venalier', aliases: ['Venalys', 'Venalisch'], countryId: 'venalys', continent: 'Tirnara',
    icon: '/Vorschau/Venalys/assets/crests/venalys.webp', pagePath: '/Vorschau/Venalys/',
    description: 'Venalys entstand aus einer Handelskolonie des Marktes der Fortuna. Verhandlung, kaufmännische Bildung und das Verständnis konkurrierender Interessen prägen dieses Stadtkulturpaket. Hauszugehörigkeit, Patrizierrang und Gildenzugang bleiben eigene Angaben.',
    attributeBonuses: { charisma: 2, intelligence: 1 }, skillProficiencies: ['Überzeugen', 'Motiv erkennen', 'Geschichte'],
    sourcePaths: ['Vorschau/Venalys/realm-context.mjs', 'AGENTS.md'] }),
  origin({ id: 'aeldrunmar', label: 'Aeldrunmar', aliases: ['Aeldrunmarer', 'Aeldrunmarisch'], countryId: 'aeldrunmar', continent: 'Aldervan',
    icon: `${ACCEPTED}/aeldrunmar/aeldrunmar.webp`, pagePath: '/Kontinente/Aldervan/Aeldrunmar/koenigreich-aeldrunmar/index.html',
    description: 'Aeldrunmars friedlich zusammengewachsene Kultur verbindet Felder, Viehzucht, Reitkunst und Seewege. Dieses Paket betont Tierkenntnis, umsichtiges Versorgen und praktische körperliche Arbeit; es verleiht kein Pferd.',
    attributeBonuses: { wisdom: 2, strength: 1 }, skillProficiencies: ['Mit Tieren umgehen', 'Überleben', 'Athletik'],
    sourcePaths: ['Kontinente/modules/aeldrunmar/pages.source.json', 'Vorschau/Aeldrunmar/realm-context.mjs'] }),
  origin({ id: 'talyndor', label: 'Talyndor', aliases: ['Talyndorer', 'Talyndorisch'], countryId: 'talyndor', continent: 'Aldervan',
    icon: `${ACCEPTED}/talyndor/talyndor.webp`, pagePath: '/Kontinente/Aldervan/Talyndor/koenigreich-talyndor/index.html',
    description: 'Talyndors Reiter- und Agrarkultur ist eng mit Aeldrunmar verwandt und besitzt eine eigene Tradition schwer gerüsteter Ritter und Fußkämpfer. Kraft, Tierkenntnis und die Erinnerung an die frühere Ordnung prägen das Paket. Die Besatzung durch die Triarchie bedeutet keine freiwillige Gefolgschaft.',
    attributeBonuses: { strength: 2, wisdom: 1 }, skillProficiencies: ['Mit Tieren umgehen', 'Athletik', 'Geschichte'],
    sourcePaths: ['Kontinente/modules/talyndor/pages.source.json'] }),
  origin({ id: 'brevanor', label: 'Brevanor', aliases: ['Brevanorer'], countryId: 'brevanor', continent: 'Aldervan',
    icon: `${ACCEPTED}/brevanor/brevanor.webp`, pagePath: '/Kontinente/Aldervan/Brevanor/koenigreich-brevanor/index.html',
    description: 'Aus den Briath und dem Fürstentum Brethneach erwuchs Brevanors eigenständige Hof- und Ritterkultur. Feiner Auftritt, Heldengeschichten und gesellige Tafeltraditionen prägen dieses Paket. Herkunft begründet weder Sektenzugehörigkeit noch Zustimmung zur Triarchie.',
    attributeBonuses: { charisma: 2, dexterity: 1 }, skillProficiencies: ['Auftreten', 'Überzeugen', 'Geschichte'],
    sourcePaths: ['Kontinente/modules/brevanor/pages.source.json', 'Vorschau/Brevanor/realm-context.mjs'] })
];

function albic(id, country, bonuses, skills, description, extras = {}) {
  return origin({ id, label: `Alben aus ${country}`, aliases: [country], countryId: id, cultureGroup: 'Alben',
    continent: 'Estryll',
    icon: ALBEN_ICON,
    attributeBonuses: bonuses, skillProficiencies: skills,
    description,
    sourcePaths: [`Kontinente/modules/${id}/pages.source.json`, 'Kontinente/modules/alben/principalities.source.json'],
    ...extras });
}

const albicOrigins = [
  albic('leitheach', 'Leitheach', { wisdom: 2, charisma: 1 }, ['Geschichte', 'Religion', 'Auftreten'],
    'Leitheach ist ein Kernland der Cruinach, der Kronalben. Überlieferung, religiöse Bildung und das Bewahren alter Bräuche bilden den Schwerpunkt dieses regionalen Kulturpakets.',
    { icon: `${REGIONS}/Leitheach/leitheach.png`, pagePath: '/Kontinente/Estryll/Fürstentum Leitheach/Fürstentum Leitheach.html' }),
  albic('aislearneach', 'Aislearneach', { dexterity: 2, wisdom: 1 }, ['Mit Tieren umgehen', 'Naturkunde', 'Überleben'],
    'Das albische Fürstentum Aislearneach wird aus der vorhandenen Fürstenclan-Akte um Gaelan geführt. Solange keine abweichende Ausbildung festgelegt ist, verwendet seine Herkunft das allgemeine albische Paket.',
    { icon: '/Stammbäume/assets/images/houses/Aislearneach/clan-ui-morna.png', pagePath: '/Kontinente/Estryll/Fürstentum Aislearneach/Fürstentum Aislearneach.html' }),
  albic('dunfal', 'Dunfal', { strength: 2, wisdom: 1 }, ['Athletik', 'Überleben', 'Geschichte'],
    'Dunfal ist das Fürstentum Cú Chulainns und der Hauptsitz der Fianna. Körperliche Übung und das Bewahren der Kriegerüberlieferung prägen dieses Paket; Fianna-Zugehörigkeit oder besondere Techniken werden nicht automatisch verliehen.',
    { icon: `${REGIONS}/Dunfal/dunfal.png`, pagePath: '/Kontinente/Estryll/Fürstentum Dunfal/Fürstentum Dunfal.html' }),
  albic('blaithneach', 'Blaithneach', { wisdom: 2, charisma: 1 }, ['Religion', 'Geschichte', 'Überzeugen'],
    'Blaithneach gehört zum Kulturkreis der Cruinach. Die überlieferten Bräuche, religiöse Bildung und die vermittelnde Rolle im Clanleben bilden hier die kulturellen Ausgangswerte.',
    { icon: `${REGIONS}/Blaithneach/blaithneach.png`, pagePath: '/Kontinente/Estryll/Fürstentum Blaithneach/Fürstentum Blaithneach.html' }),
  albic('uathneach', 'Uathneach', { dexterity: 2, wisdom: 1 }, ['Naturkunde', 'Überleben', 'Wahrnehmung'],
    'Uathneach bewahrt seine albische Kultur an der nördlichen Küste um Dunnean. Umsicht im Gelände und die vertraute Natur- und Wildnisausbildung bilden dieses regionale Paket.',
    { icon: `${REGIONS}/Uathneach/uathneach.webp`, pagePath: '/Kontinente/Estryll/Fürstentum Uathneach/Fürstentum Uathneach.html' }),
  albic('faelaorn', 'Faelaorn', { dexterity: 2, intelligence: 1 }, ['Überleben', 'Geschichte', 'Wahrnehmung'],
    'Faelaorns albische Kultur besteht um Piobarach fort. Das Paket verbindet bewegliche Geländeausbildung mit der Kenntnis der überlieferten Heimat; Besatzung oder Vertreibung begründen keinen Wechsel zum nordmännischen Paket.',
    { icon: `${REGIONS}/Faelaorn/faelaorn.png`, pagePath: '/Kontinente/Estryll/Fürstentum Faelaorn/Fürstentum Faelaorn.html' }),
  albic('iathneach', 'Iathneach', { dexterity: 2, wisdom: 1 }, ['Naturkunde', 'Überleben', 'Athletik'],
    'Iathneachs bewaldete Gebirgstäler, Flusswege und Inselküsten prägen eine weiterhin albische Kultur. Bewegliche Geländearbeit und Ortskenntnis stehen im Mittelpunkt dieses Herkunftspakets.',
    { icon: `${ACCEPTED}/iathneach/iathneach.webp`, continent: 'Lothir', pagePath: '/Kontinente/Lothir/Iathneach/fuerstentum-iathneach/index.html' }),
  albic('deitheach', 'Deitheach', { constitution: 2, wisdom: 1 }, ['Überleben', 'Naturkunde', 'Athletik'],
    'Die Herkunft Deitheachs erinnert an das albische Fürstentum zwischen bewaldeten Gebirgen, Tälern und westlicher Küste. Belastbarkeit und umsichtige Geländepraxis bilden dieses Paket; die gegenwärtige Besatzung ersetzt die kulturelle Herkunft nicht.',
    { icon: `${ACCEPTED}/deitheach/deitheach.webp`, continent: 'Aldervan', historical: true, pagePath: '/Kontinente/Aldervan/Deitheach/fuerstentum-deitheach/index.html' }),
  albic('moinneach', 'Moinneach', { wisdom: 2, constitution: 1 }, ['Überleben', 'Naturkunde', 'Heilkunde'],
    'Moinneachs große Sumpflandschaft verlangt Umsicht zwischen schwarzem Wasser, Pilzen, Mangroven und versunkenen Wegen. Das Paket betont Umweltkenntnis und Ausdauer; es erzeugt keine Gift- oder Krankheitsimmunität.',
    { icon: `${ACCEPTED}/moinneach/moinneach.png`, continent: 'Lothir', pagePath: '/Kontinente/Lothir/Moinneach/fuerstentum-moinneach/index.html' }),
  albic('ceitheach', 'Ceitheach', { wisdom: 2, dexterity: 1 }, ['Naturkunde', 'Überleben', 'Religion'],
    'Das historische Ceitheach war ein Fürstentum der Glaennath, der Flussalben. Naturkenntnis und überlieferte religiöse Praxis bestimmen dieses Paket. Überlebende behalten ihre Herkunft; aus dem heutigen Dunkelhain wird kein neues Volk abgeleitet.',
    { icon: `${REGIONS}/Ceitheach/ceitheach.png`, historical: true, pagePath: '/Kontinente/Estryll/Fürstentum Ceitheach/Fürstentum Ceitheach.html' }),
  ...[['lichthain', 'Lichthain'], ['hain-der-druiden', 'Hain der Druiden']].map(([id, country]) => albic(id, country,
    { dexterity: 2, wisdom: 1 }, ['Mit Tieren umgehen', 'Naturkunde', 'Überleben'],
    `${country} ist im bestehenden Verzeichnis als albisches fürstliches Gebiet genannt. Seine nähere Ausarbeitung bleibt offen. Bis dahin verwendet diese Herkunft das allgemeine albische Paket; der Ortsname verleiht weder einen Beruf noch Zauber.`,
    { detailStatus: 'open', continent: '', ...(id === 'hain-der-druiden' ? { label: 'Alben aus dem Hain der Druiden' } : {}),
      pagePath: '/Kontinente/Alben/fuerstentum.html', sourcePaths: ['Kontinente/modules/alben/principalities.source.json'] }))
];

const northernRegions = [
  origin({ id: 'fjordheim', label: 'Nordmänner aus Fjordheim', aliases: ['Fjordheim'], countryId: 'fjordheim', cultureGroup: 'Nordmänner', continent: 'Estryll',
    icon: `${REGIONS}/Fjordheim/fjordheim.png`, pagePath: '/Kontinente/Estryll/Reiktum Fjordheim/Reiktum Fjordheim.html',
    description: 'Dieses Paket beschreibt die nordmännische Küstenkultur Fjordheims mit Seefahrt, Wachsamkeit und Ausdauer. Es wird bewusst als nordmännische Herkunft gewählt; ein Bewohner vennyriischer Herkunft behält stattdessen sein eigenes Paket.',
    attributeBonuses: { dexterity: 2, constitution: 1 }, skillProficiencies: ['Athletik', 'Wahrnehmung', 'Überleben'],
    sourcePaths: ['Kontinente/modules/fjordheim/pages.source.json'] }),
  origin({ id: 'skjaerheim', label: 'Nordmänner aus Skjaerheim', aliases: ['Skjaerheim'], countryId: 'skjaerheim', cultureGroup: 'Nordmänner', continent: 'Estryll',
    icon: `${REGIONS}/Skjaerheim/skjaerheim.png`, pagePath: '/Kontinente/Estryll/Reiktum Skjaerheim/Reiktum Skjaerheim.html',
    description: 'Das nordmännische Paket Skjaerheims betont Belastbarkeit, körperliche Übung und das Leben im eroberten Grenzland. Die dort lebenden Alben behalten ihre eigene Herkunft; das Reiktum ist keine biologische Spezies.',
    attributeBonuses: { constitution: 2, strength: 1 }, skillProficiencies: ['Überleben', 'Einschüchtern', 'Athletik'],
    sourcePaths: ['Kontinente/modules/skjaerheim/pages.source.json'] })
];

export const CHARACTER_CULTURAL_ORIGINS = Object.freeze([...established, ...national, ...albicOrigins, ...northernRegions]);

function normalized(value) {
  return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/ß/g, 'ss').replace(/[^a-z0-9]+/g, ' ').trim();
}

export function getCulturalOriginTemplate(value) {
  const key = normalized(value);
  return CHARACTER_CULTURAL_ORIGINS.find(template => [template.id, template.label, ...template.aliases].some(candidate => normalized(candidate) === key)) || null;
}
