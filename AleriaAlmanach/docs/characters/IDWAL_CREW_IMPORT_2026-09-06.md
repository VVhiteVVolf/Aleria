# Idwals Schiffsmannschaft – Übernahme am 06.09.2026

Alle 15 namentlich belegten Mitglieder sind in der Online-Gruppe **Idwals Schiffsmannschaft** zusammengefasst: acht neue und sieben vorhandene Figuren. Vorhandene Gruppenzuordnungen bleiben erhalten. Die Mitgliedschaft wird in Firestore unter `char_tabs/config` geführt; die portablen Einzelfigurenexporte sichern die Profile unabhängig davon.

## Figuren und Biografien

| Figur | Aufgabe an Bord | Almanach | Vollständige Biografie |
| --- | --- | --- | --- |
| Idwal Draig | Schiffskapitän | Vorhandenes Profil ergänzt | Übernommen |
| Trevor Gwyvern | Erster Maat | Vorhandenes Profil ergänzt | Noch offen |
| Cederic Chwedonol | Zweiter Maat | Vorhandenes Profil ergänzt | Noch offen |
| Ifor Beryn | Steuermann | Vorhandenes Profil ergänzt | Übernommen |
| Sindre Brandstolz | Bootsmann | Neu angelegt | Noch offen |
| Llewarch Tonnarth | Quartiermeister | Vorhandenes Profil ergänzt | Übernommen |
| Cadell Ysgrif | Schiffsmeier | Neu angelegt | Übernommen |
| Rhy Dyger | Schiffsbarde | Neu angelegt | Noch offen |
| Cenric Scandyn | Ausguck auf dem Krähennest | Vorhandenes Profil ergänzt | Noch offen |
| Rhodri Aelmor | Wachmeister | Neu angelegt | Übernommen |
| Afan Gwyntog | Ritter zur See | Neu angelegt | Noch offen |
| Talon Trydar | Knappe zur See | Vorhandenes Profil ergänzt | Noch offen |
| Caradog Tonnarth | Schreiber & Adjutant | Neu angelegt | Übernommen |
| Murdo Marlòn | Schiffskoch | Neu angelegt | Noch offen |
| Angus Lònan | Proviantmeister | Neu angelegt | Noch offen |

## Quellen und Entscheidungen

- Die aktuelle Online-Fassung des Moduls `idwals-schiffsmannschaft` liefert die Besatzung, Rollen und Idwals vollständige Biografie. Sie enthält Rhy Dyger als Schiffsbarden; der ältere Export vom 09.08.2026 enthielt noch Glendower Cysgodion.
- Fünf weitere vollständige Biografien stammen aus den veröffentlichten Stammbaumdateien: Ifor Beryn (Haus Beryn), Llewarch und Caradog Tonnarth (Haus Tonnarth), Cadell Ysgrif (Haus Ysgrif), Rhodri Aelmor (Haus Aelmor).
- Rhodris aktuelle Rolle lautet auf ausdrücklichen Wunsch **Wachmeister**. Profil, Biografie, veröffentlichter Stammbaum und beide Darstellungen der Schiffshierarchie sind abgeglichen. Der separate vakante Waffenmeisterposten bleibt frei.
- Elf Figuren sind eindeutig mit bestehenden Stammbaumpersonen verknüpft. Sindre Brandstolz, Rhy Dyger, Murdo Marlòn und Angus Lònan erhalten eigenständige Almanachprofile ohne erfundene Familienverbindungen.
- Die vorhandene Namensschreibweise Cederic Chwedonol bleibt erhalten; die Verknüpfung führt zu seiner Stammbaumperson im Haus Chwedlonol.
- Vakante Positionen, die Sammelgruppe Pagen und nicht namentlich beschriebene Seeleute werden nicht als erfundene Einzelpersonen angelegt.
- Bei den neun offenen Biografien bleiben belegte Kurzbeschreibungen und Bordaufgaben stehen. Neue Lebensgeschichten werden erst in einem späteren Schritt ergänzt.

## Prüfung und Datenerhalt

Die Schreiboperation wurde atomar mit Versionsprüfung durchgeführt und anschließend vollständig zurückgelesen. Geprüft wurden alle 15 Figuren, sechs Biografien, die Gruppenmitgliedschaft und Rhodris Rolle. Bei den sieben vorhandenen Profilen stimmen sämtliche nicht angefassten Felder weiterhin mit dem Ausgangsstand überein, insbesondere Inventar, Kampfdaten, Bilder und Eigentümerdaten. Vor dem Schreiben wurde eine lokale, nicht veröffentlichte Sicherung angelegt.

Browserprüfung mit den zurückgelesenen Daten: alle 15 Profile öffnen, sechs vollständige Biografien zeigen korrekte Steckbriefwerte, neun Profile behalten den offenen Biografiebereich. Idwals Biografie wurde auf Desktop und bei 390 Pixeln ohne horizontalen Überlauf geprüft; keine JavaScript-Seitenfehler.

Der Archivabgleich deckte außerdem eine bisherige Zusammenführung alter und neuer Inventarlisten auf, die Begleiter duplizieren konnte. Die bestätigten Exporte verwenden deshalb die dokumentierte Strategie `replace-exported-fields`. Drei Regressionstests prüfen vollständige Feldübernahme einschließlich leerer Werte, zeitliche Priorität und die unveränderte Behandlung bisheriger ergänzender Exporte. Zusammen mit den bestehenden Datenbank- und Cenyr-Prüfungen bestehen 15 Tests. Der erzeugte Snapshot enthält 234 Figuren; die 219 nicht beteiligten Profile sind abgesehen von Synchronisationsmetadaten unverändert. Die sieben bestehenden Mannschaftsprofile und acht neuen Profile stimmen in Biografie, Inventar, Kampfprofil und Bildern mit dem zurückgelesenen Online-Stand überein.

Die Einzelprofile liegen als `*-schiffsmannschaft-2026-09-06.json` im Charakterarchiv. Der aktuelle Modulstand liegt als `Biographien/idwals-schiffsmannschaft-modulpaket-2026-09-06.json` daneben. Historische Exporte bleiben erhalten.
