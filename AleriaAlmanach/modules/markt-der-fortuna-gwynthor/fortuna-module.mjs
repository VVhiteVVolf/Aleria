import { FORTUNA_ART, FORTUNA_SECTION, FORTUNA_SYMBOLS } from './fortuna-section.mjs';
import { FORTUNA_FACTIONS } from './fortuna-factions.mjs';
import { FORTUNA_BUSINESSES, FORTUNA_EXTERNAL_RELATIONS } from './fortuna-network.mjs';
import { buildFortunaMarketHierarchy } from './fortuna-market-hierarchy.mjs';
import { buildFortunaBankHierarchy } from './fortuna-bank-hierarchy.mjs';
import { buildFortunaCompanyHierarchy } from './fortuna-company-hierarchy.mjs';
import { buildMarielsGabeHierarchy } from './fortuna-mariel-hierarchy.mjs';

export const FORTUNA_POST_ID = 'gwynthor-handelshof-markt-der-fortuna';
export const FORTUNA_FACTIONS_ID = 'gwynthor-fortuna-interessenbuende';
const art = id => ({ image: `${FORTUNA_ART}/${id}.png`, imageWidth: 34, imageTall: true, imageFit: 'cover', imagePosition: 'center' });
const story = (id, pageTitle, image, description, stats = []) => ({ schemaVersion: 1, commentThreadKey: `fortuna-${id}`, pageTitle, ...art(image), description, stats });
const module = (id, title, subtitle) => ({ id, title, subtitle, type: 'Handelsgilde und Gildenverbund', category: 'Gwynthor · Fortuna-Hafen', icon: '◈',
  symbol: FORTUNA_SYMBOLS.market, image: `${FORTUNA_ART}/handelshof.png`, previewImage: `${FORTUNA_ART}/handelshof.png`,
  stamp: 'MARKT DER FORTUNA · GWYNTHOR', schemaVersion: 1, multipage: true, appendCommentsPage: true, enablePageComments: true, sessionCast: [] });
export const FORTUNA_SCENES = Object.freeze([
  { id: 'handelshof', title: 'Der alte Handelshof · Unter den Arkaden', intro: 'Unter den Arkaden warten Kaufleute auf bestätigte Warenbriefe. Vom Kai dringen das Knarren von Tauen und die Rufe der Lademeister herüber. Die lange gebrauchten Wege führen zu Lagerhäusern, Schreibstuben und dem Zugang zur Bank.' },
  { id: 'ratssaal', title: 'Der Ratssaal · Neun Stimmen', intro: 'Neun gleichrangige Plätze stehen um den Tisch. Hinter den Fenstern ziehen Masten an den hellen Himmel; auf dem Holz liegen Warenmuster und versiegelte Briefe. Ein altes Recht, ein neuer Auftrag oder eine verspätete Fahrt kann die nächste Beratung bestimmen.' },
  { id: 'bankhalle', title: 'Die Blaue Bank · Zwischen Waage und Buch', intro: 'Hinter den Schaltern werden Münzen gewogen und Einträge verglichen. Die Wartenden halten ihre Belege bereit. Eine zugesagte Zahlung, ein vorgelegtes Pfand oder eine unerwartete Nachricht vom Hafen kann hier den Lauf eines Geschäftes ändern.' },
  { id: 'kommandantur', title: 'Die Blaue Kompanie · Vor der Ausfahrt', intro: 'Auf dem Kartentisch liegen Fahrtrouten und versiegelte Meldungen. Kleine Schiffsmarken bezeichnen bereitstehende Geleite; durch das Fenster sieht man die Masten am Kai. Ein Kapitän, ein Bote oder ein Kaufmann mit dringendem Schutzbedarf wird angekündigt.' },
  { id: 'tafel-der-mutter', title: 'Die Tafel der Mutter · Der nächste Korb', intro: 'In der kleinen Annahmestube stehen Körbe auf dem Scheuertisch. Brot und Gemüse werden geprüft, verteilt und für die nächsten Übergaben verpackt. Vor der Tür wartet der Handwagen; am Kai kann bereits eine weitere rechtzeitige Abgabe eintreffen.' }
]);

export function buildFortunaTradingPost() {
  return { ...module(FORTUNA_POST_ID, 'Der Handelshof des Marktes der Fortuna', 'Alte Fahrten, gewachsene Bindungen · Handel und Handwerk in Gwynthor'), pages: [
    story('einordnung', 'Ein Hafen voller alter Verbindungen', 'handelshof',
      '<p>Am <strong>Fortuna-Hafen</strong> tragen die Wege zwischen Kai, Arkaden und Schreibstuben die Spuren vieler Generationen. Hier treffen Waren von See auf Kaufleute und Handwerker Gwynthors. Fässer werden geprüft, Stoffballen weitergegeben und neue Fahrten vorbereitet. Die Schiffe der Falto gehören so lange zum Stadtbild, dass ihre Ankunft längst Teil der Gewohnheit des Hafens ist.</p><p>Der <strong>Markt der Fortuna</strong> verbindet seine Kaufmannschaft mit der <strong>Blauen Bank</strong> und der <strong>Blauen Kompanie</strong>. Kapital, Schiffsraum und Schutz werden zusammengeführt, während die angeschlossenen Familienbetriebe eigene Besitzer und Leitungen behalten.</p><p>Sieben Interessenbünde halten neun gleichrangige Sitze im örtlichen Rat. Die venalysischen <strong>Falto</strong> und <strong>Nerva</strong> ringen um die Vormacht; fünf cenyrische Häuser sichern ihren Einfluss durch Handel, Fassbau, Schiffbau, Schmiede und Schneiderei. Beide venalysischen Häuser dienen den Vinicius. Aelmor wahrt die Interessen der Saethwyr.</p><p>Eine kleine Stelle von <strong>Mariels Gabe</strong> unterhält hier die <strong>Tafel der Mutter</strong>. Wenn die Weisenfluher Kaufmannsgilde mit Waren nach Gwynthor kommt, laufen ihre Schiffe den Fortuna-Hafen an.</p>',
      [['Ort', 'Gwynthor · alter Fortuna-Hafen und Handelshof'], ['Führung', 'Neunerrat · sieben Interessenbünde'], ['Verbund', 'Markt der Fortuna · Blaue Bank · Blaue Kompanie'], ['Bankleitung', 'Falto'], ['Kontor-Kommandantur', 'Nerva'], ['Kleine Untergildenstelle', 'Mariels Gabe · Tafel der Mutter']]),
    story('wirtschaft', 'Vom Schiffsraum bis zur Werkstatt', 'ratssaal',
      '<p>Der Handelshof lebt von <strong>gewachsenen Bezugswegen</strong>. Falto verbindet Handelsflotte und Bankwesen; Nerva bringt Schiffe, Metallhandwerk und militärische Seefahrt ein. Tonnarth vermittelt und vertreibt Waren. Braglas liefert die Gebinde, Aelmor den kaufmännischen Schiffsraum, Coeddu Schmiedearbeit und Maerllys Bekleidung und Stoffverarbeitung.</p><p>Familienvermögen, laufende Gewinne und vereinbarte Bankfinanzierung ermöglichen Einkauf und Fahrt. Nicht jede Ware gehört dem Handelshof: Eigentum, Verwahrung und Vermittlung werden getrennt verzeichnet. Ein angeschlossener Laden kann Fortuna als Lieferanten nutzen und dennoch selbständig bleiben.</p><p>Das gilt auch für die bekannten Betriebe. <strong>Brenn Vann</strong> ist Mitglied und Verbündeter. Das Haus <strong>Raves</strong> pflegt eine Handelskooperation, <strong>Cadwgan und Idwal Pendrwn</strong> eine regelmäßige Lieferbeziehung. Jede Verbindung wird nach ihrem tatsächlichen Umfang geführt; einzelne Bank- und Kreditverträge bleiben eigene Vereinbarungen.</p><p>Die <strong>Weisenfluher</strong> Warenankünfte von Mariels Gabe nutzen den Hafen des übergeordneten Marktes. Ihre kleine ständige Stelle kümmert sich vor allem um die rechtzeitige Weitergabe genießbarer Lebensmittelüberschüsse. Sie erhält keinen eigenen Sitz unter den sieben führenden Familien.</p>',
      [['Handel', 'Seeverbindungen · örtliche Kaufmannschaft · Umland'], ['Herstellung', 'Fässer · Handelsschiffe · Metallwaren · Bekleidung'], ['Finanzierung', 'Familienkapital · Ertrag · vereinbarte Bankmittel'], ['Verbindungen', 'Mitgliedschaft, Handelskooperation und Belieferung jeweils gesondert']]),
    { schemaVersion: 1, commentThreadKey: 'fortuna-marktgilde', pageTitle: 'Markt der Fortuna · Kaufmannschaft', hierarchyPage: true, hierarchy: buildFortunaMarketHierarchy() },
    { schemaVersion: 1, commentThreadKey: 'fortuna-blaue-bank', pageTitle: 'Blaue Bank · Bücher und Kapital', hierarchyPage: true, hierarchy: buildFortunaBankHierarchy() },
    { schemaVersion: 1, commentThreadKey: 'fortuna-blaue-kompanie', pageTitle: 'Blaue Kompanie · Kontor-Kommandantur', hierarchyPage: true, hierarchy: buildFortunaCompanyHierarchy() },
    { schemaVersion: 1, commentThreadKey: 'fortuna-mariels-gabe', pageTitle: 'Mariels Gabe · Tafel der Mutter', hierarchyPage: true, hierarchy: buildMarielsGabeHierarchy() },
    ...FORTUNA_SCENES.map(scene => ({ schemaVersion: 1, commentThreadKey: `fortuna-szene-${scene.id}`, pageTitle: scene.title, ...art(scene.id), sessionPage: true,
      sessionIntro: `<p>${scene.intro}</p>`, sessionHint: 'Eine Begegnung am Handelshof des Marktes der Fortuna.', sessionEmptyTitle: 'Der nächste Weg beginnt am Kai',
      sessionEmptyText: 'Eine Ankunft, ein Handel oder eine Übergabe kann hier beginnen.', sessionDateAleria: { year: null, month: null, day: null } }))
  ] };
}

export function buildFortunaFactions() {
  return { ...module(FORTUNA_FACTIONS_ID, 'Fortunas Häuser und Verbindungen', 'Sieben führende Interessenbünde · die bereits gewachsenen Partner'), pages: [
    story('interessen', 'Sieben Häuser, neun Stimmen', 'ratssaal',
      '<p>Die Vormacht im Gwynthorer Markt der Fortuna wird zwischen den <strong>Falto</strong> und <strong>Nerva</strong> ausgefochten. Beide sind venalysische Magnarierhäuser unter den <strong>Vinicius</strong>; beide verfügen hier über seit Jahrhunderten gewachsene Interessen. Falto ist länger im Hafen verwurzelt, Nerva hat sich durch militärische Seefahrt, Metallhandwerk und Schiffbau groß gemacht.</p><p>Die fünf cenyrischen Häuser halten eigene Sitze. <strong>Tonnarth</strong> steht für Kaufmannschaft, <strong>Braglas</strong> für Böttcherei, <strong>Aelmor</strong> für Handelsschiffe, <strong>Coeddu</strong> für Schmiede und <strong>Maerllys</strong> für Schneiderei. Bei Aelmor wirkt die Bindung an Saethwyr in den Rat hinein.</p><p>Verwandtschaft und Lieferverträge reichen über diesen Kreis hinaus. Vann, Raves und Pendrwn führen bekannte örtliche Betriebe; die Veltrane-Route erschließt den Raves den südlichen Stoffhandel. Daraus entstehen Partner und Ansprechpartner, ohne dass jede Verbindung einen eigenen Ratssitz verlangt.</p>',
      FORTUNA_FACTIONS.map(f => [f.name, `${f.seats} Ratssitz${f.seats === 1 ? '' : 'e'} · ${f.liege}`])),
    ...FORTUNA_FACTIONS.map(f => story(`haus-${f.id}`, `${f.name} · ${f.business}`, f.art,
      f.text + (f.familyId ? `<p><a href="../Stammbäume/Stammbaum.html?family=${f.familyId}&amp;mode=view">Stammbaum des Hauses ${f.name}</a></p>` : ''),
      [['Herkunft', f.origin], ['Bindung', f.liege], ['Wirtschaft', f.business], ['Neunerrat', `${f.seats} gleichrangige Ratssitz${f.seats === 1 ? '' : 'e'}`]])),
    story('partnernetz', 'Die gewachsenen Verbindungen', 'handelshof',
      FORTUNA_BUSINESSES.map(p => `<p><strong>${p.family} · ${p.business}:</strong> ${p.text} ${p.relation}.${p.bank ? ` ${p.bank}.` : ''}</p>`).join('') +
      FORTUNA_EXTERNAL_RELATIONS.map(p => `<p><strong>${p.name} · ${p.region}:</strong> ${p.text}</p>`).join(''),
      [['Örtliche Betriebe', 'Vann · Raves · Cadwgans Pendrwn-Zweig'], ['Anbindung nach Tirnara', 'Veltrane · über die Raves']])
  ] };
}

export function fortunaRegistrations() {
  return [buildFortunaTradingPost(), buildFortunaFactions()].map(entry => ({ ...FORTUNA_SECTION, icon: FORTUNA_SECTION.iconUrl, description: FORTUNA_SECTION.desc, entry }));
}
