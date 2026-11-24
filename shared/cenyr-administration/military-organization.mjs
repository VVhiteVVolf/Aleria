import { geographicKey } from '../world-directory/geographic-key.mjs';

export const CENYR_MARSHAL_DUTY = 'Der Marschall ist der oberste militärische Amtsträger seiner Herrschaft. Er befehligt ihre Ortswachen und führt das Heer gemeinsam mit den ihm unterstellten Kommandanten der Hausmacht. Die Befehlsgewalt gegenüber einem anderen Adelshaus richtet sich nach Lehnsrang und Aufgebot.';

export const CENYR_HOUSE_COMMAND = 'Der Kommandant ist der oberste Befehlshaber der vom Adelshaus selbst aufgestellten und ausgebildeten Hausritter, Waffenknechte und der Leibgarde. Er untersteht dem zuständigen Marschall und führt mit ihm das Heer. Der Kommandant der Draigs untersteht dem Grafschaftsmarschall, der Kommandant der Gafyr dem Marschall seiner Herrschaft und beim Aufgebot der zuständigen höheren Führung.';

export const CENYR_FORCES = [
  { id: 'hausmacht', title: 'Hausmacht', text: 'Hausritter und Waffenknechte bilden das Heer ihres Adelshauses. Die Leibgarde ist ein eigener, ausgewählter Teil der Hausmacht und schützt die Mitglieder des Hauses persönlich. Ein Standort bezeichnet die Stationierung einer Einheit. Die Einheit gehört weiterhin dem Haus.' },
  { id: 'wache', title: 'Wache', text: 'Eine Wache gehört zu ihrem Ort, ob Stadt, Dorf, Turm oder Kirche. Der zuständige Marschall befehligt die Ortswachen. Ihre Hauptleute führen den örtlichen Dienst und melden an seine Struktur.' },
  { id: 'vasallen', title: 'Vasallentruppen', text: 'Beim Ruf zu den Bannern stellen die Vasallen ihrem Lehnsherrn ihre eigenen Hausmächte. Wenn der Graf von Celtigerns Wacht aufbietet, folgen etwa Gafyr, Saethwyr und Wyrm mit den Truppen ihrer Häuser.' },
  { id: 'kirche', title: 'Kirchliches Aufgebot', text: 'Das kirchliche Aufgebot gehört zur jeweiligen Kirche oder zum kirchlichen Ort. Schwurritter und andere kirchliche Kräfte folgen der geistlichen Befehlskette.' },
  { id: 'extern', title: 'Externes Aufgebot', text: 'Eine Stadt, Kolonie oder Gilde kann Söldner für Wach- und Heeresdienst anwerben. Auftrag und Führung richten sich nach dem Vertrag und ihrer eigenen Ordnung. Die Klingende Münze lässt ihre Handelsposten von eigenen Condottieri führen und bewachen.' },
];

export const RETIRED_WATCH_MARSHAL = { wachtmarschall: null };

export const FLOTILLA_ROLE = {
  id: 'r-flottillenadmiral', title: 'Flottillenadmiral', description: 'Führt eine zugeteilte Flottille und berichtet über ihre Bereitschaft.',
};
export const SEA_CAPTAIN_ROLE = {
  id: 'r-kapitaen', title: 'Kapitän zur See', description: 'Führt ein zugeteiltes Schiff und seine Besatzung.',
};

export function repeatableNavalPost(slot, template) {
  return { ...slot, kind: 'other', stationed: true,
    templateId: template.id, templateTitle: template.title, templateDescription: template.description };
}

export const watchOfficeId = name => 'wacht-' + geographicKey(name).replace(/^twr/u, '');

export function watchSection(places, reportsTo, overrides = {}) {
  return {
    id: 'militaer-ortswachen', title: 'Ortswachen', icon: 'watch',
    description: 'Die Wachen gehören zu ihren Orten. Ihre Hauptleute führen den örtlichen Dienst unter dem zuständigen Marschall.',
    slots: places.map(({ name }) => ({
      id: watchOfficeId(name), place: name, icon: 'watch',
      title: 'Hauptmann der Wache von ' + name, reportsTo,
      description: 'Führt die Wache des Ortes, teilt den Dienst ein und meldet Vorfälle an die Marschallführung.',
      ...overrides[name],
    })),
  };
}

export function watchServiceSection(roles = []) {
  return {
    id: 'ortswachdienst', title: 'Dienst in den Ortswachen', icon: 'watch', repeatableHere: true,
    description: 'Wachoffiziere, Unteroffiziere und Wachleute dienen unter dem Hauptmann ihrer jeweiligen Wache.',
    slots: [
      ...roles,
      { id: 'wachoffizier', title: 'Leutnant und Wachoffizier', description: 'Organisiert Schichten und Ablösung seiner Wache.' },
      { id: 'unteroffizier', title: 'Unteroffizier der Ortswache', description: 'Führt die ihm zugewiesenen Wachgruppen.' },
      { id: 'wachmann', title: 'Wachmann der Ortswache', description: 'Versieht den Wach- und Streifendienst des Ortes.' },
    ].map(role => ({ reportsTo: 'dem Hauptmann der Ortswache', kind: 'service', ...role })),
  };
}
