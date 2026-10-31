# Riunioni del team

Una cartella per riunione: `riunioni/AAAA-MM-GG/`, con dentro:

- `trascrizione.md`: tutto quello che è stato detto, diviso per persona e con l'orario (senza le parti personali);
- `riassunto.md`: decisioni, cose da fare (chi/cosa/entro), idee emerse, questioni aperte e impatto sul repo.

## Come si fa

1. All'inizio della riunione, in un canale testuale del Discord: `/join` (il bot **Craig** entra nel canale vocale e registra). Avvisate tutti che si registra.
2. Alla fine: `/stop`. Craig manda in privato il link per il download: scegliete **Multi-track → Opus** e scaricate anche `info.txt`.
3. Date i file a Claude: trascrive ogni traccia, scrive trascrizione e riassunto, aggiorna `TASKS.md` e apre la PR. Il responsabile dev fa il merge.

Lo script usato per trascrivere è `strumenti/trascrivi.py` (Whisper, modello "small").
