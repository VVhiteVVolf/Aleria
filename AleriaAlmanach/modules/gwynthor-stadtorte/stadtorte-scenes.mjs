const paragraphs = (...texts) => texts.map(text => `<p>${text}</p>`).join('');

// These IDs also own the permanent scene threads. Prose and order may change;
// identities must not. These are POIs within the existing city, not districts.
export const GWYNTHOR_CITY_PLACES = Object.freeze([
  {
    id: 'gwynthor-osttor', title: 'Gwynthor Osttor', artVersion: 2,
    subtitle: 'Torbrücke, kleiner Vorort und Brunnenplatz am Gestüt',
    cover: 'osttor-torbruecke', scenes: [
      {
        id: 'osttor-torbruecke', title: 'Osttor · An der Torbrücke',
        intro: paragraphs(
          'Vor dem Osttor führt die steinerne Brücke an die geschlossenen Torflügel. Davor stehen Cochllamwyr in ihren roten Mänteln und bewachen den Zugang. Hinter der hohen Mauer steigen die Dächer Gwynthors auf; unter der Brüstung zieht das Wasser vorbei.',
          'Am Brückenrand lässt sich das Gepäck absetzen. Wer Einlass sucht oder jemanden erwartet, kann hier warten und die Stadtwachen ansprechen. Zwischen dem leisen Wasser und den massigen Tortürmen beginnt die Begegnung vor den geschlossenen Toren.'
        ),
        hint: 'Vor dem geschlossenen Osttor warten oder die Cochllamwyr ansprechen.',
        emptyTitle: 'Vor den geschlossenen Torflügeln', emptyText: 'Die Cochllamwyr bewachen den Zugang zur Stadt.',
      },
      {
        id: 'osttor-vorort', title: 'Vor dem Osttor · Der kleine Vorort',
        intro: paragraphs(
          'Noch außerhalb der Stadtmauer säumen niedrige Häuser und kleine Höfe die Zufahrt zum Osttor. Zwischen einem hölzernen Vordach und einer Hauswand bleibt ein breiter Streifen Weg frei. Über den Dächern des kleinen Vororts stehen die Tortürme; dahinter beginnt die viel größere Stadt.',
          'Jemand zieht einen Wagen unter das Vordach, während Reisende ihre Bündel ordnen. Das Osttor bleibt geschlossen; Cochllamwyr stehen davor Wache. Hier kann eine Reisegesellschaft zusammenfinden oder auf Nachricht vom Tor warten. Das Stimmengewirr der Stadt kommt nur als fernes Rauschen herüber.'
        ),
        hint: 'Eine Begegnung im kleinen Vorort außerhalb der östlichen Stadtmauer.',
        emptyTitle: 'Noch vor den Mauern', emptyText: 'Die Zufahrt führt zwischen den niedrigen Häusern zur Torbrücke.',
      },
      {
        id: 'osttor-brunnenplatz', title: 'Hinter dem Osttor · Brunnenplatz am Gestüt', imagePosition: 'center 65%',
        intro: paragraphs(
          'Innerhalb der Mauern weitet sich die Straße nahe dem Osttor zu einem Brunnenplatz. Am steinernen Becken stehen Eimer; daneben führt ein offenes Hoftor zu Stallungen und dem nahen Gestüt. Ein Pferd wird zur Tränke geführt. Zwischen den höheren Stadthäusern laufen Gassen tiefer nach Gwynthor hinein.',
          'Am Brunnen lässt sich Wasser holen, Gepäck neu ordnen oder auf eine Begleitung warten. Vom Hof sind Hufschritte zu hören. Die Torflügel im Hintergrund sind geschlossen; davor halten Cochllamwyr Wache. Der Platz lässt Raum für ein Gespräch nahe dem bewachten Zugang.'
        ),
        hint: 'Eine Rast am Brunnen oder eine Begegnung vor dem Gestüt.',
        emptyTitle: 'Wasser und Hufschritte', emptyText: 'Am Brunnen bleibt ein freies Stück Rand zum Warten.',
      }
    ]
  },
  {
    id: 'gwynthor-westtor', title: 'Gwynthor Westtor', artVersion: 2,
    subtitle: 'Torbrücke, Häuser vor der Mauer und ein innerer Ankunftsplatz',
    cover: 'westtor-torbruecke', scenes: [
      {
        id: 'westtor-torbruecke', title: 'Westtor · Zwischen Brücke und Mauern',
        intro: paragraphs(
          'Die Brücke am Westtor führt über den Wasserlauf an die alte Stadtmauer. Zwischen den runden Türmen sind die hohen Torflügel geschlossen. Davor halten Cochllamwyr mit roten Mänteln und den Schilden der Stadt Wache. Oberhalb der Mauer zeichnet sich der befestigte westliche Stadtkern ab.',
          'Neben der Brüstung bleibt eine kleine Stelle zum Warten. Reisende können ihr Gepäck abstellen und sich an die Stadtwachen wenden. Wer eine Begleitung erwartet, behält von hier die Zufahrt im Blick; der Weg endet vorerst vor dem bewachten Tor.'
        ),
        hint: 'Ein Treffen auf der Westtorbrücke vor den geschlossenen Torflügeln.',
        emptyTitle: 'Warten vor dem Westtor', emptyText: 'Vor den geschlossenen Toren stehen die Cochllamwyr.',
      },
      {
        id: 'westtor-vorort', title: 'Vor dem Westtor · An der Zufahrt',
        intro: paragraphs(
          'Vor der westlichen Mauer liegen ein paar niedrige Häuser mit kleinen Höfen an der Zufahrt. Unter einem vorspringenden Holzdach steht ein Wagen im Schatten. Der Weg führt weiter zur Brücke; darüber sind die Türme des Westtors zu sehen, hinter ihnen die Dächer der Stadt und die höheren westlichen Hänge.',
          'Hier werden Riemen nachgezogen und Reisebündel umgepackt. Das Westtor ist geschlossen, Cochllamwyr bewachen die Torflügel. Wer jemanden außerhalb der Stadt treffen möchte, findet am Rand des Wegs einen gut sichtbaren Warteplatz.'
        ),
        hint: 'Ein Aufbruch oder eine Begegnung außerhalb des Westtors.',
        emptyTitle: 'Die Stadt liegt hinter der Brücke', emptyText: 'Unter dem Vordach lässt sich auf die Reisebegleitung warten.',
      },
      {
        id: 'westtor-ankunftsplatz', title: 'Hinter dem Westtor · Am Ankunftsplatz',
        intro: paragraphs(
          'Gleich hinter dem Westtor gibt die Straße einen kleinen gepflasterten Platz frei. Ein länglicher Brunnen steht an der Seite, gegenüber ein offener Hof, in dem Wagen kurz aus dem Durchgang gezogen werden können. Höhere Häuser und schmale weiterführende Gassen schließen den Platz ein.',
          'Ein Träger stellt seine Last am Brunnen ab. Am geschlossenen Tor halten Cochllamwyr Wache; ihre roten Mäntel sind vom Platz aus zu erkennen. Am Rand des Hofs kann sich eine Gruppe sammeln. Zwischen Brunnen und Hauseingängen bleibt Raum für Wegauskünfte und Verabredungen.'
        ),
        hint: 'Eine Pause hinter dem Tor, eine Wegfrage oder ein gemeinsamer Aufbruch.',
        emptyTitle: 'Ein freier Platz neben dem Verkehr', emptyText: 'Vom Brunnen aus lassen sich Torbogen und weiterführende Gassen überblicken.',
      }
    ]
  },
  {
    id: 'gwynthor-hafen', title: 'Gwynthor Hafen', artVersion: 1,
    subtitle: 'Westhafen, Zentraler Hafen und Südtor-Hafen im Südosten',
    cover: 'hafen-zentral', scenes: [
      {
        id: 'hafen-west', title: 'Westhafen · Am alten Kai',
        intro: paragraphs(
          'Am Westhafen liegt ein ruhigerer Abschnitt des alten Kais. Breite Steinstufen führen ans Wasser; Taue laufen von den Pollern zu einem vertäuten Segler. Hinter dem Kai stehen schlichte Speicherfassaden. Über ihnen verlieren sich die Dächer Gwynthors in mehreren Reihen.',
          'Ein paar Säcke warten neben einer geschlossenen Tür auf ihren Weitertransport. Vom Wasser kommen das Knarren eines Rumpfs und Stimmen aus einem Boot. Hier lässt sich auf eine Ankunft warten oder ein Gespräch abseits des lauteren Umschlags führen, während der Hafenbetrieb weitergeht.'
        ),
        hint: 'Eine Begegnung am alten Kai des Westhafens.',
        emptyTitle: 'Taue knarren am Poller', emptyText: 'Zwischen Steinstufen und Speicherwand ist Platz zum Warten.',
        subject: 'WESTHAFEN von Gwynthor, ruhiger alter steinerner Kai in einer großen mittelalterlichen Hafenmetropole. Ein breiter Steinpoller und ein einfaches gespanntes Tau vorne, ein angeschnittener hölzerner Segler am Kai und breite Wasserfläche als große ruhige Formen. Seitlich nur eine helle Speicherfassade, dahinter weich gestaffelte städtische Dächer. Zwei kleine Hafenarbeiter neben zwei Säcken; ferne Masten nur drei oder vier schlichte Linien. Keine Piratenflaggen, keine riesige Flotte, keine Industriebauten. Ortsgefühl durch Raum und Maßstab statt Detailfülle.'
      },
      {
        id: 'hafen-zentral', title: 'Zentraler Hafen · Zwischen den Anlegern',
        intro: paragraphs(
          'Im zentralen Hafen öffnet sich der Blick zwischen den Anlegern auf das Wasser. Ein breiter Kai verbindet die Zugänge zu den Schiffen; dahinter folgen Speicher und die Dächer der Metropole. Über den vertäuten Rümpfen stehen Masten, und vom nächsten Anleger schlägt eine Stimme durch das Rufen der Träger.',
          'Ein Karren wartet am Rand der freien Durchfahrt. Menschen gehen mit Bündeln zum Steg oder halten Ausschau nach einem erwarteten Schiff. Am Kai kann eine Überfahrt beginnen, eine Mannschaft zusammentreffen oder jemand nach langer Reise wieder Boden unter die Füße bekommen.'
        ),
        hint: 'Ankunft, Aufbruch oder ein Treffen zwischen den zentralen Anlegern.',
        emptyTitle: 'Zwischen Stadt und Wasser', emptyText: 'Der breite Kai führt zu den nächsten Anlegern.',
        subject: 'ZENTRALER HAFEN der mittelalterlichen Metropole Gwynthor. Blick auf Augenhöhe entlang eines breiten hellen Steinkais mit einem einzelnen seitlichen Holzsteg, zwei großen vereinfacht gezeichneten angeschnittenen Segelschiffrümpfen und wenigen weit entfernten Masten. Viel ruhiges blaugrünes Wasser und heller Himmel. Hinter dem Hafen einfache breite Speicherformen und mehrere weiche Dachstaffeln einer sehr großen dicht bebauten Stadt, einzelne Türme als Silhouetten. Vier kleine anonyme Menschen und ein Karren, reichlich freier Raum. Ein einziges klares Hafenmotiv, keine wimmelnde Rekonstruktion, kein Panorama aller Bauwerke.'
      },
      {
        id: 'hafen-suedtor', title: 'Südtor-Hafen · Die südöstlichen Stege',
        intro: paragraphs(
          'Im Südosten Gwynthors liegen die Stege des Südtor-Hafens nahe dem Weg zum Tor. Eine steinerne Uferkante geht in hölzerne Anleger über. Hinter einem niedrigen Lagerdach ragt ein Turm der Stadtmauer auf; zwischen den Häusern bleibt der Zugang zur Stadt sichtbar.',
          'Ein kleines Boot liegt an den Stufen, weiter draußen bewegt sich ein Segel über das Wasser. Hier können Ankommende ihr Gepäck sammeln oder sich am Ufer verabreden, bevor es durch die Gassen weitergeht. Wasser schlägt leise gegen die Pfähle, während vom Tor her Wagenräder zu hören sind.'
        ),
        hint: 'Eine Szene an den südöstlichen Stegen nahe dem Südtor.',
        emptyTitle: 'Am südöstlichen Ufer', emptyText: 'Vom Steg führt der Weg zum Südtor und zurück in die Stadt.',
        subject: 'SÜDTOR-HAFEN im SÜDOSTEN der mittelalterlichen Hafenmetropole Gwynthor. Hauptmotiv ein einzelner einfacher Holzsteg an einer steinernen Uferkante und ein kleines vertäutes Ruderboot bei breiten Stufen. Hinter einem einzigen niedrigen Lagerdach ragt seitlich ein runder Stadtmauerturm mit gedecktem rotem Kegeldach auf; eine Lücke zeigt den Weg Richtung Südtor. Dachstaffeln der Großstadt nur als ruhige ferne Flächen, viel offenes blaugrünes Wasser mit einem kleinen entfernten Segel. Zwei anonyme kleine Reisende. Keine nordische Fjordkulisse, keine Steilküste, keine neue Insel oder Leuchtturm.'
      }
    ]
  },
  {
    id: 'gwynthor-stadtzentrum', title: 'Gwynthor Stadtzentrum', artVersion: 1,
    subtitle: 'Die Plaza am großen Park, grüne Wege und der Kathedralbrunnen',
    cover: 'zentrum-park', scenes: [
      {
        id: 'zentrum-plaza', title: 'Die Plaza · Am großen Stadtpark',
        intro: paragraphs(
          'Eine weite gepflasterte Plaza bildet den offenen Übergang zum großen Stadtpark. Hohe Stadthäuser rahmen den Platz; zwischen ihren Fassaden laufen Straßen weiter ins Zentrum. An der Parkseite stehen Bänke unter den ersten Bäumen. Über den Dächern sind die Türme der Großen Kathedrale der Neun zu erkennen.',
          'Die freie Mitte bleibt den Menschen, die den Platz kreuzen. Am Rand warten Spaziergänger und stellen ihre Körbe ab. Wer ein gut sichtbares Treffen im Herzen Gwynthors sucht, kann hier zwischen Stadtwegen und Parkeingang zusammenkommen.'
        ),
        hint: 'Ein Treffen auf der offenen Plaza am großen Stadtpark.',
        emptyTitle: 'Wo Stadtwege zusammenlaufen', emptyText: 'Unter den ersten Parkbäumen stehen die Bänke im Schatten.',
        subject: 'Weite offene PLAZA am Eingang zum GROSSEN STADTPARK im Zentrum der Metropole Gwynthor. Große ruhige helle Pflasterfläche als Hauptmotiv, rechts nur eine Reihe großer grüner Baumkronen und zwei einfache Steinbänke, links zwei hohe drei- bis viergeschossige verputzte Stadthausfassaden. Im Hintergrund vereinfachte Dachstaffeln und die fern angedeuteten hohen gotischen Türme der Großen Kathedrale der Neun. Vier kleine weit auseinander stehende Passanten. Stadtmaßstab, keine Marktstände und kein Dorfplatz, kein zusätzlicher Brunnen als konkurrierendes Hauptmotiv.'
      },
      {
        id: 'zentrum-park', title: 'Der große Stadtpark · Unter den Baumkronen', artVersion: 2,
        intro: paragraphs(
          'Breite Wege führen unter den Baumkronen durch den großen Park im Stadtzentrum. Zwischen den Stämmen liegen offene Rasenflächen; auf einer Bank ist noch Platz. Durch Lücken im Grün bleiben die höheren Dächer Gwynthors sichtbar. Das Rauschen der Blätter mischt sich mit dem fernen Klang der Straßen.',
          'Spaziergänger lassen einander auf dem Weg Raum. Hier kann man ein Gespräch fortsetzen, ohne bei jedem Schritt ausweichen zu müssen, oder einfach auf jemanden warten. Wer zur Plaza oder zum Brunnenplatz vor der Kathedrale möchte, findet von den Parkwegen wieder ins offene Stadtleben.'
        ),
        hint: 'Ein Spaziergang oder eine ruhige Begegnung im großen Stadtpark.',
        emptyTitle: 'Ein freier Platz unter den Bäumen', emptyText: 'Zwischen den Stämmen bleibt die große Stadt sichtbar.',
        subject: 'GROSSER STADTPARK mitten in Gwynthor, NICHT einer der kleinen Marktparkwinkel. Ein breiter heller Weg schwingt zwischen drei großen Baumstämmen und zusammenhängenden matten grünen Baumkronen hindurch, daneben großzügige offene Rasenfläche und eine schlichte Bank. Durch eine breite Lücke sieht man die zusammenhängenden weich gestaffelten hohen Stadtdächer der Metropole. Drei winzige Spaziergänger, ruhiges Tageslicht, klare große Farbflächen. Kein Wald in freier Wildbahn, kein Blumendetailteppich, keine Marktzelte, kein monumentaler Gartenpalast.'
      },
      {
        id: 'zentrum-kathedralbrunnen', title: 'Vor der Kathedrale · Der große Brunnenplatz',
        intro: paragraphs(
          'Vor der Großen Kathedrale der Neun liegt ein offener Brunnenplatz. Ein breites steinernes Wasserbecken mit schlichter Mittelsäule bildet seinen Mittelpunkt. Dahinter steigt die Fassade der Kathedrale auf; seitlich führt ein Weg an den Bäumen des großen Stadtparks entlang.',
          'Am Brunnenrand warten Menschen aufeinander, während andere die Stufen zu den Portalen hinaufgehen. Das Wasser übertönt die leiseren Worte, bis eine Glocke über den Platz klingt. Zwischen Parkweg, Brunnen und Kathedralstufen lässt sich eine Verabredung beginnen oder nach dem Gottesdienst noch verweilen.'
        ),
        hint: 'Ein Treffen am öffentlichen Brunnen vor der Großen Kathedrale der Neun.',
        emptyTitle: 'Wasser vor den Kathedralstufen', emptyText: 'Am breiten Brunnenrand bleibt Platz für eine Begegnung.',
        subject: 'ÖFFENTLICHER BRUNNENPLATZ direkt VOR der Großen Kathedrale der Neun im Zentrum Gwynthors. Ein großer schlichter kreisrunder Steinbrunnen mit breitem Rand und einer einzelnen kurzen Mittelsäule ist das klare Hauptmotiv. Dahinter als große ruhige Form nur der untere Ausschnitt einer monumentalen hellgrauen gotischen Kathedralfassade mit hohem Spitzbogenportal und breiten Stufen; obere Türme dürfen aus dem Bild laufen. Seitlich ein Baum des großen Stadtparks, drei kleine anonyme Besucher, übrige Stadtdächer nur angedeutet. Kein Kreuz als neues Glaubenssymbol, keine Statuengruppe erfundener Gottheiten, keine feingliedrige Ornamentflut, kein innerer Kreuzgang und kein Marktbrunnen.'
      }
    ]
  }
]);

export const cityPlaceSceneVersion = (place, scene) => scene.artVersion ?? place.artVersion;
