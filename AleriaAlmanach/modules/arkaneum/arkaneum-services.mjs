export function buildArkaneumServices() {
  return { schemaVersion: 1, commentThreadKey: 'arkaneum-leistungen', pageTitle: 'Aufträge · Rat und Werkstatt', guildServicesPage: true,
    guildServices: { title: 'Rat und Werkstatt', subtitle: 'Nach Prüfung des Anliegens',
      introduction: '<p>Ein Anliegen beginnt am Verkaufstresen. Rhydian nimmt gewöhnliche Kräuterfragen auf, Nauthagerd prüft Material und Vorrat. Herluin bespricht arkane Arbeiten selbst. Perban hält eine angenommene Vereinbarung fest.</p>',
      services: [
        { title: 'Kräuter sichten', icon: '❧', description: 'Gewöhnliche Funde bestimmen, trockene Vorräte prüfen und brauchbare Partien trennen.', clients: 'Sammler und gewöhnliche Kunden', scope: 'Nach Art und Umfang der Probe', terms: 'Leistungsumfang und Vergütung nach Sichtung vereinbaren.' },
        { title: 'Laborarbeiten', icon: '⚗', description: 'Kleine gewöhnliche Ansätze, Abfüllungen und Materialvorbereitungen nach Absprache.', clients: 'Kräuterkundige und Auftraggeber', scope: 'Vorhandene Geräte und geeignete Materialien', terms: 'Material, Gefäße und Arbeitsaufwand vor Annahme besprechen.' },
        { title: 'Arkane Begutachtung', icon: '✦', description: 'Herluin untersucht einen verdächtigen Stein, ein beschriebenes Blatt oder ein kleines Werkstück.', clients: 'Reisende und Besitzer ungewöhnlicher Funde', scope: 'Einzeln vereinbarte Untersuchung', terms: 'Erkenntnis und möglicher weiterer Aufwand werden nach der ersten Sichtung erläutert.' },
        { title: 'Besondere Beschaffung', icon: '☷', description: 'Die drei Beschaffer suchen nach einem benannten Fund, wenn Ort, Aufwand und Aussicht vertretbar erscheinen.', clients: 'Auftraggeber mit konkretem Bedarf', scope: 'Fundort, Menge und Zeitrahmen nach Absprache', terms: 'Perban hält Kosten und Bedingungen des angenommenen Auftrags fest.' }
      ], process: ['Anliegen und Material am Tresen vorstellen.', 'Zuständige Hand prüft Umfang und Machbarkeit.', 'Vergütung, Lieferumfang und Termin gemeinsam festhalten.'],
      conditions: ['Die Werkstatt nimmt Aufträge nach Kapazität an.', 'Maelwyn ist Herluins Lehrling; der Laden betreibt keine öffentliche Magierausbildung.'], footer: 'Für besondere Aufträge wird eine eigene Vereinbarung getroffen.' } };
}
