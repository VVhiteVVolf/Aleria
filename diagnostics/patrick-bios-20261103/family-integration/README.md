# Gemeinsame Biografien und Familienintegration

Die drei geprüften Biografien liegen einmal als öffentliche Autorierungsquelle
unter `AleriaAlmanach/modules/patrick-biographies/source/`. Der eigene Builder
erzeugt daraus eine browserfähige Quelle. Die gemeinsamen Factoryfunktionen
bedienen Familienseed, Charaktervorbereitung und die bestehende klassische
Biografiebrücke. Eigene spätere Texte und ausdrückliche Löschungen bleiben
erhalten. Es wurden keine Owner-IDs oder vollständigen Onlineinventare in
diese Quellen übernommen.

Gwen bleibt dieselbe vorhandene Person `unknown-cadogan-spouse` mit der Welt-ID
`person--family-tree--unknown-cadogan-spouse`. Ihre Ehe mit Cadogan und ihre
beiden Töchter Eluned und Meinwen bleiben in Sgrechiwr unverändert. Nach der
späteren ausdrücklichen Nutzeranweisung erhält ihr Geburtshaus Hamnett eine
eigene bürgerliche Akte unter Cenyr/Silberinsel, ohne unbelegten Sitz, Baronie,
Lehnsherr, Gründer, Eltern oder neue Beziehungsgraphen. Ihre Hamnett-Projektion
verwendet dieselbe Welt-ID; ihr individueller Wohnsitz bleibt Gwynthor.

Die bestehenden Sgrechiwr-, Draenmelyn- und Swyll-Graphen wurden vor und nach
der Integration unabhängig verglichen: alle Personen-IDs und Welt-IDs,
Personenzahlen, Familienrollen, Ehen, Elternkanten, Zweige und bisherigen
Hausprofile sind erhalten. Einziger zusätzlicher Hauseintrag ist das nun
ausdrücklich beauftragte Hamnett. Acht konkrete Beziehungsgruppen der
Verbindungskarten stimmen mit den Graphen überein. Es ergaben sich keine
genealogischen Konflikte. Belege stehen in `connections-review.json`.

Gezielte Korrekturen betreffen Cadogans Geburtsort in der Tabelle
(Lynthor nach seiner eigenen neuen Vergangenheitssektion), Rhiannons konkretes
Amt als Wappen- und Zeichenmeisterin, Gwens bisherige Platzhalterdaten sowie
belegte Bilder. Kleingeschriebene `stammbäume`-Bildpfade werden nur bei
tatsächlich vorhandener lokaler Datei korrigiert. Die leere Myrddin-Verbindung
erhält sein vorhandenes kanonisches Portrait. Sämtliche Originalprosa bleibt
unverändert.

Die scoped Datenbankprojektion schreibt erst mit einer ausdrücklich
übergebenen bestätigten Publikationsreceipt. Öffentliche Exporte enthalten
keine vollständigen Inventare oder Kampfprofile. Vier begrenzte
Begleiterbelege werden über vorhandene Identitätshelfer additiv verarbeitet.
Spätere vollständige Inventarquellen haben Vorrang; verkaufte Tiere werden
nicht wiederhergestellt. Spätere vollständige Bio-/Genealogiequellen ersetzen
außerdem die älteren geprüften Metadatenbelege vor der Namensgruppierung,
damit eigene Texte, neue Namen, Beziehungen und ausdrückliche Löschungen
erhalten bleiben. Gwens überprüfte Primärzuordnung Gwynthor ist als
separater Wohnortbeleg auch für spätere Vollarchivabgleiche reproduzierbar.

Das unabhängige Releasegate `patrick-biographies` umfasst Source-/Bridge- und
Bestiariumprüfungen, den späteren öffentlichen DB-Replaycheck sowie die
gezielten Bio-, Familien-, Tier-, Publikations-, Retirement-, Datenbank- und
Hamnett-Seitentests. Zum Abschluss der Implementierung waren 81 Featuretests
und zwei Gateplanertests erfolgreich. Der echte lokale Datenbankabgleich
bleibt Root nach bestätigter Live-Receipt vorbehalten.

Von diesem Agenten wurden weder Live-Schreibzugriffe noch Pushs oder Deploys
ausgeführt.
