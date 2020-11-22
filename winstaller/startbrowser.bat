@echo off

setlocal enableExtensions EnableDelayedExpansion
set "currentDir=%cd%"
echo.
START /W REGEDIT /E "%Temp%\BROW3.reg" HKEY_LOCAL_MACHINE\SOFTWARE\Wow6432Node\Clients\StartMenuInternet
if not exist "%Temp%\BROW3.reg" START /W REGEDIT /E "%Temp%\BROW3.reg" HKEY_LOCAL_MACHINE\SOFTWARE\Clients\StartMenuInternet

set "browsers="
for /f "delims=" %%i in ('type "%Temp%\BROW3.reg" ^| findstr /E "DefaultIcon]"') do set browsers=!browsers! %%i

echo %browsers% | find /I "chrome" >nul
IF errorlevel 1 (
	echo %browsers% | find /I "firefox" >nul
	IF errorlevel 1 (
		(start iexplore "%currentDir%\startup_page\index.html")		
	) ELSE (
		(start firefox "%currentDir%\startup_page\index.html")		
	)
) ELSE (
    (start chrome -app="%currentDir%\startup_page\index.html")
)

EndLocal

del /Q /F "%Temp%\BROW3.reg"

exit