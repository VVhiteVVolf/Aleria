import { buildTradingPostHierarchy } from '../guild-trading-post/trading-post-hierarchy.mjs';
import { STUD_ART } from './stud-catalog.mjs';
const role = (id, title, count, text, options = {}) => ({ id, title, count, text, ...options });
const groups = [
  ['leitung', 'Leitung', [
    role('direktion', 'Gesamtleitung', 1, 'Wirtschaftliche und fachliche Verantwortung, große Verträge, Personalauswahl und verbindliche Vertretung des Betriebs.', { principal: 'owner' }),
    role('verwaltung', 'Hofverwaltung und Finanzen', 1, 'Rechnungen, Zahlungsfristen, Bestandsbücher, Löhne und vereinbarte Beteiligungen prüfen; Hof- und Pferdeeigentum getrennt nachweisen.', { principal: 'wife' })]],
  ['kontor', 'Verwaltung und Verträge', [
    role('kontorleitung', 'Kontorleitung', 1, 'Arbeitsabläufe, Termine und Korrespondenz zusammenführen; der Gesamtleitung prüffähige Unterlagen vorlegen.'),
    role('vertragsschreiber', 'Vertragsschreiber', 1, 'Kauf-, Pacht- und Aufzuchtvereinbarungen ausfertigen; Zustimmung des zuständigen Lehnsherrn und vereinbarte Anteile festhalten.'),
    role('buchhaltung', 'Buchführung', 1, 'Einnahmen, Ausgaben, Lieferungen und getrennte Eigentumsanteile in nachvollziehbaren Büchern führen.'),
    role('kontorlehrling', 'Kontorlehrling', 1, 'Lesen, Rechnen, Abschriften und geordnete Ablage unter Aufsicht lernen.')]],
  ['verkauf', 'Ankauf und Verkauf', [
    role('verkaufsleitung', 'Verkaufsleitung', 1, 'Ankäufe und Vorstellungen abstimmen; Preise, Eignung und vollständige Übergabeunterlagen verantworten.'),
    role('rosspruefer', 'Rossprüfer', 1, 'Alter, Gebäude, Umgang, Ausbildung und Herkunft beurteilen; unsichere Abstammungen als solche kennzeichnen.'),
    role('rosshaendler', 'Pferdehändler', 2, 'Kunden beraten, Tiere vorstellen und Angebote innerhalb der vereinbarten Preis- und Vertragsgrenzen verhandeln.'),
    role('vorfuehrer', 'Pferdevorführer', 1, 'Tiere sicher führen und auf dem Vorführplatz zeigen; Probiertermine mit den Bereitern abstimmen.'),
    role('verkaufslehrling', 'Lehrling im Pferdehandel', 1, 'Herkunftspapiere, Beratung und sichere Pferdevorstellung unter Aufsicht lernen.')]],
  ['zucht', 'Zucht und Aufzucht', [
    role('zuchtmeister', 'Zuchtmeister', 1, 'Zuchtziele, Paarungen und gesunde Aufzucht fachlich leiten; belegte Linien von unbekannter Abstammung trennen.'),
    role('zuchtbuch', 'Zuchtbuchführung', 1, 'Eltern, Geburten, Eigentumsanteile und Entwicklungsbeobachtungen der einzelnen Pferde dokumentieren.'),
    role('stutenpflege', 'Stuten- und Fohlenpfleger', 2, 'Zuchtstuten und Fohlen versorgen; Beobachtungen und auffällige Veränderungen an die Fachleitung melden.'),
    role('zuchtlehrling', 'Lehrling in Zucht und Aufzucht', 1, 'Fütterung, Gewöhnung, Dokumentation und sicheren Umgang mit Jungtieren unter enger Aufsicht lernen.')]],
  ['bereitung', 'Bereitung und Ausbildung', [
    role('bereitungsmeister', 'Bereitungsmeister', 1, 'Ausbildungsstand und Belastung planen; sichere Übergänge von Bodenarbeit zum Reiten und zur späteren Verwendung verantworten.'),
    role('bodenarbeit', 'Ausbilder für Bodenarbeit', 2, 'Jungpferde behutsam an Führen, Berührung, Geräusche und verständliche Signale gewöhnen.'),
    role('bereiter', 'Bereiter', 2, 'Geeignete Pferde anreiten und weiter ausbilden; Hilfen, Gelände und Arbeitsaufgaben dem Tier anpassen.'),
    role('bereiterlehrling', 'Bereiter in Ausbildung', 2, 'Pflege, Bodenarbeit und geeignete Reitaufgaben unter Anleitung üben; keine eigenständige Arbeit mit schwierigen Tieren.')]],
  ['stall', 'Stall, Weiden und Pferdegesundheit', [
    role('stallmeister', 'Stallmeister', 1, 'Stalldienst, Futterrationen, sichere Belegung und Absonderung neu eingetroffener Tiere koordinieren.'),
    role('stallpflege', 'Pferdepfleger', 3, 'Fütterung, Tränken, Einstreu und tägliche Fell- und Hufkontrolle nach dem vereinbarten Pflegeplan durchführen.'),
    role('weidehirt', 'Weidehirten', 2, 'Weidegruppen beaufsichtigen, Einfriedungen prüfen und Tiere sicher zwischen Stall und Weide führen.'),
    role('futterwart', 'Futterwart', 1, 'Heu, Hafer und weitere Vorräte trocken lagern; Qualität, Ausgaben und Nachlieferungen kontrollieren.'),
    role('rossarzt', 'Rossarzt · vertragliche Fachstelle', 1, 'Gesundheitliche Beurteilung und Behandlung nach Fachkunde übernehmen; nicht im Tagesdienst erforderliche Besuche abstimmen.', { contract: true }),
    role('stalllehrling', 'Lehrlinge in Pferdepflege', 2, 'Tägliche Pflege und sichere Stallarbeit unter Aufsicht lernen.')]],
  ['sattlerei', 'Sattlerei und Hufschmiede', [
    role('sattlermeister', 'Sattlermeister', 1, 'Passform, Sattelbäume, Materialauswahl und Qualität fertiger Lederarbeiten verantworten.'),
    role('sattlergeselle', 'Sattlergesellen', 2, 'Sättel und Taschen fertigen, Polster anpassen und angenommene Reparaturen fachgerecht ausführen.'),
    role('riemer', 'Riemer', 1, 'Zaumzeug, Halfter, Gurte und Führriemen zuschneiden, vernähen und auf sichere Verbindung prüfen.'),
    role('sattlerlehrling', 'Sattlerlehrlinge', 2, 'Lederpflege, Zuschnitt, Nähen und Werkzeuggebrauch unter Anleitung lernen.'),
    role('hufschmied', 'Hufschmied', 1, 'Hufe pflegen und geeignete Beschläge anpassen; Beschlag und Gang mit Pflege- und Ausbildungsleitung abstimmen.'),
    role('schmiedgehilfe', 'Schmiedgehilfe', 1, 'Feuer, Material und Werkzeuge vorbereiten; bei Beschlägen und einfachen Eisenarbeiten unterstützen.'),
    role('schmiedlehrling', 'Schmiedlehrling', 1, 'Sicheren Umgang mit Feuer, Eisen und Werkstattgerät unter Aufsicht lernen.')]],
  ['versorgung', 'Versorgung, Fuhrwesen und Hausdienst', [
    role('fuhrmann', 'Fuhrleute', 2, 'Futter, Waren und vereinbarte Übergaben transportieren; Ladung, Routen und Ankunftsbelege prüfen.'),
    role('lager', 'Lagerwart', 1, 'Leder, Wolle, Eisen und Betriebsbedarf getrennt lagern und den Werkstätten nachvollziehbar ausgeben.'),
    role('koch', 'Hofküche', 1, 'Mahlzeiten für den vereinbarten Personalbedarf planen und zubereiten.'),
    role('hausdienst', 'Reinigung und Wäsche', 2, 'Kundenräume, Arbeitswäsche und gemeinschaftliche Flächen pflegen; saubere und verschmutzte Bereiche trennen.'),
    role('bote', 'Bote und Lieferbegleiter', 1, 'Versiegelte Schreiben und vereinbarte kleine Lieferungen mit Empfangsnachweis überbringen.')]],
  ['wache', 'Wachpersonal', [
    role('wachmeister', 'Wachmeister', 1, 'Wachpläne, Schlüssel und Meldungen führen; Schutzdienst mit der Betriebsleitung abstimmen.'),
    role('torwache', 'Tor- und Hofwächter', 2, 'Zugänge und bestätigte Tierübergaben überwachen; fremde Personen an die zuständige Stelle verweisen.'),
    role('nachtwache', 'Nachtwächter', 2, 'Stallungen und Vorräte in verabredeten Rundgängen kontrollieren und bei Feuer, Unruhe oder unbefugtem Zutritt Alarm geben.')]]
];
export function studDepartments(venue) {
  const local = groups.map(([id, label, roles]) => ({ id, label, roles: roles.map(r => ({ ...r })) }));
  local.push(venue.key === 'halenrhyd' ? { id: 'futterhof', label: 'Eigener Bauern- und Futterhof', roles: [
    role('hofmeister', 'Hofleitung', 1, 'Futteranbau, Getreide, Vieh und Lieferungen der eigenen Landwirtschaft planen.'),
    role('ackerbau', 'Ackerbau und Heuernte', 3, 'Felder bestellen, Futter schneiden und Ernte nach Qualität und Verwendung einlagern.'),
    role('viehhaltung', 'Viehhaltung', 2, 'Hofvieh versorgen und Futterbedarf sowie geplante Abgaben mit der Hofleitung abstimmen.'),
    role('vorratshof', 'Saatgut und Hofvorräte', 1, 'Saatgut, Gemüse, Getreide und verarbeitete Vorräte führen; Lieferungen an die Gestüte verzeichnen.')
  ] } : { id: 'partner', label: 'Partnerhöfe und Gildenwege', roles: [
    role('partnermeister', 'Koordination der Partnerhöfe', 1, 'Aufzuchtbetriebe besuchen und Investitionen, Leistungen sowie Zustimmung der Lehnsherren gemeinsam abstimmen.'),
    role('zuchtberater', 'Reisende Zuchtberater', 2, 'Partner bei Zucht, Weidehaltung und Ausbildung fachlich begleiten; die Leitung des eigenständigen Hofs bleibt beim Betreiber.'),
    role('tiertransport', 'Tiertransport und Übergaben', 2, 'Sichere Gildenwege, Ruhezeiten und eindeutige Übergaben der vereinbarten Tiere organisieren.')
  ] });
  return local;
}
export function buildStudHierarchy(venue, people) {
  const departments = studDepartments(venue);
  // The existing hierarchy template supports eight tabs. Related departments
  // share a tab but retain separate levels and every individual role.
  const tabs = [['leitung', 'Leitung und Verwaltung', ['leitung', 'kontor']], ['verkauf', 'Ankauf und Verkauf', ['verkauf']],
    ['zucht', 'Zucht und Ausbildung', ['zucht', 'bereitung']], ['stall', 'Stall und Pferdegesundheit', ['stall']],
    ['sattlerei', 'Sattlerei und Hufschmiede', ['sattlerei']], ['versorgung', 'Versorgung und Hausdienst', ['versorgung']],
    ['wache', 'Wachpersonal', ['wache']], [departments.at(-1).id, departments.at(-1).label, [departments.at(-1).id]]];
  const trees = tabs.map(([id, label, departmentIds]) => ({ id: `${venue.key}-${id}`, label, parentTreeId: id === 'leitung' ? '' : `${venue.key}-leitung`,
    levels: departmentIds.map(departmentId => { const group = departments.find(d => d.id === departmentId); return { label: group.label, nodes: group.roles.map(r => {
      const person = r.principal ? people.find(p => p.id === (r.principal === 'owner' ? venue.ownerId : venue.wifeId)) : null;
      return { id: `${venue.key}-stelle-${r.id}`, title: r.title, subtitle: `${r.count} ${r.count === 1 ? 'Stelle' : 'Stellen'} · ${person ? `Besetzt: ${person.name}` : 'Unbesetzter Rollenplatz'}`,
        portrait: person?.portrait || '../Stammbäume/assets/images/placeholders/male.png', ...(person ? { characterId: person.worldPersonId } : {}), text: `<p>${r.text}</p>` };
    }) }; }) }));
  return buildTradingPostHierarchy({ title: `${venue.title} · Rossbetrieb`, subtitle: 'Stellen und Verantwortlichkeiten · später einzeln besetzbar', emblem: venue.emblem,
    sideImage: `${STUD_ART}/scenes/${venue.key}-stall-v1.png`, motto: 'Pferdekenntnis · Herkunft · Verlässlichkeit',
    description: '<p>Die Abteilungen bilden den gesamten Rossbetrieb mit seinen Außenbeziehungen ab. Jede Karte beschreibt die Rolle und die vorgesehene Stellenzahl. Silhouetten sind unbesetzte Rollenplätze; daraus entstehen keine zusätzlichen Figuren.</p>',
    trees, details: [{ label: 'Ort', value: 'Gwynthor-Stadt und zugehörige Betriebswege' }, { label: 'Verantwortung', value: venue.connections }],
    chartTitle: 'Abteilungen und Rollen', chartIntro: 'Verwaltung, Handel, Zucht, Ausbildung, Handwerk, Versorgung und Schutz.',
    footerNote: 'Vorgesehene Rollen und Stellenzahlen sind Organisationsplanung. Die beiden benannten Leitungsrollen sind davon ausdrücklich unterschieden.' });
}
