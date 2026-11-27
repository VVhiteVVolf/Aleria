import { CONCEPT_EXAMPLES, exampleArt as art } from './concept-example-catalog.mjs';
import { createExampleDraft, exampleTraits } from './concept-example-draft.mjs';

const mared = CONCEPT_EXAMPLES.character.reference;
const celynbarth = CONCEPT_EXAMPLES.house.reference;
const gelynwacht = CONCEPT_EXAMPLES.place.reference;
const uferlaternen = CONCEPT_EXAMPLES.faction.reference;
const kiesel = CONCEPT_EXAMPLES.creature.reference;

export function exampleFigure(now) {
  return createExampleDraft('character', {
    age: '26 Jahre', origin: 'Gelynwacht in Celtigerns Wacht',
    culture: 'Mensch, Cenyri', role: 'Botin und angehende Heroldin', affiliation: celynbarth.name,
    residence: 'Zwischen Gelynwacht und Gwynthor',
    pitch: 'Mared bringt versiegelte Briefe durch die Nebenstraßen von Celtigerns Wacht. Auf ihrem ersten Ritt als angehende Heroldin soll sie einen Lieferstreit schlichten. Die Abgabenliste, auf die sich beide Seiten berufen, ist von ihrer eigenen Familie geführt worden.',
    look: 'Langer kastanienbrauner Flechtzopf, graugrüne Augen, einzelne Sommersprossen und eine kleine Kerbe an der rechten Braue. Mared trägt Wolle über weichem Leder. Eine Bronzespange mit drei Stechpalmenblättern verrät ihr Haus auch auf Reisen.',
    impression: 'Mared sieht Menschen an, bevor sie sie begrüßt. Sie merkt sich, wer dem Gast Wasser hinstellt und wer zuerst nach dessen Brief fragt. Wenn sie sich sicher fühlt, spricht sie schnell und trockener, als ihre höflichen Karten und Briefe vermuten lassen.',
    values: 'Sie will, dass Zusagen nachprüfbar sind. Sie nennt einen Boten beim Namen, führt Ersatzseile für Reisende mit und fragt nach den Leuten am anderen Ufer. Das Amt einer Heroldin erhofft sie sich, weil sie damit eigene Worte sprechen dürfte.',
    weakness: 'Wenn ihre Mutter eine Erinnerung als Tatsache ausgibt, widerspricht Mared selten sofort. Sie hält den Einwand zurück, sammelt Belege und überfällt ihr Gegenüber später damit. Ihr Bruder nennt das Zögern, bis sie die stärkere Hand hat.',
    pressure: 'Unter Druck wird Mared nüchtern. Sie schreibt auf, was sicher ist, und fragt nach dem nächsten umkehrbaren Schritt. Erst wenn jemand eine dritte Person für den Fehler zahlen lassen will, unterbricht sie und stellt sich offen auf eine Seite.',
    past: 'Mared lernte auf Gelynwacht lesen, indem sie Durchfahrten mit den Fährleuten abglich. Nach dem Hochwasser führte sie drei Winter lang Briefe über die Höhenroute. Eine Schreiberin in Gwynthor brachte ihr Formeln und Siegelgebrauch bei.',
    present: 'Sie besitzt einen Brief mit zwei widersprüchlichen Quittungen für denselben Werkzeugtransport. Auf Gelynwacht erwartet man einen raschen Abschluss, in Gwynthor eine Erklärung.',
    goals: 'Den Streit in einer ersten Szene aufklären. Später soll Mared entscheiden, ob sie das Heroldsamt annimmt und die Zuteilung der Familienaufgaben neu verhandelt.',
    questions: 'Wer hat die zweite Quittung geschrieben? Welcher Anspruch auf die Durchfahrt ist in Alerias bestehender Verwaltung plausibel?',
    notes: 'Spielprobe für eine Einführung am Fährsteg. Die Verbindungen zu vorhandenen Figuren sind Vorschläge für die Besprechung.'
  }, {
    images: [
      { id: 'a', name: 'Reisekleidung an der Furt', url: art('mared-reisekleidung'), format: 'portrait', note: 'Efeugrüner Wollmantel über Leder. Die kleine Stechpalmenspange ist auch auf Reisen sichtbar.' },
      { id: 'b', name: 'Heroldstracht im Saal', url: art('mared-heroldstracht'), format: 'portrait', note: 'Elfenbein und Efeugrün. Der feinere Schnitt soll ihren Amtsanspruch zeigen.' },
      { id: 'c', name: 'Nachtbotin am Fährsteg', url: art('mared-nachtbotin'), format: 'portrait', note: 'Ungeschmückter graugrüner Mantel für Arbeit im Regen. Gesicht und Zopf bleiben wiedererkennbar.' }
    ],
    decisions: [
      { id: 'entscheidung-role', name: 'Rolle', status: 'confirmed', result: 'Botin und angehende Heroldin von Gelynwacht.', alternatives: 'Schreiberin im Hausarchiv\nFährmeisterin am unteren Ufer', reason: 'Ihre Reisen bringen sie mit beiden Ufern zusammen und geben ihr einen eigenen Auftrag.' },
      { id: 'muster-herold', name: 'Fürsprache für das Heroldsamt', result: 'Zuerst einen Kontakt in Gwynthor ansprechen.', alternatives: 'Empfehlung aus Haus Draig\nFürsprache der Fährleute' }
    ],
    traits: exampleTraits([
      ['Aufmerksam', 'Merkt sich kleine Änderungen an Wegmarken und Siegeln.', 'diligent'],
      ['Gewissenhaft', 'Führt den Empfang jedes Briefes mit Zeugen nach.', 'honest'],
      ['Trocken humorvoll', 'Löst Spannung mit einer knappen Beobachtung.', 'eccentric'],
      ['Beharrlich', 'Kehrt mit einer neuen Frage zurück, wenn eine Antwort ausweicht.', 'stubborn'],
      ['Loyal', 'Hält zugesagte Hilfe ein, auch wenn ihr Haus uneins ist.', 'trusting'],
      ['Misstrauisch', 'Achtet auf zu schnelle Zusagen und vorbereitete Antworten.', 'paranoid'],
      ['Hilfsbereit', 'Teilt einen trockenen Platz und fragt, wer noch fehlt.', 'compassionate'],
      ['Ehrgeizig', 'Bewirbt sich um Aufgaben mit Verantwortung für eigene Entscheidungen.', 'ambitious']
    ]),
    relations: [
      { id: 'mared-haus', category: 'family', target: celynbarth, role: 'Heimat und Auftraggeber', note: 'Briefe des Hauses tragen häufig Mareds Handschrift. Künftig möchte sie für eigene Entscheidungen einstehen.' },
      { id: 'mared-sian', category: 'family', name: 'Sian Celynbarth', role: 'Mutter und Hausvorsteherin', note: 'Sian brachte ihr die Rechnungsbücher bei. Uneins sind sie darüber, was ein Haus nach außen erzählen darf.' },
      { id: 'mared-gawain', category: 'allies', target: { type: 'character', id: 'q1QtSIug74FzzwUAqWrs', name: 'Gawain Draig' }, role: 'Möglicher Kontakt im Almanach', note: 'Mared könnte um eine Empfehlung für die Ausbildung bitten. Ob es zu einer Begegnung kommt, ist offen.' },
      { id: 'mared-gelynwacht', category: 'other', target: gelynwacht, role: 'Heimat und Schauplatz', note: 'In Gelynwacht kennt Mared die Wege und Pegelzeichen, an denen sich die Aussagen der Fährleute prüfen lassen.' },
      { id: 'mared-efan', category: 'rivals', name: 'Efan vom Hochsteg', role: 'Vorgesehener Rivale', note: 'Der selbstständige Fährmann beschwert sich über die alten Listen. Beide kennen die Strecke und widersprechen sich bei der Frage nach den letzten Lieferungen.' }
    ],
    companions: [
      { id: 'mared-kiesel', target: kiesel, kind: 'Fünfjähriger Lauf- und Spürhund', image: art('kiesel-begleithund'), format: 'portrait', note: 'Kiesel liest Mareds Handzeichen und bleibt beim Seitentor, wenn sie mit Zeugen spricht. Auf nassem Stein sucht er immer zuerst Halt. Mared nahm ihn nach einer Fahrt zu den flussaufwärts gelegenen Höfen mit.' }
    ],
    abilities: [
      { id: 'mared-siegel', name: 'Siegel- und Schriftkunde', kind: 'training', icon: { name: 'Ehrlich', src: '/IconOrdner/Big Traits/Trait_honest.png' }, note: 'Vergleicht Siegel, Formulierungen und Abschriften und erkennt Spuren einer zweiten Abschrift.', limits: 'Benötigt brauchbares Licht und Vergleichsproben. Ein ungewöhnliches Siegel allein beweist keine Fälschung.' },
      { id: 'mared-furt', name: 'Wege nach Wasserstand lesen', kind: 'aptitude', note: 'Erkennt Pegelspuren und erinnert sich an Ausweichpfade zwischen Furt und Fährhaus.', limits: 'Funktioniert am besten auf vertrauten Wegen. Den Wasserstand oberhalb eines unbekannten Zuflusses kann sie nur abschätzen.' }
    ],
    timeline: [
      { id: 'mared-flut', date: 'Vor drei Wintern', name: 'Erste Botentour nach dem Hochwasser', note: 'Sie lernte die Höhenroute von den Fährleuten.' },
      { id: 'mared-brief', date: 'Beginn des Entwurfs', name: 'Zwei Quittungen für dieselbe Lieferung', note: 'Mared nimmt den Auftrag wegen des ungewöhnlichen Doppeleintrags an.' }
    ],
    sources: [
      { id: 'mared-atlas', name: 'Kontinentatlas als Bezugspunkt', url: '../../Kontinente/index.html', note: 'Celtigerns Wacht liefert den bestehenden Rahmen für Wege und Zuständigkeiten.' }
    ]
  }, now);
}

export function exampleHouse(now) {
  return createExampleDraft('house', {
    rank: 'Kleines Diensthaus',
    region: 'Cenyr, Celtigerns Wacht', seat: 'Gelynwacht', motto: 'Die Spur bleibt lesbar.',
    head: 'Sian Celynbarth',
    pitch: 'Haus Celynbarth hält eine Seitenroute zwischen mehreren Höfen offen. Sein Einfluss beruht auf Fährleuten, geführten Büchern und einem kleinen überdachten Markt. Nach einem Hochwasser muss die Familie entscheiden, ob sie für den Wiederaufbau einen größeren Lehnsherrn an sich bindet.',
    look: 'Ein altgoldener Stechpalmenzweig auf efeugrünem Feld. Drei rote Beeren stehen für Furt, Brücke und Herberge. Der Ring aus dunkler Bronze zeigt ein schmales Flechtband. Dienstkleidung verbindet dunkle Wolle mit schlichten Bronzespangen.',
    impression: 'Im eigenen Verständnis halten die Celynbarth einen Weg für alle benutzbar. Die Nachbarn schätzen die verlässlichen Auskünfte zu Furten und Lagerplätzen. Bei Abgaben kennt das Haus allerdings jede alte Ausnahme auswendig.',
    values: 'Im Hauskodex stehen drei Pflichten: bei Hochwasser warnen, versiegelte Briefe heil abliefern und einer erschöpften Person einen trockenen Platz anbieten. Wer einen Eintrag ändert, setzt seinen Namen an den Rand.',
    traditions: 'Im ersten Herbstregen prüft die Familie mit den Fährleuten die Pegelmarken und verteilt trockene Seile. Am Tor wird ein neuer Stechpalmenzweig befestigt. Der Vorsteher hört anschließend die Beschwerden der Höfe auf beiden Ufern an.',
    tensions: 'Sian will das Haus klein und auskunftsfähig halten. Rhufon möchte Händler in größerer Zahl anziehen und die Abgaben vereinheitlichen. Mared fragt, welche Rechte die Leute am anderen Ufer beim Umbau der Brücke behalten.',
    succession: 'Die Hauptlinie hält Sitz und Siegel. Eine Nebenlinie betreut das Untere Fährhaus. Mared ist Sians ältestes Kind. Ihre Entscheidung über das Heroldsamt kann eine andere Aufteilung der Pflichten nötig machen.',
    influence: 'Kleiner Zollanteil bei Lagerung und Lotsendienst, ein Holzplatz am oberen Ufer und gute Kontakte zu Fuhrleuten. Für einen festen Brückenneubau fehlen Bauholz, Steinmetze und Geld.',
    founding: 'Die erste Hausherrin erhielt vor mehreren Generationen den Auftrag, eine Furt winterfest zu markieren. Aus ihrer Hütte am Ufer wuchs ein Torhof mit Lager und einer Herberge für Boten.',
    present: 'Die Brücke ist wieder passierbar, doch Teile der alten Rechnung sind verloren. Sian hat beide Ufer gebeten, ihre Abschriften zur nächsten Versammlung mitzubringen.',
    goals: 'Als kleiner Schauplatz für einen Streit um Fährrechte und für Mareds ersten größeren Auftrag nutzbar. Der Ausbau des Sitzes kann über handelbare Leistungen statt über einen fertigen Geldbetrag angelegt werden.',
    questions: 'Von welcher Herrschaft sollte die Familie ihre Dienste offiziell ableiten? Wer besitzt das Holz für die Brücke?',
    notes: 'Gelynwacht und Haus Celynbarth sind eigens für dieses Muster erfunden.'
  }, {
    images: [
      { id: 'a', name: 'Rundwappen mit Stechpalme', url: art('celynbarth-wappen'), format: 'square', note: 'Drei altgoldene Blätter und rote Beeren auf efeugrünem Holz. Schmaler, flächig gezeichneter Flechtring.' },
      { id: 'b', name: 'Gelynwacht an der Brücke', url: art('celynbarth-gelynwacht'), format: 'landscape', note: 'Steinturm, niedriger Hof und eine Brücke, die im Alltag mehr Bedeutung hat als der Turm.' },
      { id: 'c', name: 'Sian, Mared und Rhufon', url: art('celynbarth-familie'), format: 'portrait', note: 'Die Hausvorsteherin und ihre beiden erwachsenen Kinder im Saal von Gelynwacht.' }
    ],
    decisions: [
      { id: 'entscheidung-seat', name: 'Hauptsitz & Region', status: 'confirmed', result: 'Gelynwacht liegt am Brückenübergang in Celtigerns Wacht.', reason: 'Brücke und Fährhaus geben dem Haus unmittelbar eine Aufgabe und verbinden Haupt- und Nebenlinie.' },
      { id: 'entscheidung-rank', name: 'Rang & Lehnstreue', result: 'Kleines Diensthaus. Die Schutzbindung steht zur Besprechung.', alternatives: 'Dienstbindung an Haus Gafyr\nEigenständige Vereinbarungen mit den Uferhöfen' }
    ],
    traits: exampleTraits([
      ['Gastfreundlich', 'Reisende bekommen zuerst einen trockenen Platz.', 'generous'],
      ['Pflichtbewusst', 'Hält Warnzeichen, Wege und Tabellen in Stand.', 'diligent'],
      ['Sparsam', 'Verwendet Werkholz und Vorräte so lange wie möglich.', 'temperate'],
      ['Verschwiegen', 'Bewahrt die Siegelbriefe seiner Auftraggeber.', 'shy'],
      ['Stolz', 'Verteidigt alte Zusagen und Zuständigkeiten.', 'arrogant'],
      ['Geduldig', 'Hört nacheinander die Leute beider Ufer an.', 'patient'],
      ['Anspruchsvoll', 'Erwartet belegbare Aussagen und vollständige Quittungen.', 'just'],
      ['Eigensinnig', 'Lässt sich bei lokalen Wegrechten ungern übergehen.', 'stubborn']
    ]),
    relations: [
      { id: 'haus-gafyr-muster', category: 'lieges', target: { type: 'house', id: 'haus-gafyr', name: 'Haus Gafyr', page: 'house' }, role: 'Denkbare Schutz- oder Dienstbindung', note: 'Ein möglicher Ansatz für die Besprechung. Abgaben, Rechte und Zuständigkeiten sind offen.' },
      { id: 'haus-gelynwacht', category: 'other', target: gelynwacht, role: 'Familiensitz und Flussübergang', note: 'Der Ortsentwurf hält Bewohner, Wege und die einzelnen Gebäude fest.' },
      { id: 'haus-uferlaternen', category: 'allies', target: uferlaternen, role: 'Gemeinsamer Fähr- und Warndienst', note: 'Haus Celynbarth stellt das Fährhaus bereit. Der Bund führt den Dienstplan der Leute beider Ufer.' },
      { id: 'haus-baeder', category: 'allies', name: 'Die Lotshöfe am oberen Ufer', role: 'Vorgesehenes Arbeitsbündnis', note: 'Die Höfe stellen bei Hochwasser Leute und Bretter. Gelynwacht übernimmt Wegwarnungen und die Lagerung.' },
      { id: 'haus-hochsteg', category: 'rivals', name: 'Fährbetrieb am Hochsteg', role: 'Konkurrenz um die Nebenroute', note: 'Die beiden Seiten streiten darüber, ob nach dem Brückenschaden noch Durchfahrtkosten anfallen.' }
    ],
    members: [
      { id: 'haus-sian', name: 'Sian Celynbarth', role: 'Hausvorsteherin und Siegelhalterin', branch: 'Hauptlinie', note: 'Mutter von Mared und Rhufon. Kennt die alten Wegvereinbarungen und hütet die Urkunden.' },
      { id: 'haus-mared', target: mared, role: 'Älteste Tochter, Botin und angehende Heroldin', branch: 'Hauptlinie', note: 'Ihr eigener Figurenentwurf enthält die offenen Fragen zur Nachfolge.' },
      { id: 'haus-rhufon', name: 'Rhufon Celynbarth', role: 'Jüngerer Sohn, Ansprechpartner für Händler', branch: 'Hauptlinie', note: 'Führt das Lagerbuch und möchte einen regelmäßigen Markttag am unteren Ufer einrichten.' },
      { id: 'haus-elin', name: 'Elin Celynbarth', role: 'Verwalterin des Fährhauses', branch: 'Fährhauslinie', note: 'Sians Cousine. Hält mit den Familien am unteren Ufer den Fährdienst in Betrieb.' }
    ],
    retinue: [
      { id: 'haus-tomas', name: 'Tomas vom Brückenhof', role: 'Fährmeister', branch: 'Dienst auf Gelynwacht', note: 'Kennt Ausweichstege, prüft Seile und führt ein eigenes Wasserbuch.' }
    ],
    seats: [
      { id: 'sitz-gelynwacht', name: 'Gelynwacht', region: 'Waldhügel von Celtigerns Wacht', image: art('celynbarth-gelynwacht'), format: 'landscape', note: 'Sitz mit kleinem Archiv, Furtwache, Lagerhof und zwei Kammern für Boten.' },
      { id: 'sitz-faehrhaus', name: 'Unteres Fährhaus', region: 'Flussabwärts von Gelynwacht', note: 'Dienstsitz der Nebenlinie mit Anlegesteg, Bootsschuppen und Ersatzseilen.' }
    ],
    abilities: [
      { id: 'haus-wegzeichen', name: 'Pegel- und Wegzeichen', kind: 'tradition', note: 'Die Fährleute und Kinder des Hauses lernen dieselben Warnzeichen für Ufer, Strömung und gesperrte Wege.', limits: 'Die Zeichen gelten lokal und werden bei Hochwasser von den Uferhöfen gemeinsam angepasst.' },
      { id: 'haus-lotsenrecht', name: 'Geplantes Lotsenrecht', kind: 'privilege', note: 'Vorschlag für einen Rechtsanspruch auf Lotsendienst und gedeckte Lagerung.', limits: 'Abhängig von der noch offenen Lehnseinigung und der Mitsprache der Uferhöfe.' }
    ],
    timeline: [
      { id: 'haus-anfang', date: 'Vor drei Generationen', name: 'Errichtung des ersten Furtzeichens', note: 'Die Fährleute stellen der ersten Hausherrin einen Lagerplatz zur Verfügung.' },
      { id: 'haus-hochwasser', date: 'Vor drei Wintern', name: 'Hochwasser beschädigt die Brücke', note: 'Der Verkehr weicht auf Höhenroute und Fähre aus.' },
      { id: 'haus-versammlung', date: 'Beginn des Entwurfs', name: 'Sian lädt zur Versammlung', note: 'Beide Ufer bringen Quittungen und Vorschläge für die Reparatur mit.' }
    ],
    sources: [
      { id: 'haus-cenyr', name: 'Herrschaftswerkstatt von Cenyr', url: '../Herrschaftsverwaltung/Cenyr/index.html', note: 'Vorhandene Ämter und Herrschaften bieten Anknüpfungspunkte für die Varianten der Dienstbindung.' }
    ]
  }, now);
}
