import { fortunaHierarchy, level, office } from './fortuna-hierarchy-model.mjs';
export function buildMarielsGabeHierarchy() {
  return fortunaHierarchy('mariel', 'Mariels Gabe · Tafel der Mutter', 'Kleine örtliche Stelle · genießbare Überschüsse weitergeben',
    '<p><strong>Mariels Gabe</strong> ist eine Kaufmannsgilde aus <strong>Weisenfluh</strong> und Untergilde des Marktes der Fortuna. Ihre Händler bringen Weisenfluher Güter nach Estryll und nutzen bei ihrer Ankunft in Gwynthor den <strong>Fortuna-Hafen</strong>.</p><p>Die dauerhafte Aufgabe vor Ort ist bescheiden: die <strong>Tafel der Mutter</strong>. Lebensmittel, die aus dem Verkauf aussortiert wurden oder bei weiterem Liegen verderben würden, werden rechtzeitig übernommen, auf ihre Verwendbarkeit geprüft und an Bedürftige sowie kirchliche Stellen verteilt. Verdorbene Ware gehört nicht in die Ausgaben.</p><p>Eine kleine Stelle im Handelshof hält die Übergaben zusammen. Sie führt weder eine zweite große Handelsdirektion noch ein eigenes Bank- oder Militärwesen. Ankommende Kaufleute der Muttergilde wickeln ihren Warenverkauf über die bestehenden Hafenwege ab.</p>', [
      { id: 'mariel-tafel', label: 'Tafel der Mutter', parentTreeId: '', levels: [
        level('Örtliche Koordination', [office('mariel-tafelbeauftragter', 'Beauftragter der Tafel', '1 Stelle · Mariels Gabe', 'Stimmt Abgaben aus Handel und Betrieben mit der kleinen Annahmestelle und den Ausgaben an Bedürftige und kirchliche Stellen ab.')]),
        level('Kleiner täglicher Dienst', [
          office('mariel-pruefung', 'Annahme, Prüfung & Sortierung', '1 Stelle', 'Übernimmt rechtzeitig abgegebene Lebensmittel, prüft und sortiert sie und packt überschaubare Abgaben.'),
          office('mariel-ausgabe', 'Ausgabe & Handwagendienst', '1 Stelle', 'Hält Übergaben fest, holt kleinere Abgaben ab und bringt bereitgestellte Körbe zu den vereinbarten Empfängern.')
        ])
      ] }
    ], [{ label: 'Muttergilde', value: 'Mariels Gabe · Kaufmannsgilde aus Weisenfluh' }, { label: 'Unterstellung', value: 'Untergilde des Marktes der Fortuna' }, { label: 'Örtliche Hauptaufgabe', value: 'Tafel der Mutter · minimale dauerhafte Funktion' }, { label: 'Warenankunft', value: 'Weisenfluher Händler laufen den Fortuna-Hafen an' }],
    'Drei feste Dienstposten bilden die kleine Tafel; ankommende Handelsbesatzungen gehören nicht zu ihrem festen Personal.');
}
