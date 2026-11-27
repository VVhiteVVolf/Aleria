import { CONCEPT_EXAMPLES, exampleArt as art } from './concept-example-catalog.mjs';
import { createExampleDraft, exampleTraitIcon } from './concept-example-draft.mjs';

const { character, house, place, item } = CONCEPT_EXAMPLES;

export function exampleFaction(now) {
  return createExampleDraft('faction', {
    kind: 'Örtlicher Bund der Fährleute und Uferhöfe',
    region: 'Gelynwacht und Höfe flussaufwärts in Celtigerns Wacht',
    seat: 'Unteres Fährhaus von Gelynwacht',
    leader: 'Elin Celynbarth als gewählte Sprecherin der beiden Ufer',
    size: 'Zwölf Mitglieder im Dienst und sechs Aushilfen',
    pitch: 'Der Bund hält die Übergänge bei Gelynwacht benutzbar. Seine Mitglieder lesen Pegelzeichen, führen Fährlisten und weisen Reisende bei hohem Wasser auf den Höhenweg. Die Uferleute kennen sein Zeichen von den Warnpfosten.',
    goals: 'Die Leute beider Ufer wollen ihre Dienste und Kosten selbst festhalten. Beim nächsten Brückenausbau möchten sie über Material und Dienstzeiten mitentscheiden. Elin versucht, den Streit über doppelte Fährgebühren beizulegen.',
    look: 'Ein goldenes Hängelicht und zwei helle Wellen auf flussblauem Grund. Ein schmaler Flechtring fasst das Siegel. Im Dienst tragen die Mitglieder blaue Wollbänder an der Schulter.',
    structure: 'Eine Person pro Ufer koordiniert die Schichten. Elin sammelt Meldungen und schlichtet Streit. Fährmeister führen die Boote. Wegekundige begehen den Höhenweg und tragen Meldungen ins Fährbuch ein.',
    succession: 'Im ersten Herbstregen wählen die Mitglieder ihre Sprecherin oder ihren Sprecher für ein Jahr. Bei Ausfall übernehmen beide Ufervertretungen die Aufgaben bis zur Versammlung gemeinsam.',
    admission: 'Eine neue Person begleitet zwei reguläre Schichten und einen Pegelgang. Anschließend stimmen beide Ufervertretungen über die Aufnahme ab.',
    obligations: 'Mitglieder übernehmen einen Fähr- oder Wegdienst und leisten bei Reparaturen ihren Anteil. Sie erhalten trockene Lagerung für Werkzeug und Zugang zum gemeinsamen Ersatzmaterial.',
    rules: 'Bei Gefahr gilt die letzte bestätigte Meldung. Korrekturen erhalten Uhrzeit und Namen. Bei eigennützigen Angaben prüft die Versammlung Buch und Zeugenaussagen und kann die Schicht neu besetzen.',
    operations: 'Begehungen vor Regenphasen, Meldungen am Torhof und Hilfe beim Ausladen der Fähre. Für versiegelte Briefe arbeitet der Bund mit Mared zusammen.',
    funding: 'Jeder Hof steuert Holz, Lagerplatz oder Dienststunden bei. Ein Anteil aus dem Fährgeld deckt Reparaturen. Elin liest am Monatsende die Rechnung vor.',
    founding: 'Nach dem Hochwasser vor drei Wintern hielten widersprüchliche Meldungen Fuhrleute am falschen Ufer fest. Die Fährleute einigten sich auf einen Dienstplan und ein gemeinsames Warnzeichen.',
    hooks: 'Ein zweiter Beleg für Werkzeug liegt im Fährbuch. Die Wegekundige Llin hat die Kiste am Holzplatz gesehen. Die Versammlung will festlegen, wer Eingänge künftig gegenzeichnet.',
    questions: 'Soll der Bund die Sperrung selbst entscheiden? Werden die Höfe jenseits von Hochsteg bei einer engeren Zusammenarbeit stimmberechtigt?',
    notes: 'Fiktiver Bund für den Einstieg in die Geschichte um die doppelte Quittung.'
  }, {
    images: [
      { id: 'a', name: 'Hängelicht über zwei Wellen', url: art('uferlaternen-rundsiegel'), format: 'square', note: 'Flussblaues Rundsiegel mit einem leicht wiedererkennbaren Lichtzeichen.' },
      { id: 'b', name: 'Brückenbogen auf Flussblau', url: art('uferlaternen-brueckenbogen'), format: 'square', note: 'Die Alternative macht den öffentlichen Übergang zum Hauptmotiv.' },
      { id: 'c', name: 'Zwei Ufer, ein Licht', url: art('uferlaternen-wellenzeichen'), format: 'square', note: 'Die beiden Ufer rahmen das Licht in einer einfachen Fassung für kleine Stempel.' }
    ],
    ranks: [
      { id: 'uferlaternen-elin', rank: 'Sprecherin', name: 'Elin Celynbarth', reportsTo: 'Versammlung der Uferleute', note: 'Führt die Listen zusammen und legt der Versammlung die Ausgaben vor.' },
      { id: 'uferlaternen-tomas', rank: 'Fährmeister', name: 'Tomas vom Brückenhof', reportsTo: 'Sprecherin', note: 'Teilt die Fährschichten ein und bestätigt Pegelmeldungen.' },
      { id: 'uferlaternen-llin', rank: 'Wegekundige', name: 'Llin vom Holzplatz', reportsTo: 'Ufervertretung West', note: 'Kennt den Höhenweg und vermittelt zwischen Fuhrleuten und Fährdienst.' }
    ],
    bases: [
      { id: 'uferlaternen-gelynwacht', target: place.reference, role: 'Unteres Fährhaus und gemeinsames Fährbuch', source: art('gelynwacht-karte'), note: 'Hier hängen Meldungen, Schichtplan und Schlüssel zum Ersatzmaterial.' },
      { id: 'uferlaternen-holzplatz', name: 'Holzplatz am Hochweg', role: 'Materiallager und Treffpunkt bei hohem Pegel', note: 'Llin kontrolliert Bretter und Wegezeichen zu Beginn jeder Woche.' }
    ],
    assets: [
      { id: 'uferlaternen-pegel', name: 'Gemeinsame Pegelzeichen', kind: 'knowledge', icon: exampleTraitIcon('diligent'), note: 'Beide Ufer verwenden dieselben Meldungen für Brücke, Fähre und Umweg.', limits: 'An Übergängen außerhalb des Tals gilt eine andere Zeichenfolge.' },
      { id: 'uferlaternen-lager', name: 'Ersatzseile und Werkholz', kind: 'resource', icon: exampleTraitIcon('generous'), note: 'Die Höfe tragen Werkzeug und Verbrauchsmaterial für den Dienst zusammen.', limits: 'Größere Reparaturen brauchen zusätzliche Mittel und Arbeitszeit.' }
    ],
    relations: [
      { id: 'uferlaternen-haus', category: 'authorities', target: house.reference, role: 'Stellt Torhof und Lager bereit', note: 'Das Haus und der Bund gleichen ihre eigenen Listen bei Streit unter dem Tordach ab.' },
      { id: 'uferlaternen-mared', category: 'allies', target: character.reference, role: 'Botin zwischen den Ufern', note: 'Mared bringt Meldungen in den Hof und kann den Werkzeugtransport nachvollziehen.' },
      { id: 'uferlaternen-faehrlicht', category: 'other', target: item.reference, role: 'Dienstgerät der Abendwache', note: 'Das Licht wird mit dem Schichtbuch zurückgegeben.' },
      { id: 'uferlaternen-rivale', category: 'rivals', name: 'Fährbetrieb am Hochsteg', role: 'Konkurrenz um Fährgeld und Fuhrleute', note: 'Efan fordert einen Anteil für seine Fahrten während der alten Brückensperrung.' }
    ],
    decisions: [
      { id: 'entscheidung-seat', name: 'Hauptsitz & Einflussgebiet', result: 'Sitz ist das Untere Fährhaus. Der Dienst umfasst die Wege beider Ufer bei Gelynwacht.', reason: 'Von dort lassen sich Fähre und Ausweichwege koordinieren.', status: 'confirmed' },
      { id: 'entscheidung-leader', name: 'Führung & Nachfolge', result: 'Elin bleibt für den ersten Entwurf Sprecherin.', alternatives: 'Rotierende Sprecher aus beiden Ufern\nSprecherwahl für zwei Jahre', status: 'open' }
    ],
    timeline: [
      { id: 'uferlaternen-start', date: 'Vor drei Wintern', name: 'Gemeinsame Liste nach dem Hochwasser', note: 'Beide Ufer vereinbaren eine Anlaufstelle für Meldungen.' },
      { id: 'uferlaternen-siegel', date: 'Letzter Herbst', name: 'Der Bund nimmt das Lichtzeichen an', note: 'Blautücher und Siegel werden erstmals bei einem Pegelgang gezeigt.' }
    ],
    sources: [
      { id: 'uferlaternen-region', name: 'Cenyrs vorhandene Amtsstrukturen', url: '../Herrschaftsverwaltung/Cenyr/index.html', note: 'Zum Abgleichen möglicher Zuständigkeiten und Kontakte im Umland.' }
    ]
  }, now);
}
