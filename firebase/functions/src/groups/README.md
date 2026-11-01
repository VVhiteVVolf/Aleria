# Kanonischer Gruppenbestand

`commitGroupInventoryOperation(database, auth, input)` bucht zwischen
`group_quest_accounts/{groupId}` und dem tatsächlichen Inventar einer Figur
oder Kreatur. Redaktionelles Gruppenkassenbuch und Bestandsplanung im Modul
werden weder verrechnet noch verändert.

```js
{
  operationId, groupId, action: 'withdraw' | 'deposit',
  member: { kind: 'character' | 'creature', recordId },
  object: { kind: 'item', itemId, quantity }
    // oder { kind: 'money', currency: 'gold'|'silver'|'copper'|'pfennig', quantity }
  expectedGroupRevision, expectedMemberRevision,
  entryId // optional, ein wirklich verknüpfter offener ::session:-Thread
}
```

Eine freie Registerzuteilung verwendet stattdessen
`action: 'grant', product: { template, definitionRef, moduleId, sourceRevision },
quantity, expectedGroupRevision`. Sie ist Spielleitung/Redaktion vorbehalten,
erfindet keinen bezahlten Kauf und benötigt kein Mitglied. Geld wird dabei
nicht frei erzeugt.

Die Antwort enthält `receiptId`, aktuelle `groupInventory`/`memberInventory`,
`groupRevision`/`memberRevision` und gegebenenfalls `commentId`. Bei Grant sind
die beiden Mitgliedsfelder `null`. Die Gruppenrevision ist die oberste
`revision` des Kontodokuments, die Mitgliedsrevision dessen `inventory.revision`.
Ein unveränderter wiederholter Auftrag liefert den aktuellen Bestand und
bucht nicht erneut. Veränderte Eingaben dürfen dieselbe Vorgangs-ID nicht
wiederverwenden.

- Entnahme: Admin, Moderator, Editor oder ausdrücklich serverseitig im
  geschützten Konto gespeicherte `managerUids`.
- Einzahlung: Besitzer des gebenden Figur-/Kreaturdatensatzes oder Spielleitung.
- Mitgliedschaft: aktuelle echte Hierarchie oder Gäste der Gruppen-Landingpage.
  Der Server liest dieselbe reine, versionierte `upgradeEntry`-Contentprojektion
  wie der Browser. Neue freigegebene Gäste oder Hierarchieseiten gelten deshalb
  bereits vor dem nächsten Speichern, ohne das gespeicherte Modul umzuschreiben.
  Gespeicherte Contentversionen und spätere Nutzeränderungen bleiben maßgeblich;
  fremde Module sowie versteckte, archivierte oder Vorlagenmodule erhalten
  dadurch keine erweiterten Rechte.
  Ein automatisch mitgeführtes Tier benötigt den genau passenden
  Figureninventar-/Kreatur-/Instanzverweis seines nachweislich zugehörigen
  Besitzers. Bloße Namensgleichheit eines Tiers reicht nicht.
- Alte namensgebundene Hierarchien werden gegen höchstens 1.000 aktuelle
  Figuren geprüft; mehrdeutige Namen geben keine Mitgliedschaft. Explizite
  gespeicherte Figuren-IDs umgehen diesen Katalogscan.
- Kampfgebundene Mitglieder, Besitzer automatisch zugeordneter Tiere und
  übertragene verknüpfte Tiere können während ihrer Bindung nicht umgebucht
  werden. TP und Ressourcen werden nicht erholt oder aus Szenenhistorie ersetzt.
- Geld und gewöhnliche Verbrauchsgüter schreiben das Kampfprofil überhaupt
  nicht; auch seine Revision, Bilder und fehlende optionale Felder bleiben exakt
  erhalten. Bei Waffen und Rüstungen wird nur die an den übertragenen
  Inventareintrag gebundene Ausrüstung registriert oder entfernt. Die übrige
  Ausrüstung wird nicht beiläufig neu abgeglichen. Ein im gespeicherten
  Kampfprofil angelegter Gegenstand muss vor der Übergabe abgelegt werden.
- Definitionen, Mengen, Pfennigrechnung, Ausrüstungsverknüpfung und Unikatbindung
  verwenden die bestehenden gemeinsamen Item-/Übergabefunktionen.
- Ein verknüpftes Tier wandert nur zwischen Figurenbesitz und Gruppenbestand;
  seine vorhandene Kreatur-ID und sein Kampfprofil bleiben erhalten.

Alle Konto-, Mitglieds-, Unikat-, Tier- und Belegänderungen sind atomar. Die
eindeutigen Belege liegen in `group_inventory_transactions`, sind für Browser
schreibgeschützt und Teil des Quest-Backups. Ein optionaler Szenenbeleg
enthält ausschließlich den tatsächlichen Transfer und keine Kampfzustands-
oder Spielzeit-Momentaufnahme. Korrekturen erfolgen als ausdrückliche
Gegenbuchung; ein Löschen des Erzählbelegs ersetzt keine Inventarrücknahme.
Auch eine erzwungene administrative Kampfrücknahme darf einen solchen
Gruppenbeleg nicht löschen. Optionale Belege werden nur in tatsächlich offenen,
verknüpften Szenen erzeugt; ausgeblendete, archivierte oder Vorlagenmodule
begründen keine Spielszenenbuchung.

Die Integrationstests akzeptieren ausschließlich `127.0.0.1:8187` und löschen
nur ihr eigenes `demo-aleria-group-inventory`-Testprojekt. Es gibt keine
produktive Migration oder automatische Veröffentlichung.

Die reale Integrationssuite prüft neben konkurrierenden Übertragungen auch
erfolglose Rücknahmen des tatsächlich erzeugten Belegs, jede Münzart mit dem
Browser-Requestbuilder, kanonische Figuren-/Gruppen-/Akteurskennungen sowie
vollständig abgebrochene Buchungen bei unzulässigen Mengen und Szenen.
