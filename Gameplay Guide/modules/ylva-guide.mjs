import { ylvaWeaponAdvice, ylvaWeaponCombos } from './ylva-weapon-guide.mjs';
export const ylvaGuide = {
  reviewedAt: '2026-10-14',
  slug: 'ylva', id: 'bSYZYAEOwiRgy44f6OmO', name: 'Lady Ylva Bleiddorn / Wolfshorn', eyebrow: 'Grenzerin · Skytte',
  title: 'Speerführung zwischen Jagd und Grenzwacht',
  intro: 'Ylva hält den Gegner mit Dornwacht auf Abstand und sucht die Öffnung für einen zweiten Stoß. Ihre Stärke liegt in präzisen Speerangriffen, einem großen TP-Vorrat und gezielter Kontrolle. Kurze Bonusangriffe ergänzen ihre Stöße; mehrteilige Angriffe, Entwaffnung und Abwehr konkurrieren um die Reaktion.',
  image: 'assets/ylva-chibi.png', imageAlt: 'Chibi-Ylva mit Dornwacht und einem Leckerli, dem skeptischen Freki und Silberkrone mit silbernen Zöpfen.',
  weaponId: 'ylva-speer', weaponIds: ['ylva-speer', 'ylva-saex', 'ylva-handaxt'],
  companionIds: ['companion-ylva-freki', 'companion-ylva-silberkrone'],
  narratives: {
    'Der fallende Dorn': 'Ylva senkt die Spitze, zwingt die gegnerische Deckung nach unten und setzt mit einem zweiten Speerstoß nach.',
    'Schafthebel': 'Der Speerschaft gleitet hinter die geführte Waffe. Mit einer kurzen Drehung versucht Ylva, sie aus dem Griff zu hebeln.',
    'Aus der Angriffslinie': 'Ylva liest Schulter und Waffenhand des Gegners und nimmt ihren Körper aus der angekündigten Stoßbahn.',
    'Speer am Wildpfad': 'Ein kurzer, gerader Stoß aus sicherem Stand. Dornwacht kehrt unmittelbar in die Deckung zurück.',
    'Stand hinter dem Speer': 'Ylva hält den Schaft eng vor dem Körper und fängt den gegnerischen Druck mit einer geschlossenen Haltung auf.'
  },
  identity: 'Ihre persönliche Ausbildung erlaubt Geschicklichkeit für Speere und verbessert Bogen und Speer. Saex und Handaxt erhalten diese Ausbildungsboni nicht. Dieser Guide konzentriert sich auf Nahkampf; der Langbogen bleibt verstaut.',
  decisions: [
    ['Ein günstiges Angriffsfenster?', 'Zwei Dornen und Kurzer Jagdstoß nutzen alle regulären Ressourcen ohne Besondere Aktion. Brechender Dorn ist eine teurere Spitze mit möglicher Entwaffnung.'],
    ['Ein langer Kampf?', 'Speer am Wildpfad als günstige Grundlage. Durchschnaufen erst einsetzen, wenn ausreichend TP fehlen. Besondere Aktionen für entscheidende Momente behalten.'],
    ['Eine gefährliche gegnerische Waffe?', 'Schafthebel nimmt bewusst keinen Schaden mit. Er lohnt sich, wenn eine fallengelassene Waffe den gegnerischen Plan stärker stört als ein Treffer.']
  ],
  combos: [
    ...ylvaWeaponCombos,
    { title: 'Die Öffnung für den zweiten Stoß', mode: 'aggressiv', actions: ['Der fallende Dorn'],
      text: 'Zwei getrennte Angriffe auf dasselbe Ziel. Trifft der erste, folgt GES SG 15: Nur bei Scheitern bekommt der unmittelbare zweite Angriff Vorteil und einen zusätzlichen Waffenwürfel. Nach einem verfehlten Auftakt folgt trotzdem ein normaler zweiter Angriff.',
      caution: 'Die Bonusaktion bleibt frei. Die Reaktion ist bereits bezahlt; keine zusätzliche Speerabwehr im selben Beitrag.' },
    { title: 'Angreifen und Kräfte sammeln', mode: 'ausdauer', actions: ['Speer am Wildpfad', 'Durchschnaufen'],
      text: 'Ein regulärer Speerangriff und bei Bedarf die einmalige Heilung. Die Reaktion bleibt für eine andere zulässige Option frei. Ohne fehlende TP lässt du Durchschnaufen weg.',
      caution: 'Durchschnaufen steht einmal pro langer Rast zur Verfügung. Der Einsatz lohnt sich besonders, wenn die Heilung weitgehend ausgeschöpft werden kann.' },
    { title: 'Die nächste Waffenführung stören', mode: 'kontrolle', actions: ['Speer gegen den Schritt'],
      text: 'Verbindet Schaden mit einer Störung des nächsten gegnerischen Waffenangriffs, falls dessen KRF-Rettungswurf misslingt. Sinnvoll gegen eine gefährliche nächste Antwort.',
      caution: 'Der aktuelle Stellungseffekt gibt einmal −1 Angriff. Der alte Name bedeutet keine zusätzliche freie Bewegung oder dauerhafte Fesselung.' },
    { title: 'Die geführte Waffe lösen', mode: 'kontrolle', actions: ['Schafthebel'],
      text: 'Persönlicher, schadensloser Speerangriff. Nach Treffer entscheidet KRF SG 14 über die Entwaffnung. Die Waffe bleibt ein aufnehmbarer Szenengegenstand. Ein kritischer Erfolg macht daraus keinen Verletzungstreffer.',
      caution: 'Treffer und misslungener Rettungswurf sind nötig. Gegen Körperwaffen entsteht lediglich der beschriebene Angriffsmalus. Waffenwechsel oder Aufheben bleiben mögliche Antworten.' },
    { title: 'Den Gegenschlag vorbereiten und meiden', mode: 'ausdauer', actions: ['Speer am Wildpfad', 'Aus der Angriffslinie'],
      text: 'Ein günstiger Angriff, dann vorbereitete persönliche Abwehr: Der nächste eingehende Waffen- oder Technikangriff hat Nachteil. Die Bonusaktion bleibt frei.',
      caution: 'Kostet eine Besondere Aktion. Nur ein Angriff einer Folge wird erschwert; auch ein Fehlschlag verbraucht die Abwehr. Vor dem gegnerischen Wurf vorbereiten.' },
    { title: 'Speerstoß aus geschlossener Deckung', mode: 'ausdauer', actions: ['Speer am Wildpfad', 'Stand hinter dem Speer'],
      text: 'Ein Angriff zusammen mit +2 RK und 1W4 temporären TP. Gut, wenn mehrere gegnerische Angriffe zu erwarten sind und eine einmalige Ausweichwirkung nicht genügt.',
      caution: 'Temporäre TP werden nicht addiert. Positive RK-Haltungen stapeln sich nicht; die stärkste zählt. Die Besondere Aktion fehlt später für den fallenden Dorn.' }
  ],
  techniques: [
    ...ylvaWeaponAdvice,
    ['Der fallende Dorn', 'Spitze', 'Starker Einsatz begrenzter Ressourcen. Besonders attraktiv, wenn beide Treffer Aussicht haben und das Ziel den GES-Rettungswurf schwer schafft.'],
    ['Speer am Wildpfad', 'Alltag', 'Solider Angriff mit nur einer Aktion. Hält die übrigen Ressourcen für Heilung oder Abwehr offen.'],
    ['Speer aus dem Knie', 'Alternative', 'Mechanisch sehr ähnlich zu Speer am Wildpfad. Eine andere Beschreibung bringt keinen zusätzlichen Angriff.'],
    ['Speer gegen den Schritt', 'Kontrolle', 'Schaden plus möglicher einmaliger Angriffsmalus; beansprucht auch die Reaktion.'],
    ['Abstand mit dem Speer', 'Abwehr', 'Angriff und +1 RK. Eine stärkere bereits aktive RK-Haltung wird dadurch nicht weiter erhöht.'],
    ['Stand hinter dem Speer', 'Abwehr', 'Breitere Deckung mit temporären TP; wegen der Besonderen Aktion bewusst einsetzen.'],
    ['Schafthebel', 'Persönlich', 'Entwaffnung ohne direkten Schaden. Besonders interessant gegen eine wichtige geführte Waffe; weniger gegen leicht austauschbare Ausrüstung.'],
    ['Aus der Angriffslinie', 'Persönlich', 'Einmalige Abwehr gegen einen erwarteten gefährlichen Waffenangriff. Gegen viele kleine Einzelangriffe ist der Schutz schnell aufgebraucht.'],
    ['Sax im Unterholz', 'Nebenwaffe', 'Erst mit passender Nebenwaffe verfügbar. Kann nach Rettungswurf die Waffenführung stören, verliert aber Ylvas Speerboni.']
  ],
  equipment: [
    ['Dornwacht', 'Die natürliche Hauptwaffe. Einhändig mehr Treffergenauigkeit; zweihändig W10 statt W8, dafür −1 Angriff. Bei hoher gegnerischer RK ist der größere Würfel nicht automatisch besser.'],
    ['Saex & Handaxt', 'Reserven bei Entwaffnung und für die passenden Nebenwaffentechniken. Ein Wechsel kostet regulär eine Bonusaktion. Eine am Gürtel getragene Waffe liefert keinen kostenlosen Zweitangriff.'],
    ['Jagdleder', 'Der Schutz gegen Hieb und Stich gilt je Schadensinstanz. Giftwiderstand im Rettungswurf ist nützlich, hilft aber nicht gegen jede beliebige Zustandswirkung.']
  ],
  companions: [
    { id: 'companion-ylva-freki', image: '/AleriaAlmanach/assets/companions/wolfshorn/concepts/2026-10-13/references/freki-bisheriges-portrait.png', title: 'Freki · Gemeinsamer Druck und Fesselbiss',
      paragraphs: ['Allein hält Ylva ihre Ressourcen für Angriff und Deckung zusammen. Mit Freki kann sie denselben Gegner unter Druck setzen, während er mit seinen eigenen Aktionen handelt. Seine Anwesenheit gibt ihr weder pauschalen Vorteil noch kostenlose Bisse.',
        'Aggressiv: Frekis Wuchtiger Jagdsprung nutzt eine Besondere Aktion für stärkeren Schaden; Schneller Fang ist sein leichter Bonusangriff. Kontrolliert: Fesselbiss stört nach misslungenem Rettungswurf den nächsten Angriff des Ziels. Nur die ausgewiesene Wirkung anwenden.',
        'Ausdauer: Seine defensiven Selbstfähigkeiten kosten seine eigenen Ressourcen. Sein TP-Vorrat ist kleiner als Ylvas; ein angeschlagener Wolf sollte nicht aus Prinzip jede Gegenattacke abfangen. Flankenlauf ist keine automatische Umzingelungsregel.'],
      joke: '„Sitz!“ ist Kommunikation. Ein siebter kostenloser Angriff ist es nicht.' },
    { id: 'companion-ylva-silberkrone', title: 'Silberkrone · Bewegung und berittene Aufstellung',
      paragraphs: ['Silberkrone ist Ylvas Reittier. Vor Kampfbeginn kannst du sie als Startaufstellung wählen; späteres Auf- oder Absitzen verbraucht eine Bonusaktion. Auf dem Bogen bleibt Ylva Skytte: Ein Sattel verleiht ihr keine Uchelwyr-Techniken.',
        'Reiten kann in einer passenden Szene die Positionierung ermöglichen. Bewegung und Reichweite müssen tatsächlich passen; ein Pferd erzeugt keinen kostenlosen Angriff und keine automatische Flucht. Ein eigener Hufschlag benötigt das Ross als aktiven Szenenteilnehmer und seine eigene Aktion.',
        'Der Schild am Sattel gehört zum Bild und Gepäck. Ylva führt keinen Schild und erhält dadurch keinen RK-Bonus. In engen Innenräumen ist ein Kampf zu Fuß häufig die praktikablere Aufstellung.'],
      joke: 'Silberkrone duldet Schlamm. Ungeflochtene Mähnen sind eine andere Angelegenheit.' }
  ],
  pitfalls: ['Der fallende Dorn und Speer gegen den Schritt konkurrieren um dieselbe Aktion und Reaktion.', 'Schafthebel verursacht keinen Schaden, auch wenn Dornwacht einen festen Schadensbonus besitzt.', 'Eine Reaktionssperre nimmt mehrere starke Speeroptionen. Ein einfacher Aktionsangriff bleibt möglich, sofern die Aktion frei ist.', 'Mehrere Vorteilsquellen stapeln sich nicht. Auch mit Vorteil bleibt jeder Trefferwurf ein eigener Wurf.', 'Durchschnaufen möglichst vor Kampfunfähigkeit einsetzen; bei 0 TP ist es keine gewöhnlich verfügbare Selbstrettung.'],
  conclusion: 'Ylva funktioniert mit einem klaren Wechsel zwischen verlässlichen Einzelangriffen und gezielten Spitzen. Ihre neuen Bonus- und Reaktionsangriffe erlauben mehrere Treffer pro Beitrag. Die Dreierfolge erzwingt die Rettung gegen den Feger, bindet dafür aber alle regulären Ressourcen. Gegen hohe Rüstung sind wenige kräftige Treffer häufig wertvoller als viele kleine.'
};
