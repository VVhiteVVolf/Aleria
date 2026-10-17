# Badehaus der Fontani

Lokaler Entwurf, nicht veröffentlicht. Acht Inhaltsseiten und die gemeinsame Kommentarseite: Einordnung, Cassianos Kurzbiografie, Hausdienst, sechs Dienstleistungen und vier interaktive Raumszenen mit einklappbarer Einleitung.

Die reinen Personenangaben in `bathhouse-people.mjs` sind die gemeinsame Quelle für Modul und `Stammbäume/assets/js/data/house-fontani-family.js`. Drei Angehörige, eine Ehe und ein Sohn; ältere Generationen und Livias Herkunftshaus bleiben offen. Sieben unbenannte Personalstellen erhalten weder Personenakten noch Porträts.

`bathhouse-hierarchy.mjs`, `bathhouse-services.mjs` und `bathhouse-rooms.mjs` verwenden die vorhandenen Vorlagen. Keine eigene Firebase-, Zahlungs-, Inventar- oder Kommentarmechanik. Stabile Modul-, Personen- und Kommentar-IDs bleiben beim Neubauen erhalten.

Generieren: `node AleriaAlmanach/scripts/build-gwynthor-bathhouse.mjs`; Abgleich ohne Schreibzugriff: derselbe Aufruf mit `--check`. Das erzeugt das lokale Datenscript sowie getrennte Modul- und Familienpakete unter `Charakter Archiv Exporte/Module/Badehaus Fontani`.

Neun Bilder werden mit dem eingebauten ImageGen erstellt; vollständige Prompts, Referenzen und SHA-256-Belege liegen unter `assets/gwynthor-bathhouse/image-prompts.json` und `image-results.json`. Das Wappen liegt einmalig im Stammbaum-Bestand und wird von dort referenziert. Keine Bilddaten werden still technisch verändert.

Lokale Browserprüfung vom 17.10.2026 bestanden: alle neun angezeigten Seiten auf Desktop und Mobilgerät, drei Personalreiter, sechs Dienstleistungen samt Editor-Rundlauf, einklappbare Szeneneinleitungen, genau ein Moduleintrag und die tatsächlich geöffnete Familienakte. Familienvalidierung ohne Diagnosen. Belege: `.tmp/gwynthor-bathhouse/browser-1792205248107/report.json`. Externe Schreibzugriffe waren gesperrt.

Das Fontani-Wappen wurde nach ausdrücklicher Nutzerfreigabe vom 17.10.2026 ausschließlich an Alpha und transparentem Außenrand bereinigt: innen Alpha 255, außerhalb des Kreises Alpha 0, mittig mit rund 87 % Motivbreite. Alle ursprünglichen RGB-Pixel sind ohne Neuberechnung erhalten; das erzeugte Original bleibt im ImageGen-Archiv. Vorhandene Bereinigung aus `scripts/normalize-theater-signs-alpha.py` wiederverwendet. Größen, Versatz, Freigabe und Prüfsummen sind in `assets/gwynthor-bathhouse/emblem-alpha-correction.json` dokumentiert; `image-results.json` verweist auf die bereinigte Datei.
