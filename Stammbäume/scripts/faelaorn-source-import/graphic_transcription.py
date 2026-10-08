"""Reviewed transcription of the two user-attached family diagrams.

Coordinates are generation.column labels for this transcription, not HTML rows.
A dagger proves death but supplies no death year. Unmarked cards remain undated
as to death; existing matched source tables may add their documented dates.
"""
GRAPHIC_ROWS = {
 'stwatchn': {
  0: '†Muiredach|?;†Tamsin|?',
  10: '†Senan|?;†Tomaltach|?;Unbekannte Eheperson Senans|?;†Draighean|?',
  20: '†Gadhra|1581;†Tamsin|1592;†Scáthach Diuid|1584;†Galahad Blaidd|1590',
  30: '†Muiredach|1605;†Wunbhna|1609;†Seumas|1612;†Fiadh Laga|1608;†Janneth Dundas|1606;†Sinead Roich|1614',
  40: '†Earcán|1626;†Hailidhe|1632;†Gilleasbuig|1632;†Laoise Fastaigh|1630;†Dallán Urquhart|1628;†Mairead Ness|1634',
  50: '†Aonghus|1648;†Niamhas|1653;†Laoiseach|1652;†Lughaidh|1655;†Scáthach Drummond|1650;†Táraig Ceallaigh|1659;†Talamhan Laoch|1653;†Jenadhe Eoghainn|1655',
  60: 'Muiredach|1668;Niamhe|1671;Hiolair|1675;Harailt|1677;Ciostaidh|1682;Ruaidh Gealân|1672;Cardoc Dinefwr|1668;Orlaith Urquhart|1678;Alannah Luthsach|1678;Ruaidhrígh Chulainn|1680',
  70: 'Whelan|1692;Néidhe|1695;Seumas|1700;Kenneth|1706;Searach|1697;Fergus|1700;Aine|1704;Síofra Dundas|1698;Ninnidh Magach|1690;Nóra Rieach|1704;Fiona Fiorghra|1703;Unbekannte Eheperson von Fergus|1704;Ysolde|1715;Murchadh Lachlann|1703',
  80: 'Gadhra|1717;Tamsin|1720;Earcán|1723;Nairn|1726;Aonghus|1723;Catriona|1727;Art Lockart|1727;Senan|1722;Griana|1725;Lugh|1724;Jiana|1727;Voil|1733;Brina|1736'
 },
 'dundas': {
  0: '†Tomaltach Stwatchn|?;†Draighean|?',
  10: '†Eanbharr|1585;†Eimhear|1590;†Aoifeann Dianaomh|1586;†Sten Oglivy|1592',
  20: '†Janneth|1606;†Draighean|1609;†Wunbhna Stwatchn|1609;†Murdoch Fiorghra|1604',
  30: '†Tomaltach|1629;†Oighreag|1633;†Feargal|1635;†Ceithlenn Gealân|1634;†Bardan Haig|1630;†Íosag Cullen|1638',
  40: '†Alasdair|1652;†Lughna|1657;†Eanbharr|1657;†Úrchrist Laoch|1655;†Kenehyr Morgant|1655;Róisín Luthsach|1657',
  50: 'Feargal|1674;Draighean|1678;†Veaghán|1678;†Eilidh|1683;Étaín Airdmhor|1677;Maolmórda Lachlann|1675;Dáiríne Boyd|1684;†Lomhán Buadhtreun|1682',
  60: 'Tomaltach|1696;Síofra|1698;Eanbharr|1704;Yánán|1702;Hearnait|1704;Enya Bhaird|1697;Whelan Stwatchn|1692;Heilbhic Fastaigh|1707;Katreen|1703;Donndubhán Drummond|1700',
  70: 'Iolar|1721;Wunbhna|1725;Cúan|1726;Síle|1730;Nógh|1723;Keela|1728'
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
                    'note': 'Aus der vom Nutzer beigefügten Stammbaumgrafik transkribiert. Ohne Todesjahr bedeutet † nur sicher verstorben; unbenannte Herkunft bleibt offen.'
                })
    return output
