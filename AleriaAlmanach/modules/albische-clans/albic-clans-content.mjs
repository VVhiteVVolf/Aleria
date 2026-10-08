// Die Präfixlehre folgt der Nutzervorlage vom 08.10.2026, nicht der realen gälischen Namenskunde.
// Belegte Familienbeispiele und ausdrücklich hypothetische Anwendungen bleiben getrennt.
export const ALBIC_CLAN_PAGES = [
  {
    key: 'clan-und-sept', title: 'Clan und Sept', group: 'Grundlagen',
    lead: 'Ein Name verbindet Menschen mit einer Herkunft. Sein Präfix erzählt, worauf diese Verbindung beruht.',
    sections: [
      ['Der Clan', 'Ein albischer Clan ist eine familiäre Gemeinschaft, die sich auf gemeinsame Abstammung oder eine bestimmte Herkunft beruft. Seine Identität kann an einen Ahnen, eine Ahnenmutter, einen Ort oder eine überlieferte Aufgabe gebunden sein. Clans tragen die politische, wirtschaftliche und kulturelle Ordnung der Alben mit.'],
      ['Die Sept', 'Eine Sept ist eine bäuerliche oder bürgerliche Familie ohne Adelsstand. Sie kann arm, wohlhabend oder gesellschaftlich angesehen sein; gewöhnlich führt sie keinen Clan-Präfix. Bei einer Erhebung kann sie etwa Na annehmen oder einen anderen Präfix, der ihre neue Stellung und Herkunft angemessen beschreibt.'],
      ['Namen lesen', 'Ein Präfix ist kein Amt und keine feste Rangstufe. Mac, Ui oder Ard erklären unterschiedliche Ansprüche auf Herkunft und Ansehen. Ein Name kann mehrere Aussagen verbinden: Mac Ard’Ronain nennt zugleich Abstammung und Ruhm. Die folgenden Seiten behandeln jede Präfixgruppe einzeln; gleichbedeutende Kurzformen stehen zusammen.']
    ],
    example: { familyId: 'sept-daire', kind: 'documented', people: ['lorcan-daire'], paragraphs: ['Die Sept Daire aus Tulachinis lebte von Handwerk, Vorratshandel und Viehhaltung unter den Mac Tuirseach. Ihre Männer konnten als Tiarna-Krieger dienen, ohne dass die Familie dadurch zum Adelsclan wurde. Lorcán Daire, geboren 1702, ist nach dem Krieg und seinen Folgen der letzte Überlebende. Sein Beispiel zeigt, dass persönliche Kriegserfahrung und Herkunft als Sept nebeneinander bestehen.'] },
    caption: 'Lorcán Daire mit einer schlichten Haushaltsschale: eine sinnbildliche Erinnerung an seine verlorene Sept.'
  },
  {
    key: 'mac', prefix: 'Mac', title: 'Mac — Söhne des Ursprungs', group: 'Herkömmliche Präfixe',
    lead: 'Die väterliche Linie bewahrt den Namen ihres Ursprungs.',
    sections: [
      ['Abstammung über die Väter', 'Mac bezeichnet die patrilineare Herkunft von einem gemeinsamen männlichen Ahnen, häufig dem Gründer. Der Clan stellt diese Linie in den Mittelpunkt seines Selbstverständnisses, auch wenn seine Geschichte viele Generationen umfasst.'],
      ['Ehre und Erwartung', 'Die Verbindung zu einem angesehenen Stammvater verleiht Prestige. Mit ihr verbindet sich die Erwartung, Familienehre, Überlieferung und Führungsverantwortung zu bewahren. Lieder und Erzählungen halten den Ahnen gegenwärtig. Aus solchen Hauptlinien können Zweigfamilien mit Ó oder Ua hervorgehen.']
    ],
    example: { familyId: 'haus-mac-airt', kind: 'documented', people: ['colman-founder-airt', 'cormac-1664-airt', 'bairre-airt'], paragraphs: ['Mac Airt in Leitheach führt seine Gründung auf den sagenhaften Fianna Colman zurück. Aus seinem Lehen erwuchs die Siedlung Sruthlann. Cormac Airt, geboren 1664, ist seit 1715 Mor Tiarna von Tir an Comhchuibhis; Bairre steht an erster Stelle der benannten Erbfolge.', 'Der Name hält Colman als Ursprung fest. Die Überlieferung enthält dennoch Lücken: Der Anspruch auf eine väterliche Herkunft macht unbekannte Generationen nicht nachträglich zu namentlich belegten Personen.'] },
    caption: 'Das Vogelwappen der Mac Airt und eine Ahnenrolle in Sruthlann; ein Stillleben zur Weitergabe der väterlichen Linie.'
  },
  {
    key: 'o-ua', prefix: 'Ó / Ua', title: 'Ó / Ua — Sprösslinge des Clans', group: 'Herkömmliche Präfixe',
    lead: 'Ein eigener Zweig bleibt mit dem Stammhaus verbunden.',
    sections: [
      ['Kinder eines Clans', 'Ó und Ua betonen die Zugehörigkeit zu einer größeren Abstammungsgemeinschaft. Häufig tragen Kadetten- oder Nebenlinien diese Bezeichnung: Sie leiten sich von einem Clan oder einem bedeutenden Mitglied ab, ohne dessen unmittelbare Hauptlinie fortzuführen.'],
      ['Ost und West', 'Östliche Alben verwenden Ó, westliche Ua. Beide Formen haben dieselbe Bedeutung. Ein eigenes Wappen, ein eigener Sitz und eigene Gepflogenheiten können die Zweigfamilie auszeichnen, während ihre Herkunft im Namen erkennbar bleibt.']
    ],
    example: { familyId: 'haus-goidin', kind: 'documented', people: ['bairrfhionn-1669-goidin'], paragraphs: ['Ua’Goidin in Sioran ist als Kadettenhaus der Nessa überliefert. Sein Gründer Bairrfhionn wurde für Verdienste um Verwaltung und Finanzen des Stammhauses mit einer eigenen Linie belohnt.', 'Der heutige Laird Bairrfhionn Goidin, geboren 1669, ist eine spätere Person gleichen Vornamens. Die Goidin pflegen enge Beziehungen zu Druiden; deren Empfehlung bestimmt die Nachfolge. Seine Enkelin Meabh wurde bereits bei ihrer Geburt als Nachfolgerin bestimmt. So verbindet die Nebenlinie ihre Nessa-Herkunft mit einer eigenen Ordnung.'] },
    caption: 'Laird Bairrfhionn Goidin über einem Verwaltungsbrett in Sioran: Verantwortung innerhalb einer eigenständigen Nebenlinie.'
  },
  {
    key: 'nic', prefix: 'Nic', title: 'Nic — Sprösslinge der Ahnenmutter', group: 'Herkömmliche Präfixe',
    lead: 'Am Anfang der Linie steht eine Frau, deren Name und Herkunft bewahrt werden.',
    sections: [
      ['Die mütterliche Herkunft', 'Nic bezeichnet die matrilineare Herleitung von einer gemeinsamen Ahnenmutter. Solche Clans sind selten. Der Präfix ehrt die Frau, von der die Gemeinschaft ihre besondere Identität ableitet.'],
      ['Herkunft und heutige Führung', 'Viele ursprünglich matrilinear geführte Clans gingen später zu patriarchalen Strukturen über und behielten Nic als Erinnerung. Andere lassen bis heute ausschließlich Frauen die Linie und den Namen weitergeben. Aus dem Präfix allein lässt sich deshalb die gegenwärtige Nachfolgeordnung nicht ablesen.']
    ],
    example: { familyId: 'haus-nuadat', kind: 'documented', people: ['nuada-founder-nuadat', 'tadg-1663-nuadat'], paragraphs: ['Nic’Nuadat in Dunfal erzählt von Nuada, der Tochter eines Druiden-Riesen, und dem Krieger Nógh. Ihr Bund begründete den Clan. Die Ahnenmutter und die Naturverbundenheit gehören zum Selbstverständnis des Hauses von Cradh na Frinne.', 'Heute führt Tadg Nuadat den Clan als Mor Tiarna von Tir na Fathach. Gerade diese Verbindung macht das Beispiel anschaulich: Nic bewahrt die matriarchalische Herkunft auch unter einem männlichen Oberhaupt.'] },
    caption: 'Nuada neben einer alten Eiche und ihrem jungen Schössling: die Ahnenmutter als Ursprung einer weiterlebenden Linie.'
  },
  {
    key: 'ui', prefix: 'Ui', title: 'Ui — Sprösslinge der Hohen', group: 'Herkömmliche Präfixe',
    lead: 'Ein Ehebund mit dem Königsclan Tuathanach verleiht einer Familie ein Ansehen, das über das Ende des Königshauses hinausreicht.',
    sections: [
      ['Verschwägert mit dem Königsclan', 'Ui bezeichnet eine durch Verschwägerung entstandene Verwandtschaft mit den Tuathanach, dem Königsclan der Alben. Ein Ehebund verbindet das betreffende Haus mit der königlichen Familie. Die Tuathanach gelten als ausgestorben; die Erinnerung an diese Verbindung bleibt im Präfix ihrer verschwägerten Clans erhalten.'],
      ['Das Prestige des Königshauses', 'Ui-Clans genießen deshalb mitunter das größte Prestige unter den Alben und sind meist Fürstenhäuser. Ihr Ansehen beruht auf der verwandtschaftlichen Nähe zum einstigen Königsclan. Der Präfix bewahrt diese besondere Verbindung auch über viele Generationen.'],
      ['Ui und Ri', 'Ui kennzeichnet den durch Heirat entstandenen Verwandtschaftsbund mit den Tuathanach. Ri bezeichnet dagegen die direkte Blutlinie legitimer Albenkönige, deren Nachweis nur Druidenälteste anerkennen können. Die Verschwägerung und das hohe Prestige eines Ui-Clans begründen für sich allein keinen Ri-Anspruch.']
    ],
    example: { familyId: 'haus-morna', kind: 'documented', people: ['goll-1668-morna', 'garbhan-morna'], paragraphs: ['Ui’Morna herrscht von Gaelan aus über Aislearneach. Der Gründer Garbhán, Begründer der Reiterkaste der Mormaer, heiratete Prinzessin Ainéinan aus dem Königsclan Tuathanach. Dieser Ehebund macht die Bedeutung von Ui unmittelbar anschaulich: Das Haus Morna wurde mit dem Königshaus verschwägert.', 'Fürst Goll Morna und sein Sohn Garbhán, Mor Tiarna von Gaelan und Fürstenerbe, stehen heute für die fortdauernde fürstliche Stellung des Clans. Der Name Ui’Morna bewahrt die königliche Verwandtschaft durch Heirat und das damit verbundene Prestige, obwohl die Tuathanach selbst als ausgestorben gelten.'] },
    caption: 'Goll Morna mit einem ruhig geführten Pferd vor den grünen Hügeln Gaelans; Reittradition und das Prestige eines mit den Tuathanach verschwägerten Fürstenhauses.'
  },
  {
    key: 'na', prefix: 'Na', title: 'Na — Neuer Adel', group: 'Herkömmliche Präfixe',
    lead: 'Aus einer gewöhnlichen Familie kann ein anerkannter Clan werden.',
    sections: [
      ['Eine neue Stellung', 'Na kennzeichnet neu gebildete oder jüngst in den Adel erhobene Clans. Häufig stehen am Anfang Septs, deren Angehörige einem Fürsten oder König dienten und durch ihre Leistungen Anerkennung erlangten.'],
      ['Der Name erinnert', 'Die Erhebung verändert die gesellschaftliche Stellung, nicht die bereits gelebte Familiengeschichte. Nach einiger Zeit kann ein Na-Clan einen anderen passenden Präfix annehmen. Ein beibehaltener Name kann den Aufstieg noch lange nach seiner Gründungszeit in Erinnerung halten.']
    ],
    example: { familyId: 'haus-luchdon', kind: 'documented', people: ['liamach-founder-luchdon', 'liamach-1673-luchdon'], paragraphs: ['Na’Luchdon in Aislearneach führt sich auf Liamach den Kleinen zurück. Trotz des Spotts über seine geringe Körpergröße gewann er durch Geschick und Tapferkeit die Anerkennung der Ceallaigh. Der Clan sitzt in Broch an Creig.', 'Das heutige Oberhaupt Liamach Luchdon, geboren 1673, ist ein späterer Namensträger. In seiner Familie erbt das erstgeborene Kind unabhängig vom Geschlecht. Na erklärt den Aufstieg des Hauses; diese Nachfolgeregel gehört zu seiner eigenen Tradition.'] },
    caption: 'Der heutige Liamach Luchdon vor dem einfachen Hof von Broch an Creig; der anerkannte Clan erinnert an seinen Aufstieg.'
  },
  {
    key: 'an', prefix: 'An', title: 'An — Spross der Stadt', group: 'Herkömmliche Präfixe',
    lead: 'Ein Ort kann zum Ursprung eines gemeinsamen Namens werden.',
    sections: [
      ['Herkunft aus einem Ort', 'An kennzeichnet Clans, deren Identität an eine Stadt oder einen bestimmten Ort gebunden ist. Die Geschichte dieser Heimat tritt an die Stelle einer ausschließlich auf einen einzelnen Ahnen ausgerichteten Herleitung.'],
      ['Verbundene Aussagen', 'An kann mit anderen Präfixen kombiniert werden, wenn ein Clan sowohl Ort als auch Abstammung betonen möchte. Gerade bei neu entstandenen Gemeinschaften oder einer unklaren Gründerfigur kann die örtliche Herkunft zum beständigsten Bezugspunkt werden.']
    ],
    example: { familyId: 'haus-haeghra', kind: 'documented', people: ['donnagh-heaghra', 'deaglan-1695-haeghra'], paragraphs: ['An’Haeghra, auch Heaghra geschrieben, ist in Réadlann in Blaithneach beheimatet. Der Clan verbindet seine örtliche Stellung mit dem Brauhandwerk. Donnagh Haeghra ist Dún Tiarna und Braumeister, sein Rat in Verwaltungsfragen weit über den eigenen Sitz hinaus geschätzt.', 'Déaglán, geboren 1695, ist als Laird von Réadlann überliefert. Das Beispiel verbindet einen belegten An-Namen mit seinem heutigen Ort; der Name selbst beweist keine zusätzlich erfundene Gründungsgeschichte Réadlanns.'] },
    caption: 'Donnagh Haeghra mit einer hölzernen Braukelle im Hof von Réadlann; Handwerk und örtliche Zugehörigkeit.'
  },
  {
    key: 'tir-an', prefix: 'Tir An', title: 'Tir An — Spross des Landes', group: 'Herkömmliche Präfixe',
    lead: 'Die Heimat wird zum gemeinsamen Ahnenbild.',
    sections: [
      ['Das Land als Ursprung', 'Tir An bezieht die Identität auf ein größeres Land oder einen bedeutsamen Herkunftsort. Einzelne Vorfahren können aus der Überlieferung verschwunden sein; manchmal entscheidet sich die Gemeinschaft bewusst dafür, ihre Heimat stärker zu betonen als eine Person.'],
      ['Eine Herkunft, die mitzieht', 'Auch fern der Heimat kann ein solcher Name die Wurzeln bewahren. Er bezeichnet damit mehr als den augenblicklichen Wohnsitz. Der Unterschied zu An liegt in der Betonung des Landes beziehungsweise des umfassenderen Herkunftsraums.']
    ],
    example: { familyId: 'haus-tir-an-tordarroch', kind: 'documented', people: ['goraidhas-1650-tordarroch'], paragraphs: ['Tir An’Tordarroch ist in Teorannach, Tir na Toraidh in Ceitheach, verzeichnet. Goraidhas Tordarroch, geboren 1650, führte den Clan von 1697 bis 1720. Sein Name bietet ein belegtes Beispiel für den Landespräfix.', 'Die Szene nimmt diesen historischen Angehörigen heraus und stellt ihn in Beziehung zur Landschaft. Eine darüber hinausgehende Auswanderungsgeschichte oder ein bestimmter verlorener Stammvater wird dem Clan dadurch nicht zugeschrieben.'] },
    caption: 'Goraidhas Tordarroch an einem alten Grenzstein über den Hügeln von Teorannach; historische Darstellung vor 1720.'
  },
  {
    key: 'dal', prefix: 'Dál', title: 'Dál — Teil einer umstrittenen Herkunft', group: 'Herkömmliche Präfixe',
    lead: 'Der Anspruch auf einen Ursprung kann stärker sein als sein Nachweis.',
    sections: [
      ['Teil von, Portion', 'Dál deutet eine unklare, umstrittene oder spekulative Verbindung zu einem Stammbaum oder Ahnen an. Ein Clan mag sich etwa auf einen uralten Druiden oder einen nur sagenhaft überlieferten König berufen, ohne den Zusammenhang hinreichend begründen zu können.'],
      ['Ein Name aus fremdem Urteil', 'Die Bezeichnung muss keine Selbstwahl sein. Andere Alben können eine unzureichend belegte Herkunft als Dál einordnen. Das Urteil über einen Abstammungsanspruch entscheidet dabei nicht automatisch über die Fähigkeiten oder das gegenwärtige Amt einzelner Clanmitglieder.']
    ],
    example: { familyId: 'haus-gairner', kind: 'documented', people: ['goraidh-1670-gairner'], paragraphs: ['Dal’Gáirnér in Blaithneach ist als Kadettenhaus der Ronain belegt. Nachdem Goraidh, der Bruder des Fürsten Caius, früh gestorben war, erhielt sein unehelicher Sohn Sìmag die Lairdwürde und begründete die Linie.', 'Hier zeigt der Präfix einen schwierigen genealogischen Ausgangspunkt, obwohl die Familienüberlieferung konkrete Verwandtschaften benennt. Der heutige Goraidh Gáirnér, geboren 1670, ist Laird von Eorach und Marschall. Ihn wegen seines Namens als Betrüger zu bezeichnen, wäre durch die Akte nicht gedeckt.'] },
    caption: 'Goraidh Gáirnér prüft eine geöffnete Ahnenrolle; der Marschall trägt Verantwortung trotz des belasteten Herkunftszeichens.'
  },
  {
    key: 'fir', prefix: 'Fir / Fir An', title: 'Fir / Fir An — Spross der Fremden', group: 'Herkömmliche Präfixe',
    lead: 'Albische Zugehörigkeit kann aus der Begegnung verschiedener Völker wachsen.',
    sections: [
      ['Vermischte Wurzeln', 'Fir beziehungsweise Fir An verweist auf eine verwischte Abstammung zu einem anderen Volk. Solche Clans entstanden häufig durch Eroberung, Not oder längere Verbindungen zwischen Kulturen.'],
      ['Teil der albischen Gemeinschaft', 'Die fremden Wurzeln stehen neben der albischen Identität. Ein Teil der Herkunft kann nachvollziehbar sein, anderes bleibt durch Vermischung und Anpassung undeutlich. Der Name allein benennt weder ein bestimmtes fremdes Volk noch das Aussehen jedes Nachkommen.']
    ],
    example: { familyId: 'haus-gallchobhair', kind: 'documented', people: ['faolan-gallchobhair'], paragraphs: ['Fir An’Gallchobhair sitzt in Dun Laog, Tir na Sinsear in Leitheach. Faolan Gallchobhair ist seit 1724 Dún Tiarna. Aus der Linie gingen die Laird-Clans Ua’Cleir, Ua’Ghaiscíoch und Dál’Ceardaíocht hervor.', 'Der Fir-An-Name und die albische Stellung bestehen somit nebeneinander. Für die Illustration wird Faolan aus der überlieferten Familie gewählt; eine konkrete fremde Ursprungsbevölkerung wird ohne entsprechenden Beleg nicht ergänzt.'] },
    caption: 'Faolan Gallchobhair begrüßt einen Reisenden am Flussufer bei Dun Laog; eine sinnbildliche Begegnung verschiedener Herkünfte.'
  },
  {
    key: 'ri', prefix: 'Ri', title: 'Ri — Spross des Königs', group: 'Herkömmliche Präfixe',
    lead: 'Königliches Blut braucht die Anerkennung der Druidenältesten.',
    sections: [
      ['Die legitime Königslinie', 'Ri bezeichnet die direkte Blutlinie legitimer Albenkönige. Ihren Nachweis können nur Druidenälteste anerkennen. Deshalb tragen praktisch keine Clans diesen Präfix ohne ausdrückliche Bestätigung ihrer Königswürde.'],
      ['Anerkennung statt Selbsternennung', 'In der Regel wird ein bereits bestehender Clan erst nach dieser Bestätigung zum Ri-Clan erklärt. Ein Fürstentitel, hohes Ansehen oder ein königlich klingender Ortsname reichen dafür nicht aus. Auch die durch Ui bezeichnete Verschwägerung mit dem als ausgestorben geltenden Königsclan Tuathanach ersetzt diesen Nachweis einer direkten Königslinie nicht.']
    ],
    example: { familyId: 'haus-chulainn', kind: 'hypothetical', people: ['cu-1509-chulainn', 'connla-1660-chulainn'], paragraphs: ['Ard’Chulainn führt das Fürstentum Dunfal und Tir na Rithe, das Land der Könige. Cú ist als Gründer und Fürst, Connla als Mor Tiarna und erster Erbe belegt. Daraus folgt noch kein Ri-Präfix.'], thought: 'Würde ein Druidenältester bei dieser Familie eine direkte legitime Königslinie nachweisen und anerkennen, wäre eine Erklärung zum Ri-Clan denkbar. Das Gedankenbeispiel beschreibt die erforderliche Schwelle; eine solche Anerkennung ist für Chulainn hier nicht als geschehen behauptet.' },
    caption: 'Gedankenbild: Cú Chulainn vor einem unbesetzten alten Herrschersitz. Eine Krönung oder Ri-Anerkennung wird nicht dargestellt.'
  },
  {
    key: 'ard', prefix: 'Ard', title: 'Ard — Erhabener Spross', group: 'Herkömmliche Präfixe',
    lead: 'Der Ruhm einer herausragenden Person strahlt auf ihre Linie aus.',
    sections: [
      ['Eine berühmte Herkunft', 'Ard bezeichnet Clans, die sich auf eine berühmte, legendäre oder sogar noch lebende Person zurückführen. Ihr Ansehen wächst aus der Verbindung zu dieser Gestalt und aus der Hoffnung, deren Bedeutung fortzuführen.'],
      ['Ruhm verpflichtet', 'Die Mitglieder stehen im Licht ihres Ursprungs. Bewunderung, Neid und hohe Erwartungen begleiten sie; die Ehre des Vorfahren zu bewahren und zu mehren wird zur gemeinsamen Aufgabe. Der Einfluss eines solchen Hauses kann weit über die eigene Region reichen.']
    ],
    example: { familyId: 'haus-nessa', kind: 'documented', people: ['conchobhar-founder-nessa', 'rioghbhar-1671-nessa'], paragraphs: ['Ard’Nessa in Blaithneach erinnert an Conchobhar, den Schwarzen Falken. Der legendäre Gründer verkörpert den kriegerischen Anspruch des Hauses von Sioran. Seine Nachfahren verbinden diesen Ruhm mit den Aufgaben eines regierenden Clans.', 'Heute führt Mor Tiarna Rioghbhár Nessa Tir na Beatha. Der Name Ard’Nessa schlägt die Brücke zwischen der berühmten Gründergestalt und der Verantwortung lebender Nachkommen. Auch Ard’Chulainn bietet mit seinem noch lebenden Gründer Cú ein Beispiel dieser Namensidee.'] },
    caption: 'Conchobhar Nessa, der Schwarze Falke, in einer ruhigen Szene über dem grünen Land; Darstellung der überlieferten Gründergestalt.'
  },
  {
    key: 'faill', prefix: 'Fáill', title: 'Fáill — Verfallener Spross', group: 'Herkömmliche Präfixe',
    lead: 'Die Fianna können einen Clan aus der albischen Rechtsgemeinschaft ausschließen.',
    sections: [
      ['Die Brandmarkung', 'Fáill bezeichnet einen von den Fianna als Volksverräter gebrandmarkten Clan. Er gilt als vogelfrei und steht außerhalb des albischen Gesetzes. Andere Clans dürfen ihn weder aufnehmen noch schützen; seinen Mitgliedern darf Schaden zugefügt werden. Häufig stehen Verrat am eigenen Volk oder ein Bündnis mit äußeren Feinden am Anfang.'],
      ['Das Urteil über den Einzelnen', 'Die Rückkehr ist grundsätzlich möglich, aber selten und mit großen Prüfungen verbunden. Persönliche Schuld folgt nicht zwangsläufig aus dem Namen: Die Fianna können einzelne Unschuldige oder nachweislich Distanzierte gesondert beurteilen und ausklammern.']
    ],
    example: { familyId: 'haus-cleirigh', kind: 'documented', people: ['pailtear-cleirigh'], paragraphs: ['Fáill Cléirigh in Blaithneach ist als ausgestoßener Clan geführt. Morrigans Bündnis mit einem Hexenkult und ihr gewaltsamer Griff nach der Macht zerrissen das Haus. Háscan ermöglichte seinem Sohn Pailtéar die Flucht.', 'Pailtéar, geboren 1698, überlebte und wurde später Bandenführer im Blutbund. Sein Überleben macht den Clan nicht automatisch rehabilitiert; ebenso wenig darf er als ausgestorben gelten. Das Beispiel verdeutlicht, warum Clanstatus und einzelnes Schicksal getrennt betrachtet werden müssen.'] },
    caption: 'Pailtéar Cléirigh an einer verlassenen Weggabelung; sein verletztes Gesicht folgt dem vorhandenen Porträt.'
  },
  {
    key: 'breac', prefix: 'Breac', title: 'Breac — Gespaltener Spross', group: 'Herkömmliche Präfixe',
    lead: 'Wenn mehrere Linien zugleich das ganze Stammhaus beanspruchen, wird aus Verzweigung ein Bruch.',
    sections: [
      ['Eine formelle Spaltung', 'Breac bezeichnet zwei oder mehr konkurrierende Linien, die jeweils beanspruchen, allein die legitime Fortführung des ursprünglichen Clans zu sein. Häufig entstehen solche Konflikte aus Erbstreitigkeiten, Machtkämpfen oder strittigen Thronfolgen. Eine gewöhnliche Kadettenlinie genügt dafür nicht.'],
      ['Geteilte Namen', 'Die Fianna teilen den Clan formell. Alle daraus entstehenden Linien müssen Breac und eine unterscheidbare Ableitung des alten Namens führen; keine darf den ursprünglichen Namen unverändert beanspruchen. Der Name erinnert an dynastische Instabilität, selbst wenn die Linien später friedlich nebeneinander leben.']
    ],
    example: { familyId: 'haus-ronain', kind: 'hypothetical', people: [], paragraphs: ['Mac Ard’Ronain in Blaithneach besitzt mit Suiste, Eala und Gáirnér belegte Kadettenhäuser. Diese Verzweigung allein ist keine Breac-Spaltung.'], thought: 'Würden zwei Ronain-Linien eines Tages beide die alleinige Fortführung des gesamten Stammhauses beanspruchen und von den Fianna formell getrennt werden, müssten beide unterscheidbare Breac-Namen erhalten. Das wäre ein anderer Vorgang als die bereits belegte Gründung von Nebenhäusern. Ein solcher Streit wird keinem gegenwärtigen Ronain-Mitglied zugeschrieben.' },
    caption: 'Gedankenbild: Das Ronain-Wappen hinter zwei auseinanderlaufenden Stoffbändern; ein Sinnbild möglicher Spaltung, keine neue Familienchronik.'
  },
  {
    key: 'tair', prefix: 'Tair', title: 'Tair — Spross der Prophezeiung', group: 'Herkömmliche Präfixe',
    lead: 'Eine Weissagung wird erst durch ihre bestätigte Erfüllung zum Gründungsgrund.',
    sections: [
      ['Verheißung und Tat', 'Tair bezeichnet einen Clan, der aus der Erfüllung einer druidischen Prophezeiung hervorging. Ein bekannter Druide kündigte beispielsweise einen Krieger und eine bestimmte Tat an. Vollbrachte dieser die angekündigte Handlung nachweislich, konnten die Fianna ihn erheben und seinen Namen mit Tair versehen.'],
      ['Ein seltener Nachweis', 'Weissagung und Erfüllung müssen bestätigt sein. Darin unterscheidet sich Tair von ungewisser Herkunft oder bloßer Legende bei Dál und Ruin. Außergewöhnlicher Ruhm kann eine Verbindung mit Ard, eine als göttlich gedeutete Tat mit Sidhe begründen.']
    ],
    example: { familyId: 'haus-fintain', kind: 'hypothetical', people: ['eachan-1669-fintain'], paragraphs: ['Mac’Fintain in Aislearneach wird gegenwärtig von Eachan geführt. Der Clan ist durch Rinderzucht und die unter Aufsicht der Fianna erfolgende Auswahl seines Oberhauptes geprägt.'], thought: 'Angenommen, ein bekannter Druide hätte einem Angehörigen dieser Familie eine genau bestimmte Rettungstat vorausgesagt und die Fianna bestätigten später ihre Erfüllung: Eine darauf gegründete neue Clanlinie könnte Tair tragen. Die bloße Aufsicht der Fianna über Fintains bestehende Nachfolge genügt dafür nicht. Eachan wird hier keine tatsächlich erfüllte Prophezeiung zugeschrieben.' },
    caption: 'Gedankenbild: Eachan Fintain hört einem Druiden am Rand einer Rinderweide zu; die hypothetische Weissagung bleibt eine Lehrszene.'
  },
  {
    key: 'ord', prefix: 'Ord', title: 'Ord — Spross des Schwurs', group: 'Herkömmliche Präfixe',
    lead: 'Ein Eid kann eine Gemeinschaft über viele Generationen binden.',
    sections: [
      ['Eine erbliche Verpflichtung', 'Ein Ord-Clan gründet sich auf einen bindenden Schwur gegenüber einer Person, Sache, Stätte oder Aufgabe. Der Eid gilt über Generationen und bindet die Nachkommen: etwa zum Schutz eines heiligen Ortes oder zur Bewahrung eines Ahnenbaums. Er endet durch Erfüllung der festgelegten Bedingung oder eine offizielle Entbindung.'],
      ['Erfüllung und Bruch', 'Nach ehrenhafter Erfüllung bleibt Ord als Zeichen bewiesener Standhaftigkeit erhalten; ein zusätzlicher Präfix wie Ard kann den Ruhm unterstreichen. Eidbruch bringt tiefen gesellschaftlichen Fall und häufig die Bezeichnung Fáill oder Mallacht mit sich. Die formelle Fáill-Brandmarkung gehört weiterhin in die Zuständigkeit der Fianna.']
    ],
    example: { familyId: 'haus-mac-airt', kind: 'hypothetical', people: [], paragraphs: ['Mac Airt bewahrt in Sruthlann die Erinnerung an Colman und seine Gründung. Der vorhandene Clanname beschreibt eine väterliche Herkunft, keinen belegten erblichen Ord-Schwur.'], thought: 'Würde sich eine neue Linie aus diesem Umfeld durch den generationsübergreifenden Eid begründen, Colmans Ahnenstätte bis zu einer festgelegten Erfüllung zu hüten, wäre Ord passend. Ein gewöhnlicher Dienstvertrag oder die persönliche Treue eines einzelnen Airt wäre dafür zu wenig. Ein solcher Schwur wird hier als Möglichkeit erläutert, nicht nachträglich in den Stammbaum eingesetzt.' },
    caption: 'Gedankenbild: Ein gebundener Eidstab und das Mac-Airt-Wappen bei einer alten Eiche; eine mögliche Verpflichtung über Generationen.'
  },
  {
    key: 'sidhe', prefix: 'Sidhe / Sid', title: 'Sidhe / Sid — Spross des Göttlichen', group: 'Ungewöhnliche Präfixe',
    lead: 'Die eigene Herkunft wird mit einer Welt jenseits des Gewöhnlichen verbunden.',
    sections: [
      ['Engelsvolk, Volk des Geistes', 'Sidhe, auch Sídhe oder verkürzt Sid, bezeichnet den Anspruch auf außerweltliche, göttliche oder fantastische Wurzeln. Manche Clans führen sich auf tatsächliche Druiden oder göttliche Geschöpfe zurück.'],
      ['Anspruch und Zweifel', 'Der Name allein beweist die Abstammung nicht. Wo die Verbindung unglaubwürdig oder unzureichend belegt erscheint, können andere den Clan als Dál einordnen. Geistlicher Dienst eines Angehörigen und eine übernatürliche Herkunft des gesamten Hauses sind unterschiedliche Aussagen.']
    ],
    example: { familyId: 'haus-magach', kind: 'documented', people: ['finnian-1646-magach'], paragraphs: ['Sidhe’Magach in Blaithneach führt sich auf den Tharim-Kleriker Maelrubha und die Bergarbeiterin Samthann zurück. Geistlicher Dienst, Bergbau und die Paladintradition prägen den Clan von Cairmor.', 'Finnian Magach ist Mor Tiarna von Tir na Méinnear und selbst Kleriker. Das Haus liefert einen belegten Sidhe-Namen und eine ausgeprägte sakrale Überlieferung. Daraus wird hier keine zusätzliche, bislang unbelegte göttliche Elternschaft einzelner Personen abgeleitet.'] },
    caption: 'Finnian Magach vor einem schlichten Heiligtum am Berg; geistlicher Dienst und die Heimat im Land der Erze.'
  },
  {
    key: 'droch', prefix: 'Droch / Dro', title: 'Droch / Dro — Spross der Finsternis', group: 'Ungewöhnliche Präfixe',
    lead: 'Die dunkle Herkunft und die Schuld der Nachkommen sind nicht immer dasselbe.',
    sections: [
      ['Finstere Wurzeln', 'Droch, verkürzt Dro, bezeichnet eine Abstammung von finsteren Mächten, dunklen Göttern oder Wesenheiten. Die albische Gesellschaft ächtet solche Clans gewöhnlich. Manche werden dennoch geduldet, wenn sie vor allem als Nachkommen ihrer Vorfahren gelten.'],
      ['Eine andere Aussage als der Fluch', 'Droch beschreibt eine Herkunft. Mallacht beschreibt dagegen einen Fluch oder den Ruf, verflucht zu sein. Ein Clan kann unter einem Fluch leiden, ohne von einer finsteren Wesenheit abzustammen. Ebenso entscheidet eine Fáill-Brandmarkung über Verrat und Rechtsstellung.']
    ],
    example: { familyId: 'haus-eamhra', kind: 'hypothetical', people: [], paragraphs: ['Fáill Mallacht Eamhra ist mit Sitz in Tineach in Ceitheach verzeichnet. Der überlieferte Name verbindet Ächtung und Fluch; er enthält keinen Droch-Präfix.'], thought: 'Würde bei dieser Familie zusätzlich eine Abstammung von einer finsteren Wesenheit festgestellt oder beansprucht, ließe sich daran Droch erklären. Die vorhandenen Bezeichnungen Fáill und Mallacht liefern diesen Herkunftsnachweis jedoch nicht. Das Gedankenbild zeigt deshalb nur das bestehende Clanwappen im Schatten und erfindet keinen dämonischen Ahnen.' },
    caption: 'Gedankenbild: Das Eamhra-Wappen an der Schwelle eines dunklen Hains. Der Schatten versinnbildlicht eine Frage nach Herkunft, keinen belegten Dämonenbund.'
  },
  {
    key: 'mallacht', prefix: 'Mallacht / Mall', title: 'Mallacht / Mall — Spross der Fäulnis', group: 'Ungewöhnliche Präfixe',
    lead: 'Ein Fluch kann einem Namen anhaften, lange bevor Außenstehende seine Ursache verstehen.',
    sections: [
      ['Der Makel des Fluchs', 'Mallacht oder Mall bezeichnet einen Clan, der unter einem Fluch leidet oder als verflucht gilt. Häufig entsteht dieser Name durch das Urteil anderer und wird von den Betroffenen nicht selbst gewählt.'],
      ['Ungewisse Ursachen', 'Erzählt wird etwa von einem Dämonenpakt oder einer schweren, von den Göttern bestraften Sünde. Solche Deutungen sind nicht in jedem Einzelfall nachweisbar. Der Ruf des Verfluchten kann ebenso hartnäckig sein wie ein tatsächlicher Fluch. Eine dunkle Abstammung ist dafür nicht vorausgesetzt.']
    ],
    example: { familyId: 'haus-seaghda', kind: 'documented', people: ['balor-seaghdha'], paragraphs: ['Mallacht Seaghda ist in Glaennmor, Tir na Dorcha in Ceitheach, belegt. Balor Séaghdha, geboren 1650, führte den Clan von 1691 bis zu seinem Tod 1720.', 'Der überlieferte Name macht das Haus zum passenden Beispiel für Mallacht. Ohne ergänzende Quelle wird hier weder eine konkrete Fluchmechanik noch ein bestimmter Dämonenpakt als Ursache behauptet. Balor bleibt eine historische Person und wird nicht als gegenwärtig lebendes Oberhaupt dargestellt.'] },
    caption: 'Balor Séaghdha vor einem vom Nebel verschatteten Hof; eine historische, sinnbildliche Darstellung des belasteten Namens.'
  },
  {
    key: 'ruin', prefix: 'Ruin / Ru', title: 'Ruin / Ru — Spross des Mythos', group: 'Ungewöhnliche Präfixe',
    lead: 'Eine Legende kann zur beständigen Mitte einer Familiengeschichte werden.',
    sections: [
      ['Die mythische Herkunft', 'Ruin, verkürzt Ru, bezieht die Identität auf eine Legende, eine mythologische Ahnenfigur oder einen sagenhaften Ursprung. Die Angehörigen sind stolz auf diese Verbindung; Geschichten und Erinnerungen tragen sie von Generation zu Generation.'],
      ['Legende und Beleg', 'Ruin beschreibt die Bindung an einen Mythos. Dál kann dagegen das Urteil über einen unzureichend begründeten Abstammungsanspruch sein. Tair verlangt eine bestätigte Weissagung und deren nachgewiesene Erfüllung. Ein sagenhafter Ursprung ist für sich genommen keine solche Prophezeiung.']
    ],
    example: { familyId: 'haus-morath', kind: 'documented', people: ['flann-1623-morath'], paragraphs: ['Ruin’Morath sitzt in Iarthar in Dunfal. Torna und Doireann stehen am Anfang der Überlieferung; bis zu den später datierten Familienlinien bleiben Generationen unbekannt.', 'Seit 1740 ist Flann Morath gewählter Laird. Der Clan bestimmt sein Oberhaupt durch Wahl: Sein mythischer Herkunftsname legt keine automatische Erbfolge fest. Die Szene stellt Flann in eine Landschaft alter Erinnerung, ohne ihm eine neue Sage oder einen übernatürlichen Vorfahren zuzuschreiben.'] },
    caption: 'Flann Morath bei alten Steinen über Iarthar; die Landschaft dient als Sinnbild für überlieferte Erinnerung.'
  },
  {
    key: 'toir', prefix: 'Toir', title: 'Toir — Spross der Schuld', group: 'Ungewöhnliche Präfixe',
    lead: 'Offene Schuld verlangt Wiedergutmachung durch Taten.',
    sections: [
      ['Eine Zeit der Buße', 'Toir bezeichnet einen Clan, der sich durch eine Schandtat am albischen Volk schuldig gemacht und seine Ehre vorübergehend verloren hat. Der Name steht für eine noch offene Verpflichtung zur Wiedergutmachung.'],
      ['Die Rückkehr zum früheren Namen', 'Erst wenn die Fianna die Schuld als getilgt und den Schaden als angemessen ausgeglichen anerkennen, darf der Clan seinen früheren Präfix und Stand wieder annehmen. Toir beschreibt damit einen Zustand der Prüfung. Er ist nicht einfach ein anderer Name für Fáill oder eine automatische Folge jeder Begnadigung.']
    ],
    example: { familyId: 'haus-ui-faill-duibhne', kind: 'hypothetical', people: [], paragraphs: ['Ui Faill Duibhne aus Cliath in Aislearneach bleibt als ausgestoßener Clan geführt. Ein begnadigter Teil der Familie hat jedoch überlebt. Coemgen warnte die Fianna; seine Linie mit Aodnait Ferbend und Diarmuid gehört zu den Überlebenden.'], thought: 'An einem solchen Fall lässt sich der Unterschied erklären: Würden die Fianna einer tatsächlich schuldigen Clanlinie ausdrücklich Wiedergutmachung auferlegen und sie als Toir führen, wäre deren Schuld bis zur Anerkennung offen. Die belegte Begnadigung der Duibhne-Überlebenden wird dadurch weder widerrufen noch in einen erfundenen Toir-Status umgedeutet.' },
    caption: 'Gedankenbild: Das Duibhne-Wappen neben einem reparierten Weidenzaun; Wiederherstellung als Sinnbild möglicher Wiedergutmachung.'
  },
  {
    key: 'dith', prefix: 'Díth', title: 'Díth — Nachhall des Ausgestorbenen', group: 'Ungewöhnliche Präfixe',
    lead: 'Das Blut eines Hauses kann erlöschen, während seine Aufgabe einen neuen Träger findet.',
    sections: [
      ['Spirituelle Nachfolge', 'Díth bezeichnet einen von den Fianna eingesetzten spirituellen Nachfolger eines ausgestorbenen Hauses. Voraussetzung ist, dass keine legitimen Blutnachfolger und keine mögliche verwandtschaftliche Erbfolge bestehen. Ein treuer Knecht oder Gefolgsmann kann so zum Träger von Burg und Titel werden.'],
      ['Eine Geschichte weitertragen', 'Der neue Clan übernimmt Gepflogenheiten, Traditionen und eine erkennbare Variation des alten Namens. Der ursprüngliche Clan bleibt im Blut tot, lebt aber in Aufgabe und Symbolik weiter. Dies kann den Rückfall eines Besitzes an den Lehnsherrn oder die Gründung eines gewöhnlichen Na-Clans vermeiden. Wer dafür die eigene Identität zurückstellt, genießt hohes Ansehen.']
    ],
    example: { familyId: 'haus-duilb', kind: 'hypothetical', people: [], paragraphs: ['Ui’Duilb in Dunfal ist ausdrücklich als ausgestorbener Clan verzeichnet. Ein letzter Erbe, das Erlöschensjahr und ein bereits eingesetzter Nachfolger sind in der vorliegenden Akte nicht benannt.'], thought: 'Sollten die Fianna nach Prüfung der fehlenden verwandtschaftlichen Erbfolge einen würdigen Gefolgsmann einsetzen, könnte dieser eine Díth-Linie mit erkennbar abgewandeltem Duilb-Namen begründen. Er würde die Geschichte des Hauses weitertragen, ohne zum leiblichen Nachkommen zu werden. Eine solche Einsetzung ist hier ausdrücklich nur das Beispiel für die Regel.' },
    caption: 'Gedankenbild: Das erhaltene Wappen der Ui’Duilb und ein ungetragener Mantel in einer stillen Halle; das Erbe wartet auf einen möglichen neuen Träger.'
  }
];
