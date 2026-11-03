from pathlib import Path
from hashlib import sha256
import json

root=Path(__file__).resolve().parents[2]
directory=Path(__file__).parent
target=directory/'sources'
target.mkdir(exist_ok=True)
items=[
 ('gwanrhyd','7edfcd28-1839-4569-8e28-69efee014e4f','https://i.imgur.com/sBzoO5p.png'),
 ('bochdew','4cadabf6-14cd-4581-8aa6-abd2c58dbc48','https://i.imgur.com/lYqxjwr.png'),
 ('udgorn','7d4ae5fb-5c63-4292-9cdc-ab4872ae5761','https://i.imgur.com/wDwgorw.png'),
 ('balauric','506bd15a-2645-45aa-b930-bac63bbc21cb','https://i.imgur.com/238lwmL.png'),
 ('morgryn','4abba179-933f-4da2-bf31-de8ee27b4b06','https://i.imgur.com/ZQNAq2k.png'),
 ('gwenyen','b6fc0bca-c01e-430f-b125-9371a327677a','https://i.imgur.com/3NnOu1N.png'),
 ('crwynog','099af5da-1095-4682-8f4a-afd88d81afcf','https://i.imgur.com/k3sm0iC.png')]
manifest=[]
for slug,id,url in items:
    source=next((Path('C:/Users/fhg_r/.codex/attachments')/id).glob('*.txt'))
    data=source.read_bytes()
    archive=target/f'{slug}.html'
    if archive.exists():
        assert archive.read_bytes()==data,slug
    else:
        archive.write_bytes(data)
    manifest.append({'id':f'haus-{slug}','attachmentId':id,'file':f'sources/{slug}.html','sha256':sha256(data).hexdigest(),'warriorSource':url,'localWarrior':f'Stammbäume/assets/images/references/haus-{slug}/krieger.png','genealogyImported':False})
(directory/'additional-sources.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(f'{len(manifest)} Quellen bytegleich archiviert.')
