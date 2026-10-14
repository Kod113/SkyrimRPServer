{
  ExportIngredients.pas - script per xEdit.
  Esporta tutti gli ingredienti (record INGR) dei plugin selezionati in un file CSV
  (separatore ";"): ingredients_export.csv, scritto nella cartella "Edit Scripts" di xEdit.
  Colonne: plugin;formid_load_order;formid_locale;editor_id;nome;valore;peso;effetto1;effetto2;effetto3;effetto4
}
unit ExportIngredients;

var
  righe: TStringList;

function Initialize: integer;
begin
  righe := TStringList.Create;
  righe.Add('plugin;formid_load_order;formid_locale;editor_id;nome;valore;peso;effetto1;effetto2;effetto3;effetto4');
  Result := 0;
end;

function Process(e: IInterface): integer;
var
  effetti: IInterface;
  i: integer;
  riga: string;
begin
  Result := 0;
  // Solo i record di tipo INGR (ingredienti); gli altri si saltano.
  if Signature(e) <> 'INGR' then Exit;

  riga := GetFileName(GetFile(e))
    + ';' + IntToHex(GetLoadOrderFormID(e), 8)
    + ';' + IntToHex(GetLoadOrderFormID(e) and $00FFFFFF, 6)
    + ';' + EditorID(e)
    + ';' + GetElementEditValues(e, 'FULL')
    + ';' + GetElementEditValues(e, 'ENIT\Ingredient Value')
    + ';' + GetElementEditValues(e, 'DATA\Weight');

  // I 4 effetti, nell'ordine del gioco. Se ce ne sono meno di 4 le celle restano vuote.
  effetti := ElementByPath(e, 'Effects');
  for i := 0 to 3 do begin
    if i < ElementCount(effetti) then
      riga := riga + ';' + GetElementEditValues(ElementByIndex(effetti, i), 'EFID')
    else
      riga := riga + ';';
  end;

  righe.Add(riga);
end;

function Finalize: integer;
begin
  righe.SaveToFile(ProgramPath + 'Edit Scripts\ingredients_export.csv');
  AddMessage('Esportati ' + IntToStr(righe.Count - 1) + ' ingredienti in Edit Scripts\ingredients_export.csv');
  righe.Free;
  Result := 0;
end;

end.
