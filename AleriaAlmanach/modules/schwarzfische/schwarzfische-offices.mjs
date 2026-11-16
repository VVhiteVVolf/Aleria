// Roles describe responsibilities. Occupants are resolved separately by the hierarchy.
export const ADMINISTRATIVE_OFFICES = [
  {
    id: 'seneschall', title: 'Gildenseneschall', icon: '⚜', clothing: 'hofmeister',
    text: 'Ordnet den inneren Dienst, die Amtsstuben und die gemeinsamen Verwaltungsabläufe des Banners. Gleicht die Arbeit der Fachämter ab und legt grundsätzliche Streitfragen dem Kommandanten vor.'
  },
  {
    id: 'kaemmerer', title: 'Gildenkämmerer', icon: '⚖', clothing: 'schreiber',
    text: 'Verantwortet Kasse, Haushaltsplanung und die Abrechnung von Sold und Auftragserlösen. Prüft bewilligte Ausgaben und fordert Belege von Standorten und Schiffen an.'
  },
  {
    id: 'vertragskanzler', title: 'Vertragskanzler', icon: '✎', clothing: 'schreiber',
    text: 'Verwaltet Verträge, Vollmachten, Siegel und die verbindliche Korrespondenz des Banners. Stimmt Auftragsbedingungen mit der Auftragsmeisterei und Zahlungszusagen mit der Kämmerei ab.'
  },
  {
    id: 'zeugmeister', title: 'Zeugmeister', icon: '⚒', clothing: 'ruestmeister',
    text: 'Verantwortet Waffenbestände, Rüstzeug, Werkstätten und die Beschaffung militärischer Ausrüstung. Plant Reparaturen und Ersatz gemeinsam mit den Einsatzführungen und der Kämmerei.'
  },
  {
    id: 'quartiermeister', title: 'Quartiermeister', icon: '⌂', clothing: 'hofmeister',
    text: 'Plant Unterkünfte, Vorräte, Marschversorgung und Transporte des Banners. Gleicht den Bedarf von Feldtrupps, Burgen und Schiffen mit den verfügbaren Lieferwegen ab.'
  },
  {
    id: 'lehrmeister', title: 'Muster- und Lehrmeister', icon: '⚔', clothing: 'offizier', occupant: 'colm',
    text: 'Verantwortet Musterungen, Ausbildung und die fachliche Beurteilung neuer Mitglieder. Stimmt Übungen und Ausrüstungsbedarf mit Unteroffizieren und Zeugmeisterei ab.'
  },
  {
    id: 'auftragsmeister', title: 'Schatten- und Auftragsmeister', icon: '◈', clothing: 'kundschafter', occupant: 'alara',
    text: 'Prüft Auftraggeber, vermittelt größere Aufträge und bündelt vertrauliche Lageberichte sowie interne Ermittlungen. Gleicht die Einsatzvorschläge mit Führung, Kanzlei und Kämmerei ab.'
  },
  {
    id: 'gildenherold', title: 'Gildenherold', icon: '⚑', clothing: 'herold',
    text: 'Verkündet bestätigte Anordnungen, vertritt das Banner bei förmlichen Anlässen und pflegt Zeichen und Rangnachweise. Stimmt öffentliche Schreiben mit der Kanzlei und sichere Übermittlung mit dem Botendienst ab.'
  }
];

export const SPECIAL_OFFICES = [
  {
    id: 'soldschreiber', title: 'Soldschreiber', icon: '✎', clothing: 'schreiber',
    text: 'Führt unter der Kämmerei Soldlisten, Vorschüsse und quittierte Auszahlungen. Gleicht Dienstnachweise mit Mustermeisterei und örtlichen Führungen ab.'
  },
  {
    id: 'rechnungspruefer', title: 'Rechnungsprüfer', icon: '⚖', clothing: 'schreiber',
    text: 'Prüft Kassenbücher, Lieferbelege und Abrechnungen im Auftrag von Kämmerei und Seneschall. Meldet Abweichungen mit nachvollziehbaren Belegen an den Gildenvogt.'
  },
  {
    id: 'vertragsschreiber', title: 'Vertragsschreiber', icon: '✎', clothing: 'schreiber',
    text: 'Fertigt unter der Vertragskanzlei Auftragsurkunden, Nachträge und beglaubigte Abschriften aus. Hält Einsatzumfang und Vergütung nach Abstimmung mit Auftragsmeisterei und Kämmerei fest.'
  },
  {
    id: 'archivar', title: 'Gildenarchivar', icon: '▤', clothing: 'schreiber',
    text: 'Ordnet unter der Kanzlei Mitgliederrollen, abgeschlossene Verträge und Dienstberichte. Versorgt Herold und Fachämter mit den jeweils benötigten Nachweisen.'
  },
  {
    id: 'proviantmeister', title: 'Proviantmeister', icon: '◉', clothing: 'hofmeister',
    text: 'Verwaltet unter der Quartiermeisterei Lebensmittel, Trinkwasser und die tägliche Ausgabe. Meldet Bestände, Verderb und Lieferbedarf an Gildenvogt und Kämmerei.'
  },
  {
    id: 'fuhrmeister', title: 'Fuhrmeister', icon: '⚙', clothing: 'hofmeister',
    text: 'Ordnet unter der Quartiermeisterei Wagen, Lasttiere, Ladungen und Transportfolgen. Stimmt geschützte Transporte mit Einsatzführung und Zeugmeisterei ab.'
  },
  {
    id: 'stallmeister', title: 'Stallmeister', icon: '♞', clothing: 'hofmeister',
    text: 'Verantwortet unter der Quartiermeisterei Stallungen, Futter und den einsatzgerechten Zustand der Dienstpferde. Stimmt Reitbedarf und Ausbildung mit Mustermeisterei und örtlichen Führungen ab.'
  },
  {
    id: 'ruestmeister', title: 'Rüstmeister', icon: '⚒', clothing: 'ruestmeister',
    text: 'Prüft unter der Zeugmeisterei Waffen und Harnische, führt Ausgabenachweise und organisiert Instandsetzungen. Meldet Mängel an die zuständige Führung und den Gildenvogt.'
  },
  {
    id: 'feldscher', title: 'Feldscher', icon: '✚', clothing: 'feldscher',
    text: 'Versorgt Verwundete, verwaltet Verbandszeug und stimmt den Abtransport mit der Quartiermeisterei ab. Meldet dienstliche Einschränkungen an die Mustermeisterei.'
  },
  {
    id: 'botenmeister', title: 'Botenmeister', icon: '➶', clothing: 'kundschafter',
    text: 'Ordnet unter dem Gildenherold Botenwege, Empfangsnachweise und die Weitergabe bestätigter Befehle. Stimmt vertrauliche Sendungen mit Schattenamt und Kanzlei ab.'
  },
  {
    id: 'bootsmann', title: 'Bannerbootsmann', icon: '⚓', clothing: 'mariner',
    text: 'Stimmt Decksbedarf, seemännische Ausrüstung und Mannschaftslisten mit Kapitänen und Zeugmeisterei ab. Bündelt die Rückmeldungen der Borddienste für den Gildenvogt.'
  },
  {
    id: 'lagerprofoss', title: 'Lagerprofoss', icon: '⚑', clothing: 'offizier',
    text: 'Überwacht im Auftrag von Seneschall und Gildenvogt Lagerordnung, Zugänge und die geordnete Aufnahme von Beschwerden. Stimmt notwendige Maßnahmen mit der örtlichen Führung ab.'
  }
];

export const TROOP_ROLES = [
  { title: 'Kundschafter', icon: '◈', clothing: 'kundschafter', text: 'Erkundet Wege, Übergänge und das unmittelbare Umfeld und meldet Hindernisse oder auffällige Beobachtungen an die Truppführung.' },
  { title: 'Kleriker', icon: '✦', clothing: 'kleriker', text: 'Begleitet geistliche Anliegen, Eide und Totengedenken und bietet den Truppmitgliedern Beistand nach der vertretenen Glaubenstradition.' },
  { title: 'Heiler', icon: '✚', clothing: 'feldscher', text: 'Versorgt Verletzte und Erkrankte nach vorhandener Fachkunde und hält Heilmittel, Verbände und notwendige Ruhezeiten im Blick.' },
  { title: 'Aufspürer', icon: '⌕', clothing: 'kundschafter', text: 'Liest Spuren, verfolgt gesuchte Personen oder Tiere und hilft dem Trupp, verlorene Wege und verborgene Zugänge wiederzufinden.' },
  { title: 'Kämpfer', icon: '⚔', clothing: 'soldat', text: 'Übernimmt den unmittelbaren Schutz des Trupps und seiner Begleiteten und hält Waffen sowie persönliche Schutzausrüstung einsatzbereit.' },
  { title: 'Schütze', icon: '➶', clothing: 'kundschafter', text: 'Sichert aus der Entfernung, beobachtet schwer erreichbare Stellen und unterstützt den Trupp mit dem jeweils beherrschten Fernkampfgerät.' },
  { title: 'Jäger', icon: '♧', clothing: 'kundschafter', text: 'Beschafft auf erlaubten Jagdgründen Nahrung, beurteilt Wildwechsel und hilft bei der Orientierung und dem Überleben abseits fester Wege.' },
  { title: 'Versorger', icon: '⌂', clothing: 'hofmeister', text: 'Behält Proviant, Trinkwasser und Reisebedarf im Blick und organisiert Nachschub, Lagerplätze sowie kleinere Ausbesserungen im Trupp.' }
];
