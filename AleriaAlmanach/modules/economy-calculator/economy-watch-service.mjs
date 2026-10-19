// Affiliation and task come from the user's definitions, 19 October 2026.
// Factors use the fixed 480 KT reference. Selective military salary revisions
// are applied once by economy-service-income.mjs using militaryStatus.
export const WATCH_SERVICE_GROUPS = [
  { id: 'dorfwache', title: 'Dorfwache', affiliation: 'Örtlicher Wachdienst',
    assignment: 'Weiler, ländliche Region oder kleiner Hof; beispielsweise der Bradrhith-Hof.',
    duty: 'Örtliche Wacht, Beobachtung und Meldungen, Sicherung des zugewiesenen kleinen Bereichs.' },
  { id: 'wachmann', title: 'Wachmann', affiliation: 'Örtlicher oder regionaler Wachdienst',
    assignment: 'Größere Siedlung wie Lysfaen oder das Umland einer Stadt.',
    duty: 'Wachgänge, Zugangskontrolle und Sicherung eines größeren zugewiesenen Bereichs.' },
  { id: 'stadtwache', title: 'Stadtwache', affiliation: 'Die jeweilige Stadt',
    assignment: 'Stadt wie Abergwint oder Gwynthor; eigene benannte Einheit, etwa die Cochllamwyr.',
    duty: 'Organisierter städtischer Wachdienst nach der jeweiligen Dienstordnung.' },
  { id: 'hausmacht', title: 'Hausmacht', affiliation: 'Das jeweilige Adelshaus',
    assignment: 'Persönliches Hausgefolge mit kriegstauglichen Waffenknechten und Hausrittern.',
    duty: 'Militärischer Dienst, Burg- und Besitzschutz, Geleit und Einsatz unter dem Hausbanner.' },
  { id: 'garde', title: 'Garde', affiliation: 'Der jeweilige Träger der Garde',
    assignment: 'Handverlesene vertraute und besonders geeignete Kämpfer: Ritter und Waffenknechte.',
    duty: 'Besonderer Schutz- und Vertrauensdienst. Die Draig-Leibgarde bleibt Teil der Draig-Hausmacht.' }
];

export const WATCH_SERVICE_INCOME = [
  { id: 'dorfwache', title: 'Dorfwache · gewöhnlicher Wachposten', group: 'watch-service', organizationType: 'dorfwache',
    incomeKind: 'salary', incomeLabel: 'Geldlohn für vollen Wachdienst', factor: 0.25, range: [0.225, 0.3],
    note: 'Gewöhnlicher Vollzeitposten. Gelegentlicher Nebendienst oder eine Aufgebotspflicht sind separat nach tatsächlichem Umfang zu bewerten; der Ort allein erzeugt keinen Vollzeitlohn.' },
  { id: 'wachmann', title: 'Wachmann · Siedlung oder Stadtumland', group: 'watch-service', organizationType: 'wachmann',
    incomeKind: 'salary', incomeLabel: 'Geldlohn für vollen Wachdienst', factor: 0.3, range: [0.275, 0.35],
    note: 'Regelmäßiger örtlicher oder regionaler Wachposten. Die Finanzierung durch einen Adeligen macht den örtlichen Wachdienst nicht automatisch zu dessen persönlicher Hausmacht.' },
  { id: 'stadtwache', title: 'Stadtwache · gewöhnlicher Angehöriger', group: 'watch-service', organizationType: 'stadtwache',
    incomeKind: 'salary', incomeLabel: 'Städtischer Geldsold', factor: 0.4, range: [0.35, 0.5],
    note: 'Städtische Einheit mit eigener Zugehörigkeit und Dienstordnung. Der Ansatz enthält weder ein Führungsamt noch eine zusätzliche automatische Gardeprämie wegen des Einheitsnamens.' },
  { id: 'hausmacht-waffenknecht', title: 'Hausmacht · Waffenknecht', group: 'watch-service', organizationType: 'hausmacht', militaryStatus: 'waffenknecht',
    incomeKind: 'salary', incomeLabel: 'Geldsold des Adelshauses', factor: 0.5, range: [0.45, 0.6],
    note: 'Ausgebildeter, kriegstauglicher Waffenknecht im persönlichen Dienst eines Adelshauses. Hausritter werden nach ihrem eigenen Ansatz vergütet; sie gehören ebenfalls zur Hausmacht.' },
  { id: 'garde-waffenknecht', title: 'Garde · Waffenknecht', group: 'watch-service', organizationType: 'garde', militaryStatus: 'waffenknecht',
    incomeKind: 'salary', incomeLabel: 'Gesamter Gardesold', factor: 0.7, range: [0.6, 0.8],
    note: 'Handverlesener Waffenknecht mit besonderem Vertrauen und Kampftauglichkeit. Der Gardesold ersetzt den gewöhnlichen Waffenknechtssold; die Auswahl macht ihn nicht zum Ritter.' },
  { id: 'garde-ritter', title: 'Garde · Ritter', group: 'watch-service', organizationType: 'garde', militaryStatus: 'ritter',
    incomeKind: 'salary', incomeLabel: 'Gesamter ritterlicher Gardesold', factor: 1.25, range: [1.2, 1.5],
    note: 'Handverlesener Ritter im besonderen Schutzdienst. Der Gardesold ersetzt den gewöhnlichen Hausrittersold. Die Gardezugehörigkeit allein verleiht noch keinen Hauptmanns- oder Leutnantsrang.' }
];
