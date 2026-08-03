# Kampfbeschreibung und Kampfauswertung

Das Kampfsystem besitzt bewusst keinen Szenenmodus, keine Initiativeverwaltung, keine Runden und keine Zugreihenfolge.

## Ablauf

1. Eine Figur wählt pro Abschnitt `Normal`, `Fertigkeitsversuch`, `Kampf` oder `Zauber wirken`. Kampf erlaubt ausschließlich `combataction`; Zaubern ausschließlich `spell`, `prayer` oder `song`.
2. Im Abschnitt werden Ziel, Angriff beziehungsweise Zauber und Zahlungsweg gewählt. Kosten werden direkt über die Ressourcen-Icons reserviert.
3. Beim Eintragen würfelt der gemeinsame Szenenwürfel-Service Waffen- oder Zauberangriff beziehungsweise den Rettungswurf des Ziels und danach gegebenenfalls Schaden.
4. Treffer, Fehlschlag, kritisches Ergebnis und Schaden werden deterministisch berechnet. AleriaGPT darf diese Fakten nicht verändern.
5. AleriaGPT erhält zusätzlich vollständige Snapshots beider Kampfbögen und formuliert daraus eine kurze immersive Folge.
6. Beschreibung und Auswertung werden als zusammengehörige Daten desselben Kommentars gespeichert. Die Auswertung erscheint unmittelbar nach dem zugehörigen Abschnitt.

## Datenmodell

`character.combatProfile` verwendet Schema 4. Es enthält zusätzlich Waffenarten, Techniken und Formen, Aura/Präsenz/Domäne, detaillierte Aktivierungs- und Kostenregeln sowie kommentargebundene Aktionsressourcen. Ältere Daten werden beim Laden verlustarm migriert.

Inventargegenstände werden als Vorlage in Waffen- oder Rüstungseinträge kopiert. Die Kampfdaten bleiben danach unabhängig manuell editierbar. Das normale Speichern des Charakterprofils schreibt das gesamte Kampfprofil dauerhaft in das bestehende Firebase-Charakterdokument.

Jeder mechanische Abschnitt speichert TP- und Ressourcenstände vor und nach seiner Auswertung. Beim Online-Eintragen werden Ziel-TP sowie dauerhafte Akteursressourcen atomar mit dem Kommentar aktualisiert. Aktion, Bonusaktion und Reaktion werden innerhalb des vollständigen Kommentars fortgeschrieben und beim nächsten Gesamtkommentar aufgefüllt. Besondere Aktion ist mit zwei Einsätzen pro Aleria-Tag dauerhaft; Mana/Fokus, Aura-Fokus sowie Celestiale und Infernale Punkte erholen sich ebenfalls erst am nächsten Aleria-Tag.

Verdeckte Täuschungen speichern keinen öffentlichen Hinweis und keinen separaten Wahrheitstext. Der sichtbare Text bleibt unverändert, die technische Schauspiel-Blase wird zunächst als Rede dargestellt. Nur eine erfolgreiche Fertigkeitsauswertung gegen einen der höchstens drei jüngsten Beiträge der Zielperson entlarvt ihre Darstellung.

Die historischen Snapshots werden niemals aus dem späteren Endstand der Figur rückwärts ersetzt. Dadurch zeigt ein früher Abschnitt weiterhin die damals gültigen vollen TP, auch wenn dieselbe Figur am Ende der Szene besiegt wurde.

## Regelgrenze

Strukturierte Modifikatoren werden ausschließlich vom lokalen Regelkern verrechnet. Freitexte helfen AleriaGPT bei Interpretation und Erzählung, dürfen aber keine unbemerkten Zahlenänderungen auslösen. Muss eine Marotte, ein Zustand oder eine Fähigkeit einen Wert verändern, wird die Wirkung zusätzlich strukturiert eingetragen.
