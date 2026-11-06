# Pert-Figuren im Almanach

`character-content.mjs` besitzt die 17 individuellen Biografien. Personen,
Lebensdaten, Geschlecht, Porträts und Beziehungen stammen über den vorhandenen
Genealogieadapter aus der registrierten Familie `pert`. Die beiden unbenannten
Gründer bleiben ausschließlich im Stammbaum. Es entsteht kein Shopmodul.

Die unveränderten Originalquellen und die begründeten Familienentscheidungen
liegen unter `Stammbäume/assets/data/source-inventories/pert-20261106/`.
Für Kevan ist zusätzlich seine ältere Akte relevant: Seine Grenzwacht an der
östlichen Straße, die vom Marschall veranlasste Versetzung zur erkrankten
Großmutter und sein anschließender Verbleib auf Castell Draig bleiben erhalten.
Die ausdrücklich beauftragte neue Familienquelle ersetzt die widersprechenden
Eltern-/Großelternangaben durch Goronvy, Lowri, Iorwerth und Gwerfyl. Der aktuelle
Quellenexport verwendet die belegte Schreibweise Goronvy; Goronwy bleibt Alias
der Prosa. Rhiain ist weiblich, Canna unbestimmt. Roísins allein benannter
Elternteil ist Sioned; Donnchadh erhält keine angenommene Vaterschaft.

`character-database.mjs` verwendet für die 16 neuen Akten den bestehenden
begrenzten Autorenimport. Kevans Laufzeitkennung `jTzoT0bqb2lfmslJ05FJ`, sein
bisheriger Gwynthor-Aktenpfad und sämtliche Spiel-/Besitzdaten bleiben erhalten.
Seine freigegebene Profilfeldmaske ist `bio`, `biography`, `portrait`,
`identity.worldPersonId`, `genealogy`, `updatedAt`. Die Familienverknüpfungen der
Indizes und ihre Hashes werden mit den bestehenden Datenbankfunktionen ergänzt.
Neue Figuren bekommen keine Inventar-, Kampf-, Geld- oder Startvergaben.

Kevans bisherige externe Profilportrait-URL `https://i.imgur.com/Sl4ntci.png`
antwortete bei der echten Browserprüfung mit HTTP 403. Auf ausdrückliche
Freigabe nutzt sein Profil dieselbe bytegleich archivierte Pert-Originaldatei
wie der Stammbaum und seine Bio. Seine Akte hat kein explizites Bildset, das
die Referenz überlagert. Emotes bleiben unverändert; ursprüngliche URL und
Quellakte bleiben in der vorhandenen Quellenhistorie erhalten.

Der Builder schreibt ausschließlich 17 Einzelexporte unter
`Charakter Archiv Exporte/Pert/`, 17 ausgewählte Akten und drei Datenbankindizes.
Ohne `--apply` oder `--check` zeigt er nur den Plan:

```powershell
node AleriaAlmanach/scripts/build-pert-characters.mjs
node AleriaAlmanach/scripts/build-pert-characters.mjs --apply
node AleriaAlmanach/scripts/build-pert-characters.mjs --check
```

Für eine isolierte öffentliche Quelle gibt `--root <Pfad>` die eigene Basis
vor. Die Funktion rechnet auf deren Registern und Akten; Main-Indizes oder
Kevans vollständige Main-Akte werden nicht als öffentliche Basis kopiert.
Alle Einzelexporte verwenden den bereits vorhandenen Vertrag
`replace-reviewed-metadata-fields`, damit spätere Onlinevollstände Vorrang
behalten. Der Builder führt keine Firestore-Schreibzugriffe und keinen
Website-/Händler-/Backendbuild aus.

Fachprüfungen:

```powershell
node --test --experimental-test-isolation=none AleriaAlmanach/tests/pert-character-import.test.mjs AleriaAlmanach/tests/authored-character-import.test.mjs
```

Der echte Almanach-Browserlauf liegt in
`diagnostics/pert-release-20261106/characters/browser-review.mjs` und unterstützt
`ALERIA_PERT_BROWSER_ROOT` und `ALERIA_PERT_BROWSER_ORIGIN`. Er prüft die echten
statischen DB-Projektionen, 17 Profile und Biografien auf Desktop und Mobil,
sperrt sämtliche Schreibanfragen und kann auf die isolierte öffentliche Quelle
oder die spätere Website ausgerichtet werden. Lokale Originalakten und
Freigabebelege unter `diagnostics/` sind keine pauschalen Releaseeingaben.
