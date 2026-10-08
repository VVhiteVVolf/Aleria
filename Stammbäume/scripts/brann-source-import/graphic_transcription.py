"""Manual card transcription. Raw diagram dates remain separate from corrections.

Rows identify generations; partner cards occupy the following row. Dagger marks
are evidence of death, never evidence of a particular death year.
"""
GRAPHIC_ROWS = {
 'wemyss': {
  0:'†Puirséil|?;†Wrantha|?',
  10:'†Gilleasbuig|1580;†Eimhear|1584',11:'†Oighreag Carnegie|1583;†Torcall Airdmhor|?',
  20:'†Puirséil|1605;†Wrantha|1608;†Toirberth|1610',21:'†Dúnlaith Conochbhair|1609;†Ruaidhrí Lockart|1606;†Uallach Brigantach|1612',
  30:'†Gilleasbuig|1627;†Doileag|1632;†Uaithear|1630',31:'†Rhona Dubglais|1630;†Enda Magach|1632;†Kessog Neill|1635',
  40:'†Wiochán|1651;†Iarbhine|1654;†Peadaróg|1654;†Seallach|1658',41:'†Paislie Airdmhor|1653;†Cairbre Carnegie|1651;†Seallach Salaig|1657;†Breasal Eoghainn|1656',
  50:'†Puirséil|1672;Pailís|1677;†Kianán|1677;†Peathra|1680',51:'†Máiréad Rieach|1676;Nuallán Fiorghra|1676;†Cacht Rowak|1680;†Glyndwr Gwenyen|1678',
  60:'†Toirberth|1694;†Wrantha|1696;†Gilleasbuig|1702;†Slaine|1701;Kenneth|1706',61:'†Oirigh Grodach|1696;†Caorthann Dubglais|1692;†Garvan Airdmhor|1700;Unbenannte Geliebte Kenneths|1710;Lagertha Grimr|?',
  70:'†Wiochán|1714;Unbenanntes Kind|1729;Unbenanntes Kind|1734;Unbenanntes Kind|1732;Unbenanntes Kind|1736'
 },
 'dubglais': {
  0:'†Taranach|?;†Morrígan|?',
  10:'†Mael|?;†Quiseog|?',11:'†Ceithre Fionnghal|?;†Treabhán Eilitard|?',
  20:'†Balor|?;†Faolán|?',21:'†Vairbh Grodach|?;†Catania|?',
  30:'†Taranach|1558;†Morrígan|1562;†Dubhshláine|1562',31:'†Máille Lachlann|1560;†Cainneach Urquhart|1562;†Éadaoin Cléirigh|1565',
  40:'†Donncadh|1580;†Saoirse|1581;†Cathmor|1586',41:'†Clíona Urquhart|1588;†Eldgrim Varulv|1580;†Nóracha Buadhtreun|1591',
  50:'†Maeldun|1605;†Liath|1609;†Torcall|1609;†Deirdre|1614',51:'†Kermena Haig|1606;†Breasal Airdmhor|1606;†Lannraig Oglivy|1610;†Cormac Diuid|1610',
  60:'†Caorthann|1625;†Rhona|1630;†Kenna|1632;†Lulach|1635',61:'†Peagan Carnegie|1626;†Gilleasbuig Wemyss|1627;†Treabhán Culloch|?;†Baodhneidd Bennyn|1631',
  70:'†Cathmor|1650;†Maeve|1652;†Bardan|1655;†Aigneís|1655',71:'†Sadhbh Diuid|1646;†Wighnán Buadhtreun|1650;†Oirigh Airdmhor|1658;†Thalen Aebhric|1654',
  80:'†Taranach|1665;Fenella|1670;Pórlach|1677;†Sorcha|1677;†Malachy|1679',81:'†Tuiren Culloch|1668;†Lagertha Wellenkrone|?;Fáithleach Forsyth|1664;†Alasdair Urquhart|1674;†Iosnán Duff|?;†Vearga Eoghainn|1679',
  90:'†Maeldun|1690;†Caorthann|1692;Deirdre|1694;Blythe|1697;Rory|1699;†Balor|1703;†Ultan|1700;†Cairbre|1705',91:'†Quibhná Damona|1694;†Wrantha Wemyss|1696;Outhach Brigantach|1692;Sadwrn Blaidd|1694;Tavish Airdmhor|1704;Unbenannte Geliebte Rorys I|?;Unbenannte Geliebte Rorys II|?;Lagertha Grimr|?;†Vearga Muirgheal|1699',
  100:'†Torcall|1712;†Cathmor|1714;†Morrígan|1716;†Suibhne|1714;†Lorcan|1716;Vaelor|?;Móirín|?;Kaelmor|?;Unbenanntes Kind|?;Unbenanntes Kind|?;Veyran|?'
 },
 'airdmhor': {
  0:'†Faolán Dubglais|?;†Catania|?',
  10:'†Noghán|1120;†Medb|1125',11:'†Hafren Hebog|1124;Rothniam Gealán|1118',
  20:'†Torcall|1581;†Maeve|1584',21:'†Eimhear Wemyss|1584;†Cairbre Carnegie|1579',
  30:'†Breasal|1606;†Catania|1608;†Garvan|1610',31:'†Liath Dubglais|1609;†Rúairc Lockart|1600;†Eilidh Cullen|1612',
  40:'†Faolán|1627;†Macha|1631;†Cathal|1630',41:'†Haileigh Rieach|1630;†Cathbad Carnegie|1628;†Keebh Haig|1633',
  50:'†Noghán|1648;†Paislie|1653;†Conall|1653;†Oirigh|1658',51:'†Nabhán Conochbhair|1653;†Wiochán Wemyss|1651;†Yluach Damona|1658;†Bardan Dubglais|1655',
  60:'Etain|1672;†Torcall|1674;Eoghan|1678',61:'Feargal Dundas|1674;Dechtire Ardmhair|1677;Nymriel Bhodhráin|1681',
  70:'Faolán|1695;Tavish|1704;Breasal|1706;†Garvan|1700;Catania|1704',71:'Ailís Dianaomh|1698;Rory Dubglais|1699;†Slaine Wemyss|1701;Sluaghán Carnegie|1701',
  80:'Cathal|1719;Vaelor|?;Móirín|?'
 },
 'cerneige': {
  0:'†Híomhar|?;†Uisigh|?',
  10:'†Cairbre|1579;†Oighreag|1583',11:'†Maeve Airdmhor|1584;†Gilleasbuig Wemyss|1580',
  20:'†Híomhar|1602;†Éadaoin|1609;†Uisigh|1613;†Tormodh|1615',21:'†Jilbhe Goidin|1605;†Goraidhas Tordarroch|1605;†Comgall Ailella|1610;†Sorcha Cannog|1617',
  30:'†Peagan|1626;†Cathbad|1628;†Ruaidhrígh|1635;†Peatharlach|1636',31:'†Caorthann Dubglais|1625;†Macha Airdmhor|1631;†Maebh Giolla|1638;†Tadhg Lockart|?',
  40:'†Cairbre|1651;†Úirghlinn|1655;†Uaithneach|1657;†Hairbhinn|1657',41:'†Iarbhine Wemyss|1654;†Artán Dianaomh|1655;†Dervla Rieach|1659;†Caolan Drummond|1655',
  50:'†Tormodh|1673;Uisigh|1675;Vadria|1680;Vaithreach|1678',51:'†Tuiren Giolla|1676;Murdoch Fiorghra|1674;Garvan Diuid|1676;Lorellín Dämmerbaum|1682',
  60:'†Ruaidhrígh|1694;Neidín|1699;†Cathbad|1672;Sluaghán|1701;Duibhseach|1705;Uidhir|1708',61:'†Gráinne Grodach|1696;Fiachra Urquhart|1696;Catania Airdmhor|1704;Odrán Haig|1700;Liosa Cannog|1712',
  70:'†Uisigh|1716;Vearan|1726;Vadria|1730;Keitha|1729;Quion|1733'
 }
}

def cards():
    output = []
    for slug, generations in GRAPHIC_ROWS.items():
        for row, text in generations.items():
            for column, entry in enumerate(text.split(';')):
                name, birth = entry.split('|')
                dead = name.startswith('†')
                output.append({
                    'ref': f'{slug}:{row}:{column}', 'slug': slug, 'row': row, 'column': column,
                    'name': name.lstrip('†'), 'birth': '????' if birth == '?' else birth,
                    'death': '????' if dead else '', 'status': 'dead' if dead else 'unknown' if birth == '?' else 'alive',
                    'sex': 'unknown', 'mode': 'graphic', 'image': '', 'sourceText': entry,
                    'note': 'Aus der Nutzergrafik von Brann transkribiert. † belegt den Tod, kein Todesjahr. Fehlende Namen und Herkunft bleiben offen.'
                })
    return output
