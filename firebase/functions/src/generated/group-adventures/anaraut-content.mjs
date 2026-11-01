const ARIAN_PORTRAIT = 'https://i.imgur.com/ciPc4TR.jpeg';
export const ARIAN_HIERARCHY_KEY = 'anaraut-arian-ship-hierarchy';

const duties = {
  anführer: 'Trägt die Verantwortung für das Gefolge, entscheidet über den Einsatz und hält die Verbindung zum Marschall. Seine Leute handeln in einem klaren Auftrag und melden Ergebnis und Verluste zurück.',
  leutnant: 'Führt einen Teil des Gefolges, teilt Wachen und Aufgaben ein und vertritt den Anführer im übertragenen Auftrag. Hält Meldungen, Bereitschaft und das Zusammenwirken der Ritter im Blick.',
  ritter: 'Übernimmt bewaffneten Schutz, Erkundung und die Ausführung erteilter Aufträge. Trägt Verantwortung für die ihm anvertrauten Menschen und meldet Gefahren an die Führung.',
  knappe: 'Begleitet den Ritter im Dienst, hält Ausrüstung und Pferde bereit und lernt Führung, Waffendienst und den Umgang mit Verantwortung. Eigenständige Aufgaben bleiben seinem Ausbildungsstand angemessen.',
  page: 'Lernt den Alltag des Gefolges, unterstützt bei Botengängen und einfachen Vorbereitungen. Schutz und Ausbildung gehen einer Verwendung in gefährlichen Aufträgen vor.'
};
const vacant = (title, description) => ({ portrait: '', title, subtitle: 'VAKANT', text: description });

export function buildArianShipHierarchy(emblem = '') {
  return {
    schemaVersion: 1, hierarchyPage: true, pageTitle: 'Arians Schiffskommando', commentThreadKey: ARIAN_HIERARCHY_KEY,
    hierarchy: {
      layoutMode: 'vertical', treeDisplayMode: 'tabs', portraitScale: 100, chartScale: 100,
      eyebrow: 'Anarauts Gefolge · Dienst zur See', organizationTitle: 'Arians Schiffskommando',
      centerLabel: 'Schiffskommando', subtitle: 'Arian Saethwyr · Kapitänin', emblem,
      description: 'Zur See führt Arian Saethwyr das Kommando. Unter ihrer Verantwortung stehen Kurs, Mannschaft und die sichere Ausführung des Auftrags. Anarauts Landgefolge folgt seinem eigenen Dienstweg; gemeinsame Unternehmungen verlangen eine klare Absprache zwischen beiden Führungen.',
      chartTitle: 'Kommando, Schutz und Besatzung',
      chartIntro: 'Eine überschaubare Bordordnung nach dem Vorbild der Tiefenwyrm: Führung und Kurs auf der Brücke, sichere Hände an Deck, verlässliche Versorgung unter Deck. Unterhalb der Kapitänin warten die Posten noch auf ihre Besetzung.',
      trees: [
        { id: 'arian-command', label: 'Führung', levels: [
          { label: 'Kommando', nodes: [{ title: 'Schiffskapitänin', subtitle: 'Arian Saethwyr', portrait: ARIAN_PORTRAIT,
            text: 'Führt das Schiff und trägt die Verantwortung für Kurs, Besatzung und den erteilten Auftrag. Stimmt den Einsatz mit Anaraut ab; die Führung seines Landgefolges wird dadurch nicht ersetzt.' }] },
          { label: 'Deck und Kurs', nodes: [vacant('Erster Maat', 'Vertritt die Kapitänin nach ihrer Weisung, koordiniert Wachen und hält den Borddienst zusammen.'), vacant('Steuermann', 'Hält den befohlenen Kurs und arbeitet bei Wetter, Strömung und Ansteuerung mit der Kapitänin zusammen.')] },
          { label: 'Ordnung und Vorräte', nodes: [vacant('Bootsmann', 'Leitet Arbeiten an Deck und an der Takelage und achtet auf sichere Manöver.'), vacant('Quartiermeister', 'Führt den Überblick über Vorräte und Bordausrüstung. Verteilung und Verbrauch werden nachvollziehbar aufgezeichnet.')] }
        ] },
        { id: 'arian-defense', label: 'Schutz zur See', levels: [
          { label: 'Bewaffneter Dienst', nodes: [vacant('Ritter zur See', 'Führt den bewaffneten Schutz im erteilten Auftrag und unterstützt die Kapitänin bei Gefahr.'), vacant('Waffenknecht zur See', 'Stellt Bordwachen, schützt Mannschaft und Ladung und unterstützt beim Abwehren von Enterern.')] }
        ] },
        { id: 'arian-crew', label: 'Besatzung', levels: [
          { label: 'Versorgung und Instandhaltung', nodes: [vacant('Schiffskoch', 'Bereitet die Verpflegung zu und stimmt den Bedarf mit der Vorratshaltung ab.'), vacant('Schiffszimmermann', 'Prüft Rumpf, Deck und Masten und führt notwendige Reparaturen aus.'), vacant('Feldscher', 'Versorgt Kranke und Verwundete und meldet, wenn eine Person nicht dienstfähig ist.')] },
          { label: 'Decksdienst', nodes: [vacant('Matrose', 'Arbeitet an Segeln und Leinen, hält Deckswache und unterstützt die täglichen Manöver.'), vacant('Matrose', 'Arbeitet an Segeln und Leinen, hält Deckswache und unterstützt die täglichen Manöver.')] }
        ] }
      ],
      footerNote: 'Ein Mitglied des Landgefolges kann zugleich einen Bordposten übernehmen. Für jede Fahrt muss feststehen, in wessen Auftrag und unter welchem Kommando es handelt.'
    }, commentSequence: []
  };
}

export function enrichAnaraut(entry) {
  const intro = entry.pages[0];
  const introduction = '<p>Anaraut Draig ist der Erbe von Celtigerns Wacht und dient als Adjutant des Marschalls. Sein Gefolge steht dort bereit, wo eine Meldung verlässlich geprüft, ein Schutzauftrag übernommen oder eine Entscheidung ohne unnötigen Aufschub ausgeführt werden muss.</p><p>Die Arbeit führt zwischen Hof, Wegen und Dienststellen hindurch: Berichte aufnehmen, die Lage vor Ort klären, gefährdete Menschen schützen und Aufträge mit nachvollziehbarem Ergebnis zurückmelden. Rang und Familienname nehmen den Beteiligten diese Verantwortung nicht ab.</p><p>An Land verbinden Führung, Ritter und Knappen den bewaffneten Dienst mit der Ausbildung der Jüngeren. Zur See trägt Arian Saethwyr das Kommando. Wo ihre Wege zusammenführen, müssen Auftrag und Zuständigkeit ebenso klar sein wie der Kurs: Ein dringender Befehl verträgt keine Ungewissheit darüber, wer ihn ausführt.</p>';
  if (/^Erzählerischer Einstieg:/.test(intro.description || '') || !intro.description) intro.description = introduction;
  else intro.description += introduction;
  if ((intro.stats || []).every(row => row[1] === 'Wert')) intro.stats = [
    ['Anführer', 'Anaraut Draig'], ['Stellung', 'Erbe von Celtigerns Wacht'], ['Dienst', 'Adjutant des Marschalls'],
    ['Auftrag', 'Verlässliche Meldungen · Schutz · dringende Einsätze'], ['Zur See', 'Arian Saethwyr · gesondertes Schiffskommando']
  ];
  const hierarchy = entry.pages.find(page => page.hierarchyPage)?.hierarchy;
  if (hierarchy) {
    const levels = [hierarchy.levels || [], ...(hierarchy.trees || []).map(tree => tree.levels || [])];
    for (const list of levels) for (const level of list) for (const node of level.nodes || []) {
      if (String(node.text || '').trim()) continue;
      const role = String(node.subtitle || '').toLocaleLowerCase('de');
      node.text = Object.entries(duties).find(([key]) => role.includes(key))?.[1]
        || 'Dieser Platz ist noch nicht besetzt. Zuständigkeit und Ausbildung werden bei der tatsächlichen Besetzung festgelegt.';
    }
    if (!hierarchy.description || hierarchy.description === '....') hierarchy.description = 'Anarauts Landgefolge verbindet Führung, Ritter sowie Knappen und Pagen im Dienst für Celtigerns Wacht. Erfahrung wird weitergegeben, Verantwortung nach Auftrag und Ausbildung getragen.';
    if (/Die Gilde ist/.test(hierarchy.chartIntro || '')) hierarchy.chartIntro = 'Die Dienstordnung des Gefolges verbindet Führung, bewaffneten Schutz und Ausbildung. Leere Plätze sind keine zusätzlichen Mitglieder.';
    if (/Gildensatzung/.test(hierarchy.footerNote || '')) hierarchy.footerNote = 'Die Rangfolge des Landgefolges bleibt vom gesonderten Schiffskommando unberührt.';
  }
  const bio = entry.pages.find(page => page.biographyPage);
  if (bio) {
    for (const row of bio.stats || []) {
      if (row[0] === 'Vollständiger Name' && row[1] === 'Anaraut Drag') row[1] = 'Anaraut Draig';
      if (row[0] === 'Titel' && row[1] === 'Kronprinz, Ritter') row[1] = 'Erbe von Celtigerns Wacht · Ritter';
    }
    if (/^Beschreibe Herkunft/.test(bio.description || '')) bio.description = 'Anaraut Draig · Erbe von Celtigerns Wacht und Adjutant des Marschalls.';
    if (/^Beschreibe Herkunft/.test(bio.biography?.biographyText || '')) bio.biography.biographyText = '<p>Als Erbe von Celtigerns Wacht verbindet Anaraut seine Herkunft mit dem Dienst als Adjutant des Marschalls. Das Gefolge unterstützt ihn bei Meldungen, Schutzaufträgen und der Ausführung erteilter Befehle.</p>';
  }
  if (!entry.pages.some(page => page.commentThreadKey === ARIAN_HIERARCHY_KEY)) {
    const landingIndex = entry.pages.findIndex(page => page.landingPage);
    entry.pages.splice(landingIndex + 1, 0, buildArianShipHierarchy(hierarchy?.emblem || entry.symbol || ''));
  }
  return entry;
}
