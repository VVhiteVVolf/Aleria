import { ZITTERAALE_ART, ZITTERAALE_LEADERS } from '../../../AleriaAlmanach/modules/schwarze-zitteraale/zitteraale-people.mjs';
import { ZITTERAALE_KNIGHT_ICON } from '../../../AleriaAlmanach/modules/schwarze-zitteraale/zitteraale-dossiers.mjs';
import { buildEgonNoticeIdentity } from '../issuers/egon-gafyr.mjs';
export const ZITTERAALE_NOTICE_ID = 'gwynthor-egon-schwarze-zitteraale-gesucht';
export const ZITTERAAL_KNIGHT_REWARD = Object.freeze({ kind: 'honor', id: 'ritterschlag', title: 'Ein Ritterschlag', image: ZITTERAALE_KNIGHT_ICON,
  description: 'Zusätzliche ausgesetzte Ehrung für die Überwältigung des Schwarzen Zitteraals.',
  condition: 'Für die Überwältigung des Schwarzen Zitteraals; Verleihung durch die zuständige Herrschaft nach Prüfung der Tat.' });
const reward = person => [{ kind: 'money', currency: 'gold', amount: person.bountyGold }, ...(person.id === 'schwarzer-zitteraal' ? [structuredClone(ZITTERAAL_KNIGHT_REWARD)] : [])];

export function buildZitteraaleWantedNotices() {
  const shared = { noticeGroupId: ZITTERAALE_NOTICE_ID, stackId: ZITTERAALE_NOTICE_ID,
    // 4096 × 3072 board: upper-left fastening of the painted GESUCHT sheet.
    x: 2340 / 4096, y: 1710 / 3072, verfasserName: 'Sir Egon Gafyr · Marschall der Grafschaft Celtigerns Wacht',
    ...buildEgonNoticeIdentity(), typography: { font: 'kalam', heading: 'print', script: '' },
    imageFit: 'cover', imagePosition: 'top', sideWidth: 260, artikel: [], personen: [], comments: [], secret: false };
  const chief = ZITTERAALE_LEADERS[0];
  const main = { ...shared, id: ZITTERAALE_NOTICE_ID, stackOrder: 0, typ: 'quest', title: 'Gesucht · Die Schwarzen Zitteraale',
    untertitel: 'Anordnung des Marschallamtes · Celtigerns Wacht', portrait: '',
    rewards: reward(chief), table: [{ k: 'Angeordnet von', v: 'Sir Egon Gafyr · Marschall' }, { k: 'Bandenhaupt', v: '35 Goldtaler und ein Ritterschlag' },
      { k: 'Weitere Köpfe', v: '13 · 11 · 5 · 3,4 Goldtaler · siehe Personenblätter' }, { k: 'Niedere Mitglieder', v: '1 Silbertaler je identifiziertem Mitglied' },
      { k: 'Frist', v: 'Offen · bis zur Aufhebung der Fahndung' }, { k: 'Meldestelle', v: 'Marschallamt in Castell Rhewglyn · Gwynthor' }],
    text: '<p><strong>Im Namen der Grafschaft Celtigerns Wacht.</strong></p><p>Die Raubritterbande der <strong>Schwarzen Zitteraale</strong> wird wegen Mordes, Plünderung, Erpressung und weiterer schwerer Gewalttaten verfolgt. Ich fordere geeignete, bewaffnete Helfer auf, die auf den beigefügten Blättern bezeichneten Rädelsführer zu stellen und der gräflichen Obrigkeit zu übergeben.</p><p>Auf das Bandenhaupt, den <strong>Schwarzen Zitteraal</strong>, sind <strong>35 Goldtaler</strong> ausgesetzt. Als weitere Belohnung ist ein <strong>Ritterschlag</strong> ausgeschrieben. Die vier weiteren Köpfe sind mit ihren eigenen Kopfgeldern verzeichnet. Für jedes zweifelsfrei identifizierte niedere Mitglied beträgt die Belohnung <strong>einen Silbertaler</strong>.</p><p>Lebendige Gefangene sind sicher zu überstellen. Beim Bandenhaupt gilt die Fahndung tot oder lebendig; ein Todesnachweis muss zweifelsfrei sein. Auszahlung und etwaige Ehrung erfolgen nach amtlicher Prüfung. Für dieselbe Person wird ein Kopfgeld nur einmal gezahlt; die Belohnung für ein niederes Mitglied wird nicht zusätzlich zum Kopfgeld eines Rädelsführers ausgezahlt.</p><p>Ein behaupteter Beiname oder bloßes Tragen dunkler Kleidung genügt nicht als Beweis. Belastbare Hinweise und Gefangene sind dem <strong>Marschallamt in Castell Rhewglyn zu Gwynthor</strong> zuzuführen. Der derzeitige Sitz der Bande ist nicht bestätigt. Niemand erhält durch dieses Schreiben das Recht, Unbeteiligte zu bedrängen.</p><p><em>Sir Egon Gafyr<br>Marschall des Grafen zu Celtigerns Wacht</em></p>' };
  const leaders = ZITTERAALE_LEADERS.map((person, i) => ({ ...shared, id: `${ZITTERAALE_NOTICE_ID}-${person.id}`, stackOrder: i + 1,
    typ: 'steckbrief', title: person.name, untertitel: 'Personenblatt zur gemeinsamen Fahndung „Die Schwarzen Zitteraale“', portrait: person.sketch,
    rewards: reward(person), table: [{ k: 'Beiname', v: person.name }, { k: 'Stellung', v: person.role },
      { k: 'Kopfgeld', v: `${person.bountyGold.toLocaleString('de-DE')} Goldtaler${i === 0 ? ' und ein Ritterschlag' : ''}` },
      { k: 'Alter', v: `Etwa ${person.age} Jahre` }, { k: 'Größe', v: person.height }, { k: 'Fahndung', v: person.status }],
    text: `<p><strong>Kennzeichen:</strong> ${person.appearance}</p><p><strong>Zur Last gelegt:</strong> ${person.charges.join(', ')}.</p><p>${person.method}</p><p>Die Zeichnung dient der Wiedererkennung und ersetzt keinen Identitätsnachweis. Dieses Blatt gehört zur Anordnung des Marschallamtes. Die dort genannten Bedingungen gelten auch für dieses Kopfgeld.</p>` }));
  const regular = { ...shared, id: `${ZITTERAALE_NOTICE_ID}-komplizen`, stackOrder: 6, typ: 'steckbrief', title: 'Niedere Mitglieder der Schwarzen Zitteraale',
    untertitel: 'Allgemeines Fahndungsblatt · Silhouette ohne individuelle Identität', portrait: `${ZITTERAALE_ART}/sketches/komplize.png`, rewards: [{ kind: 'money', currency: 'silver', amount: 1 }],
    table: [{ k: 'Gesucht', v: 'Reguläre Komplizen der Schwarzen Zitteraale' }, { k: 'Kopfgeld', v: '1 Silbertaler je identifiziertem niederen Mitglied' },
      { k: 'Übergabe', v: 'Lebendig an die Obrigkeit' }, { k: 'Nachweis', v: 'Tatbeteiligung und Bandenbindung müssen geprüft werden' }],
    text: '<p>Gesucht werden die niederen Komplizen der Schwarzen Zitteraale. Für jedes identifizierte und überstellte Mitglied wird nach Prüfung <strong>ein Silbertaler</strong> ausgezahlt.</p><p>Die Silhouette zeigt keine bestimmte Person. Kapuzen, alte Waffen oder ein ähnliches Kleidungsstück allein begründen keinen Verdacht. Erforderlich sind belastbare Umstände, die Bandenbindung und Beteiligung nachweisen.</p><p>Dieses Kopfgeld gilt nicht zusätzlich zu einem der fünf Rädelsführer-Kopfgelder. Gefangene sind dem Marschallamt oder der zuständigen Wache sicher zu übergeben.</p>' };
  return [main, ...leaders, regular];
}
