// Ordinary life histories use the existing background contract: two optional
// skill suggestions and descriptive experience, without passive combat bonuses.
export const ORDINARY_BACKGROUND_TEMPLATES = Object.freeze([
  {
    id: 'buerger', label: 'Bürger',
    description: 'In einer Stadt oder einem Marktflecken verwurzelt; vertraut mit Nachbarschaft, Marktverkehr und den alltäglichen Anliegen der Gemeinde.',
    skillProficiencies: ['Überzeugen', 'Motiv erkennen'],
    proficiencies: { tools: ['Markt- und Gemeindebrauchtum'] },
    traits: ['Bürgerlicher Alltag und Nachbarschaftserfahrung']
  },
  {
    id: 'jaeger', label: 'Jäger',
    description: 'Erfahren im Lesen von Wildspuren, geduldigem Beobachten und dem Versorgen von erlegtem Wild.',
    skillProficiencies: ['Wahrnehmung', 'Überleben'],
    proficiencies: { tools: ['Jagd- und Wildversorgungsgerät'] },
    traits: ['Jagd- und Fährtengespür']
  },
  {
    id: 'staatsmann', label: 'Staatsmann',
    description: 'Erfahrung mit Ratsversammlungen, politischen Verhandlungen und der Abwägung öffentlicher Interessen; vertraut mit politischen Verpflichtungen und langfristigen Entscheidungen.',
    skillProficiencies: ['Geschichte', 'Überzeugen'],
    proficiencies: { tools: ['Ratsprotokolle und politische Korrespondenz'] },
    traits: ['Politische Verantwortung und Verhandlungspraxis']
  },
  {
    id: 'haendler', label: 'Händler',
    description: 'Mit Warenprüfung, Preisverhandlungen und dem Abschätzen von Geschäftspartnern vertraut; kennt das alltägliche Geschäft zwischen Einkauf und Verkauf.',
    skillProficiencies: ['Motiv erkennen', 'Überzeugen'],
    proficiencies: { tools: ['Waagen, Warenlisten und Handelsbuch'] },
    traits: ['Kaufmännische Erfahrung']
  },
  {
    id: 'wirt', label: 'Wirt',
    description: 'Erfahren im Bewirten von Gästen, im Schlichten kleiner Streitigkeiten und im Erkennen der Stimmung einer Schankstube.',
    skillProficiencies: ['Motiv erkennen', 'Überzeugen'],
    proficiencies: { tools: ['Schank- und Gastwirtschaftsgerät'] },
    traits: ['Gastwirtschaft und Umgang mit Gästen']
  },
  {
    id: 'schreiber', label: 'Schreiber',
    description: 'Geübt im Abschreiben, Ordnen und Vergleichen von Briefen, Verträgen und Aufzeichnungen; vertraut mit sorgfältiger Aktenführung.',
    skillProficiencies: ['Geschichte', 'Nachforschungen'],
    proficiencies: { tools: ['Schreibzeug, Siegelprüfung und Aktenführung'] },
    traits: ['Schrift- und Aktenpraxis']
  },
  {
    id: 'bote', label: 'Bote',
    description: 'Auf regelmäßigen Botengängen an weite Wege, Orientierung und die verlässliche Übergabe von Nachrichten gewöhnt.',
    skillProficiencies: ['Athletik', 'Überleben'],
    proficiencies: { tools: ['Wegzeichen und Nachrichtenbehälter'] },
    traits: ['Botengänge und Wegekenntnis']
  },
  {
    id: 'fischer', label: 'Fischer',
    description: 'Mit Fanggründen, Gewässern, Wetterzeichen und dem Versorgen des Fangs vertraut; kennt das Arbeiten mit Netzen, Reusen oder Angeln.',
    skillProficiencies: ['Naturkunde', 'Überleben'],
    proficiencies: { tools: ['Netze, Reusen und Angelgerät'] },
    traits: ['Fangpraxis und Gewässerkenntnis']
  },
  {
    id: 'seemann', label: 'Seemann',
    description: 'An Arbeit an Deck, Tauwerk und bewegten Untergrund gewöhnt; kennt die alltäglichen Abläufe an Bord und das gemeinsame Arbeiten einer Mannschaft.',
    skillProficiencies: ['Athletik', 'Akrobatik'],
    proficiencies: { tools: ['Tauwerk und Seemannschaft'] },
    traits: ['Decksroutine und sichere Hand am Tau']
  },
  {
    id: 'fuhrmann', label: 'Fuhrmann',
    description: 'Erfahrung mit Zugtieren, Ladungssicherung und den Gefahren regelmäßiger Fahrten; vertraut mit dem schonenden Führen eines Gespanns.',
    skillProficiencies: ['Mit Tieren umgehen', 'Wahrnehmung'],
    proficiencies: { tools: ['Fuhrwerk, Geschirr und Ladungssicherung'] },
    traits: ['Gespannführung und Straßenerfahrung']
  },
  {
    id: 'hirte', label: 'Hirte',
    description: 'Vertraut mit dem Hüten einer Herde, dem Erkennen von Unruhe und dem Beobachten des Umlands.',
    skillProficiencies: ['Mit Tieren umgehen', 'Wahrnehmung'],
    proficiencies: { tools: ['Hirtenstab und Herdenpflegegerät'] },
    traits: ['Herdenpflege und wachsamer Weideblick']
  },
  {
    id: 'forstarbeiter', label: 'Forstarbeiter',
    description: 'An Waldarbeit, Holzarten und den sicheren Umgang mit gefällten Stämmen gewöhnt; kennt den planvollen Einsatz von Axt, Säge und Zugseilen.',
    skillProficiencies: ['Athletik', 'Naturkunde'],
    proficiencies: { tools: ['Holzfäller- und Forstwerkzeug'] },
    traits: ['Waldarbeit und Holzkenntnis']
  },
  {
    id: 'bergarbeiter', label: 'Bergarbeiter',
    description: 'Erfahrung mit körperlicher Arbeit unter Tage, Stützwerk und dem sorgfältigen Prüfen von Gestein und Arbeitswegen.',
    skillProficiencies: ['Athletik', 'Nachforschungen'],
    proficiencies: { tools: ['Bergbaugerät und Stollenabstützung'] },
    traits: ['Arbeit unter Tage und prüfender Blick']
  },
  {
    id: 'tageloehner', label: 'Tagelöhner',
    description: 'Wechselnde körperliche Arbeiten auf Höfen, Baustellen und beim Verladen gewohnt; kann sich rasch in einfache Arbeitsabläufe einfinden.',
    skillProficiencies: ['Athletik', 'Körperbeherrschung'],
    proficiencies: { tools: ['Trage- und einfaches Arbeitsgerät'] },
    traits: ['Routine in körperlicher Alltagsarbeit']
  },
  {
    id: 'hausdiener', label: 'Hausdiener',
    description: 'Mit geordneten Haushaltsabläufen, diskretem Beobachten und den Wünschen einer Hausgemeinschaft vertraut.',
    skillProficiencies: ['Wahrnehmung', 'Motiv erkennen'],
    proficiencies: { tools: ['Haushalts- und Serviergerät'] },
    traits: ['Haushaltsroutine und aufmerksamer Dienst']
  },
  {
    id: 'koch', label: 'Koch',
    description: 'Ausbildung im Vorbereiten von Zutaten, im sauberen Arbeiten und im zuverlässigen Versorgen einer Küche.',
    skillProficiencies: ['Naturkunde', 'Fingerfertigkeit'],
    proficiencies: { tools: ['Kochgeschirr und Küchenmesser'] },
    traits: ['Küchenpraxis und Zutatenkenntnis']
  },
  {
    id: 'heiler', label: 'Heiler',
    description: 'Praktische Erfahrung in Wundversorgung, Krankenpflege und dem aufmerksamen Zuhören bei Beschwerden.',
    skillProficiencies: ['Heilkunde', 'Motiv erkennen'],
    proficiencies: { tools: ['Verbands- und Wundversorgungsgerät'] },
    traits: ['Krankenpflege und ruhige Untersuchung']
  },
  {
    id: 'kraeuterkundiger', label: 'Kräuterkundiger',
    description: 'Mit dem Bestimmen, Sammeln und Aufbereiten gewöhnlicher Heilpflanzen vertraut; geübt im sorgfältigen Trocknen und Lagern der Ernte.',
    skillProficiencies: ['Heilkunde', 'Naturkunde'],
    proficiencies: { tools: ['Kräuterkunde- und Trocknungsgerät'] },
    traits: ['Pflanzenkenntnis und Kräuterpraxis']
  },
  {
    id: 'stadtwache', label: 'Stadtwache',
    description: 'Erfahrung mit Wachgängen, Zugangskontrollen und dem Einschreiten bei Unruhe; kennt den Alltag einer städtischen Wachmannschaft.',
    skillProficiencies: ['Wahrnehmung', 'Einschüchtern'],
    proficiencies: { tools: ['Wachprotokolle und Kontrollzeichen'] },
    traits: ['Wachdienst und Aufmerksamkeit für Unruhe']
  },
  {
    id: 'soldat', label: 'Soldat',
    description: 'Mit Marschordnung, Wachwechseln und dem Alltag einer regulären Truppe vertraut; an gemeinsames Arbeiten nach klaren Absprachen gewöhnt.',
    skillProficiencies: ['Athletik', 'Wahrnehmung'],
    proficiencies: { tools: ['Marsch- und Lagerordnung'] },
    traits: ['Truppendienst und verlässliche Wachroutine']
  },
  {
    id: 'schmuggler', label: 'Schmuggler',
    description: 'Erfahrung mit unauffälligen Übergaben, verdeckten Warenwegen und glaubwürdigen Ausflüchten; geübt darin, unnötige Aufmerksamkeit zu vermeiden.',
    skillProficiencies: ['Täuschen', 'Heimlichkeit'],
    proficiencies: { tools: ['Verdeckte Verpackungen und Schmugglerzeichen'] },
    traits: ['Heimlicher Warenverkehr']
  },
  {
    id: 'gerichtsdiener', label: 'Gerichtsdiener',
    description: 'Mit Eingaben, Zeugenaussagen, Ladungen und dem geordneten Ablauf von Gerichtsverhandlungen vertraut.',
    skillProficiencies: ['Nachforschungen', 'Motiv erkennen'],
    proficiencies: { tools: ['Gerichtsakten und Ladungswesen'] },
    traits: ['Gerichtsroutine und sorgfältige Aufnahme von Aussagen']
  },
  {
    id: 'verwalter', label: 'Verwalter',
    description: 'Erfahrung mit Vorratslisten, Absprachen und der Organisation eines Haushalts, Guts oder Betriebs; behält Bestände und anstehende Aufgaben im Blick.',
    skillProficiencies: ['Nachforschungen', 'Überzeugen'],
    proficiencies: { tools: ['Bestandsbücher und Verwaltungsakten'] },
    traits: ['Bestandsführung und organisatorische Praxis']
  },
  {
    id: 'diplomat', label: 'Diplomat',
    description: 'Geübt im Vermitteln zwischen Interessen, im Lesen von Gesprächspartnern und im Formulieren tragfähiger Absprachen; vertraut mit Gesandtschaftsbesuchen und Verhandlungsprotokollen.',
    skillProficiencies: ['Motiv erkennen', 'Überzeugen'],
    proficiencies: { tools: ['Gesandtschaftsprotokoll und Verhandlungskorrespondenz'] },
    traits: ['Vermittlung und Gesandtschaftserfahrung']
  }
].map(template => ({ ...template, icon: `/AleriaAlmanach/assets/development-traits/web/background-${template.id}.webp` })));
