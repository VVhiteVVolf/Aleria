window.BLACKMARKET_DATA = {
  currency: {
    copperIcon: 'https://i.imgur.com/rp3IIJu.png',
    silverIcon: 'https://i.imgur.com/hgYhPCT.png',
    goldIcon: 'https://i.imgur.com/nypnWlN.png',
    silverToCopper: 100,
    goldToCopper: 1000
  },
  profileLabels: ['Gefahr', 'Verbot', 'Magie', 'Nutzen', 'Seltenheit', 'Risiko'],
  items: [
    {
      id: 'kriss',
      name: 'Kriss (Phiole)',
      category: 'Drogen',
      rarity: 'Hoch',
      weight: '- ',
      magical: 'Ja',
      requirement: 'Keine',
      material: 'Flüssigkeit',
      unit: 'Phiole',
      price: { min: 2, max: 2, unit: 'S' },
      image: 'https://i.imgur.com/SkBohvy.png',
      tags: ['Traumkorn', 'Diebesgilde', 'Sucht'],
      desc: 'Kriss ist ein sirupartiges Rauschmittel aus Traumkorn. Es schärft Wahrnehmung und Reflexe, ist stark süchtig und nur illegal erhältlich.',
      detailDesc: `Kriss ist ein sirupartiges Rauschmittel, das aus der destillierten Essenz der Traumähre gewonnen wird. Es schärft Wahrnehmung und Reflexe innerhalb weniger Sekunden und hinterlässt einen Nachklang aus Hungergefühl und unstillbarer Sehnsucht.

Die Phiole wird in den verborgensten Stallungen der Diebesgilden gehandelt. Jedes Geschäft endet mit einem Schattenpaket und einer Warnung: zu viel Kriss ruiniert Körper und Seele, doch in einer Nacht voller Gefahr ist es für viele die einzige Chance.`,
      stats: [8, 9, 8, 6, 7, 9]
    },
    {
      id: 'smaragdflux',
      name: 'Smaragdflux (Phiole)',
      category: 'Drogen',
      rarity: 'Extrem',
      weight: '- ',
      magical: 'Ja',
      requirement: 'Keine',
      material: 'Gas in Phiole',
      unit: 'Phiole',
      price: { min: 1, max: 1, unit: 'G' },
      image: 'https://i.imgur.com/fiLImKB.png',
      tags: ['Magier', 'Rausch', 'Mana'],
      desc: 'Flux ist ein flüssiges Gas, das Magicka explosionsartig freisetzt. Es steigert die magische Kraft, schädigt aber Körper und Geist.',
      detailDesc: `Smaragdflux ist ein verdichtetes Arkanpulver in flüssiger Form, das in einer Phiole eingeschlossen ist. Ein einziger Zug sprengt die Grenzen der eigenen Magicka; der Körper explodiert innerlich, während Gedanken in eine pure Energieflut zerspringen.

Alchemisten und Hexenmeister zahlen hohe Summen für den gleißenden Impuls, doch die Nebenwirkungen sind brutal. Nach dem Rausch bleibt nur ein schwacher Leib, nervöse Schwindelanfälle und die Gewissheit, dass jeder weitere Schluck die Seele tiefer versklavt.`,
      stats: [10, 10, 10, 5, 9, 10]
    },
    {
      id: 'blutstaub',
      name: 'Blutstaub (Schale)',
      category: 'Drogen',
      rarity: 'Mittel',
      weight: '- ',
      magical: 'Keine',
      requirement: 'Keine',
      material: 'Staub',
      unit: 'Schale',
      price: { min: 20, max: 20, unit: 'K' },
      image: 'https://i.imgur.com/UrqCgVc.png',
      tags: ['Wachheit', 'Adrenalin', 'Abhängigkeit'],
      desc: 'Blutstaub ist eine billige Droge, die wach macht und die Konzentration steigert. Langfristig zerstört sie Organe und Seele.',
      detailDesc: `Blutstaub ist eine grobkörnige Mischung aus getrocknetem Tierblut, Gewürzen und geheimen Kräutern. Er flutet das Blut mit rotem Adrenalin und jagt den Konsumenten in eine nervöse, kompromisslos aufmerksame Raserei.

Im Schwarzmarkt gilt er als die billigste Droge für Wachsamkeit: stille Wachen, nervöse Diebe und Häscher schwören darauf. Doch schon nach wenigen Tagen zerstört er Leber, Herz und den letzten Rest von Empathie.`,
      stats: [6, 7, 2, 5, 6, 8]
    },
    {
      id: 'traumkorn',
      name: 'Traumkorn (Beutel)',
      category: 'Rohmaterial',
      rarity: 'Reguliert',
      weight: '- ',
      magical: 'Ja',
      requirement: 'Keine',
      material: 'Kristall',
      unit: 'Beutel',
      price: { min: 50, max: 50, unit: 'K' },
      image: 'https://i.imgur.com/6w86wTy.png',
      tags: ['Rohform', 'Kriss', 'Magicka'],
      desc: 'Traumkorn ist die rohe Kristallform von Kriss. Es ist legal, aber streng reguliert und liefert Rohmagie für gefährliche Mixturen.',
      detailDesc: `Traumkorn ist die rohe Kristallform der Droge Kriss und wird aus den tiefvioletten Traumblüten des Moorlands gewonnen. Es strahlt eine kalte Arkanwärme aus, die Alchemisten und Magier gleichermaßen in ekstatische Trance versetzt.

Das Harz ist legal, aber so stark reglementiert, dass es nur mit Sondergenehmigung in Heilprozessen oder für kultische Rituale verwendet werden darf. Unter ehrlichen Händen dient es als Basis für gefährliche Mixturen, unter dunklen jedoch als Ausgangsstoff für den berüchtigten Kriss.`,
      stats: [7, 8, 8, 6, 8, 8]
    },
    {
      id: 'amoniten-grimoire',
      name: 'Amoniten Grimoire',
      category: 'Artefakte',
      rarity: 'Sehr hoch',
      weight: '- ',
      magical: 'Ja',
      requirement: 'Expertenwissen',
      material: 'Buch',
      unit: 'Buch',
      price: { min: 1, max: 1, unit: 'G' },
      image: 'https://i.imgur.com/IpnbrYz.png',
      tags: ['Nekromantie', 'Seele', 'Verboten'],
      desc: 'Das Amoniten Grimoire enthält gefangene Seelen. Es ist wertvoll, gefährlich und liefert Verbotenes für Nekromanten und Kultisten.',
      detailDesc: `Das Amoniten Grimoire ist ein schwarzes Buch, dessen Seiten aus versiegelten Seelenhäuten gefertigt sind. Es enthält rituelle Beschwörungen und verbotene Rituale, die tief in den Gefilden der Nekromantie wurzeln.

Jeder Eintrag verlangt Opfer und Verzicht. Kultisten brechen die letzte Grenze, indem sie darin gefangene Seelen ausbeuten, um Dämonen zu binden oder um die Toten zur Strecke zu zwingen. Das Buch ist begehrt, doch der Preis dafür ist nicht nur Gold, sondern auch das eigene Gewissen.`,
      stats: [9, 10, 7, 7, 10, 10]
    },
    {
      id: 'ahnenbaumsaft',
      name: 'Phiole mit Ahnenbaumsaft',
      category: 'Seltenes',
      rarity: 'Legendär',
      weight: '- ',
      magical: 'Ja',
      requirement: 'Ritualkenntnis',
      material: 'Saft',
      unit: 'Phiole',
      price: { min: 400, max: 400, unit: 'G' },
      image: 'https://i.imgur.com/YCW67jn.png',
      tags: ['Ritual', 'Dimension', 'Kult'],
      desc: 'Dieser Saft stammt aus einem Ahnenbaum und dient für starke Rituale, Dimensionsrisse und verbotene Beschwörungen. Er ist extrem selten.',
      detailDesc: `Die Phiole mit Ahnenbaumsaft enthält einen zähflüssigen Saft, der nur aus den uralten Wurzeln eines Ahnenbaums gewonnen wird. Er pulsiert dunkel und kalt und dient als Kernzutat für Rituale, die das Gewebe der Realität durchlöchern.

    Nur wenige Priester und Hexenmeister wissen, wie man ihn behandeln darf. Ein einziger Tropfen kann eine Zwischenwelt öffnen, doch jedes Öffnen ruft Augen in den Schatten und bindet den Zaubernden stärker an die Dämonen, die hinter dem Riss lauern.`,
      stats: [10, 10, 9, 10, 10, 10]
    },
    {
      id: 'schwarzer-seelenstein',
      name: 'Schwarzer Seelenstein',
      category: 'Artefakte',
      rarity: 'Extrem',
      weight: '- ',
      magical: 'Ja',
      requirement: 'Expertenwissen',
      material: 'Stein',
      unit: 'Stück',
      price: { min: 5, max: 5, unit: 'G' },
      image: 'https://i.imgur.com/jJovOCm.png',
      tags: ['Seelenbindend', 'Dämonisch', 'Verboten'],
      desc: 'Der Schwarze Seelenstein bindet eine Menschenseele und verleiht mächtige alchimistische oder magische Effekte. Er gilt als eines der gefährlichsten Artefakte.',
      detailDesc: `Der Schwarze Seelenstein ist ein tiefschwarzes, heiß glühendes Fragment, das die Essenz einer gebundenen Seele in sich trägt. Er befeuert Rituale mit gezwungenen Lebenskraftströmen und kann sowohl Macht als auch Verderbnis verstärken.

    Manche Alchemisten nutzen ihn in kleinen Dosen, um Tränken unerschütterliche Stabilität zu verleihen. In dunkleren Kreisen wird er hingegen als Katalysator für Blutopfer oder als Kern eines rituellen Zepters eingesetzt.`,
      stats: [10, 10, 9, 8, 10, 10]
    },
    {
      id: 'infernale-zauberrolle',
      name: 'Infernale Zauberrolle',
      category: 'Schriftstücke',
      rarity: 'Hoch',
      weight: '- ',
      magical: 'Ja',
      requirement: 'Zauberwirker',
      material: 'Papier',
      unit: 'Rolle',
      price: { min: 10, max: 10, unit: 'G' },
      image: 'https://i.imgur.com/7vhwGWP.png',
      tags: ['Infern', 'Katalysator', 'Gefahr'],
      desc: 'Diese Schriftrolle enthält einen infernalen Zauber. Ohne Opfer oder Konzentrationsfokus ist der Einsatz extrem riskant.',
      detailDesc: `Die infernale Zauberrolle ist aus schwarzem Pergament gefertigt und mit runenhaften, blutroten Zeichen beschriftet. Ihr Zauber entfaltet sich nur in der richtigen Umgebung: ohne Opfer, Fokus und einen schützenden Kreis kann er den Leser selbst verschlingen.

    Sie wird von Kultisten gehütet und bricht oft die letzte Grenze zwischen Magie und Wahnsinn. Wer ihre Worte vorliest, riskiert nicht nur seine Seele, sondern auch die Entfesselung eines Feuers, das alles in Brand setzen kann.`,
      stats: [10, 10, 10, 8, 9, 10]
    },
    {
      id: 'opferdolch',
      name: 'Infernaler Opferdolch',
      category: 'Waffen',
      rarity: 'Hoch',
      weight: '- ',
      magical: 'Keine',
      requirement: 'Keine',
      material: 'Infernales Erz',
      unit: 'Stück',
      price: { min: 8, max: 8, unit: 'G' },
      image: 'https://i.imgur.com/p7REr4d.png',
      tags: ['Opfer', 'Ritual', 'Korruption'],
      desc: 'Der Dolch ist für dunkle Rituale geschaffen. Seine Wunden sind korrupt und machen Opfer anfälliger für Magie und Flüche.',
      detailDesc: `Der infernale Opferdolch ist aus dunklem Metall geschmiedet und mit blutroten Runen versehen. Er wurde einst für Rituale entworfen, bei denen das Opfer an einen Dämon oder eine verderbte Gottheit gebunden wird.

    Seine Klinge infiziert jede Wunde mit Korruption, macht den Verletzten empfänglich für Magie und bricht die natürliche Heilung. In geheimen Kulten gilt er als Werkzeug der Macht – und als Zeichen dafür, dass der Täter bereit ist, Grenzen zu überschreiten.`,
      stats: [9, 10, 3, 7, 8, 9]
    },
    {
      id: 'daemmersphaere',
      name: 'Dämmersphäre',
      category: 'Artefakte',
      rarity: 'Mythisch',
      weight: '- ',
      magical: 'Ja',
      requirement: 'Hohe Priesterschaft',
      material: 'Sphäre',
      unit: 'Stück',
      price: { min: 100000, max: 100000, unit: 'G' },
      image: 'https://i.imgur.com/vUGHQAo.png',
      tags: ['Spionage', 'Dimensionsblick', 'Verlockung'],
      desc: 'Die Dämmersphäre erlaubt Einblicke in ferne Orte und Dimensionen. Ihr Einsatz zieht Aufmerksamkeit und gefährliche Mächte an.',
      detailDesc: `Die Dämmersphäre ist eine pulsierende Kugel aus obsidianem Glas, die in ihren Tiefen Landschaften jenseits des Horizonts spiegelt. Sie gewährt dem Betrachter flüchtige Blicke in ferne Orte, fremde Zeiten und die Schattenseiten der eigenen Zukunft.

    Jeder Blick kostet Aufmerksamkeit: Mächte, die im Dunkeln lauern, werden auf die Sehenden aufmerksam. Wer sie zu oft benutzt, findet sich verfolgt von Dingen, die nicht in unsere Welt gehören, und zahlt den Preis für die Versuchung, Grenzen zu überschreiten.`,
      stats: [10, 10, 9, 8, 10, 10]
    }
  ]
};
