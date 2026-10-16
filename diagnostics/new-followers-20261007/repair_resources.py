"""Correct packaged resource paths in staging; downloaded plugins stay unchanged."""
from pathlib import Path
import collections
import io
import json
import re
import shutil
import struct
import sys

ROOT = Path(__file__).parent
sys.path.insert(0, str(ROOT.parent/'obody-repair-cleanup-20261006'))
sys.path.insert(0, str(ROOT.parents[1]/'skyrim-outfit-catalog/scripts'))
from nif_links import header, normalize_bodytri
from profile_reader import selected_profile


def norm(value):
    return value.replace('\\', '/').strip('/').casefold()


def retarget_textures(data, replacements):
    parsed = header(data)
    blocks = []
    changes = []
    for kind, block in parsed['blocks']:
        if kind != 'BSShaderTextureSet':
            blocks.append(block)
            continue
        stream = io.BytesIO(block)
        count = struct.unpack('<I', stream.read(4))[0]
        result = [struct.pack('<I', count)]
        for slot in range(count):
            raw = stream.read(struct.unpack('<I', stream.read(4))[0])
            old = norm(raw.rstrip(b'\0').decode('utf-8'))
            if old in replacements:
                new = replacements[old]
                changes.append({'slot':slot, 'old':old, 'new':new})
                raw = new.replace('/', '\\').encode('utf-8')
            result.extend([struct.pack('<I', len(raw)), raw])
        if stream.read():
            raise ValueError('Unexpected shader texture block trailer')
        blocks.append(b''.join(result))
    if not changes:
        return data, []
    prefix = bytearray(data[:parsed['block_start']])
    size_offset = parsed['string_start']-4*len(blocks)
    for i, block in enumerate(blocks):
        struct.pack_into('<I', prefix, size_offset+4*i, len(block))
    end = parsed['block_start']+sum(len(block) for _,block in parsed['blocks'])
    result = bytes(prefix)+b''.join(blocks)+data[end:]
    after = header(result)
    assert [k for k,_ in parsed['blocks']] == [k for k,_ in after['blocks']]
    assert all(a == b for (kind,a),(_,b) in zip(parsed['blocks'],after['blocks']) if kind != 'BSShaderTextureSet')
    return result, changes


def main():
    plan = json.loads((ROOT/'selected-stage.json').read_text(encoding='utf-8'))
    mods = {m['index']:Path(m['directory']) for m in plan['mods']}
    receipt = {'aliases':[], 'texture_paths':[], 'bodytri_paths':[], 'excluded_author_backups':[]}
    def copy(source, target, reason):
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source, target)
        receipt['aliases'].append({'source':str(source), 'target':str(target), 'reason':reason})
    # Optional records remain in author plugins even in the default installer.
    # Their exact alternate packaged models can be included without changing
    # the selected NPC's default skin or outfit.
    amy = ROOT/'unpacked/0/20 Main/Amy follower CBBE'
    for folder in ('meshes', 'textures'):
        shutil.copytree(amy/folder, mods[0]/folder, dirs_exist_ok=True)
    # Restore default FaceGen after the optional alternative assets were copied.
    shutil.copytree(ROOT/'unpacked/0/10 Main/Amy follower default/meshes', mods[0]/'meshes', dirs_exist_ok=True)
    shutil.copytree(ROOT/'unpacked/8/wig/meshes', mods[8]/'meshes', dirs_exist_ok=True)
    shutil.copytree(ROOT/'unpacked/8/wig/textures', mods[8]/'textures', dirs_exist_ok=True)
    # Ground models were packed one folder above the paths in the plugin.
    shutil.copytree(mods[29]/'meshes/shitty', mods[29]/'meshes/armor/shitty', dirs_exist_ok=True)
    for file in ('helm_b.nif','gaunt_1_0.nif','gaunt_1_1.nif'):
        copy(mods[29]/'meshes/VriTarlFollower/Bikini'/file, mods[29]/'meshes/armor/shitty/orc'/file, 'Exact packaged worn model at the declared plugin path')
    # The Cicero archive contains an earlier mod's resource paths and backups.
    for source, target in [
        ('meshes/actors/character/SN Cicero/Peggy53.nif','meshes/bao.nif'),
        ('meshes/actors/character/SN Cicero/Peggy53HL.nif','meshes/baohl.nif'),
        ('meshes/actors/character/SN Cicero/femalehead.nif','meshes/Cicero Female SE/meshes/cicerofemalese/body/FemaleHead.nif'),
    ]:
        copy(mods[26]/source, mods[26]/target, 'Cicero model path left over from previous packaging')
    for name in ('jesterbootsf_0.nif','jesterbootsf_1.nif','jesterglovesf_0.nif','jesterglovesf_1.nif','jesterf_0.nif','jesterf_1.nif'):
        candidates = {'jesterbootsf':'SN_Cicero_Boots','jesterglovesf':'SN_Cicero_Glove','jesterf':'SN_Cicero_Body_A'}
        stem, weight = name.rsplit('_',1)
        source = ROOT/'generated'/mods[26].name/'meshes/SN Cicero'/(candidates[stem]+'_'+weight)
        copy(source, mods[26]/'meshes/cicerofemalese/clothes'/name, 'Exact corresponding 3BA model for optional legacy outfit records')
    # Use the working zero-base 3BA nude body and skeleton for this private skin.
    # This also removes obsolete Hyeji-body texture and morph references.
    profile = selected_profile(Path(r'E:\Nolvus\Instances\Nolvus Awakening'))
    for stem in ('femalebody','femalehands','femalefeet'):
        for extension in ('_0.nif','_1.nif','.tri'):
            relative = 'meshes/actors/character/character assets/'+stem+extension
            source = next(directory/relative for _,directory in profile['sources'] if (directory/relative).is_file())
            target = mods[26]/'meshes/actors/character/SN Cicero'/(stem+extension)
            copy(source, target, 'Private zero-base OBody 3BA skin; global body unchanged')
            if extension.endswith('.nif'):
                data = target.read_bytes()
                parsed = header(data)
                replacements = {}
                for kind,block in parsed['blocks']:
                    if kind != 'BSShaderTextureSet':continue
                    stream=io.BytesIO(block)
                    for _ in range(struct.unpack('<I',stream.read(4))[0]):
                        raw=stream.read(struct.unpack('<I',stream.read(4))[0]);value=norm(raw.decode('utf-8').rstrip('\0'))
                        file=Path(value).name
                        private=mods[26]/'textures/actors/character/SN Cicero'/file
                        if private.is_file():replacements[value]=norm(private.relative_to(mods[26]).as_posix())
                data,changes=retarget_textures(data,replacements)
                data,tri_changes=normalize_bodytri(data,norm(target.relative_to(mods[26]).with_name(stem+'.tri').as_posix()))
                target.write_bytes(data)
                receipt['texture_paths'].extend(changes);receipt['bodytri_paths'].extend(tri_changes)
    skeleton='meshes/actors/character/character assets female/skeleton_female.nif'
    source=next(directory/skeleton for _,directory in profile['sources'] if (directory/skeleton).is_file())
    copy(source, mods[26]/'meshes/actors/character/SN Cicero/skeleton_female.nif', 'Private skeleton matches the installed 3BA/XPMSSE setup')
    # Do not ship old, unreferenced FaceGen backups or embedded original ZIPs.
    for path in list(mods[26].rglob('*')):
        if not path.is_file():continue
        relative=norm(path.relative_to(mods[26]).as_posix())
        discard='/facegeom/cicerofemalese.esp/' in relative or ('/facegeom/' in relative and not re.search(r'/[0-9a-f]{8}\.nif$',relative)) or path.name.casefold()=='reina.zip'
        if discard:
            assert path.resolve().is_relative_to((ROOT/'staged').resolve())
            receipt['excluded_author_backups'].append(str(path.relative_to(mods[26])))
            path.unlink()
    # Route Eola's outfit texture privately rather than replacing every draugr.
    draugr=mods[4]/'textures/actors/draugr/armor.dds'
    private=mods[4]/'textures/actors/character/Eola/draugr/armor.dds'
    copy(draugr,private,'Keep the Eola outfit texture private')
    draugr.unlink()
    global_map={'textures/actors/draugr/armor.dds':norm(private.relative_to(mods[4]).as_posix()),
                'actors/draugr/armor.dds':norm(private.relative_to(mods[4]).as_posix())}
    for index, base in mods.items():
        texture_files=collections.defaultdict(list)
        for file in (base/'textures').rglob('*.dds'):
            texture_files[file.name.casefold()].append(file)
        for path in (base/'meshes').rglob('*.nif'):
            data=path.read_bytes();parsed=header(data);mapping=dict(global_map) if index==4 else {}
            for kind,block in parsed['blocks']:
                if kind!='BSShaderTextureSet':continue
                stream=io.BytesIO(block)
                for slot in range(struct.unpack('<I',stream.read(4))[0]):
                    raw=stream.read(struct.unpack('<I',stream.read(4))[0]);old=norm(raw.rstrip(b'\0').decode('utf-8'))
                    relative=old if old.startswith('textures/') else 'textures/'+old
                    if not old or (base/relative).is_file():continue
                    candidates=texture_files[Path(old).name]
                    if len(candidates)==1:
                        mapping[old]=norm(candidates[0].relative_to(base).as_posix())
                    if slot==6 and '/facegeom/' in norm(path.as_posix()) and re.fullmatch('[0-9a-f]{8}',path.stem.lower()):
                        plugin=path.parent.name
                        if plugin.lower()=='skyrim.esm' and index==26:plugin='SN Cicero Replacer.esp'
                        tint=base/'textures/actors/character/facegendata/facetint'/plugin/(path.stem+'.dds')
                        if tint.is_file():mapping[old]=norm(tint.relative_to(base).as_posix())
            data,changes=retarget_textures(data,mapping)
            if changes:
                path.write_bytes(data);receipt['texture_paths'].append({'mesh':str(path),'changes':changes})
    # Skogul's brow normal was omitted. This is the shared vanilla-UV brow normal
    # supplied with the requested Eola package, not an arbitrary skin texture.
    copy(mods[4]/'textures/actors/character/Eola/Brows/femalebrow_n.dds',
         mods[18]/'textures/actors/character/Skogul/head/femalebrow_n.dds','Shared compatible brow normal missing from Skogul archive')
    (ROOT/'resource-repairs.json').write_text(json.dumps(receipt,indent=2,ensure_ascii=False),encoding='utf-8')
    print(json.dumps({k:len(v) for k,v in receipt.items()}))


if __name__=='__main__':main()
