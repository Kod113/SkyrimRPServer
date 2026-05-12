Scriptname RPServer_EmptyWorldPlayerAlias extends ReferenceAlias
{
  Script attaccato a un ReferenceAlias che punta al PlayerRef
  nella quest RPServer_EmptyWorldInit.

  Scopo: re-invocare StopVanillaQuests() ogni volta che il
  giocatore carica una partita. Necessario per coprire save
  game in cui delle quest vanilla erano gia' avviate prima
  dell'installazione di RPServer_EmptyWorld.

  OnPlayerLoadGame() e' un evento speciale di ReferenceAlias
  che fira esclusivamente quando l'alias punta al PlayerRef
  e una save viene caricata.
}

Event OnPlayerLoadGame()
  Quest q = GetOwningQuest()
  If q != None
    RPServer_EmptyWorldInit ewq = q as RPServer_EmptyWorldInit
    If ewq != None
      ewq.StopVanillaQuests()
    EndIf
  EndIf
EndEvent
