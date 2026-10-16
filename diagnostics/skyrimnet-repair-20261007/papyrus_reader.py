"""Read Skyrim PEX function tables without executing game code."""
import struct
from pathlib import Path

OPERANDS = [0, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 2, 2, 2, 2,
            3, 3, 3, 3, 3, 1, 2, 2, 3, 2, 3, 1, 3, 3, 3,
            2, 2, 3, 3, 4, 4]


class Reader:
    def __init__(self, path):
        self.data = Path(path).read_bytes()
        self.cursor = 0
        self.endian = '>' if self.data[:4] == bytes.fromhex('fa57c0de') else '<'
        self.strings = []

    def number(self, fmt):
        size = struct.calcsize(fmt)
        value = struct.unpack_from(self.endian + fmt, self.data, self.cursor)[0]
        self.cursor += size
        return value

    def string(self):
        size = self.number('H')
        value = self.data[self.cursor:self.cursor + size].decode('utf-8', errors='replace')
        self.cursor += size
        return value

    def index(self):
        return self.strings[self.number('H')]

    def value(self):
        kind = self.number('B')
        if kind == 0:
            return None
        if kind in (1, 2):
            return self.index()
        if kind == 3:
            return self.number('i')
        if kind == 4:
            return self.number('f')
        if kind == 5:
            return bool(self.number('B'))
        raise ValueError('Unsupported PEX value type: ' + str(kind))

    def function(self):
        self.number('H')  # return type
        self.number('H')  # doc string
        self.number('I')  # user flags
        self.number('B')  # function flags
        for _ in range(self.number('H')):
            self.number('H'); self.number('H')
        for _ in range(self.number('H')):
            self.number('H'); self.number('H')
        for _ in range(self.number('H')):
            opcode = self.number('B')
            if opcode >= len(OPERANDS):
                raise ValueError('Unsupported Skyrim PEX opcode: ' + str(opcode))
            for _ in range(OPERANDS[opcode]):
                self.value()
            if opcode in (23, 24, 25):
                count = self.value()
                assert isinstance(count, int) and count >= 0
                for _ in range(count):
                    self.value()

    def parse(self):
        magic = self.number('I')
        assert magic == 0xFA57C0DE, 'Not a PEX'
        self.number('B'); self.number('B')
        assert self.number('H') == 1, 'Only Skyrim PEX is supported'
        self.number('Q')
        self.string(); self.string(); self.string()
        self.strings = [self.string() for _ in range(self.number('H'))]
        if self.number('B'):
            self.number('Q')
            for _ in range(self.number('H')):
                self.number('H'); self.number('H'); self.number('H'); self.number('B')
                for _ in range(self.number('H')):
                    self.number('H')
        for _ in range(self.number('H')):
            self.number('H'); self.number('B')
        result = {}
        for _ in range(self.number('H')):
            name = self.index()
            self.number('I')
            self.number('H'); self.number('H'); self.number('I'); self.number('H')
            for _ in range(self.number('H')):
                self.number('H'); self.number('H'); self.number('I'); self.value()
            for _ in range(self.number('H')):
                self.number('H'); self.number('H'); self.number('H'); self.number('I')
                flags = self.number('B')
                if flags & 4:
                    self.number('H')
                else:
                    if flags & 1:
                        self.function()
                    if flags & 2:
                        self.function()
            names = set()
            for _ in range(self.number('H')):
                self.number('H')  # state
                for _ in range(self.number('H')):
                    names.add(self.index())
                    self.function()
            result[name] = names
        assert self.cursor == len(self.data), 'Unparsed PEX data'
        return result


def functions(path):
    return Reader(path).parse()
