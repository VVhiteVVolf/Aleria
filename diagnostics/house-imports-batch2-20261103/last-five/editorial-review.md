# Unabhängiger Abschlussreview – zehn Weidebucht-Häuser

Stand: 3. November 2026. Keine Produktionsänderungen durch den Reviewagenten.

## Ergebnis

Keine offenen materiellen Befunde in den zehn geprüften Hausinhaltsmodulen. Alle Prosaabschnitte wurden gegen die bereitgestellten narrativen Quellen und den aktuellen öffentlichen Kanon gelesen. Die beiden Kontaktübersichten und die neue Tannau-Figur wurden tatsächlich angesehen.

Die aktuelle `WEIDEBUCHT_HOUSE_PROFILES`-Zuordnung hat Vorrang vor alten Infotabellen. Alle zehn Graphfingerprints stimmen weiterhin mit `before-house-pages.json` überein. Die vorhandenen Personen, Partnerschaften, Elternbeziehungen, Häuser, Zeitsprünge und Kadettenverknüpfungen wurden nicht verändert. Die Hausseiten verwenden die vorhandenen Familien-IDs mit `mode=view` im Stammbaum-Iframe.

## Geprüfte Sonderfälle

- Wylan bleibt Grafenhaus von Cerrigarth in Melwas Au, Weidebucht. Alte O’Dewet-/O’Penrith- und Baron-Verwechslungen fehlen. Wrnachs Regentschaft und Penllyns Vaterbeziehung passen zur aktuellen Akte; eine ungesicherte Alterszahl wird nicht übernommen.
- Dinefwr hat Beynon als Gründer, Tir Addawol Eynon. Erim wird als Stammvater der Bruderhäuser bezeichnet. Die konkreten Höfe ersetzen die gegenwärtigen Registerorte nicht.
- Mochdaer behandelt den Cerrigarth-Zweig. Der nördliche Ursprung ersetzt dessen Wohnort nicht. Relative alte Zeitangaben fehlen; der Asyn-Erbstreit bleibt offen.
- Hwyadens mögliche Crannath-Herkunft bleibt ungesichert. Die vorhandene Figur ist korrekt als Speerkämpfer beschrieben und wird nicht als neuer Bogenschütze ausgegeben.
- Créyr bleibt in Dunstholm/Esgairmor. Die falsche Rotkreuz-Beschreibung ist durch den tatsächlich sichtbaren weißen Flügelvogel auf Rot ersetzt.
- Tannau bleibt bürgerlich. Gerberei und Devise bilden die knappe belegte Grundlage; keine Gründer, Ämter, Religion oder Familienchronik wurden erfunden. Die neue Gerberfigur bleibt anonym.
- Asyns Hauptfamilie verschwand 1639; die bestehende Nebenlinie kehrte 1740 mit Réiltín, Arlais und Griff zurück. Tudwal erscheint historisch, kein neuer heutiger Herrscher wird eingesetzt. Der Besitzstreit ist nicht entschieden. Die Figur ist korrekt mit offenem Helm, Speer und Rundschild beschrieben.
- Ua Fhàire bleibt ein historisches Lairdtum von Bhiorach unter Antike Häuser. Die mögliche ältere Verbindung zu Ui Trisceil bleibt ungesichert. Die Originalfigur ist korrekt als Druide mit Stab und Flamme eingeordnet.
- Ui Trisceil bleibt historisches Mor Tiarnatum am kanonischen Registerort Antikes Cerrigarth. Talamhard wird historisch verwendet. Melwas ist kein Trisceil-Gründer; es existiert keine falsche Gründerkarte für ihn.

## Bilder und Transparenz

Alle neun gelieferten Originalfiguren liegen bytegleich zu den gesicherten Downloads vor. Nur Tannau erhielt ein neues Motiv. Die ursprünglichen Wappen und passenden Hausbilder bleiben erhalten.

Tannaus RGBA-Vorschau zeigte schwache RGB-Restfarben irreführend als Nebel. Die korrekte Alpha-Komposition auf Hellgrau in `tannau-alpha-preview.jpg` wurde angesehen und zeigt einen sauberen Cutout. Es besteht kein offener Halo-Befund und kein Bedarf für eine neue Generierung. Die vorhandenen Alpha-Restwerte sind kein deckender Hintergrund.

## Prüfbelege

- `module-review.json`: unabhängiger Daten-, Rollen-, Bildhash-, Iframe- und Graphabgleich, zehn von zehn Modulen vollständig, keine fehlgeschlagenen Prüfungen und keine Prosa-Warnungen.
- `Familien Häuser und Clans/tests/weidebucht-house-pages.test.mjs`: neun von neun Prüfungen bestanden, einschließlich generierter Hausdaten/Biografien, eigener Browsertexte, Archiv-Ausschluss und Gebietslinks.
- `netlify/tests/house-source-publication.test.mjs`: vier von vier Prüfungen bestanden.
- Node-Tests liefen mit `--experimental-test-isolation=none`, da der Sandbox-Prozessstart andernfalls `spawn EPERM` meldet.

Stammbäume aus Uploads und Militärstatistiken wurden nicht übernommen. Keine Git-Mutationen, Pushs, Deploys oder Firebase-Schreibzugriffe durch diesen Reviewagenten.
