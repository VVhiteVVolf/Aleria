// Zusätzliche Ceitheacher Clans aus den sechs Oberherrschaftstabellen.
// Präfixe sind Teil des überlieferten Namens und begründen keinen Hausrang.
export const CEITHEACH_TERRITORIAL_SOURCES = Object.freeze([
  { territory: 'Tir na Cruach', attachmentId: '6c59d270-5456-4497-bf9f-8bc085903a34', mainFamilyId: 'haus-ui-rochraide', sourceSeat: 'Carraighreach', sourceName: "Faill Ui 'Rochraide" },
  { territory: 'Tir na Scian', attachmentId: '8e03ac86-ed6a-4fad-af59-be53a955673d', mainFamilyId: 'haus-nic-blar', sourceSeat: 'Sioran', sourceName: 'Nic Blar' },
  { territory: 'Tir na Dorcha', attachmentId: '2340e2ca-81aa-4b04-9482-298e48bf75c9', mainFamilyId: 'haus-mac-tuirseach', sourceSeat: 'Lochanach', sourceName: 'Mac Tuirseach' },
  { territory: 'Tir na Dun', attachmentId: '113de06b-d1b1-4aad-b493-ac585c440ecc', mainFamilyId: 'haus-dal-leite', sourceSeat: 'Greinmhar', sourceName: "Dal'Leite" },
  { territory: 'Tir na Ceo', attachmentId: '5b6e9c1b-120c-4be5-a3b2-161ffaaed8b5', mainFamilyId: 'haus-nic-holloran', sourceSeat: 'Tirscath', sourceName: 'Nic Holloran' },
  { territory: 'Tir na Toraidh', attachmentId: '47abcee4-543b-47d5-b2ee-167eaeaab65e', mainFamilyId: 'haus-ua-nic-ceinselaig', sourceSeat: 'Bruachan', sourceName: "Ua' Nic Ceinselaig" }
].map(source => Object.freeze(source)));

export const CEITHEACH_DEPENDENT_CLANS = Object.freeze([
  { familyId: 'haus-craobhan', houseId: 'house-craobhan', title: 'Tir an Craobhan', sourceName: 'Tir an Craobhan', territory: 'Tir na Cruach', seat: 'Carraigreach', sourceSeat: 'Carraighreach', rankId: 'unknown', sourceColumn: 0, emblemSource: 'https://i.imgur.com/5wJbjFV.png', emblemPath: 'assets/images/houses/Ceitheach/clan-tir-an-craobhan.png' },
  { familyId: 'haus-eldath', houseId: 'house-eldath', title: 'Fáill Ua’Eldath', sourceName: "Fáill Ua 'Eldath", territory: 'Tir na Cruach', seat: 'Carraigreach', sourceSeat: 'Carraighreach', rankId: 'unknown', sourceColumn: 1, emblemSource: 'https://i.imgur.com/X4uOWk0.png', emblemPath: 'assets/images/houses/Ceitheach/clan-faill-ua-eldath.png' },
  { familyId: 'haus-eamhra', houseId: 'house-eamhra', title: 'Fáill Mallacht Eamhra', sourceName: 'Fáill Mallacht Eamhra', territory: 'Tir na Cruach', seat: 'Tineach', sourceSeat: 'Tineach', rankId: 'unknown', sourceColumn: 2, emblemSource: 'https://i.imgur.com/JZykg5E.png', emblemPath: 'assets/images/houses/Ceitheach/clan-faill-mallacht-eamhra.png' },
  { familyId: 'haus-seaghda', houseId: 'house-seaghda', title: 'Mallacht Seaghda', sourceName: 'Mallacht Seaghda', territory: 'Tir na Dorcha', seat: 'Glaennmor', sourceSeat: 'Glaennmor', rankId: 'unknown', sourceColumn: 0, emblemSource: 'https://i.imgur.com/2HRc9fV.png', emblemPath: 'assets/images/houses/Ceitheach/clan-mallacht-seaghda.png' },
  { familyId: 'haus-somhairle', houseId: 'house-somhairle', title: 'Sidhe Somhairle', sourceName: 'Sidhe Somhairle', territory: 'Tir na Dun', seat: 'Glaennmor', sourceSeat: 'Glaennmor', rankId: 'laird', sourceColumn: 0, emblemSource: 'https://i.imgur.com/5gIpcrz.png', emblemPath: 'assets/images/houses/Leitheach/clan-sidhe-somhairle.png', existing: true, placementRole: 'origin' },
  { familyId: 'haus-an-morchoe', houseId: 'house-an-morchoe', title: 'An’Morchoe', sourceName: "An'Morchoe", territory: 'Tir na Ceo', seat: 'Sruthbruach', sourceSeat: 'Sruthbruach', rankId: 'unknown', sourceColumn: 0, emblemSource: 'https://i.imgur.com/GfdwYmG.png', emblemPath: 'assets/images/houses/Ceitheach/clan-an-morchoe.png' },
  { familyId: 'haus-tir-an-tordarroch', houseId: 'house-tir-an-tordarroch', title: 'Tir An’Tordarroch', sourceName: "Tir An' Tordarroch", territory: 'Tir na Toraidh', seat: 'Teorannach', sourceSeat: 'Teorannach', rankId: 'unknown', sourceColumn: 0, emblemSource: 'https://i.imgur.com/ZVXvAfO.png', emblemPath: 'assets/images/houses/Ceitheach/clan-tir-an-tordarroch.png' },
  { familyId: 'haus-an-bhaird', houseId: 'house-an-bhaird', title: 'An’Bhaird', sourceName: "An'Bhaird", territory: 'Tir na Toraidh', seat: 'Lochmorach', sourceSeat: 'Lochmorach', rankId: 'unknown', sourceColumn: 1, emblemSource: 'https://i.imgur.com/Z7dNqR1.png', emblemPath: 'assets/images/houses/Ceitheach/clan-an-bhaird.png' }
].map(clan => {
  const source = CEITHEACH_TERRITORIAL_SOURCES.find(entry => entry.territory === clan.territory);
  return Object.freeze({
    ...clan,
    existing: clan.existing === true,
    attachmentId: source.attachmentId,
    liegeFamilyId: source.mainFamilyId,
    sourceNameRow: 80,
    sourceSeatRow: 78,
    sourceEmblemRow: 79,
    folderPath: Object.freeze(['Ceitheach', clan.territory, clan.seat])
  });
}));
