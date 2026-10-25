export const LAGA_SKELETON_BASE_REVISION = 3;
export const LAGA_SKELETON_REVISION = 4;
export const LAGA_CURRENT_HEAD = 'lugaid-1690-laga';
export const LAGA_SKELETON_NOTE = 'Vorläufiges, vom Nutzer beauftragtes Familiengerüst; Platzhalter und ergänzte Verwandtschaften sind noch nicht als ausgearbeitete Familiengeschichte festgelegt.';

// Nummer, Geschlecht, Geburt, Tod; ein leeres Todesfeld bei datierter Geburt
// bezeichnet die vorläufige lebende Generation im Weltjahr 1740.
export const LAGA_PLACEHOLDERS = Object.freeze([
  [1, 'male', '????', '????'], [2, 'male', '????', '????'],
  [3, 'male', '????', '????'], [4, 'male', '????', '????'],
  [5, 'female', '????', '????'], [6, 'female', '????', '????'],
  [7, 'male', '1120', '1205'], [8, 'male', '1270', '1360'],
  [9, 'male', '1278', '1355'], [10, 'male', '1506', '1594'],
  [11, 'male', '1588', '1667'], [12, 'male', '1610', '1687'],
  [13, 'male', '1613', '1699'], [14, 'female', '1616', '1696'],
  [15, 'male', '1639', '1718'], [16, 'male', '1643', '1728'],
  [17, 'male', '1646', '1729'], [18, 'female', '1652', '1734'],
  [19, 'male', '1665', '1730'], [20, 'male', '1669', ''],
  [21, 'female', '1678', ''], [22, 'female', '1682', ''],
  [23, 'male', '1686', ''], [24, 'male', '1676', ''],
  [25, 'female', '1681', ''], [26, 'male', '1693', ''],
  [27, 'female', '1697', ''], [28, 'male', '1700', ''],
  [29, 'female', '1705', ''], [30, 'female', '1715', ''],
  [31, 'male', '1720', ''], [32, 'male', '1703', ''],
  [33, 'female', '1708', ''], [34, 'male', '1718', ''],
  [35, 'female', '1723', ''], [36, 'male', '1726', ''],
  [37, 'female', '1730', ''], [38, 'female', '1731', ''],
  [39, 'male', '1735', '']
]);

// Jeder ALaga-Platzhalter trägt dieselbe Nummer wie sein Ehepartner.
export const LAGA_PLACEHOLDER_PARTNERS = Object.freeze([
  [1, '????', '????'], [2, '????', '????'], [3, '????', '????'],
  [4, '????', '????'], [5, '????', '????'], [6, '????', '????'],
  [7, '1123', '1202'], [8, '1274', '1350'], [9, '1280', '1362'],
  [10, '1511', '1590'], [11, '1590', '1668'], [12, '1615', '1693'],
  [13, '1618', '1701'], [14, '1612', '1689'], [15, '1644', '1724'],
  [16, '1647', '1731'], [17, '1650', '1731'], [18, '1649', '1733'],
  [19, '1670', '1736'], [20, '1673', ''], [21, '1674', ''],
  [22, '1679', ''], [23, '1691', ''], [24, '1680', ''],
  [25, '1679', ''], [26, '1697', ''], [27, '1692', ''],
  [28, '1704', ''], [32, '1707', '']
]);

export const LAGA_HEAD_NUMBERS = Object.freeze([1, 2, 7, 8, 10, 11, 12, 15, 19]);
export const LAGA_AWAY_NUMBERS = Object.freeze([5, 6, 14, 18, 21, 22, 25, 27]);

export const LAGA_CORE_CHILDREN = Object.freeze([
  { id: 'aibhilin-laga', name: 'Aibhilin Laga', sex: 'female', birth: '1713' },
  { id: 'brothaigh-laga', name: 'Brothaigh Laga', sex: 'male', birth: '1717' },
  { id: 'sheena-laga', name: 'Sheena Laga', sex: 'female', birth: '1722' }
]);

export const LAGA_WARD_GUARDIANS = Object.freeze({
  'ciara-1729-morna': 'laga0023',
  'ronan-1729-eoghainn': 'laga0024',
  'artair-1721-ronain': 'laga0026'
});

// Direkte Gerüstgenerationen; Nummern beziehen sich ausschließlich auf LagaNNNN.
export const LAGA_DIRECT_GENERATIONS = Object.freeze([
  { parent: 1, children: [2, 3, 4, 5, 6] },
  { parent: 3, children: ['luibheas-founder-laga', 'meadhbh-founder-laga', 'seonaid-founder-laga'] },
  { parent: 11, children: ['fiadh-1608-laga', 12, 13, 14, 'laoise-laga', 'maolmhuire-1626-laga'] },
  { parent: 12, children: [15, 16, 'duibhseach-1650-laga', 'fionnchu-laga'] },
  { parent: 13, children: [17, 18] },
  { parent: 15, children: [19, 20, 'glaodhaich-1675-laga', 21] },
  { parent: 16, children: [22, 23] },
  { parent: 17, children: [24, 25] },
  { parent: 19, children: ['lagaid-1689-laga', LAGA_CURRENT_HEAD, 26, 27] },
  { parent: 20, children: [28, 29] },
  { parent: 23, children: [30, 31] },
  { parent: 24, children: [32, 33] },
  { parent: 26, children: [34, 35] },
  { parent: 28, children: [36, 37] },
  { parent: 32, children: [38, 39] }
]);

// Überlieferungslücken sind ausdrücklich keine direkten Eltern-Kind-Beziehungen.
export const LAGA_GAPS = Object.freeze([
  { parent: 2, children: [7, 'laoise-1125-laga'], toYear: '1120' },
  { parent: 7, children: [8, 'quilline-1275-laga', 9], toYear: '1270' },
  { parent: 8, children: [10, 'meabhrog-1510-laga'], toYear: '1506' },
  { parent: 10, children: [11, 'clodagh-laga'], toYear: '1588' }
]);
