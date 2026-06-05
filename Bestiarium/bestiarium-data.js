window.BESTIARIUM_DATA = {
  site: {
    title: "Das Große Bestiarium von Aleria",
    bannerImage: "https://i.imgur.com/YETjoai.png",
    backgroundImage: "https://i.imgur.com/CUGDGdu.png",
    footer: "Aleria Bestiarium - modernisierte Archivseite",
    overview: {
      title: "Übersicht",
      count: "Archivnotiz",
      lead: "Das Bestiarium von Aleria versammelt natürliche Arten, sagenhafte Kreaturen und Wesen aus jenen Bereichen, in denen die Grenzen zwischen Welt, Riss und Sphäre unscharf werden.",
      body: "Die Einträge führen weiterhin zu den bestehenden Tafeln. Unbekannte Einträge bleiben sichtbar, damit die Sammlung später ohne Strukturbruch erweitert werden kann.",
      quote: "„Wer die Kreaturen dieser Welt versteht, begreift die Gesetze, nach denen sie atmet.“ - Chronist Rhalem von Durn"
    },
    sidebarTitles: {
      toc: "Inhaltsangabe",
      themes: "Infernale & Celestiale Themen",
      other: "Sonstige Themen",
      literature: "Literatur"
    }
  },
  filters: [
    { id: "all", label: "Alle" },
    { id: "tiere", label: "Tiere" },
    { id: "kreaturen", label: "Kreaturen" },
    { id: "infernale", label: "Infernale" },
    { id: "celestiale", label: "Celestiale" }
  ],
  sections: [
    {
      id: "tiere",
      kind: "tiere",
      title: "Tiere",
      count: "10 Gruppen",
      description: "Natürliche Arten Alerias: gezüchtet, gejagt, beobachtet oder in eigenen Habitaten katalogisiert.",
      entries: [
        { title: "Pferde", description: "Reit-, Zug- und Zuchtlinien Alerias mit Herkunft, Temperament und Eignung für Reise, Krieg oder Hofhaltung.", href: "https://www.animexx.de/zirkel/ichbinreiter/tafel/?seite=2284", image: "https://i.imgur.com/XYLTNIA.png" },
        { title: "Raubtiere", description: "Jäger der Wildnis, von territorialen Einzelgängern bis zu Rudeln, deren Spuren man besser lesen können sollte.", href: "https://www.animexx.de/zirkel/ichbinreiter/tafel/?seite=2285", image: "https://i.imgur.com/pIsdvV5.png" },
        { title: "Flugwesen", description: "Vogelartige, gleitende und geflügelte Arten, die Lufträume, Klippen und hohe Wälder besiedeln.", href: "https://www.animexx.de/zirkel/ichbinreiter/tafel/?seite=2283", image: "https://i.imgur.com/SEtaQcS.png" },
        { title: "Wild", description: "Scheue oder wehrhafte Bewohner von Wald, Steppe und Gebirge, wichtig für Jagdrecht, Reiseplanung und Nahrungsketten.", href: "https://www.animexx.de/zirkel/ichbinreiter/tafel/?seite=2286", image: "https://i.imgur.com/ERRAmXT.png" },
        { title: "Meerestiere", description: "Küsten-, Flussmündungs- und Tiefenarten, deren Auftauchen oft Wetter, Laichzüge oder alte Strömungen verraten.", href: "https://www.animexx.de/zirkel/ichbinreiter/tafel/?seite=2314", image: "https://i.imgur.com/PEIb07G.png" },
        { title: "Vieh", description: "Nutztiere, Herdenarten und robuste Hofbewohner, geordnet nach Haltung, Ertrag und regionaler Verbreitung.", href: "https://www.animexx.de/zirkel/ichbinreiter/tafel/?seite=2315", image: "https://i.imgur.com/z0eiFkI.png" },
        { title: "Reptilien", description: "Schuppenträger aus warmen Steinen, Sümpfen und Ruinen, katalogisiert nach Gift, Panzerung und Verhalten.", href: "https://www.animexx.de/zirkel/ichbinreiter/tafel/?seite=2316", image: "https://i.imgur.com/IHhMc3R.png" },
        { title: "Amphibien", description: "Ufer- und Sumpfbewohner, deren Lebensräume empfindlich auf Magie, Dürre und vergiftete Wasser reagieren.", href: "https://www.animexx.de/zirkel/ichbinreiter/tafel/?seite=2317", image: "https://i.imgur.com/rxlhMmv.png" },
        { title: "Ornithosaurier", description: "Uralte Fluglinien mit saurischer Herkunft, seltener Sichtung und hohem Forschungswert für die Akademie.", href: "https://www.animexx.de/zirkel/ichbinreiter/tafel/?seite=2318", image: "https://i.imgur.com/mq696B1.png" },
        { title: "Insekten", description: "Schwärme, Panzerträger und Kleinstjäger, oft unscheinbar, aber für Seuchen, Ernten und Alchemie entscheidend.", href: "https://www.animexx.de/zirkel/ichbinreiter/tafel/?seite=2287", image: "https://i.imgur.com/riDCZIN.png" }
      ]
    },
    {
      id: "besondere",
      kind: "besondere",
      title: "Besondere Exemplare",
      count: "Auswahl",
      description: "Benannte Einzelwesen und seltene Funde, die bereits als Legende, Forschungsobjekt oder Warnung im Umlauf sind.",
      entries: [
        { title: "Sturmbock", description: "Morgorn", href: "https://www.animexx.de/zirkel/ichbinreiter/tafel/?seite=2728", image: "https://i.imgur.com/j4J4rR4.png" },
        { title: "Mondläufer", description: "Lichthain", href: "https://www.animexx.de/zirkel/ichbinreiter/tafel/?seite=2727", image: "https://i.imgur.com/B5gWfci.png" },
        { title: "Unbekannt", description: "Reservierter Eintrag", image: "https://66.media.tumblr.com/c11fe8f7aab917bc90215beef3e83c10/tumblr_otwjgn7mfU1wwqdobo1_1280.png", placeholder: true },
        { title: "Unbekannt", description: "Reservierter Eintrag", image: "https://66.media.tumblr.com/c11fe8f7aab917bc90215beef3e83c10/tumblr_otwjgn7mfU1wwqdobo1_1280.png", placeholder: true },
        { title: "Unbekannt", description: "Reservierter Eintrag", image: "https://66.media.tumblr.com/c11fe8f7aab917bc90215beef3e83c10/tumblr_otwjgn7mfU1wwqdobo1_1280.png", placeholder: true }
      ]
    },
    {
      id: "kreaturen",
      kind: "kreaturen",
      title: "Kreaturen",
      count: "6 Tafeln",
      description: "Wesen, die nicht sauber in natürliche Taxonomien passen: Spuk, Hunger, Riesenblut und lokale Sonderfälle.",
      entries: [
        { title: "Geister", description: "Nachhall der Verstorbenen", href: "https://www.animexx.de/zirkel/ichbinreiter/tafel/?seite=773", image: "https://i.imgur.com/hppHPfN.png" },
        { title: "Nekrophagen", description: "Aas, Grab und Hunger", href: "https://www.animexx.de/zirkel/ichbinreiter/tafel/?seite=1266", image: "https://i.imgur.com/e1z6deU.png" },
        { title: "Trolle", description: "Steinige Kolosse", href: "https://www.animexx.de/zirkel/ichbinreiter/tafel/?seite=2276", image: "https://i.imgur.com/9pbbJhe.png" },
        { title: "Riesen", description: "Uralte Größe", href: "https://www.animexx.de/zirkel/ichbinreiter/tafel/?seite=2277", image: "https://i.imgur.com/KKCp9ne.png" },
        { title: "Fairean", description: "Einzelne Kreatur", href: "https://www.animexx.de/zirkel/ichbinreiter/tafel/?seite=2876", image: "https://i.imgur.com/430LhxR.png" },
        { title: "Lütten", description: "Einzelne Kreatur", href: "https://www.animexx.de/zirkel/ichbinreiter/tafel/?seite=2926", image: "https://i.imgur.com/vOO0bTD.png" }
      ]
    },
    {
      id: "infernale",
      kind: "infernale",
      title: "Infernale Wesen",
      count: "13 Einträge",
      description: "Linien, Diener und Einzelwesen, die mit Morgath, Rissen, Pakten oder infernaler Essenz in Verbindung stehen.",
      entries: [
        { title: "Kobolde", description: "Infernale Linie", href: "https://www.animexx.de/zirkel/ichbinreiter/tafel/?seite=2236", image: "https://i.imgur.com/zGJcZUN.png" },
        { title: "Ogroiden", description: "Infernale Linie", href: "https://www.animexx.de/zirkel/ichbinreiter/tafel/?seite=2246", image: "https://i.imgur.com/I3blovE.png" },
        { title: "Vampire", description: "Blut und Nacht", href: "https://www.animexx.de/zirkel/ichbinreiter/tafel/?seite=2252", image: "https://i.imgur.com/kvKsjVd.png" },
        { title: "Inferniiden", description: "Feuergeprägte", href: "https://www.animexx.de/zirkel/ichbinreiter/tafel/?seite=2254", image: "https://i.imgur.com/xnMI1cv.png" },
        { title: "Aelvar", description: "Dunkle Abstammung", href: "https://www.animexx.de/zirkel/ichbinreiter/tafel/?seite=2263", image: "https://i.imgur.com/ScU6e3o.png" },
        { title: "Unhold", description: "Unterart", href: "https://www.animexx.de/zirkel/ichbinreiter/tafel/?seite=2322", image: "https://i.imgur.com/OzHXpOq.png" },
        { title: "Nautiloiden", description: "Unterart", href: "https://www.animexx.de/zirkel/ichbinreiter/tafel/?seite=2323", image: "https://i.imgur.com/9Qo9pdS.png" },
        { title: "Sylvaniiden", description: "Unterart", href: "https://www.animexx.de/zirkel/ichbinreiter/tafel/?seite=2324", image: "https://i.imgur.com/HHMoYMB.png" },
        { title: "Infestiden", description: "Unterart", href: "https://www.animexx.de/zirkel/ichbinreiter/tafel/?seite=2325", image: "https://i.imgur.com/YKAPqyv.png" },
        { title: "Psioniden", description: "Unterart", href: "https://www.animexx.de/zirkel/ichbinreiter/tafel/?seite=2326", image: "https://i.imgur.com/OZmrBIp.png" },
        { divider: true, title: "Einzelexemplare nach den Psioniden", description: "Diese Wesen gehören nicht zu den allgemeinen Gruppenlisten, sondern werden als einzelne bekannte Exemplare oder Sonderfälle geführt." },
        { title: "Djinn", description: "Einzelnes Wesen", href: "https://www.animexx.de/zirkel/ichbinreiter/tafel/?seite=2646", image: "https://i.postimg.cc/sXH3j5ph/Chat-GPT-Image-13-Nov-2025-13-27-32-removebg-preview.png" },
        { title: "Muhmen", description: "Einzelnes Wesen", href: "https://www.animexx.de/zirkel/ichbinreiter/tafel/?seite=2601", image: "https://i.imgur.com/XL2BtOM.png" },
        { title: "Gorgonnen", description: "Einzelnes Wesen", href: "https://www.animexx.de/zirkel/ichbinreiter/tafel/?seite=2252", image: "https://i.imgur.com/EkfJvk0.png" }
      ]
    },
    {
      id: "celestiale",
      kind: "celestiale",
      title: "Celestiale Wesen",
      count: "10 Einträge",
      description: "Helle Sphärenwesen, mythische Ordnungen und Diener der Souveränen.",
      entries: [
        { title: "Drachen", description: "Celestiale Ordnung", image: "https://66.media.tumblr.com/c11fe8f7aab917bc90215beef3e83c10/tumblr_otwjgn7mfU1wwqdobo1_1280.png", placeholder: true },
        { title: "Nymphen", description: "Celestiale Ordnung", image: "https://66.media.tumblr.com/c11fe8f7aab917bc90215beef3e83c10/tumblr_otwjgn7mfU1wwqdobo1_1280.png", placeholder: true },
        { title: "Nornen", description: "Celestiale Ordnung", image: "https://66.media.tumblr.com/c11fe8f7aab917bc90215beef3e83c10/tumblr_otwjgn7mfU1wwqdobo1_1280.png", placeholder: true },
        { title: "Feen", description: "Celestiale Ordnung", image: "https://66.media.tumblr.com/c11fe8f7aab917bc90215beef3e83c10/tumblr_otwjgn7mfU1wwqdobo1_1280.png", placeholder: true },
        { title: "Schnitter", description: "Celestiale Ordnung", image: "https://66.media.tumblr.com/c11fe8f7aab917bc90215beef3e83c10/tumblr_otwjgn7mfU1wwqdobo1_1280.png", placeholder: true },
        { divider: true, title: "Diener der Souveränen", description: "Bekannte Dienerlinien der Souveränen, geführt als eigene Archivgruppe." },
        { title: "Aelthars Diener", description: "Souveränenbindung", image: "https://i.imgur.com/fw9MCDW.png" },
        { title: "Nimues Diener", description: "Souveränenbindung", image: "https://i.imgur.com/kjsWSLq.png" },
        { title: "Thyraels Diener", description: "Souveränenbindung", image: "https://i.imgur.com/OwFY1p2.png" },
        { title: "Zephyrs Diener", description: "Souveränenbindung", image: "https://i.imgur.com/IYI7scl.png" },
        { title: "Rheas Diener", description: "Souveränenbindung", image: "https://i.imgur.com/CkHKUm1.png" }
      ]
    }
  ],
  links: {
    themes: [
      { label: "Kalpa - Morgath", href: "https://www.animexx.de/zirkel/ichbinreiter/tafel/?seite=580" },
      { label: "Risse - Manat", href: "https://www.animexx.de/zirkel/ichbinreiter/tafel/?seite=433" },
      { label: "Geweihte", href: "https://www.animexx.de/zirkel/ichbinreiter/tafel/?seite=1678" },
      { label: "Gefallene", href: "https://www.animexx.de/zirkel/ichbinreiter/tafel/?seite=583" },
      { label: "Lichtalben - Celestialer", href: "https://www.animexx.de/zirkel/ichbinreiter/tafel/?seite=1893" },
      { label: "Dunkelalben - Infernaler", href: "https://www.animexx.de/zirkel/ichbinreiter/tafel/?seite=2180" }
    ],
    other: [
      { label: "Pferdekreuzungsmatrix", href: "https://dieweltvonaleria.neocities.org/Pferdematrix" }
    ],
    literature: [
      { label: "Das Wesen des Infernalen", href: "https://www.animexx.de/zirkel/ichbinreiter/tafel/?seite=2644" },
      { label: "Dämonologie Band I. - X.", href: "#" },
      { label: "Nekrophagen Band I - V", href: "#" },
      { label: "Bestienkunde der Alten Reiche", href: "#" },
      { label: "Über Höllenpakte", href: "#" },
      { label: "Chroniken der Celestialen", href: "#" }
    ]
  }
};
