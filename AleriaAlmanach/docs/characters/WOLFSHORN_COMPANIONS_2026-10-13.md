# Wolfshorn-Gefährten · 13. Oktober 2026

Lokal angelegt und mit den bestehenden Besitzerakten sowie Inventaren verbunden. Kein Push, keine Veröffentlichung und keine Firebase-Schreibzugriffe.

| Kreatur | Besitzer | Art / Rasse | Stufe | Besonderheit |
| --- | --- | --- | --- | --- |
| Skarn | Hrolf Wolfshorn | Gramnir | 2 | 36 Jahre, altersschwach, Frekis **Großvater**; Hrolf musste ihn am Ende der Reise tragen |
| Myrk | Hrolf Wolfshorn | Hest-Hengst | 3 | Älterer kräftiger Schecke, stoisch, gehorsam und außergewöhnlich treu |
| Lund | Halvar Wolfshorn | Hest–Tirashan-Mischling | 3 | Unsicher dokumentierte Linie, weitere Rassen möglich; wachsames Waldpferd, das Halvar mehrfach rettete |
| Häppchen | Asgeir Wolfshorn | Hest-Schimmel | 2 | Disziplinlos; Name nach Asgeirs vier bis fünf bereits verlorenen Pferden |
| Silberkrone | Ylva Wolfshorn | Hest-Stute, Schimmel | 3 | Sorgfältig gepflegte silberne Flechtmähne, Wolfshorn-Schild am Sattel |

Die Biografien stehen im eigenen Katalogmodul `modules/creatures/catalog/wolfshorn-companions.js`. Inventarkarte, Inventareinzelstück und Kreatur teilen feste, beidseitig verknüpfte IDs. Skarns Inventarstatus lautet ausdrücklich **Altersschwach**. Seine verringerte Konstitution, Geschicklichkeit und Bewegung bilden seine körperliche Schwäche ab; seine Größe hebt seine Stufe nicht an.

Lund erhält keinen erfundenen Rasse- oder Zuchtbucheintrag. Das gemeinsame Kreaturmodell unterstützt dafür `bestiaryAncestry`: geprüfte Verweise auf tatsächlich vorhandene Abstammungsprofile mit erklärendem Hinweis. In Übersicht und Profil erscheinen Hest und Tirashan als **Abstammungsverweise**, zusammen mit der unsicheren Dokumentation und den möglichen weiteren Rassen. Export, Import und Duplikation erhalten diese Angaben. Ein eindeutiger Rasseverweis bleibt bei Lund leer. Die bestehenden Rasseneinträge der anderen Tiere verweisen auf Hest beziehungsweise Gramnir.

## Bilder

Die vier zuvor ausgewählten Bilder sind unverändert als `assets/companions/wolfshorn/skarn.png`, `myrk.png`, `lund.png` und `haeppchen.png` übernommen. Silberkrone wurde mit der integrierten Bildgenerierung im gespeicherten Anime-Stil Tales of Xillia/Frieren erstellt: 1024 × 1536 Pixel, klare Lineart und Cel-Shading. Hest-Profil und vorhandenes Hest-Porträt dienten als Anatomie- und Stilreferenzen, `public/assets/character-equipment/asgeir-rundschild-v1.png` als konkrete Schildvorlage. Die ausgewählte zweite Fassung korrigiert die Stutenanatomie und ergänzt den Schildbuckel.

Vollständiger Prompt einschließlich Überarbeitung: `assets/companions/wolfshorn/silberkrone.prompt.txt`. Originalpfade, Bildmaße und SHA-256-Prüfsummen: `assets/companions/wolfshorn/assets-2026-10-13.json`. Generierungsoriginale bleiben erhalten. Frekis vorhandenes Porträt und sein Kreaturbogen wurden nicht ersetzt.

## Übernahme und Prüfung

Importierbare Kreaturbögen und vollständige Besitzerentwürfe liegen unter `Charakter Archiv Exporte/gefaehrten/wolfshorn-2026-10-13/`. Die vier Teil-Overlays im Export-Hauptordner sind ausschließlich Belege für den lokalen Inventarabgleich; sie dürfen nicht als vollständige Onlinefiguren importiert werden.

Die vier lokalen Akten wurden mit dem vorhandenen, auf Inventare begrenzten Datenbankabgleich aktualisiert. Bestehender Besitz, Freki, Kampfprofile, Genealogie und alle 234 übrigen Figuren bleiben erhalten. Ylvas Kampfausrüstung erhält durch die Schilddarstellung im Bild keinen automatischen Schildbonus. Die Bilddarstellung verlangt keinen Umbau ihres Kampfprofils.

Vor einer später ausdrücklich freigegebenen Veröffentlichung müssen die vier Onlinefiguren und der Kreaturbestand erneut gelesen werden. Neue Kreaturen und Inventarverknüpfungen gemeinsam und versionsgeprüft ergänzen; aktuelle Ressourcen, Zustände, Besitz, Online-IDs und historische Kampfbeiträge erhalten. Vollständige Entwurfsexporte sind Reviewbelege und kein Ersatz für diesen Abgleich. Onlineinventare haben bis zur Veröffentlichung weiterhin Vorrang vor den lokalen Entwürfen.

Validierung: 44 relevante Tests bestanden; Vite-Build erfolgreich. Browserprüfung umfasst die tatsächliche lokale Charakterdatenbank, alle fünf Inventarverknüpfungen und Porträts, Bestiarium-Ziele, Art-/Stufenfelder und mobile Darstellung. Prüfbelege liegen unter `.codex-temp/wolfshorn-companions-review/`.
