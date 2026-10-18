import { MUSCHI_ART } from './muschi-people.mjs';
const service = (title, scene, description, scope, terms) => ({ title, icon: `${MUSCHI_ART}/scenes/${scene}.png`, description: `<p>${description}</p>`, clients: '', scope, terms });
export function buildMuschiServices() {
  return { schemaVersion: 1, commentThreadKey: 'muschi-dienste', pageTitle: 'Ein Abend im Haus', guildServicesPage: true,
    image: `${MUSCHI_ART}/scenes/salon.png`, imageWidth: 30, imageTall: true,
    guildServices: { title: 'Unterhaltung, Gesellschaft und ein eigener Schlüssel',
      introduction: '<p>Der gewöhnliche Salonabend hat keinen gesonderten Eintritt. Getränke werden einzeln bestellt. Mariette vergibt Auftritte und Gesellschaft; Colette hält Zimmer, Zeiten und Rechnungen fest. Die Bühne, der Spieltisch und ein langer Abend am eigenen Tisch stehen im Mittelpunkt.</p>',
      services: [
        service('Gesellschaft am Tisch', 'salon', 'Eine Gesellschafterin widmet sich der Runde mit Gespräch, Spiel und Begleitung durch den Salonabend.', 'Eine Dame · eine Stunde', '15 Kupfertaler · Getränke gesondert'),
        service('Begleitung durch den Abend', 'salon', 'Eine Dame hält bis zu vier zusammenhängende Stunden für den Gast frei. Tischgesellschaft, Musik und die vereinbarten Wege im Haus gehören zu ihrer Zeit.', 'Eine Dame · bis vier Stunden', '50 Kupfertaler · Zimmer und Getränke gesondert'),
        service('Ein Tanz für den eigenen Tisch', 'salon', 'Aelwen oder Morwen gestaltet eine kurze eigene Darbietung für den Tisch oder eine kleine Runde.', 'Eine Tänzerin · etwa eine Viertelstunde', '12 Kupfertaler'),
        service('Tanzfolge zu zweit', 'salon', 'Beide Tänzerinnen gestalten eine gemeinsame Folge vor der kleinen Bühne oder für eine geschlossene Runde.', 'Zwei Tänzerinnen · etwa eine halbe Stunde', '30 Kupfertaler · besondere Musikbegleitung gesondert'),
        service('Wunschlied', 'salon', 'Ein verfügbares Mitglied der Abendmusik widmet der Runde ein bekanntes Lied oder Instrumentalstück.', 'Ein Stück · nach verfügbarem Musiker', '3 Kupfertaler'),
        service('Musik für eine eigene Runde', 'hinterzimmer', 'Ein Musiker begleitet eine kleine geschlossene Gesellschaft. Mariette bestätigt den Termin erst, wenn der Auftritt besetzt ist.', 'Ein Musiker · eine Stunde', '20 Kupfertaler'),
        service('Spielrunde', 'spielstube', 'Karten oder Würfel am freien Tisch. Einsätze und Hausanteil werden vor Beginn offen vereinbart; die Spielaufsicht bestätigt die Regeln.', 'Eine Runde · nach freiem Tisch', '1 Kupfertaler Tischgeld je Stunde · Einsätze gesondert, kein zusätzlicher verdeckter Hausanteil'),
        service('Privates Hinterzimmer', 'hinterzimmer', 'Der kleine Salon steht der eigenen Runde mit vorbereiteten Sitzplätzen und Getränkezugang zur Verfügung.', 'Bis sechs Gäste · je Stunde', '8 Kupfertaler · Getränke und Darbietungen gesondert'),
        service('Eine Stunde zu zweit', 'hinterzimmer', 'Ungestörte intime Gesellschaft mit der gewünschten Dame. Die persönlichen Wünsche und Grenzen werden mit ihr selbst besprochen; Mariette stimmt nur den Termin ab.', 'Eine Dame · eine Stunde', '45 Kupfertaler · ein freies Hinterzimmer für diese Stunde enthalten'),
        service('Kammer für die Nacht', 'gaestezimmer', 'Eine von sechs Kammern mit sauberem Leinen, Waschkrug, Truhe und eigenem Schlüssel. Die Musik aus dem Salon kann bis spät zu hören sein.', 'Ein Zimmer · bis zwei Personen · eine Nacht', '10 Kupfertaler · ohne Verpflegung'),
        service('Ein ganzer Hausmonat', 'gaestezimmer', 'Eine Kammer bleibt mit Reinigung, frischem Waschwasser und regelmäßigem Wäschewechsel für den Gast reserviert.', 'Ein Zimmer · bis zwei Personen · 36 Nächte', '300 Kupfertaler im Voraus · ohne Verpflegung')
      ],
      process: '<p>Am Empfang nach freier Gesellschaft, Darbietung oder Zimmer fragen. Zeit, Preis und bestellte Getränke werden getrennt festgehalten. Spielteilnehmer vereinbaren ihre Einsätze, bevor Karten oder Würfel fallen.</p>',
      conditions: '<p>Das Haus schenkt aus, kocht aber nicht. Für eine Mahlzeit empfiehlt Helviane die Lachende Nixe. Musik und besondere Darbietungen bestätigt Mariette nach den verfügbaren Auftritten. Kammer und Gesellschaft werden getrennt vereinbart. Daric und die Hausgarde halten Streit vom Abend fern.</p>',
      footer: 'Die Gestiefelte Muschi · Unterhaltung im Salon, eigene Absprachen hinter den Vorhängen' } };
}
