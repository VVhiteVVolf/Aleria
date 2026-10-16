"""Resolve localized item names from active loose or archived English strings."""
from pathlib import Path
import struct
import sys

HELPERS = Path(__file__).resolve().parents[2] / 'diagnostics/obody-bodyslide-audit-20261006'
sys.path.insert(0, str(HELPERS))
from archive_mesh import read_entry


def string_entries(path):
    with path.open('rb') as stream:
        magic, version, offset, flags, folders, files, folder_bytes, file_bytes, file_flags = struct.unpack('<4s8I', stream.read(36))
        if magic != b'BSA\0' or version not in (103, 104, 105) or flags & 3 != 3:
            return []
        stream.seek(offset)
        counts = []
        for _ in range(folders):
            raw = stream.read(24 if version == 105 else 16)
            counts.append(struct.unpack('<QIIQ' if version == 105 else '<QII', raw)[1])
        entries = []
        for count in counts:
            length = stream.read(1)[0]
            folder = stream.read(length).rstrip(b'\0').decode('utf-8', errors='replace')
            for _ in range(count):
                _, size, offset = struct.unpack('<QII', stream.read(16))
                entries.append({'folder': folder, 'size': size & 0x3fffffff, 'offset': offset,
                                'compressed': bool(flags & 4) ^ bool(size & 0x40000000)})
        names = stream.read(file_bytes).split(b'\0')
        if names[-1] == b'':
            names.pop()
        if len(names) != files or len(entries) != files:
            raise ValueError('BSA name table mismatch')
        result = []
        for entry, name in zip(entries, names):
            relative = (entry['folder'] + '/' + name.decode('utf-8', errors='replace')).replace('\\', '/').casefold()
            if relative.startswith('strings/') and relative.endswith('_english.strings'):
                entry.update(archive=str(path), version=version, embedded_names=bool(flags & 0x100))
                result.append((Path(relative).name, entry))
        return result


class Names:
    def __init__(self, profile):
        self.loose = profile['strings']
        self.archives = profile['archives']
        self.active = {Path(p).stem.casefold() for p in profile['plugins']}
        self.entries = None
        self.cache = {}
        self.unresolved = 0

    def archive_sources(self):
        entries = {}
        for name, path in self.archives.items():
            stem = Path(name).stem.casefold()
            if name.startswith('skyrim - ') or any(stem == p or stem.startswith(p + ' - ') for p in self.active):
                for key, entry in string_entries(path):
                    entries[key] = entry
        return entries

    def table(self, plugin):
        key = Path(plugin).stem.casefold() + '_english.strings'
        if key not in self.cache:
            if key in self.loose:
                data = self.loose[key].read_bytes()
            else:
                if self.entries is None:
                    self.entries = self.archive_sources()
                data = read_entry(self.entries[key]) if key in self.entries else b''
            result = {}
            if data:
                count, size = struct.unpack_from('<II', data)
                start = 8 + count * 8
                for i in range(count):
                    sid, offset = struct.unpack_from('<II', data, 8 + i * 8)
                    end = data.index(b'\0', start + offset)
                    value = data[start + offset:end]
                    try:
                        result[sid] = value.decode('utf-8')
                    except UnicodeDecodeError:
                        result[sid] = value.decode('cp1252', errors='replace')
            self.cache[key] = result
        return self.cache[key]

    def resolve(self, value, plugin, localized):
        if not localized:
            from plugin_reader import text
            return text(value), False
        if len(value) != 4:
            raise ValueError('Unexpected localized FULL field length')
        result = self.table(plugin).get(struct.unpack('<I', value)[0], '')
        if not result:
            self.unresolved += 1
        return result, not bool(result)
