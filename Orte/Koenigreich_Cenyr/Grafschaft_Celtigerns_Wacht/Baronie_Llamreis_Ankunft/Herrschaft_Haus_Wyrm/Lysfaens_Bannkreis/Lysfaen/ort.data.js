(function () {
  "use strict";

  const createPlaceData = window.ALERIA_CELTIGERNS_PLACES?.createPlaceData;
  if (typeof createPlaceData !== "function") return;

  const base = createPlaceData("lysfaen", {
    "parentage": {
      "barony": "Llamreis Ankunft",
      "liege": "Haus Wyrm"
    },
    "features": {
      "districts": false,
      "noticeBoard": true
    },
    "presentation": {
      "map": "/Karten/karte.html?map=cenyr-celtigerns-wacht-llamrais-ankunft-wyrm-llysfaen-stadtkarte",
      "images": {
        "bild-einer-stadtwache-png": {
          "src": "/Orte/Koenigreich_Cenyr/Grafschaft_Celtigerns_Wacht/Baronie_Llamreis_Ankunft/Herrschaft_Haus_Wyrm/Lysfaens_Bannkreis/Lysfaen/assets/wache.png",
          "alt": "Wache von Llysfaen",
          "fit": "contain"
        },
        "karten-bild-png": {
          "src": "/Karten/Cenyr/celtigerns-wacht/llamrais-ankunft/herrschaft-der-wyrm/llysfaen-bannkreis/llysfaen/Kartenbilder/LlysfaenStadt.webp",
          "alt": "Ortskarte von Llysfaen",
          "href": "/Karten/karte.html?map=cenyr-celtigerns-wacht-llamrais-ankunft-wyrm-llysfaen-stadtkarte",
          "fit": "contain"
        },
        "icon-png": {
          "src": "/Orte/Koenigreich_Cenyr/Grafschaft_Celtigerns_Wacht/Baronie_Llamreis_Ankunft/Herrschaft_Haus_Wyrm/Lysfaens_Bannkreis/Lysfaen/assets/wappen.png",
          "alt": "Wappen von Llysfaen",
          "fit": "contain"
        }
      }
    },
    "sections": {
      "introduction": [
        "Llysfaen ist eine Bauernsiedlung unter der Herrschaft des Hauses Wyrm, die sich auf die Zucht von Pferden und anderen Tieren spezialisiert hat. Die Siedlung ist außerdem für den Anbau von Futterpflanzen bekannt, die für die Versorgung der Tiere unerlässlich sind. Llysfaen spielt eine zentrale Rolle in der regionalen Landwirtschaft, da sowohl die Tiere als auch das Futter für die umliegenden Gebiete von großer Bedeutung sind. Die enge Verbindung zwischen Tierzucht und Ackerbau macht Llysfaen zu einem wichtigen Bestandteil der Wirtschaft der Herrschaft Wyrm.",
        {
          "type": "subheading",
          "text": "Sorgen am Tresen"
        },
        "Der Rauch hängt schwer unter der Balkendecke, ein letzter Krug steht zwischen ihnen. Brinthan Argall sitzt schwer atmend auf der Bank, den Mantel halb geöffnet, die Stirn glänzt. Maldwyn wischt in aller Ruhe den Tresen, wirft seinem alten Freund dann einen Blick zu.",
        "Maldwyn: „Du siehst aus, als hätte dich der Rat mit Mist beworfen. Wieder.“",
        "Brinthan (müde): „Wäre angenehmer gewesen. Mist kann man wenigstens wegwaschen.“",
        "Maldwyn (grinst schief): „Was war's diesmal? Meurig oder Iestin?“",
        "Brinthan: „Beide. Und dann noch Taliesin mit seinem ewigen Grinsen. …Pause. Und meine Frau… wie immer der Meinung, sie hätte es besser gemacht. Hat sie sicher auch, in Dagons Domäne, in der Vetter Edwyn Bürgermeister ist und ich in Frieden meinen Tee trinken darf.“",
        "Maldwyn: „Na, immerhin ist ihr Tee besser als dein Regierungsstil.“",
        "Brinthan (lacht leise): „Freundschaftlich wie immer.“",
        "Maldwyn (setzt sich zu ihm, schenkt nach): „Was liegt wirklich auf deinem Herzen, Brin?“",
        "Brinthan (senkt die Stimme): „Ich mach mir Sorgen um Anwen. Sie kämpft, ja… aber das Dorf ist hungrig. Nach Besitz, nach Einfluss, nach… ihr.“ Er schaut in seinen Krug. „Und dann ist da Shylene… und der Kleine. Ich seh ihn manchmal im Hof stehen, mit diesem Blick. Dem Blick, den ich vor dem Spiegel hatte, als ich noch dachte, ich hätte eine Wahl.“",
        "Maldwyn (lehnt sich zurück): „Du meinst den Blick, den man trägt, bevor man ein Amt annimmt, das einen langsam auffrisst?“",
        "Brinthan: „Ganz genau den.“",
        "Maldwyn (nach kurzem Schweigen): „Anwen ist stärker, als sie wirkt. Und Shylene weiß, was sie tut – auch wenn sie es niemandem sagt.“ Er nippt am Krug. „Und du, alter Freund, hältst Llysfaen zusammen, ohne dass du’s merkst. Auch wenn es dir keiner dankt.“",
        "Brinthan: „Sag das mal meiner Frau.“",
        "Maldwyn (grinst): „Ich bin Wirt, kein Zauberer.“"
      ],
      "background": [
        "Auf den ersten Blick mag Llysfaen wie viele andere Siedlungen wirken – ein Bauerndorf, umgeben von Weiden, Feldern und Wetter. Doch wer genauer hinsieht, erkennt schnell, dass dieses Dorf mehr ist als nur ein Flecken auf der Karte der Baronie Lamreis Ankunft. Llysfaen ist ein Knotenpunkt, ein Pulsgeber, ein stiller Träger von Einfluss.",
        "Seine Lage an der Hauptstraße von Celtigerns Wacht, die von Ost nach West die Grafschaft durchquert, verleiht Llysfaen strategische Bedeutung: Händler, Boten, Pilger, selbst kleine Truppen passieren die Siedlung regelmäßig. In den Tavernen und auf den Märkten hört man Neuigkeiten lange, bevor sie offiziell verkündet werden. Es heißt, wer wissen will, was im Land geschieht, müsse nur eine Woche in Llysfaen verbringen – und aufmerksam zuhören.",
        "Wirtschaftlich ist Llysfaen ein Versorger von Fleisch, Wolle, Leder und Getreide – ein stiller Rückhalt für Städte und Burgen, die auf ländliche Versorgung angewiesen sind. Besonders hervorgehoben werden muss die Pferdezucht, die über Generationen hinweg von der Familie Jernigan und anderen Höfen zur Perfektion geführt wurde. Dass eines der königlichen Hochzeitspferde aus Llysfaen stammte, spricht sich selbst in den Hallen der Hauptstadt herum.",
        "Darüber hinaus liegt die Bedeutung des Dorfes im politischen Gleichgewicht: Der örtliche Rat, bestehend aus dem Bürgermeister, dem Hauptmann der Wache und den fünf führenden Familien, übt eine nicht zu unterschätzende lokale Macht aus. Entscheidungen, die in Llysfaen getroffen werden, haben Auswirkungen auf umliegende Höfe, Weiler und sogar auf die Haltung des niederen Adels im Grenzland.",
        "Nicht zuletzt bewahrt Llysfaen Tradition und Bodenständigkeit in einer Zeit, die vielerorts von Unsicherheit, Hunger und Umbruch geprägt ist. Während anderswo Gesetze durch Münzen erkauft und Bündnisse in Pergament aufgelöst werden, zählt in Llysfaen noch das gegebene Wort, der feste Händedruck, die gemeinsam eingebrachte Ernte.",
        "So ist Llysfaen nicht groß, nicht mächtig, nicht berühmt. Doch es ist unverzichtbar – wie ein gut gezimmertes Scharnier, das die Tür eines Reiches unauffällig, aber zuverlässig trägt."
      ],
      "location": [
        "Die Siedlung Llysfaen liegt malerisch am östlichen Rand der Baronie Lamreis Ankunft, jener Übergangsregion, die nach „Gwendolyns Ufer“ führt.",
        "Durch Llysfaen zieht sich ein bedeutender Handelsweg: die Hauptstraße der Grafschaft Celtigerns Wacht, die von Osten nach Westen verläuft. Dieser alte Weg verbindet Märkte, Dörfer und Ritterhöfe und bringt nicht nur Händler und Pilger, sondern auch gelegentlich Reisende mit Geschichten und seltsamen Waren aus fernen Ländern. Obwohl der Weg staubig und von Schlaglöchern gezeichnet ist, gilt er als Lebensader der Region – und macht Llysfaen zu einem Knotenpunkt von Gesprächen, Neuigkeiten und Gerüchten.",
        "Die Landschaft um Llysfaen ist offen und weit – geprägt von sanften, grasbedeckten Hügeln im Süden, die in der Morgendämmerung goldfarben leuchten und im Nebel wie ruhende Riesen wirken. Diese Höhenzüge bieten Schutz vor den harschen Winden des Winters und bilden natürliche Grenzen zu den angrenzenden Weidelanden.",
        "Rings um das Dorf erstrecken sich weite Grasflächen und sattgrünes Weideland, durchzogen von kleinen Pfaden, alten Trockenmauern und den Spuren jahrzehntelanger Tierwanderung. Es ist ein ideales Terrain für Viehhaltung, und die Bauern wissen um den Wert ihrer saftigen Flächen. Je nach Jahreszeit steht das Land in leuchtendem Frühlingsgrün, sommerlicher Fülle oder herbstlichem Gold.",
        "Zwischen den Feldern und Hügeln ducken sich kleine Wälder und Haine – meist aus Eschen, Buchen und vereinzelten Eichen. Diese Waldstücke liefern nicht nur Brennholz und Wild, sondern dienen auch als Rückzugsorte, alte Kultplätze oder versteckte Treffpunkte für jene, die lieber im Schatten als im Licht verhandeln.",
        "Die Lage Llysfaens ist von strategischem wie auch kulturellem Wert: Abgelegen genug, um Eigenständigkeit zu bewahren, doch offen genug, um Teil größerer politischer und wirtschaftlicher Ströme zu bleiben. Wer hier lebt, lebt mit der Erde, dem Himmel und dem Wissen, dass jede Straße hinaus auch wieder zurückführt."
      ],
      "administration": [
        "Die Siedlung Llysfaen untersteht einer kommunalen Lehnsherrschaft. Das bedeutet, dass die Verwaltung zwar vor Ort organisiert ist, jedoch unter dem Einfluss des Adels steht – im konkreten Fall dem Haus Wyrm. Regiert wird Llysfaen von einem Bürgermeister, der im Sinne des Ritterfürsten handelt und dessen Interessen in der Region vertritt.",
        "Üblicherweise wird der Bürgermeister von den Bewohnern gewählt, wodurch ein gewisses Maß an lokaler Selbstbestimmung gewahrt bleibt. In besonderen Fällen jedoch kann der Ritterfürst einen Lehnswart ernennen, der in ritterlicher Funktion agiert und in erster Linie den Willen des Adels durchsetzt. Auf diese Weise entsteht eine strukturierte Balance zwischen örtlicher Autonomie und der übergeordneten Kontrolle durch die Lehnsherren.",
        "Der Bürgermeister von Llysfaen trägt die Verantwortung für die gesamte Verwaltung der Siedlung. Zu seinen Aufgaben zählen unter anderem das Eintreiben von Abgaben und deren Weiterleitung an den Lehnsherren, ebenso wie diplomatische Pflichten: die Schlichtung von Streitigkeiten, die Wahrung des inneren Friedens sowie die Repräsentation der Siedlung nach außen.",
        "Unterstützt wird er von einem Rat, bestehend aus:",
        {
          "type": "list",
          "items": [
            "dem Bürgermeister selbst,",
            "dem Hauptmann der Wache,",
            "sowie den Oberhäuptern der fünf einflussreichsten Familien der Region."
          ]
        },
        "Diese Familien – Glyn, Jernigan, Blevins, Talfryn und Crewe – bewirtschaften die großen Höfe in und um Llysfaen. Gemeinsam bilden sie das politische Rückgrat der Siedlung und beraten über die künftige Ausrichtung, Entscheidungsfindung und Entwicklung des Gemeinwesens."
      ],
      "conflicts": [
        "Die Konflikte in und um Llysfaen sind – oberflächlich betrachtet – von eher kleinteiliger und alltäglicher Natur. Die örtliche Miliz hat es zumeist mit übermütigen Kindern, kleineren Auseinandersetzungen zwischen Nachbarn und gelegentlichen Fällen von Taschendiebstahl zu tun. Die Dorfgemeinschaft gilt insgesamt als friedlich – zumindest auf den ersten Blick.",
        "Ein dauerhaft schwelendes Problem stellt jedoch der Viehdiebstahl dar. In unregelmäßigen Abständen verschwinden Schafe, Ziegen und Kühe von den Höfen – auffällig oft von jenen der Familien Talfryn und Crewe. Die Familie Blevins hingegen scheint seltsamerweise nie betroffen zu sein, was im Dorf zunehmend Misstrauen sät. Hinter vorgehaltener Hand werden Anschuldigungen geäußert – die Andeutung, die Blevins könnten selbst die Drahtzieher dieser nächtlichen Übergriffe sein, macht leise, aber hartnäckig die Runde.",
        "Jüngst jedoch hat ein Vorfall die gesamte Region in helle Aufregung versetzt: Mehrere Pferde wurden gestohlen, darunter eines, das eigens für die bevorstehende Hochzeit von Prinz Tudwal Draig gezüchtet worden war – ein prachtvoller, ausdauernder Cefyll aus dem Stall der Familie Jernigan. Der Diebstahl hat das Dorf erschüttert und wird nun sogar in Gwynthor von den Wyrm mit erhobenem Brauen registriert.",
        "Doch nicht nur äußere Bedrohungen trüben die Idylle. Auch innerhalb der Gemeinschaft gären Konflikte. Die alte Rivalität zwischen den Familien Blevins und Glyn flammt immer wieder auf – sei es bei Ratsversammlungen, Marktfragen oder Stallvergleichen. Wo die eine Familie einen Vorschlag macht, widerspricht die andere aus Prinzip.",
        "Besonders heikel ist die Situation auf dem Hof der Familie Crewe: Nach dem Tod des alten Urien Crewe führt nun seine Tochter Anwen den Hof. Eine ungewöhnliche, beinahe revolutionäre Wendung für die Region – denn obwohl Anwen als tüchtig und klug gilt, sehen viele Männer des Dorfes ihre neue Rolle mit Skepsis.",
        "Die Familien Blevins, Glyn und Jernigan versuchen nun, Anwen mit ihren jeweiligen Söhnen zu vermählen – teils aus politischem Kalkül, teils aus purem Ehrgeiz. Einzig Gareth Talfryn steht fest an ihrer Seite: Aus alter Freundschaft zu Urien unterstützt er Anwen bedingungslos.",
        "Trotzdem rumort es auf den Feldern. Einige Bauern, vor allem solche aus konservativeren Kreisen, weigern sich offen oder versteckt, für eine Frau zu arbeiten. Ob Anwen Crewe sich gegen die stillen Intrigen und die hartnäckige Bauernsturheit behaupten kann, wird sich in den kommenden Monaten zeigen."
      ],
      "houses": [
        "Das soziale Gefüge von Llysfaen wird maßgeblich von einer Handvoll einflussreicher Familien geprägt, die nicht nur über Land und Vieh verfügen, sondern auch über Ansehen, Verbindungen und teils alten Stolz. Jede dieser Familien trägt auf ihre Weise zur wirtschaftlichen und politischen Stabilität der Region bei – oder versucht zumindest, ihren Einfluss zu mehren.",
        {
          "type": "subheading",
          "text": "Familie Jernigan"
        },
        "Die Familie Jernigan besitzt das, was man im Volksmund das „Große Gestüt“ nennt – ein weitläufiges Anwesen mit Stallungen, Koppeln und eigener Tränke. Ihre Pferdezucht genießt besonderen Schutz durch das Haus Wyrm, dem sie seit Generationen treue Dienste leisten. Als reichste Familie im Dorf verfügen sie nicht nur über Land und Tiere, sondern auch über Silberreserven, eigene Knechte und enge Verbindungen nach Gwyxnthor. Ihr Auftreten ist selbstbewusst, gelegentlich hochmütig.",
        {
          "type": "subheading",
          "text": "Familie Glyn"
        },
        "Die Familie Glyn gilt als der Inbegriff des arbeitenden Mannes. Ihr Hof ist alt, fest gebaut und von beeindruckender Größe. Neben dem eigentlichen Gut bewirtschaften sie zwei ertragreiche Getreidefelder und halten eine Vielzahl an Schafen, Rindern, Schweinen sowie Gemüsebeeten. Sie sind still, stolz und traditionsverbunden – Menschen, die nicht reden, sondern handeln. Ihr Wort zählt – nicht weil es laut ist, sondern weil es verlässlich ist.",
        {
          "type": "subheading",
          "text": "Familie Crewe"
        },
        "Die Crewe-Familie verfügt über den kleinsten Hof und gilt als wirtschaftlich schwach aufgestellt. Doch was ihnen an Besitz fehlt, machen sie durch Zähigkeit und Ehrgefühl wett. Nach dem Tod von Urien Crewe übernahm seine Tochter Anwen die Leitung des Hofes – ein mutiger Schritt, der das Dorf spaltet. Sie besitzen ebenfalls zwei große Getreidefelder, konzentrieren sich aber auf Schweine, Schafe und Rinder. Gemüse ist knapp, die Vorratskeller nie übervoll – doch ihr Hof steht, und das allein ist eine Leistung.",
        {
          "type": "subheading",
          "text": "Familie Talfryn"
        },
        "Die Familie Talfryn wird oft als das Herz von Llysfaen bezeichnet. Ihr Hof ist nicht nur ordentlich geführt, sondern auch ein Ort, an dem man gern arbeitet. Ihre Pferde, Schafe und Schweine sind bekannt für ihre Gesundheit, ihr Gemüse für seinen Geschmack. Auch sie verfügen über zwei große Getreidefelder. Gareth Talfryn, das Familienoberhaupt, ist ein gemäßigter, weiser Mann, dem viele vertrauen. In Ratsfragen wird seine Stimme gern gehört – nicht nur wegen seiner Worte, sondern wegen seines Maßes.",
        {
          "type": "subheading",
          "text": "Familie Blevins"
        },
        "Die Blevins besitzen den zweitgrößten Hof der Region und setzen auf Masse: Der Großteil ihrer Felder ist dem Anbau von Futterpflanzen gewidmet – eine Versorgungslinie für andere Höfe. Tiere halten sie nur in begrenztem Maß: Kühe, Schweine und Schafe in bescheidener Anzahl. Auch sie verfügen über zwei große Getreidefelder. Ihre Position im Dorf ist ambivalent: respektiert wegen ihres Besitzes, misstraut wegen ihrer stetigen Ambitionen und dem verdächtigen Mangel an Viehdiebstählen auf ihrem Land.",
        {
          "type": "subheading",
          "text": "Familie Argall"
        },
        "Die Familie Argall stellt den aktuellen Bürgermeister von Llysfaen. Sie residieren in einem kleinen, steinernen Anwesen am Rande des Dorfes – schlicht, aber würdevoll. Der Bürgermeister gilt als überarbeitet, seine Familie als wachsam und zurückhaltend. Ihre Macht liegt nicht im Vieh, sondern in Papieren, Entscheidungen und Politik.",
        {
          "type": "subheading",
          "text": "Familie Brogar"
        },
        "Die Brogars führen die beliebteste Taverne Llysfaens, die „Weiße Drachin“. Ihre Familie genießt hohes Ansehen, nicht zuletzt durch den charismatischen Wirt Maldwyn Brogar und seine Frau, die das Herz vieler Gäste ist. Die beiden Töchter bedienen als Schankmaiden, die Jüngere musiziert – und das Haus ist stets voller Stimmen, Lachen und Geschichten. Inoffiziell wird die Familie Brogar oft als „Zunge des Dorfes“ bezeichnet – denn wer etwas wissen will, geht zuerst in die Drachin.",
        {
          "type": "subheading",
          "text": "Familie: Rhyddid"
        },
        "Die Familie Rhyddid stammt ursprünglich aus dem kleinen Adelshaus Gwynthor, das treu dem Haus Wyrm dient. Ihr bekanntester Vertreter ist Sir Gwydion Rhyddid, der Ritter und Hauptmann von Llysfaen. Obwohl ihre Familie in Llysfaen kein Gut besitzt, gelten sie als standesfest, stolz und ehrenhaft. Ihr Einfluss ist direkt an den militärischen Schutz der Region geknüpft – und damit von nicht zu unterschätzender Bedeutung."
      ],
      "population": [
        "Die Siedlung Llysfaen zählt derzeit etwa 900 Seelen, die sich über das Dorf selbst und die umliegenden Höfe und Weiler verteilen. Die soziale Struktur ist, wie in den meisten ländlichen Regionen des Lehens, klar gegliedert – geprägt von harter Arbeit, bäuerlicher Tradition und einer schlichten, aber zähen Lebensweise.",
        "Der Großteil der Bevölkerung besteht aus Bauern, Viehzüchtern und Angehörigen der Unterschicht, die tagein, tagaus auf den Feldern schuften, Tiere versorgen und Vorräte für die kalten Monate einlagern. Ihre Hände sind schwielig, ihre Gesichter wettergezeichnet – aber ihr Herz schlägt fest für Llysfaen und seine Erde.",
        "Besonders hervorzuheben ist die kleine, aber renommierte Kaste der Pferdezüchter, die über Generationen hinweg im edle Reit- und Zugtiere herangezogen haben. Die Familie Jernigan genießt in diesem Bereich hohes Ansehen und beliefert nicht nur den Ritterfürsten, sondern gelegentlich auch königliche Boten oder feine Herren mit ihren Tieren.",
        "Vereinzelt findet sich in Llysfaen auch Handwerkerschaft, darunter Hufschmiede, Gerber, Tischler, Flicker, sowie zwei Bäcker und eine Kräuterfrau, die zugleich als Hebamme dient. Diese Berufe zählen zur unteren Mittelschicht, die sich in Llysfaen jedoch nur zaghaft herausbildet. Wohlstand ist hier selten, und wer ihn besitzt, zeigt ihn meist nur in Form eines gemauerten Kellers oder eines zweiten Pferdes im Stall.",
        "Die wenigen Mittelschichtler des Dorfes – darunter der örtliche Hufschmied, der Wirt und der Händler – nehmen in der Dorfgemeinschaft eine respektierte, aber keineswegs unangreifbare Stellung ein. Der Neid der einfachen Leute ist spürbar, besonders in schlechten Erntejahren.",
        "Trotz aller Unterschiede eint die Bevölkerung ein tiefes Gefühl von Zusammenhalt, Tradition und einem gewissen Misstrauen gegenüber Fremden. In Llysfaen kennt man sich – und das bedeutet, dass Geschichten nicht nur erzählt, sondern auch weitergetragen werden."
      ],
      "culture": [
        "Die Kultur von Llysfaen ist zutiefst verwoben mit der Land- und Viehwirtschaft. Man lebt hier mit dem Vieh, vom Acker, aus der Erde – und in gewisser Weise für den Kreislauf des ländlichen Lebens. Kühe, Ziegen, Schafe, Pferde, aber auch Gerste, Hafer, Gemüse und Kohl prägen nicht nur das Landschaftsbild, sondern auch den Jahresrhythmus, die Feste und die soziale Ordnung des Dorfes.",
        "Der Stolz vieler Familien ist die Viehzucht. Von Kindesbeinen an lernen die Menschen, wie man Tiere pflegt, aufzieht und medizinisch versorgt. Dabei geht es nicht nur um Fleisch oder Milch – Wolle, Leder und Zugkraft sind ebenso wichtige Erträge. In langen Wintern sind warme Decken aus eigener Schafwolle oder haltbare Wurst aus der Hausschlachtung oft mehr wert als Münzen.",
        "Neben den Tieren spielt die Ackerwirtschaft eine zentrale Rolle in der dörflichen Kultur. Die fruchtbaren Böden rund um Llysfaen bringen Getreide wie Gerste, Hafer und Dinkel hervor, die nicht nur für den eigenen Bedarf, sondern auch für den Tauschhandel mit benachbarten Siedlungen genutzt werden. Auch Wurzelgemüse – besonders Rüben, Pastinaken und Karotten – gedeiht hier gut und wird in Erdkellern bis in den Frühling hinein gelagert.",
        "Ein besonderer kultureller Aspekt ist der gezielte Anbau von Futterpflanzen: Klee, Luzerne, Wiesenkräuter und speziell gemischte Gräser werden nicht dem Zufall überlassen, sondern mit Bedacht kultiviert, um das Vieh bestmöglich zu versorgen. Jeder Hof hat seine eigene Geheimmischung, über die man genauso wenig spricht wie über die besten Jagdplätze. Gutes Futter bedeutet gesundes Vieh – und damit Respekt.",
        "Auch die Verarbeitung der Erzeugnisse ist tief verwurzelt. Fast jeder Hof hat eine Webstube, eine Räucherkammer oder ein Ledergerüst, an dem Häute trocknen. Aus Fellen entstehen Kleidung und Gebrauchsgegenstände, aus Wolle werden Decken, aus Getreide wird Mehl, und aus Rüben süßes Mus für Kinder. Selbst die Asche wird gesammelt – zum Laugen von Seife.",
        "Die Pferdezucht wiederum nimmt eine Sonderstellung ein – als stolze Tradition und prestigeträchtiges Handwerk. Die Familie Rhydderch wacht über die Linienführung der Tiere wie über ein Adelswappen. Bei Turnieren oder Märkten tragen die Pferde nicht nur Lasten, sondern auch den Ruf der Region.",
        "So ist die Kultur von Llysfaen nicht laut oder prunkvoll – aber sie ist reich an Können, Wissen und Rhythmus. In jedem Spatenstich, jedem Melkvorgang und jedem geflochtenen Zaun steckt gelebtes Erbe – fest verwurzelt, wie die uralten Hecken, die die Felder seit Generationen säumen."
      ],
      "military": [
        "Die Sicherheit von Llysfaen liegt in den Händen einer kleinen, aber disziplinierten Garnison, die dem Schutz der Siedlung, der umliegenden Höfe und der Interessen des Hauses Wyrm dient. Die militärische Struktur ist übersichtlich, jedoch fest in das dörfliche Gefüge eingebettet – eine Mischung aus ritterlicher Autorität, bäuerlicher Pflichterfüllung und pragmatischer Wacht.",
        "Das Kontingent umfasst derzeit etwa 10 bis 15 Milwr – einfache Fußsoldaten, meist aus der Region stammend. Sie sind junge Männer, oft Bauernsöhne oder zweite Söhne größerer Familien, die sich durch ihren Dienst ein Auskommen, Ehre oder schlicht eine warme Mahlzeit sichern wollen. Ihre Ausrüstung ist schlicht: Gambeson, Speer, ein Rundschild und, sofern es das Budget erlaubt, ein einfaches Seitenmesser. Trotz mangelnder Ausbildung zeigen viele von ihnen Herzblut, wenn es um die Verteidigung ihres Heimatortes geht.",
        "Ergänzt werden sie durch 8 bis 10 Waffenknechte, meist älter, erfahrener, gelegentlich ehemalige Söldner oder Abenteurer, die sesshaft geworden sind. Sie tragen oft eigene Waffen – Hellebarden, Äxte oder schwere Keulen – und übernehmen innerhalb der Garnison die Rollen von Ausbildern, Torwachen oder Patrouillenführern. Viele dieser Männer sind rau, wortkarg und haben bereits außerhalb der Grenzen Llysfaens Blut gesehen – was ihnen unter den Jüngeren einen gewissen Respekt verschafft.",
        "Angeführt wird die Truppe von keinem Geringeren als dem Ritter Sir Gwydion Rhyddid, einem Vertreter des niederen Adels, der vom Haus Wyrm entsandt wurde, um als Hauptmann von Llysfaen über Recht, Ordnung und militärische Angelegenheiten zu wachen. Sir Gwydion ist eine stattliche Erscheinung: hochgewachsen, stets in polierter Rüstung, und mit einem Blick, der ebenso scharf ist wie seine Klinge.",
        "In Summe mag die militärische Präsenz von Llysfaen bescheiden wirken – doch sie ist funktional, lokal verwurzelt und unter kluger Führung mehr als nur eine Zierde. Sollte Gefahr nahen, wird man sehen, dass Mut nicht immer aus glänzender Rüstung besteht."
      ],
      "newspaper": [
        {
          "type": "subheading",
          "text": "Celtigerns Echo"
        },
        "Die Redaktion für Llysfaen ist vorbereitet. Besetzung und Beiträge folgen.",
        {
          "type": "subheading",
          "text": "Der Schwarzbote"
        },
        "Die Redaktion für Llysfaen ist vorbereitet. Besetzung und Beiträge folgen."
      ]
    }
  });

  window.ORT_DATA = Object.freeze({
    ...base,
    "structure": {
      "vorherrschender adel": "Keiner",
      "regierungstyp": "Feudale Amtsverwaltung",
      "gewerbe": "Viehhaltung, Stoff & Leder Verarbeitung",
      "lehnsherr": "Haus Wyrm",
      "stände": "Unterschicht, Mittelschicht",
      "einwohnerzahl": "etwa 900",
      "ritter": "Ein Ritter der Wyrm",
      "waffenknechte": "8 bis 10",
      "flotte": "Keine",
      "ressourcen": "Vieh, Wolle, Fleisch, Leder, Futterpflanzen, Pferde",
      "ortswache": "10 - 15",
      "land": "Königreich Cenyr",
      "provinz": "Celtigerns Wacht",
      "region": "Baronie Llamreis Ankunft",
      "name": "Llysfaen",
      "herrschaft": "Bürgermeister Brinthan Argall",
      "bekannte familien": "Jernigan, Glyn, Crewe, Talfryn, Blevins, Argall, Brogar, Rhyddid; Rhydderch",
      "bedrohungen": "Vieh- und Pferdediebstahl"
    },
    "houses": [
      {
        "title": "Ritterfürsten",
        "items": [
          {
            "name": "Haus Wyrm",
            "rank": "Ritterfürstlich",
            "seat": "Gwynthor",
            "liege": "Haus Draig",
            "familyId": "haus-wyrm",
            "emblem": "/Orte/modules/houses/assets/wyrm-legacy.png"
          }
        ]
      },
      {
        "title": "Ritterhäuser",
        "items": [
          {
            "name": "Haus Rhyddid",
            "rank": "Ritterhaus",
            "seat": "Gwynthor",
            "liege": "Haus Wyrm",
            "familyId": "haus-rhyddid",
            "emblem": "/Stammbäume/assets/images/houses/Llamreis Ankunft/haus-rhyddid.png"
          }
        ]
      },
      {
        "title": "Bürgerliche Häuser",
        "items": [
          {
            "name": "Haus Jernigan",
            "rank": "Bürgerlich",
            "seat": "Llysfaen",
            "liege": "Haus Wyrm",
            "familyId": "",
            "emblem": ""
          },
          {
            "name": "Haus Glyn",
            "rank": "Bürgerlich",
            "seat": "Llysfaen",
            "liege": "Haus Wyrm",
            "familyId": "",
            "emblem": ""
          },
          {
            "name": "Haus Crewe",
            "rank": "Bürgerlich",
            "seat": "Llysfaen",
            "liege": "Haus Wyrm",
            "familyId": "",
            "emblem": ""
          },
          {
            "name": "Haus Talfryn",
            "rank": "Bürgerlich",
            "seat": "Llysfaen",
            "liege": "Haus Wyrm",
            "familyId": "",
            "emblem": ""
          },
          {
            "name": "Haus Blevins",
            "rank": "Bürgerlich",
            "seat": "Llysfaen",
            "liege": "Haus Wyrm",
            "familyId": "",
            "emblem": ""
          },
          {
            "name": "Haus Argall",
            "rank": "Bürgerlich",
            "seat": "Llysfaen",
            "liege": "Haus Wyrm",
            "familyId": "haus-argall",
            "emblem": "/Stammbäume/assets/images/houses/Llamreis Ankunft/Bürgerliche/Llysfaen/Argall.png"
          },
          {
            "name": "Haus Brogar",
            "rank": "Bürgerlich",
            "seat": "Llysfaen",
            "liege": "Haus Wyrm",
            "familyId": "",
            "emblem": ""
          }
        ]
      },
      {
        "title": "Weitere überlieferte Familie",
        "items": [
          {
            "name": "Haus Rhydderch",
            "rank": "",
            "seat": "",
            "liege": "",
            "familyId": "",
            "emblem": ""
          }
        ]
      }
    ],
    "merchants": [
      {
        "name": "Zur Weißen Drachin",
        "owner": "Malwyn Brogar",
        "trade": "Gastwirtschaft",
        "wealth": "★★☆☆☆",
        "reputation": "✤✤✧✧✧",
        "influence": "★★☆☆☆",
        "description": "",
        "icon": "/Orte/modules/merchants/assets/tavern.png"
      },
      {
        "name": "Hof Jernigan",
        "owner": "Bedwyr Jernigan",
        "trade": "Rosszucht",
        "wealth": "★★☆☆☆",
        "reputation": "✤✤✧✧✧",
        "influence": "★★☆☆☆",
        "description": "Gönner / Patron: Haus Wyrm",
        "icon": "/Orte/modules/merchants/assets/stud.png"
      },
      {
        "name": "Hof Blevins",
        "owner": "Iestin Blevins",
        "trade": "Bauernhof",
        "wealth": "★★☆☆☆",
        "reputation": "✤✤✧✧✧",
        "influence": "★★☆☆☆",
        "description": "",
        "icon": "/Orte/modules/merchants/assets/farm.png"
      },
      {
        "name": "Hof Glyn",
        "owner": "Meurig Glyn",
        "trade": "Bauernhof",
        "wealth": "★★☆☆☆",
        "reputation": "✤✤✧✧✧",
        "influence": "★★☆☆☆",
        "description": "",
        "icon": "/Orte/modules/merchants/assets/farm.png"
      },
      {
        "name": "Hof Talfryn",
        "owner": "Gareth Talfryn",
        "trade": "Bauernhof",
        "wealth": "★★☆☆☆",
        "reputation": "✤✤✧✧✧",
        "influence": "★★☆☆☆",
        "description": "",
        "icon": "/Orte/modules/merchants/assets/farm.png"
      },
      {
        "name": "Hof Crewe",
        "owner": "Anwen Crewe",
        "trade": "Bauernhof",
        "wealth": "★★☆☆☆",
        "reputation": "✤✤✧✧✧",
        "influence": "★★☆☆☆",
        "description": "",
        "icon": "/Orte/modules/merchants/assets/farm.png"
      }
    ],
    "personalities": [
      {
        "id": "administration",
        "title": "Administration & Verwaltung",
        "items": [
          {
            "name": "Brinthan Argall",
            "role": "Bürgermeister",
            "description": [
              "Brinthan Argall ist ein Mann, dem man die Last seines Amtes ansieht – in den Augenringen, die sich tief unter seinen braunen Augen eingegraben haben, in den müden Bewegungen beim Aufstehen aus dem Ratssitz, und im langen Seufzen, mit dem er jeden neuen Tag begrüßt.",
              "Einst mit Idealismus in das Amt des Bürgermeisters gewählt, ist Brinthan heute vor allem eines: erschöpft. Die Geschicke von Llysfaen zu lenken bedeutet, zwischen den Stühlen zu sitzen: zwischen den fünf Hofbesitzerfamilien mit ihren eigenen Interessen, zwischen dem Ritter, dem Adel, dem Volk, dem Vieh, den Vorräten, dem Wetter – und seiner Frau, Eris Argall, die selten schweigt und nie irrt, zumindest in ihren eigenen Augen.",
              "Sie, die sich für klüger, organisierter und durchsetzungsfähiger hält als ihr Mann, kommentiert jeden seiner Schritte – sei es die Ratsführung oder die Wahl des Abendbrots. Brinthan hat gelernt zu nicken, zu schweigen oder den Raum zu verlassen. Sein Rückzugsort ist die Taverne „Zur Weißen Drachin“, wo er abends regelmäßig einkehrt, einen Krug zu viel bestellt und dem Wirt Maldwyn Brogar seine Sorgen anvertraut. Die beiden verbindet eine stille Freundschaft aus Mitleid, Respekt und gutem Met.",
              "Ein ständiger Dorn in Brinthans Seite sind die Pferdediebstähle, die die Siedlung in Aufruhr versetzen – zumal eines der Tiere für Prinz Tudwals Hochzeit bestimmt war. Seine Gegner im Dorf lästern bereits: „Wenn selbst das Vieh aus dem Stall flieht, wie soll’s dann der Ordnung ergehen?“",
              "Doch das ist nicht der einzige Grund für das spöttische Flüstern im Dorf: Seine Tochter, eine kluge, selbstständige Frau, hat ein uneheliches Kind – was für sich allein kein Skandal wäre, würde nicht die ganze Region darüber tuscheln. Dass Brinthan das Kind liebt, aber daran zu zerbrechen scheint, es nicht schützen zu können, ist ein Umstand, den er nur im Stillen mit sich trägt. In der Öffentlichkeit macht er gute Miene – doch das Lachen fällt ihm schwer.",
              "Auch die Kinder, die täglich im Wasserloch südlich des Dorfes planschen, treiben ihn zur Verzweiflung. Nicht wegen des Lärms allein – sondern weil sie in einer Welt aufwachsen, in der Leichtigkeit zu selten geworden ist, und er sich selbst in ihrer Gegenwart wie ein alter Mann fühlt, der den Faden verloren hat.",
              "Trotz all dem gilt: Brinthan macht seinen Job gut. Er führt den Rat mit ruhiger Hand, vermittelt zwischen streitenden Höfen, sorgt für Abgaben, lässt Straßen instand halten, erträgt die Klagen der Bürger, und trifft, wenn es darauf ankommt, gerechte Entscheidungen.",
              "Er ist kein Held, kein Redner, kein Liebling der Massen – doch er hält Llysfaen zusammen, auch wenn es ihn zerreißt."
            ],
            "portrait": "/Orte/Koenigreich_Cenyr/Grafschaft_Celtigerns_Wacht/Baronie_Llamreis_Ankunft/Herrschaft_Haus_Wyrm/Lysfaens_Bannkreis/Lysfaen/assets/brinthan-argall.png"
          },
          {
            "name": "Eris Argall",
            "role": "Frau des Bürgermeisters",
            "description": [
              "Wer in Llysfaen nach dem wahren Zentrum der Macht fragt, bekommt – mit einem Augenzwinkern oder einem nervösen Räuspern – oft denselben Namen zu hören: Eris Argall.",
              "Die Frau des Bürgermeisters hat kein offizielles Amt, kein Siegel, keine Unterschriftsvollmacht. Und doch weiß jeder im Dorf, dass man an ihr nicht vorbeikommt. Ob es um das Brot für das nächste Fest, den Zustand der Marktstände oder den Namen eines Neugeborenen geht – Eris mischt sich ein. Immer. Und ungefragt.",
              "„Ich sag ja nur …“ ist ihr Leitspruch – ein Satz, der stets mit einer gezückten Augenbraue und einer tadelnden Handbewegung einhergeht. Sie weiß alles besser, und sollte sie sich einmal irren (was nie geschehen ist, ihrer Ansicht nach), dann nur, weil jemand anderes ihr den falschen Eindruck vermittelt hat.",
              "In ihrer Ehe mit Brinthan Argall führt sie kein Gespräch, sondern ein ständiges Verhör mit Urteil. Überstreng ist noch milde gesagt – sie erwartet von ihrem Mann, dass er nicht nur das Dorf regiert, sondern ihr Leben optimiert. Dass ihre Tochter nicht verheiratet ist und ein uneheliches Kind zur Welt gebracht hat, ist für Eris kein Schicksal, sondern ein Versagen – Brinthans Versagen. Und das lässt sie ihn täglich wissen.",
              "„Wäre ich nicht so dumm gewesen, dich zu wählen … Mein Vetter verdient heute das Dreifache!“ – ein Satz, den Brinthan schon so oft gehört hat, dass er ihn vermutlich sogar im Schlaf murmelt. Ihr sagenhafter Vetter ist Händler in Caer Wyth, trägt Pelzkragen und reist mit eigenem Wagen. In Eris’ Erzählungen hat er nie Bauchweh, nie Probleme mit dem Vieh, und selbstverständlich auch keine unehelichen Enkel.",
              "Doch Eris ist mehr als nur eine Furie. Sie ist eine Frau mit eiserner Kontrolle, scharfem Verstand und ungebrochener Zielstrebigkeit. In einer anderen Zeit, an einem anderen Ort, hätte sie vielleicht selbst ein Amt bekleidet – oder ein kleines Reich geführt. In Llysfaen aber bleibt ihr nur die Bühne des Hauses, auf der sie mit schneidendem Ton und hoch erhobenem Kinn regiert.",
              "Die Dorfbewohner begegnen ihr mit einer Mischung aus Respekt, Furcht und stiller Belustigung. Kinder imitieren sie im Spiel, während ihre Mütter sich hüten, sie laut zu kritisieren. Denn was Eris hört – und das ist so gut wie alles – merkt sie sich. Für immer.",
              "Sie ist kein Schattenmann, keine Intrigantin im Dunkeln – sie steht mitten im Licht, sieht alles, kommentiert alles und duldet keinen Widerspruch. Und obwohl viele sie fürchten, wäre Llysfaen ohne sie… leiser. Geordneter vielleicht – aber auch langweiliger."
            ],
            "portrait": "/Orte/Koenigreich_Cenyr/Grafschaft_Celtigerns_Wacht/Baronie_Llamreis_Ankunft/Herrschaft_Haus_Wyrm/Lysfaens_Bannkreis/Lysfaen/assets/eris-argall.png"
          },
          {
            "name": "Shylene Argall",
            "role": "Tochter des Bürgermeisters",
            "description": [
              "Shylene, Tochter des Bürgermeisters Brinthan Argall, ist in Llysfaen mehr als nur eine schöne Frau – sie ist eine Erscheinung. Man sagt, wenn sie über den Dorfplatz geht, halten sogar die Hähne auf den Zäunen kurz inne. Ihre Schönheit ist unbestritten: feingliedriges Gesicht, ausdrucksstarke Augen, rötlichbraunes Haar, das wie Bernstein im Abendlicht schimmert – selbst der Hofpoet (falls es je einen gäbe) würde bei ihr ins Stammeln geraten.",
              "Doch Schönheit ist nicht alles, was sie umgibt. Um Shylene rankt sich ein Hauch von Rätsel, von Stolz und Distanz – nicht kühl, aber unantastbar, wie Morgentau auf jungem Gras. Ihre sanfte Stimme, ihre aufrechte Haltung, das nüchterne Lächeln – all das macht sie zu einer Frau, die gesehen wird, ohne sich zeigen zu müssen.",
              "Und doch ist sie Gegenstand des Klatsches, der sehnsüchtigen Blicke, der getuschelten Gespräche. Denn Shylene hat ein Kind – unehelich. Ein kleiner Junge mit leuchtenden Augen und wildem Haar, der bei seiner Großmutter kaum etwas sagen darf, aber stets wachsam die Welt beobachtet. Wer der Vater ist, weiß niemand – oder besser: niemand hat es je aus ihrem Mund gehört. Und es haben viele gefragt.",
              "Shylene schweigt. Immer.",
              "Nicht aus Scham, wie manche behaupten. Auch nicht aus Trotz. Es ist ein stilles, beherrschtes Schweigen – das eines Menschen, der seine Verletzlichkeit in Würde gehüllt hat. Selbst ihre Mutter, Eris, beißt sich daran die Zunge wund – und das soll etwas heißen. Gerüchte kursieren genug: ein Knecht aus der Ferne, ein Knappe, ein Händler aus Gwynthor, vielleicht gar jemand vom Hof Wyrm? Doch sie selbst entkräftet nichts, bestätigt nichts.",
              "Was sie stattdessen tut: arbeiten. Helfen.",
              "Sie ist oft zu sehen bei den Talfryns, hilft in deren Kräutergarten, näht für die Kinder des Dorfes, pflegt Kranke mit ruhiger Hand – und spricht wenig. Doch wenn sie spricht, hört man hin. Weil jedes Wort mit Bedacht gewählt ist, und weil in ihrer Stimme eine Art Wahrheit liegt, die sich nicht in Regeln pressen lässt.",
              "Viele junge Männer verehren sie – manche heimlich, manche plump. Und viele Mütter wünschen sich eine Schwiegertochter wie sie, auch wenn sie das uneheliche Kind stets mit einem „aber“ versehen.",
              "Shylene Argall ist keine Rebellin. Aber auch keine Gefügte.",
              "Sie geht ihren Weg, aufrecht, mit Kind auf dem Arm und Blick nach vorn – und in einem Dorf wie Llysfaen ist das mehr, als so mancher Mann je gewagt hat."
            ],
            "portrait": "/Orte/Koenigreich_Cenyr/Grafschaft_Celtigerns_Wacht/Baronie_Llamreis_Ankunft/Herrschaft_Haus_Wyrm/Lysfaens_Bannkreis/Lysfaen/assets/shylene-argall.png"
          },
          {
            "name": "Iolo",
            "role": "Enkel des Bürgermeisters",
            "description": [
              "Man muss nur einmal durch Llysfaen gehen, um irgendwo von einer alten Frau, einem Stallknecht oder einem erschöpften Hufschmied den Satz zu hören: „Iolo? Was hat er diesmal wieder angestellt?“",
              "Iolo, der uneheliche Sohn von Shylene Argall, ist gerade einmal drei Jahre alt – und schon jetzt eine Naturgewalt. Klein, frech, rotblond wie die Sommersonne über den Feldern, mit blitzblauen Augen, in denen der Schalk persönlich zu wohnen scheint.",
              "Er klettert überall hoch, wo ein Mensch eigentlich nicht hin sollte. Er versteckt sich unter Tischen, in Heuwagen, im Brunnenhaus – und kommt immer genau dann hervor, wenn jemand etwas Peinliches sagt. Er hat einmal der Frau des Krämers einen Frosch ins Schürzenband gesteckt – und danach so süß gelächelt, dass sie ihn trotz Schreck in den Arm nahm.",
              "Die jungen Mädchen des Dorfes lieben ihn, die älteren rollen mit den Augen.",
              "„Er wickelt sie alle um den Finger“, murmelt der Wirt in der Taverne, wenn der Junge mal wieder unter einem Tisch auftaucht, wo er eigentlich nichts verloren hat. „Wo er das nur her hat?“, fragen sich viele mit einem halb belustigten, halb misstrauischen Blick auf seine Mutter Shylene, die dieses Grinsen, das nie ganz verschwindet, ganz sicher auch einmal trug – vielleicht in einer anderen Nacht, in einer anderen Geschichte, über die sie bis heute schweigt.",
              "Iolo redet viel – und klug für sein Alter.",
              "Seine Sätze sind nicht kindlich unbeholfen, sondern wirken wie aus dem Munde eines geschrumpften Schelms mit viel zu gutem Gedächtnis. Er hat Spitznamen für fast jeden im Dorf („Mürrischer Mähbär“ für den alten Schmied ist besonders beliebt) und ein Gespür dafür, wann Erwachsene müde sind – was er gnadenlos ausnutzt.",
              "Doch so wild er ist, so liebenswert bleibt er. Er stiehlt Herzen wie andere Kinder Obst. Und manchmal, wenn niemand hinsieht, setzt er sich ganz still neben seine Mutter, greift nach ihrer Hand und sagt kein Wort – als wüsste er ganz genau, wie sehr sie ihn braucht.",
              "Iolo Argall ist ein Geheimnis mit Beinen, ein Lachen in der grauen Pflicht, ein Versprechen an das Dorf, dass Llysfaen trotz aller Sorgen noch lebt, lacht und träumt."
            ],
            "portrait": "/Orte/Koenigreich_Cenyr/Grafschaft_Celtigerns_Wacht/Baronie_Llamreis_Ankunft/Herrschaft_Haus_Wyrm/Lysfaens_Bannkreis/Lysfaen/assets/iolo.png"
          }
        ]
      },
      {
        "id": "levy",
        "title": "Aufgebot",
        "items": [
          {
            "name": "Gwydion Rhyddid",
            "role": "Hauptmann",
            "description": [
              "In einem Land der Ritter ist Sir Gwydion Rhyddid ein echtes Exemplar: ein Mann der Tat, des Maßes – und des Schweigens.",
              "Er ist der einzige Ritter in Llysfaen, gleichzeitig Hauptmann der Wache, Befehlshaber über Waffenknechte und Milwr, und der direkte Arm des Hauses Wyrm in dieser entlegenen Ecke der Baronie Lamreis. Und doch trägt er seinen Titel nicht wie eine Last – sondern wie einen gut sitzenden Mantel, aus festem Stoff und altem Schnitt.",
              "Hochgewachsen, mit einer Haltung wie aus Stein gemeißelt, rotem Haar, das stets ordentlich zurückgekämmt ist, und einem Blick, der gleichzeitig durchbohrt und schützt, ist Gwydion in Llysfaen allgegenwärtig und doch unaufdringlich. Seine Stimme ist ruhig, sein Urteil gerecht, sein Zorn selten – aber wenn er kommt, wie Donner über die Hügel, dann weiß jeder im Dorf, dass er ernst gemeint ist.",
              "Er stammt aus der Familie Rhyddid, einem kleinen, aber ehrwürdigen Ritterhaus aus Gwynthor, das einst durch besondere Tapferkeit dem Haus Wyrm auffiel und seither unter dessen Banner dient. In Llysfaen ist er als Vertreter des Adels wie auch als Verteidiger des Dorfes positioniert – und bewegt sich mit einer Eleganz zwischen beiden Welten, wie es nur wenigen gelingt.",
              "Die Leute schätzen ihn.",
              "Nicht, weil er laut wäre. Nicht, weil er sich aufdrängt. Sondern weil er zuhört, weil er nicht vergisst, und weil er auch für einen verletzten Stalljungen genauso einsteht wie für ein königliches Ross. Er kennt jedes Tor, jeden Pfad, jede Stimme im Dorf – und behandelt sie mit dem gleichen Respekt.",
              "Dass er unverheiratet ist, sorgt natürlich für allerlei Spekulationen. Bürgermeister Brinthan Argall würde ihn liebend gern mit seiner Tochter Shylene vermählen – „um endlich ein wenig Ordnung in das Familiendrama zu bringen“, wie er einmal betrunken in der Taverne gestand. Doch Sir Gwydions Blick schweift woanders hin – zu jemandem, über den er nicht spricht, nicht einmal mit dem Wirt. Und das allein reicht aus, um die Gerüchteküche von Llysfaen zum Brodeln zu bringen.",
              "Einige munkeln, er sei ein Mann mit einem gebrochenen Herzen aus früheren Tagen. Andere sagen, er habe der Liebe abgeschworen, um seinem Ehrenkodex zu dienen. Wieder andere behaupten, er sei dem Dorf bereits viel näher verbunden, als er selbst zugeben würde – man müsse nur wissen, wo man hinsieht.",
              "Doch was man auch über ihn sagt: Wenn Gefahr naht, steht Sir Gwydion an vorderster Front. Wenn das Recht gefragt ist, wird seine Stimme gehört. Und wenn eines Tages ein Kind in Llysfaen wissen will, was Ehre ist, dann wird man ihm sagen: „Frag den Ritter.“"
            ],
            "portrait": "/Orte/Koenigreich_Cenyr/Grafschaft_Celtigerns_Wacht/Baronie_Llamreis_Ankunft/Herrschaft_Haus_Wyrm/Lysfaens_Bannkreis/Lysfaen/assets/gwydion-rhyddid.png"
          },
          {
            "name": "Brizio Dwl",
            "role": "Soldat",
            "description": [
              "Brizio trägt ein Schwert an der Seite, das oft schief sitzt, einen Helm, der ihm zu groß ist, und ein Lächeln, das irgendwie immer fehl am Platz wirkt – und doch so ehrlich, dass man es ihm nie verübeln kann.",
              "Er ist Milizsoldat in Llysfaen – einer der einfachen Milwr, ohne Wappen, ohne Stammbaum, ohne besondere Eignung, dafür mit umso mehr Herz. Geboren wurde er auf einem kleinen Ziegenhof westlich des Dorfes, und so, wie er dort das Melken lernte, lernte er nun das Marschieren. Beides kann er halbwegs – aber wehe, jemand gibt ihm Befehl und Richtung gleichzeitig, dann kommt er meist in die falsche.",
              "Brizio meint es gut. Immer.",
              "Wenn ein Stalljunge Hilfe braucht, ist Brizio da. Wenn jemand einen Wasserkrug schleppt, trägt Brizio ihn – manchmal bis ans ganz falsche Ende des Dorfes.",
              "Und wenn der Hauptmann ihm sagt, er solle „den südlichen Zaun bewachen“, steht Brizio zuverlässig im Osten – und winkt jedem freundlich zu.",
              "Seine Kameraden spotten leise über ihn, aber nie bösartig. Denn Brizio ist ehrlich, mutig auf seine Weise, und niemals grausam. Er kann sich keine Befehle merken, vergisst regelmäßig sein Schwert, und hat sich schon einmal im eigenen Harnisch verheddert – aber wenn man ihm sagt, dass jemand in Not ist, rennt er los, ohne zu fragen.",
              "Und dann ist da noch sein Herz, das offenbar nicht weiß, wohin es schlagen soll.",
              "Man munkelt, Brizio habe ein Auge auf Tilly Brogar geworfen, die hübsche Schankmaid aus der Weißen Drachin. Aber andere wollen gesehen haben, wie er beim Markttag Anwen Crewe errötend einen Apfel überreichte. Und wer genau hinsieht, erkennt, wie er jedes Mal verlegen den Blick senkt, wenn Shylene Argall mit ihrem Sohn über den Dorfplatz geht.",
              "Vielleicht ist Brizio einfach zu gut für nur eine Liebe.",
              "Oder zu schüchtern, um überhaupt etwas zu sagen. Oder – was viele im Dorf glauben – er hat es einfach noch nicht gemerkt.",
              "Brizio ist kein Held. Aber wenn man ihn braucht, ist er da. Mit schiefem Helm, zu kurzem Speer, einem freundlichen Grinsen – und der unbeirrbaren Überzeugung, dass Gutes tun immer richtig ist, selbst wenn man dabei stolpert."
            ],
            "portrait": "/Orte/Koenigreich_Cenyr/Grafschaft_Celtigerns_Wacht/Baronie_Llamreis_Ankunft/Herrschaft_Haus_Wyrm/Lysfaens_Bannkreis/Lysfaen/assets/brizio-dwl.png"
          }
        ]
      },
      {
        "id": "other",
        "title": "Sonstige",
        "items": [
          {
            "name": "Sir Nedri Tlawd",
            "role": "Gast/ Reisender",
            "description": [
              "Sir Nedri (Haus Tlawd ) ist ein bekanntes Gesicht in der Region – mal in Garwfaen, mal in Morddyn, doch am häufigsten im Rostigen Haken anzutreffen, meist mit einem Krug in der Hand. Einst diente er den ehrwürdigen Grafen der Draig, kämpfte im Norden bei Vennyr und später im Süden gegen Ceitheach. Den Ritterschlag erhielt er von niemand Geringerem als Graf Rodri, „als dieser noch auf beiden Beinen stand“, wie Nedri selbst gern anmerkt.",
              "Heute ist er ein freigestellter Fahrender Ritter, ohne Herren, aber mit Ehre im Herzen. Er nimmt Aufträge vom Schwarzen Brett an – für Kupfer, Silber oder einfach ein warmes Essen – und hilft, wo Not herrscht. Ein wenig zynisch, manchmal betrunken, aber immer bereit, Schwert und Schild für die Schwachen zu heben."
            ],
            "portrait": "/Orte/Koenigreich_Cenyr/Grafschaft_Celtigerns_Wacht/Baronie_Llamreis_Ankunft/Herrschaft_Haus_Wyrm/Lysfaens_Bannkreis/Lysfaen/assets/sir-nedri-tlawd.png"
          }
        ]
      }
    ],
    "regionMap": {
      "mapId": "cenyr-celtigerns-wacht-llamrais-ankunft-wyrm-llysfaen-bannkreis",
      "title": "Llysfaen – Bannkreis",
      "embedHref": "/Karten/karte.html?map=cenyr-celtigerns-wacht-llamrais-ankunft-wyrm-llysfaen-bannkreis",
      "fullHref": "/Karten/karte.html?map=cenyr-celtigerns-wacht-llamrais-ankunft-wyrm-llysfaen-bannkreis",
      "pois": []
    }
  });
})();
