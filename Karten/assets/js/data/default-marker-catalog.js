// Default marker-catalog seed: the original 74 Imgur-hosted markers
// (unchanged, still work exactly as before) plus 262 local icons copied
// from IconOrdner/ (Welt/Orte/Universal/Gilden & Orden/Gottheiten Pins),
// referenced by relative path under assets/icons/ so they ship with the
// repo instead of depending on an external image host - consistent with
// "kein Firebase, alles ueber GitHub" (see ARCHITEKTUR.md, Datenspeicherung).
//
// This is the SHARED fallback used when a map (data.json) does not carry
// its own markerCatalog yet - editing/removing entries in the in-app
// Marker-Katalog manager still works exactly as before, per map.
window.KARTO_DEFAULT_MARKER_CATALOG = [
  {
    "id": "mmhy1v2v5vo1",
    "url": "https://i.imgur.com/si6Lzp4.png",
    "name": "Lager, Camp",
    "group": "Lager"
  },
  {
    "id": "mmhy2ggp7sm2",
    "url": "https://i.imgur.com/Qssb7fy.png",
    "name": "Druidenhain",
    "group": "Druidenhain"
  },
  {
    "id": "mmhy31uz6u4x",
    "url": "https://i.imgur.com/rTtcgCX.png",
    "name": "Höhle, Spalt",
    "group": "Dungeon"
  },
  {
    "id": "mmhy3d2p8oi3",
    "url": "https://i.imgur.com/27bSz0a.png",
    "name": "Gruft",
    "group": "Dungeon"
  },
  {
    "id": "mmhy402r9mbv",
    "url": "https://i.imgur.com/M4EXUZA.png",
    "name": "Düstere Burg",
    "group": "Ort"
  },
  {
    "id": "mmhy4bozrx2q",
    "url": "https://i.imgur.com/xPjYDr7.png",
    "name": "Hain",
    "group": "Druidenhain"
  },
  {
    "id": "mmhy6pk7x8tt",
    "url": "https://i.imgur.com/7IPY6U6.png",
    "name": "Turmruine",
    "group": "Ruinen"
  },
  {
    "id": "mmhy7kiv76or",
    "url": "https://i.imgur.com/qIPp64T.png",
    "name": "Monsterlager",
    "group": "Monster, Kreaturen"
  },
  {
    "id": "mmhy7v09o9hv",
    "url": "https://i.imgur.com/Cy1m0Yg.png",
    "name": "Piratenversteck",
    "group": "Lager"
  },
  {
    "id": "mmhy8gukzwrf",
    "url": "https://i.imgur.com/oKYN5Zi.png",
    "name": "Ahnenbaum",
    "group": "Druidenhain"
  },
  {
    "id": "mmhy8xy8th6r",
    "url": "https://i.imgur.com/W91SDei.png",
    "name": "Hafensiedlung",
    "group": "Siedlungen"
  },
  {
    "id": "mmhy9guzperf",
    "url": "https://i.imgur.com/ZMBWVT3.png",
    "name": "Wahrzeichen",
    "group": "Ort"
  },
  {
    "id": "mmhy9qiwr9d3",
    "url": "https://i.imgur.com/owm3FRd.png",
    "name": "Antike Ruine",
    "group": "Ruinen"
  },
  {
    "id": "mmhya29o2ou0",
    "url": "https://i.imgur.com/oQo2DxQ.png",
    "name": "Bauernsiedlung",
    "group": "Siedlungen"
  },
  {
    "id": "mmhyapiiwk6c",
    "url": "https://i.imgur.com/zn8PqT9.png",
    "name": "Burgsiedlung",
    "group": "Siedlungen"
  },
  {
    "id": "mmhyb1j0a7rr",
    "url": "https://i.imgur.com/4gUcfj7.png",
    "name": "Waldsiedlung",
    "group": "Siedlungen"
  },
  {
    "id": "mmhybamogr5u",
    "url": "https://i.imgur.com/WUjAGC5.png",
    "name": "Bergbausiedlung",
    "group": "Siedlungen"
  },
  {
    "id": "mmhybk0g5ep5",
    "url": "https://i.imgur.com/XBchNeO.png",
    "name": "Leuchtturm",
    "group": "Siedlungen"
  },
  {
    "id": "mmhybs1at7gb",
    "url": "https://i.imgur.com/W5reRk3.png",
    "name": "Sonstiges",
    "group": "Ort"
  },
  {
    "id": "mmhycsrakooq",
    "url": "https://i.imgur.com/gCD7g8z.png",
    "name": "Befestigung, Turm",
    "group": "Siedlungen"
  },
  {
    "id": "mmhyd9rw13hp",
    "url": "https://i.imgur.com/rkPVj2q.png",
    "name": "Großes Hügelgrab",
    "group": "Dungeon"
  },
  {
    "id": "mmhydq2qvg60",
    "url": "https://i.imgur.com/3FCGHjn.png",
    "name": "Antikes Grabmal",
    "group": "Dungeon"
  },
  {
    "id": "mmhye4s8sgib",
    "url": "https://i.imgur.com/oa6fFKZ.png",
    "name": "Schmiede",
    "group": "Einzelne Orte"
  },
  {
    "id": "mmhyegn0obaj",
    "url": "https://i.imgur.com/P0KVz1C.png",
    "name": "Flusssiedlung",
    "group": "Siedlungen"
  },
  {
    "id": "mmhyews3t5aw",
    "url": "https://i.imgur.com/QgWTzna.png",
    "name": "Schiffswrack",
    "group": "Ort"
  },
  {
    "id": "mmhyf9ai4we3",
    "url": "https://i.imgur.com/D5KPZrl.png",
    "name": "Klostersiedlung",
    "group": "Siedlungen"
  },
  {
    "id": "mmhyfwp6jspa",
    "url": "https://i.imgur.com/UdZpwwT.png",
    "name": "Kleinstadt, Bardensiedlung",
    "group": "Siedlungen"
  },
  {
    "id": "mmhygeiqc942",
    "url": "https://i.imgur.com/ig4QY5L.png",
    "name": "Große Stadt",
    "group": "Städte"
  },
  {
    "id": "mmhyh0xyptir",
    "url": "https://i.imgur.com/ZyWnMQI.png",
    "name": "Handelssiedlung, Straßensiedlung",
    "group": "Siedlungen"
  },
  {
    "id": "mmhyhe9aohw9",
    "url": "https://i.imgur.com/IzgkaZA.png",
    "name": "Stadtruine",
    "group": "Ruinen"
  },
  {
    "id": "mmhyhpsw5bdv",
    "url": "https://i.imgur.com/a86oa8b.png",
    "name": "Große Burg",
    "group": "Städte"
  },
  {
    "id": "mmhyi688vt0g",
    "url": "https://i.imgur.com/b3Dis88.png",
    "name": "Ausgrabung",
    "group": "Lager"
  },
  {
    "id": "mmhyihniof25",
    "url": "https://i.imgur.com/QfEWeNI.png",
    "name": "Taverne",
    "group": "Einzelne Orte"
  },
  {
    "id": "mmhyiw9w5qme",
    "url": "https://i.imgur.com/7jYp7Ec.png",
    "name": "Siedlungsruine",
    "group": "Ruinen"
  },
  {
    "id": "mmhyj3uc39d4",
    "url": "https://i.imgur.com/xnDdkTd.png",
    "name": "Magierturm",
    "group": "Einzelne Orte"
  },
  {
    "id": "mmhyjfea8n2b",
    "url": "https://i.imgur.com/jHSfDfQ.png",
    "name": "Brauersiedlung",
    "group": "Siedlungen"
  },
  {
    "id": "mmhyjpeo7nr4",
    "url": "https://i.imgur.com/pj1bZ3c.png",
    "name": "Turnierfeld",
    "group": "Lager"
  },
  {
    "id": "mmhyk0z25v4z",
    "url": "https://i.imgur.com/UhmOtK9.png",
    "name": "Jägerlager",
    "group": "Lager"
  },
  {
    "id": "mmhyk9omthtu",
    "url": "https://i.imgur.com/TbPgU39.png",
    "name": "Kriegslager",
    "group": "Lager"
  },
  {
    "id": "mmhyl0rch8om",
    "url": "https://i.imgur.com/h70HD3e.png",
    "name": "Festung",
    "group": "Ort"
  },
  {
    "id": "mmhylbiaxcz3",
    "url": "https://i.imgur.com/czlsvjk.png",
    "name": "Einzelne Ruine",
    "group": "Ruinen"
  },
  {
    "id": "mmhyltcc3a1x",
    "url": "https://i.imgur.com/0uPEURl.png",
    "name": "Sumpf- Moorsiedlung",
    "group": "Siedlungen"
  },
  {
    "id": "mmhym8zo3azt",
    "url": "https://i.imgur.com/ztEu5O7.png",
    "name": "Hauptstadt",
    "group": "Städte"
  },
  {
    "id": "mmhymmwwir59",
    "url": "https://i.imgur.com/oQuDDCk.png",
    "name": "Pferdesiedlung",
    "group": "Siedlungen"
  },
  {
    "id": "mmhyn26wfw4s",
    "url": "https://i.imgur.com/pksanNk.png",
    "name": "Kaufmannssiedlung",
    "group": "Siedlungen"
  },
  {
    "id": "mmhynd7erizf",
    "url": "https://i.imgur.com/OdbjAeR.png",
    "name": "Söldner/Banditen Lager",
    "group": "Lager"
  },
  {
    "id": "mmhynr1ma41r",
    "url": "https://i.imgur.com/kdjcTYV.png",
    "name": "Diebesgilde",
    "group": "Lager"
  },
  {
    "id": "mmhyo03k4th4",
    "url": "https://i.imgur.com/4JhJVAe.png",
    "name": "Kultistenversteck",
    "group": "Lager"
  },
  {
    "id": "mmhyoelgkk9u",
    "url": "https://i.imgur.com/GrUPOsK.png",
    "name": "Hügelgrab, klein",
    "group": "Dungeon"
  },
  {
    "id": "mmhyorh0f51w",
    "url": "https://i.imgur.com/J2sSgDc.png",
    "name": "Methalle",
    "group": "Einzelne Orte"
  },
  {
    "id": "mmhyp27egsr6",
    "url": "https://i.imgur.com/BMmLQin.png",
    "name": "Verwunschener Wald",
    "group": "Ort"
  },
  {
    "id": "mmhypwaasn7f",
    "url": "https://i.imgur.com/cuVBi3a.png",
    "name": "Ritterliches Gut",
    "group": "Einzelne Orte"
  },
  {
    "id": "mmhyqcq9e9w8",
    "url": "https://i.imgur.com/frFNzJJ.png",
    "name": "Dimensionaler Riss",
    "group": "Ort"
  },
  {
    "id": "mmhyqo9qnb18",
    "url": "https://i.imgur.com/o2dIFVI.png",
    "name": "Fähre, Furt",
    "group": "Ort"
  },
  {
    "id": "mmhyr6ggtc37",
    "url": "https://i.imgur.com/BM4XrJ8.png",
    "name": "Gasthof, Herberge",
    "group": "Einzelne Orte"
  },
  {
    "id": "mmhyrk2dpslf",
    "url": "https://i.imgur.com/JpCv3lu.png",
    "name": "Heiße Quellen",
    "group": "Ort"
  },
  {
    "id": "mmhys0dzbfte",
    "url": "https://i.imgur.com/l29ikqO.png",
    "name": "Jägerhaus, Jagdhaus, Jäger",
    "group": "Einzelne Orte"
  },
  {
    "id": "mmhysddvuzoh",
    "url": "https://i.imgur.com/oV4VYuE.png",
    "name": "Monsterhort",
    "group": "Dungeon"
  },
  {
    "id": "mmhyt6evk15e",
    "url": "https://i.imgur.com/yS1IZVM.png",
    "name": "Ländliches Gut",
    "group": "Einzelne Orte"
  },
  {
    "id": "mmhytf3rttx3",
    "url": "https://i.imgur.com/vkMw1eo.png",
    "name": "Plantage",
    "group": "Einzelne Orte"
  },
  {
    "id": "mmhyts4v2042",
    "url": "https://i.imgur.com/NH4abC8.png",
    "name": "Wegesschrein",
    "group": "Ort"
  },
  {
    "id": "mmhyusqfs3vl",
    "url": "https://i.imgur.com/zudaHxx.png",
    "name": "Zoll, Grenzposten",
    "group": "Einzelne Orte"
  },
  {
    "id": "mmhyv2vdwluc",
    "url": "https://i.imgur.com/EkzS9nU.png",
    "name": "Totem, Waldschrat",
    "group": "Ort"
  },
  {
    "id": "mmhyvispb0ju",
    "url": "https://i.imgur.com/N2Pw8Dn.png",
    "name": "Viehzüchter, Weide, Hof",
    "group": "Einzelne Orte"
  },
  {
    "id": "mmhywaaxhik7",
    "url": "https://i.imgur.com/I40DFfC.png",
    "name": "Weingut, moderat",
    "group": "Einzelne Orte"
  },
  {
    "id": "mmhywrd12a2a",
    "url": "https://i.imgur.com/LlxOwL3.png",
    "name": "Schiff",
    "group": "Einzelne Orte"
  },
  {
    "id": "mmhyx1cdo310",
    "url": "https://i.imgur.com/w8ZQqt1.png",
    "name": "Ritterburg",
    "group": "Einzelne Orte"
  },
  {
    "id": "mmhyxjmf13p3",
    "url": "https://i.imgur.com/0FocBLD.png",
    "name": "Anwesen",
    "group": "Einzelne Orte"
  },
  {
    "id": "mmhyxza5y2p9",
    "url": "https://i.imgur.com/LHe3Ld1.png",
    "name": "Familienhof",
    "group": "Einzelne Orte"
  },
  {
    "id": "mmhyynav6vzr",
    "url": "https://i.imgur.com/xRYQ5yq.png",
    "name": "Außenposten",
    "group": "Einzelne Orte"
  },
  {
    "id": "mmhyz18t7j1c",
    "url": "https://i.imgur.com/UV2ynil.png",
    "name": "Großes Weingut",
    "group": "Einzelne Orte"
  },
  {
    "id": "mmhyzd3pgkrl",
    "url": "https://i.imgur.com/piwh9ya.png",
    "name": "Jagdklingen Lager",
    "group": "Gilden"
  },
  {
    "id": "mmhyzo7hxsdr",
    "url": "https://i.imgur.com/w8g32Iv.png",
    "name": "Windreiter Standort",
    "group": "Gilden"
  },
  {
    "id": "mmhz03mpxj4s",
    "url": "https://i.imgur.com/Cnr33rb.png",
    "name": "Möwensang Standort",
    "group": "Gilden"
  },
  {
    "id": "icon-welt-ahnenbaum",
    "url": "assets/icons/welt/ahnenbaum.png",
    "name": "Ahnenbaum",
    "group": "Welt"
  },
  {
    "id": "icon-welt-antike-ruine",
    "url": "assets/icons/welt/antike-ruine.png",
    "name": "Antike Ruine",
    "group": "Welt"
  },
  {
    "id": "icon-welt-antikes-grab",
    "url": "assets/icons/welt/antikes-grab.png",
    "name": "Antikes Grab",
    "group": "Welt"
  },
  {
    "id": "icon-welt-anwesen",
    "url": "assets/icons/welt/anwesen.png",
    "name": "Anwesen",
    "group": "Welt"
  },
  {
    "id": "icon-welt-ausgrabung",
    "url": "assets/icons/welt/ausgrabung.png",
    "name": "Ausgrabung",
    "group": "Welt"
  },
  {
    "id": "icon-welt-au-enposten",
    "url": "assets/icons/welt/au-enposten.png",
    "name": "Außenposten",
    "group": "Welt"
  },
  {
    "id": "icon-welt-banditenlager",
    "url": "assets/icons/welt/banditenlager.png",
    "name": "Banditenlager",
    "group": "Welt"
  },
  {
    "id": "icon-welt-bardensiedlung",
    "url": "assets/icons/welt/bardensiedlung.png",
    "name": "Bardensiedlung",
    "group": "Welt"
  },
  {
    "id": "icon-welt-bauernsiedlung-2",
    "url": "assets/icons/welt/bauernsiedlung-2.png",
    "name": "Bauernsiedlung (2)",
    "group": "Welt"
  },
  {
    "id": "icon-welt-bauernsiedlung",
    "url": "assets/icons/welt/bauernsiedlung.png",
    "name": "Bauernsiedlung",
    "group": "Welt"
  },
  {
    "id": "icon-welt-befestigte-siedlung",
    "url": "assets/icons/welt/befestigte-siedlung.png",
    "name": "Befestigte Siedlung",
    "group": "Welt"
  },
  {
    "id": "icon-welt-beliebig",
    "url": "assets/icons/welt/beliebig.png",
    "name": "Beliebig",
    "group": "Welt"
  },
  {
    "id": "icon-welt-bergbausiedlung",
    "url": "assets/icons/welt/bergbausiedlung.png",
    "name": "Bergbausiedlung",
    "group": "Welt"
  },
  {
    "id": "icon-welt-brauersiedlung",
    "url": "assets/icons/welt/brauersiedlung.png",
    "name": "Brauersiedlung",
    "group": "Welt"
  },
  {
    "id": "icon-welt-br-ckensiedlung",
    "url": "assets/icons/welt/br-ckensiedlung.png",
    "name": "Brückensiedlung",
    "group": "Welt"
  },
  {
    "id": "icon-welt-burgsiedlung",
    "url": "assets/icons/welt/burgsiedlung.png",
    "name": "Burgsiedlung",
    "group": "Welt"
  },
  {
    "id": "icon-welt-diebesgilde",
    "url": "assets/icons/welt/diebesgilde.png",
    "name": "Diebesgilde",
    "group": "Welt"
  },
  {
    "id": "icon-welt-dimensionaler-riss",
    "url": "assets/icons/welt/dimensionaler-riss.png",
    "name": "Dimensionaler Riss",
    "group": "Welt"
  },
  {
    "id": "icon-welt-druidenh-tte",
    "url": "assets/icons/welt/druidenh-tte.png",
    "name": "Druidenhütte",
    "group": "Welt"
  },
  {
    "id": "icon-welt-festung",
    "url": "assets/icons/welt/festung.png",
    "name": "Festung",
    "group": "Welt"
  },
  {
    "id": "icon-welt-finstere-burg",
    "url": "assets/icons/welt/finstere-burg.png",
    "name": "Finstere Burg",
    "group": "Welt"
  },
  {
    "id": "icon-welt-gasthof",
    "url": "assets/icons/welt/gasthof.png",
    "name": "Gasthof",
    "group": "Welt"
  },
  {
    "id": "icon-welt-gest-t",
    "url": "assets/icons/welt/gest-t.png",
    "name": "Gestüt",
    "group": "Welt"
  },
  {
    "id": "icon-welt-gipfel",
    "url": "assets/icons/welt/gipfel.png",
    "name": "Gipfel",
    "group": "Welt"
  },
  {
    "id": "icon-welt-goblinlager",
    "url": "assets/icons/welt/goblinlager.png",
    "name": "Goblinlager",
    "group": "Welt"
  },
  {
    "id": "icon-welt-grabmal",
    "url": "assets/icons/welt/grabmal.png",
    "name": "Grabmal",
    "group": "Welt"
  },
  {
    "id": "icon-welt-gro-e-burg",
    "url": "assets/icons/welt/gro-e-burg.png",
    "name": "Große Burg",
    "group": "Welt"
  },
  {
    "id": "icon-welt-gro-er-hafen",
    "url": "assets/icons/welt/gro-er-hafen.png",
    "name": "Großer Hafen",
    "group": "Welt"
  },
  {
    "id": "icon-welt-gro-es-weingut",
    "url": "assets/icons/welt/gro-es-weingut.png",
    "name": "Großes Weingut",
    "group": "Welt"
  },
  {
    "id": "icon-welt-hafensiedlung",
    "url": "assets/icons/welt/hafensiedlung.png",
    "name": "Hafensiedlung",
    "group": "Welt"
  },
  {
    "id": "icon-welt-hain",
    "url": "assets/icons/welt/hain.png",
    "name": "Hain",
    "group": "Welt"
  },
  {
    "id": "icon-welt-heereslager",
    "url": "assets/icons/welt/heereslager.png",
    "name": "Heereslager",
    "group": "Welt"
  },
  {
    "id": "icon-welt-heiligtum",
    "url": "assets/icons/welt/heiligtum.png",
    "name": "Heiligtum",
    "group": "Welt"
  },
  {
    "id": "icon-welt-heiligtum2",
    "url": "assets/icons/welt/heiligtum2.png",
    "name": "Heiligtum2",
    "group": "Welt"
  },
  {
    "id": "icon-welt-hei-e-quellen",
    "url": "assets/icons/welt/hei-e-quellen.png",
    "name": "Heiße Quellen",
    "group": "Welt"
  },
  {
    "id": "icon-welt-h-hle",
    "url": "assets/icons/welt/h-hle.png",
    "name": "Höhle",
    "group": "Welt"
  },
  {
    "id": "icon-welt-h-gelgrab",
    "url": "assets/icons/welt/h-gelgrab.png",
    "name": "Hügelgrab",
    "group": "Welt"
  },
  {
    "id": "icon-welt-j-gerhaus",
    "url": "assets/icons/welt/j-gerhaus.png",
    "name": "Jägerhaus",
    "group": "Welt"
  },
  {
    "id": "icon-welt-j-gerlager",
    "url": "assets/icons/welt/j-gerlager.png",
    "name": "Jägerlager",
    "group": "Welt"
  },
  {
    "id": "icon-welt-kleine-burg",
    "url": "assets/icons/welt/kleine-burg.png",
    "name": "Kleine Burg",
    "group": "Welt"
  },
  {
    "id": "icon-welt-kleines-weingut",
    "url": "assets/icons/welt/kleines-weingut.png",
    "name": "Kleines Weingut",
    "group": "Welt"
  },
  {
    "id": "icon-welt-klostersiedlung",
    "url": "assets/icons/welt/klostersiedlung.png",
    "name": "Klostersiedlung",
    "group": "Welt"
  },
  {
    "id": "icon-welt-kreaturenhort",
    "url": "assets/icons/welt/kreaturenhort.png",
    "name": "Kreaturenhort",
    "group": "Welt"
  },
  {
    "id": "icon-welt-lager",
    "url": "assets/icons/welt/lager.png",
    "name": "Lager",
    "group": "Welt"
  },
  {
    "id": "icon-welt-landgut",
    "url": "assets/icons/welt/landgut.png",
    "name": "Landgut",
    "group": "Welt"
  },
  {
    "id": "icon-welt-leuchtturm",
    "url": "assets/icons/welt/leuchtturm.png",
    "name": "Leuchtturm",
    "group": "Welt"
  },
  {
    "id": "icon-welt-magierturm",
    "url": "assets/icons/welt/magierturm.png",
    "name": "Magierturm",
    "group": "Welt"
  },
  {
    "id": "icon-welt-marktsiedlung",
    "url": "assets/icons/welt/marktsiedlung.png",
    "name": "Marktsiedlung",
    "group": "Welt"
  },
  {
    "id": "icon-welt-marktstand",
    "url": "assets/icons/welt/marktstand.png",
    "name": "Marktstand",
    "group": "Welt"
  },
  {
    "id": "icon-welt-methalle",
    "url": "assets/icons/welt/methalle.png",
    "name": "Methalle",
    "group": "Welt"
  },
  {
    "id": "icon-welt-nordische-ruine",
    "url": "assets/icons/welt/nordische-ruine.png",
    "name": "Nordische Ruine",
    "group": "Welt"
  },
  {
    "id": "icon-welt-obstplantage",
    "url": "assets/icons/welt/obstplantage.png",
    "name": "Obstplantage",
    "group": "Welt"
  },
  {
    "id": "icon-welt-okkulter-schrein",
    "url": "assets/icons/welt/okkulter-schrein.png",
    "name": "Okkulter Schrein",
    "group": "Welt"
  },
  {
    "id": "icon-welt-pferdezuchtsiedlung",
    "url": "assets/icons/welt/pferdezuchtsiedlung.png",
    "name": "Pferdezuchtsiedlung",
    "group": "Welt"
  },
  {
    "id": "icon-welt-piratenlager",
    "url": "assets/icons/welt/piratenlager.png",
    "name": "Piratenlager",
    "group": "Welt"
  },
  {
    "id": "icon-welt-ruine2",
    "url": "assets/icons/welt/ruine2.png",
    "name": "Ruine2",
    "group": "Welt"
  },
  {
    "id": "icon-welt-schiffswrackpin",
    "url": "assets/icons/welt/schiffswrackpin.png",
    "name": "SchiffswrackPin",
    "group": "Welt"
  },
  {
    "id": "icon-welt-schmiede",
    "url": "assets/icons/welt/schmiede.png",
    "name": "Schmiede",
    "group": "Welt"
  },
  {
    "id": "icon-welt-stadt",
    "url": "assets/icons/welt/stadt.png",
    "name": "Stadt",
    "group": "Welt"
  },
  {
    "id": "icon-welt-stadtruine",
    "url": "assets/icons/welt/stadtruine.png",
    "name": "Stadtruine",
    "group": "Welt"
  },
  {
    "id": "icon-welt-sumpfsiedlung",
    "url": "assets/icons/welt/sumpfsiedlung.png",
    "name": "Sumpfsiedlung",
    "group": "Welt"
  },
  {
    "id": "icon-welt-taverne",
    "url": "assets/icons/welt/taverne.png",
    "name": "Taverne",
    "group": "Welt"
  },
  {
    "id": "icon-welt-turm",
    "url": "assets/icons/welt/turm.png",
    "name": "Turm",
    "group": "Welt"
  },
  {
    "id": "icon-welt-turnierplatz",
    "url": "assets/icons/welt/turnierplatz.png",
    "name": "Turnierplatz",
    "group": "Welt"
  },
  {
    "id": "icon-welt-unterwasserstadt",
    "url": "assets/icons/welt/unterwasserstadt.png",
    "name": "Unterwasserstadt",
    "group": "Welt"
  },
  {
    "id": "icon-welt-wahrzeichen",
    "url": "assets/icons/welt/wahrzeichen.png",
    "name": "Wahrzeichen",
    "group": "Welt"
  },
  {
    "id": "icon-welt-waldschrat",
    "url": "assets/icons/welt/waldschrat.png",
    "name": "Waldschrat",
    "group": "Welt"
  },
  {
    "id": "icon-welt-waldsiedlung",
    "url": "assets/icons/welt/waldsiedlung.png",
    "name": "Waldsiedlung",
    "group": "Welt"
  },
  {
    "id": "icon-welt-wegschrein",
    "url": "assets/icons/welt/wegschrein.png",
    "name": "Wegschrein",
    "group": "Welt"
  },
  {
    "id": "icon-welt-weide",
    "url": "assets/icons/welt/weide.png",
    "name": "Weide",
    "group": "Welt"
  },
  {
    "id": "icon-welt-weingut",
    "url": "assets/icons/welt/weingut.png",
    "name": "Weingut",
    "group": "Welt"
  },
  {
    "id": "icon-welt-zerst-rte-siedlung",
    "url": "assets/icons/welt/zerst-rte-siedlung.png",
    "name": "Zerstörte Siedlung",
    "group": "Welt"
  },
  {
    "id": "icon-welt-zerst-rter-turm",
    "url": "assets/icons/welt/zerst-rter-turm.png",
    "name": "Zerstörter Turm",
    "group": "Welt"
  },
  {
    "id": "icon-welt-zoll-grenzposten",
    "url": "assets/icons/welt/zoll-grenzposten.png",
    "name": "Zoll - Grenzposten",
    "group": "Welt"
  },
  {
    "id": "icon-welt-banditenversteck2",
    "url": "assets/icons/welt/banditenversteck2.png",
    "name": "Banditenversteck2",
    "group": "Welt"
  },
  {
    "id": "icon-welt-bauernh-tte",
    "url": "assets/icons/welt/bauernh-tte.png",
    "name": "Bauernhütte",
    "group": "Welt"
  },
  {
    "id": "icon-welt-b-uerliches-heim",
    "url": "assets/icons/welt/b-uerliches-heim.png",
    "name": "Bäuerliches Heim",
    "group": "Welt"
  },
  {
    "id": "icon-welt-einzelnemine",
    "url": "assets/icons/welt/einzelnemine.png",
    "name": "EinzelneMine",
    "group": "Welt"
  },
  {
    "id": "icon-welt-exekutionsplatz",
    "url": "assets/icons/welt/exekutionsplatz.png",
    "name": "Exekutionsplatz",
    "group": "Welt"
  },
  {
    "id": "icon-welt-fischerh-tte",
    "url": "assets/icons/welt/fischerh-tte.png",
    "name": "Fischerhütte",
    "group": "Welt"
  },
  {
    "id": "icon-welt-gildenzentrale",
    "url": "assets/icons/welt/gildenzentrale.png",
    "name": "Gildenzentrale",
    "group": "Welt"
  },
  {
    "id": "icon-welt-grube",
    "url": "assets/icons/welt/grube.png",
    "name": "Grube",
    "group": "Welt"
  },
  {
    "id": "icon-welt-heereslager-2",
    "url": "assets/icons/welt/heereslager-2.png",
    "name": "Heereslager",
    "group": "Welt"
  },
  {
    "id": "icon-welt-heiligenschrein",
    "url": "assets/icons/welt/heiligenschrein.png",
    "name": "heiligenschrein",
    "group": "Welt"
  },
  {
    "id": "icon-welt-hexenhaus",
    "url": "assets/icons/welt/hexenhaus.png",
    "name": "Hexenhaus",
    "group": "Welt"
  },
  {
    "id": "icon-welt-holzf-llerlager",
    "url": "assets/icons/welt/holzf-llerlager.png",
    "name": "Holzfällerlager",
    "group": "Welt"
  },
  {
    "id": "icon-welt-imkerhof",
    "url": "assets/icons/welt/imkerhof.png",
    "name": "Imkerhof",
    "group": "Welt"
  },
  {
    "id": "icon-welt-kontor",
    "url": "assets/icons/welt/kontor.png",
    "name": "Kontor",
    "group": "Welt"
  },
  {
    "id": "icon-welt-kutscher",
    "url": "assets/icons/welt/kutscher.png",
    "name": "Kutscher",
    "group": "Welt"
  },
  {
    "id": "icon-welt-k-hler3",
    "url": "assets/icons/welt/k-hler3.png",
    "name": "Köhler3",
    "group": "Welt"
  },
  {
    "id": "icon-welt-lagerplatz",
    "url": "assets/icons/welt/lagerplatz.png",
    "name": "Lagerplatz",
    "group": "Welt"
  },
  {
    "id": "icon-welt-l-ndlicher-friedhof",
    "url": "assets/icons/welt/l-ndlicher-friedhof.png",
    "name": "Ländlicher Friedhof",
    "group": "Welt"
  },
  {
    "id": "icon-welt-l-ndliche-universit-t",
    "url": "assets/icons/welt/l-ndliche-universit-t.png",
    "name": "Ländliche Universität",
    "group": "Welt"
  },
  {
    "id": "icon-welt-m-hle",
    "url": "assets/icons/welt/m-hle.png",
    "name": "Mühle",
    "group": "Welt"
  },
  {
    "id": "icon-welt-m-nzpr-ger",
    "url": "assets/icons/welt/m-nzpr-ger.png",
    "name": "Münzpräger",
    "group": "Welt"
  },
  {
    "id": "icon-welt-occulter-schrein",
    "url": "assets/icons/welt/occulter-schrein.png",
    "name": "Occulter Schrein",
    "group": "Welt"
  },
  {
    "id": "icon-welt-poststation",
    "url": "assets/icons/welt/poststation.png",
    "name": "Poststation",
    "group": "Welt"
  },
  {
    "id": "icon-welt-quelle",
    "url": "assets/icons/welt/quelle.png",
    "name": "Quelle",
    "group": "Welt"
  },
  {
    "id": "icon-welt-ritterlicheszelt",
    "url": "assets/icons/welt/ritterlicheszelt.png",
    "name": "RitterlichesZelt",
    "group": "Welt"
  },
  {
    "id": "icon-welt-salzmine",
    "url": "assets/icons/welt/salzmine.png",
    "name": "Salzmine",
    "group": "Welt"
  },
  {
    "id": "icon-welt-schie-stand2",
    "url": "assets/icons/welt/schie-stand2.png",
    "name": "Schießstand2",
    "group": "Welt"
  },
  {
    "id": "icon-welt-schiffswerft",
    "url": "assets/icons/welt/schiffswerft.png",
    "name": "Schiffswerft",
    "group": "Welt"
  },
  {
    "id": "icon-welt-schmuggler2",
    "url": "assets/icons/welt/schmuggler2.png",
    "name": "Schmuggler2",
    "group": "Welt"
  },
  {
    "id": "icon-welt-schmuggler3",
    "url": "assets/icons/welt/schmuggler3.png",
    "name": "Schmuggler3",
    "group": "Welt"
  },
  {
    "id": "icon-welt-sch-bigeh-tte",
    "url": "assets/icons/welt/sch-bigeh-tte.png",
    "name": "SchäbigeHütte",
    "group": "Welt"
  },
  {
    "id": "icon-welt-steinbruch-1",
    "url": "assets/icons/welt/steinbruch-1.png",
    "name": "Steinbruch (1)",
    "group": "Welt"
  },
  {
    "id": "icon-welt-tjostfeld",
    "url": "assets/icons/welt/tjostfeld.png",
    "name": "Tjostfeld",
    "group": "Welt"
  },
  {
    "id": "icon-welt-zerst-rtekirche2",
    "url": "assets/icons/welt/zerst-rtekirche2.png",
    "name": "ZerstörteKirche2",
    "group": "Welt"
  },
  {
    "id": "icon-welt-zerst-rtes-heim",
    "url": "assets/icons/welt/zerst-rtes-heim.png",
    "name": "Zerstörtes Heim",
    "group": "Welt"
  },
  {
    "id": "icon-welt-zerst-rte-br-cke",
    "url": "assets/icons/welt/zerst-rte-br-cke.png",
    "name": "Zerstörte Brücke",
    "group": "Welt"
  },
  {
    "id": "icon-welt-zerst-rte-kirche",
    "url": "assets/icons/welt/zerst-rte-kirche.png",
    "name": "Zerstörte Kirche",
    "group": "Welt"
  },
  {
    "id": "icon-welt-ziegelbrenner",
    "url": "assets/icons/welt/ziegelbrenner.png",
    "name": "Ziegelbrenner",
    "group": "Welt"
  },
  {
    "id": "icon-welt-zirkus3",
    "url": "assets/icons/welt/zirkus3.png",
    "name": "Zirkus3",
    "group": "Welt"
  },
  {
    "id": "icon-orte-alchemist",
    "url": "assets/icons/orte/alchemist.png",
    "name": "Alchemist",
    "group": "Orte"
  },
  {
    "id": "icon-orte-anschlagbrett",
    "url": "assets/icons/orte/anschlagbrett.png",
    "name": "Anschlagbrett",
    "group": "Orte"
  },
  {
    "id": "icon-orte-arena",
    "url": "assets/icons/orte/arena.png",
    "name": "Arena",
    "group": "Orte"
  },
  {
    "id": "icon-orte-arenapin",
    "url": "assets/icons/orte/arenapin.png",
    "name": "ArenaPin",
    "group": "Orte"
  },
  {
    "id": "icon-orte-arkanist",
    "url": "assets/icons/orte/arkanist.png",
    "name": "Arkanist",
    "group": "Orte"
  },
  {
    "id": "icon-orte-bankpin",
    "url": "assets/icons/orte/bankpin.png",
    "name": "BankPin",
    "group": "Orte"
  },
  {
    "id": "icon-orte-bauer",
    "url": "assets/icons/orte/bauer.png",
    "name": "Bauer",
    "group": "Orte"
  },
  {
    "id": "icon-orte-bauer-2",
    "url": "assets/icons/orte/bauer-2.png",
    "name": "Bauer",
    "group": "Orte"
  },
  {
    "id": "icon-orte-baumeister",
    "url": "assets/icons/orte/baumeister.png",
    "name": "Baumeister",
    "group": "Orte"
  },
  {
    "id": "icon-orte-befestigte-siedlung",
    "url": "assets/icons/orte/befestigte-siedlung.png",
    "name": "Befestigte Siedlung",
    "group": "Orte"
  },
  {
    "id": "icon-orte-bergbauer",
    "url": "assets/icons/orte/bergbauer.png",
    "name": "Bergbauer",
    "group": "Orte"
  },
  {
    "id": "icon-orte-bordell",
    "url": "assets/icons/orte/bordell.png",
    "name": "Bordell",
    "group": "Orte"
  },
  {
    "id": "icon-orte-brauer",
    "url": "assets/icons/orte/brauer.png",
    "name": "Brauer",
    "group": "Orte"
  },
  {
    "id": "icon-orte-buch",
    "url": "assets/icons/orte/buch.png",
    "name": "Buch",
    "group": "Orte"
  },
  {
    "id": "icon-orte-burgoderlehnswartodergarnison",
    "url": "assets/icons/orte/burgoderlehnswartodergarnison.png",
    "name": "BurgOderLehnswartOderGarnison",
    "group": "Orte"
  },
  {
    "id": "icon-orte-b-cker",
    "url": "assets/icons/orte/b-cker.png",
    "name": "Bäcker",
    "group": "Orte"
  },
  {
    "id": "icon-orte-b-cheverk-ufer",
    "url": "assets/icons/orte/b-cheverk-ufer.png",
    "name": "Bücheverkäufer",
    "group": "Orte"
  },
  {
    "id": "icon-orte-chatgpt-image-19-dez-2025-12-54-13",
    "url": "assets/icons/orte/chatgpt-image-19-dez-2025-12-54-13.png",
    "name": "Anlegestelle",
    "group": "Orte"
  },
  {
    "id": "icon-orte-chatgpt-image-19-dez-2025-12-56-37",
    "url": "assets/icons/orte/chatgpt-image-19-dez-2025-12-56-37.png",
    "name": "Arena (Variante)",
    "group": "Orte"
  },
  {
    "id": "icon-orte-dimensionaler-riss",
    "url": "assets/icons/orte/dimensionaler-riss.png",
    "name": "Dimensionaler Riss",
    "group": "Orte"
  },
  {
    "id": "icon-orte-fischer",
    "url": "assets/icons/orte/fischer.png",
    "name": "Fischer",
    "group": "Orte"
  },
  {
    "id": "icon-orte-fleischer",
    "url": "assets/icons/orte/fleischer.png",
    "name": "Fleischer",
    "group": "Orte"
  },
  {
    "id": "icon-orte-florist",
    "url": "assets/icons/orte/florist.png",
    "name": "Florist",
    "group": "Orte"
  },
  {
    "id": "icon-orte-f-hre-steg-1",
    "url": "assets/icons/orte/f-hre-steg-1.png",
    "name": "Fähre-Steg (1)",
    "group": "Orte"
  },
  {
    "id": "icon-orte-f-hre-steg",
    "url": "assets/icons/orte/f-hre-steg.png",
    "name": "Fähre-Steg",
    "group": "Orte"
  },
  {
    "id": "icon-orte-f-rber",
    "url": "assets/icons/orte/f-rber.png",
    "name": "Färber",
    "group": "Orte"
  },
  {
    "id": "icon-orte-galgen",
    "url": "assets/icons/orte/galgen.png",
    "name": "Galgen",
    "group": "Orte"
  },
  {
    "id": "icon-orte-gasthof",
    "url": "assets/icons/orte/gasthof.png",
    "name": "Gasthof",
    "group": "Orte"
  },
  {
    "id": "icon-orte-gemini-generated-image-ucik90ucik90ucik",
    "url": "assets/icons/orte/gemini-generated-image-ucik90ucik90ucik.png",
    "name": "Gemini Generated Image ucik90ucik90ucik",
    "group": "Orte"
  },
  {
    "id": "icon-orte-gem-severk-ufer",
    "url": "assets/icons/orte/gem-severk-ufer.png",
    "name": "GemüseVerkäufer",
    "group": "Orte"
  },
  {
    "id": "icon-orte-gerber",
    "url": "assets/icons/orte/gerber.png",
    "name": "Gerber",
    "group": "Orte"
  },
  {
    "id": "icon-orte-gericht",
    "url": "assets/icons/orte/gericht.png",
    "name": "Gericht",
    "group": "Orte"
  },
  {
    "id": "icon-orte-gilde",
    "url": "assets/icons/orte/gilde.png",
    "name": "Gilde",
    "group": "Orte"
  },
  {
    "id": "icon-orte-glaser",
    "url": "assets/icons/orte/glaser.png",
    "name": "Glaser",
    "group": "Orte"
  },
  {
    "id": "icon-orte-graveyard",
    "url": "assets/icons/orte/graveyard.png",
    "name": "Graveyard",
    "group": "Orte"
  },
  {
    "id": "icon-orte-gro-es-weingut",
    "url": "assets/icons/orte/gro-es-weingut.png",
    "name": "Großes Weingut",
    "group": "Orte"
  },
  {
    "id": "icon-orte-hafen",
    "url": "assets/icons/orte/hafen.png",
    "name": "Hafen",
    "group": "Orte"
  },
  {
    "id": "icon-orte-hauptstadt",
    "url": "assets/icons/orte/hauptstadt.png",
    "name": "Hauptstadt",
    "group": "Orte"
  },
  {
    "id": "icon-orte-hei-e-quellen",
    "url": "assets/icons/orte/hei-e-quellen.png",
    "name": "Heiße Quellen",
    "group": "Orte"
  },
  {
    "id": "icon-orte-herberge",
    "url": "assets/icons/orte/herberge.png",
    "name": "Herberge",
    "group": "Orte"
  },
  {
    "id": "icon-orte-holzf-ller",
    "url": "assets/icons/orte/holzf-ller.png",
    "name": "Holzfäller",
    "group": "Orte"
  },
  {
    "id": "icon-orte-imker",
    "url": "assets/icons/orte/imker.png",
    "name": "Imker",
    "group": "Orte"
  },
  {
    "id": "icon-orte-instrumentmacher",
    "url": "assets/icons/orte/instrumentmacher.png",
    "name": "Instrumentmacher",
    "group": "Orte"
  },
  {
    "id": "icon-orte-juweliergoldschmied",
    "url": "assets/icons/orte/juweliergoldschmied.png",
    "name": "JuwelierGoldschmied",
    "group": "Orte"
  },
  {
    "id": "icon-orte-j-ger",
    "url": "assets/icons/orte/j-ger.png",
    "name": "Jäger",
    "group": "Orte"
  },
  {
    "id": "icon-orte-j-gerhaus",
    "url": "assets/icons/orte/j-gerhaus.png",
    "name": "Jägerhaus",
    "group": "Orte"
  },
  {
    "id": "icon-orte-kartograph",
    "url": "assets/icons/orte/kartograph.png",
    "name": "Kartograph",
    "group": "Orte"
  },
  {
    "id": "icon-orte-keramiker",
    "url": "assets/icons/orte/keramiker.png",
    "name": "Keramiker",
    "group": "Orte"
  },
  {
    "id": "icon-orte-kerker",
    "url": "assets/icons/orte/kerker.png",
    "name": "Kerker",
    "group": "Orte"
  },
  {
    "id": "icon-orte-kerzenmacher",
    "url": "assets/icons/orte/kerzenmacher.png",
    "name": "Kerzenmacher",
    "group": "Orte"
  },
  {
    "id": "icon-orte-kleruspin",
    "url": "assets/icons/orte/kleruspin.png",
    "name": "KlerusPin",
    "group": "Orte"
  },
  {
    "id": "icon-orte-kleruspin-2",
    "url": "assets/icons/orte/kleruspin-2.png",
    "name": "KlerusPin",
    "group": "Orte"
  },
  {
    "id": "icon-orte-kneipepin",
    "url": "assets/icons/orte/kneipepin.png",
    "name": "KneipePin",
    "group": "Orte"
  },
  {
    "id": "icon-orte-kreaturenhort",
    "url": "assets/icons/orte/kreaturenhort.png",
    "name": "Kreaturenhort",
    "group": "Orte"
  },
  {
    "id": "icon-orte-kr-uterkundiger",
    "url": "assets/icons/orte/kr-uterkundiger.png",
    "name": "Kräuterkundiger",
    "group": "Orte"
  },
  {
    "id": "icon-orte-k-hler",
    "url": "assets/icons/orte/k-hler.png",
    "name": "Köhler",
    "group": "Orte"
  },
  {
    "id": "icon-orte-lagerpin",
    "url": "assets/icons/orte/lagerpin.png",
    "name": "LagerPin",
    "group": "Orte"
  },
  {
    "id": "icon-orte-landgut",
    "url": "assets/icons/orte/landgut.png",
    "name": "Landgut",
    "group": "Orte"
  },
  {
    "id": "icon-orte-ledererpin",
    "url": "assets/icons/orte/ledererpin.png",
    "name": "LedererPin",
    "group": "Orte"
  },
  {
    "id": "icon-orte-leuchtturm-pin",
    "url": "assets/icons/orte/leuchtturm-pin.png",
    "name": "Leuchtturm Pin",
    "group": "Orte"
  },
  {
    "id": "icon-orte-marktpin",
    "url": "assets/icons/orte/marktpin.png",
    "name": "MarktPin",
    "group": "Orte"
  },
  {
    "id": "icon-orte-mine",
    "url": "assets/icons/orte/mine.png",
    "name": "Mine",
    "group": "Orte"
  },
  {
    "id": "icon-orte-m-hlepin",
    "url": "assets/icons/orte/m-hlepin.png",
    "name": "MühlePin",
    "group": "Orte"
  },
  {
    "id": "icon-orte-normalschmied",
    "url": "assets/icons/orte/normalschmied.png",
    "name": "NormalSchmied",
    "group": "Orte"
  },
  {
    "id": "icon-orte-obstplantage",
    "url": "assets/icons/orte/obstplantage.png",
    "name": "Obstplantage",
    "group": "Orte"
  },
  {
    "id": "icon-orte-officepin",
    "url": "assets/icons/orte/officepin.png",
    "name": "OfficePin",
    "group": "Orte"
  },
  {
    "id": "icon-orte-okkulter-schrein",
    "url": "assets/icons/orte/okkulter-schrein.png",
    "name": "Okkulter Schrein",
    "group": "Orte"
  },
  {
    "id": "icon-orte-orden",
    "url": "assets/icons/orte/orden.png",
    "name": "Orden",
    "group": "Orte"
  },
  {
    "id": "icon-orte-pechbrenner",
    "url": "assets/icons/orte/pechbrenner.png",
    "name": "Pechbrenner",
    "group": "Orte"
  },
  {
    "id": "icon-orte-pfeilmacher",
    "url": "assets/icons/orte/pfeilmacher.png",
    "name": "Pfeilmacher",
    "group": "Orte"
  },
  {
    "id": "icon-orte-pferdezuchtsiedlung",
    "url": "assets/icons/orte/pferdezuchtsiedlung.png",
    "name": "Pferdezuchtsiedlung",
    "group": "Orte"
  },
  {
    "id": "icon-orte-piraten",
    "url": "assets/icons/orte/piraten.png",
    "name": "Piraten",
    "group": "Orte"
  },
  {
    "id": "icon-orte-post",
    "url": "assets/icons/orte/post.png",
    "name": "Post",
    "group": "Orte"
  },
  {
    "id": "icon-orte-ritterorden",
    "url": "assets/icons/orte/ritterorden.png",
    "name": "Ritterorden",
    "group": "Orte"
  },
  {
    "id": "icon-orte-rosszucht",
    "url": "assets/icons/orte/rosszucht.png",
    "name": "Rosszucht",
    "group": "Orte"
  },
  {
    "id": "icon-orte-ruine",
    "url": "assets/icons/orte/ruine.png",
    "name": "Ruine",
    "group": "Orte"
  },
  {
    "id": "icon-orte-r-stungsschmiedpin",
    "url": "assets/icons/orte/r-stungsschmiedpin.png",
    "name": "RüstungsschmiedPin",
    "group": "Orte"
  },
  {
    "id": "icon-orte-schenkepin",
    "url": "assets/icons/orte/schenkepin.png",
    "name": "SchenkePin",
    "group": "Orte"
  },
  {
    "id": "icon-orte-schiff-gut",
    "url": "assets/icons/orte/schiff-gut.png",
    "name": "Schiff-Gut",
    "group": "Orte"
  },
  {
    "id": "icon-orte-schiffsbauerpin",
    "url": "assets/icons/orte/schiffsbauerpin.png",
    "name": "SchiffsbauerPin",
    "group": "Orte"
  },
  {
    "id": "icon-orte-schneider",
    "url": "assets/icons/orte/schneider.png",
    "name": "Schneider",
    "group": "Orte"
  },
  {
    "id": "icon-orte-schuster",
    "url": "assets/icons/orte/schuster.png",
    "name": "Schuster",
    "group": "Orte"
  },
  {
    "id": "icon-orte-segelmacher",
    "url": "assets/icons/orte/segelmacher.png",
    "name": "Segelmacher",
    "group": "Orte"
  },
  {
    "id": "icon-orte-seiler",
    "url": "assets/icons/orte/seiler.png",
    "name": "Seiler",
    "group": "Orte"
  },
  {
    "id": "icon-orte-spelunke",
    "url": "assets/icons/orte/spelunke.png",
    "name": "Spelunke",
    "group": "Orte"
  },
  {
    "id": "icon-orte-spielzeugmacherpin",
    "url": "assets/icons/orte/spielzeugmacherpin.png",
    "name": "Spielzeugmacherpin",
    "group": "Orte"
  },
  {
    "id": "icon-orte-statue",
    "url": "assets/icons/orte/statue.png",
    "name": "Statue",
    "group": "Orte"
  },
  {
    "id": "icon-orte-steinmetz",
    "url": "assets/icons/orte/steinmetz.png",
    "name": "Steinmetz",
    "group": "Orte"
  },
  {
    "id": "icon-orte-syndikat",
    "url": "assets/icons/orte/syndikat.png",
    "name": "Syndikat",
    "group": "Orte"
  },
  {
    "id": "icon-orte-s-gewerk",
    "url": "assets/icons/orte/s-gewerk.png",
    "name": "Sägewerk",
    "group": "Orte"
  },
  {
    "id": "icon-orte-tavernepin",
    "url": "assets/icons/orte/tavernepin.png",
    "name": "TavernePin",
    "group": "Orte"
  },
  {
    "id": "icon-orte-turnierplatz",
    "url": "assets/icons/orte/turnierplatz.png",
    "name": "Turnierplatz",
    "group": "Orte"
  },
  {
    "id": "icon-orte-t-pfer",
    "url": "assets/icons/orte/t-pfer.png",
    "name": "Töpfer",
    "group": "Orte"
  },
  {
    "id": "icon-orte-uhrenmacher",
    "url": "assets/icons/orte/uhrenmacher.png",
    "name": "Uhrenmacher",
    "group": "Orte"
  },
  {
    "id": "icon-orte-unterwasserstadt",
    "url": "assets/icons/orte/unterwasserstadt.png",
    "name": "Unterwasserstadt",
    "group": "Orte"
  },
  {
    "id": "icon-orte-verfluchter-ort",
    "url": "assets/icons/orte/verfluchter-ort.png",
    "name": "Verfluchter Ort",
    "group": "Orte"
  },
  {
    "id": "icon-orte-viehzucht",
    "url": "assets/icons/orte/viehzucht.png",
    "name": "Viehzucht",
    "group": "Orte"
  },
  {
    "id": "icon-orte-wachepin",
    "url": "assets/icons/orte/wachepin.png",
    "name": "WachePin",
    "group": "Orte"
  },
  {
    "id": "icon-orte-waffenschmiedpin",
    "url": "assets/icons/orte/waffenschmiedpin.png",
    "name": "WaffenschmiedPin",
    "group": "Orte"
  },
  {
    "id": "icon-orte-wagenmacher",
    "url": "assets/icons/orte/wagenmacher.png",
    "name": "Wagenmacher",
    "group": "Orte"
  },
  {
    "id": "icon-orte-wahrzeichen",
    "url": "assets/icons/orte/wahrzeichen.png",
    "name": "Wahrzeichen",
    "group": "Orte"
  },
  {
    "id": "icon-orte-waldschrat",
    "url": "assets/icons/orte/waldschrat.png",
    "name": "Waldschrat",
    "group": "Orte"
  },
  {
    "id": "icon-orte-weide",
    "url": "assets/icons/orte/weide.png",
    "name": "Weide",
    "group": "Orte"
  },
  {
    "id": "icon-orte-weingut",
    "url": "assets/icons/orte/weingut.png",
    "name": "Weingut",
    "group": "Orte"
  },
  {
    "id": "icon-orte-windreiterpin",
    "url": "assets/icons/orte/windreiterpin.png",
    "name": "WindreiterPin",
    "group": "Orte"
  },
  {
    "id": "icon-orte-wolle",
    "url": "assets/icons/orte/wolle.png",
    "name": "Wolle",
    "group": "Orte"
  },
  {
    "id": "icon-orte-zerst-rte-siedlung",
    "url": "assets/icons/orte/zerst-rte-siedlung.png",
    "name": "Zerstörte Siedlung",
    "group": "Orte"
  },
  {
    "id": "icon-orte-zimmermann",
    "url": "assets/icons/orte/zimmermann.png",
    "name": "Zimmermann",
    "group": "Orte"
  },
  {
    "id": "icon-orte-zoll-grenzposten",
    "url": "assets/icons/orte/zoll-grenzposten.png",
    "name": "Zoll - Grenzposten",
    "group": "Orte"
  },
  {
    "id": "icon-orte-zuberhauspin",
    "url": "assets/icons/orte/zuberhauspin.png",
    "name": "ZuberhausPin",
    "group": "Orte"
  },
  {
    "id": "icon-universal-fianna",
    "url": "assets/icons/universal/fianna.png",
    "name": "Fianna",
    "group": "Universal"
  },
  {
    "id": "icon-universal-gaumenfreude",
    "url": "assets/icons/universal/gaumenfreude.png",
    "name": "Gaumenfreude",
    "group": "Universal"
  },
  {
    "id": "icon-universal-gemischtwarenh-ndler",
    "url": "assets/icons/universal/gemischtwarenh-ndler.png",
    "name": "Gemischtwarenhändler",
    "group": "Universal"
  },
  {
    "id": "icon-universal-jandelssiedlung",
    "url": "assets/icons/universal/jandelssiedlung.png",
    "name": "Jandelssiedlung",
    "group": "Universal"
  },
  {
    "id": "icon-universal-piraten",
    "url": "assets/icons/universal/piraten.png",
    "name": "Piraten",
    "group": "Universal"
  },
  {
    "id": "icon-universal-plantage",
    "url": "assets/icons/universal/plantage.png",
    "name": "Plantage",
    "group": "Universal"
  },
  {
    "id": "icon-universal-rebstock",
    "url": "assets/icons/universal/rebstock.png",
    "name": "Rebstock",
    "group": "Universal"
  },
  {
    "id": "icon-universal-winzer",
    "url": "assets/icons/universal/winzer.png",
    "name": "Winzer",
    "group": "Universal"
  },
  {
    "id": "icon-universal-winzer-2",
    "url": "assets/icons/universal/winzer-2.png",
    "name": "Winzer",
    "group": "Universal"
  },
  {
    "id": "icon-gilden-orden-blutbundpin",
    "url": "assets/icons/gilden-orden/blutbundpin.png",
    "name": "BlutbundPin",
    "group": "Gilden & Orden"
  },
  {
    "id": "icon-gilden-orden-federkielpin",
    "url": "assets/icons/gilden-orden/federkielpin.png",
    "name": "FederkielPin",
    "group": "Gilden & Orden"
  },
  {
    "id": "icon-gilden-orden-fianna",
    "url": "assets/icons/gilden-orden/fianna.png",
    "name": "Fianna",
    "group": "Gilden & Orden"
  },
  {
    "id": "icon-gilden-orden-jagdklingen",
    "url": "assets/icons/gilden-orden/jagdklingen.png",
    "name": "Jagdklingen",
    "group": "Gilden & Orden"
  },
  {
    "id": "icon-gilden-orden-jagdklingenpin",
    "url": "assets/icons/gilden-orden/jagdklingenpin.png",
    "name": "JagdklingenPIn",
    "group": "Gilden & Orden"
  },
  {
    "id": "icon-gilden-orden-klingendem-nzepin",
    "url": "assets/icons/gilden-orden/klingendem-nzepin.png",
    "name": "KlingendeMünzePin",
    "group": "Gilden & Orden"
  },
  {
    "id": "icon-gilden-orden-lilien",
    "url": "assets/icons/gilden-orden/lilien.png",
    "name": "Lilien",
    "group": "Gilden & Orden"
  },
  {
    "id": "icon-gilden-orden-marktderfortunapin",
    "url": "assets/icons/gilden-orden/marktderfortunapin.png",
    "name": "MarktderFortunapin",
    "group": "Gilden & Orden"
  },
  {
    "id": "icon-gilden-orden-m-wensangpin",
    "url": "assets/icons/gilden-orden/m-wensangpin.png",
    "name": "MöwensangPin",
    "group": "Gilden & Orden"
  },
  {
    "id": "icon-gilden-orden-m-wensangpin-2",
    "url": "assets/icons/gilden-orden/m-wensangpin-2.png",
    "name": "MöwensangPin",
    "group": "Gilden & Orden"
  },
  {
    "id": "icon-gilden-orden-richterpin",
    "url": "assets/icons/gilden-orden/richterpin.png",
    "name": "RichterPin",
    "group": "Gilden & Orden"
  },
  {
    "id": "icon-gilden-orden-r-sserrhosmerepin",
    "url": "assets/icons/gilden-orden/r-sserrhosmerepin.png",
    "name": "RösserRhosmerepin",
    "group": "Gilden & Orden"
  },
  {
    "id": "icon-gilden-orden-schwanenorden",
    "url": "assets/icons/gilden-orden/schwanenorden.png",
    "name": "Schwanenorden",
    "group": "Gilden & Orden"
  },
  {
    "id": "icon-gilden-orden-windreiterpin",
    "url": "assets/icons/gilden-orden/windreiterpin.png",
    "name": "WindreiterPin",
    "group": "Gilden & Orden"
  },
  {
    "id": "icon-gilden-orden-windreiterpin-2",
    "url": "assets/icons/gilden-orden/windreiterpin-2.png",
    "name": "WindreiterPin",
    "group": "Gilden & Orden"
  },
  {
    "id": "icon-gilden-orden-wolkenderd-mmerungpin",
    "url": "assets/icons/gilden-orden/wolkenderd-mmerungpin.png",
    "name": "WolkenderDämmerungPin",
    "group": "Gilden & Orden"
  },
  {
    "id": "icon-gottheiten-aelthar",
    "url": "assets/icons/gottheiten/aelthar.png",
    "name": "aelthar",
    "group": "Gottheiten"
  },
  {
    "id": "icon-gottheiten-baldran",
    "url": "assets/icons/gottheiten/baldran.png",
    "name": "baldran",
    "group": "Gottheiten"
  },
  {
    "id": "icon-gottheiten-kharon",
    "url": "assets/icons/gottheiten/kharon.png",
    "name": "kharon",
    "group": "Gottheiten"
  },
  {
    "id": "icon-gottheiten-lyris",
    "url": "assets/icons/gottheiten/lyris.png",
    "name": "lyris",
    "group": "Gottheiten"
  },
  {
    "id": "icon-gottheiten-maldras",
    "url": "assets/icons/gottheiten/maldras.png",
    "name": "maldras",
    "group": "Gottheiten"
  },
  {
    "id": "icon-gottheiten-mariel",
    "url": "assets/icons/gottheiten/mariel.png",
    "name": "mariel",
    "group": "Gottheiten"
  },
  {
    "id": "icon-gottheiten-nimue",
    "url": "assets/icons/gottheiten/nimue.png",
    "name": "nimue",
    "group": "Gottheiten"
  },
  {
    "id": "icon-gottheiten-ordan",
    "url": "assets/icons/gottheiten/ordan.png",
    "name": "ordan",
    "group": "Gottheiten"
  },
  {
    "id": "icon-gottheiten-orin",
    "url": "assets/icons/gottheiten/orin.png",
    "name": "orin",
    "group": "Gottheiten"
  },
  {
    "id": "icon-gottheiten-rhea",
    "url": "assets/icons/gottheiten/rhea.png",
    "name": "rhea",
    "group": "Gottheiten"
  },
  {
    "id": "icon-gottheiten-sylvana",
    "url": "assets/icons/gottheiten/sylvana.png",
    "name": "sylvana",
    "group": "Gottheiten"
  },
  {
    "id": "icon-gottheiten-tharim",
    "url": "assets/icons/gottheiten/tharim.png",
    "name": "tharim",
    "group": "Gottheiten"
  },
  {
    "id": "icon-gottheiten-thyrael",
    "url": "assets/icons/gottheiten/thyrael.png",
    "name": "thyrael",
    "group": "Gottheiten"
  },
  {
    "id": "icon-gottheiten-zephyr",
    "url": "assets/icons/gottheiten/zephyr.png",
    "name": "zephyr",
    "group": "Gottheiten"
  }
];
