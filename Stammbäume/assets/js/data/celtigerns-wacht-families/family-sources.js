import { CAWS_PORTRAITS } from '../house-caws-portraits.js';
import { GOFAL_PORTRAITS } from '../house-gofal-portraits.js';
import { HWYLBREN_PORTRAITS } from '../house-hwylbren-portraits.js';
import { MACRELL_PORTRAITS } from '../house-macrell-portraits.js';
import { MUR_PORTRAITS } from '../house-mur-portraits.js';
import { PENWAIG_PORTRAITS } from '../house-penwaig-portraits.js';

export const CELTIGERNS_WACHT_FAMILY_SOURCE = 'celtigerns-wacht-families-20261127';
const imageRoot = 'assets/images/houses/Llamreis Ankunft';

function family({ slug, name, rank = 'commoner', emblemExtension = 'jpeg', portraits, ...source }) {
  const imageDirectory = rank === 'commoner' ? `Bürgerliche/Gwynthor/${name}` : `Ritterliche/${name}`;
  return Object.freeze({
    ...source, slug, name, rank, portraits,
    id: `haus-${slug}`,
    title: rank === 'commoner' ? `Familie ${name}` : `Haus ${name}`,
    emblem: `${imageRoot}/${imageDirectory}/${slug}-emblem.${emblemExtension}`,
    figure: `${imageRoot}/${imageDirectory}/${slug}-hausfigur-v1.png`,
  });
}

export const CELTIGERNS_WACHT_FAMILY_SOURCES = Object.freeze([
  family({
    slug: 'mur', name: 'Mur', patron: 'Gafyr', portraits: MUR_PORTRAITS,
    figureLabel: 'Waffenknecht der Familie Mur',
    summary: 'Alteingesessene Bürgerfamilie im Waffendienst des Hauses Gafyr. Gwaywddur Mur führt die Familie und dient als Hauptmann.',
    seat: '', head: 'gwaywddur-mur',
    people: [
      { id: 'gwaywddur-mur', name: 'Gwaywddur Mur', sex: 'male', status: 'alive', title: 'Familienoberhaupt · Hauptmann im Dienst des Hauses Gafyr', bio: 'Gwaywddur Mur steht trotz seines hohen Alters weiterhin als Hauptmann im Dienst des Hauses Gafyr. Tarian ist sein Sohn und Rhydwyn sein Enkel.' },
      { id: 'tarian-mur', name: 'Tarian Mur', sex: 'male', title: 'Sohn von Gwaywddur Mur', bio: 'Tarian ist Gwaywddur Murs Sohn. Die Vorlage zeigt ihn in schwarzer Rüstung mit goldenen Einfassungen, einem ockerfarbenen Mantel und einem Schild. Sein eigener Dienstgrad ist offen.' },
      { id: 'rhydwyn-mur', name: 'Rhydwyn Mur', sex: 'male', title: 'Enkel von Gwaywddur Mur', bio: 'Rhydwyn gehört zur Enkelgeneration von Gwaywddur Mur. Welches Kind Gwaywddurs sein Elternteil ist, bleibt offen.' },
    ],
    childrenByParent: { 'gwaywddur-mur': ['tarian-mur'] },
    sourceNote: 'Die Bildbeschriftung nennt Tarian als Sohn und Rhydwyn als Enkel des Familienoberhaupts. Welches Kind Gwaywddurs Rhydwyns Elternteil ist, ist unbekannt.',
  }),
  family({
    slug: 'gofal', name: 'Gofal', patron: 'Gafyr', portraits: GOFAL_PORTRAITS, emblemExtension: 'png',
    figureLabel: 'Zofe der Familie Gofal',
    summary: 'Bürgerfamilie mit einer langen Tradition in Dienerschaft und Verwaltung des Hauses Gafyr. Luned ist oberste Zofe, Eluned dient als Zofe.',
    people: [
      { id: 'luned-gofal', name: 'Luned Gofal', sex: 'female', status: 'alive', title: 'Oberste Zofe des Hauses Gafyr', bio: 'Luned ist die oberste Zofe des Hauses Gafyr. Ihr Amt steht für die Tradition der Gofals in der persönlichen Dienerschaft.' },
      { id: 'mared-gofal', name: 'Mared Gofal', sex: 'male', title: 'Vogtamt bei Haus Gafyr offen', bio: 'Die Bildbeschriftung nennt das Vogtamt beim Haus Gafyr mit einem Fragezeichen. Mareds genauer Posten ist offen.' },
      { id: 'eluned-gofal', name: 'Eluned Gofal', sex: 'female', status: 'alive', title: 'Zofe des Hauses Gafyr', bio: 'Eluned dient Haus Gafyr als Zofe. Ihr genaues Verwandtschaftsverhältnis zu Luned und Mared ist offen.' },
    ],
    sourceNote: 'Mared ist als möglicher Vogt bezeichnet. Nähere Verwandtschaften und das Familienoberhaupt sind offen.',
  }),
  family({
    slug: 'caws', name: 'Caws', patron: 'Gafyr', portraits: CAWS_PORTRAITS,
    figureLabel: 'Käsemacherin der Familie Caws', seat: 'Ziegenhof im Herrschaftsgebiet der Gafyr', head: 'goronvy-caws',
    summary: 'Wohlhabende Bürgerfamilie mit eigenem Ziegenhof und Käserei im Herrschaftsgebiet der Gafyr. Goronvy Caws ist Familienoberhaupt und Käsemeister.',
    people: [
      { id: 'goronvy-caws', name: 'Goronvy Caws', sex: 'male', status: 'alive', title: 'Familienoberhaupt · Käsemeister', bio: 'Goronvy Caws führt die Familie und ist Käsemeister. Bedwyr und Morys sind seine Söhne, Eirwyn ist seine Enkelin.' },
      { id: 'bedwyr-caws', name: 'Bedwyr Caws', sex: 'male', status: 'alive', title: 'Ältester Sohn · Ziegenhof', bio: 'Bedwyr ist Goronvys ältester Sohn und mit dem Ziegenhof der Familie verbunden. Eirwyn ist seine Tochter.' },
      { id: 'morys-caws', name: 'Morys Caws', sex: 'male', status: 'alive', title: 'Zweiter Sohn · Küchenmeister des Hauses Gafyr', bio: 'Morys ist Goronvys zweiter Sohn. Als Küchenmeister des Hauses Gafyr verbindet er die Familie mit dem Haushalt der Gafyrs.' },
      { id: 'eirwyn-caws', name: 'Eirwyn Caws', sex: 'female', title: 'Tochter von Bedwyr Caws', bio: 'Eirwyn ist die Tochter Bedwyrs und Enkelin Goronvys. Ihr Porträt zeigt sie mit einem Laib Käse. Ein eigener Amtstitel ist offen.' },
    ],
    childrenByParent: { 'goronvy-caws': ['bedwyr-caws', 'morys-caws'], 'bedwyr-caws': ['eirwyn-caws'] },
    sourceNote: 'Die Bildbeschriftungen belegen Goronvys Söhne Bedwyr und Morys sowie Bedwyrs Tochter Eirwyn. Weitere Elternteile und Eheschließungen sind offen.',
  }),
  family({
    slug: 'penwaig', name: 'Penwaig', patron: 'Saethwyr', portraits: PENWAIG_PORTRAITS,
    figureLabel: 'Netzfischer der Familie Penwaig',
    summary: 'Alteingesessene Fischereifamilie im Herrschaftsgebiet der Saethwyr. Ihre Betriebe verbinden Fang, Räucherei, Salzerei und Handel.',
    people: [
      { id: 'merfyn-penwaig', name: 'Merfyn Penwaig', sex: 'male', status: 'alive', title: 'Vogt des Hauses Saethwyr', age: 99, bio: 'Merfyn ist laut Bildbeschriftung 99 Jahre alt und amtierender Vogt des Hauses Saethwyr.' },
      { id: 'einion-penwaig', name: 'Einion Penwaig', sex: 'male', status: 'alive', ageEstimate: 'in seinen Siebzigern', bio: 'Die Bildbeschriftung führt Einion als Angehörigen der Familie in seinen Siebzigern. Sein heutiges Amt und seine nähere Verwandtschaft sind offen.' },
      { id: 'bledri-penwaig', name: 'Bledri Penwaig', sex: 'male', bio: 'Bledri ist als Angehöriger der Penwaigs überliefert. Das Porträt zeigt ihn beim Arbeiten an einem Fischernetz.' },
      { id: 'mererid-penwaig', name: 'Mererid Penwaig', sex: 'male', bio: 'Mererid ist als Angehöriger der Penwaigs überliefert. Das Porträt zeigt ihn mit einem Buch am Hafen. Sein Beruf ist offen.' },
    ],
    sourceNote: 'Die beschriftete Bildreihe nennt Merfyn (99, Vogt) und Einion (in seinen Siebzigern). Im Fließtext ist Einion als 99-jähriger Vogt genannt. Die Bildbeschriftung ist für die Zuordnung maßgeblich. Aus dem Alter wurden keine Geburtsjahre abgeleitet.',
  }),
  family({
    slug: 'macrell', name: 'Macrell', patron: 'Saethwyr', rank: 'knight-simple', portraits: MACRELL_PORTRAITS,
    figureLabel: 'Seekrieger des Hauses Macrell',
    summary: 'Junges Ritterhaus aus der Seefahrt im Umfeld des Hauses Saethwyr. Ein bürgerlicher Schiffskapitän begründete die Linie nach seinem Ritterschlag.',
    founderTitle: 'Schiffskapitän · Name offen',
    people: [
      { id: 'morcant-macrell', name: 'Morcant Macrell', sex: 'male', bio: 'Morcant ist als Angehöriger des Hauses Macrell überliefert. Ein Amt und seine genaue Stellung in der Familienlinie sind offen.' },
      { id: 'madoc-macrell', name: 'Madoc Macrell', sex: 'male', bio: 'Madoc ist als Angehöriger des Hauses Macrell überliefert. Die Vorlage zeigt ihn mit einer Seekarte an Bord.' },
      { id: 'nerys-macrell', name: 'Nerys Macrell', sex: 'female', status: 'alive', title: 'An Bord von Arian Saethwyr', bio: 'Nerys wird Arians Schiff zugeordnet. Arian Saethwyr ist die Kapitänin des bestehenden Schiffskommandos. Nerys’ genauer Bordposten ist offen.' },
    ],
    sourceNote: 'Der bürgerliche Schiffskapitän der Gründungsgeschichte bleibt namenlos. Nerys’ Bildbeschriftung „Arians Schiff“ verweist im Saethwyr-Kontext auf das bestehende Schiffskommando von Arian Saethwyr. Bordrang, Familienoberhaupt, nähere Verwandtschaft und ein eigener Sitz sind offen.',
  }),
  family({
    slug: 'hwylbren', name: 'Hwylbren', patron: 'Saethwyr', portraits: HWYLBREN_PORTRAITS,
    figureLabel: 'Segelmacherin der Familie Hwylbren',
    summary: 'Traditionsreiche Bürger- und Handwerkerfamilie. Die Hwylbrens fertigen und reparieren Segel, Flaggen und Banner und rüsten die Flotte des Hauses Saethwyr aus.',
    people: [
      { id: 'morfudd-hwylbren', name: 'Morfudd Hwylbren', sex: 'female', bio: 'Morfudd ist als Angehörige der Hwylbrens überliefert. Ihr Porträt zeigt sie bei einer Näharbeit am Segeltuch.' },
      { id: 'gwrgan-hwylbren', name: 'Gwrgan Hwylbren', sex: 'male', bio: 'Gwrgan ist als Angehöriger der Hwylbrens überliefert. Sein Porträt zeigt ihn mit einem Zirkel über dem Entwurf eines Segels.' },
      { id: 'heulwen-hwylbren', name: 'Heulwen Hwylbren', sex: 'female', bio: 'Heulwen ist als Angehörige der Hwylbrens überliefert. Ihr Porträt zeigt sie bei einer heraldischen Stickarbeit.' },
    ],
    sourceNote: 'Die Bildreihe nennt drei Angehörige. Eine nähere Verwandtschaft, das Familienoberhaupt und die genaue Lage der Werkstatt sind offen.',
  }),
]);

export function getCeltigernsWachtFamilySource(slug) {
  return CELTIGERNS_WACHT_FAMILY_SOURCES.find(family => family.slug === slug);
}
