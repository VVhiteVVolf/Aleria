# Besondere Aktionen: falsche Erholung in der Anzeige

Die lesende Prüfung des Duells Gildas gegen Gawain bestätigte den korrekten
serverseitigen Verbrauch: Schweifkreis 2 → 1, Flügelschritt 1 → 0,
Geschlossene Schuppe weiterhin 0. Die gespeicherten Ressourcen trugen den
Erholungsschlüssel des Szenenuhrtags 2.

Der Browser verwendete stattdessen den Aleria-Kalenderindex. Ein Morgenanker
auf Uhrentag 2 ohne Kalenderwechsel liefert dort weiterhin Index 1. Wegen
der unterschiedlichen Schlüssel interpretierte die Anzeige dies als neuen
Erholungstag und zeigte erneut 2/2 an. Dasselbe betraf die Beitragsvorschau.

`modules/scene-time/scene-recovery-day.js` enthält jetzt die unverändert
übernommene Serverdefinition. Kampf, Fertigkeitsproben und Rastvorschau
verwenden dieselbe Berechnung. Der Server importiert sie über die erzeugten
Mechanikmodule. Kalenderdatum und bestehende Erholungsschlüssel bleiben
unverändert; es gibt keine Migration oder nachträgliche Kostenbuchung.

Prüfung: Die lokale Kopie des echten Verlaufs ergibt mit dem alten
Anzeigeschlüssel 2/2, mit dem korrigierten Controller 0/2. Ein isolierter
Firestore-Integrationstest prüft den gesamten Dreiteiler, Speicherung,
erneutes Laden, Ablehnung eines weiteren Angriffs einschließlich veralteter
Clientanfrage und Erholung am nächsten Szenentag. Das echte Duell wurde
ausschließlich gelesen. Die Veröffentlichung benötigt keine Änderung an
gespeicherten Kampfbeiträgen oder Charakterwerten.

Separat wurde auf Nutzerwunsch der Morgenanker von **III. Brunnenplatz**
von Uhrentag 1 auf 2 korrigiert. Ausschließlich `sceneTimeEvent.anchorDay`
wurde mit einer Versionsvorbedingung aktualisiert und anschließend erneut
gelesen. Uhrzeit, Kalenderdatum **10. Lichtkehr 1740** und alle übrigen
Dokumentfelder blieben unverändert. Diese Szene ist vom Trainingsplatzduell
getrennt; Sicherung und Prüfkopie liegen lokal unter `.codex-temp`.
