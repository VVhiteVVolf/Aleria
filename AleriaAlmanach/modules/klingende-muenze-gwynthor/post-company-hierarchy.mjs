import { operatingMemberNodes } from './post-members.mjs';
import { hierarchy, level, office } from './post-hierarchy-model.mjs';

export function buildCompanyHierarchy() {
  const albrecht = operatingMemberNodes('kompanie-ehemalig').find(node => node.memberEntryId === 'die-lachende-nixe');
  return hierarchy('company', 'Die Rote Kompanie · Grafschaftskommando', 'Kontor-Kommandantur Gwynthor · Falveri · ganz Celtigerns Wacht',
    '<p>Ein <strong>Kontor-Kommandant aus dem Haus Falveri</strong> führt von Gwynthor aus die Kräfte der Roten Kompanie in Celtigerns Wacht. Er ist dem gemeinsamen Kaufmannsrat unterstellt. Er plant Geleit und Ablösungen, entsendet Führungskräfte und hält Mannschaften, Schiffe und Ausrüstung einsatzfähig.</p><p>Wird ein weiterer Handelsposten eröffnet, entsendet er einen <strong>Hauptmann</strong> zu dessen Kaufleuten und Bürokraten. Diese bestimmen den örtlichen Geschäfts- und Schutzauftrag; Ausbildung, Personalführung und militärische Abstimmung laufen über die Kommandantur. Beim Ausbau eines Kontors treffen stets Kaufmannsgilde, Rote Bank und Rote Kompanie gemeinsam ein.</p><p>Zu seinem Auftrag gehören auch die <strong>Handels- und Kriegsschiffe</strong> des Verbunds: Geleitplanung, Meldungen über gefährdete Fahrwasser und die sichere Ansteuerung der Häfen Celtigerns Wacht. Stadtwache und gräfliche Streitkräfte behalten ihre eigene Befehlsgewalt.</p>', [
      { id: 'kompanie-fuehrung', label: 'Führung', parentTreeId: '', levels: [
        level('Dem Achterrat geschäftlich unterstellt', [office('kompanie-kontorkommandant', 'Kontor-Kommandant', 'Falveri · Celtigerns Wacht', 'Verantwortet den militärischen Dienst des Verbunds in der gesamten Grafschaft, die Entsendung von Hauptleuten sowie Geleit und sichere Hafenansteuerung.')]),
        level('Führungsstab des Hauptquartiers', [
          office('kompanie-stellvertreter', 'Stellvertretender Kontor-Kommandant', '1 Stelle', 'Führt Bereitschaft und Ablösung; vertritt den Kommandanten bei Abwesenheit.'),
          office('kompanie-seeleitung', 'Leitung Seegeleit & Hafenansteuerung', '1 Stelle', 'Koordiniert bewaffnetes Geleit, Schiffsführer, Ankunftsmeldungen und Schutz gefährdeter Zufahrten.'),
          office('kompanie-landleitung', 'Leitung Landgeleit & Kontorwachen', '1 Stelle', 'Koordiniert Landkonvois und die den örtlichen Betrieben vertraglich zugewiesenen Wachen.'),
          office('kompanie-stabsleitung', 'Stabs- & Quartierleitung', '1 Stelle', 'Verbindet Einsatzplanung, Personalberichte, Unterbringung und Versorgung.')
        ])
      ] },
      { id: 'kompanie-verwaltung', label: 'Verwaltung', parentTreeId: 'kompanie-fuehrung', levels: [
        level('Befehle, Personal und Verträge', [
          office('kompanie-adjutanten', 'Adjutanten & Befehlsschreiber', '4 Stellen', 'Fertigen Marsch- und Entsendungsbefehle nach dem vereinbarten Auftrag aus.'),
          office('kompanie-muster', 'Muster- & Personalschreiber', '4 Stellen', 'Führen Musterung, Ablösungen, Dienstverträge und die Zuordnung zu den Kontoren.'),
          office('kompanie-sold', 'Sold- & Vertragsschreiber', '4 Stellen', 'Gleichen Sold, Geleitverträge und Bereitstellungen mit der Roten Bank und den kaufmännischen Stellen ab.'),
          office('kompanie-proviant', 'Quartier- & Vorratsmeister', '4 Stellen', 'Planen Proviant, Liegeplätze, Unterkunft und erforderliches Material.')
        ]),
        level('Fahrwasser, Meldungen und Ausrüstung', [
          office('kompanie-seeberichte', 'See- & Routenschreiber', '4 Stellen', 'Sammeln Schiffsberichte und führen Karten, Geleitlisten und Ankunftsfolgen.'),
          office('kompanie-kontorverbindung', 'Kontorverbindungsschreiber', '3 Stellen', 'Halten Verbindung zu den Hauptleuten in Abergwint, Castellbryn und Rhosmere.'),
          office('kompanie-material', 'Zeug- & Ausrüstungsschreiber', '2 Stellen', 'Führen Ausgabe, Rücknahme und Ersatzanforderungen der Kompanieausrüstung.')
        ]),
        level('Bereits zugewiesene Betriebsverträge', [
          office('kompanie-vertrag-krone', 'Zur Klingenden Krone', 'Finlay Cneacail · Mitgliedsbetrieb', 'Ein Leutnant und sechzehn Soldaten werden ausschließlich beim Brauereibetrieb ausgeführt.'),
          office('kompanie-vertrag-gwregysdu', 'Lagerhäuser der Gwregysdu', 'Bleddyn Gwregysdu · Mitgliedsbetrieb', 'Optio Pilo, zwei Leutnanten und vierundzwanzig Soldaten stehen in der dortigen Sicherheitshierarchie.')
        ])
      ] },
      { id: 'kompanie-ehemalige', label: 'Ehemalige Mitglieder', parentTreeId: '', levels: [
        level('Früherer Kompaniedienst · außerhalb der heutigen Befehlskette', [
          office('kompanie-aldo', 'Aldo Falveri', 'Ehemaliger Condottiere · heute Ritterherr', 'Früherer Hauptmann der Roten Kompanie und Verwandter der Falveri. Sein heutiges Haus Cymrath O’Traethlan auf Tŵr Traethlan steht neben dieser früheren Laufbahn; er bekleidet hier kein aktives Kommando.', '../Stammbäume/assets/images/portraits/haus-falveri/aldo-falveri.png'),
          { ...albrecht, subtitle: 'Ehemaliges Mitglied · Inhaber der Lachenden Nixe', text: '<p>Albrecht Sonnenfels diente früher in der Roten Kompanie. Heute führt er die Lachende Nixe und gehört der Kaufmannsgilde an; aus seinem früheren Dienst folgt kein aktives Kompanieamt.</p>' }
        ])
      ] }
    ], [{ label: 'Oberer Auftraggeber', value: 'Gemeinsamer Kaufmannsrat in Gwynthor' }, { label: 'Kommandantur', value: 'Falveri · Grafschaft Celtigerns Wacht' }, { label: 'Örtlicher Hauptmann', value: 'Dem Geschäftsauftrag des jeweiligen Kontors unterstellt' }, { label: 'Seewege', value: 'Handels- und Kriegsschiffe · Geleit · sichere Hafenansteuerung' }],
    'Das Hauptquartier führt Stab und Verwaltung. Soldatenreihen, Leutnanten und Wachtiere einzelner Betriebe bleiben ausschließlich in deren eigenen Modulen.');
}
