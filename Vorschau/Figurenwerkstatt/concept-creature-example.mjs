import { CONCEPT_EXAMPLES, exampleArt as art } from './concept-example-catalog.mjs';
import { createExampleDraft, exampleTraitIcon, exampleTraits } from './concept-example-draft.mjs';

const { character, house, place, faction } = CONCEPT_EXAMPLES;

export function exampleCreature(now) {
  return createExampleDraft('creature', {
    species: 'Cenyri Laufhund',
    kind: 'Ausgebildeter persönlicher Begleiter',
    age: 'Fünf Jahre',
    size: 'Knapp 50 cm Schulterhöhe, rund 18 kg',
    range: 'Uferhöfe, Waldwege und Übergänge um Gelynwacht',
    pitch: 'Kiesel begleitet Mared auf Botengängen und wartet vor dem Tor, während sie spricht. Er kennt den Geruch der Fährleute und der gelagerten Seile. Hält er unterwegs plötzlich inne, hilft sein Verhalten dabei, eine Spur an der richtigen Stelle zu suchen.',
    look: 'Schlanker Laufhund mit kurzem kastanienbraunem Fell, dunklem Sattel, schmaler heller Stirnblesse, cremefarbener Brust und einer hellen Vorderpfote. Er trägt ein einfaches braunes Halsband und am Fährhaus gelegentlich ein Laufgeschirr.',
    tracks: 'Kiesel atmet hörbar aus, wenn er am Steg wartet. Hat er etwas auf der Spur, setzt er die Nase tief und bewegt den Schweif langsam. Bei sichtbarer Gefahr bellt er zweimal und bleibt auf festem Boden.',
    temperament: 'Bei vertrauten Leuten sucht er Nähe und arbeitet geduldig. Bei hastigen Bewegungen weicht er aus. Fremde lässt er erst herankommen, wenn Mared ruhig stehen bleibt.',
    habitat: 'Er kennt den Torhof, den letzten Abschnitt des Höhenwegs und beide Fähranleger. Auf nassem Stein nimmt er sich Zeit. Am flachen Ufer steigt er freiwillig ins Wasser.',
    diet: 'Nach längeren Botengängen braucht er einen trockenen Platz, frisches Wasser und eine Ruhepause. Mared kontrolliert die Pfoten und trocknet das Halsband, bevor sie wieder aufbricht.',
    handling: 'Mared setzt wenige vertraute Handzeichen ein. Sie lässt ihn bei belastenden Geräuschen an einer ruhigen Stelle ausweichen. Elin kann ihn am Fährhaus ansprechen und kennt sein Wartezeichen.',
    stats: 'Spieltest: Kiesel kann auf bekannten Wegen eine Spurenprobe vorbereiten. Seine Reaktion gibt der Gruppe eine Richtung für eigene Nachforschungen. Langer Regen, mehrere frische Spuren oder aufgewühltes Wasser erschweren die Zuordnung.',
    origin: 'Kiesel stammt von einem der flussaufwärts gelegenen Höfe. Mared nahm ihn nach einer Botentour mit und gewöhnte ihn nach und nach an Seile, Boote, den Torhof und fremde Stimmen.',
    hooks: 'Kiesel hält vor einer niedrigen Seitentür an, obwohl Mared zum Torhof geht. Dort liegt ein benutztes Fährseil. Wer seinen Weg beobachtet, kann den alten Anleger als zweite Station des Transports entdecken.',
    questions: 'Soll Kiesel in fremdem Gelände auch auf ferne Rufe reagieren? Welches Signal behält er für den Rückweg nach Gelynwacht?',
    notes: 'Der Hund zeigt über Verhalten, Haltung und Aufmerksamkeit, was er am Ort wahrnimmt.'
  }, {
    images: [
      { id: 'a', name: 'Am Seitentor von Gelynwacht', url: art('kiesel-begleithund'), format: 'portrait', note: 'Kiesel im Alltag mit einfachem Halsband. Fellzeichnung und Körperbau bleiben in den anderen Entwürfen erkennbar.' },
      { id: 'b', name: 'Mit Laufgeschirr am Fährsteg', url: art('kiesel-faehrdienst'), format: 'portrait', note: 'Arbeitsansicht im Fährdienst mit leichtem braunem Geschirr.' },
      { id: 'c', name: 'Bei der Nachtwache', url: art('kiesel-nachtwache'), format: 'portrait', note: 'Sitzendes Porträt im kühlen Abendlicht vor dem Fährhaus.' }
    ],
    traits: exampleTraits([
      ['Aufmerksam', 'Wendet ihn ein Geräusch ab, bleibt die Nase über der Spur.', 'diligent'],
      ['Geduldig', 'Wartet am letzten Übergang auf das Handzeichen.', 'patient'],
      ['Vorsichtig', 'Prüft nasse Steine und tritt über lose Bretter.', 'calm'],
      ['Bindungstreu', 'Kehrt nach einem offenen Suchbogen zu Mared zurück.', 'trusting'],
      ['Leicht abzulenken', 'Eine frische Wildspur kann ihn nach längerer Suche ablenken.', 'fickle'],
      ['Zurückhaltend', 'Wechselt bei Gedränge auf die ruhigere Wegseite.', 'shy'],
      ['Ausdauernd', 'Hält auf vertrauten Routen ein gleichmäßiges Lauftempo.', 'stubborn'],
      ['Lernfreudig', 'Übernimmt ein neu geübtes Zeichen nach wenigen ruhigen Wiederholungen.', 'ambitious']
    ]),
    abilities: [
      { id: 'kiesel-spur', name: 'Vertraute Uferspur', kind: 'sense', icon: exampleTraitIcon('diligent'), note: 'Folgt einem bekannten Geruch vom Weg zum üblichen Anlegeplatz.', limits: 'Regen und viele frische Fuhrwerkspuren können den Geruch überdecken.' },
      { id: 'kiesel-wartezeichen', name: 'Am letzten sicheren Punkt warten', kind: 'training', icon: exampleTraitIcon('patient'), note: 'Bleibt an der letzten trockenen Wegstelle, bis Mared mit der flachen Hand zurückruft.', limits: 'Braucht Sichtkontakt oder eine vertraute zweite Person am Platz.' }
    ],
    relations: [
      { id: 'kiesel-mared', category: 'keepers', target: character.reference, role: 'Führt ihn auf Botengängen', note: 'Mared hat Kiesel an Menschen, Pferde und den Fährdienst gewöhnt.' },
      { id: 'kiesel-haus', category: 'keepers', target: house.reference, role: 'Sein Ruheplatz liegt am Torhof', note: 'Der Hausdienst kennt sein Wartezeichen und macht ihm bei nassem Wetter einen trockenen Platz frei.' },
      { id: 'kiesel-gelynwacht', category: 'habitat', target: place.reference, role: 'Heimatrevier', note: 'Kiesel kennt den Seitenweg zwischen Torhof, Wald und Fährhaus.' },
      { id: 'kiesel-uferlaternen', category: 'other', target: faction.reference, role: 'Vertrauter Geruch der Fährleute', note: 'Er kann am Steg bei Elin warten, wenn Mared allein in den Hof geht.' }
    ],
    decisions: [
      { id: 'entscheidung-species', name: 'Art & Einordnung', result: 'Kiesel ist ein fünfjähriger, gewöhnlicher Cenyri Laufhund mit Ausbildung für Botengänge.', status: 'confirmed', reason: 'Seine Fähigkeiten ergeben sich aus Geruchssinn, Erfahrung und eingeübten Signalen.' },
      { id: 'entscheidung-ability', name: 'Besondere Fähigkeit & Grenze', result: 'Wenn Kiesel am Anleger innehält, kann die Gruppe eine vertraute Spur weiterverfolgen.', alternatives: 'Nur Hinweise am vertrauten Torhof, keine Spuren auf dem Höhenweg.', status: 'open' }
    ],
    encounters: [
      { id: 'kiesel-steghalt', name: 'Halt vor der Seitentür', trigger: 'Vor dem ersten Gespräch mit Elin', note: 'Kiesel erkennt einen vertrauten Geruch und lässt sich erst nach einem Zeichen weiterführen.' },
      { id: 'kiesel-laute-wagen', name: 'Wagen über den Steinbogen', trigger: 'Am Tor bei dichtem Verkehr', note: 'Der Hund setzt sich an den Torpfosten und wartet. Die Gruppe kann sich mit ihm aus dem Gedränge lösen.' }
    ],
    timeline: [
      { id: 'kiesel-herkunft', date: 'Vor fünf Jahren', name: 'Wurf auf einem Uferhof', note: 'Kiesel wird zwischen Hof und Fährweg an Menschen und Zugtiere gewöhnt.' },
      { id: 'kiesel-bote', date: 'Vor zwei Jahren', name: 'Erster Weg mit Mared', note: 'Er lernt Wege zu den Lagerplätzen und das Wartezeichen.' }
    ],
    sources: [
      { id: 'kiesel-quelle', name: 'Mareds Gefährtennotiz', note: 'Das Figurenmuster hält Herkunft und Bindung aus Mareds Sicht fest.' }
    ]
  }, now);
}
