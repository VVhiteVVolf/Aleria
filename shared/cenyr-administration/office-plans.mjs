import military from '../../Kontinente/modules/administration/data/celtigerns-militaer.mjs';
import justice from '../../Kontinente/modules/administration/data/celtigerns-gerichtsbarkeit.mjs';
import finance from '../../Kontinente/modules/administration/data/celtigerns-finanzen.mjs';
import intelligence from '../../Kontinente/modules/administration/data/celtigerns-spionage.mjs';
import diplomacy from '../../Kontinente/modules/administration/data/celtigerns-diplomatie.mjs';
import culture from '../../Kontinente/modules/administration/data/celtigerns-unterhaltung.mjs';
import { geographicKey } from '../world-directory/geographic-key.mjs';
import { buildCourtPlan } from './court-plan.mjs';
import { buildCourtDepartments } from './court-departments.mjs';
import { prepareOfficePlan } from './office-plan-assembly.mjs';
import { buildRegionalChurchPlan } from './regional-church-plan.mjs';
import { countyOfficeDefinition } from './county-office-plans.mjs';
import { localOfficeSection } from './local-offices.mjs';
import { buildLehenswartePlan, LEHENSWARTE_ID } from './lehenswarte-plan.mjs';
import { CENYR_MARSHAL_DUTY, FLOTILLA_ROLE, RETIRED_WATCH_MARSHAL, SEA_CAPTAIN_ROLE,
  repeatableNavalPost, watchSection, watchServiceSection } from './military-organization.mjs';
import { rankOf, rulerSuffix } from './scopes.mjs';
import { buildCamruisgePlans } from './camruisge-plan.mjs';
import { buildSettlementPlans } from './settlement-plans.mjs';

const section = (title, icon, description, slots) => ({
  title, icon, description, slots: slots.map(slot => {
    if (!Array.isArray(slot)) return slot;
    const [id, title, description, place] = slot;
    return { id, title, description, ...(place ? { place } : {}) };
  }),
});
const core = (title, icon, description, slots) => ({ ...section(title, icon, description, slots), core: true });
const reference = (area, group, roles) => {
  const lookup = new Map(area.groups.find(entry => entry.id === group).roles.map(role => [role.id, role]));
  return roles.map(([sourceId, id, title, description]) => {
    const role = lookup.get(sourceId);
    return [id || sourceId, title || role.title, description || role.description];
  });
};
const duties = {
  militaer: CENYR_MARSHAL_DUTY,
  klerus: 'Betreut den örtlichen geistlichen Dienst. Weihen und geistliche Rangfolge richten sich nach der Kirche.',
  gerichtsbarkeit: 'Verantwortet Strafverfolgung, Gerichtsverfahren und Schlichtung. Kann Belohnungen aussetzen und wacht bei Erb- und Nachfolgefragen über die Rechtsordnung der Herrschaft.',
  finanzen: 'Führt die Kasse, Einkünfte und Vorräte der Herrschaft, beaufsichtigt den Handel und legt dem Oberhaupt Rechnung.',
  spionage: 'Berät das Hausoberhaupt und den Rat vertraulich. Führt den Nachrichtendienst im eigenen Gebiet und sammelt auch Nachrichten aus anderen Herrschaften.',
  diplomatie: 'Hält Verbindung zu benachbarten Herrschaften und führt ihre Gesandtschaften. Er kann Redner zur Unterstützung anderer Ratsämter entsenden und deren Fachwissen bei Verhandlungen einholen.',
  magie: 'Berät das Oberhaupt in arkanen Fragen und betreut die örtlichen magischen Dienste und Bestände.',
  unterhaltung: 'Leitet Hofkultur und musische Bildung und koordiniert Spielleute, Feste und öffentliche Auftritte.',
};

function militaryPlan(house, localPosts) {
  const ports = house.places.filter(place => ['Hafensiedlung', 'Hafen'].includes(place.type));
  const coastal = ports.map(port => port.name);
  const navy = house.fleet || house.id === 'saethwyr';
  const barony = house.rank === 'barony';
  const coastalCommand = navy && house.separateCoastalCommand;
  const flotillaLimit = rankOf(house).flotillas;
  const flotillaId = name => `flottille-${geographicKey(name)}`;
  const flotillas = navy ? [...ports].sort((a, b) => Number(b.type === 'Hafen') - Number(a.type === 'Hafen'))
    .slice(0, flotillaLimit).map(port => port.name) : [];
  const coastDuty = 'Führt die Küstenposten und Patrouillen und stimmt den Dienst mit der Grafschaft ab.';
  const coastalAdjutant = ['seeadjutant', 'Adjutant des Küstenkommandanten', 'Sammelt Meldungen der Küstenposten und Häfen.'];
  const squadron = ['seekommandant', 'Seekommandant eines Geschwaders', 'Koordiniert die ihm zugeteilten Schiffe im beauftragten Bereich.'];
  const retired = {
    ...RETIRED_WATCH_MARSHAL,
    wachkommandant: 'Kommandodienst beim Marschall',
    wachstellvertretung: 'Stellvertretung im Marschalldienst',
    waffenknecht: { area: 'hof-hausmacht', kind: 'service', templateId: 'r-waffenknecht', title: 'Waffenknecht der Hausmacht' },
  };
  if (navy) {
    for (const name of coastal.filter(name => !flotillas.includes(name))) retired[flotillaId(name)] = `Flottillenadmiral von ${name}`;
    if (!barony) retired[squadron[0]] = squadron[1];
  }
  const suffix = rulerSuffix(house);
  const marshals = [
    ['feldfuehrung', 'Feldmarschall', `Koordiniert das landgebundene Wehrwesen und das örtliche Aufgebot unter dem Marschall ${suffix}.`],
    ...(coastal.length || navy ? [[coastalCommand ? 'admiral' : 'seefuehrung', navy ? 'Seemarschall und Admiral' : 'See- und Küstenkommandant',
      navy ? `Führt die Flotte unter dem Marschall ${suffix} und stimmt den Dienst zur See mit der Grafschaft ab.` : coastDuty]] : []),
  ];
  const onTheWater = [
    ...coastal.map(name => [`hafen-${geographicKey(name)}`, `Hafenmeister von ${name}`, 'Ordnet Liegeplätze, Ausrüstung am Kai und Anlaufmeldungen.']),
    ...reference(military, 'militaer-seedienste', [
      ['seedienst-steuermann', 'lotse', 'Lotsenmeister'],
      ['seedienst-werftmeister', 'werftmeister'],
      ['seedienst-seesignalmeister', 'seesignal', 'Signalmeister zur See', 'Stimmt Warn-, Flaggen- und Laternenzeichen der Küstenwachen ab.'],
      ['seedienst-seeproviant', 'seeproviant', 'Proviantmeister zur See', 'Plant Rationen, Trinkwasser und Verladung für die Schiffe.'],
    ]),
    ['leuchtturmwart', 'Leuchtfeuerwart', 'Betreut Küstenfeuer und sichtbare Warnzeichen.'],
    ['reedenwacht', 'Reedenwachtmeister', 'Plant Wachfahrten und meldet auffällige Schiffsbewegungen.'],
  ];
  const sections = [
    section('Marschallführung', 'command', `Operative Führung unter dem Marschall ${suffix}.`, marshals),
    section('Adjutanten', 'records', 'Meldungen, Abschriften und geregelte Vertretung in der Marschallskanzlei.', [
      ['adjutant', 'Adjutant des Marschalls', 'Bereitet Befehlsübergaben und Lagebesprechungen vor.'],
      ['feldadjutant', 'Adjutant des Feldmarschalls', 'Koordiniert die Berichte der Landwacht und der Hauptleute.'],
      ...((coastal.length || navy) && !coastalCommand ? [navy
        ? ['seeadjutant', 'Adjutant des Seemarschalls', 'Sammelt Hafen- und Küstenmeldungen.'] : coastalAdjutant] : []),
      ['marschallschreiber', 'Marschallsschreiber', 'Führt Aufgebots-, Wach- und Befehlslisten.'],
    ]),
    core('Die fünf Kriegswarte', 'command', 'Gleichrangige Fachaufsicht. Das unmittelbare Kommando liegt bei den örtlichen Befehlshabern.', reference(military, 'militaer-kriegswarte', [
      ['gwaeron-awenor', 'kriegswart-sicherheit', '', 'Beaufsichtigt Schutzpläne, Torwachen und Wachbereitschaft.'],
      ['ffraid-awenor', 'kriegswart-logistik', '', 'Bündelt Proviant, Fuhrwesen, Lager und Materialbedarf.'],
      ['duncan-gafyr', 'kriegswart-ausbildung', '', 'Stimmt Übungen, Ausbildung und Befähigungsprüfungen ab.'],
      ['militaer-kriegswart-aufklaerung', 'kriegswart-aufklaerung', '', 'Verantwortet militärische Meldungen, Signale, Karten und Erkundung.'],
      ['derfel-awenydd', 'kriegswart-disziplin', '', 'Beaufsichtigt die Dienstordnung und hält Verstöße fest.'],
    ])),
    ...(house.id === 'saethwyr' ? [section('Kommandantur der Saethwyr-Truppen', 'command', 'Belegter Truppenbefehl im Auftrag des Marschalls.', [
      ['wachkommandant', 'Kommandantin der Saethwyr-Truppen', 'Führt die ihr vom Marschall zugeteilten Truppen.'],
      ['wachstellvertretung', 'Stellvertreter des Kommandanten', 'Vertritt das Kommando bei ausdrücklicher Beauftragung.'],
    ])] : []),
    watchSection(house.places, `dem Marschall ${suffix}`, Object.fromEntries(localPosts.map(post => [post.place, post]))),
    watchServiceSection(),
    section('Dienst im Heeresaufgebot', 'command', '', [
      ['bannerfuehrer', 'Bannerführer im Heer', 'Führt die ihm bei einem Aufgebot anvertraute Einheit unter ihrem Banner.'],
    ]),
    section('Fachdienste des Heeres und der Wacht', 'supplies', 'Ausbildung, Versorgung, Verwundetenpflege und militärische Schriftwege.', reference(military, 'militaer-landdienste', [
      ['landdienst-ermittler'], ['landdienst-inspektor'], ['landdienst-profoss'], ['landdienst-heeresschoeffe'],
      ['landdienst-botenmeister'], ['landdienst-zeugmeister'], ['landdienst-quartiermeister'], ['landdienst-lehrhauptmann'],
      ['landdienst-festungsbaumeister'], ['landdienst-torhauptmann', 'torhauptmann', 'Torhauptmann', 'Verantwortet Durchlass, Torordnung und Torwachen.'],
      ['landdienst-feldkaplan'], ['landdienst-feldscher'], ['landdienst-militaerherold'],
    ])),
    ...(navy ? [
      section('Admiralität', 'sailing', 'Ordnet den Dienst der Schiffe unter dem Seemarschall.', [
        { id: 'flottenstab', title: 'Vizeadmiral', description: 'Hält Meldungen und Bereitschaft der Flottillen zusammen.', reportsTo: 'dem Seemarschall' },
      ]),
      { ...section('Flottillenadmiräle', 'sailing', `${flotillas.length} Ausgangsstellen unter der Admiralität. Weitere Flottillen lassen sich im Entwurf ergänzen.`,
        flotillas.map(name => repeatableNavalPost({ id: flotillaId(name), title: `Flottillenadmiral von ${name}`, place: name,
          description: 'Führt die dem Hafen zugeteilten Wachschiffe.', reportsTo: 'dem Vizeadmiral' }, FLOTILLA_ROLE))),
        id: 'flottillen', repeatableHere: true },
      section('Küstenkommando', 'watch', 'Örtliche Zuständigkeiten des Küstenaufgebots.', [
        ...(barony ? [squadron] : []),
        { id: coastalCommand ? 'seefuehrung' : 'kuestenkommandant',
          title: coastalCommand ? 'See- und Küstenkommandant'
            : house.id === 'saethwyr' ? 'Küstenkommandant von Glastraeth' : `Küstenkommandant der ${barony ? 'Baronie' : 'Herrschaft'}`,
          description: coastDuty, reportsTo: 'dem Seemarschall' },
        ...(coastalCommand ? [coastalAdjutant] : []),
      ]),
      { ...section('Kapitäne und Borddienst', 'sailing', 'Schiffskommando und unmittelbarer Borddienst.', [
        repeatableNavalPost({ id: 'kapitaen', title: SEA_CAPTAIN_ROLE.title, description: SEA_CAPTAIN_ROLE.description,
          reportsTo: 'dem zuständigen Flottillenkommando' }, SEA_CAPTAIN_ROLE),
        ...reference(military, 'militaer-seedienste', [
          ['seedienst-bootsmann'], ['seedienst-schiffszimmermeister'],
          ['seedienst-schiffsarzt', 'schiffsheiler', 'Schiffsarzt', 'Betreut die Besatzung bei Krankheit und Verletzung.'],
        ]).map(([id, title, description]) => ({ id, title, description, stationed: true, reportsTo: 'dem Kapitän des Schiffes' })),
      ]), id: 'kapitaene-zur-see', repeatableHere: true },
    ] : []),
    coastal.length
      ? section('Bordämter, Häfen und Dienste zur See', 'sailing', 'Liegeplätze, Navigationshilfe und Versorgung.', onTheWater)
      : section('Wege und Übergänge', 'horse', 'Sicherungsaufgaben an Fluss und Landwegen.', [
        ['brueckenwarte', 'Brückenwart der Ortswache', 'Überwacht die Übergänge und meldet Sperrungen und Schäden.'],
        ['faehrwacht', 'Wachtmeister der Fährstellen', 'Koordiniert den Sicherungsdienst an den Übersetzpunkten.'],
        ['reitboten', 'Meister der Reitboten', 'Hält Pferde und Übergaben auf den Meldestrecken bereit.'],
      ]),
  ];
  return { sections, retired };
}

const civilSections = {
  gerichtsbarkeit: house => [
    section('Gerichtskanzlei und Adjutantur', 'records', 'Erfassung, Prüfung und Zustellung der Verfahren.', [
      ...reference(justice, 'adjutantur', [['adjutant', 'adjutant', '', 'Vertritt das Justiziariat nach erteilter Vollmacht und prüft eingehende Fälle.']]),
      ['protokoll', 'Gerichtsschreiber', 'Führt Sitzungsprotokolle und Urteilsabschriften.'],
      ['aktenregistratur', 'Aktenregistrator', 'Ordnet Vorgänge, Beweismittel und Fristen.'],
      ['empfang', 'Eingabeschreiber', 'Nimmt Petitionen, Klagen und Anträge entgegen.'],
    ]),
    core('Die fünf Rechtsvorsteher', 'justice', 'Gleichrangige Aufsicht über die fünf Fachgebiete.', reference(justice, 'kern', [
      ['landfrieden', '', '', 'Koordiniert Fälle des Landfriedens und die Weiterleitung an zuständige Gerichte.'],
      ['gerichte', '', 'Rechtsvorsteher der Gerichte', 'Stimmt Termine, Besetzung und Rechtswege der Ortsgerichte ab.'],
      ['bann', '', '', 'Prüft Zuständigkeiten und den Umfang erteilter Rechtsvollmachten.'],
      ['akten', '', '', 'Beaufsichtigt Aktenführung und die Verwahrung von Belegen.'],
      ['vollzug', '', '', 'Überwacht die dokumentierte Umsetzung rechtmäßiger Entscheidungen.'],
    ])),
    localOfficeSection('gerichtsbarkeit', house.places),
    section('Gerichte und Rechtsweg', 'judgment', '', [
      ['gerichtsvogt', 'Gerichtsvogt', 'Veranlasst Ladungen und übergibt Beschlüsse an den zuständigen Vollzug.'],
      ['schultheiss', 'Schultheiß', 'Betreut örtliche Verhandlungen und Abgabenstreitigkeiten.'],
      ['schoeffe', 'Schöffe', 'Wirkt an Urteilen unter dem zuständigen Gerichtsvorsitz mit.'],
      ['spruchmittler', 'Schiedsmann', 'Vermittelt bei geeigneten Streitfällen.'],
      ['grenzzeuge', 'Grenz- und Flurzeuge', 'Unterstützt die Aufnahme von Grenzen und Nutzungsrechten.'],
    ]),
    section('Öffentlichkeit und Fürsprache', 'proclamation', 'Zugängliche Verfahren und öffentliche Bekanntmachung.', [
      ['ausrufer', 'Öffentliche Gerichtsverkündung', 'Verkündet Gerichtstage und freigegebene Beschlüsse.'],
      ['fuersprecher', 'Gerichtsfürsprecher', 'Hilft bei der verständlichen Darlegung von Anliegen.'],
    ]),
    section('Gerichtsdienste', 'coordination', 'Zustellung, Vollzug und Verwahrung.', [
      ['justizbote', 'Justizbote', 'Stellt Ladungen und Entscheidungen gegen Nachweis zu.'],
      ['vollzugsdiener', 'Vollzugsdiener', 'Setzt angeordnete Maßnahmen um und dokumentiert Übergaben.'],
      ['kerkermeister', 'Kerkermeister', 'Verantwortet die Verwahrung und die Aufzeichnungen zu Ein- und Ausgängen.'],
      ['beweiswart', 'Beweismittelwart', 'Verwahrt übergebene Gegenstände und hält ihre Übergabe fest.'],
    ]),
  ],
  finanzen: house => [
    section('Adjutantur', 'records', 'Anweisungen, Register und laufende Haushaltsführung.', [
      ['adjutant', 'Adjutant der Kämmerei', 'Bereitet Berichte, Prüflisten und Zahlungen zur Freigabe vor.'],
      ['schreiber', 'Haushaltsschreiber', 'Führt Belegbücher und die Abschriften der Haushaltsrechnung.'],
      ['kassenschreiber', 'Kassenschreiber', 'Verzeichnet Ein- und Ausgänge mit ihren Belegen.'],
    ]),
    core('Die fünf Kammerämter', 'money', 'Kasse, Abgaben, Vorräte, Werke und Rechnung führen ihre Fachaufgaben eigenständig.', reference(finance, 'kern', [
      ['kasse', '', 'Kammeramt der Kasse', 'Betreut Kasse, freigegebene Zahlungen und Rücklagen.'],
      ['abgaben', '', 'Kammeramt der Abgaben', 'Führt Abgabenrollen und prüft Erhebungen.'],
      ['vorraete', '', '', 'Überwacht Vorräte, Liefermengen und Verderb.'],
      ['werke', '', '', 'Plant bewilligte Bau- und Instandhaltungsausgaben.'],
      ['rechnung', '', 'Kammeramt der Rechnung', 'Prüft Belege und bereitet den Rechnungsabschluss vor.'],
    ])),
    localOfficeSection('finanzen', house.places),
    { title: 'Örtliche Abgabenstellen', icon: 'money', slots: house.places.map(({ name, type }) => {
      const id = geographicKey(name);
      const title = type === 'Hafensiedlung' ? 'Hafenzöllner' : 'Abgabenwart';
      return { id: `rente-${id}`, title, templateId: `r-${geographicKey(title)}`, site: `finanzen/rentmeister-${id}`,
        description: 'Führt die örtlichen Abgabenbelege und liefert sie an das Rentamt.' };
    }) },
    section('Abgaben und Märkte', 'money', '', [
      ['marktkasse', 'Marktkämmerer', 'Rechnet Standgebühren und Marktaufwendungen ab.'],
      ['waagmeister', 'Waagmeister', 'Prüft Gewichte und dokumentiert gebührenpflichtige Wägungen.'],
      ['schaetzer', 'Güterschätzer', 'Schätzt Naturalabgaben, Bestände und Sachwerte.'],
    ]),
    section('Schreibstuben und Dienste', 'supplies', 'Magazin, Bauabrechnung und unabhängige Nachprüfung.', [
      ['magazinmeister', 'Magazinmeister', 'Führt Lagerlisten und Ausgabenachweise.'],
      ['bauschreiber', 'Bauschreiber', 'Erfasst Material, Löhne und abgeschlossene Bauabschnitte.'],
      ['kassenreiter', 'Kassenreiter', 'Prüft örtliche Bücher gegen die vorgelegten Belege.'],
      ['zahlmeister', 'Zahlmeister', 'Führt beauftragte Auszahlungen und quittiert Übergaben.'],
      ['haushaltsbote', 'Kammerbote', 'Überbringt Abrechnungen und Belege zwischen den Stellen.'],
    ]),
  ],
  spionage: house => [
    section('Adjutantur', 'records', 'Meldungen und Zugänge werden bei der Amtsleitung zusammengeführt.', [
      ['adjutant', 'Adjutant des Schattens', 'Vertritt die Amtsleitung in den ihm übertragenen Aufgaben.'],
      ['registrator', 'Verwalter des Melderegisters', 'Ordnet eingehende Meldungen und hält Bearbeitungsstände fest.'],
      ['kanzleiwart', 'Wart der vertraulichen Kanzlei', 'Verwahrt vertrauliche Amtsunterlagen und kontrolliert die Belegübergabe.'],
    ]),
    core('Die fünf Netzmeister', 'secrecy', 'Gleichrangige Fachstellen des Nachrichtendienstes.', reference(intelligence, 'fuenf-netzmeister', [
      ['efael-gwyllach', 'aufklaerung', '', 'Sichtet Meldungen und führt die örtliche Lageübersicht.'],
      ['gegenspionage', '', '', 'Prüft widersprüchliche Hinweise und mögliche Täuschungen.'],
      ['meredydd-gwyllach', 'fahndung', '', 'Stimmt laufende Fahndungsfragen mit der Justiz ab.'],
      ['anelen-gwyllach', 'nachrichten', 'Netzmeister der Wege und Nachrichten', 'Koordiniert die Amtsboten und den Eingang aus den Meldestellen.'],
      ['drystan-gwyllach', 'beweise', '', 'Hält Herkunft und Aussagekraft übergebener Belege fest.'],
    ])),
    localOfficeSection('spionage', house.places),
    section('Reiseberichte', 'scouting', '', [
      ['reiseberichte', 'Auswerter der Reiseberichte', 'Vergleicht Berichte und weist auf Widersprüche hin.'],
    ]),
    section('Sonderrollen und Ausbildung', 'inquiry', 'Nachprüfung und dokumentierte Übergaben.', [
      ['ermittler', 'Ermittler', 'Prüft zugewiesene Sachverhalte und hält Ergebnisse fest.'],
      ['fahnder', 'Fahnder', 'Bearbeitet beauftragte Suchen in Abstimmung mit der Justiz.'],
      ['kundschafter', 'Kundschafter des Hauses', 'Meldet Beobachtungen aus dem zugewiesenen Gebiet.'],
      ['aussagen', 'Prüfer der Aussagen', 'Gleicht Aussagen und bekannte Umstände ab.'],
      ['kuriermeister', 'Kuriermeister', 'Ordnet Aufträge und Übergaben der Amtsboten.'],
      ['amtskurier', 'Amtskurier', 'Befördert zugewiesene Nachrichten.'],
    ]),
  ],
  diplomatie: house => [
    section('Adjutantur und Heroldskanzlei', 'records', 'Audienzen, Entwürfe und ordentliche Schriftwege.', [
      ['adjutant', 'Adjutant des Herolds', 'Bereitet Verhandlungen, Aufträge und Termine vor.'],
      ['audienzschreiber', 'Audienzschreiber', 'Verzeichnet Gesuche, Audienzen und Beschlüsse.'],
      ['kanzleischreiber', 'Urkundenschreiber', 'Erstellt genehmigte Fassungen und Abschriften.'],
    ]),
    core('Die fünf Kernämter des Herolds', 'diplomacy', 'Gesandtschaft, Protokoll, Verträge, Verbindungen und Wappen.', reference(diplomacy, 'kern', [
      ['gesandtschaft', '', 'Gesandtschaftsmeister', 'Koordiniert Besuche und den Auftrag der Gesandten.'],
      ['protokoll', '', '', 'Verantwortet Rangfolge, Anreden und den Verlauf förmlicher Empfänge.'],
      ['vertraege', '', '', 'Prüft Entwürfe, Fristen und die Hinterlegung gültiger Verträge.'],
      ['verbindung', '', '', 'Pflegt feste Ansprechstellen bei Grafschaft und Lehnshäusern.'],
      ['zeichen', '', 'Wappen- und Zeichenmeister', 'Prüft Wappen, Siegel und Rangzeichen.'],
    ])),
    section('Gesandtschaft und Kanzleidienste', 'diplomacy', 'Persönliche Vertretung im erteilten Mandat.', [
      ['gesandter', `Gesandter ${rulerSuffix(house)}`, 'Vertritt die Herrschaft bei beauftragten Gesprächen.'],
      ['grafschaftsgesandter', 'Verbindung zur Grafschaft', 'Führt die regelmäßige Korrespondenz mit der zuständigen Grafschaft.'],
      ['grenzgesandter', 'Grenzgesandter', 'Bespricht örtliche Grenz-, Wege- und Nutzungsfragen.'],
      ['dolmetscher', 'Dolmetscher', 'Sichert die Verständigung bei Besuchen und Verhandlungen.'],
      ['geleitmeister', 'Geleitmeister', 'Organisiert Ankunft, Unterkunft und Geleit von Gesandten.'],
    ]),
    section('Vertragsstube', 'records', 'Freigegebene Ausfertigungen, Siegel und Zustellungen.', [
      ['vertragsgehilfe', 'Schreibgehilfe der Vertragsstube', 'Erstellt Abschriften und führt das Fristenbuch.'],
      ['archivar', 'Urkundenarchivar', 'Verwahrt gültige Verträge und genehmigte Abschriften.'],
      ['siegelwart', 'Siegelwart', 'Verwahrt und protokolliert den Gebrauch der Amtssiegel.'],
      ['wappenkundiger', 'Wappenkundiger', 'Hält die Nachweise zu Wappen und Zeichen bereit.'],
      ['heroldsbote', 'Heroldsbote', 'Übermittelt Ausfertigungen und Einladungen.'],
    ]),
  ],
  magie: () => [
    section('Lehrling und Nachfolge', 'learning', 'Vertretung und Ausbildung im Auftrag der Ratsmagie.', [
      ['vertreter', 'Stellvertretung der Ratsmagie', 'Übernimmt ausdrücklich delegierte Aufgaben bei Abwesenheit.'],
      ['lehrling', 'Lehrling der Ratsmagie', 'Lernt unter Aufsicht und hält die Ergebnisse eigener Übungen fest.'],
      ['kanzleischreiber', 'Schreiber der Ratsmagie', 'Führt Auftragslisten und Belege über erteilte Auskünfte.'],
    ]),
    core('Die fünf Fachämter der Ratsmagie', 'arcane', 'Gleichrangige Dienste im Hausstab des Ratsmagiers.', [
      ['gutachter', 'Arkaner Gutachter', 'Prüft die Herkunft und Eigenschaften gemeldeter Wirkungen.'],
      ['schutzwart', 'Wart der Schutzzeichen', 'Geht vereinbarten Prüfplänen für Schutzzeichen an den Amtsorten nach.'],
      ['heilkunde', 'Verbindung zur magischen Heilkunde', 'Vermittelt geeignete Heilkundige und dokumentiert die Übergaben.'],
      ['bibliothekar', 'Bibliothekar der Ratsmagie', 'Pflegt Nachweise und organisiert den Zugang zu Lehrschriften.'],
      ['feldbeauftragter', 'Feldbeauftragter der Ratsmagie', 'Begleitet örtliche Untersuchungen und meldet seine Befunde.'],
    ]),
    section('Hausstab und Lehensdienste', 'coordination', 'Begleitung und Abstimmung der örtlichen Amtsgeschäfte.', [
      ['kirchenkontakt', 'Verbindung zum Vikariat', 'Stimmt gemeinsame Fragen und Aufträge mit den geistlichen Stellen ab.'],
      ['amtsbote', 'Bote der Ratsmagie', 'Überbringt vereinbarte Aufträge und Antworten.'],
    ]),
    section('Werkstatt, Archiv und Hof', 'works', 'Bestände, Material und Aufzeichnungen.', [
      ['archivar', 'Arkaner Archivar', 'Ordnet Gutachten, Forschungsnotizen und die Amtskorrespondenz.'],
      ['artefaktwart', 'Artefaktwart', 'Verzeichnet hinterlegte Gegenstände und protokolliert Ausgaben.'],
      ['werkstattmeister', 'Werkstattmeister', 'Plant Ausrüstung und beaufsichtigt die Werkstattarbeiten.'],
      ['beschaffer', 'Materialbeschaffer', 'Beschafft bewilligte Werkstoffe und legt Herkunftsbelege vor.'],
      ['magazinwart', 'Magazinwart', 'Führt die Materialbestände und meldet Fehlmengen.'],
      ['assistent', 'Werkstattassistent', 'Unterstützt das Inventar und die Vorbereitung beaufsichtigter Arbeiten.'],
    ]),
  ],
  unterhaltung: () => [
    section('Adjutantur', 'records', 'Organisation des Programms und der laufenden Hofdienste.', [
      ['adjutant', 'Adjutant des Bardenamts', 'Stimmt Auftritte, Proben und Berichte mit dem Bardenamt ab.'],
      ['hofbarde', 'Barde am Hof', 'Tritt bei Hofanlässen auf und pflegt das Repertoire des Hauses.'],
      ['terminwart', 'Schreiber der Hofkultur', 'Führt Programm, Termine und die Absprachen mit auftretenden Gästen.'],
    ]),
    core('Die fünf Ordner der Hofkultur', 'music', 'Gleichrangige Fachämter für die öffentlichen und höfischen Anlässe.', reference(culture, 'kern', [
      ['zeremonien', '', '', 'Organisiert Reihenfolge und Proben der Zeremonien.'],
      ['feste', '', '', 'Stimmt Programme, Gäste und Versorgung bei Festen ab.'],
      ['turniere', '', '', 'Plant Ablauf und Mitwirkende genehmigter Turniere.'],
      ['heraldik', '', '', 'Stimmt Wappenauftritte und Förmlichkeiten mit der Heroldskanzlei ab.'],
      ['spielleute', '', '', 'Koordiniert die Ensembles, Proben und Engagements der Spielleute.'],
    ])),
    section('Sonderrollen der Hoföffentlichkeit', 'proclamation', 'Bühne, Hallenprogramm und Ansagen.', [
      ['erzaehlmeister', 'Erzählmeister der Halle', 'Pflegt Geschichten, Lesungen und feierliche Vorträge.'],
      ['turnierrufer', 'Turnierrufer', 'Kündigt Wettstreite, Teilnehmer und freigegebene Ergebnisse an.'],
      ['preiswart', 'Preiswart', 'Verwahrt Ehrengaben und führt die Liste der Preisübergaben.'],
      ['hofausrufer', 'Hofausrufer', 'Verkündet öffentliche Hofanlässe und freigegebene Mitteilungen.'],
      ['tanzmeister', 'Tanzmeister', 'Leitet Proben und begleitet gesellschaftliche Tänze.'],
      ['truppenmeister', 'Leitung der Hofspielleute', 'Betreut die Mitwirkenden und bereitet Gastauftritte vor.'],
    ]),
    section('Spielleute und Hofdienste', 'hospitality', 'Vorbereitung der Räume und Empfang der Mitwirkenden.', [
      ['saalmeister', 'Saalmeister', 'Ordnet Zugänge, Plätze und die Vorbereitung der Halle.'],
      ['tischmeister', 'Tischmeister', 'Koordiniert die Tischfolge mit Küche und Hofdienst.'],
      ['gastwart', 'Gastwart der Spielleute', 'Betreut Ankunft und Unterbringung der auftretenden Gäste.'],
      ['instrumentenwart', 'Instrumentenwart', 'Pflegt Instrumente und hält Ersatz bereit.'],
      ['requisitenwart', 'Requisitenwart', 'Verwahrt und verteilt Requisiten für Feste und Auftritte.'],
    ]),
  ],
};

const retiredRoles = {
  gerichtsbarkeit: { landrichter: 'Gerichtsdienst · Ort offen' },
  finanzen: { rentmeister: 'Rentamtsdienst · Ort offen' },
  spionage: { hofzelle: 'Meldedienst für Burg und Hof', marktzelle: 'Meldedienst für Stadt und Markt', grenzzelle: 'Meldedienst für Grenzorte und Fernwege' },
};

const headTitles = {
  militaer: ['Marschall', 'Marschallin'], klerus: ['Vikar', 'Vikarin'], gerichtsbarkeit: ['Justiziar', 'Justiziarin'],
  finanzen: ['Kämmerer', 'Kämmerin'], spionage: ['Schatten', 'Schatten'], diplomatie: ['Herold', 'Heroldin'],
  magie: ['Ratsmagier', 'Ratsmagierin'], unterhaltung: ['Barde', 'Bardin'],
};

function appointmentMap(house) {
  return new Map((house.staff || []).map(item => [`${item.area}/${item.slot}`, item]));
}

export function buildCourtPlans(house, appointments = appointmentMap(house)) {
  const definition = buildCourtPlan(house);
  const hof = prepareOfficePlan(house, 'hof', definition, appointments);
  return { hof, ...buildCourtDepartments(house, hof, definition, appointments) };
}

export function buildOfficePlans(house) {
  if (house.rank === 'diarchy') return buildCamruisgePlans(house);
  const appointments = appointmentMap(house);
  const localPlan = house.rank === 'royal' ? null : buildLehenswartePlan(house);
  const sharedWatchPosts = (localPlan?.sections || []).flatMap(section => section.slots).filter(post => post.previousKey);
  const definitions = Object.entries(house.offices).filter(([id]) => id !== 'regentschaft').map(([id, office]) => {
    if (house.county) return [id, countyOfficeDefinition(house, id, office, sharedWatchPosts)];
    if (id === 'ratskanzlei' || id === 'ratsberatung') {
      return [id, { head: { ...office, reportsTo: `dem ${rankOf(house).ruler}`,
        description: id === 'ratskanzlei' ? 'Leitet die Beratungen des königlichen Rates. Führt die Kanzlei und ist oberster Berater des Königs.'
          : 'Berät das Oberhaupt in den ihm anvertrauten Angelegenheiten.' },
      sections: id === 'ratskanzlei' ? [section('Kanzleidienst', 'records', '', [
        ['kanzleischreiber', 'Schreiber der Ratskanzlei', 'Führt Protokolle, Beschlüsse und die Amtsschreiben.'],
        ['siegelwart', 'Siegelwart der Ratskanzlei', 'Verwahrt die Siegel und hält ihre Verwendung fest.'],
      ])] : [],
      }];
    }
    const definition = id === 'militaer' ? militaryPlan(house, sharedWatchPosts) : id === 'klerus' ? buildRegionalChurchPlan(house, office)
      : { sections: civilSections[id](house), retired: retiredRoles[id] };
    const titles = id === 'klerus' && house.regional && !/^vikar/iu.test(office.title) ? null : headTitles[id];
    const titleVariants = titles?.map(title => `${title} ${rulerSuffix(house)}`);
    return [id, { ...definition, head: {
      title: office.title, description: duties[id], holder: office.holder, titleVariants,
      reportsTo: `dem ${rankOf(house).ruler}`,
    } }];
  });
  if (localPlan) definitions.push([LEHENSWARTE_ID, localPlan]);
  definitions.push(['regentschaft', {
    head: {
      title: house.offices.regentschaft?.title || 'Regent', holder: house.offices.regentschaft?.holder,
      titleVariants: house.offices.regentschaft ? ['Regent', 'Regentin'].map(title => `${title} ${rulerSuffix(house)}`) : ['Regent', 'Regentin'],
      description: 'Führt bei besonderer Ernennung die Regierung während der Abwesenheit des Oberhaupts oder bis zur geregelten Nachfolge.',
    },
    sections: [],
  }]);
  const plans = Object.fromEntries(definitions.map(([id, plan]) => [id, prepareOfficePlan(house, id, plan, appointments)]));
  if (!house.courtScope) Object.assign(plans, buildCourtPlans(house, appointments));
  Object.assign(plans, buildSettlementPlans(house, plans, appointments));
  if (appointments.size) throw new Error(`Posten für belegte Dienste fehlen: ${[...appointments.keys()].join(', ')}`);
  return plans;
}
