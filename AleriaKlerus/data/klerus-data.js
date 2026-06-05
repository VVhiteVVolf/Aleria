// ========= BILDER-PFAD (dein Ordner, RELATIV, ohne führenden Slash) =========
    const IMG_DIR = "../BilderR%C3%BCstungen";

    // Helper: baut Pfade wie "BilderRüstungen/maldras_paladin.png"
    function imgPath(id, mode){
      return `${IMG_DIR}/${id}_${mode}.png`;
    }

    // ========= ICONS (BilderRüstungen/<id>_icon.png) =========
    function iconPath(id){
      return `${IMG_DIR}/${id}_icon.png`;
    }

    // ========= RANG-ICONS (BilderRüstungen/<key>_rangicon.png) =========
    function rankIconPath(key){
      return `${IMG_DIR}/${key}_rangicon.png`;
    }
// ========= DATA (9 Göttliche) =========
    // priest + paladin existieren bei dir bereits, monk ist Platzhalter-Dateiname (<id>_monk.png).
    const godsData = [
      {
        id: "ordan",
        name: "Ordan",
        title: "Der Vater",
        symbol: "Drachenkopf",
        colors: ["#FFD700", "#FFFFFF", "#00008B"],
        focus: "Zeit, Autorität, Gnade",
        virtues: ["Ordnung", "Gnade", "Verantwortung"],
        audience: ["Herrschaft & Verwaltung", "Rechtsprechung", "Eidträger"],
        patron: ["Richter", "Schreiber", "Heralden", "Bannerträger", "Amtmänner"],
        guilds: ["Kanzleien", "Siegelmacher", "Schreiberzünfte", "Heroldsämter"],
                                                                                                        priest: {
          title: "Priesterschaft des Ordan",
          desc: `
            <b>Ordan</b>, der <b>Vater der Götter</b>, ist Hüter von <i>Zeit</i>, <i>Vergangenheit</i> und dem <b>Absoluten Gesetz</b>. Ordnung, Gnade und Verantwortung sind kein Schmuck – sie sind Anspruch. Seine <b>Priesterschaft</b> wirkt daher in allen Winkeln Alerias als sichtbare Hand höchster Autorität.<br><br>

            Wo Könige herrschen, stehen die <span class="tooltip gold" data-tooltip="Ein sehr ranghoher geistlicher Priester unter dem Erz-Patriarchen. Jeder Patriarch ist für ein Königreich die oberste kirchliche Autorität. Ein Erzpatriarch beaufsichtigt mehrere Patriarchen.">Patriarchen</span> Ordans hinter ihnen: Sie <b>salben</b> und <b>krönen</b> Herrscher und binden sie öffentlich an göttliche Verantwortung. Zwar unterscheiden sich die Riten von Land zu Land, doch selbst in Reichen, die anderen Göttern besonders frönen, gilt Ordan als oberste Instanz. Entsprechend übernimmt seine Priesterschaft häufig die Rolle des kirchlichen <b>Oberhauptes</b> und steht an der Spitze der geistlichen Hierarchie.<br><br>

            Während Ordans Mönchsorden eher im ländlichen Raum wirken und dort ordnungsnahe Dienste und Zunftarbeit verrichten, findet man seine Priester vor allem in den Städten. Hier leisten sie organisatorische, <span class="tooltip gold" data-tooltip="Heilige Amtshandlungen wie Salben, Krönen, Taufen, Segnen und Weihen. Auch andere Priester tun dies – doch Ordans Priester meist mit größerer Autorität und überregionaler Anerkennung.">sakramentale</span> und <b>orakelartige Dienste</b> – von der Krönung und Salbung von Herrschern bis zur Ernennung neuer Geistlicher in hohe Positionen.<br><br>

            Sie sprechen nicht im Namen eines Tempels – sie sprechen im Namen der <b>Zeit</b>.
          `,
          img: imgPath("ordan","priest"),
          tags: ["Siegel & Liturgie","Hoher Kragen","Goldstickerei"]
        },
        paladin:{ title: "Rüstung des Äons", desc: "PLATZHALTER-Text.", img: imgPath("ordan","paladin"), tags: ["Richterorden","Schuppenoptik","Bannerrecht"] },
        monk:  { title: "Orden der Chronik", desc: "PLATZHALTER-Text.", img: imgPath("ordan","monk"), tags: ["Chronisten","Siegelkordel","Askese mit Amt"] }
      },
      {
        id: "mariel",
        name: "Mariel",
        title: "Die Mutter",
        symbol: "Gebetsgeste / Taube",
        colors: ["#FFC0CB", "#FFFDD0", "#87CEEB"],
        focus: "Liebe, Barmherzigkeit, Trost",
        virtues: ["Barmherzigkeit", "Trost", "Fürsorge"],
        audience: ["Schutzlose", "Kranke & Verwundete", "Familien"],
        patron: ["Heiler", "Pflegende", "Hebammen", "Hospizgeistliche", "Waisenmeister"],
        guilds: ["Heilerhäuser", "Bader & Kräuterzünfte", "Hospize", "Wohlfahrtsbruderschaften"],
        priest: { title: "Gewand des Trostes", desc: "PLATZHALTER-Text.", img: imgPath("mariel","priest"), tags: ["Hospizklerus","Offener Schnitt","Taubenstich"] },
        paladin:{ title: "Hüter der Barmherzigkeit", desc: "PLATZHALTER-Text.", img: imgPath("mariel","paladin"), tags: ["Eskorte","Schutzsilhouette","Sanfte Heraldik"] },
        monk:  { title: "Orden der Stillen Hand", desc: "PLATZHALTER-Text.", img: imgPath("mariel","monk"), tags: ["Pflegeorden","Keuschheit","Schlichtheit"] }
      },
      {
        id: "baldran",
        name: "Baldran",
        title: "Der Streiter",
        symbol: "Zwei gekreuzte Schwerter",
        colors: ["#708090", "#8B0000", "#000000"],
        focus: "Krieg, Pflicht, Ehre",
        virtues: ["Tapferkeit", "Pflicht", "Ehre"],
        audience: ["Soldaten", "Wächter", "Duellanten"],
        patron: ["Söldnerführer", "Wachtmeister", "Feldherren", "Waffenmeister", "Turniermeister"],
        guilds: ["Waffenschmieden", "Fechtgilden", "Schildmacher", "Turniergilden"],
        priest: { title: "Feldkaplan-Kluft", desc: "PLATZHALTER-Text.", img: imgPath("baldran","priest"), tags: ["Feldliturgie","Marschrobe","Eidbänder"] },
        paladin:{ title: "Schlachtplatte des Zorns", desc: "PLATZHALTER-Text.", img: imgPath("baldran","paladin"), tags: ["Frontlinie","Kampfzeichen","Ehrennarben"] },
        monk:  { title: "Disziplinorden", desc: "PLATZHALTER-Text.", img: imgPath("baldran","monk"), tags: ["Drill","Wicklungen","Kampfgebet"] }
      },
      {
        id: "maldras",
        name: "Maldras",
        title: "Der Templer",
        symbol: "Weiße Flamme",
        colors: ["#FFFFFF", "#8A2BE2", "#808080"],
        focus: "Glaube, Gerechtigkeit, Reinheit",
        virtues: ["Gerechtigkeit", "Reinheit", "Glaube"],
        audience: ["Rechtschaffene", "Suchende", "Sühner"],
        patron: ["Templer", "Inquisitoren", "Richterpriester", "Ordenswächter", "Bußprediger"],
        guilds: ["Tempelorden", "Gerichtshöfe", "Bußbruderschaften", "Kerzenmacher"],
        priest: { title: "Liturgie-Gewand der Reinheit", desc: "PLATZHALTER-Text.", img: imgPath("maldras","priest"), tags: ["Reinheitsritus","Violette Schärpe","Tempelordnung"] },
        paladin:{ title: "Templerpanzer der Weißen Flamme", desc: "PLATZHALTER-Text.", img: imgPath("maldras","paladin"), tags: ["Templer","Urteilsschnitt","Weiße Flamme"] },
        monk:  { title: "Orden der Asche", desc: "PLATZHALTER-Text.", img: imgPath("maldras","monk"), tags: ["Askese","Bußkutte","Siegelzeichen"] }
      },
      {
        id: "sylvana",
        name: "Sylvana",
        title: "Die Hirtin",
        symbol: "Baum",
        colors: ["#228B22", "#8B4513", "#90EE90"],
        focus: "Natur, Verbundenheit, Leben",
        virtues: ["Wachstum", "Maß", "Verbundenheit"],
        audience: ["Bauern", "Jäger", "Hüter der Wildnis"],
        patron: ["Hainpriester", "Heckenweise", "Förster", "Imker", "Fischer an Binnengewässern"],
        guilds: ["Gärtnerzünfte", "Gerber & Färber (Naturstoffe)", "Holzhandwerker", "Brauer (Kräuter)"],
        priest: { title: "Gewand des Hains", desc: "PLATZHALTER-Text.", img: imgPath("sylvana","priest"), tags: ["Hainpriester","Naturstoffe","Saat & Segen"] },
        paladin:{ title: "Wächter des Wurzelbundes", desc: "PLATZHALTER-Text.", img: imgPath("sylvana","paladin"), tags: ["Hainwacht","Naturplatten","Lebenszeichen"] },
        monk:  { title: "Klausur der Stillen Rinde", desc: "PLATZHALTER-Text.", img: imgPath("sylvana","monk"), tags: ["Flechtwerk","Schlichte Kapuze","Rindenamulett"] }
      },
      {
        id: "orin",
        name: "Orin",
        title: "Der Mentor",
        symbol: "Offenes Buch",
        colors: ["#4B0082", "#C0C0C0", "#40E0D0"],
        focus: "Weisheit, Magie",
        virtues: ["Wissen", "Besonnenheit", "Einsicht"],
        audience: ["Gelehrte", "Magier", "Lehrlinge"],
        patron: ["Archivare", "Dozenten", "Runenschreiber", "Kartographen", "Bibliothekare"],
        guilds: ["Schreiberzünfte", "Buchbinder", "Papiermacher", "Alchemistenkreise"],
        priest: { title: "Archivrobe der Lehre", desc: "PLATZHALTER-Text.", img: imgPath("orin","priest"), tags: ["Archiv","Siegelband","Runenmarken"] },
        paladin:{ title: "Wissenswächter-Panzer", desc: "PLATZHALTER-Text.", img: imgPath("orin","paladin"), tags: ["Wissenswacht","Beschläge","Indigo"] },
        monk:  { title: "Orden der Stillen Seite", desc: "PLATZHALTER-Text.", img: imgPath("orin","monk"), tags: ["Meditation","Schweigegelübde","Tintenritus"] }
      },
      {
        id: "tharim",
        name: "Tharim",
        title: "Der Knecht",
        symbol: "Hammer",
        colors: ["#8B4513", "#C2A55F", "#808080"],
        focus: "Arbeit, Erdverbundenheit",
        virtues: ["Fleiß", "Standhaftigkeit", "Demut"],
        audience: ["Handwerker", "Bauvolk", "Tagelöhner"],
        patron: ["Schmiede", "Baumeister", "Steinmetze", "Zimmerleute", "Fuhrleute"],
        guilds: ["Schmiedezünfte", "Maurer & Steinmetzlogen", "Zimmererzünfte", "Fuhrmannsgilden"],
        priest: { title: "Werkrobe der Hände", desc: "PLATZHALTER-Text.", img: imgPath("tharim","priest"), tags: ["Robust","Werkzeugband","Erdtöne"] },
        paladin:{ title: "Panzer der Traglast", desc: "PLATZHALTER-Text.", img: imgPath("tharim","paladin"), tags: ["Schwer","Nieten & Riemen","Hammerzeichen"] },
        monk:  { title: "Orden der Schweißkerze", desc: "PLATZHALTER-Text.", img: imgPath("tharim","monk"), tags: ["Arbeitsorden","Verstärkte Nähte","Schlichte Kapuze"] }
      },
      {
        id: "lyris",
        name: "Lyris",
        title: "Die Maid",
        symbol: "Harfe / Rose",
        colors: ["#C8A2C8", "#FFFFFF", "#FFD700"],
        focus: "Tugend, Kunst, Inspiration",
        virtues: ["Anmut", "Inspiration", "Wahrhaftigkeit"],
        audience: ["Künstler", "Hofgesellschaft", "Liebende & Bittende"],
        patron: ["Barden", "Sänger", "Dichter", "Bildhauer", "Stoffkünstler"],
        guilds: ["Bardengilden", "Theatertruppen", "Goldschmiede (Zierwerk)", "Weber & Stickerinnen"],
        priest: { title: "Ornat der Inspiration", desc: "PLATZHALTER-Text.", img: imgPath("lyris","priest"), tags: ["Chor","Ornamentik","Goldakzent"] },
        paladin:{ title: "Rüstung der Anmut", desc: "PLATZHALTER-Text.", img: imgPath("lyris","paladin"), tags: ["Eleganz","Zierkanten","Harfe/Rose"] },
        monk:  { title: "Klausur der Stimme", desc: "PLATZHALTER-Text.", img: imgPath("lyris","monk"), tags: ["Chororden","Schreiber","Dezente Zeichen"] }
      },
      {
        id: "kharon",
        name: "Kharon",
        title: "Der Hüter",
        symbol: "Sichel",
        colors: ["#000000", "#808080", "#0F4C5C"],
        focus: "Tod, Übergang, Schicksal",
        virtues: ["Würde", "Gelassenheit", "Treue zum Übergang"],
        audience: ["Sterbende & Hinterbliebene", "Geleiter", "Schwurträger am Ende"],
        patron: ["Totengräber", "Geleitritter", "Ritualmeister", "Kerzenwächter", "Schiffleute der Passage"],
        guilds: ["Bestatterzünfte", "Kerzenmacher", "Steinmetze (Grabmale)", "Geleitbruderschaften"],
        priest: { title: "Gewand der Schwelle", desc: "PLATZHALTER-Text.", img: imgPath("kharon","priest"), tags: ["Schwellenritus","Amt & Würde","Sichelzeichen"] },
        paladin:{ title: "Geleitpanzer des Letzten Weges", desc: "PLATZHALTER-Text.", img: imgPath("kharon","paladin"), tags: ["Geleitritter","Dunkle Platten","Schicksal"] },
        monk:  { title: "Orden der Stillen Lampe", desc: "PLATZHALTER-Text.", img: imgPath("kharon","monk"), tags: ["Ritualbänder","Kapuze","Übergang"] }
      }
      ,
      {
        id: "nimue",
        name: "Nimue",
        title: "Die Dame der See",
        symbol: "PLATZHALTER",
        colors: ["#6FB7C8", "#DFF6FF", "#0D2A33"],
        focus: "PLATZHALTER",
        virtues: ["PLATZHALTER", "PLATZHALTER", "PLATZHALTER"],
        audience: ["PLATZHALTER"],
        patron: ["PLATZHALTER"],
        guilds: ["PLATZHALTER"],
        priest: { title: "PLATZHALTER-Titel", desc: "PLATZHALTER-Text.", img: imgPath("nimue","priest"), tags: ["PLATZHALTER"] },
        paladin:{ title: "PLATZHALTER-Titel", desc: "PLATZHALTER-Text.", img: imgPath("nimue","paladin"), tags: ["PLATZHALTER"] },
        monk:  { title: "PLATZHALTER-Titel", desc: "PLATZHALTER-Text.", img: imgPath("nimue","monk"), tags: ["PLATZHALTER"] }
      },
      {
        id: "rhea",
        name: "Rhea",
        title: "Die Dame der Berge",
        symbol: "PLATZHALTER",
        colors: ["#7A9B6D", "#E6E2C3", "#1B2A18"],
        focus: "PLATZHALTER",
        virtues: ["PLATZHALTER", "PLATZHALTER", "PLATZHALTER"],
        audience: ["PLATZHALTER"],
        patron: ["PLATZHALTER"],
        guilds: ["PLATZHALTER"],
        priest: { title: "PLATZHALTER-Titel", desc: "PLATZHALTER-Text.", img: imgPath("rhea","priest"), tags: ["PLATZHALTER"] },
        paladin:{ title: "PLATZHALTER-Titel", desc: "PLATZHALTER-Text.", img: imgPath("rhea","paladin"), tags: ["PLATZHALTER"] },
        monk:  { title: "PLATZHALTER-Titel", desc: "PLATZHALTER-Text.", img: imgPath("rhea","monk"), tags: ["PLATZHALTER"] }
      },
      {
        id: "zephyr",
        name: "Zephyr",
        title: "Der Herr der Winde",
        symbol: "PLATZHALTER",
        colors: ["#BFD7EA", "#F7FBFF", "#2B3A42"],
        focus: "PLATZHALTER",
        virtues: ["PLATZHALTER", "PLATZHALTER", "PLATZHALTER"],
        audience: ["PLATZHALTER"],
        patron: ["PLATZHALTER"],
        guilds: ["PLATZHALTER"],
        priest: { title: "PLATZHALTER-Titel", desc: "PLATZHALTER-Text.", img: imgPath("zephyr","priest"), tags: ["PLATZHALTER"] },
        paladin:{ title: "PLATZHALTER-Titel", desc: "PLATZHALTER-Text.", img: imgPath("zephyr","paladin"), tags: ["PLATZHALTER"] },
        monk:  { title: "PLATZHALTER-Titel", desc: "PLATZHALTER-Text.", img: imgPath("zephyr","monk"), tags: ["PLATZHALTER"] }
      },
      {
        id: "aelthar",
        name: "Aelthar",
        title: "Der Herr des Donners",
        symbol: "PLATZHALTER",
        colors: ["#C8B28A", "#F2E9D8", "#2C2218"],
        focus: "PLATZHALTER",
        virtues: ["PLATZHALTER", "PLATZHALTER", "PLATZHALTER"],
        audience: ["PLATZHALTER"],
        patron: ["PLATZHALTER"],
        guilds: ["PLATZHALTER"],
        priest: { title: "PLATZHALTER-Titel", desc: "PLATZHALTER-Text.", img: imgPath("aelthar","priest"), tags: ["PLATZHALTER"] },
        paladin:{ title: "PLATZHALTER-Titel", desc: "PLATZHALTER-Text.", img: imgPath("aelthar","paladin"), tags: ["PLATZHALTER"] },
        monk:  { title: "PLATZHALTER-Titel", desc: "PLATZHALTER-Text.", img: imgPath("aelthar","monk"), tags: ["PLATZHALTER"] }
      },
      {
        id: "thyrael",
        name: "Thyrael",
        title: "Der Herr des Feuers",
        symbol: "PLATZHALTER",
        colors: ["#E6D28F", "#FFFFFF", "#1A1A24"],
        focus: "PLATZHALTER",
        virtues: ["PLATZHALTER", "PLATZHALTER", "PLATZHALTER"],
        audience: ["PLATZHALTER"],
        patron: ["PLATZHALTER"],
        guilds: ["PLATZHALTER"],
        priest: { title: "PLATZHALTER-Titel", desc: "PLATZHALTER-Text.", img: imgPath("thyrael","priest"), tags: ["PLATZHALTER"] },
        paladin:{ title: "PLATZHALTER-Titel", desc: "PLATZHALTER-Text.", img: imgPath("thyrael","paladin"), tags: ["PLATZHALTER"] },
        monk:  { title: "PLATZHALTER-Titel", desc: "PLATZHALTER-Text.", img: imgPath("thyrael","monk"), tags: ["PLATZHALTER"] }
      }
,
{
  id: "tethyra",
  name: "Tethyra",
  title: "Die Seemaid",
  symbol: "Dreizack",
  colors: ["#2F6F8F", "#9FD6E3", "#0B2A33"],
  focus: "PLATZHALTER",
  virtues: ["PLATZHALTER", "PLATZHALTER", "PLATZHALTER"],
  audience: ["PLATZHALTER"],
  patron: ["PLATZHALTER"],
  guilds: ["PLATZHALTER"],
  priest: { title: "PLATZHALTER-Titel", desc: "PLATZHALTER-Text.", img: imgPath("tethyra","priest"), tags: ["PLATZHALTER"] },
  paladin:{ title: "PLATZHALTER-Titel", desc: "PLATZHALTER-Text.", img: imgPath("tethyra","paladin"), tags: ["PLATZHALTER"] },
  monk:  { title: "PLATZHALTER-Titel", desc: "PLATZHALTER-Text.", img: imgPath("tethyra","monk"), tags: ["PLATZHALTER"] }
},
{
  id: "jovena",
  name: "Jovena",
  title: "Die Glücksbringerin",
  symbol: "Kleeblatt",
  colors: ["#3E8E41", "#DFF2D8", "#1F3D1F"],
  focus: "PLATZHALTER",
  virtues: ["PLATZHALTER", "PLATZHALTER", "PLATZHALTER"],
  audience: ["PLATZHALTER"],
  patron: ["PLATZHALTER"],
  guilds: ["PLATZHALTER"],
  priest: { title: "PLATZHALTER-Titel", desc: "PLATZHALTER-Text.", img: imgPath("jovena","priest"), tags: ["PLATZHALTER"] },
  paladin:{ title: "PLATZHALTER-Titel", desc: "PLATZHALTER-Text.", img: imgPath("jovena","paladin"), tags: ["PLATZHALTER"] },
  monk:  { title: "PLATZHALTER-Titel", desc: "PLATZHALTER-Text.", img: imgPath("jovena","monk"), tags: ["PLATZHALTER"] }
},
{
  id: "auron",
  name: "Auron",
  title: "Der Erbauer",
  symbol: "Zirkel",
  colors: ["#8C7A5A", "#E3D8C5", "#2E2A23"],
  focus: "PLATZHALTER",
  virtues: ["PLATZHALTER", "PLATZHALTER", "PLATZHALTER"],
  audience: ["PLATZHALTER"],
  patron: ["PLATZHALTER"],
  guilds: ["PLATZHALTER"],
  priest: { title: "PLATZHALTER-Titel", desc: "PLATZHALTER-Text.", img: imgPath("auron","priest"), tags: ["PLATZHALTER"] },
  paladin:{ title: "PLATZHALTER-Titel", desc: "PLATZHALTER-Text.", img: imgPath("auron","paladin"), tags: ["PLATZHALTER"] },
  monk:  { title: "PLATZHALTER-Titel", desc: "PLATZHALTER-Text.", img: imgPath("auron","monk"), tags: ["PLATZHALTER"] }
},
{
  id: "selarion",
  name: "Selarion",
  title: "Der Herausforderer",
  symbol: "Fackel",
  colors: ["#C65A1E", "#FFD6A0", "#3A1A0A"],
  focus: "PLATZHALTER",
  virtues: ["PLATZHALTER", "PLATZHALTER", "PLATZHALTER"],
  audience: ["PLATZHALTER"],
  patron: ["PLATZHALTER"],
  guilds: ["PLATZHALTER"],
  priest: { title: "PLATZHALTER-Titel", desc: "PLATZHALTER-Text.", img: imgPath("selarion","priest"), tags: ["PLATZHALTER"] },
  paladin:{ title: "PLATZHALTER-Titel", desc: "PLATZHALTER-Text.", img: imgPath("selarion","paladin"), tags: ["PLATZHALTER"] },
  monk:  { title: "PLATZHALTER-Titel", desc: "PLATZHALTER-Text.", img: imgPath("selarion","monk"), tags: ["PLATZHALTER"] }
},
{
  id: "orith",
  name: "Orith",
  title: "Der Mystiker",
  symbol: "Druidischer Knoten",
  colors: ["#4A5D4A", "#C9D3C9", "#1F2A1F"],
  focus: "PLATZHALTER",
  virtues: ["PLATZHALTER", "PLATZHALTER", "PLATZHALTER"],
  audience: ["PLATZHALTER"],
  patron: ["PLATZHALTER"],
  guilds: ["PLATZHALTER"],
  priest: { title: "PLATZHALTER-Titel", desc: "PLATZHALTER-Text.", img: imgPath("orith","priest"), tags: ["PLATZHALTER"] },
  paladin:{ title: "PLATZHALTER-Titel", desc: "PLATZHALTER-Text.", img: imgPath("orith","paladin"), tags: ["PLATZHALTER"] },
  monk:  { title: "PLATZHALTER-Titel", desc: "PLATZHALTER-Text.", img: imgPath("orith","monk"), tags: ["PLATZHALTER"] }
}


    ];

    // ========= MODE: GELÄUTERTE (übergreifend, gilt für alle Göttlichen) =========
    // Eine einzelne Klasse/Schicht, die nicht pro Gottheit variiert.
    const gelaeuterteData = {
      title: "Geläuterte",
      desc: "Ehemalige Kriminelle, die unter der Schirmherrschaft der Kirche Buße leisten. Wer den Geläuterten Eid annimmt, dient still und gehorsam dort, wo Geistliche ihn einsetzen – als Träger, Wache, Bote, Schreibergehilfe oder Handlanger. Mundbinden verbieten das Sprechen; manche tragen schlichte Masken. Erst wenn die Buße erfüllt ist, wird der Eid gelöst – dann sind sie frei.",
      img: `${IMG_DIR}/gelaeuterte.png`,
      tags: ["Mundbinde", "Schweigegelübde", "Bußdienst", "Graue Robe", "Kirchliche Aufsicht"],
      symbol: "Mundbinde / Maske",
      virtues: ["Demut", "Gehorsam", "Sühne"],
      audience: ["Verurteilte (nicht lebenslänglich)", "Reuige Straftäter", "Schuldner & Gesetzesbrecher"],
      patron: ["Beichtväter", "Kerkermeister der Kirche", "Hospizmeister", "Archivare", "Wachoffiziere"],
      guilds: ["Kirchliche Werkhöfe", "Hospize", "Archivstuben", "Bau- & Instandhaltungstrupps", "Botengänge"],
    };

    // ========= HIERARCHIEN (global; kann pro Gottheit via god.hierarchy[mode] überschrieben werden) =========
    // Hinweis: keys sind Dateiname-tauglich und werden für <key>_rangicon.png genutzt.
    const hierarchyData = {
      priest: [
        { key: "hierarch", name: "Der Hierarch", desc: "Oberhaupt der Alerischen Kirche; letzte Autorität in Doktrin, Weihe und Bann." },
        { key: "erzpatriarch", name: "Erzpatriarch / Erzmatriarchin", desc: "Lenkt eine Großregion der Kirche; setzt Lehrsätze durch und ordiniert hohe Ämter." },
        { key: "patriarch", name: "Patriarch / Matriarchin", desc: "Führt eine Kirchenprovinz; überwacht Tempel, Pilgerwege und Gerichtsbarkeit des Klerus." },
        { key: "praelat", name: "Prälat / Primas", desc: "Vorsteher bedeutender Heiligtümer; verwaltet Reliquien, Stiftungen und höhere Liturgie." },
        { key: "vikar", name: "Vikar", desc: "Beauftragter des Prälaten; leitet eine Stadtgemeinde oder ein Bezirkskapitel." },
        { key: "diakon", name: "Diakon", desc: "Dienst- und Verwaltungsamt; führt Almosen, Register, Siegel und die praktische Liturgie." },
        { key: "juenger", name: "Jünger", desc: "Voll ausgebildeter Diener im Tempel; übernimmt Predigt, Aufsicht und Helferführung." },
        { key: "kurator", name: "Kurator", desc: "Aufseher über Güter und heilige Orte; koordiniert Werkstätten, Lager und Schutz." },
        { key: "adept", name: "Adept", desc: "Eingeweihter in Lehre und Ritus; unterstützt Rituale, Archiv und Novizenunterricht." },
        { key: "novize", name: "Novize", desc: "In Ausbildung; lernt Gebete, Regeln, Dienstpflichten und den Umgang mit Weihegut." },
        { key: "oblat", name: "Oblat", desc: "An den Tempel gebundener Laienhelfer; Gelübde auf Zeit, einfache Dienste." },
        { key: "laie", name: "Laie", desc: "Gläubiger ohne Weihe; Teil der Gemeinde, untersteht weltlichem Recht." }
      ],
      monk: [
        { key: "hierarch", name: "Der Hierarch", desc: "Oberhaupt der Kirche; bestätigt Ordensregeln und setzt letzte Grenzen." },
        { key: "ordensoberhaupt", name: "Ordensoberhaupt", alts: ["Kardinal","Erzbischof","Elekt"], desc: "Spitze eines Ordens; wahrt die Regel, ernennt Priorate und spricht Ordensrecht." },
        { key: "ordensfuehrer", name: "Ordensführer", alts: ["Bischof"], desc: "Leitet einen großen Konventverband; koordiniert Disziplin, Reisen, Lehrhäuser." },
        { key: "gemeindeleiter", name: "Gemeindeleiter", alts: ["Abt","Prior"], desc: "Leitet einen Konvent; verwaltet Gelübde, Vorräte, Aufgaben und die lokale Auslegung der Regel." },
        { key: "fuehrer", name: "Führer", alts: ["Pater","Pfarrer"], desc: "Führt Brüder/SCHWESTERN im Dienst; verantwortet Lehre, Seelsorge und Ausbildung im Alltag." },
        { key: "leiter", name: "Leiter", alts: ["Werkmeister","Zellenleiter"], desc: "Führt kleine Gruppen und Werkstätten; verteilt Dienste, prüft Fortschritt, hält Ordnung." },
        { key: "vertreter", name: "Vertreter", alts: ["Hoher Mönch","Hohe Nonne"], desc: "Stellvertretung des Konvents; übernimmt Reisen, Audits und besondere Aufträge." },
        { key: "regulaerer_moench", name: "Regulärer", desc: "Mönch / Nonne; voll gelobt, trägt die Regel und dient im Tageswerk." },
        { key: "niederer", name: "Niederer", desc: "Junger Geweihter auf Probe; einfache Pflichten, wenig Lehrverantwortung." },
        { key: "anfaenger", name: "Anfänger", desc: "Erste Stufe im Konvent; lernt Schweigezeiten, Ordnung, Liturgie und Handwerk." },
        { key: "neuling", name: "Neuling", desc: "Neu aufgenommen; Beobachtungszeit, Grundregeln, Dienste ohne Vertrauen." }
      ],
      paladin: [
        { key: "hierarch", name: "Der Hierarch", desc: "Oberhaupt der Kirche; legitimiert Orden, Kreuzzüge und Bannmaßnahmen." },
        { key: "lordkommandant", name: "Lordkommandant", alts: ["Großmeister"], desc: "Höchster Befehl im militanten Orden; setzt Eid, Strategie und Einsatzdoktrin." },
        { key: "ordensfuehrer_krieger", name: "Ordensführer", alts: ["Oberkommandant"], desc: "Führt eine Ordensfeste oder Division; Disziplin, Musterung und Einsatzpläne." },
        { key: "oberbefehlshaber", name: "Oberbefehlshaber", alts: ["Hauptmann","Marschall"], desc: "Feldkommando; Ausbildung, Aufklärung, Logistik und Durchführung von Befehlen." },
        { key: "offizier", name: "Offizier", alts: ["Leutnant"], desc: "Führt Trupps; überwacht Eid, Ziele und operative Disziplin." },
        { key: "unteroffizier", name: "Unteroffizier", alts: ["Hochkleriker","Hochpaladin"], desc: "Drill und Wachdienst; hält die Kompanie im Alltag zusammen." },
        { key: "regulaerer_ritter", name: "Regulärer", alts: ["Paladin","Kleriker","Ritter"], desc: "Voll eidgebunden; Einsatzdienst in Schildwall, Eskorte und Bannwachen." },
        { key: "knecht", name: "Knecht", desc: "Waffenknecht; bewaffneter Diener im Dienst, noch ohne vollen Eid." },
        { key: "knappe", name: "Knappe", desc: "In Ausbildung unter einem Ritter; lernt Kampf, Gehorsam, Pflichten und Protokoll." },
        { key: "page", name: "Page", desc: "Junger Dienst am Hof / in der Festung; Botengänge, Pflege, Grundregeln." },
        { key: "bursche", name: "Bursche", desc: "Einfachster Helfer; Stall, Küche, Tragearbeit – erster Schritt in die Ordnung." }
      ],
      gelauterte: [
        { key: "bussgaenger", name: "Bußgänger", desc: "Verurteilt und aufgenommen; schweigend im Dienst. Mundbinde als Schwur, Bußzeit läuft." },
        { key: "gelaeuterter", name: "Geläuterter", desc: "Buße erfüllt; Eid gelöst. Erhält Freilassungsbrief und darf wieder sprechen." }
      ]
    };

