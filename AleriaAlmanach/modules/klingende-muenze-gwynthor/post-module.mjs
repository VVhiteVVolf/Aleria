import { POST_ART, POST_SECTION, GUILD_EMBLEMS, COUNTY_POSTS } from './post-section.mjs';
import { POST_FACTIONS } from './post-factions.mjs';
import { buildMerchantHierarchy } from './post-merchant-hierarchy.mjs';
import { buildBankHierarchy } from './post-bank-hierarchy.mjs';
import { buildCompanyHierarchy } from './post-company-hierarchy.mjs';

export const POST_ID = 'gwynthor-handelsposten-klingende-muenze';
export const FACTIONS_ID = 'gwynthor-klingende-muenze-interessenbuende';
const image = id => ({ image: `${POST_ART}/${id}.png`, imageWidth: 34, imageTall: true, imageFit: 'cover', imagePosition: 'center' });
const story = (key, pageTitle, art, description, stats = []) => ({ schemaVersion: 1, commentThreadKey: `muenze-${key}`, pageTitle, ...image(art), description, stats });
const entry = (id, title, subtitle) => ({ id, title, subtitle, type: 'Gildenverbund', category: 'Gwynthor · Handelsposten', icon: '◈', symbol: GUILD_EMBLEMS.coin,
  image: `${POST_ART}/handelsposten.png`, previewImage: `${POST_ART}/handelsposten.png`,
  stamp: 'KLINGENDE MÜNZE · CELTIGERNS WACHT', schemaVersion: 1, multipage: true,
  appendCommentsPage: true, enablePageComments: true, sessionCast: [] });

export const POST_SCENES = Object.freeze([
  { id: 'kaihof', art: 'handelsposten', title: 'Der Kaihof · Zwischen Tor und Gezeiten', intro: 'Wagen warten vor den Annahmetoren; über den Hof tragen Stimmen von Trägern und Frachtenschreibern. Zum Wasser hin stehen Masten über den Dächern. Ein Warenbrief, ein Besucher oder eine verspätete Ladung wird am Kontorschalter angekündigt.' },
  { id: 'ratssaal', art: 'ratssaal', title: 'Der Ratssaal · Acht Plätze', intro: 'Acht gleichrangige Plätze umstehen den Ratstisch. Durch die hohen Fenster fällt der Blick auf Schiffe und Kais. Bücher, Vertragsrollen und versiegelte Berichte liegen für die nächste Beratung bereit; wer hier spricht, vertritt mehr als seinen eigenen Geldbeutel.' },
  { id: 'bankhalle', art: 'bankhalle', title: 'Die Bankhalle · Hinter dem Schalter', intro: 'Zwischen hohen Fenstern und vergitterten Schaltern wartet man auf den eigenen Aufruf. Münzen werden gewogen, Belege gegengezeichnet und Kontobücher gebracht. Die schweren Türen hinter den Schaltern bleiben verschlossen, bis eine bestätigte Übergabe sie öffnet.' },
  { id: 'kommandantur', art: 'kommandantur', title: 'Die Kommandantur · Wege und Befehle', intro: 'Auf dem Kartentisch stehen kleine Schiffsmarken; daneben liegen versiegelte Berichte aus der Grafschaft. Durch das Fenster sieht man die Hafenmasten. Ein Geleitgesuch, eine Entsendung oder die Nachricht von einem ausgebliebenen Schiff kann hier den nächsten Befehl bestimmen.' }
]);

export function buildTradingPost() {
  return { ...entry(POST_ID, 'Der Handelsposten der Klingenden Münze', 'Handel, Bank und Kompanie · das größte Kontor Celtigerns Wacht'), pages: [
    story('einordnung', 'Drei Gilden an einem Kai', 'handelsposten',
      '<p>Am Hafen von Gwynthor nimmt die <strong>Klingende Münze</strong> ganze Höfe und Häuserzüge ein. Lagerhallen stehen neben Schreibstuben, hinter den Bankschaltern werden Werte verwahrt, und in der Kommandantur gehen die Meldungen der Geleite ein. Zwischen den Gebäuden verkehren Kaufleute, Schreiber und die Mannschaften der Roten Kompanie. An der großen Werft der Gwlannor wird Schiffsraum gebaut und instand gesetzt.</p><p>Die Unternehmung reicht weit über Cenyr hinaus. In jeder Grafschaft unterhält sie mindestens einen großen Handelsposten. In diesen Kontoren treffen stets <strong>Kaufmannsgilde, Rote Bank und Rote Kompanie gemeinsam</strong> ein. Handel schafft Aufträge, die Bank hält Kapital und Zahlungswege bereit, die Kompanie sichert Waren und Wege nach vereinbartem Auftrag.</p><p>Gwynthor beherbergt den <strong>größten der vier großen Handelsposten Celtigerns Wacht</strong>. Von hier werden die gemeinsamen Belange der Grafschaft koordiniert. Acht mächtige Kaufmannssitze beraten am selben Tisch; fünf Interessenbünde ringen darum, wohin die nächste Fracht, das nächste Darlehen und der nächste Auftrag gehen.</p>',
      [['Ort', 'Gwynthor · Hafenkomplex'], ['Verbund', 'Klingende Münze · Rote Bank · Rote Kompanie'], ['Grafschaft', 'Vier große Handelsposten · Gwynthor als größter'], ['Oberste örtliche Leitung', 'Acht gleichrangige kaufmännische Ratssitze'], ['Bankleitung', 'Ergalla'], ['Kontor-Kommandantur', 'Falveri']]),
    story('verbund', 'Mitgliedschaft, Kapital und Grafschaft', 'ratssaal',
      '<p>Wer der <strong>Klingenden Münze</strong> beitritt, wird zugleich Mitglied der <strong>Roten Bank</strong> und erhält dort ein Konto. Für Unternehmer und Zunftsmeister eröffnet die Mitgliedschaft den Zugang zu Gildenpersonal und zu vertraglichen Diensten der <strong>Roten Kompanie</strong>. Ein Konto ist dabei noch keine Kreditzusage: Finanzierung, Beteiligung, Personal und Wachdienst werden nach dem jeweiligen Vorhaben vereinbart.</p><p>Der Handelsposten verbindet eigenständige Mitgliedsbetriebe mit gemeinsamen Einrichtungen. Waren gelangen über die Seehandelsnetze der Familien, aus dem Umland, aus vertraglich gebundenem Handwerk und über weitere Kontore an den Kai. Ein Teil wird nur gelagert oder vermittelt; ein anderer ist auf Rechnung einzelner Mitglieder eingekauft. Warenbestand, Eigentum und Lagerraum werden getrennt verzeichnet.</p><p>Kapital stammt aus Familienvermögen, Beteiligungen, laufenden Handelsgewinnen und vereinbarten Bankkrediten. Lagerung, Umschlag, Vertrieb, Frachtvermittlung, Bankleistungen und Geleit bringen jeweils eigene Erträge. Dass eine Ware im Gildenkomplex liegt, macht sie noch nicht zum gemeinsamen Besitz aller Mitglieder.</p><p>Der Achterrat bestimmt gemeinsame Vorhaben und Mittel. Die Bank führt ihre Bücher, die Kommandantur ihren militärischen Dienst. Neue regionale Niederlassungen erhalten alle drei Gilden zugleich; ihr zugewiesener Hauptmann arbeitet unter dem örtlichen Geschäftsauftrag und bleibt militärisch mit Gwynthor verbunden.</p>',
      COUNTY_POSTS.map(post => [post.name, post.function])),
    { schemaVersion: 1, commentThreadKey: 'muenze-kaufmannsgilde', pageTitle: 'Klingende Münze · Kaufmannsgilde', hierarchyPage: true, hierarchy: buildMerchantHierarchy() },
    { schemaVersion: 1, commentThreadKey: 'muenze-rote-bank', pageTitle: 'Rote Bank · Konten und Kapital', hierarchyPage: true, hierarchy: buildBankHierarchy() },
    { schemaVersion: 1, commentThreadKey: 'muenze-rote-kompanie', pageTitle: 'Rote Kompanie · Grafschaftskommando', hierarchyPage: true, hierarchy: buildCompanyHierarchy() },
    ...POST_SCENES.map(scene => ({ schemaVersion: 1, commentThreadKey: `muenze-szene-${scene.id}`, pageTitle: scene.title,
      ...image(scene.art), sessionPage: true, sessionIntro: `<p>${scene.intro}</p>`, sessionHint: 'Eine Begegnung im Handelsposten der Klingenden Münze.',
      sessionEmptyTitle: 'Der nächste Auftrag steht noch aus', sessionEmptyText: 'Ein Handel, eine Beratung oder eine Nachricht kann diese Szene eröffnen.', sessionDateAleria: { year: null, month: null, day: null } }))
  ] };
}

export function buildTradingPostFactions() {
  return { ...entry(FACTIONS_ID, 'Die fünf Interessenbünde', 'Falveri · Ergalla · Gwlannor · Halenrhyd · Aurdden & Loer'), pages: [
    story('interessen', 'Fünf Bünde, acht Stimmen', 'ratssaal',
      '<p>Die örtliche Macht der Klingenden Münze ruht auf fünf Interessenbünden. Die <strong>Falveri</strong> und <strong>Ergalla</strong> bringen ihre venalysischen See- und Bankverbindungen mit. In Gwynthor handeln örtliche Familienzweige für sie; die Hauptlinien bleiben in Venalys. Beide wollen die wirtschaftliche Verantwortung für die Grafschaft gewinnen.</p><p>Die cenyrischen Häuser verfügen über andere Grundlagen. <strong>Gwlannor</strong> baut Schiffe und vertritt Saethwyr-Interessen. <strong>Halenrhyd</strong> verbindet Rossausbildung und Viehhandel mit den Wyrm. <strong>Aurdden &amp; Loer</strong> verzahnen Juwelierhandwerk, Rohmaterial und Bankgeschäft; allein Loer besitzt die genannte Prägelizenz.</p><p>Keines dieser Lager kann den Handelsposten allein betreiben. Sie finanzieren, verfrachten, bewachen und beliefern einander. Die nächste gemeinsame Unternehmung kann eine bestehende Rivalität überdecken, während die Verteilung ihres Gewinns sie erneut aufbrechen lässt.</p><p>Weitere Mitglieder wie die <strong>Gwregysdu</strong>, <strong>Finlay Cneacail</strong> und <strong>Albrecht Sonnenfels</strong> besitzen eigene Geschäfte und Bindungen. Sie gehören zum Verbund, ohne dadurch einen zusätzlichen der fünf führenden Interessenbünde zu bilden.</p>',
      POST_FACTIONS.map(faction => [faction.name, `${faction.seats} Ratssitz${faction.seats === 1 ? '' : 'e'} · ${faction.liege}`])),
    ...POST_FACTIONS.map(faction => story(`familie-${faction.id}`, faction.title, faction.id === 'gwlannor' ? 'handelsposten' : 'ratssaal',
      `${faction.text}${faction.familyId ? `<p><a href="../Stammbäume/Stammbaum.html?family=${faction.familyId}&amp;mode=view">Den bestehenden Stammbaum ${faction.id === 'aurdden-loer' ? 'Loer' : faction.name} öffnen</a></p>` : ''}`,
      [['Herkunft', faction.origin], ['Bindung', faction.liege], ['Wirtschaftliche Grundlage', faction.holdings], ['Ziel', faction.ambition], ['Achterrat', `${faction.seats} gleichrangige Ratssitz${faction.seats === 1 ? '' : 'e'}`]]))
  ] };
}

export function tradingPostRegistrations() {
  return [buildTradingPost(), buildTradingPostFactions()].map(module => ({ ...POST_SECTION, description: POST_SECTION.desc, icon: POST_SECTION.iconUrl, entry: module }));
}
