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

  Perche' via script e non a mano in CK
  -------------------------------------
  La lista contiene ~180 quest: popolarla a mano in CK e' lungo e
  soggetto a errori (quest dimenticate o sbagliate). Iterando i QUST
  gia' nel plugin il risultato e' deterministico e sempre allineato
  a cio' che DisableQuests.pas ha effettivamente disabilitato.

  Uso
  ---
  1. Apri xEdit con i 5 master vanilla + RPServer_EmptyWorld.esp.
     RPServer_EmptyWorld.esp deve gia' contenere i QUST: lancia
     prima DisableQuests.pas se non l'hai fatto.
  2. Nel left panel seleziona RPServer_EmptyWorld.esp, click destro
     > Apply Script > scegli questo script.
  3. Controlla il blocco finale nel pannello Messages e salva
     RPServer_EmptyWorld.esp (File > Save).

  Rilancio
  --------
  Se "RPServer_QuestsToStop" esiste gia', lo script si ferma con un
  messaggio e NON tocca nulla. Per rigenerarlo: cancella a mano il
  record FLST in xEdit (click destro sul record > Remove) e rilancia.

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
  i          : Integer;
  r          : IInterface;
  flst       : IInterface;
  formIDs    : IInterface;
  entry      : IInterface;
  questCount : Integer;
begin
  Result := 0;

  AddMessage('=== RPServer_EmptyWorld PopulateQuestList ===');

  TargetFile := FindTargetPlugin;
  if not Assigned(TargetFile) then begin
    AddMessage('ERRORE: plugin "' + TargetPluginName + '" non caricato.');
    Result := 1;
    Exit;
  end;

  // Se il FormList esiste gia', non si tocca nulla.
  flst := FindExistingFormList;
  if Assigned(flst) then begin
    AddMessage('Il FormList "' + FormListEdid + '" esiste gia''.');
    AddMessage('Per rigenerarlo: cancella a mano il record FLST in xEdit e rilancia.');
    AddMessage('Nessuna modifica effettuata.');
    Result := 1;
    Exit;
  end;

  // Crea il record FLST.
  flst := Add(TargetFile, 'FLST', True);
  if not Assigned(flst) then begin
    AddMessage('ERRORE: impossibile creare il record FLST.');
    Result := 1;
    Exit;
  end;
  SetElementEditValues(flst, 'EDID', FormListEdid);
  AddMessage('Creato FormList "' + FormListEdid + '".');

  // Container dei FormID.
  formIDs := ElementByName(flst, 'FormIDs');
  if not Assigned(formIDs) then
    formIDs := Add(flst, 'FormIDs', True);
  if not Assigned(formIDs) then begin
    AddMessage('ERRORE: impossibile creare il container FormIDs.');
    Result := 1;
    Exit;
  end;

  // Itera i QUST presenti nel plugin e aggiungili al FormList.
  questCount := 0;
  for i := 0 to Pred(RecordCount(TargetFile)) do begin
    r := RecordByIndex(TargetFile, i);
    if Signature(r) <> 'QUST' then Continue;

    entry := ElementAssign(formIDs, HighInteger, nil, False);
    if not Assigned(entry) then begin
      AddMessage('FAIL: impossibile aggiungere entry per ' + EditorID(r));
      Continue;
    end;
    SetEditValue(entry, IntToHex(GetLoadOrderFormID(r), 8));
    questCount := questCount + 1;
  end;

  AddMessage('---');
  AddMessage('Quest aggiunte al FormList : ' + IntToStr(questCount));
  if questCount = 0 then
    AddMessage('ATTENZIONE: zero QUST nel plugin. Hai lanciato DisableQuests.pas?');
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
