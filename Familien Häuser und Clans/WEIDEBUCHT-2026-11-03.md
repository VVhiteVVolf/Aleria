# Weidebucht: Hausseiten, Biografien und Darstellungen

Stand: 3. November 2026. Ausschließlich lokal; nicht veröffentlicht.

Die zehn gelieferten Vorlagen ergänzen zehn bereits bestehende Familienakten.
Jede besitzt eine eigene `haus.content.mjs` unter `Estryll/Cenyr/Weidebucht/`.
Der vorhandene Builder erzeugt daraus Seitendaten und Stammbaum-Hausbiografie.
Die gemeinsame Laufzeit und die bestehenden Familien-IDs bleiben erhalten.

## Umfang

| Familien-ID | Ordner unter `Weidebucht/` | Hauptdarstellung |
| --- | --- | --- |
| haus-wylan | Melwas_Au/Haus_Wylan | Original |
| haus-dinefwr | Melwas_Au/Haus_Dinefwr | Original |
| haus-mochdaer | Melwas_Au/Haus_Mochdaer | Original |
| haus-tir-addawol | Hochweide/Haus_Tir_Addawol | Original |
| haus-hwyaden | Borkenstein/Haus_Hwyaden | Original, Speerritter |
| haus-creyr | Dunstholm/Haus_Creyr | Original |
| haus-tannau | Melwas_Au/Haus_Tannau | Neuer Gerber |
| haus-asyn | Melwas_Au/Haus_Asyn | Original |
| haus-fhaire | Antike_Haeuser/Clan_Ua_Fhaire | Original, Druide |
| haus-trisceil | Antike_Haeuser/Clan_Ui_Trisceil | Original |

Tannau bleibt eine kleine vorbereitete Seite. Die benannte Gerberei „Die
gebundene Schicht“ und die Hausdevise bilden ihren Handwerkskern; eine Chronik,
Ämter oder benannte Angehörige werden nicht erfunden. Weitere niedere Häuser
wurden in diesem Auftrag nicht ausgearbeitet.

## Quellen und Rollen

Die Originalanhänge liegen unverändert als `animexx-source-2026-11-03.html` in
den Hausordnern. `source-manifest.json` enthält Anhangskennung, SHA256,
Bildherkunft und Entscheidungen. „Hierarchie“ und „Stammbaum“ der alten HTMLs
werden vollständig ignoriert. Jede Seite bettet ausschließlich die bestehende
Familienakte mit stabiler ID und `mode=view` ein. Personen, Ehen, Abstammungen
und Lebensdaten bleiben unverändert.

Aktuelle Hausprofile bestimmen Ränge, Sitze und Lehensbindungen. Wylan bleibt
Grafenhaus von Cerrigarth, Melwas Au eine Baronie und Créyr das Baronenhaus von
Esgairmor in Dunstholm. Mochdaers Cerrigarth-Linie bleibt von der Gwyliau-Akte
getrennt. Bhiorach und Antikes Cerrigarth behalten ihre antiken Registergruppen
und die Ränge Laird beziehungsweise Mor Tiarna. Talamhard ist der historische
Name in der Trisceil-Geschichte.

Alte Infotabellen und Hofkarten werden nicht kopiert. Karten nutzen nur
bestehende benannte Personen mit belegten Rollen. Beynon ist Gründer von
Dinefwr, Eynon von Tir Addawol. Erim ist der gemeinsame Stammvater und kein
erfundener erster Baron oder Ritterfürst. Melwas gründete Wylan und wird nicht
zum Gründer der Ui Trisceil. Unbekannte frühe Gründer erhalten keine erfundenen
Namenskarten.

Bei Asyn bleiben das Verschwinden der Hauptfamilie 1639 und die Rückkehr von
Réiltín, Arlais und Griff 1740 erhalten. Tudwal ist historisches Oberhaupt;
ein heutiger Amtsinhaber wird nicht festgelegt. Der Besitzstreit mit Mochdaer
bleibt offen. Die vermutete ältere Kadettenherkunft der Ua Fhàire wird nicht als
neue gesicherte Abstammung behandelt.

Alle militärischen Mengen, Truppen- und Flottenstatistiken sowie Größenvergleiche
werden verworfen. Militärprofilfelder bleiben leer und ihre Gruppe verborgen.
Rittertum und Tiarnatum sind ausschließlich qualitativ beschrieben. Die
Hausprosa bewahrt widerspruchsfreie Geschichte, Kultur und Lebensweise;
Redaktionsentscheidungen stehen in den Manifesten.

## Bilder und Verknüpfungen

Alle neun passenden Originalfiguren werden unverändert übernommen. Hwyadens
Speerritter bleibt trotz des erzählten Helwyr-Schwerpunkts erhalten; die
Ua-Fhàire-Druidenfigur ebenso. Fehlerhafte Kreuz-, Helm- und Waffenbeschreibungen
werden den vorhandenen Bildern angeglichen. Es wurden keine Originale ersetzt.

Nur Tannau erhielt wegen der fehlenden Figur eine neue Darstellung: ein
unbenannter Gerber mit Arbeitskleidung, Lederschürze, Lederrolle und Holzhammer.
Er begründet keine Personenakte. Prompt und Prüfsumme stehen im jeweiligen
`image-generation.json` und unter `diagnostics/house-imports-batch2-20261103/`.

18 bestehende Hauskarten in sechs Gebietsdatenmodulen öffnen die passende
Hausseite direkt. Dafür wurden nur `href`-Felder ergänzt. Die Galerie wurde
auf zehn Haus-IDs begrenzt aktualisiert. Die anderen 872 Hausdatensätze und
alle 1.008 vorherigen Bilddatensätze bleiben inhaltlich unverändert;
`gallery-preservation.json` dokumentiert den Vergleich.

Originalquellen, Manifeste und Bildprotokolle bleiben Arbeitsquellen außerhalb
des statischen Pakets. Aktive Bilder und generierte Seitendaten bleiben
auslieferbar. Keine Firebase-Schreibzugriffe, kein Push und kein Deploy.

## Prüfungen

```powershell
node "Familien Häuser und Clans/scripts/build-house-content.mjs" --check
node "Familien Häuser und Clans/tests/weidebucht-house-pages.test.mjs"
node Kontinente/tests/weidebucht.test.mjs
node Gallerien/krieger/tests/scoped-catalog.test.mjs
node Gallerien/krieger/scripts/build-catalog.mjs --houses=haus-wylan,haus-dinefwr,haus-mochdaer,haus-tir-addawol,haus-hwyaden,haus-creyr,haus-tannau,haus-asyn,haus-fhaire,haus-trisceil --check
```

`before-house-pages.json` sichert die zehn ursprünglichen Graph-Prüfsummen.
Die gezielte Suite prüft aktuelle Metadaten, Gründerrollen, unveränderte Graphen,
Originalbildhashes, Iframes, Direktlinks, Quellenfilter und den Erhalt eigener
Biografietexte und bewusster Löschungen. Das einmalige Übernahmeskript
verweigert das Überschreiben vorhandener Autorenmodule.

Die abschließende Browserprüfung bestätigt Tannaus neue Gerberfigur, die
tatsächlich geladenen Familien-iframes von Tannau und Wylan, Wylans Kurzbiografie
mit Bild und Rücklink sowie die erhaltene Ua-Fhàire-Druidenfigur. Auf den drei
geprüften Hausseiten wurden keine defekten Bildpfade gefunden. Beide Haus-Suiten
(einschließlich Ährental) bestehen mit zusammen 18 Prüfgruppen. Alle zehn
Weidebucht-Seitendaten und Hausbiografien entsprechen ihren Autorenmodulen.

Der globale Hausgenerator meldete außerhalb dieses Auftrags eine veraltete
`Sonnenkueste/Gerstekueste/Haus_Bellyn/haus.data.js`. Dieser fremde lokale
Arbeitsstand wurde nicht verändert. Der gezielte Weidebucht-Abgleich und der
begrenzte Galerieabgleich sind erfolgreich. Abschlussbeleg:
`diagnostics/house-imports-batch2-20261103/verification.json`.
