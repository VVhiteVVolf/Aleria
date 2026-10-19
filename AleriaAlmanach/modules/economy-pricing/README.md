# Preisprüfung vom 19. Oktober 2026

Die Prüfung vergleicht alle versionierten Standardmärkte einschließlich Ross- und Viehmarkt mit den tatsächlichen Güter- und Dienstleistungspreisen der Almanach-Module. Der Bericht umfasst auch nicht angebotene Ausrüstungsvorlagen, freie Sortimentsplätze und bewusst nicht mehr erhältliche Biere. Diese erhalten keinen erfundenen Nullpreis und keinen Absatz.

Die aktuelle Fassung erfasst 1.113 Zeilen. 144 Preisbelege wurden geändert oder mit ihrem gemeinsamen Standard abgeglichen. Dahinter stehen 39 gezielte Standardpreiskorrekturen, acht Hausproduktkorrekturen und Abgleiche veralteter Kopien beziehungsweise Markenpreise. Alle 50 Tier- und Pferdepreisbereiche bleiben erhalten.

- **Autoritative Quellen:** die Markt-Datendateien und die Hausproduktmodelle. `apply-market-price-review.mjs` dokumentiert und reproduziert die gezielten Quelländerungen; es ist kein allgemeiner Build-Schritt, der spätere Preise heimlich zurücksetzt.
- **Änderungsbelege:** `price-review-rules.mjs` nennt Vorher, Nachher und Begründung. Der ursprüngliche öffentliche Preisstand liegt unverändert unter `sources/`.
- **Abgeleitete Leseschicht:** `price-reference.generated.mjs` enthält nur IDs, Namen, Einheiten und aktuelle Preise aus dem Standardregister. Neue Preise werden nicht an dieser Stelle von Hand gepflegt.
- **Alte gespeicherte Module:** `applyVenuePriceReview` arbeitet rein und ohne Datenbankzugriff. Nur bekannte frühere Werte und Standardkopien werden geändert. Der Eintrag bekommt eine im gemeinsamen Sanitizer erhaltene Revisionskennung. Wiederholtes Lesen skaliert nichts erneut, spätere eigene Preisänderungen bleiben erhalten.
- **Kaufabwicklung:** dieselbe Projektion wird innerhalb von `buildModuleOffers` im Browser und in der generierten Serverfassung verwendet. Der Server rekonstruiert neue Preise und Angebotsrevisionen selbst aus dem gespeicherten Ursprungsmodul; er vertraut keinen vom Client gelieferten Preisen. Es gibt keine Online-Massenänderung von Modulen oder Charakteren.

Die Prüfung ist eine interne Abstimmung einer fiktiven Wirtschaft, keine historische Preisstatistik. Der noch veränderbare Vergleichs-Hafenlohn von 27 KT je Neuntagewoche setzt 24 KT Familienbedarf und 3 KT freie Mittel voraus. Örtliches Angebot, Mengen, Qualität und Betriebskosten bleiben getrennte Einflüsse. Derselbe Anpassungsfaktor wird nicht auf alle Waren und Länder angewendet.

Rassenbänder, unbestimmte Beutelgrößen und mythische Einzelartefakte werden im Bericht ausdrücklich eingeordnet. Aus einem hohen Verhandlungswert wird keine tatsächlich vorhandene Nachfrage abgeleitet. Die geschlossene Champagnia-Flasche darf je Liter günstiger sein als glasweiser Ausschank; das ist kein Umrechnungsfehler.

```powershell
node AleriaAlmanach/scripts/build-item-register.mjs
node AleriaAlmanach/scripts/build-economy-price-reference.mjs
node AleriaAlmanach/scripts/build-economy-price-review.mjs
node firebase/functions/scripts/sync-almanach-mechanics.mjs
```

Für Prüfungen unterstützen die beiden Preis-Builds `--check`. Der eigenständig lesbare, durchsuchbare Bericht liegt unter `docs/economy/price-review-2026-10-19.html`, die vollständigen Werte unter der gleichnamigen JSON-Datei. Frontend und Kauf-Backend sind gemeinsam mit identischer Standardversion zu veröffentlichen.
