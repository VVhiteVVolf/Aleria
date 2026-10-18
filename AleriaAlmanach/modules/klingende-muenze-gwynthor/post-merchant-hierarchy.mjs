import { COUNCIL_SEATS } from './post-factions.mjs';
import { operatingMemberNodes } from './post-members.mjs';
import { hierarchy, level, office } from './post-hierarchy-model.mjs';

const department = (id, title, family, text) => office(`muenze-ressort-${id}`, title, family, text);
export function buildMerchantHierarchy() {
  return hierarchy('coin', 'Kaufmannsgilde · Klingende Münze', 'Acht Ratssitze · fünf Interessenbünde · gemeinsames Grafschaftskontor',
    '<p>Der <strong>Achterrat</strong> verbindet die acht mächtigsten kaufmännischen Sitze des örtlichen Verbunds. Kein Kaufmann steht allein über den anderen. Der Rat entscheidet gemeinsam über große Vorhaben, Gildenmittel und die geschäftlichen Aufträge an Bank und Kompanie. Die Köpfe und örtlichen Vertreter der führenden Familien tragen darunter feste Ressorts.</p>', [
      { id: 'rat', label: 'Führung · Achterrat', parentTreeId: '', levels: [
        level('Acht gleichrangige Ratssitze', COUNCIL_SEATS)
      ] },
      { id: 'ressorts', label: 'Verwaltungsführung', parentTreeId: 'rat', levels: [
        level('Familienköpfe und örtliche Vertreter · vom Rat verantwortete Ressorts', [
          department('fernhandel', 'Fernhandel & Seeverträge', 'Falveri · Handelssitz', 'Verhandelt Handelsverbindungen, Schiffsraum und große Bezugsverträge; stimmt Geleitbedarf mit der Kommandantur ab.'),
          department('beteiligungen', 'Beteiligungen & Niederlassungen', 'Falveri · Kapitalsitz', 'Führt Beteiligungen, unternehmerische Anträge und den Ausbau der Handelsposten zur Entscheidung des Rats.'),
          department('bezug', 'Einkauf & Bezugsnetze', 'Ergalla · Handelssitz', 'Koordiniert überregionale Beschaffung und Lieferbindungen, ohne die Bücher der Mitgliedsbetriebe zu übernehmen.'),
          department('abrechnung', 'Handelsabrechnung & Bankverkehr', 'Ergalla · Banksitz', 'Stimmt kaufmännische Abrechnung und Finanzierungsbedarf mit der eigenständig geführten Roten Bank ab.'),
          department('werften', 'Werften & Schiffsraum', 'Gwlannor · unter Saethwyr', 'Koordiniert Werftaufträge, verfügbare Frachträume, Reparaturen und die Verbindung zum Hafen.'),
          department('vieh', 'Landhandel & Vieh', 'Halenrhyd · unter Wyrm', 'Verbindet Viehankauf, Rossausbildung, städtischen Verkauf und ländliche Lieferwege.'),
          department('wertwaren', 'Wertwaren & Handwerk', 'Aurdden · im Dienst der Loer', 'Bündelt Goldschmiede-, Juwelier- und Handwerksangelegenheiten sowie die Bewertung wertvoller Waren.'),
          department('metall', 'Rohstoffe & Münzlieferungen', 'Loer · unter Wyrm', 'Verantwortet die Loer-Rohstoffbeziehungen und die Abstimmung lizenzierter Prägeaufträge; das Prägerecht verbleibt bei Loer.')
        ])
      ] },
      { id: 'kontor', label: 'Kontor & Verträge', parentTreeId: 'ressorts', levels: [
        level('Kanzlei und Mitgliederwesen', [
          office('muenze-kanzleileitung', 'Kanzleileitung', '1 Stelle', 'Führt Tagesgeschäft, Protokolle und die Ausfertigung von Ratsbeschlüssen.'),
          office('muenze-vertragsschreiber', 'Vertragsschreiber', '6 Stellen', 'Fertigen Bezugs-, Lager-, Geleit- und Absatzverträge aus.'),
          office('muenze-mitgliederamt', 'Mitgliederschreiber', '4 Stellen', 'Führen Mitgliedschaften, neue Betriebsanträge und den gemeinsamen Beitritt zur Roten Bank.'),
          office('muenze-archiv', 'Archivare & Siegelschreiber', '4 Stellen', 'Verwahren Vertragsabschriften, Siegel und nachvollziehbare Beschlussfolgen.')
        ])
      ] },
      { id: 'umschlag', label: 'Lager, Fracht & Vertrieb', parentTreeId: 'ressorts', levels: [
        level('Gemeinsame Hafenkoordination', [
          office('muenze-umschlagmeister', 'Umschlagleitung', '2 Stellen', 'Koordiniert gemeinsame Ladezeiten und Lagerzuteilungen; die vier Gwregysdu-Häuser behalten ihre eigene Leitung.'),
          office('muenze-frachtenschreiber', 'Frachtenschreiber', '12 Stellen', 'Erfassen Zeichen, Menge, Eigentümer, Frachtziel und Empfang jeder Sendung.'),
          office('muenze-warenpruefer', 'Waagmeister & Warenprüfer', '6 Stellen', 'Prüfen Gewicht, Zustand und Übereinstimmung mit den Warenbriefen.'),
          office('muenze-frachtvermittler', 'Fracht- & Absatzvermittler', '8 Stellen', 'Vermitteln Schiffsraum, Landfuhren und gewerbliche Abnehmer.')
        ]),
        level('Gemeinsamer Hofdienst · zusätzlich zu eigenständigen Mitgliedsbetrieben', [
          office('muenze-lademeister', 'Lademeister', '4 Stellen', 'Teilen Ladegruppen ein und achten auf sichere Laufwege und Stauung.'),
          office('muenze-traeger', 'Träger & Lagerknechte', '32 Stellen', 'Arbeiten in wechselnden Gruppen an den gemeinsamen Annahme- und Umschlagflächen.'),
          office('muenze-fuhrleute', 'Fuhrleute & Stallknechte', '12 Stellen', 'Halten die gemeinsamen Wagen, Zugtiere und städtischen Zubringer bereit.')
        ])
      ] },
      { id: 'grafschaft', label: 'Grafschaft & Botenwesen', parentTreeId: 'ressorts', levels: [
        level('Berichte aus den vier Handelsposten', [
          office('muenze-regionalberichte', 'Regionalschreiber', '3 Stellen · Abergwint, Castellbryn, Rhosmere', 'Halten den Austausch mit den drei weiteren großen Handelsposten; deren örtliche Leitung bleibt bei den dortigen Kaufleuten.'),
          office('muenze-botenmeister', 'Botenmeister', '1 Stelle', 'Ordnet versiegelte Post, Abfahrten, Ankunftslisten und verlässliche Ersatzwege.'),
          office('muenze-boten', 'Berittene Boten & Laufboten', '12 Stellen', 'Überbringen Berichte, Vertragsabschriften und dringende Nachrichten zwischen Kontoren und Betrieben.')
        ])
      ] },
      { id: 'mitglieder', label: 'Mitgliederliste, Inhaber und Zunftsmeister', parentTreeId: '', levels: [
        level('Bereits geführte örtliche Geschäftsinhaber', operatingMemberNodes('muenze-mitglied')),
        level('Weitere Mitgliedschaften und Zünfte', [office('muenze-weitere-mitglieder', 'Weitere Inhaber & Zunftsmeister', 'Offenes Mitgliederregister', 'Der Verbund umfasst zahlreiche weitere Kaufleute und Gewerke. Die fünf Interessenbünde bilden seine örtliche Führung; Mitgliedschaft ist nicht auf ihre Familien beschränkt.')])
      ] }
    ], [{ label: 'Oberste Leitung', value: 'Gemeinsamer Achterrat · kein einzelner Gildenherr' }, { label: 'Beitritt', value: 'Klingende Münze + Rote Bank und Konto' }, { label: 'Unternehmer & Zünfte', value: 'Zugang zu Gildenpersonal und vertraglichen Diensten der Roten Kompanie' }],
    'Alle acht Sitze stehen auf derselben Ratsebene. Ressorts sind Aufgaben der Familiensitze. Alle übrigen Stellen bleiben ohne persönliche Besetzung; die Stellenzahlen beschreiben den gemeinsamen Kontordienst.');
}
