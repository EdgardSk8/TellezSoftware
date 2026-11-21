@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion
title TellezSoftware - Sitio web
cd /d "%~dp0"

set "PORT=8789"

echo ============================================================
echo   TellezSoftware - Servidor del sitio web
echo ============================================================
echo.
echo   Sitio estatico (carpeta site\), no necesita compilacion.
echo.
echo   1) En vivo          recarga automatica al guardar (recomendado)
echo                       http://localhost:%PORT%
echo   2) Igual que prod   wrangler, mismo runtime de Cloudflare, sin recarga
echo                       http://localhost:%PORT%
echo   0) Salir
echo.

if not exist "site\index.html" (
  echo No se encontro la carpeta site\. Ejecuta este archivo desde la raiz del repositorio.
  pause
  exit /b 1
)

where node >nul 2>&1
if errorlevel 1 (
  echo No se encontro Node.js en el PATH. Instalalo desde https://nodejs.org
  pause
  exit /b 1
)

set /p "OPCION=Selecciona una opcion [1/2]: "

rem Tolera espacios accidentales al escribir la opcion.
set "OPCION=%OPCION: =%"

if "%OPCION%"=="1" goto PREPARAR
if "%OPCION%"=="2" goto PREPARAR
if "%OPCION%"=="0" exit /b 0
echo.
echo Opcion no valida. Vuelve a ejecutar el archivo.
pause
exit /b 1

:PREPARAR
rem Un solo servidor a la vez: si el puerto esta ocupado, el servidor no arranca.
set "PID_EN_USO="
for /f "tokens=5" %%p in ('netstat -ano ^| findstr /r /c:":%PORT% .*LISTENING"') do set "PID_EN_USO=%%p"
if defined PID_EN_USO (
  echo.
  echo El puerto %PORT% ya esta en uso por el proceso !PID_EN_USO!.
  echo Puede ser otra ventana del servidor que quedo abierta.
  set "RESPUESTA="
  set /p "RESPUESTA=Cerrar ese proceso y continuar? [S/N]: "
  set "RESPUESTA=!RESPUESTA: =!"
  if /i not "!RESPUESTA!"=="S" (
    echo.
    echo Cierra la otra ventana del servidor y vuelve a intentar.
    pause
    exit /b 1
  )
  powershell -NoProfile -Command "Stop-Process -Id !PID_EN_USO! -Force" >nul 2>&1
  timeout /t 2 /nobreak >nul
)

rem Restos de una ejecucion anterior: la cache temporal se regenera sola.
if exist ".wrangler\tmp" rmdir /s /q ".wrangler\tmp" >nul 2>&1

if "%OPCION%"=="1" goto ENVIVO
goto PRODUCCION

:ENVIVO
set "LANIP="
for /f "usebackq delims=" %%i in (`powershell -NoProfile -Command "@((Get-NetIPConfiguration).Where({ $_.IPv4DefaultGateway -ne $null -and $_.NetAdapter.Status -eq 'Up' }).IPv4Address.IPAddress)[0]"`) do set "LANIP=%%i"
if not defined LANIP set "LANIP=IP-NO-DETECTADA"
echo.
echo Iniciando servidor EN VIVO (recarga automatica)...
echo   Este equipo: http://localhost:%PORT%
echo   Red Wi-Fi:   http://%LANIP%:%PORT%
echo.
echo Cada vez que guardes un archivo, el navegador se actualiza solo:
echo los cambios de CSS se aplican sin recargar y el HTML se recarga.
echo Si Windows pregunta por el Firewall, permite redes privadas.
echo.
echo La primera vez descarga browser-sync con npx y puede tardar un poco.
echo.
call npx --yes browser-sync@3 start --server site --files "site/**/*" --port %PORT% --no-notify --no-open --no-ui
goto FIN

:PRODUCCION
echo.
echo Iniciando servidor igual que produccion (wrangler)...
echo   URL: http://localhost:%PORT%
echo.
echo La primera vez descarga wrangler con npx y puede tardar un poco.
echo.
call npx --yes wrangler pages dev --port %PORT%
goto FIN

:FIN
echo.
echo El servidor se detuvo.
echo Si fue por un error, vuelve a ejecutar este archivo:
echo limpia la cache temporal de wrangler antes de iniciar.
pause
