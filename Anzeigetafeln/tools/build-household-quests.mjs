import { GWYNTHOR_HOUSEHOLDS } from '../../AleriaAlmanach/modules/gwynthor-heime/households.mjs';
import { STANDARD_ITEMS } from '../../AleriaAlmanach/modules/item-register/item-register-standard.js';
import { rewardFromItem } from '../assets/js/rewards/notice-rewards-model.mjs';
import { HERLUIN_MISSING_NOTICE_ID, buildHerluinMissingNotice } from './quests/herluin-missing.mjs';

export const FEARNAN_NOTICE_ID = 'gwynthor-fearnan-die-verschwundene-schatulle';
export const TORVIK_NOTICE_ID = 'gwynthor-torvik-seit-lyristag-vermisst';
const art = 'assets/images/quests/torvik-seit-lyristag-vermisst/maonaids-familienamulett-v1.png';
const portrait = person => `../AleriaAlmanach/${person.portrait.slice(2)}`;
const home = slug => GWYNTHOR_HOUSEHOLDS.find(item => item.slug === slug);
const base = (id, family, issuer) => ({
  id, verfasser: portrait(issuer), verfasserName: issuer.name,
  emblem: `../AleriaAlmanach/assets/gwynthor-heime/${family.slug}/wappen.png`,
  media: { verfasser: { kind: 'character', name: issuer.name, familyId: `haus-${family.slug}`, personId: issuer.id, src: portrait(issuer) } },
  sideWidth: 220, imageFit: 'cover', imagePosition: 'top',
  bild: '', portrait: '', artikel: [], personen: [], comments: [], secret: false,
});

export function buildHouseholdQuestNotices() {
  const fearnan = home('fearnan'), torvik = home('torvik');
  const muireann = fearnan.people.find(person => person.id === 'muireann');
  const maonaid = torvik.people.find(person => person.id === 'maonaid');
  const amulet = STANDARD_ITEMS.find(item => item.id === 'standard:arkanist:unverzaubertes-amulett');
  if (!amulet) throw new Error('Standardvorlage für das Familienamulett fehlt.');
  // A particular inherited instance of the real register template. Its durable
  // reward snapshot preserves its own name and artwork without inventing stock.
  const reward = rewardFromItem({ ...amulet, title: 'Maonaids Familienamulett', image: art,
    description: 'Ein altes silbernes Amulett mit mattem grünem Glas und schlichten eingeritzten Blättern. Die Kette wurde einmal ausgebessert. Maonaid würde das Erbstück ihrer Familie für die sichere Rückkehr ihres Mannes hergeben.',
    details: 'Persönliches Familienerbstück · unverzaubert · ein einzelnes Stück. Eine Belohnung für Haldors sichere Rückkehr; kein laufendes Handelsangebot.' });
  const nail = buildHerluinMissingNotice();
  const fearnanNotice = {
    ...base(FEARNAN_NOTICE_ID, fearnan, muireann), typ: 'hilfsgesuch',
    x: 2888 / 4096, y: 532 / 3072,
    title: 'Wer hilft uns, die Wahrheit zu finden?', untertitel: 'Ein dringendes Gesuch der Familie Fearnan',
    typography: { font: 'caveat', heading: 'inherit', script: 'common' },
    text: [
      '<p><strong>Wir hatten die letzte Rate schon abgezählt.</strong></p>',
      '<p>Mein Mann Eoghan und ich mussten uns beim Geld- und Pfandverleiher Geld borgen, weil es anders nicht mehr ging. Seitdem haben wir jede Rate rechtzeitig bezahlt. Auch die letzte lag bereit. Danach wären wir endlich mit den Schulden fertig gewesen.</p>',
      '<p>Wir waren mit unseren beiden Mädchen fort, einen Tag zusammen, und als wir heimkamen, lagen unsere Bettdecken auf dem Boden. Jemand hatte alles durchwühlt. Die <strong>Metallschatulle unter unserem Bett</strong> war weg. Darin waren die letzte Rate und alles, was wir sonst noch gespart hatten.</p>',
      '<p>Ich habe sogar zwischen den Kleidern nachgesehen. Als könnte ich sie selbst irgendwo anders hingestellt haben. Geschirr, Wäsche, alles war noch da. Nur unser Geld war fort.</p>',
      '<p>Der Verleiher hat uns nun angeboten, den Kredit zu verlängern. Dafür sollen wir ihm unser <strong>Haus verkaufen</strong>. Er würde die Schuld verrechnen und uns weiter darin wohnen lassen, zur Miete. Eoghan liest das Angebot immer wieder. Ich frage ihn, wovon wir dann die Miete bezahlen sollen.</p>',
      '<p>Vielleicht hat der Einbrecher uns fortgehen sehen. Vielleicht wusste jemand, wo wir das Geld aufbewahren. Ich weiß es nicht. Aber ich kann dieses Papier nicht unterschreiben, ohne dass jemand nachgesehen hat. <strong>Bitte helft uns herauszufinden, wer die Schatulle genommen hat.</strong> Die Zettel über unsere Raten haben wir noch.</p>',
      '<p>Ich kann euch kein Geld versprechen. Es fällt mir schwer genug, das hier hinzuschreiben. Bitte kommt trotzdem, ehe wir unser Zuhause hergeben müssen. Die Mädchen fragen schon, ob wir wieder fortziehen.</p>',
      '<p>Wir wohnen im <strong>Hafenviertel, im kleinen Haus mit dem fröhlichen Baum an der Tür</strong>. Fragt nach Muireann oder Eoghan Fearnan. Ich bin da.</p>',
      '<p>Muireann</p>',
    ].join(''),
    rewards: [],
    table: [{ k: 'Gesucht', v: 'Verlässliche Nachforscher' }, { k: 'Ort', v: 'Gwynthor · Hafenviertel · Heim der Fearnan' },
      { k: 'Dringlichkeit', v: 'Dringend · vor einer Unterschrift über das Haus' },
      { k: 'Belohnung', v: 'Derzeit keine Geldmittel · aufrichtiger Dank' }, { k: 'Kontakt', v: 'Muireann und Eoghan Fearnan · Haus mit dem fröhlichen Baum' }],
  };
  const torvikNotice = {
    ...base(TORVIK_NOTICE_ID, torvik, maonaid), typ: 'quest',
    stackId: HERLUIN_MISSING_NOTICE_ID, stackOrder: 4, noticeGroupId: TORVIK_NOTICE_ID,
    x: nail.x, y: nail.y,
    title: 'Seit Lyristag vermisst', untertitel: 'Bitte helft mir, Haldor Torvik zu finden und heimzubringen',
    typography: { font: 'kalam', heading: 'template', script: 'common' },
    rewards: [reward, { kind: 'money', currency: 'copper', amount: 30,
      condition: 'Nur falls das Familienamulett als Belohnung nicht ausreicht, lege ich diese 30 Kupfertaler dazu.' }],
    text: [
      '<p><strong>Hat jemand meinen Haldor gesehen?</strong></p>',
      '<p>Er ist seit dem vergangenen Lyristag nicht nach Hause gekommen. <strong>Haldor Torvik</strong>, zweiunddreißig, blond, kräftig, mit einem dichten Schnurrbart. Auf dem Blatt dahinter ist eine Zeichnung von ihm.</p>',
      '<p>Er hatte wieder Streit mit seinem Meister. Ständig soll er länger in der Schmiede bleiben, und wenn Zahltag ist, weiß der Mann von den Stunden nichts mehr. Diesmal wollte Haldor beim Hof des Grafen vorsprechen. Aber die Gesuchsplätze waren schon vergeben. Danach ist er zum <strong>Kleinen Durst</strong> gegangen.</p>',
      '<p>Ich dachte erst, er hätte sich dort wieder festgetrunken. Ich war sogar wütend auf ihn. Als er am Morgen noch immer nicht da war, bin ich selbst zu den Docks. Der Wirt sagte, Haldor habe von einer <strong>neuen Arbeitsstelle</strong> geredet und sei aufgebrochen. Ich wusste nichts von dieser Stelle. Bei mir war er seitdem nicht.</p>',
      '<p>Die Stadt weiß Bescheid. Aber noch hat mir niemand sagen können, wo er ist. Iver fährt bei jedem Schritt vor dem Haus hoch. Ich sage ihm immer, dass ich nach seinem Vater suche. Langsam weiß ich nicht mehr, wohin ich noch gehen soll.</p>',
      '<p><strong>Bitte findet ihn und bringt ihn heim.</strong> Vielleicht hat jemand gehört, wer ihm die Arbeit angeboten hat. Vielleicht hat ihn jemand nach dem Kleinen Durst noch gesehen. Falls er glaubt, ich sei böse auf ihn, sagt ihm bitte, dass er heimkommen soll. Einfach heimkommen.</p>',
      '<p>Ich gebe euch <strong>mein Familienamulett</strong> für seine sichere Rückkehr. Es ist das silberne mit dem grünen Glas. Ich habe es nie verkaufen wollen. Wenn es euch nicht genügt, habe ich noch <strong>dreißig Kupfertaler</strong>, die ich dazulegen kann. Mehr habe ich nicht.</p>',
      '<p>Fragt nach <strong>Maonaid im Marktviertel, in der Seitengasse am Haus mit dem kleinen Hammerzeichen</strong>. Bitte schiebt es nicht auf. Ohne Haldors Lohn kommen wir nicht lange aus, und ich kann Iver nicht noch einmal sagen, dass ich nichts weiß.</p>',
      '<p>Maonaid</p>',
    ].join(''),
    table: [{ k: 'Auftraggeber', v: 'Maonaid · Familie Torvik' }, { k: 'Belohnung', v: 'Familienamulett · nötigenfalls zusätzlich 30 Kupfertaler' },
      { k: 'Frist', v: 'Dringend, offen' }, { k: 'Gesucht', v: 'Haldor Torvik · 32 Jahre' },
      { k: 'Letzte Spur', v: 'Zum Kleinen Durst · vergangener Lyristag · angeblich neue Arbeitsstelle' },
      { k: 'Kontakt', v: 'Heim der Torvik · Marktviertel · kleines Hammerzeichen' }],
  };
  const haldorSheet = {
    ...base(`${TORVIK_NOTICE_ID}-haldor`, torvik, maonaid), typ: 'vermisst',
    stackId: HERLUIN_MISSING_NOTICE_ID, stackOrder: 5, noticeGroupId: TORVIK_NOTICE_ID,
    x: nail.x, y: nail.y, title: 'Vermisst: Haldor Torvik', untertitel: 'Personenblatt zum Gesuch „Seit Lyristag vermisst“',
    portrait: 'assets/images/missing-sketches/haldor-v1.png',
    text: [
      '<p>Das ist mein Mann, <strong>Haldor Torvik</strong>. Er ist zweiunddreißig und stammt aus Aldrimar. Er hat blaue Augen, einen dichten blonden Schnurrbart und bindet sein Haar hinten zu einem kurzen Zopf. Von der Schmiede hat er oft noch Ruß an den Händen, auch wenn er sie schon gewaschen hat.</p>',
      '<p>Auf der Zeichnung sieht er streng aus. Unser Sohn bringt ihn sonst leicht zum Lachen.</p>',
      '<p>Seit dem vergangenen Lyristag fehlt er. Der Wirt im <strong>Kleinen Durst an den Docks</strong> hat ihn noch gesehen. Er sagt, Haldor habe von einer neuen Arbeitsstelle gesprochen. Bitte fragt dort nach, wenn ihr meinem Gesuch nachgehen könnt.</p>',
      '<p>Und wenn ihr ihn findet: Sagt ihm, dass Iver und ich auf ihn warten. Ich möchte ihn wieder vor unserer Tür sehen.</p>',
      '<p>Maonaid<br>Marktviertel, Seitengasse beim Haus mit dem kleinen Hammerzeichen</p>',
    ].join(''),
    table: [{ k: 'Name', v: 'Haldor Torvik' }, { k: 'Alter', v: '32 Jahre' }, { k: 'Herkunft', v: 'Aldrimar' },
      { k: 'Kennzeichen', v: 'Kräftig · blond · kurzer gebundener Zopf · dichter Schnurrbart · blaue Augen' },
      { k: 'Vermisst seit', v: 'Vergangener Lyristag' }, { k: 'Zuletzt gesehen', v: 'Zum Kleinen Durst · Docks' }, { k: 'Kontakt', v: 'Maonaid · Heim der Torvik im Marktviertel' }],
  };
  return [fearnanNotice, torvikNotice, haldorSheet];
}
