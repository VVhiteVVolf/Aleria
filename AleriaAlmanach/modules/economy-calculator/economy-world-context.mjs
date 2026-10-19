// Worldbuilding decisions from the user, 19 October 2026. Monetary amounts
// deliberately live elsewhere: none of these statements fixes a price or tax.
export const CENYR_WORK_CYCLE = ['work', 'work', 'work', 'rest', 'work', 'work', 'work', 'rest', 'rest'];

export const ECONOMY_PRICE_LAYERS = [
  ['Ware', 'Menge, Qualität, Material, Arbeitsaufwand und Haltbarkeit. Die bestehenden Kartenpreise sind vorläufige Quellenwerte.'],
  ['Ort', 'Örtliches Angebot, Transport, Handelsrisiken, Löhne, Saison und zuständige Abgaben. Kein einheitlicher Welt- oder Gwynthor-Multiplikator für alle Waren.'],
  ['Betrieb', 'Zubereitung, Bedienung, Ausstattung, Verlust, Finanzierung und Kundschaft. Einkaufspreis und Ausschankpreis bleiben getrennt.']
];

export const GWYNTHOR_ECONOMY = {
  id: 'gwynthor', title: 'Gwynthor · wohlhabender Seehandelsknoten Cenyrs',
  scope: 'Dieses Ortsprofil gilt für Gwynthor. Andere Länder und Regionen brauchen eigene Löhne, Versorgung und Abgaben; gemeinsame Warenwerte allein bestimmen keinen örtlichen Endpreis.',
  principles: [
    'Ein gewöhnlicher Hafenlohn soll bei sparsamer Haushaltsführung zwei Erwachsene und zwei Kinder versorgen können. Die Haushaltsarbeit ist eine notwendige Eigenleistung, kein zweites Geldeinkommen.',
    'Gwynthor ist Cenyrs herausragender Außenhandelshafen. Vermögende Einwohner, Adel und reisende Kundschaft können auch gehobene Häuser regelmäßig gut besuchen. Ein gut besuchtes Haus ist nicht automatisch profitabel.',
    'Frischer örtlicher Fisch ist reichlich vorhanden und verderblich. Umlandhöfe liefern Vieh und Feldfrüchte. Qualität, Saison, Transport und Verarbeitung beeinflussen trotzdem den Preis.',
    'Wild, Edelmetalle, gute Zuchtpferde und hochwertige oder seltene Importgüter gehören zum Luxus. Herkunft, Verfügbarkeit und Qualität werden je Warengruppe geprüft; örtliche Herkunft allein garantiert keinen niedrigen Preis.',
    'Gelernte und spezialisierte Arbeit wird besser bezahlt als ungelernte Arbeit. Die genauen Lohnabstände sind noch nicht festgelegt.',
    'Drei Arbeitstage, ein freier Tag, drei Arbeitstage und zwei freie Tage ergeben sechs Diensttage. Das ist eine gesellschaftliche Orientierung mit betrieblichen Abweichungen, keine erzwungene Schließzeit.',
    'Bürger sind frei. Abgaben gehen an das zugeordnete Adelshaus, andernfalls an das zuständige höchste Stadthaus, in Gwynthor Haus Draig. Die weitere Verpflichtung des Empfängers erzeugt keine erneute identische Belastung des Bürgers.',
    'Pacht für Land oder Räume und persönliche beziehungsweise betriebliche Abgaben sind unterschiedliche Verpflichtungen. Ritterliche Häuser können Geld, Naturalien und Dienste schulden. Höhe, Fälligkeit und Kirchenpflicht sind noch offen.',
    'Magie ist selten und trägt keine gewöhnliche Kühl-, Transport- oder Agrarversorgung. Haltbarmachung, Brennstoff, Lagerung und Verluste müssen ohne alltägliche Magie funktionieren.',
    'Die Stellung der Vanns folgt aus Besitz, Schulden, Lieferbeziehungen, Fachwissen und Geschäftserfolg. Eine vorgegebene Rangklasse oder ein gewünschter Gewinn ersetzt diese Rechnung nicht.'
  ]
};

export function getEconomyContext(id) { return id === GWYNTHOR_ECONOMY.id ? GWYNTHOR_ECONOMY : null; }
