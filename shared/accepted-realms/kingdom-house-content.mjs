// Cultural and historical prose for the three kingdoms admitted on 1 November.
// The common house adapter continues to own links, biography and page structure.
import { houseHref, houseTitle } from './territory-topology.mjs';

export function enrichKingdomHouseContent(content, realm, house, seat, territory) {
  const old = !!realm.historical, name = content.name;
  const rank = house.rankId === 'unknown' ? 'Sein genauer Adelsrang ist noch nicht überliefert.' : `${old ? 'Sein Rang war' : 'Sein Rang ist'} ${house.rank}.`;
  const overview = [
    `${name} ${old || house.extinct ? 'hatte' : 'hat'} seinen Sitz in ${seat.name}. ${rank}`,
    house.knownDescription || '',
    house.focus ? `${old ? 'Zu seinen Schwerpunkten gehörten' : 'Zu seinen Schwerpunkten gehören'} ${house.focus}` : '',
    house.liegeId ? content.sections.overview[2] : house.id === realm.ruler ? `${name} ${old ? 'hatte die Krone des Landes getragen' : 'trägt die Krone des Landes'}.` : 'Die Landeszugehörigkeit und der Sitz stehen fest; ein unmittelbarer Lehnsherr ist noch nicht belegt.',
    ...(house.extinct ? [`${name} ist ausgestorben. Die Sitzzuordnung und die Hausdarstellung sind historisch zu verstehen; ein Erlöschensjahr ist nicht überliefert.`] : []),
    ...(house.homeless ? ['Das Haus ist heute heimatlos. Die Zuordnung zu Wensbury bezeichnet seine überlieferte Heimat; sie belegt weder einen wiedergewonnenen Sitz noch Refris heutigen Wohnort.'] : []),
  ].filter(Boolean);
  const history = [
    house.existingFamily ? 'Die vorhandene Familienakte bleibt mit ihren Personen, Lebensdaten, Porträts und Beziehungen erhalten.' : 'Gründungsjahr, erste Hausführung und Verwandtschaftsverbindungen sind noch nicht überliefert. Die vorbereitete Familienakte enthält deshalb keine erfundenen Angehörigen.',
    ...(house.formerSeat ? [`Der frühere konkrete Sitz war ${house.formerSeat}. Sein Verlust und die überlieferte Lebensgeschichte Refris bleiben von der örtlichen Zuordnung getrennt.`] : []),
    ...(old ? [`${realm.name} wurde von der Triarchie unterworfen. Die hier beschriebene Rang- und Sitzordnung gehörte zur früheren Eigenständigkeit des Königreichs. Für das einzelne Haus sind weder Unterwerfung noch Widerstand pauschal belegt.`] : []),
    ...(house.extinct ? ['Ein Ende des Hauses ist ausdrücklich vermerkt; namentliche letzte Angehörige und das genaue Ende seiner Linie sind noch nicht ausgearbeitet.'] : []),
  ];
  const holdings = [
    `${seat.name} ${old || house.extinct ? 'bildete' : 'bildet'} den örtlichen Bezug des Hauses. ${seat.geography || ''}`,
    house.isSeatRuler ? `Die zugehörige Herrschaftsakte ist ${territory.name}. Einzelne Höfe, Zölle und Einkünfte sind noch nicht benannt.` : 'Die Zuordnung bezeichnet den Sitz des Hauses innerhalb des Orts. Sie begründet kein zusätzliches flächiges Lehen und keine Herrschaft über andere dort ansässige Häuser.',
    ...(['Bistum', 'Ritterlicher Orden'].includes(seat.kind) ? ['Die geistliche Einordnung des Gebiets bleibt erhalten. Aus dem Sitz eines Adelshauses folgt keine Besetzung des Bischofs- oder Ordensamts.'] : []),
  ];
  const culture = realm.id === 'aeldrunmar' ? 'Das Haus gehört zur aeldrunmarischen Kultur, die aus dem friedlichen Zusammenleben und den Heiraten mit den einheimischen Alben hervorging. Reitkunst, Landwirtschaft, Viehzucht, Seefahrt und Handel prägen das Land.'
    : realm.id === 'brevanor' ? 'Das Haus gehörte zur höfischen Kultur Brevanors. Ritterromantik, Heldengeschichten, Wein und festliche Tafeln prägten das alte Königreich. Seine älteren Wurzeln lagen bei den Briath und im Fürstentum Brethneach.'
      : 'Das Haus gehörte zu Talyndor, dem Bruderkönigreich Aeldrunmars. Agrarkultur, Rittertum und die Ausbildung schwerer Fußkämpfer prägten seine überlieferte Heimat.';
  content.contentVersion = 'accepted-kingdoms-20261101';
  content.biographySourceRevision = 3;
  content.extinct = !!house.extinct;
  const aliveHeads = (house.knownHeads || []).filter(h => h.status === 'alive');
  content.currentHead = house.extinct ? 'Haus ausgestorben' : aliveHeads.length === 1 ? aliveHeads[0].name : aliveHeads.length > 1 ? 'Nicht eindeutig überliefert' : 'Noch nicht benannt';
  content.heads = content.heads.map(h => ({ ...h, role: house.knownHeads.find(k => k.id === h.id)?.role || 'Überliefertes Hausoberhaupt' }));
  content.profile.people = realm.people;
  content.profile.houseType = 'Adliges Haus';
  content.profile.milestoneOne = old ? 'Unterwerfung des Königreichs durch die Triarchie' : 'Noch nicht überliefert';
  content.profile.seat = `${old || house.extinct ? 'Ehemals ' : ''}${seat.name}`;
  content.biographySummary.overview = overview.join('\n\n');
  content.biographySummary.history = history.join('\n\n');
  content.biographySummary.holdings = holdings.join('\n\n');
  content.biographySummary.culture = culture;
  content.sections.overview = overview;
  content.sections.history = history;
  content.sections.holdings = holdings;
  content.sections.cultureReligion = [culture, 'Eigene Glaubensämter und Schutzpatrone sind noch nicht gesondert überliefert.'];
  content.sections.familyTree = [house.existingFamily ? 'Der vorhandene Stammbaum bleibt mit allen überlieferten Personen und Verbindungen erhalten.' : 'Die Familienakte ist angelegt. Namen, Lebensdaten, Elternschaften und Ehen werden erst nach ihrer Ausarbeitung ergänzt.'];
  if (old) {
    content.sections.conflictsAlliances.push('Die gegenwärtige Besatzung durch die Triarchie wird von der historischen Lehnsordnung getrennt geführt.');
    content.biographySummary.relations = content.sections.conflictsAlliances.join('\n\n');
  }
  if (house.showVassalDirectory) {
    const vassals = realm.houses.filter(h => h.liegeId === house.id && !h.extinct);
    const names = vassals.map(h => `${houseTitle(h)} (${realm.settlementsById.get(h.seatId).name})`);
    content.sections.conflictsAlliances.push(`Unmittelbare Vasallen sind ${names.join(', ')}.`);
    content.biographySummary.relations = content.sections.conflictsAlliances.filter(Boolean).join('\n\n');
    content.relatedRecords.push(...vassals.map(h => ({
      title: houseTitle(h), text: `${h.rank} · Sitz: ${realm.settlementsById.get(h.seatId).name} · Unmittelbarer Vasall von ${name}.`,
      link: houseHref(h), icon: h.crest,
    })));
    content.contentVersion = 'accepted-tharn-20261102';
    content.biographySourceRevision = 4;
  }
  content.trivia = house.extinct ? ['Ausgestorbenes Haus; historischer Sitz und Darstellung.'] : old ? ['Die Unterwerfung des Landes beweist kein Aussterben des Hauses.'] : [];
  if (!house.warrior) {
    content.sections.knighthood = ['Eine eigene vollständige Hauskriegerdarstellung ist noch nicht überliefert. Bekannte Personenporträts bleiben im Stammbaum erreichbar.'];
    content.warriorGallery.entries = [];
  }
  return content;
}
