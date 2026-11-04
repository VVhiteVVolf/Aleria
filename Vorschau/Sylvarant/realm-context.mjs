import { REALM_CONTEXT as ARGENTUM } from '../Leukonia/realm-context.mjs';

/** Sylvarant culture is local; the established imperial order has one source. */
export const REALM_CONTEXT = {
  title: 'Sylvarant',
  subtitle: 'Die wohlhabende östliche Großprovinz Argentums',
  empireTitle: ARGENTUM.empireTitle,
  introduction: 'Sylvarant ist eine der drei großen Provinzen des Kaiserreiches Argentum. Seine Hausdarstellungen verbinden lateinisch-römische Formen mit wohlhabender, ritterlicher Rüstungskultur.',
  scope: 'Die gelieferten Hausnamen und Wappen bleiben erhalten. Neue Haus- und Ortsnamen werden erst am Ende ausgearbeitet; bis dahin gelten neutrale Arbeitsnummern. Mede beginnt in der Hauptstadt der kaiserlichen Domäne.',
  history: ARGENTUM.history.filter(item => ['albath-argonath', 'leukonia-silverant', 'argentum'].includes(item.id)),
  culture: [
    { title: 'Römische Formen, ritterliche Pracht', text: 'Wohlstand und lateinisch-römische Prägung bestimmen die neuen Kriegerbilder. Rüstungen und Helme variieren; schwere Truppen können geschlossene Helme tragen. Die Ausarbeitung verbindet römische Formen mit einer reichen ritterlichen Ausstattung.' },
    { title: 'Vorhandene Hauszeichen', text: 'Die siebzehn gelieferten Hauswappen und das Reichswappen werden unverändert übernommen. Farben und Motive geben den einzelnen Hausdarstellungen ihre Richtung. Regionalbanner werden in diesem Arbeitsstand ausgelassen.' },
    { title: 'Aufgestellte Testudo-Schilde', text: 'Wenn ein neuer Krieger einen Schild erhält, ist er besonders groß, rechteckig und aufgestellt. Die Figur legt eine Hand darauf. Diese Form wird nach der ausdrücklichen Vorgabe für Sylvarant verwendet.' },
    { title: 'Belegter Hauskontext', text: 'Landwirtschaft bei Bruttia, Pferdezucht bei Caepo, Künstler und Musiker bei Vineben sowie die Bankgeschäfte von Umbranox geben vorhandenen Hausbildern konkrete Anknüpfungspunkte. Zusätzliche Geschichten, Ämter oder Verwandtschaftsgrade werden dadurch nicht festgelegt.' },
  ],
  government: ARGENTUM.government,
  administration: ARGENTUM.administration,
  nobility: ARGENTUM.nobility,
  offices: ARGENTUM.offices,
  institutions: ARGENTUM.institutions,
  military: ARGENTUM.military,
  religion: ARGENTUM.religion,
  openQuestions: [
    'Neue Haus- und Ortsnamen werden am Ende gemeinsam ausgearbeitet.',
    'Die sieben Archonate tragen zunächst Arbeitsnummern. Ihre Hauszuordnungen und die Sitze außerhalb der Mede-Hauptstadt bleiben offen.',
    'Die Ränge der übrigen Häuser sind noch nicht festgelegt.',
  ],
};
