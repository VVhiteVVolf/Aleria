"""Read the selected MO2 profile and its effective file providers."""
from pathlib import Path
import configparser
import hashlib
import re


def metadata(directory):
    result = {'nexus_id': 0, 'version': ''}
    path = directory / 'meta.ini'
    if path.is_file():
        parser = configparser.ConfigParser(interpolation=None, strict=False)
        for encoding in ('utf-8-sig', 'cp1252'):
            try:
                parser.read_string(path.read_text(encoding=encoding))
                break
            except (UnicodeError, configparser.Error):
                continue
        if parser.has_section('General'):
            value = parser.get('General', 'modid', fallback='0')
            result['nexus_id'] = int(value) if value.isdigit() else 0
            result['version'] = parser.get('General', 'version', fallback='')
    return result


def selected_profile(instance):
    ini = (instance / 'MO2/ModOrganizer.ini').read_text(encoding='utf-8-sig')
    match = re.search(r'^selected_profile=@ByteArray\((.+)\)\s*$', ini, re.M)
    if not match:
        raise ValueError('No selected MO2 profile found')
    profile = instance / 'MODS/profiles' / match[1]
    enabled = [line[1:] for line in (profile / 'modlist.txt').read_text(encoding='utf-8-sig').splitlines()
               if line.startswith('+') and not line.endswith('_separator')]
    sources = [('MO2 Overwrite', instance / 'MODS/overwrite')]
    sources += [(name, instance / 'MODS/mods' / name) for name in enabled]
    sources.append(('Skyrim / Creation Club', instance / 'STOCK GAME/Data'))
    providers, origins, archives, strings = {}, {}, {}, {}
    mods = {}
    for name, directory in sources:
        if not directory.is_dir():
            continue
        mods[name] = metadata(directory)
        for path in directory.iterdir():
            if path.is_file() and path.suffix.casefold() in ('.esp', '.esm', '.esl'):
                providers.setdefault(path.name.casefold(), {'mod': name, 'path': path})
                origins[path.name.casefold()] = {'mod': name, 'path': path}
            elif path.is_file() and path.suffix.casefold() == '.bsa':
                archives.setdefault(path.name.casefold(), path)
        if (directory / 'Strings').is_dir():
            for path in (directory / 'Strings').iterdir():
                if path.suffix.casefold() == '.strings':
                    strings.setdefault(path.name.casefold(), path)
    explicit = {line[1:].casefold() for line in (profile / 'plugins.txt').read_text(encoding='utf-8-sig').splitlines()
                if line.startswith('*')}
    implicit = {'skyrim.esm', 'update.esm', 'dawnguard.esm', 'hearthfires.esm', 'dragonborn.esm'}
    implicit.update(line.casefold() for line in (instance / 'STOCK GAME/Skyrim.ccc').read_text(encoding='utf-8-sig').splitlines())
    order = [line.strip() for line in (profile / 'loadorder.txt').read_text(encoding='utf-8-sig').splitlines()
             if line.strip() and not line.startswith('#') and line.casefold() in explicit | implicit]
    missing = [p for p in order if p.casefold() not in providers]
    if missing:
        raise ValueError('Missing active plugin providers: ' + ', '.join(missing))
    fingerprint = {name: hashlib.sha256((profile / name).read_bytes()).hexdigest()
                   for name in ('modlist.txt', 'plugins.txt', 'loadorder.txt')}
    return {'profile': profile.name, 'directory': profile, 'mods': mods, 'sources': sources,
            'providers': providers, 'origins': origins, 'archives': archives, 'strings': strings, 'plugins': order,
            'active_mods': enabled, 'fingerprint': fingerprint}
