import { applyVenuePriceReview } from '../economy-pricing/price-review-model.mjs';
import { withHouseholdWorkplaceLinks } from '../gwynthor-heime/household-workplaces.mjs';
const art = './assets/krumme-kanne/services';
const service = (title, icon, description, scope, terms) => ({ title, icon: `${art}/${icon}.png`, description: `<p>${description}</p>`, clients: '', scope, terms });

export function withKanneServices(source) {
  const entry = withHouseholdWorkplaceLinks(applyVenuePriceReview(structuredClone(source)));
  if (entry.pages.some(page => page.commentThreadKey === 'kanne-services-20261016')) return entry;
  entry.pages.splice(4, 0, { schemaVersion: 1, commentThreadKey: 'kanne-services-20261016',
    pageTitle: '✦ — Services — ✦', guildServicesPage: true, guildServices: {
      title: 'Services · Bett, Bad & eine helfende Hand',
      introduction: '<p>Elidyr weiß, wo noch ein Bett frei ist. Runa richtet die Kammern her, Mair hält längere Aufenthalte im Hausbuch fest. Wer einen geschützten Schlafplatz, einen warmen Zuber oder einen Tisch für die eigene Runde braucht, spricht am Tresen vor.</p>',
      services: [
        service('Ein Bett in der geteilten Kammer', 'zimmer', 'Ein festes Bett mit frischem Leinen und einer Wolldecke. Der Waschkrug wird geteilt; Runa zeigt bei der Ankunft den eigenen Platz.', 'Ein Bett · eine Person · eine Nacht', '2 Kupfertaler je Nacht'),
        service('Eine Kammer für sich', 'zimmer', 'Eine kleine Kammer wird für einen einzelnen Gast freigehalten. Bettzeug, Handtuch und Waschwasser gehören dazu; der Schlüssel bleibt bis zur Abreise beim Gast.', 'Eine Kammer · eine Person · eine Nacht', '3 Kupfertaler je Nacht'),
        service('Die Drei Eichen', 'zimmer', 'Die Dachkammer mit ihren zwei festen Eichenbetten wird gemeinsam vergeben. Frisches Leinen, Wolldecken, Waschkrug und der innen schließende Riegel stehen bereit.', 'Die ganze Kammer · bis zwei Personen · eine Nacht', '3,5 Kupfertaler je Nacht'),
        service('Ein fester Schlafplatz', 'dauer', 'Ein Bett in einer geteilten Kammer bleibt einen Hausmonat lang reserviert. Jeden Morgen gibt es das einfache Hausfrühstück; Waschwasser, Reinigung und regelmäßiger Leinenwechsel gehören dazu.', 'Ein Bett · eine Person · 36 Nächte', '72 Kupfertaler für den Hausmonat · im Voraus'),
        service('Eine eigene Kammer auf Dauer', 'dauer', 'Ein eigener Schlüssel für den längeren Aufenthalt in Gwynthor. Die Einzelkammer bleibt 36 Nächte frei; einfaches Frühstück, Reinigung und regelmäßiger Wäschewechsel sind eingeschlossen.', 'Eine Kammer · eine Person · 36 Nächte', '100 Kupfertaler für den Hausmonat · im Voraus'),
        service('Die Drei Eichen für einen Hausmonat', 'dauer', 'Beide Eichenbetten werden für dieselbe kleine Reisegemeinschaft reserviert. Einfaches Frühstück für zwei, Waschwasser, Reinigung und frisches Leinen sind im Monatsbetrag enthalten.', 'Die ganze Kammer · bis zwei Personen · 36 Nächte', '130 Kupfertaler für den Hausmonat · im Voraus'),
        service('Das Hinterzimmer für die eigene Runde', 'hinterzimmer', 'Der runde Tisch im Hinterzimmer wird für ein ruhiges Gespräch, ein kleines Würfelspiel oder die Besprechung einer Reise freigehalten. Elidyr sorgt dafür, dass die bestellten Krüge ihren Weg hineinfinden.', 'Ein Hinterzimmer · bis drei Gäste · je Stunde', '2 Kupfertaler je Stunde · Speis und Trunk gesondert'),
        service('Ein warmer Zuber', 'bad', 'Warmes Wasser, ein sauberes Tuch und ein wenig einfache Seife helfen gegen Hafenstaub und Reisemüdigkeit. Der Zuber wird für den vereinbarten Zeitpunkt vorbereitet.', 'Ein Bad · eine Person · nach Termin', '1 Kupfertaler je Bad'),
        service('Eine kleine Wäsche', 'waesche', 'Ein kleines Bündel aus Hemd, Unterzeug und Strümpfen wird gewaschen und zum Trocknen aufgehängt. Runa nennt bei der Abgabe, wann die Sachen wieder bereitliegen.', 'Ein kleines Wäschebündel · gewöhnlich ein bis zwei Tage', '50 Pfennig je Bündel · Ausbesserungen nach Aufwand'),
        service('Gepäck unter Verschluss', 'gepaeck', 'Eine gewöhnliche Reisetasche oder kleine Truhe wird während eines Landgangs im verschlossenen Hausvorrat verwahrt. Mair vermerkt die Abgabe, bevor der Gast ohne schweres Gepäck weiterzieht.', 'Ein Gepäckstück · ein Tag · nach verfügbarem Platz', '25 Pfennig je Tag und Gepäckstück'),
        service('Ein Botengang im Hafenviertel', 'gepaeck', 'Ein Hausbursche trägt einen kurzen Brief oder eine kleine Nachricht zu einer bekannten Adresse im Hafenviertel. Abholung und Antwort werden vor dem Aufbruch abgesprochen.', 'Ein örtlicher Hin- und Rückweg · nach Dienstverfügbarkeit', '50 Pfennig je Botengang · fremde Gebühren gesondert')
      ],
      process: '<p>Am Tresen werden freie Betten, Dauer und besondere Wünsche geklärt. Mair bestätigt Monatsaufenthalte und nimmt den vereinbarten Betrag entgegen. Verlängerungen werden vor Ablauf abgesprochen; Runa braucht Zeit, um ein Zimmer wieder herzurichten.</p>',
      conditions: '<p>Der Hausmonat umfasst 36 Nächte. Das enthaltene Frühstück entspricht dem einfachen Hausfrühstück der Speisekarte; weitere Mahlzeiten und Getränke werden einzeln bestellt. Die festen Plätze hängen vom freien Zimmerbestand ab. Wertsachen und besondere Lasten werden vor der Annahme mit Mair besprochen.</p>',
      footer: 'Die Krumme Kanne · östliches Hafenviertel, Gwynthor · Ein ruhiger Schlaf gehört zu einer guten Reise.'
    } });
  return entry;
}

export const KANNE_SERVICE_ICONS = [
  ['zimmer', 'ONE plain sturdy medieval iron room key attached to a small oak tag shaped like a simple bed, a muted blue cord.'],
  ['dauer', 'ONE worn but well-kept brown leather travel satchel with a rolled muted-blue wool blanket tied securely across its top.'],
  ['hinterzimmer', 'ONE small round rustic oak tavern table with one empty wooden tankard standing on it. Whole compact table, no floor.'],
  ['bad', 'ONE small round wooden bathing tub with iron hoops, clear warm water and a plain folded linen towel draped over its rim.'],
  ['waesche', 'ONE neat compact folded stack of an off-white linen shirt and plain brown wool stockings, tied with a simple blue cloth strip. No body.'],
  ['gepaeck', 'ONE small plain oak travelers chest with iron corners, a closed latch and a simple sealed cream letter resting on the lid.']
].map(([id, visual]) => ({ id, visual }));
