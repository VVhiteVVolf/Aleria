// Namen, Regierungszeiten und Überlieferungslücken aus der Animexx-Vorlage.
// personId verweist auf bestehende Personen, nicht auf neu erzeugte Stammbäume.
export const CENYR_MONARCHS = [
  { name: 'Vortigern I.', personId: 'vortigern-pendrag', reign: 'Nicht überliefert', note: 'Erster König Cenyrs · Gründer des Reiches' },
  { name: 'Uther I.', personId: 'uther-pendrag', reign: 'Nicht überliefert', note: 'Zweiter König Cenyrs' },
  { name: 'Parzifal I.', personId: 'parzifal-pendrag', reign: 'Nicht überliefert', gapBefore: 'Jahrhunderte später' },
  { name: 'Malon II.', personId: 'malon-pendrag', reign: 'Nicht überliefert', gapBefore: 'Später · Überlieferungslücke' },
  { name: 'Melwas III.', personId: 'melwas-pendrag', reign: 'Nicht überliefert' },
  { name: 'Griflet II.', personId: 'griflet-pendrag', reign: 'Nicht überliefert', gapBefore: 'Später · Überlieferungslücke' },
  { name: 'Galahad III.', personId: 'galahad-pendrag', reign: 'Beginn unbekannt – 1149', gapBefore: 'Später · Überlieferungslücke' },
  { name: 'Agravaine V.', personId: 'agravaine-pendrag', reign: '1568 – 1600', gapBefore: 'Später · Überlieferungslücke' },
  { name: 'Gawain VII.', personId: 'gawain-pendragon', reign: '1600 – 1623' },
  { name: 'Gareth IV.', personId: 'gareth-pendrag', reign: '1623 – 1634' },
  { name: 'Bors II.', personId: 'bors-pendrag', reign: '1634 – 1653' },
  { name: 'Artus XII.', personId: 'artus-1622-pendrag', reign: '1653 – 1673' },
  { name: 'Uther IX.', personId: 'uther-1643-pendrag', reign: '1673 – 1678' },
  { name: 'Rywalyn II.', personId: 'rywalyn-pendrag', reign: '1678 – 1720' },
  { name: 'Tristan', personId: 'tristan-pendrag', reign: 'Seit 1720', note: 'Amtierender König von Cenyr', current: true }
];

export const SUCCESSION_PRINCIPLES = [
  { title: 'Primogenitur', description: [
    'Grundsätzlich erbt der älteste Sohn Titel, Lehen und die damit verbundenen Rechte. Stirbt er oder wird er für ungeeignet erklärt, fällt das Erbe an den nächstältesten Sohn. Gibt es keinen männlichen Erben, können Töchter berücksichtigt werden; ihre Ansprüche sind häufig mit Heiratsallianzen verbunden.'
  ] },
  { title: 'Lehnstreue & ritterliche Eignung', description: [
    'Adelige Abstammung allein genügt nicht. Ein Erbe soll Tapferkeit, Ehre, Rechtschaffenheit und Glaubenstreue verkörpern. Entspricht er diesen Idealen nicht, kann der Lehnsherr oder König ihn für untauglich erklären und stattdessen einen anderen männlichen Verwandten oder einen verdienstvollen Ritter einsetzen.'
  ] },
  { title: 'Bewährung in der Knappschaft', description: [
    'Die Söhne des Adels und gelegentlich auch seine Töchter erlernen die ritterlichen Tugenden als Knappen. Ein Erbe muss sich in dieser Ausbildung bewähren und häufig den Ritterschlag empfangen, bevor er seinen Anspruch antreten kann. Versagen oder Entehrung können zum Verlust dieses Anspruchs führen.'
  ] },
  { title: 'Ehrenvolle Adoption', description: [
    'Ist ein Herrscher kinderlos oder erscheinen seine direkten Nachkommen ungeeignet, kann in seltenen Fällen ein würdiger Ritter oder naher Verwandter ehrenvoll adoptiert werden. Die Adoption ist rechtlich bindend und wird in einer feierlichen Zeremonie von Kirche und Vasallen bestätigt.'
  ] },
  { title: 'Der Einfluss der Kirche', description: [
    'Die Alerische Kirche wacht darüber, dass die Erbfolge sowohl weltlichen Gesetzen als auch den göttlichen Tugenden entspricht. Ketzerei, Tyrannei oder schwere Untugend können zur Exkommunikation und zur Enthebung vom Erbe führen. Solche Urteile sind selten, können aber erhebliche Konflikte auslösen.'
  ] },
  { title: 'Töchter & dynastische Allianzen', description: [
    'Töchter stehen in der Erbfolge hinter männlichen Erben, sind aber für dynastische Bündnisse von großer Bedeutung. Durch Heiratsallianzen können ihnen Ansprüche auf Ländereien und Titel zukommen, insbesondere wenn anderweitige Nachkommen fehlen. In solchen Fällen wird ihr Ehemann als Vormund und Beschützer der Ländereien eingesetzt.'
  ] },
  { title: 'Turniere bei umstrittener Erbfolge', description: [
    'Erheben mehrere Anwärter Anspruch auf ein Lehen, können sie in einem ritterlichen Turnier oder Duell um das Erbrecht kämpfen. Kirche und Vasallen beaufsichtigen den Wettstreit. Er soll den würdigsten und ehrenhaftesten Anwärter bestimmen und größere Blutvergießen oder Bürgerkriege verhindern.'
  ] }
];
