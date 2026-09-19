# Die Nimuiten

`eintrag.json` ist die gemeinsame Textquelle für das Religionsarchiv und das achtseitige Almanach-Modul. Die Texte beruhen auf den inhaltlich übereinstimmenden Nutzerdateien `Codex_Nimuiten_Rueckkehr_nach_Avallorn.md` und `.docx` (Abschnitte 4–17). Redaktions- und Implementierungsanweisungen wurden nicht als Welttext übernommen. Die Bilder folgen dem aktuellen Nutzerauftrag.

Die `almanach.pages`-Zuordnung verteilt jeden Textabschnitt genau einmal auf die Story-Seiten. Der Build erzeugt daraus `AleriaAlmanach/modules/religion/nimuiten/nimuiten-entry.js`. Diese generierte Datei nicht unabhängig bearbeiten.

Aus dem Repository-Stamm:

```sh
node Religionen/scripts/build-religions.mjs
node Religionen/scripts/build-religions.mjs --check
node --test Religionen/tests/*.test.mjs
```

Das Spielleitungswissen ist auf der Religionsseite standardmäßig zugeklappt und im Almanach auf Seite VIII abgegrenzt. Das Aufklappen ist eine Lesehilfe, keine Zugriffssperre. Registerkarte, Suchbegriffe und Seitenbeschreibung enthalten keine Enthüllung über die tatsächliche Opfermacht.

Die Illustration der Göttin zeigt eine symbolische Vision; sie belegt keine Billigung der Sektenlehre. Das neu gestaltete Gemeinschaftszeichen verbindet Kelch, Wellen und ein heimkehrendes Schiff. Es ergänzt keine neue Weiheordnung oder verbindliche Symbollehre. Jede der acht Almanach-Seiten hat ein eigenes Szenenbild im Format 1024 × 1536 (2:3). Prompts stehen neben den Bildern. Alle Bilder wurden mit dem eingebauten Imagegen-Werkzeug erzeugt. Der Vite-Build übernimmt die klassisch referenzierten Modulbilder über `copyReligionModuleAssets`.

| Seite | Motiv | Bilddatei unter `assets/` |
| --- | --- | --- |
| I | Küstenwache und die verlorene Heimat | `nimuiten-kuestenwache-v1.png` |
| II | Iorwerth Prys predigt | `nimuiten-prys-predigt-v1.png` |
| III | Versunkener Tempel als Sinnbild Avallorns | `nimuiten-versunkener-tempel-v1.png` |
| IV | Stille Opferstätte | `nimuiten-stille-opferstaette-v1.png` |
| V | Begegnung mit dem vermeintlichen Meeresvolk | `nimuiten-meeresvolk-v1.png` |
| VI | Trauer am Meer | `nimuiten-trauer-am-meer-v1.png` |
| VII | Untersuchung durch die Sanktoren | `nimuiten-sanktoren-untersuchung-v1.png` |
| VIII | Thraals verborgene Tiefe | `nimuiten-thraals-tiefe-v1.png` |

Die Tempelbilder sind atmosphärische Illustrationen, keine Festlegung eines neuen Hauptheiligtums oder einer bereits erfüllten Heimkehrprophezeiung.
