import { fortunaHierarchy, level, office } from './fortuna-hierarchy-model.mjs';
export function buildFortunaCompanyHierarchy() {
  return fortunaHierarchy('company', 'Die Blaue Kompanie · Gwynthor', 'Kontor-Kommandantur Nerva · Hafen, Schiffe und Geleit',
    '<p>Die <strong>Blaue Kompanie</strong> bildet den militärischen Bereich des Fortuna-Verbunds. Ein <strong>Kontor-Kommandant aus dem Haus Nerva</strong> führt den örtlichen Stab. Seine Aufträge richten sich nach den gemeinsamen Beschlüssen des Neunerrats; im militärischen Dienst ordnet er Bereitschaft, Personal und Geleit.</p><p>Die Nerva bringen ihre Erfahrung mit Kriegsschiffen, Metallhandwerk und Schiffbau ein. Die Kommandantur hält Handels- und Schutzfahrten zusammen, sammelt Hafenmeldungen und stimmt Ansteuerung und Begleitung ab. Geplante Ausfahrten müssen ebenso mit Kaufleuten und Bank abgestimmt werden wie benötigte Mannschaften und Vorräte.</p><p>Kontorwachen und einzelne Geleitgruppen werden nach ihrem jeweiligen Auftrag geführt. Der Stab hier bündelt Führung und Verwaltung. Die gräflichen Streitkräfte und die Stadtwache behalten ihre eigene Befehlsgewalt.</p>', [
      { id: 'fortuna-kompanie-fuehrung', label: 'Führung', parentTreeId: '', levels: [
        level('Dem Neunerrat geschäftlich verantwortlich', [office('fortuna-kontorkommandant', 'Kontor-Kommandant', 'Nerva · Blaue Kompanie Gwynthor', 'Verantwortet den militärischen Schutz des örtlichen Fortuna-Handels, Geleitplanung und sichere Hafenansteuerung.')]),
        level('Militärischer Führungsstab', [
          office('fortuna-kompanie-stellvertretung', 'Stellvertretender Kontor-Kommandant', '1 Stelle', 'Führt Bereitschaft und Ablösung und vertritt den Kommandanten.'),
          office('fortuna-kompanie-see', 'Leitung Seegeleit', '1 Stelle', 'Stimmt Schutzschiffe, Handelsschiffe und Ankunftsfolgen aufeinander ab.'),
          office('fortuna-kompanie-land', 'Leitung Kontorwachen & Landgeleit', '1 Stelle', 'Verantwortet Schutzaufträge an Land und den Bedarf der angeschlossenen Betriebe.'),
          office('fortuna-kompanie-quartier', 'Stabs- & Quartierleitung', '1 Stelle', 'Verbindet Personal, Unterkunft, Proviant und Material.')
        ])
      ] },
      { id: 'fortuna-kompanie-verwaltung', label: 'Verwaltung', parentTreeId: 'fortuna-kompanie-fuehrung', levels: [level('Dienst und Vorbereitung', [
        office('fortuna-kompanie-adjutant', 'Adjutanten & Befehlsschreiber', '3 Stellen', 'Fertigen bestätigte Dienst- und Entsendungsbefehle aus.'),
        office('fortuna-kompanie-personal', 'Muster- & Personalschreiber', '3 Stellen', 'Führen Dienste, Ablösungen und zugewiesene Kräfte.'),
        office('fortuna-kompanie-sold', 'Sold- & Vertragsschreiber', '3 Stellen', 'Gleichen Sold und Schutzverträge mit Bank und kaufmännischer Kanzlei ab.'),
        office('fortuna-kompanie-seeberichte', 'See- & Routenschreiber', '3 Stellen', 'Sammeln Hafenmeldungen, Karten und Berichte der Schiffsführer.'),
        office('fortuna-kompanie-vorrat', 'Zeug- & Vorratsmeister', '3 Stellen', 'Verzeichnen Ausrüstung und geplante Versorgung der eingesetzten Gruppen.')
      ])] },
      { id: 'fortuna-kompanie-ehemalige', label: 'Ehemalige Mitglieder', parentTreeId: '', levels: [level('Früherer Dienst · außerhalb der aktiven Befehlskette', [
        office('fortuna-kompanie-ehemaligenregister', 'Frühere Offiziere und Angehörige', 'Ehemaligenregister', 'Hier werden frühere Dienste und verabschiedete Angehörige verzeichnet. Aus einer früheren Zugehörigkeit folgt kein heutiges Kommando.')
      ])] }
    ], [{ label: 'Leitung', value: 'Nerva · Kontor-Kommandantur' }, { label: 'Auftraggeber', value: 'Gemeinsamer Neunerrat des Fortuna-Handelshofes' }, { label: 'Schutz', value: 'Seegeleit · Hafenankunft · vereinbarte Wachdienste' }],
    'Der Hauptquartierbereich führt keine eigenen Soldatenreihen einzelner Geschäfte auf.');
}
