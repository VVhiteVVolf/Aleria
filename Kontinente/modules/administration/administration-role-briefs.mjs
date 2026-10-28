import militaer from './data/militaer-briefs.mjs';
import klerus from './data/klerus-briefs.mjs';
import gerichtsbarkeit from './data/gerichtsbarkeit-briefs.mjs';
import finanzen from './data/finanzen-briefs.mjs';
import spionage from './data/spionage-briefs.mjs';
import diplomatie from './data/diplomatie-briefs.mjs';
import magie from './data/magie-briefs.mjs';
import unterhaltung from './data/unterhaltung-briefs.mjs';
import { brief } from './office-duty-icons.mjs';

export const ADMINISTRATION_ROLE_BRIEFS = Object.freeze({ militaer, klerus, gerichtsbarkeit, finanzen, spionage, diplomatie, magie, unterhaltung });

// Territorial officeholders retain their own jurisdiction. These describe their
// connection to the county, without copying county powers into a vassal's office.
const territorial = {
  militaer: brief('Die örtliche Militärführung hält Bereitschaft, Schutzaufträge und Versorgung ihrer Herrschaft zusammen. Grafschaftsweite Vorhaben werden mit der übergeordneten Marschallführung abgestimmt. Der eigene Lehnsherr bleibt für die Herrschaft verantwortlich; überörtliche Weisungen und benötigte Unterstützung müssen im Dienstweg erkennbar bleiben.',
    ['command', 'Örtliche Bereitschaft und beauftragte Schutzaufgaben führen.'], ['coordination', 'Grafschaftsweite Vorhaben mit der Marschallführung abstimmen.'], ['records', 'Lage, verfügbare Kräfte und benötigte Unterstützung melden.']),
  klerus: klerus.vassal,
  gerichtsbarkeit: brief('Die örtliche Justiz bleibt im eigenen Herrschaftsbereich erreichbar und führt dort zuständige Verfahren. Übergreifende Streitigkeiten, offene Zuständigkeiten und erforderliche Berichte gehen an die Grafschaftsjustiz. Eine eigene örtliche Gerichtsstelle bildet keine von der übergeordneten Rechtsordnung losgelöste Instanz.',
    ['judgment', 'Zuständige örtliche Rechtssachen geordnet bearbeiten.'], ['records', 'Verfahren und Entscheidungen nachvollziehbar dokumentieren.'], ['coordination', 'Übergreifende Fragen dem Justiziar der Grafschaft vorlegen.']),
  finanzen: brief('Die örtliche Finanzverwaltung hält Einnahmen, bewilligte Ausgaben und Lieferpflichten der eigenen Herrschaft zusammen. Für die Grafschaft müssen zugesagte Abgaben und tatsächliche Rechnungen vergleichbar bleiben. Strittige Forderungen werden geklärt; die örtliche Kasse verfügt nicht aus eigener Entscheidung über den Schatz der Grafschaft.',
    ['money', 'Den örtlichen Haushalt und bestätigte Zahlungen verwalten.'], ['records', 'Abgaben und Rechnungen der Grafschaft prüffähig vorlegen.'], ['supplies', 'Fällige Lieferpflichten und erkennbare Fehlmengen abstimmen.']),
  spionage: brief('Die örtliche Nachrichtenstelle sammelt und prüft Hinweise aus ihrem Herrschaftsbereich. Sie gibt grafschaftsrelevante Befunde an die übergeordnete Schattenführung, ohne unnötig Quellen offenzulegen. Herkunft und Unsicherheit einer Meldung bleiben sichtbar. Ein örtlicher Verdacht schafft weder einen Schuldspruch noch eine unbegrenzte Zugriffsvollmacht.',
    ['inquiry', 'Örtliche Hinweise nach Herkunft und Verlässlichkeit prüfen.'], ['secrecy', 'Quellen und vertrauliche Meldungen geschützt behandeln.'], ['coordination', 'Grafschaftsrelevante Befunde an den Schatten weitergeben.']),
  diplomatie: brief('Der örtliche Herold vertritt die Stimme seines eigenen Hofes im erteilten Mandat. Berühren Zusagen andere Herrschaften oder Pflichten gegenüber der Grafschaft, stimmt er sie mit der übergeordneten Heroldsführung ab. Ansprechpartner, Vollmacht und Wortlaut bleiben erkennbar; eine örtliche Erklärung bindet nicht automatisch die gesamte Grafschaft.',
    ['diplomacy', 'Beauftragte Kontakte und förmliche Erklärungen des eigenen Hofes führen.'], ['records', 'Vollmachten und eingegangene Verpflichtungen festhalten.'], ['coordination', 'Übergreifende Zusagen mit dem Herold der Grafschaft abstimmen.']),
  magie: brief('Der örtliche Ratsmagier berät seine Herrschaft in den tatsächlich anvertrauten arkanen Fragen. Erkenntnisse mit Bedeutung über den eigenen Hof hinaus werden mit der Ratsmagie der Grafschaft abgestimmt. Die eigene Stellung und etwaige persönliche Dienste bleiben bestehen. Die Zusammenarbeit richtet sich nach dem konkreten Auftrag und der tatsächlichen Befähigung des jeweiligen Ratsmagiers.',
    ['learning', 'Den eigenen Hof zu anvertrauten arkanen Fragen beraten.'], ['inquiry', 'Erkenntnisse und ihre Grenzen nachvollziehbar mitteilen.'], ['coordination', 'Übergreifende Gefahren mit der Ratsmagie der Grafschaft abstimmen.']),
  unterhaltung: brief('Der örtliche Hofdienst gestaltet die ihm anvertrauten Anlässe und öffentlichen Auftritte. Gemeinsame Feiern, Ausrufe oder Ehrungen werden mit der Grafschaft abgestimmt, damit Rang, Wortlaut und Ablauf zusammenpassen. Örtliche Gestaltung bleibt möglich; Kosten, rechtliche Bekanntgaben und politische Zusagen benötigen die jeweils zuständige Freigabe.',
    ['hospitality', 'Beauftragte Anlässe des eigenen Hofes gestalten.'], ['proclamation', 'Freigegebene öffentliche Beiträge und Ausrufe vorbereiten.'], ['coordination', 'Gemeinsame Auftritte mit dem zuständigen Grafschaftsamt abstimmen.']),
};

const serviceForms = { leadership: 'Leitung', adjutant: 'Persönlicher Leitungsdienst', vassals: 'Örtliches Fachamt', core: 'Gleichrangiges Kernamt', special: 'Abgegrenzter Sonderauftrag', service: 'Fach- und Ausführungsdienst' };

export function administrationRoleBrief({ role, group, area }) {
  const catalog = ADMINISTRATION_ROLE_BRIEFS[area.id];
  const specific = catalog?.[role.id];
  const fallback = territorial[area.id];
  const content = specific || (group.kind === 'vassals' ? fallback : {
    practice: 'Der konkrete Dienst richtet sich nach dem benannten Amt und der überlieferten Ordnung dieser Herrschaft. Aufträge werden mit der zuständigen Leitung abgestimmt und ihre Erledigung zurückgemeldet. Weitergehende Aufgaben und Vollmachten werden vor ihrer Übernahme ausdrücklich mit der zuständigen Leitung geklärt.',
    duties: fallback?.duties || [
      { icon: 'coordination', text: 'Den bestimmten Auftrag mit der zuständigen Leitung abstimmen.' },
      { icon: 'records', text: 'Ergebnisse und offene Fragen nachvollziehbar zurückmelden.' },
      { icon: 'judgment', text: 'Zuständigkeit und Grenzen des benannten Amtes beachten.' },
    ],
  });
  return { ...content, facts: [...(role.facts || []), ['Dienstform', serviceForms[group.kind] || 'Örtlicher Amtsdienst']] };
}
