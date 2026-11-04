// Body, build and physical senses. These never change ancestry or genealogy.
const skill=(name,bonus)=>({name,bonus});
export const BODY_TRAIT_DEFINITIONS = [
 ['vollbusig','Vollbusig','Ausgeprägte Brustform als rein beschreibendes Körpermerkmal; keine pauschale Änderung sozialer Fertigkeiten.',{},0],
 ['haesslich','Hässlich','Als unvorteilhaft wahrgenommene Gesichtszüge; −1 auf Flirten. Die Erscheinung erzeugt keine zusätzliche Einschüchterungsfertigkeit.',{skillModifiers:[skill('Flirten',-1)]},-1],
 ['gutaussehend','Gutaussehend','Als ansprechend wahrgenommene Gesichtszüge; +1 auf Flirten. Der kleine Eindrucksbonus ersetzt keine Überzeugungs- oder Bühnenausbildung.',{skillModifiers:[skill('Flirten',1)]},1],
 ['fit','Fit','Trainierter Körper; +2 auf Athletik und +2 maximale TP.',{skillModifiers:[skill('Athletik',2)],maximumHitPoints:2},2],
 ['fragil','Fragil','Empfindlicher Körperbau; −4 maximale TP und −1 auf KON-Rettungswürfe.',{maximumHitPoints:-4,saveAttributeModifiers:[{attributeKey:'constitution',bonus:-1}]},-3],
 ['schmaechtig','Schmächtig','Schmaler, leichter Körperbau; −2 auf Athletik, +1 auf Akrobatik und Heimlichkeit.',{skillModifiers:[skill('Athletik',-2),skill('Akrobatik',1),skill('Heimlichkeit',1)]},0],
 ['klein','Klein','Unterdurchschnittliche Körpergröße; +1 auf Heimlichkeit und −1 auf Athletik.',{skillModifiers:[skill('Heimlichkeit',1),skill('Athletik',-1)]},0],
 ['gross','Groß','Überdurchschnittliche Körpergröße; +1 auf Athletik und −1 auf Heimlichkeit.',{skillModifiers:[skill('Athletik',1),skill('Heimlichkeit',-1)]},0],
 ['huenenhaft','Hünenhaft','Sehr großer, kräftiger Körper; +4 maximale TP und +2 auf Athletik, −2 auf Akrobatik.',{maximumHitPoints:4,skillModifiers:[skill('Athletik',2),skill('Akrobatik',-2)]},2],
 ['riesenblut','Riesenblut','Außergewöhnlich massiger Körperbau; +6 maximale TP und +1 auf Athletik, −1 Initiative und −1 auf Heimlichkeit. Keine automatische Änderung der Rasse oder Abstammungsakte.',{maximumHitPoints:6,initiative:-1,skillModifiers:[skill('Athletik',1),skill('Heimlichkeit',-1)]},2],
 ['breitschultrig','Breitschultrig','Breite Schultern und kräftiger Oberkörper; +1 auf Athletik. Schulterbreite beeinträchtigt nicht automatisch die Feinmotorik.',{skillModifiers:[skill('Athletik',1)]},1],
 ['sehnig','Sehnig','Drahtiger Körper mit kräftigen Sehnen; +1 auf Athletik und Akrobatik.',{skillModifiers:[skill('Athletik',1),skill('Akrobatik',1)]},1],
 ['gelenkig','Gelenkig','Große Beweglichkeit; +2 auf Akrobatik und +1 auf Fingerfertigkeit.',{skillModifiers:[skill('Akrobatik',2),skill('Fingerfertigkeit',1)]},2],
 ['steife-gelenke','Steife Gelenke','Eingeschränkte Gelenkbeweglichkeit; −2 auf Akrobatik und −1 m Bewegung.',{movement:-1,skillModifiers:[skill('Akrobatik',-2)]},-2],
 ['scharfe-augen','Scharfe Augen','+2 auf Wahrnehmung und zusätzlich +1 passive Wahrnehmung. Die passive Wahrnehmung steigt dadurch insgesamt um 3.',{skillModifiers:[skill('Wahrnehmung',2)],passivePerception:1},2],
 ['schwerhoerig','Schwerhörig','Eingeschränktes Hörvermögen; −2 auf Wahrnehmung. Der gespeicherte Abzug ist ein allgemeiner Probenabzug.',{skillModifiers:[skill('Wahrnehmung',-2)]},-1],
 ['eiserne-lunge','Eiserne Lunge','Kräftige Lunge und große Ausdauer; +1 auf KON-Rettungswürfe und +1 auf Athletik.',{saveAttributeModifiers:[{attributeKey:'constitution',bonus:1}],skillModifiers:[skill('Athletik',1)]},2],
 ['schneller-stoffwechsel','Schneller Stoffwechsel','Leichter, rasch ermüdender Körper; +1 m Bewegung und −2 maximale TP.',{movement:1,maximumHitPoints:-2},0],
 ['schwere-knochen','Schwere Knochen','Dichter, schwerer Knochenbau; +3 maximale TP und −1 Initiative.',{maximumHitPoints:3,initiative:-1},1],
 ['robuste-haut','Robuste Haut','Widerstandsfähige, vernarbte Haut; +1 RK und −1 auf Auftreten.',{armorClass:1,skillModifiers:[skill('Auftreten',-1)]},2]
];
