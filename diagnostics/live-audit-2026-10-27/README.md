# Tatsächlicher Online-Abgleich seit dem letzten grünen Git-Build

Ausgangspunkt: `628de5dbc75e24554c8e2282ffa43486d76fd906`.
Aktiver geprüfter Webstand: `a8622e93eec4bbafc766381b2846b35901ca2332`.
Direktdeploy: `6ae0fc59f61edd9f87793fa7`, Status `ready`.

Alle 530 seit dem Ausgangsstand hinzugekommenen oder geänderten öffentlichen
Dateien wurden über die normale Produktionsdomain tatsächlich per HTTP geladen.
529 stimmen bytegenau mit dem vorbereiteten Release überein. Bei der Galerie-
Startseite schreibt Netlify nur den Breadcrumb-Link `../../index.html` zu `/`
um; nach genau dieser Ersetzung sind die übrigen Bytes ebenfalls identisch.
Keine fehlende oder veraltete öffentliche Datei gefunden. Die absichtlich
ausgesparten Arbeitsquellen sind im [HTTP-Protokoll](http-audit.json) aufgelistet.

Zusätzlich mit Chrome auf der Produktionsdomain sichtbar geprüft:

- Iathneach: neun Clans, acht Orte, neue Regionalbanner und geladenes Hausfenster
  der Ui Nic Cétchathach mit neuer Kriegerfigur und Wappen.
- Uathneach: die kanonisch verlinkte Hausseite `kleinehaeuser.html?haus=haus-laga`
  zeigt die gelieferte Originalfigur und den Abschnitt „Krieger des Clans“.
- Llysfaen: neues gemeinsames Tafelbild und die Plakatgruppen geladen.
- Letzte Änderung `3496a78fa`: Ankündigung „AN ALLE BÜRGER LLYSFAENS“ besitzt
  tatsächlich `max-width: none` und `max-height: 720px` am Textbereich.

Im geprüften Chrome-Profil meldet Llysfaen einen lokalen Entwurf. Ein solcher
gespeicherter Inhalts-/Layoutstand kann die Startdaten überlagern. Er wurde
nicht zurückgesetzt oder veröffentlicht. Eine Ursache für jeden vom Nutzer
beobachteten Unterschied lässt sich daraus nicht pauschal ableiten.

- [Browserbelege](browser-checks.json)
- [Iathneachs neues Hausfenster, live](iathneach-live.png)
- [Breiter Ankündigungstext, live](announcement-live.png)
- [Galerie: Git-HTML](gallery-committed.html) und [Netlify-HTML](gallery-remote.html)

Die Netlify-Ansicht „Builds“ zeigt die fehlgeschlagenen/abgebrochenen Git-Builds.
Die erfolgreiche direkte Veröffentlichung besitzt keine Build-ID und ist ein
separater Deploy. Es wurden bei dieser Prüfung keine Quelländerungen, lokalen
Entwurfsrücksetzungen oder weiteren Veröffentlichungen vorgenommen.
