{
  RPServer_EmptyWorld_DisableQuests.pas
  =====================================
  Pascal Script per xEdit (SSEEdit / xEdit 4.x+).

  Scopo
  -----
  Itera sui record QUST (Quest) presenti nei master vanilla
  e per ognuno che corrisponde a una "quest narrativa" (Main
  Quest, Civil War, Compagni, Collegio, Ladri, Confraternita
  Oscura, daedric, DLC story, sistema draghi) lo copia nel
  plugin "RPServer_EmptyWorld.esp" rimuovendo il flag
  "Start Game Enabled" dal subrecord DNAM.

  Le quest di sistema (Player setup, weather, music,
  achievement, dialogo generico, crime/bounty framework,
  housing Hearthfires, fauna spawns) NON sono in lista e
  restano intatte.

  Uso
  ---
  1. Apri xEdit con i master vanilla caricati.
  2. Assicurati che esista il plugin "RPServer_EmptyWorld.esp"
     (di solito gia' creato dallo script DisableNPCs).
  3. Seleziona i master vanilla, click destro > Apply Script.
  4. Salva il plugin di destinazione al termine.

  Nota
  ----
  Disabilitare "Start Game Enabled" ferma le quest che si
  auto-avviavano. Le quest avviate da Story Manager events o da
  trigger script residui vengono coperte dalla quest Papyrus di
  fallback RPServer_EmptyWorldInit che chiama Stop() runtime.
}

unit RPServer_EmptyWorld_DisableQuests;

const
  TargetPluginName    = 'RPServer_EmptyWorld.esp';
  StartGameEnabledBit = $01;

var
  TargetFile      : IInterface;
  TargetQuests    : TStringList;
  AllowedMasters  : TStringList;
  DisabledCount   : Integer;
  AlreadyClearCnt : Integer;
  SkippedCount    : Integer;
  FailedCount     : Integer;

// ---------------------------------------------------------------------
//  Registrazione quest da disabilitare
// ---------------------------------------------------------------------
procedure AddMainQuest;
begin
  // Intro Helgen + Main Quest chain
  TargetQuests.Add('MQ101');
  TargetQuests.Add('MQ102');
  TargetQuests.Add('MQ103');
  TargetQuests.Add('MQ104');
  TargetQuests.Add('MQ105');
  TargetQuests.Add('MQ106');
  TargetQuests.Add('MQ201');
  TargetQuests.Add('MQ202');
  TargetQuests.Add('MQ203');
  TargetQuests.Add('MQ204');
  TargetQuests.Add('MQ205');
  TargetQuests.Add('MQ206');
  TargetQuests.Add('MQ301');
  TargetQuests.Add('MQ302');
  TargetQuests.Add('MQ303');
  TargetQuests.Add('MQ304');
  TargetQuests.Add('MQ305');
  TargetQuests.Add('MQ306');
  TargetQuests.Add('MQPaarthurnax');
  TargetQuests.Add('MQDelphinePostQuest');
end;

procedure AddDragonSystem;
begin
  // Sistema attacchi draghi e Word Walls
  TargetQuests.Add('MQ_RandomDragons');
  TargetQuests.Add('WIDragonAttacks');
  TargetQuests.Add('DragonAttacks');
  TargetQuests.Add('DragonRising2');
  // Word of Power trigger quests (Word Walls insegnamento)
  TargetQuests.Add('WordOfPowerTrigger');
  TargetQuests.Add('WordOfPower');
end;

procedure AddCivilWar;
begin
  TargetQuests.Add('CW00');
  TargetQuests.Add('CW01');
  TargetQuests.Add('CW02');
  TargetQuests.Add('CW02A');
  TargetQuests.Add('CW02B');
  TargetQuests.Add('CW03');
  TargetQuests.Add('CW04');
  TargetQuests.Add('CWMission01');
  TargetQuests.Add('CWMission02');
  TargetQuests.Add('CWMission03');
  TargetQuests.Add('CWMission04');
  TargetQuests.Add('CWMission05');
  TargetQuests.Add('CWMission06');
  TargetQuests.Add('CWMission07');
  TargetQuests.Add('CWMission08');
  TargetQuests.Add('CWFieldCO');
  TargetQuests.Add('CWReunite');
  TargetQuests.Add('CWSiegeObjectiveSpeech');
  TargetQuests.Add('CWQuestline');
end;

procedure AddCompanions;
begin
  TargetQuests.Add('C00');
  TargetQuests.Add('C01');
  TargetQuests.Add('C02');
  TargetQuests.Add('C03');
  TargetQuests.Add('C04');
  TargetQuests.Add('C05');
  TargetQuests.Add('C06');
  TargetQuests.Add('CR01');
  TargetQuests.Add('CR02');
  TargetQuests.Add('CR03');
  TargetQuests.Add('CR04');
  TargetQuests.Add('CR05');
  TargetQuests.Add('CR06');
  TargetQuests.Add('CR07');
  TargetQuests.Add('CR08');
  TargetQuests.Add('CR09');
  TargetQuests.Add('CR10');
  TargetQuests.Add('CR11');
  TargetQuests.Add('CR12');
  TargetQuests.Add('CR13');
  TargetQuests.Add('CR14');
  TargetQuests.Add('CR15');
end;

procedure AddMagesGuild;
begin
  TargetQuests.Add('MG01');
  TargetQuests.Add('MG02');
  TargetQuests.Add('MG03');
  TargetQuests.Add('MG04');
  TargetQuests.Add('MG05');
  TargetQuests.Add('MG06');
  TargetQuests.Add('MG07');
  TargetQuests.Add('MG08');
  TargetQuests.Add('MGRitual01');
  TargetQuests.Add('MGRitual02');
  TargetQuests.Add('MGRitual03');
  TargetQuests.Add('MGRitual04');
  TargetQuests.Add('MGRitual05');
  TargetQuests.Add('MGRAppr');
  TargetQuests.Add('MGRAdept');
  TargetQuests.Add('MGRExpert');
  TargetQuests.Add('MGRMaster');
end;

procedure AddThievesGuild;
begin
  TargetQuests.Add('TG00');
  TargetQuests.Add('TG01');
  TargetQuests.Add('TG02');
  TargetQuests.Add('TG02B');
  TargetQuests.Add('TG03');
  TargetQuests.Add('TG04');
  TargetQuests.Add('TG05');
  TargetQuests.Add('TG06');
  TargetQuests.Add('TG07');
  TargetQuests.Add('TG08');
  TargetQuests.Add('TG08B');
  TargetQuests.Add('TG09');
  TargetQuests.Add('TG10');
  TargetQuests.Add('TGRGuild');
  TargetQuests.Add('TGRRadiant');
  TargetQuests.Add('TGTQ01');
  TargetQuests.Add('TGTQ02');
  TargetQuests.Add('TGTQ03');
  TargetQuests.Add('TGTQ04');
end;

procedure AddDarkBrotherhood;
begin
  TargetQuests.Add('DB01');
  TargetQuests.Add('DB02');
  TargetQuests.Add('DB02a');
  TargetQuests.Add('DB02b');
  TargetQuests.Add('DB02c');
  TargetQuests.Add('DB03');
  TargetQuests.Add('DB04');
  TargetQuests.Add('DB04a');
  TargetQuests.Add('DB04b');
  TargetQuests.Add('DB05');
  TargetQuests.Add('DB06');
  TargetQuests.Add('DB07');
  TargetQuests.Add('DB08');
  TargetQuests.Add('DB09');
  TargetQuests.Add('DB10');
  TargetQuests.Add('DB11');
  TargetQuests.Add('DB11Mq');
  TargetQuests.Add('DB12');
  TargetQuests.Add('DB12a');
  TargetQuests.Add('DBDestroy');
  TargetQuests.Add('DBRecurring');
end;

procedure AddDaedric;
begin
  TargetQuests.Add('DA01');
  TargetQuests.Add('DA02');
  TargetQuests.Add('DA03');
  TargetQuests.Add('DA04');
  TargetQuests.Add('DA05');
  TargetQuests.Add('DA06');
  TargetQuests.Add('DA07');
  TargetQuests.Add('DA08');
  TargetQuests.Add('DA09');
  TargetQuests.Add('DA10');
  TargetQuests.Add('DA11');
  TargetQuests.Add('DA13');
  TargetQuests.Add('DA14');
  TargetQuests.Add('DA15');
  TargetQuests.Add('DA16');
  // DA12 (Hermaeus Mora - Discerning the Transmundane) e' coperto da DLC2.
end;

procedure AddBardsCollege;
begin
  TargetQuests.Add('BardsCollegeEnroll');
  TargetQuests.Add('FavorBardsTourQuest');
  TargetQuests.Add('MS05');
  TargetQuests.Add('MS05Verulus');
end;

procedure AddDLC1Dawnguard;
begin
  TargetQuests.Add('DLC1VQ01');
  TargetQuests.Add('DLC1VQ02');
  TargetQuests.Add('DLC1VQ03');
  TargetQuests.Add('DLC1VQ04');
  TargetQuests.Add('DLC1VQ05');
  TargetQuests.Add('DLC1VQ06');
  TargetQuests.Add('DLC1VQ07');
  TargetQuests.Add('DLC1VQ08');
  TargetQuests.Add('DLC1VQ09');
  TargetQuests.Add('DLC1RV01');
  TargetQuests.Add('DLC1RV02');
  TargetQuests.Add('DLC1RV03');
  TargetQuests.Add('DLC1RV04');
  TargetQuests.Add('DLC1HunterBaseIntro');
  TargetQuests.Add('DLC1VampireBaseIntro');
  TargetQuests.Add('DLC1RH04');
  TargetQuests.Add('DLC1LD');
  TargetQuests.Add('DLC1RandomAmbush'); // attacchi vampiri random
end;

procedure AddDLC2Dragonborn;
begin
  TargetQuests.Add('DLC2Init');         // attacco cultisti
  TargetQuests.Add('DLC2MQ01');
  TargetQuests.Add('DLC2MQ02');
  TargetQuests.Add('DLC2MQ03');
  TargetQuests.Add('DLC2MQ04');
  TargetQuests.Add('DLC2MQ05');
  TargetQuests.Add('DLC2MQ06');
  TargetQuests.Add('DLC2RR01');
  TargetQuests.Add('DLC2RR02');
  TargetQuests.Add('DLC2RRGuild');
  TargetQuests.Add('DLC2TT01');
  TargetQuests.Add('DLC2TT02');
  TargetQuests.Add('DLC2TT03');
end;

procedure AddMisc;
begin
  // Quest Misc narrative principali
  TargetQuests.Add('MS01'); // The Whispering Door
  TargetQuests.Add('MS02'); // Forbidden Legend
  TargetQuests.Add('MS03'); // The Black Star (Azura)
  TargetQuests.Add('MS04'); // Repentance
  TargetQuests.Add('MS06'); // The Wolf Queen Awakened
  TargetQuests.Add('MS07'); // Lights Out!
  TargetQuests.Add('MS08'); // The Heart of Dibella
  TargetQuests.Add('MS09'); // Promises to Keep
  TargetQuests.Add('MS10'); // The Mind of Madness
  TargetQuests.Add('MS11'); // The Man Who Cried Wolf
  TargetQuests.Add('MS12'); // Tending the Flames
  TargetQuests.Add('MS13'); // The Forsworn Conspiracy
  TargetQuests.Add('MS14'); // No One Escapes Cidhna Mine
  // Random encounter spawn umanoidi
  TargetQuests.Add('WICourier');
  TargetQuests.Add('WICourierBoss');
  TargetQuests.Add('WIChangeLocation01');
  TargetQuests.Add('WIChangeLocation02');
  TargetQuests.Add('WIChangeLocation03');
  TargetQuests.Add('WIChangeLocation04');
  TargetQuests.Add('WIChangeLocation05');
  TargetQuests.Add('WIChangeLocation06');
  TargetQuests.Add('WIChangeLocation07');
  TargetQuests.Add('WIChangeLocation08');
  TargetQuests.Add('WIChangeLocation09');
  TargetQuests.Add('WIChangeLocation10');
  TargetQuests.Add('WIChangeLocation11');
  TargetQuests.Add('WIChangeLocation12');
  // Sistema carrettieri
  TargetQuests.Add('WICarriageSystem');
  TargetQuests.Add('CarriageSystem');
end;

procedure RegisterTargetQuests;
begin
  AddMainQuest;
  AddDragonSystem;
  AddCivilWar;
  AddCompanions;
  AddMagesGuild;
  AddThievesGuild;
  AddDarkBrotherhood;
  AddDaedric;
  AddBardsCollege;
  AddDLC1Dawnguard;
  AddDLC2Dragonborn;
  AddMisc;
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
  DisabledCount    := 0;
  AlreadyClearCnt  := 0;
  SkippedCount     := 0;
  FailedCount      := 0;

  TargetQuests := TStringList.Create;
  TargetQuests.Sorted := True;
  TargetQuests.Duplicates := dupIgnore;
  TargetQuests.CaseSensitive := False;
  RegisterTargetQuests;

  AllowedMasters := TStringList.Create;
  AllowedMasters.Sorted := True;
  AllowedMasters.Duplicates := dupIgnore;
  AllowedMasters.CaseSensitive := False;
  RegisterAllowedMasters;

  TargetFile := FindTargetPlugin;
  if not Assigned(TargetFile) then begin
    AddMessage('=== RPServer_EmptyWorld DisableQuests ===');
    AddMessage('ERRORE: plugin "' + TargetPluginName + '" non trovato.');
    AddMessage('Genera prima il plugin con DisableNPCs.pas o crealo a mano.');
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

  AddMessage('=== RPServer_EmptyWorld DisableQuests ===');
  AddMessage('Target plugin   : ' + GetFileName(TargetFile));
  AddMessage('Quest in lista  : ' + IntToStr(TargetQuests.Count));
  AddMessage('---');
end;

function Process(e: IInterface): Integer;
var
  sourceFileName : string;
  edid           : string;
  questCopy      : IInterface;
  flagsElem      : IInterface;
  currentFlags   : Cardinal;
begin
  Result := 0;

  if Signature(e) <> 'QUST' then Exit;

  sourceFileName := GetFileName(GetFile(e));
  if SameText(sourceFileName, TargetPluginName) then Exit;
  if not IsAllowedMaster(sourceFileName) then Exit;

  edid := EditorID(e);
  if edid = '' then Exit;
  if TargetQuests.IndexOf(edid) < 0 then Exit;

  questCopy := wbCopyElementToFile(e, TargetFile, False, True);
  if not Assigned(questCopy) then begin
    AddMessage('FAIL copy quest: ' + edid);
    Inc(FailedCount);
    Exit;
  end;

  flagsElem := ElementByPath(questCopy, 'DNAM\Flags');
  if not Assigned(flagsElem) then
    flagsElem := ElementByPath(questCopy, 'DNAM - General\Flags');

  if not Assigned(flagsElem) then begin
    AddMessage('FAIL no DNAM\Flags on quest: ' + edid);
    Inc(FailedCount);
    Exit;
  end;

  currentFlags := GetNativeValue(flagsElem);
  if (currentFlags and StartGameEnabledBit) = 0 then begin
    Inc(AlreadyClearCnt);
    Exit;
  end;

  SetNativeValue(flagsElem, currentFlags and (not StartGameEnabledBit));
  Inc(DisabledCount);
  AddMessage('OK disabled SGE: ' + edid);
end;

function Finalize: Integer;
begin
  Result := 0;
  AddMessage('---');
  AddMessage('=== RPServer_EmptyWorld DisableQuests: FINE ===');
  AddMessage('Quest disabilitate     : ' + IntToStr(DisabledCount));
  AddMessage('Gia'' Start Game off    : ' + IntToStr(AlreadyClearCnt));
  AddMessage('Falliti                : ' + IntToStr(FailedCount));
  AddMessage('=> Salva ora ' + TargetPluginName + '.');

  if Assigned(TargetQuests)   then TargetQuests.Free;
  if Assigned(AllowedMasters) then AllowedMasters.Free;
end;

end.
