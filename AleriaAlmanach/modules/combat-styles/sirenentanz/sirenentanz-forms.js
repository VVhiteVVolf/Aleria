const pathFeature = (id, name, minimumLevel, description) => ({
  id, name, minimumLevel, description, status: 'draft', stacking: 'highest-per-style'
});

export const SIRENENTANZ_FORM_IDS = Object.freeze({
  foundation: 'sirenentanz-junge-welle', advanced: 'sirenentanz-kehrende-flut',
  breaker: 'sirenentanz-brechende-brandung', current: 'sirenentanz-kreisende-stroemung',
  depths: 'sirenentanz-stilles-tiefwasser', militia: 'sirenentanz-kuestenwache'
});
const F = SIRENENTANZ_FORM_IDS;
export const SIRENENTANZ_EXPERT_PATH_IDS = Object.freeze([F.breaker, F.current, F.depths]);

const forms = [
  { id: F.foundation, number: 'I', name: 'Tanz der jungen Welle', kind: 'foundation', minimumLevel: 1, maximumTrainingLevel: 6,
    description: 'Stand, kurzer Waffenweg und kontrollierte Kraft. Die Grundausbildung wird an der tatsächlich geführten Waffe gelernt.' },
  { id: F.advanced, number: 'II', name: 'Tanz der kehrenden Flut', kind: 'advanced', minimumLevel: 7, maximumTrainingLevel: 8,
    description: 'Druck aufnehmen, umlenken und zurückgeben. Waffenwechsel und Ausweichschritte verbinden die Grundtechniken.' },
  { id: F.breaker, number: 'III', name: 'Tanz der brechenden Brandung', kind: 'path', minimumLevel: 9, maximumTrainingLevel: 20,
    description: 'Wucht und Durchbruch. Kontrollierte Überdehnung erkauft stärkere Treffer mit mehreren Ressourcen und kurzen eigenen Nachteilen.',
    features: [
      pathFeature('brandung-9', 'Gesetzter Aufprall', 9, 'Einmal pro eigenem Beitrag +1 Schaden auf einen Treffer dieses Pfades, wenn die Attacke Aktion und Reaktion kostet.'),
      pathFeature('brandung-13', 'Wucht der Brandung', 13, 'Der Bonus von Gesetzter Aufprall steigt auf +2; er ersetzt den bisherigen Bonus.'),
      pathFeature('brandung-17', 'Brecher der Linie', 17, 'Nach diesem verstärkten Treffer erhält das Ziel bis zum Ende seines nächsten eigenen Beitrags −1 Angriff. Erneute Anwendung erneuert nur die Dauer; keine Addition.')
    ] },
  { id: F.current, number: 'IV', name: 'Tanz der kreisenden Strömung', kind: 'path', minimumLevel: 9, maximumTrainingLevel: 20,
    description: 'Flanke, Rückzug und wechselnde Distanzen. Fernwaffe, Seitenwaffe und Reiterbewegung bleiben getrennte Handlungen mit ihren normalen Kosten.',
    features: [
      pathFeature('stroemung-9', 'Sicherer Schritt', 9, 'Eine Bewegungstechnik dieses Pfades gewährt einmal pro eigenem Beitrag +1 RK bis zum Ende des nächsten eigenen Beitrags.'),
      pathFeature('stroemung-13', 'Weiter Bogen', 13, 'Die erste ausdrücklich in einer Pfadattacke enthaltene Eigenbewegung pro Beitrag darf 1 m weiter führen; dies ist keine zusätzliche Bewegungshandlung.'),
      pathFeature('stroemung-17', 'Unerreichbare Flanke', 17, 'Sicherer Schritt gewährt +2 statt +1 RK. Gleichartige Strömungs- und Tiefwasser-RK-Boni verwenden nur den höheren Wert.')
    ] },
  { id: F.depths, number: 'V', name: 'Tanz des stillen Tiefwassers', kind: 'path', minimumLevel: 9, maximumTrainingLevel: 20,
    description: 'Deckung, Bindung und Schutz. Kurze Verteidigungsfenster statt kostenloser Gegenangriffe; Vorbereitung verursacht keinen unmittelbaren Schaden.',
    features: [
      pathFeature('tiefwasser-9', 'Ruhiger Grund', 9, 'Eine schadenslose Schutztechnik dieses Pfades gewährt ihrem geschützten Ziel +1 RK für die angegebene Dauer, höchstens einen eigenen Beitrag.'),
      pathFeature('tiefwasser-13', 'Fester Halt', 13, 'Während dieses Schutzes erhält das Ziel außerdem +1 auf ausdrücklich geforderte Rettungswürfe gegen Umwerfen oder Verschieben; situativ auszuwerten.'),
      pathFeature('tiefwasser-17', 'Ungebrochene Deckung', 17, 'Ruhiger Grund gewährt +2 statt +1 RK. Schutz derselben Quelle und gleichartige Pfadboni addieren sich nicht.')
    ] },
  { id: F.militia, number: 'K', name: 'Tanz der Küstenwache', kind: 'path', minimumLevel: 6, maximumTrainingLevel: 15,
    description: 'Vereinfachte, direkte Fortsetzung für Milwr. Deckung, kurze Stöße und gemeinsames Halten; keine ritterlichen Expertenpfade.' }
];

export function getSirenentanzForms() {
  return structuredClone(forms).map(form => ({ ...form, shortName: form.name, features: form.features || [] }));
}
