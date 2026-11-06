# Kommentarverbindung

`comments-backend.js` besitzt den lokalen Ersatzspeicher und die Wiederverbindung.
Ein Starttimeout sperrt den später verfügbaren Onlineadapter nicht. Wartende
Bereitschaftslistener und Timer werden nach ihrem Abschluss entfernt.

Offene Lesequellen werden getrennt als `comments`, `turn` und `sidebar` verfolgt;
`backend` bezeichnet andere vorübergehend auf lokale Bereitschaft angewiesene
Aufrufer. Ein erfolgreicher Redestab darf keine noch ausstehende Kommentarladung
quittieren. Die Leseaufrufe übergeben dafür `getCommentBackend({ source })`.

## Ereignisse und Verantwortung

- `aleria:comment-backend-reconnect` auf `document`, `detail.sources`: fordert nur
  die betroffenen Leser zur erneuten Anbindung auf. Mehrere `fb-ready`-/`online`-
  Impulse werden zusammengefasst.
- `aleria:comment-backend-connected`, `detail.source`: bestätigt einen tatsächlich
  erfolgreichen Lesevorgang des Firebase-Adapters. Die Existenz von `window._fb`
  genügt nicht; ein offline verfügbarer Cache hebt die Offlineanzeige nicht auf.
- `comments-thread.js` erneuert ausschließlich den aktuellen sichtbaren,
  gebundenen Thread. Ein gesunder Kommentarlistener wird weiterverwendet; ein
  allein gescheiterter Redestab erneuert nur seine eigene Bindung.
- `sidebar-feed.js` besitzt seinen eigenen Abruf. Veraltete Antworten und Fehler
  dürfen weder DOM noch Verbindungsstatus verändern. Sein Remoteabruf verwendet
  `loadRecentComments(limit, { throwOnError: true })`, damit ein Ladefehler nicht
  als erfolgreicher leerer Bestand erscheint. Andere Aufrufer behalten den
  bisherigen Fehlervertrag.

Temporäre Fehler erhalten höchstens fünf automatische Versuche mit wachsenden
Abständen. Offline wird nicht weiter abgefragt; ein späteres Online-/Ready-Ereignis
kann eine neue Episode starten. Berechtigungs-, Authentifizierungs- und andere
ausdrücklich terminale Fehler erzeugen keinen automatischen Wiederholungssturm.

Bereits geladene Beiträge bleiben während einer Unterbrechung sichtbar. Lokale
`localOnly`-Beiträge und Entwürfe werden weder gelöscht noch automatisch gesendet.
Die Wiederverbindung aktualisiert den Leserbereich, ohne das Kommentarformular
neu aufzubauen. Lade-/Abonnementgenerationen schützen Szenenwechsel, geschlossene
Dialoge und verspätete Rückrufe.

## Prüfungen

Die Regressionen liegen in `AleriaAlmanach/tests/comment-connection-recovery.test.mjs`
und sind in der bestehenden Prüfgruppe `almanach-runtime` eingebunden. Ergänzende
Prüfungen schützen Kommentartransaktionen, Abonnementwiederverwendung, die
Aktivitätsprojektion und den kompakten Synchronisationsstatus. Der lokale
Browserablauf samt synthetischen Daten und Sichtbelegen liegt für diesen Fix unter
`diagnostics/comments-loading-20261105/fix-browser/`.
