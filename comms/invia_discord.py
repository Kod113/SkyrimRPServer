"""Invia messaggi del team al canale Discord tramite webhook.

Uso (eseguito dalle GitHub Actions in .github/workflows/):
  python comms/invia_discord.py messaggio   -> pubblica comms/messaggio_settimana.md
  python comms/invia_discord.py promemoria  -> se domani c'è la riunione, pubblica il promemoria
  python comms/invia_discord.py promemoria --ora 12  -> come sopra, ma solo se in Italia sono le 12

Il webhook arriva dalla variabile d'ambiente DISCORD_WEBHOOK_URL
(GitHub → Settings → Secrets and variables → Actions). Non va mai scritto nel repo.
"""

import datetime as dt
import json
import os
import sys
import urllib.request
from pathlib import Path
from typing import Optional
from zoneinfo import ZoneInfo

COMMS = Path(__file__).parent
FUSO = ZoneInfo("Europe/Rome")
GIORNI = ["lunedì", "martedì", "mercoledì", "giovedì", "venerdì", "sabato", "domenica"]
MESI = ["gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno", "luglio",
        "agosto", "settembre", "ottobre", "novembre", "dicembre"]


def invia(testo: str) -> None:
    url = os.environ.get("DISCORD_WEBHOOK_URL")
    if not url:
        # Avviso (non errore): prima del setup del webhook le Action non devono fallire.
        print("::warning::DISCORD_WEBHOOK_URL non impostato: messaggio NON inviato. Vedi comms/README.md.")
        return
    if len(testo) > 2000:
        sys.exit(f"Messaggio troppo lungo per Discord ({len(testo)}/2000 caratteri).")
    corpo = json.dumps({"content": testo}).encode("utf-8")
    req = urllib.request.Request(url, data=corpo, headers={
        "Content-Type": "application/json",
        "User-Agent": "SkyrimRPServer-comms",
    })
    with urllib.request.urlopen(req) as r:
        print(f"Inviato su Discord (HTTP {r.status}).")


def messaggio() -> None:
    invia((COMMS / "messaggio_settimana.md").read_text(encoding="utf-8").strip())


def promemoria(ora_invio: Optional[int] = None) -> None:
    adesso = dt.datetime.now(FUSO)
    # Le Action girano in UTC: con l'ora legale/solare si lancia due volte e si invia
    # solo nell'ora italiana giusta.
    if ora_invio is not None and adesso.hour != ora_invio:
        print(f"Nessun promemoria: in Italia sono le {adesso:%H:%M}, si invia alle {ora_invio}:00.")
        return
    riunione = json.loads((COMMS / "prossima_riunione.json").read_text(encoding="utf-8"))
    data = dt.date.fromisoformat(riunione["data"])
    domani = adesso.date() + dt.timedelta(days=1)
    if data != domani:
        print(f"Nessun promemoria: la riunione è il {data}, domani è il {domani}.")
        return
    quando = f"{GIORNI[data.weekday()]} {data.day} {MESI[data.month - 1]}"
    righe = [f"⏰ **Promemoria:** domani, **{quando}**, c'è la riunione di SkyrimRP"]
    if riunione.get("ora"):
        righe[0] += f" alle **{riunione['ora']}**"
    if riunione.get("luogo"):
        righe.append(f"📍 {riunione['luogo']}")
    if riunione.get("note"):
        righe.append(f"📋 {riunione['note']}")
    invia("\n".join(righe))


if __name__ == "__main__":
    args = sys.argv[1:]
    if args == ["messaggio"]:
        messaggio()
    elif args[:1] == ["promemoria"] and len(args) in (1, 3) and (len(args) == 1 or args[1] == "--ora"):
        promemoria(int(args[2]) if len(args) == 3 else None)
    else:
        sys.exit("Uso: python comms/invia_discord.py messaggio | promemoria [--ora HH]")
