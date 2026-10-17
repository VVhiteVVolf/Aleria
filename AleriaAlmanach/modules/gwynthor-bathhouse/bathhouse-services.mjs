import { BATHHOUSE_ART } from './bathhouse-people.mjs';

const service = (title, scene, description, scope, terms) => ({ title,
  icon: `${BATHHOUSE_ART}/scenes/${scene}.png`, description: `<p>${description}</p>`, clients: '', scope, terms });

export function buildBathhouseServices() {
  return { schemaVersion: 1, commentThreadKey: 'fontani-dienste', pageTitle: 'Bäder und Dienste',
    guildServicesPage: true, image: `${BATHHOUSE_ART}/scenes/wannenstube.png`, imageWidth: 30, imageTall: true,
    guildServices: {
      title: 'Wasser, Wärme und ein frisches Tuch',
      introduction: '<p>Ein kurzer Waschgang nach dem Arbeitstag oder eine ruhige Stunde im eigenen Zuber: Livia vergibt die Plätze am Empfang. Die Badehalle bietet vier bis sechs Gästen zugleich Raum; zwei kleine Wannenstuben stehen für vereinbarte Einzelbesuche bereit.</p>',
      services: [
        service('Waschgang', 'empfang', 'Warmes und kühles Wasser am Waschplatz, einfache Seife und ein sauberes Tuch. Ohne Eintritt ins warme Becken.', 'Eine Person · ein Waschgang', '2 Kupfertaler'),
        service('Hausbad', 'badehalle', 'Waschplatz, warmes Gemeinschaftsbecken und Schwitznische; Seife und ein sauberes Tuch sind enthalten.', 'Eine Person · bis zu einer Stunde', '4 Kupfertaler'),
        service('Private Wannenstube', 'wannenstube', 'Eine der beiden Stuben allein nutzen, mit frisch bereitetem Badewasser, Seife und sauberem Leinen.', 'Eine Person · eine Stunde · nach Vereinbarung', '8 Kupfertaler'),
        service('Abreibung mit Öl', 'wannenstube', 'Eine kurze kräftige Abreibung mit einfachem wohlriechendem Öl durch einen Bader. Zum Waschgang oder Bad hinzubuchbar.', 'Eine Person · etwa eine Viertelstunde', '4 Kupfertaler zusätzlich'),
        service('Kräuterbad in eigener Stube', 'wannenstube', 'Das private Wannenbad mit mildem Kräuterzusatz und einem frischen Tuch. Die Stube und das Badewasser sind bereits im Preis enthalten.', 'Eine Person · eine Stunde · nach Vereinbarung', '11 Kupfertaler insgesamt'),
        service('Zusätzliches frisches Tuch', 'empfang', 'Ein weiteres sauberes Leinentuch für den laufenden Besuch; Rückgabe beim Verlassen des Hauses.', 'Ein Tuch · leihweise', '1 Kupfertaler')
      ],
      process: '<p>Am Empfang den Besuch vereinbaren, ein Tuch entgegennehmen und in einer abgetrennten Umkleide die Kleider ablegen. Vor dem Beckenbad wird der Waschplatz benutzt. Private Wannenstunden werden vorab reserviert.</p>',
      conditions: '<p>Das Haus öffnet tagsüber; der letzte Einlass richtet sich nach der verbleibenden Heizzeit. Sauberkeit und Rücksicht gehören zum Bad. Wannenwasser wird nach jedem Gast gewechselt; das Gemeinschaftsbecken wird täglich geleert, gereinigt und frisch gefüllt. Zusätzliche Reinigung erfolgt bei Bedarf.</p>',
      footer: 'Badehaus der Fontani · Aqua et Quies · Wasser und Ruhe'
    }
  };
}
