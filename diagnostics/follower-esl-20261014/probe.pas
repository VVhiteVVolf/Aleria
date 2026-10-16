unit userscript;
function Initialize: integer;
var i: integer; f: IInterface; lines: TStringList;
begin
  Result := 0;
  lines := TStringList.Create;
  try
    for i := 0 to Pred(FileCount) do begin
      f := FileByIndex(i);
      lines.Add(GetFileName(f) + '|' + IntToStr(RecordCount(f)));
    end;
    lines.SaveToFile('E:\Aleria\diagnostics\follower-esl-20261014\probe-result.txt');
    AddMessage('FOLLOWER_PROBE_SUCCESS');
  finally
    lines.Free;
  end;
end;
end.
