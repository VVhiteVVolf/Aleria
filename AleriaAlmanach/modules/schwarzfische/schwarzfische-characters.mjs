import { sanitizeCharacterBiographyForFirestore } from '../characters/character-save-guard.js';
import { GRENN_PORTRAIT, SCHWARZFISCHE_EMBLEM } from './schwarzfische-hierarchy.mjs';

export const GRENN_CHARACTER_ID = 'schwarzfische-grenn-seolfor';
export const SCHWARZFISCHE_AUTHORED_AT = '2026-11-16T12:00:00Z';
export const GRENN_BIO = 'Grenn Coelret ist ein dreiunddreißigjähriger Söldner aus dem kleinen aeldrunmarischen Vasallenhaus Coelret im Umkreis der Beran. Das steigende braune Pferd auf grün-gelbem Feld verweist auf sein Herkunftshaus. Bei den Schwarzfischen dient Grenn mit dem Speer im engeren Aufgebot. Sein kurzes braunes Haar steht trotz des roten Stirnbands eigensinnig ab. Ein freches Grinsen, ein rascher Spruch und ein gewinnendes Auftreten machen ihn im Lager leicht wiedererkennbar.';

export function buildGrennBiography() {
  return {
    schema: 'aleria.biography-module', schemaVersion: 1, pageTitle: 'Grenn Coelret',
    stats: [
      ['Name', 'Grenn Coelret'], ['Rufname', 'Grenn'], ['Alter 1740', '33 Jahre'],
      ['Herkunft', 'Aeldrunmar · Aldervan'], ['Haus', 'Coelret · kleines Vasallenhaus der Beran'],
      ['Dienst', 'Schwarzfische · Kernaufgebot'], ['Waffe', 'Speer']
    ],
    biography: {
      portrait: GRENN_PORTRAIT, crestImage: '/Stammbäume/assets/images/houses/accepted-realms/aeldrunmar/coelret.webp',
      biographyTitle: 'Ein freches Grinsen unter dem roten Stirnband', biographyText: `<p>${GRENN_BIO}</p>`,
      abilitiesTitle: 'Auftreten und Eigenschaften', abilities: [
        { title: 'Frech', icon: '/IconOrdner/Traits%20Icon/Quick.png', detail: 'Ein schiefer Blick und eine schnelle Antwort gehören zu Grenns Auftreten.' },
        { title: 'Charismatisch', icon: '/IconOrdner/Traits%20Icon/Gregarious.png', detail: 'Er findet leicht ins Gespräch und trägt seine Selbstsicherheit mit einem gewinnenden Lächeln.' },
        { title: 'Selbstbewusst', icon: '/IconOrdner/Traits%20Icon/Brave.png', detail: 'Seine Haltung ist gelassen, sein Blick wach und herausfordernd.' }
      ],
      historyTitle: 'Aus einem aeldrunmarischen Reiterhaus',
      historyText: '<p>Haus Coelret gehört zum Vasallenkreis der Beran in Aeldrunmar und ist dem Umfeld von Aeldros zugeordnet. Das steigende braune Pferd auf grün-gelbem Feld und die zugehörige Hyld-Darstellung passen zu Grenns Herkunft aus einem kleinen Reiterhaus. Sein gegenwärtiger Dienst gehört dem Schwarzfischbanner auf Estryll.</p>',
      worksTitle: 'Erkennungsmerkmale', works: ['Kurzes braunes Haar mit abstehenden Strähnen', 'Rotes Stirnband', 'Speer und dunkler Schwarzfischharnisch'],
      connectionsTitle: 'Haus und Banner', connections: [
        { name: 'Haus Coelret', detail: 'Herkunftshaus · Beran · Aeldrunmar', image: '/Stammbäume/assets/images/houses/accepted-realms/aeldrunmar/coelret.webp', imageFormat: 'square' },
        { name: 'Die Schwarzfische', detail: 'Söldner im Kernaufgebot', image: SCHWARZFISCHE_EMBLEM, imageFormat: 'square' }
      ],
      documentsTitle: 'Zugehörige Akten', documents: [
        { title: 'Schwarzfischbanner', text: 'Kerntruppe, Verwaltung, örtliche Führungen und Achterschaften.', link: './AleriaAlmanach.html?entry=modul-1781961958641' },
        { title: 'Haus Coelret', text: 'Bestehende Familienakte des Herkunftshauses.', link: '../Stammbäume/Stammbaum.html?family=haus-coelret&mode=view' }
      ]
    }
  };
}

export function buildGrennCharacterExport() {
  const biography = sanitizeCharacterBiographyForFirestore({ biography: buildGrennBiography() }).biography;
  return {
    type: 'aleria-character', version: 1, exportedAt: SCHWARZFISCHE_AUTHORED_AT,
    assignedTab: 'Schwarzfische', mergeStrategy: 'replace-exported-fields',
    sourcePath: 'Charakter Archiv Exporte/Schwarzfische/grenn-seolfor.json',
    character: {
      id: GRENN_CHARACTER_ID, name: 'Grenn Coelret', aliases: ['Grenn'], age: 33, gender: 'male', race: 'Mensch',
      title: 'Schwarzfisch · Speerträger', role: 'Speerträger im Kernaufgebot der Schwarzfische',
      origin: 'Aeldrunmar · Haus Coelret · Aeldros', fraktion: 'Schwarzfische',
      portrait: '/AleriaAlmanach/assets/schwarzfische/grenn-coelret-v2.png', bio: GRENN_BIO, biography,
      currentLocation: 'Im Dienst der Schwarzfische auf Estryll', archived: false
    }
  };
}
