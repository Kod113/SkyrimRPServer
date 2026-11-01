"""Trascrive una registrazione multi-traccia di Craig (una traccia per persona).

Uso:  python riunioni/strumenti/trascrivi.py <cartella_tracce> <file_output.md> [nomi.json] [modello]
- cartella_tracce: cartella con i file audio estratti dallo zip di Craig
- nomi.json (opzionale): {"dave_st": "Davide", "kod113": "David"}
- modello (opzionale): tiny / base / small / medium (default: small)
"""
import json
import re
import subprocess
import sys
from pathlib import Path

import numpy as np
from faster_whisper import WhisperModel

# Nomi Discord -> nomi del team (si possono sovrascrivere con nomi.json)
NOMI = {"kod113": "David", "davest_98": "Davide", "shoonish": "Alessio", "jacklemmon": "Giacomo"}


def carica_audio(path: Path):
    # Decodifica con ffmpeg in audio mono a 16 kHz (evita problemi di compatibilità con i file .opus)
    raw = subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-i", str(path), "-f", "s16le",
                          "-ac", "1", "-ar", "16000", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.int16).astype(np.float32) / 32768.0


AUDIO = {".flac", ".ogg", ".opus", ".mp3", ".m4a", ".aac", ".wav"}


def nome_da_file(path: Path, mappa: dict) -> str:
    # Craig nomina i file tipo "4-davest_98.opus": si toglie il numero iniziale
    base = re.sub(r"^\d+-", "", path.stem)
    return mappa.get(base.lower(), base)


def hhmmss(sec: float) -> str:
    s = int(sec)
    return f"{s // 3600:02d}:{s % 3600 // 60:02d}:{s % 60:02d}"


def main():
    cartella, uscita = Path(sys.argv[1]), Path(sys.argv[2])
    mappa = dict(NOMI)
    if len(sys.argv) > 3 and sys.argv[3] not in ("-", ""):
        mappa |= {k.lower(): v for k, v in json.loads(Path(sys.argv[3]).read_text(encoding="utf-8")).items()}
    modello = sys.argv[4] if len(sys.argv) > 4 else "small"

    tracce = sorted(p for p in cartella.rglob("*") if p.suffix.lower() in AUDIO)
    if not tracce:
        sys.exit(f"Nessun file audio trovato in {cartella}")

    model = WhisperModel(modello, device="cpu", compute_type="int8")
    battute = []  # (inizio, fine, persona, testo)
    for t in tracce:
        persona = nome_da_file(t, mappa)
        print(f"Trascrivo {t.name} -> {persona} ...", flush=True)
        segmenti, _ = model.transcribe(carica_audio(t), language="it", vad_filter=True, beam_size=5,
                                       initial_prompt="Riunione del team di Atronach RP, server roleplay di Skyrim su SkyMP.")
        for s in segmenti:
            testo = s.text.strip()
            if testo:
                battute.append((s.start, s.end, persona, testo))

    battute.sort(key=lambda b: b[0])

    # Unisce frasi consecutive della stessa persona in un unico blocco
    blocchi = []
    for inizio, fine, persona, testo in battute:
        if blocchi and blocchi[-1]["persona"] == persona and inizio - blocchi[-1]["fine"] < 4:
            blocchi[-1]["testo"] += " " + testo
            blocchi[-1]["fine"] = fine
        else:
            blocchi.append({"inizio": inizio, "fine": fine, "persona": persona, "testo": testo})

    persone = sorted({b["persona"] for b in blocchi})
    righe = [
        "# Trascrizione riunione",
        "",
        f"Partecipanti: {', '.join(persone)}",
        "",
        "> Trascrizione automatica (Whisper): possono esserci errori su nomi propri e termini tecnici.",
        "",
    ]
    for b in blocchi:
        righe.append(f"**[{hhmmss(b['inizio'])}] {b['persona']}:** {b['testo']}")
        righe.append("")
    uscita.write_text("\n".join(righe), encoding="utf-8")
    print(f"Fatto: {len(blocchi)} interventi -> {uscita}")


if __name__ == "__main__":
    main()
