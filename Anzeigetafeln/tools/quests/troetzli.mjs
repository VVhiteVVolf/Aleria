import { TROETZLI_PEOPLE } from '../../../AleriaAlmanach/modules/gwynthor-troetzli/troetzli-household.mjs';
import { FEARNAN_NOTICE_ID } from '../build-household-quests.mjs';
import { NOTICE_SEALS } from '../../assets/js/seals/notice-seals-model.mjs';
import { rewardFromItem } from '../../assets/js/rewards/notice-rewards-model.mjs';
import { TROETZLI_REWARD_ITEMS } from '../../../AleriaAlmanach/modules/gwynthor-troetzli/troetzli-items.mjs';

export const TROETZLI_NOTICE_ID = 'gwynthor-der-staedter-und-sein-pferd';
const issuer = TROETZLI_PEOPLE.cynddelw;
const signature = 'assets/images/notices/troetzli/cynddelw-unterschrift-v1.webp';
const sketch = 'assets/images/notices/troetzli/eirlys-skizze-v1.webp';
const seal = NOTICE_SEALS.find(entry => entry.id === 'buergerlich');

export function buildTroetzliNotice() {
  return {
    id: TROETZLI_NOTICE_ID, typ: 'hilfsgesuch', publicationStatus: 'open',
    // A separate publication on the existing Hilfe nail; no new poster.
    stackId: FEARNAN_NOTICE_ID, stackOrder: 1, noticeGroupId: TROETZLI_NOTICE_ID,
    x: 2888 / 4096, y: 532 / 3072,
    title: 'Der Städter und sein Pferd', untertitel: 'Pferdekundige Hilfe für den Weg zum Penrudd-Hof gesucht',
    verfasser: `..${issuer.portrait}`, verfasserName: issuer.name,
    portrait: sketch, bild: '', emblem: '',
    unterschrift: signature, siegel: seal.src, sealPreset: 'buergerlich',
    typography: { font: 'kalam', heading: 'dancingscript', script: 'common' },
    sideWidth: 220, imageFit: 'contain', imagePosition: 'center',
    media: {
      verfasser: { kind: 'character', characterId: issuer.worldPersonId, familyId: 'haus-llythfor', personId: issuer.id,
        name: issuer.name, src: `..${issuer.portrait}`, position: 'top' },
      portrait: { kind: 'image', name: 'Eirlys’ Zeichnung: Trötzli verfehlt Papas Kopf nur knapp', src: sketch, fit: 'contain' },
      unterschrift: { kind: 'image', name: 'Cynddelw Llythfors Unterschrift', src: signature, fit: 'contain' },
      siegel: { kind: 'image', name: 'Einfaches bürgerliches Wachssiegel', src: seal.src, fit: 'contain' },
    },
    text: [
      '<p><strong>Ich suche jemanden, der mehr von Pferden versteht als ich — und sich das auch angesichts eines ausschlagenden Hengstes noch zutraut.</strong></p>',
      '<p>Mein Name ist <strong>Cynddelw Llythfor</strong>. Ich sammle für <em>Celtigerns Echo</em> Nachrichten und Geschichten aus den Orten unserer Grafschaft. Dafür brauche ich ein verlässliches Reisepferd. Mein alter Hest hat mir lange gute Dienste geleistet; ich kann ihm diese Wege nicht mehr auf Dauer zumuten.</p>',
      '<p>Als mir ein Söldner einen ausgewachsenen Rhyfel-Hengst für <strong>fünfhundert Kupfer</strong> anbot, hielt ich mich für einen bemerkenswert klugen Käufer. Das Tier war kräftig, nicht alt und trotz zahlreicher Narben augenscheinlich wohlgenährt. Inzwischen fürchte ich, dass meine Menschenkenntnis weiter reicht als meine Pferdekenntnis.</p>',
      '<p><strong>Trötzli</strong> — unsere Tochter hat ihn so genannt — lässt sich nicht reiten. Er erschrickt schnell, wehrt sich heftig und schlägt aus. Seine vielen Narben sind alt und verheilt; was er erlebt hat, weiß ich nicht. Ich möchte dem früheren Besitzer keine Misshandlung unterstellen, für die ich keinen Beleg habe. Ich weiß nur, dass ich diesem Pferd gegenwärtig nicht gewachsen bin.</p>',
      '<p>Ich habe versucht, ihn weiterzuverkaufen. Sobald ich offen erkläre, wie er sich verhält, verliert sich das Interesse. Verschweigen werde ich es trotzdem nicht. Auch verschenken kann ich ihn nicht einfach an jemanden, der womöglich ebenso ratlos vor ihm steht wie ich.</p>',
      '<p>Mein Schwiegervater <strong>Tudur Penrudd</strong> hat sich bereit erklärt, ihn auf dem <strong>Penrudd-Hof nördlich von Gwynthor</strong> aufzunehmen. Er weiß von den Schwierigkeiten. Dort hätte Trötzli mehr Platz, Abstand vom Stadtbetrieb und hoffentlich die Ruhe, die ihm hier fehlt. Meine Frau Esyllt stammt von diesem Hof; die Aufnahme ist mit ihrer Familie abgesprochen.</p>',
      '<p><strong>Nun muss ich ihn nur noch dorthin bekommen.</strong> Das Wort „nur“ schreibe ich mit einiger Beschämung. Bei meinen bisherigen Versuchen trat er aus; zuletzt verfehlte sein Huf meinen Kopf nur knapp. Anschließend brauchte die Stadtwache <strong>sechs Stunden</strong>, um ihn wieder einzufangen. Für ihre Hilfe bin ich dankbar. Ich kann aber nicht erwarten, dass sie einen privaten Pferdetransport für mich übernimmt.</p>',
      '<p>Ich bitte daher um <strong>erfahrene, ruhige Hilfe beim Führen und Überbringen</strong>. Ihr sollt ihn weder probeweise zureiten noch bis zum Hof gefügig machen. Ich möchte, dass Mensch und Tier dort heil ankommen. Tudur erwartet Euch und nimmt ihn in Empfang.</p>',
      '<p>Für die sichere Übergabe an meinen Schwiegervater biete ich <strong>fünfzig Kupferstücke, ein schickes unbeschriebenes Notizbuch und Schreibutensilien</strong>: eine gute Feder, ein verschlossenes Tintenfläschchen und eine Lederhülle für unterwegs. Vielleicht entstehen in dem Buch ja angenehmere Reiseaufzeichnungen als diese.</p>',
      '<p>Bitte hinterlasst bei <strong>Celtigerns Echo in Gwynthor</strong> eine Nachricht für mich. Vor dem Aufbruch zeige ich Euch Trötzli und bespreche mit Euch den Weg und die nötige Vorbereitung. Ich bitte um eine baldige Meldung — und darum, meine Offenheit nicht mit Übertreibung zu verwechseln. Ich brauche wirklich Hilfe.</p>',
    ].join(''),
    table: [{ k: 'Auftraggeber', v: issuer.name }, { k: 'Gesucht', v: 'Erfahrene Pferdeführer · ruhiger Umgang mit einem schreckhaften Hengst' },
      { k: 'Tier', v: 'Trötzli · hellbrauner Rhyfel-Hengst · alte Narben · derzeit nicht reitbar' },
      { k: 'Ziel', v: 'Penrudd-Hof nördlich Gwynthors · Übergabe an Tudur Penrudd' },
      { k: 'Belohnung', v: '50 Kupferstücke · ein schickes Notizbuch · Schreibutensilien' },
      { k: 'Kontakt', v: 'Nachricht für Cynddelw Llythfor bei Celtigerns Echo in Gwynthor' }],
    rewards: [{ kind: 'money', currency: 'copper', amount: 50, condition: 'Für die sichere Übergabe Trötzlis an Tudur Penrudd auf dem Penrudd-Hof.' },
      ...TROETZLI_REWARD_ITEMS.map(item => rewardFromItem(item))], artikel: [], personen: [], comments: [], secret: false,
  };
}
