{
  RPServer_EmptyWorld_DisableNPCs.pas
  ===================================
  Pascal Script per xEdit (SSEEdit / xEdit 4.x+).

  Scopo
  -----
  Itera sui reference ACHR (Placed NPC) presenti nei master selezionati
  e, per ciascuno la cui base NPC_ appartiene a una razza inclusa nella
  lista RacesToDisable, lo copia nel plugin "RPServer_EmptyWorld.esp"
  applicandogli il flag "Initially Disabled" (bit 0x800 del Record
  Header).

  Le razze da disabilitare sono quelle elencate in RegisterRacesToDisable
  sotto:
    - tutti gli umanoidi vanilla
    - DragonRace
    - tutti i mob dei dungeon (draughi, scheletri, falmer, automi
      dwemer, spettri/wisp, Dragon Priest, atronachi, lurker/seeker,
      riekling, ash spawn, death hound, gargoyle, chaurus reaper)
  Restano IGNORATI (= attivi nel mondo):
    - animali domestici (cavalli, cani, polli, mucche, capre, gatti)
    - fauna pacifica selvatica (cervi, alci, volpi, conigli, cinghiali)
    - predatori selvatici naturali (lupi, orsi, sabrecat, troll,
      mammut, giganti, skeever, frostbite spider, hagraven)
    - fauna esotica (spriggan, horker, slaughterfish, chaurus base,
      ash hopper)

  Uso
  ---
  1. Apri xEdit con i master vanilla caricati: Skyrim.esm, Update.esm,
     Dawnguard.esm, HearthFires.esm, Dragonborn.esm.
  2. Crea (se non esiste) un plugin vuoto chiamato esattamente
     "RPServer_EmptyWorld.esp" (File > Other > Add New File) e salvalo.
  3. Seleziona i master vanilla nel left panel (Skyrim.esm + DLC),
     click destro > Apply Script > scegli questo script.
  4. Al termine, controlla il messaggio finale (Messages tab) e salva
     RPServer_EmptyWorld.esp.

  Convenzioni
  -----------
  - Lo script NON crea il plugin di destinazione: se non lo trova,
    si ferma con messaggio chiaro.
  - Lo script salta i reference che vivono gia' nel plugin di
    destinazione (idempotenza: e' rilanciabile senza danni).
  - Lo script salta i reference che appartengono a un file diverso
    dai master vanilla (per non toccare overrides di terze mod).
  - Tutti gli output diagnostici vanno nel pannello Messages di xEdit.

  Compatibilita'
  --------------
  Testato concettualmente contro xEdit 4.1.5+. Le API usate
  (LinksTo, EditorID, GetNativeValue, SetNativeValue, wbCopyElementToFile)
  sono disponibili dal 4.0.x in poi.
}

unit RPServer_EmptyWorld_DisableNPCs;

const
  TargetPluginName        = 'RPServer_EmptyWorld.esp';
  InitiallyDisabledFlag   = $800;
  AllowedMasterCount      = 5;

var
  TargetFile          : IInterface;
  RacesToDisable       : TStringList;
  AllowedMasters      : TStringList;
  DisabledCount       : Integer;
  AlreadyDisabledCnt  : Integer;
  SkippedCount        : Integer;
  FailedCount         : Integer;
  ForeignMasterCount  : Integer;

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

// ---------------------------------------------------------------------
//  Lifecycle
// ---------------------------------------------------------------------
function Initialize: Integer;
begin
  Result := 0;
  DisabledCount      := 0;
  AlreadyDisabledCnt := 0;
  SkippedCount       := 0;
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

  AddMessage('=== RPServer_EmptyWorld DisableNPCs ===');
  AddMessage('Target plugin       : ' + GetFileName(TargetFile));
  AddMessage('Razze da disabilit. : ' + IntToStr(RacesToDisable.Count));
  AddMessage('Master autorizzati  : ' + IntToStr(AllowedMasters.Count));
  AddMessage('---');
end;

function Process(e: IInterface): Integer;
var
  sourceFileName : string;
  baseNpc        : IInterface;
  raceRef        : IInterface;
  raceEdid       : string;
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

  baseNpc := LinksTo(ElementByPath(e, 'NAME'));
  if not Assigned(baseNpc) then begin
    Inc(SkippedCount);
    Exit;
  end;
  if Signature(baseNpc) <> 'NPC_' then begin
    Inc(SkippedCount);
    Exit;
  end;

  raceRef := LinksTo(ElementByPath(baseNpc, 'RNAM'));
  if not Assigned(raceRef) then begin
    Inc(SkippedCount);
    Exit;
  end;

  raceEdid := EditorID(raceRef);
  if RacesToDisable.IndexOf(raceEdid) < 0 then begin
    Inc(SkippedCount);
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
  Inc(DisabledCount);
end;

function Finalize: Integer;
begin
  Result := 0;
  AddMessage('---');
  AddMessage('=== RPServer_EmptyWorld DisableNPCs: FINE ===');
  AddMessage('Disabilitati nuovi     : ' + IntToStr(DisabledCount));
  AddMessage('Gia'' disabilitati      : ' + IntToStr(AlreadyDisabledCnt));
  AddMessage('Ignorati (race off-list): ' + IntToStr(SkippedCount));
  AddMessage('Falliti                : ' + IntToStr(FailedCount));
  AddMessage('Da master non vanilla  : ' + IntToStr(ForeignMasterCount));
  AddMessage('=> Salva ora ' + TargetPluginName + ' (File > Save).');

  if Assigned(RacesToDisable) then RacesToDisable.Free;
  if Assigned(AllowedMasters) then AllowedMasters.Free;
end;

end.
