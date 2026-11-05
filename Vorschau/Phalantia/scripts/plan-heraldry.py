"""Build Phalantia crest prompts from the single house-plan authoring source."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
WORKSPACE = ROOT.parents[1]
REFERENCES = [
    'C:/Users/fhg_r/Downloads/Länder/Phalantia/Phalantia Wappen.png',
    str(WORKSPACE/'Vorschau/Leukonia/assets/emblems/production/pool-01.png'),
]

def main():
    source = ROOT/'sources'
    houses = json.loads((source/'house-plan.json').read_text(encoding='utf8'))['houses']
    if len(houses) != 9 or len({house['id'] for house in houses}) != 9:
        raise ValueError('Expected two royal and seven Perioikic houses')
    preset = json.loads((WORKSPACE/'AleriaAlmanach/docs/art/image-style-presets.json').read_text(encoding='utf8'))['presets']['fantasy-heraldic-emblem']['prompt']
    jobs = []
    for house in houses:
        prompt = preset.replace('[NAME]','Haus '+house['name']).replace('[BESCHREIBUNG DES HAUPTMOTIVS]',house['motif'])
        for index in range(3):
            prompt = prompt.replace(f'[FARBE {index+1}]',house['palette'][index])
        prompt = prompt.replace('[EISEN / GOLD / SILBER / HOLZ]',house['frame']).replace('[RUNEN / KELTISCHE KNOTEN / GEOMETRISCHE ORNAMENTE / KEINE VERZIERUNG]','Antike griechische geometrische Ornamentik nach der Rahmenbeschreibung: '+house['frame'])
        prompt = prompt.replace('nordisch-keltischen Fantasy-Heraldikstil','spartanisch-altgriechischen Fantasy-Heraldikstil').replace('nordischer Ornamentik','altgriechischer Vasenmalerei und geometrischer Ornamentik')
        prompt = 'Use case: stylized-concept. Referenzbilder bestimmen nur runde handgemalte Schildform und antike Bordüren, NICHT deren Wappenmotive.\n'+prompt
        prompt += '\nVERBINDLICHE aktuelle Stilpräzisierung: FLACH zweidimensional AUFGEMALT, sparsame matte Gouachepigmentflächen und dünne Konturen, dezente Bretterstruktur. Kein plastisches Relief, keine Gravurtiefe, kein Metallglanz, kein CGI, kein fotorealistischer Gegenstand. Griechisch-spartanisch; keine keltischen Knoten oder nordischen Runen. Ein einzelnes exakt kreisrundes Wappen auf quadratischem 1024x1024 PNG. Gesamte Außenkontur vollständig im Bild mit freiem transparentem Rand. Innenkreis Alpha255 vollständig deckend, ausschließlich außen Alpha0. Keine Schrift oder Namen im Bild. Keine Schatten/Glows außerhalb. Motiv und Rahmen wie oben definiert, keine weiteren Tiere oder Wappensymbole ergänzen.'
        jobs.append(dict(id=house['id'],assetStem=house['id'],kind='house',category='emblems',name='Haus '+house['name'],
                         motif=house['motif'],palette=house['palette'],frame=house['frame'],prompt=prompt,references=REFERENCES))
    target = source/'additional-emblem-jobs.json'
    output = dict(schemaVersion=1,date='2026-11-04',tool='image_gen.imagegen',jobs=jobs)
    target.write_text(json.dumps(output,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
    print(json.dumps(dict(houses=len(houses),emblemJobs=len(jobs))))

if __name__ == '__main__': main()
