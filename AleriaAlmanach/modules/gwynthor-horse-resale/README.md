# Zum Schiefen Nagel

Lokaler Stand vom 13. November 2026. Die günstige Alternative zu Halenrhyd und
Rhosmeres Rösser ist direkt unter Gwynthor-Stadt registriert, ohne Unterkategorie.
Der Familienbetrieb kauft von Bauern, Fuhrleuten, Söldnern und Reisenden an und
verkauft ausschließlich Mischlinge weiter. Er betreibt weder Zucht noch Sattlerei.

Brannoc Ruddgraen (57) ist ein mürrischer älterer Händler mit Halbglatze.
Seine Frau Edryssa (46) führt nörgelnd Kasse und Hofhaushalt. Die drei erwachsenen
Töchter Telynna (23), Rhonessa (21) und Elvynna (19) übernehmen Ankaufsprüfung,
Verkauf und Pferdevorstellung. Bedryn (17), der jüngste und einzige Sohn,
hilft unter Aufsicht im Stall. Alle sechs besitzen eigene Porträts im aktuellen
matten Tales-of-Xillia/Frieren-Stil. Die Töchter sind attraktive erwachsene
Cenyri mit rotem Haar und blauen Augen.

Der Stammbaum enthält sechs Personen, eine Ehe und vier Elternverbindungen.
Ältere Vorfahren, eine Nachfolge und das Eigentum am Gebäude sind nicht erfunden.
Ein rundes Familienwappen und ein billiges, einprägsames Holzschild mit
Pferdekopf und krummem Nagel gehören zum Betrieb. Das Schild hängt an einer
eisernen Wandhalterung mit Scharnieren.

Neun Seiten: Einführung, Betriebsbio mit Szenenbild, Inhaber-/Familienbio,
Rollenhierarchie, Pferderegister, Verkaufsraum, Stall, Ankaufshof und Kalkulation.
Die drei interaktiven Räume haben getrennte Szenenthreads. Vier Rollenreiter
decken Leitung/Kasse, Handel, Stall und externe Fachbesuche ab. Geteilte
Familienaufgaben und unbesetzte externe Rollen erzeugen keine weiteren Personen.

| Kategorie | Angebot | Preis in KT |
| --- | --- | ---: |
| Mischlinge · laufendes Angebot | Einfacher Arbeitsgaul, nachlieferbar | 180 |
| Mischlings-Exemplare | Rübenkopp, 11-jähriger Wallach | 140 |
| Mischlings-Exemplare | Torfstiefel, 13-jährige Stute | 120 |
| Mischlings-Exemplare | Blechpflaume, 8-jähriger Wallach | 210 |
| Mischlings-Exemplare | Karrenschnute, 10-jährige Stute | 180 |

Das laufende Angebot verwendet unverändert Kennung und Bild des vorhandenen
Handelsregistereintrags `standard:viehmarkt:arbeitsgaul`; sein Preisrahmen beträgt
100–600 KT. Die vier benannten kräftigen Arbeitspferde sind einmalige Exemplare
mit unbekannter Elternschaft, eigenem Wesen, Ankaufsgeschichte und eigenem
Vollkörperbild vor dem Stall, ohne Sattel oder Geschirr. Körperbau wird nicht
als Rassen- oder Zuchtnachweis ausgegeben. Nach einem tatsächlichen Kauf sind
die Unikate über den bestehenden Handelsweg nicht erneut verfügbar.

Die Kalkulation liest dieselben fünf Angebote. Nur das laufende Angebot besitzt
einen veränderbaren Wochenabsatz; Einzelpferde stehen auf null wiederkehrenden
Verkäufen. Alle sechs Familienmitglieder werden genau einmal gezählt. Ankauf,
vorübergehende Haltung, Pacht, Fachbesuche und Familienunterhalt sind offen
bezeichnete Modellannahmen; nicht bezifferte Abgaben gelten weiterhin als offen.

## Quellen und Pflege

`resale-module.mjs` besitzt Seiten und Registrierung, `resale-catalog.mjs`
Waren und Pferde, `resale-hierarchy.mjs` Rollen, `resale-economy.mjs` die Rechnung.
Die gemeinsame Pferdekarte stammt aus
`../trade-catalog/horse-catalog-items.mjs`; beide Features verwenden
denselben Unikat- und Darstellungsvertrag. Familienquelle:
`Stammbäume/assets/js/data/gwynthor-horse-resale/resale-family.mjs`.
Haus- und Figurenadapter bleiben im Feature.

15 aktive Motive und 15 erhaltene Originalfassungen stehen im Manifest
`AleriaAlmanach/assets/gwynthor-horse-resale/manifest.json`. Originale, vollständige
tatsächliche Imagegen-Prompts und Referenzen liegen in
`AleriaAlmanach/docs/art/gwynthor-horse-resale-20261113/`; diese Werkstattquellen
sind vom Websitepaket ausgeschlossen. Das eingebaute Imagegen wurde verwendet.

```powershell
node AleriaAlmanach/scripts/build-gwynthor-horse-resale.mjs --check
node AleriaAlmanach/scripts/admit-gwynthor-horse-resale-art.mjs --check
node AleriaAlmanach/scripts/build-horse-resale-characters.mjs --check
node "Familien Häuser und Clans/scripts/build-house-content.mjs" --check --houses=haus-ruddgraen
node AleriaAlmanach/tests/horse-resale.browser.mjs
```

Die sechs Figuren wurden nur im lokalen Archiv ergänzt; 483 vorherige Akten
blieben beim begrenzten Import erhalten. Das importierbare Modul liegt unter
`Charakter Archiv Exporte/Module/Gwynthorer Gestuete/`.
Gemeinsam mit den beiden anderen Betrieben: 87 bestandene Tests, darunter
atomare Unikatkäufe und abgewiesene Zweitkäufe im isolierten In-Memory-Adapter.
Echter lokaler Desktop-/Mobilbrowser, Familiengeometrie, Bilder und
Warenfilter sind geprüft. Vollständige Belege und Grenzen:
`diagnostics/horse-resale-20261113/`. Kein Push, Deploy oder produktiver Write.
