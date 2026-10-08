"""Undated Banlaoch diagram; dates are separate, explicitly authorized decisions."""
ROWS = {
 0: '†Mórríoghan;†Hearn',
 10: '†Morag;†Pólán;Dáire Luthsach;†Sceolaigh Kerlaouen',
 20: '†Mórríoghan;†Faolan;†Párthas Tairise;†Rónnat Deaghaide',
 30: '†Hearn;†Maeve;†Fionn;†Glaodhaich Agnew;†Fergal Caolan;†Eilidh Luthsach',
 40: '†Morrígan;†Cormac;†Nálainn;†Dubhán Diuid;†Wailbhe Kerlaouen;†Wrath Lockart',
 50: 'Morag;Lorcan;Sluagh;Peathgho;Leogán Tairise;Gormlaith Luthsach;Haelan Deaghaide;Suibhne Haig',
 60: 'Nálainn;Wairbhín;Meara;Keebh;Keitha;Conall Caolan;Súlach Goidin;Bairrfhionn Agnew;Artán Kerlaouen',
 70: 'Maeve;Sláine;Hearn;Fóla;Sionna;Jainn;Tóla;Tólai'
}

def cards():
    return [dict(ref=f'banlaoch:{row}:{column}', slug='banlaoch', row=row, column=column,
                 name=name.lstrip('†'), birth='????', death='????' if name.startswith('†') else '',
                 status='dead' if name.startswith('†') else 'unknown', sex='unknown', mode='graphic',
                 image='', sourceText=name,
                 note='Undatierte Nutzergrafik; das Kreuz belegt den Tod, kein Todesjahr. Ergänzte Jahre sind separat als freigegebene Rekonstruktion dokumentiert.')
            for row, names in ROWS.items() for column, name in enumerate(names.split(';'))]
