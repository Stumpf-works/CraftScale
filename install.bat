@echo off
REM ###############################################################################
REM CraftScale by Stumpf.works
REM Installations-Script für Windows
REM ###############################################################################

echo.
echo ========================================================================
echo.
echo      %% CraftScale by Stumpf.works
echo      Installations-Script
echo.
echo ========================================================================
echo.

REM Node.js prüfen
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [FEHLER] Node.js ist nicht installiert!
    echo Bitte installieren Sie Node.js 16+ von https://nodejs.org
    pause
    exit /b 1
)

echo [OK] Node.js gefunden
node -v

where npm >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [FEHLER] npm ist nicht installiert!
    pause
    exit /b 1
)

echo [OK] npm gefunden
npm -v

REM Dependencies installieren
echo.
echo ========================================================================
echo Dependencies installieren
echo ========================================================================
echo.

echo [Info] Installiere Backend Dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [FEHLER] Backend Installation fehlgeschlagen!
    pause
    exit /b 1
)

echo [Info] Installiere Frontend Dependencies...
cd client
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [FEHLER] Frontend Installation fehlgeschlagen!
    pause
    exit /b 1
)
cd ..

echo [OK] Alle Dependencies installiert

REM .env erstellen
echo.
echo ========================================================================
echo Konfiguration
echo ========================================================================
echo.

if not exist .env (
    echo [Info] Erstelle .env Datei...
    copy .env.example .env
    echo [OK] .env Datei erstellt
    echo [WICHTIG] Bitte .env bearbeiten und SERVER_IP eintragen!
) else (
    echo [Warnung] .env existiert bereits
)

REM Verzeichnisse erstellen
echo.
echo ========================================================================
echo Verzeichnisse erstellen
echo ========================================================================
echo.

if not exist uploads mkdir uploads
if not exist data mkdir data
if not exist logs mkdir logs
if not exist backup mkdir backup

echo [OK] Verzeichnisse erstellt

REM Frontend bauen
echo.
echo ========================================================================
echo Frontend Build
echo ========================================================================
echo.

echo [Info] Baue React Frontend...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo [FEHLER] Frontend Build fehlgeschlagen!
    pause
    exit /b 1
)

echo [OK] Frontend erfolgreich gebaut

REM Backup-Script erstellen
echo.
echo ========================================================================
echo Backup-Script erstellen
echo ========================================================================
echo.

(
echo @echo off
echo REM CraftScale Backup Script
echo.
echo set BACKUP_DIR=backup
echo set DATE=%%date:~-4,4%%%%date:~-7,2%%%%date:~-10,2%%_%%time:~0,2%%%%time:~3,2%%%%time:~6,2%%
echo set DATE=%%DATE: =0%%
echo.
echo echo CraftScale Backup - %%DATE%%
echo.
echo copy data\craftscale.db %%BACKUP_DIR%%\craftscale-%%DATE%%.db
echo echo [OK] Datenbank gesichert
echo.
echo tar -czf %%BACKUP_DIR%%\uploads-%%DATE%%.tar.gz uploads
echo echo [OK] Fotos gesichert
echo.
echo echo Backup abgeschlossen: %%BACKUP_DIR%%
) > backup.bat

echo [OK] Backup-Script erstellt: backup.bat

REM Fertig
echo.
echo ========================================================================
echo Installation abgeschlossen!
echo ========================================================================
echo.

echo [OK] CraftScale ist bereit!
echo.
echo Naechste Schritte:
echo.
echo   1. .env pruefen und anpassen
echo.
echo   2. Server starten:
echo      npm start
echo.
echo   3. Browser oeffnen:
echo      http://localhost:3000
echo      ODER http://IHRE_IP:3000
echo.
echo   4. Arduino konfigurieren:
echo      - arduino/esp8266_scale.ino oeffnen
echo      - WiFi SSID + Passwort eintragen
echo      - SERVER_URL anpassen
echo      - Code hochladen
echo.
echo Dokumentation: README.md
echo Backup erstellen: backup.bat
echo.
echo Viel Erfolg mit CraftScale!
echo.

pause
