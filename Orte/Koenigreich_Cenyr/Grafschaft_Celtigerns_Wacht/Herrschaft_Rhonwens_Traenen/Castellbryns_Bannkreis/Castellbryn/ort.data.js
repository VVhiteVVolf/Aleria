(function () {
  "use strict";

  const createPlaceData = window.ALERIA_CELTIGERNS_PLACES?.createPlaceData;
  if (typeof createPlaceData !== "function") return;

  const regionMapId = "cenyr-celtigerns-wacht-rhonwens-traenen-castellbryn-bannkreis";
  const regionMapHref = mapHref(regionMapId);
  const mapAssetRoot = "/Karten/Cenyr/celtigerns-wacht/rhonwens-traenen/castellbryn-bannkreis/Kartenbilder";
  const placeAssetRoot = "/Orte/Koenigreich_Cenyr/Grafschaft_Celtigerns_Wacht/Herrschaft_Rhonwens_Traenen/Castellbryns_Bannkreis/Castellbryn/assets";
  const newspaperHref = "/Zeitungen/zeitung.html?zeitung=schwarzbote-castellbryn";
  const houseRoot = "/Stammbäume/assets/images/houses/Rhonwens Tränen";
  const supporter = "/Stammbäume/assets/images/sigilsupporter/Schildkröte.png";

  const house = (familyId, name, rank, seat, liege, emblem) => Object.freeze({
    familyId,
    name: `Haus ${name}`,
    rank,
    seat,
    liege: liege === "..." ? "..." : `Haus ${liege}`,
    emblem: encodeURI(`${houseRoot}/${emblem}`)
  });
  const paragraph = (text) => Object.freeze({ type: "paragraph", text });
  const subheading = (text) => Object.freeze({ type: "subheading", text });
  const list = (...items) => Object.freeze({ type: "list", items: Object.freeze(items) });
  const section = (...blocks) => Object.freeze(blocks);

  const base = createPlaceData("castellbryn", {
    meta: {
      title: "Castellbryn - Aleria"
    },
    parentage: {
      lordship: "Rhonwens Tränen",
      region: "Castellbryn – Bannkreis"
    },
    features: {
      districts: true,
      noticeBoard: true,
      personalitiesCollapsed: true
    },
    presentation: {
      map: regionMapHref,
      images: {
        "supporter-left-png": {
          src: supporter,
          alt: "Schildkröte als Wappenstützer von Castellbryn",
          fit: "contain"
        },
        "supporter-right-png": {
          src: supporter,
          alt: "Schildkröte als Wappenstützer von Castellbryn",
          fit: "contain"
        },
        "bild-einer-stadtwache-png": {
          src: `${placeAssetRoot}/castellbryn-stadtwache.png`,
          alt: "Stadtwache von Castellbryn",
          fit: "contain"
        },
        "karten-bild-png": {
          src: `${mapAssetRoot}/CastellbrynBannkreisNormal.webp`,
          alt: "Castellbryn und sein Bannkreis",
          href: regionMapHref,
          fit: "contain"
        },
        "stadtsektionen-png": {
          src: `${mapAssetRoot}/CastellbrynBannkreisZonen.webp`,
          alt: "Zonen von Castellbryn und seinem Bannkreis",
          href: regionMapHref,
          fit: "contain"
        },
        "zeitung-png": {
          src: "/Zeitungen/data/schwarzbote-castellbryn/assets/schwarzbote-castellbryn.png",
          alt: "Der Schwarzbote – Ausgabe Castellbryn",
          href: newspaperHref,
          fit: "contain"
        }
      }
    },
    sections: {
      introduction: section(
        paragraph("Castellbryn ist der Sitz des Hauses Arwydd und das politische Zentrum der Herrschaft Rhonwens Tränen. Die Hafenstadt liegt an der westlichen Spitze der größten Insel des Archipels und zählt mit etwa 8.000 bis 11.000 Einwohnern zu den vier großen Städten Celtigerns Wachts, bleibt jedoch deutlich kleiner als Gwynthor, Abergwint und Rhosmere."),
        paragraph("Was als avallornische Hafenfestung zur Versorgung der Inselgruppe begann, wuchs unter Arwel dem Schwarzen Aal zur Handelsstadt heran. Noch heute bestimmen Festung, Hafen, Fischerei und der mühsame Verkehr zwischen Inseln und Festland das Leben Castellbryns.")
      ),

      background: section(
        paragraph("Die frühen Avallornier errichteten Castellbryn als befestigten Hafen an der Westspitze der großen Insel. Von hier aus konnten Vorräte, Soldaten und Nachrichten in die verstreuten Siedlungen von Rhonwens Tränen gebracht werden. Die günstige, weit in die See vorgeschobene Lage machte den Ort zugleich zu einem Wachposten für die westlichen Zufahrten der Grafschaft."),
        paragraph("Lange blieb Castellbryn vor allem Festung und Versorgungshafen. Erst Arwel der Schwarze Aal, der erste Ritterfürst aus dem späteren Haus Illysywen, förderte Märkte, Anlegestellen und den Handel. Unter ihm wuchs um die Wehranlage allmählich eine blühende Stadt, ohne je die Größe der drei bedeutenderen Großstädte auf dem Festland zu erreichen."),
        paragraph("Nach dem Untergang des Hauses Illysywen fiel Rhonwens Tränen an Haus Arwydd. Das junge Ritterfürstenhaus hat Castellbryn übernommen, muss seine Stellung gegenüber altem Inseladel, wirtschaftlichen Schwierigkeiten und den Gefahren der äußeren Inseln aber noch festigen.")
      ),

      location: section(
        paragraph("Castellbryn liegt unmittelbar an der westlichen Spitze der größten Insel von Rhonwens Tränen. Die Stadt nimmt eine geschützte Einbuchtung zwischen felsiger Küste und Flussmündung ein; Hafen und Festung kontrollieren gemeinsam die westliche Seezufahrt."),
        paragraph("Östlich der Stadt öffnen sich weite Ebenen des Bannkreises. Weiter im Inselinneren erhebt sich ein zentrales Gebirge, an dessen Hängen und Ausläufern größere Waldgebiete liegen. Straßen und Wasserwege verbinden Castellbryn mit den übrigen Siedlungen der Hauptinsel, während kleinere Inseln nur über See erreichbar sind.")
      ),

      administration: section(
        paragraph("Castellbryn ist keine Barons- oder Grafenstadt, sondern der Sitz eines Ritterfürstentums. An der Spitze stehen Ritterfürst Idris Arwydd und sein Haus, denen die Herrschaft Rhonwens Tränen als Lehen des Hauses Draig übertragen wurde."),
        paragraph("Der ritterfürstliche Hof und die Stadtverwaltung arbeiten eng zusammen. Die städtischen Ämter beaufsichtigen Hafen, Zoll, Fischmärkte, Speicher, Werften, Befestigungen und die fünf Bezirke; der Hof führt Gericht, Lehnswesen, militärische Planung und die Beziehungen zu den Vasallen der Inselgruppe."),
        paragraph("Da die Arwydd erst seit dem Ende des Krieges in Castellbryn herrschen, befinden sich viele Zuständigkeiten noch im Aufbau. Alte Amtsträger, neue Gefolgsleute und ehrgeizige Adelsfamilien ringen darum, wer Zugang zum Ritterfürsten erhält und welche Rechte aus der Zeit der Illysywen fortbestehen.")
      ),

      conflicts: section(
        subheading("Ein junges Ritterfürstenhaus"),
        paragraph("Haus Arwydd muss sich wirtschaftlich und politisch erst als Herrscher von Rhonwens Tränen etablieren. Die verfügbaren Ämter, Einkünfte und Lehen reichen nicht aus, um alle Erwartungen des Inseladels zu erfüllen. Niedere Häuser streiten daher selbst um die kleinen Anteile, die der Ritterfürst vergeben kann, und erschweren eine geschlossene Verwaltung."),
        subheading("Das Erbe des Bürgerkrieges"),
        paragraph("Die Erinnerung an den Kampf zwischen Illysywen, abtrünnigen Vasallen und Schuppenwacht ist in Castellbryn noch lebendig. Familien, die damals auf verschiedenen Seiten standen, begegnen einander mit Misstrauen. Für die Arwydd ist jeder Streit um alte Rechte zugleich eine Prüfung ihrer noch jungen Legitimität."),
        subheading("Piraten, Banditen und Schmuggler"),
        paragraph("Piraterie, Küstenbanden und Schmuggel sind auf den Inseln ein massives Problem. Abgelegene Buchten, dünn besetzte Wachposten und zahlreiche Seewege erleichtern Überfälle und den verborgenen Warenverkehr. Auf den äußeren Inseln und entlang einsamer Straßen treten zusätzlich gefährliche Kreaturen auf, gegen die einzelne Siedlungen häufig zunächst allein bestehen müssen.")
      ),

      history: section(
        subheading("Die avallornische Hafenfestung"),
        paragraph("Castellbryn entstand als Hafenfestung der frühen Avallornier. Ihre Aufgabe war nicht die Beherrschung einer großen Stadt, sondern die zuverlässige Versorgung von Rhonwens Tränen. Befestigte Lager, Anlegeplätze und eine kleine Garnison bildeten den ältesten Kern der heutigen Siedlung."),
        subheading("Arwel der Schwarze Aal"),
        paragraph("Arwel der Schwarze Aal tauchte beinahe aus dem Nichts in den Chroniken Celtigerns Wachts auf. Mit scharfem Verstand, außerordentlichem Charisma und großem Geschick stieg er im Umfeld des Hauses Draig auf. Er diente zunächst als Herold der Grafschaft und später als Herold des gesamten Königreichs. Selbst Owain Draig bewunderte den kultivierten und einflussreichen Lebemann."),
        paragraph("Über Arwels Herkunft berichten die öffentlichen Chroniken nur wenig. Der verborgenen Überlieferung zufolge war er ursprünglich ein verstoßener, missgestalteter Fischer aus der Inselgruppe Rhonwens Tränen. Einsam und von seiner Familie gemieden, zog er eines Tages einen geheimnisvollen Talisman aus seinem Netz. Dieser führte ihn zu einem Hexenpakt mit Mydral, dem Gott der Pakte und Wünsche."),
        subheading("Der Pakt mit Mydral"),
        paragraph("Eine Hexe zeigte Arwel das notwendige Ritual und führte ihn in eine märchenhafte Anderswelt. Dort erschien ihm ein schöner rothaariger Ritter in glänzender Rüstung – je nach Erzählung ein infernales Wesen oder ein Djinn. Das Wesen versprach, Arwels tiefsten Wunsch zu erfüllen: ein edler und schöner Ritter zu werden, ausgestattet mit all den Fähigkeiten, nach denen er sich sehnte."),
        paragraph("Als Preis beanspruchte das Wesen Arwels Seele und die Seelen seiner Nachkommen, sobald eine bis heute unbekannte Bedingung eintreten würde. Arwel kehrte jung, schön und begabt in die Welt zurück. Er wurde Krieger, Staatsmann, erster Ritterfürst von Rhonwens Tränen und Begründer des Hauses Illysywen. Sein früher Tod ließ das Geheimnis des Paktes ungelöst über seiner Linie zurück."),
        subheading("Vom Versorgungshafen zur Handelsstadt"),
        paragraph("Als Ritterfürst machte Arwel Castellbryn zum Mittelpunkt seiner Herrschaft. Er erweiterte Hafen und Märkte, zog Handwerker und Händler an und verband die Festung enger mit den Siedlungen der großen Insel. So entstand aus dem militärischen Versorgungsposten eine kleine, aber blühende Handelsstadt."),
        subheading("Rebellion und Herrschaftswechsel"),
        paragraph("Im Krieg gegen Ceitheach stellte sich das Haus Illysywen gegen die Draigs. Owain Draig und sein Bruder, die einst ausgerechnet Arwels Aufstieg bewundert hatten, besiegelten schließlich den Fall seiner Nachkommen. Im Jahr 1720 erlosch die männliche Linie des Ritterfürstenhauses."),
        paragraph("Der Krieg zerriss auch Castellbryn. Die Schuppenwacht und mehrere Vasallen verweigerten den Illysywen die Gefolgschaft; in den Straßen kämpften sie gegen die Haustruppen und treu gebliebenen Lehnsleute. Nach der Niederlage der Stadtwache flohen viele ihrer Mitglieder oder gerieten in Gefangenschaft."),
        paragraph("Nach dem Krieg übertrug Haus Draig die Herrschaft an die Arwydd. Graf Galahad Draig würdigte den Widerstand der Schuppenwacht und verhinderte ihre Auflösung. Damit blieb eine alte Institution der Stadt bestehen, obwohl Castellbryn einen neuen Ritterfürsten erhielt.")
      ),

      population: section(
        paragraph("Castellbryn zählt ungefähr 8.000 bis 11.000 Einwohner. Den weitaus größten Teil bilden Cenyri, deren Familien seit Generationen von Fischfang, Seefahrt, Handwerk, Handel und der Versorgung der Festung leben."),
        paragraph("Alben und Aldrimarer stellen jeweils nur wenige Prozent der Bevölkerung. Unter ihnen finden sich Seeleute, Händler, Söldner und Handwerker, die über die westlichen Seerouten nach Rhonwens Tränen gelangten."),
        paragraph("Die Einwohnerzahl und der Wohlstand leiden unter beständiger Abwanderung. Viele junge Menschen verlassen die Inseln und suchen auf dem Festland nach sichererer Arbeit oder größerem gesellschaftlichem Erfolg. Zurück bleiben Familien, deren Alltag stärker von Versorgung und Erhalt als von Wachstum geprägt ist.")
      ),

      newspaper: section(
        paragraph("Der Schwarzbote unterhält in Castellbryn eine eigene Ausgabe für Nachrichten, Gerüchte und Wahrheiten aus Rhonwens Tränen. Piraterie, Adelsstreit, Hafenhandel und die Schwierigkeiten der neuen Herrschaft liefern dem Castellbryner Blatt seine wichtigsten Themen."),
        paragraph("Celtigerns Echo besitzt ebenfalls eine örtliche Redaktionsstube. Sie sammelt Berichte aus den Inselgemeinden und gibt besonders den alltäglichen Sorgen von Fischern, Handwerkern und Reisenden Raum, ist personell jedoch noch nicht namentlich ausgearbeitet."),
        paragraph("Der Kronenspiegel führt Castellbryn als Druck- und Korrespondenzhaus. Der Standort beobachtet die größeren politischen, rechtlichen und wirtschaftlichen Entwicklungen von Rhonwens Tränen und leitet sie an die Hauptredaktion in Mathragon weiter.")
      ),

      region: section(
        paragraph("Der Bannkreis um Castellbryn gilt im Vergleich zu den übrigen Inseln als verhältnismäßig stabil. Weite Ebenen nehmen den größten Teil seines Landes ein und ermöglichen Ackerbau, Viehhaltung und sichere Straßenverbindungen in der Nähe der Stadt."),
        paragraph("Im Zentrum der großen Insel erhebt sich ein Gebirge, das von ausgedehnten Wäldern und mehreren Flussläufen umgeben ist. Es trennt die westlichen Gebiete Castellbryns von den weiter östlich gelegenen Bannkreisen und macht manche Landwege beschwerlich."),
        paragraph("Außerhalb des Castellbryner Kernlands ist die Lage unsicherer. Abgelegene Küsten, kleinere Inseln und dünn besiedelte Seewege bieten Piraten, Schmugglern, Banditen und Kreaturen Rückzugsräume, die von den begrenzten Kräften der Arwydd kaum gleichzeitig überwacht werden können.")
      ),

      culture: section(
        paragraph("Castellbryns Kultur ist durch und durch maritim. Gezeiten, Wind, Fanggründe und die Rückkehr der Boote bestimmen Tagesablauf und Jahreszeiten stärker als höfische Feste. Fischfang und Seefahrt gelten nicht nur als Gewerbe, sondern als gemeinsames Wissen, von dem das Überleben der Stadt abhängt."),
        paragraph("Unterhaltung tritt häufig hinter Arbeit und Versorgung zurück. Märkte, Hafenschenken und die seltenen sicheren Festtage bieten Abwechslung, doch Castellbryn besitzt weder den Glanz der Grafenstadt noch die Turnierkultur Rhosmeres."),
        paragraph("Die Abwanderung zum Festland prägt das Selbstbild der Stadt. Erfolgreiche Auswanderer werden bewundert, zugleich nagt jeder fortziehende Handwerker, Händler oder Seemann am Wohlstand und an der Zuversicht der Zurückbleibenden.")
      ),

      districts: section(
        paragraph("Castellbryn gliedert sich in fünf auf der Regionskarte ausgewiesene Bezirke. Ihre Grenzen folgen der alten Festung, den Mauern, dem Hafen und den jüngeren Erweiterungen der Stadt:"),
        list(
          "Castellbryner Herrenviertel",
          "Westhafen",
          "Altstadt",
          "Innenstadt",
          "Nordviertel"
        ),
        paragraph("Das Herrenviertel umfasst den befestigten Herrschaftskern. Westhafen und Altstadt bewahren die ältesten maritimen Strukturen, während Innenstadt und Nordviertel die späteren Wachstumsphasen Castellbryns aufnehmen.")
      ),

      builtEnvironment: section(
        paragraph("Die Hafenfestung prägt Castellbryns Silhouette bis heute. Dicke avallornische Mauern, Wehrtürme und der alte Herrschaftskern stehen über den niedriger gelegenen Hafenbecken. In der Altstadt drängen sich ältere Stein- und Fachwerkhäuser entlang enger, windgeschützter Gassen."),
        paragraph("Die jüngeren cenyrischen Viertel sind zweckmäßig und vom rauen Inselklima bestimmt. Speicher, Räucherhäuser, Werkstätten, Seilereien und Werften liegen nahe am Wasser; Wohnbauten besitzen robuste Dächer und geschützte Höfe. Repräsentative Neubauten bleiben selten, denn verfügbare Mittel fließen meist zuerst in Mauern, Kais und Versorgung.")
      ),

      military: section(
        paragraph("Castellbryns bewaffnete Kräfte folgen derselben feudalen Trennung wie die übrigen großen Städte: Hausgarde, Vasallenaufgebote, Stadtwache und Ortswachen besitzen jeweils eigene Aufgaben. Wegen der Insellage treten Schiffe und Hafenpatrouillen als weiterer wichtiger Bestandteil hinzu."),
        subheading("Die Schuppenwacht"),
        paragraph("Die Schuppenwacht ist die Stadtwache Castellbryns und untersteht unmittelbar der Stadt und ihrem Ritterfürsten. Zu Beginn des Krieges war sie 300 Mann stark. Als Haus Illysywen gegen die Draigs rebellierte, verweigerte die Wache ihrem damaligen Herrn den Gehorsam und stellte sich gemeinsam mit abtrünnigen Vasallen gegen dessen Haustruppen und treue Lehnsleute."),
        paragraph("Der innere Kampf erfüllte Castellbryns Straßen mit Blut. Die Schuppenwacht wurde geschlagen; Überlebende flohen oder gerieten in Gefangenschaft. Als nach dem Krieg über eine vollständige Auflösung und Neugründung beraten wurde, ehrte Graf Galahad Draig ihren Widerstand und bestimmte, dass die alte Wache fortbestehen solle."),
        paragraph("Heute zählt die Schuppenwacht noch etwa 200 Mann. Sie sichert Tore, Mauern, Hafen, Märkte und Straßen der Stadt. Trotz ihrer geringeren Stärke besitzt sie durch ihre Geschichte ein besonderes Selbstverständnis und bleibt von den übrigen Truppen der Herrschaft getrennt."),
        subheading("Hausgarde der Arwydd"),
        paragraph("Die Hausgarde schützt Ritterfürst Idris Arwydd, seine Familie und den Herrschaftssitz. Sie bildet den verlässlichsten Kern seiner persönlichen Streitkräfte, ist jedoch aufgrund der Verluste des Krieges und der noch jungen Herrschaft zahlenmäßig begrenzt."),
        subheading("Vasallenstreitkräfte"),
        paragraph("Die Ritterhäuser von Rhonwens Tränen stellen eigene Ritter, Waffenknechte und Schiffsbesatzungen. Ihre Aufgebote folgen dem Ritterfürsten im Kriegsfall, doch alte Loyalitäten und die Konkurrenz innerhalb des Adels erschweren eine vollständig geschlossene Führung."),
        subheading("Ortswachen und Seepatrouillen"),
        paragraph("Siedlungen außerhalb Castellbryns unterhalten eigene Ortswachen, die nicht zur Schuppenwacht gehören. Hafen- und Seepatrouillen sichern die wichtigsten Verbindungen, können die weitläufigen Küsten und äußeren Inseln aber nicht lückenlos schützen.")
      ),

      economy: section(
        subheading("Auslandshandel"),
        paragraph("Durch seine Lage an der Westspitze wäre Castellbryn für Schiffe aus dem Ausland eine natürliche erste Anlaufstelle in Celtigerns Wacht. Viele Handelsschiffe umgehen den Hafen dennoch und steuern unmittelbar die größeren und wohlhabenderen Städte des Festlands an. Zölle und Umschlag bleiben deshalb hinter den Möglichkeiten der Lage zurück."),
        subheading("See- und Inselhandel"),
        paragraph("Beständiger als der Fernhandel ist der Verkehr zwischen den Inseln und dem Festland. Castellbryn sammelt Waren aus den kleineren Häfen, verteilt Vorräte und stellt Schiffe, Mannschaften und Lagerraum für die Versorgung von Rhonwens Tränen bereit."),
        subheading("Fischfang"),
        paragraph("Castellbryn und sein Umland erzeugen mehr Fisch als jeder andere Teil der Herrschaft. Da der Fang rasch verdirbt, wird ein großer Anteil geräuchert, gesalzen oder eingelegt. Selbst konservierter Fisch lässt sich wegen Transportkosten und begrenzter Haltbarkeit nur eingeschränkt gewinnbringend ausführen; der Fischfang dient daher vor allem der Eigenversorgung der Inseln."),
        subheading("Weitere Gewerbe"),
        paragraph("Salzgewinnung, Landwirtschaft, kleinere Minen, Forstwirtschaft und Holzeinschlag ergänzen die drei Hauptbereiche. Flachsanbau versorgt Segelmacher und Seiler, während Werften Fischerboote, Handelsschiffe und Reparaturen für die Inselrouten bereitstellen. Diese Gewerbe sichern Castellbryns Alltag, erzeugen bislang aber nur begrenzten überregionalen Wohlstand.")
      ),

      trivia: section(
        list(
          "Castellbryn begann als avallornische Hafenfestung zur Versorgung von Rhonwens Tränen.",
          "Die Schuppenwacht verlor im Krieg ein Drittel ihrer ursprünglichen Stärke und besteht dennoch unter dem neuen Ritterfürstenhaus fort.",
          "Arwel der Schwarze Aal gilt als erster Ritterfürst, Stadtgründer im weiteren Sinne und Begründer des erloschenen Hauses Illysywen."
        )
      )
    }
  });

  window.ORT_DATA = Object.freeze({
    ...base,
    structure: Object.freeze({
      land: "Cenyr",
      provinz: "Celtigerns Wacht",
      region: "Castellbryn – Bannkreis",
      name: "Castellbryn",
      "vorherrschender adel": "Haus Arwydd",
      region2: "Großstadt",
      gewerbe: "Fischerei, Schiffbau und Seehandel",
      regierungstyp: "Ritterfürstliche Stadtverwaltung",
      herrschaft: "Rhonwens Tränen",
      lehnsherr: "Haus Arwydd",
      "bekannte familien": "Haus Arwydd, seine Ritterhäuser und das erloschene Haus Illysywen",
      stände: "Adel, Klerus, Fischer, Seeleute, Händler, Handwerker und Arbeiter",
      einwohnerzahl: "etwa 8.000 bis 11.000",
      ritter: "Haus Arwydd und Vasallenhäuser",
      waffenknechte: "Hausgarde, Vasallenaufgebote und Schuppenwacht",
      ortswache: "etwa 200 Mann der Schuppenwacht",
      flotte: "Hafen- und Seepatrouillen der Herrschaft",
      "sonstiges aufgebot": "Ortswachen der Inselgemeinden",
      bedrohungen: "Piraten, Banditen, Schmuggler und Kreaturen",
      ressourcen: "Fisch, Salz, Holz, Flachs, Tauwerk und Schiffsbedarf"
    }),
    houses: Object.freeze([
      Object.freeze({
        title: "Adelshaus",
        items: Object.freeze([
          house("haus-arwydd", "Arwydd", "Adelshaus", "Castellbryn", "Draig", "haus-arwydd.png")
        ])
      }),
      Object.freeze({
        title: "Ritterhäuser",
        items: Object.freeze([
          house("haus-gwared", "Gwared", "Ritterhaus", "Castellbryn", "Arwydd", "Ritterliche/Gwared.png"),
          house("haus-rhenna", "Rhenna", "Ritterhaus", "Rhonwens Tränen", "Arwydd", "Ritterliche/Rhenna.png"),
          house("haus-madryn", "Madryn", "Ritterhaus", "Rhonwens Tränen", "Arwydd", "Ritterliche/Madryn.png"),
          house("haus-talinvyr", "Talinvyr", "Ritterhaus", "Rhonwens Tränen", "Arwydd", "Ritterliche/Talinvyr.png"),
          house("haus-merek", "Merek", "Ritterhaus", "Rhonwens Tränen", "Arwydd", "Ritterliche/Merek.png")
        ])
      }),
      Object.freeze({
        title: "Ausgestorbene Häuser",
        items: Object.freeze([
          house("haus-illysywen", "Illysywen", "Ausgestorbenes Haus", "Castellbryn", "...", "haus-illysywen.png"),
          house("haus-skellor", "Skellor", "Ausgestorbenes Haus", "Rhonwens Tränen", "...", "Ausgestorben/Skellor.png"),
          house("haus-morveth", "Morveth", "Ausgestorbenes Haus", "Rhonwens Tränen", "...", "Ausgestorben/Morveth.png")
        ])
      })
    ]),
    merchants: Object.freeze([]),
    regionMap: Object.freeze({
      mapId: regionMapId,
      title: "Castellbryn – Bannkreis",
      embedHref: regionMapHref,
      fullHref: regionMapHref,
      pois: Object.freeze([])
    })
  });

  function mapHref(mapId) {
    return `/Karten/karte.html?map=${encodeURIComponent(mapId)}`;
  }
})();
