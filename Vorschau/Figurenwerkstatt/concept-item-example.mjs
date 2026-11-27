import { CONCEPT_EXAMPLES, exampleArt as art } from './concept-example-catalog.mjs';
import { createExampleDraft, exampleTraitIcon } from './concept-example-draft.mjs';

const { character, place, faction } = CONCEPT_EXAMPLES;

export function exampleItem(now) {
  return createExampleDraft('item', {
    kind: 'Tragbare Signallaterne für Fährleute',
    material: 'Mattes Messing, grün getöntes Glas, eiserne Beschläge',
    dimensions: 'Etwa eine Handspanne hoch, gut mit einer Hand zu tragen',
    maker: 'Beschlagwerkstatt am Hochsteg',
    owner: 'Bund der Uferlaternen, aufbewahrt im Unteren Fährhaus',
    pitch: 'Das Fährlicht zeigt am Anleger, dass der Dienst besetzt ist. Sein grün getöntes Glas und die zwei Wellen am Fuß kennzeichnen es als Eigentum des Bunds. Fährleute nutzen seit dem Hochwasser abgeschirmte Lichter, um Signale und Wegbeleuchtung voneinander zu unterscheiden.',
    look: 'Kompakte runde Laterne mit kleinem Tragering, drei schmalen Messingstegen und einer beweglichen Seitenblende. Hinter den rauchgrünen Scheiben steht ein mattes warmes Licht.',
    markings: 'Zwei eingezeichnete Wellen am unteren Rahmen. Am Ring ist der Messington etwas heller. Auf der Innenseite der Klappe ist die Werkstattmarke eingeschlagen.',
    craft: 'Die Messingfassung wird in der Beschlagwerkstatt angefertigt. Die Glaserin schneidet grün getönte Scheiben nach Maß. Der Fährdienst kann Beschläge und Blenden vor Ort austauschen.',
    care: 'Die Abendwache hängt die ausgerüstete Laterne nach dem Dienst auf den trockenen Haken im Fährhaus. Das Schichtbuch hält Schäden, Ersetzungen und zeitweise Ausleihen fest.',
    use: 'Am Anleger zeigt die geöffnete Seite in Richtung des wartenden Ufers. Bei einem Gang über den Steg schirmt die Klappe das seitliche Licht ab. Für die vereinbarte Meldung braucht es freie Sicht und Personen, die das örtliche Zeichen kennen.',
    limits: 'Der sichtbare Bereich hängt von Nebel, Licht und Wasserstand ab. Grün getöntes Ersatzglas ist außerhalb von Gelynwacht selten.',
    stats: 'Spieltest: Wer das örtliche Zeichen kennt und den Anleger sehen kann, erkennt besetzten Dienst aus der Distanz. Bei starkem Nebel bietet das Licht nur im Nahbereich Orientierung. Die Auflösung bleibt bei der Szene.',
    value: 'Richtwert im Entwurf · 35 Silber',
    rarity: 'Lokal gefertigt, außerhalb der Uferhöfe selten',
    availability: 'Der Bund verleiht das Stück gegen Eintrag ins Schichtbuch. Eine zweite robuste Fassung kann die Werkstatt am Hochsteg liefern.',
    origin: 'Nach dem Hochwasser gestaltete die Werkstatt eine tragbare Fassung für die Abendwache. Das erste grüne Glas stiftete ein Hof am oberen Ufer. Später ergänzte der Bund die zwei Wellen.',
    hooks: 'Mared findet auf zwei Quittungen dieselbe Werkstattmarke. Im Schichtbuch lässt sich erkennen, wer das Fährlicht in der betreffenden Nacht abgeholt hatte.',
    questions: 'Soll der Bund die Messingfassung an Gäste verleihen? Passt der Richtwert zu den übrigen Werkzeugpreisen?',
    notes: 'Stück für den Fährdienst. Preis und Spielwerte sind Vorschläge für die Werkstatt.'
  }, {
    images: [
      { id: 'a', name: 'Messingfassung mit grünem Glas', url: art('faehrlicht-messing'), format: 'square', note: 'Handliche Grundfassung, die auf den Haken im Fährhaus passt.' },
      { id: 'b', name: 'Eiserne Pfostenfassung', url: art('faehrlicht-eisenfassung'), format: 'square', note: 'Festere Fassung für das Uferzeichen am Anleger.' },
      { id: 'c', name: 'Tragbare Lotsenfassung aus Kupfer', url: art('faehrlicht-lotsenfassung'), format: 'square', note: 'Kompakte Form mit seitlichen Blenden für Botengänge.' }
    ],
    editions: [
      { id: 'faehrlicht-dienst', name: 'Messingfassung', material: 'Runde Messingform mit grünem Glas', icon: exampleTraitIcon('diligent'), note: 'Die gewählte Fassung für den Fährdienst.' },
      { id: 'faehrlicht-pfosten', name: 'Pfostenfassung', material: 'Rechteckiges Eisengehäuse', note: 'Eine Alternative für einen festen Standort bei der Anlegestelle.' },
      { id: 'faehrlicht-lotse', name: 'Lotsenfassung', material: 'Leichter Kupferkörper', note: 'Die geplante tragbare Ausführung für Botinnen und Fährleute.' }
    ],
    effects: [
      { id: 'faehrlicht-zeichen', name: 'Erkennbares Dienstzeichen', kind: 'property', icon: exampleTraitIcon('honest'), note: 'Die Farbe und der Standort zeigen ortskundigen Wartenden besetzten Dienst an.', limits: 'Braucht freie Sicht und Kenntnis der örtlichen Zeichen.' },
      { id: 'faehrlicht-blende', name: 'Seitliches Licht abschirmen', kind: 'active', note: 'Klappe und Glas bündeln die Sicht auf die geöffnete Seite.', limits: 'Eine geschlossene Blende verkürzt den sichtbaren Bereich.' }
    ],
    relations: [
      { id: 'faehrlicht-bund', category: 'owners', target: faction.reference, role: 'Eigentümer und Ausgabe', note: 'Die Abendwache trägt Rückgabe und Schäden ins Schichtbuch ein.' },
      { id: 'faehrlicht-gelynwacht', category: 'owners', target: place.reference, role: 'Aufbewahrung am Unteren Fährhaus', note: 'Außerhalb des Diensts hängt die Laterne neben dem Fährbuch.' },
      { id: 'faehrlicht-werkstatt', category: 'makers', name: 'Beschlagwerkstatt am Hochsteg', role: 'Herstellerin von Fassung und Blenden', note: 'Die Werkstatt kann beschädigte Teile nach dem ersten Satz nachfertigen.' },
      { id: 'faehrlicht-mared', category: 'other', target: character.reference, role: 'Mögliche Ausleihe im Entwurf', note: 'Mared kann am nächsten Abend um das Licht bitten, um den Weg der Fuhre zu prüfen.' }
    ],
    decisions: [
      { id: 'entscheidung-design', name: 'Material & Gestaltung', result: 'Kompakte Messingfassung mit grün getönten Scheiben und schlichter Seitenblende.', reason: 'Die Form unterscheidet das Fährlicht von den gewöhnlichen Laternen am Torhof.', status: 'confirmed' },
      { id: 'entscheidung-value', name: 'Preis & Seltenheit', result: 'Richtpreis von 35 Silber als erster Vorschlag.', status: 'open', alternatives: 'Leihstück des Bunds gegen Pfand.\nHöherer Preis bei seltenerem grünem Glas.' }
    ],
    timeline: [
      { id: 'faehrlicht-entstehung', date: 'Nach dem Hochwasser', name: 'Erste Fassung aus der Werkstatt', note: 'Der Bund kennzeichnet damit den unteren Anleger.' },
      { id: 'faehrlicht-schichtbuch', date: 'Beginn des Entwurfs', name: 'Eintrag aus der Nacht der zweiten Quittung', note: 'Die Ausgabe der Laterne hält den Namen einer möglichen Zeugin fest.' }
    ],
    sources: [
      { id: 'faehrlicht-katalog', name: 'Gestaltungsbeispiel aus dem Güterregister', url: '/AleriaAlmanach/assets/pendrwn-general-store/goods/balkenwaage.png', note: 'Referenz für Konturen, Materialfarben und Darstellung als einzelner Inventargegenstand.' }
    ]
  }, now);
}
