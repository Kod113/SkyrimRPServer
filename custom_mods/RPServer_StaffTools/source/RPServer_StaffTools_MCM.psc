; =====================================================================
; RPServer_StaffTools_MCM
; Script MCM per gli strumenti staff del server RP
;
; Dipendenze: SkyUI (SKI_ConfigBase), ConsoleUtilSSE NG
; Profilo:    Staff only
; Versione:   1.0.0
; =====================================================================
Scriptname RPServer_StaffTools_MCM extends SKI_ConfigBase

; =====================================================================
; HANDLE OPZIONI (assegnati in OnPageReset, usati negli Event)
; =====================================================================

; --- Mobilità ---
Int _optNoClipToggle
Int _optNoClipSpeed

; --- Teletrasporto ---
Int _optTeleportToRef
Int _optTeleportPullRef   ; [WIP]

; --- Spawn ---
Int _optSpawnWeapon
Int _optSpawnBook
Int _optSpawnItem
Int _optSpawnCreature
Int _optDespawnRef

; --- Chat RP ---
Int _optMeText
Int _optMeSend
Int _optDoText
Int _optDoSend
Int _optStatusText
Int _optStatusSend
Int _optBroadcastText
Int _optBroadcastSend   ; [WIP]

; =====================================================================
; STATO
; =====================================================================
Bool   Property bNoClipActive   = false Auto
Float  Property fNoClipSpeed    = 400.0 Auto
Float  _fOriginalSpeed          = 100.0

String Property sMeText         = "" Auto
String Property sDoText         = "" Auto
String Property sStatusText     = "" Auto
String Property sBroadcastText  = "" Auto

; =====================================================================
; LISTE SPAWN
; =====================================================================

; -- Armi --
String[] _weaponIDs
String[] _weaponNames
Int      _weaponIndex = 0

; -- Libri --
String[] _bookIDs
String[] _bookNames
Int      _bookIndex = 0

; -- Oggetti --
String[] _itemIDs
String[] _itemNames
Int      _itemIndex = 0

; -- Creature --
String[] _creatureIDs
String[] _creatureNames
Int      _creatureIndex = 0

; =====================================================================
; INIT
; =====================================================================
Event OnConfigInit()
    ModName = "RPServer Staff Tools"

    Pages    = new String[5]
    Pages[0] = "Mobilità"
    Pages[1] = "Teletrasporto"
    Pages[2] = "Spawn"
    Pages[3] = "Chat RP"
    Pages[4] = "Ispezione [WIP]"

    _InitSpawnLists()
EndEvent

Function _InitSpawnLists()

    ; ---- ARMI (FormID da Skyrim.esm, senza i due zeri iniziali) ----
    _weaponIDs   = new String[10]
    _weaponNames = new String[10]
    _weaponIDs[0]   = "139B9" ; Iron Sword
    _weaponNames[0] = "Iron Sword"
    _weaponIDs[1]   = "13987" ; Steel Sword
    _weaponNames[1] = "Steel Sword"
    _weaponIDs[2]   = "1399E" ; Orcish Sword
    _weaponNames[2] = "Orcish Sword"
    _weaponIDs[3]   = "139A3" ; Dwarven Sword
    _weaponNames[3] = "Dwarven Sword"
    _weaponIDs[4]   = "139B4" ; Elven Sword
    _weaponNames[4] = "Elven Sword"
    _weaponIDs[5]   = "139C0" ; Glass Sword
    _weaponNames[5] = "Glass Sword"
    _weaponIDs[6]   = "139BE" ; Ebony Sword
    _weaponNames[6] = "Ebony Sword"
    _weaponIDs[7]   = "139A9" ; Daedric Sword
    _weaponNames[7] = "Daedric Sword"
    _weaponIDs[8]   = "13980" ; Iron Dagger
    _weaponNames[8] = "Iron Dagger"
    _weaponIDs[9]   = "1397E" ; Iron Battleaxe
    _weaponNames[9] = "Iron Battleaxe"

    ; ---- LIBRI (placeholder — espandere con lore custom server) ----
    _bookIDs   = new String[6]
    _bookNames = new String[6]
    _bookIDs[0]   = "1AFD9" ; Skill Book — Archery
    _bookNames[0] = "[Abilità] Arceria"
    _bookIDs[1]   = "1B01E" ; Skill Book — Smithing
    _bookNames[1] = "[Abilità] Forgiatura"
    _bookIDs[2]   = "1B01F" ; Skill Book — Speech
    _bookNames[2] = "[Abilità] Eloquenza"
    _bookIDs[3]   = "1B004" ; Skill Book — Sneak
    _bookNames[3] = "[Abilità] Furtività"
    _bookIDs[4]   = "1AFDF" ; Skill Book — Destruction
    _bookNames[4] = "[Abilità] Distruzione"
    _bookIDs[5]   = "1B011" ; Skill Book — Alchemy
    _bookNames[5] = "[Abilità] Alchimia"

    ; ---- OGGETTI GENERICI ----
    _itemIDs   = new String[8]
    _itemNames = new String[8]
    _itemIDs[0]   = "F"      ; Gold (x100)
    _itemNames[0] = "Oro (x100)"
    _itemIDs[1]   = "23D55"  ; Lockpick
    _itemNames[1] = "Grimaldello"
    _itemIDs[2]   = "3AD57"  ; Minor Health Potion
    _itemNames[2] = "Pozione Salute (Minore)"
    _itemIDs[3]   = "3EADE"  ; Health Potion
    _itemNames[3] = "Pozione Salute"
    _itemIDs[4]   = "3AC4B"  ; Stamina Potion
    _itemNames[4] = "Pozione Vigore"
    _itemIDs[5]   = "73F30"  ; Grand Soul Gem (empty)
    _itemNames[5] = "Gemma Anima Grande (vuota)"
    _itemIDs[6]   = "A44D8"  ; Torch
    _itemNames[6] = "Torcia"
    _itemIDs[7]   = "1997"   ; Rope (CC / decoration)
    _itemNames[7] = "Corda"

    ; ---- CREATURE ----
    _creatureIDs   = new String[8]
    _creatureNames = new String[8]
    _creatureIDs[0]   = "D6DF1"  ; Wolf
    _creatureNames[0] = "Lupo"
    _creatureIDs[1]   = "F811E"  ; Brown Bear
    _creatureNames[1] = "Orso"
    _creatureIDs[2]   = "2E2A6"  ; Sabrecat
    _creatureNames[2] = "Sabrecat"
    _creatureIDs[3]   = "23AB3"  ; Mammoth
    _creatureNames[3] = "Mammut"
    _creatureIDs[4]   = "4E792"  ; Frostbite Spider (small)
    _creatureNames[4] = "Ragno del Gelo (piccolo)"
    _creatureIDs[5]   = "109C7B" ; Hagraven
    _creatureNames[5] = "Hagraven"
    _creatureIDs[6]   = "23ABD"  ; Giant
    _creatureNames[6] = "Gigante"
    _creatureIDs[7]   = "4E4F0"  ; Slaughterfish
    _creatureNames[7] = "Slaughterfish"

EndFunction

; =====================================================================
; DRAW PAGES
; =====================================================================
Event OnPageReset(String a_page)
    If a_page == "Mobilità"
        _DrawMobilityPage()
    ElseIf a_page == "Teletrasporto"
        _DrawTeleportPage()
    ElseIf a_page == "Spawn"
        _DrawSpawnPage()
    ElseIf a_page == "Chat RP"
        _DrawChatPage()
    ElseIf a_page == "Ispezione [WIP]"
        _DrawInspectPage()
    EndIf
EndEvent

; ----- Mobilità -----
Function _DrawMobilityPage()
    SetCursorFillMode(TOP_TO_BOTTOM)

    AddHeaderOption("No Clip")
    _optNoClipToggle = AddToggleOption("Attiva No Clip", bNoClipActive)
    _optNoClipSpeed  = AddSliderOption("Velocità (SpeedMult %)", fNoClipSpeed, "{0}%")
EndFunction

; ----- Teletrasporto -----
Function _DrawTeleportPage()
    SetCursorFillMode(TOP_TO_BOTTOM)

    AddHeaderOption("Teletrasporto (console targeting)")
    AddTextOption("", "1. Apri console  2. Clicca target  3. Chiudi console", OPTION_FLAG_DISABLED)
    AddEmptyOption()
    _optTeleportToRef  = AddTextOption("Vai dal player selezionato", ">")
    AddEmptyOption()
    _optTeleportPullRef = AddTextOption("[WIP] Porta player da te", "–", OPTION_FLAG_DISABLED)
EndFunction

; ----- Spawn -----
Function _DrawSpawnPage()
    SetCursorFillMode(TOP_TO_BOTTOM)

    AddHeaderOption("Armi  (spawn in inventario)")
    _optSpawnWeapon = AddMenuOption("Arma", _weaponNames[_weaponIndex])

    AddEmptyOption()
    AddHeaderOption("Libri  (spawn in inventario)")
    _optSpawnBook = AddMenuOption("Libro", _bookNames[_bookIndex])

    AddEmptyOption()
    AddHeaderOption("Oggetti  (spawn in inventario)")
    _optSpawnItem = AddMenuOption("Oggetto", _itemNames[_itemIndex])

    AddEmptyOption()
    AddHeaderOption("Creature  (placeatme)")
    _optSpawnCreature = AddMenuOption("Creatura", _creatureNames[_creatureIndex])

    AddEmptyOption()
    AddHeaderOption("Despawn  (disable ref selezionata)")
    AddTextOption("", "1. Apri console  2. Clicca ref  3. Chiudi console", OPTION_FLAG_DISABLED)
    _optDespawnRef = AddTextOption("Disabilita ref selezionata", ">")
EndFunction

; ----- Chat RP -----
Function _DrawChatPage()
    SetCursorFillMode(TOP_TO_BOTTOM)

    AddHeaderOption("/me — azione del personaggio")
    _optMeText = AddInputOption("Testo", sMeText)
    _optMeSend = AddTextOption("Invia /me", ">")

    AddEmptyOption()
    AddHeaderOption("/do — descrizione della scena")
    _optDoText = AddInputOption("Testo", sDoText)
    _optDoSend = AddTextOption("Invia /do", ">")

    AddEmptyOption()
    AddHeaderOption("/status — stato visibile personaggio")
    _optStatusText = AddInputOption("Testo", sStatusText)
    _optStatusSend = AddTextOption("Invia /status", ">")

    AddEmptyOption()
    AddHeaderOption("/broadcast — [WIP] messaggio globale")
    _optBroadcastText = AddInputOption("Testo", sBroadcastText, OPTION_FLAG_DISABLED)
    _optBroadcastSend = AddTextOption("Invia broadcast", "–", OPTION_FLAG_DISABLED)
EndFunction

; ----- Ispezione -----
Function _DrawInspectPage()
    SetCursorFillMode(TOP_TO_BOTTOM)

    AddHeaderOption("Ispezione Player  [In sviluppo]")
    AddTextOption("Inventario player", "[WIP] richiede STR API", OPTION_FLAG_DISABLED)
    AddTextOption("Statistiche player", "[WIP] richiede STR API", OPTION_FLAG_DISABLED)
    AddTextOption("Statistiche default visibili a staff", "[WIP]", OPTION_FLAG_DISABLED)
    AddEmptyOption()
    AddTextOption("Audio globale / evento server", "[WIP]", OPTION_FLAG_DISABLED)
EndFunction

; =====================================================================
; EVENTS — SELECT
; =====================================================================
Event OnOptionSelect(Int a_option)

    ; ---- No Clip toggle ----
    If a_option == _optNoClipToggle
        If !bNoClipActive
            _fOriginalSpeed = Game.GetPlayer().GetBaseActorValue("SpeedMult")
            ConsoleUtil.ExecuteCommand("tcl")
            ConsoleUtil.ExecuteCommand("player.setav speedmult " + (fNoClipSpeed as Int))
            bNoClipActive = true
        Else
            ConsoleUtil.ExecuteCommand("tcl")
            ConsoleUtil.ExecuteCommand("player.setav speedmult " + (_fOriginalSpeed as Int))
            bNoClipActive = false
        EndIf
        SetToggleOptionValue(a_option, bNoClipActive)

    ; ---- Teletrasporto verso ref ----
    ElseIf a_option == _optTeleportToRef
        Form kForm = ConsoleUtil.GetSelectedReference()
        If kForm
            ObjectReference kRef = kForm as ObjectReference
            If kRef
                Game.GetPlayer().MoveTo(kRef)
            Else
                Debug.MessageBox("[Staff Tools] La ref selezionata non è un ObjectReference valido.")
            EndIf
        Else
            Debug.MessageBox("[Staff Tools] Nessuna ref selezionata.\nApri la console, clicca sul target, poi chiudi la console e ripremi.")
        EndIf

    ; ---- Spawn arma ----
    ElseIf a_option == _optSpawnWeapon
        ConsoleUtil.ExecuteCommand("player.additem " + _weaponIDs[_weaponIndex] + " 1")

    ; ---- Spawn libro ----
    ElseIf a_option == _optSpawnBook
        ConsoleUtil.ExecuteCommand("player.additem " + _bookIDs[_bookIndex] + " 1")

    ; ---- Spawn oggetto ----
    ElseIf a_option == _optSpawnItem
        Int iCount = 1
        If _itemIndex == 0
            iCount = 100   ; Oro: 100 unità
        EndIf
        ConsoleUtil.ExecuteCommand("player.additem " + _itemIDs[_itemIndex] + " " + iCount)

    ; ---- Spawn creatura ----
    ElseIf a_option == _optSpawnCreature
        ConsoleUtil.ExecuteCommand("placeatme " + _creatureIDs[_creatureIndex] + " 1")

    ; ---- Despawn ref ----
    ElseIf a_option == _optDespawnRef
        Form kForm = ConsoleUtil.GetSelectedReference()
        If kForm
            ObjectReference kRef = kForm as ObjectReference
            If kRef
                String sName = kRef.GetDisplayName()
                kRef.Disable()
                Debug.MessageBox("[Staff Tools] Disabilitato: " + sName)
            Else
                Debug.MessageBox("[Staff Tools] Ref non valida.")
            EndIf
        Else
            Debug.MessageBox("[Staff Tools] Nessuna ref selezionata.")
        EndIf

    ; ---- Chat: invia /me ----
    ElseIf a_option == _optMeSend
        If sMeText != ""
            String sName = Game.GetPlayer().GetDisplayName()
            Debug.Notification("* " + sName + " " + sMeText)
        Else
            Debug.MessageBox("[Staff Tools] Testo /me vuoto.")
        EndIf

    ; ---- Chat: invia /do ----
    ElseIf a_option == _optDoSend
        If sDoText != ""
            Debug.Notification("[DO] " + sDoText)
        Else
            Debug.MessageBox("[Staff Tools] Testo /do vuoto.")
        EndIf

    ; ---- Chat: invia /status ----
    ElseIf a_option == _optStatusSend
        If sStatusText != ""
            String sName = Game.GetPlayer().GetDisplayName()
            Debug.Notification("[" + sName + "] " + sStatusText)
        Else
            Debug.MessageBox("[Staff Tools] Testo /status vuoto.")
        EndIf

    EndIf
EndEvent

; =====================================================================
; EVENTS — SLIDER
; =====================================================================
Event OnOptionSliderOpen(Int a_option)
    If a_option == _optNoClipSpeed
        SetSliderDialogStartValue(fNoClipSpeed)
        SetSliderDialogDefaultValue(400.0)
        SetSliderDialogRange(100.0, 2000.0)
        SetSliderDialogInterval(50.0)
    EndIf
EndEvent

Event OnOptionSliderAccept(Int a_option, Float a_value)
    If a_option == _optNoClipSpeed
        fNoClipSpeed = a_value
        SetSliderOptionValue(a_option, fNoClipSpeed, "{0}%")
        If bNoClipActive
            ConsoleUtil.ExecuteCommand("player.setav speedmult " + (fNoClipSpeed as Int))
        EndIf
    EndIf
EndEvent

; =====================================================================
; EVENTS — MENU (selezione lista spawn)
; =====================================================================
Event OnOptionMenuOpen(Int a_option)
    If a_option == _optSpawnWeapon
        SetMenuDialogOptions(_weaponNames)
        SetMenuDialogStartIndex(_weaponIndex)
        SetMenuDialogDefaultIndex(0)
    ElseIf a_option == _optSpawnBook
        SetMenuDialogOptions(_bookNames)
        SetMenuDialogStartIndex(_bookIndex)
        SetMenuDialogDefaultIndex(0)
    ElseIf a_option == _optSpawnItem
        SetMenuDialogOptions(_itemNames)
        SetMenuDialogStartIndex(_itemIndex)
        SetMenuDialogDefaultIndex(0)
    ElseIf a_option == _optSpawnCreature
        SetMenuDialogOptions(_creatureNames)
        SetMenuDialogStartIndex(_creatureIndex)
        SetMenuDialogDefaultIndex(0)
    EndIf
EndEvent

Event OnOptionMenuAccept(Int a_option, Int a_index)
    If a_option == _optSpawnWeapon
        _weaponIndex = a_index
        SetMenuOptionValue(a_option, _weaponNames[_weaponIndex])
    ElseIf a_option == _optSpawnBook
        _bookIndex = a_index
        SetMenuOptionValue(a_option, _bookNames[_bookIndex])
    ElseIf a_option == _optSpawnItem
        _itemIndex = a_index
        SetMenuOptionValue(a_option, _itemNames[_itemIndex])
    ElseIf a_option == _optSpawnCreature
        _creatureIndex = a_index
        SetMenuOptionValue(a_option, _creatureNames[_creatureIndex])
    EndIf
EndEvent

; =====================================================================
; EVENTS — INPUT (testi chat)
; =====================================================================
Event OnOptionInputOpen(Int a_option)
    If a_option == _optMeText
        SetInputDialogStartText(sMeText)
    ElseIf a_option == _optDoText
        SetInputDialogStartText(sDoText)
    ElseIf a_option == _optStatusText
        SetInputDialogStartText(sStatusText)
    ElseIf a_option == _optBroadcastText
        SetInputDialogStartText(sBroadcastText)
    EndIf
EndEvent

Event OnOptionInputAccept(Int a_option, String a_input)
    If a_option == _optMeText
        sMeText = a_input
        SetInputOptionValue(a_option, sMeText)
    ElseIf a_option == _optDoText
        sDoText = a_input
        SetInputOptionValue(a_option, sDoText)
    ElseIf a_option == _optStatusText
        sStatusText = a_input
        SetInputOptionValue(a_option, sStatusText)
    ElseIf a_option == _optBroadcastText
        sBroadcastText = a_input
        SetInputOptionValue(a_option, sBroadcastText)
    EndIf
EndEvent
