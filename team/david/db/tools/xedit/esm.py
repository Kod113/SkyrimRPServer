"""Lettore minimo dei file .esm di Skyrim SE (solo lettura, senza dipendenze).

Struttura: record = firma(4) dimensione(4) flag(4) formid(4) vc(4) versione(2) ?(2) + dati;
GRUP = 'GRUP' dimensione(4, include i 24 byte) etichetta(4) tipo(4) data(2) vc(2) versione(2) ?(2) + figli.
"""
import struct
import zlib


def load(path):
    with open(path, "rb") as f:
        return f.read()


def subrecords(data):
    out, pos, big = [], 0, None
    while pos + 6 <= len(data):
        sig = data[pos:pos + 4].decode("latin1")
        size = struct.unpack_from("<H", data, pos + 4)[0]
        pos += 6
        if sig == "XXXX":
            big = struct.unpack_from("<I", data, pos)[0]
            pos += size
            continue
        if big is not None:
            size, big = big, None
        out.append((sig, data[pos:pos + size]))
        pos += size
    return out


def record_data(buf, p):
    """(firma, formid, flag, sotto-record) del record che inizia in p."""
    sig = buf[p:p + 4].decode("latin1")
    size, flags, fid = struct.unpack_from("<III", buf, p + 4)
    data = buf[p + 24:p + 24 + size]
    if flags & 0x00040000:
        data = zlib.decompress(data[4:])
    return sig, fid, flags, data, 24 + size


def walk(buf, start=None, end=None, depth=0, path=()):
    """Scorre record e gruppi. Produce ('rec', p, sig, fid, flags, path) e ('grp', p, label, tipo, path)."""
    pos = 24 + struct.unpack_from("<I", buf, 4)[0] if start is None else start
    end = len(buf) if end is None else end
    while pos + 24 <= end:
        sig = buf[pos:pos + 4]
        size = struct.unpack_from("<I", buf, pos + 4)[0]
        if sig == b"GRUP":
            label = buf[pos + 8:pos + 12]
            gtype = struct.unpack_from("<I", buf, pos + 12)[0]
            yield ("grp", pos, label, gtype, path)
            yield from walk(buf, pos + 24, pos + size, depth + 1, path + ((label, gtype),))
            pos += size
        else:
            flags, fid = struct.unpack_from("<II", buf, pos + 8)
            yield ("rec", pos, sig.decode("latin1"), fid, flags, path)
            pos += 24 + size
