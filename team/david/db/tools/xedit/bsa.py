"""Lettore minimo degli archivi .bsa di Skyrim SE (versione 105), solo lettura.

Serve a leggere i nomi italiani degli oggetti (file Strings dentro "Skyrim - Interface.bsa").
Dipendenza: il pacchetto lz4 (pip install lz4), perche' i file nell'archivio sono compressi.
"""
import struct

import lz4.frame


def read_bsa(path):
    """Restituisce (indice dei file, funzione get(nome) -> bytes)."""
    with open(path, "rb") as f:
        buf = f.read()
    magic, ver, off, aflags, nfold, nfile, lfold, lfile, fflags = struct.unpack_from("<4sIIIIIIII", buf, 0)
    if magic != b"BSA\0" or ver != 105:
        raise ValueError(f"{path}: non e' un .bsa di Skyrim SE (versione {ver})")
    pos, folders = off, []
    for _ in range(nfold):
        folders.append(struct.unpack_from("<QIIQ", buf, pos)[1])   # quanti file nella cartella
        pos += 24
    entries = []
    for count in folders:
        ln = buf[pos]
        folder = buf[pos + 1:pos + ln].decode("latin1")
        pos += 1 + ln
        for _ in range(count):
            _h, size, foff = struct.unpack_from("<QII", buf, pos)
            entries.append((folder, size, foff))
            pos += 16
    names = buf[pos:pos + lfile].split(b"\0")
    index = {(e[0] + "\\" + n.decode("latin1")).lower(): e[1:] for e, n in zip(entries, names)}

    def get(name):
        size, foff = index[name.lower()]
        compressed = bool(aflags & 4) ^ bool(size & 0x40000000)
        size &= 0x3FFFFFFF
        p = foff
        if aflags & 0x100:            # il nome del file e' ripetuto prima dei dati
            p += 1 + buf[p]
            size -= 1 + buf[foff]
        data = buf[p:p + size]
        return lz4.frame.decompress(data[4:]) if compressed else data

    return index, get


def read_strings(get, index, plugin, lang="italian"):
    """Tabella id -> testo dei file Strings di un plugin (es. Skyrim.esm, italiano)."""
    base = plugin.rsplit(".", 1)[0].lower()
    out = {}
    for ext in ("strings", "dlstrings", "ilstrings"):
        key = f"strings\\{base}_{lang}.{ext}"
        if key not in index:
            continue
        b = get(key)
        n = struct.unpack_from("<I", b, 0)[0]
        start = 8 + 8 * n
        for i in range(n):
            sid, offset = struct.unpack_from("<II", b, 8 + 8 * i)
            p = start + offset + (4 if ext != "strings" else 0)
            raw = b[p:b.index(b"\0", p)]
            try:
                out[sid] = raw.decode("utf-8")
            except UnicodeDecodeError:
                out[sid] = raw.decode("cp1252")
    return out
