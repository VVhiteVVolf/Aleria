# Königreich Aldrimar · Übernahme vom 20. Oktober 2026

Die elf gelieferten Originale liegen unverändert unter `sources/`; ihre
Anhangskennungen und SHA-256-Prüfsummen stehen in `sources.json`. Die Reichskarte
und fünfzehn Organisationswappen wurden anhand ihrer gelieferten URLs lokal
archiviert; Herkunft, Bildgröße und Prüfsumme stehen in `assets.json`.
Alte HTML-Tabellen, Inlinefarben, feste Spaltenbreiten und Präsentationsreste
werden nicht als Produktdarstellung verwendet.

## Umfang

1. Königreichsseite mit Geschichte, Kultur, Religion, Königsrat, Verwaltung,
   Gesetzen, geographischem Überblick, Institutionen und Flora/Fauna.
2. Durchsuchbares Ämterverzeichnis mit 9 Clan-/Ratsämtern, 23 Herd-/Hofämtern,
   12 Titeln, Ehrungen und Ächtungen sowie einem getrennten Vergleichsamt aus Cenyr.
3. Königslinie mit frühem, unvollständigem Abschnitt und Erbrecht:
   Primogenitur, Holmgang, Herdwächter, Saga-Praktik und Königsthing.
4. Acht eigene Biografieseiten: Thorgest, Siegthrygre, Balgruuf der Jüngere,
   Roger, Galmar, Asger Wargh, Rag Blauzahn und Sigurd.

Die fünf Jarltümer erscheinen ausschließlich in der Reichsübersicht; ihre
eigenen Seiten und Registereinträge folgen später. Der königliche Vaeren-Clan
steht allein über den vier übrigen großen Clans. Unterclans werden nicht aus
deren Jarltümern auf die Reichsseite kopiert.

Namen, Portraits, Wappen, Gebiete und Personenlinks werden mit den bereits
vorhandenen Familienakten abgeglichen. Der Build validiert deren Kennungen und
übernimmt aktuelle Namen, Portraits und Lebensdaten; er verändert keine
Familienakte, Online-ID oder Firebase-Daten. Freydis wird gemäß vorhandener
Familienakte als Freydis Frostauge verlinkt; Bergelmir gemäß seiner Akte als
Bergelmir Hyrmgarthr. Die Ämter bleiben wie im gelieferten Königsrat besetzt.

## Bereinigung und offene Angaben

- Falsche und doppelte Kapitelnummern sind durch fortlaufende Kapitel und
  stabile Textanker ersetzt. Leere Trivia- und Biografieplatzhalter sowie
  reine Tabellen-Leerzeilen entfallen. Wiederholungen durch verschachtelte
  HTML-Absätze werden nicht mehrfach ausgegeben.
- „Grafschaften“ wird in der geographischen Übersicht als Jarltümer eingeordnet.
  „Herol d“ wird Herold, „Hesir“ in der Titelüberschrift Hersir.
  Der cenyrische Ausbildungsrest „Milwr und Ritter“ beim Waffenmeister wird
  mit den dort beschriebenen aldrimarischen Drengr und Maer eingeordnet.
- Die ausführliche Ratskanzler-Beschreibung betrifft ausdrücklich Tristan und
  Griflet in Cenyr. Sie bleibt als gekennzeichnetes Vergleichsamt erhalten und
  wird nicht als belegtes Amt Aldrimars dargestellt.
- Der alte Ratsmagiertext behauptet, das Amt sei seit einem Jahrhundert nicht
  besetzt. Der gleichzeitig gelieferte Königsrat nennt Bergelmir als
  Ratsmagier. Beide Angaben bleiben mit ausdrücklichem Quellenhinweis sichtbar;
  eine unbelegte Amtsabschaffung oder neue Amtsgründung wird nicht erfunden.
- Thorgests Regierungsbeginn 1580 ist in seiner Biografie belegt.
  Galmars Übersicht und Biografie nennen die Rückkehr nach dem Bürgerkrieg
  1647. Die alte Randtabelle nennt dagegen 1627–1676 und 49 Regierungsjahre.
  Die Königslinie zeigt 1647–1676 und erklärt die abweichende Randangabe.
- Rags Todesjahr und Sigurds vorhandene Familienakte bestätigen 1727.
  Die „1627“-Angaben in den alten Nachfolgetabellen sind daher als Schreibfehler
  eingeordnet. Die Königslinie zeigt Rag 1689–1727 und Sigurd seit 1727.
- Asger Wargh bleibt Reik und Thronbehüter für 1676–1689; er wird nicht zu einem
  gekrönten Vaeren-König gemacht.
- Der Name des ersten Hochkönigs und die Regierungsdaten Balgruufs des Älteren
  sind nicht überliefert. Frühe Zeitsprünge bleiben ausdrücklich erkennbar.
- Widersprüchliche alte Familien- und Dauerangaben werden nicht in den
  Stammbaum übertragen. Ergänzende Stammdaten der Biografien sind als solche
  aufklappbar; aktuelle Familienstrukturen sind direkt verlinkt.
- Die Erzähltexte bleiben erhalten. 393 Erzähl- und Amtsabsätze wurden gegen
  die Originalquellen und das erzeugte HTML verglichen.

## Architektur und Prüfung

Die Hauptseite nutzt wie die Königreichsseite Cenyrs `koenigreich.css` und den
gemeinsamen `world-codex`: Titel und Wappen, zweispaltiges Inhaltsverzeichnis,
Einführung/Geschichte mit rechter Karten-Infobox, angepasster Lesescrollbereich
und fortlaufende Kapitel. Die geographischen und institutionellen Übersichten
verwenden dieselben hellen Referenztabellen mit einheitlichen Symbolflächen.
Die gemeinsame Unterseitenschale, Styles, Ämterkarten und progressive Suche liegen
unter `modules/kingdom-court/`. Auch die beiden Verzeichniseinstiege sind dort
gemeinsam gestaltet. Cenyr und Aldrimar besitzen getrennte Daten;
Cenyrs Inhalte bleiben erhalten. Aldrimars Rat und Clans verwenden die
gemeinsamen `territory-directory`-Komponenten, die Verwaltungslinks die acht
zentral gepflegten Organisationsicons und die gemeinsame Verwaltungszeile.
Die Links öffnen die passenden Ämterbeschreibungen; es werden keine fremden
Verwaltungsdokumente oder Amtsträger aus Cenyr geladen.

Erzeugen und prüfen:

```powershell
node Kontinente/scripts/build-aldrimar.mjs
node Kontinente/scripts/build-aldrimar.mjs --check
node Kontinente/scripts/build-cenyr-court.mjs --check
node --test --experimental-test-isolation=none Kontinente/tests/aldrimar.test.mjs Kontinente/tests/cenyr-court.test.mjs Kontinente/tests/administration-scope.test.mjs
```

Die 17 fachlichen Prüfungen kontrollieren Originale und Bildprüfsummen,
vorhandene Personen, eindeutige Seitenanker, lokale Ressourcen und Links,
Chronologie, Ämter, territoriale Abgrenzung und die unveränderte Erreichbarkeit
Cenyrs. Ein Browserprüflauf für alle elf Seiten und vier Bildschirmbreiten
liegt unter `tests/aldrimar.browser.mjs`; er benötigt die Testabhängigkeit
Playwright oder einen über `PLAYWRIGHT_MODULE` angegebenen Modulpfad.

Die Sichtprüfung wurde nach Wiederverbinden der Chrome-Erweiterung direkt im
verbundenen Browser durchgeführt: elf Seiten bei 1440, 1024, 768 und 390 Pixeln
(44 geprüfte Ansichten), ohne horizontale Seitenüberläufe, überlaufende Rats- oder
Hauskarten und festgestellte Bildfehler. Die Hauptseite wurde direkt mit Cenyrs
Königreichsseite verglichen. Kapitelmenü, Suche mit Treffer/Leerzustand/Zurücksetzen
und die aufklappbaren Stammdaten aller acht Biografien wurden bedient.
Prüfprotokolle und Vorschau liegen lokal unter `.tmp/aldrimar-kingdom/browser/`.
Der separate Playwright-CLI-Lauf wurde nicht ausgeführt; seine Testabhängigkeit
ist im Projekt nicht installiert.

Es wurde nichts gepusht oder deployt.

## Ergänzung: Bürgerkriegsabgleich vom 24. Oktober 2026

Auf Nutzerauftrag sind die redigierten Biografien von Balgruuf, Roger, Galmar
und Asger mit den Stammbaumdaten und der Prätendentenchronik abgeglichen:
Eolas Tod 1608 vor der Thronbesteigung 1616; Roger zweiter Sohn/drittes Kind und
21 Tage gekrönter König; Galmars Exil am 10.12.1627; Asger etwa 22 Jahre 1627
und Neutralität 1638. Die elf Originaldateien sowie die ausdrücklich als alt
beschrifteten `sourceFacts` sind unverändert. Der genaue Wortlautabgleich liegt in
`Ereignisse/Kriege/krieg-der-praetendenten/redaktion/biografie-abgleich-2026-10-24.json`.
