import source from './sources/hierarchy-online-20261116.json' with { type: 'json' };
import { ADMINISTRATIVE_OFFICES, SPECIAL_OFFICES, TROOP_ROLES } from './schwarzfische-offices.mjs';
import { SCHWARZFISCH_TROOPS } from './schwarzfische-troops.mjs';

export const SCHWARZFISCHE_ART = './assets/schwarzfische';
export const SCHWARZFISCHE_EMBLEM = './public/assets/windreiter/references/xYZyjk3.png';
export const GRENN_PORTRAIT = `${SCHWARZFISCHE_ART}/grenn-coelret-v2.png`;
const original = source.pages.find(page => page.hierarchyPage).hierarchy;
const originalNodes = original.trees.flatMap(tree => tree.levels.flatMap(level => level.nodes));
const aliases = { cynwrig: 'Cynwrig Pysgod', colm: 'Colm', alara: 'Alara', sinead: 'Sinead' };
const silhouette = clothing => `${SCHWARZFISCHE_ART}/${clothing}-v1.png`;

function officeCard(role, imageSources) {
  const person = role.occupant && originalNodes.find(node => node.title === (aliases[role.occupant] || role.occupant));
  return {
    title: person?.title || role.title,
    subtitle: `${role.icon} ${person ? role.title : 'Unbesetzt'}`,
    portrait: imageSources[person?.portrait] || person?.portrait || silhouette(role.clothing),
    text: role.text
  };
}

function coreTree(imageSources) {
  const core = original.trees[0].levels.slice(2).flatMap(level => level.nodes).map(node => {
    if (node.title === 'Zibhi') return {
      title: 'Grenn Coelret', subtitle: '⚔ Kernmitglied · Speerdienst', portrait: GRENN_PORTRAIT,
      text: 'Übernimmt Speer-, Wach- und Geleitaufgaben im unmittelbaren Aufgebot des Kommandanten und unterstützt die eingesetzte Truppführung.'
    };
    return {
      title: node.title === 'Name' ? 'Kernmitglied · unbesetzt' : node.title,
      subtitle: node.title === 'Name' ? '⚔ Freier Kernplatz' : '⚔ Kernmitglied des Banners',
      portrait: imageSources[node.portrait] || node.portrait || silhouette('soldat'),
      text: 'Übernimmt anspruchsvolle Feldaufträge im engeren Aufgebot des Banners und kann mit der Führung kleiner Einsatzgruppen betraut werden.'
    };
  });
  return {
    id: 'kerngruppe-des-banners', parentTreeId: '', label: 'Kerngruppe des Banners', levels: [
      { label: 'Bannerkommando', nodes: [officeCard({
        title: 'Kommandant', occupant: 'cynwrig', icon: '⚑', clothing: 'offizier',
        text: 'Trägt die Gesamtverantwortung für das Banner, bestätigt größere Aufträge und bestimmt die gemeinsame Einsatzordnung.'
      }, imageSources)] },
      { label: 'Stellvertretung', nodes: [
        officeCard({ title: 'Linke Hand', occupant: 'Selene', icon: '⛨', clothing: 'offizier', text: 'Unterstützt das Bannerkommando bei Feldführung und Schutzaufträgen und übernimmt die Vertretung im zugewiesenen Bereich.' }, imageSources),
        officeCard({ title: 'Rechte Hand', occupant: 'Arvel', icon: '⚔', clothing: 'offizier', text: 'Unterstützt das Bannerkommando bei Einsatzabstimmung und besonderen Aufträgen und übernimmt die Vertretung im zugewiesenen Bereich.' }, imageSources)
      ] },
      { label: 'Kernmitglieder', columns: 4, nodes: core },
      { label: 'Weitere offene Kernplätze', columns: 4, startsGroup: true, nodes: [
        { title: 'Kernmitglied · Feldführung', icon: '⚑', clothing: 'offizier', text: 'Verstärkt den engeren Kreis bei der Vorbereitung und Führung anspruchsvoller Feldaufträge.' },
        { title: 'Kernmitglied · Aufklärung', icon: '◈', clothing: 'kundschafter', text: 'Unterstützt den engeren Kreis mit Geländeerkenntnissen und unmittelbar einsatzbezogener Aufklärung.' },
        { title: 'Kernmitglied · Borddienst', icon: '⚓', clothing: 'mariner', text: 'Unterstützt den engeren Kreis bei Einschiffung, Landung und abgestimmten Aufträgen zur See.' },
        { title: 'Kernmitglied · Arkaner Dienst', icon: '✦', clothing: 'kampfmagier', text: 'Verstärkt das engere Aufgebot nach vorhandener Fachkunde bei magischen Gefahren und vereinbarten Schutzaufgaben.' }
      ].map(role => officeCard(role, imageSources)) }
    ]
  };
}

function administrativeTree(imageSources) {
  return {
    id: 'administration', parentTreeId: 'kerngruppe-des-banners', label: 'Administration', levels: [
      { label: 'Bannerkommando', nodes: [officeCard({ title: 'Kommandant', occupant: 'cynwrig', icon: '⚑', clothing: 'offizier',
        text: 'Bestimmt die Grundsätze der Bannerverwaltung und bestätigt Verpflichtungen, Vollmachten und größere Ausgaben.' }, imageSources)] },
      { label: 'Persönlicher Stabsdienst', nodes: [officeCard({ title: 'Adjutant des Kommandanten', icon: '✎', clothing: 'offizier',
        text: 'Bereitet Befehlsausgaben, Termine und Vorlagen des Kommandanten vor. Hält Rückmeldungen aus Verwaltung und Einsatzführung zusammen.' }, imageSources)] },
      { label: 'Acht Verwaltungsbereiche', columns: 4, nodes: ADMINISTRATIVE_OFFICES.map(role => officeCard(role, imageSources)) },
      { label: 'Gemeinsame Amtsstube', nodes: [officeCard({ title: 'Gildenvogt', occupant: 'sinead', icon: '⚜', clothing: 'hofmeister',
        text: 'Führt die gemeinsame Amtsstube und setzt die Aufträge der Verwaltungsbereiche in abgestimmte Tagesarbeit um. Koordiniert die Sonderämter und legt fachliche Überschneidungen den zuständigen Ämtern vor.' }, imageSources)] },
      { label: 'Zwölf Sonderämter · Fachaufsicht durch die zuständigen Verwaltungsbereiche', columns: 4, nodes: SPECIAL_OFFICES.map(role => officeCard(role, imageSources)) }
    ]
  };
}

function leadershipTree(imageSources) {
  const leadership = [
    { title: 'Burgvogt der Windfeste', occupant: 'sinead', icon: '⌂', clothing: 'hofmeister',
      text: 'Leitet die Windfeste als Hauptquartier und ordnet Wach-, Haus- und Versorgungsdienst vor Ort. Meldet Zustand und Bedarf an die Bannerverwaltung.' },
    { title: 'Burgvogt von Windfeld', icon: '⌂', clothing: 'offizier',
      text: 'Leitet den Stützpunkt Windfeld, sichert dessen Dienstbereitschaft und stimmt örtliche Unterbringung und Vorräte mit der Bannerverwaltung ab.' },
    { title: 'Standortleitung · Standort unbenannt I', icon: '⌂', clothing: 'offizier',
      text: 'Führt einen künftig zu benennenden Standort und verantwortet dort Wachen, Unterkünfte und die Umsetzung bestätigter Aufträge.' },
    { title: 'Kapitänin der Schwarzen Flut', occupant: 'Agnés', icon: '⚓', clothing: 'mariner',
      text: 'Führt die Schwarze Flut und verantwortet Navigation, Besatzung und die sichere Ausführung der übernommenen Seeaufträge.' },
    { title: 'Kapitän der Schattenschuppe', occupant: 'Breandan', icon: '⚓', clothing: 'mariner',
      text: 'Führt die Schattenschuppe und verantwortet Navigation, Besatzung und die sichere Ausführung der übernommenen Seeaufträge.' },
    { title: 'Standortleitung · Standort unbenannt II', icon: '⌂', clothing: 'offizier',
      text: 'Führt einen künftig zu benennenden Standort und stimmt Personal, Versorgung und örtliche Dienstpläne mit den zuständigen Fachämtern ab.' }
  ];
  return { id: 'fuehrungspersonen', parentTreeId: 'kerngruppe-des-banners', label: 'Führungspersonen',
    levels: [{ label: 'Standorte und Schiffe', columns: 3, nodes: leadership.map(role => officeCard(role, imageSources)) }] };
}

function regularTree(imageSources) {
  const previousMembers = original.trees.find(tree => tree.id === 'regulare-mitglieder').levels.flatMap(level => level.nodes);
  const firstTroopRoleOrder = [0, 4, 5, 3, 6, 4, 1, 2];
  const levels = SCHWARZFISCH_TROOPS.flatMap(({ numeral, name, emblem }, index) => [
    { label: `Schwarzfisch Trupp ${numeral}. · ${name}`, emblem, startsGroup: true, nodes: [officeCard({
      title: `Unteroffizier · Trupp ${numeral}`, icon: '⚑', clothing: 'offizier',
      text: 'Führt den Trupp mit seinen beiden Leutnants, bestätigt die Aufgabenverteilung und meldet Dienstbereitschaft sowie Bedarf an die zuständige Einsatzführung.'
    }, imageSources)] },
    { label: 'Leutnants', columns: 2, nodes: [
      officeCard({ title: 'Leutnant · Erste Rotte', icon: '⚑', clothing: 'offizier',
        text: 'Unterstützt den Unteroffizier und koordiniert die vier Mitglieder der ersten Rotte bei ihren jeweiligen Aufgaben.' }, imageSources),
      officeCard({ title: 'Leutnant · Zweite Rotte', icon: '⚑', clothing: 'offizier',
        text: 'Unterstützt den Unteroffizier und koordiniert die vier Mitglieder der zweiten Rotte sowie deren Abstimmung mit der ersten Rotte.' }, imageSources)
    ] },
    { label: 'Achterschaft · Aufgabenrollen', columns: 4, nodes: TROOP_ROLES.map((defaultRole, position) => {
      const role = index === 0 ? TROOP_ROLES[firstTroopRoleOrder[position]] : defaultRole;
      const person = index === 0 ? previousMembers[position] : null;
      let assignment = 'Unbesetzt';
      if (person?.portrait) assignment = person.title === 'Name' ? 'Unbenanntes Mitglied' : role.title;
      return {
        title: person?.title && person.title !== 'Name' ? person.title : role.title,
        subtitle: `${role.icon} ${assignment}`,
        portrait: imageSources[person?.portrait] || person?.portrait || silhouette(role.clothing),
        text: role.text
      };
    }) }
  ]);
  return { id: 'regulare-mitglieder', parentTreeId: 'kerngruppe-des-banners', label: 'Reguläre Mitglieder', levels };
}

export function buildSchwarzfischeHierarchy(imageSources) {
  const trees = [coreTree(imageSources), administrativeTree(imageSources), leadershipTree(imageSources), regularTree(imageSources)];
  return {
    ...original, portraitScale: 90, cardFontScale: 100, chartScale: 100,
    organizationTitle: 'Die Schwarzfische', eyebrow: 'Hierarchie', subtitle: 'Banner, Ämter und Achterschaften',
    emblem: SCHWARZFISCHE_EMBLEM, sideImage: SCHWARZFISCHE_EMBLEM,
    motto: 'Ehre · Pflichtgefühl · Loyalität',
    description: '<p>Das Kommandantenbanner der Windreiter auf Estryll verbindet einen beweglichen Feldverband mit festen Burgen, Schiffen und einer gemeinsamen Amtsstube.</p>',
    detailsTitle: 'Das Banner', details: [
      { icon: '⚑', label: 'Gründung', value: 'Vor rund zwölf bis dreizehn Jahren' },
      { icon: '⌂', label: 'Hauptquartier', value: 'Burg Windfeste · Aislaerneach' },
      { icon: '⚔', label: 'Auftrag', value: 'Schutz, Geleit und bezahlter Kriegsdienst' },
      { icon: '⛨', label: 'Stärke', value: 'Etwa 300–600 aktive Schwarzfische' },
      { icon: '⚓', label: 'Weitere Stützpunkte', value: 'Windfeld · Schwarze Flut · Schattenschuppe' }
    ],
    quoteLabel: 'Grundsatz', quote: 'Ein gegebenes Wort verpflichtet das ganze Banner.',
    chartTitle: 'Aufbau und Zuständigkeiten',
    chartIntro: '<p>Der Kern begleitet das Bannerkommando. Acht Fachämter, eine gemeinsame Amtsstube und örtliche Führungen halten Feldtrupps und Standorte arbeitsfähig. Die zehn dargestellten Achterschaften lassen sich einzeln besetzen und erweitern.</p>',
    trees, levels: trees[0].levels,
    footerNote: 'Jede Rollenbeschreibung gilt für das Amt. Freie Plätze und unbenannte Standorte sind für spätere Besetzungen vorgesehen; die zehn Trupps bilden einen ausbaubaren Teil des größeren Banners ab.'
  };
}
