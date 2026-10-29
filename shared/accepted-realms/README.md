# Bestätigte Länder · Übernahme vom 28./29. Oktober 2026

Die sechs unveränderten JSON-Exporte und Moinneachs erste Variante wurden nach
der ausdrücklichen Freigabe der Zuordnungen in reguläre Aleria-Seiten übernommen.
Neueste Nutzerkorrekturen haben Vorrang vor Exporten und früheren Vorschautexten.
Die Vorschauwerkstätten bleiben unabhängig; Browserentwürfe werden weiterhin
nicht automatisch übernommen. Es gibt keine Firebase-Schreibstrecke.

## Umfang und Einstieg

166 Herrschaftsseiten, 74 Ortsakten, 119 Hausseiten samt Stammbaum-Hausbio und
Kriegerzuordnung, 117 neue personenlose Familienakten. Sonnenfels und Weinlaub
behalten ihre vorhandenen Personen und Beziehungen. Hochreuth ist nach der
ergänzenden Nutzerzuordnung bei den Roden in Thronholt einsortiert; der genaue
Kartenpunkt von Burg Hochreuth bleibt offen. Seine bestehende Hausseite und
der Ministerialenrang wurden abgeglichen.

- [Lothir](../../Kontinente/Lothir/Lothir.html)
- [Aldervan](../../Kontinente/Aldervan/Aldervan.html)
- [Aldingen](../../Kontinente/Lothir/Aldingen/grossherzogtum-aldingen/index.html)
- [Goldmund](../../Kontinente/Lothir/Goldmund/herzogtum-goldmund/index.html)
- [Weisenfluh](../../Kontinente/Lothir/Weisenfluh/koenigreich-weisenfluh/index.html)
- [Moinneach](../../Kontinente/Lothir/Moinneach/fuerstentum-moinneach/index.html)
- [Iathneach](../../Kontinente/Lothir/Iathneach/fuerstentum-iathneach/index.html)
- [Deitheach · historische Ordnung](../../Kontinente/Aldervan/Deitheach/fuerstentum-deitheach/index.html)
- [Triarchie · besetztes Lothir](../../Kontinente/Lothir/Triarchie/triarchie-lothir/index.html)

## Zuständigkeiten

- `data/*.source.json`: bestätigte Zuordnungen und stabile Identitäten.
- `realm-enrichment.mjs`: redaktionelle Korrekturen und überlieferter Landeskontext.
- `territory-topology.mjs`: Elterngebiete, Sitzherrschaften und örtliche Hausbereiche.
- `house-placement.mjs`: Profile und Registerpfade, getrennt von Ortsbewohnerschaft.
- `territory-article.mjs`, `house-content.mjs`, `place-content.mjs`: jeweilige
  Datenadapter für die bestehenden Herrschafts-, Haus- und Ortsshells.
- `catalog.mjs`: gemeinsamer Katalog, keine DOM- oder Firebase-Verwaltung.
- `map-places.mjs`: geprüfte Koordinaten und ausdrückliche Bewohnerlisten.
- Die eigentlichen Renderer bleiben in ihren bisherigen Features.

Jedes Haus besitzt eine kleine eigene `haus.content.mjs` als Erweiterungspunkt.
Neue individuelle Chroniken dort ergänzen; gemeinsame Zuordnungen im Katalog
pflegen. Stammbaum-Personen werden weiterhin in ihren Familienquellen gepflegt.

## Bewusste Grenzfälle

- Moinneach: Variante `original`, zehn Stadtgebiete. Gergonax ist Hauptstadt,
  Cethrenn und Barrex sitzen dort, Rowak in Tarvex. Alte Kartenbanner werden als
  örtliche Landschaftszeichen erhalten.
- Hasselt: Velten sind Grafen unter Klingen; die ältere Kartenfarbgruppe Borgeln
  bleibt als geographische Information erhalten. Keine erfundene neue Grafschaft.
- Goldmund: Aurelmark und Edelstrom haben noch keine benannten Grafenfamilien.
- Iathneach: Die drei nichtfürstlichen Mor-Führungen bleiben offen. Keine
  willkürliche Beförderung eines der örtlichen Laird-Clans zum Mor Tiarna.
- Deitheach: frühere Eigenständigkeit, Rang- und Sitzordnung. Keine aktuellen
  Bewohner oder Todesfälle aus der Eroberung abgeleitet.
- Triarchie: gegenwärtige Besatzung und historische Herkunft sind getrennte
  Herrschaftsakten. Eine physische Stadt besitzt genau eine Ortsakte.
- Sonnenfels: nach Nutzerfreigabe passend im südlichen Weislauf unter Weißmann;
  Rebenwacht nahe Ewigensee unter Goldkranz. Beide Burgpunkte sind vorläufig.
- Velten in Aldingen und Goldmund bleiben getrennte Häuser. Droch Trodach aus
  Deitheach wird nicht mit Leitheachs Ard Trodach zusammengelegt.
- Die zwei neuen Hausritter-PNGs haben trotz ImageGen-Freistellungsversuchen
  einen schwachen halbtransparenten Dunst. Originale und Einschränkung stehen
  jeweils im `art-source.json`; keine unerlaubte Alpha-Nachbearbeitung.

## Wiederholbarer Build

Vom Repository-Stamm aus:

```text
node shared/accepted-realms/scripts/build-pages.mjs
node shared/accepted-realms/scripts/build-maps.mjs
node "Familien Häuser und Clans/scripts/build-house-content.mjs"
node Kontinente/scripts/build-alben.mjs
node Karten/tools/build-households.mjs
node Gallerien/krieger/scripts/build-catalog.mjs
node --test --experimental-test-isolation=none shared/accepted-realms/tests/accepted-realms.test.mjs
```

Die Buildskripte unterstützen `--check`. Der reguläre Netlify-Prüfplan enthält
die neue Prüfung `accepted-realms`. Er benötigt weder Downloads noch die
Vorschauimplementierung. `admit-art.mjs --check` prüft die 647 aufgenommenen
Original- und Vorschau-Bilddateien anhand ihrer Hashbelege.

`scripts/settle-country-sources.mjs` ist ein einmaliger redaktioneller Import:
Er liest archivierte Quellen und die dokumentierten Rechercheaudits unter
`diagnostics/country-promotion-20261028`. Er ist kein Release-Buildschritt und
darf spätere manuelle Korrekturen der bestätigten Quellen nicht überschreiben.

Die Übernahme ist lokal vorbereitet. Die frühere Veröffentlichungsfreigabe
deckt nach AGENTS.md keine erst danach entstandenen neuen Arbeiten ab.
