# Rasten in interaktiven Szenen

Das Feature liegt gekapselt unter `modules/scene-rest/`. `scene-rest-model.js` ist die gemeinsame Regelquelle für Oberfläche, Szenenwiedergabe und Firebase-Transaktion. `scene-rest-ui.js` rendert Dialog und Ereignisblock; `scene-rest-controller.js` ermittelt Szenenfiguren, Zeitfortschritt und Speichervorgang.

## Auswahl

Beim Öffnen werden alle Figuren vorausgewählt, die im aktuellen Thread bereits als Sprecher eines Beitrags oder Abschnitts vorkamen. Andere verfügbare Charaktere und Kreaturenvorlagen bleiben über die Suche ergänzbar. Kreatureninstanzen verwenden ihre `sceneActorId` und werden deshalb unabhängig voneinander geheilt.

## Erholung

Kurze und lange Rasten setzen aktuelle Trefferpunkte auf das Maximum. Temporäre Trefferpunkte bleiben erhalten.

- Kommentarressourcen werden bei jeder Rast gefüllt.
- `short-rest` wird bei kurzer und langer Rast gefüllt.
- `long-rest`, `day` und `scene` werden nur bei langer Rast gefüllt.
- `manual` und `none` bleiben unverändert.
- Nutzungszähler besonderer Fähigkeiten folgen denselben Erholungskennzeichen und werden in derselben Profiltransaktion gespeichert.

Die Standarddauer beträgt eine Stunde beziehungsweise acht Stunden. Der Dialog erlaubt eine abweichende Dauer. Das Ende wird als normales `sceneTimeEvent` gespeichert und verwendet dadurch dieselbe Szenenuhr, Tagesgrenze und Aleria-Datumslogik wie ein Zeitsprung.

## Speicherung

`sceneRest` speichert Vorher-/Nachher-Snapshots pro Akteur. `deriveCombatStateFromComments()` spielt diese Snapshots an ihrer historischen Position wieder ein. Online gespeicherte Charakter- und Kreaturenprofile werden zusammen mit dem Rasteintrag durch `addSceneRest()` in einer Firestore-Transaktion aktualisiert. Ein lokaler Fallback ist für Online-Profile absichtlich gesperrt, damit Kommentarzustand und Profil nicht unbemerkt auseinanderlaufen.
