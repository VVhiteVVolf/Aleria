import { buildFederkielGuildHierarchy, buildFederkielPlaceHierarchy } from './federkiel-hierarchy.mjs';
import { FEDERKIEL_PLACES } from './federkiel-places.mjs';
import { buildFederkielServicesPage } from './federkiel-services.mjs';
import {
  FEDERKIEL_GUILD_EMBLEM, FEDERKIEL_GUILD_ID, FEDERKIEL_SECTION, FEDERKIEL_SIGN,
  federkielIllustration, federkielModuleId, federkielModuleLink, federkielSceneImage
} from './federkiel-section.mjs';

function entry({ id, title, subtitle, imageKey, symbol = FEDERKIEL_SIGN, type, pages }) {
  const image = federkielSceneImage(imageKey);
  return {
    id, title, subtitle, type, category: FEDERKIEL_SECTION.key, symbol, image, previewImage: image,
    stamp: 'FEDERKIEL · GWYNTHOR', schemaVersion: 1, multipage: true,
    appendCommentsPage: false, enablePageComments: true, sessionCast: [], pages
  };
}

function hierarchyPage(key, title, hierarchy) {
  return {
    schemaVersion: 1, pageTitle: title, commentThreadKey: `federkiel-${key}-aufbau`,
    ...federkielIllustration(key), hierarchyPage: true, hierarchy
  };
}

function overview() {
  const links = FEDERKIEL_PLACES.map(({ id, title, subtitle }) =>
    `<li><a href="${federkielModuleLink(federkielModuleId(id))}">${title}</a> · ${subtitle}</li>`).join('');
  return {
    schemaVersion: 1, pageTitle: 'Das Gildenhaus von Federkiel', commentThreadKey: 'federkiel-gildenhaus',
    ...federkielIllustration('gildenhaus'),
    description: '<p>Über dem Eingang der Zentralpost hängt an zwei eisernen Scharnieren ein goldgrünes Holzschild mit einer hellen Feder. An diesem Zeichen erkennt man die Poststellen der <strong>Gilde Federkiel</strong>. Das Netz reicht um die ganze Welt. Selbst der kleinste Ort hat mindestens eine Kurierstation oder eine Schreibstube, an der sich eine Nachricht aufgeben lässt.</p>'
      + '<p>Gwynthors große Zentralpost führt hinter ihren Arkaden mehrere gleichwertige Schalter. Die Schreibstube hilft beim Verfassen und Lesen, die Druckerei versorgt das Netz mit Aushängen und Vordrucken, das Postlager hält die gebündelten Sendungen für die Abgänge bereit. Von der Kurierstation aus bringen Staffeln die Briefe durch Stadt und Bannkreis und zu den nächsten Stationen.</p>'
      + '<p>Wer sich einen herkömmlichen Einzelboten kaum leisten kann, gibt den Brief mit der Sammelpost auf. Aufeinander abgestimmte Abgänge und Wechselplätze tragen die Nachrichten durch ganz Cenyr und über seine Grenzen hinaus.</p>'
      + `<h3>Die Betriebsstellen in Gwynthor</h3><ul>${links}</ul>`,
    stats: [['Standort', 'Gwynthor-Stadt'], ['Reichweite', 'Cenyr und das weltweite Stationsnetz']]
  };
}

function buildGuildEntry() {
  return entry({
    id: FEDERKIEL_GUILD_ID, title: FEDERKIEL_SECTION.key, subtitle: 'Gwynthors Zentrale im weltweiten Postnetz',
    imageKey: 'gildenhaus', symbol: FEDERKIEL_GUILD_EMBLEM, type: 'Post- und Kuriergilde',
    pages: [overview(), buildFederkielServicesPage(), hierarchyPage('gildenleitung', 'Gwynthorer Gildenleitung', buildFederkielGuildHierarchy())]
  });
}

function buildPlaceEntry(place) {
  const hierarchy = buildFederkielPlaceHierarchy(place);
  hierarchy.description += `<p><a href="${federkielModuleLink(FEDERKIEL_GUILD_ID)}">Zum Gildenhaus von Federkiel</a></p>`;
  return entry({
    id: federkielModuleId(place.id), title: place.title, subtitle: place.subtitle, imageKey: place.id, type: 'Betriebsstelle der Gilde Federkiel',
    pages: [
      hierarchyPage(place.id, `${place.title} · Aufbau`, hierarchy),
      {
        schemaVersion: 1, pageTitle: place.scene.title, commentThreadKey: `federkiel-${place.id}-szene`,
        ...federkielIllustration(`${place.id}-szene`, place.scene.imagePosition), sessionPage: true,
        ...(place.scene.sessionCast ? { sessionCast: place.scene.sessionCast } : {}),
        sessionIntro: `<p>${place.scene.intro}</p>`, sessionHint: place.scene.hint,
        sessionEmptyTitle: 'Die Szene ist offen', sessionEmptyText: 'Der erste Beitrag eröffnet die Szene.',
        sessionDateAleria: { year: null, month: null, day: null }
      }
    ]
  });
}

export function federkielRegistrations() {
  return [buildGuildEntry(), ...FEDERKIEL_PLACES.map(buildPlaceEntry)].map(entry => ({
    ...FEDERKIEL_SECTION, icon: FEDERKIEL_SECTION.iconUrl, description: FEDERKIEL_SECTION.desc, entry
  }));
}
