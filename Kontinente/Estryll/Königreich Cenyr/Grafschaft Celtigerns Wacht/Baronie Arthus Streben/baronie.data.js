(function () {
  "use strict";

  const data = window.ALERIA_HERRSCHAFT_DATA;
  if (!data) throw new Error("Herrschafts-Datenhelfer wurde nicht geladen.");

  const familyTreePage = data.familyTreePage;
  const houseRoot = "/Stammbäume/assets/images/houses/Artus Streben";
  const portraitRoot = "/Stammbäume/assets/images/portraits";
  const banner = "/Stammbäume/assets/images/regions/artus-streben.png";
  const mapImage = "/Kontinente/assets/images/celtigerns-wacht-map-preview.jpg";
  const mapHref = "/Karten/karte.html?map=cenyr-celtigerns-wacht";
  const parentHref = "../Grafschaft%20Celtigerns%20Wacht.html";

  const familySections = Object.freeze([
    data.familySection("Adelshaus", [
      data.family("Gwefrydd", {
        familyId: "haus-gwefrydd",
        imageSrc: `${houseRoot}/haus-gwefrydd.png`,
        seat: "Rhosmere",
        liege: "Draig",
        featured: true,
      }),
    ]),
    data.familySection("Ritterhäuser", [
      data.family("Almarch", { familyId: "haus-almarch", imageSrc: `${houseRoot}/Niedere Ritterliche/Almarch.png`, seat: "Rhosmere", liege: "Gwefrydd" }),
      data.family("Brinmarch", { familyId: "haus-brinmarch", imageSrc: `${houseRoot}/Niedere Ritterliche/Brinmarch.png`, seat: "Rhosmere", liege: "Gwefrydd" }),
      data.family("Gwardin", { familyId: "haus-gwardin", imageSrc: `${houseRoot}/Niedere Ritterliche/Gwardin.png`, seat: "Rhosmere", liege: "Gwefrydd" }),
      data.family("Tirwyn", { familyId: "haus-tirwyn", imageSrc: `${houseRoot}/Niedere Ritterliche/Tirwyn.png`, seat: "Rhosmere", liege: "Gwefrydd" }),
      data.family("Eirfael", { familyId: "haus-eirfael", imageSrc: `${houseRoot}/Niedere Ritterliche/Eirfael.png`, seat: "Rhosmere", liege: "Gwefrydd" }),
      data.family("Ghorswyn", { familyId: "haus-ghorswyn", imageSrc: `${houseRoot}/Niedere Ritterliche/Ghorswyn.png`, seat: "Rhosmere", liege: "Gwefrydd" }),
      data.family("Coedvarn", { familyId: "haus-coedvarn", imageSrc: `${houseRoot}/Niedere Ritterliche/Coedvarn.png`, seat: "Rhosmere", liege: "Gwefrydd" }),
      data.family("Althin", { familyId: "haus-althin", imageSrc: `${houseRoot}/Niedere Ritterliche/Althin.png`, seat: "Rhosmere", liege: "Gwefrydd" }),
      data.family("Talmeirch", { familyId: "haus-talmeirch", imageSrc: `${houseRoot}/Niedere Ritterliche/Talmeirch.png`, seat: "Rhosmere", liege: "Gwefrydd" }),
      data.family("Gwynrhos", { familyId: "haus-gwynrhos", imageSrc: `${houseRoot}/Niedere Ritterliche/Gwynrhos.png`, seat: "Rhosmere", liege: "Gwefrydd" }),
    ]),
    data.familySection("Bürgerliche Häuser", [
      data.family("Iorwen", { familyId: "haus-iorwen", imageSrc: `${houseRoot}/Bürgerliche/Iorwen.png`, seat: "Rhosmere", liege: "Gwefrydd" }),
      data.family("Bekab", { familyId: "haus-bekab", imageSrc: `${houseRoot}/Bürgerliche/Bekab.png`, seat: "Rhosmere", liege: "Gwefrydd" }),
      data.family("Rhen", { familyId: "haus-rhen", imageSrc: `${houseRoot}/Bürgerliche/Rhen.png`, seat: "Rhosmere", liege: "Gwefrydd" }),
      data.family("Maethan", { familyId: "haus-maethan", imageSrc: `${houseRoot}/Bürgerliche/Maethan.png`, seat: "Rhosmere", liege: "Gwefrydd" }),
    ]),
  ]);

  const councilGroups = Object.freeze([
    data.personGroup("Baron", [
      data.person("Baron von Arthus Streben", "Stennis Gwefrydd", {
        imageSrc: `${portraitRoot}/haus-gwefrydd/stennis-gwefrydd.jpg`,
        familyId: "haus-gwefrydd",
        seat: "Rhosmere",
        featured: true,
      }),
    ]),
    data.personGroup("Ratsämter", [
      data.person("Marschall des Barons", "Thomos Gwefrydd", {
        imageSrc: `${portraitRoot}/haus-gwyvern/thomos-gwefrydd.jpg`,
        familyId: "haus-gwefrydd",
      }),
      data.person("Kämmerer des Barons", "..."),
      data.person("Justiziar des Barons", "..."),
      data.person("Schatten des Barons", "..."),
      data.person("Herold des Barons", "..."),
      data.person("Ratsmagierin des Barons", "Maelona Gwefrydd", {
        imageSrc: `${portraitRoot}/haus-gwefrydd/maelona-ceirwyn.jpg`,
        familyId: "haus-gwefrydd",
      }),
      data.person("Vikar des Barons", "..."),
      data.person("Barde des Barons", "..."),
    ]),
    data.personGroup("Ritterfürst", [
      data.person("Ritterfürst von Rhosmere", "...", {
        imageSrc: "/Stammbäume/assets/images/placeholders/male.png",
        seat: "Rhosmere",
      }),
    ]),
  ]);

  const vassalGroups = Object.freeze([
    data.personGroup("Vasallen", [
      data.person("Vasall", "...", { seat: "Tŵr Coedlorn" }),
      data.person("Vasall", "...", { seat: "Llyswynfa" }),
      data.person("Vasall", "...", { seat: "Gwaulhir" }),
      data.person("Vasall", "...", { seat: "Ffyncairglyn" }),
      data.person("Vasall", "...", { seat: "Braichwaun" }),
      data.person("Vasall", "...", { seat: "Ffynnonbrynn" }),
      data.person("Vasall", "...", { seat: "Caorthdar" }),
      data.person("Vasall", "...", { seat: "Côr Bronwen" }),
      data.person("Vasall", "...", { seat: "Côr Glasfaen" }),
    ]),
  ]);

  const geography = Object.freeze({
    map: Object.freeze({
      title: "Karte der Baronie Arthus Streben",
      imageSrc: mapImage,
      imageAlt: "Karte von Celtigerns Wacht mit der Baronie Arthus Streben",
      href: mapHref,
    }),
    domain: Object.freeze({
      title: "Herrschaft von Rhosmere",
      center: "Rhosmere",
      crestSrc: banner,
      crestAlt: "Banner der Baronie Arthus Streben",
      sections: Object.freeze([
        Object.freeze({
          title: "Siedlungen und Orte",
          places: Object.freeze([
            data.place("Tŵr Coedlorn", "Turm", "Turm.png"),
            data.place("Llyswynfa", "Siedlung", "Bauernsiedlung.png"),
            data.place("Gwaulhir", "Siedlung", "Bauernsiedlung.png"),
            data.place("Ffyncairglyn", "Waldsiedlung", "Waldsiedlung.png"),
            data.place("Braichwaun", "Waldsiedlung", "Waldsiedlung.png"),
            data.place("Ffynnonbrynn", "Waldsiedlung", "Waldsiedlung.png"),
            data.place("Caorthdar", "Waldsiedlung", "Waldsiedlung.png"),
            data.place("Côr Bronwen", "Befestigte Siedlung", "Befestigte Siedlung.png"),
            data.place("Côr Glasfaen", "Befestigte Siedlung", "Befestigte Siedlung.png"),
            data.place("Nantaur", "Bergbausiedlung", "Bergbausiedlung.png"),
            data.place("Rhuddor", "Bergbausiedlung", "Bergbausiedlung.png"),
            data.place("Castell Rhoswen", "Burg", "Kleine Burg.png"),
          ]),
        }),
        Object.freeze({
          title: "Sonstige Orte",
          places: Object.freeze([
            data.place("Bernsteingrotte", "Höhle", "Höhle.png"),
            data.place("Blutfels", "Höhle", "Höhle.png"),
            data.place("Nebelgrotte", "Höhle", "Höhle.png"),
            data.place("Broncelyn", "Rhosmeres Rösser", "Gestüt.png"),
            data.place("Turnierplatz", "Turnierfeld", "Turnierplatz.png"),
          ]),
        }),
      ]),
    }),
  });

  window.KONTINENTE_DATA = {
    meta: {
      id: "baronie-arthus-streben",
      title: "Baronie Arthus Streben - Aleria",
      type: "Baronie",
      status: "Entwurf",
      template: "herrschaft",
    },
    name: "Baronie Arthus Streben",
    canonicalPath: "Kontinente > Estryll > Königreich Cenyr > Grafschaft Celtigerns Wacht > Baronie Arthus Streben",
    hierarchy: [
      { type: "Sammlung", name: "Kontinente", slug: "kontinente" },
      { type: "Kontinent", name: "Estryll", slug: "estryll" },
      { type: "Königreich", name: "Cenyr", slug: "cenyr" },
      { type: "Grafschaft", name: "Celtigerns Wacht", slug: "celtigerns-wacht" },
      { type: "Baronie", name: "Arthus Streben", slug: "arthus-streben" },
    ],
    view: {
      familyTreePage,
      familySections,
      councilGroups,
      vassalGroups,
      administration: data.administration(),
      geography,
      article: {
        id: "baronie-arthus-streben",
        title: "Baronie Arthus Streben",
        shortTitle: "Arthus Streben",
        crestSrc: banner,
        crestAlt: "Banner der Baronie Arthus Streben",
        kicker: "Die Rösserherren von Rhosmere",
        parentHref,
        parentLabel: "Celtigerns Wacht",
        map: {
          imageSrc: mapImage,
          imageAlt: "Karte von Celtigerns Wacht",
          href: mapHref,
        },
        infobox: [
          { title: "Allgemein", rows: [
            { label: "Name", value: "Baronie Arthus Streben" },
            { label: "Typ", value: "Baronie" },
            { label: "Oberhaupt", value: "Stennis Gwefrydd", href: `${familyTreePage}?family=haus-gwefrydd&mode=view` },
            { label: "Hauptstadt", value: "Rhosmere" },
            { label: "Lehnsherrschaft", value: "Grafschaft Celtigerns Wacht", href: parentHref },
          ] },
          { title: "Geographie", rows: [
            { label: "Region", value: "Königreich Cenyr" },
            { label: "Klima", value: "..." },
            { label: "Fauna", value: "..." },
            { label: "Flora", value: "..." },
          ] },
          { title: "Kultur", rows: [
            { label: "Volksgruppen", value: "Cenyri" },
            { label: "Religion", value: "Alerische Kirche" },
          ] },
          { title: "Handel", rows: [
            { label: "Schwerpunkte", value: "Pferdezucht, Landwirtschaft und Reiterhandwerk" },
            { label: "Ressourcen", value: "Rösser, Hafer, Heu, Gerste und Vieh" },
          ] },
        ],
        copy: {
          overview: [
            "Die Baronie Arthus Streben, regiert vom Haus Gwefrydd, liegt im westlichen Teil der Grafschaft Celtigerns Wacht. Zentrum ihrer Macht ist die Stadt Rhosmere. Die Gwefrydd sind ein altes und ehrgeiziges Adelshaus, das durch seine Pferdezucht und die Gründung der Gilde Rhosmeres Rösser bedeutenden Einfluss erlangt hat.",
          ],
          history: [
            "Die Gwefrydd begannen ihre Geschichte als einfache, aber hochgeschätzte Pferdekenner. Über Generationen machten sie sich durch die außergewöhnliche Zucht von Rössern einen Namen. Ihre Pferde, bekannt für Ausdauer, Stärke und Geschwindigkeit, wurden bald im gesamten Königreich nachgefragt. Als der Graf von Celtigerns Wacht ihre Schlüsselrolle für die militärische Stärke der Grafschaft erkannte, stieg ihr Ansehen rasch.",
            "Ihre Kavalleriepferde wurden zu einem unverzichtbaren Bestandteil der gräflichen Heere. In Anerkennung ihrer Bedeutung erhob der Graf die Gwefrydd in den Adelsstand und verlieh ihnen den Titel der Barone von Arthus Streben. Seither haben sie ihre Zucht weiter verfeinert und eine enge Beziehung zur Ritterkultur der Grafschaft aufgebaut.",
          ],
          culture: [
            "Die Untertanen von Arthus Streben sind für ihre tiefe Verbindung zur Pferdezucht bekannt. Viele Bewohner arbeiten in den weitläufigen Ställen, auf den Weiden oder in der Pferdepflege. Die Zucht gilt ihnen nicht nur als Arbeit, sondern als Ehre.",
            "Die Menschen der Baronie gelten als bodenständig, fleißig und stark. Kavallerie und ritterlicher Lebensstil sind tief verwurzelt; Ehre, Loyalität und Disziplin genießen hohes Ansehen. Pferdepflege, Sattlerei und verwandte Handwerke prägen den Alltag ebenso wie die Treue zum Haus Gwefrydd.",
          ],
          economy: [
            "Die Wirtschaft der Baronie dreht sich maßgeblich um die Pferdezucht und den Handel mit Rössern, die im gesamten Königreich für Ausdauer, Stärke und Kampffähigkeit berühmt sind. Die von den Gwefrydd gegründete Gilde Rhosmeres Rösser liefert Kavallerie-, Reit- und Arbeitspferde an Adel, Heere und Händler.",
            "Daneben sind die Bewohner stark in der Landwirtschaft tätig. Sie bauen Hafer, Heu und Gerste als Futter an, betreiben Getreideanbau und Viehhaltung. Ein blühendes Handwerk aus Sattlerei, Hufschmiedekunst sowie der Herstellung von Zaumzeug und Reiterausrüstung begleitet die Pferdewirtschaft.",
            "Der Handel mit diesen Erzeugnissen bringt der Baronie Wohlstand. Durch ihre weitreichenden Verbindungen haben die Gwefrydd ein florierendes Netzwerk geschaffen, das Arthus Streben wirtschaftlich stark und selbstständig macht.",
          ],
          defense: [
            "Die Verteidigung der Baronie beruht auf zwei Säulen. Berittene Truppen sichern die Königsstraße, die durch die Ländereien führt. Ihre ständigen Patrouillen schützen Handel und Verbindungen innerhalb der Grafschaft.",
            "Im Norden erstreckt sich der Coed-Y-Felin-Hain, ein Wald, den Druiden und Waldläufer als heiligen Ort ansehen. Nahe den Gebirgen treiben Hornlinge ihr Unwesen. Erfahrene Helwyr durchstreifen deshalb den Wald, schützen die Bevölkerung und halten die Wege offen. Kavallerie auf den Straßen und Waldläufer an der Grenze bilden gemeinsam den Schild der Baronie.",
          ],
          geography: ["..."],
          flora: ["..."],
          trivia: ["..."],
        },
      },
    },
  };

  window.ORT_DATA = window.KONTINENTE_DATA;
})();
