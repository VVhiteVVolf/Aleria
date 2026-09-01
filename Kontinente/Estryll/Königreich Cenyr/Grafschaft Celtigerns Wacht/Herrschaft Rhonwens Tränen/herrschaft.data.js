(function () {
  "use strict";

  const data = window.ALERIA_HERRSCHAFT_DATA;
  if (!data) throw new Error("Herrschafts-Datenhelfer wurde nicht geladen.");

  const familyTreePage = data.familyTreePage;
  const houseRoot = "/Stammbäume/assets/images/houses/Rhonwens%20Tränen";
  const portraitRoot = "/Stammbäume/assets/images/portraits/haus-arwydd";
  const banner = "/Stammbäume/assets/images/regions/rhonwens-traenen.png";
  const mapImage = "/Kontinente/assets/images/celtigerns-wacht-map-preview.jpg";
  const mapHref = "/Karten/karte.html?map=cenyr-celtigerns-wacht";
  const parentHref = "../Grafschaft%20Celtigerns%20Wacht.html";

  const familySections = Object.freeze([
    data.familySection("Adelshaus", [
      data.family("Arwydd", {
        familyId: "haus-arwydd",
        imageSrc: `${houseRoot}/haus-arwydd.png`,
        seat: "Castellbryn",
        liege: "Draig",
        featured: true,
      }),
    ]),
    data.familySection("Ritterhäuser", [
      data.family("Gwared", { familyId: "haus-gwared", imageSrc: `${houseRoot}/Ritterliche/Gwared.png`, seat: "Castellbryn", liege: "Arwydd" }),
      data.family("Rhenna", { familyId: "haus-rhenna", imageSrc: `${houseRoot}/Ritterliche/Rhenna.png`, seat: "Rhonwens Tränen", liege: "Arwydd" }),
      data.family("Madryn", { familyId: "haus-madryn", imageSrc: `${houseRoot}/Ritterliche/Madryn.png`, seat: "Rhonwens Tränen", liege: "Arwydd" }),
      data.family("Talinvyr", { familyId: "haus-talinvyr", imageSrc: `${houseRoot}/Ritterliche/Talinvyr.png`, seat: "Rhonwens Tränen", liege: "Arwydd" }),
      data.family("Merek", { familyId: "haus-merek", imageSrc: `${houseRoot}/Ritterliche/Merek.png`, seat: "Rhonwens Tränen", liege: "Arwydd" }),
    ]),
    data.familySection("Ausgestorbene Häuser", [
      data.family("Illysywen", { familyId: "haus-illysywen", imageSrc: `${houseRoot}/haus-illysywen.png`, seat: "Castellbryn", liege: "..." }),
      data.family("Skellor", { familyId: "haus-skellor", imageSrc: `${houseRoot}/Ausgestorben/Skellor.png`, seat: "Rhonwens Tränen", liege: "..." }),
      data.family("Morveth", { familyId: "haus-morveth", imageSrc: `${houseRoot}/Ausgestorben/Morveth.png`, seat: "Rhonwens Tränen", liege: "..." }),
    ], { variant: "extinct" }),
  ]);

  const councilGroups = Object.freeze([
    data.personGroup("Ritterfürst", [
      data.person("Ritterfürst von Rhonwens Tränen", "Idris Arwydd", {
        imageSrc: `${portraitRoot}/idris-arwydd.jpg`,
        familyId: "haus-arwydd",
        seat: "Castellbryn",
        featured: true,
      }),
    ]),
    data.personGroup("Ratsämter", [
      data.person("Marschall des Ritterfürsten", "Ianto Arwydd", {
        imageSrc: `${portraitRoot}/ianto-arwydd.jpg`,
        familyId: "haus-arwydd",
      }),
      data.person("Kämmerer des Ritterfürsten", "..."),
      data.person("Justiziarin des Ritterfürsten", "Deliah Mwyalchen", {
        imageSrc: `${portraitRoot}/deliah-mwyalchen.jpg`,
        familyId: "haus-arwydd",
      }),
      data.person("Schatten des Ritterfürsten", "..."),
      data.person("Herold des Ritterfürsten", "Tecwyn Draig", {
        imageSrc: `${portraitRoot}/tecwyn-draig.jpg`,
        familyId: "haus-draig",
      }),
      data.person("Ratsmagier des Ritterfürsten", "..."),
      data.person("Vikar des Ritterfürsten", "..."),
      data.person("Barde des Ritterfürsten", "..."),
    ]),
  ]);

  const vassalGroups = Object.freeze([
    data.personGroup("Vasallen", [
      data.person("Vasall", "...", { seat: "Tân Gwaelon" }),
      data.person("Vasall", "...", { seat: "Morfael" }),
      data.person("Vasall", "...", { seat: "Traethgwen" }),
      data.person("Vasall", "...", { seat: "Glasfryn" }),
      data.person("Vasall", "...", { seat: "Côr Llynfael" }),
      data.person("Vasall", "...", { seat: "Côr Erynddwyn" }),
      data.person("Vasall", "...", { seat: "Ffynnoncoed" }),
      data.person("Vasall", "...", { seat: "Tŵr Dreathmor" }),
      data.person("Vasall", "...", { seat: "Tŵr Bryncarw" }),
      data.person("Vasall", "...", { seat: "Tŵr Creigfryn" }),
      data.person("Vasall", "...", { seat: "Tŵr Gwaunfaen" }),
    ]),
  ]);

  const geography = Object.freeze({
    map: Object.freeze({
      title: "Karte von Rhonwens Tränen",
      imageSrc: mapImage,
      imageAlt: "Karte von Celtigerns Wacht mit Rhonwens Tränen",
      href: mapHref,
    }),
    domain: Object.freeze({
      title: "Herrschaft der Arwydd",
      center: "Castellbryn",
      crestSrc: banner,
      crestAlt: "Banner der Herrschaft Rhonwens Tränen",
      sections: Object.freeze([
        Object.freeze({
          title: "Siedlungen und Orte",
          places: Object.freeze([
            data.place("Tân Gwaelon", "Hafensiedlung", "Hafensiedlung.png"),
            data.place("Morfael", "Siedlung", "Bauernsiedlung.png"),
            data.place("Traethgwen", "Siedlung", "Bauernsiedlung.png"),
            data.place("Glasfryn", "Siedlung", "Bauernsiedlung.png"),
            data.place("Côr Llynfael", "Befestigte Siedlung", "Befestigte Siedlung.png"),
            data.place("Côr Erynddwyn", "Befestigte Siedlung", "Befestigte Siedlung.png"),
            data.place("Ffynnoncoed", "Waldsiedlung", "Waldsiedlung.png"),
            data.place("Talheli", "Hafensiedlung", "Hafensiedlung.png"),
            data.place("Tŵr Bryncarw", "Turm", "Turm.png"),
            data.place("Tŵr Creigfryn", "Turm", "Turm.png"),
            data.place("Tŵr Gwaunfaen", "Turm", "Turm.png"),
            data.place("Tŵr Caerlan", "Turm", "Turm.png"),
            data.place("Tŵr Tidemor", "Turm", "Turm.png"),
            data.place("Tŵr Dreathmor", "Turm", "Turm.png"),
          ]),
        }),
        Object.freeze({
          title: "Sonstige Orte",
          places: Object.freeze([
            data.place("Schiffswrack", "Wrack", "SchiffswrackPin.png"),
            data.place("Achatorden", "Orden", "Heiligtum.png"),
            data.place("Wellenschnitter", "Wahrzeichen", "Wahrzeichen.png"),
            data.place("Ath Fynach", "Heiligtum", "Heiligtum2.png"),
          ]),
        }),
      ]),
    }),
  });

  window.KONTINENTE_DATA = {
    meta: {
      id: "herrschaft-rhonwens-traenen",
      title: "Herrschaft Rhonwens Tränen - Aleria",
      type: "Herrschaft",
      status: "Entwurf",
      template: "herrschaft",
    },
    name: "Herrschaft Rhonwens Tränen",
    canonicalPath: "Kontinente > Estryll > Königreich Cenyr > Grafschaft Celtigerns Wacht > Herrschaft Rhonwens Tränen",
    hierarchy: [
      { type: "Sammlung", name: "Kontinente", slug: "kontinente" },
      { type: "Kontinent", name: "Estryll", slug: "estryll" },
      { type: "Königreich", name: "Cenyr", slug: "cenyr" },
      { type: "Grafschaft", name: "Celtigerns Wacht", slug: "celtigerns-wacht" },
      { type: "Herrschaft", name: "Rhonwens Tränen", slug: "rhonwens-traenen" },
    ],
    view: {
      familyTreePage,
      familySections,
      councilGroups,
      vassalGroups,
      administration: data.administration(),
      geography,
      article: {
        id: "herrschaft-rhonwens-traenen",
        title: "Herrschaft Rhonwens Tränen",
        shortTitle: "Rhonwens Tränen",
        crestSrc: banner,
        crestAlt: "Banner der Herrschaft Rhonwens Tränen",
        kicker: "Die Inselwacht der Arwydd",
        parentHref,
        parentLabel: "Celtigerns Wacht",
        map: {
          imageSrc: mapImage,
          imageAlt: "Karte von Celtigerns Wacht",
          href: mapHref,
        },
        infobox: [
          { title: "Allgemein", rows: [
            { label: "Name", value: "Herrschaft Rhonwens Tränen" },
            { label: "Typ", value: "Herrschaft" },
            { label: "Oberhaupt", value: "Idris Arwydd", href: `${familyTreePage}?family=haus-arwydd&mode=view` },
            { label: "Hauptstadt", value: "Castellbryn" },
            { label: "Lehnsherrschaft", value: "Grafschaft Celtigerns Wacht", href: parentHref },
          ] },
          { title: "Geographie", rows: [
            { label: "Region", value: "Königreich Cenyr" },
            { label: "Klima", value: "Rau, kühl und windig" },
            { label: "Fauna", value: "..." },
            { label: "Flora", value: "..." },
          ] },
          { title: "Kultur", rows: [
            { label: "Volksgruppen", value: "Cenyri" },
            { label: "Religion", value: "Alerische Kirche" },
          ] },
          { title: "Handel", rows: [
            { label: "Schwerpunkte", value: "Fischerei, Schiffbau und Seehandel" },
            { label: "Ressourcen", value: "Fisch, Salzfisch, Tauwerk und Schiffsbedarf" },
          ] },
        ],
        copy: {
          overview: [
            "Die Arwydd sind ein aufstrebendes Rittergeschlecht, das sich durch Loyalität und Tapferkeit einen Platz im Adel von Celtigerns Wacht erkämpft hat.",
          ],
          history: [
            "Ursprünglich einfache Ritter, stiegen die Arwydd während des Krieges gegen das rebellische Haus Illysywen auf, das sich gegen die Draig gestellt hatte. Nach dem Sieg wurden sie für ihre Verdienste belohnt und erhielten die Kontrolle über Rhonwens Tränen, eine bedeutende Inselgruppe vor der Küste.",
          ],
          culture: [
            "Die Bewohner Rhonwens Tränen sind ein hart arbeitendes und anpassungsfähiges Volk, geprägt von der rauen Küstenlandschaft und dem Inselleben. Viele leben von Fischerei, Schiffbau und Handel. Ihre Verbundenheit zum Meer ist tief im täglichen Leben verankert.",
            "Die Inselbewohner gelten als pragmatisch und selbstständig. Das Leben auf den Inseln hat sie gelehrt, mit begrenzten Ressourcen umzugehen und sich den Launen des Ozeans anzupassen.",
          ],
          economy: [
            "Die Wirtschaft Rhonwens Tränen beruht vor allem auf Fischerei, Schiffbau und Handel. Die reichen Fischgründe versorgen die Inseln ebenso wie die Küstenregionen Celtigerns Wacht mit frischem und konserviertem Fisch.",
            "Die örtlichen Werften bauen robuste Fischerboote, Handelsschiffe und gelegentlich Kriegsschiffe für die Verteidigung der Inseln. Besonders geschätzt werden schnelle und wendige Schiffe, die den stürmischen Gewässern gewachsen sind.",
            "Über feste Handelsrouten werden Salzfisch, Tauwerk und handgefertigter Schiffsbedarf in benachbarte Küstenstädte ausgeführt. Trotz der abgelegenen Lage sichert dieser Handel der Herrschaft einen beständigen Wohlstand.",
          ],
          defense: [
            "Die Verteidigung der Inselgruppe bleibt eine ständige Herausforderung. Das Haus Arwydd ist seit dem Krieg gegen Illysywen stark ausgedünnt, und die Bevölkerung wurde durch Konflikte und Überfälle dezimiert. Abgelegene Orte und kleinere Inseln bleiben daher anfällig für Piraten und andere Bedrohungen vom Meer.",
            "Die erfahrenen und loyalen Kräfte der Arwydd konzentrieren sich auf Castellbryn und die größeren Häfen. Küstenorte und kleinere Dörfer müssen sich häufig selbst schützen, wodurch die Sicherheit innerhalb der Herrschaft ungleich verteilt ist.",
          ],
          geography: ["Rhonwens Tränen bilden eine Inselgruppe vor der Küste Celtigerns Wacht. Castellbryn ist ihr politisches und militärisches Zentrum."],
          flora: ["..."],
          trivia: ["..."],
        },
      },
    },
  };

  window.ORT_DATA = window.KONTINENTE_DATA;
})();
