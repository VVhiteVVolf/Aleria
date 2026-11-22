import { GLYNMOR_MEERA, GLYNMOR_TUDUR } from '../../../shared/glynmor/glynmor-identity.mjs';

const art = './assets/glynmor';
export const GLYNMOR_SIGN = `${art}/ladenschild-v1.webp`;
export const glynmorSceneImage = key => `${art}/scenes/${key}-v1.webp`;
export const glynmorServiceIcon = key => `${art}/services/${key}-v1.webp`;
export const glynmorRolePortrait = key => `${art}/roles/${key}-v1.webp`;

export function chandleryIllustration(key) {
  return { image: glynmorSceneImage(key), imageWidth: 36, imageTall: true, imageFit: 'cover', imagePosition: 'center' };
}

export const GLYNMOR_CHANDLERY_SCENES = [
  {
    key: 'gasse',
    title: 'Vor dem Ladenschild',
    intro: 'Über der grünen Tür hängt das Schild mit der brennenden Kerze. Im Fenster stehen helle Lichter in ordentlichen Reihen. Zwischen dem Laden und dem Nachbarhaus führt ein schmaler Steinbogen zu einem rückwärtigen Hof.',
    hint: 'Hier könnt ihr anklopfen, im Schaufenster stöbern oder auf jemanden warten.',
    cast: []
  },
  {
    key: 'laden',
    title: 'An der Ladentheke',
    intro: 'Hinter dem Eichentresen stehen gebündelte Tischkerzen neben einzelnen Festlichtern. Eine brennende Musterkerze zeigt, wie ruhig die Flamme steht. Auf dem Tresen liegen die Waage und das Auftragsbuch.',
    hint: 'Hier könnt ihr Kerzen auswählen, nach einer Anfertigung fragen oder einen Auftrag zur Abholung melden.',
    cast: [GLYNMOR_TUDUR.characterId]
  },
  {
    key: 'ziehwerkstatt',
    title: 'In der Ziehwerkstatt',
    intro: 'Vom Herd kommt ein warmer Duft nach Wachs. An einem Gestell kühlen frisch gezogene Kerzen paarweise aus. Tudur nimmt eine davon vom Stab und prüft sie gegen das Fensterlicht.',
    hint: 'Hier könnt ihr Tudur nach dem Handwerk fragen, eine Probe begutachten oder mit ihm über die Ausführung einer Serie sprechen.',
    cast: [GLYNMOR_TUDUR.characterId]
  },
  {
    key: 'zierkammer',
    title: 'In der Zierkammer',
    intro: 'In der oberen Stube liegen auf dem Arbeitstisch Bänder, getrocknete Blumen und ein Entwurf für ein Tischgesteck. In ihrer freien Zeit arbeitet Meera manchmal hier. Neben dem Fenster ist ein zweiter Schemel frei.',
    hint: 'Hier könnt ihr ein Festarrangement zusammenstellen, eine Wappenvorlage besprechen oder Meera bei einem Besuch begegnen.',
    cast: [GLYNMOR_TUDUR.characterId, GLYNMOR_MEERA.characterId]
  },
  {
    key: 'lager',
    title: 'Im Wachs- und Auftragslager',
    intro: 'Links von der Hoftür liegen Wachsblöcke und Dochtspulen in Regalen. Rechts warten fertig gebundene Kerzenbündel auf ihre Abholung. Das Buch auf dem Pult hält fest, welche Kisten zu welchem Auftrag gehören.',
    hint: 'Hier könnt ihr eine größere Lieferung übergeben, einen Auftrag abholen oder den Bestand mit der Werkstatt abgleichen.',
    cast: [GLYNMOR_TUDUR.characterId]
  }
];
