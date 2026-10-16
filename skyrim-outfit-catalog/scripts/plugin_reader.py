"""Read effective equipment records without loading or modifying the game."""
from pathlib import Path
import mmap
import struct
import zlib


def text(value):
    raw = value.rstrip(b'\0')
    try:
        return raw.decode('utf-8')
    except UnicodeDecodeError:
        return raw.decode('cp1252', errors='replace')


def fields(payload):
    cursor = 0
    extended = None
    while cursor + 6 <= len(payload):
        kind, size = struct.unpack_from('<4sH', payload, cursor)
        cursor += 6
        if kind == b'XXXX':
            extended = struct.unpack_from('<I', payload, cursor)[0]
        else:
            size = extended if extended is not None else size
            extended = None
            value = payload[cursor:cursor + size]
            if len(value) != size:
                raise ValueError('Truncated equipment subrecord')
            yield kind, value
        cursor += size


def records(path, kinds=(b'TES4', b'ARMO', b'ARMA', b'KYWD')):
    """Yield only records needed for the equipment catalog, in file order."""
    with Path(path).open('rb') as stream, mmap.mmap(stream.fileno(), 0, access=mmap.ACCESS_READ) as data:
        cursor = 0
        while cursor + 24 <= len(data):
            kind, size, flags, form = struct.unpack_from('<4sIII', data, cursor)
            if kind == b'GRUP':
                cursor += 24
                continue
            end = cursor + 24 + size
            if end > len(data):
                raise ValueError('Equipment record extends outside plugin')
            if kind in kinds:
                payload = data[cursor + 24:end]
                if flags & 0x40000:
                    expected = struct.unpack_from('<I', payload)[0]
                    payload = zlib.decompress(payload[4:])
                    if len(payload) != expected:
                        raise ValueError('Compressed equipment record size mismatch')
                yield kind.decode('ascii'), flags, form, list(fields(payload))
            cursor = end


def identity(form, masters, plugin):
    index = form >> 24
    if index > len(masters):
        raise ValueError('FormID master index outside plugin header')
    owner = masters[index] if index < len(masters) else plugin
    return owner.casefold() + ':' + format(form & 0xffffff, '06X')
