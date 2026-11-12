# Schnellkauf direkt im Güterregister

Lokale Umsetzung vom 8. November 2026. Die bestehenden Modul-Warentabellen
und Güterkarten besitzen einen direkten Kaufen-Button. Der kompakte native
Dialog bietet suchbare Avatarwähler für Zahler und Empfänger, eine Mengenwahl,
Preis und Geldbeutelvorschau. Die Auswahl wird pro Anmeldung und Modul gemerkt.
Die Erstöffnung wählt keinen fremden Geldbeutel automatisch aus.

Eine Gruppenkasse ist als Zahler auswählbar, wenn ihre gespeicherte Besetzung
mit tatsächlichen Figuren verknüpft ist. Dann wird zusätzlich die bestellende
Gruppenfigur angezeigt und ist auf bestätigte Mitglieder begrenzt. Der
Empfänger kann eine andere Figur außerhalb der Gruppe sein. Der Server prüft
die Mitgliedschaft; die bisherige Szenenverknüpfung bleibt nur im Szenenhandel
erforderlich.

## Verantwortlichkeiten

- `catalog-purchase-entry.js` beobachtet neue Registerseiten und delegiert
  deren Kaufbuttons. Die eigentliche Kaufsteuerung wird erst auf diesen Seiten
  geladen. Der reine Verfügbarkeitsabruf lädt keine Figuren-/Gruppeninventare.
- `catalog-purchase-source.js` verbindet DOM-Metadaten mit den ursprünglichen
  Quellzeilen. Die Renderer behalten originale Kennungen und Zeilenpositionen,
  auch wenn ihre Darstellung leere Zeilen entfernt oder IDs normalisiert.
- `catalog-purchase-controller.js` besitzt genau einen geöffneten Dialog und
  dessen Ereignisse. Es bucht keine Inventare im Browser.
- `catalog-purchase-view.js` und `styles/catalog-purchase.css` besitzen die
  kompakte Darstellung. Die bestehende suchbare Avatarwahl wird wiederverwendet.
- `catalog-purchase-model.js` begrenzt die Auswahl auf echte Modulangebote,
  ordnet Quellzeilen und Preisvarianten zu und erstellt den geprüften Auftrag.
- `catalog-purchase-service.js` verwendet die bestehende schlanke Register-
  und Firebase-Anbindung. Nur ausgewählte Inventare laden historische Regeln.
- `catalog-purchase-preferences.js` speichert ausschließlich Personenkennungen.
- `catalog-purchase-submission.js` verwendet den bestehenden langlebigen
  Transaktionsauftrag für unsichere Antworten und sichere Wiederholungen.

## Buchungsregeln

Der vorhandene Callable `commitItemTrade` erhält die Aktion `catalog-checkout`.
Sie erlaubt genau eine Kaufposition aus `module:<Modul-ID>` zum Standardpreis,
einen Figurenempfänger sowie eine Figur oder bestätigte Gruppenkasse als Zahler.
Der vorhandene Transaktionskern verantwortet Geld, Items, Definitionen,
Kampfsperren, erwartete Revisionen, Unikatbindung und Wiederholschutz gemeinsam.
Ein Direktkauf erzeugt keinen Szenenkommentar und braucht keine laufende Szene.
Der Szenenhandel mit Verkauf und vereinbarten Preisen bleibt unverändert.

Intern werden ausschließlich ganze Eisenpfennige gerechnet. Die bestehende
Währungslogik wechselt die Münzen automatisch und speichert den Restbetrag
kanonisch. Beispiel: 1 Gold minus 1,01 KT ergibt 9 Silber, 98 Kupfer und
99 Eisenpfennig. Der Händler benötigt kein persönliches Konto oder Startgeld;
das vorhandene unbegrenzte Handelsjournal bleibt als Buchungsbeleg erhalten.

Gewöhnliche Waren bleiben unabhängig von alten endlichen Bestandswerten
nachlieferbar. Nur ausdrücklich kanonisch als `unique` markierte Gegenstände
werden nach einem Kauf ausgegraut und als „Gekauft · nicht verfügbar“ bezeichnet.
Globale Unikatbelege verhindern auch zwei gleichzeitige Käufe durch andere
Browser. Fehlende Quellen-/Preisbestätigungen erzeugen keine falsche Meldung
„gekauft“ und werden serverseitig abgewiesen.

Unklare Antworten behalten ihren exakten Auftrag samt Vorgangskennung in
`sessionStorage`. Ein erneuter Klick, Dialogschluss oder vollständiges Neuladen
führt zu keiner zweiten Abbuchung. Beim Einstieg über eine andere Registerseite
wird das tatsächlich offene Produkt wieder angezeigt. Die Kaufbestätigung
wartet nicht auf einen nachfolgenden Verfügbarkeitsabruf.

## Prüfung und Veröffentlichung

Gezielte Fachtests: `tests/catalog-purchase-*.test.mjs`. Browserprüfung mit
echten Renderern, Einstieg, Controller und Service:

```text
node AleriaAlmanach/tests/catalog-purchase.browser.mjs
```

Der vorhandene Backend-Integrationstest bleibt strikt auf das lokale Projekt
`demo-aleria-scene-trade` und `127.0.0.1:8187` begrenzt. Produktionsinventare
sind kein Testmaterial. Prüfmethoden und tatsächliche Ergebnisse stehen unter
`diagnostics/catalog-purchase-20261108/`.

Diese Umsetzung ist noch nicht veröffentlicht. Für den später freigegebenen
Release gehören Frontend und der aktualisierte `commitItemTrade` zusammen.
Rules, Indizes, Storagekonfiguration und sonstige Funktionen brauchen hierfür
keine Änderung. Die neuen Tests, Styles und Modulquellen sind im bestehenden
Release-Prüfweg für Itemmechanik registriert. Unabhängige Main-Arbeiten und
private Quellen bleiben außerhalb eines isolierten öffentlichen Releases.
