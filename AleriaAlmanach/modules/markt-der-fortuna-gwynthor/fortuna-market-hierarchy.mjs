import { FORTUNA_COUNCIL, FORTUNA_FACTIONS } from './fortuna-factions.mjs';
import { fortunaBusinessNodes } from './fortuna-network.mjs';
import { fortunaHierarchy, level, office } from './fortuna-hierarchy-model.mjs';
export function buildFortunaMarketHierarchy() {
  return fortunaHierarchy('market', 'Markt der Fortuna · Gwynthor', 'Neun gleichrangige Ratssitze · sieben Interessenbünde',
    '<p>Der <strong>Neunerrat</strong> vereint die örtliche Macht der sieben führenden Häuser. Falto und Nerva halten je zwei Sitze; Tonnarth, Braglas, Aelmor, Coeddu und Maerllys je einen. Keiner steht als einzelner Gildenherr über dem Rat. Die Familien verhandeln gemeinsame Vorhaben, Hafenangelegenheiten und die Aufträge an Bank und Kompanie.</p><p>Die örtlichen Ressorts verbinden Seevermögen mit einheimischem Handwerk. Der alte Vorrang der Falto wird von den Nerva bestritten; die fünf cenyrischen Häuser sichern sich mit ihren eigenen Leistungen und Bindungen Gehör.</p>', [
      { id: 'fortuna-rat', label: 'Führung · Neunerrat', parentTreeId: '', levels: [level('Alle neun Sitze · derselbe Ratsrang', FORTUNA_COUNCIL)] },
      { id: 'fortuna-ressorts', label: 'Verwaltungsführung', parentTreeId: 'fortuna-rat', levels: [level('Familienköpfe und örtliche Vertretungen · gemeinsame Ressorts', [
        office('fortuna-fernhandel', 'Fernhandel & Handelsflotte', 'Falto · Handelssitz', 'Verhandelt Bezugsräume, große Ladungen und verfügbaren Schiffsraum.'),
        office('fortuna-finanzierung', 'Kapital & Bankabstimmung', 'Falto · Banksitz', 'Stimmt gemeinsame Mittel und Finanzierungsbedarf mit der Blauen Bank ab.'),
        office('fortuna-ausruestung', 'Ausrüstung & Großaufträge', 'Nerva · Handelssitz', 'Verbindet Metallhandwerk, Schiffbau und große Ausrüstungsaufträge.'),
        office('fortuna-seesicherheit', 'Seesicherung & Geleitbedarf', 'Nerva · Seefahrtssitz', 'Stimmt den Bedarf der Kaufleute mit der Blauen Kompanie ab.'),
        ...FORTUNA_FACTIONS.filter(f => !['falto', 'nerva'].includes(f.id)).map(f => office(`fortuna-ressort-${f.id}`, f.business, f.name, `Vertritt das örtliche Fachgeschäft und die vereinbarten Leistungen des Hauses ${f.name} im Handelshof.`))
      ])] },
      { id: 'fortuna-kanzlei', label: 'Kanzlei & Mitgliederwesen', parentTreeId: 'fortuna-ressorts', levels: [level('Gemeinsamer Kontordienst', [
        office('fortuna-kanzleileitung', 'Kanzleileitung', '1 Stelle', 'Bereitet Ratsberatungen vor und führt Beschlüsse und Korrespondenz.'),
        office('fortuna-gildenfuersprecher', 'Gildenfürsprecher · Valeriano Falto', '1 Stelle · in Venalys ausgebildet · 38 Jahre', 'Vertritt Gildenmitglieder in Erb-, Eigentums-, Vertrags- und vergleichbaren Verfahren. In Gwynthor tätig; im laufenden Verfahren Gwrgan gegen Lleucu für Lleucu Swyll bestellt. Seine Kanzleifunktion ist kein zusätzlicher Ratssitz.', 'assets/gwynthor-erbstreit/portraits/valeriano-falto.png'),
        office('fortuna-vertraege', 'Vertragsschreiber', '6 Stellen', 'Führen Einkauf, Verkauf, Lagervereinbarungen und die bestellten Dienste schriftlich aus.'),
        office('fortuna-register', 'Mitglieder- & Zunftschreiber', '4 Stellen', 'Führen Mitgliedschaften, Ansprechpartner und gewerbliche Interessen getrennt von bloßen Bezugsverträgen.'),
        office('fortuna-archiv', 'Archivare & Siegelschreiber', '4 Stellen', 'Verwahren Vertragsabschriften, Siegel und die laufende Geschäftspost.')
      ])] },
      { id: 'fortuna-hafen', label: 'Hafen, Lager & Absatz', parentTreeId: 'fortuna-ressorts', levels: [
        level('Annahme und Weitergabe', [
          office('fortuna-kaimeister', 'Kaimeister', '2 Stellen', 'Ordnen gemeinsame Liege- und Ladezeiten; melden ankommende Handelsschiffe.'),
          office('fortuna-fracht', 'Fracht- & Lagerschreiber', '10 Stellen', 'Verzeichnen Eigentümer, Menge, Warenzeichen, Zustand und Ziel jeder angenommenen Ladung.'),
          office('fortuna-waage', 'Waagmeister & Warenprüfer', '6 Stellen', 'Prüfen Mengen und Beschaffenheit vor der bestätigten Übernahme.'),
          office('fortuna-absatz', 'Absatz- & Bezugsvermittler', '6 Stellen', 'Verbinden Handelsschiffe mit Werkstätten, Läden und gewerblichen Käufern.')
        ]),
        level('Gemeinsame Arbeitsgruppen', [
          office('fortuna-lademeister', 'Lademeister', '4 Stellen', 'Teilen die Hafenarbeit ein und beaufsichtigen Stauung und Übergaben.'),
          office('fortuna-traeger', 'Träger & Lagerknechte', '24 Stellen', 'Bewegen und verwahren Fracht an den gemeinsamen Umschlagflächen.'),
          office('fortuna-fuhrleute', 'Fuhrleute & Hofknechte', '10 Stellen', 'Halten Wagen, Zugtiere und die städtischen Zubringer bereit.')
        ])
      ] },
      { id: 'fortuna-handwerk', label: 'Handwerk & Lieferabstimmung', parentTreeId: 'fortuna-ressorts', levels: [level('Arbeit zwischen den Häusern', [
        office('fortuna-auftraege', 'Auftragsvermittler', '4 Stellen', 'Stimmen Fässer, Stoffe, Metallwaren und Schiffbauleistungen mit den selbständigen Familienbetrieben ab.'),
        office('fortuna-fristen', 'Material- & Terminschreiber', '4 Stellen', 'Führen zugesagtes Material, Lieferzeiten und Werkstattmeldungen zusammen.'),
        office('fortuna-boten', 'Handelsboten', '8 Stellen', 'Überbringen Angebote, Abholscheine und bestätigte Bestellungen.')
      ])] },
      { id: 'fortuna-partner', label: 'Mitglieder, Inhaber & Kooperationspartner', parentTreeId: '', levels: [
        level('Bereits ausgearbeitete örtliche Betriebe · jeweilige Verbindung am Eintrag', fortunaBusinessNodes('fortuna-partner')),
        level('Weitere Inhaber und Zunftsmeister', [office('fortuna-weitere', 'Weiteres Mitglieder- und Partnerregister', 'Weitere Kaufleute und Gewerke', 'Die sieben führenden Häuser bilden den Rat, doch Markt und Handelshof verbinden weit mehr Betriebe. Eine Belieferung oder Verwandtschaft wird jeweils als solche verzeichnet.')])
      ] }
    ], [{ label: 'Rat', value: 'Falto 2 · Nerva 2 · fünf cenyrische Häuser je 1' }, { label: 'Bindungen', value: 'Falto und Nerva unter Vinicius · Aelmor unter Saethwyr' }, { label: 'Betriebe', value: 'Eigenständige Mitglieder, Kooperationspartner und Abnehmer' }],
    'Die Ratssitze und Ressorts bleiben institutionell besetzt. Valeriano Falto ist als Gildenfürsprecher ausgearbeitet; weitere Mitarbeiterstellen tragen vorerst keine Namen.');
}
