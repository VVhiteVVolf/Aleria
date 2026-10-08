"""Manual transcription of the seven user-supplied Damh diagrams.

Rows are transcription coordinates, not pixel positions: generation rows contain
home members; the following row contains their partners. Raw dates are retained
here, with confirmed corrections separately recorded in decisions.json.
"""
GRAPHIC_ROWS = {
 'eoghainn': {
  0:'†Giollán Abhrach|?;†Tuarenn|?',
  10:'†Muiredach|?;†Luibheas|?',11:'†Heilbhic Elitard|?;†Quiseog|?',
  20:'†Loinneog|?;†Kadhghán|?',21:'†Pádraig|?;†Garmania Dúach|?',
  30:'†Rónán|?;†Vardán|?',31:'†Muiridhe Fiachraoin|?;†Zaorbha|?',
  40:'†Raghallach|1582;†Nechtan|1584;†Lughna|1587;†Muiredach|1590;†Peathgho|1592',
  41:'†Dervla Rollaithe|1584;†Baoigheall Agnew|1580;†Máirtín Tordarroch|1582;†Rhianu Illysywen|1590;†Zachrach Elid|1590',
  50:'†Kadhghán|1603;†Treabha|1608;†Pailtéar|1610;†Gobaith|1610;†Harailt|1612',
  51:'†Wunbhna Duff|1603;†Muircheartach Casur|1614;†Nithin Dobhar|1611;†Koarnach Culloch|1608;†Mairghread Ness|1615',
  60:'†Giollán|1628;†Iarnait|1631;†Cailte|1635;†Aoghán|1634;†Tadhaigh|1636',
  61:'†Teathallach Fiorghra|1631;†Caedmon Morlais|1627;†Síofra Salaig|1637;†Valaigh Elid|1636;†Amhlaoibh Dianaomh|1630',
  70:'†Briathach|1649;†Eanbharr|1653;†Jáxnan|1656;Meabhróg|1664;†Jenaidh|1655;†Breasal|1656',
  71:'†Wihalgh Oglivy|1653;†Hairbhinn Agnew|1647;†Meabhróg Diuid|1654;†Lughaidh Stwatchn|1655;†Seallach Wemyss|1658',
  80:'Kealagh|1671;†Fionnchu|1674;†Lóchán|1678;†Oighreag|1680;Maithnú|1676;†Vearga|1679;Haodh|1681',
  81:'Aoghán Urquhart|1667;†Nálainn Forsyth|1678;†Iarbhine Cadaigh|1680;†Diarmait Buadhtreun|1676;Latharna Ness|1677;†Malachy Dubglais|1679;Leagha Dobhar|1681',
  90:'†Kester|1695;†Tuarenn|1698;†Cailte|1702;Cinnia|1701;Leogán|1698;Unbenanntes Kind Maithnús|1702;Harailt|1707;Unbenanntes Kind Haodhs|1704;Breasal|1708',
  91:'†Aibhilin Dianaomh|1695;†Gréagóir Elid|1694;†Ealar Duff|1706;Réamonn Diuid|1696;Sluagh Lockart|1702;Meara Midgna|1710;Heulyn Dúach|1711',
  100:'†Giollán|1714;Fóla|1721;Aoghán|1725;Rónán|1729;Hearn|1728;Neart|1733;Nechtan|1730;Sionna|1734'
 },
 'agnew': {
  0:'†Loinneog Eoghainn|?;†Pádraig|?',
  10:'†Baoigheall|180;†Jibheann|1585',11:'†Nechtan Eoghainn|1584;†Luibheas Duff|1580',
  20:'†Bairrfhionn|1603;†Loinneog|1605',21:'†Draighean Deaghaide|1601;†Zachair Kerlaouen|1607',
  30:'†Glaodhaich|1627;†Seallach|1632;†Quíghleann|1635',31:'†Hearn Banlaoch|1627;†Kynwrig Crwynog|1627;†Bairdín Luthsach|1634',
  40:'†Hairbhinn|1647;†Eilionoir|1654;Úirghlinn|1655;†Reathnaigh|1658',41:'†Eanbharr Eoghainn|1648;†Gearoid Tairise|1650;†Yvor Oglivy|1658',
  50:'†Seallach|1667;†Baoigheall|1670;†Caoilfhionn|1677;†Loinneog|1680;†Aodhnach|1679',51:'†Keiran Deaghaide|?;†Iagan Caolan|1674;†Hurracan Elid|1678;†Briathach Duff|1680;†Quinlan Arduinna|1675',
  60:'†Quíghleann|1692;†Vionnadh|1700;Glaodhaich|1700;Bairrfhionn|1700;†Jibheann|1704',61:'†Earc|1690;†Beacan Dobhar|1696;Brennan Luthsach|1701;Meara Banlaoch|1704',
  70:'Kester|1708;†Pádraig|1714;Eilionoir|1623;Caoilfhionn|1628;Baoigheall|1630'
 },
 'dianaomh': {
  0:'†Amhlaoibh|?;†Aodhnach|?',
  10:'†Aoghán|1582;†Aoifeann|1586',11:'†Caomhóg Forsyth|1583;†Eanbharr Dundas|1585',
  20:'†Aodhagán|1604;†Aodhnach|1607;†Aodhluán|1610',21:'†Samthann Luga|1609;†Hearn Oglivy|1606;†Zaorbha Elid|1612',
  30:'†Amhlaoibh|1630;†Aoibhinn|1635;†Abhán|1630',31:'†Tadhaigh Eoghainn|1636;†Scannlán Duff|1632;†Dearbhorgaill Marcaigh|1632',
  40:'†Aolbha|1654;†Artán|1655;†Aibhne|1650;†Aindreas|1656',41:'†Oirbhealach Muirgheal|1655;†Úirghlinn Carnegie|1655;†Fergus Lockart|1648;†Vathna|1660',
  50:'†Aodhagán|1674;†Aodhnach|1677;†Aodhluán|1680;Ailis|1680',51:'†Elvara Cadhla|1675;†Ollamh Dobhar|1678;†Uibhla Oglivy|1682',
  60:'†Aoghán|1694;†Aibhilin|1695;Ailís|1698;†Abhán|1703;†Aileen|1708',61:'†Páidín Muirin|1696;†Kester Eoghainn|1695;Faolán Airdmhor|?;†Treabhán Duff|1701',
  70:'†Artán|1714'
 },
 'dobhar': {
  0:'†Donnacha|?;†Pallaigh|?',
  10:'†Donnacha|1585;†Tadhaigh|1590;†Dónal|1595',11:'†Hedda Oglivy|1589;†Hoimín Grannd|1589;†Néidhe Elid|1598',
  20:'†Giollán|1607;†Nithin|1611;†Janneth|1619',21:'†Tuarenn Cairge|1610;†Pailtéar Eoghainn|1610;†Ingebörg|1620;†Íosag|1621',
  30:'†Íosnán|1628;†Sadhbh|1632;†Nuallán|1635;†Steinar|1640;†Pallaigh|1645',31:'†Wendra Oglivy|1631;†Seithved Morgryn|1630;†Oileán Reannachain|1636;†Fuirseach Forsyth|1645',
  40:'†Donnacha|1649;†Laoise|1657;†Dónal|1655',41:'†Marvine Mochdaer|1654;†Luibheas Duff|1655;†Heilbhic Muirgheal|1660',
  50:'†Giollán|1672;Hailidhe|1678;†Ollamh|1678;Leagha|1681',51:'†Wicche Clannmhar|1675;Gòrdnach Fintain|1675;†Aodhnach Dianaomh|1677;Haodh Eoghainn|1681',
  60:'†Hectan|1693;†Beacan|1696;†Nuallán|1697;†Pallaigh|1700',61:'†Liara Cairbre|1695;†Quíghleann Agnew|1692;†Ealar|1698;†Jowan Oglivy|1697',
  70:'†Dónal|1713;†Íosnán|1714;†Uidhir|1716'
 },
 'forsyth': {
  0:'†Ultach Elitard|?;†Iarnach|?',
  10:'†Fuirseach|1580;†Caomhóg|1583',11:'†Céilidh Gealán|1587;†Aoghán Dianaomh|1582',
  20:'†Fáithleach|1604;†Éadaoin|1608;†Argyle|1610',21:'†Éichín Drummond|1606;†Briathach Duff|1605;†Keitha Clannmhar|1613',
  30:'†Ultach|1624;†Iarnach|1626;†Goirtín|1631',31:'†Orla Diuid|?;†Macraith Culloch|?;†Jorunn Oglivy|1635',
  40:'†Fuirseach|1645;†Joaigh|1649;†Fionnchuall|1653;†Uinseann|1655',41:'†Pallaigh Dobhar|1645;†Fergus Urquhart|1648;†Ifan Dianc|1653;†Kealagh Buadhtreun|1657',
  50:'Fáithleach|1664;Iarbhine|1655;†Argyle|1667;†Nálainn|1678;†Jaimhín|1679',51:'Fenella Dubglais|1670;Domangair Cithrenn|1663;†Riondda Dwrgi|1668;†Fionnchu Eoghainn|1674;†Peathra Elid|1680',
  60:'Fearghas|1688;Ultach|1692;Siobhan|1693;Cairell|1698;Klaihn|1700;Bóchna|1702;Vadria|1705;Sitric|1707;Conaing|1709;†Goirtín|1700;†Iarnach|1703',
  61:'Kessog Lockart|1694;Theann Riesencot|1690;Tuiridh Wellenkrone|?;Quiseog Duff|1702;†Bjørn|1672;Unbekannte Eheperson Conaings|?;†Dervla Oglivy|1700',
  70:'Connla|1713;Lorgain|1718;Toirche|1724;Cúan|1720;Flann|1725;Niorán|1721;Wicche|1727;Poilín|1720;Sárnat|1728;Aoife|1734;†Argyle|?'
 },
 'elid': {
  0:'†Vardán Eoghainn|?;†Zaorbha|?',
  10:'†Zachrach|1590;†Néidhe|1598',11:'†Peathgho Eoghainn|1592;†Dónal Dobhar|1595',
  20:'†Tadhghán|1610;†Zaorbha|1612',21:'†Zennia Avernax|1612;†Aodhluán Dianaomh|1610',
  30:'†Gréagóir|1630;†Valaigh|1636;†Xubhnán|1639',31:'†Muireann Grodach|1631;†Aoghán Eoghainn|1634;†Vevila Nemetex|1642;†Quaira|1646',
  40:'†Warín|1651;†Vardán|1654;†Ríanach|1660;†Wrayne|1666',41:'†Ionnrachtaigh Durachd|1647;†Quiseog Duff|1655;†Peathgho Keravel|1662;Unbekannte Eheperson Wraynes|?',
  50:'†Tadhghán|1674;†Hurracan|1678;†Peathra|1680;Zachrach|1686',51:'†Brígh Oglivy|1676;†Caoilfhionn Agnew|1677;†Jaimhín Forsyth|1679;Unbekannte Eheperson Zachrachs|?',
  60:'†Gréagóir|1694;†Zaorbha|1697;Trianach|1704;Zeargán|1706;Xibhne|1708',61:'†Tuarenn Eoghainn|1698;†Luibheas Duff|1695;Unbekannte Eheperson Zeargáns|?;Unbekannte Eheperson Xibhnes|?',
  70:'†Vardán|1706;†Uisigh Avernax|1707;Xubhnán|1726;Xarthan|1730;Zibhí|1733'
 },
 'oglivy': {
  0:'†Conchobar|?;†Hedda|?',
  10:'†Éadbhard|?;†Fonnait|?',11:'†Gormfhlaith Elitard|?;†Kimball Aderyn|?',
  20:'†Íobhar|1556;†Eithne|1559',21:'†Latharna Roich|1560;†Bujold Kampfgeborener|1556',
  30:'†Conchobar|1582;†Hedda|1589;†Sten|1592',31:'†Quiseog Duff|1585;†Donnacha Dobhar|1585;†Eimhear Dundas|1590',
  40:'†Hearn|1606;†Lannraig|1610;†Jowan|1611',41:'†Aodhnach Dianaomh|1607;†Torcall Oglivy|?;†Solveig|1614',
  50:'†Éadbhard|1627;†Wendra|1631;†Goll|1632;†Jorunn|1635',51:'†Litrielle Lasgair|1632;†Íosnán Dobhar|1628;†Toirche Gwenyen|1636;†Goirtín Forsyth|1631',
  60:'†Conchobar|1651;†Wihalgh|1653;†Sten|1655;†Yvor|1658',61:'†Xardia Avernax|1654;†Briathach Eoghainn|1649;†Leagha|1657;†Reathnaigh Agnew|1658',
  70:'†Éadbhard|1673;†Brígh|1676;†Hearn|1676;†Uibhla|1682',71:'†Jilleen Buadhtreun|1674;†Tadhghán Elid|1674;†Luiseach Duff|1678;†Aodhluán Dianaomh|1680',
  80:'†Íobhar|1693;†Sten|1697;Heulyn|1702;†Jowan|1697;†Dervla|1700',81:'†Herdis Tauwind|1694;†Eadgyth Estmere|1700;†Kjartan|?;†Pallaigh Dobhar|1700;Inga|1703;†Goirtín Forsyth|1700',
  90:'Conchobar|1714;Hedda|1719;Skjell|1721;Goll|1718;Ingemar|1720'
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
                    'note': 'Aus der Nutzergrafik von Tir na Damh transkribiert. † belegt den Tod, kein Todesjahr. Fehlende Namen und Herkunft bleiben offen.'
                })
    return output
