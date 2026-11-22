# Familie und Kerzenmacherei Glynmor

Das Modul **Kerzenmacherei Glynmor** liegt unter **Völker & Kulturen → Cenyr → Celtigerns Wacht → Llamreis Ankunft → Bannkreis Gwynthor → Gwynthor-Stadt**. Es umfasst Überblick, Dienstleistungen, Betriebsordnung und fünf eigenständige Szenen für Gasse, Ladentheke, Ziehwerkstatt, Zierkammer und Auftragslager. Tudur kann in den Betriebsräumen als Szenenfigur gewählt werden. Meera kommt in der Zierkammer hinzu.

Die [Familienseite](../../../Familien%20H%C3%A4user%20und%20Clans/kleinehaeuser.html?haus=glynmor) und der [Stammbaum](../../../Stammb%C3%A4ume/Stammbaum.html?family=glynmor&mode=view) verwenden dieselbe Familienkennung und dasselbe freigestellte Wappen. Die 21 namentlich belegten Angehörigen sind im Charakterregister unter **Gwynthor** angelegt. Meeras Akte verwendet ihre vorhandene Figurenkennung.

Die Szenen und Bildpfade stehen in `glynmor-chandlery-scenes.mjs`. `glynmor-chandlery-module.mjs` ist für die Modulseiten und Dienstleistungen zuständig. `glynmor-chandlery-hierarchy.mjs` liefert die fünf Hierarchieansichten mit Tudur, Meera und fünf unbenannten Rollen. Figurenbios und Exporte verwenden den vorhandenen Stammbaumimport. [Quelleninventar](../../../Stammb%C3%A4ume/assets/data/source-inventories/glynmor-20261122/README.md) · [Bildmanifest](../../assets/glynmor/manifest.json) · [Generatorprompts](../../docs/art/glynmor-20261122/generation-receipts.json)

Die veröffentlichten Figurenexporte liegen unter `Charakter Archiv Exporte/Glynmor/`. Das importierbare Modulpaket liegt unter `Charakter Archiv Exporte/Module/Kerzenmacherei Glynmor/`.

`node --test AleriaAlmanach/tests/glynmor.test.mjs` prüft Stammbaum, Register und Modulpaket. `node "Familien Häuser und Clans/scripts/build-house-content.mjs" --houses=glynmor --check` prüft die Hausprojektion.
