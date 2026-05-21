{
  RPServer_EmptyWorld_DisableNPCs.pas
  ===================================
  Pascal Script per xEdit (SSEEdit / xEdit 4.x+).

  Scopo
  -----
  Itera sui reference ACHR (Placed NPC) presenti nei master selezionati
  e flagga "Initially Disabled" (bit 0x800 del Record Header) ogni
  reference che, risolvendone la base, puo' generare un attore la cui
  razza appartiene a RacesToDisable.

  La base di un ACHR puo' essere:
    - un NPC_  -> si legge la razza (RNAM). Se l'NPC eredita i Traits da
                  un template (ACBS\Template Flags bit 0 = Use Traits),
                  la razza viene risolta seguendo il template (TPLT).
    - un LVLN  -> Leveled NPC: la lista viene risolta ricorsivamente
                  (anche annidata) fino agli NPC_ foglia.

  Questa e' la differenza chiave rispetto alla v0.3.x, che gestiva solo
  le basi NPC_ dirette e ignorava i LVLN: la maggior parte dei mob dei
  dungeon (draughi, falmer, banditi, automi) e' piazzata via LVLN.

  Policy liste miste (decisione D-017)
  ------------------------------------
  Un ACHR viene disabilitato se la sua base puo' generare ANCHE UN SOLO
  attore non-animale. Una lista che mescola animali e nemici viene
  quindi disabilitata. Massima coerenza con l'obiettivo "mondo vuoto":
  un punto di spawn che potrebbe far comparire un nemico va spento.
  Restano attivi solo gli ACHR che risolvono ESCLUSIVAMENTE a razze
  animali (domestici, fauna pacifica, predatori naturali, fauna esotica).

  Uso
  ---
  1. Apri xEdit con i master vanilla caricati: Skyrim.esm, Update.esm,
     Dawnguard.esm, HearthFires.esm, Dragonborn.esm.
  2. Crea un plugin vuoto chiamato esattamente "RPServer_EmptyWorld.esp"
     (File > Other > Add New File). Lo script aggiunge da solo i master.
  3. Seleziona i master vanilla nel left panel, click destro >
     Apply Script > scegli questo script.
  4. Al termine controlla il blocco finale nel pannello Messages e
     salva RPServer_EmptyWorld.esp (File > Save).

  Note
  ----
  - Lo script e' idempotente: rilanciabile senza danni.
  - Salta i reference gia' nel plugin di destinazione e quelli da
    master non vanilla.
  - Risolve sempre il winning override di basi, template e razze.
  - Cache (ResolveCache) per non riesaminare la stessa base; visited-set
    per protezione dai cicli nelle catene LVLN/template.

  Compatibilita'
  --------------
  xEdit 4.1.5+. API usate: LinksTo, WinningOverride, EditorID,
  Signature, ElementByPath, ElementByName, ElementByIndex, ElementCount,
  GetNativeValue, SetNativeValue, FormID, GetFile, GetFileName, Name,
  wbCopyElementToFile, AddMasterIfMissing, SortMasters.
}

unit RPServer_EmptyWorld_DisableNPCs;

const
  TargetPluginName      = 'RPServer_EmptyWorld.esp';
  InitiallyDisabledFlag = $800;
  UseTraitsFlag         = $01;   // ACBS\Template Flags bit 0
  MaxResolveDepth       = 32;

var
  TargetFile         : IInterface;
  RacesToDisable     : TStringList;
  AllowedMasters     : TStringList;
  ResolveCache       : TStringList;
  DisabledViaNPC     : Integer;
  DisabledViaLVLN    : Integer;
  AlreadyDisabledCnt : Integer;
  KeptAnimalNPC      : Integer;
  KeptAnimalLVLN     : Integer;
  SkippedNoBase      : Integer;
  SkippedOther       : Integer;
  FailedCount        : Integer;
  ForeignMasterCount : Integer;

// ---------------------------------------------------------------------
//  Registrazione razze da disabilitare
// ---------------------------------------------------------------------
procedure RegisterRacesToDisable;
begin
  // ------- Umanoidi giocabili vanilla -------
  RacesToDisable.Add('NordRace');
  RacesToDisable.Add('NordRaceVampire');
  RacesToDisable.Add('NordRaceAstrid');
  RacesToDisable.Add('ImperialRace');
  RacesToDisable.Add('ImperialRaceVampire');
  RacesToDisable.Add('BretonRace');
  RacesToDisable.Add('BretonRaceVampire');
  RacesToDisable.Add('RedguardRace');
  RacesToDisable.Add('RedguardRaceVampire');
  RacesToDisable.Add('AltmerRace');
  RacesToDisable.Add('AltmerRaceVampire');
  RacesToDisable.Add('BosmerRace');
  RacesToDisable.Add('BosmerRaceVampire');
  RacesToDisable.Add('DunmerRace');
  RacesToDisable.Add('DunmerRaceVampire');
  RacesToDisable.Add('OrcRace');
  RacesToDisable.Add('OrcRaceVampire');
  RacesToDisable.Add('KhajiitRace');
  RacesToDisable.Add('KhajiitRaceVampire');
  RacesToDisable.Add('ArgonianRace');
  RacesToDisable.Add('ArgonianRaceVampire');

  // Varianti narrative
  RacesToDisable.Add('ElderRace');
  RacesToDisable.Add('ElderRaceVampire');
  RacesToDisable.Add('AfflictedRace');
  RacesToDisable.Add('DA13AfflictedRace');

  // DLC Dawnguard
  RacesToDisable.Add('DLC1NordRace');
  RacesToDisable.Add('DLC1NordRaceVampire');

  // DLC Dragonborn (Skaal etc.)
  RacesToDisable.Add('DLC2ExpSkaalRace');

  // ------- Draghi -------
  // Tutti i draghi vanilla (Alduin, Paarthurnax, Odahviing, Sahloknir,
  // draghi piazzati su Word Walls e in dragon mounds, draghi nominati
  // di Dragonborn DLC) usano questa stessa race base.
  RacesToDisable.Add('DragonRace');

  // ------- Mob dei dungeon -------
  // Undead
  RacesToDisable.Add('DraugrRace');
  RacesToDisable.Add('DraugrSkeletonRace');
  RacesToDisable.Add('SkeletonRace');
  RacesToDisable.Add('DragonPriestRace');

  // Falmer
  RacesToDisable.Add('FalmerRace');

  // Automi Dwemer
  RacesToDisable.Add('DwarvenSpiderRace');
  RacesToDisable.Add('DwarvenSphereRace');
  RacesToDisable.Add('DwarvenCenturionRace');
  RacesToDisable.Add('DwarvenBallistaRace');

  // Spettri / Wisp
  RacesToDisable.Add('WispRace');
  RacesToDisable.Add('WispmotherRace');

  // Atronachi (creature evocate ma piazzate anche come mob in alcune cellule)
  RacesToDisable.Add('FrostAtronachRace');
  RacesToDisable.Add('FlameAtronachRace');
  RacesToDisable.Add('StormAtronachRace');

  // Dragonborn DLC: Lurker, Seeker, Riekling, Ash Spawn
  RacesToDisable.Add('DLC2LurkerRace');
  RacesToDisable.Add('DLC2SeekerRace');
  RacesToDisable.Add('DLC2RieklingRace');
  RacesToDisable.Add('DLC2RieklingChiefRace');
  RacesToDisable.Add('DLC2AshSpawnRace');

  // Dawnguard DLC: Death Hound, Gargoyle, Chaurus Reaper (variante boss)
  RacesToDisable.Add('DLC1DeathHoundRace');
  RacesToDisable.Add('DLC1GargoyleRace');
  RacesToDisable.Add('DLC1ChaurusReaperRace');
  // Variante senza prefisso DLC1 (alcune build vanilla la espongono cosi'):
  RacesToDisable.Add('ChaurusReaperRace');

  // NOTA: NON sono qui (restano attivi):
  //  - WolfRace, IceWolfRace
  //  - BearBlackRace, BearBrownRace, BearCaveRace
  //  - SabreCatRace, SabreCatSnowyRace
  //  - TrollRace, FrostTrollRace, DLC2BullTrollRace
  //  - MammothRace, GiantRace, DLC2GiantRace
  //  - SkeeverRace
  //  - FrostbiteSpiderRaceSmall/Large/Giant
  //  - HagravenRace
  //  - SprigganRace, SprigganMatronRace, SprigganBurnRace
  //  - HorkerRace
  //  - SlaughterfishRace
  //  - ChaurusRace (base, non Reaper)
  //  - DLC2AshHopperRace
  //  - Tutti gli animali domestici e la fauna pacifica
end;

procedure RegisterAllowedMasters;
begin
  AllowedMasters.Add('Skyrim.esm');
  AllowedMasters.Add('Update.esm');
  AllowedMasters.Add('Dawnguard.esm');
  AllowedMasters.Add('HearthFires.esm');
  AllowedMasters.Add('Dragonborn.esm');
end;

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

function IsAllowedMaster(filename: string): Boolean;
begin
  Result := AllowedMasters.IndexOf(filename) >= 0;
end;

// Risolve un elemento-reference al suo record, winning override.
function ResolveWinning(refElem: IInterface): IInterface;
var
  linked: IInterface;
begin
  Result := nil;
  if not Assigned(refElem) then Exit;
  linked := LinksTo(refElem);
  if Assigned(linked) then
    Result := WinningOverride(linked);
end;

// ---------------------------------------------------------------------
//  Risoluzione razza: una base (NPC_ o LVLN) puo' generare un
//  attore la cui razza e' in RacesToDisable?
//  Ricorsiva: segue catene LVLN annidate e template NPC_ (Use Traits).
//  'visited' protegge dai cicli; 'depth' e' un ulteriore tappo.
// ---------------------------------------------------------------------
function ReachesDisableRace(base: IInterface; visited: TStringList; depth: Integer): Boolean;
var
  sig, key, raceEdid : string;
  tplElem, tpl, raceRef, entries, entry, target : IInterface;
  tplFlags : Cardinal;
  i : Integer;
begin
  Result := False;
  if not Assigned(base) then Exit;
  if depth > MaxResolveDepth then Exit;

  sig := Signature(base);
  if (sig <> 'NPC_') and (sig <> 'LVLN') then Exit;

  key := sig + IntToHex(FormID(base), 8);
  if visited.IndexOf(key) >= 0 then Exit;   // ciclo: nessun contributo
  visited.Add(key);

  if sig = 'NPC_' then begin
    // Se l'NPC eredita i Traits da un template, la razza viene dal template.
    tplElem := ElementByPath(base, 'ACBS\Template Flags');
    if Assigned(tplElem) then tplFlags := GetNativeValue(tplElem)
    else tplFlags := 0;

    if (tplFlags and UseTraitsFlag) <> 0 then begin
      tpl := ResolveWinning(ElementByPath(base, 'TPLT'));
      if Assigned(tpl) then begin
        Result := ReachesDisableRace(tpl, visited, depth + 1);
        Exit;
      end;
      // template assente/non risolto: si ripiega su RNAM qui sotto.
    end;

    // Razza diretta da RNAM.
    raceRef := ResolveWinning(ElementByPath(base, 'RNAM'));
    if Assigned(raceRef) then begin
      raceEdid := EditorID(raceRef);
      Result := RacesToDisable.IndexOf(raceEdid) >= 0;
    end;
    Exit;
  end;

  // sig = 'LVLN': risolvi la lista, anche annidata. Policy D-017: basta
  // una sola voce non-animale per far scattare il disable.
  entries := ElementByName(base, 'Leveled List Entries');
  if Assigned(entries) then begin
    for i := 0 to Pred(ElementCount(entries)) do begin
      entry := ElementByIndex(entries, i);
      target := ResolveWinning(ElementByPath(entry, 'LVLO\Reference'));
      if ReachesDisableRace(target, visited, depth + 1) then begin
        Result := True;
        Exit;
      end;
    end;
  end;
end;

// Wrapper con cache sulla base diretta dell'ACHR (migliaia di ACHR
// condividono la stessa base LVLN/NPC_).
function BaseReachesDisableRace(base: IInterface): Boolean;
var
  key, cached : string;
  visited : TStringList;
begin
  Result := False;
  if not Assigned(base) then Exit;

  key := Signature(base) + IntToHex(FormID(base), 8);
  cached := ResolveCache.Values[key];
  if cached = '1' then begin Result := True;  Exit; end;
  if cached = '0' then begin Result := False; Exit; end;

  visited := TStringList.Create;
  try
    Result := ReachesDisableRace(base, visited, 0);
  finally
    visited.Free;
  end;

  if Result then ResolveCache.Values[key] := '1'
  else ResolveCache.Values[key] := '0';
end;

// ---------------------------------------------------------------------
//  Lifecycle
// ---------------------------------------------------------------------
function Initialize: Integer;
begin
  Result := 0;
  DisabledViaNPC     := 0;
  DisabledViaLVLN    := 0;
  AlreadyDisabledCnt := 0;
  KeptAnimalNPC      := 0;
  KeptAnimalLVLN     := 0;
  SkippedNoBase      := 0;
  SkippedOther       := 0;
  FailedCount        := 0;
  ForeignMasterCount := 0;

  RacesToDisable := TStringList.Create;
  RacesToDisable.Sorted := True;
  RacesToDisable.Duplicates := dupIgnore;
  RacesToDisable.CaseSensitive := False;
  RegisterRacesToDisable;

  AllowedMasters := TStringList.Create;
  AllowedMasters.Sorted := True;
  AllowedMasters.Duplicates := dupIgnore;
  AllowedMasters.CaseSensitive := False;
  RegisterAllowedMasters;

  ResolveCache := TStringList.Create;
  ResolveCache.CaseSensitive := False;

  TargetFile := FindTargetPlugin;
  if not Assigned(TargetFile) then begin
    AddMessage('=== RPServer_EmptyWorld DisableNPCs ===');
    AddMessage('ERRORE: il plugin di destinazione "' + TargetPluginName + '" non e'' caricato.');
    AddMessage('Crea il plugin vuoto, salvalo, e rilancia lo script.');
    Result := 1;
    Exit;
  end;

  // Garantisce che i 5 master vanilla siano dichiarati nel plugin di
  // destinazione PRIMA di qualsiasi wbCopyElementToFile. Senza questo,
  // su un .esp creato vuoto la copia del primo record fallisce con:
  //   "Load order FileID [00] can not be mapped to file FileID"
  AddMasterIfMissing(TargetFile, 'Skyrim.esm');
  AddMasterIfMissing(TargetFile, 'Update.esm');
  AddMasterIfMissing(TargetFile, 'Dawnguard.esm');
  AddMasterIfMissing(TargetFile, 'HearthFires.esm');
  AddMasterIfMissing(TargetFile, 'Dragonborn.esm');
  SortMasters(TargetFile);

  AddMessage('=== RPServer_EmptyWorld DisableNPCs (v0.4.0, LVLN-aware) ===');
  AddMessage('Target plugin       : ' + GetFileName(TargetFile));
  AddMessage('Razze da disabilit. : ' + IntToStr(RacesToDisable.Count));
  AddMessage('---');
end;

function Process(e: IInterface): Integer;
var
  sourceFileName : string;
  baseSig        : string;
  base           : IInterface;
  refCopy        : IInterface;
  flagsElem      : IInterface;
  currentFlags   : Cardinal;
begin
  Result := 0;

  if Signature(e) <> 'ACHR' then Exit;

  sourceFileName := GetFileName(GetFile(e));

  // Idempotenza: non rilavorare i record gia' nel nostro plugin
  if SameText(sourceFileName, TargetPluginName) then Exit;

  // Sicurezza: tocchiamo solo i master vanilla
  if not IsAllowedMaster(sourceFileName) then begin
    Inc(ForeignMasterCount);
    Exit;
  end;

  base := ResolveWinning(ElementByPath(e, 'NAME'));
  if not Assigned(base) then begin
    Inc(SkippedNoBase);
    Exit;
  end;

  baseSig := Signature(base);
  if (baseSig <> 'NPC_') and (baseSig <> 'LVLN') then begin
    Inc(SkippedOther);
    Exit;
  end;

  // Decisione: questa base puo' generare un non-animale?
  if not BaseReachesDisableRace(base) then begin
    if baseSig = 'NPC_' then Inc(KeptAnimalNPC)
    else Inc(KeptAnimalLVLN);
    Exit;
  end;

  // Tutto ok: copia nel plugin di destinazione e imposta il flag
  refCopy := wbCopyElementToFile(e, TargetFile, False, True);
  if not Assigned(refCopy) then begin
    AddMessage('FAIL copy: ' + Name(e));
    Inc(FailedCount);
    Exit;
  end;

  flagsElem := ElementByPath(refCopy, 'Record Header\Record Flags');
  if not Assigned(flagsElem) then begin
    AddMessage('FAIL no flags: ' + Name(refCopy));
    Inc(FailedCount);
    Exit;
  end;

  currentFlags := GetNativeValue(flagsElem);
  if (currentFlags and InitiallyDisabledFlag) <> 0 then begin
    Inc(AlreadyDisabledCnt);
    Exit;
  end;

  SetNativeValue(flagsElem, currentFlags or InitiallyDisabledFlag);
  if baseSig = 'NPC_' then Inc(DisabledViaNPC)
  else Inc(DisabledViaLVLN);
end;

function Finalize: Integer;
var
  totalDisabledNew : Integer;
begin
  Result := 0;
  totalDisabledNew := DisabledViaNPC + DisabledViaLVLN;

  AddMessage('---');
  AddMessage('=== RPServer_EmptyWorld DisableNPCs: FINE ===');
  AddMessage('Disabilitati nuovi via NPC_  : ' + IntToStr(DisabledViaNPC));
  AddMessage('Disabilitati nuovi via LVLN  : ' + IntToStr(DisabledViaLVLN));
  AddMessage('Disabilitati nuovi TOTALE    : ' + IntToStr(totalDisabledNew));
  AddMessage('Gia'' disabilitati            : ' + IntToStr(AlreadyDisabledCnt));
  AddMessage('Tenuti (animale, base NPC_)  : ' + IntToStr(KeptAnimalNPC));
  AddMessage('Tenuti (animale, base LVLN)  : ' + IntToStr(KeptAnimalLVLN));
  AddMessage('Saltati (base non risolta)   : ' + IntToStr(SkippedNoBase));
  AddMessage('Saltati (base non NPC_/LVLN) : ' + IntToStr(SkippedOther));
  AddMessage('Falliti                      : ' + IntToStr(FailedCount));
  AddMessage('Da master non vanilla        : ' + IntToStr(ForeignMasterCount));
  AddMessage('=> Salva ora ' + TargetPluginName + ' (File > Save).');

  if Assigned(RacesToDisable) then RacesToDisable.Free;
  if Assigned(AllowedMasters) then AllowedMasters.Free;
  if Assigned(ResolveCache)   then ResolveCache.Free;
end;

end.
