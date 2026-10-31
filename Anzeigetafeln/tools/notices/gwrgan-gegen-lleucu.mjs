import { pinPosition } from '../../assets/js/composition/board-composition-model.mjs';
import { DEFAULT_BOARD_SIZE } from '../../assets/js/composition/board-composition-config.mjs';

export const COURT_NOTICE_ID = 'gwynthor-gwrgan-gegen-lleucu';
export const COURT_POSTER = Object.freeze({
  id: 'gwynthor-poster-gwrgan-gegen-lleucu', assetId: 'gericht-gwrgan-lleucu',
  x: .377, y: .728, width: .05933, rotation: -2, layer: 4000,
  noticeId: COURT_NOTICE_ID,
  pin: { assetId: 'straight', x: .5, y: .045, size: .16, rotation: 4, enabled: true }
});
export const COURT_BOARD_BINDING = Object.freeze({ posterId: COURT_POSTER.id,
  assetId: COURT_POSTER.assetId, noticeId: COURT_NOTICE_ID, poster: COURT_POSTER });
const art = 'assets/images/notices/gwrgan-gegen-lleucu';
const portraits = '../AleriaAlmanach/assets/gwynthor-erbstreit/portraits';
const civic = 'assets/images/issuers/gwynthor-verwaltung';
export const COURT_TERM = 'In zwei Tagen, zur dritten Morgenstunde';
const venue = 'Gerichtssaal am gräflichen Hof zu Gwynthor';

const authors = {
  neithon: { id: 'neithon-1718-draig', familyId: 'haus-draig', name: 'Neithon Draig',
    office: 'Adjutant des Justiziars', portrait: '../Stammbäume/assets/images/portraits/haus-draig/neithon-1718-draig.jpg',
    signature: `${art}/neithon-draig-unterschrift-display.webp`, seal: `${civic}/wachssiegel-v1.png`, font: 'dancingscript' },
  gethin: { id: 'gethin-falchdyn', familyId: 'haus-falchdyn', name: 'Gethin Falchdyn',
    office: 'Vom Hof bestellter Fürsprecher Gwrgan Cochdons', portrait: `${portraits}/gethin-falchdyn.png`,
    signature: `${art}/gethin-falchdyn-unterschrift-v1.webp`, seal: 'assets/images/seals/defaults/buergerlich-v1.png', font: 'patrickhand' },
  valeriano: { id: 'valeriano-falto', familyId: 'haus-falto', name: 'Valeriano Falto',
    office: 'Gildenfürsprecher des Marktes der Fortuna · für Lleucu Swyll', portrait: `${portraits}/valeriano-falto.png`,
    signature: `${art}/valeriano-falto-unterschrift-v1.webp`, seal: 'assets/images/seals/defaults/buergerlich-v1.png', font: 'dancingscript' }
};
function identity(author, icon) {
  return { verfasser: author.portrait, verfasserName: `${author.name} · ${author.office}`,
    unterschrift: author.signature, siegel: author.seal, emblem: `${art}/${icon}-icon-v1.webp`,
    typography: { font: author.font, heading: 'template', script: 'common' },
    media: {
      verfasser: { kind: 'character', personId: author.id, familyId: author.familyId, name: author.name, src: author.portrait, fit: 'cover', position: 'top' },
      unterschrift: { kind: 'image', name: `${author.name} · Unterschrift`, src: author.signature, fit: 'contain', position: 'center' },
      siegel: { kind: 'image', name: author === authors.neithon ? 'Wachssiegel der Gwynthorer Verwaltung' : 'Bürgerliches Schreibersiegel', src: author.seal, fit: 'contain', position: 'center' },
      emblem: { kind: 'image', name: { gericht: 'Waage und Gerichtsrolle', heimkehr: 'Gelöste Fessel und Heimkehr', reederei: 'Schiff, Geschäftsbuch und Feder' }[icon], src: `${art}/${icon}-icon-v1.webp`, fit: 'contain', position: 'center' }
    } };
}

// This is an ongoing civil proceeding. The parties' arguments are deliberately
// attributed to their advocates; neither sheet is a court finding or a quest.
export function buildGwrganLleucuNotices(asset) {
  const shared = { ...pinPosition(COURT_POSTER, asset, DEFAULT_BOARD_SIZE),
    stackId: COURT_NOTICE_ID, noticeGroupId: COURT_NOTICE_ID, typ: 'ankuendigung',
    bild: '', portrait: '', imageFit: 'contain', imagePosition: 'center', sideWidth: 210,
    artikel: [], personen: [], comments: [], secret: false };
  return [
    { ...shared, ...identity(authors.neithon, 'gericht'), id: COURT_NOTICE_ID, stackOrder: 0, typ: 'erlass',
      title: 'Gwrgan Cochdon gegen Lleucu Swyll', untertitel: 'Verlautbarung des gräflichen Gerichts · erstes Blatt',
      table: [{ k: 'Verhandlung', v: COURT_TERM }, { k: 'Ort', v: venue },
        { k: 'Kläger', v: 'Gwrgan Cochdon · vertreten durch Gethin Falchdyn' },
        { k: 'Beklagte', v: 'Lleucu Swyll · vertreten durch Valeriano Falto' }],
      text: '<p><strong>Kund und zu wissen den Bürgern Gwynthors und den Bewohnern seines Bannkreises.</strong> Auf das beim Hof eingegangene Gesuch des heimgekehrten Seehändlers Gwrgan Cochdon wird in zwei Tagen, zur dritten Morgenstunde, vor dem gräflichen Gericht verhandelt. Die Sache wird unter dem Namen <strong>Gwrgan Cochdon gegen Lleucu Swyll</strong> geführt. Den Vorsitz hat Justiziar Meurig Draig.</p>'
        + '<p>Gwrgan Cochdon zog vor zwanzig Jahren mit seinen drei Brüdern im Aufgebot Rhodris des Großen nach Vennyr. Nach der Schlacht der tausend Wellen galten die Brüder als verloren. Gwrgan überlebte, geriet jedoch in die Gewalt der Nordmänner und wurde als Thrall für den Clan Valdruna zur Arbeit gezwungen. Nach seiner Flucht nahm ein Schiff des Dyfrgi-Vasallen Sir Cynfarch Llafnfor ihn und weitere Überlebende auf. Inzwischen ist Gwrgan nach Gwynthor zurückgekehrt. <strong>Dass er der heimgekehrte Gwrgan ist, wird von Lleucu nicht bestritten.</strong></p>'
        + '<p>Während seiner Abwesenheit wurde sein Tod amtlich angenommen. Sein Vater Gorwystl Cochdon lebte zunächst weiter und vermachte den verbliebenen Besitz später ausdrücklich seiner Schwiegertochter Lleucu. Diese führte den Seehandel fort und schloss nach anerkannter Witwenschaft eine zweite Ehe mit dem Kapitän Eifion Twyllod. Aus dieser Ehe stammen drei Kinder.</p>'
        + '<p>Der Kläger fordert die Herausgabe des von ihm beanspruchten Nachlasses und Hauses, Rechnung über die daraus gezogenen Einkünfte sowie eine Entschädigung. Ferner begehrt er die Feststellung, dass seine erste Ehe fortbestehe, und bestreitet daraus folgend den Personenstand der zweiten Ehe und ihrer Kinder. Die Beklagte widerspricht. Sie beruft sich auf die amtliche Todesannahme, das Testament, ihre redliche Wiederverheiratung und die Arbeit, mit der der Betrieb erhalten und vermehrt wurde.</p>'
        + '<p><strong>Keine dieser streitigen Forderungen ist durch diesen Aushang entschieden.</strong> Die zweite Ehe und der bisher anerkannte Stand der Kinder werden hier nicht aufgehoben. Beide Parteien werden durch ihre Fürsprecher gehört. Gethin Falchdyn ist dem mittellosen Kläger vom Hof bestellt; Valeriano Falto vertritt die Beklagte auf Bestellung des Marktes der Fortuna. Die beiden folgenden Blätter geben ihre jeweiligen Sachvorträge wieder. Die Gerichtsbesetzung und Ordnung stehen auf dem vierten Blatt.</p>'
        + '<p><em>Neithon Draig<br>Adjutant des Justiziars</em></p>' },
    { ...shared, ...identity(authors.gethin, 'heimkehr'), id: `${COURT_NOTICE_ID}-klage`, stackOrder: 1,
      title: 'Für Gwrgan Cochdon', untertitel: 'Sachvortrag des Klägers · Gethin Falchdyn · zweites Blatt',
      table: [{ k: 'Partei', v: 'Gwrgan Cochdon · Kläger' },
        { k: 'Begehren', v: 'Nachlass und Haus · Rechnungslegung · Entschädigung · Feststellung der Ehefolgen' }],
      text: '<p><strong>Ich spreche für einen Mann, dessen Heimkehr niemand bestreitet und dessen Recht dennoch behandelt wird, als wäre er im Meer geblieben.</strong> Gwrgan Cochdon hat Gwynthor nicht verlassen, um Frau, Haus oder Gewerbe aufzugeben. Er zog mit seinen Brüdern in den Norden. Drei ertranken. Er selbst wurde halbtot an Land gespült und in Unfreiheit genommen.</p>'
        + '<p>Sechs Jahre arbeitete er in den Minen. Dass ihm später die Führung anderer Thralls und schließlich die Aufsicht an einem Hafen anvertraut wurden, machte ihn nicht frei. Er musste erst das Vertrauen seiner Herren gewinnen, ehe eine Flucht überhaupt möglich war. Wer aus seiner späteren Stellung schließen will, er habe sich bequem im Norden eingerichtet, soll erklären, weshalb ein freier Mann seine Heimfahrt unter Verfolgung und Lebensgefahr antreten müsste.</p>'
        + '<p>Er entkam mit fünfzig anderen. Sir Cynfarch Llafnfor rettete ihn und zwölf Mitflüchtende; achtunddreißig fanden auf dieser Flucht den Tod. Nach zwanzig verlorenen Jahren kehrte mein Mandant in die Stadt seiner Geburt zurück. Dort fand er seinen Vater tot, sein Haus in anderen Händen und seine Frau in einer neuen Ehe.</p>'
        + '<p>Ich bestreite nicht, dass Lleucu den Handel erhalten hat. Ebenso wenig behaupte ich, sie habe bei der Wiederheirat von Gwrgans Leben gewusst. <strong>Doch die redliche Annahme eines Todes ist nicht der Tod selbst.</strong> Zu prüfen ist, was von Gwrgans eigenen Rechten durch seine Abwesenheit ruhen durfte und was dadurch nicht endgültig vergehen konnte. Auch das Testament des Vaters kann nur darüber verfügen, was diesem selbst zustand. Es ersetzt nicht die Prüfung, welche Anteile, Ansprüche und Bindungen Gwrgan zuvor bereits besaß.</p>'
        + '<p>Darum beantragen wir die Offenlegung der damaligen Besitzverhältnisse, des Testaments, des Schiffsverkaufs und der späteren Rechnungen; sodann die Herausgabe dessen, was Gwrgan rechtlich zusteht, und die Prüfung seiner Entschädigungsansprüche. Der heutige Betrieb soll nicht mit einem bloßen Verweis auf seinen gewachsenen Wert jeder Prüfung entzogen werden. Gerade die Trennung zwischen altem Vermögen und späterer Leistung verlangt Rechnungslegung.</p>'
        + '<p>Gwrgan verlangt ferner die Feststellung, dass seine Ehe durch seine Gefangenschaft nicht geendet habe. Er zieht daraus Forderungen auch hinsichtlich der zweiten Ehe und ihrer Kinder. Diese weitreichenden Folgen sind dem Gericht vorzulegen; sie dürfen weder durch seinen Zorn noch durch das Unbehagen anderer bereits entschieden sein. <strong>Seine Gefangenschaft war keine freiwillige Preisgabe seines Lebens in Gwynthor.</strong> Diesem Umstand ist bei jeder Entscheidung Gewicht zu geben.</p>'
        + '<p><em>Gethin Falchdyn<br>Vom Hof bestellter Fürsprecher Gwrgan Cochdons</em></p>' },
    { ...shared, ...identity(authors.valeriano, 'reederei'), id: `${COURT_NOTICE_ID}-erwiderung`, stackOrder: 2,
      title: 'Für Lleucu Swyll', untertitel: 'Erwiderung der Beklagten · Valeriano Falto · drittes Blatt',
      table: [{ k: 'Partei', v: 'Lleucu Swyll · Beklagte' },
        { k: 'Begehren', v: 'Bestand von Testament und Erwerb · Schutz der anerkannten Ehe und Kinder · Abweisung pauschaler Herausgabe- und Entschädigungsforderungen' }],
      text: '<p><strong>Meine Mandantin bestreitet weder Gwrgans Identität noch das ihm widerfahrene Unrecht.</strong> Seine Heimkehr verdient Gehör. Sie macht jedoch die zwanzig Jahre, in denen andere für das verlassene Haus einstanden, nicht ungeschehen.</p>'
        + '<p>Lleucu war achtzehn Jahre alt, als die Männer der Cochdon im Norden verloren gingen. Zurück blieben ein schwer getroffener Vater und ein Betrieb am Rand des Zusammenbruchs: zwei heruntergekommene Schiffe, dringende Ausbesserungen und geringe Mittel. Die Familie lebte damals nicht von einem Wohlstand, den man nur hätte bewachen müssen. Ohne Verkauf, neue Absprachen und tägliche Arbeit wäre bald wenig zu bewachen gewesen.</p>'
        + '<p>Mit Unterstützung ihrer eigenen Verwandten veräußerte Lleucu eines der Schiffe. Sie trat dem Markt der Fortuna bei, gewann Frachtaufträge und baute den Handel neu auf. Eifion Twyllod, damals ein für die Familie arbeitender Seemann aus einfachen Fischerverhältnissen, stand ihr dabei zur Seite. Heute führt er das Hauptschiff und hält den Betrieb der Flotte zusammen. Fünf Schiffe fahren für den Markt der Fortuna; das Vermögen hat sich gegenüber der damaligen Lage etwa vervierfacht. Dieser Mehrwert ist aus Arbeit, Wagnis, erneuter Anschaffung und geschlossenen Verträgen entstanden.</p>'
        + '<p>Auch der Vater war kein bloßer Zuschauer. Gorwystl überlebte den vermeintlichen Verlust seiner Söhne. <strong>Er vermachte Lleucu den ihm gehörenden Besitz ausdrücklich.</strong> Was er besaß und was er wirksam verfügen konnte, darf geprüft werden. Sein letzter Wille darf dabei aber nicht so behandelt werden, als habe es ihn nie gegeben. Ebenso sind die Beiträge ihrer Verwandten, Eifions Arbeit und spätere Verpflichtungen des Betriebs bei jeder Rechnung zu berücksichtigen.</p>'
        + '<p>Die zweite Ehe wurde nach amtlich anerkannter Witwenschaft geschlossen. Zwischen Lleucu und Eifion entstand über Jahre der gemeinsamen Sorge Liebe. Ihre drei Kinder wurden in einer anerkannten Ehe geboren. Meine Mandantin hat den ersten Mann nicht heimlich verlassen und den zweiten nicht in Kenntnis eines Betruges geheiratet. <strong>Wer auf eine Entscheidung des Hofes vertraut und sein Leben danach ordnet, muss sich auf mehr verlassen dürfen als auf die Hoffnung, dass diese Entscheidung niemals in Frage gestellt werde.</strong></p>'
        + '<p>Wir beantragen daher, eine pauschale Herausgabe des heutigen Vermögens und eine pauschale Entschädigung zurückzuweisen, das Testament und die eigenen Erwerbsleistungen zu würdigen und Ehe wie Kinder im bisher anerkannten Stand zu schützen. Soweit Gwrgan frühere eigene Ansprüche nachweist, sind sie im Einzelnen zu prüfen. Sein Leid begründet jedoch nicht von selbst jede der geforderten Rechtsfolgen. <strong>Lleucu hat in diesen Jahren gelebt, gearbeitet und Verantwortung übernommen. Auch das steht vor diesem Gericht.</strong></p>'
        + '<p><em>Valeriano Falto<br>Gildenfürsprecher des Marktes der Fortuna</em></p>' },
    { ...shared, ...identity(authors.neithon, 'gericht'), id: `${COURT_NOTICE_ID}-gerichtsordnung`, stackOrder: 3, typ: 'erlass',
      title: 'Besetzung und Ordnung der Verhandlung', untertitel: 'Aus der Kanzlei des Justiziars · viertes Blatt',
      table: [{ k: 'Termin', v: COURT_TERM }, { k: 'Gerichtsort', v: venue },
        { k: 'Richter', v: 'Justiziar Meurig Draig' },
        { k: 'Juroren', v: 'Derwen Wyrm · Hywel Gafyr · Morwenna Saethwyr' },
        { k: 'Rechtsvorsteherin der Gerichte', v: 'Ceridwen Wyrm' },
        { k: 'Adjutant des Justiziars', v: 'Neithon Draig' },
        { k: 'Gerichtsverkünder', v: 'Godwyn Sgrechiwr' },
        { k: 'Vertretung', v: 'Tegan Draig' }],
      text: '<p><strong>Die Verhandlung ist öffentlich, soweit der Raum und die Ordnung des Gerichts es gestatten.</strong> Godwyn Sgrechiwr ruft die Sache auf. Die Parteien erscheinen mit ihren Fürsprechern; vorgelegte Urkunden werden nach Anordnung des Richters verlesen und geprüft. Geladene Zeugen sprechen nach Aufruf. Zwischenrufe, Drohungen und eigenmächtige Wortergreifung sind zu unterlassen.</p>'
        + '<p>Gehört werden die Ansprüche auf den früheren Besitz, die Bedeutung von Todesannahme und Testament, die Zurechnung des inzwischen erworbenen Vermögens sowie die begehrten Feststellungen zu Ehe und Personenstand. <strong>Die Frage, welche Folge rechtens ist, wird nicht durch die Zahl der Anhänger einer Partei entschieden.</strong></p>'
        + '<p>Die Beiblätter der Fürsprecher geben den Vortrag der jeweiligen Partei wieder. Sie sind weder Urteil noch verbindliche Auskunft über den geltenden Personenstand. Die Gerichtskanzlei hält die eingereichten Gesuche und Urkunden für das Verfahren bereit. Über Reihenfolge, Anhörung und weitere Termine verfügt das Gericht.</p>'
        + '<p><em>Neithon Draig<br>Adjutant des Justiziars · für die Gerichtskanzlei zu Gwynthor</em></p>' }
  ];
}
