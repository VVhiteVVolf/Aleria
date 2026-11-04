import { REALM_CONTEXT as ARGENTUM } from '../Leukonia/realm-context.mjs';

/** Calidaria owns its culture; the established imperial order has one source. */
export const REALM_CONTEXT = {
  title: 'Calidaria',
  subtitle: 'Tlapatlan · Die Inseln der Tlapanui',
  empireTitle: ARGENTUM.empireTitle,
  introduction: 'Das Archipel der Tlapanui verbindet seine aus Sundara stammende Inselkultur mit den Einflüssen des Kaiserreiches Argentum. Handel, Meer und die Begegnung beider Bevölkerungen prägen Calidaria.',
  scope: 'Die Häuser tragen Namen nach Nuatlapa beziehungsweise argentischem Sprachklang. Orts- und Kriegerklassennamen werden später ausgearbeitet. Mede beginnt in der durch die Raute markierten Hauptstadt; die Sitzzuordnungen bleiben bearbeitbare Entwürfe.',
  history: ARGENTUM.history.filter(item => ['argentum', 'tlapatlan', 'calidaria'].includes(item.id)),
  culture: [
    { title: 'Eine Inselkultur mit eigener Stimme', text: 'Die Tlapanui tragen vor allem Rapa-Nui-Einflüsse, ergänzt um Anregungen aus aztekischen und Maya-Kulturen. Erscheinung und Tätowierungen orientieren sich besonders an Rapa Nui. Ihre Sprache heißt Nuatlapa, ihre Schrift Tavarua. Offene Vokale und Lautgruppen wie tl, ts, ch und qu prägen den Klang; eine kleine lateinische Schicht zeigt den argentischen Einfluss. Bei Namen hat Wohlklang Vorrang vor einer wörtlichen Bedeutung.' },
    { title: 'Ansiedlung und Durchmischung', text: 'Ein Teil der Häuser besteht aus zugewanderten argentischen Familien, die auf den Inseln neue Möglichkeiten suchten. Andere Häuser sind stärker Tlapanui-geprägt. Die Integration des Archipels brachte mit der Zeit ein Mischvolk aus Argentern und Tlapanui hervor.' },
    { title: 'Zwei heraldische Handschriften', text: 'Argentische Siedlerhäuser führen römisch-ritterlich geprägte Zeichen. Tlapanui-Wappen bleiben schlichter und ebenso sorgfältig gestaltet: Dschungeltiere, Meer und Handel liefern ihre Motive. Beide Gruppen behalten die kreisrunde Wappenform.' },
    { title: 'Eigenständige Rüstungen aus Stahl', text: 'Die Tlapanui-Prototypen verbinden weiterentwickelte lokale Formen mit argentischer Metallarbeit. Macuahuitl und Tepoztopilli erhalten stählerne Schneidkanten. Bei argentischen Hauskriegern bleibt die Ausrüstung römisch-ritterlich mit verschiedenen römischen Helmen; griechische Einflüsse sind ausgeschlossen.' },
    { title: 'Furchterregende Berserkermasken', text: 'Berserkermasken erhalten grimassenhafte, furchterregende Gesichtszüge. Bei späteren Hausberserkern mit einem Wappentier soll sich das Tier zu einer fast dämonischen Tierfratze in der Maske verdichten.' },
  ],
  government: ARGENTUM.government,
  administration: ARGENTUM.administration,
  nobility: ARGENTUM.nobility,
  offices: ARGENTUM.offices,
  institutions: ARGENTUM.institutions,
  military: ARGENTUM.military,
  religion: ARGENTUM.religion,
  openQuestions: [
    'Ortsnamen und eigene Klassennamen werden später gemeinsam ausgearbeitet.',
    'Die sieben Archonate sind auf der Karte vorgegeben; ihre Namen und Hauszuordnungen bleiben offen. Für die kaiserliche Domäne ist Mede in der durch die Raute markierten Hauptstadt bestätigt.',
    'Die konkreten Ränge und Sitze der zusätzlichen Häuser sind noch nicht festgelegt.',
  ],
};
