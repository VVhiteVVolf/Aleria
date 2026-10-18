import { HARBOR_ART, GWREGYSDU_EMBLEM, GWREGYSDU_HOUSEHOLD } from './harbor-people.mjs';
import { buildGwregysduBiography } from './harbor-biography.mjs';
import { buildGwregysduHierarchy } from './harbor-hierarchy.mjs';
import { buildGwregysduServices } from './harbor-services.mjs';
import { HARBOR_ROOMS } from './harbor-rooms.mjs';
import { POST_SECTION } from '../klingende-muenze-gwynthor/post-section.mjs';

export const HARBOR_ID = 'gwynthor-gwregysdu-lagerhaeuser';
export const HARBOR_SECTION = POST_SECTION;
const scene = id => ({ image: `${HARBOR_ART}/scenes/${id}.png`, imageWidth: 34, imageTall: true, imageFit: 'cover', imagePosition: 'center' });

export function buildGwregysduHarbor() {
  return { id: HARBOR_ID, title: 'Die Lagerhäuser der Gwregysdu', subtitle: 'Vier Häuser, viele Wege · Klingende Münze', type: 'Hafenlogistik', category: 'Gwynthor · Handelsposten',
    icon: '⚓', symbol: GWREGYSDU_EMBLEM, image: `${HARBOR_ART}/scenes/hafenansicht.png`, previewImage: `${HARBOR_ART}/scenes/hafenansicht.png`, stamp: 'HAUS GWREGYSDU · KLINGENDE MÜNZE',
    schemaVersion: 1, multipage: true, appendCommentsPage: true, enablePageComments: true, sessionCast: GWREGYSDU_HOUSEHOLD.map(p => p.worldPersonId), pages: [
      { schemaVersion: 1, commentThreadKey: 'gwregysdu-einordnung', pageTitle: 'Die Lagerhäuser der Gwregysdu', ...scene('hafenansicht'),
        description: '<p>Zwischen den Masten im Hafen Gwynthors stehen die vier Lagerhäuser der <strong>Gwregysdu</strong>. Breite Tore öffnen sich zum Kaihof, über dem Holz und Tauwerk knarren. Hier werden Sendungen angenommen, gewogen, verwahrt und an Käufer weitergegeben. Die Familie gehört zur <strong>Klingenden Münze</strong> und ist eine von mehreren Parteien in deren großem Handelsposten.</p><p>Ihr Aufstieg begann mit <strong>Madog Schwarzgurt</strong>, einem Waisenjungen, der sich bis zum Stellvertreter eines Lagerherrn hocharbeitete. Die Ehe mit dessen Tochter legte den Grundstein. Weitere Heiraten verbanden die Familie mit Höfen, Jagd und Bergbau; aus einem Holzlager wurde ein Haus mit weitreichenden Lieferwegen.</p><p>Heute führt <strong>Bleddyn Gwregysdu</strong> den Betrieb mit seinen Söhnen Cynan und Tudur. Doch seit Gruffudds Komplott gegen die Bradrhith aufgedeckt wurde, stehen die Bücher und Kontakte der Familie unter Verdacht. Hinter den Toren geht die Arbeit weiter — und jedes fremde Siegel wird aufmerksamer betrachtet als zuvor.</p>',
        stats: [['Ort', 'Gwynthor · Hafen'], ['Besitz', 'Vier Lagerhäuser'], ['Handelsposten', 'Klingende Münze · eine von mehreren Parteien'], ['Hausführung', 'Bleddyn, Cynan und Tudur Gwregysdu'], ['Geschäft', 'Lagerung · Umschlag · Vertrieb · Frachtvermittlung'], ['Stand', 'Familie unter Verdacht nach Gruffudds Komplott']] },
      { schemaVersion: 1, commentThreadKey: 'gwregysdu-hausbio', pageTitle: 'Haus Gwregysdu · Madogs Erbe', biographyPage: true, ...scene('hausgeschichte'),
        stats: [['Gründer', 'Madog Schwarzgurt'], ['Ursprung', 'Gwynthorer Waisenheim · Cenyri mit aldrimarischen Wurzeln'], ['Erste Übernahme', 'Godwyn Doeths Lagerverwaltung durch Madog und Gwen'], ['Hausphilosophie', 'Ehen verbinden Verwandtschaft, Betriebe und Ressourcen']], biography: buildGwregysduBiography() },
      { schemaVersion: 1, commentThreadKey: 'gwregysdu-hierarchie', pageTitle: 'Haus, Logistik und Rote Kompanie', hierarchyPage: true, hierarchy: buildGwregysduHierarchy() },
      buildGwregysduServices(),
      ...HARBOR_ROOMS.map(room => ({ schemaVersion: 1, commentThreadKey: `gwregysdu-${room.id}`, pageTitle: room.title, ...scene(room.id), sessionPage: true,
        sessionIntro: `<p>${room.intro}</p>`, sessionHint: 'Eine Begegnung an den Lagerhäusern der Gwregysdu.', sessionEmptyTitle: 'Die nächste Fracht ist noch unterwegs', sessionEmptyText: 'Eine Ankunft, eine Prüfung oder ein Gespräch im Kontor kann hier beginnen.', sessionDateAleria: { year: null, month: null, day: null } }))
    ] };
}
