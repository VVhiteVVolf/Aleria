import { office as o, group as g, portrait as p } from '../administration-model.mjs';

export default {
  id: 'magie', title: 'Magie',
  intro: 'Der Ratszauberer berät den Grafen und koordiniert die magischen Belange der Grafschaft. Die vorhandenen Ratsmagier der Vasallen bilden die fachliche Verbindung zu ihren Herrschaften. Myrddins bestehender Haus- und Dienststab bleibt erhalten.',
  groups: [
    g('leitung', 'Ratsmagie der Grafschaft', 'leadership', [o('ratszauberer', 'Ratszauberer des Grafen', 'Myrddin Draig', p('draig', 'myrddin-draig'), 'Berät den Grafen in magischen Fragen und koordiniert bei herrschaftsübergreifenden Gefahren die zuständigen Ratsmagier.', { reportsTo: 'Graf von Celtigerns Wacht', connections: [{ area: 'militaer', label: 'Magische Unterstützung', description: 'Magische Einsätze werden mit der militärischen Führung abgestimmt.' }, { area: 'klerus', label: 'Glaube und Magie', description: 'Geistliche und arkane Fragen werden mit klaren Zuständigkeiten abgestimmt.' }] })]),
    g('adjutantur', 'Persönliche Assistenz und Ausbildung', 'adjutant', [o('lehrling', 'Lehrling des Ratszauberers', 'Rhiannon Draig', p('draig', 'rhiannon-draig'), 'Unterstützt Myrddin im Rahmen ihrer Ausbildung und übernimmt erteilte Aufträge. Ihre bestehende Rolle als Lehrling bleibt erhalten.', { reportsTo: 'Myrddin Draig', authority: 'Ausbildung und beauftragte Assistenz; keine eigenständige Stellung als Ratsmagierin oder ernannte Adjutantin.' })]),
    g('hausstab', 'Hausstab und Lehensdienste', 'service', [
      o('hofgesandter', 'Hofgesandter des Ratsmagiers', 'Rhianu Penwyn', p('penwyn', 'rhianu-penwyn', 'png'), 'Überbringt die Anliegen und abgestimmten Botschaften des Ratsmagiers am Hof.', { reportsTo: 'Ratszauberer des Grafen', connections: [{ area: 'diplomatie', label: 'Botschaften am Hof', description: 'Förmliche auswärtige Zusagen bleiben beim Herold.' }] }),
      o('haushaelt', 'Haushälterin des Ratsmagiers', 'Rhoswyn Awenydd', p('awenydd', 'rhoswyn-penwyn'), 'Ordnet den Haushalt und die täglichen Hausdienste.', { reportsTo: 'Ratszauberer des Grafen' }),
      o('bote', 'Beschaffer und Bote', 'Brychan Awenydd', p('awenydd', 'brychan-awenydd'), 'Besorgt beauftragte Güter und überbringt Nachrichten.', { reportsTo: 'Ratszauberer des Grafen', connections: [{ area: 'finanzen', label: 'Beschaffungsbelege', description: 'Kosten und Übergaben werden der zuständigen Kasse belegt.' }] }),
      o('ritter-rhys', 'Lehensritter des Ratsmagiers', 'Rhys Awenor', p('awenor', 'rhys-awenor'), 'Erfüllt die bestehenden Schutz- und Lehensdienste für den Ratsmagier.', { reportsTo: 'Ratszauberer des Grafen' }),
      o('ritter-rhyd', 'Lehensritter des Ratsmagiers', 'Rhyd Awenor', p('awenor', 'rhyd-awenor'), 'Erfüllt die bestehenden Schutz- und Lehensdienste für den Ratsmagier.', { reportsTo: 'Ratszauberer des Grafen' }),
    ]),
    g('dienste', 'Werkstatt, Archiv und Hof', 'service', [
      o('bors', 'Bursche des Ratsmagiers', 'Bors Awenydd', p('awenydd', 'bors-awenydd'), 'Unterstützt die beauftragten täglichen Haus- und Botendienste.', { reportsTo: 'Hausstab des Ratsmagiers' }),
      o('ludd', 'Bursche des Ratsmagiers', 'Ludd Awenydd', p('awenydd', 'ludd-awenydd'), 'Unterstützt die beauftragten täglichen Haus- und Botendienste.', { reportsTo: 'Hausstab des Ratsmagiers' }),
      o('schmied', 'Schmied des Ratsmagiers', 'Ruarc Balguen', p('awenydd', 'ruarc-balguen'), 'Verantwortet die beauftragten Schmiedearbeiten.', { reportsTo: 'Ratszauberer des Grafen' }),
      o('archivar', 'Archivarin des Ratsmagiers', 'Afallith „Lilith“ Tanwyn', p('draig', 'afallith-lilith-tanwyn'), 'Ordnet das Archiv, verzeichnet Schriften und betreut die beauftragten Abschriften.', { reportsTo: 'Ratszauberer des Grafen', connections: [{ area: 'gerichtsbarkeit', label: 'Beweiskundige Auskunft', description: 'Magische Gutachten werden mit Herkunft und Grenzen dokumentiert.' }] }),
      o('hofmeier', 'Hofmeier des Ratsmagiers', 'Gethor Awenor', p('awenor', 'gethor-awenor'), 'Verwaltet die zugewiesenen Hof- und Versorgungsaufgaben.', { reportsTo: 'Ratszauberer des Grafen' }),
    ]),
  ],
  sources: [{ label: 'Bisheriger Stab des Ratsmagiers', href: '/Kontinente/modules/administration/content/magie.html' }],
};
