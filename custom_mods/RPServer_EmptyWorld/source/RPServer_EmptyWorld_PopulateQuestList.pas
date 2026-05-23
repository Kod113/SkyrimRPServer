{
  RPServer_EmptyWorld_PopulateQuestList.pas
  =========================================
  Pascal Script per xEdit (SSEEdit / xEdit 4.x+).

  Scopo
  -----
  Crea nel plugin "RPServer_EmptyWorld.esp" un FormList chiamato
  "RPServer_QuestsToStop" e lo popola con TUTTI i record QUST gia'
  presenti come override nel plugin (ci sono finiti grazie a
  RPServer_EmptyWorld_DisableQuests.pas).

  Questo FormList va poi assegnato in Creation Kit alla property
  "QuestsToStop" dello script Papyrus RPServer_EmptyWorldInit, che a
  runtime chiama Stop() su ogni quest della lista.

  IMPORTANTE — perche' questa versione e' diversa dalla v1
  -------------------------------------------------------
  La v1 dello script, se non riusciva a popolare il FormList, usciva
  con Result=1. Ma quando un Apply Script di xEdit termina in errore,
  xEdit SCARTA le modifiche fatte dallo script — incluso il record
  FLST appena creato. Risultato: il FormList non sopravviveva.

  Questa versione, dopo aver creato il record FLST, NON torna mai
  Result=1: termina sempre con successo, cosi' il FLST persiste.
  Inoltre crea il container dei FormID aggiungendo una voce con la
  signature corretta 'LNAM' (la v1 usava il nome 'FormIDs', che Add
  non accetta).

  Uso
  ---
  1. Apri xEdit con i 5 master vanilla + RPServer_EmptyWorld.esp.
     RPServer_EmptyWorld.esp deve gia' contenere i QUST: lancia
     prima DisableQuests.pas se non l'hai fatto.
  2. Nel left panel seleziona RPServer_EmptyWorld.esp, click destro
     > Apply Script > scegli questo script.
  3. Lo script deve terminare con "Done" (non "Aborted").
  4. Salva RPServer_EmptyWorld.esp (File > Save).

  Esito
  -----
  - Se vedi "Quest aggiunte al FormList : ~180" la popolazione
    automatica e' riuscita: hai finito, salva.
  - Se vedi la NOTA di fallback, il record FLST e' comunque creato:
    salva, poi riempilo a mano con drag-drop dei QUST in xEdit.

  Compatibilita'
  --------------
  xEdit 4.1.5+. API usate: FileCount, FileByIndex, GetFileName,
  RecordCount, RecordByIndex, Signature, EditorID, Add,
  SetElementEditValues, ElementByName, ElementAssign, SetEditValue,
  GetLoadOrderFormID.
}

unit RPServer_EmptyWorld_PopulateQuestList;

const
  TargetPluginName = 'RPServer_EmptyWorld.esp';
  FormListEdid     = 'RPServer_QuestsToStop';

var
  TargetFile : IInterface;

// ---------------------------------------------------------------------
//  Helpers
// ---------------------------------------------------------------------
function FindTargetPlugin: IInterface;
var
  i: Integer;
  f: IInterface;
begin
  Result := nil;
  for i := 0 to Pred(FileCount) do begin
    f := FileByIndex(i);
    if SameText(GetFileName(f), TargetPluginName) then begin
      Result := f;
      Exit;
    end;
  end;
end;

// Cerca un FLST con il nostro EditorID gia' presente in TargetFile.
function FindExistingFormList: IInterface;
var
  i: Integer;
  r: IInterface;
begin
  Result := nil;
  for i := 0 to Pred(RecordCount(TargetFile)) do begin
    r := RecordByIndex(TargetFile, i);
    if Signature(r) <> 'FLST' then Continue;
    if SameText(EditorID(r), FormListEdid) then begin
      Result := r;
      Exit;
    end;
  end;
end;

// ---------------------------------------------------------------------
//  Lifecycle
// ---------------------------------------------------------------------
function Initialize: Integer;
var
  i, questCount : Integer;
  r, flst, firstEntry, formIDs, entry : IInterface;
begin
  Result := 0;

  AddMessage('=== RPServer_EmptyWorld PopulateQuestList (v2) ===');

  TargetFile := FindTargetPlugin;
  if not Assigned(TargetFile) then begin
    AddMessage('ERRORE: plugin "' + TargetPluginName + '" non caricato.');
    Result := 1;   // qui si puo' abortire: non e' stato creato nulla
    Exit;
  end;

  // Se il FormList esiste gia', non si tocca nulla.
  flst := FindExistingFormList;
  if Assigned(flst) then begin
    AddMessage('Il FormList "' + FormListEdid + '" esiste gia''. Nessuna modifica.');
    AddMessage('Per rigenerarlo: cancella a mano il record FLST in xEdit e rilancia.');
    Exit;   // Result resta 0
  end;

  // Crea il record FLST.
  flst := Add(TargetFile, 'FLST', True);
  if not Assigned(flst) then begin
    AddMessage('ERRORE: impossibile creare il record FLST.');
    Result := 1;   // qui si puo' abortire: non e' stato creato nulla
    Exit;
  end;
  SetElementEditValues(flst, 'EDID', FormListEdid);
  AddMessage('Creato FormList "' + FormListEdid + '".');

  // --- DA QUI IN POI: MAI Result=1. Il record FLST esiste e deve ---
  // --- sopravvivere. Se la popolazione fallisce, si lascia il    ---
  // --- FLST vuoto da riempire a mano: ma esiste e si salva.      ---

  // Crea il container dei FormID aggiungendo la prima voce 'LNAM'
  // (signature corretta dei membri dell'array del FLST).
  firstEntry := Add(flst, 'LNAM', True);
  formIDs    := ElementByName(flst, 'FormIDs');

  if (not Assigned(firstEntry)) or (not Assigned(formIDs)) then begin
    AddMessage('---');
    AddMessage('NOTA: record FLST creato, ma la popolazione automatica');
    AddMessage('non e'' riuscita (API container). Salva il plugin, poi');
    AddMessage('riempi "' + FormListEdid + '" con drag-drop dei QUST.');
    Exit;   // Result 0: il FLST sopravvive
  end;

  // Popola: la prima voce riusa firstEntry, le successive via ElementAssign.
  questCount := 0;
  for i := 0 to Pred(RecordCount(TargetFile)) do begin
    r := RecordByIndex(TargetFile, i);
    if Signature(r) <> 'QUST' then Continue;

    if questCount = 0 then
      entry := firstEntry
    else
      entry := ElementAssign(formIDs, HighInteger, nil, False);

    if Assigned(entry) then begin
      SetEditValue(entry, IntToHex(GetLoadOrderFormID(r), 8));
      questCount := questCount + 1;
    end;
  end;

  AddMessage('---');
  AddMessage('Quest aggiunte al FormList : ' + IntToStr(questCount));
  if questCount = 0 then
    AddMessage('ATTENZIONE: zero QUST trovati. Hai lanciato DisableQuests.pas?');
  AddMessage('=> Salva ora ' + TargetPluginName + ' (File > Save).');
end;

function Process(e: IInterface): Integer;
begin
  Result := 0;
end;

function Finalize: Integer;
begin
  Result := 0;
end;

end.
