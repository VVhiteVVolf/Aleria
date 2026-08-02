# Kampfbeschreibung und Kampfauswertung

Das Kampfsystem besitzt bewusst keinen Szenenmodus, keine Initiativeverwaltung, keine Runden und keine Zugreihenfolge.

## Ablauf

1. Eine Figur fügt im Kommentar einen Abschnitt vom Typ `combataction` („Kampfbeschreibung“) ein.
2. Im Abschnitt werden Ziel und Wurfart gewählt. Die aktive Waffe und alle Modifikatoren stammen aus dem Kampfprofil der Figur.
3. Beim Eintragen würfelt der gemeinsame Szenenwürfel-Service Angriff und bei einem Treffer Schaden.
4. Treffer, Fehlschlag, kritisches Ergebnis und Schaden werden deterministisch berechnet. AleriaGPT darf diese Fakten nicht verändern.
5. AleriaGPT erhält zusätzlich vollständige Snapshots beider Kampfbögen und formuliert daraus eine kurze immersive Folge.
6. Beschreibung und Auswertung werden als zusammengehörige Daten desselben Kommentars gespeichert. Die Auswertung erscheint unmittelbar nach dem zugehörigen Abschnitt.

## Datenmodell

`character.combatProfile` verwendet Schema 3. Es enthält Fortschritt, Attribute, TP-Regeln, RK-Regeln, Rettungswürfe, Fertigkeiten, Waffen, Rüstungen, Ressourcen, Marotten, Zustände, Fähigkeiten, Magie und Notizen. Daten aus Schema 2 werden beim Laden verlustarm migriert.

Inventargegenstände werden als Vorlage in Waffen- oder Rüstungseinträge kopiert. Die Kampfdaten bleiben danach unabhängig manuell editierbar. Das normale Speichern des Charakterprofils schreibt das gesamte Kampfprofil dauerhaft in das bestehende Firebase-Charakterdokument.

Trefferpunkte und Ressourcen werden bei einer Kampfauswertung nur als Momentaufnahme gelesen und nicht automatisch verändert. Ein Kommentar erzeugt damit keine versteckte, schwer rückgängig zu machende Zustandsänderung an einer anderen Figur.

## Regelgrenze

Strukturierte Modifikatoren werden ausschließlich vom lokalen Regelkern verrechnet. Freitexte helfen AleriaGPT bei Interpretation und Erzählung, dürfen aber keine unbemerkten Zahlenänderungen auslösen. Muss eine Marotte, ein Zustand oder eine Fähigkeit einen Wert verändern, wird die Wirkung zusätzlich strukturiert eingetragen.
