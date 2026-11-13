import { buildTradingPostHierarchy } from '../guild-trading-post/trading-post-hierarchy.mjs';
import { RESALE_PEOPLE, RESALE_EMBLEM } from '../../../Stammbäume/assets/js/data/gwynthor-horse-resale/resale-family.mjs';
import { RESALE_ART } from './resale-catalog.mjs';
const role = (id, title, text, personId = '') => ({ id, title, text, personId });
export const RESALE_ROLES = Object.freeze([
  { id: 'leitung', label: 'Leitung und Kasse', roles: [
    role('ankauf', 'Inhaber und Ankauf', 'Ankaufspreise und verbindliche Zusagen festlegen, Vorbesitz prüfen, bekannte Mängel benennen und den kleinen Betrieb vertreten.', 'brannoc-ruddgraen'),
    role('kasse', 'Kasse und Hofhaushalt', 'Zahlungen, Futterbestellungen, laufende Rechnungen und Haushaltsvorräte führen; Kauf- und Verkaufszettel geordnet ablegen.', 'edryssa-ruddgraen')] },
  { id: 'handel', label: 'Ankauf und Verkauf', roles: [
    role('pruefung', 'Pferdeprüfung beim Ankauf', 'Gang, Hufe, erkennbare Beschwerden und Gewöhnung beobachten. Unsichere Befunde fachlich klären lassen; aus Vermutungen keinen Zuchtnachweis ableiten.', 'telynna-ruddgraen'),
    role('verkauf', 'Verkauf und Kaufzettel', 'Kunden beraten, Einzelpferde eindeutig zuordnen, Preise und Übergabe festhalten und offene Herkunftsangaben ausdrücklich kenntlich machen.', 'rhonessa-ruddgraen'),
    role('vorstellung', 'Pferdevorstellung und Gewöhnung', 'Pferde im Hof führen und vorführen, Halten und ruhigen Umgang üben, Eignung und beobachtete Eigenheiten für die Beratung dokumentieren.', 'elvynna-ruddgraen')] },
  { id: 'stall', label: 'Stall und Hof', roles: [
    role('stallhilfe', 'Stallhilfe in Ausbildung', 'Unter Aufsicht ausmisten, einstreuen, Wasser und vorbereitete Futterrationen bereitstellen sowie sichere Handgriffe beim Führen lernen.', 'bedryn-ruddgraen'),
    role('abenddienst', 'Abendkontrolle und Hofverschluss', 'Tore, Tränken, Feuerstellen und Stallruhe kontrollieren. Die Aufgabe wird im Familienhaushalt verteilt; kein zusätzlicher fest angestellter Wachmann ist zugesagt.')] },
  { id: 'fachbesuche', label: 'Fachbesuche nach Bedarf', roles: [
    role('hufpflege', 'Beauftragter Hufschmied', 'Bei vereinbarten Besuchen Hufe prüfen, bearbeiten und erforderliche Beschläge ausführen. Externer Handwerksauftrag, keine eigene Werkstatt.'),
    role('rossarzt', 'Beauftragter Rossarzt', 'Unklare Gesundheitsbefunde und Behandlungsbedarf fachlich beurteilen. Externer Besuch nach Absprache, keine ständig besetzte Stelle.')] }
]);
export function buildResaleHierarchy() {
  return buildTradingPostHierarchy({ title: 'Zum Schiefen Nagel · Familienbetrieb', subtitle: 'Kleiner Pferdehandel · sechs helfende Familienangehörige', emblem: RESALE_EMBLEM,
    sideImage: `${RESALE_ART}/scenes/ruddgraen-stall-v1.png`, motto: 'Ankaufen · Prüfen · Weiterverkaufen',
    description: '<p>Der Familienhaushalt trägt den täglichen Betrieb. Fachbesuche werden nach Bedarf beauftragt. Es gibt weder eigene Zucht noch Sattlerei.</p>',
    trees: RESALE_ROLES.map(group => ({ id: `ruddgraen-${group.id}`, label: group.label, parentTreeId: group.id === 'leitung' ? '' : 'ruddgraen-leitung',
      levels: [{ label: group.label, nodes: group.roles.map(r => { const p = RESALE_PEOPLE.find(p => p.id === r.personId); return {
        id: `ruddgraen-rolle-${r.id}`, title: r.title, subtitle: p ? `Besetzt: ${p.name}` : group.id === 'fachbesuche' ? 'Externer Rollenplatz · noch nicht benannt' : 'Geteilte Familienaufgabe',
        portrait: p?.portrait || '../Stammbäume/assets/images/placeholders/male.png', ...(p ? { characterId: p.worldPersonId } : {}), text: `<p>${r.text}</p>`
      }; }) }] })), details: [{ label: 'Ort', value: 'Gwynthor-Stadt' }, { label: 'Angebot', value: 'Angekaufte Gebrauchsmischlinge' }],
    chartTitle: 'Aufgaben im kleinen Betrieb', chartIntro: 'Die Rollen beschreiben Verantwortlichkeiten. Fachleute und geteilte Dienste sind keine zusätzlich angelegten Figuren.',
    footerNote: 'Keine Zuchtabteilung, keine Sattlerei und kein eigener Landbetrieb.' });
}
