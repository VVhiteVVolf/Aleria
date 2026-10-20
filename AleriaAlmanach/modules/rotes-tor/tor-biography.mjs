import { PENRUDD_MOTTO } from './penrudd-household.mjs';
import { TOR_EMBLEM, TOR_FAMILY_LINK, torFamilyConnection } from './tor-people.mjs';

export function buildCarwynBiography() {
  return {
    crestImage: TOR_EMBLEM, biographyTitle: 'Ein Wirt, der erst einmal zuhört',
    biographyText: '<p><strong>Carwyn Penrudd</strong> ist sechsundvierzig und kennt das Haus seit seiner Kindheit. Er lässt einen Reisenden ausreden, bevor er nach der Kammer fragt, und merkt sich eher ein Zugpferd als einen großen Titel. Seine Geduld ist keine Unentschlossenheit: Wird ein Gast laut oder will seine Zeche fortreden, bleibt Carwyn freundlich und rückt das Rechnungsbrett ein Stück näher.</p><p>Er führt den Gasthof mit seiner Frau <strong>Olwen</strong>. Ihr Herd und sein Tresen bestimmen den Tag. Über Zimmer und offene Beträge weiß Mared Bescheid; Aled nimmt Pferde und Fuhrwerke an. Carwyn springt dort ein, wo eine Hand fehlt, und möchte von wichtigen Absprachen erfahren, bevor sie am nächsten Morgen jemand anders ausbaden muss.</p>',
    historyTitle: 'Von Gwilyms Bank an den Tresen',
    historyText: '<p>Carwyn wurde 1694 als ältester Sohn Gwilyms und Enids geboren. Seit 1715 ist er mit Olwen verheiratet; ihre Kinder heißen Aled, Mared und Dewi. Sein Vater hat die tägliche Leitung inzwischen abgegeben. Gwilym erzählt noch immer gern die Geschichte vom rot gestrichenen Nordtor, während Enid gelegentlich Vorräte prüft und beim Einmachen hilft.</p><p>Sein Onkel Tudur und sein Vetter Meurig bewirtschaften den nahen Penrudd-Hof. Mit ihnen vereinbart Carwyn feste Lieferungen und bezahlt, was das Haus bezieht. Die verwandtschaftliche Nähe erleichtert die Absprachen; sie ersetzt weder die Ernte noch eine Lieferrechnung.</p>',
    abilitiesTitle: 'Was ihn als Gastgeber auszeichnet',
    abilities: [
      { title: 'Ein ruhiger Tresen', icon: '♧', detail: 'Hört zu, merkt sich Gewohnheiten und beendet Streit möglichst vor dem ersten umgeworfenen Krug.' },
      { title: 'Praktischer Blick', icon: '⚒', detail: 'Prüft Vorräte und nötige Reparaturen, bevor aus einer Kleinigkeit ein verlorener Betriebstag wird.' },
      { title: 'Klare Absprachen', icon: '◈', detail: 'Zimmer, Pferdefutter und Zeche werden vor der Abreise geklärt. Große Versprechen kauft er niemandem ab.' }
    ],
    worksTitle: 'Seine Aufgaben', works: ['Ausschank, Einkauf und Absprachen mit Gästen und Lieferanten.', 'Einteilung der Familienarbeit gemeinsam mit Olwen; Unterstützung von Empfang, Haus und Hof.'],
    triviaTitle: 'Im Haus', trivia: ['Olwen verantwortet die Küche und entscheidet, was nach Vorrat noch auf den Tisch kommt.', 'Den angeblichen Auftrag des damaligen Grafen zum Rotstreichen hat Carwyn noch nie selbst gesehen. Gwilym hält das nicht vom Erzählen ab.'],
    quotesTitle: 'Wahlspruch des Hauses', quotes: [PENRUDD_MOTTO],
    connectionsTitle: 'Die nächsten Hände', connections: ['olwen', 'mared', 'aled', 'hywel'].map(torFamilyConnection),
    documentsTitle: 'Familie und Herkunft', documents: [{ title: 'Haus Penrudd', icon: TOR_EMBLEM, text: 'Der vollständige Stammbaum mit Wirtszweig und Hofzweig.', link: TOR_FAMILY_LINK }]
  };
}

export function buildPenruddHouseBiography() {
  return {
    crestImage: TOR_EMBLEM, biographyTitle: 'Eine Familie an zwei Herdstellen',
    biographyText: '<p>Das offene rote Tor und die helle Laterne stehen für das Versprechen der <strong>Penrudds</strong>: ein Platz am Feuer für den, der unterwegs ist. Die Familie gehört zu den Bürgerhäusern im Dienst des Hauses Draig. Ihr Gasthof liegt unmittelbar vor Gwynthors Nordtor, ihr zweiter Haushalt auf dem nahen Penrudd-Hof.</p>',
    historyTitle: 'Das Tor, das längst wieder grau ist',
    historyText: '<p>Ein früher Penrudd soll nach einer durchzechten Nacht das Stadttor vollständig rot gestrichen haben, überzeugt, der damalige Graf habe es befohlen. Als die Stadtwache ihn morgens zur Rede stellte, habe er nur gefragt, warum sie ihm dann die ganze Nacht beim Streichen zugesehen habe. Das Tor wurde wieder überstrichen. Der Name der Herberge blieb.</p><p>Wer jener Vorfahr war, ist nicht sicher überliefert. Der Stammbaum beginnt deshalb mit unbekannten Gründern, führt über den Hausknoten und einen Zeitsprung zu <strong>Madoc und Nest</strong>. Ihre Söhne begründen die heutigen Haushalte: <strong>Gwilym und Enid</strong> stehen für den Wirtszweig, <strong>Tudur und Bethan</strong> für den Hofzweig.</p>',
    abilitiesTitle: 'Die Verbindung zum Hof',
    abilities: [
      { title: 'Lebensmittel', icon: '❧', detail: 'Milch, Butter, Käse, Eier, Geflügel und saisonales Gemüse ergänzen Olwens Einkauf. Gelegentliches Schlachtvieh verarbeitet ein örtlicher Fleischer.' },
      { title: 'Futter und Fuhrwerk', icon: '☷', detail: 'Heu und Hafer kommen nach Lieferlage vom Hof. Gethin fährt dessen Lieferungen; er ist kein zusätzlicher Stallknecht der Herberge.' },
      { title: 'Zwei Hauskassen', icon: '◈', detail: 'Meurig und Carwyn rechnen Lieferungen ab. Der Hof bedient weitere Kunden; die Herberge kauft Brot, Getränke und weitere Zutaten anderswo ein.' }
    ],
    worksTitle: 'Die gegenwärtigen Haushalte', works: [
      'Carwyn und Olwen führen den Gasthof mit Aled, Cerys, Mared, Hywel, Ffion und Rhosyn. Gwilym und Enid leben im Altenteil.',
      'Tudur und Bethan bewirtschaften den Hof mit Meurig, Nia, Gethin und Eluned. Lowri lernt dort unter Anleitung; Osian ist noch ein Kind.'
    ],
    triviaTitle: 'Die jüngere Generation', trivia: ['Aled und Cerys haben den zweijährigen Rhys; Hywel und Ffion die Kinder Iwan und Eleri. Dewi ist Carwyns dreizehnjähriger Sohn.', 'Kinder übernehmen höchstens kleine altersgemäße Hilfen. Sie ersetzen keine regulären Dienststellen.'],
    quotesTitle: 'Wahlspruch', quotes: [PENRUDD_MOTTO],
    connectionsTitle: 'Die beiden Zweige', connections: ['gwilym', 'enid', 'tudur', 'bethan', 'meurig', 'nia', 'gethin', 'eluned'].map(torFamilyConnection),
    documentsTitle: 'Haus und Lage', documents: [
      { title: 'Der Stammbaum der Penrudds', icon: TOR_EMBLEM, text: 'Alle Angehörigen und Verbindungen in der vorhandenen Familienakte.', link: TOR_FAMILY_LINK },
      { title: 'Der Bannkreis Gwynthor', icon: '../IconOrdner/Welt Pins/Bauernsiedlung.png', text: 'Gasthof und Lieferhof auf der Karte des Umlands.', link: '../Karten/karte.html?map=cenyr-celtigerns-wacht-llamrais-ankunft-gwynthor-bannkreis' }
    ]
  };
}
