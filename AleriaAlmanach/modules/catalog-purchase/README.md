# Schnellkauf direkt im Güterregister

Die bestehenden Modul-Warentabellen
und Güterkarten besitzen einen direkten Kaufen-Button. Der kompakte native
Dialog bietet eine suchbare Käuferwahl, Mengenwahl, Preis und Geldbeutelvorschau.
Die kaufende Figur erhält die Ware automatisch. Nur die ausdrückliche Option
„Für eine andere Figur kaufen“ öffnet eine zusätzliche Warenempfängerwahl.
Käufer und bestellendes Gruppenmitglied werden pro Anmeldung und Modul gemerkt;
Warenempfänger werden bei neuen Käufen nie aus alten Einstellungen übernommen.
Die Erstöffnung wählt keinen fremden Geldbeutel automatisch aus.

Eine Gruppenkasse ist als Zahler auswählbar, wenn ihre gespeicherte Besetzung
mit tatsächlichen Figuren verknüpft ist. Dann wird zusätzlich die bestellende
Gruppenfigur angezeigt und ist auf bestätigte Mitglieder begrenzt. Der
Warenempfänger ist zunächst das bestellende Mitglied; ein ausdrücklicher
Fremdkauf kann eine andere Figur außerhalb der Gruppe begünstigen. Der Server prüft
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
Vor dem Kauf stehen Istbetrag und geplanter Rest nebeneinander. Nach bestätigtem
Kauf zeigt der Dialog die Abbuchung und den tatsächlichen Geldbeutel; bei
nachlieferbarer Ware heißt eine weitere Bestellung ausdrücklich „Noch einmal
kaufen“. Die Bestätigung nennt auch die Figur, die die Ware erhalten hat.

Der gemeinsame Charakterregister-Listener aktualisiert einen bereits geöffneten
Inventarleser sofort beim bestätigten `aleria:character-saved`-Ergebnis. Er wartet
nicht auf einen späteren identischen Registersnapshot. Offene Inventarentwürfe
bleiben erhalten und erhalten die bestehende Konfliktwarnung. Beide Ereigniswege
verwenden dafür denselben begrenzten Aktualisierungshelfer in `character-tabs.js`.

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

Die Überarbeitung vom 15. November 2026 ist lokal geprüft, noch nicht
veröffentlicht. Sie ändert keine Backend-Laufzeitdatei: Geld und Ware wurden
bereits gemeinsam atomar gebucht. Neue gezielte Tests decken den Eigenkauf von
Rosenquarz aus Göttliche Eleganz mit 12 Gold / 4 Silber Startgeld und genau
8 Gold / 1 Silber / 50 Kupfer Restgeld einschließlich Wiederholungsschutz ab.
Aktuelle Belege: `diagnostics/catalog-checkout-20261115/`. Historische Belege und
unabhängige Main-Arbeiten bleiben erhalten.
