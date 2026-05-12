Scriptname RPServer_EmptyWorldInit extends Quest
{
  Quest di fallback runtime per RPServer_EmptyWorld.

  Comportamento:
    - La quest e' Start Game Enabled in CK.
    - OnInit() viene chiamato una sola volta quando la quest si
      avvia per la prima volta su una partita.
    - StopVanillaQuests() itera il FormList QuestsToStop e chiama
      Stop() su ogni quest ancora running.

  Per coprire i casi in cui il giocatore carica un save vecchio
  in cui alcune quest vanilla erano gia' partite, e' presente
  uno script separato (RPServer_EmptyWorldPlayerAlias) attaccato
  a un ReferenceAlias sul PlayerRef che invoca lo stesso metodo
  su OnPlayerLoadGame().

  Dipendenze runtime: nessuna. PapyrusUtil non e' richiesta dal
  fallback (lo usiamo solo dal debug logging opzionale).
}

;================================================================
;  Properties (configurabili in CK)
;================================================================

FormList Property QuestsToStop Auto
{FormList contenente i puntatori alle quest vanilla da fermare.
 Va popolata in CK con gli stessi EditorID elencati nel
 Pascal script DisableQuests.pas.}

GlobalVariable Property RPServer_EWInit_Done Auto
{Globale di stato: viene impostata a 1.0 dopo la prima esecuzione
 completa. Usata da altre mod custom future per sapere se
 EmptyWorld ha inizializzato il mondo.}

Bool Property VerboseLogging = True Auto
{Se True, stampa diagnostici in Papyrus log e Notification HUD.}

;================================================================
;  Lifecycle
;================================================================

Event OnInit()
  If VerboseLogging
    Debug.Trace("[RPServer_EmptyWorld] OnInit chiamato")
  EndIf
  StopVanillaQuests()
EndEvent

;================================================================
;  Core
;================================================================

Function StopVanillaQuests()
  If QuestsToStop == None
    Debug.Trace("[RPServer_EmptyWorld] ERRORE: QuestsToStop FormList non assegnato")
    Return
  EndIf

  Int total        = QuestsToStop.GetSize()
  Int stoppedCount = 0
  Int nilCount     = 0
  Int i            = 0

  While i < total
    Form f = QuestsToStop.GetAt(i)
    If f == None
      nilCount += 1
    Else
      Quest q = f as Quest
      If q != None
        If q.IsRunning() || q.IsStarting()
          q.Stop()
          stoppedCount += 1
          If VerboseLogging
            Debug.Trace("[RPServer_EmptyWorld] Stop(): " + q)
          EndIf
        EndIf
      EndIf
    EndIf
    i += 1
  EndWhile

  Debug.Trace("[RPServer_EmptyWorld] StopVanillaQuests fine: " + \
              stoppedCount + " fermate, " + nilCount + " nil, su " + total)

  If stoppedCount > 0 && VerboseLogging
    Debug.Notification("RPServer: fermate " + stoppedCount + " quest vanilla")
  EndIf

  If RPServer_EWInit_Done != None
    RPServer_EWInit_Done.SetValue(1.0)
  EndIf
EndFunction
