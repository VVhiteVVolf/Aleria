export const ylvaWeaponAdvice = [
  ['Kurzer Jagdstoß', 'Ausdauer', 'Günstiger Zusatztreffer für die freie Bonusaktion. Bei starkem Rüstungsschutz kann der kleine Schadenswurf vollständig abgefangen werden.'],
  ['Streifender Dorn', 'Kontrolle', 'Tauscht zwei Punkte Treffergenauigkeit gegen einen kleinen, einmaligen Angriffsmalus. Gegen hohe RK ist der Kurze Jagdstoß verlässlicher.'],
  ['Schaftfang und Stoß', 'Kontrolle', 'Ergänzt einen Aktionsangriff um Schaden und eine mögliche Störung. Die gebundene Reaktion steht anschließend nicht für Abwehr bereit.'],
  ['Brechender Dorn', 'Spitze', 'Verbindet hohen Schaden mit Entwaffnung. Kostet eine Besondere Aktion; sinnvoll gegen eine wichtige geführte Waffe. Körperwaffen lassen sich nicht ablegen.'],
  ['Zwei Dornen', 'Aggressiv', 'Zwei eigene Trefferwürfe ohne Besondere Aktion. Beide tragen den festen Schadensbonus; Rüstung wirkt gegen jeden Treffer einzeln.'],
  ['Niederhaltender Stoß', 'Kontrolle', 'Bindet nach Treffer und misslungener Rettung die gegnerische Reaktion bis zum Ende des nächsten eigenen Beitrags. Die eigene Reaktion bleibt frei.'],
  ['Drei Dornen, ein Sturz', 'Kontrolle', 'Drei Chancen auf Schaden und immer eine abschließende GES-Rettung SG 18. Bindet alle drei regulären Ressourcen. Der Vorteil entsteht erst danach und gilt bis zum Ende von Ylvas nächstem Beitrag.'],
  ['Kurzer Schneidenzug', 'Nebenwaffe', 'Leichter Bonusangriff mit Sax oder Handaxt. Bei den aktuellen Werten nur 1W4: feste +1 werden für diesen leichten Angriff abgerundet.'],
  ['Rückschnitt', 'Nebenwaffe', 'Eigenständiger Angriff mit der Reaktion. Er kann einen Aktionsangriff ergänzen; er wartet nicht automatisch auf einen gegnerischen Angriff.'],
  ['Wolfsgriff', 'Nebenwaffe', 'Schaden und mögliche Reaktionssperre mit Sax oder Handaxt. Eine teure Spitze, wenn die Nebenwaffe bereits geführt wird; ein Waffenwechsel würde dieselbe Bonusaktion beanspruchen.']
];

export const ylvaWeaponCombos = [
  { title: 'Drei Dornen und der tiefe Feger', mode: 'kontrolle', actions: ['Drei Dornen, ein Sturz'],
    text: 'Ylva setzt drei Angriffe und lässt den Handgriff zur Finte werden. (Je eigener Trefferwurf; 1W4, 1W8, 1W6 + Schadensbonus. Danach immer GES SG 18, auch bei drei Fehlschlägen.)',
    caution: 'Nach misslungener Rettung bleibt die Reaktion des Ziels bis zum Beginn seines nächsten Beitrags gesperrt. Ylvas Vorteil gilt nur gegen dieses Ziel und endet am Ende ihres nächsten Beitrags. Er verstärkt keinen der bereits gewürfelten drei Schläge. Die Technik entzieht keine zusätzliche Bonusaktion.' },
  { title: 'Zwei volle Stöße und ein kurzer Abschluss', mode: 'aggressiv', actions: ['Zwei Dornen', 'Kurzer Jagdstoß'],
    text: 'Ylva folgt den beiden wechselnden Stoßlinien mit einem schnellen Abschluss. (Aktion + Reaktion + Bonusaktion; drei getrennte Trefferwürfe, keine Besondere Aktion.)',
    caution: 'Gegen schwere Rüstung werden drei Schadensinstanzen getrennt gemindert. Der kurze Abschluss erhält nur den halben positiven Schadensbonus und keinen Ausbildungswürfel.' },
  { title: 'Druck ohne begrenzten Vorrat', mode: 'ausdauer', actions: ['Speer am Wildpfad', 'Kurzer Jagdstoß'],
    text: 'Ein geführter Stoß hält die Mitte, der schnelle Nachsatz nutzt die freie Öffnung. (Aktion + Bonusaktion; Reaktion und Besondere Aktionen bleiben erhalten.)',
    caution: 'Durchschnaufen und ein bezahlter Waffenwechsel benötigen ebenfalls die Bonusaktion. Entscheide vor dem Nachsatz, ob Heilung oder ein Wechsel dringender ist.' },
  { title: 'Die Deckung treffen und die Waffe lösen', mode: 'aggressiv', actions: ['Speer am Wildpfad', 'Brechender Dorn'],
    text: 'Ylva prüft die Deckung mit dem ersten Stoß und setzt mit dem kräftigen Hebelangriff nach. (Aktion + Bonusaktion + Reaktion + 1 Besondere Aktion; Entwaffnungsrettung nur nach Treffer des Brechenden Dorns.)',
    caution: 'Beansprucht alle regulären Ressourcen und einen begrenzten Vorrat. Keine zusätzliche Reaktionsabwehr im selben Beitrag; gegen eine leicht ersetzbare Waffe lohnt sich die Investition seltener.' },
  { title: 'Kurze Klinge, drei klare Zeitpunkte', mode: 'aggressiv', actions: ['Klinge am Wildwechsel', 'Rückschnitt'],
    text: 'Ylva schneidet in die Flanke, kehrt in Deckung zurück und führt einen engen Rückschnitt. (Aktion + Bonusaktion + Reaktion. Beide Techniken funktionieren mit Sax und Handaxt.)',
    caution: 'Die passende Nebenwaffe muss bereits geführt werden. Sax verursacht den größeren Waffenwürfel; die Handaxt bietet bei Ylvas aktueller Ausrüstung einen besseren Trefferbonus.' }
];
